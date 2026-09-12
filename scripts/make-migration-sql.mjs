#!/usr/bin/env node
/**
 * Menghasilkan SATU file .sql berisi skema + user admin + semua laporan
 * praktikum, siap ditempel ke phpMyAdmin.
 *
 *   node scripts/make-migration-sql.mjs <email-admin> <password-admin>
 *   node scripts/make-migration-sql.mjs <email> <password> --out=db/migration.sql
 *
 * Script ini TIDAK menghubungi database sama sekali, jadi bisa dijalankan dari
 * laptop tanpa perlu mengaktifkan Remote MySQL di hPanel. Ini jalur termudah
 * di shared hosting: buat database di hPanel, buka phpMyAdmin, tempel hasilnya,
 * selesai.
 *
 * File keluarannya memuat hash password (bukan password aslinya), tapi tetap
 * jangan di-commit — lihat aturan db/migration.sql di .gitignore.
 */

import { randomBytes, randomUUID, scrypt as scryptCb } from 'crypto';
import { promisify } from 'util';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { escape } from 'mysql2';
import { toMysqlDateTime } from './lib/datetime.mjs';

const scrypt = promisify(scryptCb);

const BLOGS_FILE = 'backup/blogs-recovered-2026-09-12.json';

/** Baris uji coba yang tidak perlu ikut pindah. */
const SKIP_IDS = new Set([
  'd1068b42-c9a8-47d9-9020-71763409570f', // "tes"
  'efe6ddee-049b-4817-a135-5f81c9ac927e', // "trs"
]);

const args = process.argv.slice(2);
const positional = args.filter((a) => !a.startsWith('--'));
const outFlag = args.find((a) => a.startsWith('--out='));

const [email, password] = positional;

if (!email || !password) {
  console.error('Penggunaan: node scripts/make-migration-sql.mjs <email-admin> <password-admin>');
  process.exit(1);
}

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error(`Email tidak valid: ${email}`);
  process.exit(1);
}

if (password.length < 10) {
  console.error('Password minimal 10 karakter.');
  process.exit(1);
}

const outPath = path.resolve(
  process.cwd(),
  outFlag ? outFlag.slice('--out='.length) : 'db/migration.sql'
);

/** Format hash harus sama dengan yang diverifikasi src/lib/auth.ts. */
async function hashPassword(plain) {
  const salt = randomBytes(16);
  const derived = await scrypt(plain, salt, 64);
  return `scrypt$${salt.toString('hex')}$${derived.toString('hex')}`;
}

const schema = readFileSync(path.resolve(process.cwd(), 'db/schema.sql'), 'utf8');

let blogRows = [];
try {
  blogRows = JSON.parse(readFileSync(path.resolve(process.cwd(), BLOGS_FILE), 'utf8'));
} catch (error) {
  console.warn(`Peringatan: ${BLOGS_FILE} tidak terbaca (${error.message}).`);
  console.warn('File SQL tetap dibuat, tapi tanpa data laporan praktikum.');
}

const hash = await hashPassword(password);

const parts = [
  '-- =====================================================================',
  '-- File ini DIBANGKITKAN oleh scripts/make-migration-sql.mjs',
  `-- Dibuat: ${new Date().toISOString()}`,
  '--',
  '-- Cara pakai: hPanel > Databases > phpMyAdmin > pilih database > tab SQL,',
  '-- tempel seluruh isi file ini, lalu Run. Aman dijalankan berulang.',
  '--',
  '-- Memuat hash password admin. Jangan di-commit dan jangan dibagikan.',
  '-- =====================================================================',
  '',
  schema.trim(),
  '',
  '-- ---------------------------------------------------------------------',
  '-- User admin',
  '-- ---------------------------------------------------------------------',
  `INSERT INTO admins (id, email, password_hash, created_at)`,
  `VALUES (${escape(randomUUID())}, ${escape(email.trim().toLowerCase())}, ${escape(hash)}, UTC_TIMESTAMP(6))`,
  `ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash);`,
  '',
];

let imported = 0;

if (blogRows.length > 0) {
  parts.push(
    '-- ---------------------------------------------------------------------',
    '-- Laporan praktikum hasil recovery dari cache Next.js',
    '-- ---------------------------------------------------------------------'
  );

  for (const row of blogRows) {
    if (!row?.id || !row?.title || SKIP_IDS.has(row.id)) continue;

    const content =
      row.content == null
        ? 'NULL'
        : escape(typeof row.content === 'string' ? row.content : JSON.stringify(row.content));

    parts.push(
      `-- ${row.subject || '-'}: ${row.title.replace(/\s+/g, ' ').slice(0, 70)}`,
      'INSERT INTO blogs (id, title, subject, description, content, github_url, cover_url, is_published, created_at)',
      `VALUES (${escape(row.id)}, ${escape(row.title)}, ${escape(row.subject || 'Praktikum')}, ` +
        `${escape(row.description ?? null)}, ${content}, ${escape(row.github_url ?? null)}, ` +
        `${escape(row.cover_url ?? null)}, ${row.is_published ? 1 : 0}, ${escape(toMysqlDateTime(row.created_at))})`,
      'ON DUPLICATE KEY UPDATE',
      '  title = VALUES(title), subject = VALUES(subject), description = VALUES(description),',
      '  content = VALUES(content), github_url = VALUES(github_url), cover_url = VALUES(cover_url),',
      '  is_published = VALUES(is_published), created_at = VALUES(created_at);',
      ''
    );
    imported++;
  }
}

mkdirSync(path.dirname(outPath), { recursive: true });
writeFileSync(outPath, parts.join('\n') + '\n', 'utf8');

const sizeKb = (readFileSync(outPath).length / 1024).toFixed(1);
console.log(`File SQL dibuat: ${path.relative(process.cwd(), outPath)} (${sizeKb} KB)`);
console.log(`  - 3 tabel (blogs, projects, admins)`);
console.log(`  - 1 admin: ${email.trim().toLowerCase()}`);
console.log(`  - ${imported} laporan praktikum`);
console.log('\nTempel isinya di phpMyAdmin > tab SQL > Run.');
