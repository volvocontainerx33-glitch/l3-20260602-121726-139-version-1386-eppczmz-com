(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function initMenu() {
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            button.classList.toggle("is-open");
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var active = 0;
        function show(index) {
            active = index;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === active);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
            });
        });
        window.setInterval(function () {
            show((active + 1) % slides.length);
        }, 5600);
    }

    function initSearchAreas() {
        var areas = Array.prototype.slice.call(document.querySelectorAll("[data-search-area]"));
        areas.forEach(function (area) {
            var input = area.querySelector("[data-search-input]");
            var region = area.querySelector("[data-filter-region]");
            var year = area.querySelector("[data-filter-year]");
            var section = area.parentElement || document;
            var cards = Array.prototype.slice.call(section.querySelectorAll("[data-search-card]"));
            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : "";
                var regionValue = region ? region.value : "";
                var yearValue = year ? year.value : "";
                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-search-text") || card.textContent || "").toLowerCase();
                    var cardRegion = card.getAttribute("data-region") || "";
                    var cardYear = card.getAttribute("data-year") || "";
                    var okText = !keyword || text.indexOf(keyword) !== -1;
                    var okRegion = !regionValue || cardRegion.indexOf(regionValue) !== -1;
                    var okYear = !yearValue || cardYear === yearValue;
                    card.classList.toggle("is-hidden", !(okText && okRegion && okYear));
                });
            }
            if (input) {
                input.addEventListener("input", apply);
            }
            if (region) {
                region.addEventListener("change", apply);
            }
            if (year) {
                year.addEventListener("change", apply);
            }
        });
    }

    function mountPlayer(url) {
        var video = document.querySelector("[data-player]");
        var button = document.querySelector("[data-play-button]");
        var layer = document.querySelector("[data-player-layer]");
        if (!video || !url) {
            return;
        }
        var prepared = false;
        function prepare() {
            if (prepared) {
                return;
            }
            prepared = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
                video._hls = hls;
            } else {
                video.src = url;
            }
            video.setAttribute("controls", "controls");
        }
        function play() {
            prepare();
            if (layer) {
                layer.classList.add("is-hidden");
            }
            var action = video.play();
            if (action && typeof action.catch === "function") {
                action.catch(function () {});
            }
        }
        if (button) {
            button.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initSearchAreas();
    });

    window.Site = {
        mountPlayer: mountPlayer
    };
})();
