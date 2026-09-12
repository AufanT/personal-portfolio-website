#!/usr/bin/env node
/**
 * Mengekspor isi tabel blogs & projects ke file JSON di folder backup/.
 *
 *   node scripts/export-data.mjs
 *   node scripts/export-data.mjs --out=/path/ke/folder
 *
 * Alasan script ini ada: data laporan praktikum pernah hilang sekali karena
 * bergantung penuh pada satu penyedia. Shared hosting juga tidak memberi
 * backup database yang bisa diandalkan, jadi jalankan ini sesekali (atau
 * lewat cron job hPanel) dan simpan hasilnya di luar server.
 *
 * Format keluarannya sama dengan yang dibaca `scripts/import-blogs.mjs`,
 * sehingga bisa dipakai untuk memulihkan data kembali.
 */

import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { loadEnv, requireDbConfig } from './lib/env.mjs';

const outFlag = process.argv.slice(2).find((a) => a.startsWith('--out='));
const outDir = path.resolve(process.cwd(), outFlag ? outFlag.slice('--out='.length) : 'backup/exports');

loadEnv();
const connection = await mysql.createConnection(requireDbConfig());

/** "2026-06-04 04:05:43.344965" → "2026-06-04T04:05:43.344965Z" */
function toIso(value) {
  if (value == null) return null;
  const raw = String(value);
  if (raw.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(raw)) return raw;
  return raw.replace(' ', 'T') + 'Z';
}

try {
  const [blogs] = await connection.query('SELECT * FROM blogs ORDER BY created_at ASC');
  const [projects] = await connection.query('SELECT * FROM projects ORDER BY created_at ASC');

  const stamp = new Date().toISOString().slice(0, 10);
  mkdirSync(outDir, { recursive: true });

  const blogsOut = blogs.map((row) => ({
    ...row,
    is_published: row.is_published === 1,
    created_at: toIso(row.created_at),
    updated_at: toIso(row.updated_at),
    content: (() => {
      try {
        return JSON.parse(row.content);
      } catch {
        return row.content;
      }
    })(),
  }));

  const projectsOut = projects.map((row) => ({
    ...row,
    is_published: row.is_published === 1,
    is_featured: row.is_featured === 1,
    created_at: toIso(row.created_at),
    updated_at: toIso(row.updated_at),
  }));

  const blogsFile = path.join(outDir, `blogs-${stamp}.json`);
  const projectsFile = path.join(outDir, `projects-${stamp}.json`);

  writeFileSync(blogsFile, JSON.stringify(blogsOut, null, 2), 'utf8');
  writeFileSync(projectsFile, JSON.stringify(projectsOut, null, 2), 'utf8');

  console.log(`${blogsOut.length} artikel  -> ${blogsFile}`);
  console.log(`${projectsOut.length} project  -> ${projectsFile}`);
  console.log('\nSimpan salinannya di luar server (Drive, laptop, atau repo privat).');
} finally {
  await connection.end();
}
