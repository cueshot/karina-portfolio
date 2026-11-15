/* ==========================================================================
   Karina — shared script
   Loaded as a plain (non-deferred) script in <head> on every page, so the
   line below runs before first paint. Everything else waits for the DOM.
   Page-specific features only run when their elements exist; scroll-reveal
   settings are keyed by the <body> page class (page-home, page-gallery,
   page-about, page-contact).
   ========================================================================== */

// Lets CSS hide .reveal elements before the first paint (see style.css).
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {

// ─────────────────────────────────────────────────
// Mobile nav
// ─────────────────────────────────────────────────
(function initNav() {
  const toggle = document.getElementById('navToggle');
  const links  = document.getElementById('navLinks');
  if (!toggle || !links) return;

  function closeNav() {
    links.classList.remove('open');
    toggle.classList.remove('open');
  }

  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
    toggle.classList.toggle('open');
  });

  links.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));

  document.addEventListener('click', (e) => {
    if (links.classList.contains('open') &&
        !links.contains(e.target) &&
        !toggle.contains(e.target)) {
      closeNav();
    }
  });
}());

// ─────────────────────────────────────────────────
// Gallery page: masonry grid + lightbox
// ─────────────────────────────────────────────────
(function initGallery() {
  const grid = document.getElementById('masonryGrid');
  if (!grid) return;

  // Photo data — picsum.photos with stable seeds
  // thumb: shown in masonry grid
  // full:  shown in lightbox
  const photos = [
    { thumb: 'https://picsum.photos/seed/kr01/660/990',  full: 'https://picsum.photos/seed/kr01/1320/1980' },  // 2:3
    { thumb: 'https://picsum.photos/seed/kr02/660/440',  full: 'https://picsum.photos/seed/kr02/1320/880'  },  // 3:2
    { thumb: 'https://picsum.photos/seed/kr03/660/825',  full: 'https://picsum.photos/seed/kr03/1320/1650' },  // 4:5
    { thumb: 'https://picsum.photos/seed/kr04/660/495',  full: 'https://picsum.photos/seed/kr04/1320/990'  },  // 4:3
    { thumb: 'https://picsum.photos/seed/kr05/660/940',  full: 'https://picsum.photos/seed/kr05/1320/1880' },  // tall portrait
    { thumb: 'https://picsum.photos/seed/kr06/660/660',  full: 'https://picsum.photos/seed/kr06/1320/1320' },  // 1:1
    { thumb: 'https://picsum.photos/seed/kr07/660/440',  full: 'https://picsum.photos/seed/kr07/1320/880'  },  // 3:2
    { thumb: 'https://picsum.photos/seed/kr08/660/990',  full: 'https://picsum.photos/seed/kr08/1320/1980' },  // 2:3
    { thumb: 'https://picsum.photos/seed/kr09/660/550',  full: 'https://picsum.photos/seed/kr09/1320/1100' },  // 6:5
    { thumb: 'https://picsum.photos/seed/kr10/660/825',  full: 'https://picsum.photos/seed/kr10/1320/1650' },  // 4:5
    { thumb: 'https://picsum.photos/seed/kr11/660/440',  full: 'https://picsum.photos/seed/kr11/1320/880'  },  // 3:2
    { thumb: 'https://picsum.photos/seed/kr12/660/940',  full: 'https://picsum.photos/seed/kr12/1320/1880' },  // tall portrait
  ];

  const lightbox  = document.getElementById('lightbox');
  const lbImg     = document.getElementById('lbImg');
  const lbCounter = document.getElementById('lbCounter');
  const lbClose   = document.getElementById('lbClose');
  const lbPrev    = document.getElementById('lbPrev');
  const lbNext    = document.getElementById('lbNext');

  let current   = 0;
  let animating = false;

  // Build masonry grid
  photos.forEach((photo, i) => {
    const item = document.createElement('div');
    item.className = 'masonry-item reveal';
    item.tabIndex = 0;
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', `Open photo ${i + 1} of ${photos.length}`);

    item.innerHTML = `
      <img src="${photo.thumb}" alt="Wedding photo ${i + 1}" loading="lazy">
      <div class="masonry-item-overlay">
        <svg class="expand-icon" width="44" height="44" viewBox="0 0 44 44"
             fill="none" stroke="white" stroke-width="0.8">
          <circle cx="22" cy="22" r="20"/>
          <line x1="15" y1="22" x2="29" y2="22"/>
          <line x1="22" y1="15" x2="22" y2="29"/>
        </svg>
      </div>`;

    item.addEventListener('click',   () => openLightbox(i));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
    });

    grid.appendChild(item);
  });

  function openLightbox(index) {
    current = index;
    lbImg.src = photos[index].full;
    lbImg.alt = `Wedding photo ${index + 1}`;
    updateCounter();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    // allow paint, then fade image in
    requestAnimationFrame(() => requestAnimationFrame(() => lbImg.classList.add('lb-visible')));
    lbClose.focus();
  }

  function closeLightbox() {
    lbImg.classList.remove('lb-visible');
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function navigate(dir) {
    if (animating) return;
    animating = true;

    lbImg.classList.remove('lb-visible');

    setTimeout(() => {
      current = (current + dir + photos.length) % photos.length;
      lbImg.src = photos[current].full;
      lbImg.alt = `Wedding photo ${current + 1}`;
      updateCounter();
      requestAnimationFrame(() => requestAnimationFrame(() => {
        lbImg.classList.add('lb-visible');
        animating = false;
      }));
    }, 260);
  }

  function updateCounter() {
    lbCounter.textContent = `${current + 1} / ${photos.length}`;
  }

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click',  () => navigate(-1));
  lbNext.addEventListener('click',  () => navigate(1));

  // click backdrop to close
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  });

  // touch / swipe support
  let touchX = 0;
  lightbox.addEventListener('touchstart', (e) => { touchX = e.changedTouches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend',   (e) => {
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 48) navigate(dx < 0 ? 1 : -1);
  });
}());

