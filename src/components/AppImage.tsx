'use client';

import Image from 'next/image';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * useLayoutEffect berjalan sebelum browser melukis, tapi tidak ada di server.
 * Pemeriksaan cache harus memakai varian ini: dengan useEffect biasa, gambar
 * yang sudah ada di cache tetap menampilkan skeleton selama satu frame
 * (terukur ~16 ms) setiap kali halaman dibuka ulang.
 */
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const FALLBACK_SRC = '/images/onprogress.png';

/** Tinggi sementara saat dimensi gambar belum diketahui (gambar laporan lama). */
const UNKNOWN_HEIGHT_PX = 220;

/**
 * Jeda sebelum skeleton muncul pada gambar yang dipasang setelah halaman hidup
 * (navigasi antar halaman). Gambar dari cache tetap butuh satu putaran
 * asinkron sebelum dianggap selesai, jadi tanpa jeda ini skeleton berkedip
 * satu frame setiap kali pindah halaman (terukur ~14 ms).
 */
const SKELETON_DELAY_MS = 80;

/**
 * Halaman pertama dirender di server: skeleton harus ikut ada di HTML-nya,
 * jadi mount pertama tidak boleh memakai jeda (dan menghindari beda markup
 * saat hidrasi). Mount berikutnya berasal dari navigasi di browser.
 */
let hasHydrated = false;

type Status = 'loading' | 'loaded' | 'error';

interface BaseProps {
  src: string | null | undefined;
  alt: string;
  /** Kelas untuk elemen gambarnya sendiri (object-cover, dll). */
  className?: string;
  /** Gambar pengganti kalau src gagal dimuat. */
  fallbackSrc?: string;
  priority?: boolean;
}

interface FillProps extends BaseProps {
  /** Mengisi penuh induk terdekat yang position-nya bukan static. */
  fill: true;
  sizes?: string;
}

interface NaturalProps extends BaseProps {
  fill?: false;
  /** Dimensi asli; kalau ada, skeleton langsung seukuran gambar dan tidak ada lompatan layout. */
  width?: number | null;
  height?: number | null;
  /** Kelas untuk pembungkus (tempat skeleton digambar). */
  wrapperClassName?: string;
}

type AppImageProps = FillProps | NaturalProps;

/**
 * Satu-satunya pintu masuk gambar di halaman publik.
 *
 * Selama gambar dimuat, kotak skeleton shimmer menempati ruangnya; kalau gagal
 * dimuat, gambar diganti fallback agar skeleton tidak berputar selamanya.
 *
 * Gambar yang sudah ada di cache browser tidak menampilkan skeleton sama
 * sekali: status `complete` diperiksa saat komponen dipasang, jadi membuka
 * ulang halaman tidak memunculkan kedipan abu-abu yang justru terasa lambat.
 */
export default function AppImage(props: AppImageProps) {
  const { src, alt, className = '', fallbackSrc = FALLBACK_SRC, priority } = props;
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);
  const [skeletonArmed, setSkeletonArmed] = useState(() => !hasHydrated);

  useEffect(() => {
    setCurrentSrc(src || fallbackSrc);
    setStatus('loading');
  }, [src, fallbackSrc]);

  // Gambar dari cache sering sudah selesai sebelum React sempat memasang
  // onLoad, sehingga skeleton tidak akan pernah menerima sinyal apa pun.
  useIsomorphicLayoutEffect(() => {
    const img = wrapperRef.current?.querySelector('img');
    if (!img) return;
    if (img.complete) setStatus(img.naturalWidth > 0 ? 'loaded' : 'error');
  }, [currentSrc]);

  useIsomorphicLayoutEffect(() => {
    hasHydrated = true;
  }, []);

  // Setelah jeda, gambar yang masih dimuat baru menampilkan skeleton.
  useEffect(() => {
    if (skeletonArmed || status !== 'loading') return;
    const timer = setTimeout(() => setSkeletonArmed(true), SKELETON_DELAY_MS);
    return () => clearTimeout(timer);
  }, [skeletonArmed, status]);

  const handleLoad = () => setStatus('loaded');

  const handleError = () => {
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      return;
    }
    // Fallback pun gagal: hentikan skeleton daripada berputar selamanya.
    setStatus('error');
  };

  const skeleton =
    status === 'loading' && skeletonArmed ? (
      <span
        aria-hidden="true"
        className="skeleton absolute inset-0 z-[1] pointer-events-none"
      />
    ) : null;

  if (props.fill) {
    return (
      // Pembungkus absolut ini sendiri menjadi acuan untuk <Image fill>,
      // sekaligus memberi tempat bagi skeleton dan titik baca status cache.
      <span ref={wrapperRef} className="absolute inset-0 block">
        <Image
          src={currentSrc}
          alt={alt}
          fill
          sizes={props.sizes}
          priority={priority}
          className={className}
          onLoad={handleLoad}
          onError={handleError}
        />
        {skeleton}
      </span>
    );
  }

  const { width, height, wrapperClassName = '' } = props;
  const hasSize = !!width && !!height;

  return (
    <span
      ref={wrapperRef}
      className={`relative block ${wrapperClassName}`}
      // Tanpa dimensi tersimpan, skeleton memakai tinggi perkiraan sampai
      // gambarnya tiba (lihat scripts/backfill-image-sizes.mjs).
      style={!hasSize && status === 'loading' ? { minHeight: UNKNOWN_HEIGHT_PX } : undefined}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={currentSrc}
        alt={alt}
        width={hasSize ? width : undefined}
        height={hasSize ? height : undefined}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={className}
        onLoad={handleLoad}
        onError={handleError}
      />
      {skeleton}
    </span>
  );
}
