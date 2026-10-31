import { Router, Request, Response } from 'express';
import {
  LinkedListGraphSchema,
  OperationRequestSchema
} from '@conceptlens/shared';
import { interpretDiagram } from '../services/interpretationService';
import { validateLinkedListInvariants } from '../services/validationService';
import { generateExecutionSteps } from '../services/stepEngine';
import { DiagramSession } from '../models/DiagramSession';
import { isDbConnected, inMemoryStore } from '../config/db';

const router = Router();

/**
 * POST /api/diagrams/interpret
 * Ingests media references and runs the interpretation pipeline with validation gates
 */
router.post('/interpret', async (req: Request, res: Response) => {
  try {
    const { imageUrl, cropCoordinates, diagramType, sourceContext } = req.body;

    const result = await interpretDiagram({
      imageUrl: imageUrl || '',
      cropCoordinates,
      diagramType: diagramType || 'singly_linked_list',
      sourceContext
    });

    // Save in memory or db
    inMemoryStore.sessions.set(result.sessionId, result);

    if (isDbConnected()) {
      const session = new DiagramSession({
        sessionId: result.sessionId,
        sourceType: 'upload',
        diagramType: result.diagramType,
        status: result.status,
        graph: result.graph,
        executionSteps: []
      });
      await session.save();
    }

    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/diagrams/validate
 * Validates a proposed or student-corrected graph model against all structural invariants
 */
router.post('/validate', (req: Request, res: Response) => {
  try {
    const parseResult = LinkedListGraphSchema.safeParse(req.body.graph);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid graph format',
        details: parseResult.error.issues
      });
    }

    const validationResult = validateLinkedListInvariants(parseResult.data);
    res.json({
      success: true,
      data: validationResult
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/diagrams/simulate
 * Generates deterministic step-by-step state transitions for an operation
 */
router.post('/simulate', (req: Request, res: Response) => {
  try {
    const graphParse = LinkedListGraphSchema.safeParse(req.body.graph);
    if (!graphParse.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid graph payload',
        details: graphParse.error.issues
      });
    }

    const opParse = OperationRequestSchema.safeParse(req.body.operation);
    if (!opParse.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid operation payload',
        details: opParse.error.issues
      });
    }

    // Verify invariants before simulating
    const validation = validateLinkedListInvariants(graphParse.data);
    if (!validation.isValid) {
      return res.status(422).json({
        success: false,
        error: 'Cannot simulate operation on graph violating structural invariants',
        validation
      });
    }

    const steps = generateExecutionSteps(graphParse.data, opParse.data);
    res.json({
      success: true,
      data: {
        operation: opParse.data.operation,
        totalSteps: steps.length,
        steps
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/diagrams/sessions/:id
 */
router.get('/sessions/:id', async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.id;

    if (inMemoryStore.sessions.has(sessionId)) {
      return res.json({ success: true, data: inMemoryStore.sessions.get(sessionId) });
    }

    if (isDbConnected()) {
      const session = await DiagramSession.findOne({ sessionId });
      if (session) {
        return res.json({ success: true, data: session });
      }
    }

    res.status(404).json({ success: false, error: 'Session not found' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
