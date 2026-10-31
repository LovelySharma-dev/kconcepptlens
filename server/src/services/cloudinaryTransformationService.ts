import {
  CloudinaryTransformationSpec,
  CloudinaryTransformationSpecSchema,
  CropMode,
  DeliveryFormat,
  DeliveryProfile,
  Gravity,
  QualitySpec,
  AIAction,
  ResourceType,
  isValidPublicId
} from '@conceptlens/shared';

export interface ParseOptions {
  lowDataMode?: boolean;
  cloudName?: string;
  resourceType?: ResourceType;
  isScientificDiagram?: boolean;
  allowGenerativeModification?: boolean;
}

export interface TransformExecutionResult {
  spec: CloudinaryTransformationSpec;
  transformedUrl: string;
  originalUrl: string;
  appliedTransforms: string[];
  bandwidthSavingEstimatePct: number;
  creditCostEstimate: number;
  accessibleAltText: string;
  isEducationalSafeguarded: boolean;
  previewNotice?: string;
}

/**
 * Sanitizes natural language prompt against script injection, HTML tags, or control characters.
 */
export function sanitizePrompt(rawPrompt: string): string {
  if (typeof rawPrompt !== 'string') return '';
  return rawPrompt
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // strip script tags and their inner content
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')   // strip style tags and their inner content
    .replace(/<[^>]*>/g, '') // strip any remaining HTML tags
    .replace(/\b(?:alert|eval|prompt|confirm)\s*\([^)]*\)/gi, '') // strip inline execution tokens
    .replace(/[;&$"`]/g, '') // strip shell/script meta characters
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500);
}

/**
 * Calculates estimated Cloudinary transformation credits consumed per use.
 * Ref: Cloudinary Transformation Counts & Costs documentation
 */
export function estimateCreditCost(action: AIAction, resourceType: ResourceType = 'image'): number {
  if (resourceType === 'video') return 2; // Basic video stream transformation
  switch (action) {
    case 'auto_enhance': return 100;
    case 'gen_restore': return 100;
    case 'background_removal': return 75;
    case 'gen_replace': return 120;
    case 'gen_remove': return 50;
    case 'gen_fill': return 50;
    case 'upscale': return 25;
    default: return 1; // Standard 1 credit transformation (resize/crop/format)
  }
}

/**
 * Deterministic natural-language parser for Cloudinary media transformations.
 * Handles educational workflows (low-data, lesson card, square crop, diagram clarity, AI, video).
 */
