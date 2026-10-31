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
          {/* Arrowhead marker for normal links */}
          <marker
            id="arrowhead"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="8"
            markerHeight="8"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
          </marker>

          {/* Arrowhead marker for active/mutating links */}
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

        {/* 1. Render Pointer Arrows between nodes */}
        {graph.nodes.map((node) => {
          if (!node.next) return null;
          const targetNode = nodeMap.get(node.next);
          if (!targetNode) return null;

          const isMutating = mutatedNodeId === node.id;
          const startX = node.x + 110;
          const startY = node.y + 35;
          const endX = targetNode.x - 10;
          const endY = targetNode.y + 35;

          // Draw straight arrow if adjacent, or curve if looping
          const isForward = endX > startX;
          const pathD = isForward
            ? `M ${startX} ${startY} L ${endX} ${endY}`
            : `M ${startX} ${startY} C ${startX + 40} ${startY - 60}, ${endX - 40} ${endY - 60}, ${endX} ${endY}`;

          return (
            <g key={`arrow-${node.id}-${targetNode.id}`}>
              <path
                d={pathD}
                fill="none"
                stroke={isMutating ? '#f43f5e' : '#38bdf8'}
                strokeWidth={isMutating ? '3.5' : '2.5'}
                strokeDasharray={isMutating ? '5,5' : 'none'}
                markerEnd={isMutating ? 'url(#arrowhead-active)' : 'url(#arrowhead)'}
              />
            </g>
          );
        })}

        {/* 2. Render NULL Terminator for terminal nodes */}
        {graph.nodes.map((node) => {
          if (node.next !== null) return null;
          const startX = node.x + 110;
          const startY = node.y + 35;

          return (
            <g key={`null-${node.id}`}>
              <line
                x1={startX}
                y1={startY}
                x2={startX + 35}
                y2={startY}
                stroke="#64748b"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
              />
              <rect
                x={startX + 35}
                y={startY - 15}
                width="36"
                height="30"
                rx="4"
                fill="#1e293b"
                stroke="#475569"
                strokeWidth="1.5"
              />
              <text
                x={startX + 53}
                y={startY + 5}
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

        {/* 3. Render Nodes */}
        {graph.nodes.map((node) => {
          const isHighlighted = highlightedNodeIds.includes(node.id);
          const isMutated = mutatedNodeId === node.id;
          const badges = getPointerBadges(node.id);

          return (
            <g
              key={node.id}
              tabIndex={0}
              role="button"
              aria-label={`Node ID ${node.id}, Value ${node.value}, Next points to ${node.next || 'NULL'}`}
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

              {/* Data Partition (Left) */}
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

              {/* Data Value */}
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

              {/* Pointer Sub-box (Right) */}
              <circle
                cx={node.x + 90}
                cy={node.y + 35}
                r="6"
                fill={node.next ? '#38bdf8' : '#64748b'}
              />

              {/* Node ID small label above box */}
              <text
                x={node.x + 5}
                y={node.y - 8}
                fill="#64748b"
                fontSize="10"
                fontFamily="var(--font-mono)"
              >
                {node.id}
              </text>

              {/* Active Pointer Badges (head, curr, prev, etc.) */}
              {badges.length > 0 && (
                <g>
                  {badges.map((b, idx) => (
                    <g key={b} transform={`translate(${node.x + idx * 45}, ${node.y + 85})`}>
                      <rect
                        x="0"
                        y="0"
                        width="42"
                        height="20"
                        rx="4"
                        fill={b === 'head' ? '#0284c7' : b === 'newNode' ? '#10b981' : '#6366f1'}
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
                      {/* Pointer arrow pointing up to node */}
                      <polygon
                        points="18,-4 24,-4 21,0"
                        fill={b === 'head' ? '#0284c7' : b === 'newNode' ? '#10b981' : '#6366f1'}
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
