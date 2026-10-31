import React, { useEffect, useId, useRef, useState } from 'react';
import type {
  BiologyTopicId,
  ContentTypeId,
  LearningPreferences,
  MaterialAction,
  MaterialEvidence,
  MaterialExplanation,
  MaterialSourceKind,
  StrategyWeights,
  SubjectId,
  WorkspacePanel
} from '@conceptlens/shared';
import {
  SAMPLE_MATERIALS,
  clearMaterialEvidence,
  defaultStrategyWeights,
  emptyMaterialEvidence,
  learningThemeById,
  normalizeMaterialEvidence,
  toggleLearningTheme,
  preferredStrategy,
  presentMaterial,
  recommendMaterial,
  validateMaterialFile
} from '@conceptlens/shared';
import { LearningWorkspace, type AnswerState } from './learn/LearningWorkspace';
import { GuidedDemo } from './learn/GuidedDemo';
import { clearEvidenceRaw, clearProgress, readProgress } from './biology/LearningPaths';
import { HomeNarrative } from './home/HomeNarrative';

interface LandingPageProps {
  preferences: LearningPreferences;
  onPreferences: (next: LearningPreferences) => void;
  onOpenAccessibility: () => void;
  onExploreTopic: (topicId: BiologyTopicId) => void;
  onAnnounce: (message: string) => void;
  onSpeechRate?: (rate: 0.8 | 1 | 1.25) => void;
}

interface StoredSession {
  text: string;
  sourceKind: MaterialSourceKind;
  sampleId: string | null;
  subjectOverride: SubjectId | null;
  contentTypeOverride: ContentTypeId | null;
  stepIndex: number;
  evidence: MaterialEvidence;
  weights: StrategyWeights;
  fileLabel: string | null;
}

const SOURCE_KINDS: MaterialSourceKind[] = ['learner_text', 'pdf_text_layer', 'sample', 'image_ocr', 'scanned_pdf'];
const SESSION_KEY = 'conceptlens-material-session';
const BIOLOGY_TOPICS: BiologyTopicId[] = ['human_cell', 'human_heart', 'dna_helix', 'neuron', 'plant_cell'];

const BIOLOGY_LABELS: Record<BiologyTopicId, string> = {
  human_cell: 'Human cell',
  human_heart: 'Human heart',
  dna_helix: 'DNA helix',
  neuron: 'Neuron',
  plant_cell: 'Plant cell'
};

function readWeights(value: unknown): StrategyWeights {
  const fallback = defaultStrategyWeights();
  if (!value || typeof value !== 'object') return fallback;
  const row = value as Record<string, unknown>;
  const keys = ['plain', 'steps', 'example', 'challenge'] as const;
  if (!keys.every((key) => typeof row[key] === 'number' && Number.isFinite(row[key] as number))) return fallback;
  return {
    plain: row.plain as number,
    steps: row.steps as number,
    example: row.example as number,
    challenge: row.challenge as number
  };
}
function readSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed.text !== 'string' || parsed.text.trim().length === 0) return null;
    const sourceKind = parsed.sourceKind;
    if (typeof sourceKind !== 'string' || !SOURCE_KINDS.includes(sourceKind as MaterialSourceKind)) return null;
    return {
      text: parsed.text,
      sourceKind: sourceKind as MaterialSourceKind,
      sampleId: typeof parsed.sampleId === 'string' ? parsed.sampleId : null,
      subjectOverride: typeof parsed.subjectOverride === 'string' ? (parsed.subjectOverride as SubjectId) : null,
      contentTypeOverride: typeof parsed.contentTypeOverride === 'string' ? (parsed.contentTypeOverride as ContentTypeId) : null,
      stepIndex: typeof parsed.stepIndex === 'number' ? parsed.stepIndex : 0,
      evidence: normalizeMaterialEvidence(parsed.evidence),
      weights: readWeights(parsed.weights),
      fileLabel: typeof parsed.fileLabel === 'string' ? parsed.fileLabel : null
    };
  } catch {
    return null;
  }
}

function writeSession(session: StoredSession | null) {
  try {
    if (!session) localStorage.removeItem(SESSION_KEY);
    else localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    /* The lesson still works for this visit when storage is blocked. */
  }
}

