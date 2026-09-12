#!/usr/bin/env node
/**
 * Menghasilkan nilai untuk SESSION_SECRET.
 *
 *   node scripts/generate-secret.mjs
 *
 * Secret ini yang menandatangani cookie session admin. Kalau diganti, semua
 * sesi yang sedang aktif langsung tidak valid (harus login ulang) — itu juga
 * cara tercepat mencabut akses kalau cookie dicurigai bocor.
 */

import { randomBytes } from 'crypto';

const secret = randomBytes(48).toString('base64url');

console.log('\nTambahkan baris ini ke .env.local (lokal) dan ke environment Node app di hPanel:\n');
console.log(`SESSION_SECRET=${secret}\n`);
