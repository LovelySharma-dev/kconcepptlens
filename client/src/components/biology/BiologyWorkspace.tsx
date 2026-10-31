import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BiologyLesson,
  ContinuityState,
  LearningModeId,
  LearningPreferences,
  clearAnswer,
  initialContinuity,
  misconceptionFor,
  modesForLesson,
  optionFeedback,
  recordAnswer,
  resetProgress,
  sdgForConcept,
  selectStructure,
  switchLearningMode,
  vocabularyFromComponent,
  markStepComplete,
  adaptConceptContent,
  resolveLearningExperience,
  appendLearningEvent,
  clearLessonEvents,
  normalizeEvidence,
  objectivesForLesson,
  progressStage,
  recommendNextStep,
  summarizeLesson,
  type ConceptSource,
  type LearningEvent,
  type LearningRecommendation
} from '@conceptlens/shared';
import {
  LearningPathBar,
  LowDataPath,
  OfflineText,
  SimplePath,
  SdgPanel,
  StepPath,
  TeachForward,
  TextFirstPath,
  clearProgress,
  readEvidenceRaw,
  readLearningPrefs,
  readProgress,
  subscribeEvidence,
  unitFromLesson,
  writeEvidenceRaw,
  writeLearningPrefs,
  writeProgress
} from './LearningPaths';
import { NextStepPanel } from './NextStepPanel';
import { Cell2DCanvas } from './2d/Cell2DCanvas';
import { Heart2DCanvas } from './2d/Heart2DCanvas';
import { Dna2DCanvas } from './2d/Dna2DCanvas';
import { Neuron2DCanvas } from './2d/Neuron2DCanvas';
import { PlantCell2DCanvas } from './2d/PlantCell2DCanvas';
import {
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Search,
  Award,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { EducationalFigure } from '../cloudinary/EducationalFigure';
import { educationalAsset } from '../../data/educationalMedia';
import { SpeechControls } from '../SpeechControls';
import { SimpleStepsLesson } from './SimpleStepsLesson';

const OPTION_MARKERS = ['Circle', 'Square', 'Triangle', 'Diamond'];

interface BiologyWorkspaceProps {
  lesson: BiologyLesson;
  preferences: LearningPreferences;
  onPreferences: (next: LearningPreferences) => void;
  modeRequest?: { mode: LearningModeId; nonce: number } | null;
  onRepresentation?: (mode: LearningModeId) => void;
  onAnnounce?: (msg: string) => void;
  onOpenPractice: () => void;
  onRestartLesson: () => void;
}

export const BiologyWorkspace: React.FC<BiologyWorkspaceProps> = ({
  lesson,
  preferences,
  onPreferences,
  modeRequest,
  onRepresentation,
  onAnnounce,
  onOpenPractice,
  onRestartLesson
}) => {
  const [showLabels, setShowLabels] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [pathNotice, setPathNotice] = useState<string | null>(null);
  const [sceneRequested, setSceneRequested] = useState(false);
  const [paused, setPaused] = useState(false);
  const [guideStage, setGuideStage] = useState(0);
  const [chunkIndex, setChunkIndex] = useState(0);
  const [breakDue, setBreakDue] = useState(false);
  const [showPlain, setShowPlain] = useState(false);
  const [diagramRequest, setDiagramRequest] = useState(0);
  const [evidence, setEvidence] = useState<LearningEvent[]>(() => {
    const raw = readEvidenceRaw();
    if (!raw) return [];
    try {
      return normalizeEvidence(JSON.parse(raw));
    } catch {
      return [];
    }
  });
  const unit = useMemo(() => unitFromLesson(lesson), [lesson]);
  const [continuity, setContinuity] = useState<ContinuityState>(() => initialContinuity(unit, readLearningPrefs()));
  const skipPersist = React.useRef(true);

  useEffect(() => {
    const prefs = readLearningPrefs();
    setSceneRequested(false);
    let next = initialContinuity(unit, prefs);
    const raw = readProgress(lesson.id);
    if (raw) {
      try {
        const saved = JSON.parse(raw) as ContinuityState;
        if (saved.conceptId === lesson.id && saved.answers) next = { ...next, ...saved, conceptId: lesson.id };
      } catch {
        next = initialContinuity(unit, prefs);
      }
    }
    setContinuity(next);
    setPathNotice(null);
    setPaused(false);
    setGuideStage(0);
    setChunkIndex(0);
    setShowPlain(false);
    skipPersist.current = true;
  }, [lesson, unit]);

  useEffect(() => {
    if (!preferences.textFirst && !preferences.lowData && !preferences.simpleSteps) return;
    setSceneRequested(false);
  }, [preferences.textFirst, preferences.lowData, preferences.simpleSteps]);

  useEffect(() => {
    if (skipPersist.current) {
      skipPersist.current = false;
      return;
    }
    if (continuity.conceptId !== lesson.id) return;
    writeLearningPrefs(continuity.mode, preferences.lowData || continuity.lowData);
    writeProgress(lesson.id, continuity);
  }, [continuity, lesson.id, preferences.lowData]);

  useEffect(() => {
    writeEvidenceRaw(JSON.stringify(evidence));
  }, [evidence]);

  useEffect(() => {
    return subscribeEvidence(() => {
      const raw = readEvidenceRaw();
      if (!raw) return;
      try {
        const next = normalizeEvidence(JSON.parse(raw));
        setEvidence((current) => (JSON.stringify(current) === JSON.stringify(next) ? current : next));
      } catch {
        /* Keep the evidence already on screen. */
      }
    });
  }, []);

  const selectedComponentId = continuity.selectedComponentId || lesson.components[0]?.id || '';
  const currentStepIndex = continuity.stepIndex;

  useEffect(() => {
    if (!selectedComponentId) return;
    setEvidence((current) =>
      appendLearningEvent(current, {
        type: 'concept_explored',
        lessonId: lesson.id,
        conceptId: selectedComponentId
      })
    );
  }, [lesson.id, selectedComponentId]);

  // Active Component Data
  const activeComponent = useMemo(() => {
    return lesson.components.find((c) => c.id === selectedComponentId) || lesson.components[0];
  }, [lesson, selectedComponentId]);

  // Filtered Components for Right Panel Search
  const filteredComponents = useMemo(() => {
    if (!searchQuery.trim()) return lesson.components;
    const q = searchQuery.toLowerCase();
    return lesson.components.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.function.toLowerCase().includes(q) ||
        (c.scientificName && c.scientificName.toLowerCase().includes(q))
    );
  }, [lesson, searchQuery]);

  // Component Selection Handler
  const handleSelectComponent = useCallback(
    (id: string) => {
      const result = selectStructure(continuity, unit, id);
      setContinuity(result.state);
      if (result.notice) setPathNotice(result.notice);
      const comp = lesson.components.find((c) => c.id === id);
      if (comp && onAnnounce) {
        onAnnounce(`Selected ${comp.name}: ${comp.simpleExplanation}`);
      }
    },
    [continuity, unit, lesson, onAnnounce]
  );

  const handleNextStep = () => {
    if (currentStepIndex < lesson.guidedSteps.length - 1) {
      const targetComponentId = lesson.guidedSteps[currentStepIndex + 1]?.componentId;
      if (targetComponentId) handleSelectComponent(targetComponentId);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      const targetComponentId = lesson.guidedSteps[currentStepIndex - 1]?.componentId;
      if (targetComponentId) handleSelectComponent(targetComponentId);
    }
  };

  useEffect(() => {
    if (preferences.breakReminderMinutes === 0 || paused) return;
    setBreakDue(false);
    const id = window.setTimeout(() => setBreakDue(true), preferences.breakReminderMinutes * 60 * 1000);
    return () => window.clearTimeout(id);
  }, [preferences.breakReminderMinutes, paused, lesson.id]);

  const changePath = (mode: ContinuityState['mode']) => {
    const result = switchLearningMode(continuity, unit, mode);
    setContinuity(result.state);
    setPathNotice(result.notice);
    if (mode === 'low-data') {
      onPreferences({ ...preferences, lowData: true });
      setSceneRequested(false);
    } else if (mode === 'accessible') {
      onPreferences({ ...preferences, textFirst: true });
      setSceneRequested(false);
    } else if (mode === 'visual') {
      onPreferences({ ...preferences, textFirst: false, lowData: false });
    } else if (mode === 'steps') {
      onPreferences({ ...preferences, simplifiedLayout: true });
    } else if (mode === 'simple') {
      onPreferences({ ...preferences, readSupport: true });
    }
    if (onAnnounce) onAnnounce(result.notice || `Learning path: ${modesForLesson(unit).find((item) => item.id === mode)?.label || mode}`);
  };

  useEffect(() => {
    if (!modeRequest) return;
    changePath(modeRequest.mode);
    // The nonce is the request. changePath reads the latest continuity on that render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modeRequest?.nonce]);

  useEffect(() => {
    onRepresentation?.(continuity.mode);
  }, [continuity.mode, onRepresentation]);

  const structureIndex = lesson.components.findIndex((component) => component.id === selectedComponentId);
  const selectRelative = (delta: number) => {
    const next = lesson.components[structureIndex + delta];
    if (next) handleSelectComponent(next.id);
  };

  const showInteractive = !preferences.simpleSteps || sceneRequested;
  const showDiagram = showInteractive
    && (continuity.mode === 'visual' || preferences.simpleSteps)
    && (!preferences.textFirst || preferences.simpleSteps || sceneRequested)
    && (!(preferences.lowData || continuity.lowData) || sceneRequested);
  const spokenLesson = activeComponent
    ? `${activeComponent.name}. ${activeComponent.simpleExplanation} ${lesson.guidedSteps[currentStepIndex]?.summary || ''}`
    : lesson.description;
  const vocabulary = activeComponent
    ? vocabularyFromComponent({
        name: activeComponent.name,
        scientificName: activeComponent.scientificName,
        simpleExplanation: activeComponent.simpleExplanation,
        functionText: activeComponent.function
      })
    : [];
  const experience = useMemo(() => resolveLearningExperience(preferences), [preferences]);

  useEffect(() => {
    setChunkIndex(0);
  }, [selectedComponentId]);

  const activeQuickQuestion = useMemo(() => {
    return lesson.practiceQuestions.find((q) => q.diagramComponentId === activeComponent?.id) || null;
  }, [lesson, activeComponent]);

  const adapted = useMemo(() => {
    if (!activeComponent) return null;
    const source: ConceptSource = {
      conceptId: lesson.id,
      componentId: activeComponent.id,
      name: activeComponent.name,
      standard: activeComponent.scientificExplanation,
      plain: activeComponent.simpleExplanation,
      everyday: activeComponent.analogy,
      location: activeComponent.location,
      role: activeComponent.function,
      chunks: activeComponent.examFacts,
      steps: lesson.guidedSteps.map((step) => ({
        stepNumber: step.stepNumber,
        componentId: step.componentId,
        title: step.title,
        summary: step.summary
      })),
      question: activeQuickQuestion
        ? {
            prompt: activeQuickQuestion.question,
            options: activeQuickQuestion.options,
            correctOptionIndex: activeQuickQuestion.correctOptionIndex,
            explanation: activeQuickQuestion.explanation
          }
        : null
    };
    return adaptConceptContent(source, experience);
  }, [activeComponent, lesson, experience, activeQuickQuestion]);

  const activeAnswer = activeQuickQuestion ? continuity.answers[activeQuickQuestion.id] : undefined;
  const selectedOption = activeAnswer?.selectedIndex ?? null;
  const answerSubmitted = Boolean(activeAnswer?.submitted);
  const activeMisconception = activeQuickQuestion && answerSubmitted && selectedOption !== null
    ? misconceptionFor(activeQuickQuestion, selectedOption, unit)
    : null;

  const assessedId = activeComponent?.id || '';
  const assessedName = lesson.components.find((component) => component.id === assessedId)?.name || activeComponent?.name || lesson.title;
  const structureIndexForAssessed = lesson.components.findIndex((component) => component.id === assessedId);
  const nextConcept = structureIndexForAssessed >= 0 ? lesson.components[structureIndexForAssessed + 1] : undefined;
  const speechVisible =
    experience.offerSpeech &&
    !(preferences.speechFree && !preferences.dyslexiaFriendly && !preferences.blindFriendly && !preferences.listenExplore);
  const plainActive = experience.plainLanguage || showPlain;
  const diagramAvailable = Boolean(educationalAsset(lesson.id));
  const recommendation = useMemo(() => {
    if (!assessedId) return null;
    return recommendNextStep({
      lessonId: lesson.id,
      conceptId: assessedId,
      conceptName: assessedName,
      events: evidence,
      hasPlain: Boolean(lesson.components.find((component) => component.id === assessedId)?.simpleExplanation.trim()),
      plainActive: assessedId === activeComponent?.id && plainActive,
      hasDiagram: diagramAvailable,
      hasNarration: Boolean(adapted?.narrationText),
      allowSpeech: speechVisible && Boolean(adapted?.narrationText),
      hasNextConcept: Boolean(nextConcept),
      nextConceptName: nextConcept?.name ?? null,
      otherQuestionIds: lesson.practiceQuestions.map((question) => question.id).filter((id) => id !== activeQuickQuestion?.id)
    });
  }, [
    activeComponent,
    activeQuickQuestion?.id,
    adapted?.narrationText,
    assessedId,
    assessedName,
    evidence,
    lesson.id,
    lesson.practiceQuestions,
    nextConcept,
    plainActive,
    speechVisible,
    diagramAvailable
  ]);
  const activity = useMemo(
    () =>
      summarizeLesson(
        evidence,
        lesson.id,
        lesson.components.map((component) => component.id),
        lesson.practiceQuestions.map((question) => question.id)
      ),
    [evidence, lesson]
  );
  const objectives = objectivesForLesson(lesson.id);

  const acceptRecommendation = (item: LearningRecommendation) => {
    if (item.kind === 'review_concept' || item.kind === 'simpler_explanation') {
      if (item.kind === 'simpler_explanation') setShowPlain(true);
      setEvidence((current) =>
        appendLearningEvent(current, {
          type: 'explanation_revisited',
          lessonId: lesson.id,
          conceptId: item.conceptId
        })
      );
      document.getElementById('lesson-learn')?.scrollIntoView({ behavior: experience.reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
      onAnnounce?.(item.kind === 'simpler_explanation' ? 'Showing the stored simpler explanation.' : "Let's review this concept.");
      return;
    }
    if (item.kind === 'labeled_diagram') {
      setDiagramRequest((value) => value + 1);
      document.getElementById('labeled-diagram')?.scrollIntoView({ behavior: experience.reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
      onAnnounce?.('The labeled diagram can be shown. The written lesson stays on the page.');
      return;
    }
    if (item.kind === 'listen') {
      document.getElementById('read-current-section')?.focus();
      onAnnounce?.('Speech stays off until you press Read this section.');
      return;
    }
    if (item.kind === 'another_question') {
      const nextQuestion = lesson.practiceQuestions.find((question) => question.id !== activeQuickQuestion?.id && question.diagramComponentId);
      if (nextQuestion?.diagramComponentId) handleSelectComponent(nextQuestion.diagramComponentId);
      onAnnounce?.('Another stored question is available.');
      return;
    }
    if (item.kind === 'continue' && nextConcept) {
      handleSelectComponent(nextConcept.id);
      onAnnounce?.("You're ready to continue.");
    }
  };

  const handleAnswerSubmit = (optionIndex: number) => {
    if (!activeQuickQuestion || answerSubmitted || !activeComponent) return;
    const result = recordAnswer(continuity, unit, activeQuickQuestion, optionIndex);
    setContinuity(result.state);
    setEvidence((current) =>
      appendLearningEvent(current, {
        type: 'question_answered',
        lessonId: lesson.id,
        conceptId: activeQuickQuestion.diagramComponentId || activeComponent.id,
        questionId: activeQuickQuestion.id,
        questionLabel: lesson.components.find((component) => component.id === (activeQuickQuestion.diagramComponentId || activeComponent.id))?.name || activeComponent.name,
        correct: result.correct
      })
    );
    if (onAnnounce) {
      if (result.correct) {
        onAnnounce(experience.encouragingFeedback ? `You're ready to continue. ${activeQuickQuestion.explanation}` : "You're ready to continue.");
      } else {
        onAnnounce("Let's review this concept. The explanation is under the question.");
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. Scientific Instrument Header & Breadcrumbs */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
        {/* Breadcrumbs */}
        <div className="lens-optional" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>
          <span>ConceptLens</span>
          <span>›</span>
          <span>Biology</span>
          <span>›</span>
          <span style={{ color: 'var(--accent-cyan)' }}>{lesson.category}</span>
          <span>›</span>
          <span style={{ color: 'var(--text-primary)' }}>{lesson.title.toUpperCase()}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '0.2rem 0.6rem',
                  borderRadius: 'var(--radius-xs)',
                  background: 'rgba(101, 229, 242, 0.12)',
                  color: 'var(--accent-cyan)',
                  border: '1px solid rgba(101, 229, 242, 0.3)'
                }}
              >
                {lesson.category}
              </span>
              <span className="lesson-title">{lesson.title}</span>
            </div>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginTop: '0.35rem', maxWidth: '42rem', lineHeight: 1.5 }}>
              {lesson.subtitle}
            </p>
            {objectives.length > 0 && (
              <ol className="objective-list">
                {objectives.map((objective) => (
                  <li key={objective.id}>{objective.statement}</li>
                ))}
              </ol>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn-secondary"
              aria-pressed={paused}
              onClick={() => {
                setPaused((value) => !value);
                onAnnounce?.(paused ? `Resumed ${activeComponent?.name || lesson.title}.` : `Paused on ${activeComponent?.name || lesson.title}. Your place is saved.`);
              }}
            >
              {paused ? 'Resume' : 'Pause'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setContinuity(resetProgress(continuity, unit));
                clearProgress(lesson.id);
                setEvidence((current) => clearLessonEvents(current, lesson.id));
                setShowPlain(false);
                setPathNotice('Learning progress for this lesson was reset. Display preferences stayed.');
                onRestartLesson();
              }}
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <RotateCcw size={14} />
              <span>Restart Tour</span>
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={onOpenPractice}
              style={{ fontSize: '0.8rem', padding: '0.45rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Award size={14} />
              <span>Knowledge check ({lesson.practiceQuestions.length})</span>
            </button>
          </div>
        </div>
      </div>

      <LearningPathBar
        modes={modesForLesson(unit)}
        active={continuity.mode}
        notice={pathNotice}
        onChange={changePath}
      />

      {experience.guidedStages && !preferences.simpleSteps && (
        <nav className="guide-stages glass-panel" aria-label="Lesson stages">
          {(['Learn', 'Explore', 'Try', 'Review'] as const).map((label, index) => (
            <button
              key={label}
              type="button"
              className="btn-secondary"
              aria-current={guideStage === index ? 'step' : undefined}
              onClick={() => {
                setGuideStage(index);
                const target = document.getElementById(['lesson-learn', 'lesson-explore', 'lesson-try', 'lesson-review'][index]);
                target?.scrollIntoView({ behavior: experience.reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
                onAnnounce?.(`${label} is the current stage. ${activeComponent?.name || lesson.title} stays selected.`);
              }}
            >
              <span>{label}</span>
              {guideStage === index && <span className="theme-card-status">Current</span>}
            </button>
          ))}
        </nav>
      )}

      {experience.showNextAction && activeComponent && (
        <p className="task-banner" role="status">
          Now: {activeComponent.name}. Next:{' '}
          {lesson.components[structureIndex + 1]?.name || 'review this part, or open the knowledge check.'}
        </p>
      )}

      {activeComponent && (
        <NextStepPanel
          conceptName={assessedName}
          stage={progressStage(evidence, lesson.id, assessedId || activeComponent.id)}
          summary={activity}
          recommendation={recommendation}
          onAccept={acceptRecommendation}
        />
      )}

      <div className="atlas-stage">
        <aside className="atlas-rail glass-panel" style={{ padding: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.08em', color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
              Structures
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Select a part to read it and highlight it in the model.
            </p>
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
            <input
              type="search"
              aria-label="Search structures in this model"
              placeholder="Search nucleus, valve, ATP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-input"
              style={{ width: '100%', paddingLeft: '2rem', fontSize: '0.85rem' }}
            />
          </div>
          <div className="structure-move">
            <button type="button" className="btn-secondary" onClick={() => selectRelative(-1)} disabled={structureIndex <= 0}>
              Previous structure
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => selectRelative(1)}
              disabled={structureIndex < 0 || structureIndex >= lesson.components.length - 1}
            >
              Next structure
            </button>
          </div>
          {preferences.breakReminderMinutes > 0 && (
            <p role="status" className="path-notice">
              {breakDue
                ? 'You can take a break. Your place in this lesson is saved.'
                : paused
                  ? 'Break reminder paused. There is no countdown.'
                  : `A quiet reminder is set for ${preferences.breakReminderMinutes} minutes. There is no countdown.`}
            </p>
          )}
          {paused && <p role="status">Paused on {activeComponent?.name}. Nothing will advance on its own.</p>}
          <div className="structure-list">
            {filteredComponents.length === 0 && (
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                No structure matches that search.
              </p>
            )}
            {filteredComponents.map((comp) => (
              <button
                key={comp.id}
                type="button"
                className={`tag-btn ${selectedComponentId === comp.id ? 'active is-selected' : ''}`}
                onClick={() => handleSelectComponent(comp.id)}
                aria-pressed={selectedComponentId === comp.id}
                aria-current={selectedComponentId === comp.id ? 'true' : undefined}
                style={{
                  fontSize: '0.8rem',
                  padding: '0.45rem 0.65rem',
                  borderRadius: '8px',
                  border: `1px solid ${selectedComponentId === comp.id ? comp.color : 'var(--border-subtle)'}`,
                  background: selectedComponentId === comp.id ? `${comp.color}22` : 'transparent',
                  color: selectedComponentId === comp.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                {comp.name}
                {selectedComponentId === comp.id && <span className="path-option-note"> Selected</span>}
              </button>
            ))}
          </div>
        </aside>

        <div id="lesson-explore" className="glass-panel atlas-view" style={{ padding: '1rem', display: 'flex', flexDirection: 'column' }}>
          {/* Top Control Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showLabels}
                  onChange={(e) => setShowLabels(e.target.checked)}
                />
                <span>Overlay Labels</span>
              </label>
            </div>
          </div>

          <div
            className="atlas-canvas"
            style={{ flex: 1, minHeight: '440px', borderRadius: '10px', overflow: 'hidden' }}
          >
            {preferences.simpleSteps && (
              <SimpleStepsLesson
                lesson={lesson}
                stepIndex={currentStepIndex}
                lowData={preferences.lowData || continuity.lowData}
                selectedOption={selectedOption}
                answerSubmitted={answerSubmitted}
                onSelectStep={(index) => {
                  const componentId = lesson.guidedSteps[index]?.componentId;
                  if (componentId) handleSelectComponent(componentId);
                }}
                onAnswer={(index) => handleAnswerSubmit(index)}
                onTryAgain={() => {
                  if (activeQuickQuestion) setContinuity(clearAnswer(continuity, activeQuickQuestion.id));
                }}
                onRequestModel={() => setSceneRequested(true)}
                modelVisible={showInteractive}
              />
            )}
            {continuity.mode === 'simple' && !preferences.simpleSteps && activeComponent && (
              <SimplePath
                unit={unit}
                componentName={activeComponent.name}
                simple={activeComponent.simpleExplanation}
                detail={activeComponent.function}
                scientific={activeComponent.scientificExplanation}
              />
            )}
            {continuity.mode === 'steps' && !preferences.simpleSteps && (
              <StepPath
                steps={unit.guidedSteps}
                index={currentStepIndex}
                completed={continuity.completedStepIndexes}
                onPick={(index) => {
                  const componentId = lesson.guidedSteps[index]?.componentId;
                  if (componentId) handleSelectComponent(componentId);
                }}
                onComplete={(index) => setContinuity(markStepComplete(continuity, index))}
              />
            )}
            {(continuity.mode === 'accessible' || (preferences.textFirst && continuity.mode === 'visual' && !sceneRequested)) && !preferences.simpleSteps && (
              <TextFirstPath
                title={lesson.title}
                objective={lesson.subtitle}
                description={lesson.description}
                selectedId={selectedComponentId}
                onSelect={handleSelectComponent}
                parts={lesson.components.map((component) => ({
                  id: component.id,
                  name: component.name,
                  simple: component.simpleExplanation,
                  scientific: component.scientificExplanation,
                  role: component.function
                }))}
              />
            )}
            {(continuity.mode === 'low-data' || (!preferences.textFirst && (preferences.lowData || continuity.lowData) && continuity.mode === 'visual' && !sceneRequested)) && !preferences.simpleSteps && activeComponent && (
              <LowDataPath
                unit={unit}
                componentName={activeComponent.name}
                simple={activeComponent.simpleExplanation}
                imageUrl={null}
                conceptId={lesson.id}
              />
            )}
            {showDiagram && lesson.id === 'human_cell' && (
              <Cell2DCanvas
                selectedComponentId={selectedComponentId}
                onSelectComponent={handleSelectComponent}
                showLabels={showLabels}
                onToggleLabels={() => setShowLabels((v) => !v)}
                onAnnounce={onAnnounce}
              />
            )}
            {showDiagram && lesson.id === 'human_heart' && (
              <Heart2DCanvas
                selectedComponentId={selectedComponentId}
                onSelectComponent={handleSelectComponent}
                showLabels={showLabels}
                autoplay={!experience.neverAutoplay && !experience.reduceMotion}
              />
            )}
            {showDiagram && lesson.id === 'dna_helix' && (
              <Dna2DCanvas selectedComponentId={selectedComponentId} onSelectComponent={handleSelectComponent} showLabels={showLabels} />
            )}
            {showDiagram && lesson.id === 'neuron' && (
              <Neuron2DCanvas selectedComponentId={selectedComponentId} onSelectComponent={handleSelectComponent} showLabels={showLabels} />
            )}
            {showDiagram && lesson.id === 'plant_cell' && (
              <PlantCell2DCanvas selectedComponentId={selectedComponentId} onSelectComponent={handleSelectComponent} showLabels={showLabels} />
            )}
            {showDiagram && (
              <p className="path-option-note model-caption">Simplified illustration. The structure list names the same parts.</p>
            )}
          </div>
        </div>

        <div id="lesson-learn" className="glass-panel atlas-notes" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Selected structure
          </div>
          {experience.captionsAndTranscripts && (
            <p role="status">This lesson has no video or recorded audio. The explanation is written here. Nothing important is only a sound.</p>
          )}
          {experience.offerSpeech && !(preferences.speechFree && !preferences.dyslexiaFriendly && !preferences.blindFriendly && !preferences.listenExplore) && (
            <SpeechControls
              text={adapted?.narrationText || spokenLesson}
              rate={preferences.speechRate}
              label="Read the selected structure"
              speechOptionalNote={preferences.speechFree ? 'Speaking is optional. You can answer with a pointer or the keyboard.' : undefined}
              onRateChange={(speechRate) => onPreferences({ ...preferences, speechRate })}
            />
          )}
          {(experience.showAnnotatedDiagram || preferences.visualLearning) && !preferences.simpleSteps && (
            <EducationalFigure
              conceptId={lesson.id}
              lowData={preferences.lowData || continuity.lowData}
              deferUntilRequested={preferences.lowData || continuity.lowData || preferences.textFirst}
              eager={!preferences.lowData && !continuity.lowData && !preferences.textFirst}
              requestToken={diagramRequest}
            />
          )}
          {/* Active Component Deep-Dive Card */}
          {activeComponent && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', flex: 1, overflowY: 'auto' }}>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>{activeComponent.name}</span>
                </div>
                {activeComponent.scientificName && (
                  <div style={{ fontSize: '0.75rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                    {activeComponent.scientificName}
                  </div>
                )}
              </div>

              {(experience.everydayExamples || !experience.plainLanguage) && (
              <div
                style={{
                  background: 'rgba(245, 158, 11, 0.1)',
                  borderLeft: '3px solid #f59e0b',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '0 8px 8px 0',
                  fontSize: '0.85rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, color: '#f59e0b', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                  <Lightbulb size={14} aria-hidden="true" />
                  <span>Everyday example</span>
                </div>
                <div style={{ color: 'var(--text-primary)', lineHeight: 1.4 }}>
                  {adapted?.everyday || adapted?.everydayNote}
                </div>
              </div>
              )}

              {(experience.showGlossary || continuity.mode === 'simple') && vocabulary.length > 0 && (
                <section aria-label="Vocabulary from this lesson">
                  <h4>Words in this lesson</h4>
                  <dl className="vocab-list">
                    {vocabulary.map((item) => (
                      <div key={item.term}>
                        <dt>{item.term}</dt>
                        <dd>{item.meaning}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="path-option-note">These lines are copied from this lesson. A font change is not offered as a treatment.</p>
                </section>
              )}

              <div className="lesson-copy">
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  {showPlain || adapted?.representation === 'plain' ? 'Plain-language explanation' : 'Scientific explanation'}
                </div>
                {adapted?.fallbackNote && <p role="status">{adapted.fallbackNote}</p>}
                {showPlain && !experience.plainLanguage && activeComponent.simpleExplanation.trim() ? (
                  <>
                    <p style={{ fontSize: '1.05rem', color: 'var(--text-primary)', lineHeight: 1.65 }}>{activeComponent.simpleExplanation}</p>
                    <details className="lesson-copy">
                      <summary>Scientific explanation</summary>
                      <p>{activeComponent.scientificExplanation}</p>
                    </details>
                    <p className="path-option-note">This is the stored simpler explanation. The scientific text stays available.</p>
                  </>
                ) : (
                  (adapted?.paragraphs.length ? adapted.paragraphs : [activeComponent.scientificExplanation]).map((paragraph) => (
                    <p key={paragraph} style={{ fontSize: '1.05rem', color: 'var(--text-primary)', lineHeight: 1.65 }}>{paragraph}</p>
                  ))
                )}
              </div>

              {experience.plainLanguage && adapted?.representation === 'plain' && adapted.standard && (
                <details className="lesson-copy">
                  <summary>Complete scientific explanation</summary>
                  <p>{adapted.standard}</p>
                  <p className="path-option-note">The shorter explanation above is stored with this lesson. It is not an automatic rewrite.</p>
                </details>
              )}

              {experience.diagramText && (
                <section aria-label="Diagram description">
                  <h4>What the diagram shows</h4>
                  <p>{adapted?.diagramDescription || adapted?.diagramNote}</p>
                </section>
              )}

              {/* Anatomical Location & Function */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', fontSize: '0.8rem' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.15rem' }}>Location:</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{activeComponent.location}</span>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.15rem' }}>Primary Role:</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{activeComponent.function}</span>
                </div>
              </div>

              {/* Key Exam Facts (Board Tips) */}
              {adapted && adapted.chunks.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Award size={13} aria-hidden="true" />
                    <span>{experience.chunkLessons ? `Section ${Math.min(chunkIndex + 1, adapted.chunks.length)} of ${adapted.chunks.length}` : 'Facts to remember'}</span>
                  </div>
                  {experience.chunkLessons ? (
                    <div>
                      <p>{adapted.chunks[Math.min(chunkIndex, adapted.chunks.length - 1)]}</p>
                      <div className="simple-steps-nav">
                        <button type="button" className="btn-secondary" onClick={() => setChunkIndex((index) => Math.max(0, index - 1))} disabled={chunkIndex === 0}>
                          Previous section
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => setChunkIndex((index) => Math.min(adapted.chunks.length - 1, index + 1))}
                          disabled={chunkIndex >= adapted.chunks.length - 1}
                        >
                          Next section
                        </button>
                      </div>
                    </div>
                  ) : (
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      {adapted.chunks.map((fact) => (
                        <li key={fact}>{fact}</li>
                      ))}
                    </ul>
                  )}
                  {adapted.chunksNote && <p className="path-option-note">{adapted.chunksNote}</p>}
                </div>
              )}
              {adapted?.chunksNote && adapted.chunks.length === 0 && experience.chunkLessons && (
                <p className="path-option-note">{adapted.chunksNote}</p>
              )}

              {/* Related Concepts Chips */}
              {activeComponent.relatedConcepts.length > 0 && (
                <div className="lens-optional" style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                  {activeComponent.relatedConcepts.map((concept, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '0.7rem',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: 'var(--text-muted)',
                        border: '1px solid rgba(255, 255, 255, 0.08)'
                      }}
                    >
                      #{concept}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3. BOTTOM PANEL: Step-by-Step Guided Sequence & Quick Knowledge Check */}
      {!preferences.simpleSteps && (
      <div className="glass-panel lesson-followup-wrap" style={{ padding: '1.25rem 1.5rem' }}>
        <div className="lesson-followup">
          {/* Left: Guided Step Sequence */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                Guided Curriculum Tour • Step {currentStepIndex + 1} of {lesson.guidedSteps.length}
              </div>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handlePrevStep}
                  disabled={currentStepIndex === 0}
                >
                  <ChevronLeft size={16} aria-hidden="true" /> Previous step
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleNextStep}
                  disabled={currentStepIndex === lesson.guidedSteps.length - 1}
                >
                  Next step <ChevronRight size={16} aria-hidden="true" />
                </button>
              </div>
            </div>

            {lesson.guidedSteps[currentStepIndex] && (
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  {lesson.guidedSteps[currentStepIndex].title}
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', lineHeight: 1.4 }}>
                  {lesson.guidedSteps[currentStepIndex].summary}
                </p>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                  👉 {lesson.guidedSteps[currentStepIndex].actionPrompt}
                </div>
              </div>
            )}

            {/* Step Progress Dots */}
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.75rem' }}>
              {lesson.guidedSteps.map((step, idx) => (
                <button
                  key={step.componentId}
                  type="button"
                  aria-label={`${continuity.completedStepIndexes.includes(idx) ? 'Done' : 'Stage'} ${step.stepNumber}: ${step.title}`}
                  aria-current={idx === currentStepIndex ? 'step' : undefined}
                  onClick={() => handleSelectComponent(step.componentId)}
                  style={{
                    flex: 1,
                    minHeight: '44px',
                    border: 0,
                    borderBottom: idx === currentStepIndex ? '3px solid var(--text-primary)' : '3px solid transparent',
                    background: idx <= currentStepIndex ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.1)',
                    color: idx <= currentStepIndex ? '#062028' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem'
                  }}
                >
                  {idx === currentStepIndex ? `Current ${step.stepNumber}` : continuity.completedStepIndexes.includes(idx) ? `Done ${step.stepNumber}` : step.stepNumber}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Quick Knowledge Check Mini-Quiz */}
          {activeQuickQuestion && (
            <div
              id="lesson-try"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '0.9rem 1.1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <HelpCircle size={13} />
                  <span>QUICK KNOWLEDGE CHECK</span>
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Practice question · not an official paper
                </span>
              </div>

              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.6rem', lineHeight: 1.35 }}>
                {activeQuickQuestion.question}
              </div>

              {/* 4 Clickable Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {activeQuickQuestion.options.map((opt, oIdx) => {
                  const isChosen = selectedOption === oIdx;
                  const isCorrect = oIdx === activeQuickQuestion.correctOptionIndex;

                  let optBorder = 'var(--border-medium)';
                  let optBg = 'var(--bg-surface)';

                  if (answerSubmitted) {
                    if (isCorrect) {
                      optBorder = 'var(--color-success)';
                      optBg = 'var(--bg-elevated)';
                    } else if (isChosen && !isCorrect) {
                      optBorder = 'var(--color-error)';
                      optBg = 'var(--bg-elevated)';
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      type="button"
                      className="quiz-option"
                      data-marker={OPTION_MARKERS[oIdx] || 'Option'}
                      onClick={() => handleAnswerSubmit(oIdx)}
                      disabled={answerSubmitted}
                      style={{
                        borderColor: optBorder,
                        background: optBg,
                        color: 'var(--text-primary)'
                      }}
                    >
                      <span>{OPTION_MARKERS[oIdx] ? `${OPTION_MARKERS[oIdx]}: ` : ''}{opt}</span>
                      {optionFeedback(answerSubmitted, isChosen, isCorrect) && (
                        <span className="answer-status">
                          {optionFeedback(answerSubmitted, isChosen, isCorrect)}
                          {isCorrect ? <CheckCircle2 size={13} aria-hidden="true" /> : <XCircle size={13} aria-hidden="true" />}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {experience.offerHints && !answerSubmitted && (
                <p className="path-option-note">{adapted?.hint || adapted?.hintNote}</p>
              )}
              <div id="lesson-review">
              {answerSubmitted && (
                <div style={{ marginTop: '0.6rem', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                  <strong>
                    {selectedOption === activeQuickQuestion.correctOptionIndex
                      ? "You're ready to continue. "
                      : "Let's review this concept. "}
                  </strong>
                  {activeQuickQuestion.explanation}
                </div>
              )}
              {answerSubmitted && (
                <div className="path-reading" role="status">
                  {activeMisconception && (
                    <>
                      <h4>Let's review this concept.</h4>
                      <p>The chosen statement was: {activeMisconception.chosenStatement}</p>
                      <p>{activeMisconception.correction}</p>
                    </>
                  )}
                  {activeQuickQuestion.diagramComponentId && (
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => {
                        const componentId = activeQuickQuestion.diagramComponentId;
                        if (!componentId) return;
                        const next = selectStructure(continuity, unit, componentId);
                        setContinuity(next.state);
                        setPathNotice(`Still on ${lesson.components.find((component) => component.id === componentId)?.name || 'this structure'}.`);
                      }}
                    >
                      Revisit this concept
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setContinuity(clearAnswer(continuity, activeQuickQuestion.id))}
                  >
                    Try this question again
                  </button>
                </div>
              )}
              </div>
            </div>
          )}
          {!activeQuickQuestion && activeComponent && (
            <p>No practice question is stored for {activeComponent.name}. The explanation is still available.</p>
          )}
          <SdgPanel connection={sdgForConcept(lesson.id)} />
          <div className="lens-optional"><OfflineText unit={unit} /></div>
          <div className="lens-optional"><TeachForward conceptId={lesson.id} conceptTitle={lesson.title} /></div>
        </div>
      </div>
      )}
    </div>
  );
};
