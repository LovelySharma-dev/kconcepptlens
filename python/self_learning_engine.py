"""
Local evidence engine for ConceptLens.

This adjusts explanation weights from correct and incorrect answers.
It is not a trained model, it does not call a network, and it does not read an API key.
Uploaded code is never executed. A tracer accepts only an add-a-list pattern.
"""

from __future__ import annotations

import json
import os
import re
import sys
from pathlib import Path

ENGINE = "deterministic-evidence-rules"
STATE_PATH = Path(os.environ.get("CONCEPTLENS_LEARNER_STATE", Path(__file__).with_name("data") / "learner_state.json"))
DIAGNOSIS = re.compile(r"diagnos|medical|disability", re.I)


def round3(value: float) -> float:
    return round(value + 0.0, 3)


def default_weights() -> dict:
    return {"plain": 1.0, "steps": 1.0, "example": 1.0, "challenge": 1.0}


def empty_state() -> dict:
    return {"version": 1, "weights": {}, "events": [], "trainedModel": False, "engine": ENGINE}


def load_state() -> dict:
    if not STATE_PATH.exists():
        return empty_state()
    try:
        loaded = json.loads(STATE_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return empty_state()
    if not isinstance(loaded, dict) or any(DIAGNOSIS.search(key) for key in loaded):
        return empty_state()
    loaded["trainedModel"] = False
    loaded["engine"] = ENGINE
    loaded.setdefault("weights", {})
    loaded.setdefault("events", [])
    return loaded


def save_state(state: dict) -> None:
    STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
    safe = {
        "version": 1,
        "weights": state.get("weights", {}),
        "events": state.get("events", [])[-200:],
        "trainedModel": False,
        "engine": ENGINE,
    }
    STATE_PATH.write_text(json.dumps(safe, indent=2), encoding="utf-8")


def adjust(weights: dict, correct: bool) -> dict:
    current = {**default_weights(), **weights}
    if correct:
        current["challenge"] = round3(min(3.0, float(current["challenge"]) + 0.25))
    else:
        current["plain"] = round3(float(current["plain"]) + 0.35)
        current["steps"] = round3(float(current["steps"]) + 0.25)
        current["challenge"] = round3(max(0.2, float(current["challenge"]) - 0.2))
    return current


def solve_linear(text: str):
    match = re.search(r"(-?\d*)\s*x\s*([+-])\s*(\d+(?:\.\d+)?)\s*=\s*(-?\d+(?:\.\d+)?)", text, re.I)
    if not match:
        return None
    coeff_raw, sign, magnitude_raw, right_raw = match.groups()
    if coeff_raw in ("", "+"):
        coefficient = 1.0
    elif coeff_raw == "-":
        coefficient = -1.0
    else:
        coefficient = float(coeff_raw)
    magnitude = float(magnitude_raw)
    right = float(right_raw)
    if coefficient == 0:
        return None
    constant = -magnitude if sign == "-" else magnitude
    solution = (right - constant) / coefficient
    if abs(coefficient * solution + constant - right) > 1e-6:
        return None
    shown = str(int(round(solution))) if abs(solution - round(solution)) < 1e-8 else str(round3(solution))
    return {
        "solution": shown,
        "verified": True,
        "codeExecuted": False,
        "expression": re.sub(r"\s+", " ", match.group(0)),
    }


def trace_accumulator(text: str):
    function = re.search(
        r"def\s+([A-Za-z_]\w*)\s*\((\w*)\)\s*:\s*result\s*=\s*0\s*for\s+(\w+)\s+in\s+\2\s*:\s*result\s*=\s*result\s*\+\s*\3\s*return\s+result",
        text,
    )
    if not function:
        return None
    listed = re.search(rf"{re.escape(function.group(2))}\s*=\s*\[([^\]]+)\]", text)
    if not listed:
        return None
    try:
        numbers = [float(part.strip()) for part in listed.group(1).split(",")]
    except ValueError:
        return None
    return {
        "result": int(sum(numbers)) if sum(numbers).is_integer() else sum(numbers),
        "codeExecuted": False,
        "tracer": "add-a-list-only",
        "note": "The file was not executed. Only this adding pattern was traced.",
    }


def explain_code(text: str) -> dict:
    traced = trace_accumulator(text)
    notes = []
    for pattern, note in (
        (r"SyntaxError", "A SyntaxError means the text breaks the language rules. It was not run."),
        (r"IndentationError", "An IndentationError means the blocks are not aligned as that language expects."),
        (r"TypeError", "A TypeError means a value was used in a way that does not match its type."),
        (r"NameError|ReferenceError", "A name was used before it was defined in that scope."),
    ):
        if re.search(pattern, text, re.I):
            notes.append(note)
    return {
        "ok": True,
        "trainedModel": False,
        "engine": ENGINE,
        "codeExecuted": False,
        "trace": traced,
        "notes": notes,
        "limitation": "Uploaded code is untrusted. This engine does not run it.",
    }


def handle(payload: dict) -> dict:
    if not isinstance(payload, dict) or any(DIAGNOSIS.search(str(key)) for key in payload):
        return {"ok": False, "trainedModel": False, "engine": ENGINE, "error": "The request was rejected."}
    command = payload.get("command")
    if command == "status":
        return {
            "ok": True,
            "trainedModel": False,
            "engine": ENGINE,
            "additionalEnvKeysRequired": [],
            "stateFile": str(STATE_PATH),
            "ocr": "not_configured",
            "codeExecution": "disabled",
        }
    if command == "reset":
        save_state(empty_state())
        return {"ok": True, "trainedModel": False, "engine": ENGINE, "weights": {}}
    if command == "solve":
        solved = solve_linear(str(payload.get("text", "")))
        if not solved:
            return {"ok": False, "trainedModel": False, "engine": ENGINE, "codeExecuted": False, "error": "No checked linear equation."}
        return {"ok": True, "trainedModel": False, "engine": ENGINE, **solved}
    if command == "explain_code":
        return explain_code(str(payload.get("text", "")))
    if command == "record":
        subject = str(payload.get("subject") or "general")
        concept_id = str(payload.get("conceptId") or "concept")
        correct = payload.get("correct") is True
        state = load_state()
        weights = adjust(state["weights"].get(subject, {}), correct)
        state["weights"][subject] = weights
        state["events"].append({"subject": subject, "conceptId": concept_id, "correct": correct})
        save_state(state)
        return {"ok": True, "trainedModel": False, "engine": ENGINE, "subject": subject, "weights": weights, "storedText": False}
    if command == "weights":
        state = load_state()
        subject = str(payload.get("subject") or "")
        return {
            "ok": True,
            "trainedModel": False,
            "engine": ENGINE,
            "weights": state["weights"].get(subject, default_weights()) if subject else state["weights"],
        }
    return {"ok": False, "trainedModel": False, "engine": ENGINE, "error": "Unknown command."}


def main() -> None:
    raw = sys.stdin.read()
    try:
        payload = json.loads(raw) if raw.strip() else {"command": "status"}
    except json.JSONDecodeError:
        payload = {"command": "malformed"}
    json.dump(handle(payload), sys.stdout)


if __name__ == "__main__":
    main()
