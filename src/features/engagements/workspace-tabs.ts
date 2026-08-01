export const ENGAGEMENT_WORKSPACE_TABS = [
  "overview",
  "tasks",
  "documents",
  "deliverables",
  "messages",
  "finance",
  "timeline",
  "completion",
] as const;

export type EngagementWorkspaceTab = (typeof ENGAGEMENT_WORKSPACE_TABS)[number];

export function isEngagementWorkspaceTab(value?: string): value is EngagementWorkspaceTab {
  return typeof value === "string"
    && (ENGAGEMENT_WORKSPACE_TABS as readonly string[]).includes(value);
}