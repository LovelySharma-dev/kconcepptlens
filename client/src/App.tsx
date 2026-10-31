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
import { LearningLens } from './components/LearningLens';
import { type LearningModeId, type LearningPreferences, type ThemeChoice, applyLearningTheme, learningDomClasses, learningDomState, readThemeChoice, removeLearningTheme, resolveTheme, respectSystemReducedMotion } from '@conceptlens/shared';
import { readDisplayPreferences, writeDisplayPreferences } from './components/biology/LearningPaths';

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
const ISLCatalogWorkspace = lazy(() =>
  import('./components/isl/ISLCatalogWorkspace').then((m) => ({ default: m.ISLCatalogWorkspace }))
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
const LearnWorkspace = lazy(() =>
  import('./components/learn/LearnWorkspace').then((m) => ({ default: m.LearnWorkspace }))
);
const PointerLieLesson = lazy(() =>
  import('./components/learn/PointerLieLesson').then((m) => ({ default: m.PointerLieLesson }))
);
const PracticeWorkspace = lazy(() =>
  import('./components/practice/PracticeWorkspace').then((m) => ({ default: m.PracticeWorkspace }))
);
const AboutPage = lazy(() => import('./components/about/AboutPage'));
const HomeView = lazy(() =>
  import('./components/home/HomeView').then((m) => ({ default: m.HomeView }))
);
const ADHDLearningDashboard = lazy(() =>
  import('./components/adhd/ADHDLearningDashboard').then((m) => ({ default: m.ADHDLearningDashboard }))
);

import { InteractiveCanvas } from './components/InteractiveCanvas';
import { StepControls } from './components/StepControls';
import { StateInspector } from './components/StateInspector';
import { ValidationInspector } from './components/ValidationInspector';
import { LiveAnnouncer } from './components/LiveAnnouncer';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { FocusRuler } from './components/FocusRuler';
import { VoiceGuide } from './components/VoiceGuide';

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
  Info,
  HelpCircle,
  Eye,
  Atom,
  Binary,
  Sparkles,
  Sun,
  Moon,
  Menu,
  Accessibility,
  Focus,
  Layers,
  Compass
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
  // Navigation & Tabs: 4 primary destinations (Home, Learn, Practice, About) + specialized labs
  const [activeTab, setActiveTab] = useState<
    'home' | 'learn' | 'biology' | 'cloudinary' | 'practice' | 'isl' | 'stem' | 'gates' | 'about' | 'adhd'
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
  const [islSubTab, setIslSubTab] = useState<'catalog' | 'player'>('catalog');

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
    async (targetGraph: LinkedListGraph, op: string = 'insertHead', val: number = 9, announce = true) => {
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
          if (announce) setLiveAnnouncement(json.data.steps[0].screenReaderAnnouncement);
        }
      } catch (err) {
        console.error('Failed to generate steps:', err);
      }
    },
    []
  );

  useEffect(() => {
    generateStepsForGraph(initialDefaultGraph, 'insertHead', 9, false);
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
        setActiveTab('learn');
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
      } else if (e.key === 'g' || e.key === 'G') {
        if (e.shiftKey) {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('conceptlens:open-guide', { detail: { mode: 'navigate' } }));
          return;
        }
        const launcher = document.querySelector<HTMLButtonElement>('.voice-guide-launcher');
        if (launcher) launcher.click();
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
              <span className="brand-edition">Living Atlas</span>
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
            className={`tab-btn ${activeTab === 'learn' || activeTab === 'biology' ? 'active' : ''}`}
            aria-current={activeTab === 'learn' || activeTab === 'biology' ? 'page' : undefined}
            onClick={() => { setActiveTab('learn'); setMenuOpen(false); }}
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
            className={`tab-btn ${activeTab === 'adhd' ? 'active' : ''}`}
            aria-current={activeTab === 'adhd' ? 'page' : undefined}
            onClick={() => { setActiveTab('adhd'); setMenuOpen(false); }}
            title="ADHD-Friendly Learning Space"
          >
            <Sparkles size={15} color="var(--accent-cyan)" />
            <span>ADHD Space</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'cloudinary' ? 'active' : ''}`}
            aria-current={activeTab === 'cloudinary' ? 'page' : undefined}
            onClick={() => { setActiveTab('cloudinary'); setMenuOpen(false); }}
            title="Cloudinary Media Intelligence Studio"
          >
            <Layers size={15} />
            <span>Media Studio</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
            aria-current={activeTab === 'about' ? 'page' : undefined}
            onClick={() => {
              setActiveTab('about');
              setMenuOpen(false);
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            title="About ConceptLens Mission & Architecture"
          >
            <Info size={15} />
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
              setLiveAnnouncement(preferences.lowData ? 'Low data off.' : 'Low data on. Diagrams stay unloaded until you ask.');
            }}
            aria-pressed={preferences.lowData}
          >
            <span>Low data <span className="theme-card-status">{preferences.lowData ? 'On' : 'Off'}</span></span>
          </button>

          <button
            type="button"
            className={`toolbar-text-btn ${preferences.focusMode || preferences.adhdFriendly ? 'active' : ''}`}
            onClick={() => {
              const active = preferences.focusMode || preferences.adhdFriendly;
              setPreferences((cur) => {
                if (active) {
                  return {
                    ...removeLearningTheme(cur, 'adhd-friendly'),
                    focusMode: false,
                    adhdFriendly: false
                  };
                } else {
                  return {
                    ...applyLearningTheme(cur, 'adhd-friendly'),
                    focusMode: true,
                    adhdFriendly: true
                  };
                }
              });
              setLiveAnnouncement(
                preferences.focusMode || preferences.adhdFriendly
                  ? 'Focus mode off.'
                  : 'ADHD Focus mode on. Reading ruler and distractions minimized.'
              );
            }}
            aria-pressed={preferences.focusMode || preferences.adhdFriendly}
            title="Toggle ADHD Focus Mode (reading ruler and reduced distractions)"
          >
            <Focus size={16} aria-hidden="true" />
            <span>Focus <span className="theme-card-status">{preferences.focusMode || preferences.adhdFriendly ? 'On' : 'Off'}</span></span>
          </button>

          <button
            type="button"
            className="btn-secondary lens-launch"
            onClick={() => setLensOpen(true)}
            aria-haspopup="dialog"
            aria-controls="learning-theme-dialog"
          >
            <Accessibility size={18} aria-hidden="true" />
            <span className="lens-label-full">Learning & Accessibility Themes</span>
            <span className="lens-label-short">Themes</span>
            {preferences.activeThemes.length > 0 && (
              <span className="theme-count">{preferences.activeThemes.length} on</span>
            )}
          </button>

          <button
            type="button"
            className="toolbar-text-btn"
            onClick={() => {
              const launcher = document.querySelector<HTMLButtonElement>('.voice-guide-launcher');
              if (launcher) launcher.click();
            }}
            title="Interactive Voice & Task Guide [G]"
            aria-label="Guide Me. Interactive Voice and Task Guide"
          >
            <Compass size={16} aria-hidden="true" />
            <span>Guide Me</span>
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
        {/* ADHD Focus Mode & Reading Ruler Overlay */}
        <FocusRuler
          isActive={preferences.focusMode || preferences.adhdFriendly}
          preferences={preferences}
          onPreferences={setPreferences}
          onAnnounce={setLiveAnnouncement}
          currentActivity={
            activeTab === 'home'
              ? 'Home & Overview'
              : activeTab === 'learn'
              ? 'Concept Learning Workspace'
              : activeTab === 'biology'
              ? `Biology Lesson: ${currentBioLesson.title}`
              : activeTab === 'practice'
              ? 'Practice Workspace'
              : activeTab === 'adhd'
              ? 'ADHD-Friendly Study Space'
              : activeTab === 'stem'
              ? `STEM Studio: ${activeStemDomain === 'data_structure' ? 'Linked List Engine' : activeStemDomain === 'physics' ? 'Ray Optics' : 'Universal STEM'}`
              : activeTab === 'about'
              ? 'Product Architecture & Mission'
              : 'Learning Workspace'
          }
          nextAction={
            activeTab === 'learn'
              ? 'Choose a representation (Read, Steps, Practice, Flashcards) to explore this concept'
              : activeTab === 'adhd'
              ? 'Choose a micro-task or start a 5-minute focus session'
              : activeTab === 'biology'
              ? 'Explore labeled diagram structures or step through the lesson'
              : activeTab === 'practice'
              ? 'Paste notes, upload files, capture photos, or dictate notes to generate practice questions'
              : activeTab === 'stem'
              ? 'Step forward (Right Arrow) or select a node to inspect'
              : 'Select a section to learn at your pace'
          }
        />

        <Suspense fallback={<WorkspaceLoadingFallback />}>
          {/* TAB 1: HOME */}
          {activeTab === 'home' && (
            <HomeView
              preferences={preferences}
              onPreferences={setPreferences}
              onNavigateLearn={() => { setActiveTab('learn'); window.scrollTo({ top: 0, behavior: 'instant' }); }}
              onNavigatePractice={() => { setActiveTab('practice'); window.scrollTo({ top: 0, behavior: 'instant' }); }}
              onNavigateADHD={() => { setActiveTab('adhd'); window.scrollTo({ top: 0, behavior: 'instant' }); }}
              onNavigateAbout={() => { setActiveTab('about'); setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'instant' }); }}
              onNavigateISL={() => { setActiveTab('isl'); setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'instant' }); }}
              onOpenAccessibility={() => setLensOpen(true)}
              onAnnounce={setLiveAnnouncement}
              onOpenAtlas={() => {
                setActiveTab('learn');
                window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
              }}
              onOpenPointerLie={() => {
                setActiveTab('learn');
                const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                const tryScroll = (attempt = 0) => {
                  const target = document.getElementById('pointer-lie');
                  if (target) {
                    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
                    return;
                  }
                  if (attempt < 40) window.setTimeout(() => tryScroll(attempt + 1), 50);
                };
                window.setTimeout(() => tryScroll(), 0);
              }}
            />
          )}

          {/* TAB 2: LEARN */}
          {activeTab === 'learn' && (
            <>
              <LearnWorkspace
              preferences={preferences}
              onPreferences={setPreferences}
              onAnnounce={setLiveAnnouncement}
              onLaunchInteractiveBiology={handleLaunchTopic}
              onLaunchInteractiveSTEM={(domain) => {
                setActiveStemDomain(domain);
                setActiveTab('stem');
              }}
              onNavigateISL={() => setActiveTab('isl')}
            />
              <Suspense fallback={<p role="status">Loading the linked-list lesson.</p>}>
                <PointerLieLesson
                  onAnnounce={setLiveAnnouncement}
                  highContrast={preferences.highContrast}
                  colorFriendly={preferences.colorFriendly}
                />
              </Suspense>
              </>
          )}

          {/* TAB: DEDICATED BIOLOGY INTERACTIVE ATLAS */}
          {activeTab === 'biology' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Topic Switcher Pills & Back to Learn button */}
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
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setActiveTab('learn');
                      setLiveAnnouncement('Returned to lesson workspace.');
                    }}
                    style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem', marginRight: '0.5rem' }}
                  >
                    ← Back to Lesson
                  </button>

                  {[
                    { id: 'human_cell', label: 'Human Cell' },
                    { id: 'human_heart', label: 'Human Heart' },
                    { id: 'dna_helix', label: 'DNA Double Helix' },
                    { id: 'neuron', label: 'Neuron' }
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
                    </button>
                  ))}
                </div>

                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Interactive Canvas View
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

          {/* TAB 4: PRACTICE WORKSPACE */}
          {activeTab === 'practice' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <PracticeWorkspace
                preferences={preferences}
                onPreferences={setPreferences}
                onAnnounce={setLiveAnnouncement}
              />
            </div>
          )}

          {/* TAB: ADHD-FRIENDLY LEARNING DASHBOARD */}
          {activeTab === 'adhd' && (
            <ADHDLearningDashboard
              preferences={preferences}
              onPreferences={setPreferences}
              onNavigateLearn={() => setActiveTab('learn')}
              onNavigatePractice={() => setActiveTab('practice')}
              onLaunchVisualModel={(topicId) => {
                setSelectedBioTopic(topicId);
                setActiveTab('biology');
              }}
              onAnnounce={setLiveAnnouncement}
            />
          )}

          {/* TAB 5: ABOUT PAGE */}
          {activeTab === 'about' && (
            <AboutPage
              onNavigateLearn={() => setActiveTab('learn')}
              onNavigatePractice={() => setActiveTab('practice')}
              onOpenAccessibility={() => setLensOpen(true)}
            />
          )}

        {/* TAB 5: INCLUSIVE ISL CLASSROOM */}
        {activeTab === 'isl' && (
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`btn-secondary ${islSubTab === 'catalog' ? 'active' : ''}`}
                onClick={() => {
                  setIslSubTab('catalog');
                  setLiveAnnouncement('Switched to Authentic ISL Curriculum Catalog.');
                }}
                style={{
                  fontSize: '0.85rem',
                  padding: '0.45rem 0.9rem',
                  background: islSubTab === 'catalog' ? 'rgba(56, 189, 248, 0.18)' : undefined,
                  borderColor: islSubTab === 'catalog' ? 'var(--accent-cyan)' : undefined,
                  color: islSubTab === 'catalog' ? '#f8fafc' : undefined
                }}
              >
                Authentic ISL Catalog
              </button>
              <button
                type="button"
                className={`btn-secondary ${islSubTab === 'player' ? 'active' : ''}`}
                onClick={() => {
                  setIslSubTab('player');
                  setLiveAnnouncement('Switched to Accessible Text Lessons.');
                }}
                style={{
                  fontSize: '0.85rem',
                  padding: '0.45rem 0.9rem',
                  background: islSubTab === 'player' ? 'rgba(192, 132, 252, 0.18)' : undefined,
                  borderColor: islSubTab === 'player' ? '#c084fc' : undefined,
                  color: islSubTab === 'player' ? '#f8fafc' : undefined
                }}
              >
                Accessible Text Lessons (CS)
              </button>
            </div>

            {islSubTab === 'catalog' ? (
              <Suspense fallback={<p role="status">Loading the Authentic ISL Curriculum Catalog...</p>}>
                <ISLCatalogWorkspace
                  onAnnounce={setLiveAnnouncement}
                  onOpenKeyboardShortcuts={() => setIsShortcutsOpen(true)}
                />
              </Suspense>
            ) : (
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
          </div>
        )}

        {/* TAB 6: STEM & UNIVERSAL LABS (Physics, Ray Optics, Chemistry, Computer Science) */}
        {activeTab === 'stem' && (
          <div>
            {/* Domain Switcher Pill Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setActiveTab('learn');
                    setLiveAnnouncement('Returned to lesson workspace.');
                  }}
                  style={{ fontSize: '0.85rem', padding: '0.45rem 0.85rem', marginRight: '0.25rem' }}
                >
                  ← Back to Lesson
                </button>

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
                  highContrast={preferences.highContrast}
                  colorFriendly={preferences.colorFriendly}
                  onAnnounce={setLiveAnnouncement}
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
                  isMutatingStep={Boolean(currentStep?.mutatedNodeId)}
                  onAnnouncement={setLiveAnnouncement}
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
                { num: '01', title: 'Upload & Validate', desc: 'Checks file bytes, not only the declared type, and enforces the size limit.', status: 'Active' },
                { num: '02', title: 'Prepare Media', desc: 'Signed Cloudinary upload stays off until the account check succeeds.', status: 'Guarded' },
                { num: '03', title: 'Extract Content', desc: 'Typed text and PDF text layers are read locally. Photographs and scanned pages use local Tesseract when it loads. A failed read does not invent text.', status: 'Active' },
                { num: '04', title: 'Interpret Diagram', desc: 'Curated lessons and checked rules. Arbitrary images are not given invented readings.', status: 'Limited' },
                { num: '05', title: 'Validate Structure', desc: 'Floyd cycle detection, head integrity & dangling checks.', status: 'Enforced' },
                { num: '06', title: 'Human Correction', desc: 'You confirm an OCR reading and can correct the subject, content type, or text.', status: 'Available' },
                { num: '07', title: 'Deterministic Render', desc: 'Mathematical state transitions (no AI hallucinations).', status: 'Active' },
                { num: '08', title: 'Verify Learning', desc: 'Connects answers to original PYQ marking scheme.', status: 'Active' }
              ].map((g) => (
                <div
                  key={g.num}
                  style={{
                    background: 'var(--surface-bg)',
                    border: '1px solid var(--border-medium)',
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
          setActiveTab('learn');
          setLiveAnnouncement('Starting concept learning workspace. Your place in this concept stays.');
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

      {/* Website-Wide Interactive Voice & Task Guide (Phase 2) */}
      <VoiceGuide
        activeTab={activeTab}
        isLensOpen={lensOpen}
        preferences={preferences}
        onAnnounce={setLiveAnnouncement}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setMenuOpen(false);
        }}
        onOpenAccessibility={() => setLensOpen(true)}
      />
    </div>
  );
};

export default App;
