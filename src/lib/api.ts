'use client';

/**
 * Pembungkus fetch untuk halaman admin.
 *
 * Halaman admin tidak bisa lagi bicara langsung ke database seperti saat
 * memakai Supabase — kredensial MySQL tidak boleh sampai ke browser. Semua
 * operasi lewat Route Handler di `/api/*`, dan session dibawa otomatis oleh
 * cookie httpOnly.
 */

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }

  /** Session habis atau belum login — pemanggil sebaiknya redirect ke /admin. */
  get isUnauthorized() {
    return this.status === 401;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(path, {
      ...init,
      headers: {
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
      // Halaman admin harus selalu melihat data terbaru, bukan cache browser.
      cache: 'no-store',
    });
  } catch {
    throw new ApiError('Tidak dapat terhubung ke server.', 0);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  let body: any = null;
  try {
    body = await response.json();
  } catch {
    /* respons tanpa body JSON — biarkan null */
  }

  if (!response.ok) {
    throw new ApiError(body?.error || `Request gagal (HTTP ${response.status}).`, response.status);
  }

  return body as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: body === undefined ? undefined : JSON.stringify(body) }),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
