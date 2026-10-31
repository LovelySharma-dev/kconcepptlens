import React, { useMemo, useState } from 'react';
import type { LearningPreferences, MaterialExplanation } from '@conceptlens/shared';
import {
  SAMPLE_MATERIALS,
  SUBJECT_STRATEGIES,
  applyLearningTheme,
  buildMaterialExplanation,
  defaultLearningPreferences,
  evaluateMaterial,
  preferenceDemonstration,
  presentForPreferences
} from '@conceptlens/shared';

type PresetId = 'standard' | 'easy-read' | 'simple-steps' | 'speech-free' | 'both';

const PRESETS: Array<{ id: PresetId; label: string }> = [
  { id: 'standard', label: 'Standard' },
  { id: 'easy-read', label: 'Easy Read' },
  { id: 'simple-steps', label: 'Simple Steps' },
  { id: 'speech-free', label: 'Speech-free' },
  { id: 'both', label: 'Easy Read and Simple Steps' }
];

function presetPreferences(id: PresetId): LearningPreferences {
  const base = defaultLearningPreferences();
  if (id === 'easy-read') return applyLearningTheme(base, 'easy-read');
  if (id === 'simple-steps') return applyLearningTheme(base, 'simple-steps');
  if (id === 'speech-free') return applyLearningTheme(base, 'speech-free');
  if (id === 'both') return applyLearningTheme(applyLearningTheme(base, 'easy-read'), 'simple-steps');
  return base;
}

interface GuidedDemoProps {
  preferences: LearningPreferences;
  onPreferences: (next: LearningPreferences) => void;
  onOpen: (text: string, sampleId: string | null) => void;
  busy: boolean;
}

