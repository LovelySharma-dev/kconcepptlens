import React, { useEffect, useMemo, useState } from 'react';
import {
  BiologyLesson,
  ContinuityState,
  appendLearningEvent,
  clearAnswer,
  initialContinuity,
  misconceptionFor,
  normalizeEvidence,
  optionFeedback,
  recordAnswer,
  selectStructure,
  type LearningEvent
} from '@conceptlens/shared';
import { readEvidenceRaw, readLearningPrefs, readProgress, unitFromLesson, writeEvidenceRaw, writeProgress } from './LearningPaths';

interface LessonPracticeProps {
  lesson: BiologyLesson;
  onAnnounce?: (message: string) => void;
  onRevisit: (componentId: string) => void;
}

function loadContinuity(lesson: BiologyLesson): ContinuityState {
  const unit = unitFromLesson(lesson);
  let next = initialContinuity(unit, readLearningPrefs());
  const raw = readProgress(lesson.id);
  if (!raw) return next;
  try {
    const saved = JSON.parse(raw) as ContinuityState;
    if (saved.conceptId === lesson.id && saved.answers) next = { ...next, ...saved, conceptId: lesson.id };
  } catch {
    return next;
  }
  return next;
}

export const LessonPractice: React.FC<LessonPracticeProps> = ({ lesson, onAnnounce, onRevisit }) => {
  const unit = useMemo(() => unitFromLesson(lesson), [lesson]);
  const [continuity, setContinuity] = useState<ContinuityState>(() => loadContinuity(lesson));
  const [evidence, setEvidence] = useState<LearningEvent[]>(() => {
    const raw = readEvidenceRaw();
    if (!raw) return [];
    try {
      return normalizeEvidence(JSON.parse(raw));
    } catch {
      return [];
    }
  });

  useEffect(() => {
    setContinuity(loadContinuity(lesson));
  }, [lesson]);

  useEffect(() => {
    if (continuity.conceptId !== lesson.id) return;
    writeProgress(lesson.id, continuity);
  }, [continuity, lesson.id]);

  useEffect(() => {
    writeEvidenceRaw(JSON.stringify(evidence));
  }, [evidence]);

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {lesson.practiceQuestions.map((question, index) => {
        const saved = continuity.answers[question.id];
        const submitted = Boolean(saved?.submitted);
        const selected = saved?.selectedIndex ?? null;
        const misconception = submitted && selected !== null ? misconceptionFor(question, selected, unit) : null;
        return (
          <article key={question.id} className="practice-card" aria-labelledby={`practice-${question.id}`}>
            <p className="path-kicker">Question {index + 1} of {lesson.practiceQuestions.length}</p>
            <h3 id={`practice-${question.id}`}>{question.question}</h3>
            <p className="path-option-note">Practice · {question.marks} marks · not an official paper</p>
            <div className="practice-options">
              {question.options.map((option, optionIndex) => {
                const chosen = selected === optionIndex;
                const correctOption = optionIndex === question.correctOptionIndex;
                const feedback = optionFeedback(submitted, chosen, correctOption);
                return (
                  <button
                    key={option}
                    type="button"
                    className={`answer-option ${feedback ? 'is-marked' : ''}`}
                    disabled={submitted}
                    onClick={() => {
                      if (submitted) return;
                      const result = recordAnswer(continuity, unit, question, optionIndex);
                      setContinuity(result.state);
                      const conceptId = question.diagramComponentId || lesson.components[0]?.id || lesson.id;
                      setEvidence((current) =>
                        appendLearningEvent(current, {
                          type: 'question_answered',
                          lessonId: lesson.id,
                          conceptId,
                          questionId: question.id,
                          questionLabel: lesson.components.find((component) => component.id === conceptId)?.name || lesson.title,
                          correct: result.correct
                        })
                      );
                      onAnnounce?.(result.correct ? "You're ready to continue." : "Let's review this concept. The explanation is under the question.");
                    }}
                  >
                    <span>{option}</span>
                    {feedback && <span className="answer-status">{feedback}</span>}
                  </button>
                );
              })}
            </div>
            {submitted && (
              <div role="status" className="path-reading">
                <h4>{selected === question.correctOptionIndex ? "You're ready to continue." : "Let's review this concept."}</h4>
                <p>{question.explanation}</p>
                {misconception && (
                  <>
                    <h4>The stored explanation</h4>
                    <p>The chosen statement was: {misconception.chosenStatement}</p>
                    <p>{misconception.correction}</p>
                  </>
                )}
                <div className="lens-actions">
                  {question.diagramComponentId && (
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => {
                        const next = selectStructure(continuity, unit, question.diagramComponentId as string);
                        setContinuity(next.state);
                        writeProgress(lesson.id, next.state);
                        onRevisit(question.diagramComponentId as string);
                      }}
                    >
                      Revisit this concept
                    </button>
                  )}
                  <button type="button" className="btn-secondary" onClick={() => setContinuity(clearAnswer(continuity, question.id))}>
                    Try this question again
                  </button>
                </div>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
};
