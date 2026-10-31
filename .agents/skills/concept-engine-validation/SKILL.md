---
name: concept-engine-validation
description: >-
  Validate diagram structural invariants (linked lists, trees), execute the 8-stage reliability pipeline, generate deterministic step transitions, and trigger human-in-the-loop correction for ambiguous AI outputs.
---

# Concept Engine Validation Skill

This skill enforces correctness across the ConceptLens 2.0 diagram interpretation and rendering lifecycle.

## The 8-Stage Reliability Pipeline

```
[01: Upload & Validate] -> [02: Media Prep & Crop] -> [03: OCR Extraction] -> [04: AI Interpretation]
           │                         │                        │                         │
[08: Verify Learning]  <- [07: Render Deterministic] <- [06: Human Correction] <- [05: Structural Gate]
```

## Structural Invariants for Singly Linked Lists

Every parsed linked list must satisfy these mathematical and logical guarantees before entering the visualization engine:

1. **Head Existence**: Exactly one distinct node is designated as `head` (or list is explicitly empty).
2. **Acyclicity Check**: Unless explicitly identified as a circular linked list, traversing from `head` via `next` must terminate at `null` within $N$ steps (where $N$ is node count). Use Floyd's Cycle-Finding Algorithm (Tortoise and Hare).
3. **Reachability**: All active nodes in the structure must be reachable from `head`, OR clearly categorized as orphaned/unlinked nodes awaiting student assignment.
4. **Pointer Integrity**: Every `next` pointer must reference a valid node ID in the graph or `null`. No dangling IDs allowed.
5. **Node Uniqueness**: Node IDs must be unique strings; node values must not be empty.

## Human-in-the-Loop Correction Triggers

When any of the following occur, do **NOT** render broken graphics or hallucinate nodes. Instead, trigger the Correction Interface (`needs_review` state):

- AI confidence score on an individual label is `< 0.80` or label text is ambiguous.
- A pointer arrow has unclear origin or termination coordinates.
- Floyd's cycle check fails on a non-circular problem description.
- Node value OCR contradicts student-provided prompt context.

## Deterministic Step-by-Step State Transitions

Operations (e.g. `insertAtHead`, `insertAtTail`, `deleteNode`, `reverseList`, `search`) generate an immutable array of `ExecutionStep`:
```typescript
interface ExecutionStep {
  stepIndex: number;
  description: string;
  codeSnippet: string;
  pointers: { [pointerName: string]: string | null }; // e.g. { head: 'node_1', current: 'node_2', temp: null }
  highlightedNodes: string[];
  mutatedNodeId?: string;
  explanation: string;
}
```
Visualizers consume this step array deterministically, ensuring that stepping forward or backward maintains exact state reproducibility.
