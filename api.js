// ════════════════════════════════════════════════════════════════
//  API Client — With localStorage fallback for static hosting
// ════════════════════════════════════════════════════════════════

const API_BASE = window.location.origin + '/api';

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
  async createUser(data) { return this.request('POST', '/users', data); },
  async updateUser(id, data) { return this.request('PUT', '/users/' + id, data); },
  async deleteUser(id) { return this.request('DELETE', '/users/' + id); },

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
  async getPages() { return this.request('GET', '/pages'); },
  async getPage(slug) { return this.request('GET', '/pages/' + slug); },
  async updatePage(slug, data) { return this.request('PUT', '/pages/' + slug, data); },

  // ── Banners ──
  async getBanners() { return this.request('GET', '/banners'); },
  async createBanner(data) { return this.request('POST', '/banners', data); },
  async updateBanner(id, data) { return this.request('PUT', '/banners/' + id, data); },
  async deleteBanner(id) { return this.request('DELETE', '/banners/' + id); },

  // ── Media ──
  async getMedia() { return this.request('GET', '/media'); },
  async uploadMedia(formData) {
    try {
      const headers = {};
      if (this.token) headers['Authorization'] = 'Bearer ' + this.token;
      const res = await fetch(API_BASE + '/media/upload', { method: 'POST', headers, body: formData });
      return await res.json();
    } catch (e) { throw new Error('BACKEND_OFFLINE'); }
  },
  async updateMedia(id, data) { return this.request('PUT', '/media/' + id, data); },
  async deleteMedia(id) { return this.request('DELETE', '/media/' + id); },

  // ── Files ──
  async getFiles() { return this.request('GET', '/files'); },
  async uploadFile(formData) {
    try {
      const headers = {};
      if (this.token) headers['Authorization'] = 'Bearer ' + this.token;
      const res = await fetch(API_BASE + '/files/upload', { method: 'POST', headers, body: formData });
      return await res.json();
    } catch (e) { throw new Error('BACKEND_OFFLINE'); }
  },
  async downloadFile(id) { window.open(API_BASE + '/files/' + id + '/download'); },
  async deleteFile(id) { return this.request('DELETE', '/files/' + id); },

  // ── Plugins ──
  async getPlugins() { return this.request('GET', '/plugins'); },
  async uploadPlugin(formData) {
    try {
      const headers = {};
      if (this.token) headers['Authorization'] = 'Bearer ' + this.token;
      const res = await fetch(API_BASE + '/plugins/upload', { method: 'POST', headers, body: formData });
      return await res.json();
    } catch (e) { throw new Error('BACKEND_OFFLINE'); }
  },
  async updatePlugin(id, data) { return this.request('PUT', '/plugins/' + id, data); },
  async deletePlugin(id) { return this.request('DELETE', '/plugins/' + id); },

  // ── Social ──
  async getSocial() { return this.request('GET', '/social'); },
  async updateSocial(id, data) { return this.request('PUT', '/social/' + id, data); },
  async getSchedules() { return this.request('GET', '/social/schedules'); },
  async createSchedule(data) { return this.request('POST', '/social/schedules', data); },
  async updateSchedule(id, data) { return this.request('PUT', '/social/schedules/' + id, data); },

  // ── Settings ──
  async getSettings() { return this.request('GET', '/settings'); },
  async updateSettings(data) { return this.request('PUT', '/settings', data); },
};
