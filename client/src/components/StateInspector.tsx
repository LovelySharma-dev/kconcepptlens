import React from 'react';
import { ExecutionStep } from '@conceptlens/shared';

interface StateInspectorProps {
  currentStep?: ExecutionStep;
}

export const StateInspector: React.FC<StateInspectorProps> = ({ currentStep }) => {
  if (!currentStep) return null;

  return (
    <div className="glass-panel" style={{ marginTop: '1.5rem' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          gap: '1.5rem',
          alignItems: 'start'
        }}
      >
        {/* Left Column: Step Explanation & Code Snippet */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--accent-cyan)',
                background: 'rgba(56, 189, 248, 0.1)',
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

          <div
            style={{
              background: '#020617',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              overflowX: 'auto'
            }}
          >
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              Deterministic Algorithm Execution:
            </div>
            <pre style={{ color: '#38bdf8', fontSize: '0.85rem', lineHeight: '1.4' }}>
              <code>{currentStep.codeSnippet}</code>
            </pre>
          </div>
        </div>

        {/* Right Column: Memory & Pointer Inspector Table */}
        <div>
          <h4
            style={{
              fontSize: '0.9rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-secondary)',
              marginBottom: '0.75rem'
            }}
          >
            Live Memory & Pointer Watch Window
          </h4>

          <div
            style={{
              background: 'rgba(2, 6, 23, 0.7)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden'
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.04)', textAlign: 'left' }}>
                  <th style={{ padding: '0.6rem 0.8rem', color: 'var(--text-muted)' }}>Pointer</th>
                  <th style={{ padding: '0.6rem 0.8rem', color: 'var(--text-muted)' }}>Target Node</th>
                  <th style={{ padding: '0.6rem 0.8rem', color: 'var(--text-muted)' }}>Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(currentStep.activePointers).map(([ptrName, targetId]) => {
                  const targetNode = targetId
                    ? currentStep.currentGraph.nodes.find((n) => n.id === targetId)
                    : null;

                  return (
                    <tr
                      key={ptrName}
                      style={{
                        borderTop: '1px solid rgba(255, 255, 255, 0.05)'
                      }}
                    >
                      <td style={{ padding: '0.6rem 0.8rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                        {ptrName}
                      </td>
                      <td style={{ padding: '0.6rem 0.8rem', fontFamily: 'var(--font-mono)' }}>
                        {targetId || <span style={{ color: 'var(--text-muted)' }}>NULL</span>}
                      </td>
                      <td style={{ padding: '0.6rem 0.8rem' }}>
                        {targetNode ? (
                          <span
                            style={{
                              background: 'rgba(56, 189, 248, 0.15)',
                              color: '#ffffff',
                              padding: '0.15rem 0.45rem',
                              borderRadius: '4px',
                              fontWeight: 600
                            }}
                          >
                            {targetNode.value}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
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
