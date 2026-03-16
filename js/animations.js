/* ============================================================
   PODTS — animations.js
   Subtle & refined micro-interactions + dark mode
   ============================================================ */

/* ── BRANDED DOT CURSOR ──────────────────────────────────────── */
function initCursor() {
    const dot  = document.createElement('div');
    const ring = document.createElement('div');
    dot.className  = 'podts-cursor';
    ring.className = 'podts-cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mx = -100, my = -100; // off-screen until moved
    let rx = -100, ry = -100;
    let rafId;

    // Dot follows cursor exactly
    document.addEventListener('mousemove', e => {
        mx = e.clientX;
        my = e.clientY;
        dot.style.left = mx + 'px';
        dot.style.top  = my + 'px';
        document.body.classList.remove('cursor-out');
    });

    // Ring lags behind with rAF lerp
    function lerpRing() {
        rx += (mx - rx) * 0.14;
        ry += (my - ry) * 0.14;
        ring.style.left = rx + 'px';
        ring.style.top  = ry + 'px';
        rafId = requestAnimationFrame(lerpRing);
    }
    lerpRing();

    // Hover state on interactive elements
    const hoverTargets = 'a, button, [onclick], input, textarea, select, label, .color-swatch, .filter-btn, .trend-hashtag-chip';
    document.addEventListener('mouseover', e => {
        if (e.target.closest(hoverTargets)) document.body.classList.add('cursor-hover');
    });
    document.addEventListener('mouseout', e => {
        if (e.target.closest(hoverTargets)) document.body.classList.remove('cursor-hover');
    });

    // Click state
    document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
    document.addEventListener('mouseup',   () => document.body.classList.remove('cursor-click'));

    // Hide when leaving window
    document.addEventListener('mouseleave', () => document.body.classList.add('cursor-out'));
    document.addEventListener('mouseenter', () => document.body.classList.remove('cursor-out'));
}

/* ── LOGO INTRO SEQUENCE ─────────────────────────────────────── */
/*
  Timeline (~2s total):
    0ms       — overlay appears, dot pops in
    80ms      — P appears
    240ms     — O appears
    400ms     — D appears
    560ms     — T appears
    720ms     — S appears
    900ms     — brief hold, full word visible
    1050ms    — logo begins gliding to nav position
    1600ms    — logo lands; overlay fades; nav-logo reveals
*/

