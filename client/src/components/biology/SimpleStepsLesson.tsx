import React, { useEffect, useState } from 'react';
import type { BiologyLesson } from '@conceptlens/shared';
import { optionFeedback } from '@conceptlens/shared';
import { CheckCircle2, XCircle } from 'lucide-react';
import { EducationalFigure } from '../cloudinary/EducationalFigure';

const STAGES = [
  'What will I learn?',
  'See an example.',
  'Learn one small idea.',
  'Try it.',
  'Check my understanding.',
  'Review what I learned.'
] as const;

const MARKERS = ['Circle', 'Square', 'Triangle', 'Diamond'];

interface SimpleStepsLessonProps {
  lesson: BiologyLesson;
  stepIndex: number;
  lowData: boolean;
  selectedOption: number | null;
  answerSubmitted: boolean;
  onSelectStep: (index: number) => void;
  onAnswer: (optionIndex: number) => void;
  onTryAgain: () => void;
  onRequestModel: () => void;
  modelVisible: boolean;
}

export const SimpleStepsLesson: React.FC<SimpleStepsLessonProps> = ({
  lesson,
  stepIndex,
  lowData,
  selectedOption,
  answerSubmitted,
  onSelectStep,
  onAnswer,
  onTryAgain,
  onRequestModel,
  modelVisible
}) => {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    setStage(0);
  }, [lesson.id]);

  const idea = lesson.guidedSteps[stepIndex];
  const part = lesson.components.find((component) => component.id === idea?.componentId) || lesson.components[0];
  const question =
    lesson.practiceQuestions.find((item) => item.diagramComponentId === part?.id) || lesson.practiceQuestions[0];
  const correct = question ? selectedOption === question.correctOptionIndex : false;

  return (
    <section className="simple-steps" aria-labelledby="simple-steps-title">
      <p className="path-kicker">Simple Steps</p>
      <h3 id="simple-steps-title">{STAGES[stage]}</h3>
      <p className="simple-steps-progress">
        Step {stage + 1} of {STAGES.length}
        {idea ? `. Idea ${stepIndex + 1} of ${lesson.guidedSteps.length}: ${idea.title}` : ''}
      </p>
      <ol className="simple-steps-index">
        {STAGES.map((title, index) => (
          <li key={title}>
            <button
              type="button"
              className="btn-secondary"
              aria-current={index === stage ? 'step' : undefined}
              onClick={() => setStage(index)}
            >
              {index + 1}. {title}
            </button>
          </li>
        ))}
      </ol>

      {stage === 0 && (
        <div className="lesson-copy">
          <p>{lesson.subtitle}</p>
          <p>{lesson.description}</p>
        </div>
      )}

      {stage === 1 && part && (
        <div className="lesson-copy">
          <p>Look at this example for {part.name}.</p>
          <p>{part.analogy}</p>
          <EducationalFigure conceptId={lesson.id} lowData={lowData} deferUntilRequested={lowData} eager={!lowData} />
          <button type="button" className="btn-secondary" onClick={onRequestModel}>
            {modelVisible ? 'Interactive model is open' : lesson.has3D ? 'Show the 3D model' : 'Show the interactive diagram'}
          </button>
          <p className="path-option-note">You can learn this without the model. The text names the same parts.</p>
        </div>
      )}

      {stage === 2 && part && idea && (
        <div className="lesson-copy">
          <h4>{part.name}</h4>
          <p>{part.simpleExplanation}</p>
          <p>{idea.summary}</p>
          <div className="simple-steps-nav">
            <button type="button" className="btn-secondary" onClick={() => onSelectStep(stepIndex - 1)} disabled={stepIndex === 0}>
              Previous idea
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => onSelectStep(stepIndex + 1)}
              disabled={stepIndex >= lesson.guidedSteps.length - 1}
            >
              Next idea
            </button>
          </div>
        </div>
      )}

      {stage === 3 && idea && (
        <div className="lesson-copy">
          <p>{idea.actionPrompt}</p>
          <p>There is no timer. You can go back and repeat this idea.</p>
          <button type="button" className="btn-secondary" onClick={() => setStage(2)}>
            Repeat this idea
          </button>
        </div>
      )}

      {stage === 4 && question && (
        <div className="lesson-copy">
          <p>{question.question}</p>
          <div className="quiz-options">
            {question.options.map((option, index) => {
              const chosen = selectedOption === index;
              const isCorrect = index === question.correctOptionIndex;
              const feedback = optionFeedback(answerSubmitted, chosen, isCorrect);
              return (
                <button
                  key={option}
                  type="button"
                  className="quiz-option"
                  data-marker={MARKERS[index] || 'Option'}
                  disabled={answerSubmitted}
                  onClick={() => onAnswer(index)}
                >
                  <span>
                    {MARKERS[index] || 'Option'}: {option}
                  </span>
                  {feedback && (
                    <span className="answer-status">
                      {feedback}
                      {isCorrect ? <CheckCircle2 size={16} aria-hidden="true" /> : chosen ? <XCircle size={16} aria-hidden="true" /> : null}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {answerSubmitted && (
            <p role="status">
              {correct
                ? `That matches this lesson. ${question.explanation}`
                : `That choice does not match this lesson. ${question.explanation}`}
            </p>
          )}
          {answerSubmitted && !correct && (
            <button type="button" className="btn-secondary" onClick={onTryAgain}>
              Try this question again
            </button>
          )}
        </div>
      )}

      {stage === 5 && (
        <div className="lesson-copy">
          <p>Here is the same lesson in short lines.</p>
          <ul>
            {lesson.guidedSteps.map((step) => {
              const named = lesson.components.find((component) => component.id === step.componentId);
              return (
                <li key={step.componentId}>
                  <strong>{step.title}. </strong>
                  {named?.simpleExplanation || step.summary}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="simple-steps-nav">
        <button type="button" className="btn-secondary" onClick={() => setStage((current) => Math.max(0, current - 1))} disabled={stage === 0}>
          Go back
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={() => setStage((current) => Math.min(STAGES.length - 1, current + 1))}
          disabled={stage === STAGES.length - 1}
        >
          Next step
        </button>
      </div>
    </section>
  );
};
