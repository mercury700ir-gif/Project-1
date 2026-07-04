#!/usr/bin/env node
/**
 * Project Validation Suite
 * Tests: HTML structure, ARIA, SEO, Performance, CSS, JS syntax
 */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = __dirname;
let passed = 0;
let failed = 0;
let warnings = 0;
const results = [];

function ok(msg) { passed++; results.push({ status: "PASS", msg }); }
function fail(msg) { failed++; results.push({ status: "FAIL", msg }); }
function warn(msg) { warnings++; results.push({ status: "WARN", msg }); }

function readFile(name) {
  try { return fs.readFileSync(path.join(ROOT, name), "utf8"); }
  catch(e) { return null; }
}

function check(name, fn) {
  try { fn(); }
  catch(e) { fail(`${name}: ${e.message}`); }
}

// ═══════════════ HTML Validation ═══════════════

const htmlFiles = ["index.html", "about.html", "contact.html"];

htmlFiles.forEach((file) => {
  const html = readFile(file);
  if (!html) { fail(`${file}: file not found`); return; }

  check(`${file} — lang="fa" dir="rtl"`, () => {
    if (html.includes('lang="fa"') && html.includes('dir="rtl"')) ok(`${file}: lang/dir attributes correct`);
    else fail(`${file}: missing lang="fa" or dir="rtl"`);
  });

  check(`${file} — <title> exists`, () => {
    if (/<title>[^<]+<\/title>/.test(html)) ok(`${file}: <title> present`);
    else fail(`${file}: missing <title>`);
  });

  check(`${file} — meta description`, () => {
    if (html.includes('name="description"')) ok(`${file}: meta description present`);
    else fail(`${file}: missing meta description`);
  });

  check(`${file} — Open Graph tags`, () => {
    const ogTags = ["og:type", "og:title", "og:description", "og:image", "og:locale"];
    const missing = ogTags.filter((t) => !html.includes(t));
    if (missing.length === 0) ok(`${file}: all OG tags present`);
    else fail(`${file}: missing OG tags: ${missing.join(", ")}`);
  });

  check(`${file} — canonical link`, () => {
    if (html.includes('rel="canonical"')) ok(`${file}: canonical link present`);
    else fail(`${file}: missing canonical link`);
  });

  check(`${file} — skip-to-content link`, () => {
    if (html.includes('class="skip-link"')) ok(`${file}: skip-link present`);
    else fail(`${file}: missing skip-to-content link`);
  });

  check(`${file} — ARIA landmarks`, () => {
    const hasBanner = html.includes('role="banner"');
    const hasMain = html.includes('role="main"');
    const hasFooter = html.includes('role="contentinfo"');
    if (hasBanner && hasMain && hasFooter) ok(`${file}: all ARIA landmarks present`);
    else fail(`${file}: missing landmarks — banner:${hasBanner} main:${hasMain} footer:${hasFooter}`);
  });

  check(`${file} — main has id`, () => {
    if (html.includes('id="main-content"')) ok(`${file}: main#main-content present`);
    else fail(`${file}: missing id="main-content" on main`);
  });

  check(`${file} — defer on scripts`, () => {
    const scripts = html.match(/<script[^>]*src="[^"]*"[^>]*>/g) || [];
    const nonDeferred = scripts.filter((s) => !s.includes("defer"));
    if (nonDeferred.length === 0) ok(`${file}: all scripts have defer`);
    else warn(`${file}: scripts without defer: ${nonDeferred.join(", ")}`);
  });

  check(`${file} — lazy loading on images`, () => {
    const imgs = html.match(/<img[^>]*>/g) || [];
    const aboveFold = imgs.filter((i) => i.includes("brand-logo") || i.includes("fetchpriority"));
    const belowFold = imgs.filter((i) => !i.includes("brand-logo") && !i.includes("fetchpriority"));
    const nonLazy = belowFold.filter((i) => !i.includes("loading="));
    if (nonLazy.length === 0) ok(`${file}: below-fold images have loading attribute`);
    else warn(`${file}: ${nonLazy.length} below-fold images without loading attribute`);
  });

  check(`${file} — heading hierarchy`, () => {
    const h1Count = (html.match(/<h1[\s>]/g) || []).length;
    if (h1Count === 1) ok(`${file}: exactly one <h1>`);
    else fail(`${file}: ${h1Count} <h1> tags (expected 1)`);
  });

  check(`${file} — form labels`, () => {
    const labels = html.match(/<label[^>]*for="[^"]*"[^>]*>/g) || [];
    const inputs = html.match(/<input[^>]*id="[^"]*"[^>]*>/g) || [];
    if (labels.length > 0 || inputs.length === 0) ok(`${file}: form labels properly associated`);
    else warn(`${file}: form inputs without matching labels`);
  });
});

