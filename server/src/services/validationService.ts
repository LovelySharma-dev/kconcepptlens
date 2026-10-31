import {
  LinkedListGraph,
  LinkedListNode,
  ValidationResult,
  ValidationIssue
} from '@conceptlens/shared';

/**
 * Validates a singly linked list against all structural invariants (Gate 05 & Gate 06)
 */
export function validateLinkedListInvariants(graph: LinkedListGraph): ValidationResult {
  const issues: ValidationIssue[] = [];
  const nodeMap = new Map<string, LinkedListNode>();

  // 1. Basic schema and node map population
  for (const node of graph.nodes) {
    if (nodeMap.has(node.id)) {
      issues.push({
        gate: 'GATE_05_INVARIANTS',
        severity: 'error',
        nodeId: node.id,
        message: `Duplicate node ID detected: "${node.id}". Node IDs must be unique.`
      });
    }
    nodeMap.set(node.id, node);

    // Gate 06 Check: Low confidence OCR trigger
    if (node.confidence !== undefined && node.confidence < 0.80) {
      issues.push({
        gate: 'GATE_06_HUMAN_REVIEW',
        severity: 'warning',
        nodeId: node.id,
        message: `Node "${node.id}" label "${node.value}" has low OCR confidence (${(node.confidence * 100).toFixed(0)}%). Student confirmation recommended.`,
        suggestedFix: 'Confirm or correct node value in the correction editor.'
      });
    }

    // Node value empty check
    if (node.value === undefined || node.value === null || String(node.value).trim() === '') {
      issues.push({
        gate: 'GATE_05_INVARIANTS',
        severity: 'error',
        nodeId: node.id,
        message: `Node "${node.id}" has an empty value.`
      });
    }
  }

  // 2. Head integrity check
  if (!graph.headId) {
    if (graph.nodes.length > 0) {
      issues.push({
        gate: 'GATE_05_INVARIANTS',
        severity: 'error',
        message: 'Graph contains nodes but no "headId" is designated.'
      });
    }
  } else if (!nodeMap.has(graph.headId)) {
    issues.push({
      gate: 'GATE_05_INVARIANTS',
      severity: 'error',
      message: `Designated headId "${graph.headId}" does not exist in the node list.`
    });
  }

  // 3. Dangling pointer checks (Forward and Backward links)
  for (const node of graph.nodes) {
    if (node.next !== null && !nodeMap.has(node.next)) {
      issues.push({
        gate: 'GATE_05_INVARIANTS',
        severity: 'error',
        nodeId: node.id,
        message: `Node "${node.id}" has a dangling next pointer to non-existent node "${node.next}".`
      });
    }
    if (node.prev !== undefined && node.prev !== null && !nodeMap.has(node.prev)) {
      issues.push({
        gate: 'GATE_05_INVARIANTS',
        severity: 'error',
        nodeId: node.id,
        message: `Node "${node.id}" has a dangling prev pointer to non-existent node "${node.prev}".`
      });
    }
  }
  if (graph.structureType === 'doubly') {
    for (const node of graph.nodes) {
      const next = node.next ? nodeMap.get(node.next) : undefined;
      const prev = node.prev ? nodeMap.get(node.prev) : undefined;
      if (next && next.prev !== node.id) issues.push({ gate: 'GATE_05_INVARIANTS', severity: 'error', nodeId: node.id, message: `Doubly linked next pointer is not reciprocal: ${next.id}.prev must point to ${node.id}.` });
      if (prev && prev.next !== node.id) issues.push({ gate: 'GATE_05_INVARIANTS', severity: 'error', nodeId: node.id, message: `Doubly linked prev pointer is not reciprocal: ${prev.id}.next must point to ${node.id}.` });
    }
  }
  if (graph.structureType === 'doubly' && !graph.isCircular && graph.headId && nodeMap.get(graph.headId)?.prev != null) {
    issues.push({ gate: 'GATE_05_INVARIANTS', severity: 'error', nodeId: graph.headId, message: 'The head node of a non-circular doubly linked list must have prev = null.' });
  }

  // If there are blocking fatal errors, return early before graph traversal
  if (issues.some((i) => i.severity === 'error')) {
    return {
      isValid: false,
      needsHumanReview: issues.some((i) => i.gate === 'GATE_06_HUMAN_REVIEW'),
      issues,
      floydCycleDetected: false,
      orphanNodeIds: []
    };
  }

  // 4. Floyd's Cycle Detection Algorithm (Tortoise and Hare)
  let floydCycleDetected = false;
  if (graph.headId) {
    let slow: string | null = graph.headId;
    let fast: string | null = graph.headId;

    while (fast !== null && nodeMap.get(fast)?.next) {
      slow = nodeMap.get(slow!)?.next || null;
      const nextFast: string | null = nodeMap.get(fast)?.next ?? null;
      fast = nextFast ? (nodeMap.get(nextFast)?.next ?? null) : null;

      if (slow !== null && fast !== null && slow === fast) {
        floydCycleDetected = true;
        break;
      }
    }
  }

  if (floydCycleDetected && !graph.isCircular) {
    issues.push({
      gate: 'GATE_05_INVARIANTS',
      severity: 'error',
      message: 'Acyclicity violation: Detected an unexpected cycle in non-circular singly linked list.'
    });
  }

  // 5. Reachability and Orphan Node Analysis
  const visited = new Set<string>();
  if (graph.headId) {
    let curr: string | null = graph.headId;
    while (curr !== null && nodeMap.has(curr) && !visited.has(curr)) {
      visited.add(curr);
      curr = nodeMap.get(curr)!.next;
    }
  }

  const orphanNodeIds: string[] = [];
  for (const node of graph.nodes) {
    if (!visited.has(node.id)) {
      orphanNodeIds.push(node.id);
    }
  }

  if (orphanNodeIds.length > 0 && !floydCycleDetected) {
    issues.push({
      gate: 'GATE_06_HUMAN_REVIEW',
      severity: 'warning',
      message: `Orphaned/unlinked nodes detected: [${orphanNodeIds.join(', ')}]. These are not reachable from the head pointer.`,
      suggestedFix: 'Connect orphaned nodes or remove them from the active list.'
    });
  }

  const hasErrors = issues.some((i) => i.severity === 'error');
  const needsHumanReview = issues.some((i) => i.gate === 'GATE_06_HUMAN_REVIEW') || hasErrors;

  return {
    isValid: !hasErrors,
    needsHumanReview,
    issues,
    validatedGraph: !hasErrors ? graph : null,
    floydCycleDetected,
    orphanNodeIds
  };
}
