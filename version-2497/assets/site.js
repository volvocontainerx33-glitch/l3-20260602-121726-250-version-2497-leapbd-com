(() => {
  const menuButton = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", () => {
      const open = mobileMenu.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(open));
    });
  }

  const carousel = document.querySelector("[data-hero-carousel]");

  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll(".hero-slide"));
    const dots = Array.from(carousel.querySelectorAll(".hero-dot"));
    let index = 0;

    const show = (next) => {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle("is-active", i === index));
      dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
    };

    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => show(i));
    });

    if (slides.length > 1) {
      window.setInterval(() => show(index + 1), 5200);
    }
  }

  const params = new URLSearchParams(window.location.search);
  const searchInput = document.getElementById("searchInput");
  const yearFilter = document.getElementById("yearFilter");
  const cards = Array.from(document.querySelectorAll("[data-search-card]"));
  const emptyState = document.querySelector(".empty-state");
  const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
  let activeCategory = "all";

  if (searchInput && params.get("q")) {
    searchInput.value = params.get("q");
  }

  const applyFilters = () => {
    const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const yearValue = yearFilter ? yearFilter.value : "";
    let visible = 0;

    cards.forEach((card) => {
      const blob = (card.getAttribute("data-title") || "").toLowerCase();
      const year = Number(card.getAttribute("data-year") || 0);
      const category = card.getAttribute("data-category") || "";
      const textMatch = !query || blob.includes(query);
      const categoryMatch = activeCategory === "all" || category === activeCategory;
      let yearMatch = true;

      if (yearValue === "2025" || yearValue === "2024" || yearValue === "2023") {
        yearMatch = year === Number(yearValue);
      } else if (yearValue === "2020" || yearValue === "2010") {
        yearMatch = year >= Number(yearValue);
      }

      const showCard = textMatch && categoryMatch && yearMatch;
      card.hidden = !showCard;

      if (showCard) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visible !== 0;
    }
  };

  if (cards.length) {
    if (searchInput) {
      searchInput.addEventListener("input", applyFilters);
    }

    if (yearFilter) {
      yearFilter.addEventListener("change", applyFilters);
    }

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        activeCategory = button.getAttribute("data-filter") || "all";
        filterButtons.forEach((item) => item.classList.toggle("active", item === button));
        applyFilters();
      });
    });

    applyFilters();
  }

  const players = Array.from(document.querySelectorAll("[data-player]"));

  players.forEach((player) => {
    const video = player.querySelector("video");
    const cover = player.querySelector(".player-cover");

    if (!video || !cover) {
      return;
    }

    const streamUrl = cover.getAttribute("data-stream");
    let hlsPlayer = null;

    const attach = () => {
      if (!streamUrl || video.dataset.ready === "1") {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsPlayer = new window.Hls({ enableWorker: true });
        hlsPlayer.loadSource(streamUrl);
        hlsPlayer.attachMedia(video);
      } else {
        video.src = streamUrl;
      }

      video.dataset.ready = "1";
    };

    const play = () => {
      attach();
      cover.classList.add("is-hidden");
      const result = video.play();

      if (result && typeof result.catch === "function") {
        result.catch(() => {
          cover.classList.remove("is-hidden");
        });
      }
    };

    cover.addEventListener("click", play);

    video.addEventListener("click", () => {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener("play", () => {
      cover.classList.add("is-hidden");
    });

    window.addEventListener("beforeunload", () => {
      if (hlsPlayer) {
        hlsPlayer.destroy();
      }
    });
  });
})();
