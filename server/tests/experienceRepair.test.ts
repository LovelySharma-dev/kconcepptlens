import assert from 'assert';
import fs from 'fs';
import path from 'path';
import {
  AVAILABLE_VISUAL_MODELS,
  detectInteractiveVisualModel,
  getVisualModelFallbackExplanation,
  LEARNING_THEME_IDS,
  learningThemes
} from '@conceptlens/shared';

async function runExperienceRepairSuite() {
  console.log('🧪 Starting Experience Repair & Product Integrity Test Suite...\n');
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
  const indexCss = fs.readFileSync(path.join(clientDir, 'index.css'), 'utf-8');
  const focusRulerCode = fs.readFileSync(path.join(clientDir, 'components/FocusRuler.tsx'), 'utf-8');
  const homeViewCode = fs.readFileSync(path.join(clientDir, 'components/home/HomeView.tsx'), 'utf-8');
  const learnWorkspaceCode = fs.readFileSync(path.join(clientDir, 'components/learn/LearnWorkspace.tsx'), 'utf-8');
  const appCode = fs.readFileSync(path.join(clientDir, 'App.tsx'), 'utf-8');

  // ==========================================
  // 1. PRIORITY 1: FOCUS MODE SCROLLING REPAIR
  // ==========================================

  await test('Focus Mode CSS rules ensure document root and body remain vertically scrollable', () => {
    assert(indexCss.includes('body.focus-mode'), 'index.css must target body.focus-mode');
    assert(indexCss.includes('body.adhd-friendly'), 'index.css must target body.adhd-friendly');
    assert(indexCss.includes('overflow-y: auto !important;'), 'body must enforce overflow-y: auto !important');
    assert(indexCss.includes('overscroll-behavior-y: auto !important;'), 'body must enforce overscroll-behavior-y: auto !important');
  });

  await test('Focus Mode containers (#root, .app-container, .main-content) do not trap or clip overflow', () => {
    assert(indexCss.includes('body.focus-mode #root'), 'index.css must preserve #root in focus mode');
    assert(indexCss.includes('body.focus-mode .app-container'), 'index.css must preserve .app-container');
    assert(indexCss.includes('body.focus-mode .main-content'), 'index.css must preserve .main-content');
    assert(indexCss.includes('overflow: visible !important;'), 'containers must enforce overflow: visible !important');
  });

  await test('Reading ruler guide aperture has pointer-events: none and touch-action: pan-y', () => {
    assert(indexCss.includes('.reading-ruler-guide'), 'index.css must style .reading-ruler-guide');
    assert(indexCss.includes('pointer-events: none !important;'), 'reading ruler must not intercept mouse or click events');
    assert(indexCss.includes('touch-action: pan-y !important;'), 'reading ruler must permit touch vertical scrolling');
    assert(focusRulerCode.includes("pointerEvents: 'none'"), 'FocusRuler component must pass pointerEvents: none');
    assert(focusRulerCode.includes("touchAction: 'pan-y'"), 'FocusRuler component must pass touchAction: pan-y');
  });

  await test('Keyboard navigation does not call preventDefault on native scrolling keys in Focus Mode', () => {
    assert(!focusRulerCode.includes("e.key === 'PageDown'") || !focusRulerCode.includes("PageDown')\n        e.preventDefault()"),
      'FocusRuler must not preventDefault on PageDown');
    assert(!focusRulerCode.includes("e.key === 'PageUp'") || !focusRulerCode.includes("PageUp')\n        e.preventDefault()"),
      'FocusRuler must not preventDefault on PageUp');
    assert(focusRulerCode.includes('full native keyboard scrolling remains completely unbroken'),
      'FocusRuler must explicitly document preserved native scrolling');
  });

  // ==========================================
  // 2. PRIORITY 2: VISUAL MODEL / EXPLORE WORKSPACE
  // ==========================================

  await test('Available visual models registry defines exactly 8 real interactive models', () => {
    assert.strictEqual(AVAILABLE_VISUAL_MODELS.length, 8, 'There must be exactly 8 verified interactive models');
    const expectedIds = [
      'human_cell',
      'human_heart',
      'plant_cell',
      'dna_helix',
      'neuron',
      'physics_optics',
      'physics_pendulum',
      'data_structure'
    ];
    for (const expectedId of expectedIds) {
      const match = AVAILABLE_VISUAL_MODELS.find((m) => m.id === expectedId);
      assert(match, `Model registry missing ${expectedId}`);
      assert(match.title.length > 5, `Model ${expectedId} has valid title`);
      assert(match.keywords.length >= 3, `Model ${expectedId} has keyword search triggers`);
      assert(['biology', 'physics', 'data_structure'].includes(match.domain), `Model ${expectedId} has valid domain`);
    }
  });

  await test('Heuristic concept matching correctly identifies biological models', () => {
    const cellMatch = detectInteractiveVisualModel('Mitochondria and cellular respiration in eukaryotic cells');
    assert(cellMatch && cellMatch.id === 'human_cell', 'Must match human_cell for mitochondria');

    const heartMatch = detectInteractiveVisualModel('Human heart cardiovascular systemic circulation');
    assert(heartMatch && heartMatch.id === 'human_heart', 'Must match human_heart for cardiovascular');

    const plantMatch = detectInteractiveVisualModel('Photosynthesis in plant chloroplast thylakoid');
    assert(plantMatch && plantMatch.id === 'plant_cell', 'Must match plant_cell for chloroplast');

    const dnaMatch = detectInteractiveVisualModel('Watson-Crick DNA double helix nucleotide pairs');
    assert(dnaMatch && dnaMatch.id === 'dna_helix', 'Must match dna_helix for dna');

    const neuronMatch = detectInteractiveVisualModel('Axon myelin sheath and synaptic neurotransmission');
    assert(neuronMatch && neuronMatch.id === 'neuron', 'Must match neuron for synapse');
  });

  await test('Heuristic concept matching correctly identifies physics and computer science models', () => {
    const opticsMatch = detectInteractiveVisualModel('Geometrical optics: convex lens focal length');
    assert(opticsMatch && opticsMatch.id === 'physics_optics', 'Must match physics_optics for convex lens');

    const pendulumMatch = detectInteractiveVisualModel('Simple harmonic motion and restoring force of pendulum');
    assert(pendulumMatch && pendulumMatch.id === 'physics_pendulum', 'Must match physics_pendulum for pendulum');

    const csMatch = detectInteractiveVisualModel('Singly linked list pointer node allocation');
    assert(csMatch && csMatch.id === 'data_structure', 'Must match data_structure for linked list');
  });

  await test('Unmapped or non-physical concepts return null and trigger honest educational guidance', () => {
    const literatureMatch = detectInteractiveVisualModel('Shakespearean sonnet structure and iambic pentameter');
    assert.strictEqual(literatureMatch, null, 'Abstract literature topic must not force a physical model');

    const fallbackMsg = getVisualModelFallbackExplanation('Shakespearean sonnet structure');
    assert(fallbackMsg.includes('abstract or conceptual subject'), 'Fallback must honestly explain lack of physical model');
    assert(fallbackMsg.includes('Read, Simplified, or Step-by-Step tabs'), 'Fallback must direct learner to text representations');
    assert(fallbackMsg.includes('8 interactive scientific models'), 'Fallback must offer catalog exploration');
  });

  await test('LearnWorkspace and App provide bidirectional "Back to Lesson" continuity without losing progress', () => {
    assert(learnWorkspaceCode.includes('Back to Lesson'), 'LearnWorkspace must have Back to Lesson button');
    assert(learnWorkspaceCode.includes('setRepresentation'), 'LearnWorkspace must allow switching representation back to read');
    assert(learnWorkspaceCode.includes('activeVisualModelId'), 'LearnWorkspace must track active visual model selection');
    assert(appCode.includes('Back to Lesson'), 'App.tsx must have Back to Lesson buttons in interactive views');
  });

  // ==========================================
  // 3. PRIORITY 3: LANDING PAGE REDESIGN & EDITORIAL
  // ==========================================

  await test('Landing page contains exact required editorial section eyebrow and heading', () => {
    assert(homeViewCode.includes('OUR APPROACH TO LEARNING'), 'Must contain eyebrow: OUR APPROACH TO LEARNING');
    assert(homeViewCode.includes('Education should adapt to people. Not the other way around.'),
      'Must contain heading: Education should adapt to people. Not the other way around.');
    assert(homeViewCode.includes('ConceptLens brings these learning experiences together'),
      'Must contain supporting explanation of multi-modal learning without losing progress');
  });

  await test('Landing page renders 4 distinct editorial features with interactive elements', () => {
    // Feature 1
    assert(homeViewCode.includes('Make the experience fit you.'), 'Must contain Feature 1 heading');
    assert(homeViewCode.includes('ADHD Focus & Ruler'), 'Must include ADHD preview toggle');
    assert(homeViewCode.includes('Dyslexia Typography'), 'Must include Dyslexia preview toggle');
    assert(homeViewCode.includes('High Contrast'), 'Must include Contrast preview toggle');

    // Feature 2
    assert(homeViewCode.includes('Start with what you already have.'), 'Must contain Feature 2 heading');
    assert(homeViewCode.includes('1. Your Study Material'), 'Must include Step 1 in ingestion workflow');
    assert(homeViewCode.includes('2. Review Extracted Text'), 'Must include Step 2 review step');
    assert(homeViewCode.includes('3. Learn and Practise'), 'Must include Step 3 learn & practise');

    // Feature 3
    assert(homeViewCode.includes('See how concepts work.'), 'Must contain Feature 3 heading');
    assert(homeViewCode.includes('The Animal Cell'), 'Must include interactive organelle specimen');
    assert(homeViewCode.includes('Mitochondria'), 'Must include interactive mitochondria selector');

    // Feature 4
    assert(homeViewCode.includes('One idea. Multiple ways to understand it.'), 'Must contain Feature 4 heading');
    assert(homeViewCode.includes('Read') && homeViewCode.includes('Understand') && homeViewCode.includes('Explore') && homeViewCode.includes('Practise'),
      'Must contain connected journey path');
  });

  await test('Landing page contains closing statement and primary call to action', () => {
    assert(homeViewCode.includes('Your learning journey should move with you.'), 'Must contain closing statement');
    assert(homeViewCode.includes('Start learning'), 'Must contain primary CTA: Start learning');
  });

  // ==========================================
  // 4. PRIORITY 4: HONEST PRODUCT CLAIMS
  // ==========================================

  await test('Landing page resilience copy matches exact requirement without hype', () => {
    const requiredCopy = 'Learning that keeps moving. ConceptLens can use configured AI services when available and fall back to deterministic local behavior for supported tasks when a service is unavailable.';
    assert(homeViewCode.includes(requiredCopy), 'Landing page must feature exact honest resilience copy');
  });

  await test('18 accessibility themes exist and specify observable styling properties', () => {
    assert.strictEqual(LEARNING_THEME_IDS.length, 18, 'Must have exactly 18 accessibility theme ids');
    const themes = learningThemes();
    assert.strictEqual(themes.length, 18, 'learningThemes() must catalog all 18 themes');
    for (const theme of themes) {
      assert(theme.title, `Theme ${theme.id} must have title`);
      assert(theme.description, `Theme ${theme.id} must have description`);
      assert(theme.flags && theme.flags.length > 0, `Theme ${theme.id} must have interface behavior flags`);
    }
  });

  console.log(`\n========================================`);
  console.log(`🏁 EXPERIENCE REPAIR TEST RESULTS: ${passed}/${total} PASSED`);
  console.log(`========================================\n`);

  if (passed !== total) {
    process.exitCode = 1;
  }
}

runExperienceRepairSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
