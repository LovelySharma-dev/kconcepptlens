import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { GeneratedLesson } from '@conceptlens/shared';
import { Sparkles, RefreshCw, BookOpen, CheckCircle2, XCircle, ChevronLeft, ChevronRight, RotateCw, AlertTriangle } from 'lucide-react';

interface AILessonStudioProps {
  initialLesson?: GeneratedLesson | null;
  sourceText: string;
  topic?: string;
  onAnnounce?: (message: string) => void;
}

export const AILessonStudio: React.FC<AILessonStudioProps> = ({
  initialLesson,
  sourceText,
  topic,
  onAnnounce
}) => {
  const [lesson, setLesson] = useState<GeneratedLesson | null>(initialLesson || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'explanation' | 'flashcards' | 'terms' | 'notes' | 'practice'>('explanation');
  const [explanationMode, setExplanationMode] = useState<'standard' | 'easyRead' | 'steps'>('standard');
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  // Flashcards state
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const flashcardRef = useRef<HTMLDivElement>(null);

  // Practice state: questionId -> selectedIndex
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, boolean>>({});

  const fetchLesson = useCallback(async () => {
    if (!sourceText || sourceText.trim().length === 0) return;
    setLoading(true);
    setError(null);
    onAnnounce?.('Generating structured educational lesson...');

    try {
      const res = await fetch('/api/ai/lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sourceText,
          topic: topic || undefined
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success || !json.data) {
        throw new Error(json.error || 'Failed to generate lesson.');
      }

      setLesson(json.data);
      setFlashcardIdx(0);
      setIsFlipped(false);
      setUserAnswers({});
      setSubmittedAnswers({});
      const method = json.data.generationMetadata.generationMethod === 'huggingface' ? 'AI model' : 'rule-based engine';
      onAnnounce?.(`Lesson ready, generated via ${method}.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lesson generation failed.';
      setError(msg);
      onAnnounce?.(`Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [sourceText, topic, onAnnounce]);

  useEffect(() => {
    if (!initialLesson && sourceText && !lesson && !loading) {
      fetchLesson();
    }
  }, [initialLesson, sourceText, lesson, loading, fetchLesson]);

  // Flashcard keyboard navigation
  const handleFlashcardKeyDown = (e: React.KeyboardEvent) => {
    if (activeTab !== 'flashcards' || !lesson?.flashcards.length) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      setIsFlipped((f) => !f);
      onAnnounce?.(isFlipped ? 'Card front' : 'Card back: ' + (lesson.flashcards[flashcardIdx]?.back || ''));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (flashcardIdx < lesson.flashcards.length - 1) {
        setFlashcardIdx((i) => i + 1);
        setIsFlipped(false);
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (flashcardIdx > 0) {
        setFlashcardIdx((i) => i - 1);
        setIsFlipped(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', marginTop: '1.25rem' }} role="status" aria-live="polite">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent-cyan)' }}>
          <RefreshCw size={24} className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} />
          <strong style={{ fontSize: '1.1rem' }}>Structuring lesson with AI...</strong>
        </div>
        <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Validating source grounding, step progression, and four-option quiz schemas.
        </p>
      </div>
    );
  }

  if (error && !lesson) {
    return (
      <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '1.25rem', borderColor: 'var(--accent-coral)' }} role="alert">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-coral)' }}>
          <AlertTriangle size={20} />
          <strong>Lesson Generation Unavailable</strong>
        </div>
        <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>{error}</p>
        <button type="button" className="btn-secondary" onClick={fetchLesson} style={{ marginTop: '0.75rem' }}>
          <RefreshCw size={14} style={{ marginRight: '0.35rem' }} /> Retry
        </button>
      </div>
    );
  }

  if (!lesson) return null;

  const isAI = lesson.generationMetadata.generationMethod === 'gemini' || lesson.generationMetadata.generationMethod === 'huggingface';
  const providerLabel = lesson.generationMetadata.generationMethod === 'gemini' 
    ? `Gemini ${lesson.generationMetadata.model || 'Flash'} (Free Tier)` 
    : isAI 
      ? `AI: ${lesson.generationMetadata.model || 'Hugging Face'}` 
      : 'Deterministic Rules Engine';
  const currentCard = lesson.flashcards[flashcardIdx];

  return (
    <section className="glass-panel ai-lesson-studio" aria-labelledby="ai-lesson-heading" style={{ marginTop: '1.5rem', padding: '1.5rem' }}>
      {/* Header with Title and AI/Fallback Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <h3 id="ai-lesson-heading" style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>
              {lesson.topic}
            </h3>
            <span
              className="status-pill"
              style={{
                fontSize: '0.75rem',
                padding: '0.2rem 0.6rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                borderRadius: '999px',
                background: isAI ? 'rgba(56, 189, 248, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: isAI ? 'var(--accent-cyan)' : '#f59e0b',
                border: `1px solid ${isAI ? 'rgba(56, 189, 248, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
              }}
            >
              {isAI ? <Sparkles size={13} /> : <BookOpen size={13} />}
              <span>{providerLabel}</span>
            </span>
          </div>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            {lesson.summary}
          </p>
          {lesson.generationMetadata.fallbackUsed && lesson.generationMetadata.fallbackReason && (
            <p className="fine-print" style={{ color: '#f59e0b', marginTop: '0.25rem' }}>
              ℹ️ {lesson.generationMetadata.fallbackReason}
            </p>
          )}
        </div>

        <button
          type="button"
          className="btn-secondary"
          onClick={fetchLesson}
          disabled={loading}
          style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          title="Regenerate lesson"
        >
          <RefreshCw size={14} className={loading ? 'spin-icon' : ''} />
          <span>Regenerate</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <nav
        aria-label="Lesson representations"
        style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '0.75rem',
          marginBottom: '1.25rem'
        }}
      >
        {[
          { id: 'explanation', label: '📖 Multi-Level Explanation' },
          { id: 'flashcards', label: `🗂️ Flashcards (${lesson.flashcards.length})` },
          { id: 'terms', label: `🏷️ Key Terms (${lesson.keyTerms.length})` },
          { id: 'notes', label: `📝 Study Notes (${lesson.studyNotes.length})` },
          { id: 'practice', label: `🎯 Practice (${lesson.practiceQuestions.length})` }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`btn-secondary ${activeTab === tab.id ? 'active' : ''}`}
            aria-selected={activeTab === tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              onAnnounce?.(`Switched to ${tab.label}`);
            }}
            style={{
              fontSize: '0.82rem',
              padding: '0.4rem 0.75rem',
              borderColor: activeTab === tab.id ? 'var(--accent-cyan)' : undefined,
              background: activeTab === tab.id ? 'rgba(56, 189, 248, 0.15)' : undefined
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* 1. MULTI-LEVEL EXPLANATION TAB */}
      {activeTab === 'explanation' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Explanation Mode Switcher */}
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '0.3rem' }}>Format:</span>
            {[
              { id: 'standard', label: 'Standard' },
              { id: 'easyRead', label: 'Easy Read (Plain Language)' },
              { id: 'steps', label: 'Step-by-Step' }
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                className={`tag-btn ${explanationMode === m.id ? 'active' : ''}`}
                aria-pressed={explanationMode === m.id}
                onClick={() => {
                  setExplanationMode(m.id as any);
                  onAnnounce?.(`Switched to ${m.label} format`);
                }}
                style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem' }}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="explanation-display" style={{ padding: '1rem', background: 'var(--bg-elevated)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            {explanationMode === 'standard' && (
              <div style={{ fontSize: '0.95rem', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                {lesson.explanations.standard}
              </div>
            )}

            {explanationMode === 'easyRead' && (
              <div style={{ fontSize: '1rem', lineHeight: '1.85', letterSpacing: '0.02em', whiteSpace: 'pre-line' }}>
                <p className="fine-print" style={{ color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>
                  ℹ️ Plain-language format designed for quick understanding and dyslexia-friendly reading.
                </p>
                {lesson.explanations.easyRead}
              </div>
            )}

            {explanationMode === 'steps' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                    Step {currentStepIdx + 1} of {lesson.explanations.stepByStep.length}
                  </span>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      disabled={currentStepIdx === 0}
                      onClick={() => setCurrentStepIdx((i) => Math.max(0, i - 1))}
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                      aria-label="Previous step"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      disabled={currentStepIdx >= lesson.explanations.stepByStep.length - 1}
                      onClick={() => setCurrentStepIdx((i) => Math.min(lesson.explanations.stepByStep.length - 1, i + 1))}
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                      aria-label="Next step"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                {lesson.explanations.stepByStep[currentStepIdx] && (
                  <div style={{ padding: '1rem', background: 'var(--bg-surface)', borderRadius: '6px', border: '1px solid var(--border-medium)' }}>
                    <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                      {lesson.explanations.stepByStep[currentStepIdx].title}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: '1.65' }}>
                      {lesson.explanations.stepByStep[currentStepIdx].explanation}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. FLASHCARDS TAB */}
      {activeTab === 'flashcards' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }} onKeyDown={handleFlashcardKeyDown}>
          {lesson.flashcards.length === 0 ? (
            <p>No flashcards generated for this topic.</p>
          ) : (
            <>
              <div style={{ width: '100%', maxWidth: '520px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Card {flashcardIdx + 1} of {lesson.flashcards.length}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Press [Space] to flip • [←/→] to navigate
                </span>
              </div>

              {currentCard && (
                <div
                  ref={flashcardRef}
                  tabIndex={0}
                  role="button"
                  aria-label={`Flashcard ${flashcardIdx + 1}: ${isFlipped ? 'Back' : 'Front'}. Press space to flip.`}
                  onClick={() => setIsFlipped((f) => !f)}
                  style={{
                    width: '100%',
                    maxWidth: '520px',
                    minHeight: '220px',
                    padding: '2rem',
                    borderRadius: '12px',
                    background: isFlipped ? 'rgba(56, 189, 248, 0.08)' : 'var(--bg-elevated)',
                    border: `2px solid ${isFlipped ? 'var(--accent-cyan)' : 'var(--border-medium)'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    position: 'relative',
                    transition: 'border-color 0.2s ease, background 0.2s ease',
                    boxShadow: 'var(--shadow-subtle)'
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: '0.75rem',
                      right: '0.75rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: isFlipped ? 'var(--accent-cyan)' : 'var(--text-muted)',
                      textTransform: 'uppercase'
                    }}
                  >
                    {isFlipped ? 'Answer' : 'Prompt / Question'}
                  </span>

                  <div style={{ fontSize: isFlipped ? '1.05rem' : '1.15rem', fontWeight: isFlipped ? 500 : 600, color: 'var(--text-primary)', lineHeight: '1.6' }}>
                    {isFlipped ? currentCard.back : currentCard.front}
                  </div>

                  <span style={{ position: 'absolute', bottom: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <RotateCw size={13} /> Click or press space to flip
                  </span>
                </div>
              )}

              {/* Flashcard Navigation Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={flashcardIdx === 0}
                  onClick={() => {
                    setFlashcardIdx((i) => Math.max(0, i - 1));
                    setIsFlipped(false);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsFlipped((f) => !f)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <RotateCw size={14} /> Flip Card
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={flashcardIdx >= lesson.flashcards.length - 1}
                  onClick={() => {
                    setFlashcardIdx((i) => Math.min(lesson.flashcards.length - 1, i + 1));
                    setIsFlipped(false);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* 3. KEY TERMS TAB */}
      {activeTab === 'terms' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
          {lesson.keyTerms.map((term, idx) => (
            <div key={idx} style={{ padding: '0.85rem 1rem', background: 'var(--bg-elevated)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--accent-cyan)', marginBottom: '0.25rem' }}>
                {term.term}
              </strong>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                {term.definition}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* 4. STUDY NOTES TAB */}
      {activeTab === 'notes' && (
        <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {lesson.studyNotes.map((note, idx) => (
            <li key={idx} style={{ fontSize: '0.92rem', lineHeight: '1.6', color: 'var(--text-primary)' }}>
              {note}
            </li>
          ))}
        </ul>
      )}

      {/* 5. PRACTICE QUESTIONS TAB */}
      {activeTab === 'practice' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {lesson.practiceQuestions.map((q, qIdx) => {
            const hasChosen = userAnswers[q.id] !== undefined;
            const isSubmitted = submittedAnswers[q.id] === true;
            const selectedIdx = userAnswers[q.id];
            const isCorrect = selectedIdx === q.correctOptionIndex;

            return (
              <fieldset
                key={q.id}
                style={{
                  padding: '1.25rem',
                  borderRadius: '10px',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  margin: 0
                }}
              >
                <legend style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-cyan)', padding: '0 0.5rem' }}>
                  Question {qIdx + 1}
                </legend>

                <p style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {q.prompt}
                </p>

                {/* 4 Options Grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {q.options.map((opt, oIdx) => {
                    const isSelected = selectedIdx === oIdx;
                    let optBg = 'var(--bg-surface)';
                    let optBorder = 'var(--border-subtle)';

                    if (isSubmitted) {
                      if (oIdx === q.correctOptionIndex) {
                        optBg = 'rgba(34, 197, 94, 0.15)';
                        optBorder = 'rgba(34, 197, 94, 0.5)';
                      } else if (isSelected && !isCorrect) {
                        optBg = 'rgba(239, 68, 68, 0.15)';
                        optBorder = 'rgba(239, 68, 68, 0.5)';
                      }
                    } else if (isSelected) {
                      optBg = 'rgba(56, 189, 248, 0.15)';
                      optBorder = 'var(--accent-cyan)';
                    }

                    return (
                      <button
                        key={oIdx}
                        type="button"
                        disabled={isSubmitted}
                        onClick={() => {
                          setUserAnswers((prev) => ({ ...prev, [q.id]: oIdx }));
                        }}
                        style={{
                          textAlign: 'left',
                          padding: '0.75rem 1rem',
                          borderRadius: '8px',
                          background: optBg,
                          border: `1.5px solid ${optBorder}`,
                          color: 'var(--text-primary)',
                          fontSize: '0.9rem',
                          cursor: isSubmitted ? 'default' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.75rem',
                          transition: 'border-color 0.15s ease'
                        }}
                      >
                        <span>{opt}</span>
                        {isSubmitted && oIdx === q.correctOptionIndex && (
                          <CheckCircle2 size={18} color="#22c55e" />
                        )}
                        {isSubmitted && isSelected && !isCorrect && (
                          <XCircle size={18} color="#ef4444" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Submit / Feedback Row */}
                <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {!isSubmitted ? (
                    <button
                      type="button"
                      className="btn-primary"
                      disabled={!hasChosen}
                      onClick={() => {
                        setSubmittedAnswers((prev) => ({ ...prev, [q.id]: true }));
                        onAnnounce?.(isCorrect ? 'Correct answer!' : 'Incorrect answer.');
                      }}
                      style={{ fontSize: '0.85rem', padding: '0.45rem 1rem' }}
                    >
                      Check Answer
                    </button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 600, color: isCorrect ? '#22c55e' : '#ef4444' }}>
                        {isCorrect ? '✓ Correct!' : '✗ Incorrect choice.'}
                      </span>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => {
                          setSubmittedAnswers((prev) => ({ ...prev, [q.id]: false }));
                        }}
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                      >
                        Try Again
                      </button>
                    </div>
                  )}

                  {q.sourceReference && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Source: {q.sourceReference}
                    </span>
                  )}
                </div>

                {/* Remediation Explanation */}
                {isSubmitted && (
                  <div
                    style={{
                      marginTop: '0.75rem',
                      padding: '0.75rem',
                      background: 'var(--bg-surface)',
                      borderRadius: '6px',
                      fontSize: '0.88rem',
                      lineHeight: '1.5',
                      borderLeft: `3px solid ${isCorrect ? '#22c55e' : '#ef4444'}`
                    }}
                  >
                    <strong>Explanation: </strong>
                    {q.explanation}
                  </div>
                )}
              </fieldset>
            );
          })}
        </div>
      )}

      {/* Uncertainty Notes Banner if present */}
      {lesson.uncertaintyNotes.length > 0 && (
        <div style={{ marginTop: '1.25rem', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid var(--border-subtle)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <strong>Transparency & Uncertainty Notes:</strong>
          <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1rem' }}>
            {lesson.uncertaintyNotes.map((note, idx) => (
              <li key={idx}>{note}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};
