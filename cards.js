/* ===== Kaki! — Card Stack Module ===== */

const CardStack = (() => {
  let cards = [];
  let currentIndex = 0;
  let cardEl = null;
  let hammer = null;
  let isAnimating = false;
  let isFlipped = false;

  const container = document.getElementById('card-container');
  const endOfStack = document.getElementById('end-of-stack');
  const gestureHints = document.getElementById('gesture-hints');
  const nearMeToggle = document.getElementById('nearme-toggle');
  const startOverBtn = document.getElementById('start-over-btn');

  function init() {
    // Wait for App data to be ready, with 5s timeout
    let elapsed = 0;
    const check = setInterval(() => {
      const data = App.getBusinesses();
      if (data.length > 0) {
        clearInterval(check);
        setup();
        return;
      }
      elapsed += 50;
      if (elapsed >= 5000) {
        clearInterval(check);
        console.error('CardStack: timed out waiting for business data');
        showEndOfStack();
      }
    }, 50);
  }

  function setup() {
    loadCards();
    renderCurrentCard();
    setupNearMeToggle();
    setupStartOver();
  }

  function loadCards() {
    cards = App.getSortedBusinesses();
    // Restore saved index
    const savedIdx = parseInt(localStorage.getItem('kaki_card_index'), 10);
    currentIndex = (savedIdx >= 0 && savedIdx < cards.length) ? savedIdx : 0;
  }

  function saveIndex() {
    localStorage.setItem('kaki_card_index', String(currentIndex));
  }

  // ===== Near Me Toggle =====
  function setupNearMeToggle() {
    if (App.isNearMe()) {
      nearMeToggle.classList.add('active');
    }
    nearMeToggle.addEventListener('click', () => {
      const active = !nearMeToggle.classList.contains('active');
      nearMeToggle.classList.toggle('active', active);
      App.setNearMe(active);
      // Instant reset
      cards = App.getSortedBusinesses();
      currentIndex = 0;
      saveIndex();
      renderCurrentCard();
    });
  }

  // ===== Start Over =====
  function setupStartOver() {
    startOverBtn.addEventListener('click', () => {
      currentIndex = 0;
      saveIndex();
      endOfStack.classList.add('hidden');
      container.classList.remove('hidden');
      gestureHints.classList.remove('hidden');
      renderCurrentCard();
    });
  }

  // ===== Render Card =====
  function renderCurrentCard() {
    // Destroy old
    destroyCard();
    isFlipped = false;

    if (currentIndex >= cards.length) {
      showEndOfStack();
      return;
    }

    endOfStack.classList.add('hidden');
    container.classList.remove('hidden');
    gestureHints.classList.remove('hidden');

    const biz = cards[currentIndex];

    // Add peek card (next card behind current)
    if (currentIndex + 1 < cards.length) {
      const peekBiz = cards[currentIndex + 1];
      const peekEl = createCardElement(peekBiz);
      peekEl.classList.add('card-peek');
      peekEl.style.pointerEvents = 'none';
      container.appendChild(peekEl);
    }

    cardEl = createCardElement(biz);
    container.appendChild(cardEl);

    // Small delay for enter animation
    requestAnimationFrame(() => {
      setupHammer(cardEl, biz);
    });
  }

  function createCardElement(biz) {
    const wrapper = document.createElement('div');
    wrapper.className = 'card-wrapper';

    const isFav = App.isFavourite(biz.id);

    wrapper.innerHTML = `
      <div class="card-inner">
        <div class="card-front">
          <div class="card-fav-badge ${isFav ? 'show' : ''}" title="Favourited">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#e76f51" stroke="none">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <div class="card-rating-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#2b2b2b" stroke="none">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            ${biz.ratings}
          </div>
          <h2 class="card-name">${biz.name}</h2>
          <p class="card-teaser">${biz.teaser}</p>
          <div class="card-tap-hint">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 2v4m0 12v4M2 12h4m12 0h4"/>
            </svg>
            <span>Tap to reveal</span>
          </div>
        </div>
        <div class="card-back">
          <div class="card-back-image" style="background-image: url('${biz.imageUrl}')"></div>
          <div class="card-back-details">
            <h3 class="card-back-name">${biz.name}</h3>
            <div class="card-back-row rating-row">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="#2a9d8f" stroke="none">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              ${biz.ratings} <span class="reviews-count">(${biz.reviews || 0})</span>
            </div>
            <a href="${biz.gmapsurl}" target="_blank" rel="noopener noreferrer" class="card-back-location-link" onclick="event.stopPropagation()">
              <div class="card-back-row">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                ${biz.location}
              </div>
            </a>
            <div class="walk-info-pill">
              <div class="walk-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="13" cy="4" r="2"/><line x1="7" y1="21" x2="10" y2="17"/><path d="M16 21l-2-4-3-3 1-6"/><path d="M6 12l2-3 4-1 3 3 3 1"/>
                </svg>
              </div>
              <span class="walk-text">${biz.estimatedDistance} &middot; ${biz.estimatedDuration.replace(' (Walking)', '')} walk</span>
            </div>
            <div class="card-back-row">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
              </svg>
              ${biz.openingHours}
            </div>
            <div class="card-back-footer">
              <span class="local-brand-badge">LOCAL BRAND</span>
              <span class="price-display">${biz.priceDisplay || ''}</span>
            </div>
            <button class="card-back-heart ${isFav ? 'fav' : ''}" data-id="${biz.id}">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </button>
            <div class="card-back-flip-hint">Tap to flip back</div>
          </div>
        </div>
      </div>
    `;

    // Heart button on card back
    const heartBtn = wrapper.querySelector('.card-back-heart');
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

    // Tap to flip
    wrapper.addEventListener('click', (e) => {
      if (e.target.closest('.card-back-heart')) return;
      if (isAnimating) return;
      isFlipped = !isFlipped;
      wrapper.classList.toggle('flipped', isFlipped);
    });

    return wrapper;
  }

  // ===== Hammer.js Gestures =====
  function setupHammer(el, biz) {
    if (hammer) hammer.destroy();

    hammer = new Hammer(el);
    hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL, threshold: 5 });
    hammer.get('swipe').set({
      direction: Hammer.DIRECTION_ALL,
      threshold: 10,
      velocity: 0.3
    });

    let startX = 0, startY = 0;

    hammer.on('panstart', () => {
      startX = 0;
      startY = 0;
      el.style.transition = 'none';
    });

    hammer.on('panmove', (e) => {
      if (isAnimating) return;
      startX = e.deltaX;
      startY = e.deltaY;

      const rotation = e.deltaX * 0.04; // max ~15deg at full card width
      const opacity = Math.max(0.6, 1 - Math.abs(e.deltaX) / 400);

      el.style.transform = `translate(${e.deltaX}px, ${e.deltaY}px) rotate(${rotation}deg)`;
      el.style.opacity = opacity;
    });

    hammer.on('panend', (e) => {
      if (isAnimating) return;
      el.style.transition = 'transform 200ms ease-out, opacity 200ms ease-out';
      el.style.transform = 'translate(0, 0) rotate(0deg)';
      el.style.opacity = 1;
    });

    hammer.on('swipeleft', () => {
      if (isAnimating) return;
      swipeCard('left');
    });

    hammer.on('swiperight', () => {
      if (isAnimating) return;
      swipeCard('right');
    });

    hammer.on('swipeup', () => {
      if (isAnimating) return;
      swipeCardUp(biz);
    });
  }

  function swipeCard(direction) {
    if (!cardEl || isAnimating) return;
    isAnimating = true;

    // Aura flash: red on left (skip), none on right (go back)
    if (direction === 'left') {
      cardEl.classList.add('do-flash-red');
    }

    const cls = direction === 'left' ? 'swipe-left' : 'swipe-right';
    cardEl.style.transition = '';
    cardEl.classList.add(cls);

    setTimeout(() => {
      if (direction === 'left') {
        if (currentIndex < cards.length - 1) {
          currentIndex++;
        } else {
          currentIndex = cards.length; // triggers end of stack
        }
      } else {
        if (currentIndex > 0) {
          currentIndex--;
        }
      }
      saveIndex();
      isAnimating = false;
      renderCurrentCard();
    }, 300);
  }

  function swipeCardUp(biz) {
    if (!cardEl || isAnimating) return;
    isAnimating = true;

    // Aura flash: green on swipe-up (favourite)
    cardEl.classList.add('do-flash-green');

    cardEl.style.transition = '';
    cardEl.classList.add('swipe-up');

    // Save + open maps
    App.addFavourite(biz.id);
    window.open(biz.gmapsurl, '_blank');

    setTimeout(() => {
      // Move to next card
      if (currentIndex < cards.length - 1) {
        currentIndex++;
      } else {
        currentIndex = cards.length;
      }
      saveIndex();
      // Reload cards with deprioritization
      cards = App.getSortedBusinesses();
      // Adjust index if needed
      if (currentIndex > cards.length) currentIndex = cards.length;
      isAnimating = false;
      renderCurrentCard();
    }, 400);
  }

  function showEndOfStack() {
    container.classList.add('hidden');
    gestureHints.classList.add('hidden');
    endOfStack.classList.remove('hidden');
  }

  function destroyCard() {
    if (hammer) { hammer.destroy(); hammer = null; }
    if (cardEl) { cardEl.remove(); cardEl = null; }
    // Remove any peek cards
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }

  // ===== Public: refresh on tab return =====
  function refresh() {
    cards = App.getSortedBusinesses();
    if (currentIndex >= cards.length) currentIndex = Math.max(0, cards.length - 1);
    renderCurrentCard();
  }

  // Init when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { refresh };
})();
