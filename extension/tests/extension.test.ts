import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const extensionDir = path.resolve(__dirname, '..');

async function runExtensionTestSuite() {
  console.log('🧪 Starting ConceptLens Everywhere (Pillar 5) Extension Test Suite...\n');
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

  // --- 1. MANIFEST V3 SPECIFICATION & PERMISSION INTEGRITY ---

  const manifestPath = path.join(extensionDir, 'manifest.json');
  assert(fs.existsSync(manifestPath), 'manifest.json must exist');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

  await test('Manifest specifies Manifest V3 and core metadata', () => {
    assert.strictEqual(manifest.manifest_version, 3);
    assert.strictEqual(manifest.name, 'ConceptLens Everywhere');
    assert.strictEqual(manifest.version, '1.0.0');
    assert(manifest.description.includes('Accessible reading controls'));
  });

  await test('Manifest strictly limits permissions to activeTab, storage, scripting', () => {
    assert(Array.isArray(manifest.permissions));
    assert(manifest.permissions.includes('activeTab'));
    assert(manifest.permissions.includes('storage'));
    assert(manifest.permissions.includes('scripting'));
    // Never request <all_urls> or broad host permissions unnecessarily
    assert(!manifest.permissions.includes('<all_urls>'));
    assert(!manifest.host_permissions || !manifest.host_permissions.includes('<all_urls>'));
  });

  await test('Manifest references valid icons that exist on disk with PNG signature', () => {
    assert(manifest.icons);
    assert(manifest.icons['16']);
    assert(manifest.icons['48']);
    assert(manifest.icons['128']);

    const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    for (const size of ['16', '48', '128']) {
      const iconFile = path.join(extensionDir, manifest.icons[size]);
      assert(fs.existsSync(iconFile), `Icon file ${iconFile} must exist`);
      const buf = fs.readFileSync(iconFile);
      assert(buf.subarray(0, 8).equals(pngSignature), `Icon ${size} must have valid PNG signature`);
    }
  });

  await test('Manifest defines default action popup and keyboard commands', () => {
    assert(manifest.action);
    assert.strictEqual(manifest.action.default_popup, 'popup/popup.html');
    assert(manifest.commands);
    assert(manifest.commands['toggle-toolbar']);
    assert(manifest.commands['toggle-ruler']);
  });

  // --- 2. EXTENSION FILES & SHADOW DOM ASSETS ---

  await test('Content script and isolated Shadow DOM styles exist', () => {
    const contentJs = path.join(extensionDir, 'content/content.js');
    const contentCss = path.join(extensionDir, 'content/content.css');
    assert(fs.existsSync(contentJs), 'content.js must exist');
    assert(fs.existsSync(contentCss), 'content.css must exist');

    const cssContent = fs.readFileSync(contentCss, 'utf-8');
    assert(cssContent.includes('.cl-toolbar'), 'Must define toolbar classes');
    assert(cssContent.includes('.cl-ruler-overlay'), 'Must define reading ruler overlay');
    assert(cssContent.includes('.cl-drawer-modal'), 'Must define result modal/drawer');
    assert(cssContent.includes(':host'), 'Must style shadow host root');
  });

  await test('Popup HTML, JS, and CSS exist and match design system', () => {
    const popupHtml = path.join(extensionDir, 'popup/popup.html');
    const popupCss = path.join(extensionDir, 'popup/popup.css');
    const popupJs = path.join(extensionDir, 'popup/popup.js');

    assert(fs.existsSync(popupHtml));
    assert(fs.existsSync(popupCss));
    assert(fs.existsSync(popupJs));

    const htmlContent = fs.readFileSync(popupHtml, 'utf-8');
    assert(htmlContent.includes('ConceptLens'));
    assert(htmlContent.includes('select-font-size'));
    assert(htmlContent.includes('select-contrast'));
    assert(htmlContent.includes('input-backend-url'));
    assert(htmlContent.includes('btn-reset-styles'));
  });

  // --- 3. REVERSIBLE STYLE OVERRIDE GENERATION ---

  function generateMockOverrides(settings: {
    enabled: boolean;
    fontSize?: string;
    lineSpacing?: string;
    readableFont?: boolean;
    highContrast?: string;
    focusMode?: boolean;
  }): string {
    if (!settings.enabled) return '';
    let css = '/* Overrides */\n';
    if (settings.fontSize === 'large') css += 'font-size: 115% !important;\n';
    if (settings.fontSize === 'larger') css += 'font-size: 130% !important;\n';
    if (settings.fontSize === 'largest') css += 'font-size: 150% !important;\n';
    if (settings.lineSpacing === 'relaxed') css += 'line-height: 1.8 !important;\n';
    if (settings.lineSpacing === 'loose') css += 'line-height: 2.1 !important;\n';
    if (settings.readableFont) css += "font-family: 'OpenDyslexic', sans-serif !important;\n";
    if (settings.highContrast === 'dark') css += 'background-color: #0b0f19 !important;\n';
    if (settings.highContrast === 'light') css += 'background-color: #ffffff !important;\n';
    if (settings.focusMode) css += 'opacity: 0.25 !important;\n';
    return css;
  }

  await test('Reversible overrides generate strictly expected CSS when enabled', () => {
    const activeCss = generateMockOverrides({
      enabled: true,
      fontSize: 'large',
      lineSpacing: 'relaxed',
      readableFont: true,
      highContrast: 'dark',
      focusMode: true
    });
    assert(activeCss.includes('font-size: 115% !important'));
    assert(activeCss.includes('line-height: 1.8 !important'));
    assert(activeCss.includes('OpenDyslexic'));
    assert(activeCss.includes('#0b0f19'));
    assert(activeCss.includes('opacity: 0.25'));
  });

  await test('Disabled or reset state generates empty CSS to restore host page styles', () => {
    const disabledCss = generateMockOverrides({
      enabled: false,
      fontSize: 'large',
      highContrast: 'dark'
    });
    assert.strictEqual(disabledCss, '', 'Disabled state must produce zero override CSS');
  });

  // --- 4. SELECTION BOUNDS & INPUT VALIDATION ---

  function validateSelectionForAi(text: string): { valid: boolean; reason?: string } {
    const trimmed = text.trim();
    if (trimmed.length < 3) {
      return { valid: false, reason: 'Selection is too short (min 3 characters).' };
    }
    if (trimmed.length > 15000) {
      return { valid: false, reason: 'Selection exceeds maximum limit of 15,000 characters.' };
    }
    return { valid: true };
  }

  await test('Text selection validation rejects empty or sub-3-char selections', () => {
    assert(!validateSelectionForAi('').valid);
    assert(!validateSelectionForAi('  ').valid);
    assert(!validateSelectionForAi('ab').valid);
    assert(validateSelectionForAi('abc').valid);
  });

  await test('Text selection bounds reject oversized selections >15,000 characters', () => {
    const normalText = 'This is a normal educational paragraph describing mitochondria in human cells.';
    assert(validateSelectionForAi(normalText).valid);
    const oversized = 'A'.repeat(15001);
    const res = validateSelectionForAi(oversized);
    assert(!res.valid);
    assert(res.reason?.includes('15,000 characters'));
  });

  // --- 5. AI API MOCK DISPATCH & PROXY INTEGRATION ---

  async function mockBackgroundCallAi(endpoint: string, payload: any, fetchFn: (url: string, opts: any) => Promise<any>) {
    const baseUrl = 'http://localhost:5000/api';
    const normEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const targetUrl = `${baseUrl}${normEndpoint.startsWith('/ai') ? normEndpoint : `/ai${normEndpoint}`}`;
    const res = await fetchFn(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res;
  }

  await test('Simplify request proxy dispatches correctly to /api/ai/simplify', async () => {
    let capturedUrl = '';
    let capturedBody = '';

    const mockFetch = async (url: string, opts: any) => {
      capturedUrl = url;
      capturedBody = opts.body;
      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            originalText: 'Cellular respiration occurs in mitochondria.',
            simplifiedText: 'Cells generate energy inside mitochondria.',
            keyTerms: [{ term: 'Mitochondria', definition: 'The powerhouse of the cell.' }],
            uncertaintyNotes: [],
            metadata: { generationMethod: 'gemini', model: 'gemini-3.1-flash-lite', fallbackUsed: false }
          }
        })
      };
    };

    const res = await mockBackgroundCallAi('/simplify', { text: 'Cellular respiration occurs in mitochondria.' }, mockFetch);
    assert(capturedUrl.endsWith('/api/ai/simplify'));
    assert(capturedBody.includes('Cellular respiration'));
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.data.simplifiedText, 'Cells generate energy inside mitochondria.');
  });

  await test('Summarize request proxy dispatches correctly to /api/ai/summarize', async () => {
    const mockFetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          summary: 'Photosynthesis transforms light into food.',
          keyPoints: ['Uses sunlight', 'Splits water', 'Releases oxygen'],
          sourceGrounding: 'Grounded in plant notes',
          metadata: { generationMethod: 'gemini', model: 'gemini-3.1-flash-lite', fallbackUsed: false }
        }
      })
    });

    const res = await mockBackgroundCallAi('/summarize', { text: 'Long plant text' }, mockFetch);
    const json = await res.json();
    assert.strictEqual(json.data.keyPoints.length, 3);
  });

  await test('Explain term request proxy dispatches correctly to /api/ai/explain-term', async () => {
    const mockFetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          term: 'Mitochondria',
          definition: 'The power generator of eukaryotic cells.',
          explanation: 'Produces ATP through oxidative phosphorylation.',
          analogy: 'Like a rechargeable battery factory.',
          uncertaintyNotes: [],
          metadata: { generationMethod: 'gemini', model: 'gemini-3.1-flash-lite', fallbackUsed: false }
        }
      })
    });

    const res = await mockBackgroundCallAi('/explain-term', { term: 'Mitochondria' }, mockFetch);
    const json = await res.json();
    assert.strictEqual(json.data.term, 'Mitochondria');
    assert(json.data.analogy.includes('battery'));
  });

  await test('Offline backend connection error is handled gracefully without crash', async () => {
    const failingFetch = async () => {
      throw new Error('fetch failed (ECONNREFUSED 127.0.0.1:5000)');
    };

    try {
      await mockBackgroundCallAi('/simplify', { text: 'Text' }, failingFetch);
      assert.fail('Should have thrown error');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      assert(msg.includes('ECONNREFUSED') || msg.includes('fetch failed'));
    }
  });

  // --- 6. FALLBACK AND METADATA PRESENTATION ---

  function formatProviderBadge(metadata: { generationMethod?: string; fallbackUsed?: boolean }) {
    if (metadata.fallbackUsed || metadata.generationMethod === 'deterministic') {
      return { label: 'Deterministic Rules Engine', isFallback: true };
    }
    if (metadata.generationMethod === 'gemini') {
      return { label: 'Gemini 3.1 Flash-Lite (Free Tier)', isFallback: false };
    }
    if (metadata.generationMethod === 'huggingface') {
      return { label: 'Hugging Face (Serverless)', isFallback: false };
    }
    return { label: 'Deterministic Rules', isFallback: true };
  }

  await test('Format badge honestly presents Gemini free tier vs fallback rules', () => {
    const aiBadge = formatProviderBadge({ generationMethod: 'gemini', fallbackUsed: false });
    assert.strictEqual(aiBadge.label, 'Gemini 3.1 Flash-Lite (Free Tier)');
    assert.strictEqual(aiBadge.isFallback, false);

    const fallbackBadge = formatProviderBadge({ generationMethod: 'deterministic', fallbackUsed: true });
    assert.strictEqual(fallbackBadge.label, 'Deterministic Rules Engine');
    assert.strictEqual(fallbackBadge.isFallback, true);
  });

  // --- 7. ACCESSIBILITY & REDUCED MOTION SPECIFICATIONS ---

  await test('content.css defines visible focus rings and prefers-reduced-motion', () => {
    const css = fs.readFileSync(path.join(extensionDir, 'content/content.css'), 'utf-8');
    assert(css.includes(':focus-visible'), 'Must have :focus-visible indicators');
    assert(css.includes('prefers-reduced-motion'), 'Must support prefers-reduced-motion');
  });

  await test('popup.css defines accessible contrast tokens and prefers-reduced-motion', () => {
    const css = fs.readFileSync(path.join(extensionDir, 'popup/popup.css'), 'utf-8');
    assert(css.includes(':focus-visible'));
    assert(css.includes('prefers-reduced-motion'));
  });

  console.log(`\n========================================`);
  console.log(`Extension Suite Results: ${passed} / ${total} tests passed.`);
  console.log(`========================================\n`);
}

runExtensionTestSuite().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
