import {
  LinkedListGraph,
  LinkedListNode,
  ExecutionStep,
  OperationRequest
} from '@conceptlens/shared';

function cloneGraph(graph: LinkedListGraph): LinkedListGraph {
  return JSON.parse(JSON.stringify(graph));
}

function buildNodeMap(nodes: LinkedListNode[]): Map<string, LinkedListNode> {
  const map = new Map<string, LinkedListNode>();
  for (const n of nodes) {
    map.set(n.id, n);
  }
  return map;
}

export function ensureMemoryAddresses(graph: LinkedListGraph): LinkedListGraph {
  const g = cloneGraph(graph);
  let baseAddr = 0x1020;
  g.nodes.forEach((node, idx) => {
    if (!node.address) {
      node.address = `0x${(baseAddr + idx * 0x20).toString(16).toUpperCase()}`;
    }
  });
  return g;
}

/**
 * Deterministic Simulation Engine for Linked List Operations
 */
export function generateExecutionSteps(
  initialGraph: LinkedListGraph,
  operationReq: OperationRequest
): ExecutionStep[] {
  const normalizedGraph = ensureMemoryAddresses(initialGraph);
  switch (operationReq.operation) {
    case 'insertHead':
      return simulateInsertHead(normalizedGraph, operationReq.value ?? 99);
    case 'insertTail':
      return simulateInsertTail(normalizedGraph, operationReq.value ?? 99);
    case 'deleteNode':
      return simulateDeleteNode(normalizedGraph, operationReq.targetValue ?? operationReq.targetId ?? '');
    case 'reverseList':
      return simulateReverseList(normalizedGraph);
    case 'search':
      return simulateSearch(normalizedGraph, operationReq.targetValue ?? '');
    case 'insertDoublyHead':
      return simulateDoublyInsertHead(normalizedGraph, operationReq.value ?? 99);
    case 'deleteDoublyNode':
      return simulateDoublyDeleteNode(normalizedGraph, operationReq.targetValue ?? operationReq.targetId ?? '');
    default:
      throw new Error(`Unsupported operation: ${operationReq.operation}`);
  }
}

/**
 * 1. Insert at Head Step Generator
 */
function simulateInsertHead(
  startGraph: LinkedListGraph,
  newValue: string | number
): ExecutionStep[] {
  const steps: ExecutionStep[] = [];
  const newNodeId = `node_new_${Date.now() % 1000}`;
  let g = cloneGraph(startGraph);

  // Step 0: Initial State
  steps.push({
    stepIndex: 0,
    totalSteps: 4,
    operation: 'insertHead',
    description: `Initial linked list before inserting new node with value ${newValue}.`,
    codeSnippet: `Node* newNode = new Node(${newValue});`,
    activePointers: { head: g.headId, newNode: null },
    highlightedNodeIds: g.headId ? [g.headId] : [],
    currentGraph: cloneGraph(g),
    screenReaderAnnouncement: `Starting state. Head points to ${g.headId || 'null'}. Ready to insert value ${newValue} at head.`
  });

  // Step 1: Allocate newNode in memory
  const newNode: LinkedListNode = {
    id: newNodeId,
    value: newValue,
    next: null,
    x: 80,
    y: 100,
    confidence: 1.0
  };
  g.nodes.unshift(newNode);

  steps.push({
    stepIndex: 1,
    totalSteps: 4,
    operation: 'insertHead',
    description: `Allocated new node in memory with value ${newValue}. Pointer next is currently null.`,
    codeSnippet: `Node* newNode = new Node(${newValue});\nnewNode->next = NULL;`,
    activePointers: { head: startGraph.headId, newNode: newNodeId },
    highlightedNodeIds: [newNodeId],
    mutatedNodeId: newNodeId,
    currentGraph: cloneGraph(g),
    screenReaderAnnouncement: `Step 1 of 3: Created new node in memory with value ${newValue}. newNode pointer is active.`
  });

  // Step 2: Point newNode.next = head
  const oldHeadId = startGraph.headId;
  const targetNewNode = g.nodes.find((n) => n.id === newNodeId)!;
  targetNewNode.next = oldHeadId;

  steps.push({
    stepIndex: 2,
    totalSteps: 4,
    operation: 'insertHead',
    description: `Linked newNode->next to the current head (${oldHeadId || 'NULL'}).`,
    codeSnippet: `newNode->next = head;`,
    activePointers: { head: oldHeadId, newNode: newNodeId },
    highlightedNodeIds: oldHeadId ? [newNodeId, oldHeadId] : [newNodeId],
    mutatedNodeId: newNodeId,
    currentGraph: cloneGraph(g),
    screenReaderAnnouncement: `Step 2 of 3: Rewired newNode next pointer to reference current head node ${oldHeadId || 'null'}.`
  });

  // Step 3: Update head = newNode
  g.headId = newNodeId;

  // Re-adjust node coordinates for clean horizontal layout
  let currentId: string | null = g.headId;
  let offsetX = 80;
  const nodeMap = buildNodeMap(g.nodes);
  while (currentId && nodeMap.has(currentId)) {
    const n: LinkedListNode = nodeMap.get(currentId)!;
    n.x = offsetX;
    n.y = 180;
    offsetX += 170;
    currentId = n.next;
  }

  steps.push({
    stepIndex: 3,
    totalSteps: 4,
    operation: 'insertHead',
    description: `Updated head pointer to reference newNode (${newNodeId}). Insertion complete!`,
    codeSnippet: `head = newNode; // Head now points to value ${newValue}`,
    activePointers: { head: newNodeId, newNode: newNodeId },
    highlightedNodeIds: [newNodeId],
    mutatedNodeId: newNodeId,
    currentGraph: cloneGraph(g),
    screenReaderAnnouncement: `Step 3 of 3: Insertion complete. Head now points to node with value ${newValue}. New list length is ${g.nodes.length}.`
  });

  return steps;
}

