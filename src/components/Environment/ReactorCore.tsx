import React, { useRef } from 'react';
import { RigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';
import { useBathroomScene } from './Bathroom';

export const ReactorCore: React.FC = () => {
  const { setMessage, hasItem, setActivePuzzle, escaped } = useGameStore();
  const cabinetGlowRef = useRef<THREE.MeshStandardMaterial>(null);
  const doorBeaconRef = useRef<THREE.MeshStandardMaterial>(null);
  const { staticScene, doorLeaf } = useBathroomScene();

  useFrame(({ clock }) => {
    if (doorLeaf) {
      doorLeaf.visible = !escaped;
    }
    const t = clock.getElapsedTime();
    if (cabinetGlowRef.current) {
      cabinetGlowRef.current.emissiveIntensity = hasItem('Coolant Override')
        ? 1.8 + Math.sin(t * 2) * 0.3
        : 1.0 + Math.sin(t * 6) * 0.5;
    }
    if (doorBeaconRef.current) {
      doorBeaconRef.current.emissiveIntensity = escaped
        ? 1.5 + Math.sin(t * 4) * 0.5
        : 1.0 + Math.sin(t * 2) * 0.3;
    }
  });

  const handleCoolant = () => {
    if (hasItem('Coolant Override')) {
      setMessage('The corroded fuse box has already been rewired.');
    } else {
      setActivePuzzle(7);
    }
  };

  const handleExitDoor = () => {
    if (escaped) return;
    if (hasItem('Coolant Override')) {
      setActivePuzzle(8);
    } else {
      setMessage('The bathroom door is jammed shut. Something upstream needs to be fixed first.');
    }
  };

  return (
    <>
      {/* The Bathroom Environment (door leaf excluded — see below) */}
      <RigidBody type="fixed" colliders="trimesh">
        <primitive object={staticScene} />
      </RigidBody>

      {/* Door leaf: purely visual, hidden once escaped */}
      {doorLeaf && <primitive object={doorLeaf} />}

      {/* Invisible physical barrier across the doorway — only solid while locked */}
      {!escaped && (
        <RigidBody type="fixed" position={[-0.56, 1.34, 0.91]}>
          <mesh visible={false}>
            <boxGeometry args={[1.3, 2.6, 0.28]} />
            <meshBasicMaterial />
          </mesh>
        </RigidBody>
      )}

      {/* Corroded Fuse Box (Interactable #7) */}
      <RigidBody type="fixed" position={[-1.9, 1.0, -2.55]} rotation={[0, Math.PI / 2, 0]}>
        <mesh userData={{ name: 'Corroded Fuse Box', interactable: true, onInteract: handleCoolant }}>
          <boxGeometry args={[0.6, 0.9, 0.25]} />
          <meshStandardMaterial color="#27272a" metalness={0.7} roughness={0.4} />
        </mesh>

        {/* Cracked Indicator Panel */}
        <mesh position={[0, 0.1, 0.13]}>
          <planeGeometry args={[0.4, 0.5]} />
          <meshStandardMaterial
            ref={cabinetGlowRef}
            color="#991b1b"
            emissive="#ef4444"
            emissiveIntensity={2.0}
          />
        </mesh>
      </RigidBody>

      {/* Bathroom Door Handle (Exit Interactable #8) */}
      <RigidBody type="fixed" position={[-1.15, 1.0, 0.75]}>
        <mesh
          userData={{ name: 'Bathroom Door', interactable: true, onInteract: handleExitDoor }}
        >
          <boxGeometry args={[0.3, 0.5, 0.5]} />
          <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.4} transparent opacity={0.05} />
        </mesh>

        {/* Small Status Light on the Handle Plate */}
        <mesh position={[0.16, 0, 0]}>
          <boxGeometry args={[0.03, 0.08, 0.08]} />
          <meshStandardMaterial
            ref={doorBeaconRef}
            color={escaped ? '#10b981' : '#f59e0b'}
            emissive={escaped ? '#34d399' : '#f59e0b'}
            emissiveIntensity={1.8}
          />
        </mesh>
      </RigidBody>
    </>
  );
};
