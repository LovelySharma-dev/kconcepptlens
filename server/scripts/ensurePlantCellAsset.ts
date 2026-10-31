import { ensurePlantCellAsset, buildPlantCellMedia } from '../src/services/learningMedia';
import { isCloudinaryConfigured } from '../src/config/cloudinary';

async function main() {
  if (!isCloudinaryConfigured()) {
    console.log(JSON.stringify({ ok: false, blocker: 'Cloudinary credentials are not configured.' }));
    process.exit(2);
  }
  const asset = await ensurePlantCellAsset();
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim() || '';
  const variants = buildPlantCellMedia(cloudName, asset.publicId);
  const fetched = [];
  for (const variant of variants.filter((item) => item.id !== 'original')) {
    const response = await fetch(variant.url);
    const bytes = Buffer.from(await response.arrayBuffer());
    fetched.push({
      id: variant.id,
      status: response.status,
      contentType: response.headers.get('content-type'),
      bytes: bytes.length,
      host: new URL(variant.url).host
    });
  }
  const lengths = fetched.map((item) => item.bytes);
  console.log(JSON.stringify({
    ok: fetched.every((item) => item.status === 200),
    created: asset.created,
    publicId: asset.publicId,
    storedBytes: asset.bytes,
    storedWidth: asset.width,
    storedHeight: asset.height,
    cloudHost: new URL(asset.secureUrl).host,
    fetched,
    distinctSizes: new Set(lengths).size
  }));
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'upload failed';
  const safe = /api_secret|CLOUDINARY_API/i.test(message) ? 'Cloudinary rejected the request.' : message.slice(0, 180);
  console.log(JSON.stringify({ ok: false, blocker: safe }));
  process.exit(1);
});
