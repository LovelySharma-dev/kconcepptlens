import React from 'react';
import type { LearningRecommendation, LessonActivitySummary, ProgressStage } from '@conceptlens/shared';
import { PROGRESS_LABELS } from '@conceptlens/shared';

interface NextStepPanelProps {
  conceptName: string;
  stage: ProgressStage;
  summary: LessonActivitySummary;
  recommendation: LearningRecommendation | null;
  onAccept: (recommendation: LearningRecommendation) => void;
}

export const NextStepPanel: React.FC<NextStepPanelProps> = ({
  conceptName,
  stage,
  summary,
  recommendation,
  onAccept
}) => {
  return (
    <section className="next-step" aria-labelledby="next-step-heading">
      <div className="next-step-head">
        <h2 id="next-step-heading">Your next step</h2>
        <p>
          {conceptName}: {PROGRESS_LABELS[stage]}. These labels follow activity in this browser. They are not a mastery score.
        </p>
      </div>
      <dl className="activity-row">
        <div>
          <dt>Concepts explored</dt>
          <dd>{summary.conceptsExplored}</dd>
        </div>
        <div>
          <dt>Questions attempted</dt>
          <dd>{summary.questionsAttempted}</dd>
        </div>
        <div>
          <dt>Correct answers</dt>
          <dd>{summary.correctAnswers}</dd>
        </div>
        <div>
          <dt>Concepts reviewed</dt>
          <dd>{summary.conceptsReviewed}</dd>
        </div>
      </dl>
      {summary.allQuestionsAttempted && (
        <p>Every stored question in this lesson has been attempted. That is practice, not a validated assessment.</p>
      )}
      {recommendation ? (
        <div className="next-step-suggestion">
          <h3>{recommendation.title}</h3>
          <p>{recommendation.why}</p>
          <details>
            <summary>Why this suggestion?</summary>
            <p>
              {recommendation.why} The suggestion uses answers saved for this lesson. It does not describe an ability or a diagnosis.
            </p>
          </details>
          {recommendation.actionable && (
            <button type="button" className="btn-secondary" onClick={() => onAccept(recommendation)}>
              {recommendation.title}
            </button>
          )}
        </div>
      ) : (
        <p>Answer a question when you want a suggestion. Nothing is suggested before that.</p>
      )}
    </section>
  );
};
