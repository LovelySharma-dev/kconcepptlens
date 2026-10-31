import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  X,
  Compass,
  CheckCircle2,
  BookOpen,
  Sparkles
} from 'lucide-react';
import type { LearningPreferences } from '@conceptlens/shared';

export type GuideMode = 'tour' | 'task' | 'read';

export interface GuideStep {
  id: string;
  title: string;
  instruction: string;
  spokenText?: string;
  targetSelector?: string;
  fallbackSelector?: string;
  actionHint?: string;
}

export interface PageTourDefinition {
  pageId: string;
  pageTitle: string;
  overviewSteps: GuideStep[];
  taskSteps: GuideStep[];
  readAloudText: string[];
}

interface VoiceGuideProps {
  activeTab: 'home' | 'learn' | 'biology' | 'cloudinary' | 'practice' | 'isl' | 'stem' | 'gates' | 'about' | 'adhd';
  isLensOpen?: boolean;
  preferences: LearningPreferences;
  onAnnounce?: (msg: string) => void;
  onNavigateTab?: (tab: 'home' | 'learn' | 'biology' | 'cloudinary' | 'practice' | 'about' | 'adhd') => void;
  onOpenAccessibility?: () => void;
}

export const PAGE_TOURS: Record<string, PageTourDefinition> = {
  home: {
    pageId: 'home',
    pageTitle: 'Home & Digital Observatory',
    overviewSteps: [
      {
        id: 'home-purpose',
        title: 'Welcome to ConceptLens',
        instruction: 'ConceptLens (The Living Atlas) provides inclusive STEM learning aligned with UN SDG 4. One scientific concept is represented in multiple ways—visual diagrams, simple steps, plain language, and active practice—so every learner understands.',
        spokenText: 'Welcome to ConceptLens. One concept, different ways to understand it. ConceptLens breaks cognitive and sensory barriers in STEM education.',
        targetSelector: '.brand'
      },
      {
        id: 'home-start',
        title: 'Start Learning',
        instruction: 'Select "Explore Curriculum" or pick a highlighted subject below to begin interactive study. Your learning continuity is saved automatically.',
        spokenText: 'To start learning, choose Explore Curriculum or select any highlighted subject.',
        targetSelector: '.brand, .btn-primary'
      },
      {
        id: 'home-ways',
        title: 'Different Ways to Learn',
        instruction: 'Interactive previews let you experience ADHD focus rulers, dyslexia typography, high contrast, and simplified steps before enabling them.',
        spokenText: 'Try different representations like ADHD focus mode, dyslexia-friendly spacing, and high contrast.',
        targetSelector: '.setting-btn, [role="tablist"]'
      }
    ],
    taskSteps: [
      {
        id: 'task-home-1',
        title: 'Step 1: Choose Your Subject',
        instruction: 'Browse the featured science and computer science topics, such as the Human Cell, Convex Lens Optics, or Linked Lists.',
        spokenText: 'Step 1: Browse the featured topics on the home page.',
        targetSelector: '.tag-btn, .curated-pills'
      },
      {
        id: 'task-home-2',
        title: 'Step 2: Enter the Workspace',
        instruction: 'Click on any topic card to open the complete multi-representation lesson and interactive model.',
        spokenText: 'Step 2: Click on any topic to enter its interactive workspace.',
        targetSelector: '.btn-primary'
      }
    ],
    readAloudText: [
      'ConceptLens: One concept, different ways to understand it.',
      'An inclusive STEM learning platform aligned with United Nations Sustainable Development Goal 4: Quality Education.',
      'Explore Biology, Physics, and Computer Science through verified curriculum standards, interactive spatial models, and personalized accessibility themes.'
    ]
  },
  learn: {
    pageId: 'learn',
    pageTitle: 'Concept Learning Workspace',
    overviewSteps: [
      {
        id: 'learn-discovery',
        title: 'Subject Discovery',
        instruction: 'Discover subjects using the curated topic pills or enter any STEM concept into the AI lesson studio query box.',
        spokenText: 'Subject Discovery: Select a topic from the syllabus pills or type any concept to explore.',
        targetSelector: '.tag-btn, .curated-pills'
      },
      {
        id: 'learn-selection',
        title: 'Concept Selection & Grounding',
        instruction: 'When a concept is loaded, ConceptLens grounds the lesson with verified syllabus definitions, exam scope, and common misconceptions.',
        spokenText: 'Concept Selection: Each concept provides scientifically verified explanations and board examination facts.',
        targetSelector: '.representation-tabs, h1'
      },
      {
        id: 'learn-representations',
        title: 'Multiple Representations',
        instruction: 'Explore the concept across 6 tabs: Read (Standard), Simplified (Easy Read), Step-by-Step, Visual Spatial Model, Flashcards, and Practice Quiz.',
        spokenText: 'Switch freely between Standard Reading, Simplified Language, Step-by-Step, Interactive Visual Models, Flashcards, and Practice Quiz.',
        targetSelector: '.representation-tabs'
      },
      {
        id: 'learn-continuity',
        title: 'Learning Continuity',
        instruction: 'Switching representations never loses your progress. Your place in the lesson, completed stages, and quiz answers stay intact.',
        spokenText: 'Learning Continuity: Switching between reading and diagrams preserves your exact place and quiz scores.',
        targetSelector: '.representation-tabs'
      }
    ],
    taskSteps: [
      {
        id: 'task-learn-1',
        title: 'Step 1: Read or Simplify',
        instruction: 'Start by reviewing the core definition in the Read or Simplified tab.',
        spokenText: 'First, review the main concept explanation.',
        targetSelector: '.representation-tabs button:first-child'
      },
      {
        id: 'task-learn-2',
        title: 'Step 2: Walk Through Steps',
        instruction: 'Select Step-by-Step to break the mechanism into manageable ordered stages with Back and Next controls.',
        spokenText: 'Next, click Step-by-Step to see the ordered progression.',
        targetSelector: '.representation-tabs button:nth-child(2)'
      },
      {
        id: 'task-learn-3',
        title: 'Step 3: Test Understanding',
        instruction: 'Switch to Practice Quiz to test your recall with instant explanatory feedback.',
        spokenText: 'Finally, verify your knowledge with the practice questions.',
        targetSelector: '.representation-tabs button:nth-child(5)'
      }
    ],
    readAloudText: [
      'Learn Workspace. Explore STEM concepts with guaranteed mathematical and anatomical accuracy.',
      'Switch between standard reading, simplified plain language, sequential steps, interactive 2D models, flashcards, and quizzes.',
      'Your learning continuity is maintained automatically across all representations.'
    ]
  },
  biology: {
    pageId: 'biology',
    pageTitle: 'Interactive Anatomy & Spatial Models',
    overviewSteps: [
      {
        id: 'bio-canvas',
        title: 'Interactive Diagram Canvas',
        instruction: 'The diagram canvas renders physiological and anatomical structures with responsive SVG vectors and keyboard navigation.',
        spokenText: 'The Interactive Diagram Canvas renders detailed anatomical structures.',
        targetSelector: '.canvas-hud, svg'
      },
      {
        id: 'bio-selection',
        title: 'Selecting Diagram Components',
        instruction: 'Click any labeled organelle or press Enter while navigating with Tab to inspect its biological function, analogy, and exam significance.',
        spokenText: 'Select any diagram component to inspect its function and exam significance.',
        targetSelector: 'svg'
      },
      {
        id: 'bio-hud',
        title: 'Zoom, Pan & Reset Controls',
        instruction: 'Use the Canvas HUD controls in the top right to Zoom In (+), Zoom Out (-), Reset View (0), or toggle Labels.',
        spokenText: 'Use the controls in the top right corner to zoom, pan, or reset the diagram.',
        targetSelector: '.canvas-hud'
      },
      {
        id: 'bio-tour',
        title: 'Guided Model Steps',
        instruction: 'Click Guided Tour to walk through the 5 essential structures of this specimen in pedagogical order.',
        spokenText: 'Click Guided Tour to walk through key structures step by step.',
        targetSelector: '.canvas-hud button, .btn-secondary'
      }
    ],
    taskSteps: [
      {
        id: 'task-bio-1',
        title: 'Step 1: Launch Guided Tour',
        instruction: 'Click the Guided Tour button in the bottom left of the canvas.',
        spokenText: 'Click Guided Tour to begin an interactive walk-through.',
        targetSelector: '.btn-secondary'
      },
      {
        id: 'task-bio-2',
        title: 'Step 2: Inspect Active Structures',
        instruction: 'Observe the highlighted bounding circle and read the organelle breakdown in the inspector panel.',
        spokenText: 'Read the function breakdown for the selected structure.',
        targetSelector: '.canvas-hud, svg'
      }
    ],
    readAloudText: [
      'Interactive Model Atlas. Explore biological and physical mechanisms with complete spatial fidelity.',
      'Use keyboard Tab to move between structures. Press Enter to select. Use the Zoom controls or the Guided Tour to inspect each component.'
    ]
  },
  stem: {
    pageId: 'stem',
    pageTitle: 'STEM Labs & Concept Engine',
    overviewSteps: [
      {
        id: 'stem-domains',
        title: 'Domain Switcher',
        instruction: 'Switch between Universal STEM Diagrams, Geometrical Ray Optics Physics, and Deterministic Data Structures.',
        spokenText: 'Choose between Universal Diagrams, Physics Ray Optics, and Data Structures.',
        targetSelector: '.btn-secondary'
      },
      {
        id: 'stem-controls',
        title: 'Stepping & Simulation Controls',
        instruction: 'Use Step Forward, Step Backward, Play, and Reset to inspect pointer updates or ray tracing transitions with zero hallucinations.',
        spokenText: 'Use the stepping controls or arrow keys to advance through mathematical transitions.',
        targetSelector: '.step-controls, .btn-primary'
      }
    ],
    taskSteps: [
      {
        id: 'task-stem-1',
        title: 'Step 1: Choose an Operation',
        instruction: 'Select Insert Head, Delete Node, or Reverse List.',
        spokenText: 'Select an operation like Insert Head or Reverse List.',
        targetSelector: '.btn-secondary'
      },
      {
        id: 'task-stem-2',
        title: 'Step 2: Step Through Guaranteed Invariants',
        instruction: 'Press Right Arrow or click Step Forward to witness deterministic pointer assignments.',
        spokenText: 'Step forward to inspect each pointer mutation.',
        targetSelector: '.btn-primary'
      }
    ],
    readAloudText: [
      'STEM Simulation Studio. Experience deterministic concept engines governed by strict mathematical invariants and Floyd cycle verification.'
    ]
  },
  practice: {
    pageId: 'practice',
    pageTitle: 'Practice & OCR Ingestion Studio',
    overviewSteps: [
      {
        id: 'practice-intro',
        title: 'Practice & Ingestion Studio',
        instruction: 'Generate zero-stakes practice questions, revision notes, and flashcards from your study materials.',
        spokenText: 'The Practice Studio creates practice questions and revision materials from your notes.',
        targetSelector: 'h1'
      },
      {
        id: 'practice-inputs',
        title: 'Supported Input Methods',
        instruction: 'Choose your preferred input method: Paste Text, Upload PDF/Image, Camera Capture, or Dictate Speech via browser speech recognition.',
        spokenText: 'Choose from 4 input methods: Paste Text, Upload Documents, Take a Photo, or Dictate with your voice.',
        targetSelector: '.tag-btn, [role="tablist"]'
      },
      {
        id: 'practice-extract',
        title: 'Local Text Extraction & OCR Review',
        instruction: 'PDF text layers are read locally in your browser. Photos use client-side OCR. You can review and edit extracted text before generating questions.',
        spokenText: 'All text extraction is processed safely. You can review and edit the text before generating questions.',
        targetSelector: 'textarea, .text-input'
      },
      {
        id: 'practice-actions',
        title: 'Adaptive Practice Modes',
        instruction: 'Generate multiple-choice quizzes, flashcards, key terminology glossaries, or audio sonifications with one click.',
        spokenText: 'Generate quizzes, flashcards, terminology summaries, or audio reviews.',
        targetSelector: '.btn-primary, .btn-secondary'
      }
    ],
    taskSteps: [
      {
        id: 'task-practice-1',
        title: 'Step 1: Enter or Upload Notes',
        instruction: 'Type or paste a paragraph of textbook notes into the input box.',
        spokenText: 'Type or paste your study notes into the text area.',
        targetSelector: 'textarea'
      },
      {
        id: 'task-practice-2',
        title: 'Step 2: Generate Quiz or Flashcards',
        instruction: 'Click "Generate Practice Quiz" to create 3 curriculum-aligned multiple choice questions.',
        spokenText: 'Click Generate Practice Quiz to create zero-stakes practice questions.',
        targetSelector: '.btn-primary'
      }
    ],
    readAloudText: [
      'Practice Workspace. Paste lecture notes, upload homework pages, capture textbook photos, or dictate notes.',
      'Review extracted OCR text, and generate adaptive practice quizzes, flashcards, and revision summaries.'
    ]
  },
  adhd: {
    pageId: 'adhd',
    pageTitle: 'ADHD-Friendly Study Space',
    overviewSteps: [
      {
        id: 'adhd-space-intro',
        title: 'ADHD-Friendly Study Space',
        instruction: 'A flexible, low-pressure environment designed for executive function support. Nothing flashes, counts down, or demands deadlines.',
        spokenText: 'Welcome to the ADHD-Friendly Learning Space. Low pressure, flexible steps, and no forced deadlines.',
        targetSelector: 'h1'
      },
      {
        id: 'adhd-continue',
        title: 'Continue Learning',
        instruction: 'The primary action lets you resume your exact active lesson without losing your place or searching through menus.',
        spokenText: 'Continue Learning resumes your saved study session with one click.',
        targetSelector: '.btn-primary'
      },
      {
        id: 'adhd-small',
        title: 'Start Something Small',
        instruction: 'When feeling overwhelmed, "Start Something Small" launches one bite-sized 3-minute exploration with zero stakes.',
        spokenText: 'Start Something Small provides a quick 3-minute bite-sized exploration when you feel overwhelmed.',
        targetSelector: '.btn-secondary'
      },
      {
        id: 'adhd-quick',
        title: 'Quick Practice',
        instruction: 'Test your understanding with 3 zero-stakes practice questions to build momentum without test anxiety.',
        spokenText: 'Quick Practice offers 3 low-stakes questions to build confidence.',
        targetSelector: '.btn-secondary'
      },
      {
        id: 'adhd-timer',
        title: 'Flexible Focus Timer & Micro-Tasks',
        instruction: 'Use preset focus sessions (2, 5, 10, 15, or 25 min) as gentle suggestions, not deadlines. Break large topics into 5 micro-tasks under 5 minutes.',
        spokenText: 'Use the Flexible Focus Timer and Micro-Task Planner to break study goals into 5-minute steps.',
        targetSelector: '.adhd-timer-display, .adhd-timer-card'
      }
    ],
    taskSteps: [
      {
        id: 'task-adhd-1',
        title: 'Step 1: Set a Gentle Focus Timer',
        instruction: 'Click on a preset such as 5 min or 10 min, then press Start Focus.',
        spokenText: 'Select a timer preset like 5 or 10 minutes and click Start Focus.',
        targetSelector: '.adhd-timer-display'
      },
      {
        id: 'task-adhd-2',
        title: 'Step 2: Break Down a Goal',
        instruction: 'Type your goal into the Micro-Task Planner and click Plan to receive 5 manageable steps.',
        spokenText: 'Type your study goal and click Plan to generate 5 manageable steps.',
        targetSelector: '.text-input'
      }
    ],
    readAloudText: [
      'ADHD-Friendly Study Space. A calm, flexible environment designed for focus and executive function support.',
      'Resume saved sessions, start something small, try quick practice, and break complex goals into 5-minute micro-tasks with gentle focus timers.'
    ]
  },
  cloudinary: {
    pageId: 'cloudinary',
    pageTitle: 'Cloudinary Media Studio',
    overviewSteps: [
      {
        id: 'media-header',
        title: 'Cloudinary Media Intelligence',
        instruction: 'Inspects and transforms study diagrams using signed Cloudinary pipelines, auto-format (f_auto), and auto-quality (q_auto).',
        spokenText: 'Cloudinary Media Studio verifies and optimizes educational diagrams.',
        targetSelector: 'h1'
      },
      {
        id: 'media-specimen',
        title: 'Selecting an Asset',
        instruction: 'Choose an active syllabus specimen from the dropdown or upload your own diagrams via signed upload.',
        spokenText: 'Select an educational specimen or upload your own diagram.',
        targetSelector: 'select, .btn-secondary'
      },
      {
        id: 'media-preview',
        title: 'Previewing Transformations',
        instruction: 'Drag the interactive split slider left and right to compare original scan resolution with optimized delivery.',
        spokenText: 'Drag the before-and-after slider to compare original images with transformed delivery.',
        targetSelector: '.preview-slider-container, img'
      },
      {
        id: 'media-credits',
        title: 'Transparent Transformation Credits',
        instruction: 'Advanced AI operations like background removal (75 credits), generative fill (50 credits), and auto enhance (100 credits) are transparently priced before you confirm them.',
        spokenText: 'Credit-consuming operations like background removal and generative fill display credit costs before you apply them.',
        targetSelector: '.btn-secondary'
      },
      {
        id: 'media-actions',
        title: 'Applying or Discarding Changes',
        instruction: 'Preview changes first. Confirm to copy the optimized delivery URL, or discard to keep the original specimen intact.',
        spokenText: 'Preview transformations, confirm to copy the delivery URL, or discard changes anytime.',
        targetSelector: '.btn-primary, .btn-secondary'
      }
    ],
    taskSteps: [
      {
        id: 'task-media-1',
        title: 'Step 1: Choose a Specimen',
        instruction: 'Select a specimen such as the Human Cell or ISC Exam Diagram from the dropdown.',
        spokenText: 'Select a diagram from the specimen selector.',
        targetSelector: 'select'
      },
      {
        id: 'task-media-2',
        title: 'Step 2: Request a Transformation',
        instruction: 'Click Smart Subject Crop or AI Auto Enhance to generate a two-stage preview.',
        spokenText: 'Click an action like Smart Crop or Auto Enhance to view a preview.',
        targetSelector: '.btn-secondary'
      }
    ],
    readAloudText: [
      'Cloudinary Media Intelligence Studio. Signed uploads, responsive educational media delivery, deskewing, and AI transformations.',
      'All credit-consuming operations display transparent cost estimates before you confirm them.'
    ]
  },
  accessibility: {
    pageId: 'accessibility',
    pageTitle: 'Learning & Accessibility Themes',
    overviewSteps: [
      {
        id: 'a11y-themes',
        title: '18 Typed Presentation Themes',
        instruction: 'ConceptLens provides 18 presentation modes across Focus, Vision, Hearing, and Pace. Choices are interface preferences, never medical diagnoses.',
        spokenText: 'ConceptLens offers 18 accessibility and learning themes. Choices customize the interface without storing medical diagnoses.',
        targetSelector: '.theme-center, #learning-theme-dialog'
      },
      {
        id: 'a11y-focus',
        title: 'Focus & Reading Modes',
        instruction: 'Enable ADHD Focus Mode with reading ruler, Simple Steps, Easy Read plain language, or Dyslexia-friendly spacing.',
        spokenText: 'Enable focus mode, simple steps, easy read, or dyslexia typography.',
        targetSelector: '.theme-group'
      },
      {
        id: 'a11y-vision',
        title: 'Vision & Sensory Modes',
        instruction: 'Toggle High Contrast (WCAG AA), Color-Blind shapes, Low-Stimulation motion reduction, or Low-Data delivery.',
        spokenText: 'Toggle high contrast, color-blind shape indicators, low-stimulation mode, or low-data delivery.',
        targetSelector: '.theme-group'
      },
      {
        id: 'a11y-preserve',
        title: 'Preserving Preferences',
        instruction: 'Closing this dialog keeps your preferences and returns to your lesson without interruption.',
        spokenText: 'Closing accessibility settings saves your preferences and returns to your lesson.',
        targetSelector: '.btn-primary'
      }
    ],
    taskSteps: [
      {
        id: 'task-a11y-1',
        title: 'Step 1: Select a Theme',
        instruction: 'Click any theme card, such as ADHD-Friendly or Dyslexia-Friendly, to toggle it on or off.',
        spokenText: 'Click any theme card to toggle it on or off.',
        targetSelector: '.theme-card'
      },
      {
        id: 'task-a11y-2',
        title: 'Step 2: Resume Learning',
        instruction: 'Click "Start with this theme" or press Escape to return to your study session.',
        spokenText: 'Click Start with this theme to apply your choices.',
        targetSelector: '.btn-primary'
      }
    ],
    readAloudText: [
      'Learning and Accessibility Themes. Personalize your learning experience across 18 interface themes.',
      'Adjust typography, focus rulers, high contrast, low stimulation, and speech preferences at any time.'
    ]
  },
  about: {
    pageId: 'about',
    pageTitle: 'Product Architecture & SDG 4 Mission',
    overviewSteps: [
      {
        id: 'about-mission',
        title: 'Mission & Purpose',
        instruction: 'ConceptLens (The Living Atlas) eliminates sensory, cognitive, and bandwidth barriers in STEM education through multi-representation spatial learning.',
        spokenText: 'ConceptLens eliminates cognitive, sensory, and bandwidth barriers in STEM education.',
        targetSelector: 'h1'
      },
      {
        id: 'about-sdg',
        title: 'UN SDG 4 Connection',
        instruction: 'Aligned with United Nations Sustainable Development Goal 4 (Quality Education): specifically Target 4.5 (equal access for persons with disabilities) and Target 4.a (inclusive, safe learning environments).',
        spokenText: 'Aligned with UN Sustainable Development Goal 4: Quality Education for all learners.',
        targetSelector: '.glass-panel'
      },
      {
        id: 'about-pillars',
        title: 'Five Architectural Pillars',
        instruction: 'Built on 5 core pillars: Inclusive Interface, Multi-Tier AI Orchestration, Interactive Atlas, Cloudinary Media Pipeline, and the ConceptLens Everywhere Extension.',
        spokenText: 'Explore our 5 architectural pillars built for reliability, accessibility, and correctness.',
        targetSelector: '.glass-panel'
      }
    ],
    taskSteps: [
      {
        id: 'task-about-1',
        title: 'Step 1: Review Architectural Pillars',
        instruction: 'Inspect the 5 technical pillars to understand our verification gates and failover architecture.',
        spokenText: 'Read about the 5 core pillars of ConceptLens.',
        targetSelector: '.glass-panel'
      }
    ],
    readAloudText: [
      'ConceptLens / The Living Atlas. Product Architecture and Mission.',
      'Aligned with UN SDG 4: Ensuring inclusive and equitable quality education and promoting lifelong learning opportunities for all.',
      'Five core pillars: Inclusive interface, multi-tier AI orchestration, mathematical and physiological simulations, Cloudinary media pipeline, and Chrome extension.'
    ]
  }
};

