# ConceptLens — 4-Minute Judging Walkthrough Script

**Product:** ConceptLens · The Living Atlas  
**Tagline:** *From Your Textbook to an Experience You Can Explore.*  
**Runtime:** **4:00** (240 seconds)  
**Live shell:** https://conceptlens-58cq.onrender.com/  
**Preferred demo:** local `npm run dev` so Cloudinary status and Media Studio are under your control  
**Full Cloudinary reference:** [CLOUDINARY-COMPLETE-USAGE.md](./CLOUDINARY-COMPLETE-USAGE.md)

---

## Prep (before the clock)

1. Chrome or Edge open; zoom 100–110%.
2. `npm run dev` healthy — API `GET /api/health` and `GET /api/uploads/status` checked.
3. Tabs ready: **Home**, **Learn** (animal cell), **Cloudinary** (`[4]`), **Practice** optional.
4. Read the Cloudinary badge once. If signed upload is blocked, plan to say that honestly and demo **demo** delivery transforms.
5. Do **not** invent a successful upload, a plant-cell learning-media lab, or ISL video if those are not live.

**One-line opener (memorize):**  
“ConceptLens turns textbook friction into something you can explore—and we refuse to teach a structure we cannot prove.”

---

## Beat sheet

| Time | Beat | On screen | You say (approx.) |
| :---: | :--- | :--- | :--- |
| **0:00–0:25** | Hook | Home hero, light Living Atlas | §1 |
| **0:25–1:20** | Proof | Signature linked-list lesson | §2 |
| **1:20–2:00** | Learn | Animal cell / 2D↔3D | §3 |
| **2:00–3:15** | Cloudinary (30%) | Media Studio `[4]` | §4 |
| **3:15–3:40** | Inclusive choice | Preferences / Easy Read or Focus | §5 |
| **3:40–4:00** | Close | About or Home tagline | §6 |

---

## §1 — Hook (0:00 – 0:25)

**Do:** Land on Home. Point at the headline. Do not click yet.

**Say:**

> “Hello — this is ConceptLens, The Living Atlas.  
> STEM students still rebuild 3D biology and pointer dynamics from flat ink.  
> Chatbots can invent structures. We researched how attention, reading load, sensory, and bandwidth needs get left behind—then built a browser app that adapts presentation by **choice**, not diagnosis.  
> Tagline: *From Your Textbook to an Experience You Can Explore.*”

---

## §2 — Prove before you teach (0:25 – 1:20)

**Do:** On the home signature lesson:

1. **Watch the reversal** — show `prev` / `curr` / `next` from server steps.  
2. **Break the structure** — cycle 10 → 20 → 30 → 40 → 20.  
3. Point at **Stopped**, **CYCLE** on the edge, polite status (not color alone).  
4. **Repair this pointer** — check passes; reversal can play again.

**Say:**

> “Our north star: we will not teach a structure we cannot prove.  
> A valid list reverses with real pointer steps from the server.  
> Break it into a cycle—Floyd’s check stops the lesson. Color isn’t the only signal.  
> Repair the edge, and learning continues. That fail-closed gate is the product, not a slide.”

---

## §3 — Spatial learning (1:20 – 2:00)

**Do:** Press **`[1]`** or open **Learn** → animal cell (or heart). Toggle **3D** and **2D** schematic. Optional: one organelle click + live announcement.

**Say:**

> “Learn opens curated biology—procedural Three.js models, not a 50-megabyte remote GLTF that dies on school Wi‑Fi.  
> If WebGL drops, the same lesson has a 2D SVG path.  
> Practice questions here are labeled **practice**, not official board papers.”

---

## §4 — Cloudinary Media Studio (2:00 – 3:15) ← longest beat

**Do:** Press **`[4]`**. Walk this sequence without rushing:

| Step | Action | Point at |
| :---: | :--- | :--- |
| A | Read status badge | Signed ready **or** blocked + reason |
| B | Images → optimized preset on `demo/sample` | URL path: `e_sharpen:80`, `e_contrast`, `/f_auto/q_auto` |
| C | Low-data / NL prompt *“Make a low-data version”* | `c_limit,w_480`, `q_auto:eco` |
| D | Split slider Left/Right (or drag) | Original vs transformed |
| E | AI tab briefly **or** Video 5s / poster | Credits label + safeguard if generative |
| F | (Only if badge allows) mention signed upload to `conceptlens/uploads` | Secret never in the browser |

**Say:**

> “Thirty percent of this build is a **meaningful** media pipeline—not a logo sticker.  
> Secrets stay on Express. The client asks for a **signature**, then uploads to folder `conceptlens/uploads`—or we fall back to a server proxy.  
> Delivery uses slash-delimited `f_auto` and `q_auto` so diagrams stay sharp without wasting megabytes.  
> Natural-language transforms go through Zod contracts: square crop, lesson card, diagram HQ, low-data.  
> Generative ops on scientific diagrams hit an **educational safeguard**—we don’t silently rewrite organelles.  
> *[If blocked:]* Account check failed—we say so. Public demo delivery still shows the transform story; we never fake a project-account upload.”

**Optional one-liner if time:** “Full inventory is in `docs/CLOUDINARY-COMPLETE-USAGE.md`.”

---

## §5 — Inclusive by choice (3:15 – 3:40)

**Do:** Open **Accessibility & Learning Settings**. Toggle **Easy Read** or **Focus** / **Low stimulation** once. Or press **`[H]`** for high contrast, then back.

**Say:**

> “Accessibility isn’t one toggle. Learners combine Focus, Easy Read, Simple Steps, low-stimulation, low-data—choices, not medical labels.  
> Voice Guide with **`[G]`** speaks only when you ask. We do **not** invent Indian Sign Language video.”

---

## §6 — Close (3:40 – 4:00)

**Do:** Return to Home or About. Show live URL or repo briefly.

**Say:**

> “ConceptLens: prove the structure, confirm the text, deliver media honestly, adapt by choice.  
> Live at conceptlens-58cq.onrender.com.  
> Thank you — questions welcome.”

---

## Timing drills

| If you are… | Cut first | Keep |
| :--- | :--- | :--- |
| **Over 4:00** | Heart/DNA aside; AI tab detail; About narrative | Linked-list proof + Cloudinary badge/URL/slider |
| **Under 3:30** | Add Practice confirm on `2x + 3 = 11` → Explain | Still end on Cloudinary honesty |
| **Cloudinary env dead on Render** | Demo entirely on local Media Studio | Say “live shell is up; CDN credentials are local for this check” |

---

## Spoken word count guide

Aim for **~130–150 words per minute** with pauses on UI. Full script above is ~520 words of dialogue ≈ **3:45–4:00** with clicks. Practice once with a phone timer.

---

## Honesty checklist (say only what is true today)

- [ ] Linked-list cycle stops playback  
- [ ] Cloudinary badge matches `/api/uploads/status`  
- [ ] Demo transforms shown as **demo** unless project account is reachable  
- [ ] No claim of plant-cell `/learning-media` unless that route exists and returns 200  
- [ ] No formal WCAG claim; no synthetic ISL; practice ≠ official papers  
