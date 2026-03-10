import React, { useEffect, useRef } from 'react';

interface AudioPlayerProps {
  isPlaying: boolean;
  volume: number;
  audioUrl?: string;
  onEnded?: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ isPlaying, volume, audioUrl, onEnded }) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.warn("Audio playback failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, audioUrl]);

  if (!audioUrl) return null;

  return (
    <audio 
      ref={audioRef} 
      src={audioUrl} 
      onEnded={onEnded}
      loop
      className="hidden" 
    />
  );
};
