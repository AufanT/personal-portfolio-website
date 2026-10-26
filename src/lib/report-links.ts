/**
 * Tautan tambahan laporan praktikum (APK, video demo, Google Drive, dll),
 * di luar link repo GitHub yang punya kolom sendiri (`blogs.github_url`).
 *
 * Disimpan di `content.links` — kolom LONGTEXT yang sudah ada — sehingga fitur
 * ini tidak butuh migrasi database. Konsekuensinya, isinya tidak divalidasi
 * oleh skema; karena itu setiap tautan disaring ulang di sini sebelum dirender.
 * Hanya URL http/https yang lolos, supaya href seperti `javascript:` tidak
 * pernah sampai ke halaman publik.
 *
 * File ini dipakai editor admin (browser) dan halaman detail (server), jadi
 * tidak boleh mengimport modul khusus server.
 */

export interface ReportLink {
  label: string;
  url: string;
}

export const MAX_REPORT_LINKS = 10;
export const MAX_LINK_LABEL = 80;
export const MAX_LINK_URL = 500;

export function isSafeHttpUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

/** Data mentah dari database/editor → daftar tautan yang aman ditampilkan. */
export function normaliseReportLinks(raw: unknown): ReportLink[] {
  if (!Array.isArray(raw)) return [];

  const links: ReportLink[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const record = item as Record<string, unknown>;

    const url = typeof record.url === 'string' ? record.url.trim() : '';
    if (!url || url.length > MAX_LINK_URL || !isSafeHttpUrl(url)) continue;

    const label = typeof record.label === 'string' ? record.label.trim() : '';
    links.push({
      // Label kosong diganti nama domain supaya tombol tidak tampil tanpa teks.
      label: (label || new URL(url).hostname).slice(0, MAX_LINK_LABEL),
      url,
    });

    if (links.length >= MAX_REPORT_LINKS) break;
  }
  return links;
}

export type ReportLinkKind = 'github' | 'video' | 'download' | 'generic';

/** Jenis tautan dari URL-nya, dipakai untuk memilih ikon tombol. */
export function reportLinkKind(url: string): ReportLinkKind {
  try {
    const { hostname, pathname } = new URL(url);
    const host = hostname.replace(/^www\./, '');
    if (host === 'github.com' && !pathname.includes('/releases/download/')) return 'github';
    if (host === 'youtube.com' || host === 'youtu.be' || host === 'm.youtube.com') return 'video';
    if (/\.(apk|zip|rar|7z|pdf)$/i.test(pathname) || host === 'drive.google.com') return 'download';
  } catch {
    /* URL tidak valid sudah disaring normaliseReportLinks; jatuh ke generic */
  }
  return 'generic';
}
