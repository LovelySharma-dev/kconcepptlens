/**
 * Deterministic learning-material pipeline.
 * Keyword classification, checked arithmetic, and evidence weights.
 * This is not a trained model. Image bytes are read by the server OCR service.
 */

import type { LearningPreferences } from './preferences';
import { resolveLearningExperience } from './themes';
import {
  MaterialExplanationSchema,
  type ContentTypeId,
  type ExplanationStep,
  type MaterialExplanation,
  type MaterialSourceKind,
  type PracticeQuestion,
  type PracticeStage,
  type SolvingStrategy,
  type SubjectId
} from '../schemas/material';

export const MATERIAL_MAX_BYTES = 12 * 1024 * 1024;

export type DetectedFormat = 'jpeg' | 'png' | 'webp' | 'pdf' | 'unsupported';

export interface FileValidation {
  ok: boolean;
  httpStatus: number;
  error: string | null;
  format: DetectedFormat | null;
  detectedMime: string | null;
  byteLength: number;
}

export interface IngestResult {
  accepted: boolean;
  httpStatus: number;
  error: string | null;
  processed: boolean;
  extractionStatus: 'extracted' | 'provider_required' | 'uncertain' | 'failed' | 'empty' | 'sample' | 'rejected';
  format: DetectedFormat | 'text' | null;
  byteLength: number;
  text: string;
  note: string;
  sampleId: string | null;
  demo: boolean;
  instructionLike: boolean;
  ocrConfidence?: number | null;
  readingOrigin?: 'image_ocr' | 'scanned_pdf' | null;
}

export interface SampleMaterial {
  id: string;
  label: string;
  subject: SubjectId;
  text: string;
  linkedLessonId: string | null;
}

export interface StrategyWeights {
  plain: number;
  steps: number;
  example: number;
  challenge: number;
}

export interface MaterialAttempt {
  questionId: string;
  conceptId: string;
  subject: SubjectId;
  correct: boolean;
}

export interface MaterialEvidence {
  version: 1;
  attempts: MaterialAttempt[];
  reviews: string[];
  concepts: string[];
}

export type MaterialAction =
  | 'explain_differently'
  | 'make_simpler'
  | 'show_steps'
  | 'show_diagram'
  | 'read_aloud'
  | 'repeat_step'
  | 'practice'
  | 'review_mistake'
  | 'continue';

export interface PresentedMaterial {
  paragraphs: string[];
  fullParagraphs: string[];
  showingPlain: boolean;
  usedFallback: boolean;
  fallbackNote: string | null;
  steps: ExplanationStep[];
  visibleStepIndexes: number[];
  everyday: string | null;
  diagramDescription: string | null;
  glossary: { term: string; meaning: string }[];
  speechText: string | null;
  speechNote: string | null;
  hint: string | null;
  nextAction: string | null;
  actions: MaterialAction[];
  missing: string[];
  colorNote: string | null;
  captionNote: string | null;
  lowDataNote: string | null;
}

export interface MaterialRecommendation {
  kind: 'review_concept' | 'simpler_explanation' | 'another_question' | 'continue';
  title: string;
  why: string;
  conceptId: string;
}

const MIME: Record<Exclude<DetectedFormat, 'unsupported'>, string> = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  pdf: 'application/pdf'
};

const INSTRUCTION = /ignore (all |any )?(previous|prior|above) instructions|system prompt|you are now|do not follow/i;
const DIAGNOSIS_KEY = /diagnos|medical|disability/i;

const GLOSSARY: Record<string, string> = {
  equation: 'A statement that two amounts are equal.',
  variable: 'A letter that stands for a number that is not known yet.',
  coefficient: 'The number that multiplies a variable.',
  reactant: 'A substance present at the start of a reaction.',
  product: 'A substance produced by a reaction.',
  velocity: 'Speed in a stated direction.',
  'focal length': 'The distance from a thin lens to its focal point.',
  mitochondria: 'The part of a cell that releases usable energy.',
  nucleus: 'The part of a cell that holds DNA.',
  algorithm: 'A finite list of steps for a task.',
  function: 'A named block of code that does one job.',
  metaphor: 'A comparison that talks about one thing as if it were another.',
  narrator: 'The voice telling a story.',
  latitude: 'Distance north or south of the equator.',
  chronology: 'Events placed in time order.'
};

export const SAMPLE_MATERIALS: SampleMaterial[] = [
  {
    id: 'sample-math',
    label: 'Sample: mathematics equation',
    subject: 'mathematics',
    text: 'Solve the equation 2x + 3 = 11. Show each operation.',
    linkedLessonId: null
  },
  {
    id: 'sample-physics',
    label: 'Sample: physics diagram notes',
    subject: 'physics',
    text: 'Figure: convex lens ray diagram. Using the Cartesian sign convention, object distance u = -20 cm and focal length f = +10 cm. Formula written on the page: 1/f = 1/v - 1/u. The diagram shows an object to the left of a convex lens and three principal rays. Assumption written beside the figure: thin lens.',
    linkedLessonId: null
  },
  {
    id: 'sample-code',
    label: 'Sample: programming question',
    subject: 'computer_science',
    text: 'Question: What does this Python function return for items = [3, 1, 2]?\ndef total(items):\n    result = 0\n    for value in items:\n        result = result + value\n    return result',
    linkedLessonId: null
  },
  {
    id: 'sample-biology',
    label: 'Sample: biology diagram notes',
    subject: 'biology',
    text: 'Labeled animal-cell diagram. The nucleus stores DNA. Mitochondria release energy the cell can use. This sample points at the curated animal-cell lesson.',
    linkedLessonId: 'human_cell'
  }
];

export function sampleById(id: string): SampleMaterial | null {
  return SAMPLE_MATERIALS.find((sample) => sample.id === id) ?? null;
}

export interface SubjectStrategy {
  subject: SubjectId;
  specialized: boolean;
  label: string;
  scope: string;
}

/** Subjects with a narrow checker, and subjects that still only copy the source. */
export const SUBJECT_STRATEGIES: SubjectStrategy[] = [
  {
    subject: 'mathematics',
    specialized: true,
    label: 'Checked arithmetic',
    scope: 'Linear equations of the form ax + b = c, and expressions that use addition, subtraction, multiplication, and division. Other algebra is left unsolved.'
  },
  {
    subject: 'physics',
    specialized: true,
    label: 'Thin-lens check',
    scope: 'The written formula 1/f = 1/v - 1/u when signed focal length and object distance in centimetres are present. Other physics is left unsolved.'
  },
  {
    subject: 'computer_science',
    specialized: true,
    label: 'Add-a-list trace',
    scope: 'A function that starts at 0 and adds each listed number. The file is not executed. Other programs are shown line by line.'
  },
  {
    subject: 'biology',
    specialized: true,
    label: 'Named structure check',
    scope: 'Nucleus and DNA, mitochondria and energy, or chloroplasts and light, and only when the source says so.'
  },
  {
    subject: 'chemistry',
    specialized: true,
    label: 'Small reaction balance',
    scope: 'Simple formulas joined by an arrow, checked by atom counts. Laboratory steps are not added.'
  },
  {
    subject: 'history',
    specialized: false,
    label: 'No specialized strategy',
    scope: 'Years are copied in the order written. They are not checked against an outside reference.'
  },
  {
    subject: 'geography',
    specialized: false,
    label: 'No specialized strategy',
    scope: 'Location words are copied from the source. A map is not inferred.'
  },
  {
    subject: 'literature',
    specialized: false,
    label: 'No specialized strategy',
    scope: 'Sentences are copied from the source. A paraphrase is not generated.'
  },
  {
    subject: 'general',
    specialized: false,
    label: 'No specialized strategy',
    scope: 'The source is split into sentences. Extra facts are not added.'
  },
  {
    subject: 'unknown',
    specialized: false,
    label: 'No specialized strategy',
    scope: 'There is not enough subject evidence to choose a solver.'
  }
];

export function strategyReport(subject: SubjectId, matched: boolean): SolvingStrategy {
  const row = SUBJECT_STRATEGIES.find((item) => item.subject === subject) ?? SUBJECT_STRATEGIES[SUBJECT_STRATEGIES.length - 1];
  return {
    subject,
    specialized: row.specialized,
    matched: row.specialized && matched,
    label: row.label,
    scope: row.scope
  };
}

export function detectFormat(bytes: Uint8Array): DetectedFormat {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpeg';
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'png';
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return 'webp';
  }
  if (bytes.length >= 5 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46 && bytes[4] === 0x2d) {
    return 'pdf';
  }
  return 'unsupported';
}

export function validateMaterialFile(bytes: Uint8Array, declaredMime?: string | null): FileValidation {
  if (!bytes || bytes.length === 0) {
    return { ok: false, httpStatus: 400, error: 'The file is empty.', format: null, detectedMime: null, byteLength: 0 };
  }
  if (bytes.length > MATERIAL_MAX_BYTES) {
    return {
      ok: false,
      httpStatus: 413,
      error: 'The file is larger than 12 MB. The learning upload stops at 12 MB so the request fits the server limit.',
      format: null,
      detectedMime: null,
      byteLength: bytes.length
    };
  }
  const format = detectFormat(bytes);
  if (format === 'unsupported') {
    return {
      ok: false,
      httpStatus: 400,
      error: 'This file is not a JPEG, PNG, WebP, or PDF. The declared type was not trusted.',
      format,
      detectedMime: null,
      byteLength: bytes.length
    };
  }
  const detectedMime = MIME[format];
  const declared = declaredMime?.split(';')[0]?.trim().toLowerCase();
  if (declared && declared !== detectedMime && !(format === 'jpeg' && declared === 'image/jpg')) {
    return {
      ok: false,
      httpStatus: 400,
      error: `The file contents are ${detectedMime}, which does not match the declared type.`,
      format,
      detectedMime,
      byteLength: bytes.length
    };
  }
  return { ok: true, httpStatus: 200, error: null, format, detectedMime, byteLength: bytes.length };
}

