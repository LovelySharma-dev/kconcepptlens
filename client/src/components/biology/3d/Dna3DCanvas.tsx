import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RotateCcw, ZoomIn, ZoomOut, Play, Pause, AlertCircle, Dna } from 'lucide-react';

interface Dna3DCanvasProps {
  selectedComponentId: string | null;
  onSelectComponent: (id: string) => void;
  reducedMotion?: boolean;
}

export const Dna3DCanvas: React.FC<Dna3DCanvasProps> = ({
  selectedComponentId,
  onSelectComponent,
  reducedMotion = false
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const dnaGroupRef = useRef<THREE.Group | null>(null);
  const meshMapRef = useRef<Map<string, THREE.Object3D[]>>(new Map());
  const animFrameIdRef = useRef<number | null>(null);

  const [webGlSupported, setWebGlSupported] = useState(true);
  const [isRotating, setIsRotating] = useState(!reducedMotion);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const isRotatingRef = useRef(isRotating);
  isRotatingRef.current = isRotating;
  const reducedMotionRef = useRef(reducedMotion);
  reducedMotionRef.current = reducedMotion;

  const onSelectComponentRef = useRef(onSelectComponent);
  onSelectComponentRef.current = onSelectComponent;

  useEffect(() => {
    if (reducedMotion) setIsRotating(false);
  }, [reducedMotion]);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setWebGlSupported(false);
    } catch {
      setWebGlSupported(false);
    }
  }, []);

  useEffect(() => {
    if (!webGlSupported || !mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070b14);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    rendererRef.current = renderer;

    container.replaceChildren(renderer.domElement);

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 14;
    controlsRef.current = controls;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00f2fe, 1.5);
    dirLight1.position.set(5, 8, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x8b5cf6, 1.5);
    dirLight2.position.set(-5, -6, 4);
    scene.add(dirLight2);

    // 6. Build Double Helix Geometry
    const dnaGroup = new THREE.Group();
    dnaGroupRef.current = dnaGroup;
    scene.add(dnaGroup);

    const meshMap = new Map<string, THREE.Object3D[]>();
    meshMapRef.current = meshMap;

    const registerMesh = (id: string, obj: THREE.Object3D) => {
      obj.userData = { componentId: id };
      dnaGroup.add(obj);
      const list = meshMap.get(id) || [];
      list.push(obj);
      meshMap.set(id, list);
    };

    // Parameters for 2 full turns of B-DNA
    const turns = 2.2;
    const heightSpan = 5.2;
    const radius = 1.25;
    const pointsPerTurn = 60;
    const totalPoints = Math.round(turns * pointsPerTurn);

    // Major and Minor groove offset: strands are offset by ~140 degrees (2.44 radians)
    const strand1Points: THREE.Vector3[] = [];
    const strand2Points: THREE.Vector3[] = [];

    for (let i = 0; i <= totalPoints; i++) {
      const t = i / totalPoints;
      const angle = t * turns * Math.PI * 2;
      const y = (t - 0.5) * heightSpan;

      strand1Points.push(new THREE.Vector3(radius * Math.cos(angle), y, radius * Math.sin(angle)));
      strand2Points.push(new THREE.Vector3(radius * Math.cos(angle + 2.45), y, radius * Math.sin(angle + 2.45)));
    }

    // A. Sugar-Phosphate Strand 1 (Cyan / 5' to 3')
    const curve1 = new THREE.CatmullRomCurve3(strand1Points);
    const strand1Geo = new THREE.TubeGeometry(curve1, 100, 0.12, 12, false);
    const strand1Mat = new THREE.MeshStandardMaterial({
      color: 0x00f2fe,
      roughness: 0.25,
      metalness: 0.2,
      emissive: 0x0284c7,
      emissiveIntensity: 0.4
    });
    const strand1Mesh = new THREE.Mesh(strand1Geo, strand1Mat);
    registerMesh('sugar_phosphate_backbone', strand1Mesh);

    // B. Sugar-Phosphate Strand 2 (Violet / 3' to 5')
    const curve2 = new THREE.CatmullRomCurve3(strand2Points);
    const strand2Geo = new THREE.TubeGeometry(curve2, 100, 0.12, 12, false);
    const strand2Mat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      roughness: 0.25,
      metalness: 0.2,
      emissive: 0x6d28d9,
      emissiveIntensity: 0.4
    });
    const strand2Mesh = new THREE.Mesh(strand2Geo, strand2Mat);
    registerMesh('sugar_phosphate_backbone', strand2Mesh);

    // C. Base Pair Rungs
    const rungsCount = 24;
    for (let j = 0; j < rungsCount; j++) {
      const t = (j + 0.5) / rungsCount;
      const p1 = curve1.getPointAt(t);
      const p2 = curve2.getPointAt(t);

      const midPoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      const isAT = j % 2 === 0;
      const pairId = isAT ? 'adenine_thymine_pair' : 'guanine_cytosine_pair';

      // Left half rung
      const half1Curve = new THREE.LineCurve3(p1, midPoint);
      const half1Geo = new THREE.TubeGeometry(half1Curve, 8, 0.08, 10, false);
      const half1Mat = new THREE.MeshStandardMaterial({
        color: isAT ? 0x10b981 : 0x8b5cf6, // A: Green / G: Purple
        emissive: isAT ? 0x059669 : 0x7c3aed,
        emissiveIntensity: 0.5,
        roughness: 0.3
      });
      const half1Mesh = new THREE.Mesh(half1Geo, half1Mat);
      registerMesh(pairId, half1Mesh);

      // Right half rung
      const half2Curve = new THREE.LineCurve3(midPoint, p2);
      const half2Geo = new THREE.TubeGeometry(half2Curve, 8, 0.08, 10, false);
      const half2Mat = new THREE.MeshStandardMaterial({
        color: isAT ? 0xf59e0b : 0x38bdf8, // T: Amber / C: Blue
        emissive: isAT ? 0xd97706 : 0x0284c7,
        emissiveIntensity: 0.5,
        roughness: 0.3
      });
      const half2Mesh = new THREE.Mesh(half2Geo, half2Mat);
      registerMesh(pairId, half2Mesh);

      // Hydrogen Bond Dots in middle
      const hBondGeo = new THREE.SphereGeometry(0.06, 8, 8);
      const hBondMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const hBond1 = new THREE.Mesh(hBondGeo, hBondMat);
      hBond1.position.copy(midPoint);
      dnaGroup.add(hBond1);
    }

    // D. Raycasting Click Selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(dnaGroup.children, true);

      for (const hit of intersects) {
        let curr: THREE.Object3D | null = hit.object;
        while (curr && !curr.userData.componentId) {
          curr = curr.parent;
        }
        if (curr && curr.userData.componentId) {
          onSelectComponentRef.current(curr.userData.componentId);
          break;
        }
      }
    };

    const onPointerMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(dnaGroup.children, true);

      let foundId: string | null = null;
      for (const hit of intersects) {
        let curr: THREE.Object3D | null = hit.object;
        while (curr && !curr.userData.componentId) {
          curr = curr.parent;
        }
        if (curr && curr.userData.componentId) {
          foundId = curr.userData.componentId;
          break;
        }
      }
      setHoveredId(foundId);
      container.style.cursor = foundId ? 'pointer' : 'grab';
    };

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      setWebGlSupported(false);
    };

    renderer.domElement.addEventListener('webglcontextlost', handleContextLost, false);
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);

    // 7. Animation Loop
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      if (isRotatingRef.current && !prefersReducedMotion && !reducedMotionRef.current) {
        dnaGroup.rotation.y += 0.008;
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    // 8. Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.dispose();
      container.replaceChildren();
    };
  }, [webGlSupported]);

  // Emissive highlight on selected pair or backbone
  useEffect(() => {
    if (!meshMapRef.current) return;

    meshMapRef.current.forEach((objects, compId) => {
      const isSelected = compId === selectedComponentId;
      const isHovered = compId === hoveredId;

      objects.forEach((obj) => {
        obj.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            const mat = child.material as THREE.MeshStandardMaterial;
            if (mat.emissive) {
              if (isSelected) {
                mat.emissiveIntensity = 1.4;
                child.scale.set(1.15, 1.15, 1.15);
              } else if (isHovered) {
                mat.emissiveIntensity = 0.9;
                child.scale.set(1.06, 1.06, 1.06);
              } else {
                mat.emissiveIntensity = 0.45;
                child.scale.set(1, 1, 1);
              }
            }
          }
        });
      });
    });
  }, [selectedComponentId, hoveredId]);

  const handleResetCamera = useCallback(() => {
    if (!cameraRef.current || !controlsRef.current || !dnaGroupRef.current) return;
    cameraRef.current.position.set(0, 0, 7.5);
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
    dnaGroupRef.current.rotation.set(0, 0, 0);
  }, []);

  const handleZoom = (delta: number) => {
    if (!cameraRef.current || !controlsRef.current) return;
    const dir = new THREE.Vector3();
    cameraRef.current.getWorldDirection(dir);
    cameraRef.current.position.addScaledVector(dir, delta);
    controlsRef.current.update();
  };

  if (!webGlSupported) {
    return (
      <div className="canvas-fallback-panel">
        <AlertCircle size={32} color="#f59e0b" />
        <p style={{ fontWeight: 600 }}>WebGL Acceleration Unavailable</p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Please use the interactive 2D diagram above to explore the nucleotide base-pair sequence.
        </p>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '440px' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%', minHeight: '440px', borderRadius: '12px', overflow: 'hidden' }} />

      {/* Floating Control HUD */}
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
          className={`icon-btn-sm ${isRotating ? 'active' : ''}`}
          onClick={() => setIsRotating((r) => !r)}
          title={isRotating ? 'Pause Rotation' : 'Resume Rotation'}
          aria-label={isRotating ? 'Pause Rotation' : 'Resume Rotation'}
        >
          {isRotating ? <Pause size={15} /> : <Play size={15} />}
        </button>
        <button
          type="button"
          className="icon-btn-sm"
          onClick={handleResetCamera}
          title="Reset Camera Angle & Zoom"
          aria-label="Reset Camera"
        >
          <RotateCcw size={15} />
        </button>
        <button
          type="button"
          className="icon-btn-sm"
          onClick={() => handleZoom(1.0)}
          title="Zoom In"
          aria-label="Zoom In"
        >
          <ZoomIn size={15} />
        </button>
        <button
          type="button"
          className="icon-btn-sm"
          onClick={() => handleZoom(-1.0)}
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          <ZoomOut size={15} />
        </button>
      </div>

      {/* Base Pair Color Legend */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          background: 'rgba(7, 11, 20, 0.8)',
          backdropFilter: 'blur(8px)',
          padding: '0.45rem 0.75rem',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          fontSize: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem',
          pointerEvents: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Dna size={14} color="var(--accent-cyan)" />
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Watson-Crick Base Complementarity</span>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', fontSize: '0.7rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
            Adenine (A)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
            Thymine (T) [2 H-bonds]
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', fontSize: '0.7rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8b5cf6' }} />
            Guanine (G)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8' }} />
            Cytosine (C) [3 H-bonds]
          </span>
        </div>
      </div>
    </div>
  );
};
