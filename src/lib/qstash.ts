import { Client, Receiver } from "@upstash/qstash";
import { ConfigurationError } from "@/lib/errors";
import { getServerEnv } from "@/lib/env";

export const ETIMS_JOB_PATH = "/api/jobs/process-etims";
export const ETIMS_JOB_CRON = "*/5 * * * *";
export const ETIMS_JOB_LABEL = "ifta-etims-worker";
export const ETIMS_JOB_BATCH_SIZE = 1;

export type EtimsJobPayload = {
  source: "schedule" | "manual" | "continuation";
  batchSize: number;
};

function required(value: string | undefined, name: string) {
  const normalized = value?.trim();
  if (!normalized) {
    throw new ConfigurationError(`Invalid environment configuration: ${name}`);
  }
  return normalized;
}

export function buildEtimsJobUrl(baseUrl: string) {
  return `${baseUrl.replace(/\/+$/, "")}${ETIMS_JOB_PATH}`;
}

export function normalizeEtimsJobBatchSize(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return ETIMS_JOB_BATCH_SIZE;
  return Math.max(1, Math.min(5, Math.trunc(parsed)));
}

export function getQStashClient() {
  const env = getServerEnv();
  return new Client({
    token: required(env.QSTASH_TOKEN, "QSTASH_TOKEN"),
    baseUrl: env.QSTASH_URL?.trim() || undefined,
  });
}

function getQStashReceiver() {
  const env = getServerEnv();
  return new Receiver({
    currentSigningKey: required(
      env.QSTASH_CURRENT_SIGNING_KEY,
      "QSTASH_CURRENT_SIGNING_KEY",
    ),
    nextSigningKey: required(
      env.QSTASH_NEXT_SIGNING_KEY,
      "QSTASH_NEXT_SIGNING_KEY",
    ),
  });
}

export async function verifyQStashRequest(request: Request, body: string) {
  const signature = request.headers.get("upstash-signature")?.trim();
  if (!signature) return false;

  try {
    return await getQStashReceiver().verify({
      signature,
      body,
      url: buildEtimsJobUrl(getServerEnv().NEXT_PUBLIC_APP_URL),
      upstashRegion: request.headers.get("upstash-region") ?? undefined,
      clockTolerance: 5,
    });
  } catch {
    return false;
  }
}

export async function ensureEtimsQStashSchedule() {
  const client = getQStashClient();
  const destination = buildEtimsJobUrl(getServerEnv().NEXT_PUBLIC_APP_URL);
  const schedules = await client.schedules.list();
  const existing = schedules.find(
    (schedule) =>
      schedule.labels?.includes(ETIMS_JOB_LABEL) ||
      schedule.label === ETIMS_JOB_LABEL ||
      schedule.destination === destination,
  );

  const result = await client.schedules.create({
    destination,
    cron: ETIMS_JOB_CRON,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source: "schedule",
      batchSize: ETIMS_JOB_BATCH_SIZE,
    } satisfies EtimsJobPayload),
    retries: 3,
    timeout: 50,
    scheduleId: existing?.scheduleId,
    label: ["ifta", ETIMS_JOB_LABEL],
  });

  return {
    created: !existing,
    destination,
    cron: ETIMS_JOB_CRON,
    scheduleId: result.scheduleId,
  };
}
