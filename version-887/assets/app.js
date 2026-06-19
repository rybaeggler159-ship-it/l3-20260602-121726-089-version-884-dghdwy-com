(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var isOpen = mobileNav.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', String(isOpen));
        });
    }

    document.querySelectorAll('[data-hero-carousel]').forEach(function (carousel) {
        var slides = Array.from(carousel.querySelectorAll('.hero-slide'));
        var dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var activeIndex = 0;
        var timer = null;

        function showSlide(index) {
            if (slides.length === 0) {
                return;
            }
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle('is-active', itemIndex === activeIndex);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle('is-active', itemIndex === activeIndex);
            });
        }

        function startTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 6200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(activeIndex - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(activeIndex + 1);
                startTimer();
            });
        }

        showSlide(0);
        startTimer();
    });

    document.querySelectorAll('.local-search').forEach(function (panel) {
        var input = panel.querySelector('[data-filter-input]');
        var typeSelect = panel.querySelector('[data-filter-type]');
        var scope = panel.closest('section') || document;
        var cards = Array.from(scope.querySelectorAll('.movie-card, .rank-item'));
        var empty = scope.querySelector('[data-empty-state]');

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function cardText(card) {
            return normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-genre'),
                card.textContent
            ].join(' '));
        }

        function applyFilter() {
            var query = normalize(input ? input.value : '');
            var type = normalize(typeSelect ? typeSelect.value : '');
            var visibleCount = 0;

            cards.forEach(function (card) {
                var text = cardText(card);
                var typeValue = normalize(card.getAttribute('data-type') || text);
                var okQuery = !query || text.indexOf(query) !== -1;
                var okType = !type || typeValue.indexOf(type) !== -1 || text.indexOf(type) !== -1;
                var isVisible = okQuery && okType;

                card.classList.toggle('is-filter-hidden', !isVisible);
                if (isVisible) {
                    visibleCount += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visibleCount === 0);
            }
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }
        if (typeSelect) {
            typeSelect.addEventListener('change', applyFilter);
        }
        applyFilter();
    });

    function attachPlayer(shell) {
        var video = shell.querySelector('video[data-hls]');
        var cover = shell.querySelector('.play-cover');
        var hlsInstance = null;
        var isReady = false;

        if (!video) {
            return;
        }

        function setReady() {
            if (isReady) {
                return;
            }
            var streamUrl = video.getAttribute('data-hls');
            if (!streamUrl) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
            isReady = true;
        }

        function startPlay() {
            setReady();
            if (cover) {
                cover.classList.add('is-hidden');
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    video.controls = true;
                });
            }
        }

        if (cover) {
            cover.addEventListener('click', startPlay);
        }

        video.addEventListener('click', function () {
            if (!isReady || video.paused) {
                startPlay();
            }
        });

        video.addEventListener('play', function () {
            if (cover) {
                cover.classList.add('is-hidden');
            }
        });

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    }

    document.querySelectorAll('.player-shell').forEach(attachPlayer);
})();
