import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const DUPLICATE_SUFFIX = /\d{3}$/;
const DOOR_LEAF_NAME = 'Wall_Doorway_Door001';

/**
 * The GLB ships two overlapping copies of every object: a broken/exploded
 * set (unsuffixed names) and a correctly assembled set (names suffixed with
 * a 3-digit id, e.g. "Door001"). We keep only the assembled set.
 *
 * The door leaf is split out separately so it isn't baked into the room's
 * static trimesh collider — otherwise it would permanently block the
 * doorway no matter what puzzle state the room is in.
 */
export function useBathroomScene(): { staticScene: THREE.Group; doorLeaf: THREE.Object3D | null } {
  const { scene } = useGLTF('/the_bathroom_free.glb');

  return useMemo(() => {
    const clone = scene.clone(true);
    clone.updateMatrixWorld(true);
    const rootNode = clone.getObjectByName('RootNode');
    let doorLeaf: THREE.Object3D | null = null;

    if (rootNode) {
      for (const child of [...rootNode.children]) {
        if (!DUPLICATE_SUFFIX.test(child.name)) {
          rootNode.remove(child);
          continue;
        }
        if (child.name === DOOR_LEAF_NAME) {
          // Re-express the node's transform in world space before detaching
          // it, since it's about to lose the parent chain (Sketchfab_model /
          // fbx wrapper / RootNode) that its local transform was relative to.
          const position = new THREE.Vector3();
          const quaternion = new THREE.Quaternion();
          const scale = new THREE.Vector3();
          child.matrixWorld.decompose(position, quaternion, scale);
          rootNode.remove(child);
          child.position.copy(position);
          child.quaternion.copy(quaternion);
          child.scale.copy(scale);
          doorLeaf = child;
        }
      }
    }

    return { staticScene: clone, doorLeaf };
  }, [scene]);
}

useGLTF.preload('/the_bathroom_free.glb');
