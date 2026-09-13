import { Maximize2 } from 'lucide-react';

/**
 * Gambar di dalam laporan praktikum.
 *
 * Tampil dengan ukuran aslinya: tidak ada atribut width/height maupun
 * max-height, jadi screenshot kecil tetap kecil dan screenshot besar hanya
 * diperkecil proporsional kalau lebih lebar dari kolom konten — tidak pernah
 * dipotong atau diregangkan. Sebelumnya semua gambar dipaksa masuk kotak
 * 800×600 dengan tinggi maksimal 200–400 px, sehingga screenshot kode panjang
 * jadi terlalu kecil untuk dibaca.
 *
 * Klik membuka preview layar penuh. Komponen ini sengaja tanpa state (bisa
 * dirender di server); interaksinya ditangani <ImageLightbox> lewat atribut
 * data-lightbox-src, jadi puluhan gambar tidak masing-masing menjadi
 * Client Component.
 */
export default function ReportImage({ src, alt }: { src: string | null | undefined; alt: string }) {
  if (!src || !src.trim()) return null;

  return (
    <button
      type="button"
      className="report-image group"
      data-lightbox-src={src}
      data-lightbox-alt={alt}
      aria-label={`Perbesar gambar: ${alt}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" decoding="async" className="report-image-img" />
      <span className="report-image-hint" aria-hidden="true">
        <Maximize2 className="w-3.5 h-3.5" />
      </span>
    </button>
  );
}
