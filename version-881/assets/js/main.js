(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var toggle = qs('[data-menu-toggle]');
  var nav = qs('[data-mobile-nav]');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  var carousel = qs('[data-hero-carousel]');
  if (carousel) {
    var slides = qsa('[data-hero-slide]', carousel);
    var dots = qsa('[data-hero-dot]', carousel);
    var current = 0;
    var show = function (next) {
      current = (next + slides.length) % slides.length;
      slides.forEach(function (slide, index) {
        slide.classList.toggle('active', index === current);
      });
      dots.forEach(function (dot, index) {
        dot.classList.toggle('active', index === current);
      });
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  }

  var filterInput = qs('[data-filter-input]');
  var yearFilter = qs('[data-year-filter]');
  var typeFilter = qs('[data-type-filter]');
  var cards = qsa('.filter-card');
  var queryInput = qs('[data-query-input]');
  if (queryInput) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
      queryInput.value = q;
    }
  }
  function applyFilters() {
    var text = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var year = yearFilter ? yearFilter.value : '';
    var type = typeFilter ? typeFilter.value : '';
    cards.forEach(function (card) {
      var haystack = (card.getAttribute('data-search') || '').toLowerCase();
      var cardYear = card.getAttribute('data-year') || '';
      var cardType = card.getAttribute('data-type') || '';
      var matched = (!text || haystack.indexOf(text) !== -1) && (!year || cardYear === year) && (!type || cardType === type);
      card.classList.toggle('is-hidden', !matched);
    });
  }
  [filterInput, yearFilter, typeFilter].forEach(function (el) {
    if (el) {
      el.addEventListener('input', applyFilters);
      el.addEventListener('change', applyFilters);
    }
  });
  if (filterInput || yearFilter || typeFilter) {
    applyFilters();
  }

  var video = qs('#player');
  var playButton = qs('[data-play-button]');
  function playVideo() {
    if (!video) {
      return;
    }
    var src = video.getAttribute('data-src');
    if (!src) {
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      if (!video._hlsInstance) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        video._hlsInstance = hls;
      }
      video.play().catch(function () {});
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.getAttribute('src')) {
        video.setAttribute('src', src);
      }
      video.play().catch(function () {});
    } else {
      if (!video.getAttribute('src')) {
        video.setAttribute('src', src);
      }
      video.play().catch(function () {});
    }
    if (playButton) {
      playButton.classList.add('hidden');
    }
  }
  if (playButton) {
    playButton.addEventListener('click', playVideo);
  }
  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });
    video.addEventListener('play', function () {
      if (playButton) {
        playButton.classList.add('hidden');
      }
    });
  }
})();
