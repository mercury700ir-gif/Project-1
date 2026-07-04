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
        '<td>' + escapeHTML(p.title) + '</td>' +
        '<td>' + escapeHTML(p.author) + '</td>' +
        '<td>' + persianDateShort(p.date) + '</td>' +
        '<td>' + escapeHTML(p.category) + '</td>' +
        '<td>' + statusBadge + '</td>' +
        '<td>' +
          '<button class="btn-sm btn-edit" data-id="' + p.id + '">ویرایش</button>' +
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
    var topicClean = topic.replace(/[^\w\u0600-\u06FF\s]/g, "").trim() || "موضوع";

    var templates = {
      "مقاله وبلاگ": {
        "رسمی و حرفه‌ای": {
          titleFn: function (t) { return "بررسی جامع " + t + ": راهکارها و استراتژی‌های کلیدی"; },
          bodyFn: function (t) {
            return '<h5>مقدمه</h5><p>در دنیای رقابتی امروز، ' + t + ' به یکی از حوزه‌های کلیدی تبدیل شده است. هر سازمانی که می‌خواهد در بازار دیجیتال موفق باشد، باید درک عمیقی از این حوزه داشته باشد.</p>' +
              '<h5>چرا ' + t + ' مهم است؟</h5><p>بر اساس آخرین آمارها، بیش از ۸۰ درصد کسب‌وکارها در حال سرمایه‌گذاری روی ' + t + ' هستند. این موضوع نشان‌دهنده اهمیت روزافزون آن در استراتژی‌های سازمانی است.</p>' +
              '<h5>راهکارهای عملی</h5><p>۱. تحلیل وضعیت فعلی و شناسایی فرصت‌ها<br>۲. تعریف اهداف SMART و شاخص‌های کلیدی<br>۳. طراحی نقشه راه اجرایی<br>۴. پیاده‌سازی تدریجی و سنجش مداوم<br>۵. بهینه‌سازی بر اساس بازخورد داده‌ها</p>' +
              '<h5>نتیجه‌گیری</h5><p>' + t + ' نه یک پروژه موقت، بلکه یک فرآیند مستمر است. سازمان‌هایی که این فرآیند را به درستی مدیریت می‌کنند، مزیت رقابتی پایداری به دست می‌آورند.</p>';
          }
        },
        "آموزشی": {
          titleFn: function (t) { return "آموزش گام‌به‌گام " + t + " برای مبتدیان"; },
          bodyFn: function (t) {
            return '<h5>آشنایی با ' + t + '</h5><p>در این مقاله به صورت گام‌به‌گام با مفاهیم پایه‌ای ' + t + ' آشنا می‌شویم.</p>' +
              '<h5>گام اول: شناخت مبانی</h5><p>قبل از هر چیزی باید مفاهیم پایه‌ای این حوزه را درک کنید. ' + t + ' بر پایه اصولی استوار است که درک آن‌ها مسیر یادگیری را هموار می‌کند.</p>' +
              '<h5>گام دوم: ابزارها و منابع</h5><p>شناخت ابزارهای مناسب برای ' + t + ' یکی دیگر از مراحل مهم است. انتخاب ابزار درست می‌تواند تأثیر چشمگیری در نتایج داشته باشد.</p>' +
              '<h5>گام سوم: اجرای عملی</h5><p>بهترین راه یادگیری، تمرین عملی است. با اجرای پروژه‌های کوچک شروع کنید و به تدریج پیچیدگی آن‌ها را افزایش دهید.</p>' +
              '<h5>نکات تکمیلی</h5><p>از اشتباهات خود درس بگیرید، با متخصصان این حوزه در ارتباط باشید و همواره به‌روز باشید.</p>';
          }
        },
        "صمیمی": {
          titleFn: function (t) { return t + " :یه راهنمای ساده و کاربردی برای همه"; },
          bodyFn: function (t) {
            return '<h5>سلام! بیایید راحت حرف بزنیم</h5><p>می‌دونم که ' + t + ' ممکنه یه موضوع پیچیده به نظر برسه، ولی باور کنید خیلی ساده‌تر از چیزی هست که فکر می‌کنید.</p>' +
              '<h5>چرا باید بهش اهمیت بدیم؟</h5><p>چون تو دنیای امروز، هر کسب‌وکاری که می‌خواد موفق بشه، باید ' + t + ' رو جدی بگیره. نه لازمه خیلی حرفه‌ای باشید، فقط کافیه اصول پایه رو بلد باشید.</p>' +
              '<h5>شروع کنیم!</h5><p>اول از همه، یه هدف مشخص داشته باشید. بعد، یه نقشه ساده بکشید. و در نهایت، قدم‌های کوچک بردارید. همین!</p>' +
              '<h5>یه نکته طلایی</h5><p>بزرگ‌ترین اشتباهی که آدم‌ها می‌کنن؟ منتظر موندن برای «زمان مناسب». همین الان شروع کنید، حتی اگه کوچیک باشه.</p>';
          }
        },
        "تبلیغاتی": {
          titleFn: function (t) { return t + " :۵ دلیل که نمی‌توانید نادیده بگیرید"; },
          bodyFn: function (t) {
            return '<h5>آیا آماده‌اید تحول ایجاد کنید؟</h5><p>' + t + ' دیگر یک گزینه نیست، بلکه یک ضرورت است. رقبای شما همین الان در حال سرمایه‌گذاری روی این حوزه هستند.</p>' +
              '<h5>۵ دلیل برای شروع فوری</h5><p>۱. <strong>رشد سریع:</strong> نتایج قابل اندازه‌گیری در کوتاه‌مدت<br>۲. <strong>هزینه مقرون‌به‌صرفه:</strong> بازگشت سرمایه بالا<br>۳. <strong>مزیت رقابتی:</strong> متمایز شدن از رقبا<br>۴. <strong>انعطاف‌پذیری:</strong> قابلیت تطبیق با تغییرات بازار<br>۵. <strong>آینده‌پژوهی:</strong> آمادگی برای ترندهای آینده</p>' +
              '<h5>همین الان اقدام کنید</h5><p>هر روز تأخیر، فرصتی از دست رفته است. با ما تماس بگیرید و اولین قدم را بردارید.</p>';
          }
        }
      }
    };

    var typeKey = type in templates ? type : "مقاله وبلاگ";
    var toneKey = tone in templates[typeKey] ? tone : "رسمی و حرفه‌ای";
    var tpl = templates[typeKey][toneKey];

    var seoTitle = tpl.titleFn(topicClean);
    var metaDesc = "مقاله جامع درباره " + topicClean + " با رویکرد " + tone + ". راهکارها و استراتژی‌های عملی برای رشد کسب‌وکار.";
    var tags = topicClean + ", بازاریابی دیجیتال, رشد دیجیتال, استراتژی";
    var body = tpl.bodyFn(topicClean);

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

});
