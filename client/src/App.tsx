import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import {
  LinkedListGraph,
  ExecutionStep,
  ValidationResult,
  PhysicsSimulationModel,
  UniversalInteractiveDiagram,
  BiologyTopicId,
  BiologyLesson
} from '@conceptlens/shared';

import { clientBiologyCatalog } from './data/biologyLessons';
import { LandingPage } from './components/LandingPage';
import { LearningLens } from './components/LearningLens';
import { LessonPractice } from './components/biology/LessonPractice';
import { type LearningModeId, type LearningPreferences, type ThemeChoice, applyLearningTheme, learningDomClasses, learningDomState, readThemeChoice, removeLearningTheme, resolveTheme, respectSystemReducedMotion, selectStructure } from '@conceptlens/shared';
import { readDisplayPreferences, readProgress, unitFromLesson, writeDisplayPreferences, writeProgress } from './components/biology/LearningPaths';

// Lazy-loaded heavy visualization workspaces & modules
const BiologyWorkspace = lazy(() =>
  import('./components/biology/BiologyWorkspace').then((m) => ({ default: m.BiologyWorkspace }))
);
const BiologyPracticeModal = lazy(() =>
  import('./components/biology/BiologyPracticeModal').then((m) => ({ default: m.BiologyPracticeModal }))
);
const CloudinaryMediaStudio = lazy(() =>
  import('./components/cloudinary/CloudinaryMediaStudio').then((m) => ({ default: m.CloudinaryMediaStudio }))
);
const ISLPlayer = lazy(() =>
  import('./components/ISLPlayer').then((m) => ({ default: m.ISLPlayer }))
);
const InteractivePhysicsStudio = lazy(() =>
  import('./components/InteractivePhysicsStudio').then((m) => ({ default: m.InteractivePhysicsStudio }))
);
const UniversalDiagramCanvas = lazy(() =>
  import('./components/UniversalDiagramCanvas').then((m) => ({ default: m.UniversalDiagramCanvas }))
);
const PracticeSandbox = lazy(() =>
  import('./components/PracticeSandbox').then((m) => ({ default: m.PracticeSandbox }))
);

import { InteractiveCanvas } from './components/InteractiveCanvas';
import { StepControls } from './components/StepControls';
import { StateInspector } from './components/StateInspector';
import { ValidationInspector } from './components/ValidationInspector';
import { LiveAnnouncer } from './components/LiveAnnouncer';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';

const WorkspaceLoadingFallback = () => (
  <div
    className="glass-panel"
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '420px',
      gap: '1rem',
      textAlign: 'center'
    }}
  >
    <div
      style={{
        width: '42px',
        height: '42px',
        borderRadius: '50%',
        border: '3px solid rgba(101, 229, 242, 0.15)',
        borderTopColor: 'var(--accent-cyan)',
        animation: 'atlasOrbitSpin 0.9s linear infinite'
      }}
    />
    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
      INITIALIZING INSTRUMENT WORKSPACE...
    </div>
  </div>
);

import {
  Home,
  Box,
  Award,
  ShieldAlert,
  HelpCircle,
  Eye,
  Atom,
  Binary,
  Sparkles,
  Sun,
  Moon,
  Menu,
  Accessibility
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

// Default Initial Physics Model
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
    }
  ]
};

