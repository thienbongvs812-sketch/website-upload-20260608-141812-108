document.addEventListener('DOMContentLoaded', function () {
    setupMobileNavigation();
    setupHeroCarousel();
    setupCardFiltering();
    setupSearchPage();
});

function setupMobileNavigation() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');

    if (!toggle || !nav) {
        return;
    }

    toggle.addEventListener('click', function () {
        nav.classList.toggle('open');
        var expanded = nav.classList.contains('open');
        toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });
}

function setupHeroCarousel() {
    var carousel = document.querySelector('[data-hero-carousel]');

    if (!carousel) {
        return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var prevButton = carousel.querySelector('[data-hero-prev]');
    var nextButton = carousel.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    if (slides.length === 0) {
        return;
    }

    function showSlide(index) {
        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === current);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === current);
        });
    }

    function startTimer() {
        stopTimer();
        timer = window.setInterval(function () {
            showSlide(current + 1);
        }, 5000);
    }

    function stopTimer() {
        if (timer) {
            window.clearInterval(timer);
        }
    }

    if (prevButton) {
        prevButton.addEventListener('click', function () {
            showSlide(current - 1);
            startTimer();
        });
    }

    if (nextButton) {
        nextButton.addEventListener('click', function () {
            showSlide(current + 1);
            startTimer();
        });
    }

    dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
            showSlide(dotIndex);
            startTimer();
        });
    });

    carousel.addEventListener('mouseenter', stopTimer);
    carousel.addEventListener('mouseleave', startTimer);

    showSlide(0);
    startTimer();
}

function setupCardFiltering() {
    var filterInputs = document.querySelectorAll('[data-card-filter]');

    filterInputs.forEach(function (input) {
        var targetSelector = input.getAttribute('data-filter-target') || '[data-card-list]';
        var target = document.querySelector(targetSelector);
        var empty = document.querySelector('[data-empty-state]');

        if (!target) {
            return;
        }

        var cards = Array.prototype.slice.call(target.querySelectorAll('[data-search-text]'));

        function applyFilter() {
            var keyword = input.value.trim().toLowerCase();
            var visibleCount = 0;

            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search-text') || '').toLowerCase();
                var matched = keyword === '' || text.indexOf(keyword) !== -1;
                card.style.display = matched ? '' : 'none';

                if (matched) {
                    visibleCount += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('show', visibleCount === 0);
            }
        }

        input.addEventListener('input', applyFilter);
        applyFilter();
    });
}

function setupSearchPage() {
    var page = document.querySelector('[data-search-page]');

    if (!page) {
        return;
    }

    var params = new URLSearchParams(window.location.search);
    var keyword = params.get('q') || '';
    var input = page.querySelector('[data-card-filter]');

    if (input && keyword) {
        input.value = keyword;
        input.dispatchEvent(new Event('input'));
    }
}