export function parseDeterministicInstruction(
  rawPrompt: string,
  assetId: string,
  options?: ParseOptions
): CloudinaryTransformationSpec {
  if (!isValidPublicId(assetId)) {
    throw new Error(`Invalid asset ID '${assetId}'. Public IDs cannot contain directory traversal or protocol markers.`);
  }

  const prompt = sanitizePrompt(rawPrompt);
  const lower = prompt.toLowerCase();
  const resourceType: ResourceType = options?.resourceType || (lower.includes('video') ? 'video' : 'image');
  const isScientificDiagram = Boolean(
    options?.isScientificDiagram ||
    lower.includes('cell') ||
    lower.includes('heart') ||
    lower.includes('neuron') ||
    lower.includes('dna') ||
    lower.includes('diagram') ||
    lower.includes('textbook') ||
    assetId.includes('cell') ||
    assetId.includes('heart')
  );

  let crop: CropMode = 'limit';
  let gravity: Gravity | undefined = undefined;
  let width: number | undefined = undefined;
  let height: number | undefined = undefined;
  let aspectRatio: string | undefined = undefined;
  let quality: QualitySpec = 'auto';
  let format: DeliveryFormat = resourceType === 'video' ? 'auto:video' : 'auto';
  let deliveryProfile: DeliveryProfile = 'default';
  let aiAction: AIAction = 'none';
  let aiPrompt: string | undefined = undefined;
  let replaceFrom: string | undefined = undefined;
  let replaceTo: string | undefined = undefined;
  let duration: number | undefined = undefined;
  let startOffset: number | undefined = undefined;
  let isLoop: boolean | undefined = undefined;
  let audio: boolean = true;
  const effects: string[] = [];
  let explanation = 'Applied standard auto-format and auto-quality optimization.';

  // -------------------------------------------------------------------------
  // 1. VIDEO WORKFLOWS
  // -------------------------------------------------------------------------
  if (resourceType === 'video') {
    if (lower.includes('animated') || lower.includes('webp') || lower.includes('gif')) {
      deliveryProfile = 'animated_preview';
      format = 'auto:animated';
      duration = 5;
      isLoop = true;
      explanation = 'Converted first 5 seconds into looping animated WebP for lightweight visual preview.';
    } else if (lower.includes('mute') || lower.includes('silent') || lower.includes('autoplay')) {
      deliveryProfile = 'video_clip';
      audio = false;
      explanation = 'Stripped audio track for silent accessible background autoplay.';
    } else if (lower.includes('5s') || lower.includes('preview') || lower.includes('trim') || lower.includes('short')) {
      deliveryProfile = 'video_preview';
      startOffset = 0;
      duration = 5;
      explanation = 'Trimmed to a 5-second responsive video preview with automatic codec optimization.';
    } else {
      deliveryProfile = 'video_clip';
      height = 720;
      explanation = 'Optimized video for 720p HD streaming with automatic video codec selection (vc_auto).';
    }
  }

  // -------------------------------------------------------------------------
  // 2. AI OPERATIONS (With Educational Safeguards)
  // -------------------------------------------------------------------------
  else if (lower.includes('remove background') || lower.includes('transparent background') || lower.includes('cutout')) {
    aiAction = 'background_removal';
    format = 'png';
    explanation = 'Applied AI background removal to isolate foreground subject onto a transparent PNG canvas.';
  } else if (lower.includes('auto enhance') || lower.includes('ai enhance') || lower.includes('enhance lighting')) {
    aiAction = 'auto_enhance';
    effects.push('auto_enhance');
    explanation = 'Applied Cloudinary AI Auto-Enhance for color correction and dynamic range balance.';
  } else if (lower.includes('gen fill') || lower.includes('generative fill') || lower.includes('extend background')) {
    aiAction = 'gen_fill';
    crop = 'pad';
    aspectRatio = '16:9';
    width = 1200;
    explanation = 'Extended canvas to 16:9 widescreen using Cloudinary Generative Fill.';
  } else if (lower.includes('remove') && (lower.includes('object') || lower.includes('label') || lower.includes('watermark'))) {
    aiAction = 'gen_remove';
    const removeMatch = lower.match(/remove\s+(?:the\s+)?([a-z0-9\s_-]+?)(?:\s+from|\s+using|$)/i);
    aiPrompt = removeMatch ? removeMatch[1].trim() : 'unwanted object';
    explanation = `Applied Generative Remove to seamlessly erase "${aiPrompt}" using surrounding background context.`;
  } else if (lower.includes('restore') || lower.includes('old photo') || lower.includes('de-noise')) {
    aiAction = 'gen_restore';
    effects.push('gen_restore');
    explanation = 'Applied Generative Restore to remove compression artifacts and recover fine detail.';
  } else if (lower.includes('upscale') || lower.includes('enlarge') || lower.includes('super res')) {
    aiAction = 'upscale';
    effects.push('upscale');
    width = 2000;
    explanation = 'Applied AI Upscaling to enlarge diagram without pixelation.';
  }

  // -------------------------------------------------------------------------
  // 3. STANDARD DELIVERY PROFILES & WORKFLOWS
  // -------------------------------------------------------------------------
  else if (
    options?.lowDataMode ||
    lower.includes('low-data') ||
    lower.includes('low data') ||
    lower.includes('save data') ||
    lower.includes('data saver') ||
    lower.includes('bandwidth') ||
    lower.includes('2g') ||
    lower.includes('offline')
  ) {
    crop = 'limit';
    width = 480;
    quality = 'auto:eco';
    format = 'auto';
    deliveryProfile = 'low_data';
    explanation = 'Reduced resolution to 480px max and enabled eco-quality compression to preserve bandwidth on slow or metered connections.';
  } else if (
    lower.includes('square') ||
    lower.includes('1:1') ||
    lower.includes('avatar') ||
    lower.includes('profile') ||
    lower.includes('tile')
  ) {
    crop = 'fill';
    gravity = lower.includes('face') ? 'face' : 'auto:subject';
    width = 400;
    height = 400;
    aspectRatio = '1:1';
    deliveryProfile = 'square_thumbnail';
    explanation = 'Cropped to a 1:1 square centered on the subject with fill mode and smart content-aware gravity.';
  } else if (
    lower.includes('lesson card') ||
    lower.includes('card') ||
    lower.includes('banner') ||
    lower.includes('thumbnail') ||
    lower.includes('16:9') ||
    lower.includes('landscape')
  ) {
    crop = 'fill';
    gravity = 'auto';
    width = 640;
    height = 360;
    aspectRatio = '16:9';
    deliveryProfile = 'lesson_card';
    explanation = 'Adjusted to 16:9 widescreen ratio (640×360) ideal for lesson header cards and previews.';
  } else if (
    lower.includes('diagram') ||
    lower.includes('textbook') ||
    lower.includes('sharpen') ||
    lower.includes('contrast') ||
    lower.includes('labels') ||
    lower.includes('clarity') ||
    lower.includes('clearer')
  ) {
    crop = 'limit';
    width = 1200;
    effects.push('sharpen:80', 'contrast');
    quality = 'auto:good';
    deliveryProfile = 'diagram_hq';
    explanation = 'Enhanced fine diagram lines and label readability using edge sharpening and contrast balancing.';
  } else if (lower.includes('mobile') || lower.includes('phone') || lower.includes('portrait')) {
    crop = 'limit';
    width = 600;
    deliveryProfile = 'mobile';
    explanation = 'Optimized for mobile viewports up to 600px width with automatic quality delivery.';
  }

  // -------------------------------------------------------------------------
  // 4. DIMENSIONS & EXTRACTED TOKENS
  // -------------------------------------------------------------------------
  const dimensionMatch = lower.match(/(\d{2,4})\s*(?:x|×)\s*(\d{2,4})/);
  if (dimensionMatch) {
    const w = parseInt(dimensionMatch[1], 10);
    const h = parseInt(dimensionMatch[2], 10);
    if (w >= 16 && w <= 4000) width = w;
    if (h >= 16 && h <= 4000) height = h;
    if (!dimensionMatch[0].includes('square')) crop = 'fit';
  } else {
    const widthMatch = lower.match(/(?:\bwidth\b|\bw\b|w_)\s*(?:=|:|\s)?\s*(\d{2,4})/);
    if (widthMatch) {
      const w = parseInt(widthMatch[1], 10);
      if (w >= 16 && w <= 4000) width = w;
    }
    const heightMatch = lower.match(/(?:\bheight\b|\bh\b|h_)\s*(?:=|:|\s)?\s*(\d{2,4})/);
    if (heightMatch) {
      const h = parseInt(heightMatch[1], 10);
      if (h >= 16 && h <= 4000) height = h;
    }
  }

  // Gravity overrides
  if (lower.includes('face')) gravity = 'face';
  else if (lower.includes('center')) gravity = 'center';
  else if (lower.includes('subject')) gravity = 'auto:subject';

  // Effects overrides
  if ((lower.includes('grayscale') || lower.includes('black and white') || lower.includes('b&w')) && !effects.includes('grayscale')) {
    effects.push('grayscale');
  }
  if (lower.includes('sepia') && !effects.includes('sepia')) {
    effects.push('sepia');
  }
  if (lower.includes('blur') && !effects.includes('blur:200')) {
    effects.push('blur:200');
  }

  // Format overrides
  if (lower.includes('avif') && resourceType === 'image') format = 'avif';
  else if (lower.includes('webp') && resourceType === 'image') format = 'webp';
  else if (lower.includes('png') && resourceType === 'image') format = 'png';
  else if (lower.includes('jpg') && resourceType === 'image') format = 'jpg';

  // Low-Data Mode Invariant Enforcement: Resolution must be clamped
  if (options?.lowDataMode || deliveryProfile === 'low_data') {
    if (width !== undefined) width = Math.min(width, 480);
    else width = 480;
    if (height !== undefined) height = Math.min(height, 480);
    quality = 'auto:eco';
    crop = 'limit';
    deliveryProfile = 'low_data';
  }

  // Generate accessible alt text description
  let altText = `Optimized visual of ${assetId}`;
  if (deliveryProfile === 'low_data') altText = `Low-bandwidth diagram showing essential structures of ${assetId}`;
  else if (deliveryProfile === 'lesson_card') altText = `Image of ${assetId} with lesson card layout`;
  else if (deliveryProfile === 'square_thumbnail') altText = `Square detail thumbnail of ${assetId}`;
  else if (aiAction === 'background_removal') altText = `Transparent subject cutout of ${assetId}`;
  else if (resourceType === 'video') altText = `Educational video demonstrating ${assetId}`;

  const creditCost = estimateCreditCost(aiAction, resourceType);

  const spec: CloudinaryTransformationSpec = {
    assetId,
    prompt: prompt || 'Standard diagram optimization',
    resourceType,
    width,
    height,
    aspectRatio,
    crop,
    gravity,
    quality,
    format,
    deliveryProfile,
    effects,
    aiAction,
    aiPrompt,
    replaceFrom,
    replaceTo,
    duration,
    startOffset,
    isLoop,
    audio,
    isScientificDiagram,
    creditCostEstimate: creditCost,
    altText,
    explanation
  };

  return CloudinaryTransformationSpecSchema.parse(spec);
}

