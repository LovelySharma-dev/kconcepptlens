import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { narratePointerLie } from '../../client/src/a11y/diagramNarration.ts';

let passed = 0;
let total = 0;

async function test(name: string, fn: () => void | Promise<void>) {
  total += 1;
  try {
    await fn();
    passed += 1;
    console.log(`  ✅ PASS: ${name}`);
  } catch (error) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

async function run() {
  const root = path.resolve(__dirname, '../..');
  const voice = fs.readFileSync(path.join(root, 'client/src/components/VoiceGuide.tsx'), 'utf8');
  const app = fs.readFileSync(path.join(root, 'client/src/App.tsx'), 'utf8');
  const home = fs.readFileSync(path.join(root, 'client/src/components/home/HomeView.tsx'), 'utf8');
  const lesson = fs.readFileSync(path.join(root, 'client/src/components/learn/PointerLieLesson.tsx'), 'utf8');
  const speech = fs.readFileSync(path.join(root, 'client/src/a11y/speechBus.ts'), 'utf8');
  const describe = fs.readFileSync(path.join(root, 'client/src/a11y/describeFocus.ts'), 'utf8');

  await test('Navigate mode exists in Guide Me without inventing a second speech stack', () => {
    assert.ok(voice.includes("mode === 'navigate'"));
    assert.ok(voice.includes('Describe focused control'));
    assert.ok(voice.includes('Stop speech'));
    assert.ok(voice.includes('Listen to overview'));
    assert.ok(voice.includes('Main heading'));
    assert.ok(voice.includes('speakConceptLens'));
    assert.ok(speech.includes('stopConceptLensSpeech'));
    assert.equal(voice.includes('new SpeechSynthesisUtterance'), false);
  });

  await test('Navigation entry points exist on Home, Learn shortcut, and Guide Me', () => {
    assert.ok(home.includes('Open navigation guide'));
    assert.ok(app.includes("detail: { mode: 'navigate' }"));
    assert.ok(app.includes('shiftKey'));
    assert.ok(voice.includes('OPEN_GUIDE_EVENT'));
  });

  await test('Focused-element descriptions use name, role, and state', () => {
    assert.ok(describe.includes('accessibleName'));
    assert.ok(describe.includes('roleName'));
    assert.ok(describe.includes('State:'));
    assert.ok(describe.includes('Nothing in the page has keyboard focus yet'));
  });

  await test('Pointer Lie narration follows validation and phase, not presentation alone', () => {
    const proven = narratePointerLie({
      phase: 'proven',
      graph: {
        headId: 'a',
        structureType: 'singly',
        isCircular: false,
        nodes: [
          { id: 'a', value: 1, next: 'b', x: 0, y: 0, confidence: 1 },
          { id: 'b', value: 2, next: null, x: 0, y: 0, confidence: 1 }
        ]
      },
      step: null,
      stepIndex: 0,
      stepCount: 0,
      validation: { isValid: true, floydCycleDetected: false, cycleEdge: null }
    });
    assert.ok(proven.includes('Validation passed'));
    assert.ok(!proven.includes('cycle was detected'));

    const stopped = narratePointerLie({
      phase: 'stopped',
      graph: {
        headId: 'a',
        structureType: 'singly',
        isCircular: false,
        nodes: [
          { id: 'a', value: 1, next: 'b', x: 0, y: 0, confidence: 1 },
          { id: 'b', value: 2, next: 'a', x: 0, y: 0, confidence: 1 }
        ]
      },
      step: null,
      stepIndex: 0,
      stepCount: 0,
      validation: { isValid: false, floydCycleDetected: true, cycleEdge: { fromId: 'b', toId: 'a' } }
    });
    assert.ok(stopped.includes('cycle'));
    assert.ok(stopped.includes('b'));
    assert.ok(stopped.includes('a'));
    assert.ok(lesson.includes('Describe this step'));
    assert.ok(lesson.includes('narratePointerLie'));
  });

  await test('Speech helpers cancel ConceptLens speech without claiming screen-reader mute', () => {
    assert.ok(speech.includes('Does not mute the screen reader') || speech.includes('must stay available'));
    assert.ok(voice.includes('Screen reader announcements stay available') || voice.includes('does not replace your screen reader'));
  });

  await test('Describe focus prefers the pre-guide control while the panel holds keyboard focus', () => {
    assert.ok(voice.includes('insideGuide'));
    assert.ok(voice.includes('previouslyFocused.current'));
  });

  await test('Preference and unmute changes do not auto-start Navigate speech', () => {
    assert.ok(voice.includes('speechRateRef'));
    assert.ok(voice.includes("mode !== 'navigate' && currentStep"));
    assert.ok(voice.includes('Speech starts only when you press Listen'));
  });

  await test('Speech bus fails closed when synthesis is unavailable', () => {
    assert.ok(speech.includes('speechSynthesisAvailable'));
    assert.ok(speech.includes('callbacks.onError'));
    assert.ok(speech.includes('return false'));
  });

  await test('Keyboard shortcuts skip text entry and document Shift+G', () => {
    assert.ok(app.includes("target.tagName === 'INPUT'"));
    assert.ok(app.includes('isContentEditable'));
    const shortcuts = fs.readFileSync(path.join(root, 'client/src/components/KeyboardShortcutsModal.tsx'), 'utf8');
    assert.ok(shortcuts.includes('Shift+G'));
  });

  console.log(`\nNonvisual navigation: ${passed}/${total} passed`);
  if (process.exitCode) process.exit(process.exitCode);
}

void run();