function decodePdfLiteral(token: string): string {
  const start = token.indexOf('(');
  const end = token.lastIndexOf(')');
  if (start < 0 || end <= start) return '';
  const inner = token.slice(start + 1, end);
  let out = '';
  for (let i = 0; i < inner.length; i += 1) {
    if (inner[i] !== '\\') {
      out += inner[i];
      continue;
    }
    const next = inner[i + 1];
    if (next === 'n') out += '\n';
    else if (next === 'r') out += '\r';
    else if (next === 't') out += '\t';
    else if (next === '(' || next === ')' || next === '\\') out += next;
    else out += next ?? '';
    i += 1;
  }
  return out;
}

export function extractPdfTextLayer(bytes: Uint8Array): { ok: true; text: string } | { ok: false; reason: 'malformed' | 'no_text_layer' } {
  if (detectFormat(bytes) !== 'pdf') return { ok: false, reason: 'malformed' };
  const raw = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
  if (!raw.includes('endobj') && !raw.includes('%%EOF')) return { ok: false, reason: 'malformed' };
  const pieces: string[] = [];
  const pattern = /\((?:\\.|[^\\)]){0,4000}\)/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(raw))) {
    const decoded = decodePdfLiteral(match[0]).replace(/\s+/g, ' ').trim();
    if (decoded) pieces.push(decoded);
  }
  const text = pieces.join(' ').replace(/\s+/g, ' ').trim();
  if (!text) return { ok: false, reason: 'no_text_layer' };
  return { ok: true, text };
}

export function acceptExtractedText(input: {
  text: string;
  confidence: number | null;
  providerConfigured: boolean;
}): { text: string; status: 'extracted' | 'uncertain' | 'provider_required'; verified: boolean; note: string } {
  if (!input.providerConfigured) {
    return {
      text: '',
      status: 'provider_required',
      verified: false,
      note: 'No OCR provider is configured, so image text was not created.'
    };
  }
  const text = input.text.replace(/\0/g, '').trim();
  if (!text) {
    return { text: '', status: 'provider_required', verified: false, note: 'The provider returned no text.' };
  }
  if (input.confidence === null || input.confidence < 0.8) {
    return {
      text,
      status: 'uncertain',
      verified: false,
      note: 'The reading is uncertain. Correct it before treating it as the source.'
    };
  }
  return { text, status: 'extracted', verified: false, note: 'Text came from the local reader and still needs a look from you.' };
}

export function applyOcrReading(
  base: IngestResult,
  reading: { text: string; confidence: number | null; providerConfigured: boolean; origin: 'image' | 'scanned_pdf'; note?: string }
): IngestResult {
  if (!reading.providerConfigured) {
    return {
      ...base,
      processed: false,
      text: '',
      extractionStatus: 'provider_required',
      note: reading.note || 'No OCR reader is configured, so image text was not created. You can type what you see.',
      ocrConfidence: null,
      readingOrigin: null,
      instructionLike: false
    };
  }
  const accepted = acceptExtractedText({
    text: reading.text,
    confidence: reading.confidence,
    providerConfigured: true
  });
  if (!accepted.text) {
    return {
      ...base,
      processed: false,
      text: '',
      extractionStatus: 'failed',
      note: reading.note || accepted.note,
      ocrConfidence: reading.confidence,
      readingOrigin: null,
      instructionLike: false
    };
  }
  const origin = reading.origin === 'scanned_pdf' ? 'scanned_pdf' : 'image_ocr';
  const percent = reading.confidence === null ? null : Math.round(reading.confidence * 100);
  const confidenceNote = percent === null ? '' : ` Confidence ${percent}%.`;
  return {
    ...base,
    accepted: true,
    httpStatus: 200,
    error: null,
    processed: true,
    extractionStatus: accepted.status === 'uncertain' ? 'uncertain' : 'extracted',
    text: accepted.text,
    note: `${accepted.note}${confidenceNote} This is a local reading of English printed text. Handwriting is often weak. Correct the text, then explain it.`,
    ocrConfidence: reading.confidence,
    readingOrigin: origin,
    instructionLike: INSTRUCTION.test(accepted.text)
  };
}

