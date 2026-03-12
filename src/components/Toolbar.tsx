import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Key, MoveUpRight, Square, Circle, Eraser, RefreshCw, Send, Music } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { DigitalTimer } from './DigitalTimer';

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
  audioUrl: string;
  setAudioUrl: (url: string) => void;
  figmaToken: string;
  setFigmaToken: (token: string) => void;
  artboardsError: string | null;
  activeTool: 'none' | 'arrow' | 'rectangle' | 'circle';
  setActiveTool: (tool: 'none' | 'arrow' | 'rectangle' | 'circle') => void;
  onClearShapes: () => void;
  onRestart: () => void;
  isTimerRunning: boolean;
  setIsTimerRunning: (val: boolean) => void;
  elapsedSeconds: number;
  setElapsedSeconds: (val: number) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  figmaUrl, setFigmaUrl,
  laserColor, setLaserColor,
  musicPlaying, setMusicPlaying,
  audioUrl, setAudioUrl,
  figmaToken, setFigmaToken,
  artboardsError,
  activeTool, setActiveTool,
  onClearShapes,
  onRestart,
  isTimerRunning, setIsTimerRunning,
  elapsedSeconds, setElapsedSeconds
}) => {
  const [isTokenEditing, setIsTokenEditing] = useState(false);
  const [tempToken, setTempToken] = useState(figmaToken);
  const [showMusicInput, setShowMusicInput] = useState(false);
  
  const musicPopupRef = useRef<HTMLDivElement>(null);

  // Auto-save figma URL when it changes
  const handleUrlSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = new FormData(e.currentTarget).get('figmaurl') as string;
    if (input !== null) {
      setFigmaUrl(input);
    }
  };

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

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center group w-full max-w-7xl px-4 pb-0 h-28 justify-end">
      
      {/* Invisible hover catch area that extends above the hidden toolbar */}
      <div className="absolute inset-x-0 bottom-0 h-32 -z-10" />

      {/* API Token Input Overlay */}
      {isTokenEditing && (
        <form onSubmit={(e) => { e.preventDefault(); setFigmaToken(tempToken); setIsTokenEditing(false); }} className="bg-[#1e1e24] border border-white/10 rounded-2xl p-4 shadow-2xl flex flex-col gap-3 min-w-[300px]">
          <h3 className="text-white font-medium">Figma Access Token</h3>
          <p className="text-zinc-400 text-xs">Required to fetch artboard thumbnails and names.</p>
          <input 
            type="password"
            autoFocus
            placeholder="figd_..."
            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 transition-colors"
            value={tempToken}
            onChange={(e) => setTempToken(e.target.value)}
          />
          {artboardsError && <p className="text-red-400 text-xs max-w-full truncate">{artboardsError}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsTokenEditing(false)} className="px-4 py-2 rounded-lg text-zinc-400 hover:text-white transition-colors">
              Close
            </button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors">
              Save
            </button>
          </div>
        </form>
      )}

      {/* Main Toolbar - Auto-hides physically down into the screen edge, leaving just top edge peeking */}
      <div className="bg-[#1e1e24]/60 backdrop-blur-3xl border border-[#2e2e36]/50 rounded-t-2xl px-6 py-3.5 shadow-2xl flex items-center gap-6 translate-y-[calc(100%-8px)] hover:translate-y-0 group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] will-change-transform max-w-max">
        
        {/* Figma URL Section */}
        <div className="flex flex-col gap-1.5 pr-6 border-r border-white/10 relative">
          <span className="text-[10px] font-medium text-zinc-500">Figma prototype link</span>
          <div className="flex items-center gap-3">
            <form onSubmit={handleUrlSubmit} className="flex relative items-center w-64 max-w-[280px]">
              <input 
                name="figmaurl"
                type="url"
                defaultValue={figmaUrl}
                onBlur={(e) => setFigmaUrl(e.target.value)}
                placeholder="https://www.figma.com/proto/..."
                className="w-full bg-[#121218] border border-white/10 rounded-md pl-3 pr-8 py-1.5 text-xs text-zinc-300 outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-600"
              />
              <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1" title="Load Link">
                <Send size={12} strokeWidth={2.5} />
              </button>
            </form>
            
            <button 
              onClick={onRestart}
              className="w-6 h-6 rounded bg-[#25252f] flex items-center justify-center text-[#868690] hover:bg-[#2e2e3a] hover:text-white transition-all"
              title="Restart Prototype (R)"
            >
              <RefreshCw size={12} strokeWidth={2.5} />
            </button>

            <button 
              onClick={() => setIsTokenEditing(!isTokenEditing)}
              className={cn(
                 "w-6 h-6 rounded flex items-center justify-center transition-all",
                 isTokenEditing || figmaToken ? "bg-[#2b3b5c] text-[#7198e3]" : "bg-[#25252f] text-[#868690] hover:bg-[#2e2e3a] hover:text-white"
              )}
              title="Setup API Token"
            >
              <Key size={12} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Tools Section */}
        <div className="flex items-center gap-2 pr-6 border-r border-white/10">
          
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-medium text-zinc-500">Shapes (A, S, C, E)</span>
            <div className="flex items-center gap-2">
              {[
                { id: 'arrow', icon: MoveUpRight, title: 'Arrow Annotation' },
                { id: 'rectangle', icon: Square, title: 'Rectangle Annotation' },
                { id: 'circle', icon: Circle, title: 'Circle Annotation' },
              ].map((tool) => {
                const isSelected = activeTool === tool.id;
                const Icon = tool.icon;
                return (
                  <button
                    key={tool.id}
                    title={tool.title}
                    onClick={() => setActiveTool(isSelected ? 'none' : tool.id as any)}
                    className={cn(
                      "w-6 h-6 rounded flex items-center justify-center transition-all",
                      isSelected ? "bg-[#2b3b5c] text-[#7198e3]" : "bg-[#25252f] text-[#868690] hover:bg-[#2e2e3a] hover:text-white"
                    )}
                  >
                    <Icon size={12} strokeWidth={2.5} />
                  </button>
                );
              })}
              
              <button
                title="Clear Annotations (Erase)"
                onClick={onClearShapes}
                className="w-6 h-6 rounded bg-[#25252f] flex items-center justify-center text-[#868690] hover:text-red-400 hover:bg-[#2e2e3a] transition-all ml-1"
              >
                <Eraser size={12} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>

        {/* Laser Color Section */}
        <div className="flex items-center gap-4 pr-6 border-r border-white/10">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-medium text-zinc-500">Laser (Hold Shift/Cmnd)</span>
            <div className="flex items-center gap-3">
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => setLaserColor(color)}
                  className={cn(
                    "w-6 h-6 rounded-full transition-all border-2",
                    laserColor === color ? "border-white scale-110" : "border-transparent",
                    color === 'red' && "bg-[#ff4040]",
                    color === 'green' && "bg-[#10b981]",
                    color === 'blue' && "bg-[#3b82f6]",
                    color === 'yellow' && "bg-[#cca01d]",
                    color === 'fuchsia' && "bg-[#9a349c]"
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Music Section */}
        <div className="flex items-center gap-3 pr-6 border-r border-white/10">
          <div className="flex flex-col gap-1.5 relative">
            <span className="text-[10px] font-medium text-zinc-500">Music (M)</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMusicPlaying(!musicPlaying)}
                className={cn(
                  "w-6 h-6 rounded flex items-center justify-center transition-all",
                  musicPlaying ? "bg-[#2b3b5c] text-[#7198e3]" : "bg-[#25252f] text-[#868690] hover:bg-[#2e2e3a] hover:text-white"
                )}
                disabled={!audioUrl}
              >
                {musicPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" className="ml-0.5" />}
              </button>
              
              <button 
                id="music-toggle-btn"
                onClick={() => setShowMusicInput(!showMusicInput)}
                className={cn(
                  "w-6 h-6 rounded flex items-center justify-center transition-colors",
                  showMusicInput ? "bg-[#2b3b5c] text-[#7198e3]" : "bg-[#25252f] text-[#868690] hover:bg-[#2e2e3a] hover:text-white"
                )}
                title="Select Audio"
              >
                <Music size={12} strokeWidth={2.5} />
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

        {/* Timer Section */}
        <div className="flex flex-col gap-1.5 min-w-fit">
          <span className="text-[10px] font-medium text-zinc-500">Timer (T)</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className={cn(
                "w-6 h-6 rounded flex items-center justify-center transition-all",
                isTimerRunning ? "bg-[#2b3b5c] text-[#7198e3]" : "bg-[#25252f] text-[#868690] hover:bg-[#2e2e3a] hover:text-white"
              )}
              title={isTimerRunning ? "Pause Timer" : "Start Timer"}
            >
              {isTimerRunning ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" className="ml-0.5" />}
            </button>
            
            <DigitalTimer seconds={elapsedSeconds} />

            <button
              onClick={() => {
                setElapsedSeconds(0);
                setIsTimerRunning(false);
              }}
              className="w-6 h-6 rounded bg-[#25252f] text-[#868690] hover:bg-[#2e2e3a] hover:text-white flex items-center justify-center transition-all"
              title="Reset Timer"
            >
              <RotateCcw size={12} strokeWidth={2.5} />
            </button>
          </div>
        </div>

      </div>

      {/* Hints (Hidden mostly since we rely on the clean edge peek layout) */}
      <div className="sr-only">
        Shift to Laser, C to Clear, R to Restart
      </div>

    </div>
  );
};
