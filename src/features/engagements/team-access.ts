import type { Principal } from "@/features/authorization/access-control";

export function canManageEngagementTeam(principal: Principal) {
  return principal.permissions.includes("engagements.assign")
    && principal.roleKeys.some((role) => role === "admin" || role === "super_admin");
}
