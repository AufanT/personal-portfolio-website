-- =====================================================================
-- Skema MySQL untuk aufan.ifportofolio.com
-- Menggantikan Supabase Postgres. Jalankan sekali di phpMyAdmin (hPanel).
--
-- Catatan penting:
--  * `id` sengaja CHAR(36) UUID, BUKAN AUTO_INCREMENT, supaya URL lama
--    /blog/<uuid> dan entri sitemap yang sudah dipegang dosen tetap hidup.
--  * `content` pakai LONGTEXT (bukan tipe JSON) supaya portabel di MySQL 8
--    maupun MariaDB versi lama yang dipakai shared hosting. Aplikasi yang
--    melakukan JSON.parse / JSON.stringify.
--  * `created_at` DATETIME(6) mempertahankan presisi mikrodetik timestamp asli
--    dari Supabase — dipakai untuk urutan & navigasi prev/next artikel.
--    Konversinya di scripts/lib/datetime.mjs sengaja tidak lewat objek Date
--    JavaScript, yang hanya menyimpan milidetik. Semua nilai dalam UTC.
-- =====================================================================

SET NAMES utf8mb4;

-- ---------------------------------------------------------------------
-- blogs — laporan praktikum
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS blogs (
  id           CHAR(36)     NOT NULL,
  title        VARCHAR(300) NOT NULL,
  subject      VARCHAR(150) NOT NULL DEFAULT 'Praktikum',
  course       VARCHAR(150) NULL,      -- mata kuliah, mis. "Aplikasi Mobile"
  description  TEXT         NULL,
  content      LONGTEXT     NULL,
  github_url   VARCHAR(500) NULL,
  cover_url    VARCHAR(500) NULL,
  is_published TINYINT(1)   NOT NULL DEFAULT 0,
  created_at   DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at   DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
                            ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_blogs_published_created (is_published, created_at),
  KEY idx_blogs_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- projects — showcase portfolio
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
  id            CHAR(36)     NOT NULL,
  title         VARCHAR(300) NOT NULL,
  category      VARCHAR(120) NOT NULL DEFAULT 'Web Development',
  category_slug VARCHAR(60)  NOT NULL DEFAULT 'web',
  description   TEXT         NULL,
  image_url     VARCHAR(500) NULL,
  status        VARCHAR(60)  NOT NULL DEFAULT 'DRAFT',
  demo_url      VARCHAR(500) NULL,
  github_url    VARCHAR(500) NULL,
  details       TEXT         NULL,
  is_published  TINYINT(1)   NOT NULL DEFAULT 0,
  is_featured   TINYINT(1)   NOT NULL DEFAULT 0,
  created_at    DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at    DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
                             ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_projects_published_created (is_published, created_at),
  KEY idx_projects_featured (is_featured, is_published)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- admins — pengganti Supabase Auth. Biasanya hanya 1 baris.
-- password_hash diisi lewat `node scripts/hash-password.mjs`
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  id            CHAR(36)     NOT NULL,
  email         VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at    DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  last_login_at DATETIME(6)  NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admins_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
