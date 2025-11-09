import { v2 as cloudinary } from "cloudinary";

let isConfigured = false;

// Lazy configuration
const configureCloudinary = () => {
  if (isConfigured) return;

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  isConfigured = true;
};

// Validate configuration
export const validateCloudinaryConfig = (): boolean => {
  configureCloudinary(); // Ensure config is loaded

  console.log("\n📋 Cloudinary Configuration Check:");
  console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME ? "✅ Set" : "❌ Missing");
  console.log("CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY ? "✅ Set" : "❌ Missing");
  console.log("CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "✅ Set" : "❌ Missing");

  const { cloud_name, api_key, api_secret } = cloudinary.config();

  if (!cloud_name || !api_key || !api_secret) {
    console.warn("\n⚠️ Cloudinary not configured. File uploads will fail.");
    console.warn("Required environment variables:");
    console.warn("  - CLOUDINARY_CLOUD_NAME");
    console.warn("  - CLOUDINARY_API_KEY");
    console.warn("  - CLOUDINARY_API_SECRET\n");
    return false;
  }

  console.log("✅ Cloudinary configured successfully\n");
  return true;
};

// Get configured cloudinary instance
export const getCloudinary = () => {
  configureCloudinary();
  return cloudinary;
};

// Export getCloudinary as default
export default getCloudinary;
