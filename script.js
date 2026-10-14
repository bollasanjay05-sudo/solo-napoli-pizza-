
'use strict';

/* =============================================
   SOLO NAPOLI — WEBSITE JAVASCRIPT
   Change these settings before taking orders.
============================================= */

const CONFIG = {
  shopName: 'Solo Napoli',
  whatsappNumber: '',
  pickupAddress: '',
  openingHours: '',
  deliveryZone: '',
  deliveryFee: 2.90,
  freeDeliveryOver: 30.00,
  currency: 'EUR'
};

/* =============================================
   MENU PRODUCTS
============================================= */

const PRODUCTS = [
  {
    id: 'margherita',
    name: 'Margherita Love',
    description: 'Tomato sauce, mozzarella, fresh basil and extra love.',
    price: 9.90,
    category: 'Classic',
    tag: 'THE CLASSIC',
    image: 'assets/margherita.webp',
    pizza: true
  },
  {
    id: 'pepperoni',
    name: 'Pepperoni Pop',
    description: 'Rich tomato sauce, mozzarella and crispy pepperoni.',
    price: 11.90,
    category: 'Classic',
    tag: 'FAN FAVOURITE',
    image: 'assets/pepperoni.webp',
    pizza: true
  },
  {
    id: 'truffle',
    name: 'Truffle Shuffle',
    description: 'Creamy white sauce, mushrooms, truffle and mozzarella.',
    price: 13.90,
    category: 'Signature',
    tag: 'SOMETHING SPECIAL',
    image: 'assets/truffle.webp',
    pizza: true
  },
  {
    id: 'diavola',
    name: 'Diavola Fire',
    description: 'Spicy salami, chilli, tomato, mozzarella and a kick.',
    price: 12.90,
    category: 'Spicy',
    tag: 'HOT STUFF 🌶',
    image: 'assets/diavola.webp',
    pizza: true
  },
  {
    id: 'burrata',
    name: 'Burrata Bella',
    description: 'Pesto, creamy burrata, cherry tomatoes and basil.',
    price: 14.90,
    category: 'Signature',
    tag: 'HOUSE PICK',
    image: 'assets/burrata.webp',
    pizza: true
  },
  {
    id: 'bbq-chicken',
    name: 'BBQ Chicken',
    description: 'BBQ sauce, tender chicken, onions and mozzarella.',
    price: 12.90,
    category: 'Signature',
    tag: 'BOLD & SAUCY',
    image: 'assets/bbq-chicken.webp',
    pizza: true
  },
  {
    id: 'garlic',
    name: 'Garlic Bread',
    description: 'Golden bread, garlic butter, a little parsley.',
    price: 4.50,
    category: 'Sides',
    tag: 'ON THE SIDE',
    emoji: '🥖'
  },
  {
    id: 'fries',
    name: 'Crunchy Fries',
    description: 'A side of crispy golden fries, perfect for sharing.',
    price: 3.90,
    category: 'Sides',
    tag: 'CRUNCH TIME',
    emoji: '🍟'
  },
  {
    id: 'cola',
    name: 'Cola',
    description: 'A refreshing, chilled can.',
    price: 2.50,
    category: 'Drinks',
    tag: 'ICE COLD',
    emoji: '🥤'
  },
  {
    id: 'lemonade',
    name: 'Sparkling Lemonade',
    description: 'A fizzy little boost for your pizza moment.',
    price: 2.90,
    category: 'Drinks',
    tag: 'SO REFRESHING',
    emoji: '🍋'
  }
];

/* =============================================
   EXTRA TOPPINGS AND SIZES
============================================= */

const EXTRAS = [
  { id: 'cheese', name: 'Extra cheese', price: 1.50 },
  { id: 'mushrooms', name: 'Mushrooms', price: 1.20 },
  { id: 'jalapenos', name: 'Jalapeños', price: 1.00 },
  { id: 'dip', name: 'Garlic dip', price: 0.90 }
];

const SIZES = [
  { id: 'medium', name: 'Medium', hint: '28 cm', add: 0 },
  { id: 'large', name: 'Large', hint: '33 cm', add: 3.50 }
];