function runIntroSequence() {
    // Only run once per browser session
    if (sessionStorage.getItem('podts-intro-done')) return;
    sessionStorage.setItem('podts-intro-done', '1');

    // Mark body so nav hides its real logo
    document.body.classList.add('intro-running');

    // ── Build overlay ──────────────────────────────────────────
    const overlay = document.createElement('div');
    overlay.id = 'intro-overlay';
    document.body.appendChild(overlay);

    // ── Build floating logo ────────────────────────────────────
    const logo = document.createElement('div');
    logo.id = 'intro-logo';

    const dot = document.createElement('span');
    dot.id = 'intro-dot';
    logo.appendChild(dot);

    const letters = 'PODTS'.split('');
    letters.forEach(ch => {
        const span = document.createElement('span');
        span.className = 'intro-letter';
        span.textContent = ch;
        logo.appendChild(span);
    });

    document.body.appendChild(logo);

    // ── Centre the logo on screen ──────────────────────────────
    // We do this after inserting so we can measure it
    function centreIntroLogo() {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        // Temporarily make it visible to measure width
        logo.style.opacity = '0';
        logo.style.top  = '50vh';
        logo.style.left = '50vw';
        logo.style.transform = 'translate(-50%, -50%)';

        // After one frame, read size then set explicit px coords
        requestAnimationFrame(() => {
            const rect = logo.getBoundingClientRect();
            const cx = vw / 2 - rect.width  / 2;
            const cy = vh / 2 - rect.height / 2;
            logo.style.transform = '';
            logo.style.top  = cy + 'px';
            logo.style.left = cx + 'px';
            logo.style.opacity = '1';
        });
    }
    centreIntroLogo();

    // ── Letter reveal ──────────────────────────────────────────
    const letterEls = logo.querySelectorAll('.intro-letter');

    // Dot pops first
    setTimeout(() => dot.classList.add('visible'), 40);

    // Letters: one every 160ms starting at 80ms
    letterEls.forEach((el, i) => {
        setTimeout(() => el.classList.add('visible'), 80 + i * 100);
    });

    // ── Glide to nav position ──────────────────────────────────
    const HOLD_MS  = 970;   // wait after last letter before moving
    const GLIDE_MS = 670;   // glide duration (matches CSS transition)

    setTimeout(() => {
        // Get the real nav-logo position
        const navLogo = document.querySelector('.nav-logo');
        const navRect  = navLogo.getBoundingClientRect();
        const dotEl    = navLogo.querySelector('.logo-dot');
        const dotRect  = dotEl  ? dotEl.getBoundingClientRect() : navRect;

        // Current intro-logo position
        const logoRect = logo.getBoundingClientRect();

        // Target: align intro-logo dot with nav dot, text with nav text
        // The intro-logo starts at cx,cy; nav-logo is at navRect
        const targetLeft = navRect.left;
        const targetTop  = navRect.top + (navRect.height - logoRect.height) / 2;

        // Scale: nav font-size is 1rem, intro is 2rem → scale factor
        const introFS = parseFloat(getComputedStyle(logo).fontSize);   // ~32px
        const navFS   = parseFloat(getComputedStyle(navLogo).fontSize); // ~16px
        const scale   = navFS / introFS;

        // Animate via transform — bypasses layout so we can use CSS transition
        const dx = targetLeft - logoRect.left;
        const dy = targetTop  - logoRect.top;

        // Override the top/left transitions with transform for the glide
        logo.style.transition = `transform ${GLIDE_MS}ms cubic-bezier(0.4, 0, 0.2, 1),
                              font-size ${GLIDE_MS}ms cubic-bezier(0.4, 0, 0.2, 1),
                              letter-spacing ${GLIDE_MS}ms ease,
                              opacity 0.2s ease`;
        logo.style.fontSize      = navFS + 'px';
        logo.style.letterSpacing = '0.12em';
        logo.style.transform     = `translate(${dx}px, ${dy}px)`;

        // Fade overlay simultaneously
        setTimeout(() => {
            overlay.classList.add('intro-hidden');
        }, GLIDE_MS * 0.3);

        // After glide lands: hide intro elements, reveal real nav-logo
        setTimeout(() => {
            logo.style.opacity = '0';
            document.body.classList.remove('intro-running');

            // Clean up
            setTimeout(() => {
                logo.remove();
                overlay.remove();
            }, 300);
        }, GLIDE_MS);

    }, HOLD_MS);
}

/* ── DARK MODE ───────────────────────────────────────────────── */
(function initTheme() {
    const saved = localStorage.getItem('podts-theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
})();

function buildThemeToggle() {
    const btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.setAttribute('aria-label', 'Toggle dark mode');
    btn.innerHTML = `
    <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
      <circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="5"/>
      <line x1="12" y1="19" x2="12" y2="22"/><line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/>
      <line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/><line x1="2" y1="12" x2="5" y2="12"/>
      <line x1="19" y1="12" x2="22" y2="12"/><line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/>
      <line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/>
    </svg>
    <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/>
    </svg>
  `;
    btn.onclick = toggleTheme;
    document.body.appendChild(btn);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('podts-theme', next);
}

/* ── PAGE TRANSITIONS ────────────────────────────────────────── */
function animatedShowPage(name) {
    const current = document.querySelector('.page.active');

    if (current) {
        current.classList.add('page-exit');
        setTimeout(() => {
            current.classList.remove('active', 'page-exit');
            _activatePage(name);
        }, 180);
    } else {
        _activatePage(name);
    }
}

function _activatePage(name) {
    const target = document.getElementById(`page-${name}`);
    if (!target) return;
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'instant' });

    // update nav indicator
    document.querySelectorAll('.nav-links a').forEach(a => {
        a.classList.toggle('active', a.dataset.page === name);
    });

    // page-specific init
    if (name === 'catalog') renderCatalog();
    if (name === 'cart')    renderCart();
    if (name === 'trends')  renderTrends('all');
    if (name === 'designer') {
        initDesigner();
        updateDesignerPrice();
    }
}

