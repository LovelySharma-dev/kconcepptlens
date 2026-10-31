import {
  composeMaterial,
  type PracticeKey,
  type GeneratedLesson,
  GeneratedLessonSchema,
  type SimplifyRequest,
  type SimplifyResponse,
  SimplifyResponseSchema,
  type SummarizeRequest,
  type SummarizeResponse,
  SummarizeResponseSchema,
  type ExplainTermRequest,
  type ExplainTermResponse,
  ExplainTermResponseSchema,
  type StudyNotesRequest,
  type StudyNotesResponse,
  StudyNotesResponseSchema,
  type LessonGenerateRequest,
  type GeneratedKeyTerm,
  type GeneratedPracticeQuestion,
  type GeneratedFlashcard,
  type GeneratedStep
} from '@conceptlens/shared';

function ensureFourOptions(
  options: string[],
  correctIndex: number,
  fallbackContext: string
): { options: [string, string, string, string]; correctIndex: number } {
  let opts = options.filter((o) => o && o.trim().length > 0);
  let cIdx = Math.max(0, Math.min(correctIndex, Math.max(0, opts.length - 1)));
  const correctVal = opts[cIdx] || 'Correct answer';

  // If fewer than 4, add relevant distractors
  const distractors = [
    'None of the above',
    'Cannot be determined from the source',
    'Both options are partially applicable',
    'Only applicable under inverted assumptions',
    'Alternative unrelated factor'
  ];

  let dIdx = 0;
  while (opts.length < 4) {
    const candidate = distractors[dIdx % distractors.length];
    if (!opts.includes(candidate)) {
      opts.push(candidate);
    } else {
      opts.push(`${candidate} (${opts.length + 1})`);
    }
    dIdx++;
  }

  // If more than 4, slice to 4 ensuring the correct option stays included
  if (opts.length > 4) {
    if (cIdx >= 4) {
      opts[3] = correctVal;
      cIdx = 3;
    }
    opts = opts.slice(0, 4);
  }

  return {
    options: [opts[0], opts[1], opts[2], opts[3]],
    correctIndex: cIdx
  };
}

/**
 * Builds a strictly-validated GeneratedLesson using deterministic parsing and domain rules.
 * Never invents facts or claims to be a generative AI model.
 */
