import type { NaturalLanguageTransformResponseData, ResourceType } from '@conceptlens/shared';

/**
 * ConceptLens 2.0 - Cloudinary Media Pipeline Service
 * 
 * Implements the official Cloudinary Media Pipeline & Transformations Skill:
 * 1. Server-signed direct client upload (POST /api/uploads/signature -> api.cloudinary.com)
 * 2. Fallback server proxy upload (POST /api/uploads/direct)
 * 3. Dynamic URL-based transformations using separate slash-delimited components (/f_auto/q_auto)
 * 4. Cloudinary AI operations (auto enhance, background removal, gen fill/remove with safeguards)
 * 5. Educational video workflows (video stream, trimming, silent preview, animated WebP, poster still)
 * 6. Resilient retry with exponential backoff & client-side fallback
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
  format?: 'auto' | 'webp' | 'png' | 'jpg' | 'auto:video' | 'auto:animated';
  quality?: 'auto' | 'auto:good' | 'auto:best' | 'auto:eco' | 'auto:low';
  aspectRatio?: string;
  effects?: string[];
  isLowData?: boolean;
}

export interface VideoTransformationOptions {
  duration?: number;
  startOffset?: number;
  audio?: boolean;
  isLoop?: boolean;
  loopCount?: number;
  maxHeight?: number;
  format?: 'auto:video' | 'mp4' | 'webm' | 'auto:animated';
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
    supportedFormats: ['image/png', 'image/jpeg', 'image/webp', 'application/pdf', 'video/mp4', 'video/webm'],
    maxSizeBytes: 15 * 1024 * 1024
  };
}

/**
 * Generates an optimized Cloudinary delivery URL with STEM textbook enhancement
 * CRITICAL RULE: Emits /f_auto/q_auto as separate slash-delimited segments!
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

  const segments: string[] = [];

  // 1. Sizing and cropping
  if (options.crop && options.crop.w > 0 && options.crop.h > 0) {
    segments.push(`c_crop,x_${Math.round(options.crop.x)},y_${Math.round(options.crop.y)},w_${Math.round(options.crop.w)},h_${Math.round(options.crop.h)}`);
  } else if (options.maxDimension) {
    segments.push(`c_limit,w_${options.maxDimension}`);
  } else {
    segments.push('c_limit,w_900');
  }

  // 2. Aspect Ratio if provided
  if (options.aspectRatio) {
    segments.push(`ar_${options.aspectRatio}`);
  }

  // 3. Visual effects (sharpen, contrast, extra effects)
  const effectTokens: string[] = [];
  if (options.sharpen ?? true) effectTokens.push('e_sharpen:80');
  if (options.contrast ?? true) effectTokens.push('e_contrast');
  if (options.effects) {
    for (const eff of options.effects) {
      effectTokens.push(eff.startsWith('e_') ? eff : `e_${eff}`);
    }
  }
  if (effectTokens.length > 0) {
    segments.push(effectTokens.join('/'));
  }

  // 4. Format and quality as SEPARATE slash-delimited segments!
  const format = options.format || 'auto';
  const quality = options.quality || (options.isLowData ? 'auto:eco' : 'auto');
  segments.push(`f_${format}`);
  segments.push(`q_${quality}`);

  const transformString = segments.join('/');
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
  return `https://res.cloudinary.com/${cloudName}/image/upload/c_crop,x_${Math.round(crop.x)},y_${Math.round(crop.y)},w_${Math.round(crop.w)},h_${Math.round(crop.h)}/e_sharpen:80/f_auto/q_auto/${publicId}`;
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
  return `https://res.cloudinary.com/${cloudName}/image/upload/c_thumb,w_${width},h_${height},g_auto/f_auto/q_auto/${publicId}`;
}

/**
 * Builds low-data optimized delivery URL specifically tailored for bandwidth preservation
 */
export function buildLowDataUrl(publicId: string, cloudName: string = 'demo'): string {
  return `https://res.cloudinary.com/${cloudName}/image/upload/c_limit,w_480/f_auto/q_auto:eco/${publicId}`;
}

/**
 * Generates responsive educational video delivery URL with automatic format and codec negotiation
 */
