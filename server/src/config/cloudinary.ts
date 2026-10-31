import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

function trimmedEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

cloudinary.config({
  cloud_name: trimmedEnv('CLOUDINARY_CLOUD_NAME'),
  api_key: trimmedEnv('CLOUDINARY_API_KEY'),
  api_secret: trimmedEnv('CLOUDINARY_API_SECRET'),
  secure: true
});

export { cloudinary };

/**
 * Checks whether valid Cloudinary credentials are set in environment
 */
export function isCloudinaryConfigured(): boolean {
  const cloudName = trimmedEnv('CLOUDINARY_CLOUD_NAME');
  const apiKey = trimmedEnv('CLOUDINARY_API_KEY');
  const apiSecret = trimmedEnv('CLOUDINARY_API_SECRET');
  return Boolean(
    cloudName &&
    apiKey &&
    apiSecret &&
    cloudName !== 'your_cloud_name_here' &&
    apiKey !== 'your_api_key_here' &&
    apiSecret !== 'your_api_secret_here'
  );
}

const ALLOWED_UPLOAD_MIMES = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];
export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

/** Rejects unsupported types and oversized payloads before any Cloudinary call. */
export function inspectDirectUpload(fileData: unknown): { ok: true } | { ok: false; status: number; error: string } {
  if (typeof fileData !== 'string' || fileData.length === 0) {
    return { ok: false, status: 400, error: 'Missing fileData (data URI or URL required)' };
  }
  if (fileData.length > Math.ceil(MAX_UPLOAD_BYTES * 1.4)) {
    return { ok: false, status: 413, error: 'File exceeds the 15MB upload limit.' };
  }
  if (fileData.startsWith('data:')) {
    const mime = fileData.slice(5, fileData.indexOf(';'));
    if (!ALLOWED_UPLOAD_MIMES.includes(mime)) {
      return { ok: false, status: 400, error: 'Only PNG, JPEG, WebP, and PDF uploads are accepted.' };
    }
  } else if (!fileData.startsWith('https://')) {
    return { ok: false, status: 400, error: 'fileData must be a data URI or an https URL.' };
  }
  return { ok: true };
}

/**
 * Generate a cryptographically signed upload payload for client direct uploads
 */
export function generateUploadSignature(folder: string = 'conceptlens/uploads') {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.');
  }

  const cloudName = trimmedEnv('CLOUDINARY_CLOUD_NAME');
  const apiKey = trimmedEnv('CLOUDINARY_API_KEY');
  const apiSecret = trimmedEnv('CLOUDINARY_API_SECRET');
  const timestamp = Math.round(new Date().getTime() / 1000);

  const paramsToSign: Record<string, string | number> = {
    folder,
    timestamp
  };

  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret!);

  return {
    timestamp,
    signature,
    apiKey,
    cloudName,
    folder
  };
}

/** Public IDs used in delivery URLs. Rejects traversal and remote URLs. */
export function isSafePublicId(publicId: string): boolean {
  return typeof publicId === 'string' &&
    publicId.length > 0 &&
    publicId.length <= 240 &&
    !publicId.includes('..') &&
    !publicId.includes('://') &&
    !publicId.startsWith('/') &&
    /^[A-Za-z0-9_./-]+$/.test(publicId);
}

/**
 * URL-based delivery. Works against the public `demo` cloud when this project
 * has no credentials, and against the configured cloud when it does.
 * Transformations do not require the API secret.
 */
export function buildDeliveryUrl(
  cloudName: string,
  publicId: string,
  crop?: { x: number; y: number; width: number; height: number },
  options: { sharpen?: boolean; contrast?: boolean; maxDimension?: number } = {}
): string {
  const parts: string[] = [];

  if (crop && crop.width > 0 && crop.height > 0) {
    parts.push(
      `c_crop,x_${Math.round(crop.x)},y_${Math.round(crop.y)},w_${Math.round(crop.width)},h_${Math.round(crop.height)}`
    );
  }

  if (options.maxDimension) {
    parts.push(`c_limit,w_${Math.round(options.maxDimension)},h_${Math.round(options.maxDimension)}`);
  }

  if (options.sharpen ?? true) {
    parts.push('e_sharpen:80');
  }

  if (options.contrast ?? true) {
    parts.push('e_contrast');
  }

  parts.push('f_auto', 'q_auto');
  return `https://res.cloudinary.com/${cloudName}/image/upload/${parts.join(',')}/${publicId}`;
}

/**
 * Generate responsive cropped & sharpened URL for diagram viewing
 */
export function getOptimizedDiagramUrl(
  publicId: string,
  crop?: { x: number; y: number; width: number; height: number },
  options: { sharpen?: boolean; contrast?: boolean; maxDimension?: number } = {}
): string {
  if (!isSafePublicId(publicId)) {
    throw new Error('publicId contains unsupported characters.');
  }

  if (!isCloudinaryConfigured()) {
    return buildDeliveryUrl('demo', publicId, crop, options);
  }

  const transformation: Array<Record<string, string | number>> = [];

  if (crop && crop.width > 0 && crop.height > 0) {
    transformation.push({
      crop: 'crop',
      x: Math.round(crop.x),
      y: Math.round(crop.y),
      width: Math.round(crop.width),
      height: Math.round(crop.height)
    });
  }

  if (options.maxDimension) {
    transformation.push({
      crop: 'limit',
      width: options.maxDimension,
      height: options.maxDimension
    });
  }

  if (options.sharpen ?? true) {
    transformation.push({ effect: 'sharpen:80' });
  }

  if (options.contrast ?? true) {
    transformation.push({ effect: 'contrast' });
  }

  return cloudinary.url(publicId, {
    transformation,
    fetch_format: 'auto',
    quality: 'auto'
  });
}

/**
 * Direct upload via server proxy
 */
export async function uploadDirectToCloudinary(
  fileContent: string, // data URI or URL
  folder: string = 'conceptlens/uploads'
) {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary credentials not configured in server environment.');
  }

  // Learner files are authenticated assets. The original file name is not the public id.
  // The asset remains in the Cloudinary account until an explicit delete. This request does not keep a local copy.
  return cloudinary.uploader.upload(fileContent, {
    folder,
    use_filename: false,
    unique_filename: true,
    resource_type: 'auto',
    type: 'authenticated',
    tags: ['conceptlens', 'learner-material'],
    allowed_formats: ['png', 'jpg', 'jpeg', 'webp', 'pdf']
  });
}

/** Signed upload stays off unless the cloud name and API key were accepted together. */
export function signedUploadAllowed(input: { configured: boolean; accountReachable: boolean }): { allowed: boolean; reason: string } {
  if (!input.configured) {
    return { allowed: false, reason: 'Cloudinary credentials are not configured. Signed upload stays off.' };
  }
  if (!input.accountReachable) {
    return {
      allowed: false,
      reason: 'Cloudinary did not accept this cloud name and API key together. Signed upload stays off. Unsigned upload is not used instead.'
    };
  }
  return { allowed: true, reason: 'Cloudinary account check succeeded.' };
}

export function cloudinaryFailureReason(message: string): string {
  if (/cloud_name mismatch/i.test(message)) {
    return 'The cloud name does not match the API key. Signed upload stays off.';
  }
  if (/key|secret|auth/i.test(message)) {
    return 'Cloudinary rejected the server credentials. Signed upload stays off.';
  }
  return 'Cloudinary could not be reached. Signed upload stays off.';
}
