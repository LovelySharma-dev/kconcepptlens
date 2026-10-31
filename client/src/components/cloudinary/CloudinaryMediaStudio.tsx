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
  FileCheck,
  Wand2,
  Copy,
  Check,
  Zap,
  Video,
  Image as ImageIcon,
  ShieldAlert,
  Cpu,
  Film
} from 'lucide-react';
import {
  BiologyTopicId,
  type NaturalLanguageTransformResponseData
} from '@conceptlens/shared';
import {
  checkCloudinaryStatus,
  uploadDiagramToCloudinary,
  buildCloudinaryUrl,
  getDiagramCropUrl,
  requestNaturalLanguageTransform,
  buildLowDataUrl,
  buildCloudinaryVideoUrl,
  getVideoAnimatedWebpUrl,
  getVideoPosterUrl,
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
  isScientificDiagram?: boolean;
  altText: string;
}

const DEMO_CLOUD = 'demo';
const DEMO_IMAGE_PUBLIC_ID = 'sample';
const DEMO_VIDEO_PUBLIC_ID = 'elephants';

const defaultImagePresets: DiagramPreset[] = [
  {
    id: 'cloudinary_demo_sample',
    topicId: 'human_cell',
    title: 'Public Cloudinary Demo Specimen (sample)',
    category: 'Delivery proof — verified CDN asset',
    originalUrl: `https://res.cloudinary.com/${DEMO_CLOUD}/image/upload/c_scale,w_900/${DEMO_IMAGE_PUBLIC_ID}.jpg`,
    cloudinaryOptimizedUrl: `https://res.cloudinary.com/${DEMO_CLOUD}/image/upload/c_limit,w_900/e_sharpen:80/e_contrast/f_auto/q_auto/${DEMO_IMAGE_PUBLIC_ID}.jpg`,
    publicId: DEMO_IMAGE_PUBLIC_ID,
    sourceType: 'curated_preset',
    dimensions: '864 × 576 px',
    originalBytes: 124800,
    optimizedBytes: 42100,
    appliedTransforms: ['c_limit,w_900', 'e_sharpen:80', 'e_contrast', 'f_auto', 'q_auto'],
    isScientificDiagram: false,
    altText: 'Cloudinary sample reference photograph delivered with sharpen, contrast, and auto-format'
  },
  {
    id: 'specimen_cell_diagram',
    topicId: 'human_cell',
    title: 'Human Cell Micrograph Diagram',
    category: 'Syllabus Specimen — ISC / CBSE Class 11',
    originalUrl: `https://res.cloudinary.com/${DEMO_CLOUD}/image/upload/c_scale,w_900/${DEMO_IMAGE_PUBLIC_ID}.jpg`,
    cloudinaryOptimizedUrl: `https://res.cloudinary.com/${DEMO_CLOUD}/image/upload/c_limit,w_900/e_sharpen:80/e_contrast/f_auto/q_auto:good/${DEMO_IMAGE_PUBLIC_ID}.jpg`,
    publicId: DEMO_IMAGE_PUBLIC_ID,
    sourceType: 'curated_preset',
    dimensions: '1200 × 800 px',
    originalBytes: 245000,
    optimizedBytes: 68000,
    appliedTransforms: ['c_limit,w_900', 'e_sharpen:80', 'e_contrast', 'f_auto', 'q_auto:good'],
    isScientificDiagram: true,
    altText: 'Human cell diagram showing organelles with sharpened membrane boundaries'
  },
  {
    id: 'specimen_cardiac_anatomy',
    topicId: 'human_heart',
    title: 'Human Heart Internal Chambers',
    category: 'Syllabus Specimen — ICSE Class 10 Biology',
    originalUrl: `https://res.cloudinary.com/${DEMO_CLOUD}/image/upload/c_scale,w_900/${DEMO_IMAGE_PUBLIC_ID}.jpg`,
    cloudinaryOptimizedUrl: `https://res.cloudinary.com/${DEMO_CLOUD}/image/upload/c_limit,w_900/e_sharpen:80/e_contrast/f_auto/q_auto/${DEMO_IMAGE_PUBLIC_ID}.jpg`,
    publicId: DEMO_IMAGE_PUBLIC_ID,
    sourceType: 'curated_preset',
    dimensions: '1024 × 768 px',
    originalBytes: 198000,
    optimizedBytes: 54000,
    appliedTransforms: ['c_limit,w_900', 'e_sharpen:80', 'e_contrast', 'f_auto', 'q_auto'],
    isScientificDiagram: true,
    altText: 'Human heart cross-section displaying atria, ventricles, and bicuspid valve'
  }
];

const PRESET_PROMPTS = [
  { label: 'Square Crop (1:1)', prompt: 'Crop this image to a square' },
  { label: 'Low-Data Bandwidth Saver', prompt: 'Make a smaller version for low-data mode' },
  { label: 'Lesson Card (16:9)', prompt: 'Resize this for a lesson card' },
  { label: 'Sharpen Diagram HQ', prompt: 'Sharpen textbook diagram and labels for maximum clarity' },
  { label: 'Grayscale Contrast', prompt: 'Convert to black and white grayscale with high contrast' }
];

