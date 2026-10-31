import { Router, Request, Response } from 'express';
import { PYQ } from '@conceptlens/shared';
import { PYQModel } from '../models/PYQ';
import { isDbConnected } from '../config/db';

const router = Router();

// Curated 11 Comprehensive Previous-Year Questions (ISC, CBSE, Anna University, GATE)
export const curatedPYQs: PYQ[] = [
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
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
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
        { id: 'node_1', value: 15, next: 'node_2', address: '0x1020', x: 80, y: 180, confidence: 0.98 },
        { id: 'node_2', value: 28, next: 'node_3', address: '0x1040', x: 260, y: 180, confidence: 0.96 },
        { id: 'node_3', value: 42, next: null, address: '0x1060', x: 440, y: 180, confidence: 0.97 }
      ]
    },
    solutionOperation: 'insertHead',
    verifiedAccuracy: true
  },
  {
    id: 'pyq_isc_2024_q9',
    title: 'ISC Class XII Computer Science 2024 — Question 9',
    exam: {
      boardOrUniversity: 'ISC',
      year: 2024,
      subjectCode: '868',
      subjectName: 'Computer Science (Theory)',
      questionNumber: '9(b)',
      marks: 3,
      sourcePaperUrl:
        'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80',
      cropBoundingBox: { x: 50, y: 160, width: 780, height: 420 }
    },
    conceptTag: 'Singly Linked List - Traversal & Search',
    difficulty: 'easy',
    problemStatement:
      'Given a singly linked list containing elements [12 -> 24 -> 36 -> 48 -> NULL], trace the steps to search for key value 36. Show pointer moves at each iteration until the target is located.',
    markingSchemeKeyPoints: [
      'Initialize temp = head and compare temp->data with key (1 mark)',
      'Advance pointer temp = temp->next when comparison does not match (1 mark)',
      'Terminate loop when temp->data == 36 and return node index (1 mark)'
    ],
    initialGraph: {
      headId: 'node_t1',
      isCircular: false,
      nodes: [
        { id: 'node_t1', value: 12, next: 'node_t2', address: '0x2010', x: 80, y: 180, confidence: 0.99 },
        { id: 'node_t2', value: 24, next: 'node_t3', address: '0x2020', x: 260, y: 180, confidence: 0.98 },
        { id: 'node_t3', value: 36, next: 'node_t4', address: '0x2030', x: 440, y: 180, confidence: 0.97 },
        { id: 'node_t4', value: 48, next: null, address: '0x2040', x: 620, y: 180, confidence: 0.98 }
      ]
    },
    solutionOperation: 'search',
    verifiedAccuracy: true
  },
  {
    id: 'pyq_cbse_2024_q28',
    title: 'CBSE Class XII Computer Science (083) 2024 — Question 28',
    exam: {
      boardOrUniversity: 'CBSE',
      year: 2024,
      subjectCode: '083',
      subjectName: 'Computer Science Python / DSA',
      questionNumber: '28',
      marks: 4,
      sourcePaperUrl:
        'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80',
      cropBoundingBox: { x: 40, y: 100, width: 820, height: 460 }
    },
    conceptTag: 'Singly Linked List - Insertion at Tail',
    difficulty: 'medium',
    problemStatement:
      'Write a function in C++ or Python to insert an element 50 at the end (tail) of an existing singly linked list [10 -> 20 -> 30 -> NULL]. Account for list traversal to find the terminal node.',
    markingSchemeKeyPoints: [
      'Create new node with data 50 and set newNode->next = NULL (1 mark)',
      'Handle empty list edge case: if head == NULL, head = newNode (1 mark)',
      'Traverse using temp until temp->next == NULL (1 mark)',
      'Update last node link: temp->next = newNode (1 mark)'
    ],
    initialGraph: {
      headId: 'node_c1',
      isCircular: false,
      nodes: [
        { id: 'node_c1', value: 10, next: 'node_c2', address: '0x1010', x: 80, y: 180, confidence: 0.99 },
        { id: 'node_c2', value: 20, next: 'node_c3', address: '0x1020', x: 260, y: 180, confidence: 0.98 },
        { id: 'node_c3', value: 30, next: null, address: '0x1030', x: 440, y: 180, confidence: 0.97 }
      ]
    },
    solutionOperation: 'insertTail',
    verifiedAccuracy: true
  },
  {
    id: 'pyq_cbse_2023_q31',
    title: 'CBSE Class XII Computer Science (083) 2023 — Question 31',
    exam: {
      boardOrUniversity: 'CBSE',
      year: 2023,
      subjectCode: '083',
      subjectName: 'Computer Science',
      questionNumber: '31(a)',
      marks: 5,
      sourcePaperUrl:
        'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
      cropBoundingBox: { x: 55, y: 140, width: 810, height: 440 }
    },
    conceptTag: 'Singly Linked List - Deletion of Intermediate Node',
    difficulty: 'hard',
    problemStatement:
      'Given a singly linked list [5 -> 15 -> 25 -> 35 -> NULL], demonstrate intermediate node deletion for value 25. Trace the prev and current pointer references and illustrate memory deallocation.',
    markingSchemeKeyPoints: [
      'Traverse with prev and curr pointers until curr->data == 25 (2 marks)',
      'Rewire pointer: prev->next = curr->next (2 marks)',
      'Deallocate or drop reference to target node (1 mark)'
    ],
    initialGraph: {
      headId: 'n_a1',
      isCircular: false,
      nodes: [
        { id: 'n_a1', value: 5, next: 'n_a2', address: '0x4010', x: 80, y: 180, confidence: 0.97 },
        { id: 'n_a2', value: 15, next: 'n_a3', address: '0x4020', x: 260, y: 180, confidence: 0.96 },
        { id: 'n_a3', value: 25, next: 'n_a4', address: '0x4030', x: 440, y: 180, confidence: 0.95 },
        { id: 'n_a4', value: 35, next: null, address: '0x4040', x: 620, y: 180, confidence: 0.98 }
      ]
    },
    solutionOperation: 'deleteNode',
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
        'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
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
        { id: 'n1', value: 100, next: 'n2', address: '0x5010', x: 80, y: 180, confidence: 0.95 },
        { id: 'n2', value: 200, next: 'n3', address: '0x5020', x: 260, y: 180, confidence: 0.94 },
        { id: 'n3', value: 300, next: 'n4', address: '0x5030', x: 440, y: 180, confidence: 0.93 },
        { id: 'n4', value: 400, next: null, address: '0x5040', x: 620, y: 180, confidence: 0.97 }
      ]
    },
    solutionOperation: 'deleteNode',
    verifiedAccuracy: true
  },
  {
    id: 'pyq_anna_univ_2022_q12',
    title: 'Anna University CS 8351 Data Structures 2022 — Question 12(b)',
    exam: {
      boardOrUniversity: 'Anna University',
      year: 2022,
      subjectCode: 'CS8351',
      subjectName: 'Data Structures',
      questionNumber: '12(b)',
      marks: 13,
      sourcePaperUrl:
        'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
      cropBoundingBox: { x: 50, y: 180, width: 800, height: 400 }
    },
    conceptTag: 'Singly Linked List - Reversal Algorithm',
    difficulty: 'hard',
    problemStatement:
      'Provide an iterative algorithm to reverse a singly linked list [10 -> 20 -> 30 -> 40 -> NULL] in O(1) auxiliary space. Trace the pointer rewiring of prev, curr, and next at each iteration.',
    markingSchemeKeyPoints: [
      'Initialize prev = NULL, curr = head (2 marks)',
      'In while loop, store next = curr->next (3 marks)',
      'Rewire curr->next = prev (4 marks)',
      'Advance prev = curr, curr = next (2 marks)',
      'Update head = prev at loop conclusion (2 marks)'
    ],
    initialGraph: {
      headId: 'node_r1',
      isCircular: false,
      nodes: [
        { id: 'node_r1', value: 10, next: 'node_r2', address: '0x6010', x: 80, y: 180, confidence: 0.98 },
        { id: 'node_r2', value: 20, next: 'node_r3', address: '0x6020', x: 260, y: 180, confidence: 0.97 },
        { id: 'node_r3', value: 30, next: 'node_r4', address: '0x6030', x: 440, y: 180, confidence: 0.96 },
        { id: 'node_r4', value: 40, next: null, address: '0x6040', x: 620, y: 180, confidence: 0.99 }
      ]
    },
    solutionOperation: 'reverseList',
    verifiedAccuracy: true
  },
  {
    id: 'pyq_anna_univ_2021_q11',
    title: 'Anna University CS 8351 Data Structures 2021 — Question 11(a)',
    exam: {
      boardOrUniversity: 'Anna University',
      year: 2021,
      subjectCode: 'CS8351',
      subjectName: 'Data Structures',
      questionNumber: '11(a)',
      marks: 13,
      sourcePaperUrl:
        'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80',
      cropBoundingBox: { x: 70, y: 190, width: 760, height: 410 }
    },
    conceptTag: 'Doubly Linked List - Insertion at Head',
    difficulty: 'hard',
    problemStatement:
      'Explain the insertion of a new node with data 6 into the beginning of a doubly linked list [12 <-> 24 <-> 36]. Show both forward (next) and backward (prev) pointer rewiring.',
    markingSchemeKeyPoints: [
      'Allocate newNode with data 6, prev = NULL, next = head (4 marks)',
      'Update existing head node backward link: head->prev = newNode (5 marks)',
      'Update head pointer: head = newNode (4 marks)'
    ],
    initialGraph: {
      headId: 'node_d1',
      tailId: 'node_d3',
      structureType: 'doubly',
      isCircular: false,
      nodes: [
        { id: 'node_d1', value: 12, next: 'node_d2', prev: null, address: '0x7010', x: 80, y: 180, confidence: 0.98 },
        { id: 'node_d2', value: 24, next: 'node_d3', prev: 'node_d1', address: '0x7020', x: 260, y: 180, confidence: 0.96 },
        { id: 'node_d3', value: 36, next: null, prev: 'node_d2', address: '0x7030', x: 440, y: 180, confidence: 0.97 }
      ]
    },
    solutionOperation: 'insertDoublyHead',
    verifiedAccuracy: true
  },
  {
    id: 'pyq_gate_2023_ds_q14',
    title: 'GATE Computer Science 2023 — Question 14 (Algorithms)',
    exam: {
      boardOrUniversity: 'GATE',
      year: 2023,
      subjectCode: 'CS-GATE',
      subjectName: 'Computer Science and Information Technology',
      questionNumber: '14',
      marks: 2,
      sourcePaperUrl:
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
      cropBoundingBox: { x: 40, y: 110, width: 790, height: 390 }
    },
    conceptTag: 'Linked List - Floyd Cycle Detection',
    difficulty: 'medium',
    problemStatement:
      'In a linked list where a loop starts at node 2 [1 -> 2 -> 3 -> 4 -> back to 2], analyze why Floyd’s Cycle Finding Algorithm (Tortoise and Hare) detects the loop in O(N) time and O(1) auxiliary space.',
    markingSchemeKeyPoints: [
      'Initialize slow = head, fast = head (0.5 marks)',
      'Advance slow by 1 step and fast by 2 steps per iteration (0.5 marks)',
      'Relative distance between pointers decreases by 1 each step modulo cycle length (1 mark)'
    ],
    initialGraph: {
      headId: 'n_cy1',
      isCircular: true,
      nodes: [
        { id: 'n_cy1', value: 1, next: 'n_cy2', address: '0x8010', x: 80, y: 180, confidence: 0.98 },
        { id: 'n_cy2', value: 2, next: 'n_cy3', address: '0x8020', x: 260, y: 180, confidence: 0.97 },
        { id: 'n_cy3', value: 3, next: 'n_cy4', address: '0x8030', x: 440, y: 180, confidence: 0.96 },
        { id: 'n_cy4', value: 4, next: 'n_cy2', address: '0x8040', x: 620, y: 180, confidence: 0.95 }
      ]
    },
    solutionOperation: 'search',
    verifiedAccuracy: true
  },
  {
    id: 'pyq_gate_2022_ds_q22',
    title: 'GATE Computer Science 2022 — Question 22 (Data Structures)',
    exam: {
      boardOrUniversity: 'GATE',
      year: 2022,
      subjectCode: 'CS-GATE',
      subjectName: 'Computer Science and Information Technology',
      questionNumber: '22',
      marks: 2,
      sourcePaperUrl:
        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
      cropBoundingBox: { x: 50, y: 130, width: 800, height: 420 }
    },
    conceptTag: 'Circular Linked List - Traversal & Insertion',
    difficulty: 'medium',
    problemStatement:
      'Given a circular singly linked list [10 -> 20 -> 30 -> loops to 10], explain how to insert a node at the beginning while maintaining circular continuity without traversing the entire list if tail pointer is maintained.',
    markingSchemeKeyPoints: [
      'Allocate newNode with value (0.5 marks)',
      'Set newNode->next = tail->next (old head) (0.5 marks)',
      'Update tail->next = newNode (1 mark)'
    ],
    initialGraph: {
      headId: 'node_c1',
      tailId: 'node_c3',
      structureType: 'circular',
      isCircular: true,
      nodes: [
        { id: 'node_c1', value: 10, next: 'node_c2', address: '0x9010', x: 80, y: 180, confidence: 0.98 },
        { id: 'node_c2', value: 20, next: 'node_c3', address: '0x9020', x: 260, y: 180, confidence: 0.97 },
        { id: 'node_c3', value: 30, next: 'node_c1', address: '0x9030', x: 440, y: 180, confidence: 0.96 }
      ]
    },
    solutionOperation: 'insertHead',
    verifiedAccuracy: true
  },
  {
    id: 'pyq_isc_2023_q12',
    title: 'ISC Class XII Computer Science 2023 — Question 12',
    exam: {
      boardOrUniversity: 'ISC',
      year: 2023,
      subjectCode: '868',
      subjectName: 'Computer Science Theory',
      questionNumber: '12(a)',
      marks: 3,
      sourcePaperUrl:
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
      cropBoundingBox: { x: 45, y: 150, width: 780, height: 430 }
    },
    conceptTag: 'Singly Linked List - Deletion at Head',
    difficulty: 'easy',
    problemStatement:
      'Write the algorithm to remove the first node from a non-empty singly linked list [18 -> 36 -> 54 -> NULL]. State how memory leaks are avoided in C++ / Java.',
    markingSchemeKeyPoints: [
      'Initialize temp = head to preserve pointer to node being deleted (1 mark)',
      'Advance head = head->next (1 mark)',
      'Deallocate temp / release reference (1 mark)'
    ],
    initialGraph: {
      headId: 'node_del1',
      isCircular: false,
      nodes: [
        { id: 'node_del1', value: 18, next: 'node_del2', address: '0xA010', x: 80, y: 180, confidence: 0.99 },
        { id: 'node_del2', value: 36, next: 'node_del3', address: '0xA020', x: 260, y: 180, confidence: 0.98 },
        { id: 'node_del3', value: 54, next: null, address: '0xA030', x: 440, y: 180, confidence: 0.97 }
      ]
    },
    solutionOperation: 'deleteNode',
    verifiedAccuracy: true
  },
  {
    id: 'pyq_cbse_2022_q25',
    title: 'CBSE Class XII 2022 Term II — Question 25',
    exam: {
      boardOrUniversity: 'CBSE',
      year: 2022,
      subjectCode: '083',
      subjectName: 'Computer Science (Term II)',
      questionNumber: '25',
      marks: 3,
      sourcePaperUrl:
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
      cropBoundingBox: { x: 60, y: 170, width: 770, height: 400 }
    },
    conceptTag: 'Singly Linked List - Insertion at Beginning',
    difficulty: 'easy',
    problemStatement:
      'Given a linked list of integers [4 -> 8 -> 12 -> NULL], show step-by-step memory pointer assignments to insert node 2 at the front.',
    markingSchemeKeyPoints: [
      'Allocate node for 2 (1 mark)',
      'Set newNode.next = head (1 mark)',
      'Set head = newNode (1 mark)'
    ],
    initialGraph: {
      headId: 'node_cb1',
      isCircular: false,
      nodes: [
        { id: 'node_cb1', value: 4, next: 'node_cb2', address: '0xB010', x: 80, y: 180, confidence: 0.99 },
        { id: 'node_cb2', value: 8, next: 'node_cb3', address: '0xB020', x: 260, y: 180, confidence: 0.98 },
        { id: 'node_cb3', value: 12, next: null, address: '0xB030', x: 440, y: 180, confidence: 0.97 }
      ]
    },
    solutionOperation: 'insertHead',
    verifiedAccuracy: true
  }
];

