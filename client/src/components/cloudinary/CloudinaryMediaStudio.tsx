import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  UploadCloud,
  AlertTriangle,
  ArrowRight,
  SlidersHorizontal,
  RefreshCw,
  Info,
  CheckCircle2,
  Sparkles,
  Crop,
  RotateCcw,
  FileCheck
} from 'lucide-react';
import { BiologyTopicId } from '@conceptlens/shared';
import {
  checkCloudinaryStatus,
  uploadDiagramToCloudinary,
  buildCloudinaryUrl,
  getDiagramCropUrl,
  CloudinaryStatus,
  DiagramCropOptions
} from '../../services/cloudinaryService';

interface CloudinaryMediaStudioProps {
  onSelectTopic: (topicId: BiologyTopicId) => void;
  onAnnounce?: (msg: string) => void;
}

interface DiagramPreset {
  id: string;
  topicId: BiologyTopicId;
  title: string;
  category: string;
  originalUrl: string;
  cloudinaryOptimizedUrl: string;
  publicId: string;
  sourceType: 'curated_preset' | 'live_upload';
  dimensions: string;
  originalBytes?: number;
  optimizedBytes?: number;
  appliedTransforms: string[];
}

const DEMO_CLOUD = 'demo';
const DEMO_PUBLIC_ID = 'sample';

const defaultPresets: DiagramPreset[] = [
  {
    id: 'cloudinary_demo_sample',
    topicId: 'human_cell',
    title: 'Public Cloudinary demo asset (sample)',
    category: 'Delivery proof — not a textbook scan',
    originalUrl: `https://res.cloudinary.com/${DEMO_CLOUD}/image/upload/c_scale,w_900/${DEMO_PUBLIC_ID}.jpg`,
    cloudinaryOptimizedUrl: `https://res.cloudinary.com/${DEMO_CLOUD}/image/upload/c_limit,w_900/e_sharpen:80,e_contrast/f_auto,q_auto/${DEMO_PUBLIC_ID}.jpg`,
    publicId: DEMO_PUBLIC_ID,
    sourceType: 'curated_preset',
    dimensions: 'Cloudinary sample photograph',
    appliedTransforms: ['f_auto', 'q_auto', 'e_sharpen:80', 'e_contrast', 'c_limit,w_900']
  }
];

