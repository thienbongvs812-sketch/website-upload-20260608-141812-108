(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
    var prev = root.querySelector(".hero-prev");
    var next = root.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
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
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll(".js-filter-scope"));
    scopes.forEach(function (scope) {
      var section = scope.parentElement;
      if (!section) {
        return;
      }
      var input = scope.querySelector(".js-filter-keyword");
      var region = scope.querySelector(".js-filter-region");
      var type = scope.querySelector(".js-filter-type");
      var category = scope.querySelector(".js-filter-category");
      var empty = scope.querySelector(".filter-empty");
      var cards = Array.prototype.slice.call(section.querySelectorAll(".movie-card"));

      function value(node) {
        return node ? node.value.trim().toLowerCase() : "";
      }

      function apply() {
        var keyword = value(input);
        var regionValue = value(region);
        var typeValue = value(type);
        var categoryValue = value(category);
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = (card.textContent + " " + Object.values(card.dataset).join(" ")).toLowerCase();
          var ok = true;
          if (keyword && haystack.indexOf(keyword) === -1) {
            ok = false;
          }
          if (regionValue && (card.dataset.region || "").toLowerCase().indexOf(regionValue) === -1) {
            ok = false;
          }
          if (typeValue && (card.dataset.type || "").toLowerCase().indexOf(typeValue) === -1) {
            ok = false;
          }
          if (categoryValue && (card.dataset.category || "").toLowerCase() !== categoryValue) {
            ok = false;
          }
          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [input, region, type, category].forEach(function (node) {
        if (node) {
          node.addEventListener("input", apply);
          node.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  window.initMoviePlayer = function (videoId, overlayId, buttonId, source) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var button = document.getElementById(buttonId);
    var hls = null;
    var loaded = false;

    if (!video || !overlay || !source) {
      return;
    }

    function load() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            overlay.classList.remove("is-hidden");
          }
        });
      } else {
        video.src = source;
      }
      video.setAttribute("controls", "controls");
    }

    function play() {
      load();
      overlay.classList.add("is-hidden");
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          overlay.classList.remove("is-hidden");
        });
      }
    }

    function toggle() {
      if (video.paused) {
        play();
      } else {
        video.pause();
        overlay.classList.remove("is-hidden");
      }
    }

    overlay.addEventListener("click", function (event) {
      event.preventDefault();
      play();
    });
    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        play();
      });
    }
    video.addEventListener("click", function () {
      toggle();
    });
    video.addEventListener("play", function () {
      overlay.classList.add("is-hidden");
    });
    video.addEventListener("pause", function () {
      overlay.classList.remove("is-hidden");
    });
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
}());
