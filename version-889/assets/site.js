(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function initHeader() {
    var header = document.querySelector('[data-site-header]');
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    function onScroll() {
      if (!header) {
        return;
      }
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    }

    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        panel.classList.toggle('is-open');
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function initHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function setSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        setSlide(index + 1);
      }, 5600);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        setSlide(i);
        play();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        setSlide(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        setSlide(index + 1);
        play();
      });
    }

    slider.addEventListener('mouseenter', function () {
      clearInterval(timer);
    });

    slider.addEventListener('mouseleave', play);
    setSlide(0);
    play();
  }

  function initLocalFilters() {
    var panel = document.querySelector('[data-local-filter]');
    var list = document.querySelector('[data-filter-list]');
    if (!panel || !list) {
      return;
    }

    var input = panel.querySelector('[data-filter-input]');
    var year = panel.querySelector('[data-filter-year]');
    var region = panel.querySelector('[data-filter-region]');
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
    var empty = document.querySelector('[data-filter-empty]');

    function apply() {
      var q = input ? input.value.trim().toLowerCase() : '';
      var y = year ? year.value : '';
      var r = region ? region.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var title = (card.getAttribute('data-title') || '').toLowerCase();
        var genre = (card.getAttribute('data-genre') || '').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var cardRegion = card.getAttribute('data-region') || '';
        var ok = true;

        if (q && title.indexOf(q) === -1 && genre.indexOf(q) === -1) {
          ok = false;
        }
        if (y && cardYear !== y) {
          ok = false;
        }
        if (r && cardRegion !== r) {
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

    [input, year, region].forEach(function (el) {
      if (el) {
        el.addEventListener('input', apply);
        el.addEventListener('change', apply);
      }
    });

    apply();
  }

  function renderSearchCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '<article class="movie-card">' +
      '<a class="poster-link" href="' + movie.url + '" aria-label="' + escapeHtml(movie.title) + '">' +
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<span class="poster-shade"></span>' +
      '<span class="type-pill">' + escapeHtml(movie.type) + '</span>' +
      '<span class="year-pill">' + escapeHtml(movie.year) + '</span>' +
      '</a>' +
      '<div class="movie-card-body">' +
      '<a class="movie-title" href="' + movie.url + '">' + escapeHtml(movie.title) + '</a>' +
      '<p class="movie-line">' + escapeHtml(movie.oneLine || '') + '</p>' +
      '<div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>' +
      '<div class="tag-row">' + tags + '</div>' +
      '</div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initSearchPage() {
    var box = document.querySelector('[data-search-page-input]');
    var result = document.querySelector('[data-search-results]');
    var empty = document.querySelector('[data-search-empty]');
    if (!box || !result || !window.MovieSearchData) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    box.value = query;

    function apply() {
      var q = box.value.trim().toLowerCase();
      if (!q) {
        result.innerHTML = '';
        if (empty) {
          empty.textContent = '输入关键词即可搜索影片';
          empty.classList.add('is-visible');
        }
        return;
      }

      var matches = window.MovieSearchData.filter(function (movie) {
        var haystack = [movie.title, movie.region, movie.type, movie.genre, movie.category, movie.year].concat(movie.tags || []).join(' ').toLowerCase();
        return haystack.indexOf(q) !== -1;
      }).slice(0, 80);

      result.innerHTML = matches.map(renderSearchCard).join('');
      if (empty) {
        empty.textContent = '没有匹配内容';
        empty.classList.toggle('is-visible', matches.length === 0);
      }
    }

    box.addEventListener('input', apply);
    apply();
  }

  function initPlayer(source) {
    ready(function () {
      var video = document.getElementById('movie-player');
      var cover = document.querySelector('[data-play-cover]');
      var button = document.querySelector('[data-play-button]');
      var message = document.querySelector('[data-player-message]');
      var hls = null;

      if (!video || !source) {
        return;
      }

      function showMessage(text) {
        if (message) {
          message.textContent = text || '';
        }
      }

      function attach() {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              showMessage('播放暂时无法加载');
            }
          });
          return;
        }

        showMessage('播放暂时无法加载');
      }

      function start() {
        if (cover) {
          cover.classList.add('is-hidden');
        }
        var play = video.play();
        if (play && play.catch) {
          play.catch(function () {
            showMessage('点击视频继续播放');
          });
        }
      }

      attach();

      if (button) {
        button.addEventListener('click', start);
      }

      if (cover) {
        cover.addEventListener('click', function (event) {
          if (event.target === cover || event.target.tagName === 'IMG') {
            start();
          }
        });
      }

      video.addEventListener('play', function () {
        if (cover) {
          cover.classList.add('is-hidden');
        }
        showMessage('');
      });

      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    initHeader();
    initHero();
    initLocalFilters();
    initSearchPage();
  });

  window.MovieSite = {
    initPlayer: initPlayer
  };
})();
