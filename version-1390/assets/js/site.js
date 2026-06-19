(function () {
    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var toggle = document.querySelector('.menu-toggle');
        var nav = document.querySelector('.site-nav');
        if (toggle && nav) {
            toggle.addEventListener('click', function () {
                nav.classList.toggle('open');
            });
        }

        var slider = document.querySelector('[data-hero-slider]');
        if (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
            var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
            var index = 0;
            var activate = function (next) {
                index = (next + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle('active', i === index);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle('active', i === index);
                });
            };
            dots.forEach(function (dot, i) {
                dot.addEventListener('click', function () {
                    activate(i);
                });
            });
            if (slides.length > 1) {
                window.setInterval(function () {
                    activate(index + 1);
                }, 5600);
            }
        }

        var queryInput = document.querySelector('[data-page-search]');
        var yearFilter = document.querySelector('[data-year-filter]');
        var list = document.querySelector('[data-filter-list]');
        if (list && (queryInput || yearFilter)) {
            var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
            var urlQuery = new URLSearchParams(window.location.search).get('q') || '';
            if (queryInput && urlQuery) {
                queryInput.value = urlQuery;
            }
            var applyFilter = function () {
                var term = queryInput ? queryInput.value.trim().toLowerCase() : '';
                var year = yearFilter ? yearFilter.value : '';
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute('data-title') || '',
                        card.getAttribute('data-tags') || '',
                        card.getAttribute('data-year') || ''
                    ].join(' ').toLowerCase();
                    var matchedTerm = !term || haystack.indexOf(term) > -1;
                    var matchedYear = !year || card.getAttribute('data-year') === year;
                    card.classList.toggle('is-filtered-out', !(matchedTerm && matchedYear));
                });
            };
            if (queryInput) {
                queryInput.addEventListener('input', applyFilter);
            }
            if (yearFilter) {
                yearFilter.addEventListener('change', applyFilter);
            }
            applyFilter();
        }
    });

    window.setupMoviePlayer = function (source) {
        var video = document.getElementById('moviePlayer');
        var button = document.getElementById('playerStart');
        var hls;
        if (!video || !button || !source) {
            return;
        }
        var start = function () {
            button.classList.add('is-hidden');
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                if (!video.getAttribute('src')) {
                    video.src = source;
                }
            } else if (window.Hls && window.Hls.isSupported()) {
                if (!hls) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                }
            } else {
                video.src = source;
            }
            var playResult = video.play();
            if (playResult && typeof playResult.catch === 'function') {
                playResult.catch(function () {
                    button.classList.remove('is-hidden');
                });
            }
        };
        button.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener('play', function () {
            button.classList.add('is-hidden');
        });
    };
})();
