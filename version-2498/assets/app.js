(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function setupMobileMenu() {
    var button = document.querySelector(".mobile-menu-button");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupSearchPage() {
    var input = document.getElementById("movie-search-input");
    var category = document.getElementById("category-filter");
    var year = document.getElementById("year-filter");
    var region = document.getElementById("region-filter");
    var reset = document.getElementById("reset-filters");
    var count = document.getElementById("result-count");
    var cards = selectAll("#search-results .movie-card");
    if (!input || cards.length === 0) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    input.value = query;

    function applyFilters() {
      var keyword = normalize(input.value);
      var selectedCategory = normalize(category && category.value);
      var selectedYear = normalize(year && year.value);
      var selectedRegion = normalize(region && region.value);
      var shown = 0;
      cards.forEach(function (card) {
        var text = normalize([
          card.dataset.title,
          card.dataset.genre,
          card.dataset.tags,
          card.dataset.region,
          card.textContent
        ].join(" "));
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchCategory = !selectedCategory || normalize(card.dataset.category) === selectedCategory;
        var matchYear = !selectedYear || normalize(card.dataset.year) === selectedYear;
        var matchRegion = !selectedRegion || normalize(card.dataset.region) === selectedRegion;
        var visible = matchKeyword && matchCategory && matchYear && matchRegion;
        card.classList.toggle("is-hidden-by-filter", !visible);
        if (visible) {
          shown += 1;
        }
      });
      if (count) {
        count.textContent = "找到 " + shown + " 部影片";
      }
    }

    [input, category, year, region].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });

    if (reset) {
      reset.addEventListener("click", function () {
        input.value = "";
        if (category) {
          category.value = "";
        }
        if (year) {
          year.value = "";
        }
        if (region) {
          region.value = "";
        }
        applyFilters();
      });
    }

    applyFilters();
  }

  function setupLocalFilter() {
    var input = document.querySelector(".local-search-input");
    var list = document.querySelector(".searchable-list");
    var count = document.querySelector(".filter-count");
    if (!input || !list) {
      return;
    }
    var cards = selectAll(".movie-card", list);

    function applyLocalFilter() {
      var keyword = normalize(input.value);
      var shown = 0;
      cards.forEach(function (card) {
        var text = normalize(card.textContent + " " + card.dataset.title + " " + card.dataset.genre + " " + card.dataset.region + " " + card.dataset.tags);
        var visible = !keyword || text.indexOf(keyword) !== -1;
        card.classList.toggle("is-hidden-by-filter", !visible);
        if (visible) {
          shown += 1;
        }
      });
      if (count) {
        count.textContent = "显示 " + shown + " 部影片";
      }
    }

    input.addEventListener("input", applyLocalFilter);
  }

  window.setupPlayer = function (source) {
    var video = document.getElementById("video-player");
    var cover = document.querySelector(".play-cover");
    var started = false;
    var hlsInstance = null;
    if (!video || !source) {
      return;
    }

    function hideCover() {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    }

    function playVideo() {
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }
    }

    function start() {
      hideCover();
      if (started) {
        playVideo();
        return;
      }
      started = true;
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        video.addEventListener("loadedmetadata", playVideo, { once: true });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
      } else {
        video.src = source;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
      }
    }

    if (cover) {
      cover.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (!started) {
        start();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    setupMobileMenu();
    setupSearchPage();
    setupLocalFilter();
  });
}());
