import React, { useState, useEffect, useCallback } from 'react';
import {
  LinkedListGraph,
  ExecutionStep,
  ValidationResult,
  PYQ,
  PhysicsSimulationModel,
  UniversalInteractiveDiagram
} from '@conceptlens/shared';
import { InteractiveCanvas } from './components/InteractiveCanvas';
import { StepControls } from './components/StepControls';
import { StateInspector } from './components/StateInspector';
import { MediaUploader } from './components/MediaUploader';
import { ValidationInspector } from './components/ValidationInspector';
import { PYQDrawer } from './components/PYQDrawer';
import { ISLPlayer } from './components/ISLPlayer';
import { LiveAnnouncer } from './components/LiveAnnouncer';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { InteractivePhysicsStudio } from './components/InteractivePhysicsStudio';
import { UniversalDiagramCanvas } from './components/UniversalDiagramCanvas';
import { PracticeSandbox } from './components/PracticeSandbox';
import {
  Eye,
  Volume2,
  BookOpen,
  Video,
  ShieldAlert,
  PlayCircle,
  HelpCircle,
  Atom,
  Binary,
  Sparkles
} from 'lucide-react';

// Default Initial Graph (3-node standard)
const initialDefaultGraph: LinkedListGraph = {
  headId: 'node_1',
  structureType: 'singly',
  isCircular: false,
  nodes: [
    { id: 'node_1', value: 15, next: 'node_2', address: '0x1020', x: 80, y: 180, confidence: 0.98 },
    { id: 'node_2', value: 28, next: 'node_3', address: '0x1040', x: 260, y: 180, confidence: 0.96 },
    { id: 'node_3', value: 42, next: null, address: '0x1060', x: 440, y: 180, confidence: 0.97 }
  ]
};

// Default Initial Physics Model (Ray Optics)
const initialDefaultPhysicsModel: PhysicsSimulationModel = {
  domain: 'physics',
  type: 'ray_optics',
  title: 'Geometrical Optics: Convex Lens Ray Diagram',
  topic: 'Optics & Refraction of Light',
  description:
    'Interactive ray tracing demonstrating real & virtual image formation through a biconvex lens with principal rays, object distance (u), and focal length (f).',
  originalImageUrl:
    'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=80',
  parameters: {
    focalLength: 100,
    objectDistance: 220,
    objectHeight: 60
  },
  interactiveControls: [
    { id: 'objectDistance', label: 'Object Distance (u)', min: 40, max: 400, step: 5, unit: 'mm', defaultValue: 220 },
    { id: 'focalLength', label: 'Focal Length (f)', min: 60, max: 180, step: 5, unit: 'mm', defaultValue: 100 },
    { id: 'objectHeight', label: 'Object Height (ho)', min: 20, max: 90, step: 2, unit: 'mm', defaultValue: 60 }
  ],
  formulas: [
    {
      label: 'Gaussian Thin Lens Formula',
      formula: '1/f = 1/v - 1/u',
      explanation: 'Relates focal length (f) to object distance (u) and image distance (v) using Cartesian sign convention.'
    },
    {
      label: 'Linear Magnification',
      formula: 'm = v / u = hi / ho',
      explanation: 'Ratio of image height to object height. Negative magnification indicates an inverted real image.'
    },
    {
      label: 'Optical Power',
      formula: 'P = 1 / f (in meters) [Dioptres]',
      explanation: 'Refractive capability of the lens; positive for converging, negative for diverging.'
    }
  ]
};

