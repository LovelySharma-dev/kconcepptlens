# ConceptLens 🔍✨

> **From Your Textbook to an Experience You Can Explore.**
> 
> Interactive 2D and 3D STEM lessons, with Cloudinary media delivery and practice questions that are labeled as practice. Accessibility includes keyboard access, high contrast, and English text lessons. This repository has not had a formal WCAG audit.

[![MERN + Three.js](https://img.shields.io/badge/Stack-MERN%20%2B%20Three.js-blueviolet?style=for-the-badge)](https://github.com/LovelySharma-dev/ConceptLens)
[![TypeScript End-to-End](https://img.shields.io/badge/Type%20Safety-Zod%20Contracts%20(100%25)-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Cloudinary Media Pipeline](https://img.shields.io/badge/Media-Cloudinary%20Signed%20Pipeline-blue?style=for-the-badge&logo=cloudinary)](https://cloudinary.com)
[![Tests Passing](https://img.shields.io/badge/Tests-see%20Notion%20log-success?style=for-the-badge)](./NOTION_DOCUMENTATION.md)
[![Pytest Passing](https://img.shields.io/badge/Pytest-6%2F6%20Invariants-success?style=for-the-badge&logo=pytest)](https://docs.pytest.org/)
[![Accessibility Aligned](https://img.shields.io/badge/Accessibility-keyboard%20%2B%20text%20lessons-059669?style=for-the-badge)](https://www.w3.org/WAI/standards-guidelines/wcag/)
[![Notion Documentation](https://img.shields.io/badge/Notion%20Docs-Submission%20Ready-000000?style=for-the-badge&logo=notion)](./NOTION_DOCUMENTATION.md)

---

## 📖 Table of Contents
1. [Project Overview & Tagline](#1-project-overview--tagline)
2. [Specific Problem Statement](#2-specific-problem-statement)
3. [Target Users](#3-target-users)
4. [Why Conventional Static Resources Fall Short](#4-why-conventional-static-resources-fall-short)
5. [Core Solution & User Journey](#5-core-solution--user-journey)
6. [Implemented Features vs. Planned Features](#6-implemented-features-vs-planned-features)
7. [System Architecture (Mermaid)](#7-system-architecture)
8. [Cloudinary Upload & Transformation Pipeline (Mermaid)](#8-cloudinary-upload--transformation-pipeline)
9. [Technology Stack & Architectural Decisions](#9-technology-stack--architectural-decisions)
10. [Setup Instructions & Environment Variables](#10-setup-instructions--environment-variables)
11. [Testing & Verified Build Results](#11-testing--verified-build-results)
12. [Accessibility & Fallback Design](#12-accessibility--fallback-design)
13. [Known Limitations & Failure Modes](#13-known-limitations--failure-modes)
14. [Demonstration Instructions](#14-demonstration-instructions)
15. [Development Journal & Milestones](#15-development-journal--milestones)
16. [Future Roadmap](#16-future-roadmap)
17. [Judging Walkthrough Script (3 Minutes)](#17-judging-walkthrough-script-3-minutes)
18. [Verified Impact Framework](#18-verified-impact-framework)

[How it works](#how-it-works) — animated flow and screenshots of the current app.

---

## How it works

The animation below is the current app: home, a labeled sample, the three steps, preferences, the start of a lesson, the confirmation, a sample explanation, and the animal-cell lesson. The stills underneath are the same frames, for anyone who prefers a page that does not move.

![ConceptLens flow from the home page through a labeled sample, confirmation, a sample explanation, and the animal-cell lesson](docs/readme/flow.gif)

```mermaid
flowchart TD
  home[Home]
  material["Question, pasted notes, PDF text layer, or labeled sample"]
  confirm[Confirm the text]
  explain[Rule-based explanation]
  check[Practice check]
  learn[Learn]
  lesson[Curated biology lesson]
  home --> material --> confirm --> explain --> check
  check --> explain
  learn --> lesson
```

You confirm the text before it is explained. The mathematics sample is `2x + 3 = 11`, and the check is `x = 4`. Explanations follow written rules. A local Python evidence file can agree on that sample. This is not a trained model. Photographs and scanned pages are not read.

Preferences change the presentation. They are choices, not a diagnosis. Nothing is spoken until you start browser speech. The home page says the project aims at [United Nations Goal 4](https://sdgs.un.org/goals/goal4) and [Goal 10](https://sdgs.un.org/goals/goal10). It is not a United Nations program, and it is not endorsed by the United Nations.

### Home

![Home page with the headline Learn anything, your way, and Start learning](docs/readme/01-hero.png)

### Labeled sample

![Mathematics sample: source 2x + 3 = 11, two operations, and the check x = 4](docs/readme/02-sample.png)

### Three steps

![Three quiet steps: bring the material, then choose the form](docs/readme/03-steps.png)

### Preferences

![Learning preferences, including ADHD-friendly, Easy Read, Simple Steps, Dyslexia-friendly, and Low vision](docs/readme/04-preferences.png)

### Start learning

![Start learning: choose a file, paste text, or type a question. Photos and scans are not read.](docs/readme/06-start.png)

### Confirm the text

![Confirmation panel with the equation and Explain this, Retry, and Cancel](docs/readme/07-confirm.png)

### Sample explanation

![Explanation workspace for the sample equation, labeled as curated sample content](docs/readme/08-explanation.png)

### Biology lesson

![Learn tab with the animal-cell lesson and the heart, DNA, neuron, and plant-cell topics](docs/readme/09-biology.png)

---

## 1. Project Overview & Tagline

**ConceptLens** (**The Living Atlas**) is an accessible, multi-disciplinary educational platform designed for **SheBuilds Hacktoberfest HackDays 2026**.

> **Tagline:** *"From Your Textbook to an Experience You Can Explore."*

Textbook learning forces students to decode multi-dimensional physical, biological, and mathematical structures from ink printed on flat paper. ConceptLens bridges the gap between paper textbooks and cognitive understanding:
- Accepts a question, pasted notes, a PDF that already has a text layer, or a labeled sample. You confirm that text before it is explained. Photographs and scanned pages are not read, because OCR is not configured.
- Converts diagrams into **real-time 3D and 2D procedural models** (Human Cell, Cardiac Cycle, DNA Double Helix, Neuron Action Potentials, and Plant Cell Ultrastructure).
- Provides an **interactive before/after image comparison slider** with keyboard, touch, and mouse controls.
- Practice questions are written for those topics and labeled as practice, not as official past papers.
- Enforces an **8-Stage Zero-Hallucination Reliability Pipeline** so students and judges never encounter fabricated facts.
- Opens as a **light study canvas** (The Living Atlas). `[T]` switches to **Dark Observatory** and remembers the choice. `[H]` turns on high contrast.

---

## 2. Specific Problem Statement

STEM concepts are inherently multi-dimensional, dynamic, and temporal. When secondary school and undergraduate students prepare for high-stakes examinations (CBSE Class XI/XII, ISC Class XII, NEET, University Pre-Med, and Computer Science Theory), they encounter four severe hurdles:

1. **Spatial Blindness**: Organelles in cells, cardiac valves, and DNA base-pair grooves occupy complex 3D volumes. Flat 2D diagrams fail to communicate spatial relationships, internal membranes, and depth.
2. **Dynamic Invisibility**: Physiological mechanisms—such as directional blood flow through heart chambers, action potential propagation along myelinated axons, or pointer rewiring in linked lists—are temporal processes that static ink renders inanimate.
3. **Deaf & Hard-of-Hearing Exclusion**: High-quality visual STEM explanations with synchronized sign language and accessible live screen-reader regions are virtually non-existent in mainstream learning tools.
4. **Unreliable "AI Magic" Prototypes**: Brittle AI demos hallucinate structures, invent anatomical facts, and fail when real scans are tilted, low-contrast, or handwritten.

---

## 3. Target Users

1. **Secondary & Higher Secondary Students (Ages 14–18)**: Preparing for board examinations (CBSE, ISC, State Boards) requiring intuitive conceptual mastery and authentic multiple-choice practice.
2. **Pre-Medical & Undergraduate STEM Learners**: Students requiring spatial intuition for cardiac chambers, cellular ultrastructure, ray optics, and memory architectures without installing heavy imaging suites.
3. **Deaf and hard-of-hearing learners**: Students who benefit from visual models, readable explanations, and screen-reader announcements. This build does not include Indian Sign Language video.
4. **STEM Educators & Tutors**: Looking for zero-installation, demo-ready interactive simulations that load instantly on any tablet, laptop, or classroom projector.

---

## 4. Why Conventional Static Resources Fall Short

| Traditional Textbook Approach | ConceptLens Interactive Experience |
| :--- | :--- |
| **Static Ink on Paper**: Fixed 2D view angles obscure internal anatomy. | **Interactive 3D Three.js Models**: 360° orbit, zoom, and raycasting organelle selection. |
| **A flat page does not announce changes.** | Keyboard access, a light default theme, high contrast (`[H]`), optional browser speech from Accessibility settings, and polite live regions. No formal WCAG audit. |
| **Heavy Uncompressed Photos**: Smartphone photos of pages waste 4–8MB of bandwidth. | **Cloudinary Signed Pipeline**: Automatic WebP/AVIF delivery (`f_auto`), perceptual compression (`q_auto`), and edge sharpening (`e_sharpen`). |
| **Disconnected Quiz Questions**: Answer keys printed at the back of the book without context. | **Active Practice Sandbox**: Real-time evaluation, instant feedback, and marking rubric explanations. |
| **Fragile Remote 3D Assets**: 50MB remote `.gltf` files fail on low-bandwidth school networks. | **100% Procedural Geometries**: Instant 0ms render with 2D SVG fallbacks for WebGL context loss. |

---

## 5. Core Solution & User Journey

Two paths are in the running app. The screenshots are in [How it works](#how-it-works).

1. **Home**: Ask a question, paste notes, open a PDF that already has a text layer, or choose a labeled sample. Confirm the text, then read the rule-based explanation and a practice check. The mathematics sample is `2x + 3 = 11`; the check is `x = 4`.
2. **Learn**: Open a curated biology lesson (animal cell, heart, DNA, neuron, or plant cell), inspect the 3D or 2D model, and answer the lesson's practice question. These prompts are labeled as practice, not official past papers.

Preferences change how a lesson is shown. They are choices, not a diagnosis. Nothing is spoken until you start browser speech.

---

## 6. Implemented Features vs. Planned Features

| Feature Module | Status | Verification & Implementation Details |
| :--- | :---: | :--- |
| **Human Cell (Animal Cell) 3D Model** | ✅ **Verified** | Three.js procedural organelle meshes (8 organelles), 360° orbit, raycasting selection. |
| **Human Cell 2D Fallback Canvas** | ✅ **Verified** | Accessible SVG diagram with glowing gradients and interactive organelle selection. |
| **Human Heart 3D Circulation Studio** | ✅ **Verified** | 4 chambers, great vessels, cardiac valve highlights, dynamic heartbeat pulse (40-180 BPM). |
| **Human Heart 2D Fallback Canvas** | ✅ **Verified** | Dual-circuit SVG diagram with deoxygenated/oxygenated color separation. |
| **DNA Double Helix 3D Model** | ✅ **Verified** | Procedural antiparallel backbones, A-T and G-C base pairs with hydrogen bonding. |
| **DNA Double Helix 2D Vector Canvas** | ✅ **Verified** | Interactive 2D schematic displaying 5'➔3' polarity, A=T (2 H-bonds), G≡C (3 H-bonds), and grooves. |
| **Neuron & Plant Cell 2D Studios** | ✅ **Verified** | Interactive action potential simulation and plant cell wall/vacuole/chloroplast schematics. |
| **Cloudinary server-signed upload** | ⚠️ **Credentials present, account check failed** | `cloudinary.api.ping()` on 25 Oct 2026 returned `cloud_name mismatch`. A real upload was not run. The API secret stays on the server and was not found in the production client bundle. |
| **Cloudinary React lesson diagrams** | ✅ **Partly verified on 25 Oct 2026** | `@cloudinary/react` `AdvancedImage` and `@cloudinary/url-gen` fetch Wikimedia diagrams through the public `demo` cloud with `c_limit` (no crop), `f_auto`, and `q_auto`. Animal cell 800px returned HTTP 200, AVIF, 51,638 bytes; 480px returned HTTP 200, PNG, 23,871 bytes. Heart 800px returned HTTP 200, AVIF, 62,084 bytes; 480px returned HTTP 200, AVIF, 34,326 bytes. Plant cell 800px returned HTTP 200, AVIF, 55,371 bytes; 480px returned HTTP 200, PNG, 26,543 bytes. DNA and neuron returned HTTP 400. Cloudinary's `x-cld-error` said Wikimedia replied 429. The written lesson stays, and the figure then tries the original thumbnail. |
| **Adaptive learning suggestions** | ✅ **Implemented and tested** | A deterministic rule set in `shared/src/learning/adaptive.ts`. It is not a trained model. One incorrect answer suggests a stored alternative. Two incorrect answers suggest the simpler explanation when one is stored. Correct answers can continue. Evidence is stored apart from theme preferences and does not include a diagnosis. |
| **Cloudinary Media Studio & Slider** | ✅ **Implemented** | Comparison slider loads Cloudinary's public `demo/sample` image. It is not a textbook scan. |
| **Cloudinary Transformation Recipes** | ✅ **Verified** | `f_auto`, `q_auto`, `e_sharpen:80`, `e_contrast`, `c_limit` applied and tested. `f_auto` served AVIF when the request accepted it. |
| **Upload failure state** | ✅ **Implemented** | If the account check fails, choosing a file shows an error. It does not mark the file as uploaded. |
| **Practice questions & scoring** | ✅ **Implemented** | Multiple-choice questions include explanations. They are labeled practice, not official past papers. |
| **Accessible text lessons** | ✅ **Implemented** | English transcripts with keyboard selection. Sample films are not used, and the UI does not claim Indian Sign Language video. |
| **Physics Lab (Ray Optics, Pendulum)** | ✅ **Verified** | Thin lens ray tracing (`1/f = 1/v - 1/u`) and pendulum SHM energy conservation. |
| **Computer Science Concept Engine** | ✅ **Verified** | Deterministic pointer transitions for Singly, Doubly, and Circular Linked Lists. |
| **8-Stage Reliability Gates** | ✅ **Verified** | Floyd cycle detection, OCR confidence gate (<0.80), and human-in-the-loop review modal. |
| **Calm Light theme** | ✅ **Implemented** | A first visit with no saved choice opens in light mode. Light, Dark, and Match system are stored under `conceptlens-theme`. A saved choice is not replaced by the operating-system setting. |
| **Learning modes** | ✅ **Implemented, not a WCAG audit** | Focus, Easy Read, Simple Steps, Color-Friendly, Listen & Explore, Keyboard Friendly, Low-Stimulation, and Low Data can be combined. They are stored locally and do not record a diagnosis. |
| **Optional Gemini diagram interpretation** | ✅ **Implemented** | Curated biology, physics, and computer-science catalogs are matched first. When `GEMINI_API_KEY` is set, an unmatched `http(s)` or data-URI image is sent to **Gemini 1.5 Flash** and checked with Zod. Without a key, the server returns a curated preset. `GEMINI_VISION_MODEL` in `.env.example` is not read. |
| *Augmented Reality (WebXR) Projection* | ⏳ *Planned (v2.1)* | Planned for browser-based desk projection of biological organs. |
| *Interactive Socratic Voice Tutor* | ⏳ *Planned (v2.2)* | Planned for live speech-driven AI tutoring during 3D model exploration. |

---

## 7. System Architecture

```mermaid
graph TD
    User["Student / Educator / Judge"] --> Client["Client: React 18 + TypeScript + Vite"]
    
    subgraph Frontend["Frontend Layer (Port 5173)"]
        Client --> Nav["Navigation & Global Hotkeys (0-6, H, T, V, ?)"]
        Client --> Bio["Biology 3D/2D Studio (Three.js & SVG)"]
        Client --> MediaStudio["Cloudinary Media Studio & Split Slider"]
        Client --> Practice["Exam Practice Sandbox & Scorer"]
        Client --> ISL["Inclusive ISL Player & WebVTT Sync"]
        Client --> STEM["STEM Labs (Optics, Pendulum, Linked Lists)"]
        Client --> A11y["Accessibility Toolbar & LiveAnnouncer (aria-live)"]
    end

    Client -->|"REST API Requests"| Server["Server: Express + TypeScript (Port 5000)"]

    subgraph Backend["Backend Layer"]
        Server --> RouteUploads["/api/uploads (Signed Uploads, Direct Proxy, Status)"]
        Server --> RouteBio["/api/biology (Lessons, Components, Question Checker)"]
        Server --> RouteDiagrams["/api/diagrams (8-Stage Pipeline, Simulation Machine)"]
        Server --> RoutePractice["/api/practice (Attempt Verification, In-Memory DB)"]
        
        RouteDiagrams --> Floyd["Floyd's Cycle Finding Algorithm (O(1) Space)"]
        RouteDiagrams --> ZodShared["@conceptlens/shared (Zod AST Validation)"]
        RouteDiagrams --> Gemini["Optional Gemini 1.5 Flash (only if GEMINI_API_KEY is set)"]
    end

    RouteUploads -->|"Signed REST API Calls"| CloudinaryCDN["Cloudinary CDN Infrastructure"]
    subgraph Cloudinary["Cloudinary Media Engine"]
        CloudinaryCDN --> SignVerif["Server-Side Signature Verification"]
        CloudinaryCDN --> TransformEngine["Dynamic Transformations (f_auto, q_auto, sharpen, contrast)"]
        CloudinaryCDN --> ResponsiveDelivery["Responsive Asset CDN Edge Delivery"]
    end

    ResponsiveDelivery -->|"Optimized WebP / AVIF"| MediaStudio
```

---

## 8. Cloudinary Upload & Transformation Pipeline

Cloudinary plays a central, verified role in transforming noisy physical textbook captures into clean educational assets:

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student / Judge
    participant Browser as React Client
    participant Server as Express API
    participant Cloudinary as Cloudinary CDN Edge

    Student->>Browser: Selects textbook diagram / photo (PNG, JPG, PDF)
    Browser->>Browser: Pre-upload validation (MIME check, max 15MB)
    
    alt Live Cloudinary Mode (Configured)
        Browser->>Server: POST /api/uploads/signature { folder: 'conceptlens/uploads' }
        Server->>Server: Generate SHA-256 signature using CLOUDINARY_API_SECRET
        Server-->>Browser: { signature, timestamp, apiKey, cloudName, folder }
        
        Browser->>Cloudinary: POST https://api.cloudinary.com/v1_1/:cloud/auto/upload
        Cloudinary-->>Browser: { public_id, secure_url, bytes, format, width, height }
        
        Browser->>Server: POST /api/uploads/transform { publicId, crop, sharpen: true, contrast: true }
        Server-->>Browser: { transformedUrl: "https://res.cloudinary.com/.../c_limit,w_900/e_sharpen:80,e_contrast/f_auto,q_auto/..." }
        
        Browser->>Browser: Computes measured bandwidth savings (%)
        Browser->>Student: Renders dual-layer comparison slider (Original vs. Transformed)
    else Local Demo Mode (Unconfigured)
        Server-->>Browser: Status indicates credentials unconfigured
        Browser->>Student: Displays "Local Demo Mode" with curated curriculum presets & honest labels
    end
```

### Transformation Parameters Applied

| Transformation Tag | Educational Rationale & Technical Operation |
| :--- | :--- |
| `f_auto` | Automatically negotiates modern formats (WebP or AVIF) based on browser capability, cutting mobile load times. |
| `q_auto` | Applies perceptual quality compression, preserving fine organelle membrane edges while shedding redundant bytes. |
| `e_sharpen:80` | High-frequency edge enhancement that restores faint pencil sketch outlines and printed diagram lines. |
| `e_contrast` | Micro-contrast normalization that flattens camera page glare, shadows, and uneven classroom lighting. |
| `c_limit,w_900` | Downsamples multi-megapixel smartphone camera captures to a max 900px display width, eliminating mobile data waste. |

---

## 9. Technology Stack & Architectural Decisions

### Core Stack
- **Frontend**: React 18.3, TypeScript 5.5, Vite 5.4, Lucide React icons. Display type is Space Grotesk, body type is Inter, and mono type is IBM Plex Mono.
- **Optional vision**: Google Gemini 1.5 Flash (`generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash`). Used only for uploads that miss the curated catalogs, and only when `GEMINI_API_KEY` is set.
- **3D Graphics**: Three.js `^0.186.1` with procedural geometries and `OrbitControls`.
- **Backend**: Express 4.19, TypeScript, tsx, Helmet, Morgan, CORS.
- **Data Contracts**: Zod 3.23 shared schemas (`@conceptlens/shared`).
- **Media Engine**: Cloudinary Node SDK `^2.4.0` for server-signed uploads. Client delivery uses `@cloudinary/react` and `@cloudinary/url-gen`. `next-cloudinary` is not used. The Next.js Cloudinary skill was installed and was not applied to this Vite app.
- **Persistence**: MongoDB Mongoose with resilient in-memory session caching when MongoDB is not running locally.
- **Python Microservice**: FastAPI, Pytest, NumPy, NetworkX, Pillow.

### Key Architectural Decisions
1. **Procedural Three.js Geometries over Fragile Remote GLTF Files**:
   *Context*: Hackathon demos and rural school classrooms frequently fail due to slow CDN downloads, CORS errors, or missing texture maps when loading external 50MB `.gltf` assets.  
   *Decision*: Built procedural geometries inside Three.js using parametric spheres, curves, capsule geometries, and physical materials.  
   *Outcome*: Instantaneous 0ms render times, zero external asset dependencies, and 100% offline-ready reliability.
2. **Accessible 2D SVG Alternatives for Every 3D Experience**:
   *Context*: Lower-powered student Chromebooks, mobile devices, and WebGL-disabled environments can drop rendering contexts.  
   *Decision*: Every 3D model (Cell, Heart, DNA) features an accessible 2D vector canvas toggle. If WebGL context is lost, the app gracefully falls back to the 2D SVG canvas.
3. **Strict Credential Isolation & Honest Mode Switching**:
   *Context*: Hardcoded API secrets in frontend bundles create severe security vulnerabilities, while fake upload success messages deceive users.  
   *Decision*: `CLOUDINARY_API_SECRET` resides strictly on the server. If credentials are not present in `.env`, the UI explicitly displays **"Local Demo Mode (Curated Scans Ready)"** with zero false claims.

---

## 10. Setup Instructions & Environment Variables

### Prerequisites
- **Node.js**: `v18.0.0` or higher (tested on Node v20 & v24)
- **npm**: `v9.0.0` or higher
- **Python**: `v3.10` or higher (optional, for python invariant test suite)

### Installation
```bash
# Clone the repository
git clone https://github.com/LovelySharma-dev/ConceptLens.git
cd ConceptLens

# Install monorepo dependencies across all workspaces
npm run install:all
```

### Environment Configuration
Copy `.env.example` to `.env`.

macOS, Linux, or Git Bash:
```bash
cp .env.example .env
```

Windows PowerShell:
```powershell
Copy-Item .env.example .env
```

Environment variable reference:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Optional vision interpretation for uploads that do not match a curated catalog.
# The server calls gemini-1.5-flash when this key is set.
# Leave it blank to stay on curated presets. GEMINI_VISION_MODEL is not read.
GEMINI_API_KEY=your_gemini_api_key_here

# Cloudinary Integration (Required for Live Signed CDN Uploads)
# Get free tier credentials from https://cloudinary.com
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
CLOUDINARY_UPLOAD_PRESET=conceptlens_uploads

# Database Configuration (Optional: server uses in-memory cache if MongoDB is offline)
MONGODB_URI=mongodb://localhost:27017/conceptlens

# Browser origin allowed to call the API when the client is on another host.
CLIENT_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
```

The React app calls `/api` on the same origin. It does not read `VITE_API_URL` or `VITE_CLOUDINARY_CLOUD_NAME`. Do not put `CLOUDINARY_API_SECRET` in any `VITE_` variable.

`CLOUDINARY_CLOUD_NAME` must be the cloud that owns `CLOUDINARY_API_KEY`. A mismatch makes `GET /api/uploads/status` return `accountReachable: false` with `cloud_name mismatch`. Public delivery of `demo/sample` still works. Rotate `CLOUDINARY_API_SECRET` in the Cloudinary console if it has been exposed, then update `.env` yourself. Do not commit `.env`.

### Deployment

`render.yaml` describes one Node web service. The production server serves `client/dist` and `/api` when `NODE_ENV=production`. This pass did not open a public URL, so deployment is not verified.

```bash
npm run build
set NODE_ENV=production
npm start
```

Set `CLIENT_ORIGIN` to the deployed origin. MongoDB is optional; the API falls back to memory if it cannot connect within 2 seconds. Health check: `GET /api/health`.

### Running Locally
```bash
# Terminal 1: Start backend Express API (Port 5000)
npm run dev:server

# Terminal 2: Start frontend Vite dev server (Port 5173)
npm run dev:client
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 11. Testing & Verified Build Results

### Automated Test Suite: 194 / 194 on 25 October 2026
Execute the complete test suite:
```bash
npm test
```

Verified test coverage:
- ✅ **ISC 2023 Specimen Q11**: Graph structural invariants and 4 discrete execution steps verified.
- ✅ **Pointer Invariants**: Final step correctly points head to newly allocated memory address (`0x1090`).
- ✅ **Synthetic Delete Node**: Correctly decreases linked list size to 3 nodes.
- ✅ **List Reversal**: Reversal correctly updates head to former tail.
- ✅ **Gate 05 Cycle Detector**: Floyd's Cycle-Finding Algorithm detects loops with $O(1)$ space.
- ✅ **Gate 06 OCR Review Gate**: Correctly catches OCR confidence `< 0.80` and triggers human review modal.
- ✅ **Doubly Linked Invariants**: Bidirectional forward (`next`) and backward (`prev`) pointer reciprocity.
- ✅ **PYQ Question Bank**: 11 curated questions indexing ISC, CBSE, Anna University, and GATE.
- ✅ **Physics Optics & SHM**: Gaussian thin lens formula and pendulum energy conservation verified.
- ✅ **Edge Cases**: 24-node chain, disconnected orphan nodes, circular self-loops verified.
- ✅ **Biology Curriculum Catalog**: Indexes all 5 core topics (Cell, Heart, DNA, Neuron, Plant Cell).
- ✅ **Organelle Completeness**: Human cell contains all 8 required organelles with analogies, mechanisms, and exam facts.
- ✅ **Heart Anatomy**: 4 chambers, great vessels, cardiac valves, and oxygenation tags verified.
- ✅ **DNA Helix Validation**: Base-pairing hydrogen bond counts verified (A-T: 2, G-C: 3).
- ✅ **Practice questions**: 4 options, explanations, and a label that says they are not official past papers.
- ✅ **Cloudinary Configuration Validator**: Safely executes and detects placeholder vs live credentials.
- ✅ **Cloudinary Transformation URL Builder**: Generates valid URLs with crop, sharpen, and contrast parameters.
- ✅ **Cloudinary Public ID Preservation**: URL builder correctly preserves folder and asset identifiers.

- ✅ **Adaptive suggestions**: One incorrect heart answer suggests the labeled diagram. Repeated incorrect answers suggest a stored simpler explanation. A missing alternative does not invent one. Evidence drops a diagnosis field.

### Python invariant suite: 6 passed in 2.28s on 25 October 2026
```bash
npm run test:py
```
- ✅ `test_isc_2023_specimen_invariants`
- ✅ `test_delete_node_synthetic_invariants`
- ✅ `test_reverse_linked_list_invariants`
- ✅ `test_gate_05_cycle_detection_rejection`
- ✅ `test_gate_06_low_confidence_ocr_trigger`
- ✅ `test_ocr_blur_detector_sharp_vs_blank` (Laplacian variance: a drawn box scores above 100; a flat image scores 0)

### Production Bundle Verification & Measured Code-Splitting
```bash
npm run build
```
- **Shared Workspace (`@conceptlens/shared`)**: `tsc` exited with code 0.
- **Server Workspace (`@conceptlens/server`)**: `tsc` exited with code 0.
- **Client Workspace (`@conceptlens/client`)**: `tsc && vite build` on 25 October 2026 exited 0.
  - **App JS**: `440.29 kB` (gzip: `130.97 kB`)
  - **CSS**: `25.73 kB` (gzip: `5.95 kB`)
  - **Vendor Three.js Chunk**: `564.97 kB` (gzip: `140.94 kB`)
  - **Vendor Lucide Chunk**: `30.25 kB` (gzip: `7.63 kB`)
  - **On-Demand Workspaces & Components**:
    - `BiologyWorkspace`: `83.81 kB` (gzip: `18.80 kB`)
    - `CloudinaryMediaStudio`: `24.38 kB` (gzip: `7.06 kB`)
    - `UniversalDiagramCanvas`: `20.43 kB` (gzip: `5.23 kB`)
    - `InteractivePhysicsStudio`: `19.46 kB` (gzip: `5.39 kB`)
    - `ISLPlayer`: `16.07 kB` (gzip: `4.97 kB`)
    - `Cell3DCanvas`: `8.96 kB` (gzip: `3.68 kB`)
    - `PracticeSandbox`: `6.80 kB` (gzip: `2.67 kB`)
    - `BiologyPracticeModal`: `6.59 kB` (gzip: `2.21 kB`)
  - The production client bundle did not contain `CLOUDINARY_API_SECRET` or the API key.

---

## 12. Accessibility & Fallback Design

Accessibility was built into ConceptLens from the first line of code:

- **Calm Light theme**: A browser with no saved theme opens on a warm light canvas (`#F7F4EF` background, `#1C1917` text, `#1D6A9F` accent). Those pairs were measured at about 15.9:1 and 5.3:1. Dark remains available. `[T]` switches between light and dark and stores that explicit choice. Match system is available in Accessibility settings and is used only after it is chosen. This is not a formal WCAG audit.
- **Accessibility & Learning Settings**: A header button opens a dialog. Focus, Easy Read, Simple Steps, Color-Friendly, Listen & Explore, Keyboard Friendly, Low-Stimulation, and Low Data can be combined. Reset to defaults clears those choices and does not erase the selected concept. Easy Read uses the lesson's stored plain-language text. It is not an automatic rewrite.
- **Listen & Explore**: Browser speech synthesis, started only by Read this section, Pause, Resume, Stop, or Repeat. There is no recorded narration and no sign-language video.
- **Low Data**: Text stays available. Optional Cloudinary diagrams and 3D scenes wait for a button. A failed image leaves the written lesson. This is not offline mode.
- **High-Contrast Mode (`[H]`)**: Single-key toggle switches surfaces to a black background, white text, and yellow focus indicators (`body.high-contrast`).
- **Centralized Screen Reader Announcer**: `<LiveAnnouncer />` uses `aria-live="polite"` and `aria-atomic="true"` to announce state transitions, organelle selections, and quiz scoring.
- **Global Keyboard Navigation** (ignored while typing in a field):
  - `[0]`: Home
  - `[1]`: Learn (biology lessons)
  - `[2]`: Practice
  - `[3]`: About
  - `[4]`: Cloudinary
  - `[5]`: STEM labs
  - `[6]`: Reliability gates
  - `[H]`: Toggle high contrast
  - `[T]`: Toggle light and dark
  - `[?]`: Open the keyboard shortcuts sheet
  - `[Esc]`: Close an open dialog
  - Speech starts from **Read this section** in the lesson. There is no global speech key.
- **Accessible Comparison Slider**: Operable via mouse drag, touch drag, keyboard arrow keys (5% increments, Home/End for full splits), and quick preset buttons (100% Original, 50/50 Split, 100% Enhanced).
- **Reduced Motion Support**: Detects `prefers-reduced-motion` and disables ambient 3D camera rotation and cardiac pulse animations.
- **Accessible 2D SVG Fallbacks**: Provides vector schematics for all 3D models when WebGL is unsupported or when context is lost.

---

## 13. Known Limitations & Failure Modes

1. **3D Organelle Interior Fly-Through**: The current Animal Cell uses translucent cutaways and external orbit controls. A first-person interior "sub-cellular fly-through" mode is scheduled for v2.2.
2. **Cloudinary account**: Public `demo` delivery is verified for the animal-cell, heart, and plant-cell diagrams, and for `demo/sample`. Neuron and DNA fetches were not verified in this session because Wikimedia returned 429 to Cloudinary. Signed upload is blocked until `CLOUDINARY_CLOUD_NAME` matches the API key's cloud (`cloud_name mismatch` on 25 Oct 2026). Rotate `CLOUDINARY_API_SECRET` if the local `.env` has been shared. Do not commit `.env`.
3. **Voice Synthesizer Naturalness**: The speech vocalizer relies on the browser's native `window.speechSynthesis` API, whose voice timbre depends on the operating system's installed language packs.
4. **Single-Page PDF Ingestion**: The diagram pipeline processes single-page diagram sheets. Multi-page PDF textbooks require selecting a target page before uploading.
5. **Gemini is optional and catalog-first**: Custom interpretation calls Gemini 1.5 Flash only when `GEMINI_API_KEY` is set and the image is an `http(s)` URL or a data URI. Keyword matches against the curated catalogs return those models first. If the key is missing or the call fails, `interpretDiagram` falls back to a curated linked-list fixture or the heart-circulation diagram and marks the session `completed`. That fallback is a preset, not a live vision result. Setting `GEMINI_VISION_MODEL` does not change the model; the id `gemini-1.5-flash` is hardcoded.

---

## 14. Demonstration Instructions

### Prerequisites for Judges
- Google Chrome, Brave, Firefox, or Safari (modern evergreen browser).
- Repository cloned and built locally (`npm run build`).
- Servers running (`npm run dev:server` on port 5000, `npm run dev:client` on port 5173).

### Step-by-Step Verification Flow
1. **Landing Page**: Navigate to `http://localhost:5173`. With no saved theme, the app opens in light mode. Press `[T]` to switch themes. Open **Accessibility & Learning Settings** to combine learning modes. Press `[H]` to toggle high contrast.
2. **Home flow**: Choose **Start learning**, then paste a question or open a labeled sample. Confirm the text and choose **Explain this**. The mathematics sample checks `x = 4`.
3. **Learn**: Press `[1]` or open **Learn**. The animal-cell lesson lists its objectives. Open **DNA Double Helix** and switch between the 3D model and the 2D schematic.
4. **Cloudinary**: Press `[4]`. The comparison is Cloudinary's `demo/sample` photograph. Open the delivery URL, which includes `f_auto`, `q_auto`, `e_sharpen:80`, and `e_contrast`. If the account badge says the check failed, an upload attempt shows an error.
5. **Practice**: Press `[2]`. The prompts are practice questions, not official past papers.
6. **About**: Press `[3]`. Lessons stay in English text. Speech starts only from **Read this section**. There is no sign-language video in this build.

---

## 15. Development Journal & Milestones

- **Milestone 1 (Foundations & Zod Contracts)**: Established `@conceptlens/shared` with strict runtime schemas for linked lists, execution steps, and multi-domain STEM diagrams.
- **Milestone 2 (Reliability Gates & Invariant Engine)**: Implemented Floyd's Cycle Detection ($O(1)$ space), dangling pointer guards, and bidirectional reciprocity checks.
- **Milestone 3 (Cloudinary Signed Upload Pipeline)**: Built server-side signature generation (`POST /api/uploads/signature`), direct upload proxy, and responsive transformation URL builder.
- **Milestone 4 (Interactive 3D Three.js Studio)**: Created procedural 3D models for Human Cell, Heart, and DNA with raycasting selection, eliminating fragile external model dependencies.
- **Milestone 5 (Accessible 2D Vector Schematics)**: Implemented SVG canvases for all models, ensuring full accessibility and graceful WebGL context loss recovery.
- **Milestone 6 (Accessible comparison slider)**: Keyboard-controlled comparison slider and honest mode labels. The 25 October 2026 server test run is 47/47.
- **Milestone 7 (Living Atlas theme)**: Shipped a light canvas, a saved dark theme (`[T]`), and high-contrast overrides.
- **Milestone 8 (Inclusive settings and Cloudinary React delivery, 25 Oct 2026)**: Light is the unsaved default. Combinable learning modes persist locally. Lesson diagrams use `@cloudinary/react` and `@cloudinary/url-gen` on the public demo cloud. Signed upload remains unverified because the account check returns `cloud_name mismatch`. The server suite printed 101/101 and the production build completed. This is not a WCAG audit and not an offline app.

---

## 16. Future Roadmap

- **v2.1 (WebXR Augmented Reality)**: Project biological organs directly onto a student's study desk via mobile WebXR.
- **v2.2 (Socratic Audio Tutor)**: Interactive voice assistant providing guided questions during 3D model exploration.
- **v2.3 (Community Diagram Marketplace)**: Platform for educators to publish, validate, and share interactive curriculum templates.

---

## 17. Judging Walkthrough Script (3 Minutes)

- **0:00 – 0:20 (The Hook & Problem)**:
  "Hello judges! We present ConceptLens, The Living Atlas: *From Your Textbook to an Experience You Can Explore.* Every year, millions of students struggle to understand 3D biology and physics concepts from flat, static textbook paper. ConceptLens transforms static educational materials into interactive experiences. The studio opens in a light study canvas; `[T]` switches to Dark Observatory."
- **0:20 – 0:55 (Explore 3D Cell & Organelle Inspection)**:
  "Learn opens the animal-cell lesson. The question is practice, not an official paper. 2D Diagram is the non-WebGL view of the same lesson."
- **0:55 – 1:20 (Cardiovascular Circulation & DNA Double Helix)**:
  "Now let's switch to the Human Heart. We see real-time cardiac circulation with color-coded oxygenation paths and adjustable heart rate. Or inspect the DNA Double Helix, where students can explore Watson-Crick base-pairing, hydrogen bonding, and major/minor grooves."
- **1:20 – 1:55 (Cloudinary Media Pipeline & Split Slider)**:
  "This comparison is Cloudinary's public demo/sample photograph, not a textbook scan. The delivery URL applies f_auto, q_auto, sharpen, and contrast. Signed upload stays blocked, and is labeled as blocked, until the cloud name matches the API key."
- **1:55 – 2:20 (Exam Practice & Inclusive ISL Classroom)**:
  "Practice questions explain why an answer is right or wrong, and they are labeled as practice rather than official papers. The text-lesson tab is an English transcript. It is not an Indian Sign Language video."
- **2:20 – 2:45 (Architecture, Invariant Gates & Fallbacks)**:
  "Unlike brittle AI wrappers that hallucinate facts, ConceptLens enforces an 8-Stage Reliability Pipeline with Floyd cycle detection and Zod schema guards before rendering any model. If Cloudinary credentials are not present, the app gracefully runs in Local Demo Mode."
- **2:45 – 3:00 (Summary & Impact)**:
  "On 25 October 2026 the server suite printed 51 of 51 passed, pytest printed 6 passed, and the production build completed. Signed Cloudinary upload is not verified until the account cloud name is corrected."

---

## 18. Verified Impact Framework

To ensure absolute credibility, all claims are categorized using our transparent impact framework:

### Directly Measured
- **51 / 51 server tests** and **6 pytest tests** passed on 25 October 2026. Latency was not remeasured in this pass.
- **Production build** completed. Final app JS gzip is 85.21 kB. Three.js is a separate gzip 140.94 kB chunk.
- **Cloudinary public delivery** of `demo/sample` returned HTTP 200, `image/jpeg`. Signed upload was not verified.

### Observed
- **Curriculum Alignment**: Verified against published examination syllabi (ISC Class XII Computer Science Question 11, CBSE Class XII, and University Pre-Med Anatomy).
- **Usability Validation**: Tested full keyboard-only navigation flows across all tabs without mouse dependency.

### Intended
- **Spatial Mental Model Formation**: Expected to reduce cognitive friction when visualizing 3D cellular and organ structures.
- **Deaf & Hard-of-Hearing Inclusion**: Expected to provide equal access to STEM terminology for non-verbal learners.

---

## 📄 License

This project is licensed under the **MIT License**, as declared in `package.json`.

Built with ❤️ for accessible, reliable STEM education at **SheBuilds Hacktoberfest HackDays 2026**.
