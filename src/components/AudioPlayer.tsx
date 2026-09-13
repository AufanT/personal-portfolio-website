'use client';

import { useState, useEffect, useRef } from 'react';
import { announceMusicState, MUSIC_STATE_REQUEST_EVENT, MUSIC_TOGGLE_EVENT } from '@/lib/music';

const playlist = ['/music/song.mp3'];

export default function AudioPlayer() {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.2);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const savedTrack = localStorage.getItem('currentSongIdx');
    const savedVol = localStorage.getItem('musicVol');
    const savedPlay = localStorage.getItem('musicPlaying') === 'true';
    if (savedTrack) setCurrentTrack(parseInt(savedTrack, 10) % playlist.length);
    if (savedVol) {
      const vol = parseFloat(savedVol);
      setVolume(vol);
      if (vol === 0) setIsMuted(true);
    }
    setIsPlaying(savedPlay);
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.src = playlist[currentTrack];
    audioRef.current.load();
    if (isPlaying) audioRef.current.play().catch(() => setIsPlaying(false));
  }, [currentTrack]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
      localStorage.setItem('musicPlaying', 'true');
    } else {
      audioRef.current.pause();
      localStorage.setItem('musicPlaying', 'false');
    }
    announceMusicState(isPlaying);
  }, [isPlaying]);

  // Komponen yang baru dipasang (misalnya grid di panel berikutnya) meminta
  // status terkini agar label play/pause-nya langsung benar.
  useEffect(() => {
    const onRequest = () => announceMusicState(isPlaying);
    window.addEventListener(MUSIC_STATE_REQUEST_EVENT, onRequest);
    return () => window.removeEventListener(MUSIC_STATE_REQUEST_EVENT, onRequest);
  }, [isPlaying]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
    localStorage.setItem('musicVol', volume.toString());
  }, [volume, isMuted]);

  useEffect(() => {
    const handler = () => {
      setIsPlaying((prev) => {
        if (!prev) {
          setVolume(0.25);
          setIsMuted(false);
        }
        return !prev;
      });
    };
    window.addEventListener(MUSIC_TOGGLE_EVENT, handler);
    return () => window.removeEventListener(MUSIC_TOGGLE_EVENT, handler);
  }, []);

  const handleEnded = () => {
    const nextTrack = (currentTrack + 1) % playlist.length;
    if (nextTrack === currentTrack && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => setIsPlaying(false));
    } else {
      setCurrentTrack(nextTrack);
    }
    localStorage.setItem('currentSongIdx', nextTrack.toString());
  };

  return <audio ref={audioRef} onEnded={handleEnded} preload="metadata" />;
}
