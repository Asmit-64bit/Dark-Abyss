import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';
import { ArrowRight } from 'lucide-react';
import { playTerminalBlip, playTapeStatic } from '../../utils/soundEffects';

interface ChapterPrologueProps {
  onComplete: () => void;
}

const CHAPTER_STORIES: Record<number, string[]> = {
  1: [
    "The sterile medical rooms where the loss was first diagnosed.",
    "The air still smells of antiseptic and denial."
  ],
  2: [
    "Storage containers holding possessions.",
    "Packed away in boxes, never to be opened again."
  ],
  3: [
    "Mainframe archives.",
    "Corrupted audio logs and AI simulations endlessly replay the final voicemail."
  ],
  4: [
    "The forgotten school wing.",
    "Echoes of children playing, now silenced by the rot.",
    "Guilt manifests in the lockers."
  ],
  5: [
    "The abandoned office block.",
    "Where the final hours were spent.",
    "A singularity where memory and reality collapse."
  ]
};

export const ChapterPrologue: React.FC<ChapterPrologueProps> = ({ onComplete }) => {
  const { currentLevel } = useGameStore();
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isDone, setIsDone] = useState(false);
  
  const lines = useMemo(
    () => CHAPTER_STORIES[currentLevel] || ["Unknown sector.", "Data corrupted."],
    [currentLevel]
  );
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    playTapeStatic(1.0);
  }, []);

  useEffect(() => {
    if (currentLineIndex < 0 || currentLineIndex >= lines.length) return;

    const fullLine = lines[currentLineIndex];
    let charIdx = 0;
    
    const typeNextChar = () => {
      if (charIdx < fullLine.length) {
        charIdx++;
        setTypedText(fullLine.slice(0, charIdx));
        if (charIdx % 3 === 0) playTerminalBlip();
        typingTimerRef.current = setTimeout(typeNextChar, 35);
      } else {
        setIsTyping(false);
        if (currentLineIndex < lines.length - 1) {
          typingTimerRef.current = setTimeout(() => {
            setCurrentLineIndex(prev => prev + 1);
          }, 1500);
        } else {
          typingTimerRef.current = setTimeout(() => {
            setIsDone(true);
          }, 1500);
        }
      }
    };

    const startTimer = setTimeout(typeNextChar, 500);

    return () => {
      clearTimeout(startTimer);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [currentLineIndex, lines]);

  const handleAdvance = () => {
    if (isTyping) {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      setTypedText(lines[currentLineIndex]);
      setIsTyping(false);
      return;
    }
    if (currentLineIndex < lines.length - 1) {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      setCurrentLineIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="horror-prologue-screen" onClick={handleAdvance} style={{ background: '#050705' }}>
      <div className="prologue-vignette"></div>
      <div className="prologue-scanlines"></div>
      
      <div className="prologue-center-stage">
        <div className="narration-container">
          <div className="narration-history">
            {lines.slice(0, currentLineIndex).map((line, idx) => (
              <p key={idx} className="history-line">{line}</p>
            ))}
          </div>
          
          {currentLineIndex >= 0 && (
            <div className="narration-active-box">
              <p className="active-line serif-title">
                {typedText}
                <span className="cursor-caret">|</span>
              </p>
            </div>
          )}
          
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
                <span>ENTER ROOM</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
      
      <footer className="prologue-bottom-bar">
        <div className="prologue-hint">
          [ CLICK ANYWHERE TO ADVANCE ]
        </div>
      </footer>
    </div>
  );
};
