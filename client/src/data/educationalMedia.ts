import type { BiologyTopicId } from '@conceptlens/shared';

export interface EducationalAsset {
  conceptId: BiologyTopicId;
  /** Wikimedia thumbnail fetched by Cloudinary. Not a decorative stock photo. */
  remoteUrl: string;
  alt: string;
  caption: string;
  sourceTitle: string;
  sourceUrl: string;
  license: string;
  creator: string;
  /** Intrinsic ratio of the 960px thumbnail, used to reserve layout space. */
  width: number;
  height: number;
}

/**
 * Sources checked against the Wikimedia Commons API on 25 Oct 2026.
 * Cloudinary fetch delivery was verified for the animal cell, heart, and plant cell.
 * Neuron and DNA URLs match Commons thumbnails; a failed fetch still leaves the written lesson.
 */
export const EDUCATIONAL_ASSETS: Record<BiologyTopicId, EducationalAsset> = {
  human_cell: {
    conceptId: 'human_cell',
    remoteUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Animal_cell_structure_en.svg/960px-Animal_cell_structure_en.svg.png',
    alt: 'Labeled diagram of an animal cell showing the membrane, nucleus, mitochondria, and other organelles.',
    caption: 'Animal-cell diagram. The labels name the same structures as the lesson list.',
    sourceTitle: 'Animal cell structure en.svg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Animal_cell_structure_en.svg',
    license: 'Public domain',
    creator: 'LadyofHats (Mariana Ruiz)',
    width: 960,
    height: 642
  },
  human_heart: {
    conceptId: 'human_heart',
    remoteUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Diagram_of_the_human_heart_%28cropped%29.svg/960px-Diagram_of_the_human_heart_%28cropped%29.svg.png',
    alt: 'Labeled diagram of the human heart showing the four chambers and the large vessels.',
    caption: 'Heart diagram with chamber and vessel labels. The written lesson names the same parts.',
    sourceTitle: 'Diagram of the human heart (cropped).svg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Diagram_of_the_human_heart_(cropped).svg',
    license: 'CC BY-SA 3.0',
    creator: 'Wapcaplet',
    width: 960,
    height: 944
  },
  dna_helix: {
    conceptId: 'dna_helix',
    remoteUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/DNA_Structure%2BKey%2BLabelled.pn_NoBB.png/960px-DNA_Structure%2BKey%2BLabelled.pn_NoBB.png',
    alt: 'Labeled diagram of DNA showing the double helix, base pairs, sugar-phosphate backbone, and helix measurements.',
    caption: 'DNA structure diagram. The key in the image is repeated in the lesson text.',
    sourceTitle: 'DNA Structure+Key+Labelled.pn NoBB.png',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:DNA_Structure%2BKey%2BLabelled.pn_NoBB.png',
    license: 'CC BY-SA 3.0',
    creator: 'Zephyris',
    width: 960,
    height: 960
  },
  neuron: {
    conceptId: 'neuron',
    remoteUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Complete_neuron_cell_diagram_en.svg/960px-Complete_neuron_cell_diagram_en.svg.png',
    alt: 'Labeled diagram of a neuron showing dendrites, the cell body, the axon, and the axon terminals.',
    caption: 'Neuron diagram. Dendrites, the cell body, and the axon are also named in the text.',
    sourceTitle: 'Complete neuron cell diagram en.svg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Complete_neuron_cell_diagram_en.svg',
    license: 'Public domain',
    creator: 'LadyofHats',
    width: 960,
    height: 720
  },
  plant_cell: {
    conceptId: 'plant_cell',
    remoteUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Plant_cell_structure-en.svg/960px-Plant_cell_structure-en.svg.png',
    alt: 'Labeled diagram of a plant cell showing the cell wall, chloroplasts, vacuole, and nucleus.',
    caption: 'Plant-cell diagram. The wall, chloroplasts, and vacuole are explained in the lesson text.',
    sourceTitle: 'Plant cell structure-en.svg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Plant_cell_structure-en.svg',
    license: 'Public domain',
    creator: 'LadyofHats',
    width: 960,
    height: 704
  }
};

export function educationalAsset(conceptId: string): EducationalAsset | null {
  if (conceptId in EDUCATIONAL_ASSETS) return EDUCATIONAL_ASSETS[conceptId as BiologyTopicId];
  return null;
}
