(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("hidden");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 6000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        scopes.forEach(function (scope) {
            var input = scope.querySelector("[data-filter-input]");
            var region = scope.querySelector("[data-filter-region]");
            var type = scope.querySelector("[data-filter-type]");
            var year = scope.querySelector("[data-filter-year]");
            var count = scope.querySelector("[data-result-count]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get("q");
            if (input && initialQuery) {
                input.value = initialQuery;
            }

            function valueOf(element) {
                return element ? element.value.trim().toLowerCase() : "";
            }

            function apply() {
                var query = valueOf(input);
                var regionValue = valueOf(region);
                var typeValue = valueOf(type);
                var yearValue = valueOf(year);
                var visible = 0;
                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-tags"),
                        card.textContent
                    ].join(" ").toLowerCase();
                    var matchQuery = !query || text.indexOf(query) !== -1;
                    var matchRegion = !regionValue || (card.getAttribute("data-region") || "").toLowerCase() === regionValue;
                    var matchType = !typeValue || (card.getAttribute("data-type") || "").toLowerCase() === typeValue;
                    var matchYear = !yearValue || (card.getAttribute("data-year") || "").toLowerCase() === yearValue;
                    var show = matchQuery && matchRegion && matchType && matchYear;
                    card.hidden = !show;
                    if (show) {
                        visible += 1;
                    }
                });
                if (count) {
                    count.textContent = "已显示 " + visible + " 部影片";
                }
            }

            [input, region, type, year].forEach(function (element) {
                if (element) {
                    element.addEventListener("input", apply);
                    element.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    ready(function () {
        setupMobileMenu();
        setupHero();
        setupFilters();
    });
})();