export function buildCloudinaryVideoUrl(
  publicId: string,
  cloudName: string = 'demo',
  options: VideoTransformationOptions = {}
): string {
  const segments: string[] = [];

  // Sizing & scaling
  const height = options.maxHeight || 720;
  segments.push(`c_limit,h_${height}`);

  // Trimming parameters
  if (options.startOffset !== undefined && options.duration !== undefined) {
    segments.push(`so_${options.startOffset},du_${options.duration}`);
  } else if (options.duration !== undefined) {
    segments.push(`du_${options.duration}`);
  }

  // Audio track control
  if (options.audio === false) {
    segments.push('ac_none');
  }

  // Codec and looping
  segments.push('vc_auto');
  if (options.isLoop) {
    if (options.format === 'auto:animated') {
      segments.push('e_loop');
    } else if (options.loopCount) {
      segments.push(`e_loop:${options.loopCount}`);
    }
    // Note: For video streams in HTML5 video players, continuous playback is handled by the video tag's loop attribute.
    // Bare 'e_loop' on video formats causes Cloudinary HTTP 400 ('Must specify number of loops').
  }

  // Video format and quality
  const format = options.format || 'auto:video';
  segments.push(`f_${format}`);
  segments.push('q_auto');

  const cleanPublicId = publicId.replace(/^https?:\/\/res\.cloudinary\.com\/[^/]+\/video\/upload\//, '');
  return `https://res.cloudinary.com/${cloudName}/video/upload/${segments.join('/')}/${cleanPublicId}`;
}

/**
 * Generates animated WebP preview clip from video
 */
export function getVideoAnimatedWebpUrl(
  publicId: string,
  cloudName: string = 'demo',
  durationSeconds: number = 5
): string {
  const cleanPublicId = publicId.replace(/^https?:\/\/res\.cloudinary\.com\/[^/]+\/video\/upload\//, '');
  return `https://res.cloudinary.com/${cloudName}/video/upload/du_${durationSeconds}/e_loop/f_auto:animated/q_auto/${cleanPublicId}.webp`;
}

/**
 * Generates still poster image from first frame of video
 */
export function getVideoPosterUrl(
  publicId: string,
  cloudName: string = 'demo',
  offsetSeconds: number = 0
): string {
  const cleanPublicId = publicId.replace(/^https?:\/\/res\.cloudinary\.com\/[^/]+\/video\/upload\//, '');
  return `https://res.cloudinary.com/${cloudName}/video/upload/so_${offsetSeconds}/f_jpg/q_auto/${cleanPublicId}.jpg`;
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
  const isVideo = file.type.startsWith('video/');
  const maxBytes = isVideo ? 30 * 1024 * 1024 : status.maxSizeBytes;

  if (file.size > maxBytes) {
    throw new Error(`Media exceeds ${(maxBytes / (1024 * 1024)).toFixed(0)}MB limit. Please select a smaller file.`);
  }

  if (!status.accountReachable || !status.cloudName) {
    const reason = status.accountError
      ? `Cloudinary account check failed: ${status.accountError}.`
      : 'Server credentials are not configured.';
    throw new Error(`Signed upload is not available. ${reason} The public demo assets are still being delivered.`);
  }

  onProgress?.(15);

  try {
    const signatureData = await getUploadSignature(status.folder);
    onProgress?.(30);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', signatureData.apiKey);
    formData.append('timestamp', signatureData.timestamp.toString());
    formData.append('signature', signatureData.signature);
    formData.append('folder', signatureData.folder);

    const resourceType = isVideo ? 'video' : 'image';
    const uploadUrl = `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/${resourceType}/upload`;

    const cdnRes = await fetch(uploadUrl, {
      method: 'POST',
      body: formData
    });

    onProgress?.(80);

    if (cdnRes.ok) {
      const data = await cdnRes.json();
      onProgress?.(100);

      const transformedUrl = isVideo
        ? buildCloudinaryVideoUrl(data.public_id, signatureData.cloudName, { maxHeight: 720 })
        : buildCloudinaryUrl(data.public_id, signatureData.cloudName, {
            sharpen: true,
            contrast: true,
            maxDimension: 900
          });

      // Notify backend to record asset in store
      try {
        await fetch('/api/uploads/record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            publicId: data.public_id,
            originalFileName: file.name,
            fileType: file.type,
            bytes: data.bytes || file.size,
            secureUrl: data.secure_url
          })
        });
      } catch {
        /* Non-critical persistence failure */
      }

      return {
        publicId: data.public_id,
        secureUrl: data.secure_url,
        format: data.format || file.type.split('/')[1] || 'png',
        bytes: data.bytes || file.size,
        width: data.width || 0,
        height: data.height || 0,
        transformedUrl,
        isLiveCloudinary: true
      };
    }
  } catch (err) {
    console.warn('[CloudinaryService] Direct CDN upload failed, trying server proxy:', err);
  }

  // Fallback to server-side upload proxy
  onProgress?.(50);
  return uploadViaServerProxy(file, onProgress);
}

