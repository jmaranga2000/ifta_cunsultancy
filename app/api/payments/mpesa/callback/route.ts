import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { resolveMpesaEnv } from "@/lib/mpesa";
import { handleMpesaCallback } from "@/repositories/mpesa-payment-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function tokenMatches(received: string | null, expected: string) {
  if (!received || !expected) return false;
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Safaricom posts the STK Push result here. The secret token in the URL proves the call is genuine. */
export async function POST(request: Request) {
  const config = resolveMpesaEnv();
  const token = new URL(request.url).searchParams.get("token");
  if (!config || !tokenMatches(token, config.callbackToken)) {
    return NextResponse.json({ ResultCode: 1, ResultDesc: "Rejected" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ResultCode: 1, ResultDesc: "Invalid body" }, { status: 400 });
  }

  try {
    await handleMpesaCallback(body);
  } catch (error) {
    console.error("M-Pesa callback failed.", error);
    // A 500 makes Safaricom retry, which is safe because settling is idempotent.
    return NextResponse.json({ ResultCode: 1, ResultDesc: "Temporary error" }, { status: 500 });
  }
  return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
}
