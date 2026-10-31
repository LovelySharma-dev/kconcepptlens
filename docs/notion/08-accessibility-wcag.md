# 8. Accessibility and WCAG 2.2

> Callout (Warning): **No formal WCAG audit** has been performed (`README.md`). **No conformance level is claimed.**  
> This page is an **internal evidence register**: automated token/static tests + implementation notes + known gaps.

## How to read the table

| Result | Meaning |
| :--- | :--- |
| Pass (auto) | Automated suite asserts related behavior |
| Pass (impl) | Code implements control; limited or no dedicated automated proof |
| Partial | Implemented with known mismatches or incomplete wiring |
| Fail / Gap | Known defect or missing |
| Unverified | Not adequately tested for this doc |

Separate **automated** from **manual**. Manual screen-reader passes are largely **Unverified** unless noted.

---

## Criterion register (selected WCAG 2.2)

| Criterion | Level | Implementation | Test procedure | Result | Evidence | Limitations / follow-up |
| :--- | :---: | :--- | :--- | :--- | :--- | :--- |
| **1.4.3 Contrast (Minimum)** | AA | Semantic tokens light/dark/high-contrast | `contrastDesignTokens.test.ts` luminance math | Pass (auto) on sampled token pairs | Asserts ≥4.5:1 (and often ≥7:1 primary) | Not a full page audit of every component |
| **1.4.11 Non-text Contrast** | AA | `--focus-ring` vs surfaces; diagram strokes | Same suite focus + diagram token checks | Pass (auto) sampled | Focus ≥3:1 asserted | Full UI chrome unverified |
| **1.4.12 Text Spacing** | AA | Dyslexia-friendly / Easy Read themes | Manual + CSS theme rules | Partial | README typography claims (Verdana-scale, line-height) | No automated spacing suite |
| **2.1.1 Keyboard** | A | Global `0–6`, `H`, `T`, `G`, `?`; lesson keys scoped; ISL panel keys | Code review + `voiceGuide` / `nonvisualNav` / `islIntegration` static tests | Pass (impl) + Pass (auto) for presence | `App.tsx`, `KeyboardShortcutsModal.tsx` | PgUp/PgDn listed for ruler in modal but ruler moves on `[`/`]` — **docs mismatch** |
| **2.1.2 No Keyboard Trap** | A | Dialog Tab wrap; VoiceGuide trap with Esc | Code review | Partial | `LearningLens`, `VoiceGuide`, Home way-finder | Full trap audit Unverified |
| **2.2.2 Pause, Stop, Hide** | A | Reduced motion; VoiceGuide pause; speech stop | CSS `@media (prefers-reduced-motion)`; speech bus | Pass (impl) | `index.css`, `speechBus.ts` | Motion inventory incomplete |
| **2.4.3 Focus Order** | A | Natural DOM + dialogs | Manual | Unverified | — | Needs structured keyboard tour log |
| **2.4.7 Focus Visible** | AA | `:focus-visible`, high-contrast yellow, keyboard-first dataset | CSS + contrast tests | Pass (impl) / Pass (auto) for ring contrast | `index.css`, contrast suite | — |
| **2.4.11 Focus Not Obscured (Minimum)** (2.2) | AA | Focus mode ruler redesign — shades beside aperture, not full-viewport shadow blocking scroll | `experienceRepair.test.ts`; README 30 Oct | Pass (auto) for shadow/scroll rules | `FocusRuler.tsx` | Broader sticky-header obscuring Unverified |
| **2.5.5 Target Size (Enhanced)** / **2.5.8 Target Size (Minimum)** | AAA/AA | `body.motor-friendly` min **48×48px** | Theme flag tests; CSS present | Partial | `learningExperience.test.ts` checks flags, **not pixel measurement** | Need axe/manual hit testing |
| **3.2.3 Consistent Navigation** | AA | Persistent Guide Me + numbered tabs | Visual | Pass (impl) | `App.tsx`, VoiceGuide launcher | — |
| **3.3.1 Error Identification** | A | Upload/status errors; cycle Stopped label not color-only | Code + pointer lesson | Pass (impl) | Pointer Lie CYCLE text + status | Full form corpus Unverified |
| **4.1.2 Name, Role, Value** | A | `describeFocus`, landmarks | `nonvisualNav.test.ts` | Pass (auto) static | `describeFocus.ts` | Live SR verification Unverified |
| **4.1.3 Status Messages** | AA | `LiveAnnouncer` polite region | Component exists; wired with `message` | Partial | Assertive region **implemented but unused** from `App.tsx` | Wire assertive for critical alerts |

---

## Feature coverage (product)

| Feature | Notes |
| :--- | :--- |
| 18 learning themes | Combinable; choice not diagnosis |
| Focus ruler | Scroll preserved after 30 Oct repair |
| High contrast `[H]` | Token + body class |
| Voice Guide `[G]` | Tour / task / read / navigate; visible text fallback |
| Speech controls | Browser `speechSynthesis` — OS-dependent |
| ISL | Foundation only; **0** hosted verified videos in catalog tests |
| Color-blind quiz markers | Geometric shapes (README) |
| Reduced motion | Pointer lesson steps one-at-a-time when reduced |
| Extension | Dyslexia fonts / focus assist on other sites |

---

## Automated vs manual

| Kind | What exists |
| :--- | :--- |
| Automated | Contrast tokens; VoiceGuide structure; ISL honesty; nonvisual nav helpers; experience repair (focus scroll) |
| Manual (documented) | Keyboard flows mentioned in Hack Days notes; responsive checks in verification report |
| Missing | Full WCAG 2.2 AAA audit; consistent NVDA/VoiceOver script; formal VPAT |

---

## Follow-up backlog

1. Fix KeyboardShortcutsModal PgUp/PgDn vs FocusRuler `[`/`]` documentation.  
2. Wire assertive live announcements for cycle stop / upload failure.  
3. Manual SR pass on Pointer Lie, Practice confirm, Media Studio slider.  
4. Pixel-measure motor-friendly targets.  
5. Remove aspirational “WCAG 2.2 AAA” comments from UI copy if they read as certification.
