import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useGameStore } from '../store/gameStore';
import { Model as Apartment } from './Environment/Apartment';
import { ServerRoom } from './Environment/ServerRoom';
import { ReactorCore } from './Environment/ReactorCore';
import { AbandonedSchoolRoom } from './Environment/AbandonedSchoolRoom';
import { AbandonedOffice } from './Environment/AbandonedOffice';
import { Desk } from './Objects/Desk';
import { Computer } from './Objects/Computer';
import { Painting } from './Objects/Painting';
import { Bookshelf } from './Objects/Bookshelf';
import { LockedDrawer } from './Objects/LockedDrawer';
import { ExitDoor } from './Objects/ExitDoor';

export const LevelManager = () => {
  const { currentLevel } = useGameStore();

  switch (currentLevel) {
    case 1:
      return (
        <>
          {/* Visual only — the source scan is ~445k triangles, far too dense
              for a trimesh collider (it hangs Rapier's cooking step). Player
              containment uses simple invisible boundary colliders instead,
              sized to the explored playable room. */}
          <Apartment position={[0, 1.63, 0]} />
          <RigidBody type="fixed">
            <CuboidCollider args={[1.25, 0.5, 3.1]} position={[3.05, -0.5, 1.1]} />
            <CuboidCollider args={[1.25, 0.5, 3.1]} position={[3.05, 3.1, 1.1]} />
            <CuboidCollider args={[0.5, 1.3, 3.1]} position={[1.3, 1.3, 1.1]} />
            <CuboidCollider args={[0.5, 1.3, 3.1]} position={[4.8, 1.3, 1.1]} />
            <CuboidCollider args={[1.25, 1.3, 0.5]} position={[3.05, 1.3, -2.5]} />
            <CuboidCollider args={[1.25, 1.3, 0.5]} position={[3.05, 1.3, 4.7]} />
          </RigidBody>
          <Desk />
          <Computer />
          <Painting />
          <Bookshelf />
          <LockedDrawer />
          <ExitDoor />
        </>
      );
    case 2:
      return <ServerRoom />;
    case 3:
      return <ReactorCore />;
    case 4:
      return <AbandonedSchoolRoom />;
    case 5:
      return <AbandonedOffice />;
    default:
      return null;
  }
};
