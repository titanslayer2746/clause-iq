import mongoose, { Document, Schema } from "mongoose";

export type RuleType =
  | "clause_required"
  | "clause_forbidden"
  | "value_range"
  | "term_length"
  | "payment_terms"
  | "liability_cap"
  | "custom";

export interface IPlaybookRule extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  ruleType: RuleType;
  category: string; // e.g., "Legal", "Financial", "Operational"
  severity: "low" | "medium" | "high" | "critical";
  enabled: boolean;

  // Rule configuration
  config: {
    clauseType?: string; // For clause_required/forbidden
    minValue?: number;
    maxValue?: number;
    acceptableValues?: string[];
    pattern?: string; // Regex pattern for matching
    customCheck?: string; // Custom validation logic
  };

  // Recommendation for non-compliance
  recommendation?: string;

  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PlaybookRuleSchema = new Schema<IPlaybookRule>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    ruleType: {
      type: String,
      enum: [
        "clause_required",
        "clause_forbidden",
        "value_range",
        "term_length",
        "payment_terms",
        "liability_cap",
        "custom",
      ],
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    config: {
      type: Schema.Types.Mixed,
      required: true,
    },
    recommendation: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for finding active rules
PlaybookRuleSchema.index({ organizationId: 1, enabled: 1 });

export default mongoose.model<IPlaybookRule>(
  "PlaybookRule",
  PlaybookRuleSchema
);
