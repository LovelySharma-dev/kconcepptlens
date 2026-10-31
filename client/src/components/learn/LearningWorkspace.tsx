import React, { useEffect, useRef } from 'react';
import type {
  ContentTypeId,
  MaterialAction,
  MaterialEvidence,
  MaterialExplanation,
  MaterialRecommendation,
  PresentedMaterial,
  SubjectId,
  WorkspacePanel
} from '@conceptlens/shared';
import { CONTENT_TYPE_IDS, SUBJECT_IDS, WORKSPACE_PANELS, evaluateMaterial, moveWorkspacePanel } from '@conceptlens/shared';
import { EducationalFigure } from '../cloudinary/EducationalFigure';
import { SpeechControls } from '../SpeechControls';

const SUBJECT_LABELS: Record<SubjectId, string> = {
  mathematics: 'Mathematics',
  physics: 'Physics',
  chemistry: 'Chemistry',
  biology: 'Biology',
  computer_science: 'Computer science',
  history: 'History',
  geography: 'Geography',
  literature: 'Literature and language',
  general: 'General notes',
  unknown: 'Not identified'
};

const CONTENT_LABELS: Record<ContentTypeId, string> = {
  equation: 'Equation',
  diagram: 'Diagram',
  table: 'Table',
  textbook_passage: 'Textbook passage',
  handwritten_notes: 'Handwritten notes',
  programming_code: 'Programming code',
  historical_timeline: 'Historical timeline',
  map: 'Map',
  scientific_process: 'Scientific process',
  question: 'Question',
  prose: 'Prose',
  unknown: 'Not identified'
};

const ACTION_LABELS: Record<MaterialAction, string> = {
  explain_differently: 'Explain this differently',
  make_simpler: 'Make this simpler',
  show_steps: 'Show steps',
  show_diagram: 'Show a relevant diagram',
  read_aloud: 'Read this section aloud',
  repeat_step: 'Repeat this step',
  practice: 'Give me a practice question',
  review_mistake: 'Review my mistake',
  continue: 'Continue learning'
};

export interface AnswerState {
  questionId: string;
  correct: boolean;
  explanation: string;
  why: string;
  relatedStepIndex?: number;
  stage?: string;
}

interface LearningWorkspaceProps {
  explanation: MaterialExplanation;
  presented: PresentedMaterial;
  stepIndex: number;
  evidence: MaterialEvidence;
  recommendation: MaterialRecommendation;
  previewUrl: string | null;
  fileLabel: string | null;
  lowData: boolean;
  speechRate: 0.8 | 1 | 1.25;
  recognizedText: string;
  busy: boolean;
  answerState: AnswerState | null;
  clearOpen: boolean;
  activePanel: WorkspacePanel;
  onPanel: (panel: WorkspacePanel) => void;
  onRecognizedText: (text: string) => void;
  onUpdateText: () => void;
  onCorrect: (subject: SubjectId, contentType: ContentTypeId) => void;
  onAction: (action: MaterialAction) => void;
  onStep: (index: number) => void;
  onAnswer: (questionId: string, index: number) => void;
  onClearRequest: () => void;
  onClearConfirm: () => void;
  onClearCancel: () => void;
  onClose: () => void;
  onSpeechRate: (rate: 0.8 | 1 | 1.25) => void;
  onRetryAnswer?: () => void;
}