// Default Initial Universal Model (Biology - Heart Blood Circulation)
const initialDefaultUniversalModel: UniversalInteractiveDiagram = {
  id: 'bio_heart_circulation',
  domain: 'biology',
  subject: 'Biology & Physiology',
  topic: 'Cardiovascular System',
  title: 'Double Circulation: Human Heart & Pulmonary Circuit',
  description:
    'Interactive physiological simulation of cardiac blood flow. Adjust heart rate (BPM) and stroke volume to witness dynamic systolic/diastolic chamber contractions, oxygenated vs deoxygenated blood pathways, and cardiac output.',
  originalImageUrl:
    'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=1200&q=80',
  controls: [
    { id: 'heartRate', label: 'Heart Rate (HR)', min: 40, max: 180, step: 2, unit: 'BPM', defaultValue: 72, description: 'Cardiac contractions per minute' },
    { id: 'strokeVolume', label: 'Stroke Volume (SV)', min: 40, max: 120, step: 2, unit: 'mL', defaultValue: 70, description: 'Blood pumped from left ventricle per beat' },
    { id: 'oxygenationLevel', label: 'Oxygen Saturation', min: 80, max: 100, step: 1, unit: '%', defaultValue: 98, description: 'Arterial blood oxygen saturation' }
  ],
  elements: [
    { id: 'right_atrium', type: 'organ', label: 'Right Atrium (RA)', detail: 'Receives systemic deoxygenated blood via Vena Cava.', x: 340, y: 150, width: 120, height: 80, color: 'rgba(56, 189, 248, 0.25)', strokeColor: '#38bdf8' },
    { id: 'right_ventricle', type: 'organ', label: 'Right Ventricle (RV)', detail: 'Pumps blood to pulmonary artery towards lungs.', x: 340, y: 245, width: 120, height: 90, color: 'rgba(56, 189, 248, 0.3)', strokeColor: '#38bdf8' },
    { id: 'left_atrium', type: 'organ', label: 'Left Atrium (LA)', detail: 'Receives oxygenated blood returning from pulmonary veins.', x: 540, y: 150, width: 120, height: 80, color: 'rgba(244, 63, 94, 0.25)', strokeColor: '#f43f5e' },
    { id: 'left_ventricle', type: 'organ', label: 'Left Ventricle (LV)', detail: 'Thick muscular wall pumps oxygenated blood into aorta.', x: 540, y: 245, width: 120, height: 90, color: 'rgba(244, 63, 94, 0.35)', strokeColor: '#f43f5e' }
  ],
  metrics: [
    { label: 'Cardiac Output (CO)', value: '5.04', unit: 'L/min', formula: 'CO = HR × SV / 1000' },
    { label: 'Circulation Cycle Time', value: '0.83', unit: 'sec', formula: 'Cycle = 60 / HR' },
    { label: 'Blood Flow Dynamic', value: 'Double Circulation (Systemic + Pulmonary)' }
  ],
  formulas: [
    { label: 'Cardiac Output Principle', formula: 'CO = HR × SV', explanation: 'Total volume of blood pumped per minute.' },
    { label: 'Frank-Starling Law', formula: 'Stroke Volume ∝ End-Diastolic Volume', explanation: 'Stroke volume increases in response to an increase in blood volume in the ventricles before contraction.' }
  ]
};

