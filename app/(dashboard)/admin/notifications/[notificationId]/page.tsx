import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BellRing, Clock3, UsersRound } from "lucide-react";
import { AdminNotificationForm } from "@/components/dashboard/admin/admin-notification-form";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { requirePermission } from "@/features/auth/server";
import {
  archiveAdminNotificationAction,
  updateAdminNotificationAction,
} from "@/features/communication/actions";
import { getAdminNotification } from "@/repositories/admin-notification-repository";

function dateLabel(value: string | null) {
  if (!value) return "Not recorded";
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function AdminNotificationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ notificationId: string }>;
  searchParams: Promise<{ created?: string; error?: string; saved?: string }>;
}) {
  await requirePermission("settings.manage");
  const [{ notificationId }, query] = await Promise.all([params, searchParams]);
  const notification = await getAdminNotification(notificationId);

  if (!notification) notFound();

  return (
    <main className="mx-auto grid w-full min-w-0 gap-4 sm:gap-5">
      <section className="relative isolate overflow-hidden rounded-2xl border border-[#315783] bg-gradient-to-br from-[#071b30] via-[#0b2b4c] to-[#123b6d] p-4 text-white shadow-lg shadow-[#071b30]/15 sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-brand-gold/10 blur-3xl" />
        <div className="relative">
          <Link
            className={buttonClassName({ className: "mb-5 border-white/20 bg-white/10 text-white hover:bg-white/15", size: "sm", variant: "ghost" })}
            href="/admin/notifications"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            All notifications
          </Link>

          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-brand-gold">
                <BellRing aria-hidden="true" className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-[0.16em]">Notification details</span>
              </div>
              <h1 className="mt-2 max-w-3xl break-words text-2xl font-bold leading-tight text-white sm:text-3xl">{notification.title}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
                Manage the message, destination and recipients for this notification.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone={notification.notificationType === "action_required" ? "red" : "teal"}>
                  {notification.notificationType === "action_required" ? "Action required" : "Information"}
                </Badge>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/85">
                  <UsersRound aria-hidden="true" className="h-3.5 w-3.5" />
                  {notification.audience.replaceAll("_", " ")}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/85">
                  <Clock3 aria-hidden="true" className="h-3.5 w-3.5" />
                  Published {dateLabel(notification.publishedAt)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 lg:min-w-72">
              {[
                { label: "Delivered", value: notification.recipientCount },
                { label: "Read", value: notification.readCount },
                { label: "Unread", value: notification.unreadCount },
              ].map((item) => (
                <div className="rounded-xl border border-white/15 bg-white/[0.07] px-3 py-3 text-center" key={item.label}>
                  <p className="text-xl font-bold text-white">{item.value}</p>
                  <p className="mt-1 text-[11px] font-medium text-white/65">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {query.created || query.saved ? (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          <Badge tone="green">{query.created ? "Sent" : "Saved"}</Badge>
          Recipient inboxes are up to date.
        </div>
      ) : null}
      {query.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
          Check the required fields and try again.
        </p>
      ) : null}
      <AdminNotificationForm
        action={updateAdminNotificationAction}
        archiveAction={archiveAdminNotificationAction}
        notification={notification}
        submitLabel="Save changes"
      />
    </main>
  );
}
