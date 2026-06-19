(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMobileMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHeroCarousel() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startAutoPlay() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var next = Number(dot.getAttribute('data-hero-dot')) || 0;
        showSlide(next);
        startAutoPlay();
      });
    });

    if (slides.length > 1) {
      startAutoPlay();
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

    panels.forEach(function (panel) {
      var root = panel.closest('section') || document;
      var cards = Array.prototype.slice.call(root.querySelectorAll('[data-movie-card]'));
      var input = panel.querySelector('[data-search-input]');
      var regionSelect = panel.querySelector('[data-region-filter]');
      var yearSelect = panel.querySelector('[data-year-filter]');
      var summary = panel.querySelector('[data-filter-summary]');

      function applyFilters() {
        var keyword = normalize(input && input.value);
        var region = regionSelect ? regionSelect.value : '全部';
        var year = yearSelect ? yearSelect.value : '全部';
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
          ].join(' '));
          var cardRegion = card.getAttribute('data-region') || '';
          var cardYear = card.getAttribute('data-year') || '';
          var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchesRegion = region === '全部' || cardRegion.indexOf(region) !== -1;
          var matchesYear = year === '全部' || cardYear === year;
          var matches = matchesKeyword && matchesRegion && matchesYear;

          card.classList.toggle('is-hidden-by-filter', !matches);

          if (matches) {
            visible += 1;
          }
        });

        if (summary) {
          summary.textContent = '当前显示 ' + visible + ' 部 / 共 ' + cards.length + ' 部';
        }
      }

      if (input) {
        input.addEventListener('input', applyFilters);
      }

      if (regionSelect) {
        regionSelect.addEventListener('change', applyFilters);
      }

      if (yearSelect) {
        yearSelect.addEventListener('change', applyFilters);
      }

      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');

      if (q && input) {
        input.value = q;
      }

      applyFilters();
    });
  }

  function loadHlsLibrary(callback) {
    if (window.Hls) {
      callback();
      return;
    }

    var existing = document.querySelector('script[data-hls-loader]');

    if (existing) {
      existing.addEventListener('load', callback, { once: true });
      return;
    }

    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js';
    script.async = true;
    script.setAttribute('data-hls-loader', 'true');
    script.addEventListener('load', callback, { once: true });
    document.head.appendChild(script);
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (player) {
      var source = player.getAttribute('data-src');
      var video = player.querySelector('video');
      var button = player.querySelector('[data-play-button]');
      var status = player.querySelector('[data-player-status]');
      var hlsInstance = null;
      var loaded = false;

      if (!source || !video || !button) {
        return;
      }

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function playVideo() {
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            setStatus('浏览器阻止了自动播放，请再次点击播放按钮。');
          });
        }
      }

      function attachAndPlay() {
        if (loaded) {
          playVideo();
          return;
        }

        loaded = true;
        button.classList.add('is-hidden');
        setStatus('正在初始化高清播放源...');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', playVideo, { once: true });
          setStatus('已使用浏览器原生 HLS 播放。');
          return;
        }

        loadHlsLibrary(function () {
          if (!window.Hls || !window.Hls.isSupported()) {
            video.src = source;
            setStatus('已尝试直接加载播放源。');
            playVideo();
            return;
          }

          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });

          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus('播放源加载完成。');
            playVideo();
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (data && data.fatal) {
              setStatus('播放源加载失败，请刷新页面后重试。');
            }
          });
        });
      }

      button.addEventListener('click', function (event) {
        event.preventDefault();
        attachAndPlay();
      });

      video.addEventListener('play', function () {
        button.classList.add('is-hidden');
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    initMobileMenu();
    initHeroCarousel();
    initFilters();
    initPlayers();
  });
})();
