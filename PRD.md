# ConceptLens 2.0 — Product Requirements Document (PRD)

| Document Version | 2.0.0 |
| :--- | :--- |
| **Status** | Finale demo is the linked-list proof on the home screen. Older sections below describe a wider product, including ISL video and official past papers, that this demonstration does not claim. |
| **Author** | ConceptLens Product & Engineering Team |
| **Target Audience** | Computer Science Students (ISC Class XII, CBSE, University DSA), Inclusive Learners (Deaf/Hard of Hearing), Educators |
| **Tech Stack** | MERN + T3 (React 19/18 + Vite, Node.js + Express + TypeScript, MongoDB/Mongoose, Cloudinary, Zod) |

---

## 1. Executive Summary & Product Vision

### 1.1 What the finale actually demonstrates
A learner opens ConceptLens and meets one idea: a singly linked list is taught only when the structure matches the lesson. A four-node list reverses step by step. A cycle is refused by Floyd’s check, the closing edge is named, and the learner clears that edge before the reversal is allowed to continue. Under that lesson, on the local runner, one plant-cell illustration on the project Cloudinary account is delivered as Explore, Focus, and Low data. The checked Render deployment does not serve that route. Those pixels are not treated as a scan of the list.

Reviewed Indian Sign Language video, official past-paper claims, and measured learning gains are outside this demonstration.

### 1.2 Vision for the wider product
**ConceptLens 2.0** is an accessible, AI-assisted learning platform that transforms static study materials and handwritten notes into interactive, deterministic lessons, connects them to real Previous-Year Questions (PYQs), and provides diverse modalities of learning including reviewed Indian Sign Language (ISL) explanations.

### 1.3 Core Philosophy: Reliability Before Expansion
The single biggest risk in AI-assisted educational tooling is attempting to support arbitrary diagrams and unrestricted subjects with unvalidated AI output. A weak pipeline trusts raw model outputs, leading to hallucinated pointers, broken graph invariants, and student confusion. 

ConceptLens 2.0 adheres to a strict principle: **Every AI-generated result must be validated against structural invariants, traceable to original media coordinates, and fully recoverable through human-in-the-loop correction when confidence is marginal.**

---

## 2. Target Personas & User Journeys

### Persona A: Rohit (17) — ISC Class XII Computer Science Student
- **Need**: Struggling to visualize pointer mutations in singly linked list questions (Question 11 on the ISC board exam).
- **Pain Point**: Textbook diagrams show static arrows; when tracing recursive or loop-based insertions, mental pointer tracking fails.
- **ConceptLens Flow**: Uploads textbook page or specimen paper ➔ Cloudinary crops Question 11 diagram ➔ ConceptLens extracts initial nodes ➔ Rohit steps through pointer rewiring step-by-step with real-time memory/pointer inspector.

### Persona B: Priya (20) — Deaf Computer Science Undergraduate
- **Need**: Preparing for Data Structures and Algorithms university examinations (e.g. Anna University CP5151).
- **Pain Point**: Video tutorials lack accurate subtitles or sign language for technical algorithmic phrasing; text-only explanations lack visual spatial dynamics.
- **ConceptLens Flow**: Opens Linked List lesson ➔ Watches reviewed Indian Sign Language (ISL) clip with synchronized WebVTT captions ➔ Diagram dynamically highlights nodes corresponding to the instructor's sign explanations ➔ Operates entire visualizer via keyboard shortcuts.

### Persona C: Aryan (19) — University DSA Learner Practicing PYQs
- **Need**: Wants to practice exam-relevant problems rather than generic toy questions.
- **Pain Point**: Past question papers are PDF scans without interactive solutions or immediate feedback.
- **ConceptLens Flow**: Filters PYQ drawer by "Anna University - 2019" ➔ Views original question paper crop alongside the interactive sandbox ➔ Solves the traversal problem on-screen with hints before full solution.

---

## 3. Core Feature Requirements

