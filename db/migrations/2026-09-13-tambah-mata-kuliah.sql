-- =====================================================================
-- Migrasi: tambah kolom mata kuliah (course) ke tabel blogs
-- Tanggal : 2026-09-13
--
-- Cara pakai: hPanel > Databases > phpMyAdmin > pilih database > tab SQL,
-- tempel isi file ini, lalu Go.
--
-- JALANKAN SEBELUM push kode yang memakai kolom `course`. Urutan ini aman:
-- kode lama tidak membaca kolom ini, jadi situs tetap normal walau kolomnya
-- sudah ada lebih dulu. Sebaliknya, kalau kode baru naik duluan, query daftar
-- laporan gagal dan halaman /blog tampil kosong sampai migrasi dijalankan.
-- =====================================================================

ALTER TABLE blogs
  ADD COLUMN course VARCHAR(150) NULL AFTER subject;

-- Semua laporan yang sudah ada berasal dari mata kuliah Pemrograman Web
-- (semester lalu).
UPDATE blogs SET course = 'Pemrograman Web' WHERE course IS NULL;

-- Pengecekan: kolom course harus terisi di semua baris.
SELECT subject, course, LEFT(title, 50) AS title FROM blogs ORDER BY created_at;
