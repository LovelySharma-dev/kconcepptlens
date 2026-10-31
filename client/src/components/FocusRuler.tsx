import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Focus, Eye, EyeOff, X, ArrowUp, ArrowDown, Maximize2, Minimize2 } from 'lucide-react';
import { LearningPreferences } from '@conceptlens/shared';

interface FocusRulerProps {
  isActive: boolean;
  preferences: LearningPreferences;
  onPreferences: (next: LearningPreferences) => void;
  onAnnounce?: (msg: string) => void;
  currentActivity?: string;
  nextAction?: string;
}

export const FocusRuler: React.FC<FocusRulerProps> = ({
  isActive,
  preferences,
  onPreferences,
  onAnnounce,
  currentActivity = 'Interactive Learning Workspace',
  nextAction = 'Select a concept node or step through the lesson'
}) => {
  const [rulerY, setRulerY] = useState(240);
  const [rulerHeight, setRulerHeight] = useState(72); // Height of the focused reading aperture in px
  const [isRulerVisible, setIsRulerVisible] = useState(true);
  const [isMouseTracking, setIsMouseTracking] = useState(true);
  const trackingRef = useRef(isMouseTracking);
  trackingRef.current = isMouseTracking;

  // Handle pointer tracking smoothly
  useEffect(() => {
    if (!isActive || !isRulerVisible) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (trackingRef.current) {
        setRulerY(e.clientY);
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [isActive, isRulerVisible]);

  // Handle global keyboard controls for ruler: Up / Down / [ / ] / Escape
  useEffect(() => {
    if (!isActive || !isRulerVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if typing in input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.key === '[' || (e.altKey && e.key === 'ArrowUp')) {
        e.preventDefault();
        setIsMouseTracking(false);
        setRulerY((prev) => Math.max(60, prev - 32));
        onAnnounce?.('Reading ruler moved up.');
      } else if (e.key === ']' || (e.altKey && e.key === 'ArrowDown')) {
        e.preventDefault();
        setIsMouseTracking(false);
        setRulerY((prev) => Math.min(window.innerHeight - 60, prev + 32));
        onAnnounce?.('Reading ruler moved down.');
      }
      // Note: We intentionally do NOT call preventDefault on PageUp, PageDown, Space, or Arrow keys
      // to ensure full native keyboard scrolling remains completely unbroken in Focus Mode.
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, isRulerVisible, onAnnounce]);

  const handleExitFocusMode = useCallback(() => {
    onPreferences({
      ...preferences,
      focusMode: false,
      adhdFriendly: false,
      activeThemes: preferences.activeThemes.filter((t) => t !== 'adhd-friendly')
    });
    onAnnounce?.('ADHD Focus Mode exited. Standard view restored.');
  }, [preferences, onPreferences, onAnnounce]);

  if (!isActive) return null;

  const apertureTop = Math.max(0, rulerY - rulerHeight / 2);

  return (
    <>
      {/* 1. Dedicated ADHD Focus Mode Floating Control Bar */}
      <aside
        className="focus-mode-banner"
        role="region"
        aria-label="ADHD Focus Mode Controls"
      >
        <div className="focus-mode-info">
          <div className="focus-badge">
            <Focus size={16} aria-hidden="true" />
            <span>ADHD Focus Mode Active</span>
          </div>
          <div className="focus-breadcrumbs">
            <span className="focus-activity" title={currentActivity}>
              <strong>Current:</strong> {currentActivity}
            </span>
            <span className="focus-separator" aria-hidden="true">•</span>
            <span className="focus-next" title={nextAction}>
              <strong>Next:</strong> {nextAction}
            </span>
          </div>
        </div>

        <div className="focus-mode-actions">
          {/* Toggle Reading Ruler */}
          <button
            type="button"
            className={`btn-secondary focus-btn ${isRulerVisible ? 'active' : ''}`}
            onClick={() => {
              setIsRulerVisible((v) => !v);
              onAnnounce?.(isRulerVisible ? 'Reading ruler hidden.' : 'Reading ruler visible.');
            }}
            aria-pressed={isRulerVisible}
            title="Toggle Reading Ruler (guides reading line)"
          >
            {isRulerVisible ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
            <span>Ruler {isRulerVisible ? 'On' : 'Off'}</span>
          </button>

          {isRulerVisible && (
            <>
              {/* Step Ruler Up */}
              <button
                type="button"
                className="icon-btn focus-icon-btn"
                onClick={() => {
                  setIsMouseTracking(false);
                  setRulerY((prev) => Math.max(60, prev - 40));
                }}
                title="Move ruler up ([ or Alt+Up)"
                aria-label="Move reading ruler up"
              >
                <ArrowUp size={15} />
              </button>

              {/* Step Ruler Down */}
              <button
                type="button"
                className="icon-btn focus-icon-btn"
                onClick={() => {
                  setIsMouseTracking(false);
                  setRulerY((prev) => Math.min(window.innerHeight - 60, prev + 40));
                }}
                title="Move ruler down (] or Alt+Down)"
                aria-label="Move reading ruler down"
              >
                <ArrowDown size={15} />
              </button>

              {/* Toggle Mouse Following */}
              <button
                type="button"
                className={`btn-secondary focus-btn ${isMouseTracking ? 'active' : ''}`}
                onClick={() => {
                  setIsMouseTracking((t) => !t);
                  onAnnounce?.(isMouseTracking ? 'Ruler keyboard lock on.' : 'Ruler follows mouse.');
                }}
                title="Toggle whether ruler follows mouse pointer"
                aria-pressed={isMouseTracking}
              >
                <span>{isMouseTracking ? 'Follows Mouse' : 'Locked Position'}</span>
              </button>

              {/* Adjust Height */}
              <button
                type="button"
                className="icon-btn focus-icon-btn"
                onClick={() => {
                  setRulerHeight((h) => (h === 60 ? 84 : h === 84 ? 112 : 60));
                }}
                title="Cycle ruler height (Compact / Medium / Wide)"
                aria-label="Cycle reading ruler height"
              >
                {rulerHeight > 80 ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>
            </>
          )}

          {/* Exit Focus Mode */}
          <button
            type="button"
            className="btn-primary focus-exit-btn"
            onClick={handleExitFocusMode}
            title="Exit Focus Mode and restore standard interface"
            aria-label="Exit ADHD Focus Mode"
          >
            <X size={15} aria-hidden="true" />
            <span>Exit Focus Mode</span>
          </button>
        </div>
      </aside>

      {/* 2. Non-blocking Reading Aperture Guide (Single element with viewport shadow, strictly non-intercepting) */}
      {isRulerVisible && (
        <div
          className="reading-ruler-guide"
          aria-hidden="true"
          style={{
            position: 'fixed',
            top: `${apertureTop}px`,
            left: 0,
            right: 0,
            height: `${rulerHeight}px`,
            pointerEvents: 'none',
            touchAction: 'pan-y',
            userSelect: 'none',
            zIndex: 1040
          }}
        >
          <div className="ruler-guide-line ruler-guide-top" />
          <div className="ruler-guide-line ruler-guide-bottom" />
        </div>
      )}
    </>
  );
};
