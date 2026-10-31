import React, { useEffect, useRef, useState } from 'react';
import type {
  BiologyTopicId,
  LearningPreferences,
  LearningThemeId,
  ThemeGroupId
} from '@conceptlens/shared';
import {
  applyLearningTheme,
  learningThemeGroups,
  learningThemes,
  removeLearningTheme
} from '@conceptlens/shared';
import {
  Compass,
  Award,
  ArrowRight,
  Sparkles,
  Layers,
  BookOpen,
  Atom,
  FileText,
  Volume2,
  Sliders,
  ShieldCheck,
  X,
  Check
} from 'lucide-react';
import { MiloCompanion } from './MiloCompanion';

interface HomeViewProps {
  preferences: LearningPreferences;
  onPreferences?: (next: LearningPreferences) => void;
  onNavigateLearn: () => void;
  onNavigatePractice: () => void;
  onNavigateADHD?: () => void;
  onNavigateISL?: () => void;
  onNavigateAbout?: () => void;
  onOpenAccessibility?: () => void;
  _onLaunchTopic?: (topicId: BiologyTopicId) => void;
  onOpenPointerLie?: () => void;
  onAnnounce?: (message: string) => void;
  onOpenAtlas?: (mode?: any) => void;
}

type WayChoice = 'show' | 'words' | 'listen' | 'try' | 'focus' | 'calm';

const WAY_CHOICES: Array<{ id: WayChoice; label: string; detail: string }> = [
  { id: 'show', label: 'Visual Diagrams', detail: 'Opens interactive vector and structural models in Learn.' },
  { id: 'words', label: 'Plain Language Words', detail: 'Applies Easy Read explanations with everyday vocabulary.' },
  { id: 'listen', label: 'Listen to Explanations', detail: 'Enables audio overviews. Speech starts only when you click Listen.' },
  { id: 'try', label: 'Practice with My Material', detail: 'Opens Practice where you can paste or upload study notes.' },
  { id: 'focus', label: 'Help Me Focus', detail: 'Activates ADHD-Friendly study space with flexible focus timers.' },
  { id: 'calm', label: 'Keep Things Calm', detail: 'Applies low-stimulation styling with suppressed extra animations.' }
];

const THEME_FOR: Partial<Record<WayChoice, LearningThemeId>> = {
  show: 'visual-learning',
  words: 'easy-read',
  calm: 'low-stimulation'
};

function applyWayChoices(current: LearningPreferences, selected: WayChoice[]): LearningPreferences {
  let next = current;
  for (const choice of selected) {
    const theme = THEME_FOR[choice];
    if (theme) next = applyLearningTheme(next, theme);
  }
  if (selected.includes('listen')) next = { ...next, listenExplore: true };
  if (selected.includes('focus')) next = applyLearningTheme(next, 'adhd-friendly');
  if (selected.includes('words') && next.textScale === 'default') next = { ...next, textScale: 'large' };
  return next;
}

