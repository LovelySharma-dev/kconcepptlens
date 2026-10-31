/**
 * One scientific concept, several stored presentations.
 * Missing variants fall back to the standard explanation. Nothing is invented.
 */

import type { LearningExperience } from './themes';

export interface ConceptStepSource {
  stepNumber: number;
  componentId: string;
  title: string;
  summary: string;
}

export interface ConceptQuestionSource {
  prompt: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  hint?: string;
}

export interface ConceptSource {
  conceptId: string;
  componentId: string;
  name: string;
  standard: string;
  plain: string;
  everyday: string;
  location: string;
  role: string;
  chunks: string[];
  steps: ConceptStepSource[];
  question: ConceptQuestionSource | null;
}

export type ContentRepresentation = 'plain' | 'standard';

export interface AdaptedContent {
  conceptId: string;
  componentId: string;
  representation: ContentRepresentation;
  paragraphs: string[];
  usedFallback: boolean;
  fallbackNote: string | null;
  standard: string;
  everyday: string | null;
  everydayNote: string | null;
  diagramDescription: string | null;
  diagramNote: string | null;
  /** Lesson text that speech can read. This is not a recording. */
  narrationText: string | null;
  narrationKind: 'lesson-text' | 'missing';
  chunks: string[];
  chunksNote: string | null;
  steps: ConceptStepSource[];
  stepsNote: string | null;
  glossary: { term: string; meaning: string }[];
  glossaryNote: string | null;
  hint: string | null;
  hintNote: string | null;
  practicePrompt: string | null;
  answerExplanation: string | null;
  available: string[];
  missing: string[];
}

function sentences(text: string): string[] {
  const parts = text
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : [text.trim()];
}

export function representationInventory(source: ConceptSource): { available: string[]; missing: string[] } {
  const present: Record<string, boolean> = {
    standard: source.standard.trim().length > 0,
    plain: source.plain.trim().length > 0,
    chunks: source.chunks.some((chunk) => chunk.trim().length > 0),
    steps: source.steps.some((step) => step.componentId === source.componentId && step.summary.trim().length > 0),
    everyday: source.everyday.trim().length > 0,
    diagram: source.location.trim().length > 0 || source.role.trim().length > 0,
    narration: source.plain.trim().length > 0 || source.standard.trim().length > 0,
    practice: Boolean(source.question?.prompt.trim()),
    hint: Boolean(source.question?.hint?.trim()),
    answer: Boolean(source.question?.explanation.trim()),
    glossary: source.plain.trim().length > 0 || source.role.trim().length > 0
  };
  const available = Object.entries(present)
    .filter(([, ok]) => ok)
    .map(([name]) => name);
  const missing = Object.entries(present)
    .filter(([, ok]) => !ok)
    .map(([name]) => name);
  return { available, missing };
}

export function adaptConceptContent(source: ConceptSource, experience: LearningExperience): AdaptedContent {
  const inventory = representationInventory(source);
  const standard = source.standard.trim();
  const plain = source.plain.trim();
  let representation: ContentRepresentation = 'standard';
  let paragraphs = standard ? [standard] : plain ? [plain] : [];
  let usedFallback = false;
  let fallbackNote: string | null = null;

  if (experience.plainLanguage) {
    if (plain) {
      representation = 'plain';
      paragraphs = experience.shortParagraphs ? sentences(plain) : [plain];
    } else if (standard) {
      representation = 'standard';
      paragraphs = [standard];
      usedFallback = true;
      fallbackNote = 'A plain-language explanation is not stored for this part. Showing the standard explanation.';
    }
  } else if (!standard && plain) {
    representation = 'plain';
    paragraphs = [plain];
    usedFallback = true;
    fallbackNote = 'A separate scientific explanation is not stored for this part. Showing the plain-language text.';
  }

  const everyday = source.everyday.trim();
  const location = source.location.trim();
  const role = source.role.trim();
  const diagramDescription = location || role ? `${source.name}. ${[location, role].filter(Boolean).join(' ')}` : null;
  const narrationSource = [source.name, plain || standard].filter((part) => part && part.trim()).join('. ');
  const chunks = source.chunks.map((chunk) => chunk.trim()).filter(Boolean);
  const steps = source.steps.filter((step) => step.componentId === source.componentId && step.summary.trim());
  const glossary: { term: string; meaning: string }[] = [];
  if (plain) glossary.push({ term: source.name, meaning: plain });
  if (role && role !== plain) glossary.push({ term: `${source.name} role`, meaning: role });

  const hint = source.question?.hint?.trim() || null;

  return {
    conceptId: source.conceptId,
    componentId: source.componentId,
    representation,
    paragraphs,
    usedFallback,
    fallbackNote,
    standard,
    everyday: everyday || null,
    everydayNote: everyday ? null : 'An everyday example is not stored for this part.',
    diagramDescription,
    diagramNote: diagramDescription ? null : 'A diagram description is not stored for this part.',
    narrationText: narrationSource || null,
    narrationKind: narrationSource ? 'lesson-text' : 'missing',
    chunks,
    chunksNote:
      experience.chunkLessons && chunks.length === 0
        ? 'Short sections are not stored for this part. The explanation above is the full stored text.'
        : null,
    steps,
    stepsNote: steps.length === 0 ? 'A guided stage is not stored for this part.' : null,
    glossary,
    glossaryNote: glossary.length === 0 ? 'No glossary line is stored for this part.' : null,
    hint,
    hintNote: hint ? null : 'No separate hint is stored for this question.',
    practicePrompt: source.question?.prompt.trim() || null,
    answerExplanation: source.question?.explanation.trim() || null,
    available: inventory.available,
    missing: inventory.missing
  };
}
