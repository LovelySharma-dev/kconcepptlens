import React, { useState, useEffect, useRef } from 'react';
import type {
  LearningPreferences,
  BiologyTopicId,
  ADHDStudyPlan,
  ADHDTaskItem
} from '@conceptlens/shared';
import {
  generateDeterministicStudyPlan
} from '@conceptlens/shared';
import {
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  BookOpen,
  Award,
  Layers,
  ListOrdered,
  Lightbulb,
  Split,
  Sliders,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Compass,
  ArrowLeft,
  X,
  RotateCw
} from 'lucide-react';

interface ADHDLearningDashboardProps {
  preferences: LearningPreferences;
  onPreferences: (next: LearningPreferences) => void;
  onNavigateLearn: () => void;
  onNavigatePractice: () => void;
  onLaunchVisualModel: (topicId: BiologyTopicId) => void;
  onAnnounce?: (msg: string) => void;
}

const TIMER_PRESETS = [
  { label: '2 min', minutes: 2 },
  { label: '5 min', minutes: 5 },
  { label: '10 min', minutes: 10 },
  { label: '15 min', minutes: 15 },
  { label: '25 min', minutes: 25 }
];

const LOCAL_STORAGE_PLAN_KEY = 'conceptlens_adhd_plan_v1';
const LOCAL_STORAGE_SETUP_KEY = 'conceptlens_adhd_setup_done';

