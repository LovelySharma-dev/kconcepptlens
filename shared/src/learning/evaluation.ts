/**
 * Checks on an explanation that can be recomputed.
 * Shorter sentences and a practice item that quotes the page are text checks.
 * They are not a measure of learning outcomes.
 */

import { defaultLearningPreferences, type LearningPreferences } from './preferences';
import { applyLearningTheme } from './themes';
import type { MaterialExplanation } from '../schemas/material';
import {
  balanceReaction,
  emptyMaterialEvidence,
  learnerPracticeIsSeparated,
  lensDistanceStatement,
  presentMaterial,
  solveLinearEquation,
  traceSafeAccumulator,
  type PresentedMaterial
} from './materials';

export interface ExplanationCheck {
  name: string;
  passed: boolean;
  detail: string;
}

export interface PreferenceView {
  id: string;
  title: string;
  presented: PresentedMaterial;
}

export interface MaterialEvaluation {
  correctness: { checks: number; passed: number; items: ExplanationCheck[] };
  accessibility: ExplanationCheck[];
  readability: {
    standardWordsPerSentence: number;
    easyReadWordsPerSentence: number;
    shorterSentences: boolean;
    note: string;
  };
  answerInExplanation: boolean | null;
  answerNote: string;
  learningOutcomeClaimed: false;
  outcomeNote: string;
}

function meanWordsPerSentence(text: string): number {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (sentences.length === 0) return 0;
  const total = sentences.reduce((sum, sentence) => sum + sentence.split(/\s+/).filter(Boolean).length, 0);
  return Math.round((total / sentences.length) * 10) / 10;
}

function containsAnswer(corpus: string, answer: string): boolean {
  const escaped = answer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (answer.length <= 2) return new RegExp(`(^|[^A-Za-z0-9])${escaped}([^A-Za-z0-9]|$)`, 'i').test(corpus);
  return corpus.toLowerCase().includes(answer.toLowerCase());
}

export function preferenceDemonstration(explanation: MaterialExplanation): {
  standard: PresentedMaterial;
  easyRead: PresentedMaterial;
  simpleSteps: PresentedMaterial;
  speechFree: PresentedMaterial;
} {
  const evidence = emptyMaterialEvidence();
  const standardPrefs = defaultLearningPreferences();
  return {
    standard: presentMaterial(explanation, standardPrefs, evidence, 0),
    easyRead: presentMaterial(explanation, applyLearningTheme(standardPrefs, 'easy-read'), evidence, 0),
    simpleSteps: presentMaterial(explanation, applyLearningTheme(standardPrefs, 'simple-steps'), evidence, 0),
    speechFree: presentMaterial(explanation, applyLearningTheme(defaultLearningPreferences(), 'speech-free'), evidence, 0)
  };
}

export function presentForPreferences(explanation: MaterialExplanation, preferences: LearningPreferences): PresentedMaterial {
  return presentMaterial(explanation, preferences, emptyMaterialEvidence(), 0);
}

