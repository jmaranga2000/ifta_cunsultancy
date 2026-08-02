import { describe, expect, it } from "vitest";
import { formatArchiveTableValue } from "@/features/archive/format-archive-table-value";

describe("formatArchiveTableValue", () => {
  it("renders archived document comments as readable text", () => {
    expect(formatArchiveTableValue([{ body: "Please update the tax return.", authorName: "Jane Reviewer", createdAt: "2026-08-01" }]))
      .toBe("Jane Reviewer: Please update the tax return. (2026-08-01)");
  });

  it("handles other structured snapshot values without returning a React object", () => {
    expect(formatArchiveTableValue({ status: "approved", count: 2 })).toBe('{"status":"approved","count":2}');
    expect(formatArchiveTableValue(null)).toBe("Not recorded");
  });
});