'use client';

import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  KeyRingMesh,
  GlassesMesh,
  WalletMesh,
  SmartwatchMesh,
  SmartphoneMesh,
  EarbudsCaseMesh,
  SignetRingMesh,
} from './LostItems3D';

// Camera controller that creates mouse parallax
function ParallaxCameraRig() {
  const targetLook = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state) => {
    const { pointer } = state;
    // Parallax camera displacement
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, pointer.x * 1.6, 0.035);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, pointer.y * 1.2, 0.035);
    
    // Subtle look-at damping
    targetLook.current.x = THREE.MathUtils.lerp(targetLook.current.x, pointer.x * 0.4, 0.035);
    targetLook.current.y = THREE.MathUtils.lerp(targetLook.current.y, pointer.y * 0.3, 0.035);
    state.camera.lookAt(targetLook.current);
  });

  return null;
}

// Low-poly micro particulate field (zero-g dust particles)
function ZeroGravityDust() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 120;

  const positions = React.useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 14 - 2;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.015;
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
        size={0.06}
        color="#38bdf8"
        transparent
        opacity={0.35}
        sizeAttenuation
      />
    </points>
  );
}

export default function ZeroGravityScene() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#06090e]">
      {/* Background Radial Tint (Cyan / Charcoal, zero purple) */}
      <div className="absolute inset-0 bg-radial-subtle opacity-70 pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

      <Canvas
        camera={{ position: [0, 0, 8.5], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ pointerEvents: 'none' }}
      >
        <Suspense fallback={null}>
          <ParallaxCameraRig />

          {/* Clean technical lighting setup */}
          <ambientLight intensity={0.8} />
          <directionalLight position={[6, 8, 6]} intensity={1.4} color="#f8fafc" />
          <directionalLight position={[-6, -4, -4]} intensity={0.6} color="#38bdf8" />
          <pointLight position={[0, 4, 3]} intensity={0.9} color="#7dd3fc" />

          {/* Zero gravity floating dust */}
          <ZeroGravityDust />

          {/* 7 Stylized lost items positioned across 3D space */}
          {/* Top Left: Keyring */}
          <KeyRingMesh
            position={[-4.2, 2.3, -2.5]}
            scale={0.85}
            rotationSpeed={[0.005, 0.007, 0.002]}
            floatSpeed={1.1}
            phaseOffset={0.2}
          />

          {/* Top Right: Glasses */}
          <GlassesMesh
            position={[4.4, 2.6, -2.8]}
            scale={0.9}
            rotationSpeed={[0.004, 0.006, 0.003]}
            floatSpeed={0.95}
            phaseOffset={1.6}
          />

          {/* Mid Left: Wallet */}
          <WalletMesh
            position={[-4.8, -1.2, -1.8]}
            scale={0.8}
            rotationSpeed={[0.005, 0.004, 0.003]}
            floatSpeed={1.05}
            phaseOffset={2.7}
          />

          {/* Mid Right: Smartwatch */}
          <SmartwatchMesh
            position={[4.6, -1.5, -2.2]}
            scale={0.85}
            rotationSpeed={[0.006, 0.005, 0.004]}
            floatSpeed={1.2}
            phaseOffset={3.8}
          />

          {/* Far Deep Center: Smartphone */}
          <SmartphoneMesh
            position={[-1.2, 3.2, -4.5]}
            scale={0.7}
            rotationSpeed={[0.004, 0.005, 0.002]}
            floatSpeed={0.85}
            phaseOffset={4.5}
          />

          {/* Bottom Left Center: Earbuds Case */}
          <EarbudsCaseMesh
            position={[-2.4, -2.8, -2.0]}
            scale={0.9}
            rotationSpeed={[0.007, 0.006, 0.003]}
            floatSpeed={1.3}
            phaseOffset={5.2}
          />

          {/* Bottom Right Center: Signet Ring */}
          <SignetRingMesh
            position={[2.8, -2.9, -1.5]}
            scale={0.95}
            rotationSpeed={[0.008, 0.007, 0.004]}
            floatSpeed={1.15}
            phaseOffset={0.9}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
