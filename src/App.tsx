import { useState, useRef, useEffect } from 'react';
import { FigmaIframe } from './components/FigmaIframe';
import { LaserCanvas, type LaserCanvasRef } from './components/LaserCanvas';
import { AudioPlayer } from './components/AudioPlayer';
import { ArtboardSidebar } from './components/ArtboardSidebar';
import { AnnotationCanvas } from './components/AnnotationCanvas';
import { Toolbar } from './components/Toolbar';
import { useHotkeys } from './hooks/useHotkeys';
import { useFigmaApi } from './hooks/useFigmaApi';

function App() {
  const [figmaUrl, setFigmaUrl] = useState('');
  const [viewMode, setViewMode] = useState<'contain' | 'min-zoom'>('contain');
  const [laserColor, setLaserColor] = useState<'red' | 'green' | 'blue' | 'yellow' | 'fuchsia'>('red');
  const [activeTool, setActiveTool] = useState<'none' | 'arrow' | 'rectangle' | 'circle'>('none');
  const [isLaserActive, setIsLaserActive] = useState(false);
  const [shapes, setShapes] = useState<any[]>([]);
  
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');

  const [figmaToken, setFigmaToken] = useState<string>(() => localStorage.getItem('figmaToken') || '');
  const [activeArtboardId, setActiveArtboardId] = useState<string | null>(null);
  const [restartKey, setRestartKey] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const { artboards, error: artboardsError } = useFigmaApi(figmaUrl, figmaToken);

  useEffect(() => {
    let interval: number;
    if (isTimerRunning) {
      interval = window.setInterval(() => setElapsedSeconds(prev => prev + 1), 1000);
    }
    return () => window.clearInterval(interval);
  }, [isTimerRunning]);
  
  const laserCanvasRef = useRef<LaserCanvasRef>(null);

  useEffect(() => {
    localStorage.setItem('figmaToken', figmaToken);
  }, [figmaToken]);

  useHotkeys({
    onFillScreen: () => setViewMode('contain'),
    onActualSize: () => setViewMode('min-zoom'),
    onToggleMusic: () => setMusicPlaying(prev => !prev),
    onClearCanvas: () => {
      laserCanvasRef.current?.clearCanvas();
      setShapes([]);
    },
    onEscape: () => setActiveTool('none'),
    onToggleLaser: (active) => setIsLaserActive(active),
    onRestart: () => {
      setActiveArtboardId(null);
      setRestartKey(prev => prev + 1);
    },
    onSelectShape: (shape) => setActiveTool(shape === 'erase' ? 'none' : shape),
    onToggleTimer: () => setIsTimerRunning(prev => !prev)
  });

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-white">
      <FigmaIframe key={restartKey} figmaUrl={figmaUrl} viewMode={viewMode} activeArtboardId={activeArtboardId} />
      <LaserCanvas ref={laserCanvasRef} isLaserActive={isLaserActive && activeTool === 'none'} laserColor={laserColor} />
      <AnnotationCanvas activeTool={activeTool} shapes={shapes} setShapes={setShapes} />
      <ArtboardSidebar 
        artboards={artboards} 
        activeArtboardId={activeArtboardId} 
        onSelectArtboard={setActiveArtboardId} 
      />
      <Toolbar 
        figmaUrl={figmaUrl} setFigmaUrl={setFigmaUrl}
        laserColor={laserColor} setLaserColor={setLaserColor}
        activeTool={activeTool} setActiveTool={setActiveTool}
        onClearShapes={() => setShapes([])}
        onRestart={() => {
          setActiveArtboardId(null);
          setRestartKey(prev => prev + 1);
        }}
        musicPlaying={musicPlaying} setMusicPlaying={setMusicPlaying}
        audioUrl={audioUrl} setAudioUrl={setAudioUrl}
        figmaToken={figmaToken} setFigmaToken={setFigmaToken}
        artboardsError={artboardsError}
        isTimerRunning={isTimerRunning} setIsTimerRunning={setIsTimerRunning}
        elapsedSeconds={elapsedSeconds} setElapsedSeconds={setElapsedSeconds}
      />
      <AudioPlayer isPlaying={musicPlaying} volume={0.5} audioUrl={audioUrl} />
    </div>
  );
}

export default App;
