import React, { useState } from 'react';
import { LinkedListGraph, ValidationResult } from '@conceptlens/shared';
import { Check, X, ShieldAlert } from 'lucide-react';

interface ValidationInspectorProps {
  graph: LinkedListGraph;
  validation: ValidationResult;
  isOpen: boolean;
  onClose: () => void;
  onSaveCorrections: (correctedGraph: LinkedListGraph) => void;
}

export const ValidationInspector: React.FC<ValidationInspectorProps> = ({
  graph,
  validation,
  isOpen,
  onClose,
  onSaveCorrections
}) => {
  const [editedGraph, setEditedGraph] = useState<LinkedListGraph>(JSON.parse(JSON.stringify(graph)));

  if (!isOpen) return null;

  const handleUpdateNodeValue = (nodeId: string, val: string) => {
    setEditedGraph((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => (n.id === nodeId ? { ...n, value: val, confidence: 1.0 } : n))
    }));
  };

  const handleUpdateNodeNext = (nodeId: string, nextId: string) => {
    setEditedGraph((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) =>
        n.id === nodeId ? { ...n, next: nextId === 'NULL' ? null : nextId } : n
      )
    }));
  };

  const handleSave = () => {
    onSaveCorrections(editedGraph);
    onClose();
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-card">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={22} color="var(--accent-amber)" />
            <h3 id="modal-title" style={{ fontSize: '1.2rem', fontWeight: 600 }}>
              Gate 06: Human-in-the-Loop Diagram Review
            </h3>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Close review dialog"
          >
            <X size={16} />
          </button>
        </div>

        {/* Issue Alert Box */}
        <div
          style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.5rem',
            fontSize: '0.85rem',
            color: 'var(--accent-amber)'
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
            Validation Gate Intercepted Uncertainty:
          </div>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {validation.issues.map((iss, i) => (
              <li key={i}>{iss.message}</li>
            ))}
          </ul>
        </div>

        {/* Node Editor Form */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
            Verify & Correct Proposed Nodes:
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '240px', overflowY: 'auto' }}>
            {editedGraph.nodes.map((node) => {
              const isLowConfidence = node.confidence !== undefined && node.confidence < 0.80;

              return (
                <div
                  key={node.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.5fr 1fr 1fr',
                    gap: '0.75rem',
                    alignItems: 'center',
                    background: isLowConfidence ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    border: `1px solid ${isLowConfidence ? 'rgba(245, 158, 11, 0.5)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '0.6rem 0.8rem'
                  }}
                >
                  {/* Node Label / ID */}
                  <div>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      ID: {node.id}
                    </span>
                    {isLowConfidence && (
                      <span style={{ fontSize: '0.65rem', color: 'var(--accent-amber)', display: 'block' }}>
                        Low OCR Confidence ({(node.confidence * 100).toFixed(0)}%)
                      </span>
                    )}
                  </div>

                  {/* Node Value Input */}
                  <div>
                    <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>
                      Node Value:
                    </label>
                    <input
                      type="text"
                      value={String(node.value)}
                      onChange={(e) => handleUpdateNodeValue(node.id, e.target.value)}
                      style={{
                        width: '100%',
                        background: '#020617',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        color: '#ffffff',
                        padding: '0.35rem 0.5rem',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  {/* Next Pointer Selector */}
                  <div>
                    <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>
                      Next Pointer:
                    </label>
                    <select
                      value={node.next || 'NULL'}
                      onChange={(e) => handleUpdateNodeNext(node.id, e.target.value)}
                      style={{
                        width: '100%',
                        background: '#020617',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        color: '#ffffff',
                        padding: '0.35rem 0.5rem',
                        fontSize: '0.85rem'
                      }}
                    >
                      <option value="NULL">NULL (End)</option>
                      {editedGraph.nodes
                        .filter((n) => n.id !== node.id)
                        .map((n) => (
                          <option key={n.id} value={n.id}>
                            {n.id} ({n.value})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={handleSave}>
            <Check size={16} />
            <span>Apply Corrections & Render</span>
          </button>
        </div>
      </div>
    </div>
  );
};
