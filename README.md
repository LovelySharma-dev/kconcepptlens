# ConceptLens 2.0 🔍✨

> **Transforming static study materials and board exam questions into interactive, validated lessons with Previous-Year Question (PYQ) intelligence and Indian Sign Language (ISL) inclusivity.**

[![MERN Stack](https://img.shields.io/badge/Stack-MERN%20%2B%20T3-blueviolet?style=for-the-badge)](https://github.com)
[![Cloudinary](https://img.shields.io/badge/Media-Cloudinary%20Signed%20Pipeline-blue?style=for-the-badge&logo=cloudinary)](https://cloudinary.com)
[![TypeScript](https://img.shields.io/badge/Type%20Safety-End--to--End%20(Zod)-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Accessibility](https://img.shields.io/badge/Accessibility-WCAG%202.2%20AAA%20%7C%20ISL-059669?style=for-the-badge)](https://www.w3.org/WAI/standards-guidelines/wcag/)

---

## 📖 Table of Contents
- [The Vision & Problem Statement](#-the-vision--problem-statement)
- [System Architecture (MERN + T3 + Cloudinary)](#-system-architecture-mern--t3--cloudinary)
- [The 8-Stage Reliability Pipeline](#-the-8-stage-reliability-pipeline)
- [Key Features](#-key-features)
  - [A. Smart Document Ingestion](#a-smart-document-ingestion)
  - [B. Interactive Concept Engine](#b-interactive-concept-engine)
  - [C. PYQ Intelligence](#c-pyq-intelligence)
  - [D. Inclusive Learning & Indian Sign Language](#d-inclusive-learning--indian-sign-language)
  - [E. Personalized Practice](#e-personalized-practice)
- [API Design](#-api-design)
- [Project Directory Structure](#-project-directory-structure)
- [Quickstart & Local Setup](#-quickstart--local-setup)
- [Keyboard Navigation & Accessibility](#-keyboard-navigation--accessibility)
- [Testing & Benchmark Dataset](#-testing--benchmark-dataset)
- [Notion Documentation Roadmap](#-notion-documentation-roadmap)
- [License](#-license)

---

## 🎯 The Vision & Problem Statement

Computer Science concepts like pointer arithmetic and dynamic data structures are notoriously difficult to grasp from static textbook diagrams and PDF question papers. When students prepare for board examinations (such as **ISC Class XII Computer Science Question 11**) or university exams (**Anna University CP5151**), they are confronted with static black-and-white arrows that fail to convey the step-by-step nature of pointer rewiring.

For deaf and hard-of-hearing students, the challenge is compounded by the lack of technical educational resources in **Indian Sign Language (ISL)**.

**ConceptLens 2.0** solves this with a dependable, staged learning pipeline:
1. It ingests student notes or exam papers via a **Cloudinary-powered media pipeline**.
2. It uses vision AI bound by strict **Zod validation gates** to guarantee that diagrams adhere to mathematical graph invariants.
3. It animates operations through a **deterministic step machine** with live memory/pointer tracking.
4. It connects lessons to real **Previous-Year Questions (PYQs)** with side-by-side original page references.
5. It integrates certified **Indian Sign Language (ISL)** clips with synchronized captions.

---

## 🏛 System Architecture (MERN + T3 + Cloudinary)

ConceptLens 2.0 adopts modern MERN and T3 principles: strict end-to-end type safety, unified Zod schemas, predictable REST contracts, and reactive accessible UI components.

```
                          ┌─────────────────────────────┐
                          │   Student / Learner         │
                          └──────────────┬──────────────┘
                                         │
                                         ▼
                          ┌─────────────────────────────┐
                          │    Client (React 19 + Vite) │
                          │  - Modern Vanilla CSS UI    │
                          │  - SVG Step-by-Step Canvas  │
                          │  - Accessible Live Announcer│
                          └──────────┬───────▲──────────┘
             1. Request Signature    │       │  3. Direct Upload & Crop
                                     ▼       │
 ┌────────────────────────────────────────┐  │  ┌────────────────────────┐
 │ Server (Express + TypeScript + Node)   │  └──┤ Cloudinary Gateway     │
 │ - Zod Request Validation Guards        │     │ - Signed Uploads       │
 │ - Invariant Engine (Floyd's Cycle Test)│     │ - Responsive Previews  │
 │ - Deterministic Step Generator         │     │ - Sharpen & Deskew     │
 │ - Mongoose Persistence Fallback        │     └────────────────────────┘
 └───────────────────┬────────────────────┘
                     │
                     ▼
 ┌────────────────────────────────────────┐
 │ Shared Contracts (shared/src/schemas)  │
 │ - LinkedListGraphSchema                │
 │ - ExecutionStepSchema                  │
 │ - PYQSchema & InvariantErrorSchema     │
 └────────────────────────────────────────┘
```

---

## 🛡 The 8-Stage Reliability Pipeline

Rather than blindly trusting an LLM's vision output, ConceptLens employs validation gates at each transition:

```
[01: Upload & Validate] ➔ [02: Media Prep & Crop] ➔ [03: OCR Extraction] ➔ [04: AI Interpretation]
            │                        │                        │                         │
[08: Verify Learning]   ⬅ [07: Render Engine]     ⬅ [06: Human Review]     ⬅ [05: Validation Gate]
```

| # | Stage | Responsibility | Failure Fallback |
| :---: | :--- | :--- | :--- |
| **01** | **Upload & Validate** | Validate file size, mime types, and format integrity. | Display clear error; list accepted formats. |
| **02** | **Prepare Media** | Cloudinary auto-deskew, sharpen (`e_sharpen`), and generate preview thumbnails. | Flag blurry or low-contrast scans; prompt recrop. |
| **03** | **Extract Content** | OCR bounding boxes identify node values, headers, and arrow vectors. | Preserve source coordinates for correction overlay. |
| **04** | **Interpret Diagram** | AI vision prompt produces structured AST matching `LinkedListGraphSchema`. | Bound parsing within typed schema limits. |
| **05** | **Validate Structure**| Graph invariant check: head validity, Floyd's cycle test, dangling pointers. | Reject invalid graph; do not render broken AST. |
| **06** | **Human Correction** | Interactive modal highlighting uncertain labels (`<0.80`) or broken pointers. | Allow student to edit value or rewire pointer target. |
| **07** | **Render Engine** | Deterministic simulation engine generates step transitions; SVG renders. | Execute mathematically verified application logic. |
| **08** | **Verify Learning** | Evaluate practice answers against known states; map to original PYQ. | Provide tiered hints before full solutions. |

---

## 🌟 Key Features

### A. Smart Document Ingestion
- Upload scans, smartphone camera photos, or PDF question papers.
- Interactive bounding-box selector allows cropping the diagram region directly.
- Automatic Cloudinary scan enhancement (`e_sharpen`, `e_contrast`) for low-light student notes.
- Preservation of original file references and source page metadata.

### B. Interactive Concept Engine
- Phase 0 / MVP Target: **Singly Linked Lists**.
- Deterministic step-by-step playback: `insertHead`, `insertTail`, `deleteNode`, `reverseList`, `search`.
- Controls: Play/Pause, Step Forward, Step Backward, Reset, and Speed Slider (0.5x, 1x, 2x).
- **State & Memory Inspector**: Real-time table displaying current variable assignments (`head`, `current`, `temp`, `newNode`) at every tick.
- Human-in-the-Loop review dialog when an ambiguous arrow or label is detected.

### C. PYQ Intelligence
- Curated Question Bank with board/university metadata (ISC 2025 Specimen, Anna University 2019).
- Side-by-side view showing the original exam question paper page crop alongside the interactive sandbox.
- One-click "Practice this Question" button to initialize the visualizer with the exact nodes from the exam.

### D. Inclusive Learning & Indian Sign Language
- **Reviewed ISL Video Clips**: Authentic sign language explanations synchronized with diagram transitions.
- **Captions & Transcripts**: Embedded WebVTT tracks with searchable, clickable transcript jumps.
- **Screen Reader Announcements**: Centralized `aria-live="polite"` region vocalizes every pointer mutation.
- **High-Contrast & Reduced Motion**: Instant toggle for high-contrast palettes (7:1 contrast) and `@media (prefers-reduced-motion)`.

### E. Personalized Practice
- Diagnostic probes to evaluate understanding before advanced operations.
- 3-tiered hint progression (Concept Hint ➔ Pointer Pseudocode ➔ Full Solution).
- Mistake revision queue for questions answered incorrectly.

---

## 🔌 API Design

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/uploads/signature` | `POST` | Generates restricted, signed upload authorization for Cloudinary |
| `/api/diagrams/interpret` | `POST` | Submits media references & crop box for AI interpretation & validation |
| `/api/diagrams/validate` | `POST` | Validates a proposed or student-edited structured diagram against invariants |
| `/api/diagrams/sessions` | `POST` | Persists a validated learning session and its step sequence |
| `/api/pyqs` | `GET` | Retrieves curated Previous-Year Questions with topic & board filters |
| `/api/pyqs/:id` | `GET` | Retrieves full PYQ details including source paper page crop coordinates |
| `/api/lessons/:id` | `GET` | Retrieves lesson data, step explanations, and reviewed ISL resources |
| `/api/practice/attempts` | `POST` | Records and evaluates a student practice response |

---

## 📂 Project Directory Structure

```text
ConceptLens/
├── .agents/
│   └── skills/                         # Antigravity Workspace Skills
│       ├── cloudinary-media-pipeline/  # Cloudinary signed upload & transform runbook
│       ├── mern-t3-architecture/       # Type-safe MERN + T3 development guide
│       ├── concept-engine-validation/  # Invariant checks & step generator runbook
│       ├── pyq-intelligence/           # PYQ extraction & mapping guide
│       └── inclusive-learning-isl/     # WCAG 2.2 AAA & ISL implementation guide
├── shared/                             # Single Source of Truth (Zod + TypeScript)
│   ├── src/schemas/
│   │   ├── diagram.ts                  # LinkedListNode, Graph, and Step schemas
│   │   ├── pyq.ts                      # Exam metadata and question mapping schemas
│   │   └── lesson.ts                   # Lesson and ISL resource schemas
│   └── src/index.ts
├── server/                             # Express + Node.js + Mongoose Backend
│   ├── src/
│   │   ├── config/                     # Cloudinary and MongoDB configurations
│   │   ├── models/                     # Asset, Session, Lesson, PYQ Mongoose models
│   │   ├── services/
│   │   │   ├── validationService.ts    # Floyd cycle detection & invariant checks
│   │   │   ├── stepEngine.ts           # Deterministic step simulation engine
│   │   │   └── interpretationService.ts# Vision AI interpreter with fallback
│   │   ├── routes/                     # Upload, Diagram, PYQ, and Lesson routes
│   │   └── index.ts                    # Server application entry point
│   ├── tests/                          # Invariant & unit test suites
│   └── tsconfig.json
├── client/                             # React 19 + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── MediaUploader.tsx       # Cloudinary dropzone & crop selector
│   │   │   ├── InteractiveCanvas.tsx   # SVG animated diagram visualizer
│   │   │   ├── StepControls.tsx        # VCR controls & playback speed
│   │   │   ├── ValidationInspector.tsx # Human-in-the-loop correction modal
│   │   │   ├── PYQDrawer.tsx           # Previous-Year Question drawer & paper preview
│   │   │   ├── ISLPlayer.tsx           # Indian Sign Language player & synced transcript
│   │   │   ├── StateInspector.tsx      # Live memory/pointer watch window
│   │   │   └── LiveAnnouncer.tsx       # Centralized ARIA live region
│   │   ├── index.css                   # Modern dark design system & high contrast
│   │   ├── App.tsx                     # Main interactive application shell
│   │   └── main.tsx
│   ├── vite.config.ts
│   └── tsconfig.json
├── fixtures/                           # Curated Benchmark Diagrams & Ground Truth
│   ├── isc-2025-q11.json               # ISC Class XII Specimen Question 11
│   ├── anna-univ-2019.json             # Anna Univ CP5151 Singly Linked List
│   ├── reverse-linked-list.json        # 4-node reversal sequence
│   ├── malformed-cycle.json            # Loop failure fixture (tests Gate 05)
│   └── ambiguous-label.json            # Uncertain label fixture (tests Gate 06)
├── PRD.md                              # Complete Product Requirements Document
├── PHASES.md                           # Comprehensive Phase-by-Phase Roadmap
├── README.md                           # This document
├── .env.example                        # Template environment variables
└── package.json                        # Root monorepo workspace configuration
```

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher (Tested on Node v24.11)
- **npm**: v9.0.0 or higher (Tested on npm 11.6)
- **Cloudinary Account**: (Free tier credentials for signed uploads)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/ConceptLens.git
cd ConceptLens
npm run install:all
```

### 2. Configure Environment Variables
Copy `.env.example` to `server/.env` and supply your Cloudinary credentials:
```bash
cp .env.example server/.env
```

Edit `server/.env`:
```env
PORT=5000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
MONGODB_URI=mongodb://localhost:27017/conceptlens
NODE_ENV=development
```
*(Note: If MongoDB is not running locally, the server automatically defaults to resilient in-memory session caching!)*

### 3. Run Development Servers
Run both backend and frontend concurrently with a single command:
```bash
npm run dev
```
- **Client**: `http://localhost:5173`
- **Server API**: `http://localhost:5000`

### 4. Run Automated Tests
```bash
npm test
```
Executes invariant checks, Floyd's cycle detection, and step generation against the benchmark fixtures.

---

## ⌨️ Keyboard Navigation & Accessibility

ConceptLens 2.0 is designed from the ground up to be 100% keyboard operable:

| Key | Action |
| :---: | :--- |
| `Space` | Toggle Play / Pause step animation |
| `ArrowRight` | Step Forward one transition |
| `ArrowLeft` | Step Backward one transition |
| `R` | Reset diagram to initial state |
| `Tab` / `Shift+Tab` | Navigate between controls, nodes, and tabs |
| `Alt + C` | Toggle High-Contrast Mode (7:1 contrast ratio) |
| `Alt + M` | Toggle Reduced Motion Mode |
| `Esc` | Close active modal or drawer |

---

## 📊 Benchmark Dataset

The repository includes 5 verified test fixtures under `fixtures/` used to validate pipeline reliability:
1. **ISC Class XII 2025 Specimen (Q11)**: Linked list node insertion and pointer modification.
2. **Anna University 2019 (CP5151)**: Singly linked list traversal and null termination.
3. **Reversal Sequence**: 4-node singly linked list reversal verifying `prev`, `curr`, and `next` pointer transitions.
4. **Malformed Cycle**: Contains an unannounced loop; validates that Gate 05 halts execution before rendering.
5. **Ambiguous Label**: Contains an OCR score `<0.80`; validates that Gate 06 opens the correction UI.

---

## 📝 Notion Documentation Roadmap

The team maintains 10 synchronized documentation pages in Notion:
1. Product Vision & Problem Statement
2. User Research & Student Pointer Difficulties
3. Feature Prioritization & Scope Decisions
4. Architecture & Pipeline State Diagrams
5. Cloudinary Integration & Transformation Recipes
6. AI Schemas, Validation Invariants & Failure Modes
7. Testing Results & Benchmark Accuracy
8. Accessibility Audit & Certified ISL Review
9. Development Journal & Engineering Trade-offs
10. Live Demo Script & Judge Instructions

---

## 📄 License
MIT License. See [LICENSE](LICENSE) for details. Built for accessible computer science education.
