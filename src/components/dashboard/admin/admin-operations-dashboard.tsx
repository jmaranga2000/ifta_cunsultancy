import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BriefcaseBusiness,
  Clock,
  FileCheck2,
  Inbox,
  ListTodo,
  ReceiptText,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  OperationsDashboardData,
  StaffWorkload,
} from "@/features/admin/operations-dashboard-data";
import { cn } from "@/lib/utils";

const kpiIcons = {
  "Pending engagement requests": Inbox,
  "Active engagements": BriefcaseBusiness,
  "Pending KYC reviews": FileCheck2,
  "Outstanding invoices": ReceiptText,
  "Overdue tasks": ListTodo,
  "Client actions required": Users,
};

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function shortDateLabel(value: string) {
  if (!value) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function priorityTone(priority: string) {
  if (priority === "Critical" || priority === "High") {
    return "red" as const;
  }

  if (priority === "Medium") {
    return "gold" as const;
  }

  return "teal" as const;
}

function workloadTone(level: StaffWorkload["utilization"]) {
  if (level === "Overloaded" || level === "High") {
    return "red" as const;
  }

  if (level === "Balanced") {
    return "gold" as const;
  }

  return "green" as const;
}

function workflowTone(status: string) {
  if (status === "Connected") {
    return "green" as const;
  }

  if (status === "Ready") {
    return "teal" as const;
  }

  return "gold" as const;
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-dashed border-border bg-muted/30 px-4 py-6 text-sm leading-6 text-muted-foreground">
      {message}
    </div>
  );
}

function DecisionRow({ item }: { item: OperationsDashboardData["actionQueue"][number] }) {
  return (
    <li className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={priorityTone(item.priority)}>{item.priority}</Badge>
          <p className="font-bold text-foreground">{item.client}</p>
        </div>
        <p className="mt-1 text-base text-foreground">{item.issue}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {item.recordType} {item.reference} · waiting {item.age}
        </p>
      </div>
      <Link className={buttonClassName({ className: "shrink-0" })} href={item.href}>
        {item.action}
        <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
      </Link>
    </li>
  );
}

