# 10. AI-Assisted Development and Prompt Experiments

> Callout (Info): Distinguish **(A) AI inside the product** from **(B) AI used to build the product**.

---

## A. AI inside ConceptLens (runtime)

### Provider chain (code)

Implemented in `server/src/services/aiProviderService.ts`:

1. **Primary:** Google Gemini — default model id from env `GEMINI_MODEL` or fallback `gemini-3.1-flash-lite`  
2. **Secondary:** Hugging Face Inference — default `Qwen/Qwen2.5-7B-Instruct` when `HF_TOKEN` set  
3. **Tertiary:** Deterministic / rule-based lesson builder when providers missing or failing  

Also: optional vision interpretation via Gemini for unmatched diagram uploads when `GEMINI_API_KEY` is set (`interpretationService` / README notes historically mention `gemini-1.5-flash` in places — **treat model id as env-driven; verify `.env.example` vs older README lines before quoting a single id to judges**).

| Claim | Evidence |
| :--- | :--- |
| Keys never in client bundle | Server-only env; redaction helpers in provider service |
| Lesson metadata records generation method | `generationMethod: 'gemini' \| 'huggingface' \| deterministic` paths in Learn UI |
| Catalog-first diagrams | Keyword/catalog match before live vision |

> Callout (Warning): Presence of code paths ≠ proof that a paid/live key was used in every demo. Without a logged API response in this doc pass, mark live Gemini/HF calls as **environment-dependent**.

---

## B. AI-assisted development (how the team built)

### Tools with repo evidence

| Tooling | Evidence of use | What it produced |
| :--- | :--- | :--- |
| **Cloudinary Skills Pack** | `.agents/skills/cloudinary-*` committed 24 Oct | Signed upload patterns, transform recipes, React SDK rules |
| **Product skills** | `mern-t3-architecture`, `concept-engine-validation`, `inclusive-learning-isl`, `pyq-intelligence` | Architecture and reliability conventions |
| **Cursor / coding agents** | This documentation workspace; extensive a11y/media modules; agent transcripts exist under the Cursor project folder | Implementation acceleration — **not** a substitute for tests |
| **`create-cloudinary-react`** | Investigated / documented; **CLI not executed** as scaffold | Same SDK packages adopted manually |

### Prompts that worked (reconstructed from outcomes + skills)

Successful patterns (outcomes verified in code/tests):

| Intent | Prompt shape (paraphrased) | Outcome | Verification |
| :--- | :--- | :--- | :--- |
| Secure uploads | “Sign Cloudinary uploads on Express; never put secret in Vite” | `generateUploadSignature`, status route | Transformation + upload validation tests |
| Fail closed lists | “Refuse cycles with Floyd; name the edge; don’t animate” | Pointer Lie + validation service | `pointerLie.test.ts` |
| Honest ISL | “Schema for ISL resources; empty catalog; no synthetic avatars” | Zod + empty catalog | `islIntegration.test.ts`, `islCatalog.test.ts` |
| Focus without trap | “Reading ruler must not block scroll with full-viewport shadow” | FocusRuler shades | `experienceRepair.test.ts` |
| Media pedagogy | “One plant-cell asset; Explore, Focus, Low-data URLs” | `learningMedia.ts` | `learningMedia.test.ts` |

### Approaches that failed or were rejected

| Approach | Why rejected | Evidence |
| :--- | :--- | :--- |
| “AI reads any textbook page into a lesson” | Too broad for reliable demo | Day 17 Hack Days log |
| Unsigned Cloudinary presets as default | Abuse / trust | Integration docs; signed default |
| Scaffold via `create-cloudinary-react` into monorepo | Separate app + client cloud env | README §9 |
| Synthetic ISL avatar / auto gloss | Harmful scientific signing | ISL evaluation doc + empty catalog |
| Claiming official past papers | Provenance risk | Practice labeling throughout |

### Unsuccessful / incomplete AI claims to avoid

- Quoting a single “337 tests forever” after the suite grows — **re-run**.  
- Claiming Next.js Cloudinary starter “integration” — skill present, framework unused.  
- Claiming formal WCAG certification from token tests alone.

---

## Prompt experiment template (for future Notion rows)

| Date | Prompt goal | Model/tool | Change set | Test command | Pass? | Notes |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| *add rows during demos* | | | | `npm test` | | |

---

## Related

- [[React Starter Kit and Skills Pack]]  
- [[Testing, Verification and Known Issues]]  
- [[Cloudinary Integration Deep Dive]]  
