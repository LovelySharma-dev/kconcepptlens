# Indian Sign Language (ISL) Video Foundation & AI Translation Evaluation

**Platform:** ConceptLens / The Living Atlas  
**Alignment:** United Nations Sustainable Development Goal 4 (Quality Education — Targets 4.5 & 4.a)  
**Standard:** WCAG 2.2 AAA Accessibility for Deaf & Hard-of-Hearing Learners  
**Policy Date:** October 2026

---

## 1. Executive Summary & Core Policy

ConceptLens establishes an authentic, responsible Indian Sign Language (ISL) video foundation.

> [!IMPORTANT]
> **Ethical Principle: Zero Synthetic Hallucination of Sign Language**  
> We do not claim automated ISL translation because no validated production AI translation system exists for continuous Indian Sign Language. ConceptLens strictly refuses to:
> - Translate English into arbitrary gesture animations.
> - Invent signs for technical terms without Deaf community standardization.
> - Generate synthetic 3D avatars that simulate signing without native signer co-articulation.
> - Misrepresent isolated gesture classifiers or gloss conversions as natural sign language translation.

Until a validated, community-endorsed AI translation model exists, ConceptLens exclusively integrates authentic, reviewed human-signed ISL educational video modules.

---

## 2. Resource Inspection & Provenance

We conducted an audit of legitimate ISL educational video resources, datasets, and potential APIs:

### 2.1 ISLRTC & NCERT Educational Modules (Primary Authentic Source)
- **Authority:** Indian Sign Language Research and Training Centre (ISLRTC), an autonomous organization under the Department of Empowerment of Persons with Disabilities, Ministry of Social Justice & Empowerment, Government of India, in formal collaboration with the National Council of Educational Research and Training (NCERT).
- **Curriculum Scope:** NCERT Class 1 through Class 12 textbooks, with dedicated units for Science, Mathematics, and Social Science translated into authentic ISL.
- **Language Fidelity:** Native Deaf signers and certified educational interpreters. Demonstrates full three-dimensional signing space, upper body orientation, manual handshapes, directional verbs, and crucial non-manual markers (facial expressions and mouth movements).
- **Licensing & Usage:** Published under Government of India Open Educational Resource (OER) initiatives. Permitted for non-commercial educational use with mandatory attribution to ISLRTC and NCERT.
- **Commercial Restrictions:** Strictly non-commercial. Derivative commercial resale is prohibited.
- **API Availability:** **No public REST API exists.** Video delivery is managed through national portals (DIKSHA / PM e-VIDYA / ISLRTC official channels). Direct streaming requires managed secure media delivery or embedding with strict provenance metadata.

### 2.2 DEF (Deaf Enabled Foundation) & Higher Education STEM Terminology
- **Authority:** Deaf Enabled Foundation (DEF) in collaboration with deaf university student cohorts.
- **Curriculum Scope:** Emerging technical Computer Science terminology (e.g. Data Structures, Linked Lists, Pointers, Algorithms).
- **Current Status:** In active standardization. Where validated terminology is still undergoing formal committee review, ConceptLens marks the resource honestly as `reviewStatus: 'pending_review'` or provides the honest in-development state.

---

## 3. Structured Lesson Metadata Schema

All ISL educational media in ConceptLens is strictly governed by the TypeScript and Zod schema defined in `@conceptlens/shared` (`shared/src/schemas/isl.ts`):

```typescript
export interface ISLLessonResource {
  lessonId: string;
  topic: string;
  title: string;
  videoUrl: string;                     // Secure https URL or approved asset identifier
  posterUrl?: string;
  language: 'ISL';                      // Strictly literal 'ISL'
  description: string;                  // Pedagogical concept explanation
  transcript?: string;                  // Full text transcript
  cues?: Array<{                        // Synchronized interactive timestamps
    id: string;
    startTimeSec: number;
    endTimeSec: number;
    timeLabel: string;
    text: string;
  }>;
  source: string;                       // e.g. "ISLRTC & NCERT Class 9 Science"
  attribution: string;                  // Required copyright/attribution notice
  license: string;                      // e.g. "Non-Commercial Educational Attribution License"
  isCommercialAllowed: boolean;         // Default false
  reviewStatus: 'verified' | 'pending_review' | 'unreviewed';
  reviewerMetadata?: {
    reviewerName: string;
    organization: string;
    certification?: string;
    reviewedAt: string;
  };
  cloudinaryPublicId?: string;
}
```

