import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'conceptlens-demo',
  api_key: process.env.CLOUDINARY_API_KEY || 'demo_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'demo_secret',
  secure: true
});

export { cloudinary };

/**
 * Generate a cryptographically signed upload payload for client direct uploads
 */
export function generateUploadSignature(folder: string = 'conceptlens/uploads') {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'conceptlens-demo';
  const apiKey = process.env.CLOUDINARY_API_KEY || 'demo_key';
  const apiSecret = process.env.CLOUDINARY_API_SECRET || 'demo_secret';

  const paramsToSign: Record<string, string | number> = {
    folder,
    timestamp
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
  const options: Record<string, any> = {
    fetch_format: 'auto',
    quality: 'auto',
    effect: 'sharpen:80'
  };

  if (crop && crop.width > 0 && crop.height > 0) {
    options.crop = 'crop';
    options.x = Math.round(crop.x);
    options.y = Math.round(crop.y);
    options.width = Math.round(crop.width);
    options.height = Math.round(crop.height);
  }

  return cloudinary.url(publicId, options);
}
