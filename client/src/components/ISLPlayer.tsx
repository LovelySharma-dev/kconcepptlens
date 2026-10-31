import React, { useState, useRef } from 'react';
import {
  ShieldCheck,
  Search,
  MessageSquareQuote,
  ExternalLink,
  Sparkles,
  HelpCircle,
  Clock
} from 'lucide-react';
import { LinkedListGraph } from '@conceptlens/shared';

export interface ISLLesson {
  id: string;
  title: string;
  topic: string;
  duration: string;
  curriculumLead: string;
  pedagogicalFocus: string;
  videoUrl: string;
  posterUrl: string;
  baseGraph: LinkedListGraph;
  targetOperation: string;
  transcript: {
    id: string;
    start: number; // in seconds
    end: number;
    timeLabel: string;
    text: string;
    activeNodes?: string[];
    diagramNote?: string;
  }[];
}

export const islLessons: ISLLesson[] = [
  {
    id: 'isl_linked_list_intro',
    title: 'Lesson 1: Introduction to Singly Linked Lists & Nodes',
    topic: 'Foundations of Data Structures',
    duration: '0:50',
    curriculumLead: 'English text only',
    pedagogicalFocus: 'Text explanation of nodes and pointers',
    videoUrl: '',
    posterUrl:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    targetOperation: 'search',
    baseGraph: {
      headId: 'node_1',
      structureType: 'singly',
      isCircular: false,
      nodes: [
        { id: 'node_1', value: 10, next: 'node_2', address: '0x1020', x: 80, y: 180, confidence: 1.0 },
        { id: 'node_2', value: 20, next: 'node_3', address: '0x1040', x: 260, y: 180, confidence: 1.0 },
        { id: 'node_3', value: 30, next: null, address: '0x1060', x: 440, y: 180, confidence: 1.0 }
      ]
    },
    transcript: [
      {
        id: 'c1',
        start: 0,
        end: 6,
        timeLabel: '00:00',
        text: 'This is an English text explanation of a singly linked list. It is not an Indian Sign Language translation.',
        diagramNote: 'Overview of Linked List representation'
      },
      {
        id: 'c2',
        start: 6,
        end: 12,
        timeLabel: '00:06',
        text: 'Unlike arrays where items are stored in consecutive memory, linked list nodes can reside anywhere.',
        activeNodes: ['node_1', 'node_2', 'node_3'],
        diagramNote: 'Dynamic heap allocation illustrated'
      },
      {
        id: 'c3',
        start: 12,
        end: 20,
        timeLabel: '00:12',
        text: 'Each node consists of two essential parts: the Data value and the Next pointer.',
        activeNodes: ['node_1'],
        diagramNote: 'Inspecting Node [15 | 0x1040]'
      },
      {
        id: 'c4',
        start: 20,
        end: 28,
        timeLabel: '00:20',
        text: 'The pointer stores the memory address of the subsequent node in the sequence.',
        activeNodes: ['node_1', 'node_2'],
        diagramNote: 'Pointer arrow 0x1020 -> 0x1040'
      },
      {
        id: 'c5',
        start: 28,
        end: 36,
        timeLabel: '00:28',
        text: 'The very first node is designated as the HEAD pointer.',
        activeNodes: ['node_1'],
        diagramNote: 'HEAD pointer points to node_1'
      },
      {
        id: 'c6',
        start: 36,
        end: 45,
        timeLabel: '00:36',
        text: 'The terminal node contains a next pointer pointing to NULL, indicating the end.',
        activeNodes: ['node_3'],
        diagramNote: 'node_3 -> NULL terminator'
      }
    ]
  },
  {
    id: 'isl_insert_head',
    title: 'Lesson 2: Inserting a Node at Head (Pointer Rewiring)',
    topic: 'Pointer Mutations & Complexity',
    duration: '0:45',
    curriculumLead: 'English text only',
    pedagogicalFocus: 'Text explanation of inserting at the head',
    videoUrl: '',
    posterUrl:
      'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80',
    targetOperation: 'insertHead',
    baseGraph: {
      headId: 'node_1',
      structureType: 'singly',
      isCircular: false,
      nodes: [
        { id: 'node_1', value: 15, next: 'node_2', address: '0x1020', x: 80, y: 180, confidence: 1.0 },
        { id: 'node_2', value: 28, next: 'node_3', address: '0x1040', x: 260, y: 180, confidence: 1.0 },
        { id: 'node_3', value: 42, next: null, address: '0x1060', x: 440, y: 180, confidence: 1.0 }
      ]
    },
    transcript: [
      {
        id: 'c21',
        start: 0,
        end: 8,
        timeLabel: '00:00',
        text: 'Today we learn inserting at the head of a singly linked list in O(1) time complexity.',
        diagramNote: 'Initial List: [15 -> 28 -> 42 -> NULL]'
      },
      {
        id: 'c22',
        start: 8,
        end: 18,
        timeLabel: '00:08',
        text: 'Step 1: Allocate memory for the new node and assign its data value (for example, 9).',
        activeNodes: ['node_new'],
        diagramNote: 'New node allocated at 0x1000'
      },
      {
        id: 'c23',
        start: 18,
        end: 28,
        timeLabel: '00:18',
        text: 'Step 2: Connect the new node next pointer to the current head node.',
        activeNodes: ['node_new', 'node_1'],
        diagramNote: 'newNode->next = head'
      },
      {
        id: 'c24',
        start: 28,
        end: 40,
        timeLabel: '00:28',
        text: 'Step 3: Update head pointer to reference the new node. The insertion is complete!',
        activeNodes: ['node_new'],
        diagramNote: 'head = newNode (Final state)'
      }
    ]
  },
  {
    id: 'isl_cycle_detection',
    title: 'Lesson 3: Floyd Cycle Finding Algorithm (Tortoise & Hare)',
    topic: 'Cycle Detection & Invariants',
    duration: '0:50',
    curriculumLead: 'English text only',
    pedagogicalFocus: 'Text explanation of cycle detection',
    videoUrl: '',
    posterUrl:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    targetOperation: 'search',
    baseGraph: {
      headId: 'n_cy1',
      structureType: 'singly',
      isCircular: false,
      nodes: [
        { id: 'n_cy1', value: 1, next: 'n_cy2', address: '0x8010', x: 80, y: 180, confidence: 1.0 },
        { id: 'n_cy2', value: 2, next: 'n_cy3', address: '0x8020', x: 260, y: 180, confidence: 1.0 },
        { id: 'n_cy3', value: 3, next: 'n_cy4', address: '0x8030', x: 440, y: 180, confidence: 1.0 },
        { id: 'n_cy4', value: 4, next: 'n_cy2', address: '0x8040', x: 620, y: 180, confidence: 1.0 }
      ]
    },
    transcript: [
      {
        id: 'c31',
        start: 0,
        end: 10,
        timeLabel: '00:00',
        text: 'When a linked list loops back on itself, simple traversal causes an infinite loop.',
        diagramNote: 'Cycle warning between node 4 and node 2'
      },
      {
        id: 'c32',
        start: 10,
        end: 22,
        timeLabel: '00:10',
        text: 'Floyd cycle finding algorithm uses two pointers: Slow (Tortoise) and Fast (Hare).',
        activeNodes: ['n_cy1'],
        diagramNote: 'slow = head, fast = head'
      },
      {
        id: 'c33',
        start: 22,
        end: 35,
        timeLabel: '00:22',
        text: 'Slow moves one node at a time, while fast advances two nodes per step.',
        activeNodes: ['n_cy2', 'n_cy3'],
        diagramNote: 'slow = slow->next; fast = fast->next->next'
      },
      {
        id: 'c34',
        start: 35,
        end: 48,
        timeLabel: '00:35',
        text: 'If slow and fast meet at the same node, a cycle is mathematically guaranteed to exist!',
        activeNodes: ['n_cy2'],
        diagramNote: 'slow == fast: Loop confirmed'
      }
    ]
  },
  {
    id: 'isl_doubly_linked_list',
    title: 'Lesson 4: Doubly Linked Lists & Bidirectional Pointers',
    topic: 'Doubly Linked Lists',
    duration: '0:45',
    curriculumLead: 'English text only',
    pedagogicalFocus: 'Text explanation of doubly linked lists',
    videoUrl: '',
    posterUrl:
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80',
    targetOperation: 'insertDoublyHead',
    baseGraph: {
      headId: 'node_d1',
      tailId: 'node_d3',
      structureType: 'doubly',
      isCircular: false,
      nodes: [
        { id: 'node_d1', value: 12, next: 'node_d2', prev: null, address: '0x7010', x: 80, y: 180, confidence: 1.0 },
        { id: 'node_d2', value: 24, next: 'node_d3', prev: 'node_d1', address: '0x7020', x: 260, y: 180, confidence: 1.0 },
        { id: 'node_d3', value: 36, next: null, prev: 'node_d2', address: '0x7030', x: 440, y: 180, confidence: 1.0 }
      ]
    },
    transcript: [
      {
        id: 'c41',
        start: 0,
        end: 10,
        timeLabel: '00:00',
        text: 'In a Doubly Linked List, every node has two pointers: next and previous (prev).',
        diagramNote: 'Forward (next) in Blue, Backward (prev) in Amber'
      },
      {
        id: 'c42',
        start: 10,
        end: 22,
        timeLabel: '00:10',
        text: 'This allows two-way traversal: forward from head to tail, or backward from tail to head.',
        activeNodes: ['node_d1', 'node_d2', 'node_d3'],
        diagramNote: 'Bidirectional pointer arcs'
      },
      {
        id: 'c43',
        start: 22,
        end: 42,
        timeLabel: '00:22',
        text: 'When inserting or deleting, both the next pointer and prev pointer must be rewired.',
        activeNodes: ['node_d1'],
        diagramNote: 'prev->next and next->prev sync'
      }
    ]
  }
];

