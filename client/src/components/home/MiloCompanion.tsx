import React, { useEffect, useState } from 'react';
import { speakConceptLens, stopConceptLensSpeech } from '../../a11y/speechBus';
import { Sparkles, Volume2, VolumeX, EyeOff, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

const STORAGE_KEY = 'conceptlens-milo-hidden';

const STEPS = [
  {
    title: 'Hi. I am Milo.',
    body: 'You do not have to figure everything out at once. Want to explore, listen, read, or try a question? I am a companion on this page, not a person, and I do not know how you feel.'
  },
  {
    title: 'Where you are',
    body: 'This is the home launchpad. Find My Way to Learn is optional. Explore the Living Atlas opens the concept workspace in Learn.'
  },
  {
    title: 'What you can do here',
    body: 'Concepts can be explored as interactive diagrams, plain-language text, audio overviews, or practice questions. Speech starts only after you press Listen. Practice is where your own notes go.'
  },
  {
    title: 'One next step',
    body: 'Choose Find My Way to Learn when you want a personalized learning path, or Start Exploring for the full concept list. Hiding me does not hide the page.'
  }
];

export const MiloCompanion: React.FC = () => {
  const [hidden, setHidden] = useState(false);
  const [step, setStep] = useState(0);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    try {
      setHidden(localStorage.getItem(STORAGE_KEY) === '1');
    } catch {
      setHidden(false);
    }
  }, []);

  useEffect(() => {
    return () => stopConceptLensSpeech();
  }, []);

  const persist = (next: boolean) => {
    setHidden(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
    } catch {
      /* the choice still applies for this visit */
    }
    stopConceptLensSpeech();
    setSpeaking(false);
  };

  const speak = () => {
    const text = `${STEPS[step].title}. ${STEPS[step].body}`;
    const started = speakConceptLens(text, 1, {
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
      onError: () => setSpeaking(false)
    });
    if (!started) setSpeaking(false);
  };

  if (hidden) {
    return (
      <section className="milo-section milo-hidden" aria-labelledby="milo-hidden-title" style={{ margin: '1.5rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1.25rem', background: 'var(--surface-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sparkles size={18} color="var(--accent-cyan)" aria-hidden="true" />
            <div>
              <h2 id="milo-hidden-title" style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>
                Milo is hidden
              </h2>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                The lessons and tools on this page remain fully available. You can show the companion whenever you want.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => persist(false)}
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Eye size={14} aria-hidden="true" />
            <span>Show Milo</span>
          </button>
        </div>
      </section>
    );
  }

  const current = STEPS[step];

  return (
    <section className="milo-section" aria-labelledby="milo-title" style={{ margin: '2rem 0' }}>
      <div
        className="glass-panel"
        style={{
          padding: '1.5rem 1.75rem',
          borderLeft: '4px solid var(--accent-cyan)',
          position: 'relative'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'rgba(56, 189, 248, 0.15)',
                color: 'var(--accent-cyan)'
              }}
            >
              <Sparkles size={15} aria-hidden="true" />
            </span>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, color: 'var(--accent-cyan)' }}>
              Learning Companion · Step {step + 1} of {STEPS.length}
            </span>
          </div>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => persist(true)}
            style={{ fontSize: '0.78rem', padding: '0.25rem 0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            aria-label="Hide Milo learning companion"
          >
            <EyeOff size={14} aria-hidden="true" />
            <span>Hide Milo</span>
          </button>
        </div>

        <h2 id="milo-title" style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.35rem' }}>
          Milo — Your Learning Companion
        </h2>
        <h3 style={{ fontSize: '1.02rem', fontWeight: 600, color: 'var(--accent-cyan)', margin: '0 0 0.5rem' }}>
          {current.title}
        </h3>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 0.85rem', maxWidth: '48rem' }}>
          {current.body}
        </p>

        <p style={{ margin: '0 0 1rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Speech starts only when you press Listen. The same words stay on the page if you turn animation or sound off.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setStep((value) => Math.max(0, value - 1))}
            disabled={step === 0}
            style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
          >
            <ChevronLeft size={15} aria-hidden="true" />
            <span>Previous</span>
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => setStep((value) => Math.min(STEPS.length - 1, value + 1))}
            disabled={step === STEPS.length - 1}
            style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
          >
            <span>Next step</span>
            <ChevronRight size={15} aria-hidden="true" />
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={speaking ? () => { stopConceptLensSpeech(); setSpeaking(false); } : speak}
            style={{ fontSize: '0.82rem', padding: '0.35rem 0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            {speaking ? <VolumeX size={15} aria-hidden="true" /> : <Volume2 size={15} aria-hidden="true" />}
            <span>{speaking ? 'Stop listening' : 'Listen to this step'}</span>
          </button>
        </div>
      </div>
    </section>
  );
};
