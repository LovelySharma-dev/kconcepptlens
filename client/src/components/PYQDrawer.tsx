import React, { useState, useEffect } from 'react';
import { PYQ } from '@conceptlens/shared';
import {
  PlayCircle,
  Search,
  CheckCircle2,
  BookOpen,
  Award,
  Video,
  Maximize2,
  X
} from 'lucide-react';

interface PYQDrawerProps {
  onLoadPYQ: (pyq: PYQ) => void;
  onNavigateToISL?: (conceptTag: string) => void;
}

// Built-in resilient fallback questions
const defaultFallbackPYQs: PYQ[] = [
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
    verifiedAccuracy: false
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
    verifiedAccuracy: false
  }
];

export const PYQDrawer: React.FC<PYQDrawerProps> = ({ onLoadPYQ, onNavigateToISL }) => {
  const [pyqs, setPyqs] = useState<PYQ[]>(defaultFallbackPYQs);
  const [selectedPYQ, setSelectedPYQ] = useState<PYQ>(defaultFallbackPYQs[0]);
  const [filterBoard, setFilterBoard] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);

  // Fetch PYQs from API with query parameters
  useEffect(() => {
    let isMounted = true;
    async function fetchPYQs() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (filterBoard !== 'all') params.append('board', filterBoard);
        if (filterDifficulty !== 'all') params.append('difficulty', filterDifficulty);
        if (searchQuery.trim()) params.append('search', searchQuery.trim());

        const res = await fetch(`/api/pyqs?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && json.data.length > 0) {
            if (isMounted) {
              setPyqs(json.data);
              // Preserve selection if present in new results, else select first
              setSelectedPYQ((prev) => {
                const found = json.data.find((q: PYQ) => q.id === prev.id);
                return found || json.data[0];
              });
            }
          }
        }
      } catch (err) {
        console.warn('Using client fallback PYQs due to network error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    const timer = setTimeout(fetchPYQs, 150);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [filterBoard, filterDifficulty, searchQuery]);

  // Board color badge helper
  const getBoardBadgeStyle = (board: string) => {
    switch (board) {
      case 'ISC':
        return { color: '#c084fc', background: 'rgba(192, 132, 252, 0.15)', border: '1px solid rgba(192, 132, 252, 0.3)' };
      case 'CBSE':
        return { color: '#38bdf8', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)' };
      case 'Anna University':
        return { color: '#34d399', background: 'rgba(52, 211, 153, 0.15)', border: '1px solid rgba(52, 211, 153, 0.3)' };
      case 'GATE':
        return { color: '#fbbf24', background: 'rgba(251, 191, 36, 0.15)', border: '1px solid rgba(251, 191, 36, 0.3)' };
      default:
        return { color: '#94a3b8', background: 'rgba(148, 163, 184, 0.15)', border: '1px solid rgba(148, 163, 184, 0.3)' };
    }
  };

  // Difficulty badge helper
  const getDifficultyBadgeStyle = (diff: string) => {
    switch (diff) {
      case 'easy':
        return { color: '#4ade80', background: 'rgba(74, 222, 128, 0.15)' };
      case 'medium':
        return { color: '#facc15', background: 'rgba(250, 204, 21, 0.15)' };
      case 'hard':
        return { color: '#f87171', background: 'rgba(248, 113, 113, 0.15)' };
      default:
        return { color: '#94a3b8', background: 'rgba(148, 163, 184, 0.15)' };
    }
  };

  return (
    <div>
      {/* Top Filter and Search Bar */}
      <div className="glass-panel" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={20} color="var(--accent-cyan)" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                Linked-list practice prompts
              </h2>
              <span className="brand-badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-cyan)' }}>
                {pyqs.length} prompts
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              These prompts cite board-style topics. They are not marked as verified past papers in this build. Use them to practice pointer steps, and open the cited link separately.
            </p>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '260px' }}>
            <Search
              size={16}
              style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              placeholder="Search by topic, code, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: '#020617',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.45rem 0.75rem 0.45rem 2rem',
                color: '#f8fafc',
                fontSize: '0.85rem'
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Filter Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
          {/* Board Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: '0.25rem' }}>
              Board:
            </span>
            {['all', 'ISC', 'CBSE', 'Anna University', 'GATE'].map((b) => (
              <button
                key={b}
                type="button"
                className={`btn-secondary ${filterBoard === b ? 'active' : ''}`}
                style={{
                  padding: '0.25rem 0.65rem',
                  fontSize: '0.75rem',
                  background: filterBoard === b ? 'rgba(56, 189, 248, 0.2)' : undefined,
                  borderColor: filterBoard === b ? 'var(--accent-cyan)' : undefined,
                  color: filterBoard === b ? 'var(--accent-cyan)' : undefined
                }}
                onClick={() => setFilterBoard(b)}
              >
                {b === 'all' ? 'All Boards' : b}
              </button>
            ))}
          </div>

          {/* Difficulty Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: '0.25rem' }}>
              Difficulty:
            </span>
            {['all', 'easy', 'medium', 'hard'].map((d) => (
              <button
                key={d}
                type="button"
                className={`btn-secondary ${filterDifficulty === d ? 'active' : ''}`}
                style={{
                  padding: '0.25rem 0.65rem',
                  fontSize: '0.75rem',
                  textTransform: 'capitalize',
                  background: filterDifficulty === d ? 'rgba(255, 255, 255, 0.15)' : undefined,
                  borderColor: filterDifficulty === d ? '#ffffff' : undefined
                }}
                onClick={() => setFilterDifficulty(d)}
              >
                {d === 'all' ? 'All Levels' : d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Split-Screen Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.6fr', gap: '1.5rem' }}>
        {/* Left Column: Question Card List */}
        <div className="glass-panel" style={{ maxHeight: '720px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc' }}>
              Available Questions ({pyqs.length})
            </h3>
            {isLoading && (
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>Filtering...</span>
            )}
          </div>

          {pyqs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '0.9rem' }}>No past year questions match your filters.</p>
              <button
                type="button"
                className="btn-secondary"
                style={{ marginTop: '0.75rem', fontSize: '0.8rem' }}
                onClick={() => {
                  setFilterBoard('all');
                  setFilterDifficulty('all');
                  setSearchQuery('');
                }}
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {pyqs.map((pyq) => {
                const isSelected = selectedPYQ?.id === pyq.id;
                const boardStyle = getBoardBadgeStyle(pyq.exam.boardOrUniversity);
                const diffStyle = getDifficultyBadgeStyle(pyq.difficulty);

                return (
                  <div
                    key={pyq.id}
                    tabIndex={0}
                    role="button"
                    onClick={() => setSelectedPYQ(pyq)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedPYQ(pyq);
                      }
                    }}
                    style={{
                      padding: '0.85rem 1rem',
                      background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                      border: `1px solid ${isSelected ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                      outline: isSelected ? '2px solid rgba(56, 189, 248, 0.4)' : undefined
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            ...boardStyle
                          }}
                        >
                          {pyq.exam.boardOrUniversity} • {pyq.exam.year}
                        </span>
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            textTransform: 'capitalize',
                            ...diffStyle
                          }}
                        >
                          {pyq.difficulty}
                        </span>
                      </div>

                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          background: 'rgba(255, 255, 255, 0.08)',
                          color: '#e2e8f0',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px'
                        }}
                      >
                        {pyq.exam.marks} Marks
                      </span>
                    </div>

                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.25rem', lineHeight: 1.35 }}>
                      {pyq.title}
                    </h4>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <span>{pyq.conceptTag}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--accent-cyan)' }}>
                        Q{pyq.exam.questionNumber}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Detailed Question Inspector */}
        {selectedPYQ ? (
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Action Bar Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      ...getBoardBadgeStyle(selectedPYQ.exam.boardOrUniversity)
                    }}
                  >
                    {selectedPYQ.exam.boardOrUniversity} {selectedPYQ.exam.year}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Subject Code: {selectedPYQ.exam.subjectCode} • {selectedPYQ.exam.questionNumber}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
                  {selectedPYQ.title}
                </h3>
              </div>

              {/* Practice in Visualizer Button */}
              <button
                type="button"
                className="btn-primary"
                onClick={() => onLoadPYQ(selectedPYQ)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.6rem 1.2rem',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  boxShadow: '0 0 15px rgba(56, 189, 248, 0.35)'
                }}
              >
                <PlayCircle size={18} />
                <span>Practice in Sandbox</span>
              </button>
            </div>

            {/* Problem Statement Card */}
            <div>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Official Problem Statement
              </h4>
              <div
                style={{
                  background: 'rgba(2, 6, 23, 0.7)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  color: '#e2e8f0',
                  borderLeft: '4px solid var(--accent-cyan)'
                }}
              >
                {selectedPYQ.problemStatement}
              </div>
            </div>

            {/* Initial Graph Node Preview */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.02)', padding: '0.65rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Starting Linked List Nodes:
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  {selectedPYQ.initialGraph.nodes.map((node, i) => (
                    <span key={node.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span
                        style={{
                          background: 'rgba(56, 189, 248, 0.15)',
                          border: '1px solid var(--accent-cyan)',
                          color: 'var(--accent-cyan)',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700
                        }}
                      >
                        {String(node.value)}
                      </span>
                      {i < selectedPYQ.initialGraph.nodes.length - 1 && (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>→</span>
                      )}
                    </span>
                  ))}
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {selectedPYQ.initialGraph.isCircular ? '↺ (Head)' : '→ NULL'}
                  </span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target Operation:</span>
                <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)', fontWeight: 600, fontSize: '0.85rem' }}>
                  {selectedPYQ.solutionOperation}()
                </div>
              </div>
            </div>

            {/* Source Paper Scan Preview with Coordinates */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Cited source — not re-checked against a paper in this build
                </h4>
                <button
                  type="button"
                  onClick={() => setIsImageModalOpen(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-cyan)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  <Maximize2 size={13} /> Open citation
                </button>
              </div>

              <div
                style={{
                  height: '170px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  border: '1px solid var(--border-subtle)',
                  position: 'relative',
                  background: '#020617'
                }}
              >
                <div style={{ padding: '0.85rem 0.9rem', fontSize: '0.8rem', lineHeight: 1.45, color: 'var(--text-secondary)' }}>
                  {selectedPYQ.verifiedAccuracy
                    ? 'Marked verified in the catalog.'
                    : 'This item is a practice prompt. The link below is a citation, not confirmed paper evidence, and it is not a Cloudinary asset unless the URL is on res.cloudinary.com.'}
                  <div style={{ marginTop: '0.45rem' }}>
                    <a href={selectedPYQ.exam.sourcePaperUrl} target="_blank" rel="noreferrer">Open cited link</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Marking Scheme Rubric */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                <Award size={15} color="var(--accent-emerald)" />
                <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Practice notes ({selectedPYQ.exam.marks} marks) — not an official mark scheme
                </h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {selectedPYQ.markingSchemeKeyPoints.map((point, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.5rem',
                      background: 'rgba(16, 185, 129, 0.05)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.85rem'
                    }}
                  >
                    <CheckCircle2 size={16} color="var(--accent-emerald)" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span style={{ color: '#f1f5f9' }}>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation to ISL Video Lesson */}
            {onNavigateToISL && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(192, 132, 252, 0.08)', border: '1px solid rgba(192, 132, 252, 0.25)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Video size={18} color="#c084fc" />
                  <span style={{ fontSize: '0.85rem', color: '#e2e8f0' }}>
                    Open the written explanation for <strong>{selectedPYQ.conceptTag}</strong>. Sign-language video is not included.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateToISL(selectedPYQ.conceptTag)}
                  className="btn-secondary"
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.3rem 0.75rem',
                    color: '#c084fc',
                    borderColor: 'rgba(192, 132, 252, 0.4)'
                  }}
                >
                  Open the text lesson
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Fullscreen Image Lightbox Modal */}
      {isImageModalOpen && selectedPYQ && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="High-resolution question paper scan preview"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}
          onClick={() => setIsImageModalOpen(false)}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '900px',
              width: '100%',
              background: '#090d16',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                  {selectedPYQ.title} — Original Source Paper
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Cited link • stored crop box [x:{selectedPYQ.exam.cropBoundingBox.x}, y:{selectedPYQ.exam.cropBoundingBox.y}, w:{selectedPYQ.exam.cropBoundingBox.width}, h:{selectedPYQ.exam.cropBoundingBox.height}]
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="icon-btn"
                aria-label="Close image modal"
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ margin: 0, lineHeight: 1.5, color: 'var(--text-secondary)' }}>
              <a href={selectedPYQ.exam.sourcePaperUrl} target="_blank" rel="noreferrer">{selectedPYQ.exam.sourcePaperUrl}</a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PYQDrawer;
