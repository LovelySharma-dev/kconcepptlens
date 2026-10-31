import React, { useState, useEffect, useCallback } from 'react';
import {
  LinkedListGraph,
  ExecutionStep,
  ValidationResult,
  PYQ
} from '@conceptlens/shared';
import { InteractiveCanvas } from './components/InteractiveCanvas';
import { StepControls } from './components/StepControls';
import { StateInspector } from './components/StateInspector';
import { MediaUploader } from './components/MediaUploader';
import { ValidationInspector } from './components/ValidationInspector';
import { PYQDrawer } from './components/PYQDrawer';
import { ISLPlayer } from './components/ISLPlayer';
import { LiveAnnouncer } from './components/LiveAnnouncer';
import {
  Eye,
  Volume2,
  BookOpen,
  Video,
  ShieldAlert,
  PlayCircle
} from 'lucide-react';

// Default Initial Graph (3-node standard)
const initialDefaultGraph: LinkedListGraph = {
  headId: 'node_1',
  isCircular: false,
  nodes: [
    { id: 'node_1', value: 15, next: 'node_2', x: 80, y: 180, confidence: 0.98 },
    { id: 'node_2', value: 28, next: 'node_3', x: 260, y: 180, confidence: 0.96 },
    { id: 'node_3', value: 42, next: null, x: 440, y: 180, confidence: 0.97 }
  ]
};

