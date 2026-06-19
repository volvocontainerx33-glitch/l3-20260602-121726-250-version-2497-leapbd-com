import { H as Hls } from "./hls-vendor.js";

const ready = (callback) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback, { once: true });
  } else {
    callback();
  }
};

const initMobileMenu = () => {
  const toggle = document.querySelector(".menu-toggle");
  const panel = document.querySelector(".mobile-panel");

  if (!toggle || !panel) {
    return;
  }

  toggle.addEventListener("click", () => {
    const isOpen = panel.hasAttribute("hidden");
    panel.toggleAttribute("hidden", !isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.textContent = isOpen ? "×" : "☰";
  });
};

const initHero = () => {
  const hero = document.querySelector("[data-hero]");

  if (!hero) {
    return;
  }

  const slides = Array.from(hero.querySelectorAll(".hero-slide"));
  const dots = Array.from(hero.querySelectorAll(".hero-dot"));
  const previous = hero.querySelector(".hero-prev");
  const next = hero.querySelector(".hero-next");
  let current = 0;
  let timer = null;

  const showSlide = (index) => {
    current = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === current);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => showSlide(current + 1), 5200);
  };

  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  previous?.addEventListener("click", () => {
    showSlide(current - 1);
    start();
  });

  next?.addEventListener("click", () => {
    showSlide(current + 1);
    start();
  });

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      showSlide(index);
      start();
    });
  });

  hero.addEventListener("mouseenter", stop);
  hero.addEventListener("mouseleave", start);
  start();
};

const normalize = (value) => (value || "").toString().trim().toLowerCase();

const initFilters = () => {
  const scope = document.querySelector(".filter-scope");

  if (!scope) {
    return;
  }

  const cards = Array.from(scope.querySelectorAll(".movie-card"));
  const input = document.querySelector(".page-filter");
  const category = document.querySelector(".category-filter");
  const year = document.querySelector(".year-filter");
  const params = new URLSearchParams(window.location.search);
  const query = params.get("q") || "";

  if (input && query) {
    input.value = query;
  }

  const apply = () => {
    const text = normalize(input?.value || "");
    const selectedCategory = normalize(category?.value || "");
    const selectedYear = normalize(year?.value || "");

    cards.forEach((card) => {
      const haystack = normalize(card.getAttribute("data-search"));
      const cardCategory = normalize(card.getAttribute("data-category"));
      const cardYear = normalize(card.getAttribute("data-year"));
      const matchesText = !text || haystack.includes(text);
      const matchesCategory = !selectedCategory || cardCategory === selectedCategory;
      const matchesYear = !selectedYear || cardYear === selectedYear;
      card.classList.toggle("is-filter-hidden", !(matchesText && matchesCategory && matchesYear));
    });
  };

  input?.addEventListener("input", apply);
  category?.addEventListener("change", apply);
  year?.addEventListener("change", apply);
  apply();
};

const parsePlayerData = (card) => {
  const node = card.querySelector(".player-data");

  if (!node) {
    return null;
  }

  try {
    return JSON.parse(node.textContent || "{}");
  } catch {
    return null;
  }
};

const initPlayer = () => {
  const card = document.querySelector(".player-card");

  if (!card) {
    return;
  }

  const video = card.querySelector(".movie-video");
  const overlay = card.querySelector(".play-overlay");
  const data = parsePlayerData(card);
  let hls = null;
  let attached = false;

  if (!video || !data?.src) {
    return;
  }

  const attach = () => {
    if (attached) {
      return;
    }

    attached = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = data.src;
      video.load();
      return;
    }

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.attachMedia(video);
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource(data.src);
      });

      hls.on(Hls.Events.ERROR, (_event, detail) => {
        if (!detail.fatal) {
          return;
        }

        if (detail.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (detail.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      });
    }
  };

  const play = () => {
    attach();
    overlay?.classList.add("is-hidden");

    const tryPlay = () => {
      const promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(() => {});
      }
    };

    tryPlay();
    video.addEventListener("canplay", tryPlay, { once: true });
    video.addEventListener("loadedmetadata", tryPlay, { once: true });
  };

  overlay?.addEventListener("click", play);
  video.addEventListener("click", () => {
    if (!attached) {
      play();
    }
  });

  window.addEventListener("pagehide", () => {
    if (hls) {
      hls.destroy();
    }
  });
};

ready(() => {
  initMobileMenu();
  initHero();
  initFilters();
  initPlayer();
});
