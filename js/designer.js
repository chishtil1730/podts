let designerState = {
  garmentId: 'mens-tee',
  colorId: 'black',
  customColor: null, // hex string when user picks custom
  size: 'M',
  printSrc: null,
};

function initDesigner() {
  renderGarmentSelect();
  renderColorSwatches();
  updateMockup();
}

function renderGarmentSelect() {
  const container = document.getElementById('garment-select');
  if (!container) return;
  container.innerHTML = '';
  GARMENTS.forEach(g => {
    const btn = document.createElement('button');
    btn.className = 'garment-btn' + (g.id === designerState.garmentId ? ' active' : '');
    btn.innerHTML = `<span class="garment-btn-icon">${g.icon}</span><span class="garment-btn-label">${g.label}</span>`;
    btn.onclick = () => selectGarment(g.id);
    container.appendChild(btn);
  });
}

function renderColorSwatches() {
  const container = document.getElementById('color-swatches');
  if (!container) return;
  container.innerHTML = '';
  COLORS.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'color-swatch' + (c.id === designerState.colorId && !designerState.customColor ? ' active' : '');
    btn.style.background = c.hex;
    btn.title = c.name;
    btn.onclick = () => selectColor(c.id);
    container.appendChild(btn);
  });

  // Color wheel button + hidden input
  const wheelWrap = document.createElement('div');
  wheelWrap.className = 'color-wheel-wrap';

  const input = document.createElement('input');
  input.type = 'color';
  input.id = 'custom-color-input';
  input.value = designerState.customColor || '#aabbcc';
  input.className = 'color-wheel-input';
  input.oninput = (e) => {
    designerState.customColor = e.target.value;
    designerState.colorId = null;
    container.querySelectorAll('.color-swatch:not(.color-wheel-btn)').forEach(s => s.classList.remove('active'));
    wheelBtn.classList.add('active');
    updateMockupColor();
  };

  const wheelBtn = document.createElement('button');
  wheelBtn.className = 'color-swatch color-wheel-btn' + (designerState.customColor ? ' active' : '');
  wheelBtn.title = 'Custom color';
  wheelBtn.style.background = 'conic-gradient(red,yellow,lime,cyan,blue,magenta,red)';
  wheelBtn.onclick = () => input.click();

  wheelWrap.appendChild(input);
  wheelWrap.appendChild(wheelBtn);
  container.appendChild(wheelWrap);
}

function selectGarment(id) {
  designerState.garmentId = id;
  renderGarmentSelect();
  updateMockup();
  updateDesignerPrice();
}

function selectColor(id) {
  designerState.colorId = id;
  designerState.customColor = null;
  renderColorSwatches();
  updateMockup();
}

function updateMockupColor() {
  updateMockup();
  const label = document.getElementById('mockup-label-text');
  const garment = GARMENTS.find(g => g.id === designerState.garmentId) || GARMENTS[0];
  if (label) label.textContent = garment.label + ' — Custom — ' + designerState.size;
}

function selectSize(size) {
  designerState.size = size;
  document.querySelectorAll('.size-pill').forEach(p => {
    p.classList.toggle('active', p.dataset.size === size);
  });
  updateMockup();
}

