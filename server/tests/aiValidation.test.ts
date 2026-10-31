import assert from 'assert';
import {
  GeneratedLessonSchema,
  validateGeneratedLesson,
  LessonGenerateRequestSchema,
  SimplifyRequestSchema,
  SummarizeRequestSchema,
  ExplainTermRequestSchema,
  StudyNotesRequestSchema,
  redactSecrets
} from '@conceptlens/shared';
import { AIProviderService } from '../src/services/aiProviderService';
import {
  buildDeterministicLesson,
  buildDeterministicSimplify,
  buildDeterministicSummarize,
  buildDeterministicExplainTerm,
  buildDeterministicStudyNotes
} from '../src/services/deterministicLessonBuilder';

async function runAIValidationSuite() {
  console.log('🧪 Starting ConceptLens Phase 2 AI & Lesson Validation Test Suite...\n');
  let passed = 0;
  let total = 0;

  async function test(name: string, fn: () => void | Promise<void>) {
    total++;
    try {
      await fn();
      passed++;
      console.log(`  ✅ PASS: ${name}`);
    } catch (err: unknown) {
      console.error(`  ❌ FAIL: ${name}`);
      const msg = err instanceof Error ? (err.stack || err.message) : String(err);
      console.error(msg);
      process.exitCode = 1;
    }
  }

  // --- 1. SHARED LESSON SCHEMA VALIDATION ---

  const validSampleLesson = {
    topic: 'Photosynthesis & Light Reactions',
    summary: 'The biological process by which green plants transform light energy into chemical energy.',
    explanations: {
      standard: 'Photosynthesis occurs within the chloroplasts of plant cells, specifically utilizing chlorophyll pigments inside the thylakoid membranes.',
      easyRead: 'Plants use sunlight, water, and air to make food. This gives them energy to grow.',
      stepByStep: [
        {
          stepNumber: 1,
          title: 'Light Absorption',
          explanation: 'Chlorophyll molecules inside chloroplast thylakoids capture photon energy from sunlight.'
        },
        {
          stepNumber: 2,
          title: 'Water Splitting',
          explanation: 'Water molecules are split into oxygen, protons, and high-energy electrons.'
        }
      ]
    },
    keyTerms: [
      {
        term: 'Chloroplast',
        definition: 'An organelle found in plant and algae cells where photosynthesis occurs.'
      },
      {
        term: 'Thylakoid',
        definition: 'Membrane-bound compartments inside chloroplasts that host light-dependent reactions.'
      }
    ],
    studyNotes: [
      'Photosynthesis converts carbon dioxide and water into glucose and oxygen.',
      'Light-dependent reactions produce ATP and NADPH for the Calvin cycle.'
    ],
    flashcards: [
      {
        id: 'fc-1',
        front: 'Where do light-dependent reactions take place?',
        back: 'In the thylakoid membranes of chloroplasts.'
      }
    ],
    practiceQuestions: [
      {
        id: 'q-1',
        prompt: 'Which pigment directly absorbs photons during the primary phase of photosynthesis?',
        options: ['Chlorophyll', 'Hemoglobin', 'Melanin', 'Carotene'],
        correctOptionIndex: 0,
        explanation: 'Chlorophyll absorbs red and blue wavelengths while reflecting green light.',
        sourceReference: 'Chloroplast light absorption section'
      }
    ],
    uncertaintyNotes: ['Atmospheric CO2 saturation limits were not detailed in the source.'],
    generationMetadata: {
      generationMethod: 'gemini' as const,
      model: 'gemini-1.5-flash',
      fallbackUsed: false,
      timestamp: new Date().toISOString()
    }
  };

  await test('Valid GeneratedLesson satisfies GeneratedLessonSchema', () => {
    const result = GeneratedLessonSchema.safeParse(validSampleLesson);
    assert(result.success, `Expected valid lesson to parse successfully: ${JSON.stringify(result)}`);
    assert(result.data.topic === 'Photosynthesis & Light Reactions');
    assert(result.data.practiceQuestions[0].options.length === 4);
  });

  await test('validateGeneratedLesson helper parses valid payload', () => {
    const result = validateGeneratedLesson(validSampleLesson);
    assert(result.ok === true, 'Helper must return ok: true');
    assert(result.lesson.explanations.stepByStep.length === 2);
  });

  await test('Rejects lesson with empty topic', () => {
    const invalid = { ...validSampleLesson, topic: '   ' };
    const result = GeneratedLessonSchema.safeParse(invalid);
    assert(!result.success, 'Empty topic must be rejected');
  });

  await test('Rejects lesson with excessively long topic (>160 chars)', () => {
    const invalid = { ...validSampleLesson, topic: 'A'.repeat(161) };
    const result = GeneratedLessonSchema.safeParse(invalid);
    assert(!result.success, 'Topic exceeding length bound must be rejected');
  });

  await test('Rejects practice question with fewer than 4 options', () => {
    const invalid = {
      ...validSampleLesson,
      practiceQuestions: [
        {
          ...validSampleLesson.practiceQuestions[0],
          options: ['Option 1', 'Option 2', 'Option 3'] // Only 3 options
        }
      ]
    };
    const result = GeneratedLessonSchema.safeParse(invalid);
    assert(!result.success, 'MCQ with 3 options must be rejected');
  });

  await test('Rejects practice question with more than 4 options', () => {
    const invalid = {
      ...validSampleLesson,
      practiceQuestions: [
        {
          ...validSampleLesson.practiceQuestions[0],
          options: ['Opt 1', 'Opt 2', 'Opt 3', 'Opt 4', 'Opt 5']
        }
      ]
    };
    const result = GeneratedLessonSchema.safeParse(invalid);
    assert(!result.success, 'MCQ with 5 options must be rejected');
  });

  await test('Rejects practice question with invalid correctOptionIndex (< 0 or > 3)', () => {
    const invalid1 = {
      ...validSampleLesson,
      practiceQuestions: [{ ...validSampleLesson.practiceQuestions[0], correctOptionIndex: -1 }]
    };
    const invalid2 = {
      ...validSampleLesson,
      practiceQuestions: [{ ...validSampleLesson.practiceQuestions[0], correctOptionIndex: 4 }]
    };
    assert(!GeneratedLessonSchema.safeParse(invalid1).success, 'Negative index must be rejected');
    assert(!GeneratedLessonSchema.safeParse(invalid2).success, 'Index 4 must be rejected');
  });

  await test('Rejects invalid step number (non-positive or float)', () => {
    const invalid = {
      ...validSampleLesson,
      explanations: {
        ...validSampleLesson.explanations,
        stepByStep: [{ stepNumber: 0, title: 'Step 0', explanation: 'Invalid non-positive step' }]
      }
    };
    assert(!GeneratedLessonSchema.safeParse(invalid).success, 'Step number 0 must be rejected');
  });

  await test('Rejects oversized collections (e.g. >25 practice questions)', () => {
    const oversizedQuestions = Array.from({ length: 26 }, (_, i) => ({
      id: `q-${i + 1}`,
      prompt: `Prompt number ${i + 1} for this educational test?`,
      options: ['A', 'B', 'C', 'D'],
      correctOptionIndex: 0,
      explanation: 'Explanation for question'
    }));
    const invalid = { ...validSampleLesson, practiceQuestions: oversizedQuestions };
    assert(!GeneratedLessonSchema.safeParse(invalid).success, '26 practice questions must be rejected');
  });

  // --- 2. REQUEST SCHEMAS & PAYLOAD BOUNDARIES ---

  await test('LessonGenerateRequest accepts valid input and bounds length', () => {
    assert(LessonGenerateRequestSchema.safeParse({ text: 'Valid educational text passage.' }).success);
    assert(!LessonGenerateRequestSchema.safeParse({ text: 'Short' }).success, 'Text < 10 chars rejected');
    assert(!LessonGenerateRequestSchema.safeParse({ text: 'A'.repeat(30001) }).success, 'Text > 30,000 chars rejected');
  });

  await test('SimplifyRequest bounds text size and options', () => {
    assert(SimplifyRequestSchema.safeParse({ text: 'A passage to simplify into plain words.', targetLevel: 'plain_language' }).success);
    assert(!SimplifyRequestSchema.safeParse({ text: 'A'.repeat(15001) }).success, 'Text > 15,000 chars rejected');
  });

  await test('SummarizeRequest bounds max words and text length', () => {
    assert(SummarizeRequestSchema.safeParse({ text: 'Comprehensive overview of cellular respiration.', maxLengthWords: 50 }).success);
    assert(!SummarizeRequestSchema.safeParse({ text: 'Text', maxLengthWords: 1000 }).success, 'Words > 500 rejected');
  });

  await test('ExplainTermRequest requires nonempty term bounded to 120 chars', () => {
    assert(ExplainTermRequestSchema.safeParse({ term: 'Mitochondria', context: 'Cell biology unit.' }).success);
    assert(!ExplainTermRequestSchema.safeParse({ term: '   ' }).success, 'Empty term rejected');
    assert(!ExplainTermRequestSchema.safeParse({ term: 'M'.repeat(121) }).success, 'Term > 120 chars rejected');
  });

  // --- 3. DETERMINISTIC FALLBACK BUILDERS ---

  await test('buildDeterministicLesson generates strictly schema-compliant lesson for math equation', () => {
    const lesson = buildDeterministicLesson(
      { text: 'Solve the equation 2x + 3 = 11 for variable x.', topic: 'Linear Equations' },
      'AI service not configured.'
    );
    assert(lesson.topic.includes('Equation') || lesson.topic.includes('Linear'));
    assert(lesson.generationMetadata.generationMethod === 'deterministic');
    assert(lesson.generationMetadata.fallbackUsed === true);
    assert(lesson.practiceQuestions.length >= 1);
    assert(lesson.practiceQuestions[0].options.length === 4);
    assert(lesson.practiceQuestions[0].correctOptionIndex >= 0 && lesson.practiceQuestions[0].correctOptionIndex <= 3);
    assert(GeneratedLessonSchema.safeParse(lesson).success, 'Deterministic lesson must satisfy GeneratedLessonSchema');
  });

  await test('buildDeterministicLesson generates strictly schema-compliant lesson for general biology text', () => {
    const lesson = buildDeterministicLesson(
      {
        text: 'The cell membrane is a selectively permeable phospholipid bilayer that regulates the transport of materials entering and exiting the cell.',
        topic: 'Cell Membrane'
      },
      'Provider unavailable.'
    );
    assert(lesson.keyTerms.length >= 1);
    assert(lesson.flashcards.length >= 1);
    assert(lesson.practiceQuestions.every((q) => q.options.length === 4));
    assert(GeneratedLessonSchema.safeParse(lesson).success);
  });

  await test('buildDeterministicSimplify extracts plain language and key terms', () => {
    const result = buildDeterministicSimplify(
      { text: 'The mitochondria produces adenosine triphosphate through oxidative phosphorylation.' },
      'Offline mode.'
    );
    assert(result.simplifiedText.length >= 5);
    assert(result.metadata.fallbackUsed === true);
    assert(result.metadata.generationMethod === 'deterministic');
  });

  await test('buildDeterministicSummarize creates bounded summary and key points', () => {
    const result = buildDeterministicSummarize(
      { text: 'Photosynthesis converts light into chemical energy. Chlorophyll absorbs blue and red wavelengths. Water is split to release oxygen.' },
      'Fallback triggered.'
    );
    assert(result.summary.length >= 10);
    assert(result.keyPoints.length >= 1);
    assert(result.metadata.fallbackUsed === true);
  });

  await test('buildDeterministicExplainTerm defines term and includes analogy if available', () => {
    const result = buildDeterministicExplainTerm(
      { term: 'Mitochondria', context: 'The power generator of eukaryotic cells.' },
      'Fallback triggered.'
    );
    assert(result.term === 'Mitochondria');
    assert(result.definition.length >= 5);
    assert(result.explanation.length >= 10);
  });

  await test('buildDeterministicStudyNotes generates structured bullet points and flashcards', () => {
    const result = buildDeterministicStudyNotes(
      { text: 'Newtonian mechanics describes motion under forces. F = ma is Newton second law.' },
      'Fallback triggered.'
    );
    assert(result.studyNotes.length >= 1);
    assert(Array.isArray(result.flashcards));
    assert(result.metadata.fallbackUsed === true);
  });

  // --- 4. AI PROVIDER SERVICE STATUS & CONFIGURATION ---

  await test('AIProviderService HuggingFace unconfigured status reports configured: false without error', () => {
    const provider = new AIProviderService({ provider: 'huggingface', hfToken: undefined });
    const status = provider.getStatus();
    assert.strictEqual(status.configured, false);
    assert.strictEqual(status.provider, 'huggingface');
  });

  await test('AIProviderService Gemini unconfigured status reports configured: false when apiKey is undefined', () => {
    const provider = new AIProviderService({ provider: 'gemini', geminiApiKey: undefined });
    const status = provider.getStatus();
    assert.strictEqual(status.configured, false);
    assert.strictEqual(status.provider, 'gemini');
  });

  await test('AIProviderService without token falls back deterministically to valid lesson', async () => {
    const provider = new AIProviderService({ provider: 'deterministic' });
    const lesson = await provider.generateLesson({ text: 'A singly linked list consists of nodes containing a data value and a next pointer.' });
    assert.strictEqual(lesson.generationMetadata.fallbackUsed, true);
    assert.strictEqual(lesson.generationMetadata.generationMethod, 'deterministic');
    assert(lesson.practiceQuestions.length >= 1);
    assert(GeneratedLessonSchema.safeParse(lesson).success);
  });

  // --- 5. HUGGING FACE MOCKED INTEGRATION TESTS ---

  await test('AIProviderService with mocked valid HF response returns generated lesson', async () => {
    const originalFetch = global.fetch;
    try {
      global.fetch = async () => {
        return new Response(
          JSON.stringify([
            {
              generated_text: JSON.stringify({
                topic: 'Mocked Quantum Optics',
                summary: 'An exploration of photons interacting with quantized matter states.',
                explanations: {
                  standard: 'Photons exhibit wave-particle duality and interact with atoms at resonant frequencies.',
                  easyRead: 'Light particles interact with tiny atoms in predictable packets.',
                  stepByStep: [
                    { stepNumber: 1, title: 'Photon Emission', explanation: 'Electrons drop energy levels and emit photons.' }
                  ]
                },
                keyTerms: [{ term: 'Photon', definition: 'A quantum unit of light energy.' }],
                studyNotes: ['Photons travel at speed c in vacuum.'],
                flashcards: [{ id: 'fc-1', front: 'What is a photon?', back: 'A quantum of electromagnetic radiation.' }],
                practiceQuestions: [
                  {
                    id: 'q-1',
                    prompt: 'What occurs when an electron transitions to a lower orbital?',
                    options: ['Photon emission', 'Proton decay', 'Neutron absorption', 'Zero energy change'],
                    correctOptionIndex: 0,
                    explanation: 'Energy conservation requires photon release.'
                  }
                ],
                uncertaintyNotes: ['Non-linear medium dispersion was omitted.']
              })
            }
          ]),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      };

      const provider = new AIProviderService({ provider: 'huggingface', hfToken: 'mock-valid-hf-token-12345678' });
      const lesson = await provider.generateLesson({ text: 'Quantum optics study material discussing photons.' });
      assert.strictEqual(lesson.topic, 'Mocked Quantum Optics');
      assert.strictEqual(lesson.generationMetadata.fallbackUsed, false);
      assert.strictEqual(lesson.generationMetadata.generationMethod, 'huggingface');
      assert.strictEqual(lesson.practiceQuestions[0].options.length, 4);
    } finally {
      global.fetch = originalFetch;
    }
  });

  await test('AIProviderService with mocked HF timeout triggers deterministic fallback', async () => {
    const originalFetch = global.fetch;
    try {
      global.fetch = async () => {
        const error = new Error('The operation was aborted due to timeout');
        error.name = 'TimeoutError';
        throw error;
      };

      const provider = new AIProviderService({ provider: 'huggingface', hfToken: 'mock-token-12345678', timeoutMs: 50 });
      const lesson = await provider.generateLesson({ text: 'Textbook chapter explaining Newtonian gravity.' });
      assert.strictEqual(lesson.generationMetadata.fallbackUsed, true);
      assert(lesson.generationMetadata.fallbackReason?.includes('timed out'));
      assert(GeneratedLessonSchema.safeParse(lesson).success);
    } finally {
      global.fetch = originalFetch;
    }
  });

  await test('AIProviderService with mocked HF HTTP 429 rate limit triggers deterministic fallback', async () => {
    const originalFetch = global.fetch;
    try {
      global.fetch = async () => {
        return new Response('Rate limit reached. Quota exceeded.', { status: 429 });
      };

      const provider = new AIProviderService({ provider: 'huggingface', hfToken: 'mock-token-12345678' });
      const lesson = await provider.generateLesson({ text: 'Textbook chapter on thermodynamics.' });
      assert.strictEqual(lesson.generationMetadata.fallbackUsed, true);
      assert(lesson.generationMetadata.fallbackReason?.includes('429'));
      assert(GeneratedLessonSchema.safeParse(lesson).success);
    } finally {
      global.fetch = originalFetch;
    }
  });

  await test('AIProviderService with mocked HF malformed JSON triggers deterministic fallback', async () => {
    const originalFetch = global.fetch;
    try {
      global.fetch = async () => {
        return new Response(JSON.stringify([{ generated_text: 'Not JSON at all, just broken raw prose' }]), { status: 200 });
      };

      const provider = new AIProviderService({ provider: 'huggingface', hfToken: 'mock-token-12345678' });
      const lesson = await provider.generateLesson({ text: 'Geology notes on plate tectonics.' });
      assert.strictEqual(lesson.generationMetadata.fallbackUsed, true);
      assert(lesson.generationMetadata.fallbackReason?.includes('malformed JSON') || lesson.generationMetadata.fallbackReason?.includes('schema'));
      assert(GeneratedLessonSchema.safeParse(lesson).success);
    } finally {
      global.fetch = originalFetch;
    }
  });

  await test('AIProviderService with mocked HF schema violation (3 options instead of 4) triggers fallback', async () => {
    const originalFetch = global.fetch;
    try {
      global.fetch = async () => {
        return new Response(
          JSON.stringify([
            {
              generated_text: JSON.stringify({
                topic: 'Valid Topic',
                summary: 'Valid summary text here.',
                explanations: { standard: 'Standard explanation text.', easyRead: 'Easy read text.', stepByStep: [{ stepNumber: 1, title: 'Step', explanation: 'Expl' }] },
                keyTerms: [],
                studyNotes: ['Note 1'],
                flashcards: [],
                practiceQuestions: [
                  { id: 'q-1', prompt: 'Question prompt?', options: ['A', 'B', 'C'], correctOptionIndex: 0, explanation: 'Exp' } // Only 3 options!
                ],
                uncertaintyNotes: []
              })
            }
          ]),
          { status: 200 }
        );
      };

      const provider = new AIProviderService({ provider: 'huggingface', hfToken: 'mock-token-12345678' });
      const lesson = await provider.generateLesson({ text: 'Anatomy notes about the skeletal system.' });
      assert.strictEqual(lesson.generationMetadata.fallbackUsed, true);
      assert(lesson.generationMetadata.fallbackReason?.includes('strict schema'));
      // Fallback guarantees exactly 4 options:
      assert.strictEqual(lesson.practiceQuestions[0].options.length, 4);
    } finally {
      global.fetch = originalFetch;
    }
  });

  // --- 6. GOOGLE GEMINI MOCKED INTEGRATION TESTS ---

  await test('AIProviderService with mocked Gemini Flash API produces validated lesson with generationMethod gemini', async () => {
    const originalFetch = global.fetch;
    try {
      global.fetch = async (url: string | URL | Request) => {
        const urlStr = url.toString();
        assert(urlStr.includes('generativelanguage.googleapis.com'), 'Must call Google Generative Language endpoint');
        assert(urlStr.includes('mock-gemini-key'), 'Must include API key parameter');
        return new Response(
          JSON.stringify({
            candidates: [
              {
                content: {
                  parts: [{ text: JSON.stringify(validSampleLesson) }]
                }
              }
            ]
          }),
          { status: 200 }
        );
      };

      const provider = new AIProviderService({
        provider: 'gemini',
        geminiApiKey: 'mock-gemini-key-12345'
      });
      const lesson = await provider.generateLesson({ text: 'Biochemistry chapter on cellular respiration.' });
      assert.strictEqual(lesson.generationMetadata.generationMethod, 'gemini');
      assert.strictEqual(lesson.generationMetadata.fallbackUsed, false);
      assert.strictEqual(GeneratedLessonSchema.safeParse(lesson).success, true);
    } finally {
      global.fetch = originalFetch;
    }
  });

  await test('AIProviderService Gemini sliding-window rate limit (RPM cap) triggers deterministic fallback', async () => {
    const originalFetch = global.fetch;
    try {
      global.fetch = async () => {
        return new Response(
          JSON.stringify({
            candidates: [
              {
                content: {
                  parts: [{ text: JSON.stringify(validSampleLesson) }]
                }
              }
            ]
          }),
          { status: 200 }
        );
      };

      const provider = new AIProviderService({
        provider: 'gemini',
        geminiApiKey: 'mock-gemini-key-12345',
        maxFreeRpm: 2
      });

      // Call 1 & 2 succeed
      const lesson1 = await provider.generateLesson({ text: 'Quantum optics study material discussing photons.' });
      assert.strictEqual(lesson1.generationMetadata.fallbackUsed, false);
      const lesson2 = await provider.generateLesson({ text: 'Quantum optics study material discussing photons.' });
      assert.strictEqual(lesson2.generationMetadata.fallbackUsed, false);

      // Call 3 exceeds 2 RPM limit and must trigger fallback
      const lesson3 = await provider.generateLesson({ text: 'Quantum optics study material discussing photons.' });
      assert.strictEqual(lesson3.generationMetadata.fallbackUsed, true);
      assert(lesson3.generationMetadata.fallbackReason?.includes('rate-limited locally'));
      assert.strictEqual(GeneratedLessonSchema.safeParse(lesson3).success, true);
    } finally {
      global.fetch = originalFetch;
    }
  });

  await test('AIProviderService Gemini upstream HTTP 429 triggers graceful deterministic fallback', async () => {
    const originalFetch = global.fetch;
    try {
      global.fetch = async () => {
        return new Response('Resource has been exhausted (e.g. check quota).', { status: 429 });
      };

      const provider = new AIProviderService({
        provider: 'gemini',
        geminiApiKey: 'mock-gemini-key-12345'
      });
      const lesson = await provider.generateLesson({ text: 'Physics lesson on quantum tunneling.' });
      assert.strictEqual(lesson.generationMetadata.fallbackUsed, true);
      assert(lesson.generationMetadata.fallbackReason?.includes('429'));
      assert.strictEqual(GeneratedLessonSchema.safeParse(lesson).success, true);
    } finally {
      global.fetch = originalFetch;
    }
  });

  await test('AIProviderService Gemini timeout triggers graceful deterministic fallback', async () => {
    const originalFetch = global.fetch;
    try {
      global.fetch = async () => {
        const error = new Error('The operation was aborted due to timeout');
        error.name = 'TimeoutError';
        throw error;
      };

      const provider = new AIProviderService({
        provider: 'gemini',
        geminiApiKey: 'mock-gemini-key-12345'
      });
      const lesson = await provider.generateLesson({ text: 'Neuroscience lesson on synaptic transmission.' });
      assert.strictEqual(lesson.generationMetadata.fallbackUsed, true);
      assert(lesson.generationMetadata.fallbackReason?.includes('timed out') || lesson.generationMetadata.fallbackReason?.includes('Timeout'));
      assert.strictEqual(GeneratedLessonSchema.safeParse(lesson).success, true);
    } finally {
      global.fetch = originalFetch;
    }
  });

  // --- 7. FALLBACK CHAIN: GEMINI -> HUGGING FACE -> DETERMINISTIC ---

  await test('AIProviderService default Gemini candidate model is gemini-3.1-flash-lite', () => {
    const provider = new AIProviderService({ provider: 'gemini', geminiApiKey: 'mock-key-12345' });
    const status = provider.getStatus();
    assert.strictEqual(status.model, 'gemini-3.1-flash-lite');
    assert.strictEqual(status.isFreeTier, true);
  });

  await test('Fallback chain: Gemini HTTP 429 fails over to configured Hugging Face provider successfully', async () => {
    const originalFetch = global.fetch;
    try {
      global.fetch = async (url: string | URL | Request) => {
        const urlStr = url.toString();
        if (urlStr.includes('generativelanguage.googleapis.com')) {
          return new Response('Quota exceeded (HTTP 429)', { status: 429 });
        }
        if (urlStr.includes('api-inference.huggingface.co')) {
          return new Response(
            JSON.stringify([
              {
                generated_text: JSON.stringify(validSampleLesson)
              }
            ]),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        }
        return new Response('Not found', { status: 404 });
      };

      const provider = new AIProviderService({
        provider: 'gemini',
        geminiApiKey: 'mock-gemini-key-12345',
        hfToken: 'mock-hf-token-12345',
        enableHfFallback: true
      });

      const lesson = await provider.generateLesson({ text: 'Quantum optics study material discussing photons.' });
      assert.strictEqual(lesson.generationMetadata.generationMethod, 'huggingface');
      assert.strictEqual(lesson.generationMetadata.fallbackUsed, true);
      assert(lesson.generationMetadata.fallbackReason?.includes('Primary Gemini') || lesson.generationMetadata.fallbackReason?.includes('Primary provider Gemini'));
      assert.strictEqual(GeneratedLessonSchema.safeParse(lesson).success, true);
    } finally {
      global.fetch = originalFetch;
    }
  });

  await test('Fallback chain: Gemini HTTP 503 fails over to Hugging Face provider successfully', async () => {
    const originalFetch = global.fetch;
    try {
      global.fetch = async (url: string | URL | Request) => {
        const urlStr = url.toString();
        if (urlStr.includes('generativelanguage.googleapis.com')) {
          return new Response('Service Unavailable (HTTP 503)', { status: 503 });
        }
        if (urlStr.includes('api-inference.huggingface.co')) {
          return new Response(
            JSON.stringify([
              {
                generated_text: JSON.stringify(validSampleLesson)
              }
            ]),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        }
        return new Response('Not found', { status: 404 });
      };

      const provider = new AIProviderService({
        provider: 'gemini',
        geminiApiKey: 'mock-gemini-key-12345',
        hfToken: 'mock-hf-token-12345',
        enableHfFallback: true
      });

      const lesson = await provider.generateLesson({ text: 'Biochemistry chapter on cellular respiration.' });
      assert.strictEqual(lesson.generationMetadata.generationMethod, 'huggingface');
      assert.strictEqual(lesson.generationMetadata.fallbackUsed, true);
      assert.strictEqual(GeneratedLessonSchema.safeParse(lesson).success, true);
    } finally {
      global.fetch = originalFetch;
    }
  });

  await test('Fallback chain: Gemini HTTP 429 AND Hugging Face HTTP 503 trigger graceful deterministic fallback', async () => {
    const originalFetch = global.fetch;
    try {
      global.fetch = async (url: string | URL | Request) => {
        const urlStr = url.toString();
        if (urlStr.includes('generativelanguage.googleapis.com')) {
          return new Response('Quota exceeded (HTTP 429)', { status: 429 });
        }
        if (urlStr.includes('api-inference.huggingface.co')) {
          return new Response('Model loading / service unavailable (HTTP 503)', { status: 503 });
        }
        return new Response('Not found', { status: 404 });
      };

      const provider = new AIProviderService({
        provider: 'gemini',
        geminiApiKey: 'mock-gemini-key-12345',
        hfToken: 'mock-hf-token-12345',
        enableHfFallback: true
      });

      const lesson = await provider.generateLesson({ text: 'Physics lesson on quantum mechanics and wavefunctions.' });
      assert.strictEqual(lesson.generationMetadata.generationMethod, 'deterministic');
      assert.strictEqual(lesson.generationMetadata.fallbackUsed, true);
      assert(lesson.generationMetadata.fallbackReason?.includes('Primary Gemini') || lesson.generationMetadata.fallbackReason?.includes('AI provider unavailable'));
      assert.strictEqual(GeneratedLessonSchema.safeParse(lesson).success, true);
    } finally {
      global.fetch = originalFetch;
    }
  });

  // --- 8. SECURITY & SECRET REDACTION ---

  await test('Secret tokens are completely redacted from error messages', () => {
    const secretKey = 'hf_super_secret_api_token_value_xyz';
    const rawError = `Failed to authenticate with token ${secretKey} at endpoint`;
    const sanitized = redactSecrets(rawError, [secretKey]);
    assert(!sanitized.includes(secretKey), 'Secret token must not appear in sanitized string');
    assert(sanitized.includes('[redacted]'), 'Sanitized string must contain [redacted]');
  });

  console.log(`\n========================================`);
  console.log(`Phase 2 AI Suite Results: ${passed} / ${total} tests passed.`);
  console.log(`========================================\n`);
}

runAIValidationSuite().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
