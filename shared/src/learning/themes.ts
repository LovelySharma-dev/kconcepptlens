/**
 * Learning theme catalog.
 * Each theme maps to interface behavior. Stored values are preference flags
 * and theme ids, never a diagnosis.
 */

import {
  LEARNING_THEME_IDS,
  type LearningPreferences,
  type LearningThemeId,
  type LineSpacing,
  type TextScale,
  defaultLearningPreferences
} from './preferences';

export type ThemeGroupId = 'focus' | 'vision' | 'hearing' | 'pace';

type ThemeFlag = keyof Pick<
  LearningPreferences,
  | 'adhdFriendly'
  | 'focusMode'
  | 'simplifiedLayout'
  | 'simpleSteps'
  | 'easyRead'
  | 'readSupport'
  | 'dyslexiaFriendly'
  | 'listenExplore'
  | 'lowStimulation'
  | 'guidedLearning'
  | 'colorFriendly'
  | 'lowVision'
  | 'blindFriendly'
  | 'textFirst'
  | 'keyboardFirst'
  | 'visualLearning'
  | 'deafFriendly'
  | 'speechFree'
  | 'motorFriendly'
  | 'supportedLearning'
  | 'selfPaced'
  | 'lowData'
  | 'multipleWays'
>;

export interface LearningThemeDefinition {
  id: LearningThemeId;
  groupId: ThemeGroupId;
  title: string;
  description: string;
  iconLabel: string;
  flags: ThemeFlag[];
  textScale?: TextScale;
  lineSpacing?: LineSpacing;
  highContrast?: boolean;
  reducedMotion?: boolean;
  forceBreakOff?: boolean;
}

export interface ThemeGroup {
  id: ThemeGroupId;
  title: string;
  themes: LearningThemeDefinition[];
}

export interface LearningExperience {
  reduceDistraction: boolean;
  showNextAction: boolean;
  chunkLessons: boolean;
  offerHints: boolean;
  neverAutoplay: boolean;
  plainLanguage: boolean;
  shortParagraphs: boolean;
  showGlossary: boolean;
  keepFullScience: boolean;
  adjustableType: boolean;
  readableTypography: boolean;
  offerSpeech: boolean;
  colorIndependent: boolean;
  largerText: boolean;
  diagramText: boolean;
  keyboardAccess: boolean;
  speechOptional: boolean;
  speechRequired: boolean;
  captionsAndTranscripts: boolean;
  largerTargets: boolean;
  reduceMotion: boolean;
  deferMedia: boolean;
  showAnnotatedDiagram: boolean;
  selfPaced: boolean;
  guidedStages: boolean;
  oneStep: boolean;
  everydayExamples: boolean;
  encouragingFeedback: boolean;
  multipleRepresentations: boolean;
}