### Feature A: Smart Document & Diagram Ingestion
- **A.1 Multi-format Upload**: Accept `PNG`, `JPEG`, `WEBP`, and `PDF` up to 15MB (images) and 30MB (PDFs).
- **A.2 Cloudinary Media Gateway**:
  - Secure signed client upload via `POST /api/uploads/signature`.
  - Automatic quality and format optimization (`f_auto,q_auto`).
  - Scan enhancement via Cloudinary filters (`e_sharpen`, `e_contrast`).
- **A.3 Region-of-Interest Cropping**: Allow user to select bounding box coordinates `[x, y, width, height]` for the diagram or question within a multi-page paper.
- **A.4 Quality & Readability Gate**: Detect blurry, skewed, or low-contrast uploads; prompt user to recrop or provide a clearer scan rather than failing downstream.
- **A.5 Source Preservation**: Store immutable original asset ID and page index for continuous auditability.

### Feature B: Interactive Concept Engine (Deterministic Visualizer)
- **B.1 Target Data Structure for Phase 0/MVP**: Singly Linked Lists (nodes with `value`, `next` pointer, and optional coordinate offsets).
- **B.2 Deterministic Simulation Engine**:
  - Pure state transition machine: `(State, Action) => NextState`.
  - Generates discrete `ExecutionStep` sequences for standard operations:
    1. Insertion at Head (`insertHead`)
    2. Insertion at Tail (`insertTail`)
    3. Deletion of Node (`deleteNode`)
    4. Reverse Linked List (`reverseList`)
    5. Linear Search (`search`)
- **B.3 Step-by-Step Playback Controls**:
  - Play, Pause, Step Forward, Step Backward, Reset, and Speed Slider (0.5x, 1x, 2x).
  - Keyboard hotkeys (`Space`, `ArrowRight`, `ArrowLeft`, `R`).
- **B.4 Memory & Pointer Inspector**:
  - Real-time watch window showing active pointer variables: `head`, `current`, `prev`, `temp`, `newNode`.
  - Node highlight styling for active comparison and pointer reassignment.
- **B.5 Human-in-the-Loop Correction (Validation Gate)**:
  - If OCR misidentifies a node value or pointer target, provide an inline modal allowing the student to adjust the label or reconnect the arrow before proceeding.

### Feature C: PYQ (Previous Year Question) Intelligence
- **C.1 Exam Metadata Schema**: Board/University (`ISC`, `CBSE`, `Anna University`), Year (`2019`–`2025`), Paper Code (`CP5151`, `868`), Marks, Question Number.
- **C.2 Bounding Box Traceability**: Display side-by-side split screen showing the original exam question paper page crop alongside the interactive sandbox.
- **C.3 Topic & Syllabus Tagging**: Categorize questions by data structure, time complexity, and operation type.
- **C.4 Direct Practice Launch**: Clicking "Practice this PYQ" initializes the interactive engine with the exact nodes illustrated in the exam paper.

### Feature D: Inclusive Learning & Accessibility (WCAG 2.2 AAA)
- **D.1 Reviewed Indian Sign Language (ISL)**:
  - High-definition video player featuring certified ISL explanations for fundamental operations.
  - Video timeline synchronization with diagram state transitions.
- **D.2 Captions & Searchable Transcripts**:
  - Embedded WebVTT caption tracks.
  - Interactive transcript panel allowing students to click a sentence to seek to that video timestamp.
- **D.3 Screen Reader Live Region**:
  - Centralized `aria-live="polite"` region announcing every state change: *"Step 2 of 4: Pointer current moved from node 10 to node 20."*
  - Critical alerts announced with `aria-live="assertive"`.
- **D.4 Accessible Ergonomics**:
  - Complete keyboard operability (no mouse required).
  - Visible focus indicators with high-contrast outlines (`3px solid #38bdf8`).
  - High-contrast color mode toggle.
  - Full adherence to `prefers-reduced-motion: reduce`.

