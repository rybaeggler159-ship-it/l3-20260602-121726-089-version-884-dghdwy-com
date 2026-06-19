(function () {
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".site-nav");

  if (menuButton && nav) {
    menuButton.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  const dots = Array.from(document.querySelectorAll(".hero-dot"));
  let activeIndex = 0;
  let timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === activeIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === activeIndex);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }

    timer = window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5000);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);

      if (timer) {
        window.clearInterval(timer);
        startHero();
      }
    });
  });

  showSlide(0);
  startHero();

  const searchInputs = Array.from(document.querySelectorAll(".movie-search-input"));
  const filterSelects = Array.from(document.querySelectorAll(".movie-filter-select"));
  const cards = Array.from(document.querySelectorAll(".movie-card"));

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function currentQuery() {
    return normalize(searchInputs.map(function (input) {
      return input.value;
    }).join(" "));
  }

  function currentFilter() {
    const selected = filterSelects.map(function (select) {
      return select.value;
    }).filter(Boolean);

    return normalize(selected[0] || "");
  }

  function applyFilters() {
    const query = currentQuery();
    const typeFilter = currentFilter();

    cards.forEach(function (card) {
      const haystack = normalize([
        card.dataset.title,
        card.dataset.year,
        card.dataset.region,
        card.dataset.type,
        card.dataset.genre,
        card.dataset.tags
      ].join(" "));

      const queryMatch = !query || haystack.indexOf(query) !== -1;
      const filterMatch = !typeFilter || haystack.indexOf(typeFilter) !== -1;

      card.classList.toggle("is-hidden-by-filter", !(queryMatch && filterMatch));
    });
  }

  searchInputs.forEach(function (input) {
    input.addEventListener("input", applyFilters);
  });

  filterSelects.forEach(function (select) {
    select.addEventListener("change", applyFilters);
  });
})();

function initMoviePlayer(source) {
  const video = document.getElementById("playerVideo");
  const layer = document.getElementById("playerLayer");
  const button = document.getElementById("playerButton");
  let loaded = false;
  let hls = null;

  if (!video || !layer || !button || !source) {
    return;
  }

  function bindSource() {
    if (loaded) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls();
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }

    loaded = true;
  }

  function playVideo() {
    bindSource();
    layer.classList.add("is-hidden");
    video.controls = true;

    const attempt = video.play();

    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(function () {});
    }
  }

  button.addEventListener("click", playVideo);
  layer.addEventListener("click", playVideo);

  video.addEventListener("click", function () {
    if (!loaded) {
      playVideo();
    }
  });

  window.addEventListener("pagehide", function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