interface ISLPlayerProps {
  onLoadLessonIntoSandbox?: (graph: LinkedListGraph, operation: string) => void;
  onOpenKeyboardShortcuts?: () => void;
}

export const ISLPlayer: React.FC<ISLPlayerProps> = ({
  onLoadLessonIntoSandbox,
  onOpenKeyboardShortcuts
}) => {
  const [activeLesson, setActiveLesson] = useState<ISLLesson>(islLessons[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeCueId, setActiveCueId] = useState<string>('c1');

  const videoRef = useRef<HTMLVideoElement>(null);
  const activeCueRef = useRef<HTMLDivElement>(null);

  // Time update listener on video element
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);

    // Identify active cue
    const currentCue = activeLesson.transcript.find(
      (c) => time >= c.start && time < c.end
    );
    if (currentCue && currentCue.id !== activeCueId) {
      setActiveCueId(currentCue.id);
    }
  };

  // Seek video when student clicks a transcript cue
  const handleSeekToCue = (startSeconds: number, cueId: string) => {
    setCurrentTime(startSeconds);
    setActiveCueId(cueId);
    if (videoRef.current && activeLesson.videoUrl) {
      videoRef.current.currentTime = startSeconds;
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
      }
    }
  };

  // Speed change handler
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  // Switch Lesson
  const handleSelectLesson = (lesson: ISLLesson) => {
    setActiveLesson(lesson);
    setCurrentTime(0);
    setActiveCueId(lesson.transcript[0]?.id || '');
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.playbackRate = playbackSpeed;
    }
  };

  const filteredTranscript = activeLesson.transcript.filter((t) =>
    t.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentActiveCue = activeLesson.transcript.find((c) => c.id === activeCueId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Lesson Selector Bar */}
      <div className="glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--accent-emerald)',
                  background: 'rgba(16, 185, 129, 0.15)',
                  padding: '0.2rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <ShieldCheck size={14} /> High contrast and keyboard access
              </span>
              <span className="brand-badge" style={{ background: 'rgba(192, 132, 252, 0.15)', color: '#c084fc' }}>
                Text lesson — ISL video not included
              </span>
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '0.35rem' }}>
              Accessible text lessons
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              English explanations you can search and step through with the keyboard. Authentic Indian Sign Language video is not part of this build, so these captions are not labeled as ISL.
            </p>
            <div className="sr-only" aria-live="polite">
              {currentActiveCue ? currentActiveCue.text : ''}
            </div>
          </div>

          {onOpenKeyboardShortcuts && (
            <button
              type="button"
              className="btn-secondary"
              onClick={onOpenKeyboardShortcuts}
              style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <HelpCircle size={15} /> Keyboard Shortcuts (?)
            </button>
          )}
        </div>

        {/* Multi-Lesson Switcher Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
          {islLessons.map((lesson) => {
            const isSelected = lesson.id === activeLesson.id;
            return (
              <button
                key={lesson.id}
                type="button"
                className={`btn-secondary ${isSelected ? 'active' : ''}`}
                style={{
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  background: isSelected ? 'rgba(192, 132, 252, 0.2)' : undefined,
                  borderColor: isSelected ? '#c084fc' : undefined,
                  color: isSelected ? '#f8fafc' : undefined
                }}
                onClick={() => handleSelectLesson(lesson)}
              >
                <Clock size={13} color={isSelected ? '#c084fc' : 'var(--text-muted)'} />
                <span>{lesson.title}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  ({lesson.duration})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Video & Transcript Split View */}
      <div className="lesson-layout">
        {/* Left Column: Video Player & Synchronized Visual Reference */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', overflowWrap: 'anywhere' }}>
                {activeLesson.title}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                <ShieldCheck size={14} color="var(--accent-emerald)" />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {activeLesson.curriculumLead} • <em>{activeLesson.pedagogicalFocus}</em>
                </span>
              </div>
            </div>

            {/* Playback Speed Switcher & Timer */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', background: 'rgba(56, 189, 248, 0.1)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                {Math.floor(currentTime / 60).toString().padStart(2, '0')}:{(Math.floor(currentTime) % 60).toString().padStart(2, '0')} / {activeLesson.duration}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Speed:</span>
              {[0.75, 1.0, 1.25, 1.5].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`btn-secondary ${playbackSpeed === s ? 'active' : ''}`}
                  style={{
                    padding: '0.2rem 0.5rem',
                    fontSize: '0.75rem',
                    background: playbackSpeed === s ? '#c084fc' : undefined,
                    color: playbackSpeed === s ? '#000000' : undefined,
                    borderColor: playbackSpeed === s ? '#c084fc' : undefined,
                    fontWeight: playbackSpeed === s ? 700 : 400
                  }}
                  onClick={() => handleSpeedChange(s)}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* Video Player Frame */}
          <div
            style={{
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              background: '#020617',
              border: '1px solid var(--border-subtle)',
              position: 'relative'
            }}
          >
            {activeLesson.videoUrl ? (
              <video
                ref={videoRef}
                controls
                onTimeUpdate={handleTimeUpdate}
                poster={activeLesson.posterUrl}
                style={{ width: '100%', maxHeight: '360px', display: 'block', outline: 'none' }}
                aria-label={activeLesson.title}
              >
                <source src={activeLesson.videoUrl} type="video/mp4" />
                <track kind="captions" srcLang="en" label="English captions" default />
                Your browser does not support HTML5 video.
              </video>
            ) : (
              <div style={{ padding: '1.25rem 1.1rem', minHeight: '180px' }} role="note">
                <p style={{ margin: '0 0 0.75rem 0', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  No sign-language video is attached to this lesson. Use the transcript to move through the explanation. Arrow keys work when a transcript line is focused.
                </p>
                <p style={{ margin: 0, fontSize: '1rem', lineHeight: 1.55, color: 'var(--text-primary)' }}>
                  {currentActiveCue?.text}
                </p>
              </div>
            )}

            {/* Live Diagram Synchronized Callout Overlay */}
            {currentActiveCue?.diagramNote && (
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: 'rgba(2, 6, 23, 0.88)',
                  backdropFilter: 'blur(6px)',
                  border: '1px solid rgba(192, 132, 252, 0.4)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  color: '#e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                }}
              >
                <Sparkles size={13} color="#c084fc" />
                <span>
                  Diagram Reference: <strong>{currentActiveCue.diagramNote}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Synchronized Lesson Action Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem'
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active Concept:</span>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                {activeLesson.topic}
              </div>
            </div>

            {onLoadLessonIntoSandbox && (
              <button
                type="button"
                className="btn-primary"
                onClick={() => onLoadLessonIntoSandbox(activeLesson.baseGraph, activeLesson.targetOperation)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.5rem 1rem',
                  fontSize: '0.85rem',
                  background: 'linear-gradient(135deg, #9333ea, #6366f1)'
                }}
              >
                <ExternalLink size={15} />
                <span>Launch in Interactive Studio</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Searchable Interactive WebVTT Transcript */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', maxHeight: '550px' }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MessageSquareQuote size={18} color="#c084fc" />
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc' }}>
                  Synchronized Transcript
                </h3>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Click timestamp to seek
              </span>
            </div>

            {/* Keyword Search Filter */}
            <div style={{ position: 'relative' }}>
              <Search
                size={14}
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                placeholder="Search transcript (e.g. head, pointer, slow)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  background: '#020617',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.4rem 0.6rem 0.4rem 2rem',
                  color: '#f8fafc',
                  fontSize: '0.8rem'
                }}
              />
            </div>
          </div>

          {/* Transcript Cues List */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.25rem' }}>
            {filteredTranscript.map((cue) => {
              const isActive = cue.id === activeCueId;

              return (
                <div
                  key={cue.id}
                  ref={isActive ? activeCueRef : null}
                  tabIndex={0}
                  role="button"
                  onClick={() => handleSeekToCue(cue.start, cue.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSeekToCue(cue.start, cue.id);
                    }
                  }}
                  style={{
                    padding: '0.7rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    background: isActive ? 'rgba(192, 132, 252, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${isActive ? '#c084fc' : 'var(--border-subtle)'}`,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    outline: isActive ? '2px solid rgba(192, 132, 252, 0.4)' : undefined
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: isActive ? '#c084fc' : 'var(--accent-cyan)'
                      }}
                    >
                      [{cue.timeLabel}]
                    </span>
                    {isActive && (
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          color: '#c084fc',
                          textTransform: 'uppercase',
                          background: 'rgba(192, 132, 252, 0.2)',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '4px'
                        }}
                      >
                        Playing Now
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: '0.85rem', color: isActive ? '#ffffff' : 'var(--text-primary)', lineHeight: 1.45 }}>
                    {cue.text}
                  </p>

                  {cue.diagramNote && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', fontStyle: 'italic' }}>
                      ↳ {cue.diagramNote}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredTranscript.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No sentences matched "{searchQuery}".
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ISLPlayer;
