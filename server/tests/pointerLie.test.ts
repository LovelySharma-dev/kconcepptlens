import assert from 'assert';
import fs from 'fs';
import path from 'path';
import type { LinkedListGraph } from '@conceptlens/shared';
import { findCycleClosingEdge, validateLinkedListInvariants } from '../src/services/validationService';
import { generateExecutionSteps } from '../src/services/stepEngine';

function node(id: string, value: number, next: string | null): LinkedListGraph['nodes'][number] {
  return { id, value, next, x: 0, y: 0, confidence: 1 };
}

function list(ids: Array<[string, number, string | null]>, headId: string | null, isCircular = false): LinkedListGraph {
  return {
    headId,
    isCircular,
    structureType: 'singly',
    nodes: ids.map(([id, value, next]) => node(id, value, next))
  };
}

const proven = list([
  ['a', 1, 'b'],
  ['b', 2, 'c'],
  ['c', 3, 'd'],
  ['d', 4, null]
], 'a');

const cycleToHead = list([
  ['n1', 10, 'n2'],
  ['n2', 20, 'n3'],
  ['n3', 30, 'n1']
], 'n1');

const cycleToInterior = list([
  ['n1', 10, 'n2'],
  ['n2', 20, 'n3'],
  ['n3', 30, 'n4'],
  ['n4', 40, 'n2']
], 'n1');

const selfLoop = list([['n1', 7, 'n1']], 'n1');

const emptyList = list([], null);

async function run() {
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
      console.error(err instanceof Error ? err.stack || err.message : String(err));
      process.exitCode = 1;
    }
  }

  await test('An empty list is valid and has no cycle', () => {
    const result = validateLinkedListInvariants(emptyList);
    assert.strictEqual(result.isValid, true);
    assert.strictEqual(result.floydCycleDetected, false);
    assert.strictEqual(result.cycleEdge, null);
  });

  await test('A single-node list is a minimal acyclic list', () => {
    const result = validateLinkedListInvariants(list([['only', 4, null]], 'only'));
    assert.strictEqual(result.isValid, true);
    assert.strictEqual(result.floydCycleDetected, false);
    assert.strictEqual(result.cycleEdge, null);
  });

  await test('A four-node acyclic list passes and can be reversed', () => {
    const result = validateLinkedListInvariants(proven);
    assert.strictEqual(result.isValid, true);
    assert.strictEqual(result.floydCycleDetected, false);
    const steps = generateExecutionSteps(proven, { operation: 'reverseList' });
    assert.ok(steps.length >= 5, 'reversal records the start, each pointer change, and the new head');
    const finalGraph = steps[steps.length - 1].currentGraph;
    const order: Array<string | number> = [];
    let cursor = finalGraph.headId;
    const byId = new Map(finalGraph.nodes.map((item) => [item.id, item]));
    const seen = new Set<string>();
    while (cursor) {
      assert.ok(!seen.has(cursor), 'reversed list must stay acyclic');
      seen.add(cursor);
      const current = byId.get(cursor);
      assert.ok(current);
      order.push(current.value);
      cursor = current.next;
    }
    assert.deepStrictEqual(order, [4, 3, 2, 1]);
    const firstChange = steps[1];
    assert.ok(firstChange.activePointers.prev || firstChange.activePointers.curr, 'the inspector records pointer names');
    assert.strictEqual(firstChange.currentGraph.nodes.find((item) => item.id === 'a')?.next, null);
  });

  await test('A cycle back to the head is refused and the closing edge is named', () => {
    const result = validateLinkedListInvariants(cycleToHead);
    assert.strictEqual(result.isValid, false);
    assert.strictEqual(result.floydCycleDetected, true);
    assert.deepStrictEqual(result.cycleEdge, { fromId: 'n3', toId: 'n1' });
    assert.throws(() => generateExecutionSteps(cycleToHead, { operation: 'reverseList' }), /cycle/);
  });

  await test('A cycle back to an interior node is refused', () => {
    const result = validateLinkedListInvariants(cycleToInterior);
    assert.strictEqual(result.isValid, false);
    assert.strictEqual(result.floydCycleDetected, true);
    assert.deepStrictEqual(findCycleClosingEdge(cycleToInterior), { fromId: 'n4', toId: 'n2' });
  });

  await test('A self-loop is a cycle from a node to itself', () => {
    const result = validateLinkedListInvariants(selfLoop);
    assert.strictEqual(result.isValid, false);
    assert.strictEqual(result.floydCycleDetected, true);
    assert.deepStrictEqual(result.cycleEdge, { fromId: 'n1', toId: 'n1' });
  });

  await test('Clearing the closing edge makes the interior cycle teachable', () => {
    const edge = findCycleClosingEdge(cycleToInterior);
    assert.ok(edge);
    const repaired: LinkedListGraph = {
      ...cycleToInterior,
      nodes: cycleToInterior.nodes.map((item) => (item.id === edge.fromId ? { ...item, next: null } : item))
    };
    const before = validateLinkedListInvariants(cycleToInterior);
    const after = validateLinkedListInvariants(repaired);
    assert.strictEqual(before.isValid, false);
    assert.strictEqual(after.isValid, true);
    assert.strictEqual(after.floydCycleDetected, false);
    assert.strictEqual(after.cycleEdge, null);
    const steps = generateExecutionSteps(repaired, { operation: 'reverseList' });
    assert.ok(steps.length > 1);
    assert.notStrictEqual(steps[0].currentGraph, steps[steps.length - 1].currentGraph);
  });

  await test('The home screen mounts the signature lesson and does not fake a stopped list as playable', () => {
    const home = fs.readFileSync(path.resolve(__dirname, '../../client/src/components/home/HomeView.tsx'), 'utf-8');
    const lesson = fs.readFileSync(path.resolve(__dirname, '../../client/src/components/learn/PointerLieLesson.tsx'), 'utf-8');
    assert.ok(home.includes('Your mind has its own way.'), 'the landing hero introduces the product');
    assert.ok(home.includes('Education should make room for everyone.'), 'the belonging line stays on the landing page');
    assert.ok(home.includes('id="mission"'), 'the mission section is a scroll target');
    assert.equal(home.includes('<PointerLieLesson'), false, 'the signature lesson is not on the homepage');
    assert.equal(home.includes('LearningMediaLab'), false, 'the media lab is not on the homepage');
    const app = fs.readFileSync(path.resolve(__dirname, '../../client/src/App.tsx'), 'utf-8');
    assert.ok(app.includes('<PointerLieLesson'), 'the signature lesson is on Learn');
    assert.ok(home.includes('Explore the Living Atlas'));
    assert.ok(home.includes('Find My Way to Learn'));
    const milo = fs.readFileSync(path.resolve(__dirname, '../../client/src/components/home/MiloCompanion.tsx'), 'utf-8');
    assert.ok(milo.includes('Hide Milo'));
    assert.ok(milo.includes('Show Milo'));
    assert.ok(lesson.includes('We will not teach a structure we cannot prove.'));
    assert.ok(lesson.includes('/api/diagrams/validate'));
    assert.ok(lesson.includes('/api/diagrams/simulate'));
    assert.ok(lesson.includes("status === 422") || lesson.includes('status === 422'));
    assert.ok(lesson.includes('Repair this pointer'));
    assert.ok(!lesson.includes('res.cloudinary.com/demo'), 'the signature lesson must not use the public demo cloud as project evidence');
    assert.ok(!lesson.includes('aria-live="off"'));
  });

  console.log(`\nPointer lie: ${passed}/${total} passed`);
  if (process.exitCode) process.exit(process.exitCode);
}

void run();