/**
 * 2. Reverse Linked List Step Generator
 */
function simulateReverseList(startGraph: LinkedListGraph): ExecutionStep[] {
  const steps: ExecutionStep[] = [];
  let g = cloneGraph(startGraph);
  const totalSteps = g.nodes.length + 2;

  // Step 0: Initial setup
  steps.push({
    stepIndex: 0,
    totalSteps,
    operation: 'reverseList',
    description: 'Initialize pointers: prev = NULL, curr = head.',
    codeSnippet: 'Node* prev = NULL;\nNode* curr = head;\nNode* next = NULL;',
    activePointers: { prev: null, curr: g.headId, next: null },
    highlightedNodeIds: g.headId ? [g.headId] : [],
    currentGraph: cloneGraph(g),
    screenReaderAnnouncement: `Starting reversal. Initialized prev to null, curr to head node ${g.headId}.`
  });

  let prev: string | null = null;
  let curr: string | null = g.headId;
  let stepCount = 1;
  const nodeMap = buildNodeMap(g.nodes);
  const seen = new Set<string>();

  while (curr !== null && nodeMap.has(curr)) {
    if (seen.has(curr)) {
      throw new Error('Refusing to reverse a structure that contains a cycle.');
    }
    seen.add(curr);
    const currentNode: LinkedListNode = nodeMap.get(curr)!;
    const nextNodeId: string | null = currentNode.next;

    // Sub-step: Save next and reverse pointer
    currentNode.next = prev;

    steps.push({
      stepIndex: stepCount,
      totalSteps,
      operation: 'reverseList',
      description: `Reversed pointer for node ${currentNode.value}: next pointer changed from ${nextNodeId || 'NULL'} to ${prev || 'NULL'}.`,
      codeSnippet: `next = curr->next;\ncurr->next = prev;\nprev = curr;\ncurr = next;`,
      activePointers: { prev: curr, curr: nextNodeId, next: nextNodeId },
      highlightedNodeIds: prev ? [curr, prev] : [curr],
      mutatedNodeId: curr,
      currentGraph: cloneGraph(g),
      screenReaderAnnouncement: `Reversing node ${currentNode.value}. Pointer now points back to ${prev || 'null'}.`
    });

    prev = curr;
    curr = nextNodeId;
    stepCount++;
  }

  // Final Step: update head
  g.headId = prev;

  // Re-adjust node coordinates horizontally in reversed order
  let currentId: string | null = g.headId;
  let offsetX = 80;
  while (currentId && nodeMap.has(currentId)) {
    const n: LinkedListNode = nodeMap.get(currentId)!;
    n.x = offsetX;
    n.y = 180;
    offsetX += 170;
    currentId = n.next;
  }

  steps.push({
    stepIndex: stepCount,
    totalSteps,
    operation: 'reverseList',
    description: `Reversal finished. Updated head to ${prev}. List is now fully reversed!`,
    codeSnippet: `head = prev; // Reversal complete`,
    activePointers: { head: prev, prev, curr: null, next: null },
    highlightedNodeIds: prev ? [prev] : [],
    currentGraph: cloneGraph(g),
    screenReaderAnnouncement: `Reversal complete. Head now points to node ${prev}. All pointers reversed.`
  });

  return steps;
}

