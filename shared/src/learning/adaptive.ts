/**
 * Deterministic learning suggestions.
 * Rules use stored answers and stored lesson parts. They do not estimate ability,
 * and they do not infer or store a diagnosis.
 */

export type LearningEventType =
  | 'question_answered'
  | 'explanation_revisited'
  | 'practice_completed'
  | 'concept_explored'
  | 'hint_requested';

export interface LearningEvent {
  type: LearningEventType;
  lessonId: string;
  conceptId: string;
  questionId?: string;
  questionLabel?: string;
  correct?: boolean;
}

export type ProgressStage = 'not_started' | 'exploring' | 'practicing' | 'reviewed';

export type RecommendationKind =
  | 'review_concept'
  | 'labeled_diagram'
  | 'simpler_explanation'
  | 'listen'
  | 'another_question'
  | 'continue';

export interface LearningObjective {
  id: string;
  statement: string;
  conceptIds: string[];
}

export interface AdaptationContext {
  lessonId: string;
  conceptId: string;
  conceptName: string;
  events: LearningEvent[];
  hasPlain: boolean;
  plainActive: boolean;
  hasDiagram: boolean;
  hasNarration: boolean;
  allowSpeech: boolean;
  hasNextConcept: boolean;
  nextConceptName: string | null;
  /** Other stored questions in this lesson, not the one just shown. */
  otherQuestionIds: string[];
}

export interface LearningRecommendation {
  kind: RecommendationKind;
  title: string;
  why: string;
  conceptId: string;
  /** False when the sentence is status only and no further control exists. */
  actionable: boolean;
}

export interface LessonActivitySummary {
  conceptsExplored: number;
  questionsAttempted: number;
  correctAnswers: number;
  conceptsReviewed: number;
  questionsInLesson: number;
  allQuestionsAttempted: boolean;
}

const EVENT_TYPES: LearningEventType[] = [
  'question_answered',
  'explanation_revisited',
  'practice_completed',
  'concept_explored',
  'hint_requested'
];

const DIAGNOSIS_KEY = /diagnos|medical|disability/i;

export const PROGRESS_LABELS: Record<ProgressStage, string> = {
  not_started: 'Not started',
  exploring: 'Exploring',
  practicing: 'Practicing',
  reviewed: 'Reviewed'
};

/**
 * Objectives name the stored structures a question can assess.
 * They are lesson goals, not a score.
 */
export const LESSON_OBJECTIVES: Record<string, LearningObjective[]> = {
  human_cell: [
    {
      id: 'cell-structures',
      statement: 'Identify the main parts of an animal cell.',
      conceptIds: ['cell_membrane', 'cytoplasm', 'nucleus', 'mitochondria', 'endoplasmic_reticulum', 'golgi_apparatus', 'lysosomes', 'ribosomes']
    },
    {
      id: 'cell-energy',
      statement: 'Describe where a cell releases energy.',
      conceptIds: ['mitochondria']
    },
    {
      id: 'cell-genetic',
      statement: 'Locate where the cell keeps its DNA.',
      conceptIds: ['nucleus']
    }
  ],
  human_heart: [
    {
      id: 'heart-structures',
      statement: "Identify the heart's major structures.",
      conceptIds: ['right_atrium', 'right_ventricle', 'left_atrium', 'left_ventricle', 'aorta', 'pulmonary_artery', 'superior_inferior_vena_cava', 'heart_valves']
    },
    {
      id: 'heart-chambers',
      statement: 'Understand the function of the chambers.',
      conceptIds: ['right_atrium', 'right_ventricle', 'left_atrium', 'left_ventricle']
    },
    {
      id: 'heart-flow',
      statement: 'Explain the direction of blood flow.',
      conceptIds: ['right_atrium', 'right_ventricle', 'pulmonary_artery', 'left_atrium', 'left_ventricle', 'aorta', 'superior_inferior_vena_cava']
    },
    {
      id: 'heart-valves',
      statement: 'Understand the role of valves.',
      conceptIds: ['heart_valves']
    },
    {
      id: 'heart-circulation',
      statement: 'Relate heart function to circulation.',
      conceptIds: ['left_ventricle', 'right_ventricle', 'aorta', 'pulmonary_artery']
    }
  ],
  dna_helix: [
    {
      id: 'dna-backbone',
      statement: 'Identify the sugar-phosphate backbone.',
      conceptIds: ['sugar_phosphate_backbone']
    },
    {
      id: 'dna-pairs',
      statement: 'Describe complementary base pairs.',
      conceptIds: ['adenine_thymine_pair', 'guanine_cytosine_pair']
    },
    {
      id: 'dna-grooves',
      statement: 'Locate the major and minor grooves.',
      conceptIds: ['major_minor_grooves']
    }
  ],
  neuron: [
    {
      id: 'neuron-parts',
      statement: 'Identify the main parts of a neuron.',
      conceptIds: ['dendrites', 'soma', 'axon_hillock', 'axon_and_myelin', 'axon_terminals']
    },
    {
      id: 'neuron-signal',
      statement: 'Trace the direction a signal travels.',
      conceptIds: ['dendrites', 'soma', 'axon_hillock', 'axon_and_myelin', 'axon_terminals']
    }
  ]
};

