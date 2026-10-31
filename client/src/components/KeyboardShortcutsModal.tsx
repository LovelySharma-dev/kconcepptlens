import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keyLabel: string;
  description: string;
  category: string;
}

const shortcuts: ShortcutItem[] = [
  { keyLabel: 'Space', description: 'Toggle simulation auto-play / pause', category: 'Visualizer Controls' },
  { keyLabel: '→', description: 'Step forward one execution state', category: 'Visualizer Controls' },
  { keyLabel: '←', description: 'Step backward one execution state', category: 'Visualizer Controls' },
  { keyLabel: 'R', description: 'Reset diagram simulation to starting state', category: 'Visualizer Controls' },
  { keyLabel: '1', description: 'Switch to Interactive Studio tab', category: 'Navigation' },
  { keyLabel: '2', description: 'Switch to PYQ Intelligence Drawer tab', category: 'Navigation' },
  { keyLabel: '3', description: 'Switch to Inclusive ISL Classroom tab', category: 'Navigation' },
  { keyLabel: '4', description: 'Switch to 8 Validation Gates tab', category: 'Navigation' },
  { keyLabel: 'H', description: 'Toggle WCAG 2.2 AAA High-Contrast Mode', category: 'Accessibility' },
  { keyLabel: 'V', description: 'Toggle Live Speech vocalizer', category: 'Accessibility' },
  { keyLabel: '?', description: 'Toggle this Keyboard Shortcuts cheat-sheet', category: 'Accessibility' },
  { keyLabel: 'Esc', description: 'Close any active modal or dialog', category: 'Accessibility' }
];

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard Shortcuts Cheat-sheet"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(2, 6, 23, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          maxWidth: '620px',
          width: '100%',
          background: '#090d16',
          border: '1px solid var(--accent-cyan)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 20px rgba(56, 189, 248, 0.25)',
          padding: '1.5rem',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}>
              <Keyboard size={20} color="var(--accent-cyan)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
                Keyboard Accessibility Navigation
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Full mouse-free navigation adhering to WCAG 2.2 AAA guidelines
              </p>
            </div>
          </div>

          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Close keyboard shortcuts"
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '60vh', overflowY: 'auto' }}>
          {['Visualizer Controls', 'Navigation', 'Accessibility'].map((category) => (
            <div key={category}>
              <h4 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                {category}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {shortcuts
                  .filter((s) => s.category === category)
                  .map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0.75rem',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <span style={{ fontSize: '0.85rem', color: '#e2e8f0' }}>
                        {item.description}
                      </span>
                      <kbd
                        style={{
                          background: '#020617',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '4px',
                          padding: '0.2rem 0.6rem',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.8rem',
                          color: 'var(--accent-cyan)',
                          boxShadow: '0 2px 0 rgba(0,0,0,0.5)',
                          minWidth: '28px',
                          textAlign: 'center'
                        }}
                      >
                        {item.keyLabel}
                      </kbd>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn-primary"
            onClick={onClose}
            style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}
          >
            Got it (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsModal;
