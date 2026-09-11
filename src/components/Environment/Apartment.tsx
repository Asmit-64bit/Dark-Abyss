import { useGLTF } from '@react-three/drei';

export function Model(props: JSX.IntrinsicElements['group']) {
  const { scene } = useGLTF('/apartment_in_not_new_building.glb');
  return (
    <group {...props} dispose={null}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload('/apartment_in_not_new_building.glb');
