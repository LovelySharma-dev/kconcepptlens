# 11. Testing, Verification and Known Issues

## Evidence register (Notion: Table database)

Suggested properties: ID, Area, Artifact, Date recorded, Environment (`local` | `CI` | `Render`), Result, Source doc, Notes.

### Historical recorded totals

| Date | Command | Result | Source |
| :--- | :--- | :--- | :--- |
| 2026-10-25 | `npm test` | **337 / 337 passed** | `README.md`, `NOTION_DOCUMENTATION.md`, `HACKDAYS_NOTION.md` |
| 2026-10-25 | `npm run test:py` | **6 passed** (times vary 0.62s–2.28s across notes) | Same |
| 2026-10-25 | `npm run build` | Clean ~2.94s; client gzip figures in README | Same |
| 2026-10-29 | Verification report | Local journeys + Cloudinary account checks described | `docs/final-verification-report.md` |
| 2026-10-30 | — | Suite files expanded (pointerLie, learningMedia, voiceGuide, …) | `server/package.json` test script |

> Callout (Warning): **Do not reuse 337 as a live badge** without re-running. After 30 Oct additions, the count may differ.

### Current server test entrypoints (from `server/package.json`)

`validation` · `aiValidation` · `learningExperience` · `cloudinaryTransformation` · `experienceRepair` · `scientificVisualizations` · `contrastDesignTokens` · `voiceGuide` · `islIntegration` · `pointerLie` · `learningMedia` · `modelPlacement` · `nonvisualNav` · `passwordPdf` · `plantCell3d` · `curriculumTranslation` · `islCatalog`

Also: extension tests (`npm run test:extension`), Python (`npm run test:py`), CI (`.github/workflows/ci.yml`).

---

## What key suites prove

| Suite | Proves |
| :--- | :--- |
| `pointerLie.test.ts` | Cycle refuse / repair path for signature lesson |
| `cloudinaryTransformation.test.ts` | URL builder / transform safety |
| `learningMedia.test.ts` | Plant-cell variant URL construction |
| `contrastDesignTokens.test.ts` | Token presence + sampled contrast ratios |
| `voiceGuide.test.ts` | Guide modes, tours, speech cleanup patterns (static) |
| `islIntegration` / `islCatalog` | Schema + **empty** verified catalog honesty |
| `nonvisualNav.test.ts` | Navigate mode / describeFocus / speech bus fail-closed |
| `experienceRepair.test.ts` | Focus mode scroll / ruler not blocking |
| Python invariants | Graph/OCR blur fixtures |

---

## Known issues (honest)

| Issue | Severity | Notes |
| :--- | :--- | :--- |
| Render Cloudinary learning-media unconfigured / 404 | High for 30% live demo | README 30 Oct check |
| Historical `cloud_name mismatch` | High for signed upload | Notion 25 Oct log |
| Formal WCAG audit absent | Medium | Explicit disclaimer |
| ISL videos not in catalog | Expected | Ethical choice |
| Keyboard modal PgUp/PgDn vs ruler `[`/`]` | Low | Docs mismatch |
| Assertive live region unused | Low | Implementation gap |
| Verification report vs Render URL narrative | Medium | Cross-check sources before slides |
| Uncommitted local changes may exist | Process | Run `git status` before claiming shipped |

---

## How judges should verify

```bash
npm run install:all
npm test
npm run test:py
npm run build
curl https://conceptlens-58cq.onrender.com/api/health
curl https://conceptlens-58cq.onrender.com/api/uploads/status
```

Compare local `/api/uploads/learning-media` only when Cloudinary env is set.
