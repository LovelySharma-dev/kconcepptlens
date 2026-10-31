import { z } from 'zod';

/**
 * Indian Sign Language (ISL) Verification Status
 * Distinguishes authentic, reviewed educational videos from unreviewed resources.
 */
export const ISLReviewStatusSchema = z.enum([
  'verified',
  'pending_review',
  'unreviewed'
]);
export type ISLReviewStatus = z.infer<typeof ISLReviewStatusSchema>;

/**
 * Metadata about the certified ISL educator or interpreter who reviewed the resource.
 */
export const ISLReviewerMetadataSchema = z.object({
  reviewerName: z.string().min(1, 'Reviewer name is required'),
  organization: z.string().min(1, 'Organization is required'),
  certification: z.string().optional(),
  reviewedAt: z.string() // ISO 8601 date string
});
export type ISLReviewerMetadata = z.infer<typeof ISLReviewerMetadataSchema>;

/**
 * Synchronized caption and transcript cue for ISL video playback.
 */
export const ISLCaptionCueSchema = z.object({
  id: z.string(),
  startTimeSec: z.number().min(0),
  endTimeSec: z.number().min(0),
  timeLabel: z.string(),
  text: z.string().min(1)
});
export type ISLCaptionCue = z.infer<typeof ISLCaptionCueSchema>;

/**
 * Structured lesson metadata schema for authentic ISL educational video integration.
 * Strictly requires verified provenance, licensing, and explicit ISL language tag.
 */
export const ISLLessonResourceSchema = z.object({
  lessonId: z.string().min(1, 'Lesson ID is required'),
  topic: z.string().min(1, 'Topic is required'),
  title: z.string().min(1, 'Title is required'),
  videoUrl: z
    .string()
    .url('Video URL must be a valid URL')
    .refine(
      (url) => url.startsWith('https://') || url.startsWith('data:video/'),
      'Video URL must use secure https or valid video data URI'
    ),
  posterUrl: z.string().url('Poster URL must be a valid URL').optional(),
  youtubeVideoId: z.string().optional(),
  embedUrl: z.string().optional(),
  language: z.literal('ISL'),
  description: z.string().min(1, 'Educational description is required'),
  transcript: z.string().optional(),
  cues: z.array(ISLCaptionCueSchema).optional(),
  source: z.string().min(1, 'Source repository is required'),
  attribution: z.string().min(1, 'Attribution statement is required'),
  license: z.string().min(1, 'License statement is required'),
  isCommercialAllowed: z.boolean().default(false),
  reviewStatus: ISLReviewStatusSchema,
  reviewerMetadata: ISLReviewerMetadataSchema.optional(),
  cloudinaryPublicId: z.string().optional()
});
export type ISLLessonResource = z.infer<typeof ISLLessonResourceSchema>;

/**
 * Availability state for ISL educational catalog.
 */
export const ISLAvailabilityStateSchema = z.enum([
  'verified_in_app',
  'official_external',
  'pending_review',
  'unavailable'
]);
export type ISLAvailabilityState = z.infer<typeof ISLAvailabilityStateSchema>;

/**
 * Educational curriculum category for ISL learning resources.
 */
export const ISLCategorySchema = z.enum([
  'biology',
  'computer_science',
  'physics',
  'mathematics',
  'general_science'
]);
export type ISLCategory = z.infer<typeof ISLCategorySchema>;

/**
 * Schema for maintainable, authentic ISL catalog entries.
 */
export const ISLCatalogEntrySchema = z.object({
  lessonId: z.string().min(1, 'Lesson ID is required'),
  concept: z.string().min(1, 'Concept name is required'),
  title: z.string().min(1, 'Title is required'),
  category: ISLCategorySchema,
  sourceOrganization: z.string().min(1, 'Source organization is required'),
  attribution: z.string().min(1, 'Attribution statement is required'),
  license: z.string().min(1, 'License statement is required'),
  externalUrl: z.string().url('External URL must be valid').optional(),
  mediaUrl: z.string().optional(),
  youtubeVideoId: z.string().optional(),
  embedUrl: z.string().optional(),
  captionExplanation: z.string().min(1, 'Caption explanation is required'),
  learningObjectives: z.array(z.string()).min(1, 'At least one learning objective is required'),
  reviewStatus: ISLReviewStatusSchema,
  availabilityState: ISLAvailabilityStateSchema,
  limitationsNote: z.string().min(1, 'Content limitations note is required'),
  reviewerMetadata: ISLReviewerMetadataSchema.optional()
});
export type ISLCatalogEntry = z.infer<typeof ISLCatalogEntrySchema>;
