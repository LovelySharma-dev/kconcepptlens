import React from 'react';
import { LinkedListGraph, LinkedListNode } from '@conceptlens/shared';

interface InteractiveCanvasProps {
  graph: LinkedListGraph;
  activePointers: Record<string, string | null>;
  highlightedNodeIds: string[];
  mutatedNodeId?: string;
  onSelectNode?: (node: LinkedListNode) => void;
}

export const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({
  graph,
  activePointers,
  highlightedNodeIds,
  mutatedNodeId,
  onSelectNode
}) => {
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

  return (
    <div className="canvas-wrapper" role="region" aria-label="Interactive Linked List Diagram Canvas">
      <svg
        viewBox="0 0 960 380"
        className="w-full h-full"
        style={{ minHeight: '340px' }}
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
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
          </marker>

          {/* Arrowhead marker for active mutating links */}
          <marker
            id="arrowhead-active"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="8"
            markerHeight="8"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e" />
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
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
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
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#c084fc" />
          </marker>

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
            y="190"
            textAnchor="middle"
            fill="#64748b"
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
            const arcPath = `M ${startX} ${node.y + 35} C ${startX + 50} ${node.y + 130}, ${targetNode.x - 50} ${targetNode.y + 130}, ${targetNode.x + 55} ${targetNode.y + 75}`;
            return (
              <g key={`circular-loop-${node.id}-${targetNode.id}`}>
                <path
                  d={arcPath}
                  fill="none"
                  stroke="#c084fc"
                  strokeWidth="2.5"
                  strokeDasharray="6,4"
                  markerEnd="url(#arrowhead-circular)"
                />
                <text
                  x="480"
                  y={node.y + 145}
                  textAnchor="middle"
                  fill="#c084fc"
                  fontSize="11"
                  fontFamily="var(--font-mono)"
                  fontWeight="600"
                >
                  Circular Link ↺ (Tail.next → Head)
                </text>
              </g>
            );
          }

          const isForward = endX > startX;
          const pathD = isForward
            ? `M ${startX} ${startY} L ${endX} ${endY}`
            : `M ${startX} ${startY} C ${startX + 40} ${startY - 60}, ${endX - 40} ${endY - 60}, ${endX} ${endY}`;

          return (
            <g key={`next-arrow-${node.id}-${targetNode.id}`}>
              <path
                d={pathD}
                fill="none"
                stroke={isMutating ? '#f43f5e' : '#38bdf8'}
                strokeWidth={isMutating ? '3.5' : '2.5'}
                strokeDasharray={isMutating ? '5,5' : 'none'}
                markerEnd={isMutating ? 'url(#arrowhead-active)' : 'url(#arrowhead-next)'}
              />
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

            const pathD = `M ${startX} ${startY} L ${endX} ${endY}`;

            return (
              <g key={`prev-arrow-${node.id}-${prevTarget.id}`}>
                <path
                  d={pathD}
                  fill="none"
                  stroke={isMutating ? '#f43f5e' : '#f59e0b'}
                  strokeWidth="2.2"
                  strokeDasharray="3,3"
                  markerEnd="url(#arrowhead-prev)"
                />
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
                  x2={startX + 30}
                  y2={startY}
                  stroke="#64748b"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead-next)"
                />
                <rect
                  x={startX + 30}
                  y={startY - 14}
                  width="36"
                  height="28"
                  rx="4"
                  fill="#1e293b"
                  stroke="#475569"
                  strokeWidth="1.5"
                />
                <text
                  x={startX + 48}
                  y={startY + 4}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="var(--font-mono)"
                >
                  NULL
                </text>
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
                  x2={startX - 30}
                  y2={startY}
                  stroke="#f59e0b"
                  strokeWidth="1.8"
                  strokeDasharray="3,3"
                  markerEnd="url(#arrowhead-prev)"
                />
                <rect
                  x={startX - 66}
                  y={startY - 14}
                  width="36"
                  height="28"
                  rx="4"
                  fill="#1e293b"
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                />
                <text
                  x={startX - 48}
                  y={startY + 4}
                  textAnchor="middle"
                  fill="#f59e0b"
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="var(--font-mono)"
                >
                  NULL
                </text>
              </g>
            );
          })}

        {/* 5. Render Nodes */}
        {graph.nodes.map((node, idx) => {
          const isHighlighted = highlightedNodeIds.includes(node.id);
          const isMutated = mutatedNodeId === node.id;
          const badges = getPointerBadges(node.id);
          const address = node.address || `0x${(0x1020 + idx * 0x20).toString(16).toUpperCase()}`;

          return (
            <g
              key={node.id}
              tabIndex={0}
              role="button"
              aria-label={`Node ID ${node.id}, Value ${node.value}, Address ${address}, Next ${node.next || 'NULL'}${isDoubly ? `, Prev ${node.prev || 'NULL'}` : ''}`}
              onClick={() => onSelectNode?.(node)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onSelectNode?.(node);
                }
              }}
              style={{ cursor: 'pointer', outline: 'none' }}
            >
              {/* Active Glow Backdrop */}
              {(isHighlighted || isMutated) && (
                <rect
                  x={node.x - 4}
                  y={node.y - 4}
                  width="118"
                  height="78"
                  rx="12"
                  fill="none"
                  stroke={isMutated ? '#f43f5e' : '#38bdf8'}
                  strokeWidth="2.5"
                  filter="url(#glow)"
                />
              )}

              {/* Memory Address Pill (Top) */}
              <g transform={`translate(${node.x + 22}, ${node.y - 24})`}>
                <rect
                  x="0"
                  y="0"
                  width="66"
                  height="18"
                  rx="4"
                  fill="#020617"
                  stroke="#334155"
                  strokeWidth="1"
                />
                <text
                  x="33"
                  y="13"
                  textAnchor="middle"
                  fill="#38bdf8"
                  fontSize="10"
                  fontWeight="600"
                  fontFamily="var(--font-mono)"
                >
                  {address}
                </text>
              </g>

              {/* Node Outer Container */}
              <rect
                x={node.x}
                y={node.y}
                width="110"
                height="70"
                rx="8"
                fill="#0f172a"
                stroke={isHighlighted ? '#38bdf8' : '#334155'}
                strokeWidth="2"
              />

              {/* Doubly Linked List: Left Prev Pointer Sub-box */}
              {isDoubly ? (
                <>
                  <rect
                    x={node.x}
                    y={node.y}
                    width="26"
                    height="70"
                    rx="8"
                    fill="#1e293b"
                  />
                  <line
                    x1={node.x + 26}
                    y1={node.y}
                    x2={node.x + 26}
                    y2={node.y + 70}
                    stroke="#334155"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx={node.x + 13}
                    cy={node.y + 46}
                    r="5"
                    fill={node.prev ? '#f59e0b' : '#64748b'}
                  />

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
                    stroke="#334155"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx={node.x + 97}
                    cy={node.y + 24}
                    r="5"
                    fill={node.next ? '#38bdf8' : '#64748b'}
                  />
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
                    fill="#1e293b"
                  />
                  <line
                    x1={node.x + 70}
                    y1={node.y}
                    x2={node.x + 70}
                    y2={node.y + 70}
                    stroke="#334155"
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
                    fill={node.next ? '#38bdf8' : '#64748b'}
                  />
                </>
              )}

              {/* Node ID label */}
              <text
                x={node.x + 5}
                y={node.y - 8}
                fill="#64748b"
                fontSize="10"
                fontFamily="var(--font-mono)"
              >
                {node.id}
              </text>

              {/* Active Pointer Badges (head, tail, newNode, curr, etc.) */}
              {badges.length > 0 && (
                <g>
                  {badges.map((b, bIdx) => (
                    <g key={b} transform={`translate(${node.x + bIdx * 45}, ${node.y + 82})`}>
                      <rect
                        x="0"
                        y="0"
                        width="42"
                        height="20"
                        rx="4"
                        fill={
                          b === 'head'
                            ? '#0284c7'
                            : b === 'tail'
                            ? '#4f46e5'
                            : b === 'newNode'
                            ? '#10b981'
                            : b === 'target'
                            ? '#f43f5e'
                            : '#6366f1'
                        }
                      />
                      <text
                        x="21"
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
                        points="18,-4 24,-4 21,0"
                        fill={
                          b === 'head'
                            ? '#0284c7'
                            : b === 'tail'
                            ? '#4f46e5'
                            : b === 'newNode'
                            ? '#10b981'
                            : b === 'target'
                            ? '#f43f5e'
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
