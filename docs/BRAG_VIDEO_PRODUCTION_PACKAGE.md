# ConceptLens — Brag Video Master Production Package
## 72-Second Cinematic Showcase: "One concept. Different ways to understand it."

> **Creative Direction:** *"A lens that reveals another way to understand."*  
> **Brand Identity:** ConceptLens — *Learn anything. Your way.*  
> **Target Run Time:** 00:00 to 01:12 (72.00 Seconds / 2,160 Frames @ 30 fps)  
> **Format:** 16:9 Landscape (1920 × 1080 Full HD & 3840 × 2160 UHD Master)  
> **Color Grading:** Living Atlas Editorial (Warm Alabaster `#F7F4EF`, Deep Ink `#1C1917`, Restrained Ocean Cyan `#1D6A9F`, Botanical Teal `#0D9488`)  
> **Audio Signature:** Felt Upright Piano in D-flat Major, 82 BPM, Tactile Organic UI Transients, 3-Note Signature Chime (Db5 – Ab5 – F6)

---

## 1. Executive Summary & Creative Vision

ConceptLens is an accessibility-first educational platform designed to adapt learning materials to a student's chosen presentation preferences. Rather than presenting a generic advertisement with simulated futuristic mockups or inflated AI claims, this product showcase treats the **working software as the hero**.

The video is engineered around five essential takeaways:
1. **The Friction:** Standard textbook presentations are monolithic and fail diverse learning styles.
2. **The Agency:** ConceptLens empowers learners to choose how material is structured and presented.
3. **The Proof:** A single mathematical concept (`2x + 3 = 11`) produces meaningfully different presentations across **Standard**, **Easy Read**, and **Simple Steps**.
4. **The Interaction:** Guided practice provides deterministic rule-based feedback without revealing solutions prematurely.
5. **The Truth:** Every interaction shown is executed by verified, deterministic TypeScript and Python rule engines—not speculative marketing mockups.

---

## 2. Master Shot-by-Shot Storyboard & Cinematography Sheet

```
+---------------------------------------------------------------------------------------------------+
| TIME      | SCENE                  | VISUAL FOCUS                   | AUDIO STEM                  |
+---------------------------------------------------------------------------------------------------+
| 00:00-06s | 1. The Hook            | 2x + 3 = 11 Typographic Morph  | Deep 45Hz sub + Piano (Db)  |
| 00:06-13s | 2. The Problem         | Dense Textbook Wall Opens Up   | Unresolved Piano Arpeggio   |
| 00:13-20s | 3. Meet ConceptLens    | Living Atlas Hero Landing UI   | Warm Acoustic Bass Lift     |
| 00:20-36s | 4. Core Demonstration  | Standard -> Easy Read -> Steps | 82 BPM Clockwork Precision  |
| 00:36-47s | 5. Active Practice     | Practice Sandbox & Feedback    | Woodblock Tap + Success Bell|
| 00:47-57s | 6. Access by Choice    | Preference Transformation Grid | Layered Harmonic Voicings   |
| 00:57-65s | 7. The Mission         | UN SDGs 4 & 10 Editorial Cards | Lush Strings & Piano Apex   |
| 00:65-72s | 8. The Final Frame     | 2x + 3 = 11 -> x = 4 -> Brand  | 3-Note Signature Chime      |
+---------------------------------------------------------------------------------------------------+
```

---

### Scene 1: The Hook — "One concept. Different ways to understand it."
- **Timecode:** `00:00.00` – `00:06.00` (6.00s / Frames 0 – 180)
- **Viewport Canvas:** Deep obsidian slate (`#080B11`), static macro typography lock.
- **Visual Staging:**
  - `00:00 – 00:03.20`: Screen opens from black. A crisp editorial serif equation appears centered in pure white:
    $$\mathbf{2x + 3 = 11}$$
    Generous negative space. No clutter.
  - `00:03.20 – 00:06.00`: The characters smoothly morph using a restrained typographic transition into plain language:
    *Undo 3 first → Subtract 3 from both sides*
- **On-Screen Text (OST):**
  - `00:01.00`: "One concept." (Tracking: +0.08em, 1.25rem, `#94A3B8`)
  - `00:03.50`: "Different ways to understand it." (1.25rem, `#38BDF8`)
