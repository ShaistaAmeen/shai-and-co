// ============================================================
// API helper
// ============================================================
async function api(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong.');
  return data;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : str;
  return div.innerHTML;
}

function formatMoney(n) {
  return `$${Number(n).toFixed(2)}`;
}

function starString(rating) {
  const safe = Number(rating) || 0;
  const full = Math.round(safe);
  return '★★★★★'.slice(0, full) + '☆☆☆☆☆'.slice(0, 5 - full);
}

// ============================================================
// Toast notifications
// ============================================================
function ensureToastStack() {
  let stack = document.querySelector('.toast-stack');
  if (!stack) {
    stack = document.createElement('div');
    stack.className = 'toast-stack';
    document.body.appendChild(stack);
  }
  return stack;
}

function toast(message, type = 'default') {
  const stack = ensureToastStack();
  const el = document.createElement('div');
  el.className = `toast ${type === 'error' ? 'toast-error' : type === 'success' ? 'toast-success' : ''}`;
  el.textContent = message;
  stack.appendChild(el);
  setTimeout(() => {
    el.classList.add('leaving');
    setTimeout(() => el.remove(), 320);
  }, 3200);
}

// ============================================================
// Auth state (cached per page load)
// ============================================================
let _currentUser = undefined;
async function getCurrentUser() {
  if (_currentUser !== undefined) return _currentUser;
  try {
    const data = await api('/auth/me');
    _currentUser = data.user;
  } catch {
    _currentUser = null;
  }
  return _currentUser;
}

async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = `/login.html?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    return null;
  }
  return user;
}

async function handleLogout(e) {
  if (e) e.preventDefault();
  try { await api('/auth/logout', { method: 'POST' }); } catch {}
  _currentUser = null;
  toast('Logged out.');
  setTimeout(() => window.location.href = '/index.html', 400);
}

// ============================================================
// Cart helpers
// ============================================================
async function getCart() {
  try { return await api('/cart'); } catch { return { items: [], total: 0 }; }
}

async function updateCartBadge() {
  const badge = document.getElementById('cart-badge-slot');
  if (!badge) return;
  const user = await getCurrentUser();
  if (!user) { badge.innerHTML = ''; return; }
  const cart = await getCart();
  const count = cart.items.reduce((sum, i) => sum + i.quantity, 0);
  badge.innerHTML = count > 0 ? `<span class="cart-badge">${count}</span>` : '';
}

async function addToCart(productId, quantity = 1) {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = `/login.html?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    return;
  }
  try {
    await api('/cart', { method: 'POST', body: { productId, quantity } });
    toast('Added to cart.', 'success');
    updateCartBadge();
    if (document.getElementById('cart-drawer')) renderCartDrawer();
  } catch (err) {
    toast(err.message, 'error');
  }
}

// ---------- Cart drawer ----------
function ensureCartDrawer() {
  if (document.getElementById('cart-drawer')) return;
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div class="drawer-overlay" id="drawer-overlay" onclick="closeCartDrawer()"></div>
    <aside class="cart-drawer" id="cart-drawer">
      <div class="drawer-header">
        <h3>Your bag</h3>
        <button class="drawer-close" onclick="closeCartDrawer()" aria-label="Close cart">&times;</button>
      </div>
      <div class="drawer-body" id="drawer-body"><p style="color:var(--text-muted-on-bone); font-size:13px;">Loading...</p></div>
      <div class="drawer-footer" id="drawer-footer"></div>
    </aside>
  `;
  document.body.appendChild(wrap);
}

async function openCartDrawer() {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = `/login.html?next=${encodeURIComponent(window.location.pathname)}`;
    return;
  }
  ensureCartDrawer();
  document.getElementById('drawer-overlay').classList.add('open');
  document.getElementById('cart-drawer').classList.add('open');
  document.body.style.overflow = 'hidden';
  renderCartDrawer();
}

function closeCartDrawer() {
  const overlay = document.getElementById('drawer-overlay');
  const drawer = document.getElementById('cart-drawer');
  if (overlay) overlay.classList.remove('open');
  if (drawer) drawer.classList.remove('open');
  document.body.style.overflow = '';
}

async function renderCartDrawer() {
  const body = document.getElementById('drawer-body');
  const footer = document.getElementById('drawer-footer');
  if (!body) return;
  try {
    const cart = await getCart();
    if (cart.items.length === 0) {
      body.innerHTML = `<div class="empty-state"><div class="big-icon">&#9679;</div><p>Your bag is empty.</p></div>`;
      footer.innerHTML = `<a href="/index.html" class="btn btn-outline btn-block">Browse products</a>`;
      return;
    }
    body.innerHTML = cart.items.map((item, i) => `
      <div class="drawer-item" style="animation-delay:${i * 0.05}s">
        <img src="${item.image}" alt="${escapeHtml(item.name)}">
        <div>
          <div class="name">${escapeHtml(item.name)}</div>
          <div class="unit">${formatMoney(item.price)} each</div>
          <div class="mini-qty" style="margin-top:6px;">
            <button onclick="drawerUpdateQty('${item.productId}', ${item.quantity - 1})">&minus;</button>
            <span>${item.quantity}</span>
            <button onclick="drawerUpdateQty('${item.productId}', ${item.quantity + 1})">+</button>
          </div>
        </div>
        <div class="right">
          <div class="sub">${formatMoney(item.subtotal)}</div>
          <button class="btn-ghost" onclick="drawerRemove('${item.productId}')">Remove</button>
        </div>
      </div>
    `).join('');
    footer.innerHTML = `
      <div class="summary-total"><span>Total</span><span>${formatMoney(cart.total)}</span></div>
      <a href="/checkout.html" class="btn btn-primary btn-block">Checkout</a>
      <a href="/cart.html" class="btn btn-ghost" style="display:block; text-align:center; margin-top:12px;">View full cart</a>
    `;
    updateCartBadge();
  } catch (err) {
    body.innerHTML = `<p>${escapeHtml(err.message)}</p>`;
  }
}

