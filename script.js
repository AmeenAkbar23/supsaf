document.addEventListener('DOMContentLoaded', () => {
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

    // Determine current category from hash (optional: search within category? 
    // Usually search implies global search. Let's do global search.)
    // Visual update: clear active filter links since we are in "search mode"
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
    // Prevent form submit on Enter if wrapped in form (it's not, but good practice)
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        performSearch();
        searchInput.blur(); // hide keyboard on mobile
      }
    });
  }

  if (searchBtn) {
    searchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      performSearch();
    });
  }
});
