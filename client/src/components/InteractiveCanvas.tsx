import React, { useState, useRef, useCallback } from 'react';
import { LinkedListGraph, LinkedListNode } from '@conceptlens/shared';

interface InteractiveCanvasProps {
  graph: LinkedListGraph;
  activePointers: Record<string, string | null>;
  highlightedNodeIds: string[];
  mutatedNodeId?: string;
  onSelectNode?: (node: LinkedListNode) => void;
  highContrast?: boolean;
  colorFriendly?: boolean;
  onAnnounce?: (msg: string) => void;
}

export const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({
  graph,
  activePointers,
  highlightedNodeIds,
  mutatedNodeId,
  onSelectNode,
  highContrast = false,
  colorFriendly = false,
  onAnnounce
}) => {
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const nodeRefs = useRef<Map<string, SVGGElement>>(new Map());

  const nodeMap = new Map<string, LinkedListNode>(graph.nodes.map((n) => [n.id, n]));
  const isDoubly = graph.structureType === 'doubly' || graph.nodes.some((n) => n.prev !== undefined);

  // Find pointer labels pointing to each node
  const getPointerBadges = (nodeId: string) => {
    const badges: string[] = [];
    for (const [ptrName, targetId] of Object.entries(activePointers)) {
      if (targetId === nodeId) {
        badges.push(ptrName);
      }
    }
    return badges;
  };

  // Keyboard navigation across nodes: ArrowRight, ArrowLeft, Home, End
  const handleNodeKeyDown = useCallback(
    (e: React.KeyboardEvent<SVGGElement>, node: LinkedListNode, currentIndex: number) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % graph.nodes.length;
        const nextNode = graph.nodes[nextIndex];
        if (nextNode) {
          nodeRefs.current.get(nextNode.id)?.focus();
          setFocusedNodeId(nextNode.id);
          onAnnounce?.(`Focused node ${nextNode.id}, value ${nextNode.value}`);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = (currentIndex - 1 + graph.nodes.length) % graph.nodes.length;
        const prevNode = graph.nodes[prevIndex];
        if (prevNode) {
          nodeRefs.current.get(prevNode.id)?.focus();
          setFocusedNodeId(prevNode.id);
          onAnnounce?.(`Focused node ${prevNode.id}, value ${prevNode.value}`);
        }
      } else if (e.key === 'Home') {
        e.preventDefault();
        const firstNode = graph.nodes[0];
        if (firstNode) {
          nodeRefs.current.get(firstNode.id)?.focus();
          setFocusedNodeId(firstNode.id);
          onAnnounce?.(`Focused head node ${firstNode.id}`);
        }
      } else if (e.key === 'End') {
        e.preventDefault();
        const lastNode = graph.nodes[graph.nodes.length - 1];
        if (lastNode) {
          nodeRefs.current.get(lastNode.id)?.focus();
          setFocusedNodeId(lastNode.id);
          onAnnounce?.(`Focused tail node ${lastNode.id}`);
        }
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelectNode?.(node);
        onAnnounce?.(`Selected node ${node.id}, value ${node.value}`);
      }
    },
    [graph.nodes, onSelectNode, onAnnounce]
  );

  // Palette & Pattern tokens (respecting high-contrast & color-friendly modes)
  const isColorIndependent = highContrast || colorFriendly;
  const strokeNormal = highContrast ? '#ffffff' : '#38bdf8';
  const strokeMutated = highContrast ? '#ffff00' : isColorIndependent ? '#fb7185' : '#f43f5e';
  const strokePrev = highContrast ? '#00ffff' : isColorIndependent ? '#fcd34d' : '#f59e0b';
  const strokeCircular = highContrast ? '#ffffff' : '#c084fc';
  const strokeBorderDefault = highContrast ? '#ffffff' : '#334155';
  const fillSurface = highContrast ? '#000000' : '#0f172a';
  const fillSubBox = highContrast ? '#111111' : '#1e293b';

  return (
    <div
      className="canvas-wrapper"
      role="region"
      aria-label="Interactive Linked List Diagram with accessible keyboard navigation"
    >
      {/* Redundant text summary for screen readers & high-contrast mode */}
      <div className="sr-only" aria-live="polite">
        {`Linked list diagram: ${graph.nodes.length} nodes. Head is ${graph.headId || 'NULL'}. ${
          isDoubly ? 'Doubly linked list.' : graph.isCircular ? 'Circular linked list.' : 'Singly linked list.'
        }`}
      </div>

      <svg
        viewBox="0 0 960 410"
        className="w-full h-full"
        style={{ minHeight: '360px' }}
        role="group"
        aria-label="Linked List Graphical Model"
      >
        <defs>
          {/* Arrowhead marker for normal forward next links */}
          <marker
            id="arrowhead-next"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="8"
            markerHeight="8"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill={strokeNormal} />
          </marker>

          {/* Arrowhead marker for active mutating links */}
          <marker
            id="arrowhead-active"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="9"
            markerHeight="9"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 L 3 5 z" fill={strokeMutated} />
          </marker>

          {/* Arrowhead marker for backward prev links in doubly linked lists */}
          <marker
            id="arrowhead-prev"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="8"
            markerHeight="8"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill={strokePrev} />
          </marker>

          {/* Arrowhead marker for circular return loop */}
          <marker
            id="arrowhead-circular"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="8"
            markerHeight="8"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill={strokeCircular} />
          </marker>

          {/* SVG Hatch Pattern for Mutated Node (Color-blind & grayscale accessible) */}
          <pattern
            id="pattern-mutated"
            width="12"
            height="12"
            patternTransform="rotate(45 0 0)"
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="12"
              stroke={strokeMutated}
              strokeWidth="2.5"
              strokeOpacity="0.45"
            />
          </pattern>

          {/* SVG Dot Pattern for Visited / Highlighted Node */}
          <pattern
            id="pattern-highlight"
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx="4"
              cy="4"
              r="1.5"
              fill={strokeNormal}
              fillOpacity="0.5"
            />
          </pattern>

          {/* Filter for glowing active nodes */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Empty list notice */}
        {(!graph.headId || graph.nodes.length === 0) && (
          <text
            x="480"
            y="200"
            textAnchor="middle"
            fill={highContrast ? '#ffffff' : '#64748b'}
            fontSize="18"
            fontFamily="var(--font-heading)"
          >
            Linked list is currently empty. Head = NULL
          </text>
        )}

        {/* 1. Forward Pointers (next) */}
        {graph.nodes.map((node) => {
          if (!node.next) return null;
          const targetNode = nodeMap.get(node.next);
          if (!targetNode) return null;

          const isMutating = mutatedNodeId === node.id;
          const isCircularLoop = graph.isCircular && node.next === graph.headId && node.x > targetNode.x;

          // Compute start and end coordinates
          const startX = node.x + 110;
          const startY = isDoubly ? node.y + 24 : node.y + 35;
          const endX = targetNode.x - 10;
          const endY = isDoubly ? targetNode.y + 24 : targetNode.y + 35;

          if (isCircularLoop) {
            // Sweeping arc from tail back to head underneath the list
            const arcPath = `M ${startX} ${node.y + 35} C ${startX + 50} ${node.y + 140}, ${targetNode.x - 50} ${
              targetNode.y + 140
            }, ${targetNode.x + 55} ${targetNode.y + 75}`;
            return (
              <g key={`circular-loop-${node.id}-${targetNode.id}`}>
                <path
                  d={arcPath}
                  fill="none"
                  stroke={strokeCircular}
                  strokeWidth={highContrast ? '3' : '2.5'}
                  strokeDasharray="8,4"
                  markerEnd="url(#arrowhead-circular)"
                />
                {/* Redundant Text Label */}
                <rect
                  x="380"
                  y={node.y + 132}
                  width="200"
                  height="22"
                  rx="4"
                  fill="#020617"
                  stroke={strokeCircular}
                  strokeWidth="1"
                />
                <text
                  x="480"
                  y={node.y + 147}
                  textAnchor="middle"
                  fill={strokeCircular}
                  fontSize="11"
                  fontFamily="var(--font-mono)"
                  fontWeight="700"
                >
                  ↺ circular: tail.next → head
                </text>
              </g>
            );
          }

          const isForward = endX > startX;
          const pathD =
            isForward && isDoubly
              ? `M ${startX} ${startY} Q ${(startX + endX) / 2} ${startY - 22} ${endX} ${endY}`
              : isForward
              ? `M ${startX} ${startY} L ${endX} ${endY}`
              : `M ${startX} ${startY} C ${startX + 40} ${startY - 60}, ${endX - 40} ${endY - 60}, ${endX} ${endY}`;

          const midX = (startX + endX) / 2;
          const midY = isDoubly ? (startY + endY) / 2 - 16 : (startY + endY) / 2 - 10;

          return (
            <g key={`next-arrow-${node.id}-${targetNode.id}`}>
              <path
                d={pathD}
                fill="none"
                stroke={isMutating ? strokeMutated : strokeNormal}
                strokeWidth={isMutating ? '3.5' : '2.5'}
                strokeDasharray={isMutating ? '6,4' : 'none'}
                markerEnd={isMutating ? 'url(#arrowhead-active)' : 'url(#arrowhead-next)'}
              />
              {/* Redundant text badge along edge for non-color identification */}
              <g transform={`translate(${midX - 22}, ${midY - 8})`}>
                <rect
                  x="0"
                  y="0"
                  width={isMutating ? '54' : '44'}
                  height="16"
                  rx="3"
                  fill="#020617"
                  stroke={isMutating ? strokeMutated : strokeNormal}
                  strokeWidth="1"
                />
                <text
                  x={isMutating ? 27 : 22}
                  y="12"
                  textAnchor="middle"
                  fill={isMutating ? strokeMutated : strokeNormal}
                  fontSize="9"
                  fontFamily="var(--font-mono)"
                  fontWeight="700"
                >
                  {isMutating ? 'rewiring ⚡' : 'next →'}
                </text>
              </g>
            </g>
          );
        })}

        {/* 2. Backward Pointers (prev) for Doubly Linked Lists */}
        {isDoubly &&
          graph.nodes.map((node) => {
            if (!node.prev) return null;
            const prevTarget = nodeMap.get(node.prev);
            if (!prevTarget) return null;

            const isMutating = mutatedNodeId === node.id || mutatedNodeId === prevTarget.id;
            const startX = node.x;
            const startY = node.y + 46;
            const endX = prevTarget.x + 110;
            const endY = prevTarget.y + 46;

            const pathD = `M ${startX} ${startY} Q ${(startX + endX) / 2} ${startY + 30} ${endX} ${endY}`;
            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2 + 18;

            return (
              <g key={`prev-arrow-${node.id}-${prevTarget.id}`}>
                <path
                  d={pathD}
                  fill="none"
                  stroke={isMutating ? strokeMutated : strokePrev}
                  strokeWidth="2.5"
                  strokeDasharray="3,3"
                  markerEnd="url(#arrowhead-prev)"
                />
                {/* Redundant label for backward pointer */}
                <g transform={`translate(${midX - 20}, ${midY})`}>
                  <rect
                    x="0"
                    y="0"
                    width="40"
                    height="16"
                    rx="3"
                    fill="#020617"
                    stroke={strokePrev}
                    strokeWidth="1"
                  />
                  <text
                    x="20"
                    y="12"
                    textAnchor="middle"
                    fill={strokePrev}
                    fontSize="9"
                    fontFamily="var(--font-mono)"
                    fontWeight="700"
                  >
                    ← prev
                  </text>
                </g>
              </g>
            );
          })}

        {/* 3. NULL Terminators for Singly/Doubly lists */}
        {!graph.isCircular &&
          graph.nodes.map((node) => {
            if (node.next !== null) return null;
            const startX = node.x + 110;
            const startY = isDoubly ? node.y + 24 : node.y + 35;

            return (
              <g key={`null-next-${node.id}`}>
                <line
                  x1={startX}
                  y1={startY}
                  x2={startX + 32}
                  y2={startY}
                  stroke={highContrast ? '#ffffff' : '#64748b'}
                  strokeWidth="2"
                  markerEnd="url(#arrowhead-next)"
                />
                <rect
                  x={startX + 32}
                  y={startY - 14}
                  width="44"
                  height="28"
                  rx="4"
                  fill="#1e293b"
                  stroke={highContrast ? '#ffffff' : '#475569'}
                  strokeWidth="2"
                />
                <text
                  x={startX + 54}
                  y={startY + 4}
                  textAnchor="middle"
                  fill={highContrast ? '#ffffff' : '#94a3b8'}
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="var(--font-mono)"
                >
                  NULL
                </text>
                {/* Grounding terminal electrical symbol (non-color indicator of termination) */}
                <line
                  x1={startX + 46}
                  y1={startY + 18}
                  x2={startX + 62}
                  y2={startY + 18}
                  stroke="#94a3b8"
                  strokeWidth="2"
                />
                <line
                  x1={startX + 50}
                  y1={startY + 21}
                  x2={startX + 58}
                  y2={startY + 21}
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                />
              </g>
            );
          })}

        {/* 4. Left NULL Terminator for Head node in Doubly Linked List */}
        {isDoubly &&
          graph.nodes.map((node) => {
            if (node.prev !== null) return null;
            const startX = node.x;
            const startY = node.y + 46;

            return (
              <g key={`null-prev-${node.id}`}>
                <line
                  x1={startX}
                  y1={startY}
                  x2={startX - 32}
                  y2={startY}
                  stroke={strokePrev}
                  strokeWidth="2"
                  strokeDasharray="3,3"
                  markerEnd="url(#arrowhead-prev)"
                />
                <rect
                  x={startX - 76}
                  y={startY - 14}
                  width="44"
                  height="28"
                  rx="4"
                  fill="#1e293b"
                  stroke={strokePrev}
                  strokeWidth="2"
                />
                <text
                  x={startX - 54}
                  y={startY + 4}
                  textAnchor="middle"
                  fill={strokePrev}
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="var(--font-mono)"
                >
                  NULL
                </text>
              </g>
            );
          })}

        {/* 5. Render Nodes with Redundant Geometric and Text Indicators */}
        {graph.nodes.map((node, idx) => {
          const isHead = node.id === graph.headId;
          const isTail = node.next === null || idx === graph.nodes.length - 1;
          const isHighlighted = highlightedNodeIds.includes(node.id);
          const isMutated = mutatedNodeId === node.id;
          const isFocused = focusedNodeId === node.id;
          const badges = getPointerBadges(node.id);
          const address = node.address || `0x${(0x1020 + idx * 0x20).toString(16).toUpperCase()}`;

          // Descriptive status string for aria-label
          const stateTags: string[] = [];
          if (isHead) stateTags.push('HEAD node');
          if (isTail) stateTags.push('TAIL node');
          if (isMutated) stateTags.push('currently mutating');
          if (isHighlighted) stateTags.push('visited step');
          if (badges.length > 0) stateTags.push(`Pointers: ${badges.join(', ')}`);

          const nodeDescription = `Node ${idx + 1} of ${graph.nodes.length}: ID ${node.id}, Value ${
            node.value
          }, Address ${address}, Next ${node.next || 'NULL'}${isDoubly ? `, Prev ${node.prev || 'NULL'}` : ''}. ${stateTags.join(
            ', '
          )}. Use Left/Right arrow keys to navigate nodes.`;

          return (
            <g
              key={node.id}
              ref={(el) => {
                if (el) nodeRefs.current.set(node.id, el);
                else nodeRefs.current.delete(node.id);
              }}
              tabIndex={0}
              role="button"
              aria-label={nodeDescription}
              onClick={() => onSelectNode?.(node)}
              onFocus={() => {
                setFocusedNodeId(node.id);
                onAnnounce?.(`Focused node ${node.id}, value ${node.value}`);
              }}
              onBlur={() => setFocusedNodeId(null)}
              onKeyDown={(e) => handleNodeKeyDown(e, node, idx)}
              className="canvas-node"
              style={{ cursor: 'pointer' }}
            >
              {/* Visible Focus Indicator Ring (High visibility for keyboard navigation) */}
              {isFocused && (
                <rect
                  x={node.x - 7}
                  y={node.y - 7}
                  width="124"
                  height="84"
                  rx="14"
                  fill="none"
                  stroke={highContrast ? '#ffff00' : 'var(--focus-ring, #65e5f2)'}
                  strokeWidth="3.5"
                  strokeDasharray="none"
                />
              )}

              {/* Node Outer Container (Base Rectangle) */}
              <rect
                x={node.x}
                y={node.y}
                width="110"
                height="70"
                rx="8"
                fill={isMutated ? 'url(#pattern-mutated)' : isHighlighted ? 'url(#pattern-highlight)' : fillSurface}
                stroke={
                  isMutated
                    ? strokeMutated
                    : isHighlighted
                    ? strokeNormal
                    : isHead
                    ? strokeNormal
                    : strokeBorderDefault
                }
                strokeWidth={isMutated ? '3.5' : isHighlighted || isHead ? '2.5' : '2'}
                strokeDasharray={isMutated ? '6,3' : 'none'}
              />

              {/* Distinct Inner Double-Border for HEAD Node (Non-color shape cue) */}
              {isHead && (
                <rect
                  x={node.x + 3}
                  y={node.y + 3}
                  width="104"
                  height="64"
                  rx="6"
                  fill="none"
                  stroke={strokeNormal}
                  strokeWidth="1.5"
                  strokeDasharray="none"
                />
              )}

              {/* Doubly Linked List: Left Prev Pointer Sub-box */}
              {isDoubly ? (
                <>
                  <rect
                    x={node.x}
                    y={node.y}
                    width="26"
                    height="70"
                    rx="8"
                    fill={fillSubBox}
                    stroke={strokeBorderDefault}
                    strokeWidth="1"
                  />
                  <line
                    x1={node.x + 26}
                    y1={node.y}
                    x2={node.x + 26}
                    y2={node.y + 70}
                    stroke={strokeBorderDefault}
                    strokeWidth="1.5"
                  />
                  {/* Prev pointer circle/square marker */}
                  <rect
                    x={node.x + 8}
                    y={node.y + 41}
                    width="10"
                    height="10"
                    rx="2"
                    fill={node.prev ? strokePrev : '#64748b'}
                  />
                  <text
                    x={node.x + 13}
                    y={node.y + 20}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="8"
                    fontFamily="var(--font-mono)"
                    fontWeight="700"
                  >
                    P
                  </text>

                  {/* Data Value in Center */}
                  <text
                    x={node.x + 55}
                    y={node.y + 42}
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize="18"
                    fontWeight="700"
                    fontFamily="var(--font-heading)"
                  >
                    {node.value}
                  </text>

                  {/* Right Next Pointer Sub-box */}
                  <line
                    x1={node.x + 84}
                    y1={node.y}
                    x2={node.x + 84}
                    y2={node.y + 70}
                    stroke={strokeBorderDefault}
                    strokeWidth="1.5"
                  />
                  <circle
                    cx={node.x + 97}
                    cy={node.y + 24}
                    r="5"
                    fill={node.next ? strokeNormal : '#64748b'}
                  />
                  <text
                    x={node.x + 97}
                    y={node.y + 54}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="8"
                    fontFamily="var(--font-mono)"
                    fontWeight="700"
                  >
                    N
                  </text>
                </>
              ) : (
                /* Singly Linked List: Data (Left) and Pointer (Right) */
                <>
                  <rect
                    x={node.x}
                    y={node.y}
                    width="70"
                    height="70"
                    rx="8"
                    fill={fillSubBox}
                    stroke={strokeBorderDefault}
                    strokeWidth="1"
                  />
                  <line
                    x1={node.x + 70}
                    y1={node.y}
                    x2={node.x + 70}
                    y2={node.y + 70}
                    stroke={strokeBorderDefault}
                    strokeWidth="1.5"
                  />
                  <text
                    x={node.x + 35}
                    y={node.y + 42}
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize="18"
                    fontWeight="700"
                    fontFamily="var(--font-heading)"
                  >
                    {node.value}
                  </text>
                  <circle
                    cx={node.x + 90}
                    cy={node.y + 35}
                    r="6"
                    fill={node.next ? strokeNormal : '#64748b'}
                  />
                  <text
                    x={node.x + 90}
                    y={node.y + 58}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="9"
                    fontFamily="var(--font-mono)"
                    fontWeight="700"
                  >
                    next
                  </text>
                </>
              )}

              {/* Node ID label (Top Left) */}
              <text
                x={node.x + 5}
                y={node.y - 10}
                fill={highContrast ? '#ffffff' : '#94a3b8'}
                fontSize="10"
                fontFamily="var(--font-mono)"
                fontWeight="600"
              >
                {node.id}
              </text>

              {/* Redundant Role Badge (Top Right of Node): HEAD / MUTATING / VISITED */}
              {isMutated ? (
                <g transform={`translate(${node.x + 38}, ${node.y - 18})`}>
                  <rect
                    x="0"
                    y="0"
                    width="70"
                    height="18"
                    rx="4"
                    fill="#991b1b"
                    stroke={strokeMutated}
                    strokeWidth="1.5"
                  />
                  <text
                    x="35"
                    y="13"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="var(--font-mono)"
                  >
                    ⚡ MUTATING
                  </text>
                </g>
              ) : isHead ? (
                <g transform={`translate(${node.x + 52}, ${node.y - 18})`}>
                  <rect
                    x="0"
                    y="0"
                    width="56"
                    height="18"
                    rx="4"
                    fill="#0369a1"
                    stroke={strokeNormal}
                    strokeWidth="1.5"
                  />
                  <text
                    x="28"
                    y="13"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="var(--font-mono)"
                  >
                    ★ HEAD
                  </text>
                </g>
              ) : isHighlighted ? (
                <g transform={`translate(${node.x + 48}, ${node.y - 18})`}>
                  <rect
                    x="0"
                    y="0"
                    width="60"
                    height="18"
                    rx="4"
                    fill="#047857"
                    stroke="#10b981"
                    strokeWidth="1.5"
                  />
                  <text
                    x="30"
                    y="13"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="var(--font-mono)"
                  >
                    ● VISITED
                  </text>
                </g>
              ) : null}

              {/* Memory Address Pill (Bottom) */}
              <g transform={`translate(${node.x + 22}, ${node.y + 74})`}>
                <rect
                  x="0"
                  y="0"
                  width="66"
                  height="18"
                  rx="4"
                  fill="#020617"
                  stroke={highContrast ? '#ffffff' : '#334155'}
                  strokeWidth="1"
                />
                <text
                  x="33"
                  y="13"
                  textAnchor="middle"
                  fill={strokeNormal}
                  fontSize="10"
                  fontWeight="600"
                  fontFamily="var(--font-mono)"
                >
                  {address}
                </text>
              </g>

              {/* Active Pointer Badges (head, tail, newNode, curr, etc.) */}
              {badges.length > 0 && (
                <g>
                  {badges.map((b, bIdx) => (
                    <g key={b} transform={`translate(${node.x + bIdx * 48}, ${node.y + 98})`}>
                      <rect
                        x="0"
                        y="0"
                        width="46"
                        height="20"
                        rx="4"
                        fill={
                          b === 'head'
                            ? '#0284c7'
                            : b === 'tail'
                            ? '#4f46e5'
                            : b === 'newNode'
                            ? '#059669'
                            : b === 'target'
                            ? '#dc2626'
                            : '#6366f1'
                        }
                        stroke={highContrast ? '#ffffff' : 'none'}
                        strokeWidth="1"
                      />
                      <text
                        x="23"
                        y="14"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="10"
                        fontWeight="bold"
                        fontFamily="var(--font-mono)"
                      >
                        {b}
                      </text>
                      <polygon
                        points="20,-4 26,-4 23,0"
                        fill={
                          b === 'head'
                            ? '#0284c7'
                            : b === 'tail'
                            ? '#4f46e5'
                            : b === 'newNode'
                            ? '#059669'
                            : b === 'target'
                            ? '#dc2626'
                            : '#6366f1'
                        }
                      />
                    </g>
                  ))}
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
