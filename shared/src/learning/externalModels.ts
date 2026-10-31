/**
 * External 3D models are listed only after a specific file's licence,
 * attribution, and redistribution terms have been checked.
 * An empty list means no third-party model is shipped.
 */
export interface CuratedExternalModel {
  id: string;
  title: string;
  subject: string;
  description: string;
  previewImage: string;
  diagramUrl: string | null;
  modelUrl: string;
  format: 'glb' | 'gltf' | 'stl' | 'obj';
  accessibleDescription: string;
  sourceName: string;
  sourceUrl: string;
  licence: string;
  attribution: string;
}

export const CURATED_EXTERNAL_MODELS: CuratedExternalModel[] = [];