export function evaluateMaterial(explanation: MaterialExplanation): MaterialEvaluation {
  const items: ExplanationCheck[] = [];
  const linear = solveLinearEquation(explanation.sourceContent);
  if (linear && explanation.subject === 'mathematics') {
    items.push({
      name: 'Linear equation substitution',
      passed: explanation.verified.some((item) => item.includes(`x = ${linear.solution}`)),
      detail: `x = ${linear.solution}`
    });
    const linearPractice = explanation.practice.filter((item) => item.conceptId === 'linear-equation');
    if (linearPractice.length > 0) {
      items.push({
        name: 'Practice prompts omit the answer key',
        passed: learnerPracticeIsSeparated(linearPractice, linear.solution),
        detail: 'Prompts and hints do not state the solved value, and the answer key is not on the prompt.'
      });
    }
  }
  if (explanation.practice.length > 0 && !items.some((item) => item.name === 'Practice prompts omit the answer key')) {
    items.push({
      name: 'Practice prompts omit the answer key',
      passed: learnerPracticeIsSeparated(explanation.practice, null),
      detail: 'The learner-facing prompt has no answer key.'
    });
  }
  const distance = lensDistanceStatement(explanation.sourceContent);
  if (distance && explanation.subject === 'physics') {
    items.push({
      name: 'Thin-lens distance',
      passed: explanation.verified.includes(distance),
      detail: distance
    });
  }
  const traced = traceSafeAccumulator(explanation.sourceContent);
  if (traced && explanation.subject === 'computer_science') {
    items.push({
      name: 'Add-a-list total',
      passed: explanation.verified.some((item) => item.includes(String(traced.result))),
      detail: String(traced.result)
    });
  }
  const reaction = balanceReaction(explanation.sourceContent);
  if (reaction && explanation.subject === 'chemistry') {
    items.push({
      name: 'Atom balance',
      passed: explanation.verified.some((item) => item.includes(reaction.balanced)),
      detail: reaction.balanced
    });
  }
  if (explanation.subject === 'biology') {
    const source = explanation.sourceContent.toLowerCase();
    const claimed = explanation.verified.join(' ').toLowerCase();
    const invented = ['chloroplast', 'ribosome', 'golgi', 'vacuole'].filter((word) => claimed.includes(word) && !source.includes(word));
    items.push({
      name: 'Biology claims stay inside the source',
      passed: invented.length === 0,
      detail: invented.length === 0 ? 'Verified lines use words from the source.' : invented.join(', ')
    });
  }

  const views = preferenceDemonstration(explanation);
  const standardText = views.standard.paragraphs.join(' ');
  const easyText = views.easyRead.paragraphs.join(' ');
  const accessibility: ExplanationCheck[] = [
    explanation.plainLanguage
      ? {
          name: 'Easy Read',
          passed: views.easyRead.showingPlain && easyText !== standardText,
          detail: 'Plain wording is on, and it differs from the standard paragraphs.'
        }
      : {
          name: 'Easy Read',
          passed: views.easyRead.usedFallback,
          detail: 'A separate plain-language version is not stored, so the standard explanation stays.'
        },
    {
      name: 'Simple Steps',
      passed:
        explanation.steps.length < 2 ||
        (views.simpleSteps.visibleStepIndexes.length === 1 && views.standard.visibleStepIndexes.length === explanation.steps.length),
      detail:
        explanation.steps.length < 2
          ? 'This explanation has fewer than two steps.'
          : `Simple Steps shows 1 of ${explanation.steps.length} steps. Standard shows every step.`
    },
    {
      name: 'Speech-free',
      passed: views.speechFree.speechText === null && views.standard.speechText !== null,
      detail: 'Speech text is removed. The written explanation stays.'
    },
    {
      name: 'Color-blind-friendly',
      passed:
        presentMaterial(explanation, applyLearningTheme(defaultLearningPreferences(), 'color-blind-friendly'), emptyMaterialEvidence(), 0).colorNote !==
          null && views.standard.colorNote === null,
      detail: 'A note says labels carry the meaning, so color is not the only cue.'
    },
    {
      name: 'Dyslexia-friendly',
      passed: applyLearningTheme(defaultLearningPreferences(), 'dyslexia-friendly').textScale === 'large',
      detail: 'Text scale is large and line spacing is relaxed. No font is claimed to suit every reader.'
    }
  ];
  const dyslexia = applyLearningTheme(defaultLearningPreferences(), 'dyslexia-friendly');
  accessibility[accessibility.length - 1] = {
    name: 'Dyslexia-friendly',
    passed: dyslexia.textScale === 'large' && dyslexia.lineSpacing === 'relaxed',
    detail: 'Text scale is large and line spacing is relaxed. No font is claimed to suit every reader.'
  };

  const standardWords = meanWordsPerSentence(standardText);
  const easyWords = meanWordsPerSentence(explanation.plainLanguage ? easyText : standardText);
  const question = explanation.practice[0];
  const answer = question ? question.options[question.correctOptionIndex] : null;
  const corpus = [
    explanation.plainLanguage ?? '',
    ...explanation.sections.flatMap((section) => section.paragraphs),
    ...explanation.verified,
    ...explanation.steps.map((step) => `${step.title} ${step.detail}`)
  ].join(' ');
  const answerInExplanation = answer ? containsAnswer(corpus, answer) : null;

  return {
    correctness: {
      checks: items.length,
      passed: items.filter((item) => item.passed).length,
      items
    },
    accessibility,
    readability: {
      standardWordsPerSentence: standardWords,
      easyReadWordsPerSentence: easyWords,
      shorterSentences: Boolean(explanation.plainLanguage) && easyWords < standardWords,
      note: 'Average words per sentence describes the wording. It does not show that a person learned more.'
    },
    answerInExplanation,
    answerNote: answer
      ? answerInExplanation
        ? 'The stored practice answer appears in the explanation, so the item can be answered from this page. That is an item check.'
        : 'The stored practice answer was not found in the explanation.'
      : 'This material has no practice question to check.',
    learningOutcomeClaimed: false,
    outcomeNote: 'These checks cover calculation correctness, preference behavior, and sentence length. A learning outcome would need a separate study with learners. None is claimed here.'
  };
}
