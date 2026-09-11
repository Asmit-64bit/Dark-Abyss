import React, { useRef } from 'react';
import { RigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';

export const Computer: React.FC = () => {
  const { setMessage, hasItem, setActivePuzzle } = useGameStore();
  const screenGlowRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    if (screenGlowRef.current) {
      const t = clock.getElapsedTime();
      screenGlowRef.current.emissiveIntensity = 0.8 + Math.sin(t * 4) * 0.25;
    }
  });

  const handleInteract = () => {
    if (hasItem('Gold Key')) {
      setMessage('You have already breached and extracted data from this terminal.');
    } else {
      setActivePuzzle(1);
    }
  };

  return (
    <RigidBody type="fixed" position={[3, 0.52, -1.3]} scale={0.55}>
      {/* Monitor Bezel */}
      <mesh
        position={[0, 0.45, -0.2]}
        userData={{ name: 'Terminal Terminal_01', interactable: true, onInteract: handleInteract }}
      >
        <boxGeometry args={[1.5, 0.95, 0.1]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} metalness={0.8} />
      </mesh>

      {/* Screen CRT Display */}
      <mesh position={[0, 0.45, -0.14]}>
        <planeGeometry args={[1.38, 0.82]} />
        <meshStandardMaterial
          ref={screenGlowRef}
          color="#064e3b"
          emissive="#10b981"
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Monitor Stand & Base */}
      <mesh position={[0, 0.15, -0.2]}>
        <cylinderGeometry args={[0.06, 0.08, 0.3, 16]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.02, -0.2]}>
        <cylinderGeometry args={[0.25, 0.28, 0.04, 24]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Keyboard */}
      <mesh position={[0, 0.03, 0.25]} rotation={[-0.05, 0, 0]}>
        <boxGeometry args={[1.1, 0.04, 0.4]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} />
      </mesh>
      {/* Keyboard Keys Glow */}
      <mesh position={[0, 0.055, 0.25]} rotation={[-0.05, 0, 0]}>
        <boxGeometry args={[1.0, 0.02, 0.32]} />
        <meshStandardMaterial color="#059669" emissive="#10b981" emissiveIntensity={0.4} />
      </mesh>

      {/* Mouse */}
      <mesh position={[0.7, 0.03, 0.25]}>
        <boxGeometry args={[0.12, 0.04, 0.2]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} />
      </mesh>
      <mesh position={[0.7, 0.04, 0.22]}>
        <cylinderGeometry args={[0.02, 0.02, 0.03, 12]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#10b981" emissive="#34d399" emissiveIntensity={0.8} />
      </mesh>

      {/* Desktop Tower PC */}
      <mesh position={[1.4, -0.2, -0.1]}>
        <boxGeometry args={[0.3, 0.7, 0.6]} />
        <meshStandardMaterial color="#0b0f19" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Tower Power LED */}
      <mesh position={[1.4, 0.1, 0.21]}>
        <cylinderGeometry args={[0.015, 0.015, 0.01, 16]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#34d399" emissive="#34d399" emissiveIntensity={2} />
      </mesh>
    </RigidBody>
  );
};
