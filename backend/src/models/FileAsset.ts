import mongoose, { Schema, Document } from "mongoose";

export interface IFileAsset extends Document {
  fileName: string;
  fileType: string;
  fileSize: number;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  pageCount?: number;
  uploadedBy: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FileAssetSchema = new Schema<IFileAsset>(
  {
    fileName: {
      type: String,
      required: [true, "File name is required"],
      trim: true,
    },
    fileType: {
      type: String,
      required: [true, "File type is required"],
      enum: [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/png",
        "image/jpeg",
      ],
    },
    fileSize: {
      type: Number,
      required: [true, "File size is required"],
    },
    cloudinaryUrl: {
      type: String,
      required: [true, "Cloudinary URL is required"],
    },
    cloudinaryPublicId: {
      type: String,
      required: [true, "Cloudinary public ID is required"],
    },
    pageCount: {
      type: Number,
      default: 0,
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
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
FileAssetSchema.index({ organizationId: 1, uploadedBy: 1 });
FileAssetSchema.index({ cloudinaryPublicId: 1 });

export default mongoose.model<IFileAsset>("FileAsset", FileAssetSchema);
