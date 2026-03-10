import { useEffect } from 'react';

interface HotkeyHandlers {
  onFillScreen: () => void;
  onActualSize: () => void;
  onToggleMusic: () => void;
  onClearCanvas: () => void;
  onToggleLaser: (active: boolean) => void;
}

export const useHotkeys = (handlers: HotkeyHandlers) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === 'f') handlers.onFillScreen();
      if (key === 'a') handlers.onActualSize();
      if (key === 'm') handlers.onToggleMusic();
      if (key === 'c') handlers.onClearCanvas();
      
      if (e.key === 'Shift' || e.key === 'Meta') {
        handlers.onToggleLaser(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // If Shift/Meta is released anywhere, turn off laser
      if (e.key === 'Shift' || e.key === 'Meta') {
        handlers.onToggleLaser(false);
      }
    };

    const handleBlur = () => {
      // If the window loses focus (e.g. user clicked into the iframe), 
      // we assume Shift is released to prevent the laser getting stuck.
      handlers.onToggleLaser(false);
      
      // Attempt to immediately reclaim focus so that global hotkeys (like Shift) 
      // continue to work without requiring the user to click the toolbar first.
      setTimeout(() => {
        window.focus();
      }, 50);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [handlers]);
};
