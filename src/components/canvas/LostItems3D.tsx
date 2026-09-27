'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Common floating item interface
interface FloatingObjectProps {
  position: [number, number, number];
  rotationSpeed?: [number, number, number];
  floatSpeed?: number;
  floatAmplitude?: number;
  phaseOffset?: number;
  scale?: number;
}

// 1. Keyring with metallic keys and blue tag
export function KeyRingMesh({
  position,
  rotationSpeed = [0.005, 0.008, 0.003],
  floatSpeed = 1.2,
  floatAmplitude = 0.35,
  phaseOffset = 0,
  scale = 1,
}: FloatingObjectProps) {
  const groupRef = useRef<THREE.Group>(null);
  const initialY = position[1];

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime() + phaseOffset;
    groupRef.current.position.y = initialY + Math.sin(time * floatSpeed) * floatAmplitude;
    groupRef.current.rotation.x += rotationSpeed[0];
    groupRef.current.rotation.y += rotationSpeed[1];
    groupRef.current.rotation.z += rotationSpeed[2];
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Brass ring */}
      <mesh>
        <torusGeometry args={[0.55, 0.06, 12, 28]} />
        <meshStandardMaterial color="#d97706" metalness={0.88} roughness={0.25} />
      </mesh>
      {/* Key 1: Yale key */}
      <group position={[0.2, -0.6, 0.05]} rotation={[0, 0, -0.4]}>
        {/* Head */}
        <mesh>
          <cylinderGeometry args={[0.25, 0.25, 0.04, 16]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Blade */}
        <mesh position={[0, -0.5, 0]}>
          <boxGeometry args={[0.12, 0.7, 0.03]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>
      {/* Key 2 */}
      <group position={[-0.15, -0.65, -0.05]} rotation={[0, 0, 0.35]}>
        <mesh>
          <cylinderGeometry args={[0.22, 0.22, 0.04, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.45, 0]}>
          <boxGeometry args={[0.1, 0.65, 0.03]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.3} />
        </mesh>
      </group>
      {/* Azure identification tag */}
      <group position={[0.4, -0.45, 0.1]} rotation={[0, 0, -0.9]}>
        <mesh>
          <boxGeometry args={[0.3, 0.65, 0.04]} />
          <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.15} />
        </mesh>
      </group>
    </group>
  );
}

// 2. Spectacles / Eyeglasses
export function GlassesMesh({
  position,
  rotationSpeed = [0.004, 0.007, 0.002],
  floatSpeed = 0.9,
  floatAmplitude = 0.3,
  phaseOffset = 1.5,
  scale = 1,
}: FloatingObjectProps) {
  const groupRef = useRef<THREE.Group>(null);
  const initialY = position[1];

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime() + phaseOffset;
    groupRef.current.position.y = initialY + Math.sin(time * floatSpeed) * floatAmplitude;
    groupRef.current.rotation.x += rotationSpeed[0];
    groupRef.current.rotation.y += rotationSpeed[1];
    groupRef.current.rotation.z += rotationSpeed[2];
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Left frame */}
      <mesh position={[-0.7, 0, 0]}>
        <torusGeometry args={[0.48, 0.045, 10, 24]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Left lens */}
      <mesh position={[-0.7, 0, 0]}>
        <cylinderGeometry args={[0.44, 0.44, 0.015, 20]} />
        <meshPhysicalMaterial
          color="#e0f2fe"
          transmission={0.85}
          opacity={0.65}
          transparent
          roughness={0.05}
          metalness={0.1}
        />
      </mesh>
      {/* Right frame */}
      <mesh position={[0.7, 0, 0]}>
        <torusGeometry args={[0.48, 0.045, 10, 24]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Right lens */}
      <mesh position={[0.7, 0, 0]}>
        <cylinderGeometry args={[0.44, 0.44, 0.015, 20]} />
        <meshPhysicalMaterial
          color="#e0f2fe"
          transmission={0.85}
          opacity={0.65}
          transparent
          roughness={0.05}
          metalness={0.1}
        />
      </mesh>
      {/* Nose bridge */}
      <mesh position={[0, 0.12, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.035, 0.035, 0.45, 12]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Left temple */}
      <mesh position={[-1.15, 0.1, -0.6]} rotation={[0.05, -0.1, 0]}>
        <boxGeometry args={[0.04, 0.04, 1.2]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Right temple */}
      <mesh position={[1.15, 0.1, -0.6]} rotation={[0.05, 0.1, 0]}>
        <boxGeometry args={[0.04, 0.04, 1.2]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
}

// 3. Leather Bifold Wallet
export function WalletMesh({
  position,
  rotationSpeed = [0.006, 0.005, 0.003],
  floatSpeed = 1.1,
  floatAmplitude = 0.28,
  phaseOffset = 3.0,
  scale = 1,
}: FloatingObjectProps) {
  const groupRef = useRef<THREE.Group>(null);
  const initialY = position[1];

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime() + phaseOffset;
    groupRef.current.position.y = initialY + Math.sin(time * floatSpeed) * floatAmplitude;
    groupRef.current.rotation.x += rotationSpeed[0];
    groupRef.current.rotation.y += rotationSpeed[1];
    groupRef.current.rotation.z += rotationSpeed[2];
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Bottom fold */}
      <mesh position={[0, -0.06, 0]}>
        <boxGeometry args={[1.5, 0.12, 1.1]} />
        <meshStandardMaterial color="#3b2219" roughness={0.65} metalness={0.08} />
      </mesh>
      {/* Top fold slightly angled */}
      <group position={[0, 0.06, 0]} rotation={[0.15, 0, 0]}>
        <mesh>
          <boxGeometry args={[1.48, 0.1, 1.08]} />
          <meshStandardMaterial color="#451a03" roughness={0.6} metalness={0.08} />
        </mesh>
        {/* Transit card sticking out */}
        <mesh position={[0.2, 0.07, 0.1]} rotation={[0, 0.1, 0]}>
          <boxGeometry args={[0.85, 0.015, 0.54]} />
          <meshStandardMaterial color="#0284c7" roughness={0.2} metalness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

