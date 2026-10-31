---
name: inclusive-learning-isl
description: >-
  Implement accessible and inclusive learning features including Indian Sign Language (ISL) video synchronization, WebVTT searchable transcripts, screen-reader live announcements, keyboard navigation, and high-contrast modes.
---

# Inclusive Learning & ISL Skill for ConceptLens

This skill guides the implementation of WCAG 2.2 AAA accessible educational experiences for deaf, hard-of-hearing, and visually impaired learners.

## Five Pillars of Inclusivity in ConceptLens

1. **Reviewed Indian Sign Language (ISL) Clips**:
   - Every core operation (e.g. "What is a Linked List", "Inserting at Head", "Traversing to Null") is paired with an authentic, reviewed ISL explanation video.
   - Synchronized timeline events allow the video to highlight corresponding diagram nodes as the ISL instructor demonstrates the concept.
2. **Synchronized WebVTT Transcripts & Captions**:
   - HTML5 video elements must embed `<track kind="captions" srclang="en" ...>`.
   - Provide an expandable, searchable text transcript container (`aria-details`) allowing keyword jumping.
3. **Keyboard-First Diagram Navigation**:
   - Arrow keys (`Left`/`Right`) step backward and forward through operations.
   - `Space` pauses or resumes automatic stepping.
   - `R` resets the diagram state.
   - `Tab` navigates through active nodes; pressing `Enter` focuses the node inspector to hear current pointer values.
4. **Centralized ARIA Live Region**:
   - Provide a persistent, centralized polite live region:
     ```html
     <div id="diagram-announcer" aria-live="polite" aria-atomic="true" class="sr-only"></div>
     ```
   - Announce every state mutation: *"Step 3 of 5: Created new node with value 42. Pointer newNode.next assigned to head."*
5. **High-Contrast & Reduced-Motion Modes**:
   - Respect system preference `@media (prefers-reduced-motion: reduce)`.
   - Provide an in-app toggle for ultra-contrast mode (monochrome or high-visibility yellow/cyan on black with 7:1 contrast ratios).
   - Ensure interactive focus rings use `outline: 3px solid #38bdf8; outline-offset: 2px;`.