export const HomeView: React.FC<HomeViewProps> = ({
  preferences,
  onPreferences,
  onNavigateLearn,
  onNavigatePractice,
  onNavigateADHD,
  onNavigateISL,
  onNavigateAbout: _onNavigateAbout,
  onOpenAccessibility,
  _onLaunchTopic,
  onOpenPointerLie,
  onAnnounce,
  onOpenAtlas
}) => {
  // Interactive Lens Transformation Widget state (Demonstrating multi-representation continuity)
  const [activeLens, setActiveLens] = useState<'standard' | 'easy' | 'steps' | 'visual' | 'practice'>('easy');
  const [selectedNode, setSelectedNode] = useState<'head' | 'n2' | 'n3' | 'tail'>('head');
  void _onLaunchTopic;
  void _onNavigateAbout;

  // 18 Learning Supports Category Filter State (Defaults to 'focus' for clean, uncluttered layout)
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<'all' | ThemeGroupId>('focus');
  const themeGroups = learningThemeGroups();
  const allThemes = learningThemes();
  const visibleThemes =
    selectedGroupFilter === 'all'
      ? allThemes
      : allThemes.filter((t) => t.groupId === selectedGroupFilter);

  // Dynamic Scroll-Driven Animation Observer
  useEffect(() => {
    const reduceMotion = preferences.lowStimulation ||
      (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const targets = document.querySelectorAll('.reveal-on-scroll');

    if (reduceMotion || typeof IntersectionObserver === 'undefined') {
      targets.forEach((el) => el.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [preferences.lowStimulation]);

  // Way-Finder Dialog state
  const [wayFinderOpen, setWayFinderOpen] = useState(false);
  const [selectedWays, setSelectedWays] = useState<WayChoice[]>([]);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const openWayFinder = (source: HTMLButtonElement | null) => {
    openerRef.current = source;
    setWayFinderOpen(true);
  };

  const closeWayFinder = () => {
    setWayFinderOpen(false);
    openerRef.current?.focus();
  };

  const toggleChoice = (id: WayChoice) => {
    setSelectedWays((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const handleApplyWays = () => {
    if (onPreferences && selectedWays.length > 0) {
      const next = applyWayChoices(preferences, selectedWays);
      onPreferences(next);
      onAnnounce?.(`Applied ${selectedWays.length} personalized learning preferences.`);
    }
    closeWayFinder();
    if (selectedWays.includes('try')) {
      onNavigatePractice();
    } else if (selectedWays.includes('focus')) {
      onNavigateADHD ? onNavigateADHD() : onNavigateLearn();
    } else {
      onNavigateLearn();
    }
  };

  // Keyboard trap for Way-Finder modal dialog
  useEffect(() => {
    if (!wayFinderOpen) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusables = dialog.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    first?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeWayFinder();
        return;
      }
      if (event.key !== 'Tab') return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [wayFinderOpen]);

  return (
    <div className="home-view" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* ACCESSIBLE NAVIGATION SHORTCUT NOTICE */}
      <div
        className="nav-shortcut-bar"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.5rem 1rem',
          background: 'var(--surface-bg)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.82rem',
          color: 'var(--text-secondary)',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="tag-btn"
            onClick={() => window.dispatchEvent(new CustomEvent('conceptlens:open-guide', { detail: { mode: 'navigate' } }))}
            style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}
          >
            Open navigation guide
          </button>
          <span>· Press <kbd style={{ padding: '0.1rem 0.35rem', background: 'var(--surface-elevated)', borderRadius: '4px', border: '1px solid var(--border-medium)', fontFamily: 'var(--font-mono)' }}>Shift+G</kbd> to inspect page landmarks and describe focus.</span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            type="button"
            className="tag-btn"
            onClick={() => onOpenAccessibility?.()}
            style={{ fontSize: '0.78rem' }}
          >
            Accessibility Lens
          </button>
        </div>
      </div>

      {/* 1. HERO SECTION: ART-DIRECTED & EDITORIAL */}
      <section
        className="glass-panel hero-section"
        style={{
          padding: 'clamp(2rem, 4vw, 3.5rem) clamp(1.5rem, 3.5vw, 2.75rem)',
          borderRadius: 'var(--radius-lg)',
          position: 'relative',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 0.95fr)',
          gap: '2.5rem',
          alignItems: 'start'
        }}
        aria-labelledby="hero-title"
      >
        {/* Left Column: Vision & Primary Action Hierarchy */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Eyebrow & Belonging Banner */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.55rem',
              alignSelf: 'flex-start',
              padding: '0.35rem 0.95rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(29, 106, 159, 0.08)',
              border: '1px solid rgba(29, 106, 159, 0.22)',
              color: 'var(--accent-cyan)',
              fontSize: '0.82rem',
              fontWeight: 700,
              letterSpacing: '0.04em'
            }}
          >
            <Sparkles size={14} aria-hidden="true" />
            <span>Science, mathematics, and computing</span>
          </div>

          <h1
            id="hero-title"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.2rem, 3.8vw, 3.3rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.025em',
              margin: 0,
              color: 'var(--text-primary)'
            }}
          >
            You Belong Here. Just As You Are.
          </h1>

          <p
            style={{
              fontSize: '1.05rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.65,
              margin: 0,
              maxWidth: '38rem'
            }}
          >
            Your mind has its own way. Education should make room for everyone. Open a lesson, then change how it is shown: plainer words, one step at a time, larger type, or speech you start yourself.
          </p>

          {/* Action Button Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              flexWrap: 'wrap',
              marginTop: '0.5rem'
            }}
          >
            <button
              type="button"
              ref={openerRef}
              className="btn-primary"
              onClick={() => openWayFinder(openerRef.current)}
              style={{
                fontSize: '1.02rem',
                padding: '0.75rem 1.6rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.55rem',
                fontWeight: 700,
                minHeight: '46px'
              }}
            >
              <Sliders size={18} aria-hidden="true" />
              <span>Find Your Way to Learn</span>
            </button>

            <a
              href="#mission"
              className="btn-secondary"
              style={{
                fontSize: '0.98rem',
                padding: '0.75rem 1.35rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 600,
                minHeight: '46px',
                textDecoration: 'none'
              }}
            >
              <Award size={18} color="var(--accent-amber)" aria-hidden="true" />
              <span>Our Mission</span>
            </a>

            <button
              type="button"
              className="btn-secondary"
              onClick={onNavigateLearn}
              style={{
                fontSize: '0.95rem',
                padding: '0.75rem 1.25rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 600,
                minHeight: '46px'
              }}
            >
              <Compass size={17} aria-hidden="true" />
              <span>Start Exploring</span>
              <ArrowRight size={16} aria-hidden="true" />
            </button>

            {onNavigateADHD && (
              <button
                type="button"
                className="btn-secondary"
                onClick={onNavigateADHD}
                style={{
                  fontSize: '0.92rem',
                  padding: '0.75rem 1.15rem',
                  fontWeight: 600,
                  minHeight: '46px'
                }}
              >
                <span>ADHD-Friendly Learning</span>
              </button>
            )}

            <button
              type="button"
              className="btn-secondary"
              onClick={onNavigatePractice}
              style={{
                fontSize: '0.92rem',
                padding: '0.75rem 1.15rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontWeight: 600,
                minHeight: '46px'
              }}
            >
              <FileText size={16} color="var(--accent-amber)" aria-hidden="true" />
              <span>Practice with My Notes</span>
            </button>
          </div>
        </div>

        {/* Right Column: Interactive Multi-Representation Preview Card */}
        <div
          className="glass-panel hero-interactive-card"
          style={{
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)'
          }}
          aria-label="Interactive preview of multi-representation learning"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                Same idea, another way
              </span>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0.2rem 0 0', color: 'var(--text-primary)' }}>
                A singly linked list, shown a few ways
              </h2>
            </div>

            <button
              type="button"
              className="tag-btn"
              onClick={() => {
                if (onOpenPointerLie) onOpenPointerLie(); else if (onOpenAtlas) onOpenAtlas(); else onNavigateLearn();
              }}
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
            >
              <span>Explore the Living Atlas →</span>
            </button>
          </div>

          {/* 5 Lens Switcher Tabs */}
          <div
            role="tablist"
            aria-label="Choose presentation lens"
            style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}
          >
            {[
              { id: 'standard', label: 'Standard Read', icon: BookOpen },
              { id: 'easy', label: 'Easy Read', icon: Sparkles },
              { id: 'steps', label: 'Steps', icon: Layers },
              { id: 'visual', label: 'Visual Model', icon: Atom },
              { id: 'practice', label: 'Check Question', icon: Award }
            ].map((lens) => {
              const Icon = lens.icon;
              const isActive = activeLens === lens.id;
              return (
                <button
                  key={lens.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`tag-btn ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setActiveLens(lens.id as any);
                    onAnnounce?.(`Switched preview to ${lens.label}`);
                  }}
                  style={{
                    fontSize: '0.78rem',
                    padding: '0.35rem 0.65rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontWeight: isActive ? 700 : 500,
                    background: isActive ? 'var(--accent-cyan)' : undefined,
                    color: isActive ? '#ffffff' : undefined,
                    borderColor: isActive ? 'var(--accent-cyan)' : undefined
                  }}
                >
                  <Icon size={13} aria-hidden="true" />
                  <span>{lens.label}</span>
                </button>
              );
            })}
          </div>

          {/* Lens Content Presentation */}
          <div
            style={{
              padding: '1.1rem',
              background: 'var(--surface-elevated)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              minHeight: '160px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            {activeLens === 'standard' && (
              <div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  A singly linked list is a linear data structure consisting of discrete nodes where each node contains an element and a pointer reference to the subsequent node. Sequential traversal requires O(n) operations, and structural invariants mandate that every node is reachable from the head without unannounced closed cycles.
                </p>
                <div style={{ marginTop: '0.65rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Lens: Academic computer science register with formal invariant specifications.
                </div>
              </div>
            )}

            {activeLens === 'easy' && (
              <div>
                <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                  Think of a linked list like a treasure hunt or a train of cars. Each car holds its cargo and has a hook pointing to the next car behind it. If a car hooks backward into an earlier car, it creates a closed loop that traps anyone walking through it.
                </p>
                <div style={{ marginTop: '0.65rem', fontSize: '0.78rem', color: 'var(--accent-cyan)' }}>
                  Plain words. The structure of the list stays the same.
                </div>
              </div>
            )}

            {activeLens === 'steps' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <div><strong style={{ color: 'var(--accent-cyan)' }}>Stage 1:</strong> Traverse the list starting at the head node with slow and fast pointers.</div>
                <div><strong style={{ color: 'var(--accent-cyan)' }}>Stage 2:</strong> Advance the slow pointer by 1 node and the fast pointer by 2 nodes per cycle.</div>
                <div><strong style={{ color: 'var(--accent-cyan)' }}>Stage 3:</strong> If fast meets null, the structure is verified acyclic and safe for reversal.</div>
                <div><strong style={{ color: 'var(--accent-cyan)' }}>Stage 4:</strong> If fast meets slow, an unannounced cycle is proven and the closing edge is flagged for repair.</div>
              </div>
            )}

            {activeLens === 'visual' && (
              <div>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.65rem' }}>
                  {[
                    { id: 'head', label: 'Node 10 (Head)' },
                    { id: 'n2', label: 'Node 20' },
                    { id: 'n3', label: 'Node 30' },
                    { id: 'tail', label: 'Node 40 (Tail)' }
                  ].map((nd) => (
                    <button
                      key={nd.id}
                      type="button"
                      className={`tag-btn ${selectedNode === nd.id ? 'active' : ''}`}
                      onClick={() => setSelectedNode(nd.id as any)}
                      style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                    >
                      {nd.label}
                    </button>
                  ))}
                </div>

                <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {selectedNode === 'head' && (
                    <p style={{ margin: 0 }}><strong>Node 10 (Head):</strong> Memory Address 0x100. Stores value 10 and forward pointer next pointing to Node 20. Verified reachable from head.</p>
                  )}
                  {selectedNode === 'n2' && (
                    <p style={{ margin: 0 }}><strong>Node 20:</strong> Memory Address 0x140. Stores value 20 and forward pointer next pointing to Node 30. Acyclic transit node.</p>
                  )}
                  {selectedNode === 'n3' && (
                    <p style={{ margin: 0 }}><strong>Node 30:</strong> Memory Address 0x180. Stores value 30 and forward pointer next pointing to Node 40.</p>
                  )}
                  {selectedNode === 'tail' && (
                    <p style={{ margin: 0 }}><strong>Node 40 (Tail):</strong> Memory Address 0x1C0. Stores value 40 and terminal pointer next pointing to NULL. Confirms bounded list termination.</p>
                  )}
                </div>
              </div>
            )}

            {activeLens === 'practice' && (
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-amber)', marginBottom: '0.25rem' }}>
                  Sample Practice Prompt · ISC / GATE Computer Science
                </div>
                <p style={{ margin: '0 0 0.5rem', fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  In Floyd's Cycle-Finding Algorithm (Tortoise and Hare), what does it indicate when the fast pointer reaches NULL?
                </p>
                <div style={{ fontSize: '0.82rem', color: 'var(--accent-mint)', fontWeight: 600 }}>
                  ✓ The list is strictly acyclic with no closed loops (Safe for reversal).
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. DEDICATED SECTION: 18 WAYS TO MAKE LEARNING FEEL MORE LIKE YOURS */}
      <section
        className="glass-panel eighteen-ways-section"
        style={{
          padding: 'clamp(1.75rem, 3.5vw, 2.75rem) clamp(1.25rem, 3vw, 2.25rem)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          border: '1px solid var(--border-subtle)'
        }}
        aria-labelledby="eighteen-ways-title"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.25rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(56, 189, 248, 0.1)',
                color: 'var(--accent-cyan)',
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '0.5rem'
              }}
            >
              <ShieldCheck size={14} aria-hidden="true" />
              <span>{allThemes.length} interface themes</span>
            </div>
            <h2
              id="eighteen-ways-title"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.5rem, 2.8vw, 2.2rem)',
                fontWeight: 800,
                lineHeight: 1.2,
                margin: '0 0 0.5rem',
                color: 'var(--text-primary)'
              }}
            >
              Make the lesson fit the way you learn
            </h2>
            <p
              style={{
                fontSize: '0.95rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                maxWidth: '46rem',
                margin: 0
              }}
            >
              There are {allThemes.length} theme cards. Turning one on can change the words, the type, the motion, or whether speech is offered. A few only record a preference or repeat another theme. Reset them any time from Accessibility Themes. None of this stores a diagnosis.
            </p>
          </div>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => onOpenAccessibility?.()}
            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', alignSelf: 'flex-start' }}
          >
            <Sliders size={15} style={{ marginRight: '0.4rem' }} />
            <span>Customize My Preferences</span>
          </button>
        </div>

        {/* Category Filter Tabs: All (18), Focus & Cognitive, Vision, Hearing & Motor, Pace & Preferences */}
        <div
          role="tablist"
          aria-label="Filter learning themes by category"
          style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}
        >
          <button
            type="button"
            role="tab"
            aria-selected={selectedGroupFilter === 'all'}
            className={`tag-btn ${selectedGroupFilter === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedGroupFilter('all')}
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', fontWeight: selectedGroupFilter === 'all' ? 700 : 500 }}
          >
            <span>All themes ({allThemes.length})</span>
          </button>
          {themeGroups.map((group) => {
            const isActive = selectedGroupFilter === group.id;
            return (
              <button
                key={group.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`tag-btn ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedGroupFilter(group.id)}
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', fontWeight: isActive ? 700 : 500 }}
              >
                <span>{group.title} ({group.themes.length})</span>
              </button>
            );
          })}
        </div>

        {/* 18 Themes Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem'
          }}
        >
          {visibleThemes.map((theme) => {
            const isApplied = preferences.activeThemes.includes(theme.id);
            return (
              <div
                key={theme.id}
                className="glass-panel"
                style={{
                  padding: '1.15rem 1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.85rem',
                  border: isApplied ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  background: isApplied ? 'rgba(56, 189, 248, 0.05)' : 'var(--surface-elevated)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'var(--accent-cyan)'
                      }}
                    >
                      {theme.iconLabel} · {theme.groupId.toUpperCase()}
                    </span>
                    {isApplied && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: 'var(--accent-mint)',
                          background: 'rgba(16, 185, 129, 0.12)',
                          padding: '0.1rem 0.45rem',
                          borderRadius: 'var(--radius-full)'
                        }}
                      >
                        <Check size={11} />
                        <span>Active</span>
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.35rem', color: 'var(--text-primary)' }}>
                    {theme.title}
                  </h3>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                    {theme.description}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <button
                    type="button"
                    className={isApplied ? 'tag-btn active' : 'tag-btn'}
                    aria-pressed={isApplied}
                    onClick={() => {
                      if (!onPreferences) return;
                      const next = isApplied
                        ? removeLearningTheme(preferences, theme.id)
                        : applyLearningTheme(preferences, theme.id);
                      onPreferences(next);
                      onAnnounce?.(isApplied ? `Turned off ${theme.title}.` : `Turned on ${theme.title}.`);
                    }}
                    style={{ fontSize: '0.78rem', padding: '0.25rem 0.65rem', fontWeight: 600 }}
                  >
                    <span>{isApplied ? 'Turn off' : 'Enable support'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onPreferences) {
                        const next = applyLearningTheme(preferences, theme.id);
                        onPreferences(next);
                      }
                      if (theme.id === 'adhd-friendly' && onNavigateADHD) {
                        onNavigateADHD();
                      } else if (theme.id === 'deaf-friendly' && onNavigateISL) {
                        onNavigateISL();
                      } else {
                        onNavigateLearn();
                      }
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: 'var(--accent-cyan)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <span>Try in Lesson</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. CORE LEARNING PATHS: STRUCTURED, COHESIVE, ART-DIRECTED */}
      <section className="learning-paths-section" aria-labelledby="paths-title">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: 'var(--accent-cyan)' }}>
              Curated Curriculum & Workspaces
            </span>
            <h2 id="paths-title" style={{ fontFamily: 'var(--font-display)', fontSize: '1.65rem', fontWeight: 700, margin: '0.25rem 0 0' }}>
              Choose a Learning Pathway
            </h2>
          </div>

          <button
            type="button"
            className="btn-secondary"
            onClick={onNavigateLearn}
            style={{ fontSize: '0.85rem', padding: '0.45rem 0.9rem' }}
          >
            <span>Browse All Subjects</span>
            <ArrowRight size={15} style={{ marginLeft: '0.35rem' }} />
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem'
          }}
        >
          {/* Path 1: Living Biology Atlas */}
          <div
            className="glass-panel"
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1rem',
              borderTop: '4px solid var(--accent-cyan)'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ display: 'inline-flex', padding: '0.35rem', borderRadius: 'var(--radius-sm)', background: 'rgba(29, 106, 159, 0.1)', color: 'var(--accent-cyan)' }}>
                  <Layers size={18} aria-hidden="true" />
                </span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-cyan)' }}>
                  Computer Science & Algorithms
                </span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.4rem' }}>
                Pointer Invariants & Cycle Detection
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                Interactive linked list proofs, cycle detection via Floyd's algorithm, and pointer reversal. We will not teach a structure we cannot prove.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  if (onOpenPointerLie) onOpenPointerLie(); else onNavigateLearn();
                }}
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
              >
                Pointer Lie Lesson →
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  if (onOpenAtlas) onOpenAtlas(); else onNavigateLearn();
                }}
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}
              >
                Explore the Living Atlas
              </button>
            </div>
          </div>

          {/* Path 2: Physical Dynamics & Optics */}
          <div
            className="glass-panel"
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1rem',
              borderTop: '4px solid var(--accent-mint)'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ display: 'inline-flex', padding: '0.35rem', borderRadius: 'var(--radius-sm)', background: 'rgba(5, 150, 105, 0.1)', color: '#047857' }}>
                  <Atom size={18} aria-hidden="true" />
                </span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#047857' }}>
                  Physics & Optics
                </span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.4rem' }}>
                Optics & Harmonic Physics
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                Interactive Gaussian Ray Optics calculation (1/f = 1/v - 1/u) with adjustable focal lengths, real vs. virtual image ray tracing, and Simple Harmonic Pendulum conservation of energy.
              </p>
            </div>

            <button
              type="button"
              className="btn-secondary"
              onClick={onNavigateLearn}
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem', alignSelf: 'flex-start' }}
            >
              <span>Open Physics Labs →</span>
            </button>
          </div>

          {/* Path 3: Practice with My Notes (PYQ Bank) */}
          <div
            className="glass-panel"
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1rem',
              borderTop: '4px solid #818cf8'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ display: 'inline-flex', padding: '0.35rem', borderRadius: 'var(--radius-sm)', background: 'rgba(129, 140, 248, 0.1)', color: '#4338ca' }}>
                  <FileText size={18} aria-hidden="true" />
                </span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#4338ca' }}>
                  Exam Intelligence
                </span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.4rem' }}>
                Authentic Exam Practice
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                Practice with real board and university examination questions from ISC, CBSE, Anna University, and GATE. Upload textbook PDFs (including password-protected PDFs) or paste notes.
              </p>
            </div>

            <button
              type="button"
              className="btn-secondary"
              onClick={onNavigatePractice}
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem', alignSelf: 'flex-start' }}
            >
              <span>Start Practice Session →</span>
            </button>
          </div>

          {/* Path 5: Authentic Indian Sign Language Catalog */}
          <div
            className="glass-panel"
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1rem',
              borderTop: '4px solid #c084fc'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ display: 'inline-flex', padding: '0.35rem', borderRadius: 'var(--radius-sm)', background: 'rgba(192, 132, 252, 0.1)', color: '#6d28d9' }}>
                  <Volume2 size={18} aria-hidden="true" />
                </span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#6d28d9' }}>
                  Accessible Classroom
                </span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.4rem' }}>
                Authentic ISL Curriculum
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                Science and mathematics videos in Indian Sign Language, plus dictionary folders from the Indian Sign Language Research and Training Centre (ISLRTC). Playback depends on YouTube and your connection.
              </p>
            </div>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => onNavigateISL ? onNavigateISL() : onNavigateLearn()}
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem', alignSelf: 'flex-start' }}
            >
              <span>Explore ISL Catalog →</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4. MILO: THOUGHTFUL LEARNING COMPANION */}
      <MiloCompanion />

      {/* 5. MISSION & ACCESSIBLE ARCHITECTURE (SDG 4) */}
      <section
        id="mission"
        className="glass-panel mission-section"
        style={{
          padding: '2.25rem 2rem',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}
        aria-labelledby="mission-title"
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', alignSelf: 'flex-start' }}>
          <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: '#047857' }}>
            Section D · UN Sustainable Development Goal 4
          </span>
        </div>

        <h2
          id="mission-title"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.5rem, 2.5vw, 2.1rem)',
            fontWeight: 700,
            lineHeight: 1.25,
            margin: 0
          }}
        >
          Education that includes everyone
        </h2>

        <p style={{ fontSize: '0.98rem', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '48rem', margin: 0 }}>
          UN Sustainable Development Goal 4 asks for quality education that reaches people who are left out. ConceptLens is one attempt to make learning content genuinely adaptable: another explanation when the first one fails, accessibility built into the product rather than treated as an afterthought, and room to explore without being labeled or diagnosed.
        </p>

        <ul style={{ paddingLeft: '1.25rem', margin: '0.25rem 0', color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.8, maxWidth: '44rem' }}>
          <li>Different explanations and reading levels must be available when the first one does not work.</li>
          <li>Accessibility belongs in the core learning architecture, not behind marketing promises.</li>
          <li>Learners must be empowered to explore without storing medical diagnoses or tracking abilities.</li>
        </ul>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '48rem', margin: 0 }}>
          Learning that keeps moving. ConceptLens can use configured AI services when available and fall back to deterministic local behavior for supported tasks when a service is unavailable.
        </p>
      </section>

      {/* 6. CLOSING STATEMENT & PRIMARY INVITATION */}
      <section
        className="glass-panel close-section"
        style={{
          padding: '2.5rem 2rem',
          textAlign: 'center',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}
        aria-labelledby="close-title"
      >
        <h2
          id="close-title"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.6rem, 2.6vw, 2.3rem)',
            fontWeight: 800,
            margin: 0
          }}
        >
          Your next discovery starts here.
        </h2>

        <p
          style={{
            fontSize: '1.02rem',
            color: 'var(--text-secondary)',
            maxWidth: '38rem',
            lineHeight: 1.6,
            margin: 0
          }}
        >
          Choose something you are curious about. Start with what you know, explore it your way, and move forward one step at a time. Your learning journey should move with you.
        </p>

        <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
          <button
            type="button"
            className="btn-primary"
            onClick={onNavigateLearn}
            style={{
              fontSize: '1.02rem',
              padding: '0.75rem 1.75rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.55rem',
              fontWeight: 700
            }}
          >
            <span>Start Exploring</span>
            <ArrowRight size={18} aria-hidden="true" />
          </button>

          <button
            type="button"
            ref={closeButtonRef}
            className="btn-secondary"
            onClick={() => openWayFinder(closeButtonRef.current)}
            style={{
              fontSize: '0.98rem',
              padding: '0.75rem 1.4rem',
              fontWeight: 600
            }}
          >
            <span>Find My Way to Learn</span>
          </button>
        </div>
      </section>

      {/* 7. EDITORIAL ACCESSIBLE FOOTER */}
      <footer
        className="home-footer"
        style={{
          padding: '1.75rem 1rem 1rem',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
          fontSize: '0.82rem',
          color: 'var(--text-muted)',
          alignItems: 'center',
          textAlign: 'center'
        }}
      >
        <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-secondary)' }}>
          ConceptLens — The Living Learning Atlas
        </p>
        <p style={{ margin: 0, maxWidth: '42rem' }}>
          Aligned with UN SDG 4 (Quality Education). Keyboard accessibility: <kbd style={{ padding: '0.1rem 0.3rem', background: 'var(--surface-elevated)', borderRadius: '3px', border: '1px solid var(--border-medium)', fontFamily: 'var(--font-mono)' }}>Shift+G</kbd> for Navigation Guide, <kbd style={{ padding: '0.1rem 0.3rem', background: 'var(--surface-elevated)', borderRadius: '3px', border: '1px solid var(--border-medium)', fontFamily: 'var(--font-mono)' }}>?</kbd> for Shortcuts, <kbd style={{ padding: '0.1rem 0.3rem', background: 'var(--surface-elevated)', borderRadius: '3px', border: '1px solid var(--border-medium)', fontFamily: 'var(--font-mono)' }}>Tab</kbd> to navigate.
        </p>
      </footer>

      {/* 8. WAY-FINDER ACCESSIBLE MODAL DIALOG */}
      {wayFinderOpen && (
        <div
          className="dialog-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1050,
            padding: '1rem'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeWayFinder();
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="wayfinder-title"
            className="wayfinder-dialog"
            style={{
              background: 'var(--surface-bg)',
              border: '1.5px solid var(--border-medium)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '36rem',
              width: '100%',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-elevated)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.15rem',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sliders size={20} color="var(--accent-cyan)" aria-hidden="true" />
                <h2 id="wayfinder-title" style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                  Find My Way to Learn
                </h2>
              </div>
              <button
                type="button"
                className="tag-btn"
                onClick={closeWayFinder}
                aria-label="Close dialog"
                style={{ padding: '0.35rem 0.5rem' }}
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Choose how you want information presented. You can combine visual diagrams, easier words, audio, or calm styling. These preferences apply immediately and can be reset at any time.
            </p>

            <fieldset style={{ border: 0, margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <legend style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Select Presentation Modes
              </legend>

              {WAY_CHOICES.map((choice) => {
                const checked = selectedWays.includes(choice.id);
                return (
                  <label
                    key={choice.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '0.75rem 0.9rem',
                      background: checked ? 'rgba(29, 106, 159, 0.08)' : 'var(--surface-elevated)',
                      border: checked ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleChoice(choice.id)}
                      style={{ marginTop: '0.2rem', accentColor: 'var(--accent-cyan)' }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                      <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                        {choice.label}
                      </strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {choice.detail}
                      </span>
                    </div>
                  </label>
                );
              })}
            </fieldset>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={closeWayFinder}
                style={{ fontSize: '0.88rem', padding: '0.5rem 1rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleApplyWays}
                style={{ fontSize: '0.88rem', padding: '0.5rem 1.25rem', fontWeight: 600 }}
              >
                Apply & Open Workspace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeView;
