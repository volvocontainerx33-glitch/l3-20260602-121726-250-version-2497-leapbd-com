(function() {
  var toggle = document.querySelector('.menu-toggle');
  var panel = document.querySelector('.mobile-panel');
  if (toggle && panel) {
    toggle.addEventListener('click', function() {
      panel.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function(slide, i) {
      slide.classList.toggle('active', i === current);
    });
    dots.forEach(function(dot, i) {
      dot.classList.toggle('active', i === current);
    });
  }

  if (slides.length) {
    dots.forEach(function(dot, i) {
      dot.addEventListener('click', function() {
        showSlide(i);
      });
    });
    if (prev) {
      prev.addEventListener('click', function() {
        showSlide(current - 1);
      });
    }
    if (next) {
      next.addEventListener('click', function() {
        showSlide(current + 1);
      });
    }
    window.setInterval(function() {
      showSlide(current + 1);
    }, 5200);
    showSlide(0);
  }

  var filterPanel = document.querySelector('[data-filter-panel]');
  if (filterPanel) {
    var input = filterPanel.querySelector('[data-filter-input]');
    var typeSelect = filterPanel.querySelector('[data-filter-type]');
    var regionSelect = filterPanel.querySelector('[data-filter-region]');
    var yearSelect = filterPanel.querySelector('[data-filter-year]');
    var button = filterPanel.querySelector('[data-filter-button]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var empty = document.querySelector('.empty-state');
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    if (input && q) {
      input.value = q;
    }

    function match(card) {
      var words = (input ? input.value : '').trim().toLowerCase();
      var type = typeSelect ? typeSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var text = [
        card.dataset.title || '',
        card.dataset.region || '',
        card.dataset.type || '',
        card.dataset.year || '',
        card.dataset.genre || ''
      ].join(' ').toLowerCase();
      if (words && text.indexOf(words) === -1) {
        return false;
      }
      if (type && (card.dataset.type || '').indexOf(type) === -1) {
        return false;
      }
      if (region && (card.dataset.region || '').indexOf(region) === -1) {
        return false;
      }
      if (year && String(card.dataset.year || '') !== year) {
        return false;
      }
      return true;
    }

    function applyFilter() {
      var visible = 0;
      cards.forEach(function(card) {
        var ok = match(card);
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, typeSelect, regionSelect, yearSelect].forEach(function(el) {
      if (el) {
        el.addEventListener('input', applyFilter);
        el.addEventListener('change', applyFilter);
      }
    });
    if (button) {
      button.addEventListener('click', applyFilter);
    }
    applyFilter();
  }
})();