/* ── NAV SLIDING INDICATOR ───────────────────────────────────── */

/* ── SCROLL REVEAL ───────────────────────────────────────────── */
function initScrollReveal() {
    const targets = document.querySelectorAll(
        '.feat-card, .step, .about-stat, .value-card'
    );
    targets.forEach((el, i) => {
        el.classList.add('reveal');
        // stagger within the same parent
        const siblings = Array.from(el.parentElement.children);
        const idx = siblings.indexOf(el);
        if (idx > 0) el.classList.add(`reveal-delay-${Math.min(idx, 4)}`);
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                observer.unobserve(e.target);
            }
        });
    }, { threshold: 0.12 });

    targets.forEach(el => observer.observe(el));
}

/* ── PRODUCT CARD STAGGER ────────────────────────────────────── */
function staggerProductCards() {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach((card, i) => {
        card.style.setProperty('--i', i);
        // Wrap button text in span for arrow animation
        const btn = card.querySelector('.product-design-btn');
        if (btn && !btn.querySelector('.arrow-text')) {
            btn.innerHTML = `<span class="arrow-text">${btn.textContent.trim()}</span>`;
        }
    });
}

/* ── FILTER PILL INDICATOR ───────────────────────────────────── */
function buildFilterIndicator() {
    const filterWrap = document.querySelector('.catalog-filters');
    if (!filterWrap) return;

    let pill = filterWrap.querySelector('.filter-pill-indicator');
    if (!pill) {
        pill = document.createElement('div');
        pill.className = 'filter-pill-indicator';
        filterWrap.insertBefore(pill, filterWrap.firstChild);
    }
    moveFilterPill();
}

function moveFilterPill() {
    const filterWrap = document.querySelector('.catalog-filters');
    const active = filterWrap?.querySelector('.filter-btn.active');
    const pill   = filterWrap?.querySelector('.filter-pill-indicator');
    if (!active || !pill || !filterWrap) return;

    const wrapRect   = filterWrap.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();

    pill.style.left   = (activeRect.left - wrapRect.left) + 'px';
    pill.style.top    = (activeRect.top  - wrapRect.top)  + 'px';
    pill.style.width  = activeRect.width  + 'px';
    pill.style.height = activeRect.height + 'px';
}

/* ── COLOR SWATCH POP ────────────────────────────────────────── */
function swatchPopOnClick(btn) {
    btn.classList.remove('popping');
    void btn.offsetWidth; // reflow to restart
    btn.classList.add('popping');
    btn.addEventListener('animationend', () => btn.classList.remove('popping'), { once: true });
}

/* ── SIZE PILL RIPPLE ────────────────────────────────────────── */
function createRipple(e) {
    const pill = e.currentTarget;
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const rect = pill.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    ripple.style.width  = size + 'px';
    ripple.style.height = size + 'px';
    ripple.style.left   = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top    = (e.clientY - rect.top  - size / 2) + 'px';
    pill.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
}

function initSizePillRipples() {
    document.querySelectorAll('.size-pill').forEach(pill => {
        pill.addEventListener('click', createRipple);
    });
}

/* ── PRINT APPEAR ────────────────────────────────────────────── */
function animatePrintAppear() {
    const mockup = document.getElementById('mockup-shirt');
    if (!mockup) return;
    mockup.classList.remove('print-just-applied');
    void mockup.offsetWidth;
    mockup.classList.add('print-just-applied');
    mockup.addEventListener('animationend', () => {
        mockup.classList.remove('print-just-applied');
    }, { once: true });
}

