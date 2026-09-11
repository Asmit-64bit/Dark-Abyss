import React from 'react';
import { RigidBody } from '@react-three/rapier';
import { useGameStore } from '../../store/gameStore';

export const Bookshelf: React.FC = () => {
  const { setMessage, hasItem } = useGameStore();

  const handleInteract = () => {
    if (hasItem('USB Drive')) {
      setMessage('A research dossier on the shelf reads: "Facility AI core has developed quantum sentience. Do not trust terminal outputs."');
    } else {
      setMessage('Rows of research archives on cybersecurity and neural networks. You might need something to inspect deeper.');
    }
  };

  return (
    <RigidBody type="fixed" position={[1.95, 0.99, -1.5]} rotation={[0, Math.PI / 2, 0]} scale={0.55}>
      {/* Heavy Steel & Dark Wood Library Archive Frame */}
      <mesh
        position={[0, 0, 0]}
        userData={{ name: 'Archive Bookshelf', interactable: true, onInteract: handleInteract }}
      >
        <boxGeometry args={[4.2, 3.6, 0.9]} />
        <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Interior Backing */}
      <mesh position={[0, 0, -0.35]}>
        <boxGeometry args={[4.0, 3.4, 0.1]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Shelves */}
      <mesh position={[0, -0.6, 0]}>
        <boxGeometry args={[4.0, 0.08, 0.8]} />
        <meshStandardMaterial color="#334155" metalness={0.6} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[4.0, 0.08, 0.8]} />
        <meshStandardMaterial color="#334155" metalness={0.6} />
      </mesh>

      {/* Book Stacks - Bottom Shelf */}
      <mesh position={[-1.2, -0.35, 0.05]}>
        <boxGeometry args={[1.2, 0.45, 0.5]} />
        <meshStandardMaterial color="#7f1d1d" roughness={0.8} />
      </mesh>
      <mesh position={[0.2, -0.35, 0.05]}>
        <boxGeometry args={[1.0, 0.48, 0.5]} />
        <meshStandardMaterial color="#1e3a8a" roughness={0.8} />
      </mesh>
      <mesh position={[1.4, -0.35, 0.05]}>
        <boxGeometry args={[0.8, 0.42, 0.5]} />
        <meshStandardMaterial color="#064e3b" roughness={0.8} />
      </mesh>

      {/* Glowing Chemical Flask on Middle Shelf */}
      <mesh position={[-0.8, 0.75, 0.1]}>
        <cylinderGeometry args={[0.08, 0.16, 0.35, 16]} />
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#22d3ee"
          emissiveIntensity={1.2}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* Book Stacks - Upper Shelf */}
      <mesh position={[0.8, 0.75, 0.05]}>
        <boxGeometry args={[1.5, 0.45, 0.5]} />
        <meshStandardMaterial color="#312e81" roughness={0.8} />
      </mesh>
    </RigidBody>
  );
};
