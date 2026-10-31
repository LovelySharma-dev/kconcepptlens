import { BiologyLesson, BiologyTopicId } from '@conceptlens/shared';

export const clientBiologyCatalog: Record<BiologyTopicId, BiologyLesson> = {
  // -------------------------------------------------------------------------
  // TOPIC A: HUMAN CELL (ANIMAL CELL) — INTERACTIVE 2D + 3D
  // -------------------------------------------------------------------------
  human_cell: {
    id: 'human_cell',
    title: 'The Animal Cell: Architecture & Organelles',
    subtitle: 'Labeled diagram of eukaryotic cellular machinery',
    category: 'Cell Biology & Cytology',
    description:
      'Explore the internal anatomy of a eukaryotic animal cell. Examine how membrane-bound organelles synthesize proteins, generate energy via oxidative phosphorylation, process macromolecular shipments, and preserve genetic integrity.',
    defaultMode: '2d',
    has3D: false,
    quickFact:
      'An adult human body contains approximately 37.2 trillion eukaryotic cells, each maintaining specialized microenvironments via selectively permeable lipid membranes.',
    sampleOriginalImageUrl: 'https://res.cloudinary.com/demo/image/upload/c_scale,w_900/sample.jpg',
    sampleCloudinaryUrl: 'https://res.cloudinary.com/demo/image/upload/c_limit,w_900/e_sharpen:80,e_contrast/f_auto,q_auto/sample.jpg',
    components: [
      {
        id: 'cell_membrane',
        name: 'Plasma Membrane',
        scientificName: 'Plasmalemma (Phospholipid Bilayer)',
        location: 'Outermost boundary of animal cell, separating cytosol from extracellular fluid.',
        function:
          'Forms a dynamic, selectively permeable barrier regulating ion gradients, receptor-mediated signaling, and transport of nutrients and waste via channels, pumps, and endocytosis.',
        analogy: 'The Security Gate & Border Control: Guards checkpoints and decides who gets in and out.',
        scientificExplanation:
          'Conforms to the Singer-Nicolson Fluid Mosaic Model. Consists of amphipathic phosphoglycerides, sphingolipids, and cholesterol molecules that modulate membrane fluidity. Integral transmembrane proteins and peripheral proteins facilitate active/passive solute transport and signal transduction.',
        simpleExplanation:
          'The flexible outer protective skin of the cell that keeps the inside in and the outside out.',
        examFacts: [
          'Proposed by Singer & Nicolson (1972) as the Fluid Mosaic Model.',
          'Cholesterol acts as a fluidity buffer: prevents membrane freezing at low temps and restricts excess fluidity at high temps.',
          'Small nonpolar molecules (O2, CO2) diffuse freely; ions and polar solutes require protein transporters.'
        ],
        relatedConcepts: ['Fluid Mosaic Model', 'Passive & Active Transport', 'Endocytosis', 'Resting Membrane Potential'],
        color: '#00f2fe',
        strokeColor: '#38bdf8',
        position2D: { x: 400, y: 250, radius: 210 },
        position3D: { x: 0, y: 0, z: 0 }
      },
      {
        id: 'cytoplasm',
        name: 'Cytoplasm & Cytosol',
        scientificName: 'Cytosol and Cytoskeleton Matrix',
        location: 'Entire interior cellular volume bounded by the plasma membrane, excluding the nucleus.',
        function:
          'Provides an aqueous, enzyme-rich medium for enzymatic pathways (including glycolysis and translation) and structural scaffolding through actin microfilaments, tubulin microtubules, and intermediate filaments.',
        analogy: 'The Factory Floor: The bustling workspace where raw materials move and assembly takes place.',
        scientificExplanation:
          'Viscous aqueous solution of dissolved salts, free ribonucleotides, amino acids, and macromolecular complexes. Hosts cytosolic metabolic cascades (glycolysis, gluconeogenesis, pentose phosphate pathway) and enables molecular motor-driven intracellular transport (kinesin/dynein).',
        simpleExplanation:
          'The jelly-like fluid that fills the cell and cushions the organelles so they do not collide.',
        examFacts: [
          'Site of anaerobic glycolysis yielding a net 2 ATP and 2 NADH per glucose molecule.',
          'Maintains physiological intracellular pH tightly buffered around 7.2.',
          'Actin filaments facilitate cytoplasmic streaming (cyclosis).'
        ],
        relatedConcepts: ['Cytoskeleton', 'Glycolysis', 'Cyclosis', 'Intracellular Osmolarity'],
        color: '#1e293b',
        strokeColor: '#475569',
        position2D: { x: 400, y: 250, radius: 185 },
        position3D: { x: 0, y: 0, z: 0 }
      },
      {
        id: 'nucleus',
        name: 'Nucleus & Nucleolus',
        scientificName: 'Nucleus (Karyoplasm & Nucleolus)',
        location: 'Prominent spherical or ovoid structure usually situated near the center of the cell.',
        function:
          'Encloses the cell genome (chromatin/chromosomes), directs transcription and replication, and synthesizes ribosomal RNA (rRNA) subunits within the non-membrane bound nucleolus.',
        analogy: 'The Executive Control Center & Blueprint Library: The central vault holding the master instructions.',
        scientificExplanation:
          'Enclosed by a double-membrane nuclear envelope supported internally by nuclear lamins. Octagonal nuclear pore complexes (~120 nm diameter) regulate bidirectional nucleocytoplasmic transit of RNA and proteins. The nucleolus is the transcription site for 45S pre-rRNA catalyzed by RNA Polymerase I.',
        simpleExplanation:
          'The headquarters or brain of the cell that safely guards your DNA and tells the cell how to grow and build proteins.',
        examFacts: [
          'Enclosed by a double membrane with perinuclear space (10-50 nm wide).',
          'Nuclear pores contain nucleoporin rings regulating macromolecular export (mRNA-protein complexes).',
          'Nucleolus disappears during prophase and reappears during telophase of mitosis.'
        ],
        relatedConcepts: ['Nuclear Pore Complex', 'Euchromatin vs Heterochromatin', 'Transcription', 'Endomembrane System'],
        color: '#8b5cf6',
        strokeColor: '#a78bfa',
        position2D: { x: 400, y: 240, radius: 70 },
        position3D: { x: 0, y: 0, z: 0 }
      },
      {
        id: 'mitochondria',
        name: 'Mitochondria',
        scientificName: 'Mitochondrion (Chondriosome)',
        location: 'Scattered across the cytoplasm, concentrated in regions with high energy demand (e.g. muscle, synapses).',
        function:
          'Generates the vast majority of cellular ATP through the citric acid cycle (Krebs cycle), beta-oxidation of fatty acids, and oxidative phosphorylation along the electron transport chain (ETC).',
        analogy: 'The Powerhouse of the Cell: The electrical power station burning fuel to charge the cell batteries (ATP).',
        scientificExplanation:
          'Bounded by two membranes: a permeable outer membrane with porin channels and a folded inner membrane (cristae) with high cardiolipin content and low permeability. The electrochemical proton gradient established across the intermembrane space powers ATP Synthase (F0F1 complex) via chemiosmosis.',
        simpleExplanation:
          'Small bean-shaped organelles that turn the food you eat and the oxygen you breathe into usable energy packets called ATP.',
        examFacts: [
          'Contains its own double-stranded circular mtDNA and 70S ribosomes (Endosymbiotic Theory).',
          'Replicates independently within the cell via binary fission.',
          'Inherited strictly maternally in human genetics.'
        ],
        relatedConcepts: ['Oxidative Phosphorylation', 'Chemiosmotic Hypothesis', 'Krebs Cycle', 'Endosymbiosis'],
        color: '#f59e0b',
        strokeColor: '#fbbf24',
        position2D: { x: 260, y: 220, width: 70, height: 40 },
        position3D: { x: -1.6, y: 0.4, z: 0.3 }
      },
      {
        id: 'endoplasmic_reticulum',
        name: 'Endoplasmic Reticulum',
        scientificName: 'Rough and Smooth Endoplasmic Reticulum (RER & SER)',
        location: 'Extensive interconnected membranous cisternae continuous with the outer nuclear envelope.',
        function:
          'Rough ER (studded with 80S ribosomes) synthesizes and folds transmembrane, secretory, and lysosomal proteins; Smooth ER synthesizes lipids, metabolizes carbohydrates, and sequesters intracellular calcium.',
        analogy: 'The Assembly Line & Highway System: The industrial manufacturing belts and transport pipes.',
        scientificExplanation:
          'Rough ER carries Sec61 translocons where signal peptides guide nascent polypeptides into the lumen for N-linked glycosylation and chaperone folding (BiP/calnexin). Smooth ER contains cytochrome P450 enzymes for xenobiotic detoxification and serves as sarcoplasmic reticulum in muscle.',
        simpleExplanation:
          'A folded highway network: the bumpy side makes proteins and the smooth side makes oils/fats and cleans up toxins.',
        examFacts: [
          'Signal Hypothesis (Blobel, Nobel Prize 1999): SRP binds signal peptide to arrest translation until docked onto RER.',
          'Smooth ER is abundant in steroid-producing adrenal cortex cells and detoxifying liver hepatocytes.',
          'Provides transitional vesicles that travel to the cis-face of the Golgi.'
        ],
        relatedConcepts: ['Signal Peptide', 'Protein Folding', 'Lipid Biosynthesis', 'Sarcoplasmic Reticulum'],
        color: '#10b981',
        strokeColor: '#34d399',
        position2D: { x: 400, y: 340, width: 140, height: 60 },
        position3D: { x: 0.2, y: -1.2, z: 0.2 }
      },
      {
        id: 'golgi_apparatus',
        name: 'Golgi Apparatus',
        scientificName: 'Golgi Complex / Dictyosome',
        location: 'Near the nucleus and centrosome, positioned downstream from the rough endoplasmic reticulum.',
        function:
          'Receives protein and lipid cargo from ER transitional vesicles, carries out post-translational modification (O-glycosylation, phosphorylation, sulfation), sorts, and directs packages to their final destinations.',
        analogy: 'The Post Office & Fulfillment Center: Packages, tags with barcodes, and ships products out.',
        scientificExplanation:
          'Polarized organelle composed of 4-8 flattened, curved cisternae with distinct enzymatic compartments: cis-Golgi (receiving network), medial-Golgi, and trans-Golgi Network (TGN - sorting and budding hub). Mannose-6-phosphate tagging specifically routes enzymes to lysosomes.',
        simpleExplanation:
          'The shipping department that puts finishing touches, destination labels, and wrappers on proteins before sending them out.',
        examFacts: [
          'Discovered by Camillo Golgi in 1898 using silver nitrate impregnation staining.',
          'Retrograde vesicle transport (Golgi -> ER) uses COP-I coats; anterograde (ER -> Golgi) uses COP-II coats.',
          'Known as Dictyosomes in plant cells.'
        ],
        relatedConcepts: ['Post-Translational Modification', 'COP-I & COP-II Vesicles', 'Exocytosis', 'Lysosomal Targeting'],
        color: '#ec4899',
        strokeColor: '#f472b6',
        position2D: { x: 530, y: 220, width: 80, height: 50 },
        position3D: { x: 1.5, y: -0.3, z: 0.4 }
      },
      {
        id: 'lysosomes',
        name: 'Lysosomes',
        scientificName: 'Lysosome (Acid Hydrolase Vesicle)',
        location: 'Evenly distributed membrane-bound spherical vesicles throughout the cytosol.',
        function:
          'Executes intracellular digestion, degradation of extracellular materials ingested via endocytosis, and turnover of damaged organelles through macroautophagy.',
        analogy: 'The Recycling Center & Garbage Disposal: Breaks down scrap materials and old machinery.',
        scientificExplanation:
          'Single-membrane vesicles maintaining an acidic luminal environment (pH 4.5-5.0) via vacuolar H+-ATPase pumps. Contains over 50 acid hydrolases (proteases, nucleases, glycosidases, lipases). Thickly glycosylated membrane proteins protect the lysosomal membrane from self-digestion.',
        simpleExplanation:
          'The cleanup crew equipped with digestive acids to break down waste, old worn-out parts, and invading bacteria.',
        examFacts: [
          'Discovered by Christian de Duve in 1955; termed "suicide bags" due to autolysis during programmed cell death.',
          'Acid hydrolases require low pH (~4.8); protects cell from accidental autodigestion if a single lysosome ruptures.',
          'Defects in lysosomal enzymes lead to Tay-Sachs, Gaucher, and Pompe storage diseases.'
        ],
        relatedConcepts: ['Autophagy', 'Acid Hydrolases', 'Phagocytosis', 'Lysosomal Storage Diseases'],
        color: '#ef4444',
        strokeColor: '#f87171',
        position2D: { x: 310, y: 330, radius: 24 },
        position3D: { x: -1.2, y: -1.1, z: 0.6 }
      },
      {
        id: 'ribosomes',
        name: 'Ribosomes',
        scientificName: '80S Ribonucleoprotein Complex',
        location: 'Bound to outer surface of Rough ER and free-floating throughout cytosol.',
        function:
          'Decodes messenger RNA (mRNA) codon triplets and catalyzes the formation of peptide bonds between amino acids to synthesize polypeptide chains.',
        analogy: 'The 3D Printers of the Cell: Reads the digital code tape to fabricate actual functional molecular machines.',
        scientificExplanation:
          'Non-membrane bound macromolecular machines consisting of two unequal subunits: 40S (containing 18S rRNA and 33 proteins) and 60S (containing 28S, 5.8S, 5S rRNA and 46 proteins), forming an intact 80S ribosome in eukaryotes. Catalytic peptidyl transferase center is a ribozyme within 28S rRNA.',
        simpleExplanation:
          'Tiny protein-making machines that read genetic messages from the nucleus and build whatever protein the cell needs.',
        examFacts: [
          'George Palade discovered ribosomes in 1955 using electron microscopy (Palade granules).',
          'Ribosomes are universal to all living organisms, proving universal common ancestry.',
          'Free cytosolic ribosomes make proteins for intracellular use; ER-bound ribosomes make membrane/secretory proteins.'
        ],
        relatedConcepts: ['Translation', 'Peptidyl Transferase Ribozyme', 'Polysomes', 'Genetic Code'],
        color: '#38bdf8',
        strokeColor: '#7dd3fc',
        position2D: { x: 480, y: 310, radius: 14 },
        position3D: { x: 0.8, y: -0.9, z: 0.5 }
      }
    ],
    guidedSteps: [
      {
        stepNumber: 1,
        componentId: 'cell_membrane',
        title: 'Step 1: The Plasma Membrane Barrier',
        summary: 'Observe the fluid mosaic lipid bilayer that separates life from non-life.',
        actionPrompt: 'Click on the outer boundary to inspect how selective permeability protects the cell.'
      },
      {
        stepNumber: 2,
        componentId: 'cytoplasm',
        title: 'Step 2: Cytosol & Metabolic Ground',
        summary: 'Examine the crowded aqueous matrix where chemical reactions occur.',
        actionPrompt: 'Explore the cytoplasm to discover how anaerobic glycolysis generates initial ATP.'
      },
      {
        stepNumber: 3,
        componentId: 'nucleus',
        title: 'Step 3: The Nucleus & Genomic Archive',
        summary: 'Enter the master vault where chromatin encodes all cellular instructions.',
        actionPrompt: 'Select the nucleus to understand the role of nuclear pores and the nucleolus.'
      },
      {
        stepNumber: 4,
        componentId: 'endoplasmic_reticulum',
        title: 'Step 4: The Endoplasmic Reticulum Pipeline',
        summary: 'Trace newly synthesized proteins as they enter the RER lumen.',
        actionPrompt: 'Observe the foldings of the ER and how ribosomes dock on its membrane.'
      },
      {
        stepNumber: 5,
        componentId: 'golgi_apparatus',
        title: 'Step 5: Golgi Processing & Secretion',
        summary: 'Watch molecular cargo receive carbohydrate tags and sorting stamps.',
        actionPrompt: 'Click the Golgi apparatus to see how vesicles move from cis to trans cisternae.'
      },
      {
        stepNumber: 6,
        componentId: 'mitochondria',
        title: 'Step 6: Mitochondria & ATP Generation',
        summary: 'Zoom into the cristae folds powering cellular metabolism.',
        actionPrompt: 'Inspect the inner membrane where the electron transport chain charges ATP.'
      },
      {
        stepNumber: 7,
        componentId: 'lysosomes',
        title: 'Step 7: Lysosomal Digestion & Recycling',
        summary: 'Review how acid hydrolases break down foreign invaders and worn organelles.',
        actionPrompt: 'Select the lysosome to learn why pH 5.0 compartmentalization is life-saving.'
      }
    ],
    practiceQuestions: [
      {
        id: 'cell_q1',
        topicId: 'human_cell',
        question:
          'According to the Singer-Nicolson Fluid Mosaic Model of the cell membrane, which component is primarily responsible for preventing membrane fluidity from becoming excessively high at elevated temperatures and excessively low at low temperatures?',
        options: [
          'Peripheral glycoproteins on the outer surface',
          'Cholesterol molecules interspersed between phospholipid tails',
          'Integral aquaporin transmembrane water channels',
          'Cytoskeletal spectrin networks anchored to the inner surface'
        ],
        correctOptionIndex: 1,
        explanation:
          'Cholesterol acts as a bidirectional membrane fluidity buffer. At high temperatures, it restricts the movement of phospholipid fatty acid chains, preventing excessive fluidity. At low temperatures, it prevents phospholipids from packing closely together and crystalizing, maintaining membrane fluidity.',
        boardSource: 'ConceptLens practice — not an official past paper',
        year: 2024,
        marks: 2,
        diagramComponentId: 'cell_membrane'
      },
      {
        id: 'cell_q2',
        topicId: 'human_cell',
        question:
          'Which of the following experimental observations provides the strongest evidence supporting the Endosymbiotic Theory regarding the evolutionary origin of mitochondria?',
        options: [
          'Mitochondria contain 80S eukaryotic ribosomes and linear DNA surrounded by histones',
          'Mitochondria possess double membranes, circular naked DNA, and 70S prokaryotic-like ribosomes',
          'Mitochondria can synthesize all their required proteins without any nuclear genome input',
          'Mitochondrial ATP synthase is structurally identical to the sodium-potassium pump'
        ],
        correctOptionIndex: 1,
        explanation:
          'The Endosymbiotic Theory (popularized by Lynn Margulis) proposes that mitochondria evolved from engulfed aerobic alphaproteobacteria. Strong evidence includes their double membrane (the inner membrane resembling bacterial composition, notably cardiolipin), their own circular double-stranded DNA lacking histones, and 70S ribosomes that are sensitive to bacterial antibiotics (e.g. chloramphenicol).',
        boardSource: 'ConceptLens practice — not an official past paper',
        year: 2023,
        marks: 3,
        diagramComponentId: 'mitochondria'
      },
      {
        id: 'cell_q3',
        topicId: 'human_cell',
        question:
          'A eukaryotic secretory cell is treated with a specific inhibitor that blocks COP-II vesicle formation. Where will nascent secretory proteins predominantly accumulate inside the cell?',
        options: [
          'Inside secretory granules waiting at the plasma membrane',
          'Within the trans-Golgi Network (TGN)',
          'Within the lumen of the Rough Endoplasmic Reticulum (RER)',
          'Freely accumulating in the extracellular interstitial fluid'
        ],
        correctOptionIndex: 2,
        explanation:
          'COP-II (Coat Protein complex II) coats are specifically required for anterograde transport vesicles budding from the Rough Endoplasmic Reticulum and traveling toward the cis-Golgi. Blocking COP-II prevents exit from the ER, causing newly synthesized secretory proteins to accumulate in the RER lumen.',
        boardSource: 'ConceptLens practice — not an official past paper',
        year: 2024,
        marks: 4,
        diagramComponentId: 'endoplasmic_reticulum'
      },
      {
        id: 'cell_q4',
        topicId: 'human_cell',
        question:
          'Why are lysosomal acid hydrolase enzymes rendered largely harmless if an individual lysosome accidentally ruptures into the cytosol?',
        options: [
          'The cytosol contains immediate competitive inhibitors that irreversibly denature all proteases',
          'The neutral-to-slightly alkaline pH of cytosol (~7.2) sharply suppresses their enzymatic activity, which requires pH 4.5-5.0',
          'The rough endoplasmic reticulum immediately engulfs and consumes all leaking lysosomal contents',
          'Lysosomal enzymes can only digest molecules if calcium ions are present in excess of 100 mM'
        ],
        correctOptionIndex: 1,
        explanation:
          'Lysosomal enzymes are evolutionary optimized to operate at an acidic pH (4.5 to 5.0) maintained by active proton pumps (V-type H+ ATPase). The cytosolic pH is buffered at approximately 7.2. At this neutral pH, acid hydrolases exhibit very low catalytic activity, safeguarding the cell against catastrophic autodigestion if a single vesicle breaks.',
        boardSource: 'ConceptLens practice — not an official past paper',
        year: 2022,
        marks: 3,
        diagramComponentId: 'lysosomes'
      }
    ]
  },

  // -------------------------------------------------------------------------
  // TOPIC B: HUMAN HEART — INTERACTIVE 2D + 3D
  // -------------------------------------------------------------------------
  human_heart: {
    id: 'human_heart',
    title: 'The Human Heart & Double Circulation',
    subtitle: 'Chambers, Valves, Great Vessels, and Cardiac Cycle Dynamics',
    category: 'Human Anatomy & Cardiovascular Physiology',
    description:
      'Investigate the four-chambered mammalian heart. Trace systemic and pulmonary blood flow pathways, understand the mechanical action of atrioventricular and semilunar valves, and observe how systolic pressure drives cardiac output.',
    defaultMode: '2d',
    has3D: false,
    quickFact:
      'The human heart beats approximately 100,000 times each day, pumping roughly 2,000 gallons (7,500 liters) of blood through 60,000 miles of blood vessels.',
    sampleOriginalImageUrl: 'https://res.cloudinary.com/demo/image/upload/c_scale,w_900/sample.jpg',
    sampleCloudinaryUrl: 'https://res.cloudinary.com/demo/image/upload/c_limit,w_900/e_sharpen:80,e_contrast/f_auto,q_auto/sample.jpg',
    components: [
      {
        id: 'right_atrium',
        name: 'Right Atrium',
        scientificName: 'Atrium Dextrum',
        location: 'Upper right chamber (anatomical right, viewer left).',
        function:
          'Receives deoxygenated systemic venous blood returning from upper and lower body tissues via the Superior and Inferior Vena Cava and coronary sinus, pumping it through the tricuspid valve into the right ventricle.',
        analogy: 'The Receiving Dock for Return Trucks: Unloads empty, oxygen-depleted freight carriers.',
        scientificExplanation:
          'Thin-walled chamber containing the Sinoatrial (SA) node (the primary cardiac pacemaker) located near the superior vena cava entrance. Possesses smooth sinus venarum and pectinate muscles in its auricle.',
        simpleExplanation:
          'The upper receiving room on the right side that catches dark, used blue blood returning from your body.',
        examFacts: [
          'Contains the Sinoatrial (SA) node generating electrical impulses at 60-100 BPM.',
          'Receives blood via three vessels: Superior Vena Cava, Inferior Vena Cava, and Coronary Sinus.',
          'Separated from the left atrium by the interatrial septum bearing the fossa ovalis.'
        ],
        relatedConcepts: ['SA Node', 'Vena Cava', 'Tricuspid Valve', 'Venous Return'],
        color: '#0284c7',
        strokeColor: '#38bdf8',
        position2D: { x: 340, y: 170, width: 85, height: 75 },
        position3D: { x: -1.2, y: 0.8, z: 0.2 }
      },
      {
        id: 'right_ventricle',
        name: 'Right Ventricle',
        scientificName: 'Ventriculus Dexter',
        location: 'Lower right anterior chamber forming the majority of the sternocostal surface.',
        function:
          'Propels deoxygenated blood under low pressure (~25 mmHg systolic) through the pulmonary semilunar valve into the pulmonary trunk towards the lungs for oxygenation.',
        analogy: 'The Pulmonary Feeder Pump: Sends cargo on a short hop to the refill station (lungs).',
        scientificExplanation:
          'Crescent-shaped chamber in cross-section wrapping around the left ventricle. Possesses trabeculae carneae, papillary muscles connected to tricuspid valve leaflets by chordae tendineae, and a moderator band conducting the right bundle branch.',
        simpleExplanation:
          'The lower pump on the right side that sends blue blood out to the lungs so it can get fresh oxygen.',
        examFacts: [
          'Wall thickness is about 1/3 that of the left ventricle due to low pulmonary vascular resistance.',
          'Generates ~25 mmHg systolic pressure compared to 120 mmHg in the left ventricle.',
          'Chordae tendineae prevent tricuspid valve eversion during ventricular systole.'
        ],
        relatedConcepts: ['Pulmonary Circulation', 'Chordae Tendineae', 'Moderator Band', 'Systolic Ejection'],
        color: '#0369a1',
        strokeColor: '#0284c7',
        position2D: { x: 350, y: 265, width: 95, height: 90 },
        position3D: { x: -0.9, y: -0.6, z: 0.5 }
      },
      {
        id: 'left_atrium',
        name: 'Left Atrium',
        scientificName: 'Atrium Sinistrum',
        location: 'Upper left posterior chamber forming most of the heart base.',
        function:
          'Receives high-oxygen blood returning from pulmonary gas exchange via the four pulmonary veins and funnels it across the bicuspid (mitral) valve into the left ventricle.',
        analogy: 'The Fresh Goods Inbound Terminal: Receives freshly stocked red freight from the supplier.',
        scientificExplanation:
          'Smooth-walled internal cavity (derived from incorporated embryonic pulmonary veins) with pectinate muscles restricted to the left auricle. Directly posterior to the esophagus.',
        simpleExplanation:
          'The upper receiving room on the left side that catches bright red, oxygen-rich blood returning from the lungs.',
        examFacts: [
          'Receives four pulmonary veins (two right, two left), which uniquely carry oxygenated blood despite being veins.',
          'Has the thickest wall among atria (~3 mm) to handle slightly higher filling pressure.',
          'Enlargement can compress the recurrent laryngeal nerve or esophagus.'
        ],
        relatedConcepts: ['Pulmonary Veins', 'Mitral Valve', 'Oxygen Saturation', 'Diastolic Filling'],
        color: '#e11d48',
        strokeColor: '#f43f5e',
        position2D: { x: 530, y: 170, width: 85, height: 75 },
        position3D: { x: 1.2, y: 0.8, z: -0.2 }
      },
      {
        id: 'left_ventricle',
        name: 'Left Ventricle',
        scientificName: 'Ventriculus Sinister',
        location: 'Lower left conical chamber forming the apex of the heart.',
        function:
          'Generates powerful systemic arterial pressure (120 mmHg systolic) to propel oxygenated blood through the aortic valve into the systemic aorta, perfusing all peripheral tissues.',
        analogy: 'The Main High-Pressure Rocket Engine: Powerful enough to launch fuel across the entire continent.',
        scientificExplanation:
          'Conical thick-walled chamber (3x thicker than RV) producing high wall tension (LaPlace Law). Contains two prominent papillary muscles attached via chordae tendineae to the mitral valve. Ejection fraction typically 55-70%.',
        simpleExplanation:
          'The thickest, strongest muscle room that squeezes hard to shoot red blood all the way from your head to your toes.',
        examFacts: [
          'Wall is 3x thicker (8-12 mm) than the right ventricle due to systemic vascular resistance.',
          'Forms the anatomical apex of the heart at the 5th left intercostal space midclavicular line.',
          'Stroke volume is normally ~70 mL per beat, yielding ~5 L/min cardiac output at 72 BPM.'
        ],
        relatedConcepts: ['Stroke Volume', 'Cardiac Output', 'Ejection Fraction', 'Frank-Starling Mechanism'],
        color: '#be123c',
        strokeColor: '#e11d48',
        position2D: { x: 520, y: 265, width: 105, height: 95 },
        position3D: { x: 0.7, y: -0.7, z: 0.2 }
      },
      {
        id: 'aorta',
        name: 'Systemic Aorta',
        scientificName: 'Aorta Ascendens & Arcus Aortae',
        location: 'Arises from the base of the left ventricle and arches superiorly and posteriorly.',
        function:
          'The principal systemic arterial trunk, buffering high ventricular ejection pressure via elastic recoil (Windkessel effect) and distributing oxygen-rich blood to the entire body.',
        analogy: 'The Transcontinental Superhighway: The massive main artery feeding all national highways.',
        scientificExplanation:
          'Large elastic artery containing dense concentric fenestrated elastic laminae in the tunica media. Its three major arch branches are the brachiocephalic trunk, left common carotid artery, and left subclavian artery.',
        simpleExplanation:
          'The main arched artery tube coming out of the top of the heart carrying fresh red blood to the brain and body.',
        examFacts: [
          'Coronary arteries (supplying the heart muscle itself) arise from the aortic sinuses right above the aortic valve.',
          'Windkessel effect: elastic rebound during diastole maintains continuous forward blood flow.',
          'Aortic valve has 3 semilunar cusps with no chordae tendineae.'
        ],
        relatedConcepts: ['Windkessel Effect', 'Coronary Perfusion', 'Baroreceptors', 'Systolic Pressure'],
        color: '#f43f5e',
        strokeColor: '#fda4af',
        position2D: { x: 480, y: 85, width: 60, height: 80 },
        position3D: { x: 0.1, y: 1.8, z: 0 }
      },
      {
        id: 'pulmonary_artery',
        name: 'Pulmonary Trunk & Arteries',
        scientificName: 'Truncus Pulmonalis',
        location: 'Arises from the right ventricle anterior to the ascending aorta, branching beneath the aortic arch.',
        function:
          'Carries deoxygenated blood from the right ventricle to the right and left pulmonary capillary beds.',
        analogy: 'The Direct Feeder Pipe to the Oxygen Refill Tank.',
        scientificExplanation:
          'Short, wide vessel (~5 cm length, 3 cm diameter) that bifurcates into the right and left pulmonary arteries. In fetal life, the ductus arteriosus shunts blood from the pulmonary trunk directly to the aorta, bypassing non-aerated fetal lungs.',
        simpleExplanation:
          'The only artery in the body that carries deoxygenated blue blood, sending it straight to the lungs.',
        examFacts: [
          'Carries deoxygenated blood despite being classified as an artery (arteries carry blood away from the heart).',
          'Remnant of fetal ductus arteriosus persists as the ligamentum arteriosum.',
          'Branches supply corresponding lung lobes alongside the bronchial tree.'
        ],
        relatedConcepts: ['Pulmonary Trunk', 'Ductus Arteriosus', 'Gas Exchange', 'Pulmonary Hypertension'],
        color: '#0284c7',
        strokeColor: '#38bdf8',
        position2D: { x: 420, y: 105, width: 55, height: 70 },
        position3D: { x: -0.4, y: 1.4, z: 0.4 }
      },
      {
        id: 'superior_inferior_vena_cava',
        name: 'Superior & Inferior Vena Cava',
        scientificName: 'Vena Cava Superior et Inferior',
        location: 'Right posterior aspect of the heart draining into the right atrium.',
        function:
          'Superior Vena Cava drains venous blood from head, neck, upper limbs, and thorax; Inferior Vena Cava drains abdomen, pelvis, and lower limbs.',
        analogy: 'The Main Drainage Collectors: Bringing used fluids back from every corner.',
        scientificExplanation:
          'Large compliance systemic veins. The IVC is the largest vein in the human body, passing through the central tendon of the diaphragm at vertebral level T8.',
        simpleExplanation:
          'The two big return pipes that bring spent blood from your head and feet back home to the right side of the heart.',
        examFacts: [
          'SVC lacks venous valves; IVC possesses an embryonic Eustachian valve directing blood toward the foramen ovale in the fetus.',
          'Venous return increases during inhalation due to negative intrathoracic pressure (respiratory pump).',
          'Drains directly into the sinus venarum of the right atrium.'
        ],
        relatedConcepts: ['Venous Return', 'Central Venous Pressure', 'Eustachian Valve', 'Thoracic Pump'],
        color: '#0369a1',
        strokeColor: '#38bdf8',
        position2D: { x: 295, y: 110, width: 45, height: 110 },
        position3D: { x: -1.7, y: 1.2, z: -0.3 }
      },
      {
        id: 'heart_valves',
        name: 'Cardiac Valves (Tricuspid, Mitral, Semilunar)',
        scientificName: 'Valvae Cordis',
        location: 'Between atria and ventricles (AV valves) and at ventricular outflow tracts (Semilunar valves).',
        function:
          'Ensures strictly unidirectional (forward) blood flow through the heart, snapping shut to prevent retrograde regurgitation under high chamber pressure.',
        analogy: 'One-Way Check Valves & Trapdoors: Swings open freely in one direction but seals shut against backflow.',
        scientificExplanation:
          'Consists of two Atrioventricular valves: Tricuspid (3 cusps, right) and Bicuspid/Mitral (2 cusps, left); and two Semilunar valves: Pulmonary and Aortic (each with 3 crescent-shaped cusps). Closure of AV valves produces the 1st heart sound (S1 - "LUB"); closure of semilunar valves produces the 2nd heart sound (S2 - "DUB").',
        simpleExplanation:
          'One-way mechanical doors that slam shut with every heartbeat, making the famous "lub-dub" sound.',
        examFacts: [
          'S1 ("LUB") = Closure of mitral and tricuspid valves at the beginning of ventricular systole.',
          'S2 ("DUB") = Closure of aortic and pulmonary semilunar valves at the beginning of ventricular diastole.',
          'Mitral valve prolapse is the most common valvular heart disease.'
        ],
        relatedConcepts: ['Heart Sounds (S1, S2)', 'Chordae Tendineae', 'Valvular Regurgitation', 'Cardiac Cycle'],
        color: '#fbbf24',
        strokeColor: '#f59e0b',
        position2D: { x: 440, y: 220, width: 40, height: 40 },
        position3D: { x: 0, y: 0.1, z: 0.1 }
      }
    ],
    guidedSteps: [
      {
        stepNumber: 1,
        componentId: 'superior_inferior_vena_cava',
        title: 'Step 1: Systemic Venous Return',
        summary: 'Deoxygenated blood returns from peripheral tissues via the Vena Cava.',
        actionPrompt: 'Click on the Vena Cava to see how blood enters the right side of the heart.'
      },
      {
        stepNumber: 2,
        componentId: 'right_atrium',
        title: 'Step 2: Right Atrial Collection & SA Node',
        summary: 'The SA node paces contraction to push blood past the tricuspid valve.',
        actionPrompt: 'Select the Right Atrium to observe the primary cardiac pacemaker.'
      },
      {
        stepNumber: 3,
        componentId: 'right_ventricle',
        title: 'Step 3: Right Ventricular Ejection',
        summary: 'The right ventricle pumps deoxygenated blood toward the pulmonary circuit.',
        actionPrompt: 'Observe the chordae tendineae preventing valve prolapse.'
      },
      {
        stepNumber: 4,
        componentId: 'pulmonary_artery',
        title: 'Step 4: Pulmonary Transit & Oxygenation',
        summary: 'Blood travels through pulmonary arteries to alveolar capillary beds.',
        actionPrompt: 'Trace the pulmonary trunk branching toward both lungs.'
      },
      {
        stepNumber: 5,
        componentId: 'left_atrium',
        title: 'Step 5: Left Atrial Inflow',
        summary: 'Four pulmonary veins deliver oxygen-rich scarlet blood to the left atrium.',
        actionPrompt: 'Inspect the left atrium and its transition across the bicuspid mitral valve.'
      },
      {
        stepNumber: 6,
        componentId: 'left_ventricle',
        title: 'Step 6: Left Ventricular High-Pressure Systole',
        summary: 'The thick muscular wall generates 120 mmHg pressure to pump systemic blood.',
        actionPrompt: 'Examine the 3x thicker ventricular myocardium required to overcome peripheral resistance.'
      },
      {
        stepNumber: 7,
        componentId: 'aorta',
        title: 'Step 7: Aortic Distribution & Windkessel Elasticity',
        summary: 'The elastic aorta expands and recoils, perfusing coronary and body arteries.',
        actionPrompt: 'Follow the aortic arch delivering oxygenated blood to carotid and descending arteries.'
      }
    ],
    practiceQuestions: [
      {
        id: 'heart_q1',
        topicId: 'human_heart',
        question:
          'During the cardiac cycle, the first heart sound (S1, commonly described as "LUB") is mechanically produced by which of the following events?',
        options: [
          'Sudden turbulent blood rushing through the narrow coronary sinus',
          'Simultaneous closure of the atrioventricular (mitral and tricuspid) valves at the onset of ventricular systole',
          'Vibration of the aortic arch during maximal systolic pressure ejection',
          'Closure of the aortic and pulmonary semilunar valves at the onset of ventricular diastole'
        ],
        correctOptionIndex: 1,
        explanation:
          'The first heart sound (S1 - "LUB") is caused by the sudden closure of the atrioventricular (AV) valves (tricuspid on the right and mitral/bicuspid on the left) at the onset of ventricular systole as intraventricular pressure exceeds atrial pressure. The second heart sound (S2 - "DUB") is caused by the closure of the semilunar valves at the start of diastole.',
        boardSource: 'ConceptLens practice — not an official past paper',
        year: 2024,
        marks: 2,
        diagramComponentId: 'heart_valves'
      },
      {
        id: 'heart_q2',
        topicId: 'human_heart',
        question:
          'Why is the myocardium (muscular wall) of the human left ventricle approximately three times thicker than that of the right ventricle, even though both ventricles must pump the exact same stroke volume per beat in a healthy heart?',
        options: [
          'The left ventricle pumps a denser, more viscous type of blood compared to the right ventricle',
          'The left ventricle must overcome high systemic vascular resistance (~120 mmHg), whereas the right ventricle pumps against low pulmonary resistance (~25 mmHg)',
          'The left ventricle stores blood for twice as long during diastole than the right ventricle',
          'The SA node is located directly inside the left ventricular apex'
        ],
        correctOptionIndex: 1,
        explanation:
          'In series circulation, both ventricles must pump identical stroke volumes (~70 mL) to prevent pulmonary congestion or systemic hypoperfusion. However, the left ventricle pumps blood across the extensive systemic circulation with high vascular resistance (requiring ~120 mmHg peak pressure), whereas the right ventricle pumps through the short, low-resistance pulmonary circuit (~25 mmHg). By Laplace’s Law, overcoming higher afterload requires greater ventricular wall thickness.',
        boardSource: 'ConceptLens practice — not an official past paper',
        year: 2023,
        marks: 3,
        diagramComponentId: 'left_ventricle'
      },
      {
        id: 'heart_q3',
        topicId: 'human_heart',
        question:
          'A student measures an athlete resting heart rate at 60 beats per minute and calculates their resting cardiac output at 5.4 liters per minute. What is the calculated stroke volume of this athlete?',
        options: [
          '70 mL',
          '80 mL',
          '90 mL',
          '110 mL'
        ],
        correctOptionIndex: 2,
        explanation:
          'Cardiac Output (CO) = Heart Rate (HR) × Stroke Volume (SV). Therefore, SV = CO / HR. Converting 5.4 L/min to 5400 mL/min: SV = 5400 mL / 60 BPM = 90 mL per beat. Highly conditioned endurance athletes typically exhibit physiologic bradycardia paired with elevated stroke volumes.',
        boardSource: 'ConceptLens practice — not an official past paper',
        year: 2024,
        marks: 3,
        diagramComponentId: 'left_ventricle'
      }
    ]
  },

  // -------------------------------------------------------------------------
  // TOPIC C: DNA DOUBLE HELIX — INTERACTIVE 3D
  // -------------------------------------------------------------------------
  dna_helix: {
    id: 'dna_helix',
    title: 'DNA Double Helix: Molecular Architecture & Base Pairing',
    subtitle: 'Labeled diagram of the Watson-Crick B-DNA model and genetic information flow',
    category: 'Molecular Biology & Genetics',
    description:
      'Explore the right-handed B-DNA double helix. Inspect the antiparallel sugar-phosphate backbones, major and minor grooves, complementary hydrogen-bonded purine-pyrimidine base pairs, and the Central Dogma linking genes to proteins.',
    defaultMode: '2d',
    has3D: false,
    quickFact:
      'If unwound and tied end-to-end, the DNA in a single microscopic human cell would stretch approximately 2 meters (6 feet) in length, containing ~3.2 billion base pairs.',
    sampleOriginalImageUrl: 'https://res.cloudinary.com/demo/image/upload/c_scale,w_900/sample.jpg',
    sampleCloudinaryUrl: 'https://res.cloudinary.com/demo/image/upload/c_limit,w_900/e_sharpen:80,e_contrast/f_auto,q_auto/sample.jpg',
    components: [
      {
        id: 'sugar_phosphate_backbone',
        name: 'Sugar-Phosphate Backbone',
        scientificName: 'Phosphodiester 2-Deoxyribose Chains',
        location: 'Outermost structural boundary of the double helix forming two antiparallel spiraling ribbons.',
        function:
          'Provides structural stability through strong covalent 3\',5\'-phosphodiester bonds, protecting hydrophobic nitrogenous bases tucked inside.',
        analogy: 'The Spiral Handrails of the Staircase: The sturdy protective side rails keeping the steps anchored.',
        scientificExplanation:
          'Alternating units of 2\'-deoxy-D-ribose sugars linked by negatively charged phosphate groups via 3\'-to-5\' phosphodiester bridges. The two strands run in opposite antiparallel directions (5\'->3\' and 3\'->5\'), which is essential for semi-conservative replication by DNA Polymerase.',
        simpleExplanation:
          'The two spiraling outer side-rails made of sugars and phosphates that hold the genetic staircase together.',
        examFacts: [
          'DNA strands are strictly antiparallel: one strand is 5\' to 3\', and its complement is 3\' to 5\'.',
          'Negative charges on phosphate groups give DNA an overall negative polyanionic charge (crucial for agarose gel electrophoresis).',
          'Formulated by Watson and Crick in 1953 using Rosalind Franklin’s X-ray crystallography Photo 51.'
        ],
        relatedConcepts: ['Phosphodiester Bond', 'Antiparallel Polarity', 'Electrophoresis', 'Photo 51'],
        color: '#38bdf8',
        strokeColor: '#0284c7',
        position2D: { x: 400, y: 250, width: 120, height: 350 },
        position3D: { x: 0, y: 0, z: 0 }
      },
      {
        id: 'adenine_thymine_pair',
        name: 'Adenine-Thymine Base Pair (A = T)',
        scientificName: 'A-T Nitrogenous Complement (2 Hydrogen Bonds)',
        location: 'Interior horizontal rung bridging the two sugar-phosphate backbones.',
        function:
          'Stores sequence-encoded genetic information; pairs a purine (Adenine) with a pyrimidine (Thymine) held together by exactly two hydrogen bonds.',
        analogy: 'A Double-Latching Step: A pair with two magnetic latches.',
        scientificExplanation:
          'Adenine (6-aminopurine) forms two hydrogen bonds with Thymine (5-methyluracil): one between the amino group of adenine and carbonyl group of thymine, and one between ring nitrogens. Lower thermal melting point (Tm) than G-C pairs, so promoters (TATA boxes) are enriched in A-T pairs for easy strand separation.',
        simpleExplanation:
          'An A always locks with a T using 2 chemical handshakes. Promoters use lots of A-T because they are easier to unzip.',
        examFacts: [
          'Adenine pairs with Thymine via 2 hydrogen bonds (A = T).',
          'TATA-box promoters in transcription initiation sites are rich in A-T pairs because 2 H-bonds require less thermal energy to denature.',
          'Chargaff’s Rule: In double-stranded DNA, molar quantity %A = %T.'
        ],
        relatedConcepts: ['Chargaff’s Rules', 'Hydrogen Bonding', 'TATA Box', 'DNA Melting Temp (Tm)'],
        color: '#10b981',
        strokeColor: '#059669',
        position2D: { x: 400, y: 180, width: 80, height: 24 },
        position3D: { x: 0, y: 0.8, z: 0 }
      },
      {
        id: 'guanine_cytosine_pair',
        name: 'Guanine-Cytosine Base Pair (G ≡ C)',
        scientificName: 'G-C Nitrogenous Complement (3 Hydrogen Bonds)',
        location: 'Interior horizontal rung bridging the two sugar-phosphate backbones.',
        function:
          'Pairs a purine (Guanine) with a pyrimidine (Cytosine) stabilized by three hydrogen bonds, conferring higher thermal and mechanical stability to the DNA molecule.',
        analogy: 'A Triple-Latching Step: A high-security connection sealed with three heavy-duty deadbolts.',
        scientificExplanation:
          'Guanine forms three hydrogen bonds with Cytosine. Higher GC-content correlates with higher DNA melting temperature (Tm) and density in CsCl buoyant density centrifugation. Organisms living in geothermal vents (thermophiles) typically have high genomic GC content.',
        simpleExplanation:
          'A G always locks with a C using 3 chemical handshakes. Because 3 bonds are stronger than 2, G-C pairs make DNA tougher to melt.',
        examFacts: [
          'Guanine pairs with Cytosine via 3 hydrogen bonds (G ≡ C).',
          'DNA fragments with high GC-content require higher temperatures (Tm) to melt into single strands.',
          'Chargaff’s Rule: %G = %C in double-stranded DNA; (%A + %T) + (%G + %C) = 100%.'
        ],
        relatedConcepts: ['Melting Temperature (Tm)', 'Triple Hydrogen Bonds', 'GC Content', 'PCR Annealing'],
        color: '#8b5cf6',
        strokeColor: '#7c3aed',
        position2D: { x: 400, y: 260, width: 80, height: 24 },
        position3D: { x: 0, y: -0.8, z: 0 }
      },
      {
        id: 'major_minor_grooves',
        name: 'Major & Minor Grooves',
        scientificName: 'Helical Grooves (Sequence Recognition Surfaces)',
        location: 'Periodic helical indentations created by the offset glycosidic bonds of base pairs along the cylinder.',
        function:
          'The wide Major Groove exposes distinct chemical signatures (hydrogen bond donors, acceptors, methyl groups) enabling sequence-specific transcription factors and restriction enzymes to read the genetic sequence without unzipping the helix.',
        analogy: 'The Keyholes for Transcription Master Keys: Window slots that let proteins read the code from the outside.',
        scientificExplanation:
          'Because glycosidic bonds are not diametrically opposed (angle is ~120°/240°), the helix surface exhibits a wide Major Groove (~22 Å wide) and narrow Minor Groove (~12 Å wide). Transcription factors use alpha-helices (e.g. Zinc fingers, Leucine zippers) inserted into the major groove.',
        simpleExplanation:
          'The deep and shallow spiral grooves on the outside of DNA that let regulatory proteins read your genes without having to untwist the ladder.',
        examFacts: [
          'Major groove allows sequence-specific protein binding via hydrogen-bonding patterns.',
          'B-DNA helix makes one full turn every 3.4 nm (10.5 base pairs), with a pitch of 0.34 nm per base pair.',
          'Diameter of B-DNA is 2.0 nm (20 Å).'
        ],
        relatedConcepts: ['Transcription Factors', 'Zinc Fingers', 'Restriction Endonucleases', 'B-DNA Geometry'],
        color: '#f59e0b',
        strokeColor: '#d97706',
        position2D: { x: 460, y: 220, width: 45, height: 90 },
        position3D: { x: 0.6, y: 0, z: 0.5 }
      }
    ],
    guidedSteps: [
      {
        stepNumber: 1,
        componentId: 'sugar_phosphate_backbone',
        title: 'Step 1: The Antiparallel Strands',
        summary: 'Inspect the two sugar-phosphate chains running in opposite 5\' to 3\' directions.',
        actionPrompt: 'Select a backbone in the diagram to see how the two strands run in opposite directions.'
      },
      {
        stepNumber: 2,
        componentId: 'adenine_thymine_pair',
        title: 'Step 2: A-T Pairing (2 Hydrogen Bonds)',
        summary: 'Examine how Adenine and Thymine form two complementary hydrogen bonds.',
        actionPrompt: 'Click on the green/amber base pair to view its pairing rules and TATA box role.'
      },
      {
        stepNumber: 3,
        componentId: 'guanine_cytosine_pair',
        title: 'Step 3: G-C Pairing (3 Hydrogen Bonds)',
        summary: 'Compare the triple hydrogen bond between Guanine and Cytosine.',
        actionPrompt: 'Notice why high G-C regions require higher temperatures to denature.'
      },
      {
        stepNumber: 4,
        componentId: 'major_minor_grooves',
        title: 'Step 4: Grooves & Protein Recognition',
        summary: 'Discover how enzymes inspect the major groove without unzipping the helix.',
        actionPrompt: 'Inspect the wider groove where transcription factors dock.'
      }
    ],
    practiceQuestions: [
      {
        id: 'dna_q1',
        topicId: 'dna_helix',
        question:
          'If a double-stranded DNA sample extracted from an unknown organism is found to contain 28% Adenine, what is the expected percentage of Cytosine in this DNA sample according to Chargaff’s Rules?',
        options: [
          '28%',
          '22%',
          '44%',
          '56%'
        ],
        correctOptionIndex: 1,
        explanation:
          'According to Chargaff’s Rules for double-stranded DNA, %A = %T and %G = %C. Since Adenine is 28%, Thymine is also 28%, giving %A + %T = 56%. The remaining percentage is (%G + %C) = 100% - 56% = 44%. Since %G = %C, the percentage of Cytosine is 44% / 2 = 22%.',
        boardSource: 'ConceptLens practice — not an official past paper',
        year: 2024,
        marks: 2,
        diagramComponentId: 'adenine_thymine_pair'
      },
      {
        id: 'dna_q2',
        topicId: 'dna_helix',
        question:
          'Why do standard B-DNA double-helix dimensions exhibit a constant, uniform diameter of 2.0 nm (20 Å) all along its length, regardless of the specific sequence of nucleotides?',
        options: [
          'All four nitrogenous bases have identical single-ring purine chemical structures',
          'Every base pair consistently consists of one two-ring purine bonded to one single-ring pyrimidine',
          'The sugar-phosphate backbone stretches and contracts to smooth out any base size mismatches',
          'Histone octamers squeeze the double helix into a fixed cylindrical mold'
        ],
        correctOptionIndex: 1,
        explanation:
          'Purines (Adenine and Guanine) are large, two-ring nitrogenous bases, whereas Pyrimidines (Cytosine and Thymine) are smaller, single-ring bases. Because Watson-Crick pairing always pairs a purine with a pyrimidine (A with T, and G with C), the total width of every base pair is identical (~1.08 nm between C1\' atoms), preserving a strictly constant 2.0 nm helix diameter.',
        boardSource: 'ConceptLens practice — not an official past paper',
        year: 2023,
        marks: 3,
        diagramComponentId: 'sugar_phosphate_backbone'
      }
    ]
  },

  // -------------------------------------------------------------------------
  // TOPIC D: NEURON — INTERACTIVE 2D
  // -------------------------------------------------------------------------
  neuron: {
    id: 'neuron',
    title: 'The Neuron & Action Potential Propagation',
    subtitle: 'Interactive Signal Transmission, Myelin Sheath, and Synaptic Exocytosis',
    category: 'Neuroscience & Cellular Electrophysiology',
    description:
      'Step through the anatomy of a multipolar neuron. Trigger an electrical nerve impulse, follow sodium and potassium voltage-gated ion fluxes along the axon hillock, witness saltatory conduction jumping across Nodes of Ranvier, and see neurotransmitter release.',
    defaultMode: '2d',
    has3D: false,
    quickFact:
      'Myelinated sensory axons can conduct electrical action potentials at velocities exceeding 120 meters per second (approx. 270 mph), while unmyelinated fibers conduct at under 2 m/s.',
    sampleOriginalImageUrl: 'https://res.cloudinary.com/demo/image/upload/c_scale,w_900/sample.jpg',
    sampleCloudinaryUrl: 'https://res.cloudinary.com/demo/image/upload/c_limit,w_900/e_sharpen:80,e_contrast/f_auto,q_auto/sample.jpg',
    components: [
      {
        id: 'dendrites',
        name: 'Dendritic Tree',
        scientificName: 'Dendrites (Receptive Field)',
        location: 'Branching tree-like cytoplasmic projections extending from the cell body (soma).',
        function:
          'Receives chemical neurotransmitter inputs from presynaptic neurons, converting chemical signals into graded postsynaptic potentials (EPSPs and IPSPs).',
        analogy: 'The Radio Antennas: Receives incoming broadcast transmissions from neighboring stations.',
        scientificExplanation:
          'Covered with dendritic spines containing ionotropic and metabotropic neurotransmitter receptors (e.g. AMPA, NMDA, GABA). Conducts graded electrical potentials passively toward the soma via decremental electrotonic conduction.',
        simpleExplanation:
          'The branch-like fingers that catch incoming chemical messages sent by other nerve cells.',
        examFacts: [
          'Dendrites conduct impulses towards the soma (afferent transmission).',
          'Generate graded potentials, not all-or-none action potentials.',
          'Dendritic spine density is directly modulated by synaptic plasticity and long-term potentiation (LTP).'
        ],
        relatedConcepts: ['Graded Potentials', 'EPSP vs IPSP', 'Synaptic Plasticity', 'Neurotransmitters'],
        color: '#38bdf8',
        strokeColor: '#0284c7',
        position2D: { x: 120, y: 220, width: 80, height: 120 }
      },
      {
        id: 'soma',
        name: 'Soma (Cell Body & Nucleus)',
        scientificName: 'Perikaryon / Neurocyte Soma',
        location: 'Central biosynthetic and integrative hub of the neuron.',
        function:
          'Synthesizes proteins, enzymes, and neurotransmitters; contains Nissl bodies (dense rough ER); and algebraically sums all incoming excitatory and inhibitory postsynaptic potentials.',
        analogy: 'The Mission Control & Synthesis Hub: Adds up all the votes and decides whether to fire.',
        scientificExplanation:
          'Contains a large, euchromatic nucleus with a prominent nucleolus, surrounded by clustered polyribosomes and rough ER known as Nissl bodies (tigroid substance). Performs spatial and temporal summation of electrical inputs.',
        simpleExplanation:
          'The main body of the nerve cell that keeps the cell alive and decides if incoming signals are strong enough to fire.',
        examFacts: [
          'Nissl granules are intensely basophilic clusters of rough ER and ribosomes; absent in the axon and axon hillock.',
          'Spatial summation combines inputs from multiple dendrites simultaneously.',
          'Temporal summation combines rapid sequential inputs from a single presynaptic terminal.'
        ],
        relatedConcepts: ['Nissl Granules', 'Summation', 'Soma Architecture', 'Neurotransmitter Synthesis'],
        color: '#8b5cf6',
        strokeColor: '#7c3aed',
        position2D: { x: 230, y: 220, radius: 45 }
      },
      {
        id: 'axon_hillock',
        name: 'Axon Hillock (Trigger Zone)',
        scientificName: 'Axon Initial Segment (AIS)',
        location: 'Funnel-shaped junction between the soma and the initial segment of the axon.',
        function:
          'The decision-making trigger zone with the highest density of voltage-gated Na+ (Nav1.6) channels. If graded membrane depolarization reaches threshold (-55 mV), it fires an all-or-none action potential.',
        analogy: 'The Hair Trigger: Pull past the threshold click, and the rocket is launched with 100% power.',
        scientificExplanation:
          'Possesses lowest threshold voltage (-55 mV compared to -70 mV resting potential). Once opened, voltage-gated Na+ channels create a runaway positive-feedback depolarization loop (Hodgkin cycle) driving membrane potential to +30 mV.',
        simpleExplanation:
          'The spark plug switch: if incoming electrical voltage crosses -55mV, it triggers a full-strength nerve pulse.',
        examFacts: [
          'Threshold potential is typically -55 mV (governed by the All-or-None Law).',
          'Highest density of Nav channels in the entire unmyelinated membrane.',
          'Action potentials do not vary in amplitude; signal intensity is encoded in firing frequency.'
        ],
        relatedConcepts: ['All-or-None Law', 'Threshold Potential', 'Hodgkin Cycle', 'Refractory Period'],
        color: '#f59e0b',
        strokeColor: '#d97706',
        position2D: { x: 310, y: 220, radius: 22 }
      },
      {
        id: 'axon_and_myelin',
        name: 'Myelinated Axon & Nodes of Ranvier',
        scientificName: 'Myelin Sheath (Schwann Cells / Oligodendrocytes)',
        location: 'Long cylindrical nerve fiber extending from soma to terminal, wrapped in lipid insulation.',
        function:
          'Myelin acts as an electrical insulator reducing membrane capacitance. Electrical charge hops rapidly from one uninsulated Node of Ranvier to the next via Saltatory Conduction.',
        analogy: 'The Insulated High-Speed Fiber Optic Cable: Plastic coating that stops leaks so signals travel fast.',
        scientificExplanation:
          'Formed by concentric wraps of plasma membrane from Schwann cells in the Peripheral Nervous System (PNS) or Oligodendrocytes in the Central Nervous System (CNS). Unmyelinated gaps (Nodes of Ranvier, ~1 μm wide) contain dense clusters of Nav channels facilitating saltatory conduction up to 120 m/s.',
        simpleExplanation:
          'The long tail wrapped in fatty cushions (myelin) that makes the electrical spark leap super-fast between gaps.',
        examFacts: [
          'Schwann cells myelinate single axon segments in PNS; Oligodendrocytes myelinate multiple axons in CNS.',
          'Multiple Sclerosis is an autoimmune demyelinating disease of the CNS.',
          'Saltatory conduction (from Latin "saltare" = to leap) consumes far less ATP because Na+/K+ pumps only operate at nodes.'
        ],
        relatedConcepts: ['Saltatory Conduction', 'Schwann Cells', 'Multiple Sclerosis', 'Nodes of Ranvier'],
        color: '#10b981',
        strokeColor: '#059669',
        position2D: { x: 510, y: 220, width: 260, height: 28 }
      },
      {
        id: 'axon_terminals',
        name: 'Axon Terminals & Synaptic Boutons',
        scientificName: 'Telodendria & Presynaptic Bouton',
        location: 'Distal ends of the axon branching into small terminal bulbs opposite target cells.',
        function:
          'Converts electrical action potentials back into chemical messages by opening voltage-gated Ca2+ channels, driving exocytosis of neurotransmitter vesicles into the synaptic cleft.',
        analogy: 'The Transmission Spray Nozzles: Sprays chemical messenger droplets across the gap to the next receiver.',
        scientificExplanation:
          'Depolarization reaches the terminal, opening voltage-gated Ca2+ channels. Influx of Ca2+ binds to synaptotagmin, triggering SNARE-complex mediated fusion of neurotransmitter vesicles (e.g. acetylcholine) with the presynaptic membrane across the 20 nm synaptic cleft.',
        simpleExplanation:
          'The tips of the nerve that release tiny bubbles of chemical signals across the gap to the next muscle or nerve cell.',
        examFacts: [
          'Synaptic delay is typically 0.5 milliseconds.',
          'Calcium ions (Ca2+) are strictly required for neurotransmitter vesicle exocytosis.',
          'Neurotransmitters are cleared by enzymatic breakdown (e.g. acetylcholinesterase) or reuptake.'
        ],
        relatedConcepts: ['Synaptic Cleft', 'SNARE Complex', 'Neurotransmitter Vesicles', 'Acetylcholine'],
        color: '#f43f5e',
        strokeColor: '#e11d48',
        position2D: { x: 740, y: 220, width: 60, height: 80 }
      }
    ],
    guidedSteps: [
      {
        stepNumber: 1,
        componentId: 'dendrites',
        title: 'Step 1: Input Gathering at Dendrites',
        summary: 'Neurotransmitters bind receptors on dendritic spines, producing graded EPSPs.',
        actionPrompt: 'Observe chemical signals creating electrotonic currents moving toward the soma.'
      },
      {
        stepNumber: 2,
        componentId: 'soma',
        title: 'Step 2: Integration & Summation',
        summary: 'The soma integrates excitatory and inhibitory inputs over space and time.',
        actionPrompt: 'Inspect the cell body where Nissl bodies synthesize neurotransmitter proteins.'
      },
      {
        stepNumber: 3,
        componentId: 'axon_hillock',
        title: 'Step 3: Threshold & Action Potential Trigger',
        summary: 'Depolarization reaching -55 mV triggers rapid voltage-gated Na+ influx (+30 mV).',
        actionPrompt: 'Watch the All-or-None spike discharge as sodium gates fly open.'
      },
      {
        stepNumber: 4,
        componentId: 'axon_and_myelin',
        title: 'Step 4: Saltatory Conduction Along Nodes',
        summary: 'The impulse leaps from node to node at velocities exceeding 100 m/s.',
        actionPrompt: 'Notice how myelin insulation prevents ion leakage and conserves metabolic energy.'
      },
      {
        stepNumber: 5,
        componentId: 'axon_terminals',
        title: 'Step 5: Synaptic Exocytosis & Chemical Transmission',
        summary: 'Voltage-gated Ca2+ influx causes vesicles to fuse and release neurotransmitters.',
        actionPrompt: 'See neurotransmitter molecules diffuse across the 20nm synaptic cleft.'
      }
    ],
    practiceQuestions: [
      {
        id: 'neuron_q1',
        topicId: 'neuron',
        question:
          'During the rapid depolarization phase of an action potential in a mammalian neuron, which specific molecular event is primarily responsible for the rapid shift of membrane potential from -55 mV to +30 mV?',
        options: [
          'Massive opening of voltage-gated potassium (K+) channels allowing potassium to rush into the cell',
          'Rapid opening of voltage-gated sodium (Na+) activation gates allowing sodium influx down its electrochemical gradient',
          'Sudden acceleration of the electrogenic Na+/K+ ATPase pump pushing three sodium ions outward',
          'Rapid entry of chloride (Cl-) anions hyperpolarizing the inner cytoplasmic leaflet'
        ],
        correctOptionIndex: 1,
        explanation:
          'Once the membrane threshold of approximately -55 mV is reached at the axon hillock, voltage-gated Na+ channels rapidly open their activation gates. Because intracellular sodium concentration is low (~12 mM) compared to extracellular fluid (~145 mM) and the cell interior is negatively charged, sodium rushes into the cell down both its chemical and electrical gradients, causing rapid depolarization toward the sodium equilibrium potential (+60 mV), peaking at ~+30 mV before inactivation gates close.',
        boardSource: 'ConceptLens practice — not an official past paper',
        year: 2024,
        marks: 3,
        diagramComponentId: 'axon_hillock'
      },
      {
        id: 'neuron_q2',
        topicId: 'neuron',
        question:
          'What is the primary physiological advantage of saltatory conduction in myelinated axons compared to continuous conduction in unmyelinated axons?',
        options: [
          'Saltatory conduction increases action potential amplitude from 100 mV to over 500 mV',
          'Saltatory conduction dramatically increases conduction velocity while requiring significantly less ATP for ion pump restoration',
          'Saltatory conduction allows action potentials to travel bidirectionally back into the nucleus',
          'Saltatory conduction eliminates the need for any neurotransmitter vesicles at the synapse'
        ],
        correctOptionIndex: 1,
        explanation:
          'Saltatory conduction allows the action potential to "leap" from one Node of Ranvier to the next because the thick myelin sheath acts as an electrical insulator with low capacitance. This increases conduction velocity up to 100-fold (reaching 120 m/s) and dramatically conserves cellular ATP, since the Na+/K+ ATPase only needs to restore ion gradients at the unmyelinated nodes rather than along every square micrometer of axonal membrane.',
        boardSource: 'ConceptLens practice — not an official past paper',
        year: 2023,
        marks: 3,
        diagramComponentId: 'axon_and_myelin'
      }
    ]
  },

  // -------------------------------------------------------------------------
  // TOPIC E: PLANT CELL — INTERACTIVE 2D & COMPARISON
  // -------------------------------------------------------------------------
  plant_cell: {
    id: 'plant_cell',
    title: 'The Plant Cell: Turgor, Chloroplasts & Cell Wall',
    subtitle: 'Interactive 2D Exploration & Plant vs. Animal Cell Comparison Matrix',
    category: 'Plant Physiology & Botany',
    description:
      'Examine the defining structural features of plant cells: the rigid cellulose cell wall, the giant hypertonic central vacuole driving turgor pressure, chloroplasts harboring thylakoid grana for oxygenic photosynthesis, and plasmodesmata channels.',
    defaultMode: '2d',
    has3D: false,
    quickFact:
      'Plant cell walls withstand turgor pressures exceeding 15 atmospheres (approx. 220 psi) — equal to more than five times the air pressure inside a standard car tire!',
    sampleOriginalImageUrl: 'https://res.cloudinary.com/demo/image/upload/c_scale,w_900/sample.jpg',
    sampleCloudinaryUrl: 'https://res.cloudinary.com/demo/image/upload/c_limit,w_900/e_sharpen:80,e_contrast/f_auto,q_auto/sample.jpg',
    components: [
      {
        id: 'cell_wall',
        name: 'Cellulose Cell Wall',
        scientificName: 'Cell Wall (Primary & Secondary Wall, Middle Lamella)',
        location: 'Rigid outermost layer outside the plasma membrane.',
        function:
          'Provides structural rigidity, prevents osmotic lysis in hypotonic environments, and maintains overall plant upright posture against gravity via turgor pressure.',
        analogy: 'The Brick Wall Foundation: The reinforced concrete exterior keeping the building upright.',
        scientificExplanation:
          'Composed of microfibrils of cellulose (β-1,4-glucan chains) embedded in a matrix of hemicellulose, pectin, and sometimes lignin (in secondary walls). Adjacent plant cells are glued together by the middle lamella, rich in calcium and magnesium pectate.',
        simpleExplanation:
          'A tough box made of crunchy cellulose fibers that keeps the plant cell from bursting when full of water.',
        examFacts: [
          'Middle lamella is made of calcium and magnesium pectate (the "plant cement").',
          'Plasmodesmata are cytoplasmic bridges traversing cell walls for intercellular transport (symplastic pathway).',
          'Animals completely lack cell walls (key diagnostic distinction).'
        ],
        relatedConcepts: ['Cellulose', 'Turgor Pressure', 'Middle Lamella', 'Plasmodesmata'],
        color: '#10b981',
        strokeColor: '#059669',
        position2D: { x: 400, y: 250, width: 360, height: 260 }
      },
      {
        id: 'central_vacuole',
        name: 'Large Central Vacuole',
        scientificName: 'Vacuolar Tonoplast & Cell Sap',
        location: 'Occupies up to 80-90% of the interior volume of a mature plant cell.',
        function:
          'Maintains hydrostatic turgor pressure against the cell wall, stores water, hydrolytic enzymes, and metabolic waste, and sequesters defensive secondary metabolites.',
        analogy: 'The Pressurized Water Balloon: Pushes against the rigid outer cardboard box so the box stays stiff.',
        scientificExplanation:
          'Bounded by a selectively permeable membrane called the tonoplast containing proton-pumping ATPases and pyrophosphatases that actively pump solutes into the vacuole, creating a hypertonic cell sap that draws in water via osmosis.',
        simpleExplanation:
          'A giant water bubble that stays inflated like a tire; when it runs out of water, the plant wilts.',
        examFacts: [
          'Tonoplast is the specialized semi-permeable membrane enclosing the central vacuole.',
          'Loss of vacuolar turgor pressure causes wilting and plasmolysis.',
          'Contains anthocyanin pigments responsible for red/purple colors in flower petals.'
        ],
        relatedConcepts: ['Tonoplast', 'Turgor Pressure', 'Plasmolysis', 'Cell Sap'],
        color: '#38bdf8',
        strokeColor: '#0284c7',
        position2D: { x: 380, y: 250, width: 170, height: 140 }
      },
      {
        id: 'chloroplasts',
        name: 'Chloroplasts',
        scientificName: 'Chloroplast (Thylakoids & Stroma)',
        location: 'Concentrated in the peripheral cytoplasm of photosynthetic mesophyll cells.',
        function:
          'Captures solar photon energy to synthesize glucose and oxygen from CO2 and H2O via the light reactions (in thylakoids) and Calvin-Benson cycle (in stroma).',
        analogy: 'The Solar Power Plant: Converts radiant sunlight directly into sweet sugar food.',
        scientificExplanation:
          'Double-membrane semiautonomous organelle with its own circular cpDNA and 70S ribosomes. Houses flattened membranous thylakoid discs stacked into grana containing Photosystems I & II, ATP synthase, and chlorophyll pigments.',
        simpleExplanation:
          'Little green solar kitchens that use sunlight to bake sugar for the plant and produce oxygen for us to breathe.',
        examFacts: [
          'Contains chlorophyll a & b and accessory carotenoid pigments in thylakoid membranes.',
          'Light reactions occur on thylakoids; dark reactions (Calvin cycle / RuBisCO) occur in the stroma.',
          'Absent in all animal and fungal cells.'
        ],
        relatedConcepts: ['Photosynthesis', 'RuBisCO', 'Thylakoid Grana', 'Endosymbiosis'],
        color: '#22c55e',
        strokeColor: '#16a34a',
        position2D: { x: 260, y: 170, width: 70, height: 45 }
      },
      {
        id: 'nucleus',
        name: 'Nucleus (Plant)',
        scientificName: 'Nucleus',
        location: 'Pushed to the cell periphery by the large expanding central vacuole.',
        function:
          'Houses the plant genome, controls transcription, and directs cell division.',
        analogy: 'The Control Center pushed against the side wall.',
        scientificExplanation:
          'In mature plant cells, the nucleus is peripheral rather than central due to the high volume of the central vacuole.',
        simpleExplanation:
          'The genetic control center, nudged slightly to the side by the huge water vacuole.',
        examFacts: [
          'Plant cells lack centrioles/centrosomes during mitosis, yet successfully form anastral mitotic spindles.',
          'Cytokinesis in plants proceeds by cell plate formation from the center outward (phragmoplast), unlike cleavage furrowing in animal cells.'
        ],
        relatedConcepts: ['Phragmoplast', 'Cell Plate Formation', 'Mitosis', 'Anastral Spindle'],
        color: '#8b5cf6',
        strokeColor: '#7c3aed',
        position2D: { x: 520, y: 200, radius: 40 }
      }
    ],
    guidedSteps: [
      {
        stepNumber: 1,
        componentId: 'cell_wall',
        title: 'Step 1: The Cellulose Armor',
        summary: 'Explore the multi-layered cellulose wall that gives plants structural upright posture.',
        actionPrompt: 'Click the cell wall to learn how calcium pectate cements neighboring cells.'
      },
      {
        stepNumber: 2,
        componentId: 'central_vacuole',
        title: 'Step 2: The Tonoplast & Turgor Pressure',
        summary: 'Examine how osmotic pressure in the cell sap keeps leaves crisp and rigid.',
        actionPrompt: 'Observe the central vacuole pushing the rest of the cytoplasm toward the edges.'
      },
      {
        stepNumber: 3,
        componentId: 'chloroplasts',
        title: 'Step 3: Chloroplasts & Solar Harvesting',
        summary: 'Zoom into thylakoid grana where chlorophyll turns light into biochemical energy.',
        actionPrompt: 'Select a chloroplast to discover how Photosystems I & II split water molecules.'
      },
      {
        stepNumber: 4,
        componentId: 'nucleus',
        title: 'Step 4: Peripheral Plant Nucleus & Mitosis',
        summary: 'Notice how the vacuole displaces the nucleus to the outer boundary.',
        actionPrompt: 'Learn how plant cytokinesis builds a cell plate rather than pinching a furrow.'
      }
    ],
    practiceQuestions: [
      {
        id: 'plant_q1',
        topicId: 'plant_cell',
        question:
          'Which of the following cellular structures is uniquely present in plant cells and absent in animal cells?',
        options: [
          'Mitochondria and 80S ribosomes',
          'Cellulose cell wall, large central vacuole with tonoplast, and plastids/chloroplasts',
          'Endoplasmic reticulum and Golgi apparatus',
          'Plasma membrane and nuclear pores'
        ],
        correctOptionIndex: 1,
        explanation:
          'Plant cells possess a rigid cellulose cell wall, plastids (including photosynthetic chloroplasts), and a prominent central vacuole enclosed by a tonoplast. Animal cells lack cell walls, lack chloroplasts, and possess small, temporary vacuoles alongside centrioles (which are absent in higher plant cells).',
        boardSource: 'ConceptLens practice — not an official past paper',
        year: 2024,
        marks: 2,
        diagramComponentId: 'cell_wall'
      },
      {
        id: 'plant_q2',
        topicId: 'plant_cell',
        question:
          'During cytokinesis in dividing higher plant cells, how is new cell separation achieved in the absence of a contractile ring and cleavage furrow?',
        options: [
          'The plasma membrane ruptures and reseals spontaneously around each nucleus',
          'Golgi-derived vesicles coalesce along the equatorial plane to form a cell plate (phragmoplast) that grows outward until fusing with existing walls',
          'Centrioles migrate to the center and pull microfilaments inward from the edges',
          'The cell wall dissolves completely and regrows from the newly formed nuclei'
        ],
        correctOptionIndex: 1,
        explanation:
          'Because the rigid cellulose cell wall prevents animal-like pinching of a cleavage furrow, plant cells form a phragmoplast. Golgi-derived vesicles carrying cell wall precursors (pectins and hemicelluloses) align at the equatorial plate and fuse centrifugally (from center toward the periphery) to create a dividing cell plate, which eventually matures into the middle lamella and primary cell walls.',
        boardSource: 'ConceptLens practice — not an official past paper',
        year: 2023,
        marks: 3,
        diagramComponentId: 'cell_wall'
      }
    ]
  }
};