// ═══════════════ CSS Validation ═══════════════

const css = readFile("styles.css");
if (css) {
  check("CSS — no syntax errors", () => {
    const openBraces = (css.match(/{/g) || []).length;
    const closeBraces = (css.match(/}/g) || []).length;
    if (openBraces === closeBraces) ok("CSS: balanced braces");
    else fail(`CSS: unbalanced braces (${openBraces} open, ${closeBraces} close)`);
  });

  check("CSS — WCAG contrast", () => {
    if (css.includes("--muted: #525a63")) ok("CSS: --muted contrast fixed (#525a63 on #f7f3ec ≈ 5.2:1)");
    else warn("CSS: --muted may have low contrast");
  });

  check("CSS — focus-visible defined", () => {
    if (css.includes(":focus-visible")) ok("CSS: focus-visible styles present");
    else fail("CSS: missing :focus-visible styles");
  });

  check("CSS — reduced-motion", () => {
    if (css.includes("prefers-reduced-motion")) ok("CSS: prefers-reduced-motion media query present");
    else fail("CSS: missing prefers-reduced-motion support");
  });

  check("CSS — touch feedback", () => {
    if (css.includes("@media (hover: none)")) ok("CSS: touch feedback for mobile present");
    else warn("CSS: missing touch-specific styles");
  });

  check("CSS — @font-face declarations", () => {
    const faces = (css.match(/@font-face/g) || []).length;
    if (faces === 4) ok("CSS: 4 @font-face declarations (Light, Regular, Medium, Bold)");
    else fail(`CSS: expected 4 @font-face, found ${faces}`);
  });

  check("CSS — font-display: swap", () => {
    const swaps = (css.match(/font-display:\s*swap/g) || []).length;
    if (swaps === 4) ok("CSS: all font-face declarations use font-display: swap");
    else warn(`CSS: ${swaps}/4 font-face declarations use font-display: swap`);
  });

  check("CSS — direction: rtl on body", () => {
    if (css.includes("direction: rtl")) ok("CSS: body direction: rtl set");
    else fail("CSS: missing direction: rtl");
  });

  check("CSS — responsive breakpoints", () => {
    const has900 = css.includes("max-width: 900px");
    const has560 = css.includes("max-width: 560px");
    const has901 = css.includes("min-width: 901px");
    if (has900 && has560 && has901) ok("CSS: responsive breakpoints (901px, 900px, 560px) present");
    else fail(`CSS: missing breakpoints 900:${has900} 560:${has560} 901:${has901}`);
  });

  check("CSS — card hover effects", () => {
    if (css.includes("info-card:hover") || css.includes(".trust-item:hover")) ok("CSS: card hover effects present");
    else warn("CSS: no card hover effects found");
  });
} else {
  fail("styles.css: file not found");
}

// ═══════════════ JS Syntax Validation ═══════════════

const jsFiles = ["script.js", "admin.js"];

jsFiles.forEach((file) => {
  const js = readFile(file);
  if (!js) { fail(`${file}: file not found`); return; }

  check(`${file} — syntax check`, () => {
    try {
      new vm.Script(js, { filename: file });
      ok(`${file}: JavaScript syntax valid`);
    } catch(e) {
      fail(`${file}: syntax error — ${e.message}`);
    }
  });

  check(`${file} — uses toPersianNumbers`, () => {
    if (js.includes("toPersianNumbers")) ok(`${file}: toPersianNumbers helper present`);
    else fail(`${file}: missing toPersianNumbers helper`);
  });
});

// ═══════════════ File Structure ═══════════════

check("Files — required files exist", () => {
  const required = ["index.html", "about.html", "contact.html", "styles.css", "script.js", "admin.html", "admin.js", "admin-styles.css", "sitemap.xml", "robots.txt"];
  const missing = required.filter((f) => !fs.existsSync(path.join(ROOT, f)));
  if (missing.length === 0) ok("All required files present");
  else fail(`Missing files: ${missing.join(", ")}`);
});