export const App: React.FC = () => {
  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<'visualizer' | 'pyq' | 'isl' | 'gates'>('visualizer');

  // Accessibility States
  const [highContrast, setHighContrast] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState('Welcome to ConceptLens 2.0.');

  // Core Simulation States
  const [graph, setGraph] = useState<LinkedListGraph>(initialDefaultGraph);
  const [steps, setSteps] = useState<ExecutionStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [currentOperation, setCurrentOperation] = useState<string>('insertHead');

  // Gate & Validation States
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    needsHumanReview: false,
    issues: [],
    floydCycleDetected: false,
    orphanNodeIds: []
  });
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Toggle High Contrast Mode
  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [highContrast]);

  // Load and generate initial steps
  const generateStepsForGraph = useCallback(
    async (targetGraph: LinkedListGraph, op: string = 'insertHead', val: number = 9) => {
      try {
        const res = await fetch('/api/diagrams/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            graph: targetGraph,
            operation: {
              operation: op,
              value: val,
              targetValue: 28
            }
          })
        });

        const json = await res.json();
        if (json.success && json.data.steps.length > 0) {
          setSteps(json.data.steps);
          setCurrentStepIndex(0);
          setLiveAnnouncement(json.data.steps[0].screenReaderAnnouncement);
        }
      } catch (err) {
        console.error('Failed to generate steps:', err);
      }
    },
    []
  );

  useEffect(() => {
    generateStepsForGraph(initialDefaultGraph, 'insertHead', 9);
  }, [generateStepsForGraph]);

  // Auto-play interval
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          const nextIdx = prev + 1;
          const announcement = steps[nextIdx]?.screenReaderAnnouncement;
          if (announcement) {
            setLiveAnnouncement(announcement);
            if (speechEnabled && 'speechSynthesis' in window) {
              window.speechSynthesis.cancel();
              const utterance = new SpeechSynthesisUtterance(announcement);
              window.speechSynthesis.speak(utterance);
            }
          }
          return nextIdx;
        });
      }, 1500 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, steps, playbackSpeed, speechEnabled]);

  // Step Controls
  const handleTogglePlay = () => setIsPlaying((p) => !p);

  const handleStepForward = () => {
    if (currentStepIndex < steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      const ann = steps[nextIdx]?.screenReaderAnnouncement;
      if (ann) setLiveAnnouncement(ann);
    }
  };

  const handleStepBackward = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      const ann = steps[prevIdx]?.screenReaderAnnouncement;
      if (ann) setLiveAnnouncement(ann);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    if (steps[0]) setLiveAnnouncement(steps[0].screenReaderAnnouncement);
  };

  // Switch Operation
  const handleSelectOperation = (op: string) => {
    setCurrentOperation(op);
    setIsPlaying(false);
    generateStepsForGraph(graph, op, op === 'insertHead' ? 9 : 99);
  };

  // Load Curated PYQ
  const handleLoadPYQ = (pyq: PYQ) => {
    setGraph(pyq.initialGraph);
    setActiveTab('visualizer');
    setCurrentOperation(pyq.solutionOperation);
    generateStepsForGraph(pyq.initialGraph, pyq.solutionOperation, 9);
    setLiveAnnouncement(`Loaded ${pyq.title} into sandbox.`);
  };

  // Load Benchmark Fixtures
  const handleLoadBenchmarkFixture = (name: string) => {
    setIsPlaying(false);
    if (name === 'isc') {
      const g: LinkedListGraph = {
        headId: 'node_1',
        isCircular: false,
        nodes: [
          { id: 'node_1', value: 15, next: 'node_2', x: 80, y: 180, confidence: 0.98 },
          { id: 'node_2', value: 28, next: 'node_3', x: 260, y: 180, confidence: 0.96 },
          { id: 'node_3', value: 42, next: null, x: 440, y: 180, confidence: 0.97 }
        ]
      };
      setGraph(g);
      setCurrentOperation('insertHead');
      generateStepsForGraph(g, 'insertHead', 9);
    } else if (name === 'anna') {
      const g: LinkedListGraph = {
        headId: 'n1',
        isCircular: false,
        nodes: [
          { id: 'n1', value: 100, next: 'n2', x: 80, y: 180, confidence: 0.95 },
          { id: 'n2', value: 200, next: 'n3', x: 260, y: 180, confidence: 0.94 },
          { id: 'n3', value: 300, next: 'n4', x: 440, y: 180, confidence: 0.93 },
          { id: 'n4', value: 400, next: null, x: 620, y: 180, confidence: 0.97 }
        ]
      };
      setGraph(g);
      setCurrentOperation('deleteNode');
      generateStepsForGraph(g, 'deleteNode', 200);
    } else if (name === 'ambiguous') {
      const ambiguousG: LinkedListGraph = {
        headId: 'node_1',
        isCircular: false,
        nodes: [
          { id: 'node_1', value: 50, next: 'node_2', x: 80, y: 180, confidence: 0.98 },
          { id: 'node_2', value: '?B7', next: 'node_3', x: 260, y: 180, confidence: 0.48 },
          { id: 'node_3', value: 90, next: null, x: 440, y: 180, confidence: 0.96 }
        ]
      };
      setGraph(ambiguousG);
      setValidationResult({
        isValid: false,
        needsHumanReview: true,
        issues: [
          {
            gate: 'GATE_06_HUMAN_REVIEW',
            severity: 'warning',
            nodeId: 'node_2',
            message: 'Node node_2 value "?B7" has low OCR confidence (0.48). Human confirmation required.'
          }
        ],
        floydCycleDetected: false,
        orphanNodeIds: []
      });
      setIsReviewModalOpen(true);
    }
  };

  const currentStep = steps[currentStepIndex];
  const renderedGraph = currentStep?.currentGraph || graph;

  return (
    <div className="app-container">
      {/* Centralized ARIA Screen Reader Announcer */}
      <LiveAnnouncer message={liveAnnouncement} />

      {/* Navigation Header */}
      <header className="navbar">
        <div className="brand">
          <span className="brand-icon">🔍</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="brand-title">ConceptLens 2.0</span>
              <span className="brand-badge">Reliable Pipeline</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Interactive Visualizer • PYQs • Indian Sign Language
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="nav-tabs" aria-label="Main Navigation">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'visualizer' ? 'active' : ''}`}
            onClick={() => setActiveTab('visualizer')}
          >
            <PlayCircle size={16} />
            <span>Interactive Studio</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'pyq' ? 'active' : ''}`}
            onClick={() => setActiveTab('pyq')}
          >
            <BookOpen size={16} />
            <span>PYQ Intelligence</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'isl' ? 'active' : ''}`}
            onClick={() => setActiveTab('isl')}
          >
            <Video size={16} />
            <span>Inclusive ISL</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'gates' ? 'active' : ''}`}
            onClick={() => setActiveTab('gates')}
          >
            <ShieldAlert size={16} />
            <span>8 Validation Gates</span>
          </button>
        </nav>

        {/* Accessibility Toolbar */}
        <div className="a11y-toolbar">
          <button
            type="button"
            className={`icon-btn ${highContrast ? 'active' : ''}`}
            onClick={() => setHighContrast((c) => !c)}
            title="Toggle High Contrast Mode (WCAG AAA)"
            aria-label="Toggle High Contrast Mode"
          >
            <Eye size={18} />
          </button>

          <button
            type="button"
            className={`icon-btn ${speechEnabled ? 'active' : ''}`}
            onClick={() => setSpeechEnabled((s) => !s)}
            title="Toggle Live Speech Vocalizer"
            aria-label="Toggle Live Speech"
          >
            <Volume2 size={18} />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="main-content">
        {activeTab === 'visualizer' && (
          <div>
            {/* Media Ingestion & Cloudinary Section */}
            <MediaUploader
              onDiagramInterpreted={(data) => {
                setGraph(data.graph);
                generateStepsForGraph(data.graph, 'insertHead', 9);
                if (data.status === 'needs_review') {
                  setValidationResult(data.validation);
                  setIsReviewModalOpen(true);
                }
              }}
              onLoadBenchmarkFixture={handleLoadBenchmarkFixture}
            />

            {/* Interactive Sandbox Header */}
            <div className="glass-panel" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                    Deterministic Concept Engine (Singly Linked List)
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Stepping through operations with mathematically guaranteed pointer transitions.
                  </p>
                </div>

                {/* Operation Selector Buttons */}
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {[
                    { id: 'insertHead', label: 'Insert Head' },
                    { id: 'insertTail', label: 'Insert Tail' },
                    { id: 'deleteNode', label: 'Delete Node' },
                    { id: 'reverseList', label: 'Reverse List' },
                    { id: 'search', label: 'Linear Search' }
                  ].map((op) => (
                    <button
                      key={op.id}
                      type="button"
                      className={`btn-secondary ${currentOperation === op.id ? 'active' : ''}`}
                      style={{
                        fontSize: '0.8rem',
                        padding: '0.4rem 0.8rem',
                        borderColor: currentOperation === op.id ? 'var(--accent-cyan)' : undefined,
                        background: currentOperation === op.id ? 'rgba(56, 189, 248, 0.15)' : undefined
                      }}
                      onClick={() => handleSelectOperation(op.id)}
                    >
                      {op.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* SVG Visualizer Canvas */}
            <InteractiveCanvas
              graph={renderedGraph}
              activePointers={currentStep?.activePointers || { head: graph.headId }}
              highlightedNodeIds={currentStep?.highlightedNodeIds || []}
              mutatedNodeId={currentStep?.mutatedNodeId}
            />

            {/* Step Controls Bar */}
            <StepControls
              currentStepIndex={currentStepIndex}
              totalSteps={steps.length}
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
              onStepForward={handleStepForward}
              onStepBackward={handleStepBackward}
              onReset={handleReset}
              speed={playbackSpeed}
              onChangeSpeed={setPlaybackSpeed}
            />

            {/* Real-time State & Memory Inspector */}
            <StateInspector currentStep={currentStep} />
          </div>
        )}

        {/* PYQ Drawer View */}
        {activeTab === 'pyq' && <PYQDrawer onLoadPYQ={handleLoadPYQ} />}

        {/* Inclusive ISL Classroom View */}
        {activeTab === 'isl' && <ISLPlayer />}

        {/* 8 Validation Gates Architecture View */}
        {activeTab === 'gates' && (
          <div className="glass-panel">
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              The 8-Stage Reliability Pipeline Architecture
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Unlike brittle AI prototypes that trust raw model responses, ConceptLens 2.0 enforces validation gates at every stage before rendering graphics or calculating answers.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
              {[
                { num: '01', title: 'Upload & Validate', desc: 'Checks file mime, size limits, and format integrity.', status: 'Active' },
                { num: '02', title: 'Prepare Media', desc: 'Cloudinary auto-deskew, sharpen & crop bounding box.', status: 'Active' },
                { num: '03', title: 'Extract Content', desc: 'OCR bounding boxes with normalized coordinates.', status: 'Active' },
                { num: '04', title: 'Interpret Diagram', desc: 'AI vision prompt bound by strict Zod AST schema.', status: 'Active' },
                { num: '05', title: 'Validate Structure', desc: 'Floyd cycle detection, head integrity & dangling checks.', status: 'Enforced' },
                { num: '06', title: 'Human Correction', desc: 'Interactive review when OCR confidence < 0.80.', status: 'Enforced' },
                { num: '07', title: 'Deterministic Render', desc: 'Mathematical state transitions (no AI hallucinations).', status: 'Active' },
                { num: '08', title: 'Verify Learning', desc: 'Connects answers to original PYQ marking scheme.', status: 'Active' }
              ].map((g) => (
                <div
                  key={g.num}
                  style={{
                    background: 'rgba(2, 6, 23, 0.6)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                      {g.num}
                    </span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--accent-emerald)', background: 'rgba(16, 185, 129, 0.1)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                      {g.status}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    {g.title}
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {g.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Human-in-the-Loop Review Modal (Gate 06) */}
      <ValidationInspector
        graph={graph}
        validation={validationResult}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSaveCorrections={(corrected) => {
          setGraph(corrected);
          generateStepsForGraph(corrected, currentOperation, 9);
          setLiveAnnouncement('Corrections applied. Rendering validated linked list model.');
        }}
      />
    </div>
  );
};

export default App;
