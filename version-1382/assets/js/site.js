(function () {
    const mobileToggle = document.querySelector("[data-mobile-toggle]");
    const mobilePanel = document.querySelector("[data-mobile-panel]");

    if (mobileToggle && mobilePanel) {
        mobileToggle.addEventListener("click", function () {
            mobilePanel.classList.toggle("is-open");
        });
    }

    document.querySelectorAll("[data-search-form]").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            const input = form.querySelector("input[name='q']");
            const value = input ? input.value.trim() : "";
            if (value) {
                window.location.href = "./search.html?q=" + encodeURIComponent(value);
            }
        });
    });

    const hero = document.querySelector("[data-hero]");
    if (hero) {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        let current = 0;

        const showSlide = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(current + 1);
            }, 6200);
        }
    }

    const filterRoot = document.querySelector("[data-filter-root]");
    if (filterRoot) {
        const queryInput = filterRoot.querySelector("[data-filter-query]");
        const yearSelect = filterRoot.querySelector("[data-filter-year]");
        const regionSelect = filterRoot.querySelector("[data-filter-region]");
        const cards = Array.from(filterRoot.querySelectorAll("[data-movie-card]"));
        const empty = filterRoot.querySelector("[data-filter-empty]");
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get("q");

        if (queryInput && initialQuery) {
            queryInput.value = initialQuery;
        }

        const applyFilter = function () {
            const query = queryInput ? queryInput.value.trim().toLowerCase() : "";
            const year = yearSelect ? yearSelect.value : "";
            const region = regionSelect ? regionSelect.value : "";
            let visible = 0;

            cards.forEach(function (card) {
                const haystack = [
                    card.getAttribute("data-title") || "",
                    card.getAttribute("data-genre") || "",
                    card.getAttribute("data-tags") || "",
                    card.getAttribute("data-summary") || ""
                ].join(" ").toLowerCase();

                const cardYear = card.getAttribute("data-year") || "";
                const cardRegion = card.getAttribute("data-region") || "";

                const matchedQuery = !query || haystack.indexOf(query) !== -1;
                const matchedYear = !year || cardYear === year;
                const matchedRegion = !region || cardRegion === region;

                if (matchedQuery && matchedYear && matchedRegion) {
                    card.style.display = "";
                    visible += 1;
                } else {
                    card.style.display = "none";
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        };

        [queryInput, yearSelect, regionSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilter);
                control.addEventListener("change", applyFilter);
            }
        });

        applyFilter();
    }

    const initPlayer = function (frame) {
        const video = frame.querySelector("video");
        const button = frame.querySelector("[data-player-button]");
        if (!video || !button) {
            return;
        }

        const source = button.getAttribute("data-stream");
        let loaded = false;
        let hlsInstance = null;

        const attach = function () {
            if (loaded) {
                return Promise.resolve();
            }

            loaded = true;

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else {
                video.src = source;
            }

            return Promise.resolve();
        };

        const play = function () {
            attach().then(function () {
                button.classList.add("is-hidden");
                const promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {
                        button.classList.remove("is-hidden");
                    });
                }
            }).catch(function () {
                button.classList.remove("is-hidden");
            });
        };

        button.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (!loaded || video.paused) {
                play();
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    document.querySelectorAll("[data-player]").forEach(initPlayer);
})();
