(function () {
  var heroTimer = null;

  function initMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var show = function (nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('is-active', itemIndex === index);
      });
    };
    var play = function () {
      window.clearInterval(heroTimer);
      heroTimer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    };
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var nextIndex = Number(dot.getAttribute('data-hero-dot')) || 0;
        show(nextIndex);
        play();
      });
    });
    hero.addEventListener('mouseenter', function () {
      window.clearInterval(heroTimer);
    });
    hero.addEventListener('mouseleave', play);
    play();
  }

  function getValue(root, selector) {
    var node = root.querySelector(selector);
    return node ? node.value.trim().toLowerCase() : '';
  }

  function initFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));
    forms.forEach(function (form) {
      var targetSelector = form.getAttribute('data-filter-target');
      var target = document.querySelector(targetSelector);
      if (!target) {
        return;
      }
      var cards = Array.prototype.slice.call(target.querySelectorAll('.movie-card'));
      var empty = document.querySelector('[data-empty-for="' + target.id + '"]');
      var run = function () {
        var query = getValue(form, '[data-search-input]');
        var year = getValue(form, '[data-filter-year]');
        var type = getValue(form, '[data-filter-type]');
        var category = getValue(form, '[data-filter-category]');
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = (card.getAttribute('data-search') || '').toLowerCase();
          var ok = true;
          if (query && haystack.indexOf(query) === -1) {
            ok = false;
          }
          if (year && card.getAttribute('data-year') !== year) {
            ok = false;
          }
          if (type && (card.getAttribute('data-type') || '').indexOf(type) === -1) {
            ok = false;
          }
          if (category && card.getAttribute('data-category') !== category) {
            ok = false;
          }
          card.classList.toggle('is-hidden-card', !ok);
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      };
      form.addEventListener('input', run);
      form.addEventListener('change', run);
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        run();
      });
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (stage) {
      var video = stage.querySelector('video');
      var button = stage.querySelector('.video-overlay');
      var source = stage.getAttribute('data-video-url');
      var hls = null;
      if (!video || !button || !source) {
        return;
      }
      var playVideo = function () {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            stage.classList.remove('is-playing');
          });
        }
      };
      var attach = function () {
        if (video.getAttribute('data-ready') === '1') {
          return;
        }
        video.setAttribute('data-ready', '1');
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            playVideo();
          });
        } else {
          video.src = source;
        }
      };
      var start = function () {
        attach();
        stage.classList.add('is-playing');
        video.setAttribute('controls', 'controls');
        playVideo();
      };
      button.addEventListener('click', start);
      stage.addEventListener('click', function (event) {
        if (event.target === video && video.paused) {
          start();
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hls && typeof hls.destroy === 'function') {
          hls.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
