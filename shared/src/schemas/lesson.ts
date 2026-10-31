import { z } from 'zod';
import { LinkedListGraphSchema, ExecutionStepSchema } from './diagram';

export const ISLResourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  videoUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  vttCaptionsUrl: z.string().url(),
  transcriptText: z.string(),
  verifiedByExpert: z.boolean().default(true),
  expertName: z.string().optional()
});

export type ISLResource = z.infer<typeof ISLResourceSchema>;

export const LessonSchema = z.object({
  id: z.string(),
  title: z.string(),
  topic: z.string(),
  conceptDescription: z.string(),
  baseGraph: LinkedListGraphSchema,
  precomputedSteps: z.array(ExecutionStepSchema).optional(),
  islResource: ISLResourceSchema.optional(),
  connectedPYQIds: z.array(z.string()).default([])
});

export type Lesson = z.infer<typeof LessonSchema>;

export const AttemptSchema = z.object({
  id: z.string(),
  pyqId: z.string(),
  studentId: z.string().optional(),
  operationExecuted: z.string(),
  studentGraphSubmission: LinkedListGraphSchema,
  isCorrect: z.boolean(),
  mistakeCategory: z.string().optional(),
  timestamp: z.string().datetime()
});

export type Attempt = z.infer<typeof AttemptSchema>;
