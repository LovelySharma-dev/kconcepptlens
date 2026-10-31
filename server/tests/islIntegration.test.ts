import assert from 'assert';
import fs from 'fs';
import path from 'path';
import {
  ISLLessonResourceSchema,
  ISLReviewStatusSchema
} from '@conceptlens/shared';
import {
  AUTHENTIC_ISL_CATALOG,
  getAuthenticISLResource
} from '../../client/src/data/islLessons';

async function runISLIntegrationTestSuite() {
  console.log('🧪 Starting Authentic Indian Sign Language (ISL) Integration Test Suite...\n');
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
  const islPanelCode = fs.readFileSync(path.join(clientDir, 'components/ISLVideoPanel.tsx'), 'utf-8');
  const learnWorkspaceCode = fs.readFileSync(path.join(clientDir, 'components/learn/LearnWorkspace.tsx'), 'utf-8');
  const docCode = fs.readFileSync(path.resolve(__dirname, '../../docs/ISL_EVALUATION_AND_INTEGRATION.md'), 'utf-8');

  // ==========================================
  // 1. STRUCTURED SCHEMA VALIDATION
  // ==========================================

  await test('ISLLessonResourceSchema validates complete authentic lesson resource', () => {
    const validResource = {
      lessonId: 'human_cell',
      topic: 'Human Cell: The Fundamental Unit of Life',
      title: 'Cell Structure & Organelles in ISL',
      videoUrl: 'https://example.com/isl/human-cell.mp4',
      language: 'ISL',
      description: 'Authentic Indian Sign Language explanation of human cell anatomy.',
      source: 'ISLRTC & NCERT Class 9 Science',
      attribution: 'ISLRTC / NCERT Open Educational Resource',
      license: 'Non-Commercial Educational Attribution License',
      reviewStatus: 'verified',
      reviewerMetadata: {
        reviewerName: 'ISLRTC Certified Sign Language Review Panel',
        organization: 'ISLRTC, New Delhi',
        certification: 'RCI Registered ISL Master Trainer',
        reviewedAt: '2026-06-15T10:00:00Z'
      }
    };

    const parsed = ISLLessonResourceSchema.parse(validResource);
    assert.strictEqual(parsed.language, 'ISL');
    assert.strictEqual(parsed.reviewStatus, 'verified');
  });

  await test('ISLLessonResourceSchema rejects non-ISL language tag to prevent misleading sign labels', () => {
    const invalidLanguage = {
      lessonId: 'test_1',
      topic: 'Test Topic',
      title: 'Test Title',
      videoUrl: 'https://example.com/video.mp4',
      language: 'ASL', // Invalid: Must be literal 'ISL'
      description: 'Test description',
      source: 'Test source',
      attribution: 'Test attribution',
      license: 'Test license',
      reviewStatus: 'verified'
    };

    assert.throws(() => {
      ISLLessonResourceSchema.parse(invalidLanguage);
    }, /Invalid literal value/);
  });

  await test('ISLLessonResourceSchema rejects insecure http video URLs', () => {
    const insecureResource = {
      lessonId: 'test_2',
      topic: 'Test Topic',
      title: 'Test Title',
      videoUrl: 'http://insecure.example.com/video.mp4', // Insecure!
      language: 'ISL',
      description: 'Test description',
      source: 'Test source',
      attribution: 'Test attribution',
      license: 'Test license',
      reviewStatus: 'verified'
    };

    assert.throws(() => {
      ISLLessonResourceSchema.parse(insecureResource);
    }, /secure https/);
  });

  await test('ISLLessonResourceSchema rejects missing attribution or licensing fields', () => {
    const missingLegal = {
      lessonId: 'test_3',
      topic: 'Test Topic',
      title: 'Test Title',
      videoUrl: 'https://example.com/video.mp4',
      language: 'ISL',
      description: 'Test description',
      reviewStatus: 'verified'
    };

    assert.throws(() => {
      ISLLessonResourceSchema.parse(missingLegal);
    });
  });

  // ==========================================
  // 2. AUTHENTIC RESOURCE CATALOG MAPPING
  // ==========================================

  await test('AUTHENTIC_ISL_CATALOG does not claim verified videos that this project does not host', () => {
    const hosted = Object.values(AUTHENTIC_ISL_CATALOG);
    assert.strictEqual(hosted.length, 0, 'No in-app ISL file is verified for playback yet');
    for (const res of hosted) {
      assert.notStrictEqual(res.reviewStatus, 'verified');
      assert(!res.videoUrl.includes('conceptlens-edu'), 'Do not point the player at an unverified project video');
    }
    const lessons = fs.readFileSync(path.resolve(__dirname, '../../client/src/data/islLessons.ts'), 'utf-8');
    assert(lessons.includes('https://islrtc.nic.in/science-concept-video/'), 'Official ISLRTC directory must stay linked');
    assert(!lessons.includes('res.cloudinary.com/conceptlens-edu'), 'Do not advertise a Cloudinary cloud that does not hold these lessons');
  });

  await test('getAuthenticISLResource returns null until a lesson has a checked ISL video', () => {
    assert.strictEqual(getAuthenticISLResource('human_cell'), null);
    assert.strictEqual(getAuthenticISLResource('Double Circulation: Human Heart'), null);
    assert.strictEqual(getAuthenticISLResource('quantum_chromodynamics_subatomic_quarks'), null);
  });

  // ==========================================
  // 3. REUSABLE ISL VIDEO COMPONENT (ISLVideoPanel)
  // ==========================================

  await test('ISLVideoPanel provides accessible keyboard controls (Space, Left/Right arrow, Mute)', () => {
    assert(islPanelCode.includes("e.key === ' ' || e.key === 'k'"), 'Must handle Space/K for Play/Pause');
    assert(islPanelCode.includes("e.key === 'ArrowRight'"), 'Must handle Right Arrow for Seek Forward');
    assert(islPanelCode.includes("e.key === 'ArrowLeft'"), 'Must handle Left Arrow for Seek Backward');
    assert(islPanelCode.includes("e.key === 'm' || e.key === 'M'"), 'Must handle M key for Mute');
  });

  await test('ISLVideoPanel distinguishes verified ISL content from unreviewed content', () => {
    assert(islPanelCode.includes("reviewStatus === 'verified'"), 'Must check for verified review status');
    assert(islPanelCode.includes('Verified ISL Lesson'), 'Must show verified badge');
    assert(islPanelCode.includes('Under Review'), 'Must show under review badge for pending content');
  });

  await test('ISLVideoPanel handles unavailable state honestly without faking signing avatars', () => {
    assert(islPanelCode.includes('A signed explanation of this lesson is not yet available'), 'Must say when signing is missing');
    assert(islPanelCode.includes('ISL_OFFICIAL_DIRECTORY.href'), 'Must link the official directory');
    assert(islPanelCode.includes('Captions and this text are not Indian Sign Language'), 'Must not treat text as signing');
    assert(islPanelCode.includes('We do not substitute fake 3D avatars'), 'Must explain absence of fake avatars');
    assert(islPanelCode.includes('VideoOff'), 'Must render video off icon');
  });

  await test('ISLVideoPanel displays source attribution, licensing, and reviewer credentials', () => {
    assert(islPanelCode.includes('resource.source'), 'Must render source');
    assert(islPanelCode.includes('resource.attribution'), 'Must render attribution');
    assert(islPanelCode.includes('resource.license'), 'Must render license');
    assert(islPanelCode.includes('resource.reviewerMetadata'), 'Must render reviewer credentials');
  });

  await test('ISLVideoPanel supports interactive transcript cues with timestamp seeking', () => {
    assert(islPanelCode.includes('handleSeekToCue'), 'Must provide handleSeekToCue method');
    assert(islPanelCode.includes('cue.startTimeSec'), 'Must bind cue timestamps');
  });

  // ==========================================
  // 4. INTEGRATION & CONTINUITY SAFETY
  // ==========================================

  await test('LearnWorkspace integrates ISL Video as a first-class representation tab and alongside deafFriendly mode', () => {
    assert(learnWorkspaceCode.includes("representation === 'isl'"), 'LearnWorkspace must handle isl representation');
    assert(learnWorkspaceCode.includes('<ISLVideoPanel'), 'LearnWorkspace must render ISLVideoPanel');
    assert(learnWorkspaceCode.includes('preferences.deafFriendly'), 'Must render ISL alongside text for deafFriendly mode');
  });

  await test('Client codebase does not expose API secrets or private tokens', () => {
    assert(!islPanelCode.includes('api_secret'), 'ISLVideoPanel must not contain api_secret');
    assert(!islPanelCode.includes('CLOUDINARY_API_SECRET'), 'No server secret in client code');
    assert(!learnWorkspaceCode.includes('CLOUDINARY_API_SECRET'), 'No server secret in learn workspace');
  });

  await test('ISL AI Translation evaluation documentation exists and documents candidate limits honestly', () => {
    assert(docCode.includes('Zero Synthetic Hallucination of Sign Language'), 'Doc must declare ethical policy');
    assert(docCode.includes('ISLRTC & NCERT'), 'Doc must detail ISLRTC provenance');
    assert(docCode.includes('English-to-Gloss Rule Mappers'), 'Doc must evaluate gloss mappers');
    assert(docCode.includes('Synthetic 3D Avatars'), 'Doc must evaluate 3D avatars');
    assert(docCode.includes('Reviewer Validation Protocol'), 'Doc must define validation protocol');
  });

  console.log(`\n========================================`);
  console.log(`🏁 ISL INTEGRATION RESULTS: ${passed}/${total} PASSED`);
  console.log(`========================================\n`);

  if (passed < total) {
    process.exit(1);
  }
}

runISLIntegrationTestSuite().catch((err) => {
  console.error(err);
  process.exit(1);
});