// ─────────────────────────────────────────────────
// Contact page: form submit
// ─────────────────────────────────────────────────
(function initContactForm() {
  const form     = document.getElementById('contactForm');
  const thankYou = document.getElementById('thankYou');
  if (!form || !thankYou) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    form.style.opacity = '0';
    form.style.pointerEvents = 'none';
    setTimeout(() => {
      form.style.display = 'none';
      thankYou.classList.add('visible');
    }, 380);
  });
}());

// ─────────────────────────────────────────────────
// Scroll reveal
// Targets are marked with class="reveal" in the HTML (masonry items get it
// when built above). Runs after the gallery grid is built.
// ─────────────────────────────────────────────────
(function initScrollReveal() {
  const REVEAL_CONFIG = {
    'page-home': {
      stagger:   { parent: '.gallery-grid', children: '.gallery-item', delay: i => i * 0.12 },
      threshold: 0.12,
    },
    'page-gallery': {
      stagger:   { parent: '.masonry-grid', children: '.masonry-item', delay: i => (i % 3) * 0.1 },
      threshold: 0.08,
    },
    'page-about': {
      stagger:   { parent: '.bio-text', children: 'p', delay: i => i * 0.14 },
      threshold: 0.12,
    },
    'page-contact': {
      stagger:   { parent: '.contact-wrap', children: '.field, .submit-btn', delay: i => i * 0.1 },
      threshold: 0.12,
    },
  };

  const els = [...document.querySelectorAll('.reveal')];
  if (!els.length) return;

  const page = Object.keys(REVEAL_CONFIG).find(cls => document.body.classList.contains(cls));
  const { stagger, threshold } = REVEAL_CONFIG[page] || { stagger: null, threshold: 0.12 };

  if (stagger) document.querySelectorAll(stagger.parent).forEach(parent => {
    parent.querySelectorAll(stagger.children).forEach((el, i) => {
      el.style.transitionDelay = `${stagger.delay(i)}s`;
    });
  });

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); }
    });
  }, { threshold });

  els.forEach(el => io.observe(el));
}());

// ─────────────────────────────────────────────────
// Scroll to top
// ─────────────────────────────────────────────────
(function initScrollTop() {
  const btn = document.getElementById('scrollTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}());

}); // DOMContentLoaded
