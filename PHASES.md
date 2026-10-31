# ConceptLens 2.0 — Implementation Roadmap by Phases

This document details the phase-by-phase execution strategy for ConceptLens 2.0. **Phase 0 through Phase 3 + critical slices of Phase 4 & 5 represent the prioritized Hackathon MVP**, while subsequent phases outline the post-hackathon product trajectory.

---

## Roadmap Overview

```
Phase 0: Scope, Foundations & Test Fixtures          [MVP - 2-3 hrs]  ✅
Phase 1: Cloudinary Media Pipeline & Transformations  [MVP - 3-5 hrs]  ✅
Phase 2: Interactive Concept Engine (Linked Lists)   [MVP - 4-6 hrs]  ✅
Phase 3: AI-Assisted Interpretation & Validation Gate [MVP - 4-6 hrs]  ✅
Phase 4: PYQ Intelligence & Board Paper Mapping       [MVP/P1 - 1-2 wks] 🚀
Phase 5: Inclusive Learning & Indian Sign Language   [MVP/P1 - 1-2 wks] 🚀
Phase 6: Personalized Practice & Diagnostic Queues    [Post-Hackathon - Wk 3-4]
Phase 7: Multi-Structure Expansion & Benchmarking     [Post-Hackathon - Wk 5-6]
```

---

## Detailed Phase Breakdown

### Phase 0 — Scope, Foundations & Test Fixtures (2–3 hours) [MVP Core]
- **Objective**: Establish the bedrock of the project with a laser-focused scope, typed schemas, and reproducible test fixtures.
- **Deliverables**:
  1. Scope boundary: Choose **Singly Linked Lists** as the first fully supported diagram type.
  2. Define 5–10 curated test diagrams with known expected node/pointer structures (ISC 2025 Specimen, Anna University 2019, Reverse List, Loop Detection, Malformed Diagram).
  3. Author `shared/src/schemas/` with strict Zod schemas for `LinkedListNode`, `LinkedListGraph`, `ExecutionStep`, and `ValidationError`.
  4. Scaffold monorepo workspace (`server`, `client`, `shared`, `.agents/skills`).
  5. Configure environment variables template (`.env.example`) with Cloudinary and database keys.
- **Exit Criteria**:
  - `npm test` runs schema and invariant checks against all test fixtures with 100% pass rate.
  - Development servers for frontend and backend boot cleanly without dependency errors.

---

### Phase 1 — Cloudinary Media Pipeline (3–5 hours) [MVP Core]
- **Objective**: Build a resilient, signed media ingestion gateway that processes real-world paper scans without degradation.
- **Deliverables**:
  1. Server endpoint `POST /api/uploads/signature` generating restricted Cloudinary upload signatures.
  2. Client `MediaUploader` component supporting drag-and-drop, bounding-box crop selection, and immediate preview.
  3. Cloudinary URL transformation pipeline:
     - Deskew and contrast enhancement (`e_sharpen:80,e_contrast`) for low-light smartphone photos of notes.
     - Responsive preview delivery (`f_auto,q_auto`).
     - Bounding box extraction (`c_crop,x_<x>,y_<y>,w_<w>,h_<h>`).
  4. Blur and unreadable image detection hook: reject images failing threshold before triggering downstream AI calls.
- **Exit Criteria**:
  - Successfully upload a photo of a handwritten linked list, apply sharpening, and extract a crisp cropped preview card within 2.5 seconds.

---

### Phase 2 — Interactive Concept Engine (4–6 hours) [MVP Core]
- **Objective**: Develop the deterministic visualization and state machine engine that animates data structure operations step-by-step.
- **Deliverables**:
  1. Deterministic step generator in `server/src/services/stepEngine.ts`:
     - `insertHead(graph, value)`
     - `insertTail(graph, value)`
     - `deleteNode(graph, targetId)`
     - `reverseList(graph)`
     - `search(graph, targetValue)`
  2. SVG/Canvas reactive rendering component in `client/src/components/InteractiveCanvas.tsx`:
     - Animated node boxes with distinct data and pointer partitions.
     - Dynamic cubic bezier curves for pointer arrows.
     - Pointer rewiring transitions with active highlight pulses.
  3. Playback control bar (`StepControls.tsx`):
     - Play, pause, forward, back, reset, playback rate control (0.5x, 1x, 2x).
     - Keyboard shortcuts: `Space` (toggle play), `ArrowRight` (step), `ArrowLeft` (back), `R` (reset).
  4. Real-time Memory / Pointer Inspector (`StateInspector.tsx`) tracking variable references (`head`, `current`, `temp`, `newNode`) at every tick.
