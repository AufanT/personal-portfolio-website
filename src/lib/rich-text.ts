/**
 * Helper teks kaya (rich text) yang aman dipakai di server maupun browser.
 *
 * Field teks laporan (dasar teori, kesimpulan, blok teks) sekarang disimpan
 * sebagai HTML dari editor Tiptap. Laporan lama tersimpan sebagai teks biasa
 * dengan baris baru, dan TIDAK dimigrasi — keduanya ditangani di sini:
 * teks biasa diubah menjadi HTML saat dibuka di editor atau ditampilkan.
 */

const HTML_BLOCK_START = /^\s*<(p|h[1-6]|ul|ol|blockquote|pre|div)[\s>]/i;

/** True kalau string berasal dari editor rich text, bukan teks biasa lama. */
export function isRichHtml(value: string | null | undefined): boolean {
  return !!value && HTML_BLOCK_START.test(value);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Teks biasa → HTML paragraf. Baris kosong memisahkan paragraf, baris baru
 * tunggal menjadi <br>. Tidak ada karakter newline di antara tag, supaya
 * tampilan tetap benar di dalam kontainer `white-space: pre-wrap`.
 */
export function plainTextToHtml(text: string): string {
  const normalised = text.replace(/\r\n?/g, '\n').trim();
  if (!normalised) return '';
  return normalised
    .split(/\n{2,}/)
    .map((para) => `<p>${escapeHtml(para).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

/** Nilai field apa pun (HTML baru atau teks lama) → HTML untuk editor/tampilan. */
export function toRichHtml(value: string | null | undefined): string {
  if (!value) return '';
  return isRichHtml(value) ? value : plainTextToHtml(value);
}

/**
 * True kalau field tidak berisi teks yang terlihat. Editor kosong menghasilkan
 * "<p></p>", yang bukan string kosong — tanpa pengecekan ini section kosong
 * akan tetap tampil dan ikut mendapat nomor di daftar isi.
 */
export function isRichTextEmpty(value: string | null | undefined): boolean {
  if (!value) return true;
  if (!isRichHtml(value)) return value.trim().length === 0;
  const text = value
    .replace(/<br\s*\/?>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;|&#160;/g, ' ');
  return text.trim().length === 0;
}

/**
 * Buang paragraf kosong di akhir. Extension TrailingNode (bawaan StarterKit v3)
 * selalu menambahkan <p></p> setelah daftar/kutipan/judul terakhir supaya
 * kursor bisa keluar dari blok itu. Berguna saat mengetik, tapi kalau ikut
 * tersimpan, setiap section di halaman publik mendapat baris kosong ekstra.
 */
export function trimTrailingEmptyParagraphs(html: string): string {
  return html.replace(/(?:<p>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>)+\s*$/i, '');
}

/** Normalisasi sebelum disimpan: editor kosong disimpan sebagai string kosong. */
export function normaliseRichText(value: string | null | undefined): string {
  if (isRichTextEmpty(value)) return '';
  const trimmed = (value ?? '').trim();
  return isRichHtml(trimmed) ? trimTrailingEmptyParagraphs(trimmed) : trimmed;
}