export function objectivesForLesson(lessonId: string): LearningObjective[] {
  return LESSON_OBJECTIVES[lessonId] ?? [];
}

export function assessedConceptId(question: { diagramComponentId?: string | null }): string | null {
  const id = question.diagramComponentId?.trim();
  return id ? id : null;
}

function cleanText(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

export function normalizeLearningEvent(value: unknown): LearningEvent | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  if (Object.keys(value).some((key) => DIAGNOSIS_KEY.test(key))) return null;
  const raw = value as Record<string, unknown>;
  const type = raw.type;
  const lessonId = cleanText(raw.lessonId);
  const conceptId = cleanText(raw.conceptId);
  if (!lessonId || !conceptId || typeof type !== 'string' || !EVENT_TYPES.includes(type as LearningEventType)) return null;
  const event: LearningEvent = { type: type as LearningEventType, lessonId, conceptId };
  const questionId = cleanText(raw.questionId);
  const questionLabel = cleanText(raw.questionLabel);
  if (questionId) event.questionId = questionId;
  if (questionLabel) event.questionLabel = questionLabel;
  if (typeof raw.correct === 'boolean') event.correct = raw.correct;
  return event;
}

export function normalizeEvidence(value: unknown): LearningEvent[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => normalizeLearningEvent(item)).filter((item): item is LearningEvent => item !== null);
}

export function evidenceStoresDiagnosis(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  if (Array.isArray(value)) return value.some((item) => evidenceStoresDiagnosis(item));
  return Object.keys(value).some((key) => DIAGNOSIS_KEY.test(key));
}

export function appendLearningEvent(events: LearningEvent[], event: LearningEvent): LearningEvent[] {
  const clean = normalizeLearningEvent(event);
  if (!clean) return events;
  if (clean.type === 'concept_explored') {
    const seen = events.some(
      (item) => item.type === 'concept_explored' && item.lessonId === clean.lessonId && item.conceptId === clean.conceptId
    );
    if (seen) return events;
  }
  return [...events, clean];
}

export function clearLessonEvents(events: LearningEvent[], lessonId: string): LearningEvent[] {
  return events.filter((event) => event.lessonId !== lessonId);
}

function forConcept(events: LearningEvent[], lessonId: string, conceptId: string): LearningEvent[] {
  return events.filter((event) => event.lessonId === lessonId && event.conceptId === conceptId);
}

export function progressStage(events: LearningEvent[], lessonId: string, conceptId: string): ProgressStage {
  const mine = forConcept(events, lessonId, conceptId);
  if (mine.length === 0) return 'not_started';
  const answers = mine.filter((event) => event.type === 'question_answered');
  let sawIncorrect = false;
  let recovered = false;
  for (const answer of answers) {
    if (answer.correct === false) sawIncorrect = true;
    if (answer.correct === true && sawIncorrect) recovered = true;
  }
  const revisitedAfterMiss = sawIncorrect && mine.some((event) => event.type === 'explanation_revisited');
  if (recovered || revisitedAfterMiss) return 'reviewed';
  if (answers.length > 0) return 'practicing';
  return 'exploring';
}