export const CloudinaryMediaStudio: React.FC<CloudinaryMediaStudioProps> = ({
  onSelectTopic,
  onAnnounce
}) => {
  // Cloudinary Service Status
  const [status, setStatus] = useState<CloudinaryStatus>({
    configured: false,
    accountReachable: false,
    accountError: null,
    cloudName: null,
    folder: 'conceptlens/uploads',
    supportedFormats: ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'],
    maxSizeBytes: 15 * 1024 * 1024
  });

  // Active selected or uploaded diagram
  const [activePreset, setActivePreset] = useState<DiagramPreset>(defaultPresets[0]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Transformation Toggles
  const [enableSharpen, setEnableSharpen] = useState<boolean>(true);
  const [enableContrast, setEnableContrast] = useState<boolean>(true);
  const [activeCropMode, setActiveCropMode] = useState<'none' | 'organelle_focus' | 'label_region'>('none');

  // Interactive Comparison Slider Position (0 to 100%)
  const [sliderPos, setSliderPos] = useState<number>(50);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch real status from server on mount
  useEffect(() => {
    checkCloudinaryStatus().then((s) => setStatus(s));
  }, []);

  // Compute dynamic transformed URL based on active controls
  const computedTransformedUrl = useCallback(() => {
    const cloud = activePreset.sourceType === 'live_upload' && status.cloudName ? status.cloudName : DEMO_CLOUD;
    let crop: DiagramCropOptions | undefined = undefined;

    if (activeCropMode === 'organelle_focus') {
      crop = { x: 200, y: 150, w: 500, h: 400 };
    } else if (activeCropMode === 'label_region') {
      crop = { x: 50, y: 50, w: 600, h: 300 };
    }

    if (crop) {
      return getDiagramCropUrl(activePreset.publicId, cloud, crop);
    }

    return buildCloudinaryUrl(activePreset.publicId, cloud, {
      sharpen: enableSharpen,
      contrast: enableContrast,
      maxDimension: 900
    });
  }, [activePreset.publicId, status.cloudName, activeCropMode, enableSharpen, enableContrast]);

  const handleFileUpload = async (file: File) => {
    setUploadError(null);
    setUploadSuccess(null);
    setIsUploading(true);
    setUploadProgress(10);

    try {
      const result = await uploadDiagramToCloudinary(file, status, (p) => setUploadProgress(p));

      const origBytes = file.size;
      const optBytes = result.bytes || origBytes;
      const savings = result.savingsPercentage !== undefined
        ? `-${result.savingsPercentage}% bandwidth reduction`
        : undefined;

      const newPreset: DiagramPreset = {
        id: result.publicId,
        topicId: activePreset.topicId,
        title: file.name,
        category: 'Uploaded Study Diagram',
        originalUrl: result.secureUrl,
        cloudinaryOptimizedUrl: result.transformedUrl,
        publicId: result.publicId,
        sourceType: result.isLiveCloudinary ? 'live_upload' : 'curated_preset',
        dimensions: `${result.width} × ${result.height} px`,
        originalBytes: origBytes,
        optimizedBytes: optBytes,
        appliedTransforms: ['f_auto', 'q_auto', 'e_sharpen:80', 'e_contrast', 'c_limit,w_900']
      };

      setActivePreset(newPreset);
      if (!result.isLiveCloudinary || !result.secureUrl.startsWith('https://res.cloudinary.com/')) {
        setUploadError('Cloudinary did not confirm this upload. The demo image below is unchanged.');
        if (onAnnounce) onAnnounce('Upload was not confirmed by Cloudinary.');
        return;
      }
      setUploadSuccess(`Uploaded to Cloudinary (${(optBytes / 1024).toFixed(0)} KB${savings ? `, ${savings}` : ''}).`);
      if (onAnnounce) onAnnounce(`Uploaded ${file.name} to Cloudinary.`);
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed. Please try again with a valid PNG, JPG, or PDF.');
      if (onAnnounce) onAnnounce(`Upload error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setActivePreset(defaultPresets[0]);
    setSliderPos(50);
    setEnableSharpen(true);
    setEnableContrast(true);
    setActiveCropMode('none');
    setUploadError(null);
    setUploadSuccess(null);
    if (onAnnounce) onAnnounce('Reset Cloudinary Media Studio to default Animal Cell preset.');
  };

  const handleKeyDownSlider = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      setSliderPos((p) => Math.max(0, p - 5));
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      setSliderPos((p) => Math.min(100, p + 5));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setSliderPos(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setSliderPos(100);
    }
  };

  const currentTransformedSrc = activePreset.sourceType === 'curated_preset' && activeCropMode === 'none' && enableSharpen && enableContrast
    ? activePreset.cloudinaryOptimizedUrl
    : computedTransformedUrl();

  return (
    <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
      {/* SECTION HEADER & REAL CLOUDINARY STATUS */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
              Make every detail visible.
            </h2>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.2rem 0.65rem',
                borderRadius: '999px',
                background: status.accountReachable
                  ? 'rgba(140, 231, 189, 0.15)'
                  : status.configured
                    ? 'rgba(245, 158, 11, 0.14)'
                    : 'rgba(101, 229, 242, 0.12)',
                color: status.accountReachable
                  ? 'var(--accent-mint)'
                  : status.configured
                    ? '#fbbf24'
                    : 'var(--accent-cyan)',
                border: `1px solid ${status.accountReachable ? 'rgba(140, 231, 189, 0.35)' : status.configured ? 'rgba(245, 158, 11, 0.45)' : 'rgba(101, 229, 242, 0.35)'}`
              }}
            >
              {status.accountReachable
                ? `Signed uploads ready (${status.cloudName})`
                : status.configured
                  ? 'Signed upload blocked — account check failed'
                  : 'Signed uploads off — public demo delivery is live'}
            </span>
            <span
              style={{
                fontSize: '0.68rem',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              {status.accountReachable ? 'Signed upload ready' : 'Public delivery'} • f_auto • q_auto • e_sharpen
            </span>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: 1.5, maxWidth: '720px' }}>
            The comparison below is Cloudinary's public <code>demo/sample</code> photograph, delivered with <code>f_auto</code>, <code>q_auto</code>, sharpen, and contrast. It is not a textbook page. Signed uploads run only after the server credentials pass Cloudinary's account check.
            {status.accountError ? ` Account check: ${status.accountError}.` : ''}
          </p>
        </div>

        {/* Global Studio Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 0.9rem', fontSize: '0.8rem' }}
            onClick={handleReset}
            title="Reset to default Animal Cell preset and clear custom adjustments"
          >
            <RotateCcw size={14} />
            <span>Reset Demo</span>
          </button>
          <button
            type="button"
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 1.25rem' }}
            onClick={() => onSelectTopic(activePreset.topicId)}
          >
            <span>Explore in 3D Biology Studio</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* MAIN TWO-COLUMN WORKSPACE */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '1.5rem' }}>
        {/* LEFT COLUMN: Ingestion Dropzone & Curated Curriculum Presets */}
        <div>
          {/* Upload Drop Area */}
          <div
            className="upload-dropzone"
            tabIndex={0}
            role="button"
            aria-label="Choose a PNG, JPEG, WebP, or PDF to upload after the Cloudinary account check succeeds"
            style={{
              border: '2px dashed rgba(101, 229, 242, 0.45)',
              borderRadius: '12px',
              padding: '1.4rem',
              textAlign: 'center',
              background: 'rgba(13, 18, 29, 0.75)',
              cursor: 'pointer',
              marginBottom: '1rem',
              transition: 'all 0.2s ease'
            }}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/png,image/jpeg,image/webp,application/pdf"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
              }}
            />
            <UploadCloud size={32} color="var(--accent-cyan)" style={{ margin: '0 auto 0.4rem auto' }} />
            <div style={{ fontWeight: 600, fontSize: '0.92rem', marginBottom: '0.2rem', color: 'var(--text-primary)' }}>
              Drop textbook diagram, paper photo, or PDF scan
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              PNG, JPG, WebP, or PDF up to 15MB. A file is stored only after Cloudinary confirms the upload.
            </div>

            {isUploading && (
              <div style={{ marginTop: '0.85rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                  <RefreshCw size={14} className="spin" />
                  <span>Processing Cloudinary pipeline ({uploadProgress}%)...</span>
                </div>
                <div style={{ width: '100%', height: '4px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--accent-cyan)', transition: 'width 0.3s ease' }} />
                </div>
              </div>
            )}
          </div>

          {/* Feedback Banners */}
          {uploadError && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.65rem 0.85rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5', fontSize: '0.8rem', marginBottom: '1rem', lineHeight: 1.4 }}>
              <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Upload Notice:</strong> {uploadError}
              </div>
            </div>
          )}

          {uploadSuccess && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.65rem 0.85rem', borderRadius: '8px', background: 'rgba(140, 231, 189, 0.12)', border: '1px solid rgba(140, 231, 189, 0.35)', color: '#8ce7bd', fontSize: '0.8rem', marginBottom: '1rem', lineHeight: 1.4 }}>
              <FileCheck size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{uploadSuccess}</div>
            </div>
          )}

          {/* Curated Syllabus Diagrams */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Delivery sample:
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {defaultPresets.length} Curriculum Specimens
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {defaultPresets.map((preset) => (
                <div
                  key={preset.id}
                  tabIndex={0}
                  role="button"
                  aria-label={`Select ${preset.title} specimen`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.55rem 0.85rem',
                    borderRadius: '8px',
                    background: activePreset.id === preset.id ? 'rgba(101, 229, 242, 0.14)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${activePreset.id === preset.id ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onClick={() => {
                    setActivePreset(preset);
                    setUploadError(null);
                    setUploadSuccess(null);
                    if (onAnnounce) onAnnounce(`Selected ${preset.title}`);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActivePreset(preset);
                      setUploadError(null);
                      setUploadSuccess(null);
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, background: '#080b12' }}>
                      <img src={preset.originalUrl} alt={preset.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>{preset.title}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {preset.category} • {preset.dimensions}
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      background: 'rgba(101, 229, 242, 0.1)',
                      color: 'var(--accent-cyan)',
                      border: '1px solid rgba(101, 229, 242, 0.25)'
                    }}
                  >
                    demo/sample
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Comparison Slider & Pipeline Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Controls Bar: Sliders, Cropping & Quick Snaps */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.85rem' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <SlidersHorizontal size={15} color="var(--accent-cyan)" />
              <span>Side-by-Side Ingestion Inspector</span>
            </span>

            {/* Quick Snap Positions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: '0.7rem', padding: '0.25rem 0.55rem' }}
                onClick={() => setSliderPos(100)}
                title="Show 100% Original Scan"
              >
                100% Original
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: '0.7rem', padding: '0.25rem 0.55rem' }}
                onClick={() => setSliderPos(50)}
                title="Reset to 50/50 Split"
              >
                50/50 Split
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: '0.7rem', padding: '0.25rem 0.55rem' }}
                onClick={() => setSliderPos(0)}
                title="Show 100% Enhanced View"
              >
                100% Enhanced
              </button>
            </div>
          </div>

          {/* DUAL LAYER COMPARISON SLIDER CANVAS */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '320px',
              borderRadius: '12px',
              overflow: 'hidden',
              userSelect: 'none',
              background: '#070b14',
              border: '1px solid var(--border-subtle)',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)'
            }}
          >
            {/* Background Layer: Cloudinary Transformed Preview */}
            <img
              src={currentTransformedSrc}
              alt="Same Cloudinary demo photograph after sharpen, contrast, and automatic format delivery"
              onError={() => setUploadError('Cloudinary could not deliver the transformed image. Check the delivery URL below.')}
              style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }}
            />

            {/* Transformed Label Badge */}
            <div
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(16, 185, 129, 0.92)',
                color: '#ffffff',
                padding: '0.25rem 0.65rem',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 700,
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
              }}
            >
              <Sparkles size={12} />
              <span>Transformed delivery</span>
            </div>

            {/* Foreground Clipped Layer: Original Scan */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: `${sliderPos}%`,
                height: '100%',
                overflow: 'hidden',
                borderRight: '2.5px solid var(--accent-cyan)'
              }}
            >
              <img
                src={activePreset.originalUrl}
                alt="Untransformed Cloudinary demo photograph"
                onError={() => setUploadError('Cloudinary could not deliver the original image.')}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  minWidth: '400px'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: 'rgba(8, 11, 18, 0.88)',
                  color: 'var(--text-secondary)',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  border: '1px solid var(--border-subtle)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
                }}
              >
                Original delivery
              </div>
            </div>

            {/* Center Grabber Knob */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: `${sliderPos}%`,
                transform: 'translate(-50%, -50%)',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--bg-elevated)',
                border: '2px solid var(--accent-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-cyan)',
                boxShadow: '0 0 14px rgba(101, 229, 242, 0.65)',
                pointerEvents: 'none',
                zIndex: 6
              }}
            >
              <SlidersHorizontal size={14} />
            </div>

            {/* Native Accessible Range Slider Input */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              onKeyDown={handleKeyDownSlider}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'ew-resize',
                zIndex: 10
              }}
              aria-label="Interactive image comparison slider. Use Left and Right arrow keys to compare original scan with enhanced preview."
            />
          </div>

          {/* Slider Caption */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <span>← Original ({sliderPos}%)</span>
            <span>Use Left/Right arrows or drag to inspect</span>
            <span>Transformed ({100 - sliderPos}%) →</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.75rem', lineHeight: 1.45, color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
            Delivery URL:{' '}
            <a href={currentTransformedSrc} target="_blank" rel="noreferrer">
              {currentTransformedSrc}
            </a>
          </p>

          {/* TRANSFORMATION & PIPELINE CONTROLS */}
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Cloudinary Transformation Pipeline Configuration:
              </span>

              {/* Interactive Pipeline Toggles */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <button
                  type="button"
                  className={enableSharpen ? 'btn-primary' : 'btn-secondary'}
                  style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem' }}
                  onClick={() => setEnableSharpen(!enableSharpen)}
                  title="Toggle Cloudinary e_sharpen filter"
                >
                  e_sharpen:80 {enableSharpen ? 'ON' : 'OFF'}
                </button>
                <button
                  type="button"
                  className={enableContrast ? 'btn-primary' : 'btn-secondary'}
                  style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem' }}
                  onClick={() => setEnableContrast(!enableContrast)}
                  title="Toggle Cloudinary e_contrast filter"
                >
                  e_contrast {enableContrast ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            {/* Bounding Box Crop Presets */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Crop size={12} color="var(--accent-cyan)" />
                <span>Bounded Crop Engine:</span>
              </span>
              <button
                type="button"
                className={activeCropMode === 'none' ? 'btn-primary' : 'btn-secondary'}
                style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}
                onClick={() => setActiveCropMode('none')}
              >
                Full frame (c_limit)
              </button>
              <button
                type="button"
                className={activeCropMode === 'organelle_focus' ? 'btn-primary' : 'btn-secondary'}
                style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}
                onClick={() => setActiveCropMode('organelle_focus')}
                title="Apply a center crop to this Cloudinary asset"
              >
                Center crop (c_crop)
              </button>
              <button
                type="button"
                className={activeCropMode === 'label_region' ? 'btn-primary' : 'btn-secondary'}
                style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}
                onClick={() => setActiveCropMode('label_region')}
                title="Apply an upper-region crop to this Cloudinary asset"
              >
                Upper region (c_crop)
              </button>
            </div>

            {/* Active URL Tokens */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {[
                { tag: 'f_auto', desc: 'Auto WebP/AVIF format negotiation' },
                { tag: 'q_auto', desc: 'Perceptual quality compression' },
                enableSharpen ? { tag: 'e_sharpen:80', desc: 'Ink line and organelle membrane clarity' } : null,
                enableContrast ? { tag: 'e_contrast', desc: 'Textbook page shadow and glare removal' } : null,
                activeCropMode !== 'none'
                  ? { tag: activeCropMode === 'organelle_focus' ? 'c_crop,w_500,h_400' : 'c_crop,w_600,h_300', desc: 'Bounded diagram crop' }
                  : { tag: 'c_limit,w_900', desc: 'Display downsampling max 900px' }
              ].filter(Boolean).map((t: any) => (
                <span
                  key={t.tag}
                  title={t.desc}
                  style={{
                    fontSize: '0.7rem',
                    fontFamily: 'var(--font-mono)',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '5px',
                    background: 'rgba(101, 229, 242, 0.1)',
                    color: 'var(--accent-cyan)',
                    border: '1px solid rgba(101, 229, 242, 0.25)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <strong>{t.tag}</strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>({t.desc})</span>
                </span>
              ))}
            </div>

            {/* Asset Metadata Display (Dimensions, File Size, Bandwidth Delta) */}
            <div style={{ marginTop: '0.65rem', paddingTop: '0.65rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.74rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-secondary)' }}>
                <span>Dimensions: <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{activePreset.dimensions}</strong></span>
                {activePreset.originalBytes && (
                  <span>Original: <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{(activePreset.originalBytes / 1024).toFixed(0)} KB</strong></span>
                )}
                {activePreset.optimizedBytes && (
                  <span>Delivered: <strong style={{ color: 'var(--accent-mint)', fontFamily: 'var(--font-mono)' }}>{(activePreset.optimizedBytes / 1024).toFixed(0)} KB</strong></span>
                )}
              </div>

              {activePreset.originalBytes && activePreset.optimizedBytes && activePreset.originalBytes > activePreset.optimizedBytes && (
                <div style={{ color: 'var(--accent-mint)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                  <CheckCircle2 size={13} />
                  <span>Bandwidth Saved: {Math.round(((activePreset.originalBytes - activePreset.optimizedBytes) / activePreset.originalBytes) * 100)}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Educational Purpose Rationale */}
          <div style={{ display: 'flex', gap: '0.6rem', padding: '0.75rem 0.9rem', borderRadius: '8px', background: 'rgba(101, 229, 242, 0.06)', border: '1px solid rgba(101, 229, 242, 0.2)', fontSize: '0.78rem', lineHeight: 1.45, color: 'var(--text-secondary)' }}>
            <Info size={16} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: 'var(--accent-cyan)', display: 'block', marginBottom: '0.15rem' }}>
                Why Cloudinary Media Ingestion is Essential for STEM Accessibility:
              </strong>
              Smartphone textbook photos frequently suffer from low contrast, page curvature shadows, and excessive file sizes (3–8MB). Cloudinary’s server-signed pipeline sharpens ink edges (<code style={{ color: 'var(--accent-cyan)' }}>e_sharpen</code>), flattens lighting gradients (<code style={{ color: 'var(--accent-cyan)' }}>e_contrast</code>), and delivers lightweight responsive WebP/AVIF formats (<code style={{ color: 'var(--accent-cyan)' }}>f_auto, q_auto</code>) so students on mobile bandwidth can explore diagrams instantaneously without data exhaustion.
            </div>
          </div>

          {/* Action Button: Explore Diagram in Biology Studio */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
            <button
              type="button"
              className="btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.35rem',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              onClick={() => onSelectTopic(activePreset.topicId)}
            >
              <span>Explore {activePreset.title} in Biology Studio</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloudinaryMediaStudio;
