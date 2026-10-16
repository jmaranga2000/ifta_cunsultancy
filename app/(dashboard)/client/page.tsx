import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Circle,
  Clock3,
  FileCheck2,
  MessageSquareText,
  ReceiptText,
} from "lucide-react";
import { CommunicationWidget } from "@/components/dashboard/communication/communication-widget";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/features/auth/server";
import { getClientJourney, getClientNextStep } from "@/features/client/next-step";
import { getClientKycSubmission } from "@/repositories/client-kyc-repository";
import { getCommunicationHubData } from "@/repositories/communication-repository";
import { listClientEngagementLetters } from "@/repositories/engagement-letter-repository";
import { listClientEngagementRequests } from "@/repositories/engagement-request-repository";
import { getClientKycAccess } from "@/repositories/request-onboarding-repository";
import { listWorkflowsForPrincipal } from "@/repositories/workflow-repository";

export const dynamic = "force-dynamic";

const PAYABLE_STATUSES = new Set(["approved", "issued", "partially_paid", "overdue", "etims_accepted"]);

const toneStyles = {
  action: "border-primary bg-brand-soft",
  waiting: "border-border bg-card",
  done: "border-emerald-200 bg-emerald-50",
} as const;

export default async function ClientDashboardPage() {
  const principal = await requireUser();
  const [communication, workflows, requests, letters, kycAccess] = await Promise.all([
    getCommunicationHubData(principal),
    listWorkflowsForPrincipal(principal),
    listClientEngagementRequests(principal.id),
    listClientEngagementLetters(principal.id),
    getClientKycAccess(principal.id),
  ]);
  const kyc = kycAccess ? await getClientKycSubmission(principal.id) : null;

  const activeEngagements = workflows.filter((workflow) => workflow.status === "active").length;
  const completedEngagements = workflows.filter((workflow) => workflow.status === "completed" || workflow.status === "archived").length;
  const unpaidInvoices = workflows.filter(
    (workflow) => workflow.financial.balanceDue > 0 && PAYABLE_STATUSES.has(workflow.financial.invoiceStatus),
  ).length;
  // Only letters where the client's own signature is still outstanding need action.
  const lettersAwaitingSignature = letters.filter(
    (letter) =>
      (letter.status === "awaiting_signatures" || letter.status === "partially_signed") &&
      letter.signers.some((signer) => signer.role === "client" && signer.required && signer.status !== "signed"),
  ).length;

  const journeyInput = {
    requestStatuses: requests.filter((request) => request.status !== "rejected").map((request) => request.status),
    kycOpen: Boolean(kycAccess),
    kycStatus: kyc?.status ?? null,
    lettersAwaitingSignature,
    activeEngagements,
    completedEngagements,
    unpaidInvoices,
  };
  const nextStep = getClientNextStep(journeyInput);
  const journey = getClientJourney(journeyInput);
  const { summary } = communication;

  const metrics = [
    { icon: BriefcaseBusiness, label: "Work in progress", value: activeEngagements, href: "/client/engagements" },
    { icon: FileCheck2, label: "Needs your action", value: summary.actionRequired + lettersAwaitingSignature, href: "/client/notifications" },
    { icon: MessageSquareText, label: "New messages", value: summary.unreadMessages, href: "/client/messages" },
    { icon: ReceiptText, label: "Invoices to pay", value: unpaidInvoices, href: "/client/invoices" },
  ];

  return (
    <div className="grid min-w-0 gap-5">
      <section className={`rounded-md border-2 p-6 ${toneStyles[nextStep.tone]}`}>
        <p className="flex items-center gap-2 text-sm font-semibold text-primary">
          {nextStep.tone === "waiting" ? <Clock3 aria-hidden="true" className="h-4 w-4" /> : <CheckCircle2 aria-hidden="true" className="h-4 w-4" />}
          {nextStep.tone === "action" ? "Your next step" : nextStep.tone === "waiting" ? "Where things stand" : "All done"}
        </p>
        <h1 className="mt-2 text-2xl font-bold text-foreground md:text-3xl">{nextStep.title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{nextStep.description}</p>
        <Link className={buttonClassName({ className: "mt-5", size: "lg" })} href={nextStep.href}>
          {nextStep.cta}
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </section>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Link className="rounded-md border border-border bg-card p-4 hover:border-primary" href={metric.href} key={metric.label}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{metric.label}</span>
                <Icon aria-hidden="true" className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-2 text-3xl font-bold text-foreground">{metric.value}</p>
            </Link>
          );
        })}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Your journey with IFTA</CardTitle>
          <CardDescription>Five simple steps from request to finished work.</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="divide-y divide-border border-y border-border">
            {journey.map((stage, index) => (
              <li className="grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-3 py-3" key={stage.key}>
                {stage.state === "done" ? (
                  <CheckCircle2 aria-hidden="true" className="h-5 w-5 text-emerald-600" />
                ) : (
                  <Circle aria-hidden="true" className={stage.state === "current" ? "h-5 w-5 text-primary" : "h-5 w-5 text-muted-foreground/50"} />
                )}
                <span className={stage.state === "upcoming" ? "text-sm text-muted-foreground" : "text-sm font-semibold text-foreground"}>
                  {index + 1}. {stage.label}
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  {stage.state === "done" ? "Done" : stage.state === "current" ? "You are here" : ""}
                </span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <CommunicationWidget data={communication} messagesHref="/client/messages" notificationsHref="/client/notifications" />
    </div>
  );
}