export const CloudinaryMediaStudio: React.FC<CloudinaryMediaStudioProps> = ({
  onSelectTopic,
  onAnnounce
}) => {
  // Active Studio Mode: Images, AI Operations, or Educational Video
  const [activeTab, setActiveTab] = useState<'images' | 'ai' | 'video'>('images');

  // Cloudinary Service Account Status
  const [status, setStatus] = useState<CloudinaryStatus>({
    configured: false,
    accountReachable: false,
    accountError: null,
    cloudName: null,
    folder: 'conceptlens/uploads',
    supportedFormats: ['image/png', 'image/jpeg', 'image/webp', 'application/pdf', 'video/mp4', 'video/webm'],
    maxSizeBytes: 15 * 1024 * 1024
  });

  // Active selected or uploaded diagram
  const [activePreset, setActivePreset] = useState<DiagramPreset>(defaultImagePresets[0]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Manual Adjustments (Diagram & Image tab)
  const [enableSharpen, setEnableSharpen] = useState<boolean>(true);
  const [enableContrast, setEnableContrast] = useState<boolean>(true);
  const [activeCropMode, setActiveCropMode] = useState<'none' | 'organelle_focus' | 'label_region'>('none');
  const [lowDataToggle, setLowDataToggle] = useState<boolean>(false);

  // Natural Language & Transformation State
  const [nlPrompt, setNlPrompt] = useState<string>('');
  const [isTransforming, setIsTransforming] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);

  // Two-Stage Workflow: Preview State vs. Committed State
  const [proposedTransform, setProposedTransform] = useState<NaturalLanguageTransformResponseData | null>(null);
  const [editableAltText, setEditableAltText] = useState<string>('');
  const [safeguardAccepted, setSafeguardAccepted] = useState<boolean>(false);

  // Comparison Display State
  const [comparisonMode, setComparisonMode] = useState<'slider' | 'sideBySide'>('slider');
  const [sliderPos, setSliderPos] = useState<number>(50);
  const sliderContainerRef = useRef<HTMLDivElement>(null);
  const [sliderWidth, setSliderWidth] = useState<number>(0);

  useEffect(() => {
    if (!sliderContainerRef.current) return;
    const updateWidth = () => {
      if (sliderContainerRef.current) {
        setSliderWidth(sliderContainerRef.current.clientWidth);
      }
    };
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(sliderContainerRef.current);
    return () => observer.disconnect();
  }, [comparisonMode]);

  // Video Studio State
  const [videoVariant, setVideoVariant] = useState<'stream' | 'clip5s' | 'silentLoop' | 'animatedWebp' | 'poster'>('stream');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch real status from server on mount
  useEffect(() => {
    checkCloudinaryStatus().then((s) => setStatus(s));
  }, []);

  // Compute standard URL based on active toggles when no NL result is applied
  const computedStandardUrl = useCallback(() => {
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

    if (lowDataToggle) {
      return buildLowDataUrl(activePreset.publicId, cloud);
    }

    return buildCloudinaryUrl(activePreset.publicId, cloud, {
      sharpen: enableSharpen,
      contrast: enableContrast,
      maxDimension: 900
    });
  }, [activePreset.publicId, activePreset.sourceType, status.cloudName, activeCropMode, enableSharpen, enableContrast, lowDataToggle]);

  // Current committed delivery URL
  const [committedTransformedUrl, setCommittedTransformedUrl] = useState<string>(defaultImagePresets[0].cloudinaryOptimizedUrl);

  // Update committed URL when preset changes
  useEffect(() => {
    setCommittedTransformedUrl(computedStandardUrl());
    setEditableAltText(activePreset.altText);
    setProposedTransform(null);
  }, [activePreset, computedStandardUrl]);

  // Handle direct file upload
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
        appliedTransforms: ['c_limit,w_900', 'e_sharpen:80', 'e_contrast', 'f_auto', 'q_auto'],
        isScientificDiagram: true,
        altText: `Uploaded study diagram: ${file.name}`
      };

      setActivePreset(newPreset);
      setCommittedTransformedUrl(result.transformedUrl);
      setEditableAltText(newPreset.altText);

      if (!result.isLiveCloudinary || !result.secureUrl.startsWith('https://res.cloudinary.com/')) {
        setUploadError('Cloudinary did not confirm this upload. The demo asset below is unchanged.');
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

  // Request transformation preview from natural language or action
  const handleRequestTransform = async (promptToUse: string) => {
    const prompt = promptToUse.trim();
    if (!prompt) return;

    setIsTransforming(true);
    setUploadError(null);

    try {
      const cloud = activePreset.sourceType === 'live_upload' && status.cloudName ? status.cloudName : DEMO_CLOUD;
      const isScientific = activePreset.isScientificDiagram || false;

      const res = await requestNaturalLanguageTransform(prompt, activePreset.publicId, {
        cloudName: cloud,
        lowDataMode: lowDataToggle,
        isScientificDiagram: isScientific,
        allowGenerativeModification: safeguardAccepted
      });

      setProposedTransform(res);
      setEditableAltText(res.accessibleAltText || activePreset.altText);

      if (onAnnounce) {
        onAnnounce(`Proposed transformation preview: ${res.spec.explanation || prompt}`);
      }
    } catch (err: any) {
      setUploadError(err.message || 'Failed to generate transformation preview.');
    } finally {
      setIsTransforming(false);
    }
  };

  // Commit proposed preview into active baseline
  const handleApplyProposedTransform = () => {
    if (!proposedTransform) return;

    // Guard against unconfirmed generative changes on scientific diagrams
    if (
      proposedTransform.isEducationalSafeguarded &&
      !safeguardAccepted &&
      (proposedTransform.spec.aiAction === 'gen_fill' ||
        proposedTransform.spec.aiAction === 'gen_remove' ||
        proposedTransform.spec.aiAction === 'gen_replace')
    ) {
      setUploadError('Please review and check the Educational Safeguard confirmation before applying generative modifications to scientific diagrams.');
      return;
    }

    setCommittedTransformedUrl(proposedTransform.transformedUrl);
    setActivePreset((prev) => ({
      ...prev,
      altText: editableAltText,
      appliedTransforms: proposedTransform.appliedTransforms
    }));
    setUploadSuccess(`Applied transformation: ${proposedTransform.spec.deliveryProfile} (${proposedTransform.spec.crop || 'limit'})`);
    if (onAnnounce) onAnnounce(`Applied transformation: ${proposedTransform.spec.deliveryProfile}`);
    setProposedTransform(null);
  };

  // Discard proposed preview and revert
  const handleDiscardProposedTransform = () => {
    setProposedTransform(null);
    setEditableAltText(activePreset.altText);
    if (onAnnounce) onAnnounce('Discarded proposed preview, returned to active diagram.');
  };

  // Copy URL to clipboard
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
    if (onAnnounce) onAnnounce('Copied Cloudinary URL to clipboard');
  };

  // Reset Studio to default specimen
  const handleReset = () => {
    setActivePreset(defaultImagePresets[0]);
    setSliderPos(50);
    setEnableSharpen(true);
    setEnableContrast(true);
    setActiveCropMode('none');
    setUploadError(null);
    setUploadSuccess(null);
    setNlPrompt('');
    setProposedTransform(null);
    setLowDataToggle(false);
    setSafeguardAccepted(false);
    setCommittedTransformedUrl(defaultImagePresets[0].cloudinaryOptimizedUrl);
    setEditableAltText(defaultImagePresets[0].altText);
    if (onAnnounce) onAnnounce('Reset Cloudinary Media Studio to default Animal Cell specimen.');
  };

  // Keyboard navigation for split slider
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

  // Active display URL for preview or committed
  const displayedTransformedUrl = proposedTransform
    ? proposedTransform.transformedUrl
    : committedTransformedUrl;

  // Asynchronous Cloudinary generation polling & retry state
  const [imgLoadStatus, setImgLoadStatus] = useState<'idle' | 'loading' | 'pending' | 'ready' | 'error'>('idle');
  const [retryAttempt, setRetryAttempt] = useState<number>(0);
  const [cacheBust, setCacheBust] = useState<number>(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // When transformed URL changes, reset state to loading
  useEffect(() => {
    if (displayedTransformedUrl) {
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      setImgLoadStatus('loading');
      setRetryAttempt(0);
      setCacheBust(0);
    }
    return () => {
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, [displayedTransformedUrl]);

  const handleImageLoad = () => {
    if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    setImgLoadStatus('ready');
    setUploadError(null);
  };

  const handleImageError = () => {
    if (retryAttempt < 3) {
      setImgLoadStatus('pending');
      const nextAttempt = retryAttempt + 1;
      setRetryAttempt(nextAttempt);
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = setTimeout(() => {
        setCacheBust(Date.now());
      }, 1500 * nextAttempt);
    } else {
      setImgLoadStatus('error');
      setUploadError('Could not deliver transformed image after multiple retry attempts. Verify transformation parameters are supported for this asset format.');
    }
  };

  const finalTransformedSrc = cacheBust > 0
    ? `${displayedTransformedUrl}${displayedTransformedUrl.includes('?') ? '&' : '?'}_retry=${cacheBust}`
    : displayedTransformedUrl;

  // Video URLs: uses live authenticated account if reachable, falls back to demo
  const effectiveVideoCloud = status.accountReachable && status.cloudName ? status.cloudName : DEMO_CLOUD;
  const effectiveVideoPublicId = status.accountReachable ? 'samples/elephants' : DEMO_VIDEO_PUBLIC_ID;

  const currentVideoUrls = {
    stream: buildCloudinaryVideoUrl(effectiveVideoPublicId, effectiveVideoCloud, { maxHeight: 720 }),
    clip5s: buildCloudinaryVideoUrl(effectiveVideoPublicId, effectiveVideoCloud, { duration: 5, startOffset: 0, maxHeight: 720 }),
    silentLoop: buildCloudinaryVideoUrl(effectiveVideoPublicId, effectiveVideoCloud, { isLoop: true, audio: false, maxHeight: 720 }),
    animatedWebp: getVideoAnimatedWebpUrl(effectiveVideoPublicId, effectiveVideoCloud, 5),
    poster: getVideoPosterUrl(effectiveVideoPublicId, effectiveVideoCloud, 0)
  };

  return (
    <div className="glass-panel" style={{ padding: 'clamp(1rem, 3vw, 1.75rem)', marginBottom: '1.5rem' }}>
      {/* SECTION HEADER & HONEST ACCOUNT STATUS */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
              Cloudinary Media Intelligence Studio
            </h2>

            {/* Account Status Badge */}
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
                border: `1px solid ${
                  status.accountReachable
                    ? 'rgba(140, 231, 189, 0.35)'
                    : status.configured
                      ? 'rgba(245, 158, 11, 0.45)'
                      : 'rgba(101, 229, 242, 0.35)'
                }`
              }}
            >
              {status.accountReachable
                ? 'Signed uploads ready'
                : status.configured
                  ? `Signed uploads blocked — account check failed (${status.accountError || 'cloud_name mismatch'})`
                  : 'Signed uploads off — public demo delivery is live'}
            </span>

            {/* URL Syntax Compliance Tag */}
            <span
              style={{
                fontSize: '0.68rem',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border-subtle)'
              }}
              title="Official Cloudinary slash-delimited syntax: /f_auto/q_auto"
            >
              Strict Slash Delimiters • /f_auto/q_auto • e_sharpen:80
            </span>
          </div>

          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: 1.5, maxWidth: '780px' }}>
            Deliver high-clarity textbook diagrams and educational video clips to learners on any bandwidth.
            All transformations are executed via Cloudinary’s CDN with automatic format negotiation (<code style={{ color: 'var(--accent-cyan)' }}>/f_auto/q_auto</code>).
            {status.accountError ? ` Signed uploads require matching account credentials (${status.accountError}). Verified public demo specimens remain fully live.` : ''}
          </p>
        </div>

        {/* Global Studio Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 0.9rem', fontSize: '0.8rem' }}
            onClick={handleReset}
            title="Reset to default specimen and clear modifications"
          >
            <RotateCcw size={14} />
            <span>Reset Studio</span>
          </button>
          <button
            type="button"
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 1.25rem' }}
            onClick={() => onSelectTopic(activePreset.topicId)}
          >
            <span>Open in Biology Studio</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* 3-TAB STUDIO NAVIGATION */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1.25rem', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          className={activeTab === 'images' ? 'btn-primary' : 'btn-secondary'}
          style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.5rem 1rem', fontSize: '0.82rem' }}
          onClick={() => {
            setActiveTab('images');
            if (onAnnounce) onAnnounce('Switched to Diagram & Image Intelligence mode');
          }}
        >
          <ImageIcon size={15} />
          <span>Diagram & Image Intelligence</span>
        </button>

        <button
          type="button"
          className={activeTab === 'ai' ? 'btn-primary' : 'btn-secondary'}
          style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.5rem 1rem', fontSize: '0.82rem' }}
          onClick={() => {
            setActiveTab('ai');
            if (onAnnounce) onAnnounce('Switched to Cloudinary AI Media Operations mode');
          }}
        >
          <Cpu size={15} />
          <span>Cloudinary AI Operations</span>
        </button>

        <button
          type="button"
          className={activeTab === 'video' ? 'btn-primary' : 'btn-secondary'}
          style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.5rem 1rem', fontSize: '0.82rem' }}
          onClick={() => {
            setActiveTab('video');
            if (onAnnounce) onAnnounce('Switched to Educational Video Studio mode');
          }}
        >
          <Video size={15} />
          <span>Educational Video Studio</span>
        </button>
      </div>

      {/* TAB 1: DIAGRAM & IMAGE INTELLIGENCE & TAB 2: AI OPERATIONS WORKSPACE */}
      {(activeTab === 'images' || activeTab === 'ai') && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>
          {/* LEFT COLUMN: Asset Dropzone, Curated Presets, and Controls */}
          <div>
            {/* Upload Dropzone */}
            <div
              className="upload-dropzone"
              tabIndex={0}
              role="button"
              aria-label="Upload textbook diagram or paper photograph for Cloudinary processing"
              style={{
                border: '2px dashed rgba(101, 229, 242, 0.45)',
                borderRadius: '12px',
                padding: '1.25rem',
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
              <UploadCloud size={30} color="var(--accent-cyan)" style={{ margin: '0 auto 0.4rem auto' }} />
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem', color: 'var(--text-primary)' }}>
                Drop textbook diagram, photo, or PDF scan
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                PNG, JPG, WebP, or PDF up to 15MB. Signed uploads activate when verified server credentials exist.
              </div>

              {isUploading && (
                <div style={{ marginTop: '0.85rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                    <RefreshCw size={13} className="spin" />
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
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.65rem 0.85rem', borderRadius: '8px', background: 'var(--state-error-bg)', border: '1px solid var(--state-error-border)', color: 'var(--state-error-text)', fontSize: '0.8rem', marginBottom: '1rem', lineHeight: 1.4, fontWeight: 600 }}>
                <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>{uploadError}</div>
              </div>
            )}

            {uploadSuccess && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.65rem 0.85rem', borderRadius: '8px', background: 'var(--state-success-bg)', border: '1px solid var(--state-success-border)', color: 'var(--state-success-text)', fontSize: '0.8rem', marginBottom: '1rem', lineHeight: 1.4, fontWeight: 600 }}>
                <FileCheck size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>{uploadSuccess}</div>
              </div>
            )}

            {/* Curated Syllabus Specimen Selector */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Active Specimen:
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {defaultImagePresets.length} Specimens Available
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {defaultImagePresets.map((preset) => (
                  <div
                    key={preset.id}
                    tabIndex={0}
                    role="button"
                    aria-label={`Select ${preset.title}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      background: activePreset.id === preset.id ? 'rgba(101, 229, 242, 0.14)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${activePreset.id === preset.id ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onClick={() => {
                      setActivePreset(preset);
                      setCommittedTransformedUrl(preset.cloudinaryOptimizedUrl);
                      setEditableAltText(preset.altText);
                      setProposedTransform(null);
                      setUploadError(null);
                      setUploadSuccess(null);
                      if (onAnnounce) onAnnounce(`Selected ${preset.title}`);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setActivePreset(preset);
                        setCommittedTransformedUrl(preset.cloudinaryOptimizedUrl);
                        setEditableAltText(preset.altText);
                        setProposedTransform(null);
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, background: '#080b12' }}>
                        <img src={preset.originalUrl} alt={preset.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{preset.title}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {preset.category} • {preset.dimensions}
                        </div>
                      </div>
                    </div>
                    {preset.isScientificDiagram && (
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          background: 'rgba(168, 85, 247, 0.15)',
                          color: '#c084fc',
                          border: '1px solid rgba(168, 85, 247, 0.3)'
                        }}
                      >
                        Scientific Asset
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* TAB-SPECIFIC ACTIONS */}
            {activeTab === 'images' ? (
              /* TAB 1 CONTROLS: Sharpen, Contrast, Bounded Crop, Low Data */
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Textbook Enhancement Pipeline:
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <button
                      type="button"
                      className={enableSharpen ? 'btn-primary' : 'btn-secondary'}
                      style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem' }}
                      onClick={() => setEnableSharpen(!enableSharpen)}
                      title="Cloudinary e_sharpen:80 filter for ink clarity"
                    >
                      e_sharpen:80 {enableSharpen ? 'ON' : 'OFF'}
                    </button>
                    <button
                      type="button"
                      className={enableContrast ? 'btn-primary' : 'btn-secondary'}
                      style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem' }}
                      onClick={() => setEnableContrast(!enableContrast)}
                      title="Cloudinary e_contrast filter for shadow removal"
                    >
                      e_contrast {enableContrast ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>

                {/* Bounded Diagram Crop Presets */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Crop size={12} color="var(--accent-cyan)" />
                    <span>Bounded Crop:</span>
                  </span>
                  <button
                    type="button"
                    className={activeCropMode === 'none' ? 'btn-primary' : 'btn-secondary'}
                    style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}
                    onClick={() => setActiveCropMode('none')}
                  >
                    Full Frame (c_limit)
                  </button>
                  <button
                    type="button"
                    className={activeCropMode === 'organelle_focus' ? 'btn-primary' : 'btn-secondary'}
                    style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}
                    onClick={() => setActiveCropMode('organelle_focus')}
                  >
                    Center Detail (c_crop)
                  </button>
                  <button
                    type="button"
                    className={activeCropMode === 'label_region' ? 'btn-primary' : 'btn-secondary'}
                    style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}
                    onClick={() => setActiveCropMode('label_region')}
                  >
                    Upper Labels (c_crop)
                  </button>
                </div>

                {/* Low-Data Toggle Button */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Low-Data Mode (480px / eco):</span>
                  <button
                    type="button"
                    className={lowDataToggle ? 'btn-primary' : 'btn-secondary'}
                    style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    onClick={() => setLowDataToggle(!lowDataToggle)}
                  >
                    <Zap size={12} />
                    <span>{lowDataToggle ? 'Active (~72% saved)' : 'Disabled'}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* TAB 2 CONTROLS: CLOUDINARY AI MEDIA OPERATIONS */
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.85rem', borderRadius: '10px', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Cpu size={15} color="#c084fc" />
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Cloudinary AI Operations
                    </span>
                  </div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--accent-violet)', background: 'rgba(124, 58, 237, 0.12)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                    Credit Transparent
                  </span>
                </div>

                {/* AI Action Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '0.75rem' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', padding: '0.45rem 0.65rem', textAlign: 'left' }}
                    onClick={() => handleRequestTransform('Apply AI auto enhance to this diagram')}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>AI Auto Enhance (e_auto_enhance)</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Balances dynamic range & color tone</div>
                    </div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>100 tx</span>
                  </button>

                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', padding: '0.45rem 0.65rem', textAlign: 'left' }}
                    onClick={() => handleRequestTransform('Crop to square focusing on the subject')}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Smart Subject Crop (g_auto:subject)</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Centers view on key diagram elements</div>
                    </div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--accent-mint)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>1 tx</span>
                  </button>

                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', padding: '0.45rem 0.65rem', textAlign: 'left' }}
                    onClick={() => handleRequestTransform('Remove background from this specimen')}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Background Removal (e_background_removal)</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Cuts out subject with transparent canvas</div>
                    </div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>75 tx</span>
                  </button>

                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', padding: '0.45rem 0.65rem', textAlign: 'left' }}
                    onClick={() => handleRequestTransform('Expand canvas with generative fill to 16:9')}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Generative Fill (b_gen_fill)</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Expands borders seamlessly to 16:9 ratio</div>
                    </div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>50 tx</span>
                  </button>
                </div>

                {/* EDUCATIONAL SAFEGUARD WARNING FOR SCIENTIFIC DIAGRAMS */}
                {activePreset.isScientificDiagram && (
                  <div style={{ background: 'var(--state-warning-bg)', border: '1px solid var(--state-warning-border)', borderRadius: '8px', padding: '0.7rem', marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', color: 'var(--state-warning-text)', fontSize: '0.76rem', lineHeight: 1.45 }}>
                      <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <strong>Educational Safeguard Notice:</strong> Generative operations (Fill, Remove, Replace) can alter factual anatomical or scientific structures in textbook diagrams (e.g. organelle membranes, valves, or base pairs). Review modifications carefully before applying.
                      </div>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '0.5rem', fontSize: '0.72rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={safeguardAccepted}
                        onChange={(e) => setSafeguardAccepted(e.target.checked)}
                      />
                      <span>I understand this generative edit may alter factual scientific structures.</span>
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Comparison Viewer, URL Spec & Two-Stage Preview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {/* Top Toolbar: Mode Toggle & Snap Positions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.82rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <SlidersHorizontal size={14} color="var(--accent-cyan)" />
                <span>
                  {proposedTransform ? 'Transformation Preview vs. Baseline' : 'Ingestion Delivery Inspector'}
                </span>
              </span>

              {/* Viewer Mode Toggles & Snap Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <button
                  type="button"
                  className={comparisonMode === 'slider' ? 'btn-primary' : 'btn-secondary'}
                  style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem' }}
                  onClick={() => setComparisonMode('slider')}
                >
                  Split Slider
                </button>
                <button
                  type="button"
                  className={comparisonMode === 'sideBySide' ? 'btn-primary' : 'btn-secondary'}
                  style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem' }}
                  onClick={() => setComparisonMode('sideBySide')}
                >
                  Side-by-Side
                </button>
                {comparisonMode === 'slider' && (
                  <>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ fontSize: '0.68rem', padding: '0.2rem 0.45rem' }}
                      onClick={() => setSliderPos(100)}
                      title="100% Original Scan"
                    >
                      100% Orig
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ fontSize: '0.68rem', padding: '0.2rem 0.45rem' }}
                      onClick={() => setSliderPos(50)}
                      title="50/50 Split"
                    >
                      50/50
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ fontSize: '0.68rem', padding: '0.2rem 0.45rem' }}
                      onClick={() => setSliderPos(0)}
                      title="100% Transformed"
                    >
                      100% Trans
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* DUAL LAYER SLIDER VIEW OR SIDE-BY-SIDE VIEW */}
            {comparisonMode === 'slider' ? (
              <div
                ref={sliderContainerRef}
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
                {/* Background Layer: Transformed Delivery */}
                <img
                  src={finalTransformedSrc}
                  alt={editableAltText || 'Transformed specimen visual'}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', position: 'absolute', top: 0, left: 0 }}
                />

                {/* Cloudinary Async Transformation Progress / Pending Overlay */}
                {(imgLoadStatus === 'loading' || imgLoadStatus === 'pending') && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'rgba(8, 11, 18, 0.92)',
                      border: '1px solid var(--border-subtle)',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      fontSize: '0.74rem',
                      color: imgLoadStatus === 'pending' ? '#fbbf24' : 'var(--accent-cyan)',
                      zIndex: 8,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                    }}
                  >
                    <RefreshCw size={12} className="spin" />
                    <span>
                      {imgLoadStatus === 'pending'
                        ? `Cloudinary processing transformation (attempt ${retryAttempt}/3)...`
                        : 'Loading transformed asset...'}
                    </span>
                  </div>
                )}

                {/* Transformed Badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: proposedTransform ? '#92400e' : '#065f46',
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
                  <span>{proposedTransform ? 'Proposed Preview' : 'Transformed Delivery'}</span>
                </div>

                {/* Clipped Layer: Original Scan */}
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
                    alt="Untransformed original scan"
                    style={{
                      width: sliderWidth ? `${sliderWidth}px` : '100%',
                      maxWidth: 'none',
                      height: '100%',
                      objectFit: 'contain'
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
                    Original Delivery
                  </div>
                </div>

                {/* Knob */}
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

                {/* Range Slider Accessible Input */}
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
                  aria-label="Comparison slider. Use Arrow Left and Right to inspect original scan vs transformed preview."
                />
              </div>
            ) : (
              /* SIDE-BY-SIDE VIEW */
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', height: '320px' }}>
                <div style={{ borderRadius: '10px', overflow: 'hidden', background: '#070b14', border: '1px solid var(--border-subtle)', position: 'relative' }}>
                  <img src={activePreset.originalUrl} alt="Original specimen" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(8, 11, 18, 0.88)', color: 'var(--text-secondary)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 600 }}>
                    Original Delivery
                  </div>
                </div>
                <div style={{ borderRadius: '10px', overflow: 'hidden', background: '#070b14', border: '1px solid var(--border-subtle)', position: 'relative' }}>
                  <img
                    src={finalTransformedSrc}
                    alt={editableAltText || 'Transformed specimen'}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                  <div style={{ position: 'absolute', top: '8px', right: '8px', background: proposedTransform ? 'rgba(245, 158, 11, 0.95)' : 'rgba(16, 185, 129, 0.92)', color: '#ffffff', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 600 }}>
                    {proposedTransform ? 'Proposed Preview' : 'Transformed Delivery'}
                  </div>
                  {(imgLoadStatus === 'loading' || imgLoadStatus === 'pending') && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '8px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(8, 11, 18, 0.92)',
                        border: '1px solid var(--border-subtle)',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.68rem',
                        color: imgLoadStatus === 'pending' ? '#fbbf24' : 'var(--accent-cyan)',
                        zIndex: 8
                      }}
                    >
                      <RefreshCw size={11} className="spin" />
                      <span>{imgLoadStatus === 'pending' ? `Processing (attempt ${retryAttempt}/3)...` : 'Loading...'}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Slider Caption & Active URL */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              <span>← Original ({sliderPos}%)</span>
              <span>Use Left/Right arrow keys or drag knob to inspect</span>
              <span>Transformed ({100 - sliderPos}%) →</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.74rem', lineHeight: 1.45, color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
              Delivery URL:{' '}
              <a href={displayedTransformedUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-cyan)' }}>
                {displayedTransformedUrl}
              </a>
            </p>

            {/* TWO-STAGE PREVIEW DRAWER (When a preview is active) */}
            {proposedTransform && (
              <div style={{ background: 'var(--state-warning-bg)', borderRadius: '10px', padding: '0.85rem', border: '1px solid var(--state-warning-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Sparkles size={15} color="var(--accent-amber)" />
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--state-warning-text)' }}>
                      Proposed Transformation Review
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {/* Credit Cost Badge */}
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--state-warning-text)', background: 'var(--state-warning-bg)', border: '1px solid var(--state-warning-border)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                      ⚡ {proposedTransform.creditCostEstimate || 1} tx credits
                    </span>
                    {/* Bandwidth Savings Badge */}
                    {proposedTransform.bandwidthSavingEstimatePct !== undefined && (
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-mint)', background: 'rgba(140, 231, 189, 0.15)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                        ~{proposedTransform.bandwidthSavingEstimatePct}% data saved (est.)
                      </span>
                    )}
                  </div>
                </div>

                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {proposedTransform.spec.explanation}
                </p>

                {/* Diff Tokens */}
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.65rem' }}>
                  {proposedTransform.appliedTransforms.map((tok) => (
                    <span
                      key={tok}
                      style={{
                        fontSize: '0.68rem',
                        fontFamily: 'var(--font-mono)',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        background: 'rgba(101, 229, 242, 0.12)',
                        color: 'var(--accent-cyan)'
                      }}
                    >
                      {tok}
                    </span>
                  ))}
                </div>

                {/* Editable Accessible Alt-Text */}
                <div style={{ marginBottom: '0.65rem' }}>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                    Accessible Alt-Text (Screen Reader Description):
                  </label>
                  <input
                    type="text"
                    value={editableAltText}
                    onChange={(e) => setEditableAltText(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.4rem 0.65rem',
                      borderRadius: '6px',
                      background: 'rgba(13, 18, 29, 0.85)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: '0.78rem'
                    }}
                  />
                </div>

                {/* Two-Stage Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      type="button"
                      className="btn-primary"
                      style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      onClick={handleApplyProposedTransform}
                    >
                      <CheckCircle2 size={13} />
                      <span>Apply Transformation</span>
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}
                      onClick={handleDiscardProposedTransform}
                    >
                      Discard / Return
                    </button>
                  </div>

                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ fontSize: '0.72rem', padding: '0.35rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    onClick={() => handleCopyUrl(proposedTransform.transformedUrl)}
                  >
                    {copiedUrl ? <Check size={12} color="var(--accent-mint)" /> : <Copy size={12} />}
                    <span>{copiedUrl ? 'Copied URL!' : 'Copy URL'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* NATURAL-LANGUAGE TRANSFORMATION BAR */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.85rem', borderRadius: '10px', border: '1px solid rgba(101, 229, 242, 0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.55rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Wand2 size={15} color="var(--accent-cyan)" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Natural-Language Transformation
                  </span>
                </div>
                <span style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'rgba(101, 229, 242, 0.12)', color: 'var(--accent-cyan)' }}>
                  Zod-Validated Spec
                </span>
              </div>

              {/* Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleRequestTransform(nlPrompt);
                }}
                style={{ display: 'flex', gap: '0.45rem', marginBottom: '0.55rem' }}
              >
                <input
                  type="text"
                  value={nlPrompt}
                  onChange={(e) => setNlPrompt(e.target.value)}
                  placeholder="e.g. Crop to a square, Make smaller for low-data, Sharpen labels, 16:9 lesson card..."
                  aria-label="Natural language transformation instruction"
                  style={{
                    flex: 1,
                    padding: '0.45rem 0.75rem',
                    borderRadius: '6px',
                    background: 'rgba(13, 18, 29, 0.85)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem'
                  }}
                />
                <button
                  type="submit"
                  disabled={isTransforming || !nlPrompt.trim()}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.85rem', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
                >
                  {isTransforming ? <RefreshCw size={13} className="spin" /> : <Sparkles size={13} />}
                  <span>Preview</span>
                </button>
              </form>

              {/* Quick Prompt Presets */}
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Presets:</span>
                {PRESET_PROMPTS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    className="btn-secondary"
                    style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}
                    onClick={() => {
                      setNlPrompt(item.prompt);
                      handleRequestTransform(item.prompt);
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EDUCATIONAL VIDEO STUDIO */}
      {activeTab === 'video' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>
          {/* Left Column: Video Workflows & Codec Delivery Options */}
          <div>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.5rem' }}>
                <Film size={16} color="var(--accent-cyan)" />
                <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Educational Video Workflows
                </h3>
              </div>
              <p style={{ margin: '0 0 0.85rem 0', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                Cloudinary delivers adaptive video streams with automatic codec negotiation (<code style={{ color: 'var(--accent-cyan)' }}>vc_auto</code>) and bandwidth optimization (<code style={{ color: 'var(--accent-cyan)' }}>f_auto:video/q_auto</code>).
              </p>

              {/* Workflow Presets */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  type="button"
                  className={videoVariant === 'stream' ? 'btn-primary' : 'btn-secondary'}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', padding: '0.5rem 0.75rem', textAlign: 'left' }}
                  onClick={() => setVideoVariant('stream')}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>Adaptive Video Stream (Full)</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>c_limit,h_720 / vc_auto / f_auto:video / q_auto</div>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent-mint)' }}>AVC / VP9</span>
                </button>

                <button
                  type="button"
                  className={videoVariant === 'clip5s' ? 'btn-primary' : 'btn-secondary'}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', padding: '0.5rem 0.75rem', textAlign: 'left' }}
                  onClick={() => setVideoVariant('clip5s')}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>5-Second Trimmed Concept Preview</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>so_0,du_5 / c_limit,h_720 / vc_auto / f_auto:video</div>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent-mint)' }}>du_5</span>
                </button>

                <button
                  type="button"
                  className={videoVariant === 'silentLoop' ? 'btn-primary' : 'btn-secondary'}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', padding: '0.5rem 0.75rem', textAlign: 'left' }}
                  onClick={() => setVideoVariant('silentLoop')}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>Silent Autoplay Loop (Classroom Safe)</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>ac_none / c_limit,h_720 / vc_auto / f_auto:video / q_auto</div>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)' }}>ac_none</span>
                </button>

                <button
                  type="button"
                  className={videoVariant === 'animatedWebp' ? 'btn-primary' : 'btn-secondary'}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', padding: '0.5rem 0.75rem', textAlign: 'left' }}
                  onClick={() => setVideoVariant('animatedWebp')}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>Lightweight Animated WebP Clip</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>du_5 / e_loop / f_auto:animated / q_auto (~74 KB)</div>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#c084fc' }}>WebP Loop</span>
                </button>

                <button
                  type="button"
                  className={videoVariant === 'poster' ? 'btn-primary' : 'btn-secondary'}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', padding: '0.5rem 0.75rem', textAlign: 'left' }}
                  onClick={() => setVideoVariant('poster')}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>Poster Frame Thumbnail Still</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>so_0 / f_jpg / q_auto (~50 KB)</div>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent-mint)' }}>First Frame</span>
                </button>
              </div>
            </div>

            {/* Educational Constraints & Video Limit Notice */}
            <div style={{ background: 'rgba(101, 229, 242, 0.06)', border: '1px solid rgba(101, 229, 242, 0.25)', borderRadius: '8px', padding: '0.75rem', fontSize: '0.76rem', lineHeight: 1.45, color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-cyan)', fontWeight: 600, marginBottom: '0.2rem' }}>
                <Info size={14} />
                <span>Video Support & Bandwidth Guidelines:</span>
              </div>
              Educational video uploads support standard MP4 and WebM formats up to <strong>30MB</strong>. For low-bandwidth cellular environments, animated WebP clips (<code style={{ color: 'var(--accent-cyan)' }}>f_auto:animated</code>) deliver smooth visual motion using under 100 KB compared to full multi-megabyte video streams.
            </div>
          </div>

          {/* Right Column: Video Playback & Asset Delivery URL */}
          <div>
            <div style={{ borderRadius: '12px', overflow: 'hidden', background: '#070b14', border: '1px solid var(--border-subtle)', boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)', minHeight: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              {videoVariant === 'animatedWebp' ? (
                /* Animated WebP Image Delivery */
                <img
                  src={currentVideoUrls.animatedWebp}
                  alt="Animated WebP loop preview generated from educational video"
                  style={{ width: '100%', height: '100%', maxHeight: '320px', objectFit: 'contain' }}
                />
              ) : videoVariant === 'poster' ? (
                /* Still Poster Image Frame */
                <img
                  src={currentVideoUrls.poster}
                  alt="Poster still frame extracted from educational video"
                  style={{ width: '100%', height: '100%', maxHeight: '320px', objectFit: 'contain' }}
                />
              ) : (
                /* Native Responsive Video Player */
                <video
                  key={videoVariant}
                  controls
                  playsInline
                  autoPlay={videoVariant === 'silentLoop'}
                  muted={videoVariant === 'silentLoop'}
                  loop={videoVariant === 'silentLoop'}
                  poster={currentVideoUrls.poster}
                  src={currentVideoUrls[videoVariant]}
                  style={{ width: '100%', height: '100%', maxHeight: '320px', objectFit: 'contain' }}
                  onError={() => {
                    console.warn(`[CloudinaryMediaStudio] Video delivery error for variant: ${videoVariant}`);
                  }}
                >
                  <p>Your browser does not support HTML5 video streaming.</p>
                </video>
              )}

              {/* Overlay Badge */}
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(8, 11, 18, 0.88)',
                  color: 'var(--accent-cyan)',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  border: '1px solid var(--border-subtle)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <Video size={12} />
                <span>
                  {videoVariant === 'stream' && 'Adaptive Stream (H.264 / VP9)'}
                  {videoVariant === 'clip5s' && '5s Preview (du_5)'}
                  {videoVariant === 'silentLoop' && 'Silent Autoplay (ac_none)'}
                  {videoVariant === 'animatedWebp' && 'Animated WebP (f_auto:animated)'}
                  {videoVariant === 'poster' && 'Poster Frame (so_0/f_jpg)'}
                </span>
              </div>
            </div>

            {/* Video Delivery URL and Copy Action */}
            <div style={{ marginTop: '0.75rem', background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Cloudinary Video Delivery URL ({effectiveVideoCloud === DEMO_CLOUD ? 'Demo Fallback' : 'Project account'}):
                </span>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ fontSize: '0.68rem', padding: '0.2rem 0.55rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                  onClick={() => handleCopyUrl(currentVideoUrls[videoVariant])}
                >
                  {copiedUrl ? <Check size={11} color="var(--accent-mint)" /> : <Copy size={11} />}
                  <span>{copiedUrl ? 'Copied!' : 'Copy Video URL'}</span>
                </button>
              </div>
              <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--accent-cyan)', wordBreak: 'break-all', fontFamily: 'var(--font-mono)' }}>
                {currentVideoUrls[videoVariant]}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER STEM ACCESSIBILITY RATIONALE */}
      <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '0.65rem', alignItems: 'flex-start', fontSize: '0.78rem', lineHeight: 1.45, color: 'var(--text-secondary)' }}>
        <Info size={16} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ color: 'var(--accent-cyan)' }}>Why Cloudinary Media Ingestion is Essential for Equitable STEM Education:</strong>{' '}
          Smartphone textbook photos suffer from uneven page curvature, ink bleed, and heavy 3–8MB file payloads that drain student cellular data. ConceptLens leverages Cloudinary's dynamic CDN transformations to sharpen membrane boundaries (<code style={{ color: 'var(--accent-cyan)' }}>e_sharpen:80</code>), flatten shadows (<code style={{ color: 'var(--accent-cyan)' }}>e_contrast</code>), and deliver lightweight modern WebP/AVIF formats (<code style={{ color: 'var(--accent-cyan)' }}>/f_auto/q_auto</code>) so learners in low-connectivity areas can explore scientific structures with zero lag.
        </div>
      </div>
    </div>
  );
};

export default CloudinaryMediaStudio;
