-- ═══════════════════════════════════════════════════════════════
--  Database Schema — Mahbod Naderi Portfolio Site
--  SQL (MySQL / MariaDB compatible)
-- ═══════════════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS mahbod_site
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE mahbod_site;

-- ─── Users ───────────────────────────────────────────────────
CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(200) NOT NULL UNIQUE,
  phone         VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('admin','editor','subscriber') DEFAULT 'subscriber',
  status        ENUM('active','inactive','banned') DEFAULT 'active',
  newsletter    TINYINT(1) DEFAULT 0,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login    TIMESTAMP NULL
);

-- ─── Pages (CMS content) ─────────────────────────────────────
CREATE TABLE pages (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  slug          VARCHAR(100) NOT NULL UNIQUE,
  title         VARCHAR(200) NOT NULL,
  h1_text       TEXT,
  lead_text     TEXT,
  kicker_text   VARCHAR(200),
  btn1_text     VARCHAR(100),
  btn1_link     VARCHAR(300),
  btn2_text     VARCHAR(100),
  btn2_link     VARCHAR(300),
  section1_title VARCHAR(200),
  section1_body LONGTEXT,
  section2_title VARCHAR(200),
  section2_body LONGTEXT,
  seo_title     VARCHAR(200),
  seo_desc      VARCHAR(500),
  seo_keywords  VARCHAR(500),
  seo_canonical VARCHAR(500),
  image_path    VARCHAR(500),
  image_alt     VARCHAR(300),
  image_caption VARCHAR(500),
  status        ENUM('published','draft','trash') DEFAULT 'published',
  created_by    INT,
  updated_by    INT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ─── Blog Posts ──────────────────────────────────────────────
CREATE TABLE posts (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(300) NOT NULL,
  slug          VARCHAR(300) NOT NULL UNIQUE,
  body          LONGTEXT,
  excerpt       TEXT,
  content_type  ENUM('article','video') DEFAULT 'article',
  video_url     VARCHAR(1000),
  category_id   INT,
  author_id     INT,
  status        ENUM('published','draft','trash') DEFAULT 'draft',
  seo_title     VARCHAR(200),
  seo_desc      VARCHAR(500),
  featured_image VARCHAR(500),
  views         INT DEFAULT 0,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  published_at  TIMESTAMP NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ─── Categories ──────────────────────────────────────────────
CREATE TABLE categories (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  slug          VARCHAR(100) NOT NULL UNIQUE,
  description   TEXT,
  parent_id     INT NULL,
  sort_order    INT DEFAULT 0,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- ─── Tags ────────────────────────────────────────────────────
CREATE TABLE tags (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  slug          VARCHAR(100) NOT NULL UNIQUE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Post ↔ Tag pivot ────────────────────────────────────────
CREATE TABLE post_tags (
  post_id       INT NOT NULL,
  tag_id        INT NOT NULL,
  PRIMARY KEY (post_id, tag_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id)  REFERENCES tags(id)  ON DELETE CASCADE
);

-- ─── Banners / Sliders ───────────────────────────────────────
CREATE TABLE banners (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(200) NOT NULL,
  image_path    VARCHAR(500),
  link_url      VARCHAR(500),
  position      VARCHAR(100) DEFAULT 'hero',
  caption       TEXT,
  sort_order    INT DEFAULT 0,
  is_active     TINYINT(1) DEFAULT 1,
  position_x    INT DEFAULT 50,
  position_y    INT DEFAULT 50,
  start_date    TIMESTAMP NULL,
  end_date      TIMESTAMP NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─── Media / Gallery ─────────────────────────────────────────
CREATE TABLE media (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  file_name     VARCHAR(300) NOT NULL,
  file_path     VARCHAR(500) NOT NULL,
  file_type     ENUM('image','video','document') DEFAULT 'image',
  file_size     INT DEFAULT 0,
  alt_text      VARCHAR(300),
  caption       VARCHAR(500),
  uploaded_by   INT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ─── Social Accounts ─────────────────────────────────────────
CREATE TABLE social_accounts (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  platform      VARCHAR(50) NOT NULL,
  handle        VARCHAR(200),
  profile_url   VARCHAR(500),
  is_connected  TINYINT(1) DEFAULT 0,
  api_token     VARCHAR(1000),
  settings      JSON,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─── Social Schedule ─────────────────────────────────────────
CREATE TABLE social_schedules (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  post_id       INT,
  platform_ids  JSON NOT NULL,
  message       TEXT,
  scheduled_at  TIMESTAMP NOT NULL,
  status        ENUM('scheduled','published','cancelled','failed') DEFAULT 'scheduled',
  published_at  TIMESTAMP NULL,
  error_msg     TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE SET NULL
);

-- ─── Files / Documents ───────────────────────────────────────
CREATE TABLE files (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  file_name     VARCHAR(300) NOT NULL,
  file_path     VARCHAR(500) NOT NULL,
  file_type     VARCHAR(50),
  file_size     INT DEFAULT 0,
  description   TEXT,
  uploaded_by   INT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ─── Plugins ─────────────────────────────────────────────────
CREATE TABLE plugins (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  slug          VARCHAR(100) NOT NULL UNIQUE,
  description   TEXT,
  version       VARCHAR(20),
  author        VARCHAR(200),
  is_active     TINYINT(1) DEFAULT 0,
  settings      JSON,
  manifest_url  VARCHAR(500),
  installed_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Settings ────────────────────────────────────────────────
CREATE TABLE settings (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  setting_key   VARCHAR(100) NOT NULL UNIQUE,
  setting_value LONGTEXT,
  setting_type  ENUM('text','json','boolean','number') DEFAULT 'text',
  category      VARCHAR(50) DEFAULT 'general',
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─── Contact Form Submissions ────────────────────────────────
CREATE TABLE contact_submissions (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(200) NOT NULL,
  email         VARCHAR(200) NOT NULL,
  phone         VARCHAR(20),
  subject       VARCHAR(200),
  message       TEXT NOT NULL,
  status        ENUM('new','read','replied','archived') DEFAULT 'new',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Activity Log ────────────────────────────────────────────
CREATE TABLE activity_log (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT,
  action        VARCHAR(100) NOT NULL,
  entity_type   VARCHAR(50),
  entity_id     INT,
  details       JSON,
  ip_address    VARCHAR(45),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);


-- ═══════════════════════════════════════════════════════════════
--  Default Data
-- ═══════════════════════════════════════════════════════════════

INSERT INTO users (name, email, phone, password_hash, role) VALUES
('مدیر سایت', 'admin@example.com', '09121234567', '$2y$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ12', 'admin');

INSERT INTO categories (name, slug) VALUES
('استراتژی', 'strategy'),
('ساختار', 'structure'),
('مشاوره', 'consulting'),
('مدیریت', 'management');

INSERT INTO settings (setting_key, setting_value, setting_type, category) VALUES
('site_title', 'مهبد نادری | معمار رشد دیجیتال', 'text', 'seo'),
('site_description', 'سایت شخصی مهبد نادری؛ معمار رشد دیجیتال، مشاور بازاریابی.', 'text', 'seo'),
('site_keywords', 'بازاریابی دیجیتال, مشاوره, رشد دیجیتال', 'text', 'seo'),
('google_analytics_id', '', 'text', 'analytics'),
('contact_phone', '+98 912 214 7417', 'text', 'contact'),
('contact_email', 'mercury700ir@gmail.com', 'text', 'contact'),
('contact_address', 'تهران، ایران', 'text', 'contact');

INSERT INTO banners (title, image_path, position, is_active) VALUES
('بنر اصلی صفحه نخست', 'assets/profile-formal.jpeg', 'hero', 1),
('بنر درباره من', 'assets/profile-light.jpeg', 'about', 1);

INSERT INTO social_accounts (platform, handle, is_connected) VALUES
('whatsapp', '@mahbod_naderi', 1),
('bale', '@mahbod_naderi', 1),
('rubika', '', 0),
('telegram', '@mahbod_naderi', 1),
('instagram', '@mahbod.naderi', 1);
