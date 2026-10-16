/**
 * M-Pesa STK Push (Safaricom Daraja) so clients can pay an invoice by
 * approving a prompt on their phone. Configure with `.env`:
 *
 *   MPESA_ENVIRONMENT      sandbox (default) or production
 *   MPESA_CONSUMER_KEY     Daraja app consumer key
 *   MPESA_CONSUMER_SECRET  Daraja app consumer secret
 *   MPESA_SHORTCODE        Paybill (or Till store number) that receives the money
 *   MPESA_PASSKEY          Lipa na M-Pesa Online passkey
 *   MPESA_TILL_NUMBER      only if paying a Buy Goods till (otherwise leave blank)
 *   MPESA_CALLBACK_TOKEN   a long random string; protects the confirmation URL
 *   MPESA_CALLBACK_URL     optional; defaults to NEXT_PUBLIC_APP_URL + /api/payments/mpesa/callback
 */

type EnvSource = Record<string, string | undefined>;

export type MpesaConfig = {
  environment: "sandbox" | "production";
  baseUrl: string;
  consumerKey: string;
  consumerSecret: string;
  shortcode: string;
  passkey: string;
  tillNumber: string;
  callbackToken: string;
  callbackUrl: string;
  missing: string[];
};

const CALLBACK_PATH = "/api/payments/mpesa/callback";

function clean(value: string | undefined) {
  return (value ?? "").trim();
}

/** Returns null when M-Pesa is not set up at all (no consumer key). */
export function resolveMpesaEnv(source: EnvSource = process.env): MpesaConfig | null {
  const consumerKey = clean(source.MPESA_CONSUMER_KEY);
  if (!consumerKey) return null;
  const environment = clean(source.MPESA_ENVIRONMENT).toLowerCase() === "production" ? "production" : "sandbox";
  const appUrl = clean(source.NEXT_PUBLIC_APP_URL).replace(/\/+$/, "");
  const callbackToken = clean(source.MPESA_CALLBACK_TOKEN);
  const baseCallback = clean(source.MPESA_CALLBACK_URL) || (appUrl ? `${appUrl}${CALLBACK_PATH}` : "");

  const config: MpesaConfig = {
    environment,
    baseUrl: environment === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke",
    consumerKey,
    consumerSecret: clean(source.MPESA_CONSUMER_SECRET),
    shortcode: clean(source.MPESA_SHORTCODE),
    passkey: clean(source.MPESA_PASSKEY),
    tillNumber: clean(source.MPESA_TILL_NUMBER),
    callbackToken,
    callbackUrl: baseCallback ? `${baseCallback}${baseCallback.includes("?") ? "&" : "?"}token=${encodeURIComponent(callbackToken)}` : "",
    missing: [],
  };
  if (!config.consumerSecret) config.missing.push("MPESA_CONSUMER_SECRET");
  if (!config.shortcode) config.missing.push("MPESA_SHORTCODE");
  if (!config.passkey) config.missing.push("MPESA_PASSKEY");
  if (!callbackToken) config.missing.push("MPESA_CALLBACK_TOKEN");
  if (!baseCallback) config.missing.push("MPESA_CALLBACK_URL or NEXT_PUBLIC_APP_URL");
  else if (environment === "production" && !baseCallback.startsWith("https://")) config.missing.push("MPESA_CALLBACK_URL (must be https in production)");
  return config;
}

export function isMpesaReady(source: EnvSource = process.env) {
  const config = resolveMpesaEnv(source);
  return Boolean(config && config.missing.length === 0);
}

export function mpesaTimestamp(now = new Date()) {
  const shifted = new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString();
  return `${shifted.slice(0, 10).replace(/-/g, "")}${shifted.slice(11, 19).replace(/:/g, "")}`;
}

export function mpesaPassword(shortcode: string, passkey: string, timestamp: string) {
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
}

/** Daraja wants 2547XXXXXXXX or 2541XXXXXXXX with no plus sign. */
export function toMpesaMsisdn(e164: string | null | undefined) {
  const match = /^\+?(254[17]\d{8})$/.exec((e164 ?? "").trim());
  return match ? match[1] : null;
}

