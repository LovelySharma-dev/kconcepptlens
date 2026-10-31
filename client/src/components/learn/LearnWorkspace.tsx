import React, { useState, useEffect } from 'react';
import type {
  GeneratedLesson,
  LearningPreferences,
  BiologyTopicId,
  PhysicsSimulationModel,
  LinkedListGraph,
  VisualModelMeta
} from '@conceptlens/shared';
import {
  GeneratedLessonSchema,
  resolveLearningExperience,
  AVAILABLE_VISUAL_MODELS,
  detectInteractiveVisualModel,
  getVisualModelFallbackExplanation
} from '@conceptlens/shared';
import { SpeechControls } from '../SpeechControls';
import { Cell2DCanvas } from '../biology/2d/Cell2DCanvas';
import { Heart2DCanvas } from '../biology/2d/Heart2DCanvas';
import { Dna2DCanvas } from '../biology/2d/Dna2DCanvas';
import { Neuron2DCanvas } from '../biology/2d/Neuron2DCanvas';
import { InteractivePhysicsStudio } from '../InteractivePhysicsStudio';
import { InteractiveCanvas } from '../InteractiveCanvas';
import { clientBiologyCatalog } from '../../data/biologyLessons';
import { ISLVideoPanel } from '../ISLVideoPanel';
import { CurriculumTranslationBar } from './CurriculumTranslationBar';
import type { SupportedLanguageCode } from '@conceptlens/shared';
import {
  BookOpen,
  Sparkles,
  Layers,
  ListOrdered,
  Award,
  FileText,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Compass,
  ExternalLink,
  Info,
  Search,
  RefreshCw,
  Lightbulb,
  AlertCircle,
  ArrowLeft,
  Captions
} from 'lucide-react';

// Subject Families
export type SubjectFamily = 'stem' | 'business' | 'arts_culture' | 'custom';

export type { VisualModelMeta };
export { AVAILABLE_VISUAL_MODELS };

const DEFAULT_OPTICS_MODEL: PhysicsSimulationModel = {
  domain: 'physics',
  type: 'ray_optics',
  title: 'Geometrical Optics: Convex Lens Ray Diagram',
  topic: 'Optics & Refraction of Light',
  description: 'Interactive ray tracing demonstrating real & virtual image formation through a biconvex lens with principal rays, object distance (u), and focal length (f).',
  originalImageUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=80',
  parameters: { focalLength: 100, objectDistance: 220, objectHeight: 60 },
  interactiveControls: [
    { id: 'objectDistance', label: 'Object Distance (u)', min: 40, max: 400, step: 5, unit: 'mm', defaultValue: 220 },
    { id: 'focalLength', label: 'Focal Length (f)', min: 60, max: 180, step: 5, unit: 'mm', defaultValue: 100 },
    { id: 'objectHeight', label: 'Object Height (ho)', min: 20, max: 90, step: 2, unit: 'mm', defaultValue: 60 }
  ],
  formulas: [{ label: 'Gaussian Thin Lens Formula', formula: '1/f = 1/v - 1/u', explanation: 'Relates focal length (f) to object distance (u) and image distance (v).' }]
};

const DEFAULT_PENDULUM_MODEL: PhysicsSimulationModel = {
  domain: 'physics',
  type: 'pendulum',
  title: 'Simple Harmonic Pendulum Physics Studio',
  topic: 'Oscillations & Periodic Motion',
  description: 'Interactive harmonic pendulum simulation displaying restoring force vectors, energy conservation, and oscillation period.',
  originalImageUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=80',
  parameters: { length: 2.0, gravity: 9.8, initialAngle: 30, mass: 1.0 },
  interactiveControls: [
    { id: 'length', label: 'String Length (L)', min: 0.5, max: 4.0, step: 0.1, unit: 'm', defaultValue: 2.0 },
    { id: 'gravity', label: 'Gravitational Accel (g)', min: 1.6, max: 25.0, step: 0.2, unit: 'm/s²', defaultValue: 9.8 },
    { id: 'initialAngle', label: 'Initial Amplitude (θ)', min: 5, max: 60, step: 1, unit: '°', defaultValue: 30 },
    { id: 'mass', label: 'Bob Mass (m)', min: 0.2, max: 5.0, step: 0.1, unit: 'kg', defaultValue: 1.0 }
  ],
  formulas: [{ label: 'Small-Angle Period Formula', formula: 'T = 2π√(L/g)', explanation: 'Period of oscillation depends only on length and local gravitational acceleration.' }]
};

const DEFAULT_LINKED_LIST_GRAPH: LinkedListGraph = {
  nodes: [
    { id: 'node_1', value: 10, next: 'node_2', address: '0x1A00', x: 50, y: 100, confidence: 1.0 },
    { id: 'node_2', value: 20, next: 'node_3', address: '0x1A20', x: 200, y: 100, confidence: 1.0 },
    { id: 'node_3', value: 30, next: null, address: '0x1A40', x: 350, y: 100, confidence: 1.0 }
  ],
  headId: 'node_1',
  tailId: 'node_3',
  isCircular: false,
  structureType: 'singly'
};

interface SubjectOption {
  id: string;
  name: string;
  family: SubjectFamily;
  suggestedPrompt: string;
}

