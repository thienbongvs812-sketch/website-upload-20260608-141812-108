(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-local-filter]')).forEach(function (form) {
    var input = form.querySelector('[data-filter-input]');
    var grid = document.querySelector('[data-filter-grid]');

    if (!input || !grid) {
      return;
    }

    input.addEventListener('input', function () {
      var query = input.value.trim().toLowerCase();
      var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-meta') || '')).toLowerCase();
        var matched = !query || haystack.indexOf(query) !== -1;
        card.classList.toggle('is-filtered-out', !matched);
        if (matched) {
          visible += 1;
        }
      });

      var empty = grid.querySelector('[data-empty-state]');

      if (!visible) {
        if (!empty) {
          empty = document.createElement('div');
          empty.className = 'empty-state';
          empty.setAttribute('data-empty-state', '');
          empty.textContent = '没有匹配的影片，换个关键词试试';
          grid.appendChild(empty);
        }
      } else if (empty) {
        empty.remove();
      }
    });
  });

  Array.prototype.slice.call(document.querySelectorAll('[data-video-url]')).forEach(function (panel) {
    var video = panel.querySelector('video');
    var cover = panel.querySelector('.player-cover');
    var videoUrl = panel.getAttribute('data-video-url');
    var ready = false;
    var hlsInstance = null;

    if (!video || !videoUrl) {
      return;
    }

    function prepareVideo() {
      if (ready) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hlsInstance.loadSource(videoUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = videoUrl;
      }

      ready = true;
    }

    function playVideo() {
      prepareVideo();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      video.controls = true;
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
      if (!ready || video.paused) {
        playVideo();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });

  var searchPage = document.querySelector('[data-search-page]');

  if (searchPage && window.MovieSearchIndex) {
    var params = new URLSearchParams(window.location.search);
    var queryValue = (params.get('q') || '').trim();
    var searchInput = document.querySelector('[data-search-input]');
    var searchTitle = document.querySelector('[data-search-title]');
    var results = document.querySelector('[data-search-results]');

    if (searchInput) {
      searchInput.value = queryValue;
    }

    function cardHtml(movie) {
      var tags = movie.tags.slice(0, 4).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return '<article class="movie-card">' +
        '<a class="poster-link" href="' + movie.url + '" aria-label="' + escapeHtml(movie.title) + '">' +
          '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
          '<span class="poster-year">' + escapeHtml(movie.year) + '</span>' +
        '</a>' +
        '<div class="movie-card-body">' +
          '<div class="movie-tags">' + tags + '</div>' +
          '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>' +
          '<p>' + escapeHtml(movie.oneLine) + '</p>' +
          '<div class="movie-card-foot">' +
            '<span>' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</span>' +
            '<a href="' + movie.url + '">立即观看</a>' +
          '</div>' +
        '</div>' +
      '</article>';
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"]/g, function (character) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;'
        }[character];
      });
    }

    function performSearch() {
      var query = (searchInput ? searchInput.value : queryValue).trim().toLowerCase();
      var list = window.MovieSearchIndex.filter(function (movie) {
        var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine, movie.tags.join(' ')].join(' ').toLowerCase();
        return !query || haystack.indexOf(query) !== -1;
      }).slice(0, 120);

      if (searchTitle) {
        searchTitle.textContent = query ? '搜索结果' : '推荐浏览';
      }

      if (!results) {
        return;
      }

      if (!list.length) {
        results.innerHTML = '<div class="empty-state">没有匹配的影片，换个关键词试试</div>';
        return;
      }

      results.innerHTML = list.map(cardHtml).join('');
    }

    if (searchInput) {
      searchInput.addEventListener('input', performSearch);
    }

    performSearch();
  }
})();
