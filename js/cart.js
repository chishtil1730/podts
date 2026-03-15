let cart = [];

function updateCartCount() {
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  const el = document.getElementById('cart-count');
  el.textContent = total;
  if (total > 0) el.classList.add('visible');
  else el.classList.remove('visible');
}

function addToCart(item) {
  // Check if same item exists
  const existing = cart.find(c =>
    c.garmentId === item.garmentId &&
    c.colorId === item.colorId &&
    c.size === item.size &&
    c.printSrc === item.printSrc
  );
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...item, qty: 1, id: Date.now() });
  }
  updateCartCount();
  showToast('Added to cart ✓');
}

function removeFromCart(id) {
  cart = cart.filter(c => c.id !== id);
  updateCartCount();
  renderCart();
}

function changeQty(id, delta) {
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else renderCart();
  updateCartCount();
}

function renderCart() {
  const container = document.getElementById('cart-items');
  const summary = document.getElementById('cart-summary');
  const emptyEl = document.getElementById('cart-empty');

  // Clear items but keep empty state
  container.innerHTML = '';

  if (cart.length === 0) {
    container.appendChild(emptyEl);
    emptyEl.style.display = 'block';
    if (summary) summary.style.display = 'none';
    return;
  }

  // Hide empty state
  emptyEl.style.display = 'none';
  if (summary) summary.style.display = 'block';

  cart.forEach(item => {
    const color = COLORS.find(c => c.id === item.colorId) || COLORS[0];
    const garment = GARMENTS.find(g => g.id === item.garmentId) || GARMENTS[0];
    const card = document.createElement('div');
    card.className = 'cart-item';
    card.innerHTML = `
      <div class="cart-item-thumb">
        <svg viewBox="0 0 300 340" xmlns="http://www.w3.org/2000/svg">
          <path d="${getShirtSVGPath(item.garmentId)}" fill="${color.shirtFill}" stroke="${color.stroke}"/>
          ${item.printSrc ? `<image href="${item.printSrc}" x="105" y="120" width="90" height="90" preserveAspectRatio="xMidYMid meet" style="opacity:0.9"/>` : ''}
        </svg>
      </div>
      <div class="cart-item-info">
        <h4>${garment.label} — Custom Print</h4>
        <div class="cart-item-meta">
          <span>${color.name}</span>
          <span>Size ${item.size}</span>
        </div>
        <div class="cart-item-price">₹ ${(garment.basePrice * item.qty).toLocaleString('en-IN')}</div>
      </div>
      <div class="cart-item-actions">
        <div class="qty-control">
          <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
          <span class="qty-val">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
        </div>
        <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
      </div>
    `;
    container.appendChild(card);
  });

  // Empty state as hidden div for reuse
  const emptyDiv = document.createElement('div');
  emptyDiv.id = 'cart-empty';
  emptyDiv.className = 'cart-empty';
  emptyDiv.style.display = 'none';
  emptyDiv.innerHTML = `
    <div class="empty-icon">◻</div>
    <p>Your cart is empty.</p>
    <button class="btn-secondary" onclick="showPage('catalog')">Browse Catalog</button>
  `;
  container.appendChild(emptyDiv);

  renderSummary();
}

function renderSummary() {
  const rows = document.getElementById('summary-rows');
  if (!rows) return;
  rows.innerHTML = '';

  const subtotal = cart.reduce((sum, item) => {
    const g = GARMENTS.find(g => g.id === item.garmentId);
    return sum + (g ? g.basePrice * item.qty : 0);
  }, 0);

  const shipping = subtotal > 0 ? 99 : 0;
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + gst;

  const items = [
    { label: 'Subtotal', val: `₹ ${subtotal.toLocaleString('en-IN')}` },
    { label: 'GST (18%)', val: `₹ ${gst.toLocaleString('en-IN')}` },
    { label: 'Shipping', val: shipping === 0 ? 'Free' : `₹ ${shipping}` },
  ];

  items.forEach(({ label, val }) => {
    const row = document.createElement('div');
    row.className = 'summary-row';
    row.innerHTML = `<span>${label}</span><span>${val}</span>`;
    rows.appendChild(row);
  });

  document.getElementById('summary-total-price').textContent = `₹ ${total.toLocaleString('en-IN')}`;
}

function placeOrder() {
  const name = document.getElementById('f-name')?.value.trim();
  const email = document.getElementById('f-email')?.value.trim();
  const card = document.getElementById('f-card')?.value.trim();

  if (!name || !email) { showToast('Please fill in your details'); return; }
  if (!card) { showToast('Please enter card details'); return; }
  if (cart.length === 0) { showToast('Your cart is empty'); return; }

  const orderId = 'PODTS-' + Math.random().toString(36).substring(2,8).toUpperCase();
  document.getElementById('order-id-text').textContent = `Order ID: ${orderId}`;
  document.getElementById('order-modal').style.display = 'flex';

  cart = [];
  updateCartCount();
}

function closeOrderModal() {
  document.getElementById('order-modal').style.display = 'none';
  showPage('home');
}

function formatCard(input) {
  let val = input.value.replace(/\D/g, '');
  val = val.replace(/(.{4})/g, '$1 ').trim();
  input.value = val;
}

function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2700);
}
