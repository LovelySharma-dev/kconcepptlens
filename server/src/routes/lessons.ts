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
  islResource: {
    id: 'isl_linked_list_intro',
    title: 'Indian Sign Language (ISL): Introduction to Linked Lists & Pointers',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl:
      'https://images.openai.com/static-rsc-4/oOF1abGF7psRXPa83H4p5CKkqR4Oy5oV7Yet0R8O0n4fmAUz__PAZlwzy6whF7CqoJz7TsXq0iXqyXwPy2YA7lzILOynS-Cp9W11Tlt7gvPfTG4_Fa4kl9mQPVU1KVx5iArse5fuiEEzS9Lxz_BMIyTn1O2LGk3VkNpG7K-TTvM?purpose=inline',
    vttCaptionsUrl: '/captions/isl_intro.vtt',
    transcriptText:
      '[00:00] Hello! Today we learn about Linked Lists in Data Structures.\n[00:05] A node has two parts: data and a pointer.\n[00:10] The pointer points to the address of the next node.\n[00:15] The first node is called the HEAD.\n[00:20] The last node points to NULL, indicating the end of the list.',
    verifiedByExpert: true,
    expertName: 'National Association of the Deaf (NAD) Certified Educator'
  },
  connectedPYQIds: ['pyq_isc_2025_q11', 'pyq_anna_univ_2019_q13']
};

router.get('/:id', (req: Request, res: Response) => {
  if (req.params.id === 'lesson_linked_list_basics' || req.params.id === 'default') {
    return res.json({ success: true, data: sampleLesson });
  }
  res.status(404).json({ success: false, error: 'Lesson not found' });
});

export default router;
