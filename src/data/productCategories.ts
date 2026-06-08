/**
 * PRODUCT_CATEGORIES_DATA
 * Distribution Company product portfolio categories.
 * Each category has:
 *   - id           unique slug
 *   - name         display name
 *   - emoji        visual identifier
 *   - tempRange    storage temperature requirement
 *   - shelfLife    typical shelf life / rotation urgency
 *   - keyRisks     category-specific handling risks
 *   - handling     critical handling notes injected into AI prompt
 *   - examples     sample SKU types shown in UI
 */

export interface ProductCategory {
  id: string;
  name: string;
  emoji: string;
  tempRange: string;
  shelfLife: string;
  keyRisks: string[];
  handling: string;
  examples: string[];
}

export const PRODUCT_CATEGORIES_DATA: ProductCategory[] = [
  {
    id: 'dry',
    name: 'Dry Goods',
    emoji: '📦',
    tempRange: 'Ambient (15–25°C)',
    shelfLife: '6–24 months',
    keyRisks: ['Moisture damage', 'Pest infestation', 'Improper stacking'],
    handling: 'Ambient storage, FIFO rotation, stack height limits enforced, humidity monitoring',
    examples: ['Rice', 'Flour', 'Sugar', 'Pasta', 'Cereals', 'Snacks', 'Coffee', 'Tea'],
  },
  {
    id: 'canned',
    name: 'Canned & Preserved',
    emoji: '🥫',
    tempRange: 'Ambient (10–25°C)',
    shelfLife: '1–5 years',
    keyRisks: ['Dented can rejection', 'Label damage', 'Botulism risk from damaged seals'],
    handling: 'Inspect seals on GRN, reject swollen/dented cans, FIFO, avoid direct sunlight',
    examples: ['Canned tomatoes', 'Canned tuna', 'Canned beans', 'Preserved vegetables', 'Sauces', 'Jams'],
  },
  {
    id: 'cool_chain',
    name: 'Cool Chain (Chilled)',
    emoji: '❄️',
    tempRange: 'Chilled (0–8°C)',
    shelfLife: '7–90 days',
    keyRisks: ['Temperature excursion', 'Cold chain break', 'Cross-contamination'],
    handling: 'Maintain 0–8°C at all points, pre-cool vehicles before loading, continuous temp logging, FEFO rotation, no ambient exposure >30 min',
    examples: ['Dairy', 'Yoghurt', 'Deli meats', 'Processed cheese', 'Hummus', 'Fresh pasta'],
  },
  {
    id: 'frozen',
    name: 'Frozen',
    emoji: '🧊',
    tempRange: 'Frozen (−18°C or below)',
    shelfLife: '3–24 months',
    keyRisks: ['Thaw-and-refreeze', 'Freezer burn', 'Power outage loss'],
    handling: 'Maintain −18°C or below, blast freeze after thaw incidents, dedicated frozen vehicles, defrost logs, FEFO strictly enforced',
    examples: ['Frozen meat', 'Frozen vegetables', 'Ice cream', 'Frozen meals', 'Frozen seafood', 'Pizza'],
  },
  {
    id: 'fresh',
    name: 'Fresh Produce',
    emoji: '🥦',
    tempRange: 'Chilled (2–10°C, product specific)',
    shelfLife: '1–14 days',
    keyRisks: ['Rapid spoilage', 'Ethylene damage', 'Bruising & physical damage'],
    handling: 'Same-day or next-day delivery preferred, gentle handling, separate from ethylene-sensitive items, daily stock checks, no stacking heavy on light',
    examples: ['Fruits', 'Vegetables', 'Herbs', 'Salad leaves', 'Mushrooms', 'Sprouts'],
  },
  {
    id: 'juice',
    name: 'Juices & Nectars',
    emoji: '🧃',
    tempRange: 'Ambient or Chilled (product specific)',
    shelfLife: '6 months–2 years (ambient) / 14–45 days (chilled)',
    keyRisks: ['UV light degradation', 'Fermentation after opening', 'Label compliance'],
    handling: 'UHT juices ambient; fresh-pressed chilled; avoid freezing unless specified; FEFO; upright storage to prevent leakage',
    examples: ['Orange juice', 'Apple juice', 'Mango nectar', 'Mixed fruit', 'Tomato juice', 'Vegetable blends'],
  },
  {
    id: 'water',
    name: 'Water & Beverages',
    emoji: '💧',
    tempRange: 'Ambient (away from heat & direct sunlight)',
    shelfLife: '1–2 years',
    keyRisks: ['PET leaching from heat exposure', 'Pallet collapse', 'Counterfeit water risk'],
    handling: 'Store away from chemicals & strong odours, no direct sunlight, max stack height per pallet spec, seal integrity check on GRN',
    examples: ['Still water', 'Sparkling water', 'Flavoured water', 'Sports drinks', 'Energy drinks', 'Electrolyte drinks'],
  },
  {
    id: 'confectionery',
    name: 'Confectionery & Chocolate',
    emoji: '🍫',
    tempRange: 'Controlled ambient (16–21°C)',
    shelfLife: '6–18 months',
    keyRisks: ['Chocolate bloom from temperature fluctuation', 'Melting', 'Pest attraction'],
    handling: 'Keep below 22°C, avoid humidity >50%, separate from strong odours, FIFO, sealed storage areas',
    examples: ['Chocolate bars', 'Gum', 'Candy', 'Lollipops', 'Marshmallows', 'Wafers', 'Biscuits'],
  },
  {
    id: 'personal_care',
    name: 'Personal Care & Hygiene',
    emoji: '🧴',
    tempRange: 'Ambient (15–30°C)',
    shelfLife: '12–36 months',
    keyRisks: ['Batch recall compliance', 'Counterfeit product risk', 'Regulatory label requirements'],
    handling: 'Segregate from food products, check batch codes & expiry on GRN, store upright, handle aerosols per safety regulations',
    examples: ['Shampoo', 'Soap', 'Deodorant', 'Toothpaste', 'Sanitiser', 'Nappies', 'Skincare'],
  },
  {
    id: 'household',
    name: 'Household & Cleaning',
    emoji: '🧹',
    tempRange: 'Ambient (away from heat sources)',
    shelfLife: '1–3 years',
    keyRisks: ['Chemical spill & contamination', 'Incompatible chemical storage', 'Flammable product handling'],
    handling: 'Segregate from food & personal care, hazmat compliance for bleach & solvents, ventilated storage, PPE for pickers',
    examples: ['Detergent', 'Bleach', 'Dish soap', 'Floor cleaner', 'Air freshener', 'Laundry pods'],
  },
  {
    id: 'tobacco',
    name: 'Tobacco & Related',
    emoji: '🚬',
    tempRange: 'Controlled ambient (18–22°C, 60–65% RH)',
    shelfLife: '12–24 months',
    keyRisks: ['Regulatory track & trace compliance', 'Counterfeit & diversion', 'Humidity causing mould'],
    handling: 'Licensed storage required, humidity-controlled environment, strict stock traceability, batch reconciliation mandatory',
    examples: ['Cigarettes', 'Tobacco pouches', 'Cigars', 'Heated tobacco', 'E-cigarettes', 'Filters'],
  },
  {
    id: 'bakery',
    name: 'Bakery & Bread',
    emoji: '🍞',
    tempRange: 'Ambient or Chilled (product specific)',
    shelfLife: '1–21 days',
    keyRisks: ['Rapid staling', 'Mould growth', 'Crushing during transport'],
    handling: 'Bread trays, avoid compression, daily delivery cycle preferred, FEFO strict, check for mould on GRN, keep dry',
    examples: ['Bread', 'Pita', 'Tortillas', 'Croissants', 'Cakes', 'Muffins', 'Pastries'],
  },
];
