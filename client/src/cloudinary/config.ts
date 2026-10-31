import { Cloudinary } from '@cloudinary/url-gen';

/**
 * Public delivery cloud.
 * The React skill throws when VITE_CLOUDINARY_CLOUD_NAME is missing. ConceptLens
 * does not do that: a missing name, or the placeholder `your_cloud_name_here`,
 * falls back to Cloudinary's public `demo` cloud so lessons still load.
 * API secrets are never read here. Signed uploads stay on the Express server.
 */
const PLACEHOLDERS = new Set(['', 'your_cloud_name', 'your_cloud_name_here']);

function publicCloudName(): string {
  const configured = import.meta.env?.VITE_CLOUDINARY_CLOUD_NAME?.trim() ?? '';
  if (PLACEHOLDERS.has(configured)) return 'demo';
  return configured;
}

export const cloudinaryCloudName = publicCloudName();

/**
 * Curated lesson diagrams are fetched through the public demo cloud.
 * That path was checked against Wikimedia originals. A personal cloud name
 * is not required for these public images, and a mismatched account must
 * not blank the lesson.
 */
export const educationalCloudName = 'demo';

export const cld = new Cloudinary({
  cloud: { cloudName: educationalCloudName }
});
