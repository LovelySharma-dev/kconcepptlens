import React, { useEffect, useRef, useState } from 'react';

type Playback = 'idle' | 'speaking' | 'paused' | 'unavailable';

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

export const SpeechControls: React.FC<SpeechControlsProps> = ({ text, rate, label, onRateChange, speechOptionalNote }) => {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [playback, setPlayback] = useState<Playback>(supported ? 'idle' : 'unavailable');

  useEffect(() => {
    return () => {
      if (supported) window.speechSynthesis.cancel();
    };
  }, [supported]);

  const spokenText = useRef(text);
  useEffect(() => {
    if (spokenText.current === text) return;
    spokenText.current = text;
    if (!supported) return;
    window.speechSynthesis.cancel();
    setPlayback((current) => (current === 'unavailable' ? current : 'idle'));
  }, [text, supported]);

  const speak = () => {
    if (!supported) {
      setPlayback('unavailable');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.onend = () => setPlayback('idle');
    utterance.onerror = () => setPlayback('idle');
    window.speechSynthesis.speak(utterance);
    setPlayback('speaking');
  };

  const pause = () => {
    if (!supported) return;
    window.speechSynthesis.pause();
    setPlayback('paused');
  };

  const resume = () => {
    if (!supported) return;
    window.speechSynthesis.resume();
    setPlayback('speaking');
  };

  const stop = () => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setPlayback('idle');
  };

  const status =
    playback === 'unavailable'
      ? 'Speech synthesis is not available in this browser. The text stays on the page.'
      : playback === 'speaking'
        ? 'Playing'
        : playback === 'paused'
          ? 'Paused'
          : 'Not playing';

  return (
    <section className="speech-controls" aria-label={label}>
      <p>
        Playback: <strong>{status}</strong>
      </p>
      <div className="speech-actions">
        <button id="read-current-section" type="button" className="btn-secondary" onClick={speak} disabled={!supported}>
          Read this section
        </button>
        <button type="button" className="btn-secondary" onClick={pause} disabled={playback !== 'speaking'}>
          Pause
        </button>
        <button type="button" className="btn-secondary" onClick={resume} disabled={playback !== 'paused'}>
          Resume
        </button>
        <button type="button" className="btn-secondary" onClick={stop} disabled={playback === 'idle' || playback === 'unavailable'}>
          Stop
        </button>
        <button type="button" className="btn-secondary" onClick={speak} disabled={!supported}>
          Repeat
        </button>
      </div>
      <div className="speech-actions" role="group" aria-label="Speech rate">
        {RATES.map((option) => (
          <button
            key={option.value}
            type="button"
            className="btn-secondary"
            aria-pressed={rate === option.value}
            onClick={() => onRateChange?.(option.value)}
            disabled={!onRateChange}
          >
            {option.label}
            {rate === option.value ? ' (selected)' : ''}
          </button>
        ))}
      </div>
      <p className="path-option-note">
        Audio starts only when you press a button. This is browser speech, not a recorded narration.
        {speechOptionalNote ? ` ${speechOptionalNote}` : ''}
      </p>
    </section>
  );
};
