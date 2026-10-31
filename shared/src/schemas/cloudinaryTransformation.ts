import { z } from 'zod';

export const SafePublicIdRegex = /^[A-Za-z0-9_./-]+$/;

export function isValidPublicId(publicId: unknown): publicId is string {
  return (
    typeof publicId === 'string' &&
    publicId.length > 0 &&
    publicId.length <= 240 &&
    !publicId.includes('..') &&
    !publicId.includes('://') &&
    !publicId.startsWith('/') &&
    SafePublicIdRegex.test(publicId)
  );
}

export const ResourceTypeEnum = z.enum(['image', 'video']);
export type ResourceType = z.infer<typeof ResourceTypeEnum>;

export const CropModeEnum = z.enum([
  'scale',
  'fill',
  'fit',
  'limit',
  'pad',
  'thumb',
  'auto',
  'crop'
]);
export type CropMode = z.infer<typeof CropModeEnum>;

export const GravityEnum = z.enum([
  'auto',
  'auto:subject',
  'face',
  'center',
  'north',
  'south',
  'east',
  'west'
]);
export type Gravity = z.infer<typeof GravityEnum>;

export const FormatEnum = z.enum(['auto', 'png', 'jpg', 'webp', 'avif', 'auto:video', 'mp4', 'auto:animated']);
export type DeliveryFormat = z.infer<typeof FormatEnum>;

export const DeliveryProfileEnum = z.enum([
  'default',
  'mobile',
  'low_data',
  'lesson_card',
  'diagram_hq',
  'square_thumbnail',
  'video_preview',
  'video_clip',
  'animated_preview'
]);
export type DeliveryProfile = z.infer<typeof DeliveryProfileEnum>;

export const QualitySpecSchema = z.union([
  z.enum(['auto', 'auto:best', 'auto:good', 'auto:eco', 'auto:low']),
  z.number().int().min(1).max(100)
]);
export type QualitySpec = z.infer<typeof QualitySpecSchema>;

export const AIActionEnum = z.enum([
  'none',
  'auto_enhance',
  'background_removal',
  'gen_fill',
  'gen_remove',
  'gen_replace',
  'gen_restore',
  'upscale'
]);
export type AIAction = z.infer<typeof AIActionEnum>;

/**
 * Validated Cloudinary Transformation Specification
 */
export const CloudinaryTransformationSpecSchema = z.object({
  assetId: z
    .string()
    .min(1)
    .max(240)
    .refine(isValidPublicId, {
      message: 'Asset ID must be a valid Cloudinary public ID without directory traversal or protocol markers.'
    }),
  prompt: z.string().min(1).max(500),
  resourceType: ResourceTypeEnum.optional().default('image'),
  width: z.number().int().min(16).max(4000).optional(),
  height: z.number().int().min(16).max(4000).optional(),
  aspectRatio: z.string().optional(),
  crop: CropModeEnum.optional().default('limit'),
  gravity: GravityEnum.optional(),
  quality: QualitySpecSchema.optional().default('auto'),
  format: FormatEnum.optional().default('auto'),
  deliveryProfile: DeliveryProfileEnum.optional().default('default'),
  effects: z.array(z.string().regex(/^[a-z0-9_:; -]+$/i, { message: 'Invalid effect token' })).optional().default([]),
  aiAction: AIActionEnum.optional().default('none'),
  aiPrompt: z.string().max(200).optional(),
  replaceFrom: z.string().max(100).optional(),
  replaceTo: z.string().max(100).optional(),
  // Video-specific properties
  duration: z.number().min(0.5).max(600).optional(),
  startOffset: z.number().min(0).max(600).optional(),
  isLoop: z.boolean().optional(),
  audio: z.boolean().optional().default(true),
  // Educational safety and metadata
  isScientificDiagram: z.boolean().optional().default(false),
  creditCostEstimate: z.number().int().min(1).max(300).optional().default(1),
  altText: z.string().max(280).optional(),
  explanation: z.string().max(400).optional()
});

export type CloudinaryTransformationSpec = z.infer<typeof CloudinaryTransformationSpecSchema>;

/**
 * Natural language transformation request
 */
export const NaturalLanguageTransformRequestSchema = z.object({
  prompt: z.string().min(1, 'Please enter a transformation instruction').max(500),
  assetId: z
    .string()
    .min(1)
    .max(240)
    .refine(isValidPublicId, {
      message: 'Asset ID contains illegal characters or paths.'
    }),
  resourceType: ResourceTypeEnum.optional().default('image'),
  cloudName: z.string().regex(/^[A-Za-z0-9_-]+$/).optional(),
  lowDataMode: z.boolean().optional().default(false),
  isScientificDiagram: z.boolean().optional().default(false),
  allowGenerativeModification: z.boolean().optional().default(false)
});

export type NaturalLanguageTransformRequest = z.infer<typeof NaturalLanguageTransformRequestSchema>;

/**
 * Structured response for transformation execution
 */
export const NaturalLanguageTransformResponseDataSchema = z.object({
  spec: CloudinaryTransformationSpecSchema,
  transformedUrl: z.string().url(),
  originalUrl: z.string().url(),
  appliedTransforms: z.array(z.string()),
  bandwidthSavingEstimatePct: z.number().min(0).max(100).optional(),
  creditCostEstimate: z.number().int().min(1).max(300).optional().default(1),
  accessibleAltText: z.string().optional(),
  isEducationalSafeguarded: z.boolean().optional().default(false),
  previewNotice: z.string().optional()
});

export type NaturalLanguageTransformResponseData = z.infer<typeof NaturalLanguageTransformResponseDataSchema>;
