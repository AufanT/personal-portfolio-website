#!/usr/bin/env node
/**
 * Mengimpor laporan praktikum hasil recovery ke tabel `blogs` MySQL.
 *
 *   node scripts/import-blogs.mjs
 *   node scripts/import-blogs.mjs backup/blogs-recovered-2026-09-12.json
 *   node scripts/import-blogs.mjs --include-drafts
 *   node scripts/import-blogs.mjs --skip=<id>,<id>
 *
 * Sumber data adalah snapshot yang diselamatkan dari `.next/cache/fetch-cache`
 * setelah project Supabase hilang. Dua baris uji coba berjudul "tes" dan "trs"
 * dilewati secara default — lihat DEFAULT_SKIP di bawah; pakai `--skip=` untuk
 * daftar sendiri, atau `--skip=` kosong agar semuanya ikut terimpor.
 *
 * Script ini idempoten: menjalankannya dua kali tidak membuat duplikat, baris
 * dengan id yang sama akan ditimpa (ON DUPLICATE KEY UPDATE).
 */

import { readFileSync } from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { loadEnv, requireDbConfig } from './lib/env.mjs';
import { toMysqlDateTime } from './lib/datetime.mjs';

const DEFAULT_FILE = 'backup/blogs-recovered-2026-09-12.json';

/** Dipakai untuk baris tanpa mata kuliah — semua laporan hasil recovery. */
const DEFAULT_COURSE = 'Pemrograman Web';

/** Baris uji coba yang tidak perlu ikut pindah. */
const DEFAULT_SKIP = [
  'd1068b42-c9a8-47d9-9020-71763409570f', // "tes"
  'efe6ddee-049b-4817-a135-5f81c9ac927e', // "trs"
];

const args = process.argv.slice(2);
const flags = args.filter((a) => a.startsWith('--'));
const file = args.find((a) => !a.startsWith('--')) ?? DEFAULT_FILE;

const skipFlag = flags.find((f) => f.startsWith('--skip='));
const skipIds = new Set(
  skipFlag
    ? skipFlag
        .slice('--skip='.length)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : DEFAULT_SKIP
);

let rows;
try {
  rows = JSON.parse(readFileSync(path.resolve(process.cwd(), file), 'utf8'));
} catch (error) {
  console.error(`Gagal membaca ${file}: ${error.message}`);
  process.exit(1);
}

if (!Array.isArray(rows)) {
  console.error(`${file} harus berisi array baris blog.`);
  process.exit(1);
}

loadEnv();
const connection = await mysql.createConnection(requireDbConfig());

let inserted = 0;
let skipped = 0;

try {
  for (const row of rows) {
    if (!row?.id || !row?.title) {
      console.warn('  ! dilewati: baris tanpa id atau title');
      skipped++;
      continue;
    }

    if (skipIds.has(row.id)) {
      console.log(`  - lewati ${JSON.stringify(row.title)} (${row.id})`);
      skipped++;
      continue;
    }

    await connection.execute(
      `INSERT INTO blogs
         (id, title, subject, course, description, content, github_url, cover_url, is_published, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         title = VALUES(title),
         subject = VALUES(subject),
         course = VALUES(course),
         description = VALUES(description),
         content = VALUES(content),
         github_url = VALUES(github_url),
         cover_url = VALUES(cover_url),
         is_published = VALUES(is_published),
         created_at = VALUES(created_at)`,
      [
        row.id,
        row.title,
        row.subject || 'Praktikum',
        row.course || DEFAULT_COURSE,
        row.description ?? null,
        row.content == null
          ? null
          : typeof row.content === 'string'
            ? row.content
            : JSON.stringify(row.content),
        row.github_url ?? null,
        row.cover_url ?? null,
        row.is_published ? 1 : 0,
        toMysqlDateTime(row.created_at),
      ]
    );

    const size = (JSON.stringify(row).length / 1024).toFixed(1);
    console.log(`  + ${row.subject || '-'} — ${row.title.slice(0, 60)} (${size} KB)`);
    inserted++;
  }

  const [[count]] = await connection.query('SELECT COUNT(*) AS total FROM blogs');
  console.log(`\nSelesai. ${inserted} diimpor, ${skipped} dilewati.`);
  console.log(`Total baris di tabel blogs sekarang: ${count.total}`);
} finally {
  await connection.end();
}
