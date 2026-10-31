import { Router, Request, Response } from 'express';
import { biologyLessonsCatalog } from '../services/biologyCatalog';
import { BiologyTopicId, BiologyTopicIdSchema } from '@conceptlens/shared';

const router = Router();

/**
 * GET /api/biology/lessons
 * Returns catalog summaries of all available interactive biology topics
 */
router.get('/lessons', (req: Request, res: Response) => {
  try {
    const lessons = Object.values(biologyLessonsCatalog).map((l) => ({
      id: l.id,
      title: l.title,
      subtitle: l.subtitle,
      category: l.category,
      description: l.description,
      defaultMode: l.defaultMode,
      has3D: l.has3D,
      componentCount: l.components.length,
      questionCount: l.practiceQuestions.length,
      sampleImageUrl: l.sampleOriginalImageUrl,
      sampleCloudinaryUrl: l.sampleCloudinaryUrl,
      quickFact: l.quickFact
    }));

    res.json({
      success: true,
      data: lessons
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/biology/lessons/:topic
 * Returns full lesson details for an interactive biology topic
 */
router.get('/lessons/:topic', (req: Request, res: Response) => {
  try {
    const topicParam = req.params.topic as BiologyTopicId;
    const parse = BiologyTopicIdSchema.safeParse(topicParam);
    if (!parse.success) {
      return res.status(404).json({
        success: false,
        error: `Unknown biology topic '${req.params.topic}'. Supported topics: human_cell, human_heart, dna_helix, neuron, plant_cell`
      });
    }

    const lesson = biologyLessonsCatalog[parse.data];
    if (!lesson) {
      return res.status(404).json({ success: false, error: 'Lesson not found' });
    }

    res.json({
      success: true,
      data: lesson
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/biology/questions/:topic
 * Returns curated previous-year and practice questions for a topic
 */
router.get('/questions/:topic', (req: Request, res: Response) => {
  try {
    const topicParam = req.params.topic as BiologyTopicId;
    const parse = BiologyTopicIdSchema.safeParse(topicParam);
    if (!parse.success) {
      return res.status(404).json({ success: false, error: 'Unknown biology topic' });
    }

    const lesson = biologyLessonsCatalog[parse.data];
    res.json({
      success: true,
      data: lesson ? lesson.practiceQuestions : []
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/biology/check-answer
 * Validates a student's answer to an exam practice question
 */
router.post('/check-answer', (req: Request, res: Response) => {
  try {
    const { questionId, topicId, selectedOptionIndex } = req.body;
    const lesson = biologyLessonsCatalog[topicId as BiologyTopicId];
    if (!lesson) {
      return res.status(400).json({ success: false, error: 'Invalid topic ID' });
    }

    const question = lesson.practiceQuestions.find((q) => q.id === questionId);
    if (!question) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }

    const isCorrect = question.correctOptionIndex === selectedOptionIndex;

    res.json({
      success: true,
      data: {
        questionId,
        isCorrect,
        correctOptionIndex: question.correctOptionIndex,
        explanation: question.explanation,
        boardSource: question.boardSource,
        year: question.year,
        marks: question.marks,
        diagramComponentId: question.diagramComponentId
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
