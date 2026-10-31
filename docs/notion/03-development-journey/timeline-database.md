# Timeline database (17–30 October 2026)

> Notion tip: Create a **Table** database with properties: Date, Phase, Goal, Work completed, Source files, Tools, Verification, Outcome, Known limitations, Next step, Evidence type (`Calendar note` | `Git commit` | `Doc artifact`).

---

### 2026-10-17 — Idea and planning

| Field | Content |
| :--- | :--- |
| **Goal** | Choose the problem, name the product, decide hackathon in/out of scope |
| **Work completed** | Named ConceptLens; tagline “From Your Textbook to an Experience You Can Explore.”; PRD + phase roadmap direction; cut open-ended “AI reads any textbook page”; practice questions to be labeled practice |
| **Source files** | Later materialized as `PRD.md`, `PHASES.md`, `HACKDAYS_NOTION.md` Day 17 |
| **Tools** | Planning / product writing (pre-repo calendar) |
| **Verification** | Narrative only in Hack Days log |
| **Outcome** | Scoped demo: curated lessons + one deterministic structure |
| **Known limitations** | No git commit on this date |
| **Next step** | Research learners and stack |
| **Evidence type** | Calendar note |

---

### 2026-10-18 — Research (special learning needs + stack)

| Field | Content |
| :--- | :--- |
| **Goal** | Confirm audience, gaps in static materials, services the build would call |
| **Work completed** | Mapped barriers (spatial, dynamic, deaf/HoH exclusion, unreliable AI); Cloudinary signed-upload pattern (`f_auto`, `q_auto`, sharpen, contrast, `c_limit`); stack choice React/Vite/Express/TS/Zod/Three.js/Mongo+memory/Python invariants; decided against claiming ISL video or formal WCAG audit in this build |
| **Source files** | Reflected in `README.md` problem sections; `HACKDAYS_NOTION.md` Day 18 |
| **Tools** | Cloudinary docs patterns; accessibility research notes |
| **Verification** | Documented decisions; no automated suite yet |
| **Outcome** | Honest constraints became design rules |
| **Known limitations** | No commit date; research artifacts are prose logs |
| **Next step** | Scaffold monorepo |
| **Evidence type** | Calendar note |

---

### 2026-10-19 — Project setup (calendar)

| Field | Content |
| :--- | :--- |
| **Goal** | Workspaces, contracts, local run path |
| **Work completed** | Planned `client` / `server` / `shared`; Zod schemas; fixtures including malformed cycle; `.env.example` |
| **Source files** | Landed in git on 24 Oct as initialize commit |
| **Tools** | npm workspaces, Zod, TypeScript |
| **Verification** | Later covered by shared/server builds |
| **Outcome** | Single contract package to stop client/server drift |
| **Known limitations** | Calendar day ≠ commit day |
| **Next step** | Concept engine |
| **Evidence type** | Calendar note (realized in git 24 Oct) |

---

### 2026-10-20 — Concept engine (calendar)

| Field | Content |
| :--- | :--- |
| **Goal** | Repeatable pointer changes; reject broken graphs |
| **Work completed** | Step engine insert/delete/reverse/search; Floyd cycle detection; dangling pointer checks; review gate when confidence &lt; 0.80; Python graph checks |
| **Source files** | `server/src/services/stepEngine.ts`, `validationService.ts`, `python/test_invariants.py` |
| **Tools** | TypeScript, pytest/NetworkX (python suite) |
| **Verification** | Invariant tests (suite counts evolved; see Testing page) |
| **Outcome** | Fail-closed lessons |
| **Known limitations** | Calendar day ≠ commit day |
| **Next step** | Cloudinary pipeline |
| **Evidence type** | Calendar note |

---

### 2026-10-21 — Cloudinary pipeline (calendar)

| Field | Content |
| :--- | :--- |
| **Goal** | Sign uploads server-side; build delivery URLs |
| **Work completed** | Signature route, direct proxy, status route, URL builder with sharpen/contrast/limit; comparison slider; reject bad MIME/size before Cloudinary |
| **Source files** | `server/src/config/cloudinary.ts`, `server/src/routes/uploads.ts`, `CloudinaryMediaStudio.tsx` |
| **Tools** | `cloudinary` Node SDK |
| **Verification** | Later `cloudinaryTransformation.test.ts`; 25 Oct status notes show `cloud_name mismatch` episodes |
| **Outcome** | Secret stays on server; failures visible |
| **Known limitations** | Live signed upload may be blocked until cloud name matches key |
| **Next step** | Practice + CI |
| **Evidence type** | Calendar note |

---

### 2026-10-22 — Practice, lessons, CI (calendar)

| Field | Content |
| :--- | :--- |
| **Goal** | Answer a question and see why; run tests in CI |
| **Work completed** | Practice sandbox, lesson/PYQ routes, GitHub Actions workflow |
| **Source files** | Practice components; `.github/workflows/ci.yml`; Kavita commit `5f1b292` (24 Oct) |
| **Tools** | Express, CI (Node 20, Python 3.12) |
| **Verification** | CI workflow present |
| **Outcome** | Questions labeled practice |
| **Known limitations** | Calendar vs commit |
| **Next step** | Studios |
| **Evidence type** | Calendar note + later git |

---

### 2026-10-23 — Studios (calendar)

