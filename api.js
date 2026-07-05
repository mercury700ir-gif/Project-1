// ════════════════════════════════════════════════════════════════
//  API Client — Centralized fetch wrapper for backend communication
// ════════════════════════════════════════════════════════════════

const API_BASE = window.location.origin + '/api';

const api = {
  token: localStorage.getItem('api_token') || null,

  setToken(t) { this.token = t; if (t) localStorage.setItem('api_token', t); else localStorage.removeItem('api_token'); },
  clearToken() { this.token = null; localStorage.removeItem('api_token'); },

  async request(method, path, body) {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) headers['Authorization'] = 'Bearer ' + this.token;
    const opts = { method, headers };
    if (body && method !== 'GET') opts.body = JSON.stringify(body);
    const res = await fetch(API_BASE + path, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'خطای سرور');
    return data;
  },

  // Auth
  login(email, password) { return this.request('POST', '/auth/login', { email, password }); },
  register(name, email, phone, password) { return this.request('POST', '/auth/register', { name, email, phone, password }); },
  resetPassword(email, newPassword) { return this.request('POST', '/auth/reset-password', { email, newPassword }); },
  getMe() { return this.request('GET', '/auth/me'); },

  // Users
  getUsers() { return this.request('GET', '/users'); },
  getAdmins() { return this.request('GET', '/users/admins'); },
  getMembers() { return this.request('GET', '/users/members'); },
  createUser(data) { return this.request('POST', '/users', data); },
  updateUser(id, data) { return this.request('PUT', '/users/' + id, data); },
  deleteUser(id) { return this.request('DELETE', '/users/' + id); },

  // Posts
  getPosts() { return this.request('GET', '/posts'); },
  getPost(id) { return this.request('GET', '/posts/' + id); },
  createPost(data) { return this.request('POST', '/posts', data); },
  updatePost(id, data) { return this.request('PUT', '/posts/' + id, data); },
  deletePost(id) { return this.request('DELETE', '/posts/' + id); },
  publishPost(id) { return this.request('POST', '/posts/' + id + '/publish'); },

  // Pages
  getPages() { return this.request('GET', '/pages'); },
  getPage(slug) { return this.request('GET', '/pages/' + slug); },
  updatePage(slug, data) { return this.request('PUT', '/pages/' + slug, data); },

  // Banners
  getBanners() { return this.request('GET', '/banners'); },
  createBanner(data) { return this.request('POST', '/banners', data); },
  updateBanner(id, data) { return this.request('PUT', '/banners/' + id, data); },
  deleteBanner(id) { return this.request('DELETE', '/banners/' + id); },

  // Media
  getMedia() { return this.request('GET', '/media'); },
  uploadMedia(formData) {
    const headers = {};
    if (this.token) headers['Authorization'] = 'Bearer ' + this.token;
    return fetch(API_BASE + '/media/upload', { method: 'POST', headers, body: formData }).then(r => r.json());
  },
  updateMedia(id, data) { return this.request('PUT', '/media/' + id, data); },
  deleteMedia(id) { return this.request('DELETE', '/media/' + id); },

  // Files
  getFiles() { return this.request('GET', '/files'); },
  uploadFile(formData) {
    const headers = {};
    if (this.token) headers['Authorization'] = 'Bearer ' + this.token;
    return fetch(API_BASE + '/files/upload', { method: 'POST', headers, body: formData }).then(r => r.json());
  },
  downloadFile(id) { window.open(API_BASE + '/files/' + id + '/download'); },
  deleteFile(id) { return this.request('DELETE', '/files/' + id); },

  // Plugins
  getPlugins() { return this.request('GET', '/plugins'); },
  uploadPlugin(formData) {
    const headers = {};
    if (this.token) headers['Authorization'] = 'Bearer ' + this.token;
    return fetch(API_BASE + '/plugins/upload', { method: 'POST', headers, body: formData }).then(r => r.json());
  },
  updatePlugin(id, data) { return this.request('PUT', '/plugins/' + id, data); },
  deletePlugin(id) { return this.request('DELETE', '/plugins/' + id); },

  // Social
  getSocial() { return this.request('GET', '/social'); },
  updateSocial(id, data) { return this.request('PUT', '/social/' + id, data); },
  getSchedules() { return this.request('GET', '/social/schedules'); },
  createSchedule(data) { return this.request('POST', '/social/schedules', data); },
  updateSchedule(id, data) { return this.request('PUT', '/social/schedules/' + id, data); },

  // Settings
  getSettings() { return this.request('GET', '/settings'); },
  updateSettings(data) { return this.request('PUT', '/settings', data); },
};
