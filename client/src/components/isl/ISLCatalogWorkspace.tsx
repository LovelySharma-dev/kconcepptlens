import React, { useState, useMemo } from 'react';
import {
  Search,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Clock,
  VideoOff,
  BookOpen,
  Filter,
  CheckCircle2,
  Info,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  AUTHENTIC_ISL_CURRICULUM_CATALOG,
  filterISLCatalog
} from '../../data/islLessons';
import type { ISLCatalogEntry, ISLCategory, ISLAvailabilityState } from '@conceptlens/shared';

interface ISLCatalogWorkspaceProps {
  onAnnounce?: (msg: string) => void;
  onOpenKeyboardShortcuts?: () => void;
}

const CATEGORY_LABELS: Record<ISLCategory | 'all', string> = {
  all: 'All Categories',
  biology: 'Biology',
  computer_science: 'Computer Science',
  physics: 'Physics',
  mathematics: 'Mathematics',
  general_science: 'General Science'
};

const AVAILABILITY_LABELS: Record<ISLAvailabilityState | 'all', string> = {
  all: 'All Statuses',
  official_external: 'Official ISLRTC Portal',
  verified_in_app: 'Verified In-App',
  pending_review: 'Under Review',
  unavailable: 'In Development'
};

export const ISLCatalogWorkspace: React.FC<ISLCatalogWorkspaceProps> = ({
  onAnnounce
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ISLCategory | 'all'>('all');
  const [selectedAvailability, setSelectedAvailability] = useState<ISLAvailabilityState | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLessonId, setSelectedLessonId] = useState<string>(
    AUTHENTIC_ISL_CURRICULUM_CATALOG[0]?.lessonId || ''
  );

  const filteredLessons = useMemo(() => {
    return filterISLCatalog({
      category: selectedCategory,
      availability: selectedAvailability,
      searchQuery
    });
  }, [selectedCategory, selectedAvailability, searchQuery]);

  const activeLesson: ISLCatalogEntry | undefined = useMemo(() => {
    return (
      filteredLessons.find((l) => l.lessonId === selectedLessonId) ||
      filteredLessons[0] ||
      AUTHENTIC_ISL_CURRICULUM_CATALOG[0]
    );
  }, [filteredLessons, selectedLessonId]);

  const handleSelectLesson = (lesson: ISLCatalogEntry) => {
    setSelectedLessonId(lesson.lessonId);
    onAnnounce?.(`Selected ISL lesson: ${lesson.title}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header and Integrity Notice */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: 'var(--accent-cyan)',
                  background: 'rgba(56, 189, 248, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  padding: '0.2rem 0.55rem',
                  borderRadius: 'var(--radius-sm)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
              >
                <ShieldCheck size={13} /> Authentic ISL Catalog
              </span>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: 'var(--state-success-text)',
                  background: 'var(--state-success-bg)',
                  border: '1px solid var(--state-success-border)',
                  padding: '0.2rem 0.5rem',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                Zero Synthetic Hallucinations
              </span>
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0 0 0.35rem', color: '#f8fafc' }}>
              Indian Sign Language (ISL) Curriculum Catalog
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, maxWidth: '52rem', lineHeight: 1.5 }}>
              ConceptLens links directly to authoritative educational sign language videos from the <strong>Indian Sign Language Research and Training Centre (ISLRTC)</strong> and NCERT. In accordance with strict ethical standards, we never fabricate signs or generate synthetic signing avatars.
            </p>
          </div>

          <a
            href="https://islrtc.nic.in/science-concept-video/"
            target="_blank"
            rel="noreferrer noopener"
            className="btn-secondary"
            style={{ fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}
          >
            <span>Visit ISLRTC Official Portal</span>
            <ExternalLink size={14} />
          </a>
        </div>

        {/* Filter Controls Row */}
        <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Search bar */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '36rem' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search concepts, topics, or learning objectives (e.g., cell, binary, motion)..."
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                fontSize: '0.85rem',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
              aria-label="Search ISL curriculum concepts"
            />
          </div>

          {/* Category & Status Pills */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginRight: '0.25rem' }}>
                <Layers size={13} /> Subject:
              </span>
              {(['all', 'biology', 'computer_science', 'physics', 'mathematics'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`btn-secondary ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.6rem',
                    background: selectedCategory === cat ? 'rgba(56, 189, 248, 0.18)' : undefined,
                    borderColor: selectedCategory === cat ? 'var(--accent-cyan)' : undefined,
                    color: selectedCategory === cat ? '#f8fafc' : undefined
                  }}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginRight: '0.25rem' }}>
                <Filter size={13} /> Availability:
              </span>
              {(['all', 'official_external', 'pending_review', 'unavailable'] as const).map((avail) => (
                <button
                  key={avail}
                  type="button"
                  className={`btn-secondary ${selectedAvailability === avail ? 'active' : ''}`}
                  onClick={() => setSelectedAvailability(avail)}
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.6rem',
                    background: selectedAvailability === avail ? 'rgba(192, 132, 252, 0.18)' : undefined,
                    borderColor: selectedAvailability === avail ? '#c084fc' : undefined,
                    color: selectedAvailability === avail ? '#f8fafc' : undefined
                  }}
                >
                  {AVAILABILITY_LABELS[avail]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column View: Catalog List & Detail Viewer */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) minmax(360px, 1.8fr)', gap: '1.25rem', alignItems: 'start' }}>
        {/* Left Column: Lesson Cards List */}
        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '720px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Curriculum Lessons ({filteredLessons.length})
            </span>
          </div>

          {filteredLessons.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>No lessons match your filters.</p>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedAvailability('all');
                  setSearchQuery('');
                }}
                style={{ marginTop: '0.75rem', fontSize: '0.78rem' }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredLessons.map((lesson) => {
              const isSelected = activeLesson?.lessonId === lesson.lessonId;
              return (
                <button
                  key={lesson.lessonId}
                  type="button"
                  onClick={() => handleSelectLesson(lesson)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '0.35rem',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                    background: isSelected ? 'rgba(56, 189, 248, 0.1)' : 'rgba(15, 23, 42, 0.4)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'border-color 0.15s ease, background 0.15s ease'
                  }}
                  aria-pressed={isSelected}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-cyan)' }}>
                      {CATEGORY_LABELS[lesson.category]}
                    </span>
                    {lesson.availabilityState === 'official_external' && (
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent-cyan)', background: 'rgba(56, 189, 248, 0.12)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                        ISLRTC Official
                      </span>
                    )}
                    {lesson.availabilityState === 'pending_review' && (
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--state-warning-text)', background: 'var(--state-warning-bg)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                        Under Review
                      </span>
                    )}
                    {lesson.availabilityState === 'unavailable' && (
                      <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', background: 'rgba(148, 163, 184, 0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                        In Development
                      </span>
                    )}
                  </div>
                  <strong style={{ fontSize: '0.88rem', color: '#f8fafc', lineHeight: 1.3 }}>
                    {lesson.concept}
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {lesson.title}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Right Column: Selected Lesson Detail View */}
        {activeLesson && (
          <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Title & Status Bar */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-cyan)', background: 'rgba(56, 189, 248, 0.12)', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
                  {CATEGORY_LABELS[activeLesson.category]}
                </span>
                {activeLesson.availabilityState === 'official_external' && (
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-cyan)', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-sm)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <ShieldCheck size={13} /> ISLRTC Verified Resource
                  </span>
                )}
                {activeLesson.availabilityState === 'pending_review' && (
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--state-warning-text)', background: 'var(--state-warning-bg)', border: '1px solid var(--state-warning-border)', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-sm)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <AlertTriangle size={13} /> Awaiting Master-Trainer Review
                  </span>
                )}
                {activeLesson.availabilityState === 'unavailable' && (
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', background: 'rgba(148, 163, 184, 0.1)', border: '1px solid var(--border-subtle)', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-sm)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={13} /> Authentic Video in Development
                  </span>
                )}
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.35rem', color: '#f8fafc' }}>
                {activeLesson.title}
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                Concept Focus: <strong style={{ color: '#e2e8f0' }}>{activeLesson.concept}</strong>
              </p>
            </div>

            {/* Media / Action Area */}
            <div
              style={{
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: '1px solid var(--border-medium)',
                background: '#020617',
                padding: '1.25rem'
              }}
            >
              {activeLesson.availabilityState === 'official_external' && activeLesson.externalUrl && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div style={{ padding: '0.5rem', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-cyan)' }}>
                      <Sparkles size={22} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.25rem', color: '#f8fafc' }}>
                        Official Indian Sign Language Video Available
                      </h4>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                        This authentic educational video was recorded and published by the Government of India’s <strong>Indian Sign Language Research and Training Centre (ISLRTC)</strong>. In compliance with copyright and fair educational dissemination, ConceptLens directs you directly to the official repository.
                      </p>
                    </div>
                  </div>

                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <a
                      href={activeLesson.externalUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="btn-primary"
                      style={{
                        fontSize: '0.85rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        textDecoration: 'none',
                        padding: '0.5rem 1rem'
                      }}
                    >
                      <span>Open Video on Official ISLRTC Directory</span>
                      <ExternalLink size={15} />
                    </a>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Opens official Government of India portal in a secure window
                    </span>
                  </div>
                </div>
              )}

              {activeLesson.availabilityState === 'pending_review' && (
                <div style={{ padding: '1rem', textAlign: 'center' }}>
                  <AlertTriangle size={32} style={{ color: 'var(--state-warning-text)', marginBottom: '0.5rem' }} />
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.25rem', color: '#f8fafc' }}>
                    Sign Language Content Under Institutional Review
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '28rem', margin: '0 auto', lineHeight: 1.5 }}>
                    The spatial grammar and technical vocabulary for this lesson have been drafted with Deaf STEM educators and are currently undergoing formal RCI master-trainer sign-off.
                  </p>
                </div>
              )}

              {activeLesson.availabilityState === 'unavailable' && (
                <div style={{ padding: '1rem', textAlign: 'center' }}>
                  <VideoOff size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.25rem', color: '#f8fafc' }}>
                    Authentic ISL Video in Development
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '28rem', margin: '0 auto', lineHeight: 1.5 }}>
                    An authentic human-signed ISL video is not yet recorded for this advanced topic. ConceptLens adheres to strict zero-synthetic signing guidelines and does not substitute unverified 3D avatars.
                  </p>
                </div>
              )}
            </div>

            {/* Learning Objectives */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle2 size={14} color="var(--accent-emerald)" /> Key Learning Objectives
              </h4>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {activeLesson.learningObjectives.map((obj, i) => (
                  <li key={i} style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                    {obj}
                  </li>
                ))}
              </ul>
            </div>

            {/* Caption / Text Explanation */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.85rem' }}>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', margin: '0 0 0.35rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <BookOpen size={14} color="var(--accent-cyan)" /> Curriculum Concept Summary
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                {activeLesson.captionExplanation}
              </p>
              <span style={{ display: 'block', marginTop: '0.4rem', fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Note: This English concept summary is an educational reference, not an Indian Sign Language translation.
              </span>
            </div>

            {/* Provenance & Attribution Box */}
            <div style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <h4 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <Info size={13} /> Provenance & Legal Attribution
              </h4>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <div><strong>Source:</strong> {activeLesson.sourceOrganization}</div>
                <div><strong>Attribution:</strong> {activeLesson.attribution}</div>
                <div><strong>License:</strong> {activeLesson.license}</div>
                <div style={{ marginTop: '0.35rem', color: 'var(--text-muted)', fontSize: '0.74rem' }}>
                  <strong>Limitations:</strong> {activeLesson.limitationsNote}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ISLCatalogWorkspace;
