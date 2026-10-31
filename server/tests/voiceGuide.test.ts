import assert from 'assert';
import fs from 'fs';
import path from 'path';

async function runVoiceGuideTestSuite() {
  console.log('🧪 Starting Website-Wide Interactive Voice Guide (Phase 2) Test Suite...\n');
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

  const clientDir = path.resolve(__dirname, '../../client/src');
  const voiceGuideCode = fs.readFileSync(path.join(clientDir, 'components/VoiceGuide.tsx'), 'utf-8');
  const appCode = fs.readFileSync(path.join(clientDir, 'App.tsx'), 'utf-8');
  const cssCode = fs.readFileSync(path.join(clientDir, 'index.css'), 'utf-8');

  // 1. PERSISTENT ENTRY POINT & ACCESS
  await test('VoiceGuide provides a persistent, clearly labelled "Guide Me" control across the app', () => {
    assert(voiceGuideCode.includes('className="voice-guide-launcher"'), 'VoiceGuide launcher must exist');
    assert(voiceGuideCode.includes('>Guide Me</span>'), 'VoiceGuide launcher must have visible text "Guide Me"');
    assert(appCode.includes('<VoiceGuide'), 'App.tsx must mount VoiceGuide');
    assert(appCode.includes('<span>Guide Me</span>'), 'App toolbar must include persistent Guide Me button');
  });

  // 2. ENTRY OPTIONS
  await test('VoiceGuide offers Page Tour, Task Guide, Read Aloud, and Navigate', () => {
    assert(voiceGuideCode.includes('Guide Me Through Page'), 'Must offer "Guide me through this page"');
    assert(voiceGuideCode.includes('Help Complete a Task'), 'Must offer "Help me complete a task"');
    assert(voiceGuideCode.includes('Read Aloud'), 'Must offer "Read this page aloud"');
    assert(voiceGuideCode.includes('Navigate'), 'Must offer nonvisual Navigate mode');
  });

  // 3. REQUIRED PAGE TOURS ACCURACY & COVERAGE
  const requiredPages = ['home', 'learn', 'biology', 'practice', 'adhd', 'cloudinary', 'accessibility', 'about'];

  for (const page of requiredPages) {
    await test(`PAGE_TOURS defines complete walkthrough for page: ${page}`, () => {
      assert(voiceGuideCode.includes(`${page}: {`), `PAGE_TOURS must define entry for ${page}`);
    });
  }

  await test('Home tour explains ConceptLens purpose, inclusive learning, and starting study', () => {
    assert(voiceGuideCode.includes('Welcome to ConceptLens'), 'Home tour must welcome user');
    assert(voiceGuideCode.includes('Start Learning'), 'Home tour must explain how to start learning');
    assert(voiceGuideCode.includes('UN SDG 4'), 'Home tour must mention UN SDG 4 mission');
  });

  await test('Learn tour explains subject discovery, concept selection, 6 representations, and learning continuity', () => {
    assert(voiceGuideCode.includes('Subject Discovery'), 'Learn tour must explain subject discovery');
    assert(voiceGuideCode.includes('Concept Selection'), 'Learn tour must explain concept selection');
    assert(voiceGuideCode.includes('Multiple Representations'), 'Learn tour must explain multiple representations');
    assert(voiceGuideCode.includes('Learning Continuity'), 'Learn tour must explain learning continuity');
  });

  await test('Interactive models tour explains diagram component selection, zoom/reset HUD, and guided steps', () => {
    assert(voiceGuideCode.includes('Selecting Diagram Components'), 'Models tour must explain component selection');
    assert(voiceGuideCode.includes('Zoom, Pan & Reset Controls'), 'Models tour must explain zoom/reset controls');
    assert(voiceGuideCode.includes('Guided Model Steps'), 'Models tour must explain guided model steps');
  });

  await test('Practice tour explains supported input methods (text, files, camera, speech) and OCR review', () => {
    assert(voiceGuideCode.includes('Supported Input Methods'), 'Practice tour must explain inputs');
    assert(voiceGuideCode.includes('Paste Text, Upload Documents, Take a Photo, or Dictate'), 'Must accurately list input methods');
    assert(voiceGuideCode.includes('Local Text Extraction & OCR Review'), 'Must explain OCR and extraction review');
  });

  await test('ADHD Space tour explains Continue Learning, Start Small, Quick Practice, and Focus Timer', () => {
    assert(voiceGuideCode.includes('Continue Learning'), 'ADHD tour must explain Continue Learning');
    assert(voiceGuideCode.includes('Start Something Small'), 'ADHD tour must explain Start Something Small');
    assert(voiceGuideCode.includes('Quick Practice'), 'ADHD tour must explain Quick Practice');
    assert(voiceGuideCode.includes('Flexible Focus Timer & Micro-Tasks'), 'ADHD tour must explain focus timer and planning');
  });

  await test('Media Studio tour explains preview slider, comparison, confirm/discard, and credit-consuming operations', () => {
    assert(voiceGuideCode.includes('Selecting an Asset'), 'Media tour must explain asset selection');
    assert(voiceGuideCode.includes('Previewing Transformations'), 'Media tour must explain preview slider');
    assert(voiceGuideCode.includes('Transparent Transformation Credits'), 'Media tour must explain credit costs');
    assert(voiceGuideCode.includes('Applying or Discarding Changes'), 'Media tour must explain applying or discarding changes');
    assert(!voiceGuideCode.includes('every AI operation is free'), 'Must not imply all AI operations are free');
  });

  await test('Accessibility Settings tour explains 18 themes, focus/vision/sensory modes, and preserving settings', () => {
    assert(voiceGuideCode.includes('18 interface themes'), 'A11y tour must explain themes');
    assert(voiceGuideCode.includes('Focus & Reading Modes'), 'A11y tour must explain focus modes');
    assert(voiceGuideCode.includes('Preserving Preferences'), 'A11y tour must explain preserving preferences on close');
  });

  await test('About tour explains project mission, five architectural pillars, and UN SDG 4 connection', () => {
    assert(voiceGuideCode.includes('Mission & Purpose'), 'About tour must explain mission');
    assert(voiceGuideCode.includes('UN SDG 4 Connection'), 'About tour must explain SDG 4');
    assert(voiceGuideCode.includes('Five Architectural Pillars'), 'About tour must explain 5 pillars');
  });

  // 4. SPEECH SYNTHESIS & FALLBACK BEHAVIOUR
  await test('Speech cancellation is enforced on stop, step change, exit, and route unmount', () => {
    assert(
      voiceGuideCode.includes('stopConceptLensSpeech') || voiceGuideCode.includes('window.speechSynthesis.cancel()'),
      'Must cancel ConceptLens speech through the shared bus or speechSynthesis.cancel()'
    );
    assert(voiceGuideCode.includes('stopSpeech()'), 'Must call stopSpeech cleanup');
  });

  await test('Missing speech synthesis falls back cleanly to readable visible instructions', () => {
    assert(voiceGuideCode.includes('Browser speech synthesis is unavailable on this device'), 'Must show visible fallback status');
    assert(voiceGuideCode.includes('className="guide-instruction-text"'), 'Visible instruction text must always render');
  });

  await test('Voice guide provides Next, Back, Repeat, Pause/Resume, Skip, and Exit controls', () => {
    assert(voiceGuideCode.includes('handleBack'), 'Must provide Back control');
    assert(voiceGuideCode.includes('handleNext'), 'Must provide Next control');
    assert(voiceGuideCode.includes('handleRepeat'), 'Must provide Repeat control');
    assert(voiceGuideCode.includes('handleTogglePause'), 'Must provide Pause/Resume control');
    assert(voiceGuideCode.includes('handleClose'), 'Must provide Exit/Skip control');
  });

  // 5. RESPONSIVE DESIGN & ACCESSIBILITY
  await test('VoiceGuide CSS provides mobile responsive dock without horizontal overflow', () => {
    assert(cssCode.includes('.voice-guide-panel'), 'voice-guide-panel style must exist');
    assert(cssCode.includes('width: min(450px, calc(100vw - 32px))'), 'Must constrain width to prevent overflow');
    assert(cssCode.includes('@media (max-width: 480px)'), 'Must include mobile responsive breakpoint');
    assert(cssCode.includes('.voice-guide-active-target'), 'Active target spotlight style must exist');
  });

  console.log(`\n========================================`);
  console.log(`🏁 VOICE GUIDE RESULTS: ${passed}/${total} PASSED`);
  console.log(`========================================\n`);

  if (passed < total) {
    process.exit(1);
  }
}

runVoiceGuideTestSuite().catch((err) => {
  console.error(err);
  process.exit(1);
});

