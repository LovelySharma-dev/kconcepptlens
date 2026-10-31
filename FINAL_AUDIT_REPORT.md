# ConceptLens final audit

Date: 31 October 2026. Working tree at `d:\ConceptLens`. This record separates what was observed from what was only read in code.

A passing typecheck, test suite, or production build is not evidence that a screen works. A Lighthouse accessibility score is not a WCAG conformance claim and is not a certification.

## Browser-tested viewports

The app was opened in the Cursor browser against the Vite dev server at `http://localhost:5173` (Vite is bound to IPv6 localhost; `http://127.0.0.1:5173` did not load). The production client was then served with `vite preview` at `http://127.0.0.1:4173`.

| Viewport | How it was set | What was checked |
| :--- | :--- | :--- |
| 1920×1080 | Device emulation on the dev landing page | Header, hero, no document overflow. An apparent header clip was a screenshot crop; the Themes control was inside the viewport. |
| 1440×900 | Device emulation | Headline, one supporting paragraph, primary CTA, toolbar wrapping, no overflow. |
| 1280×900 | Device emulation during interaction | Learn, ISL panel, accessibility dialog, theme toggle. |
| 768×1024 | Device emulation | Stacked hero, hamburger, CTAs, no overflow. The help icon sat on a second toolbar row and was not clipped. |
| 390×844 | Device emulation | Themes and Guide Me visible, primary CTA visible, `scrollWidth` equal to the viewport after the toolbar was allowed to wrap. |

Reduced motion was emulated with `prefers-reduced-motion: reduce` on the dev landing page. The hero animation computed to `none`, and `matchMedia` reported reduce.

## Visual issues found and fixes made

Observed on the live landing page (`HomeView`, not the unused `LandingPage` composer):

- The hero repeated the belonging message in an eyebrow, the headline, and a second slogan. The eyebrow is now only "Science, mathematics, and computing". The single headline remains **You Belong Here. Just As You Are.** One supporting paragraph remains.
- The hero card opened on dense academic wording. It now opens on the plain-language lens.
- A trust line claimed offline use. Low-data copy says the app does not work offline, so that badge was removed. The mission section still states the real fallback: configured AI when available, deterministic local behavior for supported tasks when a service is unavailable.
- Two pathway cards pointed at the same pointer lesson. One duplicate card was removed.
- At 390px the accessibility toolbar used a single non-wrapping row and clipped Themes and Guide Me. The toolbar now wraps, and those buttons keep their labels on one line.
- The fixed Guide Me control covered the end of the page. Main content has extra bottom padding.
- Home actions for the ISL catalogue and the accessibility dialog were not passed into `HomeView`, so those buttons did not open their destinations. They are wired now.
- Theme cards used overlapping flags, so enabling one theme marked others as on, and Enable could not turn that card off. The pressed state now follows the selected theme id, and the button removes that theme.
- Public copy said the 18 themes were verified. The page now says there are 18 theme cards, and that some only record a preference or repeat another theme.
- Lighthouse, mobile, on the production preview, measured four small labels below 4.5:1 on white: `#059669` at 3.76:1, `#818cf8` at 2.98:1, and `#c084fc` at 2.64:1. Those landing labels now use `#047857` (5.48:1), `#4338ca` (7.90:1), and `#6d28d9` (7.10:1). A later accessibility scan reported no contrast failures.
- Toolbar buttons named "Low data" / "Off" and "Focus" / "Off" exposed a different accessible name, and "Guide Me" was named only "Interactive Voice & Task Guide". Visible text is now inside the accessible name. The follow-up scan scored `label-content-name-mismatch` at 1.

No cell-learning section was added back to the landing page.

## The 18 theme records

The public count of 18 is the number of theme records in `LEARNING_THEME_IDS`. It is not 18 independently verified, distinct accommodations. The landing page says that explicitly. Four records do not add a capability of their own.

