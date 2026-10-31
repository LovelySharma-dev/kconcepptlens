import { UniversalInteractiveDiagram } from '@conceptlens/shared';

export const universalDiagramCatalog: Record<string, UniversalInteractiveDiagram> = {
  // -------------------------------------------------------------
  // 1. BIOLOGY: HUMAN HEART BLOOD CIRCULATION
  // -------------------------------------------------------------
  heart_circulation: {
    id: 'bio_heart_circulation',
    domain: 'biology',
    subject: 'Biology & Human Physiology',
    topic: 'Cardiovascular System & Blood Circulation',
    title: 'Double Circulation: Human Heart & Pulmonary Circuit',
    description:
      'Interactive physiological simulation of cardiac blood flow. Adjust heart rate (BPM) and stroke volume to witness dynamic systolic/diastolic chamber contractions, oxygenated vs deoxygenated blood pathways, and cardiac output.',
    originalImageUrl:
      'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=1200&q=80',
    controls: [
      { id: 'heartRate', label: 'Heart Rate (HR)', min: 40, max: 180, step: 2, unit: 'BPM', defaultValue: 72, description: 'Number of heart contractions per minute' },
      { id: 'strokeVolume', label: 'Stroke Volume (SV)', min: 40, max: 120, step: 2, unit: 'mL', defaultValue: 70, description: 'Volume of blood pumped from left ventricle per beat' },
      { id: 'oxygenationLevel', label: 'Blood Oxygenation (SpO2)', min: 80, max: 100, step: 1, unit: '%', defaultValue: 98, description: 'Percentage of arterial hemoglobin saturation' }
    ],
    elements: [
      { id: 'superior_vena_cava', type: 'arrow', label: 'Superior & Inferior Vena Cava', detail: 'Carries deoxygenated blood from the body tissues into right atrium.', x: 300, y: 80, color: '#38bdf8' },
      { id: 'right_atrium', type: 'organ', label: 'Right Atrium (RA)', detail: 'Receives systemic deoxygenated blood and pumps it through tricuspid valve into RV.', x: 340, y: 150, width: 80, height: 70, color: 'rgba(56, 189, 248, 0.25)', strokeColor: '#38bdf8' },
      { id: 'right_ventricle', type: 'organ', label: 'Right Ventricle (RV)', detail: 'Pumps deoxygenated blood through pulmonary valve toward pulmonary arteries.', x: 350, y: 240, width: 90, height: 80, color: 'rgba(56, 189, 248, 0.3)', strokeColor: '#38bdf8' },
      { id: 'pulmonary_artery', type: 'arrow', label: 'Pulmonary Arteries', detail: 'Directs deoxygenated blood to alveoli in lungs for gas exchange.', x: 420, y: 110, color: '#0284c7' },
      { id: 'lungs', type: 'organ', label: 'Pulmonary Capillaries (Lungs)', detail: 'Diffusion of CO2 into alveoli and absorption of O2 into red blood cells.', x: 480, y: 60, width: 140, height: 50, color: 'rgba(192, 132, 252, 0.2)', strokeColor: '#c084fc' },
      { id: 'left_atrium', type: 'organ', label: 'Left Atrium (LA)', detail: 'Receives oxygen-rich blood returning from the four pulmonary veins.', x: 540, y: 150, width: 80, height: 70, color: 'rgba(244, 63, 94, 0.25)', strokeColor: '#f43f5e' },
      { id: 'left_ventricle', type: 'organ', label: 'Left Ventricle (LV)', detail: 'Thick muscular chamber generating high pressure to pump oxygenated blood into aorta.', x: 530, y: 240, width: 100, height: 85, color: 'rgba(244, 63, 94, 0.35)', strokeColor: '#f43f5e' },
      { id: 'aorta', type: 'arrow', label: 'Systemic Aorta', detail: 'Distributes oxygenated blood to head, limbs, and vital organs across the body.', x: 480, y: 140, color: '#f43f5e' }
    ],
    metrics: [
      { label: 'Cardiac Output (CO)', value: '5.04', unit: 'L/min', formula: 'CO = HR × SV / 1000' },
      { label: 'Circulation Cycle Time', value: '0.83', unit: 'sec', formula: 'Cycle = 60 / HR' },
      { label: 'Ventricle Wall Stress', value: 'Normal (St. Jude Score A)' }
    ],
    formulas: [
      { label: 'Cardiac Output Principle', formula: 'Cardiac Output (CO) = Heart Rate (HR) × Stroke Volume (SV)', explanation: 'Total volume of blood pumped by each ventricle per unit time.' },
      { label: 'Mean Arterial Pressure (MAP)', formula: 'MAP = Diastolic BP + 1/3 (Systolic BP - Diastolic BP)', explanation: 'Perfusion pressure seen by organs in the systemic circulation.' }
    ]
  },

  // -------------------------------------------------------------
  // 2. BIOLOGY: NEURON ACTION POTENTIAL
  // -------------------------------------------------------------
  neuron_action_potential: {
    id: 'bio_neuron_action_potential',
    domain: 'biology',
    subject: 'Neurobiology',
    topic: 'Membrane Excitability & Nerve Impulses',
    title: 'Neuron Anatomy & Action Potential Propagation',
    description:
      'Explore nerve signal transmission. Adjust resting membrane potential and stimulus intensity to trigger voltage-gated Na⁺ / K⁺ channels, depolarize the axon hillock, and fire an all-or-none action potential.',
    originalImageUrl:
      'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=80',
    controls: [
      { id: 'stimulusCurrent', label: 'Stimulus Current (I_inj)', min: 0, max: 25, step: 1, unit: 'μA', defaultValue: 12, description: 'Injected current into soma' },
      { id: 'extracellularK', label: 'Extracellular K⁺ ([K⁺]out)', min: 2, max: 12, step: 0.5, unit: 'mM', defaultValue: 4.5, description: 'Potassium ion concentration influencing resting potential' },
      { id: 'myelinationFactor', label: 'Myelination Integrity', min: 20, max: 100, step: 5, unit: '%', defaultValue: 90, description: 'Saltatory conduction efficiency along Nodes of Ranvier' }
    ],
    elements: [
      { id: 'dendrites', type: 'component', label: 'Dendritic Tree', detail: 'Receives chemical neurotransmitters from presynaptic axons.', x: 140, y: 180, color: '#38bdf8' },
      { id: 'soma', type: 'organ', label: 'Soma (Cell Body & Nucleus)', detail: 'Integrates excitatory (EPSP) and inhibitory (IPSP) postsynaptic potentials.', x: 260, y: 180, radius: 45, color: '#6366f1' },
      { id: 'axon_hillock', type: 'node', label: 'Axon Hillock (Trigger Zone)', detail: 'Highest density of voltage-gated Na+ channels; fires if threshold reaches -55mV.', x: 340, y: 180, color: '#f59e0b' },
      { id: 'myelin_axon', type: 'rect', label: 'Myelinated Axon (Nodes of Ranvier)', detail: 'Enables rapid saltatory conduction jumping from node to node.', x: 500, y: 180, width: 220, height: 16, color: '#10b981' },
      { id: 'synaptic_terminal', type: 'component', label: 'Axon Bouton & Synaptic Cleft', detail: 'Voltage-gated Ca2+ influx causes exocytosis of neurotransmitter vesicles.', x: 760, y: 180, color: '#f43f5e' }
    ],
    metrics: [
      { label: 'Membrane Potential (Vm)', value: '+30', unit: 'mV', formula: 'Peak Depolarization' },
      { label: 'Conduction Velocity', value: '110', unit: 'm/s', formula: 'Saltatory Conduction' },
      { label: 'Firing State', value: 'Action Potential Discharged!' }
    ],
    formulas: [
      { label: 'Nernst Equilibrium Equation', formula: 'E_ion = (RT / zF) · ln([ion]_out / [ion]_in)', explanation: 'Calculates the equilibrium electrical potential for a single permeant ion species.' },
      { label: 'Goldman-Hodgkin-Katz (GHK)', formula: 'Vm = (RT/F) · ln( (P_K[K]o + P_Na[Na]o + P_Cl[Cl]i) / (P_K[K]i + P_Na[Na]i + P_Cl[Cl]o) )', explanation: 'Determines resting membrane potential taking multiple ion permeabilities into account.' }
    ]
  },

  // -------------------------------------------------------------
  // 3. CHEMISTRY: ACID-BASE TITRATION CURVE
  // -------------------------------------------------------------
  titration_curve: {
    id: 'chem_titration_curve',
    domain: 'chemistry',
    subject: 'Analytical Chemistry',
    topic: 'Acid-Base Equilibria & Buffers',
    title: 'Strong Acid - Strong Base Titration Curve',
    description:
      'Simulate titration of HCl with standardized NaOH. Turn the burette stopcock to add titrant, track sudden pH inflection around equivalence point (pH 7.0), and visualize indicator color shifts.',
    originalImageUrl:
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80',
    controls: [
      { id: 'volumeTitrant', label: 'Volume NaOH Added (Vb)', min: 0, max: 50, step: 0.5, unit: 'mL', defaultValue: 25, description: 'Milliliters of 0.1M sodium hydroxide titrant delivered from buret' },
      { id: 'acidConcentration', label: 'Analyte Concentration (Ma)', min: 0.05, max: 0.5, step: 0.01, unit: 'M', defaultValue: 0.1, description: 'Molarity of hydrochloric acid in Erlenmeyer flask' },
      { id: 'indicatorType', label: 'Indicator (0: Phenol, 1: Bromothymol)', min: 0, max: 1, step: 1, unit: 'mode', defaultValue: 0, description: 'Selected pH color indicator' }
    ],
    elements: [
      { id: 'buret', type: 'rect', label: 'Calibrated Burette (NaOH)', detail: 'Contains standard titrant Solution (0.100 M NaOH).', x: 220, y: 120, width: 24, height: 160, color: 'rgba(56, 189, 248, 0.4)' },
      { id: 'flask', type: 'path', label: 'Analyte Flask (HCl + Indicator)', detail: 'Contains 25.0 mL of unknown HCl solution with magnetic stirrer.', x: 220, y: 280, color: 'rgba(244, 63, 94, 0.2)' },
      { id: 'ph_sensor', type: 'node', label: 'Glass pH Electrode', detail: 'Measures hydrogen ion activity in real time.', x: 235, y: 260, color: '#f59e0b' }
    ],
    metrics: [
      { label: 'Instantaneous pH', value: '7.00', unit: 'pH' },
      { label: 'Solution Hydronium [H3O+]', value: '1.0 × 10⁻⁷', unit: 'M' },
      { label: 'Equivalence State', value: 'Exact Stoichiometric Neutralization' }
    ],
    formulas: [
      { label: 'Definition of pH', formula: 'pH = -log₁₀[H⁺]', explanation: 'Logarithmic measure of free hydronium ion concentration in aqueous solution.' },
      { label: 'Stoichiometric Equivalence', formula: 'Ma · Va = Mb · Vb', explanation: 'Condition where moles of base added exactly equals initial moles of acid present.' }
    ]
  },

  // -------------------------------------------------------------
  // 4. CHEMISTRY: RUTHERFORD-BOHR ATOM MODEL
  // -------------------------------------------------------------
  bohr_atom: {
    id: 'chem_bohr_atom',
    domain: 'chemistry',
    subject: 'Atomic Structure & Quantum Mechanics',
    topic: 'Electronic Shells & Spectral Transitions',
    title: 'Bohr Planetary Atom & Quantized Energy Shells',
    description:
      'Adjust atomic number (Z) to observe electron configuration in K (n=1), L (n=2), and M (n=3) shells. Excite electrons between quantum states to observe spectral photon emission.',
    originalImageUrl:
      'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=80',
    controls: [
      { id: 'atomicNumber', label: 'Atomic Number (Z)', min: 1, max: 18, step: 1, unit: 'protons', defaultValue: 6, description: 'Selects chemical element from Hydrogen (1) to Argon (18)' },
      { id: 'excitedState', label: 'Outer Shell Excitation (n)', min: 1, max: 3, step: 1, unit: 'n', defaultValue: 2, description: 'Principle quantum number of valence electron' }
    ],
    elements: [
      { id: 'nucleus', type: 'circle', label: 'Dense Atomic Nucleus', detail: 'Contains Z protons and (A - Z) neutrons held by the strong nuclear force.', x: 480, y: 180, radius: 24, color: '#f43f5e' },
      { id: 'shell_k', type: 'circle', label: 'K-Shell (n = 1, max 2 e⁻)', detail: 'Innermost quantized energy level: -13.6 eV for hydrogen.', x: 480, y: 180, radius: 65, color: 'none', strokeColor: 'rgba(56, 189, 248, 0.5)' },
      { id: 'shell_l', type: 'circle', label: 'L-Shell (n = 2, max 8 e⁻)', detail: 'Second quantized shell: radius = 4 · a0.', x: 480, y: 180, radius: 110, color: 'none', strokeColor: 'rgba(192, 132, 252, 0.4)' },
      { id: 'shell_m', type: 'circle', label: 'M-Shell (n = 3, max 8 e⁻)', detail: 'Third principal quantum shell.', x: 480, y: 180, radius: 155, color: 'none', strokeColor: 'rgba(16, 185, 129, 0.3)' }
    ],
    metrics: [
      { label: 'Element', value: 'Carbon (C-12)' },
      { label: 'Electron Configuration', value: '2, 4  (K=2, L=4)' },
      { label: 'Binding Energy (Valence)', value: '-3.4', unit: 'eV' }
    ],
    formulas: [
      { label: 'Quantized Bohr Radius', formula: 'r_n = (n² · ℏ²) / (m_e · k_e · Z · e²)', explanation: 'Allowed orbital radii scale with square of the principal quantum number (n).' },
      { label: 'Rydberg Spectral Formula', formula: '1 / λ = R_H · Z² · (1/n₁² - 1/n₂²)', explanation: 'Wavelength of emitted photon during an electron transition between energy levels.' }
    ]
  },

  // -------------------------------------------------------------
  // 5. MATHEMATICS: TRIGONOMETRIC UNIT CIRCLE
  // -------------------------------------------------------------
  trig_unit_circle: {
    id: 'math_trig_unit_circle',
    domain: 'mathematics',
    subject: 'Trigonometry & Calculus',
    topic: 'Circular Functions & Periodic Waves',
    title: 'The Trigonometric Unit Circle (sin, cos, tan)',
    description:
      'Interactive unit circle with radius R=1. Rotate the angle θ slider from 0° to 360° to witness dynamic projections: horizontal cosine (amber), vertical sine (cyan), and tangent asymptote (purple).',
    originalImageUrl:
      'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&q=80',
    controls: [
      { id: 'angleDeg', label: 'Rotation Angle (θ)', min: 0, max: 360, step: 1, unit: '°', defaultValue: 45, description: 'Angle of radius vector measured counter-clockwise from positive x-axis' },
      { id: 'displayMode', label: 'Display (0: Degree, 1: Radians)', min: 0, max: 1, step: 1, unit: 'mode', defaultValue: 0, description: 'Coordinate axis representation format' }
    ],
    elements: [
      { id: 'circle_boundary', type: 'circle', label: 'Unit Circle (x² + y² = 1)', detail: 'Locus of points at unit distance 1 from origin.', x: 440, y: 180, radius: 120, color: 'rgba(255,255,255,0.02)', strokeColor: 'rgba(255, 255, 255, 0.4)' },
      { id: 'radius_vector', type: 'vector', label: 'Radius Hypotenuse (r = 1)', detail: 'Direct line segment connecting (0,0) to point P(cos θ, sin θ).', x: 440, y: 180, color: '#f8fafc' },
      { id: 'cos_projection', type: 'vector', label: 'Cosine Projection (Adjacent)', detail: 'x-coordinate of intersection: cos(θ)', x: 440, y: 180, color: '#f59e0b' },
      { id: 'sin_projection', type: 'vector', label: 'Sine Projection (Opposite)', detail: 'y-coordinate of intersection: sin(θ)', x: 440, y: 180, color: '#38bdf8' }
    ],
    metrics: [
      { label: 'sin(θ)', value: '0.707' },
      { label: 'cos(θ)', value: '0.707' },
      { label: 'tan(θ)', value: '1.000' },
      { label: 'Angle in Radians', value: 'π/4 (0.785 rad)' }
    ],
    formulas: [
      { label: 'Pythagorean Trigonometric Identity', formula: 'sin²(θ) + cos²(θ) = 1', explanation: 'Fundamental relation holding for every real angle θ derived from right-angle triangle coordinates.' },
      { label: 'Euler’s Circular Formula', formula: 'e^(iθ) = cos(θ) + i · sin(θ)', explanation: 'Establishes profound equivalence between complex exponentiation and circular trigonometry.' }
    ]
  },

  // -------------------------------------------------------------
  // 6. ECONOMICS: SUPPLY & DEMAND MARKET EQUILIBRIUM
  // -------------------------------------------------------------
  supply_demand: {
    id: 'econ_supply_demand',
    domain: 'economics',
    subject: 'Microeconomics',
    topic: 'Market Clearing & Price Elasticity',
    title: 'Market Equilibrium: Supply & Demand Dynamics',
    description:
      'Interactive economic model. Shift consumer demand or producer supply curves to discover the market equilibrium price (P*) and quantity (Q*), and inspect consumer vs producer surplus.',
    originalImageUrl:
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    controls: [
      { id: 'demandShift', label: 'Consumer Demand Shift (ΔD)', min: -40, max: 40, step: 2, unit: 'units', defaultValue: 0, description: 'Shift in demand curve caused by income, population, or preference' },
      { id: 'supplyShift', label: 'Producer Supply Shift (ΔS)', min: -40, max: 40, step: 2, unit: 'units', defaultValue: 0, description: 'Shift in supply curve caused by production technology or input costs' },
      { id: 'taxAmount', label: 'Excise Tax per Unit (t)', min: 0, max: 15, step: 1, unit: '$', defaultValue: 0, description: 'Government excise tax wedge introduced between buyer and seller' }
    ],
    elements: [
      { id: 'demand_curve', type: 'path', label: 'Demand Curve (Downward Sloping)', detail: 'Law of Demand: Consumers purchase greater quantity as price drops.', x: 120, y: 80, color: '#38bdf8' },
      { id: 'supply_curve', type: 'path', label: 'Supply Curve (Upward Sloping)', detail: 'Law of Supply: Producers offer higher quantity as price rises.', x: 120, y: 280, color: '#f43f5e' },
      { id: 'equilibrium_point', type: 'circle', label: 'Market Equilibrium (E)', detail: 'Point where Quantity Demanded equals Quantity Supplied (no surplus or shortage).', x: 440, y: 180, radius: 8, color: '#10b981' }
    ],
    metrics: [
      { label: 'Equilibrium Price (P*)', value: '$24.50' },
      { label: 'Equilibrium Quantity (Q*)', value: '420', unit: 'units' },
      { label: 'Market Condition', value: 'Market Cleared (Zero Deadweight Loss)' }
    ],
    formulas: [
      { label: 'Market Clearing Condition', formula: 'Q_demand(P) = Q_supply(P)', explanation: 'The price at which intentions of buyers and sellers coincide without shortage or surplus.' },
      { label: 'Total Economic Surplus', formula: 'Total Surplus = Consumer Surplus + Producer Surplus', explanation: 'Measure of net societal welfare generated by market transactions.' }
    ]
  },

  // -------------------------------------------------------------
  // 7. COMPUTER SCIENCE: BINARY SEARCH TREE (BST)
  // -------------------------------------------------------------
  binary_search_tree: {
    id: 'cs_binary_search_tree',
    domain: 'computer_science',
    subject: 'Computer Science & Data Structures',
    topic: 'Hierarchical Trees & Logarithmic Search',
    title: 'Binary Search Tree (BST) & In-Order Invariant',
    description:
      'Interactive BST visualizer with logarithmic search properties: left subtree contains values strictly smaller than root, and right subtree contains values strictly greater.',
    originalImageUrl:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    controls: [
      { id: 'searchKey', label: 'Search Target Value', min: 10, max: 90, step: 1, unit: 'val', defaultValue: 30, description: 'Value to search for using binary branching' },
      { id: 'treeDepth', label: 'Tree Depth Limit', min: 2, max: 4, step: 1, unit: 'levels', defaultValue: 3, description: 'Maximum depth level of tree nodes' }
    ],
    elements: [
      { id: 'bst_root', type: 'node', label: '50 (Root)', detail: 'Key value 50. Left subtree keys < 50; right subtree keys > 50.', x: 480, y: 80, radius: 24, color: '#6366f1' },
      { id: 'bst_n30', type: 'node', label: '30 (Left Child)', detail: 'Key 30 < 50.', x: 320, y: 160, radius: 22, color: '#38bdf8' },
      { id: 'bst_n70', type: 'node', label: '70 (Right Child)', detail: 'Key 70 > 50.', x: 640, y: 160, radius: 22, color: '#38bdf8' },
      { id: 'bst_n20', type: 'node', label: '20', detail: 'Leaf node: 20 < 30.', x: 240, y: 240, radius: 20, color: '#10b981' },
      { id: 'bst_n40', type: 'node', label: '40', detail: 'Leaf node: 40 > 30.', x: 400, y: 240, radius: 20, color: '#10b981' },
      { id: 'bst_n60', type: 'node', label: '60', detail: 'Leaf node: 60 < 70.', x: 560, y: 240, radius: 20, color: '#10b981' },
      { id: 'bst_n80', type: 'node', label: '80', detail: 'Leaf node: 80 > 70.', x: 720, y: 240, radius: 20, color: '#10b981' }
    ],
    metrics: [
      { label: 'Time Complexity (Search)', value: 'O(log N) = 3 comparisons' },
      { label: 'In-Order Traversal', value: '[20, 30, 40, 50, 60, 70, 80] (Strictly Sorted)' },
      { label: 'Tree Balance Factor', value: 'Balanced AVL-Compliant' }
    ],
    formulas: [
      { label: 'BST Structural Invariant', formula: '∀ node: max(LeftSubtree) < node.val < min(RightSubtree)', explanation: 'Every node in a binary search tree must maintain sorted ordering.' },
      { label: 'Search Recurrence', formula: 'T(N) = T(N/2) + O(1)  =>  O(log N)', explanation: 'Halves search space at each branch comparison.' }
    ]
  }
};
