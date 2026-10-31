import { z } from 'zod';

export const DiagramDomainSchema = z.enum([
  'physics',
  'biology',
  'chemistry',
  'mathematics',
  'computer_science',
  'economics',
  'flowchart',
  'general'
]);

export type DiagramDomain = z.infer<typeof DiagramDomainSchema>;

export const DiagramElementSchema = z.object({
  id: z.string(),
  type: z.enum(['node', 'organ', 'circle', 'rect', 'path', 'arrow', 'text', 'component', 'vector']),
  label: z.string(),
  detail: z.string().optional(),
  x: z.number(),
  y: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
  radius: z.number().optional(),
  color: z.string().optional(),
  strokeColor: z.string().optional(),
  connectedTo: z.array(z.string()).optional(),
  data: z.record(z.any()).optional()
});

export type DiagramElement = z.infer<typeof DiagramElementSchema>;

export const DiagramControlSchema = z.object({
  id: z.string(),
  label: z.string(),
  min: z.number(),
  max: z.number(),
  step: z.number(),
  unit: z.string(),
  defaultValue: z.number(),
  description: z.string().optional()
});

export type DiagramControl = z.infer<typeof DiagramControlSchema>;

export const DiagramMetricSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number()]),
  unit: z.string().optional(),
  formula: z.string().optional()
});

export type DiagramMetric = z.infer<typeof DiagramMetricSchema>;

export const DiagramStepSchema = z.object({
  stepIndex: z.number(),
  title: z.string(),
  explanation: z.string(),
  activeElementIds: z.array(z.string())
});

export type DiagramStep = z.infer<typeof DiagramStepSchema>;

export const UniversalInteractiveDiagramSchema = z.object({
  id: z.string(),
  domain: DiagramDomainSchema,
  title: z.string(),
  subject: z.string(),
  topic: z.string(),
  description: z.string(),
  originalImageUrl: z.string().optional(),
  elements: z.array(DiagramElementSchema),
  controls: z.array(DiagramControlSchema),
  metrics: z.array(DiagramMetricSchema),
  steps: z.array(DiagramStepSchema).optional(),
  formulas: z.array(
    z.object({
      label: z.string(),
      formula: z.string(),
      explanation: z.string()
    })
  ).optional()
});

export type UniversalInteractiveDiagram = z.infer<typeof UniversalInteractiveDiagramSchema>;
