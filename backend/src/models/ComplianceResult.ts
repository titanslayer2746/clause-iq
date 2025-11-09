import mongoose, { Document, Schema } from "mongoose";

export interface IDeviation {
  ruleId: mongoose.Types.ObjectId;
  ruleName: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  recommendation?: string;
  affectedClause?: string;
}

export interface IComplianceResult extends Document {
  contractId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;

  // Overall compliance score (0-100)
  score: number;

  // Pass/Fail status
  passed: boolean;

  // Total rules checked
  totalRules: number;
  passedRules: number;
  failedRules: number;

  // Detailed deviations
  deviations: IDeviation[];

  // Analysis metadata
  analyzedAt: Date;
  rulesVersion?: string; // Optional: track which version of rules was used

  createdAt: Date;
  updatedAt: Date;
}

const DeviationSchema = new Schema(
  {
    ruleId: {
      type: Schema.Types.ObjectId,
      ref: "PlaybookRule",
      required: true,
    },
    ruleName: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    recommendation: {
      type: String,
    },
    affectedClause: {
      type: String,
    },
  },
  { _id: false }
);

const ComplianceResultSchema = new Schema<IComplianceResult>(
  {
    contractId: {
      type: Schema.Types.ObjectId,
      ref: "Contract",
      required: true,
      index: true,
      unique: true, // One compliance result per contract
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    passed: {
      type: Boolean,
      required: true,
    },
    totalRules: {
      type: Number,
      required: true,
    },
    passedRules: {
      type: Number,
      required: true,
    },
    failedRules: {
      type: Number,
      required: true,
    },
    deviations: [DeviationSchema],
    analyzedAt: {
      type: Date,
      required: true,
    },
    rulesVersion: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IComplianceResult>(
  "ComplianceResult",
  ComplianceResultSchema
);
