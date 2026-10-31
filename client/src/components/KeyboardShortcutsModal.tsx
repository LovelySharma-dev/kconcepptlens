import React, { useEffect, useRef } from 'react';
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
  { keyLabel: '← / →', description: 'Move keyboard focus between linked-list nodes', category: 'Diagram Navigation' },
  { keyLabel: 'Home / End', description: 'Jump focus to Head node / Tail node', category: 'Diagram Navigation' },
  { keyLabel: 'Enter / Space', description: 'Select or inspect the currently focused node', category: 'Diagram Navigation' },
  { keyLabel: '[ / ]', description: 'Move reading ruler up or down in ADHD Focus Mode', category: 'Focus & Reading Ruler' },
  { keyLabel: 'PgUp / PgDn', description: 'Move reading ruler by a larger step', category: 'Focus & Reading Ruler' },
  { keyLabel: '0', description: 'Open Explore', category: 'Navigation' },
  { keyLabel: '1', description: 'Open Learn', category: 'Navigation' },
  { keyLabel: '2', description: 'Open Practice', category: 'Navigation' },
  { keyLabel: '3', description: 'Open About', category: 'Navigation' },
  { keyLabel: '4', description: 'Open the media studio', category: 'Navigation' },
  { keyLabel: '5', description: 'Open STEM labs', category: 'Navigation' },
  { keyLabel: '6', description: 'Open the reliability gates', category: 'Navigation' },
  { keyLabel: 'H', description: 'Toggle high contrast', category: 'Accessibility' },
  { keyLabel: 'T', description: 'Toggle light and dark theme', category: 'Accessibility' },
  { keyLabel: 'G', description: 'Open interactive voice & task guide', category: 'Accessibility' },
  { keyLabel: '?', description: 'Toggle this keyboard shortcut list', category: 'Accessibility' },
  { keyLabel: 'Esc', description: 'Close any active modal or dialog', category: 'Accessibility' }
];

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialogRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )].filter((node) => !node.hasAttribute('disabled'));

      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="presentation"
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
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-dialog-title"
        aria-describedby="shortcuts-dialog-desc"
        tabIndex={-1}
        style={{
          maxWidth: '640px',
          width: '100%',
          background: 'var(--bg-surface)',
          border: '2px solid var(--border-medium)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-elevated)',
          padding: '1.5rem',
          position: 'relative',
          outline: 'none'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: 'rgba(2, 132, 199, 0.12)', padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}>
              <Keyboard size={20} color="var(--accent-cyan)" />
            </div>
            <div>
              <h3 id="shortcuts-dialog-title" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Keyboard Accessibility Navigation
              </h3>
              <p id="shortcuts-dialog-desc" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Navigate diagrams, lessons, focus reading rulers, and options without a mouse.
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
          {['Visualizer Controls', 'Diagram Navigation', 'Focus & Reading Ruler', 'Navigation', 'Accessibility'].map((category) => (
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
                        background: 'var(--bg-elevated)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        {item.description}
                      </span>
                      <kbd
                        style={{
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-medium)',
                          borderRadius: '4px',
                          padding: '0.2rem 0.6rem',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.8rem',
                          color: 'var(--accent-cyan)',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
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
