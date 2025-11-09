import mongoose, { Document, Schema } from "mongoose";

export interface IComment extends Document {
  contractId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  text: string;
  mentions: mongoose.Types.ObjectId[]; // Users mentioned in comment
  parentId?: mongoose.Types.ObjectId; // For threaded replies
  edited: boolean;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    contractId: {
      type: Schema.Types.ObjectId,
      ref: "Contract",
      required: true,
      index: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    mentions: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    edited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
CommentSchema.index({ contractId: 1, createdAt: -1 });
CommentSchema.index({ parentId: 1 });

export default mongoose.model<IComment>("Comment", CommentSchema);

