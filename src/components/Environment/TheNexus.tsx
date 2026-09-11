import React, { useRef, useMemo } from 'react';
import { RigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';
import { getNexusFloorTexture, getNexusWallTexture, getCeilingTexture } from '../../utils/textureGenerator';

export const TheNexus: React.FC = () => {
  const { setMessage, hasItem, setActivePuzzle, escaped } = useGameStore();
  const nexusCoreRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const coreGlowRef = useRef<THREE.MeshStandardMaterial>(null);
  const portalGlowRef = useRef<THREE.MeshStandardMaterial>(null);
  const consoleGlowRef = useRef<THREE.MeshStandardMaterial>(null);

  const floorTexture = useMemo(() => getNexusFloorTexture(), []);
  const wallTexture = useMemo(() => getNexusWallTexture(), []);
  const ceilingTexture = useMemo(() => getCeilingTexture(), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Central Nexus Hyper-Polyhedron
    if (nexusCoreRef.current) {
      nexusCoreRef.current.rotation.y = t * 0.4;
      nexusCoreRef.current.rotation.x = Math.sin(t * 0.5) * 0.2;
      nexusCoreRef.current.scale.setScalar(1 + Math.sin(t * 2.5) * 0.08);
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = t * 0.6;
      ring1Ref.current.rotation.x = Math.sin(t * 0.4) * 0.3;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -t * 0.5;
      ring2Ref.current.rotation.y = Math.cos(t * 0.4) * 0.3;
    }

    if (coreGlowRef.current) {
      coreGlowRef.current.emissiveIntensity = 2.8 + Math.sin(t * 3) * 1.0;
    }
    if (portalGlowRef.current) {
      portalGlowRef.current.emissiveIntensity = escaped
        ? 3.5 + Math.sin(t * 6) * 0.8
        : 1.8 + Math.sin(t * 2) * 0.5;
    }
    if (consoleGlowRef.current) {
      consoleGlowRef.current.emissiveIntensity = hasItem('Omni Core')
        ? 2.5 + Math.sin(t * 4) * 0.6
        : 1.2 + Math.sin(t * 2) * 0.3;
    }
  });

  const handleSynthesizer = () => {
    if (hasItem('Singularity Prism')) {
      setMessage('The Quantum Synthesizer is aligned. Singularity Prism extracted.');
    } else {
      setActivePuzzle(12);
    }
  };

  const handleGravityHub = () => {
    if (hasItem('Omni Core')) {
      setMessage('The Gravity Inversion Hub is calibrated. Omni Core active.');
    } else if (hasItem('Singularity Prism')) {
      setActivePuzzle(13);
    } else {
      setMessage('The Gravity Inversion Hub requires a calibrated Singularity Prism.');
    }
  };

  const handleGateway = () => {
    if (escaped) return;
    if (hasItem('Omni Core')) {
      setActivePuzzle(14);
    } else {
      setMessage('The Final Gateway is sealed. The central Omni Core is required to bridge the event horizon.');
    }
  };

  return (
    <>
      {/* Golden Quantum Tessellation Floor */}
      <RigidBody type="fixed">
        <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[36, 36]} />
          <meshStandardMaterial map={floorTexture} roughness={0.3} metalness={0.8} />
        </mesh>
      </RigidBody>

      {/* Ceiling */}
      <RigidBody type="fixed">
        <mesh position={[0, 12, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[36, 36]} />
          <meshStandardMaterial map={ceilingTexture} roughness={0.8} />
        </mesh>
      </RigidBody>

      {/* Perimeter Obsidian Walls with Gold Circuitry */}
      <RigidBody type="fixed">
        <mesh position={[0, 6, -18]}><boxGeometry args={[36, 12, 0.8]} /><meshStandardMaterial map={wallTexture} roughness={0.4} metalness={0.7} /></mesh>
        <mesh position={[0, 6, 18]}><boxGeometry args={[36, 12, 0.8]} /><meshStandardMaterial map={wallTexture} roughness={0.4} metalness={0.7} /></mesh>
        <mesh position={[18, 6, 0]}><boxGeometry args={[0.8, 12, 36]} /><meshStandardMaterial map={wallTexture} roughness={0.4} metalness={0.7} /></mesh>
        <mesh position={[-18, 6, 0]}><boxGeometry args={[0.8, 12, 36]} /><meshStandardMaterial map={wallTexture} roughness={0.4} metalness={0.7} /></mesh>
      </RigidBody>

      {/* 4 Majestic Golden Quantum Obelisks in Corners */}
      {[[-10, -10], [10, -10], [-10, 10], [10, 10]].map(([ox, oz], idx) => (
        <RigidBody key={idx} type="fixed" position={[ox, 4, oz]}>
          <mesh>
            <cylinderGeometry args={[0.4, 0.8, 8, 8]} />
            <meshStandardMaterial color="#241a07" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0, 4.2, 0]}>
            <octahedronGeometry args={[0.3, 0]} />
            <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={2.5} />
          </mesh>
        </RigidBody>
      ))}

      {/* Center Quantum Singularity Core (Interactable #12) */}
      <RigidBody type="fixed" position={[0, 3.5, 0]}>
        {/* Core Base Pedestal */}
        <mesh position={[0, -2.5, 0]} userData={{ name: 'Quantum Synthesizer Core', interactable: true, onInteract: handleSynthesizer }}>
          <cylinderGeometry args={[2.0, 2.8, 1.8, 24]} />
          <meshStandardMaterial color="#1c1508" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Floating Quantum Crystal Core */}
        <mesh ref={nexusCoreRef} position={[0, 0.2, 0]} userData={{ name: 'Quantum Synthesizer Core', interactable: true, onInteract: handleSynthesizer }}>
          <dodecahedronGeometry args={[1.5, 1]} />
          <meshStandardMaterial
            ref={coreGlowRef}
            color="#fbbf24"
            emissive="#d97706"
            emissiveIntensity={2.8}
            roughness={0.1}
          />
        </mesh>

        {/* Spinning Golden Energy Rings */}
        <mesh ref={ring1Ref} position={[0, 0.2, 0]}>
          <torusGeometry args={[2.5, 0.08, 16, 64]} />
          <meshStandardMaterial color="#fef08a" emissive="#fbbf24" emissiveIntensity={2.0} />
        </mesh>
        <mesh ref={ring2Ref} position={[0, 0.2, 0]}>
          <torusGeometry args={[3.0, 0.06, 16, 64]} />
          <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={2.0} />
        </mesh>
      </RigidBody>

      {/* Interactable #13: Gravity Inversion Hub */}
      <RigidBody type="fixed" position={[-10, 0, 0]}>
        <mesh position={[0, 1.0, 0]} userData={{ name: 'Gravity Inversion Hub', interactable: true, onInteract: handleGravityHub }}>
          <boxGeometry args={[2.6, 2.0, 1.8]} />
          <meshStandardMaterial color="#1c1508" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Golden Control Glyph Panel */}
        <mesh position={[0, 1.3, 0.91]} userData={{ name: 'Gravity Inversion Hub', interactable: true, onInteract: handleGravityHub }}>
          <planeGeometry args={[2.0, 1.2]} />
          <meshStandardMaterial color="#78350f" emissive="#fbbf24" emissiveIntensity={1.8} />
        </mesh>
      </RigidBody>

      {/* Interactable #14: Final Gateway Extraction Portal & Control Terminal */}
      {/* Gateway Control Terminal Pedestal */}
      <RigidBody type="fixed" position={[0, 0, 14.5]}>
        <mesh position={[0, 0.8, 0]} userData={{ name: 'Final Gateway Portal', interactable: true, onInteract: handleGateway }}>
          <cylinderGeometry args={[0.6, 0.8, 1.6, 16]} />
          <meshStandardMaterial color="#1c1508" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Terminal Screen Console */}
        <mesh position={[0, 1.65, 0]} rotation={[-0.3, 0, 0]} userData={{ name: 'Final Gateway Portal', interactable: true, onInteract: handleGateway }}>
          <boxGeometry args={[1.0, 0.15, 0.8]} />
          <meshStandardMaterial color="#241a07" metalness={0.8} />
        </mesh>
        {/* Glowing Terminal Display */}
        <mesh position={[0, 1.74, 0]} rotation={[-0.3, 0, 0]} userData={{ name: 'Final Gateway Portal', interactable: true, onInteract: handleGateway }}>
          <planeGeometry args={[0.8, 0.6]} />
          <meshStandardMaterial
            ref={consoleGlowRef}
            color="#fbbf24"
            emissive={hasItem('Omni Core') ? '#38bdf8' : '#fbbf24'}
            emissiveIntensity={2.0}
            side={THREE.DoubleSide}
          />
        </mesh>
      </RigidBody>

      {/* Massive Gateway Arch Portal Structure */}
      <RigidBody type="fixed" position={[0, 4.5, 17.2]}>
        {/* Arch Frame */}
        <mesh position={[0, 0, 0]} userData={{ name: 'Final Gateway Portal', interactable: true, onInteract: handleGateway }}>
          <boxGeometry args={[8.5, 9.0, 0.8]} />
          <meshStandardMaterial color="#1c1508" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Radiant Event Horizon Portal (Solid 3D Box & Double-Sided for 100% raycast reliability) */}
        <mesh
          position={[0, 0, -0.35]}
          userData={{ name: 'Final Gateway Portal', interactable: true, onInteract: handleGateway }}
        >
          <boxGeometry args={[6.4, 7.0, 0.2]} />
          <meshStandardMaterial
            ref={portalGlowRef}
            color={escaped ? '#ffffff' : '#fbbf24'}
            emissive={escaped ? '#38bdf8' : '#d97706'}
            emissiveIntensity={2.5}
            roughness={0.1}
          />
        </mesh>
      </RigidBody>
    </>
  );
};
