// Shared design tokens for the Cityverse Digital Twin UI system
// Two modes share the same semantic roles — the visuals differ, the data doesn't.

const DT = {
  // Expert mode — cool charcoal, scientific. Tuned for daylight + VR/AR legibility:
  // higher-contrast panel backgrounds, brighter text tiers, stronger borders.
  expert: {
    bg0: 'oklch(0.16 0.012 230)',
    bg1: 'oklch(0.2 0.014 230)',
    bg2: 'oklch(0.25 0.016 230)',
    bgInset: 'oklch(0.13 0.011 230)',
    line: 'oklch(0.42 0.02 230 / 0.8)',
    lineSoft: 'oklch(0.36 0.016 230 / 0.55)',
    text0: 'oklch(0.99 0.005 220)',   // near-white — body + values
    text1: 'oklch(0.9 0.008 225)',    // strong secondary
    text2: 'oklch(0.78 0.012 228)',   // labels (was 0.58 — too dim)
    text3: 'oklch(0.66 0.012 230)',   // quietest — still readable
    accent: 'oklch(0.82 0.14 190)',
    ok:   'oklch(0.88 0.18 135)',
    warn: 'oklch(0.86 0.16 75)',
    crit: 'oklch(0.78 0.18 20)',
    info: 'oklch(0.82 0.14 230)',
    mono: "'IBM Plex Mono', ui-monospace, Menlo, monospace",
    sans: "'IBM Plex Sans', system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif",
    cond: "'IBM Plex Sans Condensed', 'IBM Plex Sans', system-ui",
  },
  // Kids mode — bright, warm, friendly
  kids: {
    bg0: '#FFF8EC',
    bg1: '#FFFFFF',
    bg2: '#FFEFD4',
    line: '#E9DDC2',
    lineSoft: '#F2E7CE',
    text0: '#2B2418',
    text1: '#4A3E2A',
    text2: '#7C6A4B',
    text3: '#A89878',
    happy:  '#27B267',
    sunny:  '#F2B628',
    cloudy: '#7BB7E6',
    rainy:  '#4E8FD1',
    busy:   '#F38B3C',
    cozy:   '#9E74D8',
    alert:  '#E65A4B',
    sans: "'Baloo 2', 'Nunito', system-ui, sans-serif",
    display: "'Baloo 2', 'Fredoka', system-ui, sans-serif",
  },
};

// Shared building archetypes used across both modes
const BUILDINGS = [
  { id: 'factory-01',   name: 'Factory 01',   kids: 'The Big Factory',      type: 'Industrial', kidsType: 'Factory',    emoji: '🏭',
    occ: 42,  cap: 60,  demand: 84.2, base: 72.0, weather: 1.17, status: 'busy' },
  { id: 'office-01',    name: 'Office 01',    kids: 'The Glass Office',     type: 'Office',     kidsType: 'Workplace',  emoji: '🏢',
    occ: 138, cap: 150, demand: 46.8, base: 38.0, weather: 1.34, status: 'busy' },
  { id: 'utility-01',   name: 'Utility 01',   kids: 'The Power Station',    type: 'Utility',    kidsType: 'Helper',     emoji: '⚡',
    occ: 12,  cap: 12,  demand: 38.4, base: 36.0, weather: 1.07, status: 'steady' },
  { id: 'apartment-01', name: 'Apartment 01', kids: 'Apartment Tower',      type: 'Apartment',  kidsType: 'Home',       emoji: '🏬',
    occ: 54,  cap: 80,  demand: 28.6, base: 24.0, weather: 1.09, status: 'ok' },
  { id: 'retail-01',    name: 'Retail 01',    kids: 'The Shopping Strip',   type: 'Retail',     kidsType: 'Shop',       emoji: '🏪',
    occ: 31,  cap: 35,  demand: 22.1, base: 18.0, weather: 1.22, status: 'busy' },
  { id: 'school-01',    name: 'School 01',    kids: 'The School',           type: 'Civic',      kidsType: 'School',     emoji: '🏫',
    occ: 264, cap: 320, demand: 18.7, base: 16.0, weather: 1.17, status: 'ok' },
  { id: 'villa-a',      name: 'Villa A',      kids: 'Little House A',       type: 'Villa',      kidsType: 'Home',       emoji: '🏡',
    occ: 2,   cap: 5,   demand:  6.9, base:  8.0, weather: 1.11, status: 'cozy' },
  { id: 'villa-b',      name: 'Villa B',      kids: 'Little House B',       type: 'Villa',      kidsType: 'Home',       emoji: '🏡',
    occ: 2,   cap: 5,   demand:  5.8, base:  7.0, weather: 1.10, status: 'cozy' },
];

Object.assign(window, { DT, BUILDINGS });

// --- Weather ---------------------------------------------------------------
// Shared semantic palette + icon vocabulary. Condition codes are the single
// source of truth across Expert and Kids modes — only the voice changes.