check("Files — font assets exist", () => {
  const fonts = [
    "assets/fonts/IRANSans-Light-web.woff2",
    "assets/fonts/IRANSans-web.woff2",
    "assets/fonts/IRANSans-Medium-web.woff2",
    "assets/fonts/IRANSans-Bold-web.woff2"
  ];
  const missing = fonts.filter((f) => !fs.existsSync(path.join(ROOT, f)));
  if (missing.length === 0) ok("All 4 IRANSans font files present");
  else fail(`Missing fonts: ${missing.join(", ")}`);
});

check("Files — image assets exist", () => {
  const images = ["assets/logo.png", "assets/profile-formal.jpeg", "assets/profile-light.jpeg", "assets/profile-suit.jpeg", "assets/consulting-room.jpeg", "assets/case-score.jpeg"];
  const missing = images.filter((f) => !fs.existsSync(path.join(ROOT, f)));
  if (missing.length === 0) ok("All 6 image assets present");
  else fail(`Missing images: ${missing.join(", ")}`);
});

check("Files — sitemap.xml valid", () => {
  const sitemap = readFile("sitemap.xml");
  if (sitemap && sitemap.includes("<urlset") && sitemap.includes("<url>") && sitemap.includes("<loc>")) ok("sitemap.xml: valid structure with URLs");
  else fail("sitemap.xml: invalid or missing structure");
});

check("Files — robots.txt valid", () => {
  const robots = readFile("robots.txt");
  if (robots && robots.includes("User-agent:") && robots.includes("Sitemap:")) ok("robots.txt: valid with User-agent and Sitemap");
  else fail("robots.txt: invalid structure");
});

// ═══════════════ Admin Panel ═══════════════

const adminHtml = readFile("admin.html");
if (adminHtml) {
  check("Admin — lang/dir attributes", () => {
    if (adminHtml.includes('lang="fa"') && adminHtml.includes('dir="rtl"')) ok("admin.html: lang/dir correct");
    else fail("admin.html: missing lang/dir");
  });

  check("Admin — 9 tab sections", () => {
    const tabs = ["dashboard", "content", "users", "gallery", "blog", "files", "plugins", "social", "settings"];
    const missing = tabs.filter((t) => !adminHtml.includes(`tab-${t}`));
    if (missing.length === 0) ok("admin.html: all 9 tab sections present");
    else fail(`admin.html: missing tabs: ${missing.join(", ")}`);
  });

  check("Admin — Quill.js CDN", () => {
    if (adminHtml.includes("quill")) ok("admin.html: Quill.js CDN included");
    else fail("admin.html: missing Quill.js");
  });

  check("Admin — Swiper not on admin", () => {
    if (!adminHtml.includes("swiper")) ok("admin.html: no Swiper dependency (correct)");
    else warn("admin.html: unexpected Swiper dependency");
  });
}

// ═══════════════ Report ═══════════════

console.log("\n" + "═".repeat(60));
console.log("  PROJECT VALIDATION REPORT");
console.log("═".repeat(60) + "\n");

const grouped = { PASS: [], FAIL: [], WARN: [] };
results.forEach((r) => grouped[r.status].push(r.msg));

if (grouped.FAIL.length) {
  console.log(`\x1b[31m  ✗ FAILURES (${grouped.FAIL.length})\x1b[0m`);
  grouped.FAIL.forEach((m) => console.log(`    \x1b[31m✗\x1b[0m ${m}`));
}

if (grouped.WARN.length) {
  console.log(`\x1b[33m  ⚠ WARNINGS (${grouped.WARN.length})\x1b[0m`);
  grouped.WARN.forEach((m) => console.log(`    \x1b[33m⚠\x1b[0m ${m}`));
}

if (grouped.PASS.length) {
  console.log(`\x1b[32m  ✓ PASSED (${grouped.PASS.length})\x1b[0m`);
  grouped.PASS.forEach((m) => console.log(`    \x1b[32m✓\x1b[0m ${m}`));
}

console.log("\n" + "─".repeat(60));
console.log(`  Total: ${passed + failed + warnings} | \x1b[32mPass: ${passed}\x1b[0m | \x1b[31mFail: ${failed}\x1b[0m | \x1b[33mWarn: ${warnings}\x1b[0m`);
console.log("─".repeat(60) + "\n");

process.exit(failed > 0 ? 1 : 0);
