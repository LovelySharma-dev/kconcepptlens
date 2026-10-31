/**
 * ConceptLens Everywhere — Content Script
 * Injected in host pages inside an isolated Shadow DOM.
 * Product Mission: "One concept. Different ways to understand it."
 */

(function () {
  // Prevent duplicate injection
  if (window.__conceptlens_everywhere_loaded) return;
  window.__conceptlens_everywhere_loaded = true;

  const OVERRIDE_STYLE_ID = 'conceptlens-page-overrides';
  let hostElement = null;
  let shadowRoot = null;
  let currentSettings = {
    enabled: true,
    fontSize: 'default',
    lineSpacing: 'normal',
    readableFont: false,
    highContrast: 'none',
    focusMode: false,
    rulerEnabled: false,
    rulerHeight: 80,
    backendUrl: 'http://localhost:5000/api'
  };

  let selectedText = '';
  let rulerY = window.innerHeight / 2;
  let isRulerTracking = true;

  // 1. REVERSIBLE PAGE STYLES MANAGER
  function applyPageOverrides(settings) {
    let styleEl = document.getElementById(OVERRIDE_STYLE_ID);
    if (!settings.enabled) {
      if (styleEl) styleEl.remove();
      return;
    }

    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = OVERRIDE_STYLE_ID;
      document.head.appendChild(styleEl);
    }

    let css = '/* ConceptLens Everywhere Reversible Overrides */\n';

    // Font Scale
    if (settings.fontSize === 'large') {
      css += `p, li, article, section, dd, dt, blockquote { font-size: 115% !important; }\n`;
    } else if (settings.fontSize === 'larger') {
      css += `p, li, article, section, dd, dt, blockquote { font-size: 130% !important; }\n`;
    } else if (settings.fontSize === 'largest') {
      css += `p, li, article, section, dd, dt, blockquote { font-size: 150% !important; }\n`;
    }

    // Line Spacing
    if (settings.lineSpacing === 'relaxed') {
      css += `p, li, article, section, dd, dt, blockquote { line-height: 1.8 !important; letter-spacing: 0.015em !important; }\n`;
    } else if (settings.lineSpacing === 'loose') {
      css += `p, li, article, section, dd, dt, blockquote { line-height: 2.1 !important; letter-spacing: 0.025em !important; }\n`;
    }

    // Readable Dyslexia-Friendly Font Stack
    if (settings.readableFont) {
      css += `body, p, li, h1, h2, h3, h4, h5, h6, article, section, span, a { font-family: 'OpenDyslexic', 'Segoe UI', -apple-system, sans-serif !important; }\n`;
    }

    // High Contrast Modes
    if (settings.highContrast === 'dark') {
      css += `
        html, body {
          background-color: #0b0f19 !important;
          color: #f8fafc !important;
        }
        p, li, span, h1, h2, h3, h4, h5, h6, dt, dd, blockquote {
          color: #f8fafc !important;
        }
        a {
          color: #facc15 !important;
          text-decoration: underline !important;
        }
      `;
    } else if (settings.highContrast === 'light') {
      css += `
        html, body {
          background-color: #ffffff !important;
          color: #000000 !important;
        }
        p, li, span, h1, h2, h3, h4, h5, h6, dt, dd, blockquote {
          color: #000000 !important;
        }
        a {
          color: #0284c7 !important;
          text-decoration: underline !important;
        }
      `;
    }

    // Focus Mode Dimming
    if (settings.focusMode) {
      css += `
        aside, nav, footer, .sidebar, [role="complementary"], [role="banner"], .ad, .ads {
          opacity: 0.25 !important;
          transition: opacity 0.2s ease !important;
        }
        aside:hover, nav:hover, footer:hover {
          opacity: 1 !important;
        }
      `;
    }

    styleEl.textContent = css;
  }

  function clearPageOverrides() {
    const styleEl = document.getElementById(OVERRIDE_STYLE_ID);
    if (styleEl) styleEl.remove();
  }

  // 2. SHADOW DOM CREATION
  function setupShadowRoot() {
    if (hostElement) return;

    hostElement = document.createElement('conceptlens-everywhere-root');
    hostElement.id = 'conceptlens-everywhere-root';
    document.documentElement.appendChild(hostElement);

    shadowRoot = hostElement.attachShadow({ mode: 'open' });

    // Link isolated Shadow DOM styles
    const styleLink = document.createElement('link');
    styleLink.rel = 'stylesheet';
    styleLink.href = chrome.runtime.getURL('content/content.css');
    shadowRoot.appendChild(styleLink);

    // Build container
    const container = document.createElement('div');
    container.id = 'cl-container';
    shadowRoot.appendChild(container);

    renderToolbar();
    renderRuler();
  }

  // 3. TOOLBAR RENDERING
  function renderToolbar() {
    if (!shadowRoot) return;
    let toolbarEl = shadowRoot.getElementById('cl-toolbar');
    if (!toolbarEl) {
      toolbarEl = document.createElement('aside');
      toolbarEl.id = 'cl-toolbar';
      toolbarEl.className = 'cl-toolbar';
      toolbarEl.setAttribute('role', 'region');
      toolbarEl.setAttribute('aria-label', 'ConceptLens Everywhere Accessible Toolbar');
      shadowRoot.getElementById('cl-container').appendChild(toolbarEl);
    }

    const hasSelection = selectedText.length >= 3;
    const truncatedLen = selectedText.length > 999 ? '999+' : selectedText.length;

    toolbarEl.innerHTML = `
      <div class="cl-brand" title="ConceptLens Everywhere (Pillar 5)">
        <img src="${chrome.runtime.getURL('icons/icon-48.png')}" alt="" class="cl-logo">
        <span class="cl-brand-name">ConceptLens</span>
      </div>

      <div class="cl-selection-chip ${hasSelection ? 'has-selection' : ''}" id="cl-selection-chip">
        <span>${hasSelection ? `${truncatedLen} chars` : 'Select text'}</span>
      </div>

      <!-- Selection-Aware AI Action Buttons -->
      <div class="cl-btn-group">
        <button type="button" class="cl-btn cl-btn-ai" id="cl-btn-simplify" ${!hasSelection ? 'disabled' : ''} title="Simplify selected passage into plain language">
          ✨ Simplify
        </button>
        <button type="button" class="cl-btn cl-btn-ai" id="cl-btn-summarize" ${!hasSelection ? 'disabled' : ''} title="Summarize essential takeaways from selected text">
          📝 Summary
        </button>
        <button type="button" class="cl-btn cl-btn-ai" id="cl-btn-explain" ${!hasSelection ? 'disabled' : ''} title="Define selected term with plain explanation & analogy">
          💡 Define
        </button>
        <button type="button" class="cl-btn cl-btn-ai" id="cl-btn-study" ${!hasSelection ? 'disabled' : ''} title="Generate structured study notes and flashcards">
          🎯 Study This
        </button>
      </div>

      <!-- Quick Accessibility Toggles -->
      <div class="cl-btn-group" style="border-left: 1px solid rgba(15, 23, 42, 0.12); padding-left: 6px;">
        <button type="button" class="cl-btn cl-btn-icon ${currentSettings.rulerEnabled ? 'cl-btn-active' : ''}" id="cl-toggle-ruler" title="Toggle Reading Ruler (Alt+Shift+R)" aria-label="Toggle Reading Ruler">
          📏
        </button>
        <button type="button" class="cl-btn cl-btn-icon ${currentSettings.focusMode ? 'cl-btn-active' : ''}" id="cl-toggle-focus" title="Toggle Focus Mode" aria-label="Toggle Focus Mode">
          🎯
        </button>
        <button type="button" class="cl-btn cl-btn-icon" id="cl-cycle-contrast" title="Cycle Contrast (None / Dark / Light)" aria-label="Cycle Contrast">
          🌓
        </button>
        <button type="button" class="cl-btn cl-btn-icon" id="cl-cycle-font" title="Cycle Font Scale" aria-label="Cycle Font Scale">
          Aa
        </button>
        <button type="button" class="cl-btn cl-btn-icon" id="cl-close-toolbar" title="Hide Toolbar & Reset Overrides" aria-label="Close Toolbar">
          ✕
        </button>
      </div>
    `;

    bindToolbarEvents();
  }

  function bindToolbarEvents() {
    if (!shadowRoot) return;

    // AI Action triggers
    const btnSimplify = shadowRoot.getElementById('cl-btn-simplify');
    const btnSummarize = shadowRoot.getElementById('cl-btn-summarize');
    const btnExplain = shadowRoot.getElementById('cl-btn-explain');
    const btnStudy = shadowRoot.getElementById('cl-btn-study');

    btnSimplify?.addEventListener('click', () => handleAiAction('simplify'));
    btnSummarize?.addEventListener('click', () => handleAiAction('summarize'));
    btnExplain?.addEventListener('click', () => handleAiAction('explain'));
    btnStudy?.addEventListener('click', () => handleAiAction('study'));

    // Accessibility toggles
    shadowRoot.getElementById('cl-toggle-ruler')?.addEventListener('click', () => {
      currentSettings.rulerEnabled = !currentSettings.rulerEnabled;
      saveCurrentSettings();
      renderRuler();
      renderToolbar();
    });

    shadowRoot.getElementById('cl-toggle-focus')?.addEventListener('click', () => {
      currentSettings.focusMode = !currentSettings.focusMode;
      saveCurrentSettings();
      applyPageOverrides(currentSettings);
      renderToolbar();
    });

    shadowRoot.getElementById('cl-cycle-contrast')?.addEventListener('click', () => {
      const modes = ['none', 'dark', 'light'];
      const nextIdx = (modes.indexOf(currentSettings.highContrast) + 1) % modes.length;
      currentSettings.highContrast = modes[nextIdx];
      saveCurrentSettings();
      applyPageOverrides(currentSettings);
      renderToolbar();
    });

    shadowRoot.getElementById('cl-cycle-font')?.addEventListener('click', () => {
      const sizes = ['default', 'large', 'larger', 'largest'];
      const nextIdx = (sizes.indexOf(currentSettings.fontSize) + 1) % sizes.length;
      currentSettings.fontSize = sizes[nextIdx];
      saveCurrentSettings();
      applyPageOverrides(currentSettings);
      renderToolbar();
    });

    shadowRoot.getElementById('cl-close-toolbar')?.addEventListener('click', () => {
      currentSettings.enabled = false;
      saveCurrentSettings();
      clearPageOverrides();
      const toolbar = shadowRoot.getElementById('cl-toolbar');
      if (toolbar) toolbar.classList.add('cl-hidden');
      const ruler = shadowRoot.getElementById('cl-ruler-overlay');
      if (ruler) ruler.style.display = 'none';
    });
  }

  // 4. READING RULER RENDERING
  function renderRuler() {
    if (!shadowRoot) return;
    let rulerEl = shadowRoot.getElementById('cl-ruler-overlay');

    if (!currentSettings.rulerEnabled) {
      if (rulerEl) rulerEl.style.display = 'none';
      return;
    }

    if (!rulerEl) {
      rulerEl = document.createElement('div');
      rulerEl.id = 'cl-ruler-overlay';
      rulerEl.className = 'cl-ruler-overlay';
      shadowRoot.getElementById('cl-container').appendChild(rulerEl);
    }

    rulerEl.style.display = 'block';

    const height = currentSettings.rulerHeight || 80;
    const topHeight = Math.max(0, rulerY - height / 2);
    const bottomTop = Math.min(window.innerHeight, rulerY + height / 2);

    rulerEl.innerHTML = `
      <div class="cl-ruler-mask" style="top: 0; height: ${topHeight}px;"></div>
      <div class="cl-ruler-aperture" style="top: ${topHeight}px; height: ${height}px;"></div>
      <div class="cl-ruler-mask" style="top: ${bottomTop}px; bottom: 0;"></div>
    `;
  }

  // Handle pointer tracking for ruler
  window.addEventListener('pointermove', (e) => {
    if (!currentSettings.rulerEnabled || !isRulerTracking) return;
    rulerY = e.clientY;
    renderRuler();
  }, { passive: true });

  // Handle keyboard ruler adjustment: '[' moves up, ']' moves down
  window.addEventListener('keydown', (e) => {
    if (!currentSettings.rulerEnabled) return;
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;

    if (e.key === '[' || (e.altKey && e.key === 'ArrowUp')) {
      e.preventDefault();
      isRulerTracking = false;
      rulerY = Math.max(40, rulerY - 30);
      renderRuler();
    } else if (e.key === ']' || (e.altKey && e.key === 'ArrowDown')) {
      e.preventDefault();
      isRulerTracking = false;
      rulerY = Math.min(window.innerHeight - 40, rulerY + 30);
      renderRuler();
    }
  });

  // 5. SELECTION DETECTION
  function updateSelection() {
    const sel = window.getSelection()?.toString().trim() || '';
    if (sel !== selectedText) {
      selectedText = sel;
      renderToolbar();
    }
  }

  document.addEventListener('selectionchange', updateSelection);
  document.addEventListener('mouseup', updateSelection);
  document.addEventListener('keyup', updateSelection);

  // 6. AI ACTIONS DISPATCHER
  async function handleAiAction(actionType) {
    if (!selectedText || selectedText.length < 3) return;

    // Enforce reasonable bounds to protect server & browser
    if (selectedText.length > 15000) {
      showResultDrawer('Selection Exceeds Limit', 'Selected text must be under 15,000 characters for optimal processing.', {
        error: 'Text selection is too long. Please highlight a smaller paragraph or section.'
      });
      return;
    }

    const titles = {
      simplify: 'Simplified Plain-Language Version',
      summarize: 'Essential Summary & Key Points',
      explain: 'Concept Definition & Analogy',
      study: 'Structured Study Lesson & Quiz'
    };

    showResultDrawer(titles[actionType], selectedText, { loading: true });

    let endpoint = '/simplify';
    let payload = { text: selectedText };

    if (actionType === 'simplify') {
      endpoint = '/simplify';
      payload = { text: selectedText, targetLevel: 'plain_language' };
    } else if (actionType === 'summarize') {
      endpoint = '/summarize';
      payload = { text: selectedText, maxLengthWords: 120 };
    } else if (actionType === 'explain') {
      endpoint = '/explain-term';
      payload = { term: selectedText.slice(0, 100), context: selectedText };
    } else if (actionType === 'study') {
      endpoint = '/lesson';
      payload = { text: selectedText, difficulty: 'intermediate' };
    }

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'CALL_AI_API',
        endpoint,
        payload
      });

      if (!response?.success) {
        showResultDrawer(titles[actionType], selectedText, {
          error: response?.error || 'Unable to complete AI request.'
        });
        return;
      }

      showResultDrawer(titles[actionType], selectedText, {
        actionType,
        result: response.data
      });
    } catch (err) {
      showResultDrawer(titles[actionType], selectedText, {
        error: err instanceof Error ? err.message : 'Network communication failed.'
      });
    }
  }

  // 7. RESULT DRAWER MODAL (INSIDE SHADOW DOM)
  function showResultDrawer(title, snippet, state) {
    if (!shadowRoot) return;
    let backdrop = shadowRoot.getElementById('cl-drawer-backdrop');

    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'cl-drawer-backdrop';
      backdrop.className = 'cl-drawer-backdrop';
      shadowRoot.getElementById('cl-container').appendChild(backdrop);
    }

    backdrop.style.display = 'flex';

    let contentHtml = '';
    let badgeHtml = '<span class="cl-badge-provider">Free Tier</span>';

    if (state.loading) {
      contentHtml = `
        <div style="text-align: center; padding: 24px 0;">
          <div class="cl-spinner" aria-label="Processing request..."></div>
          <p style="color: #64748b; font-size: 13px;">Analyzing selection with ConceptLens learning engine...</p>
        </div>
      `;
    } else if (state.error) {
      contentHtml = `
        <div class="cl-result-section" style="border-left: 3px solid #e11d48;">
          <h4>⚠️ Request Notice</h4>
          <p>${state.error}</p>
        </div>
      `;
    } else if (state.result) {
      const data = state.result;
      const metadata = data.generationMetadata || data.metadata || {};
      const isFallback = Boolean(metadata.fallbackUsed);
      const method = metadata.generationMethod || (isFallback ? 'deterministic' : 'gemini');

      badgeHtml = `
        <span class="cl-badge-provider ${isFallback ? 'cl-badge-deterministic' : ''}">
          ${method === 'gemini' ? 'AI: Gemini (Free Tier)' : method === 'huggingface' ? 'AI: Hugging Face' : 'Deterministic Rules'}
        </span>
      `;

      if (state.actionType === 'simplify') {
        contentHtml = `
          <div class="cl-result-section">
            <h4>📖 Plain-Language Version</h4>
            <p>${data.simplifiedText || 'No text extracted'}</p>
          </div>
          ${data.keyTerms?.length ? `
            <div class="cl-result-section">
              <h4>🔑 Key Terms</h4>
              <ul class="cl-terms-list">
                ${data.keyTerms.map(t => `<li><strong>${t.term}:</strong> ${t.definition}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        `;
      } else if (state.actionType === 'summarize') {
        contentHtml = `
          <div class="cl-result-section">
            <h4>📝 Overview</h4>
            <p>${data.summary || 'Summary unavailable'}</p>
          </div>
          ${data.keyPoints?.length ? `
            <div class="cl-result-section">
              <h4>🎯 Key Takeaways</h4>
              <ul class="cl-terms-list">
                ${data.keyPoints.map(p => `<li>• ${p}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        `;
      } else if (state.actionType === 'explain') {
        contentHtml = `
          <div class="cl-result-section">
            <h4>💡 Definition</h4>
            <p>${data.definition || 'Definition unavailable'}</p>
          </div>
          <div class="cl-result-section">
            <h4>🔬 Detailed Explanation</h4>
            <p>${data.explanation || ''}</p>
          </div>
          ${data.analogy ? `
            <div class="cl-result-section">
              <h4>🌱 Everyday Analogy</h4>
              <p>${data.analogy}</p>
            </div>
          ` : ''}
        `;
      } else if (state.actionType === 'study') {
        const lesson = data;
        contentHtml = `
          <div class="cl-result-section">
            <h4>📚 ${lesson.topic || 'Concept Study'}</h4>
            <p>${lesson.summary || ''}</p>
          </div>
          <div class="cl-result-section">
            <h4>🟢 Easy Read Representation</h4>
            <p>${lesson.explanations?.easyRead || lesson.explanations?.standard || ''}</p>
          </div>
          ${lesson.flashcards?.length ? `
            <div class="cl-result-section">
              <h4>🎴 Recall Flashcard</h4>
              <p><strong>Q:</strong> ${lesson.flashcards[0].front}</p>
              <p style="margin-top: 4px; color: #0284c7;"><strong>A:</strong> ${lesson.flashcards[0].back}</p>
            </div>
          ` : ''}
        `;
      }

      if (isFallback && metadata.fallbackReason) {
        contentHtml += `
          <p style="font-size: 11px; color: #b45309; background: #fef3c7; padding: 6px 10px; border-radius: 6px;">
            ℹ️ ${metadata.fallbackReason}
          </p>
        `;
      }
    }

    backdrop.innerHTML = `
      <div class="cl-drawer-modal" role="dialog" aria-modal="true" aria-labelledby="cl-modal-title">
        <header class="cl-drawer-header">
          <div class="cl-drawer-title-group">
            <h3 id="cl-modal-title" class="cl-drawer-title">${title}</h3>
            ${badgeHtml}
          </div>
          <button type="button" class="cl-btn cl-btn-icon" id="cl-close-drawer" aria-label="Close dialog">✕</button>
        </header>

        <div class="cl-drawer-body">
          <div class="cl-snippet-quote" title="Original Selected Snippet">
            "${snippet.slice(0, 300)}${snippet.length > 300 ? '...' : ''}"
          </div>
          ${contentHtml}
        </div>

        <footer class="cl-drawer-footer">
          <div class="cl-privacy-pill">
            🔒 Only selected text was sent to your ConceptLens server
          </div>
          <button type="button" class="cl-btn cl-btn-ai" id="cl-done-drawer">Done</button>
        </footer>
      </div>
    `;

    const closeHandler = () => {
      backdrop.style.display = 'none';
      backdrop.innerHTML = '';
    };

    shadowRoot.getElementById('cl-close-drawer')?.addEventListener('click', closeHandler);
    shadowRoot.getElementById('cl-done-drawer')?.addEventListener('click', closeHandler);

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeHandler();
    });
  }

  // 8. STORAGE & SETTINGS PERSISTENCE
  async function saveCurrentSettings() {
    await chrome.runtime.sendMessage({
      type: 'SAVE_SETTINGS',
      settings: currentSettings
    }).catch(() => {});
  }

  async function loadSettings() {
    try {
      const res = await chrome.runtime.sendMessage({ type: 'GET_SETTINGS' });
      if (res?.success && res.settings) {
        currentSettings = { ...currentSettings, ...res.settings };
        if (currentSettings.enabled) {
          setupShadowRoot();
          applyPageOverrides(currentSettings);
          renderToolbar();
          renderRuler();
        }
      }
    } catch {
      // In standalone tests or disconnected contexts, gracefully retain defaults
    }
  }

  // 9. BACKGROUND MESSAGE HANDLER
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    switch (message.type) {
      case 'PING':
        sendResponse({ pong: true });
        break;

      case 'ACTIVATE_TOOLBAR':
        currentSettings.enabled = true;
        setupShadowRoot();
        applyPageOverrides(currentSettings);
        renderToolbar();
        const tb = shadowRoot?.getElementById('cl-toolbar');
        if (tb) tb.classList.remove('cl-hidden');
        sendResponse({ success: true });
        break;

      case 'TOGGLE_TOOLBAR':
        setupShadowRoot();
        const toolbar = shadowRoot.getElementById('cl-toolbar');
        if (toolbar) {
          const isHidden = toolbar.classList.toggle('cl-hidden');
          currentSettings.enabled = !isHidden;
          if (isHidden) {
            clearPageOverrides();
          } else {
            applyPageOverrides(currentSettings);
          }
          saveCurrentSettings();
        }
        sendResponse({ success: true });
        break;

      case 'TOGGLE_RULER':
        setupShadowRoot();
        currentSettings.rulerEnabled = !currentSettings.rulerEnabled;
        saveCurrentSettings();
        renderRuler();
        renderToolbar();
        sendResponse({ success: true, rulerEnabled: currentSettings.rulerEnabled });
        break;

      case 'SETTINGS_UPDATED':
        currentSettings = { ...currentSettings, ...(message.settings || {}) };
        if (currentSettings.enabled) {
          setupShadowRoot();
          applyPageOverrides(currentSettings);
          renderToolbar();
          renderRuler();
        } else {
          clearPageOverrides();
          if (shadowRoot) {
            const tb = shadowRoot.getElementById('cl-toolbar');
            if (tb) tb.classList.add('cl-hidden');
            const ruler = shadowRoot.getElementById('cl-ruler-overlay');
            if (ruler) ruler.style.display = 'none';
          }
        }
        sendResponse({ success: true });
        break;

      default:
        sendResponse({ success: false, error: 'Unknown message' });
    }
    return true;
  });

  // Initial load
  loadSettings();
})();

