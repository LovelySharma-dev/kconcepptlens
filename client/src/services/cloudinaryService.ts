/**
 * ConceptLens 2.0 - Cloudinary Media Pipeline Service
 * 
 * Implements the official Cloudinary Media Pipeline Skill:
 * 1. Server-signed direct client upload (POST /api/uploads/signature -> api.cloudinary.com)
 * 2. Fallback server proxy upload (POST /api/uploads/direct)
 * 3. Dynamic URL-based transformations (f_auto, q_auto, e_sharpen, e_contrast, c_crop, c_limit, c_thumb)
 * 4. Resilient retry with exponential backoff
 * 5. Type-safe contract and metrics calculation
 */

export interface CloudinaryStatus {
  configured: boolean;
  accountReachable: boolean;
  accountError: string | null;
  cloudName: string | null;
  folder: string;
  supportedFormats: string[];
  maxSizeBytes: number;
}

export interface UploadSignatureResponse {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
}

export interface CloudinaryUploadResult {
  publicId: string;
  secureUrl: string;
  format: string;
  bytes: number;
  width: number;
  height: number;
  transformedUrl: string;
  isLiveCloudinary: boolean;
  savingsPercentage?: number;
}

export interface DiagramCropOptions {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface TransformationOptions {
  crop?: DiagramCropOptions;
  sharpen?: boolean;
  contrast?: boolean;
  maxDimension?: number;
  format?: 'auto' | 'webp' | 'png' | 'jpg';
  quality?: 'auto' | 'auto:good' | 'auto:best';
}

/**
 * Checks server-side Cloudinary configuration status
 */
export async function checkCloudinaryStatus(): Promise<CloudinaryStatus> {
  try {
    const res = await fetch('/api/uploads/status');
    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
  } catch (err) {
    console.warn('[CloudinaryService] Failed to check status, defaulting to demo mode:', err);
  }
  return {
    configured: false,
    accountReachable: false,
    accountError: null,
    cloudName: null,
    folder: 'conceptlens/uploads',
    supportedFormats: ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'],
    maxSizeBytes: 15 * 1024 * 1024
  };
}

/**
 * Generates an optimized Cloudinary delivery URL with STEM textbook enhancement
 */
export function buildCloudinaryUrl(
  publicId: string,
  cloudName: string = 'demo',
  options: TransformationOptions = {}
): string {
  // If already an absolute URL (e.g. Unsplash sample), return as is unless it's a Cloudinary demo asset
  if (publicId.startsWith('http://') || publicId.startsWith('https://')) {
    if (!publicId.includes('cloudinary.com')) {
      return publicId;
    }
  }

  const parts: string[] = [];

  // Bounding box crop if specified
  if (options.crop && options.crop.w > 0 && options.crop.h > 0) {
    parts.push(`c_crop,x_${Math.round(options.crop.x)},y_${Math.round(options.crop.y)},w_${Math.round(options.crop.w)},h_${Math.round(options.crop.h)}`);
  } else if (options.maxDimension) {
    parts.push(`c_limit,w_${options.maxDimension}`);
  } else {
    parts.push('c_limit,w_900');
  }

  // Edge sharpening for faint textbook lines and organelle membranes
  if (options.sharpen ?? true) {
    parts.push('e_sharpen:80');
  }

  // Contrast enhancement to balance page curve shadows & scanner glare
  if (options.contrast ?? true) {
    parts.push('e_contrast');
  }

  // Format and quality negotiation
  const format = options.format || 'auto';
  const quality = options.quality || 'auto';
  parts.push(`f_${format}`);
  parts.push(`q_${quality}`);

  const transformString = parts.join(',');
  const cleanPublicId = publicId.replace(/^https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//, '');

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}/${cleanPublicId}`;
}

/**
 * Generates tightly-bounded diagram crop URL per the Cloudinary Media Pipeline skill
 */
export function getDiagramCropUrl(
  publicId: string,
  cloudName: string = 'demo',
  crop: DiagramCropOptions
): string {
  return `https://res.cloudinary.com/${cloudName}/image/upload/c_crop,x_${Math.round(crop.x)},y_${Math.round(crop.y)},w_${Math.round(crop.w)},h_${Math.round(crop.h)}/e_sharpen:80/f_auto,q_auto/${publicId}`;
}

/**
 * Generates compact diagram thumbnail URL
 */
export function getDiagramThumbnailUrl(
  publicId: string,
  cloudName: string = 'demo',
  width: number = 300,
  height: number = 200
): string {
  return `https://res.cloudinary.com/${cloudName}/image/upload/c_thumb,w_${width},h_${height},g_auto/f_auto,q_auto/${publicId}`;
}

/**
 * Fetches server-generated signature for client-side direct upload
 */
export async function getUploadSignature(folder: string = 'conceptlens/uploads'): Promise<UploadSignatureResponse> {
  const res = await fetch('/api/uploads/signature', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder })
  });

  const json = await res.json();
  if (!json.success || !json.data) {
    throw new Error(json.error || 'Failed to acquire upload signature from server');
  }

  return json.data;
}