- **Exit Criteria**:
  - Stepping through a 4-node linked list reversal produces identical, mathematically verified pointer transitions every time.
  - Zero dropped frames during pointer rewiring on modern browsers.

---

### Phase 3 — AI-Assisted Interpretation & Validation Gate (4–6 hours) [MVP Core]
- **Objective**: Ingest cropped diagram media, infer the structured graph, and enforce validation gates with human-in-the-loop correction.
- **Deliverables**:
  1. Server endpoint `POST /api/diagrams/interpret` combining vision prompt with Zod schema validation.
  2. Validation Gate (`validationService.ts`):
     - Floyd’s Cycle Detection algorithm to prevent infinite loops.
     - Head pointer verification and reachability analysis.
     - Dangling pointer detection (pointers pointing to non-existent node IDs).
  3. Inline Correction Modal (`ValidationInspector.tsx`):
     - When confidence `< 0.80` or invariants fail, highlight ambiguous nodes in amber/red.
     - Allow student to edit node text, reassign the target arrow, or pick a supported template.
  4. Server endpoint `POST /api/diagrams/validate` for verifying user-corrected models.
- **Exit Criteria**:
  - Malformed fixture (e.g. `fixtures/malformed-cycle.json`) triggers the correction modal with explicit error descriptions instead of rendering a broken diagram.

---

### Phase 4 — PYQ Intelligence (1–2 weeks / MVP Slice)
- **Objective**: Link real-world board and university question papers to the interactive visualizer.
- **Deliverables**:
  1. Curated Question Bank schema (`shared/src/schemas/pyq.ts`):
     - ISC Class XII Computer Science 2025 Specimen — Question 11 (Linked List Pointer Modification).
     - Anna University November/December 2019 — CP5151 Advanced Data Structures.
  2. Server endpoint `GET /api/pyqs` with search and topic filters.
  3. Split-screen PYQ Drawer in the client:
     - Left pane: High-resolution Cloudinary crop of the original question paper with page number, year, and marks.
     - Right pane: "Practice in Sandbox" button that loads the exact starting linked list from the question.
- **Exit Criteria**:
  - Student selects ISC Question 11 and can immediately step through the exact pointer mutation required by the marking scheme.

---

### Phase 5 — Inclusive Learning & Indian Sign Language (1–2 weeks / MVP Slice)
- **Objective**: Provide certified, accessible learning paths for deaf and visually impaired students.
- **Deliverables**:
  1. Indian Sign Language (ISL) Player (`ISLPlayer.tsx`):
     - Reviewed video clips demonstrating "Linked List Concept" and "Inserting at Head".
     - Synchronized WebVTT caption tracks.
     - Interactive transcript panel enabling keyword jump navigation.
  2. Screen Reader Live Region (`LiveAnnouncer.tsx`):
     - Centralized `aria-live="polite"` region announcing all pointer movements and state transitions.
     - Critical alerts announced with `aria-live="assertive"`.
  3. High-Contrast & Reduced-Motion Modes:
     - Pure high-contrast color scheme adhering to WCAG 2.2 AAA (7:1 minimum contrast).
     - Full respect of `@media (prefers-reduced-motion: reduce)`.
- **Exit Criteria**:
  - Complete navigation and full understanding of the insertion operation using only keyboard and screen reader announcements.

---

### Phase 6 — Personalized Practice & Diagnostics (Post-Hackathon Weeks 3–4)
- **Objective**: Tailor learning journeys based on individual student misconceptions.
- **Deliverables**:
  1. Micro-diagnostic probes testing pointer prerequisites before advanced operations.
  2. 3-tiered hint hierarchy (Conceptual Clue ➔ Pointer Pseudocode ➔ Full Solution).
  3. Mistake revision queue: automatically enqueue questions where student made incorrect pointer assignments.
  4. Mastery tracking dashboard backed by actual attempt history.