/* =============================================
   UTILITIES
============================================= */

const $ = id => document.getElementById(id);

const money = n =>
  new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: CONFIG.currency
  }).format(n);

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[ch]));
}

function loadCart() {
  try {
    const v = JSON.parse(
      localStorage.getItem('solo-napoli-cart') || '[]'
    );

    return Array.isArray(v)
      ? v.filter(x =>
          PRODUCTS.some(p => p.id === x.id) &&
          Number.isInteger(x.qty) &&
          x.qty > 0 &&
          x.qty <= 99
        )
      : [];
  } catch (e) {
    return [];
  }
}

let savedMode = 'pickup';

try {
  savedMode =
    localStorage.getItem('solo-napoli-mode') === 'delivery'
      ? 'delivery'
      : 'pickup';
} catch (e) {}

const state = {
  cart: loadCart(),
  mode: savedMode,
  category: 'All',
  search: '',
  current: null,
  size: 'medium',
  extras: [],
  qty: 1
};

function save() {
  try {
    localStorage.setItem(
      'solo-napoli-cart',
      JSON.stringify(state.cart)
    );
    localStorage.setItem('solo-napoli-mode', state.mode);
  } catch (e) {}
}

function itemById(id) {
  return PRODUCTS.find(p => p.id === id);
}

