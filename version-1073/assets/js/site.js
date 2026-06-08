(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var image = hero.querySelector('[data-hero-image]');
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });

      if (image) {
        image.src = slides[index].getAttribute('data-image');
        image.alt = slides[index].getAttribute('data-title') || '';
      }
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
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    var filterRoot = document.querySelector('[data-filter-root]');
    if (!filterRoot) {
      return;
    }

    var search = filterRoot.querySelector('[data-filter-search]');
    var year = filterRoot.querySelector('[data-filter-year]');
    var type = filterRoot.querySelector('[data-filter-type]');
    var region = filterRoot.querySelector('[data-filter-region]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title].movie-card'));
    var empty = document.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q && search) {
      search.value = q;
    }

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function apply() {
      var query = normalize(search && search.value);
      var selectedYear = year && year.value;
      var selectedType = type && type.value;
      var selectedRegion = region && region.value;
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-category')
        ].join(' '));

        var ok = true;

        if (query && haystack.indexOf(query) === -1) {
          ok = false;
        }

        if (selectedYear && card.getAttribute('data-year') !== selectedYear) {
          ok = false;
        }

        if (selectedType && card.getAttribute('data-type') !== selectedType) {
          ok = false;
        }

        if (selectedRegion && card.getAttribute('data-region') !== selectedRegion) {
          ok = false;
        }

        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [search, year, type, region].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (wrap) {
      var video = wrap.querySelector('video');
      var button = wrap.querySelector('[data-play-button]');
      var source = video && video.getAttribute('data-source');
      var loaded = false;
      var hls = null;

      function load() {
        if (!video || !source || loaded) {
          return;
        }

        loaded = true;

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else {
          video.src = source;
        }
      }

      function play() {
        load();
        if (!video) {
          return;
        }

        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener('click', function () {
          play();
        });
      }

      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) {
            play();
          } else {
            video.pause();
          }
        });

        video.addEventListener('play', function () {
          if (button) {
            button.classList.add('is-hidden');
          }
        });

        video.addEventListener('pause', function () {
          if (button) {
            button.classList.remove('is-hidden');
          }
        });

        video.addEventListener('loadedmetadata', function () {
          if (button && !video.paused) {
            button.classList.add('is-hidden');
          }
        });
      }

      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