export const VoiceGuide: React.FC<VoiceGuideProps> = ({
  activeTab,
  isLensOpen = false,
  preferences,
  onAnnounce,
  onNavigateTab,
  onOpenAccessibility
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<GuideMode>('tour');
  const [stepIndex, setStepIndex] = useState(0);
  const [isNarrationEnabled, setIsNarrationEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [readAloudIdx, setReadAloudIdx] = useState(0);

  const guidePanelRef = useRef<HTMLDivElement>(null);
  const activeTargetRef = useRef<Element | null>(null);

  // Check speech synthesis support
  const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

  // Determine current page tour
  const currentTourKey = isLensOpen ? 'accessibility' : (PAGE_TOURS[activeTab] ? activeTab : 'home');
  const currentTour: PageTourDefinition = PAGE_TOURS[currentTourKey] || PAGE_TOURS.home;

  const currentSteps: GuideStep[] = mode === 'task' ? currentTour.taskSteps : currentTour.overviewSteps;
  const currentStep: GuideStep | undefined = currentSteps[stepIndex] || currentSteps[0];

  // Stop active speech synthesis
  const stopSpeech = useCallback(() => {
    if (speechSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, [speechSupported]);

  // Clean up element highlight
  const clearTargetHighlight = useCallback(() => {
    if (activeTargetRef.current) {
      activeTargetRef.current.classList.remove('voice-guide-active-target');
      activeTargetRef.current = null;
    }
  }, []);

  // Highlight current target element safely
  const highlightTarget = useCallback((step: GuideStep | undefined) => {
    clearTargetHighlight();
    if (!step || typeof document === 'undefined') return;

    let targetEl: Element | null = null;
    if (step.targetSelector) {
      try {
        targetEl = document.querySelector(step.targetSelector);
      } catch {
        // invalid selector fallback
      }
    }
    if (!targetEl && step.fallbackSelector) {
      try {
        targetEl = document.querySelector(step.fallbackSelector);
      } catch {
        // ignore
      }
    }

    if (targetEl) {
      activeTargetRef.current = targetEl;
      targetEl.classList.add('voice-guide-active-target');
      targetEl.scrollIntoView({
        behavior: preferences.reducedMotion || preferences.lowStimulation ? 'auto' : 'smooth',
        block: 'nearest',
        inline: 'nearest'
      });
    }
  }, [clearTargetHighlight, preferences.reducedMotion, preferences.lowStimulation]);

  // Speak text safely with fallback
  const speakText = useCallback((textToSpeak: string) => {
    stopSpeech();
    if (!isNarrationEnabled || !speechSupported || !textToSpeak) return;

    try {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = preferences.speechRate || 1.0;
      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };
      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
    }
  }, [isNarrationEnabled, speechSupported, preferences.speechRate, stopSpeech]);

  // Step change trigger: highlight element & narrate step
  useEffect(() => {
    if (!isOpen) return;

    if (mode === 'tour' || mode === 'task') {
      if (currentStep) {
        highlightTarget(currentStep);
        speakText(currentStep.spokenText || currentStep.instruction);
        onAnnounce?.(`Guide Step ${stepIndex + 1} of ${currentSteps.length}: ${currentStep.title}. ${currentStep.instruction}`);
      }
    } else if (mode === 'read') {
      const readText = currentTour.readAloudText[readAloudIdx];
      if (readText) {
        speakText(readText);
        onAnnounce?.(readText);
      }
    }
  }, [isOpen, mode, stepIndex, readAloudIdx, currentStep, highlightTarget, speakText, onAnnounce, currentTour, currentSteps.length]);

  // Clean up on unmount or tab/page switch
  useEffect(() => {
    return () => {
      stopSpeech();
      clearTargetHighlight();
    };
  }, [activeTab, isLensOpen, stopSpeech, clearTargetHighlight]);

  // Reset steps when tab changes
  useEffect(() => {
    setStepIndex(0);
    setReadAloudIdx(0);
    stopSpeech();
    clearTargetHighlight();
  }, [activeTab, isLensOpen, stopSpeech, clearTargetHighlight]);

  // Keyboard navigation & trap prevention
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'ArrowRight' && (mode === 'tour' || mode === 'task')) {
        if (stepIndex < currentSteps.length - 1) {
          e.preventDefault();
          setStepIndex((i) => i + 1);
        }
      } else if (e.key === 'ArrowLeft' && (mode === 'tour' || mode === 'task')) {
        if (stepIndex > 0) {
          e.preventDefault();
          setStepIndex((i) => i - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, mode, stepIndex, currentSteps.length]);

  const handleOpen = () => {
    setIsOpen(true);
    setStepIndex(0);
    setReadAloudIdx(0);
    onAnnounce?.(`Opened interactive guide for ${currentTour.pageTitle}.`);
  };

  const handleClose = () => {
    stopSpeech();
    clearTargetHighlight();
    setIsOpen(false);
    onAnnounce?.('Closed guide.');
  };

  const handleNext = () => {
    if (mode === 'read') {
      if (readAloudIdx < currentTour.readAloudText.length - 1) {
        setReadAloudIdx((i) => i + 1);
      } else {
        handleClose();
      }
    } else {
      if (stepIndex < currentSteps.length - 1) {
        setStepIndex((i) => i + 1);
      } else {
        handleClose();
      }
    }
  };

  const handleBack = () => {
    if (mode === 'read') {
      if (readAloudIdx > 0) setReadAloudIdx((i) => i - 1);
    } else {
      if (stepIndex > 0) setStepIndex((i) => i - 1);
    }
  };

  const handleRepeat = () => {
    if (mode === 'read') {
      const readText = currentTour.readAloudText[readAloudIdx];
      if (readText) speakText(readText);
    } else if (currentStep) {
      speakText(currentStep.spokenText || currentStep.instruction);
    }
  };

  const handleTogglePause = () => {
    if (!speechSupported) return;
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsSpeaking(true);
      onAnnounce?.('Speech resumed.');
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsSpeaking(false);
      onAnnounce?.('Speech paused.');
    }
  };

  const handleToggleNarration = () => {
    if (isNarrationEnabled) {
      stopSpeech();
      setIsNarrationEnabled(false);
      onAnnounce?.('Voice narration muted. Visual guide instructions remain active.');
    } else {
      setIsNarrationEnabled(true);
      onAnnounce?.('Voice narration enabled.');
      if (currentStep) {
        speakText(currentStep.spokenText || currentStep.instruction);
      }
    }
  };

  return (
    <>
      {/* PERSISTENT "GUIDE ME" LAUNCHER (Available on every page & section) */}
      {!isOpen && (
        <button
          type="button"
          className="voice-guide-launcher"
          onClick={handleOpen}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-label={`Guide Me: Interactive verbal walkthrough for ${currentTour.pageTitle}`}
          title="Interactive Voice & Task Guide [G]"
        >
          <Compass size={18} aria-hidden="true" />
          <span className="guide-launcher-label">Guide Me</span>
        </button>
      )}

      {/* DOCKED ACCESSIBLE INTERACTIVE VOICE GUIDE CARD */}
      {isOpen && (
        <aside
          ref={guidePanelRef}
          role="dialog"
          aria-label={`Interactive Guide: ${currentTour.pageTitle}`}
          className="voice-guide-panel"
        >
          {/* HEADER: Title, Page Badge, Audio & Close Controls */}
          <div className="voice-guide-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
              <div className="guide-icon-badge" aria-hidden="true">
                <Compass size={16} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="guide-panel-title">
                  <span>Interactive Guide</span>
                  <span className="guide-page-pill">{currentTour.pageTitle}</span>
                </div>
                <div className="guide-panel-subtitle">
                  {mode === 'tour' && `Page Tour • Step ${stepIndex + 1} of ${currentSteps.length}`}
                  {mode === 'task' && `Task Guide • Step ${stepIndex + 1} of ${currentSteps.length}`}
                  {mode === 'read' && `Read Aloud • Section ${readAloudIdx + 1} of ${currentTour.readAloudText.length}`}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
              {/* Narration Toggle (Speech On/Off) */}
              <button
                type="button"
                className={`icon-btn-sm ${isNarrationEnabled ? 'active' : ''}`}
                onClick={handleToggleNarration}
                title={isNarrationEnabled ? 'Mute voice narration' : 'Enable voice narration'}
                aria-label={isNarrationEnabled ? 'Mute voice narration' : 'Enable voice narration'}
                aria-pressed={isNarrationEnabled}
              >
                {isNarrationEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
              </button>

              {/* Close Guide */}
              <button
                type="button"
                className="icon-btn-sm"
                onClick={handleClose}
                title="Exit Guide [Esc]"
                aria-label="Exit Guide"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* ENTRY MODE TABS */}
          <div className="voice-guide-modes" role="tablist" aria-label="Guide Modes">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'tour'}
              className={`guide-mode-tab ${mode === 'tour' ? 'active' : ''}`}
              onClick={() => {
                setMode('tour');
                setStepIndex(0);
              }}
            >
              <Compass size={13} aria-hidden="true" />
              <span>Guide Me Through Page</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'task'}
              className={`guide-mode-tab ${mode === 'task' ? 'active' : ''}`}
              onClick={() => {
                setMode('task');
                setStepIndex(0);
              }}
            >
              <CheckCircle2 size={13} aria-hidden="true" />
              <span>Help Complete a Task</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'read'}
              className={`guide-mode-tab ${mode === 'read' ? 'active' : ''}`}
              onClick={() => {
                setMode('read');
                setReadAloudIdx(0);
              }}
            >
              <BookOpen size={13} aria-hidden="true" />
              <span>Read Aloud</span>
            </button>
          </div>

          {/* MAIN STEP / INSTRUCTION BODY */}
          <div className="voice-guide-body">
            {mode === 'read' ? (
              <div className="guide-read-container">
                <p className="guide-instruction-text" tabIndex={0}>
                  {currentTour.readAloudText[readAloudIdx]}
                </p>
              </div>
            ) : (
              currentStep && (
                <div className="guide-step-container">
                  <h4 className="guide-step-title">{currentStep.title}</h4>
                  <p className="guide-instruction-text" tabIndex={0}>
                    {currentStep.instruction}
                  </p>
                  {currentStep.actionHint && (
                    <div className="guide-action-hint">
                      <Sparkles size={13} color="var(--accent-cyan)" />
                      <span>{currentStep.actionHint}</span>
                    </div>
                  )}
                </div>
              )
            )}

            {/* Contextual Quick Links */}
            <div style={{ marginTop: '0.65rem', display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {currentTourKey !== 'learn' && onNavigateTab && (
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                  onClick={() => onNavigateTab('learn')}
                >
                  Go to Learn
                </button>
              )}
              {currentTourKey !== 'practice' && onNavigateTab && (
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                  onClick={() => onNavigateTab('practice')}
                >
                  Go to Practice
                </button>
              )}
              {onOpenAccessibility && (
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                  onClick={onOpenAccessibility}
                >
                  Accessibility Themes
                </button>
              )}
            </div>

            {/* SPEECH SYNTHESIS STATUS INDICATOR */}
            <div className="guide-speech-status" aria-live="polite">
              {!speechSupported && (
                <span className="guide-status-notice">
                  Browser speech synthesis is unavailable on this device. Visual text instructions are fully active.
                </span>
              )}
              {speechSupported && !isNarrationEnabled && (
                <span className="guide-status-notice">Voice narration muted. Click speaker icon to unmute.</span>
              )}
              {speechSupported && isNarrationEnabled && isSpeaking && (
                <span className="guide-status-active">
                  <span className="guide-pulse-dot" /> Speaking...
                </span>
              )}
              {speechSupported && isNarrationEnabled && isPaused && (
                <span className="guide-status-paused">Paused</span>
              )}
            </div>
          </div>

          {/* ACTION & NAVIGATION CONTROLS */}
          <div className="voice-guide-footer">
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              {/* Back Control */}
              <button
                type="button"
                className="btn-secondary"
                disabled={mode === 'read' ? readAloudIdx === 0 : stepIndex === 0}
                onClick={handleBack}
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}
                aria-label="Previous step"
              >
                <ChevronLeft size={14} />
                <span>Back</span>
              </button>

              {/* Repeat Control */}
              <button
                type="button"
                className="btn-secondary"
                onClick={handleRepeat}
                title="Repeat spoken instruction"
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}
                aria-label="Repeat instruction"
              >
                <RotateCcw size={13} />
                <span>Repeat</span>
              </button>

              {/* Pause / Resume Control */}
              {speechSupported && isNarrationEnabled && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleTogglePause}
                  disabled={!isSpeaking && !isPaused}
                  style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}
                  aria-label={isPaused ? 'Resume narration' : 'Pause narration'}
                >
                  {isPaused ? <Play size={13} /> : <Pause size={13} />}
                  <span>{isPaused ? 'Resume' : 'Pause'}</span>
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              {/* Skip / Exit */}
              <button
                type="button"
                className="btn-secondary"
                onClick={handleClose}
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}
              >
                <span>Skip</span>
              </button>

              {/* Next / Finish */}
              <button
                type="button"
                className="btn-primary"
                onClick={handleNext}
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.8rem' }}
              >
                <span>
                  {mode === 'read'
                    ? readAloudIdx >= currentTour.readAloudText.length - 1
                      ? 'Finish'
                      : 'Next'
                    : stepIndex >= currentSteps.length - 1
                    ? 'Finish'
                    : 'Next'}
                </span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </aside>
      )}
    </>
  );
};

export default VoiceGuide;