// Default Initial Universal Model
const initialDefaultUniversalModel: UniversalInteractiveDiagram = {
  id: 'bio_heart_circulation',
  domain: 'biology',
  subject: 'Biology & Physiology',
  topic: 'Cardiovascular System',
  title: 'Double Circulation: Human Heart & Pulmonary Circuit',
  description:
    'Interactive physiological simulation of cardiac blood flow. Adjust heart rate (BPM) and stroke volume to witness dynamic systolic/diastolic chamber contractions.',
  originalImageUrl:
    'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=1200&q=80',
  controls: [
    { id: 'heartRate', label: 'Heart Rate (HR)', min: 40, max: 180, step: 2, unit: 'BPM', defaultValue: 72, description: 'Cardiac contractions per minute' },
    { id: 'strokeVolume', label: 'Stroke Volume (SV)', min: 40, max: 120, step: 2, unit: 'mL', defaultValue: 70, description: 'Blood pumped from left ventricle per beat' }
  ],
  elements: [
    { id: 'right_atrium', type: 'organ', label: 'Right Atrium (RA)', detail: 'Receives systemic deoxygenated blood via Vena Cava.', x: 340, y: 150, width: 120, height: 80, color: 'rgba(56, 189, 248, 0.25)', strokeColor: '#38bdf8' },
    { id: 'right_ventricle', type: 'organ', label: 'Right Ventricle (RV)', detail: 'Pumps blood to pulmonary artery towards lungs.', x: 340, y: 245, width: 120, height: 90, color: 'rgba(56, 189, 248, 0.3)', strokeColor: '#38bdf8' },
    { id: 'left_atrium', type: 'organ', label: 'Left Atrium (LA)', detail: 'Receives oxygenated blood returning from pulmonary veins.', x: 540, y: 150, width: 120, height: 80, color: 'rgba(244, 63, 94, 0.25)', strokeColor: '#f43f5e' },
    { id: 'left_ventricle', type: 'organ', label: 'Left Ventricle (LV)', detail: 'Thick muscular wall pumps oxygenated blood into aorta.', x: 540, y: 245, width: 120, height: 90, color: 'rgba(244, 63, 94, 0.35)', strokeColor: '#f43f5e' }
  ],
  metrics: [
    { label: 'Cardiac Output (CO)', value: '5.04', unit: 'L/min', formula: 'CO = HR × SV / 1000' }
  ]
};