export function buildDeterministicLesson(
  input: LessonGenerateRequest,
  fallbackReason: string
): GeneratedLesson {
  const { explanation, keys } = composeMaterial({
    text: input.text,
    sourceKind: 'learner_text'
  });

  const topic = (input.topic?.trim() || explanation.mainConcept || 'Educational Topic').slice(0, 150);

  // Combine section paragraphs for standard explanation
  const sectionText = explanation.sections
    .flatMap((s) => s.paragraphs)
    .filter(Boolean)
    .join('\n\n')
    .trim();

  const standard = (
    sectionText.length >= 20
      ? sectionText
      : `${input.text.trim()}\n\nThis material is organized around ${topic}.`
  ).slice(0, 9500);

  let easyRead = (
    explanation.plainLanguage && explanation.plainLanguage.length >= 15
      ? explanation.plainLanguage
      : explanation.sections[0]?.paragraphs[0] && explanation.sections[0].paragraphs[0].length >= 15
      ? explanation.sections[0].paragraphs[0]
      : `Simple overview: This educational lesson focuses on ${topic}.`
  ).slice(0, 5500);

  // Generate steps
  const steps: GeneratedStep[] =
    explanation.steps.length > 0
      ? explanation.steps.slice(0, 15).map((s, idx) => ({
          stepNumber: idx + 1,
          title: (s.title || `Step ${idx + 1}`).slice(0, 110),
          explanation: (s.detail || 'Follow this step carefully based on the source text.').slice(0, 2500)
        }))
      : [
          {
            stepNumber: 1,
            title: 'Identify Core Idea',
            explanation: (
              explanation.sections[0]?.paragraphs[0] && explanation.sections[0].paragraphs[0].length >= 10
                ? explanation.sections[0].paragraphs[0]
                : input.text.length >= 10
                ? input.text
                : `Review the foundational principles and core concepts of ${topic}.`
            ).slice(0, 2500)
          },
          {
            stepNumber: 2,
            title: 'Analyze Concept Details',
            explanation: (explanation.sections[0]?.paragraphs[1] || 'Examine how the relationships and rules operate together.').slice(0, 2500)
          },
          {
            stepNumber: 3,
            title: 'Verify Understanding',
            explanation: 'Check the key terms and test your knowledge with the practice question.'
          }
        ];

  // Key terms from glossary or source text
  const keyTerms: GeneratedKeyTerm[] =
    explanation.glossary.length > 0
      ? explanation.glossary.slice(0, 20).map((g) => ({
          term: g.term.slice(0, 90),
          definition: g.meaning.slice(0, 900)
        }))
      : [
          {
            term: topic,
            definition: explanation.learningObjective || 'The primary educational topic analyzed in this material.'
          }
        ];

  // Study notes
  const notes: string[] = [];
  if (explanation.learningObjective) notes.push(`Objective: ${explanation.learningObjective}`);
  if (explanation.verified.length > 0) notes.push(...explanation.verified);
  explanation.sections.forEach((s) => {
    s.paragraphs.forEach((p) => {
      if (p.length > 20 && p.length < 500 && !notes.includes(p)) {
        notes.push(p);
      }
    });
  });
  if (notes.length === 0) {
    notes.push(`Key takeaway: Understanding ${topic} based on the supplied source text.`);
  }

  // Flashcards from terms and steps
  const flashcards: GeneratedFlashcard[] = [];
  keyTerms.forEach((kt, idx) => {
    flashcards.push({
      id: `fc-term-${idx + 1}`,
      front: `What is ${kt.term}?`.slice(0, 450),
      back: kt.definition.slice(0, 1800)
    });
  });
  if (flashcards.length === 0) {
    flashcards.push({
      id: 'fc-default-1',
      front: `What is the main topic of this lesson?`,
      back: topic
    });
  }

  // Practice questions with exactly 4 options
  const practiceQuestions: GeneratedPracticeQuestion[] = [];
  if (explanation.practice.length > 0) {
    explanation.practice.slice(0, 5).forEach((p, idx) => {
      const matchingKey = keys.find((k: PracticeKey) => k.id === p.id);
      const rawCIdx = matchingKey ? matchingKey.correctOptionIndex : 0;
      const { options, correctIndex } = ensureFourOptions(p.options, rawCIdx, p.prompt);

      practiceQuestions.push({
        id: p.id || `q-${idx + 1}`,
        prompt: p.prompt.slice(0, 1100),
        options,
        correctOptionIndex: correctIndex,
        explanation: (matchingKey?.correctFeedback || p.hint || 'Review the source material to confirm the answer.').slice(0, 1800),
        sourceReference: `Derived from ${explanation.mainConcept || 'source text'}`
      });
    });
  }

  // Fallback question if none existed
  if (practiceQuestions.length === 0) {
    const correctAns = keyTerms[0]?.definition || topic;
    practiceQuestions.push({
      id: 'q-auto-1',
      prompt: `Which statement accurately reflects the concept of "${topic}"?`,
      options: [
        correctAns.slice(0, 300),
        'It operates contrary to the primary principles described in the text.',
        'It was completely omitted from the analyzed study material.',
        'It has no direct relationship with the described system.'
      ],
      correctOptionIndex: 0,
      explanation: `Based on the source text, ${topic} is described as: ${correctAns}`.slice(0, 1800),
      sourceReference: `Section: ${topic}`
    });
  }

  const lesson: GeneratedLesson = {
    topic,
    summary: (explanation.learningObjective || notes[0] || `Overview of ${topic}`).slice(0, 2500),
    explanations: {
      standard,
      easyRead,
      stepByStep: steps
    },
    keyTerms,
    studyNotes: notes.slice(0, 25).map((n) => n.slice(0, 900)),
    flashcards: flashcards.slice(0, 25),
    practiceQuestions,
    uncertaintyNotes: [
      'Generated using deterministic rule engine. No generative AI model was called.',
      ...explanation.uncertaintyNotes
    ],
    generationMetadata: {
      generationMethod: 'deterministic',
      model: 'deterministic-rules',
      fallbackUsed: true,
      fallbackReason,
      timestamp: new Date().toISOString()
    }
  };

  return GeneratedLessonSchema.parse(lesson);
}

/**
 * Builds a deterministic simplified version of the provided text.
 */
