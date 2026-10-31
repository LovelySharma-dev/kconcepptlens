import React, { useState } from 'react';
import type {
  BiologyTopicId
} from '@conceptlens/shared';
import {
  Compass,
  Award,
  ArrowRight,
  Sparkles,
  Accessibility,
  RotateCcw,
  Layers,
  CheckCircle2,
  FileText,
  Upload,
  ExternalLink
} from 'lucide-react';

interface HomeViewProps {
  preferences?: any;
  onNavigateLearn: () => void;
  onNavigatePractice: () => void;
  onNavigateADHD?: () => void;
  onOpenAccessibility: () => void;
  onLaunchTopic: (topicId: BiologyTopicId) => void;
  onAnnounce?: (msg: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigateLearn,
  onNavigatePractice,
  onNavigateADHD,
  onOpenAccessibility,
  onLaunchTopic
}) => {
  // Check if a saved session or active lesson exists in localStorage
  let savedLessonTopic: string | null = null;
  try {
    const raw = localStorage.getItem('conceptlens-learn-continuity');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.lesson?.topic) savedLessonTopic = parsed.lesson.topic;
    }
  } catch {
    /* ignore */
  }

  // Interactive preview state for Feature 1 (Accessibility)
  const [previewSetting, setPreviewSetting] = useState<'adhd' | 'dyslexia' | 'contrast' | 'simple'>('adhd');

  // Interactive organelle preview state for Feature 3 (See how concepts work)
  const [selectedCellOrganelle, setSelectedCellOrganelle] = useState<'mitochondria' | 'nucleus' | 'ribosome' | 'membrane'>('mitochondria');

  // Interactive representation preview state for Feature 4 (Multi-representation continuity)
  const [previewRepMode, setPreviewRepMode] = useState<'read' | 'easy' | 'steps' | 'visual' | 'quiz'>('read');

  return (
    <div className="home-view" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* 1. HERO PRODUCT VISION & CORE ACTIONS */}
      <section
        className="glass-panel"
        style={{
          padding: '2.75rem 2rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
        aria-labelledby="hero-title"
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(56, 189, 248, 0.12)',
            color: 'var(--accent-cyan)',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '1.25rem'
          }}
        >
          <Sparkles size={16} aria-hidden="true" />
          <span>The Living Learning Atlas</span>
        </div>

        <h1
          id="hero-title"
          style={{
            fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            margin: '0 auto 1.25rem',
            maxWidth: '880px',
            letterSpacing: '-0.02em'
          }}
        >
          One concept. Different ways to understand it.
        </h1>

        <p
          style={{
            fontSize: '1.15rem',
            color: 'var(--text-secondary)',
            maxWidth: '720px',
            margin: '0 auto 2rem',
            lineHeight: 1.6
          }}
        >
          Learn any supported concept. Practice with your own material. Choose how information is presented. Switch between representations without losing your place.
        </p>

        {/* 4 OBVIOUS PRIMARY USER ACTIONS */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
            margin: '0 auto 1.5rem',
            maxWidth: '800px'
          }}
        >
          <button
            type="button"
            className="btn-primary"
            onClick={onNavigateLearn}
            style={{
              fontSize: '1.05rem',
              padding: '0.85rem 1.6rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontWeight: 700,
              boxShadow: 'var(--shadow-elevated)'
            }}
          >
            <Compass size={20} aria-hidden="true" />
            <span>Learn a Concept</span>
            <ArrowRight size={18} aria-hidden="true" />
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={onNavigatePractice}
            style={{
              fontSize: '1.05rem',
              padding: '0.85rem 1.5rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontWeight: 600
            }}
          >
            <Award size={20} color="var(--accent-amber)" aria-hidden="true" />
            <span>Practice with My Material</span>
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={onOpenAccessibility}
            style={{
              fontSize: '0.95rem',
              padding: '0.85rem 1.25rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Accessibility size={18} aria-hidden="true" />
            <span>Change How I Learn</span>
          </button>

          {onNavigateADHD && (
            <button
              type="button"
              className="btn-secondary"
              onClick={onNavigateADHD}
              style={{
                fontSize: '0.95rem',
                padding: '0.85rem 1.25rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                borderColor: 'var(--accent-cyan)',
                color: 'var(--accent-cyan)'
              }}
              title="A flexible study space with smaller steps, active learning, and easy ways to pick up where you left off."
            >
              <Sparkles size={18} aria-hidden="true" />
              <span>ADHD-Friendly Learning</span>
            </button>
          )}
        </div>

        {/* RESUME SESSION BANNER IF PREVIOUS LESSON EXISTS */}
        {savedLessonTopic && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.5rem 1rem',
              background: 'var(--bg-surface)',
              border: '1px solid var(--accent-cyan)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)'
            }}
          >
            <RotateCcw size={15} color="var(--accent-cyan)" />
            <span>Continue where you left off: <strong>{savedLessonTopic}</strong></span>
            <button
              type="button"
              className="tag-btn active"
              onClick={onNavigateLearn}
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
            >
              Resume Lesson
            </button>
          </div>
        )}
      </section>

      {/* 2. CURATED TOPIC SHOWCASE — INSTANT EXPLORATION */}
      <section className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0 }}>
              Curated Concept Explorer
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
              Explore interactive spatial models with deterministic mathematical and anatomical guarantees.
            </p>
          </div>
          <button
            type="button"
            className="btn-secondary"
            onClick={onNavigateLearn}
            style={{ fontSize: '0.82rem' }}
          >
            <span>Browse All Subjects</span>
            <ArrowRight size={14} style={{ marginLeft: '0.3rem' }} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {[
            { id: 'human_cell', title: 'Human Cell Organelles', domain: 'Biology', desc: '8 cellular organelles with analogies, mitochondrial ATP synthesis, and cell biology.', color: 'var(--accent-cyan)' },
            { id: 'human_heart', title: 'Cardiac Dual Circuit', domain: 'Physiology', desc: '4 heart chambers, cardiac output, systolic/diastolic blood flow, and valves.', color: 'var(--accent-coral)' },
            { id: 'dna_helix', title: 'DNA Double Helix', domain: 'Genetics', desc: 'A-T & G-C complementary base pairing with hydrogen bonding explanations.', color: 'var(--accent-mint)' },
            { id: 'neuron', title: 'Neuron Action Potential', domain: 'Neuroscience', desc: 'Dendrites, axon myelin sheath, node of Ranvier, and synaptic neurotransmission.', color: 'var(--accent-violet)' },
            { id: 'plant_cell', title: 'Plant Cell & Chloroplast', domain: 'Botany', desc: 'Cellulose cell wall, central vacuole turgor pressure, and photosynthesis.', color: 'var(--accent-amber)' }
          ].map((item) => (
            <div
              key={item.id}
              style={{
                padding: '1.25rem',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: item.color, letterSpacing: '0.04em' }}>
                  {item.domain}
                </span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0.35rem 0 0.5rem' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 1rem' }}>
                  {item.desc}
                </p>
              </div>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => onLaunchTopic(item.id as BiologyTopicId)}
                style={{ alignSelf: 'flex-start', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <span>Launch Model</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 3. OUR APPROACH TO LEARNING — EDITORIAL PRODUCT STORY */}
      <section className="glass-panel" style={{ padding: '2.5rem 2rem' }} aria-labelledby="approach-heading">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 2.5rem' }}>
          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--accent-cyan)',
              display: 'inline-block',
              marginBottom: '0.65rem'
            }}
          >
            OUR APPROACH TO LEARNING
          </span>
          <h2
            id="approach-heading"
            style={{
              fontSize: 'clamp(1.6rem, 3.2vw, 2.3rem)',
              fontWeight: 800,
              lineHeight: 1.25,
              margin: '0 0 1rem',
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)'
            }}
          >
            Education should adapt to people. Not the other way around.
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>
            People understand ideas in different ways. Some need a visual model. Others need simpler language, a step-by-step explanation, or another way to practise. ConceptLens brings these learning experiences together, helping learners explore concepts in the way that works best for them—without losing their progress along the way.
          </p>
        </div>

        {/* 4 Distinct Editorial Feature Compositions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* FEATURE 1: Learning, on your terms */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
              gap: '2rem',
              alignItems: 'center',
              padding: '1.75rem',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-cyan)', letterSpacing: '0.05em' }}>
                Feature 1 — Learning, on your terms
              </span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0.35rem 0 0.75rem' }}>
                Make the experience fit you.
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                Adjust the learning environment to your needs, from reading comfort and visual clarity to reduced distractions and keyboard-friendly interaction.
              </p>

              {/* Setting Selector Pills */}
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                {[
                  { id: 'adhd', label: 'ADHD Focus & Ruler' },
                  { id: 'dyslexia', label: 'Dyslexia Typography' },
                  { id: 'contrast', label: 'High Contrast' },
                  { id: 'simple', label: 'Simple Steps' }
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`tag-btn ${previewSetting === s.id ? 'active' : ''}`}
                    onClick={() => setPreviewSetting(s.id as any)}
                    style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem' }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="btn-secondary"
                onClick={onOpenAccessibility}
                style={{ fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <span>Explore accessibility settings</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Live Interactive Setting Preview Card */}
            <div
              style={{
                padding: '1.5rem',
                borderRadius: 'var(--radius-md)',
                background: previewSetting === 'contrast' ? '#000000' : 'var(--surface-bg)',
                border: previewSetting === 'contrast' ? '2px solid #ffff00' : '1px solid var(--border-medium)',
                boxShadow: 'var(--shadow-elevated)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <span>Live Setting Demo: <strong style={{ color: previewSetting === 'contrast' ? '#ffff00' : 'var(--accent-cyan)' }}>{previewSetting.toUpperCase()}</strong></span>
                <span>Active Preview</span>
              </div>

              {previewSetting === 'adhd' && (
                <div style={{ position: 'relative' }}>
                  <div style={{ padding: '0.65rem 0.85rem', background: 'rgba(56, 189, 248, 0.12)', borderLeft: '3px solid var(--accent-cyan)', borderRadius: '4px', marginBottom: '0.65rem' }}>
                    <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-primary)', fontWeight: 600, lineHeight: 1.6 }}>
                      Reading aperture highlights the active line while dimming peripheral distractions.
                    </p>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, opacity: 0.55 }}>
                    Mitochondria generate ATP molecules via cellular respiration to power cell activity.
                  </p>
                </div>
              )}

              {previewSetting === 'dyslexia' && (
                <div>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.9, letterSpacing: '0.025em', wordSpacing: '0.08em' }}>
                    Relaxed line spacing (1.9×), open typography, and wider word boundaries minimize letter-crowding for comfortable prolonged reading.
                  </p>
                </div>
              )}

              {previewSetting === 'contrast' && (
                <div>
                  <p style={{ margin: 0, fontSize: '0.98rem', color: '#ffff00', fontWeight: 700, lineHeight: 1.6 }}>
                    High-contrast pure black and yellow palette guarantees maximum luminance difference for low vision and screen reader visibility.
                  </p>
                </div>
              )}

              {previewSetting === 'simple' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', color: 'var(--accent-cyan)' }}>
                    <CheckCircle2 size={15} />
                    <span>Step 1: Sunlight strikes chlorophyll in plant leaf.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    <CheckCircle2 size={15} color="var(--text-muted)" />
                    <span>Step 2: Water molecules split into hydrogen and oxygen gas.</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* FEATURE 2: From notes to understanding */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
              gap: '2rem',
              alignItems: 'center',
              padding: '1.75rem',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-amber)', letterSpacing: '0.05em' }}>
                Feature 2 — From notes to understanding
              </span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0.35rem 0 0.75rem' }}>
                Start with what you already have.
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                Bring your study material into one workspace. Where supported, use PDFs, images, pasted text, or speech dictation to turn your material into explanations, flashcards, and practice questions.
              </p>
              <button
                type="button"
                className="btn-secondary"
                onClick={onNavigatePractice}
                style={{ fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <span>Open practice workspace</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* 3-Step Workflow Pipeline Diagram */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ padding: '0.4rem', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)' }}>
                  <Upload size={18} />
                </div>
                <div>
                  <strong style={{ fontSize: '0.88rem', display: 'block' }}>1. Your Study Material</strong>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>PDF, textbook photo, pasted notes, or speech dictation (up to 20MB)</span>
                </div>
              </div>

              <div style={{ textAlign: 'center', color: 'var(--accent-cyan)', fontSize: '0.8rem' }}>↓</div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ padding: '0.4rem', borderRadius: '6px', background: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-cyan)' }}>
                  <FileText size={18} />
                </div>
                <div>
                  <strong style={{ fontSize: '0.88rem', display: 'block' }}>2. Review Extracted Text</strong>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Inspect, edit, or add notes before generating your accessible workspace</span>
                </div>
              </div>

              <div style={{ textAlign: 'center', color: 'var(--accent-emerald)', fontSize: '0.8rem' }}>↓</div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <div style={{ padding: '0.4rem', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-emerald)' }}>
                  <Award size={18} />
                </div>
                <div>
                  <strong style={{ fontSize: '0.88rem', display: 'block', color: 'var(--accent-emerald)' }}>3. Learn and Practise</strong>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Generated flashcards, quizzes, simple steps, and key definitions</span>
                </div>
              </div>
            </div>
          </div>

          {/* FEATURE 3: Explore the idea, not just the explanation */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
              gap: '2rem',
              alignItems: 'center',
              padding: '1.75rem',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-emerald)', letterSpacing: '0.05em' }}>
                Feature 3 — Explore the idea, not just the explanation
              </span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0.35rem 0 0.75rem' }}>
                See how concepts work.
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                Move beyond reading with interactive models and guided visual exploration. Inspect represented structures, change supported parameters, and discover how parts relate to the whole.
              </p>
              <button
                type="button"
                className="btn-primary"
                onClick={() => onLaunchTopic('human_cell')}
                style={{ fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <span>Launch Animal Cell Model</span>
                <ExternalLink size={14} />
              </button>
            </div>

            {/* Interactive Organelle Inspection Preview */}
            <div style={{ padding: '1.25rem', background: '#070b14', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Interactive Model Specimen:</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>The Animal Cell</span>
              </div>

              {/* Clickable Organelle Pills */}
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {[
                  { id: 'mitochondria', label: 'Mitochondria' },
                  { id: 'nucleus', label: 'Nucleus' },
                  { id: 'ribosome', label: 'Ribosomes' },
                  { id: 'membrane', label: 'Plasma Membrane' }
                ].map((org) => (
                  <button
                    key={org.id}
                    type="button"
                    className={`tag-btn ${selectedCellOrganelle === org.id ? 'active' : ''}`}
                    onClick={() => setSelectedCellOrganelle(org.id as any)}
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
                  >
                    {org.label}
                  </button>
                ))}
              </div>

              {/* Organelle Live Breakdown Card */}
              <div style={{ padding: '0.85rem', background: 'var(--surface-bg)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                {selectedCellOrganelle === 'mitochondria' && (
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--accent-amber)' }}>Mitochondria (Powerhouse of the Cell)</strong>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      Produces 90% of cellular energy via ATP synthesis through oxidative phosphorylation on folded inner cristae membranes.
                    </p>
                  </div>
                )}
                {selectedCellOrganelle === 'nucleus' && (
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--accent-violet)' }}>Nucleus (Information Command Center)</strong>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      Encloses genetic chromosomes and orchestrates protein synthesis via transcription of genomic DNA into messenger RNA.
                    </p>
                  </div>
                )}
                {selectedCellOrganelle === 'ribosome' && (
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--accent-cyan)' }}>Ribosomes (Protein Factories)</strong>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      Translate mRNA codons into polypeptide amino acid chains to construct enzymes, structural fibers, and cellular pumps.
                    </p>
                  </div>
                )}
                {selectedCellOrganelle === 'membrane' && (
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--accent-mint)' }}>Plasma Membrane (Selectively Permeable Barrier)</strong>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      Phospholipid bilayer regulating nutrient entry, waste egress, and ion gradients via receptor-mediated transmembrane channels.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* FEATURE 4: Continue without starting over */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
              gap: '2rem',
              alignItems: 'center',
              padding: '1.75rem',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-purple)', letterSpacing: '0.05em' }}>
                Feature 4 — Continue without starting over
              </span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0.35rem 0 0.75rem' }}>
                One idea. Multiple ways to understand it.
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                Move between reading, simpler explanations, guided steps, visual models, and practice while keeping your learning context and supported progress connected.
              </p>

              {/* Connected Visual Journey Path */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem', fontSize: '0.8rem', fontWeight: 700 }}>
                <span style={{ color: 'var(--accent-cyan)' }}>Read</span>
                <span style={{ color: 'var(--text-muted)' }}>→</span>
                <span style={{ color: 'var(--accent-amber)' }}>Understand</span>
                <span style={{ color: 'var(--text-muted)' }}>→</span>
                <span style={{ color: 'var(--accent-emerald)' }}>Explore</span>
                <span style={{ color: 'var(--text-muted)' }}>→</span>
                <span style={{ color: 'var(--accent-violet)' }}>Practise</span>
              </div>

              <button
                type="button"
                className="btn-secondary"
                onClick={onNavigateLearn}
                style={{ fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <span>Try the multi-view workspace</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Interactive Multi-Representation Preview Card */}
            <div style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)' }}>
              <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {[
                  { id: 'read', label: 'Read' },
                  { id: 'easy', label: 'Easy Read' },
                  { id: 'steps', label: 'Steps' },
                  { id: 'visual', label: 'Visual Model' },
                  { id: 'quiz', label: 'Quiz' }
                ].map((rep) => (
                  <button
                    key={rep.id}
                    type="button"
                    className={`tag-btn ${previewRepMode === rep.id ? 'active' : ''}`}
                    onClick={() => setPreviewRepMode(rep.id as any)}
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
                  >
                    {rep.label}
                  </button>
                ))}
              </div>

              <div style={{ padding: '1rem', background: 'var(--bg-surface)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                  Concept: Photosynthesis
                </span>

                {previewRepMode === 'read' && (
                  <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Photosynthesis is the biochemical process wherein photoautotrophs convert photon irradiance and water into chemical carbohydrates and oxygen gas.
                  </p>
                )}

                {previewRepMode === 'easy' && (
                  <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    Plants use green leaves like tiny solar panels. They soak up sunlight, drink water from the soil, and turn air into sugar food to grow.
                  </p>
                )}

                {previewRepMode === 'steps' && (
                  <div style={{ marginTop: '0.35rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    <div><strong>Step 1:</strong> Chlorophyll captures photons.</div>
                    <div><strong>Step 2:</strong> Water splits into oxygen.</div>
                    <div><strong>Step 3:</strong> Calvin cycle forms glucose.</div>
                  </div>
                )}

                {previewRepMode === 'visual' && (
                  <div style={{ marginTop: '0.35rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-emerald)' }}>
                      <Layers size={14} />
                      <span>Interactive Chloroplast Thylakoid Stroma 2D Canvas</span>
                    </div>
                  </div>
                )}

                {previewRepMode === 'quiz' && (
                  <div style={{ marginTop: '0.35rem', fontSize: '0.82rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Where do light-independent reactions take place?</div>
                    <div style={{ color: 'var(--accent-emerald)' }}>✓ In the stroma of the chloroplast.</div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* CLOSING STATEMENT & PRIMARY CTA */}
        <div style={{ textAlign: 'center', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0 0 0.85rem', letterSpacing: '-0.01em' }}>
            Your learning journey should move with you.
          </h3>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
            Learning that keeps moving. ConceptLens can use configured AI services when available and fall back to deterministic local behavior for supported tasks when a service is unavailable.
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={onNavigateLearn}
            style={{ fontSize: '1.05rem', padding: '0.85rem 1.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.55rem', fontWeight: 700 }}
          >
            <span>Start learning</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomeView;
