import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface Heart2DCanvasProps {
  selectedComponentId: string | null;
  onSelectComponent: (id: string) => void;
  showLabels?: boolean;
  /** When false, the flow animation waits for a button press. */
  autoplay?: boolean;
}

export const Heart2DCanvas: React.FC<Heart2DCanvasProps> = ({
  selectedComponentId,
  onSelectComponent,
  showLabels = true,
  autoplay = true
}) => {
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [flowOffset, setFlowOffset] = useState(0);

  useEffect(() => {
    if (!autoplay) setIsPlaying(false);
  }, [autoplay]);

  useEffect(() => {
    if (!isPlaying) return;
    let animId = 0;
    const loop = () => {
      setFlowOffset((prev) => (prev + 0.8) % 100);
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  const partProps = (id: string, label: string): React.SVGProps<SVGGElement> => {
    const selected = selectedComponentId === id;
    return {
      role: 'button',
      tabIndex: 0,
      'aria-label': selected ? `${label}, selected` : label,
      'aria-pressed': selected,
      style: { cursor: 'pointer' },
      onClick: () => onSelectComponent(id),
      onKeyDown: (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelectComponent(id);
        }
      }
    };
  };

  const handleResetFlow = () => {
    setFlowOffset(0);
    setIsPlaying(true);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '440px', background: 'radial-gradient(circle at center, #0e172a 0%, #070b14 100%)', borderRadius: '12px', overflow: 'hidden' }}>
      {/* Top Floating Controls */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          display: 'flex',
          gap: '0.4rem',
          background: 'var(--surface-card)',
          backdropFilter: 'blur(8px)',
          padding: '0.35rem 0.6rem',
          borderRadius: '8px',
          border: '1px solid var(--border-medium)',
          zIndex: 10
        }}
      >
        <button
          type="button"
          className={`icon-btn-sm ${isPlaying ? 'active' : ''}`}
          onClick={() => setIsPlaying((p) => !p)}
          title={isPlaying ? 'Pause Blood Flow' : 'Start Blood Flow'}
          aria-label={isPlaying ? 'Pause Flow' : 'Start Flow'}
        >
          {isPlaying ? <Pause size={15} /> : <Play size={15} />}
        </button>
        <button
          type="button"
          className="icon-btn-sm"
          onClick={handleResetFlow}
          title="Reset Circulation Animation"
          aria-label="Reset Circulation"
        >
          <RotateCcw size={15} />
        </button>
      </div>

      <svg
        viewBox="0 0 800 500"
        style={{ width: '100%', height: '100%', display: 'block' }}
        role="img"
        aria-label="Human Heart Cross-Section and Double Circulation"
      >
        <defs>
          <filter id="heartGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Marker Arrows */}
          <marker id="blueArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
          </marker>
          <marker id="redArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#f43f5e" />
          </marker>
        </defs>

        {/* Outer Myocardium Silhouette */}
        <path
          d="M 400 120 C 330 90 260 140 260 250 C 260 360 360 430 400 450 C 440 430 540 360 540 250 C 540 140 470 90 400 120 Z"
          fill="#1e1b4b"
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth="3"
        />

        {/* 1. Superior & Inferior Vena Cava (Deoxygenated Blue Inflow) */}
        <g
          {...partProps('superior_inferior_vena_cava', 'Superior and inferior vena cava, dashed line, blood toward the lungs')}
          filter={selectedComponentId === 'superior_inferior_vena_cava' ? 'url(#heartGlow)' : undefined}
        >
          {/* Superior Vena Cava */}
          <path d="M 290 60 L 290 180" stroke="#0284c7" strokeWidth="26" strokeLinecap="round" strokeDasharray="16 10" />
          {/* Inferior Vena Cava */}
          <path d="M 290 320 L 290 440" stroke="#0284c7" strokeWidth="26" strokeLinecap="round" strokeDasharray="16 10" />
        </g>

        {/* 2. Systemic Aorta Arch (Oxygenated Red Outflow) */}
        <g
          {...partProps('aorta', 'Systemic aorta, solid line, blood toward the body')}
          filter={selectedComponentId === 'aorta' ? 'url(#heartGlow)' : undefined}
        >
          <path
            d="M 420 180 C 420 70 330 45 360 45 C 390 45 470 50 490 120"
            fill="none"
            stroke="#f43f5e"
            strokeWidth="30"
            strokeLinecap="round"
          />
          {/* Arch branches */}
          <line x1="390" y1="50" x2="380" y2="20" stroke="#f43f5e" strokeWidth="10" strokeLinecap="round" />
          <line x1="415" y1="50" x2="415" y2="18" stroke="#f43f5e" strokeWidth="10" strokeLinecap="round" />
          <line x1="440" y1="58" x2="450" y2="24" stroke="#f43f5e" strokeWidth="10" strokeLinecap="round" />
        </g>

        {/* 3. Pulmonary Trunk & Arteries (Blue Bifurcation) */}
        <g
          {...partProps('pulmonary_artery', 'Pulmonary artery, dashed line, blood toward the lungs')}
          filter={selectedComponentId === 'pulmonary_artery' ? 'url(#heartGlow)' : undefined}
        >
          <path
            d="M 370 200 C 370 120 440 100 480 90"
            fill="none"
            stroke="#0284c7"
            strokeWidth="24"
            strokeLinecap="round"
            strokeDasharray="16 10"
          />
        </g>

        {/* 4. Right Atrium Chamber (Deoxygenated) */}
        <g
          {...partProps('right_atrium', 'Right atrium, dashed outline, blood toward the lungs')}
          filter={selectedComponentId === 'right_atrium' ? 'url(#heartGlow)' : undefined}
        >
          <path
            d="M 300 170 C 300 140 370 140 375 190 C 380 230 310 230 300 170 Z"
            fill="rgba(2, 132, 199, 0.4)"
            stroke={selectedComponentId === 'right_atrium' ? '#f8fafc' : '#0284c7'}
            strokeWidth={selectedComponentId === 'right_atrium' ? '5' : '2'}
            strokeDasharray="8 6"
          />
        </g>

        {/* 5. Right Ventricle Chamber (Deoxygenated) */}
        <g
          {...partProps('right_ventricle', 'Right ventricle, dashed outline, blood toward the lungs')}
          filter={selectedComponentId === 'right_ventricle' ? 'url(#heartGlow)' : undefined}
        >
          <path
            d="M 310 250 C 310 235 380 235 385 270 C 390 350 330 370 310 250 Z"
            fill="rgba(3, 105, 161, 0.5)"
            stroke={selectedComponentId === 'right_ventricle' ? '#f8fafc' : '#0369a1'}
            strokeWidth={selectedComponentId === 'right_ventricle' ? '5' : '2'}
            strokeDasharray="8 6"
          />
        </g>

        {/* 6. Left Atrium Chamber (Oxygenated) */}
        <g
          {...partProps('left_atrium', 'Left atrium, solid outline, blood toward the body')}
          filter={selectedComponentId === 'left_atrium' ? 'url(#heartGlow)' : undefined}
        >
          <path
            d="M 500 170 C 500 140 430 140 425 190 C 420 230 490 230 500 170 Z"
            fill="rgba(244, 63, 94, 0.4)"
            stroke={selectedComponentId === 'left_atrium' ? '#f8fafc' : '#f43f5e'}
            strokeWidth={selectedComponentId === 'left_atrium' ? '5' : '2'}
          />
        </g>

        {/* 7. Left Ventricle Chamber (Thick Myocardium Wall - Oxygenated) */}
        <g
          {...partProps('left_ventricle', 'Left ventricle, solid outline, blood toward the body')}
          filter={selectedComponentId === 'left_ventricle' ? 'url(#heartGlow)' : undefined}
        >
          <path
            d="M 490 250 C 490 235 420 235 415 270 C 410 380 470 410 490 250 Z"
            fill="rgba(190, 18, 60, 0.55)"
            stroke={selectedComponentId === 'left_ventricle' ? '#f8fafc' : '#be123c'}
            strokeWidth={selectedComponentId === 'left_ventricle' ? '6' : '3'}
          />
        </g>

        {/* Central Interventricular Septum */}
        <path d="M 400 200 L 400 420" stroke="#475569" strokeWidth="14" strokeLinecap="round" />

        {/* 8. Cardiac Valves (AV Valves & Semilunar Valves) */}
        <g
          {...partProps('heart_valves', 'Atrioventricular valves')}
          filter={selectedComponentId === 'heart_valves' ? 'url(#heartGlow)' : undefined}
        >
          {/* Tricuspid Valve */}
          <line x1="330" y1="235" x2="365" y2="235" stroke="#fbbf24" strokeWidth="4.5" strokeLinecap="round" />
          {/* Mitral / Bicuspid Valve */}
          <line x1="435" y1="235" x2="470" y2="235" stroke="#fbbf24" strokeWidth="4.5" strokeLinecap="round" />
        </g>

        {/* Dynamic Blood Flow Particles / Dashes */}
        {isPlaying && (
          <g style={{ pointerEvents: 'none' }}>
            {/* Deoxygenated Blue Pathway: SVC -> RA -> RV -> Pulmonary Artery */}
            <path
              d="M 290 80 L 290 180 Q 330 200 345 240 Q 360 300 370 200 Q 420 130 480 90"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="3.5"
              strokeDasharray="8 12"
              strokeDashoffset={-flowOffset * 1.5}
              markerEnd="url(#blueArrow)"
            />

            {/* Oxygenated Red Pathway: Pulmonary Veins -> LA -> LV -> Aorta */}
            <path
              d="M 520 170 Q 460 200 450 240 Q 440 330 435 220 Q 410 100 480 110"
              fill="none"
              stroke="#f43f5e"
              strokeWidth="3.5"
              strokeDasharray="8 12"
              strokeDashoffset={-flowOffset * 1.5}
              markerEnd="url(#redArrow)"
            />
          </g>
        )}

        {/* Labels Overlay */}
        {showLabels && (
          <g style={{ pointerEvents: 'none', userSelect: 'none', fontSize: '11px', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
            {/* SVC */}
            <text x="210" y="80" fill="#f8fafc">Superior Vena Cava (dashed)</text>
            <line x1="280" y1="78" x2="250" y2="78" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 2" />

            {/* Aorta */}
            <text x="520" y="60" fill="#f8fafc">Systemic Aorta (solid)</text>
            <line x1="490" y1="65" x2="515" y2="60" stroke="#f43f5e" strokeWidth="1" strokeDasharray="3 2" />

            {/* Pulmonary Trunk */}
            <text x="510" y="110" fill="#f8fafc">Pulmonary Artery (dashed)</text>
            <line x1="480" y1="95" x2="505" y2="108" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 2" />

            {/* Right Atrium */}
            <text x="230" y="195" fill="#f8fafc">Right Atrium (dashed)</text>
            <line x1="290" y1="190" x2="260" y2="190" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 2" />

            {/* Right Ventricle */}
            <text x="220" y="300" fill="#f8fafc">Right Ventricle (dashed)</text>
            <line x1="310" y1="295" x2="250" y2="295" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 2" />

            {/* Left Atrium */}
            <text x="550" y="195" fill="#f8fafc">Left Atrium (solid)</text>
            <line x1="490" y1="190" x2="545" y2="190" stroke="#f43f5e" strokeWidth="1" strokeDasharray="3 2" />

            {/* Left Ventricle */}
            <text x="550" y="300" fill="#f8fafc">Left Ventricle (solid)</text>
            <line x1="485" y1="295" x2="545" y2="295" stroke="#f43f5e" strokeWidth="1" strokeDasharray="3 2" />

            {/* Valves */}
            <text x="400" y="225" fill="#fbbf24" textAnchor="middle">Atrioventricular Valves</text>
          </g>
        )}
      </svg>
      <ul className="heart-legend">
        <li>Dashed line: blood on the way to the lungs.</li>
        <li>Solid line: blood on the way to the body.</li>
        <li>A selected part uses a thicker light outline and the word selected.</li>
      </ul>
    </div>
  );
};