let cachedToken: { value: string; expiresAt: number; key: string } | null = null;

async function accessToken(config: MpesaConfig) {
  const cacheKey = `${config.environment}:${config.consumerKey}`;
  if (cachedToken && cachedToken.key === cacheKey && cachedToken.expiresAt > Date.now() + 30_000) return cachedToken.value;
  const response = await fetch(`${config.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString("base64")}` },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`M-Pesa sign-in failed (HTTP ${response.status}). Check the consumer key and secret.`);
  const data = (await response.json()) as { access_token?: string; expires_in?: string | number };
  if (!data.access_token) throw new Error("M-Pesa did not return an access token.");
  cachedToken = { value: data.access_token, expiresAt: Date.now() + (Number(data.expires_in) || 3000) * 1000, key: cacheKey };
  return data.access_token;
}

export type StkPushResult =
  | { ok: true; checkoutRequestId: string; merchantRequestId: string; customerMessage: string }
  | { ok: false; message: string };

export async function sendStkPush(
  config: MpesaConfig,
  input: { amount: number; msisdn: string; reference: string; description: string },
): Promise<StkPushResult> {
  try {
    const timestamp = mpesaTimestamp();
    const token = await accessToken(config);
    const isTill = Boolean(config.tillNumber);
    const response = await fetch(`${config.baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        BusinessShortCode: config.shortcode,
        Password: mpesaPassword(config.shortcode, config.passkey, timestamp),
        Timestamp: timestamp,
        TransactionType: isTill ? "CustomerBuyGoodsOnline" : "CustomerPayBillOnline",
        Amount: Math.round(input.amount),
        PartyA: input.msisdn,
        PartyB: isTill ? config.tillNumber : config.shortcode,
        PhoneNumber: input.msisdn,
        CallBackURL: config.callbackUrl,
        AccountReference: input.reference.slice(0, 12),
        TransactionDesc: input.description.slice(0, 13),
      }),
      signal: AbortSignal.timeout(30_000),
    });
    const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    if (response.ok && String(data.ResponseCode) === "0" && typeof data.CheckoutRequestID === "string") {
      return {
        ok: true,
        checkoutRequestId: data.CheckoutRequestID,
        merchantRequestId: String(data.MerchantRequestID ?? ""),
        customerMessage: String(data.CustomerMessage ?? ""),
      };
    }
    return { ok: false, message: String(data.errorMessage ?? data.ResponseDescription ?? `M-Pesa answered HTTP ${response.status}.`).slice(0, 200) };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message.slice(0, 200) : "Could not reach M-Pesa." };
  }
}

export type StkCallback = {
  checkoutRequestId: string;
  merchantRequestId: string;
  resultCode: number;
  resultDescription: string;
  amount: number | null;
  receiptNumber: string;
  phone: string;
};

/** Reads Safaricom's callback body; returns null if it is not an STK callback. */
export function parseStkCallback(body: unknown): StkCallback | null {
  const callback = (body as { Body?: { stkCallback?: Record<string, unknown> } } | null)?.Body?.stkCallback;
  if (!callback || typeof callback.CheckoutRequestID !== "string") return null;
  const items = ((callback.CallbackMetadata as { Item?: Array<{ Name?: string; Value?: unknown }> } | undefined)?.Item) ?? [];
  const find = (name: string) => items.find((item) => item.Name === name)?.Value;
  const amount = Number(find("Amount"));
  return {
    checkoutRequestId: callback.CheckoutRequestID,
    merchantRequestId: String(callback.MerchantRequestID ?? ""),
    resultCode: Number(callback.ResultCode),
    resultDescription: String(callback.ResultDesc ?? ""),
    amount: Number.isFinite(amount) ? amount : null,
    receiptNumber: String(find("MpesaReceiptNumber") ?? ""),
    phone: String(find("PhoneNumber") ?? ""),
  };
}
