(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;

    var showSlide = function (nextIndex) {
      activeIndex = nextIndex;
      slides.forEach(function (slide, index) {
        slide.classList.toggle('active', index === activeIndex);
      });
      dots.forEach(function (dot, index) {
        dot.classList.toggle('active', index === activeIndex);
      });
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide((activeIndex + 1) % slides.length);
      }, 5000);
    }
  }

  var inputs = Array.prototype.slice.call(document.querySelectorAll('.site-search'));

  inputs.forEach(function (input) {
    var section = input.closest('main') || document;
    var scopes = Array.prototype.slice.call(section.querySelectorAll('[data-search-scope]'));
    var cards = [];

    scopes.forEach(function (scope) {
      cards = cards.concat(Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]')));
    });

    input.addEventListener('input', function () {
      var value = input.value.trim().toLowerCase();
      var visible = 0;

      cards.forEach(function (card) {
        var keywords = (card.getAttribute('data-keywords') || card.textContent || '').toLowerCase();
        var matched = !value || keywords.indexOf(value) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      Array.prototype.slice.call(section.querySelectorAll('[data-empty-state]')).forEach(function (state) {
        state.classList.toggle('show', visible === 0 && value.length > 0);
      });
    });
  });
})();

function initMoviePlayer(videoId, buttonId, source) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var hlsInstance = null;
  var ready = false;

  if (!video || !button || !source) {
    return;
  }

  var attachSource = function () {
    if (ready) {
      return Promise.resolve();
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      return Promise.resolve();
    }

    video.src = source;
    return Promise.resolve();
  };

  var start = function () {
    attachSource().then(function () {
      button.classList.add('hidden');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          button.classList.remove('hidden');
        });
      }
    });
  };

  button.addEventListener('click', start);

  video.addEventListener('click', function () {
    if (!ready || video.paused) {
      start();
    }
  });

  video.addEventListener('play', function () {
    button.classList.add('hidden');
  });

  video.addEventListener('pause', function () {
    if (video.currentTime === 0 || video.ended) {
      button.classList.remove('hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
