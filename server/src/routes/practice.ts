import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { AttemptSchema, LinkedListGraphSchema } from '@conceptlens/shared';
import { inMemoryStore, isDbConnected } from '../config/db';
import { AttemptModel } from '../models/Attempt';
import { generateExecutionSteps } from '../services/stepEngine';
import { validateLinkedListInvariants } from '../services/validationService';

const router = Router();
const submissionSchema = z.object({
  pyqId: z.string().min(1).max(100),
  studentId: z.string().max(100).optional(),
  solutionOperation: z.enum(['reverseList', 'insertHead', 'insertTail', 'deleteNode', 'insertDoublyHead', 'deleteDoublyNode']),
  baseGraph: LinkedListGraphSchema,
  studentGraphSubmission: LinkedListGraphSchema
});

function pointerState(graph: z.infer<typeof LinkedListGraphSchema>) {
  const canonicalId = (id: string | null | undefined) => id?.startsWith('node_new_') || id?.startsWith('student_') ? '__new_node__' : id ?? null;
  return {
    headId: canonicalId(graph.headId),
    nodes: graph.nodes.map(({ id, value, next, prev }) => ({ id: canonicalId(id), value, next: canonicalId(next), ...(prev !== undefined ? { prev: canonicalId(prev) } : {}) })).sort((a, b) => String(a.id).localeCompare(String(b.id)))
  };
}

router.post('/attempts', async (req: Request, res: Response) => {
  try {
    const parsed = submissionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: 'Invalid practice submission', details: parsed.error.issues });
    const { pyqId, studentId, solutionOperation, baseGraph, studentGraphSubmission } = parsed.data;
    const validation = validateLinkedListInvariants(studentGraphSubmission);
    if (!validation.isValid) return res.status(422).json({ success: false, error: 'Your pointer graph has structural errors.', validation });
    const targetValue = solutionOperation === 'deleteNode' || solutionOperation === 'deleteDoublyNode'
      ? baseGraph.nodes[Math.floor(baseGraph.nodes.length / 2)]?.value
      : undefined;
    const expectedSteps = generateExecutionSteps(baseGraph, { operation: solutionOperation, value: 9, targetValue });
    const expected = expectedSteps[expectedSteps.length - 1]?.currentGraph;
    if (!expected) return res.status(422).json({ success: false, error: 'This challenge has no reference final state.' });
    const correct = JSON.stringify(pointerState(expected)) === JSON.stringify(pointerState(studentGraphSubmission));
    const attempt = AttemptSchema.parse({
      id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, pyqId, studentId,
      operationExecuted: solutionOperation, studentGraphSubmission, isCorrect: correct,
      mistakeCategory: correct ? undefined : validation.needsHumanReview ? 'invariant_or_orphan' : 'pointer_mismatch', timestamp: new Date().toISOString()
    });
    if (isDbConnected()) await AttemptModel.create({ attemptId: attempt.id, ...attempt, timestamp: new Date(attempt.timestamp) });
    else inMemoryStore.attempts.push(attempt);
    res.status(201).json({ success: true, data: { attemptId: attempt.id, isCorrect: correct, feedback: correct ? 'Correct: your final node links match the deterministic reference state.' : 'Not quite: compare each next/prev pointer and the head with the reference steps, then try again.' } });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Could not save attempt.' });
  }
});

router.get('/attempts', async (req: Request, res: Response) => {
  const pyqId = String(req.query.pyqId || '');
  if (!pyqId) return res.status(400).json({ success: false, error: 'pyqId is required.' });
  try {
    const results = isDbConnected()
      ? await AttemptModel.find({ pyqId }).sort({ timestamp: -1 }).limit(100).lean()
      : inMemoryStore.attempts.filter((attempt) => attempt.pyqId === pyqId).slice(-100).reverse();
    const data = results.map((attempt: any) => ({
      id: attempt.id || attempt.attemptId,
      pyqId: attempt.pyqId,
      operationExecuted: attempt.operationExecuted,
      isCorrect: attempt.isCorrect,
      timestamp: new Date(attempt.timestamp).toISOString()
    }));
    res.json({ success: true, data });
  } catch (error) { res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Could not load attempt history.' }); }
});

export default router;
