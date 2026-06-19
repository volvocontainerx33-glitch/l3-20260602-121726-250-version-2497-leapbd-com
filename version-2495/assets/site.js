(function () {
  const navToggle = document.querySelector('[data-nav-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const indicators = Array.from(hero.querySelectorAll('[data-hero-indicator]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let active = 0;
    let timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });

      indicators.forEach(function (indicator, indicatorIndex) {
        indicator.classList.toggle('is-active', indicatorIndex === active);
      });
    }

    function restartTimer() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        showSlide(active + 1);
      }, 5600);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(active - 1);
        restartTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(active + 1);
        restartTimer();
      });
    }

    indicators.forEach(function (indicator) {
      indicator.addEventListener('click', function () {
        showSlide(Number(indicator.dataset.heroIndicator || 0));
        restartTimer();
      });
    });

    restartTimer();
  }

  const searchInput = document.querySelector('[data-site-search]');
  const yearFilter = document.querySelector('[data-year-filter]');
  const resultsBox = document.querySelector('[data-search-results]');

  function normalize(text) {
    return String(text || '').toLowerCase().trim();
  }

  function resultHref(item, prefix) {
    return prefix + 'detail/' + item.id + '.html';
  }

  function posterHref(item, prefix) {
    return prefix + item.poster;
  }

  function runSearch() {
    if (!searchInput || !resultsBox || !Array.isArray(window.MOVIE_SEARCH_DATA)) {
      return;
    }

    const prefix = resultsBox.dataset.prefix || '';
    const query = normalize(searchInput.value);
    const year = yearFilter ? yearFilter.value : '';

    if (!query && !year) {
      resultsBox.classList.remove('is-open');
      resultsBox.innerHTML = '';
      return;
    }

    const matches = window.MOVIE_SEARCH_DATA.filter(function (item) {
      const haystack = normalize([
        item.title,
        item.region,
        item.type,
        item.year,
        item.genre,
        item.tags
      ].join(' '));

      const queryOk = !query || haystack.includes(query);
      let yearOk = true;

      if (year === '2020') {
        yearOk = Number(item.year) <= 2020;
      } else if (year) {
        yearOk = String(item.year) === year;
      }

      return queryOk && yearOk;
    }).slice(0, 18);

    resultsBox.classList.add('is-open');

    if (!matches.length) {
      resultsBox.innerHTML = '<div class="search-result-item"><div></div><div>没有找到匹配影片</div><div></div></div>';
      return;
    }

    resultsBox.innerHTML = matches.map(function (item) {
      return [
        '<a class="search-result-item" href="' + resultHref(item, prefix) + '">',
        '  <span class="result-thumb" style="background-image: linear-gradient(180deg, rgba(2, 6, 23, 0.08), rgba(2, 6, 23, 0.72)), url(\'' + posterHref(item, prefix) + '\');"></span>',
        '  <span><strong>' + item.title + '</strong><br><small>' + item.year + ' · ' + item.region + ' · ' + item.genre + '</small></span>',
        '  <span>查看</span>',
        '</a>'
      ].join('');
    }).join('');
  }

  if (searchInput) {
    searchInput.addEventListener('input', runSearch);
  }

  if (yearFilter) {
    yearFilter.addEventListener('change', runSearch);
  }
})();
