import React, { useState, Suspense, lazy } from 'react';
import { BiologyTopicId } from '@conceptlens/shared';
import {
  Sparkles,
  ArrowRight,
  Layers,
  Eye,
  Volume2,
  Video,
  Atom,
  Heart,
  Dna,
  Zap,
  Leaf,
  Binary,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Cell2DCanvas } from './biology/2d/Cell2DCanvas';

const Cell3DCanvas = lazy(() =>
  import('./biology/3d/Cell3DCanvas').then((m) => ({ default: m.Cell3DCanvas }))
);

interface LandingPageProps {
  onExploreTopic: (topicId: BiologyTopicId) => void;
  onNavigateToHowItWorks: () => void;
  onNavigateToAccessibility: () => void;
  onNavigateToTab?: (tab: 'home' | 'biology' | 'cloudinary' | 'practice' | 'isl' | 'stem' | 'gates' | 'about') => void;
  defer3D?: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onExploreTopic,
  onNavigateToHowItWorks,
  onNavigateToAccessibility,
  onNavigateToTab,
  defer3D = false
}) => {
  const [heroViewMode, setHeroViewMode] = useState<'3d' | '2d'>('2d');
  const [heroSceneRequested, setHeroSceneRequested] = useState(false);

  React.useEffect(() => {
    if (!defer3D) return;
    setHeroViewMode('2d');
    setHeroSceneRequested(false);
  }, [defer3D]);
  const [heroActiveOrganelle, setHeroActiveOrganelle] = useState<string>('nucleus');

  const organelleHighlights: Record<string, { name: string; role: string; analogy: string }> = {
    nucleus: {
      name: 'Nucleus',
      role: 'Stores DNA & controls transcription',
      analogy: 'The central administration archives'
    },
    mitochondria: {
      name: 'Mitochondria',
      role: 'Generates cellular ATP through oxidative phosphorylation',
      analogy: 'The high-efficiency power plant'
    },
    endoplasmic_reticulum: {
      name: 'Endoplasmic Reticulum',
      role: 'Synthesizes proteins and lipids across membrane folds',
      analogy: 'The factory assembly line'
    },
    golgi_apparatus: {
      name: 'Golgi Apparatus',
      role: 'Packages and sorts proteins for vesicle transport',
      analogy: 'The international shipping depot'
    }
  };

  const activeInfo = organelleHighlights[heroActiveOrganelle] || organelleHighlights.nucleus;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem', paddingBottom: '4rem' }}>
      {/* ====================================================================
          1. HERO SECTION — THE DIGITAL OBSERVATORY
          Metaphor: Transition from Flat Knowledge to Spatial Understanding
          ==================================================================== */}
      <section className="hero-observatory reveal-step-1">
        {/* Left Column: Editorial Statement */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Scientific Domain Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              width: 'fit-content',
              padding: '0.35rem 0',
              color: 'var(--accent-cyan)'
            }}
          >
            <span style={{ fontSize: '0.95rem', fontWeight: 600, letterSpacing: '0.01em', color: 'var(--accent-cyan)' }}>
              Science lessons
            </span>
          </div>

          {/* Hero Headline */}
          <h1
            style={{
              fontSize: 'clamp(2.6rem, 5.5vw, 4.4rem)',
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: '-0.035em',
              color: 'var(--text-primary)',
              margin: 0
            }}
          >
            Don&apos;t just study the diagram.
            <br />
            <span style={{ color: 'var(--accent-cyan)' }}>Step inside it.</span>
          </h1>

          {/* Supporting Copy */}
          <p
            style={{
              fontSize: '1.15rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              maxWidth: '560px',
              margin: 0
            }}
          >
            Explore science through interactive models, clear explanations, and learning experiences that adapt to you.
          </p>

          {/* Primary & Secondary Call to Actions */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', paddingTop: '0.5rem' }}>
            <button
              type="button"
              className="btn-primary"
              style={{ fontSize: '1rem', padding: '0.85rem 1.8rem', gap: '0.65rem' }}
              onClick={() => onExploreTopic('human_cell')}
            >
              <span>Start learning</span>
              <ArrowRight size={18} />
            </button>
            <button
              type="button"
              className="btn-secondary"
              style={{ fontSize: '1rem', padding: '0.85rem 1.6rem' }}
              onClick={onNavigateToHowItWorks}
            >
              See how it works
            </button>
          </div>

          {/* Restrained Product Descriptor & Authentic Value Indicators */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', paddingTop: '0.5rem' }}>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '40rem', lineHeight: 1.55, margin: 0 }}>
              Suggestions follow the questions you answer. You can customize your learning experience without disclosing a diagnosis.
            </p>
            <button
              type="button"
              className="btn-secondary"
              onClick={onNavigateToAccessibility}
              style={{ width: 'fit-content', fontSize: '1rem' }}
            >
              Customize how you learn
            </button>
          </div>
        </div>

        {/* Right Column: Hero Visual — Scientific Specimen in Digital Observatory */}
        <div className="hero-specimen reveal-step-2">
          {/* Understated Radial Observatory Light */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at 50% 50%, rgba(101, 229, 242, 0.12) 0%, rgba(13, 18, 29, 0) 75%)',
              pointerEvents: 'none',
              zIndex: 1
            }}
          />

          {/* Observatory Header Overlay: Controls & Status */}
          <div
            style={{
              position: 'absolute',
              top: '14px',
              left: '14px',
              right: '14px',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              pointerEvents: 'auto'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: 'var(--bg-card)',
                backdropFilter: 'blur(8px)',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                fontSize: '0.75rem',
                color: 'var(--text-primary)'
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--accent-mint)',
                  boxShadow: '0 0 8px var(--accent-mint)'
                }}
              />
              <span style={{ fontWeight: 600 }}>Specimen: Animal Cell (Eukaryotic)</span>
            </div>

            {/* 3D vs 2D Quick Observatory Toggle */}
            <div
              style={{
                display: 'flex',
                background: 'var(--bg-card)',
                backdropFilter: 'blur(8px)',
                padding: '0.2rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)'
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setHeroSceneRequested(true);
                  setHeroViewMode('3d');
                }}
                style={{
                  border: 'none',
                  background: heroViewMode === '3d' ? 'var(--bg-elevated)' : 'transparent',
                  color: heroViewMode === '3d' ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  padding: '0.25rem 0.55rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {defer3D ? 'Load 3D model' : '3D view'}
              </button>
              <button
                type="button"
                onClick={() => setHeroViewMode('2d')}
                style={{
                  border: 'none',
                  background: heroViewMode === '2d' ? 'var(--bg-elevated)' : 'transparent',
                  color: heroViewMode === '2d' ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  padding: '0.25rem 0.55rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                2D Fallback
              </button>
            </div>
          </div>

          {/* Interactive Scientific Model Viewport */}
          <div style={{ width: '100%', height: '100%' }}>
            {heroViewMode === '3d' && heroSceneRequested ? (
              <Suspense
                fallback={
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--accent-cyan)', fontSize: '0.85rem' }}>
                    Loading 3D observatory model...
                  </div>
                }
              >
                <Cell3DCanvas
                  selectedComponentId={heroActiveOrganelle}
                  onSelectComponent={(id: string) => setHeroActiveOrganelle(id)}
                  showLabels={true}
                />
              </Suspense>
            ) : (
              <Cell2DCanvas
                selectedComponentId={heroActiveOrganelle}
                onSelectComponent={(id: string) => setHeroActiveOrganelle(id)}
                showLabels={true}
              />
            )}
          </div>

          {/* Bottom Annotation Drawer: Shows Real Contextual Discovery */}
          <div
            style={{
              position: 'absolute',
              bottom: '14px',
              left: '14px',
              right: '14px',
              zIndex: 10,
              background: 'var(--bg-card)',
              backdropFilter: 'blur(12px)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              pointerEvents: 'auto'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.15rem' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  {activeInfo.name}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  [{activeInfo.role}]
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                💡 <em>{activeInfo.analogy}</em>
              </div>
            </div>

            <button
              type="button"
              className="btn-primary"
              style={{ fontSize: '0.75rem', padding: '0.45rem 0.9rem', flexShrink: 0 }}
              onClick={() => onExploreTopic('human_cell')}
            >
              <span>Full Study Mode</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. THE LEARNING ATLAS — "CHOOSE A WORLD TO EXPLORE"
          Editorial Grid: Featured Cell + Secondary STEM Worlds
          ==================================================================== */}
      <section className="reveal-step-3">
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-cyan)' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Curated Science Curriculum
            </span>
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 3.8vw, 2.75rem)', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
            Choose a world to explore.
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '680px', margin: 0 }}>
            Move beyond memorizing labels. Inspect structures, understand relationships, and try practice questions that match the model.
          </p>
        </div>

        {/* Editorial Asymmetric Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem'
          }}
        >
          {/* FEATURED CARD: Human Cell (Large Visual Area) */}
          <div
            className="atlas-card atlas-card-featured"
            onClick={() => onExploreTopic('human_cell')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onExploreTopic('human_cell');
              }
            }}
            aria-label="Explore Human Animal Cell Biology in 3D and 2D"
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(101, 229, 242, 0.12)',
                      border: '1px solid rgba(101, 229, 242, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-cyan)'
                    }}
                  >
                    <Atom size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                      Featured Living System
                    </span>
                    <h3 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0 }}>The Animal Cell</h3>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.55rem',
                      borderRadius: 'var(--radius-xs)',
                      background: 'rgba(101, 229, 242, 0.15)',
                      color: 'var(--accent-cyan)',
                      border: '1px solid rgba(101, 229, 242, 0.3)'
                    }}
                  >
                    3D Studio
                  </span>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.55rem',
                      borderRadius: 'var(--radius-xs)',
                      background: 'rgba(140, 231, 189, 0.15)',
                      color: 'var(--accent-mint)',
                      border: '1px solid rgba(140, 231, 189, 0.3)'
                    }}
                  >
                    2D Canvas
                  </span>
                </div>
              </div>

              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Step inside the eukaryotic cell. Rotate 8 interactive organelles—including the nucleus, mitochondria, rough ER, and Golgi complex. Discover how ATP synthesis and protein packaging work together.
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border-subtle)',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'var(--accent-cyan)'
              }}
            >
              <span>Explore Cell Biology</span>
              <ArrowRight size={18} className="card-arrow" />
            </div>
          </div>

          {/* SECONDARY CARD 1: Human Heart */}
          <div
            className="atlas-card"
            onClick={() => onExploreTopic('human_heart')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onExploreTopic('human_heart');
              }
            }}
            aria-label="Explore Human Heart Cardiovascular System"
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 138, 138, 0.12)',
                    border: '1px solid rgba(255, 138, 138, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-coral)'
                  }}
                >
                  <Heart size={20} />
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-coral)' }}>
                  Physiology • 3D + 2D
                </span>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>The Human Heart</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Trace double circulation through the four chambers, compare pulmonary vs. systemic loops, and adjust cardiac BPM.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-coral)' }}>
              <span>Simulate Circulation</span>
              <ArrowRight size={15} className="card-arrow" />
            </div>
          </div>

          {/* SECONDARY CARD 2: DNA Double Helix */}
          <div
            className="atlas-card"
            onClick={() => onExploreTopic('dna_helix')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onExploreTopic('dna_helix');
              }
            }}
            aria-label="Explore DNA Double Helix Molecular Genetics"
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(167, 139, 250, 0.12)',
                    border: '1px solid rgba(167, 139, 250, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-violet)'
                  }}
                >
                  <Dna size={20} />
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-violet)' }}>
                  Genetics • 3D + 2D
                </span>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>DNA Double Helix</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Explore Watson-Crick B-DNA geometry, antiparallel 5'➔3' strands, major and minor grooves, and complementary A=T and G≡C hydrogen bonding.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-violet)' }}>
              <span>Unravel Helix</span>
              <ArrowRight size={15} className="card-arrow" />
            </div>
          </div>

          {/* SECONDARY CARD 3: Neuron Electrophysiology */}
          <div
            className="atlas-card"
            onClick={() => onExploreTopic('neuron')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onExploreTopic('neuron');
              }
            }}
            aria-label="Explore Neuron Electrophysiology Simulation"
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(245, 189, 112, 0.12)',
                    border: '1px solid rgba(245, 189, 112, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-amber)'
                  }}
                >
                  <Zap size={20} />
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-amber)' }}>
                  Neurobiology • 2D Lab
                </span>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Neuron &amp; Action Potential</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Trigger nerve impulses, observe saltatory conduction leaping across Nodes of Ranvier, and monitor real-time membrane voltage.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-amber)' }}>
              <span>Trigger Impulse</span>
              <ArrowRight size={15} className="card-arrow" />
            </div>
          </div>

          {/* SECONDARY CARD 4: Plant Cell */}
          <div
            className="atlas-card"
            onClick={() => onExploreTopic('plant_cell')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onExploreTopic('plant_cell');
              }
            }}
            aria-label="Explore Plant Cell Wall and Chloroplasts"
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(140, 231, 189, 0.12)',
                    border: '1px solid rgba(140, 231, 189, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-mint)'
                  }}
                >
                  <Leaf size={20} />
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-mint)' }}>
                  Botany • 2D Canvas
                </span>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Plant Cell &amp; Turgor Pressure</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Compare cellulose cell walls, chloroplast thylakoids, and central vacuole osmosis under hypotonic environments.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-mint)' }}>
              <span>Inspect Plant Cell</span>
              <ArrowRight size={15} className="card-arrow" />
            </div>
          </div>

          {/* SECONDARY CARD 5: Physics & Ray Optics Studio */}
          <div
            className="atlas-card"
            onClick={() => onNavigateToTab?.('stem')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onNavigateToTab?.('stem');
              }
            }}
            aria-label="Explore Physics Ray Optics and Harmonic Motion"
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(101, 229, 242, 0.12)',
                    border: '1px solid rgba(101, 229, 242, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-cyan)'
                  }}
                >
                  <SlidersHorizontal size={20} />
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  Physics Lab • Interactive
                </span>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Geometrical Ray Optics</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Adjust focal length (f), object distance (u), and height. Watch dynamic Gaussian ray tracing verify real and virtual image formation.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>
              <span>Launch Physics Lab</span>
              <ArrowRight size={15} className="card-arrow" />
            </div>
          </div>

          {/* SECONDARY CARD 6: Computer Science Concept Engine */}
          <div
            className="atlas-card"
            onClick={() => onNavigateToTab?.('stem')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onNavigateToTab?.('stem');
              }
            }}
            aria-label="Explore Computer Science Linked Lists Deterministic Engine"
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(167, 139, 250, 0.12)',
                    border: '1px solid rgba(167, 139, 250, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-violet)'
                  }}
                >
                  <Binary size={20} />
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-violet)' }}>
                  Data Structures • Deterministic
                </span>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Linked Lists &amp; Invariant Engine</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Deterministic step execution and Floyd cycle detection for linked-list practice. Cited exam links are not marked as verified papers.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-violet)' }}>
              <span>Inspect Pointer Engine</span>
              <ArrowRight size={15} className="card-arrow" />
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. FROM FLAT PAPER TO SPATIAL UNDERSTANDING
          Visualizing the Core Metaphor and Educational Problem
          ==================================================================== */}
      <section className="glass-panel" style={{ padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 2.5rem auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-cyan)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            <Sparkles size={14} />
            <span>THE CORE METAPHOR</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.4rem)', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
            See the media pipeline, then open a model
          </h2>
          <p style={{ fontSize: '0.98rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            These two frames are the same public Cloudinary photograph, before and after URL transformations. The cell, heart, and DNA models are separate interactive lessons, not generated from this photo.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'center' }}>
          {/* Flat 2D Paper Scanned Textbook */}
          <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Cloudinary original
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>
                demo/sample
              </span>
            </div>
            <img
              src="https://res.cloudinary.com/demo/image/upload/c_scale,w_800/sample.jpg"
              alt="Untransformed photograph from Cloudinary's public demo cloud. This sample is not a textbook page."
              width={800}
              height={220}
              style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
            />
            <div style={{ marginTop: '0.85rem', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Same public asset before sharpening and contrast. Open the media studio to drag the comparison and read the delivery URL.
            </div>
          </div>

          {/* Central Transformation Arrow */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', textAlign: 'center' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(101, 229, 242, 0.12)',
                border: '1px solid rgba(101, 229, 242, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-cyan)'
              }}
            >
              <Sparkles size={22} />
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
              URL transformations
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', maxWidth: '220px' }}>
              <code style={{ color: 'var(--accent-cyan)' }}>e_sharpen</code>, <code style={{ color: 'var(--accent-cyan)' }}>e_contrast</code>, <code style={{ color: 'var(--accent-cyan)' }}>f_auto</code>, <code style={{ color: 'var(--accent-cyan)' }}>q_auto</code>
            </div>
          </div>

          {/* Explorable 3D Digital Model */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(17, 25, 39, 0.9) 0%, rgba(23, 33, 49, 0.9) 100%)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              border: '1px solid rgba(101, 229, 242, 0.3)',
              boxShadow: 'var(--glow-focal)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                Cloudinary transformed
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--accent-mint)', fontFamily: 'var(--font-mono)' }}>
                f_auto · q_auto
              </span>
            </div>
            <div
              style={{
                background: 'var(--bg-primary)',
                height: '220px',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              <img
                src="https://res.cloudinary.com/demo/image/upload/e_sharpen:80,e_contrast,c_scale,w_800/f_auto,q_auto/sample.jpg"
                alt="The same Cloudinary demo photograph after sharpen and contrast."
                width={800}
                height={220}
                style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block' }}
              />
            </div>
            <button
              type="button"
              className="btn-primary"
              style={{ marginTop: '0.85rem', fontSize: '0.8rem', padding: '0.45rem 1rem' }}
              onClick={() => onNavigateToTab?.('cloudinary')}
            >
              Open media studio
            </button>
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. THE LEARNING PROCESS
          Three distinct stages: 01 Explore -> 02 Understand -> 03 Practice
          ==================================================================== */}
      <section id="how-it-works" className="glass-panel" style={{ padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 2.5rem auto' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.4rem)', fontWeight: 600, margin: '0 0 0.5rem 0', fontFamily: 'var(--font-display)' }}>
            How learning adapts
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            After you answer, ConceptLens can suggest a review, the simpler stored explanation, the labeled diagram, or the next structure. The suggestion names the answer it used. It is a set of rules, not a trained model, and it does not infer a diagnosis.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', background: 'var(--bg-elevated)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-display)' }}>
              01 — Explore
            </div>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Interact with Scientific Structures</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Interact with scientific structures and inspect their individual components in spatial 3D or high-contrast 2D viewports.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', background: 'var(--bg-elevated)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-mint)', fontFamily: 'var(--font-display)' }}>
              02 — Understand
            </div>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Investigate Relationships</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Read explanations and investigate how components work together through intuitive analogies and physiological mechanisms.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', background: 'var(--bg-elevated)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-amber)', fontFamily: 'var(--font-display)' }}>
              03 — Practice
            </div>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Test Your Understanding</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Test your understanding with practice questions, instant feedback, and an explanation of the correct choice.
            </p>
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. ACCESSIBILITY & INCLUSION AS CORE ARCHITECTURE
          ==================================================================== */}
      <section id="accessibility" className="glass-panel" style={{ padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 2.5rem auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-mint)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            <ShieldCheck size={14} />
            <span>ACCESSIBLE BY DESIGN</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.4rem)', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
            Inclusive Learning for Every Student
          </h2>
          <p style={{ fontSize: '0.98rem', color: 'var(--text-secondary)' }}>
            Accessibility is woven directly into the visual and technical architecture—not patched on as an afterthought.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          <div style={{ background: 'var(--bg-elevated)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <Eye size={22} color="var(--accent-cyan)" style={{ marginBottom: '0.5rem' }} />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.35rem 0' }}>High Contrast Mode</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              High-contrast colors and a visible focus outline for low-vision learners. This is not a formal WCAG audit.
            </p>
          </div>

          <div style={{ background: 'var(--bg-elevated)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <Volume2 size={22} color="var(--accent-mint)" style={{ marginBottom: '0.5rem' }} />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.35rem 0' }}>Live Screen Reader</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Polite ARIA live region announces every organelle selection, state transition, and quiz explanation dynamically.
            </p>
          </div>

          <div style={{ background: 'var(--bg-elevated)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <Video size={22} color="var(--accent-violet)" style={{ marginBottom: '0.5rem' }} />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.35rem 0' }}>Text lessons</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Searchable English explanations you can step through with the keyboard. Authentic Indian Sign Language video is not included.
            </p>
          </div>

          <div style={{ background: 'var(--bg-elevated)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <Layers size={22} color="var(--accent-amber)" style={{ marginBottom: '0.5rem' }} />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.35rem 0' }}>Universal 2D Fallback</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              High-detail SVG diagrams ensure students on low-power devices, mobile phones, or browsers without WebGL have complete access.
            </p>
          </div>
        </div>
      </section>

      {/* ====================================================================
          6. CLOSING CALL TO ACTION
          ==================================================================== */}
      <section
        style={{
          textAlign: 'center',
          padding: '4rem 1.5rem',
          borderRadius: 'var(--radius-xl)',
          background: 'radial-gradient(circle at center, rgba(101, 229, 242, 0.12) 0%, rgba(8, 11, 18, 0.95) 100%)',
          border: '1px solid rgba(101, 229, 242, 0.25)',
          boxShadow: 'var(--shadow-elevated)'
        }}
      >
        <h2 style={{ fontSize: 'clamp(2rem, 3.8vw, 2.75rem)', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
          Make difficult concepts easier to explore.
        </h2>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '560px', margin: '0 auto 1.75rem auto', lineHeight: 1.6 }}>
          Transform your static textbook into an explorable scientific environment. No registration required, zero friction.
        </p>
        <button
          type="button"
          className="btn-primary"
          style={{ fontSize: '1.1rem', padding: '0.9rem 2.2rem' }}
          onClick={() => onExploreTopic('human_cell')}
        >
          Start Exploring
        </button>
      </section>
    </div>
  );
};
