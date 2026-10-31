/**
 * Barrierless Learning Engine
 * One curated lesson, several representations. No generated science.
 */

export type LearningModeId = 'visual' | 'simple' | 'steps' | 'listen' | 'low-data' | 'accessible';

export interface LearningComponent {
  id: string;
  name: string;
  simpleExplanation: string;
  functionText: string;
}

export interface LearningStep {
  stepNumber: number;
  componentId: string;
  title: string;
  summary: string;
}

export interface LearningQuestion {
  id: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  diagramComponentId?: string;
}

export interface LearningUnitInput {
  id: string;
  title: string;
  subject: string;
  topic: string;
  objective: string;
  description: string;
  has3D: boolean;
  hasVisual: boolean;
  components: LearningComponent[];
  guidedSteps: LearningStep[];
  questions: LearningQuestion[];
}

export interface ModeAvailability {
  id: LearningModeId;
  label: string;
  available: boolean;
  reason: string;
}

export interface ContinuityState {
  conceptId: string;
  stepIndex: number;
  selectedComponentId: string | null;
  completedStepIndexes: number[];
  /** Answers kept by question id so a mode change does not wipe them. */
  answers: Record<string, { selectedIndex: number; submitted: boolean }>;
  mode: LearningModeId;
  lowData: boolean;
}

export interface SwitchResult {
  state: ContinuityState;
  notice: string | null;
  changed: boolean;
}

export interface MisconceptionNote {
  chosenStatement: string;
  correction: string;
  stepIndex: number | null;
  stepTitle: string | null;
}

export interface SdgConnection {
  conceptId: string;
  sdg: number;
  title: string;
  target: string;
  why: string;
  application: string;
  followUp: string;
  /** Claim that comes from this lesson, not from the UN page. */
  lessonBasis: string;
  sourceTitle: string;
  sourceUrl: string;
}

export interface SavedTextLesson {
  conceptId: string;
  title: string;
  objective: string;
  steps: { title: string; summary: string }[];
  explanations: { name: string; text: string }[];
  savedAt: string;
  kind: 'text-snapshot';
}

export interface TeachForwardDraft {
  conceptId: string;
  sentence: string;
  steps: string[];
  misconception: string;
  question: string;
  savedAt: string;
  status: 'unpublished-draft';
}

const LISTEN_REASON = 'No recorded narration is included for this lesson.';

export function modesForLesson(lesson: LearningUnitInput): ModeAvailability[] {
  const hasSteps = lesson.guidedSteps.length > 0;
  const hasText = lesson.components.some((c) => c.simpleExplanation.trim().length > 0);
  return [
    {
      id: 'visual',
      label: 'Explore visually',
      available: lesson.hasVisual,
      reason: lesson.hasVisual ? 'Interactive model' : 'This lesson has no interactive model.'
    },
    {
      id: 'simple',
      label: 'Read and understand',
      available: hasText,
      reason: hasText ? 'Plain language beside the scientific wording' : 'No simplified explanation is stored for this lesson.'
    },
    {
      id: 'steps',
      label: 'Focus',
      available: hasSteps,
      reason: hasSteps ? 'One stage at a time, with the next action labeled' : 'No guided stages are stored for this lesson.'
    },
    {
      id: 'listen',
      label: 'Listen and follow',
      available: false,
      reason: LISTEN_REASON
    },
    {
      id: 'low-data',
      label: 'Low data',
      available: hasText,
      reason: hasText ? 'Text stays available. The diagram stays unloaded until you ask for it.' : 'No text lesson is stored.'
    },
    {
      id: 'accessible',
      label: 'Text first',
      available: lesson.components.length > 0,
      reason: lesson.components.length > 0 ? 'The written lesson, without starting a diagram' : 'No structures are stored.'
    }
  ];
}

export function initialContinuity(lesson: LearningUnitInput, prefs?: { mode?: LearningModeId; lowData?: boolean }): ContinuityState {
  const requested = prefs?.mode ?? 'visual';
  const available = modesForLesson(lesson).find((m) => m.id === requested)?.available;
  const mode = available ? requested : 'simple';
  return {
    conceptId: lesson.id,
    stepIndex: 0,
    selectedComponentId: lesson.components[0]?.id ?? null,
    completedStepIndexes: [],
    answers: {},
    mode: prefs?.lowData ? 'low-data' : mode,
    lowData: Boolean(prefs?.lowData)
  };
}

function stepForComponent(lesson: LearningUnitInput, componentId: string | null): number {
  if (!componentId) return -1;
  return lesson.guidedSteps.findIndex((step) => step.componentId === componentId);
}

