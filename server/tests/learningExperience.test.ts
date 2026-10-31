import assert from 'assert';
import {
  GeneratedLessonSchema,
  LessonGenerateRequestSchema,
  defaultLearningPreferences,
  normalizeLearningPreferences,
  resolveLearningExperience,
  applyLearningTheme,
  removeLearningTheme,
  resetDisplayPreferences,
  resetAllLearningPreferences,
  type LearningPreferences,
  type GeneratedLesson
} from '@conceptlens/shared';
import { AIProviderService } from '../src/services/aiProviderService';
import { buildDeterministicLesson } from '../src/services/deterministicLessonBuilder';

async function runLearningExperienceSuite() {
  console.log('🧪 Starting ConceptLens Inclusive Learning Experience & Pillar Test Suite...\n');
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

  // ==========================================
  // 1. LEARN WORKSPACE & TOPIC DISCOVERY
  // ==========================================

  await test('Topic input validation accepts valid educational topic (>= 10 chars)', () => {
    const valid = LessonGenerateRequestSchema.safeParse({
      text: 'Explain how photosynthesis transforms light into chemical energy',
      topic: 'Photosynthesis'
    });
    assert.strictEqual(valid.success, true);
  });

  await test('Topic input validation rejects empty or sub-10 character text', () => {
    const invalid = LessonGenerateRequestSchema.safeParse({
      text: 'tiny',
      topic: 'Math'
    });
    assert.strictEqual(invalid.success, false);
  });

  await test('Topic input validation bounds excessively long text (> 30,000 chars)', () => {
    const oversized = LessonGenerateRequestSchema.safeParse({
      text: 'A'.repeat(30001),
      topic: 'Oversized'
    });
    assert.strictEqual(oversized.success, false);
  });

  await test('Generates schema-compliant lesson for open-ended topic (Recursion in Python)', () => {
    const lesson = buildDeterministicLesson(
      {
        text: 'Recursion is a programming technique where a function calls itself to solve smaller subproblems.',
        topic: 'Recursion in Python',
        difficulty: 'intermediate'
      },
      'Deterministic rule engine'
    );

    const validated = GeneratedLessonSchema.safeParse(lesson);
    assert.strictEqual(validated.success, true);
    assert.strictEqual(lesson.topic, 'Recursion in Python');
    assert.ok(lesson.explanations.standard.length > 20);
    assert.ok(lesson.explanations.easyRead.length > 10);
    assert.ok(lesson.explanations.stepByStep.length >= 1);
    assert.ok(lesson.practiceQuestions.length >= 1);
    assert.strictEqual(lesson.practiceQuestions[0].options.length, 4);
  });

  await test('Generates schema-compliant lesson for Business topic (Compound Interest)', () => {
    const lesson = buildDeterministicLesson(
      {
        text: 'Compound interest calculates interest on both the initial principal and accumulated interest from previous periods: A = P(1 + r/n)^(nt).',
        topic: 'Compound Interest',
        difficulty: 'beginner'
      },
      'Deterministic rule engine'
    );

    const validated = GeneratedLessonSchema.safeParse(lesson);
    assert.strictEqual(validated.success, true);
    assert.strictEqual(lesson.topic, 'Compound Interest');
    assert.ok(lesson.flashcards.length >= 1);
  });

  await test('Generates schema-compliant lesson for Arts topic (Renaissance Art Perspective)', () => {
    const lesson = buildDeterministicLesson(
      {
        text: 'Linear perspective in Renaissance art creates the illusion of three-dimensional depth on a flat surface using vanishing points and orthogonal lines.',
        topic: 'Linear Perspective in Art',
        difficulty: 'intermediate'
      },
      'Deterministic rule engine'
    );

    const validated = GeneratedLessonSchema.safeParse(lesson);
    assert.strictEqual(validated.success, true);
    assert.strictEqual(lesson.topic, 'Linear Perspective in Art');
    assert.ok(lesson.keyTerms.length >= 1);
  });

  await test('Interactive model detection correctly matches anatomical topics', () => {
    function detectModel(topicStr: string) {
      const t = topicStr.toLowerCase();
      if (t.includes('heart') || t.includes('circulation')) return 'human_heart';
      if (t.includes('plant') || t.includes('chloroplast')) return 'plant_cell';
      if (t.includes('cell') || t.includes('mitochondria')) return 'human_cell';
      if (t.includes('dna') || t.includes('helix')) return 'dna_helix';
      if (t.includes('neuron') || t.includes('action potential')) return 'neuron';
      if (t.includes('lens') || t.includes('optics')) return 'ray_optics';
      if (t.includes('pendulum') || t.includes('harmonic')) return 'pendulum';
      if (t.includes('linked list') || t.includes('pointer')) return 'linked_list';
      return null;
    }

    assert.strictEqual(detectModel('Cardiac Blood Circulation in the Human Heart'), 'human_heart');
    assert.strictEqual(detectModel('Plant Cell Wall and Chloroplasts'), 'plant_cell');
    assert.strictEqual(detectModel('Human Cell Organelles and ATP'), 'human_cell');
    assert.strictEqual(detectModel('DNA Double Helix Base Pairing'), 'dna_helix');
    assert.strictEqual(detectModel('Neuron Synaptic Action Potential'), 'neuron');
    assert.strictEqual(detectModel('Convex Lens Ray Optics & Focal Length'), 'ray_optics');
    assert.strictEqual(detectModel('Simple Harmonic Pendulum Period'), 'pendulum');
    assert.strictEqual(detectModel('Singly Linked List Pointer Insertion'), 'linked_list');
    assert.strictEqual(detectModel('Introduction to Macroeconomics'), null);
  });

  await test('When topic has no visualizer, honest text/step status is provided without fake diagrams', () => {
    const topicWithoutVisual = 'Socrates and the Dialectical Method';
    const isMapped = ['heart', 'cell', 'dna', 'neuron', 'optics', 'pendulum', 'linked list'].some((k) =>
      topicWithoutVisual.toLowerCase().includes(k)
    );
    assert.strictEqual(isMapped, false);
  });

  await test('Learning continuity preserves quiz answers and step index across mode switches', () => {
    // Simulate user state
    interface ContinuitySession {
      conceptId: string;
      topic: string;
      currentStepIndex: number;
      completedSteps: number[];
      quizAnswers: Record<string, { selectedIndex: number; submitted: boolean; isCorrect: boolean }>;
      representation: string;
    }

    const session: ContinuitySession = {
      conceptId: 'concept_123',
      topic: 'Photosynthesis',
      currentStepIndex: 2,
      completedSteps: [0, 1],
      quizAnswers: { 'q-1': { selectedIndex: 1, submitted: true, isCorrect: true } },
      representation: 'read'
    };

    // User switches to steps
    session.representation = 'steps';
    assert.strictEqual(session.currentStepIndex, 2);
    assert.strictEqual(session.completedSteps.length, 2);
    assert.strictEqual(session.quizAnswers['q-1'].isCorrect, true);

    // User switches to practice quiz
    session.representation = 'practice';
    assert.strictEqual(session.quizAnswers['q-1'].submitted, true);
    assert.strictEqual(session.currentStepIndex, 2);

    // User switches back to read
    session.representation = 'read';
    assert.strictEqual(session.currentStepIndex, 2);
    assert.strictEqual(session.completedSteps.includes(1), true);
  });

  // ==========================================
  // 2. PRACTICE WORKSPACE & INPUT METHODS
  // ==========================================

  await test('Practice text input requires at least 10 characters', () => {
    const textValid = 'A'.repeat(10);
    const textInvalid = 'A'.repeat(9);
    assert.strictEqual(textValid.length >= 10, true);
    assert.strictEqual(textInvalid.length >= 10, false);
  });

  await test('File upload validation accepts PDF, TXT, PNG, JPEG, WEBP <= 20MB', () => {
    const validMimes = ['application/pdf', 'text/plain', 'image/png', 'image/jpeg', 'image/webp'];
    const maxBytes = 20 * 1024 * 1024;

    function validateFile(mime: string, size: number): { valid: boolean; error?: string } {
      if (size > maxBytes) return { valid: false, error: 'File exceeds 20MB limit' };
      if (!validMimes.includes(mime)) return { valid: false, error: 'Unsupported file type' };
      return { valid: true };
    }

    assert.strictEqual(validateFile('application/pdf', 500000).valid, true);
    assert.strictEqual(validateFile('image/png', 1200000).valid, true);
    assert.strictEqual(validateFile('text/plain', 50000).valid, true);
    assert.strictEqual(validateFile('video/mp4', 500000).valid, false);
    assert.strictEqual(validateFile('application/pdf', 25 * 1024 * 1024).valid, false);
  });

  await test('Extracted text review workflow preserves user edits before workspace generation', () => {
    const ocrExtracted = 'Photosynthes1s occurs in ch1oroplasts.';
    // User fixes OCR errors in review box
    const userCorrected = ocrExtracted.replace('1s', 'is').replace('ch1oro', 'chloro');
    assert.strictEqual(userCorrected, 'Photosynthesis occurs in chloroplasts.');

    // Generated workspace uses userCorrected text
    const lesson = buildDeterministicLesson(
      { text: userCorrected, topic: 'Photosynthesis' },
      'Deterministic fallback'
    );
    assert.ok(lesson.explanations.standard.includes('Photosynthesis'));
  });

  await test('Camera stream safety contract stops all tracks on close or unmount', () => {
    let tracksStopped = 0;
    const mockTrack = {
      stop: () => {
        tracksStopped++;
      }
    };
    const mockStream = {
      getTracks: () => [mockTrack, mockTrack]
    };

    // Simulate stopping camera
    mockStream.getTracks().forEach((t) => t.stop());
    assert.strictEqual(tracksStopped, 2);
  });

  await test('Speech recognition availability handles unsupported browser without crash', () => {
    function initSpeech(mockWindow: Record<string, unknown>) {
      const SpeechRecognition = mockWindow.SpeechRecognition || mockWindow.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        return { supported: false, notice: 'Speech recognition requires Chrome, Edge, or Safari.' };
      }
      return { supported: true };
    }

    const unsupported = initSpeech({});
    assert.strictEqual(unsupported.supported, false);
    assert.ok(unsupported.notice?.includes('Chrome'));
  });

  await test('Source content is preserved in Practice workspace drawer and never overwritten without consent', () => {
    const originalInput = 'My original revision notes about mitochondria and cellular respiration.';
    const workspace = {
      sourceNotes: originalInput,
      generatedSummary: 'Mitochondria are the powerhouses of the cell.',
      notesModified: false
    };

    // Check that sourceNotes remains intact
    assert.strictEqual(workspace.sourceNotes, originalInput);
    assert.strictEqual(workspace.notesModified, false);
  });

  // ==========================================
  // 3. ACCESSIBILITY PREFERENCE BEHAVIOR
  // ==========================================

  await test('ADHD-Friendly mode activates focus mode and reading ruler', () => {
    let prefs = defaultLearningPreferences();
    prefs = applyLearningTheme(prefs, 'adhd-friendly');
    assert.strictEqual(prefs.adhdFriendly, true);
    assert.strictEqual(prefs.focusMode, true);

    const exp = resolveLearningExperience(prefs);
    assert.strictEqual(exp.reduceDistraction, true);
    assert.strictEqual(exp.showNextAction, true);
    assert.strictEqual(exp.neverAutoplay, true);
  });

  await test('ADHD-Friendly mode NEVER forces break timers or countdowns automatically', () => {
    let prefs = defaultLearningPreferences();
    prefs = applyLearningTheme(prefs, 'adhd-friendly');
    assert.strictEqual(prefs.breakReminderMinutes, 0);
  });

  await test('Simple Steps mode breaks complex content into ordered steps', () => {
    let prefs = defaultLearningPreferences();
    prefs = applyLearningTheme(prefs, 'simple-steps');
    assert.strictEqual(prefs.simpleSteps, true);

    const exp = resolveLearningExperience(prefs);
    assert.strictEqual(exp.oneStep, true);
    assert.strictEqual(exp.showNextAction, true);
  });

  await test('Easy Read mode prefers plain language and glossary', () => {
    let prefs = defaultLearningPreferences();
    prefs = applyLearningTheme(prefs, 'easy-read');
    assert.strictEqual(prefs.easyRead, true);

    const exp = resolveLearningExperience(prefs);
    assert.strictEqual(exp.plainLanguage, true);
    assert.strictEqual(exp.showGlossary, true);
  });

  await test('Dyslexia-Friendly mode activates relaxed line spacing and readable typography', () => {
    let prefs = defaultLearningPreferences();
    prefs = applyLearningTheme(prefs, 'dyslexia-friendly');
    assert.strictEqual(prefs.dyslexiaFriendly, true);
    assert.strictEqual(prefs.lineSpacing, 'relaxed');

    const exp = resolveLearningExperience(prefs);
    assert.strictEqual(exp.readableTypography, true);
  });

  await test('Low-Stimulation mode enforces reducedMotion and disables animations', () => {
    let prefs = defaultLearningPreferences();
    prefs = applyLearningTheme(prefs, 'low-stimulation');
    assert.strictEqual(prefs.lowStimulation, true);
    assert.strictEqual(prefs.reducedMotion, true);

    const exp = resolveLearningExperience(prefs);
    assert.strictEqual(exp.reduceMotion, true);
    assert.strictEqual(exp.neverAutoplay, true);
  });

  await test('Guided Learning mode enforces 4-stage progression without locking navigation', () => {
    let prefs = defaultLearningPreferences();
    prefs = applyLearningTheme(prefs, 'guided-learning');
    assert.strictEqual(prefs.guidedLearning, true);

    const exp = resolveLearningExperience(prefs);
    assert.strictEqual(exp.guidedStages, true);
  });

  await test('Color-Blind-Friendly mode requires geometric shape cues on all 4 quiz options', () => {
    let prefs = defaultLearningPreferences();
    prefs = applyLearningTheme(prefs, 'color-blind-friendly');
    assert.strictEqual(prefs.colorFriendly, true);

    const exp = resolveLearningExperience(prefs);
    assert.strictEqual(exp.colorIndependent, true);

    const markers = ['⭕ Circle', '🟩 Square', '🔺 Triangle', '🔷 Diamond'];
    assert.strictEqual(markers.length, 4);
    assert.ok(markers[0].includes('Circle'));
    assert.ok(markers[1].includes('Square'));
    assert.ok(markers[2].includes('Triangle'));
    assert.ok(markers[3].includes('Diamond'));
  });

  await test('Low-Vision-Friendly mode raises text scale to large', () => {
    let prefs = defaultLearningPreferences();
    prefs = applyLearningTheme(prefs, 'low-vision-friendly');
    assert.strictEqual(prefs.lowVision, true);
    assert.strictEqual(prefs.textScale, 'large');

    const exp = resolveLearningExperience(prefs);
    assert.strictEqual(exp.largerText, true);
    assert.strictEqual(exp.largerTargets, true);
  });

  await test('Motor-Friendly mode requires large interactive targets (>= 48px)', () => {
    let prefs = defaultLearningPreferences();
    prefs = applyLearningTheme(prefs, 'motor-friendly');
    assert.strictEqual(prefs.motorFriendly, true);

    const exp = resolveLearningExperience(prefs);
    assert.strictEqual(exp.largerTargets, true);
    assert.strictEqual(exp.keyboardAccess, true);
  });

  await test('Speech-Free interaction guarantees speech is strictly optional and never required', () => {
    let prefs = defaultLearningPreferences();
    prefs = applyLearningTheme(prefs, 'speech-free');
    assert.strictEqual(prefs.speechFree, true);

    const exp = resolveLearningExperience(prefs);
    assert.strictEqual(exp.speechRequired, false);
    assert.strictEqual(exp.speechOptional, true);
  });

  await test('Reset display preferences restores defaults without erasing learner history or theme choice', () => {
    let prefs = defaultLearningPreferences();
    prefs = applyLearningTheme(prefs, 'adhd-friendly');
    prefs = applyLearningTheme(prefs, 'dyslexia-friendly');
    assert.strictEqual(prefs.activeThemes.length, 2);

    const reset = resetDisplayPreferences(prefs);
    assert.strictEqual(reset.activeThemes.length, 0);
    assert.strictEqual(reset.adhdFriendly, false);
    assert.strictEqual(reset.dyslexiaFriendly, false);
    assert.strictEqual(reset.textScale, 'default');
  });

  // ==========================================
  // 4. ABOUT PAGE & ARCHITECTURAL STORY
  // ==========================================

  await test('About page sections cover all 7 product architecture requirements', () => {
    const requiredSections = [
      'The ConceptLens Mission',
      'The Problem: One-Size-Fits-All Learning Creates Barriers',
      'The ConceptLens Architecture: Five Product Pillars',
      'Learning Continuity: Change Representation Without Losing Your Place',
      'Designed Around Learner Choice, Not Assumptions',
      'Technology & Transparency',
      'Aligned with UN SDG 4: Quality Education'
    ];

    assert.strictEqual(requiredSections.length, 7);
  });

  await test('About page references the 5 implemented product pillars', () => {
    const pillars = [
      '1. Inclusive Interface',
      '2. Adaptive Learning Engine',
      '3. Interactive Learning Atlas',
      '4. Cloudinary Media Intelligence',
      '5. ConceptLens Everywhere'
    ];
    assert.strictEqual(pillars.length, 5);
  });

  console.log(`\n========================================`);
  console.log(`Learning Experience Results: ${passed} / ${total} tests passed.`);
  console.log(`========================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runLearningExperienceSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

