import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useAuthStore } from '../../store/authStore';
import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ArrowLeft,
  X,
  Play,
  Code2,
  HelpCircle,
  Flashlight,
  Timer,
  Trophy,
  FileText,
  BookOpen,
  Copy,
  Check,
  Terminal,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import {
  generateAiPuzzle,
  evaluateAnswerWithAi,
} from '../../services/aiService';
import { StudyNotesModal } from './StudyNotesModal';
import { DocumentationViewer } from './DocumentationViewer';
import { LeaderboardModal } from './LeaderboardModal';
import { MobileTouchControls } from './MobileTouchControls';
import {
  playSolveChime,
  playErrorGlitch,
  playTerminalBlip,
} from '../../utils/soundEffects';
import { TOTAL_LEVELS } from '../../data/levels';

export const GameUI: React.FC = () => {
  const {
    puzzleStartTime,
    setPuzzleStartTime,
    currentDifficulty,
    setCurrentDifficulty,
    hoveredObject,
    message,
    inventory,
    activePuzzleId,
    setActivePuzzle,
    addToInventory,
    setEscaped,
    escaped,
    bookModalOpen,
    currentLevel,
    setAppState,
    completeLevel,
    dynamicPuzzles,
    setDynamicPuzzle,
    puzzleSources,
    setPuzzleSource,
    getPuzzle,
    flashlightOn,
    toggleFlashlight,
    recordError,
    recordHintUse,
    unlockAchievement,
    unlockedAchievementNotification,
    bestTimes,
    sanity,
    decreaseSanity,
    restoreSanity,
    baselineStartTime,
    setBaselineStartTime,
    baselineEndTime,
    setBaselineEndTime,
    adaptiveDifficulty,
    setAdaptiveDifficulty,
    isReadingDocumentation,
    setIsReadingDocumentation,
    score,
    soloSolvesCount: _soloSolvesCount,
    addScore,
    puzzleHintUsedForCurrent,
    puzzleErrorsForCurrent,
    recordCurrentPuzzleHintUsed,
    recordCurrentPuzzleError,
    leaderboardModalOpen,
    setLeaderboardModalOpen,
  } = useGameStore();

  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isLoadingPuzzle, setIsLoadingPuzzle] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // Clean Modal Tabs & Educational Debrief State
  const [activeModalTab, setActiveModalTab] = useState<'terminal' | 'hint' | 'debrief'>('terminal');
  const [copiedTakeaway, setCopiedTakeaway] = useState(false);

  // REPL Sandbox State
  const [showRepl, setShowRepl] = useState(false);
  const [replCode, setReplCode] = useState('');
  const [replOutput, setReplOutput] = useState<string[]>([]);
  const [isExecutingRepl, setIsExecutingRepl] = useState(false);

  // Live Sector Speedrun Timer
  const [timerDisplay, setTimerDisplay] = useState('00:00.0');
  const [finalSolveStats, setFinalSolveStats] = useState<{ timeStr: string; isRecord: boolean } | null>(null);

  useEffect(() => {
    if (escaped) return;
    const interval = setInterval(() => {
      const start = useGameStore.getState().sectorStartTime;
      if (start) {
        const elapsed = Date.now() - start;
        const mins = Math.floor(elapsed / 60000);
        const secs = Math.floor((elapsed % 60000) / 1000);
        const tenths = Math.floor((elapsed % 1000) / 100);
        setTimerDisplay(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${tenths}`);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [escaped]);

  // Release pointer lock when exit modal opens
  useEffect(() => {
    if (showExitModal) {
      document.exitPointerLock();
    }
  }, [showExitModal]);

  // Global key listener for Exit (Escape or Q)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        if (e.key === 'Escape') {
          if (activePuzzleId) setActivePuzzle(null);
          if (showExitModal) setShowExitModal(false);
        }
        return;
      }

      if (e.key === 'Escape') {
        if (activePuzzleId) {
          setActivePuzzle(null);
        } else if (showExitModal) {
          setShowExitModal(false);
        } else {
          setShowExitModal(true);
        }
      } else if (e.code === 'KeyQ' || e.key === 'q' || e.key === 'Q') {
        if (!activePuzzleId) {
          setShowExitModal((prev) => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePuzzleId, showExitModal, setActivePuzzle]);

  const activePuzzle = activePuzzleId ? getPuzzle(activePuzzleId) : null;
  const isAiGenerated = activePuzzleId
    ? puzzleSources[activePuzzleId] === 'groq' || puzzleSources[activePuzzleId] === 'ai' || puzzleSources[activePuzzleId] === 'gemini'
    : false;

  // Track baseline start time when first puzzle opens
  useEffect(() => {
    if (activePuzzleId === 1 && !baselineStartTime) {
      setBaselineStartTime(Date.now());
    }
  }, [activePuzzleId, baselineStartTime, setBaselineStartTime]);

  // Handle documentation interception for Puzzle 3
  useEffect(() => {
    if (activePuzzleId === 3 && currentLevel === 1 && !dynamicPuzzles[3] && !isReadingDocumentation && !adaptiveDifficulty) {
      // If they haven't solved 1 & 2 properly, fallback to intermediate
      setAdaptiveDifficulty('Intermediate');
      setIsReadingDocumentation(true);
    } else if (activePuzzleId === 3 && currentLevel === 1 && !dynamicPuzzles[3] && !isReadingDocumentation) {
      setIsReadingDocumentation(true);
    }
  }, [activePuzzleId, currentLevel, dynamicPuzzles, isReadingDocumentation, adaptiveDifficulty, setAdaptiveDifficulty, setIsReadingDocumentation]);

  // Automatically fetch / generate AI puzzle when an active puzzle is opened
  useEffect(() => {
    // If we are reading documentation, the DocumentationViewer handles the background fetch
    if (!activePuzzleId || dynamicPuzzles[activePuzzleId] || (activePuzzleId === 3 && isReadingDocumentation)) {
      return;
    }

    let isMounted = true;
    const fetchPuzzle = async () => {
      setIsLoadingPuzzle(true);
      setError('');
      try {
        const generated = await generateAiPuzzle(activePuzzleId, adaptiveDifficulty || undefined);
        if (isMounted) {
          setDynamicPuzzle(activePuzzleId, generated);
          setPuzzleSource(activePuzzleId, 'groq');
          setPuzzleStartTime(Date.now());
        }
      } catch (err) {
        console.error('Puzzle fetch error:', err);
      } finally {
        if (isMounted) {
          setIsLoadingPuzzle(false);
        }
      }
    };

    void fetchPuzzle();

    return () => {
      isMounted = false;
    };
  }, [activePuzzleId, dynamicPuzzles, setDynamicPuzzle, setPuzzleSource, setPuzzleStartTime, isReadingDocumentation, adaptiveDifficulty]);

  const handleRegeneratePuzzle = async () => {
    if (!activePuzzleId || isLoadingPuzzle) return;
    setIsLoadingPuzzle(true);
    setError('');
    setFeedback('');
    try {
      const generated = await generateAiPuzzle(activePuzzleId, adaptiveDifficulty || undefined);
      setDynamicPuzzle(activePuzzleId, generated);
      setPuzzleSource(activePuzzleId, 'groq');
      setPuzzleStartTime(Date.now());
      if (generated.codeSnippet) {
        setReplCode(generated.codeSnippet);
      }
    } catch (err) {
      console.error('Regenerate puzzle error:', err);
    } finally {
      setIsLoadingPuzzle(false);
    }
  };

  const handleRevealAnswer = () => {
    if (activePuzzle && activePuzzle.answer.length > 0) {
      setAnswer(String(activePuzzle.answer[0]));
      decreaseSanity(15);
      setError('');
      setFeedback('[ SYSTEM OVERRIDE: Answer revealed. Sanity penalized. ]');
      playErrorGlitch();
    }
  };

  const handleRunRepl = () => {
    setIsExecutingRepl(true);
    playTerminalBlip();
    unlockAchievement('sandbox_pilot');

    const logs: string[] = [];
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    console.log = (...args) => logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
    console.warn = (...args) => logs.push('[WARN] ' + args.join(' '));
    console.error = (...args) => logs.push('[ERR] ' + args.join(' '));

    try {
      const fn = new Function(replCode);
      const retVal = fn();
      if (retVal !== undefined) {
        logs.push(`=> ${typeof retVal === 'object' ? JSON.stringify(retVal) : String(retVal)}`);
      }
      if (logs.length === 0) {
        logs.push('Memory execution completed (0 logs).');
      }
    } catch (err: any) {
      logs.push(`[EXECUTION FAULT]: ${err?.message || err}`);
    } finally {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
      setReplOutput(logs);
      setIsExecutingRepl(false);
    }
  };

  const handlePuzzleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePuzzle || isEvaluating) return;

    if (!answer.trim()) {
      setError('Please provide an input sequence.');
      return;
    }

    setIsEvaluating(true);
    setError('');
    setFeedback('');
    playTerminalBlip();

    try {
      const currentTime = typeof window !== 'undefined' ? window.Date.now() : 0;
      const solveTimeMs = puzzleStartTime && currentTime ? currentTime - puzzleStartTime : undefined;
      const result = await evaluateAnswerWithAi(activePuzzle, answer, solveTimeMs, currentDifficulty);

      if (result.isCorrect) {
        // Calculate points based on independent unassisted solve
        const isSolo = !puzzleHintUsedForCurrent;
        const diff = (activePuzzle.debrief?.difficulty || currentDifficulty || 'Intermediate').toLowerCase();
        const basePoints =
          diff.includes('expert') ? 1000 :
          diff.includes('advanced') ? 500 :
          diff.includes('intermediate') ? 250 : 100;

        const hintMultiplier = isSolo ? 1.25 : 0.7;
        const errorPenalty = puzzleErrorsForCurrent * 10;
        const precisionBonus = puzzleErrorsForCurrent === 0 ? 50 : 0;
        const solveSec = solveTimeMs ? solveTimeMs / 1000 : 60;
        const speedBonus = solveSec < 45 ? 50 : solveSec < 90 ? 25 : 0;
        const sanityBonus = sanity >= 80 ? 30 : 0;

        const totalEarned = Math.max(
          25,
          Math.round(basePoints * hintMultiplier) - errorPenalty + precisionBonus + speedBonus + sanityBonus
        );

        addScore(totalEarned, isSolo);

        const pointBreakdownMsg = `+${totalEarned} PTS [${isSolo ? '🎯 INDEPENDENT SOLO SOLVE' : 'ASSISTED SOLVE'}]`;

        if (result.nextDifficulty && result.nextDifficulty !== currentDifficulty) {
          setCurrentDifficulty(result.nextDifficulty);
          setFeedback(`[ SYSTEM ADAPTATION: Threat level escalating to ${result.nextDifficulty.toUpperCase()} ]\n${result.feedback || 'MEMORY RECONCILED.'}\n${pointBreakdownMsg}`);
        } else {
          setFeedback(`${result.feedback || 'MEMORY RECONCILED. Sector anomaly stabilized.'}\n${pointBreakdownMsg}`);
        }

        playSolveChime();
        restoreSanity(25);
        setError('');
        
        setTimeout(() => {
          setAnswer('');
          setActivePuzzle(null);
          if (activePuzzle.reward === 'Escape') {
            const start = useGameStore.getState().sectorStartTime || Date.now();
            const elapsed = Date.now() - start;
            const existingBest = bestTimes[currentLevel];
            const isRecord = !existingBest || elapsed < existingBest;
            const mins = Math.floor(elapsed / 60000);
            const secs = Math.floor((elapsed % 60000) / 1000);
            setFinalSolveStats({
              timeStr: `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`,
              isRecord,
            });
            setEscaped(true);
          } else {
            addToInventory(activePuzzle.reward);
            
            // Baseline Difficulty Computation on Puzzle 2 solve
            if (activePuzzle.id === 2 && baselineStartTime && !baselineEndTime) {
              const endTime = Date.now();
              setBaselineEndTime(endTime);
              const elapsedSeconds = (endTime - baselineStartTime) / 1000;
              
              if (elapsedSeconds < 45) {
                setAdaptiveDifficulty('Advanced');
              } else if (elapsedSeconds <= 90) {
                setAdaptiveDifficulty('Intermediate');
              } else {
                setAdaptiveDifficulty('Beginner');
              }
            }
          }
        }, 2400);
      } else {
        playErrorGlitch();
        recordError();
        recordCurrentPuzzleError();
        decreaseSanity(15);
        setError(result.feedback || 'The anomaly rejects this sequence.');
      }
    } catch (err) {
      console.error('Evaluation error:', err);
      setError('Psychic signal interference during evaluation.');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Dynamic Heartbeat BPM calculation based on sanity
  const currentBpm = Math.round(72 + ((100 - sanity) / 100) * 80);
  const isHighFear = sanity < 40;

  if (escaped) {
    const isGameBeaten = currentLevel >= TOTAL_LEVELS;

    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 100,
          background: 'rgba(4, 5, 7, 0.96)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#f4f5f8',
          fontFamily: 'Inter, sans-serif',
          backdropFilter: 'blur(24px)',
          padding: '2rem',
        }}
      >
        <Trophy size={44} color="#f4f5f8" style={{ marginBottom: '1.5rem', opacity: 0.9 }} />

        <h1
          style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '2.6rem',
            letterSpacing: '0.22em',
            margin: 0,
            textAlign: 'center',
            textTransform: 'uppercase',
          }}
        >
          {isGameBeaten ? 'FACILITY PURGED' : `CHAPTER 0${currentLevel} CLEARED`}
        </h1>

        <p style={{ fontSize: '0.95rem', marginTop: '1rem', color: '#8b929e', maxWidth: '500px', textAlign: 'center', lineHeight: 1.8, fontWeight: 300 }}>
          {isGameBeaten
            ? 'You have confronted all suppressed anomalies across the deep core.'
            : `Psychological containment for Chapter 0${currentLevel} completed. The descent continues.`}
        </p>

        {finalSolveStats && (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              padding: '12px 24px',
              marginTop: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1', fontSize: '13px', letterSpacing: '0.08em' }}>
              <Timer size={15} color="#8b929e" />
              <span>TIME: <strong style={{ fontFamily: 'monospace' }}>{finalSolveStats.timeStr}</strong></span>
            </div>
            {finalSolveStats.isRecord && (
              <span style={{ fontSize: '10px', background: 'rgba(255, 255, 255, 0.12)', border: '1px solid rgba(255, 255, 255, 0.3)', color: '#fff', padding: '2px 8px', borderRadius: '3px', fontWeight: 600, letterSpacing: '0.12em' }}>
                ★ NEW BEST
              </span>
            )}
          </div>
        )}

        <button
          onClick={() => {
            completeLevel(currentLevel);
            const authState = useAuthStore.getState();
            if (authState.user) {
              void authState.syncProfileToCloud();
            }
            setAppState('LEVEL_SELECT');
          }}
          className="chapter-action-btn"
          style={{
            marginTop: '2.5rem',
            padding: '12px 40px',
            fontSize: '0.85rem',
            width: 'auto',
          }}
        >
          {isGameBeaten ? 'RETURN TO ARCHIVE →' : 'CONTINUE TO NEXT CHAPTER →'}
        </button>
      </div>
    );
  }

  return (
    <div
      className="luto-hud-overlay"
      style={{ pointerEvents: activePuzzleId || showExitModal || bookModalOpen ? 'auto' : 'none' }}
    >
      {/* Low Sanity Psychological Fear Vignette */}
      {isHighFear && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 1,
            boxShadow:
              sanity < 20
                ? 'inset 0 0 160px rgba(185, 28, 28, 0.7), inset 0 0 280px rgba(0, 0, 0, 0.92)'
                : 'inset 0 0 100px rgba(0, 0, 0, 0.85)',
            transition: 'box-shadow 0.6s ease',
          }}
        />
      )}

      {/* Top Bar - Minimalist Chronometer & Flashlight */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', zIndex: 10, flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', pointerEvents: 'auto' }}>
          <button
            type="button"
            onClick={() => setAppState('LANDING')}
            style={{
              fontSize: '10px',
              letterSpacing: '0.15em',
              color: '#8b929e',
              textTransform: 'uppercase',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '6px 12px',
              borderRadius: '4px',
              background: 'rgba(14, 16, 21, 0.8)',
              transition: 'background 0.2s',
              cursor: 'pointer',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(14, 16, 21, 0.8)')}
          >
            ← BACK
          </button>
          <div style={{ fontSize: '11px', letterSpacing: '0.18em', color: '#8b929e', textTransform: 'uppercase' }}>
            CHAPTER 0{currentLevel}<span className="hidden-xs"> // LIMINAL LOCUS</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', pointerEvents: 'auto' }}>
          {/* Chronometer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: 'rgba(14, 16, 21, 0.8)',
              border: '1px solid var(--luto-border)',
              padding: '6px 10px',
              borderRadius: '4px',
              fontSize: '11px',
              color: '#cbd5e1',
              backdropFilter: 'blur(12px)',
            }}
          >
            <Timer size={13} color="#8b929e" />
            <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{timerDisplay}</span>
          </div>

          {/* Flashlight Toggle */}
          <button
            type="button"
            onClick={toggleFlashlight}
            className="carousel-nav-link"
            style={{
              padding: '6px 10px',
              fontSize: '10px',
              letterSpacing: '0.1em',
              color: flashlightOn ? '#f4f5f8' : '#8b929e',
            }}
            title="Toggle Light [ F ]"
          >
            <Flashlight size={12} color={flashlightOn ? '#f4f5f8' : '#8b929e'} />
            <span className="hidden-xs">{flashlightOn ? 'LIGHT [ON]' : 'LIGHT [OFF]'}</span>
            <span className="visible-xs">{flashlightOn ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Center Dynamic Focus Reticle */}
      <div className="luto-focus-center">
        {!activePuzzleId && (
          <div className={`luto-reticle-dot ${hoveredObject ? 'focused' : ''}`} />
        )}

        {hoveredObject && !activePuzzleId && (
          <div className="luto-hover-whisper">
            [ E ] INSPECT <span style={{ color: '#fff', fontWeight: 600 }}>{hoveredObject}</span>
          </div>
        )}

        {message && (
          <div
            style={{
              position: 'absolute',
              top: '-80px',
              padding: '10px 20px',
              background: 'rgba(14, 16, 21, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '4px',
              color: '#f4f5f8',
              fontSize: '12px',
              letterSpacing: '0.08em',
              textAlign: 'center',
              maxWidth: '80vw',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8)',
            }}
          >
            {message}
          </div>
        )}
      </div>

      {/* Bottom-Left Real-time EKG Cardiac Monitor */}
      <div className="luto-ekg-card">
        <svg className="ekg-waveform-svg" viewBox="0 0 60 22">
          <path
            d="M0,11 L18,11 L22,3 L26,19 L30,8 L34,14 L38,11 L60,11"
            fill="none"
            stroke={isHighFear ? '#dc2626' : '#f4f5f8'}
            strokeWidth="1.5"
            className="ekg-line"
            style={{ animationDuration: isHighFear ? '0.75s' : '1.5s' }}
          />
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '9px', color: '#8b929e', letterSpacing: '0.15em' }}>PULSE</span>
          <span className="ekg-bpm-label" style={{ color: isHighFear ? '#f87171' : '#f4f5f8' }}>
            {currentBpm} BPM
          </span>
        </div>
      </div>

      {/* Bottom-Right Ghost Inventory Dock */}
      <div className="luto-inventory-dock">
        {inventory.length > 0 ? (
          inventory.map((item, idx) => (
            <div key={idx} className="luto-inventory-pill">
              {item}
            </div>
          ))
        ) : (
          <div className="luto-inventory-pill" style={{ opacity: 0.4 }}>
            POCKETS EMPTY
          </div>
        )}
      </div>

      {/* Diegetic Mobile Touch D-Pad & Camera Controls */}
      <MobileTouchControls />

      {/* Exit Confirmation Modal */}
      {showExitModal && (
        <div className="luto-dossier-overlay">
          <div className="luto-dossier-modal" style={{ width: '420px' }}>
            <div className="dossier-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f4f5f8' }}>
                <LogOut size={16} color="#dc2626" />
                <span style={{ fontSize: '11px', letterSpacing: '0.18em', fontWeight: 600 }}>
                  PAUSE SIMULATION
                </span>
              </div>
              <button
                onClick={() => setShowExitModal(false)}
                className="carousel-nav-link"
                style={{ padding: '4px' }}
              >
                <X size={14} />
              </button>
            </div>

            <p style={{ fontSize: '12px', color: '#8b929e', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              Your progress in Chapter 0{currentLevel} is retained. Choose a destination:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setShowExitModal(false);
                  setAppState('LEVEL_SELECT');
                }}
                className="title-menu-btn"
              >
                <ArrowLeft size={13} />
                <span>CHAPTER ARCHIVES</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowExitModal(false);
                  setAppState('LANDING');
                }}
                className="title-menu-btn"
              >
                <LogOut size={13} />
                <span>MAIN TITLE SCREEN</span>
              </button>

              <button
                type="button"
                onClick={() => setShowExitModal(false)}
                className="carousel-nav-link"
                style={{ justifyContent: 'center', marginTop: '6px' }}
              >
                RESUME [ ESC ]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Psychological Dossier / Puzzle Modal or Documentation */}
      {activePuzzleId && isReadingDocumentation && activePuzzleId === 3 ? (
        <DocumentationViewer />
      ) : activePuzzleId && (
        <div className="luto-dossier-overlay">
          <div className="luto-dossier-modal">
            {/* Dossier Header */}
            <div className="dossier-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f4f5f8' }}>
                <FileText size={15} />
                <span style={{ fontSize: '11px', letterSpacing: '0.22em', fontWeight: 600 }}>
                  PSYCHOLOGICAL DOSSIER // CHAPTER 0{currentLevel}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {activePuzzle?.debrief?.difficulty && (
                  <span
                    style={{
                      fontSize: '8.5px',
                      letterSpacing: '0.14em',
                      color:
                        activePuzzle.debrief.difficulty === 'Expert'
                          ? '#ef4444'
                          : activePuzzle.debrief.difficulty === 'Advanced'
                          ? '#f59e0b'
                          : '#10b981',
                      background: 'rgba(255, 255, 255, 0.05)',
                      padding: '2px 7px',
                      borderRadius: '3px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      fontWeight: 600,
                    }}
                  >
                    {activePuzzle.debrief.difficulty.toUpperCase()}
                  </span>
                )}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '8.5px',
                    letterSpacing: '0.14em',
                    color: '#facc15',
                    background: 'rgba(234, 179, 8, 0.1)',
                    padding: '2px 7px',
                    borderRadius: '3px',
                    border: '1px solid rgba(234, 179, 8, 0.25)',
                    cursor: 'pointer',
                  }}
                  onClick={() => setLeaderboardModalOpen(true)}
                  title="Open Leaderboard"
                >
                  <Trophy size={9} />
                  <span>{score.toLocaleString()} PTS</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '8.5px',
                    letterSpacing: '0.14em',
                    color: isAiGenerated ? '#f4f5f8' : '#8b929e',
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '2px 7px',
                    borderRadius: '3px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Sparkles size={9} />
                  <span>{isAiGenerated ? 'SYNCHRONIZED' : 'ANOMALY NODE'}</span>
                </div>
              </div>
            </div>

            {/* Clean Minimalist Tab Bar */}
            <div className="dossier-tabs-bar">
              <button
                type="button"
                onClick={() => setActiveModalTab('terminal')}
                className={`dossier-tab-btn ${activeModalTab === 'terminal' ? 'active' : ''}`}
              >
                <Terminal size={12} />
                <span>TERMINAL</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveModalTab('hint');
                  recordHintUse();
                  recordCurrentPuzzleHintUsed();
                }}
                className={`dossier-tab-btn ${activeModalTab === 'hint' ? 'active' : ''}`}
              >
                <HelpCircle size={12} />
                <span>CLUE</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModalTab('debrief')}
                className={`dossier-tab-btn ${activeModalTab === 'debrief' ? 'active' : ''}`}
              >
                <BookOpen size={12} />
                <span>FORENSIC DEBRIEF</span>
              </button>
            </div>

            {/* Loading State */}
            {isLoadingPuzzle ? (
              <div style={{ padding: '3rem 0', textAlign: 'center' }}>
                <RefreshCw size={24} color="#f4f5f8" className="animate-spin" style={{ margin: '0 auto 1rem', opacity: 0.8 }} />
                <p style={{ color: '#f4f5f8', fontSize: '11.5px', letterSpacing: '0.22em', margin: 0 }}>
                  [ EXTRACTING SUPPRESSED MEMORY... ]
                </p>
              </div>
            ) : activePuzzle ? (
              <>
                {/* TAB 1: TERMINAL & REPL */}
                {activeModalTab === 'terminal' && (
                  <>
                    <h2 className="dossier-title">{activePuzzle.title}</h2>
                    <p className="dossier-scenario">{activePuzzle.scenario}</p>

                    {activePuzzle.codeSnippet && activePuzzle.codeSnippet.trim() !== '' && (
                      <pre
                        style={{
                          background: 'rgba(0, 0, 0, 0.65)',
                          padding: '0.9rem 1.2rem',
                          borderRadius: '4px',
                          border: '1px solid var(--luto-border)',
                          color: '#e2e8f0',
                          fontSize: '0.85rem',
                          overflowX: 'auto',
                          marginBottom: '1rem',
                          fontFamily: 'JetBrains Mono, monospace',
                        }}
                      >
                        <code>{activePuzzle.codeSnippet}</code>
                      </pre>
                    )}

                    {/* REPL Sandbox Runner */}
                    {showRepl && (
                      <div
                        style={{
                          background: 'rgba(0, 0, 0, 0.75)',
                          border: '1px solid var(--luto-border)',
                          borderRadius: '4px',
                          padding: '10px',
                          marginBottom: '1rem',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '10px', color: '#8b929e', fontWeight: 600, letterSpacing: '0.1em' }}>
                            LOGIC SCRIPT EXECUTION
                          </span>
                          <button
                            type="button"
                            onClick={handleRunRepl}
                            disabled={isExecutingRepl}
                            className="carousel-nav-link"
                            style={{ padding: '3px 8px', fontSize: '10px' }}
                          >
                            <Play size={10} />
                            <span>RUN</span>
                          </button>
                        </div>
                        <textarea
                          value={replCode}
                          onChange={(e) => setReplCode(e.target.value)}
                          rows={3}
                          style={{
                            width: '100%',
                            background: 'rgba(4, 5, 7, 0.95)',
                            border: '1px solid var(--luto-border)',
                            color: '#f4f5f8',
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: '11px',
                            padding: '8px',
                            borderRadius: '3px',
                            outline: 'none',
                            resize: 'vertical',
                          }}
                        />
                        {replOutput.length > 0 && (
                          <div
                            style={{
                              marginTop: '6px',
                              background: 'rgba(0, 0, 0, 0.85)',
                              padding: '6px 8px',
                              borderRadius: '3px',
                              fontSize: '10.5px',
                              maxHeight: '90px',
                              overflowY: 'auto',
                              color: '#cbd5e1',
                              borderTop: '1px solid var(--luto-border)',
                              fontFamily: 'JetBrains Mono, monospace',
                            }}
                          >
                            {replOutput.map((log, i) => (
                              <div key={i} style={{ color: log.startsWith('[EXEC') ? '#f87171' : '#f4f5f8' }}>
                                {log}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div
                      style={{
                        padding: '10px 14px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderLeft: '2px solid rgba(255, 255, 255, 0.3)',
                        color: '#f4f5f8',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        marginBottom: '1rem',
                      }}
                    >
                      {activePuzzle.question}
                    </div>

                    <form onSubmit={handlePuzzleSubmit}>
                      <input
                        type="text"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Enter resolution sequence..."
                        disabled={isEvaluating}
                        autoFocus
                        className="dossier-input"
                      />

                      {error && (
                        <div style={{ color: '#f87171', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                          <AlertCircle size={14} /> {error}
                        </div>
                      )}

                      {feedback && (
                        <div style={{ color: '#10b981', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                          <CheckCircle2 size={14} /> {feedback}
                        </div>
                      )}

                      {feedback && activePuzzle.nextClue && (
                        <div
                          style={{
                            marginTop: '8px',
                            paddingLeft: '20px',
                            color: '#8b929e',
                            fontSize: '0.75rem',
                            fontStyle: 'italic',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '6px',
                          }}
                        >
                          <Sparkles size={12} style={{ marginTop: '2px', flexShrink: 0 }} />
                          <span>{activePuzzle.nextClue}</span>
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.25rem' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setActivePuzzle(null);
                              setError('');
                              setFeedback('');
                              setAnswer('');
                            }}
                            className="carousel-nav-link"
                          >
                            CLOSE
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowRepl((prev) => !prev)}
                            className="carousel-nav-link"
                            style={{ fontSize: '10px' }}
                          >
                            <Code2 size={11} />
                            <span>{showRepl ? 'HIDE RUNNER' : 'SANDBOX'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleRegeneratePuzzle}
                            disabled={isLoadingPuzzle || isEvaluating}
                            className="carousel-nav-link"
                            title="Reconstruct variation"
                          >
                            <RefreshCw size={11} />
                            <span>RE-ROLL</span>
                          </button>
                        </div>

                        <button
                          type="submit"
                          disabled={isEvaluating}
                          className="chapter-action-btn"
                          style={{ margin: 0, width: 'auto', padding: '8px 24px' }}
                        >
                          {isEvaluating ? 'CONFRONTING...' : 'TRANSMIT →'}
                        </button>
                      </div>
                    </form>
                  </>
                )}

                {/* TAB 2: SOCRATIC CLUE */}
                {activeModalTab === 'hint' && (
                  <div className="dossier-debrief-card">
                    <div>
                      <div className="debrief-section-title">
                        <HelpCircle size={12} color="#f59e0b" />
                        <span>SUPPRESSED MEMORY CLUE</span>
                      </div>
                      <p className="debrief-text" style={{ fontStyle: 'italic', color: '#f1f5f9' }}>
                        "{activePuzzle.hint || 'Examine logic state boundaries and control flow.'}"
                      </p>
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '9px', color: '#8b929e', letterSpacing: '0.12em' }}>
                        TOPIC: {activePuzzle.debrief?.domain || 'CYBERSECURITY & LOGIC'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveModalTab('terminal')}
                        className="carousel-nav-link"
                        style={{ padding: '4px 10px', fontSize: '9.5px' }}
                      >
                        ← RETURN TO TERMINAL
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 3: FORENSIC DEBRIEF */}
                {activeModalTab === 'debrief' && (
                  <div className="dossier-debrief-card">
                    {/* Key Takeaway */}
                    <div>
                      <div className="debrief-section-title">
                        <ShieldCheck size={12} color="#10b981" />
                        <span>VULNERABILITY & LOGIC ANATOMY</span>
                      </div>
                      <p className="debrief-text">
                        {activePuzzle.debrief?.keyTakeaway || 'This challenge tests foundational programming invariants and secure state handling.'}
                      </p>
                    </div>

                    {/* Real World Impact */}
                    <div>
                      <div className="debrief-section-title">
                        <AlertCircle size={12} color="#ef4444" />
                        <span>REAL-WORLD INCIDENT / CVE IMPACT</span>
                      </div>
                      <p className="debrief-text">
                        {activePuzzle.debrief?.realWorldImpact || 'Improper handling of this vulnerability pattern can lead to denial of service or unauthorized state changes.'}
                      </p>
                    </div>

                    {/* Remediation Code Snippet */}
                    {activePuzzle.debrief?.remediationCode && (
                      <div>
                        <div className="debrief-section-title">
                          <Code2 size={12} color="#38bdf8" />
                          <span>RECOMMENDED DEFENSIVE FIX</span>
                        </div>
                        <pre
                          style={{
                            background: 'rgba(0, 0, 0, 0.75)',
                            padding: '0.75rem 1rem',
                            borderRadius: '4px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#e2e8f0',
                            fontSize: '0.82rem',
                            overflowX: 'auto',
                            margin: 0,
                            fontFamily: 'JetBrains Mono, monospace',
                          }}
                        >
                          <code>{activePuzzle.debrief.remediationCode}</code>
                        </pre>
                      </div>
                    )}

                    {/* Copy Key Takeaway Button */}
                    <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => {
                          const note = `[Abyss - Learning Dossier]\nTopic: ${activePuzzle.debrief?.domain || 'Logic'}\nDifficulty: ${activePuzzle.debrief?.difficulty || 'Standard'}\nKey Takeaway: ${activePuzzle.debrief?.keyTakeaway || ''}\nReal-World Impact: ${activePuzzle.debrief?.realWorldImpact || ''}\nRemediation:\n${activePuzzle.debrief?.remediationCode || ''}`;
                          navigator.clipboard.writeText(note);
                          setCopiedTakeaway(true);
                          setTimeout(() => setCopiedTakeaway(false), 2000);
                        }}
                        className="carousel-nav-link"
                        style={{ padding: '4px 10px', fontSize: '9.5px' }}
                      >
                        {copiedTakeaway ? <Check size={11} color="#10b981" /> : <Copy size={11} />}
                        <span>{copiedTakeaway ? 'COPIED TO CLIPBOARD' : 'COPY DOSSIER NOTE'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveModalTab('terminal')}
                        className="carousel-nav-link"
                        title="Return to Terminal"
                        style={{
                          padding: '4px 10px', 
                          fontSize: '9.5px',
                          ...(isAiGenerated ? {
                            background: 'linear-gradient(90deg, rgba(96, 165, 250, 0.1), rgba(244, 114, 182, 0.1))',
                            border: '1px solid rgba(244, 114, 182, 0.3)',
                            color: '#f472b6',
                            boxShadow: '0 0 10px rgba(96, 165, 250, 0.15)'
                          } : {})
                        }}
                      >
                        ← RETURN TO TERMINAL
                      </button>
                      <button
                        type="button"
                        onClick={handleRevealAnswer}
                        disabled={isLoadingPuzzle || isEvaluating}
                        className="carousel-nav-link"
                        title="Reveal Answer (-15 Sanity)"
                        style={{
                          background: 'rgba(248, 113, 113, 0.1)',
                          border: '1px solid rgba(248, 113, 113, 0.3)',
                          color: '#f87171',
                        }}
                      >
                        <Eye size={11} />
                        <span>REVEAL</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* Achievement Unlocked Toast Notification */}
      {unlockedAchievementNotification && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 110,
            background: 'rgba(16, 18, 24, 0.96)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8)',
            padding: '12px 18px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            maxWidth: '320px',
            pointerEvents: 'auto',
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>{unlockedAchievementNotification.icon}</span>
          <div>
            <div style={{ fontSize: '9px', color: '#8b929e', letterSpacing: '0.18em', fontWeight: 600 }}>
              RECORD DISCOVERED
            </div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#f4f5f8' }}>
              {unlockedAchievementNotification.title}
            </div>
            <div style={{ fontSize: '10px', color: '#cbd5e1', marginTop: '2px' }}>
              {unlockedAchievementNotification.description}
            </div>
          </div>
        </div>
      )}

      {/* Chapter Study Notes Modal */}
      <StudyNotesModal />

      {/* Global Operators Leaderboard Modal */}
      {leaderboardModalOpen && (
        <LeaderboardModal isOpen={leaderboardModalOpen} onClose={() => setLeaderboardModalOpen(false)} />
      )}
    </div>
  );
};
