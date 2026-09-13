'use client';

import { useEffect, useState } from 'react';

/**
 * Jalur komunikasi dengan <AudioPlayer> (dipasang sekali di Shell).
 *
 * Komponen mana pun bisa memutar/menjeda musik lewat toggleMusic(), dan
 * membaca status sebenarnya lewat useMusicPlaying(). Sebelumnya setiap grid
 * menyimpan status play-nya sendiri, sehingga label "Click to play/pause"
 * tidak sinkron dengan musik yang benar-benar berbunyi — misalnya saat musik
 * dipulihkan dari kunjungan sebelumnya atau diputar lewat grid lain.
 */

/** Nama event dipertahankan dari versi lama agar pendengar yang sudah ada tetap jalan. */
export const MUSIC_TOGGLE_EVENT = 'music:hero-play';
export const MUSIC_STATE_EVENT = 'music:state';
export const MUSIC_STATE_REQUEST_EVENT = 'music:state-request';

export function toggleMusic() {
  window.dispatchEvent(new CustomEvent(MUSIC_TOGGLE_EVENT));
}

/** Dipanggil AudioPlayer setiap status play berubah. */
export function announceMusicState(playing: boolean) {
  window.dispatchEvent(new CustomEvent(MUSIC_STATE_EVENT, { detail: { playing } }));
}

export function useMusicPlaying(): boolean {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const onState = (e: Event) => setPlaying(Boolean((e as CustomEvent<{ playing: boolean }>).detail?.playing));
    window.addEventListener(MUSIC_STATE_EVENT, onState);
    // Komponen yang baru dipasang belum pernah menerima pengumuman; minta
    // AudioPlayer mengirim ulang status saat ini.
    window.dispatchEvent(new CustomEvent(MUSIC_STATE_REQUEST_EVENT));
    return () => window.removeEventListener(MUSIC_STATE_EVENT, onState);
  }, []);

  return playing;
}
