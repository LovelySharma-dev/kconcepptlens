import React from 'react';
import type { LearningPreferences, LearningThemeId } from '@conceptlens/shared';
import { learningThemeGroups } from '@conceptlens/shared';

interface HomeNarrativeProps {
  preferences: LearningPreferences;
  onStartLearning: () => void;
  onOpenAccessibility: () => void;
  onToggleTheme: (id: LearningThemeId) => void;
  pageReading?: 'checking' | 'ready' | 'planned';
}

const PROBLEMS = [
  {
    title: 'Complex content',
    body: 'Technical notes, equations, and unfamiliar terminology can make a concept difficult to understand without additional explanation.'
  },
  {
    title: 'Different learning preferences',
    body: 'Some learners benefit from plain language, others from smaller steps, familiar examples, readable layouts, or optional audio.'
  },
  {
    title: 'Repeated frustration',
    body: 'When the first explanation doesn’t work, learners need another way to approach the concept—not simply the same explanation again.'
  },
  {
    title: 'Accessibility barriers',
    body: 'Content that depends on a single format or interaction method can make learning harder for people with different accessibility requirements.'
  }
] as const;

const PIPELINE = [
  {
    key: 'Input',
    title: 'Bring your learning material',
    body: 'Enter a question, paste your notes, extract text from a supported PDF, or explore a curated sample.'
  },
  {
    key: 'Classify',
    title: 'Identify the concept',
    body: 'ConceptLens classifies supported content and allows you to correct the subject or content type when necessary.'
  },
  {
    key: 'Personalize',
    title: 'Choose your learning preferences',
    body: 'Select options such as plain language, step-by-step explanations, reduced stimulation, readable presentation, and optional text-to-speech.'
  },
  {
    key: 'Explain',
    title: 'Explore the explanation',
    body: 'Follow structured explanations, supported calculations, examples, and guided steps at your own pace.'
  },
  {
    key: 'Practice',
    title: 'Practice and adapt',
    body: 'Answer practice questions and receive rule-based feedback that can recommend another explanation or a review step.'
  }
] as const;

const IMPACTS = [
  { title: 'Understandable learning', body: 'Explore supported concepts through alternative explanations.' },
  { title: 'Learner independence', body: 'Revisit lessons and proceed at an individual pace.' },
  { title: 'Flexible access', body: 'Use available presentation and interaction preferences.' },
  { title: 'Learning across subjects', body: 'Explore supported material from mathematics, physics, programming, and biology.' }
] as const;

function plainClick(event: React.MouseEvent<HTMLAnchorElement>) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

function focusInPage(id: string) {
  const node = document.getElementById(id);
  if (!node) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    || document.body.classList.contains('reduced-motion')
    || document.body.classList.contains('low-stimulation');
  node.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
  node.focus({ preventScroll: true });
}

function readingNote(pageReading: 'checking' | 'ready' | 'planned') {
  if (pageReading === 'ready') {
    return 'Printed photographs and scanned PDF pages can be read on this server. Handwriting is often weak. You confirm the reading before it is explained.';
  }
  if (pageReading === 'checking') {
    return 'Photograph reading is being checked on this server.';
  }
  return 'A PDF is read only when it already has a text layer. Photograph and scanned-page reading is planned on this server. You can type what you see.';
}

