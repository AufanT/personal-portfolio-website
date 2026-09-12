/**
 * Konversi timestamp untuk script migrasi data.
 */

const ISO_WITH_OFFSET =
  /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?(Z|[+-]\d{2}:?\d{2})?$/;

/**
 * ISO 8601 -> "YYYY-MM-DD HH:MM:SS.ffffff" UTC untuk kolom DATETIME(6).
 *
 * Tidak lewat `new Date()` pada jalur utamanya: objek Date JavaScript hanya
 * menyimpan milidetik, sehingga timestamp asli Supabase seperti
 * "2026-05-12T17:28:51.026027+00:00" akan terpotong menjadi ".026000".
 * Data laporan praktikum ini hasil recovery dan tidak tergantikan, jadi nilai
 * mikrodetiknya dipertahankan apa adanya.
 *
 * Offset non-UTC ditangani dengan menggeser lewat Date (mikrodetik di luar
 * milidetik ikut hilang di kasus itu) — tidak dipakai oleh data yang ada,
 * semuanya +00:00, tapi tetap benar kalau suatu saat ada.
 */
export function toMysqlDateTime(value) {
  if (value instanceof Date) {
    return value.toISOString().replace('T', ' ').replace('Z', '') + '000';
  }

  const match = ISO_WITH_OFFSET.exec(String(value).trim());

  if (match) {
    const [, y, mo, d, h, mi, s, frac = '', offset = 'Z'] = match;

    if (offset === 'Z' || offset === '+00:00' || offset === '+0000') {
      const micro = frac.padEnd(6, '0').slice(0, 6);
      return `${y}-${mo}-${d} ${h}:${mi}:${s}.${micro}`;
    }
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Tanggal tidak valid: ${String(value)}`);
  }
  return date.toISOString().replace('T', ' ').replace('Z', '') + '000';
}
