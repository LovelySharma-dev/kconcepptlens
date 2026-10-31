import React from 'react';

interface Dna2DCanvasProps {
  selectedComponentId: string | null;
  onSelectComponent: (id: string) => void;
  showLabels?: boolean;
}

export const Dna2DCanvas: React.FC<Dna2DCanvasProps> = ({
  selectedComponentId,
  onSelectComponent,
  showLabels = true
}) => {
  const isBackboneSelected = selectedComponentId === 'sugar_phosphate_backbone';
  const isAtSelected = selectedComponentId === 'adenine_thymine_pair';
  const isGcSelected = selectedComponentId === 'guanine_cytosine_pair';
  const isGroovesSelected = selectedComponentId === 'major_minor_grooves';

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '440px',
        background: 'radial-gradient(circle at center, #0e172a 0%, #070b14 100%)',
        borderRadius: '12px',
        overflow: 'hidden'
      }}
    >
      <svg
        viewBox="0 0 800 500"
        style={{ width: '100%', height: '100%', display: 'block' }}
        role="img"
        aria-label="Interactive 2D DNA Double Helix Diagram with Watson-Crick Base Pairs"
      >
        <defs>
          <filter id="dnaGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <linearGradient id="backboneLeftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          <linearGradient id="backboneRightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>

          {/* Markers for Antiparallel Polarity */}
          <marker id="arrowUp" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
          </marker>
          <marker id="arrowDown" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
          </marker>
        </defs>

        {/* Major and Minor Groove Region Highlights */}
        <g
          tabIndex={0}
          role="button"
          aria-label="Major and Minor Grooves (Helical indentations enabling protein sequence recognition)"
          style={{ cursor: 'pointer' }}
          onClick={() => onSelectComponent('major_minor_grooves')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectComponent('major_minor_grooves');
            }
          }}
        >
          {/* Major Groove region (wider span, ~22Å) */}
          <rect
            x="240"
            y="120"
            width="320"
            height="130"
            rx="10"
            fill={isGroovesSelected ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.05)'}
            stroke={isGroovesSelected ? '#f59e0b' : 'rgba(245, 158, 11, 0.25)'}
            strokeWidth={isGroovesSelected ? '2' : '1'}
            strokeDasharray="6 4"
          />
          {/* Minor Groove region (narrower span, ~12Å) */}
          <rect
            x="270"
            y="265"
            width="260"
            height="90"
            rx="10"
            fill={isGroovesSelected ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.05)'}
            stroke={isGroovesSelected ? '#f59e0b' : 'rgba(245, 158, 11, 0.25)'}
            strokeWidth={isGroovesSelected ? '2' : '1'}
            strokeDasharray="6 4"
          />
        </g>

        {/* 1. Base-Pair Rungs (Horizontal Bridges) */}
        {/* Rung 1: A = T (y: 80) */}
        <g
          tabIndex={0}
          role="button"
          aria-label="Adenine-Thymine Base Pair with 2 Hydrogen Bonds"
          style={{ cursor: 'pointer' }}
          onClick={() => onSelectComponent('adenine_thymine_pair')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectComponent('adenine_thymine_pair');
            }
          }}
          filter={isAtSelected ? 'url(#dnaGlow)' : undefined}
        >
          <rect x="320" y="70" width="75" height="20" rx="4" fill="#10b981" />
          <text x="357" y="85" textAnchor="middle" fill="#020617" fontSize="11" fontWeight="700">A</text>
          {/* 2 Hydrogen bonds */}
          <line x1="395" y1="76" x2="405" y2="76" stroke="#f8fafc" strokeWidth="2.5" strokeDasharray="2 2" />
          <line x1="395" y1="84" x2="405" y2="84" stroke="#f8fafc" strokeWidth="2.5" strokeDasharray="2 2" />
          <rect x="405" y="70" width="75" height="20" rx="4" fill="#f59e0b" />
          <text x="442" y="85" textAnchor="middle" fill="#020617" fontSize="11" fontWeight="700">T</text>
        </g>

        {/* Rung 2: G ≡ C (y: 125) */}
        <g
          tabIndex={0}
          role="button"
          aria-label="Guanine-Cytosine Base Pair with 3 Hydrogen Bonds"
          style={{ cursor: 'pointer' }}
          onClick={() => onSelectComponent('guanine_cytosine_pair')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectComponent('guanine_cytosine_pair');
            }
          }}
          filter={isGcSelected ? 'url(#dnaGlow)' : undefined}
        >
          <rect x="290" y="115" width="105" height="20" rx="4" fill="#8b5cf6" />
          <text x="342" y="130" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="700">G</text>
          {/* 3 Hydrogen bonds */}
          <line x1="395" y1="120" x2="405" y2="120" stroke="#f8fafc" strokeWidth="2" strokeDasharray="2 2" />
          <line x1="395" y1="125" x2="405" y2="125" stroke="#f8fafc" strokeWidth="2" strokeDasharray="2 2" />
          <line x1="395" y1="130" x2="405" y2="130" stroke="#f8fafc" strokeWidth="2" strokeDasharray="2 2" />
          <rect x="405" y="115" width="105" height="20" rx="4" fill="#38bdf8" />
          <text x="457" y="130" textAnchor="middle" fill="#020617" fontSize="11" fontWeight="700">C</text>
        </g>

        {/* Rung 3: A = T (y: 175) */}
        <g
          tabIndex={0}
          role="button"
          aria-label="Thymine-Adenine Base Pair with 2 Hydrogen Bonds"
          style={{ cursor: 'pointer' }}
          onClick={() => onSelectComponent('adenine_thymine_pair')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectComponent('adenine_thymine_pair');
            }
          }}
          filter={isAtSelected ? 'url(#dnaGlow)' : undefined}
        >
          <rect x="270" y="165" width="125" height="20" rx="4" fill="#f59e0b" />
          <text x="332" y="180" textAnchor="middle" fill="#020617" fontSize="11" fontWeight="700">T</text>
          <line x1="395" y1="171" x2="405" y2="171" stroke="#f8fafc" strokeWidth="2.5" strokeDasharray="2 2" />
          <line x1="395" y1="179" x2="405" y2="179" stroke="#f8fafc" strokeWidth="2.5" strokeDasharray="2 2" />
          <rect x="405" y="165" width="125" height="20" rx="4" fill="#10b981" />
          <text x="467" y="180" textAnchor="middle" fill="#020617" fontSize="11" fontWeight="700">A</text>
        </g>

        {/* Rung 4: G ≡ C (y: 225) */}
        <g
          tabIndex={0}
          role="button"
          aria-label="Cytosine-Guanine Base Pair with 3 Hydrogen Bonds"
          style={{ cursor: 'pointer' }}
          onClick={() => onSelectComponent('guanine_cytosine_pair')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectComponent('guanine_cytosine_pair');
            }
          }}
          filter={isGcSelected ? 'url(#dnaGlow)' : undefined}
        >
          <rect x="290" y="215" width="105" height="20" rx="4" fill="#38bdf8" />
          <text x="342" y="230" textAnchor="middle" fill="#020617" fontSize="11" fontWeight="700">C</text>
          <line x1="395" y1="220" x2="405" y2="220" stroke="#f8fafc" strokeWidth="2" strokeDasharray="2 2" />
          <line x1="395" y1="225" x2="405" y2="225" stroke="#f8fafc" strokeWidth="2" strokeDasharray="2 2" />
          <line x1="395" y1="230" x2="405" y2="230" stroke="#f8fafc" strokeWidth="2" strokeDasharray="2 2" />
          <rect x="405" y="215" width="105" height="20" rx="4" fill="#8b5cf6" />
          <text x="457" y="230" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="700">G</text>
        </g>

        {/* Rung 5: A = T (y: 275) */}
        <g
          tabIndex={0}
          role="button"
          aria-label="Adenine-Thymine Base Pair with 2 Hydrogen Bonds"
          style={{ cursor: 'pointer' }}
          onClick={() => onSelectComponent('adenine_thymine_pair')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectComponent('adenine_thymine_pair');
            }
          }}
          filter={isAtSelected ? 'url(#dnaGlow)' : undefined}
        >
          <rect x="330" y="265" width="65" height="20" rx="4" fill="#10b981" />
          <text x="362" y="280" textAnchor="middle" fill="#020617" fontSize="11" fontWeight="700">A</text>
          <line x1="395" y1="271" x2="405" y2="271" stroke="#f8fafc" strokeWidth="2.5" strokeDasharray="2 2" />
          <line x1="395" y1="279" x2="405" y2="279" stroke="#f8fafc" strokeWidth="2.5" strokeDasharray="2 2" />
          <rect x="405" y="265" width="65" height="20" rx="4" fill="#f59e0b" />
          <text x="437" y="280" textAnchor="middle" fill="#020617" fontSize="11" fontWeight="700">T</text>
        </g>

        {/* Rung 6: G ≡ C (y: 325) */}
        <g
          tabIndex={0}
          role="button"
          aria-label="Guanine-Cytosine Base Pair with 3 Hydrogen Bonds"
          style={{ cursor: 'pointer' }}
          onClick={() => onSelectComponent('guanine_cytosine_pair')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectComponent('guanine_cytosine_pair');
            }
          }}
          filter={isGcSelected ? 'url(#dnaGlow)' : undefined}
        >
          <rect x="300" y="315" width="95" height="20" rx="4" fill="#8b5cf6" />
          <text x="347" y="330" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="700">G</text>
          <line x1="395" y1="320" x2="405" y2="320" stroke="#f8fafc" strokeWidth="2" strokeDasharray="2 2" />
          <line x1="395" y1="325" x2="405" y2="325" stroke="#f8fafc" strokeWidth="2" strokeDasharray="2 2" />
          <line x1="395" y1="330" x2="405" y2="330" stroke="#f8fafc" strokeWidth="2" strokeDasharray="2 2" />
          <rect x="405" y="315" width="95" height="20" rx="4" fill="#38bdf8" />
          <text x="452" y="330" textAnchor="middle" fill="#020617" fontSize="11" fontWeight="700">C</text>
        </g>

        {/* Rung 7: A = T (y: 375) */}
        <g
          tabIndex={0}
          role="button"
          aria-label="Thymine-Adenine Base Pair with 2 Hydrogen Bonds"
          style={{ cursor: 'pointer' }}
          onClick={() => onSelectComponent('adenine_thymine_pair')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectComponent('adenine_thymine_pair');
            }
          }}
          filter={isAtSelected ? 'url(#dnaGlow)' : undefined}
        >
          <rect x="270" y="365" width="125" height="20" rx="4" fill="#f59e0b" />
          <text x="332" y="380" textAnchor="middle" fill="#020617" fontSize="11" fontWeight="700">T</text>
          <line x1="395" y1="371" x2="405" y2="371" stroke="#f8fafc" strokeWidth="2.5" strokeDasharray="2 2" />
          <line x1="395" y1="379" x2="405" y2="379" stroke="#f8fafc" strokeWidth="2.5" strokeDasharray="2 2" />
          <rect x="405" y="365" width="125" height="20" rx="4" fill="#10b981" />
          <text x="467" y="380" textAnchor="middle" fill="#020617" fontSize="11" fontWeight="700">A</text>
        </g>

        {/* Rung 8: G ≡ C (y: 425) */}
        <g
          tabIndex={0}
          role="button"
          aria-label="Guanine-Cytosine Base Pair with 3 Hydrogen Bonds"
          style={{ cursor: 'pointer' }}
          onClick={() => onSelectComponent('guanine_cytosine_pair')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectComponent('guanine_cytosine_pair');
            }
          }}
          filter={isGcSelected ? 'url(#dnaGlow)' : undefined}
        >
          <rect x="300" y="415" width="95" height="20" rx="4" fill="#8b5cf6" />
          <text x="347" y="430" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="700">G</text>
          <line x1="395" y1="420" x2="405" y2="420" stroke="#f8fafc" strokeWidth="2" strokeDasharray="2 2" />
          <line x1="395" y1="425" x2="405" y2="425" stroke="#f8fafc" strokeWidth="2" strokeDasharray="2 2" />
          <line x1="395" y1="430" x2="405" y2="430" stroke="#f8fafc" strokeWidth="2" strokeDasharray="2 2" />
          <rect x="405" y="415" width="95" height="20" rx="4" fill="#38bdf8" />
          <text x="452" y="430" textAnchor="middle" fill="#020617" fontSize="11" fontWeight="700">C</text>
        </g>

        {/* 2. Antiparallel Sugar-Phosphate Backbones (Helical sine wave paths) */}
        <g
          tabIndex={0}
          role="button"
          aria-label="Antiparallel Sugar-Phosphate Backbones (5' to 3' and 3' to 5')"
          style={{ cursor: 'pointer' }}
          onClick={() => onSelectComponent('sugar_phosphate_backbone')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectComponent('sugar_phosphate_backbone');
            }
          }}
          filter={isBackboneSelected ? 'url(#dnaGlow)' : undefined}
        >
          {/* Left Strand (Strand 1: 5' -> 3') */}
          <path
            d="M 320 60 C 240 130, 240 200, 320 250 C 400 300, 400 370, 300 450"
            fill="none"
            stroke="url(#backboneLeftGrad)"
            strokeWidth={isBackboneSelected ? '9' : '6'}
            strokeLinecap="round"
          />

          {/* Right Strand (Strand 2: 3' -> 5') */}
          <path
            d="M 480 60 C 560 130, 560 200, 480 250 C 400 300, 400 370, 500 450"
            fill="none"
            stroke="url(#backboneRightGrad)"
            strokeWidth={isBackboneSelected ? '9' : '6'}
            strokeLinecap="round"
          />

          {/* Directional Polarity Markers */}
          <text x="300" y="45" fill="#38bdf8" fontSize="13" fontWeight="800">5&apos; End</text>
          <text x="500" y="45" fill="#38bdf8" fontSize="13" fontWeight="800">3&apos; End</text>
          <text x="280" y="475" fill="#38bdf8" fontSize="13" fontWeight="800">3&apos; End</text>
          <text x="500" y="475" fill="#38bdf8" fontSize="13" fontWeight="800">5&apos; End</text>
        </g>

        {/* 3. Labels & Overlay Annotations */}
        {showLabels && (
          <g style={{ pointerEvents: 'none' }}>
            {/* Sugar-Phosphate Label */}
            <g opacity={isBackboneSelected ? 1 : 0.85}>
              <rect x="30" y="70" width="200" height="36" rx="6" fill="rgba(7, 11, 20, 0.85)" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="42" y="93" fill="#38bdf8" fontSize="12" fontWeight="700">Sugar-Phosphate Backbone</text>
              <line x1="230" y1="88" x2="310" y2="80" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" />
            </g>

            {/* A = T Pair Label */}
            <g opacity={isAtSelected ? 1 : 0.85}>
              <rect x="560" y="155" width="205" height="36" rx="6" fill="rgba(7, 11, 20, 0.85)" stroke="#10b981" strokeWidth="1.5" />
              <text x="572" y="178" fill="#34d399" fontSize="12" fontWeight="700">A = T (2 Hydrogen Bonds)</text>
              <line x1="560" y1="173" x2="530" y2="175" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" />
            </g>

            {/* G ≡ C Pair Label */}
            <g opacity={isGcSelected ? 1 : 0.85}>
              <rect x="560" y="210" width="205" height="36" rx="6" fill="rgba(7, 11, 20, 0.85)" stroke="#8b5cf6" strokeWidth="1.5" />
              <text x="572" y="233" fill="#c084fc" fontSize="12" fontWeight="700">G ≡ C (3 Hydrogen Bonds)</text>
              <line x1="560" y1="228" x2="510" y2="225" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="3 3" />
            </g>

            {/* Major & Minor Grooves Label */}
            <g opacity={isGroovesSelected ? 1 : 0.85}>
              <rect x="30" y="195" width="190" height="50" rx="6" fill="rgba(7, 11, 20, 0.85)" stroke="#f59e0b" strokeWidth="1.5" />
              <text x="42" y="218" fill="#fbbf24" fontSize="12" fontWeight="700">Major &amp; Minor Grooves</text>
              <text x="42" y="235" fill="var(--text-muted)" fontSize="10">Allows protein sequence read</text>
              <line x1="220" y1="220" x2="250" y2="190" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />
            </g>
          </g>
        )}
      </svg>

      {/* Legend Footer */}
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '12px',
          background: 'var(--surface-card)',
          backdropFilter: 'blur(8px)',
          padding: '0.4rem 0.75rem',
          borderRadius: '8px',
          border: '1px solid var(--border-medium)',
          display: 'flex',
          gap: '0.75rem',
          fontSize: '0.72rem',
          pointerEvents: 'none'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent-mint)', fontWeight: 600 }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-mint)' }} />
          Adenine (A)
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent-amber)', fontWeight: 600 }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-amber)' }} />
          Thymine (T)
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent-violet)', fontWeight: 600 }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-violet)' }} />
          Guanine (G)
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-cyan)' }} />
          Cytosine (C)
        </span>
      </div>
    </div>
  );
};

export default Dna2DCanvas;
