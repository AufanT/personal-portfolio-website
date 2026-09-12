/**
 * Pembaca .env.local sederhana untuk script CLI.
 *
 * Script di folder ini dijalankan dengan `node` biasa, bukan lewat Next.js,
 * jadi .env.local tidak ikut termuat sendiri. Parser ini cukup untuk format
 * KEY=value satu baris; tidak mendukung multiline atau ekspansi variabel.
 */

import { readFileSync } from 'fs';
import path from 'path';

export function loadEnv(file = '.env.local') {
  let raw;
  try {
    raw = readFileSync(path.resolve(process.cwd(), file), 'utf8');
  } catch {
    // Di server, variabel biasanya sudah disetel lewat panel hosting.
    return;
  }

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eq = trimmed.indexOf('=');
    if (eq < 1) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    // Variabel yang sudah ada di environment nyata menang atas isi file.
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

export function requireDbConfig() {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

  const missing = ['DB_HOST', 'DB_USER', 'DB_NAME'].filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`Environment belum lengkap: ${missing.join(', ')} belum di-set.`);
    console.error('Isi .env.local dari contoh di .env.example lebih dulu.');
    process.exit(1);
  }

  return {
    host: DB_HOST,
    port: DB_PORT ? Number(DB_PORT) : 3306,
    user: DB_USER,
    password: DB_PASSWORD ?? '',
    database: DB_NAME,
    charset: 'utf8mb4',
    timezone: 'Z',
    dateStrings: true,
    // Script import mengirim beberapa statement sekaligus dari file .sql.
    multipleStatements: false,
  };
}
