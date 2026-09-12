/**
 * Helper konversi antara bentuk baris MySQL dan bentuk yang dipakai UI.
 *
 * Tujuannya supaya komponen yang dulu menerima data dari Supabase tidak perlu
 * diubah: Supabase memberi `is_published` sebagai boolean, `content` sebagai
 * objek hasil parse, dan `created_at` sebagai timestamp ISO ber-zona.
 * MySQL memberi 0/1, string JSON, dan `YYYY-MM-DD HH:MM:SS.ffffff` tanpa zona.
 */

/** TINYINT(1) → boolean. */
export function toBool(value: unknown): boolean {
  return value === 1 || value === true || value === '1';
}

/**
 * DATETIME(6) MySQL → ISO 8601 UTC.
 *
 * Nilai dari driver berbentuk "2026-06-04 04:05:43.344965" tanpa penanda zona.
 * Tanpa "Z" di akhir, `new Date(...)` akan menafsirkannya sebagai waktu lokal
 * dan tanggal yang tampil bisa bergeser satu hari. Semua nilai di database
 * disimpan UTC (lihat `timezone: 'Z'` di src/lib/db.ts).
 */
export function toIso(value: unknown): string {
  if (value == null) return '';
  if (value instanceof Date) return value.toISOString();

  const raw = String(value);
  if (raw.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(raw)) return raw;
  return raw.replace(' ', 'T') + 'Z';
}

/**
 * Kolom `content` → objek.
 *
 * Data lama dari Supabase kadang tersimpan sebagai string JSON dan kadang
 * sebagai JSON asli, jadi kode lama sudah harus menangani keduanya. Fungsi ini
 * meneruskan kebiasaan itu: kalau parse gagal, string mentahnya dikembalikan
 * apa adanya supaya artikel tetap bisa dibuka meski formatnya tidak terduga.
 */
export function parseJsonColumn(value: unknown): any {
  if (value == null) return null;
  if (typeof value === 'object') return value;

  try {
    return JSON.parse(String(value));
  } catch {
    return value;
  }
}
