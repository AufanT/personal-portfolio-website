import mysql from 'mysql2/promise';

/**
 * Pool MySQL untuk shared hosting.
 *
 * connectionLimit sengaja kecil: paket shared hosting punya batas
 * `max_user_connections` (umumnya 25–75) yang dibagi dengan proses lain.
 * Pool besar akan memicu "ER_CON_COUNT_ERROR / too many connections",
 * bukan bikin lebih cepat.
 *
 * Modul ini SERVER-ONLY. Jangan pernah diimport dari Client Component —
 * kredensial database tidak boleh sampai ke browser.
 */

declare global {
  // eslint-disable-next-line no-var
  var __mysqlPool: mysql.Pool | undefined;
}

function createPool(): mysql.Pool {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

  if (!DB_HOST || !DB_USER || !DB_NAME) {
    throw new Error(
      'Konfigurasi database belum lengkap. Set DB_HOST, DB_USER, DB_PASSWORD, DB_NAME di environment.'
    );
  }

  return mysql.createPool({
    host: DB_HOST,
    port: DB_PORT ? Number(DB_PORT) : 3306,
    user: DB_USER,
    password: DB_PASSWORD ?? '',
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 3,
    queueLimit: 0,
    connectTimeout: 10_000,
    charset: 'utf8mb4',
    timezone: 'Z', // simpan & baca sebagai UTC
    dateStrings: true, // DATETIME keluar sebagai string, tidak digeser ke timezone server
    supportBigNumbers: true,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10_000,
  });
}

/**
 * Di dev, Next.js hot-reload mem-reevaluasi modul berulang kali; tanpa cache
 * global setiap reload akan membuat pool baru sampai koneksi habis.
 */
export function getPool(): mysql.Pool {
  if (!global.__mysqlPool) {
    global.__mysqlPool = createPool();
  }
  return global.__mysqlPool;
}

/** SELECT — mengembalikan array baris. */
export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const [rows] = await getPool().execute(sql, params);
  return rows as T[];
}

/** SELECT satu baris — mengembalikan null kalau tidak ada. */
export async function queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

/** INSERT / UPDATE / DELETE — mengembalikan jumlah baris terdampak. */
export async function execute(sql: string, params: any[] = []): Promise<number> {
  const [result] = await getPool().execute(sql, params);
  return (result as mysql.ResultSetHeader).affectedRows ?? 0;
}
