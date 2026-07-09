// ════════════════════════════════════════════════════════════════
//  API Client — With localStorage fallback for static hosting
// ════════════════════════════════════════════════════════════════

const API_BASE = window.location.origin + '/api';

function readStore(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (e) {
    return fallback;
  }
}

function writeStore(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function makeId(prefix) {
  return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

async function fileToData(file) {
  return new Promise(function(resolve, reject) {
    const reader = new FileReader();
    reader.onload = function(e) { resolve(e.target.result); };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const api = {
  token: localStorage.getItem('api_token') || null,
  backendAvailable: null, // null = unknown, true/false after first check

  setToken(t) { this.token = t; if (t) localStorage.setItem('api_token', t); else localStorage.removeItem('api_token'); },
  clearToken() { this.token = null; localStorage.removeItem('api_token'); localStorage.removeItem('site_user'); },

  async checkBackend() {
    if (this.backendAvailable !== null) return this.backendAvailable;
    try {
      const res = await fetch(API_BASE + '/health', { method: 'GET' });
      const text = await res.text();
      this.backendAvailable = text.includes('"status":"ok"') || text.includes('"status": "ok"');
    } catch (e) {
      this.backendAvailable = false;
    }
    return this.backendAvailable;
  },

  async request(method, path, body) {
    // If backend was previously found to be unavailable, skip immediately
    if (this.backendAvailable === false) throw new Error('BACKEND_OFFLINE');

    const headers = { 'Content-Type': 'application/json' };
    if (this.token) headers['Authorization'] = 'Bearer ' + this.token;
    const opts = { method, headers };
    if (body && method !== 'GET') opts.body = JSON.stringify(body);

    let res;
    try {
      res = await fetch(API_BASE + path, opts);
    } catch (e) {
      this.backendAvailable = false;
      throw new Error('BACKEND_OFFLINE');
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      this.backendAvailable = false;
      throw new Error('BACKEND_OFFLINE');
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'خطای سرور');
    return data;
  },

  // ── Auth ──
  async login(email, password) {
    try {
      return await this.request('POST', '/auth/login', { email, password });
    } catch (e) {
      if (e.message === 'BACKEND_OFFLINE') {
        // Fallback: check localStorage
        const users = JSON.parse(localStorage.getItem('site_users') || '[]');
        const adminUser = { name: 'مدیر سایت', email: 'admin@example.com', password: 'admin', role: 'admin' };
        const all = [adminUser].concat(users);
        const user = all.find(u => u.email === email && u.password === password);
        if (user) {
          const token = 'local_' + Date.now();
          this.setToken(token);
          return { token, user: { id: 1, name: user.name, email: user.email, role: user.role || 'admin' } };
        }
        throw new Error('ایمیل یا رمز عبور اشتباه است.');
      }
      throw e;
    }
  },

  async register(name, email, phone, password) {
    try {
      return await this.request('POST', '/auth/register', { name, email, phone, password });
    } catch (e) {
      if (e.message === 'BACKEND_OFFLINE') {
        const users = JSON.parse(localStorage.getItem('site_users') || '[]');
        if (users.find(u => u.email === email)) throw new Error('این ایمیل قبلاً ثبت شده');
        const newUser = { name, email, phone, password, date: new Date().toISOString() };
        users.push(newUser);
        localStorage.setItem('site_users', JSON.stringify(users));
        const token = 'local_' + Date.now();
        this.setToken(token);
        return { token, user: { id: users.length, name, email, phone, role: 'subscriber' } };
      }
      throw e;
    }
  },

  async resetPassword(email, newPassword) {
    try {
      return await this.request('POST', '/auth/reset-password', { email, newPassword });
    } catch (e) {
      if (e.message === 'BACKEND_OFFLINE') {
        const users = JSON.parse(localStorage.getItem('site_users') || '[]');
        const user = users.find(u => u.email === email);
        if (!user) throw new Error('کاربری با این ایمیل یافت نشد');
        user.password = newPassword;
        localStorage.setItem('site_users', JSON.stringify(users));
        return { message: 'رمز عبور تغییر کرد' };
      }
      throw e;
    }
  },

  async getMe() {
    try {
      return await this.request('GET', '/auth/me');
    } catch (e) {
      if (e.message === 'BACKEND_OFFLINE') {
        const user = JSON.parse(localStorage.getItem('site_user') || 'null');
        if (user) return user;
        throw new Error('کاربر یافت نشد');
      }
      throw e;
    }
  },

  // ── Users ──
  async getUsers() { try { return await this.request('GET', '/users'); } catch (e) { if (e.message === 'BACKEND_OFFLINE') return []; throw e; } },
  async getAdmins() { try { return await this.request('GET', '/users/admins'); } catch (e) { if (e.message === 'BACKEND_OFFLINE') return JSON.parse(localStorage.getItem('admin_users') || '[]'); throw e; } },
  async getMembers() { try { return await this.request('GET', '/users/members'); } catch (e) { if (e.message === 'BACKEND_OFFLINE') return JSON.parse(localStorage.getItem('site_users') || '[]'); throw e; } },
  async createUser(data) {
    try { return await this.request('POST', '/users', data); } catch (e) {
      if (e.message === 'BACKEND_OFFLINE') {
        const key = data.role === 'subscriber' ? 'site_users' : 'admin_users';
        const users = readStore(key, []);
        if (users.find(u => String(u.email).toLowerCase() === String(data.email).toLowerCase())) throw new Error('ایمیل تکراری است');
        const user = { id: makeId('user'), created_at: new Date().toISOString(), status: 'active', ...data };
        users.push(user);
        writeStore(key, users);
        return user;
      }
      throw e;
    }
  },
  async updateUser(id, data) {
    try { return await this.request('PUT', '/users/' + id, data); } catch (e) {
      if (e.message === 'BACKEND_OFFLINE') {
        ['admin_users', 'site_users'].forEach(key => {
          const users = readStore(key, []);
          const user = users.find(u => String(u.id) === String(id) || String(u.email) === String(id));
          if (user) {
            Object.assign(user, data, { updated_at: new Date().toISOString() });
            writeStore(key, users);
          }
        });
        return { message: 'ذخیره شد' };
      }
      throw e;
    }
  },
  async deleteUser(id) {
    try { return await this.request('DELETE', '/users/' + id); } catch (e) {
      if (e.message === 'BACKEND_OFFLINE') {
        ['admin_users', 'site_users'].forEach(key => {
          const users = readStore(key, []).filter(u => String(u.id) !== String(id) && String(u.email) !== String(id));
          writeStore(key, users);
        });
        return { message: 'حذف شد' };
      }
      throw e;
    }
  },

  // ── Posts ──
  async getPosts() {
    try { return await this.request('GET', '/posts'); } catch (e) {
      if (e.message === 'BACKEND_OFFLINE') return JSON.parse(localStorage.getItem('admin_blog_posts') || '[]');
      throw e;
    }
  },
  async getPost(id) { return this.request('GET', '/posts/' + id); },
  async createPost(data) {
    try { return await this.request('POST', '/posts', data); } catch (e) {
      if (e.message === 'BACKEND_OFFLINE') {
        const posts = JSON.parse(localStorage.getItem('admin_blog_posts') || '[]');
        const now = new Date().toISOString();
        const newPost = { id: 'local_' + Date.now(), ...data, author: data.author || 'مدیر', category: data.category || 'استراتژی', date: now, created_at: now, published_at: data.status === 'published' ? now : null };
        posts.unshift(newPost);
        localStorage.setItem('admin_blog_posts', JSON.stringify(posts));
        return newPost;
      }
      throw e;
    }
  },
  async updatePost(id, data) {
    try { return await this.request('PUT', '/posts/' + id, data); } catch (e) {
      if (e.message === 'BACKEND_OFFLINE') {
        const posts = JSON.parse(localStorage.getItem('admin_blog_posts') || '[]');
        const idx = posts.findIndex(p => p.id == id);
        if (idx !== -1) {
          Object.assign(posts[idx], data);
          if (data.status === 'published') posts[idx].published_at = new Date().toISOString();
          if (data.status === 'scheduled' && data.scheduled_at) posts[idx].published_at = data.scheduled_at;
          localStorage.setItem('admin_blog_posts', JSON.stringify(posts));
        }
        return { message: 'ذخیره شد' };
      }
      throw e;
    }
  },
  async deletePost(id) {
    try { return await this.request('DELETE', '/posts/' + id); } catch (e) {
      if (e.message === 'BACKEND_OFFLINE') {
        let posts = JSON.parse(localStorage.getItem('admin_blog_posts') || '[]');
        posts = posts.filter(p => p.id != id);
        localStorage.setItem('admin_blog_posts', JSON.stringify(posts));
        return { message: 'حذف شد' };
      }
      throw e;
    }
  },
  async publishPost(id) { return this.request('POST', '/posts/' + id + '/publish'); },

  // ── Pages ──
  async getPages() { try { return await this.request('GET', '/pages'); } catch (e) { if (e.message === 'BACKEND_OFFLINE') return readStore('admin_pages', {}); throw e; } },
  async getPage(slug) { try { return await this.request('GET', '/pages/' + slug); } catch (e) { if (e.message === 'BACKEND_OFFLINE') return readStore('admin_pages', {})[slug] || null; throw e; } },
  async updatePage(slug, data) {
    try { return await this.request('PUT', '/pages/' + slug, data); } catch (e) {
      if (e.message === 'BACKEND_OFFLINE') {
        const pages = readStore('admin_pages', {});
        pages[slug] = { ...(pages[slug] || {}), ...data, updated_at: new Date().toISOString() };
        writeStore('admin_pages', pages);
        return pages[slug];
      }
      throw e;
    }
  },

  // ── Banners ──
  async getBanners() { try { return await this.request('GET', '/banners'); } catch (e) { if (e.message === 'BACKEND_OFFLINE') return readStore('admin_banners', []); throw e; } },
  async createBanner(data) { try { return await this.request('POST', '/banners', data); } catch (e) { if (e.message === 'BACKEND_OFFLINE') { const items = readStore('admin_banners', []); const item = { id: makeId('banner'), created_at: new Date().toISOString(), ...data }; items.push(item); writeStore('admin_banners', items); return item; } throw e; } },
  async updateBanner(id, data) { try { return await this.request('PUT', '/banners/' + id, data); } catch (e) { if (e.message === 'BACKEND_OFFLINE') { const items = readStore('admin_banners', []); const item = items.find(x => String(x.id) === String(id)); if (item) Object.assign(item, data, { updated_at: new Date().toISOString() }); writeStore('admin_banners', items); return item || { message: 'ذخیره شد' }; } throw e; } },
  async deleteBanner(id) { try { return await this.request('DELETE', '/banners/' + id); } catch (e) { if (e.message === 'BACKEND_OFFLINE') { writeStore('admin_banners', readStore('admin_banners', []).filter(x => String(x.id) !== String(id))); return { message: 'حذف شد' }; } throw e; } },

  // ── Media ──
  async getMedia() { try { return await this.request('GET', '/media'); } catch (e) { if (e.message === 'BACKEND_OFFLINE') return readStore('admin_media', []); throw e; } },
  async uploadMedia(formData) {
    try {
      const headers = {};
      if (this.token) headers['Authorization'] = 'Bearer ' + this.token;
      const res = await fetch(API_BASE + '/media/upload', { method: 'POST', headers, body: formData });
      return await res.json();
    } catch (e) {
      const file = formData.get('file') || formData.get('image');
      if (!file) throw new Error('فایلی ارسال نشد');
      const media = readStore('admin_media', []);
      const item = { id: makeId('media'), file_name: file.name, file_path: await fileToData(file), mime_type: file.type, size: file.size, created_at: new Date().toISOString() };
      media.unshift(item);
      writeStore('admin_media', media);
      return item;
    }
  },
  async updateMedia(id, data) { try { return await this.request('PUT', '/media/' + id, data); } catch (e) { if (e.message === 'BACKEND_OFFLINE') { const media = readStore('admin_media', []); const item = media.find(x => String(x.id) === String(id)); if (item) Object.assign(item, data); writeStore('admin_media', media); return item || { message: 'ذخیره شد' }; } throw e; } },
  async deleteMedia(id) { try { return await this.request('DELETE', '/media/' + id); } catch (e) { if (e.message === 'BACKEND_OFFLINE') { writeStore('admin_media', readStore('admin_media', []).filter(x => String(x.id) !== String(id))); return { message: 'حذف شد' }; } throw e; } },

  // ── Files ──
  async getFiles() { try { return await this.request('GET', '/files'); } catch (e) { if (e.message === 'BACKEND_OFFLINE') return readStore('site_files', []); throw e; } },
  async uploadFile(formData) {
    try {
      const headers = {};
      if (this.token) headers['Authorization'] = 'Bearer ' + this.token;
      const res = await fetch(API_BASE + '/files/upload', { method: 'POST', headers, body: formData });
      return await res.json();
    } catch (e) {
      const file = formData.get('file');
      if (!file) throw new Error('فایلی ارسال نشد');
      const files = readStore('site_files', []);
      const item = { id: makeId('file'), name: file.name, file_name: file.name, type: file.type || 'application/octet-stream', size: file.size, data: await fileToData(file), date: new Date().toISOString(), created_at: new Date().toISOString() };
      files.unshift(item);
      writeStore('site_files', files);
      return item;
    }
  },
  async downloadFile(id) {
    const file = readStore('site_files', []).find(f => String(f.id) === String(id));
    if (file && file.data) {
      const a = document.createElement('a');
      a.href = file.data;
      a.download = file.name || file.file_name || 'download';
      a.click();
      return;
    }
    window.open(API_BASE + '/files/' + id + '/download');
  },
  async deleteFile(id) { try { return await this.request('DELETE', '/files/' + id); } catch (e) { if (e.message === 'BACKEND_OFFLINE') { writeStore('site_files', readStore('site_files', []).filter(x => String(x.id) !== String(id))); return { message: 'حذف شد' }; } throw e; } },

  // ── Plugins ──
  async getPlugins() { try { return await this.request('GET', '/plugins'); } catch (e) { if (e.message === 'BACKEND_OFFLINE') return readStore('admin_plugins', []); throw e; } },
  async uploadPlugin(formData) {
    try {
      const headers = {};
      if (this.token) headers['Authorization'] = 'Bearer ' + this.token;
      const res = await fetch(API_BASE + '/plugins/upload', { method: 'POST', headers, body: formData });
      return await res.json();
    } catch (e) {
      const file = formData.get('file') || formData.get('plugin');
      if (!file) throw new Error('فایلی ارسال نشد');
      const plugins = readStore('admin_plugins', []);
      const baseName = file.name.replace(/\.(zip|rar|tar|7z)$/i, '');
      const item = { id: makeId('plugin'), name: baseName, slug: baseName.toLowerCase().replace(/[^a-z0-9-]/g, '-'), version: '1.0.0', active: false, configured: false, fileName: file.name, fileSize: file.size, file: await fileToData(file), created_at: new Date().toISOString() };
      plugins.push(item);
      writeStore('admin_plugins', plugins);
      return item;
    }
  },
  async updatePlugin(id, data) { try { return await this.request('PUT', '/plugins/' + id, data); } catch (e) { if (e.message === 'BACKEND_OFFLINE') { const plugins = readStore('admin_plugins', []); const item = plugins.find(x => String(x.id) === String(id) || String(x.slug) === String(id)); if (item) Object.assign(item, data); writeStore('admin_plugins', plugins); return item || { message: 'ذخیره شد' }; } throw e; } },
  async deletePlugin(id) { try { return await this.request('DELETE', '/plugins/' + id); } catch (e) { if (e.message === 'BACKEND_OFFLINE') { writeStore('admin_plugins', readStore('admin_plugins', []).filter(x => String(x.id) !== String(id) && String(x.slug) !== String(id))); return { message: 'حذف شد' }; } throw e; } },

  // ── Social ──
  async getSocial() { try { return await this.request('GET', '/social'); } catch (e) { if (e.message === 'BACKEND_OFFLINE') return readStore('admin_social', []); throw e; } },
  async updateSocial(id, data) { try { return await this.request('PUT', '/social/' + id, data); } catch (e) { if (e.message === 'BACKEND_OFFLINE') { const social = readStore('admin_social', []); const item = social.find(x => String(x.id) === String(id)); if (item) Object.assign(item, data); writeStore('admin_social', social); return item || { message: 'ذخیره شد' }; } throw e; } },
  async getSchedules() { try { return await this.request('GET', '/social/schedules'); } catch (e) { if (e.message === 'BACKEND_OFFLINE') return readStore('admin_schedules', []); throw e; } },
  async createSchedule(data) { try { return await this.request('POST', '/social/schedules', data); } catch (e) { if (e.message === 'BACKEND_OFFLINE') { const schedules = readStore('admin_schedules', []); const item = { id: makeId('schedule'), status: 'scheduled', created_at: new Date().toISOString(), ...data }; schedules.unshift(item); writeStore('admin_schedules', schedules); return item; } throw e; } },
  async updateSchedule(id, data) { try { return await this.request('PUT', '/social/schedules/' + id, data); } catch (e) { if (e.message === 'BACKEND_OFFLINE') { const schedules = readStore('admin_schedules', []); const item = schedules.find(x => String(x.id) === String(id)); if (item) Object.assign(item, data); writeStore('admin_schedules', schedules); return item || { message: 'ذخیره شد' }; } throw e; } },

  // ── Settings ──
  async getSettings() { try { return await this.request('GET', '/settings'); } catch (e) { if (e.message === 'BACKEND_OFFLINE') return readStore('admin_settings', {}); throw e; } },
  async updateSettings(data) { try { return await this.request('PUT', '/settings', data); } catch (e) { if (e.message === 'BACKEND_OFFLINE') { const settings = { ...readStore('admin_settings', {}), ...data, updated_at: new Date().toISOString() }; writeStore('admin_settings', settings); return settings; } throw e; } },
};
