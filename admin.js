/* ════════════════════════════════════════════════════════════════
   Admin Panel — Full JavaScript
   Blog CRUD · Social Connect · Schedule · AI Generator · Persistence
   ════════════════════════════════════════════════════════════════ */

// ────────────────── Helpers ──────────────────

function toPersianNumbers(str) {
  var d = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(str).replace(/[0-9]/g, function (c) {
    return d[+c];
  });
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function nowISO() {
  return new Date().toISOString();
}

function persianDateShort(iso) {
  if (!iso) return "—";
  try {
    var d = new Date(iso);
    var j = d.toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return j;
  } catch (e) {
    return iso;
  }
}

function persianDateTimeShort(iso) {
  if (!iso) return "—";
  try {
    var d = new Date(iso);
    return (
      d.toLocaleDateString("fa-IR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }) +
      " " +
      d.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })
    );
  } catch (e) {
    return iso;
  }
}

function escapeHTML(str) {
  var div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function convertNumbersInScope(root) {
  var skip =
    'input, textarea, select, svg, [dir="ltr"], pre, code, .code-block';
  var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: function (n) {
      if (!/[0-9]/.test(n.nodeValue)) return NodeFilter.FILTER_REJECT;
      var el = n.parentElement;
      if (el && el.closest(skip)) return NodeFilter.FILTER_REJECT;
      if (el && el.closest("a[href]")) {
        var h = el.closest("a").getAttribute("href") || "";
        if (h.startsWith("tel:") || h.startsWith("mailto:"))
          return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  while (walker.nextNode()) {
    walker.currentNode.nodeValue = toPersianNumbers(
      walker.currentNode.nodeValue,
    );
  }
}

// ────────────────── localStorage Store ──────────────────

var Store = {
  get: function (key, fallback) {
    try {
      var v = localStorage.getItem("admin_" + key);
      return v ? JSON.parse(v) : fallback;
    } catch (e) {
      return fallback;
    }
  },
  set: function (key, val) {
    try {
      localStorage.setItem("admin_" + key, JSON.stringify(val));
    } catch (e) {}
  },
};

// ────────────────── Default Data ──────────────────

var DEFAULT_BLOG_POSTS = [
  {
    id: "p1",
    title: "استراتژی رشد دیجیتال در ۱۴۰۵",
    author: "مهبد نادری",
    date: "2025-06-22",
    category: "استراتژی",
    tags: "استراتژی,رشد,دیجیتال",
    status: "published",
    body: "<p>بازاریابی دیجیتال امروزه به یکی از مهم‌ترین اجزای رشد کسب‌وکارها تبدیل شده است.</p>",
  },
  {
    id: "p2",
    title: "چگونه ساختار مارکتینگ بسازیم",
    author: "علی رضایی",
    date: "2025-06-18",
    category: "ساختار",
    tags: "ساختار,مارکتینگ",
    status: "published",
    body: "<p>ساختار دیجیتال مارکتینگ شامل تعریف فرآیندها، نقش‌ها و شاخص‌های کلیدی عملکرد است.</p>",
  },
  {
    id: "p3",
    title: "مشاوره مدیریت بازاریابی",
    author: "مهبد نادری",
    date: "2025-06-10",
    category: "مشاوره",
    tags: "مشاوره,مدیریت",
    status: "draft",
    body: "<p>همراهی مدیران برای تصمیم‌گیری دقیق‌تر در بازاریابی.</p>",
  },
];

var DEFAULT_SOCIAL = [
  {
    id: "whatsapp",
    name: "واتساپ",
    abbr: "WA",
    color: "#25d366",
    connected: true,
    handle: "@mahbod_naderi",
  },
  {
    id: "bale",
    name: "بله",
    abbr: "BL",
    color: "#1a8cff",
    connected: true,
    handle: "@mahbod_naderi",
  },
  {
    id: "rubika",
    name: "روبیکا",
    abbr: "RB",
    color: "#e91e63",
    connected: false,
    handle: "",
  },
  {
    id: "telegram",
    name: "تلگرام",
    abbr: "TG",
    color: "#0088cc",
    connected: true,
    handle: "@mahbod_naderi",
  },
  {
    id: "instagram",
    name: "اینستاگرام",
    abbr: "IG",
    color: "#c13584",
    connected: true,
    handle: "@mahbod.naderi",
  },
];

var DEFAULT_SCHEDULES = [];

function getBlogPosts() {
  return Store.get("blog_posts", DEFAULT_BLOG_POSTS);
}
function saveBlogPosts(posts) {
  Store.set("blog_posts", posts);
}
function getSocial() {
  return Store.get("social", DEFAULT_SOCIAL);
}
function saveSocial(soc) {
  Store.set("social", soc);
}
function getSchedules() {
  return Store.get("schedules", DEFAULT_SCHEDULES);
}
function saveSchedules(s) {
  Store.set("schedules", s);
}

// Page content store
var DEFAULT_PAGES = {
  index: {
    title: "صفحه اصلی",
    h1: "ساختن سیستم رشد برای برندهایی که می‌خواهند تصمیم‌های بازاریابی دقیق‌تری بگیرند.",
    lead: "مشاور و مدیر بازاریابی با کارشناسی ارشد MBA از دانشگاه کارلتون کانادا و بیش از ۱۰ سال تجربه در طراحی، مدیریت و پیاده‌سازی ساختارهای دیجیتال مارکتینگ.",
    kicker: "معمار رشد دیجیتال",
    btn1Text: "درخواست مشاوره",
    btn1Link: "contact.html",
    btn2Text: "بیشتر درباره مهبد",
    btn2Link: "about.html",
    section1Title: "رویکرد کاری",
    section1Body:
      "<p>تمرکز من فقط روی کمپین یا ابزار نیست؛ مسئله اصلی ساختن معماری قابل اتکا برای جذب، تبدیل، نگهداشت و توسعه مشتری است.</p>",
    section2Title: "حوزه‌های مشاوره",
    section2Body:
      "استراتژی رشد دیجیتال، ساختار دیجیتال مارکتینگ، مشاوره مدیریت بازاریابی",
    seoTitle: "مهبد نادری | معمار رشد دیجیتال",
    seoDesc:
      "سایت شخصی مهبد نادری؛ معمار رشد دیجیتال، مشاور بازاریابی و طراح ساختارهای دیجیتال مارکتینگ.",
    seoKeywords: "بازاریابی دیجیتال, مشاوره, رشد دیجیتال",
    seoCanonical: "https://mahbodnaderi.com/index.html",
    image: "assets/profile-formal.jpeg",
    imageAlt: "پرتره رسمی مهبد نادری",
    imageCaption: "مشاوره، طراحی ساختار و اجرای سیستم‌های رشد دیجیتال",
  },
  about: {
    title: "درباره من",
    h1: "من بازاریابی را به شکل یک سیستم رشد می‌بینم؛ نه مجموعه‌ای از فعالیت‌های جدا از هم.",
    lead: "مهبد نادری هستم؛ معمار رشد دیجیتال، دارای کارشناسی ارشد MBA از دانشگاه کارلتون کانادا و بیش از ۱۰ سال تجربه.",
    kicker: "درباره من",
    btn1Text: "گفتگو برای همکاری",
    btn1Link: "contact.html",
    btn2Text: "بازگشت به خانه",
    btn2Link: "index.html",
    section1Title: "مسیر حرفه‌ای",
    section1Body:
      "<p>تجربه من در کنار کسب‌وکارها بر یک اصل ساده بنا شده است: رشد زمانی پایدار می‌شود که تصمیم‌های بازاریابی بر پایه داده، شناخت مشتری، ساختار اجرایی و سنجش مداوم گرفته شوند.</p>",
    section2Title: "ارزش‌ها",
    section2Body: "شفافیت، دقت و ساختن خروجی قابل اعتماد",
    seoTitle: "درباره مهبد نادری",
    seoDesc:
      "درباره مهبد نادری؛ معمار رشد دیجیتال، مشاور بازاریابی و فارغ‌التحصیل MBA از دانشگاه کارلتون کانادا.",
    seoKeywords: "مهبد نادری, معمار رشد دیجیتال, مشاور بازاریابی",
    seoCanonical: "https://mahbodnaderi.com/about.html",
    image: "assets/profile-light.jpeg",
    imageAlt: "پرتره مهبد نادری با کت روشن",
    imageCaption:
      "ترکیب نگاه مدیریتی، تجربه اجرایی و شناخت عمیق از رشد دیجیتال",
  },
  contact: {
    title: "تماس با من",
    h1: "اگر به رشد دیجیتال منظم‌تر نیاز دارید، بیایید گفتگو را شروع کنیم.",
    lead: "برای مشاوره، بررسی وضعیت بازاریابی، طراحی ساختار دیجیتال مارکتینگ یا هماهنگی جلسه، از مسیرهای زیر مستقیم با من در ارتباط باشید.",
    kicker: "درخواست مشاوره",
    btn1Text: "تماس با من",
    btn1Link: "tel:+989122147417",
    btn2Text: "ایمیل به من",
    btn2Link: "mailto:mercury700ir@gmail.com",
    section1Title: "فرم تماس",
    section1Body: "<p>جزئیات اولیه پروژه یا نیاز مشاوره را بنویسید.</p>",
    section2Title: "موضوعات پیشنهادی",
    section2Body: "ارزیابی بازاریابی فعلی، طراحی سیستم رشد، همراهی مدیریتی",
    seoTitle: "تماس با مهبد نادری",
    seoDesc:
      "تماس با مهبد نادری برای مشاوره رشد دیجیتال، مدیریت بازاریابی و طراحی ساختار دیجیتال مارکتینگ.",
    seoKeywords: "تماس, مشاوره, رشد دیجیتال",
    seoCanonical: "https://mahbodnaderi.com/contact.html",
    image: "assets/profile-suit.jpeg",
    imageAlt: "پرتره رسمی مهبد نادری",
    imageCaption: "برای شروع یک همکاری هدفمند، یک پیام کوتاه کافی است.",
  },
  blog: {
    title: "نوشته‌ها",
    h1: "نوشته‌ها",
    lead: "مقالات، یادداشت‌ها و ویدئوهای آموزشی در حوزه استراتژی رشد دیجیتال و بازاریابی.",
    kicker: "وبلاگ",
    btn1Text: "",
    btn1Link: "",
    btn2Text: "",
    btn2Link: "",
    section1Title: "لیست مقالات",
    section1Body:
      "<p>مقالات و نوشته‌ها در حوزه استراتژی رشد دیجیتال و بازاریابی.</p>",
    section2Title: "",
    section2Body: "",
    seoTitle: "نوشته‌ها | مهبد نادری",
    seoDesc:
      "نوشته‌ها و مقالات مهبد نادری در حوزه استراتژی رشد دیجیتال، ساختار مارکتینگ و مشاوره مدیریت بازاریابی.",
    seoKeywords: "وبلاگ, مقالات, استراتژی رشد",
    seoCanonical: "https://mahbodnaderi.com/blog.html",
    image: "assets/profile-formal.jpeg",
    imageAlt: "تصویر وبلاگ",
    imageCaption: "مقالات و نوشته‌ها",
  },
};
function getPages() {
  var pages = Store.get("pages", DEFAULT_PAGES);
  // Migrate old format to Elementor sections
  for (var key in pages) {
    var p = pages[key];
    if (!p.sections || !p.sections.length) {
      p.sections = [];
      if (p.h1) {
        var sec1 = { cols: [{ w: [] }], bg: "#ffffff" };
        sec1.cols[0].w.push({ t: "heading", d: { text: p.h1, tag: "h1" } });
        if (p.lead) sec1.cols[0].w.push({ t: "text", d: { content: p.lead } });
        if (p.btn1Text) sec1.cols[0].w.push({ t: "spacer", d: { h: "20" } });
        if (p.btn1Text) sec1.cols[0].w.push({ t: "button", d: { text: p.btn1Text, link: p.btn1Link || "#", bg: "#2271b1", tc: "#fff" } });
        p.sections.push(sec1);
      }
      if (p.image) {
        var sec2 = { cols: [{ w: [] }], bg: "#ffffff" };
        sec2.cols[0].w.push({ t: "image", d: { src: p.image, alt: p.imageAlt || "", w: "100%" } });
        p.sections.push(sec2);
      }
    }
    // Normalize column structure
    (p.sections || []).forEach(function (sec) {
      if (!sec.cols) sec.cols = sec.columns || [{ w: [] }];
      delete sec.columns;
      sec.cols.forEach(function (col) {
        if (!col.w) col.w = col.widgets || [];
        delete col.widgets;
      });
    });
  }
  return pages;
}
function savePages(pages) {
  Store.set("pages", pages);
}

// Banner store
var DEFAULT_BANNERS = [
  {
    id: "b1",
    title: "بنر اصلی صفحه نخست",
    image: "assets/profile-formal.jpeg",
    link: "contact.html",
    active: true,
    position: "hero",
  },
  {
    id: "b2",
    title: "بنر درباره من",
    image: "assets/profile-light.jpeg",
    link: "about.html",
    active: true,
    position: "about",
  },
];
function getBanners() {
  return Store.get("banners", DEFAULT_BANNERS);
}
function saveBanners(b) {
  Store.set("banners", b);
}

var DEFAULT_POPUPS = [
  {
    id: "pop1",
    title: "دعوت به مشاوره",
    content: "برای بررسی مسیر رشد دیجیتال، یک جلسه مشاوره رزرو کنید.",
    ctaText: "درخواست مشاوره",
    ctaLink: "contact.html",
    trigger: "exit-intent",
    target: "همه صفحات",
    schedule: "همیشه فعال",
    active: true,
    views: 386,
    conversions: 28,
  },
];
function getPopups() {
  return Store.get("popups", DEFAULT_POPUPS);
}
function savePopups(p) {
  Store.set("popups", p);
}

// ────────────────── DOM Ready ──────────────────

document.addEventListener("DOMContentLoaded", function () {
  // ── Element refs ──
  var loginScreen = document.getElementById("login-screen");
  var adminPanel = document.getElementById("admin-panel");
  var loginForm = document.getElementById("login-form");
  var loginError = document.getElementById("login-error");
  var logoutBtn = document.getElementById("logout-btn");
  var themeToggle = document.getElementById("theme-toggle");
  var sidebar = document.getElementById("sidebar");
  var sidebarToggle = document.getElementById("sidebar-toggle");
  var sidebarClose = document.getElementById("sidebar-close");
  var sidebarOverlay = document.getElementById("sidebar-overlay");
  var pageTitle = document.getElementById("page-title");
  var sidebarLinks = document.querySelectorAll(".sidebar-link");
  var tabPanes = document.querySelectorAll(".tab-pane");

  // ────────── Auth ──────────
  if (api.token) {
    api
      .getMe()
      .then(function () {
        showAdmin();
      })
      .catch(function () {
        api.clearToken();
      });
  }

  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    var u = document.getElementById("login-user").value.trim();
    var p = document.getElementById("login-pass").value.trim();
    try {
      var result = await api.login(u, p);
      api.setToken(result.token);
      showAdmin();
    } catch (err) {
      loginError.textContent = err.message || "ورود ناموفق بود.";
    }
  });

  logoutBtn.addEventListener("click", function () {
    api.clearToken();
    adminPanel.style.display = "none";
    loginScreen.style.display = "flex";
  });

  function showAdmin() {
    loginScreen.style.display = "none";
    adminPanel.style.display = "flex";
    initBlog();
    initSocial();
    initPageEditor();
    initCampaignContent();
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
      sidebarLinks.forEach(function (l) {
        l.classList.remove("active");
      });
      this.classList.add("active");
      tabPanes.forEach(function (p) {
        p.classList.remove("active");
      });
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
      parent.querySelectorAll(".sub-tab").forEach(function (b) {
        b.classList.remove("active");
      });
      this.classList.add("active");
      parent.querySelectorAll(".sub-pane").forEach(function (p) {
        p.classList.remove("active");
      });
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
    parent.querySelectorAll(".sub-pane").forEach(function (p) {
      p.classList.remove("active");
    });
    var t = document.getElementById(subtabId);
    if (t) t.classList.add("active");
  };

  // ────────── Upload Zones ──────────
  setupUploadZone("image-upload-zone", "image-upload-input");
  setupUploadZone("video-upload-zone", "video-upload-input");
  setupUploadZone("ai-file-zone", "ai-file-input");
  setupUploadZone("file-drop-zone", "file-upload-input");
  var fileUploadBtn = document.getElementById("file-upload-btn");
  if (fileUploadBtn)
    fileUploadBtn.addEventListener("click", function () {
      document.getElementById("file-upload-input").click();
    });

  function setupUploadZone(zoneId, inputId) {
    var zone = document.getElementById(zoneId);
    var input = document.getElementById(inputId);
    if (!zone || !input) return;
    zone.addEventListener("click", function () {
      input.click();
    });
    zone.addEventListener("dragover", function (e) {
      e.preventDefault();
      zone.style.borderColor = "var(--admin-primary)";
    });
    zone.addEventListener("dragleave", function () {
      zone.style.borderColor = "";
    });
    zone.addEventListener("drop", function (e) {
      e.preventDefault();
      zone.style.borderColor = "";
      handleFiles(e.dataTransfer.files, zoneId);
    });
    input.addEventListener("change", function () {
      handleFiles(this.files, zoneId);
    });
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
    o.querySelectorAll(".modal-content").forEach(function (m) {
      m.style.display = "none";
    });
    var t = document.getElementById(id);
    if (t) t.style.display = "block";
  };
  window.hideModal = function () {
    document.getElementById("modal-overlay").style.display = "none";
  };
  document
    .getElementById("modal-overlay")
    .addEventListener("click", function (e) {
      if (e.target === this) hideModal();
    });

  // ────────── Counters ──────────
  function animateCounters() {
    document
      .querySelectorAll(".stat-number[data-count]")
      .forEach(function (el) {
        var target = parseInt(el.getAttribute("data-count"), 10);
        var dur = 1200,
          start = null;
        function step(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          el.textContent = toPersianNumbers(
            String(Math.floor((1 - Math.pow(1 - p, 3)) * target)),
          );
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
          ["clean"],
        ],
      },
    });
    window.quillEditor = quill;
  }

  // ════════════════════════════════════════════════
  //  BLOG — CRUD + Persistence
  // ════════════════════════════════════════════════

  var blogPosts = getBlogPosts();
  var editingPostId = null;

  async function initBlog() {
    await loadBlogPosts();
    document.getElementById("btn-new-post").addEventListener("click", newPost);
    document
      .getElementById("btn-save-draft")
      .addEventListener("click", function () {
        savePost("draft");
      });
    document
      .getElementById("btn-publish")
      .addEventListener("click", function () {
        savePost("published");
      });
  }

  async function loadBlogPosts() {
    try {
      blogPosts = await api.getPosts();
      renderBlogTable();
    } catch (e) {
      console.error(e);
      blogPosts = [];
      renderBlogTable();
    }
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
    tbody.innerHTML = blogPosts
      .map(function (p) {
        var author = p.author || p.author_name || "مدیر";
        var writtenAt = p.created_at || p.createdAt || p.date || "";
        var publishedAt = p.published_at || p.publishedAt || (p.status === "published" ? (p.date || writtenAt) : "");
        var category = p.category || p.category_name || p.category_id || "بدون دسته";
        var statusBadge =
          p.status === "published"
            ? '<span class="badge badge-success">منتشر</span>'
            : p.status === "scheduled"
              ? '<span class="badge badge-info">زمان‌دار</span>'
              : p.status === "pending"
                ? '<span class="badge badge-warning">در انتظار</span>'
                : '<span class="badge badge-warning">پیش‌نویس</span>';
        return (
          "<tr>" +
          '<td data-label="عنوان">' +
          escapeHTML(p.title) +
          "</td>" +
          '<td data-label="نویسنده">' +
          escapeHTML(author) +
          "</td>" +
          '<td data-label="تاریخ نگارش">' +
          persianDateShort(writtenAt) +
          "</td>" +
          '<td data-label="تاریخ انتشار">' +
          persianDateShort(publishedAt) +
          "</td>" +
          '<td data-label="دسته‌بندی">' +
          escapeHTML(category) +
          "</td>" +
          '<td data-label="وضعیت">' +
          statusBadge +
          "</td>" +
          '<td data-label="عملیات">' +
          '<div class="quick-actions">' +
          '<button class="btn-sm btn-post-action" data-action="pending" data-id="' + p.id + '">در انتظار</button>' +
          '<button class="btn-sm btn-post-action" data-action="published" data-id="' + p.id + '">انتشار</button>' +
          '<button class="btn-sm btn-post-action" data-action="scheduled" data-id="' + p.id + '">زمان‌دار</button>' +
          '<button class="btn-sm btn-danger btn-delete" data-id="' + p.id + '">پاک کردن</button>' +
          "</div>" +
          "</td>" +
          '<td data-label="">' +
          '<button class="btn-sm btn-edit" data-id="' +
          p.id +
          '">ویرایش</button> ' +
          '<button class="btn-sm btn-danger btn-delete" data-id="' +
          p.id +
          '">حذف</button>' +
          "</td></tr>"
        );
      })
      .join("");

    tbody.querySelectorAll(".btn-edit").forEach(function (btn) {
      btn.addEventListener("click", function () {
        editPost(this.getAttribute("data-id"));
      });
    });
    tbody.querySelectorAll(".btn-delete").forEach(function (btn) {
      btn.addEventListener("click", function () {
        deletePost(this.getAttribute("data-id"));
      });
    });
    tbody.querySelectorAll(".btn-post-action").forEach(function (btn) {
      btn.addEventListener("click", function () {
        quickUpdatePostStatus(this.getAttribute("data-id"), this.getAttribute("data-action"));
      });
    });

    convertNumbersInScope(tbody);
  }

  async function quickUpdatePostStatus(id, status) {
    var data = { status: status };
    if (status === "scheduled") {
      var dt = prompt("تاریخ و زمان انتشار زمان‌دار را وارد کنید (YYYY-MM-DD HH:mm):");
      if (!dt) return;
      data.scheduled_at = dt.replace(" ", "T");
    }
    try {
      await api.updatePost(id, data);
      await loadBlogPosts();
    } catch (err) {
      alert(err.message);
    }
  }

  function initCampaignContent() {
    var bannerBtn = document.getElementById("btn-new-campaign-banner");
    var popupBtn = document.getElementById("btn-new-popup");
    if (bannerBtn && !bannerBtn.dataset.bound) {
      bannerBtn.dataset.bound = "1";
      bannerBtn.addEventListener("click", function () {
        var items = getBanners();
        items.unshift({
          id: "b" + uid(),
          title: "بنر جدید",
          image: "assets/consulting-room.jpeg",
          link: "contact.html",
          caption: "متن بنر را ویرایش کنید",
          position: "sitewide",
          target: "همه بازدیدکنندگان",
          trigger: "نمایش در بارگذاری صفحه",
          schedule: "همیشه فعال",
          active: true,
          views: 0,
          conversions: 0,
        });
        saveBanners(items);
        renderCampaignContent();
      });
    }
    if (popupBtn && !popupBtn.dataset.bound) {
      popupBtn.dataset.bound = "1";
      popupBtn.addEventListener("click", function () {
        var items = getPopups();
        items.unshift({
          id: "pop" + uid(),
          title: "PopUp جدید",
          content: "متن پاپ‌آپ را وارد کنید",
          ctaText: "اقدام",
          ctaLink: "contact.html",
          trigger: "scroll-depth",
          target: "بازدیدکنندگان جدید",
          schedule: "همیشه فعال",
          active: true,
          views: 0,
          conversions: 0,
        });
        savePopups(items);
        renderCampaignContent();
      });
    }
    renderCampaignContent();
  }

  function renderCampaignContent() {
    renderCampaignList("campaign-banners-board", getBanners(), "banner");
    renderCampaignList("campaign-popups-board", getPopups(), "popup");
    var all = getBanners().concat(getPopups());
    var views = all.reduce(function (s, x) { return s + Number(x.views || 0); }, 0);
    var conversions = all.reduce(function (s, x) { return s + Number(x.conversions || 0); }, 0);
    var rate = views ? Math.round((conversions / views) * 1000) / 10 : 0;
    setText("campaign-views", toPersianNumbers(views));
    setText("campaign-conversions", toPersianNumbers(conversions));
    setText("campaign-rate", toPersianNumbers(rate) + "٪");
  }

  function renderCampaignList(id, items, type) {
    var board = document.getElementById(id);
    if (!board) return;
    if (!items.length) {
      board.innerHTML = '<div class="empty-state"><p>هنوز آیتمی ساخته نشده است.</p></div>';
      return;
    }
    board.innerHTML = items.map(function (item) {
      var rate = item.views ? Math.round((Number(item.conversions || 0) / Number(item.views || 1)) * 1000) / 10 : 0;
      return '<article class="campaign-card" data-id="' + item.id + '" data-type="' + type + '">' +
        '<div class="campaign-preview">' + (type === "banner" ? '<img src="' + escapeHTML(item.image || item.image_path || "assets/logo.png") + '" alt="">' : '<div class="popup-preview"><strong>' + escapeHTML(item.title) + '</strong><span>' + escapeHTML(item.content || "") + '</span></div>') + '</div>' +
        '<div class="campaign-fields">' +
        '<label>عنوان<input data-field="title" value="' + escapeHTML(item.title || "") + '"></label>' +
        '<label>متن<textarea data-field="' + (type === "banner" ? "caption" : "content") + '">' + escapeHTML(item.caption || item.content || "") + '</textarea></label>' +
        '<label>لینک CTA<input data-field="' + (type === "banner" ? "link" : "ctaLink") + '" value="' + escapeHTML(item.link || item.link_url || item.ctaLink || "") + '"></label>' +
        '<div class="campaign-row"><label>محل نمایش<input data-field="position" value="' + escapeHTML(item.position || "sitewide") + '"></label><label>هدف‌گیری<input data-field="target" value="' + escapeHTML(item.target || "همه کاربران") + '"></label></div>' +
        '<div class="campaign-row"><label>نحوه نمایش<input data-field="trigger" value="' + escapeHTML(item.trigger || "page-load") + '"></label><label>زمان‌بندی<input data-field="schedule" value="' + escapeHTML(item.schedule || "همیشه فعال") + '"></label></div>' +
        '<div class="campaign-metrics"><span>نمایش: ' + toPersianNumbers(item.views || 0) + '</span><span>تبدیل: ' + toPersianNumbers(item.conversions || 0) + '</span><span>نرخ: ' + toPersianNumbers(rate) + '٪</span></div>' +
        '<div class="campaign-actions"><button class="btn-sm btn-campaign-toggle">' + (item.active ? "غیرفعال کردن" : "فعال کردن") + '</button><button class="btn-sm btn-danger btn-campaign-delete">حذف</button></div>' +
        '</div></article>';
    }).join("");
    board.querySelectorAll("input, textarea").forEach(function (el) {
      el.addEventListener("change", function () {
        updateCampaignField(this.closest(".campaign-card"), this.getAttribute("data-field"), this.value);
      });
    });
    board.querySelectorAll(".btn-campaign-toggle").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var card = this.closest(".campaign-card");
        var list = card.dataset.type === "banner" ? getBanners() : getPopups();
        var item = list.find(function (x) { return String(x.id) === card.dataset.id; });
        if (item) item.active = !item.active;
        card.dataset.type === "banner" ? saveBanners(list) : savePopups(list);
        renderCampaignContent();
      });
    });
    board.querySelectorAll(".btn-campaign-delete").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (!confirm("این آیتم حذف شود؟")) return;
        var card = this.closest(".campaign-card");
        var list = (card.dataset.type === "banner" ? getBanners() : getPopups()).filter(function (x) { return String(x.id) !== card.dataset.id; });
        card.dataset.type === "banner" ? saveBanners(list) : savePopups(list);
        renderCampaignContent();
      });
    });
  }

  function updateCampaignField(card, field, value) {
    var list = card.dataset.type === "banner" ? getBanners() : getPopups();
    var item = list.find(function (x) { return String(x.id) === card.dataset.id; });
    if (item) item[field] = value;
    card.dataset.type === "banner" ? saveBanners(list) : savePopups(list);
  }

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
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
    var post = blogPosts.find(function (p) {
      return p.id === id;
    });
    if (!post) return;
    editingPostId = id;
    document.getElementById("edit-post-id").value = id;
    document.getElementById("editor-title").value = post.title;
    document.getElementById("editor-category").value = post.category;
    document.getElementById("editor-content-type").value =
      post.contentType || "article";
    document.getElementById("editor-video-url").value = post.videoUrl || "";
    document.getElementById("editor-tags").value = post.tags || "";
    document.getElementById("editor-author").value = post.author;
    if (quill) quill.root.innerHTML = post.body || "";
    switchSubTab("blog", "blog-editor");
  }

  async function deletePost(id) {
    if (!confirm("آیا از حذف این پست مطمئن هستید؟")) return;
    try {
      await api.deletePost(id);
      await loadBlogPosts();
    } catch (err) {
      alert(err.message);
    }
  }

  async function savePost(status) {
    var title = document.getElementById("editor-title").value.trim();
    if (!title) {
      alert("عنوان پست را وارد کنید.");
      return;
    }

    var data = {
      title: title,
      body: quill ? quill.root.innerHTML : "",
      content_type: document.getElementById("editor-content-type").value,
      video_url: document.getElementById("editor-video-url").value.trim(),
      tags: document.getElementById("editor-tags").value.trim(),
      author: document.getElementById("editor-author").value.trim(),
      category: document.getElementById("editor-category").value,
      status: status,
    };

    try {
      if (editingPostId) {
        await api.updatePost(editingPostId, data);
      } else {
        await api.createPost(data);
      }
      editingPostId = null;
      await loadBlogPosts();
      switchSubTab("blog", "blog-posts");
      convertNumbersInScope(document.getElementById("tab-blog"));
    } catch (err) {
      alert(err.message);
    }
  }

  // ════════════════════════════════════════════════
  //  AI CONTENT GENERATOR
  // ════════════════════════════════════════════════

  // AI input tabs
  document.querySelectorAll(".ai-input-tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      document.querySelectorAll(".ai-input-tab").forEach(function (t) {
        t.classList.remove("active");
      });
      this.classList.add("active");
      document.querySelectorAll(".ai-input-pane").forEach(function (p) {
        p.classList.remove("active");
      });
      var t = document.getElementById(this.getAttribute("data-aitab"));
      if (t) t.classList.add("active");
    });
  });

  // AI generate
  var aiBtn = document.getElementById("ai-generate-btn");
  if (aiBtn) {
    aiBtn.addEventListener("click", function () {
      var topic = document.getElementById("ai-input-text").value.trim();
      var fileName =
        (document.getElementById("ai-file-name") || {}).textContent || "";
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

        document.querySelector("#ai-output-title span").textContent =
          result.seoTitle;
        document.querySelector("#ai-output-meta span").textContent =
          result.metaDesc;
        document.querySelector("#ai-output-keywords span").textContent =
          result.tags;
        document.getElementById("ai-output-body").innerHTML = result.body;
        document.querySelector("#ai-output-schedule span").textContent =
          result.schedule;

        var output = document.getElementById("ai-output");
        output.style.display = "block";

        aiBtn.disabled = false;
        aiBtn.innerHTML =
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> تولید محتوا';

        convertNumbersInScope(output);
      }, 2200);
    });
  }

  function generateAIContent(topic, type, tone) {
    var t = topic.replace(/[^\w\u0600-\u06FF\s]/g, "").trim() || "موضوع";
    var wc =
      parseInt(document.getElementById("ai-word-count").value, 10) || 800;

    // ── Persian paragraph pools by tone ──
    var P = {
      "رسمی و حرفه‌ای": {
        intro: [
          "در دنیای پرشتاب امروز، «{t}» به یکی از محوری‌ترین چالش‌های سازمان‌های پیشرو تبدیل شده است. شرکت‌هایی که در این حوزه سرمایه‌گذاری هوشمندانه می‌کنند، مزیت رقابتی پایداری به دست می‌آورند که فراتر از دوره‌های کوتاه‌مدت عمل می‌کند.",
          "موضوع «{t}» امروزه دیگر یک انتخاب لوکس نیست، بلکه یک ضرورت استراتژیک برای هر سازمانی است که می‌خواهد در فضای رقابتی بازار دوام بیاورد و رشد کند.",
          "بررسی‌های میدانی و تحقیقات بازار نشان می‌دهد که سازمان‌هایی که روی «{t}» سرمایه‌گذاری کرده‌اند، در مقایسه با رقبای خود عملکرد بهتری داشته‌اند.",
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
          "ارزیابی دوره‌ای و بازنگری در استراتژی‌ها ضروری است. بازارها و شرایط دائماً در حال تغییر هستند و استراتژی‌ها باید انعطاف‌پذیری لازم برای تطبیق با تغییرات را داشته باشند.",
        ],
        conclusion: [
          "در نهایت، موفقیت در «{t}» نتیجه ترکیب برنامه‌ریزی دقیق، اجرای منظم و نظارت مستمر است. سازمان‌هایی که این اصول را رعایت می‌کنند، می‌توانند به نتایج قابل توجه و پایداری دست یابند.",
          "نتیجه‌گیری آنکه «{t}» فرآیندی مستمر و تکرارپذیر است. با پایبندی به اصول علمی و بهره‌گیری از تجربه متخصصان، می‌توان از این مسیر به موفقیت‌های چشمگیری دست یافت.",
        ],
        quote:
          "سازمان‌هایی که «{t}» را به عنوان یک فرآیند استراتژیک مدیریت می‌کنند، نه تنها در کوتاه‌مدت نتیجه می‌گیرند، بلکه بنیان رشد بلندمدت خود را مستحکم می‌کنند.",
      },
      آموزشی: {
        intro: [
          "اگر تا به حال با خود فکر کرده‌اید که «{t}» دقیقاً چیست و چگونه می‌توان از آن استفاده کرد، این مقاله برای شما نوشته شده است. در ادامه، قدم به قدم با مفاهیم پایه‌ای و کاربردهای عملی آن آشنا می‌شویم.",
          "«{t}» موضوعی است که بسیاری درباره آن صحبت می‌کنند اما کمتر کسی تعریف دقیقی از آن ارائه می‌دهد. در این مقاله سعی می‌کنیم به زبان ساده و با مثال‌های واقعی، این مفهوم را برای شما شفاف کنیم.",
        ],
        body: [
          "گام اول: شناخت مبانی. قبل از هر چیزی باید با مفاهیم پایه‌ای «{t}» آشنا شوید. این مفاهیم شامل تعاریف، اصطلاحات تخصصی و چارچوب‌های نظری می‌شود. درک صحیح مبانی، پایه و اساس یادگیری عمیق‌تر را فراهم می‌کند.",
          "گام دوم: ابزارها و منابع. پس از آشنایی با مبانی، نوبت به شناخت ابزارها و منابع می‌رسد. انتخاب ابزار مناسب تأثیر مستقیمی بر کیفیت کار شما دارد. ابزارهای رایگان و پولی متعددی وجود دارند که هر کدام مزایا و محدودیت‌های خاص خود را دارند.",
          "گام سوم: تمرین عملی. بهترین راه یادگیری، انجام کار عملی است. با پروژه‌های کوچک شروع کنید و به تدریج پیچیدگی آن‌ها را افزایش دهید. از اشتباهات خود درس بگیرید و هر تجربه را فرصتی برای رشد بدانید.",
          "گام چهارم: یادگیری مداوم. دنیای «{t}» دائماً در حال تغییر و تحول است. برای حفظ جایگاه خود، باید به‌طور مستمر اطلاعات خود را به‌روز کنید. مطالعه مقالات تخصصی، شرکت در دوره‌ها و تعامل با متخصصان این حوزه توصیه می‌شود.",
          "نکته مهم: صبر و پشتکار کلید موفقیت است. یادگیری «{t}» یک شبه اتفاق نمی‌افتد. به خودتان زمان بدهید و از مقایسه خود با دیگران پرهیز کنید.",
          "منابع پیشنهادی: کتاب‌های تخصصی، وبسایت‌های آموزشی معتبر، پادکست‌های حوزه مربوطه و دوره‌های آنلاین از جمله منابعی هستند که می‌توانند مسیر یادگیری شما را هموارتر کنند.",
        ],
        conclusion: [
          "با پیمودن این چهار گام، شما پایه‌های محکمی در «{t}» خواهید داشت. به یاد داشته باشید که یادگیری یک سفر است، نه یک مقصد. هر قدم کوچک شما را به هدف نزدیک‌تر می‌کند.",
        ],
        quote:
          "یادگیری «{t}» مثل یادگیری یک زبان جدید است: ابتدا کلمات را یاد می‌گیرید، سپس جمله می‌سازید و در نهایت می‌توانید داستان خود را بنویسید.",
      },
      صمیمی: {
        intro: [
          "سلام! خوشحالم که اینجایید. امروز می‌خواهیم راجع به «{t}» خیلی ساده و صمیمی حرف بزنیم. نگران نباشید، قرار نیست از اصطلاحات پیچیده استفاده کنم!",
          "بیایید یه موضوع جالب رو با هم بررسی کنیم: «{t}». شاید فکر کنید خیلی پیچیده‌ست، ولی باور کنید اگه قدم به قدم پیش بریم، خیلی راحت متوجه می‌شید.",
        ],
        body: [
          "اول از همه بذارید بگم اصلاً چرا باید به «{t}» اهمیت بدیم؟ خیلی ساده‌ست: چون تو دنیای امروز، کسب‌وکارهایی که این مسئله رو جدی می‌گیرن، جلوتر از بقیه هستن.",
          "یه مثال واقعی بزنم: فرض کنید دارید یه مغازه باز می‌کنید. بدون برنامه‌ریزی، بدون تحقیق بازار، بدون شناخت مشتری‌ها... چه اتفاقی می‌افته؟ احتمالاً بعد از چند ماه مجبور می‌شید در رو ببندید.",
          "حالا فرض کنید همین کار رو با یه نقشه راه مشخص انجام بدید. اول تحقیق کنید، بعد برنامه‌ریزی کنید، کم‌کم شروع کنید و بر اساس بازخورد مشتری‌ها اصلاح کنید. خیلی فرق داره، نه؟",
          "یه نکته خیلی مهم که خیلی‌ها ازش غافل می‌شن: عجله نکنید! موفقیت یه شبه اتفاق نمی‌افته. قدم‌های کوچک بردارید، از اشتباهاتتون درس بگیرید و به راهتون ادامه بدید.",
          "ابزارهای زیادی هستن که می‌تونن کمکتون کنن. لازم نیست همه رو بلد باشید، کافیه چند تا ابزار خوب رو بشناسید و درست ازشون استفاده کنید.",
          "یه چیز دیگه: از تجربه بقیه استفاده کنید. لازم نیست همه چیز رو از صفر یاد بگیرید. کتاب‌ها، مقالات و تجربه متخصصان این حوزه می‌تونه خیلی کمکتون کنه.",
        ],
        conclusion: [
          "خب، رسیدیم به آخر مقاله! امیدوارم اطلاعات مفیدی گرفته باشید. یادتون باشه مهم‌ترین قدم، همین الان شروع کردن‌ه. منتظر «زمان مناسب» نمونید، همین امروز اولین قدم رو بردارید!",
        ],
        quote:
          "بزرگ‌ترین اشتباهی که آدم‌ها می‌کنن؟ منتظر موندن برای «زمان مناسب». همین الان شروع کنید، حتی اگه کوچیک باشه!",
      },
      تبلیغاتی: {
        intro: [
          "آیا آماده‌اید تحولی اساسی در کسب‌وکار خود ایجاد کنید؟ «{t}» دیگر یک گزینه لوکس نیست، بلکه کلید بقا و رشد در بازار رقابتی امروز است.",
          "رقبای شما همین الان در حال سرمایه‌گذاری روی «{t}» هستند. هر روزی که می‌گذرد، فاصله بین شما و آن‌ها بیشتر می‌شود. سؤال این است: آیا حاضرید این فرصت را از دست بدهید؟",
        ],
        body: [
          "دلیل اول: رشد سریع و قابل اندازه‌گیری. سازمان‌هایی که «{t}» را به درستی پیاده‌سازی می‌کنند، در کوتاه‌مدت شاهد افزایش چشمگیر عملکرد خود هستند. نتایج قابل لمس و قابل سنجش هستند.",
          "دلیل دوم: بازگشت سرمایه بالا. برخلاف تصور بسیاری، سرمایه‌گذاری روی «{t}» هزینه نیست، بلکه سرمایه‌گذاری است. آمارها نشان می‌دهد بازگشت سرمایه در این حوزه بسیار بالاتر از بسیاری از حوزه‌های دیگر است.",
          "دلیل سوم: مزیت رقابتی پایدار. در بازاری که همه در حال رقابت هستند، «{t}» می‌تواند تمایز شما از رقبا را تضمین کند. این مزیت به مرور زمان تقویت می‌شود.",
          "دلیل چهارم: انعطاف‌پذیری سازمانی. «{t}» به سازمان شما توانایی تطبیق سریع با تغییرات بازار را می‌دهد. در دنیایی که همه چیز در حال تغییر است، این انعطاف‌پذیری حیاتی است.",
          "دلیل پنجم: آینده‌پژوهی. سرمایه‌گذاری روی «{t}» آمادگی شما برای ترندهای آینده را تضمین می‌کند. سازمان‌هایی که امروز برای فردا برنامه‌ریزی می‌کنند، فردا پیروز میدان خواهند بود.",
        ],
        conclusion: [
          "هر روز تأخیر، فرصتی از دست رفته است. همین الان اقدام کنید و اولین قدم را بردارید. ما اینجاییم تا در این مسیر همراه شما باشیم.",
        ],
        quote:
          "در بازار امروز، برنده کسی است که زودتر اقدام می‌کند، نه کسی که بیشتر منتظر می‌ماند.",
      },
    };

    var toneKey = tone in P ? tone : "رسمی و حرفه‌ای";
    var pool = P[toneKey];

    // ── Helpers ──
    function pick(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }
    function fill(s) {
      return s.replace(/\{t\}/g, t);
    }
    function wordCount(s) {
      return s
        .replace(/<[^>]+>/g, "")
        .trim()
        .split(/\s+/).length;
    }

    // ── Build article structure ──
    var titleMap = {
      "رسمی و حرفه‌ای": "بررسی جامع «{t}»: راهکارها و استراتژی‌های کلیدی",
      آموزشی: "آموزش گام‌به‌گام «{t}» از صفر تا صد",
      صمیمی: "«{t}» به زبان ساده: راهنمای کاربردی برای همه",
      تبلیغاتی: "«{t}»: چرا باید همین الان شروع کنید؟",
    };

    var seoTitle = fill(titleMap[toneKey] || titleMap["رسمی و حرفه‌ای"]);
    var metaDesc =
      "مقاله جامع درباره " +
      t +
      " با رویکرد " +
      tone +
      ". راهکارها و استراتژی‌های عملی برای رشد کسب‌وکار. " +
      t +
      " یکی از مهم‌ترین موضوعات روز است.";
    var tags =
      t + ", بازاریابی دیجیتال, رشد دیجیتال, استراتژی, " + t + " آموزش";

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
    paragraphs.push(
      '<figure style="margin:24px 0;text-align:center"><div style="background:linear-gradient(135deg,rgba(36,80,122,0.08),rgba(15,118,110,0.06));padding:60px 20px;border-radius:12px;border:1px dashed rgba(23,26,31,0.15)"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9aa0a8" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg><p style="color:#9aa0a8;font-size:0.85rem;margin:10px 0 0">تصویر مرتبط با ' +
        t +
        '</p></div><figcaption style="color:var(--muted);font-size:0.82rem;margin-top:8px">شکل ۱: نمای کلی ' +
        t +
        "</figcaption></figure>",
    );

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
      if (
        currentWords > 200 &&
        currentWords % 200 < 40 &&
        pool.body.length > 0
      ) {
        var nextPara = fill(pick(pool.body));
        var headingWords = nextPara.split(/[.:،]/)[0];
        paragraphs.push("<h3>" + headingWords + "</h3>");
      }
    }

    // Blockquote
    if (pool.quote) {
      paragraphs.push(
        '<blockquote style="border-right:4px solid var(--gold);padding:16px 20px;margin:28px 0;background:rgba(194,139,56,0.05);border-radius:0 8px 8px 0;font-style:italic;color:var(--muted)"><p>' +
          fill(pool.quote) +
          "</p></blockquote>",
      );
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
        "ارزیابی و بازنگری دوره‌ای استراتژی‌ها",
      ];
      listItems.forEach(function (item) {
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
    var schedStr =
      "پیشنهاد: انتشار در " +
      now.toLocaleDateString("fa-IR") +
      " ساعت " +
      toPersianNumbers("10:00") +
      " (صبح زود)";

    return {
      seoTitle: seoTitle,
      metaDesc: metaDesc,
      tags: tags,
      body: body,
      schedule: schedStr,
    };
  }

  // Copy AI output
  document.getElementById("btn-copy-ai").addEventListener("click", function () {
    var body = document.getElementById("ai-output-body");
    if (body && navigator.clipboard) {
      navigator.clipboard.writeText(body.textContent).then(function () {
        alert("محتوا کپی شد.");
      });
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
  document
    .getElementById("btn-save-ai-as-post")
    .addEventListener("click", function () {
      var title = document.querySelector("#ai-output-title span").textContent;
      var body = document.getElementById("ai-output-body").innerHTML;
      var tags = document.querySelector("#ai-output-keywords span").textContent;
      var newP = {
        id: uid(),
        title: title,
        author: "مهبد نادری",
        date: new Date().toISOString().split("T")[0],
        category:
          document.getElementById("ai-content-type").value === "مقاله وبلاگ"
            ? "استراتژی"
            : "مشاوره",
        tags: tags,
        status: "draft",
        body: body,
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
    document
      .getElementById("btn-schedule-post")
      .addEventListener("click", createSchedule);
    startScheduleChecker();
  }

  function renderSocialGrid() {
    var grid = document.getElementById("social-grid");
    grid.innerHTML = socialData
      .map(function (s) {
        var badge = s.connected
          ? '<span class="badge badge-success">متصل</span>'
          : '<span class="badge badge-secondary">غیر متصل</span>';
        var handle =
          s.connected && s.handle
            ? '<p class="social-handle">' + escapeHTML(s.handle) + "</p>"
            : "";
        var btn = s.connected
          ? '<button class="btn-sm btn-disconnect" data-id="' +
            s.id +
            '">قطع اتصال</button>'
          : '<button class="btn-sm btn-primary btn-connect" data-id="' +
            s.id +
            '">اتصال</button>';
        return (
          '<div class="social-card" data-platform="' +
          s.id +
          '">' +
          '<div class="social-icon" style="background:' +
          s.color +
          '">' +
          s.abbr +
          "</div>" +
          "<h4>" +
          escapeHTML(s.name) +
          "</h4>" +
          badge +
          handle +
          btn +
          "</div>"
        );
      })
      .join("");

    grid.querySelectorAll(".btn-connect").forEach(function (btn) {
      btn.addEventListener("click", function () {
        connectPlatform(this.getAttribute("data-id"));
      });
    });
    grid.querySelectorAll(".btn-disconnect").forEach(function (btn) {
      btn.addEventListener("click", function () {
        disconnectPlatform(this.getAttribute("data-id"));
      });
    });
  }

  function connectPlatform(id) {
    var handle = prompt("نام کاربری " + id + " را وارد کنید:");
    if (!handle) return;
    var s = socialData.find(function (x) {
      return x.id === id;
    });
    if (s) {
      s.connected = true;
      s.handle = handle;
    }
    saveSocial(socialData);
    renderSocialGrid();
    renderScheduleForm();
    convertNumbersInScope(document.getElementById("tab-social"));
  }

  function disconnectPlatform(id) {
    if (!confirm("آیا از قطع اتصال مطمئن هستید؟")) return;
    var s = socialData.find(function (x) {
      return x.id === id;
    });
    if (s) {
      s.connected = false;
      s.handle = "";
    }
    saveSocial(socialData);
    renderSocialGrid();
    renderScheduleForm();
  }

  function renderScheduleForm() {
    // Populate post select
    var sel = document.getElementById("schedule-post-select");
    var published = blogPosts.filter(function (p) {
      return p.status === "published";
    });
    sel.innerHTML =
      '<option value="">انتخاب کنید...</option>' +
      published
        .map(function (p) {
          return (
            '<option value="' + p.id + '">' + escapeHTML(p.title) + "</option>"
          );
        })
        .join("");

    // Populate connected platforms
    var plats = document.getElementById("schedule-platforms");
    var connected = socialData.filter(function (s) {
      return s.connected;
    });
    plats.innerHTML = connected
      .map(function (s) {
        return (
          '<label><input type="checkbox" value="' +
          s.id +
          '" checked /> ' +
          escapeHTML(s.name) +
          "</label>"
        );
      })
      .join("");
  }

  function createSchedule() {
    var postId = document.getElementById("schedule-post-select").value;
    if (!postId) {
      alert("یک پست انتخاب کنید.");
      return;
    }

    var platformChecks = document.querySelectorAll(
      "#schedule-platforms input[type=checkbox]:checked",
    );
    var platforms = Array.from(platformChecks).map(function (c) {
      return c.value;
    });
    if (!platforms.length) {
      alert("حداقل یک شبکه انتخاب کنید.");
      return;
    }

    var dt = document.getElementById("schedule-datetime").value;
    if (!dt) {
      alert("زمان انتشار را مشخص کنید.");
      return;
    }

    var post = blogPosts.find(function (p) {
      return p.id === postId;
    });
    var msg = document.getElementById("schedule-message").value.trim();

    var sched = {
      id: uid(),
      postId: postId,
      postTitle: post ? post.title : "پست",
      platforms: platforms,
      datetime: new Date(dt).toISOString(),
      message: msg,
      status: "scheduled",
      createdAt: nowISO(),
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

    tbody.innerHTML = schedules
      .map(function (s) {
        var statusMap = {
          scheduled: '<span class="badge badge-info">برنامه‌ریزی شده</span>',
          published: '<span class="badge badge-success">منتشر شده</span>',
          cancelled: '<span class="badge badge-secondary">لغو شده</span>',
        };
        var platNames = s.platforms
          .map(function (pid) {
            var sData = socialData.find(function (x) {
              return x.id === pid;
            });
            return sData ? sData.name : pid;
          })
          .join("، ");

        var actions = "";
        if (s.status === "scheduled") {
          actions =
            '<button class="btn-sm btn-cancel-sched" data-id="' +
            s.id +
            '">لغو</button>' +
            '<button class="btn-sm btn-publish-now" data-id="' +
            s.id +
            '">انتشار فوری</button>';
        }

        return (
          "<tr>" +
          "<td>" +
          escapeHTML(s.postTitle) +
          "</td>" +
          "<td>" +
          escapeHTML(platNames) +
          "</td>" +
          "<td>" +
          persianDateTimeShort(s.datetime) +
          "</td>" +
          "<td>" +
          (statusMap[s.status] || s.status) +
          "</td>" +
          "<td>" +
          actions +
          "</td></tr>"
        );
      })
      .join("");

    tbody.querySelectorAll(".btn-cancel-sched").forEach(function (btn) {
      btn.addEventListener("click", function () {
        cancelSchedule(this.getAttribute("data-id"));
      });
    });
    tbody.querySelectorAll(".btn-publish-now").forEach(function (btn) {
      btn.addEventListener("click", function () {
        publishNow(this.getAttribute("data-id"));
      });
    });

    convertNumbersInScope(tbody);
  }

  function cancelSchedule(id) {
    var s = schedules.find(function (x) {
      return x.id === id;
    });
    if (s) s.status = "cancelled";
    saveSchedules(schedules);
    renderScheduleTable();
  }

  function publishNow(id) {
    var s = schedules.find(function (x) {
      return x.id === id;
    });
    if (!s) return;
    s.status = "published";
    saveSchedules(schedules);
    renderScheduleTable();
    alert(
      "پست «" + s.postTitle + "» در شبکه‌های انتخابی منتشر شد (شبیه‌سازی).",
    );
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
  //  ELEMENTOR PAGE BUILDER — Clean Implementation
  // ════════════════════════════════════════════════

  var pages = getPages();
  var editingPage = null;
  var ebHistory = [];
  var ebHistoryIdx = -1;
  var ebSelected = null;
  var ebDevice = "desktop";
  var ebWidgetTarget = { sec: 0, col: 0 };

  var WIDGETS = {
    heading:   { name:"عنوان",   icon:"H",  f:[{k:"text",l:"متن",t:"text",d:"عنوان جدید"},{k:"tag",l:"اندازه",t:"sel",o:["h1","h2","h3","h4"],d:"h2"}] },
    text:      { name:"متن",     icon:"T",  f:[{k:"content",l:"محتوا",t:"area",d:"متن نمونه"}] },
    image:     { name:"تصویر",   icon:"🖼", f:[{k:"src",l:"آدرس",t:"text"},{k:"alt",l:"alt",t:"text"},{k:"w",l:"عرض",t:"text",d:"100%"}] },
    video:     { name:"ویدئو",   icon:"▶",  f:[{k:"url",l:"آدرس ویدئو",t:"text"}] },
    button:    { name:"دکمه",    icon:"⬜", f:[{k:"text",l:"متن",t:"text",d:"کلیک"},{k:"link",l:"لینک",t:"text"},{k:"bg",l:"رنگ",t:"color",d:"#2271b1"},{k:"tc",l:"متن",t:"color",d:"#fff"}] },
    icon:      { name:"آیکون",   icon:"★",  f:[{k:"name",l:"آیکون",t:"text",d:"★"},{k:"sz",l:"اندازه",t:"text",d:"48px"},{k:"color",l:"رنگ",t:"color",d:"#2271b1"}] },
    divider:   { name:"خط",      icon:"—",  f:[{k:"w",l:"عرض",t:"text",d:"100%"},{k:"color",l:"رنگ",t:"color",d:"#e0e0e0"}] },
    spacer:    { name:"فاصله",   icon:"↕",  f:[{k:"h",l:"ارتفاع",t:"text",d:"40"}] },
    gallery:   { name:"گالری",   icon:"⊞",  f:[{k:"cols",l:"ستون",t:"sel",o:["2","3","4"],d:"3"}] },
    quote:     { name:"نقل‌قول", icon:"❝",  f:[{k:"text",l:"متن",t:"area"},{k:"author",l:"نویسنده",t:"text"}] },
    counter:   { name:"شمارنده", icon:"#",  f:[{k:"num",l:"عدد",t:"text",d:"100"},{k:"sfx",l:"پسوند",t:"text",d:"+"},{k:"label",l:"عنوان",t:"text"}] },
    progress:  { name:"نوار پیشرفت",icon:"▰",f:[{k:"pct",l:"درصد",t:"text",d:"75"},{k:"label",l:"برچسب",t:"text"},{k:"color",l:"رنگ",t:"color",d:"#2271b1"}] },
    tabs:      { name:"تب‌ها",   icon:"⊟", f:[{k:"items",l:"عنوان:محتوا (کاما)",t:"area"}] },
    accordion: { name:"آکاردئون",icon:"☰", f:[{k:"items",l:"عنوان:محتوا (کاما)",t:"area"}] },
    toggle:    { name:"تگل",     icon:"▽", f:[{k:"title",l:"عنوان",t:"text"},{k:"content",l:"محتوا",t:"area"}] },
    map:       { name:"نقشه",   icon:"🗺", f:[{k:"html",l:"کد embed",t:"area"}] },
    code:      { name:"کد",      icon:"{}", f:[{k:"code",l:"کد",t:"area"}] },
    html:      { name:"HTML",    icon:"</>",f:[{k:"html",l:"کد HTML",t:"area"}] },
    imageBox:  { name:"باکس تصویر",icon:"▣",f:[{k:"src",l:"تصویر",t:"text"},{k:"title",l:"عنوان",t:"text"},{k:"desc",l:"توضیحات",t:"area"}] },
    iconBox:   { name:"باکس آیکون",icon:"◈",f:[{k:"icon",l:"آیکون",t:"text",d:"★"},{k:"title",l:"عنوان",t:"text"},{k:"desc",l:"توضیحات",t:"area"},{k:"color",l:"رنگ",t:"color",d:"#2271b1"}] },
    cta:       { name:"CTA",     icon:"📢",f:[{k:"title",l:"عنوان",t:"text"},{k:"desc",l:"توضیحات",t:"area"},{k:"btn",l:"دکمه",t:"text",d:"همین الان"},{k:"link",l:"لینک",t:"text"},{k:"bg",l:"رنگ",t:"color",d:"#2271b1"}] },
  };

  function initPageEditor() {
    pages = getPages();
    renderPagesList();
    bind("btn-new-page", "click", function () {
      var n = prompt("نام صفحه (انگلیسی):");
      if (!n) return;
      n = n.toLowerCase().replace(/[^a-z0-9-]/g, "");
      if (!n) { alert("نام نامعتبر."); return; }
      if (pages[n]) { alert("تکراری."); return; }
      pages[n] = { title: n, sections: [] };
      savePages(pages);
      openBuilder(n);
    });
    bind("eb-back-pages", "click", function () {
      show("content-pages"); hide("content-editor");
      editingPage = null; renderPagesList();
    });
    bind("eb-save-btn", "click", function () {
      if (!editingPage) return;
      savePages(pages);
      showToast("ذخیره شد");
    });
    bind("eb-undo", "click", function () { ebUndo(); });
    bind("eb-redo", "click", function () { ebRedo(); });
    bind("eb-navigator-toggle", "click", function () { toggle("eb-navigator"); });
    bind("eb-navigator-close", "click", function () { hide("eb-navigator"); });
    bind("eb-settings-close", "click", function () { hide("eb-settings"); });
    bind("eb-add-section", "click", function () { addSection(); });
    bind("eb-add-section-empty", "click", function () { addSection(); });
    bind("eb-widget-panel-close", "click", function () { hide("eb-widget-panel"); });
    document.querySelectorAll(".eb-res-btn").forEach(function (b) {
      b.addEventListener("click", function () {
        document.querySelectorAll(".eb-res-btn").forEach(function (x) { x.classList.remove("active"); });
        this.classList.add("active");
        ebDevice = this.getAttribute("data-device");
        var c = $("eb-canvas");
        c.className = "eb-canvas" + (ebDevice !== "desktop" ? " device-" + ebDevice : "");
      });
    });
    bind("eb-widget-search", "input", function () {
      var q = this.value.toLowerCase();
      document.querySelectorAll(".eb-widget-item").forEach(function (x) {
        x.style.display = (x.getAttribute("data-name") || "").includes(q) ? "" : "none";
      });
    });
    buildWidgetGrid();
  }

  function buildWidgetGrid() {
    var g = $("eb-widget-grid");
    if (!g) return;
    g.innerHTML = "";
    for (var k in WIDGETS) {
      var w = WIDGETS[k];
      var d = document.createElement("div");
      d.className = "eb-widget-item";
      d.setAttribute("data-w", k);
      d.setAttribute("data-name", w.name);
      d.innerHTML = '<div class="eb-widget-item-icon">' + w.icon + '</div><div class="eb-widget-item-name">' + w.name + '</div>';
      d.onclick = function () { addWidget(this.getAttribute("data-w")); hide("eb-widget-panel"); };
      g.appendChild(d);
    }
  }

  function renderPagesList() {
    var tb = $("pages-table-body");
    if (!tb) return;
    tb.innerHTML = "";
    for (var k in pages) {
      var p = pages[k];
      var wc = countWidgets(p);
      var tr = document.createElement("tr");
      tr.innerHTML = '<td>' + esc(p.title || k) + '</td><td>' + k + '.html</td><td>' + pn(wc) + ' ویجت</td><td><span class="badge badge-success">فعال</span></td><td><button class="btn-sm btn-edit-page" data-p="' + k + '">ویرایش</button></td>';
      tb.appendChild(tr);
    }
    tb.querySelectorAll(".btn-edit-page").forEach(function (b) {
      b.onclick = function () { openBuilder(this.getAttribute("data-p")); };
    });
  }

  function countWidgets(p) {
    return (p.sections || []).reduce(function (s, sec) {
      return s + (sec.cols || []).reduce(function (s2, c) { return s2 + (c.w || []).length; }, 0);
    }, 0);
  }

  function openBuilder(key) {
    editingPage = key;
    var p = pages[key];
    if (!p) return;
    if (!p.sections) p.sections = [];
    $("eb-page-title-display").textContent = p.title || key;
    show("content-editor"); hide("content-pages");
    ebHistory = [JSON.parse(JSON.stringify(p.sections))];
    ebHistoryIdx = 0;
    ebSelected = null;
    renderCanvas();
    renderNav();
    renderSettings();
  }

  function renderCanvas() {
    var cv = $("eb-canvas");
    var emp = $("eb-canvas-empty");
    var p = pages[editingPage];
    if (!p || !p.sections || !p.sections.length) {
      cv.innerHTML = "";
      if (emp) { cv.appendChild(emp); emp.style.display = "flex"; }
      return;
    }
    if (emp) emp.style.display = "none";
    cv.innerHTML = "";
    p.sections.forEach(function (sec, si) {
      var se = document.createElement("div");
      se.className = "eb-section" + (selEq("section", si) ? " selected" : "");
      se.setAttribute("data-si", si);
      var h = document.createElement("div");
      h.className = "eb-section-handle";
      h.innerHTML = '<button data-act="add-col">+</button><button data-act="del-sec">✕</button>';
      h.querySelector('[data-act="add-col"]').onclick = function (e) {
        e.stopPropagation();
        if (!sec.cols) sec.cols = [];
        sec.cols.push({ w: [] });
        save(); renderCanvas(); renderNav();
      };
      h.querySelector('[data-act="del-sec"]').onclick = function (e) {
        e.stopPropagation();
        p.sections.splice(si, 1);
        save(); renderCanvas(); renderNav();
      };
      se.appendChild(h);
      var cols = document.createElement("div");
      cols.className = "eb-columns";
      cols.style.gridTemplateColumns = "repeat(" + Math.max(1, (sec.cols || []).length) + ", 1fr)";
      (sec.cols || []).forEach(function (col, ci) {
        var ce = document.createElement("div");
        ce.className = "eb-column" + (selEq("col", si, ci) ? " selected" : "");
        ce.setAttribute("data-si", si);
        ce.setAttribute("data-ci", ci);
        ce.onclick = function (e) { if (e.target === ce) selectEl("col", si, ci); };
        (col.w || []).forEach(function (wgt, wi) {
          var we = document.createElement("div");
          we.className = "eb-widget" + (selEq("widget", si, ci, wi) ? " selected" : "");
          we.draggable = true;
          we.innerHTML = '<div class="eb-widget-handle">⋮⋮</div><div class="eb-widget-delete">✕</div><div class="eb-widget-content">' + renderW(wgt) + '</div>';
          we.onclick = function (e) { e.stopPropagation(); selectEl("widget", si, ci, wi); };
          we.querySelector(".eb-widget-delete").onclick = function (e) { e.stopPropagation(); col.w.splice(wi, 1); save(); renderCanvas(); renderNav(); };
          we.ondragstart = function (e) { e.dataTransfer.setData("text", JSON.stringify({s:si,c:ci,w:wi})); we.classList.add("eb-dragging"); };
          we.ondragend = function () { we.classList.remove("eb-dragging"); };
          ce.appendChild(we);
        });
        var ab = document.createElement("button");
        ab.className = "eb-add-widget-btn";
        ab.textContent = "+ ویجت";
        ab.onclick = function (e) { e.stopPropagation(); ebWidgetTarget = {sec:si,col:ci}; show("eb-widget-panel"); };
        ce.appendChild(ab);
        ce.ondragover = function (e) { e.preventDefault(); ce.classList.add("eb-drop-target"); };
        ce.ondragleave = function () { ce.classList.remove("eb-drop-target"); };
        ce.ondrop = function (e) {
          e.preventDefault(); ce.classList.remove("eb-drop-target");
          try {
            var d = JSON.parse(e.dataTransfer.getData("text"));
            var sc = p.sections[d.s].cols[d.c];
            var w = sc.w.splice(d.w, 1)[0];
            col.w.push(w);
            save(); renderCanvas(); renderNav();
          } catch(ex) {}
        };
        cols.appendChild(ce);
      });
      se.appendChild(cols);
      cv.appendChild(se);
    });
  }

  function renderW(wgt) {
    var d = wgt.d || {};
    switch (wgt.t) {
      case "heading": return "<" + (d.tag||"h2") + ">" + esc(d.text||"عنوان") + "</" + (d.tag||"h2") + ">";
      case "text": return "<p>" + (d.content||"متن") + "</p>";
      case "image": return '<img src="'+esc(d.src||'')+'" alt="'+esc(d.alt||'')+'" style="width:'+(d.w||'100%')+';border-radius:4px" />';
      case "video": return '<div style="background:#000;padding:40px;text-align:center;border-radius:4px;color:#fff">▶ ویدئو</div>';
      case "button": return '<a href="'+esc(d.link||'#')+'" style="display:inline-block;padding:10px 24px;background:'+(d.bg||'#2271b1')+';color:'+(d.tc||'#fff')+';border-radius:6px;text-decoration:none;font-weight:700">'+esc(d.text||'کلیک')+'</a>';
      case "icon": return '<div style="font-size:'+(d.sz||'48px')+';color:'+(d.color||'#2271b1')+';text-align:center">'+esc(d.name||'★')+'</div>';
      case "divider": return '<hr style="width:'+(d.w||'100%')+';background:'+(d.color||'#e0e0e0')+';border:none;height:1px" />';
      case "spacer": return '<div style="height:'+(d.h||'40')+'px"></div>';
      case "gallery": return '<div style="display:grid;grid-template-columns:repeat('+(d.cols||3)+',1fr);gap:8px"><div style="background:#f0f0f0;padding:30px;text-align:center;border-radius:4px;color:#999">گالری</div></div>';
      case "quote": return '<blockquote style="border-right:3px solid #2271b1;padding:16px;background:#f8f9fa;border-radius:0 6px 6px 0"><p>'+(d.text||'')+'</p><cite>— '+(d.author||'')+'</cite></blockquote>';
      case "counter": return '<div style="text-align:center"><div style="font-size:2.5rem;font-weight:900;color:#2271b1">'+esc(d.num||'0')+esc(d.sfx||'')+'</div><div>'+(d.label||'')+'</div></div>';
      case "progress": return '<div><div style="display:flex;justify-content:space-between;font-size:0.85rem"><span>'+(d.label||'')+'</span><span>'+(d.pct||'0')+'%</span></div><div style="background:#e0e0e0;border-radius:4px;height:8px"><div style="width:'+(d.pct||0)+'%;background:'+(d.color||'#2271b1')+';height:100%;border-radius:4px"></div></div></div>';
      case "tabs": return '<div style="display:flex;gap:4px;border-bottom:2px solid #e0e0e0"><div style="padding:8px 16px;border-bottom:2px solid #2271b1;color:#2271b1;font-weight:700">تب ۱</div><div style="padding:8px 16px;color:#999">تب ۲</div></div>';
      case "accordion": return '<div style="border:1px solid #e0e0e0;border-radius:4px"><div style="padding:12px;background:#f8f9fa">عنوان ▾</div></div>';
      case "toggle": return '<div style="border:1px solid #e0e0e0;border-radius:4px;padding:12px;display:flex;justify-content:space-between"><span>'+(d.title||'تگل')+'</span><span>▼</span></div>';
      case "map": return '<div style="background:#e8e8e8;padding:40px;text-align:center;border-radius:4px;color:#999">🗺 نقشه</div>';
      case "code": return '<pre style="background:#1e1e2e;color:#cdd6f4;padding:12px;border-radius:4px;font-size:0.82rem;direction:ltr;text-align:left">'+esc(d.code||'')+'</pre>';
      case "html": return '<div>'+( d.html||'')+'</div>';
      case "imageBox": return '<div style="text-align:center"><img src="'+esc(d.src||'')+'" style="max-width:100%;border-radius:4px" /><h3 style="margin:8px 0">'+esc(d.title||'')+'</h3><p style="color:#666">'+esc(d.desc||'')+'</p></div>';
      case "iconBox": return '<div style="text-align:center;padding:16px"><div style="font-size:2rem;color:'+(d.color||'#2271b1')+'">'+esc(d.icon||'★')+'</div><h3 style="margin:8px 0">'+esc(d.title||'')+'</h3><p style="color:#666">'+esc(d.desc||'')+'</p></div>';
      case "cta": return '<div style="background:'+(d.bg||'#2271b1')+';color:#fff;padding:32px;text-align:center;border-radius:8px"><h2 style="margin:0 0 8px;color:#fff">'+esc(d.title||'')+'</h2><p style="margin:0 0 16px;opacity:0.9">'+(d.desc||'')+'</p><a href="'+esc(d.link||'#')+'" style="display:inline-block;padding:12px 32px;background:#fff;color:'+(d.bg||'#2271b1')+';border-radius:6px;text-decoration:none;font-weight:700">'+esc(d.btn||'همین الان')+'</a></div>';
      default: return '<div style="padding:20px;text-align:center;color:#ccc;border:1px dashed #ddd;border-radius:4px">ویجت</div>';
    }
  }

  function selectEl(type, si, ci, wi) {
    ebSelected = { type:type, si:si, ci:ci, wi:wi };
    renderCanvas(); renderSettings(); renderNav();
  }

  function selEq(type, si, ci, wi) {
    if (!ebSelected || ebSelected.type !== type) return false;
    if (type === "section") return ebSelected.si === si;
    if (type === "col") return ebSelected.si === si && ebSelected.ci === ci;
    if (type === "widget") return ebSelected.si === si && ebSelected.ci === ci && ebSelected.wi === wi;
    return false;
  }

  function renderSettings() {
    var b = $("eb-settings-body");
    var t = $("eb-settings-title");
    show("eb-settings");
    if (!ebSelected) { b.innerHTML = '<p class="eb-settings-empty">یک عنصر انتخاب کنید</p>'; t.textContent = "تنظیمات"; return; }
    if (ebSelected.type === "widget") {
      var wgt = pages[editingPage].sections[ebSelected.si].cols[ebSelected.ci].w[ebSelected.wi];
      var def = WIDGETS[wgt.t];
      t.textContent = "تنظیمات: " + (def ? def.name : wgt.t);
      var h = "";
      if (def && def.f) def.f.forEach(function (f) {
        var v = (wgt.d||{})[f.k] || f.d || "";
        if (f.t === "area") h += '<div class="field"><label>'+f.l+'</label><textarea id="ef-'+f.k+'">'+esc(v)+'</textarea></div>';
        else if (f.t === "sel") h += '<div class="field"><label>'+f.l+'</label><select id="ef-'+f.k+'">'+f.o.map(function(o){return '<option value="'+o+'"'+(v===o?' selected':'')+'>'+o+'</option>';}).join('')+'</select></div>';
        else if (f.t === "color") h += '<div class="field"><label>'+f.l+'</label><input type="color" id="ef-'+f.k+'" value="'+v+'" /></div>';
        else h += '<div class="field"><label>'+f.l+'</label><input type="text" id="ef-'+f.k+'" value="'+esc(v)+'" /></div>';
      });
      b.innerHTML = h;
      b.querySelectorAll("input,textarea,select").forEach(function (el) {
        el.oninput = function () {
          var k = this.id.replace("ef-","");
          if (!wgt.d) wgt.d = {};
          wgt.d[k] = this.value;
          save();
          var wc = document.querySelector('[data-si="'+ebSelected.si+'"][data-ci="'+ebSelected.ci+'"] .eb-widget:nth-child('+(ebSelected.wi+1)+') .eb-widget-content');
          if (wc) wc.innerHTML = renderW(wgt);
        };
      });
    } else {
      t.textContent = ebSelected.type === "section" ? "تنظیمات بخش" : "تنظیمات ستون";
      b.innerHTML = '<p class="eb-settings-empty">انتخاب شده</p>';
    }
  }

  function renderNav() {
    var tree = $("eb-navigator-tree");
    var p = pages[editingPage];
    if (!p || !p.sections || !p.sections.length) { tree.innerHTML = '<p style="color:#666;padding:12px;font-size:0.82rem">بدون بخش</p>'; return; }
    var h = "";
    p.sections.forEach(function (sec, si) {
      h += '<div class="eb-nav-item'+(selEq("section",si)?' active':'')+'" data-sel="section-'+si+'"><span>▦</span><span>بخش '+pn(si+1)+'</span><span class="eb-nav-delete" data-del="'+si+'">✕</span></div>';
      (sec.cols||[]).forEach(function (col, ci) {
        h += '<div class="eb-nav-children"><div class="eb-nav-item" data-sel="col-'+si+'-'+ci+'"><span>▫</span><span>ستون '+pn(ci+1)+'</span></div>';
        (col.w||[]).forEach(function (wgt, wi) {
          var def = WIDGETS[wgt.t];
          h += '<div class="eb-nav-item" data-sel="widget-'+si+'-'+ci+'-'+wi+'"><span>'+(def?def.icon:'?')+'</span><span>'+(def?def.name:wgt.t)+'</span></div>';
        });
        h += '</div>';
      });
      h += '</div>';
    });
    tree.innerHTML = h;
    tree.querySelectorAll(".eb-nav-item[data-sel]").forEach(function (el) {
      el.onclick = function () {
        var p2 = this.getAttribute("data-sel").split("-");
        if (p2[0]==="section") selectEl("section",+p2[1]);
        else if (p2[0]==="col") selectEl("col",+p2[1],+p2[2]);
        else if (p2[0]==="widget") selectEl("widget",+p2[1],+p2[2],+p2[3]);
      };
    });
    tree.querySelectorAll(".eb-nav-delete[data-del]").forEach(function (el) {
      el.onclick = function (e) {
        e.stopPropagation();
        pages[editingPage].sections.splice(+this.getAttribute("data-del"),1);
        save(); renderCanvas(); renderNav();
      };
    });
  }

  function addSection() {
    var p = pages[editingPage];
    if (!p) return;
    if (!p.sections) p.sections = [];
    p.sections.push({ cols: [{ w: [] }] });
    save(); renderCanvas(); renderNav();
  }

  function addWidget(type) {
    var p = pages[editingPage];
    if (!p || !p.sections[ebWidgetTarget.sec]) return;
    var col = p.sections[ebWidgetTarget.sec].cols[ebWidgetTarget.col];
    if (!col) return;
    if (!col.w) col.w = [];
    var def = WIDGETS[type];
    var d = {};
    if (def && def.f) def.f.forEach(function (f) { if (f.d) d[f.k] = f.d; });
    col.w.push({ t: type, d: d });
    save(); renderCanvas(); renderNav();
  }

  function save() {
    var p = pages[editingPage];
    if (!p) return;
    savePages(pages);
    ebHistory = ebHistory.slice(0, ebHistoryIdx + 1);
    ebHistory.push(JSON.parse(JSON.stringify(p.sections)));
    ebHistoryIdx = ebHistory.length - 1;
  }

  function ebUndo() {
    if (ebHistoryIdx <= 0) return;
    ebHistoryIdx--;
    pages[editingPage].sections = JSON.parse(JSON.stringify(ebHistory[ebHistoryIdx]));
    savePages(pages); renderCanvas(); renderNav();
  }

  function ebRedo() {
    if (ebHistoryIdx >= ebHistory.length - 1) return;
    ebHistoryIdx++;
    pages[editingPage].sections = JSON.parse(JSON.stringify(ebHistory[ebHistoryIdx]));
    savePages(pages); renderCanvas(); renderNav();
  }

  // ── Helpers ──
  function $(id) { return document.getElementById(id); }
  function show(id) { var e = $(id); if (e) e.classList.add("active"); }
  function hide(id) { var e = $(id); if (e) e.classList.remove("active"); }
  function toggle(id) { var e = $(id); if (e) e.classList.toggle("hidden"); }
  function esc(s) { return escapeHTML(String(s || "")); }
  function pn(n) { return toPersianNumbers(String(n)); }


  var pages = getPages();
  var editingPage = null;
  var ebHistory = [];
  var ebHistoryIndex = -1;
  var ebSelectedElement = null;
  var ebCurrentDevice = "desktop";

  // Widget definitions
  var WIDGETS = {
    heading:    { name: "عنوان", icon: "H", fields: [{key:"text",label:"متن",type:"text",default:"عنوان جدید"},{key:"tag",label:"اندازه",type:"select",options:["h1","h2","h3","h4","h5","h6"],default:"h2"}] },
    text:       { name: "متن", icon: "T", fields: [{key:"content",label:"محتوا",type:"textarea",default:"متن نمونه"}] },
    image:      { name: "تصویر", icon: "🖼", fields: [{key:"src",label:"آدرس",type:"text"},{key:"alt",label:"متن جایگزین",type:"text"},{key:"width",label:"عرض",type:"text",default:"100%"}] },
    video:      { name: "ویدئو", icon: "▶", fields: [{key:"url",label:"آدرس ویدئو",type:"text"},{key:"poster",label:"تصویر پوستر",type:"text"}] },
    button:     { name: "دکمه", icon: "⬜", fields: [{key:"text",label:"متن",type:"text",default:"کلیک کنید"},{key:"link",label:"لینک",type:"text"},{key:"color",label:"رنگ پس‌زمینه",type:"color",default:"#2271b1"},{key:"textColor",label:"رنگ متن",type:"color",default:"#ffffff"},{key:"align",label:"تراز",type:"select",options:["center","left","right"],default:"center"}] },
    icon:       { name: "آیکون", icon: "★", fields: [{key:"name",label:"نام آیکون",type:"text",default:"★"},{key:"size",label:"اندازه",type:"text",default:"48px"},{key:"color",label:"رنگ",type:"color",default:"#2271b1"}] },
    divider:    { name: "جداکننده", icon: "—", fields: [{key:"width",label:"عرض",type:"text",default:"100%"},{key:"height",label:"ارتفاع",type:"text",default:"1px"},{key:"color",label:"رنگ",type:"color",default:"#e0e0e0"},{key:"style",label:"نوع",type:"select",options:["solid","dashed","dotted"],default:"solid"}] },
    spacer:     { name: "فاصله", icon: "↕", fields: [{key:"height",label:"ارتفاع (px)",type:"text",default:"40"}] },
    gallery:    { name: "گالری", icon: "⊞", fields: [{key:"images",label:"تصاویر (با کاما)",type:"textarea"},{key:"columns",label:"تعداد ستون",type:"select",options:["2","3","4"],default:"3"}] },
    testimonial:{ name: "نظر مشتری", icon: "❝", fields: [{key:"quote",label:"نقل‌قول",type:"textarea"},{key:"author",label:"نویسنده",type:"text"},{key:"avatar",label:"آواتار",type:"text"}] },
    counter:    { name: "شمارنده", icon: "#", fields: [{key:"number",label:"عدد",type:"text",default:"100"},{key:"suffix",label:"پسوند",type:"text",default:"+"},{key:"title",label:"عنوان",type:"text"}] },
    progress:   { name: "نوار پیشرفت", icon: "▰", fields: [{key:"percent",label:"درصد",type:"text",default:"75"},{key:"label",label:"برچسب",type:"text"},{key:"color",label:"رنگ",type:"color",default:"#2271b1"}] },
    tabs:       { name: "تب‌ها", icon: "⊟", fields: [{key:"items",label:"تب‌ها (عنوان:محتوا با کاما)",type:"textarea"}] },
    accordion:  { name: "آکاردئون", icon: "☰", fields: [{key:"items",label:"آیتم‌ها (عنوان:محتوا با کاما)",type:"textarea"}] },
    toggle:     { name: "تگل", icon: "▽", fields: [{key:"title",label:"عنوان",type:"text"},{key:"content",label:"محتوا",type:"textarea"}] },
    map:        { name: "نقشه", icon: "🗺", fields: [{key:"embed",label:"کد embed",type:"textarea"}] },
    code:       { name: "کد", icon: "{ }", fields: [{key:"code",label:"کد",type:"textarea"},{key:"language",label:"زبان",type:"text",default:"html"}] },
    html:       { name: "HTML", icon: "</>", fields: [{key:"html",label:"کد HTML",type:"textarea"}] },
    imageBox:   { name: "باکس تصویر", icon: "▣", fields: [{key:"src",label:"تصویر",type:"text"},{key:"title",label:"عنوان",type:"text"},{key:"desc",label:"توضیحات",type:"textarea"}] },
    iconBox:    { name: "باکس آیکون", icon: "◈", fields: [{key:"icon",label:"آیکون",type:"text",default:"★"},{key:"title",label:"عنوان",type:"text"},{key:"desc",label:"توضیحات",type:"textarea"},{key:"color",label:"رنگ",type:"color",default:"#2271b1"}] },
    cta:        { name: "دعوت به اقدام", icon: "📢", fields: [{key:"title",label:"عنوان",type:"text"},{key:"desc",label:"توضیحات",type:"textarea"},{key:"btnText",label:"متن دکمه",type:"text",default:"همین الان"},{key:"btnLink",label:"لینک دکمه",type:"text"},{key:"bgColor",label:"رنگ پس‌زمینه",type:"color",default:"#2271b1"}] },
    banner:     { name: "بنر کمپین", icon: "▰", fields: [{key:"title",label:"عنوان",type:"text",default:"بنر جدید"},{key:"image",label:"تصویر",type:"text",default:"assets/consulting-room.jpeg"},{key:"caption",label:"متن",type:"textarea"},{key:"link",label:"لینک",type:"text",default:"contact.html"}] },
    form:       { name: "فرم تماس", icon: "▤", fields: [{key:"title",label:"عنوان فرم",type:"text",default:"درخواست مشاوره"},{key:"fields",label:"فیلدها با کاما",type:"textarea",default:"نام,ایمیل,شماره تماس,پیام"},{key:"button",label:"متن دکمه",type:"text",default:"ارسال"}] },
    pricing:    { name: "جدول قیمت", icon: "₪", fields: [{key:"plan",label:"نام پلن",type:"text",default:"مشاوره رشد"},{key:"price",label:"قیمت",type:"text",default:"تماس بگیرید"},{key:"features",label:"امکانات با کاما",type:"textarea",default:"تحلیل وضعیت,نقشه راه,جلسه اجرایی"}] },
    postsGrid:  { name: "شبکه پست‌ها", icon: "▦", fields: [{key:"title",label:"عنوان",type:"text",default:"آخرین نوشته‌ها"},{key:"count",label:"تعداد",type:"text",default:"3"}] },
  };

  function initPageEditor() {
    pages = getPages();
    renderPagesList();

    document.getElementById("btn-new-page").addEventListener("click", function () {
      var name = prompt("نام صفحه جدید (انگلیسی):");
      if (!name) return;
      name = name.toLowerCase().replace(/[^a-z0-9-]/g, "");
      if (!name || pages[name]) { alert("نام نامعتبر یا تکراری."); return; }
      pages[name] = { title: name, sections: [], seoTitle: "", seoDesc: "", seoKeywords: "" };
      savePages(pages);
      openPageBuilder(name);
    });

    document.getElementById("eb-back-pages").addEventListener("click", function () {
      document.getElementById("content-pages").classList.add("active");
      document.getElementById("content-editor").classList.remove("active");
      editingPage = null;
      renderPagesList();
    });

    document.getElementById("eb-save-btn").addEventListener("click", function () {
      if (!editingPage) return;
      savePages(pages);
      alert("صفحه ذخیره شد.");
    });

    document.getElementById("eb-undo").addEventListener("click", function () { ebUndo(); });
    document.getElementById("eb-redo").addEventListener("click", function () { ebRedo(); });

    document.getElementById("eb-navigator-toggle").addEventListener("click", function () {
      document.getElementById("eb-navigator").classList.toggle("hidden");
    });

    document.getElementById("eb-navigator-close").addEventListener("click", function () {
      document.getElementById("eb-navigator").classList.add("hidden");
    });

    document.getElementById("eb-settings-close").addEventListener("click", function () {
      document.getElementById("eb-settings").classList.add("hidden");
    });

    document.getElementById("eb-add-section").addEventListener("click", function () { ebAddSection(); });
    document.getElementById("eb-add-section-empty").addEventListener("click", function () { ebAddSection(); });

    // Responsive toggle
    document.querySelectorAll(".eb-res-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        document.querySelectorAll(".eb-res-btn").forEach(function (b) { b.classList.remove("active"); });
        this.classList.add("active");
        ebCurrentDevice = this.getAttribute("data-device");
        var canvas = document.getElementById("eb-canvas");
        canvas.className = "eb-canvas" + (ebCurrentDevice !== "desktop" ? " device-" + ebCurrentDevice : "");
      });
    });

    // Widget panel
    document.getElementById("eb-widget-panel-close").addEventListener("click", function () {
      document.getElementById("eb-widget-panel").style.display = "none";
    });

    document.getElementById("eb-widget-search").addEventListener("input", function () {
      var q = this.value.toLowerCase();
      document.querySelectorAll(".eb-widget-item").forEach(function (item) {
        var name = item.getAttribute("data-widget-name") || "";
        item.style.display = name.includes(q) ? "" : "none";
      });
    });

    // Populate widget grid
    renderWidgetGrid();
  }

  function renderWidgetGrid() {
    var grid = document.getElementById("eb-widget-grid");
    grid.innerHTML = "";
    for (var key in WIDGETS) {
      var w = WIDGETS[key];
      var item = document.createElement("div");
      item.className = "eb-widget-item";
      item.setAttribute("data-widget", key);
      item.setAttribute("data-widget-name", w.name);
      item.innerHTML = '<div class="eb-widget-item-icon">' + w.icon + '</div><div class="eb-widget-item-name">' + w.name + '</div>';
      item.addEventListener("click", function () {
        var widgetKey = this.getAttribute("data-widget");
        ebAddWidget(widgetKey);
        document.getElementById("eb-widget-panel").style.display = "none";
      });
      grid.appendChild(item);
    }
  }

  function renderPagesList() {
    var tbody = document.getElementById("pages-table-body");
    tbody.innerHTML = "";
    for (var key in pages) {
      var p = pages[key];
      var widgetCount = (p.sections || []).reduce(function (sum, s) { return sum + (s.columns || []).reduce(function (s2, c) { return s2 + (c.widgets || []).length; }, 0); }, 0);
      var tr = document.createElement("tr");
      tr.innerHTML = '<td>' + escapeHTML(p.title || key) + '</td>' +
        '<td>' + key + '.html</td>' +
        '<td>' + toPersianNumbers(String(widgetCount)) + ' ویجت</td>' +
        '<td><span class="badge badge-success">فعال</span></td>' +
        '<td><button class="btn-sm btn-edit-page" data-page="' + key + '">ویرایش</button></td>';
      tbody.appendChild(tr);
    }
    tbody.querySelectorAll(".btn-edit-page").forEach(function (btn) {
      btn.addEventListener("click", function () { openPageBuilder(this.getAttribute("data-page")); });
    });
  }

  function openPageBuilder(key) {
    editingPage = key;
    var p = pages[key];
    if (!p) return;
    if (!p.sections) p.sections = [];

    document.getElementById("eb-page-title-display").textContent = p.title || key;
    document.getElementById("content-pages").classList.remove("active");
    document.getElementById("content-editor").classList.add("active");

    ebHistory = [JSON.parse(JSON.stringify(p.sections))];
    ebHistoryIndex = 0;
    ebSelectedElement = null;

    renderCanvas();
    renderNavigator();
  }

  // ── Canvas Rendering ──

  function renderCanvas() {
    var canvas = document.getElementById("eb-canvas");
    var empty = document.getElementById("eb-canvas-empty");
    var p = pages[editingPage];
    if (!p || !p.sections || !p.sections.length) {
      canvas.innerHTML = "";
      canvas.appendChild(empty);
      empty.style.display = "flex";
      return;
    }
    empty.style.display = "none";
    canvas.innerHTML = "";

    p.sections.forEach(function (section, si) {
      var secEl = document.createElement("div");
      secEl.className = "eb-section" + (ebSelectedElement && ebSelectedElement.type === "section" && ebSelectedElement.index === si ? " selected" : "");
      secEl.setAttribute("data-section-index", si);

      // Handle bar
      var handle = document.createElement("div");
      handle.className = "eb-section-handle";
      handle.innerHTML = '<button title="افزودن ستون" data-action="add-column">+</button>' +
        '<button title="حذف بخش" data-action="delete-section">✕</button>';
      secEl.appendChild(handle);

      handle.querySelector('[data-action="add-column"]').addEventListener("click", function (e) {
        e.stopPropagation();
        if (!section.columns) section.columns = [];
        section.columns.push({ widgets: [] });
        ebSave();
        renderCanvas();
        renderNavigator();
      });

      handle.querySelector('[data-action="delete-section"]').addEventListener("click", function (e) {
        e.stopPropagation();
        p.sections.splice(si, 1);
        ebSave();
        renderCanvas();
        renderNavigator();
      });

      // Columns container
      var colsEl = document.createElement("div");
      colsEl.className = "eb-columns";
      colsEl.style.gridTemplateColumns = "repeat(" + Math.max(1, (section.columns || []).length) + ", 1fr)";

      (section.columns || []).forEach(function (column, ci) {
        var colEl = document.createElement("div");
        colEl.className = "eb-column" + (ebSelectedElement && ebSelectedElement.type === "column" && ebSelectedElement.secIndex === si && ebSelectedElement.colIndex === ci ? " selected" : "");
        colEl.setAttribute("data-sec-index", si);
        colEl.setAttribute("data-col-index", ci);

        colEl.addEventListener("click", function (e) {
          if (e.target === colEl) {
            ebSelectElement({ type: "column", secIndex: si, colIndex: ci });
          }
        });

        // Render widgets
        (column.widgets || []).forEach(function (widget, wi) {
          var wEl = document.createElement("div");
          wEl.className = "eb-widget" + (ebSelectedElement && ebSelectedElement.type === "widget" && ebSelectedElement.secIndex === si && ebSelectedElement.colIndex === ci && ebSelectedElement.widgetIndex === wi ? " selected" : "");
          wEl.setAttribute("data-sec-index", si);
          wEl.setAttribute("data-col-index", ci);
          wEl.setAttribute("data-widget-index", wi);
          wEl.draggable = true;

          var handleEl = document.createElement("div");
          handleEl.className = "eb-widget-handle";
          handleEl.textContent = "⋮⋮";
          wEl.appendChild(handleEl);

          var deleteEl = document.createElement("div");
          deleteEl.className = "eb-widget-delete";
          deleteEl.textContent = "✕";
          wEl.appendChild(deleteEl);

          var contentEl = document.createElement("div");
          contentEl.className = "eb-widget-content";
          contentEl.innerHTML = ebRenderWidget(widget);
          wEl.appendChild(contentEl);

          wEl.addEventListener("click", function (e) {
            e.stopPropagation();
            ebSelectElement({ type: "widget", secIndex: si, colIndex: ci, widgetIndex: wi });
          });

          deleteEl.addEventListener("click", function (e) {
            e.stopPropagation();
            column.widgets.splice(wi, 1);
            ebSave();
            renderCanvas();
            renderNavigator();
          });

          // Drag start
          wEl.addEventListener("dragstart", function (e) {
            e.dataTransfer.setData("text/plain", JSON.stringify({ secIndex: si, colIndex: ci, widgetIndex: wi }));
            wEl.classList.add("eb-dragging");
          });
          wEl.addEventListener("dragend", function () { wEl.classList.remove("eb-dragging"); });

          colEl.appendChild(wEl);
        });

        // Add widget button
        var addBtn = document.createElement("button");
        addBtn.className = "eb-add-widget-btn";
        addBtn.textContent = "+ افزودن ویجت";
        addBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          ebCurrentSection = si;
          ebCurrentColumn = ci;
          document.getElementById("eb-widget-panel").style.display = "block";
        });
        colEl.appendChild(addBtn);

        // Drop target
        colEl.addEventListener("dragover", function (e) { e.preventDefault(); colEl.classList.add("eb-drop-target"); });
        colEl.addEventListener("dragleave", function () { colEl.classList.remove("eb-drop-target"); });
        colEl.addEventListener("drop", function (e) {
          e.preventDefault();
          colEl.classList.remove("eb-drop-target");
          try {
            var data = JSON.parse(e.dataTransfer.getData("text/plain"));
            var srcCol = p.sections[data.secIndex].columns[data.colIndex];
            var widget = srcCol.widgets.splice(data.widgetIndex, 1)[0];
            column.widgets.push(widget);
            ebSave();
            renderCanvas();
            renderNavigator();
          } catch (err) {}
        });

        colsEl.appendChild(colEl);
      });

      secEl.appendChild(colsEl);
      canvas.appendChild(secEl);
    });
  }

  var ebCurrentSection = 0;
  var ebCurrentColumn = 0;

  function ebRenderWidget(widget) {
    var d = widget.data || {};
    switch (widget.type) {
      case "heading": return "<" + (d.tag || "h2") + ">" + escapeHTML(d.text || "عنوان") + "</" + (d.tag || "h2") + ">";
      case "text": return "<p>" + (d.content || "متن نمونه") + "</p>";
      case "image": return '<img src="' + escapeHTML(d.src || "") + '" alt="' + escapeHTML(d.alt || "") + '" style="width:' + (d.width || "100%") + ';border-radius:4px" />';
      case "video": return '<div style="background:#000;padding:40px;text-align:center;border-radius:4px;color:#fff">▶ ویدئو</div>';
      case "button": return '<a href="' + escapeHTML(d.link || "#") + '" style="display:inline-block;padding:10px 24px;background:' + (d.color || "#2271b1") + ';color:' + (d.textColor || "#fff") + ';border-radius:6px;text-decoration:none;font-weight:700;text-align:' + (d.align || "center") + '">' + escapeHTML(d.text || "کلیک") + '</a>';
      case "icon": return '<div style="font-size:' + (d.size || "48px") + ';color:' + (d.color || "#2271b1") + ';text-align:center">' + escapeHTML(d.name || "★") + '</div>';
      case "divider": return '<hr style="width:' + (d.width || "100%") + ';height:' + (d.height || "1px") + ';background:' + (d.color || "#e0e0e0") + ';border:none;border-style:' + (d.style || "solid") + '" />';
      case "spacer": return '<div style="height:' + (d.height || "40") + 'px"></div>';
      case "gallery": return '<div style="display:grid;grid-template-columns:repeat(' + (d.columns || 3) + ',1fr);gap:8px"><div style="background:#f0f0f0;padding:30px;text-align:center;border-radius:4px;color:#999">گالری تصاویر</div></div>';
      case "testimonial": return '<blockquote style="border-right:3px solid #2271b1;padding:16px;background:#f8f9fa;border-radius:0 6px 6px 0;margin:0"><p>' + escapeHTML(d.quote || "") + '</p><cite>— ' + escapeHTML(d.author || "") + '</cite></blockquote>';
      case "counter": return '<div style="text-align:center"><div style="font-size:2.5rem;font-weight:900;color:#2271b1">' + escapeHTML(d.number || "0") + escapeHTML(d.suffix || "") + '</div><div>' + escapeHTML(d.title || "") + '</div></div>';
      case "progress": return '<div style="margin:8px 0"><div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:0.85rem"><span>' + escapeHTML(d.label || "") + '</span><span>' + escapeHTML(d.percent || "0") + '%</span></div><div style="background:#e0e0e0;border-radius:4px;height:8px"><div style="width:' + (d.percent || 0) + '%;background:' + (d.color || "#2271b1") + ';height:100%;border-radius:4px"></div></div></div>';
      case "tabs": return '<div style="display:flex;gap:4px;border-bottom:2px solid #e0e0e0;margin-bottom:12px"><div style="padding:8px 16px;border-bottom:2px solid #2271b1;color:#2271b1;font-weight:700">تب ۱</div><div style="padding:8px 16px;color:#999">تب ۲</div></div><div style="padding:12px;background:#f8f9fa;border-radius:4px">محتوای تب فعال</div>';
      case "accordion": return '<div style="border:1px solid #e0e0e0;border-radius:4px"><div style="padding:12px 16px;background:#f8f9fa;border-bottom:1px solid #e0e0e0;cursor:pointer;display:flex;justify-content:space-between"><span>عنوان آیتم</span><span>▼</span></div><div style="padding:12px 16px;color:#666">محتوای آیتم</div></div>';
      case "toggle": return '<div style="border:1px solid #e0e0e0;border-radius:4px;padding:12px 16px;display:flex;justify-content:space-between;cursor:pointer"><span>' + escapeHTML(d.title || "تگل") + '</span><span>▼</span></div>';
      case "map": return '<div style="background:#e8e8e8;padding:40px;text-align:center;border-radius:4px;color:#999">🗺 نقشه گوگل</div>';
      case "code": return '<pre style="background:#1e1e2e;color:#cdd6f4;padding:12px;border-radius:4px;font-size:0.82rem;overflow-x:auto;direction:ltr;text-align:left">' + escapeHTML(d.code || "") + '</pre>';
      case "html": return '<div>' + (d.html || "") + '</div>';
      case "imageBox": return '<div style="text-align:center"><img src="' + escapeHTML(d.src || "") + '" style="max-width:100%;border-radius:4px" /><h3 style="margin:8px 0">' + escapeHTML(d.title || "") + '</h3><p style="color:#666">' + escapeHTML(d.desc || "") + '</p></div>';
      case "iconBox": return '<div style="text-align:center;padding:16px"><div style="font-size:2rem;color:' + (d.color || "#2271b1") + '">' + escapeHTML(d.icon || "★") + '</div><h3 style="margin:8px 0">' + escapeHTML(d.title || "") + '</h3><p style="color:#666">' + escapeHTML(d.desc || "") + '</p></div>';
      case "cta": return '<div style="background:' + (d.bgColor || "#2271b1") + ';color:#fff;padding:32px;text-align:center;border-radius:8px"><h2 style="margin:0 0 8px;color:#fff">' + escapeHTML(d.title || "") + '</h2><p style="margin:0 0 16px;opacity:0.9">' + escapeHTML(d.desc || "") + '</p><a href="' + escapeHTML(d.btnLink || "#") + '" style="display:inline-block;padding:12px 32px;background:#fff;color:' + (d.bgColor || "#2271b1") + ';border-radius:6px;text-decoration:none;font-weight:700">' + escapeHTML(d.btnText || "همین الان") + '</a></div>';
      case "banner": return '<section style="min-height:220px;background:url(' + escapeHTML(d.image || "") + ') center/cover;border-radius:8px;display:grid;align-content:end;padding:24px;color:#fff;overflow:hidden"><h2 style="color:#fff;margin:0 0 6px">' + escapeHTML(d.title || "") + '</h2><p style="max-width:520px">' + escapeHTML(d.caption || "") + '</p><a href="' + escapeHTML(d.link || "#") + '" style="color:#fff;font-weight:800">مشاهده</a></section>';
      case "form": return '<form style="display:grid;gap:10px;border:1px solid #e0e0e0;padding:18px;border-radius:8px"><strong>' + escapeHTML(d.title || "") + '</strong>' + String(d.fields || "").split(",").map(function (f) { return '<input placeholder="' + escapeHTML(f.trim()) + '" style="padding:10px;border:1px solid #ddd;border-radius:6px">'; }).join("") + '<button type="button" style="padding:10px 18px;background:#2271b1;color:#fff;border:0;border-radius:6px;font-weight:800">' + escapeHTML(d.button || "ارسال") + '</button></form>';
      case "pricing": return '<div style="border:1px solid #e0e0e0;border-radius:8px;padding:20px"><h3>' + escapeHTML(d.plan || "") + '</h3><strong style="font-size:1.4rem;color:#2271b1">' + escapeHTML(d.price || "") + '</strong><ul>' + String(d.features || "").split(",").map(function (f) { return '<li>' + escapeHTML(f.trim()) + '</li>'; }).join("") + '</ul></div>';
      case "postsGrid": return '<div><h3>' + escapeHTML(d.title || "") + '</h3><div style="display:grid;grid-template-columns:repeat(' + Math.min(4, Math.max(1, parseInt(d.count || 3))) + ',1fr);gap:12px"><article style="border:1px solid #e0e0e0;border-radius:8px;padding:14px">نمونه پست</article><article style="border:1px solid #e0e0e0;border-radius:8px;padding:14px">نمونه پست</article><article style="border:1px solid #e0e0e0;border-radius:8px;padding:14px">نمونه پست</article></div></div>';
      default: return '<div class="eb-placeholder">ویجت ناشناخته</div>';
    }
  }

  // ── Element Selection ──

  function ebSelectElement(el) {
    ebSelectedElement = el;
    renderCanvas();
    renderSettingsPanel();
    renderNavigator();
  }

  function renderSettingsPanel() {
    var body = document.getElementById("eb-settings-body");
    var title = document.getElementById("eb-settings-title");
    document.getElementById("eb-settings").classList.remove("hidden");

    if (!ebSelectedElement) {
      body.innerHTML = '<p class="eb-settings-empty">یک عنصر را انتخاب کنید</p>';
      title.textContent = "تنظیمات";
      return;
    }

    if (ebSelectedElement.type === "section") {
      title.textContent = "تنظیمات بخش";
      body.innerHTML = '<div class="field"><label>تعداد ستون</label><select id="eb-sec-cols">' +
        '<option value="1">۱</option><option value="2">۲</option><option value="3">۳</option><option value="4">۴</option>' +
        '</select></div><div class="field"><label>پس‌زمینه</label><input type="color" id="eb-sec-bg" value="#ffffff" /></div>';
      var p = pages[editingPage];
      var sec = p.sections[ebSelectedElement.index];
      document.getElementById("eb-sec-cols").value = (sec.columns || []).length || 1;
      document.getElementById("eb-sec-bg").value = sec.bg || "#ffffff";
      document.getElementById("eb-sec-cols").addEventListener("change", function () {
        var target = parseInt(this.value);
        while (sec.columns.length < target) sec.columns.push({ widgets: [] });
        while (sec.columns.length > target) sec.columns.pop();
        ebSave(); renderCanvas(); renderNavigator();
      });
      document.getElementById("eb-sec-bg").addEventListener("input", function () {
        sec.bg = this.value;
        var secEl = document.querySelector('[data-section-index="' + ebSelectedElement.index + '"]');
        if (secEl) secEl.style.background = this.value;
      });
    } else if (ebSelectedElement.type === "widget") {
      var widget = pages[editingPage].sections[ebSelectedElement.secIndex].columns[ebSelectedElement.colIndex].widgets[ebSelectedElement.widgetIndex];
      var wDef = WIDGETS[widget.type];
      title.textContent = "تنظیمات: " + (wDef ? wDef.name : widget.type);
      var html = "";
      if (wDef && wDef.fields) {
        wDef.fields.forEach(function (f) {
          var val = (widget.data || {})[f.key] || f.default || "";
          if (f.type === "textarea") {
            html += '<div class="field"><label>' + f.label + '</label><textarea id="eb-f-' + f.key + '">' + escapeHTML(val) + '</textarea></div>';
          } else if (f.type === "select") {
            html += '<div class="field"><label>' + f.label + '</label><select id="eb-f-' + f.key + '">' +
              f.options.map(function (o) { return '<option value="' + o + '"' + (val === o ? ' selected' : '') + '>' + o + '</option>'; }).join("") +
              '</select></div>';
          } else if (f.type === "color") {
            html += '<div class="field"><label>' + f.label + '</label><input type="color" id="eb-f-' + f.key + '" value="' + val + '" /></div>';
          } else {
            html += '<div class="field"><label>' + f.label + '</label><input type="text" id="eb-f-' + f.key + '" value="' + escapeHTML(val) + '" /></div>';
          }
        });
      }
      body.innerHTML = html;

      // Bind change events
      body.querySelectorAll("input, textarea, select").forEach(function (el) {
        el.addEventListener("input", function () {
          var key = this.id.replace("eb-f-", "");
          if (!widget.data) widget.data = {};
          widget.data[key] = this.value;
          ebSave();
          // Update canvas widget content
          var wEl = document.querySelector('[data-sec-index="' + ebSelectedElement.secIndex + '"][data-col-index="' + ebSelectedElement.colIndex + '"][data-widget-index="' + ebSelectedElement.widgetIndex + '"] .eb-widget-content');
          if (wEl) wEl.innerHTML = ebRenderWidget(widget);
        });
      });
    } else {
      title.textContent = "تنظیمات ستون";
      body.innerHTML = '<p class="eb-settings-empty">ستون انتخاب شده</p>';
    }
  }

  // ── Navigator ──

  function renderNavigator() {
    var tree = document.getElementById("eb-navigator-tree");
    var p = pages[editingPage];
    if (!p || !p.sections) { tree.innerHTML = '<p style="color:#666;padding:12px;font-size:0.82rem">بخشی وجود ندارد</p>'; return; }

    var html = "";
    p.sections.forEach(function (section, si) {
      var isActive = ebSelectedElement && ebSelectedElement.type === "section" && ebSelectedElement.index === si;
      html += '<div class="eb-nav-section"><div class="eb-nav-item' + (isActive ? " active" : "") + '" data-select="section-' + si + '">' +
        '<span class="eb-nav-icon">▦</span><span class="eb-nav-label">بخش ' + toPersianNumbers(String(si + 1)) + '</span>' +
        '<span class="eb-nav-delete" data-delete="section-' + si + '">✕</span></div>';
      html += '<div class="eb-nav-children">';
      (section.columns || []).forEach(function (column, ci) {
        html += '<div class="eb-nav-column"><div class="eb-nav-item" data-select="column-' + si + '-' + ci + '">' +
          '<span class="eb-nav-icon">▫</span><span class="eb-nav-label">ستون ' + toPersianNumbers(String(ci + 1)) + '</span></div>';
        (column.widgets || []).forEach(function (widget, wi) {
          var wDef = WIDGETS[widget.type];
          html += '<div class="eb-nav-item" data-select="widget-' + si + '-' + ci + '-' + wi + '">' +
            '<span class="eb-nav-icon">' + (wDef ? wDef.icon : "?") + '</span>' +
            '<span class="eb-nav-label">' + (wDef ? wDef.name : widget.type) + '</span></div>';
        });
        html += '</div>';
      });
      html += '</div>';
    });
    tree.innerHTML = html;

    // Bind navigator clicks
    tree.querySelectorAll(".eb-nav-item[data-select]").forEach(function (item) {
      item.addEventListener("click", function () {
        var parts = this.getAttribute("data-select").split("-");
        if (parts[0] === "section") {
          ebSelectElement({ type: "section", index: parseInt(parts[1]) });
        } else if (parts[0] === "column") {
          ebSelectElement({ type: "column", secIndex: parseInt(parts[1]), colIndex: parseInt(parts[2]) });
        } else if (parts[0] === "widget") {
          ebSelectElement({ type: "widget", secIndex: parseInt(parts[1]), colIndex: parseInt(parts[2]), widgetIndex: parseInt(parts[3]) });
        }
      });
    });

    tree.querySelectorAll(".eb-nav-delete[data-delete]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var parts = this.getAttribute("data-delete").split("-");
        var p = pages[editingPage];
        if (parts[0] === "section") {
          p.sections.splice(parseInt(parts[1]), 1);
          ebSave(); renderCanvas(); renderNavigator();
        }
      });
    });
  }

  // ── Add Section ──

  function ebAddSection() {
    var p = pages[editingPage];
    if (!p) return;
    if (!p.sections) p.sections = [];
    p.sections.push({ columns: [{ widgets: [] }], bg: "#ffffff" });
    ebSave();
    renderCanvas();
    renderNavigator();
  }

  // ── Add Widget ──

  function ebAddWidget(type) {
    var p = pages[editingPage];
    if (!p || !p.sections[ebCurrentSection]) return;
    var col = p.sections[ebCurrentSection].columns[ebCurrentColumn];
    if (!col) return;
    if (!col.widgets) col.widgets = [];
    var wDef = WIDGETS[type];
    var data = {};
    if (wDef && wDef.fields) {
      wDef.fields.forEach(function (f) { if (f.default) data[f.key] = f.default; });
    }
    col.widgets.push({ type: type, data: data });
    ebSave();
    renderCanvas();
    renderNavigator();
  }

  // ── History ──

  function ebSave() {
    var p = pages[editingPage];
    if (!p) return;
    savePages(pages);
    ebHistory = ebHistory.slice(0, ebHistoryIndex + 1);
    ebHistory.push(JSON.parse(JSON.stringify(p.sections)));
    ebHistoryIndex = ebHistory.length - 1;
  }

  function ebUndo() {
    if (ebHistoryIndex <= 0) return;
    ebHistoryIndex--;
    pages[editingPage].sections = JSON.parse(JSON.stringify(ebHistory[ebHistoryIndex]));
    savePages(pages);
    renderCanvas();
    renderNavigator();
  }

  function ebRedo() {
    if (ebHistoryIndex >= ebHistory.length - 1) return;
    ebHistoryIndex++;
    pages[editingPage].sections = JSON.parse(JSON.stringify(ebHistory[ebHistoryIndex]));
    savePages(pages);
    renderCanvas();
    renderNavigator();
  }

  // ════════════════════════════════════════════════
  //  USERS — Dynamic from localStorage
  // ════════════════════════════════════════════════

  function initUsers() {
    loadAdminUsers();
    loadMembers();

    document
      .getElementById("btn-new-admin-user")
      .addEventListener("click", function () {
        showModal("new-admin-user-modal");
      });

    document
      .getElementById("btn-save-admin-user")
      .addEventListener("click", async function () {
        var name = document.getElementById("modal-admin-name").value.trim();
        var email = document
          .getElementById("modal-admin-email")
          .value.trim()
          .toLowerCase();
        var phone = document.getElementById("modal-admin-phone").value.trim();
        var role = document.getElementById("modal-admin-role").value;
        var pass = document.getElementById("modal-admin-pass").value;
        if (!name || !email || !pass) {
          alert("لطفاً فیلدهای ضروری را پر کنید.");
          return;
        }
        if (pass.length < 6) {
          alert("رمز باید حداقل ۶ کاراکتر باشد.");
          return;
        }
        try {
          await api.createUser({ name, email, phone, role, password: pass });
          hideModal();
          loadAdminUsers();
          alert("مدیر «" + name + "» اضافه شد.");
        } catch (err) {
          alert(err.message);
        }
      });
  }

  async function loadAdminUsers() {
    try {
      var users = await api.getAdmins();
      renderAdminUsersList(users);
    } catch (e) {
      console.error(e);
    }
  }

  function renderAdminUsersList(users) {
    var tbody = document.getElementById("admin-users-table-body");
    var empty = document.getElementById("admin-users-empty");
    if (!users.length) {
      tbody.innerHTML = "";
      empty.style.display = "block";
      return;
    }
    empty.style.display = "none";
    tbody.innerHTML = users
      .map(function (u) {
        var roleBadge =
          u.role === "admin"
            ? '<span class="badge badge-primary">مدیر سایت</span>'
            : '<span class="badge badge-info">مدیر محتوا</span>';
        return (
          "<tr>" +
          '<td data-label="نام">' +
          escapeHTML(u.name) +
          "</td>" +
          '<td data-label="ایمیل">' +
          escapeHTML(u.email) +
          "</td>" +
          '<td data-label="شماره">' +
          escapeHTML(u.phone || "—") +
          "</td>" +
          '<td data-label="نقش">' +
          roleBadge +
          "</td>" +
          '<td data-label="عملیات">' +
          '<button class="btn-sm btn-edit-admin" data-id="' +
          u.id +
          '">تغییر رمز</button> ' +
          '<button class="btn-sm btn-danger btn-delete-admin" data-id="' +
          u.id +
          '">حذف</button>' +
          "</td></tr>"
        );
      })
      .join("");

    tbody.querySelectorAll(".btn-edit-admin").forEach(function (btn) {
      btn.addEventListener("click", async function () {
        var id = this.getAttribute("data-id");
        var newPass = prompt("رمز جدید را وارد کنید:", "");
        if (newPass && newPass.length >= 6) {
          try {
            await api.updateUser(id, { password: newPass });
            alert("رمز عبور تغییر کرد.");
          } catch (err) {
            alert(err.message);
          }
        } else if (newPass !== null) {
          alert("رمز باید حداقل ۶ کاراکتر باشد.");
        }
      });
    });

    tbody.querySelectorAll(".btn-delete-admin").forEach(function (btn) {
      btn.addEventListener("click", async function () {
        if (!confirm("آیا از حذف مطمئن هستید؟")) return;
        try {
          await api.deleteUser(this.getAttribute("data-id"));
          loadAdminUsers();
        } catch (err) {
          alert(err.message);
        }
      });
    });
    convertNumbersInScope(tbody);
  }

  async function loadMembers() {
    try {
      var members = await api.getMembers();
      renderMembersList(members);
    } catch (e) {
      console.error(e);
    }
  }

  function renderMembersList(members) {
    var tbody = document.getElementById("members-table-body");
    var empty = document.getElementById("members-empty");
    if (!members.length) {
      tbody.innerHTML = "";
      empty.style.display = "block";
      return;
    }
    empty.style.display = "none";
    tbody.innerHTML = members
      .map(function (u) {
        var nl = u.newsletter
          ? '<span style="color:var(--admin-success)">✓</span>'
          : '<span style="color:var(--admin-text-muted)">—</span>';
        return (
          "<tr>" +
          '<td data-label="نام">' +
          escapeHTML(u.name) +
          "</td>" +
          '<td data-label="ایمیل">' +
          escapeHTML(u.email) +
          "</td>" +
          '<td data-label="شماره">' +
          escapeHTML(u.phone || "—") +
          "</td>" +
          '<td data-label="تاریخ">' +
          persianDateShort(u.created_at) +
          "</td>" +
          '<td data-label="خبرنامه">' +
          nl +
          "</td>" +
          '<td data-label="عملیات">' +
          '<button class="btn-sm btn-edit-member" data-id="' +
          u.id +
          '">ویرایش</button> ' +
          '<button class="btn-sm btn-danger btn-delete-member" data-id="' +
          u.id +
          '">حذف</button>' +
          "</td></tr>"
        );
      })
      .join("");

    tbody.querySelectorAll(".btn-edit-member").forEach(function (btn) {
      btn.addEventListener("click", async function () {
        var id = this.getAttribute("data-id");
        var member = members.find(function (u) {
          return u.id == id;
        });
        if (!member) return;
        document.getElementById("modal-member-name").value = member.name;
        document.getElementById("modal-member-email").value = member.email;
        document.getElementById("modal-member-phone").value =
          member.phone || "";
        document.getElementById("modal-member-pass").value = "";
        document.getElementById("modal-member-newsletter").checked =
          !!member.newsletter;
        document.getElementById("btn-save-member").onclick = async function () {
          var data = {
            name: document.getElementById("modal-member-name").value.trim(),
            phone: document.getElementById("modal-member-phone").value.trim(),
            newsletter: document.getElementById("modal-member-newsletter")
              .checked,
          };
          var np = document.getElementById("modal-member-pass").value;
          if (np && np.length >= 6) data.password = np;
          try {
            await api.updateUser(id, data);
            hideModal();
            loadMembers();
            alert("ذخیره شد.");
          } catch (err) {
            alert(err.message);
          }
        };
        showModal("edit-member-modal");
      });
    });

    tbody.querySelectorAll(".btn-delete-member").forEach(function (btn) {
      btn.addEventListener("click", async function () {
        if (!confirm("آیا از حذف مطمئن هستید؟")) return;
        try {
          await api.deleteUser(this.getAttribute("data-id"));
          loadMembers();
        } catch (err) {
          alert(err.message);
        }
      });
    });
    convertNumbersInScope(tbody);
  }

  function renderMembersTable() {
    var members = JSON.parse(localStorage.getItem("site_users") || "[]");
    var tbody = document.getElementById("members-table-body");
    var empty = document.getElementById("members-empty");
    if (!members.length) {
      tbody.innerHTML = "";
      empty.style.display = "block";
      return;
    }
    empty.style.display = "none";
    tbody.innerHTML = members
      .map(function (u, i) {
        var nlCheck = u.newsletter
          ? '<span style="color:var(--admin-success)">✓</span>'
          : '<span style="color:var(--admin-text-muted)">—</span>';
        return (
          "<tr>" +
          '<td data-label="نام">' +
          escapeHTML(u.name) +
          "</td>" +
          '<td data-label="ایمیل">' +
          escapeHTML(u.email) +
          "</td>" +
          '<td data-label="شماره">' +
          escapeHTML(u.phone || "—") +
          "</td>" +
          '<td data-label="تاریخ">' +
          persianDateShort(u.date) +
          "</td>" +
          '<td data-label="خبرنامه">' +
          nlCheck +
          "</td>" +
          '<td data-label="عملیات">' +
          '<button class="btn-sm btn-edit-member" data-idx="' +
          i +
          '">ویرایش</button> ' +
          '<button class="btn-sm btn-danger btn-delete-member" data-email="' +
          escapeHTML(u.email) +
          '">حذف</button>' +
          "</td></tr>"
        );
      })
      .join("");

    tbody.querySelectorAll(".btn-edit-member").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var idx = parseInt(this.getAttribute("data-idx"));
        var u = members[idx];
        if (!u) return;
        document.getElementById("modal-member-name").value = u.name;
        document.getElementById("modal-member-email").value = u.email;
        document.getElementById("modal-member-phone").value = u.phone || "";
        document.getElementById("modal-member-pass").value = "";
        document.getElementById("modal-member-newsletter").checked =
          !!u.newsletter;

        document.getElementById("btn-save-member").onclick = function () {
          var newName = document
            .getElementById("modal-member-name")
            .value.trim();
          var newPhone = document
            .getElementById("modal-member-phone")
            .value.trim();
          var newPass = document.getElementById("modal-member-pass").value;
          var newNl = document.getElementById(
            "modal-member-newsletter",
          ).checked;
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
        members = members.filter(function (u) {
          return u.email !== email;
        });
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
    lb.style.cssText =
      "display:none;position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.9);display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:0;visibility:hidden;transition:opacity 250ms ease,visibility 250ms ease;";
    lb.innerHTML =
      '<img id="lightbox-img" style="max-width:90vw;max-height:90vh;object-fit:contain;border-radius:8px" /><button id="lightbox-close" style="position:absolute;top:16px;left:16px;width:40px;height:40px;border-radius:50%;border:1px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.1);color:#fff;font-size:1.3rem;cursor:pointer;display:grid;place-items:center">&times;</button>';
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

    lb.addEventListener("click", function (e) {
      if (e.target !== lbImg) closeLightbox();
    });
    lbClose.addEventListener("click", closeLightbox);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeLightbox();
    });
  }

  // ════════════════════════════════════════════════
  //  FILES — Functional upload/download
  // ════════════════════════════════════════════════

  var siteFiles = [];

  function initFiles() {
    try {
      siteFiles = JSON.parse(localStorage.getItem("site_files") || "[]");
    } catch (e) {
      siteFiles = [];
    }
    renderFilesTable();

    var uploadBtn = document.getElementById("file-upload-btn");
    var fileInput = document.getElementById("file-upload-input");
    if (uploadBtn && fileInput) {
      uploadBtn.addEventListener("click", function () {
        fileInput.click();
      });
      fileInput.addEventListener("change", function () {
        Array.from(this.files).forEach(function (f) {
          var reader = new FileReader();
          reader.onload = function (e) {
            siteFiles.push({
              name: f.name,
              type: f.type || "application/octet-stream",
              size: f.size,
              data: e.target.result,
              date: new Date().toISOString(),
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
      dropZone.addEventListener("dragover", function (e) {
        e.preventDefault();
        dropZone.style.borderColor = "var(--admin-primary)";
      });
      dropZone.addEventListener("dragleave", function () {
        dropZone.style.borderColor = "";
      });
      dropZone.addEventListener("drop", function (e) {
        e.preventDefault();
        dropZone.style.borderColor = "";
        Array.from(e.dataTransfer.files).forEach(function (f) {
          var reader = new FileReader();
          reader.onload = function (ev) {
            siteFiles.push({
              name: f.name,
              type: f.type || "application/octet-stream",
              size: f.size,
              data: ev.target.result,
              date: new Date().toISOString(),
            });
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
      tbody.innerHTML =
        '<tr><td colspan="5" style="text-align:center;color:var(--admin-text-muted);padding:24px">هنوز فایلی آپلود نشده است.</td></tr>';
      return;
    }
    tbody.innerHTML = siteFiles
      .map(function (f, i) {
        var typeLabel = f.type.includes("pdf")
          ? "PDF"
          : f.type.includes("word") || f.name.endsWith(".docx")
            ? "Word"
            : f.type.includes("sheet") || f.name.endsWith(".xlsx")
              ? "Excel"
              : f.type.split("/")[1] || "فایل";
        return (
          "<tr>" +
          '<td data-label="نام فایل">' +
          escapeHTML(f.name) +
          "</td>" +
          '<td data-label="نوع">' +
          typeLabel +
          "</td>" +
          '<td data-label="حجم">' +
          formatSize(f.size) +
          "</td>" +
          '<td data-label="تاریخ">' +
          persianDateShort(f.date) +
          "</td>" +
          '<td data-label="عملیات">' +
          '<a class="btn-sm" href="' +
          f.data +
          '" download="' +
          escapeHTML(f.name) +
          '">دانلود</a> ' +
          '<button class="btn-sm btn-danger btn-delete-file" data-idx="' +
          i +
          '">حذف</button>' +
          "</td></tr>"
        );
      })
      .join("");

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
    {
      id: "p1",
      name: "SEO Manager",
      slug: "seo-manager",
      version: "2.1.0",
      description:
        "بهینه‌سازی عنوان، توضیحات متا و نقشه سایت برای موتورهای جستجو.",
      author: "تیم فنی",
      active: true,
      configured: true,
      code: '{\n  "name": "seo-manager",\n  "title": "SEO Manager",\n  "version": "2.1.0",\n  "description": "بهینه‌سازی سئو",\n  "author": "تیم فنی",\n  "active": true\n}',
    },
    {
      id: "p2",
      name: "Analytics Dashboard",
      slug: "analytics-dashboard",
      version: "1.4.2",
      description: "اتصال به Google Analytics و نمایش آمار بازدید در داشبورد.",
      author: "تیم فنی",
      active: true,
      configured: false,
      code: '{\n  "name": "analytics-dashboard",\n  "title": "Analytics Dashboard",\n  "version": "1.4.2",\n  "description": "اتصال به Analytics",\n  "author": "تیم فنی",\n  "active": true\n}',
    },
    {
      id: "p3",
      name: "Social Auto Poster",
      slug: "social-auto-poster",
      version: "3.0.1",
      description: "انتشار خودکار پست‌ها در شبکه‌های اجتماعی مختلف.",
      author: "تیم فنی",
      active: false,
      configured: false,
      code: '{\n  "name": "social-auto-poster",\n  "title": "Social Auto Poster",\n  "version": "3.0.1",\n  "description": "انتشار خودکار",\n  "author": "تیم فنی",\n  "active": false\n}',
    },
  ];

  function getPlugins() {
    return Store.get("plugins", DEFAULT_PLUGINS);
  }
  function savePlugins(p) {
    Store.set("plugins", p);
  }
  var plugins = [];

  function initPlugins() {
    plugins = getPlugins();
    renderPluginsGrid();

    // Plugin upload
    var uploadBtn = document.getElementById("plugin-upload-zone");
    var uploadInput = document.getElementById("plugin-upload-input");
    if (uploadBtn && uploadInput) {
      uploadBtn.addEventListener("click", function () {
        uploadInput.click();
      });
      uploadInput.addEventListener("change", function () {
        Array.from(this.files).forEach(function (f) {
          var reader = new FileReader();
          reader.onload = function (e) {
            var pluginData = {
              id: uid(),
              name: f.name.replace(/\.(zip|rar|tar|7z)$/i, ""),
              slug: f.name
                .replace(/\.(zip|rar|tar|7z)$/i, "")
                .toLowerCase()
                .replace(/[^a-z0-9-]/g, "-"),
              version: "1.0.0",
              description: "پلاگین آپلود شده",
              author: "ناشناس",
              active: false,
              configured: false,
              code:
                '{"name":"' +
                f.name.replace(/\.(zip|rar|tar|7z)$/i, "") +
                '","version":"1.0.0"}',
              file: e.target.result,
              fileName: f.name,
              fileSize: f.size,
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
        if (!slug) {
          editor.style.display = "none";
          return;
        }
        var plugin = plugins.find(function (p) {
          return p.slug === slug;
        });
        if (plugin) {
          textarea.value = plugin.code || "";
          editor.style.display = "block";
        }
      });
    }

    document
      .getElementById("btn-plugin-code-save")
      .addEventListener("click", function () {
        var slug = document.getElementById("plugin-edit-select").value;
        var plugin = plugins.find(function (p) {
          return p.slug === slug;
        });
        if (plugin) {
          plugin.code = document.getElementById("plugin-code-textarea").value;
          savePlugins(plugins);
          document.getElementById("plugin-code-status").innerHTML =
            '<span style="color:var(--admin-success)">✓ تغییرات ذخیره شد</span>';
          setTimeout(function () {
            document.getElementById("plugin-code-status").innerHTML = "";
          }, 3000);
        }
      });

    document
      .getElementById("btn-plugin-code-reject")
      .addEventListener("click", function () {
        var slug = document.getElementById("plugin-edit-select").value;
        var plugin = plugins.find(function (p) {
          return p.slug === slug;
        });
        if (plugin) {
          document.getElementById("plugin-code-textarea").value =
            plugin.code || "";
          document.getElementById("plugin-code-status").innerHTML =
            '<span style="color:var(--admin-danger)">تغییرات رد شد</span>';
          setTimeout(function () {
            document.getElementById("plugin-code-status").innerHTML = "";
          }, 3000);
        }
      });
  }

  function renderPluginsGrid() {
    var grid = document.getElementById("plugins-grid");
    var empty = document.getElementById("plugins-empty");
    var editSelect = document.getElementById("plugin-edit-select");

    if (!plugins.length) {
      grid.innerHTML = "";
      empty.style.display = "block";
      return;
    }
    empty.style.display = "none";

    grid.innerHTML = plugins
      .map(function (p) {
        var statusBadge = p.active
          ? '<span class="badge badge-success">فعال</span>'
          : '<span class="badge badge-secondary">غیرفعال</span>';
        var configNote = p.configured
          ? '<p style="color:var(--admin-success);font-size:0.8rem;margin-top:8px">✓ تنظیم شده</p>'
          : "";
        return (
          '<div class="plugin-card" data-slug="' +
          p.slug +
          '">' +
          '<div class="plugin-header"><h4>' +
          escapeHTML(p.name) +
          "</h4>" +
          statusBadge +
          "</div>" +
          "<p>" +
          escapeHTML(p.description) +
          "</p>" +
          '<div class="plugin-meta"><span>نسخه ' +
          p.version +
          "</span><span>" +
          escapeHTML(p.author) +
          "</span></div>" +
          configNote +
          '<div class="plugin-actions">' +
          '<button class="btn-sm btn-toggle-plugin" data-slug="' +
          p.slug +
          '">' +
          (p.active ? "غیرفعال" : "فعال") +
          "</button>" +
          '<button class="btn-sm btn-plugin-settings" data-slug="' +
          p.slug +
          '">تنظیمات</button>' +
          '<button class="btn-sm btn-edit-plugin-code" data-slug="' +
          p.slug +
          '">ادیت کد</button>' +
          '<button class="btn-sm btn-danger btn-delete-plugin" data-slug="' +
          p.slug +
          '">حذف</button>' +
          "</div></div>"
        );
      })
      .join("");

    // Update edit select
    if (editSelect) {
      editSelect.innerHTML =
        '<option value="">انتخاب کنید...</option>' +
        plugins
          .map(function (p) {
            return '<option value="' + p.slug + '">' + p.name + "</option>";
          })
          .join("");
    }

    grid.querySelectorAll(".btn-toggle-plugin").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var slug = this.getAttribute("data-slug");
        var p = plugins.find(function (x) {
          return x.slug === slug;
        });
        if (p) {
          p.active = !p.active;
          savePlugins(plugins);
          renderPluginsGrid();
        }
      });
    });

    grid.querySelectorAll(".btn-plugin-settings").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var slug = this.getAttribute("data-slug");
        var p = plugins.find(function (x) {
          return x.slug === slug;
        });
        if (!p) return;
        document.getElementById("plugin-settings-title").textContent =
          "تنظیمات: " + p.name;
        document.getElementById("plugin-settings-body").innerHTML =
          '<div class="field"><label>وضعیت</label><select id="ps-active"><option value="1"' +
          (p.active ? " selected" : "") +
          '>فعال</option><option value="0"' +
          (!p.active ? " selected" : "") +
          ">غیرفعال</option></select></div>" +
          '<div class="field"><label>توضیحات</label><textarea id="ps-desc" rows="3">' +
          escapeHTML(p.description) +
          "</textarea></div>";
        document.getElementById("btn-save-plugin-settings").onclick =
          function () {
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
        document
          .getElementById("plugin-edit-select")
          .dispatchEvent(new Event("change"));
        switchTab("plugins");
        switchSubTab("plugins", "plugins-edit");
      });
    });

    grid.querySelectorAll(".btn-delete-plugin").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var slug = this.getAttribute("data-slug");
        if (!confirm("آیا از حذف پلاگین مطمئن هستید؟")) return;
        plugins = plugins.filter(function (x) {
          return x.slug !== slug;
        });
        savePlugins(plugins);
        renderPluginsGrid();
      });
    });
  }

  // ════════════════════════════════════════════════
  //  SETTINGS — Persistence
  // ════════════════════════════════════════════════

  async function initSettings() {
    try {
      var settings = await api.getSettings();
      document.getElementById("setting-site-title").value =
        settings.siteTitle || "";
      document.getElementById("setting-site-desc").value =
        settings.siteDesc || "";
      document.getElementById("setting-site-keywords").value =
        settings.siteKeywords || "";
      document.getElementById("setting-analytics-id").value =
        settings.analyticsId || "";
      document.getElementById("setting-gtm-id").value = settings.gtmId || "";
      document.getElementById("setting-phone").value = settings.phone || "";
      document.getElementById("setting-email").value = settings.email || "";
      document.getElementById("setting-address").value = settings.address || "";
    } catch (e) {
      console.error(e);
    }

    document
      .getElementById("btn-save-seo")
      .addEventListener("click", async function () {
        try {
          await api.updateSettings({
            siteTitle: document.getElementById("setting-site-title").value,
            siteDesc: document.getElementById("setting-site-desc").value,
            siteKeywords: document.getElementById("setting-site-keywords")
              .value,
          });
          alert("تنظیمات SEO ذخیره شد.");
        } catch (err) {
          alert(err.message);
        }
      });

    document
      .getElementById("btn-save-analytics")
      .addEventListener("click", async function () {
        var id = document.getElementById("setting-analytics-id").value.trim();
        try {
          await api.updateSettings({
            analyticsId: id,
            analyticsStatus: document.getElementById("setting-analytics-status")
              .value,
          });
          var result = document.getElementById("analytics-test-result");
          if (id && /^G-[A-Z0-9]+$/.test(id)) {
            result.style.display = "block";
            result.innerHTML =
              '<span style="color:var(--admin-success)">✓ شناسه معتبر است: ' +
              id +
              "</span>";
          } else if (id) {
            result.style.display = "block";
            result.innerHTML =
              '<span style="color:var(--admin-danger)">فرمت نامعتبر. فرمت صحیح: G-XXXXXXXXXX</span>';
          } else {
            result.style.display = "block";
            result.innerHTML =
              '<span style="color:var(--admin-warning)">شناسه خالی است.</span>';
          }
        } catch (err) {
          alert(err.message);
        }
      });

    document
      .getElementById("btn-save-gtm")
      .addEventListener("click", async function () {
        var id = document.getElementById("setting-gtm-id").value.trim();
        try {
          await api.updateSettings({
            gtmId: id,
            gtmStatus: document.getElementById("setting-gtm-status").value,
          });
          var result = document.getElementById("gtm-test-result");
          if (id && /^GTM-[A-Z0-9]+$/.test(id)) {
            result.style.display = "block";
            result.innerHTML =
              '<span style="color:var(--admin-success)">✓ شناسه معتبر است: ' +
              id +
              "</span>";
          } else if (id) {
            result.style.display = "block";
            result.innerHTML =
              '<span style="color:var(--admin-danger)">فرمت نامعتبر. فرمت صحیح: GTM-XXXXXXX</span>';
          } else {
            result.style.display = "block";
            result.innerHTML =
              '<span style="color:var(--admin-warning)">شناسه خالی است.</span>';
          }
        } catch (err) {
          alert(err.message);
        }
      });

    document
      .getElementById("btn-save-contact")
      .addEventListener("click", async function () {
        try {
          await api.updateSettings({
            phone: document.getElementById("setting-phone").value,
            email: document.getElementById("setting-email").value,
            address: document.getElementById("setting-address").value,
          });
          alert("ذخیره شد.");
        } catch (err) {
          alert(err.message);
        }
      });
  }

  // ════════════════════════════════════════════════
  //  HELPERS — Tab/SubTab switcher
  // ════════════════════════════════════════════════

  function switchTab(tabId) {
    sidebarLinks.forEach(function (l) {
      l.classList.remove("active");
    });
    var link = document.querySelector(
      '.sidebar-link[data-tab="' + tabId + '"]',
    );
    if (link) link.classList.add("active");
    tabPanes.forEach(function (p) {
      p.classList.remove("active");
    });
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
    parent.querySelectorAll(".sub-pane").forEach(function (p) {
      p.classList.remove("active");
    });
    var t = document.getElementById(subtabId);
    if (t) t.classList.add("active");
  }

  // ════════════════════════════════════════════════
  //  GALLERY — Dynamic with metadata
  // ════════════════════════════════════════════════

  var galleryImages = [];

  function initGallery() {
    try {
      galleryImages = JSON.parse(localStorage.getItem("admin_gallery") || "[]");
    } catch (e) {
      galleryImages = [];
    }

    // Add default images
    if (!galleryImages.length) {
      var defaults = [
        "assets/profile-formal.jpeg",
        "assets/profile-light.jpeg",
        "assets/profile-suit.jpeg",
        "assets/consulting-room.jpeg",
        "assets/case-score.jpeg",
        "assets/logo.png",
      ];
      defaults.forEach(function (src) {
        galleryImages.push({
          src: src,
          name: src.split("/").pop(),
          format: src.split(".").pop().toUpperCase(),
          size: 0,
          tags: "",
          width: 0,
          height: 0,
        });
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
                src: e.target.result,
                name: f.name,
                format: f.type.split("/")[1] || "unknown",
                size: f.size,
                tags: "",
                width: img.width,
                height: img.height,
              });
              localStorage.setItem(
                "admin_gallery",
                JSON.stringify(galleryImages),
              );
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
      uploadZone.addEventListener("dragover", function (e) {
        e.preventDefault();
      });
      uploadZone.addEventListener("drop", function (e) {
        e.preventDefault();
        if (uploadInput) {
          uploadInput.files = e.dataTransfer.files;
          uploadInput.dispatchEvent(new Event("change"));
        }
      });
    }
  }

  function renderGalleryImages() {
    var grid = document.getElementById("gallery-images-grid");
    var empty = document.getElementById("gallery-images-empty");
    if (!grid) return;
    if (!galleryImages.length) {
      grid.innerHTML = "";
      empty.style.display = "block";
      return;
    }
    empty.style.display = "none";

    grid.innerHTML = galleryImages
      .map(function (img, i) {
        var sizeStr = img.size ? formatSize(img.size) : "نامشخص";
        var dimStr =
          img.width && img.height ? img.width + "×" + img.height : "";
        return (
          '<div class="gallery-card" data-idx="' +
          i +
          '">' +
          '<div class="gallery-card-img"><img src="' +
          img.src +
          '" alt="' +
          escapeHTML(img.name) +
          '" /></div>' +
          '<div class="gallery-card-info">' +
          '<div class="field"><label>نام</label><input type="text" class="gallery-name" data-idx="' +
          i +
          '" value="' +
          escapeHTML(img.name) +
          '" /></div>' +
          '<div class="field"><label>تگ‌ها</label><input type="text" class="gallery-tags" data-idx="' +
          i +
          '" value="' +
          escapeHTML(img.tags) +
          '" placeholder="تگ‌ها با کاما" /></div>' +
          '<div class="gallery-meta"><span>' +
          img.format +
          "</span><span>" +
          sizeStr +
          "</span>" +
          (dimStr ? "<span>" + dimStr + "</span>" : "") +
          "</div>" +
          "</div>" +
          '<div class="gallery-card-actions">' +
          '<button class="btn-sm btn-gallery-edit" data-idx="' +
          i +
          '">ویرایش</button>' +
          '<button class="btn-sm btn-gallery-select" data-idx="' +
          i +
          '">انتخاب</button>' +
          '<button class="btn-sm btn-danger btn-gallery-delete" data-idx="' +
          i +
          '">حذف</button>' +
          "</div>" +
          "</div>"
        );
      })
      .join("");

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

    grid.querySelectorAll(".btn-gallery-edit").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var idx = parseInt(this.getAttribute("data-idx"));
        openGalleryInlineEditor(idx);
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

  function openGalleryInlineEditor(idx) {
    var panel = document.getElementById("gallery-inline-editor");
    if (!panel || !galleryImages[idx]) return;
    var img = galleryImages[idx];
    var sizeStr = img.size ? formatSize(img.size) : "نامشخص";
    var dimStr = img.width && img.height ? img.width + "×" + img.height : "نامشخص";
    panel.style.display = "grid";
    panel.innerHTML =
      '<div class="gallery-editor-preview"><img src="' + img.src + '" alt="' + escapeHTML(img.name) + '"></div>' +
      '<div class="gallery-editor-fields">' +
      '<h3>ویرایش تصویر</h3>' +
      '<div class="gallery-meta large"><span>فرمت: ' + escapeHTML(img.format || "نامشخص") + '</span><span>حجم: ' + sizeStr + '</span><span>ابعاد: ' + dimStr + '</span></div>' +
      '<div class="field"><label>نام تصویر</label><input id="gallery-edit-name" value="' + escapeHTML(img.name || "") + '"></div>' +
      '<div class="field"><label>تگ عکس</label><input id="gallery-edit-tags" value="' + escapeHTML(img.tags || "") + '" placeholder="مثلاً پرتره، مشاوره، برند"></div>' +
      '<div class="field"><label>آدرس فایل</label><input value="' + escapeHTML(img.src || "") + '" dir="ltr" readonly></div>' +
      '<div class="editor-actions"><button class="button primary" id="gallery-edit-save">ذخیره اطلاعات</button><button class="button" id="gallery-edit-close">بستن</button></div>' +
      '</div>';
    document.getElementById("gallery-edit-save").onclick = function () {
      galleryImages[idx].name = document.getElementById("gallery-edit-name").value.trim() || galleryImages[idx].name;
      galleryImages[idx].tags = document.getElementById("gallery-edit-tags").value.trim();
      localStorage.setItem("admin_gallery", JSON.stringify(galleryImages));
      renderGalleryImages();
      openGalleryInlineEditor(idx);
    };
    document.getElementById("gallery-edit-close").onclick = function () {
      panel.style.display = "none";
      panel.innerHTML = "";
    };
    panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  // File Manager for selecting from gallery
  var fileManagerCallback = null;

  window.openFileManager = function (callback) {
    fileManagerCallback = callback;
    var grid = document.getElementById("file-manager-grid");
    grid.innerHTML = galleryImages
      .map(function (img, i) {
        return (
          '<div class="file-manager-item" data-idx="' +
          i +
          '">' +
          '<img src="' +
          img.src +
          '" alt="' +
          escapeHTML(img.name) +
          '" />' +
          "<span>" +
          escapeHTML(img.name) +
          "</span></div>"
        );
      })
      .join("");
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
    var bannerImg = document.getElementById("modal-banner-image");
    if (bannerImg) bannerImg.value = galleryImages[idx].src;
  };

  // ════════════════════════════════════════════════
  //  IMAGE EDITOR — Palleon-like Canvas Editor
  // ════════════════════════════════════════════════

  var editorCanvas,
    editorCtx,
    editorImg,
    editorZoom = 1;
  var editorOriginalData = null;
  var editorSettings = {
    brightness: 0,
    contrast: 0,
    saturation: 0,
    opacity: 100,
    filter: "none",
  };

  window.openImageEditor = function (imageSrc) {
    editorCanvas = document.getElementById("image-editor-canvas");
    editorCtx = editorCanvas.getContext("2d");
    editorZoom = 1;
    editorSettings = {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      opacity: 100,
      filter: "none",
    };

    // Reset sliders
    document.getElementById("editor-brightness").value = 0;
    document.getElementById("editor-contrast").value = 0;
    document.getElementById("editor-saturation").value = 0;
    document.getElementById("editor-opacity").value = 100;
    document.getElementById("val-brightness").textContent = "۰";
    document.getElementById("val-contrast").textContent = "۰";
    document.getElementById("val-saturation").textContent = "۰";
    document.getElementById("val-opacity").textContent = "۱۰۰";
    document.querySelectorAll(".editor-filter-btn").forEach(function (b) {
      b.classList.remove("active");
    });
    document
      .querySelector('.editor-filter-btn[data-filter="none"]')
      .classList.add("active");

    editorImg = new Image();
    editorImg.crossOrigin = "anonymous";
    editorImg.onload = function () {
      editorCanvas.width = editorImg.naturalWidth;
      editorCanvas.height = editorImg.naturalHeight;
      editorOriginalData = editorCtx.getImageData(
        0,
        0,
        editorCanvas.width,
        editorCanvas.height,
      );
      editorCtx.drawImage(editorImg, 0, 0);
      updateEditorInfo(imageSrc);
      updateZoomInfo();
      showModal("image-editor-modal");
    };
    editorImg.src = imageSrc;
  };

  function updateEditorInfo(src) {
    var name = src.split("/").pop() || "تصویر";
    document.getElementById("editor-info-name").textContent = name;
    document.getElementById("editor-info-format").textContent = name
      .split(".")
      .pop()
      .toUpperCase();
    document.getElementById("editor-info-dims").textContent =
      editorCanvas.width + " × " + editorCanvas.height + " px";
    document.getElementById("editor-info-size").textContent =
      Math.round(editorCanvas.toBlob ? 0 : 0) + " KB";
    document.getElementById("editor-width").value = editorCanvas.width;
    document.getElementById("editor-height").value = editorCanvas.height;

    // Try to get actual file size
    fetch(src)
      .then(function (r) {
        return r.blob();
      })
      .then(function (b) {
        document.getElementById("editor-info-size").textContent = formatSize(
          b.size,
        );
      })
      .catch(function () {
        document.getElementById("editor-info-size").textContent = "نامشخص";
      });
  }

  function updateZoomInfo() {
    document.getElementById("editor-zoom-info").textContent =
      toPersianNumbers(Math.round(editorZoom * 100)) + "٪";
    editorCanvas.style.transform = "scale(" + editorZoom + ")";
    editorCanvas.style.transformOrigin = "center center";
  }

  function applyEditorFilters() {
    if (!editorOriginalData) return;
    var w = editorCanvas.width,
      h = editorCanvas.height;
    var tempCanvas = document.createElement("canvas");
    tempCanvas.width = w;
    tempCanvas.height = h;
    var tempCtx = tempCanvas.getContext("2d");
    tempCtx.putImageData(editorOriginalData, 0, 0);

    // Apply CSS-like filters
    var filterStr = "";
    var b = 100 + editorSettings.brightness;
    var c = 100 + editorSettings.contrast;
    var s = 100 + editorSettings.saturation;
    filterStr += "brightness(" + b / 100 + ") ";
    filterStr += "contrast(" + c / 100 + ") ";
    filterStr += "saturate(" + s / 100 + ") ";
    filterStr += "opacity(" + editorSettings.opacity / 100 + ") ";

    if (editorSettings.filter === "grayscale") filterStr += "grayscale(1) ";
    else if (editorSettings.filter === "sepia") filterStr += "sepia(1) ";
    else if (editorSettings.filter === "blur") filterStr += "blur(3px) ";
    else if (editorSettings.filter === "brightness")
      filterStr += "brightness(1.3) ";
    else if (editorSettings.filter === "contrast")
      filterStr += "contrast(1.5) ";

    editorCtx.filter = filterStr.trim();
    editorCtx.drawImage(tempCanvas, 0, 0);
    editorCtx.filter = "none";
  }

  // Tool buttons
  document.querySelectorAll(".editor-tool").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var tool = this.getAttribute("data-tool");
      if (tool === "rotate-left") {
        rotateCanvas(-90);
      } else if (tool === "rotate-right") {
        rotateCanvas(90);
      } else if (tool === "flip-h") {
        flipCanvas("h");
      } else if (tool === "flip-v") {
        flipCanvas("v");
      } else if (tool === "zoom-in") {
        editorZoom = Math.min(editorZoom * 1.2, 5);
        updateZoomInfo();
      } else if (tool === "zoom-out") {
        editorZoom = Math.max(editorZoom / 1.2, 0.2);
        updateZoomInfo();
      } else if (tool === "reset") {
        resetEditor();
      }
    });
  });

  function rotateCanvas(deg) {
    var w = editorCanvas.width,
      h = editorCanvas.height;
    var tempCanvas = document.createElement("canvas");
    tempCanvas.width = w;
    tempCanvas.height = h;
    tempCanvas.getContext("2d").drawImage(editorCanvas, 0, 0);
    if (Math.abs(deg) === 90) {
      editorCanvas.width = h;
      editorCanvas.height = w;
    }
    editorCtx.save();
    editorCtx.translate(editorCanvas.width / 2, editorCanvas.height / 2);
    editorCtx.rotate((deg * Math.PI) / 180);
    editorCtx.drawImage(tempCanvas, -w / 2, -h / 2);
    editorCtx.restore();
    editorOriginalData = editorCtx.getImageData(
      0,
      0,
      editorCanvas.width,
      editorCanvas.height,
    );
    updateEditorInfo(
      document.getElementById("modal-banner-image").value || "image",
    );
  }

  function flipCanvas(dir) {
    var w = editorCanvas.width,
      h = editorCanvas.height;
    var tempCanvas = document.createElement("canvas");
    tempCanvas.width = w;
    tempCanvas.height = h;
    tempCanvas.getContext("2d").drawImage(editorCanvas, 0, 0);
    editorCtx.save();
    if (dir === "h") {
      editorCtx.translate(w, 0);
      editorCtx.scale(-1, 1);
    } else {
      editorCtx.translate(0, h);
      editorCtx.scale(1, -1);
    }
    editorCtx.drawImage(tempCanvas, 0, 0);
    editorCtx.restore();
    editorOriginalData = editorCtx.getImageData(0, 0, w, h);
  }

  function resetEditor() {
    if (!editorOriginalData || !editorImg) return;
    editorCanvas.width = editorImg.naturalWidth;
    editorCanvas.height = editorImg.naturalHeight;
    editorOriginalData = editorCtx.getImageData(
      0,
      0,
      editorCanvas.width,
      editorCanvas.height,
    );
    editorCtx.drawImage(editorImg, 0, 0);
    editorZoom = 1;
    updateZoomInfo();
    document.getElementById("editor-brightness").value = 0;
    document.getElementById("editor-contrast").value = 0;
    document.getElementById("editor-saturation").value = 0;
    document.getElementById("editor-opacity").value = 100;
    document.getElementById("val-brightness").textContent = "۰";
    document.getElementById("val-contrast").textContent = "۰";
    document.getElementById("val-saturation").textContent = "۰";
    document.getElementById("val-opacity").textContent = "۱۰۰";
    editorSettings = {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      opacity: 100,
      filter: "none",
    };
  }

  // Sliders
  ["brightness", "contrast", "saturation", "opacity"].forEach(function (key) {
    var slider = document.getElementById("editor-" + key);
    if (slider) {
      slider.addEventListener("input", function () {
        editorSettings[key] = parseInt(this.value);
        document.getElementById("val-" + key).textContent = toPersianNumbers(
          this.value,
        );
        applyEditorFilters();
      });
    }
  });

  // Filter buttons
  document.querySelectorAll(".editor-filter-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".editor-filter-btn").forEach(function (b) {
        b.classList.remove("active");
      });
      this.classList.add("active");
      editorSettings.filter = this.getAttribute("data-filter");
      applyEditorFilters();
    });
  });

  // Resize
  document
    .getElementById("editor-apply-size")
    .addEventListener("click", function () {
      var newW = parseInt(document.getElementById("editor-width").value);
      var newH = parseInt(document.getElementById("editor-height").value);
      if (!newW || !newH || newW < 1 || newH < 1) return;
      var tempCanvas = document.createElement("canvas");
      tempCanvas.width = editorCanvas.width;
      tempCanvas.height = editorCanvas.height;
      tempCanvas.getContext("2d").drawImage(editorCanvas, 0, 0);
      editorCanvas.width = newW;
      editorCanvas.height = newH;
      editorCtx.drawImage(tempCanvas, 0, 0, newW, newH);
      editorOriginalData = editorCtx.getImageData(0, 0, newW, newH);
      updateEditorInfo(
        document.getElementById("modal-banner-image").value || "image",
      );
    });

  // Lock ratio
  document
    .getElementById("editor-lock-ratio")
    .addEventListener("change", function () {
      var lock = this.checked;
      var wInput = document.getElementById("editor-width");
      var hInput = document.getElementById("editor-height");
      if (lock) {
        wInput.addEventListener("input", function () {
          hInput.value = Math.round(
            parseInt(this.value) * (editorCanvas.height / editorCanvas.width),
          );
        });
        hInput.addEventListener("input", function () {
          wInput.value = Math.round(
            parseInt(this.value) * (editorCanvas.width / editorCanvas.height),
          );
        });
      }
    });

  // Download
  document
    .getElementById("editor-download-btn")
    .addEventListener("click", function () {
      var link = document.createElement("a");
      link.download = "edited-image.png";
      link.href = editorCanvas.toDataURL("image/png");
      link.click();
    });

  // Save to gallery
  document
    .getElementById("editor-save-btn")
    .addEventListener("click", function () {
      var dataUrl = editorCanvas.toDataURL("image/png");
      var name =
        (document.getElementById("modal-banner-image").value || "image")
          .split("/")
          .pop()
          .replace(/\.[^.]+$/, "") + "-edited.png";
      galleryImages.push({
        src: dataUrl,
        name: name,
        format: "PNG",
        size: Math.round(dataUrl.length * 0.75),
        tags: "edited",
        width: editorCanvas.width,
        height: editorCanvas.height,
      });
      localStorage.setItem("admin_gallery", JSON.stringify(galleryImages));
      renderGalleryImages();
      alert("تصویر ویرایش شده در گالری ذخیره شد.");
      closeImageEditor();
    });

  window.closeImageEditor = function () {
    hideModal();
  };
});
