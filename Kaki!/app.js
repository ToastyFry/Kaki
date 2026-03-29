/* ===== Kaki! — Core App Logic ===== */

const App = (() => {
  // Fallback data — used when fetch('data.json') fails (e.g. file:// protocol)
  const FALLBACK_DATA = [
    { id: "whatcha", name: "Whatcha", openingHours: "Launch based (Check Instagram)", description: "Cafe-style concept featuring matcha and hojicha latte series alongside signature banana puddings.", teaser: "Matcha lattes & banana puddings from a Tiong Bahru pop-up", ratings: 4.6, reviews: 121, location: "150104, Singapore (Tiong Bahru Road)", estimatedDistance: "0.7 km", estimatedDuration: "9 mins (Walking)", gmapsurl: "https://www.google.com/maps/search/?api=1&query=150104+Singapore", price: 2, priceDisplay: "$10 - $20", localBrand: true, imageUrl: "thumbnails/whatcha.jpg" },
    { id: "harina-bakery", name: "Harina Bakery", openingHours: "Pre-order for collection (Check IG)", description: "Small-batch home bakery specializing in sourdough, brioche, and premium chocolate chip cookies.", teaser: "Small-batch sourdough from a Bukit Purmei home kitchen", ratings: 4.8, reviews: 85, location: "Bukit Purmei, Singapore", estimatedDistance: "1.4 km", estimatedDuration: "18 mins (Walking)", gmapsurl: "https://www.google.com/maps/search/?api=1&query=Bukit+Purmei+Singapore", price: 2, priceDisplay: "$10 - $20", localBrand: true, imageUrl: "thumbnails/harina_bakery.jpg" },
    { id: "pebblescoffee", name: "Pebbles Coffee", openingHours: "DM to find out (Flexible)", description: "Intimate home cafe experience offering barista-quality coffee and specialty tea.", teaser: "Barista-quality coffee in an intimate home setting", ratings: 4.7, reviews: 55, location: "8 Minbu Road, Singapore 308162", estimatedDistance: "5.1 km", estimatedDuration: "1 hour 5 mins (Walking)", gmapsurl: "https://www.google.com/maps/search/?api=1&query=8+Minbu+Road+Singapore+308162", price: 2, priceDisplay: "< $10", localBrand: true, imageUrl: "thumbnails/pebbles_coffee.jpg" },
    { id: "fuku", name: "Fuku", openingHours: "Wed-Fri 8am-8pm, Sat-Sun 10am-6pm", description: "Home-based matcha cafe focusing on handcrafted drinks and Japanese-inspired desserts.", teaser: "Handcrafted matcha drinks & Japanese desserts at home", ratings: 4.5, reviews: 173, location: "357 Clementi Ave 2, Singapore 120357", estimatedDistance: "7.2 km", estimatedDuration: "1 hour 35 mins (Walking)", gmapsurl: "https://www.google.com/maps/search/?api=1&query=357+Clementi+Ave+2+Singapore+120357", price: 2, priceDisplay: "$5 - $20", localBrand: true, imageUrl: "thumbnails/fuku.jpg" },
    { id: "kopi-khoo", name: "Kopi Khoo", openingHours: "Tuesday-Sunday 8am-4pm", description: "Small home-based cafe business serving artisanal coffee in a heritage neighborhood.", teaser: "Artisanal coffee from a charming heritage neighbourhood", ratings: 4.9, reviews: 203, location: "112C Tembeling Rd, Singapore 423606", estimatedDistance: "9.2 km", estimatedDuration: "1 hour 55 mins (Walking)", gmapsurl: "https://www.google.com/maps/search/?api=1&query=112C+Tembeling+Rd+Singapore+423606", price: 1, priceDisplay: "< $10", localBrand: true, imageUrl: "thumbnails/kopi_khoo.jpg" },
    { id: "coffeenearme", name: "Coffee Near Me", openingHours: "Weekends & PH, 9:00AM - 3:30PM", description: "Pet-friendly cafe specializing in specialty lattes, brownies, and a welcoming weekend vibe.", teaser: "Pet-friendly weekend lattes & brownies in a cozy corner", ratings: 4.4, reviews: 57, location: "20 Casuarina Walk, Singapore", estimatedDistance: "11.5 km", estimatedDuration: "2 hours 20 mins (Walking)", gmapsurl: "https://www.google.com/maps/search/?api=1&query=20+Casuarina+Walk+Singapore", price: 1, priceDisplay: "$10 - $20", localBrand: true, imageUrl: "thumbnails/coffeenearme.jpg" },
    { id: "kohpan", name: "Kohpan", openingHours: "Mon, Thu-Sun 11am-5pm", description: "Specialty bakery known for shiopans (salt bread) in flavors like mentaiko and truffle.", teaser: "Mentaiko & truffle shiopans from a specialty home bakery", ratings: 4.7, reviews: 92, location: "13A Thong Soon Ave, Singapore", estimatedDistance: "12.1 km", estimatedDuration: "2 hours 35 mins (Walking)", gmapsurl: "https://www.google.com/maps/search/?api=1&query=13A+Thong+Soon+Ave+Singapore", price: 2, priceDisplay: "$5 - $15", localBrand: true, imageUrl: "thumbnails/whatcha.jpg" },
    { id: "tofutofu", name: "Tofu Tofu", openingHours: "Weekends around 12pm (Check IG)", description: "Muslim-friendly home-based pickup cafe serving barista coffee and matcha.", teaser: "Muslim-friendly barista coffee & matcha from home", ratings: 4.6, reviews: 64, location: "532 Bedok North Street 3, Singapore 460532", estimatedDistance: "13.8 km", estimatedDuration: "2 hours 50 mins (Walking)", gmapsurl: "https://www.google.com/maps/search/?api=1&query=532+Bedok+North+Street+3+Singapore+460532", price: 1, priceDisplay: "< $10", localBrand: true, imageUrl: "thumbnails/harina_bakery.jpg" },
    { id: "brewedbydavine", name: "Brewed by Davine", openingHours: "Preorder only (Opens till 11:59pm)", description: "Home-based cafe known for matcha beverages and decadent brownies.", teaser: "Preorder matcha beverages & decadent brownies", ratings: 4.6, reviews: 78, location: "Bukit Batok 650161, Singapore", estimatedDistance: "15.2 km", estimatedDuration: "3 hours 10 mins (Walking)", gmapsurl: "https://www.google.com/maps/search/?api=1&query=Bukit+Batok+650161+Singapore", price: 1, priceDisplay: "< $10", localBrand: true, imageUrl: "thumbnails/pebbles_coffee.jpg" },
    { id: "state-of-mind", name: "State of Mind", openingHours: "Mon-Tue 9:30-2:30pm, Sun 11:30-2:30pm", description: "Window-service espresso bar serving handcrafted artisanal drinks from a home setting.", teaser: "Handcrafted espresso from a Yishun window-service bar", ratings: 4.8, reviews: 110, location: "Blk 935 Yishun Central 1, #02-37, Singapore 760935", estimatedDistance: "18.1 km", estimatedDuration: "3 hours 45 mins (Walking)", gmapsurl: "https://www.google.com/maps/search/?api=1&query=Blk+935+Yishun+Central+1+Singapore+760935", price: 1, priceDisplay: "< $10", localBrand: true, imageUrl: "thumbnails/fuku.jpg" },
  ];

  let businesses = [];
  let favourites = [];
  let nearMe = false;
  let unseenFavourites = false;

  // DOM refs
  const splash = document.getElementById('splash');
  const onboarding = document.getElementById('onboarding');
  const toast = document.getElementById('toast');
  const favNotifDot = document.getElementById('fav-notif-dot');

  // ===== Init =====
  async function init() {
    loadState();
    await loadData();

    // Splash: show for 1s then fade out
    setTimeout(() => {
      splash.classList.add('fade-out');
      setTimeout(() => {
        splash.classList.add('hidden');
        // Show onboarding on first visit
        if (!localStorage.getItem('kaki_onboarding_seen')) {
          showOnboarding();
        }
      }, 500);
    }, 1000);

    setupRouting();
    setupTabBar();
    setupProfile();
    setupAboutPanel();

    // Navigate to initial route
    handleRoute();

    // Update notification dot
    updateNotifDot();
  }

  // ===== Data Loading =====
  async function loadData() {
    try {
      const res = await fetch('data.json');
      const json = await res.json();
      businesses = json.businesses;
    } catch (e) {
      console.warn('fetch("data.json") failed — using embedded fallback data.', e);
      businesses = FALLBACK_DATA;
    }
  }

  // ===== State Persistence =====
  function loadState() {
    try {
      const saved = localStorage.getItem('kaki_favourites');
      favourites = saved ? JSON.parse(saved) : [];
    } catch { favourites = []; }

    nearMe = localStorage.getItem('kaki_near_me') === 'true';
    unseenFavourites = localStorage.getItem('kaki_unseen_fav') === 'true';
  }

  function saveFavourites() {
    localStorage.setItem('kaki_favourites', JSON.stringify(favourites));
  }

  function saveNearMe() {
    localStorage.setItem('kaki_near_me', String(nearMe));
  }

  // ===== Favourites API =====
  function isFavourite(id) {
    return favourites.includes(id);
  }

  function addFavourite(id) {
    if (!favourites.includes(id)) {
      favourites.push(id);
      saveFavourites();
      setUnseenFavourites(true);
      showToast();
    }
  }

  function removeFavourite(id) {
    favourites = favourites.filter(f => f !== id);
    saveFavourites();
  }

  function getFavourites() {
    return [...favourites];
  }

  function setUnseenFavourites(val) {
    unseenFavourites = val;
    localStorage.setItem('kaki_unseen_fav', String(val));
    updateNotifDot();
  }

  function updateNotifDot() {
    if (unseenFavourites) {
      favNotifDot.classList.remove('hidden');
    } else {
      favNotifDot.classList.add('hidden');
    }
  }

  // ===== Toast =====
  let toastTimer = null;
  function showToast(message) {
    clearTimeout(toastTimer);
    if (message) {
      toast.querySelector('span').textContent = message;
    } else {
      toast.querySelector('span').textContent = 'Saved to Favourites';
    }
    toast.classList.remove('hidden', 'fade-out');
    toast.classList.add('show');
    toastTimer = setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => {
        toast.classList.remove('show', 'fade-out');
        toast.classList.add('hidden');
      }, 300);
    }, 1500);
  }

  // ===== Onboarding =====
  function showOnboarding() {
    onboarding.classList.remove('hidden');
  }

  document.getElementById('onboarding-dismiss').addEventListener('click', () => {
    onboarding.classList.add('hidden');
    localStorage.setItem('kaki_onboarding_seen', 'true');
  });

  // ===== Routing =====
  function setupRouting() {
    window.addEventListener('hashchange', handleRoute);
  }

  function handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'home';
    const screens = document.querySelectorAll('.screen');
    const tabs = document.querySelectorAll('.tab');

    screens.forEach(s => s.classList.remove('active'));
    tabs.forEach(t => t.classList.remove('active'));

    const target = document.getElementById('screen-' + hash);
    if (target) {
      target.classList.add('active');
    } else {
      document.getElementById('screen-home').classList.add('active');
    }

    const activeTab = document.querySelector(`.tab[data-tab="${hash}"]`);
    if (activeTab) activeTab.classList.add('active');

    // Screen-specific triggers
    if (hash === 'search') {
      setTimeout(() => {
        const input = document.getElementById('search-input');
        if (input) input.focus();
      }, 200);
    }

    if (hash === 'favourites') {
      setUnseenFavourites(false);
      if (typeof Favourites !== 'undefined') Favourites.render();
    }

    if (hash === 'profile') {
      updateProfileCount();
    }

    if (hash === 'home') {
      if (typeof CardStack !== 'undefined') CardStack.refresh();
    }
  }

  // ===== Tab Bar =====
  function setupTabBar() {
    // Search bar on home → navigate to search
    document.getElementById('search-bar-home').addEventListener('click', () => {
      window.location.hash = '#search';
    });
  }

  // ===== Profile =====
  function setupProfile() {
    document.querySelectorAll('.profile-menu-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (action === 'coming-soon') {
          showToast('Coming Soon');
        } else if (action === 'about') {
          showAboutPanel();
        }
      });
    });
  }

  function updateProfileCount() {
    const el = document.getElementById('profile-fav-count');
    if (el) {
      el.innerHTML = `&hearts; ${favourites.length} hidden gems saved`;
    }
  }

  // ===== About Panel =====
  const aboutPanel = document.getElementById('about-panel');
  let aboutOverlay = null;

  function setupAboutPanel() {
    aboutOverlay = document.createElement('div');
    aboutOverlay.className = 'filter-panel-overlay hidden';
    aboutOverlay.id = 'about-overlay';
    document.body.appendChild(aboutOverlay);

    document.getElementById('about-close').addEventListener('click', hideAboutPanel);
    aboutOverlay.addEventListener('click', hideAboutPanel);
  }

  function showAboutPanel() {
    aboutOverlay.classList.remove('hidden');
    aboutPanel.classList.remove('hidden');
    requestAnimationFrame(() => {
      aboutPanel.classList.add('show');
    });
  }

  function hideAboutPanel() {
    aboutPanel.classList.remove('show');
    setTimeout(() => {
      aboutPanel.classList.add('hidden');
      aboutOverlay.classList.add('hidden');
    }, 300);
  }

  // ===== Getters =====
  function getBusinesses() { return businesses; }
  function getBusinessById(id) { return businesses.find(b => b.id === id); }
  function isNearMe() { return nearMe; }
  function setNearMe(val) { nearMe = val; saveNearMe(); }

  // ===== Distance parser =====
  function parseDistance(str) {
    return parseFloat(str) || 999;
  }

  // ===== Sort businesses =====
  function getSortedBusinesses(forceNearMe) {
    const sorted = [...businesses];
    const useNearMe = forceNearMe !== undefined ? forceNearMe : nearMe;
    if (useNearMe) {
      sorted.sort((a, b) => parseDistance(a.estimatedDistance) - parseDistance(b.estimatedDistance));
    }
    // Deprioritize favourited businesses (stable: push favs to end)
    const notFav = sorted.filter(b => !isFavourite(b.id));
    const fav = sorted.filter(b => isFavourite(b.id));
    return [...notFav, ...fav];
  }

  // Register service worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }

  // Start on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    getBusinesses,
    getBusinessById,
    getSortedBusinesses,
    parseDistance,
    isFavourite,
    addFavourite,
    removeFavourite,
    getFavourites,
    isNearMe,
    setNearMe,
    showToast,
    setUnseenFavourites,
  };
})();
