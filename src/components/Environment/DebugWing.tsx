import React, { useRef, useMemo } from 'react';
import { RigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';
import { getDebugFloorTexture, getDebugWallTexture, getCeilingTexture } from '../../utils/textureGenerator';

export const DebugWing: React.FC = () => {
  const { setMessage, hasItem, setActivePuzzle, escaped } = useGameStore();
  const shardRef = useRef<THREE.Mesh>(null);
  const shardGlowRef = useRef<THREE.MeshStandardMaterial>(null);
  const gateBeaconRef = useRef<THREE.MeshStandardMaterial>(null);
  const glitchBoxRef = useRef<THREE.Group>(null);

  const floorTexture = useMemo(() => getDebugFloorTexture(), []);
  const wallTexture = useMemo(() => getDebugWallTexture(), []);
  const ceilingTexture = useMemo(() => getCeilingTexture(), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Floating Memory Shard animation
    if (shardRef.current) {
      shardRef.current.position.y = 1.8 + Math.sin(t * 2) * 0.15;
      shardRef.current.rotation.y = t * 0.8;
      shardRef.current.rotation.x = Math.sin(t * 1.2) * 0.3;
    }
    if (shardGlowRef.current) {
      shardGlowRef.current.emissiveIntensity = 2.0 + Math.sin(t * 4) * 0.8;
    }

    // Gate Beacon pulse
    if (gateBeaconRef.current) {
      gateBeaconRef.current.emissiveIntensity = escaped
        ? 2.0 + Math.sin(t * 5) * 0.5
        : 1.2 + Math.sin(t * 2.5) * 0.4;
    }

    // Floating Glitch Memory Fragments
    if (glitchBoxRef.current) {
      glitchBoxRef.current.rotation.y = t * 0.15;
    }
  });

  const handleShard = () => {
    if (hasItem('Memory Bypass Key')) {
      setMessage('The memory register has already been decompiled and bypassed.');
    } else {
      setActivePuzzle(9);
    }
  };

  const handleConsole = () => {
    if (hasItem('Cipher Chip')) {
      setMessage('The deconstructed console is decoded. Cipher Chip extracted.');
    } else if (hasItem('Memory Bypass Key')) {
      setActivePuzzle(10);
    } else {
      setMessage('Register dump is locked by heap protection. You need a Memory Bypass Key.');
    }
  };

  const handleGate = () => {
    if (escaped) return;
    if (hasItem('Cipher Chip')) {
      setActivePuzzle(11);
    } else {
      setMessage('Security Gate locked. A decrypted Cipher Chip is required to clear thread lock.');
    }
  };

  return (
    <>
      {/* Textured Floor */}
      <RigidBody type="fixed">
        <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[26, 26]} />
          <meshStandardMaterial map={floorTexture} roughness={0.4} metalness={0.6} />
        </mesh>
      </RigidBody>

      {/* Textured Ceiling */}
      <RigidBody type="fixed">
        <mesh position={[0, 6, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[26, 26]} />
          <meshStandardMaterial map={ceilingTexture} roughness={0.8} />
        </mesh>
      </RigidBody>

      {/* Perimeter Walls with Memory Dump Wallpapers */}
      <RigidBody type="fixed">
        <mesh position={[0, 3, -13]}><boxGeometry args={[26, 6, 0.5]} /><meshStandardMaterial map={wallTexture} roughness={0.5} metalness={0.5} /></mesh>
        <mesh position={[0, 3, 13]}><boxGeometry args={[26, 6, 0.5]} /><meshStandardMaterial map={wallTexture} roughness={0.5} metalness={0.5} /></mesh>
        <mesh position={[13, 3, 0]}><boxGeometry args={[0.5, 6, 26]} /><meshStandardMaterial map={wallTexture} roughness={0.5} metalness={0.5} /></mesh>
        <mesh position={[-13, 3, 0]}><boxGeometry args={[0.5, 6, 26]} /><meshStandardMaterial map={wallTexture} roughness={0.5} metalness={0.5} /></mesh>
      </RigidBody>

      {/* Floating Glitch Fragment Cloud in Center */}
      <group ref={glitchBoxRef} position={[0, 2.5, 0]}>
        {[-3, 0, 3].map((x, i) => (
          <mesh key={i} position={[x, Math.sin(i) * 0.5, (i % 2) * 2 - 1]}>
            <boxGeometry args={[0.35, 0.35, 0.35]} />
            <meshStandardMaterial color="#c084fc" emissive="#a855f7" emissiveIntensity={2} wireframe />
          </mesh>
        ))}
      </group>

      {/* Interactable #9: Corrupted Memory Shard Pedestal */}
      <RigidBody type="fixed" position={[-8, 0, -8]}>
        <mesh position={[0, 0.6, 0]} userData={{ name: 'Corrupted Memory Shard', interactable: true, onInteract: handleShard }}>
          <cylinderGeometry args={[0.7, 0.9, 1.2, 24]} />
          <meshStandardMaterial color="#1e1140" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Shard Glow Plate */}
        <mesh position={[0, 1.22, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.05, 24]} />
          <meshStandardMaterial color="#a855f7" emissive="#c084fc" emissiveIntensity={2.5} />
        </mesh>
        {/* Floating Memory Crystal Shard */}
        <mesh ref={shardRef} position={[0, 1.8, 0]}>
          <octahedronGeometry args={[0.45, 1]} />
          <meshStandardMaterial
            ref={shardGlowRef}
            color="#d8b4fe"
            emissive="#a855f7"
            emissiveIntensity={2.5}
          />
        </mesh>
      </RigidBody>

      {/* Interactable #10: Deconstructed Debug Console */}
      <RigidBody type="fixed" position={[8, 0, -6]}>
        <mesh position={[0, 1.0, 0]} userData={{ name: 'Deconstructed Debug Console', interactable: true, onInteract: handleConsole }}>
          <boxGeometry args={[2.2, 2.0, 1.4]} />
          <meshStandardMaterial color="#170c30" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Glowing Purple Terminal Screen */}
        <mesh position={[0, 1.3, 0.71]}>
          <planeGeometry args={[1.8, 0.9]} />
          <meshStandardMaterial color="#3b0764" emissive="#a855f7" emissiveIntensity={1.8} />
        </mesh>
        {/* Holographic Projection Lens */}
        <mesh position={[0, 2.05, 0]}>
          <boxGeometry args={[1.0, 0.1, 0.6]} />
          <meshStandardMaterial color="#c084fc" emissive="#c084fc" emissiveIntensity={2.0} />
        </mesh>
      </RigidBody>

      {/* Interactable #11: Anomaly Containment Gate (Exit) */}
      <RigidBody type="fixed" position={[0, 3, 12.85]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[5.2, 6.0, 0.4]} />
          <meshStandardMaterial color="#1e1140" metalness={0.9} roughness={0.3} />
        </mesh>

        {/* Status Light Beacon */}
        <mesh position={[0, 3.1, 0.22]}>
          <boxGeometry args={[1.0, 0.2, 0.1]} />
          <meshStandardMaterial
            ref={gateBeaconRef}
            color={escaped ? '#10b981' : '#a855f7'}
            emissive={escaped ? '#34d399' : '#c084fc'}
            emissiveIntensity={2.0}
          />
        </mesh>

        {/* Sliding Heavy Gate Panels */}
        <mesh
          position={[escaped ? -2.2 : -1.0, 0, 0.1]}
          userData={{ name: 'Anomaly Containment Gate', interactable: true, onInteract: handleGate }}
        >
          <boxGeometry args={[2.0, 5.6, 0.25]} />
          <meshStandardMaterial color={escaped ? '#1e1140' : '#3b1c7a'} metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh
          position={[escaped ? 2.2 : 1.0, 0, 0.1]}
          userData={{ name: 'Anomaly Containment Gate', interactable: true, onInteract: handleGate }}
        >
          <boxGeometry args={[2.0, 5.6, 0.25]} />
          <meshStandardMaterial color={escaped ? '#1e1140' : '#3b1c7a'} metalness={0.9} roughness={0.2} />
        </mesh>
      </RigidBody>
    </>
  );
};
