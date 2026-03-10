import React, { useEffect, useState } from 'react';

interface CustomCursorOverlayProps {
  cursorStyle: string;
}

export const CustomCursorOverlay: React.FC<CustomCursorOverlayProps> = ({ cursorStyle }) => {
  const [position, setPosition] = useState({ x: -100, y: -100 });

  useEffect(() => {
    if (cursorStyle === 'default') return;

    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOut = (e: MouseEvent) => {
      if (!e.relatedTarget) {
        // Mouse left the document (e.g., entered the iframe or left the window)
        setPosition({ x: -100, y: -100 });
      }
    };

    window.addEventListener('mousemove', updatePosition);
    document.addEventListener('mouseout', handleMouseOut);
    
    return () => {
      window.removeEventListener('mousemove', updatePosition);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, [cursorStyle]);

  if (cursorStyle === 'default') return null;

  let content = null;
  switch (cursorStyle) {
    case 'hand': 
      // Hand cursor is native usually, but let's emulate it
      content = <svg width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="black" strokeWidth="1" xmlns="http://www.w3.org/2000/svg"><path d="M18.5 9.5C18.5 8.11929 17.3807 7 16 7C14.6193 7 13.5 8.11929 13.5 9.5V11H13V5.5C13 4.11929 11.8807 3 10.5 3C9.11929 3 8 4.11929 8 5.5V11H7.5V6.5C7.5 5.11929 6.38071 4 5 4C3.61929 4 2.5 5.11929 2.5 6.5V15C2.5 19.4183 6.08172 23 10.5 23H13.5C17.9183 23 21.5 19.4183 21.5 15V12.5C21.5 10.8431 20.1569 9.5 18.5 9.5Z" /></svg>;
      break;
    case 'arrow':
      content = <svg width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="black" strokeWidth="1" xmlns="http://www.w3.org/2000/svg"><path d="M3 3L10.07 19.97L13.58 13.58L19.97 10.07L3 3Z" /></svg>;
      break;
    case 'emoji-rocket': content = <span className="text-3xl filter drop-shadow-md">🚀</span>; break;
    case 'emoji-sparkle': content = <span className="text-3xl filter drop-shadow-md">✨</span>; break;
    case 'emoji-target': content = <span className="text-3xl filter drop-shadow-md">🎯</span>; break;
    default: return null;
  }

  // We add pointer-events-none so it doesn't block clicks
  return (
    <div 
      className="fixed z-[100] pointer-events-none select-none transition-transform duration-75"
      style={{ 
        left: position.x, 
        top: position.y,
        transform: 'translate(-50%, -50%)', // Center on cursor
        display: position.x === -100 ? 'none' : 'block'
      }}
    >
      {content}
    </div>
  );
};
