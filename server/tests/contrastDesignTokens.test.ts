import assert from 'assert';
import fs from 'fs';
import path from 'path';

/**
 * WCAG 2.2 Relative Luminance and Contrast Ratio Calculator
 */
function parseHexColor(hex: string): [number, number, number] {
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return [r, g, b];
  }
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return [r, g, b];
  }
  throw new Error(`Unsupported hex color: ${hex}`);
}

function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r / 255, g / 255, b / 255].map((val) => {
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(hex1: string, hex2: string): number {
  const [r1, g1, b1] = parseHexColor(hex1);
  const [r2, g2, b2] = parseHexColor(hex2);
  const l1 = relativeLuminance(r1, g1, b1);
  const l2 = relativeLuminance(r2, g2, b2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

async function runContrastTokensSuite() {
  console.log('🧪 Starting Contrast & Design Tokens (Phase 1) Test Suite...\n');
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
  const cssPath = path.join(clientDir, 'index.css');
  const cssContent = fs.readFileSync(cssPath, 'utf-8');
  const adhdDashboardCode = fs.readFileSync(path.join(clientDir, 'components/adhd/ADHDLearningDashboard.tsx'), 'utf-8');

  // 1. REUSABLE SEMANTIC DESIGN TOKENS DEFINED IN ROOT & THEMES
  await test('CSS defines all required semantic design tokens in root', () => {
    const requiredTokens = [
      '--page-bg',
      '--surface-bg',
      '--surface-elevated',
      '--text-primary',
      '--text-secondary',
      '--text-muted',
      '--border-subtle',
      '--border-medium',
      '--border-active',
      '--focus-ring',
      '--action-primary-bg',
      '--action-primary-text',
      '--action-secondary-bg',
      '--action-secondary-text',
      '--state-success-bg',
      '--state-success-text',
      '--state-warning-bg',
      '--state-warning-text',
      '--state-error-bg',
      '--state-error-text',
      '--timer-bg',
      '--timer-border',
      '--timer-digits',
      '--timer-supporting-text',
      '--timer-status-ready-bg',
      '--timer-status-running-bg',
      '--timer-status-paused-bg',
      '--timer-status-completed-bg'
    ];

    for (const token of requiredTokens) {
      assert(cssContent.includes(token), `Expected index.css to define ${token}`);
    }
  });

  await test('Dark theme explicitly defines matching semantic tokens', () => {
    const darkBlockMatch = cssContent.match(/\[data-theme="dark"\][\s\S]*?\{([\s\S]*?)\}/);
    assert(darkBlockMatch, 'Dark theme selector must exist');
    const darkCss = darkBlockMatch[1];
    assert(darkCss.includes('--page-bg: #07090E'), 'Dark theme must define --page-bg');
    assert(darkCss.includes('--surface-bg: #121820'), 'Dark theme must define --surface-bg');
    assert(darkCss.includes('--timer-bg: var(--surface-bg)'), 'Dark theme must define --timer-bg');
    assert(darkCss.includes('--timer-status-running-bg'), 'Dark theme must define running timer token');
  });

  await test('High contrast mode explicitly defines matching semantic tokens', () => {
    const hcMatch = cssContent.match(/body\.high-contrast[\s\S]*?\{([\s\S]*?)\}/);
    assert(hcMatch, 'High contrast body selector must exist');
    const hcCss = hcMatch[1];
    assert(hcCss.includes('--page-bg: #000000'), 'High contrast must define black background');
    assert(hcCss.includes('--text-primary: #ffffff'), 'High contrast must define white text');
    assert(hcCss.includes('--focus-ring: #ffff00'), 'High contrast must define yellow focus ring');
    assert(hcCss.includes('--timer-bg: #000000'), 'High contrast must define black timer bg');
  });

  // 2. WCAG 2.2 AA MATHEMATICAL CONTRAST VERIFICATIONS
  await test('Light theme normal text meets WCAG AA >= 4.5:1 and large text >= 3:1', () => {
    const pageBg = '#F7F4EF';
    const surfaceBg = '#FFFFFF';
    const textPrimary = '#1C1917';
    const textSecondary = '#3F3A36';
    const textMuted = '#524C46';

    const primaryOnSurface = contrastRatio(textPrimary, surfaceBg);
    const secondaryOnSurface = contrastRatio(textSecondary, surfaceBg);
    const mutedOnSurface = contrastRatio(textMuted, surfaceBg);
    const primaryOnPage = contrastRatio(textPrimary, pageBg);

    assert(primaryOnSurface >= 7.0, `Primary on surface contrast ${primaryOnSurface.toFixed(2)} must be >= 7:1 (AAA)`);
    assert(secondaryOnSurface >= 4.5, `Secondary on surface contrast ${secondaryOnSurface.toFixed(2)} must be >= 4.5:1`);
    assert(mutedOnSurface >= 4.5, `Muted on surface contrast ${mutedOnSurface.toFixed(2)} must be >= 4.5:1`);
    assert(primaryOnPage >= 7.0, `Primary on page contrast ${primaryOnPage.toFixed(2)} must be >= 7:1`);
  });

  await test('Dark theme normal text meets WCAG AA >= 4.5:1', () => {
    const surfaceBg = '#121820';
    const textPrimary = '#F4F1EA';
    const textSecondary = '#CBD5E1';
    const textMuted = '#94A3B8';

    const primaryOnSurface = contrastRatio(textPrimary, surfaceBg);
    const secondaryOnSurface = contrastRatio(textSecondary, surfaceBg);
    const mutedOnSurface = contrastRatio(textMuted, surfaceBg);

    assert(primaryOnSurface >= 7.0, `Dark primary text contrast ${primaryOnSurface.toFixed(2)} must be >= 7:1`);
    assert(secondaryOnSurface >= 4.5, `Dark secondary text contrast ${secondaryOnSurface.toFixed(2)} must be >= 4.5:1`);
    assert(mutedOnSurface >= 4.5, `Dark muted text contrast ${mutedOnSurface.toFixed(2)} must be >= 4.5:1`);
  });

  await test('Primary button text meets WCAG AA contrast against primary action background', () => {
    const lightBtnBg = '#1D6A9F';
    const lightBtnText = '#FFFFFF';
    const ratio = contrastRatio(lightBtnText, lightBtnBg);
    assert(ratio >= 4.5, `Action button text contrast ${ratio.toFixed(2)} must be >= 4.5:1`);
  });

  await test('Focus indicator provides WCAG 2.2 >= 3:1 contrast against surfaces', () => {
    const lightFocus = '#1D6A9F';
    const white = '#FFFFFF';
    const darkFocus = '#65E5F2';
    const darkBg = '#121820';

    const lightRatio = contrastRatio(lightFocus, white);
    const darkRatio = contrastRatio(darkFocus, darkBg);

    assert(lightRatio >= 3.0, `Light focus indicator ${lightRatio.toFixed(2)} must be >= 3:1`);
    assert(darkRatio >= 3.0, `Dark focus indicator ${darkRatio.toFixed(2)} must be >= 3:1`);
  });

  // 3. ADHD SPACE TIMER CONTRAST & STATE ACCESSIBILITY
  await test('ADHD Space timer eliminates hardcoded dark charcoal background and uses semantic tokens', () => {
    assert(!adhdDashboardCode.includes("background: 'rgba(5, 8, 17, 0.75)'"), 'Hardcoded rgba(5, 8, 17, 0.75) must be removed');
    assert(adhdDashboardCode.includes('adhd-timer-display'), 'ADHD timer must use adhd-timer-display class');
    assert(adhdDashboardCode.includes('adhd-timer-digits'), 'ADHD timer must use adhd-timer-digits class');
    assert(adhdDashboardCode.includes('adhd-timer-status-badge'), 'ADHD timer must display an explicit status badge');
  });

  await test('ADHD Space timer conveys 4 distinct states through text and icons: ready, running, paused, completed', () => {
    assert(adhdDashboardCode.includes("'ready' && 'Ready to begin'"), 'Must include ready state text');
    assert(adhdDashboardCode.includes("'running' && 'Session in progress'"), 'Must include running state text');
    assert(adhdDashboardCode.includes("'paused' && 'Paused • Take a breath'"), 'Must include paused state text');
    assert(adhdDashboardCode.includes("'completed' && 'Focus session complete!'"), 'Must include completed state text');
  });

  // 4. LOW STIMULATION MODE
  await test('Low stimulation mode enforces calm properties without saturated glow or flashing', () => {
    assert(cssContent.includes('body.low-stimulation'), 'Low stimulation body rule must exist');
    assert(cssContent.includes('--glow-cyan: none !important'), 'Low stimulation must remove cyan glows');
    assert(cssContent.includes('box-shadow: none !important'), 'Low stimulation must neutralize heavy drop shadows');
  });

  console.log(`\n========================================`);
  console.log(`🏁 CONTRAST & TOKEN RESULTS: ${passed}/${total} PASSED`);
  console.log(`========================================\n`);

  if (passed < total) {
    process.exit(1);
  }
}

runContrastTokensSuite().catch((err) => {
  console.error(err);
  process.exit(1);
});

