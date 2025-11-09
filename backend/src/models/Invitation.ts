import mongoose, { Schema, Document } from "mongoose";
import { UserRole } from "./User";

export interface IInvitation extends Document {
  email: string;
  organizationId: mongoose.Types.ObjectId;
  role: UserRole;
  invitedBy: mongoose.Types.ObjectId;
  token: string;
  status: "pending" | "accepted" | "expired" | "cancelled";
  expiresAt: Date;
  acceptedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InvitationSchema = new Schema<IInvitation>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: [true, "Role is required"],
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "expired", "cancelled"],
      default: "pending",
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    acceptedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Compound indexes for faster queries
InvitationSchema.index({ email: 1, organizationId: 1 });
InvitationSchema.index({ token: 1, status: 1 });
InvitationSchema.index({ organizationId: 1, status: 1 });

export default mongoose.model<IInvitation>("Invitation", InvitationSchema);