const THEME_LIST: LearningThemeDefinition[] = [
  {
    id: 'adhd-friendly',
    groupId: 'focus',
    title: 'ADHD-Friendly',
    description: 'Shows one clear task, shorter sections, and the next action. Nothing plays, counts down, or reminds you to take a break unless you turn that on yourself.',
    iconLabel: 'Focus',
    flags: ['adhdFriendly', 'focusMode', 'simplifiedLayout'],
    forceBreakOff: true
  },
  {
    id: 'simple-steps',
    groupId: 'focus',
    title: 'Simple Steps',
    description: 'Moves through the lesson in a predictable order, one stage at a time. You can go back and repeat a stage.',
    iconLabel: 'Steps',
    flags: ['simpleSteps']
  },
  {
    id: 'easy-read',
    groupId: 'focus',
    title: 'Easy Read',
    description: 'Uses the plain-language version when this lesson has one, with shorter paragraphs and word meanings. The full scientific text stays available.',
    iconLabel: 'Read',
    flags: ['easyRead', 'readSupport'],
    lineSpacing: 'relaxed'
  },
  {
    id: 'dyslexia-friendly',
    groupId: 'focus',
    title: 'Dyslexia-Friendly',
    description: 'Increases text size, spacing, and line width, and keeps text selectable. Speech is optional. No single font is assumed to suit every reader.',
    iconLabel: 'Type',
    flags: ['dyslexiaFriendly', 'listenExplore'],
    textScale: 'large',
    lineSpacing: 'relaxed'
  },
  {
    id: 'low-stimulation',
    groupId: 'focus',
    title: 'Low-Stimulation',
    description: 'Stops extra motion and quiets decorative effects. The page does not flash or animate on its own.',
    iconLabel: 'Calm',
    flags: ['lowStimulation', 'simplifiedLayout'],
    reducedMotion: true
  },
  {
    id: 'guided-learning',
    groupId: 'focus',
    title: 'Guided Learning',
    description: 'Shows the sequence Learn, Explore, Try, then Review. The current stage is marked, and you can move backward.',
    iconLabel: 'Guide',
    flags: ['guidedLearning']
  },
  {
    id: 'color-blind-friendly',
    groupId: 'vision',
    title: 'Color-Blind-Friendly',
    description: 'Adds labels, shapes, and line styles so a choice or a diagram is not explained by color alone.',
    iconLabel: 'Shape',
    flags: ['colorFriendly']
  },
  {
    id: 'low-vision-friendly',
    groupId: 'vision',
    title: 'Low-Vision-Friendly',
    description: 'Uses larger text, room to zoom, and diagrams that stay on the page when the text grows.',
    iconLabel: 'Zoom',
    flags: ['lowVision'],
    textScale: 'large'
  },
  {
    id: 'blind-friendly',
    groupId: 'vision',
    title: 'Blind-Friendly',
    description: 'Keeps the lesson in text with keyboard controls, diagram descriptions, and optional speech. Sight is not required to continue.',
    iconLabel: 'Text',
    flags: ['blindFriendly', 'textFirst', 'keyboardFirst', 'listenExplore']
  },
  {
    id: 'visual-learning',
    groupId: 'vision',
    title: 'Visual Learning',
    description: 'Opens the labeled diagram when this lesson has one. Switching to text keeps the same structure.',
    iconLabel: 'Diagram',
    flags: ['visualLearning']
  },
  {
    id: 'deaf-friendly',
    groupId: 'hearing',
    title: 'Deaf & Hard-of-Hearing-Friendly',
    description: 'Keeps essential information in text. These lessons have no video; nothing important is delivered only as a sound.',
    iconLabel: 'Captions',
    flags: ['deafFriendly']
  },
  {
    id: 'speech-free',
    groupId: 'hearing',
    title: 'Speech-Free Interaction',
    description: 'Answers and navigation use text, a pointer, or the keyboard. Speaking is never required.',
    iconLabel: 'Quiet',
    flags: ['speechFree']
  },
  {
    id: 'keyboard-friendly',
    groupId: 'hearing',
    title: 'Keyboard-Friendly',
    description: 'Puts actions in the tab order with a visible focus outline. Diagrams, quizzes, and dialogs work without a mouse.',
    iconLabel: 'Keyboard',
    flags: ['keyboardFirst']
  },
  {
    id: 'motor-friendly',
    groupId: 'hearing',
    title: 'Motor-Friendly',
    description: 'Makes buttons larger and keeps a keyboard path for the same actions.',
    iconLabel: 'Target',
    flags: ['motorFriendly', 'keyboardFirst']
  },
  {
    id: 'supported-learning',
    groupId: 'pace',
    title: 'Down Syndrome & Supported Learning',
    description: 'Shows one step, plain language, and an everyday example when the lesson has them. You can repeat a step. Feedback names what to look at next. This does not assume one set of abilities.',
    iconLabel: 'Support',
    flags: ['supportedLearning', 'simpleSteps', 'easyRead', 'readSupport']
  },
  {
    id: 'self-paced',
    groupId: 'pace',
    title: 'Self-Paced Learning',
    description: 'No countdown. You can reread, practice, and change how the concept is shown without losing your place.',
    iconLabel: 'Pace',
    flags: ['selfPaced'],
    forceBreakOff: true
  },
  {
    id: 'low-data',
    groupId: 'pace',
    title: 'Low-Data Learning',
    description: 'Loads the writing first and asks before larger images. This does not add offline use.',
    iconLabel: 'Light',
    flags: ['lowData']
  },
  {
    id: 'multiple-ways',
    groupId: 'pace',
    title: 'Multiple Ways to Learn',
    description: 'Keeps the other representations of this same concept within reach.',
    iconLabel: 'Ways',
    flags: ['multipleWays']
  }
];

