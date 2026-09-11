import React, { useRef } from 'react';
import { RigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';

export const ExitDoor: React.FC = () => {
  const { setMessage, hasItem, setActivePuzzle, escaped } = useGameStore();
  const beaconGlowRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    if (beaconGlowRef.current) {
      const t = clock.getElapsedTime();
      beaconGlowRef.current.emissiveIntensity = escaped
        ? 1.5 + Math.sin(t * 4) * 0.5
        : 1.0 + Math.sin(t * 2) * 0.3;
    }
  });

  const handleInteract = () => {
    if (escaped) {
      setMessage('Containment Sector breached. Proceed through the open door.');
      return;
    }

    if (hasItem('Master Key')) {
      setActivePuzzle(3);
    } else {
      setMessage('Sector 1 Exit is sealed by lockdown protocol. A Master Key is required.');
    }
  };

  return (
    <RigidBody type="fixed" position={[3, 1.3, -1.9]} rotation={[0, Math.PI, 0]} scale={0.5}>
      {/* Massive Industrial Outer Door Frame */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[4.2, 5.2, 0.4]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Frame Caution Decal Strip */}
      <mesh position={[0, 2.45, 0.22]}>
        <boxGeometry args={[3.8, 0.2, 0.02]} />
        <meshStandardMaterial color="#eab308" metalness={0.3} roughness={0.6} />
      </mesh>

      {/* Security Status Light Beacon */}
      <mesh position={[0, 2.7, 0.24]}>
        <boxGeometry args={[0.6, 0.15, 0.08]} />
        <meshStandardMaterial
          ref={beaconGlowRef}
          color={escaped ? '#10b981' : '#dc2626'}
          emissive={escaped ? '#34d399' : '#ef4444'}
          emissiveIntensity={1.5}
        />
      </mesh>

      {/* Left Heavy Blast Door Panel */}
      <mesh
        position={[escaped ? -1.6 : -0.75, 0, 0.08]}
        userData={{ name: 'Containment Blast Door', interactable: true, onInteract: handleInteract }}
      >
        <boxGeometry args={[1.5, 4.8, 0.25]} />
        <meshStandardMaterial
          color={escaped ? '#1e293b' : '#334155'}
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>

      {/* Right Heavy Blast Door Panel */}
      <mesh
        position={[escaped ? 1.6 : 0.75, 0, 0.08]}
        userData={{ name: 'Containment Blast Door', interactable: true, onInteract: handleInteract }}
      >
        <boxGeometry args={[1.5, 4.8, 0.25]} />
        <meshStandardMaterial
          color={escaped ? '#1e293b' : '#334155'}
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>

      {/* Door Keycard Scanner Terminal on the Right Wall Frame */}
      <mesh position={[2.3, -0.2, 0.2]} userData={{ name: 'Door Terminal Scanner', interactable: true, onInteract: handleInteract }}>
        <boxGeometry args={[0.3, 0.5, 0.15]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} />
      </mesh>
      <mesh position={[2.3, -0.15, 0.28]}>
        <planeGeometry args={[0.2, 0.15]} />
        <meshStandardMaterial color="#0369a1" emissive="#38bdf8" emissiveIntensity={0.8} />
      </mesh>
    </RigidBody>
  );
};
