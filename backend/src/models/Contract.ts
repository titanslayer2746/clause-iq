import mongoose, { Schema, Document } from "mongoose";

export enum ContractStatus {
  PENDING = "Pending",
  REVIEWED = "Reviewed",
  APPROVED = "Approved",
  REJECTED = "Rejected",
  EXPIRED = "Expired",
}

export interface IContract extends Document {
  title: string;
  vendor?: string;
  description?: string;
  status: ContractStatus;
  riskScore?: number;
  fileAssetId: mongoose.Types.ObjectId;
  extractedDataId?: mongoose.Types.ObjectId;
  uploadedBy: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  tags?: string[];
  assignedTo?: mongoose.Types.ObjectId;
  metadata?: {
    contractType?: string;
    department?: string;
    value?: number;
    currency?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ContractSchema = new Schema<IContract>(
  {
    title: {
      type: String,
      required: [true, "Contract title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    vendor: {
      type: String,
      trim: true,
      maxlength: [100, "Vendor name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    status: {
      type: String,
      enum: Object.values(ContractStatus),
      default: ContractStatus.PENDING,
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    fileAssetId: {
      type: Schema.Types.ObjectId,
      ref: "FileAsset",
      required: true,
    },
    extractedDataId: {
      type: Schema.Types.ObjectId,
      ref: "ExtractedData",
    },
    uploadedBy: {
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
    assignedTo: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    tags: [String],
    metadata: {
      contractType: String,
      department: String,
      value: Number,
      currency: {
        type: String,
        default: "USD",
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc, ret: any) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound indexes for faster queries
ContractSchema.index({ organizationId: 1, status: 1 });
ContractSchema.index({ organizationId: 1, createdAt: -1 });
ContractSchema.index({ organizationId: 1, riskScore: -1 });
ContractSchema.index({ uploadedBy: 1, createdAt: -1 });
ContractSchema.index({ title: "text", vendor: "text" }); // Text search

export default mongoose.model<IContract>("Contract", ContractSchema);
