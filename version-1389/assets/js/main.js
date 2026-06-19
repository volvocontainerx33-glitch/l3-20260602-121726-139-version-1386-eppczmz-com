(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var activeSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        activeSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('is-active', i === activeSlide);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('is-active', i === activeSlide);
        });
    }

    dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
            showSlide(i);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5200);
    }

    var searchForms = Array.prototype.slice.call(document.querySelectorAll('[data-hero-search]'));
    searchForms.forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input');
            var query = input ? input.value.trim() : '';
            var target = form.getAttribute('data-target') || 'search.html';
            window.location.href = query ? target + '?q=' + encodeURIComponent(query) : target;
        });
    });

    var filterRoot = document.querySelector('[data-filter-root]');
    if (filterRoot) {
        var keywordInput = filterRoot.querySelector('[data-filter-keyword]');
        var yearSelect = filterRoot.querySelector('[data-filter-year]');
        var typeSelect = filterRoot.querySelector('[data-filter-type]');
        var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('[data-title]'));
        var empty = filterRoot.querySelector('[data-empty]');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';

        if (keywordInput && initialQuery) {
            keywordInput.value = initialQuery;
        }

        function normalize(value) {
            return String(value || '').toLowerCase();
        }

        function applyFilter() {
            var keyword = normalize(keywordInput ? keywordInput.value : '');
            var year = yearSelect ? yearSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-category'),
                    card.textContent
                ].join(' '));
                var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var okYear = !year || card.getAttribute('data-year') === year;
                var okType = !type || card.getAttribute('data-type') === type;
                var ok = okKeyword && okYear && okType;
                card.style.display = ok ? '' : 'none';
                if (ok) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.style.display = visible ? 'none' : 'block';
            }
        }

        [keywordInput, yearSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });

        applyFilter();
    }
})();

function bindPlayer(config) {
    var video = document.getElementById(config.videoId);
    var button = document.getElementById(config.buttonId);
    var overlay = document.getElementById(config.overlayId);
    var started = false;
    var hlsInstance = null;

    function begin() {
        if (!video) {
            return;
        }

        if (overlay) {
            overlay.classList.add('is-hidden');
        }

        if (!started) {
            started = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = config.stream;
                video.play().catch(function () {});
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new Hls();
                hlsInstance.loadSource(config.stream);
                hlsInstance.attachMedia(video);
                hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
            } else {
                video.src = config.stream;
                video.play().catch(function () {});
            }
        } else {
            video.play().catch(function () {});
        }
    }

    if (button) {
        button.addEventListener('click', begin);
    }

    if (overlay) {
        overlay.addEventListener('click', begin);
    }

    if (video) {
        video.addEventListener('click', function () {
            if (video.paused) {
                begin();
            } else {
                video.pause();
            }
        });
    }

    window.addEventListener('pagehide', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
