import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export { cloudinary };

/**
 * Generate a cryptographically signed upload payload for client direct uploads
 */
export function generateUploadSignature(folder: string = 'conceptlens/uploads') {
  const { CLOUDINARY_CLOUD_NAME: cloudName, CLOUDINARY_API_KEY: apiKey, CLOUDINARY_API_SECRET: apiSecret } = process.env;
  if (!cloudName || !apiKey || !apiSecret) throw new Error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.');
  const timestamp = Math.round(new Date().getTime() / 1000);

  const paramsToSign: Record<string, string | number> = {
    folder,
    timestamp,
    tags: 'student-upload',
    allowed_formats: 'png,jpg,jpeg,webp,pdf'
  };

  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

  return {
    timestamp,
    signature,
    apiKey,
    cloudName,
    folder
  };
}

/**
 * Generate responsive cropped & sharpened URL for diagram viewing
 */
export function getOptimizedDiagramUrl(
  publicId: string,
  crop?: { x: number; y: number; width: number; height: number }
): string {
  const transformation: Array<Record<string, string | number>> = [
    { effect: 'deskew' }, { effect: 'sharpen:80' }, { effect: 'contrast' }
  ];

  if (crop && crop.width > 0 && crop.height > 0) {
    transformation.unshift({ crop: 'crop', x: Math.round(crop.x), y: Math.round(crop.y), width: Math.round(crop.width), height: Math.round(crop.height) });
  }

  return cloudinary.url(publicId, { transformation, fetch_format: 'auto', quality: 'auto' });
}
