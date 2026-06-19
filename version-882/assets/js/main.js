
(function () {
    const menuButton = document.querySelector(".menu-toggle");
    const mobileNav = document.querySelector(".mobile-nav");
    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("open");
        });
    }

    const slides = Array.from(document.querySelectorAll(".hero-slide"));
    const dots = Array.from(document.querySelectorAll(".hero-dots button"));
    let current = 0;
    function showSlide(index) {
        if (!slides.length) return;
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle("is-active", i === current);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle("is-active", i === current);
        });
    }
    dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
            showSlide(i);
        });
    });
    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    const filterForm = document.querySelector(".filter-bar");
    const movieCards = Array.from(document.querySelectorAll(".movie-card"));
    const emptyState = document.querySelector(".empty-state");
    if (filterForm && movieCards.length) {
        const keywordInput = filterForm.querySelector("input[name='keyword']");
        const yearSelect = filterForm.querySelector("select[name='year']");
        const kindSelect = filterForm.querySelector("select[name='kind']");
        function applyFilter() {
            const keyword = (keywordInput ? keywordInput.value : "").trim().toLowerCase();
            const year = yearSelect ? yearSelect.value : "";
            const kind = kindSelect ? kindSelect.value : "";
            let visible = 0;
            movieCards.forEach(function (card) {
                const text = [card.dataset.title, card.dataset.region, card.dataset.kind, card.dataset.genre].join(" ").toLowerCase();
                const yearOk = !year || card.dataset.year === year;
                const kindOk = !kind || card.dataset.kind.indexOf(kind) !== -1;
                const keywordOk = !keyword || text.indexOf(keyword) !== -1;
                const matched = yearOk && kindOk && keywordOk;
                card.style.display = matched ? "" : "none";
                if (matched) visible += 1;
            });
            if (emptyState) {
                emptyState.classList.toggle("show", visible === 0);
            }
        }
        filterForm.addEventListener("submit", function (event) {
            event.preventDefault();
            applyFilter();
        });
        [keywordInput, yearSelect, kindSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilter);
                control.addEventListener("change", applyFilter);
            }
        });
    }

    const homeSearch = document.querySelector(".search-card");
    if (homeSearch) {
        homeSearch.addEventListener("submit", function (event) {
            event.preventDefault();
            const input = homeSearch.querySelector("input");
            const q = input ? encodeURIComponent(input.value.trim()) : "";
            window.location.href = q ? "./search.html?q=" + q : "./search.html";
        });
    }

    const searchInput = document.querySelector(".filter-bar input[name='keyword']");
    if (searchInput) {
        const params = new URLSearchParams(window.location.search);
        const q = params.get("q");
        if (q) {
            searchInput.value = q;
            searchInput.dispatchEvent(new Event("input"));
        }
    }
})();