export const HomeNarrative: React.FC<HomeNarrativeProps> = ({
  preferences,
  onStartLearning,
  onOpenAccessibility,
  onToggleTheme,
  pageReading = 'checking'
}) => {
  const start = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (plainClick(event)) return;
    event.preventDefault();
    onStartLearning();
  };

  return (
    <div className="lens-page">
      <section className="lens-hero" aria-labelledby="learn-title">
        <div className="lens-hero-copy">
          <p className="lens-kicker">ConceptLens</p>
          <h1 id="learn-title" tabIndex={-1}>Learn anything. Your way.</h1>
          <p className="lens-lead">
            Learning isn’t one-size-fits-all. ConceptLens helps transform supported learning materials into explanations that match your preferred way of understanding, one concept at a time.
          </p>
          <div className="lens-actions">
            <a className="lens-button" href="#guided-demo" onClick={start}>
              Start Learning
            </a>
            <a
              className="lens-button lens-button-quiet"
              href="#our-mission"
              onClick={(event) => {
                if (plainClick(event)) return;
                event.preventDefault();
                focusInPage('our-mission');
              }}
            >
              Discover Our Mission
            </a>
          </div>
          <p className="lens-trust">Your preferences. Your pace. Your way of learning.</p>
        </div>

        <article className="lens-preview" aria-labelledby="preview-title">
          <p className="lens-preview-meta">
            <span>Sample preview</span>
            <span>Simple Steps</span>
          </p>
          <h2 id="preview-title">A supported mathematics example</h2>
          <p className="lens-stage">Source material</p>
          <p className="lens-question">Solve 2x + 3 = 11.</p>
          <p className="lens-stage">Adapted explanation</p>
          <ol className="lens-steps">
            <li>Subtract 3 from both sides.</li>
            <li>Divide both sides by 2.</li>
            <li>Check the answer by substitution.</li>
          </ol>
          <p className="lens-stage">Understanding</p>
          <p className="lens-answer">x = 4</p>
          <p className="lens-preview-note">Labeled sample of supported mathematics. This preview is not a live reading.</p>
        </article>
      </section>

      <section id="our-mission" className="lens-section story-target" tabIndex={-1} aria-labelledby="sdg-title">
        <div className="lens-section-head">
          <p className="lens-kicker">Our social mission</p>
          <h2 id="sdg-title">Learning for a more inclusive future.</h2>
          <p>
            ConceptLens is designed around the belief that access to understandable learning materials should not depend on a single teaching style or presentation format.
          </p>
        </div>
        <div className="lens-sdg">
          <article className="lens-card lens-sdg-4">
            <p className="lens-sdg-mark">
              <span className="lens-sdg-num">4</span>
              <span>SDG 4</span>
            </p>
            <h3>Quality Education</h3>
            <p>
              Support inclusive and equitable quality education by making supported learning content easier to understand through alternative explanations, manageable steps, and personalized presentation preferences.
            </p>
          </article>
          <article className="lens-card lens-sdg-10">
            <p className="lens-sdg-mark">
              <span className="lens-sdg-num">10</span>
              <span>SDG 10</span>
            </p>
            <h3>Reduced Inequalities</h3>
            <p>
              Help reduce learning barriers by providing alternative ways to engage with educational material and accommodating different accessibility preferences.
            </p>
          </article>
        </div>
        <p className="lens-note">
          ConceptLens aims to support these goals. It is not a United Nations program, and it is not endorsed by the United Nations.{' '}
          <a href="https://sdgs.un.org/goals/goal4">Goal 4</a>
          {' · '}
          <a href="https://sdgs.un.org/goals/goal10">Goal 10</a>
        </p>
      </section>

      <section className="lens-section" aria-labelledby="problem-title">
        <div className="lens-section-head">
          <p className="lens-kicker">The problem</p>
          <h2 id="problem-title">One way of teaching doesn’t work for everyone.</h2>
          <p>
            Educational content is often presented in a standard format, but learners have different accessibility needs, reading preferences, and levels of prior knowledge.
          </p>
        </div>
        <div className="lens-problems">
          {PROBLEMS.map((problem, index) => (
            <article key={problem.title} className="lens-card">
              <p className="lens-index">
                <span className="sr-only">Problem </span>
                {index + 1}
              </p>
              <h3>{problem.title}</h3>
              <p>{problem.body}</p>
            </article>
          ))}
        </div>
        <p className="lens-close">
          The challenge isn’t that every learner must learn differently. It’s that every learner deserves a fair opportunity to understand.
        </p>
      </section>

      <section id="how-it-works" className="lens-section story-target" tabIndex={-1} aria-labelledby="solution-title">
        <div className="lens-section-head">
          <p className="lens-kicker">Our solution</p>
          <h2 id="solution-title">Meet ConceptLens.</h2>
          <p className="lens-subhead">One concept. Multiple ways to understand it.</p>
          <p>
            ConceptLens is an accessibility-focused learning platform that adapts supported educational content to a learner’s selected presentation preferences.
          </p>
        </div>
        <ol className="lens-flow" aria-label="Learning pipeline">
          {PIPELINE.map((step, index) => (
            <li key={step.key}>
              {index > 0 && <span className="lens-flow-arrow" aria-hidden="true">→</span>}
              <span>{step.key}</span>
            </li>
          ))}
        </ol>
        <ol className="lens-pipeline">
          {PIPELINE.map((step, index) => (
            <li key={step.key} className="lens-card">
              <p className="lens-index">
                <span className="sr-only">Step </span>
                {String(index + 1).padStart(2, '0')}
              </p>
              <p className="lens-key">{step.key}</p>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
        <p className="lens-note">
          Practice feedback comes from written rules and a local Python file. It is not a trained model. Curated lessons are labeled samples. {readingNote(pageReading)}
        </p>
      </section>

      <section id="learning-preferences" className="lens-section story-target" tabIndex={-1} aria-labelledby="access-title">
        <div className="lens-section-head">
          <p className="lens-kicker">Accessibility preferences</p>
          <h2 id="access-title">Your learning experience, your choice.</h2>
          <p>Accessibility should be flexible, personal, and free from assumptions.</p>
        </div>
        {learningThemeGroups().map((group) => (
          <div key={group.id} className="lens-theme-group">
            <h3>{group.title}</h3>
            <ul className="lens-themes">
              {group.themes.map((theme) => {
                const on = preferences.activeThemes.includes(theme.id);
                return (
                  <li key={theme.id}>
                    <button type="button" aria-pressed={on} onClick={() => onToggleTheme(theme.id)}>
                      <span className="lens-state">{on ? 'On' : 'Off'}</span>
                      <span className="lens-card-title">{theme.title}</span>
                      <span>{theme.description}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        <p className="lens-note">
          These are learning and accessibility preferences, not medical diagnoses. You choose the experience that works for you.
        </p>
        <button type="button" className="lens-button lens-button-quiet" onClick={onOpenAccessibility}>
          Change learning preferences
        </button>
      </section>

      <section className="lens-section" aria-labelledby="impact-title">
        <div className="lens-section-head">
          <p className="lens-kicker">Intended impact</p>
          <h2 id="impact-title">Small changes in presentation. More opportunities to learn.</h2>
          <p>These are intended benefits of changing how supported material is presented. They are not measured outcomes.</p>
        </div>
        <div className="lens-problems">
          {IMPACTS.map((impact) => (
            <article key={impact.title} className="lens-card">
              <p className="lens-key">Intended benefit</p>
              <h3>{impact.title}</h3>
              <p>{impact.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="lens-closeout" aria-labelledby="closing-title">
        <h2 id="closing-title">Your next breakthrough starts with understanding.</h2>
        <p>Bring a question. Choose your way of learning. Take the next step.</p>
        <a className="lens-button" href="#guided-demo" onClick={start}>
          Start Learning
        </a>
      </section>
    </div>
  );
};