function switchPrintTab(tab) {
  document.querySelectorAll('.print-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === `tab-${tab}`));
}

function getActiveColor() {
  if (designerState.customColor) {
    return { id: 'custom', hex: designerState.customColor, name: 'Custom', shirtFill: designerState.customColor };
  }
  return COLORS.find(c => c.id === designerState.colorId) || COLORS[0];
}

function updateMockup() {
  const color = getActiveColor();
  const garment = GARMENTS.find(g => g.id === designerState.garmentId) || GARMENTS[0];
  const mainPath = getShirtSVGPath(designerState.garmentId);
  const collarP = getCollarPath(designerState.garmentId);
  const isLight = isLightColor(color.shirtFill);

  const svg = document.getElementById('shirt-svg');
  if (!svg) return;

  // Print image embedded inside SVG using clipPath for perfect clipping
  const printSection = designerState.printSrc ? `
    <defs>
      <clipPath id="shirt-clip">
        <path d="${mainPath}"/>
      </clipPath>
    </defs>
    <image
      href="${designerState.printSrc}"
      x="90" y="115" width="120" height="120"
      clip-path="url(#shirt-clip)"
      preserveAspectRatio="xMidYMid meet"
      style="opacity:${isLight ? '0.88' : '0.92'}"
    />` : '';

  svg.innerHTML = `
    <path d="${mainPath}" fill="${color.shirtFill}" stroke="${isLight ? '#d8d8d8' : 'none'}" stroke-width="1"/>
    ${printSection}
    <path d="${collarP}" fill="${isLight ? '#e0e0e0' : 'rgba(255,255,255,0.07)'}" stroke="${isLight ? '#ccc' : 'rgba(255,255,255,0.13)'}" stroke-width="1"/>
  `;

  const label = document.getElementById('mockup-label-text');
  if (label) label.textContent = `${garment.label} — ${color.name} — ${designerState.size}`;
}

function isLightColor(hex) {
  const c = hex.replace('#','');
  const r = parseInt(c.substring(0,2),16);
  const g = parseInt(c.substring(2,4),16);
  const b = parseInt(c.substring(4,6),16);
  return (r*299 + g*587 + b*114) / 1000 > 160;
}

function updateDesignerPrice() {
  const garment = GARMENTS.find(g => g.id === designerState.garmentId);
  const el = document.getElementById('designer-price');
  if (el && garment) el.textContent = `₹ ${garment.basePrice.toLocaleString('en-IN')}`;
}

async function generateAIImage() {
    const prompt = document.getElementById('ai-prompt').value.trim();
    if (!prompt) { showToast('Please enter a design prompt'); return; }

    const btn = document.getElementById('generate-btn');
    const btnText = document.getElementById('gen-btn-text');
    btn.classList.add('loading');
    btnText.textContent = 'Generating…';

    const OPENROUTER_API_KEY = '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';

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'http://localhost',
                'X-Title': 'PODTS Designer'
            },
            body: JSON.stringify({
                model: 'google/gemini-2.5-flash-image',
                modalities: ['image'],
                messages: [{
                    role: 'user',
                    content: `"${prompt}"`
                }]
            })
        });

        const data = await response.json();

        if (data.error) throw new Error(data.error.message);

        const imageUrl = data.choices[0].message.images[0].image_url.url;
        applyPrint(imageUrl); // already base64 data URL — use directly
        showToast('Design generated! ✦');

    } catch (err) {
        console.error(err);
        if (err.message.includes('credits')) {
            showToast('Out of OpenRouter credits. Top up at openrouter.ai');
        } else {
            showToast('Error: ' + err.message);
        }
    } finally {
        btn.classList.remove('loading');
        btnText.textContent = '✦ Generate Print';
    }
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { showToast('File too large (max 5MB)'); return; }

  const reader = new FileReader();
  reader.onload = (e) => {
    applyPrint(e.target.result);
    showToast('Image uploaded ✓');
  };
  reader.readAsDataURL(file);
}

function applyPrint(src) {
  designerState.printSrc = src;
  const previewSection = document.getElementById('print-preview-section');
  const previewImg = document.getElementById('print-preview-img');
  if (previewSection) previewSection.style.display = 'block';
  if (previewImg) previewImg.src = src;
  updateMockup();
}

function removePrint() {
  designerState.printSrc = null;
  const previewSection = document.getElementById('print-preview-section');
  if (previewSection) previewSection.style.display = 'none';
  document.getElementById('ai-prompt').value = '';
  updateMockup();
}

function addDesignToCart() {
  const garment = GARMENTS.find(g => g.id === designerState.garmentId);
  addToCart({
    garmentId: designerState.garmentId,
    colorId: designerState.colorId,
    size: designerState.size,
    printSrc: designerState.printSrc,
    price: garment?.basePrice || 799,
  });
}

function openDesignerWithProduct(garmentId, colorId) {
  designerState.garmentId = garmentId || 'mens-tee';
  designerState.colorId = colorId || 'white';
  showPage('designer');
  setTimeout(() => {
    renderGarmentSelect();
    renderColorSwatches();
    updateMockup();
    updateDesignerPrice();
  }, 50);
}
