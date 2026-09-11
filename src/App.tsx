import React from 'react';
import './App.css';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Player } from './components/Player';
import { GameUI } from './components/UI/GameUI';
import { LandingPage } from './components/UI/LandingPage';
import { DomainSelect } from './components/UI/DomainSelect';
import { KnowledgeBaseScreen } from './components/UI/KnowledgeBaseScreen';
import { LevelSelectRoom } from './components/UI/LevelSelectRoom';
import { useGameStore } from './store/gameStore';
import { LevelManager } from './components/LevelManager';
import { LevelLighting } from './components/Environment/LevelLighting';
import { HorrorAmbience } from './components/Audio/HorrorAmbience';
import { ChapterPrologue } from './components/UI/ChapterPrologue';

function App() {
  const { appState, setAppState } = useGameStore();

  if (appState === 'LANDING') {
    return <LandingPage />;
  }

  if (appState === 'DOMAIN_SELECT') {
    return <DomainSelect />;
  }

  if (appState === 'KNOWLEDGE_BASE') {
    return <KnowledgeBaseScreen />;
  }

  if (appState === 'LEVEL_SELECT') {
    return <LevelSelectRoom />;
  }

  if (appState === 'CHAPTER_PROLOGUE') {
    return <ChapterPrologue onComplete={() => setAppState('PLAYING')} />;
  }

  return (
    <>
      <HorrorAmbience />
      <GameUI />
      <Canvas shadows camera={{ fov: 75 }}>
        <React.Suspense fallback={null}>
          <LevelLighting />

          <Physics gravity={[0, -9.81, 0]}>
            <Player />
            <LevelManager />
          </Physics>
        </React.Suspense>
      </Canvas>
    </>
  );
}

export default App;