const THEME_BY_ID: Record<LearningThemeId, LearningThemeDefinition> = Object.fromEntries(
  THEME_LIST.map((theme) => [theme.id, theme])
) as Record<LearningThemeId, LearningThemeDefinition>;

const GROUP_TITLES: Record<ThemeGroupId, string> = {
  focus: 'Focus & cognitive learning',
  vision: 'Vision & visual access',
  hearing: 'Hearing, speech & motor access',
  pace: 'Learning pace & preferences'
};

const SCALE_RANK: Record<TextScale, number> = { default: 0, large: 1, larger: 2 };

export function learningThemes(): LearningThemeDefinition[] {
  return THEME_LIST;
}

export function learningThemeGroups(): ThemeGroup[] {
  return (Object.keys(GROUP_TITLES) as ThemeGroupId[]).map((id) => ({
    id,
    title: GROUP_TITLES[id],
    themes: THEME_LIST.filter((theme) => theme.groupId === id)
  }));
}

export function learningThemeById(id: LearningThemeId): LearningThemeDefinition {
  return THEME_BY_ID[id];
}

interface DerivedThemeEffects {
  flags: Partial<Record<ThemeFlag, true>>;
  textScale: TextScale;
  lineSpacing: LineSpacing;
  highContrast: boolean;
  reducedMotion: boolean;
  forceBreakOff: boolean;
}

function derive(ids: LearningThemeId[]): DerivedThemeEffects {
  const flags: Partial<Record<ThemeFlag, true>> = {};
  let textScale: TextScale = 'default';
  let lineSpacing: LineSpacing = 'comfortable';
  let highContrast = false;
  let reducedMotion = false;
  let forceBreakOff = false;
  for (const id of ids) {
    const theme = THEME_BY_ID[id];
    if (!theme) continue;
    for (const flag of theme.flags) flags[flag] = true;
    if (theme.textScale && SCALE_RANK[theme.textScale] > SCALE_RANK[textScale]) textScale = theme.textScale;
    if (theme.lineSpacing === 'relaxed') lineSpacing = 'relaxed';
    if (theme.highContrast) highContrast = true;
    if (theme.reducedMotion) reducedMotion = true;
    if (theme.forceBreakOff) forceBreakOff = true;
  }
  return { flags, textScale, lineSpacing, highContrast, reducedMotion, forceBreakOff };
}

const USER_FLAGS = ['textFirst', 'lowData', 'keyboardFirst', 'readSupport', 'listenExplore', 'focusMode'] as const;

function materialize(prev: LearningPreferences, ids: LearningThemeId[]): LearningPreferences {
  const before = derive(prev.activeThemes);
  const next = derive(ids);
  const userRaisedScale = SCALE_RANK[prev.textScale] > SCALE_RANK[before.textScale];
  const userRelaxed = prev.lineSpacing === 'relaxed' && before.lineSpacing !== 'relaxed';
  const userContrast = prev.highContrast && !before.highContrast;
  const userMotion = prev.reducedMotion && !before.reducedMotion;
  const userSetBreak = prev.breakReminderMinutes > 0 && before.forceBreakOff;
  const result: LearningPreferences = {
    ...defaultLearningPreferences(),
    speechRate: prev.speechRate,
    activeThemes: ids,
    textScale: userRaisedScale
      ? SCALE_RANK[prev.textScale] >= SCALE_RANK[next.textScale]
        ? prev.textScale
        : next.textScale
      : next.textScale,
    lineSpacing: userRelaxed || next.lineSpacing === 'relaxed' ? 'relaxed' : 'comfortable',
    highContrast: userContrast || next.highContrast,
    reducedMotion: userMotion || next.reducedMotion,
    breakReminderMinutes: userSetBreak ? prev.breakReminderMinutes : next.forceBreakOff ? 0 : prev.breakReminderMinutes
  };
  for (const theme of THEME_LIST) {
    for (const flag of theme.flags) {
      result[flag] = next.flags[flag] === true;
    }
  }
  for (const flag of USER_FLAGS) {
    const fromTheme = next.flags[flag] === true;
    const userHadIt = prev[flag] === true && before.flags[flag] !== true;
    result[flag] = fromTheme || userHadIt;
  }
  return result;
}

