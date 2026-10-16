import { randomBytes } from "node:crypto";
import { Types } from "mongoose";
import type { Principal } from "@/features/authorization/access-control";
import { connectToDatabase } from "@/lib/db/mongoose";
import { parseStkCallback, resolveMpesaEnv, sendStkPush, toMpesaMsisdn } from "@/lib/mpesa";
import { normalizePhoneNumber } from "@/lib/sms";
import { ClientPaymentModel } from "@/models/client-payment";
import { FiscalInvoiceModel } from "@/models/fiscal-invoice";
import { WorkflowInstanceModel } from "@/models/workflow-instance";
import { createCommunicationNotification } from "@/repositories/communication-repository";

const PAYABLE_STATUSES = ["approved", "issued", "partially_paid", "overdue", "etims_accepted"];

export type StartMpesaPaymentResult =
  | { ok: true; message: string }
  | { ok: false; reason: "not_configured" | "invalid_phone" | "invalid_amount" | "not_payable" | "gateway"; message: string };

/** Sends the M-Pesa prompt to the client's phone and records a pending payment. */
export async function startMpesaPayment(input: {
  principal: Principal;
  workflowId: string;
  amount: number;
  phone: string;
}): Promise<StartMpesaPaymentResult> {
  const config = resolveMpesaEnv();
  if (!config || config.missing.length) {
    return { ok: false, reason: "not_configured", message: "M-Pesa payments are not available right now. Please pay another way." };
  }
  const msisdn = toMpesaMsisdn(normalizePhoneNumber(input.phone));
  if (!msisdn) {
    return { ok: false, reason: "invalid_phone", message: "Enter the Safaricom number to charge, for example 0712 345 678." };
  }

  await connectToDatabase();
  if (!Types.ObjectId.isValid(input.principal.id) || !Types.ObjectId.isValid(input.workflowId)) {
    return { ok: false, reason: "not_payable", message: "That invoice could not be found." };
  }
  const workflow = await WorkflowInstanceModel.findOne({
    _id: input.workflowId,
    clientUserId: input.principal.id,
    status: "active",
    archivedAt: null,
  }).lean().exec();
  if (!workflow || !PAYABLE_STATUSES.includes(workflow.financial.invoiceStatus) || workflow.financial.balanceDue <= 0) {
    return { ok: false, reason: "not_payable", message: "That invoice cannot be paid right now." };
  }

  const amount = Math.round(input.amount);
  const balance = workflow.financial.balanceDue as number;
  if (!Number.isFinite(amount) || amount < 1 || amount > Math.ceil(balance)) {
    return { ok: false, reason: "invalid_amount", message: "Enter a whole-shilling amount that is not more than what is due." };
  }
  if (workflow.financial.currency && workflow.financial.currency !== "KES") {
    return { ok: false, reason: "not_payable", message: "M-Pesa can only be used for invoices in Kenya shillings." };
  }

  const stk = await sendStkPush(config, {
    amount,
    msisdn,
    reference: workflow.reference ?? "IFTA",
    description: "IFTA invoice",
  });
  if (!stk.ok) {
    return { ok: false, reason: "gateway", message: "M-Pesa could not send the prompt. Check the number and try again." };
  }

  const now = new Date();
  await ClientPaymentModel.create({
    clientUserId: input.principal.id,
    workflowId: input.workflowId,
    amount: Math.min(amount, balance),
    currency: "KES",
    method: "mpesa",
    transactionReference: stk.checkoutRequestId,
    status: "pending",
    source: "mpesa_stk",
    mpesaCheckoutRequestId: stk.checkoutRequestId,
    mpesaMerchantRequestId: stk.merchantRequestId,
    mpesaPhoneLast4: msisdn.slice(-4),
    reviewNote: "Waiting for the client to approve the M-Pesa prompt.",
  });
  await WorkflowInstanceModel.updateOne(
    { _id: input.workflowId, status: "active", archivedAt: null },
    {
      $set: { "financial.paymentStatus": "pending", lastActivityAt: now },
      $push: {
        activity: {
          type: "payment_recorded",
          title: "M-Pesa payment requested",
          actorName: input.principal.email,
          actorUserId: new Types.ObjectId(input.principal.id),
          description: `KES ${amount.toLocaleString("en-KE")} requested from a phone ending ${msisdn.slice(-4)}.`,
          relatedResource: stk.checkoutRequestId,
          clientVisible: true,
          createdAt: now,
        },
      },
    },
  ).exec();
  return { ok: true, message: "Check your phone and enter your M-Pesa PIN. We will confirm your payment automatically." };
}

