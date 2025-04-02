import { v2 as cloudinary } from "cloudinary";

/**
 * Extract Cloudinary public ID from a Cloudinary URL
 * @param {string} cloudinaryUrl - The Cloudinary URL
 * @returns {string|null} - The extracted public ID or null if extraction fails
 */
export const extractPublicId = (cloudinaryUrl) => {
  if (!cloudinaryUrl) return null;

  try {
    // Extract the public ID with folder from the URL
    // Format: https://res.cloudinary.com/[cloud_name]/image/upload/v[version]/[folder]/[public_id].[extension]
    const regex = /\/v\d+\/(.+)\.\w+$/;
    const match = cloudinaryUrl.match(regex);

    if (match && match[1]) {
      return match[1]; // This will include the folder path, e.g., "threadio/profileimages/abc123"
    }

    // Fallback to old method if regex fails
    const urlParts = cloudinaryUrl.split("/");
    const fileNameWithExtension = urlParts[urlParts.length - 1];
    const publicId = fileNameWithExtension.split(".")[0];
    return publicId;
  } catch (error) {
    console.error("Error extracting public ID from Cloudinary URL:", error);
    return null;
  }
};

/**
 * Delete an image from Cloudinary
 * @param {string} cloudinaryUrl - The Cloudinary URL of the image to delete
 * @returns {Promise<boolean>} - True if deletion was successful, false otherwise
 */
export const deleteCloudinaryImage = async (cloudinaryUrl) => {
  if (!cloudinaryUrl) return false;

  try {
    const publicId = extractPublicId(cloudinaryUrl);
    if (!publicId) return false;

    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === "ok";
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    return false;
  }
};
