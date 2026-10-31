/**
 * ConceptLens Everywhere — Popup Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Elements
  const toggleActive = document.getElementById('toggle-active');
  const btnOpenToolbar = document.getElementById('btn-open-toolbar');
  const selectFontSize = document.getElementById('select-font-size');
  const selectLineSpacing = document.getElementById('select-line-spacing');
  const selectContrast = document.getElementById('select-contrast');
  const checkReadableFont = document.getElementById('check-readable-font');
  const checkReadingRuler = document.getElementById('check-reading-ruler');
  const checkFocusMode = document.getElementById('check-focus-mode');
  const btnResetStyles = document.getElementById('btn-reset-styles');

  const inputBackendUrl = document.getElementById('input-backend-url');
  const btnTestBackend = document.getElementById('btn-test-backend');
  const statusPill = document.getElementById('backend-status-pill');
  const backendDetails = document.getElementById('backend-details');

  let currentSettings = {};

  // 1. Load initial settings
  try {
    const res = await chrome.runtime.sendMessage({ type: 'GET_SETTINGS' });
    if (res?.success && res.settings) {
      currentSettings = res.settings;
      renderSettings(currentSettings);
    }
  } catch (err) {
    console.error('Failed to load settings:', err);
  }

  // 2. Render settings into UI
  function renderSettings(s) {
    toggleActive.checked = Boolean(s.enabled);
    selectFontSize.value = s.fontSize || 'default';
    selectLineSpacing.value = s.lineSpacing || 'normal';
    selectContrast.value = s.highContrast || 'none';
    checkReadableFont.checked = Boolean(s.readableFont);
    checkReadingRuler.checked = Boolean(s.rulerEnabled);
    checkFocusMode.checked = Boolean(s.focusMode);
    inputBackendUrl.value = s.backendUrl || 'http://localhost:5000/api';
  }

  // 3. Save settings handler
  async function persistSettings(updates) {
    currentSettings = { ...currentSettings, ...updates };
    await chrome.runtime.sendMessage({
      type: 'SAVE_SETTINGS',
      settings: currentSettings
    }).catch(() => {});
  }

  // Event Listeners for UI changes
  toggleActive.addEventListener('change', async (e) => {
    const enabled = e.target.checked;
    await persistSettings({ enabled });
    if (enabled) {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        await chrome.runtime.sendMessage({ type: 'ACTIVATE_ON_TAB', tabId: tab.id });
      }
    }
  });

  btnOpenToolbar.addEventListener('click', async () => {
    toggleActive.checked = true;
    await persistSettings({ enabled: true });
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      await chrome.runtime.sendMessage({ type: 'ACTIVATE_ON_TAB', tabId: tab.id });
      window.close(); // Close popup so user interacts with page toolbar
    }
  });

  selectFontSize.addEventListener('change', (e) => {
    persistSettings({ fontSize: e.target.value });
  });

  selectLineSpacing.addEventListener('change', (e) => {
    persistSettings({ lineSpacing: e.target.value });
  });

  selectContrast.addEventListener('change', (e) => {
    persistSettings({ highContrast: e.target.value });
  });

  checkReadableFont.addEventListener('change', (e) => {
    persistSettings({ readableFont: e.target.checked });
  });

  checkReadingRuler.addEventListener('change', (e) => {
    persistSettings({ rulerEnabled: e.target.checked });
  });

  checkFocusMode.addEventListener('change', (e) => {
    persistSettings({ focusMode: e.target.checked });
  });

  // Reversible Reset
  btnResetStyles.addEventListener('click', async () => {
    const reset = {
      fontSize: 'default',
      lineSpacing: 'normal',
      readableFont: false,
      highContrast: 'none',
      focusMode: false,
      rulerEnabled: false
    };
    renderSettings({ ...currentSettings, ...reset });
    await persistSettings(reset);
  });

  // Backend URL save & test
  inputBackendUrl.addEventListener('change', (e) => {
    const url = e.target.value.trim() || 'http://localhost:5000/api';
    persistSettings({ backendUrl: url });
  });

  btnTestBackend.addEventListener('click', async () => {
    await testBackendHealth();
  });

  async function testBackendHealth() {
    statusPill.className = 'status-pill status-checking';
    statusPill.textContent = 'Checking...';
    backendDetails.textContent = 'Probing ConceptLens API server...';

    try {
      const res = await chrome.runtime.sendMessage({ type: 'CHECK_BACKEND_HEALTH' });
      if (res?.success && res.data) {
        const info = res.data;
        statusPill.className = 'status-pill status-online';
        statusPill.textContent = 'Online';
        const providerName = info.provider === 'gemini' 
          ? `Gemini ${info.model || '3.1 Flash-Lite'} (Free Tier)`
          : info.provider === 'huggingface'
          ? `Hugging Face (${info.model})`
          : 'Deterministic Rules Engine';
        backendDetails.textContent = `Connected: ${providerName}`;
      } else {
        statusPill.className = 'status-pill status-offline';
        statusPill.textContent = 'Offline';
        backendDetails.textContent = 'Server not reachable. Start your backend with: npm run dev';
      }
    } catch {
      statusPill.className = 'status-pill status-offline';
      statusPill.textContent = 'Offline';
      backendDetails.textContent = 'Connection error. Check URL and server status.';
    }
  }

  // Initial backend check on popup open
  await testBackendHealth();
});

