import sys
import json
from pathlib import Path

# Ensure UTF-8 output on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from schemas import LinkedListGraph
from graph_engine import validate_graph_invariants

def run_benchmarks():
    print("=" * 65)
    print(" CONCEPTLENS 2.0 -- PYTHON BENCHMARK & INVARIANT EVALUATOR")
    print("=" * 65)

    fixtures_dir = Path(__file__).resolve().parent.parent / "fixtures"
    fixture_files = sorted(fixtures_dir.glob("*.json"))

    if not fixture_files:
        print(f"❌ No fixtures found in {fixtures_dir}")
        return

    passed_count = 0
    total_count = len(fixture_files)

    for f_path in fixture_files:
        with open(f_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        fixture_id = data.get("id", f_path.stem)
        title = data.get("title", f_path.name)
        graph_data = data.get("graph", {})

        graph = LinkedListGraph(**graph_data)
        result = validate_graph_invariants(graph)

        # Expected behavior checks
        if "malformed_cycle" in fixture_id:
            passed = (not result.isValid) and result.floydCycleDetected
            expected_desc = "Gate 05 Rejection (Cycle Detected)"
        elif "ambiguous_label" in fixture_id:
            passed = result.needsHumanReview and any(i.gate == "GATE_06_HUMAN_REVIEW" for i in result.issues)
            expected_desc = "Gate 06 Flag (Low OCR Confidence)"
        else:
            passed = result.isValid and (not result.floydCycleDetected)
            expected_desc = "All Invariants Satisfied (Pass)"

        status_icon = "PASS" if passed else "FAIL"
        if passed:
            passed_count += 1

        print(f"\n[{status_icon}] {title}")
        print(f"  * Expected: {expected_desc}")
        print(f"  * Valid: {result.isValid} | Needs Review: {result.needsHumanReview} | Cycle: {result.floydCycleDetected}")
        if result.issues:
            for issue in result.issues:
                print(f"    --> [{issue.severity.upper()}] {issue.gate}: {issue.message}")

    print("\n" + "=" * 65)
    accuracy_pct = (passed_count / total_count) * 100
    print(f" Benchmark Summary: {passed_count}/{total_count} Passed ({accuracy_pct:.1f}% Accuracy)")
    print("=" * 65)

if __name__ == "__main__":
    run_benchmarks()
