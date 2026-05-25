/* GlamBrush Custom JS — Apple-style Cart Drawer + Pack Selector + Scroll Animations */
(function () {
  'use strict';

  /* ── Scroll Reveal ── */
  var ro = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('gb-visible'); ro.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -32px 0px' });

  function initReveal() {
    document.querySelectorAll('.gb-reveal').forEach(function (el) { ro.observe(el); });
  }

  /* ── Helpers ── */
  function money(cents) {
    return (cents / 100).toFixed(2).replace('.', ',') + ' €';
  }

  /* ── Cart Drawer ── */
  var cartEl = document.getElementById('gb-cart');
  var overlayEl = document.getElementById('gb-overlay');
  var itemsEl = document.getElementById('gb-items');
  var subtotalEl = document.getElementById('gb-subtotal-price');
  var checkoutBtn = document.getElementById('gb-checkout-btn');
  var countEl = document.getElementById('gb-cart-count');
  var shipFill = document.getElementById('gb-ship-fill');
  var shipLabel = document.getElementById('gb-ship-label');

  function openCart() {
    if (!cartEl) return;
    refreshCart();
    cartEl.classList.add('is-open');
    if (overlayEl) overlayEl.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    if (!cartEl) return;
    cartEl.classList.remove('is-open');
    if (overlayEl) overlayEl.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  window.openGbCart = openCart;
  window.closeGbCart = closeCart;

  async function refreshCart() {
    try {
      var res = await fetch('/cart.js');
      var data = await res.json();
      renderItems(data);
      updateShipping(data.total_price / 100);
      if (subtotalEl) subtotalEl.textContent = money(data.total_price);
      if (checkoutBtn) checkoutBtn.textContent = 'Commander — ' + money(data.total_price);
      if (countEl) { countEl.textContent = data.item_count; countEl.style.display = data.item_count > 0 ? '' : 'none'; }
    } catch (e) {}
  }

  function updateShipping(euros) {
    var thr = 30;
    var pct = Math.min((euros / thr) * 100, 100);
    if (shipFill) shipFill.style.width = pct + '%';
    if (shipLabel) {
      shipLabel.textContent = euros >= thr
        ? '🎉 Livraison gratuite débloquée !'
        : 'Plus que ' + (thr - euros).toFixed(2).replace('.', ',') + ' € pour la livraison gratuite';
    }
  }

  function lineHTML(item) {
    var img = item.image
      ? '<img class="gb-line__img" src="' + item.image.replace('http:', 'https:') + '" alt="" loading="lazy">'
      : '<div class="gb-line__ph">🛍️</div>';
    var vt = (item.variant_title && item.variant_title !== 'Default Title')
      ? '<div class="gb-line__variant">' + item.variant_title + '</div>' : '';
    return '<div class="gb-line">' + img +
      '<div class="gb-line__body">' +
        '<div class="gb-line__title">' + item.product_title + '</div>' + vt +
        '<div class="gb-line__row">' +
          '<div class="gb-qty">' +
            '<button onclick="gbQty(\'' + item.key + '\',' + (item.quantity - 1) + ')" aria-label="Diminuer">−</button>' +
            '<span class="gb-qty__n">' + item.quantity + '</span>' +
            '<button onclick="gbQty(\'' + item.key + '\',' + (item.quantity + 1) + ')" aria-label="Augmenter">+</button>' +
          '</div>' +
          '<span class="gb-line__price">' + money(item.line_price) + '</span>' +
          '<button class="gb-rm" onclick="gbQty(\'' + item.key + '\',0)" aria-label="Supprimer">✕</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function renderItems(data) {
    if (!itemsEl) return;
    if (data.item_count === 0) {
      itemsEl.innerHTML = '<div class="gb-cart__empty"><div class="gb-cart__empty-icon">🛒</div>' +
        '<p>Votre panier est vide</p>' +
        '<a href="/collections/all" onclick="closeGbCart()">Continuer mes achats →</a></div>';
    } else {
      itemsEl.innerHTML = data.items.map(lineHTML).join('');
    }
  }

  window.gbQty = async function (key, qty) {
    try {
      await fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: key, quantity: qty })
      });
    } catch (e) {}
    refreshCart();
  };

  /* ── Pack Selector ── */
  window._gbVariant = '53957693014358';

  window.gbPickPack = function (card, variantId) {
    document.querySelectorAll('.gb-pack-card').forEach(function (c) { c.classList.remove('is-active'); });
    card.classList.add('is-active');
    window._gbVariant = variantId;
  };

  window.gbAddPack = async function () {
    var btn = document.getElementById('gb-pack-atc-btn');
    var orig = btn ? btn.textContent : '';
    if (btn) { btn.textContent = '⏳ Ajout en cours…'; btn.disabled = true; }
    try {
      await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: parseInt(window._gbVariant, 10), quantity: 1 })
      });
    } catch (e) {}
    if (btn) {
      btn.textContent = '✓ Ajouté !';
      setTimeout(function () { btn.textContent = orig; btn.disabled = false; }, 2000);
    }
    openCart();
  };

  /* ── Override global addToCart ── */
  window.addToCart = async function (variantId, quantity) {
    if (!variantId) { openCart(); return; }
    var btn = document.querySelector('[data-atc-btn]');
    var orig = btn ? (btn.getAttribute('data-orig') || btn.textContent.trim()) : '';
    if (btn) { btn.textContent = '⏳ Ajout…'; btn.disabled = true; }
    try {
      await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: parseInt(variantId, 10), quantity: quantity || 1 })
      });
    } catch (e) {}
    if (btn) {
      btn.textContent = '✓ Ajouté !';
      setTimeout(function () { btn.textContent = orig; btn.disabled = false; }, 1800);
    }
    openCart();
  };

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', function () {
    initReveal();
    if (overlayEl) overlayEl.addEventListener('click', closeCart);

    document.querySelectorAll('[data-atc-btn]').forEach(function (btn) {
      btn.setAttribute('data-orig', btn.textContent.trim());
    });

    // Intercept header cart links
    document.querySelectorAll('a[href="/cart"]').forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); openCart(); });
    });

    // Initial shipping bar state
    updateShipping(0);
  });
})();