export function buildDeterministicSimplify(
  input: SimplifyRequest,
  fallbackReason: string
): SimplifyResponse {
  const { explanation } = composeMaterial({
    text: input.text,
    sourceKind: 'learner_text'
  });

  const simplified =
    explanation.plainLanguage ||
    explanation.sections[0]?.paragraphs[0] ||
    input.text
      .split(/(?<=[.!?])\s+/)
      .slice(0, 4)
      .join(' ');

  const response: SimplifyResponse = {
    originalText: input.text,
    simplifiedText: simplified.slice(0, 15000),
    keyTerms: explanation.glossary.slice(0, 10).map((g) => ({
      term: g.term.slice(0, 90),
      definition: g.meaning.slice(0, 900)
    })),
    uncertaintyNotes: [
      'Deterministic rule-based simplification applied.',
      'AI provider was unavailable or unconfigured.'
    ],
    metadata: {
      generationMethod: 'deterministic',
      model: 'deterministic-rules',
      fallbackUsed: true,
      fallbackReason,
      timestamp: new Date().toISOString()
    }
  };

  return SimplifyResponseSchema.parse(response);
}

/**
 * Builds a deterministic summary with key points.
 */
export function buildDeterministicSummarize(
  input: SummarizeRequest,
  fallbackReason: string
): SummarizeResponse {
  const sentences = input.text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 10);

  const keyPoints = (sentences.length > 0 ? sentences.slice(0, 5) : [input.text]).map((s) => s.slice(0, 500));
  const summary = keyPoints.slice(0, 2).join(' ').slice(0, 3500);

  const response: SummarizeResponse = {
    summary: summary.length >= 10 ? summary : 'Key educational takeaways extracted from source.',
    keyPoints: keyPoints.length > 0 ? keyPoints : ['Main idea captured from supplied material.'],
    sourceGrounding: `Derived from ${sentences.length} sentences of submitted text.`,
    metadata: {
      generationMethod: 'deterministic',
      model: 'deterministic-rules',
      fallbackUsed: true,
      fallbackReason,
      timestamp: new Date().toISOString()
    }
  };

  return SummarizeResponseSchema.parse(response);
}

/**
 * Deterministically explains a term from glossary or context.
 */
export function buildDeterministicExplainTerm(
  input: ExplainTermRequest,
  fallbackReason: string
): ExplainTermResponse {
  const { explanation } = composeMaterial({
    text: input.context || input.term,
    sourceKind: 'learner_text'
  });

  const matched = explanation.glossary.find(
    (g) => g.term.toLowerCase() === input.term.toLowerCase()
  );

  const definition = matched?.meaning || `An important term (${input.term}) within ${input.subject || 'this study area'}.`;
  const detailedExplanation =
    explanation.sections[0]?.paragraphs[0] ||
    `${input.term} represents a core concept. In the given context, it designates the principle or element responsible for this behavior.`;

  const response: ExplainTermResponse = {
    term: input.term,
    definition: definition.slice(0, 900),
    explanation: detailedExplanation.slice(0, 3500),
    analogy: explanation.everydayExample ? explanation.everydayExample.slice(0, 1400) : undefined,
    uncertaintyNotes: ['Extracted using deterministic rule engine.'],
    metadata: {
      generationMethod: 'deterministic',
      model: 'deterministic-rules',
      fallbackUsed: true,
      fallbackReason,
      timestamp: new Date().toISOString()
    }
  };

  return ExplainTermResponseSchema.parse(response);
}

/**
 * Deterministically extracts study notes and flashcards.
 */
export function buildDeterministicStudyNotes(
  input: StudyNotesRequest,
  fallbackReason: string
): StudyNotesResponse {
  const lesson = buildDeterministicLesson({ text: input.text, topic: input.topic }, fallbackReason);

  const response: StudyNotesResponse = {
    topic: lesson.topic,
    studyNotes: lesson.studyNotes,
    keyTerms: lesson.keyTerms,
    flashcards: input.includeFlashcards !== false ? lesson.flashcards : undefined,
    metadata: {
      generationMethod: 'deterministic',
      model: 'deterministic-rules',
      fallbackUsed: true,
      fallbackReason,
      timestamp: new Date().toISOString()
    }
  };

  return StudyNotesResponseSchema.parse(response);
}
