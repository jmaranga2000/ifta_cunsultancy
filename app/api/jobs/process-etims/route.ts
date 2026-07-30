import { NextResponse } from "next/server";
import {
  normalizeEtimsJobBatchSize,
  verifyQStashRequest,
  type EtimsJobPayload,
} from "@/lib/qstash";
import { processEtimsWorkBatch } from "@/repositories/etims-worker-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function parsePayload(body: string): Partial<EtimsJobPayload> {
  if (!body.trim()) return {};

  try {
    const value = JSON.parse(body) as unknown;
    return value && typeof value === "object"
      ? (value as Partial<EtimsJobPayload>)
      : {};
  } catch {
    return {};
  }
}

export async function POST(request: Request) {
  const body = await request.text();
  if (!(await verifyQStashRequest(request, body))) {
    return NextResponse.json(
      { ok: false, error: "Invalid QStash signature." },
      { status: 401 },
    );
  }

  const payload = parsePayload(body);
  const batchSize = normalizeEtimsJobBatchSize(payload.batchSize);

  try {
    const result = await processEtimsWorkBatch(batchSize);
    return NextResponse.json({
      ok: true,
      batchSize,
      fiscalProcessed: result.fiscal.length,
      deliveriesProcessed: result.delivery.length,
    });
  } catch (error) {
    console.error("QStash eTIMS worker failed.", error);
    return NextResponse.json(
      { ok: false, error: "The eTIMS worker could not complete this job." },
      { status: 500 },
    );
  }
}
