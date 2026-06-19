(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function bindMenu() {
    var button = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function bindFilters() {
    var roots = document.querySelectorAll("[data-filter-root]");
    roots.forEach(function (root) {
      var input = root.querySelector(".local-search");
      var year = root.querySelector("[data-year-filter]");
      var type = root.querySelector("[data-type-filter]");
      var cards = Array.prototype.slice.call(root.querySelectorAll("[data-card]"));

      function apply() {
        var q = input ? input.value.trim().toLowerCase() : "";
        var y = year ? year.value : "";
        var t = type ? type.value : "";
        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-region") || "",
            card.getAttribute("data-tags") || "",
            card.getAttribute("data-type") || ""
          ].join(" ").toLowerCase();
          var passText = !q || text.indexOf(q) !== -1;
          var passYear = !y || card.getAttribute("data-year") === y;
          var passType = !t || card.getAttribute("data-type") === t;
          card.classList.toggle("hidden-by-filter", !(passText && passYear && passType));
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (year) {
        year.addEventListener("change", apply);
      }
      if (type) {
        type.addEventListener("change", apply);
      }

      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q && input) {
        input.value = q;
        apply();
      }
    });
  }

  function bindHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var title = hero.querySelector("[data-hero-title]");
    var desc = hero.querySelector("[data-hero-desc]");
    var meta = hero.querySelector("[data-hero-meta]");
    var link = hero.querySelector("[data-hero-link]");
    var image = hero.querySelector("[data-hero-image]");
    var buttons = Array.prototype.slice.call(hero.querySelectorAll(".hero-mini"));
    var current = 0;

    function render(index) {
      var btn = buttons[index];
      if (!btn) {
        return;
      }
      current = index;
      buttons.forEach(function (item, i) {
        item.classList.toggle("active", i === index);
      });
      title.textContent = btn.getAttribute("data-title") || "";
      desc.textContent = btn.getAttribute("data-desc") || "";
      meta.innerHTML = "";
      [btn.getAttribute("data-year"), btn.getAttribute("data-region"), btn.getAttribute("data-genre")].forEach(function (value) {
        if (value) {
          var span = document.createElement("span");
          span.textContent = value;
          meta.appendChild(span);
        }
      });
      link.setAttribute("href", btn.getAttribute("data-link") || "./index.html");
      image.setAttribute("src", btn.getAttribute("data-image") || "./1.jpg");
      image.setAttribute("alt", btn.getAttribute("data-title") || "");
    }

    buttons.forEach(function (btn, index) {
      btn.addEventListener("click", function () {
        render(index);
      });
    });

    if (buttons.length > 1) {
      window.setInterval(function () {
        render((current + 1) % buttons.length);
      }, 5200);
    }
  }

  window.initMoviePlayer = function (source) {
    var video = document.getElementById("movie-player");
    var cover = document.getElementById("player-start");
    if (!video || !source) {
      return;
    }

    function attachSource() {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function start() {
      attachSource();
      if (cover) {
        cover.classList.add("hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
  };

  ready(function () {
    bindMenu();
    bindFilters();
    bindHero();
  });
})();
