#!/usr/bin/env node
/**
 * Mengisi dimensi (width/height) blok gambar pada laporan yang sudah ada.
 *
 *   node scripts/backfill-image-sizes.mjs --dry-run   # lihat dulu, tanpa menulis
 *   node scripts/backfill-image-sizes.mjs             # tulis ke database
 *
 * Gambar yang diunggah mulai sekarang sudah menyimpan dimensinya sendiri dari
 * Cloudinary. Script ini untuk gambar lama: dimensinya dibaca langsung dari
 * header berkas gambar (hanya ±64 KB pertama yang diunduh, bukan seluruh file),
 * lalu ditulis ke kolom `content`.
 *
 * Dimensi dipakai komponen ReportImage agar kotak skeleton persis seukuran
 * gambar, sehingga halaman tidak melompat saat gambar selesai dimuat.
 *
 * Butuh DB_* di .env.local; dari laptop berarti Remote MySQL di hPanel aktif.
 */

import mysql from 'mysql2/promise';
import { loadEnv, requireDbConfig } from './lib/env.mjs';
import { fetchImageSize } from './lib/image-size.mjs';

const dryRun = process.argv.includes('--dry-run');

/** Semua blok bertipe image di seluruh section laporan. */
function collectImageBlocks(content) {
  const blocks = [];
  const fromSteps = (steps) => {
    for (const step of steps ?? []) {
      for (const block of step.blocks ?? []) if (block?.type === 'image') blocks.push(block);
      for (const sub of step.subtitles ?? []) {
        for (const block of sub.blocks ?? []) if (block?.type === 'image') blocks.push(block);
      }
    }
  };
  fromSteps(content?.langkah_kerja);
  fromSteps(content?.latihan_tugas);
  return blocks;
}

loadEnv();
const connection = await mysql.createConnection(requireDbConfig());

let scanned = 0;
let filled = 0;
let failed = 0;
let updatedRows = 0;

try {
  const [rows] = await connection.query('SELECT id, title, content FROM blogs ORDER BY created_at');

  for (const row of rows) {
    let content;
    try {
      content = typeof row.content === 'string' ? JSON.parse(row.content) : row.content;
    } catch {
      console.warn(`  ! ${row.title}: konten bukan JSON yang valid, dilewati`);
      continue;
    }
    if (!content || content.format !== 'structured') continue;

    const blocks = collectImageBlocks(content);
    let changed = false;

    for (const block of blocks) {
      const url = (block.content ?? '').trim();
      if (!url) continue;
      scanned++;
      if (block.width && block.height) continue;

      try {
        const size = await fetchImageSize(url);
        if (!size || !size.width || !size.height) {
          console.warn(`  ? format gambar tidak dikenali: ${url.slice(0, 70)}`);
          failed++;
          continue;
        }
        block.width = size.width;
        block.height = size.height;
        changed = true;
        filled++;
        console.log(`  + ${size.width}x${size.height}  ${url.slice(-45)}`);
      } catch (error) {
        console.warn(`  ! gagal membaca ${url.slice(0, 70)}: ${error.message}`);
        failed++;
      }
    }

    if (changed && !dryRun) {
      await connection.execute('UPDATE blogs SET content = ? WHERE id = ?', [
        JSON.stringify(content),
        row.id,
      ]);
      updatedRows++;
      console.log(`  = disimpan: ${row.title.slice(0, 60)}`);
    }
  }

  console.log(
    `\n${scanned} gambar diperiksa, ${filled} dapat dimensi, ${failed} gagal.` +
      (dryRun ? '\n(dry-run: tidak ada yang ditulis ke database)' : `\n${updatedRows} laporan diperbarui.`)
  );
} finally {
  await connection.end();
}
