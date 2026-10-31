# 2. Vision and Problem Statement

## Vision (wider product)

ConceptLens 2.0 aims to turn static study materials into interactive, deterministic lessons, connect them to exam-relevant practice, and offer multiple modalities—including reviewed Indian Sign Language when authentic video exists.

**Core philosophy (PRD):** Reliability before expansion. Every AI-assisted result should be validated against structural invariants, remain traceable to source media where applicable, and remain recoverable through human correction when confidence is low.

## What the finale actually demonstrates (PRD §1.1)

A learner meets one idea: a **singly linked list is taught only when the structure matches the lesson**. A four-node list reverses step by step. A cycle is refused by Floyd’s check; the closing edge is named; the learner repairs that edge before reversal continues. Under that lesson, on a **configured local runner**, one plant-cell illustration on the project Cloudinary account can be delivered as Explore, Focus, and Low data. Those pixels are not treated as a scan of the list.

> Callout (Warning): Reviewed ISL video, official past-paper claims, and measured learning gains are **outside** this demonstration.

---

## Problem statement (research framing, 17–18 October)

STEM concepts are spatial, dynamic, and temporal. Board and university learners face recurring failure modes:

| Failure mode | Description | ConceptLens response |
| :--- | :--- | :--- |
| Spatial blindness | Organelles, chambers, DNA grooves lose depth on paper | Interactive biology canvases (2D SVG; Three.js present in deps / documented paths) |
| Dynamic invisibility | Pointer rewiring and flow are temporal | Deterministic step engine + inspector |
| Exclusion | Deaf/HoH and nonvisual learners underserved by silent UIs | Themes, live regions, Voice Guide; ISL foundation without inventing signs |
| Fragile “AI magic” | Unvalidated vision invents structures | Catalog-first interpretation, Zod gates, Floyd refuse |
| Bandwidth failure | Heavy photos / remote `.gltf` fail on school networks | Cloudinary `f_auto`/`q_auto`/width caps; procedural or SVG lessons |

Sources: `README.md` §2–4, `HACKDAYS_NOTION.md` Day 17–18, `PRD.md` personas Rohit / Priya / Aryan.

---

## Inclusive-learning research takeaways (not clinical claims)

Work from 17–18 October treated “special learning needs” as **design constraints**, not diagnoses to store:

- **ADHD / focus** — focus ruler, timer states, Simple Steps, low stimulation  
- **Dyslexia / Easy Read** — spacing, plain-language stored alternatives, confirm-before-explain  
- **Deaf / hard of hearing** — visual-first lessons; **no synthetic ISL**  
- **Low vision / keyboard / motor** — high contrast, landmarks, 48px motor-friendly CSS targets  
- **Low data** — deferred media, Cloudinary low-data delivery  

Preferences are **combinable choices** (`shared/src/learning/preferences.ts`). Adaptive suggestions are deterministic rules without diagnosis fields (README feature table).

---

## Personas (PRD)

| Persona | Need | Finale-relevant path |
| :--- | :--- | :--- |
| Rohit (17), ISC CS | Visualize pointer mutations | Home Pointer Lie lesson + reliability gates |
| Priya (20), Deaf CS undergrad | Visual + signed explanations | Visual models + keyboard; ISL video **not** shipped as verified catalog |
| Aryan (19), PYQ practice | Exam-shaped problems | Curated practice bank labeled as practice |

---

## SDG alignment (aim, not endorsement)

Home narrative cites [SDG 4](https://sdgs.un.org/goals/goal4) and [SDG 10](https://sdgs.un.org/goals/goal10). ConceptLens is **not** a United Nations program and is **not** endorsed by the United Nations (`README.md`, `HACKDAYS_NOTION.md`).