export const LearningWorkspace: React.FC<LearningWorkspaceProps> = ({
  explanation,
  presented,
  stepIndex,
  evidence,
  recommendation,
  previewUrl,
  fileLabel,
  lowData,
  speechRate,
  recognizedText,
  busy,
  answerState,
  clearOpen,
  activePanel,
  onPanel,
  onRecognizedText,
  onUpdateText,
  onCorrect,
  onAction,
  onStep,
  onAnswer,
  onClearRequest,
  onClearConfirm,
  onClearCancel,
  onClose,
  onSpeechRate
}) => {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (clearOpen) cancelRef.current?.focus();
  }, [clearOpen]);

  const attempts = evidence.attempts.length;
  const correct = evidence.attempts.filter((attempt) => attempt.correct).length;
  const visibleSteps = explanation.steps.filter((step) => presented.visibleStepIndexes.includes(step.index));
  const evaluation = evaluateMaterial(explanation);
  const strategy = explanation.solvingStrategy;

  const onPanelKey = (event: React.KeyboardEvent<HTMLElement>) => {
    const next = moveWorkspacePanel(activePanel, event.key);
    if (next === activePanel) return;
    event.preventDefault();
    onPanel(next);
    document.getElementById(`material-${next}`)?.focus();
  };

  return (
    <section className="learn-workspace" aria-labelledby="workspace-title">
      <div className="workspace-heading">
        <div>
          <p className="path-kicker">{explanation.demo ? 'Sample content' : 'Your material'}</p>
          <h2 id="workspace-title">{explanation.mainConcept}</h2>
          <p>
            <span className={`status-pill ${strategy.specialized ? '' : 'status-planned'}`}>
              {strategy.specialized ? (strategy.matched ? 'Specialized strategy' : 'Strategy did not match') : 'No specialized strategy'}
            </span>{' '}
            {strategy.label}. {strategy.scope}
          </p>
          <p>{explanation.learningObjective}</p>
        </div>
        <button type="button" className="btn-secondary" onClick={onClose}>
          Back to upload
        </button>
      </div>

      {explanation.demo && (
        <p className="demo-banner" role="note">
          {explanation.extractionNote} A sample does not show that an arbitrary file can be read.
        </p>
      )}

      <nav className="workspace-jump" aria-label="Workspace sections" onKeyDown={onPanelKey}>
        {WORKSPACE_PANELS.map((panel) => (
          <button
            key={panel}
            type="button"
            className={activePanel === panel ? 'active' : ''}
            aria-current={activePanel === panel ? 'true' : undefined}
            onClick={() => {
              onPanel(panel);
              document.getElementById(`material-${panel}`)?.focus();
            }}
          >
            {panel === 'original'
              ? 'Original'
              : panel === 'recognized'
                ? 'Recognized'
                : panel === 'explanation'
                  ? 'Explanation'
                  : panel === 'steps'
                    ? 'Steps'
                    : panel === 'practice'
                      ? 'Practice'
                      : 'Progress'}
          </button>
        ))}
      </nav>

      <div className="workspace-grid">
        <div className="workspace-side">
          <section id="material-original" className="workspace-panel" tabIndex={-1} aria-labelledby="original-title">
            <h3 id="original-title">Original material</h3>
            {fileLabel && <p>{fileLabel}</p>}
            {previewUrl && <img className="material-preview" src={previewUrl} alt="Preview of the selected image, before interpretation." />}
            <p className="source-text">{explanation.sourceContent}</p>
            <p className="fine-print">
              {explanation.sourceReferences[0]?.label}: {explanation.sourceReferences[0]?.location}
            </p>
          </section>

          <section id="material-recognized" className="workspace-panel" tabIndex={-1} aria-labelledby="recognized-title">
            <h3 id="recognized-title">Recognized text</h3>
            <p>{explanation.extractionNote}</p>
            <label htmlFor="recognized-text">Text used for the explanation</label>
            <textarea
              id="recognized-text"
              value={recognizedText}
              onChange={(event) => onRecognizedText(event.target.value)}
              rows={6}
            />
            <label htmlFor="subject-correction">Subject</label>
            <select
              id="subject-correction"
              value={explanation.subject}
              onChange={(event) => onCorrect(event.target.value as SubjectId, explanation.contentType)}
            >
              {SUBJECT_IDS.map((subject) => (
                <option key={subject} value={subject}>
                  {SUBJECT_LABELS[subject]}
                </option>
              ))}
            </select>
            <label htmlFor="type-correction">Content type</label>
            <select
              id="type-correction"
              value={explanation.contentType}
              onChange={(event) => onCorrect(explanation.subject, event.target.value as ContentTypeId)}
            >
              {CONTENT_TYPE_IDS.map((contentType) => (
                <option key={contentType} value={contentType}>
                  {CONTENT_LABELS[contentType]}
                </option>
              ))}
            </select>
            <p>
              Confidence {Math.round(explanation.subjectConfidence * 100)}%.
              {explanation.subjectUncertain ? ' This estimate is uncertain.' : ' This estimate has supporting keywords.'}
              {explanation.learnerCorrectedSubject ? ' You corrected this classification.' : ''}
            </p>
            <button type="button" className="btn-secondary" onClick={onUpdateText} disabled={busy || recognizedText.trim().length === 0}>
              Update from this text
            </button>
          </section>
        </div>

        <div className="workspace-main">
          <section id="material-explanation" className="workspace-panel" tabIndex={-1} aria-labelledby="explanation-title">
            <h3 id="explanation-title">Explanation</h3>
            {presented.nextAction && <p className="next-action">{presented.nextAction}</p>}
            {presented.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {presented.usedFallback && presented.fallbackNote && <p>{presented.fallbackNote}</p>}
            {presented.showingPlain && presented.fullParagraphs.length > 0 && (
              <details>
                <summary>Full explanation</summary>
                {presented.fullParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </details>
            )}
            {presented.everyday && (
              <p>
                <strong>Everyday example. </strong>
                {presented.everyday}
              </p>
            )}
            {presented.diagramDescription && (
              <p>
                <strong>Diagram. </strong>
                {presented.diagramDescription}
              </p>
            )}
            {presented.glossary.length > 0 && (
              <dl className="glossary">
                {presented.glossary.map((entry) => (
                  <div key={entry.term}>
                    <dt>{entry.term}</dt>
                    <dd>{entry.meaning}</dd>
                  </div>
                ))}
              </dl>
            )}
            {presented.colorNote && <p>{presented.colorNote}</p>}
            {presented.captionNote && <p>{presented.captionNote}</p>}
            {presented.lowDataNote && <p>{presented.lowDataNote}</p>}
            {explanation.verified.length > 0 && (
              <div>
                <h4>Checked against the source</h4>
                <ul>
                  {explanation.verified.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {explanation.interpretation.length > 0 && (
              <div>
                <h4>Interpretation</h4>
                <ul>
                  {explanation.interpretation.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {explanation.uncertaintyNotes.length > 0 && (
              <p role="status">{explanation.uncertaintyNotes.join(' ')}</p>
            )}
            <div className="workspace-actions">
              {presented.actions
                .filter((action) => action !== 'read_aloud')
                .map((action) => (
                  <button key={action} type="button" className="btn-secondary" onClick={() => onAction(action)}>
                    {ACTION_LABELS[action]}
                  </button>
                ))}
            </div>
            {presented.actions.includes('read_aloud') && presented.speechText && (
              <SpeechControls
                text={presented.speechText}
                rate={speechRate}
                label="Read this section aloud"
                onRateChange={onSpeechRate}
                speechOptionalNote={presented.speechNote ?? undefined}
              />
            )}
            {presented.speechNote && !presented.speechText && <p>{presented.speechNote}</p>}
            {explanation.linkedLessonId && (
              <EducationalFigure
                conceptId={explanation.linkedLessonId}
                lowData={lowData}
                deferUntilRequested={lowData}
              />
            )}
          </section>

          <section id="material-steps" className="workspace-panel" tabIndex={-1} aria-labelledby="steps-title">
            <h3 id="steps-title">Learning steps</h3>
            {visibleSteps.length === 0 && <p>No separate steps are stored. The explanation above is the whole lesson.</p>}
            <ol>
              {visibleSteps.map((step) => (
                <li key={step.index} aria-current={step.index === stepIndex ? 'step' : undefined}>
                  <strong>{step.title}</strong>
                  <p>{step.detail}</p>
                  <p className="fine-print">{step.verified ? 'This step was checked.' : 'This step is copied or estimated, and it is not a checked calculation.'}</p>
                </li>
              ))}
            </ol>
            {explanation.steps.length > 1 && (
              <div className="workspace-actions">
                <button type="button" className="btn-secondary" onClick={() => onStep(Math.max(0, stepIndex - 1))} disabled={stepIndex === 0}>
                  Previous step
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => onStep(Math.min(explanation.steps.length - 1, stepIndex + 1))}
                  disabled={stepIndex >= explanation.steps.length - 1}
                >
                  Next step
                </button>
              </div>
            )}
          </section>

          <section id="material-practice" className="workspace-panel" tabIndex={-1} aria-labelledby="practice-title">
            <h3 id="practice-title">Practice</h3>
            {presented.hint && <p>Hint: {presented.hint}</p>}
            {explanation.practice.length === 0 && <p>No practice question is stored for this material.</p>}
            {explanation.practice.map((question) => (
              <fieldset key={question.id}>
                <legend>{question.prompt}</legend>
                {question.options.map((option, index) => (
                  <button
                    key={option}
                    type="button"
                    className="btn-secondary choice"
                    onClick={() => onAnswer(question.id, index)}
                    disabled={busy}
                  >
                    {option}
                  </button>
                ))}
                {answerState?.questionId === question.id && (
                  <p role="status">
                    {answerState.correct ? 'Correct. ' : 'Not the stored answer. '}
                    {answerState.explanation} {answerState.why}
                  </p>
                )}
              </fieldset>
            ))}
          </section>

          <section id="material-progress" className="workspace-panel" tabIndex={-1} aria-labelledby="progress-title">
            <h3 id="progress-title">Progress and next step</h3>
            <p>
              {`${evidence.concepts.length} concept${evidence.concepts.length === 1 ? '' : 's'} explored. ${attempts} question${attempts === 1 ? '' : 's'} attempted. ${correct} correct. ${evidence.reviews.length} review${evidence.reviews.length === 1 ? '' : 's'}.`}
            </p>
            <p>
              <strong>{`${recommendation.title}.`}</strong> {recommendation.why}
            </p>
            <p className="fine-print">
              These counts follow answer rules. They are not a trained model, and they are not a reading of ability or disability.
            </p>
            <h4>Measured checks</h4>
            <ul className="measure-list">
              <li>
                Correctness: {evaluation.correctness.passed} of {evaluation.correctness.checks} recomputed checks passed.
              </li>
              {evaluation.accessibility.map((item) => (
                <li key={item.name}>
                  {item.name}: {item.passed ? 'passed' : 'failed'}. {item.detail}
                </li>
              ))}
              <li>
                Sentence length: standard {evaluation.readability.standardWordsPerSentence} words, Easy Read{' '}
                {evaluation.readability.easyReadWordsPerSentence}. {evaluation.readability.note}
              </li>
              <li>{evaluation.answerNote}</li>
              <li>{evaluation.outcomeNote}</li>
            </ul>
            <button type="button" className="btn-secondary" onClick={onClearRequest}>
              Clear saved lesson data
            </button>
            {explanation.limitations.length > 0 && (
              <ul className="fine-list">
                {explanation.limitations.slice(0, 3).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
            <MediaFailureExample />
          </section>
        </div>
      </div>

      {clearOpen && (
        <div className="dialog-backdrop">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="clear-title"
            className="confirm-dialog"
            onKeyDown={(event) => {
              if (event.key === 'Escape') onClearCancel();
              if (event.key !== 'Tab') return;
              const first = cancelRef.current;
              const last = confirmRef.current;
              if (!first || !last) return;
              if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
              } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
              }
            }}
          >
            <h3 id="clear-title">Clear saved lesson data?</h3>
            <p>This removes material progress in this browser and the local Python answer weights. Biology lesson places stored in this browser are cleared too. Uploaded Cloudinary files are not deleted from here.</p>
            <div className="workspace-actions">
              <button ref={cancelRef} type="button" className="btn-secondary" onClick={onClearCancel}>
                Keep data
              </button>
              <button ref={confirmRef} type="button" className="btn-primary" onClick={onClearConfirm}>
                Clear saved data
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

const MediaFailureExample: React.FC = () => {
  const [failed, setFailed] = React.useState(false);
  const [started, setStarted] = React.useState(false);
  return (
    <div className="failure-example">
      <h4>If a diagram does not load</h4>
      {!started && (
        <button type="button" className="btn-secondary" onClick={() => setStarted(true)}>
          Show a failed diagram fallback
        </button>
      )}
      {started && !failed && (
        <img
          src="https://res.cloudinary.com/demo/image/upload/conceptlens_missing_diagram.png"
          alt="Attempt to load a diagram that is not a lesson asset."
          onError={() => setFailed(true)}
        />
      )}
      {failed && (
        <p role="status">The diagram could not be loaded. The written explanation is still here. Nothing essential was only in the picture.</p>
      )}
    </div>
  );
};
