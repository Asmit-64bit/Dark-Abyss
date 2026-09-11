import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { LEVELS, TOTAL_LEVELS } from '../../data/levels';
import { puzzles } from '../../data/puzzles';
import { BgmPlayer } from './BgmPlayer';
import { ArrowLeft, ChevronLeft, ChevronRight, Lock, Check, Timer } from 'lucide-react';

const CHAPTER_SUBTITLES = [
  'CHAPTER I // THE CLINICAL COLD',
  'CHAPTER II // THE WHISPERING CRATES',
  'CHAPTER III // THE SILICON TOMB',
  'CHAPTER IV // THE BURNING CORE',
  'CHAPTER V // THE FRACTURED NEXUS',
];

export const LevelSelectRoom: React.FC = () => {
  const { completedLevels, unlockedLevel, setCurrentLevel, setAppState, bestTimes } = useGameStore();
  const [currentIndex, setCurrentIndex] = useState(() => {
    const idx = LEVELS.findIndex((l) => l.id === unlockedLevel);
    return idx >= 0 ? idx : 0;
  });

  const level = LEVELS[currentIndex] || LEVELS[0];
  const isUnlocked = level.id <= unlockedLevel && level.id <= TOTAL_LEVELS;
  const isCleared = completedLevels.includes(level.id);
  const roomPuzzles = puzzles.filter((p) => p.level === level.id);
  const bestTimeMs = bestTimes[level.id];
  const bestTimeMins = bestTimeMs ? Math.floor(bestTimeMs / 60000) : 0;
  const bestTimeSecs = bestTimeMs ? Math.floor((bestTimeMs % 60000) / 1000) : 0;

  // Keyboard navigation for Chapter Carousel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => Math.min(LEVELS.length - 1, prev + 1));
      } else if (e.key === 'Enter' && isUnlocked) {
        setCurrentLevel(level.id);
        setAppState('CHAPTER_PROLOGUE');
      } else if (e.key === 'Escape') {
        setAppState('LANDING');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isUnlocked, level.id, setCurrentLevel, setAppState]);

  const handleEnterChapter = () => {
    if (!isUnlocked) return;
    setCurrentLevel(level.id);
    setAppState('CHAPTER_PROLOGUE');
  };

  return (
    <main className="luto-atmosphere">
      <div className="carousel-page-container">
        {/* Top Bar */}
        <div className="carousel-top-bar">
          <button
            type="button"
            className="carousel-nav-link"
            onClick={() => setAppState('LANDING')}
          >
            <ArrowLeft size={13} />
            <span>MAIN ARCHIVE</span>
          </button>

          <div style={{ fontSize: '11px', letterSpacing: '0.25em', color: '#8b929e', textTransform: 'uppercase' }}>
            THE HALL OF CHAPTERS // 0{currentIndex + 1} OF 0{LEVELS.length}
          </div>

          <div style={{ width: '120px', textAlign: 'right', fontSize: '10px', color: '#64748b', letterSpacing: '0.15em' }}>
            [ ← / → TO SLIDE ]
          </div>
        </div>

        {/* The Chapter Stage */}
        <div className="carousel-stage">
          <div className="chapter-card-slide" key={level.id}>
            {/* Left Content Area */}
            <div>
              <div className="chapter-number-tag">
                {CHAPTER_SUBTITLES[currentIndex] || `CHAPTER 0${currentIndex + 1}`}
              </div>

              <h2 className="chapter-title">
                {isUnlocked ? level.name : '████████ ████'}
              </h2>

              <p className="chapter-synopsis">
                {isUnlocked
                  ? level.description
                  : 'This psychological sector remains suppressed behind cognitive containment barriers.'}
              </p>

              {isUnlocked && (
                <div className="chapter-quote-box">
                  &ldquo;{level.quote}&rdquo;
                </div>
              )}
            </div>

            {/* Right Meta Column */}
            <div className="chapter-right-meta">
              <div>
                <div className="chapter-meta-row">
                  <span className="chapter-meta-label">DEPTH</span>
                  <span className="chapter-meta-val">-{level.depth}m</span>
                </div>

                <div className="chapter-meta-row">
                  <span className="chapter-meta-label">STATUS</span>
                  <span
                    className="chapter-meta-val"
                    style={{ color: isCleared ? '#f4f5f8' : isUnlocked ? '#f59e0b' : '#64748b' }}
                  >
                    {isCleared ? 'CONFRONTED' : isUnlocked ? 'ACCESSIBLE' : 'LOCKED'}
                  </span>
                </div>

                <div className="chapter-meta-row">
                  <span className="chapter-meta-label">PHENOMENA</span>
                  <span className="chapter-meta-val">{roomPuzzles.length} NODES</span>
                </div>

                {bestTimeMs && (
                  <div className="chapter-meta-row">
                    <span className="chapter-meta-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Timer size={11} /> RECORD
                    </span>
                    <span className="chapter-meta-val">
                      {String(bestTimeMins).padStart(2, '0')}:{String(bestTimeSecs).padStart(2, '0')}
                    </span>
                  </div>
                )}

                {/* Puzzle Checkpoints */}
                <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {roomPuzzles.map((p) => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: isCleared ? '#cbd5e1' : '#64748b' }}>
                      {isCleared ? <Check size={12} color="#f4f5f8" /> : <Lock size={11} color="#64748b" />}
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                className="chapter-action-btn"
                disabled={!isUnlocked}
                onClick={handleEnterChapter}
              >
                {isCleared ? 'RE-ENTER CHAPTER →' : isUnlocked ? 'STEP INTO CHAPTER →' : 'SECTOR SEALED'}
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Controls */}
        <div className="carousel-controls">
          <button
            type="button"
            className="carousel-arrow-btn"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            style={{ opacity: currentIndex === 0 ? 0.3 : 1 }}
            aria-label="Previous Chapter"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="carousel-dot-group">
            {LEVELS.map((l, i) => (
              <div
                key={l.id}
                className={`carousel-dot ${i === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(i)}
                title={`Chapter 0${i + 1}: ${l.name}`}
              />
            ))}
          </div>

          <button
            type="button"
            className="carousel-arrow-btn"
            disabled={currentIndex === LEVELS.length - 1}
            onClick={() => setCurrentIndex((prev) => Math.min(LEVELS.length - 1, prev + 1))}
            style={{ opacity: currentIndex === LEVELS.length - 1 ? 0.3 : 1 }}
            aria-label="Next Chapter"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <BgmPlayer />
    </main>
  );
};
