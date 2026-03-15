const COLORS = [
  { id: 'white',   hex: '#FFFFFF', name: 'White',    shirtFill: '#F5F5F5', stroke: '#e0e0e0' },
  { id: 'black',   hex: '#111110', name: 'Black',    shirtFill: '#111110', stroke: 'none' },
  { id: 'navy',    hex: '#1B2A4A', name: 'Navy',     shirtFill: '#1B2A4A', stroke: 'none' },
  { id: 'sage',    hex: '#8A9E85', name: 'Sage',     shirtFill: '#8A9E85', stroke: 'none' },
  { id: 'stone',   hex: '#B0A898', name: 'Stone',    shirtFill: '#B0A898', stroke: 'none' },
  { id: 'crimson', hex: '#8B2635', name: 'Crimson',  shirtFill: '#8B2635', stroke: 'none' },
];

const GARMENTS = [
  { id: 'mens-tee',    label: "Men's Tee",   icon: '👕', basePrice: 799,  category: 'mens' },
  { id: 'womens-tee',  label: "Women's Tee", icon: '👚', basePrice: 799,  category: 'womens' },
  { id: 'hoodie',      label: 'Hoodie',      icon: '🧥', basePrice: 1499, category: 'hoodies' },
  { id: 'polo',        label: 'Polo',        icon: '🎽', basePrice: 999,  category: 'polo' },
  { id: 'oversized',   label: 'Oversized',   icon: '💪', basePrice: 1099, category: 'oversized' },
];

const PRODUCTS = [
  {
    id: 'p1',
    name: 'Classic Heavyweight Tee',
    category: 'mens',
    categoryLabel: "Men's T-Shirts",
    desc: '180 GSM ring-spun cotton. Relaxed fit with ribbed collar.',
    price: 799,
    badge: 'Bestseller',
    garmentId: 'mens-tee',
    defaultColor: 'white',
  },
  {
    id: 'p2',
    name: 'Slim Fit Women\'s Tee',
    category: 'womens',
    categoryLabel: "Women's T-Shirts",
    desc: '160 GSM soft cotton. Flattering slim cut with side seams.',
    price: 799,
    badge: null,
    garmentId: 'womens-tee',
    defaultColor: 'sage',
  },
  {
    id: 'p3',
    name: 'Essential Pullover Hoodie',
    category: 'hoodies',
    categoryLabel: 'Hoodies',
    desc: '350 GSM fleece-lined cotton blend. Kangaroo pocket.',
    price: 1499,
    badge: 'New',
    garmentId: 'hoodie',
    defaultColor: 'navy',
  },
  {
    id: 'p4',
    name: 'Premium Piqué Polo',
    category: 'polo',
    categoryLabel: 'Polo Shirts',
    desc: '220 GSM piqué weave. Three-button placket, ribbed cuffs.',
    price: 999,
    badge: null,
    garmentId: 'polo',
    defaultColor: 'white',
  },
  {
    id: 'p5',
    name: 'Dropped Shoulder Oversized',
    category: 'oversized',
    categoryLabel: 'Oversized Tees',
    desc: '200 GSM cotton. Boxy silhouette, extended sleeves.',
    price: 1099,
    badge: 'Popular',
    garmentId: 'oversized',
    defaultColor: 'stone',
  },
  {
    id: 'p6',
    name: 'Vintage Wash Tee',
    category: 'mens',
    categoryLabel: "Men's T-Shirts",
    desc: '180 GSM garment-washed cotton. Pre-shrunk, worn-in feel.',
    price: 899,
    badge: null,
    garmentId: 'mens-tee',
    defaultColor: 'crimson',
  },
];

// SVG shapes for each garment type (simplified silhouettes)
function getShirtSVGPath(garmentId) {
  const paths = {
    'mens-tee':   'M75 40 L30 80 L60 110 L60 300 L240 300 L240 110 L270 80 L225 40 L195 20 C185 50 115 50 105 20 Z',
    'womens-tee': 'M80 40 L35 75 L62 105 L65 300 L235 300 L238 105 L265 75 L220 40 L195 22 C185 52 115 52 105 22 Z',
    'hoodie':     'M70 40 L20 85 L55 115 L55 310 L245 310 L245 115 L280 85 L230 40 L200 24 C190 22 180 18 175 15 L170 50 C165 55 135 55 130 50 L125 15 C120 18 110 22 100 24 Z',
    'polo':       'M78 42 L32 80 L60 108 L60 290 L240 290 L240 108 L268 80 L222 42 L200 26 C192 50 108 50 100 26 Z',
    'oversized':  'M65 38 L15 85 L55 118 L55 315 L245 315 L245 118 L285 85 L235 38 L205 18 C193 52 107 52 95 18 Z',
  };
  return paths[garmentId] || paths['mens-tee'];
}

function getCollarPath(garmentId) {
  const paths = {
    'mens-tee':   'M105 20 C115 50 185 50 195 20',
    'womens-tee': 'M105 22 C115 52 185 52 195 22',
    'hoodie':     'M130 50 C135 55 165 55 170 50',
    'polo':       'M100 26 C108 50 192 50 200 26 L195 42 L180 48 L150 45 L120 48 L105 42 Z',
    'oversized':  'M95 18 C107 52 193 52 205 18',
  };
  return paths[garmentId] || paths['mens-tee'];
}