export function applyLearningTheme(prefs: LearningPreferences, id: LearningThemeId): LearningPreferences {
  if (!LEARNING_THEME_IDS.includes(id)) return prefs;
  if (prefs.activeThemes.includes(id)) return prefs;
  return materialize(prefs, [...prefs.activeThemes, id]);
}

export function removeLearningTheme(prefs: LearningPreferences, id: LearningThemeId): LearningPreferences {
  if (!prefs.activeThemes.includes(id)) return prefs;
  return materialize(prefs, prefs.activeThemes.filter((themeId) => themeId !== id));
}

export function toggleLearningTheme(prefs: LearningPreferences, id: LearningThemeId): LearningPreferences {
  return prefs.activeThemes.includes(id) ? removeLearningTheme(prefs, id) : applyLearningTheme(prefs, id);
}

const INFER: Record<LearningThemeId, (prefs: LearningPreferences) => boolean> = {
  'adhd-friendly': (prefs) => prefs.adhdFriendly || prefs.focusMode,
  'simple-steps': (prefs) => prefs.simpleSteps && !prefs.supportedLearning,
  'easy-read': (prefs) => prefs.easyRead && !prefs.supportedLearning,
  'dyslexia-friendly': (prefs) => prefs.dyslexiaFriendly,
  'low-stimulation': (prefs) => prefs.lowStimulation,
  'guided-learning': (prefs) => prefs.guidedLearning,
  'color-blind-friendly': (prefs) => prefs.colorFriendly,
  'low-vision-friendly': (prefs) => prefs.lowVision,
  'blind-friendly': (prefs) => prefs.blindFriendly,
  'visual-learning': (prefs) => prefs.visualLearning,
  'deaf-friendly': (prefs) => prefs.deafFriendly,
  'speech-free': (prefs) => prefs.speechFree,
  'keyboard-friendly': (prefs) => prefs.keyboardFirst && !prefs.motorFriendly && !prefs.blindFriendly,
  'motor-friendly': (prefs) => prefs.motorFriendly,
  'supported-learning': (prefs) => prefs.supportedLearning,
  'self-paced': (prefs) => prefs.selfPaced,
  'low-data': (prefs) => prefs.lowData,
  'multiple-ways': (prefs) => prefs.multipleWays
};

/** Older saves stored flags without theme ids. Fill ids once so the cards match. */
export function hydrateThemeSelection(prefs: LearningPreferences, hadActiveThemes: boolean): LearningPreferences {
  if (hadActiveThemes) return prefs;
  const inferred = LEARNING_THEME_IDS.filter((id) => INFER[id](prefs));
  if (inferred.length === 0) return prefs;
  return { ...prefs, activeThemes: inferred };
}

/**
 * Combined themes union their own flags.
 * Low-Stimulation keeps motion off. Low-Data defers optional media.
 * Blind-Friendly keeps text alternatives. Easy Read changes wording only
 * when a plain-language version is stored. Color-Blind-Friendly needs a
 * cue besides color. Keyboard-Friendly keeps a keyboard path.
 * A later theme does not clear an unrelated flag.
 */
export const THEME_RESOLUTION =
  'Combined themes union their own flags. Low-Stimulation keeps motion off. Low-Data defers optional media. Blind-Friendly keeps text alternatives. Easy Read changes wording only when plain-language text is stored. Color-Blind-Friendly needs a cue besides color. Keyboard-Friendly keeps a keyboard path. Selecting another theme does not clear an unrelated flag.';

