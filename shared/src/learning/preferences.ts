/**
 * Display choices for the same curated lesson.
 * These fields are interface preferences. They are not a diagnosis,
 * and they are stored apart from the selected concept and quiz progress.
 */

import type { LearningModeId } from './barrierless';

export type TextScale = 'default' | 'large' | 'larger';
export type LineSpacing = 'comfortable' | 'relaxed';
export type BreakReminderMinutes = 0 | 10 | 20;
export type SpeechRate = 0.8 | 1 | 1.25;
export type ThemeChoice = 'light' | 'dark' | 'system';

/** Interface theme ids. These name a presentation, not a diagnosis. */
export const LEARNING_THEME_IDS = [
  'adhd-friendly',
  'simple-steps',
  'easy-read',
  'dyslexia-friendly',
  'low-stimulation',
  'guided-learning',
  'color-blind-friendly',
  'low-vision-friendly',
  'blind-friendly',
  'visual-learning',
  'deaf-friendly',
  'speech-free',
  'keyboard-friendly',
  'motor-friendly',
  'supported-learning',
  'self-paced',
  'low-data',
  'multiple-ways'
] as const;

export type LearningThemeId = (typeof LEARNING_THEME_IDS)[number];

export interface LearningPreferences {
  textScale: TextScale;
  lineSpacing: LineSpacing;
  highContrast: boolean;
  reducedMotion: boolean;
  simplifiedLayout: boolean;
  textFirst: boolean;
  lowData: boolean;
  keyboardFirst: boolean;
  readSupport: boolean;
  breakReminderMinutes: BreakReminderMinutes;
  /** Combinable interface modes. None of these fields stores a diagnosis. */
  focusMode: boolean;
  easyRead: boolean;
  simpleSteps: boolean;
  colorFriendly: boolean;
  listenExplore: boolean;
  lowStimulation: boolean;
  adhdFriendly: boolean;
  dyslexiaFriendly: boolean;
  guidedLearning: boolean;
  lowVision: boolean;
  blindFriendly: boolean;
  visualLearning: boolean;
  deafFriendly: boolean;
  speechFree: boolean;
  motorFriendly: boolean;
  supportedLearning: boolean;
  selfPaced: boolean;
  multipleWays: boolean;
  /** Selected presentation themes. Values are interface ids, not medical labels. */
  activeThemes: LearningThemeId[];
  speechRate: SpeechRate;
}

const TEXT_SCALES: TextScale[] = ['default', 'large', 'larger'];
const LINE_SPACINGS: LineSpacing[] = ['comfortable', 'relaxed'];
const BREAK_MINUTES: BreakReminderMinutes[] = [0, 10, 20];
const SPEECH_RATES: SpeechRate[] = [0.8, 1, 1.25];

function readActiveThemes(value: unknown): LearningThemeId[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<LearningThemeId>();
  for (const item of value) {
    if (typeof item === 'string' && (LEARNING_THEME_IDS as readonly string[]).includes(item)) {
      seen.add(item as LearningThemeId);
    }
  }
  return [...seen];
}

export function defaultLearningPreferences(): LearningPreferences {
  return {
    textScale: 'default',
    lineSpacing: 'comfortable',
    highContrast: false,
    reducedMotion: false,
    simplifiedLayout: false,
    textFirst: false,
    lowData: false,
    keyboardFirst: false,
    readSupport: false,
    breakReminderMinutes: 0,
    focusMode: false,
    easyRead: false,
    simpleSteps: false,
    colorFriendly: false,
    listenExplore: false,
    lowStimulation: false,
    adhdFriendly: false,
    dyslexiaFriendly: false,
    guidedLearning: false,
    lowVision: false,
    blindFriendly: false,
    visualLearning: false,
    deafFriendly: false,
    speechFree: false,
    motorFriendly: false,
    supportedLearning: false,
    selfPaced: false,
    multipleWays: false,
    activeThemes: [],
    speechRate: 1
  };
}

