# ConceptLens Everywhere — Chrome Manifest V3 Extension (Pillar 5)

**Product Mission:** *"One concept. Different ways to understand it."*

ConceptLens Everywhere brings accessible reading controls, ADHD focus tools, and on-demand AI learning assistance to third-party educational websites.

---

## 1. Quick Start: Loading Unpacked in Chrome

1. **Open Extensions Management**:
   - In Google Chrome, navigate to `chrome://extensions/`
   - Enable **Developer mode** using the toggle switch in the top-right corner.
2. **Load the Extension**:
   - Click the **"Load unpacked"** button in the top-left toolbar.
   - Select the `extension/` directory from this repository:
     ```text
     d:\ConceptLens\extension
     ```
3. **Verify Installation**:
   - The extension card **"ConceptLens Everywhere"** will appear with version `1.0.0`.
   - Pin the extension icon to your browser toolbar for quick access.

---

## 2. Backend Configuration

The extension connects to the ConceptLens learning engine backend to provide AI and deterministic learning support.

1. **Start the ConceptLens Backend Server**:
   ```bash
   # From the repository root
   npm run dev:server
   # Server starts at http://localhost:5000 (API at http://localhost:5000/api)
   ```
2. **Configure Extension Endpoint (Popup)**:
   - Click the ConceptLens extension icon in your browser toolbar.
   - Under **Backend Status**, verify the **API Base URL** is set to:
     ```text
     http://localhost:5000/api
     ```
   - Click **"Test"** to confirm connectivity. The status pill will display:
     `Online — Connected: Gemini gemini-3.1-flash-lite (Free Tier)` or `Deterministic Rules Engine`.
   - *Note:* The background service worker automatically normalizes paths whether you provide `http://localhost:5000`, `http://localhost:5000/api`, or `http://localhost:5000/api/ai`.

---

## 3. Architecture & Security Isolation

```text
┌─────────────────────────────────────────────────────────────────┐
│ Host Educational Webpage (e.g., Wikipedia, Khan Academy, Docs)  │
│                                                                 │
│  ┌─────────────────────── Shadow DOM ────────────────────────┐  │
│  │ <conceptlens-everywhere-root>                             │  │
│  │   ├── Floating Accessible Toolbar                         │  │
│  │   ├── Reading Ruler Overlay (pointer-events: none)        │  │
│  │   └── Result Drawer / Modal Dialog                        │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Reversible Page Overrides: <style id="conceptlens-page-overrides"> │
│  (Font scale, line spacing, contrast, readable font)            │
└─────────────────────────────────────────────────────────────────┘
                              │  runtime.sendMessage
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ Chrome Background Service Worker (extension origin)             │
│  ├── Stores preferences in chrome.storage.sync                  │
│  ├── Handles commands: Alt+Shift+T, Alt+Shift+R                 │
│  └── Dispatches fetch() to ConceptLens API Gateway              │
│      (Bypasses host-page CSP and mixed-content restrictions)     │
└─────────────────────────────────────────────────────────────────┘
                              │  REST /api/ai/*
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ ConceptLens Server (Node.js + Express)                          │
│  ├── POST /api/ai/simplify                                      │
│  ├── POST /api/ai/summarize                                     │
│  ├── POST /api/ai/explain-term                                  │
│  ├── POST /api/ai/lesson                                        │
│  └── GET  /api/ai/status                                        │
└─────────────────────────────────────────────────────────────────┘
```

### Privacy & Minimum Permissions Design:
- **`activeTab`**: Temporary access to the current page ONLY when you explicitly invoke the extension.
- **`storage`**: Persists reading preferences locally (font size, contrast, reading ruler, backend URL).
- **`scripting`**: Injects the content script and reversible style manager upon activation.
- **NO `<all_urls>` Host Permission**: The extension never monitors, tracks, or scrapes browsing history across websites.
- **User-Triggered Processing**: Text is ONLY sent to the backend when the learner explicitly highlights a passage and clicks an action button (*Simplify*, *Summary*, *Define*, *Study This*).

