'use client';

import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';

// 3D Neural Brain Model with Dual Hemispheres, Synapses, and Neural Pulses
function BrainHologram({ hovered, setHovered }) {
  const groupRef = useRef();
  const leftHemiRef = useRef();
  const rightHemiRef = useRef();
  const pulseMeshRef = useRef();

  // Generate 3D Brain Morphology (Left & Right Hemispheres + Cerebellum)
  const {
    nodePositions,
    nodeColors,
    linePositions,
    linesRaw,
    pulseCount,
  } = useMemo(() => {
    const nodes = [];
    const positions = [];
    const colors = [];
    const lines = [];

    const cyan = new THREE.Color('#06b6d4');
    const violet = new THREE.Color('#8b5cf6');
    const emerald = new THREE.Color('#10b981');
    const sky = new THREE.Color('#38bdf8');

    // Create Left & Right Hemispheres
    const createHemisphere = (sign) => {
      const hemiNodes = [];
      const count = 55;

      for (let i = 0; i < count; i++) {
        // Parametric brain ellipsoid distribution
        const u = Math.random() * Math.PI;
        const v = Math.random() * Math.PI * 2;

        // Shape deformation to model frontal, temporal, and occipital lobes
        const xBase = 1.1 * Math.sin(u) * Math.cos(v);
        const yBase = 0.9 * Math.sin(u) * Math.sin(v) + (Math.cos(v) * 0.2);
        const zBase = 1.35 * Math.cos(u);

        // Hemispheric lateral separation & cortical curvature
        const x = (xBase * 0.75 + (sign * 0.85)) * (1 + 0.08 * Math.sin(yBase * 4));
        const y = yBase * 1.05;
        const z = zBase * 0.95;

        const pos = new THREE.Vector3(x, y, z);
        hemiNodes.push(pos);
        positions.push(x, y, z);

        // Color coding by cortical depth
        const color = Math.abs(x) > 0.8 ? cyan : Math.random() > 0.5 ? violet : sky;
        colors.push(color.r, color.g, color.b);
      }

      // Add Cerebellum & Brainstem cluster
      for (let i = 0; i < 10; i++) {
        const x = (Math.random() - 0.5) * 0.7 + (sign * 0.4);
        const y = -0.9 - Math.random() * 0.4;
        const z = -0.5 - Math.random() * 0.4;
        const pos = new THREE.Vector3(x, y, z);
        hemiNodes.push(pos);
        positions.push(x, y, z);
        colors.push(emerald.r, emerald.g, emerald.b);
      }

      // Interconnect adjacent neurons within hemisphere
      for (let i = 0; i < hemiNodes.length; i++) {
        let connections = 0;
        for (let j = i + 1; j < hemiNodes.length; j++) {
          const dist = hemiNodes[i].distanceTo(hemiNodes[j]);
          if (dist < 1.1 && connections < 3) {
            lines.push(
              hemiNodes[i].x, hemiNodes[i].y, hemiNodes[i].z,
              hemiNodes[j].x, hemiNodes[j].y, hemiNodes[j].z
            );
            connections++;
          }
        }
      }

      return hemiNodes;
    };

    const leftNodes = createHemisphere(-1);
    const rightNodes = createHemisphere(1);

    // Add Corpus Callosum (Cross-hemisphere bridges)
    for (let i = 0; i < leftNodes.length; i++) {
      if (Math.abs(leftNodes[i].x) < 0.6 && Math.abs(leftNodes[i].z) < 0.8) {
        for (let j = 0; j < rightNodes.length; j++) {
          if (Math.abs(rightNodes[j].x) < 0.6 && Math.abs(rightNodes[j].z) < 0.8) {
            const dist = leftNodes[i].distanceTo(rightNodes[j]);
            if (dist < 1.3) {
              lines.push(
                leftNodes[i].x, leftNodes[i].y, leftNodes[i].z,
                rightNodes[j].x, rightNodes[j].y, rightNodes[j].z
              );
            }
          }
        }
      }
    }

    return {
      nodePositions: new Float32Array(positions),
      nodeColors: new Float32Array(colors),
      linePositions: new Float32Array(lines),
      linesRaw: lines,
      pulseCount: 16,
    };
  }, []);

  // Neural Synaptic Firing Pulses
  const pulseData = useMemo(() => {
    const data = [];
    const lineCount = linesRaw.length / 6;
    for (let i = 0; i < pulseCount; i++) {
      data.push({
        lineIdx: Math.floor(Math.random() * lineCount),
        progress: Math.random(),
        speed: 0.3 + Math.random() * 0.4,
      });
    }
    return data;
  }, [linesRaw, pulseCount]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Animation Loop
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Gentle floating breathing animation
    const speed = hovered ? 0.7 : 0.35;
    groupRef.current.rotation.y += delta * speed;
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.08;

    // Synaptic Pulses
    if (pulseMeshRef.current) {
      for (let i = 0; i < pulseCount; i++) {
        const p = pulseData[i];
        p.progress += p.speed * (hovered ? delta * 1.8 : delta);
        if (p.progress > 1) {
          p.progress = 0;
          p.lineIdx = Math.floor(Math.random() * (linesRaw.length / 6));
        }

        const idx = p.lineIdx * 6;
        const x1 = linesRaw[idx];
        const y1 = linesRaw[idx + 1];
        const z1 = linesRaw[idx + 2];
        const x2 = linesRaw[idx + 3];
        const y2 = linesRaw[idx + 4];
        const z2 = linesRaw[idx + 5];

        const curX = THREE.MathUtils.lerp(x1, x2, p.progress);
        const curY = THREE.MathUtils.lerp(y1, y2, p.progress);
        const curZ = THREE.MathUtils.lerp(z1, z2, p.progress);

        dummy.position.set(curX, curY, curZ);
        const scale = Math.sin(p.progress * Math.PI) * 0.08 + 0.02;
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();

        pulseMeshRef.current.setMatrixAt(i, dummy.matrix);
      }
      pulseMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.8} floatIntensity={1.2}>
      <group
        ref={groupRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={1.2}
      >
        {/* Synaptic Connection Fibers */}
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={linePositions.length / 3}
              array={linePositions}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color={hovered ? '#38bdf8' : '#06b6d4'}
            transparent
            opacity={hovered ? 0.45 : 0.28}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </lineSegments>

        {/* Cortical Synaptic Nodes */}
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={nodePositions.length / 3}
              array={nodePositions}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              count={nodeColors.length / 3}
              array={nodeColors}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={hovered ? 0.18 : 0.14}
            vertexColors
            transparent
            opacity={0.95}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>

        {/* Dynamic Brainwave Action Potentials (Pulses) */}
        <instancedMesh ref={pulseMeshRef} args={[null, null, pulseCount]}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial
            color="#38bdf8"
            transparent
            opacity={0.95}
            blending={THREE.AdditiveBlending}
          />
        </instancedMesh>

        {/* Subtle Inner Volumetric Glow Sphere */}
        <mesh scale={0.75}>
          <sphereGeometry args={[1.2, 16, 16]} />
          <meshBasicMaterial
            color="#8b5cf6"
            wireframe
            transparent
            opacity={hovered ? 0.15 : 0.08}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>
    </Float>
  );
}

export default function InteractiveBioMesh() {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="relative w-full h-[280px] sm:h-[320px] rounded-2xl bg-surface-100/70 border border-white/10 backdrop-blur-md overflow-hidden glow-cyan group">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0.5, 4.8], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.7} />
        <pointLight position={[6, 6, 6]} color="#06b6d4" intensity={1.8} />
        <pointLight position={[-6, -4, -4]} color="#8b5cf6" intensity={1.4} />
        <pointLight position={[0, -5, 5]} color="#10b981" intensity={1.0} />

        <BrainHologram hovered={hovered} setHovered={setHovered} />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={!hovered}
          autoRotateSpeed={1.2}
          dampingFactor={0.05}
        />
      </Canvas>

      {/* Interactive Badge */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-surface-50/90 border border-white/10 text-[10px] font-mono text-slate-300 pointer-events-none flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
        <span>Drag to rotate 3D Neural Brain Hologram</span>
      </div>

      {/* Top indicator */}
      <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-md bg-surface-200/80 border border-white/5 text-[9px] font-mono text-cyan-300 pointer-events-none">
        // NEURAL_SYNAPSE_MESH: ACTIVE
      </div>
    </div>
  );
}
