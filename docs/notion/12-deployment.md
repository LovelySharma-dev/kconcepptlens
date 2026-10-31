# 12. Deployment and Environment Configuration

## Production blueprint

| Item | Value |
| :--- | :--- |
| Host | Render Web Service |
| Config | `render.yaml` |
| Build | `npm install && npm run build` |
| Start | `npm run start --workspace=server` |
| Health | `/api/health` |
| Documented URL | https://conceptlens-58cq.onrender.com/ |

Express serves API and production `client/dist` with SPA fallback (commit `19c4dfc`, 25 Oct).

---

## Environment variables (names only)

Copy from `.env.example`. **Do not publish values.**

| Variable | Role | Client-safe? |
| :--- | :--- | :---: |
| `PORT` | API port | n/a |
| `NODE_ENV` | Mode | n/a |
| `CLIENT_ORIGIN` | CORS allowlist | n/a |
| `MONGODB_URI` | Persistence (optional) | No |
| `CLOUDINARY_CLOUD_NAME` | Cloud id | Public-ish; prefer server |
| `CLOUDINARY_API_KEY` | Upload key | Returned in signatures; not secret |
| `CLOUDINARY_API_SECRET` | Signing | **Never client / Notion** |
| `CLOUDINARY_UPLOAD_PRESET` | Preset name | Careful |
| `GEMINI_API_KEY` | Lesson/vision AI | **Never client** |
| `GEMINI_MODEL` | Model id | Ok to discuss |
| `HF_TOKEN` / `HF_MODEL` / `HF_BASE_URL` | HF fallback | Token **never client** |
| `AI_PROVIDER` / `AI_TIMEOUT_MS` | Provider policy | Ok |
| `VITE_API_URL` | Dev API hint | Dev only |
| `VITE_CLOUDINARY_CLOUD_NAME` | Optional public delivery | No secret |

`render.yaml` marks Cloudinary, Mongo, Gemini, `CLIENT_ORIGIN` as `sync: false` (dashboard secrets).

---

## Local vs production matrix (30 Oct documentation)

| Capability | Local (configured) | Render (as of README 30 Oct note) |
| :--- | :--- | :--- |
| App shell / Learn / Practice | Yes | Live URL documented |
| `/api/health` | Yes | Expected live |
| Cloudinary signed upload | Depends on matching cloud/key | Reported **not configured** |
| `/api/uploads/learning-media` | Implemented in code | Reported **404 / missing** |
| Mongo | Optional memory fallback | Depends on dashboard URI |

> Callout (Warning): Always re-hit `/api/uploads/status` before a judge demo claiming live transforms.

---

## CI

`.github/workflows/ci.yml` on push/PR to main: `npm ci`, Python deps, `npm test`, fixtures, benchmark, build. Oct 30 commit added extension/Python emphasis in validation workflow messaging.

---

## Security checklist before publishing Notion pages

- [ ] No `.env` contents  
- [ ] No pasted signatures  
- [ ] No API secrets in screenshots  
- [ ] Rotate Cloudinary secret if it was ever shared in chat logs  
