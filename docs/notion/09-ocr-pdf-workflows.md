# 9. OCR, PDF Processing and Learning Workflows

## Design rule

**Confirm before explain.** Extracted text is shown to the learner for review. The signature linked-list lesson does **not** invent a graph from a photograph.

---

## Inputs accepted (Practice / materials path)

| Input | Behavior | Limits |
| :--- | :--- | :--- |
| Paste / type | Character counters; samples | — |
| PDF with text layer | Parsed (pypdfium2 / materials path per README) | Password-protected → failure; &gt;20k chars truncated with notice; compressed bytes not treated as document text |
| PDF without text layer | Prompt local OCR reader path | Not silent invention |
| Image (PNG/JPEG/WEBP) | Local Tesseract when worker ready | Handwriting largely out of scope |
| Camera | WebRTC snapshot; tracks stopped on close | Photo not auto-turned into linked list |
| Speech dictation | Web Speech API | Browser-dependent |

Key files: `PracticeWorkspace.tsx`, `MediaUploader.tsx`, `server/src/services/pageOcr.ts`, `shared/src/learning/materials.ts`, `server/src/routes/materials.ts`.

---

## OCR confidence gate

When OCR confidence is **&lt; 0.80**, the reliability pipeline routes to **human review** rather than trusting labels (PRD Gate 06; validation tests).

Blur detection evidence exists in Python suite (`test_ocr_blur_detector_sharp_vs_blank` — Laplacian variance noted in README).

---

## After confirmation: learning workflows

1. **Rule-based explanation** — linear equations (`2x + 3 = 11` → `x = 4`), chemical balance, PEMDAS.  
2. **Practice check** — answers not trusted from client alone for grading security (README).  
3. **Representations** — Standard / Easy Read / Simple Steps / flashcards / quiz / notes where Learn workspace applies.  
4. **Adaptive suggestions** — deterministic rules (e.g. suggest simpler stored explanation after repeated incorrect answers) — **no diagnosis fields**.

Optional Python evidence file can agree on the mathematics sample; it is **not** a trained model (`README.md`).

---

## Cloudinary’s role in this workflow

- Optional: upload scans for sharpen/contrast/crop **before** interpretation.  
- Learning Media Lab variants are **illustrations**, not OCR sources for the pointer lesson.  
- Failures surface as status errors, not silent success.

---

## Known issues

| Issue | Status |
| :--- | :--- |
| Arbitrary cursive handwriting | Out of scope |
| Multi-page PDF targeting | Single-page / select page constraints (PRD/README) |
| Live OCR on every deploy | Depends on local Tesseract readiness |
| Password PDF | Test coverage present (`passwordPdf.test.ts`) — expect explicit failure |
