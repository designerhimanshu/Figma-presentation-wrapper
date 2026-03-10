import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ToolbarProps {
  figmaUrl: string;
  setFigmaUrl: (url: string) => void;
  laserColor: 'red' | 'green' | 'blue' | 'yellow' | 'fuchsia';
  setLaserColor: (color: 'red' | 'green' | 'blue' | 'yellow' | 'fuchsia') => void;
  musicPlaying: boolean;
  setMusicPlaying: (playing: boolean) => void;
  musicVolume: number;
  setMusicVolume: (volume: number) => void;
  audioUrl: string;
  setAudioUrl: (url: string) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  figmaUrl, setFigmaUrl,
  laserColor, setLaserColor,
  musicPlaying, setMusicPlaying,
  musicVolume, setMusicVolume,
  audioUrl, setAudioUrl,
}) => {
  const [isUrlEditing, setIsUrlEditing] = useState(!figmaUrl);
  const [tempUrl, setTempUrl] = useState(figmaUrl);
  const [showMusicInput, setShowMusicInput] = useState(false);
  
  const musicPopupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If the popup is open, and the click target is NOT inside the popup container
      if (showMusicInput && musicPopupRef.current && !musicPopupRef.current.contains(event.target as Node)) {
        // We also need to make sure they didn't just click the toggle button itself (handled by its own onClick)
        const toggleButton = document.getElementById('music-toggle-btn');
        if (toggleButton && toggleButton.contains(event.target as Node)) {
          return;
        }
        setShowMusicInput(false);
      }
    };

    // Add event listener (use capture phase to ensure it hits before iframe can swallow it entirely if outside)
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [showMusicInput]);

  const colors: Array<'red' | 'green' | 'blue' | 'yellow' | 'fuchsia'> = ['red', 'green', 'blue', 'yellow', 'fuchsia'];

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFigmaUrl(tempUrl);
    setIsUrlEditing(false);
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-4">
      
      {/* Figma URL Input Overlay */}
      {isUrlEditing && (
        <form onSubmit={handleUrlSubmit} className="bg-[#1e1e24] border border-white/10 rounded-2xl p-4 shadow-2xl flex flex-col gap-3 min-w-[400px]">
          <h3 className="text-white font-medium">Figma Prototype Link</h3>
          <input 
            type="url"
            autoFocus
            placeholder="https://www.figma.com/proto/..."
            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 transition-colors"
            value={tempUrl}
            onChange={(e) => setTempUrl(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            {figmaUrl && (
              <button type="button" onClick={() => setIsUrlEditing(false)} className="px-4 py-2 rounded-lg text-zinc-400 hover:text-white transition-colors">
                Cancel
              </button>
            )}
            <button type="submit" className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors">
              Load Prototype
            </button>
          </div>
        </form>
      )}

      {/* Main Toolbar */}
      <div className="bg-[#1e1e24]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-2xl flex items-center gap-6 cursor-move group">
        
        {/* Figma URL Section */}
        <div className="flex items-center gap-2 pr-6 border-r border-white/10">
          <button 
            onClick={() => setIsUrlEditing(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors tooltip group/btn relative"
          >
            <div className="w-4 h-4 rounded-full bg-linear-to-tr from-purple-500 to-orange-500"></div>
            <span className="text-sm font-medium text-white max-w-[100px] truncate">
              {figmaUrl ? 'Prototype Loaded' : 'Add Link'}
            </span>
          </button>
        </div>

        {/* Laser Section */}
        <div className="flex items-center gap-4 pr-6 border-r border-white/10">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Laser (Hold Shift/Cmnd)</span>
            <div className="flex items-center gap-2 p-1.5">
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => setLaserColor(color)}
                  className={cn(
                    "w-6 h-6 rounded-full transition-all border-2",
                    laserColor === color ? "border-white scale-110" : "border-transparent opacity-50 hover:opacity-100",
                    color === 'red' && "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]",
                    color === 'green' && "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]",
                    color === 'blue' && "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]",
                    color === 'yellow' && "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]",
                    color === 'fuchsia' && "bg-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.5)]"
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Music Section */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1 relative">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Music (M)</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMusicPlaying(!musicPlaying)}
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                  musicPlaying ? "bg-blue-500 text-white" : "bg-black/30 hover:bg-white/10 text-zinc-400"
                )}
                disabled={!audioUrl}
              >
                {musicPlaying ? <Pause size={18} /> : <Play size={18} fill={audioUrl ? "currentColor" : "none"} />}
              </button>
              <input 
                type="range" 
                min="0" max="1" step="0.05"
                value={musicVolume}
                onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                className="w-20 accent-blue-500"
              />
              <button 
                id="music-toggle-btn"
                onClick={() => setShowMusicInput(!showMusicInput)}
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-sm border",
                  showMusicInput ? "bg-white/20 text-white border-white/20" : "bg-black/30 text-zinc-400 hover:bg-white/10 border-transparent"
                )}
                title="Select Audio"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
              </button>
            </div>

            {/* Music Selection Overlay */}
            {showMusicInput && (
              <div ref={musicPopupRef} className="absolute bottom-full mb-4 right-0 bg-[#1e1e24] border border-white/10 rounded-2xl p-4 shadow-2xl flex flex-col gap-2 min-w-[240px]">
                <div className="flex flex-col gap-1.5">
                  {[
                    { label: 'No music', url: '' },
                    { label: 'celestial', url: '/celestial.mp3' },
                    { label: 'mountain', url: '/mountain.mp3' },
                    { label: 'echoes', url: '/echoes.mp3' },
                  ].map((track) => (
                    <button
                      key={track.label}
                      onClick={() => {
                        setAudioUrl(track.url);
                        if (!track.url) setMusicPlaying(false);
                      }}
                      className={cn(
                        "text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between group",
                        audioUrl === track.url ? "bg-blue-500 text-white font-medium" : "text-zinc-300 hover:bg-white/10"
                      )}
                    >
                      <span>{track.label}</span>
                      {audioUrl === track.url && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />}
                    </button>
                  ))}

                  <div className="w-full h-px bg-white/10 my-1"></div>

                  {/* Custom Upload Toggle */}
                  <button
                    onClick={() => {
                      const isCustomActive = audioUrl.startsWith('blob:');
                      if (isCustomActive) {
                        return; // Already active
                      } else {
                        // Trigger file input
                        document.getElementById('audio-upload')?.click();
                      }
                    }}
                    className={cn(
                      "text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between group",
                      audioUrl.startsWith('blob:') ? "bg-blue-500 text-white font-medium" : "text-zinc-300 hover:bg-white/10"
                    )}
                  >
                    <span>{audioUrl.startsWith('blob:') ? 'Custom (Active)' : 'Custom'}</span>
                    {audioUrl.startsWith('blob:') && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />}
                  </button>

                  <input 
                    type="file" 
                    id="audio-upload" 
                    accept="audio/mp3,audio/mpeg" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const objectUrl = URL.createObjectURL(file);
                        setAudioUrl(objectUrl);
                        setMusicPlaying(true);
                        // Optional: Reset input so the same file can trigger change event again if needed
                        e.target.value = '';
                      }
                    }}
                  />
                  
                  {!audioUrl.startsWith('blob:') && (
                     <button 
                       onClick={() => document.getElementById('audio-upload')?.click()}
                       className="mt-2 w-full px-3 py-1.5 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-300 transition-colors text-xs flex justify-center items-center gap-2"
                     >
                       Upload .MP3
                     </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Hints */}
      <div className="text-zinc-500 text-[10px] tracking-widest uppercase flex gap-4 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        <span><b className="text-zinc-300">Shift</b> to Laser</span>
        <span><b className="text-zinc-300">F</b> Fill Screen</span>
        <span><b className="text-zinc-300">A</b> Actual Size</span>
        <span><b className="text-zinc-300">C</b> Clear</span>
      </div>

    </div>
  );
};
