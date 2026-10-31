import React, { useEffect, useRef, useState } from 'react';
import { UploadCloud, Crop, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface MediaUploaderProps {
  onDiagramInterpreted: (data: any) => void;
  onLoadBenchmarkFixture: (fixtureName: string) => void;
}

type CropBox = { x: number; y: number; width: number; height: number };
type UploadSignature = { timestamp: number; signature: string; apiKey: string; cloudName: string; folder: string };
const MB = 1024 * 1024;

async function qualityWarning(file: File, page = 1): Promise<string | null> {
  if (file.type === 'application/pdf') return null;
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  const scale = Math.min(1, 500 / bitmap.width, 500 / bitmap.height);
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return null;
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
  let sum = 0;
  let sumSq = 0;
  let edge = 0;
  let previous = 0;
  let count = 0;
  for (let i = 0; i < data.length; i += 16) {
    const gray = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    sum += gray;
    sumSq += gray * gray;
    edge += Math.abs(gray - previous);
    previous = gray;
    count++;
  }
  const variance = sumSq / count - (sum / count) ** 2;
  const edgeScore = edge / count;
  if (variance < 180 || edgeScore < 7) return `Page ${page} looks blurry or low contrast (variance ${Math.round(variance)}, edge score ${edgeScore.toFixed(1)}). Try a sharper scan or crop tighter.`;
  return null;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({ onDiagramInterpreted, onLoadBenchmarkFixture }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [assetUrl, setAssetUrl] = useState<string | null>(null);
  const [publicId, setPublicId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [crop, setCrop] = useState<CropBox>({ x: 0.05, y: 0.1, width: 0.9, height: 0.8 });
  const [isUploading, setIsUploading] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const cropStart = useRef<{ x: number; y: number } | null>(null);
  const pdf = file?.type === 'application/pdf';
  const preview = file && pdf && publicId
    ? `https://res.cloudinary.com/${assetUrl?.match(/res\.cloudinary\.com\/([^/]+)/)?.[1]}/image/upload/pg_${page},f_png,q_auto/${publicId}.png`
    : previewUrl;

  useEffect(() => () => { if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const selectFile = async (selected?: File) => {
    if (!selected) return;
    setError(null); setWarning(null); setAssetUrl(null); setPublicId(null); setPage(1);
    const allowed = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];
    const maxSize = selected.type === 'application/pdf' ? 30 * MB : 15 * MB;
    if (!allowed.includes(selected.type) || selected.size > maxSize) {
      setError(selected.size > maxSize ? `File exceeds the ${selected.type === 'application/pdf' ? '30' : '15'} MB limit.` : 'Choose a PNG, JPG, WEBP, or PDF file.');
      return;
    }
    setFile(selected);
    setPreviewUrl(selected.type === 'application/pdf' ? null : URL.createObjectURL(selected));
    setCrop({ x: 0.05, y: 0.1, width: 0.9, height: 0.8 });
    setWarning(await qualityWarning(selected));
  };

  const upload = async (): Promise<{ url: string; id: string; signature: UploadSignature }> => {
    if (!file) throw new Error('Choose a file first.');
    const signatureResponse = await fetch('/api/uploads/signature', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder: 'conceptlens/uploads', tags: ['student-upload'] })
    });
    const signed = await signatureResponse.json();
    if (!signatureResponse.ok || !signed.success) throw new Error(signed.error || 'Could not authorize the upload. Configure Cloudinary on the server.');
    const signature: UploadSignature = signed.data;
    const form = new FormData();
    form.append('file', file); form.append('api_key', signature.apiKey); form.append('timestamp', String(signature.timestamp));
    form.append('signature', signature.signature); form.append('folder', signature.folder); form.append('tags', 'student-upload');
    form.append('allowed_formats', 'png,jpg,jpeg,webp,pdf');
    let response: Response | undefined;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        response = await fetch(`https://api.cloudinary.com/v1_1/${signature.cloudName}/auto/upload`, { method: 'POST', body: form });
        if (response.ok || response.status < 500) break;
      } catch { if (attempt === 2) throw new Error('Cloudinary upload failed. Check your connection and retry.'); }
      await new Promise((resolve) => setTimeout(resolve, 400 * 2 ** attempt));
    }
    if (!response?.ok) throw new Error('Cloudinary rejected this upload. Check server credentials and try again.');
    const result = await response.json();
    const record = await fetch('/api/uploads/record', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicId: result.public_id, originalFileName: file.name, fileType: file.type, bytes: result.bytes, secureUrl: result.secure_url })
    });
    if (!record.ok) throw new Error('Upload completed but asset metadata could not be saved.');
    setAssetUrl(result.secure_url); setPublicId(result.public_id);
    return { url: result.secure_url, id: result.public_id, signature };
  };

  const handleProcess = async () => {
    if (!file) return;
    setIsUploading(true); setError(null);
    try {
      if (pdf && (!assetUrl || !publicId)) {
        await upload();
        return;
      }
      const uploaded = assetUrl && publicId ? { url: assetUrl, id: publicId, signature: null } : await upload();
      const width = imageRef.current?.naturalWidth || 1;
      const height = imageRef.current?.naturalHeight || 1;
      const cropTransform = `c_crop,x_${Math.round(crop.x * width)},y_${Math.round(crop.y * height)},w_${Math.max(1, Math.round(crop.width * width))},h_${Math.max(1, Math.round(crop.height * height))}`;
      const cloudName = uploaded.signature?.cloudName || uploaded.url.match(/res\.cloudinary\.com\/([^/]+)/)?.[1];
      const transformed = `https://res.cloudinary.com/${cloudName}/image/upload/${pdf ? `pg_${page},` : ''}${cropTransform},e_deskew,e_sharpen:80,e_contrast,${pdf ? 'f_png' : 'f_auto'},q_auto/${uploaded.id}${pdf ? '.png' : ''}`;
      const response = await fetch('/api/diagrams/interpret', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: transformed, cropCoordinates: { x: crop.x, y: crop.y, width: crop.width, height: crop.height }, sourceContext: file.name })
      });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error || 'Diagram interpretation failed.');
      onDiagramInterpreted(json.data);
    } catch (e) { setError(e instanceof Error ? e.message : 'Upload failed.'); }
    finally { setIsUploading(false); }
  };

  const beginCrop = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    cropStart.current = { x, y };
    setCrop({ x, y, width: 0.01, height: 0.01 });
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const moveCrop = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!cropStart.current || !imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    const start = cropStart.current;
    setCrop({ x: Math.min(start.x, x), y: Math.min(start.y, y), width: Math.max(0.01, Math.abs(x - start.x)), height: Math.max(0.01, Math.abs(y - start.y)) });
  };

  return <section className="glass-panel" style={{ marginBottom: '1.5rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
      <div><h2 style={{ fontSize: '1.25rem' }}>Smart Document Ingestion</h2><p style={{ color: 'var(--text-secondary)', fontSize: '.85rem' }}>PDF page selection, crop, scan quality check, and signed Cloudinary upload.</p></div>
      <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
        {(['isc', 'anna', 'doubly', 'circular', 'ambiguous'] as const).map((name) => <button key={name} className="btn-secondary" type="button" onClick={() => onLoadBenchmarkFixture(name)}>{name === 'isc' ? 'ISC example' : name === 'anna' ? 'Delete-node example' : name === 'doubly' ? 'Doubly list' : name === 'circular' ? 'Circular list' : 'Review gate'}</button>)}
      </div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: preview ? 'minmax(220px, .7fr) minmax(300px, 1.3fr)' : '1fr', gap: '1rem' }}>
      <label className="upload-dropzone" style={{ minHeight: 150, border: '2px dashed var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
        <input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" onChange={(e) => void selectFile(e.target.files?.[0])} style={{ display: 'none' }} />
        <span style={{ textAlign: 'center' }}><UploadCloud size={28} /><br /><strong>{file?.name || 'Choose scan or paper'}</strong><br /><small>Images up to 15 MB · PDFs up to 30 MB</small></span>
      </label>
      {file && <div style={{ padding: '.75rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.5rem' }}><strong>{pdf ? `PDF page ${page}` : 'Drag over the diagram to crop'}</strong>{assetUrl && <CheckCircle2 size={17} color="var(--accent-emerald)" />}</div>
        {pdf && <label>Page <input type="number" min="1" value={page} onChange={(e) => setPage(Math.max(1, Number(e.target.value)))} style={{ width: 70, margin: '0 .5rem' }} /> Preview uses Cloudinary page slicing (pg_n).</label>}
        {preview ? <div onPointerDown={beginCrop} onPointerMove={moveCrop} onPointerUp={() => { cropStart.current = null; }} style={{ position: 'relative', marginTop: '.5rem', maxHeight: 280, overflow: 'hidden', touchAction: 'none', cursor: 'crosshair' }}>
          <img ref={imageRef} src={preview} alt={`Preview of ${file?.name}, page ${page}`} onError={() => pdf && assetUrl && setError('Could not render this PDF page. Check that Cloudinary PDF delivery is enabled.')} style={{ display: 'block', width: '100%', maxHeight: 280, objectFit: 'contain' }} />
          <div style={{ position: 'absolute', left: `${crop.x * 100}%`, top: `${crop.y * 100}%`, width: `${crop.width * 100}%`, height: `${crop.height * 100}%`, border: '2px solid #38bdf8', background: 'rgba(56,189,248,.12)', pointerEvents: 'none' }} />
        </div> : <p>Upload the PDF to render and select a page before interpretation.</p>}
        <button className="btn-primary" type="button" onClick={() => void handleProcess()} disabled={!file || isUploading} style={{ width: '100%', justifyContent: 'center', marginTop: '.75rem' }}><Crop size={16} />{isUploading ? 'Uploading and interpreting…' : pdf && !assetUrl ? 'Upload PDF and choose page' : 'Upload and interpret'}</button>
      </div>}
    </div>
    {warning && <p role="status" style={{ color: 'var(--accent-amber)', marginTop: '.75rem' }}><AlertTriangle size={15} /> {warning}</p>}
    {error && <p role="alert" style={{ color: '#fb7185', marginTop: '.75rem' }}>{error}</p>}
  </section>;
};