| Theme | What the code does | What was checked in the browser | Status |
| :--- | :--- | :--- | :--- |
| ADHD-Friendly | Focus ruler, simplified layout, focus mode, break reminders forced off | Turned on from the landing card. Body classes and the ruler appeared. The choice persisted in `localStorage` (`conceptlens-learning-prefs`) across reload. Exit cleared the theme id but left `layout-simplified` until Reset to defaults. Exit now rebuilds preferences from the remaining themes. After reset, body class was `theme-light`. | Works, with the exit bug fixed during this audit |
| Simple Steps | Sets `simpleSteps`, which switches the lesson representation to steps | Listed in the dialog as off. Not toggled live. Effect is from the Learn workspace code. | Code-traced, not clicked |
| Easy Read | Plain-language flag and relaxed line spacing | The landing preview opens on the Easy Read lens. The theme itself was not toggled live. | Preview checked; theme toggle not clicked |
| Dyslexia-Friendly | Larger text, relaxed spacing, optional speech flag | Listed in the dialog. Not toggled live. | Code-traced, not clicked |
| Low-Stimulation | Reduced motion and simplified layout | System reduced-motion was emulated and the hero animation stopped. The theme toggle was not clicked. | Motion preference checked; theme toggle not clicked |
| Guided Learning | Stage sequence flag | Listed in the dialog. Not toggled live. | Code-traced, not clicked |
| Color-Blind-Friendly | Diagram palette flag and quiz shape markers | Quiz shapes in Learn and Practice are rendered only when this flag is on. Not toggled live. | Code-traced, not clicked |
| Low-Vision-Friendly | Large text scale | Text-scale control exists in the accessibility dialog. Not changed live. | Code-traced, not clicked |
| Blind-Friendly | Text first, keyboard-first, optional speech | Listed in the dialog. Not toggled live. | Code-traced, not clicked |
| Visual Learning | Records `visualLearning`. Diagrams already show unless Text first is on. | Description on the card says it does not add a picture. No separate diagram is created. | Preference record, not a new view |
| Deaf & Hard-of-Hearing-Friendly | Opens the ISL panel beside the lesson | ISL panel was opened from Learn with "Learn with ISL". The theme toggle itself was not clicked. | Panel checked; theme toggle not clicked |
| Speech-Free Interaction | Hides speech controls | Learn speech controls stayed idle ("Playback: Not playing") and state that audio starts only from a button. The theme was not toggled. | Speech did not autoplay; theme toggle not clicked |
| Keyboard-Friendly | Stronger focus outline. Keyboard access already exists without the theme. | Skip link, landmarks, and focus styles exist. Sequential Tab was not completed (see below). | Partial. The theme is not required for keyboard use |
| Motor-Friendly | Larger targets, and the same keyboard-first flag as Keyboard-Friendly | 44px minimum on toolbar controls. Not toggled live. Overlaps Keyboard-Friendly. | Partial, code-traced |
| Down Syndrome & Supported Learning | Combines simple steps, easy read, and encouraging feedback where a lesson has an everyday example | Listed in the dialog. Not toggled live. It repeats other themes rather than adding a separate mode. | Overlaps Simple Steps and Easy Read |
| Self-Paced Learning | Turns break reminders off. No UI reads a distinct `selfPaced` flag. | Description says rereading already works without the theme. | Preference / reminder flag only |
| Low-Data Learning | Defers larger images. Does not add offline use. | Toolbar control is present and labelled. Not toggled live. | Code-traced, not clicked |
| Multiple Ways to Learn | Records `multipleWays`. Read, steps, diagram, practice, and ISL are already in the lesson. | Description on the card says it does not add another representation. No client view reads this flag to create one. | Preference record, not a new view |

Reset to defaults was used in the accessibility dialog after the ADHD test. It cleared the stored theme list. The other 17 cards were visible and released in that dialog. They were not each activated.

## ISL playback

Counts checked by importing `client/src/data/islConceptVideos.ts`:

