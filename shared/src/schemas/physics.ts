import { z } from 'zod';

export const PhysicsDiagramTypeSchema = z.enum([
  'ray_optics',
  'pendulum',
  'projectile',
  'circuit',
  'inclined_plane'
]);

export type PhysicsDiagramType = z.infer<typeof PhysicsDiagramTypeSchema>;

export const InteractiveControlSchema = z.object({
  id: z.string(),
  label: z.string(),
  min: z.number(),
  max: z.number(),
  step: z.number(),
  unit: z.string(),
  defaultValue: z.number()
});

export type InteractiveControl = z.infer<typeof InteractiveControlSchema>;

export const PhysicsFormulaSchema = z.object({
  label: z.string(),
  formula: z.string(),
  explanation: z.string()
});

export type PhysicsFormula = z.infer<typeof PhysicsFormulaSchema>;

export const PhysicsSimulationModelSchema = z.object({
  domain: z.literal('physics').default('physics'),
  type: PhysicsDiagramTypeSchema,
  title: z.string(),
  topic: z.string(),
  description: z.string(),
  originalImageUrl: z.string().optional(),
  parameters: z.record(z.number()),
  formulas: z.array(PhysicsFormulaSchema),
  interactiveControls: z.array(InteractiveControlSchema),
  calculations: z.record(z.union([z.string(), z.number()])).optional()
});

export type PhysicsSimulationModel = z.infer<typeof PhysicsSimulationModelSchema>;
