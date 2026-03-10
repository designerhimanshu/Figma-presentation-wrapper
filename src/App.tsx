import { useState, useRef } from 'react';
import { FigmaIframe } from './components/FigmaIframe';
import { LaserCanvas, type LaserCanvasRef } from './components/LaserCanvas';
import { Toolbar } from './components/Toolbar';
import { AudioPlayer } from './components/AudioPlayer';
import { useHotkeys } from './hooks/useHotkeys';

function App() {
  const [figmaUrl, setFigmaUrl] = useState('');
  const [viewMode, setViewMode] = useState<'contain' | 'min-zoom'>('contain');
  const [laserColor, setLaserColor] = useState<'red' | 'green' | 'blue' | 'yellow' | 'fuchsia'>('red');
  const [isLaserActive, setIsLaserActive] = useState(false);
  
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [audioUrl, setAudioUrl] = useState('');

  const laserCanvasRef = useRef<LaserCanvasRef>(null);

  useHotkeys({
    onFillScreen: () => setViewMode('contain'),
    onActualSize: () => setViewMode('min-zoom'),
    onToggleMusic: () => setMusicPlaying(prev => !prev),
    onClearCanvas: () => laserCanvasRef.current?.clearCanvas(),
    onToggleLaser: (active) => setIsLaserActive(active),
  });

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-white">
      <FigmaIframe figmaUrl={figmaUrl} viewMode={viewMode} />
      <LaserCanvas ref={laserCanvasRef} isLaserActive={isLaserActive} laserColor={laserColor} />
      <Toolbar 
        figmaUrl={figmaUrl} setFigmaUrl={setFigmaUrl}
        laserColor={laserColor} setLaserColor={setLaserColor}
        musicPlaying={musicPlaying} setMusicPlaying={setMusicPlaying}
        musicVolume={musicVolume} setMusicVolume={setMusicVolume}
        audioUrl={audioUrl} setAudioUrl={setAudioUrl}
      />
      <AudioPlayer isPlaying={musicPlaying} volume={musicVolume} audioUrl={audioUrl} />
    </div>
  );
}

export default App;
