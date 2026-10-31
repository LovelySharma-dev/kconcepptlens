import React, { useState } from 'react';
import { Sparkles, Layers, Check, X } from 'lucide-react';

interface PlantCell2DCanvasProps {
  selectedComponentId: string | null;
  onSelectComponent: (id: string) => void;
  showLabels?: boolean;
}

export const PlantCell2DCanvas: React.FC<PlantCell2DCanvasProps> = ({
  selectedComponentId,
  onSelectComponent,
  showLabels = true
}) => {
  const [comparisonMode, setComparisonMode] = useState(false);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '440px', background: 'radial-gradient(circle at center, #0e172a 0%, #070b14 100%)', borderRadius: '12px', overflow: 'hidden' }}>
      {/* Comparison Toggle Button in Top Right */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          display: 'flex',
          gap: '0.4rem',
          zIndex: 10
        }}
      >
        <button
          type="button"
          className={`btn-secondary ${comparisonMode ? 'active' : ''}`}
          onClick={() => setComparisonMode((c) => !c)}
          style={{
            fontSize: '0.8rem',
            padding: '0.4rem 0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: comparisonMode ? 'rgba(16, 185, 129, 0.25)' : 'rgba(7, 11, 20, 0.8)',
            borderColor: comparisonMode ? '#10b981' : 'rgba(255, 255, 255, 0.15)'
          }}
        >
          <Layers size={14} color="#10b981" />
          <span>{comparisonMode ? 'Hide Comparison' : 'Plant vs. Animal Comparison'}</span>
        </button>
      </div>

      {!comparisonMode ? (
        <svg
          viewBox="0 0 800 500"
          style={{ width: '100%', height: '100%', display: 'block' }}
          role="img"
          aria-label="Interactive Plant Cell Diagram"
        >
          <defs>
            <linearGradient id="wallGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#047857" />
              <stop offset="100%" stopColor="#065f46" />
            </linearGradient>

            <radialGradient id="vacuoleGrad" cx="45%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#7dd3fc" />
              <stop offset="60%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </radialGradient>

            <linearGradient id="chloroplastGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>

            <filter id="plantGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. Rigid Rectangular Outer Cellulose Cell Wall */}
          <g
            style={{ cursor: 'pointer' }}
            onClick={() => onSelectComponent('cell_wall')}
            filter={selectedComponentId === 'cell_wall' ? 'url(#plantGlow)' : undefined}
          >
            {/* Middle Lamella (outer border) */}
            <rect
              x="160"
              y="60"
              width="480"
              height="380"
              rx="28"
              fill="url(#wallGrad)"
              stroke={selectedComponentId === 'cell_wall' ? '#34d399' : '#059669'}
              strokeWidth={selectedComponentId === 'cell_wall' ? '12' : '8'}
            />
          </g>

          {/* 2. Plasma Membrane (Inside Cell Wall) */}
          <rect
            x="180"
            y="80"
            width="440"
            height="340"
            rx="20"
            fill="#064e3b"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeDasharray="6 3"
          />

          {/* Cytoplasm Matrix */}
          <rect
            x="186"
            y="86"
            width="428"
            height="328"
            rx="16"
            fill="#022c22"
            opacity="0.85"
          />

          {/* 3. Large Central Vacuole (Tonoplast) - Occupies ~70% Volume */}
          <g
            style={{ cursor: 'pointer' }}
            onClick={() => onSelectComponent('central_vacuole')}
            filter={selectedComponentId === 'central_vacuole' ? 'url(#plantGlow)' : undefined}
          >
            <ellipse
              cx="370"
              cy="255"
              rx="155"
              ry="125"
              fill="url(#vacuoleGrad)"
              fillOpacity="0.75"
              stroke={selectedComponentId === 'central_vacuole' ? '#e0f2fe' : '#38bdf8'}
              strokeWidth={selectedComponentId === 'central_vacuole' ? '4' : '2'}
            />
            {/* Turgor fluid ripples */}
            <path d="M 280 230 Q 370 200 460 230" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="2" fill="none" />
            <path d="M 290 280 Q 370 250 450 280" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1.5" fill="none" />
          </g>

          {/* 4. Peripheral Plant Nucleus (Pushed to Side) */}
          <g
            style={{ cursor: 'pointer' }}
            onClick={() => onSelectComponent('nucleus')}
            filter={selectedComponentId === 'nucleus' ? 'url(#plantGlow)' : undefined}
          >
            <circle
              cx="550"
              cy="180"
              r="40"
              fill="#8b5cf6"
              stroke={selectedComponentId === 'nucleus' ? '#c084fc' : '#7c3aed'}
              strokeWidth={selectedComponentId === 'nucleus' ? '4' : '2'}
            />
            {/* Nucleolus */}
            <circle cx="558" cy="176" r="14" fill="#a855f7" />
          </g>

          {/* 5. Chloroplasts with Thylakoid Grana (Stacked photosynthetic discs) */}
          <g
            style={{ cursor: 'pointer' }}
            onClick={() => onSelectComponent('chloroplasts')}
            filter={selectedComponentId === 'chloroplasts' ? 'url(#plantGlow)' : undefined}
          >
            {/* Chloroplast 1 (Top Left) */}
            <g transform="translate(250, 130) rotate(-20)">
              <rect x="-35" y="-18" width="70" height="36" rx="18" fill="url(#chloroplastGrad)" stroke="#15803d" strokeWidth="2" />
              {/* Thylakoids stacks */}
              <line x1="-18" y1="-8" x2="-18" y2="8" stroke="#14532d" strokeWidth="4" strokeLinecap="round" />
              <line x1="-6" y1="-10" x2="-6" y2="10" stroke="#14532d" strokeWidth="4" strokeLinecap="round" />
              <line x1="6" y1="-10" x2="6" y2="10" stroke="#14532d" strokeWidth="4" strokeLinecap="round" />
              <line x1="18" y1="-8" x2="18" y2="8" stroke="#14532d" strokeWidth="4" strokeLinecap="round" />
            </g>

            {/* Chloroplast 2 (Bottom Left) */}
            <g transform="translate(240, 360) rotate(25)">
              <rect x="-32" y="-16" width="64" height="32" rx="16" fill="url(#chloroplastGrad)" stroke="#15803d" strokeWidth="2" />
              <line x1="-15" y1="-8" x2="-15" y2="8" stroke="#14532d" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="-3" y1="-9" x2="-3" y2="9" stroke="#14532d" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="9" y1="-9" x2="9" y2="9" stroke="#14532d" strokeWidth="3.5" strokeLinecap="round" />
            </g>

            {/* Chloroplast 3 (Bottom Right) */}
            <g transform="translate(540, 340) rotate(-15)">
              <rect x="-30" y="-15" width="60" height="30" rx="15" fill="url(#chloroplastGrad)" stroke="#15803d" strokeWidth="2" />
              <line x1="-14" y1="-7" x2="-14" y2="7" stroke="#14532d" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="-2" y1="-8" x2="-2" y2="8" stroke="#14532d" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="10" y1="-8" x2="10" y2="8" stroke="#14532d" strokeWidth="3.5" strokeLinecap="round" />
            </g>
          </g>

          {/* 6. Mitochondria (Plant Cell Respiration) */}
          <g transform="translate(420, 115) rotate(15)">
            <rect x="-24" y="-12" width="48" height="24" rx="12" fill="#f59e0b" stroke="#d97706" strokeWidth="1.5" />
            <path d="M -10 -5 L -10 5 M 0 -6 L 0 6 M 10 -5 L 10 5" stroke="#78350f" strokeWidth="1.5" strokeLinecap="round" />
          </g>

          {/* Labels Overlay */}
          {showLabels && (
            <g style={{ pointerEvents: 'none', userSelect: 'none', fontSize: '11px', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
              {/* Cell Wall */}
              <text x="140" y="45" fill="#34d399">Cellulose Cell Wall</text>
              <line x1="200" y1="48" x2="210" y2="60" stroke="#34d399" strokeWidth="1.2" strokeDasharray="3 2" />

              {/* Central Vacuole */}
              <text x="370" y="255" fill="#ffffff" textAnchor="middle" fontSize="13px" fontWeight="700">Central Vacuole (Tonoplast)</text>

              {/* Chloroplast */}
              <text x="150" y="115" fill="#4ade80">Chloroplast (Grana)</text>
              <line x1="210" y1="120" x2="230" y2="125" stroke="#4ade80" strokeWidth="1.2" strokeDasharray="3 2" />

              {/* Peripheral Nucleus */}
              <text x="610" y="150" fill="#c084fc">Peripheral Nucleus</text>
              <line x1="600" y1="155" x2="575" y2="170" stroke="#c084fc" strokeWidth="1.2" strokeDasharray="3 2" />
            </g>
          )}
        </svg>
      ) : (
        /* COMPARISON MATRIX VIEW: PLANT VS ANIMAL CELL */
        <div style={{ padding: '2rem 1.5rem', maxHeight: '100%', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#10b981', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} />
            Diagnostic Comparison: Plant Cell vs. Animal Cell
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Key anatomical and physiological distinctions tested in board and medical entrance examinations.
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.05)', textAlign: 'left', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Feature / Organelle</th>
                  <th style={{ padding: '0.75rem 1rem', color: '#10b981' }}>Plant Cell</th>
                  <th style={{ padding: '0.75rem 1rem', color: '#00f2fe' }}>Animal Cell</th>
                  <th style={{ padding: '0.75rem 1rem', color: '#f59e0b' }}>Exam Significance</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Cell Wall</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#34d399' }}><Check size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> Present (Cellulose & Pectin)</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#f87171' }}><X size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> Absent (Plasma membrane only)</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>Prevents osmotic bursting in hypotonic water</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Chloroplasts & Plastids</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#34d399' }}><Check size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> Present (Photosynthesis)</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#f87171' }}><X size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> Absent (Heterotrophic)</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>Light & dark reactions produce sugar</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Vacuoles</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#34d399' }}>One Giant Central Vacuole (Tonoplast, 80% vol)</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>Small, numerous, temporary vesicles</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>Maintains hydrostatic turgor pressure</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Centrioles / Centrosomes</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#f87171' }}><X size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> Absent in higher plants</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#00f2fe' }}><Check size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> Present (Organizes mitotic aster)</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>Plants form anastral mitotic spindle</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Cytokinesis Mechanism</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#34d399' }}>Cell Plate (Phragmoplast) from center outward</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#00f2fe' }}>Cleavage Furrow (Actin ring) from outside inward</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>Rigid wall prevents furrow pinching</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