export function switchLearningMode(state: ContinuityState, lesson: LearningUnitInput, next: LearningModeId): SwitchResult {
  if (state.conceptId !== lesson.id) {
    return {
      state,
      notice: 'That representation belongs to a different concept. Nothing was switched.',
      changed: false
    };
  }
  const target = modesForLesson(lesson).find((m) => m.id === next);
  if (!target?.available) {
    return { state, notice: target?.reason ?? 'That representation is not available.', changed: false };
  }

  let stepIndex = state.stepIndex;
  let selectedComponentId = state.selectedComponentId;
  let notice: string | null = null;

  if (state.mode === 'steps' && (next === 'visual' || next === 'accessible')) {
    const step = lesson.guidedSteps[state.stepIndex];
    if (step) {
      selectedComponentId = step.componentId;
      notice = `Continued at stage ${step.stepNumber}: ${step.title}.`;
    }
  } else if ((state.mode === 'visual' || state.mode === 'accessible') && next === 'steps') {
    const mapped = stepForComponent(lesson, state.selectedComponentId);
    if (mapped >= 0) {
      stepIndex = mapped;
      notice = `Continued at stage ${lesson.guidedSteps[mapped].stepNumber}: ${lesson.guidedSteps[mapped].title}.`;
    } else {
      notice = 'No guided stage is mapped to the selected structure. Completed stages were kept.';
    }
  } else if (next === 'simple' || next === 'low-data') {
    notice = 'This is the written lesson. The selected structure, completed stages, and quiz answers stay.';
  } else if (next === 'accessible' || next === 'visual') {
    notice = 'Same structure as before. The view changed, not the concept.';
  }

  return {
    state: {
      ...state,
      mode: next,
      stepIndex,
      selectedComponentId,
      lowData: next === 'low-data' ? true : next === 'visual' ? false : state.lowData
    },
    notice,
    changed: true
  };
}

export function selectStructure(state: ContinuityState, lesson: LearningUnitInput, componentId: string): SwitchResult {
  const mapped = stepForComponent(lesson, componentId);
  const stepIndex = mapped >= 0 ? mapped : state.stepIndex;
  return {
    state: { ...state, selectedComponentId: componentId, stepIndex },
    notice: mapped >= 0 ? null : 'That structure has no guided stage. The current stage was left as it was.',
    changed: true
  };
}

export function markStepComplete(state: ContinuityState, stepIndex: number): ContinuityState {
  if (state.completedStepIndexes.includes(stepIndex)) return state;
  return { ...state, completedStepIndexes: [...state.completedStepIndexes, stepIndex].sort((a, b) => a - b) };
}

export function recordAnswer(
  state: ContinuityState,
  lesson: Pick<LearningUnitInput, 'guidedSteps'>,
  question: LearningQuestion,
  selectedIndex: number
): { state: ContinuityState; correct: boolean; misconception: MisconceptionNote | null } {
  const correct = selectedIndex === question.correctOptionIndex;
  const next: ContinuityState = {
    ...state,
    answers: {
      ...state.answers,
      [question.id]: { selectedIndex, submitted: true }
    }
  };
  return {
    state: next,
    correct,
    misconception: misconceptionFor(question, selectedIndex, lesson)
  };
}

export function misconceptionFor(
  question: LearningQuestion,
  selectedIndex: number,
  lesson: Pick<LearningUnitInput, 'guidedSteps'>
): MisconceptionNote | null {
  if (selectedIndex === question.correctOptionIndex) return null;
  const chosen = question.options[selectedIndex];
  if (!chosen) return null;
  const stepIndex = question.diagramComponentId
    ? lesson.guidedSteps.findIndex((step) => step.componentId === question.diagramComponentId)
    : -1;
  const step = stepIndex >= 0 ? lesson.guidedSteps[stepIndex] : null;
  return {
    chosenStatement: chosen,
    correction: question.explanation,
    stepIndex: step ? stepIndex : null,
    stepTitle: step ? step.title : null
  };
}

export function clearAnswer(state: ContinuityState, questionId: string): ContinuityState {
  const answers = { ...state.answers };
  delete answers[questionId];
  return { ...state, answers };
}

export function resetProgress(state: ContinuityState, lesson: LearningUnitInput): ContinuityState {
  return {
    ...initialContinuity(lesson, { mode: state.mode, lowData: state.lowData }),
    mode: state.mode,
    lowData: state.lowData
  };
}

/**
 * Classroom links only. A missing id means no connection was curated.
 * UN pages name the goal. The lesson basis is quoted from this app's own lesson text, not from the UN.
 */