### Feature E: Personalized Practice & Diagnostics (Post-MVP)
- **E.1 Diagnostic Probes**: 2-minute check-in questions to test prerequisite pointer knowledge.
- **E.2 Incremental Hints**: 3-tiered hint system before revealing the complete pointer sequence.
- **E.3 Mistake-Driven Revision Queue**: Automatically bookmark questions where the student rewired pointers incorrectly.

---

## 4. The 8-Stage Reliability Pipeline Specification

```
[01: Upload & Validate] ➔ [02: Media Prep & Crop] ➔ [03: OCR Extraction] ➔ [04: AI Interpretation]
            │                        │                        │                         │
[08: Verify Learning]   ⬅ [07: Render Engine]     ⬅ [06: Human Review]     ⬅ [05: Validation Gate]
```

### Stage Gate Specifications

| Gate # | Stage Name | Inputs | Processing & Invariant Checks | Outputs / Failover |
| :---: | :--- | :--- | :--- | :--- |
| **01** | **Upload & Validate** | Raw user file, Auth token | File mime check (`image/*`, `application/pdf`), size <= 15MB, virus/integrity check | Valid file stream OR descriptive rejection message |
| **02** | **Prepare Media** | Valid file | Cloudinary signed upload, deskew, sharpen, generate 300px thumbnail & full res URL | Cloudinary asset record with public ID & URL |
| **03** | **Extract Content** | Cloudinary URL, crop bounding box | Cloudinary OCR / Vision text bounding box detection | Extracted text tokens with normalized coordinates `[ymin, xmin, ymax, xmax]` |
| **04** | **Interpret Diagram**| Extracted tokens & image crop | AI vision prompt generating structured JSON following `LinkedListGraphSchema` | Proposed typed graph: `{ headId, nodes, isCircular }` |
| **05** | **Validate Structure** | Proposed graph JSON | **Validation Invariants**:<br>1. Head exists and is non-null.<br>2. Floyd's cycle check matches `isCircular`.<br>3. Zero dangling `next` references.<br>4. Node values are non-empty strings/numbers. | **Pass**: Route to Stage 07.<br>**Fail**: Route to Stage 06 with violation list. |
| **06** | **Human Correction** | Proposed graph + validation errors | Render correction dialog highlighting invalid nodes/arrows; user edits value or pointer | Cleaned, validated graph JSON |
| **07** | **Render Deterministically**| Validated graph | Application state engine builds step sequence `ExecutionStep[]`; SVG canvas renders deterministic layout | Interactive animated canvas with step playback |
| **08** | **Verify Learning** | Student interactions / answers | Compare student pointer assignments against deterministic solution steps; record attempt | Feedback score, hint guidance, and persistence in `Attempt` collection |

---

## 5. Non-Functional Requirements (NFRs)

1. **Performance**:
   - Time from upload to interactive render: `< 3.5 seconds` on 4G network.
   - Diagram step transition frame rate: `60 FPS` smooth CSS/SVG transitions.
2. **Reliability & Availability**:
   - Zero-unhandled-exception guarantee on malformed diagrams; graceful fallback to human correction.
   - Cloudinary upload timeout: 10s with 2 exponential backoff retries.
3. **Accessibility**:
   - Strict adherence to WCAG 2.2 Level AAA contrast ratios (min 7:1 for text, 3:1 for graphical UI components).
   - Zero keyboard traps throughout interactive canvas and dialogs.
4. **Data Privacy**:
   - No user identity or sensitive student exam data logged in external AI prompts.

---

## 6. Success Metrics & Key Results (OKRs)

- **KR 1 (Reliability)**: 100% of invalid or malformed diagrams intercepted at Gate 05 without breaking visualizer state.
- **KR 2 (Comprehension)**: >85% of test students successfully solve ISC Question 11 linked list pointer reassignment after using ConceptLens interactive mode.
- **KR 3 (Accessibility)**: 100% of interactive visualizer operations operable via keyboard and screen reader alone.
