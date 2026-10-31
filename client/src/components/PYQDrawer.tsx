import React, { useState } from 'react';
import { PYQ } from '@conceptlens/shared';
import { PlayCircle } from 'lucide-react';

interface PYQDrawerProps {
  onLoadPYQ: (pyq: PYQ) => void;
}

const mockPYQs: PYQ[] = [
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

export const PYQDrawer: React.FC<PYQDrawerProps> = ({ onLoadPYQ }) => {
  const [selectedPYQ, setSelectedPYQ] = useState<PYQ>(mockPYQs[0]);
  const [filterBoard, setFilterBoard] = useState<string>('all');

  const filtered =
    filterBoard === 'all'
      ? mockPYQs
      : mockPYQs.filter((p) => p.exam.boardOrUniversity === filterBoard);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '1.5rem' }}>
      {/* Question List Column */}
      <div className="glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Previous Year Questions</h3>
          <select
            value={filterBoard}
            onChange={(e) => setFilterBoard(e.target.value)}
            style={{
              background: '#020617',
              border: '1px solid var(--border-subtle)',
              color: '#ffffff',
              borderRadius: 'var(--radius-sm)',
              padding: '0.3rem 0.5rem',
              fontSize: '0.8rem'
            }}
          >
            <option value="all">All Boards & Univs</option>
            <option value="ISC">ISC Class XII</option>
            <option value="Anna University">Anna University</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map((pyq) => {
            const isSelected = selectedPYQ.id === pyq.id;
            return (
              <div
                key={pyq.id}
                tabIndex={0}
                role="button"
                onClick={() => setSelectedPYQ(pyq)}
                style={{
                  padding: '1rem',
                  background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${isSelected ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: 'var(--accent-cyan)',
                      textTransform: 'uppercase'
                    }}
                  >
                    {pyq.exam.boardOrUniversity} • {pyq.exam.year}
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: 'rgba(255, 255, 255, 0.1)',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px'
                    }}
                  >
                    {pyq.exam.marks} Marks
                  </span>
                </div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.35rem' }}>
                  {pyq.title}
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {pyq.conceptTag}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail & Paper Preview Column */}
      <div className="glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
              Question {selectedPYQ.exam.questionNumber}
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2px' }}>
              {selectedPYQ.title}
            </h3>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={() => onLoadPYQ(selectedPYQ)}
          >
            <PlayCircle size={18} />
            <span>Practice in Visualizer</span>
          </button>
        </div>

        {/* Problem Statement */}
        <div
          style={{
            background: 'rgba(2, 6, 23, 0.6)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1rem',
            fontSize: '0.9rem',
            lineHeight: 1.6
          }}
        >
          {selectedPYQ.problemStatement}
        </div>

        {/* Original Paper Crop View */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
            Original Question Paper Page (Traceable Source Evidence):
          </h4>
          <div
            style={{
              height: '180px',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              border: '1px solid var(--border-subtle)',
              position: 'relative'
            }}
          >
            <img
              src={selectedPYQ.exam.sourcePaperUrl}
              alt="Original question paper scan"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                background: 'rgba(0, 0, 0, 0.75)',
                padding: '0.25rem 0.6rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                color: '#ffffff'
              }}
            >
              Source: {selectedPYQ.exam.subjectName}
            </div>
          </div>
        </div>

        {/* Marking Scheme Points */}
        <div>
          <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
            Official Marking Scheme Criteria:
          </h4>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
            {selectedPYQ.markingSchemeKeyPoints.map((pt, i) => (
              <li key={i} style={{ color: 'var(--text-primary)' }}>
                {pt}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
