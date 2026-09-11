import { useState, useEffect } from 'react';

/**
 * Cross-browser Fullscreen API utility for Abyss.
 * Handles mobile, tablet, and desktop browser vendor prefixes and user gesture permissions.
 */

interface ExtendedDocument extends Document {
  webkitFullscreenEnabled?: boolean;
  mozFullScreenEnabled?: boolean;
  msFullscreenEnabled?: boolean;
  webkitFullscreenElement?: Element | null;
  mozFullScreenElement?: Element | null;
  msFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
  mozCancelFullScreen?: () => Promise<void> | void;
  msExitFullscreen?: () => Promise<void> | void;
}

interface ExtendedHTMLElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void> | void;
  mozRequestFullScreen?: () => Promise<void> | void;
  msRequestFullscreen?: () => Promise<void> | void;
}

export const isFullscreenSupported = (): boolean => {
  if (typeof document === 'undefined') return false;
  const doc = document as ExtendedDocument;
  return Boolean(
    doc.fullscreenEnabled ||
    doc.webkitFullscreenEnabled ||
    doc.mozFullScreenEnabled ||
    doc.msFullscreenEnabled
  );
};

export const isFullscreenActive = (): boolean => {
  if (typeof document === 'undefined') return false;
  const doc = document as ExtendedDocument;
  return Boolean(
    doc.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.mozFullScreenElement ||
    doc.msFullscreenElement
  );
};

export const isMobileOrTablet = (): boolean => {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent.toLowerCase();
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth <= 1024;
  const isMobileUa = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
  return isTouch && (isSmallScreen || isMobileUa);
};

export const requestFullscreen = async (element?: HTMLElement): Promise<boolean> => {
  if (typeof document === 'undefined') return false;
  const target = (element || document.documentElement) as ExtendedHTMLElement;

  try {
    if (target.requestFullscreen) {
      await target.requestFullscreen();
      return true;
    } else if (target.webkitRequestFullscreen) {
      await target.webkitRequestFullscreen();
      return true;
    } else if (target.mozRequestFullScreen) {
      await target.mozRequestFullScreen();
      return true;
    } else if (target.msRequestFullscreen) {
      await target.msRequestFullscreen();
      return true;
    }
  } catch (err) {
    // Browser may reject if not directly inside a user tap gesture
    console.debug('Fullscreen request deferred or blocked by browser gesture policy:', err);
  }
  return false;
};

export const exitFullscreen = async (): Promise<boolean> => {
  if (typeof document === 'undefined') return false;
  if (!isFullscreenActive()) return false;
  const doc = document as ExtendedDocument;

  try {
    if (doc.exitFullscreen) {
      await doc.exitFullscreen();
      return true;
    } else if (doc.webkitExitFullscreen) {
      await doc.webkitExitFullscreen();
      return true;
    } else if (doc.mozCancelFullScreen) {
      await doc.mozCancelFullScreen();
      return true;
    } else if (doc.msExitFullscreen) {
      await doc.msExitFullscreen();
      return true;
    }
  } catch (err) {
    console.debug('Exit fullscreen failed:', err);
  }
  return false;
};

export const toggleFullscreen = async (): Promise<boolean> => {
  if (isFullscreenActive()) {
    return await exitFullscreen();
  } else {
    return await requestFullscreen();
  }
};

/**
 * React hook that provides live fullscreen state and trigger controls.
 */
export const useFullscreen = () => {
  const [isFullscreen, setIsFullscreen] = useState(() => isFullscreenActive());
  const [isSupported] = useState(() => isFullscreenSupported());

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(isFullscreenActive());
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  return {
    isFullscreen,
    isSupported,
    toggle: toggleFullscreen,
    request: requestFullscreen,
    exit: exitFullscreen,
  };
};
