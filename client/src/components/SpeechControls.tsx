import React, { useEffect, useRef, useState } from 'react';

type Playback = 'idle' | 'speaking' | 'paused' | 'unavailable' | 'error';

interface SpeechControlsProps {
  text: string;
  rate: number;
  label: string;
  onRateChange?: (rate: 0.8 | 1 | 1.25) => void;
  speechOptionalNote?: string;
}

const RATES: Array<{ value: 0.8 | 1 | 1.25; label: string }> = [
  { value: 0.8, label: 'Slower' },
  { value: 1, label: 'Normal' },
  { value: 1.25, label: 'Faster' }
];

export const SpeechControls: React.FC<SpeechControlsProps> = ({
  text,
  rate,
  label,
  onRateChange,
  speechOptionalNote
}) => {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [playback, setPlayback] = useState<Playback>(supported ? 'idle' : 'unavailable');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Stop active speech on unmount
  useEffect(() => {
    return () => {
      if (supported) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          /* Gracefully ignore synthesis cleanup errors */
        }
      }
    };
  }, [supported]);

  const spokenText = useRef(text);
  useEffect(() => {
    if (spokenText.current === text) return;
    spokenText.current = text;
    if (!supported) return;
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
    setPlayback((current) => (current === 'unavailable' ? current : 'idle'));
    setErrorMessage(null);
  }, [text, supported]);

  const speak = () => {
    if (!supported) {
      setPlayback('unavailable');
      return;
    }
    try {
      // Prevent overlapping speech across controls
      window.speechSynthesis.cancel();

      if (!text.trim()) {
        setPlayback('idle');
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.onend = () => {
        setPlayback('idle');
        setErrorMessage(null);
      };
      utterance.onerror = (e) => {
        setPlayback('error');
        setErrorMessage(`Speech could not be played: ${e.error || 'browser audio unavailable'}`);
      };

      window.speechSynthesis.speak(utterance);
      setPlayback('speaking');
      setErrorMessage(null);
    } catch (err) {
      setPlayback('error');
      setErrorMessage('Speech synthesis is temporarily unavailable in this browser.');
    }
  };

  const pause = () => {
    if (!supported) return;
    try {
      window.speechSynthesis.pause();
      setPlayback('paused');
    } catch {
      /* ignore */
    }
  };

  const resume = () => {
    if (!supported) return;
    try {
      window.speechSynthesis.resume();
      setPlayback('speaking');
    } catch {
      /* ignore */
    }
  };

  const stop = () => {
    if (!supported) return;
    try {
      window.speechSynthesis.cancel();
      setPlayback('idle');
    } catch {
      /* ignore */
    }
  };

  const status =
    playback === 'unavailable'
      ? 'Speech synthesis is not available in this browser. The text stays on the page.'
      : playback === 'speaking'
      ? 'Playing speech'
      : playback === 'paused'
      ? 'Paused'
      : playback === 'error'
      ? (errorMessage || 'Audio playback error. The text remains readable on the page.')
      : 'Not playing';

  return (
    <section className="speech-controls" aria-label={label}>
      <p role="status" aria-live="polite">
        Playback: <strong>{status}</strong>
      </p>
      <div className="speech-actions">
        <button
          id="read-current-section"
          type="button"
          className="btn-secondary"
          onClick={speak}
          disabled={!supported}
          aria-label="Read this section out loud"
        >
          Read this section
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={pause}
          disabled={playback !== 'speaking'}
          aria-label="Pause speech reading"
        >
          Pause
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={resume}
          disabled={playback !== 'paused'}
          aria-label="Resume speech reading"
        >
          Resume
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={stop}
          disabled={playback === 'idle' || playback === 'unavailable'}
          aria-label="Stop speech reading"
        >
          Stop
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={speak}
          disabled={!supported}
          aria-label="Repeat speech from beginning"
        >
          Repeat
        </button>
      </div>

      <div className="speech-actions" role="group" aria-label="Speech rate options">
        {RATES.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`btn-secondary ${rate === option.value ? 'active' : ''}`}
            aria-pressed={rate === option.value}
            onClick={() => onRateChange?.(option.value)}
            disabled={!onRateChange}
            aria-label={`Speech rate: ${option.label}`}
          >
            {option.label}
            {rate === option.value ? ' (selected)' : ''}
          </button>
        ))}
      </div>

      <p className="path-option-note">
        Audio starts only when you press a button. This is browser speech synthesis, not a pre-recorded narration.
        {speechOptionalNote ? ` ${speechOptionalNote}` : ''}
      </p>
    </section>
  );
};
