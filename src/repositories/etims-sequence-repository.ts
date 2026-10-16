import { connectToDatabase } from "@/lib/db/mongoose";
import { EtimsCounterModel } from "@/models/etims-counter";

const SEQUENCE_KEY = "kra-invoice-sequence";

/**
 * KRA identifies every sale by a sequential whole-number invoice number that
 * is unique per branch. This hands out the next one atomically, so two
 * invoices approved at the same moment can never share a number.
 *
 * Set ETIMS_SEQUENCE_START if invoices were already issued under this PIN
 * from another system, so numbering continues rather than restarting at 1.
 */
export async function nextEtimsSequenceNumber(): Promise<number> {
  await connectToDatabase();
  const start = Math.max(1, Math.floor(Number(process.env.ETIMS_SEQUENCE_START) || 1));
  try {
    await EtimsCounterModel.updateOne(
      { key: SEQUENCE_KEY },
      { $setOnInsert: { key: SEQUENCE_KEY, value: start - 1 } },
      { upsert: true },
    ).exec();
  } catch (error) {
    // Another request created the counter first; that is fine.
    if ((error as { code?: number }).code !== 11000) throw error;
  }
  const counter = await EtimsCounterModel.findOneAndUpdate(
    { key: SEQUENCE_KEY },
    { $inc: { value: 1 } },
    { returnDocument: "after" },
  ).lean().exec();
  if (!counter) throw new Error("The eTIMS invoice sequence could not be advanced.");
  return counter.value;
}
