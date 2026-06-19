(function() {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function() {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  var slider = document.querySelector('[data-slider]');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }
    dots.forEach(function(dot, i) {
      dot.addEventListener('click', function() {
        show(i);
      });
    });
    if (slides.length > 1) {
      setInterval(function() {
        show(current + 1);
      }, 5200);
    }
  }

  var filterInput = document.querySelector('.filter-input');
  var selects = Array.prototype.slice.call(document.querySelectorAll('.filter-select'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('.filter-card'));
  function applyFilters() {
    var q = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var values = {};
    selects.forEach(function(sel) {
      values[sel.getAttribute('data-filter')] = sel.value;
    });
    cards.forEach(function(card) {
      var text = card.textContent.toLowerCase() + ' ' + (card.getAttribute('data-title') || '').toLowerCase();
      var ok = !q || text.indexOf(q) !== -1;
      if (ok && values.category) {
        ok = card.getAttribute('data-category') === values.category;
      }
      if (ok && values.region) {
        ok = card.getAttribute('data-region') === values.region;
      }
      if (ok && values.year) {
        ok = card.getAttribute('data-year') === values.year;
      }
      card.classList.toggle('is-filter-hidden', !ok);
    });
  }
  if (filterInput) {
    filterInput.addEventListener('input', applyFilters);
  }
  selects.forEach(function(sel) {
    sel.addEventListener('change', applyFilters);
  });

  var params = new URLSearchParams(window.location.search);
  var query = params.get('q');
  if (query && filterInput) {
    filterInput.value = query;
    applyFilters();
  }
})();