export const App: React.FC = () => {
  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<'visualizer' | 'pyq' | 'isl' | 'gates'>('visualizer');

  // Domain Switcher: Universal (Any Subject) vs Physics vs Data Structures
  const [activeDomain, setActiveDomain] = useState<'universal' | 'physics' | 'data_structure'>('universal');
  const [universalModel, setUniversalModel] = useState<UniversalInteractiveDiagram>(initialDefaultUniversalModel);
  const [physicsModel, setPhysicsModel] = useState<PhysicsSimulationModel>(initialDefaultPhysicsModel);

  // Accessibility States
  const [highContrast, setHighContrast] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState('Welcome to ConceptLens 2.0.');
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Core Simulation States
  const [graph, setGraph] = useState<LinkedListGraph>(initialDefaultGraph);
  const [steps, setSteps] = useState<ExecutionStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [currentOperation, setCurrentOperation] = useState<string>('insertHead');
  const [activePyqId, setActivePyqId] = useState('practice_reverse');

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

  // Load and generate initial steps for CS
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

  const handleStepForward = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      const ann = steps[nextIdx]?.screenReaderAnnouncement;
      if (ann) setLiveAnnouncement(ann);
    }
  }, [currentStepIndex, steps]);

  const handleStepBackward = useCallback(() => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      const ann = steps[prevIdx]?.screenReaderAnnouncement;
      if (ann) setLiveAnnouncement(ann);
    }
  }, [currentStepIndex, steps]);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    if (steps[0]) setLiveAnnouncement(steps[0].screenReaderAnnouncement);
  }, [steps]);

  // Global Keyboard Accessibility Shortcuts (WCAG 2.2 AAA)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept typing in inputs/textareas
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsShortcutsOpen(false);
        setIsReviewModalOpen(false);
      } else if (e.key === ' ') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleStepForward();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleStepBackward();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleReset();
      } else if (e.key === '1') {
        setActiveTab('visualizer');
      } else if (e.key === '2') {
        setActiveTab('pyq');
      } else if (e.key === '3') {
        setActiveTab('isl');
      } else if (e.key === '4') {
        setActiveTab('gates');
      } else if (e.key === 'u' || e.key === 'U') {
        setActiveDomain('universal');
      } else if (e.key === 'p' || e.key === 'P') {
        setActiveDomain((d) => (d === 'physics' ? 'data_structure' : 'physics'));
      } else if (e.key === 'h' || e.key === 'H') {
        setHighContrast((c) => !c);
      } else if (e.key === 'v' || e.key === 'V') {
        setSpeechEnabled((s) => !s);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleStepForward, handleStepBackward, handleReset]);

  const handleSeekStep = (index: number) => {
    setIsPlaying(false);
    setCurrentStepIndex(index);
    const announcement = steps[index]?.screenReaderAnnouncement;
    if (announcement) setLiveAnnouncement(announcement);
  };

  // Switch Operation
  const handleSelectOperation = (op: string) => {
    setCurrentOperation(op);
    setIsPlaying(false);
    generateStepsForGraph(graph, op, op === 'insertHead' ? 9 : 99);
  };

  // Load Curated PYQ
  const handleLoadPYQ = (pyq: PYQ) => {
    setActiveDomain('data_structure');
    setActivePyqId(pyq.id);
    setGraph(pyq.initialGraph);
    setActiveTab('visualizer');
    setCurrentOperation(pyq.solutionOperation);
    generateStepsForGraph(pyq.initialGraph, pyq.solutionOperation, 9);
    setLiveAnnouncement(`Loaded ${pyq.title} into sandbox.`);
  };

  // Load Benchmark Fixtures
  const handleLoadBenchmarkFixture = (name: string) => {
    setActiveDomain('data_structure');
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
    } else if (name === 'doubly') {
      const doublyG: LinkedListGraph = {
        headId: 'node_d1',
        tailId: 'node_d3',
        structureType: 'doubly',
        isCircular: false,
        nodes: [
          { id: 'node_d1', value: 12, next: 'node_d2', prev: null, address: '0x1020', x: 80, y: 180, confidence: 0.98 },
          { id: 'node_d2', value: 24, next: 'node_d3', prev: 'node_d1', address: '0x1040', x: 260, y: 180, confidence: 0.96 },
          { id: 'node_d3', value: 36, next: null, prev: 'node_d2', address: '0x1060', x: 440, y: 180, confidence: 0.97 }
        ]
      };
      setGraph(doublyG);
      setCurrentOperation('insertDoublyHead');
      generateStepsForGraph(doublyG, 'insertDoublyHead', 6);
      setLiveAnnouncement('Loaded Doubly Linked List with forward and backward pointers.');
    } else if (name === 'circular') {
      const circularG: LinkedListGraph = {
        headId: 'node_c1',
        tailId: 'node_c3',
        structureType: 'circular',
        isCircular: true,
        nodes: [
          { id: 'node_c1', value: 10, next: 'node_c2', address: '0x3010', x: 80, y: 180, confidence: 0.98 },
          { id: 'node_c2', value: 20, next: 'node_c3', address: '0x3020', x: 260, y: 180, confidence: 0.96 },
          { id: 'node_c3', value: 30, next: 'node_c1', address: '0x3030', x: 440, y: 180, confidence: 0.97 }
        ]
      };
      setGraph(circularG);
      setCurrentOperation('search');
      generateStepsForGraph(circularG, 'search', 20);
      setLiveAnnouncement('Loaded Circular Linked List with looping tail pointer.');
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
              <span className="brand-badge">Universal Engine</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Interactive Diagrams for All Subjects • PYQs • Indian Sign Language
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
            title="Toggle High Contrast Mode (WCAG AAA) [H]"
            aria-label="Toggle High Contrast Mode"
          >
            <Eye size={18} />
          </button>

          <button
            type="button"
            className={`icon-btn ${speechEnabled ? 'active' : ''}`}
            onClick={() => setSpeechEnabled((s) => !s)}
            title="Toggle Live Speech Vocalizer [V]"
            aria-label="Toggle Live Speech"
          >
            <Volume2 size={18} />
          </button>

          <button
            type="button"
            className="icon-btn"
            onClick={() => setIsShortcutsOpen(true)}
            title="Keyboard Shortcuts Cheat-sheet [?]"
            aria-label="Keyboard Shortcuts"
          >
            <HelpCircle size={18} />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="main-content">
        {activeTab === 'visualizer' && (
          <div>
            {/* Universal Multi-Disciplinary Picture Ingestion Section */}
            <MediaUploader
              onDiagramInterpreted={(data) => {
                if (data.status === 'failed') {
                  setLiveAnnouncement(data.message || 'Diagram interpretation failed.');
                  return;
                }
                if (data.domain === 'universal' && data.universalModel) {
                  setUniversalModel(data.universalModel);
                  setActiveDomain('universal');
                  setLiveAnnouncement(`Synthesized interactive diagram for ${data.universalModel.title}`);
                } else if (data.domain === 'physics' && data.physicsModel) {
                  setPhysicsModel(data.physicsModel);
                  setActiveDomain('physics');
                  setLiveAnnouncement(`Created interactive Physics diagram for ${data.physicsModel.title}`);
                } else if (data.graph) {
                  setActiveDomain('data_structure');
                  setGraph(data.graph);
                  generateStepsForGraph(data.graph, 'insertHead', 9);
                  if (data.status === 'needs_review') {
                    setValidationResult(data.validation);
                    setIsReviewModalOpen(true);
                  }
                  setLiveAnnouncement(data.message || 'Created interactive Linked List diagram.');
                }
              }}
              onLoadBenchmarkFixture={handleLoadBenchmarkFixture}
              onSelectPhysicsModel={async (modelType) => {
                try {
                  const res = await fetch('/api/diagrams/interpret', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ diagramType: modelType })
                  });
                  const json = await res.json();
                  if (json.success && json.data.physicsModel) {
                    setPhysicsModel(json.data.physicsModel);
                    setActiveDomain('physics');
                    setLiveAnnouncement(`Loaded interactive Physics simulation for ${json.data.physicsModel.title}`);
                  }
                } catch (err) {
                  console.error(err);
                }
              }}
              onSelectUniversalModel={async (modelId) => {
                try {
                  const res = await fetch('/api/diagrams/interpret', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ diagramType: modelId })
                  });
                  const json = await res.json();
                  if (json.success && json.data.universalModel) {
                    setUniversalModel(json.data.universalModel);
                    setActiveDomain('universal');
                    setLiveAnnouncement(`Loaded interactive diagram for ${json.data.universalModel.title}`);
                  }
                } catch (err) {
                  console.error(err);
                }
              }}
            />

            {/* Domain Switcher Pill Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className={`btn-secondary ${activeDomain === 'universal' ? 'active' : ''}`}
                  onClick={() => setActiveDomain('universal')}
                  style={{
                    fontSize: '0.85rem',
                    padding: '0.45rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    borderColor: activeDomain === 'universal' ? 'var(--accent-emerald)' : undefined,
                    background: activeDomain === 'universal' ? 'rgba(16, 185, 129, 0.15)' : undefined
                  }}
                >
                  <Sparkles size={16} color={activeDomain === 'universal' ? 'var(--accent-emerald)' : 'var(--text-muted)'} />
                  <span>Universal Diagrams (Biology, Chem, Math, Econ)</span>
                </button>

                <button
                  type="button"
                  className={`btn-secondary ${activeDomain === 'physics' ? 'active' : ''}`}
                  onClick={() => setActiveDomain('physics')}
                  style={{
                    fontSize: '0.85rem',
                    padding: '0.45rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    borderColor: activeDomain === 'physics' ? 'var(--accent-cyan)' : undefined,
                    background: activeDomain === 'physics' ? 'rgba(56, 189, 248, 0.15)' : undefined
                  }}
                >
                  <Atom size={16} color={activeDomain === 'physics' ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
                  <span>Physics Lab (Optics, Pendulum, Circuits)</span>
                </button>

                <button
                  type="button"
                  className={`btn-secondary ${activeDomain === 'data_structure' ? 'active' : ''}`}
                  onClick={() => setActiveDomain('data_structure')}
                  style={{
                    fontSize: '0.85rem',
                    padding: '0.45rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    borderColor: activeDomain === 'data_structure' ? 'var(--accent-purple)' : undefined,
                    background: activeDomain === 'data_structure' ? 'rgba(192, 132, 252, 0.15)' : undefined
                  }}
                >
                  <Binary size={16} color={activeDomain === 'data_structure' ? 'var(--accent-purple)' : 'var(--text-muted)'} />
                  <span>Data Structures Studio</span>
                </button>
              </div>

              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Press [U] or [P] to switch
              </span>
            </div>

            {/* DOMAIN 1: UNIVERSAL INTERACTIVE DIAGRAM (Biology, Chemistry, Math, Econ, BST) */}
            {activeDomain === 'universal' && (
              <UniversalDiagramCanvas
                diagram={universalModel}
                onAnnounce={setLiveAnnouncement}
                onSwitchDomain={() => setActiveDomain('physics')}
              />
            )}

            {/* DOMAIN 2: DEDICATED PHYSICS LAB */}
            {activeDomain === 'physics' && (
              <InteractivePhysicsStudio
                model={physicsModel}
                onAnnounce={setLiveAnnouncement}
                onSwitchToDataStructure={() => setActiveDomain('data_structure')}
              />
            )}

            {/* DOMAIN 3: DATA STRUCTURES CONCEPT ENGINE */}
            {activeDomain === 'data_structure' && (
              <div>
                <div className="glass-panel" style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                        Deterministic Concept Engine (
                        {graph.structureType === 'doubly'
                          ? 'Doubly Linked List'
                          : graph.isCircular
                          ? 'Circular Linked List ↺'
                          : 'Singly Linked List'}
                        )
                      </h2>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Stepping through operations with mathematically guaranteed pointer transitions.
                      </p>
                    </div>

                    {/* Operation Selector Buttons */}
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {(graph.structureType === 'doubly'
                        ? [
                            { id: 'insertDoublyHead', label: 'Insert Head (Doubly)' },
                            { id: 'deleteDoublyNode', label: 'Delete Node (Doubly)' }
                          ]
                        : [
                            { id: 'insertHead', label: 'Insert Head' },
                            { id: 'insertTail', label: 'Insert Tail' },
                            { id: 'deleteNode', label: 'Delete Node' },
                            { id: 'reverseList', label: 'Reverse List' },
                            { id: 'search', label: 'Linear Search' }
                          ]
                      ).map((op) => (
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
                  onSeekStep={handleSeekStep}
                  onReset={handleReset}
                  speed={playbackSpeed}
                  onChangeSpeed={setPlaybackSpeed}
                />

                {/* Real-time State & Memory Inspector */}
                <StateInspector currentStep={currentStep} />

                {/* Student Interactive Practice Sandbox */}
                <PracticeSandbox key={activePyqId} graph={graph} pyqId={activePyqId} onAnnouncement={setLiveAnnouncement} />
              </div>
            )}
          </div>
        )}

        {/* PYQ Drawer View */}
        {activeTab === 'pyq' && (
          <PYQDrawer
            onLoadPYQ={handleLoadPYQ}
            onNavigateToISL={(conceptTag) => {
              setActiveTab('isl');
              setLiveAnnouncement(`Navigated to ISL lesson for ${conceptTag}`);
            }}
          />
        )}

        {/* Inclusive ISL Classroom View */}
        {activeTab === 'isl' && (
          <ISLPlayer
            onLoadLessonIntoSandbox={(lessonGraph, op) => {
              setActiveDomain('data_structure');
              setGraph(lessonGraph);
              setCurrentOperation(op);
              setActiveTab('visualizer');
              generateStepsForGraph(lessonGraph, op, 9);
              setLiveAnnouncement('Loaded ISL concept diagram into Interactive Studio sandbox.');
            }}
            onOpenKeyboardShortcuts={() => setIsShortcutsOpen(true)}
          />
        )}

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
                { num: '04', title: 'Interpret Diagram', desc: 'AI vision prompt bound by strict AST schema.', status: 'Active' },
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
          setActiveDomain('data_structure');
          setGraph(corrected);
          generateStepsForGraph(corrected, currentOperation, 9);
          setLiveAnnouncement('Corrections applied. Rendering validated linked list model.');
        }}
      />

      {/* Keyboard Accessibility Shortcuts Modal (WCAG 2.2 AAA) */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
};

export default App;