### Key Security & Integrity Guarantees
1. **URL Validation:** All external video URLs must use secure `https://` protocol.
2. **Credential Safety:** Cloudinary and server API credentials are never bundled into client-side code. Signed URLs are issued via authenticated server routes only.
3. **Provable Provenance:** Every video card visibly renders its source, license, and reviewer credentials.

---

## 4. Cloudinary Integration Safeguards

Where permitted by open educational licensing, Cloudinary is utilized for media optimization and responsive delivery under strict ethical guidelines:

1. **No Cropping of Signing Space:**
   Automatic face-tracking crops (such as `g_face` or `c_crop`) are strictly prohibited on ISL videos. In sign linguistics, the signing space extends from the top of the head down to the waist and outward to both elbows. Cropping edges removes finger movements, spatial referents, or bodily postures that convey core grammatical meaning.
2. **Facial Expression Preservation:**
   Filters, extreme contrast boosts, or noise-reduction algorithms that alter facial features are forbidden. In ISL, non-manual markers (raised eyebrows, squinted eyes, head tilts, mouthing) convey grammatical mood, negation, questions, and adverbial nuances.
3. **Cost Containment:**
   Only standard responsive video transformations (`f_auto,q_auto:good`) are enabled. Paid transformations (e.g. generative video expansion) are never triggered automatically on ISL assets.

---

## 5. Formal Evaluation of Candidate AI Translation Technologies

Before determining our architecture, we evaluated the technical and pedagogical viability of existing automated sign language translation candidates:

| Candidate Architecture | How It Works | Tested Reality / Fatal Flaws | Feasibility Status |
| :--- | :--- | :--- | :--- |
| **English-to-Gloss Rule Mappers** | Converts English sentences into sign glosses via dictionary lookup | Completely ignores ISL grammar (which is Topic-Comment and Subject-Object-Verb, not English SVO). Lacks spatial indexing, directional verbs, and classifier predicates. Unintelligible to native deaf signers. | **Rejected** for natural translation |
| **MediaPipe / OpenCV Hand Trackers** | Detects 21 3D hand landmarks from webcam video | Capable only of classifying isolated static gestures (e.g. fingerspelling alphabet A-Z) under controlled lighting. Cannot interpret or generate continuous multi-channel sign language discourse. | **Rejected** for translation |
| **Synthetic 3D Avatars (HamNoSys / SiGML)** | Animates a virtual 3D character using parametric sign notation | Avatars lack facial micro-expressions, co-articulation, and natural muscle movement. Deaf student evaluation trials consistently report severe uncanny valley effects, high cognitive fatigue, and inability to parse complex technical explanations. | **Rejected** for educational lessons |
| **Diffusion / Video Generation Models** | Generates video frames conditioned on text prompts | Hallucinates hands with inconsistent finger counts, blurry hand transitions, and missing spatial referents. Completely unsafe for scientific education. | **Rejected** |

### Reviewer Validation Protocol for Future Candidate Models
Before any prospective automated translation model could ever be integrated into ConceptLens, it would be required to pass the following four-stage validation protocol:
1. **Linguistic Fluency Review:** Assessment by a panel of native Deaf signers and RCI-registered ISL interpreters evaluating morphology, syntax, and spatial consistency.
2. **Pedagogical Comprehension Trial:** Double-blind comprehension testing with deaf students learning the specific STEM concept in ISL vs. text captions.
3. **Non-Manual Marker Score:** Quantitative metric verifying accurate eye gaze, head nod/tilt, and facial expression synchronization.
4. **Attribution & Transparency:** Explicit user-facing disclosure that content was machine-generated, accompanied by an instant toggle to view the verified text and human-reviewed models.

Until such a model meets these standards, ConceptLens maintains an honest foundation: authentic human-signed ISL lessons only.