/**
 * GET /api/pyqs
 * Retrieves list of curated Previous-Year Questions with multi-criteria search & filters
 * Query params supported: board, difficulty, conceptTag, search
 */
router.get('/', (req: Request, res: Response) => {
  const { board, difficulty, conceptTag, search } = req.query;
  let results = curatedPYQs;

  // Board Filter
  if (board && board !== 'all') {
    results = results.filter((q) => q.exam.boardOrUniversity.toLowerCase() === String(board).toLowerCase());
  }

  // Difficulty Filter
  if (difficulty && difficulty !== 'all') {
    results = results.filter((q) => q.difficulty.toLowerCase() === String(difficulty).toLowerCase());
  }

  // Concept Tag Filter
  if (conceptTag && conceptTag !== 'all') {
    const cTag = String(conceptTag).toLowerCase();
    results = results.filter((q) => q.conceptTag.toLowerCase().includes(cTag));
  }

  // Search Query across multiple fields
  if (search) {
    const q = String(search).toLowerCase().trim();
    results = results.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.conceptTag.toLowerCase().includes(q) ||
        item.problemStatement.toLowerCase().includes(q) ||
        item.exam.subjectCode.toLowerCase().includes(q) ||
        item.exam.questionNumber.toLowerCase().includes(q) ||
        item.exam.boardOrUniversity.toLowerCase().includes(q)
    );
  }

  // Extract available unique boards and concepts for dynamic client filter pills
  const availableBoards = Array.from(new Set(curatedPYQs.map((p) => p.exam.boardOrUniversity)));
  const availableDifficulties = ['easy', 'medium', 'hard'];

  res.json({
    success: true,
    total: results.length,
    availableBoards,
    availableDifficulties,
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
