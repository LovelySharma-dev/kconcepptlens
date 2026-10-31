---
name: pyq-intelligence
description: >-
  Extract, map, and link Previous Year Questions (PYQs) from board and university papers (ISC, CBSE, Anna University) to concept models with mark schemes and source page coordinates.
---

# PYQ Intelligence Skill for ConceptLens

This skill defines how ConceptLens indexes, tags, and serves curated and extracted Previous Year Questions (PYQs) connected directly to interactive data structure lessons.

## Data Schema Requirements

Each PYQ entry must contain:
1. **Exam Metadata**: Board/University (`ISC`, `CBSE`, `Anna University`, `GATE`), Year (`2025`, `2024`, `2019`, etc.), Paper/Subject Code (`CP5151`, `CompSci-868`).
2. **Question Hierarchy**: Section (`Section B`), Question Number (`11(a)`), Marks (`3 marks`, `5 marks`).
3. **Concept Mapping**: Primary Concept (`Singly Linked List - Insertion`), Difficulty Level (`easy`, `medium`, `hard`), Algorithm Topics (`Pointers`, `Memory Allocation`).
4. **Source Traceability**: Cloudinary Asset URL for the original question paper page, with bounding box coordinates `[ymin, xmin, ymax, xmax]` for the specific question text.
5. **Interactive Lesson Link**: ID of the corresponding interactive visualizer session that enables practicing this exact question.

## Question Processing Workflow

1. **Ingest Paper**: Upload official PDF or scanned question paper via Cloudinary.
2. **Extract Blocks**: OCR locates question number headers, marks notations in right margins, and code/diagram segments.
3. **Topic Classification**: Match keywords (`Node* next`, `head = head.next`, `specimen question`, `time complexity`) against the syllabus ontology.
4. **Candidate vs Confirmed**: If confidence `< 0.85`, tag status as `candidate_match` until confirmed by educator or test suite.
5. **Interactive Practice Generation**: Automatically populate initial linked list nodes from question diagrams so students solve the PYQ on-screen.
