import { cloudinary } from "../config/cloudinary.js";

// [UPLOAD] Delete image from Cloudinary by URL
export const removeCloudinaryImage = async (imageUrl: string) => {
  try {
    // [UTIL] Extract public_id from URL
    const matches = imageUrl.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
    if (!matches || !matches[1]) {
      console.warn("⚠️ Could not extract public_id from URL:", imageUrl);
      return;
    }

    const publicId = matches[1];
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("❌ Error removing image from Cloudinary:", err);
  }
};
