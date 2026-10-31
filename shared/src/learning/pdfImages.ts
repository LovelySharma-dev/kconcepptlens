const DCT = [...'DCTDecode'].map((char) => char.charCodeAt(0));
const START = [0xff, 0xd8, 0xff];
const END = [0xff, 0xd9];

function findBytes(bytes: Uint8Array, pattern: number[], from: number): number {
  const last = bytes.length - pattern.length;
  for (let index = from; index <= last; index += 1) {
    let matched = true;
    for (let offset = 0; offset < pattern.length; offset += 1) {
      if (bytes[index + offset] !== pattern[offset]) {
        matched = false;
        break;
      }
    }
    if (matched) return index;
  }
  return -1;
}

/** JPEG images stored with a DCTDecode filter. Other scan encodings are left for the page renderer. */
export function extractEmbeddedJpegs(bytes: Uint8Array): Uint8Array[] {
  const images: Uint8Array[] = [];
  let cursor = 0;
  while (images.length < 3) {
    const marker = findBytes(bytes, DCT, cursor);
    if (marker < 0) break;
    const start = findBytes(bytes, START, marker);
    if (start < 0 || start - marker > 800) {
      cursor = marker + DCT.length;
      continue;
    }
    const end = findBytes(bytes, END, start + 3);
    if (end < 0) break;
    const image = bytes.slice(start, end + 2);
    if (image.byteLength > 80 && image.byteLength < 8 * 1024 * 1024) images.push(image);
    cursor = end + 2;
  }
  return images;
}
