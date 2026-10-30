'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere } from '@react-three/drei';
import * as THREE from 'three';

// Data pulse packet travelling along connection lines
function DataPulses({ lines, isReducedMotion }) {
  const meshRef = useRef();
  const pulseCount = 18;

  // Track progress along lines
  const pulseData = useMemo(() => {
    const data = [];
    const lineCount = lines.length / 6;
    for (let i = 0; i < pulseCount; i++) {
      const lineIdx = Math.floor(Math.random() * lineCount);
      data.push({
        lineIdx,
        progress: Math.random(),
        speed: 0.15 + Math.random() * 0.25,
      });
    }
    return data;
  }, [lines]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    if (!meshRef.current || isReducedMotion) return;

    for (let i = 0; i < pulseCount; i++) {
      const p = pulseData[i];
      p.progress += p.speed * delta;
      if (p.progress > 1) {
        p.progress = 0;
        p.lineIdx = Math.floor(Math.random() * (lines.length / 6));
      }

      const idx = p.lineIdx * 6;
      const x1 = lines[idx];
      const y1 = lines[idx + 1];
      const z1 = lines[idx + 2];
      const x2 = lines[idx + 3];
      const y2 = lines[idx + 4];
      const z2 = lines[idx + 5];

      const curX = THREE.MathUtils.lerp(x1, x2, p.progress);
      const curY = THREE.MathUtils.lerp(y1, y2, p.progress);
      const curZ = THREE.MathUtils.lerp(z1, z2, p.progress);

      dummy.position.set(curX, curY, curZ);
      const scale = Math.sin(p.progress * Math.PI) * 0.12 + 0.04;
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, pulseCount]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#38bdf8" transparent opacity={0.9} blending={THREE.AdditiveBlending} />
    </instancedMesh>
  );
}

// Central 3D Computational / Bio-Neural Core
function CentralCore({ isReducedMotion }) {
  const coreRef = useRef();

  useFrame((state, delta) => {
    if (!coreRef.current || isReducedMotion) return;
    coreRef.current.rotation.x += delta * 0.2;
    coreRef.current.rotation.y += delta * 0.3;
    coreRef.current.rotation.z += delta * 0.1;
  });

  return (
    <group ref={coreRef} position={[0, 0, 0]}>
      {/* Outer wireframe icosahedron */}
      <mesh>
        <icosahedronGeometry args={[2.2, 1]} />
        <meshBasicMaterial
          color="#06b6d4"
          wireframe
          transparent
          opacity={0.18}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Inner glowing core */}
      <mesh>
        <octahedronGeometry args={[1.2, 0]} />
        <meshBasicMaterial
          color="#8b5cf6"
          wireframe
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

// 3D Synaptic Network & Particle Cloud
function NetworkGraph({ isReducedMotion }) {
  const groupRef = useRef();
  const mouse = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  // Generate nodes and connections
  const { nodePositions, linePositions, nodeColors, linesRaw } = useMemo(() => {
    const count = 56;
    const radius = 9.5;
    const positions = [];
    const colors = [];
    const lines = [];

    const colorPalette = [
      new THREE.Color('#06b6d4'), // Cyan
      new THREE.Color('#10b981'), // Emerald
      new THREE.Color('#8b5cf6'), // Violet
      new THREE.Color('#38bdf8'), // Electric Sky
    ];

    const nodes = [];
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;

      const r = radius * (0.35 + 0.65 * Math.random());
      const x = r * Math.cos(theta) * Math.sin(phi);
      const y = r * Math.sin(theta) * Math.sin(phi);
      const z = r * Math.cos(phi) * 0.8;

      nodes.push(new THREE.Vector3(x, y, z));
      positions.push(x, y, z);

      const color = colorPalette[i % colorPalette.length];
      colors.push(color.r, color.g, color.b);
    }

    // Connect close neighbors
    const maxDistance = 4.8;
    for (let i = 0; i < nodes.length; i++) {
      let connections = 0;
      for (let j = i + 1; j < nodes.length; j++) {
        const dist = nodes[i].distanceTo(nodes[j]);
        if (dist < maxDistance && connections < 3) {
          lines.push(
            nodes[i].x, nodes[i].y, nodes[i].z,
            nodes[j].x, nodes[j].y, nodes[j].z
          );
          connections++;
        }
      }
    }

    return {
      nodePositions: new Float32Array(positions),
      nodeColors: new Float32Array(colors),
      linePositions: new Float32Array(lines),
      linesRaw: lines,
    };
  }, []);

  // Track cursor movement for interactive parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      mouse.current.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Frame update
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (!isReducedMotion) {
      // Smooth cursor lerp
      mouse.current.x += (mouse.current.targetX - mouse.current.x) * 0.04;
      mouse.current.y += (mouse.current.targetY - mouse.current.y) * 0.04;

      // Organic rotation + cursor sway
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.08 + mouse.current.x * 0.35;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.1 + mouse.current.y * 0.2;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Central 3D Core */}
      <CentralCore isReducedMotion={isReducedMotion} />

      {/* Network Edges */}
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
          color="#06b6d4"
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {/* Nodes */}
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
          size={0.32}
          vertexColors
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Dynamic Data Pulses */}
      <DataPulses lines={linesRaw} isReducedMotion={isReducedMotion} />
    </group>
  );
}

// Background Floating Ambient Particles
function AmbientParticles({ isReducedMotion }) {
  const pointsRef = useRef();
  const count = 75;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 28;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 16 - 2;
    }
    return pos;
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current || isReducedMotion) return;
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.03) * 0.05;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.14}
        color="#38bdf8"
        transparent
        opacity={0.45}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export default function NeuralNetworkScene() {
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handler = (e) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return (
    <div className="w-full h-full absolute inset-0 pointer-events-none z-0">
      <Canvas
        camera={{ position: [0, 0, 13], fov: 48 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        performance={{ min: 0.5 }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 12, 10]} intensity={1.5} color="#06b6d4" />
        <pointLight position={[-10, -10, -8]} intensity={1.0} color="#8b5cf6" />
        <pointLight position={[0, -8, 8]} intensity={0.8} color="#10b981" />

        <NetworkGraph isReducedMotion={isReducedMotion} />
        <AmbientParticles isReducedMotion={isReducedMotion} />
      </Canvas>
    </div>
  );
}
