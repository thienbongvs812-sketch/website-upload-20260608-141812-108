(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('img.cover-img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('is-missing');
      image.removeAttribute('alt');
    });
  });

  document.querySelectorAll('[data-site-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var value = input ? input.value.trim() : '';
      var target = './search.html';
      if (value) {
        target += '?q=' + encodeURIComponent(value);
      }
      window.location.href = target;
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var currentSlide = 0;
  var slideTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, itemIndex) {
      slide.classList.toggle('is-active', itemIndex === currentSlide);
    });
    dots.forEach(function (dot, itemIndex) {
      dot.classList.toggle('is-active', itemIndex === currentSlide);
    });
  }

  function startSlides() {
    if (slideTimer || slides.length < 2) {
      return;
    }
    slideTimer = window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  function restartSlides() {
    if (slideTimer) {
      window.clearInterval(slideTimer);
      slideTimer = null;
    }
    startSlides();
  }

  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(currentSlide - 1);
      restartSlides();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(currentSlide + 1);
      restartSlides();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-hero-dot') || 0));
      restartSlides();
    });
  });

  startSlides();

  var filterRoot = document.querySelector('[data-filter-root]');
  var cardList = document.querySelector('[data-card-list]');

  if (filterRoot && cardList) {
    var queryInput = filterRoot.querySelector('[data-filter-query]');
    var yearSelect = filterRoot.querySelector('[data-filter-year]');
    var typeSelect = filterRoot.querySelector('[data-filter-type]');
    var sortSelect = filterRoot.querySelector('[data-filter-sort]');
    var emptyState = document.querySelector('[data-empty-state]');
    var cards = Array.prototype.slice.call(cardList.querySelectorAll('[data-card]'));
    var parameters = new URLSearchParams(window.location.search);
    var initialQuery = parameters.get('q') || '';

    if (queryInput && initialQuery) {
      queryInput.value = initialQuery;
    }

    function normalize(value) {
      return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function cardText(card) {
      return normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' '));
    }

    function sortCards() {
      var mode = sortSelect ? sortSelect.value : 'default';
      var sorted = cards.slice();

      if (mode === 'year-desc') {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
        });
      } else if (mode === 'year-asc') {
        sorted.sort(function (a, b) {
          return Number(a.getAttribute('data-year') || 0) - Number(b.getAttribute('data-year') || 0);
        });
      } else if (mode === 'title') {
        sorted.sort(function (a, b) {
          return String(a.getAttribute('data-title') || '').localeCompare(String(b.getAttribute('data-title') || ''), 'zh-Hans-CN');
        });
      }

      sorted.forEach(function (card) {
        cardList.appendChild(card);
      });
    }

    function applyFilters() {
      var query = normalize(queryInput ? queryInput.value : '');
      var year = yearSelect ? yearSelect.value : '';
      var type = normalize(typeSelect ? typeSelect.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var textValue = cardText(card);
        var yearValue = card.getAttribute('data-year') || '';
        var typeValue = normalize(card.getAttribute('data-type'));
        var matchesQuery = !query || textValue.indexOf(query) !== -1;
        var matchesYear = !year || yearValue === year;
        var matchesType = !type || typeValue.indexOf(type) !== -1;
        var show = matchesQuery && matchesYear && matchesType;
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    [queryInput, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    if (sortSelect) {
      sortSelect.addEventListener('change', function () {
        sortCards();
        applyFilters();
      });
    }

    applyFilters();
  }

  var player = document.querySelector('[data-player]');

  if (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-player-button]');
    var stream = player.getAttribute('data-stream');
    var hlsInstance = null;

    function playVideo() {
      if (!video || !stream) {
        return;
      }

      player.classList.add('is-playing');

      if (!player.getAttribute('data-ready')) {
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.src = stream;
          video.addEventListener('loadedmetadata', function () {
            video.play().catch(function () {});
          }, { once: true });
          video.load();
        }
        player.setAttribute('data-ready', '1');
      } else {
        video.play().catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    player.addEventListener('click', function (event) {
      if (event.target === video && video.paused) {
        playVideo();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
}());