---

## 4. Core Features & Controls

| Feature | Description | Shortcut / Action |
| :--- | :--- | :--- |
| **Active on Tab** | Toggles reading aids and floating toolbar on current page | Popup toggle |
| **Floating Toolbar** | Accessible draggable bar with selection actions | `Alt+Shift+T` |
| **Reading Guide Ruler** | Horizontal aperture with dimming masks to guide focus | `Alt+Shift+R` or `[` / `]` |
| **Text Scale** | Scales paragraph and article font size (100%, 115%, 130%, 150%) | Toolbar `Aa` or Popup |
| **Line Spacing** | Relaxes text line-height (1.5, 1.8, 2.1) | Popup selector |
| **High Contrast** | High-contrast dark (`#0b0f19`) or high-contrast light (`#ffffff`) | Toolbar `🌓` or Popup |
| **Readable Font** | Dyslexia-friendly sans-serif typography stack | Popup checkbox |
| **Focus Mode** | Dims distracting sidebars, ads, and navigation areas | Toolbar `🎯` or Popup |
| **Reset Styles** | Instantly removes all injected CSS and restores original page | Popup Reset button |
| **Simplify Action** | Plain-language rewriting with vocabulary definitions | Highlight text → *✨ Simplify* |
| **Summarize Action** | Essential takeaways and concise overview | Highlight text → *📝 Summary* |
| **Define Action** | Clear definition, scientific context, and everyday analogy | Highlight text → *💡 Define* |
| **Study This Action** | Generates multi-representation lesson, flashcard, and quiz | Highlight text → *🎯 Study This* |

---

## 5. Known Limitations & Edge Cases

1. **Browser-Internal Pages**: Chrome security policy blocks extensions on `chrome://`, `chrome-extension://`, and the Chrome Web Store (`chromewebstore.google.com`).
2. **Cross-Origin iframes**: Content script cannot modify cross-origin embedded frames (e.g. embedded third-party ads or widgets) due to browser same-origin policies.
3. **Canvas & WebGL Graphics**: Non-DOM educational diagrams rendered strictly on `<canvas>` elements cannot have their internal text styled by CSS font-scaling.
4. **Local Host Connectivity**: If your local server is offline, selection actions gracefully display the informative connection notice and will not hang or crash.

---

## 6. Manual Testing Checklist

Use this 10-step checklist to verify ConceptLens Everywhere on any educational site (e.g. Wikipedia article on *Mitochondrion*):

- [ ] **1. Loading Unpacked**: Extension loads in `chrome://extensions` without errors or manifest warnings.
- [ ] **2. Backend Connectivity**: Open popup, click **Test** → Status displays **Online** with model notice.
- [ ] **3. Floating Toolbar**: Click **Open Floating Toolbar** or press `Alt+Shift+T` → Toolbar appears at bottom-right.
- [ ] **4. Text Selection Detection**: Highlight a sentence → Selection chip updates to show character count.
- [ ] **5. Simplify Action**: Click **✨ Simplify** → Modal opens with loading spinner, then renders plain-language text and key terms.
- [ ] **6. Define Action**: Highlight a term like *"ATP"* and click **💡 Define** → Modal shows definition and analogy.
- [ ] **7. Reading Ruler**: Press `Alt+Shift+R` or click ruler icon → Ruler overlay dims upper and lower screen regions.
- [ ] **8. Keyboard Stepping**: Press `[` and `]` → Reading ruler steps up and down smoothly.
- [ ] **9. High Contrast**: Click contrast button in toolbar → Host page colors switch to high-contrast dark.
- [ ] **10. Reversible Reset**: In popup, click **Reset Page to Original Styles** → Host page immediately returns to original CSS.

---

## 7. Verification Evidence

Run all automated extension tests from monorepo root:
```bash
npm run test:extension
```
Expected output: **17 / 17 tests passed**.

