import React from 'react';
import { ExecutionStep } from '@conceptlens/shared';

interface StateInspectorProps {
  currentStep?: ExecutionStep;
}

export const StateInspector: React.FC<StateInspectorProps> = ({ currentStep }) => {
  if (!currentStep) return null;

  return (
    <div className="glass-panel state-inspector" style={{ marginTop: '1.5rem' }}>
      <div className="state-inspector-grid">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--diagram-pointer)',
                background: 'var(--diagram-node-sub)',
                border: '1px solid var(--diagram-node-border)',
                padding: '0.2rem 0.5rem',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              Operation: {currentStep.operation}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Step {currentStep.stepIndex + 1}
            </span>
          </div>

          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            {currentStep.description}
          </h3>

          <div className="state-inspector-code">
            <div className="state-inspector-kicker" style={{ fontSize: '0.75rem', marginBottom: '0.35rem' }}>
              Deterministic Algorithm Execution:
            </div>
            <pre>
              <code>{currentStep.codeSnippet}</code>
            </pre>
          </div>
        </div>

        <div>
          <h4
            style={{
              fontSize: '0.9rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-primary)',
              marginBottom: '0.75rem'
            }}
          >
            Live Memory & Pointer Watch Window
          </h4>

          <div className="state-inspector-table-wrap">
            <table className="state-inspector-table">
              <thead>
                <tr>
                  <th>Pointer</th>
                  <th>Target Node</th>
                  <th>Address</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(currentStep.activePointers).map(([ptrName, targetId]) => {
                  const targetNode = targetId
                    ? currentStep.currentGraph.nodes.find((n) => n.id === targetId)
                    : null;

                  return (
                    <tr key={ptrName}>
                      <td className="ptr-name">{ptrName}</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{targetId || 'NULL'}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                        {targetNode?.address || (targetId ? '0x1020' : '0x0000 (NULL)')}
                      </td>
                      <td>
                        {targetNode ? (
                          <span className="state-inspector-value">{targetNode.value}</span>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
