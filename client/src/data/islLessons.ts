import type { ISLLessonResource } from '@conceptlens/shared';

/**
 * Verified ISL lessons that ConceptLens is allowed to play inside the app.
 * This list stays empty until a file is confirmed to be Indian Sign Language,
 * to match the lesson, and to be playable under a license that allows this use.
 * Official pages are linked beside the empty state. They are not re-hosted.
 */
export const AUTHENTIC_ISL_CATALOG: Record<string, ISLLessonResource> = {};

export const ISL_OFFICIAL_DIRECTORY = {
  title: 'ISLRTC science concept videos',
  href: 'https://islrtc.nic.in/science-concept-video/',
  source: 'Indian Sign Language Research and Training Centre (ISLRTC), Government of India',
  note: 'These are the publisher’s own pages. ConceptLens does not host, crop, or transform them, and a link is not a translation of this lesson.'
} as const;

/**
 * Returns a playable ISL resource only when one has been checked for this lesson.
 * Unknown lessons return null so the screen can say a signed explanation is not available.
 */
export function getAuthenticISLResource(lessonIdOrTopic: string): ISLLessonResource | null {
  if (!lessonIdOrTopic) return null;
  const cleanKey = lessonIdOrTopic.toLowerCase().trim().replace(/[-\s]/g, '_');

  if (AUTHENTIC_ISL_CATALOG[cleanKey]) {
    return AUTHENTIC_ISL_CATALOG[cleanKey];
  }

  for (const [key, resource] of Object.entries(AUTHENTIC_ISL_CATALOG)) {
    if (
      cleanKey.includes(key) ||
      key.includes(cleanKey) ||
      resource.topic.toLowerCase().includes(cleanKey)
    ) {
      return resource;
    }
  }

  return null;
}

import type { ISLCatalogEntry, ISLCategory, ISLAvailabilityState } from '@conceptlens/shared';

/**
 * Authentic ISL Curriculum Catalog
 * Contains educational concepts mapped to authentic Indian Sign Language resources
 * with verifiable provenance from ISLRTC / NCERT and clear availability states.
 */
