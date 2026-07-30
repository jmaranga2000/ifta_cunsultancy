import Link from "next/link";
import { ArrowRight, UserRoundX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePermission } from "@/features/auth/server";
import { listAccountClosureRequests } from "@/repositories/account-closure-repository";

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function statusTone(status: string) {
  if (status === "requested") return "gold" as const;
  if (status === "approved") return "teal" as const;
  if (status === "completed") return "green" as const;
  return "red" as const;
}

export default async function AdminAccountClosuresPage() {
  const [, requests] = await Promise.all([
    requirePermission("clients.update"),
    listAccountClosureRequests(),
  ]);
  const awaitingReview = requests.filter((request) => request.status === "requested");
  const approved = requests.filter((request) => request.status === "approved");

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-5">
      <section className="flex flex-col justify-between gap-4 rounded-md border border-border bg-card p-5 sm:flex-row sm:items-start">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-danger-soft text-danger">
            <UserRoundX aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-foreground">Account closures</h1>
            <p className="mt-1 text-sm text-muted-foreground">Review client requests, disable access when approved, then complete the closure after the required records are handled.</p>
          </div>
        </div>
        <Link className={buttonClassName({ variant: "secondary", size: "sm" })} href="/admin/clients">Open clients</Link>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <Card className="shadow-none"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Awaiting review</p><p className="mt-1 text-2xl font-bold text-foreground">{awaitingReview.length}</p></CardContent></Card>
        <Card className="shadow-none"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Approved to close</p><p className="mt-1 text-2xl font-bold text-foreground">{approved.length}</p></CardContent></Card>
      </section>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Closure requests</CardTitle>
          <CardDescription>Open a client record to approve, reject, or complete the closure with an auditable note.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {requests.map((request) => (
            <article className="grid gap-4 rounded-md border border-border p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center" key={request.id}>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-foreground">{request.requestedByName}</p>
                  <Badge tone={statusTone(request.status)}>{request.status.replaceAll("_", " ")}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{request.requestReference} · Requested {dateLabel(request.requestedAt)}</p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{request.reason}</p>
              </div>
              <Link className={buttonClassName({ size: "sm" })} href={"/admin/clients/" + request.clientUserId}>
                {request.status === "requested" ? "Review request" : "Open client"}
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </article>
          ))}
          {requests.length === 0 ? (
            <div className="rounded-md border border-dashed border-border p-8 text-center">
              <p className="font-semibold text-foreground">No account closure requests</p>
              <p className="mt-1 text-sm text-muted-foreground">New client requests will appear here automatically.</p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}