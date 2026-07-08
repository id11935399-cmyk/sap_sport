// =========================================================
// НОЧНОЙ СПЛАВ — общие скрипты сайта
// =========================================================

// Формы сайта (бронирование, корпоративная заявка, обратная связь) отправляются
// напрямую в Telegram через Bot API — без бэкенда, прямо из браузера.
const TELEGRAM_BOT_TOKEN = "8687001523:AAEVxZnCDPHY91bmURel4YzaQNmEShsRh0g";
const TELEGRAM_CHAT_ID = "1559239267";
const CONTACT_PHONE = "+7 968 989-69-96";

const FORM_FIELD_LABELS = {
  route: "Маршрут",
  date: "Дата",
  group_size: "Кол-во человек",
  name: "Имя",
  phone: "Телефон",
  comment: "Комментарий",
  company: "Компания",
  contact: "Контакт",
  message: "Сообщение",
};

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initFaq();
  initForms();
  markActiveNav();
  prefillBookingRoute();
  initScrollReveal();
  initHeaderScrollState();
  initHeroParallax();
  initMagneticButtons();
  initCountUp();
  initTapHaptics();
  initImageFade();
});

// ---------- Счётчики статистики — докручиваются вверх при попадании в экран ----------
function initCountUp() {
  const stats = document.querySelectorAll(".stat b");
  if (!stats.length || !("IntersectionObserver" in window)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        const el = entry.target;
        const raw = el.textContent.trim();
        const match = raw.match(/^(\d+)(.*)$/);
        if (!match) return;
        const target = parseInt(match[1], 10);
        const suffix = match[2];
        const duration = 1100;
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.4 }
  );
  stats.forEach((el) => observer.observe(el));
}

// ---------- Лёгкая вибро-отдача на тап (Android) ----------
function initTapHaptics() {
  if (!("vibrate" in navigator)) return;
  document.querySelectorAll(".btn, .tile, .burger").forEach((el) => {
    el.addEventListener(
      "touchstart",
      () => {
        navigator.vibrate(8);
      },
      { passive: true }
    );
  });
}

// ---------- Плавное появление фото после загрузки ----------
function initImageFade() {
  document.querySelectorAll(".media img, .tile img").forEach((img) => {
    if (img.complete) return;
    img.style.opacity = "0";
    img.style.transition = "opacity .5s ease";
    img.addEventListener(
      "load",
      () => {
        img.style.opacity = "1";
      },
      { once: true }
    );
  });
}

// ---------- Scroll-reveal для [data-reveal] ----------
function initScrollReveal() {
  const items = document.querySelectorAll("[data-reveal]");
  if (!items.length) return;

  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("in"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );

  items.forEach((el, i) => {
    el.style.transitionDelay = (i % 4) * 70 + "ms";
    observer.observe(el);
  });
}

// ---------- Заголовок: прозрачный поверх hero-cinematic, сплошной при скролле ----------
function initHeaderScrollState() {
  const header = document.querySelector(".site-header.transparent");
  const hero = document.querySelector(".hero-cinematic");
  if (!header || !hero) return;

  const toggle = () => {
    const threshold = hero.offsetHeight - 90;
    header.classList.toggle("scrolled", window.scrollY > threshold);
  };
  toggle();
  window.addEventListener("scroll", toggle, { passive: true });
}

// ---------- Лёгкий параллакс на фото в hero-cinematic ----------
function initHeroParallax() {
  const media = document.querySelector(".hero-cinematic .hero-media");
  if (!media || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const offset = Math.min(window.scrollY, 900) * 0.18;
        media.style.transform = `translateY(${offset}px)`;
        ticking = false;
      });
    },
    { passive: true }
  );
}

// ---------- Магнитные кнопки — лёгкое притяжение к курсору ----------
function initMagneticButtons() {
  const buttons = document.querySelectorAll(".btn-primary, .btn-ghost");
  if (!window.matchMedia("(pointer: fine)").matches) return;

  buttons.forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.18}px, ${y * 0.35}px)`;
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "";
    });
  });
}

// ---------- Подстановка маршрута в форму бронирования из ?route=... ----------
function prefillBookingRoute() {
  const select = document.querySelector('#b-route');
  if (!select) return;
  const route = new URLSearchParams(window.location.search).get("route");
  if (!route) return;
  const option = select.querySelector(`option[value="${route}"]`);
  if (option) select.value = route;
}

// ---------- Мобильное меню ----------
function initMobileNav() {
  const burger = document.querySelector(".burger");
  const nav = document.querySelector(".mobile-nav");
  if (!burger || !nav) return;

  const setOpen = (open) => {
    nav.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", open);
    document.body.style.overflow = open ? "hidden" : "";
  };

  burger.addEventListener("click", () => {
    setOpen(!nav.classList.contains("open"));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });
}

// ---------- Подсветка активного пункта меню ----------
function markActiveNav() {
  document.querySelectorAll(".nav-desktop a, .mobile-nav a").forEach((link) => {
    if (link.pathname === window.location.pathname) {
      link.classList.add("active");
    }
  });
}

// ---------- FAQ-аккордеон ----------
function initFaq() {
  document.querySelectorAll(".faq-item").forEach((item) => {
    const question = item.querySelector(".faq-q");
    if (!question) return;
    question.addEventListener("click", () => {
      const wasOpen = item.classList.contains("open");
      item.parentElement
        .querySelectorAll(".faq-item")
        .forEach((el) => el.classList.remove("open"));
      if (!wasOpen) item.classList.add("open");
    });
  });
}

// ---------- Формы (бронирование / корпоративная заявка) ----------
function initForms() {
  document.querySelectorAll("form[data-form]").forEach((form) => {
    form.addEventListener("submit", (e) => handleFormSubmit(e, form));
  });
}

async function handleFormSubmit(e, form) {
  e.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  const successBox = form.parentElement.querySelector(".form-success");
  const originalLabel = submitBtn ? submitBtn.textContent : "";

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Отправляем...";
  }

  const formName = form.dataset.formName || "Заявка с сайта";
  const lines = [`Новая заявка: ${formName}`];

  new FormData(form).forEach((value, key) => {
    if (!value) return;
    let displayValue = value;
    const field = form.elements[key];
    if (field && field.tagName === "SELECT") {
      displayValue = field.options[field.selectedIndex].text;
    }
    lines.push(`${FORM_FIELD_LABELS[key] || key}: ${displayValue}`);
  });

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ chat_id: TELEGRAM_CHAT_ID, text: lines.join("\n") }),
      }
    );

    if (response.ok) {
      form.reset();
      if (successBox) successBox.classList.add("show");
    } else {
      throw new Error("submit failed");
    }
  } catch (err) {
    alert(
      `Не получилось отправить заявку автоматически. Напишите нам напрямую: ${CONTACT_PHONE}`
    );
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }
  }
}
