import { Router, Request, Response } from 'express';
import { Lesson } from '@conceptlens/shared';

const router = Router();

const sampleLesson: Lesson = {
  id: 'lesson_linked_list_basics',
  title: 'Mastering Singly Linked Lists & Pointer Reassignment',
  topic: 'Data Structures - Linear Lists',
  conceptDescription:
    'A singly linked list is a linear data structure where elements are not stored at contiguous memory locations. Each node consists of a data value and a next pointer referencing the next node in sequence.',
  baseGraph: {
    headId: 'node_1',
    isCircular: false,
    nodes: [
      { id: 'node_1', value: 10, next: 'node_2', x: 80, y: 180, confidence: 1.0 },
      { id: 'node_2', value: 20, next: 'node_3', x: 260, y: 180, confidence: 1.0 },
      { id: 'node_3', value: 30, next: null, x: 440, y: 180, confidence: 1.0 }
    ]
  },
  connectedPYQIds: ['pyq_isc_2025_q11', 'pyq_isc_2023_specimen_q11']
};

router.get('/:id', (req: Request, res: Response) => {
  if (req.params.id === 'lesson_linked_list_basics' || req.params.id === 'default') {
    return res.json({ success: true, data: sampleLesson });
  }
  res.status(404).json({ success: false, error: 'Lesson not found' });
});

export default router;
