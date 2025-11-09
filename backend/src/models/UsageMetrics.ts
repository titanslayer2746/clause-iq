import mongoose, { Document, Schema } from "mongoose";

export interface IUsageMetrics extends Document {
  organizationId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  
  // API usage
  apiCalls: {
    date: Date;
    endpoint: string;
    count: number;
  }[];
  
  // AI usage
  geminiTokensUsed: number;
  extractionsRun: number;
  chatMessagesCount: number;
  
  // Storage
  contractsCount: number;
  storageUsedMB: number;
  
  // Period
  period: "daily" | "monthly";
  periodStart: Date;
  periodEnd: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const UsageMetricsSchema = new Schema<IUsageMetrics>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    apiCalls: [
      {
        date: Date,
        endpoint: String,
        count: Number,
      },
    ],
    geminiTokensUsed: {
      type: Number,
      default: 0,
    },
    extractionsRun: {
      type: Number,
      default: 0,
    },
    chatMessagesCount: {
      type: Number,
      default: 0,
    },
    contractsCount: {
      type: Number,
      default: 0,
    },
    storageUsedMB: {
      type: Number,
      default: 0,
    },
    period: {
      type: String,
      enum: ["daily", "monthly"],
      default: "daily",
    },
    periodStart: {
      type: Date,
      required: true,
    },
    periodEnd: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

UsageMetricsSchema.index({ organizationId: 1, periodStart: -1 });

export default mongoose.model<IUsageMetrics>("UsageMetrics", UsageMetricsSchema);

