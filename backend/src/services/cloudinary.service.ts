import getCloudinary from "../config/cloudinary";
import { AppError } from "../middleware/errorHandler";

interface UploadResult {
  url: string;
  publicId: string;
  format: string;
  bytes: number;
  pages?: number;
}

class CloudinaryService {
  async uploadFile(
    filePath: string,
    folder: string = "contracts"
  ): Promise<UploadResult> {
    try {
      const cloudinary = getCloudinary();

      const uploadOptions = {
        folder: `clause-iq/${folder}`,
        resource_type: "raw" as const,
        type: "upload" as const,
      };

      const result = await cloudinary.uploader.upload(filePath, uploadOptions);

      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        bytes: result.bytes,
        pages: result.pages || undefined,
      };
    } catch (error: any) {
      console.error("❌ Cloudinary upload failed:", error);
      throw new AppError("Failed to upload file to cloud storage", 500);
    }
  }

  async deleteFile(publicId: string): Promise<void> {
    try {
      const cloudinary = getCloudinary();

      // Try different resource types (PDFs are stored as 'raw')
      const resourceTypes = ["raw", "image"];

      for (const resourceType of resourceTypes) {
        try {
          await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType as "image" | "raw",
          });
          return;
        } catch (err: any) {
          // Try next resource type
          if (err.http_code === 404) continue;
          throw err;
        }
      }
    } catch (error: any) {
      console.error("❌ Cloudinary delete failed:", error);
      // Don't throw error, just log it - allow contract deletion to continue
    }
  }

  async getFileInfo(publicId: string): Promise<any> {
    try {
      const cloudinary = getCloudinary();

      // Try different resource types
      try {
        return await cloudinary.api.resource(publicId, {
          resource_type: "raw",
        });
      } catch (err: any) {
        if (err.http_code === 404) {
          // Try as image
          return await cloudinary.api.resource(publicId, {
            resource_type: "image",
          });
        }
        throw err;
      }
    } catch (error: any) {
      console.error("❌ Failed to get file info:", error);
      throw new AppError("Failed to retrieve file information", 500);
    }
  }
}

export default new CloudinaryService();
