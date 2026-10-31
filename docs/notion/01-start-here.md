# 1. Start Here

## Who this workspace is for

| Reader | Start with | Then |
| :--- | :--- | :--- |
| **Judge (3–5 min)** | Parent homepage status strip → Demo Video | Cloudinary Deep Dive (30% rubric) |
| **Developer** | Architecture → Testing | Cloudinary + Skills Pack |
| **Accessibility advocate** | Accessibility and WCAG 2.2 | Features (themes, Voice Guide, ISL foundation) |
| **Educator** | Vision → Product Features | OCR / Practice workflows |
| **Collaborator** | Development Journey → Roadmap | References |

---

## Quick facts (verified against repo manifests)

| Layer | Technology | Evidence |
| :--- | :--- | :--- |
| Client | React 18.3, TypeScript, Vite 5.4, Lucide, Three.js | `client/package.json` |
| Cloudinary client SDKs | `@cloudinary/react` ^1.14.4, `@cloudinary/url-gen` ^1.22.0 | `client/package.json` |
| Server | Express 4.19, TypeScript, Helmet, Morgan, CORS, Mongoose 8, Zod, `cloudinary` ^2.4.0, `tesseract.js` ^7 | `server/package.json` |
| Shared contracts | Zod schemas in `@conceptlens/shared` | `shared/` |
| Extension | Chrome Manifest V3 | `extension/` |
| Python | FastAPI + pytest invariants | `python/`, root `test:py` script |
| Hosting blueprint | Render single web service | `render.yaml` |

---

## How to run locally (summary)

```bash
npm run install:all
# Copy .env.example → .env (fill server-side secrets only)
npm run dev
```

- Client: http://localhost:5173 (Vite proxies `/api`)  
- API health: `GET /api/health`  
- Full guidance: repository `README.md` §10  

> Callout (Warning): Never put `CLOUDINARY_API_SECRET`, `GEMINI_API_KEY`, or `HF_TOKEN` in `VITE_` variables or in Notion.

---

## Reading order for a careful review

1. Vision (why)  
2. Development Journey (when — calendar vs git)  
3. Features (what)  
4. Cloudinary + Skills (media rubric)  
5. Accessibility (honest WCAG table)  
6. Testing + Deployment (limits)  
7. Demo walkthrough (show, don’t claim)

---

## Companion documents in the repo

| Doc | Role |
| :--- | :--- |
| `finale.md` | Compact A–Z judge handout |
| `HACKDAYS_NOTION.md` | Nine-day Hack Days log (17–25 Oct) |
| `NOTION_DOCUMENTATION.md` | Earlier pitch / submission kit |
| `PRD.md` | Product requirements (finale scope vs vision) |
| `docs/cloudinary-integration.md` | Media pipeline inventory |
| `docs/ISL_EVALUATION_AND_INTEGRATION.md` | ISL ethics policy |