| Field | Content |
| :--- | :--- |
| **Goal** | Subjects beyond linked lists |
| **Work completed** | Physics thin-lens + pendulum; universal diagram canvas; biology cell/heart/DNA/neuron/plant (procedural/SVG approach) |
| **Source files** | `BiologyWorkspace.tsx`, `biology/2d/*`, physics studio files |
| **Tools** | React canvas/SVG; Three.js dependency present |
| **Verification** | Scientific visualization tests exist |
| **Outcome** | Avoid brittle remote `.gltf` as sole path |
| **Known limitations** | README still mentions 3D heavily; treat shipped UI vs docs carefully |
| **Next step** | Merge |
| **Evidence type** | Calendar note |

---

### 2026-10-24 — Integration and first git history

| Field | Content |
| :--- | :--- |
| **Goal** | Put features on `main`; align fixtures |
| **Work completed** | Initialize monorepo + skills; Kavita feature set; Feat 4; Python fixture alignment; merge `feat`→`main` |
| **Source files** | Entire tree; `.agents/skills/*` first appear in initialize commit |
| **Tools** | Git, npm, pytest |
| **Verification** | Merge commit `1baefe5` |
| **Outcome** | Repository exists with Cloudinary pipeline + practice + CI |
| **Known limitations** | Prior calendar days backfilled into these commits |
| **Next step** | Submission polish |
| **Evidence type** | Git commit |

---

### 2026-10-25 — Submission day

| Field | Content |
| :--- | :--- |
| **Goal** | Understandable UI, media honesty, deploy, docs |
| **Work completed** | Idea expanded (biology, Cloudinary React delivery, preferences); finishing/deploy prep; Express serves `client/dist`; landing improvements; OCR + equation/chem solvers; Notion/README; **337/337** tests logged; Render URL published |
| **Source files** | `render.yaml`, `docs/video-demo.html`, `NOTION_DOCUMENTATION.md`, `HACKDAYS_NOTION.md` |
| **Tools** | Render, Vite production build, Cloudinary public `demo` delivery for some figures |
| **Verification** | Documented: `npm test` **337/337**; `npm run test:py` **6 passed**; build ~2.94s (submission docs). `GET /api/uploads/status` episodes recorded `cloud_name mismatch` in Notion log |
| **Outcome** | Live shell URL + submission kit |
| **Known limitations** | Signed upload not fully live; ISL video not claimed; practice ≠ official papers |
| **Next step** | Post-deadline inclusive polish |
| **Evidence type** | Git commit + Doc artifact |

---

### 2026-10-26 – 2026-10-28 — Between submission and Oct 30 PR

| Field | Content |
| :--- | :--- |
| **Goal** | *Unverified as discrete daily commits* |
| **Work completed** | No separate commit authors/dates between 25 Oct evening and 30 Oct PR series in `git log` for this documentation pass |
| **Verification** | `git log` shows gap 25 → 30 |
| **Outcome** | Treat as quiet period or uncommitted local work |
| **Known limitations** | Do not invent daily progress |
| **Evidence type** | Unverified (no commits) |

---

### 2026-10-29 — Verification report artifact

| Field | Content |
| :--- | :--- |
| **Goal** | End-to-end verification write-up |
| **Work completed** | `docs/final-verification-report.md` dated **29 October 2026** (local journeys, Cloudinary account checks, notes on production tier) |
| **Source files** | `docs/final-verification-report.md` |
| **Verification** | Document asserts local demo readiness; production-host section historically marked not yet verified in that file — **cross-check against 25 Oct Render URL docs** (sources disagree; label carefully) |
| **Outcome** | Audit-style artifact for judges |
| **Known limitations** | Some figures in the report (e.g. cloud name examples) may reflect a local account session; do not paste secrets |
| **Next step** | Oct 30 PR merge |
| **Evidence type** | Doc artifact |

---

### 2026-10-30 — Inclusive surfaces, media lab, extension (PR #3)

| Field | Content |
| :--- | :--- |
| **Goal** | Wire study surfaces; Voice Guide; contrast; ISL foundation; Cloudinary validation; extension; CI Python/extension |
| **Work completed** | Home/Learn/Practice/About; ADHD plans; Voice Guide; ISL resources; FocusRuler; Cloudinary Media Studio expansion; ConceptLens Everywhere extension; docs updates; merge `6974f3f` |
| **Source files** | See `git show --stat 6974f3f` / PR commits `432612c`…`96b52ce` |
| **Tools** | React a11y modules under `client/src/a11y/` (also present as uncommitted/worktree additions at doc time — check `git status`) |
| **Verification** | New tests: `voiceGuide`, `islIntegration`, `pointerLie`, `learningMedia`, `nonvisualNav`, etc. (re-run `npm test` for current total) |
| **Outcome** | Product narrative: prove the list; deliver media variants; guide without diagnosing |
| **Known limitations** | README 30 Oct: Focus scroll fixed in code; Render Cloudinary learning-media reported 404 / unconfigured; local Media Lab for plant-cell |
| **Next step** | Configure production Cloudinary env; formal a11y manual pass |
| **Evidence type** | Git commit |

---

## How to present this in Notion

Use a board or timeline view grouped by **Evidence type**. Color:

- Green — Git commit  
- Blue — Calendar note (planning)  
- Yellow — Doc artifact  
- Grey — Unverified / no commits  