export const GuidedDemo: React.FC<GuidedDemoProps> = ({ preferences, onPreferences, onOpen, busy }) => {
  const [sampleId, setSampleId] = useState<string | null>(SAMPLE_MATERIALS[0].id);
  const [draft, setDraft] = useState(SAMPLE_MATERIALS[0].text);
  const [preset, setPreset] = useState<PresetId>('standard');

  const preview = useMemo(() => {
    const text = draft.trim();
    if (text.length < 8) return { explanation: null as MaterialExplanation | null, error: null as string | null };
    try {
      return {
        explanation: buildMaterialExplanation({
          text,
          sourceKind: sampleId ? 'sample' : 'learner_text',
          sampleId
        }),
        error: null as string | null
      };
    } catch {
      return { explanation: null as MaterialExplanation | null, error: 'This text could not be prepared for a preview.' };
    }
  }, [draft, sampleId]);
  const explanation = preview.explanation;

  const views = explanation ? preferenceDemonstration(explanation) : null;
  const selected = explanation ? presentForPreferences(explanation, preferences) : null;
  const evaluation = explanation ? evaluateMaterial(explanation) : null;

  return (
    <section id="guided-demo" className="upload-well story-target" tabIndex={-1} aria-labelledby="demo-title">
      <p className="path-kicker">Guided demo</p>
      <h2 id="demo-title">Same question, different explanations</h2>
      <p>
        Choose a question, choose how it should be shown, then open the lesson. The three columns are the same source. Easy Read uses stored plain wording. Simple Steps shows one step. The checks below measure the wording and the interface.
      </p>
      <div className="learn-actions" role="group" aria-label="Demo questions">
        {SAMPLE_MATERIALS.map((sample) => (
          <button
            key={sample.id}
            type="button"
            className="btn-secondary"
            aria-pressed={sampleId === sample.id}
            onClick={() => {
              setSampleId(sample.id);
              setDraft(sample.text);
            }}
          >
            {sample.label}
          </button>
        ))}
      </div>
      <label htmlFor="demo-question">Question</label>
      <textarea
        id="demo-question"
        rows={5}
        value={draft}
        onChange={(event) => {
          setSampleId(null);
          setDraft(event.target.value);
        }}
      />
      <div className="learn-actions" role="group" aria-label="Accessibility presets">
        {PRESETS.map((item) => (
          <button
            key={item.id}
            type="button"
            className="btn-secondary"
            aria-pressed={preset === item.id}
            onClick={() => {
              setPreset(item.id);
              onPreferences(presetPreferences(item.id));
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
      <p className="fine-print">A demo preset starts from a standard lesson and adds the theme you choose.</p>
      {preview.error && <p role="status">{preview.error}</p>}
      {explanation && views && selected && evaluation && (
        <>
          <p>
            <span className={`status-pill ${explanation.solvingStrategy.specialized ? '' : 'status-planned'}`}>
              {explanation.solvingStrategy.specialized
                ? explanation.solvingStrategy.matched
                  ? 'Specialized strategy'
                  : 'Strategy did not match'
                : 'No specialized strategy'}
            </span>{' '}
            {explanation.solvingStrategy.label}. {explanation.solvingStrategy.scope}
          </p>
          <div className="demo-grid">
            <article className="workspace-panel">
              <h3>Standard</h3>
              <p>{views.standard.paragraphs[0]}</p>
              <p className="fine-print">{views.standard.visibleStepIndexes.length} steps visible. Speech text is available.</p>
            </article>
            <article className="workspace-panel">
              <h3>Easy Read</h3>
              <p>{views.easyRead.paragraphs[0]}</p>
              <p className="fine-print">
                {views.easyRead.showingPlain ? 'Plain wording is showing.' : views.easyRead.fallbackNote}
              </p>
            </article>
            <article className="workspace-panel">
              <h3>Simple Steps</h3>
              <p>
                {explanation.steps.find((step) => step.index === views.simpleSteps.visibleStepIndexes[0])?.title ?? 'No step is stored.'}
              </p>
              <p className="fine-print">
                {views.simpleSteps.visibleStepIndexes.length} of {explanation.steps.length} steps visible. The others stay available when you move forward.
              </p>
            </article>
          </div>
          <h3>With the preset you selected</h3>
          <p>{selected.paragraphs[0]}</p>
          <p className="fine-print">
            {selected.visibleStepIndexes.length} step{selected.visibleStepIndexes.length === 1 ? '' : 's'} visible.
            {selected.speechText ? ' Speech can read this text when you start it.' : ' Speech text is off.'}
          </p>
          <h3>Measured checks</h3>
          <ul className="measure-list">
            <li>
              Correctness: {evaluation.correctness.passed} of {evaluation.correctness.checks} recomputed checks passed.
              {evaluation.correctness.items.map((item) => ` ${item.name}: ${item.passed ? 'passed' : 'failed'}.`)}
            </li>
            {evaluation.accessibility.map((item) => (
              <li key={item.name}>
                {item.name}: {item.passed ? 'passed' : 'failed'}. {item.detail}
              </li>
            ))}
            <li>
              Sentence length: standard {evaluation.readability.standardWordsPerSentence} words per sentence, Easy Read{' '}
              {evaluation.readability.easyReadWordsPerSentence}. {evaluation.readability.note}
            </li>
            <li>{evaluation.answerNote}</li>
            <li>{evaluation.outcomeNote}</li>
          </ul>
          <button
            type="button"
            className="btn-primary"
            disabled={busy}
            onClick={() => onOpen(draft.trim(), sampleId)}
          >
            Open this explanation
          </button>
        </>
      )}
      <h3>Subject solvers</h3>
      <ul className="measure-list">
        {SUBJECT_STRATEGIES.map((strategy) => (
          <li key={strategy.subject}>
            <span className={`status-pill ${strategy.specialized ? '' : 'status-planned'}`}>
              {strategy.specialized ? 'Specialized' : 'No specialized strategy'}
            </span>{' '}
            {strategy.label}. {strategy.scope}
          </li>
        ))}
      </ul>
    </section>
  );
};
