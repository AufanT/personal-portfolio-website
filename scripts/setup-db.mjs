#!/usr/bin/env node
/**
 * Menjalankan db/schema.sql terhadap database yang dikonfigurasi.
 *
 *   node scripts/setup-db.mjs
 *
 * Aman dijalankan berulang: semua CREATE TABLE memakai IF NOT EXISTS.
 * Kalau lebih suka lewat phpMyAdmin, cukup tempel isi db/schema.sql di sana
 * dan script ini tidak perlu dipakai.
 */

import { readFileSync } from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { loadEnv, requireDbConfig } from './lib/env.mjs';

loadEnv();
const config = requireDbConfig();

const schemaPath = path.resolve(process.cwd(), 'db/schema.sql');
let schema;
try {
  schema = readFileSync(schemaPath, 'utf8');
} catch (error) {
  console.error(`Gagal membaca db/schema.sql: ${error.message}`);
  process.exit(1);
}

/**
 * Pemecah statement sederhana: buang komentar baris lalu pisah pada ";".
 * Cukup untuk schema.sql yang tidak memuat trigger atau stored procedure
 * (yang akan membutuhkan penanganan DELIMITER).
 */
const statements = schema
  .split(/\r?\n/)
  .filter((line) => !line.trim().startsWith('--'))
  .join('\n')
  .split(';')
  .map((s) => s.trim())
  .filter(Boolean);

const connection = await mysql.createConnection(config);

try {
  const [[info]] = await connection.query('SELECT VERSION() AS version, DATABASE() AS db');
  console.log(`Terhubung ke ${info.db} (MySQL ${info.version})\n`);

  for (const statement of statements) {
    const label = statement.slice(0, 60).replace(/\s+/g, ' ');
    await connection.query(statement);
    console.log(`  ok  ${label}...`);
  }

  const [tables] = await connection.query('SHOW TABLES');
  console.log(`\nTabel di database: ${tables.map((t) => Object.values(t)[0]).join(', ')}`);
  console.log('\nLangkah berikutnya:');
  console.log('  node scripts/create-admin.mjs <email> <password>');
  console.log('  node scripts/import-blogs.mjs');
} finally {
  await connection.end();
}
