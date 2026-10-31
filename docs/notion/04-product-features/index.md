# 4. Product Features and User Journeys

> Callout (Info): Status legend — **Implemented** (code + usually tests) · **Partial** · **Unavailable** · **Planned**. Preferences are choices, not diagnoses.

## Feature gallery (Notion: Gallery or Table)

| Feature | Status | What it does | Why it exists | Primary files | Helps |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Signature Pointer Lie lesson | Implemented | 4-node reverse; break cycle → stop → repair | Prove structure before teaching | `PointerLieLesson.tsx`, `pointerLie.test.ts` | CS learners |
| Reliability gates | Implemented | 8-stage pipeline UI for diagrams | Catch invalid graphs | `validationService.ts`, `stepEngine.ts` | CS / educators |
| Learn workspace | Implemented | NL topic + 7 representations | Same concept, different load | `LearnWorkspace.tsx`, `/api/ai` | Dyslexia, ADHD, general |
| Biology Living Atlas | Implemented | Cell, heart, DNA, neuron, plant | Spatial STEM without heavy `.gltf` dependency | `BiologyWorkspace.tsx`, `biology/2d/*` | Visual STEM |
| Physics lab | Implemented | Thin lens, pendulum | Dynamic physics | Physics studio + schemas | General |
| Practice workspace | Implemented | Paste, PDF text, camera, speech → confirm → explain | Own materials, checked | `PracticeWorkspace.tsx`, `materials.ts` | General, dyslexia |
| Rule solvers | Implemented | Linear eq, PEMDAS, chem balance | Deterministic steps | `shared/.../materials.ts`, python evidence | STEM |
| Cloudinary Media Studio | Implemented | Upload/status, transforms, slider | Educational media rubric | `CloudinaryMediaStudio.tsx`, `uploads.ts` | Low data / clarity |
| Learning Media Lab | Implemented (local) | Original/Explore/Focus/Low-data | Meaningful Cloudinary variants | `learningMedia.ts`, `LearningMediaLab.tsx` | Low data, focus |
| ADHD dashboard | Implemented | Timer states + study plan | Sustained attention UI | `ADHDLearningDashboard.tsx` | ADHD/focus |
| Accessibility themes | Implemented | ~18 combinable modes | Inclusive presentation | `preferences.ts`, `LearningLens.tsx` | Many needs |
| Voice Guide | Implemented | Tours, task help, read aloud, navigate | Nonvisual orientation | `VoiceGuide.tsx`, `speechBus.ts` | Blind/low vision, listen |
| Focus ruler | Implemented | Reading aperture; scroll preserved | Focus mode without trapping scroll | `FocusRuler.tsx` | ADHD |
| ISL foundation | Partial | Schema, player, empty catalog, ISLRTC fallback | Ethics: no fake signing | `islLessons.ts`, `ISLVideoPanel.tsx` | Deaf/HoH (foundation) |
| PYQ drawer | Implemented | Curated exam-style bank | Exam relevance without false provenance | `pyqs` routes, schemas | Exam prep |
| Chrome extension | Implemented | MV3 Shadow DOM assist | Learning beyond our domain | `extension/` | Dyslexia, focus |
| AI lesson providers | Partial | Gemini → HF → deterministic | Continuity when APIs absent | `aiProviderService.ts` | General |
| WebXR / live voice tutor | Planned | — | Roadmap v2.1 / v2.2 | README future | — |
| Verified ISL catalog videos | Unavailable | Catalog empty by design | Prevent harm | `islCatalog.test.ts` | — |

---

## User journeys

### Journey A — Prove a linked list (finale)

1. Open Home.  
2. Watch valid reversal; inspect `prev`/`curr`/`next`.  
3. Break structure → **Stopped** / **CYCLE**.  
4. Repair → continue.  
5. (Local) Open Explore / Focus / Low data plant-cell deliveries.

### Journey B — Confirm then explain

1. Practice / Start learning.  
2. Paste or load sample `2x + 3 = 11`.  
3. Confirm text.  
4. Explain → check `x = 4`.  
5. Switch Easy Read / Simple Steps without losing place (where wired).

### Journey C — Biology explore

1. Learn → animal cell (or heart/DNA/neuron/plant).  
2. Select organelle / structure.  
3. Read explanation; attempt practice item labeled practice.

### Journey D — Change how I learn

1. Open Accessibility & Learning Settings.  
2. Combine Focus, Easy Read, Dyslexia-friendly, Low data, etc.  
3. Reset clears modes, not the concept.

### Journey E — Media studio

1. Open Cloudinary tab.  
2. Read status badge (configured / blocked / demo).  
3. Compare original vs transformed delivery; keyboard slider where implemented.

---

## Continuity principle

Switching representations should preserve step/progress where the Learn workspace implements continuity (`LearnWorkspace.tsx`). Adaptive suggestions must not write diagnosis fields (README).
