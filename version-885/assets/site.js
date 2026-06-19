(() => {
    const navToggle = document.querySelector("[data-nav-toggle]");
    const navMenu = document.querySelector("[data-nav-menu]");
    if (navToggle && navMenu) {
        navToggle.addEventListener("click", () => {
            navMenu.classList.toggle("is-open");
        });
    }

    const visual = document.querySelector("[data-visual]");
    if (visual) {
        const slides = Array.from(visual.querySelectorAll("[data-visual-slide]"));
        const dots = Array.from(visual.querySelectorAll("[data-visual-dot]"));
        let index = 0;
        const show = (next) => {
            index = next;
            slides.forEach((slide, itemIndex) => {
                slide.classList.toggle("is-active", itemIndex === index);
            });
            dots.forEach((dot, itemIndex) => {
                dot.classList.toggle("is-active", itemIndex === index);
            });
        };
        dots.forEach((dot, itemIndex) => {
            dot.addEventListener("click", () => show(itemIndex));
        });
        if (slides.length > 1) {
            setInterval(() => {
                show((index + 1) % slides.length);
            }, 5000);
        }
    }

    const searchInput = document.querySelector("[data-search-input]");
    const searchClear = document.querySelector("[data-search-clear]");
    const searchScope = document.querySelector("[data-search-scope]");
    if (searchInput && searchScope) {
        const cards = Array.from(searchScope.querySelectorAll("[data-card]"));
        const filter = () => {
            const value = searchInput.value.trim().toLowerCase();
            cards.forEach((card) => {
                const haystack = [
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.genre,
                    card.dataset.year,
                    card.textContent
                ].join(" ").toLowerCase();
                card.classList.toggle("is-hidden-by-search", value && !haystack.includes(value));
            });
        };
        searchInput.addEventListener("input", filter);
        if (searchClear) {
            searchClear.addEventListener("click", () => {
                searchInput.value = "";
                filter();
                searchInput.focus();
            });
        }
    }
})();
