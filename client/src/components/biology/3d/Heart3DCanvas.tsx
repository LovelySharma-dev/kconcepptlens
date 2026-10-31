import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RotateCcw, ZoomIn, ZoomOut, Play, Pause, AlertCircle, Heart } from 'lucide-react';

interface Heart3DCanvasProps {
  selectedComponentId: string | null;
  onSelectComponent: (id: string) => void;
  bpm?: number;
  reducedMotion?: boolean;
}

export const Heart3DCanvas: React.FC<Heart3DCanvasProps> = ({
  selectedComponentId,
  onSelectComponent,
  bpm = 72,
  reducedMotion = false
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const heartGroupRef = useRef<THREE.Group | null>(null);
  const meshMapRef = useRef<Map<string, THREE.Object3D[]>>(new Map());
  const animFrameIdRef = useRef<number | null>(null);

  const [webGlSupported, setWebGlSupported] = useState(true);
  const [isPlaying, setIsPlaying] = useState(!reducedMotion);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;
  const reducedMotionRef = useRef(reducedMotion);
  reducedMotionRef.current = reducedMotion;

  const bpmRef = useRef(bpm);
  bpmRef.current = bpm;

  useEffect(() => {
    if (reducedMotion) setIsPlaying(false);
  }, [reducedMotion]);

  const onSelectComponentRef = useRef(onSelectComponent);
  onSelectComponentRef.current = onSelectComponent;

  // Check WebGL availability
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setWebGlSupported(false);
    } catch {
      setWebGlSupported(false);
    }
  }, []);

  // Initialize Three.js Heart Scene
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
    camera.position.set(0, 1.2, 7.0);
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
    controls.minDistance = 3.5;
    controls.maxDistance = 14;
    controls.maxPolarAngle = Math.PI * 0.85;
    controlsRef.current = controls;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const redLight = new THREE.DirectionalLight(0xf43f5e, 1.8);
    redLight.position.set(5, 6, 4);
    scene.add(redLight);

    const blueLight = new THREE.DirectionalLight(0x0284c7, 1.6);
    blueLight.position.set(-5, 4, 4);
    scene.add(blueLight);

    const rimLight = new THREE.DirectionalLight(0x8b5cf6, 0.9);
    rimLight.position.set(0, -6, -4);
    scene.add(rimLight);

    // 6. Build Anatomical Heart Model
    const heartGroup = new THREE.Group();
    heartGroupRef.current = heartGroup;
    scene.add(heartGroup);

    const meshMap = new Map<string, THREE.Object3D[]>();
    meshMapRef.current = meshMap;

    const registerMesh = (id: string, obj: THREE.Object3D) => {
      obj.userData = { componentId: id };
      heartGroup.add(obj);
      const list = meshMap.get(id) || [];
      list.push(obj);
      meshMap.set(id, list);
    };

    // A. Left Ventricle (Thick muscular conical apex chamber — Red/Crimson)
    const lvGeo = new THREE.ConeGeometry(1.2, 2.2, 32);
    const lvMat = new THREE.MeshStandardMaterial({
      color: 0xbe123c,
      emissive: 0x881337,
      emissiveIntensity: 0.45,
      roughness: 0.35,
      metalness: 0.15
    });
    const lvMesh = new THREE.Mesh(lvGeo, lvMat);
    lvMesh.rotation.z = Math.PI - 0.25;
    lvMesh.position.set(0.65, -0.6, 0.1);
    registerMesh('left_ventricle', lvMesh);

    // B. Right Ventricle (Anterior crescent chamber wrapping LV — Blue/Cyan)
    const rvGeo = new THREE.ConeGeometry(1.05, 1.8, 32);
    const rvMat = new THREE.MeshStandardMaterial({
      color: 0x0369a1,
      emissive: 0x0c4a6e,
      emissiveIntensity: 0.45,
      roughness: 0.35,
      metalness: 0.15
    });
    const rvMesh = new THREE.Mesh(rvGeo, rvMat);
    rvMesh.rotation.z = Math.PI + 0.15;
    rvMesh.position.set(-0.7, -0.4, 0.35);
    registerMesh('right_ventricle', rvMesh);

    // C. Right Atrium (Upper receiving chamber — Deep Blue)
    const raGeo = new THREE.SphereGeometry(0.85, 24, 24);
    const raMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x0369a1,
      emissiveIntensity: 0.4,
      roughness: 0.3
    });
    const raMesh = new THREE.Mesh(raGeo, raMat);
    raMesh.position.set(-1.15, 0.85, 0.2);
    registerMesh('right_atrium', raMesh);

    // D. Left Atrium (Posterior upper chamber — Crimson Red)
    const laGeo = new THREE.SphereGeometry(0.8, 24, 24);
    const laMat = new THREE.MeshStandardMaterial({
      color: 0xe11d48,
      emissive: 0x9f1239,
      emissiveIntensity: 0.4,
      roughness: 0.3
    });
    const laMesh = new THREE.Mesh(laGeo, laMat);
    laMesh.position.set(0.95, 0.9, -0.2);
    registerMesh('left_atrium', laMesh);

    // E. Ascending Aorta & Aortic Arch with 3 branches (Arterial Red)
    const aortaCurve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(0.2, 0.6, 0.1),
      new THREE.Vector3(0.1, 2.0, 0.2),
      new THREE.Vector3(-0.6, 2.4, -0.2),
      new THREE.Vector3(-0.8, 1.1, -0.6)
    );
    const aortaGeo = new THREE.TubeGeometry(aortaCurve, 32, 0.32, 16, false);
    const aortaMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      emissive: 0xbe123c,
      emissiveIntensity: 0.5,
      roughness: 0.25
    });
    const aortaMesh = new THREE.Mesh(aortaGeo, aortaMat);
    registerMesh('aorta', aortaMesh);

    // 3 Arch Branches (Brachiocephalic, Carotid, Subclavian)
    for (let b = 0; b < 3; b++) {
      const branchGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.55, 12);
      const branchMesh = new THREE.Mesh(branchGeo, aortaMat);
      branchMesh.position.set(-0.35 + b * 0.25, 2.3 + b * 0.05, 0);
      branchMesh.rotation.z = -0.15;
      heartGroup.add(branchMesh);
    }

    // F. Pulmonary Trunk & Arteries (Blue bifurcation)
    const ptCurve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(-0.3, 0.5, 0.4),
      new THREE.Vector3(-0.2, 1.4, 0.3),
      new THREE.Vector3(0.4, 1.6, -0.1),
      new THREE.Vector3(1.1, 1.4, -0.4)
    );
    const ptGeo = new THREE.TubeGeometry(ptCurve, 24, 0.28, 16, false);
    const ptMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x0369a1,
      emissiveIntensity: 0.5,
      roughness: 0.25
    });
    const ptMesh = new THREE.Mesh(ptGeo, ptMat);
    registerMesh('pulmonary_artery', ptMesh);

    // G. Superior & Inferior Vena Cava (Blue tubes entering RA)
    const svcGeo = new THREE.CylinderGeometry(0.24, 0.24, 1.3, 16);
    const svcMat = new THREE.MeshStandardMaterial({
      color: 0x0369a1,
      emissive: 0x075985,
      emissiveIntensity: 0.4,
      roughness: 0.3
    });
    const svcMesh = new THREE.Mesh(svcGeo, svcMat);
    svcMesh.position.set(-1.45, 1.6, -0.1);
    svcMesh.rotation.z = 0.12;
    registerMesh('superior_inferior_vena_cava', svcMesh);

    const ivcMesh = new THREE.Mesh(svcGeo, svcMat);
    ivcMesh.position.set(-1.4, -0.5, -0.2);
    registerMesh('superior_inferior_vena_cava', ivcMesh);

    // H. Internal Cardiac Valves Indicator (Golden ring nodes)
    const valveRingGeo = new THREE.TorusGeometry(0.45, 0.05, 12, 24);
    const valveRingMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 0.7,
      roughness: 0.2
    });
    const valveRing1 = new THREE.Mesh(valveRingGeo, valveRingMat);
    valveRing1.position.set(0.65, 0.3, 0.1);
    valveRing1.rotation.x = Math.PI / 2;
    registerMesh('heart_valves', valveRing1);

    const valveRing2 = new THREE.Mesh(valveRingGeo, valveRingMat);
    valveRing2.position.set(-0.7, 0.3, 0.3);
    valveRing2.rotation.x = Math.PI / 2;
    registerMesh('heart_valves', valveRing2);

    // 7. Raycaster for click selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(heartGroup.children, true);

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
      const intersects = raycaster.intersectObjects(heartGroup.children, true);

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

    // 8. Animation Loop (Pulsing Cardiac Cycle)
    let startTime = performance.now();
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const animate = (now: number) => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const elapsed = (now - startTime) / 1000;
      const currentBpm = bpmRef.current;
      const beatFrequency = (currentBpm / 60) * 2 * Math.PI;

      // Realistic dual-phase heartbeat pulse (Atria contract then Ventricles contract)
      if (isPlayingRef.current && !prefersReducedMotion && !reducedMotionRef.current) {
        const cardiacScale = 1 + 0.05 * Math.sin(elapsed * beatFrequency) * Math.sin(elapsed * beatFrequency * 2);
        heartGroup.scale.set(cardiacScale, cardiacScale, cardiacScale);
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    // 9. Resize Observer
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

    // Cleanup
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

  // Emissive highlight on selected chamber
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
                mat.emissiveIntensity = 1.3;
                child.scale.set(1.1, 1.1, 1.1);
              } else if (isHovered) {
                mat.emissiveIntensity = 0.85;
                child.scale.set(1.04, 1.04, 1.04);
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

  // Camera Reset
  const handleResetCamera = useCallback(() => {
    if (!cameraRef.current || !controlsRef.current || !heartGroupRef.current) return;
    cameraRef.current.position.set(0, 1.2, 7.0);
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
    heartGroupRef.current.rotation.set(0, 0, 0);
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
          Your browser does not have active 3D WebGL support. Use the interactive 2D diagram above for the full cross-sectional learning experience.
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
          className={`icon-btn-sm ${isPlaying ? 'active' : ''}`}
          onClick={() => setIsPlaying((p) => !p)}
          title={isPlaying ? 'Pause Cardiac Contractions' : 'Start Cardiac Contractions'}
          aria-label={isPlaying ? 'Pause Contractions' : 'Start Contractions'}
        >
          {isPlaying ? <Pause size={15} /> : <Play size={15} />}
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

      {/* Heart Rate Indicator & Legend */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          background: 'rgba(7, 11, 20, 0.8)',
          backdropFilter: 'blur(8px)',
          padding: '0.4rem 0.75rem',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          fontSize: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          pointerEvents: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Heart size={14} color="#f43f5e" className={isPlaying ? 'animate-pulse' : ''} />
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            Cardiac Pulse: {bpm} BPM ({isPlaying ? 'Systole/Diastole Active' : 'Paused'})
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f43f5e' }} />
            Oxygenated (Systemic)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0284c7' }} />
            Deoxygenated (Pulmonary)
          </span>
        </div>
      </div>
    </div>
  );
};
