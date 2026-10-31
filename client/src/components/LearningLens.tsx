import React, { useEffect, useId, useRef, useState } from 'react';
import {
  LearningPreferences,
  ThemeChoice,
  learningThemeGroups,
  removeLearningTheme,
  resetAllLearningPreferences,
  toggleLearningTheme,
  type LearningThemeDefinition,
  type LearningThemeId
} from '@conceptlens/shared';
import {
  BookOpen,
  Captions,
  Focus,
  Hand,
  Image as ImageIcon,
  Keyboard,
  Layers,
  ListOrdered,
  Moon,
  Palette,
  Route,
  Shapes,
  Sun,
  Type,
  VolumeX,
  Wifi,
  X,
  ZoomIn,
  type LucideIcon
} from 'lucide-react';

interface LearningLensProps {
  open: boolean;
  onClose: () => void;
  onStartLearning: () => void;
  preferences: LearningPreferences;
  onPreferences: (next: LearningPreferences) => void;
  themeChoice: ThemeChoice;
  onThemeChoice: (choice: ThemeChoice) => void;
}

const ICONS: Record<LearningThemeId, LucideIcon> = {
  'adhd-friendly': Focus,
  'simple-steps': ListOrdered,
  'easy-read': BookOpen,
  'dyslexia-friendly': Type,
  'low-stimulation': Moon,
  'guided-learning': Route,
  'color-blind-friendly': Palette,
  'low-vision-friendly': ZoomIn,
  'blind-friendly': BookOpen,
  'visual-learning': ImageIcon,
  'deaf-friendly': Captions,
  'speech-free': VolumeX,
  'keyboard-friendly': Keyboard,
  'motor-friendly': Hand,
  'supported-learning': Layers,
  'self-paced': Sun,
  'low-data': Wifi,
  'multiple-ways': Shapes
};

export const LearningLens: React.FC<LearningLensProps> = ({
  open,
  onClose,
  onStartLearning,
  preferences,
  onPreferences,
  themeChoice,
  onThemeChoice
}) => {
  const titleId = useId();
  const subtitleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const groups = learningThemeGroups();

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialogRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, summary, [tabindex]:not([tabindex="-1"])'
      )].filter((node) => !node.hasAttribute('disabled'));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previouslyFocused.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  const patch = (partial: Partial<LearningPreferences>) => onPreferences({ ...preferences, ...partial });
  const active = groups.flatMap((group) => group.themes).filter((theme) => preferences.activeThemes.includes(theme.id));

  const renderCard = (theme: LearningThemeDefinition) => {
    const selected = preferences.activeThemes.includes(theme.id);
    const Icon = ICONS[theme.id];
    return (
      <button
        key={theme.id}
        type="button"
        className={`theme-card ${selected ? 'is-active' : ''}`}
        aria-pressed={selected}
        onClick={() => onPreferences(toggleLearningTheme(preferences, theme.id))}
      >
        <span className="theme-card-icon" aria-hidden="true">
          <Icon size={18} />
        </span>
        <span className="theme-card-icon-label">{theme.iconLabel}</span>
        <span className="theme-card-title">{theme.title}</span>
        <span className="theme-card-status">{selected ? 'On' : 'Off'}</span>
        <span className="theme-card-copy">{theme.description}</span>
      </button>
    );
  };

  return (
    <div className="lens-backdrop" role="presentation" onClick={onClose}>
      <div
        ref={dialogRef}
        id="learning-theme-dialog"
        className="lens-dialog theme-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={subtitleId}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="lens-dialog-head">
          <div>
            <h2 id={titleId}>Make learning work for you</h2>
            <p id={subtitleId}>Choose how you want to learn. You can change these settings anytime.</p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <section className="theme-active" aria-label="Active themes">
          <h3>Active themes</h3>
          {active.length === 0 ? (
            <p>No learning themes are on. The standard lesson is showing.</p>
          ) : (
            <ul className="theme-active-list">
              {active.map((theme) => (
                <li key={theme.id}>
                  <span>{theme.title}</span>
                  <button type="button" className="btn-secondary" onClick={() => onPreferences(removeLearningTheme(preferences, theme.id))}>
                    Remove {theme.title}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {groups.map((group, index) => (
          <details key={group.id} className="theme-group" open={index === 0}>
            <summary>{group.title}</summary>
            <div className="theme-card-grid">{group.themes.map(renderCard)}</div>
          </details>
        ))}

        <details className="theme-group" open={customizeOpen} onToggle={(event) => setCustomizeOpen((event.target as HTMLDetailsElement).open)}>
          <summary>Customize settings</summary>
          <div className="lens-grid">
            <label>
              Light or dark
              <select value={themeChoice} onChange={(event) => onThemeChoice(event.target.value as ThemeChoice)}>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">Match this device</option>
              </select>
            </label>
            <label>
              Text size
              <select value={preferences.textScale} onChange={(event) => patch({ textScale: event.target.value as LearningPreferences['textScale'] })}>
                <option value="default">Default</option>
                <option value="large">Large</option>
                <option value="larger">Larger</option>
              </select>
            </label>
            <label>
              Line spacing
              <select
                value={preferences.lineSpacing}
                onChange={(event) => patch({ lineSpacing: event.target.value as LearningPreferences['lineSpacing'] })}
              >
                <option value="comfortable">Comfortable</option>
                <option value="relaxed">Relaxed</option>
              </select>
            </label>
            <label>
              Speech rate
              <select
                value={String(preferences.speechRate)}
                onChange={(event) => patch({ speechRate: Number(event.target.value) as LearningPreferences['speechRate'] })}
              >
                <option value="0.8">Slower</option>
                <option value="1">Normal</option>
                <option value="1.25">Faster</option>
              </select>
            </label>
            <label>
              Break reminder
              <select
                value={preferences.breakReminderMinutes}
                onChange={(event) =>
                  patch({ breakReminderMinutes: Number(event.target.value) as LearningPreferences['breakReminderMinutes'] })
                }
              >
                <option value={0}>Off</option>
                <option value={10}>After 10 minutes</option>
                <option value={20}>After 20 minutes</option>
              </select>
            </label>
            <label className="lens-check">
              <input type="checkbox" checked={preferences.highContrast} onChange={(event) => patch({ highContrast: event.target.checked })} />
              High contrast
            </label>
            <label className="lens-check">
              <input type="checkbox" checked={preferences.reducedMotion} onChange={(event) => patch({ reducedMotion: event.target.checked })} />
              Reduce motion
            </label>
            <label className="lens-check">
              <input type="checkbox" checked={preferences.readSupport} onChange={(event) => patch({ readSupport: event.target.checked })} />
              Show lesson vocabulary
            </label>
            <label className="lens-check">
              <input type="checkbox" checked={preferences.textFirst} onChange={(event) => patch({ textFirst: event.target.checked })} />
              Text first
            </label>
          </div>
          <p className="path-option-note">
            Break reminders stay off until you choose one. There is no countdown. ADHD-Friendly and Self-Paced Learning do not turn a reminder on.
          </p>
        </details>

        <div className="lens-actions">
          <button type="button" className="btn-secondary" onClick={() => onPreferences(resetAllLearningPreferences())}>
            Reset to defaults
          </button>
          <button type="button" className="btn-primary" onClick={onStartLearning}>
            Start learning
          </button>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
          <p>Reset restores these display choices. It does not erase the open concept, your answers, or the light and dark choice.</p>
        </div>
      </div>
    </div>
  );
};
