import React, { useState } from 'react';
import { BiologyLesson } from '@conceptlens/shared';
import {
  Award,
  CheckCircle2,
  XCircle,
  RotateCcw,
  X
} from 'lucide-react';

interface BiologyPracticeModalProps {
  lesson: BiologyLesson;
  isOpen: boolean;
  onClose: () => void;
  onAnnounce?: (msg: string) => void;
}

export const BiologyPracticeModal: React.FC<BiologyPracticeModalProps> = ({
  lesson,
  isOpen,
  onClose,
  onAnnounce
}) => {
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [filterMode, setFilterMode] = useState<'all' | 'incorrect'>('all');

  if (!isOpen) return null;

  const questions = lesson.practiceQuestions;

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex
    }));

    const q = questions.find((item) => item.id === questionId);
    if (q && onAnnounce) {
      const isCorrect = optionIndex === q.correctOptionIndex;
      onAnnounce(isCorrect ? `Question ${q.id}: Correct!` : `Question ${q.id}: Incorrect. Review explanation.`);
    }
  };

  const handleResetSession = () => {
    setUserAnswers({});
    setFilterMode('all');
    if (onAnnounce) onAnnounce('Reset practice question session.');
  };

  // Score computation
  const answeredCount = Object.keys(userAnswers).length;
  const correctCount = questions.filter(
    (q) => userAnswers[q.id] === q.correctOptionIndex
  ).length;
  const totalScorePercent =
    answeredCount > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

  // Filter questions for display
  const displayedQuestions = questions.filter((q) => {
    if (filterMode === 'incorrect') {
      const ans = userAnswers[q.id];
      return ans !== undefined && ans !== q.correctOptionIndex;
    }
    return true;
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(7, 11, 20, 0.85)',
        backdropFilter: 'blur(10px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem'
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="practice-modal-title"
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '860px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.75rem',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.12)'
        }}
      >
        {/* Modal Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={20} color="#f59e0b" />
              <h2 id="practice-modal-title" style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0 }}>
                {lesson.title} — Exam Practice Sandbox
              </h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Practice questions from this lesson. Not an official exam paper.
            </p>
          </div>

          <button
            type="button"
            className="icon-btn-sm"
            onClick={onClose}
            aria-label="Close Practice Modal"
            style={{ width: '32px', height: '32px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Score Telemetry Strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            background: 'rgba(255, 255, 255, 0.02)',
            padding: '0.75rem 1.25rem',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            marginBottom: '1.25rem'
          }}
        >
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Progress: </span>
              <strong style={{ color: 'var(--text-primary)' }}>{answeredCount} / {questions.length} Answered</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Score: </span>
              <strong style={{ color: '#34d399' }}>{correctCount} Correct</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Accuracy: </span>
              <strong style={{ color: totalScorePercent >= 75 ? '#34d399' : '#f59e0b' }}>
                {totalScorePercent}%
              </strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className={`tag-btn ${filterMode === 'all' ? 'active' : ''}`}
              onClick={() => setFilterMode('all')}
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
            >
              All Questions ({questions.length})
            </button>
            <button
              type="button"
              className={`tag-btn ${filterMode === 'incorrect' ? 'active' : ''}`}
              onClick={() => setFilterMode('incorrect')}
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
            >
              Review Mistakes ({answeredCount - correctCount})
            </button>
            <button
              type="button"
              className="icon-btn-sm"
              onClick={handleResetSession}
              title="Reset Practice Session"
              aria-label="Reset Practice"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Scrollable Questions List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingRight: '0.5rem' }}>
          {displayedQuestions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={36} color="#34d399" style={{ margin: '0 auto 0.75rem auto' }} />
              <p style={{ fontWeight: 600 }}>No incorrect answers to review!</p>
              <p style={{ fontSize: '0.85rem' }}>You answered all questions correctly or haven't answered any yet.</p>
            </div>
          ) : (
            displayedQuestions.map((q, idx) => {
              const selectedOpt = userAnswers[q.id];
              const isAnswered = selectedOpt !== undefined;
              const isCorrect = selectedOpt === q.correctOptionIndex;

              return (
                <div
                  key={q.id}
                  style={{
                    background: 'rgba(15, 23, 42, 0.45)',
                    border: `1px solid ${
                      !isAnswered
                        ? 'rgba(255, 255, 255, 0.08)'
                        : isCorrect
                        ? 'rgba(16, 185, 129, 0.4)'
                        : 'rgba(239, 68, 68, 0.4)'
                    }`,
                    borderRadius: '12px',
                    padding: '1.25rem'
                  }}
                >
                  {/* Question Meta Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                      QUESTION {idx + 1} OF {questions.length}
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: 'var(--text-muted)'
                        }}
                      >
                        Practice · {q.marks} marks · not an official paper
                      </span>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.9rem', lineHeight: 1.45 }}>
                    {q.question}
                  </div>

                  {/* 4 Options Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    {q.options.map((opt, optIndex) => {
                      const isOptionSelected = selectedOpt === optIndex;
                      const isOptionCorrect = optIndex === q.correctOptionIndex;

                      let border = 'rgba(255, 255, 255, 0.1)';
                      let bg = 'rgba(255, 255, 255, 0.03)';
                      let color = 'var(--text-secondary)';

                      if (isAnswered) {
                        if (isOptionCorrect) {
                          border = '#10b981';
                          bg = 'rgba(16, 185, 129, 0.18)';
                          color = '#34d399';
                        } else if (isOptionSelected && !isOptionCorrect) {
                          border = '#ef4444';
                          bg = 'rgba(239, 68, 68, 0.18)';
                          color = '#f87171';
                        }
                      }

                      return (
                        <button
                          key={optIndex}
                          type="button"
                          onClick={() => handleSelectOption(q.id, optIndex)}
                          style={{
                            padding: '0.6rem 0.9rem',
                            borderRadius: '8px',
                            border: `1px solid ${border}`,
                            background: bg,
                            color: color,
                            textAlign: 'left',
                            fontSize: '0.82rem',
                            lineHeight: 1.35,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.5rem',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span>{opt}</span>
                          {isAnswered && isOptionCorrect && <span>Correct answer <CheckCircle2 size={16} aria-hidden="true" /></span>}
                          {isAnswered && isOptionSelected && !isOptionCorrect && <span>Your choice. Not this answer. <XCircle size={16} aria-hidden="true" /></span>}
                        </button>
                      );
                    })}
                  </div>

                  {/* Immediate Detailed Feedback */}
                  {isAnswered && (
                    <div
                      style={{
                        marginTop: '0.75rem',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        background: isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        borderLeft: `3px solid ${isCorrect ? '#10b981' : '#ef4444'}`,
                        fontSize: '0.82rem',
                        lineHeight: 1.45
                      }}
                    >
                      <strong style={{ color: isCorrect ? '#34d399' : '#f87171', display: 'block', marginBottom: '0.2rem' }}>
                        {isCorrect ? '✓ Correct Answer' : '✗ Incorrect Option Selected'}
                      </strong>
                      <span style={{ color: 'var(--text-secondary)' }}>{q.explanation}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