export function normalizeLearningPreferences(value: unknown): LearningPreferences {
  const base = defaultLearningPreferences();
  if (!value || typeof value !== 'object') return base;
  const raw = value as Record<string, unknown>;
  return {
    textScale: TEXT_SCALES.includes(raw.textScale as TextScale) ? (raw.textScale as TextScale) : base.textScale,
    lineSpacing: LINE_SPACINGS.includes(raw.lineSpacing as LineSpacing) ? (raw.lineSpacing as LineSpacing) : base.lineSpacing,
    highContrast: raw.highContrast === true,
    reducedMotion: raw.reducedMotion === true,
    simplifiedLayout: raw.simplifiedLayout === true,
    textFirst: raw.textFirst === true,
    lowData: raw.lowData === true,
    keyboardFirst: raw.keyboardFirst === true,
    readSupport: raw.readSupport === true,
    breakReminderMinutes: BREAK_MINUTES.includes(raw.breakReminderMinutes as BreakReminderMinutes)
      ? (raw.breakReminderMinutes as BreakReminderMinutes)
      : 0,
    focusMode: raw.focusMode === true,
    easyRead: raw.easyRead === true,
    simpleSteps: raw.simpleSteps === true,
    colorFriendly: raw.colorFriendly === true,
    listenExplore: raw.listenExplore === true,
    lowStimulation: raw.lowStimulation === true,
    adhdFriendly: raw.adhdFriendly === true,
    dyslexiaFriendly: raw.dyslexiaFriendly === true,
    guidedLearning: raw.guidedLearning === true,
    lowVision: raw.lowVision === true,
    blindFriendly: raw.blindFriendly === true,
    visualLearning: raw.visualLearning === true,
    deafFriendly: raw.deafFriendly === true,
    speechFree: raw.speechFree === true,
    motorFriendly: raw.motorFriendly === true,
    supportedLearning: raw.supportedLearning === true,
    selfPaced: raw.selfPaced === true,
    multipleWays: raw.multipleWays === true,
    activeThemes: readActiveThemes(raw.activeThemes),
    speechRate: SPEECH_RATES.includes(raw.speechRate as SpeechRate) ? (raw.speechRate as SpeechRate) : 1
  };
}

/** A missing or unknown value opens in light mode. A saved light, dark, or system choice is kept. */
export function readThemeChoice(saved: string | null | undefined): ThemeChoice {
  if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
  return 'light';
}

export function resolveTheme(choice: ThemeChoice, systemPrefersDark: boolean): 'light' | 'dark' {
  if (choice === 'system') return systemPrefersDark ? 'dark' : 'light';
  return choice;
}

export function lessonImageWidth(lowData: boolean): number {
  return lowData ? 480 : 800;
}

export function activePreferenceLabels(prefs: LearningPreferences): string[] {
  const labels: string[] = [];
  if (prefs.focusMode) labels.push('Focus');
  if (prefs.easyRead) labels.push('Easy Read');
  if (prefs.simpleSteps) labels.push('Simple Steps');
  if (prefs.colorFriendly) labels.push('Color-friendly');
  if (prefs.listenExplore) labels.push('Listen');
  if (prefs.keyboardFirst) labels.push('Keyboard');
  if (prefs.lowStimulation) labels.push('Low stimulation');
  else if (prefs.reducedMotion) labels.push('Reduced motion');
  if (prefs.lowData) labels.push('Low data');
  if (prefs.highContrast) labels.push('High contrast');
  if (prefs.textFirst) labels.push('Text first');
  if (labels.length === 0) labels.push('Standard lesson');
  return labels;
}

export function resetAllLearningPreferences(): LearningPreferences {
  return defaultLearningPreferences();
}

/** Reset typography and interaction choices. Representation flags stay so the open concept is untouched. */
export function resetDisplayPreferences(current: LearningPreferences): LearningPreferences {
  return {
    ...defaultLearningPreferences(),
    textFirst: current.textFirst,
    lowData: current.lowData,
    activeThemes: current.lowData ? ['low-data'] : []
  };
}

export function shouldMount3D(input: {
  has3D: boolean;
  mode: LearningModeId;
  textFirst: boolean;
  lowData: boolean;
  learnerRequestedScene: boolean;
}): boolean {
  if (!input.has3D || input.mode !== 'visual') return false;
  if (input.textFirst || input.lowData) return input.learnerRequestedScene;
  return true;
}

/** A saved choice wins. Otherwise follow the operating-system motion setting. */
export function respectSystemReducedMotion(
  prefs: LearningPreferences,
  systemReduced: boolean,
  savedByLearner: boolean
): LearningPreferences {
  if (savedByLearner || !systemReduced) return prefs;
  return { ...prefs, reducedMotion: true };
}

export interface VocabularyItem {
  term: string;
  meaning: string;
  source: 'lesson-text';
}

/** Definitions are copied from the curated lesson. Nothing is added. */
export function vocabularyFromComponent(component: {
  name: string;
  scientificName?: string;
  simpleExplanation: string;
  functionText: string;
}): VocabularyItem[] {
  const items: VocabularyItem[] = [];
  if (component.simpleExplanation.trim()) {
    items.push({ term: component.name, meaning: component.simpleExplanation.trim(), source: 'lesson-text' });
  }
  if (component.scientificName && component.scientificName !== component.name && component.functionText.trim()) {
    items.push({
      term: component.scientificName,
      meaning: component.functionText.trim(),
      source: 'lesson-text'
    });
  }
  return items;
}

export function preferencesIncludeDiagnosis(prefs: LearningPreferences): boolean {
  return Object.keys(prefs).some((key) => /diagnos|disabil|medical/i.test(key));
}
