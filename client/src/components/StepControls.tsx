import React, { useEffect, useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, FastForward, Volume2, VolumeX, Square } from 'lucide-react';
import { diagramSonifier } from '../services/audioSonification';

interface StepControlsProps {
  currentStepIndex: number;
  totalSteps: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onSeekStep: (stepIndex: number) => void;
  onReset: () => void;
  speed: number;
  onChangeSpeed: (newSpeed: number) => void;
  isMutatingStep?: boolean;
  onAnnouncement?: (msg: string) => void;
}

export const StepControls: React.FC<StepControlsProps> = ({
  currentStepIndex,
  totalSteps,
  isPlaying,
  onTogglePlay,
  onStepForward,
  onStepBackward,
  onSeekStep,
  onReset,
  speed,
  onChangeSpeed,
  isMutatingStep = false,
  onAnnouncement
}) => {
  const [sonificationEnabled, setSonificationEnabled] = useState(false);
  const [volume, setVolume] = useState(30);

  // Trigger semantic sonification tones when step index changes
  useEffect(() => {
    if (sonificationEnabled) {
      const event = diagramSonifier.playNodeTone(currentStepIndex, totalSteps, isMutatingStep);
      if (event && onAnnouncement) {
        // Text alternative for sonification event
        onAnnouncement(`Step ${currentStepIndex + 1} of ${totalSteps}. ${event.label}`);
      }
    }
  }, [currentStepIndex, totalSteps, isMutatingStep, sonificationEnabled, onAnnouncement]);

  const handleToggleSonification = () => {
    const next = !sonificationEnabled;
    setSonificationEnabled(next);
    diagramSonifier.setEnabled(next);
    if (next) {
      diagramSonifier.playNodeTone(currentStepIndex, totalSteps, isMutatingStep);
      onAnnouncement?.('Audio sonification tones turned on.');
    } else {
      diagramSonifier.stop();
      onAnnouncement?.('Audio sonification tones turned off.');
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    diagramSonifier.setVolume(newVol / 100);
  };

  const handleResetWithAudio = () => {
    if (sonificationEnabled) {
      diagramSonifier.playResetTone();
    }
    onReset();
  };

  // Keyboard listener
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
        handleResetWithAudio();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onTogglePlay, onStepForward, onStepBackward, handleResetWithAudio]);

  return (
    <div className="step-bar" role="toolbar" aria-label="Simulation step execution controls">
      {/* Step Counter & Progress Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
          Step <strong style={{ color: 'var(--text-primary)' }}>{currentStepIndex + 1}</strong> of{' '}
          <strong style={{ color: 'var(--text-primary)' }}>{Math.max(totalSteps, 1)}</strong>
        </span>
        <div
          style={{
            width: '110px',
            height: '6px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '9999px',
            overflow: 'hidden'
          }}
          aria-hidden="true"
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

      {/* Range Slider for Step Scrubbing */}
      <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', minWidth: 140 }}>
        <span className="sr-only">Seek execution step</span>
        <input
          type="range"
          min={0}
          max={Math.max(totalSteps - 1, 0)}
          value={Math.min(currentStepIndex, Math.max(totalSteps - 1, 0))}
          onChange={(event) => onSeekStep(Number(event.currentTarget.value))}
          disabled={totalSteps <= 1}
          aria-label="Seek execution step slider"
          style={{ width: '100%', accentColor: '#38bdf8' }}
        />
      </label>

      {/* Main Playback Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <button
          type="button"
          className="icon-btn"
          onClick={handleResetWithAudio}
          title="Reset to beginning (R)"
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
          style={{ padding: '0.45rem 1.1rem' }}
        >
          {isPlaying ? <Pause size={17} /> : <Play size={17} />}
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

      {/* Web Audio API Sonification Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '0.75rem' }}>
        <button
          type="button"
          className={`btn-secondary ${sonificationEnabled ? 'active' : ''}`}
          onClick={handleToggleSonification}
          title="Toggle Web Audio API sonification tones for nodes and mutations"
          aria-pressed={sonificationEnabled}
          style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
        >
          {sonificationEnabled ? <Volume2 size={15} color="#38bdf8" /> : <VolumeX size={15} />}
          <span>Audio Tones {sonificationEnabled ? 'On' : 'Off'}</span>
        </button>

        {sonificationEnabled && (
          <>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span className="sr-only">Sonification volume</span>
              <input
                type="range"
                min={0}
                max={100}
                value={volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                aria-label="Sonification volume"
                style={{ width: '60px', accentColor: '#38bdf8' }}
              />
              <span>{volume}%</span>
            </label>

            <button
              type="button"
              className="icon-btn"
              onClick={() => diagramSonifier.stop()}
              title="Stop audio sound immediately"
              aria-label="Stop audio tones"
              style={{ padding: '0.3rem' }}
            >
              <Square size={13} />
            </button>
          </>
        )}
      </div>

      {/* Speed & Hotkey Hint */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          type="button"
          className="btn-secondary"
          style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
          onClick={() => {
            const nextSpeed = speed === 1 ? 1.5 : speed === 1.5 ? 2 : 1;
            onChangeSpeed(nextSpeed);
          }}
          title="Playback speed multiplier"
        >
          <FastForward size={14} />
          <span>{speed}x</span>
        </button>
      </div>
    </div>
  );
};
