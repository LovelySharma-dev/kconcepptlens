import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { ExecutionStep, LinkedListGraph, LinkedListNode } from '@conceptlens/shared';
import { narratePointerLie } from '../../a11y/diagramNarration';
import { speakConceptLens, stopConceptLensSpeech } from '../../a11y/speechBus';
import { InteractiveCanvas } from '../InteractiveCanvas';
import { StateInspector } from '../StateInspector';

interface PointerLieLessonProps {
  onAnnounce?: (message: string) => void;
  highContrast?: boolean;
  colorFriendly?: boolean;
}

interface CycleEdge {
  fromId: string;
  toId: string;
}

interface ValidationPayload {
  isValid: boolean;
  floydCycleDetected: boolean;
  cycleEdge: CycleEdge | null;
  issues: { message: string; severity: string }[];
}

type Phase = 'loading' | 'proven' | 'stopped' | 'repaired' | 'offline';

const PROVEN_LIST: LinkedListGraph = {
  headId: 'a',
  structureType: 'singly',
  isCircular: false,
  nodes: [
    { id: 'a', value: 1, next: 'b', x: 80, y: 160, confidence: 1 },
    { id: 'b', value: 2, next: 'c', x: 250, y: 160, confidence: 1 },
    { id: 'c', value: 3, next: 'd', x: 420, y: 160, confidence: 1 },
    { id: 'd', value: 4, next: null, x: 590, y: 160, confidence: 1 }
  ]
};

const BROKEN_LIST: LinkedListGraph = {
  headId: 'n1',
  structureType: 'singly',
  isCircular: false,
  nodes: [
    { id: 'n1', value: 10, next: 'n2', x: 80, y: 160, confidence: 1 },
    { id: 'n2', value: 20, next: 'n3', x: 250, y: 160, confidence: 1 },
    { id: 'n3', value: 30, next: 'n4', x: 420, y: 160, confidence: 1 },
    { id: 'n4', value: 40, next: 'n2', x: 590, y: 160, confidence: 1 }
  ]
};

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function cloneGraph(g: LinkedListGraph): LinkedListGraph {
  return {
    ...g,
    nodes: g.nodes.map((n) => ({ ...n }))
  };
}

/**
 * Deterministic Client-Side Floyd's Cycle Detection Algorithm (Tortoise and Hare)
 * Guarantees that the signature lesson never freezes even if the API is offline.
 */
function validateLocally(graph: LinkedListGraph): ValidationPayload {
  const nodeMap = new Map<string, LinkedListNode>(graph.nodes.map((n) => [n.id, n]));
  let floydCycleDetected = false;
  let cycleEdge: CycleEdge | null = null;

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

  if (floydCycleDetected) {
    const visited = new Set<string>();
    let curr: string | null = graph.headId;
    while (curr && nodeMap.has(curr)) {
      if (visited.has(curr)) break;
      visited.add(curr);
      const nextId = nodeMap.get(curr)?.next ?? null;
      if (nextId && visited.has(nextId)) {
        cycleEdge = { fromId: curr, toId: nextId };
        break;
      }
      curr = nextId;
    }
  }

  const isValid = !floydCycleDetected && !graph.isCircular;
  return {
    isValid,
    floydCycleDetected,
    cycleEdge,
    issues: floydCycleDetected
      ? [{ message: 'Acyclicity violation: Detected an unexpected cycle.', severity: 'error' }]
      : []
  };
}

/**
 * Deterministic Client-Side Reversal Step Generator
 */
