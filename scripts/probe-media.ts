import { educationalDeliveryUrl } from '../client/src/cloudinary/educationalImage';
import { EDUCATIONAL_ASSETS } from '../client/src/data/educationalMedia';

async function main() {
  const urls: Array<[string, string]> = [];
  for (const asset of Object.values(EDUCATIONAL_ASSETS)) {
    urls.push([`${asset.conceptId}-800`, educationalDeliveryUrl(asset.remoteUrl, false)]);
    urls.push([`${asset.conceptId}-480`, educationalDeliveryUrl(asset.remoteUrl, true)]);
  }
  for (const [name, url] of urls) {
    const res = await fetch(url, { headers: { Accept: 'image/avif,image/webp,image/png,image/*' } });
    const buf = Buffer.from(await res.arrayBuffer());
    console.log([name, res.status, res.headers.get('content-type'), buf.length].join(' | '));
  }
}

main();
