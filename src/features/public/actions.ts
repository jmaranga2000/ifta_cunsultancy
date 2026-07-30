"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { writeAuditLog } from "@/features/audit/audit-service";
import {
  sendPublicContactEmailToAdmin,
  sendPublicContactReceiptEmailToUser,
} from "@/features/public/contact-email";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  company: z.string().trim().max(160).optional(),
  service: z.string().trim().min(2).max(120),
  message: z.string().trim().min(10).max(2000),
});

export async function submitContactAction(formData: FormData) {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    company: formData.get("company"),
    service: formData.get("service"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    redirect("/contact?error=Please%20complete%20the%20required%20fields.");
  }

  const [adminResult, receiptResult] = await Promise.allSettled([
    sendPublicContactEmailToAdmin(parsed.data),
    sendPublicContactReceiptEmailToUser(parsed.data),
  ]);

  const adminDelivery = adminResult.status === "fulfilled"
    ? adminResult.value
    : { delivered: false, recipient: "", reason: "The internal contact alert could not be sent." };
  const userDelivery = receiptResult.status === "fulfilled"
    ? receiptResult.value
    : { delivered: false, recipient: parsed.data.email, reason: "The contact acknowledgement could not be sent." };
  await writeAuditLog({
    action: "public.contact_submitted",
    resourceType: "ContactLead",
    newValues: parsed.data,
    metadata: {
      source: "public_contact_form",
      adminEmailDelivery: adminDelivery,
      userReceiptEmailDelivery: userDelivery,
    },
  });

  redirect("/contact?sent=1");
}