export function resolveLearningExperience(prefs: LearningPreferences): LearningExperience {
  const adhd = prefs.adhdFriendly || prefs.focusMode;
  const supported = prefs.supportedLearning;
  const easy = prefs.easyRead || supported;
  const offerSpeech = prefs.listenExplore || prefs.dyslexiaFriendly || prefs.blindFriendly || prefs.readSupport;
  return {
    reduceDistraction: adhd || prefs.lowStimulation || prefs.simplifiedLayout,
    showNextAction: adhd || prefs.guidedLearning || prefs.simpleSteps || supported,
    chunkLessons: adhd,
    offerHints: adhd || prefs.guidedLearning || supported,
    neverAutoplay: adhd || prefs.lowStimulation || prefs.lowData,
    plainLanguage: easy,
    shortParagraphs: easy || prefs.dyslexiaFriendly,
    showGlossary: easy || prefs.readSupport || prefs.dyslexiaFriendly,
    keepFullScience: true,
    adjustableType: prefs.dyslexiaFriendly || prefs.lowVision || prefs.easyRead,
    readableTypography: prefs.dyslexiaFriendly,
    offerSpeech,
    colorIndependent: prefs.colorFriendly,
    largerText: prefs.lowVision || prefs.dyslexiaFriendly,
    diagramText: prefs.blindFriendly || prefs.lowVision || prefs.colorFriendly,
    keyboardAccess: prefs.keyboardFirst || prefs.blindFriendly || prefs.motorFriendly,
    speechOptional: true,
    speechRequired: false,
    captionsAndTranscripts: prefs.deafFriendly,
    largerTargets: prefs.motorFriendly || prefs.lowVision,
    reduceMotion: prefs.lowStimulation || prefs.reducedMotion,
    deferMedia: prefs.lowData,
    showAnnotatedDiagram: prefs.visualLearning || !prefs.textFirst,
    selfPaced: prefs.selfPaced || supported || prefs.simpleSteps,
    guidedStages: prefs.guidedLearning || supported,
    oneStep: prefs.simpleSteps || supported,
    everydayExamples: supported || prefs.easyRead || prefs.multipleWays || prefs.simpleSteps,
    encouragingFeedback: supported || prefs.simpleSteps,
    multipleRepresentations: prefs.multipleWays || prefs.visualLearning || prefs.easyRead
  };
}

const DOM_CLASS_FLAGS: Array<[string, (prefs: LearningPreferences) => boolean]> = [
  ['high-contrast', (prefs) => prefs.highContrast],
  ['layout-simplified', (prefs) => prefs.simplifiedLayout],
  ['reduced-motion', (prefs) => prefs.reducedMotion || prefs.lowStimulation],
  ['focus-mode', (prefs) => prefs.focusMode || prefs.adhdFriendly],
  ['easy-read', (prefs) => prefs.easyRead],
  ['color-friendly', (prefs) => prefs.colorFriendly],
  ['low-stimulation', (prefs) => prefs.lowStimulation],
  ['low-data', (prefs) => prefs.lowData],
  ['adhd-friendly', (prefs) => prefs.adhdFriendly || prefs.focusMode],
  ['dyslexia-friendly', (prefs) => prefs.dyslexiaFriendly],
  ['low-vision', (prefs) => prefs.lowVision],
  ['blind-friendly', (prefs) => prefs.blindFriendly],
  ['deaf-friendly', (prefs) => prefs.deafFriendly],
  ['motor-friendly', (prefs) => prefs.motorFriendly],
  ['keyboard-friendly', (prefs) => prefs.keyboardFirst],
  ['speech-free', (prefs) => prefs.speechFree],
  ['guided-learning', (prefs) => prefs.guidedLearning],
  ['supported-learning', (prefs) => prefs.supportedLearning],
  ['self-paced', (prefs) => prefs.selfPaced],
  ['simple-steps', (prefs) => prefs.simpleSteps],
  ['visual-learning', (prefs) => prefs.visualLearning],
  ['multiple-ways', (prefs) => prefs.multipleWays]
];

export function learningDomClasses(): string[] {
  return DOM_CLASS_FLAGS.map(([className]) => className);
}

export function learningDomState(prefs: LearningPreferences): {
  classes: string[];
  textScale: TextScale;
  lineSpacing: LineSpacing;
  keyboardFirst: boolean;
} {
  return {
    classes: DOM_CLASS_FLAGS.filter(([, enabled]) => enabled(prefs)).map(([className]) => className),
    textScale: prefs.textScale,
    lineSpacing: prefs.lineSpacing,
    keyboardFirst: prefs.keyboardFirst
  };
}

export function activeThemeDefinitions(prefs: LearningPreferences): LearningThemeDefinition[] {
  return prefs.activeThemes.map((id) => THEME_BY_ID[id]).filter(Boolean);
}