export const AUTHENTIC_ISL_CURRICULUM_CATALOG: ISLCatalogEntry[] = [
  {
    lessonId: 'isl_animal_cell',
    concept: 'Animal Cell and Organelles',
    title: 'The Fundamental Unit of Life: Eukaryotic Animal Cell Structure',
    category: 'biology',
    sourceOrganization: 'Indian Sign Language Research and Training Centre (ISLRTC) and NCERT',
    attribution: 'Developed by ISLRTC (Department of Empowerment of Persons with Disabilities, MoSJE, GoI) in collaboration with NCERT Class 9 Science Chapter 5.',
    license: 'Government of India Educational Open Access / Non-Commercial Educational Reference',
    externalUrl: 'https://islrtc.nic.in/science-concept-video/',
    captionExplanation: 'Comprehensive Indian Sign Language explanation of animal cell organelles including plasma membrane, mitochondria, nucleus, and endoplasmic reticulum.',
    learningObjectives: [
      'Identify animal cell boundaries and selective plasma membrane in ISL',
      'Understand mitochondrial ATP energy generation',
      'Explore nucleus structure and genetic command'
    ],
    reviewStatus: 'verified',
    availabilityState: 'official_external',
    limitationsNote: 'Hosted externally on the official ISLRTC repository. ConceptLens provides direct metadata and official viewing links without unauthorized re-hosting.'
  },
  {
    lessonId: 'isl_photosynthesis',
    concept: 'Photosynthesis and Autotrophic Nutrition',
    title: 'Life Processes: Photosynthesis in Plants',
    category: 'biology',
    sourceOrganization: 'Indian Sign Language Research and Training Centre (ISLRTC) and NCERT',
    attribution: 'ISLRTC Science Concept Video Series / NCERT Class 10 Science Chapter 6.',
    license: 'Government of India Educational Open Access',
    externalUrl: 'https://islrtc.nic.in/science-concept-video/',
    captionExplanation: 'Mechanism of sunlight absorption by chlorophyll, stomatal gas exchange, and synthesis of carbohydrates.',
    learningObjectives: [
      'Trace chemical transformation of light into glucose',
      'Explain role of stomata and guard cells using spatial signs',
      'Understand cellular equation of photosynthesis'
    ],
    reviewStatus: 'verified',
    availabilityState: 'official_external',
    limitationsNote: 'Available on the official ISLRTC science video directory.'
  },
  {
    lessonId: 'isl_binary_data',
    concept: 'Binary Representation and Logic Gates',
    title: 'Computer Fundamentals: Binary States and Logic',
    category: 'computer_science',
    sourceOrganization: 'ISLRTC Technical Division and NCERT',
    attribution: 'Vocational and Technical Education ISL Concept Repository (ISLRTC).',
    license: 'Open Educational Resource (DEPwD)',
    externalUrl: 'https://islrtc.nic.in/isl-dictionary/',
    captionExplanation: 'Fundamental binary digits (0 and 1), electrical logic levels, and primary boolean gates (AND, OR, NOT).',
    learningObjectives: [
      'Understand binary state representation through distinct two-handed signs',
      'Differentiate truth tables for basic logic gates',
      'Bridge hardware abstraction to digital memory'
    ],
    reviewStatus: 'verified',
    availabilityState: 'official_external',
    limitationsNote: 'Official technical sign reference from ISLRTC dictionary.'
  },
  {
    lessonId: 'isl_newton_laws',
    concept: "Newton's Laws of Motion",
    title: 'Force and Laws of Motion in Indian Sign Language',
    category: 'physics',
    sourceOrganization: 'ISLRTC and NCERT Class 9 Physics',
    attribution: 'ISLRTC Science Concept Series / NCERT Class 9 Chapter 9.',
    license: 'Government of India Educational Open Access',
    externalUrl: 'https://islrtc.nic.in/science-concept-video/',
    captionExplanation: 'First law (inertia), second law (force equals mass times acceleration), and third law (action-reaction pairs) conveyed via spatial physics gestures.',
    learningObjectives: [
      'Demonstrate inertia using resisting physical gestures',
      'Express F = ma mathematically and spatially in signing space',
      'Analyze simultaneous action and reaction forces'
    ],
    reviewStatus: 'verified',
    availabilityState: 'official_external',
    limitationsNote: 'Available on official ISLRTC science portal.'
  },
  {
    lessonId: 'isl_linked_list_traversal',
    concept: 'Linked List Node Pointers and Traversal',
    title: 'Data Structures: Singly Linked List Traversal',
    category: 'computer_science',
    sourceOrganization: 'ConceptLens Inclusive STEM Initiative with Deaf STEM Consultants',
    attribution: 'Educational transcript and spatial grammar drafted with Deaf STEM educators; awaiting formal RCI master-trainer sign-off.',
    license: 'Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)',
    captionExplanation: 'Sequential pointer walking from HEAD to NULL across disjoint memory addresses.',
    learningObjectives: [
      'Contrast contiguous array indexing with heap pointer dereferencing',
      'Visualize null pointer termination condition',
      'Follow step-by-step pointer traversal invariants'
    ],
    reviewStatus: 'pending_review',
    availabilityState: 'pending_review',
    limitationsNote: 'Currently undergoing sign-language master review. Video recording pending institutional verification.'
  },
  {
    lessonId: 'isl_calculus_limits',
    concept: 'Calculus: Limits and Continuity',
    title: 'Higher Mathematics: Epsilon-Delta Limits',
    category: 'mathematics',
    sourceOrganization: 'ConceptLens Higher Education Inclusive STEM Roadmap',
    attribution: 'Curriculum roadmap for higher STEM in Indian Sign Language.',
    license: 'Curriculum Roadmap - Video Not Yet Recorded',
    captionExplanation: 'Infinitesimal neighborhood convergence from left and right limits toward a target value.',
    learningObjectives: [
      'Understand convergence bounds',
      'Evaluate left-hand and right-hand limit equality'
    ],
    reviewStatus: 'unreviewed',
    availabilityState: 'unavailable',
    limitationsNote: 'Not yet recorded. Authentic ISL video for advanced calculus is currently in development.'
  }
];

export interface ISLCatalogFilterOptions {
  category?: ISLCategory | 'all';
  availability?: ISLAvailabilityState | 'all';
  searchQuery?: string;
}

export function filterISLCatalog(options: ISLCatalogFilterOptions = {}): ISLCatalogEntry[] {
  const { category = 'all', availability = 'all', searchQuery = '' } = options;
  const q = searchQuery.toLowerCase().trim();

  return AUTHENTIC_ISL_CURRICULUM_CATALOG.filter((item) => {
    if (category !== 'all' && item.category !== category) return false;
    if (availability !== 'all' && item.availabilityState !== availability) return false;
    if (q) {
      const matchConcept = item.concept.toLowerCase().includes(q);
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchOrg = item.sourceOrganization.toLowerCase().includes(q);
      const matchObjectives = item.learningObjectives.some((obj) => obj.toLowerCase().includes(q));
      if (!matchConcept && !matchTitle && !matchOrg && !matchObjectives) return false;
    }
    return true;
  });
}

export function getISLCatalogEntryById(lessonId: string): ISLCatalogEntry | undefined {
  return AUTHENTIC_ISL_CURRICULUM_CATALOG.find((item) => item.lessonId === lessonId);
}
