import mongoose, { Schema, Document } from "mongoose";

export interface IOrganization extends Document {
  name: string;
  createdBy: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  settings?: {
    allowedDomains?: string[];
    defaultRole?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: {
      type: String,
      required: [true, "Organization name is required"],
      trim: true,
      minlength: [2, "Organization name must be at least 2 characters"],
      maxlength: [100, "Organization name cannot exceed 100 characters"],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    settings: {
      allowedDomains: [String],
      defaultRole: {
        type: String,
        default: "Viewer",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
OrganizationSchema.index({ createdBy: 1 });
OrganizationSchema.index({ members: 1 });

export default mongoose.model<IOrganization>(
  "Organization",
  OrganizationSchema
);
