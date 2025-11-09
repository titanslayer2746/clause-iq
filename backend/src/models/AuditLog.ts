import mongoose, { Document, Schema } from "mongoose";

export type AuditAction =
  | "contract_created"
  | "contract_updated"
  | "contract_deleted"
  | "extraction_run"
  | "ai_extraction_run"
  | "compliance_check"
  | "risk_analysis"
  | "task_created"
  | "task_updated"
  | "user_invited"
  | "user_joined"
  | "role_changed"
  | "comment_added"
  | "field_edited";

export interface IAuditLog extends Document {
  organizationId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId; // Optional for system actions
  action: AuditAction;
  resourceType: "contract" | "task" | "user" | "organization" | "playbook" | "extraction";
  resourceId?: mongoose.Types.ObjectId;
  contractId?: mongoose.Types.ObjectId; // For contract-related actions
  changes?: {
    field: string;
    oldValue?: any;
    newValue?: any;
  }[];
  metadata?: {
    [key: string]: any;
  };
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
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
    action: {
      type: String,
      enum: [
        "contract_created",
        "contract_updated",
        "contract_deleted",
        "extraction_run",
        "ai_extraction_run",
        "compliance_check",
        "risk_analysis",
        "task_created",
        "task_updated",
        "user_invited",
        "user_joined",
        "role_changed",
        "comment_added",
        "field_edited",
      ],
      required: true,
      index: true,
    },
    resourceType: {
      type: String,
      enum: ["contract", "task", "user", "organization", "playbook", "extraction"],
      required: true,
    },
    resourceId: {
      type: Schema.Types.ObjectId,
    },
    contractId: {
      type: Schema.Types.ObjectId,
      ref: "Contract",
      index: true,
    },
    changes: [
      {
        field: String,
        oldValue: Schema.Types.Mixed,
        newValue: Schema.Types.Mixed,
      },
    ],
    metadata: {
      type: Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes for efficient queries
AuditLogSchema.index({ contractId: 1, createdAt: -1 });
AuditLogSchema.index({ organizationId: 1, createdAt: -1 });
AuditLogSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);

