import React, { useState } from 'react';
import { EducationalFigure } from '../cloudinary/EducationalFigure';
import {
  BiologyLesson,
  LearningModeId,
  LearningPreferences,
  LearningUnitInput,
  ModeAvailability,
  SdgConnection,
  SavedTextLesson,
  TeachForwardDraft,
  SDG_4_NOTE,
  buildTextSnapshot,
  hydrateThemeSelection,
  normalizeLearningPreferences
} from '@conceptlens/shared';

export function unitFromLesson(lesson: BiologyLesson): LearningUnitInput {
  return {
    id: lesson.id,
    title: lesson.title,
    subject: 'Biology',
    topic: lesson.category,
    objective: lesson.subtitle,
    description: lesson.description,
    has3D: lesson.has3D,
    hasVisual: lesson.components.length > 0,
    components: lesson.components.map((component) => ({
      id: component.id,
      name: component.name,
      simpleExplanation: component.simpleExplanation,
      functionText: component.function
    })),
    guidedSteps: lesson.guidedSteps.map((step) => ({
      stepNumber: step.stepNumber,
      componentId: step.componentId,
      title: step.title,
      summary: step.summary
    })),
    questions: lesson.practiceQuestions.map((question) => ({
      id: question.id,
      options: question.options,
      correctOptionIndex: question.correctOptionIndex,
      explanation: question.explanation,
      diagramComponentId: question.diagramComponentId
    }))
  };
}

const PREF_KEY = 'conceptlens-learning-prefs';
const PROGRESS_KEY = 'conceptlens-learning-progress';
const DRAFT_KEY = 'conceptlens-teach-forward';
const OFFLINE_KEY = 'conceptlens-text-snapshots';

