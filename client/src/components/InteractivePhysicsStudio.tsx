import React, { useState, useEffect, useRef } from 'react';
import { PhysicsSimulationModel } from '@conceptlens/shared';
import {
  RotateCcw,
  Play,
  Pause,
  Sliders,
  Sparkles,
  Atom
} from 'lucide-react';

interface InteractivePhysicsStudioProps {
  model: PhysicsSimulationModel;
  onAnnounce?: (msg: string) => void;
  onSwitchToDataStructure?: () => void;
}

export const InteractivePhysicsStudio: React.FC<InteractivePhysicsStudioProps> = ({
  model,
  onAnnounce,
  onSwitchToDataStructure
}) => {
  // Live parameter state derived from model
  const [params, setParams] = useState<Record<string, number>>(() => ({
    ...model.parameters
  }));

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [animTime, setAnimTime] = useState<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // Synchronize params if model changes
  useEffect(() => {
    setParams({ ...model.parameters });
    setAnimTime(0);
  }, [model]);

  // Animation Loop for dynamical simulations (Pendulum, Projectile, Circuit)
  useEffect(() => {
    let lastTimestamp: number | null = null;

    const loop = (timestamp: number) => {
      if (lastTimestamp === null) lastTimestamp = timestamp;
      const dt = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      if (isPlaying) {
        setAnimTime((t) => t + dt);
      }
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  // Handle slider change
  const handleParamChange = (id: string, value: number) => {
    setParams((prev) => {
      const updated = { ...prev, [id]: value };
      if (onAnnounce) {
        onAnnounce(`Updated ${id} to ${value}`);
      }
      return updated;
    });
  };

  const resetParams = () => {
    setParams({ ...model.parameters });
    setAnimTime(0);
    if (onAnnounce) onAnnounce('Reset simulation parameters to default.');
  };

  // -------------------------------------------------------------
  // 1. Ray Optics Calculations
  // -------------------------------------------------------------
  const f = params.focalLength || 100;
  const u = params.objectDistance || 220;
  const ho = params.objectHeight || 60;

  // Thin lens equation: 1/v - 1/(-u) = 1/f => 1/v = 1/f - 1/u => v = (f * u) / (u - f)
  const isVirtual = u < f;
  const isAtFocus = Math.abs(u - f) < 1;
  const v = isAtFocus ? 9999 : (f * u) / (u - f);
  const mag = isAtFocus ? 999 : -v / u;
  const hi = isAtFocus ? 999 : ho * mag;

  // Visual Coordinates on SVG (center of lens is at (480, 180))
  const lensCenterX = 480;
  const lensCenterY = 180;
  const objX = lensCenterX - u;
  const objTopY = lensCenterY - ho;
  const imgX = lensCenterX + v;
  const imgTopY = lensCenterY - hi;

  // -------------------------------------------------------------
  // 2. Simple Pendulum Calculations
  // -------------------------------------------------------------
  const pLength = params.length || 1.5;
  const pAngleDeg = params.angle || 25;
  const pGravity = params.gravity || 9.8;
  const pMass = params.mass || 0.5;

  const omega = Math.sqrt(pGravity / pLength);
  const period = 2 * Math.PI * Math.sqrt(pLength / pGravity);
  const currentAngleRad = (pAngleDeg * (Math.PI / 180)) * Math.cos(omega * animTime);
  const currentAngleDeg = currentAngleRad * (180 / Math.PI);

  const pStringPixelLength = pLength * 90;
  const bobPivotX = 480;
  const bobPivotY = 40;
  const bobX = bobPivotX + pStringPixelLength * Math.sin(currentAngleRad);
  const bobY = bobPivotY + pStringPixelLength * Math.cos(currentAngleRad);

  const maxH = pLength * (1 - Math.cos((pAngleDeg * Math.PI) / 180));
  const currentH = pLength * (1 - Math.cos(currentAngleRad));
  const potentialEnergy = pMass * pGravity * currentH;
  const maxEnergy = pMass * pGravity * maxH;
  const kineticEnergy = Math.max(0, maxEnergy - potentialEnergy);

  // -------------------------------------------------------------
  // 3. Projectile Motion Calculations
  // -------------------------------------------------------------
  const v0 = params.velocity || 32;
  const launchAngleDeg = params.angle || 45;
  const launchAngleRad = (launchAngleDeg * Math.PI) / 180;
  const projGravity = params.gravity || 9.8;

  const timeOfFlight = (2 * v0 * Math.sin(launchAngleRad)) / projGravity;
  const maxAltitude = (v0 * v0 * Math.sin(launchAngleRad) * Math.sin(launchAngleRad)) / (2 * projGravity);
  const horizontalRange = (v0 * v0 * Math.sin(2 * launchAngleRad)) / projGravity;

  // Current projectile flight time looping
  const projTime = timeOfFlight > 0 ? animTime % (timeOfFlight + 0.8) : 0;
  const isFlying = projTime <= timeOfFlight;
  const currentProjX = isFlying ? v0 * Math.cos(launchAngleRad) * projTime : horizontalRange;
  const currentProjY = isFlying
    ? v0 * Math.sin(launchAngleRad) * projTime - 0.5 * projGravity * projTime * projTime
    : 0;

  // Visual Scale: fit into 800px width
  const projScaleX = horizontalRange > 0 ? 680 / Math.max(horizontalRange, 60) : 4;
  const projScaleY = 2.4;
  const projOriginX = 100;
  const projOriginY = 280;

  // -------------------------------------------------------------
  // 4. DC Circuit Calculations
  // -------------------------------------------------------------
  const cVoltage = params.voltage || 12;
  const cR1 = params.r1 || 10;
  const cR2 = params.r2 || 15;
  const isParallel = params.isParallel === 1;

  const cReq = isParallel ? (cR1 * cR2) / (cR1 + cR2) : cR1 + cR2;
  const cCurrent = cVoltage / cReq;
  const cPower = cVoltage * cCurrent;

  // -------------------------------------------------------------
  // 5. Inclined Plane Calculations
  // -------------------------------------------------------------
  const incAngleDeg = params.angle || 30;
  const incAngleRad = (incAngleDeg * Math.PI) / 180;
  const incMass = params.mass || 6;
  const incMu = params.frictionCoeff || 0.2;
  const incGravity = params.gravity || 9.8;

  const normalForce = incMass * incGravity * Math.cos(incAngleRad);
  const downhillForce = incMass * incGravity * Math.sin(incAngleRad);
  const maxFriction = incMu * normalForce;
  const netDownhillForce = Math.max(0, downhillForce - maxFriction);
  const incAccel = netDownhillForce / incMass;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Studio Header Card */}
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
                  gap: '0.25rem'
                }}
              >
                <Atom size={14} /> Physics Concept Engine
              </span>
              <span className="brand-badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}>
                Real-Time Simulation
              </span>
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginTop: '0.25rem', color: '#f8fafc' }}>
              {model.title}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {model.description}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              className={`btn-secondary ${isPlaying ? 'active' : ''}`}
              onClick={() => setIsPlaying((p) => !p)}
              style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              <span>{isPlaying ? 'Pause' : 'Simulate'}</span>
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={resetParams}
              title="Reset parameters"
              style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>

            {onSwitchToDataStructure && (
              <button
                type="button"
                className="btn-secondary"
                onClick={onSwitchToDataStructure}
                style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)' }}
              >
                Switch to DSA
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Interactive SVG Simulation Canvas */}
      <div className="canvas-wrapper" style={{ minHeight: '400px', position: 'relative' }}>
        {/* -------------------------------------------------------------
            A. RAY OPTICS SIMULATION SVG
        ------------------------------------------------------------- */}
        {model.type === 'ray_optics' && (
          <svg viewBox="0 0 960 380" className="w-full h-full" style={{ minHeight: '380px' }}>
            <defs>
              <marker id="arrow-ray-amber" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 2 L 10 5 L 0 8 z" fill="#f59e0b" />
              </marker>
              <marker id="arrow-ray-cyan" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 2 L 10 5 L 0 8 z" fill="#38bdf8" />
              </marker>
              <marker id="arrow-ray-purple" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 2 L 10 5 L 0 8 z" fill="#c084fc" />
              </marker>
            </defs>

            {/* Principal Optical Axis */}
            <line x1="20" y1={lensCenterY} x2="940" y2={lensCenterY} stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.5" strokeDasharray="6,4" />
            <text x="30" y={lensCenterY - 10} fill="var(--text-muted)" fontSize="12" fontFamily="var(--font-mono)">
              Optical Axis (Principal Plane)
            </text>

            {/* Focal Points Ticks & Labels */}
            {/* Left side: F1 and 2F1 */}
            <circle cx={lensCenterX - f} cy={lensCenterY} r="4" fill="#38bdf8" />
            <text x={lensCenterX - f} y={lensCenterY + 20} fill="#38bdf8" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="var(--font-mono)">
              F₁ ({f}mm)
            </text>

            <circle cx={lensCenterX - 2 * f} cy={lensCenterY} r="4" fill="#94a3b8" />
            <text x={lensCenterX - 2 * f} y={lensCenterY + 20} fill="#94a3b8" fontSize="12" textAnchor="middle" fontFamily="var(--font-mono)">
              2F₁
            </text>

            {/* Right side: F2 and 2F2 */}
            <circle cx={lensCenterX + f} cy={lensCenterY} r="4" fill="#38bdf8" />
            <text x={lensCenterX + f} y={lensCenterY + 20} fill="#38bdf8" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="var(--font-mono)">
              F₂ ({f}mm)
            </text>

            <circle cx={lensCenterX + 2 * f} cy={lensCenterY} r="4" fill="#94a3b8" />
            <text x={lensCenterX + 2 * f} y={lensCenterY + 20} fill="#94a3b8" fontSize="12" textAnchor="middle" fontFamily="var(--font-mono)">
              2F₂
            </text>

            {/* Biconvex Lens Graphic */}
            <path
              d={`M ${lensCenterX} 40 Q ${lensCenterX - 25} 180 ${lensCenterX} 320 Q ${lensCenterX + 25} 180 ${lensCenterX} 40`}
              fill="rgba(56, 189, 248, 0.12)"
              stroke="#38bdf8"
              strokeWidth="2.5"
            />
            <line x1={lensCenterX} y1="35" x2={lensCenterX} y2="325" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1" strokeDasharray="3,3" />
            <text x={lensCenterX} y="340" fill="#38bdf8" fontSize="11" fontWeight="600" textAnchor="middle">
              Optical Center O
            </text>

            {/* Object Arrow (Left of lens) */}
            <line x1={objX} y1={lensCenterY} x2={objX} y2={objTopY} stroke="#f43f5e" strokeWidth="4" />
            <polygon
              points={`${objX},${objTopY - 12} ${objX - 6},${objTopY} ${objX + 6},${objTopY}`}
              fill="#f43f5e"
            />
            <text x={objX} y={objTopY - 16} fill="#f43f5e" fontSize="12" fontWeight="700" textAnchor="middle">
              Object (u = {u}mm)
            </text>

            {/* Principal Ray 1: Parallel to Axis -> through Focal point F2 (Amber) */}
            <line x1={objX} y1={objTopY} x2={lensCenterX} y2={objTopY} stroke="#f59e0b" strokeWidth="2" markerMid="url(#arrow-ray-amber)" />
            {isVirtual ? (
              <>
                <line x1={lensCenterX} y1={objTopY} x2={lensCenterX + 350} y2={objTopY + ((lensCenterY - objTopY) / f) * 350} stroke="#f59e0b" strokeWidth="2" />
                <line x1={lensCenterX} y1={objTopY} x2={imgX} y2={imgTopY} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,4" />
              </>
            ) : (
              <line x1={lensCenterX} y1={objTopY} x2={Math.min(940, imgX + 100)} y2={objTopY + ((imgTopY - objTopY) / (imgX - lensCenterX)) * (Math.min(940, imgX + 100) - lensCenterX)} stroke="#f59e0b" strokeWidth="2" />
            )}

            {/* Principal Ray 2: Optical Center (Cyan) */}
            {isVirtual ? (
              <>
                <line x1={objX} y1={objTopY} x2={lensCenterX + 350} y2={lensCenterY + ((lensCenterY - objTopY) / u) * 350} stroke="#38bdf8" strokeWidth="2" />
                <line x1={lensCenterX} y1={lensCenterY} x2={imgX} y2={imgTopY} stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4,4" />
              </>
            ) : (
              <line x1={objX} y1={objTopY} x2={Math.min(940, imgX + 100)} y2={imgTopY + ((imgTopY - lensCenterY) / (imgX - lensCenterX)) * (Math.min(940, imgX + 100) - imgX)} stroke="#38bdf8" strokeWidth="2" />
            )}

            {/* Formed Image Arrow */}
            {!isAtFocus && Math.abs(imgX) < 1500 && (
              <>
                <line
                  x1={imgX}
                  y1={lensCenterY}
                  x2={imgX}
                  y2={imgTopY}
                  stroke={isVirtual ? '#c084fc' : '#10b981'}
                  strokeWidth="3.5"
                  strokeDasharray={isVirtual ? '5,4' : undefined}
                />
                <polygon
                  points={`${imgX},${imgTopY + (hi < 0 ? 12 : -12)} ${imgX - 6},${imgTopY} ${imgX + 6},${imgTopY}`}
                  fill={isVirtual ? '#c084fc' : '#10b981'}
                />
                <text x={imgX} y={imgTopY + (hi < 0 ? 25 : -15)} fill={isVirtual ? '#c084fc' : '#10b981'} fontSize="12" fontWeight="700" textAnchor="middle">
                  Image (v = {Math.round(v)}mm, m = {mag.toFixed(2)}x)
                </text>
              </>
            )}

            {/* Nature Badge */}
            <g transform="translate(30, 40)">
              <rect width="210" height="70" rx="8" fill="rgba(2, 6, 23, 0.85)" stroke="var(--border-subtle)" />
              <text x="12" y="24" fill="#ffffff" fontSize="12" fontWeight="700">
                Image Characteristics:
              </text>
              <text x="12" y="44" fill={isVirtual ? '#c084fc' : '#10b981'} fontSize="11" fontWeight="600">
                • {isVirtual ? 'Virtual & Erect' : 'Real & Inverted'}
              </text>
              <text x="12" y="60" fill="var(--text-secondary)" fontSize="11">
                • {Math.abs(mag) > 1.05 ? 'Magnified' : Math.abs(mag) < 0.95 ? 'Diminished' : 'Same Size'} (|m| = {Math.abs(mag).toFixed(2)})
              </text>
            </g>
          </svg>
        )}

        {/* -------------------------------------------------------------
            B. SIMPLE PENDULUM SIMULATION SVG
        ------------------------------------------------------------- */}
        {model.type === 'pendulum' && (
          <svg viewBox="0 0 960 380" className="w-full h-full" style={{ minHeight: '380px' }}>
            <defs>
              <radialGradient id="bob-grad" cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0369a1" />
              </radialGradient>
            </defs>

            {/* Ceiling */}
            <line x1="360" y1={bobPivotY} x2="600" y2={bobPivotY} stroke="#ffffff" strokeWidth="4" />
            {[-60, -40, -20, 0, 20, 40, 60].map((dx) => (
              <line key={dx} x1={bobPivotX + dx} y1={bobPivotY} x2={bobPivotX + dx - 10} y2={bobPivotY - 12} stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
            ))}

            {/* Equilibrium vertical dotted line */}
            <line x1={bobPivotX} y1={bobPivotY} x2={bobPivotX} y2={bobPivotY + pStringPixelLength + 40} stroke="rgba(255,255,255,0.2)" strokeDasharray="4,4" />

            {/* Oscillating String */}
            <line x1={bobPivotX} y1={bobPivotY} x2={bobX} y2={bobY} stroke="#f8fafc" strokeWidth="2.5" />

            {/* Pivot pin */}
            <circle cx={bobPivotX} cy={bobPivotY} r="5" fill="#f59e0b" />

            {/* Pendulum Bob */}
            <circle cx={bobX} cy={bobY} r={16 + pMass * 8} fill="url(#bob-grad)" stroke="#38bdf8" strokeWidth="2" />
            <text x={bobX} y={bobY + 4} fill="#ffffff" fontSize="11" fontWeight="700" textAnchor="middle">
              {pMass}kg
            </text>

            {/* Restoring Force Vector */}
            <line
              x1={bobX}
              y1={bobY}
              x2={bobX - Math.sin(currentAngleRad) * 45}
              y2={bobY + Math.cos(currentAngleRad) * 10}
              stroke="#facc15"
              strokeWidth="3"
            />
            <text x={bobX - 10} y={bobY + 35} fill="#facc15" fontSize="11" fontWeight="600">
              F_restoring
            </text>

            {/* Gravity Vector */}
            <line x1={bobX} y1={bobY} x2={bobX} y2={bobY + 50} stroke="#f43f5e" strokeWidth="2" strokeDasharray="3,3" />
            <text x={bobX + 8} y={bobY + 50} fill="#f43f5e" fontSize="10">
              mg = {(pMass * pGravity).toFixed(1)}N
            </text>

            {/* Live Readout & Energy Meters */}
            <g transform="translate(40, 50)">
              <rect width="250" height="150" rx="10" fill="rgba(2, 6, 23, 0.85)" stroke="var(--border-subtle)" />
              <text x="16" y="28" fill="#ffffff" fontSize="13" fontWeight="700">
                Simple Harmonic Motion
              </text>
              <text x="16" y="52" fill="#38bdf8" fontSize="12" fontFamily="var(--font-mono)">
                Period (T): {period.toFixed(2)}s  (f = {(1 / period).toFixed(2)}Hz)
              </text>
              <text x="16" y="74" fill="var(--text-secondary)" fontSize="12" fontFamily="var(--font-mono)">
                Angle (θ): {currentAngleDeg.toFixed(1)}°
              </text>

              {/* Potential Energy Bar */}
              <text x="16" y="100" fill="#f59e0b" fontSize="11" fontWeight="600">
                Potential Energy (U): {potentialEnergy.toFixed(2)} J
              </text>
              <rect x="16" y="106" width="218" height="6" rx="3" fill="rgba(255,255,255,0.1)" />
              <rect x="16" y="106" width={maxEnergy > 0 ? (potentialEnergy / maxEnergy) * 218 : 0} height="6" rx="3" fill="#f59e0b" />

              {/* Kinetic Energy Bar */}
              <text x="16" y="130" fill="#38bdf8" fontSize="11" fontWeight="600">
                Kinetic Energy (K): {kineticEnergy.toFixed(2)} J
              </text>
              <rect x="16" y="136" width="218" height="6" rx="3" fill="rgba(255,255,255,0.1)" />
              <rect x="16" y="136" width={maxEnergy > 0 ? (kineticEnergy / maxEnergy) * 218 : 0} height="6" rx="3" fill="#38bdf8" />
            </g>
          </svg>
        )}

        {/* -------------------------------------------------------------
            C. PROJECTILE MOTION SIMULATION SVG
        ------------------------------------------------------------- */}
        {model.type === 'projectile' && (
          <svg viewBox="0 0 960 380" className="w-full h-full" style={{ minHeight: '380px' }}>
            {/* Ground Line */}
            <line x1="60" y1={projOriginY} x2="900" y2={projOriginY} stroke="#10b981" strokeWidth="3" />
            <text x="70" y={projOriginY + 25} fill="#10b981" fontSize="12" fontWeight="700">
              Ground Level (y = 0)
            </text>

            {/* Cannon Launcher */}
            <circle cx={projOriginX} cy={projOriginY} r="14" fill="#64748b" />
            <line
              x1={projOriginX}
              y1={projOriginY}
              x2={projOriginX + Math.cos(launchAngleRad) * 35}
              y2={projOriginY - Math.sin(launchAngleRad) * 35}
              stroke="#94a3b8"
              strokeWidth="8"
              strokeLinecap="round"
            />

            {/* Parabolic Trajectory Path */}
            {(() => {
              const points: string[] = [];
              const steps = 60;
              for (let i = 0; i <= steps; i++) {
                const px = (horizontalRange / steps) * i;
                const py = px * Math.tan(launchAngleRad) - (projGravity * px * px) / (2 * v0 * v0 * Math.cos(launchAngleRad) * Math.cos(launchAngleRad));
                const screenX = projOriginX + px * projScaleX;
                const screenY = projOriginY - py * projScaleY;
                points.push(`${screenX},${screenY}`);
              }
              return (
                <polyline
                  points={points.join(' ')}
                  fill="none"
                  stroke="rgba(56, 189, 248, 0.45)"
                  strokeWidth="2.5"
                  strokeDasharray="6,4"
                />
              );
            })()}

            {/* Moving Projectile Shell */}
            <circle
              cx={projOriginX + currentProjX * projScaleX}
              cy={projOriginY - currentProjY * projScaleY}
              r="8"
              fill="#f43f5e"
              stroke="#ffffff"
              strokeWidth="2"
            />

            {/* Velocity Vectors on Projectile */}
            <line
              x1={projOriginX + currentProjX * projScaleX}
              y1={projOriginY - currentProjY * projScaleY}
              x2={projOriginX + currentProjX * projScaleX + 30}
              y2={projOriginY - currentProjY * projScaleY}
              stroke="#38bdf8"
              strokeWidth="2"
            />
            <text
              x={projOriginX + currentProjX * projScaleX + 35}
              y={projOriginY - currentProjY * projScaleY + 4}
              fill="#38bdf8"
              fontSize="10"
            >
              vx
            </text>

            {/* Max Height Indicator */}
            <line
              x1={projOriginX + (horizontalRange / 2) * projScaleX}
              y1={projOriginY}
              x2={projOriginX + (horizontalRange / 2) * projScaleX}
              y2={projOriginY - maxAltitude * projScaleY}
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeDasharray="4,4"
            />
            <text
              x={projOriginX + (horizontalRange / 2) * projScaleX + 8}
              y={projOriginY - (maxAltitude * projScaleY) / 2}
              fill="#f59e0b"
              fontSize="11"
              fontWeight="600"
            >
              H_max = {maxAltitude.toFixed(1)}m
            </text>

            {/* Range Indicator */}
            <circle cx={projOriginX + horizontalRange * projScaleX} cy={projOriginY} r="5" fill="#10b981" />
            <text
              x={projOriginX + horizontalRange * projScaleX}
              y={projOriginY + 22}
              fill="#10b981"
              fontSize="12"
              fontWeight="700"
              textAnchor="middle"
            >
              Range = {horizontalRange.toFixed(1)}m
            </text>

            {/* Flight Metrics HUD */}
            <g transform="translate(680, 40)">
              <rect width="240" height="110" rx="8" fill="rgba(2, 6, 23, 0.85)" stroke="var(--border-subtle)" />
              <text x="14" y="24" fill="#ffffff" fontSize="12" fontWeight="700">
                Kinematics Telemetry:
              </text>
              <text x="14" y="46" fill="#38bdf8" fontSize="11" fontFamily="var(--font-mono)">
                Flight Time (T): {timeOfFlight.toFixed(2)}s
              </text>
              <text x="14" y="66" fill="#f59e0b" fontSize="11" fontFamily="var(--font-mono)">
                Max Altitude (H): {maxAltitude.toFixed(1)}m
              </text>
              <text x="14" y="86" fill="#10b981" fontSize="11" fontFamily="var(--font-mono)">
                Horizontal Range (R): {horizontalRange.toFixed(1)}m
              </text>
            </g>
          </svg>
        )}

        {/* -------------------------------------------------------------
            D. ELECTRIC CIRCUIT SIMULATION SVG
        ------------------------------------------------------------- */}
        {model.type === 'circuit' && (
          <svg viewBox="0 0 960 380" className="w-full h-full" style={{ minHeight: '380px' }}>
            {/* Circuit Loop Wires */}
            <rect x="180" y="80" width="600" height="220" fill="none" stroke="#64748b" strokeWidth="4" rx="10" />

            {/* Battery on Left Wire */}
            <rect x="165" y="160" width="30" height="60" fill="#020617" />
            <line x1="160" y1="175" x2="200" y2="175" stroke="#f43f5e" strokeWidth="4" />
            <line x1="170" y1="195" x2="190" y2="195" stroke="#38bdf8" strokeWidth="4" />
            <text x="120" y="190" fill="#f43f5e" fontSize="14" fontWeight="700">
              +{cVoltage}V
            </text>

            {/* Resistor 1 (Top Branch) */}
            <rect x="360" y="65" width="90" height="30" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" rx="4" />
            <text x="405" y="85" fill="#f59e0b" fontSize="12" fontWeight="700" textAnchor="middle">
              R₁ = {cR1}Ω
            </text>

            {/* Resistor 2 */}
            <rect x="520" y="65" width="90" height="30" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" rx="4" />
            <text x="565" y="85" fill="#f59e0b" fontSize="12" fontWeight="700" textAnchor="middle">
              R₂ = {cR2}Ω
            </text>

            {/* Animated Electron Flow Dots */}
            {(() => {
              const dotsCount = 14;
              const loopLength = 2 * (600 + 220);
              const speed = cCurrent * 50;
              const dots = [];

              for (let i = 0; i < dotsCount; i++) {
                const dist = (animTime * speed + (i * loopLength) / dotsCount) % loopLength;
                let dx = 0;
                let dy = 0;

                if (dist < 600) {
                  dx = 180 + dist;
                  dy = 80;
                } else if (dist < 600 + 220) {
                  dx = 780;
                  dy = 80 + (dist - 600);
                } else if (dist < 600 + 220 + 600) {
                  dx = 780 - (dist - (600 + 220));
                  dy = 300;
                } else {
                  dx = 180;
                  dy = 300 - (dist - (600 + 220 + 600));
                }

                dots.push(<circle key={i} cx={dx} cy={dy} r="4" fill="#38bdf8" />);
              }
              return dots;
            })()}

            {/* Ammeter Display */}
            <g transform="translate(420, 260)">
              <circle cx="60" cy="40" r="30" fill="#020617" stroke="#38bdf8" strokeWidth="2.5" />
              <text x="60" y="38" fill="#ffffff" fontSize="12" fontWeight="700" textAnchor="middle">
                {cCurrent.toFixed(2)} A
              </text>
              <text x="60" y="52" fill="#38bdf8" fontSize="9" textAnchor="middle">
                AMMETER
              </text>
            </g>

            {/* Metrics HUD */}
            <g transform="translate(680, 180)">
              <rect width="220" height="100" rx="8" fill="rgba(2, 6, 23, 0.85)" stroke="var(--border-subtle)" />
              <text x="14" y="24" fill="#ffffff" fontSize="12" fontWeight="700">
                Circuit Analytics:
              </text>
              <text x="14" y="46" fill="#38bdf8" fontSize="11" fontFamily="var(--font-mono)">
                Total Current (I): {cCurrent.toFixed(2)} A
              </text>
              <text x="14" y="66" fill="#f59e0b" fontSize="11" fontFamily="var(--font-mono)">
                Req = {cReq.toFixed(1)} Ω ({isParallel ? 'Parallel' : 'Series'})
              </text>
              <text x="14" y="86" fill="#10b981" fontSize="11" fontFamily="var(--font-mono)">
                Joule Heat (P): {cPower.toFixed(1)} W
              </text>
            </g>
          </svg>
        )}

        {/* -------------------------------------------------------------
            E. INCLINED PLANE SIMULATION SVG
        ------------------------------------------------------------- */}
        {model.type === 'inclined_plane' && (
          <svg viewBox="0 0 960 380" className="w-full h-full" style={{ minHeight: '380px' }}>
            {/* Horizontal Base */}
            <line x1="120" y1="300" x2="820" y2="300" stroke="#64748b" strokeWidth="3" />

            {/* Triangular Incline Ramp */}
            {(() => {
              const rampLength = 550;
              const rampEndX = 120 + rampLength * Math.cos(incAngleRad);
              const rampTopY = 300 - rampLength * Math.sin(incAngleRad);

              // Block position along ramp
              const blockDist = 260;
              const blockCenterX = 120 + blockDist * Math.cos(incAngleRad);
              const blockCenterY = 300 - blockDist * Math.sin(incAngleRad);

              return (
                <>
                  <polygon
                    points={`120,300 ${rampEndX},300 120,${rampTopY}`}
                    fill="rgba(56, 189, 248, 0.08)"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                  />
                  <text x="160" y="290" fill="#38bdf8" fontSize="14" fontWeight="700">
                    θ = {incAngleDeg}°
                  </text>

                  {/* Mass Block */}
                  <g transform={`translate(${blockCenterX}, ${blockCenterY}) rotate(${-incAngleDeg})`}>
                    <rect x="-35" y="-40" width="70" height="40" rx="4" fill="#1e293b" stroke="#f59e0b" strokeWidth="2.5" />
                    <text x="0" y="-15" fill="#f59e0b" fontSize="12" fontWeight="700" textAnchor="middle">
                      {incMass} kg
                    </text>

                    {/* Normal Force N (perpendicular up) */}
                    <line x1="0" y1="-40" x2="0" y2="-100" stroke="#38bdf8" strokeWidth="3" />
                    <text x="8" y="-95" fill="#38bdf8" fontSize="11" fontWeight="600">
                      N = {normalForce.toFixed(1)}N
                    </text>

                    {/* Downhill Gravity Component mg sin θ */}
                    <line x1="-35" y1="-20" x2="-105" y2="-20" stroke="#f43f5e" strokeWidth="3" />
                    <text x="-110" y="-28" fill="#f43f5e" fontSize="11" fontWeight="600">
                      mg sin θ = {downhillForce.toFixed(1)}N
                    </text>

                    {/* Friction Force f_k (up-hill) */}
                    <line x1="35" y1="-20" x2="85" y2="-20" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="3,3" />
                    <text x="90" y="-28" fill="#f59e0b" fontSize="10">
                      f_k = {maxFriction.toFixed(1)}N
                    </text>
                  </g>
                </>
              );
            })()}

            {/* Mechanics Telemetry */}
            <g transform="translate(680, 50)">
              <rect width="230" height="110" rx="8" fill="rgba(2, 6, 23, 0.85)" stroke="var(--border-subtle)" />
              <text x="14" y="24" fill="#ffffff" fontSize="12" fontWeight="700">
                Dynamics Telemetry:
              </text>
              <text x="14" y="46" fill="#38bdf8" fontSize="11" fontFamily="var(--font-mono)">
                Normal Force: {normalForce.toFixed(1)} N
              </text>
              <text x="14" y="66" fill="#f43f5e" fontSize="11" fontFamily="var(--font-mono)">
                Net Force: {netDownhillForce.toFixed(1)} N
              </text>
              <text x="14" y="86" fill="#10b981" fontSize="11" fontFamily="var(--font-mono)">
                Acceleration: {incAccel.toFixed(2)} m/s²
              </text>
            </g>
          </svg>
        )}
      </div>

      {/* Interactive Parameter Control Sliders */}
      <div className="glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Sliders size={18} color="var(--accent-cyan)" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#f8fafc' }}>
            Interactive Physics Parameters
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            (Drag sliders to mutate ray angles, forces, and trajectories in real time)
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {model.interactiveControls.map((control) => (
            <div key={control.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label htmlFor={control.id} style={{ fontSize: '0.8rem', color: '#e2e8f0', fontWeight: 500 }}>
                  {control.label}
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
                  {params[control.id] ?? control.defaultValue} {control.unit}
                </span>
              </div>
              <input
                id={control.id}
                type="range"
                min={control.min}
                max={control.max}
                step={control.step}
                value={params[control.id] ?? control.defaultValue}
                onChange={(e) => handleParamChange(control.id, parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Formulas & Physics Theory Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {model.formulas.map((item, idx) => (
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
    </div>
  );
};

export default InteractivePhysicsStudio;
