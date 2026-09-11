import React, { useRef } from 'react';
import { RigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';
import { Model as WarehouseRoom } from './WarehouseRoom';

export const ServerRoom: React.FC = () => {
  const { setMessage, hasItem, setActivePuzzle, escaped } = useGameStore();
  const routerRingRef1 = useRef<THREE.Mesh>(null);
  const routerRingRef2 = useRef<THREE.Mesh>(null);
  const faultyGlowRef = useRef<THREE.MeshStandardMaterial>(null);
  const doorBeaconRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (routerRingRef1.current) {
      routerRingRef1.current.rotation.z = t * 1.2;
      routerRingRef1.current.rotation.x = Math.sin(t * 0.8) * 0.3;
    }
    if (routerRingRef2.current) {
      routerRingRef2.current.rotation.z = -t * 0.9;
      routerRingRef2.current.rotation.y = Math.cos(t * 0.7) * 0.3;
    }
    if (faultyGlowRef.current) {
      faultyGlowRef.current.emissiveIntensity = 1.4 + Math.sin(t * 5) * 0.8;
    }
    if (doorBeaconRef.current) {
      doorBeaconRef.current.emissiveIntensity = escaped
        ? 1.5 + Math.sin(t * 4) * 0.5
        : 1.0 + Math.sin(t * 2) * 0.3;
    }
  });

  const handleServerRack = () => {
    if (hasItem('Server Key')) {
      setMessage("You've already debugged this faulty server rack. Server Key extracted.");
    } else {
      setActivePuzzle(4);
    }
  };

  const handleRouter = () => {
    if (hasItem('Admin Card')) {
      setMessage('Network router is operational. Traffic re-routed.');
    } else if (hasItem('Server Key')) {
      setActivePuzzle(5);
    } else {
      setMessage('The network router is locked by security subsystem. A Server Key is required.');
    }
  };

  const handleExitDoor = () => {
    if (escaped) return;
    if (hasItem('Admin Card')) {
      setActivePuzzle(6);
    } else {
      setMessage('Access denied. Sector 2 Blast Door requires an authorized Admin Card.');
    }
  };

  return (
    <>
      {/* The new Warehouse Environment */}
      <RigidBody type="fixed" colliders="trimesh">
        <WarehouseRoom />
      </RigidBody>

      {/* Faulty Glitching Server Rack (Interactable #4) */}
      <RigidBody type="fixed" position={[8, 1.8, -7.5]}>
        <mesh
          userData={{ name: 'Faulty Quantum Server', interactable: true, onInteract: handleServerRack }}
        >
          <boxGeometry args={[2.0, 3.6, 1.8]} />
          <meshStandardMaterial color="#27272a" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Exposed Internal Diagnostic Motherboard */}
        <mesh position={[0, 0, 0.92]}>
          <planeGeometry args={[1.6, 3.2]} />
          <meshStandardMaterial
            ref={faultyGlowRef}
            color="#991b1b"
            emissive="#ef4444"
            emissiveIntensity={2.0}
          />
        </mesh>

        {/* Warning Indicator Plate */}
        <mesh position={[0, 1.95, 0]}>
          <boxGeometry args={[0.6, 0.2, 0.6]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={3.0} />
        </mesh>
      </RigidBody>

      {/* Holographic Network Router Terminal (Interactable #5) */}
      <RigidBody type="fixed" position={[-8, 0, 7.5]}>
        <mesh position={[0, 0.6, 0]} userData={{ name: 'Network Router Terminal', interactable: true, onInteract: handleRouter }}>
          <cylinderGeometry args={[0.8, 1.0, 1.2, 24]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Hologram Emitter Lens */}
        <mesh position={[0, 1.22, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.05, 24]} />
          <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={2.5} />
        </mesh>

        {/* Rotating Holographic Data Rings */}
        <mesh ref={routerRingRef1} position={[0, 1.8, 0]}>
          <torusGeometry args={[0.6, 0.02, 16, 48]} />
          <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={2.5} />
        </mesh>
        <mesh ref={routerRingRef2} position={[0, 1.8, 0]}>
          <torusGeometry args={[0.45, 0.015, 16, 48]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={2.2} />
        </mesh>
        {/* Center Floating Data Core */}
        <mesh position={[0, 1.8, 0]}>
          <octahedronGeometry args={[0.18, 0]} />
          <meshStandardMaterial color="#ffffff" emissive="#00ffff" emissiveIntensity={3.5} />
        </mesh>
      </RigidBody>

      {/* Sector 2 Blast Door (Exit Interactable #6) */}
      <RigidBody type="fixed" position={[0, 2.5, 10.85]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[4.4, 5.2, 0.4]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.3} />
        </mesh>

        {/* Top Status Light */}
        <mesh position={[0, 2.7, 0.22]}>
          <boxGeometry args={[0.8, 0.15, 0.08]} />
          <meshStandardMaterial
            ref={doorBeaconRef}
            color={escaped ? '#10b981' : '#f59e0b'}
            emissive={escaped ? '#34d399' : '#f59e0b'}
            emissiveIntensity={1.8}
          />
        </mesh>

        {/* Sliding Blast Door Left */}
        <mesh
          position={[escaped ? -1.8 : -0.85, 0, 0.08]}
          userData={{ name: 'Security Blast Door', interactable: true, onInteract: handleExitDoor }}
        >
          <boxGeometry args={[1.7, 4.8, 0.25]} />
          <meshStandardMaterial color={escaped ? '#1e293b' : '#475569'} metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Sliding Blast Door Right */}
        <mesh
          position={[escaped ? 1.8 : 0.85, 0, 0.08]}
          userData={{ name: 'Security Blast Door', interactable: true, onInteract: handleExitDoor }}
        >
          <boxGeometry args={[1.7, 4.8, 0.25]} />
          <meshStandardMaterial color={escaped ? '#1e293b' : '#475569'} metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Admin Card Scanner */}
        <mesh position={[2.4, -0.2, 0.2]} userData={{ name: 'Admin Scanner', interactable: true, onInteract: handleExitDoor }}>
          <boxGeometry args={[0.3, 0.5, 0.15]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>
        <mesh position={[2.4, -0.15, 0.28]}>
          <planeGeometry args={[0.2, 0.15]} />
          <meshStandardMaterial color="#f59e0b" emissive="#fbbf24" emissiveIntensity={1.2} />
        </mesh>
      </RigidBody>
    </>
  );
};
