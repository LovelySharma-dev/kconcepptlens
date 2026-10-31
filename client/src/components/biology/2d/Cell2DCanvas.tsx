import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Compass,
  SkipForward,
  X,
  Eye,
  EyeOff
} from 'lucide-react';

interface Cell2DCanvasProps {
  selectedComponentId: string | null;
  onSelectComponent: (id: string) => void;
  showLabels?: boolean;
  onToggleLabels?: () => void;
  onAnnounce?: (msg: string) => void;
}

// Coordinate mapping for each organelle in the 800x520 space
const ORGANELLE_CENTERS: Record<string, { x: number; y: number; zoom: number; label: string }> = {
  cell_membrane: { x: 400, y: 260, zoom: 1.05, label: 'Plasma Membrane' },
  cytoplasm: { x: 400, y: 260, zoom: 1.0, label: 'Cytoplasm & Cytosol' },
  nucleus: { x: 400, y: 245, zoom: 1.5, label: 'Nucleus & Nucleolus' },
  endoplasmic_reticulum: { x: 410, y: 345, zoom: 1.45, label: 'Endoplasmic Reticulum' },
  mitochondria: { x: 235, y: 195, zoom: 1.6, label: 'Mitochondria' },
  golgi_apparatus: { x: 235, y: 310, zoom: 1.6, label: 'Golgi Apparatus' },
  lysosomes: { x: 505, y: 380, zoom: 1.55, label: 'Lysosomes' },
  ribosomes: { x: 380, y: 200, zoom: 1.5, label: 'Ribosomes' }
};

const GUIDED_TOUR_STEPS = [
  { id: 'cell_membrane', title: 'Step 1: Plasma Membrane', summary: 'The selectively permeable lipid barrier controlling all molecular traffic.' },
  { id: 'nucleus', title: 'Step 2: Nucleus & Nucleolus', summary: 'The command center enclosing genomic chromosomes and assembling ribosomes.' },
  { id: 'endoplasmic_reticulum', title: 'Step 3: Endoplasmic Reticulum', summary: 'Membrane network studded with ribosomes synthesizing proteins and lipids.' },
  { id: 'golgi_apparatus', title: 'Step 4: Golgi Apparatus', summary: 'Cisternae stacks modifying, tagging, and dispatching macromolecular vesicles.' },
  { id: 'mitochondria', title: 'Step 5: Mitochondria', summary: 'The ATP energy factories generating cellular fuel via oxidative phosphorylation.' }
];

