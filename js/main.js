// =========================================================
// НОЧНОЙ СПЛАВ — общие скрипты сайта
// =========================================================

// Форма бронирования и заявка для корпоративов отправляются на email
// через сервис приёма форм (Formspree и аналоги подключаются бесплатно за 2 минуты).
// Замените FORM_ENDPOINT на свой адрес вида https://formspree.io/f/xxxxxxx
const FORM_ENDPOINT = "https://formspree.io/f/REPLACE_WITH_YOUR_ID";
const CONTACT_EMAIL = "info@nightsplav.ru";

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
});

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

  burger.addEventListener("click", () => {
    nav.classList.toggle("open");
    burger.setAttribute("aria-expanded", nav.classList.contains("open"));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => nav.classList.remove("open"));
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

  try {
    const response = await fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new FormData(form),
    });

    if (response.ok) {
      form.reset();
      if (successBox) successBox.classList.add("show");
    } else {
      throw new Error("submit failed");
    }
  } catch (err) {
    alert(
      `Не получилось отправить форму автоматически. Напишите нам напрямую: ${CONTACT_EMAIL}`
    );
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }
  }
}
