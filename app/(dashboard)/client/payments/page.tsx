import { ClientPayments } from "@/components/dashboard/client/client-payments";
import { requireUser } from "@/features/auth/server";
import { getClientPayments } from "@/repositories/client-portal-repository";

export default async function ClientPaymentsPage({ searchParams }: { searchParams: Promise<{ submitted?: string; mpesa?: string; error?: string }> }) {
  const principal = await requireUser();
  const [query, data] = await Promise.all([searchParams, getClientPayments(principal)]);
  return <ClientPayments invoices={data.invoices} payments={data.payments} notice={query.mpesa ? "Check your phone and enter your M-Pesa PIN. We will confirm your payment automatically." : query.submitted ? "Your payment was sent to finance to be confirmed." : undefined} />;
}
