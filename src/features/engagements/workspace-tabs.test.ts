import { describe, expect, it } from "vitest";
import { isEngagementWorkspaceTab } from "@/features/engagements/workspace-tabs";

describe("isEngagementWorkspaceTab", () => {
  it("accepts supported workspace tabs and safely defaults unknown query values", () => {
    expect(isEngagementWorkspaceTab("documents")).toBe(true);
    expect(isEngagementWorkspaceTab("unknown")).toBe(false);
    expect(isEngagementWorkspaceTab(undefined)).toBe(false);
  });
});