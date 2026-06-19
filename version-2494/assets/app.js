(function () {
  var header = document.getElementById("siteHeader");
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobilePanel = document.querySelector("[data-mobile-panel]");
  var backTop = document.querySelector("[data-back-top]");

  function updateScrollState() {
    if (header) {
      header.classList.toggle("scrolled", window.scrollY > 12);
    }
    if (backTop) {
      backTop.classList.toggle("show", window.scrollY > 420);
    }
  }

  window.addEventListener("scroll", updateScrollState, { passive: true });
  updateScrollState();

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      var isOpen = mobilePanel.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });
  }

  if (backTop) {
    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
        restart();
      });
    }

    showSlide(0);
    restart();
  }

  document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
    var search = scope.querySelector("[data-card-search]");
    var year = scope.querySelector("[data-year-filter]");
    var region = scope.querySelector("[data-region-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .rank-card"));

    function applyFilters() {
      var keyword = search ? search.value.trim().toLowerCase() : "";
      var selectedYear = year ? year.value : "";
      var selectedRegion = region ? region.value : "";

      cards.forEach(function (card) {
        var title = (card.getAttribute("data-title") || "").toLowerCase();
        var tags = (card.getAttribute("data-tags") || "").toLowerCase();
        var cardYear = card.getAttribute("data-year") || "";
        var cardRegion = card.getAttribute("data-region") || "";
        var matchesKeyword = !keyword || title.indexOf(keyword) >= 0 || tags.indexOf(keyword) >= 0;
        var matchesYear = !selectedYear || cardYear === selectedYear;
        var matchesRegion = !selectedRegion || cardRegion === selectedRegion;
        card.classList.toggle("hide-card", !(matchesKeyword && matchesYear && matchesRegion));
      });
    }

    [search, year, region].forEach(function (element) {
      if (element) {
        element.addEventListener("input", applyFilters);
        element.addEventListener("change", applyFilters);
      }
    });
  });

  var searchResults = document.querySelector("[data-search-results]");
  if (searchResults && window.searchIndex) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var searchInput = document.querySelector("[data-search-page-input]");

    if (searchInput) {
      searchInput.value = query;
    }

    function renderResults(keyword) {
      var normalized = keyword.trim().toLowerCase();
      var items = window.searchIndex.filter(function (item) {
        if (!normalized) {
          return true;
        }
        return item.title.toLowerCase().indexOf(normalized) >= 0 ||
          item.region.toLowerCase().indexOf(normalized) >= 0 ||
          item.genre.toLowerCase().indexOf(normalized) >= 0 ||
          item.tags.toLowerCase().indexOf(normalized) >= 0 ||
          item.summary.toLowerCase().indexOf(normalized) >= 0;
      }).slice(0, 120);

      if (!items.length) {
        searchResults.innerHTML = '<div class="search-empty">没有找到相关影片，换个关键词再试试。</div>';
        return;
      }

      searchResults.innerHTML = items.map(function (item) {
        return '<article class="movie-card">' +
          '<a class="poster-wrap" href="' + item.file + '">' +
          '<img src="' + item.image + '" alt="' + item.title.replace(/"/g, '&quot;') + '" loading="lazy">' +
          '<span class="poster-year">' + item.year + '</span>' +
          '<span class="poster-play">▶</span>' +
          '</a>' +
          '<div class="card-body">' +
          '<a class="card-category" href="category-' + item.categorySlug + '.html">' + item.categoryName + '</a>' +
          '<h2><a href="' + item.file + '">' + item.title + '</a></h2>' +
          '<p>' + item.summary + '</p>' +
          '<div class="card-meta"><span>' + item.region + '</span><span>' + item.type + '</span><span>' + item.genre + '</span></div>' +
          '</div>' +
          '</article>';
      }).join("");
    }

    renderResults(query);
  }
})();
