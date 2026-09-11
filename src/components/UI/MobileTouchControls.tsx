import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  setMobileMovement,
  addMobileLookDelta,
  triggerMobileInteract,
  isTouchCapableDevice,
} from '../../utils/mobileInput';
import { useGameStore } from '../../store/gameStore';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Eye, Flashlight } from 'lucide-react';
import { playTerminalBlip } from '../../utils/soundEffects';

export const MobileTouchControls: React.FC = () => {
  const {
    activePuzzleId,
    bookModalOpen,
    hoveredObject,
    flashlightOn,
    toggleFlashlight,
  } = useGameStore();

  const [isTouch, setIsTouch] = useState(false);
  const [activeDirs, setActiveDirs] = useState<{
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
  }>({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  const lastLookPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouch(isTouchCapableDevice() || window.innerWidth <= 1024);
    };
    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  const handleDirStart = useCallback((dir: 'forward' | 'backward' | 'left' | 'right') => {
    setMobileMovement(dir, true);
    setActiveDirs((prev) => ({ ...prev, [dir]: true }));
  }, []);

  const handleDirEnd = useCallback((dir: 'forward' | 'backward' | 'left' | 'right') => {
    setMobileMovement(dir, false);
    setActiveDirs((prev) => ({ ...prev, [dir]: false }));
  }, []);

  // Look Zone Touch Drag Handlers
  const handleLookPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    lastLookPos.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const handleLookPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!lastLookPos.current) return;
    const dx = e.clientX - lastLookPos.current.x;
    const dy = e.clientY - lastLookPos.current.y;
    lastLookPos.current = { x: e.clientX, y: e.clientY };
    addMobileLookDelta(dx, dy);
  }, []);

  const handleLookPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    lastLookPos.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  }, []);

  // Do not render controls if user is in puzzle/book modal or not on touch screen
  if (!isTouch || activePuzzleId || bookModalOpen) {
    return null;
  }

  return (
    <div className="mobile-touch-root">
      {/* Invisible Touch Look Pan Surface (Right 50% of screen) */}
      <div
        className="mobile-look-zone"
        onPointerDown={handleLookPointerDown}
        onPointerMove={handleLookPointerMove}
        onPointerUp={handleLookPointerUp}
        onPointerCancel={handleLookPointerUp}
      />

      {/* D-Pad Virtual Movement Buttons (Bottom Left) */}
      <div className="mobile-dpad-container">
        {/* Row 1 */}
        <div />
        <button
          type="button"
          className={`mobile-dpad-btn ${activeDirs.forward ? 'active' : ''}`}
          onPointerDown={() => handleDirStart('forward')}
          onPointerUp={() => handleDirEnd('forward')}
          onPointerCancel={() => handleDirEnd('forward')}
          onPointerLeave={() => handleDirEnd('forward')}
          aria-label="Move Forward"
        >
          <ChevronUp size={22} />
        </button>
        <div />

        {/* Row 2 */}
        <button
          type="button"
          className={`mobile-dpad-btn ${activeDirs.left ? 'active' : ''}`}
          onPointerDown={() => handleDirStart('left')}
          onPointerUp={() => handleDirEnd('left')}
          onPointerCancel={() => handleDirEnd('left')}
          onPointerLeave={() => handleDirEnd('left')}
          aria-label="Move Left"
        >
          <ChevronLeft size={22} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.25, fontSize: '9px' }}>
          MOVE
        </div>
        <button
          type="button"
          className={`mobile-dpad-btn ${activeDirs.right ? 'active' : ''}`}
          onPointerDown={() => handleDirStart('right')}
          onPointerUp={() => handleDirEnd('right')}
          onPointerCancel={() => handleDirEnd('right')}
          onPointerLeave={() => handleDirEnd('right')}
          aria-label="Move Right"
        >
          <ChevronRight size={22} />
        </button>

        {/* Row 3 */}
        <div />
        <button
          type="button"
          className={`mobile-dpad-btn ${activeDirs.backward ? 'active' : ''}`}
          onPointerDown={() => handleDirStart('backward')}
          onPointerUp={() => handleDirEnd('backward')}
          onPointerCancel={() => handleDirEnd('backward')}
          onPointerLeave={() => handleDirEnd('backward')}
          aria-label="Move Backward"
        >
          <ChevronDown size={22} />
        </button>
        <div />
      </div>

      {/* Action Buttons (Bottom Right) */}
      <div className="mobile-action-group">
        {/* Flashlight Toggle */}
        <button
          type="button"
          className="mobile-action-btn"
          onClick={() => {
            playTerminalBlip();
            toggleFlashlight();
          }}
          title="Toggle Light"
        >
          <Flashlight size={18} color={flashlightOn ? '#f4f5f8' : '#64748b'} />
          <span style={{ color: flashlightOn ? '#f4f5f8' : '#8b929e' }}>
            {flashlightOn ? 'ON' : 'OFF'}
          </span>
        </button>

        {/* Inspect / Interact Action */}
        <button
          type="button"
          className={`mobile-action-btn ${hoveredObject ? 'inspect-pulse' : ''}`}
          onClick={() => {
            playTerminalBlip();
            triggerMobileInteract();
          }}
          title={hoveredObject ? `Inspect ${hoveredObject}` : 'Inspect'}
        >
          <Eye size={20} color={hoveredObject ? '#ef4444' : '#94a3b8'} />
          <span>INSPECT</span>
        </button>
      </div>
    </div>
  );
};