export const App: React.FC = () => {
  // Navigation & Tabs: Home is landing page, Biology is the core interactive 3D platform
  const [activeTab, setActiveTab] = useState<
    'home' | 'biology' | 'cloudinary' | 'practice' | 'isl' | 'stem' | 'gates' | 'about'
  >('home');

  // Biology Core State
  const [selectedBioTopic, setSelectedBioTopic] = useState<BiologyTopicId>('human_cell');
  const [isPracticeModalOpen, setIsPracticeModalOpen] = useState(false);

  // Active Biology Lesson
  const currentBioLesson: BiologyLesson = clientBiologyCatalog[selectedBioTopic] || clientBiologyCatalog.human_cell;

  const [menuOpen, setMenuOpen] = useState(false);
  const [lensOpen, setLensOpen] = useState(false);
  const [, setRepresentation] = useState<LearningModeId>('visual');
  const [preferences, setPreferences] = useState<LearningPreferences>(() => {
    const stored = readDisplayPreferences();
    const systemReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return respectSystemReducedMotion(stored.prefs, systemReduced, stored.savedByLearner);
  });
  const [liveAnnouncement, setLiveAnnouncement] = useState('Welcome to ConceptLens. One concept, different ways to understand it.');
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const [themeChoice, setThemeChoice] = useState<ThemeChoice>(() => {
    try {
      return readThemeChoice(localStorage.getItem('conceptlens-theme'));
    } catch {
      return 'light';
    }
  });
  const [systemDark, setSystemDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  const theme = resolveTheme(themeChoice, systemDark);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setSystemDark(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('conceptlens-theme', themeChoice);
    } catch {
      /* The theme still applies for this visit when storage is blocked. */
    }
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-theme-choice', themeChoice);
    document.body.classList.toggle('theme-dark', theme === 'dark');
    document.body.classList.toggle('theme-light', theme === 'light');
  }, [theme, themeChoice]);

  const toggleTheme = useCallback(() => {
    setThemeChoice((prev) => {
      const resolved = resolveTheme(prev, window.matchMedia('(prefers-color-scheme: dark)').matches);
      const next = resolved === 'light' ? 'dark' : 'light';
      setLiveAnnouncement(next === 'light' ? 'Light theme.' : 'Dark theme.');
      return next;
    });
  }, []);

  // Compact navbar on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // STEM / Universal Lab states
  const [activeStemDomain, setActiveStemDomain] = useState<'universal' | 'physics' | 'data_structure'>('universal');
  const [universalModel] = useState<UniversalInteractiveDiagram>(initialDefaultUniversalModel);
  const [physicsModel] = useState<PhysicsSimulationModel>(initialDefaultPhysicsModel);

  // CS Linked List Simulation States
  const [graph, setGraph] = useState<LinkedListGraph>(initialDefaultGraph);
  const [steps, setSteps] = useState<ExecutionStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [currentOperation, setCurrentOperation] = useState<string>('insertHead');
  const [activePyqId] = useState('practice_reverse');

  // Gate & Validation States
  const [validationResult] = useState<ValidationResult>({
    isValid: true,
    needsHumanReview: false,
    issues: [],
    floydCycleDetected: false,
    orphanNodeIds: []
  });
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  useEffect(() => {
    const state = learningDomState(preferences);
    for (const className of learningDomClasses()) {
      document.body.classList.toggle(className, state.classes.includes(className));
    }
    document.documentElement.dataset.textScale = state.textScale;
    document.documentElement.dataset.lineSpacing = state.lineSpacing;
    document.documentElement.dataset.keyboardFirst = state.keyboardFirst ? 'true' : 'false';
    writeDisplayPreferences(preferences);
  }, [preferences]);

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

  // Auto-play interval for CS
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
          if (announcement) setLiveAnnouncement(announcement);
          return nextIdx;
        });
      }, 1500 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, steps, playbackSpeed]);

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
        setIsPracticeModalOpen(false);
      } else if (e.key === '0') {
        setActiveTab('home');
      } else if (e.key === '1') {
        setActiveTab('biology');
      } else if (e.key === '2') {
        setActiveTab('practice');
      } else if (e.key === '3') {
        setActiveTab('about');
      } else if (e.key === '4') {
        setActiveTab('cloudinary');
      } else if (e.key === '5') {
        setActiveTab('stem');
      } else if (e.key === '6') {
        setActiveTab('gates');
      } else if (e.key === 'h' || e.key === 'H') {
        setPreferences((current) => ({ ...current, highContrast: !current.highContrast }));
      } else if (e.key === 't' || e.key === 'T') {
        toggleTheme();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Launch into topic handler (from landing page or cloudinary studio)
  const handleLaunchTopic = (topicId: BiologyTopicId) => {
    setSelectedBioTopic(topicId);
    setActiveTab('biology');
    setLiveAnnouncement(`Loaded ${clientBiologyCatalog[topicId]?.title || topicId} interactive workspace.`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentStep = steps[currentStepIndex];
  const renderedGraph = currentStep?.currentGraph || graph;

  return (
    <div className="app-container">
      <a className="skip-link" href="#main">Skip to main content</a>
      {/* Centralized ARIA Screen Reader Announcer */}
      <LiveAnnouncer message={liveAnnouncement} />

      {/* Navigation Header — The Digital Observatory */}
      <header className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <button type="button" className="brand" onClick={() => { setActiveTab('home'); setMenuOpen(false); }}>
          <div className="brand-symbol" title="ConceptLens — The Living Atlas" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="22" stroke="currentColor" strokeWidth="3" />
              <circle cx="32" cy="32" r="5" fill="var(--accent-mint)" />
              <path d="M32 8v8M32 48v8M8 32h8M48 32h8" stroke="currentColor" strokeWidth="3" />
            </svg>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="brand-title">ConceptLens</span>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(101, 229, 242, 0.12)',
                  color: 'var(--accent-cyan)',
                  border: '1px solid rgba(101, 229, 242, 0.3)',
                  letterSpacing: '0.04em'
                }}
              >
                Living Atlas
              </span>
            </div>
            <span className="brand-tagline">
              One concept. Different ways to understand it.
            </span>
          </div>
        </button>

        <button
          type="button"
          className="nav-menu-toggle icon-btn"
          aria-expanded={menuOpen}
          aria-controls="main-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <Menu size={18} />
          <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
        </button>

        <nav id="main-nav" className={`nav-tabs ${menuOpen ? 'is-open' : ''}`} aria-label="Main Navigation">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'home' ? 'active' : ''}`}
            aria-current={activeTab === 'home' ? 'page' : undefined}
            onClick={() => { setActiveTab('home'); setMenuOpen(false); }}
          >
            <Home size={15} />
            <span>Home</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'biology' ? 'active' : ''}`}
            aria-current={activeTab === 'biology' ? 'page' : undefined}
            onClick={() => { setActiveTab('biology'); setMenuOpen(false); }}
          >
            <Box size={15} />
            <span>Learn</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'practice' ? 'active' : ''}`}
            aria-current={activeTab === 'practice' ? 'page' : undefined}
            onClick={() => { setActiveTab('practice'); setMenuOpen(false); }}
          >
            <Award size={15} />
            <span>Practice</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
            aria-current={activeTab === 'about' ? 'page' : undefined}
            onClick={() => { setActiveTab('about'); setMenuOpen(false); }}
          >
            <ShieldAlert size={15} />
            <span>About</span>
          </button>
        </nav>

        {/* Accessibility & Theme Toolbar */}
        <div className="a11y-toolbar">
          {/* Light / Dark Mode Theme Switcher */}
          <button
            type="button"
            className="toolbar-text-btn theme-toggle-btn"
            onClick={toggleTheme}
            aria-pressed={theme === 'dark'}
            aria-label={theme === 'light' ? 'Light theme. Switch to dark.' : 'Dark theme. Switch to light.'}
          >
            {theme === 'light' ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
            <span>{theme === 'light' ? 'Light' : 'Dark'}</span>
          </button>

          <button
            type="button"
            className={`icon-btn ${preferences.highContrast ? 'active' : ''}`}
            onClick={() => setPreferences((current) => ({ ...current, highContrast: !current.highContrast }))}
            title="High contrast [H]"
            aria-pressed={preferences.highContrast}
            aria-label="High contrast"
          >
            <Eye size={18} />
          </button>

          <button
            type="button"
            className={`toolbar-text-btn ${preferences.lowData ? 'active' : ''}`}
            onClick={() => {
              setPreferences((current) => {
                if (current.lowData || current.activeThemes.includes('low-data')) {
                  return { ...removeLearningTheme(current, 'low-data'), lowData: false };
                }
                return applyLearningTheme(current, 'low-data');
              });
              setLiveAnnouncement(preferences.lowData ? 'Low data off.' : 'Low data on. 3D scenes stay unloaded until you ask.');
            }}
            aria-pressed={preferences.lowData}
            aria-label={preferences.lowData ? 'Low data on' : 'Low data off'}
          >
            <span>Low data</span>
            <span className="theme-card-status">{preferences.lowData ? 'On' : 'Off'}</span>
          </button>

          <button
            type="button"
            className="btn-secondary lens-launch"
            onClick={() => setLensOpen(true)}
            aria-haspopup="dialog"
            aria-controls="learning-theme-dialog"
          >
            <Accessibility size={18} aria-hidden="true" />
            <span>Learning & Accessibility Themes</span>
            {preferences.activeThemes.length > 0 && (
              <span className="theme-count">{preferences.activeThemes.length} on</span>
            )}
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

      {/* Main Content View Switcher */}
      <main id="main" className="main-content" tabIndex={-1}>
        <Suspense fallback={<WorkspaceLoadingFallback />}>
          {/* TAB 1: LANDING PAGE */}
          {activeTab === 'home' && (
            <LandingPage
              defer3D={preferences.lowData || preferences.textFirst || preferences.lowStimulation}
              onExploreTopic={handleLaunchTopic}
              onNavigateToHowItWorks={() => {
                const el = document.getElementById('how-it-works');
                if (el) el.scrollIntoView({ behavior: preferences.reducedMotion ? 'auto' : 'smooth' });
              }}
              onNavigateToAccessibility={() => {
                const el = document.getElementById('accessibility');
                if (el) el.scrollIntoView({ behavior: preferences.reducedMotion ? 'auto' : 'smooth' });
              }}
              onNavigateToTab={(tab) => setActiveTab(tab as 'home' | 'biology' | 'cloudinary' | 'practice' | 'isl' | 'stem' | 'gates' | 'about')}
            />
          )}

        {/* TAB 2: BIOLOGY 3D & 2D STUDIO */}
        {activeTab === 'biology' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Topic Switcher Pills */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.6rem',
                background: 'var(--bg-surface)',
                padding: '0.5rem 0.75rem',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {[
                  { id: 'human_cell', label: 'Human Cell (Animal Cell 3D)', badge: '3D' },
                  { id: 'human_heart', label: 'Human Heart (Circulation 3D)', badge: '3D' },
                  { id: 'dna_helix', label: 'DNA Double Helix (3D)', badge: '3D' },
                  { id: 'neuron', label: 'Neuron (Action Potential 2D)', badge: '2D' },
                  { id: 'plant_cell', label: 'Plant Cell (Wall & Turgor 2D)', badge: '2D' }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`btn-secondary ${selectedBioTopic === t.id ? 'active' : ''}`}
                    aria-pressed={selectedBioTopic === t.id}
                    onClick={() => handleLaunchTopic(t.id as BiologyTopicId)}
                    style={{
                      fontSize: '0.8rem',
                      padding: '0.35rem 0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      borderColor: selectedBioTopic === t.id ? 'var(--accent-cyan)' : undefined,
                      background: selectedBioTopic === t.id ? 'rgba(56, 189, 248, 0.15)' : undefined
                    }}
                  >
                    <span>{t.label}</span>
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '0.1rem 0.35rem',
                        borderRadius: '3px',
                        background: t.badge === '3D' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(16, 185, 129, 0.25)',
                        color: t.badge === '3D' ? 'var(--accent-cyan)' : '#34d399'
                      }}
                    >
                      {t.badge}
                    </span>
                  </button>
                ))}
              </div>

              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Press [1] to return here
              </span>
            </div>

            {/* Biology Workspace */}
            <BiologyWorkspace
              lesson={currentBioLesson}
              preferences={preferences}
              onPreferences={setPreferences}
              onRepresentation={setRepresentation}
              onAnnounce={setLiveAnnouncement}
              onOpenPractice={() => setIsPracticeModalOpen(true)}
              onRestartLesson={() => {
                setLiveAnnouncement(`Restarted ${currentBioLesson.title} tour.`);
              }}
            />
          </div>
        )}

        {/* TAB 3: CLOUDINARY SIGNED INGESTION & TRANSFORMATION PIPELINE */}
        {activeTab === 'cloudinary' && (
          <CloudinaryMediaStudio
            onSelectTopic={handleLaunchTopic}
            onAnnounce={setLiveAnnouncement}
          />
        )}

        {/* TAB 4: EXAM PRACTICE SANDBOX */}
        {activeTab === 'practice' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Award size={22} color="#f59e0b" />
                    <span>Practice for {currentBioLesson.title}</span>
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    Curated questions for this concept. They are not an official exam paper. Answers stay hidden until you choose one.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {(['human_cell', 'human_heart', 'dna_helix', 'neuron', 'plant_cell'] as BiologyTopicId[]).map((tid) => (
                    <button
                      key={tid}
                      type="button"
                      className={`tag-btn ${selectedBioTopic === tid ? 'active' : ''}`}
                      onClick={() => setSelectedBioTopic(tid)}
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                    >
                      {clientBiologyCatalog[tid]?.title.split(':')[0] || tid}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <LessonPractice
              lesson={currentBioLesson}
              onAnnounce={setLiveAnnouncement}
              onRevisit={(componentId) => {
                const unit = unitFromLesson(currentBioLesson);
                const raw = readProgress(currentBioLesson.id);
                let state = selectStructure(
                  raw ? { ...JSON.parse(raw), conceptId: currentBioLesson.id } : { conceptId: currentBioLesson.id, stepIndex: 0, selectedComponentId: null, completedStepIndexes: [], answers: {}, mode: 'accessible', lowData: preferences.lowData },
                  unit,
                  componentId
                ).state;
                state = { ...state, selectedComponentId: componentId };
                writeProgress(currentBioLesson.id, state);
                setActiveTab('biology');
                setLiveAnnouncement(`Back to ${componentId.replaceAll('_', ' ')} in ${currentBioLesson.title}.`);
              }}
            />
          </div>
        )}

        {activeTab === 'about' && (
          <section className="glass-panel path-reading" aria-labelledby="about-title">
            <p className="path-kicker">The Living Atlas</p>
            <h2 id="about-title">One concept. Different ways to understand it.</h2>
            <p>
              ConceptLens keeps the same curated biology and shows it as a model, a short explanation, one stage at a time, or text.
              Preferences are display choices. They are not a medical record, and they do not claim that one interface meets every learner.
            </p>
            <h3>SDG 4, Quality Education</h3>
            <p>
              Offering more than one representation of the same objective is an inclusive-education practice. This product has not been evaluated against SDG 4, and accessibility settings do not by themselves remove educational inequality.
            </p>
            <p>
              <a href="https://sdgs.un.org/goals/goal4" target="_blank" rel="noreferrer">United Nations Sustainable Development Goal 4</a>
            </p>
            <h3>What is still limited</h3>
            <ul>
              <li>There is no recorded narration, so Listen and follow stays unavailable. Nothing is spoken automatically.</li>
              <li>There is no reviewed sign-language video. Text on the linked-list page is not sign language.</li>
              <li>The 3D view is a simplified illustration. The structure list and written explanation carry the same science.</li>
              <li>This build has not had a formal accessibility audit.</li>
              <li>Signed media upload needs server credentials. Lessons keep working when that upload is unavailable.</li>
              <li>SDG 3 is linked from the cell and heart lessons, and SDG 15 from the plant cell. DNA and the neuron have no curated goal, and none was invented. There is no SDG 7 energy lesson here.</li>
            </ul>
            <h3>Other workspaces</h3>
            <div className="path-options">
              <button type="button" className="btn-secondary" onClick={() => setActiveTab('cloudinary')}>Media studio</button>
              <button type="button" className="btn-secondary" onClick={() => setActiveTab('stem')}>STEM labs</button>
              <button type="button" className="btn-secondary" onClick={() => setActiveTab('gates')}>Reliability gates</button>
              <button type="button" className="btn-secondary" onClick={() => setActiveTab('isl')}>Linked-list text lesson</button>
            </div>
          </section>
        )}

        {/* TAB 5: INCLUSIVE ISL CLASSROOM */}
        {activeTab === 'isl' && (
          <ISLPlayer
            onLoadLessonIntoSandbox={(lessonGraph, op) => {
              setActiveStemDomain('data_structure');
              setGraph(lessonGraph);
              setCurrentOperation(op);
              setActiveTab('stem');
              generateStepsForGraph(lessonGraph, op, 9);
              setLiveAnnouncement('Loaded the linked-list text lesson into the studio. This is not a sign-language video.');
            }}
            onOpenKeyboardShortcuts={() => setIsShortcutsOpen(true)}
          />
        )}

        {/* TAB 6: STEM & UNIVERSAL LABS (Physics, Ray Optics, Chemistry, Computer Science) */}
        {activeTab === 'stem' && (
          <div>
            {/* Domain Switcher Pill Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className={`btn-secondary ${activeStemDomain === 'universal' ? 'active' : ''}`}
                  onClick={() => setActiveStemDomain('universal')}
                  style={{
                    fontSize: '0.85rem',
                    padding: '0.45rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    borderColor: activeStemDomain === 'universal' ? 'var(--accent-emerald)' : undefined,
                    background: activeStemDomain === 'universal' ? 'rgba(16, 185, 129, 0.15)' : undefined
                  }}
                >
                  <Sparkles size={16} color={activeStemDomain === 'universal' ? 'var(--accent-emerald)' : 'var(--text-muted)'} />
                  <span>Universal STEM Diagrams</span>
                </button>

                <button
                  type="button"
                  className={`btn-secondary ${activeStemDomain === 'physics' ? 'active' : ''}`}
                  onClick={() => setActiveStemDomain('physics')}
                  style={{
                    fontSize: '0.85rem',
                    padding: '0.45rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    borderColor: activeStemDomain === 'physics' ? 'var(--accent-cyan)' : undefined,
                    background: activeStemDomain === 'physics' ? 'rgba(56, 189, 248, 0.15)' : undefined
                  }}
                >
                  <Atom size={16} color={activeStemDomain === 'physics' ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
                  <span>Physics Lab (Ray Optics, Pendulum)</span>
                </button>

                <button
                  type="button"
                  className={`btn-secondary ${activeStemDomain === 'data_structure' ? 'active' : ''}`}
                  onClick={() => setActiveStemDomain('data_structure')}
                  style={{
                    fontSize: '0.85rem',
                    padding: '0.45rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    borderColor: activeStemDomain === 'data_structure' ? 'var(--accent-purple)' : undefined,
                    background: activeStemDomain === 'data_structure' ? 'rgba(192, 132, 252, 0.15)' : undefined
                  }}
                >
                  <Binary size={16} color={activeStemDomain === 'data_structure' ? 'var(--accent-purple)' : 'var(--text-muted)'} />
                  <span>Data Structures Studio</span>
                </button>
              </div>
            </div>

            {/* DOMAIN 1: Universal STEM Diagram */}
            {activeStemDomain === 'universal' && (
              <UniversalDiagramCanvas
                diagram={universalModel}
                onAnnounce={setLiveAnnouncement}
                onSwitchDomain={() => setActiveStemDomain('physics')}
              />
            )}

            {/* DOMAIN 2: Physics Lab */}
            {activeStemDomain === 'physics' && (
              <InteractivePhysicsStudio
                model={physicsModel}
                onAnnounce={setLiveAnnouncement}
                onSwitchToDataStructure={() => setActiveStemDomain('data_structure')}
              />
            )}

            {/* DOMAIN 3: Data Structures Studio */}
            {activeStemDomain === 'data_structure' && (
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
                          onClick={() => {
                            setCurrentOperation(op.id);
                            setIsPlaying(false);
                            generateStepsForGraph(graph, op.id, op.id === 'insertHead' ? 9 : 99);
                          }}
                        >
                          {op.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <InteractiveCanvas
                  graph={renderedGraph}
                  activePointers={currentStep?.activePointers || { head: graph.headId }}
                  highlightedNodeIds={currentStep?.highlightedNodeIds || []}
                  mutatedNodeId={currentStep?.mutatedNodeId}
                />

                <StepControls
                  currentStepIndex={currentStepIndex}
                  totalSteps={steps.length}
                  isPlaying={isPlaying}
                  onTogglePlay={handleTogglePlay}
                  onStepForward={handleStepForward}
                  onStepBackward={handleStepBackward}
                  onSeekStep={(idx) => {
                    setIsPlaying(false);
                    setCurrentStepIndex(idx);
                  }}
                  onReset={handleReset}
                  speed={playbackSpeed}
                  onChangeSpeed={setPlaybackSpeed}
                />

                <StateInspector currentStep={currentStep} />
                <PracticeSandbox key={activePyqId} graph={graph} pyqId={activePyqId} onAnnouncement={setLiveAnnouncement} />
              </div>
            )}
          </div>
        )}

        {/* TAB 7: 8 VALIDATION GATES ARCHITECTURE VIEW */}
        {activeTab === 'gates' && (
          <div className="glass-panel">
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              The 8-Stage Reliability Pipeline Architecture
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Unlike brittle AI prototypes that trust raw model responses, ConceptLens enforces validation gates at every stage before rendering graphics or calculating answers.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              {[
                { num: '01', title: 'Upload & Validate', desc: 'Checks file mime, size limits (max 15MB), and format integrity.', status: 'Active' },
                { num: '02', title: 'Prepare Media', desc: 'Cloudinary signed upload, auto-deskew, sharpen & crop bounding box.', status: 'Active' },
                { num: '03', title: 'Extract Content', desc: 'OCR bounding boxes with normalized coordinates.', status: 'Active' },
                { num: '04', title: 'Interpret Diagram', desc: 'AI vision prompt bound by strict AST Zod schema.', status: 'Active' },
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
                    padding: '1.1rem'
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
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {g.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        </Suspense>
      </main>

      {/* Full Exam Practice Modal (Invoked from Biology Workspace) */}
      <Suspense fallback={null}>
        {isPracticeModalOpen && (
          <BiologyPracticeModal
            lesson={currentBioLesson}
            isOpen={isPracticeModalOpen}
            onClose={() => setIsPracticeModalOpen(false)}
            onAnnounce={setLiveAnnouncement}
          />
        )}
      </Suspense>

      {/* Human-in-the-Loop Review Modal (Gate 06) */}
      <ValidationInspector
        graph={graph}
        validation={validationResult}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSaveCorrections={(corrected) => {
          setActiveStemDomain('data_structure');
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

      <LearningLens
        open={lensOpen}
        onClose={() => setLensOpen(false)}
        onStartLearning={() => {
          setLensOpen(false);
          setActiveTab('biology');
          setLiveAnnouncement(`Starting ${currentBioLesson.title}. Your place in this concept stays.`);
          window.scrollTo({ top: 0, behavior: preferences.reducedMotion || preferences.lowStimulation ? 'auto' : 'smooth' });
        }}
        preferences={preferences}
        onPreferences={(next) => {
          setPreferences(next);
          if (next.lowData !== preferences.lowData) {
            setLiveAnnouncement(next.lowData ? 'Low data on. Optional media waits until you ask.' : 'Low data off.');
          } else {
            const added = next.activeThemes.filter((id) => !preferences.activeThemes.includes(id));
            const removed = preferences.activeThemes.filter((id) => !next.activeThemes.includes(id));
            if (added.length || removed.length) {
              setLiveAnnouncement(
                next.activeThemes.length
                  ? `Learning themes on: ${next.activeThemes.length}.`
                  : 'Learning themes reset to the standard lesson.'
              );
            }
          }
        }}
        themeChoice={themeChoice}
        onThemeChoice={(choice) => {
          setThemeChoice(choice);
          setLiveAnnouncement(
            choice === 'system' ? 'Theme will follow this device.' : choice === 'dark' ? 'Dark theme.' : 'Light theme.'
          );
        }}
      />
    </div>
  );
};

export default App;