/**
 * 3. Delete Node Step Generator
 */
function simulateDeleteNode(
  startGraph: LinkedListGraph,
  target: string | number
): ExecutionStep[] {
  const steps: ExecutionStep[] = [];
  let g = cloneGraph(startGraph);
  const nodeMap = buildNodeMap(g.nodes);

  // Find target node
  let targetNode: LinkedListNode | undefined;
  for (const node of g.nodes) {
    if (node.id === String(target) || String(node.value) === String(target)) {
      targetNode = node;
      break;
    }
  }

  if (!targetNode) {
    throw new Error(`Target node "${target}" not found in linked list.`);
  }

  // Step 0: Target identified
  steps.push({
    stepIndex: 0,
    totalSteps: 3,
    operation: 'deleteNode',
    description: `Targeting node with value ${targetNode.value} for deletion.`,
    codeSnippet: `// Searching for target node with value ${targetNode.value}`,
    activePointers: { head: g.headId, target: targetNode.id },
    highlightedNodeIds: [targetNode.id],
    currentGraph: cloneGraph(g),
    screenReaderAnnouncement: `Identified target node with value ${targetNode.value} for deletion.`
  });

  // Step 1: Rewire previous pointer
  if (g.headId === targetNode.id) {
    g.headId = targetNode.next;
    steps.push({
      stepIndex: 1,
      totalSteps: 3,
      operation: 'deleteNode',
      description: `Target is head. Updated head to ${targetNode.next || 'NULL'}.`,
      codeSnippet: `head = head->next;`,
      activePointers: { head: g.headId, deleted: targetNode.id },
      highlightedNodeIds: [targetNode.id],
      currentGraph: cloneGraph(g),
      screenReaderAnnouncement: `Deleting head node. Head updated to point to ${g.headId || 'null'}.`
    });
  } else {
    // Find predecessor
    let prevNode: LinkedListNode | undefined;
    for (const n of g.nodes) {
      if (n.next === targetNode.id) {
        prevNode = n;
        break;
      }
    }

    if (prevNode) {
      prevNode.next = targetNode.next;
      steps.push({
        stepIndex: 1,
        totalSteps: 3,
        operation: 'deleteNode',
        description: `Bypassed target node: updated node ${prevNode.value}->next to point to ${targetNode.next || 'NULL'}.`,
        codeSnippet: `prev->next = target->next;`,
        activePointers: { prev: prevNode.id, target: targetNode.id },
        highlightedNodeIds: [prevNode.id, targetNode.id],
        mutatedNodeId: prevNode.id,
        currentGraph: cloneGraph(g),
        screenReaderAnnouncement: `Rewired previous node ${prevNode.value} to bypass deleted node.`
      });
    }
  }

  // Step 2: Remove node from graph
  g.nodes = g.nodes.filter((n) => n.id !== targetNode!.id);

  // Re-align coordinates
  let currId: string | null = g.headId;
  let offsetX = 80;
  const updatedMap = buildNodeMap(g.nodes);
  while (currId && updatedMap.has(currId)) {
    const n: LinkedListNode = updatedMap.get(currId)!;
    n.x = offsetX;
    n.y = 180;
    offsetX += 170;
    currId = n.next;
  }

  steps.push({
    stepIndex: 2,
    totalSteps: 3,
    operation: 'deleteNode',
    description: `Freed memory for deleted node. Remaining list has ${g.nodes.length} nodes.`,
    codeSnippet: `delete target; // Node removed`,
    activePointers: { head: g.headId },
    highlightedNodeIds: g.headId ? [g.headId] : [],
    currentGraph: cloneGraph(g),
    screenReaderAnnouncement: `Deletion complete. Node with value ${targetNode.value} removed.`
  });

  return steps;
}

/**
 * 4. Insert at Tail Step Generator
 */