- 139 concept-video entries, 139 unique YouTube ids, no duplicate ids.
- Science: Class VI 48, Class VII 30, Class VIII 7 (85).
- Mathematics: Class VI 46, Class VII 8 (54). There is no Class VIII mathematics list, and the UI hides a class button when the count is 0.
- 28 dictionary-folder links, serial numbers 1–28, unique URLs.

YouTube oEmbed (HTTP, author Indian Sign Language Research and Training Centre) returned 200 for sampled science and mathematics ids, including the first and last science Class VI videos, a Class VII science video, the first and last Class VIII science videos, and the first and last mathematics videos in Class VI and Class VII. A fake id returned 400.

In the browser, on the dev Learn route:

- The panel showed Concept Videos (139) and Dictionary (28).
- The science iframe `src` was `https://www.youtube.com/embed/NOW8jZ8tUmM`. After the oEmbed check, the caption became "Balanced Diet".
- Switching to Mathematics Class VII changed the iframe to `https://www.youtube.com/embed/DxR6Ou6_wHQ` and the caption to "Integers Introduction".
- Dictionary links included the master Drive folder, All Dictionary Videos, letters A–Z, and Numbers.
- The home "Explore ISL Catalog" button opened the catalogue route. That catalogue has six curriculum entries. Most open the ISLRTC directory, not a unique video. Two entries say the video is still in development and do not offer a synthetic avatar.
- Drive folder titles checked over HTTP included the master folder ("NCERT 156 new"), the dictionary folder, letter A, and Numbers.

The player shows a note that playback depends on YouTube and the connection, and an "Open this video on YouTube" link. If oEmbed returns 401 the UI says restricted; other failures say unavailable; a network error has its own message. Those three failure panels were implemented and covered by the request logic. They were not triggered inside the page during this session. The YouTube play control inside the cross-origin iframe was not clicked, so this audit does not claim that playback itself ran. Playback is not guaranteed.

In-app list titles are still placeholders such as "Science Concept Video N" until oEmbed replaces the selected caption.

## Accessibility checks

### Automated

Lighthouse  (mobile, simulated throttling) against `http://127.0.0.1:4173/`:

| Run | Performance | Accessibility | Notes |
| :--- | ---: | ---: | :--- |
| Before the contrast and name fixes | 95 | 96 | Contrast failures on the four labels above. Three toolbar names did not contain the visible text. |
| After darker labels, before the single-line button text | 95 | 100 | Contrast items cleared. Name mismatch remained, with weight 0, so it did not lower the category score. |
| After the button text was put in one line | Accessibility only | 100 | `label-content-name-mismatch` score 1. Performance was not re-run. |

Other automated checks that passed in the 100 score run include heading order, button names, link names, `html lang`, one main landmark, document title, and viewport zoom (no `user-scalable=no`, maximum scale not below 5).

This is not WCAG conformance. Lighthouse does not operate a screen reader, does not walk every control, and does not test every theme.

### Manual, in the browser

- One `h1`, then `h2` / `h3`. Landmarks: header, `nav#main-nav`, `main#main`, footer, and named regions. Skip link to `#main`.
- Sampled buttons had accessible names. After the dialog closed, the Themes button received focus.
- `prefers-reduced-motion: reduce` stopped the hero animation.
- Speech controls on Learn did not start audio by themselves. Guide Me stayed collapsed.
- Production Practice navigation: the main text was "Practice with Your Own Material", with paste, upload, camera OCR, and speech input. The accessibility snapshot lagged and still listed Learn headings; the DOM text is the check that counts.
- Dev Learn opened from "Start Exploring". Dev ISL catalogue opened from the home pathway.

### Not verified

- Sequential keyboard-only travel. Sending Tab through the automation tool did not move real focus. A full keyboard pass was not completed by hand.
- A screen reader was not run. Windows Narrator was available on the machine and was not driven.
- Text scaling was not changed live. The dialog offers Default, Large, and Larger, and the CSS sets 112.5% and 125%.
- Contrast of every theme, dark theme, and high-contrast theme was not measured. Only the default light landing page was scanned.
- The wayfinder dialog was not opened.

