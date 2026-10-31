import { z } from 'zod';

export const BiologyTopicIdSchema = z.enum([
  'human_cell',
  'human_heart',
  'dna_helix',
  'neuron'
]);

export type BiologyTopicId = z.infer<typeof BiologyTopicIdSchema>;

export const BiologyComponentSchema = z.object({
  id: z.string(),
  name: z.string(),
  scientificName: z.string().optional(),
  location: z.string(),
  function: z.string(),
  analogy: z.string(),
  scientificExplanation: z.string(),
  simpleExplanation: z.string(),
  examFacts: z.array(z.string()),
  relatedConcepts: z.array(z.string()),
  color: z.string(),
  strokeColor: z.string().optional(),
  position2D: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number().optional(),
    height: z.number().optional(),
    radius: z.number().optional()
  }),
  position3D: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number()
  }).optional()
});

export type BiologyComponent = z.infer<typeof BiologyComponentSchema>;

export const BiologyPracticeQuestionSchema = z.object({
  id: z.string(),
  topicId: BiologyTopicIdSchema,
  question: z.string(),
  options: z.array(z.string()),
  correctOptionIndex: z.number(),
  explanation: z.string(),
  boardSource: z.string(), // e.g. "CBSE Board Examination Class 12"
  year: z.number(),
  marks: z.number(),
  diagramComponentId: z.string().optional()
});

export type BiologyPracticeQuestion = z.infer<typeof BiologyPracticeQuestionSchema>;

export const BiologyGuidedStepSchema = z.object({
  stepNumber: z.number(),
  componentId: z.string(),
  title: z.string(),
  summary: z.string(),
  actionPrompt: z.string()
});

export type BiologyGuidedStep = z.infer<typeof BiologyGuidedStepSchema>;

export const BiologyLessonSchema = z.object({
  id: BiologyTopicIdSchema,
  title: z.string(),
  subtitle: z.string(),
  category: z.string(),
  description: z.string(),
  defaultMode: z.enum(['3d', '2d']),
  has3D: z.boolean(),
  sampleOriginalImageUrl: z.string(),
  sampleCloudinaryUrl: z.string(),
  components: z.array(BiologyComponentSchema),
  guidedSteps: z.array(BiologyGuidedStepSchema),
  practiceQuestions: z.array(BiologyPracticeQuestionSchema),
  quickFact: z.string()
});

export type BiologyLesson = z.infer<typeof BiologyLessonSchema>;
