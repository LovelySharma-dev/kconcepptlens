import { Router, Request, Response } from 'express';
import { AttemptSchema } from '@conceptlens/shared';
import { inMemoryStore } from '../config/db';

const router = Router();

/**
 * POST /api/practice/attempts
 * Records student attempts, evaluates against invariants and ground-truth
 */
router.post('/attempts', (req: Request, res: Response) => {
  try {
    const parse = AttemptSchema.safeParse({
      ...req.body,
      id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString()
    });

    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid attempt payload',
        details: parse.error.issues
      });
    }

    inMemoryStore.attempts.push(parse.data);

    res.json({
      success: true,
      data: {
        attemptId: parse.data.id,
        isCorrect: parse.data.isCorrect,
        feedback: parse.data.isCorrect
          ? '🎉 Excellent work! Your pointer transitions match the official marking scheme.'
          : '⚠️ Check your pointer links: make sure you update newNode->next before reassigning head.'
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