function readPreferenceRecord(): Record<string, unknown> {
  try {
    const raw = localStorage.getItem(PREF_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export function readLearningPrefs(): { mode?: LearningModeId; lowData?: boolean } {
  const parsed = readPreferenceRecord();
  const mode = parsed.mode;
  const known: LearningModeId[] = ['visual', 'simple', 'steps', 'listen', 'low-data', 'accessible'];
  return {
    mode: known.includes(mode as LearningModeId) ? (mode as LearningModeId) : undefined,
    lowData: parsed.lowData === true
  };
}

export function readDisplayPreferences(): { prefs: LearningPreferences; savedByLearner: boolean } {
  const parsed = readPreferenceRecord();
  const hadActiveThemes = Array.isArray(parsed.activeThemes);
  const savedByLearner = Object.keys(parsed).some((key) => key !== 'mode' && key !== 'lowData');
  const prefs = normalizeLearningPreferences({ ...parsed, lowData: parsed.lowData === true });
  return {
    prefs: hydrateThemeSelection(prefs, hadActiveThemes),
    savedByLearner
  };
}

export function writeLearningPrefs(mode: LearningModeId, lowData: boolean) {
  try {
    const current = readPreferenceRecord();
    localStorage.setItem(PREF_KEY, JSON.stringify({ ...current, mode, lowData }));
  } catch {
    /* Storage can be unavailable. The lesson still runs for this visit. */
  }
}

export function writeDisplayPreferences(prefs: LearningPreferences) {
  try {
    const current = readPreferenceRecord();
    const mode = current.mode;
    localStorage.setItem(PREF_KEY, JSON.stringify({ ...current, ...prefs, mode }));
  } catch {
    /* Storage can be unavailable. The lesson still runs for this visit. */
  }
}

export function readProgress(conceptId: string): string | null {
  try {
    return localStorage.getItem(`${PROGRESS_KEY}:${conceptId}`);
  } catch {
    return null;
  }
}

export function writeProgress(conceptId: string, value: unknown) {
  try {
    localStorage.setItem(`${PROGRESS_KEY}:${conceptId}`, JSON.stringify(value));
  } catch {
    /* Storage can be unavailable. The lesson still runs for this visit. */
  }
}

export function clearProgress(conceptId: string) {
  try {
    localStorage.removeItem(`${PROGRESS_KEY}:${conceptId}`);
  } catch {
    /* Storage can be unavailable. */
  }
}

const EVIDENCE_KEY = 'conceptlens-learning-evidence';

const evidenceListeners = new Set<() => void>();

export function subscribeEvidence(listener: () => void) {
  evidenceListeners.add(listener);
  return () => {
    evidenceListeners.delete(listener);
  };
}

function notifyEvidence() {
  evidenceListeners.forEach((listener) => listener());
}

export function readEvidenceRaw(): string | null {
  try {
    return localStorage.getItem(EVIDENCE_KEY);
  } catch {
    return null;
  }
}

export function writeEvidenceRaw(value: string) {
  try {
    if (localStorage.getItem(EVIDENCE_KEY) === value) return;
    localStorage.setItem(EVIDENCE_KEY, value);
    notifyEvidence();
  } catch {
    /* Learning suggestions still work for this visit. */
  }
}

export function clearEvidenceRaw() {
  try {
    localStorage.removeItem(EVIDENCE_KEY);
  } catch {
    /* Storage can be unavailable. */
  }
  notifyEvidence();
}

interface PathBarProps {
  modes: ModeAvailability[];
  active: LearningModeId;
  notice: string | null;
  onChange: (mode: LearningModeId) => void;
}

export const LearningPathBar: React.FC<PathBarProps> = ({ modes, active, notice, onChange }) => {
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const order = modes.map((mode) => mode.id);
    const index = order.indexOf(active);
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    for (let step = 1; step <= order.length; step += 1) {
      const next = modes[(index + direction * step + order.length) % order.length];
      if (next.available) {
        onChange(next.id);
        return;
      }
    }
  };

  return (
    <section className="path-switcher glass-panel" aria-labelledby="path-heading">
      <div className="path-switcher-copy">
        <p id="path-heading" className="path-kicker">One concept. Different ways to understand it.</p>
        <p>The science stays the same. These choices change how it is shown. The selected structure and your answers stay.</p>
      </div>
      <div role="radiogroup" aria-label="Learning mode" className="path-options" onKeyDown={onKeyDown}>
        {modes.map((mode) => (
          <button
            key={mode.id}
            type="button"
            role="radio"
            aria-checked={active === mode.id}
            aria-disabled={!mode.available}
            title={mode.reason}
            className={`path-option ${active === mode.id ? 'is-active' : ''}`}
            onClick={() => onChange(mode.id)}
          >
            <span>{mode.label}</span>
            {!mode.available && <span className="path-option-note">Unavailable</span>}
          </button>
        ))}
      </div>
      <p className="path-sdg-note">
        SDG {SDG_4_NOTE.sdg}, {SDG_4_NOTE.title}. {SDG_4_NOTE.text}{' '}
        <a href={SDG_4_NOTE.sourceUrl} target="_blank" rel="noreferrer">{SDG_4_NOTE.sourceTitle}</a>
      </p>
      {notice && <p className="path-notice" role="status">{notice}</p>}
    </section>
  );
};

export const SimplePath: React.FC<{
  unit: LearningUnitInput;
  componentName: string;
  simple: string;
  detail: string;
  scientific: string;
}> = ({ unit, componentName, simple, detail, scientific }) => (
  <article className="path-reading">
    <p className="path-kicker">Read and understand</p>
    <h3>{unit.objective}</h3>
    <p>{unit.description}</p>
    <h4>{componentName}</h4>
    <h5>Plain language</h5>
    <p>{simple}</p>
    <h5>What it does</h5>
    <p>{detail}</p>
    <h5>Scientific explanation</h5>
    <p>{scientific}</p>
  </article>
);

export const TextFirstPath: React.FC<{
  title: string;
  objective: string;
  description: string;
  selectedId: string;
  parts: { id: string; name: string; simple: string; scientific: string; role: string }[];
  onSelect: (id: string) => void;
}> = ({ title, objective, description, selectedId, parts, onSelect }) => (
  <article className="path-reading">
    <p className="path-kicker">Text first</p>
    <h3>{title}</h3>
    <p>{objective}</p>
    <p>{description}</p>
    <p>This view does not start a 3D scene. The same structure names are in the list beside it.</p>
    <ol className="path-steps">
      {parts.map((part) => {
        const current = part.id === selectedId;
        return (
          <li key={part.id} className={current ? 'is-current' : ''}>
            <button type="button" onClick={() => onSelect(part.id)} aria-current={current ? 'true' : undefined}>
              <span className="path-step-index">{current ? 'Selected' : 'Structure'}</span>
              <span>{part.name}</span>
            </button>
            {current && (
              <>
                <p>{part.simple}</p>
                <p>{part.role}</p>
                <p>{part.scientific}</p>
              </>
            )}
          </li>
        );
      })}
    </ol>
  </article>
);

export const StepPath: React.FC<{
  steps: LearningUnitInput['guidedSteps'];
  index: number;
  completed: number[];
  onPick: (index: number) => void;
  onComplete: (index: number) => void;
}> = ({ steps, index, completed, onPick, onComplete }) => (
  <div className="path-reading">
    <ol className="path-steps">
      {steps.map((step, stepIndex) => {
        const done = completed.includes(stepIndex);
        const current = stepIndex === index;
        return (
          <li key={step.stepNumber} className={current ? 'is-current' : ''}>
            <button type="button" onClick={() => onPick(stepIndex)} aria-current={current ? 'step' : undefined}>
              <span className="path-step-index">{done ? 'Done' : `Stage ${step.stepNumber}`}</span>
              <span>{step.title}</span>
            </button>
            {current && <p>{step.summary}</p>}
          </li>
        );
      })}
    </ol>
    <button type="button" className="btn-secondary" onClick={() => onComplete(index)}>
      {completed.includes(index) ? 'Stage marked done' : 'Mark this stage done'}
    </button>
  </div>
);

export const AccessiblePath: React.FC<{ name: string; text: string; detail: string }> = ({ name, text, detail }) => (
  <article className="path-reading">
    <p className="path-kicker">Selected structure</p>
    <h3>{name}</h3>
    <p>{text}</p>
    <h4>Function, in words</h4>
    <p>{detail}</p>
    <p className="path-option-note">Selection is also shown with the word Selected in the structure list, not only with color.</p>
  </article>
);

export const LowDataPath: React.FC<{
  unit: LearningUnitInput;
  componentName: string;
  simple: string;
  imageUrl: string | null;
  conceptId?: string;
}> = ({ unit, componentName, simple, conceptId }) => {
  return (
    <article className="path-reading">
      <p className="path-kicker">Low data</p>
      <h3>{unit.title}</h3>
      <p>This is the written lesson. Optional pictures and 3D scenes stay unloaded until you ask. Text that is already on this page is not the same as a file saved for offline use.</p>
      <h4>{componentName}</h4>
      <p>{simple}</p>
      {conceptId ? (
        <EducationalFigure conceptId={conceptId} lowData deferUntilRequested />
      ) : (
        <p>No labeled diagram is stored for this lesson.</p>
      )}
    </article>
  );
};

export const SdgPanel: React.FC<{ connection: SdgConnection | null }> = ({ connection }) => {
  if (!connection) {
    return (
      <section className="path-reading" aria-label="Sustainable Development Goal">
        <h4>No SDG connection curated</h4>
        <p>This lesson does not yet have a checked link to a Sustainable Development Goal. One was not invented for it.</p>
      </section>
    );
  }
  return (
    <section className="path-reading" aria-label={`SDG ${connection.sdg}`}>
      <p className="path-kicker">SDG {connection.sdg}</p>
      <h4>{connection.title}</h4>
      <p>{connection.target}</p>
      <p>{connection.why}</p>
      <p><strong>In the world: </strong>{connection.application}</p>
      <p><strong>Question: </strong>{connection.followUp}</p>
      <p className="path-option-note">Lesson basis: {connection.lessonBasis}</p>
      <a href={connection.sourceUrl} target="_blank" rel="noreferrer">{connection.sourceTitle}</a>
    </section>
  );
};

export const TeachForward: React.FC<{ conceptId: string; conceptTitle: string }> = ({ conceptId, conceptTitle }) => {
  const [open, setOpen] = useState(false);
  const [sentence, setSentence] = useState('');
  const [steps, setSteps] = useState(['', '', '']);
  const [misconception, setMisconception] = useState('');
  const [question, setQuestion] = useState('');
  const [preview, setPreview] = useState<TeachForwardDraft | null>(null);
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    const draft: TeachForwardDraft = {
      conceptId,
      sentence: sentence.trim(),
      steps: steps.map((step) => step.trim()),
      misconception: misconception.trim(),
      question: question.trim(),
      savedAt: new Date().toISOString(),
      status: 'unpublished-draft'
    };
    if (!draft.sentence) {
      setError('Add one sentence before saving the draft.');
      return;
    }
    try {
      localStorage.setItem(`${DRAFT_KEY}:${conceptId}`, JSON.stringify(draft));
      setPreview(draft);
      setError(null);
    } catch {
      setError('This browser could not store the draft.');
    }
  };

  return (
    <section className="path-reading">
      <button type="button" className="btn-secondary" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        Teach it forward
      </button>
      {open && (
        <form onSubmit={(event) => { event.preventDefault(); save(); }}>
          <p>Unpublished draft about {conceptTitle}. This is not added to the verified lesson.</p>
          <label>The concept in one sentence
            <textarea value={sentence} onChange={(event) => setSentence(event.target.value)} rows={2} />
          </label>
          {steps.map((step, index) => (
            <label key={index}>Key step {index + 1}
              <input value={step} onChange={(event) => {
                const next = [...steps];
                next[index] = event.target.value;
                setSteps(next);
              }} />
            </label>
          ))}
          <label>One mix-up to watch for
            <input value={misconception} onChange={(event) => setMisconception(event.target.value)} />
          </label>
          <label>One practice question
            <input value={question} onChange={(event) => setQuestion(event.target.value)} />
          </label>
          <button type="submit" className="btn-primary">Save draft on this browser</button>
          {error && <p role="alert">{error}</p>}
          {preview && (
            <div>
              <p className="path-kicker">Preview · unpublished draft · {preview.savedAt}</p>
              <p>{preview.sentence}</p>
              <ol>{preview.steps.filter(Boolean).map((step) => <li key={step}>{step}</li>)}</ol>
            </div>
          )}
        </form>
      )}
    </section>
  );
};

export function saveTextSnapshot(lesson: LearningUnitInput): { ok: true; snapshot: SavedTextLesson } | { ok: false; error: string } {
  const snapshot = buildTextSnapshot(lesson, new Date().toISOString());
  try {
    const existing = JSON.parse(localStorage.getItem(OFFLINE_KEY) || '{}') as Record<string, SavedTextLesson>;
    existing[lesson.id] = snapshot;
    localStorage.setItem(OFFLINE_KEY, JSON.stringify(existing));
    return { ok: true, snapshot };
  } catch {
    return { ok: false, error: 'This browser refused to store the text lesson.' };
  }
}

export function savedSnapshots(): SavedTextLesson[] {
  try {
    const existing = JSON.parse(localStorage.getItem(OFFLINE_KEY) || '{}') as Record<string, SavedTextLesson>;
    return Object.values(existing);
  } catch {
    return [];
  }
}

export const OfflineText: React.FC<{ unit: LearningUnitInput }> = ({ unit }) => {
  const [message, setMessage] = useState<string | null>(null);
  const [saved, setSaved] = useState<SavedTextLesson[]>(() => savedSnapshots());
  return (
    <section className="path-reading">
      <h4>Text saved on this browser</h4>
      <p>This stores the written lesson only. It does not make the whole app work offline, and it does not store upload credentials.</p>
      <button
        type="button"
        className="btn-secondary"
        onClick={() => {
          const result = saveTextSnapshot(unit);
          if (!result.ok) {
            setMessage(result.error);
            return;
          }
          setSaved(savedSnapshots());
          setMessage(`Saved ${result.snapshot.title} at ${result.snapshot.savedAt}.`);
        }}
      >
        Save this text lesson
      </button>
      {message && <p role="status">{message}</p>}
      {saved.length === 0 && <p>No text lesson is saved yet.</p>}
      <ul>
        {saved.map((item) => (
          <li key={item.conceptId}>{item.title} · saved {item.savedAt}</li>
        ))}
      </ul>
    </section>
  );
};