---

### Phase 7 — Multi-Structure Expansion & Evaluation (Post-Hackathon Weeks 5–6)
- **Objective**: Generalize the concept engine to additional DSA topics and benchmark accuracy.
- **Deliverables**:
  1. Expand engine to Binary Search Trees (BST), Stacks, Queues, and Directed Graphs.
  2. Build an automated benchmark evaluation suite running against 100+ real-world student diagrams.
  3. Publish calibrated accuracy and error recovery metrics.

---

## Hackathon MVP: The Vertical Slice Checklist

To ensure a flawless live demo during the hackathon, this vertical slice must be fully functional:

- [x] Upload diagram via Cloudinary signed authorization.
- [x] Display original high-res paper scan and cropped preview side-by-side.
- [x] Interpret diagram into typed linked-list model.
- [x] Pass through Validation Gate (Floyd cycle check & pointer integrity).
- [x] Trigger Human-in-the-Loop correction when an ambiguous label is tested.
- [x] Render deterministic step-by-step animation of pointer rewiring.
- [x] Connect at least one real-world PYQ (ISC 2025 Specimen Q11).
- [x] Provide full keyboard operability and polite ARIA live region announcements.
- [x] Embed reviewed Indian Sign Language (ISL) explanation clip with captions.

---

## Testing Strategy & Benchmark Dataset

### Automated Test Pyramid
1. **Unit Tests (`server/tests/unit`)**:
   - `FloydCycleTest`: Validates detection of cycles in cyclic fixtures and acceptance in acyclic fixtures.
   - `StepEngineTest`: Asserts that `insertHead` correctly updates `head` pointer to new node and sets `newNode.next` to old head.
   - `ZodSchemaTest`: Verifies that malformed payloads reject with clean field errors.
2. **Integration Tests (`server/tests/integration`)**:
   - Cloudinary upload signature generation.
   - End-to-end `/api/diagrams/interpret` with validation fallback.
3. **Accessibility Audits**:
   - Keyboard tab sequence validation across all interactive controls.
   - Zero color contrast violations under WCAG 2.2 AAA inspection.

### Benchmark Fixtures Included in Repository
1. `fixtures/isc-2025-q11.json`: ISC Class XII Computer Science 2025 Specimen Question 11.
2. `fixtures/anna-univ-2019.json`: Anna University November 2019 CP5151 singly linked list.
3. `fixtures/reverse-linked-list.json`: 4-node singly linked list with reversal sequence.
4. `fixtures/malformed-cycle.json`: Erroneous graph containing an unannounced cycle (tests Gate 05).
5. `fixtures/ambiguous-label.json`: Diagram with low-confidence OCR label (tests Gate 06 Human Correction).

---

## Notion Documentation Roadmap (10 Core Pages)

The team will maintain these 10 comprehensive Notion pages for documentation and evaluation:

1. **Product Vision & Problem Statement**: Overview of the educational barrier in computer science education and why visual validation matters.
2. **User Research & Evidence**: Interviews with board exam candidates and educators on pointer arithmetic difficulties.
3. **Feature Prioritization & Scope Decisions**: Rationalization for focusing on singly linked lists first and building reliability gates.
4. **Architecture & Pipeline Diagrams**: Complete MERN + T3 + Cloudinary system architecture and state machine diagrams.
5. **Cloudinary Integration**: Signed upload workflows, transformation recipes (`e_sharpen`, `c_crop`), and bandwidth optimization data.
6. **AI Schema, Validation Invariants & Failure Modes**: Complete Zod schema specification and mathematical invariant proofs.
7. **Testing Results & Benchmark Data**: Run results from the 5-10 benchmark fixtures with latency and accuracy stats.
8. **Accessibility & ISL Content Review**: WCAG 2.2 AAA audit report, certified ISL sign language verification notes, and transcript logs.
9. **Development Journal & Engineering Decisions**: Day-by-day log of architectural trade-offs, bugs encountered, and solutions implemented.
10. **Demo Script & Deployment Guide**: Step-by-step walkthrough for competition judges, environment setup instructions, and known limitations.