function simulateInsertTail(
  startGraph: LinkedListGraph,
  newValue: string | number
): ExecutionStep[] {
  const steps: ExecutionStep[] = [];
  const newNodeId = `node_new_${Date.now() % 1000}`;
  let g = cloneGraph(startGraph);

  // If empty list, same as insert head
  if (!g.headId || g.nodes.length === 0) {
    return simulateInsertHead(startGraph, newValue);
  }

  const nodeMap = buildNodeMap(g.nodes);
  let curr: string | null = g.headId;
  let prevId: string | null = null;
  let stepIdx = 0;

  // Step 0: Traversal to find tail
  while (curr !== null && nodeMap.has(curr)) {
    const node: LinkedListNode = nodeMap.get(curr)!;
    steps.push({
      stepIndex: stepIdx,
      totalSteps: g.nodes.length + 2,
      operation: 'insertTail',
      description: `Traversing list: current is node with value ${node.value}.`,
      codeSnippet: `curr = curr->next;`,
      activePointers: { head: g.headId, current: curr },
      highlightedNodeIds: [curr],
      currentGraph: cloneGraph(g),
      screenReaderAnnouncement: `Traversing node ${node.value} looking for tail.`
    });

    prevId = curr;
    curr = node.next;
    stepIdx++;
  }

  // Create newNode
  const lastNode = nodeMap.get(prevId!)!;
  const newNode: LinkedListNode = {
    id: newNodeId,
    value: newValue,
    next: null,
    x: lastNode.x + 170,
    y: 180,
    confidence: 1.0
  };
  g.nodes.push(newNode);
  lastNode.next = newNodeId;

  steps.push({
    stepIndex: stepIdx,
    totalSteps: g.nodes.length + 1,
    operation: 'insertTail',
    description: `Reached tail (node ${lastNode.value}). Attached newNode with value ${newValue}.`,
    codeSnippet: `tail->next = new Node(${newValue});`,
    activePointers: { tail: lastNode.id, newNode: newNodeId },
    highlightedNodeIds: [lastNode.id, newNodeId],
    mutatedNodeId: lastNode.id,
    currentGraph: cloneGraph(g),
    screenReaderAnnouncement: `Appended new node ${newValue} to tail. Operation complete.`
  });

  return steps;
}

/**
 * 5. Search Step Generator
 */
function simulateSearch(
  startGraph: LinkedListGraph,
  targetValue: string | number
): ExecutionStep[] {
  const steps: ExecutionStep[] = [];
  const g = cloneGraph(startGraph);
  const nodeMap = buildNodeMap(g.nodes);

  let curr: string | null = g.headId;
  let stepIdx = 0;
  let found = false;

  while (curr !== null && nodeMap.has(curr)) {
    const node: LinkedListNode = nodeMap.get(curr)!;
    const isMatch = String(node.value) === String(targetValue);

    steps.push({
      stepIndex: stepIdx,
      totalSteps: g.nodes.length,
      operation: 'search',
      description: isMatch
        ? `Match found! Node with value ${node.value} matches target ${targetValue}.`
        : `Inspecting node ${node.value}. Does not match ${targetValue}; advancing next.`,
      codeSnippet: `if (curr->data == ${targetValue}) return curr;\ncurr = curr->next;`,
      activePointers: { head: g.headId, current: curr },
      highlightedNodeIds: [curr],
      currentGraph: cloneGraph(g),
      screenReaderAnnouncement: isMatch
        ? `Found match: node with value ${node.value}.`
        : `Comparing value ${node.value} against ${targetValue}. No match yet.`
    });

    if (isMatch) {
      found = true;
      break;
    }

    curr = node.next;
    stepIdx++;
  }

  if (!found) {
    steps.push({
      stepIndex: stepIdx,
      totalSteps: stepIdx + 1,
      operation: 'search',
      description: `Reached end of list (NULL). Target value ${targetValue} not found.`,
      codeSnippet: `return NULL; // Value not found`,
      activePointers: { head: g.headId, current: null },
      highlightedNodeIds: [],
      currentGraph: cloneGraph(g),
      screenReaderAnnouncement: `Search finished. Value ${targetValue} not present in list.`
    });
  }

  return steps;
}

/**
 * 6. Doubly Linked List Insert at Head Step Generator
 */
