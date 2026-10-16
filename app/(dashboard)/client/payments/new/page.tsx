import { ClientPaymentForm } from "@/components/dashboard/client/client-payments";
import { requireUser } from "@/features/auth/server";
import { isMpesaReady } from "@/lib/mpesa";
import { getClientInvoices } from "@/repositories/client-portal-repository";

export default async function NewClientPaymentPage({ searchParams }: { searchParams: Promise<{ error?: string; mpesaError?: string }> }) {
  const principal = await requireUser();
  const [query, invoices] = await Promise.all([searchParams, getClientInvoices(principal)]);
  return <ClientPaymentForm error={query.error} invoices={invoices} mpesaError={query.mpesaError} mpesaReady={isMpesaReady()} />;
}
