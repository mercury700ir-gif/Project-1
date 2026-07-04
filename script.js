function toPersianNumbers(str) {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(str).replace(/[0-9]/g, (d) => persianDigits[+d]);
}

function convertNumbersInDOM() {
  const skipSelectors = 'input, textarea, select, svg, [dir="ltr"]';
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        if (!/[0-9]/.test(node.nodeValue)) return NodeFilter.FILTER_REJECT;
        let el = node.parentElement;
        if (el && el.closest(skipSelectors)) return NodeFilter.FILTER_REJECT;
        if (el && el.closest("a[href]")) {
          const href = el.closest("a").getAttribute("href") || "";
          if (href.startsWith("tel:") || href.startsWith("mailto:"))
            return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    }
  );
  while (walker.nextNode()) {
    const node = walker.currentNode;
    node.nodeValue = toPersianNumbers(node.nodeValue);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  convertNumbersInDOM();

  // ── Auth Button State ──
  const authLink = document.getElementById("nav-auth-link");
  if (authLink) {
    try {
      const user = JSON.parse(localStorage.getItem("site_user"));
      if (user && user.name) {
        authLink.textContent = user.name.split(" ")[0];
        authLink.href = "#";
        authLink.classList.add("logged-in");
        authLink.addEventListener("click", (e) => {
          e.preventDefault();
          if (confirm("آیا می‌خواهید خارج شوید؟")) {
            localStorage.removeItem("site_user");
            window.location.reload();
          }
        });
      }
    } catch(e) {}
  }

  // ── Image Lazy Load Observer ──
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');
  if (lazyImages.length) {
    const imgObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("loaded");
            imgObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "200px" }
    );
    lazyImages.forEach((img) => {
      if (img.complete) {
        img.classList.add("loaded");
      } else {
        img.addEventListener("load", () => img.classList.add("loaded"), { once: true });
        imgObserver.observe(img);
      }
    });
  }

  // ── Mobile Menu ──
  const menuButton = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  const menuCloseBtn = document.querySelector(".mobile-menu-close");

  if (menuButton && mobileMenu) {
    let lastFocused = null;

    const setMenu = (isOpen) => {
      menuButton.classList.toggle("is-open", isOpen);
      mobileMenu.classList.toggle("is-open", isOpen);
      document.body.classList.toggle("no-scroll", isOpen);
      menuButton.setAttribute("aria-expanded", String(isOpen));

      if (isOpen) {
        lastFocused = document.activeElement;
        const firstLink = mobileMenu.querySelector("a");
        if (firstLink) setTimeout(() => firstLink.focus(), 100);
      } else if (lastFocused) {
        lastFocused.focus();
      }
    };

    menuButton.addEventListener("click", () => {
      setMenu(!mobileMenu.classList.contains("is-open"));
    });

    if (menuCloseBtn) {
      menuCloseBtn.addEventListener("click", () => setMenu(false));
    }

    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenu(false));
    });

    // Focus trap inside mobile menu
    mobileMenu.addEventListener("keydown", (e) => {
      if (e.key !== "Tab") return;
      const focusable = mobileMenu.querySelectorAll("a, button, [tabindex]:not([tabindex='-1'])");
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && mobileMenu.classList.contains("is-open")) {
        setMenu(false);
      }
    });
  }

  // ── Scroll Animations ──
  const animatedItems = document.querySelectorAll("[data-animate]");
  if (animatedItems.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 }
    );

    animatedItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index * 70, 280)}ms`;
      observer.observe(item);
    });
  }

  // ── Contact Form ──
  const contactForm = document.querySelector(".contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const data = new FormData(contactForm);
      const status = contactForm.querySelector(".form-status");
      const name = data.get("name")?.toString().trim();
      const phone = data.get("phone")?.toString().trim();
      const email = data.get("email")?.toString().trim();
      const subject = data.get("subject")?.toString().trim();
      const message = data.get("message")?.toString().trim();

      if (!name || !phone || !email || !subject || !message) {
        if (status) {
          status.textContent = "لطفا همه فیلدهای ضروری را تکمیل کنید.";
        }
        return;
      }

      const body = [
        `نام: ${name}`,
        `شماره تماس: ${phone}`,
        `ایمیل: ${email}`,
        `موضوع: ${subject}`,
        "",
        "پیام:",
        message,
      ].join("\n");

      const mailto = `mailto:mercury700ir@gmail.com?subject=${encodeURIComponent(
        `درخواست مشاوره: ${subject}`
      )}&body=${encodeURIComponent(body)}`;

      if (status) {
        status.textContent = "در حال باز کردن برنامه ایمیل برای ارسال پیام...";
      }

      window.location.href = mailto;
    });
  }
});

function convertNumbersInDOM() {
  const skipSelectors = 'input, textarea, select, svg, [dir="ltr"]';
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        if (!/[0-9]/.test(node.nodeValue)) return NodeFilter.FILTER_REJECT;
        let el = node.parentElement;
        if (el && el.closest(skipSelectors)) return NodeFilter.FILTER_REJECT;
        if (el && el.closest("a[href]")) {
          const href = el.closest("a").getAttribute("href") || "";
          if (href.startsWith("tel:") || href.startsWith("mailto:"))
            return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    }
  );
  while (walker.nextNode()) {
    const node = walker.currentNode;
    node.nodeValue = toPersianNumbers(node.nodeValue);
  }
}

document.addEventListener("DOMContentLoaded", convertNumbersInDOM);

const menuButton = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
const animatedItems = document.querySelectorAll("[data-animate]");
const contactForm = document.querySelector(".contact-form");

if (menuButton && mobileMenu) {
  const setMenu = (isOpen) => {
    menuButton.classList.toggle("is-open", isOpen);
    mobileMenu.classList.toggle("is-open", isOpen);
    document.body.classList.toggle("no-scroll", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
  };

  menuButton.addEventListener("click", () => {
    setMenu(!mobileMenu.classList.contains("is-open"));
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenu(false);
    }
  });
}

if (animatedItems.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  animatedItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 70, 280)}ms`;
    observer.observe(item);
  });
}

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(contactForm);
    const status = contactForm.querySelector(".form-status");
    const name = data.get("name")?.toString().trim();
    const phone = data.get("phone")?.toString().trim();
    const email = data.get("email")?.toString().trim();
    const subject = data.get("subject")?.toString().trim();
    const message = data.get("message")?.toString().trim();

    if (!name || !phone || !email || !subject || !message) {
      if (status) {
        status.textContent = "لطفا همه فیلدهای ضروری را تکمیل کنید.";
      }
      return;
    }

    const body = [
      `نام: ${name}`,
      `شماره تماس: ${phone}`,
      `ایمیل: ${email}`,
      `موضوع: ${subject}`,
      "",
      "پیام:",
      message,
    ].join("\n");

    const mailto = `mailto:mercury700ir@gmail.com?subject=${encodeURIComponent(
      `درخواست مشاوره: ${subject}`
    )}&body=${encodeURIComponent(body)}`;

    if (status) {
      status.textContent = "در حال باز کردن برنامه ایمیل برای ارسال پیام...";
    }

    window.location.href = mailto;
  });
}
