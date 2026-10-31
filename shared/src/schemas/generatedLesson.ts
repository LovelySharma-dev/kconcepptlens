import { z } from 'zod';

export const GeneratedStepSchema = z
  .object({
    stepNumber: z.number().int().positive(),
    title: z.string().trim().min(1).max(120),
    explanation: z.string().trim().min(5).max(3000)
  })
  .strict();

export type GeneratedStep = z.infer<typeof GeneratedStepSchema>;

export const GeneratedKeyTermSchema = z
  .object({
    term: z.string().trim().min(1).max(100),
    definition: z.string().trim().min(5).max(1000)
  })
  .strict();

export type GeneratedKeyTerm = z.infer<typeof GeneratedKeyTermSchema>;

export const GeneratedFlashcardSchema = z
  .object({
    id: z.string().trim().min(1).max(80),
    front: z.string().trim().min(1).max(500),
    back: z.string().trim().min(1).max(2000)
  })
  .strict();

export type GeneratedFlashcard = z.infer<typeof GeneratedFlashcardSchema>;

export const GeneratedPracticeQuestionSchema = z
  .object({
    id: z.string().trim().min(1).max(80),
    prompt: z.string().trim().min(10).max(1200),
    options: z
      .array(z.string().trim().min(1).max(500))
      .refine((opts) => opts.length === 4, {
        message: 'Practice questions must contain exactly four options'
      }),
    correctOptionIndex: z.number().int().min(0).max(3),
    explanation: z.string().trim().min(5).max(2000),
    sourceReference: z.string().trim().max(400).optional()
  })
  .strict();

export type GeneratedPracticeQuestion = z.infer<typeof GeneratedPracticeQuestionSchema>;

export const GenerationMetadataSchema = z
  .object({
    generationMethod: z.enum(['gemini', 'huggingface', 'deterministic', 'mock']),
    model: z.string().trim().max(120).optional(),
    fallbackUsed: z.boolean(),
    fallbackReason: z.string().trim().max(300).optional(),
    timestamp: z.string()
  })
  .strict();

export type GenerationMetadata = z.infer<typeof GenerationMetadataSchema>;

export const GeneratedLessonSchema = z
  .object({
    topic: z.string().trim().min(1).max(160),
    summary: z.string().trim().min(10).max(3000),
    explanations: z
      .object({
        standard: z.string().trim().min(15).max(10000),
        easyRead: z.string().trim().min(15).max(6000),
        stepByStep: z.array(GeneratedStepSchema).min(1).max(25)
      })
      .strict(),
    keyTerms: z.array(GeneratedKeyTermSchema).max(40),
    studyNotes: z.array(z.string().trim().min(5).max(1000)).min(1).max(40),
    flashcards: z.array(GeneratedFlashcardSchema).max(40),
    practiceQuestions: z.array(GeneratedPracticeQuestionSchema).min(1).max(25),
    uncertaintyNotes: z.array(z.string().trim().max(500)).max(25),
    generationMetadata: GenerationMetadataSchema
  })
  .strict();

export type GeneratedLesson = z.infer<typeof GeneratedLessonSchema>;

// Endpoint Request / Response Schemas for API routes & Extension reusability

export const LessonGenerateRequestSchema = z
  .object({
    text: z.string().trim().min(10, 'Text must be at least 10 characters').max(30000, 'Text exceeds 30,000 character limit'),
    topic: z.string().trim().max(160).optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    learningPreferences: z
      .object({
        explanationStyle: z.enum(['standard', 'easyRead', 'stepByStep']).optional()
      })
      .optional()
  })
  .strict();

export type LessonGenerateRequest = z.infer<typeof LessonGenerateRequestSchema>;

export const SimplifyRequestSchema = z
  .object({
    text: z.string().trim().min(5, 'Text must be at least 5 characters').max(15000, 'Text exceeds 15,000 character limit'),
    targetLevel: z.enum(['elementary', 'middle_school', 'plain_language']).optional()
  })
  .strict();

export type SimplifyRequest = z.infer<typeof SimplifyRequestSchema>;

export const SimplifyResponseSchema = z
  .object({
    originalText: z.string().max(15000),
    simplifiedText: z.string().min(5).max(20000),
    keyTerms: z.array(GeneratedKeyTermSchema).optional(),
    uncertaintyNotes: z.array(z.string().max(500)).optional(),
    metadata: GenerationMetadataSchema
  })
  .strict();

export type SimplifyResponse = z.infer<typeof SimplifyResponseSchema>;

export const SummarizeRequestSchema = z
  .object({
    text: z.string().trim().min(10, 'Text must be at least 10 characters').max(25000, 'Text exceeds 25,000 character limit'),
    maxLengthWords: z.number().int().min(10).max(500).optional()
  })
  .strict();

export type SummarizeRequest = z.infer<typeof SummarizeRequestSchema>;

export const SummarizeResponseSchema = z
  .object({
    summary: z.string().min(10).max(4000),
    keyPoints: z.array(z.string().min(3).max(600)).min(1).max(25),
    sourceGrounding: z.string().max(1000).optional(),
    metadata: GenerationMetadataSchema
  })
  .strict();

export type SummarizeResponse = z.infer<typeof SummarizeResponseSchema>;

export const ExplainTermRequestSchema = z
  .object({
    term: z.string().trim().min(1, 'Term is required').max(120, 'Term exceeds limit'),
    context: z.string().trim().max(10000).optional(),
    subject: z.string().trim().max(80).optional()
  })
  .strict();

export type ExplainTermRequest = z.infer<typeof ExplainTermRequestSchema>;

export const ExplainTermResponseSchema = z
  .object({
    term: z.string().min(1).max(120),
    definition: z.string().min(5).max(1000),
    explanation: z.string().min(10).max(4000),
    analogy: z.string().max(1500).optional(),
    uncertaintyNotes: z.array(z.string().max(500)).optional(),
    metadata: GenerationMetadataSchema
  })
  .strict();

export type ExplainTermResponse = z.infer<typeof ExplainTermResponseSchema>;

export const StudyNotesRequestSchema = z
  .object({
    text: z.string().trim().min(10, 'Text must be at least 10 characters').max(30000, 'Text exceeds 30,000 character limit'),
    topic: z.string().trim().max(160).optional(),
    includeFlashcards: z.boolean().optional()
  })
  .strict();

export type StudyNotesRequest = z.infer<typeof StudyNotesRequestSchema>;

export const StudyNotesResponseSchema = z
  .object({
    topic: z.string().min(1).max(160),
    studyNotes: z.array(z.string().min(5).max(1000)).min(1).max(40),
    keyTerms: z.array(GeneratedKeyTermSchema).max(40),
    flashcards: z.array(GeneratedFlashcardSchema).optional(),
    metadata: GenerationMetadataSchema
  })
  .strict();

export type StudyNotesResponse = z.infer<typeof StudyNotesResponseSchema>;

/**
 * Validates external or model-generated payload against GeneratedLessonSchema safely
 */
export function validateGeneratedLesson(data: unknown): { ok: true; lesson: GeneratedLesson } | { ok: false; error: string; issues: string[] } {
  const result = GeneratedLessonSchema.safeParse(data);
  if (result.success) {
    return { ok: true, lesson: result.data };
  }
  return {
    ok: false,
    error: 'Generated content did not satisfy the strict lesson schema.',
    issues: result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)
  };
}