const WEATHER = {
  // Canonical condition codes (what the sim emits)
  codes: {
    clear:         { expert: 'Clear',           kids: 'Sunny',       icon: 'sun',    tone: 'sunny'  },
    partlyCloudy:  { expert: 'Partly Cloudy',   kids: 'A Bit Cloudy',icon: 'sunCloud', tone: 'mild' },
    cloudy:        { expert: 'Overcast',        kids: 'Cloudy',      icon: 'cloud',  tone: 'cloudy' },
    rain:          { expert: 'Rain',            kids: 'Rainy',       icon: 'rain',   tone: 'rainy'  },
    storm:         { expert: 'Thunderstorm',    kids: 'Stormy',      icon: 'storm',  tone: 'alert'  },
    snow:          { expert: 'Snow',            kids: 'Snowy',       icon: 'snow',   tone: 'snowy'  },
    fog:           { expert: 'Fog',             kids: 'Foggy',       icon: 'fog',    tone: 'cloudy' },
    clearNight:    { expert: 'Clear · Night',   kids: 'Nighttime',   icon: 'moon',   tone: 'night'  },
  },
  // Expert palette — scientific, calm
  ex: {
    sunny:  'oklch(0.84 0.14 80)',
    mild:   'oklch(0.8 0.1 150)',
    cloudy: 'oklch(0.74 0.04 235)',
    rainy:  'oklch(0.72 0.09 230)',
    snowy:  'oklch(0.9 0.02 220)',
    night:  'oklch(0.68 0.08 265)',
    hot:    'oklch(0.72 0.15 35)',
    cold:   'oklch(0.78 0.1 230)',
  },
  // Kids palette — saturated but soft
  k: {
    sunny:  '#F5B935',
    mild:   '#6BCF9C',
    cloudy: '#9EC7EA',
    rainy:  '#4E8FD1',
    snowy:  '#D4E7F2',
    night:  '#6C5EB5',
    hot:    '#E87D4C',
    cold:   '#6FA8D6',
  },
};

// Sample live weather reading (what BuildingUpdatedAt looks like from the sim)
const WX = {
  condition: 'partlyCloudy',
  temperature: 21.4,       // °C
  feelsLike: 19.8,
  humidity: 58,            // %
  pressure: 1014,          // hPa
  windSpeed: 14.2,         // km/h
  windDir: 240,            // degrees (coming from)
  windCardinal: 'WSW',
  cloudCover: 45,          // %
  precipitation: 0.2,      // mm/h
  isDaytime: true,
  season: 'Autumn',
  updatedAt: '14:32:07',
};

Object.assign(window, { WEATHER, WX });

// --- Power plants ---------------------------------------------------------
// Single source of truth for plant types + semantic palette. Expert and Kids
// render different voices on top of the same PlantState.

const POWER = {
  types: {
    solar:   { expert: 'Solar',        kids: 'Sun power',    icon: 'solar',   tone: 'solar',   clean: 3,
               kidsBlurb: 'Turns sunlight into electricity.', wxSensitive: true,  emissions: 'none' },
    wind:    { expert: 'Wind',         kids: 'Wind power',   icon: 'wind',    tone: 'wind',    clean: 3,
               kidsBlurb: 'Turns wind into electricity.',     wxSensitive: true,  emissions: 'none' },
    gas:     { expert: 'Gas · CCGT',   kids: 'Gas plant',    icon: 'gas',     tone: 'gas',     clean: 1,
               kidsBlurb: 'Burns gas to make electricity.',   wxSensitive: false, emissions: 'mid'  },
    oil:     { expert: 'Oil',          kids: 'Oil plant',    icon: 'oil',     tone: 'oil',     clean: 0,
               kidsBlurb: 'Burns oil to make electricity.',   wxSensitive: false, emissions: 'high' },
    nuclear: { expert: 'Nuclear',      kids: 'Nuclear plant',icon: 'nuclear', tone: 'nuclear', clean: 2,
               kidsBlurb: 'Uses special atoms to make heat and power.', wxSensitive: false, emissions: 'low' },
    battery: { expert: 'Battery · BESS',kids: 'Battery',     icon: 'battery', tone: 'battery', clean: 3,
               kidsBlurb: 'Stores extra energy for later.',   wxSensitive: false, emissions: 'none' },
  },
  ex: {
    solar:   'oklch(0.84 0.14 78)',
    wind:    'oklch(0.82 0.09 200)',
    gas:     'oklch(0.74 0.09 55)',
    oil:     'oklch(0.66 0.09 30)',
    nuclear: 'oklch(0.82 0.13 160)',
    battery: 'oklch(0.78 0.12 295)',
  },
  k: {
    solar:   '#F5B935',
    wind:    '#6DB7D9',
    gas:     '#D89A5A',
    oil:     '#A76A4A',
    nuclear: '#5FB98A',
    battery: '#9E74D8',
  },
};

const PLANTS = [
  { id: 'solar-01',   name: 'Solar Farm 01',   kids: 'Sunny Field',    type: 'solar',   online: true,  output: 38.4, capacity: 60,  weatherFactor: 0.82, updatedAt: '14:32:07' },
  { id: 'wind-01',    name: 'Wind Farm 01',    kids: 'Windy Hill',     type: 'wind',    online: true,  output: 22.1, capacity: 40,  weatherFactor: 1.14, updatedAt: '14:32:07' },
  { id: 'gas-01',     name: 'Gas Plant 01',    kids: 'Gas Plant',      type: 'gas',     online: true,  output: 54.2, capacity: 80,  weatherFactor: 1.00, updatedAt: '14:32:07' },
  { id: 'oil-01',     name: 'Oil Plant 01',    kids: 'Oil Plant',      type: 'oil',     online: false, output: 0.0,  capacity: 50,  weatherFactor: 1.00, updatedAt: '14:28:40' },
  { id: 'nuclear-01', name: 'Nuclear · Unit A',kids: 'Nuclear Helper', type: 'nuclear', online: true,  output: 92.6, capacity: 100, weatherFactor: 1.00, updatedAt: '14:32:07' },
  { id: 'battery-01', name: 'BESS · Bank 1',   kids: 'Big Battery',    type: 'battery', online: true,  output: 12.3, capacity: 30,  weatherFactor: 1.00, updatedAt: '14:32:07' },
];

Object.assign(window, { POWER, PLANTS });
