import React from 'react';

interface Cell2DCanvasProps {
  selectedComponentId: string | null;
  onSelectComponent: (id: string) => void;
  showLabels?: boolean;
}

export const Cell2DCanvas: React.FC<Cell2DCanvasProps> = ({
  selectedComponentId,
  onSelectComponent,
  showLabels = true
}) => {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '440px', background: 'radial-gradient(circle at center, #0e172a 0%, #070b14 100%)', borderRadius: '12px', overflow: 'hidden' }}>
      <svg
        viewBox="0 0 800 500"
        style={{ width: '100%', height: '100%', display: 'block' }}
        role="img"
        aria-label="Interactive 2D Animal Cell Diagram"
      >
        <defs>
          {/* Gradients */}
          <radialGradient id="membraneGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e293b" stopOpacity="0.4" />
            <stop offset="85%" stopColor="#0f172a" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#00f2fe" stopOpacity="0.9" />
          </radialGradient>

          <radialGradient id="nucleusGrad" cx="45%" cy="45%" r="50%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="60%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#4c1d95" />
          </radialGradient>

          <radialGradient id="nucleolusGrad" cx="40%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#e879f9" />
            <stop offset="100%" stopColor="#a855f7" />
          </radialGradient>

          <linearGradient id="mitoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          <linearGradient id="golgiGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>

          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Cytoplasm Gel Area */}
        <ellipse
          cx="400"
          cy="250"
          rx="240"
          ry="190"
          fill="url(#membraneGrad)"
          style={{ cursor: 'pointer' }}
          onClick={() => onSelectComponent('cytoplasm')}
        />

        {/* 2. Plasma Membrane Border */}
        <ellipse
          cx="400"
          cy="250"
          rx="240"
          ry="190"
          fill="none"
          stroke={selectedComponentId === 'cell_membrane' ? '#00f2fe' : 'rgba(56, 189, 248, 0.6)'}
          strokeWidth={selectedComponentId === 'cell_membrane' ? '6' : '3.5'}
          strokeDasharray={selectedComponentId === 'cell_membrane' ? '8 4' : 'none'}
          filter={selectedComponentId === 'cell_membrane' ? 'url(#glow)' : undefined}
          style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
          onClick={() => onSelectComponent('cell_membrane')}
        />

        {/* 3. Rough & Smooth Endoplasmic Reticulum folds */}
        <g
          style={{ cursor: 'pointer' }}
          onClick={() => onSelectComponent('endoplasmic_reticulum')}
          filter={selectedComponentId === 'endoplasmic_reticulum' ? 'url(#glow)' : undefined}
        >
          {/* Fold 1 */}
          <path
            d="M 330 310 Q 370 360 420 350 T 480 320"
            fill="none"
            stroke="#10b981"
            strokeWidth={selectedComponentId === 'endoplasmic_reticulum' ? '14' : '10'}
            strokeLinecap="round"
            opacity="0.85"
          />
          {/* Fold 2 */}
          <path
            d="M 310 335 Q 360 385 430 375 T 500 345"
            fill="none"
            stroke="#059669"
            strokeWidth={selectedComponentId === 'endoplasmic_reticulum' ? '12' : '8'}
            strokeLinecap="round"
            opacity="0.75"
          />
          {/* Ribosome studs on RER */}
          {[340, 365, 390, 420, 450, 470].map((rx, idx) => (
            <circle key={idx} cx={rx} cy={315 + (idx % 2) * 20} r="2.5" fill="#38bdf8" />
          ))}
        </g>

        {/* 4. Nucleus & Nucleolus */}
        <g
          style={{ cursor: 'pointer' }}
          onClick={() => onSelectComponent('nucleus')}
          filter={selectedComponentId === 'nucleus' ? 'url(#glow)' : undefined}
        >
          {/* Outer Nuclear Envelope */}
          <circle
            cx="400"
            cy="240"
            r="68"
            fill="url(#nucleusGrad)"
            stroke={selectedComponentId === 'nucleus' ? '#c084fc' : '#a855f7'}
            strokeWidth={selectedComponentId === 'nucleus' ? '5' : '3'}
            strokeDasharray="12 4" // Represents nuclear pores
          />
          {/* Chromatin strands */}
          <path
            d="M 365 220 Q 390 205 410 225 T 435 240"
            fill="none"
            stroke="rgba(255, 255, 255, 0.4)"
            strokeWidth="2"
          />
          <path
            d="M 370 260 Q 400 270 420 250"
            fill="none"
            stroke="rgba(255, 255, 255, 0.35)"
            strokeWidth="2"
          />
          {/* Inner Nucleolus */}
          <circle cx="415" cy="235" r="22" fill="url(#nucleolusGrad)" />
        </g>

        {/* 5. Mitochondria (Multiple organelles) */}
        <g
          style={{ cursor: 'pointer' }}
          onClick={() => onSelectComponent('mitochondria')}
          filter={selectedComponentId === 'mitochondria' ? 'url(#glow)' : undefined}
        >
          {/* Mitochondrion 1 (Left) */}
          <g transform="translate(260, 190) rotate(-25)">
            <rect
              x="-35"
              y="-18"
              width="70"
              height="36"
              rx="18"
              fill="url(#mitoGrad)"
              stroke={selectedComponentId === 'mitochondria' ? '#fde047' : '#d97706'}
              strokeWidth={selectedComponentId === 'mitochondria' ? '3' : '1.5'}
            />
            {/* Cristae folds */}
            <path d="M -22 -10 L -22 10 M -10 -12 L -10 12 M 2 -12 L 2 12 M 14 -10 L 14 10" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* Mitochondrion 2 (Bottom Right) */}
          <g transform="translate(540, 310) rotate(35)">
            <rect
              x="-32"
              y="-16"
              width="64"
              height="32"
              rx="16"
              fill="url(#mitoGrad)"
              stroke={selectedComponentId === 'mitochondria' ? '#fde047' : '#d97706'}
              strokeWidth={selectedComponentId === 'mitochondria' ? '3' : '1.5'}
            />
            <path d="M -18 -8 L -18 8 M -7 -10 L -7 10 M 4 -10 L 4 10 M 15 -8 L 15 8" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* Mitochondrion 3 (Top Right) */}
          <g transform="translate(510, 160) rotate(-15)">
            <rect
              x="-28"
              y="-14"
              width="56"
              height="28"
              rx="14"
              fill="url(#mitoGrad)"
              stroke={selectedComponentId === 'mitochondria' ? '#fde047' : '#d97706'}
              strokeWidth={selectedComponentId === 'mitochondria' ? '3' : '1.5'}
            />
            <path d="M -14 -6 L -14 6 M -4 -8 L -4 8 M 6 -8 L 6 8 M 14 -6 L 14 6" stroke="#78350f" strokeWidth="1.8" strokeLinecap="round" />
          </g>
        </g>

        {/* 6. Golgi Apparatus (Cisternae stack + vesicles) */}
        <g
          style={{ cursor: 'pointer' }}
          onClick={() => onSelectComponent('golgi_apparatus')}
          filter={selectedComponentId === 'golgi_apparatus' ? 'url(#glow)' : undefined}
          transform="translate(260, 300) rotate(15)"
        >
          <path d="M -30 -12 Q 0 -5 30 -12" fill="none" stroke="url(#golgiGrad)" strokeWidth={selectedComponentId === 'golgi_apparatus' ? '7' : '5'} strokeLinecap="round" />
          <path d="M -35 0 Q 0 8 35 0" fill="none" stroke="url(#golgiGrad)" strokeWidth={selectedComponentId === 'golgi_apparatus' ? '7' : '5'} strokeLinecap="round" />
          <path d="M -30 12 Q 0 20 30 12" fill="none" stroke="url(#golgiGrad)" strokeWidth={selectedComponentId === 'golgi_apparatus' ? '7' : '5'} strokeLinecap="round" />
          {/* Transport vesicles */}
          <circle cx="42" cy="-8" r="4.5" fill="#f472b6" />
          <circle cx="-42" cy="6" r="4" fill="#f472b6" />
          <circle cx="36" cy="18" r="5" fill="#f472b6" />
        </g>

        {/* 7. Lysosomes (Enzyme spheres) */}
        <g
          style={{ cursor: 'pointer' }}
          onClick={() => onSelectComponent('lysosomes')}
          filter={selectedComponentId === 'lysosomes' ? 'url(#glow)' : undefined}
        >
          <circle cx="310" cy="140" r="14" fill="#ef4444" stroke={selectedComponentId === 'lysosomes' ? '#fca5a5' : '#b91c1c'} strokeWidth="2.5" />
          <circle cx="475" cy="120" r="12" fill="#ef4444" stroke={selectedComponentId === 'lysosomes' ? '#fca5a5' : '#b91c1c'} strokeWidth="2" />
          <circle cx="490" cy="380" r="15" fill="#ef4444" stroke={selectedComponentId === 'lysosomes' ? '#fca5a5' : '#b91c1c'} strokeWidth="2.5" />
        </g>

        {/* 8. Free Ribosomes */}
        <g
          style={{ cursor: 'pointer' }}
          onClick={() => onSelectComponent('ribosomes')}
        >
          {[
            [230, 260], [270, 240], [330, 180], [350, 160],
            [460, 170], [480, 190], [530, 220], [550, 250],
            [350, 370], [380, 390], [420, 395], [460, 370]
          ].map(([rx, ry], idx) => (
            <circle key={idx} cx={rx} cy={ry} r="3" fill="#38bdf8" />
          ))}
        </g>

        {/* Labels Overlay */}
        {showLabels && (
          <g style={{ pointerEvents: 'none', userSelect: 'none', fontSize: '11px', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
            {/* Cell Membrane */}
            <text x="650" y="220" fill="#00f2fe">Plasma Membrane</text>
            <line x1="640" y1="216" x2="620" y2="230" stroke="#00f2fe" strokeWidth="1.2" strokeDasharray="3 2" />

            {/* Nucleus */}
            <text x="400" y="160" fill="#c084fc" textAnchor="middle">Nucleus & Nucleolus</text>
            <line x1="400" y1="165" x2="400" y2="185" stroke="#c084fc" strokeWidth="1.2" strokeDasharray="3 2" />

            {/* Mitochondria */}
            <text x="175" y="180" fill="#fbbf24">Mitochondrion</text>
            <line x1="225" y1="180" x2="245" y2="185" stroke="#fbbf24" strokeWidth="1.2" strokeDasharray="3 2" />

            {/* Golgi */}
            <text x="180" y="325" fill="#f472b6">Golgi Apparatus</text>
            <line x1="235" y1="320" x2="250" y2="310" stroke="#f472b6" strokeWidth="1.2" strokeDasharray="3 2" />

            {/* Endoplasmic Reticulum */}
            <text x="400" y="420" fill="#34d399" textAnchor="middle">Endoplasmic Reticulum</text>
            <line x1="400" y1="408" x2="400" y2="385" stroke="#34d399" strokeWidth="1.2" strokeDasharray="3 2" />

            {/* Lysosome */}
            <text x="260" y="125" fill="#f87171">Lysosome</text>
            <line x1="290" y1="125" x2="305" y2="135" stroke="#f87171" strokeWidth="1.2" strokeDasharray="3 2" />
          </g>
        )}
      </svg>
    </div>
  );
};
