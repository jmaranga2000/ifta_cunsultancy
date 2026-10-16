import type { NotificationType } from "@/features/communication/types";
import { connectToDatabase } from "@/lib/db/mongoose";
import { composeSmsMessage, isSmsConfigured, sendSms } from "@/lib/sms";
import { UserModel } from "@/models/user";

/**
 * Only notifications a person may need to act on quickly are sent by SMS.
 * Chat messages and general announcements stay in-app and email only, so
 * people are not flooded with texts.
 */
export const SMS_NOTIFICATION_TYPES: ReadonlySet<NotificationType> = new Set<NotificationType>([
  "action_required",
  "new_engagement",
  "engagement_update",
  "kyc_update",
  "document_approved",
  "invoice_generated",
  "payment_received",
]);

export function shouldSendSmsForNotification(type: NotificationType) {
  return SMS_NOTIFICATION_TYPES.has(type);
}

/** Send an SMS copy of a notification to people who gave a number and opted in. Never throws. */
export async function sendSmsNotificationToUser(
  userId: string,
  input: { type: NotificationType; title: string; description: string; actionUrl?: string | null },
) {
  try {
    if (!isSmsConfigured() || !shouldSendSmsForNotification(input.type)) return;
    await connectToDatabase();
    const user = await UserModel.findOne({ _id: userId, status: "active", smsOptIn: true })
      .select("phone")
      .lean()
      .exec();
    if (!user?.phone) return;

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
    const link = appUrl && input.actionUrl?.startsWith("/") ? `${appUrl}${input.actionUrl}` : null;
    await sendSms({
      to: user.phone,
      message: composeSmsMessage({ title: input.title, description: input.description, link }),
    });
  } catch (error) {
    console.error("Unable to send SMS notification.", error instanceof Error ? error.message : error);
  }
}