function icon(name) {
  return `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
}

/* =============================================
   RENDER PIZZA MENU
============================================= */

function renderMenu() {
  const filters = [
    'All', 'Classic', 'Signature',
    'Spicy', 'Sides', 'Drinks'
  ];

  $('filters').innerHTML = filters.map(f => `
    <button
      class="filter ${f === state.category ? 'active' : ''}"
      type="button"
      data-filter="${f}">
      ${f === 'All' ? '🍕 All' : f === 'Spicy' ? '🌶 Spicy' : f}
    </button>
  `).join('');

  const results = PRODUCTS.filter(p =>
    (state.category === 'All' || p.category === state.category) &&
    (`${p.name} ${p.description} ${p.category}`
      .toLowerCase().includes(state.search))
  );

  $('menuGrid').innerHTML = results.map((p, i) => `
    <article class="product reveal visible">
      <div class="product-media ${i % 3 === 1 ? 'alt' : ''}">
        <span class="product-tag ${p.category === 'Spicy' ? 'spicy' : ''}">
          ${escapeHTML(p.tag)}
        </span>
        ${
          p.image
            ? `<img src="${p.image}" alt="${escapeHTML(p.name)} pizza" loading="${i < 3 ? 'eager' : 'lazy'}">`
            : `<span role="img" aria-label="${escapeHTML(p.name)}" class="emoji">${p.emoji}</span>`
        }
      </div>
      <div class="product-body">
        <h3 class="product-title">${escapeHTML(p.name)}</h3>
        <p class="product-desc">${escapeHTML(p.description)}</p>
        <div class="product-foot">
          <span class="price">
            ${p.pizza ? '<small>from</small>' : ''}
            ${money(p.price)}
          </span>
          <button type="button"
            class="product-add"
            data-product="${p.id}"
            aria-label="Add ${escapeHTML(p.name)}">
            ${icon('plus')}
          </button>
        </div>
      </div>
    </article>
  `).join('');

  $('emptyResults').hidden = results.length > 0;
}

/* =============================================
   ANIMATED HERO PIZZA SELECTION
============================================= */

function initHeroSelector() {
  const featured = PRODUCTS.filter(p => p.pizza).slice(0, 4);
  const container = $('heroSelector');
  let selected = 'margherita';

  container.innerHTML = featured.map(p => `
    <button type="button"
      class="hero-thumb ${p.id === selected ? 'active' : ''}"
      data-hero="${p.id}"
      aria-label="Feature ${escapeHTML(p.name)}"
      aria-pressed="${p.id === selected}">
      <img src="${p.image}" alt="">
    </button>
  `).join('');

  container.addEventListener('click', e => {
    const b = e.target.closest('[data-hero]');
    if (!b || b.dataset.hero === selected) return;

    selected = b.dataset.hero;
    const product = itemById(selected);
    const main = document.querySelector('.hero-pizza');

    main.classList.remove('changing');
    void main.offsetWidth;
    main.classList.add('changing');

    setTimeout(() => {
      main.src = product.image;
    }, 210);

    setTimeout(() => {
      main.classList.remove('changing');
    }, 580);

    $('heroBadgeImg').src = product.image;
    $('heroBadgeName').textContent = product.name;
    $('heroBadgePrice').textContent =
      `From ${money(product.price)} ✦`;

    container.querySelectorAll('[data-hero]').forEach(btn => {
      btn.classList.toggle(
        'active',
        btn.dataset.hero === selected
      );
      btn.setAttribute(
        'aria-pressed',
        String(btn.dataset.hero === selected)
      );
    });
  });
}

/* =============================================
   PICKUP AND HOME DELIVERY
============================================= */

function setMode(mode) {
  if (!['pickup', 'delivery'].includes(mode)) return;

  state.mode = mode;
  save();

  document.querySelectorAll('[data-mode]').forEach(b => {
    b.classList.toggle('active', b.dataset.mode === mode);
    b.setAttribute(
      'aria-pressed',
      String(b.dataset.mode === mode)
    );
  });

  $('deliveryFields').hidden = mode !== 'delivery';
  $('deliveryAddress').required = mode === 'delivery';

  updateTotals();
}

/* =============================================
   DRAWERS AND PRODUCT MODAL
============================================= */

function openShade(type) {
  $('shade').classList.add('open');
  document.body.classList.add('no-scroll');

  if (type === 'cart') {
    $('cartDrawer').classList.add('open');
    $('cartDrawer').setAttribute('aria-hidden', 'false');

    setTimeout(() => {
      $('cartDrawer').querySelector('[data-close]').focus();
    }, 200);
  } else {
    $('productModal').classList.add('open');
    $('productModal').setAttribute('aria-hidden', 'false');

    setTimeout(() => {
      $('productModal').querySelector('[data-close]')?.focus();
    }, 130);
  }
}

function closeOverlays() {
  $('shade').classList.remove('open');
  $('cartDrawer').classList.remove('open');
  $('productModal').classList.remove('open');

  $('cartDrawer').setAttribute('aria-hidden', 'true');
  $('productModal').setAttribute('aria-hidden', 'true');

  document.body.classList.remove('no-scroll');
}

function openCart() {
  closeOverlays();
  renderCart();
  openShade('cart');
}

function openProduct(id) {
  const p = itemById(id);
  if (!p) return;

  state.current = p;
  state.size = 'medium';
  state.extras = [];
  state.qty = 1;

  renderProductModal();
  closeOverlays();
  openShade('product');
}

function renderProductModal() {
  const p = state.current;
  if (!p) return;

  const sizes = p.pizza
    ? `
      <div class="group-title">Choose your size</div>
      <div class="size-options">
        ${SIZES.map(s => `
          <button type="button"
            data-size="${s.id}"
            class="size-option ${state.size === s.id ? 'active' : ''}">
            <span>${s.name}<small>${s.hint}</small></span>
            <span>${s.add ? '+' + money(s.add) : 'Included'}</span>
          </button>
        `).join('')}
      </div>`
    : '';

  const extras = p.pizza
    ? `
      <div class="group-title">Make it yours</div>
      <div class="addons">
        ${EXTRAS.map(x => `
          <label class="addon">
            <input type="checkbox"
              data-extra="${x.id}"
              ${state.extras.includes(x.id) ? 'checked' : ''}>
            <span>${escapeHTML(x.name)}</span>
            <span>+${money(x.price)}</span>
          </label>
        `).join('')}
      </div>`
    : '';

  $('modalContent').innerHTML = `
    <div class="custom-top">
      <div class="custom-photo">
        ${
          p.image
            ? `<img src="${p.image}" alt="${escapeHTML(p.name)}">`
            : `<span class="emoji">${p.emoji}</span>`
        }
      </div>
      <div class="custom-body">
        <button type="button"
          class="close"
          data-close
          aria-label="Close item">
          ${icon('close')}
        </button>
        <span class="eyebrow">SOLO NAPOLI MENU</span>
        <h2>${escapeHTML(p.name)}</h2>
        <p>${escapeHTML(p.description)}</p>
        ${sizes}
        ${extras}
        <div class="group-title">Quantity</div>
        <div class="qty" style="display:inline-flex">
          <button type="button" data-modal-qty="-1"
            aria-label="Decrease quantity">−</button>
          <span>${state.qty}</span>
          <button type="button" data-modal-qty="1"
            aria-label="Increase quantity">+</button>
        </div>
      </div>
    </div>
    <div class="custom-bottom">
      <span class="price" id="modalPrice">${money(modalTotal())}</span>
      <button type="button"
        class="btn btn-primary"
        id="addToCart">
        Add to my bag ${icon('arrow')}
      </button>
    </div>
  `;
}

function modalUnit() {
  let sum = state.current.price;

  if (state.current.pizza) {
    sum += SIZES.find(s => s.id === state.size).add;

    sum += state.extras.reduce(
      (t, id) => t + (EXTRAS.find(e => e.id === id)?.price || 0),
      0
    );
  }

  return sum;
}

function modalTotal() {
  return modalUnit() * state.qty;
}

function updateModalPrice() {
  const el = $('modalPrice');
  if (el) el.textContent = money(modalTotal());
}

/* =============================================
   SHOPPING CART
============================================= */

function addToCart() {
  const p = state.current;
  if (!p) return;

  const extras = p.pizza ? [...state.extras].sort() : [];
  const size = p.pizza ? state.size : '';
  const key = [p.id, size, extras.join(',')].join('|');

  const row = state.cart.find(x => x.key === key);

  if (row) {
    row.qty = Math.min(99, row.qty + state.qty);
  } else {
    state.cart.push({
      key,
      id: p.id,
      size,
      extras,
      qty: state.qty
    });
  }

  save();
  closeOverlays();
  updateCartBadge();
  toast(`${p.name} added to your bag 🍕`);
}

function unitCost(row) {
  const p = itemById(row.id);
  if (!p) return 0;

  return p.price + (
    p.pizza
      ? (SIZES.find(s => s.id === row.size)?.add || 0)
        + (row.extras || []).reduce(
          (sum, id) =>
            sum + (EXTRAS.find(x => x.id === id)?.price || 0),
          0
        )
      : 0
  );
}

function subtotal() {
  return state.cart.reduce(
    (sum, x) => sum + unitCost(x) * x.qty,
    0
  );
}

function deliveryCost() {
  if (
    state.mode !== 'delivery' ||
    subtotal() >= CONFIG.freeDeliveryOver
  ) return 0;

  return CONFIG.deliveryFee;
}

function updateCartBadge() {
  const n = state.cart.reduce((s, x) => s + x.qty, 0);

  document.querySelectorAll('[data-cart-count]').forEach(el => {
    el.textContent = n;
  });
}

function updateTotals() {
  const s = subtotal();

  if ($('subtotal')) {
    $('subtotal').textContent = money(s);
  }

  if ($('deliveryFee')) {
    $('deliveryFee').textContent =
      state.mode === 'pickup'
        ? 'Not applicable'
        : deliveryCost() === 0
          ? 'Free'
          : money(deliveryCost());
  }

  if ($('total')) {
    $('total').textContent = money(s + deliveryCost());
  }

  if ($('deliveryInfo')) {
    $('deliveryInfo').textContent =
      state.mode === 'delivery'
        ? (
            deliveryCost() === 0
              ? 'Delivery fee waived for this order.'
              : `Sample fee: ${money(CONFIG.deliveryFee)}. Free delivery from ${money(CONFIG.freeDeliveryOver)}. Final availability and fee must be confirmed by the shop.`
          )
        : 'Collect your order at the pickup location, once the shop confirms it.';
  }
}

function renderCart() {
  const have = state.cart.length > 0;

  $('cartItems').innerHTML = have
    ? state.cart.map(row => {
        const p = itemById(row.id);

        const desc = [
          row.size
            ? SIZES.find(s => s.id === row.size)?.name
            : '',
          ...(row.extras || []).map(
            id => EXTRAS.find(e => e.id === id)?.name
          )
        ].filter(Boolean).join(' · ');

        return `
          <div class="cart-row">
            ${
              p.image
                ? `<img src="${p.image}" alt="">`
                : `<span class="emoji">${p.emoji}</span>`
            }
            <div class="info">
              <strong>${escapeHTML(p.name)}</strong>
              <small>${escapeHTML(desc)}</small>
              <b>${money(unitCost(row) * row.qty)}</b>
            </div>
            <div class="qty">
              <button type="button"
                data-qty-key="${row.key}"
                data-change="-1"
                aria-label="Remove one ${escapeHTML(p.name)}">
                −
              </button>
              <span>${row.qty}</span>
              <button type="button"
                data-qty-key="${row.key}"
                data-change="1"
                aria-label="Add one ${escapeHTML(p.name)}">
                +
              </button>
            </div>
          </div>
        `;
      }).join('')
    : `
      <div class="empty-cart">
        <div class="pizza-emoji">🍕</div>
        <h3>Something's missing...</h3>
        <p>Your bag is feeling lonely.<br>
        Add your favourite pizza from the menu!</p>
        <button class="btn btn-primary"
          type="button" id="browseMenu">
          Browse pizzas ${icon('arrow')}
        </button>
      </div>
    `;

  $('checkoutDetails').hidden = !have;
  $('checkoutBtn').disabled = !have;

  $('checkoutBtn').textContent = !have
    ? 'Your bag is empty'
    : CONFIG.whatsappNumber
      ? 'Send order on WhatsApp →'
      : 'Copy order to place it →';

  $('checkoutHint').textContent = !have
    ? 'Add something tasty to get started.'
    : CONFIG.whatsappNumber
      ? 'Your order opens in WhatsApp for the shop to confirm. No payment is taken here.'
      : 'The shop WhatsApp number is not set up yet. You can copy your order and send it manually.';

  $('copyOrder').hidden = !have || !CONFIG.whatsappNumber;

  setMode(state.mode);
  updateCartBadge();
}

function changeQty(key, delta) {
  const row = state.cart.find(x => x.key === key);
  if (!row) return;

  row.qty += delta;

  if (row.qty <= 0) {
    state.cart = state.cart.filter(x => x.key !== key);
  } else {
    row.qty = Math.min(row.qty, 99);
  }

  save();
  renderCart();
}

/* =============================================
   BUILD WHATSAPP ORDER
============================================= */

function getOrderText() {
  if (state.cart.length === 0) {
    throw Error('Your bag is empty.');
  }

  const name = $('customerName').value.trim();
  const phone = $('customerPhone').value.trim();
  const address = $('deliveryAddress').value.trim();

  if (!name || !phone) {
    if (!name) $('customerName').focus();
    else $('customerPhone').focus();

    throw Error('Please enter your name and phone number.');
  }

  if (state.mode === 'delivery' && !address) {
    $('deliveryAddress').focus();
    throw Error('Please enter your delivery address.');
  }

  const scheduled = $('orderTime').value === 'Scheduled';
  const when = $('scheduledAt').value;

  if (scheduled && !when) {
    $('scheduledAt').focus();
    throw Error('Please choose a requested date and time.');
  }

  if (scheduled && new Date(when) <= new Date()) {
    throw Error('Please choose a future time.');
  }

  const lines = [
    `🍕 *NEW ORDER REQUEST — ${CONFIG.shopName.toUpperCase()}*`,
    '',
    `*Method:* ${state.mode === 'pickup' ? 'Self pickup' : 'Home delivery'}`,
    `*Name:* ${name}`,
    `*Phone:* ${phone}`
  ];

  if (state.mode === 'delivery') {
    lines.push(`*Address:* ${address}`);
  }

  lines.push(
    `*Requested:* ${
      scheduled
        ? new Date(when).toLocaleString('en-GB')
        : 'As soon as available'
    }`,
    '',
    '*Items:*'
  );

  for (const row of state.cart) {
    const p = itemById(row.id);

    const extra = (row.extras || [])
      .map(id => EXTRAS.find(x => x.id === id)?.name)
      .filter(Boolean);

    lines.push(
      `• ${row.qty} × ${p.name}${
        row.size
          ? ' (' + SIZES.find(s => s.id === row.size)?.name + ')'
          : ''
      } — ${money(unitCost(row) * row.qty)}`
    );

    if (extra.length) {
      lines.push(`  Extras: ${extra.join(', ')}`);
    }
  }

  lines.push(
    '',
    `Subtotal: ${money(subtotal())}`,
    `Delivery: ${
      state.mode === 'pickup'
        ? 'Pickup'
        : money(deliveryCost())
    }`,
    `*Total estimate: ${money(subtotal() + deliveryCost())}*`
  );

  const note = $('orderNote').value.trim();

  if (note) {
    lines.push(`Notes: ${note}`);
  }

  lines.push(
    '',
    'Please confirm availability, preparation time, delivery and final total. Thank you!'
  );

  return lines.join('\n');
}

async function copyOrder() {
  try {
    const t = getOrderText();

    try {
      await navigator.clipboard.writeText(t);
    } catch (e) {
      const inp = document.createElement('textarea');
      inp.value = t;
      document.body.appendChild(inp);
      inp.select();

      if (!document.execCommand('copy')) {
        throw Error('Copy failed');
      }

      inp.remove();
    }

    toast('Order copied! Send it to the shop to request confirmation.');
  } catch (e) {
    toast(e.message);
  }
}

function submitOrder() {
  try {
    const t = getOrderText();

    if (CONFIG.whatsappNumber) {
      const number = CONFIG.whatsappNumber.replace(/\D/g, '');

      if (number.length < 8) {
        throw Error('Shop WhatsApp number is not set up correctly.');
      }

      const url =
        `https://wa.me/${number}?text=${encodeURIComponent(t)}`;

      window.open(url, '_blank', 'noopener,noreferrer');

      toast('WhatsApp opened — press Send to request your order.');
    } else {
      copyOrder();
    }
  } catch (e) {
    toast(e.message);
  }
}

