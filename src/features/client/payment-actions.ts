"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/features/auth/server";
import { createClientPayment } from "@/repositories/client-portal-repository";
import { startMpesaPayment } from "@/repositories/mpesa-payment-repository";

const paymentMethods = new Set(["bank_transfer", "mpesa", "card", "other"]);

export async function submitClientPaymentAction(formData: FormData) {
  const principal = await requireUser();
  const workflowId = String(formData.get("workflowId") ?? "");
  const amount = Number(formData.get("amount"));
  const method = String(formData.get("method") ?? "");
  const transactionReference = String(formData.get("transactionReference") ?? "").trim().slice(0, 100);
  if (!Number.isFinite(amount) || amount <= 0 || !paymentMethods.has(method) || !transactionReference) {
    redirect("/client/payments/new?error=details");
  }
  const paymentId = await createClientPayment({
    principal,
    workflowId,
    amount,
    method: method as "bank_transfer" | "mpesa" | "card" | "other",
    transactionReference,
  });
  revalidatePath("/client/payments");
  revalidatePath("/client/invoices");
  revalidatePath(`/client/invoices/${workflowId}`);
  redirect(`/client/payments?${paymentId ? "submitted=1" : "error=payment"}`);
}

/** Pay an invoice by approving an M-Pesa prompt on the client's phone. */
export async function payWithMpesaAction(formData: FormData) {
  const principal = await requireUser();
  const workflowId = String(formData.get("workflowId") ?? "");
  const amount = Number(formData.get("amount"));
  const phone = String(formData.get("phone") ?? "");
  const result = await startMpesaPayment({ principal, workflowId, amount, phone });
  revalidatePath("/client/payments");
  revalidatePath("/client/invoices");
  redirect(result.ok ? "/client/payments?mpesa=sent" : `/client/payments/new?mpesaError=${result.reason}`);
}
