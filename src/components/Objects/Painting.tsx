import React from 'react';
import { RigidBody } from '@react-three/rapier';
import { useGameStore } from '../../store/gameStore';

export const Painting: React.FC = () => {
  const { setMessage, hasItem, addToInventory } = useGameStore();

  const handleInteract = () => {
    if (!hasItem('USB Drive')) {
      setMessage("You inspect behind the anomalous portrait and discover an encrypted 'USB Drive'!");
      addToInventory('USB Drive');
    } else {
      setMessage('The surveillance portrait stares back into the room with cold digital silence.');
    }
  };

  return (
    <RigidBody type="fixed" position={[4.15, 1.9, 2]} rotation={[0, -Math.PI / 2, 0]} scale={0.5}>
      {/* Heavy Ornate Cyberpunk Frame */}
      <mesh
        position={[0, 0, 0]}
        userData={{ name: 'Anomalous Portrait', interactable: true, onInteract: handleInteract }}
      >
        <boxGeometry args={[3.2, 2.2, 0.12]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Frame Gold Edge Accents */}
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[3.0, 2.0, 0.04]} />
        <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Canvas Artwork (Dark Void with Glowing Glitch Eye) */}
      <mesh position={[0, 0, 0.08]}>
        <planeGeometry args={[2.8, 1.8]} />
        <meshStandardMaterial color="#050814" roughness={0.9} />
      </mesh>

      {/* Ominous Anomaly Eye / Sensor on Painting */}
      <mesh position={[0, 0.1, 0.09]}>
        <ringGeometry args={[0.08, 0.22, 24]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.2} />
      </mesh>
      <mesh position={[0, 0.1, 0.095]}>
        <circleGeometry args={[0.06, 16]} />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={1.8} />
      </mesh>
    </RigidBody>
  );
};