/* =============================================
   TOAST MESSAGES
============================================= */

let toastTimer;

function toast(msg) {
  const el = $('toast');
  el.textContent = msg;
  el.classList.add('show');

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    el.classList.remove('show');
  }, 3700);
}

/* =============================================
   SHOP INFORMATION
============================================= */

function setupShop() {
  if (CONFIG.pickupAddress) {
    $('shopAddress').textContent =
      `Pickup: ${CONFIG.pickupAddress}`;
  }

  if (CONFIG.openingHours) {
    $('shopHours').textContent =
      `Hours: ${CONFIG.openingHours}`;
  }

  if (CONFIG.whatsappNumber) {
    $('shopContact').textContent =
      `WhatsApp: +${CONFIG.whatsappNumber.replace(/^\+/, '')}`;
  }

  if (CONFIG.deliveryZone) {
    $('deliveryZoneHint').textContent =
      `Delivery area: ${CONFIG.deliveryZone}. The shop confirms final availability.`;
  }

  $('year').textContent = new Date().getFullYear();
}

/* =============================================
   MENU SEARCH
============================================= */

function changeSearch(value) {
  state.search = value.trim().toLowerCase();
  $('desktopSearch').value = value;
  $('mobileSearch').value = value;
  renderMenu();
}

/* =============================================
   SOLO NAPOLI LOGO INTRO ANIMATION
============================================= */

