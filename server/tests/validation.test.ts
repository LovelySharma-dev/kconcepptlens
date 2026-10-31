import fs from 'fs';
import path from 'path';
import { validateLinkedListInvariants } from '../src/services/validationService';
import { generateExecutionSteps } from '../src/services/stepEngine';
import { curatedPYQs } from '../src/routes/pyqs';
import { interpretDiagram } from '../src/services/interpretationService';

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

  // Test 1: ISC 2025 Specimen Question 11
  const iscFixture = JSON.parse(
    fs.readFileSync(path.join(fixturesDir, 'isc-2025-q11.json'), 'utf-8')
  );
  const iscValidation = validateLinkedListInvariants(iscFixture.graph);
  assert(iscValidation.isValid === true, 'ISC 2025 Specimen Q11 graph satisfies all invariants');
  assert(iscValidation.floydCycleDetected === false, 'ISC 2025 graph is verified acyclic');

  const iscSteps = generateExecutionSteps(iscFixture.graph, {
    operation: 'insertHead',
    value: 9
  });
  assert(iscSteps.length === 4, 'ISC 2025 insertHead generates exactly 4 discrete execution steps');
  assert(
    iscSteps[3].currentGraph.headId === iscSteps[1].mutatedNodeId,
    'ISC 2025 final step correctly points head to newly allocated node'
  );

  // Test 2: Anna University 2019
  const annaFixture = JSON.parse(
    fs.readFileSync(path.join(fixturesDir, 'anna-univ-2019.json'), 'utf-8')
  );
  const annaValidation = validateLinkedListInvariants(annaFixture.graph);
  assert(annaValidation.isValid === true, 'Anna Univ CP5151 graph satisfies all invariants');

  const annaSteps = generateExecutionSteps(annaFixture.graph, {
    operation: 'deleteNode',
    targetValue: 200
  });
  assert(
    annaSteps[2].currentGraph.nodes.length === 3,
    'Anna Univ deleteNode correctly decreases list size to 3 nodes'
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
    'PYQ Question Bank indexes ISC, CBSE, Anna University, and GATE board questions'
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
  assert(iscQuestions.length >= 3, 'Filter by Board: ISC returns at least 3 verified questions');

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

  console.log(`\n========================================`);
  console.log(`Results: ${passedCount} / ${totalCount} tests passed.`);
  console.log(`========================================\n`);
}

runTestSuite();
