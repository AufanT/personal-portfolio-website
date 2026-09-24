'use client';

import { Maximize2 } from 'lucide-react';
import AppImage from '@/components/AppImage';

/**
 * Gambar di dalam laporan praktikum.
 *
 * Tampil dengan ukuran aslinya: hanya dibatasi `max-width: 100%`, jadi
 * screenshot kecil tetap kecil dan screenshot besar diperkecil proporsional —
 * tidak pernah dipotong atau diregangkan.
 *
 * `width`/`height` berasal dari Cloudinary saat upload. Kalau ada, skeleton
 * langsung seukuran gambar sehingga tidak ada lompatan layout; gambar lama
 * yang belum punya dimensi memakai tinggi perkiraan (lihat
 * scripts/backfill-image-sizes.mjs untuk mengisinya).
 *
 * Client Component karena skeleton butuh event "selesai dimuat" dari browser.
 * Atribut data-lightbox-src tetap dipertahankan: preview layar penuh
 * (ImageLightbox) menemukan gambar lewat atribut itu.
 */
export default function ReportImage({
  src,
  alt,
  width,
  height,
}: {
  src: string | null | undefined;
  alt: string;
  width?: number | null;
  height?: number | null;
}) {
  if (!src || !src.trim()) return null;

  return (
    <button
      type="button"
      className="report-image group"
      data-lightbox-src={src}
      data-lightbox-alt={alt}
      aria-label={`Perbesar gambar: ${alt}`}
    >
      <AppImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="report-image-img"
      />
      <span className="report-image-hint" aria-hidden="true">
        <Maximize2 className="w-3.5 h-3.5" />
      </span>
    </button>
  );
}
