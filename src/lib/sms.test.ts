import { afterEach, describe, expect, it, vi } from "vitest";
import { composeSmsMessage, formatPhoneForDisplay, normalizePhoneNumber, sendSms } from "@/lib/sms";

describe("normalizePhoneNumber", () => {
  it.each([
    ["0712345678", "+254712345678"],
    ["0712 345 678", "+254712345678"],
    ["0112345678", "+254112345678"],
    ["712345678", "+254712345678"],
    ["254712345678", "+254712345678"],
    ["+254 712-345-678", "+254712345678"],
    ["+14155552671", "+14155552671"],
  ])("accepts %s", (input, expected) => {
    expect(normalizePhoneNumber(input)).toBe(expected);
  });

  it.each(["", "abc", "12345", "0812345678", "+2547123", "07123456789", "+0123456789"])("rejects %s", (input) => {
    expect(normalizePhoneNumber(input)).toBeNull();
  });

  it("handles missing values", () => {
    expect(normalizePhoneNumber(null)).toBeNull();
    expect(normalizePhoneNumber(undefined)).toBeNull();
  });
});

describe("formatPhoneForDisplay", () => {
  it("shows Kenyan numbers in local format", () => {
    expect(formatPhoneForDisplay("+254712345678")).toBe("0712 345 678");
    expect(formatPhoneForDisplay("+14155552671")).toBe("+14155552671");
    expect(formatPhoneForDisplay("")).toBe("");
  });
});

describe("composeSmsMessage", () => {
  it("builds a short message with a link", () => {
    const text = composeSmsMessage({ title: "Invoice ready", description: "Invoice INV-1 is due.", link: "https://portal.test/client/invoices" });
    expect(text).toBe("IFTA: Invoice ready. Invoice INV-1 is due.\nhttps://portal.test/client/invoices");
  });

  it("never exceeds two SMS segments and keeps the link", () => {
    const text = composeSmsMessage({ title: "Update", description: "word ".repeat(200), link: "https://portal.test/x" });
    expect(text.length).toBeLessThanOrEqual(306);
    expect(text.endsWith("https://portal.test/x")).toBe(true);
  });
});

describe("sendSms", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("skips quietly when SMS is not configured", async () => {
    vi.stubEnv("AT_USERNAME", "");
    vi.stubEnv("AT_API_KEY", "");
    expect(await sendSms({ to: "0712345678", message: "hi" })).toEqual({ delivered: false, reason: "not_configured" });
  });

  it("rejects invalid numbers before calling the gateway", async () => {
    vi.stubEnv("AT_USERNAME", "sandbox");
    vi.stubEnv("AT_API_KEY", "key");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect(await sendSms({ to: "nope", message: "hi" })).toEqual({ delivered: false, reason: "invalid_number" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends a normalised number to the gateway and reports success", async () => {
    vi.stubEnv("AT_USERNAME", "sandbox");
    vi.stubEnv("AT_API_KEY", "key");
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ SMSMessageData: { Recipients: [{ statusCode: 101 }] } }), { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    expect(await sendSms({ to: "0712345678", message: "hello" })).toEqual({ delivered: true });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toContain("sandbox.africastalking.com");
    expect(String(init.body)).toContain("to=%2B254712345678");
  });

  it("reports rejection and network failures without throwing", async () => {
    vi.stubEnv("AT_USERNAME", "ifta");
    vi.stubEnv("AT_API_KEY", "key");
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ SMSMessageData: { Recipients: [{ statusCode: 403 }] } }), { status: 201 })));
    expect(await sendSms({ to: "0712345678", message: "x" })).toEqual({ delivered: false, reason: "rejected" });
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("offline"); }));
    expect(await sendSms({ to: "0712345678", message: "x" })).toEqual({ delivered: false, reason: "network_error" });
  });
});
