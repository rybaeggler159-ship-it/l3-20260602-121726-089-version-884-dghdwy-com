(() => {
  const navButton = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-main-nav]');

  if (navButton && nav) {
    navButton.addEventListener('click', () => {
      nav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let activeIndex = 0;

    const showSlide = (index) => {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, current) => {
        slide.classList.toggle('is-active', current === activeIndex);
      });
      dots.forEach((dot, current) => {
        dot.classList.toggle('is-active', current === activeIndex);
      });
    };

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        showSlide(Number(dot.dataset.heroDot || 0));
      });
    });

    if (slides.length > 1) {
      setInterval(() => {
        showSlide(activeIndex + 1);
      }, 5200);
    }
  }
})();
