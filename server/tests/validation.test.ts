import fs from 'fs';
import path from 'path';
import { validateLinkedListInvariants } from '../src/services/validationService';
import { generateExecutionSteps } from '../src/services/stepEngine';
import { curatedPYQs } from '../src/routes/pyqs';
import { interpretDiagram } from '../src/services/interpretationService';
import { biologyLessonsCatalog } from '../src/services/biologyCatalog';
import { isCloudinaryConfigured, getOptimizedDiagramUrl, isSafePublicId, inspectDirectUpload } from '../src/config/cloudinary';
import {
  buildTextSnapshot,
  initialContinuity,
  lowDataDeliveryUrl,
  markStepComplete,
  misconceptionFor,
  modesForLesson,
  optionFeedback,
  recordAnswer,
  SDG_4_NOTE,
  SDG_CONNECTIONS,
  sdgForConcept,
  selectStructure,
  switchLearningMode,
  type LearningUnitInput
} from '../../shared/src/learning/barrierless';
import {
  activePreferenceLabels,
  defaultLearningPreferences,
  lessonImageWidth,
  readThemeChoice,
  resetAllLearningPreferences,
  resolveTheme,
  normalizeLearningPreferences,
  preferencesIncludeDiagnosis,
  resetDisplayPreferences,
  respectSystemReducedMotion,
  shouldMount3D,
  vocabularyFromComponent
} from '../../shared/src/learning/preferences';
import {
  applyLearningTheme,
  learningThemeGroups,
  removeLearningTheme,
  resolveLearningExperience
} from '../../shared/src/learning/themes';
import { adaptConceptContent, type ConceptSource } from '../../shared/src/learning/content';
import { THEME_RESOLUTION } from '../../shared/src/learning/themes';
import {
  appendLearningEvent,
  assessedConceptId,
  clearLessonEvents,
  evidenceStoresDiagnosis,
  normalizeEvidence,
  objectivesForLesson,
  progressStage,
  recommendNextStep,
  summarizeLesson,
  type LearningEvent
} from '../../shared/src/learning/adaptive';
import { educationalDeliveryUrl } from '../../client/src/cloudinary/educationalImage';
import { EDUCATIONAL_ASSETS } from '../../client/src/data/educationalMedia';