export function summarizeLesson(
  events: LearningEvent[],
  lessonId: string,
  conceptIds: string[],
  questionIds: string[]
): LessonActivitySummary {
  const lessonEvents = events.filter((event) => event.lessonId === lessonId);
  const explored = new Set(
    lessonEvents.filter((event) => event.type === 'concept_explored' || event.type === 'question_answered').map((event) => event.conceptId)
  );
  const attempted = new Set(
    lessonEvents.filter((event) => event.type === 'question_answered' && event.questionId).map((event) => event.questionId as string)
  );
  const correct = lessonEvents.filter((event) => event.type === 'question_answered' && event.correct === true).length;
  const reviewed = conceptIds.filter((conceptId) => progressStage(events, lessonId, conceptId) === 'reviewed').length;
  const knownQuestions = questionIds.filter((id) => attempted.has(id));
  return {
    conceptsExplored: explored.size,
    questionsAttempted: attempted.size,
    correctAnswers: correct,
    conceptsReviewed: reviewed,
    questionsInLesson: questionIds.length,
    allQuestionsAttempted: questionIds.length > 0 && knownQuestions.length === questionIds.length
  };
}

function review(ctx: AdaptationContext, why: string): LearningRecommendation {
  return {
    kind: 'review_concept',
    title: 'Review this concept',
    why,
    conceptId: ctx.conceptId,
    actionable: true
  };
}

export function recommendNextStep(ctx: AdaptationContext): LearningRecommendation | null {
  const answers = forConcept(ctx.events, ctx.lessonId, ctx.conceptId).filter((event) => event.type === 'question_answered');
  const last = answers[answers.length - 1];
  if (!last) return null;

  const incorrectCount = answers.filter((event) => event.correct === false).length;
  const lessonCorrect = ctx.events.filter(
    (event) => event.lessonId === ctx.lessonId && event.type === 'question_answered' && event.correct === true
  ).length;
  const label = last.questionLabel || ctx.conceptName;

  if (last.correct === false && incorrectCount >= 2) {
    if (ctx.hasPlain && !ctx.plainActive) {
      return {
        kind: 'simpler_explanation',
        title: 'Read the simpler explanation',
        why: `You answered questions about ${ctx.conceptName} incorrectly more than once, so the stored simpler explanation may help.`,
        conceptId: ctx.conceptId,
        actionable: true
      };
    }
    return review(ctx, `You answered questions about ${ctx.conceptName} incorrectly more than once. Let's review this concept.`);
  }

  if (last.correct === false) {
    if (ctx.hasDiagram) {
      return {
        kind: 'labeled_diagram',
        title: 'Explore the labeled diagram',
        why: `You answered a question about ${label} incorrectly, so reviewing the labeled diagram may help.`,
        conceptId: ctx.conceptId,
        actionable: true
      };
    }
    if (ctx.hasPlain && !ctx.plainActive) {
      return {
        kind: 'simpler_explanation',
        title: 'Read the simpler explanation',
        why: `You answered a question about ${label} incorrectly. Would another explanation help?`,
        conceptId: ctx.conceptId,
        actionable: true
      };
    }
    if (ctx.allowSpeech && ctx.hasNarration) {
      return {
        kind: 'listen',
        title: 'Listen to the current section',
        why: `You answered a question about ${label} incorrectly. Listening reads the same stored text.`,
        conceptId: ctx.conceptId,
        actionable: true
      };
    }
    return review(ctx, `You answered a question about ${label} incorrectly. Let's review this concept.`);
  }

  if (lessonCorrect >= 2 && ctx.otherQuestionIds.length > 0) {
    return {
      kind: 'another_question',
      title: 'Try another question',
      why: 'You answered more than one question correctly, and another stored question is available.',
      conceptId: ctx.conceptId,
      actionable: true
    };
  }

  if (ctx.hasNextConcept && ctx.nextConceptName) {
    return {
      kind: 'continue',
      title: 'Continue to the next concept',
      why: `You answered a question about ${label} correctly. You're ready to continue to ${ctx.nextConceptName}.`,
      conceptId: ctx.conceptId,
      actionable: true
    };
  }

  return {
    kind: 'continue',
    title: "You're ready to continue.",
    why: `You answered a question about ${label} correctly. No further structure is stored after this one.`,
    conceptId: ctx.conceptId,
    actionable: false
  };
}
