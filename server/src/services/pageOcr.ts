import { spawnSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { extractEmbeddedJpegs } from '@conceptlens/shared';

export interface PageReading {
  text: string;
  confidence: number | null;
  providerConfigured: boolean;
  origin: 'image' | 'scanned_pdf';
  note: string;
}

type OcrWorker = {
  recognize: (image: Buffer) => Promise<{ data: { text?: string; confidence?: number } }>;
  terminate: () => Promise<unknown>;
};

let workerPromise: Promise<OcrWorker> | null = null;

function unitConfidence(value: number | null | undefined): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return null;
  const unit = value > 1 ? value / 100 : value;
  return Math.round(unit * 1000) / 1000;
}

export async function ocrEngineStatus(): Promise<{ ready: boolean; note: string }> {
  try {
    await import('tesseract.js');
    return {
      ready: true,
      note: 'Local Tesseract reads English printed text on this server. The file is not sent to an OCR website. Handwriting is often weak, and you confirm the reading before it is explained.'
    };
  } catch {
    return {
      ready: false,
      note: 'The local OCR engine is not installed, so photographs and scanned pages stay unread.'
    };
  }
}

export async function closePageReader(): Promise<void> {
  const pending = workerPromise;
  workerPromise = null;
  if (!pending) return;
  try {
    const worker = await pending;
    await worker.terminate();
  } catch {
    /* The reader is already closed. */
  }
}

async function getWorker(): Promise<OcrWorker> {
  if (!workerPromise) {
    workerPromise = (async () => {
      const { createWorker } = await import('tesseract.js');
      const cachePath = path.resolve(__dirname, '../../ocr-cache');
      fs.mkdirSync(cachePath, { recursive: true });
      return createWorker('eng', 1, { cachePath });
    })().catch((error) => {
      workerPromise = null;
      throw error;
    });
  }
  return workerPromise;
}

export function readPdfTextLayer(
  bytes: Uint8Array,
  password?: string
): { ok: true; text: string; truncated: boolean } | { ok: false; status: string; error?: string } {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'conceptlens-pdf-'));
  const source = path.join(dir, 'source.pdf');
  try {
    fs.writeFileSync(source, bytes);
    const script = path.resolve(__dirname, '../../../python/page_prepare.py');
    const commands = process.platform === 'win32' ? [['python'], ['py', '-3']] : [['python3'], ['python']];
    for (const command of commands) {
      const payload: Record<string, unknown> = { kind: 'text', source, dest: source };
      if (password) {
        payload.password = password;
      }
      const result = spawnSync(command[0], [...command.slice(1), script], {
        input: JSON.stringify(payload),
        encoding: 'utf-8',
        timeout: 30000,
        windowsHide: true,
        maxBuffer: 8 * 1024 * 1024
      });
      if ((result.error as NodeJS.ErrnoException | undefined)?.code === 'ENOENT') continue;
      if (!result.stdout?.trim()) return { ok: false, status: 'failed' };
      try {
        const data = JSON.parse(result.stdout) as { ok?: boolean; status?: string; text?: string; truncated?: boolean; error?: string };
        const text = typeof data.text === 'string'
          ? data.text.replace(/\u0002/g, '-').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim()
          : '';
        if (data.ok === true && text) return { text, truncated: data.truncated === true, ok: true };
        return { ok: false, status: data.status || 'failed', error: data.error };
      } catch {
        return { ok: false, status: 'failed' };
      }
    }
    return { ok: false, status: 'failed' };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function runPrepare(kind: 'image' | 'pdf', source: string, dest: string, password?: string): boolean {
  const script = path.resolve(__dirname, '../../../python/page_prepare.py');
  const commands = process.platform === 'win32' ? [['python'], ['py', '-3']] : [['python3'], ['python']];
  for (const command of commands) {
    const payload: Record<string, unknown> = { kind, source, dest };
    if (password) {
      payload.password = password;
    }
    const result = spawnSync(command[0], [...command.slice(1), script], {
      input: JSON.stringify(payload),
      encoding: 'utf-8',
      timeout: 20000,
      windowsHide: true
    });
    if ((result.error as NodeJS.ErrnoException | undefined)?.code === 'ENOENT') continue;
    if (!result.stdout?.trim()) return false;
    try {
      const data = JSON.parse(result.stdout) as { ok?: boolean };
      return data.ok === true && fs.existsSync(dest);
    } catch {
      return false;
    }
  }
  return false;
}

async function recognizeFile(imagePath: string): Promise<{ text: string; confidence: number | null }> {
  const worker = await getWorker();
  const result = await worker.recognize(fs.readFileSync(imagePath));
  const text = (result.data.text || '').replace(/\s+/g, ' ').trim();
  return { text, confidence: unitConfidence(result.data.confidence) };
}

export async function readPage(
  bytes: Uint8Array,
  format: 'jpeg' | 'png' | 'webp' | 'pdf',
  password?: string
): Promise<PageReading> {
  const origin = format === 'pdf' ? 'scanned_pdf' : 'image';
  let configured = true;
  try {
    await import('tesseract.js');
  } catch {
    configured = false;
  }
  if (!configured) {
    return {
      text: '',
      confidence: null,
      providerConfigured: false,
      origin,
      note: 'The local OCR engine is not installed.'
    };
  }

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'conceptlens-ocr-'));
  try {
    const extension = format === 'jpeg' ? 'jpg' : format;
    const source = path.join(dir, `page.${extension}`);
    const prepared = path.join(dir, 'prepared.png');
    fs.writeFileSync(source, bytes);

    if (format === 'pdf' && runPrepare('pdf', source, prepared, password)) {
      const rendered = await recognizeFile(prepared);
      if (rendered.text) {
        return { ...rendered, providerConfigured: true, origin, note: '' };
      }
    }

    const candidates: string[] = [];
    if (format === 'pdf') {
      extractEmbeddedJpegs(bytes).forEach((jpeg, index) => {
        const jpegPath = path.join(dir, `embedded-${index}.jpg`);
        const enhanced = path.join(dir, `embedded-${index}.png`);
        fs.writeFileSync(jpegPath, jpeg);
        candidates.push(runPrepare('image', jpegPath, enhanced) ? enhanced : jpegPath);
      });
    } else if (runPrepare('image', source, prepared)) {
      candidates.push(prepared);
    } else if (format === 'jpeg' || format === 'png') {
      candidates.push(source);
    }

    const pieces: string[] = [];
    let confidence: number | null = null;
    for (const candidate of candidates) {
      const recognized = await recognizeFile(candidate);
      if (!recognized.text) continue;
      pieces.push(recognized.text);
      confidence = confidence === null || recognized.confidence === null ? recognized.confidence ?? confidence : Math.min(confidence, recognized.confidence);
    }
    if (pieces.length === 0) {
      return {
        text: '',
        confidence,
        providerConfigured: true,
        origin,
        note:
          format === 'pdf'
            ? 'This PDF has no text layer, and the page image could not be read. No text was invented. You can type what you see.'
            : 'The image was read and no text came back. No text was invented. You can type what you see.'
      };
    }
    return {
      text: pieces.join(' '),
      confidence,
      providerConfigured: true,
      origin,
      note: ''
    };
  } catch {
    return {
      text: '',
      confidence: null,
      providerConfigured: true,
      origin,
      note: 'The local reader did not finish. No text was invented. You can type what you see.'
    };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
