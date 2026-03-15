/* ============================================================
   PODTS — trends.js
   Curated fashion trend data + Pinterest-column renderer
   ============================================================ */

const TREND_FILTERS = [
    { id: 'all',       label: 'All' },
    { id: 'outfit',    label: 'Outfits' },
    { id: 'palette',   label: 'Palettes' },
    { id: 'hashtags',  label: 'Trending Tags' },
    { id: 'editorial', label: 'Editorial' },
];

/* ── CURATED CONTENT ─────────────────────────────────────────── */
/* Images: Unsplash fashion — stable, real photography */
const TREND_ITEMS = [

    /* ── OUTFIT CARDS ──────────────────────────────────────────── */
    {
        type: 'outfit', id: 't1',
        title: 'Quiet Luxury Minimalism',
        summary: 'Monochrome neutrals, relaxed tailoring, and zero-logo garments are dominating street style this season. Less is saying everything.',
        image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80',
        imageAspect: '4/5',
        hashtags: ['#quietluxury', '#minimalistfit', '#nologos'],
        source: 'Vogue India',
        sourceInitial: 'V',
        likes: '48.2K',
        date: 'Mar 2025',
        palette: ['#D4C5B2', '#8B7D6B', '#2C2416', '#F5F0E8'],
        cta: true,
    },
    {
        type: 'outfit', id: 't2',
        title: 'Oversized Graphic Tees — The Statement Piece',
        summary: 'Bold chest prints on relaxed silhouettes are back. Think vintage band tees, maximalist typography, and drop-shoulder cuts worn with tailored trousers.',
        image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80',
        imageAspect: '3/4',
        hashtags: ['#graphictee', '#oversizedfit', '#streetwear'],
        source: 'Hypebeast',
        sourceInitial: 'H',
        likes: '91.7K',
        date: 'Mar 2025',
        palette: ['#1A1A1A', '#FFFFFF', '#E63946', '#FFD166'],
        cta: true,
    },
    {
        type: 'outfit', id: 't3',
        title: 'Dopamine Dressing',
        summary: 'Saturated colour-blocking and maximalist layering are pushing back against muted palettes. Electric yellows, cobalt blues, and cerise pinks leading the charge.',
        image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80',
        imageAspect: '4/5',
        hashtags: ['#dopaminedressing', '#colorblocking', '#maximalist'],
        source: 'Elle Magazine',
        sourceInitial: 'E',
        likes: '62.4K',
        date: 'Feb 2025',
        palette: ['#FF006E', '#3A86FF', '#FFBE0B', '#8338EC'],
        cta: true,
    },
    {
        type: 'outfit', id: 't4',
        title: 'Workwear Reimagined',
        summary: 'Corporate wear is being stripped of rigidity — unstructured blazers, wide-leg trousers in unexpected fabrics, and polo shirts replacing the button-down.',
        image: 'https://images.unsplash.com/photo-1550614000-4895a10e1bfd?w=600&q=80',
        imageAspect: '3/4',
        hashtags: ['#officewear', '#softdressing', '#polofit'],
        source: 'Business of Fashion',
        sourceInitial: 'B',
        likes: '29.1K',
        date: 'Mar 2025',
        palette: ['#C8B8A2', '#5C5346', '#E8E0D5', '#2A2420'],
        cta: true,
    },
    {
        type: 'outfit', id: 't5',
        title: 'Y2K Revival: 2025 Edition',
        summary: 'The early 2000s aesthetic cycles back — but cleaner. Fitted hoodies, low-rise silhouettes with high waists, butterfly motifs, and metallics done tastefully.',
        image: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=600&q=80',
        imageAspect: '4/5',
        hashtags: ['#y2kfashion', '#2000saesthetic', '#metallic'],
        source: 'Nylon',
        sourceInitial: 'N',
        likes: '74.5K',
        date: 'Feb 2025',
        palette: ['#C0C0C0', '#FFB3C6', '#B5DEFF', '#FFF0A0'],
        cta: true,
    },
    {
        type: 'outfit', id: 't6',
        title: 'The Indian Street Edit',
        summary: 'Mumbai and Delhi street style is merging heritage craft with contemporary silhouettes — block-printed oversized shirts, Ajrakh co-ords, and handloom hoodies.',
        image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80',
        imageAspect: '3/4',
        hashtags: ['#indianstreetStyle', '#handloom', '#blockprint'],
        source: 'Grazia India',
        sourceInitial: 'G',
        likes: '41.8K',
        date: 'Mar 2025',
        palette: ['#C1440E', '#F4A261', '#264653', '#E9C46A'],
        cta: true,
    },

    /* ── EDITORIAL / TEXT-ONLY CARDS ───────────────────────────── */
    {
        type: 'editorial', id: 'e1',
        title: 'Why "Underconsumption Core" Is Fashion\'s Most Radical Trend',
        summary: 'The most subversive thing you can do in 2025 isn\'t wear the latest drop — it\'s not buying it at all. Underconsumption core asks: what if we just wore what we already own?',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
        imageAspect: '16/9',
        hashtags: ['#underconsumption', '#slowfashion', '#capsulewardrobe'],
        source: 'The Guardian Fashion',
        sourceInitial: 'G',
        likes: '112K',
        date: 'Mar 2025',
        palette: null,
        cta: false,
    },
    {
        type: 'editorial', id: 'e2',
        title: 'Gen Z Is Buying Vintage — And Selling It Back as Art',
        summary: 'Thrift flipping is no longer just reselling. A new wave of young designers is sourcing vintage blanks and printing limited custom runs — blurring the line between fashion and art.',
        image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80',
        imageAspect: '4/3',
        hashtags: ['#vintagefashion', '#thriftflip', '#customprint'],
        source: 'i-D Magazine',
        sourceInitial: 'i',
        likes: '55.3K',
        date: 'Feb 2025',
        palette: null,
        cta: false,
    },

    /* ── QUOTE CARDS ────────────────────────────────────────────── */
    {
        type: 'quote', id: 'q1',
        quote: 'Fashion is the armour to survive the reality of everyday life.',
        author: '— Bill Cunningham',
    },
    {
        type: 'quote', id: 'q2',
        quote: 'The most courageous act is still to think for yourself. Aloud.',
        author: '— Coco Chanel',
    },

    /* ── PALETTE CARDS ──────────────────────────────────────────── */
    {
        type: 'palette', id: 'p1',
        title: 'S/S 2025: Mocha & Bone',
        subtitle: 'The season\'s defining earth tone palette — warm, grounded, wearable.',
        colors: [
            { hex: '#6B4E3D', name: 'Espresso' },
            { hex: '#A67C64', name: 'Mocha' },
            { hex: '#D4B99A', name: 'Camel' },
            { hex: '#EDE0D4', name: 'Bone' },
            { hex: '#F8F3EE', name: 'Ivory' },
        ],
    },
    {
        type: 'palette', id: 'p2',
        title: 'Neo-Brutalism: Raw Contrast',
        subtitle: 'Unfinished edges meet saturated accent colours in this bold palette.',
        colors: [
            { hex: '#0D0D0D', name: 'Pitch' },
            { hex: '#F5F5F5', name: 'Raw White' },
            { hex: '#E63946', name: 'Signal Red' },
            { hex: '#457B9D', name: 'Steel Blue' },
            { hex: '#F4D35E', name: 'Mustard' },
        ],
    },
    {
        type: 'palette', id: 'p3',
        title: 'Digital Sage: Tech Meets Nature',
        subtitle: 'Muted greens crossing with screen-glow greys define the tech-naturalist mood.',
        colors: [
            { hex: '#2D3A2E', name: 'Forest Dark' },
            { hex: '#5C7A5E', name: 'Sage' },
            { hex: '#A8C5AA', name: 'Mist' },
            { hex: '#C8D8C9', name: 'Pale Fern' },
            { hex: '#1C1F1C', name: 'Console' },
        ],
    },

    /* ── HASHTAG CLOUD CARDS ────────────────────────────────────── */
    {
        type: 'hashtags', id: 'h1',
        title: 'Trending This Week on Instagram',
        tags: [
            { tag: '#OOTD', size: 'large' },
            { tag: '#quietluxury', size: 'large' },
            { tag: '#streetstyle', size: 'large' },
            { tag: '#fashionweek', size: 'medium' },
            { tag: '#minimalfashion', size: 'medium' },
            { tag: '#sustainablefashion', size: 'medium' },
            { tag: '#vintagestyle', size: 'medium' },
            { tag: '#techwear', size: 'small' },
            { tag: '#dopaminedressing', size: 'small' },
            { tag: '#capsulewardrobe', size: 'small' },
            { tag: '#indianfashion', size: 'medium' },
            { tag: '#hypebeast', size: 'small' },
            { tag: '#thriftflip', size: 'small' },
            { tag: '#y2kaesthetic', size: 'medium' },
            { tag: '#linen', size: 'small' },
        ],
    },
    {
        type: 'hashtags', id: 'h2',
        title: 'Rising Micro-Trends',
        tags: [
            { tag: '#gorpcore', size: 'large' },
            { tag: '#balletcore', size: 'large' },
            { tag: '#cowboycore', size: 'medium' },
            { tag: '#darkacademia', size: 'medium' },
            { tag: '#cottagecore', size: 'small' },
            { tag: '#cleanfashion', size: 'medium' },
            { tag: '#normcore', size: 'small' },
            { tag: '#regencycore', size: 'small' },
            { tag: '#oldmoney', size: 'large' },
            { tag: '#workwear', size: 'medium' },
        ],
    },
];

