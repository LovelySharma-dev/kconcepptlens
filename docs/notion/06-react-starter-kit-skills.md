# 6. React Starter Kit and Skills Pack

## Verdict (read this first)

| Artifact | Installed in repo? | Executed as project scaffold? | Adapted into ConceptLens? |
| :--- | :---: | :---: | :---: |
| **Cloudinary Skills Pack** (`.agents/skills/cloudinary-*`) | Yes (first in git on **24 Oct 2026** initialize commit) | Used as agent guidance during implementation | Yes — signed upload, transforms, React SDK patterns |
| **`create-cloudinary-react` CLI starter** | **No** — not present in `package-lock.json` / workspaces | **No** — did not generate this monorepo | **Partial** — same client packages (`@cloudinary/react`, `@cloudinary/url-gen`) as the kit uses |
| **`next-cloudinary` / Next.js skill** | Skill folder present (`cloudinary-next`) | Not as app framework | Reference only |
| **create-t3-app** | No | No | T3-style Zod shared contracts only |
| **Create React App** | No | No | Vite chosen instead |

> Callout (Warning): Do **not** tell judges the React Starter Kit “built” ConceptLens. README states explicitly: *That kit was not used to generate ConceptLens.*

---

## Skills Pack inventory

First recorded in commit `5464ffe` (2026-10-24): *“initialize ConceptLens 2.0 with … workspace skills …”*

### Cloudinary skills

| Skill folder | Purpose | Concrete use in product |
| :--- | :--- | :--- |
| `cloudinary-media-pipeline` | Signed upload, preserve original, MIME gates, crop/sharpen | `generateUploadSignature`, upload routes, plant-cell variants |
| `cloudinary-react` | Vite-default React SDK patterns, AdvancedImage, signed uploads, TS pitfalls | Client delivery + Media Studio; rules-only setup without CLI |
| `cloudinary-transformations` | NL→URL, video/AI transforms, debugging | `cloudinaryTransformationService.ts` + docs |
| `cloudinary-docs` | llms.txt lookup | Keep APIs current |
| `cloudinary-next` | Next App Router / `next-cloudinary` | **Not adopted** — Express+Vite already owns API |

### Product skills (non-Cloudinary)

| Skill | Purpose |
| :--- | :--- |
| `mern-t3-architecture` | Monorepo layout, Zod-once, Express validation |
| `concept-engine-validation` | 8-stage pipeline, Floyd, HITL |
| `inclusive-learning-isl` | Keyboard, live regions, ISL ethics |
| `pyq-intelligence` | Exam metadata without false provenance |

---

## Why not run `npx create-cloudinary-react`?

Evidence-based reasons (README §9 + monorepo reality):

1. The CLI scaffolds a **separate** React 19 + Vite app — ConceptLens already had React 18 + Express workspaces.  
2. Kit setup often writes **cloud name into client `.env`**. ConceptLens keeps Media Lab delivery behind the Express proxy for the plant-cell path.  
3. Product needs **signed** uploads and status honesty, not an unsigned preset demo as the default.  
4. `next-cloudinary` would force a second framework.

**What we took instead:** the skill’s “rules-only / without CLI” path — install official packages, build a reusable config, sign on the server.

---

## Package evidence

From `client/package.json`:

```json
"@cloudinary/react": "^1.14.4",
"@cloudinary/url-gen": "^1.22.0"
```

From `server/package.json`:

```json
"cloudinary": "^2.4.0"
```

Search for `create-cloudinary-react` in lockfile: **no matches** (documentation pass).

---

## How skills changed engineering behavior

| Guidance from skills | Observable outcome |
| :--- | :--- |
| Never expose API secret | Secret only in server env; status tests; README checks |
| Pre-upload MIME/size validation | `inspectDirectUpload` |
| Slash-delimited `f_auto`/`q_auto` | Transformation builder + integration doc |
| Honest fallback | Status badge / blocked account messaging |
| ISL: no synthetic signing | Empty verified catalog + tests |

---

## Related

- [[Cloudinary Integration Deep Dive]]  
- [[AI-Assisted Development and Prompt Experiments]]  
- [[Architecture and Technology Decisions]]  
