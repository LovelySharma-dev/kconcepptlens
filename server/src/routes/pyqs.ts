import { Router, Request, Response } from 'express';
import { PYQ } from '@conceptlens/shared';

const router = Router();

// Curated Initial PYQ Repository
const curatedPYQs: PYQ[] = [
  {
    id: 'pyq_isc_2025_q11',
    title: 'ISC Class XII Computer Science 2025 Specimen — Question 11',
    exam: {
      boardOrUniversity: 'ISC',
      year: 2025,
      subjectCode: '868',
      subjectName: 'Computer Science (Paper 1 Theory)',
      questionNumber: '11(a)',
      marks: 3,
      sourcePaperUrl:
        'https://images.openai.com/static-rsc-4/XkO7gSqpO5GsWl0aO5MiA2a68-Km86zCJbP7hacxn3-Do1QE2-J4RFPWiD4Zok-ZLm1nIMK9SHjzJN5m-reEt3NepgQhcNz6LwIOjlOPx1bMFvDtj0NjD7jaa-LMnjFJHJBU7my4ijNaoAQ_LausBSz1KrYgEFjjDhZ1FnR1WuM?purpose=inline',
      cropBoundingBox: { x: 45, y: 120, width: 800, height: 450 }
    },
    conceptTag: 'Singly Linked List - Insertion at Beginning',
    difficulty: 'medium',
    problemStatement:
      'Given a singly linked list with nodes [15 -> 28 -> 42 -> NULL], write the algorithm to insert a new node with value 9 at the beginning (head) of the list. Trace the pointer updates.',
    markingSchemeKeyPoints: [
      'Allocate memory for new node and assign value 9 (1 mark)',
      'Assign newNode->next = head to link to existing list (1 mark)',
      'Update head pointer: head = newNode (1 mark)'
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
    solutionOperation: 'insertHead',
    verifiedAccuracy: true
  },
  {
    id: 'pyq_anna_univ_2019_q13',
    title: 'Anna University CP 5151 — Advanced Data Structures & Algorithms Nov/Dec 2019',
    exam: {
      boardOrUniversity: 'Anna University',
      year: 2019,
      subjectCode: 'CP5151',
      subjectName: 'Advanced Data Structures and Algorithms',
      questionNumber: 'Part B - Q13(a)',
      marks: 13,
      sourcePaperUrl:
        'https://images.openai.com/static-rsc-4/NUFO3JUqMASZMvEkj90wZZBIwZZgDux-td4W5U8g84-h9w4dsCB-_1pW0GB1vKg9_oJDTJpyuf2jiPTyKU5XB55khTTfBdg11izPwG9A8rBwUd0EEz5zWlzrmLFx9mhEnDmTIkXHtMAtfg1ZRb44u_CfIxU731I9OnZjFuYlq50?purpose=inline',
      cropBoundingBox: { x: 60, y: 210, width: 750, height: 380 }
    },
    conceptTag: 'Singly Linked List - Deletion of Intermediate Node',
    difficulty: 'hard',
    problemStatement:
      'Demonstrate the deletion of an intermediate node containing value 200 from the singly linked list [100 -> 200 -> 300 -> 400 -> NULL]. State intermediate pointer mutations and memory deallocation steps.',
    markingSchemeKeyPoints: [
      'Traverse with prev and curr pointers until curr->data == 200 (4 marks)',
      'Rewire prev->next = curr->next to bypass target node (5 marks)',
      'Free allocated memory for deleted node (4 marks)'
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
    solutionOperation: 'deleteNode',
    verifiedAccuracy: true
  }
];

/**
 * GET /api/pyqs
 * Retrieves list of curated Previous-Year Questions with search & filters
 */
router.get('/', (req: Request, res: Response) => {
  const { board, search } = req.query;
  let results = curatedPYQs;

  if (board) {
    results = results.filter((q) => q.exam.boardOrUniversity === String(board));
  }

  if (search) {
    const q = String(search).toLowerCase();
    results = results.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.conceptTag.toLowerCase().includes(q) ||
        item.problemStatement.toLowerCase().includes(q)
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
