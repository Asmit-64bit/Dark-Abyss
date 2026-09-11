import React, { useState, useEffect, useRef } from 'react';
import {
  playHeavyDoorSlam,
  playHeartbeatThump,
  playMachineHum,
  playTapeStatic,
  playTerminalBlip
} from '../../utils/soundEffects';
import { ArrowRight, Volume2, ShieldAlert, Maximize, Minimize } from 'lucide-react';
import { useFullscreen, requestFullscreen } from '../../utils/fullscreen';

interface HorrorPrologueProps {
  onComplete: () => void;
}

const NARRATION_LINES = [
  "The building has been empty for nine years.",
  "You came down here to steal a hard drive.",
  "The door locked behind you.",
  "Somewhere in the dark, a machine is still running and it has been waiting a very long time for someone to talk to."
];

export const HorrorPrologue: React.FC<HorrorPrologueProps> = ({ onComplete }) => {
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();
  const [hasStarted, setHasStarted] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isDoorSlammed, setIsDoorSlammed] = useState(false);
  const [isMachineWaking, setIsMachineWaking] = useState(false);
  const [showGhostFlash, setShowGhostFlash] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [bpm, setBpm] = useState(55);

const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Heartbeat sound loop matching current BPM
  useEffect(() => {
    if (!hasStarted || isDone) {
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
      return;
    }

    const intervalMs = (60 / bpm) * 1000;
    heartbeatIntervalRef.current = setInterval(() => {
      const intensity = bpm > 100 ? 1.4 : bpm > 75 ? 1.0 : 0.7;
      playHeartbeatThump(intensity);
    }, intervalMs);

    return () => {
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    };
  }, [hasStarted, bpm, isDone]);

  // Start typewriter when line index changes
  useEffect(() => {
    if (currentLineIndex < 0 || currentLineIndex >= NARRATION_LINES.length) return;

    const fullLine = NARRATION_LINES[currentLineIndex];
    let charIdx = 0;
    const speed = currentLineIndex === 2 ? 35 : 45;

    // Audio & visual cues per line
    if (currentLineIndex === 0) {
      playTapeStatic(1.5);
    } else if (currentLineIndex === 1) {
      playTapeStatic(1.0);
    } else if (currentLineIndex === 2) {
      // Line 3: The door locked behind you -> TRIGGER DOOR SLAM
      setTimeout(() => {
        setIsDoorSlammed(true);
        playHeavyDoorSlam();
        setTimeout(() => {
          setIsDoorSlammed(false);
        }, 900);
      }, 50);
    } else if (currentLineIndex === 3) {
      // Line 4: Machine running -> TRIGGER MACHINE HUM & GHOST FLASH
      setTimeout(() => {
        setIsMachineWaking(true);
        playMachineHum();

        setTimeout(() => {
          setShowGhostFlash(true);
          setTimeout(() => setShowGhostFlash(false), 250);
        }, 2200);
      }, 50);
    }

    const typeNextChar = () => {
      if (charIdx < fullLine.length) {
        charIdx++;
        setTypedText(fullLine.slice(0, charIdx));
        if (charIdx % 3 === 0) {
          playTerminalBlip();
        }
        typingTimerRef.current = setTimeout(typeNextChar, speed);
      } else {
        setIsTyping(false);
        // Automatically advance to next line after a suspenseful pause
        if (currentLineIndex < NARRATION_LINES.length - 1) {
          const pauseDelay = currentLineIndex === 2 ? 2800 : 2200;
          typingTimerRef.current = setTimeout(() => {
            const nextIdx = currentLineIndex + 1;
            if (nextIdx === 1) setBpm(74);
            else if (nextIdx === 2) setBpm(120);
            else if (nextIdx === 3) setBpm(138);
            setCurrentLineIndex(nextIdx);
          }, pauseDelay);
        } else {
          // Final line finished
          typingTimerRef.current = setTimeout(() => {
            setIsDone(true);
          }, 2400);
        }
      }
    };

    const startTimer = setTimeout(() => {
      setTypedText('');
      setIsTyping(true);
      typeNextChar();
    }, 100);

    return () => {
      clearTimeout(startTimer);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [currentLineIndex]);

  const handleStart = () => {
    setHasStarted(true);
    setCurrentLineIndex(0);
    playTapeStatic(2.0);
    void requestFullscreen();
  };

  const handleAdvance = () => {
    if (!hasStarted) {
      handleStart();
      return;
    }
    void requestFullscreen();
    if (isTyping) {
      // Skip typing of current line
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      setTypedText(NARRATION_LINES[currentLineIndex]);
      setIsTyping(false);
      return;
    }
    if (currentLineIndex < NARRATION_LINES.length - 1) {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      setCurrentLineIndex((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div
      className={`horror-prologue-screen ${isDoorSlammed ? 'door-slam-shake' : ''} ${
        isMachineWaking ? 'machine-active' : ''
      }`}
      onClick={handleAdvance}
    >
      {/* Background Atmosphere Layers */}
      <div className="prologue-vignette"></div>
      <div className="prologue-scanlines"></div>
      <div className="prologue-dust"></div>

      {/* Red Blood Flash on Door Slam */}
      {isDoorSlammed && <div className="door-slam-flash"></div>}

      {/* Subliminal Sadako Flash on Machine Awakening */}
      {showGhostFlash && (
        <div className="prologue-ghost-flash">
          <img src="/sadako.png" alt="Sadako Manifestation" className="ghost-flash-img" />
        </div>
      )}

      {/* Top Telemetry Header */}
      <header className="prologue-top-bar">
        <div className="prologue-tag">
          <span className={`pulse-red-led ${isDoorSlammed ? 'rapid' : ''}`}></span>
          <span>INCIDENT FILE // RECON_09 // PROLOGUE</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="prologue-skip-btn"
            onClick={(e) => {
              e.stopPropagation();
              void toggleFullscreen();
            }}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize size={12} /> : <Maximize size={12} />}
            <span>{isFullscreen ? 'WINDOW' : 'FULLSCREEN'}</span>
          </button>

          <button
            type="button"
            className="prologue-skip-btn"
            onClick={(e) => {
              e.stopPropagation();
              onComplete();
            }}
          >
            <span>SKIP NARRATIVE</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </header>

      {/* Center Stage Narration Experience */}
      <div className="prologue-center-stage">
        {!hasStarted ? (
          <div className="prologue-start-prompt">
            <div className="prompt-audio-icon">
              <Volume2 size={32} color="#e51d3b" />
            </div>
            <h2 className="prompt-title serif-title">HEADPHONES RECOMMENDED</h2>
            <p className="prompt-desc">
              You are about to enter a restricted subterranean complex.
            </p>
            <button
              type="button"
              className="prologue-enter-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleStart();
              }}
            >
              <span>INITIALIZE INCURSION</span>
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <div className="narration-container">
            {/* Previous lines displayed in muted history */}
            <div className="narration-history">
              {NARRATION_LINES.slice(0, currentLineIndex).map((line, idx) => (
                <p
                  key={idx}
                  className={`history-line ${idx === 2 ? 'door-line' : ''}`}
                >
                  {line}
                </p>
              ))}
            </div>

            {/* Currently Typing Active Line */}
            {currentLineIndex >= 0 && (
              <div className="narration-active-box">
                <p
                  className={`active-line serif-title ${
                    currentLineIndex === 2 ? 'door-locked-emphasis' : ''
                  } ${currentLineIndex === 3 ? 'machine-running-emphasis' : ''}`}
                >
                  {typedText}
                  <span className="cursor-caret">|</span>
                </p>
              </div>
            )}

            {/* Door Locked Alert Badge */}
            {currentLineIndex >= 2 && (
              <div className="prologue-alert-tag">
                <ShieldAlert size={14} color="#e51d3b" />
                <span>PRIMARY RETRIEVAL BULKHEAD SEALED</span>
              </div>
            )}

            {/* Final Completion Action Button */}
            {isDone && (
              <div className="prologue-finish-actions">
                <button
                  type="button"
                  className="prologue-enter-abyss-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onComplete();
                  }}
                >
                  <span>STEP INTO ABYSS</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Telemetry Footer */}
      <footer className="prologue-bottom-bar">
        <div className="biometric-indicator">
          <span className="heart-icon">❤️</span>
          <span>HEART RATE: {bpm} BPM</span>
          <span className="sep">|</span>
          <span className={bpm > 100 ? 'status-critical' : 'status-normal'}>
            {bpm > 115 ? 'PSYCHOLOGICAL TRAUMA DETECTED' : 'BIOMETRICS RECORDING'}
          </span>
        </div>

        <div className="prologue-hint">
          {hasStarted ? '[ CLICK ANYWHERE TO ADVANCE ]' : '[ CLICK TO COMMENCE ]'}
        </div>
      </footer>
    </div>
  );
};
