import { ClientEngagementsOverview } from "@/components/dashboard/client/client-engagements-overview";
import { requireUser } from "@/features/auth/server";
import { listClientEngagementRequests } from "@/repositories/engagement-request-repository";
import { listWorkflowsForPrincipal } from "@/repositories/workflow-repository";

export default async function ClientEngagementsPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string; quotation?: string; accepted?: string }>;
}) {
  const principal = await requireUser();
  const [query, workflows, requests] = await Promise.all([
    searchParams,
    listWorkflowsForPrincipal(principal),
    listClientEngagementRequests(principal.id),
  ]);
  const notice = query.submitted
    ? "Your request was sent to IFTA for review."
    : query.quotation
      ? "Your quotation request was sent to our pricing team."
      : query.accepted
        ? "Quotation accepted. IFTA will now set up your work."
        : undefined;

  return <ClientEngagementsOverview notice={notice} requests={requests} workflows={workflows} />;
}