export const ADHDLearningDashboard: React.FC<ADHDLearningDashboardProps> = ({
  preferences,
  onPreferences,
  onNavigateLearn,
  onNavigatePractice,
  onLaunchVisualModel,
  onAnnounce
}) => {
  // -------------------------------------------------------------
  // 1. Learning Continuity Retrieval
  // -------------------------------------------------------------
  const [savedConcept, setSavedConcept] = useState<string | null>(null);

  useEffect(() => {
    try {
      // 1. Check active lesson continuity from LearnWorkspace
      const continuity = localStorage.getItem('conceptlens-learn-continuity');
      if (continuity) {
        const parsed = JSON.parse(continuity);
        if (parsed?.lesson?.topic) {
          setSavedConcept(parsed.lesson.topic);
          return;
        }
      }
      // 2. Check alternative saved lesson storage
      const raw = localStorage.getItem('conceptlens_saved_lesson_v2');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.topic) {
          setSavedConcept(parsed.topic);
          return;
        }
      }
    } catch {
      // fallback
    }
  }, []);

  // -------------------------------------------------------------
  // 2. Personalization Setup State (Skippable)
  // -------------------------------------------------------------
  const [showSetupModal, setShowSetupModal] = useState<boolean>(() => {
    return localStorage.getItem(LOCAL_STORAGE_SETUP_KEY) !== 'true';
  });

  const [setupPrefs, setSetupPrefs] = useState({
    startingPreference: 'continue',
    focusDuration: 10,
    learningFormat: 'mixed',
    enableFocusRuler: preferences.focusMode,
    gentleReminders: false,
    movementBreaks: false
  });

  const handleFinishSetup = () => {
    localStorage.setItem(LOCAL_STORAGE_SETUP_KEY, 'true');
    setShowSetupModal(false);
    if (setupPrefs.enableFocusRuler && !preferences.focusMode) {
      onPreferences({ ...preferences, focusMode: true, adhdFriendly: true });
    }
    onAnnounce?.('Personalization saved. Welcome to your ADHD-friendly study space.');
  };

  // -------------------------------------------------------------
  // 3. Flexible Timestamp-Based Focus Timer
  // -------------------------------------------------------------
  const [timerMinutes, setTimerMinutes] = useState<number>(10);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(10 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerFinished, setTimerFinished] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [movementReminder, setMovementReminder] = useState<boolean>(false);

  const endTimeRef = useRef<number | null>(null);

  // Sync remainingSeconds when preset changes and timer is idle
  const handleSelectPreset = (minutes: number) => {
    setTimerMinutes(minutes);
    if (!isTimerRunning) {
      setRemainingSeconds(minutes * 60);
      setTimerFinished(false);
    }
  };

  const handleStartTimer = () => {
    setIsTimerRunning(true);
    setTimerFinished(false);
    endTimeRef.current = Date.now() + remainingSeconds * 1000;
    onAnnounce?.(`Focus timer started for ${Math.round(remainingSeconds / 60)} minutes.`);
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
    endTimeRef.current = null;
    onAnnounce?.('Timer paused. Take your time.');
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    endTimeRef.current = null;
    setRemainingSeconds(timerMinutes * 60);
    setTimerFinished(false);
    onAnnounce?.('Timer reset.');
  };

  // Timestamp interval loop (never drifts across tabs)
  useEffect(() => {
    if (!isTimerRunning) return;

    const interval = setInterval(() => {
      if (!endTimeRef.current) return;
      const leftMs = endTimeRef.current - Date.now();
      const leftSec = Math.max(0, Math.ceil(leftMs / 1000));
      setRemainingSeconds(leftSec);

      if (leftSec <= 0) {
        setIsTimerRunning(false);
        setTimerFinished(true);
        endTimeRef.current = null;
        onAnnounce?.('Time is up! You completed your focus session. Would you like a break or to continue?');
      }
    }, 250);

    return () => clearInterval(interval);
  }, [isTimerRunning, onAnnounce]);

  // Format MM:SS
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // -------------------------------------------------------------
  // 4. Micro-Task Planning State & Engine
  // -------------------------------------------------------------
  const [goalInput, setGoalInput] = useState<string>('Study the human cell');
  const [plan, setPlan] = useState<ADHDStudyPlan>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_PLAN_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return generateDeterministicStudyPlan('Study the human cell', 'human_cell');
  });

  const [oneStepMode, setOneStepMode] = useState<boolean>(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Persist plan changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_PLAN_KEY, JSON.stringify(plan));
    } catch {
      // ignore
    }
  }, [plan]);

  const handleGeneratePlan = async (targetGoal: string) => {
    const clean = targetGoal.trim() || 'Study the human cell';
    try {
      const res = await fetch('/api/ai/plan-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: clean })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setPlan(json.data);
          setActiveStepIndex(0);
          onAnnounce?.(`Generated 5 manageable steps for ${clean}`);
          return;
        }
      }
    } catch {
      // fallback
    }
    // Local deterministic fallback
    const fallbackPlan = generateDeterministicStudyPlan(clean);
    setPlan(fallbackPlan);
    setActiveStepIndex(0);
    onAnnounce?.(`Ready with 5 steps for ${clean}`);
  };

  // Task Mutations
  const toggleTaskCompletion = (taskId: string) => {
    setPlan((prev) => {
      const updated = prev.tasks.map((t) => {
        if (t.id === taskId) {
          const nextCompleted = !t.completed;
          if (nextCompleted) {
            setFeedbackMessage('You completed this step. Great progress!');
            onAnnounce?.('Step marked complete.');
          }
          return { ...t, completed: nextCompleted };
        }
        return t;
      });
      return { ...prev, tasks: updated };
    });
  };

  const handleSkipTask = (taskId: string) => {
    setPlan((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, skipped: true } : t))
    }));
    onAnnounce?.('Step skipped.');
  };

  const handleDeleteTask = (taskId: string) => {
    setPlan((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId)
    }));
    onAnnounce?.('Task removed.');
  };

  const handleMoveTask = (index: number, direction: 'up' | 'down') => {
    setPlan((prev) => {
      const targetIdx = direction === 'up' ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= prev.tasks.length) return prev;
      const copy = [...prev.tasks];
      const temp = copy[index];
      copy[index] = copy[targetIdx];
      copy[targetIdx] = temp;
      return { ...prev, tasks: copy };
    });
  };

  const handleBreakIntoMicroActions = (taskId: string) => {
    setPlan((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => {
        if (t.id === taskId) {
          const subtasks = t.subtasks?.length
            ? t.subtasks
            : [
                { id: `sub_${Date.now()}_1`, title: '2-min read: glance at main definition', completed: false },
                { id: `sub_${Date.now()}_2`, title: '2-min inspect: find on diagram or diagram label', completed: false },
                { id: `sub_${Date.now()}_3`, title: '1-min check: recall the role in your head', completed: false }
              ];
          return { ...t, subtasks };
        }
        return t;
      })
    }));
    onAnnounce?.('Broke step into 2-minute micro-actions.');
  };

  const handleAddCustomTask = () => {
    const newTask: ADHDTaskItem = {
      id: `task_${Date.now()}`,
      title: 'Quick 3-minute review or check',
      durationMinutes: 3,
      completed: false,
      skipped: false,
      subtasks: []
    };
    setPlan((prev) => ({ ...prev, tasks: [...prev.tasks, newTask] }));
    onAnnounce?.('Added new step.');
  };

  // -------------------------------------------------------------
  // 5. Active Learning Modality Navigation
  // -------------------------------------------------------------
  const [activeRecallRevealed, setActiveRecallRevealed] = useState(false);
  const [teachItBackText, setTeachItBackText] = useState('');
  const [teachItBackSubmitted, setTeachItBackSubmitted] = useState(false);

  const completedCount = plan.tasks.filter((t) => t.completed).length;
  const totalTasks = plan.tasks.length;
  const currentActiveTask = plan.tasks[activeStepIndex] || plan.tasks[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>
      
      {/* HEADER ENTRY BANNER */}
      <section
        className="glass-panel"
        style={{
          padding: '2rem',
          borderRadius: 'var(--radius-lg)',
          borderLeft: '4px solid var(--accent-cyan)',
          position: 'relative'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="focus-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <Sparkles size={15} color="var(--accent-cyan)" />
                <span>INCLUSIVE STUDY SPACE</span>
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Optional • Reversible</span>
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.4rem', letterSpacing: '-0.02em' }}>
              ADHD-Friendly Learning
            </h1>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: 0, maxWidth: '680px', lineHeight: 1.6 }}>
              A flexible study space with smaller steps, active learning, and easy ways to pick up where you left off.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowSetupModal(true)}
              style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Sliders size={14} />
              <span>Personalize Space</span>
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={onNavigateLearn}
              style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem' }}
            >
              <ArrowLeft size={14} style={{ marginRight: '0.3rem' }} />
              <span>Standard View</span>
            </button>
          </div>
        </div>

        {/* FEEDBACK NOTICE */}
        {feedbackMessage && (
          <div
            style={{
              marginTop: '1.25rem',
              padding: '0.65rem 1rem',
              background: 'rgba(16, 185, 129, 0.12)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: 'var(--accent-emerald)',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={16} />
              <span>{feedbackMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackMessage(null)}
              className="icon-btn"
              style={{ width: '20px', height: '20px', padding: 0 }}
            >
              <X size={13} />
            </button>
          </div>
        )}
      </section>

      {/* DASHBOARD TOP ACTIONS GRID */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1.25rem' }}>
        
        {/* ACTION 1: CONTINUE LEARNING (PRIMARY PROMINENT ACTION) */}
        <div
          className="glass-panel"
          style={{
            padding: '1.5rem',
            borderRadius: 'var(--radius-md)',
            border: '2px solid var(--accent-cyan)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'var(--surface-bg)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent-cyan)', letterSpacing: '0.06em' }}>
                Primary Action
              </span>
              <RotateCw size={14} color="var(--accent-cyan)" />
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.35rem' }}>Continue Learning</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              {savedConcept
                ? `Pick up right where you left off on: "${savedConcept}"`
                : 'Resume your last active study session without losing your place.'}
            </p>
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={onNavigateLearn}
            style={{ marginTop: '1.25rem', width: '100%', fontSize: '0.9rem', padding: '0.65rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 700 }}
          >
            <span>Resume Saved Session</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* ACTION 2: START SOMETHING SMALL */}
        <div
          className="glass-panel"
          style={{
            padding: '1.5rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-amber)', letterSpacing: '0.06em' }}>
              Low Pressure
            </span>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0.4rem 0 0.35rem' }}>Start Something Small</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Feeling overwhelmed? Try one bite-sized 3-minute exploration: Animal Cell Organelles.
            </p>
          </div>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onLaunchVisualModel('human_cell')}
            style={{ marginTop: '1.25rem', width: '100%', fontSize: '0.85rem', padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
          >
            <Compass size={15} />
            <span>Open 3-Min Animal Cell</span>
          </button>
        </div>

        {/* ACTION 3: QUICK PRACTICE */}
        <div
          className="glass-panel"
          style={{
            padding: '1.5rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-emerald)', letterSpacing: '0.06em' }}>
              Active Recall
            </span>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0.4rem 0 0.35rem' }}>Quick Practice</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Test your understanding with 3 zero-stakes practice questions.
            </p>
          </div>
          <button
            type="button"
            className="btn-secondary"
            onClick={onNavigatePractice}
            style={{ marginTop: '1.25rem', width: '100%', fontSize: '0.85rem', padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
          >
            <Award size={15} />
            <span>Open Practice Space</span>
          </button>
        </div>

      </section>

      {/* FOCUS TIMER & MICRO-TASK PLANNER SPLIT SECTION */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '1.5rem' }}>
        
        {/* 1. FLEXIBLE FOCUS TIMER CARD */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Flexible Focus Timer</h2>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Suggestions, not deadlines</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setSoundEnabled((v) => !v)}
                title={soundEnabled ? 'Chime sound on' : 'Chime sound muted'}
                style={{ width: '28px', height: '28px', padding: 0 }}
              >
                {soundEnabled ? <Volume2 size={15} color="var(--accent-cyan)" /> : <VolumeX size={15} color="var(--text-muted)" />}
              </button>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setMovementReminder((v) => !v)}
                title={movementReminder ? 'Movement reminder enabled' : 'Movement reminder off'}
                style={{ width: '28px', height: '28px', padding: 0 }}
              >
                {movementReminder ? <Bell size={15} color="var(--accent-amber)" /> : <BellOff size={15} color="var(--text-muted)" />}
              </button>
            </div>
          </div>

          {/* TIMER PRESET PILLS */}
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            {TIMER_PRESETS.map((p) => (
              <button
                key={p.minutes}
                type="button"
                className={`tag-btn ${timerMinutes === p.minutes ? 'active' : ''}`}
                onClick={() => handleSelectPreset(p.minutes)}
                style={{ fontSize: '0.78rem', padding: '0.25rem 0.65rem' }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* TIMER DISPLAY */}
          {(() => {
            const timerState: 'ready' | 'running' | 'paused' | 'completed' = timerFinished
              ? 'completed'
              : isTimerRunning
                ? 'running'
                : remainingSeconds < timerMinutes * 60
                  ? 'paused'
                  : 'ready';

            return (
              <div
                className={`adhd-timer-display status-${timerState}`}
                role="region"
                aria-label="Focus timer"
              >
                {/* State Indicator: Icon & Accessible Text */}
                <div className={`adhd-timer-status-badge status-${timerState}`}>
                  {timerState === 'ready' && <Circle size={13} aria-hidden="true" />}
                  {timerState === 'running' && <Play size={13} aria-hidden="true" />}
                  {timerState === 'paused' && <Pause size={13} aria-hidden="true" />}
                  {timerState === 'completed' && <CheckCircle2 size={13} aria-hidden="true" />}
                  <span>
                    {timerState === 'ready' && 'Ready to begin'}
                    {timerState === 'running' && 'Session in progress'}
                    {timerState === 'paused' && 'Paused • Take a breath'}
                    {timerState === 'completed' && 'Focus session complete!'}
                  </span>
                </div>

                <div
                  className="adhd-timer-digits"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {formatTime(remainingSeconds)}
                </div>

                <div className="adhd-timer-supporting">
                  {timerState === 'completed' && 'Great focus session! Ready for a 2-min stretch or next step?'}
                  {timerState === 'running' && 'Session active • Pause or step away whenever you need.'}
                  {timerState === 'paused' && 'Session paused. Resume when ready or reset anytime.'}
                  {timerState === 'ready' && 'Flexible timing suggestions, not deadlines. Pick a time and start.'}
                </div>
              </div>
            );
          })()}

          {/* TIMER CONTROLS */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            {!isTimerRunning ? (
              <button
                type="button"
                className="btn-primary"
                onClick={handleStartTimer}
                style={{ flex: 1, padding: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem', fontSize: '0.9rem' }}
              >
                <Play size={16} />
                <span>{remainingSeconds < timerMinutes * 60 ? 'Resume Timer' : 'Start Focus'}</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn-secondary"
                onClick={handlePauseTimer}
                style={{ flex: 1, padding: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem', fontSize: '0.9rem' }}
              >
                <Pause size={16} />
                <span>Pause</span>
              </button>
            )}

            <button
              type="button"
              className="btn-secondary"
              onClick={handleResetTimer}
              title="Reset Timer"
              style={{ padding: '0.65rem 0.9rem' }}
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>

        {/* 2. MICRO-TASK PLANNER CARD */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Micro-Task Planner</h2>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {completedCount} of {totalTasks} steps completed
              </span>
            </div>

            <button
              type="button"
              className={`tag-btn ${oneStepMode ? 'active' : ''}`}
              onClick={() => setOneStepMode((v) => !v)}
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
            >
              {oneStepMode ? 'Show All Steps' : 'Focus: One Step at a Time'}
            </button>
          </div>

          {/* GOAL INPUT */}
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem' }}>
            <input
              type="text"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              placeholder="What do you want to learn today?"
              className="text-input"
              style={{ flex: 1, fontSize: '0.85rem', padding: '0.45rem 0.75rem' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleGeneratePlan(goalInput);
              }}
            />
            <button
              type="button"
              className="btn-secondary"
              onClick={() => handleGeneratePlan(goalInput)}
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
            >
              Plan
            </button>
          </div>

          {/* ONE-STEP-AT-A-TIME PRESENTATION */}
          {oneStepMode ? (
            <div
              style={{
                flex: 1,
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--surface-bg)',
                border: '1.5px solid var(--accent-cyan)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.78rem', color: 'var(--accent-cyan)' }}>
                  <span>ACTIVE STEP {activeStepIndex + 1} OF {totalTasks}</span>
                  <span>~{currentActiveTask?.durationMinutes} min</span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0.35rem 0 0.75rem', color: 'var(--text-primary)' }}>
                  {currentActiveTask?.title}
                </h3>

                {currentActiveTask?.subtasks && currentActiveTask.subtasks.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.75rem' }}>
                    {currentActiveTask.subtasks.map((sub) => (
                      <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        <span style={{ color: 'var(--accent-cyan)' }}>•</span>
                        <span>{sub.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    toggleTaskCompletion(currentActiveTask.id);
                    if (activeStepIndex < totalTasks - 1) {
                      setActiveStepIndex((i) => i + 1);
                    }
                  }}
                  style={{ flex: 1, fontSize: '0.85rem', padding: '0.55rem' }}
                >
                  <CheckCircle2 size={15} style={{ marginRight: '0.35rem' }} />
                  <span>Mark Done & Next</span>
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    handleSkipTask(currentActiveTask.id);
                    if (activeStepIndex < totalTasks - 1) setActiveStepIndex((i) => i + 1);
                  }}
                  disabled={activeStepIndex >= totalTasks - 1}
                  style={{ fontSize: '0.85rem', padding: '0.55rem' }}
                >
                  Skip
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setOneStepMode(false)}
                  style={{ fontSize: '0.85rem', padding: '0.55rem' }}
                >
                  Exit One-Step
                </button>
              </div>
            </div>
          ) : (
            /* ALL-TASKS LIST VIEW WITH CRUD */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.65rem', overflowY: 'auto', maxHeight: '380px' }}>
              {plan.tasks.map((task, idx) => (
                <div
                  key={task.id}
                  style={{
                    padding: '0.75rem',
                    background: task.completed ? 'var(--state-success-bg)' : 'var(--surface-bg)',
                    borderRadius: '8px',
                    border: `1px solid ${task.completed ? 'var(--state-success-border)' : 'var(--border-subtle)'}`,
                    opacity: task.skipped ? 0.6 : 1
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', flex: 1 }}>
                      <button
                        type="button"
                        onClick={() => toggleTaskCompletion(task.id)}
                        className="icon-btn"
                        style={{ padding: 0, width: '22px', height: '22px', marginTop: '2px', color: task.completed ? 'var(--accent-emerald)' : 'var(--text-muted)' }}
                        aria-label={task.completed ? 'Mark step incomplete' : 'Mark step complete'}
                      >
                        {task.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                      </button>

                      <div style={{ flex: 1 }}>
                        <span
                          style={{
                            fontSize: '0.88rem',
                            fontWeight: 600,
                            color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                            textDecoration: task.completed ? 'line-through' : 'none',
                            display: 'block'
                          }}
                        >
                          {task.title}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          ~{task.durationMinutes} min {task.skipped ? '• Skipped' : ''}
                        </span>

                        {/* Subtasks if broken down */}
                        {task.subtasks && task.subtasks.length > 0 && (
                          <div style={{ marginTop: '0.4rem', paddingLeft: '0.4rem', borderLeft: '2px solid var(--accent-cyan)' }}>
                            {task.subtasks.map((sub) => (
                              <div key={sub.id} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0' }}>
                                • {sub.title}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Task Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <button
                        type="button"
                        onClick={() => handleBreakIntoMicroActions(task.id)}
                        title="Break into 2-min actions"
                        className="icon-btn"
                        style={{ width: '24px', height: '24px', padding: 0 }}
                      >
                        <Split size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveTask(idx, 'up')}
                        disabled={idx === 0}
                        title="Move Up"
                        className="icon-btn"
                        style={{ width: '24px', height: '24px', padding: 0 }}
                      >
                        <ChevronUp size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveTask(idx, 'down')}
                        disabled={idx === plan.tasks.length - 1}
                        title="Move Down"
                        className="icon-btn"
                        style={{ width: '24px', height: '24px', padding: 0 }}
                      >
                        <ChevronDown size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTask(task.id)}
                        title="Delete Step"
                        className="icon-btn"
                        style={{ width: '24px', height: '24px', padding: 0 }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddCustomTask}
                className="btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.45rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', marginTop: '0.35rem' }}
              >
                <Plus size={14} />
                <span>Add Custom Step</span>
              </button>
            </div>
          )}
        </div>

      </section>

      {/* ACTIVE LEARNING MODALITIES SECTION */}
      <section className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent-purple)', letterSpacing: '0.06em' }}>
            Multi-Modal Formats
          </span>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0.25rem 0 0.35rem' }}>
            Choose How You Want to Engage Right Now
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
            Switch representations whenever you feel stuck or need a different sensory angle.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
          {[
            { id: 'visual', label: 'Visual Model', desc: 'Inspect interactive 2D organelle & simulation canvases.', icon: Layers, action: () => onLaunchVisualModel('human_cell') },
            { id: 'steps', label: 'Simple Steps', desc: 'Predictable 1-by-1 progression with no surprise jumps.', icon: ListOrdered, action: onNavigateLearn },
            { id: 'plain', label: 'Easy Read', desc: 'Short sentences, everyday words, and clear definitions.', icon: BookOpen, action: onNavigateLearn },
            { id: 'recall', label: 'Active Recall', desc: 'Prompt question before revealing the scientific fact.', icon: Award, action: () => setActiveRecallRevealed((v) => !v) },
            { id: 'flashcards', label: 'Flashcards', desc: 'Flip front-to-back memory cards with key terms.', icon: Lightbulb, action: onNavigateLearn },
            { id: 'teach', label: 'Teach It Back', desc: 'Explain the concept to yourself with guided hints.', icon: Sparkles, action: () => setTeachItBackSubmitted(false) }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                style={{
                  padding: '1rem',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-cyan)', marginBottom: '0.4rem' }}>
                    <Icon size={16} />
                    <strong style={{ fontSize: '0.95rem' }}>{item.label}</strong>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                    {item.desc}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={item.action}
                  style={{ alignSelf: 'flex-start', fontSize: '0.78rem', padding: '0.35rem 0.65rem', marginTop: '1rem' }}
                >
                  Try Now
                </button>
              </div>
            );
          })}
        </div>

        {/* ACTIVE RECALL EXPANDED DRAWER */}
        {activeRecallRevealed && (
          <div style={{ marginTop: '1.25rem', padding: '1rem', background: '#050811', borderRadius: '8px', border: '1px solid var(--accent-amber)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-amber)', textTransform: 'uppercase' }}>
              Active Recall Prompt
            </span>
            <p style={{ margin: '0.35rem 0 0.65rem', fontSize: '0.92rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              Question: What is the primary role of mitochondria and what high-energy molecule do they generate?
            </p>
            <div style={{ padding: '0.65rem', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--accent-emerald)' }}>
              Answer: Mitochondria produce ATP (Adenosine Triphosphate) through cellular respiration and oxidative phosphorylation on folded inner cristae membranes.
            </div>
          </div>
        )}

        {/* TEACH IT BACK PROMPT */}
        {!teachItBackSubmitted ? (
          <div style={{ marginTop: '1.25rem', padding: '1rem', background: '#050811', borderRadius: '8px', border: '1px solid var(--border-medium)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
              Teach It Back (Self-Explanation Challenge)
            </span>
            <p style={{ margin: '0.25rem 0 0.65rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Explain how a cell membrane protects the cell as if you were explaining it to a 10-year-old friend:
            </p>
            <textarea
              value={teachItBackText}
              onChange={(e) => setTeachItBackText(e.target.value)}
              placeholder="The cell membrane is like a security guard because..."
              rows={2}
              className="text-input"
              style={{ width: '100%', fontSize: '0.85rem', marginBottom: '0.5rem' }}
            />
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                if (teachItBackText.trim()) setTeachItBackSubmitted(true);
              }}
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
            >
              Check My Explanation
            </button>
          </div>
        ) : (
          <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '8px', border: '1px solid var(--accent-emerald)' }}>
            <strong style={{ fontSize: '0.88rem', color: 'var(--accent-emerald)', display: 'block' }}>
              Awesome explanation!
            </strong>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.35rem 0' }}>
              Your response: "{teachItBackText}"
            </p>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Key check: Did you mention boundary control and selective entry? Both match the scientific model.
            </span>
          </div>
        )}
      </section>

      {/* SKIPPABLE PERSONALIZATION SETUP MODAL */}
      {showSetupModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="setup-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '1rem'
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '540px',
              padding: '2rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-medium)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 id="setup-title" style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
                Personalize Your Study Space
              </h2>
              <button
                type="button"
                onClick={() => setShowSetupModal(false)}
                className="icon-btn"
                aria-label="Close setup modal"
              >
                <X size={16} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Choose what helps you focus best. You can change or reset these preferences anytime. All questions are completely optional.
            </p>

            {/* Question 1: Focus Duration */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.4rem' }}>
                Preferred focus interval:
              </label>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {[5, 10, 15, 25].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    className={`tag-btn ${setupPrefs.focusDuration === mins ? 'active' : ''}`}
                    onClick={() => setSetupPrefs((p) => ({ ...p, focusDuration: mins }))}
                    style={{ fontSize: '0.8rem', padding: '0.35rem 0.7rem' }}
                  >
                    {mins} minutes
                  </button>
                ))}
              </div>
            </div>

            {/* Question 2: Learning Format */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.4rem' }}>
                How do you learn best?
              </label>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {[
                  { id: 'visual', label: 'Interactive Diagrams' },
                  { id: 'steps', label: 'Step-by-Step' },
                  { id: 'plain', label: 'Short & Simple' },
                  { id: 'practice', label: 'Active Quizzing' },
                  { id: 'mixed', label: 'Mixed Formats' }
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    className={`tag-btn ${setupPrefs.learningFormat === fmt.id ? 'active' : ''}`}
                    onClick={() => setSetupPrefs((p) => ({ ...p, learningFormat: fmt.id }))}
                    style={{ fontSize: '0.8rem', padding: '0.35rem 0.7rem' }}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Question 3: Optional Supports */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                Optional study supports:
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={setupPrefs.enableFocusRuler}
                    onChange={(e) => setSetupPrefs((p) => ({ ...p, enableFocusRuler: e.target.checked }))}
                  />
                  <span>Focus reading ruler (highlights active line)</span>
                </label>
                <label style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={setupPrefs.movementBreaks}
                    onChange={(e) => setSetupPrefs((p) => ({ ...p, movementBreaks: e.target.checked }))}
                  />
                  <span>Gentle movement break reminder when timer finishes</span>
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  localStorage.setItem(LOCAL_STORAGE_SETUP_KEY, 'true');
                  setShowSetupModal(false);
                }}
                style={{ fontSize: '0.85rem' }}
              >
                Skip Setup
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleFinishSetup}
                style={{ fontSize: '0.85rem', padding: '0.55rem 1.15rem' }}
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