Nonvisual navigation and speech guidance did not take over the keyboard or start speech during the session. That is an observation from this pass, not a proof that they never interfere.

## Tests, typecheck, and build

`npm test` was run twice after the audit edits, including once after the contrast and name fixes. Both exited 0.

| Suite | Result |
| :--- | :--- |
| Server tests | 371 / 371 |
| Phase 2 AI | 36 / 36 |
| Learning experience | 29 / 29 |
| Additional server suite | 32 / 32 |
| Experience repair | 14 / 14 |
| Scientific visualization | 15 / 15 |
| Contrast tokens | 11 / 11 |
| Voice guide | 22 / 22 |
| ISL integration | 14 / 14 |
| Pointer lie | 8 / 8 |
| Nonvisual navigation | 9 / 9 |
| Password PDF | 8 / 8 |
| Curriculum translation | 10 / 10 |
| ISL catalogue | 7 / 7 |
| Extension | 17 / 17 |
| Python | 12 / 12 |

`npm run build` (shared `tsc`, server `tsc`, client `tsc && vite build`) succeeded before the last contrast pass. Client `tsc && vite build` succeeded again after the contrast, name, and focus-exit fixes.

The first client typecheck in this session failed on an unused `ShieldAlert` import, an unused `onNavigateAbout` binding, and a theme-id type in the focus-exit fix. Those were corrected and the client build then passed. The About destination is still passed from `App`; the landing "Our Mission" link goes to `#mission` on the same page.

## Performance

No earlier Lighthouse baseline existed. The two full runs above are the before/after for the contrast fix. Performance stayed 95. Accessibility moved from 96 to 100. Transfer size was 318 KiB, then 343 KiB.

Production metrics on the simulated mobile run (second full run): first contentful paint 1.5 s, largest contentful paint 1.5 s, total blocking time 0 ms, cumulative layout shift 0, speed index 5.3 s, time to interactive 1.5 s. The unthrottled preview in the Cursor browser reported DOM content loaded at about 169 ms. That number is localhost, not a deployed network.

Largest costs on the production landing load:

- `index-*.js`, about 478 KB raw / 145 KB gzip. Lighthouse estimated about 62 KB of it unused.
- Google fonts (Source Serif, Source Sans, IBM Plex Mono), already using `preconnect` and `display=swap`.
- CSS about 79 KB raw / 16 KB gzip.
- `HomeView` is a separate chunk (about 38 KB raw / 9 KB gzip).
- One small `/api/diagrams/simulate` response (about 4 KB) for the hero card.

`three` did not appear in the home resource list. Video iframes are not on the home page. Learn, Practice, ISL, biology canvases, and the media studio are separate chunks and load with those routes.

No bundle split or font change was made. A score of 95, zero layout shift, and a 1.5 s largest contentful paint did not justify a risky split for 62 KB of unused script. The speed index (about 5.3 s) is the weak simulated-mobile number and is consistent with font and script work under throttling.

The dev server is not a performance measurement. It served about 5.2 MB of decoded module scripts because Vite does not bundle in development.

## Remaining bugs, blocked checks, and unverified claims

- Playback of the YouTube iframe was not operated. oEmbed success only shows that YouTube still publishes the metadata.
- Restricted (401) and network-failure panels were not triggered in the page.
- The six-entry curriculum catalogue is not the 139-video list. Directory links are not unique videos.
- Class VIII mathematics is absent.
- Concept-video list titles stay generic until a video is selected and oEmbed returns a title.
- Fourteen of the 18 themes were not activated in the browser. Four of the 18 do not add a distinct interface.
- Screen reader behavior, a full keyboard walk, live text scaling, and dark/high-contrast audits were not done.
- Lighthouse 100 is not WCAG conformance.
- `onNavigateAbout` is unused by the landing page because Our Mission is an in-page link. The About tab still exists in the header.
- Local preview storage was exercised during testing (focus mode and high contrast). Both were off at the end of the preview check (`highContrast: false`, `activeThemes: []`, body class `theme-light`).
