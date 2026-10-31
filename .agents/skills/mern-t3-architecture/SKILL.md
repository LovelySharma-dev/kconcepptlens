---
name: mern-t3-architecture
description: >-
  Architect and implement end-to-end type-safe full-stack MERN + T3 patterns with TypeScript, Zod contract validation, Express API routes, MongoDB Mongoose models, and React state visualizers.
---

# MERN + T3 Architecture Skill for ConceptLens

This skill defines the technical standards for developing ConceptLens 2.0 using TypeScript across the entire stack, Zod runtime validation, predictable REST API patterns, and reactive client components.

## Architecture Blueprint

```
ConceptLens/
├── shared/              # Single source of truth for schemas & types
│   └── src/schemas/     # Zod schemas (Diagram, PYQ, Lesson, Invariants)
├── server/              # Express + Node.js + Mongoose + Zod validation
│   ├── src/models/      # MongoDB Schema definitions
│   ├── src/routes/      # Controller endpoints with Zod payload guards
│   └── src/services/    # Deterministic simulation, AI interpretation & validation gates
└── client/              # React 19/18 + Vite + TypeScript + Modern CSS
    ├── src/components/  # Accessible, keyboard-first interactive visualizers
    ├── src/hooks/       # Custom hooks for step execution and live speech
    └── src/services/    # Type-safe API client communicating with backend
```

## Key Principles

1. **Shared Type Safety (T3 principle)**:
   - Define contracts once in `shared/src/schemas/` with `zod`.
   - Export both Zod validators and inferred TypeScript types:
     ```typescript
     import { z } from 'zod';
     export const LinkedListNodeSchema = z.object({
       id: z.string(),
       value: z.union([z.string(), z.number()]),
       next: z.string().nullable(),
       x: z.number().optional(),
       y: z.number().optional()
     });
     export type LinkedListNode = z.infer<typeof LinkedListNodeSchema>;
     ```
2. **Strict Request Validation Gate**:
   - Every Express route must validate `req.body` using `.safeParse()` before any business logic executes.
   - Return structured error arrays with path and message if validation fails.
3. **Graceful Persistence**:
   - MongoDB stores structured sessions (`DiagramSession`), asset metadata (`Asset`), curated lessons (`Lesson`), and practice submissions (`Attempt`).
   - If MongoDB connection is absent or local during initial development, provide an in-memory/JSON fallback cache to maintain uninterrupted developer experience.
4. **Deterministic UI State**:
   - Visualizers must consume purely functional state transitions: `(currentState, operation) => nextState`.
   - Never rely on non-deterministic animation loops or AI generated canvas coordinates without bounds validation.
