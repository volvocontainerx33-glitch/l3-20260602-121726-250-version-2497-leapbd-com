(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function bindHeader() {
    var searchToggle = qs('[data-search-toggle]');
    var menuToggle = qs('[data-menu-toggle]');
    var searchPanel = qs('[data-search-panel]');
    var mobileNav = qs('[data-mobile-nav]');

    if (searchToggle && searchPanel) {
      searchToggle.addEventListener('click', function () {
        searchPanel.classList.toggle('is-open');
        if (searchPanel.classList.contains('is-open')) {
          var input = qs('input[type="search"]', searchPanel);
          if (input) {
            input.focus();
          }
        }
      });
    }

    if (menuToggle && mobileNav) {
      menuToggle.addEventListener('click', function () {
        mobileNav.classList.toggle('is-open');
      });
    }
  }

  function bindHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = qsa('[data-slide]', hero);
    var dots = qsa('[data-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function bindCatalog() {
    var catalog = qs('[data-catalog]');
    if (!catalog) {
      return;
    }

    var searchInput = qs('[data-catalog-search]', catalog);
    var searchButton = qs('[data-catalog-button]', catalog);
    var chips = qsa('[data-filter]', catalog);
    var cards = qsa('.movie-card, .rank-item', catalog);
    var empty = qs('[data-empty]', catalog);
    var activeFilter = 'all';
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (searchInput && query) {
      searchInput.value = query;
    }

    function cardText(card) {
      return normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-tags')
      ].join(' '));
    }

    function applyFilters() {
      var term = normalize(searchInput ? searchInput.value : '');
      var shown = 0;

      cards.forEach(function (card) {
        var text = cardText(card);
        var matchesTerm = !term || text.indexOf(term) !== -1;
        var matchesFilter = activeFilter === 'all' || text.indexOf(normalize(activeFilter)) !== -1;
        var visible = matchesTerm && matchesFilter;
        card.classList.toggle('is-hidden', !visible);
        if (visible) {
          shown += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-open', shown === 0);
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
      searchInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          applyFilters();
        }
      });
    }

    if (searchButton) {
      searchButton.addEventListener('click', applyFilters);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        activeFilter = chip.getAttribute('data-filter') || 'all';
        chips.forEach(function (item) {
          item.classList.toggle('is-active', item === chip);
        });
        applyFilters();
      });
    });

    applyFilters();
  }

  function bindPlayer() {
    var frame = qs('[data-player]');
    if (!frame) {
      return;
    }

    var video = qs('video', frame);
    var overlay = qs('[data-play]', frame);
    var source = video ? video.getAttribute('data-src') : '';
    var hlsInstance = null;

    function attachSource() {
      if (!video || !source) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        if (!hlsInstance) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        }
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (!video.src) {
          video.src = source;
        }
      } else if (!video.src) {
        video.src = source;
      }
    }

    function playVideo() {
      attachSource();
      frame.classList.add('is-playing');
      video.setAttribute('controls', 'controls');
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (overlay && video) {
      overlay.addEventListener('click', playVideo);
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });
    }
  }

  function bindImages() {
    qsa('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.style.visibility = 'hidden';
      }, { once: true });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    bindHeader();
    bindHero();
    bindCatalog();
    bindPlayer();
    bindImages();
  });
})();
