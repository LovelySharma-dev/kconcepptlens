# 14. Roadmap and Remaining Work

## Near-term (unblock judges / production honesty)

| Item | Why | Depends on |
| :--- | :--- | :--- |
| Set Cloudinary env on Render; verify `/api/uploads/status` + learning-media | 30% rubric live proof | Dashboard secrets |
| Align `CLOUDINARY_CLOUD_NAME` with key-owning cloud | Signed upload | Cloudinary console |
| Re-run `npm test` and publish current count | Avoid stale 337 badge | CI |
| Fix keyboard help vs FocusRuler key mismatch | A11y accuracy | Docs + modal |
| Wire assertive live announcements | Cycle/upload alerts | `LiveAnnouncer` |
| Manual NVDA/VoiceOver pass on finale path | WCAG honesty | Time |

## Product backlog (documented planned)

| Version | Idea | Source |
| :--- | :--- | :--- |
| v2.1 | WebXR desk projection of organs | README / PRD future |
| v2.2 | Socratic voice tutor during exploration | README |
| v2.3 | Community diagram marketplace | README |
| When authentic video exists | Reviewed ISL clips + WebVTT sync | ISL evaluation doc |
| Always | Keep practice labeling; never invent official papers | Product rule |

## Explicit non-goals (for now)

- Synthetic sign-language avatars  
- Storing clinical diagnoses from preference toggles  
- Claiming measured learning-gain RCTs without study design  
- Shipping unsigned open upload presets for learner content  

---

## Definition of done for “Cloudinary complete” on production

1. `GET /api/uploads/status` → configured + account reachable.  
2. `GET /api/uploads/learning-media` returns four plant-cell URLs.  
3. Explore/Focus/Low-data HTTP 200 from `res.cloudinary.com`.  
4. Failed credential test still shows error (regression check).  
5. Screenshot evidence attached to Testing database (no secrets).  