async function runTestSuite() {
  console.log('🧪 Starting ConceptLens 2.0 Invariant & Pipeline Test Suite...\n');

  const fixturesDir = path.resolve(__dirname, '../../fixtures');
  let passedCount = 0;
  let totalCount = 0;

  function assert(condition: boolean, testName: string) {
    totalCount++;
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passedCount++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      process.exitCode = 1;
    }
  }

  // Test 1: ISC 2023 Specimen Question 11
  const iscFixture = JSON.parse(
    fs.readFileSync(path.join(fixturesDir, 'isc-2023-specimen-q11.json'), 'utf-8')
  );
  const iscValidation = validateLinkedListInvariants(iscFixture.graph);
  assert(iscValidation.isValid === true, 'ISC 2023 Specimen Q11 graph satisfies all invariants');
  assert(iscValidation.floydCycleDetected === false, 'ISC 2023 graph is verified acyclic');

  const iscSteps = generateExecutionSteps(iscFixture.graph, {
    operation: 'insertHead',
    value: 9
  });
  assert(iscSteps.length === 4, 'ISC 2023 insertHead generates exactly 4 discrete execution steps');
  assert(
    iscSteps[3].currentGraph.headId === iscSteps[1].mutatedNodeId,
    'ISC 2023 final step correctly points head to newly allocated node'
  );

  // Test 2: synthetic delete-node fixture
  const annaFixture = JSON.parse(
    fs.readFileSync(path.join(fixturesDir, 'delete-node-synthetic.json'), 'utf-8')
  );
  const annaValidation = validateLinkedListInvariants(annaFixture.graph);
  assert(annaValidation.isValid === true, 'Synthetic delete-node graph satisfies all invariants');

  const annaSteps = generateExecutionSteps(annaFixture.graph, {
    operation: 'deleteNode',
    targetValue: 200
  });
  assert(
    annaSteps[2].currentGraph.nodes.length === 3,
    'DeleteNode correctly decreases list size to 3 nodes'
  );

  // Test 3: Reversal Benchmark
  const reverseFixture = JSON.parse(
    fs.readFileSync(path.join(fixturesDir, 'reverse-linked-list.json'), 'utf-8')
  );
  const reverseValidation = validateLinkedListInvariants(reverseFixture.graph);
  assert(reverseValidation.isValid === true, 'Reverse linked list fixture passes structural invariants');

  const reverseSteps = generateExecutionSteps(reverseFixture.graph, {
    operation: 'reverseList'
  });
  assert(
    reverseSteps[reverseSteps.length - 1].currentGraph.headId === 'node_d',
    'Reversal correctly updates head to former tail node_d'
  );

  // Test 4: Malformed Cycle Invariant Gate (Gate 05 Test)
  const cycleFixture = JSON.parse(
    fs.readFileSync(path.join(fixturesDir, 'malformed-cycle.json'), 'utf-8')
  );
  const cycleValidation = validateLinkedListInvariants(cycleFixture.graph);
  assert(
    cycleValidation.isValid === false,
    'Gate 05 correctly rejects diagram containing unannounced cycle'
  );
  assert(
    cycleValidation.floydCycleDetected === true,
    'Floyd Cycle Finding Algorithm successfully detected loop between n3 and n1'
  );

  // Test 5: Low Confidence OCR Gate (Gate 06 Test)
  const ocrFixture = JSON.parse(
    fs.readFileSync(path.join(fixturesDir, 'ambiguous-label.json'), 'utf-8')
  );
  const ocrValidation = validateLinkedListInvariants(ocrFixture.graph);
  assert(
    ocrValidation.needsHumanReview === true,
    'Gate 06 successfully flags low-confidence OCR node (?B7) for human review'
  );
  assert(
    ocrValidation.issues.some((i) => i.gate === 'GATE_06_HUMAN_REVIEW'),
    'Gate 06 issues contain explicit human-in-the-loop review recommendation'
  );

  // Test 6: Doubly Linked List Operations & Invariants
  const doublyGraph = {
    headId: 'd1',
    structureType: 'doubly' as const,
    isCircular: false,
    nodes: [
      { id: 'd1', value: 10, next: 'd2', prev: null, address: '0x1020', x: 80, y: 180, confidence: 1.0 },
      { id: 'd2', value: 20, next: null, prev: 'd1', address: '0x1040', x: 260, y: 180, confidence: 1.0 }
    ]
  };
  const doublyValidation = validateLinkedListInvariants(doublyGraph);
  assert(doublyValidation.isValid === true, 'Doubly linked list graph passes bidirectional invariants');

  const doublySteps = generateExecutionSteps(doublyGraph, {
    operation: 'insertDoublyHead',
    value: 5
  });
  assert(doublySteps.length === 5, 'insertDoublyHead generates exactly 5 discrete steps');
  assert(
    doublySteps[4].currentGraph.nodes[0].next === 'd1' && doublySteps[4].currentGraph.nodes[1].prev === doublySteps[4].currentGraph.headId,
    'Doubly linked list correctly established forward and backward pointer links'
  );

  // Test 7: Dangling Prev Pointer Rejection
  const invalidDoublyGraph = {
    headId: 'd1',
    structureType: 'doubly' as const,
    isCircular: false,
    nodes: [
      { id: 'd1', value: 10, next: null, prev: 'non_existent_prev', address: '0x1020', x: 80, y: 180, confidence: 1.0 }
    ]
  };
  const invalidDoublyValidation = validateLinkedListInvariants(invalidDoublyGraph);
  assert(
    invalidDoublyValidation.isValid === false,
    'Gate 05 correctly rejects dangling backward (prev) pointer'
  );

  // Test 8: PYQ Intelligence Repository (Feature 4)
  assert(
    curatedPYQs.length >= 10,
    `PYQ Question Bank contains 10+ indexed questions (currently ${curatedPYQs.length})`
  );

  const boardsPresent = new Set(curatedPYQs.map((q) => q.exam.boardOrUniversity));
  assert(
    boardsPresent.has('ISC') && boardsPresent.has('CBSE') && boardsPresent.has('Anna University') && boardsPresent.has('GATE'),
    'Practice prompt catalog includes ISC, CBSE, Anna University, and GATE labels'
  );

  // Assert every single PYQ initialGraph satisfies structural invariants
  const allPyqsValid = curatedPYQs.every((q) => {
    const val = validateLinkedListInvariants(q.initialGraph);
    return val.isValid;
  });
  assert(
    allPyqsValid,
    'All 11 curated PYQ initial diagrams strictly satisfy linked-list structural invariants'
  );

  // Test Search & Filtering Logic
  const iscQuestions = curatedPYQs.filter((q) => q.exam.boardOrUniversity === 'ISC');
  assert(iscQuestions.length >= 3, 'Filter by Board: ISC label returns at least 3 practice prompts');

  const insertQuestions = curatedPYQs.filter((q) => q.conceptTag.toLowerCase().includes('insertion'));
  assert(insertQuestions.length >= 4, 'Filter by Concept: Insertion returns at least 4 questions');

  // Test 9: Physics Diagram Ingestion & Interactive Simulation Model Generation
  const opticsRes = await interpretDiagram({
    imageUrl: 'https://example.com/convex_lens_paper.png',
    diagramType: 'ray_optics',
    sourceContext: 'Physics Geometrical Optics'
  });
  assert(opticsRes.domain === 'physics', 'AI pipeline classifies optics image as Physics domain');
  assert(opticsRes.physicsModel?.type === 'ray_optics', 'Generates interactive Convex Lens ray tracing model');
  assert(opticsRes.physicsModel?.interactiveControls.length! >= 3, 'Optics model exposes interactive controls (u, f, ho)');

  const pendulumRes = await interpretDiagram({
    imageUrl: 'https://example.com/pendulum_fbd.png',
    diagramType: 'pendulum',
    sourceContext: 'Physics Oscillations'
  });
  assert(pendulumRes.physicsModel?.type === 'pendulum', 'Generates interactive Simple Pendulum SHM model');
  assert(pendulumRes.physicsModel?.formulas.length! >= 3, 'Pendulum model includes period and energy conservation formulas');

  // Synthetic edge cases for invariant gate coverage.
  const selfLoop = { headId: 'only', structureType: 'circular' as const, isCircular: true, nodes: [{ id: 'only', value: 1, next: 'only', x: 80, y: 180, confidence: 1 }] };
  const selfLoopResult = validateLinkedListInvariants(selfLoop);
  assert(selfLoopResult.isValid, 'Declared single-node circular self-loop is accepted');
  assert(!selfLoopResult.orphanNodeIds.length, 'Circular self-loop head remains reachable');

  const disconnected = { headId: 'head', isCircular: false, nodes: [
    { id: 'head', value: 1, next: null, x: 80, y: 180, confidence: 1 },
    { id: 'orphan', value: 2, next: null, x: 260, y: 180, confidence: 1 }
  ] };
  const disconnectedResult = validateLinkedListInvariants(disconnected);
  assert(disconnectedResult.isValid && disconnectedResult.needsHumanReview, 'Disconnected nodes are flagged for review without being silently discarded');
  assert(disconnectedResult.orphanNodeIds.includes('orphan'), 'Orphan node id is reported');

  const longChainNodes = Array.from({ length: 24 }, (_, index) => ({
    id: `long_${index}`, value: index, next: index === 23 ? null : `long_${index + 1}`, x: 80 + index * 180, y: 180, confidence: 1
  }));
  const longChainResult = validateLinkedListInvariants({ headId: 'long_0', isCircular: false, nodes: longChainNodes });
  assert(longChainResult.isValid && longChainResult.orphanNodeIds.length === 0, 'Twenty-four-node chain validates and remains fully reachable');

  const dangling = validateLinkedListInvariants({ headId: 'head', isCircular: false, nodes: [{ id: 'head', value: 1, next: 'missing', x: 80, y: 180, confidence: 1 }] });
  assert(!dangling.isValid, 'Dangling next pointer is rejected');

  const nonReciprocal = validateLinkedListInvariants({ headId: 'left', structureType: 'doubly' as const, isCircular: false, nodes: [
    { id: 'left', value: 1, next: 'right', prev: null, x: 80, y: 180, confidence: 1 }, { id: 'right', value: 2, next: null, prev: null, x: 260, y: 180, confidence: 1 }
  ] });
  assert(!nonReciprocal.isValid, 'Doubly linked graph with non-reciprocal next/prev pointers is rejected');

  // Biology Curriculum Invariant Tests
  const bioTopics = Object.keys(biologyLessonsCatalog);
  assert(bioTopics.length === 5, 'Biology catalog indexes all 5 core syllabus topics');
  assert(
    bioTopics.includes('human_cell') &&
      bioTopics.includes('human_heart') &&
      bioTopics.includes('dna_helix') &&
      bioTopics.includes('neuron') &&
      bioTopics.includes('plant_cell'),
    'Biology catalog covers Human Cell, Heart, DNA, Neuron, and Plant Cell'
  );

  const cell = biologyLessonsCatalog.human_cell;
  const cellOrganelleIds = cell.components.map((c) => c.id);
  const requiredOrganelles = [
    'nucleus',
    'cell_membrane',
    'cytoplasm',
    'mitochondria',
    'ribosomes',
    'endoplasmic_reticulum',
    'golgi_apparatus',
    'lysosomes'
  ];
  const hasAllOrganelles = requiredOrganelles.every((id) => cellOrganelleIds.includes(id));
  assert(hasAllOrganelles, 'Human Cell lesson contains all 8 required organelles with full explanations');

  const everyOrganelleHasAnalogyAndExamFacts = cell.components.every(
    (c) => c.analogy && c.examFacts.length > 0 && c.function && c.scientificExplanation
  );
  assert(everyOrganelleHasAnalogyAndExamFacts, 'All cell organelles provide function, analogy, scientific detail, and exam facts');

  const heart = biologyLessonsCatalog.human_heart;
  const heartComponentIds = heart.components.map((c) => c.id);
  assert(
    heartComponentIds.includes('right_atrium') &&
      heartComponentIds.includes('right_ventricle') &&
      heartComponentIds.includes('left_atrium') &&
      heartComponentIds.includes('left_ventricle') &&
      heartComponentIds.includes('aorta') &&
      heartComponentIds.includes('heart_valves'),
    'Human Heart contains all 4 chambers, great vessels, and cardiac valves'
  );

  const dna = biologyLessonsCatalog.dna_helix;
  assert(
    dna.components.some((c) => c.id === 'adenine_thymine_pair') &&
      dna.components.some((c) => c.id === 'guanine_cytosine_pair'),
    'DNA Double Helix includes A-T and G-C base pairing with hydrogen bonding explanations'
  );

  const allPracticeQuestionsValid = Object.values(biologyLessonsCatalog).every((lesson) =>
    lesson.practiceQuestions.every(
      (q) => q.question && q.options.length === 4 && q.explanation && q.boardSource && q.year > 2000
    )
  );
  assert(allPracticeQuestionsValid, 'All biology practice questions have 4 options, explanations, and a source label');
  const practiceLabelsAreUnofficial = Object.values(biologyLessonsCatalog).every((lesson) =>
    lesson.practiceQuestions.every((q) => q.boardSource.includes('not an official'))
  );
  assert(practiceLabelsAreUnofficial, 'Biology practice questions are labeled as practice, not official past papers');

  // Cloudinary Media Pipeline Verification Tests
  const isConfigured = isCloudinaryConfigured();
  assert(typeof isConfigured === 'boolean', 'Cloudinary configuration validator safely executes and returns boolean status');

  const samplePublicId = 'biology/sample_diagram';
  const testCrop = { x: 50, y: 50, width: 400, height: 300 };
  const optimizedUrl = getOptimizedDiagramUrl(samplePublicId, testCrop, { sharpen: true, contrast: true });
  assert(
    typeof optimizedUrl === 'string' && optimizedUrl.length > 0,
    'Cloudinary media pipeline generates valid URL for diagrams'
  );
  assert(
    optimizedUrl.includes('biology/sample_diagram'),
    'Cloudinary diagram URL preserves public ID reference'
  );
  assert(optimizedUrl.includes('f_auto') && optimizedUrl.includes('q_auto'), 'Delivery URL requests f_auto and q_auto');
  if (!isConfigured) {
    assert(optimizedUrl.includes('res.cloudinary.com/demo/'), 'Without credentials, delivery uses the public demo cloud');
  }
  const textUpload = inspectDirectUpload('data:text/plain;base64,aGk=');
  assert(!textUpload.ok && textUpload.status === 400, 'Plain-text uploads are rejected before Cloudinary is called');
  const remoteUpload = inspectDirectUpload('http://example.com/a.png');
  assert(!remoteUpload.ok && remoteUpload.status === 400, 'Non-https upload sources are rejected');
  const pngHeader = 'data:image/png;base64,iVBORw0KGgo=';
  assert(inspectDirectUpload(pngHeader).ok, 'A PNG data URI passes the pre-upload check');
  const oversized = inspectDirectUpload(`data:image/png;base64,${'A'.repeat(Math.ceil(15 * 1024 * 1024 * 1.4))}`);
  assert(!oversized.ok && oversized.status === 413, 'Oversized uploads are rejected before Cloudinary is called');
  const cellUnit: LearningUnitInput = {
    id: 'human_cell',
    title: 'Cell',
    subject: 'Biology',
    topic: 'Cell',
    objective: 'See the cell',
    description: 'A curated cell lesson',
    has3D: true,
    hasVisual: true,
    components: [
      { id: 'mitochondria', name: 'Mitochondria', simpleExplanation: 'Makes ATP', functionText: 'ATP' },
      { id: 'other', name: 'Other', simpleExplanation: 'Other text', functionText: 'Other job' }
    ],
    guidedSteps: [{ stepNumber: 1, componentId: 'mitochondria', title: 'Power', summary: 'ATP stage' }],
    questions: [{
      id: 'q1',
      options: ['wrong claim', 'right claim'],
      correctOptionIndex: 1,
      explanation: 'Because the inner membrane folds into cristae.',
      diagramComponentId: 'mitochondria'
    }]
  };
  const start = selectStructure(initialContinuity(cellUnit), cellUnit, 'mitochondria').state;
  const toSteps = switchLearningMode(start, cellUnit, 'steps');
  assert(toSteps.changed && toSteps.state.conceptId === 'human_cell' && toSteps.state.stepIndex === 0, 'Switching to steps keeps the concept and maps the selected structure');
  const done = markStepComplete(toSteps.state, 0);
  const toSimple = switchLearningMode(done, cellUnit, 'simple');
  assert(toSimple.state.completedStepIndexes[0] === 0, 'A mode change keeps completed stages');
  assert(Boolean(toSimple.notice && toSimple.notice.toLowerCase().includes('camera')), 'Simple explanation says a camera position is not carried over');
  const listened = switchLearningMode(toSimple.state, cellUnit, 'listen');
  assert(!listened.changed && listened.state.mode === 'simple', 'Listen mode stays unavailable and does not change the path');
  assert(modesForLesson(cellUnit).some((mode) => mode.id === 'listen' && !mode.available), 'Listen mode is listed as unavailable when no narration exists');
  const answered = recordAnswer(start, cellUnit, cellUnit.questions[0], 0);
  assert(!answered.correct && answered.misconception?.chosenStatement === 'wrong claim', 'A wrong answer returns the chosen statement as the mix-up');
  assert(answered.misconception?.stepTitle === 'Power', 'The mix-up points at the mapped learning stage');
  assert(misconceptionFor(cellUnit.questions[0], 1, cellUnit) === null, 'A correct answer has no mix-up note');
  const kept = switchLearningMode(answered.state, cellUnit, 'accessible');
  assert(kept.state.answers.q1?.selectedIndex === 0, 'Quiz progress survives a mode change');
  assert(sdgForConcept('human_heart')?.sdg === 3, 'The heart lesson maps to SDG 3');
  assert(sdgForConcept('plant_cell')?.sdg === 15, 'The plant-cell lesson maps to SDG 15');
  assert(sdgForConcept('dna_helix') === null, 'DNA has no curated SDG connection');
  const small = lowDataDeliveryUrl('https://res.cloudinary.com/demo/image/upload/c_limit,w_900/f_auto,q_auto/sample.jpg');
  assert(Boolean(small && small.includes('w_320') && !small.includes('w_900')), 'Low-data delivery shrinks a Cloudinary URL');
  assert(lowDataDeliveryUrl('https://example.com/a.png') === null, 'Non-Cloudinary media is not rewritten');
  const snapshot = buildTextSnapshot(cellUnit, '2026-10-25T00:00:00.000Z');
  assert(snapshot.kind === 'text-snapshot' && snapshot.explanations.length === 2, 'A text snapshot stores the written lesson');
  assert(!JSON.stringify(snapshot).includes('api_secret'), 'A text snapshot does not contain an API secret');
  assert(isSafePublicId('biology/sample_diagram'), 'Ordinary public IDs are accepted');
  assert(!isSafePublicId('../secret') && !isSafePublicId('https://example.com/a'), 'Traversal and remote URLs are rejected as public IDs');

  const prefs = normalizeLearningPreferences({
    textScale: 'large',
    lineSpacing: 'relaxed',
    highContrast: true,
    reducedMotion: true,
    keyboardFirst: true,
    diagnosis: 'not-stored',
    lowData: false,
    textFirst: true
  });
  assert(prefs.textScale === 'large' && prefs.lineSpacing === 'relaxed', 'Saved text size and spacing are kept');
  assert(prefs.highContrast && prefs.reducedMotion && prefs.keyboardFirst, 'Contrast, motion, and keyboard choices are kept');
  assert(!preferencesIncludeDiagnosis(prefs) && !JSON.stringify(prefs).includes('not-stored'), 'A display preference does not keep a diagnosis');
  const resetPrefs = resetDisplayPreferences(prefs);
  assert(resetPrefs.textScale === 'default' && resetPrefs.highContrast === false, 'Reset clears typography and contrast');
  assert(resetPrefs.textFirst === true, 'Reset leaves the text-first representation flag alone');
  assert(resetPrefs.focusMode === false && resetPrefs.simpleSteps === false, 'Reset clears combinable learning modes');
  const combined = normalizeLearningPreferences({
    focusMode: true,
    easyRead: true,
    simpleSteps: true,
    colorFriendly: true,
    listenExplore: true,
    lowStimulation: true,
    lowData: true,
    speechRate: 0.8,
    diagnosis: 'not-stored'
  });
  assert(combined.focusMode && combined.easyRead && combined.simpleSteps && combined.colorFriendly, 'Learning modes can be combined');
  assert(combined.listenExplore && combined.lowStimulation && combined.speechRate === 0.8, 'Listen, motion, and speech rate are kept');
  assert(!JSON.stringify(combined).includes('not-stored'), 'Combined preferences still drop a diagnosis');
  assert(activePreferenceLabels(combined).includes('Focus') && activePreferenceLabels(combined).includes('Low data'), 'The settings summary names the active modes');
  assert(activePreferenceLabels(defaultLearningPreferences()).join(' ') === 'Standard lesson', 'Defaults summarize as a standard lesson');
  const cleared = resetAllLearningPreferences();
  assert(cleared.lowData === false && cleared.textFirst === false && cleared.focusMode === false, 'Reset to defaults clears low data and learning modes');
  assert(readThemeChoice(null) === 'light' && readThemeChoice('nope') === 'light', 'A first visit uses light theme');
  assert(readThemeChoice('dark') === 'dark' && readThemeChoice('system') === 'system', 'An explicit theme choice is kept');
  assert(resolveTheme('light', true) === 'light', 'A saved light theme is not replaced by a dark system setting');
  assert(resolveTheme('system', true) === 'dark' && resolveTheme('system', false) === 'light', 'System theme follows the device only when chosen');
  assert(lessonImageWidth(false) === 800 && lessonImageWidth(true) === 480, 'Low data requests a smaller lesson image');
  assert(start.conceptId === 'human_cell' && start.selectedComponentId === 'mitochondria', 'Resetting display preferences is separate from the selected concept');
  const systemMotion = respectSystemReducedMotion(defaultLearningPreferences(), true, false);
  assert(systemMotion.reducedMotion === true, 'Reduced motion follows the system when the learner has not saved a choice');
  const savedMotion = respectSystemReducedMotion({ ...defaultLearningPreferences(), reducedMotion: false }, true, true);
  assert(savedMotion.reducedMotion === false, 'A saved motion choice is not overwritten by the system setting');
  assert(
    shouldMount3D({ has3D: true, mode: 'visual', textFirst: false, lowData: false, learnerRequestedScene: false }) === true,
    'Explore visually can mount a 3D scene'
  );
  assert(
    shouldMount3D({ has3D: true, mode: 'visual', textFirst: true, lowData: false, learnerRequestedScene: false }) === false,
    'Text first does not mount 3D until the learner asks'
  );
  assert(
    shouldMount3D({ has3D: true, mode: 'visual', textFirst: false, lowData: true, learnerRequestedScene: false }) === false,
    'Low data does not mount 3D automatically'
  );
  assert(
    shouldMount3D({ has3D: true, mode: 'low-data', textFirst: false, lowData: true, learnerRequestedScene: true }) === false,
    'Low-data reading does not mount 3D even after a scene request'
  );
  assert(
    shouldMount3D({ has3D: true, mode: 'visual', textFirst: true, lowData: false, learnerRequestedScene: true }) === true,
    'An explicit request can mount 3D after text first'
  );
  const textOnly: LearningUnitInput = { ...cellUnit, hasVisual: false, has3D: false, components: cellUnit.components };
  const missingVisual = switchLearningMode(initialContinuity(textOnly, { mode: 'simple' }), textOnly, 'visual');
  assert(!missingVisual.changed && missingVisual.state.mode === 'simple', 'A missing visual representation does not switch the concept');
  assert(Boolean(missingVisual.notice && missingVisual.notice.toLowerCase().includes('no interactive')), 'A missing representation explains why it is unavailable');
  assert(optionFeedback(true, false, true) === 'Correct answer', 'A correct option is named in text');
  assert(optionFeedback(true, true, false) === 'Your choice. Not this answer.', 'A wrong choice is named in text, not only by color');
  assert(optionFeedback(false, true, false) === null, 'Feedback stays hidden until an answer is submitted');
  const words = vocabularyFromComponent({
    name: 'Mitochondria',
    scientificName: 'Mitochondrion',
    simpleExplanation: 'Makes ATP',
    functionText: 'ATP from food and oxygen'
  });
  assert(words.length === 2 && words.every((item) => item.source === 'lesson-text'), 'Vocabulary is taken from the lesson text');
  assert(SDG_4_NOTE.sdg === 4 && SDG_4_NOTE.sourceUrl.startsWith('https://sdgs.un.org/goals/goal4'), 'SDG 4 stays a product note with its UN source');
  assert(Object.values(SDG_CONNECTIONS).every((item) => item.sdg !== 7 && item.sourceUrl.startsWith('https://')), 'No SDG 7 link was added without an energy lesson');
  assert(sdgForConcept('human_cell')?.why.includes('mitochondria') || Boolean(sdgForConcept('human_cell')?.lessonBasis), 'The cell SDG link names its lesson basis');

  const groups = learningThemeGroups();
  const themeCount = groups.reduce((sum, group) => sum + group.themes.length, 0);
  assert(groups.length === 4 && themeCount === 18, 'The theme center has four groups and eighteen themes');
  assert(groups[0].title.toLowerCase().includes('focus') && groups[3].title.toLowerCase().includes('pace'), 'Theme groups keep focus and pace sections');
  const adhd = applyLearningTheme(defaultLearningPreferences(), 'adhd-friendly');
  assert(adhd.adhdFriendly && adhd.focusMode && adhd.simplifiedLayout && adhd.breakReminderMinutes === 0, 'ADHD-Friendly sets a clear task and does not start a break timer');
  const combinedThemes = applyLearningTheme(adhd, 'easy-read');
  assert(combinedThemes.activeThemes.length === 2 && combinedThemes.easyRead && combinedThemes.focusMode, 'Two learning themes stay on together');
  const combinedExperience = resolveLearningExperience(combinedThemes);
  assert(combinedExperience.chunkLessons && combinedExperience.plainLanguage && combinedExperience.keepFullScience && combinedExperience.neverAutoplay && !combinedExperience.speechRequired, 'Combined themes keep both behaviors and do not require speech');
  const withoutAdhd = removeLearningTheme(combinedThemes, 'adhd-friendly');
  assert(!withoutAdhd.focusMode && !withoutAdhd.adhdFriendly && withoutAdhd.easyRead && withoutAdhd.activeThemes.length === 1, 'Removing one theme leaves the other');
  assert(resetAllLearningPreferences().activeThemes.length === 0 && resetAllLearningPreferences().easyRead === false, 'Reset to defaults clears selected themes');
  const ventricle: ConceptSource = {
    conceptId: 'human_heart',
    componentId: 'left_ventricle',
    name: 'Left Ventricle',
    standard: 'The left ventricle pumps blood into the aorta.',
    plain: 'This chamber sends blood out to the body.',
    everyday: 'It works like a strong pump.',
    location: 'Lower chamber on the left side of the heart.',
    role: 'Pumps oxygenated blood into the aorta.',
    chunks: ['The wall is thick.'],
    steps: [{ stepNumber: 4, componentId: 'left_ventricle', title: 'Left side', summary: 'Blood leaves for the body.' }],
    question: {
      prompt: 'Where does the left ventricle send blood?',
      options: ['To the lungs', 'To the body'],
      correctOptionIndex: 1,
      explanation: 'It pumps into the aorta, toward the body.'
    }
  };
  const plainView = adaptConceptContent(ventricle, resolveLearningExperience(combinedThemes));
  assert(plainView.conceptId === 'human_heart' && plainView.componentId === 'left_ventricle' && plainView.representation === 'plain', 'Easy Read stays on the left ventricle');
  const missingPlain = adaptConceptContent(
    { ...ventricle, plain: ' ' },
    resolveLearningExperience(applyLearningTheme(defaultLearningPreferences(), 'easy-read'))
  );
  assert(missingPlain.usedFallback && missingPlain.paragraphs[0].includes('aorta'), 'A missing plain-language version falls back to the standard explanation');
  assert(missingPlain.hint === null && Boolean(missingPlain.hintNote && missingPlain.hintNote.toLowerCase().includes('no separate hint')), 'A missing hint is named instead of invented');
  assert(plainView.narrationKind === 'lesson-text', 'Speech reads stored lesson text and is not treated as a recording');
  const lowDataTheme = applyLearningTheme(defaultLearningPreferences(), 'low-data');
  assert(resolveLearningExperience(lowDataTheme).deferMedia && lowDataTheme.lowData, 'Low-Data defers optional media');
  assert(
    shouldMount3D({ has3D: true, mode: 'visual', textFirst: false, lowData: lowDataTheme.lowData, learnerRequestedScene: false }) === false,
    'Low-Data does not mount 3D until the learner asks'
  );
  const colorTheme = resolveLearningExperience(applyLearningTheme(defaultLearningPreferences(), 'color-blind-friendly'));
  assert(colorTheme.colorIndependent, 'Color-Blind-Friendly asks for a cue other than color');
  const keys = applyLearningTheme(defaultLearningPreferences(), 'keyboard-friendly');
  assert(keys.keyboardFirst && resolveLearningExperience(keys).keyboardAccess, 'Keyboard-Friendly turns on keyboard access');
  const calmed = resolveLearningExperience(applyLearningTheme(defaultLearningPreferences(), 'low-stimulation'));
  assert(calmed.reduceMotion && calmed.neverAutoplay, 'Low-Stimulation stops nonessential motion and autoplay');
  const themed = applyLearningTheme(applyLearningTheme(defaultLearningPreferences(), 'adhd-friendly'), 'supported-learning');
  assert(!preferencesIncludeDiagnosis(themed) && !JSON.stringify(themed).toLowerCase().includes('diagnosis'), 'Theme storage does not keep a diagnosis');
  const raised = { ...applyLearningTheme(defaultLearningPreferences(), 'low-vision-friendly'), textScale: 'larger' as const };
  assert(applyLearningTheme(raised, 'easy-read').textScale === 'larger', 'A larger text choice stays when another theme is added');
  for (const lesson of Object.values(biologyLessonsCatalog)) {
    assert(
      lesson.components.every((component) => component.simpleExplanation.trim() && component.scientificExplanation.trim() && component.analogy.trim()),
      `${lesson.id} stores a standard explanation, a plain-language explanation, and an everyday example`
    );
    assert(lesson.guidedSteps.length > 0 && lesson.practiceQuestions.length > 0, `${lesson.id} stores steps and a practice question`);
    assert(lesson.practiceQuestions.every((question) => !('hint' in question)), `${lesson.id} does not pretend a hint was stored`);
    const componentIds = new Set(lesson.components.map((component) => component.id));
    assert(
      lesson.practiceQuestions.every((question) => assessedConceptId(question) !== null && componentIds.has(question.diagramComponentId || '')),
      `${lesson.id} questions name a structure that exists in the lesson`
    );
    for (const objective of objectivesForLesson(lesson.id)) {
      assert(objective.statement.trim().length > 0, `${lesson.id} objective ${objective.id} has a statement`);
      assert(
        objective.conceptIds.every((conceptId) => componentIds.has(conceptId)),
        `${lesson.id} objective ${objective.id} uses stored concept ids`
      );
    }
  }
  assert(objectivesForLesson('human_heart').length === 5, 'The heart lesson has five stored objectives');
  assert(THEME_RESOLUTION.includes('Low-Stimulation') && THEME_RESOLUTION.includes('Low-Data'), 'Theme conflicts are resolved in one written rule');
  const calmAndVisual = resolveLearningExperience(
    applyLearningTheme(applyLearningTheme(defaultLearningPreferences(), 'low-stimulation'), 'visual-learning')
  );
  assert(calmAndVisual.reduceMotion && calmAndVisual.showAnnotatedDiagram, 'Low-Stimulation keeps motion off without removing the labeled diagram');

  const heartEvents: LearningEvent[] = [];
  const missedOnce = appendLearningEvent(heartEvents, {
    type: 'question_answered',
    lessonId: 'human_heart',
    conceptId: 'left_ventricle',
    questionId: 'heart_q2',
    questionLabel: 'Left Ventricle',
    correct: false
  });
  const reviewDiagram = recommendNextStep({
    lessonId: 'human_heart',
    conceptId: 'left_ventricle',
    conceptName: 'Left Ventricle',
    events: missedOnce,
    hasPlain: true,
    plainActive: false,
    hasDiagram: true,
    hasNarration: true,
    allowSpeech: true,
    hasNextConcept: true,
    nextConceptName: 'Aorta',
    otherQuestionIds: ['heart_q1']
  });
  assert(reviewDiagram?.kind === 'labeled_diagram' && reviewDiagram.title === 'Explore the labeled diagram', 'One incorrect answer suggests the labeled diagram');
  assert(Boolean(reviewDiagram?.why.includes('incorrectly') && !/fail|disability|bad at/i.test(reviewDiagram.why)), 'The suggestion uses neutral language');
  const missedTwice = appendLearningEvent(missedOnce, {
    type: 'question_answered',
    lessonId: 'human_heart',
    conceptId: 'left_ventricle',
    questionId: 'heart_q3',
    questionLabel: 'Left Ventricle',
    correct: false
  });
  const simpler = recommendNextStep({
    lessonId: 'human_heart',
    conceptId: 'left_ventricle',
    conceptName: 'Left Ventricle',
    events: missedTwice,
    hasPlain: true,
    plainActive: false,
    hasDiagram: true,
    hasNarration: true,
    allowSpeech: true,
    hasNextConcept: true,
    nextConceptName: 'Aorta',
    otherQuestionIds: ['heart_q1']
  });
  assert(simpler?.kind === 'simpler_explanation', 'Repeated incorrect answers suggest the stored simpler explanation');
  const noAlternative = recommendNextStep({
    lessonId: 'human_heart',
    conceptId: 'left_ventricle',
    conceptName: 'Left Ventricle',
    events: missedOnce,
    hasPlain: false,
    plainActive: false,
    hasDiagram: false,
    hasNarration: false,
    allowSpeech: false,
    hasNextConcept: false,
    nextConceptName: null,
    otherQuestionIds: []
  });
  assert(noAlternative?.kind === 'review_concept' && !/diagram|listen|simpler/i.test(noAlternative.why), 'A missing alternative falls back to review without naming it');
  const correctOnce = appendLearningEvent([], {
    type: 'question_answered',
    lessonId: 'human_heart',
    conceptId: 'left_ventricle',
    questionId: 'heart_q2',
    questionLabel: 'Left Ventricle',
    correct: true
  });
  const moveOn = recommendNextStep({
    lessonId: 'human_heart',
    conceptId: 'left_ventricle',
    conceptName: 'Left Ventricle',
    events: correctOnce,
    hasPlain: true,
    plainActive: false,
    hasDiagram: true,
    hasNarration: true,
    allowSpeech: true,
    hasNextConcept: true,
    nextConceptName: 'Aorta',
    otherQuestionIds: ['heart_q1']
  });
  assert(moveOn?.kind === 'continue' && moveOn.actionable, 'A correct answer can continue to the next stored structure');
  const correctTwice = appendLearningEvent(correctOnce, {
    type: 'question_answered',
    lessonId: 'human_heart',
    conceptId: 'aorta',
    questionId: 'heart_q1',
    questionLabel: 'Aorta',
    correct: true
  });
  const another = recommendNextStep({
    lessonId: 'human_heart',
    conceptId: 'aorta',
    conceptName: 'Aorta',
    events: correctTwice,
    hasPlain: true,
    plainActive: true,
    hasDiagram: true,
    hasNarration: false,
    allowSpeech: false,
    hasNextConcept: false,
    nextConceptName: null,
    otherQuestionIds: ['heart_q3']
  });
  assert(another?.kind === 'another_question', 'Repeated correct answers can offer another stored question');
  const restored = progressStage(missedTwice, 'human_heart', 'left_ventricle');
  assert(restored === 'practicing', 'Incorrect answers count as practicing, not a mastery claim');
  const reviewed = progressStage(
    appendLearningEvent(missedTwice, {
      type: 'explanation_revisited',
      lessonId: 'human_heart',
      conceptId: 'left_ventricle'
    }),
    'human_heart',
    'left_ventricle'
  );
  assert(reviewed === 'reviewed', 'Revisiting the explanation after a miss is marked reviewed');
  const summary = summarizeLesson(correctTwice, 'human_heart', ['left_ventricle', 'aorta'], ['heart_q1', 'heart_q2', 'heart_q3']);
  assert(summary.correctAnswers === 2 && summary.questionsAttempted === 2 && summary.allQuestionsAttempted === false, 'Progress counts real answers and does not invent completion');
  assert(clearLessonEvents(correctTwice, 'human_heart').length === 0, 'Resetting a lesson removes only that lesson evidence');
  assert(!evidenceStoresDiagnosis(correctTwice), 'Learning evidence does not store a diagnosis');
  assert(normalizeEvidence([{ type: 'question_answered', lessonId: 'human_heart', conceptId: 'aorta', diagnosis: 'adhd' }]).length === 0, 'A diagnosis field is dropped from stored evidence');
  const keptThemes = applyLearningTheme(defaultLearningPreferences(), 'easy-read');
  assert(summarizeLesson(correctTwice, 'human_heart', ['aorta'], ['heart_q1']).correctAnswers === 2 && keptThemes.easyRead, 'Changing a theme does not erase learning evidence');

  const heartAsset = EDUCATIONAL_ASSETS.human_heart;
  const standardUrl = educationalDeliveryUrl(heartAsset.remoteUrl, false);
  const lowDataUrl = educationalDeliveryUrl(heartAsset.remoteUrl, true);
  assert(standardUrl.includes('/demo/image/fetch/') && standardUrl.includes('c_limit,w_800') && standardUrl.includes('f_auto'), 'A featured diagram uses a limited Cloudinary fetch URL');
  assert(lowDataUrl.includes('c_limit,w_480') && lowDataUrl.includes('q_auto:low'), 'Low-Data delivery uses the 480px limit and lower automatic quality');
  assert(!standardUrl.includes('c_fill') && !lowDataUrl.includes('c_fill'), 'Diagram delivery does not crop labels with c_fill');
  for (const asset of Object.values(EDUCATIONAL_ASSETS)) {
    const url = educationalDeliveryUrl(asset.remoteUrl, false);
    assert(url.startsWith('https://res.cloudinary.com/demo/image/fetch/') && asset.alt.length > 20, `${asset.conceptId} has a Cloudinary fetch URL and alternative text`);
  }
  assert(!JSON.stringify({ standardUrl, lowDataUrl }).includes('CLOUDINARY_API_SECRET'), 'Delivery URLs do not contain an API secret');

  console.log(`\n========================================`);
  console.log(`Results: ${passedCount} / ${totalCount} tests passed.`);
  console.log(`========================================\n`);
}

runTestSuite();
