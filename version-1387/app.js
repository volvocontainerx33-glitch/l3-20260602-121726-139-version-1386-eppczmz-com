document.addEventListener('DOMContentLoaded', function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.getElementById('mobileNav');
    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var open = mobileNav.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    var carousel = document.querySelector('[data-hero-carousel]');
    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
        var current = 0;
        var show = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        };
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
            });
        });
        if (slides.length > 1) {
            setInterval(function () {
                show(current + 1);
            }, 5200);
        }
    }

    var panels = Array.prototype.slice.call(document.querySelectorAll('.filter-panel'));
    panels.forEach(function (panel) {
        var section = panel.closest('section') || document;
        var input = panel.querySelector('.movie-search');
        var category = panel.querySelector('.filter-category');
        var year = panel.querySelector('.filter-year');
        var cards = Array.prototype.slice.call(section.querySelectorAll('.movie-card'));
        var filter = function () {
            var query = input ? input.value.trim().toLowerCase() : '';
            var categoryValue = category ? category.value : '';
            var yearValue = year ? year.value : '';
            cards.forEach(function (card) {
                var haystack = card.getAttribute('data-title') || '';
                var cardCategory = card.getAttribute('data-category') || '';
                var cardYear = parseInt(card.getAttribute('data-year') || '0', 10);
                var matchQuery = !query || haystack.indexOf(query) !== -1;
                var matchCategory = !categoryValue || cardCategory === categoryValue;
                var matchYear = true;
                if (yearValue) {
                    var selectedYear = parseInt(yearValue, 10);
                    matchYear = selectedYear >= 2010 ? cardYear >= selectedYear : String(cardYear) === yearValue;
                }
                card.classList.toggle('is-hidden', !(matchQuery && matchCategory && matchYear));
            });
        };
        [input, category, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', filter);
                control.addEventListener('change', filter);
            }
        });
    });
});
