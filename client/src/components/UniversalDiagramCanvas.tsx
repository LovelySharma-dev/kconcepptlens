import React, { useState, useEffect, useRef } from 'react';
import { UniversalInteractiveDiagram, DiagramElement } from '@conceptlens/shared';
import {
  Sliders,
  Sparkles,
  RotateCcw,
  Info,
  Activity,
  Heart,
  Atom,
  TrendingUp,
  Binary,
  Compass,
  X
} from 'lucide-react';

interface UniversalDiagramCanvasProps {
  diagram: UniversalInteractiveDiagram;
  onAnnounce?: (msg: string) => void;
  onSwitchDomain?: () => void;
}

export const UniversalDiagramCanvas: React.FC<UniversalDiagramCanvasProps> = ({
  diagram,
  onAnnounce,
  onSwitchDomain
}) => {
  // Parameter state dictionary
  const [params, setParams] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    diagram.controls.forEach((c) => {
      initial[c.id] = c.defaultValue;
    });
    return initial;
  });

  const [selectedElement, setSelectedElement] = useState<DiagramElement | null>(null);
  const [animTime, setAnimTime] = useState<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // Sync when diagram changes
  useEffect(() => {
    const updated: Record<string, number> = {};
    diagram.controls.forEach((c) => {
      updated[c.id] = c.defaultValue;
    });
    setParams(updated);
    setSelectedElement(null);
    setAnimTime(0);
  }, [diagram]);

  // Animation ticker loop (for heartbeat, rotating unit vectors, electron orbits, nerve pulses)
  useEffect(() => {
    let lastTime: number | null = null;
    const loop = (timestamp: number) => {
      if (lastTime === null) lastTime = timestamp;
      const dt = (timestamp - lastTime) / 1000;
      lastTime = timestamp;

      setAnimTime((t) => t + dt);
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const handleSliderChange = (controlId: string, val: number) => {
    setParams((prev) => {
      const next = { ...prev, [controlId]: val };
      if (onAnnounce) onAnnounce(`Adjusted ${controlId} to ${val}`);
      return next;
    });
  };

  const handleReset = () => {
    const resetValues: Record<string, number> = {};
    diagram.controls.forEach((c) => {
      resetValues[c.id] = c.defaultValue;
    });
    setParams(resetValues);
    setAnimTime(0);
    if (onAnnounce) onAnnounce('Reset all parameters to default.');
  };

  // Domain Badge Icon
  const getDomainIcon = () => {
    switch (diagram.domain) {
      case 'biology':
        return <Heart size={16} color="#f43f5e" />;
      case 'chemistry':
        return <Activity size={16} color="#10b981" />;
      case 'mathematics':
        return <Compass size={16} color="#c084fc" />;
      case 'economics':
        return <TrendingUp size={16} color="#f59e0b" />;
      case 'computer_science':
        return <Binary size={16} color="#38bdf8" />;
      default:
        return <Atom size={16} color="var(--accent-cyan)" />;
    }
  };

  // -------------------------------------------------------------
  // DYNAMIC COMPUTATIONS BASED ON CURRENT PARAMS
  // -------------------------------------------------------------
  // Heart Circulation
  const bpm = params.heartRate ?? 72;
  const sv = params.strokeVolume ?? 70;
  const cardiacOutput = ((bpm * sv) / 1000).toFixed(2);
  const heartBeatScale = 1 + 0.08 * Math.sin(animTime * (bpm / 60) * 2 * Math.PI);

  // Titration pH
  const vNaOH = params.volumeTitrant ?? 25;
  const titrationPH =
    vNaOH < 24.8
      ? (1.0 + (vNaOH / 25) * 2.5).toFixed(2)
      : vNaOH > 25.2
      ? (11.0 + ((vNaOH - 25) / 25) * 2.0).toFixed(2)
      : '7.00';

  // Unit Circle
  const angleDeg = params.angleDeg ?? 45;
  const angleRad = (angleDeg * Math.PI) / 180;
  const sinVal = Math.sin(angleRad).toFixed(3);
  const cosVal = Math.cos(angleRad).toFixed(3);
  const tanVal = Math.abs(Math.cos(angleRad)) > 0.001 ? Math.tan(angleRad).toFixed(3) : '∞';

  // Bohr Atom (Atomic Number)
  const atomicZ = params.atomicNumber ?? 6;

  // Supply & Demand
  const dShift = params.demandShift ?? 0;
  const sShift = params.supplyShift ?? 0;
  const eqPrice = (20 + (dShift - sShift) * 0.25).toFixed(2);
  const eqQty = Math.round(400 + (dShift + sShift) * 2);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Diagram Metadata Header */}
      <div className="glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--accent-cyan)',
                  background: 'rgba(56, 189, 248, 0.15)',
                  padding: '0.2rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                {getDomainIcon()} {diagram.subject}
              </span>
              <span className="brand-badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}>
                Universal Interactive Diagram
              </span>
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginTop: '0.25rem', color: '#f8fafc' }}>
              {diagram.title}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {diagram.description}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleReset}
              style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <RotateCcw size={14} />
              <span>Reset Values</span>
            </button>

            {onSwitchDomain && (
              <button
                type="button"
                className="btn-secondary"
                onClick={onSwitchDomain}
                style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)' }}
              >
                Switch Domain
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div className="canvas-wrapper" style={{ minHeight: '420px', position: 'relative' }}>
        <svg viewBox="0 0 960 400" className="w-full h-full" style={{ minHeight: '400px' }}>
          <defs>
            <filter id="glow-elem" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <marker id="arrow-flow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 2 L 10 5 L 0 8 z" fill="#38bdf8" />
            </marker>
          </defs>

          {/* -------------------------------------------------------------
              A. SPECIALIZED BIOLOGY: HEART BLOOD CIRCULATION
          ------------------------------------------------------------- */}
          {diagram.domain === 'biology' && diagram.id.includes('heart') && (
            <g transform={`scale(${heartBeatScale})`} style={{ transformOrigin: '480px 200px', transition: 'transform 0.08s ease-out' }}>
              {/* Cardiac Outline Contour */}
              <path
                d="M 480 340 C 400 300 300 240 300 160 C 300 100 360 80 420 120 C 450 140 480 160 480 170 C 480 160 510 140 540 120 C 600 80 660 100 660 160 C 660 240 560 300 480 340 Z"
                fill="rgba(15, 23, 42, 0.8)"
                stroke="#64748b"
                strokeWidth="4"
              />

              {/* Right Atrium (Deoxygenated - Cyan/Blue) */}
              <rect
                x="320"
                y="130"
                width="120"
                height="80"
                rx="12"
                fill="rgba(56, 189, 248, 0.2)"
                stroke="#38bdf8"
                strokeWidth={selectedElement?.id === 'right_atrium' ? 3 : 1.5}
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedElement(diagram.elements.find((e) => e.id === 'right_atrium') || null)}
              />
              <text x="380" y="170" fill="#38bdf8" fontSize="13" fontWeight="700" textAnchor="middle">
                Right Atrium
              </text>
              <text x="380" y="190" fill="var(--text-muted)" fontSize="10" textAnchor="middle">
                Deoxygenated
              </text>

              {/* Right Ventricle */}
              <rect
                x="320"
                y="225"
                width="120"
                height="90"
                rx="12"
                fill="rgba(56, 189, 248, 0.3)"
                stroke="#38bdf8"
                strokeWidth={selectedElement?.id === 'right_ventricle' ? 3 : 1.5}
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedElement(diagram.elements.find((e) => e.id === 'right_ventricle') || null)}
              />
              <text x="380" y="270" fill="#38bdf8" fontSize="13" fontWeight="700" textAnchor="middle">
                Right Ventricle
              </text>
              <text x="380" y="290" fill="var(--text-muted)" fontSize="10" textAnchor="middle">
                → Pulmonary Artery
              </text>

              {/* Left Atrium (Oxygenated - Red/Rose) */}
              <rect
                x="520"
                y="130"
                width="120"
                height="80"
                rx="12"
                fill="rgba(244, 63, 94, 0.2)"
                stroke="#f43f5e"
                strokeWidth={selectedElement?.id === 'left_atrium' ? 3 : 1.5}
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedElement(diagram.elements.find((e) => e.id === 'left_atrium') || null)}
              />
              <text x="580" y="170" fill="#f43f5e" fontSize="13" fontWeight="700" textAnchor="middle">
                Left Atrium
              </text>
              <text x="580" y="190" fill="var(--text-muted)" fontSize="10" textAnchor="middle">
                Oxygenated (from Lungs)
              </text>

              {/* Left Ventricle (Thick Wall) */}
              <rect
                x="520"
                y="225"
                width="120"
                height="90"
                rx="12"
                fill="rgba(244, 63, 94, 0.35)"
                stroke="#f43f5e"
                strokeWidth={selectedElement?.id === 'left_ventricle' ? 3 : 2}
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedElement(diagram.elements.find((e) => e.id === 'left_ventricle') || null)}
              />
              <text x="580" y="270" fill="#f43f5e" fontSize="13" fontWeight="700" textAnchor="middle">
                Left Ventricle
              </text>
              <text x="580" y="290" fill="var(--text-muted)" fontSize="10" textAnchor="middle">
                → Aorta (High Pressure)
              </text>

              {/* Interventricular Septum */}
              <line x1="480" y1="120" x2="480" y2="330" stroke="#94a3b8" strokeWidth="4" />

              {/* Aorta Arch Artery */}
              <path d="M 580 130 C 580 60 480 40 430 70" fill="none" stroke="#f43f5e" strokeWidth="6" />
              <text x="470" y="45" fill="#f43f5e" fontSize="12" fontWeight="700">
                Aortic Arch
              </text>

              {/* Live Cardiac Output Badge */}
              <g transform="translate(60, 40)">
                <rect width="210" height="60" rx="8" fill="rgba(2, 6, 23, 0.85)" stroke="var(--border-subtle)" />
                <text x="12" y="24" fill="#ffffff" fontSize="12" fontWeight="700">Hemodynamics:</text>
                <text x="12" y="44" fill="#f43f5e" fontSize="11" fontWeight="600">Cardiac Output = {cardiacOutput} L/min</text>
              </g>
            </g>
          )}

          {/* -------------------------------------------------------------
              B. SPECIALIZED CHEMISTRY: TITRATION CURVE
          ------------------------------------------------------------- */}
          {diagram.domain === 'chemistry' && diagram.id.includes('titration') && (
            <g transform="translate(140, 40)">
              {/* Axes */}
              <line x1="60" y1="300" x2="680" y2="300" stroke="#94a3b8" strokeWidth="2" />
              <line x1="60" y1="300" x2="60" y2="40" stroke="#94a3b8" strokeWidth="2" />
              <text x="690" y="305" fill="#94a3b8" fontSize="11">
                Volume of NaOH (mL)
              </text>
              <text x="40" y="30" fill="#94a3b8" fontSize="11">
                pH
              </text>

              {/* Y-axis Ticks (0, 7, 14) */}
              {[
                { ph: 14, y: 50 },
                { ph: 7, y: 175 },
                { ph: 1, y: 285 }
              ].map((t) => (
                <g key={t.ph}>
                  <line x1="55" y1={t.y} x2="60" y2={t.y} stroke="#94a3b8" strokeWidth="1.5" />
                  <text x="45" y={t.y + 4} fill="#94a3b8" fontSize="10" textAnchor="end">
                    {t.ph}
                  </text>
                </g>
              ))}

              {/* Sigmoidal S-Curve */}
              {(() => {
                const points: string[] = [];
                for (let v = 0; v <= 50; v += 1) {
                  const x = 60 + (v / 50) * 600;
                  const currentPH =
                    v < 24.5
                      ? 1.0 + (v / 25) * 2.5
                      : v > 25.5
                      ? 11.0 + ((v - 25) / 25) * 2.0
                      : 7.0;
                  const y = 300 - ((currentPH - 0) / 14) * 260;
                  points.push(`${x},${y}`);
                }
                return (
                  <polyline
                    points={points.join(' ')}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="3"
                  />
                );
              })()}

              {/* Current Titration Point Marker */}
              {(() => {
                const currentX = 60 + (vNaOH / 50) * 600;
                const currentY = 300 - ((parseFloat(titrationPH) - 0) / 14) * 260;
                return (
                  <g>
                    <circle cx={currentX} cy={currentY} r="7" fill="#f43f5e" stroke="#ffffff" strokeWidth="2" filter="url(#glow-elem)" />
                    <line x1={currentX} y1={currentY} x2={currentX} y2="300" stroke="rgba(244, 63, 94, 0.5)" strokeDasharray="3,3" />
                    <line x1="60" y1={currentY} x2={currentX} y2={currentY} stroke="rgba(244, 63, 94, 0.5)" strokeDasharray="3,3" />
                    <text x={currentX + 10} y={currentY - 10} fill="#f43f5e" fontSize="12" fontWeight="700">
                      pH = {titrationPH} (at {vNaOH} mL)
                    </text>
                  </g>
                );
              })()}

              {/* Equivalence Point Dotted Guides */}
              <circle cx="360" cy="175" r="4" fill="#10b981" />
              <text x="370" y="170" fill="#10b981" fontSize="11" fontWeight="600">
                Equivalence Point (pH 7.00)
              </text>
            </g>
          )}

          {/* -------------------------------------------------------------
              B2. SPECIALIZED CHEMISTRY: RUTHERFORD-BOHR ATOM
          ------------------------------------------------------------- */}
          {diagram.domain === 'chemistry' && diagram.id.includes('bohr') && (
            <g transform="translate(480, 200)">
              {/* Quantized Orbits (K, L, M) */}
              <circle cx="0" cy="0" r="60" fill="none" stroke="rgba(56, 189, 248, 0.35)" strokeWidth="1.5" strokeDasharray="4,4" />
              <text x="0" y="-64" fill="#38bdf8" fontSize="10" textAnchor="middle">K Shell (n=1)</text>

              <circle cx="0" cy="0" r="110" fill="none" stroke="rgba(192, 132, 252, 0.35)" strokeWidth="1.5" strokeDasharray="4,4" />
              <text x="0" y="-114" fill="#c084fc" fontSize="10" textAnchor="middle">L Shell (n=2)</text>

              <circle cx="0" cy="0" r="160" fill="none" stroke="rgba(16, 185, 129, 0.35)" strokeWidth="1.5" strokeDasharray="4,4" />
              <text x="0" y="-164" fill="#10b981" fontSize="10" textAnchor="middle">M Shell (n=3)</text>

              {/* Nucleus */}
              <circle cx="0" cy="0" r="24" fill="#f43f5e" filter="url(#glow-elem)" />
              <text x="0" y="-2" fill="#ffffff" fontSize="11" fontWeight="800" textAnchor="middle">
                {atomicZ}p⁺
              </text>
              <text x="0" y="10" fill="rgba(255,255,255,0.8)" fontSize="9" textAnchor="middle">
                Nucleus
              </text>

              {/* Electrons on K shell (up to 2) */}
              {Array.from({ length: Math.min(atomicZ, 2) }).map((_, i) => {
                const angle = animTime * 1.5 + (i * 2 * Math.PI) / Math.min(atomicZ, 2);
                const ex = 60 * Math.cos(angle);
                const ey = 60 * Math.sin(angle);
                return (
                  <circle key={`k-${i}`} cx={ex} cy={ey} r="5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" filter="url(#glow-elem)" />
                );
              })}

              {/* Electrons on L shell (up to 8) */}
              {Array.from({ length: Math.min(Math.max(0, atomicZ - 2), 8) }).map((_, i) => {
                const count = Math.min(Math.max(0, atomicZ - 2), 8);
                const angle = -animTime * 1.0 + (i * 2 * Math.PI) / count;
                const ex = 110 * Math.cos(angle);
                const ey = 110 * Math.sin(angle);
                return (
                  <circle key={`l-${i}`} cx={ex} cy={ey} r="5" fill="#c084fc" stroke="#ffffff" strokeWidth="1.5" filter="url(#glow-elem)" />
                );
              })}

              {/* Electrons on M shell (up to 8) */}
              {Array.from({ length: Math.max(0, atomicZ - 10) }).map((_, i) => {
                const count = Math.max(0, atomicZ - 10);
                const angle = animTime * 0.7 + (i * 2 * Math.PI) / count;
                const ex = 160 * Math.cos(angle);
                const ey = 160 * Math.sin(angle);
                return (
                  <circle key={`m-${i}`} cx={ex} cy={ey} r="5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" filter="url(#glow-elem)" />
                );
              })}

              {/* Atom Info Badge */}
              <g transform="translate(-240, -180)">
                <rect width="180" height="56" rx="8" fill="rgba(2, 6, 23, 0.85)" stroke="var(--border-subtle)" />
                <text x="12" y="22" fill="#ffffff" fontSize="12" fontWeight="700">
                  Z = {atomicZ}: {['', 'H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar'][atomicZ] || 'Element'}
                </text>
                <text x="12" y="42" fill="var(--text-muted)" fontSize="11">
                  Shells: K={Math.min(atomicZ, 2)}, L={Math.min(Math.max(0, atomicZ - 2), 8)}, M={Math.max(0, atomicZ - 10)}
                </text>
              </g>
            </g>
          )}

          {/* -------------------------------------------------------------
              C. SPECIALIZED MATHEMATICS: TRIGONOMETRIC UNIT CIRCLE
          ------------------------------------------------------------- */}
          {diagram.domain === 'mathematics' && diagram.id.includes('trig') && (
            <g transform="translate(480, 200)">
              {/* Coordinate Axes */}
              <line x1="-180" y1="0" x2="180" y2="0" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
              <line x1="0" y1="-180" x2="0" y2="180" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
              <text x="185" y="4" fill="var(--text-muted)" fontSize="11">
                +X (cos)
              </text>
              <text x="4" y="-185" fill="var(--text-muted)" fontSize="11">
                +Y (sin)
              </text>

              {/* Unit Circle (R = 130px) */}
              <circle cx="0" cy="0" r="130" fill="none" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="2.5" />

              {/* Live HUD Badges */}
              <g transform="translate(-160, -170)">
                <rect width="120" height="60" rx="6" fill="rgba(2, 6, 23, 0.85)" stroke="var(--border-subtle)" />
                <text x="10" y="18" fill="#f59e0b" fontSize="11" fontWeight="700">cos θ = {cosVal}</text>
                <text x="10" y="34" fill="#38bdf8" fontSize="11" fontWeight="700">sin θ = {sinVal}</text>
                <text x="10" y="50" fill="#c084fc" fontSize="11" fontWeight="700">tan θ = {tanVal}</text>
              </g>

              {/* Cosine Projection (Horizontal Amber) */}
              <line x1="0" y1="0" x2={130 * Math.cos(angleRad)} y2="0" stroke="#f59e0b" strokeWidth="4" />
              <text x={(130 * Math.cos(angleRad)) / 2} y="18" fill="#f59e0b" fontSize="11" fontWeight="700" textAnchor="middle">
                cos θ = {cosVal}
              </text>

              {/* Sine Projection (Vertical Cyan) */}
              <line x1={130 * Math.cos(angleRad)} y1="0" x2={130 * Math.cos(angleRad)} y2={-130 * Math.sin(angleRad)} stroke="#38bdf8" strokeWidth="4" />
              <text x={130 * Math.cos(angleRad) + (Math.cos(angleRad) >= 0 ? 12 : -12)} y={(-130 * Math.sin(angleRad)) / 2} fill="#38bdf8" fontSize="11" fontWeight="700" textAnchor={Math.cos(angleRad) >= 0 ? 'start' : 'end'}>
                sin θ = {sinVal}
              </text>

              {/* Rotating Radius Vector */}
              <line x1="0" y1="0" x2={130 * Math.cos(angleRad)} y2={-130 * Math.sin(angleRad)} stroke="#f8fafc" strokeWidth="2.5" />
              <circle cx={130 * Math.cos(angleRad)} cy={-130 * Math.sin(angleRad)} r="6" fill="#f43f5e" stroke="#ffffff" strokeWidth="2" filter="url(#glow-elem)" />

              {/* Angle Arc */}
              <path
                d={`M 35 0 A 35 35 0 ${angleDeg > 180 ? 1 : 0} 0 ${35 * Math.cos(angleRad)} ${-35 * Math.sin(angleRad)}`}
                fill="none"
                stroke="#c084fc"
                strokeWidth="2"
              />
              <text x="45" y="-12" fill="#c084fc" fontSize="11" fontWeight="700">
                θ = {angleDeg}°
              </text>
            </g>
          )}

          {/* -------------------------------------------------------------
              D. SPECIALIZED ECONOMICS: SUPPLY & DEMAND
          ------------------------------------------------------------- */}
          {diagram.domain === 'economics' && (
            <g transform="translate(140, 50)">
              {/* Axes */}
              <line x1="60" y1="280" x2="680" y2="280" stroke="#94a3b8" strokeWidth="2" />
              <line x1="60" y1="280" x2="60" y2="40" stroke="#94a3b8" strokeWidth="2" />
              <text x="690" y="285" fill="#94a3b8" fontSize="11">
                Quantity (Q)
              </text>
              <text x="35" y="35" fill="#94a3b8" fontSize="11">
                Price (P)
              </text>

              {/* Downward Sloping Demand Curve */}
              <line x1="100" y1={60 - dShift * 1.5} x2="620" y2={260 - dShift * 1.5} stroke="#38bdf8" strokeWidth="3.5" />
              <text x="630" y={260 - dShift * 1.5} fill="#38bdf8" fontSize="12" fontWeight="700">
                Demand (D)
              </text>

              {/* Upward Sloping Supply Curve */}
              <line x1="100" y1={260 - sShift * 1.5} x2="620" y2={60 - sShift * 1.5} stroke="#f43f5e" strokeWidth="3.5" />
              <text x="630" y={60 - sShift * 1.5} fill="#f43f5e" fontSize="12" fontWeight="700">
                Supply (S)
              </text>

              {/* Equilibrium Point Crosshair */}
              <circle cx="360" cy="160" r="7" fill="#10b981" stroke="#ffffff" strokeWidth="2" filter="url(#glow-elem)" />
              <line x1="60" y1="160" x2="360" y2="160" stroke="#10b981" strokeDasharray="4,4" />
              <line x1="360" y1="160" x2="360" y2="280" stroke="#10b981" strokeDasharray="4,4" />
              <text x="375" y="150" fill="#10b981" fontSize="12" fontWeight="700">
                Equilibrium: P* = ${eqPrice}, Q* = {eqQty}
              </text>
            </g>
          )}

          {/* -------------------------------------------------------------
              E. SPECIALIZED COMPUTER SCIENCE: BINARY SEARCH TREE
          ------------------------------------------------------------- */}
          {diagram.domain === 'computer_science' && diagram.id.includes('bst') && (
            <g transform="translate(0, 30)">
              {/* Tree Edges */}
              <line x1="480" y1="80" x2="320" y2="160" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
              <line x1="480" y1="80" x2="640" y2="160" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
              <line x1="320" y1="160" x2="240" y2="240" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
              <line x1="320" y1="160" x2="400" y2="240" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
              <line x1="640" y1="160" x2="560" y2="240" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
              <line x1="640" y1="160" x2="720" y2="240" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />

              {/* Tree Nodes */}
              {diagram.elements.map((elem) => {
                const isSelected = selectedElement?.id === elem.id;
                return (
                  <g
                    key={elem.id}
                    transform={`translate(${elem.x}, ${elem.y})`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedElement(elem)}
                  >
                    <circle
                      cx="0"
                      cy="0"
                      r={elem.radius || 22}
                      fill={elem.color || '#38bdf8'}
                      stroke={isSelected ? '#ffffff' : 'rgba(255,255,255,0.4)'}
                      strokeWidth={isSelected ? 3 : 1.5}
                      filter={isSelected ? 'url(#glow-elem)' : undefined}
                    />
                    <text x="0" y="4" fill="#ffffff" fontSize="11" fontWeight="700" textAnchor="middle">
                      {elem.label}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* -------------------------------------------------------------
              F. UNIVERSAL FALLBACK / GENERAL ELEMENT RENDERING
          ------------------------------------------------------------- */}
          {!(
            (diagram.domain === 'biology' && diagram.id.includes('heart')) ||
            (diagram.domain === 'chemistry' && diagram.id.includes('titration')) ||
            (diagram.domain === 'chemistry' && diagram.id.includes('bohr')) ||
            (diagram.domain === 'mathematics' && diagram.id.includes('trig')) ||
            diagram.domain === 'economics' ||
            (diagram.domain === 'computer_science' && diagram.id.includes('bst'))
          ) && (
            <g transform="translate(40, 40)">
              {diagram.elements.map((elem) => {
                const isSelected = selectedElement?.id === elem.id;
                return (
                  <g
                    key={elem.id}
                    transform={`translate(${elem.x}, ${elem.y})`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedElement(elem)}
                  >
                    {elem.radius ? (
                      <circle
                        cx="0"
                        cy="0"
                        r={elem.radius}
                        fill={elem.color || 'rgba(56, 189, 248, 0.2)'}
                        stroke={isSelected ? '#ffffff' : elem.strokeColor || '#38bdf8'}
                        strokeWidth={isSelected ? 3 : 1.5}
                      />
                    ) : (
                      <rect
                        x={-(elem.width ? elem.width / 2 : 40)}
                        y={-(elem.height ? elem.height / 2 : 25)}
                        width={elem.width || 80}
                        height={elem.height || 50}
                        rx="8"
                        fill={elem.color || 'rgba(56, 189, 248, 0.15)'}
                        stroke={isSelected ? '#ffffff' : elem.strokeColor || '#38bdf8'}
                        strokeWidth={isSelected ? 3 : 1.5}
                      />
                    )}
                    <text x="0" y="4" fill="#ffffff" fontSize="11" fontWeight="600" textAnchor="middle">
                      {elem.label}
                    </text>
                  </g>
                );
              })}
            </g>
          )}
        </svg>

        {/* Selected Element Detail Inspector Floating Modal */}
        {selectedElement && (
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              maxWidth: '360px',
              background: 'rgba(2, 6, 23, 0.92)',
              backdropFilter: 'blur(8px)',
              border: '1px solid var(--accent-cyan)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.6)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Info size={15} color="var(--accent-cyan)" />
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
                  {selectedElement.label}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedElement(null)}
                className="icon-btn"
                style={{ width: '22px', height: '22px' }}
              >
                <X size={13} />
              </button>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#e2e8f0', lineHeight: 1.45 }}>
              {selectedElement.detail || 'Component identified by ConceptLens multi-modal vision.'}
            </p>
          </div>
        )}
      </div>

      {/* Dynamic Telemetry Metrics Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
        {diagram.metrics.map((metric, i) => (
          <div
            key={i}
            style={{
              background: 'rgba(2, 6, 23, 0.6)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.75rem 1rem'
            }}
          >
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {metric.label}
            </span>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>
              {metric.value} {metric.unit || ''}
            </div>
            {metric.formula && (
              <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                ↳ {metric.formula}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Interactive Controls Sliders */}
      <div className="glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Sliders size={18} color="var(--accent-cyan)" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#f8fafc' }}>
            Interactive Simulation Controls
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            (Mutate variables to test hypotheses and trigger real-time recalculations)
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {diagram.controls.map((ctrl) => (
            <div key={ctrl.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label htmlFor={ctrl.id} style={{ fontSize: '0.8rem', color: '#e2e8f0', fontWeight: 500 }}>
                  {ctrl.label}
                </label>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    color: 'var(--accent-cyan)',
                    background: 'rgba(56, 189, 248, 0.1)',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '4px'
                  }}
                >
                  {params[ctrl.id] ?? ctrl.defaultValue} {ctrl.unit}
                </span>
              </div>
              <input
                id={ctrl.id}
                type="range"
                min={ctrl.min}
                max={ctrl.max}
                step={ctrl.step}
                value={params[ctrl.id] ?? ctrl.defaultValue}
                onChange={(e) => handleSliderChange(ctrl.id, parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
              />
              {ctrl.description && (
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {ctrl.description}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Formulas & Fundamental Principles */}
      {diagram.formulas && diagram.formulas.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {diagram.formulas.map((item, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(2, 6, 23, 0.6)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                <Sparkles size={14} color="#f59e0b" />
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                  {item.label}
                </h4>
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  color: 'var(--accent-cyan)',
                  background: 'rgba(56, 189, 248, 0.08)',
                  padding: '0.3rem 0.6rem',
                  borderRadius: '4px',
                  marginBottom: '0.4rem',
                  borderLeft: '3px solid var(--accent-cyan)'
                }}
              >
                {item.formula}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                {item.explanation}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UniversalDiagramCanvas;
