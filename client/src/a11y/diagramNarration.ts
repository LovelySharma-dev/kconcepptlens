import type { ExecutionStep, LinkedListGraph } from '@conceptlens/shared';

export interface PointerLieNarrationInput {
  phase: 'loading' | 'proven' | 'stopped' | 'repaired' | 'offline';
  graph: LinkedListGraph;
  step: ExecutionStep | null;
  stepIndex: number;
  stepCount: number;
  validation: {
    isValid: boolean;
    floydCycleDetected: boolean;
    cycleEdge: { fromId: string; toId: string } | null;
  } | null;
}

function pointerSummary(step: ExecutionStep | null, graph: LinkedListGraph): string {
  if (!step) {
    const head = graph.headId || 'null';
    return `No simulation step is active. The list head is ${head}.`;
  }
  const pointers = step.activePointers || {};
  const prev = pointers.prev ?? 'not set';
  const curr = pointers.curr ?? 'not set';
  const next = pointers.next ?? 'not set';
  const head = pointers.head ?? graph.headId ?? 'not set';
  return `Previous pointer: ${prev}. Current pointer: ${curr}. Next pointer: ${next}. Head: ${head}.`;
}

function validationSummary(input: PointerLieNarrationInput): string {
  if (input.phase === 'offline') {
    return 'The lesson engine did not answer. No success state was invented.';
  }
  if (input.phase === 'loading') {
    return 'The list is being checked before anything moves.';
  }
  if (!input.validation) {
    return 'Validation details are not available yet.';
  }
  const { isValid, floydCycleDetected, cycleEdge } = input.validation;
  if (floydCycleDetected || input.phase === 'stopped') {
    const edge = cycleEdge ? ` The closing edge from ${cycleEdge.fromId} to ${cycleEdge.toId} is the cycle.` : '';
    return `Validation failed. A cycle was detected.${edge} The lesson does not teach a reversal until the structure is repaired.`;
  }
  if (!isValid) {
    return 'Validation did not pass. The lesson will not treat this list as proven.';
  }
  if (input.phase === 'repaired') {
    return 'Validation passed after repair. The closing arrow points to null, so reversal is allowed again.';
  }
  return 'Validation passed. Floyd’s check found no cycle, so reversal is allowed.';
}

/** Derive Pointer Lie narration from the real phase, step, and validation payload. */
export function narratePointerLie(input: PointerLieNarrationInput): string {
  const stepPart =
    input.stepCount > 0
      ? `Step ${Math.min(input.stepIndex + 1, input.stepCount)} of ${input.stepCount}.`
      : 'No reversal steps are loaded.';
  const announcement = input.step?.screenReaderAnnouncement
    ? ` Step announcement: ${input.step.screenReaderAnnouncement}`
    : '';
  const edges =
    input.step?.highlightedNodeIds?.length
      ? ` Highlighted nodes: ${input.step.highlightedNodeIds.join(', ')}.`
      : '';
  return [
    'Pointer Lie lesson.',
    `Lesson phase: ${input.phase}.`,
    stepPart,
    pointerSummary(input.step, input.graph),
    validationSummary(input),
    announcement,
    edges
  ]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}