async function drawerUpdateQty(productId, newQty) {
  if (newQty < 1) return drawerRemove(productId);
  try {
    await api(`/cart/${productId}`, { method: 'PUT', body: { quantity: newQty } });
    renderCartDrawer();
    if (window.location.pathname.includes('cart.html') && typeof loadCartPage === 'function') loadCartPage();
  } catch (err) {
    toast(err.message, 'error');
  }
}

async function drawerRemove(productId) {
  try {
    await api(`/cart/${productId}`, { method: 'DELETE' });
    renderCartDrawer();
    toast('Removed from bag.');
    if (window.location.pathname.includes('cart.html') && typeof loadCartPage === 'function') loadCartPage();
  } catch (err) {
    toast(err.message, 'error');
  }
}

// ============================================================
// Wishlist
// ============================================================
let _wishlistIds = null;
async function getWishlistIds() {
  const user = await getCurrentUser();
  if (!user) return [];
  if (_wishlistIds) return _wishlistIds;
  try {
    const data = await api('/wishlist');
    _wishlistIds = data.productIds;
  } catch { _wishlistIds = []; }
  return _wishlistIds;
}

async function toggleWishlist(productId, btnEl) {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = `/login.html?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    return;
  }
  try {
    const data = await api(`/wishlist/${productId}`, { method: 'POST' });
    _wishlistIds = data.productIds;
    if (btnEl) {
      btnEl.classList.toggle('active', data.added);
      btnEl.innerHTML = data.added ? '&#9829;' : '&#9825;';
    }
    toast(data.added ? 'Saved to wishlist.' : 'Removed from wishlist.');
  } catch (err) {
    toast(err.message, 'error');
  }
}

// ============================================================
// Header
// ============================================================
async function renderHeader() {
  const mount = document.getElementById('site-header');
  if (!mount) return;

  const user = await getCurrentUser();

  mount.innerHTML = `
    <div class="header-inner">
      <a href="/index.html" class="brand-word">Shai <span class="veil-dot">&amp;</span> Co.</a>
      <div class="search-wrap">
        <form class="search-form" onsubmit="handleSearch(event)">
          <input type="text" id="header-search-input" name="q" placeholder="Search the collection..." autocomplete="off" value="${getSearchParam()}" oninput="handleSearchInput(event)">
          <button type="submit">Search</button>
        </form>
        <div class="search-dropdown" id="search-dropdown"></div>
      </div>
      <nav class="main-nav">
        <a href="/index.html">Shop</a>
        ${user ? `<a href="/wishlist.html" class="icon-link">&#9825; Wishlist</a>` : ''}
        ${user ? `<a href="/orders.html">Orders</a>` : ''}
        <a href="#" class="icon-link" onclick="openCartDrawer(); return false;">Bag <span id="cart-badge-slot"></span></a>
        ${user
          ? `<a href="#" onclick="handleLogout(event)">Log out</a>`
          : `<a href="/login.html">Log in</a><a href="/register.html">Sign up</a>`
        }
      </nav>
    </div>
  `;

  updateCartBadge();
  ensureCartDrawer();

  document.addEventListener('click', (e) => {
    const wrap = document.querySelector('.search-wrap');
    if (wrap && !wrap.contains(e.target)) {
      const dd = document.getElementById('search-dropdown');
      if (dd) dd.classList.remove('open');
    }
  });
}

function getSearchParam() {
  const params = new URLSearchParams(window.location.search);
  return escapeHtml(params.get('search') || '');
}

function handleSearch(e) {
  e.preventDefault();
  const q = e.target.q.value.trim();
  window.location.href = `/index.html${q ? `?search=${encodeURIComponent(q)}` : ''}`;
}

let _searchDebounce;
function handleSearchInput(e) {
  clearTimeout(_searchDebounce);
  const q = e.target.value.trim();
  if (q.length < 2) {
    const dd = document.getElementById('search-dropdown');
    if (dd) dd.classList.remove('open');
    return;
  }
  _searchDebounce = setTimeout(async () => {
    try {
      const { products } = await api(`/products?search=${encodeURIComponent(q)}`);
      const dd = document.getElementById('search-dropdown');
      if (!dd) return;
      if (products.length === 0) {
        dd.innerHTML = `<a href="#" style="color:var(--text-muted-on-bone)">No matches found</a>`;
      } else {
        dd.innerHTML = products.slice(0, 6).map(p => `
          <a href="/product.html?id=${p.id}">
            <img src="${p.image}" alt="">
            <span>${escapeHtml(p.name)}</span>
            <span class="sd-price">${formatMoney(p.price)}</span>
          </a>
        `).join('');
      }
      dd.classList.add('open');
    } catch {}
  }, 250);
}

document.addEventListener('DOMContentLoaded', renderHeader);
