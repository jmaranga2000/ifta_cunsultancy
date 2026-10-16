import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const etimsCounterSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, immutable: true },
    value: { type: Number, required: true, default: 0 },
  },
  { collection: "etims_counters", timestamps: true },
);

export type EtimsCounterDocument = InferSchemaType<typeof etimsCounterSchema>;
export const EtimsCounterModel =
  (mongoose.models.EtimsCounter as Model<EtimsCounterDocument> | undefined)
  ?? mongoose.model<EtimsCounterDocument>("EtimsCounter", etimsCounterSchema);