function initIntro() {
  const intro = $('intro');

  const dismiss = () => {
    intro.classList.add('dismissed');

    setTimeout(() => {
      intro.setAttribute('aria-hidden', 'true');
    }, 550);
  };

  let timer;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    dismiss();
  } else {
    timer = setTimeout(dismiss, 4900);
  }

  $('skipIntro').addEventListener('click', () => {
    clearTimeout(timer);
    dismiss();
  });

  $('replayIntro').addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    intro.setAttribute('aria-hidden', 'false');
    intro.classList.remove('dismissed');
    intro.style.animation = 'none';

    const scene = intro.querySelector('.intro-scene');
    const title = intro.querySelector('.intro-name');

    const newScene = scene.cloneNode(true);
    const newTitle = title.cloneNode(true);

    scene.replaceWith(newScene);
    title.replaceWith(newTitle);

    clearTimeout(timer);
    timer = setTimeout(dismiss, 4900);
  });
}

/* =============================================
   WEBSITE INITIALIZATION
============================================= */

function init() {
  setupShop();
  renderMenu();
  renderCart();
  initHeroSelector();
  initIntro();

  document.querySelectorAll('[data-mode]').forEach(b =>
    b.addEventListener('click', () => setMode(b.dataset.mode))
  );

  $('openCart').addEventListener('click', openCart);
  $('mobileOrder').addEventListener('click', openCart);

  $('shade').addEventListener('click', closeOverlays);

  document.querySelectorAll('[data-close]').forEach(b =>
    b.addEventListener('click', closeOverlays)
  );

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeOverlays();
  });

  $('desktopSearch').addEventListener('input', e =>
    changeSearch(e.target.value)
  );

  $('mobileSearch').addEventListener('input', e =>
    changeSearch(e.target.value)
  );

  $('filters').addEventListener('click', e => {
    const b = e.target.closest('[data-filter]');
    if (!b) return;

    state.category = b.dataset.filter;
    renderMenu();
  });

  $('menuGrid').addEventListener('click', e => {
    const b = e.target.closest('[data-product]');

    if (b) {
      openProduct(b.dataset.product);
    }
  });

  $('modalContent').addEventListener('click', e => {
    const close = e.target.closest('[data-close]');

    if (close) {
      closeOverlays();
      return;
    }

    const size = e.target.closest('[data-size]');

    if (size) {
      state.size = size.dataset.size;
      renderProductModal();
      return;
    }

    const qty = e.target.closest('[data-modal-qty]');

    if (qty) {
      state.qty = Math.min(
        99,
        Math.max(1, state.qty + Number(qty.dataset.modalQty))
      );

      renderProductModal();
      return;
    }

    if (e.target.closest('#addToCart')) {
      addToCart();
    }
  });

  $('modalContent').addEventListener('change', e => {
    const id = e.target.dataset.extra;
    if (!id) return;

    if (e.target.checked) {
      if (!state.extras.includes(id)) {
        state.extras.push(id);
      }
    } else {
      state.extras = state.extras.filter(x => x !== id);
    }

    updateModalPrice();
  });

  $('cartItems').addEventListener('click', e => {
    const qty = e.target.closest('[data-qty-key]');

    if (qty) {
      changeQty(
        qty.dataset.qtyKey,
        Number(qty.dataset.change)
      );
      return;
    }

    if (e.target.closest('#browseMenu')) {
      closeOverlays();

      $('menu').scrollIntoView({
        behavior: 'smooth'
      });
    }
  });

  $('checkoutBtn').addEventListener('click', submitOrder);
  $('copyOrder').addEventListener('click', copyOrder);

  $('orderTime').addEventListener('change', e => {
    $('scheduledField').hidden =
      e.target.value !== 'Scheduled';
  });

  document.querySelectorAll('.mobile-dock a').forEach(a =>
    a.addEventListener('click', () => {
      document.querySelectorAll('.mobile-dock a').forEach(x =>
        x.classList.remove('selected')
      );

      a.classList.add('selected');
    })
  );

  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver(
      items => items.forEach(item => {
        if (item.isIntersecting) {
          item.target.classList.add('visible');
          obs.unobserve(item.target);
        }
      }),
      { threshold: 0.12 }
    );

    document.querySelectorAll('.reveal').forEach(x =>
      obs.observe(x)
    );
  } else {
    document.querySelectorAll('.reveal').forEach(x =>
      x.classList.add('visible')
    );
  }
}

init();
