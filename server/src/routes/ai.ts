import { Router, Request, Response } from 'express';
import {
  LessonGenerateRequestSchema,
  SimplifyRequestSchema,
  SummarizeRequestSchema,
  ExplainTermRequestSchema,
  StudyNotesRequestSchema,
  ADHDStudyPlanRequestSchema,
  generateDeterministicStudyPlan,
  CurriculumTranslateRequestSchema,
  redactSecrets
} from '@conceptlens/shared';
import { defaultAIProvider } from '../services/aiProviderService';

const router = Router();

function getSecrets(): string[] {
  return [
    process.env.HF_TOKEN,
    process.env.HUGGINGFACE_API_KEY,
    process.env.GEMMA_API_KEY,
    process.env.GEMINI_API_KEY,
    process.env.CLOUDINARY_API_SECRET
  ]
    .map((s) => s?.trim() ?? '')
    .filter((s) => s.length >= 8 && !s.includes('your_'));
}

// Basic in-memory rate limiting / abuse prevention (e.g. 60 requests per minute per IP)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = requestCounts.get(ip);
  if (!entry || now > entry.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + 60000 });
    return true;
  }
  if (entry.count >= 60) {
    return false;
  }
  entry.count++;
  return true;
}

/**
 * GET /api/ai/status
 * Returns current provider status and configured model
 */
router.get('/status', (_req: Request, res: Response) => {
  const status = defaultAIProvider.getStatus();
  res.json({
    success: true,
    data: status
  });
});

/**
 * POST /api/ai/lesson
 * Generates an inclusive multi-representation lesson (or fallback)
 */
router.post('/lesson', async (req: Request, res: Response) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded. Please wait a moment before generating another lesson.'
    });
  }

  const parsed = LessonGenerateRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: 'Invalid lesson generation request.',
      issues: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)
    });
  }

  try {
    const lesson = await defaultAIProvider.generateLesson(parsed.data);
    return res.json({
      success: true,
      data: lesson
    });
  } catch (err: unknown) {
    const raw = err instanceof Error ? err.message : 'Failed to generate lesson';
    const sanitized = redactSecrets(raw, getSecrets());
    return res.status(500).json({
      success: false,
      error: sanitized
    });
  }
});

/**
 * POST /api/ai/simplify
 * Plain-language text simplification for reading accessibility
 */
router.post('/simplify', async (req: Request, res: Response) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded. Please wait a moment.'
    });
  }

  const parsed = SimplifyRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: 'Invalid simplification request.',
      issues: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)
    });
  }

  try {
    const result = await defaultAIProvider.simplifyText(parsed.data);
    return res.json({
      success: true,
      data: result
    });
  } catch (err: unknown) {
    const raw = err instanceof Error ? err.message : 'Simplification failed';
    return res.status(500).json({
      success: false,
      error: redactSecrets(raw, getSecrets())
    });
  }
});

/**
 * POST /api/ai/summarize
 * Concise educational summarization and key points
 */
router.post('/summarize', async (req: Request, res: Response) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded. Please wait a moment.'
    });
  }

  const parsed = SummarizeRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: 'Invalid summarization request.',
      issues: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)
    });
  }

  try {
    const result = await defaultAIProvider.summarizeContent(parsed.data);
    return res.json({
      success: true,
      data: result
    });
  } catch (err: unknown) {
    const raw = err instanceof Error ? err.message : 'Summarization failed';
    return res.status(500).json({
      success: false,
      error: redactSecrets(raw, getSecrets())
    });
  }
});

/**
 * POST /api/ai/explain-term
 * Vocabulary term explanation with analogy
 */
router.post('/explain-term', async (req: Request, res: Response) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded. Please wait a moment.'
    });
  }

  const parsed = ExplainTermRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: 'Invalid term explanation request.',
      issues: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)
    });
  }

  try {
    const result = await defaultAIProvider.explainTerm(parsed.data);
    return res.json({
      success: true,
      data: result
    });
  } catch (err: unknown) {
    const raw = err instanceof Error ? err.message : 'Term explanation failed';
    return res.status(500).json({
      success: false,
      error: redactSecrets(raw, getSecrets())
    });
  }
});

/**
 * POST /api/ai/notes
 * Structured study notes and flashcards extraction
 */
router.post('/notes', async (req: Request, res: Response) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded. Please wait a moment.'
    });
  }

  const parsed = StudyNotesRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: 'Invalid study notes request.',
      issues: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)
    });
  }

  try {
    const result = await defaultAIProvider.generateStudyNotes(parsed.data);
    return res.json({
      success: true,
      data: result
    });
  } catch (err: unknown) {
    const raw = err instanceof Error ? err.message : 'Study notes generation failed';
    return res.status(500).json({
      success: false,
      error: redactSecrets(raw, getSecrets())
    });
  }
});

/**
 * POST /api/ai/plan-tasks
 * Micro-task generator for ADHD-friendly flexible study sessions
 */
router.post('/plan-tasks', async (req: Request, res: Response) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded. Please wait a moment.'
    });
  }

  const parsed = ADHDStudyPlanRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: 'Invalid study plan request.',
      issues: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)
    });
  }

  try {
    // Generate deterministic structured micro-tasks (resilient, instant, offline-capable)
    const plan = generateDeterministicStudyPlan(parsed.data.goal, parsed.data.conceptId);
    return res.json({
      success: true,
      data: plan
    });
  } catch (err: unknown) {
    const raw = err instanceof Error ? err.message : 'Task planning failed';
    return res.status(500).json({
      success: false,
      error: redactSecrets(raw, getSecrets())
    });
  }
});

/**
 * POST /api/ai/translate
 * General curriculum translation preserving scientific terminology
 */
router.post('/translate', async (req: Request, res: Response) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded. Please wait a moment before requesting another translation.'
    });
  }

  const parsed = CurriculumTranslateRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: 'Invalid curriculum translation request.',
      issues: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)
    });
  }

  try {
    const translation = await defaultAIProvider.translateCurriculum(parsed.data);
    return res.json({
      success: true,
      data: translation
    });
  } catch (err: unknown) {
    const raw = err instanceof Error ? err.message : 'Failed to translate curriculum';
    const sanitized = redactSecrets(raw, getSecrets());
    return res.status(500).json({
      success: false,
      error: sanitized
    });
  }
});

export default router;