/* ── CART ICON BOUNCE + COUNT POP ───────────────────────────── */
function animateCartAdd(addBtnEl) {
    // Bounce the cart icon
    const cartBtn = document.getElementById('cart-btn-fixed') || document.querySelector('.cart-btn');
    if (cartBtn) {
        cartBtn.classList.remove('bouncing');
        void cartBtn.offsetWidth;
        cartBtn.classList.add('bouncing');
        cartBtn.addEventListener('animationend', () => cartBtn.classList.remove('bouncing'), { once: true });
    }

    // Pop the count badge
    const countEl = document.getElementById('cart-count');
    if (countEl) {
        countEl.classList.remove('popping');
        void countEl.offsetWidth;
        countEl.classList.add('popping');
        countEl.addEventListener('animationend', () => countEl.classList.remove('popping'), { once: true });
    }

    // Particle burst from add-to-cart button
    if (addBtnEl) spawnParticles(addBtnEl);
}

/* ── PARTICLE BURST ──────────────────────────────────────────── */
function spawnParticles(fromEl) {
    const rect = fromEl.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const count = 10;

    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'particle';

        const angle = (i / count) * Math.PI * 2;
        const dist  = 30 + Math.random() * 30;
        p.style.left = cx + 'px';
        p.style.top  = cy + 'px';
        p.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
        p.style.setProperty('--ty', Math.sin(angle) * dist + 'px');
        p.style.setProperty('--dur', (0.4 + Math.random() * 0.2) + 's');
        p.style.opacity = 0.8 + Math.random() * 0.2;

        document.body.appendChild(p);
        p.addEventListener('animationend', () => p.remove());
    }
}

/* ── CART ITEM STAGGER INDICES ───────────────────────────────── */
function indexCartItems() {
    document.querySelectorAll('.cart-item').forEach((item, i) => {
        item.style.setProperty('--i', i);
    });
}

/* ── CART ITEM REMOVE ANIMATION ──────────────────────────────── */
function animateCartRemove(id, callback) {
    // find the cart item element
    const items = document.querySelectorAll('.cart-item');
    items.forEach(item => {
        const removeBtn = item.querySelector(`.remove-btn`);
        if (removeBtn && removeBtn.getAttribute('onclick')?.includes(id)) {
            item.classList.add('removing');
            item.addEventListener('animationend', () => {
                if (callback) callback();
            }, { once: true });
            return;
        }
    });
    // fallback immediate
    if (callback) setTimeout(callback, 0);
}

/* ── QTY FLIP ─────────────────────────────────────────────────── */
function animateQtyChange(qtyEl, direction) {
    if (!qtyEl) return;
    const cls = direction > 0 ? 'flip-up' : 'flip-down';
    qtyEl.classList.remove('flip-up', 'flip-down');
    void qtyEl.offsetWidth;
    qtyEl.classList.add(cls);
    qtyEl.addEventListener('animationend', () => qtyEl.classList.remove(cls), { once: true });
}

/* ── ORDER CONFETTI ───────────────────────────────────────────── */
function spawnConfetti() {
    const colors = ['#111110', '#c8f135', '#e8eaf0', '#8892aa', '#252d40'];
    const count  = 40;

    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'confetti-piece';

        const startX = 10 + Math.random() * 80; // vw
        const startY = 20 + Math.random() * 30; // vh
        p.style.left = startX + 'vw';
        p.style.top  = startY + 'vh';
        p.style.background = colors[Math.floor(Math.random() * colors.length)];
        p.style.setProperty('--tx', (Math.random() * 80 - 40) + 'px');
        p.style.setProperty('--ty', (60  + Math.random() * 80) + 'px');
        p.style.setProperty('--rot', (Math.random() * 360) + 'deg');
        p.style.setProperty('--dur', (0.7 + Math.random() * 0.8) + 's');
        p.style.animationDelay = (Math.random() * 0.3) + 's';

        document.body.appendChild(p);
        p.addEventListener('animationend', () => p.remove());
    }
}

