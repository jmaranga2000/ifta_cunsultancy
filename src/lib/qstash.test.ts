import { describe, expect, it } from "vitest";
import {
  buildEtimsJobUrl,
  ETIMS_JOB_BATCH_SIZE,
  normalizeEtimsJobBatchSize,
} from "@/lib/qstash";

describe("QStash eTIMS job configuration", () => {
  it("builds one canonical signed job URL", () => {
    expect(buildEtimsJobUrl("https://portal.example.com/")).toBe(
      "https://portal.example.com/api/jobs/process-etims",
    );
  });

  it("keeps worker batches inside the serverless execution limit", () => {
    expect(normalizeEtimsJobBatchSize(undefined)).toBe(ETIMS_JOB_BATCH_SIZE);
    expect(normalizeEtimsJobBatchSize(0)).toBe(1);
    expect(normalizeEtimsJobBatchSize(3.9)).toBe(3);
    expect(normalizeEtimsJobBatchSize(100)).toBe(5);
  });
});
