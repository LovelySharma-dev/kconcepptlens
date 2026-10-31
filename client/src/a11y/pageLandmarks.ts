export interface PageLandmark {
  id: string;
  label: string;
  selector: string;
}

export interface PageNavModel {
  overview: string;
  landmarks: PageLandmark[];
}

const BY_TAB: Record<string, PageNavModel> = {
  home: {
    overview:
      'Home introduces ConceptLens. You can open Find My Way to Learn, explore the plant-cell explanation, adjust the learning space, or start exploring in Learn.',
    landmarks: [
      { id: 'hero', label: 'Welcome heading', selector: '#hero-title' },
      { id: 'ways', label: 'One idea, different ways in', selector: '#ways-title' },
      { id: 'living-atlas', label: 'Plant cell ways to explore', selector: '#living-atlas' },
      { id: 'space', label: 'Your learning space', selector: '#space-title' },
      { id: 'principle', label: 'Curiosity without fear of mistakes', selector: '#principle-title' },
      { id: 'mission', label: 'Education that includes everyone', selector: '#mission-title' }
    ]
  },
  learn: {
    overview:
      'Learn is where concepts and interactive lessons live. The plant-cell explanation, the Pointer Lie lesson, and the media comparison are on this page when they have loaded.',
    landmarks: [
      { id: 'living-atlas', label: 'Plant cell explanation', selector: '#living-atlas' },
      { id: 'pointer-lie', label: 'Pointer Lie lesson', selector: '#pointer-lie' },
      { id: 'learning-media', label: 'Same cell, four deliveries', selector: '#learning-media' }
    ]
  },
  practice: {
    overview:
      'Practice is where you paste notes or upload a supported PDF or image, review extracted text, and build a lesson. Nothing is invented when extraction fails.',
    landmarks: [
      { id: 'practice-heading', label: 'Practice workspace', selector: '#practice-heading' },
      { id: 'practice-workspace', label: 'Generated practice', selector: '#practice-workspace-heading' }
    ]
  },
  adhd: {
    overview: 'ADHD Space is a quieter study layout with smaller steps. It does not diagnose anyone.',
    landmarks: [{ id: 'adhd', label: 'ADHD-Friendly Learning', selector: 'h1, h2' }]
  },
  biology: {
    overview: 'Biology interactive models open labeled diagrams and guided steps for a selected topic.',
    landmarks: [{ id: 'bio', label: 'Biology workspace', selector: 'main h1, main h2, #learn-title' }]
  },
  about: {
    overview: 'About explains the mission and the connection to UN Sustainable Development Goal 4.',
    landmarks: [{ id: 'about', label: 'About heading', selector: 'main h1, main h2' }]
  },
  cloudinary: {
    overview: 'Media Studio works with the project illustration pipeline when the account is configured.',
    landmarks: [{ id: 'media', label: 'Media studio', selector: 'main h1, main h2' }]
  }
};

/** Landmarks that currently exist in the DOM for this tab. */
export function getAvailableLandmarks(tab: string): PageNavModel {
  const model = BY_TAB[tab] || {
    overview: 'You are in ConceptLens. Use the navigation tabs or Guide Me to move between major areas.',
    landmarks: [{ id: 'main', label: 'Main content', selector: 'main, #main, [role="main"], h1' }]
  };
  if (typeof document === 'undefined') {
    return { overview: model.overview, landmarks: [] };
  }
  const landmarks = model.landmarks.filter((item) => {
    try {
      return !!document.querySelector(item.selector);
    } catch {
      return false;
    }
  });
  return { overview: model.overview, landmarks };
}

export function goToLandmark(selector: string, reduceMotion: boolean): boolean {
  if (typeof document === 'undefined') return false;
  let target: Element | null = null;
  try {
    target = document.querySelector(selector);
  } catch {
    return false;
  }
  if (!target) return false;
  target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  if (target instanceof HTMLElement) {
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }
  return true;
}

export function goToMainHeading(reduceMotion: boolean): boolean {
  if (typeof document === 'undefined') return false;
  const heading = document.querySelector<HTMLElement>('main h1, #hero-title, h1');
  if (!heading) return false;
  heading.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
  heading.focus({ preventScroll: true });
  return true;
}
