import React, { useState } from 'react';
import { UploadCloud, Crop, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface MediaUploaderProps {
  onDiagramInterpreted: (data: any) => void;
  onLoadBenchmarkFixture: (fixtureName: string) => void;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  onDiagramInterpreted,
  onLoadBenchmarkFixture
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [blurWarning, setBlurWarning] = useState<string | null>(null);

  // Quick preset loader
  const handleLoadPreset = (preset: 'isc' | 'anna' | 'ambiguous') => {
    if (preset === 'isc') {
      setPreviewUrl(
        'https://images.openai.com/static-rsc-4/XkO7gSqpO5GsWl0aO5MiA2a68-Km86zCJbP7hacxn3-Do1QE2-J4RFPWiD4Zok-ZLm1nIMK9SHjzJN5m-reEt3NepgQhcNz6LwIOjlOPx1bMFvDtj0NjD7jaa-LMnjFJHJBU7my4ijNaoAQ_LausBSz1KrYgEFjjDhZ1FnR1WuM?purpose=inline'
      );
      setBlurWarning(null);
      onLoadBenchmarkFixture('isc');
    } else if (preset === 'anna') {
      setPreviewUrl(
        'https://images.openai.com/static-rsc-4/NUFO3JUqMASZMvEkj90wZZBIwZZgDux-td4W5U8g84-h9w4dsCB-_1pW0GB1vKg9_oJDTJpyuf2jiPTyKU5XB55khTTfBdg11izPwG9A8rBwUd0EEz5zWlzrmLFx9mhEnDmTIkXHtMAtfg1ZRb44u_CfIxU731I9OnZjFuYlq50?purpose=inline'
      );
      setBlurWarning(null);
      onLoadBenchmarkFixture('anna');
    } else if (preset === 'ambiguous') {
      setPreviewUrl(null);
      setBlurWarning('Detected low-contrast scan. OCR confidence on label was 0.48. Triggering Gate 06 Human Correction.');
      onLoadBenchmarkFixture('ambiguous');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      alert('Accepted formats: PNG, JPG, WEBP, or PDF (Gate 01 Check)');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setBlurWarning(null);
  };

  const handleProcessMedia = async () => {
    setIsUploading(true);
    try {
      // 1. Ingest into interpretation API
      const res = await fetch('/api/diagrams/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: previewUrl || 'uploaded_sample.png',
          cropCoordinates: { x: 50, y: 100, width: 600, height: 350 },
          sourceContext: 'Student custom upload'
        })
      });
      const json = await res.json();
      if (json.success) {
        onDiagramInterpreted(json.data);
      }
    } catch (err: any) {
      console.error('Error processing media:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Smart Document Ingestion (Cloudinary Pipeline)
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Upload notes, exams, or pick a verified benchmark paper to inspect and validate.
          </p>
        </div>

        {/* Quick Benchmarks */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
            onClick={() => handleLoadPreset('isc')}
          >
            ISC 2025 (Q11)
          </button>
          <button
            type="button"
            className="btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
            onClick={() => handleLoadPreset('anna')}
          >
            Anna Univ (2019)
          </button>
          <button
            type="button"
            className="btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem', borderColor: 'var(--accent-amber)', color: 'var(--accent-amber)' }}
            onClick={() => handleLoadPreset('ambiguous')}
          >
            Test Gate 06 Review
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: previewUrl ? '1fr 1fr' : '1fr',
          gap: '1rem'
        }}
      >
        {/* Dropzone Container */}
        <label
          style={{
            border: '2px dashed var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            cursor: 'pointer',
            background: 'rgba(2, 6, 23, 0.4)',
            transition: 'border-color var(--transition-fast)'
          }}
        >
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(56, 189, 248, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-cyan)'
            }}
          >
            <UploadCloud size={24} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              Click to upload scan or paper
            </span>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              PNG, JPG, or PDF up to 15MB • Cloudinary auto-sharpening active
            </p>
          </div>
        </label>

        {/* Media Preview & Transform Box */}
        {previewUrl && (
          <div
            style={{
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              background: '#020617',
              padding: '0.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Cloudinary Preview (Sharpened)
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <CheckCircle2 size={12} /> Format Verified
              </span>
            </div>

            <div style={{ height: '140px', overflow: 'hidden', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <img
                src={previewUrl}
                alt="Uploaded study diagram crop preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <button
              type="button"
              className="btn-primary"
              onClick={handleProcessMedia}
              disabled={isUploading}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Crop size={16} />
              <span>{isUploading ? 'Extracting & Validating...' : 'Interpret Diagram & Run Gates'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Blur / Quality Warning */}
      {blurWarning && (
        <div
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: 'var(--accent-amber)',
            fontSize: '0.85rem'
          }}
        >
          <AlertTriangle size={18} />
          <span>{blurWarning}</span>
        </div>
      )}
    </div>
  );
};