/* ── INIT ─────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    // Intro must run before page reveals
    runIntroSequence();

    initCursor();
    buildThemeToggle();
    initScrollReveal();

    // Init size pill ripples (and re-init after designer loads)
    initSizePillRipples();


    // Re-init filter pill indicator after catalog renders
    const origRenderCatalog = window.renderCatalog;
    window.renderCatalog = function(filter) {
        origRenderCatalog.call(this, filter);
        staggerProductCards();
        // re-attach arrow spans
        document.querySelectorAll('.product-design-btn').forEach(btn => {
            if (!btn.querySelector('.arrow-text')) {
                btn.innerHTML = `<span class="arrow-text">${btn.textContent.trim()}</span>`;
            }
        });
        requestAnimationFrame(() => {
            buildFilterIndicator();
            moveFilterPill();
        });
    };

    // Patch filter btn clicks to move the pill
    document.addEventListener('click', e => {
        if (e.target.closest('.filter-btn')) {
            requestAnimationFrame(() => moveFilterPill());
        }
    });

    // Patch color swatch clicks for pop animation
    document.addEventListener('click', e => {
        const swatch = e.target.closest('.color-swatch');
        if (swatch) swatchPopOnClick(swatch);
    });

    // Patch size pill ripple (re-attach when designer reinits)
    document.getElementById('size-pills')?.addEventListener('click', e => {
        const pill = e.target.closest('.size-pill');
        if (pill) createRipple({ currentTarget: pill, clientX: e.clientX, clientY: e.clientY });
    }, true);

    // Patch addToCart to trigger animations
    const origAddToCart = window.addToCart;
    window.addToCart = function(item) {
        origAddToCart.call(this, item);
        const addBtn = document.querySelector('#page-designer .btn-primary.full') ||
            document.querySelector('[onclick="addDesignToCart()"]');
        animateCartAdd(addBtn);
    };

    // Patch removeFromCart for slide-out
    const origRemoveFromCart = window.removeFromCart;
    window.removeFromCart = function(id) {
        // find matching item element and animate it out first
        const items = document.querySelectorAll('.cart-item');
        let found = null;
        items.forEach(el => {
            if (el.innerHTML.includes(`removeFromCart(${id})`)) found = el;
        });

        if (found) {
            found.classList.add('removing');
            found.addEventListener('animationend', () => {
                origRemoveFromCart.call(this, id);
                // Re-index remaining items
                setTimeout(indexCartItems, 50);
            }, { once: true });
        } else {
            origRemoveFromCart.call(this, id);
        }
    };

    // Patch changeQty for flip animation
    const origChangeQty = window.changeQty;
    window.changeQty = function(id, delta) {
        // find the qty val for this item before the change
        const items = document.querySelectorAll('.cart-item');
        let qtyEl = null;
        items.forEach(el => {
            if (el.innerHTML.includes(`changeQty(${id},`)) {
                qtyEl = el.querySelector('.qty-val');
            }
        });
        origChangeQty.call(this, id, delta);
        if (qtyEl) {
            // After renderCart replaces DOM, find new one
            setTimeout(() => {
                const newItems = document.querySelectorAll('.cart-item');
                newItems.forEach(el => {
                    if (el.innerHTML.includes(`changeQty(${id},`)) {
                        const newQtyEl = el.querySelector('.qty-val');
                        if (newQtyEl) animateQtyChange(newQtyEl, delta);
                    }
                });
            }, 20);
        }
    };

    // Patch renderCart to index items for stagger
    const origRenderCart = window.renderCart;
    window.renderCart = function() {
        origRenderCart.call(this);
        setTimeout(indexCartItems, 10);
    };

    // Patch applyPrint to animate the mockup
    const origApplyPrint = window.applyPrint;
    window.applyPrint = function(src) {
        origApplyPrint.call(this, src);
        setTimeout(animatePrintAppear, 30);
    };

    // Patch placeOrder for confetti
    const origPlaceOrder = window.placeOrder;
    window.placeOrder = function() {
        origPlaceOrder.call(this);
        const modal = document.getElementById('order-modal');
        if (modal && modal.style.display !== 'none') {
            setTimeout(spawnConfetti, 200);
        }
    };

    // Patch showPage to use animated version
    window.showPage = animatedShowPage;

    // Trigger initial page
    animatedShowPage('home');
});

// Re-init ripples after designer init (designer.js calls initDesigner)
const _origInitDesigner = window.initDesigner;
if (typeof _origInitDesigner === 'function') {
    window.initDesigner = function() {
        _origInitDesigner.call(this);
        initSizePillRipples();
    };
}