import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RotateCcw, ZoomIn, ZoomOut, Eye, AlertCircle } from 'lucide-react';

interface Cell3DCanvasProps {
  selectedComponentId: string | null;
  onSelectComponent: (id: string) => void;
  showLabels?: boolean;
  reducedMotion?: boolean;
}

export const Cell3DCanvas: React.FC<Cell3DCanvasProps> = ({
  selectedComponentId,
  onSelectComponent,
  showLabels = true,
  reducedMotion = false
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshMapRef = useRef<Map<string, THREE.Object3D[]>>(new Map());
  const animFrameIdRef = useRef<number | null>(null);

  const [webGlSupported, setWebGlSupported] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const onSelectComponentRef = useRef(onSelectComponent);
  onSelectComponentRef.current = onSelectComponent;
  const reducedMotionRef = useRef(reducedMotion);
  reducedMotionRef.current = reducedMotion;

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

  // Initialize Three.js Scene
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
    camera.position.set(0, 2.5, 7.5);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    container.replaceChildren(renderer.domElement);

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3.5;
    controls.maxDistance = 15;
    controls.maxPolarAngle = Math.PI * 0.85;
    controlsRef.current = controls;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00f2fe, 1.4);
    dirLight1.position.set(5, 8, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x8b5cf6, 1.2);
    dirLight2.position.set(-6, -4, -4);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xffffff, 1.5, 12);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    // 6. Build Procedural Cell Geometry
    const meshMap = new Map<string, THREE.Object3D[]>();
    meshMapRef.current = meshMap;

    const registerMesh = (id: string, obj: THREE.Object3D) => {
      obj.userData = { componentId: id };
      scene.add(obj);
      const list = meshMap.get(id) || [];
      list.push(obj);
      meshMap.set(id, list);
    };

    // A. Outer Plasma Membrane (Semi-transparent cutaway sphere)
    const membraneGeo = new THREE.SphereGeometry(3.0, 48, 36);
    const membraneMat = new THREE.MeshPhysicalMaterial({
      color: 0x00f2fe,
      roughness: 0.15,
      metalness: 0.1,
      transmission: 0.85,
      opacity: 0.35,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const membraneMesh = new THREE.Mesh(membraneGeo, membraneMat);
    registerMesh('cell_membrane', membraneMesh);

    // B. Cytoplasm Particle Cloud
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      const r = Math.cbrt(Math.random()) * 2.7;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      posArray[i] = r * Math.sin(phi) * Math.cos(theta);
      posArray[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      posArray[i + 2] = r * Math.cos(phi);
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.05,
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.4
    });
    const cytoplasmPoints = new THREE.Points(particleGeo, particleMat);
    registerMesh('cytoplasm', cytoplasmPoints);

    // C. Nucleus (Large core sphere + Nucleolus inside)
    const nucleusGroup = new THREE.Group();
    const nucleusGeo = new THREE.SphereGeometry(1.15, 32, 24);
    const nucleusMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      roughness: 0.35,
      metalness: 0.2,
      emissive: 0x4c1d95,
      emissiveIntensity: 0.3
    });
    const nucleusOuter = new THREE.Mesh(nucleusGeo, nucleusMat);
    nucleusGroup.add(nucleusOuter);

    // Inner Nucleolus
    const nucleolusGeo = new THREE.SphereGeometry(0.48, 24, 16);
    const nucleolusMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0x7e22ce,
      emissiveIntensity: 0.8,
      roughness: 0.2
    });
    const nucleolusMesh = new THREE.Mesh(nucleolusGeo, nucleolusMat);
    nucleolusMesh.position.set(0.15, 0.15, 0.2);
    nucleusGroup.add(nucleolusMesh);
    nucleusGroup.position.set(0, 0, 0);
    registerMesh('nucleus', nucleusGroup);

    // D. Mitochondria (Capsule-shaped with cristae folds)
    const mitoPositions: [number, number, number, number, number, number][] = [
      [-1.8, 0.6, 0.5, 0.3, 0.5, 0.2],
      [-1.5, -1.2, 0.8, -0.4, 0.2, 0.8],
      [1.6, 1.2, -0.6, 0.5, -0.3, 0.4],
      [1.4, -1.3, -0.7, -0.2, 0.6, -0.3]
    ];
    mitoPositions.forEach((pos) => {
      const mitoGroup = new THREE.Group();
      const capsuleGeo = new THREE.CapsuleGeometry(0.24, 0.6, 12, 16);
      const capsuleMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xd97706,
        emissiveIntensity: 0.4,
        roughness: 0.3
      });
      const mitoOuter = new THREE.Mesh(capsuleGeo, capsuleMat);
      mitoGroup.add(mitoOuter);

      // Inner cristae rings
      for (let c = -0.2; c <= 0.2; c += 0.12) {
        const ringGeo = new THREE.TorusGeometry(0.18, 0.03, 8, 16);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = c;
        mitoGroup.add(ring);
      }

      mitoGroup.position.set(pos[0], pos[1], pos[2]);
      mitoGroup.rotation.set(pos[3], pos[4], pos[5]);
      registerMesh('mitochondria', mitoGroup);
    });

    // E. Endoplasmic Reticulum (Convoluted folded ribbon coils wrapping nucleus)
    const erGroup = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const radius = 1.35 + i * 0.18;
      const tubeGeo = new THREE.TorusGeometry(radius, 0.07, 10, 32, Math.PI * 1.2);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x059669,
        emissiveIntensity: 0.35,
        roughness: 0.4
      });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      tube.rotation.x = Math.PI * 0.25 + i * 0.15;
      tube.rotation.y = Math.PI * 0.1 * i;
      erGroup.add(tube);
    }
    erGroup.position.set(0, 0, 0);
    registerMesh('endoplasmic_reticulum', erGroup);

    // F. Golgi Apparatus (Stacked curved plates)
    const golgiGroup = new THREE.Group();
    for (let g = 0; g < 4; g++) {
      const arcGeo = new THREE.TorusGeometry(0.65 - g * 0.08, 0.06, 12, 24, Math.PI * 0.85);
      const arcMat = new THREE.MeshStandardMaterial({
        color: 0xec4899,
        emissive: 0xdb2777,
        emissiveIntensity: 0.4,
        roughness: 0.3
      });
      const arc = new THREE.Mesh(arcGeo, arcMat);
      arc.position.set(0, g * 0.14 - 0.2, 0);
      arc.rotation.z = Math.PI * 0.1;
      golgiGroup.add(arc);
    }
    // Add small budding secretory vesicles around Golgi
    for (let v = 0; v < 6; v++) {
      const vGeo = new THREE.SphereGeometry(0.06, 12, 12);
      const vMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, emissive: 0xec4899, emissiveIntensity: 0.6 });
      const vesicle = new THREE.Mesh(vGeo, vMat);
      vesicle.position.set(
        (Math.random() - 0.5) * 0.6 + 0.4,
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.3
      );
      golgiGroup.add(vesicle);
    }
    golgiGroup.position.set(1.5, -0.4, 0.4);
    registerMesh('golgi_apparatus', golgiGroup);

    // G. Lysosomes (Red-orange enzyme spheres)
    const lysosomePositions: [number, number, number][] = [
      [-1.3, -0.6, -1.2],
      [-0.8, 1.8, -0.5],
      [1.1, -1.5, 0.9]
    ];
    lysosomePositions.forEach((lpos) => {
      const lysoGeo = new THREE.SphereGeometry(0.22, 16, 16);
      const lysoMat = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: 0xb91c1c,
        emissiveIntensity: 0.6,
        roughness: 0.25
      });
      const lysoMesh = new THREE.Mesh(lysoGeo, lysoMat);
      lysoMesh.position.set(lpos[0], lpos[1], lpos[2]);
      registerMesh('lysosomes', lysoMesh);
    });

    // H. Ribosomes (Dispersed bright cyan dots)
    const riboCount = 120;
    const riboGeo = new THREE.BufferGeometry();
    const riboPositions = new Float32Array(riboCount * 3);
    for (let r = 0; r < riboCount * 3; r += 3) {
      // Clustered near ER and freely dispersed
      const dist = 1.3 + Math.random() * 1.2;
      const angle = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;
      riboPositions[r] = dist * Math.cos(phi) * Math.cos(angle);
      riboPositions[r + 1] = dist * Math.cos(phi) * Math.sin(angle);
      riboPositions[r + 2] = dist * Math.sin(phi);
    }
    riboGeo.setAttribute('position', new THREE.BufferAttribute(riboPositions, 3));
    const riboMat = new THREE.PointsMaterial({
      size: 0.07,
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85
    });
    const riboPoints = new THREE.Points(riboGeo, riboMat);
    registerMesh('ribosomes', riboPoints);

    // 7. Raycasting & Click Handler
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

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
      const intersects = raycaster.intersectObjects(scene.children, true);

      let foundId: string | null = null;
      for (const hit of intersects) {
        let curr: THREE.Object3D | null = hit.object;
        while (curr && !curr.userData.componentId) {
          curr = curr.parent;
        }
        if (curr && curr.userData.componentId && curr.userData.componentId !== 'cell_membrane') {
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

    // 8. Animation Loop
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      if (!prefersReducedMotion && !reducedMotionRef.current) {
        scene.rotation.y += 0.003;
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

  // Highlight selected organelle
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
                mat.emissiveIntensity = 1.2;
                child.scale.set(1.12, 1.12, 1.12);
              } else if (isHovered) {
                mat.emissiveIntensity = 0.8;
                child.scale.set(1.05, 1.05, 1.05);
              } else {
                mat.emissiveIntensity = compId === 'nucleus' ? 0.3 : 0.4;
                child.scale.set(1, 1, 1);
              }
            }
          }
        });
      });
    });
  }, [selectedComponentId, hoveredId]);

  // Reset Camera View
  const handleResetCamera = useCallback(() => {
    if (!cameraRef.current || !controlsRef.current || !sceneRef.current) return;
    cameraRef.current.position.set(0, 2.5, 7.5);
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
    sceneRef.current.rotation.set(0, 0, 0);
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
          Your browser or device does not currently have WebGL active. Switch to the interactive 2D diagram above for the full learning experience.
        </p>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '440px' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%', minHeight: '440px', borderRadius: '12px', overflow: 'hidden' }} />

      {/* 3D Floating Control HUD */}
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
        {showLabels && (hoveredId || selectedComponentId) && (
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-cyan)', paddingRight: '0.4rem', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
            {(hoveredId || selectedComponentId)?.replace('_', ' ').toUpperCase()}
          </span>
        )}
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

      {/* Orbit Tip Badge */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          background: 'rgba(7, 11, 20, 0.75)',
          backdropFilter: 'blur(8px)',
          padding: '0.25rem 0.65rem',
          borderRadius: '6px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          pointerEvents: 'none'
        }}
      >
        <Eye size={12} color="var(--accent-cyan)" />
        <span>Drag to rotate, or use the structure list. Scroll to zoom. Click a part to inspect.</span>
      </div>
    </div>
  );
};