/* ── RENDERER ────────────────────────────────────────────────── */
let currentTrendsFilter = 'all';

function renderTrends(filter) {
    filter = filter || currentTrendsFilter;
    currentTrendsFilter = filter;

    const grid = document.getElementById('trends-grid');
    if (!grid) return;

    // Filter
    const items = filter === 'all'
        ? TREND_ITEMS
        : TREND_ITEMS.filter(item => item.type === filter);

    // Clear + rebuild
    grid.innerHTML = '';

    let ci = 0;
    items.forEach(item => {
        let el;
        if      (item.type === 'quote')    el = buildQuoteCard(item, ci);
        else if (item.type === 'palette')  el = buildPaletteCard(item, ci);
        else if (item.type === 'hashtags') el = buildHashtagCard(item, ci);
        else                               el = buildOutfitCard(item, ci);

        if (el) { grid.appendChild(el); ci++; }
    });

    // Update active filter button
    document.querySelectorAll('.trends-filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
}

function buildOutfitCard(item, ci) {
    const div = document.createElement('div');
    div.className = 'trend-card';
    div.style.setProperty('--ci', ci);

    const paletteHTML = item.palette ? `
    <div class="trend-palette">
      ${item.palette.map(c => `<span class="trend-palette-swatch" style="background:${c}" title="${c}"></span>`).join('')}
      <span class="trend-palette-label">Season palette</span>
    </div>` : '';

    const ctaHTML = item.cta ? `
    <button class="trend-card-cta" onclick="openDesignerWithProduct('mens-tee','black');event.stopPropagation()">
      Design This →
    </button>` : '';

    div.innerHTML = `
    <div class="trend-card-img" style="aspect-ratio:${item.imageAspect}">
      <img src="${item.image}" alt="${item.title}" loading="lazy" />
      <div class="trend-card-img-glass">
        ${item.hashtags.map(h => `<span class="trend-hashtag">${h}</span>`).join('')}
      </div>
      ${ctaHTML}
    </div>
    <div class="trend-card-body">
      <div class="trend-card-meta">
        <span class="trend-card-category">${item.type === 'editorial' ? 'Editorial' : 'Outfit Inspo'}</span>
        <span class="trend-card-dot"></span>
        <span class="trend-card-date">${item.date}</span>
      </div>
      <h3 class="trend-card-title">${item.title}</h3>
      <p class="trend-card-summary">${item.summary}</p>
      ${paletteHTML}
      <div class="trend-card-footer">
        <div class="trend-card-source">
          <div class="trend-source-avatar">${item.sourceInitial}</div>
          <span>${item.source}</span>
        </div>
        <div class="trend-card-likes">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          ${item.likes}
        </div>
      </div>
    </div>
  `;
    return div;
}

function buildQuoteCard(item, ci) {
    const div = document.createElement('div');
    div.className = 'trend-quote-card';
    div.style.setProperty('--ci', ci);
    div.innerHTML = `
    <div class="trend-quote-mark">"</div>
    <p class="trend-quote-text">${item.quote}</p>
    <div class="trend-quote-author">${item.author}</div>
  `;
    return div;
}

function buildPaletteCard(item, ci) {
    const div = document.createElement('div');
    div.className = 'trend-palette-card';
    div.style.setProperty('--ci', ci);
    div.innerHTML = `
    <h3 class="trend-palette-card-title">${item.title}</h3>
    <p class="trend-palette-card-sub">${item.subtitle}</p>
    <div class="trend-palette-strip">
      ${item.colors.map(c =>
        `<div class="trend-palette-strip-swatch" style="background:${c.hex}" title="${c.name}"></div>`
    ).join('')}
    </div>
    <div class="trend-palette-codes">
      ${item.colors.map(c =>
        `<span class="trend-palette-code">${c.hex}</span>`
    ).join('')}
    </div>
  `;
    return div;
}

function buildHashtagCard(item, ci) {
    const div = document.createElement('div');
    div.className = 'trend-hashtag-card';
    div.style.setProperty('--ci', ci);
    div.innerHTML = `
    <h3 class="trend-hashtag-card-title">${item.title}</h3>
    <div class="trend-hashtag-cloud">
      ${item.tags.map(t =>
        `<span class="trend-hashtag-chip ${t.size}">${t.tag}</span>`
    ).join('')}
    </div>
  `;
    return div;
}

/* ── FILTER CLICK HANDLER ────────────────────────────────────── */
document.addEventListener('click', e => {
    const btn = e.target.closest('.trends-filter-btn');
    if (!btn) return;
    renderTrends(btn.dataset.filter);
});