import { z } from 'zod';
import { LinkedListGraphSchema } from './diagram';

export const ExamMetadataSchema = z.object({
  boardOrUniversity: z.enum(['ISC', 'CBSE', 'Anna University', 'GATE', 'General DSA']),
  year: z.number().int().min(2000).max(2030),
  subjectCode: z.string(),
  subjectName: z.string(),
  questionNumber: z.string(),
  marks: z.number().positive(),
  sourcePaperUrl: z.string().url(),
  cropBoundingBox: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number()
  })
});

export type ExamMetadata = z.infer<typeof ExamMetadataSchema>;

export const PYQSchema = z.object({
  id: z.string(),
  title: z.string(),
  exam: ExamMetadataSchema,
  conceptTag: z.string(), // e.g. "Singly Linked List - Insertion"
  difficulty: z.enum(['easy', 'medium', 'hard']),
  problemStatement: z.string(),
  markingSchemeKeyPoints: z.array(z.string()),
  initialGraph: LinkedListGraphSchema,
  solutionOperation: z.string(),
  verifiedAccuracy: z.boolean().default(true)
});

export type PYQ = z.infer<typeof PYQSchema>;
