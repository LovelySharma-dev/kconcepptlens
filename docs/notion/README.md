# ConceptLens Notion Workspace — Import Kit

**Parent page title:** ConceptLens — Building a More Inclusive Way to Learn  
**Coverage window:** 17 October 2026 – 30 October 2026  
**Generated from:** repository evidence on 30 October 2026  
**Notion API:** not connected in this Cursor session — paste or import these Markdown files manually.

---

## How to import into Notion

1. Create a new page titled **ConceptLens — Building a More Inclusive Way to Learn**.
2. Paste [`00-parent-homepage.md`](./00-parent-homepage.md) as the body.
3. Create child pages in the order listed under **Hierarchy**, pasting each matching file.
4. For the timeline: create a Notion **database** (table) from [`03-development-journey/timeline-database.md`](./03-development-journey/timeline-database.md) — one row per milestone.
5. For features / tests: create gallery or table views from the feature and evidence tables in sections 04 and 11.
6. Turn `> Callout:` blocks into Notion callouts (Info / Warning / Success).
7. Embed [`docs/video-demo.html`](../video-demo.html) or link the live demo; do not upload secrets.

**Do not paste** `.env`, API keys, or signed upload tokens into Notion.

---

## Hierarchy (15 top-level children)

| # | Notion page | Source file |
| :---: | :--- | :--- |
| — | **Parent homepage** | [`00-parent-homepage.md`](./00-parent-homepage.md) |
| 1 | Start Here | [`01-start-here.md`](./01-start-here.md) |
| 2 | Vision and Problem Statement | [`02-vision-and-problem.md`](./02-vision-and-problem.md) |
| 3 | Development Journey: 17–30 October 2026 | [`03-development-journey/index.md`](./03-development-journey/index.md) |
| 3a | Timeline database (nested) | [`03-development-journey/timeline-database.md`](./03-development-journey/timeline-database.md) |
| 4 | Product Features and User Journeys | [`04-product-features/index.md`](./04-product-features/index.md) |
| 5 | Cloudinary Integration Deep Dive | [`05-cloudinary-deep-dive.md`](./05-cloudinary-deep-dive.md) |
| 6 | React Starter Kit and Skills Pack | [`06-react-starter-kit-skills.md`](./06-react-starter-kit-skills.md) |
| 7 | Architecture and Technology Decisions | [`07-architecture.md`](./07-architecture.md) |
| 8 | Accessibility and WCAG 2.2 | [`08-accessibility-wcag.md`](./08-accessibility-wcag.md) |
| 9 | OCR, PDF Processing and Learning Workflows | [`09-ocr-pdf-workflows.md`](./09-ocr-pdf-workflows.md) |
| 10 | AI-Assisted Development and Prompt Experiments | [`10-ai-assisted-development.md`](./10-ai-assisted-development.md) |
| 11 | Testing, Verification and Known Issues | [`11-testing/index.md`](./11-testing/index.md) |
| 12 | Deployment and Environment Configuration | [`12-deployment.md`](./12-deployment.md) |
| 13 | Demo Video and Walkthrough | [`13-demo-video.md`](./13-demo-video.md) |
| 14 | Roadmap and Remaining Work | [`14-roadmap.md`](./14-roadmap.md) |
| 15 | References, Licences and Credits | [`15-references.md`](./15-references.md) |

Related repo docs (link from Notion, do not duplicate wholesale): [`README.md`](../../README.md), [`PRD.md`](../../PRD.md), [`HACKDAYS_NOTION.md`](../../HACKDAYS_NOTION.md), [`finale.md`](../../finale.md).

---

## Evidence rules used in this kit

| Rule | Practice |
| :--- | :--- |
| Git vs calendar | First recorded commit is **24 Oct 2026**. Days **17–23** are a **working calendar** from `HACKDAYS_NOTION.md`, not separate commit dates. |
| Starter kit | `create-cloudinary-react` CLI was **not** used to scaffold the app. Same client SDK packages appear in `client/package.json`. |
| Secrets | Never publish `CLOUDINARY_API_SECRET`, `GEMINI_API_KEY`, or `HF_TOKEN`. |
| WCAG | No formal audit. Criterion tables use Implemented / Partial / Unverified. |
| Local vs production | Render URL exists; Cloudinary learning-media on Render was reported **unconfigured** in README notes dated **30 Oct 2026**. |

---

## Judge-facing summary (paste as a pinned callout)

**ConceptLens (The Living Atlas)** turns textbook-style STEM material into interactive, checkable lessons. The signature home demo teaches a singly linked list only when Floyd’s cycle check passes; a broken pointer stops the lesson. Media delivery uses a server-signed Cloudinary pipeline and four delivery variants of one plant-cell illustration (Explore / Focus / Low data) on a configured local account. Accessibility themes, Voice Guide, and an ISL *foundation* (empty verified catalog by design) support inclusive study without clinical diagnoses or synthetic sign language. Built for SheBuilds Hacktoberfest HackDays 2026; live shell at https://conceptlens-58cq.onrender.com/ — verify Cloudinary status on that host before claiming live media variants.