export function AdminOperationsDashboard({ data }: { data: OperationsDashboardData }) {
  const waiting = data.actionQueue.length;
  const firstItems = data.actionQueue.slice(0, 5);
  const otherItems = data.actionQueue.slice(5);
  const urgentAlerts = data.alerts.filter((alert) => alert.severity === "critical" || alert.severity === "high");

  return (
    <div className="grid min-w-0 gap-6">
      <section className={cn("rounded-xl border-2 p-6", waiting > 0 ? "border-primary bg-brand-soft" : "border-emerald-200 bg-emerald-50")}>
        <p className="text-sm font-semibold text-muted-foreground">{dateLabel(data.generatedAt)}</p>
        <h1 className="mt-1 text-2xl font-bold text-foreground md:text-3xl">
          {waiting > 0 ? `${waiting} ${waiting === 1 ? "thing needs" : "things need"} you` : "You are all caught up"}
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          {waiting > 0 ? "Start at the top. Each button opens the record." : "Nothing is waiting for your decision."}
        </p>

        {urgentAlerts.length > 0 ? (
          <ul className="mt-4 grid gap-2">
            {urgentAlerts.map((alert) => (
              <li key={alert.title}>
                <Link className="flex items-center gap-3 rounded-lg border border-danger/30 bg-danger-soft p-3 hover:bg-danger-soft/70" href={alert.href}>
                  <AlertTriangle aria-hidden="true" className="h-5 w-5 shrink-0 text-danger" />
                  <span className="min-w-0 flex-1 text-base font-semibold text-foreground">
                    {alert.title} ({alert.count})
                  </span>
                  <span className="shrink-0 text-sm font-bold text-danger">{alert.action}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}

        {waiting > 0 ? (
          <ul className="mt-5 grid gap-3">
            {firstItems.map((item) => (
              <DecisionRow item={item} key={`${item.recordType}-${item.reference}`} />
            ))}
          </ul>
        ) : null}

        {otherItems.length > 0 ? (
          <details className="group mt-3">
            <summary className="cursor-pointer list-none rounded-lg border border-border bg-card px-4 py-3 text-center text-base font-bold text-primary hover:bg-muted">
              <span className="group-open:hidden">Show {otherItems.length} more</span>
              <span className="hidden group-open:inline">Show fewer</span>
            </summary>
            <ul className="mt-3 grid gap-3">
              {otherItems.map((item) => (
                <DecisionRow item={item} key={`${item.recordType}-${item.reference}`} />
              ))}
            </ul>
          </details>
        ) : null}
      </section>

      <section aria-label="Key numbers" className="grid grid-cols-2 gap-3 xl:grid-cols-3">
        {data.kpis.map((kpi) => {
          const Icon = kpiIcons[kpi.label as keyof typeof kpiIcons] ?? Activity;
          return (
            <Link className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary" href={kpi.href} key={kpi.label}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-base font-semibold text-foreground">{kpi.label}</span>
                <Icon aria-hidden="true" className="h-5 w-5 shrink-0 text-primary" />
              </div>
              <p className="mt-2 text-3xl font-bold text-foreground">{kpi.value}</p>
            </Link>
          );
        })}
      </section>

      <details className="group rounded-xl border border-border bg-card">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 text-lg font-bold text-foreground">
          More details: progress, approvals, team and activity
          <span aria-hidden="true" className="text-2xl text-primary transition-transform group-open:rotate-45">+</span>
        </summary>
        <div className="grid gap-4 border-t border-border p-5 xl:grid-cols-2">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Client work progress</CardTitle>
              <CardDescription>Where current work is in the process.</CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              {data.pipeline.map((stage) => (
                <Link className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0" href="/admin/active-engagements" key={stage.label}>
                  <span>
                    <span className="block text-base font-semibold text-foreground">{stage.label}</span>
                    <span className="text-sm text-muted-foreground">
                      {stage.delayed} delayed · average {stage.averageTime}
                    </span>
                  </span>
                  <Badge tone={stage.delayed > 0 ? "gold" : "slate"}>{stage.count}</Badge>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Approvals and checks</CardTitle>
              <CardDescription>Decisions before work can continue.</CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              {data.workflowGates.map((gate) => (
                <Link className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0" href={gate.href} key={gate.stage}>
                  <span>
                    <span className="block text-base font-semibold text-foreground">{gate.stage}</span>
                    <span className="text-sm text-muted-foreground">{gate.decision}</span>
                  </span>
                  <Badge tone={workflowTone(gate.status)}>{gate.status}</Badge>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Team capacity</CardTitle>
              <CardDescription>Who has room for more work.</CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              {data.staffWorkload.length > 0 ? (
                data.staffWorkload.map((member) => (
                  <div className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0" key={member.name}>
                    <span>
                      <span className="block text-base font-semibold text-foreground">{member.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {member.role} · {member.activeEngagements} engagements
                      </span>
                    </span>
                    <Badge tone={workloadTone(member.utilization)}>{member.utilization}</Badge>
                  </div>
                ))
              ) : (
                <EmptyState message="No staff accounts to show yet." />
              )}
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
              <CardDescription>Latest account and work updates.</CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              {data.activity.length > 0 ? (
                data.activity.map((item) => (
                  <Link className="flex items-center gap-3 py-3 first:pt-0 last:pb-0" href={item.href} key={`${item.resource}-${item.timestamp}`}>
                    <span className="min-w-0 flex-1">
                      <span className="block text-base font-semibold text-foreground">
                        {item.actor} {item.action}
                      </span>
                      <span className="block truncate text-sm text-muted-foreground">{item.resource}</span>
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-1 text-sm text-muted-foreground">
                      <Clock aria-hidden="true" className="h-3.5 w-3.5" />
                      {shortDateLabel(item.timestamp)}
                    </span>
                  </Link>
                ))
              ) : (
                <EmptyState message="No recent activity yet." />
              )}
            </CardContent>
          </Card>
        </div>
      </details>
    </div>
  );
}