/**
 * Executes direct upload to Cloudinary CDN using server signature
 * Falls back to server proxy on network/CORS error
 */
export async function uploadDiagramToCloudinary(
  file: File,
  status: CloudinaryStatus,
  onProgress?: (pct: number) => void
): Promise<CloudinaryUploadResult> {
  // Client-side pre-validation
  if (!status.supportedFormats.includes(file.type)) {
    throw new Error(`Unsupported format (${file.type}). Please upload PNG, JPG, WEBP, or PDF diagrams.`);
  }
  if (file.size > status.maxSizeBytes) {
    throw new Error(`Diagram exceeds ${(status.maxSizeBytes / (1024 * 1024)).toFixed(0)}MB limit. Please downsample.`);
  }

  if (!status.accountReachable || !status.cloudName) {
    const reason = status.accountError
      ? `Cloudinary account check failed: ${status.accountError}.`
      : 'Server credentials are not configured.';
    throw new Error(`Signed upload is not available. ${reason} The public demo/sample image is still being delivered.`);
  }

  onProgress?.(15);

  try {
    const signatureData = await getUploadSignature(status.folder);
    onProgress?.(35);

    let res: Response | null = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', signatureData.apiKey);
      formData.append('timestamp', signatureData.timestamp.toString());
      formData.append('signature', signatureData.signature);
      formData.append('folder', signatureData.folder);
      try {
        res = await fetch(
          `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/auto/upload`,
          { method: 'POST', body: formData }
        );
        if (res.ok) break;
      } catch (netErr) {
        if (attempt === 1) throw netErr;
        await new Promise((r) => setTimeout(r, 600));
      }
    }

    onProgress?.(80);

    if (res && res.ok) {
      const data = await res.json();
      const origBytes = file.size;
      const optBytes = data.bytes || origBytes;
      const savingsPercentage = origBytes > optBytes
        ? Math.round(((origBytes - optBytes) / origBytes) * 100)
        : undefined;

      const transformedUrl = buildCloudinaryUrl(data.public_id, signatureData.cloudName, {
        sharpen: true,
        contrast: true,
        maxDimension: 900
      });

      fetch('/api/uploads/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicId: data.public_id,
          originalFileName: file.name,
          fileType: file.type,
          bytes: data.bytes,
          secureUrl: data.secure_url
        })
      }).catch((e) => console.warn('[CloudinaryService] Record error:', e));

      onProgress?.(100);
      return {
        publicId: data.public_id,
        secureUrl: data.secure_url,
        format: data.format,
        bytes: data.bytes,
        width: data.width,
        height: data.height,
        transformedUrl,
        isLiveCloudinary: true,
        savingsPercentage
      };
    }
  } catch (directErr) {
    console.warn('[CloudinaryService] Direct signed upload failed, trying the server proxy.', directErr);
  }

  onProgress?.(50);
  const base64Data = await file.arrayBuffer().then((buffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return `data:${file.type};base64,${btoa(binary)}`;
  });
  onProgress?.(70);

  const res = await fetch('/api/uploads/direct', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileData: base64Data,
      originalFileName: file.name
    })
  });
  const json = await res.json();
  onProgress?.(100);

  if (!res.ok || !json.success || !json.data?.secureUrl) {
    throw new Error(json.error || 'Cloudinary did not confirm this upload.');
  }

  const origBytes = file.size;
  const optBytes = json.data.bytes || origBytes;
  return {
    publicId: json.data.publicId,
    secureUrl: json.data.secureUrl,
    format: json.data.format || 'png',
    bytes: json.data.bytes || file.size,
    width: json.data.width || 0,
    height: json.data.height || 0,
    transformedUrl: json.data.transformedPreviewUrl,
    isLiveCloudinary: true,
    savingsPercentage: origBytes > optBytes
      ? Math.round(((origBytes - optBytes) / origBytes) * 100)
      : undefined
  };
}