// 4. Smartwatch
export function SmartwatchMesh({
  position,
  rotationSpeed = [0.007, 0.006, 0.004],
  floatSpeed = 1.3,
  floatAmplitude = 0.32,
  phaseOffset = 4.2,
  scale = 1,
}: FloatingObjectProps) {
  const groupRef = useRef<THREE.Group>(null);
  const initialY = position[1];

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime() + phaseOffset;
    groupRef.current.position.y = initialY + Math.sin(time * floatSpeed) * floatAmplitude;
    groupRef.current.rotation.x += rotationSpeed[0];
    groupRef.current.rotation.y += rotationSpeed[1];
    groupRef.current.rotation.z += rotationSpeed[2];
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Chassis */}
      <mesh>
        <boxGeometry args={[0.95, 1.15, 0.28]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* OLED Screen */}
      <mesh position={[0, 0, 0.145]}>
        <boxGeometry args={[0.82, 0.98, 0.02]} />
        <meshStandardMaterial color="#0369a1" roughness={0.1} emissive="#0284c7" emissiveIntensity={0.25} />
      </mesh>
      {/* Digital crown button */}
      <mesh position={[0.5, 0.25, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 0.1, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Strap top */}
      <mesh position={[0, 0.8, -0.05]} rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[0.7, 0.6, 0.08]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>
      {/* Strap bottom */}
      <mesh position={[0, -0.8, -0.05]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.7, 0.6, 0.08]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>
    </group>
  );
}

// 5. Smartphone Slab
export function SmartphoneMesh({
  position,
  rotationSpeed = [0.005, 0.004, 0.005],
  floatSpeed = 0.95,
  floatAmplitude = 0.25,
  phaseOffset = 2.1,
  scale = 1,
}: FloatingObjectProps) {
  const groupRef = useRef<THREE.Group>(null);
  const initialY = position[1];

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime() + phaseOffset;
    groupRef.current.position.y = initialY + Math.sin(time * floatSpeed) * floatAmplitude;
    groupRef.current.rotation.x += rotationSpeed[0];
    groupRef.current.rotation.y += rotationSpeed[1];
    groupRef.current.rotation.z += rotationSpeed[2];
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Body Frame */}
      <mesh>
        <boxGeometry args={[1.1, 2.1, 0.14]} />
        <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.25} />
      </mesh>
      {/* Front Glass */}
      <mesh position={[0, 0, 0.075]}>
        <boxGeometry args={[1.02, 1.98, 0.015]} />
        <meshStandardMaterial color="#020617" roughness={0.1} metalness={0.3} />
      </mesh>
      {/* Camera bump back */}
      <mesh position={[0.3, 0.65, -0.09]}>
        <boxGeometry args={[0.38, 0.45, 0.05]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Camera lenses */}
      <mesh position={[0.3, 0.72, -0.12]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.03, 14]} />
        <meshStandardMaterial color="#0284c7" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0.3, 0.58, -0.12]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.03, 14]} />
        <meshStandardMaterial color="#0284c7" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

// 6. Wireless Earbuds Capsule Case
export function EarbudsCaseMesh({
  position,
  rotationSpeed = [0.007, 0.008, 0.004],
  floatSpeed = 1.25,
  floatAmplitude = 0.3,
  phaseOffset = 5.1,
  scale = 1,
}: FloatingObjectProps) {
  const groupRef = useRef<THREE.Group>(null);
  const initialY = position[1];

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime() + phaseOffset;
    groupRef.current.position.y = initialY + Math.sin(time * floatSpeed) * floatAmplitude;
    groupRef.current.rotation.x += rotationSpeed[0];
    groupRef.current.rotation.y += rotationSpeed[1];
    groupRef.current.rotation.z += rotationSpeed[2];
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Case base */}
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.42, 0.38, 0.5, 24]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.2} roughness={0.15} />
      </mesh>
      {/* Case cap */}
      <mesh position={[0, 0.18, 0]}>
        <sphereGeometry args={[0.42, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#f1f5f9" metalness={0.2} roughness={0.15} />
      </mesh>
      {/* LED indicator */}
      <mesh position={[0, -0.05, 0.43]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1} />
      </mesh>
    </group>
  );
}

// 7. Signet Ring
export function SignetRingMesh({
  position,
  rotationSpeed = [0.008, 0.006, 0.005],
  floatSpeed = 1.05,
  floatAmplitude = 0.26,
  phaseOffset = 0.8,
  scale = 1,
}: FloatingObjectProps) {
  const groupRef = useRef<THREE.Group>(null);
  const initialY = position[1];

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime() + phaseOffset;
    groupRef.current.position.y = initialY + Math.sin(time * floatSpeed) * floatAmplitude;
    groupRef.current.rotation.x += rotationSpeed[0];
    groupRef.current.rotation.y += rotationSpeed[1];
    groupRef.current.rotation.z += rotationSpeed[2];
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Circular band */}
      <mesh>
        <torusGeometry args={[0.42, 0.12, 16, 24]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.92} roughness={0.18} />
      </mesh>
      {/* Signet flat top face */}
      <mesh position={[0, 0.44, 0]}>
        <cylinderGeometry args={[0.26, 0.28, 0.08, 6]} />
        <meshStandardMaterial color="#0284c7" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}