export function processingFailure(kind: 'timeout' | 'network' | 'malformed' | 'unsupported' | 'empty'): { processed: false; message: string } {
  const message = {
    timeout: 'Processing timed out. Nothing was returned as a finished explanation.',
    network: 'The request did not reach the server. Nothing was processed.',
    malformed: 'The document could not be read. No explanation was invented for it.',
    unsupported: 'This input is not supported. No explanation was invented for it.',
    empty: 'There is no text to explain yet.'
  }[kind];
  return { processed: false, message };
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

export function defaultStrategyWeights(): StrategyWeights {
  return { plain: 1, steps: 1, example: 1, challenge: 1 };
}

export function adjustStrategyWeights(current: StrategyWeights, correct: boolean): StrategyWeights {
  if (correct) {
    return { ...current, challenge: round3(Math.min(3, current.challenge + 0.25)) };
  }
  return {
    plain: round3(current.plain + 0.35),
    steps: round3(current.steps + 0.25),
    example: current.example,
    challenge: round3(Math.max(0.2, current.challenge - 0.2))
  };
}

export function preferredStrategy(
  weights: StrategyWeights,
  available: Array<'plain' | 'steps' | 'example'>
): 'plain' | 'steps' | 'example' {
  const ranked = [...available].sort((a, b) => weights[b] - weights[a] || a.localeCompare(b));
  return ranked[0] ?? 'steps';
}

export function emptyMaterialEvidence(): MaterialEvidence {
  return { version: 1, attempts: [], reviews: [], concepts: [] };
}

export function normalizeMaterialEvidence(value: unknown): MaterialEvidence {
  const empty = emptyMaterialEvidence();
  if (!value || typeof value !== 'object' || Array.isArray(value)) return empty;
  if (Object.keys(value as object).some((key) => DIAGNOSIS_KEY.test(key))) return empty;
  const raw = value as Record<string, unknown>;
  const attempts: MaterialAttempt[] = [];
  if (Array.isArray(raw.attempts)) {
    for (const item of raw.attempts) {
      if (!item || typeof item !== 'object') continue;
      const row = item as Record<string, unknown>;
      if (Object.keys(row).some((key) => DIAGNOSIS_KEY.test(key))) continue;
      if (typeof row.questionId !== 'string' || typeof row.conceptId !== 'string' || typeof row.correct !== 'boolean') continue;
      if (typeof row.subject !== 'string') continue;
      attempts.push({
        questionId: row.questionId,
        conceptId: row.conceptId,
        subject: row.subject as SubjectId,
        correct: row.correct
      });
    }
  }
  const reviews = Array.isArray(raw.reviews) ? raw.reviews.filter((item): item is string => typeof item === 'string') : [];
  const concepts = Array.isArray(raw.concepts) ? raw.concepts.filter((item): item is string => typeof item === 'string') : [];
  return {
    version: 1,
    attempts: attempts.slice(-100),
    reviews: [...new Set(reviews)].slice(-100),
    concepts: [...new Set(concepts)].slice(-100)
  };
}

export function materialEvidenceStoresDiagnosis(state: MaterialEvidence): boolean {
  return DIAGNOSIS_KEY.test(JSON.stringify(state));
}

export function recordMaterialAttempt(state: MaterialEvidence, attempt: MaterialAttempt): MaterialEvidence {
  const concepts = state.concepts.includes(attempt.conceptId) ? state.concepts : [...state.concepts, attempt.conceptId];
  return normalizeMaterialEvidence({
    ...state,
    concepts,
    attempts: [...state.attempts, attempt]
  });
}

export function recordMaterialReview(state: MaterialEvidence, conceptId: string): MaterialEvidence {
  return normalizeMaterialEvidence({
    ...state,
    reviews: [...state.reviews, conceptId],
    concepts: state.concepts.includes(conceptId) ? state.concepts : [...state.concepts, conceptId]
  });
}

export function clearMaterialEvidence(): MaterialEvidence {
  return emptyMaterialEvidence();
}

function scoreSubjects(text: string): Record<SubjectId, number> {
  const scores: Record<SubjectId, number> = {
    mathematics: 0,
    physics: 0,
    chemistry: 0,
    biology: 0,
    computer_science: 0,
    history: 0,
    geography: 0,
    literature: 0,
    general: 0,
    unknown: 0
  };
  if (/\d+\s*x\b/i.test(text) || /[0-9]\s*=\s*-?[0-9]/.test(text)) scores.mathematics += 3;
  if (/\b(solve|equation|algebra|fraction|integral|derivative)\b/i.test(text)) scores.mathematics += 2;
  if (/\d+(?:\.\d+)?\s*[+\-*/]\s*\d+/.test(text)) scores.mathematics += 2;
  if (/\b(force|velocity|acceleration|newton|joule|voltage|lens|refraction|gravity|focal)\b/i.test(text)) scores.physics += 2;
  if (/\b(m\/s|kg|joules?)\b/i.test(text) || /\bcm\b/.test(text)) scores.physics += 1;
  if (/\b(reactant|product|mole|atom|element|acid|base|reaction)\b/i.test(text)) scores.chemistry += 2;
  if (/->|→/.test(text) || /\b(H2O|NaCl|CO2|O2|H2)\b/.test(text)) scores.chemistry += 2;
  if (/\b(cell|mitochondria|nucleus|dna|photosynthesis|neuron|chloroplast|organelle)\b/i.test(text)) scores.biology += 2;
  if (/\b(def|function|class|console\.log|syntaxerror|typeerror|indentationerror|nameerror|algorithm|pseudocode|return)\b/i.test(text)) {
    scores.computer_science += 3;
  }
  if (/```/.test(text) || /\bfor\b[^\n]+:/.test(text)) scores.computer_science += 2;
  const years = text.match(/\b(1[0-9]{3}|20[0-9]{2})\b/g);
  if (years) scores.history += Math.min(3, years.length);
  if (/\b(century|empire|war|treaty|revolution|dynasty|kingdom)\b/i.test(text)) scores.history += 2;
  if (/\b(latitude|longitude|equator|continent|river|climate|capital|map)\b/i.test(text)) scores.geography += 2;
  if (/\b(metaphor|simile|stanza|narrator|poem|grammar|protagonist|paragraph)\b/i.test(text)) scores.literature += 2;
  if (text.trim().length > 80) scores.general += 1;
  return scores;
}

const SUBJECT_ORDER: SubjectId[] = [
  'mathematics',
  'computer_science',
  'chemistry',
  'physics',
  'biology',
  'history',
  'geography',
  'literature',
  'general',
  'unknown'
];

export interface Classification {
  subject: SubjectId;
  contentType: ContentTypeId;
  confidence: number;
  uncertain: boolean;
  evidence: string[];
  learnerCorrected: boolean;
}

export function classifyLearningText(text: string): Classification {
  const trimmed = text.trim();
  if (trimmed.length < 8) {
    return {
      subject: 'unknown',
      contentType: 'unknown',
      confidence: 0,
      uncertain: true,
      evidence: ['There is not enough text to estimate a subject.'],
      learnerCorrected: false
    };
  }
  const scores = scoreSubjects(trimmed);
  const ranked = SUBJECT_ORDER.map((subject) => ({ subject, score: scores[subject] })).sort((a, b) => b.score - a.score);
  const top = ranked[0];
  const second = ranked[1]?.score ?? 0;
  if (!top || top.score <= 0) {
    return {
      subject: 'unknown',
      contentType: trimmed.endsWith('?') ? 'question' : 'prose',
      confidence: 0.2,
      uncertain: true,
      evidence: ['No subject keywords were found.'],
      learnerCorrected: false
    };
  }
  const confidence = round3(Math.min(0.95, Math.max(0.2, (top.score - second) / top.score)));
  const uncertain = top.score < 2 || confidence < 0.45;
  const subject = uncertain && top.score < 2 ? 'unknown' : top.subject;
  return {
    subject,
    contentType: contentTypeFor(trimmed, subject),
    confidence: subject === 'unknown' ? Math.min(confidence, 0.4) : confidence,
    uncertain: subject === 'unknown' || uncertain,
    evidence: [`Keyword score for ${top.subject}: ${top.score}.`],
    learnerCorrected: false
  };
}

function contentTypeFor(text: string, subject: SubjectId): ContentTypeId {
  if (subject === 'computer_science' || /\b(def |function |class |SyntaxError|TypeError)\b/.test(text)) return 'programming_code';
  if (/\d+\s*x\b/i.test(text) && /=/.test(text)) return 'equation';
  if (subject === 'history' && (text.match(/\b(1[0-9]{3}|20[0-9]{2})\b/g) || []).length >= 2) return 'historical_timeline';
  if (subject === 'geography' && /\bmap\b/i.test(text)) return 'map';
  if (/\b(diagram|figure)\b/i.test(text)) return 'diagram';
  if (/\b(table|column|row)\b/i.test(text) && /\|/.test(text)) return 'table';
  if (subject === 'biology' && /\b(process|cycle|photosynthesis|respiration)\b/i.test(text)) return 'scientific_process';
  if (subject === 'chemistry' && /->|→/.test(text)) return 'scientific_process';
  if (text.trim().endsWith('?')) return 'question';
  if (subject === 'unknown') return 'prose';
  return 'textbook_passage';
}

export function applyLearnerCorrection(
  classification: Classification,
  correction: { subject?: SubjectId | null; contentType?: ContentTypeId | null }
): Classification {
  const subject = correction.subject ?? classification.subject;
  const contentType = correction.contentType ?? classification.contentType;
  const changed = subject !== classification.subject || contentType !== classification.contentType;
  if (!changed) return classification;
  return {
    subject,
    contentType,
    confidence: 1,
    uncertain: false,
    evidence: [...classification.evidence, 'Corrected by the learner.'],
    learnerCorrected: true
  };
}

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return 'undefined';
  const nearest = Math.round(value);
  if (Math.abs(value - nearest) < 1e-8) return String(nearest);
  return String(round3(value));
}

/** Reads the checked value from "x = 1.5. …" without stopping at the decimal point. */
export function verifiedLinearSolution(item: string): string | null {
  const match = /^x = (-?\d+(?:\.\d+)?)\./.exec(item.trim());
  return match ? match[1] : null;
}

export interface LinearSolution {
  expression: string;
  steps: ExplanationStep[];
  solution: string;
  check: string;
  coefficient: number;
  constant: number;
  right: number;
  isolated: number;
}

export interface PracticeKey {
  id: string;
  correctOptionIndex: number;
  correctFeedback: string;
  relatedStepIndex: number;
  conceptId: string;
  stage: PracticeStage;
}

export interface ComposedMaterial {
  explanation: MaterialExplanation;
  keys: PracticeKey[];
}

const WRONG_PRACTICE_FEEDBACK =
  'That choice does not match this step. Try again, ask for a hint, or review the related step. This note does not give the answer.';

function exposesSolvedValue(text: string, solution: string): boolean {
  const escaped = solution.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return (
    text.trim() === solution ||
    new RegExp(`x\\s*=\\s*${escaped}(?![\\d.])`, 'i').test(text) ||
    new RegExp(`x\\s+is\\s+${escaped}(?![\\d.])`, 'i').test(text)
  );
}

function placeCorrect(
  correct: string,
  distractors: string[],
  index: number
): { options: string[]; correctOptionIndex: number } | null {
  const pool: string[] = [];
  for (const item of distractors) {
    if (item === correct || pool.includes(item)) continue;
    pool.push(item);
  }
  if (pool.length < 3) return null;
  const options = pool.slice(0, 3);
  const at = Math.min(Math.max(index, 0), 3);
  options.splice(at, 0, correct);
  return { options, correctOptionIndex: at };
}

function hintGivesOption(hint: string, option: string): boolean {
  const escaped = option.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (option.length <= 3) return new RegExp(`(^|[^A-Za-z0-9])${escaped}([^A-Za-z0-9]|$)`, 'i').test(hint);
  return hint.toLowerCase().includes(option.toLowerCase());
}

function keyedPractice(input: {
  id: string;
  conceptId: string;
  prompt: string;
  options: string[];
  correctOptionIndex: number;
  hint: string | null;
  source: PracticeQuestion['source'];
  relatedStepIndex: number;
  stage: PracticeStage;
  correctFeedback: string;
  challenge?: boolean;
}): { prompt: PracticeQuestion; key: PracticeKey } | null {
  if (input.correctOptionIndex < 0 || input.correctOptionIndex >= input.options.length) return null;
  const correctText = input.options[input.correctOptionIndex];
  if (hintGivesOption(WRONG_PRACTICE_FEEDBACK, correctText)) return null;
  if (input.hint && hintGivesOption(input.hint, correctText)) return null;
  return {
    prompt: {
      id: input.id,
      conceptId: input.conceptId,
      prompt: input.prompt,
      options: input.options,
      hint: input.hint,
      challenge: input.challenge === true,
      source: input.source,
      relatedStepIndex: input.relatedStepIndex,
      stage: input.stage
    },
    key: {
      id: input.id,
      correctOptionIndex: input.correctOptionIndex,
      correctFeedback: input.correctFeedback,
      relatedStepIndex: input.relatedStepIndex,
      conceptId: input.conceptId,
      stage: input.stage
    }
  };
}

function linearPlainLanguage(solved: LinearSolution): string {
  const undo =
    solved.constant > 0
      ? `Undo the added ${formatNumber(solved.constant)} first. Subtract ${formatNumber(solved.constant)} from both sides.`
      : `Undo the subtracted ${formatNumber(Math.abs(solved.constant))} first. Add ${formatNumber(Math.abs(solved.constant))} to both sides.`;
  return [
    `${solved.expression} means both sides are equal.`,
    'An equation says two amounts match.',
    'The letter x is a variable.',
    'A variable stands for a number you do not know yet.',
    'The number in front of x is the coefficient.',
    undo,
    'Then divide both sides by the coefficient.',
    `x is ${solved.solution}.`,
    'Check by putting that value back into the original equation.'
  ].join(' ');
}

function linearPractice(solved: LinearSolution): Array<{ prompt: PracticeQuestion; key: PracticeKey }> {
  const coeff = formatNumber(solved.coefficient);
  const absCoeff = formatNumber(Math.abs(solved.coefficient));
  const magnitude = formatNumber(Math.abs(solved.constant));
  const coeffWords = absCoeff === solved.solution ? 'the coefficient' : absCoeff;
  const signedCoeffWords = coeff === solved.solution ? 'the coefficient' : coeff;
  const undo = solved.constant > 0 ? `Subtract ${magnitude}` : `Add ${magnitude}`;
  const undoBoth = solved.constant > 0 ? `Subtract ${magnitude} from both sides` : `Add ${magnitude} to both sides`;
  const opposite = solved.constant > 0 ? `Add ${magnitude} to both sides` : `Subtract ${magnitude} from both sides`;
  const leftOnly = solved.constant > 0 ? `Subtract ${magnitude} from the left side only` : `Add ${magnitude} to the left side only`;
  const undoIndex = solved.steps.findIndex((step) => /^Subtract |^Add /.test(step.title));
  const isolateIndex = solved.steps.findIndex((step) => step.title.startsWith('Divide both sides'));
  const checkIndex = solved.steps.findIndex((step) => step.title.startsWith('Substitute'));
  const stepAt = (index: number) => (index >= 0 ? index : 0);
  const items: Array<{ prompt: PracticeQuestion; key: PracticeKey }> = [];
  const push = (item: { prompt: PracticeQuestion; key: PracticeKey } | null) => {
    if (item) items.push(item);
  };

  const undoPlaced = placeCorrect(
    undo,
    [`Divide by ${coeffWords}`, solved.constant > 0 ? `Add ${magnitude}` : `Subtract ${magnitude}`, `Multiply by ${coeffWords}`],
    0
  );
  if (undoPlaced && !undoPlaced.options.some((option) => option === solved.solution || exposesSolvedValue(option, solved.solution))) {
    push(
      keyedPractice({
        id: 'linear-undo',
        conceptId: 'linear-equation',
        prompt: `Which operation should be undone first in ${solved.expression}?`,
        hint: 'Undo the number that is added or subtracted before you divide.',
        source: 'verified',
        relatedStepIndex: 0,
        stage: 'undo',
        correctFeedback: 'That is the operation to undo first.',
        ...undoPlaced
      })
    );
  }

  const bothPlaced = placeCorrect(undoBoth, [opposite, leftOnly, `Divide both sides by ${coeffWords}`], 1);
  if (bothPlaced && !bothPlaced.options.some((option) => option === solved.solution || exposesSolvedValue(option, solved.solution))) {
    push(
      keyedPractice({
        id: 'linear-both-sides',
        conceptId: 'linear-equation',
        prompt: 'What should you do to both sides to undo that operation?',
        hint: 'The same change has to happen on both sides.',
        source: 'verified',
        relatedStepIndex: stepAt(undoIndex),
        stage: 'both-sides',
        correctFeedback: 'That change keeps both sides equal.',
        ...bothPlaced
      })
    );
  }

  const intermediate = `${coeff}x = ${formatNumber(solved.isolated)}`;
  const intermediatePlaced = placeCorrect(
    intermediate,
    [
      `${coeff}x = ${formatNumber(solved.right)}`,
      `${coeff}x = ${formatNumber(solved.right + Math.abs(solved.constant))}`,
      `x = ${formatNumber(solved.isolated)}`
    ],
    2
  );
  if (
    intermediatePlaced &&
    !exposesSolvedValue(intermediate, solved.solution) &&
    !intermediatePlaced.options.some((option) => option === solved.solution || exposesSolvedValue(option, solved.solution))
  ) {
    push(
      keyedPractice({
        id: 'linear-intermediate',
        conceptId: 'linear-equation',
        prompt: 'Which equation matches the result of that first undo?',
        hint: 'Apply only that first undo. Do not divide yet.',
        source: 'verified',
        relatedStepIndex: stepAt(undoIndex),
        stage: 'intermediate',
        correctFeedback: 'That equation matches the result of the first undo.',
        ...intermediatePlaced
      })
    );
  }

  const isolatePlaced = placeCorrect(
    `Divide both sides by ${signedCoeffWords}`,
    [
      `Subtract ${coeffWords} from both sides`,
      `Multiply both sides by ${signedCoeffWords}`,
      `Divide only the left side by ${signedCoeffWords}`
    ],
    0
  );
  if (isolatePlaced && !isolatePlaced.options.some((option) => option === solved.solution || exposesSolvedValue(option, solved.solution))) {
    push(
      keyedPractice({
        id: 'linear-isolate',
        conceptId: 'linear-equation',
        prompt: 'What isolates x on the left side?',
        hint: 'The number in front of x is the coefficient. Undo it on both sides.',
        source: 'verified',
        relatedStepIndex: stepAt(isolateIndex),
        stage: 'isolate',
        correctFeedback: 'That isolates x.',
        ...isolatePlaced
      })
    );
  }

  const checkPlaced = placeCorrect(
    solved.solution,
    [
      formatNumber(Number(solved.solution) + solved.coefficient),
      formatNumber(solved.isolated),
      formatNumber(solved.right),
      formatNumber(Number(solved.solution) + 1),
      formatNumber(Number(solved.solution) - 1),
      formatNumber(solved.constant)
    ],
    2
  );
  if (checkPlaced && !exposesSolvedValue(`Which value of x makes ${solved.expression} true when you substitute it?`, solved.solution)) {
    push(
      keyedPractice({
        id: 'linear-check',
        conceptId: 'linear-equation',
        prompt: `Which value of x makes ${solved.expression} true when you substitute it?`,
        hint: 'Substitute each value for x and compare the two sides. This hint does not name the value.',
        source: 'verified',
        relatedStepIndex: stepAt(checkIndex),
        stage: 'check',
        correctFeedback: `Substituting x = ${solved.solution} satisfies the equation: ${solved.check}.`,
        ...checkPlaced
      })
    );
  }

  return items;
}

export function solveLinearEquation(text: string): LinearSolution | null {
  if (/x\s*[\^²³]|x\s*\*\*/i.test(text)) return null;
  const matches = [...text.matchAll(/(-?\d*)\s*x\s*([+-])\s*(\d+(?:\.\d+)?)\s*=\s*(-?\d+(?:\.\d+)?)/gi)];
  if (matches.length !== 1) return null;
  const match = matches[0];
  const coeffRaw = match[1];
  const sign = match[2];
  const magnitude = Number(match[3]);
  const right = Number(match[4]);
  let coefficient: number;
  if (coeffRaw === '' || coeffRaw === '+') coefficient = 1;
  else if (coeffRaw === '-') coefficient = -1;
  else coefficient = Number(coeffRaw);
  if (!Number.isFinite(coefficient) || coefficient === 0 || !Number.isFinite(magnitude) || !Number.isFinite(right)) return null;
  const constant = sign === '-' ? -magnitude : magnitude;
  const isolated = right - constant;
  const solution = isolated / coefficient;
  if (!Number.isFinite(solution)) return null;
  if (Math.abs(coefficient * solution + constant - right) > 1e-6) return null;
  const expression = match[0].replace(/\s+/g, ' ');
  const steps: ExplanationStep[] = [
    { index: 0, title: 'Keep the original equation', detail: expression, verified: true }
  ];
  if (constant > 0) {
    steps.push({
      index: steps.length,
      title: `Subtract ${formatNumber(constant)} from both sides`,
      detail: `${formatNumber(coefficient)}x = ${formatNumber(isolated)}`,
      verified: true
    });
  } else if (constant < 0) {
    steps.push({
      index: steps.length,
      title: `Add ${formatNumber(Math.abs(constant))} to both sides`,
      detail: `${formatNumber(coefficient)}x = ${formatNumber(isolated)}`,
      verified: true
    });
  }
  steps.push({
    index: steps.length,
    title: coefficient < 0 ? `Divide both sides by ${formatNumber(coefficient)}` : `Divide both sides by ${formatNumber(coefficient)}`,
    detail: `x = ${formatNumber(solution)}`,
    verified: true
  });
  const check = `${formatNumber(coefficient)}(${formatNumber(solution)}) + (${formatNumber(constant)}) = ${formatNumber(right)}`;
  steps.push({ index: steps.length, title: 'Substitute the result back', detail: check, verified: true });
  return {
    expression,
    steps,
    solution: formatNumber(solution),
    check,
    coefficient,
    constant,
    right,
    isolated
  };
}

export function verifyLinearSolution(text: string): { solution: string; residualOk: boolean } | null {
  const solved = solveLinearEquation(text);
  if (!solved) return null;
  const residual = solved.coefficient * Number(solved.solution) + solved.constant - solved.right;
  return { solution: solved.solution, residualOk: Number.isFinite(residual) && Math.abs(residual) < 1e-6 };
}

export function solveArithmetic(text: string): { expression: string; steps: ExplanationStep[]; solution: string } | null {
  const match = text.match(/(\d+(?:\.\d+)?(?:\s*[+\-*/]\s*\d+(?:\.\d+)?)+)/);
  if (!match) return null;
  const expression = match[1];
  if (/x/i.test(expression)) return null;
  const compact = expression.replace(/\s+/g, '');
  const tokens = compact.match(/\d+(?:\.\d+)?|[+\-*/]/g);
  if (!tokens || tokens.join('') !== compact) return null;
  const steps: ExplanationStep[] = [];
  let current = [...tokens];
  const reduce = (ops: string[]) => {
    for (let i = 1; i < current.length - 1; i += 2) {
      if (!ops.includes(current[i])) continue;
      const left = Number(current[i - 1]);
      const right = Number(current[i + 1]);
      if (current[i] === '/' && right === 0) return 'zero' as const;
      const value =
        current[i] === '*' ? left * right : current[i] === '/' ? left / right : current[i] === '+' ? left + right : left - right;
      if (!Number.isFinite(value)) return 'bad' as const;
      steps.push({
        index: steps.length,
        title: 'Apply one operation',
        detail: `${formatNumber(left)} ${current[i]} ${formatNumber(right)} = ${formatNumber(value)}`,
        verified: true
      });
      current.splice(i - 1, 3, formatNumber(value));
      return 'again' as const;
    }
    return 'done' as const;
  };
  for (let guard = 0; guard < 12; guard += 1) {
    const outcome = current.some((token) => token === '*' || token === '/') ? reduce(['*', '/']) : reduce(['+', '-']);
    if (outcome === 'zero' || outcome === 'bad') return null;
    if (outcome === 'done') break;
  }
  if (current.length !== 1) return null;
  const solution = current[0];
  return { expression, steps, solution };
}

interface AtomCount {
  [element: string]: number;
}

function parseFormula(raw: string): AtomCount | null {
  if (!/^([A-Z][a-z]?\d*)+$/.test(raw)) return null;
  const atoms: AtomCount = {};
  const pattern = /([A-Z][a-z]?)(\d*)/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(raw))) {
    atoms[match[1]] = (atoms[match[1]] ?? 0) + (match[2] ? Number(match[2]) : 1);
  }
  return atoms;
}

function scaleAtoms(formula: AtomCount, coefficient: number): AtomCount {
  const next: AtomCount = {};
  for (const [element, count] of Object.entries(formula)) next[element] = count * coefficient;
  return next;
}

function addAtoms(left: AtomCount, right: AtomCount): AtomCount {
  const next = { ...left };
  for (const [element, count] of Object.entries(right)) next[element] = (next[element] ?? 0) + count;
  return next;
}

function sameAtoms(left: AtomCount, right: AtomCount): boolean {
  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
  for (const key of keys) if ((left[key] ?? 0) !== (right[key] ?? 0)) return false;
  return true;
}

export function balanceReaction(text: string): { original: string; balanced: string; verified: boolean; steps: ExplanationStep[] } | null {
  const match = text.match(/((?:(?:[A-Z][a-z]?\d*)+)(?:\s*\+\s*(?:[A-Z][a-z]?\d*)+)*)\s*(?:->|→)\s*((?:(?:[A-Z][a-z]?\d*)+)(?:\s*\+\s*(?:[A-Z][a-z]?\d*)+)*)/);
  if (!match) return null;
  const reactantRaw = match[1].split('+').map((part) => part.trim());
  const productRaw = match[2].split('+').map((part) => part.trim());
  const reactants = reactantRaw.map(parseFormula);
  const products = productRaw.map(parseFormula);
  if (reactants.some((item) => !item) || products.some((item) => !item)) return null;
  const original = `${reactantRaw.join(' + ')} -> ${productRaw.join(' + ')}`;
  const limits = reactantRaw.length + productRaw.length <= 4 ? 4 : 2;
  let found: number[] | null = null;
  const walk = (index: number, coeffs: number[]) => {
    if (found) return;
    if (index === reactantRaw.length + productRaw.length) {
      const left = reactantRaw.reduce<AtomCount>(
        (sum, _formula, formulaIndex) => addAtoms(sum, scaleAtoms(reactants[formulaIndex] as AtomCount, coeffs[formulaIndex])),
        {}
      );
      const right = productRaw.reduce<AtomCount>(
        (sum, _formula, formulaIndex) =>
          addAtoms(sum, scaleAtoms(products[formulaIndex] as AtomCount, coeffs[reactantRaw.length + formulaIndex])),
        {}
      );
      if (sameAtoms(left, right)) found = [...coeffs];
      return;
    }
    for (let coefficient = 1; coefficient <= limits; coefficient += 1) {
      coeffs[index] = coefficient;
      walk(index + 1, coeffs);
    }
  };
  walk(0, []);
  if (!found) return null;
  const balanced = `${reactantRaw.map((formula, index) => `${found?.[index]} ${formula}`).join(' + ')} -> ${productRaw
    .map((formula, index) => `${found?.[reactantRaw.length + index]} ${formula}`)
    .join(' + ')}`;
  return {
    original,
    balanced,
    verified: true,
    steps: [
      { index: 0, title: 'Read the reaction as written', detail: original, verified: true },
      {
        index: 1,
        title: 'Check atom counts with whole-number coefficients',
        detail: balanced,
        verified: true
      }
    ]
  };
}

export function traceSafeAccumulator(text: string): { result: number; steps: ExplanationStep[] } | null {
  const fn = text.match(/def\s+([A-Za-z_]\w*)\s*\((\w*)\)\s*:\s*result\s*=\s*0\s*for\s+(\w+)\s+in\s+\2\s*:\s*result\s*=\s*result\s*\+\s*\3\s*return\s+result/);
  if (!fn) return null;
  const param = fn[2];
  const list = text.match(new RegExp(`${param}\\s*=\\s*\\[([^\\]]+)\\]`));
  if (!list) return null;
  const numbers = list[1].split(',').map((part) => Number(part.trim()));
  if (numbers.some((value) => !Number.isFinite(value))) return null;
  let result = 0;
  const steps: ExplanationStep[] = [
    { index: 0, title: 'Start the total at 0', detail: 'result = 0. The function was traced on these numbers. Python was not asked to run the file.', verified: true }
  ];
  numbers.forEach((value, index) => {
    result += value;
    steps.push({
      index: steps.length,
      title: `Add item ${index + 1}`,
      detail: `result = ${formatNumber(result)}`,
      verified: true
    });
  });
  return { result, steps };
}

const ERROR_NOTES: Array<[RegExp, string]> = [
  [/SyntaxError/i, 'A SyntaxError means the text does not follow the language rules. ConceptLens did not run it.'],
  [/IndentationError/i, 'An IndentationError means the code blocks are not lined up in the way that language expects.'],
  [/TypeError/i, 'A TypeError means a value was used in a way that does not match its type.'],
  [/NameError|ReferenceError/i, 'This error means a name was used before it was defined in that scope.'],
  [/ZeroDivisionError/i, 'This error means a calculation tried to divide by zero.']
];

function glossaryFor(text: string): { term: string; meaning: string }[] {
  const lower = text.toLowerCase();
  return Object.entries(GLOSSARY)
    .filter(([term]) => lower.includes(term))
    .map(([term, meaning]) => ({ term, meaning }));
}

function sentencesOf(text: string): string[] {
  const parts = text
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : [text.trim()];
}

function yearsIn(text: string): number[] {
  return [...new Set((text.match(/\b(1[0-9]{3}|20[0-9]{2})\b/g) ?? []).map(Number))].sort((a, b) => a - b);
}

function explainLens(text: string): { steps: ExplanationStep[]; verified: string[]; diagram: string | null } | null {
  if (!/1\s*\/\s*f\s*=\s*1\s*\/\s*v\s*-\s*1\s*\/\s*u/i.test(text)) return null;
  const focal = text.match(/\bf\s*=\s*([+-]?\d+(?:\.\d+)?)\s*cm/i);
  const objectDistance = text.match(/\bu\s*=\s*([+-]?\d+(?:\.\d+)?)\s*cm/i);
  const diagram = (text.match(/(?:figure|diagram)[^.]*\./i) ?? [])[0] ?? null;
  if (!focal || !objectDistance) {
    return {
      steps: [
        {
          index: 0,
          title: 'Read the formula',
          detail: '1/f = 1/v - 1/u. f is focal length, v is image distance, and u is object distance. A number was not calculated because both signed values were not in the source.',
          verified: false
        }
      ],
      verified: [],
      diagram
    };
  }
  const f = Number(focal[1]);
  const u = Number(objectDistance[1]);
  if (f === 0 || !Number.isFinite(f) || !Number.isFinite(u)) return null;
  const inverse = 1 / f + 1 / u;
  if (inverse === 0) return null;
  const imageDistance = 1 / inverse;
  const check = 1 / imageDistance - 1 / u;
  if (Math.abs(check - 1 / f) > 1e-6) return null;
  return {
    steps: [
      { index: 0, title: 'Name the quantities in the source', detail: `f = ${f} cm, u = ${u} cm. Units are centimetres.`, verified: true },
      {
        index: 1,
        title: 'Rearrange the written formula',
        detail: 'From 1/f = 1/v - 1/u, 1/v = 1/f + 1/u.',
        verified: true
      },
      {
        index: 2,
        title: 'Calculate the image distance',
        detail: `v = ${formatNumber(imageDistance)} cm. Substitution checks 1/f against 1/v - 1/u.`,
        verified: true
      }
    ],
    verified: [`Image distance v = ${formatNumber(imageDistance)} cm, using the signs written in the source.`],
    diagram
  };
}

export function lensDistanceStatement(text: string): string | null {
  return explainLens(text)?.verified[0] ?? null;
}

function plainFrom(paragraphs: string[]): string | null {
  const joined = paragraphs.join(' ');
  if (!joined) return null;
  return joined
    .replace(/\bmitochondria\b/gi, 'mitochondria (the cell parts that release usable energy)')
    .replace(/\bnucleus\b/gi, 'nucleus (the cell part that holds DNA)');
}

export function composeMaterial(input: {
  text: string;
  sourceKind: MaterialSourceKind;
  sampleId?: string | null;
  subjectOverride?: SubjectId | null;
  contentTypeOverride?: ContentTypeId | null;
}): ComposedMaterial {
  const cleaned = input.text.replace(/\0/g, '').trim().slice(0, 20000);
  const instructionLike = INSTRUCTION.test(cleaned);
  const base = classifyLearningText(cleaned);
  const classification = applyLearnerCorrection(base, {
    subject: input.subjectOverride,
    contentType: input.contentTypeOverride
  });
  const sample = input.sampleId ? sampleById(input.sampleId) : null;
  const subject = classification.subject;
  const steps: ExplanationStep[] = [];
  const verified: string[] = [];
  const interpretation: string[] = [];
  const limitations: string[] = [
    'Extracted or typed source text is untrusted lesson material. It is not an instruction to the application.'
  ];
  let mainConcept = 'This passage';
  let objective = 'Understand the source in the form you selected.';
  let everyday: string | null = null;
  let diagram: string | null = null;
  const practice: PracticeQuestion[] = [];
  const practiceKeys: PracticeKey[] = [];
  const addPractice = (item: { prompt: PracticeQuestion; key: PracticeKey } | null) => {
    if (!item) return;
    practice.push(item.prompt);
    practiceKeys.push(item.key);
  };
  const sections: MaterialExplanation['sections'] = [];
  let plainRewrite: string | null = null;
  let biologyMatched = false;

  if (instructionLike) {
    interpretation.push('Sentences that look like requests to override instructions were kept as lesson text.');
  }

  const linear = subject === 'mathematics' || subject === 'unknown' ? solveLinearEquation(cleaned) : solveLinearEquation(cleaned);
  const arithmetic = linear ? null : solveArithmetic(cleaned);
  const reaction = balanceReaction(cleaned);
  const lens = explainLens(cleaned);
  const traced = traceSafeAccumulator(cleaned);
  const errorNote = ERROR_NOTES.find(([pattern]) => pattern.test(cleaned))?.[1] ?? null;

  if (linear && (subject === 'mathematics' || input.subjectOverride === 'mathematics' || /\d+\s*x/i.test(cleaned))) {
    mainConcept = `Equation ${linear.expression}`;
    objective = 'See each operation, then check the result in the original equation.';
    steps.push(...linear.steps);
    verified.push(`x = ${linear.solution}. ${linear.check}`);
    everyday = 'Analogy, not part of the source: this works like a balance scale. The same change on both sides keeps both sides equal.';
    plainRewrite = linearPlainLanguage(linear);
    sections.push({
      id: 'equation',
      title: 'Original equation',
      paragraphs: [`The source writes ${linear.expression}. The solution is a value of x, not the equation itself.`]
    });
    linearPractice(linear).forEach((item) => addPractice(item));
  } else if (arithmetic && subject === 'mathematics') {
    mainConcept = `Expression ${arithmetic.expression}`;
    objective = 'Follow the operations in order and check the running result.';
    steps.push(...arithmetic.steps);
    verified.push(`${arithmetic.expression} = ${arithmetic.solution}`);
    plainRewrite = `${arithmetic.expression} is a calculation. Do multiplication and division before addition and subtraction. The value is ${arithmetic.solution}.`;
    sections.push({
      id: 'arithmetic',
      title: 'Original expression',
      paragraphs: [`${arithmetic.expression} is an expression. ${arithmetic.solution} is the value after the operations.`]
    });
  }

  if (lens && (subject === 'physics' || /lens|focal/i.test(cleaned))) {
    mainConcept = 'Thin lens relationship';
    objective = 'Name f, u, and v, keep the written units, and use only the signs in the source.';
    if (steps.length === 0) steps.push(...lens.steps);
    verified.push(...lens.verified);
    diagram = lens.diagram ?? 'The source mentions a figure. No image was extracted from a file.';
    const distance = lens.verified[0];
    plainRewrite = distance
      ? `The page gives a lens formula. f is the focus distance. u is the object distance. v is the picture distance. ${distance}`
      : 'The page gives a lens formula. f is the focus distance. u is the object distance. v is the picture distance. Both signed values were not in the source, so no picture distance was calculated.';
    sections.push({
      id: 'lens',
      title: 'Formula and quantities',
      paragraphs: [
        'The formula in the source is 1/f = 1/v - 1/u. f is focal length, v is image distance, and u is object distance.',
        'The thin-lens assumption is only used when the source states it.'
      ]
    });
    if (lens.verified.length > 0) {
      addPractice(
        keyedPractice({
          id: 'physics-quantity',
          conceptId: 'focal-length',
          prompt: 'Which symbol is the focal length in the written formula?',
          options: ['u', 'f', 'v', 'cm'],
          correctOptionIndex: 1,
          hint: 'Look at the symbol that starts the written formula.',
          source: 'extracted',
          relatedStepIndex: 0,
          stage: 'recall',
          correctFeedback: 'The source uses f for focal length, u for object distance, and v for image distance.'
        })
      );
    }
  }

  if (reaction && (subject === 'chemistry' || /->|→/.test(cleaned))) {
    mainConcept = 'Chemical reaction';
    objective = 'Keep the formulas as written and check whether the atom counts match.';
    steps.push(...reaction.steps);
    verified.push(`Balanced form with counted atoms: ${reaction.balanced}`);
    limitations.push('No experimental steps or safety instructions were added.');
    sections.push({
      id: 'reaction',
      title: 'Reaction as written',
      paragraphs: [
        `Reactants are on the left of the arrow and products are on the right. Original: ${reaction.original}.`,
        `A whole-number balance that matches atom counts is ${reaction.balanced}.`
      ]
    });
  }

  if (traced) {
    mainConcept = 'A function that adds a list';
    objective = 'Walk the loop one value at a time without running the uploaded file.';
    if (steps.length === 0) steps.push(...traced.steps);
    verified.push(`The limited tracer gets ${traced.result}. The file was not executed.`);
    everyday = 'Analogy: this is a running total, the way you add prices on a receipt.';
    plainRewrite = `Start at 0. Add each listed number. The running total is ${traced.result}. The file was not run.`;
    sections.push({
      id: 'code',
      title: 'What the function does',
      paragraphs: [
        'total starts result at 0, then adds each value in the list, then returns result.',
        'ConceptLens did not execute this code. A small tracer only accepts this add-a-list pattern.'
      ]
    });
    addPractice(
      keyedPractice({
        id: 'code-total',
        conceptId: 'accumulator',
        prompt: 'What running total does the tracer get for the listed numbers?',
        options: ['0', String(traced.result), String(traced.result + 1), 'The code was executed by Python'],
        correctOptionIndex: 1,
        hint: 'Start at 0 and add one number at a time.',
        source: 'verified',
        relatedStepIndex: 0,
        stage: 'recall',
        correctFeedback: `Adding the listed numbers in order gives ${traced.result}. The file was not executed.`
      })
    );
  } else if (subject === 'computer_science') {
    mainConcept = errorNote ? 'An error message' : 'Code in the source';
    objective = 'Read the structure of the code. Do not treat it as something the app has run.';
    const lines = cleaned.split(/\r?\n/).filter((line) => line.trim()).slice(0, 12);
    lines.forEach((line, index) => {
      steps.push({
        index,
        title: `Line ${index + 1}`,
        detail: line.trim().slice(0, 240),
        verified: false
      });
    });
    if (errorNote) interpretation.push(errorNote);
    limitations.push('Uploaded code is untrusted and was not executed.');
    sections.push({
      id: 'code-structure',
      title: 'Code as text',
      paragraphs: [
        errorNote ?? 'The lines below are copied from the source so you can read them one at a time.',
        'Names, loops, and return lines are structure. They are not a result from running the program.'
      ]
    });
  }

  if (subject === 'biology') {
    const facts: Array<{ plain: string; verified: string }> = [];
    if (/nucleus/i.test(cleaned) && /\bdna\b/i.test(cleaned)) {
      facts.push({
        plain: 'The nucleus holds DNA.',
        verified: 'The source says the nucleus stores DNA.'
      });
    }
    if (/mitochondria/i.test(cleaned) && /energy/i.test(cleaned)) {
      facts.push({
        plain: 'Mitochondria release energy.',
        verified: 'The source says mitochondria release energy the cell can use.'
      });
    }
    if (/chloroplast/i.test(cleaned) && /\b(light|photosynthesis)\b/i.test(cleaned)) {
      facts.push({
        plain: 'Chloroplasts capture light.',
        verified: 'The source says chloroplasts capture light.'
      });
    }
    biologyMatched = facts.length > 0;
    facts.forEach((fact) => verified.push(fact.verified));
    if (biologyMatched) {
      plainRewrite = `${facts.map((fact) => fact.plain).join(' ')} That is what the source says.`;
    }
    mainConcept = /mitochondria/i.test(cleaned) ? 'Cell structures in the source' : 'Biology notes';
    objective = 'Keep the structures named in the source tied to the jobs the source gives them.';
    diagram = /diagram|figure|labeled/i.test(cleaned) ? sentencesOf(cleaned).find((sentence) => /diagram|labeled/i.test(sentence)) ?? null : null;
    sections.push({
      id: 'biology',
      title: 'What the source names',
      paragraphs: sentencesOf(cleaned).slice(0, 4)
    });
    if (/nucleus/i.test(cleaned) && /dna/i.test(cleaned)) {
      addPractice(
        keyedPractice({
          id: 'bio-nucleus',
          conceptId: 'nucleus',
          prompt: 'Which structure does the source say stores DNA?',
          options: ['Mitochondria', 'Nucleus', 'The diagram frame', 'A structure the source does not name'],
          correctOptionIndex: 1,
          hint: 'Look for the sentence about DNA.',
          source: 'sample',
          relatedStepIndex: 0,
          stage: 'recall',
          correctFeedback: 'The source says the nucleus stores DNA. That statement is copied from the source, not measured from a photograph.'
        })
      );
    }
    if (sample?.linkedLessonId === 'human_cell') {
      interpretation.push('The curated animal-cell lesson has the same structures. This sample is not an OCR reading.');
    }
  }

  if (subject === 'history') {
    const years = yearsIn(cleaned);
    mainConcept = years.length > 1 ? 'Years written in the source' : 'History notes';
    objective = 'Keep the order of the years that are actually written down.';
    years.forEach((year, index) => {
      const sentence = sentencesOf(cleaned).find((item) => item.includes(String(year))) ?? String(year);
      steps.push({ index, title: String(year), detail: sentence, verified: false });
    });
    verified.push(years.length ? `Years copied from the source, in order: ${years.join(', ')}.` : 'No year was found in the source.');
    interpretation.push('The order is the order of the years in the text. It was not checked against an outside reference.');
    sections.push({ id: 'history', title: 'Chronology from the source', paragraphs: sentencesOf(cleaned).slice(0, 4) });
  }

  if (subject === 'geography') {
    mainConcept = 'Place description';
    objective = 'Separate location words in the source from any map that was not supplied.';
    diagram = /\bmap\b/i.test(cleaned) ? 'The source mentions a map. No map image was extracted.' : null;
    limitations.push('Coordinates are shown only when they are written in the source.');
    sections.push({ id: 'geography', title: 'Location words', paragraphs: sentencesOf(cleaned).slice(0, 4) });
  }

  if (subject === 'literature') {
    mainConcept = 'Passage';
    objective = 'Use the stored meanings for words that appear, and keep the source sentences available.';
    const copied = sentencesOf(cleaned).slice(0, 2);
    sections.push({
      id: 'literature',
      title: 'Sentences from the source',
      paragraphs: copied.length ? copied : [cleaned.slice(0, 400)]
    });
    interpretation.push('The short selection is copied from the source. It is not a generated paraphrase.');
  }

  if (sections.length === 0) {
    mainConcept = classification.uncertain ? 'Unclassified notes' : 'Source notes';
    objective = 'Read the source in shorter parts without adding facts that are not written there.';
    sections.push({
      id: 'source',
      title: 'Source text',
      paragraphs: sentencesOf(cleaned).slice(0, 5)
    });
    limitations.push('This source was split into sentences. Extra facts were not added.');
  }

  if (steps.length === 0) {
    sentencesOf(cleaned)
      .slice(0, 4)
      .forEach((sentence, index) => {
        steps.push({ index, title: `Part ${index + 1}`, detail: sentence, verified: false });
      });
  }

  const plainSource = sections.flatMap((section) => section.paragraphs).join(' ');
  const expanded = plainFrom([plainSource]);
  const plainLanguage = plainRewrite ?? (expanded && expanded !== plainSource ? expanded : null);
  const strategyMatched =
    (subject === 'mathematics' && Boolean(linear || arithmetic)) ||
    (subject === 'physics' && Boolean(lens)) ||
    (subject === 'chemistry' && Boolean(reaction)) ||
    (subject === 'computer_science' && Boolean(traced)) ||
    (subject === 'biology' && biologyMatched);
  const solvingStrategy = strategyReport(subject, strategyMatched);
  if (classification.uncertain) {
    limitations.push('The subject is a keyword estimate. Correct it if it is wrong.');
  }
  limitations.push(
    solvingStrategy.specialized
      ? solvingStrategy.matched
        ? `Solver: ${solvingStrategy.label}. ${solvingStrategy.scope}`
        : `A solver exists for this subject: ${solvingStrategy.label}. This text did not match it. ${solvingStrategy.scope}`
      : `No specialized solver for this subject. ${solvingStrategy.scope}`
  );
  if (input.sourceKind === 'image_ocr' || input.sourceKind === 'scanned_pdf') {
    limitations.push('This text started as a local reading of a page. Handwriting is often weak. The explanation uses the text you confirmed.');
  } else {
    limitations.push('This explanation was built from text.');
  }
  limitations.push('Preferences change presentation. They are not a diagnosis, and performance is not used to infer a disability.');

  const sourceLabel =
    sample
      ? sample.label
      : input.sourceKind === 'pdf_text_layer'
        ? 'PDF text layer'
        : input.sourceKind === 'image_ocr'
          ? 'Photograph reading'
          : input.sourceKind === 'scanned_pdf'
            ? 'Scanned PDF reading'
            : 'Submitted text';
  const extractionNote =
    input.sourceKind === 'sample'
      ? 'Curated sample content. This is not a reading of an uploaded file.'
      : input.sourceKind === 'pdf_text_layer'
        ? 'Text was taken from literal strings in the PDF text layer. Pictures inside the PDF were not read.'
        : input.sourceKind === 'image_ocr'
          ? 'This text was read from a photograph on this server, then confirmed or edited.'
          : input.sourceKind === 'scanned_pdf'
            ? 'This text was read from a scanned PDF page on this server, then confirmed or edited.'
            : 'This is text supplied by the learner.';

  const explanation: MaterialExplanation = {
    sourceContent: cleaned,
    sourceKind: input.sourceKind,
    sampleId: sample?.id ?? null,
    demo: Boolean(sample),
    extracted: input.sourceKind !== 'sample',
    extractionStatus: input.sourceKind === 'sample' ? 'sample' : input.sourceKind === 'pdf_text_layer' || input.sourceKind === 'image_ocr' || input.sourceKind === 'scanned_pdf' ? 'extracted' : 'learner_supplied',
    extractionNote,
    subject,
    subjectConfidence: classification.confidence,
    subjectUncertain: classification.uncertain,
    subjectEvidence: classification.evidence,
    learnerCorrectedSubject: classification.learnerCorrected,
    contentType: classification.contentType,
    contentTypeUncertain: classification.uncertain,
    solvingStrategy,
    mainConcept,
    learningObjective: objective,
    sections,
    plainLanguage,
    steps,
    everydayExample: everyday,
    diagramDescription: diagram,
    practice,
    sourceReferences: [
      {
        label: sourceLabel,
        location: sample ? `Curated sample ${sample.id}` : `Characters 1–${cleaned.length} of the submitted text`
      }
    ],
    uncertaintyNotes: classification.uncertain ? ['Subject and content type are uncertain.'] : [],
    verified,
    interpretation,
    limitations,
    glossary: glossaryFor(`${cleaned} ${plainLanguage ?? ''}`),
    linkedLessonId: sample?.linkedLessonId ?? null,
    instructionLike,
    codeExecuted: false,
    trainedModel: false,
    engine: 'deterministic-rules'
  };

  const parsed = MaterialExplanationSchema.safeParse(explanation);
  if (!parsed.success) {
    throw new Error('Explanation builder produced an invalid structure.');
  }
  return { explanation: parsed.data, keys: practiceKeys };
}

export function buildMaterialExplanation(input: {
  text: string;
  sourceKind: MaterialSourceKind;
  sampleId?: string | null;
  subjectOverride?: SubjectId | null;
  contentTypeOverride?: ContentTypeId | null;
}): MaterialExplanation {
  return composeMaterial(input).explanation;
}

export interface PracticeGrade {
  ok: true;
  correct: boolean;
  feedback: string;
  relatedStepIndex: number;
  conceptId: string;
  stage: PracticeStage;
  subject: SubjectId;
}

export function gradePracticeSubmission(input: {
  text: string;
  sourceKind: MaterialSourceKind;
  sampleId?: string | null;
  subjectOverride?: SubjectId | null;
  contentTypeOverride?: ContentTypeId | null;
  questionId: string;
  selectedIndex: number;
}): { ok: false; status: number; error: string } | PracticeGrade {
  let composed: ComposedMaterial;
  try {
    composed = composeMaterial({
      text: input.text,
      sourceKind: input.sourceKind,
      sampleId: input.sampleId,
      subjectOverride: input.subjectOverride,
      contentTypeOverride: input.contentTypeOverride
    });
  } catch {
    return { ok: false, status: 400, error: 'The question could not be rebuilt from the source text.' };
  }
  const prompt = composed.explanation.practice.find((item) => item.id === input.questionId);
  const key = composed.keys.find((item) => item.id === input.questionId);
  if (!prompt || !key) {
    return {
      ok: false,
      status: 422,
      error: 'This practice question is not supported for this material. No feedback was invented.'
    };
  }
  if (!Number.isInteger(input.selectedIndex) || input.selectedIndex < 0 || input.selectedIndex >= prompt.options.length) {
    return { ok: false, status: 400, error: 'That choice is not one of the options for this question.' };
  }
  const correct = input.selectedIndex === key.correctOptionIndex;
  return {
    ok: true,
    correct,
    feedback: correct ? key.correctFeedback : WRONG_PRACTICE_FEEDBACK,
    relatedStepIndex: key.relatedStepIndex,
    conceptId: key.conceptId,
    stage: key.stage,
    subject: composed.explanation.subject
  };
}

export function visiblePracticePrompts<T extends { id: string }>(prompts: T[], completedIds: readonly string[]): T[] {
  if (prompts.length === 0) return [];
  const current = prompts.find((prompt) => !completedIds.includes(prompt.id));
  return current ? [current] : [prompts[prompts.length - 1]];
}

export function practiceAllowsQuestion(prompts: readonly { id: string }[], completedIds: readonly string[], questionId: string): boolean {
  const current = prompts.find((prompt) => !completedIds.includes(prompt.id));
  if (current) return current.id === questionId;
  return prompts[prompts.length - 1]?.id === questionId;
}

export function learnerPracticeIsSeparated(prompts: readonly PracticeQuestion[], solution: string | null): boolean {
  return prompts.every((prompt) => {
    if ('correctOptionIndex' in prompt) return false;
    if (!solution) return true;
    if (exposesSolvedValue(prompt.prompt, solution) || exposesSolvedValue(prompt.hint ?? '', solution)) return false;
    if (prompt.stage === 'check' || prompt.stage === 'recall') return true;
    return prompt.options.every((option) => option !== solution && !exposesSolvedValue(option, solution));
  });
}

export function moveExplanationStep(current: number, count: number, action: 'previous' | 'next' | 'repeat'): number {
  if (count <= 0) return 0;
  const index = Math.min(Math.max(Math.trunc(current) || 0, 0), count - 1);
  if (action === 'repeat') return index;
  if (action === 'previous') return Math.max(0, index - 1);
  return Math.min(count - 1, index + 1);
}

export function presentMaterial(
  explanation: MaterialExplanation,
  prefs: LearningPreferences,
  evidence: MaterialEvidence,
  stepIndex: number
): PresentedMaterial {
  const experience = resolveLearningExperience(prefs);
  const fullParagraphs = explanation.sections.flatMap((section) => section.paragraphs);
  const showingPlain = Boolean(experience.plainLanguage && explanation.plainLanguage);
  const usedFallback = Boolean(experience.plainLanguage && !explanation.plainLanguage);
  const paragraphs = showingPlain && explanation.plainLanguage ? [explanation.plainLanguage] : fullParagraphs;
  const short = experience.shortParagraphs ? paragraphs.flatMap((paragraph) => sentencesOf(paragraph)).slice(0, 6) : paragraphs;
  const visible = explanation.steps.map((step) => step.index);
  const safeIndex = explanation.steps.length === 0 ? 0 : Math.min(Math.max(stepIndex, 0), explanation.steps.length - 1);
  const visibleStepIndexes = experience.oneStep && explanation.steps.length > 0 ? [explanation.steps[safeIndex].index] : visible;
  const lastAttempt = [...evidence.attempts].reverse().find((attempt) => attempt.conceptId === explanation.practice[0]?.conceptId);
  const actions: MaterialAction[] = [];
  if (explanation.plainLanguage && fullParagraphs.length > 0) actions.push('explain_differently');
  if (explanation.plainLanguage && !showingPlain) actions.push('make_simpler');
  if (explanation.steps.length > 0) actions.push('show_steps', 'repeat_step');
  if (explanation.diagramDescription) actions.push('show_diagram');
  if (!prefs.speechFree && (explanation.plainLanguage || fullParagraphs.length > 0)) actions.push('read_aloud');
  if (explanation.practice.length > 0) actions.push('practice');
  if (lastAttempt && !lastAttempt.correct) actions.push('review_mistake');
  if (explanation.steps.length > 1 || explanation.linkedLessonId) actions.push('continue');
  const speechBody = showingPlain && explanation.plainLanguage ? explanation.plainLanguage : short.join(' ');
  return {
    paragraphs: short,
    fullParagraphs,
    showingPlain,
    usedFallback,
    fallbackNote: usedFallback ? 'Plain-language text is not stored for this material, so the full explanation stays.' : null,
    steps: explanation.steps,
    visibleStepIndexes,
    everyday: experience.everydayExamples ? explanation.everydayExample : null,
    diagramDescription: explanation.diagramDescription,
    glossary: experience.showGlossary ? explanation.glossary : [],
    speechText: prefs.speechFree ? null : speechBody,
    speechNote: prefs.speechFree
      ? 'Speech is off for this theme. The text stays on the page, and speech is not required.'
      : 'Speech uses this browser’s voice, if it has one. There is no recorded narration.',
    hint: null,
    nextAction: experience.showNextAction
      ? explanation.steps.length > 0
        ? 'Read the current step, then choose Practice or the next step.'
        : 'Read the explanation, then try a practice question if one is listed.'
      : null,
    actions,
    missing: [
      explanation.plainLanguage ? null : 'plain',
      explanation.steps.length > 0 ? null : 'steps',
      explanation.everydayExample ? null : 'everyday',
      explanation.diagramDescription ? null : 'diagram',
      explanation.practice.length > 0 ? null : 'practice',
      explanation.practice.some((question) => question.hint) ? null : 'hint'
    ].filter((item): item is string => Boolean(item)),
    colorNote: experience.colorIndependent ? 'Labels and words carry the meaning. Color is not the only cue.' : null,
    captionNote: experience.captionsAndTranscripts
      ? 'Essential information is written on this page. No caption track is claimed, because this explanation has no audio or video file.'
      : null,
    lowDataNote: experience.deferMedia ? 'Optional diagrams wait until you ask for them. Text stays available.' : null
  };
}

export function recommendMaterial(input: {
  evidence: MaterialEvidence;
  conceptId: string;
  conceptName: string;
  hasPlain: boolean;
  plainActive: boolean;
  hasSteps: boolean;
  allowSpeech: boolean;
  hasChallenge: boolean;
  hasNextStep: boolean;
}): MaterialRecommendation {
  const attempts = input.evidence.attempts.filter((attempt) => attempt.conceptId === input.conceptId);
  const latest = attempts[attempts.length - 1];
  const incorrect = attempts.filter((attempt) => !attempt.correct).length;
  const correct = attempts.filter((attempt) => attempt.correct).length;
  if (latest && !latest.correct && incorrect >= 2 && input.hasPlain && !input.plainActive) {
    return {
      kind: 'simpler_explanation',
      title: 'Try the plainer wording',
      why: `${input.conceptName} was missed more than once. One miss is not treated as a misconception. The plainer wording is available, so that is the next offer.`,
      conceptId: input.conceptId
    };
  }
  if (latest && !latest.correct) {
    return {
      kind: 'review_concept',
      title: 'Review this explanation',
      why: `The last recorded answer on ${input.conceptName} was not correct. That is a reason to reread the explanation, not a judgment about ability.`,
      conceptId: input.conceptId
    };
  }
  if (correct >= 2 && input.hasChallenge) {
    return {
      kind: 'another_question',
      title: 'Try the harder stored question',
      why: `${input.conceptName} has more than one correct answer recorded, and a harder stored question exists.`,
      conceptId: input.conceptId
    };
  }
  if (correct >= 1 && input.hasNextStep) {
    return {
      kind: 'continue',
      title: 'Continue to the next step',
      why: `The recorded answer on ${input.conceptName} was correct, so the next stored step is available.`,
      conceptId: input.conceptId
    };
  }
  return {
    kind: 'continue',
    title: 'Keep going with this explanation',
    why: input.allowSpeech
      ? 'No answer is stored yet. Speech is optional and is not required to continue.'
      : 'No answer is stored yet. Continue with the written explanation.',
    conceptId: input.conceptId
  };
}

export function workspaceLayout(viewportWidth: number): 'panels' | 'sequence' {
  return viewportWidth >= 960 ? 'panels' : 'sequence';
}

export const WORKSPACE_PANELS = ['original', 'recognized', 'explanation', 'steps', 'practice', 'progress'] as const;
export type WorkspacePanel = (typeof WORKSPACE_PANELS)[number];

export function moveWorkspacePanel(current: WorkspacePanel, key: string): WorkspacePanel {
  const index = WORKSPACE_PANELS.indexOf(current);
  if (key === 'Home') return WORKSPACE_PANELS[0];
  if (key === 'End') return WORKSPACE_PANELS[WORKSPACE_PANELS.length - 1];
  if (key === 'ArrowRight' || key === 'ArrowDown') return WORKSPACE_PANELS[(index + 1) % WORKSPACE_PANELS.length];
  if (key === 'ArrowLeft' || key === 'ArrowUp') return WORKSPACE_PANELS[(index - 1 + WORKSPACE_PANELS.length) % WORKSPACE_PANELS.length];
  return current;
}

export function publicEngineStatus(input: {
  pythonAvailable: boolean;
  cloudinaryConfigured: boolean;
  accountReachable: boolean | null;
  ocrReady?: boolean;
}) {
  const ocrReady = input.ocrReady === true;
  return {
    explanationEngine: 'deterministic-rules' as const,
    trainedModel: false as const,
    additionalEnvKeysRequired: [] as string[],
    pythonEvidenceEngine: input.pythonAvailable ? 'available' : 'unavailable',
    ocr: ocrReady ? ('local-tesseract' as const) : ('not_configured' as const),
    imageReading: ocrReady ? 'local-tesseract' : 'unavailable',
    scannedPdf: ocrReady ? 'local-tesseract' : 'unavailable',
    pdfTextLayer: 'local',
    pastedText: 'local',
    codeExecution: 'disabled',
    cloudinaryConfigured: input.cloudinaryConfigured,
    cloudinaryAccountReachable: input.accountReachable,
    signedUpload:
      input.accountReachable === null
        ? ('not_checked' as const)
        : input.cloudinaryConfigured && input.accountReachable
          ? ('enabled' as const)
          : ('disabled' as const),
    uploadAccess: 'authenticated',
    retention: 'A private Cloudinary asset stays in that account until it is deleted. This app does not keep a copy of the file after the request.',
    note: ocrReady
      ? 'No extra API key is required. Photographs and scanned PDF pages are read locally with Tesseract. The file stays on this server. Handwriting is often weak, and you confirm the reading before it is explained. GEMINI_API_KEY is not used for this pipeline.'
      : 'No extra API key is required. Pasted text, typed questions, PDF text layers, sample lessons, and the local Python evidence file work without one. Photograph and scanned-page reading is not configured. GEMINI_API_KEY is not used for this pipeline.'
  };
}

export function redactSecrets(text: string, secrets: string[]): string {
  return secrets.reduce((current, secret) => {
    if (!secret || secret.length < 8) return current;
    return current.split(secret).join('[redacted]');
  }, text);
}

export function ingestPrepared(input: {
  kind: 'text' | 'question' | 'file' | 'sample';
  text?: string;
  bytes?: Uint8Array;
  declaredMime?: string | null;
  sampleId?: string | null;
}): IngestResult {
  if (input.kind === 'sample') {
    const sample = input.sampleId ? sampleById(input.sampleId) : null;
    if (!sample) {
      return {
        accepted: false,
        httpStatus: 404,
        error: 'That sample is not in the curated set.',
        processed: false,
        extractionStatus: 'rejected',
        format: null,
        byteLength: 0,
        text: '',
        note: 'Unknown sample.',
        sampleId: input.sampleId ?? null,
        demo: false,
        instructionLike: false
      };
    }
    return {
      accepted: true,
      httpStatus: 200,
      error: null,
      processed: true,
      extractionStatus: 'sample',
      format: 'text',
      byteLength: sample.text.length,
      text: sample.text,
      note: 'Curated sample content. This is not a reading of an uploaded file.',
      sampleId: sample.id,
      demo: true,
      instructionLike: INSTRUCTION.test(sample.text)
    };
  }

  if (input.kind === 'text' || input.kind === 'question') {
    const text = (input.text ?? '').replace(/\0/g, '').trim();
    if (!text) {
      return {
        accepted: false,
        httpStatus: 400,
        error: processingFailure('empty').message,
        processed: false,
        extractionStatus: 'empty',
        format: 'text',
        byteLength: 0,
        text: '',
        note: 'Nothing was submitted.',
        sampleId: null,
        demo: false,
        instructionLike: false
      };
    }
    if (text.length > 20000) {
      return {
        accepted: false,
        httpStatus: 413,
        error: 'The text is longer than 20,000 characters.',
        processed: false,
        extractionStatus: 'rejected',
        format: 'text',
        byteLength: text.length,
        text: '',
        note: 'The text was not stored.',
        sampleId: null,
        demo: false,
        instructionLike: false
      };
    }
    return {
      accepted: true,
      httpStatus: 200,
      error: null,
      processed: true,
      extractionStatus: 'extracted',
      format: 'text',
      byteLength: text.length,
      text,
      note: input.kind === 'question' ? 'Typed question, supplied by the learner.' : 'Pasted or typed text, supplied by the learner.',
      sampleId: null,
      demo: false,
      instructionLike: INSTRUCTION.test(text)
    };
  }

  const bytes = input.bytes ?? new Uint8Array();
  const validation = validateMaterialFile(bytes, input.declaredMime);
  if (!validation.ok || !validation.format || validation.format === 'unsupported') {
    return {
      accepted: false,
      httpStatus: validation.httpStatus,
      error: validation.error,
      processed: false,
      extractionStatus: 'rejected',
      format: validation.format,
      byteLength: validation.byteLength,
      text: '',
      note: validation.error ?? 'The file was rejected.',
      sampleId: null,
      demo: false,
      instructionLike: false
    };
  }
  if (validation.format === 'pdf') {
    const extracted = extractPdfTextLayer(bytes);
    if (!extracted.ok && extracted.reason === 'malformed') {
      return {
        accepted: false,
        httpStatus: 400,
        error: processingFailure('malformed').message,
        processed: false,
        extractionStatus: 'failed',
        format: 'pdf',
        byteLength: bytes.length,
        text: '',
        note: 'The PDF structure could not be read.',
        sampleId: null,
        demo: false,
        instructionLike: false
      };
    }
    if (!extracted.ok) {
      return {
        accepted: true,
        httpStatus: 200,
        error: null,
        processed: false,
        extractionStatus: 'provider_required',
        format: 'pdf',
        byteLength: bytes.length,
        text: '',
        note: 'This PDF has no text layer ConceptLens can read. Scanned pages need a configured OCR provider, and none is configured. You can type the text instead.',
        sampleId: null,
        demo: false,
        instructionLike: false
      };
    }
    return {
      accepted: true,
      httpStatus: 200,
      error: null,
      processed: true,
      extractionStatus: 'extracted',
      format: 'pdf',
      byteLength: bytes.length,
      text: extracted.text,
      note: 'Text was read from the PDF text layer. Embedded images were not interpreted.',
      sampleId: null,
      demo: false,
      instructionLike: INSTRUCTION.test(extracted.text)
    };
  }
  const provider = acceptExtractedText({ text: 'ignored', confidence: 0.99, providerConfigured: false });
  return {
    accepted: true,
    httpStatus: 200,
    error: null,
    processed: false,
    extractionStatus: provider.status === 'provider_required' ? 'provider_required' : 'failed',
    format: validation.format,
    byteLength: bytes.length,
    text: provider.text,
    note: `This is a valid ${validation.format.toUpperCase()} file. ${provider.note} You can type what you see, or cancel.`,
    sampleId: null,
    demo: false,
    instructionLike: false
  };
}

export function countsForSubject(subject: SubjectId, evidence: MaterialEvidence): { correct: number; incorrect: number } {
  const attempts = evidence.attempts.filter((attempt) => attempt.subject === subject);
  return {
    correct: attempts.filter((attempt) => attempt.correct).length,
    incorrect: attempts.filter((attempt) => !attempt.correct).length
  };
}
