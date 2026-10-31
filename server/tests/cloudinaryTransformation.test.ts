import assert from 'assert';
import {
  CloudinaryTransformationSpecSchema,
  NaturalLanguageTransformRequestSchema,
  isValidPublicId
} from '@conceptlens/shared';
import {
  parseDeterministicInstruction,
  buildTransformationUrl,
  estimateBandwidthSavings,
  executeTransformationInstruction,
  sanitizePrompt
} from '../src/services/cloudinaryTransformationService';
import { signedUploadAllowed } from '../src/config/cloudinary';

async function runTransformationSuite() {
  console.log('🧪 Starting Cloudinary Natural-Language Transformation Engine Test Suite...\n');
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
  // 1. DETERMINISTIC NATURAL-LANGUAGE PARSING
  // ==========================================

  await test('Parses "Crop to a square" into 1:1 fill crop with smart gravity', () => {
    const spec = parseDeterministicInstruction('Crop this image to a square', 'sample');
    assert.strictEqual(spec.crop, 'fill');
    assert.strictEqual(spec.width, 400);
    assert.strictEqual(spec.height, 400);
    assert.strictEqual(spec.deliveryProfile, 'square_thumbnail');
    assert.strictEqual(spec.gravity, 'auto:subject');
  });

  await test('Parses "square portrait focusing on face" with face gravity', () => {
    const spec = parseDeterministicInstruction('Make a square avatar focusing on face', 'sample_avatar');
    assert.strictEqual(spec.crop, 'fill');
    assert.strictEqual(spec.gravity, 'face');
    assert.strictEqual(spec.width, 400);
    assert.strictEqual(spec.height, 400);
  });

  await test('Parses "Make a smaller version for low-data mode" into 480px eco delivery', () => {
    const spec = parseDeterministicInstruction('Make a smaller version for low-data mode', 'sample');
    assert.strictEqual(spec.deliveryProfile, 'low_data');
    assert.strictEqual(spec.crop, 'limit');
    assert.strictEqual(spec.width, 480);
    assert.strictEqual(spec.quality, 'auto:eco');
    const savings = estimateBandwidthSavings(spec);
    assert.ok(savings >= 70, `Expected >= 70% bandwidth savings, got ${savings}%`);
  });

  await test('Parses "Resize this for a lesson card" into 16:9 widescreen card (640x360)', () => {
    const spec = parseDeterministicInstruction('Resize this for a lesson card', 'sample');
    assert.strictEqual(spec.deliveryProfile, 'lesson_card');
    assert.strictEqual(spec.crop, 'fill');
    assert.strictEqual(spec.width, 640);
    assert.strictEqual(spec.height, 360);
  });

  await test('Parses diagram readability prompt into sharpened contrast-enhanced HQ diagram', () => {
    const spec = parseDeterministicInstruction(
      'Sharpen textbook diagram and labels for maximum clarity',
      'biology_specimen'
    );
    assert.strictEqual(spec.deliveryProfile, 'diagram_hq');
    assert.strictEqual(spec.crop, 'limit');
    assert.strictEqual(spec.width, 1200);
    assert.ok(spec.effects?.includes('sharpen:80'));
    assert.ok(spec.effects?.includes('contrast'));
    assert.strictEqual(spec.quality, 'auto:good');
  });

  // ==========================================
  // 2. DIMENSION EXTRACTION & EFFECTS
  // ==========================================

  await test('Extracts explicit dimensions "1024x768" with fit crop', () => {
    const spec = parseDeterministicInstruction('Resize image to 1024x768', 'sample');
    assert.strictEqual(spec.width, 1024);
    assert.strictEqual(spec.height, 768);
    assert.strictEqual(spec.crop, 'fit');
  });

  await test('Extracts width keyword "width 600" without changing height', () => {
    const spec = parseDeterministicInstruction('Make width 600', 'sample');
    assert.strictEqual(spec.width, 600);
    assert.strictEqual(spec.height, undefined);
  });

  await test('Detects grayscale and contrast visual effects', () => {
    const spec = parseDeterministicInstruction('Make this image black and white high contrast', 'sample');
    assert.ok(spec.effects?.includes('grayscale'));
    assert.ok(spec.effects?.includes('contrast'));
  });

  await test('Detects sepia effect', () => {
    const spec = parseDeterministicInstruction('Apply vintage sepia tone', 'sample');
    assert.ok(spec.effects?.includes('sepia'));
  });

  await test('Detects blur effect', () => {
    const spec = parseDeterministicInstruction('Apply soft blur background', 'sample');
    assert.ok(spec.effects?.includes('blur:200'));
  });

  await test('Parses explicit format conversion to WebP', () => {
    const spec = parseDeterministicInstruction('Convert to webp format', 'sample');
    assert.strictEqual(spec.format, 'webp');
  });

  await test('Parses explicit format conversion to AVIF', () => {
    const spec = parseDeterministicInstruction('Optimize and save as avif', 'sample');
    assert.strictEqual(spec.format, 'avif');
  });

  // ==========================================
  // 3. LOW-DATA MODE OVERRIDE INVARIANT
  // ==========================================

  await test('Enforces low-data constraints when lowDataMode option is active', () => {
    const spec = parseDeterministicInstruction('Resize to 1200x800 with maximum resolution', 'sample', {
      lowDataMode: true
    });
    assert.strictEqual(spec.deliveryProfile, 'low_data');
    assert.strictEqual(spec.quality, 'auto:eco');
    assert.ok(spec.width! <= 480, `Width must be clamped to 480 or less, was ${spec.width}`);
    assert.ok(spec.height! <= 480, `Height must be clamped to 480 or less, was ${spec.height}`);
  });

  // ==========================================
  // 4. SECURITY, SANITIZATION & INVARIANTS
  // ==========================================

  await test('Rejects directory traversal in publicId ("../secret")', () => {
    assert.strictEqual(isValidPublicId('../secret'), false);
    assert.throws(() => {
      parseDeterministicInstruction('Make square', '../secret');
    }, /Invalid asset ID/);
  });

  await test('Rejects protocol URLs in publicId ("https://evil.com/pic")', () => {
    assert.strictEqual(isValidPublicId('https://evil.com/pic'), false);
    assert.throws(() => {
      parseDeterministicInstruction('Make square', 'https://evil.com/pic');
    }, /Invalid asset ID/);
  });

  await test('Sanitizes HTML/script tags from prompt', () => {
    const clean = sanitizePrompt('<script>alert("pwned")</script> Crop to square; rm -rf /');
    assert.ok(!clean.includes('<script>'));
    assert.ok(!clean.includes('alert'));
    assert.ok(!clean.includes(';'));
    assert.ok(clean.includes('Crop to square'));
  });

  await test('Request schema validates clean payload and rejects illegal input', () => {
    const valid = NaturalLanguageTransformRequestSchema.safeParse({
      prompt: 'Crop to square',
      assetId: 'diagram_cells',
      lowDataMode: true
    });
    assert.strictEqual(valid.success, true);

    const malicious = NaturalLanguageTransformRequestSchema.safeParse({
      prompt: 'Test',
      assetId: '../../traversal'
    });
    assert.strictEqual(malicious.success, false);
  });

  await test('Spec schema validates correct values and rejects invalid crops', () => {
    const valid = CloudinaryTransformationSpecSchema.safeParse({
      assetId: 'sample',
      prompt: 'Resize',
      crop: 'fill',
      width: 400,
      height: 400
    });
    assert.strictEqual(valid.success, true);

    const invalid = CloudinaryTransformationSpecSchema.safeParse({
      assetId: 'sample',
      prompt: 'Resize',
      crop: 'destroy_image' as any
    });
    assert.strictEqual(invalid.success, false);
  });

  // ==========================================
  // 5. DELIVERY URL GENERATION
  // ==========================================

  await test('Generates compliant Cloudinary delivery URL with separate /f_auto/q_auto slash segments', () => {
    const spec = parseDeterministicInstruction('Crop to a square', 'sample');
    const { url, appliedTransforms } = buildTransformationUrl(spec, 'demo');
    assert.ok(url.startsWith('https://res.cloudinary.com/demo/image/upload/'));
    assert.ok(url.endsWith('/sample'));
    assert.ok(url.includes('c_fill') && url.includes('w_400') && url.includes('h_400'));
    // CRITICAL REQUIREMENT: Separate slash-delimited segments, not comma!
    assert.ok(url.includes('/f_auto/q_auto'), 'URL must use separate slash segments /f_auto/q_auto');
    assert.ok(!url.includes('f_auto,q_auto'), 'URL must NOT emit comma-joined f_auto,q_auto');
    assert.ok(!url.includes('undefined'));
    assert.ok(!url.includes('null'));
  });

  await test('Secret safety: generated URLs never contain API keys or secrets', () => {
    const spec = parseDeterministicInstruction('Sharpen diagram', 'sample');
    const { url } = buildTransformationUrl(spec, 'test_cloud');
    const secret = process.env.CLOUDINARY_API_SECRET;
    if (secret && secret.length > 5) {
      assert.ok(!url.includes(secret), 'Delivery URL must never contain API secret!');
    }
    const key = process.env.CLOUDINARY_API_KEY;
    if (key && key.length > 5) {
      assert.ok(!url.includes(key), 'Delivery URL must not contain API key!');
    }
  });

  await test('Generates accessible alt text based on transformation spec', async () => {
    const result = await executeTransformationInstruction(
      'Sharpen textbook diagram and labels',
      'animal_cell_diagram',
      { cloudName: 'demo' }
    );
    assert.ok(result.accessibleAltText.length > 10);
    assert.strictEqual(result.spec.deliveryProfile, 'diagram_hq');
    assert.ok(result.transformedUrl.includes('e_sharpen:80'));
    assert.ok(result.transformedUrl.includes('e_contrast'));
  });

  // ==========================================
  // 6. CLOUDINARY AI OPERATIONS & CREDIT COSTS
  // ==========================================

  await test('Parses AI Auto Enhance and calculates 100 tx credit estimate', () => {
    const spec = parseDeterministicInstruction('Apply AI auto enhance to this diagram', 'sample');
    assert.strictEqual(spec.aiAction, 'auto_enhance');
    assert.strictEqual(spec.creditCostEstimate, 100);
    const { url } = buildTransformationUrl(spec, 'demo');
    assert.ok(url.includes('e_auto_enhance'));
    assert.ok(url.includes('/f_auto/q_auto'));
  });

  await test('Parses AI Background Removal and calculates 75 tx credit estimate', () => {
    const spec = parseDeterministicInstruction('Remove background from this specimen', 'sample');
    assert.strictEqual(spec.aiAction, 'background_removal');
    assert.strictEqual(spec.creditCostEstimate, 75);
    const { url } = buildTransformationUrl(spec, 'demo');
    assert.ok(url.includes('e_background_removal'));
  });

  await test('Parses Generative Fill (b_gen_fill) with 50 tx credit estimate', () => {
    const spec = parseDeterministicInstruction('Expand canvas with generative fill to 16:9', 'sample');
    assert.strictEqual(spec.aiAction, 'gen_fill');
    assert.strictEqual(spec.creditCostEstimate, 50);
    const { url } = buildTransformationUrl(spec, 'demo');
    assert.ok(url.includes('b_gen_fill'));
  });

  // ==========================================
  // 7. EDUCATIONAL SAFEGUARDS ON SCIENTIFIC ASSETS
  // ==========================================

  await test('Flags generative modification on scientific diagrams for review unless explicitly allowed', async () => {
    const result = await executeTransformationInstruction(
      'Generative fill around the human cell diagram',
      'human_cell_specimen',
      { cloudName: 'demo', isScientificDiagram: true, allowGenerativeModification: false }
    );
    assert.strictEqual(result.isEducationalSafeguarded, true);
    assert.ok(result.previewNotice, 'Must include safeguard notice warning about factual diagram modification');
    assert.ok(result.previewNotice.includes('scientific diagram'));
  });

  // ==========================================
  // 8. EDUCATIONAL VIDEO TRANSFORMATION PIPELINE
  // ==========================================

  await test('Generates educational video delivery URL with f_auto:video and vc_auto', () => {
    const spec = parseDeterministicInstruction('Preview 5 seconds of the video', 'lesson_video', {
      resourceType: 'video'
    });
    assert.strictEqual(spec.resourceType, 'video');
    assert.strictEqual(spec.duration, 5);
    const { url } = buildTransformationUrl(spec, 'demo');
    assert.ok(url.startsWith('https://res.cloudinary.com/demo/video/upload/'));
    assert.ok(url.includes('vc_auto'));
    assert.ok(url.includes('/f_auto:video/q_auto'));
  });

  await test('Parses animated WebP loop preview from video', () => {
    const spec = parseDeterministicInstruction('Create an animated webp loop from video', 'lesson_video', {
      resourceType: 'video'
    });
    assert.strictEqual(spec.deliveryProfile, 'animated_preview');
    assert.strictEqual(spec.format, 'auto:animated');
    assert.strictEqual(spec.isLoop, true);
    const { url } = buildTransformationUrl(spec, 'demo');
    assert.ok(url.includes('e_loop'));
    assert.ok(url.includes('/f_auto:animated/q_auto'));
  });

  // ==========================================
  // 9. REGRESSION & SECURITY GATE INVARIANTS
  // ==========================================

  await test('signedUploadAllowed gate grants permission only when account check succeeded', () => {
    const approved = signedUploadAllowed({ configured: true, accountReachable: true });
    assert.strictEqual(approved.allowed, true);
    assert.ok(approved.reason.includes('succeeded'));

    const unconfigured = signedUploadAllowed({ configured: false, accountReachable: false });
    assert.strictEqual(unconfigured.allowed, false);

    const unreachable = signedUploadAllowed({ configured: true, accountReachable: false });
    assert.strictEqual(unreachable.allowed, false);
    assert.ok(unreachable.reason.includes('Signed upload stays off'));
  });

  await test('Parses Generative Remove with target label extraction and 50 tx cost', () => {
    const spec = parseDeterministicInstruction('Remove the watermark from diagram', 'specimen_1');
    assert.strictEqual(spec.aiAction, 'gen_remove');
    assert.strictEqual(spec.aiPrompt, 'watermark');
    assert.strictEqual(spec.creditCostEstimate, 50);
    const { url } = buildTransformationUrl(spec, 'demo');
    assert.ok(url.includes('e_gen_remove:prompt_watermark'));
  });

  await test('Spec schema rejects invalid effect tokens with illegal characters', () => {
    const invalidEffect = CloudinaryTransformationSpecSchema.safeParse({
      assetId: 'sample',
      prompt: 'Test',
      effects: ['alert(1);<script>']
    });
    assert.strictEqual(invalidEffect.success, false);
  });

  await test('Video loop transformation uses parameterized e_loop:2 to avoid Cloudinary HTTP 400 error', () => {
    const { url } = buildTransformationUrl({
      assetId: 'samples/elephants',
      prompt: 'Silent classroom video loop',
      resourceType: 'video',
      isLoop: true,
      audio: false,
      format: 'auto:video'
    }, 'dmgfm7c9e');

    assert.ok(url.includes('/video/upload/'));
    assert.ok(url.includes('ac_none'));
    assert.ok(url.includes('vc_auto'));
    // Ensures bare 'e_loop' without count is NEVER emitted on video stream (causes Cloudinary 400 "Must specify number of loops")
    assert.strictEqual(url.includes('/e_loop/'), false);
    assert.ok(url.includes('e_loop:2'));
  });

  await test('Animated video transformation uses bare e_loop for infinite animation', () => {
    const { url } = buildTransformationUrl({
      assetId: 'samples/elephants',
      prompt: 'Animated webp clip',
      resourceType: 'video',
      isLoop: true,
      format: 'auto:animated'
    }, 'dmgfm7c9e');

    assert.ok(url.includes('/video/upload/'));
    assert.ok(url.includes('e_loop'));
    assert.ok(url.includes('f_auto:animated'));
  });

  console.log(`\n========================================`);
  console.log(`Suite Complete: ${passed} / ${total} tests passed.`);
  console.log(`========================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runTransformationSuite().catch((err) => {
  console.error('Fatal suite failure:', err);
  process.exit(1);
});

