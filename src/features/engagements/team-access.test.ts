import { describe, expect, it } from "vitest";
import type { Principal } from "@/features/authorization/access-control";
import { canManageEngagementTeam } from "@/features/engagements/team-access";

function principal(overrides: Partial<Principal>): Principal {
  return {
    id: "507f1f77bcf86cd799439011",
    email: "admin@example.com",
    roleKeys: ["admin"],
    permissions: ["engagements.read_all"],
    clientOrganizationIds: [],
    assignedEngagementIds: [],
    ...overrides,
  };
}

describe("canManageEngagementTeam", () => {
  it("keeps the assignment query off a read-only administrator's engagement view", () => {
    expect(canManageEngagementTeam(principal({}))).toBe(false);
  });

  it("allows a permitted administrator to manage the team", () => {
    expect(canManageEngagementTeam(principal({ permissions: ["engagements.read_all", "engagements.assign"] }))).toBe(true);
  });

  it("does not allow a non-administrator to manage the team", () => {
    expect(canManageEngagementTeam(principal({ roleKeys: ["consultant"], permissions: ["engagements.assign"] }))).toBe(false);
  });
});
