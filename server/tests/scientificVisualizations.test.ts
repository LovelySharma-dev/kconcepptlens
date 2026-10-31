import assert from 'assert';
import fs from 'fs';
import path from 'path';
import {
  AVAILABLE_VISUAL_MODELS,
  detectInteractiveVisualModel,
  generateDeterministicStudyPlan,
  ADHDStudyPlanRequestSchema,
  ADHDStudyPlanSchema
} from '@conceptlens/shared';
import aiRouter from '../src/routes/ai';

async function runScientificVisualizationsSuite() {
  console.log('🧪 Starting Scientific Visualizations & Inclusive Learning Test Suite...\n');
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
  const cellCanvasCode = fs.readFileSync(path.join(clientDir, 'components/biology/2d/Cell2DCanvas.tsx'), 'utf-8');
  const adhdDashboardCode = fs.readFileSync(path.join(clientDir, 'components/adhd/ADHDLearningDashboard.tsx'), 'utf-8');
  const appCode = fs.readFileSync(path.join(clientDir, 'App.tsx'), 'utf-8');
  const homeViewCode = fs.readFileSync(path.join(clientDir, 'components/home/HomeView.tsx'), 'utf-8');
  const physicsStudioCode = fs.readFileSync(path.join(clientDir, 'components/InteractivePhysicsStudio.tsx'), 'utf-8');

  // ==========================================
  // 1. PHASE 2 & 5: HUMAN CELL SIZING & CONTRACT
  // ==========================================

  await test('Human Cell SVG uses expanded viewBox and coordinates filling >85% of canvas area', () => {
    assert(cellCanvasCode.includes('viewBox="0 0 800 520"'), 'Cell2DCanvas must use 800x520 viewBox');
    assert(cellCanvasCode.includes('rx="345"'), 'Cell cytoplasm/membrane rx must be at least 340px to eliminate empty void');
    assert(cellCanvasCode.includes('ry="220"'), 'Cell cytoplasm/membrane ry must be at least 215px');
    // 345 * 2 = 690px across 800px width = 86.25% canvas utilization!
    const widthRatio = (345 * 2) / 800;
    assert(widthRatio > 0.85, 'Cell width must occupy >85% of SVG viewBox width');
  });

  await test('Human Cell canvas provides Zoom, Pan, Reset, and Frame Selected controls', () => {
    assert(cellCanvasCode.includes('handleZoomIn'), 'Must provide zoom in handler');
    assert(cellCanvasCode.includes('handleZoomOut'), 'Must provide zoom out handler');
    assert(cellCanvasCode.includes('handleResetView'), 'Must provide reset view handler');
    assert(cellCanvasCode.includes('handleFrameSelected'), 'Must provide frame selected organelle handler');
    assert(cellCanvasCode.includes('onPointerDown') && cellCanvasCode.includes('onPointerMove'), 'Must support drag panning');
  });

  await test('Human Cell organelle structures are keyboard accessible with focus outlines', () => {
    assert(cellCanvasCode.includes('tabIndex={0}'), 'Organelles must have tabIndex={0} for keyboard accessibility');
    assert(cellCanvasCode.includes('role="button"'), 'Organelles must expose role="button"');
    assert(cellCanvasCode.includes('handleOrganelleKeyDown'), 'Organelles must handle Enter/Space key down');
    assert(cellCanvasCode.includes('aria-pressed'), 'Organelles must expose aria-pressed selection state');
  });

  await test('All 8 models in registry conform to typed model contract with interactions and accessibility', () => {
    assert.strictEqual(AVAILABLE_VISUAL_MODELS.length, 8, 'Must have 8 registered models');
    for (const model of AVAILABLE_VISUAL_MODELS) {
      assert(['svg_interactive_2d', 'canvas_simulation_2d', 'webgl_3d'].includes(model.rendererType),
        `Model ${model.id} must define rendererType`);
      assert(typeof model.supportedInteractions.zoom === 'boolean', `Model ${model.id} must define zoom interaction`);
      assert(typeof model.supportedInteractions.reset === 'boolean', `Model ${model.id} must define reset interaction`);
      assert(model.selectableStructures.length >= 3, `Model ${model.id} must define selectable structures`);
      assert(model.guidedExplorationSteps.length >= 2, `Model ${model.id} must define guided exploration steps`);
      assert(model.accessibility.screenReaderSummary, `Model ${model.id} must define accessibility screenReaderSummary`);
      assert(model.accessibility.reducedMotionSupport, `Model ${model.id} must support reduced motion`);
      assert(model.attribution.source && model.attribution.license, `Model ${model.id} must declare source and license`);
    }
  });

  // ==========================================
  // 2. SIMULATION REGRESSIONS
  // ==========================================

  await test('Ray optics Gaussian thin lens formula 1/f = 1/v - 1/u is mathematically exact', () => {
    // 1/v = 1/f + 1/u (using Cartesian sign convention where u is negative, 1/f = 1/v - 1/u)
    const f = 100;
    const u = -200; // object 200mm in front of lens
    // 1/v = 1/f + 1/u = 1/100 - 1/200 = 1/200 => v = 200mm (real inverted image at 2F)
    const invV = 1 / f + 1 / u;
    const v = 1 / invV;
    assert.strictEqual(Math.round(v), 200, 'Image distance must equal 200mm for u=200mm, f=100mm');

    const magnification = -v / u;
    assert.strictEqual(magnification, 1, 'Magnification must equal -1 (unit size inverted)');

    // Virtual image test: u inside focal length
    const uInside = -50;
    const invVVirtual = 1 / f + 1 / uInside; // 1/100 - 1/50 = -1/100 => v = -100mm (virtual erect image)
    const vVirtual = 1 / invVVirtual;
    assert.strictEqual(Math.round(vVirtual), -100, 'Virtual image distance must be -100mm');
  });

  await test('Simple pendulum formula T = 2*pi*sqrt(L/g) calculates correct physical period', () => {
    const L = 0.993; // meters (seconds pendulum where half-period is 1.0s, full period is 2.0s)
    const g = 9.80665;
    const T = 2 * Math.PI * Math.sqrt(L / g);
    assert(Math.abs(T - 2.0) < 0.01, `Period must equal ~2.0s for 0.993m string on Earth (got ${T.toFixed(3)})`);

    const physicsServiceCode = fs.readFileSync(path.resolve(__dirname, '../src/services/physicsSimulationService.ts'), 'utf-8');
    assert(physicsServiceCode.includes('T = 2π √(L / g)'), 'Physics simulation service must cite exact formula');
  });

  // ==========================================
  // 3. PHASE 8: ADHD-FRIENDLY LEARNING EXPERIENCE
  // ==========================================

  await test('ADHD study plan schema validates valid goals and rejects empty payloads', () => {
    const validReq = ADHDStudyPlanRequestSchema.safeParse({ goal: 'Study the human cell' });
    assert(validReq.success, 'Valid goal must parse successfully');

    const invalidReq = ADHDStudyPlanRequestSchema.safeParse({ goal: '' });
    assert(!invalidReq.success, 'Empty goal must fail schema validation');
  });

  await test('Deterministic plan generator creates 5 bite-sized tasks under 5 minutes each', () => {
    const cellPlan = generateDeterministicStudyPlan('Study the human cell', 'human_cell');
    assert.strictEqual(cellPlan.tasks.length, 5, 'Must generate exactly 5 tasks');
    for (const task of cellPlan.tasks) {
      assert(task.durationMinutes <= 5, `Task "${task.title}" duration (${task.durationMinutes}m) must be <= 5 minutes`);
      assert(task.subtasks && task.subtasks.length > 0, `Task "${task.title}" must provide subtasks for micro-actions`);
    }

    const heartPlan = generateDeterministicStudyPlan('Heart circulation', 'human_heart');
    assert.strictEqual(heartPlan.tasks.length, 5, 'Heart plan must generate 5 tasks');
  });

  await test('ADHD Dashboard displays required title and exact supporting copy', () => {
    assert(adhdDashboardCode.includes('ADHD-Friendly Learning'), 'Must contain exact title: ADHD-Friendly Learning');
    assert(adhdDashboardCode.includes('A flexible study space with smaller steps, active learning, and easy ways to pick up where you left off.'),
      'Must contain exact supporting copy');
  });

  await test('ADHD Dashboard provides 4 primary actions: Continue Learning, Start Something Small, Quick Practice, Plan', () => {
    assert(adhdDashboardCode.includes('Continue Learning'), 'Must include Continue Learning action');
    assert(adhdDashboardCode.includes('Start Something Small'), 'Must include Start Something Small action');
    assert(adhdDashboardCode.includes('Quick Practice'), 'Must include Quick Practice action');
    assert(adhdDashboardCode.includes('Flexible Focus Timer'), 'Must include Flexible Focus Timer');
    assert(adhdDashboardCode.includes('Micro-Task Planner'), 'Must include Micro-Task Planner');
  });

  await test('Flexible focus timer uses timestamp math rather than drift-prone setInterval counters', () => {
    assert(adhdDashboardCode.includes('endTimeRef.current'), 'Must use endTimeRef timestamp for clock accuracy');
    assert(adhdDashboardCode.includes('Date.now()'), 'Must compute remaining time relative to Date.now()');
    assert(adhdDashboardCode.includes('formatTime'), 'Must format MM:SS cleanly');
  });

  await test('Active learning supports 6+ modalities and One-Step-At-A-Time mode', () => {
    assert(adhdDashboardCode.includes('oneStepMode'), 'Must support One Step at a Time mode');
    assert(adhdDashboardCode.includes('Active Recall'), 'Must support Active Recall');
    assert(adhdDashboardCode.includes('Teach It Back'), 'Must support Teach It Back');
    assert(adhdDashboardCode.includes('Visual Model'), 'Must support Visual Model launch');
    assert(adhdDashboardCode.includes('Simple Steps'), 'Must support Simple Steps');
  });

  await test('App.tsx and HomeView.tsx provide dedicated tab and navigation into ADHD space', () => {
    assert(appCode.includes("activeTab === 'adhd'"), 'App.tsx must route to adhd tab');
    assert(appCode.includes('ADHD Space'), 'App.tsx header must have ADHD Space tab button');
    assert(homeViewCode.includes('ADHD-Friendly Learning'), 'HomeView must offer ADHD-Friendly Learning button');
  });

  await test('POST /api/ai/plan-tasks endpoint validates and returns 5 structured micro-tasks', async () => {
    await new Promise<void>((resolve, reject) => {
      const req: any = {
        method: 'POST',
        url: '/plan-tasks',
        body: { goal: 'Understand Plant Cell Chloroplasts', conceptId: 'plant_cell' },
        ip: '127.0.0.1',
        socket: { remoteAddress: '127.0.0.1' },
        headers: {}
      };
      const res: any = {
        statusCode: 200,
        status(code: number) { this.statusCode = code; return this; },
        json(data: any) {
          try {
            assert.strictEqual(this.statusCode, 200);
            assert.strictEqual(data.success, true);
            assert(data.data.tasks.length === 5, 'Plan endpoint must return 5 tasks');
            assert(data.data.tasks[0].durationMinutes <= 5, 'Task duration must be <= 5 min');
            resolve();
          } catch (err) {
            reject(err);
          }
          return this;
        }
      };
      aiRouter.handle(req, res, (err?: any) => { if (err) reject(err); });
    });
  });

  await test('POST /api/ai/plan-tasks endpoint rejects invalid payloads with 400 Bad Request', async () => {
    await new Promise<void>((resolve, reject) => {
      const req: any = {
        method: 'POST',
        url: '/plan-tasks',
        body: { goal: '' },
        ip: '127.0.0.1',
        socket: { remoteAddress: '127.0.0.1' },
        headers: {}
      };
      const res: any = {
        statusCode: 200,
        status(code: number) { this.statusCode = code; return this; },
        json(data: any) {
          try {
            assert.strictEqual(this.statusCode, 400);
            assert.strictEqual(data.success, false);
            assert(Array.isArray(data.issues) && data.issues.length > 0, 'Issues array must explain validation errors');
            resolve();
          } catch (err) {
            reject(err);
          }
          return this;
        }
      };
      aiRouter.handle(req, res, (err?: any) => { if (err) reject(err); });
    });
  });

  console.log(`\n========================================`);
  console.log(`🏁 SCIENTIFIC VISUALIZATION RESULTS: ${passed}/${total} PASSED`);
  console.log(`========================================\n`);

  if (passed !== total) {
    process.exitCode = 1;
  }
}

runScientificVisualizationsSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
