import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Zap } from 'lucide-react';

interface Neuron2DCanvasProps {
  selectedComponentId: string | null;
  onSelectComponent: (id: string) => void;
  showLabels?: boolean;
}

export const Neuron2DCanvas: React.FC<Neuron2DCanvasProps> = ({
  selectedComponentId,
  onSelectComponent,
  showLabels = true
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [signalPos, setSignalPos] = useState(0); // 0 to 100%
  const [membraneVoltage, setMembraneVoltage] = useState(-70);

  useEffect(() => {
    let animId: number;
    const loop = () => {
      if (isPlaying) {
        setSignalPos((prev) => {
          const next = (prev + 0.65) % 100;
          // Calculate realistic membrane potential curve along the journey
          if (next < 25) {
            // Dendrites & Soma: Graded EPSP (-70mV to -55mV)
            setMembraneVoltage(Math.round(-70 + (next / 25) * 15));
          } else if (next >= 25 && next < 40) {
            // Axon Hillock: Rapid Na+ depolarization (-55mV to +30mV)
            setMembraneVoltage(Math.round(-55 + ((next - 25) / 15) * 85));
          } else if (next >= 40 && next < 80) {
            // Saltatory Conduction along nodes
            const nodeOscillation = Math.sin((next - 40) * 0.8) * 15;
            setMembraneVoltage(Math.round(20 + nodeOscillation));
          } else {
            // Terminal repolarization & hyperpolarization (-75mV -> -70mV)
            setMembraneVoltage(Math.round(-70 - (100 - next) * 0.25));
          }
          return next;
        });
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  const handleReset = () => {
    setSignalPos(0);
    setMembraneVoltage(-70);
    setIsPlaying(true);
  };

  // Convert percentage signalPos to SVG (x, y) coordinates
  const getSignalCoordinates = (pct: number) => {
    if (pct < 20) {
      // Moving from dendrites into soma
      return { x: 120 + pct * 5.5, y: 220 + Math.sin(pct * 0.5) * 15 };
    } else if (pct < 35) {
      // Crossing soma into axon hillock
      return { x: 230 + (pct - 20) * 5.3, y: 220 };
    } else if (pct < 85) {
      // Hopping along myelinated axon (saltatory jump)
      const x = 310 + (pct - 35) * 8.6;
      const hop = Math.abs(Math.sin((pct - 35) * 0.6)) * 12;
      return { x, y: 220 - hop };
    } else {
      // Terminal exocytosis
      return { x: 740 + (pct - 85) * 1.5, y: 220 + (pct % 2 === 0 ? 10 : -10) };
    }
  };

  const signalCoord = getSignalCoordinates(signalPos);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '440px', background: 'radial-gradient(circle at center, #0e172a 0%, #070b14 100%)', borderRadius: '12px', overflow: 'hidden' }}>
      {/* Top Floating Control Bar */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          display: 'flex',
          gap: '0.4rem',
          background: 'rgba(7, 11, 20, 0.75)',
          backdropFilter: 'blur(8px)',
          padding: '0.35rem 0.6rem',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          zIndex: 10
        }}
      >
        <button
          type="button"
          className={`icon-btn-sm ${isPlaying ? 'active' : ''}`}
          onClick={() => setIsPlaying((p) => !p)}
          title={isPlaying ? 'Pause Impulse' : 'Resume Impulse'}
          aria-label={isPlaying ? 'Pause Impulse' : 'Resume Impulse'}
        >
          {isPlaying ? <Pause size={15} /> : <Play size={15} />}
        </button>
        <button
          type="button"
          className="icon-btn-sm"
          onClick={handleReset}
          title="Reset Action Potential"
          aria-label="Reset Action Potential"
        >
          <RotateCcw size={15} />
        </button>
      </div>

      <svg
        viewBox="0 0 820 480"
        style={{ width: '100%', height: '100%', display: 'block' }}
        role="img"
        aria-label="Interactive Multipolar Neuron Diagram"
      >
        <defs>
          <radialGradient id="somaGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="70%" stopColor="#6d28d9" />
            <stop offset="100%" stopColor="#4c1d95" />
          </radialGradient>

          <filter id="neuronGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Dendritic Tree */}
        <g
          style={{ cursor: 'pointer' }}
          onClick={() => onSelectComponent('dendrites')}
          filter={selectedComponentId === 'dendrites' ? 'url(#neuronGlow)' : undefined}
        >
          {/* Main dendritic trunks */}
          <path d="M 210 190 Q 160 140 100 120" stroke="#38bdf8" strokeWidth={selectedComponentId === 'dendrites' ? '7' : '5'} fill="none" strokeLinecap="round" />
          <path d="M 200 220 Q 140 220 80 200" stroke="#38bdf8" strokeWidth={selectedComponentId === 'dendrites' ? '7' : '5'} fill="none" strokeLinecap="round" />
          <path d="M 210 250 Q 150 300 90 320" stroke="#38bdf8" strokeWidth={selectedComponentId === 'dendrites' ? '7' : '5'} fill="none" strokeLinecap="round" />
          {/* Finer dendritic spines */}
          <path d="M 140 150 L 110 170 M 130 135 L 145 105" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 120 215 L 90 235 M 130 290 L 115 315" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* 2. Soma (Cell Body & Nucleus) */}
        <g
          style={{ cursor: 'pointer' }}
          onClick={() => onSelectComponent('soma')}
          filter={selectedComponentId === 'soma' ? 'url(#neuronGlow)' : undefined}
        >
          <polygon
            points="220,170 260,185 270,220 260,255 220,270 190,240 190,200"
            fill="url(#somaGrad)"
            stroke={selectedComponentId === 'soma' ? '#c084fc' : '#a855f7'}
            strokeWidth={selectedComponentId === 'soma' ? '4' : '2'}
          />
          {/* Nucleus */}
          <circle cx="230" cy="220" r="16" fill="#a855f7" stroke="#ffffff" strokeWidth="1.5" />
          {/* Nucleolus */}
          <circle cx="234" cy="218" r="5" fill="#f472b6" />
          {/* Nissl Granules */}
          {[195, 210, 245, 255].map((gx, i) => (
            <circle key={i} cx={gx} cy={200 + i * 10} r="2.5" fill="#e9d5ff" opacity="0.8" />
          ))}
        </g>

        {/* 3. Axon Hillock (Trigger Zone) */}
        <g
          style={{ cursor: 'pointer' }}
          onClick={() => onSelectComponent('axon_hillock')}
          filter={selectedComponentId === 'axon_hillock' ? 'url(#neuronGlow)' : undefined}
        >
          <polygon
            points="270,205 310,215 310,225 270,235"
            fill="#f59e0b"
            stroke={selectedComponentId === 'axon_hillock' ? '#fde047' : '#d97706'}
            strokeWidth={selectedComponentId === 'axon_hillock' ? '3' : '1.5'}
          />
        </g>

        {/* 4. Central Axon Core Wire */}
        <line x1="310" y1="220" x2="730" y2="220" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" />

        {/* 5. Myelin Sheaths & Nodes of Ranvier */}
        <g
          style={{ cursor: 'pointer' }}
          onClick={() => onSelectComponent('axon_and_myelin')}
          filter={selectedComponentId === 'axon_and_myelin' ? 'url(#neuronGlow)' : undefined}
        >
          {[0, 1, 2, 3, 4].map((sIndex) => {
            const startX = 325 + sIndex * 80;
            return (
              <g key={sIndex}>
                {/* Schwann Cell Myelin Cushion */}
                <rect
                  x={startX}
                  y="204"
                  width="65"
                  height="32"
                  rx="10"
                  fill="rgba(16, 185, 129, 0.35)"
                  stroke={selectedComponentId === 'axon_and_myelin' ? '#34d399' : '#10b981'}
                  strokeWidth={selectedComponentId === 'axon_and_myelin' ? '3' : '1.8'}
                />
                {/* Schwann Cell Nucleus */}
                <ellipse cx={startX + 32} cy="210" rx="6" ry="3.5" fill="#047857" />

                {/* Node of Ranvier Gap Indicator (unmyelinated) */}
                {sIndex < 4 && (
                  <circle cx={startX + 72} cy="220" r="3" fill="#fbbf24">
                    <title>Node of Ranvier</title>
                  </circle>
                )}
              </g>
            );
          })}
        </g>

        {/* 6. Axon Terminals & Synaptic Boutons */}
        <g
          style={{ cursor: 'pointer' }}
          onClick={() => onSelectComponent('axon_terminals')}
          filter={selectedComponentId === 'axon_terminals' ? 'url(#neuronGlow)' : undefined}
        >
          <path d="M 725 220 Q 750 180 775 160" stroke="#f43f5e" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M 725 220 L 780 220" stroke="#f43f5e" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M 725 220 Q 750 260 775 280" stroke="#f43f5e" strokeWidth="4" fill="none" strokeLinecap="round" />

          {/* Bouton Knobs */}
          <circle cx="775" cy="160" r="7" fill="#f43f5e" stroke="#fda4af" strokeWidth="1.5" />
          <circle cx="780" cy="220" r="7" fill="#f43f5e" stroke="#fda4af" strokeWidth="1.5" />
          <circle cx="775" cy="280" r="7" fill="#f43f5e" stroke="#fda4af" strokeWidth="1.5" />

          {/* Neurotransmitter droplets */}
          <circle cx="792" cy="158" r="2.5" fill="#fbbf24" />
          <circle cx="798" cy="220" r="2.5" fill="#fbbf24" />
          <circle cx="792" cy="282" r="2.5" fill="#fbbf24" />
        </g>

        {/* 7. Traveling Action Potential Pulse */}
        {isPlaying && (
          <g transform={`translate(${signalCoord.x}, ${signalCoord.y})`} style={{ pointerEvents: 'none' }}>
            <circle r="12" fill="rgba(245, 158, 11, 0.4)" filter="url(#neuronGlow)" />
            <circle r="7" fill="#fde047" />
            <circle r="3" fill="#ffffff" />
          </g>
        )}

        {/* Labels Overlay */}
        {showLabels && (
          <g style={{ pointerEvents: 'none', userSelect: 'none', fontSize: '11px', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
            {/* Dendrites */}
            <text x="80" y="105" fill="#38bdf8">Dendrites</text>
            <line x1="100" y1="110" x2="115" y2="135" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 2" />

            {/* Soma */}
            <text x="230" y="155" fill="#c084fc" textAnchor="middle">Soma (Cell Body)</text>
            <line x1="230" y1="160" x2="230" y2="185" stroke="#c084fc" strokeWidth="1" strokeDasharray="3 2" />

            {/* Axon Hillock */}
            <text x="290" y="270" fill="#f59e0b">Axon Hillock (Trigger Zone)</text>
            <line x1="290" y1="260" x2="290" y2="235" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 2" />

            {/* Myelin Sheath */}
            <text x="480" y="185" fill="#34d399" textAnchor="middle">Myelin Sheath (Schwann Cell)</text>
            <line x1="480" y1="190" x2="480" y2="204" stroke="#34d399" strokeWidth="1" strokeDasharray="3 2" />

            {/* Node of Ranvier */}
            <text x="560" y="270" fill="#fbbf24" textAnchor="middle">Node of Ranvier</text>
            <line x1="560" y1="260" x2="560" y2="225" stroke="#fbbf24" strokeWidth="1" strokeDasharray="3 2" />

            {/* Axon Terminals */}
            <text x="730" y="320" fill="#f43f5e">Synaptic Terminals</text>
            <line x1="755" y1="305" x2="765" y2="275" stroke="#f43f5e" strokeWidth="1" strokeDasharray="3 2" />
          </g>
        )}
      </svg>

      {/* Real-time Oscilloscope Membrane Potential Telemetry */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          background: 'rgba(7, 11, 20, 0.85)',
          backdropFilter: 'blur(8px)',
          padding: '0.45rem 0.8rem',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem'
        }}
      >
        <Zap size={16} color="#f59e0b" />
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Membrane Voltage (Vm)</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: membraneVoltage > 0 ? '#34d399' : membraneVoltage > -60 ? '#f59e0b' : '#38bdf8' }}>
            {membraneVoltage > 0 ? `+${membraneVoltage}` : membraneVoltage} mV
            <span style={{ fontSize: '0.75rem', fontWeight: 500, marginLeft: '0.4rem', color: 'var(--text-secondary)' }}>
              {membraneVoltage >= 20 ? '(Peak Depolarization)' : membraneVoltage > -60 ? '(Threshold Crossed!)' : '(Resting Potential)'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