const SUBJECT_OPTIONS: SubjectOption[] = [
  // STEM
  { id: 'math', name: 'Mathematics', family: 'stem', suggestedPrompt: 'Explain how compound interest formula is derived and applied' },
  { id: 'physics', name: 'Physics', family: 'stem', suggestedPrompt: 'Explain geometrical convex lens ray optics and focal length' },
  { id: 'chemistry', name: 'Chemistry', family: 'stem', suggestedPrompt: 'Explain acid-base titration curves and equivalence points' },
  { id: 'biology', name: 'Biology', family: 'stem', suggestedPrompt: 'Explain photosynthesis and the light-independent Calvin cycle' },
  { id: 'cs', name: 'Computer Science', family: 'stem', suggestedPrompt: 'Teach me recursion in Python with base cases and call stack' },
  { id: 'engineering', name: 'Engineering', family: 'stem', suggestedPrompt: 'Explain structural shear stress and bending moments in beams' },
  { id: 'ai', name: 'Data Science & AI', family: 'stem', suggestedPrompt: 'Teach me how neural networks learn via backpropagation' },

  // Business
  { id: 'biz_fund', name: 'Business Fundamentals', family: 'business', suggestedPrompt: 'Explain the difference between revenue, gross margin, and net profit' },
  { id: 'economics', name: 'Economics', family: 'business', suggestedPrompt: 'Explain supply and demand market equilibrium and price elasticity' },
  { id: 'finance', name: 'Finance', family: 'business', suggestedPrompt: 'Explain a corporate balance sheet, assets, and shareholder equity' },
  { id: 'marketing', name: 'Marketing', family: 'business', suggestedPrompt: 'Explain customer acquisition cost (CAC) vs lifetime value (LTV)' },
  { id: 'entrepreneurship', name: 'Entrepreneurship', family: 'business', suggestedPrompt: 'Explain lean startup methodology and the build-measure-learn loop' },
  { id: 'management', name: 'Management', family: 'business', suggestedPrompt: 'Explain agile sprint planning and scrum team velocity' },
  { id: 'pm', name: 'Product Management', family: 'business', suggestedPrompt: 'Explain product-market fit metrics and user journey mapping' },

  // Arts & Culture
  { id: 'visual_arts', name: 'Visual Arts', family: 'arts_culture', suggestedPrompt: 'Explain linear perspective and chiaroscuro in Renaissance painting' },
  { id: 'music', name: 'Music', family: 'arts_culture', suggestedPrompt: 'Explain musical time signatures, syncopation, and chord progressions' },
  { id: 'literature', name: 'Literature', family: 'arts_culture', suggestedPrompt: 'Help me understand poetic meter, iambic pentameter, and sonnet structure' },
  { id: 'history', name: 'History', family: 'arts_culture', suggestedPrompt: 'Explain the cultural and economic causes of the European Renaissance' },
  { id: 'philosophy', name: 'Philosophy', family: 'arts_culture', suggestedPrompt: 'Explain Socrates and the dialectical method of philosophical inquiry' },
  { id: 'languages', name: 'Languages', family: 'arts_culture', suggestedPrompt: 'Explain grammatical case systems in Indo-European languages' },
  { id: 'architecture', name: 'Architecture & Design', family: 'arts_culture', suggestedPrompt: 'Explain Gothic flying buttresses and ribbed groin vault distribution' },
  { id: 'cultural_studies', name: 'Cultural Studies', family: 'arts_culture', suggestedPrompt: 'Explain cultural diffusion and oral storytelling traditions' }
];

export type LearningContext = 'beginner' | 'intermediate' | 'advanced' | 'exam' | 'practical' | 'curiosity';

export type RepresentationMode =
  | 'read'
  | 'simplified'
  | 'steps'
  | 'visual'
  | 'listen'
  | 'flashcards'
  | 'practice'
  | 'notes'
  | 'isl';

interface LearnWorkspaceProps {
  preferences: LearningPreferences;
  onPreferences: (next: LearningPreferences) => void;
  onAnnounce: (msg: string) => void;
  onLaunchInteractiveBiology?: (topicId: BiologyTopicId) => void;
  onLaunchInteractiveSTEM?: (domain: 'universal' | 'physics' | 'data_structure') => void;
  onNavigateISL?: () => void;
}


const DEFAULT_CURATED_LESSON: GeneratedLesson = {
  topic: 'Geometrical Optics: Convex Lens Ray Tracing',
  summary: 'Interactive ray tracing study module demonstrating real and virtual image formation through a biconvex lens with principal rays, object distance, and focal length.',
  explanations: {
    standard:
      'Geometrical optics models light propagation using straight-line rays through refracting media. For a thin spherical convex lens of focal length f, incident paraxial rays converge at the real principal focus. The fundamental Gaussian conjugate equation states 1/f = 1/v - 1/u (using Cartesian sign conventions), determining image location v relative to object position u.',
    easyRead:
      'A convex lens is a curved piece of glass that is thicker in the middle than at the edges. When straight light rays pass through it, the glass bends the rays inward so they cross at one single sharp point called the focal point. Magnifying glasses and eye lenses work this way.',
    stepByStep: [
      {
        stepNumber: 1,
        title: 'Identify Parameters',
        explanation: 'Identify the object distance u and focal length f on the principal optical axis with standard Cartesian sign convention.'
      },
      {
        stepNumber: 2,
        title: 'Trace Parallel Ray',
        explanation: 'Draw Ray 1 parallel to the principal axis from object tip to lens; it refracts through the principal focal point F2.'
      },
      {
        stepNumber: 3,
        title: 'Trace Central Ray',
        explanation: 'Draw Ray 2 passing straight through the optical center O without angular deviation.'
      },
      {
        stepNumber: 4,
        title: 'Locate Image & Magnification',
        explanation: 'Locate the image at the intersection of the refracted rays; calculate linear magnification m = v / u.'
      }
    ]
  },
  flashcards: [
    {
      id: 'optics_fc1',
      front: 'What is the Gaussian thin-lens formula?',
      back: '1/f = 1/v - 1/u, connecting focal length (f), image distance (v), and object distance (u).'
    },
    {
      id: 'optics_fc2',
      front: 'When does a convex lens form a real image?',
      back: 'When the object is placed outside the focal point (u > f). The refracted rays physically converge.'
    },
    {
      id: 'optics_fc3',
      front: 'What does optical magnification m indicate?',
      back: 'm = height of image / height of object = v / u. Negative m indicates an inverted real image.'
    }
  ],
  practiceQuestions: [
    {
      id: 'optics_q1',
      prompt: 'An object is placed 30 cm in front of a convex lens with a focal length of 10 cm. Where is the real image formed?',
      options: [
        '15 cm behind the lens',
        '10 cm in front of the lens',
        '20 cm behind the lens',
        '30 cm behind the lens'
      ],
      correctOptionIndex: 0,
      explanation: 'Using 1/f = 1/v - 1/u with standard Cartesian coordinates (f = +10, u = -30): 1/v = 1/10 - 1/30 = 2/30 = 1/15, yielding v = +15 cm behind the lens.',
      sourceReference: 'ISC & CBSE Physics Class 12 Ray Optics'
    }
  ],
  studyNotes: [
    'Convex lenses converge parallel incident light rays to a real focus.',
    'Focal length f is positive for convex lenses and negative for concave lenses in Cartesian convention.',
    'Real images can be projected onto a screen; virtual images can only be viewed through the lens.'
  ],
  keyTerms: [
    { term: 'Principal Focus (F)', definition: 'The point where incident rays parallel to the principal axis converge after refraction.' },
    { term: 'Focal Length (f)', definition: 'The distance between the optical center of the lens and its principal focus.' },
    { term: 'Optical Center (O)', definition: 'The central point of the lens through which rays pass undeflected.' }
  ],
  uncertaintyNotes: [],
  generationMetadata: {
    generationMethod: 'deterministic',
    model: 'deterministic-physics-engine',
    fallbackUsed: false,
    timestamp: new Date().toISOString()
  }
};
const STORAGE_KEY = 'conceptlens-learn-continuity';

