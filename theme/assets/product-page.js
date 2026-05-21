/* ============================================================
   GLAMBRUSH — Product Page JS
   Cart interactions + Animations + Countdown
   ============================================================ */

'use strict';

/* ──────────────────────────────────────────
   1. Add To Cart
   ────────────────────────────────────────── */
async function addToCart(variantId, quantity = 1) {
  const buttons = document.querySelectorAll('[data-atc-btn]');

  buttons.forEach(btn => {
    btn.classList.add('loading');
    btn.disabled = true;
    btn.setAttribute('data-original', btn.innerHTML);
    btn.innerHTML = '';
  });

  try {
    const response = await fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: variantId, quantity })
    });

    if (!response.ok) throw new Error(`Cart error: ${response.status}`);

    const item = await response.json();

    buttons.forEach(btn => {
      btn.classList.remove('loading');
      btn.classList.add('success');
      btn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        Ajouté au panier !`;
    });

    updateCartCount();
    showToast('Produit ajouté à votre panier 🎉');

    setTimeout(() => {
      buttons.forEach(btn => {
        btn.classList.remove('success');
        btn.disabled = false;
        btn.innerHTML = btn.getAttribute('data-original') || 'Ajouter au panier →';
      });
    }, 2500);

  } catch (error) {
    buttons.forEach(btn => {
      btn.classList.remove('loading');
      btn.disabled = false;
      btn.innerHTML = btn.getAttribute('data-original') || 'Ajouter au panier →';
    });
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
    const badge = document.querySelector('[data-cart-count]');
    if (!badge) return;
    badge.textContent = count;
    badge.classList.toggle('visible', count > 0);
  } catch (e) {
    /* silent */
  }
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
  const el = document.querySelector('[data-countdown]');
  if (!el) return;

  function render() {
    const diff = endTime - Date.now();
    if (diff <= 0) {
      el.closest('[data-urgency-bar]')?.remove();
      return;
    }

    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    const hEl = el.querySelector('[data-h]');
    const mEl = el.querySelector('[data-m]');
    const sEl = el.querySelector('[data-s]');

    const pad = n => String(n).padStart(2, '0');

    if (hEl && hEl.textContent !== pad(h)) { hEl.textContent = pad(h); hEl.classList.add('countdown-tick'); setTimeout(() => hEl.classList.remove('countdown-tick'), 300); }
    if (mEl && mEl.textContent !== pad(m)) { mEl.textContent = pad(m); mEl.classList.add('countdown-tick'); setTimeout(() => mEl.classList.remove('countdown-tick'), 300); }
    if (sEl) { sEl.textContent = pad(s); }
  }

  render();
  setInterval(render, 1000);
}

/* Auto-init countdown from data attribute */
function initCountdown() {
  const el = document.querySelector('[data-countdown]');
  if (!el) return;
  const hours = parseInt(el.dataset.hours || 3, 10);
  const endTime = Date.now() + hours * 3600000;
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
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

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
      const src    = thumb.dataset.src;
      const srcset = thumb.dataset.srcset || '';
      const alt    = thumb.dataset.alt || '';

      const img = main.querySelector('img');
      if (img) {
        img.style.opacity = '0';
        img.style.transform = 'scale(0.97)';
        setTimeout(() => {
          img.src = src;
          if (srcset) img.srcset = srcset;
          img.alt = alt;
          img.style.opacity = '';
          img.style.transform = '';
        }, 200);
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

      /* Close all others */
      document.querySelectorAll('[data-faq-item].open').forEach(o => {
        if (o !== item) o.classList.remove('open');
      });

      item.classList.toggle('open', !isOpen);
      btn.setAttribute('aria-expanded', !isOpen);
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
  const fills = document.querySelectorAll('[data-stock-fill]');
  fills.forEach(fill => {
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
