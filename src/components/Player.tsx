import { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, RapierRigidBody, CapsuleCollider } from '@react-three/rapier';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';
import { playFootstep } from '../utils/soundEffects';

const SPEED = 5;
const direction = new THREE.Vector3();
const frontVector = new THREE.Vector3();
const sideVector = new THREE.Vector3();

export const Player = () => {
  const ref = useRef<RapierRigidBody>(null);
  const { camera } = useThree();
  const flashlightRef = useRef<THREE.SpotLight>(null);
  const target = useMemo(() => new THREE.Object3D(), []);
  const lastFootstepTime = useRef<number>(0);
  const lastSanityTick = useRef<number>(0);

  // Controls state
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    interact: false,
  });

  const {
    setHoveredObject,
    hoveredObject,
    activePuzzleId,
    bookModalOpen,
    currentLevel,
    appState,
    flashlightOn,
    toggleFlashlight,
    recordInteraction,
    decreaseSanity,
    restoreSanity,
  } = useGameStore();

  // Reset player position safely on level change or game enter
  useEffect(() => {
    if (ref.current) {
      const spawnPos =
        currentLevel === 1
          ? { x: 3, y: 1.2, z: 3 }
          : currentLevel === 3
          ? { x: 0.44, y: 1.2, z: -0.36 }
          : currentLevel === 5
          ? { x: 0, y: 1.2, z: 0 }
          : currentLevel === 4
          ? { x: 0, y: 1.2, z: 3 }
          : { x: 0, y: 1.2, z: 6 };
      ref.current.setTranslation(spawnPos, true);
      ref.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      ref.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }
  }, [currentLevel, appState]);

  useEffect(() => {
    if (activePuzzleId || bookModalOpen) {
      document.exitPointerLock();
      keys.current.interact = false;
    }
  }, [activePuzzleId, bookModalOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      switch (e.code) {
        case 'KeyW': keys.current.forward = true; break;
        case 'KeyS': keys.current.backward = true; break;
        case 'KeyA': keys.current.left = true; break;
        case 'KeyD': keys.current.right = true; break;
        case 'KeyE': keys.current.interact = true; break;
        case 'KeyF':
          if (!activePuzzleId) {
            toggleFlashlight();
          }
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': keys.current.forward = false; break;
        case 'KeyS': keys.current.backward = false; break;
        case 'KeyA': keys.current.left = false; break;
        case 'KeyD': keys.current.right = false; break;
        case 'KeyE': keys.current.interact = false; break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [activePuzzleId, toggleFlashlight]);

  useFrame((state) => {
    if (!ref.current) return;

    const velocity = ref.current.linvel();

    if (activePuzzleId || bookModalOpen) {
      ref.current.setLinvel({ x: 0, y: velocity.y, z: 0 }, true);
      return;
    }

    // Movement
    frontVector.set(0, 0, Number(keys.current.backward) - Number(keys.current.forward));
    sideVector.set(Number(keys.current.left) - Number(keys.current.right), 0, 0);

    const isMoving = keys.current.forward || keys.current.backward || keys.current.left || keys.current.right;

    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(SPEED)
      .applyEuler(camera.rotation);

    ref.current.setLinvel({ x: direction.x, y: velocity.y, z: direction.z }, true);

    // Dynamic footsteps
    if (isMoving && Math.hypot(velocity.x, velocity.z) > 0.8) {
      const now = performance.now();
      if (now - lastFootstepTime.current > 380) {
        playFootstep();
        lastFootstepTime.current = now;
      }
    }

    // Sync camera to rigid body position (player height)
    const { x, y, z } = ref.current.translation();
    camera.position.set(x, y + 0.8, z);

    // Sync flashlight to player camera
    if (flashlightRef.current && target) {
      flashlightRef.current.visible = flashlightOn;
      flashlightRef.current.position.copy(camera.position);
      const forward = new THREE.Vector3(0, 0, -1).applyEuler(camera.rotation);
      target.position.copy(camera.position).add(forward.multiplyScalar(6));
      flashlightRef.current.target = target;
    }

    // Raycasting for interaction
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

    const intersects = raycaster.intersectObjects(state.scene.children, true);

    let foundInteractable = false;
    for (let i = 0; i < intersects.length; i++) {
      const hit = intersects[i];
      if (hit.distance > 4.8) break;

      const obj = hit.object;
      const interactData = obj.userData;

      if (interactData && interactData.interactable) {
        foundInteractable = true;
        if (hoveredObject !== interactData.name) {
          setHoveredObject(interactData.name);
          recordInteraction();
        }

        if (keys.current.interact) {
          interactData.onInteract();
          keys.current.interact = false;
        }
        break;
      }
    }

    if (!foundInteractable && hoveredObject) {
      setHoveredObject(null);
    }

    // Dynamic Sanity Drain / Recovery in environment
    const now = performance.now();
    if (now - lastSanityTick.current > 1500) {
      lastSanityTick.current = now;
      if (!flashlightOn) {
        decreaseSanity(1.5);
      } else if (foundInteractable) {
        decreaseSanity(0.8);
      } else {
        restoreSanity(0.5);
      }
    }
  });

  return (
    <>
      <PointerLockControls />

      {/* Tactical Player Flashlight */}
      <primitive object={target} />
      <spotLight
        ref={flashlightRef}
        intensity={2.8}
        distance={22}
        angle={0.65}
        penumbra={0.4}
        color="#f8fafc"
        castShadow={false}
      />

      <RigidBody
        ref={ref}
        colliders={false}
        mass={1}
        type="dynamic"
        position={[0, 1.2, 6]}
        enabledRotations={[false, false, false]}
        friction={0}
      >
        <CapsuleCollider args={[0.5, 0.5]} />
        <mesh visible={false}>
          <capsuleGeometry args={[0.5, 1]} />
          <meshBasicMaterial color="red" />
        </mesh>
      </RigidBody>
    </>
  );
};
