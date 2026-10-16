import { afterEach, describe, expect, it, vi } from "vitest";
import { mpesaPassword, mpesaTimestamp, parseStkCallback, resolveMpesaEnv, sendStkPush, toMpesaMsisdn } from "@/lib/mpesa";

const full = {
  MPESA_CONSUMER_KEY: "key",
  MPESA_CONSUMER_SECRET: "secret",
  MPESA_SHORTCODE: "174379",
  MPESA_PASSKEY: "pass",
  MPESA_CALLBACK_TOKEN: "tok en",
  NEXT_PUBLIC_APP_URL: "https://portal.ifta.test/",
};

describe("resolveMpesaEnv", () => {
  it("is off when no consumer key is set", () => {
    expect(resolveMpesaEnv({})).toBeNull();
  });

  it("builds a sandbox config with a tokenised callback URL", () => {
    const config = resolveMpesaEnv(full);
    expect(config?.missing).toEqual([]);
    expect(config).toMatchObject({ environment: "sandbox", baseUrl: "https://sandbox.safaricom.co.ke" });
    expect(config?.callbackUrl).toBe("https://portal.ifta.test/api/payments/mpesa/callback?token=tok%20en");
  });

  it("lists what is still missing and insists on https in production", () => {
    expect(resolveMpesaEnv({ MPESA_CONSUMER_KEY: "k" })?.missing).toEqual([
      "MPESA_CONSUMER_SECRET", "MPESA_SHORTCODE", "MPESA_PASSKEY", "MPESA_CALLBACK_TOKEN", "MPESA_CALLBACK_URL or NEXT_PUBLIC_APP_URL",
    ]);
    const production = resolveMpesaEnv({ ...full, MPESA_ENVIRONMENT: "production", NEXT_PUBLIC_APP_URL: "http://portal.test" });
    expect(production?.baseUrl).toBe("https://api.safaricom.co.ke");
    expect(production?.missing[0]).toContain("must be https");
  });
});

describe("helpers", () => {
  it("builds the Daraja password and Nairobi timestamp", () => {
    expect(mpesaTimestamp(new Date("2026-10-13T08:05:09Z"))).toBe("20261013110509");
    expect(mpesaPassword("174379", "pass", "20261013110509")).toBe(Buffer.from("174379pass20261013110509").toString("base64"));
  });

  it("converts numbers to Daraja format", () => {
    expect(toMpesaMsisdn("+254712345678")).toBe("254712345678");
    expect(toMpesaMsisdn("+14155552671")).toBeNull();
    expect(toMpesaMsisdn(null)).toBeNull();
  });

  it("reads a successful and a cancelled callback", () => {
    const ok = parseStkCallback({ Body: { stkCallback: { MerchantRequestID: "m1", CheckoutRequestID: "ws_CO_1", ResultCode: 0, ResultDesc: "ok", CallbackMetadata: { Item: [{ Name: "Amount", Value: 1500 }, { Name: "MpesaReceiptNumber", Value: "SJ12ABC345" }, { Name: "PhoneNumber", Value: 254712345678 }] } } } });
    expect(ok).toMatchObject({ checkoutRequestId: "ws_CO_1", resultCode: 0, amount: 1500, receiptNumber: "SJ12ABC345" });
    const cancelled = parseStkCallback({ Body: { stkCallback: { MerchantRequestID: "m1", CheckoutRequestID: "ws_CO_2", ResultCode: 1032, ResultDesc: "Request cancelled by user" } } });
    expect(cancelled).toMatchObject({ resultCode: 1032, amount: null, receiptNumber: "" });
    expect(parseStkCallback({ nope: true })).toBeNull();
    expect(parseStkCallback(null)).toBeNull();
  });
});

describe("sendStkPush", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("signs in, sends the prompt and returns the checkout id", async () => {
    const calls: Array<[string, RequestInit]> = [];
    vi.stubGlobal("fetch", vi.fn(async (url: string, init: RequestInit) => {
      calls.push([url, init]);
      if (url.includes("/oauth/")) return new Response(JSON.stringify({ access_token: "T", expires_in: "3599" }));
      return new Response(JSON.stringify({ ResponseCode: "0", CheckoutRequestID: "ws_CO_9", MerchantRequestID: "m9", CustomerMessage: "Success" }));
    }));
    const config = resolveMpesaEnv(full)!;
    const result = await sendStkPush(config, { amount: 1500.4, msisdn: "254712345678", reference: "ENG-2026-0001-LONG", description: "IFTA invoice" });
    expect(result).toMatchObject({ ok: true, checkoutRequestId: "ws_CO_9" });
    const body = JSON.parse(String(calls[1][1].body));
    expect(body).toMatchObject({ Amount: 1500, PartyA: "254712345678", PartyB: "174379", TransactionType: "CustomerPayBillOnline", AccountReference: "ENG-2026-000" });
    expect(String(calls[1][1].headers && (calls[1][1].headers as Record<string, string>).Authorization)).toBe("Bearer T");
  });

  it("reports failures without throwing", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("no", { status: 401 })));
    const result = await sendStkPush(resolveMpesaEnv({ ...full, MPESA_CONSUMER_KEY: "other" })!, { amount: 10, msisdn: "254712345678", reference: "X", description: "Y" });
    expect(result.ok).toBe(false);
  });
});
