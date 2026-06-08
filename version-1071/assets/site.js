(function () {
    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    function setupMobileMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHeroSlider() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                restart();
            });
        });
        show(0);
        restart();
    }

    function setupFilters() {
        var area = document.querySelector('[data-filter-area]');
        if (!area) {
            return;
        }
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
        var keyword = area.querySelector('[data-filter-keyword]');
        var year = area.querySelector('[data-filter-year]');
        var type = area.querySelector('[data-filter-type]');
        var empty = document.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q') || '';
        if (keyword && q) {
            keyword.value = q;
        }

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function filter() {
            var key = normalize(keyword && keyword.value);
            var y = normalize(year && year.value);
            var t = normalize(type && type.value);
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.keywords
                ].join(' '));
                var matchKeyword = !key || haystack.indexOf(key) !== -1;
                var matchYear = !y || normalize(card.dataset.year) === y;
                var matchType = !t || normalize(card.dataset.type) === t;
                var show = matchKeyword && matchYear && matchType;
                card.hidden = !show;
                if (show) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        [keyword, year, type].forEach(function (el) {
            if (el) {
                el.addEventListener('input', filter);
                el.addEventListener('change', filter);
            }
        });
        filter();
    }

    function setupSearchForms() {
        var forms = Array.prototype.slice.call(document.querySelectorAll('[data-search-form]'));
        forms.forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    input && input.focus();
                }
            });
        });
    }

    function setupPlayer() {
        var video = document.querySelector('[data-player]');
        var button = document.querySelector('[data-player-button]');
        var box = document.querySelector('[data-player-box]');
        if (!video) {
            return;
        }
        var source = video.getAttribute('data-src');
        var attached = false;
        var hlsInstance = null;

        function attachSource() {
            if (attached || !source) {
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
            attached = true;
        }

        function playVideo() {
            attachSource();
            var promise = video.play();
            if (promise && typeof promise.then === 'function') {
                promise.then(function () {
                    if (box) {
                        box.classList.add('is-playing');
                    }
                }).catch(function () {
                    if (box) {
                        box.classList.remove('is-playing');
                    }
                });
            }
        }

        function toggleVideo() {
            if (video.paused) {
                playVideo();
            } else {
                video.pause();
                if (box) {
                    box.classList.remove('is-playing');
                }
            }
        }

        attachSource();
        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                playVideo();
            });
        }
        video.addEventListener('click', toggleVideo);
        video.addEventListener('play', function () {
            if (box) {
                box.classList.add('is-playing');
            }
        });
        video.addEventListener('pause', function () {
            if (box) {
                box.classList.remove('is-playing');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    ready(function () {
        setupMobileMenu();
        setupHeroSlider();
        setupFilters();
        setupSearchForms();
        setupPlayer();
    });
}());
