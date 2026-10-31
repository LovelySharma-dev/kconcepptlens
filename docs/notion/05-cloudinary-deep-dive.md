# 5. Cloudinary Integration Deep Dive

> Callout (Success): This page is the primary **30% rubric** case study.  
> Callout (Warning): Never paste API secrets, raw signatures, or `.env` values into Notion.  
> Callout (Info): Repo source of truth for what ships today: [`docs/CLOUDINARY-COMPLETE-USAGE.md`](../CLOUDINARY-COMPLETE-USAGE.md). Plant-cell `/learning-media` notes below are **historical** unless that route is re-added.

## Why media delivery matters to the product

Textbook captures are large, glare-heavy, and format-chaotic. ConceptLens needs:

1. **Clarity** — sharpen/contrast so faint diagram lines remain readable.  
2. **Bandwidth fairness** — width caps and `q_auto` / low-data tiers for school networks.  
3. **Pedagogy** — different *views* of one asset (Explore whole cell vs Focus chloroplast) without re-uploading.  
4. **Trust** — if the account check fails, say so; do not fake a successful upload.

---

## Architecture

```
Browser (React) 
  → POST /api/uploads/signature  → Express signs with API secret
  → Direct upload to api.cloudinary.com  (or POST /api/uploads/direct proxy)
  → Delivery URLs via res.cloudinary.com with slash-delimited transforms
Learning Media Lab
  → GET /api/uploads/learning-media → four URLs for one public_id
```

| Piece | Path | Role |
| :--- | :--- | :--- |
| Config + signature + MIME gates | `server/src/config/cloudinary.ts` | HMAC sign; reject bad uploads early |
| Routes | `server/src/routes/uploads.ts` | `/status`, `/signature`, `/direct`, `/transform`, `/learning-media` |
| NL → transform builder | `server/src/services/cloudinaryTransformationService.ts` | Spec → URL |
| Plant-cell variants | `server/src/services/learningMedia.ts` | Original / Explore / Focus / Low data |
| Zod transform schema | `shared/src/schemas/cloudinaryTransformation.ts` | Profiles & enums |
| Media Studio UI | `client/src/components/cloudinary/CloudinaryMediaStudio.tsx` | Slider, status, operations |
| Client SDKs | `@cloudinary/react`, `@cloudinary/url-gen` | Public diagram delivery helpers |
| Tests | `server/tests/cloudinaryTransformation.test.ts`, `learningMedia.test.ts` | URL/builder/safety |

Node SDK: `cloudinary` ^2.4.0 (`server/package.json`).

---

## Project asset: plant-cell illustration

| Item | Value |
| :--- | :--- |
| Public ID | `conceptlens/learning/plant-cell-illustration` |
| Local source | `client/public/media/plant-cell-illustration.png` |
| Ensure upload helper | `ensurePlantCellAsset()` in `learningMedia.ts` |
| Focus crop box | `x:470 y:90 w:310 h:210` (chloroplast + label) |

### Delivery variants (implemented in code)

| Id | Transform | Purpose |
| :--- | :--- | :--- |
| original | none | Stored illustration |
| explore | `c_limit,w_960/f_auto/q_auto` | Lesson column fit |
| focus | `c_crop,.../c_limit,w_640/f_auto/q_auto` | Chloroplast ROI |
| low-data | `c_limit,w_320/f_auto/q_auto:low` | Metered networks |

README notes (local): for this PNG, deliveries returned `image/png`; `f_auto` did not convert that asset to WebP in the recorded check. Public `demo` cloud is **not** substituted as evidence of the project account when the account is unavailable.

---

## Upload and delivery flow

1. Pre-validate MIME (`png/jpeg/webp/pdf/mp4/webm`) and size (15MB image / 30MB video) — `inspectDirectUpload`.  
2. Request signature (`folder` typically `conceptlens/uploads`).  
3. Client uploads with `api_key`, `timestamp`, `signature` — **never** the secret.  
4. Optional transform endpoint builds educational URLs.  
5. Status endpoint reports configuration + account reachability.

Unsigned learner uploads are **not** the product default (integration docs).

---

## Transformations used and educational purpose

| Tag / pattern | Purpose |
| :--- | :--- |
| `f_auto` / `q_auto` | Format/quality negotiation |
| `e_sharpen:80` / `e_contrast` | Scan/diagram clarity |
| `c_limit,w_*` | Cap megapixel phone dumps |
| `c_crop` / focus ROI | Directed attention in lessons |
| `q_auto:low` / eco-style low-data | Bandwidth saver |
| Video: `vc_auto`, trim `so_0,du_5`, poster frames | Media Studio video paths (see `docs/cloudinary-integration.md`) |
| AI ops (`e_auto_enhance`, background removal, gen fill) | Available in studio/docs with educational safeguards for scientific diagrams — treat credit costs as documented estimates |

---

## Failure handling

| Condition | Expected behavior |
| :--- | :--- |
| Missing credentials | Local / honest demo mode; no false upload success |
| `cloud_name mismatch` | Status reports failure; uploads gated (logged 25 Oct in Notion docs) |
| Render without Cloudinary env | README **30 Oct**: learning-media route 404 / status not configured |
| Network upload failure | Retry guidance in media-pipeline skill; surface error in UI |

---

## Security and environment

Required **server** vars (from `.env.example`):

- `CLOUDINARY_CLOUD_NAME`  
- `CLOUDINARY_API_KEY`  
- `CLOUDINARY_API_SECRET`  
- `CLOUDINARY_UPLOAD_PRESET`  

Optional client: `VITE_CLOUDINARY_CLOUD_NAME` for public delivery only — **never** the secret. Media Lab plant-cell path prefers Express proxy so project cloud name need not live in the browser bundle (README §9).

`render.yaml` declares Cloudinary keys as `sync: false` host dashboard secrets.

---

## Performance measurements

| Claim | Evidence status |
| :--- | :--- |
| Public `demo/sample` HTTP 200 with transform chain | Documented in submission Notion log (25 Oct) |
| ~72% bandwidth reduction (eco) | Estimated in `docs/cloudinary-integration.md` — treat as estimate |
| Plant-cell PNG variant responses | README local notes |
| Live Render learning-media | **Not verified** as working on 30 Oct README check |

Re-measure before judge day if quoting exact bytes.

---

## Remaining opportunities

1. Inject Cloudinary env on Render and verify `/api/uploads/learning-media`.  
2. Align cloud name with API key ownership; rotate secret if ever exposed.  
3. Expand curated educational public IDs beyond plant-cell.  
4. Keep generative AI transforms off unconfirmed scientific diagrams.  
5. Record before/after bandwidth screenshots for the gallery.

---

## Related pages

- [[React Starter Kit and Skills Pack]] — how skills guided this work  
- [[Deployment and Environment Configuration]] — local vs production  
- [[Testing, Verification and Known Issues]] — transformation tests  
