const nav = document.querySelector('[data-nav]');
const toggle = document.querySelector('[data-menu-toggle]');

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    nav.classList.toggle('is-open');
  });
}

const searchForms = document.querySelectorAll('[data-site-search]');

searchForms.forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = form.querySelector('input');
    const value = input ? input.value.trim() : '';
    if (value) {
      window.location.href = `./search.html?q=${encodeURIComponent(value)}`;
    }
  });
});

const heroSlides = Array.from(document.querySelectorAll('[data-hero-slide]'));
const heroDots = Array.from(document.querySelectorAll('[data-hero-dot]'));
let heroIndex = 0;
let heroTimer = null;

function showHeroSlide(index) {
  if (!heroSlides.length) {
    return;
  }
  heroIndex = (index + heroSlides.length) % heroSlides.length;
  heroSlides.forEach((slide, i) => {
    slide.classList.toggle('is-active', i === heroIndex);
  });
  heroDots.forEach((dot, i) => {
    dot.classList.toggle('is-active', i === heroIndex);
  });
}

function startHeroTimer() {
  if (heroTimer || heroSlides.length < 2) {
    return;
  }
  heroTimer = window.setInterval(() => {
    showHeroSlide(heroIndex + 1);
  }, 5200);
}

heroDots.forEach((dot, index) => {
  dot.addEventListener('click', () => {
    showHeroSlide(index);
    window.clearInterval(heroTimer);
    heroTimer = null;
    startHeroTimer();
  });
});

showHeroSlide(0);
startHeroTimer();

const filterInput = document.querySelector('[data-filter-input]');
const filterSelect = document.querySelector('[data-filter-year]');
const filterCards = Array.from(document.querySelectorAll('[data-filter-card]'));

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function applyListFilter() {
  const keyword = normalizeText(filterInput ? filterInput.value : '');
  const year = filterSelect ? filterSelect.value : '';
  filterCards.forEach((card) => {
    const haystack = normalizeText(card.dataset.search);
    const cardYear = card.dataset.year || '';
    const keywordMatch = !keyword || haystack.includes(keyword);
    const yearMatch = !year || cardYear === year;
    card.classList.toggle('hidden-by-filter', !(keywordMatch && yearMatch));
  });
}

if (filterInput || filterSelect) {
  const params = new URLSearchParams(window.location.search);
  const query = params.get('q');
  if (query && filterInput) {
    filterInput.value = query;
  }
  if (filterInput) {
    filterInput.addEventListener('input', applyListFilter);
  }
  if (filterSelect) {
    filterSelect.addEventListener('change', applyListFilter);
  }
  applyListFilter();
}