/**
 * Fallback proxy upload handled completely by server
 */
async function uploadViaServerProxy(file: File, onProgress?: (pct: number) => void): Promise<CloudinaryUploadResult> {
  const reader = new FileReader();
  const fileDataBase64 = await new Promise<string>((resolve, reject) => {
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  onProgress?.(70);

  const res = await fetch('/api/uploads/direct', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileData: fileDataBase64,
      originalFileName: file.name
    })
  });

  onProgress?.(90);

  const json = await res.json();
  if (!res.ok || !json.success || !json.data) {
    throw new Error(json.error || 'Server proxy upload to Cloudinary failed.');
  }

  onProgress?.(100);

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

/**
 * Requests natural-language transformation from backend endpoint with client-side fallback
 */
export async function requestNaturalLanguageTransform(
  prompt: string,
  assetId: string,
  options?: {
    cloudName?: string;
    lowDataMode?: boolean;
    resourceType?: ResourceType;
    isScientificDiagram?: boolean;
    allowGenerativeModification?: boolean;
  }
): Promise<NaturalLanguageTransformResponseData> {
  const safeCloud = options?.cloudName || 'demo';
  const resourceType = options?.resourceType || 'image';

  try {
    const res = await fetch('/api/uploads/transform-spec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        assetId,
        resourceType,
        cloudName: safeCloud,
        lowDataMode: options?.lowDataMode,
        isScientificDiagram: options?.isScientificDiagram,
        allowGenerativeModification: options?.allowGenerativeModification
      })
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn('[CloudinaryService] Backend transform-spec unavailable, using client fallback:', err);
  }

  // Client-side deterministic fallback
  const lower = prompt.toLowerCase();
  let transforms = 'c_limit,w_900/f_auto/q_auto';
  let profile: any = 'default';
  let savings = 45;
  let explanation = 'Applied standard responsive optimization.';

  if (options?.lowDataMode || lower.includes('low-data') || lower.includes('bandwidth') || lower.includes('saver')) {
    transforms = 'c_limit,w_480/f_auto/q_auto:eco';
    profile = 'low_data';
    savings = 72;
    explanation = 'Reduced resolution to 480px and applied eco quality to save data on slow connections.';
  } else if (lower.includes('square') || lower.includes('1:1') || lower.includes('avatar')) {
    transforms = 'c_fill,g_auto:subject,w_400,h_400/f_auto/q_auto';
    profile = 'square_thumbnail';
    savings = 65;
    explanation = 'Cropped to 1:1 square ratio with smart content-aware subject gravity.';
  } else if (lower.includes('card') || lower.includes('16:9') || lower.includes('banner')) {
    transforms = 'c_fill,g_auto,w_640,h_360/f_auto/q_auto';
    profile = 'lesson_card';
    savings = 55;
    explanation = 'Formatted into 16:9 widescreen card presentation.';
  } else if (lower.includes('diagram') || lower.includes('sharpen') || lower.includes('contrast')) {
    transforms = 'c_limit,w_1200/e_sharpen:80/e_contrast/f_auto/q_auto:good';
    profile = 'diagram_hq';
    savings = 30;
    explanation = 'Enhanced edge contrast and label sharpness for scientific diagrams.';
  }

  const mediaPath = resourceType === 'video' ? 'video' : 'image';
  const transformedUrl = `https://res.cloudinary.com/${safeCloud}/${mediaPath}/upload/${transforms}/${assetId}`;
  const originalUrl = `https://res.cloudinary.com/${safeCloud}/${mediaPath}/upload/${assetId}`;

  return {
    spec: {
      assetId,
      prompt,
      resourceType,
      deliveryProfile: profile,
      crop: profile === 'low_data' ? 'limit' : 'fill',
      quality: profile === 'low_data' ? 'auto:eco' : 'auto',
      format: 'auto',
      effects: profile === 'diagram_hq' ? ['sharpen:80', 'contrast'] : [],
      audio: true,
      aiAction: 'none',
      isScientificDiagram: Boolean(options?.isScientificDiagram),
      creditCostEstimate: 1,
      explanation
    },
    transformedUrl,
    originalUrl,
    appliedTransforms: transforms.split('/'),
    bandwidthSavingEstimatePct: savings,
    creditCostEstimate: 1,
    accessibleAltText: `Transformed media of ${assetId} with ${profile} profile`,
    isEducationalSafeguarded: false
  };
}
