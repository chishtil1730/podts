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

// NAVBAR MORPH — pill on scroll
(function() {
    const nav = document.getElementById('navbar');

    // ── FUNCTION 1: apply UNSCROLLED (full-width bar) ────────────
    // Wipe any inline left/right so the bar fills edge-to-edge.
    // Use removeProperty so no stale px value lingers.
    function applyUnscrolled() {
        nav.style.removeProperty('left');
        nav.style.removeProperty('right');
        nav.classList.remove('scrolled');
        document.body.classList.remove('navbar-scrolled');

        // Restore logo after morph-back animation completes (550ms)
        const logo = nav.querySelector('.nav-logo');
        if (logo) {
            setTimeout(() => {
                logo.style.removeProperty('opacity');
                logo.style.removeProperty('visibility');
            }, 480);
        }
    }

    // ── FUNCTION 2: apply SCROLLED (centered pill) ───────────────
    // Builds an off-screen probe that exactly mirrors the scrolled
    // link styles (font-size:0.83rem, padding:0.35rem 0.78rem) AND
    // accounts for the active link having font-weight:600.
    // Measures true pill width independently of live DOM state.
    function applyScrolledPill() {
        // On mobile (<= 768px) nav-links are hidden — no pill, keep plain bar
        if (document.documentElement.clientWidth <= 768) {
            nav.classList.add('scrolled');
            document.body.classList.add('navbar-scrolled');
            return;
        }
        // Hide logo instantly — same frame, before any paint
        const logo = nav.querySelector('.nav-logo');
        if (logo) {
            logo.style.opacity    = '0';
            logo.style.visibility = 'hidden';
        }

        const anchors = nav.querySelectorAll('.nav-links a');

        // Build off-screen probe using position:absolute (not fixed)
        // so it is never constrained by the viewport width.
        // Mirrors exact scrolled styles from nav.css.
        const probe = document.createElement('div');
        probe.style.cssText = [
            'position:absolute',
            'top:-99999px',
            'left:-99999px',
            'visibility:hidden',
            'pointer-events:none',
            'display:inline-flex',
            'align-items:center',
            'gap:2px',           // 0.1rem at 16px base
            'padding:0 28px',    // pill side padding
            'white-space:nowrap',
            'box-sizing:content-box',
        ].join(';');

        anchors.forEach(a => {
            const isActive = a.classList.contains('active');
            const span = document.createElement('span');
            span.textContent = a.textContent.trim();
            span.style.cssText = [
                'display:inline-block',
                'white-space:nowrap',
                'box-sizing:border-box',
                'font-size:0.83rem',                          // from nav.css scrolled
                'font-weight:' + (isActive ? '600' : '500'), // active gets bold
                'padding:0.35rem 0.78rem',                    // from nav.css scrolled
                'border-radius:100px',
                'font-family:DM Sans,sans-serif',
                'letter-spacing:normal',
            ].join(';');
            probe.appendChild(span);
        });

        document.body.appendChild(probe);
        const pillW = Math.ceil(probe.getBoundingClientRect().width);
        document.body.removeChild(probe);

        // clientWidth excludes the scrollbar — window.innerWidth does not.
        // Using innerWidth caused the pill to shift right by ~15px (scrollbar width).
        const vw     = document.documentElement.clientWidth;
        const margin = Math.max(8, Math.round((vw - pillW) / 2));
        nav.style.left  = margin + 'px';
        nav.style.right = margin + 'px';

        nav.classList.add('scrolled');
        document.body.classList.add('navbar-scrolled');
    }

    // ── SCROLL HANDLER ────────────────────────────────────────────
    let lastScrolled = null;  // track state to avoid redundant calls

    function onScroll() {
        const shouldScroll = window.scrollY > 40;
        if (shouldScroll === lastScrolled) return;  // no state change — skip
        lastScrolled = shouldScroll;

        if (shouldScroll) {
            applyScrolledPill();
        } else {
            applyUnscrolled();
        }
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => { onScroll(); ticking = false; });
            ticking = true;
        }
    });

    // Also fire on page load in case page starts mid-scroll
    window.addEventListener('DOMContentLoaded', onScroll);

    // Recalculate pill size on resize
    window.addEventListener('resize', () => {
        if (nav.classList.contains('scrolled')) {
            if (document.documentElement.clientWidth <= 768) {
                // Switched to mobile — remove pill positioning
                nav.style.removeProperty('left');
                nav.style.removeProperty('right');
            } else {
                applyScrolledPill();
            }
        }
    });

    // Also recalc on scrollbar appear/disappear (page height changes)
    if (typeof ResizeObserver !== 'undefined') {
        new ResizeObserver(() => {
            if (nav.classList.contains('scrolled')) applyScrolledPill();
        }).observe(document.documentElement);
    }

    // Recalculate whenever active link changes (page navigation)
    document.addEventListener('click', e => {
        if (e.target.closest('.nav-links a') && nav.classList.contains('scrolled')) {
            requestAnimationFrame(applyScrolledPill);
        }
    });
})();

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
// 3D VIEWER — auto-rotate toggle
function toggleAutoRotate() {
    const btn   = document.getElementById('btn-autorotate');
    const label = document.getElementById('autorotate-label');
    if (!window.viewer3d) return;
    const isOn = label.textContent === 'Pause';
    viewer3d.setAutoRotate(!isOn);
    label.textContent = isOn ? 'Play' : 'Pause';
    if (btn) btn.classList.toggle('inactive', isOn);
}

// VIEW MODE TOGGLE — 2D / 3D
let currentViewMode = '2d';

function setViewMode(mode) {
    if (mode === currentViewMode) return;
    currentViewMode = mode;

    const view2d    = document.getElementById('view-2d');
    const view3d    = document.getElementById('viewer3d-mount');
    const controls  = document.getElementById('controls-3d');
    const btn2d     = document.getElementById('btn-mode-2d');
    const btn3d     = document.getElementById('btn-mode-3d');

    // Fade out current
    const outEl = mode === '3d' ? view2d : view3d;
    const inEl  = mode === '3d' ? view3d : view2d;

    outEl.classList.add('fading');

    setTimeout(() => {
        outEl.style.display = 'none';
        outEl.classList.remove('fading');

        inEl.style.display = mode === '3d' ? 'block' : 'flex';
        inEl.classList.add('fading');
        if (controls) controls.style.display = mode === '3d' ? 'flex' : 'none';

        // Toggle active state on buttons
        btn2d.classList.toggle('active', mode === '2d');
        btn3d.classList.toggle('active', mode === '3d');

        requestAnimationFrame(() => {
            inEl.classList.remove('fading');
            if (mode === '3d') {
                // Init 3D on first switch, update on subsequent
                if (window.viewer3d) {
                    window.viewer3d.init();
                    setTimeout(() => window.viewer3d.update(), 100);
                }
            }
        });
    }, 200);
}