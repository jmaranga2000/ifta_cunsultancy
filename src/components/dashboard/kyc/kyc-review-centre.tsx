import Link from "next/link";
import {
  ArrowUpRight,
  CalendarClock,
  ClipboardCheck,
  RefreshCw,
  Settings,
  ShieldAlert,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  KycProgressBar,
  KycRiskBadge,
  KycStatusBadge,
} from "@/components/dashboard/kyc/kyc-badges";
import {
  getKycClientTypeLabel,
  type KycDashboardData,
  type KycSubmission,
} from "@/features/kyc/service";

const summaryIcons = {
  pending: ClipboardCheck,
  changes: RefreshCw,
  overdue: CalendarClock,
  risk: ShieldAlert,
  approved: ShieldCheck,
  expiring: CalendarClock,
} as const;

const cardToneClasses: Record<KycDashboardData["summaryCards"][number]["tone"], string> = {
  blue: "border-l-sky-500 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  amber: "border-l-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  red: "border-l-red-500 bg-red-500/10 text-red-700 dark:text-red-300",
  purple: "border-l-purple-500 bg-purple-500/10 text-purple-700 dark:text-purple-300",
  green: "border-l-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  orange: "border-l-orange-500 bg-orange-500/10 text-orange-700 dark:text-orange-300",
};

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function issueBadges(submission: KycSubmission) {
  if (submission.documentIssues.length === 0) {
    return <Badge tone="green">No issues</Badge>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {submission.documentIssues.slice(0, 2).map((issue) => (
        <Badge key={issue} tone={issue === "Expired" ? "red" : "gold"}>
          {issue}
        </Badge>
      ))}
      {submission.documentIssues.length > 2 ? (
        <Badge tone="slate">+{submission.documentIssues.length - 2}</Badge>
      ) : null}
    </div>
  );
}

export function KycReviewCentre({ data }: { data: KycDashboardData }) {
  return (
    <div className="grid gap-5">
      <section className="rounded-md border border-border bg-card p-5">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
          <div>
            <h1 className="mt-3 text-2xl font-bold tracking-normal text-foreground">
              Client checks (KYC)
            </h1>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-muted-foreground">
              Check client identity and documents before work begins.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className={buttonClassName({ variant: "secondary" })} href="/admin/kyc/reviewers">
              <UserPlus aria-hidden="true" className="h-4 w-4" />
              Reviewers
            </Link>
            <Link className={buttonClassName()} href="/admin/kyc/templates">
              <Settings aria-hidden="true" className="h-4 w-4" />
              KYC setup
            </Link>
          </div>
        </div>
      </section>

      <section aria-label="KYC summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {data.summaryCards.map((card) => {
          const Icon = summaryIcons[card.key as keyof typeof summaryIcons] ?? ClipboardCheck;

          return (
            <Link
              className="group min-w-0 rounded-xl border border-border border-l-4 bg-card p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              href={card.href}
              key={card.key}
            >
              <div className="flex items-center justify-between gap-3">
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${cardToneClasses[card.tone]}`}>
                  <Icon aria-hidden="true" className="h-4 w-4" />
                </span>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
                  <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-4 text-sm font-semibold leading-5 text-muted-foreground">{card.label}</p>
              <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">{card.value}</p>
              <p className="mt-3 border-t border-border pt-3 text-xs font-semibold leading-5 text-foreground">
                {card.supportingMetric}
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{card.statusLine}</p>
            </Link>
          );
        })}
      </section>

      <section className="flex flex-wrap gap-2">
        {data.savedViews.map((view) => (
          <Link
            className={buttonClassName({ variant: "secondary", size: "sm" })}
            href={view.href}
            key={view.label}
          >
            {view.label}
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{view.count}</span>
          </Link>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card>
          <CardHeader>
            <CardTitle>KYC review queue</CardTitle>
            <CardDescription>
              Requirement-level review status, risk, SLA and next action for each submission.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="hidden overflow-x-auto lg:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Completion</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead>Waiting</TableHead>
                    <TableHead>Reviewer</TableHead>
                    <TableHead>Issues</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="min-w-64">
                        <div className="flex items-start gap-3">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-muted text-xs font-bold text-foreground">
                            {initials(submission.clientName)}
                          </span>
                          <div>
                            <Link
                              className="font-semibold text-foreground hover:text-accent"
                              href={submission.clientHref}
                            >
                              {submission.clientName}
                            </Link>
                            <p className="text-xs text-muted-foreground">
                              {getKycClientTypeLabel(submission.clientType)}
                            </p>
                            <p className="text-xs font-medium text-muted-foreground">
                              {submission.engagementReference}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="min-w-52">
                        <p className="font-medium text-foreground">{submission.template}</p>
                        <p className="text-xs text-muted-foreground">{submission.service}</p>
                      </TableCell>
                      <TableCell className="min-w-44">
                        <KycProgressBar
                          label="Submission"
                          total={submission.completion.total}
                          value={submission.completion.submitted}
                        />
                        <div className="mt-2">
                          <KycProgressBar
                            label="Review"
                            tone={submission.status === "approved" ? "green" : "gold"}
                            total={submission.completion.total}
                            value={submission.completion.approved}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <KycRiskBadge risk={submission.riskLevel} />
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold text-foreground">{submission.waitingTime}</p>
                        <p className="text-xs text-muted-foreground">{submission.slaStatus}</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-foreground">{submission.assignedReviewer}</p>
                        <p className="text-xs text-muted-foreground">{submission.reviewerRole}</p>
                      </TableCell>
                      <TableCell>{issueBadges(submission)}</TableCell>
                      <TableCell>
                        <KycStatusBadge status={submission.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Link
                            className={buttonClassName({ size: "sm" })}
                            href={`/admin/kyc/${submission.id}`}
                          >
                            Review KYC
                          </Link>
                          <Link
                            className={buttonClassName({ variant: "secondary", size: "sm" })}
                            href={`/admin/kyc/reviewers?submissionId=${encodeURIComponent(submission.id)}`}
                          >
                            Assign
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="grid gap-3 lg:hidden">
              {data.submissions.map((submission) => (
                <Link
                  className="rounded-md border border-border bg-background p-4"
                  href={`/admin/kyc/${submission.id}`}
                  key={submission.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{submission.clientName}</p>
                      <p className="text-xs text-muted-foreground">
                        {submission.engagementReference}
                      </p>
                    </div>
                    <KycStatusBadge status={submission.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <KycRiskBadge risk={submission.riskLevel} />
                    {issueBadges(submission)}
                  </div>
                  <div className="mt-4 grid gap-2">
                    <KycProgressBar
                      label="Review Progress"
                      total={submission.completion.total}
                      value={submission.completion.approved}
                    />
                    <p className="text-xs font-medium text-muted-foreground">
                      Waiting: {submission.waitingTime} | Reviewer: {submission.assignedReviewer}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid content-start gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Reviewer assignment rules</CardTitle>
              <CardDescription>Who can take each review, and when to warn.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {data.reviewerRules.map((rule) => (
                <div className="rounded-md border border-border px-3 py-3" key={rule.role}>
                  <p className="text-sm font-semibold text-foreground">{rule.role}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{rule.assignmentRule}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>KYC permissions</CardTitle>
              <CardDescription>Review controls available by authorization scope.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {data.permissionMatrix.slice(0, 5).map((permission) => (
                <div className="rounded-md border border-border px-3 py-3" key={permission.label}>
                  <p className="text-sm font-semibold text-foreground">{permission.label}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {permission.description}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
