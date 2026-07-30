import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTransport } from "nodemailer";
import { sendPortalEmail } from "@/lib/email/smtp";

vi.mock("@/lib/env", () => ({
  getServerEnv: () => ({
    GMAIL_SMTP_USER: "host@ifta.example",
    GMAIL_SMTP_APP_PASSWORD: "app-password",
  }),
}));

vi.mock("nodemailer", () => ({
  createTransport: vi.fn(),
}));

describe("sendPortalEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("keeps the customer address in both the message and SMTP envelope", async () => {
    const sendMail = vi.fn().mockResolvedValue({
      accepted: ["customer@example.com"],
      messageId: "message-1",
    });
    vi.mocked(createTransport).mockReturnValue({ sendMail } as never);

    const result = await sendPortalEmail({
      recipientEmail: "customer@example.com",
      subject: "Message received",
      html: "<p>Thank you</p>",
    });

    expect(result).toMatchObject({ delivered: true, recipient: "customer@example.com" });
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({
      to: "customer@example.com",
      envelope: { from: "host@ifta.example", to: ["customer@example.com"] },
    }));
  });

  it("does not send a customer notice to the configured host mailbox", async () => {
    const result = await sendPortalEmail({
      recipientEmail: "host@ifta.example",
      subject: "Message received",
      html: "<p>Thank you</p>",
    });

    expect(result).toMatchObject({
      delivered: false,
      recipient: "host@ifta.example",
      reason: "The client email matches the sender account.",
    });
    expect(createTransport).not.toHaveBeenCalled();
  });
});