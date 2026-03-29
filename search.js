/* ===== Kaki! — Search & Filter Module ===== */

const Search = (() => {
  // Category keyword maps
  const CATEGORY_KEYWORDS = {
    cafe: ['coffee', 'cafe', 'latte', 'espresso', 'barista', 'matcha', 'tea'],
    bakery: ['bakery', 'sourdough', 'bread', 'cookies', 'brownies', 'shiopan', 'brioche', 'bake'],
    food: ['hawker', 'food', 'meal', 'rice', 'noodle'],
    crafts: ['craft', 'workshop', 'handmade', 'pottery'],
    services: ['service', 'repair', 'tailor', 'clean'],
  };

  const SUGGESTION_TERMS = ['coffee', 'matcha', 'bakery', 'sourdough', 'home cafe', 'brownies'];

  // State
  let activeCategory = 'all';
  let filterPrice = 0;    // 0 = any
  let filterDist = 0;     // 0 = any
  let filterRating = 0;   // 0 = any
  let debounceTimer = null;

  // DOM
  const searchInput = document.getElementById('search-input');
  const searchClear = document.getElementById('search-clear');
  const filterChips = document.getElementById('filter-chips');
  const filterPanelBtn = document.getElementById('filter-panel-btn');
  const filterPanel = document.getElementById('filter-panel');
  const filterPanelOverlay = document.getElementById('filter-panel-overlay');
  const filterApplyBtn = document.getElementById('filter-apply-btn');
  const resultsContainer = document.getElementById('search-results');
  const noResults = document.getElementById('search-no-results');
  const suggestionsEl = document.getElementById('search-suggestions');

  function init() {
    const check = setInterval(() => {
      if (App.getBusinesses().length > 0) {
        clearInterval(check);
        setup();
      }
    }, 50);
  }

  function setup() {
    setupSearchInput();
    setupCategoryChips();
    setupFilterPanel();
    renderSuggestions();
    performSearch(); // initial render: show all
  }

  // ===== Category Inference =====
  function inferCategories(biz) {
    const text = (biz.name + ' ' + biz.description + ' ' + biz.teaser).toLowerCase();
    const cats = [];
    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some(kw => text.includes(kw))) {
        cats.push(cat);
      }
    }
    return cats.length > 0 ? cats : ['all'];
  }

  // ===== Search Input =====
  function setupSearchInput() {
    searchInput.addEventListener('input', () => {
      const val = searchInput.value.trim();
      searchClear.classList.toggle('hidden', val.length === 0);

      clearTimeout(debounceTimer);
      if (val.length >= 2) {
        debounceTimer = setTimeout(() => performSearch(), 300);
      } else if (val.length === 0) {
        performSearch();
      }
    });

    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      searchClear.classList.add('hidden');
      performSearch();
      searchInput.focus();
    });
  }

  // ===== Category Chips =====
  function setupCategoryChips() {
    filterChips.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        filterChips.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        activeCategory = chip.dataset.category;
        performSearch();
      });
    });
  }

  // ===== Filter Panel =====
  function setupFilterPanel() {
    filterPanelBtn.addEventListener('click', openFilterPanel);
    filterPanelOverlay.addEventListener('click', closeFilterPanel);
    filterApplyBtn.addEventListener('click', () => {
      closeFilterPanel();
      performSearch();
    });

    // Price pills
    document.querySelectorAll('#filter-price .filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('#filter-price .filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        filterPrice = parseInt(pill.dataset.price, 10);
      });
    });

    // Distance pills
    document.querySelectorAll('#filter-distance .filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('#filter-distance .filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        filterDist = parseInt(pill.dataset.dist, 10);
      });
    });

    // Rating pills
    document.querySelectorAll('#filter-rating .filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('#filter-rating .filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        filterRating = parseFloat(pill.dataset.rating);
      });
    });
  }

  function openFilterPanel() {
    filterPanelOverlay.classList.remove('hidden');
    filterPanel.classList.remove('hidden');
    requestAnimationFrame(() => {
      filterPanel.classList.add('show');
    });
  }

  function closeFilterPanel() {
    filterPanel.classList.remove('show');
    setTimeout(() => {
      filterPanel.classList.add('hidden');
      filterPanelOverlay.classList.add('hidden');
    }, 300);
  }

  // ===== Search Logic =====
  function performSearch() {
    const query = searchInput.value.trim().toLowerCase();
    let results = App.getBusinesses();

    // Text search
    if (query.length >= 2) {
      results = results.filter(biz => {
        const text = (biz.name + ' ' + biz.description + ' ' + biz.teaser + ' ' + biz.location).toLowerCase();
        return text.includes(query);
      });
    }

    // Category filter
    if (activeCategory !== 'all') {
      results = results.filter(biz => {
        const cats = inferCategories(biz);
        return cats.includes(activeCategory);
      });
    }

    // Price filter
    if (filterPrice > 0) {
      results = results.filter(biz => biz.price === filterPrice);
    }

    // Distance filter
    if (filterDist > 0) {
      results = results.filter(biz => App.parseDistance(biz.estimatedDistance) <= filterDist);
    }

    // Rating filter
    if (filterRating > 0) {
      results = results.filter(biz => biz.ratings >= filterRating);
    }

    renderResults(results);
  }

  // ===== Render =====
  function renderResults(results) {
    resultsContainer.innerHTML = '';

    if (results.length === 0) {
      resultsContainer.classList.add('hidden');
      noResults.classList.remove('hidden');
      return;
    }

    noResults.classList.add('hidden');
    resultsContainer.classList.remove('hidden');

    results.forEach(biz => {
      const isFav = App.isFavourite(biz.id);
      const card = document.createElement('div');
      card.className = 'mini-card';
      card.dataset.id = biz.id;
      card.innerHTML = `
        <div class="mini-card-info">
          <div class="mini-card-name">${biz.name}</div>
          <div class="mini-card-desc">${biz.description}</div>
          <div class="mini-card-meta">
            <span class="star">★ ${biz.ratings}</span>
            <span>${biz.estimatedDistance}</span>
            <span>${biz.priceDisplay || '$'.repeat(biz.price)}</span>
          </div>
        </div>
        <button class="mini-card-heart ${isFav ? 'fav' : ''}" data-id="${biz.id}">
          <svg viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </button>
      `;

      // Heart toggle
      const heartBtn = card.querySelector('.mini-card-heart');
      heartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (App.isFavourite(biz.id)) {
          App.removeFavourite(biz.id);
          heartBtn.classList.remove('fav');
        } else {
          App.addFavourite(biz.id);
          heartBtn.classList.add('fav');
        }
      });

      // Tap to expand detail
      card.addEventListener('click', (e) => {
        if (e.target.closest('.mini-card-heart')) return;
        if (typeof Favourites !== 'undefined') {
          Favourites.openDetail(biz.id);
        }
      });

      resultsContainer.appendChild(card);
    });
  }

  // ===== Suggestions =====
  function renderSuggestions() {
    SUGGESTION_TERMS.forEach(term => {
      const chip = document.createElement('button');
      chip.className = 'suggestion-chip';
      chip.textContent = term;
      chip.addEventListener('click', () => {
        searchInput.value = term;
        searchClear.classList.remove('hidden');
        performSearch();
      });
      suggestionsEl.appendChild(chip);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { performSearch };
})();