/**
 * Handles Safaricom's confirmation. Always safe to call twice: only a payment
 * that is still pending can be settled, so a repeated callback changes nothing.
 */
export async function handleMpesaCallback(body: unknown): Promise<"settled" | "failed" | "ignored"> {
  const callback = parseStkCallback(body);
  if (!callback) return "ignored";
  await connectToDatabase();

  const now = new Date();
  const succeeded = callback.resultCode === 0 && Boolean(callback.receiptNumber);
  const receipt = `RCP-${now.getFullYear()}-${randomBytes(3).toString("hex").toUpperCase()}`;

  const payment = await ClientPaymentModel.findOneAndUpdate(
    { mpesaCheckoutRequestId: callback.checkoutRequestId, status: "pending", archivedAt: null },
    {
      $set: succeeded
        ? {
            status: "verified",
            transactionReference: callback.receiptNumber,
            verifiedAt: now,
            receiptNumber: receipt,
            mpesaReceiptNumber: callback.receiptNumber,
            reviewNote: `Confirmed automatically by M-Pesa (receipt ${callback.receiptNumber}).`,
          }
        : {
            status: "rejected",
            reviewNote: callback.resultCode === 1032
              ? "The M-Pesa prompt was cancelled on the phone."
              : `M-Pesa did not complete the payment: ${callback.resultDescription || `code ${callback.resultCode}`}`.slice(0, 300),
          },
    },
    { returnDocument: "after" },
  ).lean().exec();
  if (!payment) return "ignored";

  const workflow = await WorkflowInstanceModel.findOne({ _id: payment.workflowId, archivedAt: null }).lean().exec();
  if (!workflow) return succeeded ? "settled" : "failed";

  if (succeeded) {
    // Trust the amount M-Pesa reports if it differs from what we asked for.
    const paid = callback.amount && callback.amount > 0 ? Math.min(callback.amount, payment.amount) : payment.amount;
    const balanceDue = Math.max(0, Math.round((workflow.financial.balanceDue - paid) * 100) / 100);
    const invoiceStatus = balanceDue === 0 ? "paid" : "partially_paid";
    await WorkflowInstanceModel.updateOne(
      { _id: workflow._id, archivedAt: null },
      {
        $set: {
          "financial.balanceDue": balanceDue,
          "financial.invoiceStatus": invoiceStatus,
          "financial.paymentStatus": balanceDue === 0 ? "reconciled" : "partially_allocated",
          "financial.invoices.$[invoice].status": invoiceStatus,
          lastActivityAt: now,
        },
        $push: {
          activity: {
            type: "payment_recorded",
            title: "M-Pesa payment received",
            actorName: "M-Pesa",
            description: `KES ${paid.toLocaleString("en-KE")} confirmed (receipt ${callback.receiptNumber}).`,
            relatedResource: callback.receiptNumber,
            clientVisible: true,
            createdAt: now,
          },
        },
      },
      { arrayFilters: [{ "invoice.status": { $in: ["issued", "etims_accepted", "partially_paid", "overdue"] } }] },
    ).exec();
    await FiscalInvoiceModel.findOneAndUpdate(
      { workflowId: workflow._id, archivedAt: null, "etims.status": "ACCEPTED" },
      { $set: { balanceDue } },
      { sort: { issueDate: -1 } },
    ).exec();
  } else {
    await WorkflowInstanceModel.updateOne(
      { _id: workflow._id, archivedAt: null },
      {
        $set: { "financial.paymentStatus": "failed", lastActivityAt: now },
        $push: {
          activity: {
            type: "payment_recorded",
            title: "M-Pesa payment not completed",
            actorName: "M-Pesa",
            description: payment.reviewNote,
            relatedResource: callback.checkoutRequestId,
            clientVisible: true,
            createdAt: now,
          },
        },
      },
    ).exec();
  }

  if (workflow.clientUserId) {
    await createCommunicationNotification({
      recipientUserId: workflow.clientUserId.toString(),
      type: succeeded ? "payment_received" : "action_required",
      title: succeeded ? "Payment received" : "Your M-Pesa payment did not go through",
      description: succeeded
        ? `We received your M-Pesa payment (receipt ${callback.receiptNumber}). Thank you.`
        : "You can try again or choose another way to pay.",
      relatedModule: "payments",
      relatedRecordId: payment._id.toString(),
      actionUrl: "/client/payments",
    }).catch((error: unknown) => console.error("Unable to send the M-Pesa notification.", error));
  }
  return succeeded ? "settled" : "failed";
}
