/**
 * ConceptLens Everywhere — Chrome Manifest V3 Service Worker
 * Product Mission: "One concept. Different ways to understand it."
 */

const DEFAULT_SETTINGS = {
  enabled: false,
  fontSize: 'default', // 'default' (100%), 'large' (115%), 'larger' (130%), 'largest' (150%)
  lineSpacing: 'normal', // 'normal' (1.5), 'relaxed' (1.8), 'loose' (2.1)
  readableFont: false,
  highContrast: 'none', // 'none', 'dark', 'light'
  focusMode: false,
  rulerEnabled: false,
  rulerHeight: 80,
  backendUrl: 'http://localhost:5000/api'
};

// Initialize default settings on install
chrome.runtime.onInstalled.addListener(async () => {
  const existing = await chrome.storage.sync.get(Object.keys(DEFAULT_SETTINGS)).catch(() => ({}));
  const merged = { ...DEFAULT_SETTINGS, ...existing };
  await chrome.storage.sync.set(merged).catch(() => {});
});

/**
 * Ensures content script is injected into the target tab
 */
async function ensureContentScriptInjected(tabId) {
  try {
    // Ping tab to check if content script is active
    const response = await chrome.tabs.sendMessage(tabId, { type: 'PING' });
    if (response?.pong) return true;
  } catch {
    // Ping failed, inject content script
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content/content.js']
    });
    return true;
  } catch (err) {
    console.warn('[ConceptLens Everywhere] Failed to inject content script:', err);
    return false;
  }
}

// Handle keyboard shortcuts (Alt+Shift+T, Alt+Shift+R)
chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || tab.url?.startsWith('chrome://') || tab.url?.startsWith('chrome-extension://')) {
    return;
  }

  const injected = await ensureContentScriptInjected(tab.id);
  if (!injected) return;

  if (command === 'toggle-toolbar') {
    await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_TOOLBAR' });
  } else if (command === 'toggle-ruler') {
    await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_RULER' });
  }
});

// Centralized message router
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  (async () => {
    switch (message.type) {
      case 'GET_SETTINGS': {
        const settings = await chrome.storage.sync.get(Object.keys(DEFAULT_SETTINGS)).catch(() => DEFAULT_SETTINGS);
        sendResponse({ success: true, settings: { ...DEFAULT_SETTINGS, ...settings } });
        break;
      }

      case 'SAVE_SETTINGS': {
        const nextSettings = message.settings || {};
        await chrome.storage.sync.set(nextSettings).catch(() => {});
        // Broadcast to current active tab if accessible
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.id) {
          await chrome.tabs.sendMessage(tab.id, { type: 'SETTINGS_UPDATED', settings: nextSettings }).catch(() => {});
        }
        sendResponse({ success: true });
        break;
      }

      case 'ACTIVATE_ON_TAB': {
        const tabId = message.tabId;
        if (!tabId) {
          sendResponse({ success: false, error: 'No tabId specified' });
          return;
        }
        const injected = await ensureContentScriptInjected(tabId);
        if (injected) {
          await chrome.tabs.sendMessage(tabId, { type: 'ACTIVATE_TOOLBAR' }).catch(() => {});
          sendResponse({ success: true });
        } else {
          sendResponse({ success: false, error: 'Cannot inject into this page' });
        }
        break;
      }

      case 'CALL_AI_API': {
        // Safe, isolated extension origin fetch to prevent host-page Mixed-Content or CSP blocking
        const { endpoint, payload, method = 'POST' } = message;
        const { backendUrl = DEFAULT_SETTINGS.backendUrl } = await chrome.storage.sync.get('backendUrl').catch(() => ({}));
        const sanitizedUrl = backendUrl.replace(/\/+$/, '');
        
        // Intelligent URL normalization: resolves cleanly whether backendUrl is http://host:5000, .../api, or .../api/ai
        const normEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        let targetUrl;
        if (sanitizedUrl.endsWith('/api/ai')) {
          targetUrl = `${sanitizedUrl}${normEndpoint.replace(/^\/ai/, '')}`;
        } else if (sanitizedUrl.endsWith('/api')) {
          targetUrl = `${sanitizedUrl}${normEndpoint.startsWith('/ai') ? normEndpoint : `/ai${normEndpoint}`}`;
        } else {
          targetUrl = `${sanitizedUrl}/api/ai${normEndpoint.replace(/^\/ai/, '')}`;
        }

        try {
          const fetchOptions = {
            method,
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(20000)
          };

          if (method !== 'GET' && method !== 'HEAD' && payload) {
            fetchOptions.body = JSON.stringify(payload);
          }

          const response = await fetch(targetUrl, fetchOptions);
          const data = await response.json().catch(() => null);

          if (!response.ok) {
            sendResponse({
              success: false,
              status: response.status,
              error: data?.error || `Server returned status ${response.status}`
            });
            return;
          }

          sendResponse({
            success: true,
            status: response.status,
            data: data?.data !== undefined ? data.data : data
          });
        } catch (err) {
          const isTimeout = err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError');
          sendResponse({
            success: false,
            error: isTimeout
              ? 'Backend request timed out after 20 seconds. Please check if your ConceptLens server is running.'
              : `Unable to connect to ConceptLens backend at ${sanitizedUrl}. Ensure your local server is running (npm run dev).`
          });
        }
        break;
      }

      case 'CHECK_BACKEND_HEALTH': {
        const { backendUrl = DEFAULT_SETTINGS.backendUrl } = await chrome.storage.sync.get('backendUrl').catch(() => ({}));
        const sanitizedUrl = backendUrl.replace(/\/+$/, '');
        const targetUrl = sanitizedUrl.endsWith('/ai')
          ? `${sanitizedUrl}/status`
          : sanitizedUrl.endsWith('/api')
          ? `${sanitizedUrl}/ai/status`
          : `${sanitizedUrl}/api/ai/status`;

        try {
          const res = await fetch(targetUrl, { signal: AbortSignal.timeout(5000) });
          const json = await res.json().catch(() => null);
          if (res.ok && json) {
            sendResponse({ success: true, data: json.data || json });
          } else {
            sendResponse({ success: false, error: `HTTP ${res.status}` });
          }
        } catch (err) {
          sendResponse({ success: false, error: err instanceof Error ? err.message : 'Connection failed' });
        }
        break;
      }

      default:
        sendResponse({ success: false, error: 'Unknown message type' });
    }
  })();

  return true; // Keep message channel open for async response
});
