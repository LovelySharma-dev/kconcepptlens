import { z } from 'zod';

/**
 * Individual Node Schema in a Singly Linked List
 */
export const LinkedListNodeSchema = z.object({
  id: z.string().min(1, 'Node ID cannot be empty'),
  value: z.union([z.string(), z.number()]),
  next: z.string().nullable(),
  prev: z.string().nullable().optional(),
  address: z.string().optional(),
  x: z.number().default(0),
  y: z.number().default(0),
  confidence: z.number().min(0).max(1).default(1.0),
  sourceLabelCoordinates: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number()
  }).optional()
});

export type LinkedListNode = z.infer<typeof LinkedListNodeSchema>;

/**
 * Full Graph Model for a Linked List (Singly, Doubly, or Circular)
 */
export const LinkedListGraphSchema = z.object({
  headId: z.string().nullable(),
  tailId: z.string().nullable().optional(),
  structureType: z.enum(['singly', 'doubly', 'circular']).default('singly').optional(),
  nodes: z.array(LinkedListNodeSchema),
  isCircular: z.boolean().default(false)
});

export type LinkedListGraph = z.infer<typeof LinkedListGraphSchema>;

/**
 * An immutable discrete execution step in deterministic animation
 */
export const ExecutionStepSchema = z.object({
  stepIndex: z.number(),
  totalSteps: z.number(),
  operation: z.string(),
  description: z.string(),
  codeSnippet: z.string(),
  activePointers: z.record(z.string().nullable()), // e.g. { head: 'node_1', current: 'node_2', temp: null }
  highlightedNodeIds: z.array(z.string()),
  mutatedNodeId: z.string().optional(),
  currentGraph: LinkedListGraphSchema,
  screenReaderAnnouncement: z.string()
});

export type ExecutionStep = z.infer<typeof ExecutionStepSchema>;

/**
 * Supported Interactive Operations
 */
export const OperationRequestSchema = z.object({
  operation: z.enum([
    'insertHead',
    'insertTail',
    'deleteNode',
    'reverseList',
    'search',
    'insertDoublyHead',
    'deleteDoublyNode'
  ]),
  value: z.union([z.string(), z.number()]).optional(),
  targetId: z.string().optional(),
  targetValue: z.union([z.string(), z.number()]).optional()
});

export type OperationRequest = z.infer<typeof OperationRequestSchema>;

/**
 * Validation Issue / Gate Rejection
 */
export const ValidationIssueSchema = z.object({
  gate: z.enum(['GATE_01_FORMAT', 'GATE_02_QUALITY', 'GATE_03_OCR', 'GATE_04_AST', 'GATE_05_INVARIANTS', 'GATE_06_HUMAN_REVIEW']),
  severity: z.enum(['error', 'warning']),
  nodeId: z.string().optional(),
  field: z.string().optional(),
  message: z.string(),
  suggestedFix: z.string().optional()
});

export type ValidationIssue = z.infer<typeof ValidationIssueSchema>;

/**
 * Result of the 8-Stage Validation Gate
 */
export const ValidationResultSchema = z.object({
  isValid: z.boolean(),
  needsHumanReview: z.boolean().default(false),
  issues: z.array(ValidationIssueSchema),
  validatedGraph: LinkedListGraphSchema.nullable().optional(),
  floydCycleDetected: z.boolean().default(false),
  orphanNodeIds: z.array(z.string()).default([])
});

export type ValidationResult = z.infer<typeof ValidationResultSchema>;
