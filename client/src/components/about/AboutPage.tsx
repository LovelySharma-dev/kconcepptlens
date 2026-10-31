import React from 'react';
import {
  Compass,
  Eye,
  ArrowRight,
  Atom,
  Cpu,
  Image,
  Globe2,
  HeartHandshake
} from 'lucide-react';

interface AboutPageProps {
  onNavigateLearn: () => void;
  onNavigatePractice: () => void;
  onOpenAccessibility: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  onNavigateLearn,
  onNavigatePractice,
  onOpenAccessibility
}) => {
  return (
    <article className="about-page" aria-labelledby="about-main-heading">
      {/* SECTION 1: THE MISSION */}
      <section className="glass-panel" style={{ padding: '2.5rem 2rem', marginBottom: '1.5rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', background: 'rgba(56, 189, 248, 0.12)', color: 'var(--accent-cyan)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>
          <Compass size={16} aria-hidden="true" />
          <span>The ConceptLens Mission</span>
        </div>
        <h1 id="about-main-heading" style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 800, lineHeight: 1.15, margin: '0 auto 1rem', maxWidth: '850px' }}>
          One concept. Different ways to understand it.
        </h1>
        <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: '750px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
          Learning should adapt to people—not expect every learner to process information in the exact same way.
        </p>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', maxWidth: '680px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
          ConceptLens is built to make educational content genuinely accessible through flexible representations, optional interactive models, learner-controlled accessibility settings, and multiple ways to interact with knowledge without losing your place.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button type="button" className="btn-primary" onClick={onNavigateLearn} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Explore a Concept</span>
            <ArrowRight size={16} aria-hidden="true" />
          </button>
          <button type="button" className="btn-secondary" onClick={onNavigatePractice}>
            Practice with Your Material
          </button>
        </div>
      </section>

      {/* SECTION 2: THE PROBLEM */}
      <section className="glass-panel" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          The Problem: One-Size-Fits-All Learning Creates Barriers
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          Traditional classrooms and digital textbooks deliver material through a single dominant format—usually dense paragraphs or fast-paced lectures. When that presentation does not click, learners are often told to reread the same text repeatedly.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1.25rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--accent-coral)', marginBottom: '0.5rem' }}>
              Dense Text Barriers
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Heavy academic jargon and walls of unformatted prose overwhelm learners with dyslexia, ADHD, or cognitive overload without offering alternative paths.
            </p>
          </div>

          <div style={{ padding: '1.25rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--accent-amber)', marginBottom: '0.5rem' }}>
              Spatial & Step Gaps
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Abstract processes—from data structure pointer mutations to cardiac blood circuits—demand spatial or step-by-step models that static paper cannot provide.
            </p>
          </div>

          <div style={{ padding: '1.25rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--accent-violet)', marginBottom: '0.5rem' }}>
              Fragmented Tools & Lost Place
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Switching from an article to a YouTube video or external visualizer forces students to start over, losing their notes, completed steps, and quiz progress.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: THE CONCEPTLENS APPROACH — FIVE PILLARS */}
      <section className="glass-panel" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>
            The ConceptLens Architecture: Five Product Pillars
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.35rem', fontSize: '0.9rem' }}>
            Built from the ground up for resilience, verifiable correctness, and accessible learner choice.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {/* Pillar 1 */}
          <div style={{ padding: '1.25rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
              <div style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', background: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-cyan)' }}>
                <Eye size={20} aria-hidden="true" />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>1. Inclusive Interface</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              18 typed presentation and interaction modes: ADHD focus ruler, Simple Steps, Easy Read, Dyslexia typography, Low-Stimulation motion reduction, Color-Blind geometric shape indicators, Speech-Free options, and Motor-Friendly 48px touch targets.
            </p>
          </div>

          {/* Pillar 2 */}
          <div style={{ padding: '1.25rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
              <div style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-mint)' }}>
                <Cpu size={20} aria-hidden="true" />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>2. Adaptive Learning Engine</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Multi-tier AI orchestration: Google Gemini 3.1 Flash Lite on free tier, failover to Hugging Face serverless inference, and 100% deterministic local rule-based generation when offline. Strict Zod schemas guard every generated step and quiz question.
            </p>
          </div>

          {/* Pillar 3 */}
          <div style={{ padding: '1.25rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
              <div style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', background: 'rgba(167, 139, 250, 0.15)', color: 'var(--accent-violet)' }}>
                <Atom size={20} aria-hidden="true" />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>3. Interactive Learning Atlas</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Mathematical and physiological simulations: Singly & Doubly Linked Lists with Floyd cycle detection, Geometrical Convex Lens Ray Optics, Simple Pendulum SHM, and 5 interactive anatomical systems (Human Cell, Heart, DNA, Neuron, Plant Cell).
            </p>
          </div>

          {/* Pillar 4 */}
          <div style={{ padding: '1.25rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
              <div style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)' }}>
                <Image size={20} aria-hidden="true" />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>4. Cloudinary Media Intelligence</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Signed server-side upload verification, responsive educational transformations (f_auto, q_auto), deskewing, and low-data delivery modes that drop image transfer sizes for low-bandwidth learners without losing clarity.
            </p>
          </div>

          {/* Pillar 5 */}
          <div style={{ padding: '1.25rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
              <div style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', background: 'rgba(244, 63, 94, 0.15)', color: 'var(--accent-coral)' }}>
                <Globe2 size={20} aria-hidden="true" />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>5. ConceptLens Everywhere</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Manifest V3 Chrome extension bringing dyslexia typography, high contrast, text simplification, summarization, and key term explanations to any web article, homework portal, or research paper in isolated Shadow DOM.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 4: LEARNING CONTINUITY */}
      <section className="glass-panel" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Learning Continuity: Change Representation Without Losing Your Place
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          Learners should be free to switch from reading text to stepping through ordered steps, listening to spoken audio, or inspecting an interactive diagram without having their lesson reset.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap', padding: '1.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ flex: '1 1 180px', textAlign: 'center', padding: '1rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>1. Understand</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Read summary, analogy & key terms</div>
          </div>
          <ArrowRight size={20} color="var(--text-muted)" aria-hidden="true" />
          <div style={{ flex: '1 1 180px', textAlign: 'center', padding: '1rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-mint)' }}>2. Explore</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Step-by-step & interactive models</div>
          </div>
          <ArrowRight size={20} color="var(--text-muted)" aria-hidden="true" />
          <div style={{ flex: '1 1 180px', textAlign: 'center', padding: '1rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-violet)' }}>3. Practice</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Flashcards & 4-option questions</div>
          </div>
          <ArrowRight size={20} color="var(--text-muted)" aria-hidden="true" />
          <div style={{ flex: '1 1 180px', textAlign: 'center', padding: '1rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-amber)' }}>4. Review</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Targeted feedback & study notes</div>
          </div>
        </div>
      </section>

      {/* SECTION 5: DESIGNED AROUND LEARNER CHOICE */}
      <section className="glass-panel" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Designed Around Learner Choice, Not Assumptions
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
          ConceptLens does not diagnose users or pigeonhole people based on labels. Accessibility preferences are individual choices that can be adjusted at any time.
        </p>
        <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.7, paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
          <li><strong>No Stored Diagnoses:</strong> We store display preferences (e.g. font size, reduced motion, contrast), never medical records or inferred diagnostic classifications.</li>
          <li><strong>Immediate Real-time Application:</strong> Toggling ADHD Focus, Simple Steps, or High Contrast immediately changes live component rendering.</li>
          <li><strong>Zero Mandatory Modalities:</strong> Speech and audio output are never forced. Camera and microphone permissions are only requested when explicitly initiated by the user.</li>
          <li><strong>Predictable Conflict Resolution:</strong> Low-Stimulation keeps motion off; Low-Data defers heavy media; ADHD-friendly presents one task at a time without imposing countdown timers or forced breaks.</li>
        </ul>
        <button type="button" className="btn-secondary" onClick={onOpenAccessibility}>
          Open Accessibility Preferences
        </button>
      </section>

      {/* SECTION 6: TECHNOLOGY & TRANSPARENCY */}
      <section className="glass-panel" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Technology & Transparency
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
          We believe in complete honesty about how our learning system operates:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ margin: '0 0 0.4rem', color: 'var(--accent-cyan)' }}>AI Generation & Fallbacks</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Uses Google Gemini 3.1 Flash Lite on the free tier (15 RPM sliding window). If quota or network limits are reached, the system fails over to Hugging Face or deterministic rule-based lesson synthesis. No paid API keys are required.
            </p>
          </div>

          <div style={{ padding: '1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ margin: '0 0 0.4rem', color: 'var(--accent-mint)' }}>Verification & Grounding</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Generated lessons are strictly validated against TypeScript Zod schemas before rendering. We do NOT fabricate citations or claim an answer is authoritative when unverified.
            </p>
          </div>

          <div style={{ padding: '1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ margin: '0 0 0.4rem', color: 'var(--accent-violet)' }}>Local OCR & Media Privacy</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Camera captures and uploaded documents are processed through local Tesseract OCR. You always preview and correct extracted text before any lesson is created.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 7: IMPACT & NEXT STEPS */}
      <section className="glass-panel" style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-coral)', marginBottom: '0.75rem' }}>
          <HeartHandshake size={20} aria-hidden="true" />
          <strong style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Aligned with UN SDG 4: Quality Education
          </strong>
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, margin: '0 0 1rem' }}>
          Building an Inclusive Future for All Learners
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto 1.5rem', lineHeight: 1.6, fontSize: '0.95rem' }}>
          We don't invent partnership claims, false research stats, or claim that software alone solves educational disparity. Our commitment is practical: every single concept supported in ConceptLens should offer multiple genuine ways to understand it.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button type="button" className="btn-primary" onClick={onNavigateLearn}>
            Explore a Concept in Learn
          </button>
          <button type="button" className="btn-secondary" onClick={onNavigatePractice}>
            Bring Your Notes to Practice
          </button>
        </div>
      </section>
    </article>
  );
};
