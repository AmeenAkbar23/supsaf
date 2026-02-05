import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getDatabase, ref, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyA8cKsh5a-6CJ0JgsPhTFw7I0P_XE02yuQ",
  authDomain: "supsaf-f0f40.firebaseapp.com",
  databaseURL: "https://supsaf-f0f40-default-rtdb.firebaseio.com",
  projectId: "supsaf-f0f40",
  storageBucket: "supsaf-f0f40.firebasestorage.app",
  messagingSenderId: "929046180254",
  appId: "1:929046180254:web:ac22a6001f03487be9268f",
  measurementId: "G-WZQ15KJ1PX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

document.addEventListener('DOMContentLoaded', () => {
  // Auth UI Elements
  const loginBtn = document.getElementById('login-btn');
  const userMenu = document.getElementById('user-menu');
  const userAvatar = document.getElementById('user-avatar');
  const logoutBtn = document.getElementById('logout-btn');

  // Login Event
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      signInWithPopup(auth, provider)
        .then((result) => {
          // console.log("User signed in:", result.user);
        }).catch((error) => {
          console.error("Login failed:", error);
          alert("Login failed. Please try again.");
        });
    });
  }

  // Logout Event
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      signOut(auth).then(() => {
        // console.log("User signed out");
      }).catch((error) => {
        console.error("Logout failed:", error);
      });
    });
  }

  // Monitor Auth State
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in
      if (loginBtn) loginBtn.style.display = 'none';
      if (userMenu) {
        userMenu.classList.remove('hidden');
        userMenu.style.display = 'flex'; // override css hidden
        if (userAvatar) {
          userAvatar.src = user.photoURL || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
        }
      }
    } else {
      // User is signed out
      if (loginBtn) loginBtn.style.display = 'block';
      if (userMenu) {
        userMenu.classList.add('hidden');
        userMenu.style.display = 'none';
      }
    }
  });

  const cards = document.querySelectorAll('.card');
  const detailView = document.getElementById('image-detail');
  const backBtn = document.querySelector('.back-btn');
  const expandedImg = document.getElementById('expanded-img');
  const dlTrigger = document.getElementById('dl-trigger');
  const copyBtn = document.getElementById('copy-link');

  // Open detail view when clicking a card
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const img = card.querySelector('img');
      if (!img) return;

      const src = img.src;
      const cat = card.querySelector('.category')?.innerText ?? '';

      expandedImg.src = src;
      document.getElementById('detail-category').innerText = cat;

      if (dlTrigger) {
        dlTrigger.href = src;
        const filename = src.split('/').pop().split('?')[0] || 'image.jpg';
        dlTrigger.setAttribute('download', filename);
      }

      detailView.classList.add('active');
      document.body.style.overflow = 'hidden';
    });

    // Accessibility: make cards focusable and open on Enter/Space
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') card.click(); });
  });

  function closeDetail() {
    detailView.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (backBtn) backBtn.addEventListener('click', closeDetail);

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(expandedImg.src);
        copyBtn.textContent = 'Copied';
        setTimeout(() => copyBtn.textContent = 'Copy Asset Link', 1500);
      } catch (e) {
        alert('Copy failed');
      }
    });
  }

  // Reveal animations (IntersectionObserver)
  const revealEls = document.querySelectorAll('.card, .hero-card');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry, idx) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealEls.forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = `${i * 80}ms`;
      io.observe(el);
    });
  } else {
    // fallback
    revealEls.forEach(el => el.classList.add('in-view'));
  }

  // Hero interactions: click or Enter opens detail view
  const hero = document.querySelector('.hero-card');
  if (hero) {
    const openHero = () => {
      const bg = getComputedStyle(hero).backgroundImage;
      const m = bg.match(/url\("?(.+?)"?\)/);
      if (!m) return;
      const url = m[1];
      expandedImg.src = url;
      document.getElementById('detail-category').innerText = hero.querySelector('.hero-category')?.innerText ?? 'Featured';
      if (dlTrigger) dlTrigger.href = url;
      detailView.classList.add('active'); document.body.style.overflow = 'hidden';
    };
    hero.addEventListener('click', openHero);
    hero.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') openHero(); });
  }

  // Category filtering via hash routing (#street, #nature, etc.)
  const filterLinks = Array.from(document.querySelectorAll('.filter-strip a'));

  function setActiveFilterLink(category) {
    filterLinks.forEach(link => {
      const href = (link.getAttribute('href') || '').replace('#', '').toLowerCase();
      link.classList.toggle('active', href === category || (category === 'all' && href === 'all'));
    });
  }

  function filterCards(category) {
    const cats = (category || 'all').toLowerCase();
    cards.forEach(card => {
      const raw = card.querySelector('.category')?.innerText || '';
      const c = raw.trim().toLowerCase();
      if (cats === 'all' || c === cats) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  }

  function applyFilterFromHash() {
    const hash = (location.hash || '').replace('#', '').toLowerCase();
    const cat = (!hash || hash === 'all') ? 'all' : hash;
    setActiveFilterLink(cat);
    filterCards(cat);
  }

  // ensure clicking a filter link always applies the filter (prevents cases where hash doesn't change)
  filterLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = (link.getAttribute('href') || '').replace('#', '').toLowerCase() || 'all';
      if (location.hash.replace('#', '').toLowerCase() !== target) {
        location.hash = target; // triggers hashchange
      } else {
        // same hash — manually apply
        applyFilterFromHash();
      }
      // optional: scroll to top so the gallery is visible
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  window.addEventListener('hashchange', applyFilterFromHash);
  // apply filter on initial load
  applyFilterFromHash();



  // Close with Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (detailView?.classList.contains('active')) closeDetail();
      const popup = document.getElementById('insta-popup');
      if (popup?.classList.contains('active')) {
        popup.classList.remove('active');
        localStorage.setItem('instagramPopupShown', 'true');
      }
    }
  });
  // Instagram Popup Logic
  const instaPopup = document.getElementById('insta-popup');
  const closeInstaBtn = document.getElementById('close-popup');

  if (instaPopup && !localStorage.getItem('instagramPopupShown')) {
    setTimeout(() => {
      instaPopup.classList.add('active');
    }, 2500); // 2.5s delay
  }

  if (closeInstaBtn) {
    closeInstaBtn.addEventListener('click', () => {
      instaPopup.classList.remove('active');
      localStorage.setItem('instagramPopupShown', 'true');
    });
  }

  // Close if clicking outside the popup content
  if (instaPopup) {
    instaPopup.addEventListener('click', (e) => {
      if (e.target === instaPopup) {
        instaPopup.classList.remove('active');
        localStorage.setItem('instagramPopupShown', 'true');
      }
    });
  }

  // Search Logic
  const searchInput = document.querySelector('.search-wrapper input');
  const searchBtn = document.querySelector('.search-trigger');

  function performSearch() {
    const query = searchInput.value.toLowerCase().trim();

    // If search is cleared, revert to hash filter
    if (query.length === 0) {
      applyFilterFromHash();
      return;
    }

    // Visual update: clear active active filter links
    filterLinks.forEach(link => link.classList.remove('active'));

    cards.forEach(card => {
      const img = card.querySelector('img');
      const title = img?.getAttribute('data-title')?.toLowerCase() || '';
      const alt = img?.alt?.toLowerCase() || '';
      const cat = card.querySelector('.category')?.innerText.toLowerCase() || '';

      // Flexible matching
      const match = title.includes(query) || alt.includes(query) || cat.includes(query);

      card.style.display = match ? '' : 'none';
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', performSearch);
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        performSearch();
        searchInput.blur();
      }
    });
  }

  if (searchBtn) {
    searchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      performSearch();
    });
  }

  // -----------------------------------------------------
  // FIREBASE LIKE SYSTEM (Realtime Database)
  // -----------------------------------------------------

  // Clean up ID for database paths (remove .jpg, etc)
  function sanitizeId(filename) {
    return filename.replace(/[\.\#\$\[\]]/g, '_');
  }

  const likeBtns = document.querySelectorAll('.like-btn'); // Grid buttons
  const detailLikeBtn = document.getElementById('like-detail-btn'); // Detail button

  // Initialize UI with persistent local "liked" state (Did *I* like it?)
  // We use existing local storage for the user's personal vote state
  const myLikes = JSON.parse(localStorage.getItem('supsafLikes')) || [];

  function updateVisualState(btn, isLiked) {
    const icon = btn.querySelector('i');
    if (!icon) return;

    if (isLiked) {
      btn.classList.add('liked');
      icon.classList.remove('far'); // outline
      icon.classList.add('fas');    // solid
      if (detailLikeBtn && btn === detailLikeBtn) btn.style.color = 'var(--supsaf-red)';
    } else {
      btn.classList.remove('liked');
      icon.classList.remove('fas');
      icon.classList.add('far');
      if (detailLikeBtn && btn === detailLikeBtn) btn.style.color = '';
    }
  }

  function updateCountDisplay(btn, count) {
    let countEl = btn.querySelector('.like-count');
    if (!countEl) {
      countEl = document.createElement('span');
      countEl.className = 'like-count';
      btn.appendChild(countEl);
    }
    // Only show count if > 0
    countEl.innerText = count > 0 ? count : '';
  }

  // 1. Setup GRID buttons
  likeBtns.forEach(btn => {
    // Find image
    const card = btn.closest('.card, .hero-card');
    const img = card ? card.querySelector('img') : null;
    if (!img) return;

    const imgSrc = img.getAttribute('src');
    const filename = imgSrc.split('/').pop();
    const dbId = sanitizeId(filename); // e.g. supsaf1_jpg

    // Set initial visual state from LocalStorage
    if (myLikes.includes(filename)) {
      updateVisualState(btn, true);
    }

    // Listen to Firebase for global count
    const countRef = ref(db, 'likes/' + dbId);
    onValue(countRef, (snapshot) => {
      const count = snapshot.val() || 0;
      updateCountDisplay(btn, count);
      // Also update detail button if it's currently open on this image
      const expandedImg = document.getElementById('expanded-img');
      if (expandedImg && expandedImg.src.endsWith(filename)) {
        if (detailLikeBtn) updateCountDisplay(detailLikeBtn, count);
      }
    });

    // Handle Click
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();

      // Check current local state
      const currentMyLikes = JSON.parse(localStorage.getItem('supsafLikes')) || [];
      const isLiked = currentMyLikes.includes(filename);

      // Optimistic UI Update (Instant feedback)
      updateVisualState(btn, !isLiked);

      // Perform transaction
      runTransaction(countRef, (currentCount) => {
        // If null (doesn't exist), treat as 0
        const val = currentCount || 0;
        if (isLiked) {
          // Unlike: decrement
          return val > 0 ? val - 1 : 0;
        } else {
          // Like: increment
          return val + 1;
        }
      });

      // Update Local Storage
      if (isLiked) {
        // Remove
        const idx = currentMyLikes.indexOf(filename);
        if (idx !== -1) currentMyLikes.splice(idx, 1);
      } else {
        // Add
        currentMyLikes.push(filename);
      }
      localStorage.setItem('supsafLikes', JSON.stringify(currentMyLikes));
    });
  });

  // 2. Setup DETAIL view button
  if (detailLikeBtn) {
    const detailImg = document.getElementById('expanded-img');

    // Observer to handle switching images in the detail view
    const observer = new MutationObserver(() => {
      if (!detailImg.src) return;
      const filename = detailImg.src.split('/').pop();
      const dbId = sanitizeId(filename);

      // Sync visual state (Did I like this?)
      const currentMyLikes = JSON.parse(localStorage.getItem('supsafLikes')) || [];
      updateVisualState(detailLikeBtn, currentMyLikes.includes(filename));

      // Sync count (Fetch once or listen? Ideally listen, but we need to detach old listeners if we do that dynamically. 
      // Simpler for now: Fetch once, OR rely on the grid listener which runs in background?
      // Actually, easiest is just attach a NEW one-time fetch or subscribe. To avoid leak, use get() or careful subscribe.
      // Or simpler: The grid listeners are already active. Just grab the count from the DOM of the corresponding grid card!

      let gridBtn = null;
      document.querySelectorAll('.card img').forEach(img => {
        if (img.src.endsWith(filename)) {
          gridBtn = img.closest('.card').querySelector('.like-btn');
        }
      });

      if (gridBtn) {
        const countText = gridBtn.querySelector('.like-count')?.innerText || '0';
        updateCountDisplay(detailLikeBtn, parseInt(countText) || 0);
      }
    });
    observer.observe(detailImg, { attributes: true, attributeFilter: ['src'] });

    detailLikeBtn.addEventListener('click', () => {
      if (!detailImg.src) return;
      const filename = detailImg.src.split('/').pop();
      const dbId = sanitizeId(filename);
      const countRef = ref(db, 'likes/' + dbId);

      const currentMyLikes = JSON.parse(localStorage.getItem('supsafLikes')) || [];
      const isLiked = currentMyLikes.includes(filename);

      // Update UI locally
      updateVisualState(detailLikeBtn, !isLiked);

      // Update Grid UI as well to match
      document.querySelectorAll('.card img').forEach(img => {
        if (img.src.endsWith(filename)) {
          const b = img.closest('.card').querySelector('.like-btn');
          if (b) updateVisualState(b, !isLiked);
        }
      });

      // Firebase Transaction
      runTransaction(countRef, (cur) => {
        const val = cur || 0;
        return isLiked ? (val > 0 ? val - 1 : 0) : val + 1;
      });

      // Local Storage
      if (isLiked) {
        const idx = currentMyLikes.indexOf(filename);
        if (idx !== -1) currentMyLikes.splice(idx, 1);
      } else {
        currentMyLikes.push(filename);
      }
      localStorage.setItem('supsafLikes', JSON.stringify(currentMyLikes));
    });
  }
});