function simulateDoublyInsertHead(
  startGraph: LinkedListGraph,
  newValue: string | number
): ExecutionStep[] {
  const steps: ExecutionStep[] = [];
  const newNodeId = `node_d_${Date.now() % 1000}`;
  let g = cloneGraph(startGraph);
  g.structureType = 'doubly';

  // Step 0: Initial State
  steps.push({
    stepIndex: 0,
    totalSteps: 5,
    operation: 'insertDoublyHead',
    description: `Initial doubly linked list before inserting new node with value ${newValue}.`,
    codeSnippet: `Node* newNode = new Node(${newValue});`,
    activePointers: { head: g.headId, newNode: null },
    highlightedNodeIds: g.headId ? [g.headId] : [],
    currentGraph: cloneGraph(g),
    screenReaderAnnouncement: `Initial doubly linked list state. Ready to insert node with value ${newValue} at head.`
  });

  // Step 1: Allocate newNode with address
  const newNode: LinkedListNode = {
    id: newNodeId,
    value: newValue,
    next: null,
    prev: null,
    address: '0x1010',
    x: 80,
    y: 100,
    confidence: 1.0
  };
  g.nodes.unshift(newNode);

  steps.push({
    stepIndex: 1,
    totalSteps: 5,
    operation: 'insertDoublyHead',
    description: `Allocated new node at address ${newNode.address} with value ${newValue}. Both next and prev pointers are initialized to NULL.`,
    codeSnippet: `Node* newNode = new Node(${newValue});\nnewNode->next = NULL;\nnewNode->prev = NULL;`,
    activePointers: { head: startGraph.headId, newNode: newNodeId },
    highlightedNodeIds: [newNodeId],
    mutatedNodeId: newNodeId,
    currentGraph: cloneGraph(g),
    screenReaderAnnouncement: `Step 1 of 4: Allocated new node at address ${newNode.address}. newNode pointer is active.`
  });

  // Step 2: Link newNode->next = head
  const oldHeadId = startGraph.headId;
  const targetNewNode = g.nodes.find((n) => n.id === newNodeId)!;
  targetNewNode.next = oldHeadId;

  steps.push({
    stepIndex: 2,
    totalSteps: 5,
    operation: 'insertDoublyHead',
    description: `Set forward link: newNode->next = head (${oldHeadId || 'NULL'}).`,
    codeSnippet: `newNode->next = head;`,
    activePointers: { head: oldHeadId, newNode: newNodeId },
    highlightedNodeIds: [newNodeId, ...(oldHeadId ? [oldHeadId] : [])],
    mutatedNodeId: newNodeId,
    currentGraph: cloneGraph(g),
    screenReaderAnnouncement: `Step 2 of 4: Linked newNode's next pointer forward to current head.`
  });

  // Step 3: Link oldHead->prev = newNode (if old head exists)
  if (oldHeadId) {
    const oldHeadNode = g.nodes.find((n) => n.id === oldHeadId);
    if (oldHeadNode) {
      oldHeadNode.prev = newNodeId;
    }

    steps.push({
      stepIndex: 3,
      totalSteps: 5,
      operation: 'insertDoublyHead',
      description: `Set backward link: head->prev = newNode (${newNodeId}). Bidirectional pointer connection established.`,
      codeSnippet: `if (head != NULL) head->prev = newNode;`,
      activePointers: { head: oldHeadId, newNode: newNodeId },
      highlightedNodeIds: [newNodeId, oldHeadId],
      mutatedNodeId: oldHeadId,
      currentGraph: cloneGraph(g),
      screenReaderAnnouncement: `Step 3 of 4: Linked old head's prev pointer backward to newNode.`
    });
  }

  // Step 4: Reassign head = newNode
  g.headId = newNodeId;
  targetNewNode.y = 180;
  let startX = 80;
  g.nodes.forEach((n) => {
    n.x = startX;
    n.y = 180;
    startX += 180;
  });

  steps.push({
    stepIndex: oldHeadId ? 4 : 3,
    totalSteps: 5,
    operation: 'insertDoublyHead',
    description: `Updated head pointer: head = newNode. Insertion at head completed with forward and backward pointer integrity.`,
    codeSnippet: `head = newNode; // Head now points to newly allocated node`,
    activePointers: { head: newNodeId, newNode: null },
    highlightedNodeIds: [newNodeId],
    mutatedNodeId: newNodeId,
    currentGraph: cloneGraph(g),
    screenReaderAnnouncement: `Step 4 of 4: Head updated to newNode at address ${newNode.address}. Doubly linked list insertion complete.`
  });

  return steps;
}

/**
 * 7. Doubly Linked List Delete Node Step Generator
 */
