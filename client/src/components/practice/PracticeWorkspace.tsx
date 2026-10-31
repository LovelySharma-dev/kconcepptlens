import React, { useState, useEffect, useRef, useCallback } from 'react';
import type {
  GeneratedLesson,
  LearningPreferences
} from '@conceptlens/shared';
import {
  GeneratedLessonSchema
} from '@conceptlens/shared';
import { SpeechControls } from '../SpeechControls';
import {
  Award,
  Upload,
  Camera,
  Mic,
  MicOff,
  Type,
  FileText,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ListOrdered,
  Lightbulb,
  Edit3,
  Trash2
} from 'lucide-react';

export type PracticeInputTab = 'text' | 'file' | 'camera' | 'speech';

export type PracticeAction =
  | 'understand'
  | 'simplify'
  | 'terms'
  | 'notes'
  | 'flashcards'
  | 'quiz'
  | 'audio';

interface PracticeWorkspaceProps {
  preferences: LearningPreferences;
  onPreferences: (next: LearningPreferences) => void;
  onAnnounce: (msg: string) => void;
}

const STORAGE_PRACTICE_KEY = 'conceptlens-practice-workspace';

export const PracticeWorkspace: React.FC<PracticeWorkspaceProps> = ({
  preferences,
  onPreferences,
  onAnnounce
}) => {
  // Input Method State
  const [activeTab, setActiveTab] = useState<PracticeInputTab>('text');

  // Input Data States
  const [textInput, setTextInput] = useState('');
  const [confirmedText, setConfirmedText] = useState('');

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileProgress, setFileProgress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Camera State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraPermissionError, setCameraPermissionError] = useState<string | null>(null);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Speech Recognition (STT) State
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  // Extraction & Processing State
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionNote, setExtractionNote] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generated Practice Lesson State
  const [practiceLesson, setPracticeLesson] = useState<GeneratedLesson | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PRACTICE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.lesson) return parsed.lesson;
      }
    } catch {
      /* ignore */
    }
    return null;
  });

  const [activePracticeMode, setActivePracticeMode] = useState<PracticeAction>('understand');
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, { selectedIndex: number; submitted: boolean; isCorrect: boolean }>>({});
  const [sourceDrawerOpen, setSourceDrawerOpen] = useState(false);

  // Feedback Request State
  const [hintMessage, setHintMessage] = useState<string | null>(null);

  // Save practice state to localStorage
  useEffect(() => {
    if (!practiceLesson) return;
    try {
      localStorage.setItem(
        STORAGE_PRACTICE_KEY,
        JSON.stringify({
          lesson: practiceLesson,
          confirmedText,
          activePracticeMode,
          currentStepIdx,
          flashcardIdx,
          quizAnswers
        })
      );
    } catch {
      /* ignore */
    }
  }, [practiceLesson, confirmedText, activePracticeMode, currentStepIdx, flashcardIdx, quizAnswers]);

  // Clean up Camera MediaStream when closing camera or unmounting
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          /* ignore */
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCameraStream();
      if (capturedPhotoUrl) {
        URL.revokeObjectURL(capturedPhotoUrl);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          /* ignore */
        }
      }
    };
  }, [stopCameraStream, capturedPhotoUrl]);

  // Check SpeechRecognition support on mount
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  // 1. CAMERA LOGIC
  const startCamera = async () => {
    setCameraPermissionError(null);
    setCapturedPhotoUrl(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraPermissionError('Camera API is not supported in this browser. Please upload an image or paste notes.');
      onAnnounce('Camera is not supported in this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false
      });

      streamRef.current = stream;
      setIsCameraActive(true);
      onAnnounce('Camera active. Viewfinder opened.');

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: unknown) {
      const isDenied = err instanceof Error && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError');
      const msg = isDenied
        ? 'Camera permission was denied. You can grant access in browser settings or upload a photo file instead.'
        : 'Could not connect to camera device. Please check connection or upload a photo file.';
      setCameraPermissionError(msg);
      onAnnounce(msg);
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    setCapturedPhotoUrl(dataUrl);

    // Stop live stream after capture
    stopCameraStream();
    onAnnounce('Photo captured. You can confirm extraction or retake.');
  };

  const confirmAndExtractPhoto = async () => {
    if (!capturedPhotoUrl) return;
    setIsExtracting(true);
    setExtractionNote('Extracting text via local OCR engine...');
    onAnnounce('Extracting text from photo...');

    try {
      const res = await fetch('/api/materials/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'file',
          fileBase64: capturedPhotoUrl,
          declaredMime: 'image/jpeg'
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success || !json.data) {
        throw new Error(json.error || 'Failed to extract text from image.');
      }

      const extracted = json.data.text || '';
      if (!extracted.trim()) {
        throw new Error('No legible text was found in the image. Please retake photo with better lighting or enter text manually.');
      }

      setConfirmedText(extracted);
      setExtractionNote(`Extracted ${extracted.length} characters (OCR confidence: ${json.data.ocrConfidence ? Math.round(json.data.ocrConfidence * 100) + '%' : 'good'}). You can edit below before creating your workspace.`);
      onAnnounce('Text extracted from photo. Review and edit text before generating lesson.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Photo OCR failed.';
      setExtractionNote(msg);
      onAnnounce(`OCR notice: ${msg}`);
    } finally {
      setIsExtracting(false);
    }
  };

  // 2. FILE UPLOAD LOGIC
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      setError('File exceeds 20MB limit. Please choose a smaller file.');
      return;
    }

    setSelectedFile(file);
    setIsExtracting(true);
    setFileProgress(`Reading ${file.name} (${Math.round(file.size / 1024)} KB)...`);
    onAnnounce(`Uploading and extracting text from ${file.name}...`);

    try {
      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const fileBase64 = await base64Promise;

      const res = await fetch('/api/materials/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'file',
          fileBase64,
          declaredMime: file.type || 'application/octet-stream'
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success || !json.data) {
        throw new Error(json.error || 'File extraction failed.');
      }

      const extracted = json.data.text || '';
      setConfirmedText(extracted);
      setFileProgress(`Extracted ${extracted.length} characters successfully from ${file.name}.`);
      onAnnounce(`Extracted text from ${file.name}. Review and edit below before generating lesson.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Extraction error';
      setFileProgress(`Extraction notice: ${msg}`);
      onAnnounce(`Extraction notice: ${msg}`);
    } finally {
      setIsExtracting(false);
    }
  };

  // 3. SPEECH-TO-TEXT LOGIC
  const toggleSpeechRecognition = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      onAnnounce('Speech recording stopped.');
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        onAnnounce('Listening... speak your notes or question clearly.');
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setConfirmedText((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.onerror = (e: any) => {
        setIsListening(false);
        onAnnounce(`Speech recognition error: ${e.error || 'unspecified'}`);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setIsListening(false);
      onAnnounce('Could not start speech recognition.');
    }
  };

  // 4. GENERATE LESSON FROM CONFIRMED MATERIAL
  const handleGenerateWorkspace = async () => {
    const content = confirmedText.trim() || textInput.trim();
    if (!content || content.length < 10) {
      setError('Please provide at least 10 characters of educational material to process.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    onAnnounce('Transforming your material into an accessible learning workspace...');

    try {
      const res = await fetch('/api/ai/lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: content,
          difficulty: 'intermediate'
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success || !json.data) {
        throw new Error(json.error || 'Failed to generate practice workspace.');
      }

      const validated = GeneratedLessonSchema.parse(json.data);
      setPracticeLesson(validated);
      setActivePracticeMode('understand');
      setCurrentStepIdx(0);
      setFlashcardIdx(0);
      setIsFlipped(false);
      setQuizAnswers({});
      setHintMessage(null);

      onAnnounce(`Practice workspace ready for "${validated.topic}". Select any practice mode below.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Workspace generation failed.';
      setError(msg);
      onAnnounce(`Error: ${msg}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Curated Samples for instant testing
  const loadSample = (type: 'math' | 'biology' | 'cs' | 'biz') => {
    const samples = {
      math: 'Quadratic Equation Formula and Derivation:\nFor any quadratic equation ax^2 + bx + c = 0 where a is not 0, the solutions are given by the quadratic formula: x = (-b ± √(b^2 - 4ac)) / (2a). The discriminant Δ = b^2 - 4ac reveals whether roots are two distinct real numbers (Δ > 0), one repeated real root (Δ = 0), or two complex conjugate roots (Δ < 0).',
      biology: 'Cellular Respiration and ATP Synthesis:\nCellular respiration converts glucose and oxygen into carbon dioxide, water, and ATP energy through three metabolic stages: glycolysis in the cytoplasm, the Krebs cycle (citric acid cycle) in the mitochondrial matrix, and oxidative phosphorylation along the mitochondrial inner membrane via the electron transport chain and ATP synthase.',
      cs: 'Recursion in Computer Science:\nRecursion is a programming problem-solving technique where a function solves a problem by calling a smaller instance of itself. Every valid recursive algorithm requires two components: 1) One or more base cases that terminate recursion without making further calls, and 2) A recursive step that reduces the problem size toward the base case.',
      biz: 'The Corporate Balance Sheet Equation:\nA balance sheet is a financial statement that provides a snapshot of a company’s financial position at a single point in time. It satisfies the fundamental accounting identity: Assets = Liabilities + Shareholders\' Equity. Current assets include cash, inventory, and accounts receivable.'
    };

    setTextInput(samples[type]);
    setConfirmedText(samples[type]);
    onAnnounce(`Loaded ${type} sample notes into editor.`);
  };

  const OPTION_MARKERS = [
    { symbol: '⭕', label: 'Circle' },
    { symbol: '🟩', label: 'Square' },
    { symbol: '🔺', label: 'Triangle' },
    { symbol: '🔷', label: 'Diamond' }
  ];

  return (
    <div className="practice-workspace-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. UNIFIED INPUT PIPELINE PANEL */}
      <section className="glass-panel" aria-labelledby="practice-heading" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div>
            <h2 id="practice-heading" style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={24} color="var(--accent-amber)" aria-hidden="true" />
              <span>Practice with Your Own Material</span>
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
              Paste class notes, upload documents, capture photos with your camera, or speak your thoughts.
            </p>
          </div>

          {/* Quick Sample Presets */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Try Sample:</span>
            <button type="button" className="tag-btn" onClick={() => loadSample('math')}>Math Formula</button>
            <button type="button" className="tag-btn" onClick={() => loadSample('biology')}>Biology Notes</button>
            <button type="button" className="tag-btn" onClick={() => loadSample('cs')}>Python Code</button>
            <button type="button" className="tag-btn" onClick={() => loadSample('biz')}>Finance Sheet</button>
          </div>
        </div>

        {/* Input Method Switcher Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '0.75rem',
            marginBottom: '1rem',
            flexWrap: 'wrap'
          }}
          role="tablist"
          aria-label="Practice Material Input Methods"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'text'}
            className={`tab-btn ${activeTab === 'text' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('text');
              stopCameraStream();
            }}
          >
            <Type size={16} />
            <span>1. Paste or Type</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'file'}
            className={`tab-btn ${activeTab === 'file' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('file');
              stopCameraStream();
            }}
          >
            <Upload size={16} />
            <span>2. Upload File (PDF / Images)</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'camera'}
            className={`tab-btn ${activeTab === 'camera' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('camera');
            }}
          >
            <Camera size={16} />
            <span>3. Camera Capture & OCR</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'speech'}
            className={`tab-btn ${activeTab === 'speech' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('speech');
              stopCameraStream();
            }}
          >
            <Mic size={16} />
            <span>4. Speak Notes</span>
          </button>
        </div>

        {/* METHOD 1: PASTE OR TYPE */}
        {activeTab === 'text' && (
          <div>
            <textarea
              value={textInput}
              onChange={(e) => {
                setTextInput(e.target.value);
                setConfirmedText(e.target.value);
              }}
              placeholder="Paste textbook passages, study notes, lecture transcripts, historical excerpts, or exam questions..."
              rows={6}
              aria-label="Paste study notes or text here"
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <span>{textInput.length} characters • {textInput.trim() ? textInput.trim().split(/\s+/).length : 0} words</span>
              <span>Min. 10 characters required</span>
            </div>
          </div>
        )}

        {/* METHOD 2: UPLOAD A FILE */}
        {activeTab === 'file' && (
          <div style={{ padding: '1.5rem', border: '2px dashed var(--border-medium)', borderRadius: 'var(--radius-md)', textAlign: 'center', background: 'var(--bg-surface)' }}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.txt,.png,.jpg,.jpeg,.webp"
              style={{ display: 'none' }}
              aria-label="Upload document or image file"
            />
            <Upload size={32} color="var(--accent-cyan)" style={{ margin: '0 auto 0.75rem' }} />
            <h4 style={{ margin: '0 0 0.25rem', fontSize: '1.05rem', fontWeight: 600 }}>
              {selectedFile ? selectedFile.name : 'Choose a file to extract'}
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 1rem' }}>
              Supports PDF documents, plain text (.txt), and study diagrams/notes (.png, .jpg, .webp up to 20MB).
            </p>

            <button
              type="button"
              className="btn-primary"
              disabled={isExtracting}
              onClick={() => fileInputRef.current?.click()}
            >
              {isExtracting ? (
                <>
                  <RefreshCw size={16} className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Extracting...</span>
                </>
              ) : (
                'Browse Files'
              )}
            </button>

            {fileProgress && (
              <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>
                {fileProgress}
              </p>
            )}
          </div>
        )}

        {/* METHOD 3: CAMERA CAPTURE */}
        {activeTab === 'camera' && (
          <div style={{ padding: '1rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
            {!isCameraActive && !capturedPhotoUrl && (
              <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
                <Camera size={36} color="var(--accent-cyan)" style={{ margin: '0 auto 0.75rem' }} />
                <h4 style={{ margin: '0 0 0.4rem', fontSize: '1.1rem', fontWeight: 700 }}>
                  Photograph Notes or Diagram
                </h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 1.25rem', lineHeight: 1.5 }}>
                  ConceptLens uses your camera to take a photo of printed worksheets, textbook diagrams, or handwritten notes for local OCR reading.
                  Camera tracks are stopped immediately once captured or closed.
                </p>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={startCamera}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
                >
                  <Camera size={16} />
                  <span>Start Camera</span>
                </button>
              </div>
            )}

            {/* Live Camera Viewfinder */}
            {isCameraActive && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ position: 'relative', maxWidth: '640px', margin: '0 auto', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#000' }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                  <div style={{ position: 'absolute', bottom: '1rem', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={capturePhoto}
                      style={{ padding: '0.6rem 1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'var(--accent-cyan)', color: '#000', fontWeight: 700 }}
                    >
                      <Camera size={18} />
                      <span>Capture Photo</span>
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={stopCameraStream}
                      style={{ padding: '0.6rem 1rem', background: 'rgba(0, 0, 0, 0.7)', color: '#fff' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Captured Photo Review & OCR confirmation */}
            {capturedPhotoUrl && (
              <div style={{ textAlign: 'center' }}>
                <h4 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 600 }}>Review Captured Photo</h4>
                <div style={{ maxWidth: '400px', margin: '0 auto 1rem', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-medium)' }}>
                  <img src={capturedPhotoUrl} alt="Captured worksheet or notes preview" style={{ width: '100%', display: 'block' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn-primary"
                    disabled={isExtracting}
                    onClick={confirmAndExtractPhoto}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
                  >
                    {isExtracting ? (
                      <>
                        <RefreshCw size={16} className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} />
                        <span>Running OCR...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        <span>Confirm & Extract Text</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={isExtracting}
                    onClick={() => {
                      setCapturedPhotoUrl(null);
                      startCamera();
                    }}
                  >
                    Retake Photo
                  </button>
                </div>
              </div>
            )}

            {cameraPermissionError && (
              <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(244, 63, 94, 0.12)', border: '1px solid var(--accent-coral)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-coral)', fontSize: '0.85rem' }}>
                {cameraPermissionError}
              </div>
            )}

            {extractionNote && (
              <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--accent-cyan)', textAlign: 'center' }}>
                {extractionNote}
              </p>
            )}
          </div>
        )}

        {/* METHOD 4: SPEECH-TO-TEXT */}
        {activeTab === 'speech' && (
          <div style={{ padding: '1.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            {!speechSupported ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Speech recognition is supported in Google Chrome, Microsoft Edge, and Safari. You can use the text editor or file upload in any browser.
              </div>
            ) : (
              <div>
                <div style={{ display: 'inline-flex', padding: '0.75rem', borderRadius: '50%', background: isListening ? 'rgba(244, 63, 94, 0.2)' : 'rgba(56, 189, 248, 0.12)', color: isListening ? 'var(--accent-coral)' : 'var(--accent-cyan)', marginBottom: '0.75rem' }}>
                  {isListening ? <Mic size={32} /> : <MicOff size={32} />}
                </div>
                <h4 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem', fontWeight: 700 }}>
                  {isListening ? 'Listening to your voice...' : 'Speech-to-Text Input'}
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 1.25rem' }}>
                  Click to speak your thoughts, notes, or assignment questions. Dictated text will appear in the review box below for your edits.
                </p>

                <button
                  type="button"
                  className={isListening ? 'btn-secondary' : 'btn-primary'}
                  onClick={toggleSpeechRecognition}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', borderColor: isListening ? 'var(--accent-coral)' : undefined, color: isListening ? 'var(--accent-coral)' : undefined }}
                >
                  {isListening ? (
                    <>
                      <MicOff size={16} />
                      <span>Stop Listening</span>
                    </>
                  ) : (
                    <>
                      <Mic size={16} />
                      <span>Start Listening</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* COMMON PROCESSING CONTRACT: REVIEW & EDIT EXTRACTED TEXT */}
        {(confirmedText || activeTab !== 'text') && (
          <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Edit3 size={16} color="var(--accent-cyan)" />
                <strong style={{ fontSize: '0.95rem' }}>Confirmed Text Review & Correction</strong>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Correct any spelling, math, or extraction inaccuracies before generating workspace
              </span>
            </div>

            <textarea
              value={confirmedText}
              onChange={(e) => setConfirmedText(e.target.value)}
              placeholder="Confirmed text to be analyzed..."
              rows={4}
              aria-label="Review and edit confirmed text"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-medium)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '0.92rem',
                lineHeight: 1.5,
                fontFamily: 'inherit'
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setConfirmedText('');
                  setTextInput('');
                  setSelectedFile(null);
                  setCapturedPhotoUrl(null);
                }}
                style={{ fontSize: '0.82rem' }}
              >
                <Trash2 size={14} style={{ marginRight: '0.3rem' }} /> Clear
              </button>

              <button
                type="button"
                className="btn-primary"
                disabled={isGenerating || !confirmedText.trim() || confirmedText.trim().length < 10}
                onClick={handleGenerateWorkspace}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', minWidth: '180px', justifyContent: 'center' }}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={16} className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Transform into Workspace</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ERROR BANNER */}
      {error && (
        <div className="glass-panel" style={{ padding: '1rem', borderColor: 'var(--accent-coral)', display: 'flex', alignItems: 'center', gap: '0.75rem' }} role="alert">
          <AlertTriangle size={20} color="var(--accent-coral)" />
          <div style={{ flex: 1 }}>
            <strong style={{ fontSize: '0.9rem', color: 'var(--accent-coral)' }}>Practice Workspace Notice</strong>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{error}</p>
          </div>
        </div>
      )}

      {/* 2. GENERATED PRACTICE WORKSPACE */}
      {practiceLesson && (
        <article className="glass-panel" style={{ padding: '1.75rem' }} aria-labelledby="practice-workspace-heading">
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <h3 id="practice-workspace-heading" style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800 }}>
                  {practiceLesson.topic}
                </h3>
                <span className="status-pill" style={{ fontSize: '0.75rem', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)', fontWeight: 600 }}>
                  Practice Workspace Ready
                </span>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.35rem', maxWidth: '750px' }}>
                {practiceLesson.summary}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setSourceDrawerOpen((o) => !o)}
                style={{ fontSize: '0.8rem' }}
                aria-expanded={sourceDrawerOpen}
              >
                <FileText size={14} style={{ marginRight: '0.3rem' }} />
                {sourceDrawerOpen ? 'Hide Original Notes' : 'View Original Notes'}
              </button>

              {!preferences.speechFree && (
                <SpeechControls
                  text={`${practiceLesson.topic}. ${practiceLesson.summary}. ${practiceLesson.explanations.standard}`}
                  rate={preferences.speechRate}
                  label={`Listen to ${practiceLesson.topic}`}
                  onRateChange={(rate) => onPreferences({ ...preferences, speechRate: rate })}
                />
              )}
            </div>
          </div>

          {/* Collapsible Original Source Drawer */}
          {sourceDrawerOpen && (
            <div style={{ padding: '1rem', background: 'var(--bg-primary)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
              <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Your Original Input Notes:</strong>
              <pre style={{ margin: '0.5rem 0 0', whiteSpace: 'pre-wrap', fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                {confirmedText || textInput}
              </pre>
            </div>
          )}

          {/* Interactive Feedback Actions Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              flexWrap: 'wrap',
              background: 'var(--bg-surface)',
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1rem',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: '0.2rem' }}>Adapt:</span>
            <button
              type="button"
              className="tag-btn"
              onClick={() => {
                setActivePracticeMode('simplify');
                onAnnounce('Switched to simplified plain-language explanation.');
              }}
            >
              Simpler explanation
            </button>
            <button
              type="button"
              className="tag-btn"
              onClick={() => {
                setActivePracticeMode('understand');
                onAnnounce('Switched to comprehensive standard explanation.');
              }}
            >
              Detailed explanation
            </button>
            <button
              type="button"
              className="tag-btn"
              onClick={() => {
                setActivePracticeMode('flashcards');
                onAnnounce('Opened interactive flashcards.');
              }}
            >
              Flashcards
            </button>
            <button
              type="button"
              className="tag-btn"
              onClick={() => {
                setActivePracticeMode('quiz');
                onAnnounce('Opened practice quiz.');
              }}
            >
              Practice question
            </button>
            <button
              type="button"
              className="tag-btn"
              onClick={() => {
                setHintMessage(`Key concept tip: ${practiceLesson.studyNotes[0] || practiceLesson.summary}`);
                onAnnounce(`Hint: ${practiceLesson.studyNotes[0] || practiceLesson.summary}`);
              }}
            >
              Give me a hint
            </button>
          </div>

          {/* Hint notification if requested */}
          {hintMessage && (
            <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(245, 158, 11, 0.1)', borderLeft: '3px solid var(--accent-amber)', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0', fontSize: '0.85rem' }}>
              <strong style={{ color: 'var(--accent-amber)' }}>Hint: </strong>
              <span>{hintMessage}</span>
            </div>
          )}

          {/* Practice Mode Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '0.35rem',
              flexWrap: 'wrap',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '0.75rem',
              marginBottom: '1.25rem'
            }}
            role="tablist"
            aria-label="Practice Workspace Modes"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activePracticeMode === 'understand'}
              className={`tab-btn ${activePracticeMode === 'understand' ? 'active' : ''}`}
              onClick={() => setActivePracticeMode('understand')}
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.75rem' }}
            >
              <BookOpen size={15} />
              <span>Understand This</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activePracticeMode === 'simplify'}
              className={`tab-btn ${activePracticeMode === 'simplify' ? 'active' : ''}`}
              onClick={() => setActivePracticeMode('simplify')}
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.75rem' }}
            >
              <Lightbulb size={15} />
              <span>Simplify (Easy Read)</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activePracticeMode === 'terms'}
              className={`tab-btn ${activePracticeMode === 'terms' ? 'active' : ''}`}
              onClick={() => setActivePracticeMode('terms')}
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.75rem' }}
            >
              <FileText size={15} />
              <span>Key Terms ({practiceLesson.keyTerms.length})</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activePracticeMode === 'flashcards'}
              className={`tab-btn ${activePracticeMode === 'flashcards' ? 'active' : ''}`}
              onClick={() => setActivePracticeMode('flashcards')}
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.75rem' }}
            >
              <Sparkles size={15} />
              <span>Flashcards ({practiceLesson.flashcards.length})</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activePracticeMode === 'quiz'}
              className={`tab-btn ${activePracticeMode === 'quiz' ? 'active' : ''}`}
              onClick={() => setActivePracticeMode('quiz')}
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.75rem' }}
            >
              <Award size={15} />
              <span>Practice Questions ({practiceLesson.practiceQuestions.length})</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activePracticeMode === 'notes'}
              className={`tab-btn ${activePracticeMode === 'notes' ? 'active' : ''}`}
              onClick={() => setActivePracticeMode('notes')}
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.75rem' }}
            >
              <ListOrdered size={15} />
              <span>Revision Notes</span>
            </button>
          </div>

          {/* MODE 1: UNDERSTAND THIS */}
          {activePracticeMode === 'understand' && (
            <div className="practice-mode-content" tabIndex={0} aria-label="Comprehensive Explanation">
              <div style={{ lineHeight: preferences.lineSpacing === 'relaxed' ? 1.95 : 1.7, fontSize: '0.98rem' }}>
                {practiceLesson.explanations.standard.split('\n\n').map((para, i) => (
                  <p key={i} style={{ marginBottom: '1rem' }}>{para}</p>
                ))}
              </div>
            </div>
          )}

          {/* MODE 2: SIMPLIFY THIS */}
          {activePracticeMode === 'simplify' && (
            <div className="practice-mode-content" tabIndex={0} aria-label="Plain Language Simplification">
              <div style={{ padding: '1.25rem', background: 'rgba(56, 189, 248, 0.08)', borderRadius: 'var(--radius-md)' }}>
                <strong style={{ fontSize: '0.9rem', color: 'var(--accent-cyan)' }}>Plain-Language Version:</strong>
                <p style={{ margin: '0.5rem 0 0', fontSize: '1.02rem', lineHeight: 1.8 }}>
                  {practiceLesson.explanations.easyRead}
                </p>
              </div>
            </div>
          )}

          {/* MODE 3: KEY TERMS */}
          {activePracticeMode === 'terms' && (
            <div className="practice-mode-content">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
                {practiceLesson.keyTerms.map((kt, i) => (
                  <div key={i} style={{ padding: '0.85rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                    <strong style={{ color: 'var(--accent-cyan)', fontSize: '0.95rem' }}>{kt.term}</strong>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{kt.definition}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODE 4: FLASHCARDS */}
          {activePracticeMode === 'flashcards' && (
            <div className="practice-mode-content">
              {practiceLesson.flashcards.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No flashcards created.</p>
              ) : (
                <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <span>Card {flashcardIdx + 1} of {practiceLesson.flashcards.length}</span>
                    <span>Click card to flip</span>
                  </div>

                  <div
                    onClick={() => setIsFlipped((f) => !f)}
                    style={{
                      minHeight: '200px',
                      padding: '2rem 1.5rem',
                      background: 'var(--bg-surface)',
                      border: '2px solid var(--border-medium)',
                      borderRadius: 'var(--radius-lg)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Flashcard ${flashcardIdx + 1}. Click to flip.`}
                  >
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
                      {isFlipped ? 'Answer' : 'Question'}
                    </span>
                    <p style={{ fontSize: '1.15rem', fontWeight: isFlipped ? 500 : 700, margin: 0, lineHeight: 1.5 }}>
                      {isFlipped ? practiceLesson.flashcards[flashcardIdx]?.back : practiceLesson.flashcards[flashcardIdx]?.front}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1rem' }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      disabled={flashcardIdx === 0}
                      onClick={() => {
                        setFlashcardIdx((i) => Math.max(0, i - 1));
                        setIsFlipped(false);
                      }}
                    >
                      <ChevronLeft size={16} /> Previous
                    </button>
                    <button type="button" className="btn-secondary" onClick={() => setIsFlipped((f) => !f)}>
                      Flip
                    </button>
                    <button
                      type="button"
                      className="btn-primary"
                      disabled={flashcardIdx >= practiceLesson.flashcards.length - 1}
                      onClick={() => {
                        setFlashcardIdx((i) => Math.min(practiceLesson.flashcards.length - 1, i + 1));
                        setIsFlipped(false);
                      }}
                    >
                      Next <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MODE 5: QUIZ */}
          {activePracticeMode === 'quiz' && (
            <div className="practice-mode-content">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {practiceLesson.practiceQuestions.map((q, qIdx) => {
                  const state = quizAnswers[q.id];
                  const hasSubmitted = state?.submitted;

                  return (
                    <div key={q.id} style={{ padding: '1.25rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                      <p style={{ fontWeight: 700, fontSize: '0.98rem', marginBottom: '0.75rem' }}>
                        {qIdx + 1}. {q.prompt}
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {q.options.map((opt, optIdx) => {
                          const isSelected = state?.selectedIndex === optIdx;
                          const isCorrect = optIdx === q.correctOptionIndex;
                          const marker = OPTION_MARKERS[optIdx] || { symbol: '•', label: '' };

                          let borderColor = 'var(--border-subtle)';
                          let bg = 'transparent';

                          if (hasSubmitted) {
                            if (isCorrect) {
                              borderColor = 'var(--accent-emerald)';
                              bg = 'rgba(16, 185, 129, 0.12)';
                            } else if (isSelected) {
                              borderColor = 'var(--accent-coral)';
                              bg = 'rgba(244, 63, 94, 0.12)';
                            }
                          } else if (isSelected) {
                            borderColor = 'var(--accent-cyan)';
                            bg = 'rgba(56, 189, 248, 0.08)';
                          }

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              className="quiz-option"
                              disabled={hasSubmitted}
                              onClick={() => {
                                setQuizAnswers((prev) => ({
                                  ...prev,
                                  [q.id]: {
                                    selectedIndex: optIdx,
                                    submitted: true,
                                    isCorrect: optIdx === q.correctOptionIndex
                                  }
                                }));
                                onAnnounce(
                                  optIdx === q.correctOptionIndex
                                    ? `Correct! ${q.explanation}`
                                    : `Incorrect. Correct option was ${q.correctOptionIndex + 1}. ${q.explanation}`
                                );
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.75rem 1rem',
                                borderRadius: 'var(--radius-sm)',
                                border: `1.5px solid ${borderColor}`,
                                background: bg,
                                textAlign: 'left',
                                cursor: hasSubmitted ? 'default' : 'pointer'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }} title={marker.label} aria-hidden="true">
                                  {marker.symbol}
                                </span>
                                <span style={{ fontSize: '0.9rem' }}>{opt}</span>
                              </div>

                              {hasSubmitted && isCorrect && (
                                <span style={{ color: 'var(--accent-emerald)', fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <CheckCircle2 size={16} /> Correct
                                </span>
                              )}
                              {hasSubmitted && isSelected && !isCorrect && (
                                <span style={{ color: 'var(--accent-coral)', fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <XCircle size={16} /> Incorrect
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {hasSubmitted && (
                        <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(2, 6, 23, 0.05)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                          <strong style={{ color: 'var(--accent-cyan)' }}>Explanation: </strong>
                          <span>{q.explanation}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MODE 6: REVISION NOTES */}
          {activePracticeMode === 'notes' && (
            <div className="practice-mode-content">
              <div style={{ padding: '1.25rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.75rem', color: 'var(--accent-cyan)' }}>
                  Structured Revision Points
                </h4>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: 1.7, fontSize: '0.92rem' }}>
                  {practiceLesson.studyNotes.map((note, idx) => (
                    <li key={idx} style={{ marginBottom: '0.5rem' }}>{note}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </article>
      )}
    </div>
  );
};
