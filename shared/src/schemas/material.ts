import { z } from 'zod';

export const MATERIAL_SOURCE_KINDS = ['learner_text', 'pdf_text_layer', 'sample', 'image_ocr', 'scanned_pdf'] as const;

export const MaterialSourceKindSchema = z.enum(MATERIAL_SOURCE_KINDS);
export type MaterialSourceKind = z.infer<typeof MaterialSourceKindSchema>;

export const SUBJECT_IDS = [
  'mathematics',
  'physics',
  'chemistry',
  'biology',
  'computer_science',
  'history',
  'geography',
  'literature',
  'general',
  'unknown'
] as const;

export const CONTENT_TYPE_IDS = [
  'equation',
  'diagram',
  'table',
  'textbook_passage',
  'handwritten_notes',
  'programming_code',
  'historical_timeline',
  'map',
  'scientific_process',
  'question',
  'prose',
  'unknown'
] as const;

export const SubjectIdSchema = z.enum(SUBJECT_IDS);
export const ContentTypeIdSchema = z.enum(CONTENT_TYPE_IDS);

export type SubjectId = z.infer<typeof SubjectIdSchema>;
export type ContentTypeId = z.infer<typeof ContentTypeIdSchema>;

export const PRACTICE_STAGES = ['undo', 'both-sides', 'intermediate', 'isolate', 'check', 'recall'] as const;

export const PracticeStageSchema = z.enum(PRACTICE_STAGES);
export type PracticeStage = z.infer<typeof PracticeStageSchema>;

/** Learner-facing prompt. The answer key is not part of this object. */
export const PracticeQuestionSchema = z.object({
  id: z.string().min(1),
  conceptId: z.string().min(1),
  prompt: z.string().min(1),
  options: z.array(z.string().min(1)).min(2).max(6),
  hint: z.string().nullable(),
  challenge: z.boolean(),
  source: z.enum(['verified', 'sample', 'extracted']),
  relatedStepIndex: z.number().int().nonnegative(),
  stage: PracticeStageSchema
});

export type PracticeQuestion = z.infer<typeof PracticeQuestionSchema>;

export const SolvingStrategySchema = z
  .object({
    subject: SubjectIdSchema,
    specialized: z.boolean(),
    matched: z.boolean(),
    label: z.string().min(1),
    scope: z.string().min(1)
  })
  .strict();

export type SolvingStrategy = z.infer<typeof SolvingStrategySchema>;

export const ExplanationStepSchema = z.object({
  index: z.number().int().nonnegative(),
  title: z.string().min(1),
  detail: z.string().min(1),
  verified: z.boolean()
});

export type ExplanationStep = z.infer<typeof ExplanationStepSchema>;

export const MaterialExplanationSchema = z
  .object({
    sourceContent: z.string(),
    sourceKind: MaterialSourceKindSchema,
    sampleId: z.string().nullable(),
    demo: z.boolean(),
    extracted: z.boolean(),
    extractionStatus: z.enum(['extracted', 'sample', 'learner_supplied']),
    extractionNote: z.string(),
    subject: SubjectIdSchema,
    subjectConfidence: z.number().min(0).max(1),
    subjectUncertain: z.boolean(),
    subjectEvidence: z.array(z.string()),
    learnerCorrectedSubject: z.boolean(),
    contentType: ContentTypeIdSchema,
    contentTypeUncertain: z.boolean(),
    solvingStrategy: SolvingStrategySchema,
    mainConcept: z.string().min(1),
    learningObjective: z.string().min(1),
    sections: z
      .array(
        z.object({
          id: z.string().min(1),
          title: z.string().min(1),
          paragraphs: z.array(z.string().min(1)).min(1)
        })
      )
      .min(1),
    plainLanguage: z.string().nullable(),
    steps: z.array(ExplanationStepSchema),
    everydayExample: z.string().nullable(),
    diagramDescription: z.string().nullable(),
    practice: z.array(PracticeQuestionSchema),
    sourceReferences: z.array(z.object({ label: z.string(), location: z.string() })).min(1),
    uncertaintyNotes: z.array(z.string()),
    verified: z.array(z.string()),
    interpretation: z.array(z.string()),
    limitations: z.array(z.string()),
    glossary: z.array(z.object({ term: z.string(), meaning: z.string() })),
    linkedLessonId: z.string().nullable(),
    instructionLike: z.boolean(),
    codeExecuted: z.literal(false),
    trainedModel: z.literal(false),
    engine: z.literal('deterministic-rules')
  })
  .strict();

export type MaterialExplanation = z.infer<typeof MaterialExplanationSchema>;

export const MaterialIngestRequestSchema = z
  .object({
    kind: z.enum(['text', 'question', 'file', 'sample']),
    text: z.string().max(20000).optional(),
    fileBase64: z.string().max(18_000_000).optional(),
    fileName: z.string().max(180).optional(),
    declaredMime: z.string().max(120).optional(),
    sampleId: z.string().max(80).optional()
  })
  .strict();

export const MaterialExplainRequestSchema = z
  .object({
    text: z.string().min(1).max(20000),
    sourceKind: MaterialSourceKindSchema,
    sampleId: z.string().max(80).nullable().optional(),
    subjectOverride: SubjectIdSchema.nullable().optional(),
    contentTypeOverride: ContentTypeIdSchema.nullable().optional(),
    practiceToken: z.string().regex(/^[A-Za-z0-9_-]{8,80}$/).optional()
  })
  .strict();

export const MaterialAnswerRequestSchema = z
  .object({
    text: z.string().min(1).max(20000),
    questionId: z.string().min(1).max(80),
    selectedIndex: z.number().int().nonnegative(),
    sourceKind: MaterialSourceKindSchema,
    sampleId: z.string().max(80).nullable().optional(),
    subjectOverride: SubjectIdSchema.nullable().optional(),
    contentTypeOverride: ContentTypeIdSchema.nullable().optional(),
    practiceToken: z.string().regex(/^[A-Za-z0-9_-]{8,80}$/).optional(),
    weights: z
      .object({
        plain: z.number(),
        steps: z.number(),
        example: z.number(),
        challenge: z.number()
      })
      .optional()
  })
  .strict();

export function parseExternalExplanation(
  value: unknown
): { ok: true; data: MaterialExplanation } | { ok: false; error: string } {
  const parsed = MaterialExplanationSchema.safeParse(value);
  if (!parsed.success) {
    return { ok: false, error: 'The explanation did not match the expected structure and was not shown.' };
  }
  return { ok: true, data: parsed.data };
}
