export type ModelRendererType = 'svg_interactive_2d' | 'canvas_simulation_2d' | 'webgl_3d';

export interface ModelSupportedInteractions {
  zoom: boolean;
  pan: boolean;
  reset: boolean;
  rotate: boolean;
  inspect: boolean;
  parameterSliders?: boolean;
  playPause?: boolean;
  guidedTour?: boolean;
}

export interface ModelSelectableStructure {
  id: string;
  name: string;
  role: string;
  analogy?: string;
  examFact?: string;
}

export interface ModelGuidedStep {
  stepIndex: number;
  title: string;
  targetComponentId?: string;
  description: string;
  checkQuestion?: string;
}

export interface ModelAccessibilityConfig {
  textDescription: string;
  screenReaderSummary: string;
  keyboardShortcuts: string[];
  reducedMotionSupport: boolean;
}

export interface ModelAttribution {
  source: string;
  license: string;
  isOriginalInteractive: boolean;
}

export interface VisualModelMeta {
  id: string;
  domain: 'biology' | 'physics' | 'data_structure';
  title: string;
  shortLabel: string;
  description: string;
  keywords: string[];
  rendererType: ModelRendererType;
  supportedInteractions: ModelSupportedInteractions;
  selectableStructures: ModelSelectableStructure[];
  guidedExplorationSteps: ModelGuidedStep[];
  accessibility: ModelAccessibilityConfig;
  attribution: ModelAttribution;
}

