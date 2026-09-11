import React from 'react';
import { RigidBody } from '@react-three/rapier';

export const Desk: React.FC = () => {
  return (
    <RigidBody type="fixed" position={[3, 0, -1.3]} scale={0.55}>
      {/* Heavy Industrial Workstation Table Top */}
      <mesh position={[0, 0.95, 0]}>
        <boxGeometry args={[4.4, 0.12, 2.2]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Table Top Surface Plate */}
      <mesh position={[0, 1.02, 0]}>
        <boxGeometry args={[4.2, 0.02, 2.0]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Heavy Steel Frame Legs */}
      <mesh position={[-2.0, 0.47, -0.9]}>
        <boxGeometry args={[0.15, 0.95, 0.15]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.4} />
      </mesh>
      <mesh position={[2.0, 0.47, -0.9]}>
        <boxGeometry args={[0.15, 0.95, 0.15]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.4} />
      </mesh>
      <mesh position={[-2.0, 0.47, 0.9]}>
        <boxGeometry args={[0.15, 0.95, 0.15]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.4} />
      </mesh>
      <mesh position={[2.0, 0.47, 0.9]}>
        <boxGeometry args={[0.15, 0.95, 0.15]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.4} />
      </mesh>

      {/* Structural Crossbars */}
      <mesh position={[0, 0.3, -0.9]}>
        <boxGeometry args={[4.0, 0.08, 0.08]} />
        <meshStandardMaterial color="#334155" metalness={0.8} />
      </mesh>
      <mesh position={[-2.0, 0.3, 0]}>
        <boxGeometry args={[0.08, 0.08, 1.8]} />
        <meshStandardMaterial color="#334155" metalness={0.8} />
      </mesh>
      <mesh position={[2.0, 0.3, 0]}>
        <boxGeometry args={[0.08, 0.08, 1.8]} />
        <meshStandardMaterial color="#334155" metalness={0.8} />
      </mesh>
    </RigidBody>
  );
};