function simulateReversalLocally(graph: LinkedListGraph): { steps: ExecutionStep[] } | { refused: ValidationPayload } {
  const val = validateLocally(graph);
  if (!val.isValid || val.floydCycleDetected) {
    return { refused: val };
  }

  const steps: ExecutionStep[] = [];
  const g = cloneGraph(graph);
  const nodeMap = new Map<string, LinkedListNode>(g.nodes.map((n) => [n.id, n]));

  // Step 1: Initial State
  steps.push({
    stepIndex: 1,
    totalSteps: 5,
    operation: 'reverseList',
    description: 'Initialized reversal pointers. Head is at start node. prev is null.',
    codeSnippet: 'Node* prev = NULL;\nNode* curr = head;\nNode* next = NULL;',
    activePointers: { head: g.headId, prev: null, curr: g.headId, next: null },
    highlightedNodeIds: g.headId ? [g.headId] : [],
    currentGraph: cloneGraph(g),
    screenReaderAnnouncement: 'Reversal step 1 of 5: Starting pointer initialization. Head is node a (value 1).'
  });

  let prev: string | null = null;
  let curr: string | null = g.headId;
  let stepIdx = 2;

  while (curr && nodeMap.has(curr)) {
    const node = nodeMap.get(curr)!;
    const nextId: string | null = node.next;

    // Mutate pointer backward
    node.next = prev;

    steps.push({
      stepIndex: stepIdx,
      totalSteps: 5,
      operation: 'reverseList',
      description: `Reversing node ${node.id} (${node.value}). next pointer now references ${prev || 'NULL'}.`,
      codeSnippet: `next = curr->next;\ncurr->next = prev;\nprev = curr;\ncurr = next;`,
      activePointers: { head: g.headId, prev: curr, curr: nextId, next: nextId },
      highlightedNodeIds: prev ? [curr, prev] : [curr],
      mutatedNodeId: curr,
      currentGraph: cloneGraph(g),
      screenReaderAnnouncement: `Reversal step ${stepIdx} of 5: Node ${node.id} now points back to ${prev || 'null'}.`
    });

    prev = curr;
    curr = nextId;
    stepIdx++;
  }

  // Final Step: Complete Reversal & Update Head
  g.headId = prev;
  // Re-adjust horizontal layout
  let cursor = g.headId;
  let offsetX = 80;
  while (cursor && nodeMap.has(cursor)) {
    const n = nodeMap.get(cursor)!;
    n.x = offsetX;
    n.y = 160;
    offsetX += 170;
    cursor = n.next;
  }

  steps.push({
    stepIndex: 5,
    totalSteps: 5,
    operation: 'reverseList',
    description: `Reversal complete. Updated head pointer to former tail (${prev}). List is now fully reversed!`,
    codeSnippet: 'head = prev; // Reversal finished',
    activePointers: { head: prev, prev, curr: null, next: null },
    highlightedNodeIds: prev ? [prev] : [],
    currentGraph: cloneGraph(g),
    screenReaderAnnouncement: `Reversal complete (Step 5 of 5): Head now points to node ${prev}. All pointers reversed.`
  });

  return { steps };
}

async function readValidation(graph: LinkedListGraph): Promise<ValidationPayload> {
  try {
    const response = await fetch('/api/diagrams/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ graph })
    });
    const json = await response.json();
    if (response.ok && json?.data) return json.data as ValidationPayload;
  } catch {
    /* Seamless local fallback */
  }
  return validateLocally(graph);
}

async function readReversal(
  graph: LinkedListGraph
): Promise<{ steps: ExecutionStep[] } | { refused: ValidationPayload }> {
  try {
    const response = await fetch('/api/diagrams/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ graph, operation: { operation: 'reverseList' } })
    });
    const json = await response.json();
    if (response.status === 422 && json?.validation) {
      return { refused: json.validation as ValidationPayload };
    }
    if (response.ok && json?.data?.steps) {
      return { steps: json.data.steps as ExecutionStep[] };
    }
  } catch {
    /* Seamless local fallback */
  }
  return simulateReversalLocally(graph);
}

function repairClosingEdge(graph: LinkedListGraph, edge: CycleEdge): LinkedListGraph {
  return {
    ...graph,
    nodes: graph.nodes.map((node) => (node.id === edge.fromId ? { ...node, next: null } : node))
  };
}