- **Voiceover (VO):**
  *(Quiet, confident, clear)*: *"One concept. Different ways to understand it."*
- **Sound Design:**
  - Ambient 45Hz sub-bass pulse.
  - Felt-damped upright piano strikes a solitary, resonant D-flat chord (Db2 – Ab2 – F3) with natural tape warmth.
- **Codebase Source Trace:**
  - [shared/src/learning/materials.ts](file:///d:/ConceptLens/shared/src/learning/materials.ts#L938-L994) (`solveLinearEquation`)

---

### Scene 2: The Problem — "Learning isn't one-size-fits-all."
- **Timecode:** `00:06.00` – `00:13.00` (7.00s / Frames 180 – 390)
- **Viewport Canvas:** Transition from slate into warm editorial ivory (`#F4EFEB`).
- **Visual Staging:**
  - `00:06 – 00:09.50`: A dense, crowded block of traditional textbook prose occupies the center frame. Small, tight leading, uninterrupted academic jargon. Visual feeling of cognitive friction.
  - `00:09.50 – 00:13.00`: The card layout expands smoothly. Leading relaxes from `1.3` to `1.7`. Generous white space opens up. The core equation `2x + 3 = 11` gently highlights with a clean 3px left border in ocean blue (`#1D6A9F`).
- **On-Screen Text (OST):**
  - "Learning isn't one-size-fits-all."
- **Voiceover (VO):**
  *"When educational material is locked into a single rigid format, learners get left behind."*
- **Sound Design:**
  - A subtle minor second interval on acoustic piano introduces gentle tension, resolving into open octave intervals as whitespace expands.
- **Codebase Source Trace:**
  - [client/src/index.css](file:///d:/ConceptLens/client/src/index.css#L18-L36) (`--atlas-bg: #F7F4EF`, line-height tokens)

---

### Scene 3: Meet ConceptLens — "Learning, presented your way."
- **Timecode:** `00:13.00` – `00:20.00` (7.00s / Frames 390 – 600)
- **Viewport Canvas:** Crisp Apple-style browser frame on warm alabaster (`#F7F4EF`).
- **Visual Staging:**
  - Controlled push-in (scale `1.0` to `1.08`) toward the authentic ConceptLens Landing Page.
  - Frame Left:
    - Kicker: `CONCEPTLENS`
    - Hero Headline: **"Learn anything. Your way."**
    - Subtitle: *"ConceptLens helps transform supported learning materials into explanations that match your preferred way of understanding."*
    - Button: `Start Learning →` (`#1C1917` pill with white text).
  - Frame Right:
    - Mathematics sample preview card:
      *Sample preview | Simple Steps*  
      **Solve 2x + 3 = 11.**  
      `1. Subtract 3 from both sides.`  
      `2. Divide both sides by 2.`  
      `3. Check the answer by substitution.`  
      *Understanding: x = 4*
  - `00:18.50`: Animated cursor hovers smoothly over `Start Learning →`.
- **On-Screen Text (OST):**
  - `00:14.00`: "Meet ConceptLens."
  - `00:16.50`: "Learning, presented your way."
- **Voiceover (VO):**
  *"Meet ConceptLens. An accessible learning platform built to adapt educational material to you."*
- **Sound Design:**
  - Warm acoustic bass entry (root note Db).
  - Soft, tactile physical relay click as the button hovers and depresses.
- **Codebase Source Trace:**
  - [client/src/components/home/HomeNarrative.tsx](file:///d:/ConceptLens/client/src/components/home/HomeNarrative.tsx#L105-L167)
  - [client/src/components/LandingPage.tsx](file:///d:/ConceptLens/client/src/components/LandingPage.tsx#L700-L750)

---

### Scene 4: The Core Demonstration — Standard vs Easy Read vs Simple Steps
- **Timecode:** `00:20.00` – `00:36.00` (16.00s / Frames 600 – 1080)
- **Viewport Canvas:** Clean workspace interior with mode switcher tabs.
- **Visual Staging (The Tri-Mode Shift):**
  - **Part A (00:20 – 00:25): Standard Academic Presentation**
    - Tab `[Standard]` active.
    - Workspace displays:
      *"The source writes 2x + 3 = 11. The solution is a value of x, not the equation itself. Subtract 3 from both sides to isolate the variable term, then divide both sides by 2 to solve for x."*
    - Lower callout badge: `"Same question."`
  - **Part B (00:25 – 00:30): Easy Read Mode**
    - Cursor clicks `[Easy Read]`.
    - Instant typography reflow:
      *"2x + 3 = 11 means both sides are equal. An equation says two amounts match. The letter x is a variable, which stands for a number you do not know yet. Undo the added 3 first. Subtract 3 from both sides. Then divide both sides by 2. x is 4."*
    - Lower callout badge: `"Different presentation."`
  - **Part C (00:30 – 00:36): Simple Steps Progression**
    - Cursor clicks `[Simple Steps]`.
    - Text simplifies into an isolated single stage:
      *Step 1 of 4: Subtract 3 from both sides.*  
      `2x = 8`
    - Cursor clicks `[Next step]`:
      *Step 2 of 4: Divide both sides by 2.*  
      `x = 4`
    - Lower callout badge: `"Your pace."`
- **On-Screen Text (OST):**
  - `00:21.00`: "Same question."
  - `00:26.00`: "Different presentation."
  - `00:31.00`: "Your pace."
- **Voiceover (VO):**
  *"Take a linear equation: 2x plus 3 equals 11. Move effortlessly from standard academic phrasing, to plain-language Easy Read, or step-by-step Simple Steps."*
- **Sound Design:**
  - Clockwork rhythmic pulse starts at 82 BPM.
  - Tactile wood-and-glass interface clicks on each tab switch.
- **Codebase Source Trace:**
  - [shared/src/learning/materials.ts](file:///d:/ConceptLens/shared/src/learning/materials.ts#L777-L793) (`linearPlainLanguage`)
  - [client/src/components/learn/GuidedDemo.tsx](file:///d:/ConceptLens/client/src/components/learn/GuidedDemo.tsx#L133-L210)

---

### Scene 5: Active Practice — "Understand. Try. Learn from the next step."
- **Timecode:** `00:36.00` – `00:47.00` (11.00s / Frames 1080 – 1410)
- **Viewport Canvas:** Practice Sandbox card centered in generous whitespace.
- **Visual Staging:**
  - Real question displayed:
    **"Which operation should be undone first in 2x + 3 = 11?"**
    *Hint: Undo the number that is added or subtracted before you divide.*
  - Four answer options displayed (Note: Correct answer `x = 4` is completely hidden):
    - `[A] Subtract 3`
    - `[B] Divide by 2`
    - `[C] Add 3`
    - `[D] Multiply by 2`
  - `00:41.00`: Cursor hovers and clicks `[A] Subtract 3`.
  - Button border turns botanical green (`#059669`).
  - Rule-based feedback banner emerges immediately:
    **"✓ Correct. That is the operation to undo first."**
  - Workspace displays next step highlight: *Proceed to 2x = 8.*
- **On-Screen Text (OST):**
  - `00:37.00`: "Understand."
  - `00:40.00`: "Try."
  - `00:44.00`: "Learn from the next step."
- **Voiceover (VO):**
  *"Understand. Try. And learn from verified feedback that guides your thinking without giving away the answer."*
- **Sound Design:**
  - Soft wooden percussive tap on option click.
  - Uplifting two-note harmonic bell chime (C5 – E5) confirming verified success.
- **Codebase Source Trace:**
  - [shared/src/learning/materials.ts](file:///d:/ConceptLens/shared/src/learning/materials.ts#L814-L833) (`linearPractice` undo operation)
  - [shared/src/learning/materials.ts](file:///d:/ConceptLens/shared/src/learning/materials.ts#L1641-L1684) (`gradePracticeSubmission`)

---

### Scene 6: Accessibility by Choice — "Accessibility isn't one setting."
- **Timecode:** `00:47.00` – `00:57.00` (10.00s / Frames 1410 – 1710)
- **Viewport Canvas:** Clean split-screen / modular grid layout.
- **Visual Staging:**
  - Clean cards illustrating real accessibility preferences available in the app:
    1. **Easy Read:** Plain language with short sentences.
    2. **Simple Steps:** One predictable stage visible at a time.
    3. **Low-Stimulation:** Motion halted, decorative styling calmed.
    4. **Keyboard-First:** Clear focus navigation with direct shortcut routing.
    5. **Speech-Free:** 100% written, silent interaction pathways.
    6. **Low-Vision:** Scaled text hierarchy (120%) with high contrast.
  - As each toggle lights up, the adjacent interface preview immediately adopts the setting without delay or full-page reload.
- **On-Screen Text (OST):**
  - `00:48.00`: "Accessibility isn't one setting."
  - `00:52.50`: "Choose what works for you."
- **Voiceover (VO):**
  *"Accessibility isn't a single switch. It's the freedom to choose: low-stimulation focus, speech-free silence, or high-contrast spacing."*
- **Sound Design:**
  - Sequenced organic toggles panned gently across stereo spectrum.
  - Warm electric piano chords sustain underneath.
- **Codebase Source Trace:**
  - [shared/src/learning/themes.ts](file:///d:/ConceptLens/shared/src/learning/themes.ts#L100-L200)
  - [client/src/components/home/HomeNarrative.tsx](file:///d:/ConceptLens/client/src/components/home/HomeNarrative.tsx#L19-L29)

---

### Scene 7: The Mission — "More ways to engage with learning."
- **Timecode:** `00:57.00` – `00:65.00` (8.00s / Frames 1710 – 1950)
- **Viewport Canvas:** Editorial two-card display on warm ivory.
- **Visual Staging:**
  - Understated, dignified typographic presentation:
    - **SDG 4 • Quality Education:**  
      *Support inclusive and equitable quality education through alternative explanations and manageable steps.*
    - **SDG 10 • Reduced Inequalities:**  
      *Eliminate learning barriers by providing alternative presentation preferences.*
  - Subtitle footnote:  
    *ConceptLens aligns its mission with UN SDGs 4 & 10. Independent open-source project; not endorsed by the United Nations.*
- **On-Screen Text (OST):**
  - `00:58.50`: "More ways to engage with learning."
- **Voiceover (VO):**
  *"Building toward United Nations Goals 4 and 10—because equitable education begins when everyone has a way to understand."*
- **Sound Design:**
  - Musical apex: Acoustic felt piano joined by lush, warm analog string pad.
  - Deep resonant bass swell.
- **Codebase Source Trace:**
  - [client/src/components/home/HomeNarrative.tsx](file:///d:/ConceptLens/client/src/components/home/HomeNarrative.tsx#L169-L200)

---

### Scene 8: The Final Frame — Brand Lock & Sonic Signature
- **Timecode:** `00:65.00` – `00:72.00` (7.00s / Frames 1950 – 2160)
- **Viewport Canvas:** Clean fade to deep obsidian slate (`#06090E`).
- **Visual Staging:**
  - `00:65 – 00:66.50`: The equation `2x + 3 = 11` resolves decisively to `x = 4`.
  - `00:66.50 – 00:70.00`: The characters resolve into the minimal dual-color ConceptLens monogram `[ CL ]` in teal and cyan.
  - Bold, restrained logotype fades up:
    **CONCEPTLENS**
    *"Learn anything. Your way."*
    *One concept. Different ways to understand it.*
  - Verified repository slug:  
    `github.com/LovelySharma-dev/ConceptLens`
  - `00:70.50 – 00:72.00`: Smooth, peaceful fade to true black.
- **On-Screen Text (OST):**
  - **CONCEPTLENS**
  - "Learn anything. Your way."
  - "One concept. Different ways to understand it."
  - `github.com/LovelySharma-dev/ConceptLens`
- **Voiceover (VO):**
  *"ConceptLens. Learn anything. Your way."*
- **Sound Design:**
  - **Three-Note Sonic Brand Signature:**
    1. **Db5 (554.37 Hz)** – Warm triangle wave with felt acoustic attack (00:66.00).
    2. **Ab5 (830.61 Hz)** – Pure resonant overtone (00:66.20).
    3. **F6 (1396.91 Hz)** – Crystalline sine bell with 2.8s analog reverb decay (00:66.40).
  - Clean fade to total silence at `00:71.50`.
- **Codebase Source Trace:**
  - [docs/video-demo.html](file:///d:/ConceptLens/docs/video-demo.html#L992-L998) (`playSignatureChime`)

---

## 3. Verbatim Voiceover Script & Audio Production Sheet

| Cue | Timecode | Speaker Line | Mood / Cadence |
|---|---|---|---|
| VO-01 | `00:01.00 – 00:05.50` | *"One concept. Different ways to understand it."* | Quiet, grounded, deliberate |
| VO-02 | `00:07.00 – 00:12.50` | *"When educational material is locked into a single rigid format, learners get left behind."* | Thoughtful, observant |
| VO-03 | `00:14.00 – 00:19.50` | *"Meet ConceptLens. An accessible learning platform built to adapt educational material to you."* | Warm, welcoming, confident |
| VO-04 | `00:21.00 – 00:35.50` | *"Take a linear equation: 2x plus 3 equals 11. Move effortlessly from standard academic phrasing, to plain-language Easy Read, or step-by-step Simple Steps."* | Precise, dynamic, articulated |
| VO-05 | `00:37.00 – 00:46.00` | *"Understand. Try. And learn from verified feedback that guides your thinking without giving away the answer."* | Encouraging, focused |
| VO-06 | `00:48.00 – 00:56.50` | *"Accessibility isn't a single switch. It's the freedom to choose: low-stimulation focus, speech-free silence, or high-contrast spacing."* | Empowering, inclusive |
| VO-07 | `00:58.50 – 00:64.50` | *"Building toward United Nations Goals 4 and 10—because equitable education begins when everyone has a way to understand."* | Resonant, purposeful |
| VO-08 | `00:66.50 – 00:70.00` | *"ConceptLens. Learn anything. Your way."* | Clear, definitive, memorable |

---

## 4. Master Subtitle Files

### SubRip Subtitles (`captions.srt`)
```srt
1
00:00:01,000 --> 00:00:05,500
One concept. Different ways to understand it.

2
00:00:06,500 --> 00:00:12,500
Learning isn't one-size-fits-all.
When textbooks only offer a single format, learners stall.

3
00:00:13,500 --> 00:00:19,500
Meet ConceptLens.
Learning, presented your way.

4
00:00:20,500 --> 00:00:35,500
Same question. Different presentation. Your pace.
Standard, Easy Read, and Simple Steps.

5
00:00:36,500 --> 00:00:46,500
Understand. Try. Learn from the next step.
Verified rule-based feedback.

6
00:00:47,500 --> 00:00:56,500
Accessibility isn't one setting.
Choose what works for you.

7
00:00:57,500 --> 00:01:04,500
More ways to engage with learning.
Aligned with UN Sustainable Development Goals 4 & 10.

8
00:01:05,500 --> 00:01:71,000
CONCEPTLENS — Learn anything. Your way.
github.com/LovelySharma-dev/ConceptLens
```

### WebVTT Subtitles (`captions.vtt`)
```vtt
WEBVTT - ConceptLens 72-Second Master Showcase Captions

00:00:01.000 --> 00:00:05.500 line:85%
One concept. Different ways to understand it.

00:00:06.500 --> 00:00:12.500 line:85%
Learning isn't one-size-fits-all.
When textbooks only offer a single format, learners stall.

00:00:13.500 --> 00:00:19.500 line:85%
Meet ConceptLens.
Learning, presented your way.

00:00:20.500 --> 00:00:35.500 line:85%
Same question. Different presentation. Your pace.

00:00:36.500 --> 00:00:46.500 line:85%
Understand. Try. Learn from the next step.

00:00:47.500 --> 00:00:56.500 line:85%
Accessibility isn't one setting.
Choose what works for you.

00:00:57.500 --> 00:01:04.500 line:85%
More ways to engage with learning.

00:01:05.500 --> 00:01:71.000 line:85%
CONCEPTLENS — Learn anything. Your way.
```

---

## 5. Technical Truthfulness & Architecture Traceability Matrix

Every claim, screen behavior, equation, and interface transition depicted in this video is backed by verifiable code in the repository:

| On-Screen Feature | Demonstrated Behavior | Verifiable Source File & Symbol |
|---|---|---|
| **Linear Equation Solver** | Solves $2x + 3 = 11 \rightarrow x = 4$, computes intermediate residual check $2(4) + 3 = 11$ | [`shared/src/learning/materials.ts`](file:///d:/ConceptLens/shared/src/learning/materials.ts#L938-L994) (`solveLinearEquation`) |
| **Easy Read Plain Language** | Substitutes technical jargon with short plain sentences ("An equation says two amounts match...") | [`shared/src/learning/materials.ts`](file:///d:/ConceptLens/shared/src/learning/materials.ts#L777-L793) (`linearPlainLanguage`) |
| **Simple Steps Progression** | Restricts visible steps to 1 at a time; enables previous/next/repeat navigation | [`shared/src/learning/materials.ts`](file:///d:/ConceptLens/shared/src/learning/materials.ts#L1708-L1730) (`presentMaterial`) |
| **Interactive Practice Key Separation** | Omits answer key and verified solution ($x = 4$) from practice options prior to submission | [`shared/src/learning/materials.ts`](file:///d:/ConceptLens/shared/src/learning/materials.ts#L814-L833) (`linearPractice`) |
| **Rule-Based Practice Grading** | Returns deterministic feedback: *"That is the operation to undo first."* | [`shared/src/learning/materials.ts`](file:///d:/ConceptLens/shared/src/learning/materials.ts#L1641-L1684) (`gradePracticeSubmission`) |
| **Accessible Themes Registry** | Implements Easy Read, Simple Steps, Low-Stimulation, Speech-Free, Dyslexia, and Low-Vision | [`shared/src/learning/themes.ts`](file:///d:/ConceptLens/shared/src/learning/themes.ts#L100-L200) (`LEARNING_THEMES`) |
| **Landing Page & Sample Preview** | Shows live hero section and mathematical sample card for $2x + 3 = 11$ | [`client/src/components/home/HomeNarrative.tsx`](file:///d:/ConceptLens/client/src/components/home/HomeNarrative.tsx#L105-L167) |
| **UN SDGs 4 & 10 Cards** | Editorial cards linking project goals to UN Quality Education & Reduced Inequalities | [`client/src/components/home/HomeNarrative.tsx`](file:///d:/ConceptLens/client/src/components/home/HomeNarrative.tsx#L169-L200) |

---

## 6. Screen Recording Runbook & Production Checklist

Follow this procedure to record the showcase video using OBS Studio, ScreenFlow, or browser recording:

### Pre-Flight Setup
1. **Launch Local Services:**
   - Client dev server: `npm run dev:client` (Port `5173`)
   - Express server: `npm run dev:server` (Port `5000`)
   - Verify listening sockets via terminal: `Get-NetTCPConnection -LocalPort 5173, 5000`.
2. **Display & Browser Configuration:**
   - Display resolution: Set monitor to `1920 × 1080` (or `3840 × 2160` at 100% DPI scaling).
   - Browser: Chromium or Chrome in dedicated clean profile.
   - Zoom level: Exactly `100%`.
   - Hide bookmarks bar, extensions bar, and browser notifications (`Do Not Disturb` on).
3. **Capture Options:**
   - **Option A (Interactive Showcase Player):**
     - Open [docs/video-demo.html](file:///d:/ConceptLens/docs/video-demo.html) directly in the browser.
     - Press `[C]` on the keyboard to engage **Cinema Clean Mode** (hiding all debug chrome and sidebars).
     - Press `[Space]` to trigger the automatic 72-second orchestrated playthrough with live cursor animations and Web Audio sound design.
   - **Option B (Live Application Navigation):**
     - Navigate to `http://localhost:5173`.
     - Record the actual landing page, click `Start Learning`, select `2x + 3 = 11`, switch to Easy Read, and answer the practice sandbox question.
4. **Export Settings:**
   - Codec: Apple ProRes 422 HQ (master) or H.264 High Profile @ 24,000 kbps (delivery).
   - Resolution: `1920 × 1080` @ 30.00 fps or 60.00 fps.
   - Color Space: Rec. 709, sRGB full range.
   - Audio: Stereo 48 kHz, 24-bit uncompressed PCM or AAC @ 320 kbps.
