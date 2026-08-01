import { EngagementExecutionWorkspace } from "@/components/dashboard/engagements/engagement-execution-workspace";
import { isEngagementWorkspaceTab, type EngagementWorkspaceTab } from "@/features/engagements/workspace-tabs";
import { EngagementUnavailable } from "@/components/dashboard/engagements/engagement-unavailable";
import { requirePermission } from "@/features/auth/server";
import { canManageEngagementTeam } from "@/features/engagements/team-access";
import { listEngagementTeamCandidates } from "@/repositories/engagement-management-repository";
import { getEngagementExecutionData } from "@/repositories/engagement-execution-repository";

function workspaceTab(value?: string): EngagementWorkspaceTab {
  return isEngagementWorkspaceTab(value) ? value : "overview";
}

export default async function AdminActiveEngagementPage({
  params,
  searchParams,
}: {
  params: Promise<{ workflowId: string }>;
  searchParams: Promise<{ error?: string; saved?: string; missing?: string; tab?: string; team?: string; note?: string; replace?: string; transitionError?: string; transitioned?: string }>;
}) {
  const principal = await requirePermission("engagements.read_all");
  const [{ workflowId }, query] = await Promise.all([params, searchParams]);
  const canAssignTeam = canManageEngagementTeam(principal);
  const [data, candidates] = await Promise.all([
    getEngagementExecutionData(principal, workflowId),
    canAssignTeam
      ? listEngagementTeamCandidates(principal).catch((error) => {
          console.error("Unable to load engagement team candidates.", error);
          return [];
        })
      : Promise.resolve([]),
  ]);
  if (!data) return <EngagementUnavailable backHref="/admin/active-engagements" />;

  return (
    <EngagementExecutionWorkspace
      activeTab={workspaceTab(query.tab)}
      data={data}
      portal="admin"
      principal={{ id: principal.id, roleKeys: principal.roleKeys, permissions: principal.permissions }}
      query={query}
      teamCandidates={candidates}
    />
  );
}
