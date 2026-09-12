#!/usr/bin/env node
/**
 * Membuat (atau mengganti password) user admin.
 *
 *   node scripts/create-admin.mjs <email> <password>
 *
 * Password dibaca dari argumen supaya script ini juga bisa dijalankan lewat
 * terminal hPanel yang tidak interaktif. Konsekuensinya password akan tercatat
 * di riwayat shell — ganti password lewat script ini hanya dari mesin sendiri,
 * atau hapus baris riwayatnya setelah selesai.
 *
 * Butuh DB_HOST / DB_USER / DB_PASSWORD / DB_NAME di .env.local.
 */

import { randomBytes, randomUUID, scrypt as scryptCb } from 'crypto';
import { promisify } from 'util';
import mysql from 'mysql2/promise';
import { loadEnv, requireDbConfig } from './lib/env.mjs';

const scrypt = promisify(scryptCb);

async function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString('hex')}$${derived.toString('hex')}`;
}

const [emailArg, passwordArg] = process.argv.slice(2);

if (!emailArg || !passwordArg) {
  console.error('Penggunaan: node scripts/create-admin.mjs <email> <password>');
  process.exit(1);
}

const email = emailArg.trim().toLowerCase();

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error(`Email tidak valid: ${email}`);
  process.exit(1);
}

if (passwordArg.length < 10) {
  console.error('Password minimal 10 karakter.');
  process.exit(1);
}

loadEnv();
const config = requireDbConfig();

const connection = await mysql.createConnection(config);

try {
  const hash = await hashPassword(passwordArg);

  const [existing] = await connection.execute(
    'SELECT id FROM admins WHERE email = ? LIMIT 1',
    [email]
  );

  if (existing.length > 0) {
    await connection.execute('UPDATE admins SET password_hash = ? WHERE email = ?', [hash, email]);
    console.log(`Password untuk ${email} berhasil diperbarui.`);
  } else {
    await connection.execute(
      'INSERT INTO admins (id, email, password_hash, created_at) VALUES (?, ?, ?, UTC_TIMESTAMP(6))',
      [randomUUID(), email, hash]
    );
    console.log(`Admin ${email} berhasil dibuat.`);
  }
} finally {
  await connection.end();
}
