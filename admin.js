/* ════════════════════════════════════════════════════════════════
   Admin Panel — Full JavaScript
   Blog CRUD · Social Connect · Schedule · AI Generator · Persistence
   ════════════════════════════════════════════════════════════════ */

// ────────────────── Helpers ──────────────────

function toPersianNumbers(str) {
  var d = ["۰","۱","۲","۳","۴","۵","۶","۷","۸","۹"];
  return String(str).replace(/[0-9]/g, function (c) { return d[+c]; });
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function nowISO() { return new Date().toISOString(); }

function persianDateShort(iso) {
  if (!iso) return "—";
  try {
    var d = new Date(iso);
    var j = d.toLocaleDateString("fa-IR", { year:"numeric", month:"2-digit", day:"2-digit" });
    return j;
  } catch(e) { return iso; }
}

function persianDateTimeShort(iso) {
  if (!iso) return "—";
  try {
    var d = new Date(iso);
    return d.toLocaleDateString("fa-IR", { year:"numeric", month:"2-digit", day:"2-digit" }) +
           " " + d.toLocaleTimeString("fa-IR", { hour:"2-digit", minute:"2-digit" });
  } catch(e) { return iso; }
}

function escapeHTML(str) {
  var div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function convertNumbersInScope(root) {
  var skip = 'input, textarea, select, svg, [dir="ltr"], pre, code, .code-block';
  var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: function (n) {
      if (!/[0-9]/.test(n.nodeValue)) return NodeFilter.FILTER_REJECT;
      var el = n.parentElement;
      if (el && el.closest(skip)) return NodeFilter.FILTER_REJECT;
      if (el && el.closest("a[href]")) {
        var h = el.closest("a").getAttribute("href") || "";
        if (h.startsWith("tel:") || h.startsWith("mailto:")) return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  while (walker.nextNode()) {
    walker.currentNode.nodeValue = toPersianNumbers(walker.currentNode.nodeValue);
  }
}

// ────────────────── localStorage Store ──────────────────

var Store = {
  get: function (key, fallback) {
    try { var v = localStorage.getItem("admin_" + key); return v ? JSON.parse(v) : fallback; }
    catch(e) { return fallback; }
  },
  set: function (key, val) {
    try { localStorage.setItem("admin_" + key, JSON.stringify(val)); } catch(e) {}
  }
};

// ────────────────── Default Data ──────────────────

var DEFAULT_BLOG_POSTS = [
  { id: "p1", title: "استراتژی رشد دیجیتال در ۱۴۰۵", author: "مهبد نادری", date: "2025-06-22", category: "استراتژی", tags: "استراتژی,رشد,دیجیتال", status: "published", body: "<p>بازاریابی دیجیتال امروزه به یکی از مهم‌ترین اجزای رشد کسب‌وکارها تبدیل شده است.</p>" },
  { id: "p2", title: "چگونه ساختار مارکتینگ بسازیم", author: "علی رضایی", date: "2025-06-18", category: "ساختار", tags: "ساختار,مارکتینگ", status: "published", body: "<p>ساختار دیجیتال مارکتینگ شامل تعریف فرآیندها، نقش‌ها و شاخص‌های کلیدی عملکرد است.</p>" },
  { id: "p3", title: "مشاوره مدیریت بازاریابی", author: "مهبد نادری", date: "2025-06-10", category: "مشاوره", tags: "مشاوره,مدیریت", status: "draft", body: "<p>همراهی مدیران برای تصمیم‌گیری دقیق‌تر در بازاریابی.</p>" }
];

var DEFAULT_SOCIAL = [
  { id: "whatsapp", name: "واتساپ", abbr: "WA", color: "#25d366", connected: true, handle: "@mahbod_naderi" },
  { id: "bale",     name: "بله",     abbr: "BL", color: "#1a8cff", connected: true, handle: "@mahbod_naderi" },
  { id: "rubika",   name: "روبیکا",   abbr: "RB", color: "#e91e63", connected: false, handle: "" },
  { id: "telegram", name: "تلگرام",   abbr: "TG", color: "#0088cc", connected: true, handle: "@mahbod_naderi" },
  { id: "instagram",name: "اینستاگرام",abbr: "IG", color: "#c13584", connected: true, handle: "@mahbod.naderi" }
];

var DEFAULT_SCHEDULES = [];

function getBlogPosts() { return Store.get("blog_posts", DEFAULT_BLOG_POSTS); }
function saveBlogPosts(posts) { Store.set("blog_posts", posts); }
function getSocial() { return Store.get("social", DEFAULT_SOCIAL); }
function saveSocial(soc) { Store.set("social", soc); }
function getSchedules() { return Store.get("schedules", DEFAULT_SCHEDULES); }
function saveSchedules(s) { Store.set("schedules", s); }

// Page content store
var DEFAULT_PAGES = {
  index: { title:"صفحه اصلی", h1:"ساختن سیستم رشد برای برندهایی که می‌خواهند تصمیم‌های بازاریابی دقیق‌تری بگیرند.", lead:"مشاور و مدیر بازاریابی با کارشناسی ارشد MBA از دانشگاه کارلتون کانادا و بیش از ۱۰ سال تجربه در طراحی، مدیریت و پیاده‌سازی ساختارهای دیجیتال مارکتینگ.", kicker:"معمار رشد دیجیتال", btn1Text:"درخواست مشاوره", btn1Link:"contact.html", btn2Text:"بیشتر درباره مهبد", btn2Link:"about.html", section1Title:"رویکرد کاری", section1Body:"<p>تمرکز من فقط روی کمپین یا ابزار نیست؛ مسئله اصلی ساختن معماری قابل اتکا برای جذب، تبدیل، نگهداشت و توسعه مشتری است.</p>", section2Title:"حوزه‌های مشاوره", section2Body:"استراتژی رشد دیجیتال، ساختار دیجیتال مارکتینگ، مشاوره مدیریت بازاریابی", seoTitle:"مهبد نادری | معمار رشد دیجیتال", seoDesc:"سایت شخصی مهبد نادری؛ معمار رشد دیجیتال، مشاور بازاریابی و طراح ساختارهای دیجیتال مارکتینگ.", seoKeywords:"بازاریابی دیجیتال, مشاوره, رشد دیجیتال", seoCanonical:"https://mahbodnaderi.com/index.html", image:"assets/profile-formal.jpeg", imageAlt:"پرتره رسمی مهبد نادری", imageCaption:"مشاوره، طراحی ساختار و اجرای سیستم‌های رشد دیجیتال" },
  about: { title:"درباره من", h1:"من بازاریابی را به شکل یک سیستم رشد می‌بینم؛ نه مجموعه‌ای از فعالیت‌های جدا از هم.", lead:"مهبد نادری هستم؛ معمار رشد دیجیتال، دارای کارشناسی ارشد MBA از دانشگاه کارلتون کانادا و بیش از ۱۰ سال تجربه.", kicker:"درباره من", btn1Text:"گفتگو برای همکاری", btn1Link:"contact.html", btn2Text:"بازگشت به خانه", btn2Link:"index.html", section1Title:"مسیر حرفه‌ای", section1Body:"<p>تجربه من در کنار کسب‌وکارها بر یک اصل ساده بنا شده است: رشد زمانی پایدار می‌شود که تصمیم‌های بازاریابی بر پایه داده، شناخت مشتری، ساختار اجرایی و سنجش مداوم گرفته شوند.</p>", section2Title:"ارزش‌ها", section2Body:"شفافیت، دقت و ساختن خروجی قابل اعتماد", seoTitle:"درباره مهبد نادری", seoDesc:"درباره مهبد نادری؛ معمار رشد دیجیتال، مشاور بازاریابی و فارغ‌التحصیل MBA از دانشگاه کارلتون کانادا.", seoKeywords:"مهبد نادری, معمار رشد دیجیتال, مشاور بازاریابی", seoCanonical:"https://mahbodnaderi.com/about.html", image:"assets/profile-light.jpeg", imageAlt:"پرتره مهبد نادری با کت روشن", imageCaption:"ترکیب نگاه مدیریتی، تجربه اجرایی و شناخت عمیق از رشد دیجیتال" },
  contact: { title:"تماس با من", h1:"اگر به رشد دیجیتال منظم‌تر نیاز دارید، بیایید گفتگو را شروع کنیم.", lead:"برای مشاوره، بررسی وضعیت بازاریابی، طراحی ساختار دیجیتال مارکتینگ یا هماهنگی جلسه، از مسیرهای زیر مستقیم با من در ارتباط باشید.", kicker:"درخواست مشاوره", btn1Text:"تماس با من", btn1Link:"tel:+989122147417", btn2Text:"ایمیل به من", btn2Link:"mailto:mercury700ir@gmail.com", section1Title:"فرم تماس", section1Body:"<p>جزئیات اولیه پروژه یا نیاز مشاوره را بنویسید.</p>", section2Title:"موضوعات پیشنهادی", section2Body:"ارزیابی بازاریابی فعلی، طراحی سیستم رشد، همراهی مدیریتی", seoTitle:"تماس با مهبد نادری", seoDesc:"تماس با مهبد نادری برای مشاوره رشد دیجیتال، مدیریت بازاریابی و طراحی ساختار دیجیتال مارکتینگ.", seoKeywords:"تماس, مشاوره, رشد دیجیتال", seoCanonical:"https://mahbodnaderi.com/contact.html", image:"assets/profile-suit.jpeg", imageAlt:"پرتره رسمی مهبد نادری", imageCaption:"برای شروع یک همکاری هدفمند، یک پیام کوتاه کافی است." },
  blog: { title:"نوشته‌ها", h1:"نوشته‌ها", lead:"مقالات، یادداشت‌ها و ویدئوهای آموزشی در حوزه استراتژی رشد دیجیتال و بازاریابی.", kicker:"وبلاگ", btn1Text:"", btn1Link:"", btn2Text:"", btn2Link:"", section1Title:"لیست مقالات", section1Body:"<p>مقالات و نوشته‌ها در حوزه استراتژی رشد دیجیتال و بازاریابی.</p>", section2Title:"", section2Body:"", seoTitle:"نوشته‌ها | مهبد نادری", seoDesc:"نوشته‌ها و مقالات مهبد نادری در حوزه استراتژی رشد دیجیتال، ساختار مارکتینگ و مشاوره مدیریت بازاریابی.", seoKeywords:"وبلاگ, مقالات, استراتژی رشد", seoCanonical:"https://mahbodnaderi.com/blog.html", image:"assets/profile-formal.jpeg", imageAlt:"تصویر وبلاگ", imageCaption:"مقالات و نوشته‌ها" }
};
function getPages() { return Store.get("pages", DEFAULT_PAGES); }
function savePages(pages) { Store.set("pages", pages); }

// Banner store
var DEFAULT_BANNERS = [
  { id:"b1", title:"بنر اصلی صفحه نخست", image:"assets/profile-formal.jpeg", link:"contact.html", active:true, position:"hero" },
  { id:"b2", title:"بنر درباره من", image:"assets/profile-light.jpeg", link:"about.html", active:true, position:"about" }
];
function getBanners() { return Store.get("banners", DEFAULT_BANNERS); }
function saveBanners(b) { Store.set("banners", b); }

// ────────────────── DOM Ready ──────────────────

document.addEventListener("DOMContentLoaded", function () {

  // ── Element refs ──
  var loginScreen    = document.getElementById("login-screen");
  var adminPanel     = document.getElementById("admin-panel");
  var loginForm      = document.getElementById("login-form");
  var loginError     = document.getElementById("login-error");
  var logoutBtn      = document.getElementById("logout-btn");
  var themeToggle    = document.getElementById("theme-toggle");
  var sidebar        = document.getElementById("sidebar");
  var sidebarToggle  = document.getElementById("sidebar-toggle");
  var sidebarClose   = document.getElementById("sidebar-close");
  var sidebarOverlay = document.getElementById("sidebar-overlay");
  var pageTitle      = document.getElementById("page-title");
  var sidebarLinks   = document.querySelectorAll(".sidebar-link");
  var tabPanes       = document.querySelectorAll(".tab-pane");

  // ────────── Auth ──────────
  if (localStorage.getItem("admin_auth") === "true") showAdmin();

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var u = document.getElementById("login-user").value.trim();
    var p = document.getElementById("login-pass").value.trim();
    if (u === "admin" && p === "admin") {
      localStorage.setItem("admin_auth", "true");
      showAdmin();
    } else {
      loginError.textContent = "نام کاربری یا رمز عبور اشتباه است.";
    }
  });

  logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("admin_auth");
    adminPanel.style.display = "none";
    loginScreen.style.display = "flex";
  });

  function showAdmin() {
    loginScreen.style.display = "none";
    adminPanel.style.display = "flex";
    initBlog();
    initSocial();
    initPageEditor();
    initBanners();
    initUsers();
    initGallery();
    initFiles();
    initPlugins();
    initSettings();
    convertNumbersInScope(adminPanel);
    animateCounters();
  }

  // ────────── Theme ──────────
  applyTheme(localStorage.getItem("admin_theme") || "light");
  themeToggle.addEventListener("click", function () {
    var cur = document.documentElement.getAttribute("data-theme") || "light";
    var next = cur === "light" ? "dark" : "light";
    applyTheme(next);
    localStorage.setItem("admin_theme", next);
  });

  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    var sun = themeToggle.querySelector(".icon-sun");
    var moon = themeToggle.querySelector(".icon-moon");
    var lbl = themeToggle.querySelector("span");
    sun.style.display = t === "dark" ? "none" : "block";
    moon.style.display = t === "dark" ? "block" : "none";
    lbl.textContent = t === "dark" ? "حالت روشن" : "حالت تاریک";
  }

  // ────────── Sidebar ──────────
  sidebarToggle.addEventListener("click", function () {
    sidebar.classList.add("open");
    sidebarOverlay.classList.add("active");
  });
  sidebarClose.addEventListener("click", closeSidebar);
  sidebarOverlay.addEventListener("click", closeSidebar);
  function closeSidebar() {
    sidebar.classList.remove("open");
    sidebarOverlay.classList.remove("active");
  }

  // ────────── Tab Nav ──────────
  sidebarLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      var tabId = this.getAttribute("data-tab");
      sidebarLinks.forEach(function (l) { l.classList.remove("active"); });
      this.classList.add("active");
      tabPanes.forEach(function (p) { p.classList.remove("active"); });
      var target = document.getElementById("tab-" + tabId);
      if (target) target.classList.add("active");
      pageTitle.textContent = this.querySelector("span").textContent;
      closeSidebar();
      if (target) convertNumbersInScope(target);
    });
  });

  // ────────── Sub Tabs ──────────
  document.querySelectorAll(".sub-tab").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var subtabId = this.getAttribute("data-subtab");
      var parent = this.closest(".tab-pane");
      parent.querySelectorAll(".sub-tab").forEach(function (b) { b.classList.remove("active"); });
      this.classList.add("active");
      parent.querySelectorAll(".sub-pane").forEach(function (p) { p.classList.remove("active"); });
      var t = parent.querySelector("#" + subtabId);
      if (t) t.classList.add("active");
    });
  });

  window.switchSubTab = function (tabId, subtabId) {
    var parent = document.getElementById("tab-" + tabId);
    if (!parent) return;
    parent.querySelectorAll(".sub-tab").forEach(function (b) {
      b.classList.remove("active");
      if (b.getAttribute("data-subtab") === subtabId) b.classList.add("active");
    });
    parent.querySelectorAll(".sub-pane").forEach(function (p) { p.classList.remove("active"); });
    var t = document.getElementById(subtabId);
    if (t) t.classList.add("active");
  };

  // ────────── Upload Zones ──────────
  setupUploadZone("image-upload-zone", "image-upload-input");
  setupUploadZone("video-upload-zone", "video-upload-input");
  setupUploadZone("ai-file-zone", "ai-file-input");
  setupUploadZone("file-drop-zone", "file-upload-input");
  var fileUploadBtn = document.getElementById("file-upload-btn");
  if (fileUploadBtn) fileUploadBtn.addEventListener("click", function () {
    document.getElementById("file-upload-input").click();
  });

  function setupUploadZone(zoneId, inputId) {
    var zone = document.getElementById(zoneId);
    var input = document.getElementById(inputId);
    if (!zone || !input) return;
    zone.addEventListener("click", function () { input.click(); });
    zone.addEventListener("dragover", function (e) { e.preventDefault(); zone.style.borderColor = "var(--admin-primary)"; });
    zone.addEventListener("dragleave", function () { zone.style.borderColor = ""; });
    zone.addEventListener("drop", function (e) { e.preventDefault(); zone.style.borderColor = ""; handleFiles(e.dataTransfer.files, zoneId); });
    input.addEventListener("change", function () { handleFiles(this.files, zoneId); });
  }

  function handleFiles(files, zoneId) {
    if (!files.length) return;
    if (zoneId === "ai-file-zone") {
      var n = document.getElementById("ai-file-name");
      if (n) n.textContent = files[0].name;
    }
  }

  // ────────── Modals ──────────
  window.showModal = function (id) {
    var o = document.getElementById("modal-overlay");
    o.style.display = "flex";
    o.querySelectorAll(".modal-content").forEach(function (m) { m.style.display = "none"; });
    var t = document.getElementById(id);
    if (t) t.style.display = "block";
  };
  window.hideModal = function () { document.getElementById("modal-overlay").style.display = "none"; };
  document.getElementById("modal-overlay").addEventListener("click", function (e) {
    if (e.target === this) hideModal();
  });

  // ────────── Counters ──────────
  function animateCounters() {
    document.querySelectorAll(".stat-number[data-count]").forEach(function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10);
      var dur = 1200, start = null;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        el.textContent = toPersianNumbers(String(Math.floor((1 - Math.pow(1 - p, 3)) * target)));
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  // ────────── Quill Editor ──────────
  var quill = null;
  if (typeof Quill !== "undefined" && document.getElementById("quill-editor")) {
    quill = new Quill("#quill-editor", {
      theme: "snow",
      placeholder: "محتوای پست را بنویسید...",
      direction: "rtl",
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["blockquote", "code-block"],
          ["link", "image"],
          [{ align: [] }],
          ["clean"]
        ]
      }
    });
    window.quillEditor = quill;
  }

  // ════════════════════════════════════════════════
  //  BLOG — CRUD + Persistence
  // ════════════════════════════════════════════════

  var blogPosts = getBlogPosts();
  var editingPostId = null;

  function initBlog() {
    blogPosts = getBlogPosts();
    renderBlogTable();
    document.getElementById("btn-new-post").addEventListener("click", newPost);
    document.getElementById("btn-save-draft").addEventListener("click", function () { savePost("draft"); });
    document.getElementById("btn-publish").addEventListener("click", function () { savePost("published"); });
  }

  function renderBlogTable() {
    var tbody = document.getElementById("blog-table-body");
    var empty = document.getElementById("blog-empty");
    if (!blogPosts.length) {
      tbody.innerHTML = "";
      empty.style.display = "block";
      return;
    }
    empty.style.display = "none";
    tbody.innerHTML = blogPosts.map(function (p) {
      var statusBadge = p.status === "published"
        ? '<span class="badge badge-success">منتشر</span>'
        : '<span class="badge badge-warning">پیش‌نویس</span>';
      return '<tr>' +
        '<td data-label="عنوان">' + escapeHTML(p.title) + '</td>' +
        '<td data-label="نویسنده">' + escapeHTML(p.author) + '</td>' +
        '<td data-label="تاریخ">' + persianDateShort(p.date) + '</td>' +
        '<td data-label="دسته">' + escapeHTML(p.category) + '</td>' +
        '<td data-label="وضعیت">' + statusBadge + '</td>' +
        '<td data-label="عملیات">' +
          '<button class="btn-sm btn-edit" data-id="' + p.id + '">ویرایش</button> ' +
          '<button class="btn-sm btn-danger btn-delete" data-id="' + p.id + '">حذف</button>' +
        '</td></tr>';
    }).join("");

    tbody.querySelectorAll(".btn-edit").forEach(function (btn) {
      btn.addEventListener("click", function () { editPost(this.getAttribute("data-id")); });
    });
    tbody.querySelectorAll(".btn-delete").forEach(function (btn) {
      btn.addEventListener("click", function () { deletePost(this.getAttribute("data-id")); });
    });

    convertNumbersInScope(tbody);
  }

  function newPost() {
    editingPostId = null;
    document.getElementById("edit-post-id").value = "";
    document.getElementById("editor-title").value = "";
    document.getElementById("editor-category").value = "استراتژی";
    document.getElementById("editor-content-type").value = "article";
    document.getElementById("editor-video-url").value = "";
    document.getElementById("editor-tags").value = "";
    document.getElementById("editor-author").value = "مهبد نادری";
    if (quill) quill.setText("");
    switchSubTab("blog", "blog-editor");
  }

  function editPost(id) {
    var post = blogPosts.find(function (p) { return p.id === id; });
    if (!post) return;
    editingPostId = id;
    document.getElementById("edit-post-id").value = id;
    document.getElementById("editor-title").value = post.title;
    document.getElementById("editor-category").value = post.category;
    document.getElementById("editor-content-type").value = post.contentType || "article";
    document.getElementById("editor-video-url").value = post.videoUrl || "";
    document.getElementById("editor-tags").value = post.tags || "";
    document.getElementById("editor-author").value = post.author;
    if (quill) quill.root.innerHTML = post.body || "";
    switchSubTab("blog", "blog-editor");
  }

  function deletePost(id) {
    if (!confirm("آیا از حذف این پست مطمئن هستید؟")) return;
    blogPosts = blogPosts.filter(function (p) { return p.id !== id; });
    saveBlogPosts(blogPosts);
    renderBlogTable();
  }

  function savePost(status) {
    var title = document.getElementById("editor-title").value.trim();
    if (!title) { alert("عنوان پست را وارد کنید."); return; }

    var data = {
      title: title,
      author: document.getElementById("editor-author").value.trim() || "مدیر",
      category: document.getElementById("editor-category").value,
      contentType: document.getElementById("editor-content-type").value,
      videoUrl: document.getElementById("editor-video-url").value.trim(),
      tags: document.getElementById("editor-tags").value.trim(),
      body: quill ? quill.root.innerHTML : "",
      status: status,
      date: new Date().toISOString().split("T")[0]
    };

    if (editingPostId) {
      var idx = blogPosts.findIndex(function (p) { return p.id === editingPostId; });
      if (idx !== -1) { data.id = editingPostId; blogPosts[idx] = data; }
    } else {
      data.id = uid();
      blogPosts.unshift(data);
    }

    saveBlogPosts(blogPosts);
    editingPostId = null;
    renderBlogTable();
    switchSubTab("blog", "blog-posts");
    convertNumbersInScope(document.getElementById("tab-blog"));
  }

  // ════════════════════════════════════════════════
  //  AI CONTENT GENERATOR
  // ════════════════════════════════════════════════

  // AI input tabs
  document.querySelectorAll(".ai-input-tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      document.querySelectorAll(".ai-input-tab").forEach(function (t) { t.classList.remove("active"); });
      this.classList.add("active");
      document.querySelectorAll(".ai-input-pane").forEach(function (p) { p.classList.remove("active"); });
      var t = document.getElementById(this.getAttribute("data-aitab"));
      if (t) t.classList.add("active");
    });
  });

  // AI generate
  var aiBtn = document.getElementById("ai-generate-btn");
  if (aiBtn) {
    aiBtn.addEventListener("click", function () {
      var topic = document.getElementById("ai-input-text").value.trim();
      var fileName = (document.getElementById("ai-file-name") || {}).textContent || "";
      var contentType = document.getElementById("ai-content-type").value;
      var tone = document.getElementById("ai-tone").value;

      if (!topic && !fileName) {
        alert("لطفا موضوع یا متنی وارد کنید.");
        return;
      }

      var inputTopic = topic || fileName;
      aiBtn.disabled = true;
      aiBtn.textContent = "در حال تولید...";

      setTimeout(function () {
        var result = generateAIContent(inputTopic, contentType, tone);

        document.querySelector("#ai-output-title span").textContent = result.seoTitle;
        document.querySelector("#ai-output-meta span").textContent = result.metaDesc;
        document.querySelector("#ai-output-keywords span").textContent = result.tags;
        document.getElementById("ai-output-body").innerHTML = result.body;
        document.querySelector("#ai-output-schedule span").textContent = result.schedule;

        var output = document.getElementById("ai-output");
        output.style.display = "block";

        aiBtn.disabled = false;
        aiBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> تولید محتوا';

        convertNumbersInScope(output);
      }, 2200);
    });
  }

  function generateAIContent(topic, type, tone) {
    var t = topic.replace(/[^\w\u0600-\u06FF\s]/g, "").trim() || "موضوع";
    var wc = parseInt(document.getElementById("ai-word-count").value, 10) || 800;

    // ── Persian paragraph pools by tone ──
    var P = {
      "رسمی و حرفه‌ای": {
        intro: [
          "در دنیای پرشتاب امروز، «{t}» به یکی از محوری‌ترین چالش‌های سازمان‌های پیشرو تبدیل شده است. شرکت‌هایی که در این حوزه سرمایه‌گذاری هوشمندانه می‌کنند، مزیت رقابتی پایداری به دست می‌آورند که فراتر از دوره‌های کوتاه‌مدت عمل می‌کند.",
          "موضوع «{t}» امروزه دیگر یک انتخاب لوکس نیست، بلکه یک ضرورت استراتژیک برای هر سازمانی است که می‌خواهد در فضای رقابتی بازار دوام بیاورد و رشد کند.",
          "بررسی‌های میدانی و تحقیقات بازار نشان می‌دهد که سازمان‌هایی که روی «{t}» سرمایه‌گذاری کرده‌اند، در مقایسه با رقبای خود عملکرد بهتری داشته‌اند."
        ],
        body: [
          "پیش از هر اقدامی، لازم است وضعیت فعلی سازمان به دقت ارزیابی شود. این ارزیابی شامل شناسایی نقاط قوت، ضعف‌ها، فرصت‌ها و تهدیدهای موجود است. یک تحلیل SWOT جامع می‌تواند تصویر روشنی از جایگاه کنونی ارائه دهد.",
          "یکی از مهم‌ترین مولفه‌های موفقیت در «{t}»، تعریف شاخص‌های کلیدی عملکرد (KPI) است. این شاخص‌ها باید دقیق، قابل اندازه‌گیری و مرتبط با اهداف سازمانی باشند. بدون شاخص‌های مشخص، امکان سنجش پیشرفت وجود نخواهد داشت.",
          "طراحی فرآیند اجرایی گام بعدی است. این فرآیند باید شامل تعیین نقش‌ها و مسئولیت‌ها، زمان‌بندی اجرا، منابع مورد نیاز و مکانیزم‌های گزارش‌دهی باشد. شفافیت در فرآیندها از بروز اختلافات و اتلاف منابع جلوگیری می‌کند.",
          "تیم اجرایی نقش حیاتی در موفقیت پروژه دارد. هر عضو تیم باید وظایف خود را به درستی بشناسد و با سایر اعضا هماهنگ باشد. برگزاری جلسات منظم و استفاده از ابزارهای مدیریت پروژه می‌تواند این هماهنگی را تضمین کند.",
          "استفاده از ابزارهای دیجیتال مدرن می‌تواند فرآیند «{t}» را به طرز چشمگیری بهبود بخشد. ابزارهایی مانند سیستم‌های CRM، نرم‌افزارهای مدیریت پروژه و پلتفرم‌های تحلیل داده، بخش جدایی‌ناپذیر از استراتژی موفق هستند.",
          "یکی از اشتباهات رایج در این حوزه، تمرکز صرف بر کوتاه‌مدت و غفلت از برنامه‌ریزی بلندمدت است. استراتژی‌های مؤثر باید تعادل بین نتایج فوری و رشد پایدار را حفظ کنند.",
          "بازخورد مشتریان و ذینفعان منبع ارزشمندی برای بهبود مستمر است. جمع‌آوری و تحلیل منظم بازخوردها، فرصت‌های بهبود را آشکار می‌کند و از تکرار اشتباهات جلوگیری می‌کند.",
          "مستندسازی فرآیندها و نتایج یکی از الزامات حیاتی است. اسناد دقیق و به‌روز، مبنای تصمیم‌گیری‌های آینده خواهند بود و دانش سازمانی را حفظ می‌کنند.",
          "آموزش و توانمندسازی تیم نباید نادیده گرفته شود. سرمایه‌گذاری روی دانش و مهارت‌های اعضای تیم، بازدهی بلندمدت قابل توجهی به همراه دارد.",
          "ارزیابی دوره‌ای و بازنگری در استراتژی‌ها ضروری است. بازارها و شرایط دائماً در حال تغییر هستند و استراتژی‌ها باید انعطاف‌پذیری لازم برای تطبیق با تغییرات را داشته باشند."
        ],
        conclusion: [
          "در نهایت، موفقیت در «{t}» نتیجه ترکیب برنامه‌ریزی دقیق، اجرای منظم و نظارت مستمر است. سازمان‌هایی که این اصول را رعایت می‌کنند، می‌توانند به نتایج قابل توجه و پایداری دست یابند.",
          "نتیجه‌گیری آنکه «{t}» فرآیندی مستمر و تکرارپذیر است. با پایبندی به اصول علمی و بهره‌گیری از تجربه متخصصان، می‌توان از این مسیر به موفقیت‌های چشمگیری دست یافت."
        ],
        quote: "سازمان‌هایی که «{t}» را به عنوان یک فرآیند استراتژیک مدیریت می‌کنند، نه تنها در کوتاه‌مدت نتیجه می‌گیرند، بلکه بنیان رشد بلندمدت خود را مستحکم می‌کنند."
      },
      "آموزشی": {
        intro: [
          "اگر تا به حال با خود فکر کرده‌اید که «{t}» دقیقاً چیست و چگونه می‌توان از آن استفاده کرد، این مقاله برای شما نوشته شده است. در ادامه، قدم به قدم با مفاهیم پایه‌ای و کاربردهای عملی آن آشنا می‌شویم.",
          "«{t}» موضوعی است که بسیاری درباره آن صحبت می‌کنند اما کمتر کسی تعریف دقیقی از آن ارائه می‌دهد. در این مقاله سعی می‌کنیم به زبان ساده و با مثال‌های واقعی، این مفهوم را برای شما شفاف کنیم."
        ],
        body: [
          "گام اول: شناخت مبانی. قبل از هر چیزی باید با مفاهیم پایه‌ای «{t}» آشنا شوید. این مفاهیم شامل تعاریف، اصطلاحات تخصصی و چارچوب‌های نظری می‌شود. درک صحیح مبانی، پایه و اساس یادگیری عمیق‌تر را فراهم می‌کند.",
          "گام دوم: ابزارها و منابع. پس از آشنایی با مبانی، نوبت به شناخت ابزارها و منابع می‌رسد. انتخاب ابزار مناسب تأثیر مستقیمی بر کیفیت کار شما دارد. ابزارهای رایگان و پولی متعددی وجود دارند که هر کدام مزایا و محدودیت‌های خاص خود را دارند.",
          "گام سوم: تمرین عملی. بهترین راه یادگیری، انجام کار عملی است. با پروژه‌های کوچک شروع کنید و به تدریج پیچیدگی آن‌ها را افزایش دهید. از اشتباهات خود درس بگیرید و هر تجربه را فرصتی برای رشد بدانید.",
          "گام چهارم: یادگیری مداوم. دنیای «{t}» دائماً در حال تغییر و تحول است. برای حفظ جایگاه خود، باید به‌طور مستمر اطلاعات خود را به‌روز کنید. مطالعه مقالات تخصصی، شرکت در دوره‌ها و تعامل با متخصصان این حوزه توصیه می‌شود.",
          "نکته مهم: صبر و پشتکار کلید موفقیت است. یادگیری «{t}» یک شبه اتفاق نمی‌افتد. به خودتان زمان بدهید و از مقایسه خود با دیگران پرهیز کنید.",
          "منابع پیشنهادی: کتاب‌های تخصصی، وبسایت‌های آموزشی معتبر، پادکست‌های حوزه مربوطه و دوره‌های آنلاین از جمله منابعی هستند که می‌توانند مسیر یادگیری شما را هموارتر کنند."
        ],
        conclusion: [
          "با پیمودن این چهار گام، شما پایه‌های محکمی در «{t}» خواهید داشت. به یاد داشته باشید که یادگیری یک سفر است، نه یک مقصد. هر قدم کوچک شما را به هدف نزدیک‌تر می‌کند."
        ],
        quote: "یادگیری «{t}» مثل یادگیری یک زبان جدید است: ابتدا کلمات را یاد می‌گیرید، سپس جمله می‌سازید و در نهایت می‌توانید داستان خود را بنویسید."
      },
      "صمیمی": {
        intro: [
          "سلام! خوشحالم که اینجایید. امروز می‌خواهیم راجع به «{t}» خیلی ساده و صمیمی حرف بزنیم. نگران نباشید، قرار نیست از اصطلاحات پیچیده استفاده کنم!",
          "بیایید یه موضوع جالب رو با هم بررسی کنیم: «{t}». شاید فکر کنید خیلی پیچیده‌ست، ولی باور کنید اگه قدم به قدم پیش بریم، خیلی راحت متوجه می‌شید."
        ],
        body: [
          "اول از همه بذارید بگم اصلاً چرا باید به «{t}» اهمیت بدیم؟ خیلی ساده‌ست: چون تو دنیای امروز، کسب‌وکارهایی که این مسئله رو جدی می‌گیرن، جلوتر از بقیه هستن.",
          "یه مثال واقعی بزنم: فرض کنید دارید یه مغازه باز می‌کنید. بدون برنامه‌ریزی، بدون تحقیق بازار، بدون شناخت مشتری‌ها... چه اتفاقی می‌افته؟ احتمالاً بعد از چند ماه مجبور می‌شید در رو ببندید.",
          "حالا فرض کنید همین کار رو با یه نقشه راه مشخص انجام بدید. اول تحقیق کنید، بعد برنامه‌ریزی کنید، کم‌کم شروع کنید و بر اساس بازخورد مشتری‌ها اصلاح کنید. خیلی فرق داره، نه؟",
          "یه نکته خیلی مهم که خیلی‌ها ازش غافل می‌شن: عجله نکنید! موفقیت یه شبه اتفاق نمی‌افته. قدم‌های کوچک بردارید، از اشتباهاتتون درس بگیرید و به راهتون ادامه بدید.",
          "ابزارهای زیادی هستن که می‌تونن کمکتون کنن. لازم نیست همه رو بلد باشید، کافیه چند تا ابزار خوب رو بشناسید و درست ازشون استفاده کنید.",
          "یه چیز دیگه: از تجربه بقیه استفاده کنید. لازم نیست همه چیز رو از صفر یاد بگیرید. کتاب‌ها، مقالات و تجربه متخصصان این حوزه می‌تونه خیلی کمکتون کنه."
        ],
        conclusion: [
          "خب، رسیدیم به آخر مقاله! امیدوارم اطلاعات مفیدی گرفته باشید. یادتون باشه مهم‌ترین قدم، همین الان شروع کردن‌ه. منتظر «زمان مناسب» نمونید، همین امروز اولین قدم رو بردارید!"
        ],
        quote: "بزرگ‌ترین اشتباهی که آدم‌ها می‌کنن؟ منتظر موندن برای «زمان مناسب». همین الان شروع کنید، حتی اگه کوچیک باشه!"
      },
      "تبلیغاتی": {
        intro: [
          "آیا آماده‌اید تحولی اساسی در کسب‌وکار خود ایجاد کنید؟ «{t}» دیگر یک گزینه لوکس نیست، بلکه کلید بقا و رشد در بازار رقابتی امروز است.",
          "رقبای شما همین الان در حال سرمایه‌گذاری روی «{t}» هستند. هر روزی که می‌گذرد، فاصله بین شما و آن‌ها بیشتر می‌شود. سؤال این است: آیا حاضرید این فرصت را از دست بدهید؟"
        ],
        body: [
          "دلیل اول: رشد سریع و قابل اندازه‌گیری. سازمان‌هایی که «{t}» را به درستی پیاده‌سازی می‌کنند، در کوتاه‌مدت شاهد افزایش چشمگیر عملکرد خود هستند. نتایج قابل لمس و قابل سنجش هستند.",
          "دلیل دوم: بازگشت سرمایه بالا. برخلاف تصور بسیاری، سرمایه‌گذاری روی «{t}» هزینه نیست، بلکه سرمایه‌گذاری است. آمارها نشان می‌دهد بازگشت سرمایه در این حوزه بسیار بالاتر از بسیاری از حوزه‌های دیگر است.",
          "دلیل سوم: مزیت رقابتی پایدار. در بازاری که همه در حال رقابت هستند، «{t}» می‌تواند تمایز شما از رقبا را تضمین کند. این مزیت به مرور زمان تقویت می‌شود.",
          "دلیل چهارم: انعطاف‌پذیری سازمانی. «{t}» به سازمان شما توانایی تطبیق سریع با تغییرات بازار را می‌دهد. در دنیایی که همه چیز در حال تغییر است، این انعطاف‌پذیری حیاتی است.",
          "دلیل پنجم: آینده‌پژوهی. سرمایه‌گذاری روی «{t}» آمادگی شما برای ترندهای آینده را تضمین می‌کند. سازمان‌هایی که امروز برای فردا برنامه‌ریزی می‌کنند، فردا پیروز میدان خواهند بود."
        ],
        conclusion: [
          "هر روز تأخیر، فرصتی از دست رفته است. همین الان اقدام کنید و اولین قدم را بردارید. ما اینجاییم تا در این مسیر همراه شما باشیم."
        ],
        quote: "در بازار امروز، برنده کسی است که زودتر اقدام می‌کند، نه کسی که بیشتر منتظر می‌ماند."
      }
    };

    var toneKey = tone in P ? tone : "رسمی و حرفه‌ای";
    var pool = P[toneKey];

    // ── Helpers ──
    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
    function fill(s) { return s.replace(/\{t\}/g, t); }
    function wordCount(s) { return s.replace(/<[^>]+>/g, "").trim().split(/\s+/).length; }

    // ── Build article structure ──
    var titleMap = {
      "رسمی و حرفه‌ای": "بررسی جامع «{t}»: راهکارها و استراتژی‌های کلیدی",
      "آموزشی": "آموزش گام‌به‌گام «{t}» از صفر تا صد",
      "صمیمی": "«{t}» به زبان ساده: راهنمای کاربردی برای همه",
      "تبلیغاتی": "«{t}»: چرا باید همین الان شروع کنید؟"
    };

    var seoTitle = fill(titleMap[toneKey] || titleMap["رسمی و حرفه‌ای"]);
    var metaDesc = "مقاله جامع درباره " + t + " با رویکرد " + tone + ". راهکارها و استراتژی‌های عملی برای رشد کسب‌وکار. " + t + " یکی از مهم‌ترین موضوعات روز است.";
    var tags = t + ", بازاریابی دیجیتال, رشد دیجیتال, استراتژی, " + t + " آموزش";

    // ── Generate body matching word count ──
    var paragraphs = [];
    var currentWords = 0;

    // Introduction (1-2 paragraphs)
    paragraphs.push("<p>" + fill(pick(pool.intro)) + "</p>");
    currentWords += wordCount(paragraphs[0]);

    if (currentWords < wc * 0.15) {
      paragraphs.push("<p>" + fill(pick(pool.intro)) + "</p>");
      currentWords += wordCount(paragraphs[1]);
    }

    // Image placeholder
    paragraphs.push('<figure style="margin:24px 0;text-align:center"><div style="background:linear-gradient(135deg,rgba(36,80,122,0.08),rgba(15,118,110,0.06));padding:60px 20px;border-radius:12px;border:1px dashed rgba(23,26,31,0.15)"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9aa0a8" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg><p style="color:#9aa0a8;font-size:0.85rem;margin:10px 0 0">تصویر مرتبط با ' + t + '</p></div><figcaption style="color:var(--muted);font-size:0.82rem;margin-top:8px">شکل ۱: نمای کلی ' + t + '</figcaption></figure>');

    // Body sections with headings
    var usedBody = [];
    while (currentWords < wc * 0.85 && pool.body.length > 0) {
      var idx = Math.floor(Math.random() * pool.body.length);
      var para = pool.body.splice(idx, 1)[0];
      usedBody.push(para);
      var filled = fill(para);
      paragraphs.push("<p>" + filled + "</p>");
      currentWords += wordCount(filled);

      // Add subheading every ~200 words
      if (currentWords > 200 && currentWords % 200 < 40 && pool.body.length > 0) {
        var nextPara = fill(pick(pool.body));
        var headingWords = nextPara.split(/[.:،]/)[0];
        paragraphs.push("<h3>" + headingWords + "</h3>");
      }
    }

    // Blockquote
    if (pool.quote) {
      paragraphs.push('<blockquote style="border-right:4px solid var(--gold);padding:16px 20px;margin:28px 0;background:rgba(194,139,56,0.05);border-radius:0 8px 8px 0;font-style:italic;color:var(--muted)"><p>' + fill(pool.quote) + '</p></blockquote>');
    }

    // List section
    if (toneKey === "آموزشی" || toneKey === "رسمی و حرفه‌ای") {
      paragraphs.push("<h3>نکات کلیدی برای به خاطر سپاردن</h3>");
      paragraphs.push("<ul style='padding-right:24px;line-height:2.2'>");
      var listItems = [
        "شناخت دقیق وضعیت فعلی پیش از هر اقدامی ضروری است",
        "تعریف شاخص‌های کلیدی عملکرد (KPI) را فراموش نکنید",
        "برنامه‌ریزی بلندمدت در کنار نتایج کوتاه‌مدت",
        "آموزش مستمر تیم و به‌روزرسانی دانش",
        "ارزیابی و بازنگری دوره‌ای استراتژی‌ها"
      ];
      listItems.forEach(function(item) {
        paragraphs.push("<li>" + item + "</li>");
        currentWords += 12;
      });
      paragraphs.push("</ul>");
    }

    // Conclusion
    paragraphs.push("<h2>جمع‌بندی</h2>");
    paragraphs.push("<p>" + fill(pick(pool.conclusion)) + "</p>");

    var body = paragraphs.join("\n");

    var now = new Date();
    now.setDate(now.getDate() + 1);
    now.setHours(10, 0, 0, 0);
    var schedStr = "پیشنهاد: انتشار در " + now.toLocaleDateString("fa-IR") + " ساعت " + toPersianNumbers("10:00") + " (صبح زود)";

    return { seoTitle: seoTitle, metaDesc: metaDesc, tags: tags, body: body, schedule: schedStr };
  }

  // Copy AI output
  document.getElementById("btn-copy-ai").addEventListener("click", function () {
    var body = document.getElementById("ai-output-body");
    if (body && navigator.clipboard) {
      navigator.clipboard.writeText(body.textContent).then(function () { alert("محتوا کپی شد."); });
    }
  });

  // Use AI in editor
  document.getElementById("btn-use-ai").addEventListener("click", function () {
    var title = document.querySelector("#ai-output-title span").textContent;
    var body = document.getElementById("ai-output-body").innerHTML;
    document.getElementById("editor-title").value = title;
    if (quill) quill.root.innerHTML = body;
    switchSubTab("blog", "blog-editor");
  });

  // Save AI as new post
  document.getElementById("btn-save-ai-as-post").addEventListener("click", function () {
    var title = document.querySelector("#ai-output-title span").textContent;
    var body = document.getElementById("ai-output-body").innerHTML;
    var tags = document.querySelector("#ai-output-keywords span").textContent;
    var newP = {
      id: uid(),
      title: title,
      author: "مهبد نادری",
      date: new Date().toISOString().split("T")[0],
      category: document.getElementById("ai-content-type").value === "مقاله وبلاگ" ? "استراتژی" : "مشاوره",
      tags: tags,
      status: "draft",
      body: body
    };
    blogPosts.unshift(newP);
    saveBlogPosts(blogPosts);
    renderBlogTable();
    alert("پست با موفقیت ذخیره شد (پیش‌نویس).");
  });

  // ════════════════════════════════════════════════
  //  SOCIAL — Connect/Disconnect + Schedule
  // ════════════════════════════════════════════════

  var socialData = getSocial();
  var schedules = getSchedules();

  function initSocial() {
    socialData = getSocial();
    schedules = getSchedules();
    renderSocialGrid();
    renderScheduleForm();
    renderScheduleTable();
    document.getElementById("btn-schedule-post").addEventListener("click", createSchedule);
    startScheduleChecker();
  }

  function renderSocialGrid() {
    var grid = document.getElementById("social-grid");
    grid.innerHTML = socialData.map(function (s) {
      var badge = s.connected
        ? '<span class="badge badge-success">متصل</span>'
        : '<span class="badge badge-secondary">غیر متصل</span>';
      var handle = s.connected && s.handle ? '<p class="social-handle">' + escapeHTML(s.handle) + '</p>' : "";
      var btn = s.connected
        ? '<button class="btn-sm btn-disconnect" data-id="' + s.id + '">قطع اتصال</button>'
        : '<button class="btn-sm btn-primary btn-connect" data-id="' + s.id + '">اتصال</button>';
      return '<div class="social-card" data-platform="' + s.id + '">' +
        '<div class="social-icon" style="background:' + s.color + '">' + s.abbr + '</div>' +
        '<h4>' + escapeHTML(s.name) + '</h4>' + badge + handle + btn + '</div>';
    }).join("");

    grid.querySelectorAll(".btn-connect").forEach(function (btn) {
      btn.addEventListener("click", function () { connectPlatform(this.getAttribute("data-id")); });
    });
    grid.querySelectorAll(".btn-disconnect").forEach(function (btn) {
      btn.addEventListener("click", function () { disconnectPlatform(this.getAttribute("data-id")); });
    });
  }

  function connectPlatform(id) {
    var handle = prompt("نام کاربری " + id + " را وارد کنید:");
    if (!handle) return;
    var s = socialData.find(function (x) { return x.id === id; });
    if (s) { s.connected = true; s.handle = handle; }
    saveSocial(socialData);
    renderSocialGrid();
    renderScheduleForm();
    convertNumbersInScope(document.getElementById("tab-social"));
  }

  function disconnectPlatform(id) {
    if (!confirm("آیا از قطع اتصال مطمئن هستید؟")) return;
    var s = socialData.find(function (x) { return x.id === id; });
    if (s) { s.connected = false; s.handle = ""; }
    saveSocial(socialData);
    renderSocialGrid();
    renderScheduleForm();
  }

  function renderScheduleForm() {
    // Populate post select
    var sel = document.getElementById("schedule-post-select");
    var published = blogPosts.filter(function (p) { return p.status === "published"; });
    sel.innerHTML = '<option value="">انتخاب کنید...</option>' +
      published.map(function (p) { return '<option value="' + p.id + '">' + escapeHTML(p.title) + '</option>'; }).join("");

    // Populate connected platforms
    var plats = document.getElementById("schedule-platforms");
    var connected = socialData.filter(function (s) { return s.connected; });
    plats.innerHTML = connected.map(function (s) {
      return '<label><input type="checkbox" value="' + s.id + '" checked /> ' + escapeHTML(s.name) + '</label>';
    }).join("");
  }

  function createSchedule() {
    var postId = document.getElementById("schedule-post-select").value;
    if (!postId) { alert("یک پست انتخاب کنید."); return; }

    var platformChecks = document.querySelectorAll("#schedule-platforms input[type=checkbox]:checked");
    var platforms = Array.from(platformChecks).map(function (c) { return c.value; });
    if (!platforms.length) { alert("حداقل یک شبکه انتخاب کنید."); return; }

    var dt = document.getElementById("schedule-datetime").value;
    if (!dt) { alert("زمان انتشار را مشخص کنید."); return; }

    var post = blogPosts.find(function (p) { return p.id === postId; });
    var msg = document.getElementById("schedule-message").value.trim();

    var sched = {
      id: uid(),
      postId: postId,
      postTitle: post ? post.title : "پست",
      platforms: platforms,
      datetime: new Date(dt).toISOString(),
      message: msg,
      status: "scheduled",
      createdAt: nowISO()
    };

    schedules.push(sched);
    saveSchedules(schedules);
    renderScheduleTable();

    document.getElementById("schedule-post-select").value = "";
    document.getElementById("schedule-message").value = "";
    document.getElementById("schedule-datetime").value = "";

    alert("زمان‌بندی با موفقیت ثبت شد.");
    convertNumbersInScope(document.getElementById("tab-social"));
  }

  function renderScheduleTable() {
    var tbody = document.getElementById("schedule-table-body");
    var empty = document.getElementById("schedule-empty");
    if (!schedules.length) {
      tbody.innerHTML = "";
      empty.style.display = "block";
      return;
    }
    empty.style.display = "none";

    tbody.innerHTML = schedules.map(function (s) {
      var statusMap = {
        scheduled: '<span class="badge badge-info">برنامه‌ریزی شده</span>',
        published: '<span class="badge badge-success">منتشر شده</span>',
        cancelled: '<span class="badge badge-secondary">لغو شده</span>'
      };
      var platNames = s.platforms.map(function (pid) {
        var sData = socialData.find(function (x) { return x.id === pid; });
        return sData ? sData.name : pid;
      }).join("، ");

      var actions = "";
      if (s.status === "scheduled") {
        actions = '<button class="btn-sm btn-cancel-sched" data-id="' + s.id + '">لغو</button>' +
                  '<button class="btn-sm btn-publish-now" data-id="' + s.id + '">انتشار فوری</button>';
      }

      return '<tr>' +
        '<td>' + escapeHTML(s.postTitle) + '</td>' +
        '<td>' + escapeHTML(platNames) + '</td>' +
        '<td>' + persianDateTimeShort(s.datetime) + '</td>' +
        '<td>' + (statusMap[s.status] || s.status) + '</td>' +
        '<td>' + actions + '</td></tr>';
    }).join("");

    tbody.querySelectorAll(".btn-cancel-sched").forEach(function (btn) {
      btn.addEventListener("click", function () { cancelSchedule(this.getAttribute("data-id")); });
    });
    tbody.querySelectorAll(".btn-publish-now").forEach(function (btn) {
      btn.addEventListener("click", function () { publishNow(this.getAttribute("data-id")); });
    });

    convertNumbersInScope(tbody);
  }

  function cancelSchedule(id) {
    var s = schedules.find(function (x) { return x.id === id; });
    if (s) s.status = "cancelled";
    saveSchedules(schedules);
    renderScheduleTable();
  }

  function publishNow(id) {
    var s = schedules.find(function (x) { return x.id === id; });
    if (!s) return;
    s.status = "published";
    saveSchedules(schedules);
    renderScheduleTable();
    alert("پست «" + s.postTitle + "» در شبکه‌های انتخابی منتشر شد (شبیه‌سازی).");
  }

  // Auto-check scheduled posts
  function startScheduleChecker() {
    setInterval(function () {
      var now = Date.now();
      var changed = false;
      schedules.forEach(function (s) {
        if (s.status === "scheduled" && new Date(s.datetime).getTime() <= now) {
          s.status = "published";
          changed = true;
        }
      });
      if (changed) {
        saveSchedules(schedules);
        renderScheduleTable();
      }
    }, 30000);
  }

  // ════════════════════════════════════════════════
  //  PAGE EDITOR — Elementor-like
  // ════════════════════════════════════════════════

  var pages = getPages();
  var editingPage = null;
  var pageBodyQuill = null;

  function initPageEditor() {
    pages = getPages();

    // Section toggle
    document.querySelectorAll(".btn-toggle-section").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var target = document.getElementById(this.getAttribute("data-target"));
        if (target) {
          var isOpen = target.style.display !== "none";
          target.style.display = isOpen ? "none" : "block";
          this.textContent = isOpen ? "ویرایش" : "بستن";
        }
      });
    });

    // Back to pages list
    document.getElementById("btn-back-pages").addEventListener("click", function () {
      document.getElementById("content-pages").classList.add("active");
      document.getElementById("content-editor").classList.remove("active");
      editingPage = null;
    });

    // Save page
    document.getElementById("btn-save-page").addEventListener("click", function () {
      if (!editingPage) return;
      var p = pages[editingPage];
      if (!p) return;
      p.h1 = document.getElementById("page-h1").value;
      p.lead = document.getElementById("page-lead").value;
      p.kicker = document.getElementById("page-kicker").value;
      p.btn1Text = document.getElementById("page-btn1-text").value;
      p.btn1Link = document.getElementById("page-btn1-link").value;
      p.btn2Text = document.getElementById("page-btn2-text").value;
      p.btn2Link = document.getElementById("page-btn2-link").value;
      p.section1Title = document.getElementById("page-section1-title").value;
      p.section1Body = pageBodyQuill ? pageBodyQuill.root.innerHTML : document.getElementById("page-section1-body").value;
      p.section2Title = document.getElementById("page-section2-title").value;
      p.section2Body = document.getElementById("page-section2-body").value;
      p.seoTitle = document.getElementById("page-seo-title").value;
      p.seoDesc = document.getElementById("page-seo-desc").value;
      p.seoKeywords = document.getElementById("page-seo-keywords").value;
      p.seoCanonical = document.getElementById("page-seo-canonical").value;
      p.image = document.getElementById("page-image").value;
      p.imageAlt = document.getElementById("page-image-alt").value;
      p.imageCaption = document.getElementById("page-image-caption").value;
      savePages(pages);
      alert("تغییرات صفحه ذخیره شد.");
    });

    // Edit page buttons
    document.querySelectorAll(".btn-edit-page").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var pageKey = this.getAttribute("data-page");
        openPageEditor(pageKey);
      });
    });

    // New page
    document.getElementById("btn-new-page").addEventListener("click", function () {
      var name = prompt("نام صفحه جدید (انگلیسی، مثلاً services):");
      if (!name) return;
      name = name.toLowerCase().replace(/[^a-z0-9-]/g, "");
      if (pages[name]) { alert("این نام قبلاً استفاده شده."); return; }
      pages[name] = { title: name, h1: "", lead: "", kicker: "", btn1Text: "", btn1Link: "", btn2Text: "", btn2Link: "", section1Title: "", section1Body: "", section2Title: "", section2Body: "", seoTitle: "", seoDesc: "", seoKeywords: "", seoCanonical: "", image: "", imageAlt: "", imageCaption: "" };
      savePages(pages);
      openPageEditor(name);
    });

    // Init Quill for page body
    if (typeof Quill !== "undefined" && document.getElementById("page-body-editor")) {
      pageBodyQuill = new Quill("#page-body-editor", {
        theme: "snow",
        placeholder: "محتوای بخش اصلی...",
        direction: "rtl",
        modules: {
          toolbar: [
            [{ header: [2, 3, false] }],
            ["bold", "italic", "underline"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["blockquote", "link", "image"],
            ["clean"]
          ]
        }
      });
    }
  }

  function openPageEditor(key) {
    editingPage = key;
    var p = pages[key];
    if (!p) return;

    document.getElementById("editor-page-title").textContent = "ویرایش: " + (p.title || key);
    document.getElementById("page-h1").value = p.h1 || "";
    document.getElementById("page-lead").value = p.lead || "";
    document.getElementById("page-kicker").value = p.kicker || "";
    document.getElementById("page-btn1-text").value = p.btn1Text || "";
    document.getElementById("page-btn1-link").value = p.btn1Link || "";
    document.getElementById("page-btn2-text").value = p.btn2Text || "";
    document.getElementById("page-btn2-link").value = p.btn2Link || "";
    document.getElementById("page-section1-title").value = p.section1Title || "";
    if (pageBodyQuill) pageBodyQuill.root.innerHTML = p.section1Body || "";
    document.getElementById("page-section2-title").value = p.section2Title || "";
    document.getElementById("page-section2-body").value = p.section2Body || "";
    document.getElementById("page-seo-title").value = p.seoTitle || "";
    document.getElementById("page-seo-desc").value = p.seoDesc || "";
    document.getElementById("page-seo-keywords").value = p.seoKeywords || "";
    document.getElementById("page-seo-canonical").value = p.seoCanonical || "";
    document.getElementById("page-image").value = p.image || "";
    document.getElementById("page-image-alt").value = p.imageAlt || "";
    document.getElementById("page-image-caption").value = p.imageCaption || "";

    // Open first section by default
    document.querySelectorAll(".editor-section-body").forEach(function (b) { b.style.display = "none"; });
    document.querySelectorAll(".btn-toggle-section").forEach(function (b) { b.textContent = "ویرایش"; });
    var first = document.getElementById("hero-content");
    if (first) { first.style.display = "block"; }
    var firstBtn = document.querySelector('[data-target="hero-content"]');
    if (firstBtn) firstBtn.textContent = "بستن";

    document.getElementById("content-pages").classList.remove("active");
    document.getElementById("content-editor").classList.add("active");
  }

  // ════════════════════════════════════════════════
  //  BANNERS — Management
  // ════════════════════════════════════════════════

  var banners = getBanners();

  function initBanners() {
    banners = getBanners();
    renderBanners();

    document.getElementById("btn-new-banner").addEventListener("click", function () {
      var title = prompt("عنوان بنر جدید:");
      if (!title) return;
      var newB = { id: uid(), title: title, image: "", link: "", active: true, position: "custom" };
      banners.push(newB);
      saveBanners(banners);
      renderBanners();
    });
  }

  function renderBanners() {
    var grid = document.getElementById("banners-grid");
    var empty = document.getElementById("banners-empty");
    if (!banners.length) { grid.innerHTML = ""; empty.style.display = "block"; return; }
    empty.style.display = "none";

    grid.innerHTML = banners.map(function (b) {
      var imgTag = b.image
        ? '<img src="' + b.image + '" alt="' + escapeHTML(b.title) + '" style="width:100%;height:100%;object-fit:cover" />'
        : '<div class="banner-preview">بدون تصویر</div>';
      var statusBadge = b.active
        ? '<span class="badge badge-success">فعال</span>'
        : '<span class="badge badge-secondary">غیرفعال</span>';
      return '<div class="banner-card" data-id="' + b.id + '">' +
        '<div style="aspect-ratio:16/7;overflow:hidden">' + imgTag + '</div>' +
        '<div class="banner-info"><h4>' + escapeHTML(b.title) + '</h4><p>' + statusBadge + ' — ' + escapeHTML(b.position || "custom") + '</p></div>' +
        '<div class="banner-actions">' +
          '<button class="btn-sm btn-edit-banner" data-id="' + b.id + '">ویرایش</button>' +
          '<button class="btn-sm btn-toggle-banner" data-id="' + b.id + '">' + (b.active ? 'غیرفعال' : 'فعال') + '</button>' +
          '<button class="btn-sm btn-danger btn-delete-banner" data-id="' + b.id + '">حذف</button>' +
        '</div></div>';
    }).join("");

    grid.querySelectorAll(".btn-edit-banner").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = this.getAttribute("data-id");
        var b = banners.find(function (x) { return x.id === id; });
        if (!b) return;
        var newTitle = prompt("عنوان بنر:", b.title);
        if (newTitle !== null) b.title = newTitle;
        var newImage = prompt("آدرس تصویر:", b.image);
        if (newImage !== null) b.image = newImage;
        var newLink = prompt("لینک:", b.link);
        if (newLink !== null) b.link = newLink;
        saveBanners(banners);
        renderBanners();
      });
    });

    grid.querySelectorAll(".btn-toggle-banner").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = this.getAttribute("data-id");
        var b = banners.find(function (x) { return x.id === id; });
        if (b) { b.active = !b.active; saveBanners(banners); renderBanners(); }
      });
    });

    grid.querySelectorAll(".btn-delete-banner").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (!confirm("آیا از حذف این بنر مطمئن هستید؟")) return;
        var id = this.getAttribute("data-id");
        banners = banners.filter(function (x) { return x.id !== id; });
        saveBanners(banners);
        renderBanners();
      });
    });
  }

  // ════════════════════════════════════════════════
  //  USERS — Dynamic from localStorage
  // ════════════════════════════════════════════════

  function initUsers() {
    renderAdminUsersTable();
    renderMembersTable();

    document.getElementById("btn-new-admin-user").addEventListener("click", function () {
      showModal("new-admin-user-modal");
    });

    document.getElementById("btn-save-admin-user").addEventListener("click", function () {
      var name = document.getElementById("modal-admin-name").value.trim();
      var email = document.getElementById("modal-admin-email").value.trim().toLowerCase();
      var phone = document.getElementById("modal-admin-phone").value.trim();
      var role = document.getElementById("modal-admin-role").value;
      var pass = document.getElementById("modal-admin-pass").value;
      if (!name || !email || !pass) { alert("لطفاً فیلدهای ضروری را پر کنید."); return; }
      if (pass.length < 6) { alert("رمز باید حداقل ۶ کاراکتر باشد."); return; }

      var admins = JSON.parse(localStorage.getItem("admin_users") || "[]");
      if (admins.find(function (u) { return u.email === email; })) { alert("این ایمیل قبلاً ثبت شده."); return; }

      admins.push({ name: name, email: email, phone: phone, role: role, password: pass, date: new Date().toISOString() });
      localStorage.setItem("admin_users", JSON.stringify(admins));
      hideModal();
      renderAdminUsersTable();
      alert("مدیر «" + name + "» اضافه شد.");
    });
  }

  function getAdminUsers() {
    var defaults = [
      { name: "مدیر سایت", email: "admin@example.com", phone: "09121234567", role: "admin", password: "admin", date: "2024-01-01T00:00:00.000Z" }
    ];
    try {
      var stored = JSON.parse(localStorage.getItem("admin_users") || "[]");
      var all = defaults.concat(stored);
      var seen = {};
      return all.filter(function (u) { if (seen[u.email]) return false; seen[u.email] = true; return true; });
    } catch (e) { return defaults; }
  }

  function renderAdminUsersTable() {
    var users = getAdminUsers();
    var tbody = document.getElementById("admin-users-table-body");
    var empty = document.getElementById("admin-users-empty");
    if (!users.length) { tbody.innerHTML = ""; empty.style.display = "block"; return; }
    empty.style.display = "none";
    tbody.innerHTML = users.map(function (u, i) {
      var roleBadge = u.role === "admin" ? '<span class="badge badge-primary">مدیر سایت</span>' : '<span class="badge badge-info">مدیر محتوا</span>';
      return '<tr>' +
        '<td data-label="نام">' + escapeHTML(u.name) + '</td>' +
        '<td data-label="ایمیل">' + escapeHTML(u.email) + '</td>' +
        '<td data-label="شماره">' + escapeHTML(u.phone || "—") + '</td>' +
        '<td data-label="نقش">' + roleBadge + '</td>' +
        '<td data-label="عملیات">' +
          '<button class="btn-sm btn-edit-admin" data-idx="' + i + '">تغییر رمز</button> ' +
          '<button class="btn-sm btn-danger btn-delete-admin" data-email="' + escapeHTML(u.email) + '">حذف</button>' +
        '</td></tr>';
    }).join("");

    tbody.querySelectorAll(".btn-edit-admin").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var idx = parseInt(this.getAttribute("data-idx"));
        var u = users[idx];
        if (!u) return;
        var newPass = prompt("رمز جدید برای " + u.name + ":", "");
        if (newPass && newPass.length >= 6) {
          var stored = JSON.parse(localStorage.getItem("admin_users") || "[]");
          var su = stored.find(function (x) { return x.email === u.email; });
          if (su) { su.password = newPass; localStorage.setItem("admin_users", JSON.stringify(stored)); }
          else if (u.email === "admin@example.com") { alert("رمز مدیر پیش‌فرض تغییر کرد (فقط در حافظه)."); }
          alert("رمز عبور تغییر کرد.");
        } else if (newPass !== null) { alert("رمز باید حداقل ۶ کاراکتر باشد."); }
      });
    });

    tbody.querySelectorAll(".btn-delete-admin").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var email = this.getAttribute("data-email");
        if (email === "admin@example.com") { alert("مدیر پیش‌فرض قابل حذف نیست."); return; }
        if (!confirm("آیا از حذف مدیر مطمئن هستید؟")) return;
        var stored = JSON.parse(localStorage.getItem("admin_users") || "[]");
        stored = stored.filter(function (u) { return u.email !== email; });
        localStorage.setItem("admin_users", JSON.stringify(stored));
        renderAdminUsersTable();
      });
    });

    convertNumbersInScope(tbody);
  }

  function renderMembersTable() {
    var members = JSON.parse(localStorage.getItem("site_users") || "[]");
    var tbody = document.getElementById("members-table-body");
    var empty = document.getElementById("members-empty");
    if (!members.length) { tbody.innerHTML = ""; empty.style.display = "block"; return; }
    empty.style.display = "none";
    tbody.innerHTML = members.map(function (u, i) {
      var nlCheck = u.newsletter ? '<span style="color:var(--admin-success)">✓</span>' : '<span style="color:var(--admin-text-muted)">—</span>';
      return '<tr>' +
        '<td data-label="نام">' + escapeHTML(u.name) + '</td>' +
        '<td data-label="ایمیل">' + escapeHTML(u.email) + '</td>' +
        '<td data-label="شماره">' + escapeHTML(u.phone || "—") + '</td>' +
        '<td data-label="تاریخ">' + persianDateShort(u.date) + '</td>' +
        '<td data-label="خبرنامه">' + nlCheck + '</td>' +
        '<td data-label="عملیات">' +
          '<button class="btn-sm btn-edit-member" data-idx="' + i + '">ویرایش</button> ' +
          '<button class="btn-sm btn-danger btn-delete-member" data-email="' + escapeHTML(u.email) + '">حذف</button>' +
        '</td></tr>';
    }).join("");

    tbody.querySelectorAll(".btn-edit-member").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var idx = parseInt(this.getAttribute("data-idx"));
        var u = members[idx];
        if (!u) return;
        document.getElementById("modal-member-name").value = u.name;
        document.getElementById("modal-member-email").value = u.email;
        document.getElementById("modal-member-phone").value = u.phone || "";
        document.getElementById("modal-member-pass").value = "";
        document.getElementById("modal-member-newsletter").checked = !!u.newsletter;

        document.getElementById("btn-save-member").onclick = function () {
          var newName = document.getElementById("modal-member-name").value.trim();
          var newPhone = document.getElementById("modal-member-phone").value.trim();
          var newPass = document.getElementById("modal-member-pass").value;
          var newNl = document.getElementById("modal-member-newsletter").checked;
          u.name = newName || u.name;
          u.phone = newPhone;
          u.newsletter = newNl;
          if (newPass && newPass.length >= 6) u.password = newPass;
          localStorage.setItem("site_users", JSON.stringify(members));
          hideModal();
          renderMembersTable();
          alert("اطلاعات عضو ذخیره شد.");
        };
        showModal("edit-member-modal");
      });
    });

    tbody.querySelectorAll(".btn-delete-member").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var email = this.getAttribute("data-email");
        if (!confirm("آیا از حذف عضو مطمئن هستید؟")) return;
        members = members.filter(function (u) { return u.email !== email; });
        localStorage.setItem("site_users", JSON.stringify(members));
        renderMembersTable();
      });
    });

    convertNumbersInScope(tbody);
  }

  // ════════════════════════════════════════════════
  //  GALLERY — Lightbox
  // ════════════════════════════════════════════════

  function initGallery() {
    // Create lightbox overlay
    var lb = document.createElement("div");
    lb.id = "lightbox-overlay";
    lb.style.cssText = "display:none;position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.9);display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:0;visibility:hidden;transition:opacity 250ms ease,visibility 250ms ease;";
    lb.innerHTML = '<img id="lightbox-img" style="max-width:90vw;max-height:90vh;object-fit:contain;border-radius:8px" /><button id="lightbox-close" style="position:absolute;top:16px;left:16px;width:40px;height:40px;border-radius:50%;border:1px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.1);color:#fff;font-size:1.3rem;cursor:pointer;display:grid;place-items:center">&times;</button>';
    document.body.appendChild(lb);

    var lbImg = document.getElementById("lightbox-img");
    var lbClose = document.getElementById("lightbox-close");

    // Click on gallery items
    document.querySelectorAll(".gallery-item img").forEach(function (img) {
      img.style.cursor = "pointer";
      img.addEventListener("click", function (e) {
        e.stopPropagation();
        lbImg.src = this.src;
        lb.style.opacity = "1";
        lb.style.visibility = "visible";
        document.body.classList.add("no-scroll");
      });
    });

    function closeLightbox() {
      lb.style.opacity = "0";
      lb.style.visibility = "hidden";
      document.body.classList.remove("no-scroll");
    }

    lb.addEventListener("click", function (e) { if (e.target !== lbImg) closeLightbox(); });
    lbClose.addEventListener("click", closeLightbox);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeLightbox(); });
  }

  // ════════════════════════════════════════════════
  //  FILES — Functional upload/download
  // ════════════════════════════════════════════════

  var siteFiles = [];

  function initFiles() {
    try { siteFiles = JSON.parse(localStorage.getItem("site_files") || "[]"); } catch (e) { siteFiles = []; }
    renderFilesTable();

    var uploadBtn = document.getElementById("file-upload-btn");
    var fileInput = document.getElementById("file-upload-input");
    if (uploadBtn && fileInput) {
      uploadBtn.addEventListener("click", function () { fileInput.click(); });
      fileInput.addEventListener("change", function () {
        Array.from(this.files).forEach(function (f) {
          var reader = new FileReader();
          reader.onload = function (e) {
            siteFiles.push({
              name: f.name,
              type: f.type || "application/octet-stream",
              size: f.size,
              data: e.target.result,
              date: new Date().toISOString()
            });
            localStorage.setItem("site_files", JSON.stringify(siteFiles));
            renderFilesTable();
          };
          reader.readAsDataURL(f);
        });
        this.value = "";
      });
    }

    // Drop zone
    var dropZone = document.getElementById("file-drop-zone");
    if (dropZone) {
      dropZone.addEventListener("dragover", function (e) { e.preventDefault(); dropZone.style.borderColor = "var(--admin-primary)"; });
      dropZone.addEventListener("dragleave", function () { dropZone.style.borderColor = ""; });
      dropZone.addEventListener("drop", function (e) {
        e.preventDefault();
        dropZone.style.borderColor = "";
        Array.from(e.dataTransfer.files).forEach(function (f) {
          var reader = new FileReader();
          reader.onload = function (ev) {
            siteFiles.push({ name: f.name, type: f.type || "application/octet-stream", size: f.size, data: ev.target.result, date: new Date().toISOString() });
            localStorage.setItem("site_files", JSON.stringify(siteFiles));
            renderFilesTable();
          };
          reader.readAsDataURL(f);
        });
      });
    }
  }

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  }

  function renderFilesTable() {
    var tbody = document.querySelector("#tab-files .data-table tbody");
    if (!tbody) return;
    if (!siteFiles.length) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--admin-text-muted);padding:24px">هنوز فایلی آپلود نشده است.</td></tr>';
      return;
    }
    tbody.innerHTML = siteFiles.map(function (f, i) {
      var typeLabel = f.type.includes("pdf") ? "PDF" : f.type.includes("word") || f.name.endsWith(".docx") ? "Word" : f.type.includes("sheet") || f.name.endsWith(".xlsx") ? "Excel" : f.type.split("/")[1] || "فایل";
      return '<tr>' +
        '<td data-label="نام فایل">' + escapeHTML(f.name) + '</td>' +
        '<td data-label="نوع">' + typeLabel + '</td>' +
        '<td data-label="حجم">' + formatSize(f.size) + '</td>' +
        '<td data-label="تاریخ">' + persianDateShort(f.date) + '</td>' +
        '<td data-label="عملیات">' +
          '<a class="btn-sm" href="' + f.data + '" download="' + escapeHTML(f.name) + '">دانلود</a> ' +
          '<button class="btn-sm btn-danger btn-delete-file" data-idx="' + i + '">حذف</button>' +
        '</td></tr>';
    }).join("");

    tbody.querySelectorAll(".btn-delete-file").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var idx = parseInt(this.getAttribute("data-idx"));
        if (!confirm("آیا از حذف فایل مطمئن هستید؟")) return;
        siteFiles.splice(idx, 1);
        localStorage.setItem("site_files", JSON.stringify(siteFiles));
        renderFilesTable();
      });
    });

    convertNumbersInScope(tbody);
  }

  // ════════════════════════════════════════════════
  //  PLUGINS — Dynamic from localStorage
  // ════════════════════════════════════════════════

  var DEFAULT_PLUGINS = [
    { id:"p1", name:"SEO Manager", slug:"seo-manager", version:"2.1.0", description:"بهینه‌سازی عنوان، توضیحات متا و نقشه سایت برای موتورهای جستجو.", author:"تیم فنی", active:true, configured:true, code:'{\n  "name": "seo-manager",\n  "title": "SEO Manager",\n  "version": "2.1.0",\n  "description": "بهینه‌سازی سئو",\n  "author": "تیم فنی",\n  "active": true\n}' },
    { id:"p2", name:"Analytics Dashboard", slug:"analytics-dashboard", version:"1.4.2", description:"اتصال به Google Analytics و نمایش آمار بازدید در داشبورد.", author:"تیم فنی", active:true, configured:false, code:'{\n  "name": "analytics-dashboard",\n  "title": "Analytics Dashboard",\n  "version": "1.4.2",\n  "description": "اتصال به Analytics",\n  "author": "تیم فنی",\n  "active": true\n}' },
    { id:"p3", name:"Social Auto Poster", slug:"social-auto-poster", version:"3.0.1", description:"انتشار خودکار پست‌ها در شبکه‌های اجتماعی مختلف.", author:"تیم فنی", active:false, configured:false, code:'{\n  "name": "social-auto-poster",\n  "title": "Social Auto Poster",\n  "version": "3.0.1",\n  "description": "انتشار خودکار",\n  "author": "تیم فنی",\n  "active": false\n}' }
  ];

  function getPlugins() { return Store.get("plugins", DEFAULT_PLUGINS); }
  function savePlugins(p) { Store.set("plugins", p); }
  var plugins = [];

  function initPlugins() {
    plugins = getPlugins();
    renderPluginsGrid();

    // Plugin upload
    var uploadBtn = document.getElementById("plugin-upload-zone");
    var uploadInput = document.getElementById("plugin-upload-input");
    if (uploadBtn && uploadInput) {
      uploadBtn.addEventListener("click", function () { uploadInput.click(); });
      uploadInput.addEventListener("change", function () {
        Array.from(this.files).forEach(function (f) {
          var reader = new FileReader();
          reader.onload = function (e) {
            var pluginData = {
              id: uid(), name: f.name.replace(/\.(zip|rar|tar|7z)$/i, ""),
              slug: f.name.replace(/\.(zip|rar|tar|7z)$/i, "").toLowerCase().replace(/[^a-z0-9-]/g, "-"),
              version: "1.0.0", description: "پلاگین آپلود شده", author: "ناشناس",
              active: false, configured: false, code: '{"name":"' + f.name.replace(/\.(zip|rar|tar|7z)$/i, "") + '","version":"1.0.0"}',
              file: e.target.result, fileName: f.name, fileSize: f.size
            };
            plugins.push(pluginData);
            savePlugins(plugins);
            renderPluginsGrid();
            alert("پلاگین «" + f.name + "» آپلود شد.");
          };
          reader.readAsDataURL(f);
        });
        this.value = "";
      });
    }

    // Plugin edit tool
    var editSelect = document.getElementById("plugin-edit-select");
    if (editSelect) {
      editSelect.addEventListener("change", function () {
        var slug = this.value;
        var editor = document.getElementById("plugin-code-editor");
        var textarea = document.getElementById("plugin-code-textarea");
        if (!slug) { editor.style.display = "none"; return; }
        var plugin = plugins.find(function (p) { return p.slug === slug; });
        if (plugin) {
          textarea.value = plugin.code || "";
          editor.style.display = "block";
        }
      });
    }

    document.getElementById("btn-plugin-code-save").addEventListener("click", function () {
      var slug = document.getElementById("plugin-edit-select").value;
      var plugin = plugins.find(function (p) { return p.slug === slug; });
      if (plugin) {
        plugin.code = document.getElementById("plugin-code-textarea").value;
        savePlugins(plugins);
        document.getElementById("plugin-code-status").innerHTML = '<span style="color:var(--admin-success)">✓ تغییرات ذخیره شد</span>';
        setTimeout(function () { document.getElementById("plugin-code-status").innerHTML = ""; }, 3000);
      }
    });

    document.getElementById("btn-plugin-code-reject").addEventListener("click", function () {
      var slug = document.getElementById("plugin-edit-select").value;
      var plugin = plugins.find(function (p) { return p.slug === slug; });
      if (plugin) {
        document.getElementById("plugin-code-textarea").value = plugin.code || "";
        document.getElementById("plugin-code-status").innerHTML = '<span style="color:var(--admin-danger)">تغییرات رد شد</span>';
        setTimeout(function () { document.getElementById("plugin-code-status").innerHTML = ""; }, 3000);
      }
    });
  }

  function renderPluginsGrid() {
    var grid = document.getElementById("plugins-grid");
    var empty = document.getElementById("plugins-empty");
    var editSelect = document.getElementById("plugin-edit-select");

    if (!plugins.length) { grid.innerHTML = ""; empty.style.display = "block"; return; }
    empty.style.display = "none";

    grid.innerHTML = plugins.map(function (p) {
      var statusBadge = p.active
        ? '<span class="badge badge-success">فعال</span>'
        : '<span class="badge badge-secondary">غیرفعال</span>';
      var configNote = p.configured
        ? '<p style="color:var(--admin-success);font-size:0.8rem;margin-top:8px">✓ تنظیم شده</p>'
        : '';
      return '<div class="plugin-card" data-slug="' + p.slug + '">' +
        '<div class="plugin-header"><h4>' + escapeHTML(p.name) + '</h4>' + statusBadge + '</div>' +
        '<p>' + escapeHTML(p.description) + '</p>' +
        '<div class="plugin-meta"><span>نسخه ' + p.version + '</span><span>' + escapeHTML(p.author) + '</span></div>' +
        configNote +
        '<div class="plugin-actions">' +
          '<button class="btn-sm btn-toggle-plugin" data-slug="' + p.slug + '">' + (p.active ? 'غیرفعال' : 'فعال') + '</button>' +
          '<button class="btn-sm btn-plugin-settings" data-slug="' + p.slug + '">تنظیمات</button>' +
          '<button class="btn-sm btn-edit-plugin-code" data-slug="' + p.slug + '">ادیت کد</button>' +
          '<button class="btn-sm btn-danger btn-delete-plugin" data-slug="' + p.slug + '">حذف</button>' +
        '</div></div>';
    }).join("");

    // Update edit select
    if (editSelect) {
      editSelect.innerHTML = '<option value="">انتخاب کنید...</option>' +
        plugins.map(function (p) { return '<option value="' + p.slug + '">' + p.name + '</option>'; }).join("");
    }

    grid.querySelectorAll(".btn-toggle-plugin").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var slug = this.getAttribute("data-slug");
        var p = plugins.find(function (x) { return x.slug === slug; });
        if (p) { p.active = !p.active; savePlugins(plugins); renderPluginsGrid(); }
      });
    });

    grid.querySelectorAll(".btn-plugin-settings").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var slug = this.getAttribute("data-slug");
        var p = plugins.find(function (x) { return x.slug === slug; });
        if (!p) return;
        document.getElementById("plugin-settings-title").textContent = "تنظیمات: " + p.name;
        document.getElementById("plugin-settings-body").innerHTML =
          '<div class="field"><label>وضعیت</label><select id="ps-active"><option value="1"' + (p.active ? ' selected' : '') + '>فعال</option><option value="0"' + (!p.active ? ' selected' : '') + '>غیرفعال</option></select></div>' +
          '<div class="field"><label>توضیحات</label><textarea id="ps-desc" rows="3">' + escapeHTML(p.description) + '</textarea></div>';
        document.getElementById("btn-save-plugin-settings").onclick = function () {
          p.description = document.getElementById("ps-desc").value;
          p.configured = true;
          savePlugins(plugins);
          renderPluginsGrid();
          hideModal();
          alert("تنظیمات پلاگین ذخیره شد.");
        };
        showModal("plugin-settings-modal");
      });
    });

    grid.querySelectorAll(".btn-edit-plugin-code").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var slug = this.getAttribute("data-slug");
        document.getElementById("plugin-edit-select").value = slug;
        document.getElementById("plugin-edit-select").dispatchEvent(new Event("change"));
        switchTab("plugins");
        switchSubTab("plugins", "plugins-edit");
      });
    });

    grid.querySelectorAll(".btn-delete-plugin").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var slug = this.getAttribute("data-slug");
        if (!confirm("آیا از حذف پلاگین مطمئن هستید؟")) return;
        plugins = plugins.filter(function (x) { return x.slug !== slug; });
        savePlugins(plugins);
        renderPluginsGrid();
      });
    });
  }

  // ════════════════════════════════════════════════
  //  SETTINGS — Persistence
  // ════════════════════════════════════════════════

  function initSettings() {
    // Load saved settings
    var settings = Store.get("settings", {
      siteTitle: "مهبد نادری | معمار رشد دیجیتال",
      siteDesc: "سایت شخصی مهبد نادری؛ معمار رشد دیجیتال، مشاور بازاریابی.",
      siteKeywords: "بازاریابی دیجیتال, مشاوره, رشد دیجیتال",
      analyticsId: "", analyticsStatus: "فعال",
      gtmId: "", gtmStatus: "فعال",
      phone: "+98 912 214 7417", email: "mercury700ir@gmail.com", address: "تهران، ایران"
    });

    document.getElementById("setting-site-title").value = settings.siteTitle;
    document.getElementById("setting-site-desc").value = settings.siteDesc;
    document.getElementById("setting-site-keywords").value = settings.siteKeywords;
    document.getElementById("setting-analytics-id").value = settings.analyticsId;
    document.getElementById("setting-gtm-id").value = settings.gtmId;
    document.getElementById("setting-phone").value = settings.phone;
    document.getElementById("setting-email").value = settings.email;
    document.getElementById("setting-address").value = settings.address;

    document.getElementById("btn-save-seo").addEventListener("click", function () {
      settings.siteTitle = document.getElementById("setting-site-title").value;
      settings.siteDesc = document.getElementById("setting-site-desc").value;
      settings.siteKeywords = document.getElementById("setting-site-keywords").value;
      Store.set("settings", settings);
      alert("تنظیمات SEO ذخیره شد.");
    });

    document.getElementById("btn-save-analytics").addEventListener("click", function () {
      var id = document.getElementById("setting-analytics-id").value.trim();
      settings.analyticsId = id;
      settings.analyticsStatus = document.getElementById("setting-analytics-status").value;
      Store.set("settings", settings);
      var result = document.getElementById("analytics-test-result");
      if (id && /^G-[A-Z0-9]+$/.test(id)) {
        result.style.display = "block";
        result.innerHTML = '<span style="color:var(--admin-success)">✓ شناسه معتبر است: ' + id + '<br>کد رهگیری به صفحات اضافه شد.</span>';
      } else if (id) {
        result.style.display = "block";
        result.innerHTML = '<span style="color:var(--admin-danger)">فرمت شناسه نامعتبر است. فرمت صحیح: G-XXXXXXXXXX</span>';
      } else {
        result.style.display = "block";
        result.innerHTML = '<span style="color:var(--admin-warning)">شناسه خالی است. برای اتصال، شناسه را وارد کنید.</span>';
      }
    });

    document.getElementById("btn-save-gtm").addEventListener("click", function () {
      var id = document.getElementById("setting-gtm-id").value.trim();
      settings.gtmId = id;
      settings.gtmStatus = document.getElementById("setting-gtm-status").value;
      Store.set("settings", settings);
      var result = document.getElementById("gtm-test-result");
      if (id && /^GTM-[A-Z0-9]+$/.test(id)) {
        result.style.display = "block";
        result.innerHTML = '<span style="color:var(--admin-success)">✓ شناسه Container معتبر است: ' + id + '<br>کد Container به head صفحات اضافه شد.</span>';
      } else if (id) {
        result.style.display = "block";
        result.innerHTML = '<span style="color:var(--admin-danger)">فرمت شناسه نامعتبر است. فرمت صحیح: GTM-XXXXXXX</span>';
      } else {
        result.style.display = "block";
        result.innerHTML = '<span style="color:var(--admin-warning)">شناسه خالی است.</span>';
      }
    });

    document.getElementById("btn-save-contact").addEventListener("click", function () {
      settings.phone = document.getElementById("setting-phone").value;
      settings.email = document.getElementById("setting-email").value;
      settings.address = document.getElementById("setting-address").value;
      Store.set("settings", settings);
      alert("اطلاعات تماس ذخیره شد.");
    });
  }

  // ════════════════════════════════════════════════
  //  HELPERS — Tab/SubTab switcher
  // ════════════════════════════════════════════════

  function switchTab(tabId) {
    sidebarLinks.forEach(function (l) { l.classList.remove("active"); });
    var link = document.querySelector('.sidebar-link[data-tab="' + tabId + '"]');
    if (link) link.classList.add("active");
    tabPanes.forEach(function (p) { p.classList.remove("active"); });
    var target = document.getElementById("tab-" + tabId);
    if (target) target.classList.add("active");
    if (pageTitle) {
      if (link) pageTitle.textContent = link.querySelector("span").textContent;
    }
  }

  function switchSubTab(tabId, subtabId) {
    var parent = document.getElementById("tab-" + tabId);
    if (!parent) return;
    parent.querySelectorAll(".sub-tab").forEach(function (b) {
      b.classList.remove("active");
      if (b.getAttribute("data-subtab") === subtabId) b.classList.add("active");
    });
    parent.querySelectorAll(".sub-pane").forEach(function (p) { p.classList.remove("active"); });
    var t = document.getElementById(subtabId);
    if (t) t.classList.add("active");
  }

  // ════════════════════════════════════════════════
  //  GALLERY — Dynamic with metadata
  // ════════════════════════════════════════════════

  var galleryImages = [];

  function initGallery() {
    try { galleryImages = JSON.parse(localStorage.getItem("admin_gallery") || "[]"); } catch (e) { galleryImages = []; }

    // Add default images
    if (!galleryImages.length) {
      var defaults = ["assets/profile-formal.jpeg","assets/profile-light.jpeg","assets/profile-suit.jpeg","assets/consulting-room.jpeg","assets/case-score.jpeg","assets/logo.png"];
      defaults.forEach(function (src) {
        galleryImages.push({ src: src, name: src.split("/").pop(), format: src.split(".").pop().toUpperCase(), size: 0, tags: "", width: 0, height: 0 });
      });
      localStorage.setItem("admin_gallery", JSON.stringify(galleryImages));
    }

    renderGalleryImages();

    // Upload handler
    var uploadInput = document.getElementById("image-upload-input");
    var uploadZone = document.getElementById("image-upload-zone");
    if (uploadInput) {
      uploadInput.addEventListener("change", function () {
        Array.from(this.files).forEach(function (f) {
          var reader = new FileReader();
          reader.onload = function (e) {
            var img = new Image();
            img.onload = function () {
              galleryImages.push({
                src: e.target.result, name: f.name, format: f.type.split("/")[1] || "unknown",
                size: f.size, tags: "", width: img.width, height: img.height
              });
              localStorage.setItem("admin_gallery", JSON.stringify(galleryImages));
              renderGalleryImages();
            };
            img.src = e.target.result;
          };
          reader.readAsDataURL(f);
        });
        this.value = "";
      });
    }
    if (uploadZone) {
      uploadZone.addEventListener("dragover", function (e) { e.preventDefault(); });
      uploadZone.addEventListener("drop", function (e) {
        e.preventDefault();
        if (uploadInput) { uploadInput.files = e.dataTransfer.files; uploadInput.dispatchEvent(new Event("change")); }
      });
    }
  }

  function renderGalleryImages() {
    var grid = document.getElementById("gallery-images-grid");
    var empty = document.getElementById("gallery-images-empty");
    if (!grid) return;
    if (!galleryImages.length) { grid.innerHTML = ""; empty.style.display = "block"; return; }
    empty.style.display = "none";

    grid.innerHTML = galleryImages.map(function (img, i) {
      var sizeStr = img.size ? formatSize(img.size) : "نامشخص";
      var dimStr = img.width && img.height ? img.width + "×" + img.height : "";
      return '<div class="gallery-card" data-idx="' + i + '">' +
        '<div class="gallery-card-img"><img src="' + img.src + '" alt="' + escapeHTML(img.name) + '" /></div>' +
        '<div class="gallery-card-info">' +
          '<div class="field"><label>نام</label><input type="text" class="gallery-name" data-idx="' + i + '" value="' + escapeHTML(img.name) + '" /></div>' +
          '<div class="field"><label>تگ‌ها</label><input type="text" class="gallery-tags" data-idx="' + i + '" value="' + escapeHTML(img.tags) + '" placeholder="تگ‌ها با کاما" /></div>' +
          '<div class="gallery-meta"><span>' + img.format + '</span><span>' + sizeStr + '</span>' + (dimStr ? '<span>' + dimStr + '</span>' : '') + '</div>' +
        '</div>' +
        '<div class="gallery-card-actions">' +
          '<button class="btn-sm btn-gallery-select" data-idx="' + i + '">انتخاب</button>' +
          '<button class="btn-sm btn-danger btn-gallery-delete" data-idx="' + i + '">حذف</button>' +
        '</div>' +
      '</div>';
    }).join("");

    grid.querySelectorAll(".gallery-name").forEach(function (input) {
      input.addEventListener("change", function () {
        var idx = parseInt(this.getAttribute("data-idx"));
        galleryImages[idx].name = this.value;
        localStorage.setItem("admin_gallery", JSON.stringify(galleryImages));
      });
    });

    grid.querySelectorAll(".gallery-tags").forEach(function (input) {
      input.addEventListener("change", function () {
        var idx = parseInt(this.getAttribute("data-idx"));
        galleryImages[idx].tags = this.value;
        localStorage.setItem("admin_gallery", JSON.stringify(galleryImages));
      });
    });

    grid.querySelectorAll(".btn-gallery-select").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var idx = parseInt(this.getAttribute("data-idx"));
        selectFromGallery(idx);
      });
    });

    grid.querySelectorAll(".btn-gallery-delete").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var idx = parseInt(this.getAttribute("data-idx"));
        if (!confirm("آیا از حذف تصویر مطمئن هستید؟")) return;
        galleryImages.splice(idx, 1);
        localStorage.setItem("admin_gallery", JSON.stringify(galleryImages));
        renderGalleryImages();
      });
    });
  }

  // File Manager for selecting from gallery
  var fileManagerCallback = null;

  window.openFileManager = function (callback) {
    fileManagerCallback = callback;
    var grid = document.getElementById("file-manager-grid");
    grid.innerHTML = galleryImages.map(function (img, i) {
      return '<div class="file-manager-item" data-idx="' + i + '">' +
        '<img src="' + img.src + '" alt="' + escapeHTML(img.name) + '" />' +
        '<span>' + escapeHTML(img.name) + '</span></div>';
    }).join("");
    grid.querySelectorAll(".file-manager-item").forEach(function (item) {
      item.addEventListener("click", function () {
        var idx = parseInt(this.getAttribute("data-idx"));
        if (fileManagerCallback) fileManagerCallback(galleryImages[idx].src);
        hideModal();
      });
    });
    showModal("file-manager-modal");
  };

  window.selectFromGallery = function (idx) {
    // For banner editing — set the banner image field
    var bannerImg = document.getElementById("modal-banner-image");
    if (bannerImg) bannerImg.value = galleryImages[idx].src;
  };


