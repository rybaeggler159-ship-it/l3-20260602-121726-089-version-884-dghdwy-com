(() => {
  const input = document.getElementById('catalog-search');
  const clearButton = document.getElementById('catalog-clear');
  const results = document.getElementById('search-results');
  const count = document.getElementById('search-count');

  if (!input || !results || !count || !Array.isArray(CATALOG_ITEMS)) {
    return;
  }

  const params = new URLSearchParams(location.search);
  const initial = params.get('q') || '';

  const card = (item) => `
    <article class="movie-card">
      <a class="poster-link" href="${item.url}" aria-label="${escapeHtml(item.title)}">
        <img src="${item.cover}" alt="${escapeHtml(item.title)}" loading="lazy">
        <span class="poster-shade"></span>
        <span class="play-dot">▶</span>
      </a>
      <div class="card-body">
        <div class="card-tags">
          <span>${escapeHtml(item.type)}</span>
          <span>${escapeHtml(item.region)}</span>
          <span>${escapeHtml(item.year)}</span>
        </div>
        <h3><a href="${item.url}">${escapeHtml(item.title)}</a></h3>
        <p>${escapeHtml(item.line || item.genre)}</p>
      </div>
    </article>`;

  function escapeHtml(value) {
    return String(value || '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function render() {
    const keyword = input.value.trim().toLowerCase();
    const pool = keyword
      ? CATALOG_ITEMS.filter((item) => {
          return [
            item.title,
            item.region,
            item.type,
            item.year,
            item.genre,
            item.category,
            item.line
          ].join(' ').toLowerCase().includes(keyword);
        })
      : CATALOG_ITEMS.slice(0, 36);

    const list = pool.slice(0, 120);
    results.innerHTML = list.map(card).join('');
    count.textContent = keyword
      ? `找到 ${pool.length} 条相关内容，显示前 ${list.length} 条`
      : '显示推荐结果';
  }

  input.value = initial;
  input.addEventListener('input', render);

  if (clearButton) {
    clearButton.addEventListener('click', () => {
      input.value = '';
      render();
      input.focus();
    });
  }

  render();
})();