/**
 * Builds standard Cloudinary delivery URL from a validated transformation spec.
 * CRITICAL RULE: Emits /f_auto/q_auto as separate slash-delimited segments!
 */
export function buildTransformationUrl(
  spec: CloudinaryTransformationSpec,
  cloudName: string = 'demo'
): { url: string; appliedTransforms: string[] } {
  const safeCloud = cloudName && /^[A-Za-z0-9_-]+$/.test(cloudName) ? cloudName : 'demo';
  const applied: string[] = [];
  const isVideo = spec.resourceType === 'video';

  // Step 1: Video Trimming, Audio, and Codec options
  if (isVideo) {
    const videoParts: string[] = [];
    if (spec.startOffset !== undefined) videoParts.push(`so_${spec.startOffset}`);
    if (spec.duration !== undefined) videoParts.push(`du_${spec.duration}`);
    if (!spec.audio) videoParts.push('ac_none');
    videoParts.push('vc_auto');
    if (spec.isLoop) {
      if (spec.format === 'auto:animated') {
        videoParts.push('e_loop');
      } else {
        videoParts.push('e_loop:2');
      }
    }
    if (videoParts.length > 0) applied.push(videoParts.join(','));
  }

  // Step 2: Sizing, Aspect Ratio, Crop, and Gravity
  const sizeParts: string[] = [];
  if (spec.crop) sizeParts.push(`c_${spec.crop}`);
  if (spec.aspectRatio) sizeParts.push(`ar_${spec.aspectRatio}`);
  if (spec.gravity) sizeParts.push(`g_${spec.gravity}`);
  if (spec.width) sizeParts.push(`w_${spec.width}`);
  if (spec.height) sizeParts.push(`h_${spec.height}`);
  if (spec.aiAction === 'gen_fill') sizeParts.push('b_gen_fill');
  if (sizeParts.length > 0) {
    applied.push(sizeParts.join(','));
  }

  // Step 3: AI Operations & Visual Effects
  if (spec.aiAction === 'background_removal') {
    applied.push('e_background_removal');
  } else if (spec.aiAction === 'auto_enhance') {
    applied.push('e_auto_enhance');
  } else if (spec.aiAction === 'gen_restore') {
    applied.push('e_gen_restore');
  } else if (spec.aiAction === 'upscale') {
    applied.push('e_upscale');
  } else if (spec.aiAction === 'gen_remove' && spec.aiPrompt) {
    applied.push(`e_gen_remove:prompt_${encodeURIComponent(spec.aiPrompt)}`);
  } else if (spec.aiAction === 'gen_replace' && spec.replaceFrom && spec.replaceTo) {
    applied.push(`e_gen_replace:from_${encodeURIComponent(spec.replaceFrom)};to_${encodeURIComponent(spec.replaceTo)}`);
  }

  if (spec.effects && spec.effects.length > 0) {
    for (const eff of spec.effects) {
      if (eff !== 'auto_enhance' && eff !== 'gen_restore' && eff !== 'upscale') {
        const effectToken = eff.startsWith('e_') ? eff : `e_${eff}`;
        applied.push(effectToken);
      }
    }
  }

  // Step 4: Format and Quality as SEPARATE slash-delimited segments!
  // Example: .../f_auto/q_auto
  const formatToken = `f_${spec.format || (isVideo ? 'auto:video' : 'auto')}`;
  const qualityToken = `q_${spec.quality || 'auto'}`;
  applied.push(formatToken);
  applied.push(qualityToken);

  const transformPath = applied.join('/');
  const cleanAssetId = spec.assetId.replace(/^\/+/, '');
  const mediaType = isVideo ? 'video' : 'image';
  const url = `https://res.cloudinary.com/${safeCloud}/${mediaType}/upload/${transformPath}/${cleanAssetId}`;

  return { url, appliedTransforms: applied };
}