export const LearnWorkspace: React.FC<LearnWorkspaceProps> = ({
  preferences,
  onPreferences,
  onAnnounce,
  onLaunchInteractiveBiology,
  onLaunchInteractiveSTEM,
  onNavigateISL
}) => {
  // Discovery & Query States
  const [selectedFamily, setSelectedFamily] = useState<SubjectFamily>('stem');
  const [topicInput, setTopicInput] = useState('');
  const [learningContext, setLearningContext] = useState<LearningContext>('curiosity');

  // Curriculum Translation State
  const [translatedStandardText, setTranslatedStandardText] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguageCode>('en');
  const [isRtl, setIsRtl] = useState(false);

  // Active Lesson & Generation State
  const [lesson, setLesson] = useState<GeneratedLesson>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.lesson) return parsed.lesson;
      }
    } catch {
      /* ignore */
    }
    return DEFAULT_CURATED_LESSON;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Representation & Continuity States
  const [representation, setRepresentation] = useState<RepresentationMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.representation) return parsed.representation;
      }
    } catch {
      /* ignore */
    }
    if (preferences.easyRead) return 'simplified';
    if (preferences.simpleSteps) return 'steps';
    return 'read';
  });

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.currentStepIndex === 'number') return parsed.currentStepIndex;
      }
    } catch {
      /* ignore */
    }
    return 0;
  });

  const [completedSteps, setCompletedSteps] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.completedSteps)) return parsed.completedSteps;
      }
    } catch {
      /* ignore */
    }
    return [];
  });

  const [quizAnswers, setQuizAnswers] = useState<Record<string, { selectedIndex: number; submitted: boolean; isCorrect: boolean }>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.quizAnswers && typeof parsed.quizAnswers === 'object') return parsed.quizAnswers;
      }
    } catch {
      /* ignore */
    }
    return {};
  });

  const [flashcardIdx, setFlashcardIdx] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.flashcardIdx === 'number') return parsed.flashcardIdx;
      }
    } catch {
      /* ignore */
    }
    return 0;
  });
  const [isFlipped, setIsFlipped] = useState(false);

  // Visual Model Interactive States
  const [activeVisualModelId, setActiveVisualModelId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.activeVisualModelId) return parsed.activeVisualModelId;
      }
    } catch {
      /* ignore */
    }
    return 'physics_optics';
  });
  const [selectedOrganelleId, setSelectedOrganelleId] = useState<string | null>('mitochondria');
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [linkedListOp, setLinkedListOp] = useState<string>('insertHead');

  // Experience Flags
  const exp = resolveLearningExperience(preferences);

  // Reset translation when active lesson changes
  useEffect(() => {
    setTranslatedStandardText(null);
    setCurrentLanguage('en');
    setIsRtl(false);
  }, [lesson?.topic]);

  // Save continuity state to localStorage
  useEffect(() => {
    if (!lesson) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          lesson,
          currentStepIndex,
          completedSteps,
          quizAnswers,
          flashcardIdx,
          representation,
          activeVisualModelId
        })
      );
    } catch {
      /* ignore */
    }
  }, [lesson, currentStepIndex, completedSteps, quizAnswers, flashcardIdx, representation, activeVisualModelId]);

  // Adjust representation automatically when certain preferences toggle
  useEffect(() => {
    if (preferences.simpleSteps && representation === 'read') {
      setRepresentation('steps');
    } else if (preferences.easyRead && representation === 'read') {
      setRepresentation('simplified');
    }
  }, [preferences.simpleSteps, preferences.easyRead, representation]);

  // Generate Lesson via Backend API
  const handleGenerateLesson = async (promptOverride?: string) => {
    const query = (promptOverride || topicInput).trim();
    if (!query) return;

    setLoading(true);
    setError(null);
    onAnnounce(`Generating structured learning experience for "${query}"...`);

    const difficultyMap: Record<LearningContext, 'beginner' | 'intermediate' | 'advanced'> = {
      beginner: 'beginner',
      curiosity: 'beginner',
      intermediate: 'intermediate',
      practical: 'intermediate',
      advanced: 'advanced',
      exam: 'advanced'
    };

    try {
      const res = await fetch('/api/ai/lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: query.length >= 10 ? query : `${query} — provide a complete educational explanation with steps, terms, and quiz.`,
          topic: query.slice(0, 150),
          difficulty: difficultyMap[learningContext]
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success || !json.data) {
        throw new Error(json.error || 'Failed to generate lesson.');
      }

      const validated = GeneratedLessonSchema.parse(json.data);
      setLesson(validated);
      setCurrentStepIndex(0);
      setCompletedSteps([]);
      setQuizAnswers({});
      setFlashcardIdx(0);
      setIsFlipped(false);

      if (preferences.simpleSteps) {
        setRepresentation('steps');
      } else if (preferences.easyRead) {
        setRepresentation('simplified');
      } else {
        setRepresentation('read');
      }

      const providerBadge =
        validated.generationMetadata.generationMethod === 'gemini'
          ? 'Google Gemini Free Tier'
          : validated.generationMetadata.generationMethod === 'huggingface'
          ? 'Hugging Face'
          : 'Deterministic Rule Engine';

      onAnnounce(`Lesson generated successfully for ${validated.topic} via ${providerBadge}.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lesson generation error';
      setError(msg);
      onAnnounce(`Error generating lesson: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  // Keyboard navigation for flashcards
  const handleFlashcardKeyDown = (e: React.KeyboardEvent) => {
    if (representation !== 'flashcards' || !lesson?.flashcards.length) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      setIsFlipped((f) => !f);
      onAnnounce(isFlipped ? 'Card front' : `Card back: ${lesson.flashcards[flashcardIdx]?.back || ''}`);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (flashcardIdx < lesson.flashcards.length - 1) {
        setFlashcardIdx((i) => i + 1);
        setIsFlipped(false);
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (flashcardIdx > 0) {
        setFlashcardIdx((i) => i - 1);
        setIsFlipped(false);
      }
    }
  };

  // Check if topic maps to an existing interactive visualization model
  const matchedVisualizer = lesson ? detectInteractiveVisualModel(lesson.topic) : null;

  // Active visual model metadata and component lookup
  const activeModelDef = AVAILABLE_VISUAL_MODELS.find((m) => m.id === activeVisualModelId) || AVAILABLE_VISUAL_MODELS[0];
  const activeBioLesson = activeModelDef?.domain === 'biology' && clientBiologyCatalog[activeVisualModelId as BiologyTopicId]
    ? clientBiologyCatalog[activeVisualModelId as BiologyTopicId]
    : clientBiologyCatalog.human_cell;
  const activeComponent = activeBioLesson?.components.find((c) => c.id === selectedOrganelleId);

  // Geometric markers for Color-Blind Friendly Quiz
  const OPTION_MARKERS = [
    { symbol: '⭕', label: 'Circle' },
    { symbol: '🟩', label: 'Square' },
    { symbol: '🔺', label: 'Triangle' },
    { symbol: '🔷', label: 'Diamond' }
  ];

  return (
    <div className="learn-workspace-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. TOPIC ENTRY & CONCEPT DISCOVERY CARD */}
      <section className="glass-panel" aria-labelledby="learn-heading" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
          <div>
            <h2 id="learn-heading" style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Compass size={24} color="var(--accent-cyan)" aria-hidden="true" />
              <span>Explore Any Concept</span>
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
              Choose a subject family or enter any topic in natural language.
            </p>
          </div>

          {/* Quick Context Pill Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Depth:</span>
            {(['curiosity', 'beginner', 'intermediate', 'advanced', 'exam', 'practical'] as LearningContext[]).map((ctx) => (
              <button
                key={ctx}
                type="button"
                className={`tag-btn ${learningContext === ctx ? 'active' : ''}`}
                onClick={() => setLearningContext(ctx)}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', textTransform: 'capitalize' }}
                aria-pressed={learningContext === ctx}
              >
                {ctx}
              </button>
            ))}
          </div>
        </div>

        {/* Natural Language Topic Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleGenerateLesson();
          }}
          style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}
        >
          <div style={{ flex: '1 1 300px', position: 'relative' }}>
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="e.g. Explain photosynthesis, Teach me recursion in Python, Help me understand compound interest..."
              aria-label="Enter concept or topic to learn"
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.5rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontSize: '0.95rem'
              }}
            />
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} aria-hidden="true" />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !topicInput.trim()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', minWidth: '150px', justifyContent: 'center' }}
          >
            {loading ? (
              <>
                <RefreshCw size={16} className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} aria-hidden="true" />
                <span>Explain Concept</span>
              </>
            )}
          </button>
        </form>

        {/* Subject Discovery Family Tabs */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', alignSelf: 'center', marginRight: '0.25rem' }}>Subject:</span>
            {[
              { id: 'stem', label: 'STEM & Science' },
              { id: 'business', label: 'Business & Economics' },
              { id: 'arts_culture', label: 'Arts & Culture' },
              { id: 'custom', label: 'Open-ended Topic' }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                className={`btn-secondary ${selectedFamily === f.id ? 'active' : ''}`}
                onClick={() => setSelectedFamily(f.id as SubjectFamily)}
                style={{
                  fontSize: '0.78rem',
                  padding: '0.35rem 0.75rem',
                  borderColor: selectedFamily === f.id ? 'var(--accent-cyan)' : undefined,
                  background: selectedFamily === f.id ? 'rgba(56, 189, 248, 0.12)' : undefined
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Quick Concept Suggestion Pills */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {SUBJECT_OPTIONS.filter((s) => selectedFamily === 'custom' || s.family === selectedFamily).map((subj) => (
              <button
                key={subj.id}
                type="button"
                className="tag-btn"
                onClick={() => {
                  setTopicInput(subj.suggestedPrompt);
                  handleGenerateLesson(subj.suggestedPrompt);
                }}
                title={subj.suggestedPrompt}
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
              >
                {subj.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ERROR BANNER */}
      {error && (
        <div className="glass-panel" style={{ padding: '1rem 1.25rem', borderColor: 'var(--accent-coral)', display: 'flex', alignItems: 'center', gap: '0.75rem' }} role="alert">
          <AlertCircle size={20} color="var(--accent-coral)" />
          <div style={{ flex: 1 }}>
            <strong style={{ fontSize: '0.9rem', color: 'var(--accent-coral)' }}>Lesson Generation Error</strong>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{error}</p>
          </div>
          <button type="button" className="btn-secondary" onClick={() => handleGenerateLesson()} style={{ fontSize: '0.8rem' }}>
            Retry
          </button>
        </div>
      )}

      {/* 2. ACTIVE LESSON WORKSPACE */}
      {lesson && (
        <article className="glass-panel" style={{ padding: '1.5rem' }} aria-labelledby="active-lesson-title">
          {/* Header with Title and AI/Engine Badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <h3 id="active-lesson-title" style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800 }}>
                  {lesson.topic}
                </h3>
                <span
                  className="status-pill"
                  style={{
                    fontSize: '0.75rem',
                    background: lesson.generationMetadata.generationMethod === 'gemini' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    color: lesson.generationMetadata.generationMethod === 'gemini' ? 'var(--accent-cyan)' : 'var(--accent-emerald)',
                    padding: '0.2rem 0.55rem',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 600
                  }}
                >
                  {lesson.generationMetadata.generationMethod === 'gemini'
                    ? 'Google Gemini Flash (Free Tier)'
                    : lesson.generationMetadata.generationMethod === 'huggingface'
                    ? 'Hugging Face'
                    : 'Deterministic Rule Engine'}
                </span>
                {lesson.generationMetadata.fallbackUsed && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent-amber)', background: 'rgba(245, 158, 11, 0.1)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>
                    Zero-API Fallback Applied
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.35rem', maxWidth: '750px' }}>
                {lesson.summary}
              </p>
            </div>

            {/* Read Aloud Accessible TTS button */}
            {!preferences.speechFree && (
              <SpeechControls
                text={`${lesson.topic}. ${lesson.summary}. ${lesson.explanations.standard}`}
                rate={preferences.speechRate}
                label={`Listen to ${lesson.topic}`}
                onRateChange={(rate) => onPreferences({ ...preferences, speechRate: rate })}
              />
            )}
          </div>

          {/* GUIDED LEARNING PROGRESSION BAR (When Guided Learning mode active) */}
          {(preferences.guidedLearning || exp.guidedStages) && (
            <div
              className="guided-stages-bar"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'var(--bg-surface)',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem',
                border: '1px solid var(--border-subtle)',
                overflowX: 'auto'
              }}
              role="navigation"
              aria-label="Guided Learning Stages"
            >
              {[
                { stage: 'read', label: '1. Learn', desc: 'Read Concept' },
                { stage: 'steps', label: '2. Explore', desc: 'Step Progression' },
                { stage: 'practice', label: '3. Try', desc: 'Knowledge Check' },
                { stage: 'notes', label: '4. Review', desc: 'Key Terms & Notes' }
              ].map((s) => (
                <button
                  key={s.stage}
                  type="button"
                  className={`btn-secondary ${representation === s.stage ? 'active' : ''}`}
                  onClick={() => setRepresentation(s.stage as RepresentationMode)}
                  style={{
                    fontSize: '0.78rem',
                    padding: '0.3rem 0.65rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    borderColor: representation === s.stage ? 'var(--accent-cyan)' : undefined,
                    background: representation === s.stage ? 'rgba(56, 189, 248, 0.15)' : undefined
                  }}
                >
                  <span style={{ fontWeight: 700 }}>{s.label}</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{s.desc}</span>
                </button>
              ))}
            </div>
          )}

          {/* REPRESENTATION MODE TABS (Preserves All Progress) */}
          <div
            className="representation-tabs"
            style={{
              display: 'flex',
              gap: '0.35rem',
              flexWrap: 'wrap',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '0.75rem',
              marginBottom: '1.25rem'
            }}
            role="tablist"
            aria-label="Learning Representations"
          >
            <button
              type="button"
              role="tab"
              aria-selected={representation === 'read'}
              className={`tab-btn ${representation === 'read' ? 'active' : ''}`}
              onClick={() => {
                setRepresentation('read');
                onAnnounce('Standard comprehensive reading representation.');
              }}
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.75rem' }}
            >
              <BookOpen size={15} />
              <span>Read (Standard)</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={representation === 'simplified'}
              className={`tab-btn ${representation === 'simplified' ? 'active' : ''}`}
              onClick={() => {
                setRepresentation('simplified');
                onAnnounce('Plain-language simplified representation.');
              }}
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.75rem' }}
            >
              <Lightbulb size={15} />
              <span>Simplified (Easy Read)</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={representation === 'steps'}
              className={`tab-btn ${representation === 'steps' ? 'active' : ''}`}
              onClick={() => {
                setRepresentation('steps');
                onAnnounce('Step-by-step ordered representation.');
              }}
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.75rem' }}
            >
              <ListOrdered size={15} />
              <span>Step-by-Step ({lesson.explanations.stepByStep.length})</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={representation === 'visual'}
              className={`tab-btn ${representation === 'visual' ? 'active' : ''}`}
              onClick={() => {
                setRepresentation('visual');
                onAnnounce('Interactive visualizer and spatial model tab.');
              }}
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.75rem' }}
            >
              <Layers size={15} />
              <span>Visual Model {matchedVisualizer ? '✓' : ''}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={representation === 'flashcards'}
              className={`tab-btn ${representation === 'flashcards' ? 'active' : ''}`}
              onClick={() => {
                setRepresentation('flashcards');
                onAnnounce('Interactive flashcards.');
              }}
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.75rem' }}
            >
              <Sparkles size={15} />
              <span>Flashcards ({lesson.flashcards.length})</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={representation === 'practice'}
              className={`tab-btn ${representation === 'practice' ? 'active' : ''}`}
              onClick={() => {
                setRepresentation('practice');
                onAnnounce('Practice quiz questions.');
              }}
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.75rem' }}
            >
              <Award size={15} />
              <span>Practice Quiz ({lesson.practiceQuestions.length})</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={representation === 'notes'}
              className={`tab-btn ${representation === 'notes' ? 'active' : ''}`}
              onClick={() => {
                setRepresentation('notes');
                onAnnounce('Key terms glossary and study notes.');
              }}
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.75rem' }}
            >
              <FileText size={15} />
              <span>Terms & Notes</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={representation === 'isl'}
              className={`tab-btn ${representation === 'isl' ? 'active' : ''}`}
              onClick={() => {
                setRepresentation('isl');
                onAnnounce('Indian Sign Language. A signed explanation appears only when a verified resource exists for this lesson.');
              }}
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.75rem' }}
            >
              <Captions size={15} />
              <span>Learn with ISL</span>
            </button>
          </div>

          {/* TAB: INDIAN SIGN LANGUAGE VIDEO */}
          {representation === 'isl' && (
            <div className="representation-content isl-view" tabIndex={0} aria-label="Indian Sign Language Video">
              <ISLVideoPanel lessonIdOrTopic={lesson.topic} onAnnounce={onAnnounce} />

              <div
                style={{
                  marginTop: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  background: 'rgba(56, 189, 248, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}
              >
                <div>
                  <strong style={{ fontSize: '0.85rem', color: '#f8fafc' }}>
                    Authentic ISL Curriculum Catalog
                  </strong>
                  <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    The curriculum catalog has six entries. Most open the ISLRTC directory. Two do not have a video yet.
                  </p>
                </div>
                {onNavigateISL && (
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={onNavigateISL}
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', whiteSpace: 'nowrap' }}
                  >
                    Open ISL Catalog →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 1: READ (STANDARD) */}
          {representation === 'read' && (
            <div className="representation-content" tabIndex={0} aria-label="Standard Explanation">
              <CurriculumTranslationBar
                originalText={lesson.explanations.standard}
                currentLanguage={currentLanguage}
                onLanguageChange={setCurrentLanguage}
                onTranslatedChange={(translated, lang, rtl) => {
                  setTranslatedStandardText(lang === 'en' ? null : translated);
                  setIsRtl(rtl);
                }}
                onAnnounce={onAnnounce}
              />

              <div
                style={{
                  lineHeight: preferences.lineSpacing === 'relaxed' ? 1.95 : 1.7,
                  fontSize: '0.98rem',
                  textAlign: isRtl ? 'right' : 'left'
                }}
                dir={isRtl ? 'rtl' : 'ltr'}
              >
                {(translatedStandardText || lesson.explanations.standard).split('\n\n').map((para, i) => (
                  <p key={i} style={{ marginBottom: '1rem' }}>{para}</p>
                ))}
              </div>

              {/* Uncertainty / Misconceptions Notes */}
              {lesson.uncertaintyNotes.length > 0 && (
                <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-surface)', borderLeft: '3px solid var(--accent-amber)', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0' }}>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Info size={15} />
                    <span>Grounding & Scope Notes:</span>
                  </strong>
                  <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {lesson.uncertaintyNotes.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SIMPLIFIED (EASY READ) */}
          {representation === 'simplified' && (
            <div className="representation-content easy-read-view" tabIndex={0} aria-label="Simplified Plain-Language Explanation">
              <div style={{ padding: '1rem', background: 'rgba(56, 189, 248, 0.08)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>Plain-Language Summary:</strong>
                <p style={{ margin: '0.35rem 0 0', fontSize: '1rem', lineHeight: 1.8 }}>
                  {lesson.explanations.easyRead}
                </p>
              </div>

              {/* Key definitions in plain language */}
              {lesson.keyTerms.length > 0 && (
                <div style={{ marginTop: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>Important Words in this Concept:</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                    {lesson.keyTerms.map((kt, i) => (
                      <div key={i} style={{ padding: '0.75rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                        <strong style={{ color: 'var(--accent-cyan)', fontSize: '0.9rem' }}>{kt.term}</strong>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{kt.definition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: STEP-BY-STEP (SIMPLE STEPS) */}
          {representation === 'steps' && (
            <div className="representation-content steps-view">
              {lesson.explanations.stepByStep.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No sequential steps generated for this concept.</p>
              ) : (
                <div>
                  {/* Step Progress Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="status-pill" style={{ background: 'var(--action-primary-bg)', color: 'var(--action-primary-text)', fontWeight: 700, fontSize: '0.85rem' }}>
                        Step {currentStepIndex + 1} of {lesson.explanations.stepByStep.length}
                      </span>
                      <strong style={{ fontSize: '1.1rem' }}>
                        {lesson.explanations.stepByStep[currentStepIndex]?.title}
                      </strong>
                    </div>

                    {/* Step Controls */}
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        type="button"
                        className="btn-secondary"
                        disabled={currentStepIndex === 0}
                        onClick={() => {
                          const prev = Math.max(0, currentStepIndex - 1);
                          setCurrentStepIndex(prev);
                          onAnnounce(`Step ${prev + 1}: ${lesson.explanations.stepByStep[prev]?.title}`);
                        }}
                        style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
                      >
                        <ChevronLeft size={16} /> Previous
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => {
                          onAnnounce(`Repeating step ${currentStepIndex + 1}: ${lesson.explanations.stepByStep[currentStepIndex]?.title}`);
                        }}
                        style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
                      >
                        <RotateCcw size={14} /> Repeat
                      </button>
                      <button
                        type="button"
                        className="btn-primary"
                        disabled={currentStepIndex >= lesson.explanations.stepByStep.length - 1}
                        onClick={() => {
                          const next = Math.min(lesson.explanations.stepByStep.length - 1, currentStepIndex + 1);
                          setCurrentStepIndex(next);
                          setCompletedSteps((c) => [...new Set([...c, currentStepIndex])]);
                          onAnnounce(`Step ${next + 1}: ${lesson.explanations.stepByStep[next]?.title}`);
                        }}
                        style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
                      >
                        Next <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Current Step Card */}
                  <div
                    style={{
                      padding: '1.5rem',
                      background: 'var(--bg-surface)',
                      border: '2px solid var(--accent-cyan)',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '1rem'
                    }}
                  >
                    <p style={{ fontSize: '1.05rem', lineHeight: 1.8, margin: 0 }}>
                      {lesson.explanations.stepByStep[currentStepIndex]?.explanation}
                    </p>
                  </div>

                  {/* Step Sequence Pills for Quick Jump */}
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {lesson.explanations.stepByStep.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`tag-btn ${currentStepIndex === idx ? 'active' : ''}`}
                        onClick={() => {
                          setCurrentStepIndex(idx);
                          onAnnounce(`Jumped to step ${idx + 1}`);
                        }}
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.6rem',
                          background: completedSteps.includes(idx) ? 'rgba(16, 185, 129, 0.15)' : undefined
                        }}
                      >
                        {idx + 1}. {s.title.slice(0, 20)}...
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: VISUAL DIAGRAM / INTERACTIVE MODEL */}
          {representation === 'visual' && (
            <div className="representation-content visual-model-view" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Visual Model Control & Navigation Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setRepresentation('read');
                      onAnnounce('Returned to lesson reading representation.');
                    }}
                    style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    title="Return to standard lesson reading text"
                  >
                    <ArrowLeft size={15} />
                    <span>Back to Lesson</span>
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Layers size={18} color="var(--accent-cyan)" />
                    <strong style={{ fontSize: '1rem' }}>
                      {activeModelDef?.title || 'Interactive Model'}
                    </strong>
                    {matchedVisualizer?.id === activeVisualModelId ? (
                      <span className="status-pill" style={{ fontSize: '0.7rem', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)' }}>
                        ✓ Matched to Topic
                      </span>
                    ) : (
                      <span className="status-pill" style={{ fontSize: '0.7rem', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-cyan)', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)' }}>
                        Visual Explorer
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {activeModelDef?.domain === 'biology' && (
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setShowLabels((l) => !l)}
                      style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
                    >
                      {showLabels ? 'Hide Labels' : 'Show Labels'}
                    </button>
                  )}

                  {/* Launch Dedicated Explore Mode */}
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => {
                      if (activeModelDef?.domain === 'biology' && onLaunchInteractiveBiology) {
                        onLaunchInteractiveBiology(activeVisualModelId as BiologyTopicId);
                      } else if (activeModelDef?.domain === 'physics' && onLaunchInteractiveSTEM) {
                        onLaunchInteractiveSTEM('physics');
                      } else if (activeModelDef?.domain === 'data_structure' && onLaunchInteractiveSTEM) {
                        onLaunchInteractiveSTEM('data_structure');
                      }
                    }}
                    style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                    title="Open in dedicated full-screen exploration studio"
                  >
                    <span>Full Studio View</span>
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>

              {/* Informative Note when concept has no physical diagram */}
              {!matchedVisualizer && (
                <div style={{ padding: '0.75rem 1rem', background: 'rgba(56, 189, 248, 0.08)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <Info size={16} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Topic Notice:</strong> {getVisualModelFallbackExplanation(lesson.topic)}
                  </div>
                </div>
              )}

              {/* 8 Model Selection Pills */}
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Available Models:</span>
                {AVAILABLE_VISUAL_MODELS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className={`tag-btn ${activeVisualModelId === m.id ? 'active' : ''}`}
                    onClick={() => {
                      setActiveVisualModelId(m.id);
                      setSelectedOrganelleId(null);
                      onAnnounce(`Switched visual model to ${m.title}`);
                    }}
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.6rem',
                      borderColor: activeVisualModelId === m.id ? 'var(--accent-cyan)' : undefined,
                      background: activeVisualModelId === m.id ? 'rgba(56, 189, 248, 0.15)' : undefined
                    }}
                  >
                    {m.shortLabel} {matchedVisualizer?.id === m.id ? '★' : ''}
                  </button>
                ))}
              </div>

              {/* MODEL VIEWPORT */}
              <div style={{ background: '#070b14', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-medium)', overflow: 'hidden', minHeight: '440px', position: 'relative' }}>
                {activeVisualModelId === 'human_cell' && (
                  <Cell2DCanvas
                    selectedComponentId={selectedOrganelleId}
                    onSelectComponent={(id) => {
                      setSelectedOrganelleId(id);
                      onAnnounce(`Selected organelle: ${id}`);
                    }}
                    showLabels={showLabels}
                    onToggleLabels={() => setShowLabels((v) => !v)}
                    onAnnounce={onAnnounce}
                  />
                )}

                {activeVisualModelId === 'human_heart' && (
                  <Heart2DCanvas
                    selectedComponentId={selectedOrganelleId}
                    onSelectComponent={(id) => {
                      setSelectedOrganelleId(id);
                      onAnnounce(`Selected cardiac structure: ${id}`);
                    }}
                    showLabels={showLabels}
                  />
                )}


                {activeVisualModelId === 'dna_helix' && (
                  <Dna2DCanvas
                    selectedComponentId={selectedOrganelleId}
                    onSelectComponent={(id) => {
                      setSelectedOrganelleId(id);
                      onAnnounce(`Selected DNA base pair component: ${id}`);
                    }}
                    showLabels={showLabels}
                  />
                )}

                {activeVisualModelId === 'neuron' && (
                  <Neuron2DCanvas
                    selectedComponentId={selectedOrganelleId}
                    onSelectComponent={(id) => {
                      setSelectedOrganelleId(id);
                      onAnnounce(`Selected neuron structure: ${id}`);
                    }}
                    showLabels={showLabels}
                  />
                )}

                {activeVisualModelId === 'physics_optics' && (
                  <div style={{ padding: '1rem' }}>
                    <InteractivePhysicsStudio
                      model={DEFAULT_OPTICS_MODEL}
                      onAnnounce={onAnnounce}
                    />
                  </div>
                )}

                {activeVisualModelId === 'physics_pendulum' && (
                  <div style={{ padding: '1rem' }}>
                    <InteractivePhysicsStudio
                      model={DEFAULT_PENDULUM_MODEL}
                      onAnnounce={onAnnounce}
                    />
                  </div>
                )}

                {activeVisualModelId === 'data_structure' && (
                  <div style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <strong style={{ fontSize: '1rem' }}>Linked List Pointer Engine</strong>
                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          Deterministic memory address and pointer transitions
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        {[
                          { id: 'insertHead', label: 'Insert Head' },
                          { id: 'insertTail', label: 'Insert Tail' },
                          { id: 'deleteNode', label: 'Delete Node' },
                          { id: 'reverseList', label: 'Reverse List' }
                        ].map((op) => (
                          <button
                            key={op.id}
                            type="button"
                            className={`tag-btn ${linkedListOp === op.id ? 'active' : ''}`}
                            onClick={() => {
                              setLinkedListOp(op.id);
                              onAnnounce(`Selected linked list operation: ${op.label}`);
                            }}
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
                          >
                            {op.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <InteractiveCanvas
                      graph={DEFAULT_LINKED_LIST_GRAPH}
                      activePointers={{ head: DEFAULT_LINKED_LIST_GRAPH.headId }}
                      highlightedNodeIds={DEFAULT_LINKED_LIST_GRAPH.headId ? [DEFAULT_LINKED_LIST_GRAPH.headId] : []}
                      highContrast={preferences.highContrast}
                      colorFriendly={preferences.colorFriendly}
                      onAnnounce={onAnnounce}
                    />
                  </div>
                )}
              </div>

              {/* SELECTED ORGANELLE / COMPONENT INSPECTION PANEL (FOR BIOLOGY MODELS) */}
              {activeModelDef?.domain === 'biology' && (
                <div style={{ padding: '1.25rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  {activeComponent ? (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: activeComponent.color || 'var(--accent-cyan)', letterSpacing: '0.04em' }}>
                            Selected Structure
                          </span>
                          <h4 style={{ margin: '0.15rem 0', fontSize: '1.15rem', fontWeight: 700 }}>
                            {activeComponent.name} {activeComponent.scientificName ? `(${activeComponent.scientificName})` : ''}
                          </h4>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Location: {activeComponent.location}</span>
                        </div>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => setSelectedOrganelleId(null)}
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
                        >
                          Clear Selection
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem', marginTop: '0.75rem' }}>
                        <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                          <strong style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', display: 'block', marginBottom: '0.25rem' }}>Primary Function:</strong>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{activeComponent.function}</p>
                        </div>
                        <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                          <strong style={{ fontSize: '0.8rem', color: 'var(--accent-amber)', display: 'block', marginBottom: '0.25rem' }}>Everyday Analogy:</strong>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{activeComponent.analogy}</p>
                        </div>
                      </div>

                      {activeComponent.examFacts?.length > 0 && (
                        <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(56, 189, 248, 0.05)', borderRadius: '6px' }}>
                          <strong style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)' }}>Key Exam Facts:</strong>
                          <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.15rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {activeComponent.examFacts.map((fact, idx) => (
                              <li key={idx}>{fact}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      Click any organelle or structure on the interactive canvas above to inspect its biological function, analogy, and exam facts.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: FLASHCARDS */}
          {representation === 'flashcards' && (
            <div
              className="representation-content flashcards-view"
              onKeyDown={handleFlashcardKeyDown}
              tabIndex={0}
              aria-label="Flashcards deck. Press Space or Enter to flip, Left and Right arrows to navigate."
            >
              {lesson.flashcards.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No flashcards generated for this topic.</p>
              ) : (
                <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <span>Card {flashcardIdx + 1} of {lesson.flashcards.length}</span>
                    <span>Press [Space] to flip • [←] [→] to browse</span>
                  </div>

                  {/* Flippable Card */}
                  <div
                    onClick={() => {
                      setIsFlipped((f) => !f);
                      onAnnounce(isFlipped ? 'Card front' : `Card back: ${lesson.flashcards[flashcardIdx]?.back}`);
                    }}
                    style={{
                      minHeight: '220px',
                      padding: '2rem 1.5rem',
                      background: 'var(--bg-surface)',
                      border: '2px solid var(--border-medium)',
                      borderRadius: 'var(--radius-lg)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 'var(--shadow-subtle)',
                      transition: preferences.reducedMotion || preferences.lowStimulation ? 'none' : 'transform 0.2s ease'
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Flashcard ${flashcardIdx + 1}. Showing ${isFlipped ? 'back: Answer' : 'front: Prompt'}. Click or press space to flip.`}
                  >
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
                      {isFlipped ? 'Answer' : 'Question / Concept'}
                    </span>
                    <p style={{ fontSize: isFlipped ? '1.05rem' : '1.2rem', fontWeight: isFlipped ? 500 : 700, margin: 0, lineHeight: 1.5 }}>
                      {isFlipped ? lesson.flashcards[flashcardIdx]?.back : lesson.flashcards[flashcardIdx]?.front}
                    </p>
                  </div>

                  {/* Flashcard Navigation Buttons */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1rem' }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      disabled={flashcardIdx === 0}
                      onClick={() => {
                        setFlashcardIdx((i) => Math.max(0, i - 1));
                        setIsFlipped(false);
                      }}
                    >
                      <ChevronLeft size={16} /> Previous
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setIsFlipped((f) => !f)}
                    >
                      Flip Card
                    </button>
                    <button
                      type="button"
                      className="btn-primary"
                      disabled={flashcardIdx >= lesson.flashcards.length - 1}
                      onClick={() => {
                        setFlashcardIdx((i) => Math.min(lesson.flashcards.length - 1, i + 1));
                        setIsFlipped(false);
                      }}
                    >
                      Next <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: PRACTICE QUIZ */}
          {representation === 'practice' && (
            <div className="representation-content quiz-view">
              <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Knowledge Check ({lesson.practiceQuestions.length} Questions)
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Select the best option. Answers and explanations are revealed after you submit your choice.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {lesson.practiceQuestions.map((q, qIndex) => {
                  const state = quizAnswers[q.id];
                  const hasSubmitted = state?.submitted;

                  return (
                    <div
                      key={q.id}
                      style={{
                        padding: '1.25rem',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)'
                      }}
                    >
                      <p style={{ fontWeight: 700, fontSize: '0.98rem', marginBottom: '0.75rem' }}>
                        {qIndex + 1}. {q.prompt}
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {q.options.map((opt, optIndex) => {
                          const isSelected = state?.selectedIndex === optIndex;
                          const isCorrect = optIndex === q.correctOptionIndex;
                          const marker = OPTION_MARKERS[optIndex] || { symbol: '•', label: '' };

                          let borderColor = 'var(--border-subtle)';
                          let bg = 'transparent';

                          if (hasSubmitted) {
                            if (isCorrect) {
                              borderColor = 'var(--accent-emerald)';
                              bg = 'rgba(16, 185, 129, 0.12)';
                            } else if (isSelected) {
                              borderColor = 'var(--accent-coral)';
                              bg = 'rgba(244, 63, 94, 0.12)';
                            }
                          } else if (isSelected) {
                            borderColor = 'var(--accent-cyan)';
                            bg = 'rgba(56, 189, 248, 0.08)';
                          }

                          return (
                            <button
                              key={optIndex}
                              type="button"
                              className="quiz-option"
                              disabled={hasSubmitted}
                              onClick={() => {
                                setQuizAnswers((prev) => ({
                                  ...prev,
                                  [q.id]: {
                                    selectedIndex: optIndex,
                                    submitted: true,
                                    isCorrect: optIndex === q.correctOptionIndex
                                  }
                                }));
                                onAnnounce(
                                  optIndex === q.correctOptionIndex
                                    ? `Correct! ${q.explanation}`
                                    : `Incorrect. The correct answer was option ${q.correctOptionIndex + 1}. ${q.explanation}`
                                );
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.75rem 1rem',
                                borderRadius: 'var(--radius-sm)',
                                border: `1.5px solid ${borderColor}`,
                                background: bg,
                                textAlign: 'left',
                                cursor: hasSubmitted ? 'default' : 'pointer'
                              }}
                              aria-label={preferences.colorFriendly ? `Option ${optIndex + 1}, ${marker.label}: ${opt}` : `Option ${optIndex + 1}: ${opt}`}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                {preferences.colorFriendly && (
                                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }} title={marker.label}>
                                    <span aria-hidden="true">{marker.symbol}</span>
                                    <span className="sr-only">{marker.label}</span>
                                  </span>
                                )}
                                <span style={{ fontSize: '0.9rem' }}>{opt}</span>
                              </div>

                              {hasSubmitted && isCorrect && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent-emerald)', fontSize: '0.8rem', fontWeight: 700 }}>
                                  <CheckCircle2 size={16} /> Correct
                                </span>
                              )}
                              {hasSubmitted && isSelected && !isCorrect && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent-coral)', fontSize: '0.8rem', fontWeight: 700 }}>
                                  <XCircle size={16} /> Incorrect
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Revealed Explanation */}
                      {hasSubmitted && (
                        <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(2, 6, 23, 0.05)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                          <strong style={{ color: 'var(--accent-cyan)' }}>Explanation: </strong>
                          <span>{q.explanation}</span>
                          {q.sourceReference && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                              Grounding reference: {q.sourceReference}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 7: STUDY NOTES & TERMS */}
          {representation === 'notes' && (
            <div className="representation-content notes-view">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                {/* Bullet Points */}
                <div style={{ padding: '1rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.75rem', color: 'var(--accent-cyan)' }}>
                    Core Takeaways
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: 1.6, fontSize: '0.9rem' }}>
                    {lesson.studyNotes.map((note, idx) => (
                      <li key={idx} style={{ marginBottom: '0.5rem' }}>{note}</li>
                    ))}
                  </ul>
                </div>

                {/* Vocabulary Glossary */}
                <div style={{ padding: '1rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.75rem', color: 'var(--accent-mint)' }}>
                    Key Vocabulary
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {lesson.keyTerms.map((term, idx) => (
                      <div key={idx}>
                        <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>{term.term}</strong>
                        <p style={{ margin: '0.15rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{term.definition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Synchronized ISL Panel for Deaf & Hard-of-Hearing Mode */}
          {preferences.deafFriendly && representation !== 'isl' && (
            <div style={{ marginTop: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', color: 'var(--accent-cyan)', fontSize: '0.82rem', fontWeight: 700 }}>
                <Captions size={16} />
                <span>Deaf & Hard-of-Hearing Mode: Synchronized ISL Video</span>
              </div>
              <ISLVideoPanel lessonIdOrTopic={lesson.topic} onAnnounce={onAnnounce} />
            </div>
          )}
        </article>
      )}
    </div>
  );
};
