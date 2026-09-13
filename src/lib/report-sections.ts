/**
 * Urutan section laporan praktikum dan penomorannya.
 *
 * Nomor romawi dihitung hanya dari section yang benar-benar berisi: laporan
 * tanpa "Tujuan" dimulai dengan "I. Dasar Teori". Sebelumnya nomor ditulis
 * mati per section (Tujuan selalu I, Dasar Teori selalu II, dst), sehingga
 * daftar isi dan judul section melompat dari I ke III saat ada yang kosong.
 *
 * Satu sumber ini dipakai daftar isi, judul section di halaman detail, dan tab
 * editor admin — ketiganya dijamin memberi nomor yang sama.
 */

export const REPORT_SECTIONS = [
  { key: 'tujuan', anchor: 'tujuan', title: 'Tujuan Praktikum', tab: 'TUJUAN' },
  { key: 'dasar_teori', anchor: 'dasar-teori', title: 'Dasar Teori', tab: 'DASAR TEORI' },
  { key: 'alat_bahan', anchor: 'alat-bahan', title: 'Alat dan Bahan', tab: 'ALAT & BAHAN' },
  { key: 'langkah_kerja', anchor: 'langkah-kerja', title: 'Langkah Kerja Praktikum', tab: 'LANGKAH KERJA' },
  { key: 'latihan_tugas', anchor: 'latihan-tugas', title: 'Latihan dan Tugas', tab: 'LATIHAN & TUGAS' },
  { key: 'kesimpulan', anchor: 'kesimpulan', title: 'Kesimpulan', tab: 'KESIMPULAN' },
] as const;

export type ReportSectionKey = (typeof REPORT_SECTIONS)[number]['key'];

export interface NumberedSection {
  key: ReportSectionKey;
  anchor: string;
  title: string;
  tab: string;
  numeral: string;
}

export function toRoman(n: number): string {
  const table: [number, string][] = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
    [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];
  let rest = n;
  let out = '';
  for (const [value, symbol] of table) {
    while (rest >= value) {
      out += symbol;
      rest -= value;
    }
  }
  return out;
}

/** Section yang berisi, sesuai urutan baku, masing-masing dengan nomor romawinya. */
export function numberSections(present: Partial<Record<ReportSectionKey, boolean>>): NumberedSection[] {
  return REPORT_SECTIONS.filter((section) => present[section.key]).map((section, index) => ({
    ...section,
    numeral: toRoman(index + 1),
  }));
}
