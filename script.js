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
