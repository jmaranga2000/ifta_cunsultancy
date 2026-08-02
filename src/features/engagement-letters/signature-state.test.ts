import { describe, expect, it } from "vitest";
import type { EngagementLetterRecord } from "@/repositories/engagement-letter-repository";
import { getSignatureDisplayState } from "./signature-state";

describe("getSignatureDisplayState", () => {
  it("returns both signers as signed once both parties have signed", () => {
    const letter = {
      signers: [
        {
          role: "ifta" as const,
          name: "Jane Smith",
          title: "Managing Partner",
          status: "signed" as const,
          signatureText: "Jane Smith",
          signedAt: "2025-01-10T10:00:00.000Z",
          signatureHash: "abc123",
        },
        {
          role: "client" as const,
          name: "John Doe",
          title: "Director",
          status: "signed" as const,
          signatureText: "John Doe",
          signedAt: "2025-01-10T10:30:00.000Z",
          signatureHash: "def456",
        },
      ],
    } as EngagementLetterRecord;

    const state = getSignatureDisplayState(letter);

    expect(state).toHaveLength(2);
    expect(state.filter((entry) => entry.signed)).toHaveLength(2);
    expect(state.find((entry) => entry.role === "ifta")?.displayName).toBe("Jane Smith");
    expect(state.find((entry) => entry.role === "client")?.displayName).toBe("John Doe");
  });

  it("keeps unsigned signers marked as pending", () => {
    const letter = {
      signers: [
        {
          role: "ifta" as const,
          name: "Jane Smith",
          title: "Managing Partner",
          status: "pending" as const,
          signatureText: null,
          signedAt: null,
          signatureHash: null,
        },
        {
          role: "client" as const,
          name: "John Doe",
          title: "Director",
          status: "signed" as const,
          signatureText: "John Doe",
          signedAt: "2025-01-10T10:30:00.000Z",
          signatureHash: "def456",
        },
      ],
    } as EngagementLetterRecord;

    const state = getSignatureDisplayState(letter);

    expect(state.find((entry) => entry.role === "ifta")?.signed).toBe(false);
    expect(state.find((entry) => entry.role === "client")?.signed).toBe(true);
  });
});
