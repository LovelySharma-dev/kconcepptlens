import React, { useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, FastForward } from 'lucide-react';

interface StepControlsProps {
  currentStepIndex: number;
  totalSteps: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onReset: () => void;
  speed: number;
  onChangeSpeed: (newSpeed: number) => void;
}

export const StepControls: React.FC<StepControlsProps> = ({
  currentStepIndex,
  totalSteps,
  isPlaying,
  onTogglePlay,
  onStepForward,
  onStepBackward,
  onReset,
  speed,
  onChangeSpeed
}) => {
  // Global Keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        onTogglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        onStepForward();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        onStepBackward();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        onReset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onTogglePlay, onStepForward, onStepBackward, onReset]);

  return (
    <div className="step-bar" role="toolbar" aria-label="Step playback controls">
      {/* Step Counter & Progress Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
          Step <strong style={{ color: 'var(--text-primary)' }}>{currentStepIndex + 1}</strong> of{' '}
          <strong style={{ color: 'var(--text-primary)' }}>{Math.max(totalSteps, 1)}</strong>
        </span>
        <div
          style={{
            width: '120px',
            height: '6px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '9999px',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${totalSteps > 0 ? ((currentStepIndex + 1) / totalSteps) * 100 : 0}%`,
              background: 'linear-gradient(90deg, #38bdf8, #818cf8)',
              transition: 'width 200ms ease'
            }}
          />
        </div>
      </div>

      {/* Main Playback Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          type="button"
          className="icon-btn"
          onClick={onReset}
          title="Reset to Beginning (R)"
          aria-label="Reset to beginning"
        >
          <RotateCcw size={16} />
        </button>

        <button
          type="button"
          className="icon-btn"
          onClick={onStepBackward}
          disabled={currentStepIndex <= 0}
          title="Step Backward (Left Arrow)"
          aria-label="Step backward"
          style={{ opacity: currentStepIndex <= 0 ? 0.4 : 1 }}
        >
          <SkipBack size={16} />
        </button>

        <button
          type="button"
          className="btn-primary"
          onClick={onTogglePlay}
          title="Toggle Play / Pause (Space)"
          aria-label={isPlaying ? 'Pause simulation' : 'Play simulation'}
          style={{ padding: '0.5rem 1.25rem' }}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          <span>{isPlaying ? 'Pause' : 'Play'}</span>
        </button>

        <button
          type="button"
          className="icon-btn"
          onClick={onStepForward}
          disabled={currentStepIndex >= totalSteps - 1}
          title="Step Forward (Right Arrow)"
          aria-label="Step forward"
          style={{ opacity: currentStepIndex >= totalSteps - 1 ? 0.4 : 1 }}
        >
          <SkipForward size={16} />
        </button>
      </div>

      {/* Speed & Hotkey Hint */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          type="button"
          className="btn-secondary"
          style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
          onClick={() => {
            const nextSpeed = speed === 1 ? 1.5 : speed === 1.5 ? 2 : 1;
            onChangeSpeed(nextSpeed);
          }}
          title="Playback speed multiplier"
        >
          <FastForward size={14} />
          <span>{speed}x</span>
        </button>
        <span
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)'
          }}
        >
          Space: Play | &larr; &rarr;: Step
        </span>
      </div>
    </div>
  );
};
