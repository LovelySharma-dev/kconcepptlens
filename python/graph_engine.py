"""
ConceptLens 2.0 — Graph Invariant & Verification Engine
Gate 05 & 06: Structural validation of Singly Linked Lists and tree structures using NetworkX and Pydantic.
"""

from typing import List, Dict, Set, Optional, Tuple
import networkx as nx
from schemas import LinkedListGraph, LinkedListNode, ValidationResult, ValidationIssue

def validate_graph_invariants(graph: LinkedListGraph) -> ValidationResult:
    """
    Validates a linked list model against all mathematical and topological invariants.
    """
    issues: List[ValidationIssue] = []
    node_map: Dict[str, LinkedListNode] = {}
    node_ids: Set[str] = set()

    # 1. Node Uniqueness & Basic Attributes
    for node in graph.nodes:
        if node.id in node_ids:
            issues.append(ValidationIssue(
                gate="GATE_05_INVARIANTS",
                severity="error",
                nodeId=node.id,
                message=f"Duplicate node ID detected: '{node.id}'. Node IDs must be unique."
            ))
        node_ids.add(node.id)
        node_map[node.id] = node

        # Gate 06: Low OCR confidence warning
        if node.confidence < 0.80:
            issues.append(ValidationIssue(
                gate="GATE_06_HUMAN_REVIEW",
                severity="warning",
                nodeId=node.id,
                message=f"Node '{node.id}' label '{node.value}' has low OCR confidence ({int(node.confidence * 100)}%). Student confirmation recommended.",
                suggestedFix="Confirm or correct node value in the correction editor."
            ))

        # Empty value check
        if node.value is None or str(node.value).strip() == "":
            issues.append(ValidationIssue(
                gate="GATE_05_INVARIANTS",
                severity="error",
                nodeId=node.id,
                message=f"Node '{node.id}' has an empty or null value."
            ))

    # 2. Head Integrity Check
    if not graph.headId:
        if len(graph.nodes) > 0:
            issues.append(ValidationIssue(
                gate="GATE_05_INVARIANTS",
                severity="error",
                message="Graph contains nodes but no 'headId' is designated."
            ))
    elif graph.headId not in node_ids:
        issues.append(ValidationIssue(
            gate="GATE_05_INVARIANTS",
            severity="error",
            message=f"Designated headId '{graph.headId}' does not exist in the node list."
        ))

    # 3. Dangling Pointer Checks
    for node in graph.nodes:
        if node.next is not None and node.next not in node_ids:
            issues.append(ValidationIssue(
                gate="GATE_05_INVARIANTS",
                severity="error",
                nodeId=node.id,
                message=f"Node '{node.id}' has a dangling pointer to non-existent node '{node.next}'."
            ))

    has_fatal_errors = any(i.severity == "error" for i in issues)
    if has_fatal_errors:
        return ValidationResult(
            isValid=False,
            needsHumanReview=any(i.gate == "GATE_06_HUMAN_REVIEW" for i in issues),
            issues=issues,
            floydCycleDetected=False,
            orphanNodeIds=[],
            cycleNodes=[]
        )

    # 4. Build NetworkX DiGraph for topological analysis
    G = nx.DiGraph()
    for node in graph.nodes:
        G.add_node(node.id, value=node.value)
        if node.next:
            G.add_edge(node.id, node.next)

    # 5. Cycle Detection via NetworkX & Floyd Simulation
    cycles = list(nx.simple_cycles(G))
    cycle_detected = len(cycles) > 0
    cycle_nodes: List[str] = [node for cycle in cycles for node in cycle]

    if cycle_detected and not graph.isCircular:
        cycle_str = " -> ".join(cycles[0]) + f" -> {cycles[0][0]}"
        issues.append(ValidationIssue(
            gate="GATE_05_INVARIANTS",
            severity="error",
            message=f"Acyclicity violation: Detected unexpected cycle [{cycle_str}] in non-circular singly linked list."
        ))

    # 6. Reachability & Orphan Nodes from Head
    orphan_node_ids: List[str] = []
    if graph.headId and graph.headId in G:
        reachable = {graph.headId} | set(nx.descendants(G, graph.headId))
        orphan_node_ids = [nid for nid in node_ids if nid not in reachable]

    if orphan_node_ids and not cycle_detected:
        issues.append(ValidationIssue(
            gate="GATE_06_HUMAN_REVIEW",
            severity="warning",
            message=f"Orphaned/unlinked nodes detected: {orphan_node_ids}. Not reachable from head pointer.",
            suggestedFix="Connect orphaned nodes or remove them from the active diagram."
        ))

    has_errors = any(i.severity == "error" for i in issues)
    needs_review = any(i.gate == "GATE_06_HUMAN_REVIEW" for i in issues) or has_errors

    return ValidationResult(
        isValid=not has_errors,
        needsHumanReview=needs_review,
        issues=issues,
        floydCycleDetected=cycle_detected,
        orphanNodeIds=orphan_node_ids,
        cycleNodes=cycle_nodes
    )
