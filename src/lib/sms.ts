/**
 * SMS delivery for IFTA notifications using the Africa's Talking messaging API
 * (the standard SMS gateway for Kenyan numbers).
 *
 * Configure with:
 *   AT_USERNAME     - Africa's Talking username ("sandbox" for testing)
 *   AT_API_KEY      - Africa's Talking API key
 *   AT_SENDER_ID    - optional approved sender ID / shortcode
 *
 * When these are not set, sending is skipped quietly so the portal keeps
 * working without SMS.
 */

const SUCCESS_STATUS_CODES = new Set([100, 101, 102]);
const SMS_TIMEOUT_MS = 8000;
const MAX_SMS_LENGTH = 306; // two concatenated 153-character segments

/**
 * Convert a phone number typed by a person into E.164 format (+2547XXXXXXXX).
 * Kenyan numbers may be typed as 0712 345 678, 712345678, 254712345678 or
 * +254 712 345 678. Other countries must include the leading + and country code.
 * Returns null when the number cannot be understood.
 */
export function normalizePhoneNumber(input: string | null | undefined): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return null;

  if (hasPlus) {
    // +254 numbers have exactly 9 digits after the country code.
    if (digits.startsWith("254")) return /^254[17]\d{8}$/.test(digits) ? `+${digits}` : null;
    return /^\d{8,15}$/.test(digits) && !digits.startsWith("0") ? `+${digits}` : null;
  }
  if (/^254[17]\d{8}$/.test(digits)) return `+${digits}`;
  if (/^0[17]\d{8}$/.test(digits)) return `+254${digits.slice(1)}`;
  if (/^[17]\d{8}$/.test(digits)) return `+254${digits}`;
  return null;
}

/** Display a stored E.164 number the way people type it, e.g. 0712 345 678. */
export function formatPhoneForDisplay(e164: string | null | undefined) {
  if (!e164) return "";
  const match = /^\+254([17]\d{2})(\d{3})(\d{3})$/.exec(e164);
  return match ? `0${match[1]} ${match[2]} ${match[3]}` : e164;
}

export function isSmsConfigured() {
  return Boolean(process.env.AT_USERNAME && process.env.AT_API_KEY);
}

export type SmsResult =
  | { delivered: true }
  | { delivered: false; reason: "not_configured" | "invalid_number" | "rejected" | "network_error" };

/** Keep a message within two SMS segments, trimming the body rather than a link. */
export function composeSmsMessage(input: { title: string; description: string; link?: string | null }) {
  const head = `IFTA: ${input.title.trim()}`;
  const link = input.link ? `\n${input.link}` : "";
  const room = MAX_SMS_LENGTH - head.length - link.length - 2;
  let body = input.description.replace(/\s+/g, " ").trim();
  if (room < 20) return `${head}${link}`.slice(0, MAX_SMS_LENGTH);
  if (body.length > room) body = `${body.slice(0, Math.max(0, room - 1)).trimEnd()}…`;
  return `${head}. ${body}${link}`;
}

export async function sendSms(input: { to: string; message: string }): Promise<SmsResult> {
  if (!isSmsConfigured()) return { delivered: false, reason: "not_configured" };
  const to = normalizePhoneNumber(input.to);
  if (!to) return { delivered: false, reason: "invalid_number" };

  const username = process.env.AT_USERNAME as string;
  const endpoint = username === "sandbox"
    ? "https://api.sandbox.africastalking.com/version1/messaging"
    : "https://api.africastalking.com/version1/messaging";
  const body = new URLSearchParams({ username, to, message: input.message });
  if (process.env.AT_SENDER_ID) body.set("from", process.env.AT_SENDER_ID);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        apiKey: process.env.AT_API_KEY as string,
      },
      body,
      signal: AbortSignal.timeout(SMS_TIMEOUT_MS),
    });
    if (!response.ok) {
      console.error(`SMS gateway returned HTTP ${response.status}.`);
      return { delivered: false, reason: "rejected" };
    }
    const data = (await response.json()) as {
      SMSMessageData?: { Recipients?: Array<{ statusCode?: number }> };
    };
    const accepted = data.SMSMessageData?.Recipients?.some(
      (recipient) => typeof recipient.statusCode === "number" && SUCCESS_STATUS_CODES.has(recipient.statusCode),
    );
    return accepted ? { delivered: true } : { delivered: false, reason: "rejected" };
  } catch (error) {
    console.error("Unable to reach the SMS gateway.", error instanceof Error ? error.message : error);
    return { delivered: false, reason: "network_error" };
  }
}