async function postJson<T>(url: string, body: unknown, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal
  });
  const json = (await response.json()) as T & { error?: string; processed?: boolean };
  if (!response.ok) {
    throw new Error(json.error || 'The request was not completed.');
  }
  return json;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  preferences,
  onPreferences,
  onOpenAccessibility,
  onExploreTopic,
  onAnnounce,
  onSpeechRate
}) => {
  const fileId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const pasteRef = useRef<HTMLTextAreaElement>(null);
  const [composer, setComposer] = useState<'none' | 'paste' | 'question'>('none');
  const [draft, setDraft] = useState('');
  const [status, setStatus] = useState('Ready for a question, pasted notes, a PDF with a text layer, or a labeled sample.');
  const [busy, setBusy] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileLabel, setFileLabel] = useState<string | null>(null);
  const [pendingText, setPendingText] = useState('');
  const [pendingNote, setPendingNote] = useState('');
  const [pendingKind, setPendingKind] = useState<MaterialSourceKind | null>(null);
  const [pageReading, setPageReading] = useState<'checking' | 'ready' | 'planned'>('checking');
  const [pendingSample, setPendingSample] = useState<string | null>(null);
  const [pendingDemo, setPendingDemo] = useState(false);
  const [explanation, setExplanation] = useState<MaterialExplanation | null>(null);
  const [recognizedText, setRecognizedText] = useState('');
  const [stepIndex, setStepIndex] = useState(0);
  const [evidence, setEvidence] = useState<MaterialEvidence>(emptyMaterialEvidence());
  const [weights, setWeights] = useState<StrategyWeights>(defaultStrategyWeights());
  const [representation, setRepresentation] = useState<'match' | 'plain' | 'standard'>('match');
  const [answerState, setAnswerState] = useState<AnswerState | null>(null);
  const [clearOpen, setClearOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<WorkspacePanel>('explanation');
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    let cancel = false;
    fetch('/api/materials/engine')
      .then((response) => response.json())
      .then((json: { data?: { ocr?: string } }) => {
        if (!cancel) setPageReading(json.data?.ocr === 'local-tesseract' ? 'ready' : 'planned');
      })
      .catch(() => {
        if (!cancel) setPageReading('planned');
      });
    return () => {
      cancel = true;
    };
  }, []);

  const themeNames = preferences.activeThemes.map((id) => learningThemeById(id).title);
  if (preferences.highContrast) themeNames.push('High contrast');
  const preferenceSummary = themeNames.length > 0 ? themeNames.join(', ') : 'Standard lesson';
  const weightNote = preferredStrategy(weights, ['plain', 'steps', 'example']);

  const viewPreferences: LearningPreferences =
    representation === 'plain'
      ? { ...preferences, easyRead: true }
      : representation === 'standard'
        ? { ...preferences, easyRead: false, supportedLearning: false }
        : preferences;

  const presented = explanation ? presentMaterial(explanation, viewPreferences, evidence, stepIndex) : null;
  const recommendation = explanation
    ? recommendMaterial({
        evidence,
        conceptId: explanation.practice[0]?.conceptId ?? explanation.subject,
        conceptName: explanation.mainConcept,
        hasPlain: Boolean(explanation.plainLanguage),
        plainActive: Boolean(presented?.showingPlain),
        hasSteps: explanation.steps.length > 1,
        allowSpeech: !preferences.speechFree,
        hasChallenge: explanation.practice.some((question) => question.challenge),
        hasNextStep: stepIndex < explanation.steps.length - 1
      })
    : null;

  const remember = (session: StoredSession) => {
    writeSession({ ...session, fileLabel: session.fileLabel ?? fileLabel });
  };

  const cancelWork = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setBusy(false);
    setStatus('Processing cancelled. Nothing new was applied.');
    onAnnounce('Processing cancelled.');
  };

  const explainText = async (session: StoredSession) => {
    const controller = new AbortController();
    abortRef.current = controller;
    setBusy(true);
    setStatus('Building an explanation from the accepted text.');
    try {
      const json = await postJson<{ success: boolean; processed: boolean; data: MaterialExplanation }>('/api/materials/explain', {
        text: session.text,
        sourceKind: session.sourceKind,
        sampleId: session.sampleId,
        subjectOverride: session.subjectOverride,
        contentTypeOverride: session.contentTypeOverride
      }, controller.signal);
      if (!json.processed || !json.data) {
        setStatus('No explanation was returned.');
        return;
      }
      setExplanation(json.data);
      setRecognizedText(json.data.sourceContent);
      setPendingKind(null);
      setStepIndex(session.stepIndex);
      setEvidence(session.evidence);
      setWeights(session.weights);
      setRepresentation('match');
      setAnswerState(null);
      setActivePanel('explanation');
      remember({ ...session, text: json.data.sourceContent });
      setStatus(json.data.demo ? 'Sample explanation ready. This is curated content.' : 'Explanation ready from the accepted text.');
      onAnnounce(json.data.demo ? 'Sample explanation ready.' : 'Explanation ready.');
      requestAnimationFrame(() => document.getElementById('material-explanation')?.focus());
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      setStatus((error as Error).message || 'The request did not reach the server. Nothing was processed.');
    } finally {
      setBusy(false);
    }
  };

  const stageText = async (kind: 'text' | 'question' | 'sample', value: string, sampleId?: string) => {
    const controller = new AbortController();
    abortRef.current = controller;
    setBusy(true);
    setStatus(kind === 'sample' ? 'Loading the curated sample.' : 'Checking the text.');
    try {
      const json = await postJson<{
        success: boolean;
        processed: boolean;
        data: { text: string; note: string; demo: boolean; extractionStatus: string; sampleId: string | null } | null;
      }>('/api/materials/ingest', kind === 'sample' ? { kind, sampleId } : { kind, text: value }, controller.signal);
      if (!json.processed || !json.data?.text) {
        setStatus('The text was not accepted.');
        return;
      }
      setPendingText(json.data.text);
      setPendingNote(json.data.note);
      setPendingKind(kind === 'sample' ? 'sample' : 'learner_text');
      setPendingSample(json.data.sampleId);
      setPendingDemo(json.data.demo);
      setExplanation(null);
      setStatus('Check the text, then explain it. Nothing is explained until you confirm.');
      onAnnounce('Text ready to confirm.');
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      setStatus((error as Error).message || 'The request did not reach the server. Nothing was processed.');
    } finally {
      setBusy(false);
    }
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const validation = validateMaterialFile(bytes, file.type);
    if (!validation.ok) {
      setStatus(validation.error || 'The file was not accepted.');
      onAnnounce('The file was not accepted.');
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const nextPreview = validation.format === 'jpeg' || validation.format === 'png' || validation.format === 'webp' ? URL.createObjectURL(file) : null;
    setPreviewUrl(nextPreview);
    setFileLabel(`${file.name}, ${Math.ceil(file.size / 1024)} KB, detected as ${validation.detectedMime}.`);
    const controller = new AbortController();
    abortRef.current = controller;
    setBusy(true);
    setStatus('Checking the file on the server.');
    let binary = '';
    const chunk = 0x8000;
    for (let index = 0; index < bytes.length; index += chunk) {
      binary += String.fromCharCode(...bytes.subarray(index, index + chunk));
    }
    try {
      const json = await postJson<{
        success: boolean;
        processed: boolean;
        data: { text: string; note: string; extractionStatus: string; demo: boolean; readingOrigin?: MaterialSourceKind | null } | null;
      }>('/api/materials/ingest', {
        kind: 'file',
        fileBase64: btoa(binary),
        fileName: file.name,
        declaredMime: file.type
      }, controller.signal);
      const origin = json.data?.readingOrigin;
      const kind: MaterialSourceKind =
        origin === 'image_ocr' || origin === 'scanned_pdf'
          ? origin
          : json.processed && validation.format === 'pdf'
            ? 'pdf_text_layer'
            : 'learner_text';
      setPendingText(json.data?.text ?? '');
      setPendingNote(json.data?.note ?? 'The file was not read.');
      setPendingKind(kind);
      setPendingSample(null);
      setPendingDemo(false);
      setExplanation(null);
      setStatus(json.processed ? 'Text was found. Confirm it before the explanation.' : json.data?.note || 'The file was not interpreted.');
      onAnnounce(json.processed ? 'Extracted text is ready to confirm.' : 'The file was not interpreted.');
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      setStatus((error as Error).message || 'The request did not reach the server. Nothing was processed.');
    } finally {
      setBusy(false);
    }
  };

  const confirm = () => {
    if (!pendingKind || pendingText.trim().length === 0) {
      setStatus('Add the text you want explained. An empty file is not treated as finished.');
      return;
    }
    const sourceKind: MaterialSourceKind =
      pendingKind === 'pdf_text_layer' || pendingKind === 'sample' || pendingKind === 'image_ocr' || pendingKind === 'scanned_pdf'
        ? pendingKind
        : 'learner_text';
    void explainText({
      text: pendingText,
      sourceKind,
      sampleId: pendingSample,
      subjectOverride: null,
      contentTypeOverride: null,
      stepIndex: 0,
      evidence,
      weights,
      fileLabel
    });
  };

  const onAction = (action: MaterialAction) => {
    if (!explanation || !presented) return;
    if (action === 'make_simpler') setRepresentation('plain');
    if (action === 'explain_differently') setRepresentation((current) => (current === 'plain' ? 'standard' : 'plain'));
    if (action === 'show_steps' || action === 'repeat_step') {
      setActivePanel('steps');
      const step = explanation.steps[Math.min(stepIndex, explanation.steps.length - 1)];
      if (step) onAnnounce(`${step.title}. ${step.detail}`);
      document.getElementById('material-steps')?.focus();
    }
    if (action === 'show_diagram') {
      setActivePanel('explanation');
      document.getElementById('material-explanation')?.scrollIntoView({ behavior: preferences.reducedMotion ? 'auto' : 'smooth' });
    }
    if (action === 'practice') {
      setActivePanel('practice');
      document.getElementById('material-practice')?.focus();
    }
    if (action === 'review_mistake') {
      setActivePanel('practice');
      onAnnounce(answerState?.explanation || 'Review the stored answer explanation.');
    }
    if (action === 'continue') {
      if (stepIndex < explanation.steps.length - 1) {
        const next = stepIndex + 1;
        setStepIndex(next);
        remember({
          text: explanation.sourceContent,
          sourceKind: explanation.sourceKind,
          sampleId: explanation.sampleId,
          subjectOverride: explanation.learnerCorrectedSubject ? explanation.subject : null,
          contentTypeOverride: explanation.learnerCorrectedSubject ? explanation.contentType : null,
          stepIndex: next,
          evidence,
          weights,
          fileLabel
        });
        onAnnounce(explanation.steps[next]?.title || 'Next step.');
      } else if (explanation.linkedLessonId) {
        onExploreTopic(explanation.linkedLessonId as BiologyTopicId);
      }
    }
  };

  const onAnswer = async (questionId: string, index: number) => {
    if (!explanation) return;
    setBusy(true);
    try {
      const json = await postJson<{
        data: { correct: boolean; explanation: string; why: string; weights: StrategyWeights; conceptId: string };
      }>('/api/materials/answer', {
        text: explanation.sourceContent,
        sourceKind: explanation.sourceKind,
        sampleId: explanation.sampleId,
        subjectOverride: explanation.learnerCorrectedSubject ? explanation.subject : null,
        contentTypeOverride: explanation.learnerCorrectedSubject ? explanation.contentType : null,
        questionId,
        selectedIndex: index,
        weights
      });
      const nextEvidence = {
        ...evidence,
        concepts: evidence.concepts.includes(json.data.conceptId) ? evidence.concepts : [...evidence.concepts, json.data.conceptId],
        attempts: [...evidence.attempts, { questionId, conceptId: json.data.conceptId, subject: explanation.subject, correct: json.data.correct }]
      };
      const normalized = normalizeMaterialEvidence(nextEvidence);
      setEvidence(normalized);
      setWeights(json.data.weights);
      setAnswerState({ questionId, correct: json.data.correct, explanation: json.data.explanation, why: json.data.why });
      remember({
        text: explanation.sourceContent,
        sourceKind: explanation.sourceKind,
        sampleId: explanation.sampleId,
        subjectOverride: explanation.learnerCorrectedSubject ? explanation.subject : null,
        contentTypeOverride: explanation.learnerCorrectedSubject ? explanation.contentType : null,
        stepIndex,
        evidence: normalized,
        weights: json.data.weights,
        fileLabel
      });
      const nextRecommendation = recommendMaterial({
        evidence: normalized,
        conceptId: json.data.conceptId,
        conceptName: explanation.mainConcept,
        hasPlain: Boolean(explanation.plainLanguage),
        plainActive: Boolean(presented?.showingPlain),
        hasSteps: explanation.steps.length > 1,
        allowSpeech: !preferences.speechFree,
        hasChallenge: explanation.practice.some((question) => question.challenge),
        hasNextStep: stepIndex < explanation.steps.length - 1
      });
      setActivePanel('progress');
      onAnnounce(
        `${json.data.correct ? 'Correct.' : 'Not the stored answer.'} ${nextRecommendation.title}. ${nextRecommendation.why}`
      );
      requestAnimationFrame(() => document.getElementById('material-progress')?.focus());
    } catch (error) {
      setStatus((error as Error).message || 'The answer was not saved.');
    } finally {
      setBusy(false);
    }
  };

  const focusSection = (id: string) => {
    const node = document.getElementById(id);
    if (!node) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      || document.body.classList.contains('reduced-motion')
      || document.body.classList.contains('low-stimulation');
    node.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
    node.focus({ preventScroll: true });
    onAnnounce(
      id === 'guided-demo'
        ? 'Start learning. The guided demo is ready.'
        : id === 'start-learning'
          ? 'Start learning. Add text, a PDF text layer, or a labeled sample.'
          : 'Section ready.'
    );
  };

  const continueLearning = () => {
    const saved = readSession();
    if (saved) {
      void explainText(saved);
      return;
    }
    const topic = BIOLOGY_TOPICS.find((id) => readProgress(id));
    if (topic) {
      onExploreTopic(topic);
      return;
    }
    setStatus('There is no saved material yet. Paste text or open a sample.');
    onAnnounce('No saved lesson yet.');
  };

  const clearSaved = async () => {
    writeSession(null);
    setEvidence(clearMaterialEvidence());
    setWeights(defaultStrategyWeights());
    setExplanation(null);
    setAnswerState(null);
    setClearOpen(false);
    BIOLOGY_TOPICS.forEach((topic) => clearProgress(topic));
    clearEvidenceRaw();
    try {
      await fetch('/api/materials/progress', { method: 'DELETE' });
    } catch {
      /* Local data is already cleared. The Python file remains if the server is offline. */
    }
    setStatus('Saved lesson data for this browser was cleared.');
    onAnnounce('Saved lesson data cleared.');
  };

  return (
    <div className="learn-home">
      <HomeNarrative
        preferences={preferences}
        onStartLearning={() => focusSection('guided-demo')}
        onOpenAccessibility={onOpenAccessibility}
        onToggleTheme={(id) => {
          const next = toggleLearningTheme(preferences, id);
          onPreferences(next);
          onAnnounce(`${learningThemeById(id).title} ${next.activeThemes.includes(id) ? 'on' : 'off'}.`);
        }}
        pageReading={pageReading}
      />

      <ol className="journey-track" aria-label="Demo journey">
        {(
          [
            ['question', 'Question'],
            ['preferences', 'Preferences'],
            ['explanation', 'Explanation'],
            ['practice', 'Practice'],
            ['recommendation', 'Recommendation']
          ] as const
        ).map(([id, label], index) => {
          const current = answerState
            ? 'recommendation'
            : activePanel === 'practice' && explanation
              ? 'practice'
              : explanation
                ? 'explanation'
                : 'question';
          return (
            <li key={id} aria-current={current === id ? 'step' : undefined}>
              <span className="step-index">{index + 1}</span>
              {label}
            </li>
          );
        })}
      </ol>

      <GuidedDemo
        preferences={preferences}
        onPreferences={onPreferences}
        busy={busy}
        onOpen={(text, sampleId) => {
          void explainText({
            text,
            sourceKind: sampleId ? 'sample' : 'learner_text',
            sampleId,
            subjectOverride: null,
            contentTypeOverride: null,
            stepIndex: 0,
            evidence,
            weights,
            fileLabel
          });
        }}
      />

      <section id="start-learning" className="atelier-panel story-target" tabIndex={-1} aria-labelledby="upload-title">
        <p className="atelier-kicker">Begin</p>
        <h2 id="upload-title">Start learning</h2>
        <p className="atelier-quiet">
          {pageReading === 'ready'
            ? 'Paste notes, type a question, or choose a JPEG, PNG, WebP, or PDF up to 12 MB. The server checks the file bytes. Printed photographs and scanned PDF pages are read locally. Handwriting is often weak. You confirm the reading before it is explained.'
            : pageReading === 'checking'
              ? 'Checking whether photograph reading is available on this server.'
              : 'Paste notes, type a question, or choose a JPEG, PNG, WebP, or PDF up to 12 MB. The server checks the file bytes. A PDF is read when it has a text layer. Photograph and scanned-page reading is not available on this server, so those uploads stay planned. You can type what you see.'}
        </p>
        <div className="atelier-actions">
          <button type="button" className="btn-primary" onClick={() => fileRef.current?.click()}>
            Choose a file
          </button>
          <button type="button" className="btn-secondary" onClick={() => { setComposer('paste'); pasteRef.current?.focus(); }}>
            Paste text
          </button>
          <button type="button" className="btn-secondary" onClick={() => { setComposer('question'); setDraft(''); }}>
            Type a question
          </button>
          <button type="button" className="btn-secondary" onClick={continueLearning}>
            Continue
          </button>
        </div>
        <div className="pref-summary" aria-label="Active learning preferences">
          <span>{preferenceSummary}</span>
          <button type="button" className="atelier-text-link atelier-text-button" onClick={onOpenAccessibility}>
            Change learning preferences
          </button>
        </div>
        <p className="fine-print">
          {weights.plain !== 1 || weights.steps !== 1 || weights.example !== 1
            ? `Saved answers currently give more weight to ${weightNote} explanations. That is a count of answers, not a trained model.`
            : 'Suggestions stay on the written rules until you practice.'}
        </p>
        <label className="sr-only" htmlFor={fileId}>Choose a JPEG, PNG, WebP, or PDF</label>
        <input
          id={fileId}
          className="sr-only"
          ref={fileRef}
          type="file"
          tabIndex={-1}
          aria-hidden="true"
          accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            void onFile(file);
          }}
        />
        {(composer === 'paste' || composer === 'question') && (
          <div className="composer">
            <label htmlFor="learner-draft">{composer === 'question' ? 'Your question' : 'Pasted text'}</label>
            <textarea
              id="learner-draft"
              ref={pasteRef}
              rows={6}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={composer === 'question' ? 'Ask about a concept, an error message, or a passage.' : 'Paste a passage, equation, or notes.'}
            />
            <button
              type="button"
              className="btn-primary"
              disabled={busy || draft.trim().length === 0}
              onClick={() => void stageText(composer === 'question' ? 'question' : 'text', draft)}
            >
              Check this text
            </button>
          </div>
        )}
        <p role="status">{status}</p>
        {busy && (
          <button type="button" className="btn-secondary" onClick={cancelWork}>
            Cancel processing
          </button>
        )}
        {pendingKind && !explanation && (
          <div className="confirm-panel">
            <h3>{pendingDemo ? 'Sample text' : 'Confirm the text'}</h3>
            {previewUrl && <img className="material-preview" src={previewUrl} alt="Preview of the selected image." />}
            {fileLabel && <p>{fileLabel}</p>}
            <p>{pendingNote}</p>
            <label htmlFor="confirm-text">Text to explain</label>
            <textarea id="confirm-text" rows={6} value={pendingText} onChange={(event) => setPendingText(event.target.value)} />
            <div className="workspace-actions">
              <button type="button" className="btn-primary" onClick={confirm} disabled={busy || pendingText.trim().length === 0}>
                Explain this
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setPendingKind(null);
                  setPendingText('');
                  fileRef.current?.focus();
                  setStatus('Ready for another file or another paste.');
                }}
              >
                Retry
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  cancelWork();
                  setPendingKind(null);
                  setPendingText('');
                  if (previewUrl) URL.revokeObjectURL(previewUrl);
                  setPreviewUrl(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>

      <section id="sample-lessons" className="atelier-panel story-target" tabIndex={-1} aria-labelledby="sample-title">
        <p className="atelier-kicker">Samples</p>
        <h2 id="sample-title">Open a curated lesson</h2>
        <p className="atelier-quiet">Choosing one loads its text. It does not read a photograph.</p>
        <div className="quiet-row">
          {SAMPLE_MATERIALS.map((sample) => (
            <button key={sample.id} type="button" className="btn-secondary" onClick={() => void stageText('sample', sample.text, sample.id)}>
              {sample.label}
            </button>
          ))}
        </div>
      </section>

      {explanation && presented && recommendation && (
        <LearningWorkspace
          explanation={explanation}
          presented={presented}
          stepIndex={stepIndex}
          evidence={evidence}
          recommendation={recommendation}
          previewUrl={previewUrl}
          fileLabel={fileLabel}
          lowData={preferences.lowData}
          speechRate={preferences.speechRate}
          recognizedText={recognizedText}
          busy={busy}
          answerState={answerState}
          clearOpen={clearOpen}
          activePanel={activePanel}
          onPanel={setActivePanel}
          onRecognizedText={setRecognizedText}
          onUpdateText={() => {
            if (!explanation) return;
            void explainText({
              text: recognizedText,
              sourceKind: explanation.demo ? 'sample' : explanation.sourceKind,
              sampleId: explanation.sampleId,
              subjectOverride: explanation.learnerCorrectedSubject ? explanation.subject : null,
              contentTypeOverride: null,
              stepIndex,
              evidence,
              weights,
              fileLabel
            });
          }}
          onCorrect={(subject, contentType) => {
            void explainText({
              text: recognizedText || explanation.sourceContent,
              sourceKind: explanation.sourceKind,
              sampleId: explanation.sampleId,
              subjectOverride: subject,
              contentTypeOverride: contentType,
              stepIndex,
              evidence,
              weights,
              fileLabel
            });
          }}
          onAction={onAction}
          onStep={(index) => {
            setStepIndex(index);
            const step = explanation.steps[index];
            if (step) onAnnounce(`${step.title}. ${step.detail}`);
          }}
          onAnswer={(questionId, index) => void onAnswer(questionId, index)}
          onClearRequest={() => setClearOpen(true)}
          onClearConfirm={() => void clearSaved()}
          onClearCancel={() => setClearOpen(false)}
          onClose={() => setExplanation(null)}
          onSpeechRate={(rate) => onSpeechRate?.(rate)}
          onRetryAnswer={() => setAnswerState(null)}
        />
      )}

      <section id="biology-lessons" className="atelier-panel biology-links story-target" tabIndex={-1} aria-labelledby="biology-links-title">
        <p className="atelier-kicker">Biology</p>
        <h2 id="biology-links-title">Five curated lessons</h2>
        <p className="atelier-quiet">The same models and practice, opened as their own lesson.</p>
        <div className="quiet-row">
          {BIOLOGY_TOPICS.map((topic) => (
            <button key={topic} type="button" className="btn-secondary" onClick={() => onExploreTopic(topic)}>
              {BIOLOGY_LABELS[topic]}
            </button>
          ))}
        </div>
      </section>

      <footer className="lens-footer">
        <div>
          <p className="lens-footer-name">ConceptLens</p>
          <p>Learning should adapt to you. One concept, shown in the form you choose.</p>
        </div>
        <nav aria-label="On this page">
          <a href="#guided-demo" onClick={(event) => { event.preventDefault(); focusSection('guided-demo'); }}>Start learning</a>
          <a href="#our-mission" onClick={(event) => { event.preventDefault(); focusSection('our-mission'); }}>Our mission</a>
          <a href="#how-it-works" onClick={(event) => { event.preventDefault(); focusSection('how-it-works'); }}>How it works</a>
          <a href="#learning-preferences" onClick={(event) => { event.preventDefault(); focusSection('learning-preferences'); }}>Preferences</a>
          <a href="#sample-lessons" onClick={(event) => { event.preventDefault(); focusSection('sample-lessons'); }}>Samples</a>
          <a href="#biology-lessons" onClick={(event) => { event.preventDefault(); focusSection('biology-lessons'); }}>Biology lessons</a>
        </nav>
        <p className="lens-note">
          Aims to support Quality Education and Reduced Inequalities. Not a United Nations program, and not endorsed by the United Nations.
        </p>
        <a href="#learn-title" onClick={(event) => { event.preventDefault(); focusSection('learn-title'); }}>Back to top</a>
      </footer>
    </div>
  );
};