export const Cell2DCanvas: React.FC<Cell2DCanvasProps> = ({
  selectedComponentId,
  onSelectComponent,
  showLabels = true,
  onToggleLabels,
  onAnnounce
}) => {
  // Zoom & Pan transformation state
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isLabelsVisible, setIsLabelsVisible] = useState(showLabels);
  const [guidedTourIndex, setGuidedTourIndex] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLabelsVisible(showLabels);
  }, [showLabels]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(2.5, +(z + 0.25).toFixed(2)));
    onAnnounce?.('Zoomed in.');
  }, [onAnnounce]);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => {
      const next = Math.max(0.8, +(z - 0.25).toFixed(2));
      if (next <= 1.0) setPan({ x: 0, y: 0 });
      return next;
    });
    onAnnounce?.('Zoomed out.');
  }, [onAnnounce]);

  const handleResetView = useCallback(() => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
    setGuidedTourIndex(null);
    onAnnounce?.('Reset view to default framing.');
  }, [onAnnounce]);

  // Frame active organelle smoothly
  const handleFrameSelected = useCallback(() => {
    if (!selectedComponentId || !ORGANELLE_CENTERS[selectedComponentId]) {
      handleResetView();
      return;
    }
    const center = ORGANELLE_CENTERS[selectedComponentId];
    // Calculate pan offset to bring organelle to viewport center (400, 260)
    const targetZoom = center.zoom;
    const offsetX = (400 - center.x) * (targetZoom - 0.2);
    const offsetY = (260 - center.y) * (targetZoom - 0.2);

    setZoom(targetZoom);
    setPan({ x: Math.round(offsetX), y: Math.round(offsetY) });
    onAnnounce?.(`Centered view on ${center.label}.`);
  }, [selectedComponentId, handleResetView, onAnnounce]);

  // Guided Tour Handlers
  const handleStartTour = useCallback(() => {
    setGuidedTourIndex(0);
    const firstStep = GUIDED_TOUR_STEPS[0];
    onSelectComponent(firstStep.id);
    const center = ORGANELLE_CENTERS[firstStep.id];
    setZoom(center.zoom);
    setPan({ x: (400 - center.x) * (center.zoom - 0.2), y: (260 - center.y) * (center.zoom - 0.2) });
    onAnnounce?.(`Starting guided tour. ${firstStep.title}: ${firstStep.summary}`);
  }, [onSelectComponent, onAnnounce]);

  const handleNextTourStep = useCallback(() => {
    if (guidedTourIndex === null) return;
    const nextIdx = (guidedTourIndex + 1) % GUIDED_TOUR_STEPS.length;
    setGuidedTourIndex(nextIdx);
    const step = GUIDED_TOUR_STEPS[nextIdx];
    onSelectComponent(step.id);
    const center = ORGANELLE_CENTERS[step.id];
    setZoom(center.zoom);
    setPan({ x: (400 - center.x) * (center.zoom - 0.2), y: (260 - center.y) * (center.zoom - 0.2) });
    onAnnounce?.(`${step.title}: ${step.summary}`);
  }, [guidedTourIndex, onSelectComponent, onAnnounce]);

  const handleExitTour = useCallback(() => {
    setGuidedTourIndex(null);
    handleResetView();
    onAnnounce?.('Exited guided tour.');
  }, [handleResetView, onAnnounce]);

  // Pointer panning handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (zoom <= 1.0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    if (containerRef.current) {
      containerRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      if (containerRef.current && containerRef.current.hasPointerCapture(e.pointerId)) {
        containerRef.current.releasePointerCapture(e.pointerId);
      }
    }
  };

  // Keyboard navigation for canvas (Pan with arrow keys when focused & zoomed)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.target !== containerRef.current) return;
    if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      handleZoomIn();
    } else if (e.key === '-' || e.key === '_') {
      e.preventDefault();
      handleZoomOut();
    } else if (e.key === '0' || e.key === 'r') {
      e.preventDefault();
      handleResetView();
    } else if (zoom > 1.0) {
      const STEP = 25;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setPan((p) => ({ ...p, x: p.x + STEP }));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setPan((p) => ({ ...p, x: p.x - STEP }));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setPan((p) => ({ ...p, y: p.y + STEP }));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setPan((p) => ({ ...p, y: p.y - STEP }));
      }
    }
  };

  // Organelle keyboard selection helper
  const handleOrganelleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      onSelectComponent(id);
      onAnnounce?.(`Selected ${ORGANELLE_CENTERS[id]?.label || id}`);
    }
  };

  return (
    <div
      ref={containerRef}
      className="cell-canvas-viewport"
      tabIndex={0}
      role="region"
      aria-label="Interactive Animal Cell 2D Simulation Canvas. Use arrow keys to pan when zoomed, plus/minus to zoom."
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '460px',
        background: 'radial-gradient(circle at 50% 50%, #0d1527 0%, #050811 100%)',
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: zoom > 1.0 ? (isDragging ? 'grabbing' : 'grab') : 'default',
        touchAction: zoom > 1.0 ? 'none' : 'pan-y',
        border: '1px solid var(--border-subtle)'
      }}
    >
      {/* 1. HUD CONTROL TOOLBAR (TOP-RIGHT) */}
      <div
        className="canvas-hud"
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--surface-card)',
          backdropFilter: 'blur(8px)',
          padding: '4px 8px',
          borderRadius: '8px',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-subtle)'
        }}
      >
        {/* Zoom In */}
        <button
          type="button"
          onClick={handleZoomIn}
          disabled={zoom >= 2.5}
          title="Zoom In (+)"
          aria-label="Zoom in on cell diagram"
          className="icon-btn"
          style={{ width: '28px', height: '28px', padding: 0 }}
        >
          <ZoomIn size={15} />
        </button>

        {/* Zoom Out */}
        <button
          type="button"
          onClick={handleZoomOut}
          disabled={zoom <= 0.8}
          title="Zoom Out (-)"
          aria-label="Zoom out of cell diagram"
          className="icon-btn"
          style={{ width: '28px', height: '28px', padding: 0 }}
        >
          <ZoomOut size={15} />
        </button>

        {/* Zoom Percentage */}
        <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', minWidth: '38px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          {Math.round(zoom * 100)}%
        </span>

        {/* Reset View */}
        <button
          type="button"
          onClick={handleResetView}
          title="Reset View (R)"
          aria-label="Reset zoom and center view"
          className="icon-btn"
          style={{ width: '28px', height: '28px', padding: 0 }}
        >
          <RotateCcw size={14} />
        </button>

        {/* Frame Selected Structure */}
        {selectedComponentId && selectedComponentId !== 'cytoplasm' && (
          <button
            type="button"
            onClick={handleFrameSelected}
            title="Focus and frame selected structure"
            aria-label="Frame selected structure"
            className="icon-btn"
            style={{ width: '28px', height: '28px', padding: 0, color: 'var(--accent-cyan)' }}
          >
            <Maximize2 size={14} />
          </button>
        )}

        {/* Toggle Overlay Labels */}
        <button
          type="button"
          onClick={() => {
            const next = !isLabelsVisible;
            setIsLabelsVisible(next);
            if (onToggleLabels) onToggleLabels();
            onAnnounce?.(next ? 'Labels visible.' : 'Labels hidden.');
          }}
          title={isLabelsVisible ? 'Hide Labels' : 'Show Labels'}
          aria-label={isLabelsVisible ? 'Hide structure labels' : 'Show structure labels'}
          className="icon-btn"
          style={{ width: '28px', height: '28px', padding: 0, color: isLabelsVisible ? 'var(--accent-cyan)' : 'var(--text-muted)' }}
        >
          {isLabelsVisible ? <Eye size={15} /> : <EyeOff size={15} />}
        </button>
      </div>

      {/* 2. GUIDED TOUR BANNER (TOP-LEFT) */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        {guidedTourIndex === null ? (
          <button
            type="button"
            onClick={handleStartTour}
            className="btn-secondary"
            style={{
              fontSize: '0.75rem',
              padding: '0.3rem 0.75rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'var(--surface-card)',
              backdropFilter: 'blur(8px)',
              borderColor: 'var(--accent-cyan)',
              color: 'var(--accent-cyan)'
            }}
          >
            <Compass size={14} />
            <span>Guided Tour (5 Steps)</span>
          </button>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--surface-card)',
              backdropFilter: 'blur(8px)',
              padding: '4px 10px',
              borderRadius: '8px',
              border: '1px solid var(--accent-cyan)'
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
              {GUIDED_TOUR_STEPS[guidedTourIndex].title}
            </span>
            <button
              type="button"
              onClick={handleNextTourStep}
              className="icon-btn"
              title="Next Tour Step"
              aria-label="Next guided tour step"
              style={{ width: '24px', height: '24px', padding: 0, color: 'var(--text-primary)' }}
            >
              <SkipForward size={14} />
            </button>
            <button
              type="button"
              onClick={handleExitTour}
              className="icon-btn"
              title="Exit Tour"
              aria-label="Exit guided tour"
              style={{ width: '24px', height: '24px', padding: 0, color: 'var(--text-muted)' }}
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* 3. MAIN SVG RENDERER — FRAMED TO FILL >85% OF VIEWPORT */}
      <svg
        viewBox="0 0 800 520"
        preserveAspectRatio="xMidYMid meet"
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '400px 260px',
          transition: isDragging ? 'none' : 'transform 0.22s ease-out'
        }}
        role="img"
        aria-label="Interactive 2D Animal Cell Diagram with selectable organelles"
      >
        <defs>
          {/* Cytoplasm Jelly Gradient */}
          <radialGradient id="membraneGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e293b" stopOpacity="0.55" />
            <stop offset="85%" stopColor="#0f172a" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.9" />
          </radialGradient>

          {/* Nuclear Envelope Gradient */}
          <radialGradient id="nucleusGrad" cx="42%" cy="42%" r="52%">
            <stop offset="0%" stopColor="#d8b4fe" />
            <stop offset="55%" stopColor="#9333ea" />
            <stop offset="100%" stopColor="#4c1d95" />
          </radialGradient>

          {/* Nucleolus Core Gradient */}
          <radialGradient id="nucleolusGrad" cx="40%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#c026d3" />
          </radialGradient>

          {/* Mitochondria Gradient */}
          <linearGradient id="mitoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          {/* Golgi Apparatus Gradient */}
          <linearGradient id="golgiGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#db2777" />
          </linearGradient>

          {/* High-visibility Selection Glow Filter */}
          <filter id="organelleGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix in="blur" type="matrix" values="
              0 0 0 0 0.22
              0 0 0 0 0.85
              0 0 0 0 1.0
              0 0 0 1 0" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="pulseGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="8" result="glow" />
            <feComposite in="SourceGraphic" in2="glow" operator="over" />
          </filter>
        </defs>

        {/* 1. Cytoplasm Gel Body (cx=400, cy=260, rx=345, ry=220 fills 86% of width and 85% of height) */}
        <g
          tabIndex={0}
          role="button"
          aria-label="Cytoplasm and Cytosol"
          aria-pressed={selectedComponentId === 'cytoplasm'}
          onClick={() => onSelectComponent('cytoplasm')}
          onKeyDown={(e) => handleOrganelleKeyDown(e, 'cytoplasm')}
          style={{ cursor: 'pointer', outline: 'none' }}
        >
          <ellipse
            cx="400"
            cy="260"
            rx="345"
            ry="220"
            fill="url(#membraneGrad)"
            stroke={selectedComponentId === 'cytoplasm' ? '#38bdf8' : 'rgba(56, 189, 248, 0.25)'}
            strokeWidth={selectedComponentId === 'cytoplasm' ? 3 : 1}
          />
        </g>

        {/* 2. Plasma Membrane Border */}
        <g
          tabIndex={0}
          role="button"
          aria-label="Plasma Membrane"
          aria-pressed={selectedComponentId === 'cell_membrane'}
          onClick={() => onSelectComponent('cell_membrane')}
          onKeyDown={(e) => handleOrganelleKeyDown(e, 'cell_membrane')}
          style={{ cursor: 'pointer', outline: 'none' }}
        >
          <ellipse
            cx="400"
            cy="260"
            rx="345"
            ry="220"
            fill="none"
            stroke={selectedComponentId === 'cell_membrane' ? '#00f2fe' : 'rgba(56, 189, 248, 0.75)'}
            strokeWidth={selectedComponentId === 'cell_membrane' ? '7' : '4'}
            strokeDasharray={selectedComponentId === 'cell_membrane' ? '10 5' : 'none'}
            filter={selectedComponentId === 'cell_membrane' ? 'url(#organelleGlow)' : undefined}
            style={{ transition: 'stroke-width 0.2s ease, stroke 0.2s ease' }}
          />
        </g>

        {/* 3. Rough & Smooth Endoplasmic Reticulum (Curved cisternae folds) */}
        <g
          tabIndex={0}
          role="button"
          aria-label="Endoplasmic Reticulum"
          aria-pressed={selectedComponentId === 'endoplasmic_reticulum'}
          onClick={() => onSelectComponent('endoplasmic_reticulum')}
          onKeyDown={(e) => handleOrganelleKeyDown(e, 'endoplasmic_reticulum')}
          filter={selectedComponentId === 'endoplasmic_reticulum' ? 'url(#organelleGlow)' : undefined}
          style={{ cursor: 'pointer', outline: 'none' }}
        >
          {/* Outer Fold */}
          <path
            d="M 305 340 Q 360 410 435 395 T 525 350"
            fill="none"
            stroke="#059669"
            strokeWidth={selectedComponentId === 'endoplasmic_reticulum' ? '15' : '10'}
            strokeLinecap="round"
            opacity="0.8"
          />
          {/* Middle Fold */}
          <path
            d="M 320 315 Q 375 375 440 365 T 510 325"
            fill="none"
            stroke="#10b981"
            strokeWidth={selectedComponentId === 'endoplasmic_reticulum' ? '16' : '11'}
            strokeLinecap="round"
            opacity="0.9"
          />
          {/* Inner Fold */}
          <path
            d="M 335 290 Q 380 340 435 335 T 490 305"
            fill="none"
            stroke="#34d399"
            strokeWidth={selectedComponentId === 'endoplasmic_reticulum' ? '14' : '9'}
            strokeLinecap="round"
            opacity="0.85"
          />
          {/* Bound Ribosomes on RER folds */}
          {[335, 360, 385, 415, 445, 470, 495, 350, 390, 430, 475].map((rx, idx) => (
            <circle
              key={idx}
              cx={rx}
              cy={300 + (idx % 3) * 30}
              r="3.2"
              fill="#38bdf8"
              stroke="#0f172a"
              strokeWidth="0.8"
            />
          ))}
        </g>

        {/* 4. Nucleus & Nucleolus */}
        <g
          tabIndex={0}
          role="button"
          aria-label="Nucleus and Nucleolus"
          aria-pressed={selectedComponentId === 'nucleus'}
          onClick={() => onSelectComponent('nucleus')}
          onKeyDown={(e) => handleOrganelleKeyDown(e, 'nucleus')}
          filter={selectedComponentId === 'nucleus' ? 'url(#organelleGlow)' : undefined}
          style={{ cursor: 'pointer', outline: 'none' }}
        >
          {/* Outer Nuclear Membrane Envelope */}
          <circle
            cx="400"
            cy="245"
            r="78"
            fill="url(#nucleusGrad)"
            stroke={selectedComponentId === 'nucleus' ? '#c084fc' : '#a855f7'}
            strokeWidth={selectedComponentId === 'nucleus' ? '6' : '3.5'}
            strokeDasharray="14 4" // Nuclear pores representation
          />
          {/* Chromatin Threads */}
          <path
            d="M 360 220 Q 390 200 415 225 T 445 245"
            fill="none"
            stroke="rgba(255, 255, 255, 0.45)"
            strokeWidth="2.5"
          />
          <path
            d="M 365 270 Q 400 285 425 260"
            fill="none"
            stroke="rgba(255, 255, 255, 0.4)"
            strokeWidth="2.5"
          />
          <path
            d="M 350 245 Q 380 260 410 240"
            fill="none"
            stroke="rgba(255, 255, 255, 0.35)"
            strokeWidth="2"
          />
          {/* Inner Dense Nucleolus */}
          <circle cx="420" cy="240" r="26" fill="url(#nucleolusGrad)" stroke="#fae8ff" strokeWidth="1.5" />
        </g>

        {/* 5. Mitochondria (Arranged in Cytoplasm) */}
        <g
          tabIndex={0}
          role="button"
          aria-label="Mitochondria (Powerhouses of the Cell)"
          aria-pressed={selectedComponentId === 'mitochondria'}
          onClick={() => onSelectComponent('mitochondria')}
          onKeyDown={(e) => handleOrganelleKeyDown(e, 'mitochondria')}
          filter={selectedComponentId === 'mitochondria' ? 'url(#organelleGlow)' : undefined}
          style={{ cursor: 'pointer', outline: 'none' }}
        >
          {/* Mitochondrion 1: Left Upper */}
          <g transform="translate(235, 195) rotate(-22)">
            <rect
              x="-44"
              y="-22"
              width="88"
              height="44"
              rx="22"
              fill="url(#mitoGrad)"
              stroke={selectedComponentId === 'mitochondria' ? '#fde047' : '#d97706'}
              strokeWidth={selectedComponentId === 'mitochondria' ? '4' : '2'}
            />
            {/* Inner Cristae Membranes */}
            <path d="M -28 -14 L -28 14 M -14 -16 L -14 16 M 2 -16 L 2 16 M 18 -14 L 18 14 M 32 -10 L 32 10" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
          </g>

          {/* Mitochondrion 2: Right Lower */}
          <g transform="translate(560, 330) rotate(32)">
            <rect
              x="-40"
              y="-20"
              width="80"
              height="40"
              rx="20"
              fill="url(#mitoGrad)"
              stroke={selectedComponentId === 'mitochondria' ? '#fde047' : '#d97706'}
              strokeWidth={selectedComponentId === 'mitochondria' ? '4' : '2'}
            />
            <path d="M -24 -12 L -24 12 M -10 -14 L -10 14 M 4 -14 L 4 14 M 18 -12 L 18 12" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
          </g>

          {/* Mitochondrion 3: Right Upper */}
          <g transform="translate(555, 175) rotate(-18)">
            <rect
              x="-36"
              y="-18"
              width="72"
              height="36"
              rx="18"
              fill="url(#mitoGrad)"
              stroke={selectedComponentId === 'mitochondria' ? '#fde047' : '#d97706'}
              strokeWidth={selectedComponentId === 'mitochondria' ? '4' : '2'}
            />
            <path d="M -20 -10 L -20 10 M -7 -12 L -7 12 M 6 -12 L 6 12 M 19 -10 L 19 10" stroke="#78350f" strokeWidth="2.2" strokeLinecap="round" />
          </g>
        </g>

        {/* 6. Golgi Apparatus (Cisternae stack + secretory vesicles) */}
        <g
          tabIndex={0}
          role="button"
          aria-label="Golgi Apparatus"
          aria-pressed={selectedComponentId === 'golgi_apparatus'}
          onClick={() => onSelectComponent('golgi_apparatus')}
          onKeyDown={(e) => handleOrganelleKeyDown(e, 'golgi_apparatus')}
          filter={selectedComponentId === 'golgi_apparatus' ? 'url(#organelleGlow)' : undefined}
          transform="translate(235, 320) rotate(14)"
          style={{ cursor: 'pointer', outline: 'none' }}
        >
          <path d="M -42 -16 Q 0 -6 42 -16" fill="none" stroke="url(#golgiGrad)" strokeWidth={selectedComponentId === 'golgi_apparatus' ? '9' : '6.5'} strokeLinecap="round" />
          <path d="M -48 0 Q 0 10 48 0" fill="none" stroke="url(#golgiGrad)" strokeWidth={selectedComponentId === 'golgi_apparatus' ? '9' : '6.5'} strokeLinecap="round" />
          <path d="M -42 16 Q 0 26 42 16" fill="none" stroke="url(#golgiGrad)" strokeWidth={selectedComponentId === 'golgi_apparatus' ? '9' : '6.5'} strokeLinecap="round" />
          {/* Secretory vesicles budding off */}
          <circle cx="56" cy="-12" r="5.5" fill="#f472b6" />
          <circle cx="-56" cy="8" r="5" fill="#f472b6" />
          <circle cx="48" cy="24" r="6" fill="#f472b6" />
          <circle cx="-32" cy="32" r="4.5" fill="#f472b6" />
        </g>

        {/* 7. Lysosomes (Enzyme spheres) */}
        <g
          tabIndex={0}
          role="button"
          aria-label="Lysosomes"
          aria-pressed={selectedComponentId === 'lysosomes'}
          onClick={() => onSelectComponent('lysosomes')}
          onKeyDown={(e) => handleOrganelleKeyDown(e, 'lysosomes')}
          filter={selectedComponentId === 'lysosomes' ? 'url(#organelleGlow)' : undefined}
          style={{ cursor: 'pointer', outline: 'none' }}
        >
          <circle cx="280" cy="130" r="16" fill="#ef4444" stroke={selectedComponentId === 'lysosomes' ? '#fecaca' : '#b91c1c'} strokeWidth={selectedComponentId === 'lysosomes' ? '4' : '2.5'} />
          <circle cx="505" cy="115" r="14" fill="#ef4444" stroke={selectedComponentId === 'lysosomes' ? '#fecaca' : '#b91c1c'} strokeWidth={selectedComponentId === 'lysosomes' ? '4' : '2'} />
          <circle cx="505" cy="405" r="17" fill="#ef4444" stroke={selectedComponentId === 'lysosomes' ? '#fecaca' : '#b91c1c'} strokeWidth={selectedComponentId === 'lysosomes' ? '4' : '2.5'} />
        </g>

        {/* 8. Free Ribosomes & Cytoskeleton Filaments */}
        <g
          tabIndex={0}
          role="button"
          aria-label="Free Ribosomes"
          aria-pressed={selectedComponentId === 'ribosomes'}
          onClick={() => onSelectComponent('ribosomes')}
          onKeyDown={(e) => handleOrganelleKeyDown(e, 'ribosomes')}
          style={{ cursor: 'pointer', outline: 'none' }}
        >
          {/* Cytoskeleton Structural Fibers */}
          <path d="M 170 230 Q 240 180 320 160" fill="none" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="1.5" strokeDasharray="4 4" />
          <path d="M 480 150 Q 550 170 630 220" fill="none" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="1.5" strokeDasharray="4 4" />
          <path d="M 210 330 Q 300 420 400 440" fill="none" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="1.5" strokeDasharray="4 4" />

          {/* Cytosolic Free Ribosomes */}
          {[
            [190, 260], [240, 230], [290, 170], [330, 150],
            [480, 150], [510, 180], [580, 220], [600, 260],
            [350, 420], [390, 440], [430, 445], [480, 420]
          ].map(([rx, ry], idx) => (
            <circle
              key={idx}
              cx={rx}
              cy={ry}
              r={selectedComponentId === 'ribosomes' ? '4.5' : '3.2'}
              fill={selectedComponentId === 'ribosomes' ? '#67e8f9' : '#38bdf8'}
            />
          ))}
        </g>

        {/* 9. OVERLAY LABELS */}
        {isLabelsVisible && (
          <g style={{ pointerEvents: 'none', userSelect: 'none', fontSize: '12px', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
            {/* Plasma Membrane */}
            <text x="690" y="240" fill="#00f2fe">Plasma Membrane</text>
            <line x1="680" y1="236" x2="655" y2="248" stroke="#00f2fe" strokeWidth="1.5" strokeDasharray="3 2" />

            {/* Nucleus */}
            <text x="400" y="150" fill="#c084fc" textAnchor="middle">Nucleus & Nucleolus</text>
            <line x1="400" y1="156" x2="400" y2="175" stroke="#c084fc" strokeWidth="1.5" strokeDasharray="3 2" />

            {/* Mitochondria */}
            <text x="145" y="185" fill="#fbbf24">Mitochondrion (ATP)</text>
            <line x1="205" y1="185" x2="225" y2="190" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3 2" />

            {/* Golgi */}
            <text x="145" y="340" fill="#f472b6">Golgi Apparatus</text>
            <line x1="210" y1="335" x2="228" y2="325" stroke="#f472b6" strokeWidth="1.5" strokeDasharray="3 2" />

            {/* Endoplasmic Reticulum */}
            <text x="400" y="445" fill="#34d399" textAnchor="middle">Endoplasmic Reticulum & Ribosomes</text>
            <line x1="400" y1="432" x2="400" y2="405" stroke="#34d399" strokeWidth="1.5" strokeDasharray="3 2" />

            {/* Lysosome */}
            <text x="235" y="115" fill="#f87171">Lysosome</text>
            <line x1="265" y1="115" x2="278" y2="125" stroke="#f87171" strokeWidth="1.5" strokeDasharray="3 2" />
          </g>
        )}
      </svg>
    </div>
  );
};