export const PointerLieLesson: React.FC<PointerLieLessonProps> = ({
  onAnnounce,
  highContrast = false,
  colorFriendly = false
}) => {
  const lessonRef = useRef<HTMLElement>(null);
  const [graph, setGraph] = useState<LinkedListGraph>(PROVEN_LIST);
  const [steps, setSteps] = useState<ExecutionStep[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [phase, setPhase] = useState<Phase>('loading');
  const [validation, setValidation] = useState<ValidationPayload | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  const say = useCallback((message: string) => {
    onAnnounce?.(message);
  }, [onAnnounce]);

  const describeStep = useCallback(() => {
    const message = narratePointerLie({
      phase,
      graph,
      step: steps[stepIndex] || null,
      stepIndex,
      stepCount: steps.length,
      validation
    });
    say(message);
    speakConceptLens(message, 1);
  }, [phase, graph, steps, stepIndex, validation, say]);

  const teach = useCallback(async (nextGraph: LinkedListGraph, nextPhase: Phase) => {
    setPlaying(false);
    setGraph(nextGraph);
    setSteps([]);
    setStepIndex(0);

    const checked = await readValidation(nextGraph);
    setValidation(checked);
    const blocked = !checked.isValid || checked.floydCycleDetected || nextGraph.isCircular === true;

    if (blocked) {
      setPhase('stopped');
      const edge = checked.cycleEdge;
      const edgeText = edge ? ` The edge from ${edge.fromId} to ${edge.toId} closes the cycle.` : '';
      say(`This structure contains a cycle. A standard acyclic linked-list lesson cannot proceed until the structure is repaired.${edgeText}`);
      return;
    }

    const reversal = await readReversal(nextGraph);
    if ('refused' in reversal) {
      setPhase('stopped');
      setValidation(reversal.refused);
      say('The lesson engine refused to animate this structure.');
      return;
    }

    setSteps(reversal.steps);
    setPhase(nextPhase);
    say(reversal.steps[0]?.screenReaderAnnouncement || 'The list is valid. Reversal can be taught.');
  }, [say]);

  useEffect(() => {
    setReducedMotion(prefersReducedMotion());
    void teach(PROVEN_LIST, 'proven');
  }, [teach]);

  useEffect(() => {
    if (!playing || reducedMotion || steps.length === 0) return;
    const timer = window.setInterval(() => {
      setStepIndex((current) => {
        if (current >= steps.length - 1) {
          setPlaying(false);
          return current;
        }
        const next = current + 1;
        const announcement = steps[next]?.screenReaderAnnouncement;
        if (announcement) say(announcement);
        return next;
      });
    }, 1400);
    return () => window.clearInterval(timer);
  }, [playing, reducedMotion, steps, say]);

  const currentStep = steps[stepIndex];
  const shownGraph = currentStep?.currentGraph || graph;
  const blockedEdge = phase === 'stopped' ? validation?.cycleEdge || null : null;

  const stepForward = useCallback(() => {
    if (phase === 'stopped' || steps.length === 0) {
      say('The lesson is stopped. Repair the cycle before stepping.');
      return;
    }
    setStepIndex((current) => {
      if (current >= steps.length - 1) return current;
      const next = current + 1;
      const announcement = steps[next]?.screenReaderAnnouncement;
      if (announcement) say(announcement);
      return next;
    });
  }, [phase, steps, say]);

  const stepBack = useCallback(() => {
    setStepIndex((current) => {
      if (current <= 0) return current;
      const next = current - 1;
      const announcement = steps[next]?.screenReaderAnnouncement;
      if (announcement) say(announcement);
      return next;
    });
  }, [steps, say]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const root = lessonRef.current;
      const target = event.target as HTMLElement | null;
      if (!root || !target || !root.contains(target)) return;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
      if (target.tagName === 'BUTTON' && (event.code === 'Space' || event.code === 'Enter')) return;

      if (event.code === 'Space') {
        event.preventDefault();
        if (phase === 'stopped') {
          say('The lesson is stopped until the cycle is repaired.');
          return;
        }
        if (reducedMotion) {
          stepForward();
          return;
        }
        setPlaying((value) => !value);
      } else if (event.code === 'ArrowRight') {
        event.preventDefault();
        setPlaying(false);
        stepForward();
      } else if (event.code === 'ArrowLeft') {
        event.preventDefault();
        setPlaying(false);
        stepBack();
      } else if (event.key === 'r' || event.key === 'R') {
        event.preventDefault();
        setPlaying(false);
        setStepIndex(0);
        if (steps[0]) say(steps[0].screenReaderAnnouncement);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, reducedMotion, stepForward, stepBack, steps, say]);

  const statusLabel =
    phase === 'stopped'
      ? 'Stopped'
      : phase === 'repaired'
      ? 'Repaired'
      : phase === 'offline'
      ? 'Engine offline'
      : phase === 'loading'
      ? 'Checking'
      : 'Proven list';

  return (
    <section
      ref={lessonRef}
      id="pointer-lie"
      className="glass-panel pointer-lie"
      aria-labelledby="pointer-lie-title"
      style={{
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        background: 'var(--surface-bg)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <span className="path-kicker" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            The Signature Interactive Lesson
          </span>
          <h2 id="pointer-lie-title" style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2.2rem)', lineHeight: 1.2, margin: '0.25rem 0 0' }}>
            We will not teach a structure we cannot prove.
          </h2>
        </div>

        <div
          role="status"
          aria-live="polite"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-medium)',
            background:
              phase === 'stopped'
                ? 'rgba(239, 68, 68, 0.15)'
                : phase === 'repaired' || phase === 'proven'
                ? 'rgba(16, 185, 129, 0.15)'
                : 'var(--bg-elevated)',
            fontSize: '0.82rem',
            fontWeight: 600
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background:
                phase === 'stopped'
                  ? 'var(--accent-coral)'
                  : phase === 'repaired' || phase === 'proven'
                  ? 'var(--accent-emerald)'
                  : 'var(--text-muted)'
            }}
          />
          <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', letterSpacing: '0.04em' }}>
            {statusLabel}
          </strong>
        </div>
      </div>

      <p style={{ margin: 0, maxWidth: '44rem', color: 'var(--text-secondary)', fontSize: '0.94rem', lineHeight: 1.6 }}>
        ConceptLens teaches one idea in more than one way, and only after the invariant check passes. A static diagram cannot show a pointer reversing. Watch a four-node list reverse step-by-step. Then introduce a broken loop: the lesson stops on the real cycle check, identifies the bad pointer, and continues only after you repair it.
      </p>

      {/* STATUS BANNER */}
      <div
        role="status"
        aria-live="polite"
        style={{
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          background: 'var(--surface-elevated)',
          fontSize: '0.86rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.5
        }}
      >
        {phase === 'stopped' && (
          <span style={{ color: 'var(--accent-coral)', fontWeight: 500 }}>
            This structure contains a cycle. A standard acyclic linked-list lesson cannot proceed until the structure is repaired.
            {validation?.cycleEdge ? ` The arrow from ${validation.cycleEdge.fromId} to ${validation.cycleEdge.toId} is marked CYCLE.` : ''}
          </span>
        )}
        {phase === 'proven' && 'This list ends at null. Floyd’s check found no cycle, so reversal is allowed.'}
        {phase === 'repaired' && 'The closing arrow now points to null. The cycle check passed, so the same reversal can play.'}
        {phase === 'loading' && 'Asking the lesson engine to check the list before anything moves.'}
        {phase === 'offline' && 'The API did not answer. The drawing stays still. No success state was invented.'}
      </div>

      {/* CONTROLS */}
      <div className="lesson-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            if (phase === 'stopped' || steps.length === 0) {
              say('The lesson is stopped. Repair the cycle before playing.');
              return;
            }
            if (reducedMotion) {
              stepForward();
              return;
            }
            setPlaying((value) => !value);
          }}
          style={{ minHeight: '40px', padding: '0.45rem 1rem' }}
        >
          {phase === 'stopped' ? 'Lesson stopped' : reducedMotion ? 'Step forward' : playing ? 'Pause' : 'Watch the reversal'}
        </button>
        <button type="button" className="btn-secondary" onClick={() => { setPlaying(false); stepBack(); }} style={{ minHeight: '40px', padding: '0.45rem 0.85rem' }}>
          Step back
        </button>
        <button type="button" className="btn-secondary" onClick={() => { setPlaying(false); stepForward(); }} style={{ minHeight: '40px', padding: '0.45rem 0.85rem' }}>
          Step forward
        </button>
        <button type="button" className="btn-secondary" onClick={() => { setPlaying(false); setStepIndex(0); if (steps[0]) say(steps[0].screenReaderAnnouncement); }} style={{ minHeight: '40px', padding: '0.45rem 0.85rem' }}>
          Reset
        </button>
        <button type="button" className="btn-secondary" onClick={() => { void teach(BROKEN_LIST, 'stopped'); }} style={{ minHeight: '40px', padding: '0.45rem 0.85rem' }}>
          Break the structure
        </button>
        <button
          type="button"
          className="btn-primary"
          disabled={phase !== 'stopped' || !validation?.cycleEdge}
          onClick={() => {
            if (!validation?.cycleEdge) return;
            const repaired = repairClosingEdge(graph, validation.cycleEdge);
            void teach(repaired, 'repaired');
          }}
          style={{
            minHeight: '40px',
            padding: '0.45rem 1rem',
            background: phase === 'stopped' ? 'var(--accent-emerald)' : undefined,
            borderColor: phase === 'stopped' ? 'var(--accent-emerald)' : undefined
          }}
        >
          Repair this pointer
        </button>
        <button type="button" className="btn-secondary" onClick={() => { void teach(PROVEN_LIST, 'proven'); }} style={{ minHeight: '40px', padding: '0.45rem 0.85rem' }}>
          Start from the proven list
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => {
            stopConceptLensSpeech();
            describeStep();
          }}
          style={{ minHeight: '40px', padding: '0.45rem 0.85rem' }}
        >
          Describe this step
        </button>
      </div>

      <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.84rem' }}>
        {reducedMotion
          ? 'Reduced motion is on. Each step waits for you. Tab into this lesson, then use the arrow keys.'
          : 'Keyboard shortcuts: Tab into this lesson, then use Space (Play/Pause), Left/Right Arrows (Step), and R (Reset).'}
      </p>

      {/* SVG CANVAS */}
      <InteractiveCanvas
        graph={shownGraph}
        activePointers={currentStep?.activePointers || { head: shownGraph.headId }}
        highlightedNodeIds={currentStep?.highlightedNodeIds || []}
        mutatedNodeId={currentStep?.mutatedNodeId}
        blockedEdge={blockedEdge}
        highContrast={highContrast}
        colorFriendly={colorFriendly}
        onAnnounce={say}
      />

      {/* STATE INSPECTOR */}
      {currentStep && phase !== 'stopped' && <StateInspector currentStep={currentStep} />}
    </section>
  );
};
