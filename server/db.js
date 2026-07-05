const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'mahbod_site.db');
const SQL_PATH = path.join(__dirname, 'schema.sql');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize database
const tablesExist = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
if (!tablesExist) {
  console.log('Initializing database...');
  const sql = fs.readFileSync(SQL_PATH, 'utf8');
  db.exec(sql);
  console.log('✓ Database initialized');
}

// Seed defaults
const bcrypt = require('bcryptjs');

function seed() {
  if (db.prepare('SELECT COUNT(*) as c FROM users').get().c === 0) {
    const hash = bcrypt.hashSync('admin', 12);
    db.prepare("INSERT INTO users (name, email, phone, password_hash, role, status) VALUES (?,?,?,?,?,?)").run('مدیر سایت', 'admin@example.com', '09121234567', hash, 'admin', 'active');
  }
  if (db.prepare('SELECT COUNT(*) as c FROM pages').get().c === 0) {
    var ins = db.prepare("INSERT INTO pages (slug, title, h1_text, lead_text, kicker_text, seo_title, seo_desc) VALUES (?,?,?,?,?,?,?)");
    ins.run('index','صفحه اصلی','ساختن سیستم رشد','مشاور و مدیر بازاریابی','معمار رشد دیجیتال','مهبد نادری | معمار رشد دیجیتال','سایت شخصی');
    ins.run('about','درباره من','من بازاریابی را سیستمی می‌بینم','معمار رشد دیجیتال','درباره من','درباره مهبد نادری','بیوگرافی');
    ins.run('contact','تماس با من','بیایید گفتگو کنیم','برای مشاوره تماس بگیرید','تماس','تماس با مهبد نادری','تماس');
    ins.run('blog','نوشته‌ها','نوشته‌ها','مقالات و یادداشت‌ها','وبلاگ','نوشته‌ها','مقالات');
  }
  if (db.prepare('SELECT COUNT(*) as c FROM banners').get().c === 0) {
    var bi = db.prepare("INSERT INTO banners (title, image_path, position, is_active) VALUES (?,?,?,?)");
    bi.run('بنر اصلی','assets/profile-formal.jpeg','hero',1);
    bi.run('بنر درباره من','assets/profile-light.jpeg','about',1);
  }
  if (db.prepare('SELECT COUNT(*) as c FROM social_accounts').get().c === 0) {
    var si = db.prepare("INSERT INTO social_accounts (platform, handle, is_connected) VALUES (?,?,?)");
    si.run('whatsapp','@mahbod_naderi',1);
    si.run('bale','@mahbod_naderi',1);
    si.run('rubika','',0);
    si.run('telegram','@mahbod_naderi',1);
    si.run('instagram','@mahbod.naderi',1);
  }
  if (db.prepare('SELECT COUNT(*) as c FROM posts').get().c === 0) {
    var pi = db.prepare("INSERT INTO posts (title, slug, body, content_type, author_id, status, published_at) VALUES (?,?,?,?,?,?,datetime('now'))");
    pi.run('استراتژی رشد دیجیتال','strategy-growth','<p>بازاریابی دیجیتال مهم است.</p>','article',1,'published');
    pi.run('ساختار مارکتینگ','marketing-structure','<p>ساختار مناسب مهم است.</p>','article',1,'published');
  }
}
seed();

console.log('✓ SQLite database ready');
module.exports = db;
