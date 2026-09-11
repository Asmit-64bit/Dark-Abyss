import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';

export const LevelLighting: React.FC = () => {
  const { currentLevel } = useGameStore();
  const labFlickerLightRef = useRef<THREE.PointLight>(null);
  const reactorLightRef = useRef<THREE.PointLight>(null);
  const reactorBeaconRef = useRef<THREE.SpotLight>(null);
  const serverLightRef = useRef<THREE.PointLight>(null);
  const debugLightRef = useRef<THREE.PointLight>(null);
  const nexusLightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Level 1: Flickering lab tube
    if (labFlickerLightRef.current && currentLevel === 1) {
      const flicker = Math.sin(t * 14) * Math.cos(t * 22);
      labFlickerLightRef.current.intensity = 2.2 + (flicker > 0.6 ? 0.4 : -0.3);
    }

    // Level 2: Server room data pulse
    if (serverLightRef.current && currentLevel === 2) {
      serverLightRef.current.intensity = 2.0 + Math.sin(t * 2.5) * 0.5;
    }

    // Level 3: Bathroom flicker
    if (reactorLightRef.current && currentLevel === 3) {
      const flicker = Math.sin(t * 9) * Math.cos(t * 15);
      reactorLightRef.current.intensity = 1.6 + (flicker > 0.7 ? 0.3 : -0.4);
    }
    if (reactorBeaconRef.current && currentLevel === 3) {
      reactorBeaconRef.current.intensity = 1.2 + Math.sin(t * 3) * 0.4;
    }

    // Level 4: Debug Wing purple neon glitch pulse
    if (debugLightRef.current && currentLevel === 4) {
      debugLightRef.current.intensity = 2.4 + Math.sin(t * 3.8) * 0.6;
    }

    // Level 5: The Nexus golden celestial pulse
    if (nexusLightRef.current && currentLevel === 5) {
      nexusLightRef.current.intensity = 3.4 + Math.sin(t * 2.0) * 0.8;
    }
  });

  return (
    <>
      {/* ----------------- LEVEL 1: APARTMENT LIGHTING ----------------- */}
      {currentLevel === 1 && (
        <>
          <fog attach="fog" args={['#0f172a', 6, 18]} />
          <ambientLight intensity={0.7} color="#e2e8f0" />
          <pointLight
            ref={labFlickerLightRef}
            position={[3, 2.4, 1]}
            intensity={1.8}
            distance={8}
            color="#f8fafc"
            castShadow
          />
          <pointLight position={[3, 2.2, -1.7]} intensity={1.3} distance={5} color="#34d399" />
          <pointLight position={[4, 2.2, 3.5]} intensity={1.2} distance={5} color="#f87171" />
          <pointLight position={[2, 2.2, -0.5]} intensity={1.0} distance={4} color="#38bdf8" />
        </>
      )}

      {/* ----------------- LEVEL 2: SERVER ROOM LIGHTING ----------------- */}
      {currentLevel === 2 && (
        <>
          <fog attach="fog" args={['#090d16', 18, 48]} />
          <ambientLight intensity={1.05} color="#93c5fd" />
          <pointLight
            ref={serverLightRef}
            position={[0, 4.2, 0]}
            intensity={2.2}
            distance={26}
            color="#67e8f9"
            castShadow
          />
          <pointLight position={[-8, 2.5, 7.5]} intensity={2.8} distance={14} color="#00e5ff" />
          <pointLight position={[8, 2.5, -7.5]} intensity={2.8} distance={14} color="#ff3366" />
          <pointLight position={[0, 3.8, 9.5]} intensity={2.0} distance={12} color="#fbbf24" />
          <pointLight position={[9.2, 2.5, 0]} intensity={1.6} distance={12} color="#7dd3fc" />
          <pointLight position={[-9.2, 2.5, -6]} intensity={1.6} distance={12} color="#7dd3fc" />
          <pointLight position={[0, 2.5, -9.2]} intensity={1.6} distance={12} color="#7dd3fc" />
        </>
      )}

      {/* ----------------- LEVEL 3: BATHROOM LIGHTING ----------------- */}
      {currentLevel === 3 && (
        <>
          <fog attach="fog" args={['#140f0c', 6, 16]} />
          <ambientLight intensity={0.5} color="#c9b8a3" />
          {/* Flickering ceiling fixture */}
          <pointLight
            ref={reactorLightRef}
            position={[0.44, 2.4, -0.36]}
            intensity={1.6}
            distance={7}
            color="#f5deb3"
            castShadow
          />
          {/* Candle glow near the mirror */}
          <pointLight
            ref={reactorBeaconRef}
            position={[1.11, 1.6, 0.81]}
            intensity={1.2}
            distance={3.5}
            color="#ffb347"
          />
          {/* Cold moonlight through the window */}
          <pointLight position={[2.57, 1.6, -2.42]} intensity={1.0} distance={4} color="#7dd3fc" />
          {/* Dim fill near the door */}
          <pointLight position={[-1.2, 1.8, 0.9]} intensity={0.6} distance={3} color="#94a3b8" />
        </>
      )}

      {/* ----------------- LEVEL 4: DEBUG WING LIGHTING ----------------- */}
      {currentLevel === 4 && (
        <>
          <fog attach="fog" args={['#13072b', 18, 50]} />
          <ambientLight intensity={1.05} color="#e9d5ff" />
          <pointLight
            ref={debugLightRef}
            position={[0, 4.8, 0]}
            intensity={2.6}
            distance={30}
            color="#c084fc"
            castShadow
          />
          <pointLight position={[-8, 2.5, -8]} intensity={2.8} distance={14} color="#e879f9" />
          <pointLight position={[8, 2.5, -6]} intensity={2.8} distance={14} color="#a855f7" />
          <pointLight position={[0, 4.2, 11.5]} intensity={2.2} distance={14} color="#34d399" />
          <pointLight position={[11, 3, 0]} intensity={1.6} distance={14} color="#d8b4fe" />
          <pointLight position={[-11, 3, 0]} intensity={1.6} distance={14} color="#d8b4fe" />
        </>
      )}

      {/* ----------------- LEVEL 5: THE NEXUS LIGHTING ----------------- */}
      {currentLevel === 5 && (
        <>
          <fog attach="fog" args={['#171004', 22, 56]} />
          <ambientLight intensity={1.15} color="#fef08a" />
          <pointLight
            ref={nexusLightRef}
            position={[0, 6.0, 0]}
            intensity={4.0}
            distance={40}
            color="#fbbf24"
            castShadow
          />
          <pointLight position={[-10, 3.5, 0]} intensity={3.0} distance={16} color="#f59e0b" />
          <pointLight position={[0, 5.0, 15.5]} intensity={3.2} distance={18} color="#ffffff" />
          <pointLight position={[10, 3.5, 0]} intensity={2.2} distance={15} color="#00e5ff" />
          <pointLight position={[0, 3.5, -15]} intensity={2.2} distance={15} color="#fbbf24" />
        </>
      )}
    </>
  );
};
