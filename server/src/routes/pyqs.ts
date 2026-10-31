import { Router, Request, Response } from 'express';
import { PYQ } from '@conceptlens/shared';

const router = Router();

// Curated Initial PYQ Repository
const curatedPYQs: PYQ[] = [
  {
    id: 'pyq_isc_2025_q11',
    title: 'ISC Class XII Computer Science 2025 Specimen - Question 11(i)',
    exam: {
      boardOrUniversity: 'ISC',
      year: 2025,
      subjectCode: '868',
      subjectName: 'Computer Science (Paper 1 Theory)',
      questionNumber: '11(i)',
      marks: 2,
      sourcePaperUrl:
        'https://cisce.org/wp-content/uploads/2025/04/868-COMPUTER-SCIENCE-PAPER-1-SQP-AK.pdf',
      cropBoundingBox: { x: 45, y: 120, width: 800, height: 450 }
    },
    conceptTag: 'Singly Linked List - Search and Traversal',
    difficulty: 'medium',
    problemStatement:
      'A linked list is formed from Node objects with fields n and link. Write an algorithm or method FindNode(Node str, int b) to search the linked list for a number.',
    markingSchemeKeyPoints: [
      'Initialize a temporary pointer to the starting node (1 mark)',
      'Traverse until null, comparing the current node value with b (1 mark)'
    ],
    initialGraph: {
      headId: 'node_1',
      isCircular: false,
      nodes: [
        { id: 'node_1', value: 15, next: 'node_2', x: 80, y: 180, confidence: 0.98 },
        { id: 'node_2', value: 28, next: 'node_3', x: 260, y: 180, confidence: 0.96 },
        { id: 'node_3', value: 42, next: null, x: 440, y: 180, confidence: 0.97 }
      ]
    },
    solutionOperation: 'search',
    verifiedAccuracy: true
  },
  {
    id: 'pyq_isc_2023_specimen_q11',
    title: 'ISC Class XII Computer Science 2023 Specimen - Question 11(a)',
    exam: {
      boardOrUniversity: 'ISC',
      year: 2023,
      subjectCode: '868',
      subjectName: 'Computer Science Paper 1 Theory',
      questionNumber: '11(a)',
      marks: 2,
      sourcePaperUrl:
        'https://cisce.org/wp-content/uploads/2022/10/868-COMPUTER-SCIENCE-PAPER-1-1.pdf',
      cropBoundingBox: { x: 60, y: 210, width: 750, height: 380 }
    },
    conceptTag: 'Singly Linked List - Insertion at Beginning',
    difficulty: 'medium',
    problemStatement:
      'Given a linked list of Node objects with integer num and Node next, write InsertNode(Node starPtr, int n) to insert a new node at the beginning of the list.',
    markingSchemeKeyPoints: [
      'Create a node and store n in its data field (1 mark)',
      'Set the new node next reference to the old head (1 mark)',
      'Return or assign the new node as the new head pointer'
    ],
    initialGraph: {
      headId: 'n1',
      isCircular: false,
      nodes: [
        { id: 'n1', value: 100, next: 'n2', x: 80, y: 180, confidence: 0.95 },
        { id: 'n2', value: 200, next: 'n3', x: 260, y: 180, confidence: 0.94 },
        { id: 'n3', value: 300, next: 'n4', x: 440, y: 180, confidence: 0.93 },
        { id: 'n4', value: 400, next: null, x: 620, y: 180, confidence: 0.97 }
      ]
    },
    solutionOperation: 'insertHead',
    verifiedAccuracy: true
  }
];

/**
 * GET /api/pyqs
 * Retrieves list of curated Previous-Year Questions with search & filters
 */
router.get('/', (req: Request, res: Response) => {
  const { board, search, difficulty } = req.query;
  let results = curatedPYQs;

  if (board) {
    results = results.filter((q) => q.exam.boardOrUniversity === String(board));
  }

  if (difficulty) results = results.filter((q) => q.difficulty === String(difficulty));

  if (search) {
    const q = String(search).toLowerCase();
    results = results.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.exam.subjectCode.toLowerCase().includes(q) ||
        item.conceptTag.toLowerCase().includes(q) ||
        item.problemStatement.toLowerCase().includes(q) ||
        item.markingSchemeKeyPoints.some((point) => point.toLowerCase().includes(q))
    );
  }

  res.json({
    success: true,
    total: results.length,
    data: results
  });
});

/**
 * GET /api/pyqs/:id
 * Retrieves full details for a specific PYQ
 */
router.get('/:id', (req: Request, res: Response) => {
  const pyq = curatedPYQs.find((q) => q.id === req.params.id);
  if (!pyq) {
    return res.status(404).json({ success: false, error: 'PYQ not found' });
  }

  res.json({ success: true, data: pyq });
});

export default router;
