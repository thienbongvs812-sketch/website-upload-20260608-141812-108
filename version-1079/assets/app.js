(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var opened = mobileNav.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });
    }

    var hero = document.querySelector('[data-hero-carousel]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var prev = hero.querySelector('.hero-prev');
        var next = hero.querySelector('.hero-next');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, idx) {
                slide.classList.toggle('is-active', idx === current);
            });
            dots.forEach(function (dot, idx) {
                dot.classList.toggle('is-active', idx === current);
            });
        }

        function play() {
            stop();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-index') || 0));
                play();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                play();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                play();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', play);
        play();
    }

    var input = document.getElementById('movieSearchInput');
    var grid = document.getElementById('searchMovieGrid');
    var empty = document.getElementById('searchEmpty');
    var chips = Array.prototype.slice.call(document.querySelectorAll('[data-search-chip]'));

    if (input && grid) {
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.search-card'));

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function filterCards(value) {
            var keyword = normalize(value);
            var matched = 0;

            cards.forEach(function (card) {
                var key = normalize(card.getAttribute('data-key'));
                var title = normalize(card.getAttribute('data-title'));
                var visible = !keyword || key.indexOf(keyword) !== -1 || title.indexOf(keyword) !== -1;
                card.hidden = !visible;
                if (visible) {
                    matched += 1;
                }
            });

            if (empty) {
                empty.hidden = matched !== 0;
            }
        }

        input.addEventListener('input', function () {
            filterCards(input.value);
        });

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                input.value = chip.getAttribute('data-search-chip') || '';
                filterCards(input.value);
                input.focus();
            });
        });
    }
})();