/**
 * Estimates bandwidth savings percentage based on delivery profile and transformation flags.
 * (Clearly labeled as an estimated heuristic).
 */
export function estimateBandwidthSavings(spec: CloudinaryTransformationSpec): number {
  if (spec.deliveryProfile === 'low_data' || spec.quality === 'auto:eco') {
    return 72; // ~72% estimated savings with eco compression and max 480px width
  }
  if (spec.deliveryProfile === 'square_thumbnail') {
    return 65; // ~65% estimated savings with cropped dimensions
  }
  if (spec.deliveryProfile === 'lesson_card') {
    return 55; // ~55% estimated savings
  }
  if (spec.deliveryProfile === 'diagram_hq') {
    return 30; // ~30% estimated savings with high-fidelity visual retention
  }
  return 45; // ~45% standard estimated savings with f_auto/q_auto over raw uncompressed assets
}

/**
 * Main transformation engine execution handler.
 */
export async function executeTransformationInstruction(
  rawPrompt: string,
  assetId: string,
  options?: ParseOptions
): Promise<TransformExecutionResult> {
  const spec = parseDeterministicInstruction(rawPrompt, assetId, options);
  const cloudName = options?.cloudName || process.env.CLOUDINARY_CLOUD_NAME || 'demo';
  const { url: transformedUrl, appliedTransforms } = buildTransformationUrl(spec, cloudName);
  const mediaType = spec.resourceType === 'video' ? 'video' : 'image';
  const originalUrl = `https://res.cloudinary.com/${cloudName}/${mediaType}/upload/${spec.assetId}`;
  const bandwidthSavingEstimatePct = estimateBandwidthSavings(spec);
  const creditCostEstimate = spec.creditCostEstimate || 1;

  // Educational Safeguard Notice
  let isEducationalSafeguarded = false;
  let previewNotice: string | undefined = undefined;

  if (spec.isScientificDiagram && (spec.aiAction === 'gen_remove' || spec.aiAction === 'gen_replace' || spec.aiAction === 'gen_fill')) {
    isEducationalSafeguarded = true;
    previewNotice = 'Educational Safeguard: This is a canonical scientific diagram. Generative modifications may alter anatomical structures or biological accuracy. Preview carefully before applying.';
  }

  return {
    spec,
    transformedUrl,
    originalUrl,
    appliedTransforms,
    bandwidthSavingEstimatePct,
    creditCostEstimate,
    accessibleAltText: spec.altText || `Optimized visual of ${assetId}`,
    isEducationalSafeguarded,
    previewNotice
  };
}
