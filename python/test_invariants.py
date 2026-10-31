"""
ConceptLens 2.0 — Pytest Invariant Test Suite
"""

import json
from pathlib import Path
import pytest
from schemas import LinkedListGraph
from graph_engine import validate_graph_invariants
from ocr_preprocessor import calculate_laplacian_variance
from PIL import Image, ImageDraw

FIXTURES_DIR = Path(__file__).resolve().parent.parent / "fixtures"

def load_fixture(filename: str) -> dict:
    with open(FIXTURES_DIR / filename, "r", encoding="utf-8") as f:
        return json.load(f)

def test_isc_2023_specimen_invariants():
    data = load_fixture("isc-2023-specimen-q11.json")
    graph = LinkedListGraph(**data["graph"])
    res = validate_graph_invariants(graph)
    assert res.isValid is True
    assert res.floydCycleDetected is False
    assert len(res.orphanNodeIds) == 0

def test_delete_node_synthetic_invariants():
    data = load_fixture("delete-node-synthetic.json")
    graph = LinkedListGraph(**data["graph"])
    res = validate_graph_invariants(graph)
    assert res.isValid is True
    assert res.floydCycleDetected is False

def test_reverse_linked_list_invariants():
    data = load_fixture("reverse-linked-list.json")
    graph = LinkedListGraph(**data["graph"])
    res = validate_graph_invariants(graph)
    assert res.isValid is True
    assert res.floydCycleDetected is False

def test_gate_05_cycle_detection_rejection():
    data = load_fixture("malformed-cycle.json")
    graph = LinkedListGraph(**data["graph"])
    res = validate_graph_invariants(graph)
    assert res.isValid is False
    assert res.floydCycleDetected is True
    assert any("Acyclicity violation" in iss.message for iss in res.issues)

def test_gate_06_low_confidence_ocr_trigger():
    data = load_fixture("ambiguous-label.json")
    graph = LinkedListGraph(**data["graph"])
    res = validate_graph_invariants(graph)
    assert res.needsHumanReview is True
    assert any(iss.gate == "GATE_06_HUMAN_REVIEW" for iss in res.issues)

def test_ocr_blur_detector_sharp_vs_blank():
    # Sharp diagram box
    sharp_img = Image.new('L', (200, 200), color=255)
    draw = ImageDraw.Draw(sharp_img)
    draw.rectangle([40, 40, 160, 160], fill=0)
    draw.text((60, 80), "Node 42", fill=255)
    sharp_score = calculate_laplacian_variance(sharp_img)

    # Completely flat/blurred image
    flat_img = Image.new('L', (200, 200), color=128)
    flat_score = calculate_laplacian_variance(flat_img)

    assert sharp_score > 100.0, "Sharp drawing should have high variance"
    assert flat_score == 0.0, "Flat image should have 0 variance"
