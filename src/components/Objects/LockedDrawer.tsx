import React, { useRef } from 'react';
import { RigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';

export const LockedDrawer: React.FC = () => {
  const { setMessage, hasItem, setActivePuzzle } = useGameStore();
  const ledGlowRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    if (ledGlowRef.current) {
      const t = clock.getElapsedTime();
      ledGlowRef.current.emissiveIntensity = 1 + Math.sin(t * 3) * 0.5;
    }
  });

  const handleInteract = () => {
    if (hasItem('Master Key')) {
      setMessage('The containment safe is unlocked. You already extracted the Master Key.');
    } else if (hasItem('Gold Key')) {
      setActivePuzzle(2);
    } else {
      setMessage('The encrypted safe requires a Gold Key to activate its cryptographic keypad.');
    }
  };

  const isUnlocked = hasItem('Master Key');

  return (
    <RigidBody type="fixed" position={[3.9, 0.45, -1.7]}>
      {/* Heavy Steel Safe Body */}
      <mesh
        position={[0, 0, 0]}
        userData={{ name: 'Encrypted Safe Console', interactable: true, onInteract: handleInteract }}
      >
        <boxGeometry args={[1.2, 0.8, 1.4]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Front Door Panel */}
      <mesh position={[0, 0, 0.71]}>
        <boxGeometry args={[1.05, 0.68, 0.04]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Electronic Keypad / Screen */}
      <mesh position={[0, 0.15, 0.74]}>
        <boxGeometry args={[0.45, 0.25, 0.02]} />
        <meshStandardMaterial
          ref={ledGlowRef}
          color={isUnlocked ? '#065f46' : '#991b1b'}
          emissive={isUnlocked ? '#10b981' : '#ef4444'}
          emissiveIntensity={1.2}
        />
      </mesh>

      {/* Gold Keyhole Slot / Biometric Pad */}
      <mesh position={[0, -0.12, 0.74]}>
        <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Heavy Steel Dial Handle */}
      <mesh position={[0.35, 0, 0.76]} rotation={[0, 0, isUnlocked ? Math.PI / 4 : 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.04, 24]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} />
      </mesh>
    </RigidBody>
  );
};