export const AVAILABLE_VISUAL_MODELS: VisualModelMeta[] = [
  {
    id: 'human_cell',
    domain: 'biology',
    title: 'The Animal Cell: Architecture & Organelles',
    shortLabel: 'Animal Cell',
    description: 'Inspect membrane-bound eukaryotic organelles (Nucleus, Mitochondria, Ribosomes, ER, Golgi, Lysosomes).',
    keywords: ['cell', 'animal cell', 'organelle', 'mitochondria', 'nucleus', 'cytoplasm', 'biology', 'cytology', 'membrane'],
    rendererType: 'svg_interactive_2d',
    supportedInteractions: { zoom: true, pan: true, reset: true, rotate: false, inspect: true, guidedTour: true },
    selectableStructures: [
      { id: 'cell_membrane', name: 'Plasma Membrane', role: 'Selectively permeable boundary controlling transport and signaling.', analogy: 'Border control checkpoint.', examFact: 'Singer-Nicolson Fluid Mosaic Model (1972).' },
      { id: 'nucleus', name: 'Nucleus & Nucleolus', role: 'Genetic repository orchestrating transcription and ribosome assembly.', analogy: 'Central command library.', examFact: 'Double membrane with nuclear pore complexes.' },
      { id: 'endoplasmic_reticulum', name: 'Endoplasmic Reticulum', role: 'Folds proteins (Rough ER) and synthesizes lipids/steroids (Smooth ER).', analogy: 'Factory production line.', examFact: 'Rough ER is continuous with the outer nuclear membrane.' },
      { id: 'golgi_apparatus', name: 'Golgi Apparatus', role: 'Modifies, sorts, and packages macromolecules for secretion or delivery.', analogy: 'Postal shipping facility.', examFact: 'Cis face receives vesicles; trans face ships them.' },
      { id: 'mitochondria', name: 'Mitochondria', role: 'Generates cellular ATP energy via oxidative phosphorylation.', analogy: 'Cellular powerhouse generating fuel.', examFact: 'Contains circular mtDNA and double folded cristae.' },
      { id: 'lysosomes', name: 'Lysosomes', role: 'Degrades cellular debris and engulfed foreign materials via acid hydrolases.', analogy: 'Recycling and waste disposal system.', examFact: 'Maintains acidic internal pH of 4.5–5.0.' },
      { id: 'ribosomes', name: 'Ribosomes', role: 'Translates mRNA transcripts into polypeptide chains.', analogy: 'Protein assembly robots.', examFact: 'Composed of 60S and 40S eukaryotic subunits (80S total).' },
      { id: 'cytoplasm', name: 'Cytoplasm & Cytosol', role: 'Aqueous colloidal matrix buffering organelle metabolic pathways.', analogy: 'The bustling factory floor.', examFact: 'Site of anaerobic glycolysis yielding net 2 ATP.' }
    ],
    guidedExplorationSteps: [
      { stepIndex: 0, title: 'Step 1: Plasma Membrane', targetComponentId: 'cell_membrane', description: 'Inspect the lipid bilayer separating the internal cytoplasm from the extracellular matrix.', checkQuestion: 'What model describes the dynamic movement of lipids and proteins in this membrane?' },
      { stepIndex: 1, title: 'Step 2: Nucleus & Nucleolus', targetComponentId: 'nucleus', description: 'Observe the nuclear envelope enclosing genomic DNA and chromosomes.', checkQuestion: 'Which sub-structure inside the nucleus synthesizes ribosomal RNA?' },
      { stepIndex: 2, title: 'Step 3: Endoplasmic Reticulum', targetComponentId: 'endoplasmic_reticulum', description: 'Examine the interconnected membranous tubules studded with ribosomes.', checkQuestion: 'What key molecule does the rough endoplasmic reticulum assemble?' },
      { stepIndex: 3, title: 'Step 4: Golgi Apparatus', targetComponentId: 'golgi_apparatus', description: 'Follow flattened cisternae stacks packaging macromolecules into vesicles.', checkQuestion: 'Which face of the Golgi receives transport vesicles from the ER?' },
      { stepIndex: 4, title: 'Step 5: Mitochondria', targetComponentId: 'mitochondria', description: 'Explore the folded cristae where cellular respiration generates ATP.', checkQuestion: 'What energy currency molecule is synthesized on the inner mitochondrial membrane?' }
    ],
    accessibility: {
      textDescription: 'Interactive 2D vector graphic of a eukaryotic animal cell with 8 selectable structures, progressive zoom up to 250%, panning, and high-contrast focus rings.',
      screenReaderSummary: 'An animal cell diagram displaying cytoplasm, membrane, nucleus, ER, Golgi, mitochondria, ribosomes, and lysosomes.',
      keyboardShortcuts: ['Tab / Shift+Tab to focus organelles', 'Enter / Space to select organelle', '+/- to zoom', '0 or R to reset view', 'Arrow keys to pan'],
      reducedMotionSupport: true
    },
    attribution: {
      source: 'ConceptLens Core Educational Vector System',
      license: 'MIT',
      isOriginalInteractive: true
    }
  },
  {
    id: 'human_heart',
    domain: 'biology',
    title: 'Human Heart: Dual Circulation Circuit',
    shortLabel: 'Human Heart',
    description: 'Explore the 4 cardiac chambers (Atria, Ventricles), pulmonary/systemic circuits, and valve mechanisms.',
    keywords: ['heart', 'cardiac', 'circulation', 'blood', 'ventricle', 'atrium', 'cardiovascular', 'pulmonary'],
    rendererType: 'svg_interactive_2d',
    supportedInteractions: { zoom: true, pan: true, reset: true, rotate: false, inspect: true, playPause: true },
    selectableStructures: [
      { id: 'right_atrium', name: 'Right Atrium', role: 'Receives deoxygenated blood from the vena cavae.', analogy: 'Receiving dock for unoxygenated blood.' },
      { id: 'right_ventricle', name: 'Right Ventricle', role: 'Pumps deoxygenated blood into the pulmonary artery toward lungs.' },
      { id: 'left_atrium', name: 'Left Atrium', role: 'Receives oxygen-rich blood returning from the pulmonary veins.' },
      { id: 'left_ventricle', name: 'Left Ventricle', role: 'Thick muscular chamber pumping oxygenated blood to the entire body via the aorta.' },
      { id: 'aorta', name: 'Aorta', role: 'Main arterial trunk delivering systemic blood pressure.' },
      { id: 'pulmonary_artery', name: 'Pulmonary Artery', role: 'Directs venous blood to the pulmonary capillaries.' }
    ],
    guidedExplorationSteps: [
      { stepIndex: 0, title: 'Right Atrium Intake', targetComponentId: 'right_atrium', description: 'Deoxygenated blood enters the heart from superior and inferior vena cavae.' },
      { stepIndex: 1, title: 'Right Ventricle Pulmonary Ejection', targetComponentId: 'right_ventricle', description: 'Blood flows across the tricuspid valve into the right ventricle and on to the lungs.' },
      { stepIndex: 2, title: 'Left Atrium Oxygenated Return', targetComponentId: 'left_atrium', description: 'Pulmonary veins return freshly oxygenated blood from alveolar gas exchange.' },
      { stepIndex: 3, title: 'Left Ventricle Systemic Pump', targetComponentId: 'left_ventricle', description: 'High-pressure contraction forces blood past aortic valve into systemic circulation.' }
    ],
    accessibility: {
      textDescription: 'Cardiovascular diagram showing 4 cardiac chambers, blood flow arrows, and valve mechanisms with optional pulse animation.',
      screenReaderSummary: 'Diagram of human heart circulation showing atria, ventricles, aorta, and pulmonary vessels.',
      keyboardShortcuts: ['Tab to navigate chambers', 'Enter to inspect', 'P to pause/play pulse'],
      reducedMotionSupport: true
    },
    attribution: {
      source: 'ConceptLens Anatomy Model Catalog',
      license: 'MIT',
      isOriginalInteractive: true
    }
  },
  {
    id: 'dna_helix',
    domain: 'biology',
    title: 'DNA Double Helix & Base Pairing',
    shortLabel: 'DNA Helix',
    description: 'Interactive double helix showing complementary base pairing (A-T with 2 H-bonds, G-C with 3 H-bonds).',
    keywords: ['dna', 'helix', 'genetics', 'base pair', 'nucleotide', 'adenine', 'thymine', 'gene', 'chromosome'],
    rendererType: 'svg_interactive_2d',
    supportedInteractions: { zoom: true, pan: false, reset: true, rotate: false, inspect: true },
    selectableStructures: [
      { id: 'adenine_thymine', name: 'Adenine-Thymine (A-T)', role: 'Purine-pyrimidine base pair joined by 2 hydrogen bonds.', examFact: 'A-T pairs melt at lower temperatures than G-C pairs.' },
      { id: 'guanine_cytosine', name: 'Guanine-Cytosine (G-C)', role: 'Purine-pyrimidine base pair joined by 3 hydrogen bonds.', examFact: 'High GC content increases DNA melting temperature (Tm).' },
      { id: 'sugar_phosphate_backbone', name: 'Sugar-Phosphate Backbone', role: 'Alternating deoxyribose and phosphate groups linked by phosphodiester bonds.' }
    ],
    guidedExplorationSteps: [
      { stepIndex: 0, title: 'Phosphodiester Backbone', targetComponentId: 'sugar_phosphate_backbone', description: 'Forms the 5-prime to 3-prime antiparallel structural rails of the helix.' },
      { stepIndex: 1, title: 'A-T Double Hydrogen Bonds', targetComponentId: 'adenine_thymine', description: 'Two hydrogen bonds form between adenine amino and thymine carbonyl groups.' },
      { stepIndex: 2, title: 'G-C Triple Hydrogen Bonds', targetComponentId: 'guanine_cytosine', description: 'Three hydrogen bonds provide higher thermal and structural stability.' }
    ],
    accessibility: {
      textDescription: 'Biochemical diagram of antiparallel double-stranded DNA showing base pairing rules and hydrogen bond counts.',
      screenReaderSummary: 'DNA diagram illustrating Watson-Crick base pairing with A-T and G-C pairings.',
      keyboardShortcuts: ['Tab to select base pair', 'Enter to view bond count'],
      reducedMotionSupport: true
    },
    attribution: {
      source: 'ConceptLens Molecular Genetics Module',
      license: 'MIT',
      isOriginalInteractive: true
    }
  },
  {
    id: 'neuron',
    domain: 'biology',
    title: 'Neuron & Synaptic Transmission',
    shortLabel: 'Neuron & Synapse',
    description: 'Inspect dendrites, axon hillock, myelin sheath, nodes of Ranvier, and neurotransmitter signaling.',
    keywords: ['neuron', 'brain', 'nerve', 'synapse', 'axon', 'action potential', 'neuroscience', 'dendrite'],
    rendererType: 'svg_interactive_2d',
    supportedInteractions: { zoom: true, pan: true, reset: true, rotate: false, inspect: true },
    selectableStructures: [
      { id: 'soma', name: 'Cell Body (Soma)', role: 'Synthesizes neural enzymes and houses metabolic machinery.' },
      { id: 'dendrites', name: 'Dendritic Tree', role: 'Receives electrochemical post-synaptic potentials from upstream neurons.' },
      { id: 'axon_hillock', name: 'Axon Hillock', role: 'Integrates electrical potentials; initiates all-or-none action potential if threshold reached.' },
      { id: 'myelin_sheath', name: 'Myelin Sheath & Schwann Cells', role: 'Insulative lipid layers accelerating saltatory nerve conduction.' },
      { id: 'nodes_of_ranvier', name: 'Nodes of Ranvier', role: 'Unmyelinated gaps rich in voltage-gated Na+ channels renewing the action potential.' },
      { id: 'synaptic_terminal', name: 'Synaptic Terminal', role: 'Releases neurotransmitter vesicles into the synaptic cleft upon Ca2+ influx.' }
    ],
    guidedExplorationSteps: [
      { stepIndex: 0, title: 'Signal Reception at Dendrites', targetComponentId: 'dendrites', description: 'Neurotransmitters bind receptors on dendritic spines creating graded potentials.' },
      { stepIndex: 1, title: 'Action Potential Generation', targetComponentId: 'axon_hillock', description: 'Voltage threshold is crossed (-55mV), opening voltage-gated sodium channels.' },
      { stepIndex: 2, title: 'Saltatory Axonal Conduction', targetComponentId: 'nodes_of_ranvier', description: 'Action potential jumps rapidly between unmyelinated nodes of Ranvier.' },
      { stepIndex: 3, title: 'Neurotransmitter Release', targetComponentId: 'synaptic_terminal', description: 'Depolarization opens calcium channels, causing exocytosis into the synaptic cleft.' }
    ],
    accessibility: {
      textDescription: 'Neuroanatomical diagram of a multipolar neuron illustrating saltatory conduction and synaptic neurotransmission.',
      screenReaderSummary: 'Neuron diagram showing dendrites, soma, axon, myelin sheath, and synapse.',
      keyboardShortcuts: ['Tab to navigate neural structures', 'Enter to inspect'],
      reducedMotionSupport: true
    },
    attribution: {
      source: 'ConceptLens Neurobiology Series',
      license: 'MIT',
      isOriginalInteractive: true
    }
  },
  {
    id: 'physics_optics',
    domain: 'physics',
    title: 'Convex Lens Ray Tracing Studio',
    shortLabel: 'Ray Optics',
    description: 'Geometric optics ray tracer with adjustable focal length, object distance, and image formation calculations.',
    keywords: ['lens', 'optics', 'convex lens', 'refraction', 'focal length', 'ray tracing', 'physics', 'light', 'focal'],
    rendererType: 'canvas_simulation_2d',
    supportedInteractions: { zoom: false, pan: false, reset: true, rotate: false, inspect: true, parameterSliders: true },
    selectableStructures: [
      { id: 'principal_axis', name: 'Principal Axis', role: 'Optical baseline passing perpendicular through optical center of the lens.' },
      { id: 'focal_point', name: 'Focal Points (F & 2F)', role: 'Points where parallel rays converge after passing through the biconvex lens.' },
      { id: 'object_marker', name: 'Object (u)', role: 'Source object emitting incident rays at specified distance and height.' },
      { id: 'image_formation', name: 'Formed Image (v)', role: 'Real inverted or virtual erect image computed via thin lens formula 1/f = 1/v - 1/u.' }
    ],
    guidedExplorationSteps: [
      { stepIndex: 0, title: 'Gaussian Thin Lens Law', description: 'Observe the mathematical relationship 1/f = 1/v - 1/u as object distance changes.' },
      { stepIndex: 1, title: 'Principal Ray 1: Parallel to Focal', description: 'Ray parallel to principal axis refracts directly through the opposite focal point F.' },
      { stepIndex: 2, title: 'Principal Ray 2: Optical Center', description: 'Ray traveling through the optical center passes undeflected without deviation.' },
      { stepIndex: 3, title: 'Real vs Virtual Inversion', description: 'Placing the object inside focal length (u < f) generates an erect, magnified virtual image.' }
    ],
    accessibility: {
      textDescription: 'Interactive 2D physics canvas calculating Gaussian ray optics with live numeric readouts for object distance, image distance, and magnification.',
      screenReaderSummary: 'Ray optics simulation with sliders for focal length, object distance, and object height.',
      keyboardShortcuts: ['Tab to focus parameter sliders', 'Left/Right arrows to adjust values', 'R to reset parameters'],
      reducedMotionSupport: true
    },
    attribution: {
      source: 'ConceptLens Physics Instrumentation Engine',
      license: 'MIT',
      isOriginalInteractive: true
    }
  },
  {
    id: 'physics_pendulum',
    domain: 'physics',
    title: 'Simple Harmonic Pendulum Physics Studio',
    shortLabel: 'Pendulum (SHM)',
    description: 'Oscillating pendulum simulation displaying real-time restoring force vectors, energy conservation, and period math.',
    keywords: ['pendulum', 'harmonic', 'oscillation', 'shm', 'gravity', 'period', 'mechanics', 'restoring force'],
    rendererType: 'canvas_simulation_2d',
    supportedInteractions: { zoom: false, pan: false, reset: true, rotate: false, inspect: true, parameterSliders: true, playPause: true },
    selectableStructures: [
      { id: 'bob', name: 'Pendulum Bob', role: 'Mass suspended on string experiencing restoring force F = -mg sin(theta).' },
      { id: 'string_length', name: 'Suspension String (L)', role: 'Determines the natural oscillation period T = 2*pi*sqrt(L/g).' },
      { id: 'energy_vectors', name: 'Energy Conservation Bars', role: 'Real-time exchange between potential energy (mgh) and kinetic energy (1/2 mv^2).' }
    ],
    guidedExplorationSteps: [
      { stepIndex: 0, title: 'Harmonic Period Invariance', description: 'Period of oscillation depends only on length and gravity, not on bob mass.' },
      { stepIndex: 1, title: 'Restoring Force Vectors', description: 'Notice how the tangential restoring force peaks at maximal amplitude and hits zero at center.' },
      { stepIndex: 2, title: 'Energy Phase Exchange', description: 'Kinetic energy peaks at the lowest point while potential energy peaks at the endpoints.' }
    ],
    accessibility: {
      textDescription: 'Dynamical harmonic oscillation simulation with live kinetic/potential energy bars, force vectors, and period readouts.',
      screenReaderSummary: 'Interactive simple pendulum showing oscillating motion, energy conservation, and period formula.',
      keyboardShortcuts: ['Space to pause/resume motion', 'Sliders to adjust string length and gravity', 'R to reset'],
      reducedMotionSupport: true
    },
    attribution: {
      source: 'ConceptLens Dynamical Physics Engine',
      license: 'MIT',
      isOriginalInteractive: true
    }
  },
  {
    id: 'data_structure',
    domain: 'data_structure',
    title: 'Linked List Pointer Engine',
    shortLabel: 'Linked List',
    description: 'Deterministic dynamic pointer simulation stepping through node allocations, traversals, and deletions.',
    keywords: ['linked list', 'pointer', 'node', 'data structure', 'recursion', 'head', 'memory address', 'traversal'],
    rendererType: 'svg_interactive_2d',
    supportedInteractions: { zoom: false, pan: false, reset: true, rotate: false, inspect: true, playPause: true },
    selectableStructures: [
      { id: 'head_node', name: 'Head Pointer', role: 'Primary reference holding memory address of the first node in the chain.' },
      { id: 'node_value', name: 'Data Payload', role: 'Stored value or key inside the allocated node memory chunk.' },
      { id: 'next_pointer', name: 'Next Address Pointer', role: 'Direct memory reference pointing to the succeeding node or null.' },
      { id: 'null_terminator', name: 'Null Terminator', role: 'Ground reference marking the end of a non-circular linked list.' }
    ],
    guidedExplorationSteps: [
      { stepIndex: 0, title: 'Node Allocation', description: 'Heap allocation of new node structure with initialized payload and null next pointer.' },
      { stepIndex: 1, title: 'Pointer Assignment', description: 'Re-linking pointer addresses to splice new node at head or between existing nodes.' },
      { stepIndex: 2, title: 'Linear Traversal', description: 'Iterating current = current.next until reaching the null terminator in O(n) time.' }
    ],
    accessibility: {
      textDescription: 'Interactive graph diagram of heap-allocated linked list nodes connected by pointer arrows with memory address hex tags.',
      screenReaderSummary: 'Linked list visualizer with step controls, pointer state inspector, and invariant validation.',
      keyboardShortcuts: ['N for next step', 'P for previous step', 'R to reset list'],
      reducedMotionSupport: true
    },
    attribution: {
      source: 'ConceptLens Computer Science Invariant Suite',
      license: 'MIT',
      isOriginalInteractive: true
    }
  }
];

/**
 * Matches an input concept string against the 8 visual simulation models.
 */
export function detectInteractiveVisualModel(concept: string): VisualModelMeta | null {
  if (!concept || typeof concept !== 'string') return null;
  const normalized = concept.toLowerCase().trim();
  for (const model of AVAILABLE_VISUAL_MODELS) {
    if (model.keywords.some((kw) => normalized.includes(kw))) {
      return model;
    }
  }
  return null;
}

/**
 * Returns an honest educational explanation for why a given concept does not have
 * a 1-to-1 physical 2D/3D simulation model, while guiding the learner.
 */
export function getVisualModelFallbackExplanation(topic: string): string {
  return `"${topic}" is an abstract or conceptual subject that does not map to a physical 2D/3D biological or mechanical model. Use the Read, Simplified, or Step-by-Step tabs for this concept, or explore one of the 8 interactive scientific models from our catalog above.`;
}
