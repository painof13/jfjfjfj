'use strict';

/* ──────────────────────────────────────────
   1. Add To Cart
   ────────────────────────────────────────── */
async function addToCart(variantId, quantity = 1) {
  if (!variantId) {
    window.location.href = '/cart';
    return;
  }

  const buttons = document.querySelectorAll('[data-atc-btn]');

  buttons.forEach(btn => {
    btn.classList.add('loading');
    btn.disabled = true;
    btn.setAttribute('data-original', btn.innerHTML);
    btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation:spin .7s linear infinite"><path d="M12 2a10 10 0 0 1 10 10"/></svg>';
  });

  try {
    const response = await fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: parseInt(variantId, 10), quantity })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.description || `Cart error ${response.status}`);
    }

    await response.json();

    buttons.forEach(btn => {
      btn.classList.remove('loading');
      btn.classList.add('success');
      btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Ajouté !`;
    });

    updateCartCount();

    /* Redirect to checkout for best conversion on single-product stores */
    setTimeout(() => {
      window.location.href = '/checkout';
    }, 800);

  } catch (error) {
    buttons.forEach(btn => {
      btn.classList.remove('loading');
      btn.disabled = false;
      btn.innerHTML = btn.getAttribute('data-original') || 'Ajouter au panier →';
    });
    showToast('Erreur : ' + error.message);
    console.error('Cart error:', error);
  }
}

/* ──────────────────────────────────────────
   2. Cart Count
   ────────────────────────────────────────── */
async function updateCartCount() {
  try {
    const res = await fetch('/cart.js');
    const cart = await res.json();
    const count = cart.item_count;
    document.querySelectorAll('[data-cart-count]').forEach(badge => {
      badge.textContent = count > 0 ? count : '';
      badge.classList.toggle('visible', count > 0);
    });
  } catch (e) { /* silent */ }
}

/* ──────────────────────────────────────────
   3. Sticky ATC
   ────────────────────────────────────────── */
function initStickyATC() {
  const bar = document.querySelector('[data-sticky-atc]');
  if (!bar) return;
  const threshold = parseInt(bar.dataset.threshold || 600, 10);
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    window.requestAnimationFrame(() => {
      bar.classList.toggle('visible', window.scrollY > threshold);
      ticking = false;
    });
    ticking = true;
  }, { passive: true });
}

/* ──────────────────────────────────────────
   4. Countdown Timer
   ────────────────────────────────────────── */
function startCountdown(endTime) {
  const hEl = document.querySelector('[data-h]');
  const mEl = document.querySelector('[data-m]');
  const sEl = document.querySelector('[data-s]');
  if (!hEl && !mEl && !sEl) return;

  const pad = n => String(n).padStart(2, '0');

  function render() {
    const diff = endTime - Date.now();
    if (diff <= 0) {
      document.querySelector('[data-urgency-bar]')?.remove();
      return;
    }
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    if (hEl && hEl.textContent !== pad(h)) {
      hEl.textContent = pad(h);
      hEl.classList.add('countdown-tick');
      setTimeout(() => hEl.classList.remove('countdown-tick'), 300);
    }
    if (mEl && mEl.textContent !== pad(m)) {
      mEl.textContent = pad(m);
      mEl.classList.add('countdown-tick');
      setTimeout(() => mEl.classList.remove('countdown-tick'), 300);
    }
    if (sEl) sEl.textContent = pad(s);
  }

  render();
  setInterval(render, 1000);
}

function initCountdown() {
  const el = document.querySelector('[data-countdown]');
  if (!el) return;
  const hours = parseInt(el.dataset.hours || 3, 10);

  /* Persist end time in sessionStorage so refresh doesn't reset the clock */
  const key = 'gb_countdown_end';
  let endTime = parseInt(sessionStorage.getItem(key) || '0', 10);
  if (!endTime || endTime < Date.now()) {
    endTime = Date.now() + hours * 3600000;
    sessionStorage.setItem(key, endTime);
  }
  startCountdown(endTime);
}

/* ──────────────────────────────────────────
   5. Scroll Reveal (IntersectionObserver)
   ────────────────────────────────────────── */
function initReveal() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('revealed'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
  document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
}

/* ──────────────────────────────────────────
   6. Gallery
   ────────────────────────────────────────── */
function initGallery() {
  const thumbs = document.querySelectorAll('[data-gallery-thumb]');
  const main   = document.querySelector('[data-gallery-main]');
  if (!thumbs.length || !main) return;
  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      const img = main.querySelector('img');
      if (img) {
        img.style.opacity = '0';
        img.style.transform = 'scale(0.97)';
        setTimeout(() => {
          img.src = thumb.dataset.src;
          if (thumb.dataset.srcset) img.srcset = thumb.dataset.srcset;
          img.alt = thumb.dataset.alt || '';
          img.style.opacity = '';
          img.style.transform = '';
        }, 180);
      }
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  });
}

/* ──────────────────────────────────────────
   7. FAQ Accordion
   ────────────────────────────────────────── */
function initFAQ() {
  document.querySelectorAll('[data-faq-item]').forEach(item => {
    const btn = item.querySelector('[data-faq-question]');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('[data-faq-item].open').forEach(o => {
        if (o !== item) {
          o.classList.remove('open');
          o.querySelector('[data-faq-question]')?.setAttribute('aria-expanded', 'false');
        }
      });
      item.classList.toggle('open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });
}

/* ──────────────────────────────────────────
   8. Header scroll state
   ────────────────────────────────────────── */
function initHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });
}

/* ──────────────────────────────────────────
   9. Toast Notification
   ────────────────────────────────────────── */
function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <div class="toast__icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <span class="toast__msg"></span>`;
    document.body.appendChild(toast);
  }
  toast.querySelector('.toast__msg').textContent = message;
  toast.classList.remove('hide');
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('hide');
  }, 3000);
}

/* ──────────────────────────────────────────
   10. Stock bar animation
   ────────────────────────────────────────── */
function initStockBar() {
  document.querySelectorAll('[data-stock-fill]').forEach(fill => {
    const pct = fill.dataset.stockFill || '25';
    setTimeout(() => { fill.style.width = pct + '%'; }, 400);
  });
}

/* ──────────────────────────────────────────
   11. Rating bars animation
   ────────────────────────────────────────── */
function initRatingBars() {
  if (!('IntersectionObserver' in window)) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('[data-rating-fill]').forEach(bar => {
        bar.style.width = bar.dataset.ratingFill + '%';
      });
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.rating-overview').forEach(el => obs.observe(el));
}

/* ──────────────────────────────────────────
   12. Init all
   ────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initStickyATC();
  initCountdown();
  initReveal();
  initGallery();
  initFAQ();
  initStockBar();
  initRatingBars();
  updateCartCount();
});