function simulateDoublyDeleteNode(
  startGraph: LinkedListGraph,
  target: string | number
): ExecutionStep[] {
  const steps: ExecutionStep[] = [];
  let g = cloneGraph(startGraph);
  g.structureType = 'doubly';

  const targetNode = g.nodes.find(
    (n) => String(n.value) === String(target) || n.id === String(target)
  );

  if (!targetNode) {
    steps.push({
      stepIndex: 0,
      totalSteps: 1,
      operation: 'deleteDoublyNode',
      description: `Target node ${target} not found in doubly linked list.`,
      codeSnippet: `// Node not found`,
      activePointers: { head: g.headId },
      highlightedNodeIds: [],
      currentGraph: cloneGraph(g),
      screenReaderAnnouncement: `Target node ${target} not found in doubly linked list.`
    });
    return steps;
  }

  // Step 0: Initial state & highlight target
  steps.push({
    stepIndex: 0,
    totalSteps: 4,
    operation: 'deleteDoublyNode',
    description: `Identified target node with value ${targetNode.value} (Address: ${targetNode.address || 'N/A'}) for deletion.`,
    codeSnippet: `Node* target = search(${targetNode.value});`,
    activePointers: { head: g.headId, target: targetNode.id },
    highlightedNodeIds: [targetNode.id],
    currentGraph: cloneGraph(g),
    screenReaderAnnouncement: `Target node with value ${targetNode.value} located for deletion.`
  });

  // Step 1: Update target.prev.next = target.next
  const prevNode = targetNode.prev ? g.nodes.find((n) => n.id === targetNode.prev) : null;
  const nextNode = targetNode.next ? g.nodes.find((n) => n.id === targetNode.next) : null;

  if (prevNode) {
    prevNode.next = targetNode.next;
    steps.push({
      stepIndex: 1,
      totalSteps: 4,
      operation: 'deleteDoublyNode',
      description: `Bypassed forward link: target->prev->next = target->next (${nextNode?.value ?? 'NULL'}).`,
      codeSnippet: `if (target->prev != NULL)\n  target->prev->next = target->next;`,
      activePointers: { head: g.headId, prev: prevNode.id, target: targetNode.id },
      highlightedNodeIds: [prevNode.id, targetNode.id],
      mutatedNodeId: prevNode.id,
      currentGraph: cloneGraph(g),
      screenReaderAnnouncement: `Forward pointer of predecessor updated to bypass target node.`
    });
  } else {
    // Target was head
    g.headId = targetNode.next;
    steps.push({
      stepIndex: 1,
      totalSteps: 4,
      operation: 'deleteDoublyNode',
      description: `Target was head node. Updated head = target->next (${nextNode?.value ?? 'NULL'}).`,
      codeSnippet: `head = target->next;`,
      activePointers: { head: g.headId, target: targetNode.id },
      highlightedNodeIds: [targetNode.id],
      mutatedNodeId: targetNode.id,
      currentGraph: cloneGraph(g),
      screenReaderAnnouncement: `Head pointer updated to successor node.`
    });
  }

  // Step 2: Update target.next.prev = target.prev
  if (nextNode) {
    nextNode.prev = targetNode.prev;
    steps.push({
      stepIndex: 2,
      totalSteps: 4,
      operation: 'deleteDoublyNode',
      description: `Bypassed backward link: target->next->prev = target->prev (${prevNode?.value ?? 'NULL'}).`,
      codeSnippet: `if (target->next != NULL)\n  target->next->prev = target->prev;`,
      activePointers: { head: g.headId, next: nextNode.id, target: targetNode.id },
      highlightedNodeIds: [nextNode.id, targetNode.id],
      mutatedNodeId: nextNode.id,
      currentGraph: cloneGraph(g),
      screenReaderAnnouncement: `Backward pointer of successor updated to bypass target node.`
    });
  }

  // Step 3: Free target node memory
  g.nodes = g.nodes.filter((n) => n.id !== targetNode.id);
  let startX = 80;
  g.nodes.forEach((n) => {
    n.x = startX;
    startX += 180;
  });

  steps.push({
    stepIndex: 3,
    totalSteps: 4,
    operation: 'deleteDoublyNode',
    description: `Freed memory for node (value ${targetNode.value}, address ${targetNode.address || 'N/A'}). Bidirectional links cleanly rewired.`,
    codeSnippet: `delete target;\ntarget = NULL;`,
    activePointers: { head: g.headId, target: null },
    highlightedNodeIds: [],
    currentGraph: cloneGraph(g),
    screenReaderAnnouncement: `Deleted target node. Memory freed and doubly linked list re-established.`
  });

  return steps;
}
