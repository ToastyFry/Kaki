/* ===== Kaki! — Favourites & Detail View Module ===== */

const Favourites = (() => {
  const favList = document.getElementById('fav-list');
  const favEmpty = document.getElementById('fav-empty');
  const detailView = document.getElementById('detail-view');
  const unfavModal = document.getElementById('unfav-modal');
  const modalRemove = document.getElementById('modal-remove');
  const modalKeep = document.getElementById('modal-keep');

  let pendingUnfavId = null;
  let currentDetailId = null;
  let detailHammer = null;

  function init() {
    setupUnfavModal();
    setupDetailView();
  }

  // ===== Render Favourites List =====
  function render() {
    const favIds = App.getFavourites();
    favList.innerHTML = '';

    if (favIds.length === 0) {
      favList.classList.add('hidden');
      favEmpty.classList.remove('hidden');
      return;
    }

    favEmpty.classList.add('hidden');
    favList.classList.remove('hidden');

    favIds.forEach(id => {
      const biz = App.getBusinessById(id);
      if (!biz) return;

      const item = document.createElement('div');
      item.className = 'fav-item';
      item.dataset.id = id;
      item.innerHTML = `
        <div class="fav-item-thumb" style="background-image: url('${biz.imageUrl}')"></div>
        <div class="fav-item-info">
          <div class="fav-item-name">${biz.name}</div>
          <div class="fav-item-desc">${biz.description}</div>
          <div class="fav-item-meta">
            <span class="star">★ ${biz.ratings}</span>
            <span>${biz.estimatedDistance}</span>
            <span>${biz.priceDisplay || ''}</span>
          </div>
        </div>
        <button class="fav-item-heart" data-id="${id}">
          <svg viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </button>
      `;

      // Heart → open unfav modal
      const heartBtn = item.querySelector('.fav-item-heart');
      heartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showUnfavModal(id);
      });

      // Tap → open detail
      item.addEventListener('click', (e) => {
        if (e.target.closest('.fav-item-heart')) return;
        openDetail(id);
      });

      favList.appendChild(item);
    });
  }

  // ===== Unfavourite Modal =====
  function setupUnfavModal() {
    modalRemove.addEventListener('click', () => {
      if (pendingUnfavId) {
        App.removeFavourite(pendingUnfavId);
        pendingUnfavId = null;
        hideUnfavModal();
        render();
      }
    });

    modalKeep.addEventListener('click', () => {
      pendingUnfavId = null;
      hideUnfavModal();
    });

    unfavModal.addEventListener('click', (e) => {
      if (e.target === unfavModal) {
        pendingUnfavId = null;
        hideUnfavModal();
      }
    });
  }

  function showUnfavModal(id) {
    pendingUnfavId = id;
    unfavModal.classList.remove('hidden');
  }

  function hideUnfavModal() {
    unfavModal.classList.add('hidden');
  }

  // ===== Detail View =====
  function setupDetailView() {
    // Maps button
    document.getElementById('detail-maps-btn').addEventListener('click', () => {
      const biz = App.getBusinessById(currentDetailId);
      if (biz) window.open(biz.gmapsurl, '_blank');
    });

    // Heart toggle
    document.getElementById('detail-heart').addEventListener('click', () => {
      if (!currentDetailId) return;
      const heartEl = document.getElementById('detail-heart');
      if (App.isFavourite(currentDetailId)) {
        App.removeFavourite(currentDetailId);
        heartEl.classList.remove('fav');
      } else {
        App.addFavourite(currentDetailId);
        heartEl.classList.add('fav');
      }
    });
  }

  function openDetail(id) {
    const biz = App.getBusinessById(id);
    if (!biz) return;

    currentDetailId = id;

    // Populate
    const imgContainer = document.querySelector('.detail-image');
    if (biz.imageUrl) {
      imgContainer.style.backgroundImage = `url('${biz.imageUrl}')`;
    } else {
      imgContainer.style.backgroundImage = '';
    }
    const imgEl = document.getElementById('detail-img');
    if (imgEl) imgEl.style.display = 'none';

    document.getElementById('detail-name').textContent = biz.name;
    document.getElementById('detail-hours').textContent = biz.openingHours;
    document.getElementById('detail-rating').textContent = biz.ratings;
    const reviewsEl = document.getElementById('detail-reviews');
    if (reviewsEl) reviewsEl.textContent = `(${biz.reviews || 0} reviews)`;
    const priceEl = document.getElementById('detail-price');
    if (priceEl) priceEl.textContent = biz.priceDisplay || '';
    document.getElementById('detail-location').textContent = biz.location;
    document.getElementById('detail-distance').textContent = biz.estimatedDistance + ' away';
    document.getElementById('detail-duration').textContent = biz.estimatedDuration.replace(' (Walking)', '');

    const heartEl = document.getElementById('detail-heart');
    heartEl.classList.toggle('fav', App.isFavourite(id));

    // Show
    detailView.classList.remove('hidden', 'closing');

    // Setup swipe gestures on detail
    setupDetailGestures();
  }

  function closeDetail() {
    detailView.classList.add('closing');
    if (detailHammer) { detailHammer.destroy(); detailHammer = null; }
    setTimeout(() => {
      detailView.classList.add('hidden');
      detailView.classList.remove('closing');
      currentDetailId = null;
    }, 300);
  }

  function setupDetailGestures() {
    if (detailHammer) detailHammer.destroy();

    const card = detailView.querySelector('.detail-card');
    detailHammer = new Hammer(card);
    detailHammer.get('swipe').set({ direction: Hammer.DIRECTION_VERTICAL, threshold: 10, velocity: 0.3 });

    detailHammer.on('swipeup', () => {
      const biz = App.getBusinessById(currentDetailId);
      if (biz) {
        App.addFavourite(biz.id);
        window.open(biz.gmapsurl, '_blank');
      }
      closeDetail();
    });

    detailHammer.on('swipedown', () => {
      closeDetail();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { render, openDetail, closeDetail };
})();
