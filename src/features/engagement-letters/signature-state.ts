import type { EngagementLetterRecord } from "@/repositories/engagement-letter-repository";

export type SignatureDisplayEntry = {
  role: "ifta" | "client";
  label: string;
  displayName: string;
  title: string;
  signed: boolean;
  signedAt: string | null;
  signatureHash: string | null;
  signatureText: string | null;
};

export function getSignatureDisplayState(letter: EngagementLetterRecord): SignatureDisplayEntry[] {
  return letter.signers.map((signer) => ({
    role: signer.role,
    label: signer.role === "ifta" ? "For IFTA Consulting" : "For the client",
    displayName: signer.signatureText || signer.name,
    title: signer.title,
    signed: signer.status === "signed",
    signedAt: signer.signedAt,
    signatureHash: signer.signatureHash,
    signatureText: signer.signatureText,
  }));
}