export const SDG_CONNECTIONS: Record<string, SdgConnection> = {
  human_cell: {
    conceptId: 'human_cell',
    sdg: 3,
    title: 'Good Health and Well-being',
    target: 'Goal 3: ensure healthy lives and promote well-being for all at all ages.',
    why: 'This lesson says mitochondria turn food and oxygen into ATP. That is the cell-level reason a body needs nutrition and air. It is not a treatment guide.',
    application: 'Health classes use this physiology when they explain why oxygen and food matter. This page does not give medical advice.',
    followUp: 'Which structure in this lesson is described as making ATP from food and oxygen?',
    lessonBasis: 'Mitochondria simple explanation in the animal-cell lesson.',
    sourceTitle: 'United Nations Sustainable Development Goal 3',
    sourceUrl: 'https://sdgs.un.org/goals/goal3'
  },
  human_heart: {
    conceptId: 'human_heart',
    sdg: 3,
    title: 'Good Health and Well-being',
    target: 'Target 3.4: reduce premature mortality from non-communicable diseases through prevention and treatment, and promote mental health.',
    why: 'The lesson shows the four chambers and the two circulation loops. Cardiovascular disease is one of the non-communicable diseases named by that target. The lesson teaches the anatomy, not a mortality statistic.',
    application: 'A student who can trace pulmonary and systemic flow can follow what a blood-pressure or heart-disease lesson is describing.',
    followUp: 'Which side of the heart sends blood to the body in this lesson?',
    lessonBasis: 'Heart lesson description of double circulation.',
    sourceTitle: 'United Nations Sustainable Development Goal 3',
    sourceUrl: 'https://sdgs.un.org/goals/goal3'
  },
  plant_cell: {
    conceptId: 'plant_cell',
    sdg: 15,
    title: 'Life on Land',
    target: 'Target 15.1: conservation, restoration, and sustainable use of terrestrial and inland freshwater ecosystems.',
    why: 'The lesson includes chloroplasts, where land plants capture light. Terrestrial ecosystems in this target depend on that plant biology. The lesson does not measure biodiversity.',
    application: 'Knowing what a chloroplast does makes later lessons about forests and crops easier to connect to a cell.',
    followUp: 'Which structure in this lesson captures light?',
    lessonBasis: 'Plant-cell lesson structures for the cell wall and chloroplasts.',
    sourceTitle: 'United Nations Sustainable Development Goal 15',
    sourceUrl: 'https://sdgs.un.org/goals/goal15'
  }
};

export const SDG_4_NOTE = {
  sdg: 4,
  title: 'Quality Education',
  text: 'More than one representation of the same objective is an inclusive-education practice. This product has not been evaluated against SDG 4.',
  sourceTitle: 'United Nations Sustainable Development Goal 4',
  sourceUrl: 'https://sdgs.un.org/goals/goal4'
};

export function sdgForConcept(conceptId: string): SdgConnection | null {
  return SDG_CONNECTIONS[conceptId] ?? null;
}

/** Shrink a Cloudinary delivery URL. Non-Cloudinary URLs are left off the low-data view. */
export function lowDataDeliveryUrl(url: string): string | null {
  if (!url.includes('://res.cloudinary.com/')) return null;
  let next = url.replace(/w_\d+/g, 'w_320');
  if (!/w_\d+/.test(next) && next.includes('/upload/')) {
    next = next.replace('/upload/', '/upload/c_limit,w_320,f_auto,q_auto/');
  }
  if (!next.includes('f_auto')) {
    next = next.replace('/upload/', '/upload/f_auto,q_auto/');
  }
  return next;
}

export function buildTextSnapshot(lesson: LearningUnitInput, savedAt: string): SavedTextLesson {
  return {
    conceptId: lesson.id,
    title: lesson.title,
    objective: lesson.objective,
    steps: lesson.guidedSteps.map((step) => ({ title: step.title, summary: step.summary })),
    explanations: lesson.components.map((c) => ({ name: c.name, text: c.simpleExplanation })),
    savedAt,
    kind: 'text-snapshot'
  };
}

/** Words that travel with an answer so correctness is not carried by color alone. */
export function optionFeedback(submitted: boolean, chosen: boolean, correctOption: boolean): string | null {
  if (!submitted) return null;
  if (correctOption) return 'Correct answer';
  if (chosen) return 'Your choice. Not this answer.';
  return null;
}

export function isTeachForwardDraft(value: unknown): value is TeachForwardDraft {
  if (!value || typeof value !== 'object') return false;
  const draft = value as TeachForwardDraft;
  return draft.status === 'unpublished-draft' && typeof draft.sentence === 'string' && Array.isArray(draft.steps);
}
