export interface MobileInputState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  interact: boolean;
  lookDeltaX: number;
  lookDeltaY: number;
}

export const mobileInput: MobileInputState = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  interact: false,
  lookDeltaX: 0,
  lookDeltaY: 0,
};

export const setMobileMovement = (
  direction: 'forward' | 'backward' | 'left' | 'right',
  active: boolean
) => {
  mobileInput[direction] = active;
};

export const resetMobileMovement = () => {
  mobileInput.forward = false;
  mobileInput.backward = false;
  mobileInput.left = false;
  mobileInput.right = false;
};

export const triggerMobileInteract = () => {
  mobileInput.interact = true;
};

export const addMobileLookDelta = (dx: number, dy: number) => {
  mobileInput.lookDeltaX += dx;
  mobileInput.lookDeltaY += dy;
};

export const consumeMobileLookDelta = () => {
  const dx = mobileInput.lookDeltaX;
  const dy = mobileInput.lookDeltaY;
  mobileInput.lookDeltaX = 0;
  mobileInput.lookDeltaY = 0;
  return { dx, dy };
};

export const isTouchCapableDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};
