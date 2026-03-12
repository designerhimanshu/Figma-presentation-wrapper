import React from 'react';
import type { Artboard } from '../hooks/useFigmaApi';
import { cn } from './Toolbar';

interface ArtboardSidebarProps {
  artboards: Artboard[];
  activeArtboardId: string | null;
  onSelectArtboard: (id: string) => void;
}

export const ArtboardSidebar: React.FC<ArtboardSidebarProps> = ({ artboards, activeArtboardId, onSelectArtboard }) => {
  if (!artboards || artboards.length === 0) return null;

  // Find index of currently active artboard
  let activeIndex = artboards.findIndex(a => a.id === activeArtboardId);
  // If no artboard selected yet, assume the first one is active initially (or we just treat none as active until clicked)
  if (activeIndex === -1 && activeArtboardId === 'auto-first') {
      activeIndex = 0;
  }

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-3">
      {artboards.map((artboard, index) => {
        const isActive = activeArtboardId ? artboard.id === activeArtboardId : index === 0;
        const isPast = activeIndex !== -1 && index <= activeIndex;

        return (
          <button
            key={artboard.id}
            onClick={() => onSelectArtboard(artboard.id)}
            className="group relative flex items-center justify-center p-2 outline-none"
            aria-label={artboard.name}
          >
            {/* The Dot */}
            <div className={cn(
              "w-2.5 h-2.5 rounded-full transition-all duration-300 ease-in-out",
              "group-hover:scale-[1.8]",
              isActive ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)] scale-125" : 
              isPast ? "bg-white/80" : "bg-white/30"
            )} />
            
            {/* Tooltip Label */}
            <div className={cn(
              "absolute right-8 px-3 py-1.5 rounded-lg whitespace-nowrap text-sm font-medium",
              "opacity-0 -translate-x-2 pointer-events-none transition-all duration-200",
              "group-hover:opacity-100 group-hover:translate-x-0",
              "bg-[#1e1e24]/90 backdrop-blur-md border border-white/10 text-white shadow-xl"
            )}>
              {artboard.name}
            </div>
          </button>
        );
      })}
    </div>
  );
};
