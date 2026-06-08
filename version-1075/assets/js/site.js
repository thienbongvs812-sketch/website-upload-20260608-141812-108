(function () {
  function onReady(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var panel = document.querySelector('[data-nav-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initImages() {
    document.querySelectorAll('img.cover-image').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-hidden');
        if (image.parentElement) {
          image.parentElement.classList.add('empty-image');
        }
      });
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var nextIndex = Number(dot.getAttribute('data-hero-dot') || 0);
        show(nextIndex);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function initFilters() {
    document.querySelectorAll('[data-filter-root]').forEach(function (root) {
      var search = root.querySelector('[data-filter-search]');
      var year = root.querySelector('[data-filter-year]');
      var type = root.querySelector('[data-filter-type]');
      var scope = root.parentElement || document;
      var items = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-item]'));

      if (root.hasAttribute('data-query-page') && search) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query) {
          search.value = query;
        }
      }

      function apply() {
        var queryValue = search ? search.value.trim().toLowerCase() : '';
        var yearValue = year ? year.value : '';
        var typeValue = type ? type.value : '';
        items.forEach(function (item) {
          var haystack = item.getAttribute('data-search') || '';
          var itemYear = item.getAttribute('data-year') || '';
          var itemType = item.getAttribute('data-type') || '';
          var visible = true;
          if (queryValue && haystack.indexOf(queryValue) === -1) {
            visible = false;
          }
          if (yearValue && itemYear !== yearValue) {
            visible = false;
          }
          if (typeValue && itemType !== typeValue) {
            visible = false;
          }
          item.classList.toggle('is-filtered', !visible);
        });
      }

      [search, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  function initPlayer() {
    var video = document.querySelector('video[data-stream]');
    var stage = document.querySelector('[data-player-stage]');
    var start = document.querySelector('[data-player-start]');
    if (!video) {
      return;
    }
    var stream = video.getAttribute('data-stream');
    var attached = false;
    var hlsInstance = null;

    function attach() {
      if (attached || !stream) {
        return;
      }
      var HlsLib = window.Hls;
      if (HlsLib && HlsLib.isSupported()) {
        hlsInstance = new HlsLib({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else {
        video.src = stream;
      }
      attached = true;
    }

    function play() {
      attach();
      var playResult = video.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {});
      }
      if (stage) {
        stage.classList.add('is-playing');
      }
    }

    if (start) {
      start.addEventListener('click', play);
    }
    if (stage) {
      stage.addEventListener('click', function (event) {
        if (event.target === stage) {
          play();
        }
      });
    }
    video.addEventListener('play', function () {
      if (stage) {
        stage.classList.add('is-playing');
      }
    });
    video.addEventListener('pause', function () {
      if (stage && video.currentTime === 0) {
        stage.classList.remove('is-playing');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
    attach();
  }

  onReady(function () {
    initMenu();
    initImages();
    initHero();
    initFilters();
    initPlayer();
  });
})();
