// PAGE ROUTING
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(`page-${name}`);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Update nav active state
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === name);
  });

  // Page-specific init
  if (name === 'catalog') renderCatalog();
  if (name === 'cart') renderCart();
  if (name === 'designer') {
    initDesigner();
    updateDesignerPrice();
  }
}

// MOBILE MENU
function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  menu.classList.toggle('open');
}

// NAVBAR SCROLL GLASS
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (window.scrollY > 40) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
});

// SIZE PILLS — event delegation
document.getElementById('size-pills')?.addEventListener('click', e => {
  const pill = e.target.closest('.size-pill');
  if (!pill) return;
  selectSize(pill.dataset.size);
});

// CATALOG RENDER
function renderCatalog(filter = 'all') {
  const grid = document.getElementById('product-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const filtered = filter === 'all'
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === filter);

  filtered.forEach(product => {
    const color = COLORS.find(c => c.id === product.defaultColor) || COLORS[0];
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-thumb-wrap">
        <div class="product-thumb">
          <svg viewBox="0 0 300 340" xmlns="http://www.w3.org/2000/svg">
            <path d="${getShirtSVGPath(product.garmentId)}"
              fill="${color.shirtFill}"
              stroke="${color.id === 'white' ? '#ddd' : 'none'}"
            />
            <path d="${getCollarPath(product.garmentId)}"
              fill="${color.id === 'white' ? '#e8e8e8' : 'rgba(255,255,255,0.08)'}"
              stroke="${color.id === 'white' ? '#ccc' : 'rgba(255,255,255,0.1)'}"
              stroke-width="1"
            />
          </svg>
        </div>
        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
      </div>
      <div class="product-info">
        <div class="product-category">${product.categoryLabel}</div>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-desc">${product.desc}</p>
        <div class="product-footer">
          <div>
            <div class="product-price">₹ ${product.price.toLocaleString('en-IN')}</div>
            <div class="product-colors" style="margin-top:6px">
              ${COLORS.map(c => `<span class="product-color-dot" style="background:${c.hex}" title="${c.name}"></span>`).join('')}
            </div>
          </div>
          <button class="product-design-btn" onclick="openDesignerWithProduct('${product.garmentId}', '${product.defaultColor}')">
            Design It →
          </button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// CATALOG FILTER BUTTONS
document.addEventListener('click', e => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderCatalog(btn.dataset.filter);
});

// DRAG OVER for upload zone
const uploadZone = document.getElementById('upload-zone');
if (uploadZone) {
  uploadZone.addEventListener('dragover', e => {
    e.preventDefault();
    uploadZone.style.borderColor = '#111';
  });
  uploadZone.addEventListener('dragleave', () => {
    uploadZone.style.borderColor = '';
  });
  uploadZone.addEventListener('drop', e => {
    e.preventDefault();
    uploadZone.style.borderColor = '';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const fakeEvent = { target: { files: [file] } };
      handleFileUpload(fakeEvent);
    }
  });
}

// CONTACT FORM
function sendContactForm() {
  showToast('Message sent! We\'ll be in touch soon ✓');
}

// HERO SHIRT — color cycle on hover
const heroShirt = document.getElementById('hero-shirt');
if (heroShirt) {
  const shirtPath = heroShirt.querySelector('path');
  const colors = ['#111110', '#1B2A4A', '#8A9E85', '#B0A898', '#8B2635'];
  let ci = 0;
  heroShirt.addEventListener('mouseenter', () => {
    ci = (ci + 1) % colors.length;
    if (shirtPath) shirtPath.setAttribute('fill', colors[ci]);
  });
}

// INIT
document.addEventListener('DOMContentLoaded', () => {
  showPage('home');
});
