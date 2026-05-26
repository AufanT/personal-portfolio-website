'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipForward, Music } from 'lucide-react';

export default function MusicPlayer() {
  const [mounted, setMounted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.2);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playlist = [
    '/music/song1.mp3',
    '/music/song2.mp3',
    '/music/song3.mp3'
  ];

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
    
    // Load from localStorage
    const savedTrack = localStorage.getItem('currentSongIdx');
    const savedVol = localStorage.getItem('musicVol');
    const savedPlay = localStorage.getItem('musicPlaying') === 'true';

    if (savedTrack) {
      setCurrentTrack(parseInt(savedTrack, 10) % playlist.length);
    }
    if (savedVol) {
      const vol = parseFloat(savedVol);
      setVolume(vol);
      if (vol === 0) setIsMuted(true);
    }
    setIsPlaying(savedPlay);
  }, []);

  // Update audio source and playback state
  useEffect(() => {
    if (!mounted || !audioRef.current) return;
    
    audioRef.current.src = playlist[currentTrack];
    audioRef.current.load();
    
    if (isPlaying) {
      audioRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [currentTrack, mounted]);

  // Handle play/pause toggle
  useEffect(() => {
    if (!mounted || !audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
      localStorage.setItem('musicPlaying', 'true');
    } else {
      audioRef.current.pause();
      localStorage.setItem('musicPlaying', 'false');
    }
  }, [isPlaying, mounted]);

  // Handle volume changes
  useEffect(() => {
    if (!mounted || !audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
    localStorage.setItem('musicVol', volume.toString());
  }, [volume, isMuted, mounted]);

  // Listen for hero-background click to play music at high volume
  useEffect(() => {
    const handler = () => {
      setIsPlaying(true);
      setVolume(0.85);
      setIsMuted(false);
    };
    window.addEventListener('music:hero-play', handler);
    return () => window.removeEventListener('music:hero-play', handler);
  }, []);

  // Handle song ended
  const handleEnded = () => {
    const nextTrack = (currentTrack + 1) % playlist.length;
    setCurrentTrack(nextTrack);
    localStorage.setItem('currentSongIdx', nextTrack.toString());
  };

  const handleNext = () => {
    const nextTrack = (currentTrack + 1) % playlist.length;
    setCurrentTrack(nextTrack);
    localStorage.setItem('currentSongIdx', nextTrack.toString());
    setIsPlaying(true);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  if (!mounted) return null;

  return (
    <div role="region" aria-label="Music player" className="fixed bottom-6 right-6 z-50 flex items-center gap-4 bg-surface-container/80 backdrop-blur-xl border border-primary-container/20 rounded-lg p-3 shadow-[0_0_20px_rgba(57,255,20,0.1)] transition-all duration-300 hover:border-primary-container/40 hover:shadow-[0_0_25px_rgba(57,255,20,0.2)]">
      <audio
        ref={audioRef}
        onEnded={handleEnded}
      />
      
      {/* Audio Visualizer Waves */}
      <div className="flex items-end gap-[2px] w-6 h-5">
        {isPlaying ? (
          <>
            <div className="w-[3px] bg-primary-container rounded-full animate-wave-1"></div>
            <div className="w-[3px] bg-primary-container rounded-full animate-wave-2"></div>
            <div className="w-[3px] bg-primary-container rounded-full animate-wave-3"></div>
            <div className="w-[3px] bg-primary-container rounded-full animate-wave-4"></div>
          </>
        ) : (
          <>
            <div className="w-[3px] h-[4px] bg-outline rounded-full"></div>
            <div className="w-[3px] h-[4px] bg-outline rounded-full"></div>
            <div className="w-[3px] h-[4px] bg-outline rounded-full"></div>
            <div className="w-[3px] h-[4px] bg-outline rounded-full"></div>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Play/Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? 'Pause music' : 'Play music'}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-primary-container text-background hover:scale-105 active:scale-95 transition-transform"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-[2px]" />}
          </button>

        {/* Skip Track */}
        <button
            onClick={handleNext}
            aria-label="Next track"
            className="text-on-surface-variant hover:text-primary-container transition-colors"
            title="Next Track"
          >
          <SkipForward className="w-4 h-4" />
        </button>

        {/* Volume controls */}
        <div className="flex items-center gap-2 group/volume relative">
          <button
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            className="text-on-surface-variant hover:text-primary-container transition-colors"
          >
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setVolume(val);
              if (val > 0) setIsMuted(false);
            }}
            className="w-16 h-1 bg-surface border border-outline-variant/30 rounded-lg appearance-none cursor-pointer accent-primary-container focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
