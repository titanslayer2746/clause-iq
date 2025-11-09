import mongoose, { Document, Schema } from "mongoose";

export type NotificationType = 
  | "task_due_soon"
  | "task_overdue"
  | "contract_uploaded"
  | "extraction_completed"
  | "risk_detected"
  | "comment_mention"
  | "assignment"
  | "general";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  relatedContractId?: mongoose.Types.ObjectId;
  relatedTaskId?: mongoose.Types.ObjectId;
  link?: string;
  read: boolean;
  readAt?: Date;
  metadata?: {
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "task_due_soon",
        "task_overdue",
        "contract_uploaded",
        "extraction_completed",
        "risk_detected",
        "comment_mention",
        "assignment",
        "general",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    relatedContractId: {
      type: Schema.Types.ObjectId,
      ref: "Contract",
    },
    relatedTaskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
    },
    link: {
      type: String,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ organizationId: 1, createdAt: -1 });

export default mongoose.model<INotification>("Notification", NotificationSchema);
