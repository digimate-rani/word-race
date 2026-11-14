// Vocabulary data, levels, world themes, and distractor/word-selection helpers.
// Level 1: 6 worlds x 20 words = 120
// Level 2: 8 worlds x 24 words = 192
// Level 3: 8 worlds x 24 words = 192
// Total: 22 worlds, 504 unique words.

export const LEVELS = [
  {
    id: 1,
    nameHe: 'מתחילים',
    nameEn: 'Beginner',
    icon: '🌱',
    color: '#22c55e',
    darkColor: '#15803d',
    tabBg: '#dcfce7'
  },
  {
    id: 2,
    nameHe: 'בינוניים',
    nameEn: 'Intermediate',
    icon: '⚡',
    color: '#f97316',
    darkColor: '#c2410c',
    tabBg: '#ffedd5'
  },
  {
    id: 3,
    nameHe: 'מתקדמים',
    nameEn: 'Advanced',
    icon: '👑',
    color: '#8b5cf6',
    darkColor: '#6d28d9',
    tabBg: '#ede9fe'
  }
];

export const WORLDS = [
  // ================= LEVEL 1: BEGINNER (1-6) =================
  {
    id: 1,
    level: 1,
    slug: 'animal-jungle',
    nameHe: "ג'ונגל החיות",
    nameEn: 'Animal Jungle',
    icon: '🌴',
    accent: '#22c55e',
    badgeBg: '#dcfce7',
    theme: {
      skyTop: '#38bdf8',
      skyBottom: '#bae6fd',
      sunColor: '#fde047',
      horizonHills: '#15803d',
      groundA: '#4ade80',
      groundB: '#22c55e',
      roadA: '#9a7b56',
      roadB: '#876a48',
      shoulderA: '#fef08a',
      shoulderB: '#16a34a',
      stripe: '#fef9c3',
      gatePalette: ['#f97316', '#0ea5e9', '#a855f7'],
      propType: 'jungle'
    }
  },
  {
    id: 2,
    level: 1,
    slug: 'food-city',
    nameHe: 'עיר האוכל',
    nameEn: 'Food City',
    icon: '🍕',
    accent: '#f97316',
    badgeBg: '#ffedd5',
    theme: {
      skyTop: '#60a5fa',
      skyBottom: '#fbcfe8',
      sunColor: '#fef08a',
      horizonHills: '#f472b6',
      groundA: '#fed7aa',
      groundB: '#fdba74',
      roadA: '#475569',
      roadB: '#334155',
      shoulderA: '#ef4444',
      shoulderB: '#ffffff',
      stripe: '#facc15',
      gatePalette: ['#ec4899', '#14b8a6', '#f59e0b'],
      propType: 'city'
    }
  },
  {
    id: 3,
    level: 1,
    slug: 'color-canyon',
    nameHe: 'קניון הצבעים',
    nameEn: 'Color Canyon',
    icon: '🌈',
    accent: '#a855f7',
    badgeBg: '#f3e8ff',
    theme: {
      skyTop: '#fb7185',
      skyBottom: '#fde047',
      sunColor: '#fffbeb',
      horizonHills: '#c2410c',
      groundA: '#fb923c',
      groundB: '#ea580c',
      roadA: '#6b21a8',
      roadB: '#581c87',
      shoulderA: '#fde047',
      shoulderB: '#ec4899',
      stripe: '#fef08a',
      gatePalette: ['#06b6d4', '#f43f5e', '#84cc16'],
      propType: 'canyon'
    }
  },
  {
    id: 4,
    level: 1,
    slug: 'home-highway',
    nameHe: 'כביש הבית',
    nameEn: 'Home Highway',
    icon: '🏠',
    accent: '#0ea5e9',
    badgeBg: '#e0f2fe',
    theme: {
      skyTop: '#2563eb',
      skyBottom: '#93c5fd',
      sunColor: '#fde047',
      horizonHills: '#3b82f6',
      groundA: '#86efac',
      groundB: '#4ade80',
      roadA: '#3b4252',
      roadB: '#2e3440',
      shoulderA: '#f8fafc',
      shoulderB: '#38bdf8',
      stripe: '#ffffff',
      gatePalette: ['#f97316', '#10b981', '#6366f1'],
      propType: 'home'
    }
  },
  {
    id: 5,
    level: 1,
    slug: 'body-bridge',
    nameHe: 'גשר הגוף',
    nameEn: 'Body Bridge',
    icon: '🌉',
    accent: '#ec4899',
    badgeBg: '#fce7f3',
    theme: {
      skyTop: '#06b6d4',
      skyBottom: '#cffafe',
      sunColor: '#fef08a',
      horizonHills: '#0284c7',
      groundA: '#38bdf8',
      groundB: '#0ea5e9',
      roadA: '#64748b',
      roadB: '#475569',
      shoulderA: '#f43f5e',
      shoulderB: '#facc15',
      stripe: '#e2e8f0',
      gatePalette: ['#ec4899', '#8b5cf6', '#f59e0b'],
      propType: 'bridge'
    }
  },
  {
    id: 6,
    level: 1,
    slug: 'action-airport',
    nameHe: 'שדה התעופה',
    nameEn: 'Action Airport',
    icon: '✈️',
    accent: '#6366f1',
    badgeBg: '#e0e7ff',
    theme: {
      skyTop: '#4f46e5',
      skyBottom: '#fdba74',
      sunColor: '#fde047',
      horizonHills: '#312e81',
      groundA: '#94a3b8',
      groundB: '#64748b',
      roadA: '#1e293b',
      roadB: '#0f172a',
      shoulderA: '#38bdf8',
      shoulderB: '#facc15',
      stripe: '#ffffff',
      gatePalette: ['#06b6d4', '#f97316', '#22c55e'],
      propType: 'airport'
    }
  },

  // ================= LEVEL 2: INTERMEDIATE (7-14) =================
  {
    id: 7,
    level: 2,
    slug: 'sea-world',
    nameHe: 'עולם הים',
    nameEn: 'Sea World',
    icon: '🐠',
    accent: '#0891b2',
    badgeBg: '#cffafe',
    theme: {
      skyTop: '#0284c7',
      skyBottom: '#67e8f9',
      sunColor: '#fef9c3',
      horizonHills: '#0e7490',
      groundA: '#22d3ee',
      groundB: '#06b6d4',
      roadA: '#fde68a',
      roadB: '#fcd34d',
      shoulderA: '#fb7185',
      shoulderB: '#ffffff',
      stripe: '#0284c7',
      gatePalette: ['#f43f5e', '#f59e0b', '#6366f1'],
      propType: 'sea'
    }
  },
  {
    id: 8,
    level: 2,
    slug: 'bug-garden',
    nameHe: 'גן החרקים',
    nameEn: 'Bug Garden',
    icon: '🦋',
    accent: '#65a30d',
    badgeBg: '#ecfccb',
    theme: {
      skyTop: '#38bdf8',
      skyBottom: '#d9f99d',
      sunColor: '#fde047',
      horizonHills: '#4d7c0f',
      groundA: '#a3e635',
      groundB: '#84cc16',
      roadA: '#a16207',
      roadB: '#854d0e',
      shoulderA: '#f472b6',
      shoulderB: '#fef08a',
      stripe: '#fef9c3',
      gatePalette: ['#ec4899', '#8b5cf6', '#f97316'],
      propType: 'garden'
    }
  },
  {
    id: 9,
    level: 2,
    slug: 'weather-mountain',
    nameHe: 'הר מזג האוויר',
    nameEn: 'Weather Mountain',
    icon: '⛰️',
    accent: '#0284c7',
    badgeBg: '#e0f2fe',
    theme: {
      skyTop: '#1d4ed8',
      skyBottom: '#e0f2fe',
      sunColor: '#ffffff',
      horizonHills: '#475569',
      groundA: '#e2e8f0',
      groundB: '#cbd5e1',
      roadA: '#475569',
      roadB: '#334155',
      shoulderA: '#38bdf8',
      shoulderB: '#f8fafc',
      stripe: '#bae6fd',
      gatePalette: ['#0ea5e9', '#f97316', '#10b981'],
      propType: 'mountain'
    }
  },
  {
    id: 10,
    level: 2,
    slug: 'clothes-mall',
    nameHe: 'קניון הבגדים',
    nameEn: 'Clothes Mall',
    icon: '👕',
    accent: '#db2777',
    badgeBg: '#fce7f3',
    theme: {
      skyTop: '#f472b6',
      skyBottom: '#fde68a',
      sunColor: '#ffffff',
      horizonHills: '#be185d',
      groundA: '#fbcfe8',
      groundB: '#f9a8d4',
      roadA: '#312e81',
      roadB: '#1e1b4b',
      shoulderA: '#fde047',
      shoulderB: '#2dd4bf',
      stripe: '#ffffff',
      gatePalette: ['#ec4899', '#06b6d4', '#eab308'],
      propType: 'mall'
    }
  },
  {
    id: 11,
    level: 2,
    slug: 'transport-station',
    nameHe: 'תחנת התחבורה',
    nameEn: 'Transport Station',
    icon: '🚂',
    accent: '#d97706',
    badgeBg: '#fef3c7',
    theme: {
      skyTop: '#0ea5e9',
      skyBottom: '#fef08a',
      sunColor: '#fde047',
      horizonHills: '#b45309',
      groundA: '#cbd5e1',
      groundB: '#94a3b8',
      roadA: '#3f3f46',
      roadB: '#27272a',
      shoulderA: '#f59e0b',
      shoulderB: '#18181b',
      stripe: '#fde047',
      gatePalette: ['#ef4444', '#0ea5e9', '#22c55e'],
      propType: 'station'
    }
  },
  {
    id: 12,
    level: 2,
    slug: 'sports-stadium',
    nameHe: 'אצטדיון הספורט',
    nameEn: 'Sports Stadium',
    icon: '🏆',
    accent: '#16a34a',
    badgeBg: '#dcfce7',
    theme: {
      skyTop: '#1e3a8a',
      skyBottom: '#60a5fa',
      sunColor: '#fef9c3',
      horizonHills: '#14532d',
      groundA: '#22c55e',
      groundB: '#16a34a',
      roadA: '#b91c1c',
      roadB: '#991b1b',
      shoulderA: '#ffffff',
      shoulderB: '#facc15',
      stripe: '#ffffff',
      gatePalette: ['#2563eb', '#f59e0b', '#10b981'],
      propType: 'stadium'
    }
  },
  {
    id: 13,
    level: 2,
    slug: 'jobs-town',
    nameHe: 'עיר המקצועות',
    nameEn: 'Jobs Town',
    icon: '👩‍⚕️',
    accent: '#e11d48',
    badgeBg: '#ffe4e6',
    theme: {
      skyTop: '#0284c7',
      skyBottom: '#bae6fd',
      sunColor: '#fde047',
      horizonHills: '#0369a1',
      groundA: '#a7f3d0',
      groundB: '#6ee7b7',
      roadA: '#475569',
      roadB: '#334155',
      shoulderA: '#fb7185',
      shoulderB: '#fef08a',
      stripe: '#ffffff',
      gatePalette: ['#e11d48', '#0ea5e9', '#f59e0b'],
      propType: 'jobs'
    }
  },
  {
    id: 14,
    level: 2,
    slug: 'kitchen-corner',
    nameHe: 'פינת המטבח',
    nameEn: 'Kitchen Corner',
    icon: '🍳',
    accent: '#ea580c',
    badgeBg: '#ffedd5',
    theme: {
      skyTop: '#fb923c',
      skyBottom: '#fef3c7',
      sunColor: '#fffbeb',
      horizonHills: '#c2410c',
      groundA: '#fef08a',
      groundB: '#fde047',
      roadA: '#78350f',
      roadB: '#6b2f0b',
      shoulderA: '#ffffff',
      shoulderB: '#ef4444',
      stripe: '#fef3c7',
      gatePalette: ['#f97316', '#22c55e', '#a855f7'],
      propType: 'kitchen'
    }
  },

  // ================= LEVEL 3: ADVANCED (15-22) =================
  {
    id: 15,
    level: 3,
    slug: 'feelings-forest',
    nameHe: 'יער הרגשות',
    nameEn: 'Feelings Forest',
    icon: '😊',
    accent: '#10b981',
    badgeBg: '#d1fae5',
    theme: {
      skyTop: '#7c3aed',
      skyBottom: '#f9a8d4',
      sunColor: '#fde047',
      horizonHills: '#065f46',
      groundA: '#34d399',
      groundB: '#10b981',
      roadA: '#6d28d9',
      roadB: '#5b21b6',
      shoulderA: '#fde047',
      shoulderB: '#f472b6',
      stripe: '#fef9c3',
      gatePalette: ['#ec4899', '#14b8a6', '#f59e0b'],
      propType: 'feelings'
    }
  },
  {
    id: 16,
    level: 3,
    slug: 'opposites-park',
    nameHe: 'פארק ההפכים',
    nameEn: 'Opposites Park',
    icon: '⚖️',
    accent: '#0f172a',
    badgeBg: '#e2e8f0',
    theme: {
      skyTop: '#0ea5e9',
      skyBottom: '#e0f2fe',
      sunColor: '#facc15',
      horizonHills: '#334155',
      groundA: '#bef264',
      groundB: '#84cc16',
      roadA: '#1e293b',
      roadB: '#0f172a',
      shoulderA: '#ffffff',
      shoulderB: '#0f172a',
      stripe: '#38bdf8',
      gatePalette: ['#f43f5e', '#3b82f6', '#eab308'],
      propType: 'opposites'
    }
  },
  {
    id: 17,
    level: 3,
    slug: 'space-station',
    nameHe: 'תחנת החלל',
    nameEn: 'Space Station',
    icon: '🚀',
    accent: '#6366f1',
    badgeBg: '#e0e7ff',
    theme: {
      skyTop: '#090d16',
      skyBottom: '#312e81',
      sunColor: '#38bdf8',
      horizonHills: '#1e1b4b',
      groundA: '#4338ca',
      groundB: '#3730a3',
      roadA: '#1e293b',
      roadB: '#0f172a',
      shoulderA: '#22d3ee',
      shoulderB: '#a855f7',
      stripe: '#22d3ee',
      gatePalette: ['#06b6d4', '#a855f7', '#ec4899'],
      propType: 'space',
      skyStars: true
    }
  },
  {
    id: 18,
    level: 3,
    slug: 'music-hall',
    nameHe: 'היכל המוזיקה',
    nameEn: 'Music Hall',
    icon: '🎵',
    accent: '#c026d3',
    badgeBg: '#fae8ff',
    theme: {
      skyTop: '#581c87',
      skyBottom: '#f472b6',
      sunColor: '#fde047',
      horizonHills: '#701a75',
      groundA: '#c084fc',
      groundB: '#a855f7',
      roadA: '#3b0764',
      roadB: '#2e1065',
      shoulderA: '#facc15',
      shoulderB: '#22d3ee',
      stripe: '#fde047',
      gatePalette: ['#f43f5e', '#f59e0b', '#06b6d4'],
      propType: 'music'
    }
  },
  {
    id: 19,
    level: 3,
    slug: 'school-lane',
    nameHe: 'שביל בית הספר',
    nameEn: 'School Lane',
    icon: '🏫',
    accent: '#2563eb',
    badgeBg: '#dbeafe',
    theme: {
      skyTop: '#3b82f6',
      skyBottom: '#bfdbfe',
      sunColor: '#fde047',
      horizonHills: '#1d4ed8',
      groundA: '#86efac',
      groundB: '#4ade80',
      roadA: '#475569',
      roadB: '#334155',
      shoulderA: '#facc15',
      shoulderB: '#ef4444',
      stripe: '#ffffff',
      gatePalette: ['#ef4444', '#2563eb', '#10b981'],
      propType: 'school'
    }
  },
  {
    id: 20,
    level: 3,
    slug: 'town-map',
    nameHe: 'מפת העיר',
    nameEn: 'Town Map',
    icon: '🏙️',
    accent: '#0d9488',
    badgeBg: '#ccfbf1',
    theme: {
      skyTop: '#0284c7',
      skyBottom: '#99f6e4',
      sunColor: '#fde047',
      horizonHills: '#0f766e',
      groundA: '#5eead4',
      groundB: '#2dd4bf',
      roadA: '#334155',
      roadB: '#1e293b',
      shoulderA: '#f8fafc',
      shoulderB: '#f59e0b',
      stripe: '#fde047',
      gatePalette: ['#14b8a6', '#f97316', '#6366f1'],
      propType: 'town'
    }
  },
  {
    id: 21,
    level: 3,
    slug: 'action-airport-2',
    nameHe: 'שדה התעופה 2',
    nameEn: 'Action Airport 2',
    icon: '🛫',
    accent: '#f59e0b',
    badgeBg: '#fef3c7',
    theme: {
      skyTop: '#7c2d12',
      skyBottom: '#fb923c',
      sunColor: '#fde047',
      horizonHills: '#431407',
      groundA: '#64748b',
      groundB: '#475569',
      roadA: '#1e293b',
      roadB: '#0f172a',
      shoulderA: '#f97316',
      shoulderB: '#fef08a',
      stripe: '#fb923c',
      gatePalette: ['#f97316', '#0ea5e9', '#22c55e'],
      propType: 'airport2'
    }
  },
  {
    id: 22,
    level: 3,
    slug: 'time-tunnel',
    nameHe: 'מנהרת הזמן',
    nameEn: 'Time Tunnel',
    icon: '⏳',
    accent: '#7c3aed',
    badgeBg: '#ede9fe',
    theme: {
      skyTop: '#0f172a',
      skyBottom: '#6d28d9',
      sunColor: '#facc15',
      horizonHills: '#4c1d95',
      groundA: '#7c3aed',
      groundB: '#5b21b6',
      roadA: '#0284c7',
      roadB: '#0369a1',
      shoulderA: '#fde047',
      shoulderB: '#f472b6',
      stripe: '#ffffff',
      gatePalette: ['#f59e0b', '#ec4899', '#06b6d4'],
      propType: 'tunnel',
      skyStars: true
    }
  }
];

export const WORDS = [
  // ================= LEVEL 1: BEGINNER =================
  // World 1: Animal Jungle (20)
  { id: 'w1_dog', en: 'dog', he: 'כלב', emoji: '🐶', world: 1, level: 1 },
  { id: 'w1_cat', en: 'cat', he: 'חתול', emoji: '🐱', world: 1, level: 1, group: 'feline' },
  { id: 'w1_lion', en: 'lion', he: 'אריה', emoji: '🦁', world: 1, level: 1, group: 'bigcat' },
  { id: 'w1_monkey', en: 'monkey', he: 'קוף', emoji: '🐵', world: 1, level: 1 },
  { id: 'w1_elephant', en: 'elephant', he: 'פיל', emoji: '🐘', world: 1, level: 1 },
  { id: 'w1_fish', en: 'fish', he: 'דג', emoji: '🐟', world: 1, level: 1 },
  { id: 'w1_bird', en: 'bird', he: 'ציפור', emoji: '🐦', world: 1, level: 1, group: 'avian' },
  { id: 'w1_horse', en: 'horse', he: 'סוס', emoji: '🐴', world: 1, level: 1 },
  { id: 'w1_cow', en: 'cow', he: 'פרה', emoji: '🐄', world: 1, level: 1 },
  { id: 'w1_frog', en: 'frog', he: 'צפרדע', emoji: '🐸', world: 1, level: 1 },
  { id: 'w1_snake', en: 'snake', he: 'נחש', emoji: '🐍', world: 1, level: 1 },
  { id: 'w1_rabbit', en: 'rabbit', he: 'ארנב', emoji: '🐰', world: 1, level: 1 },
  { id: 'w1_bear', en: 'bear', he: 'דוב', emoji: '🐻', world: 1, level: 1 },
  { id: 'w1_duck', en: 'duck', he: 'ברווז', emoji: '🦆', world: 1, level: 1, group: 'avian' },
  { id: 'w1_pig', en: 'pig', he: 'חזיר', emoji: '🐷', world: 1, level: 1 },
  { id: 'w1_sheep', en: 'sheep', he: 'כבשה', emoji: '🐑', world: 1, level: 1 },
  { id: 'w1_tiger', en: 'tiger', he: 'טיגריס', emoji: '🐯', world: 1, level: 1, group: 'feline' },
  { id: 'w1_mouse', en: 'mouse', he: 'עכבר', emoji: '🐭', world: 1, level: 1 },
  { id: 'w1_turtle', en: 'turtle', he: 'צב', emoji: '🐢', world: 1, level: 1 },
  { id: 'w1_giraffe', en: 'giraffe', he: "ג'ירפה", emoji: '🦒', world: 1, level: 1 },

  // World 2: Food City (20) - "orange" replaced with "pear" per SPEC 6b
  { id: 'w2_apple', en: 'apple', he: 'תפוח', emoji: '🍎', world: 2, level: 1 },
  { id: 'w2_banana', en: 'banana', he: 'בננה', emoji: '🍌', world: 2, level: 1 },
  { id: 'w2_bread', en: 'bread', he: 'לחם', emoji: '🍞', world: 2, level: 1 },
  { id: 'w2_cheese', en: 'cheese', he: 'גבינה', emoji: '🧀', world: 2, level: 1 },
  { id: 'w2_egg', en: 'egg', he: 'ביצה', emoji: '🥚', world: 2, level: 1 },
  { id: 'w2_milk', en: 'milk', he: 'חלב', emoji: '🥛', world: 2, level: 1 },
  { id: 'w2_pizza', en: 'pizza', he: 'פיצה', emoji: '🍕', world: 2, level: 1 },
  { id: 'w2_cake', en: 'cake', he: 'עוגה', emoji: '🎂', world: 2, level: 1 },
  { id: 'w2_carrot', en: 'carrot', he: 'גזר', emoji: '🥕', world: 2, level: 1 },
  { id: 'w2_grapes', en: 'grapes', he: 'ענבים', emoji: '🍇', world: 2, level: 1 },
  { id: 'w2_pear', en: 'pear', he: 'אגס', emoji: '🍐', world: 2, level: 1 },
  { id: 'w2_strawberry', en: 'strawberry', he: 'תות', emoji: '🍓', world: 2, level: 1 },
  { id: 'w2_ice_cream', en: 'ice cream', he: 'גלידה', emoji: '🍦', world: 2, level: 1 },
  { id: 'w2_cookie', en: 'cookie', he: 'עוגייה', emoji: '🍪', world: 2, level: 1 },
  { id: 'w2_water', en: 'water', he: 'מים', emoji: '💧', world: 2, level: 1 },
  { id: 'w2_chicken', en: 'chicken', he: 'עוף', emoji: '🍗', world: 2, level: 1 },
  { id: 'w2_tomato', en: 'tomato', he: 'עגבנייה', emoji: '🍅', world: 2, level: 1 },
  { id: 'w2_watermelon', en: 'watermelon', he: 'אבטיח', emoji: '🍉', world: 2, level: 1 },
  { id: 'w2_sandwich', en: 'sandwich', he: 'כריך', emoji: '🥪', world: 2, level: 1 },
  { id: 'w2_lemon', en: 'lemon', he: 'לימון', emoji: '🍋', world: 2, level: 1 },

  // World 3: Color Canyon (20)
  { id: 'w3_red', en: 'red', he: 'אדום', emoji: '🔴', world: 3, level: 1 },
  { id: 'w3_blue', en: 'blue', he: 'כחול', emoji: '🔵', world: 3, level: 1 },
  { id: 'w3_green', en: 'green', he: 'ירוק', emoji: '🟢', world: 3, level: 1 },
  { id: 'w3_yellow', en: 'yellow', he: 'צהוב', emoji: '🟡', world: 3, level: 1 },
  { id: 'w3_orange', en: 'orange', he: 'כתום', emoji: '🟠', world: 3, level: 1 },
  { id: 'w3_purple', en: 'purple', he: 'סגול', emoji: '🟣', world: 3, level: 1 },
  { id: 'w3_pink', en: 'pink', he: 'ורוד', emoji: '🩷', world: 3, level: 1 },
  { id: 'w3_black', en: 'black', he: 'שחור', emoji: '⚫', world: 3, level: 1 },
  { id: 'w3_white', en: 'white', he: 'לבן', emoji: '⚪', world: 3, level: 1 },
  { id: 'w3_brown', en: 'brown', he: 'חום', emoji: '🟤', world: 3, level: 1 },
  { id: 'w3_one', en: 'one', he: 'אחת', emoji: '1️⃣', world: 3, level: 1 },
  { id: 'w3_two', en: 'two', he: 'שתיים', emoji: '2️⃣', world: 3, level: 1 },
  { id: 'w3_three', en: 'three', he: 'שלוש', emoji: '3️⃣', world: 3, level: 1 },
  { id: 'w3_four', en: 'four', he: 'ארבע', emoji: '4️⃣', world: 3, level: 1 },
  { id: 'w3_five', en: 'five', he: 'חמש', emoji: '5️⃣', world: 3, level: 1 },
  { id: 'w3_six', en: 'six', he: 'שש', emoji: '6️⃣', world: 3, level: 1 },
  { id: 'w3_seven', en: 'seven', he: 'שבע', emoji: '7️⃣', world: 3, level: 1 },
  { id: 'w3_eight', en: 'eight', he: 'שמונה', emoji: '8️⃣', world: 3, level: 1 },
  { id: 'w3_nine', en: 'nine', he: 'תשע', emoji: '9️⃣', world: 3, level: 1 },
  { id: 'w3_ten', en: 'ten', he: 'עשר', emoji: '🔟', world: 3, level: 1 },

  // World 4: Home Highway (20)
  { id: 'w4_house', en: 'house', he: 'בית', emoji: '🏠', world: 4, level: 1 },
  { id: 'w4_bed', en: 'bed', he: 'מיטה', emoji: '🛏️', world: 4, level: 1 },
  { id: 'w4_chair', en: 'chair', he: 'כיסא', emoji: '🪑', world: 4, level: 1, group: 'seat' },
  { id: 'w4_table', en: 'table', he: 'שולחן', emoji: '🍽️', world: 4, level: 1 },
  { id: 'w4_door', en: 'door', he: 'דלת', emoji: '🚪', world: 4, level: 1 },
  { id: 'w4_window', en: 'window', he: 'חלון', emoji: '🪟', world: 4, level: 1 },
  { id: 'w4_lamp', en: 'lamp', he: 'מנורה', emoji: '💡', world: 4, level: 1 },
  { id: 'w4_sofa', en: 'sofa', he: 'ספה', emoji: '🛋️', world: 4, level: 1, group: 'seat' },
  { id: 'w4_book', en: 'book', he: 'ספר', emoji: '📖', world: 4, level: 1 },
  { id: 'w4_phone', en: 'phone', he: 'טלפון', emoji: '📱', world: 4, level: 1 },
  { id: 'w4_clock', en: 'clock', he: 'שעון', emoji: '⏰', world: 4, level: 1 },
  { id: 'w4_key', en: 'key', he: 'מפתח', emoji: '🔑', world: 4, level: 1 },
  { id: 'w4_cup', en: 'cup', he: 'כוס', emoji: '🥤', world: 4, level: 1 },
  { id: 'w4_bath', en: 'bath', he: 'אמבטיה', emoji: '🛁', world: 4, level: 1 },
  { id: 'w4_tv', en: 'TV', he: 'טלוויזיה', emoji: '📺', world: 4, level: 1 },
  { id: 'w4_box', en: 'box', he: 'קופסה', emoji: '📦', world: 4, level: 1 },
  { id: 'w4_ball', en: 'ball', he: 'כדור', emoji: '⚽', world: 4, level: 1 },
  { id: 'w4_toy', en: 'toy', he: 'צעצוע', emoji: '🧸', world: 4, level: 1 },
  { id: 'w4_bag', en: 'bag', he: 'תיק', emoji: '🎒', world: 4, level: 1 },
  { id: 'w4_computer', en: 'computer', he: 'מחשב', emoji: '💻', world: 4, level: 1 },

  // World 5: Body Bridge (20)
  { id: 'w5_head', en: 'head', he: 'ראש', emoji: '🧑', world: 5, level: 1, group: 'headface' },
  { id: 'w5_eye', en: 'eye', he: 'עין', emoji: '👁️', world: 5, level: 1 },
  { id: 'w5_ear', en: 'ear', he: 'אוזן', emoji: '👂', world: 5, level: 1 },
  { id: 'w5_nose', en: 'nose', he: 'אף', emoji: '👃', world: 5, level: 1 },
  { id: 'w5_mouth', en: 'mouth', he: 'פה', emoji: '👄', world: 5, level: 1, group: 'mouthlips' },
  { id: 'w5_hand', en: 'hand', he: 'יד', emoji: '✋', world: 5, level: 1, group: 'handfinger' },
  { id: 'w5_foot', en: 'foot', he: 'כף רגל', emoji: '🦶', world: 5, level: 1, group: 'legfoot' },
  { id: 'w5_leg', en: 'leg', he: 'רגל', emoji: '🦵', world: 5, level: 1, group: 'legfoot' },
  { id: 'w5_arm', en: 'arm', he: 'זרוע', emoji: '🦾', world: 5, level: 1, group: 'armmuscle' },
  { id: 'w5_tooth', en: 'tooth', he: 'שן', emoji: '🦷', world: 5, level: 1 },
  { id: 'w5_hair', en: 'hair', he: 'שיער', emoji: '💇', world: 5, level: 1 },
  { id: 'w5_finger', en: 'finger', he: 'אצבע', emoji: '☝️', world: 5, level: 1, group: 'handfinger' },
  { id: 'w5_heart', en: 'heart', he: 'לב', emoji: '❤️', world: 5, level: 1 },
  { id: 'w5_brain', en: 'brain', he: 'מוח', emoji: '🧠', world: 5, level: 1 },
  { id: 'w5_face', en: 'face', he: 'פנים', emoji: '😀', world: 5, level: 1, group: 'headface' },
  { id: 'w5_tongue', en: 'tongue', he: 'לשון', emoji: '👅', world: 5, level: 1 },
  { id: 'w5_back', en: 'back', he: 'גב', emoji: '🔙', world: 5, level: 1 },
  { id: 'w5_knee', en: 'knee', he: 'ברך', emoji: '🧎', world: 5, level: 1, group: 'legfoot' },
  { id: 'w5_lips', en: 'lips', he: 'שפתיים', emoji: '🫦', world: 5, level: 1, group: 'mouthlips' },
  { id: 'w5_muscle', en: 'muscle', he: 'שריר', emoji: '💪', world: 5, level: 1, group: 'armmuscle' },

  // World 6: Action Airport (20)
  { id: 'w6_run', en: 'run', he: 'לרוץ', emoji: '🏃', world: 6, level: 1, group: 'move' },
  { id: 'w6_swim', en: 'swim', he: 'לשחות', emoji: '🏊', world: 6, level: 1 },
  { id: 'w6_eat', en: 'eat', he: 'לאכול', emoji: '🍽️', world: 6, level: 1 },
  { id: 'w6_sleep', en: 'sleep', he: 'לישון', emoji: '😴', world: 6, level: 1 },
  { id: 'w6_jump', en: 'jump', he: 'לקפוץ', emoji: '🤸', world: 6, level: 1 },
  { id: 'w6_read', en: 'read', he: 'לקרוא', emoji: '📖', world: 6, level: 1 },
  { id: 'w6_write', en: 'write', he: 'לכתוב', emoji: '✍️', world: 6, level: 1 },
  { id: 'w6_sing', en: 'sing', he: 'לשיר', emoji: '🎤', world: 6, level: 1 },
  { id: 'w6_dance', en: 'dance', he: 'לרקוד', emoji: '💃', world: 6, level: 1 },
  { id: 'w6_cook', en: 'cook', he: 'לבשל', emoji: '👨‍🍳', world: 6, level: 1 },
  { id: 'w6_drive', en: 'drive', he: 'לנהוג', emoji: '🚗', world: 6, level: 1, group: 'vehicle' },
  { id: 'w6_fly', en: 'fly', he: 'לעוף', emoji: '✈️', world: 6, level: 1 },
  { id: 'w6_climb', en: 'climb', he: 'לטפס', emoji: '🧗', world: 6, level: 1 },
  { id: 'w6_cry', en: 'cry', he: 'לבכות', emoji: '😢', world: 6, level: 1 },
  { id: 'w6_laugh', en: 'laugh', he: 'לצחוק', emoji: '😂', world: 6, level: 1 },
  { id: 'w6_play', en: 'play', he: 'לשחק', emoji: '🎮', world: 6, level: 1 },
  { id: 'w6_walk', en: 'walk', he: 'ללכת', emoji: '🚶', world: 6, level: 1, group: 'move' },
  { id: 'w6_drink', en: 'drink', he: 'לשתות', emoji: '🥤', world: 6, level: 1 },
  { id: 'w6_ride', en: 'ride', he: 'לרכוב', emoji: '🚲', world: 6, level: 1, group: 'vehicle' },
  { id: 'w6_paint', en: 'paint', he: 'לצייר', emoji: '🎨', world: 6, level: 1 },

  // ================= LEVEL 2: INTERMEDIATE =================
  // World 7: Sea World (24)
  { id: 'w7_whale', en: 'whale', he: 'לווייתן', emoji: '🐋', world: 7, level: 2 },
  { id: 'w7_dolphin', en: 'dolphin', he: 'דולפין', emoji: '🐬', world: 7, level: 2 },
  { id: 'w7_shark', en: 'shark', he: 'כריש', emoji: '🦈', world: 7, level: 2 },
  { id: 'w7_octopus', en: 'octopus', he: 'תמנון', emoji: '🐙', world: 7, level: 2, group: 'tentacle' },
  { id: 'w7_crab', en: 'crab', he: 'סרטן', emoji: '🦀', world: 7, level: 2, group: 'shellfish' },
  { id: 'w7_jellyfish', en: 'jellyfish', he: 'מדוזה', emoji: '🪼', world: 7, level: 2 },
  { id: 'w7_seal', en: 'seal', he: 'כלב ים', emoji: '🦭', world: 7, level: 2 },
  { id: 'w7_lobster', en: 'lobster', he: 'לובסטר', emoji: '🦞', world: 7, level: 2, group: 'shellfish' },
  { id: 'w7_shrimp', en: 'shrimp', he: 'שרימפס', emoji: '🦐', world: 7, level: 2, group: 'shellfish' },
  { id: 'w7_squid', en: 'squid', he: 'דיונון', emoji: '🦑', world: 7, level: 2, group: 'tentacle' },
  { id: 'w7_penguin', en: 'penguin', he: 'פינגווין', emoji: '🐧', world: 7, level: 2 },
  { id: 'w7_otter', en: 'otter', he: 'לוטרה', emoji: '🦦', world: 7, level: 2 },
  { id: 'w7_coral', en: 'coral', he: 'אלמוג', emoji: '🪸', world: 7, level: 2 },
  { id: 'w7_shell', en: 'shell', he: 'צדף', emoji: '🐚', world: 7, level: 2, group: 'seashell' },
  { id: 'w7_pearl', en: 'pearl', he: 'פנינה', emoji: '🦪', world: 7, level: 2, group: 'seashell' },
  { id: 'w7_wave', en: 'wave', he: 'גל', emoji: '🌊', world: 7, level: 2, group: 'seawater' },
  { id: 'w7_ocean', en: 'ocean', he: 'אוקיינוס', emoji: null, world: 7, level: 2, group: 'seawater' },
  { id: 'w7_beach', en: 'beach', he: 'חוף', emoji: '🏖️', world: 7, level: 2, group: 'coast' },
  { id: 'w7_island', en: 'island', he: 'אי', emoji: '🏝️', world: 7, level: 2, group: 'coast' },
  { id: 'w7_mermaid', en: 'mermaid', he: 'בת ים', emoji: '🧜‍♀️', world: 7, level: 2 },
  { id: 'w7_anchor', en: 'anchor', he: 'עוגן', emoji: '⚓', world: 7, level: 2 },
  { id: 'w7_seahorse', en: 'seahorse', he: 'סוסון ים', emoji: null, world: 7, level: 2 },
  { id: 'w7_starfish', en: 'starfish', he: 'כוכב ים', emoji: null, world: 7, level: 2 },
  { id: 'w7_seaweed', en: 'seaweed', he: 'אצה', emoji: null, world: 7, level: 2 },

  // World 8: Bug Garden (24)
  { id: 'w8_butterfly', en: 'butterfly', he: 'פרפר', emoji: '🦋', world: 8, level: 2 },
  { id: 'w8_bee', en: 'bee', he: 'דבורה', emoji: '🐝', world: 8, level: 2 },
  { id: 'w8_ant', en: 'ant', he: 'נמלה', emoji: '🐜', world: 8, level: 2 },
  { id: 'w8_spider', en: 'spider', he: 'עכביש', emoji: '🕷️', world: 8, level: 2, group: 'arachnid' },
  { id: 'w8_ladybug', en: 'ladybug', he: 'פרת משה רבנו', emoji: '🐞', world: 8, level: 2, group: 'bug_round' },
  { id: 'w8_snail', en: 'snail', he: 'חילזון', emoji: '🐌', world: 8, level: 2 },
  { id: 'w8_worm', en: 'worm', he: 'תולעת', emoji: '🪱', world: 8, level: 2, group: 'crawler' },
  { id: 'w8_caterpillar', en: 'caterpillar', he: 'זחל', emoji: '🐛', world: 8, level: 2, group: 'crawler' },
  { id: 'w8_mosquito', en: 'mosquito', he: 'יתוש', emoji: '🦟', world: 8, level: 2 },
  { id: 'w8_beetle', en: 'beetle', he: 'חיפושית', emoji: '🪲', world: 8, level: 2, group: 'bug_round' },
  { id: 'w8_cricket', en: 'cricket', he: 'צרצר', emoji: '🦗', world: 8, level: 2 },
  { id: 'w8_web', en: 'web', he: 'קורי עכביש', emoji: '🕸️', world: 8, level: 2, group: 'arachnid' },
  { id: 'w8_flower', en: 'flower', he: 'פרח', emoji: '🌸', world: 8, level: 2, group: 'bloom' },
  { id: 'w8_rose', en: 'rose', he: 'ורד', emoji: '🌹', world: 8, level: 2, group: 'bloom' },
  { id: 'w8_sunflower', en: 'sunflower', he: 'חמנייה', emoji: '🌻', world: 8, level: 2, group: 'bloom' },
  { id: 'w8_tree', en: 'tree', he: 'עץ', emoji: '🌳', world: 8, level: 2, group: 'flora' },
  { id: 'w8_cactus', en: 'cactus', he: 'קקטוס', emoji: '🌵', world: 8, level: 2, group: 'flora' },
  { id: 'w8_leaf', en: 'leaf', he: 'עלה', emoji: '🍃', world: 8, level: 2 },
  { id: 'w8_mushroom', en: 'mushroom', he: 'פטרייה', emoji: '🍄', world: 8, level: 2 },
  { id: 'w8_plant', en: 'plant', he: 'צמח', emoji: '🪴', world: 8, level: 2, group: 'flora' },
  { id: 'w8_nest', en: 'nest', he: 'קן', emoji: '🪹', world: 8, level: 2 },
  { id: 'w8_grasshopper', en: 'grasshopper', he: 'חגב', emoji: null, world: 8, level: 2 },
  { id: 'w8_grass', en: 'grass', he: 'דשא', emoji: null, world: 8, level: 2 },
  { id: 'w8_dragonfly', en: 'dragonfly', he: 'שפירית', emoji: null, world: 8, level: 2 },

  // World 9: Weather Mountain (24)
  { id: 'w9_sun', en: 'sun', he: 'שמש', emoji: '☀️', world: 9, level: 2 },
  { id: 'w9_rain', en: 'rain', he: 'גשם', emoji: '🌧️', world: 9, level: 2, group: 'precip' },
  { id: 'w9_snow', en: 'snow', he: 'שלג', emoji: '❄️', world: 9, level: 2, group: 'wintry' },
  { id: 'w9_cloud', en: 'cloud', he: 'ענן', emoji: '☁️', world: 9, level: 2, group: 'overcast' },
  { id: 'w9_wind', en: 'wind', he: 'רוח', emoji: '💨', world: 9, level: 2 },
  { id: 'w9_storm', en: 'storm', he: 'סופה', emoji: '⛈️', world: 9, level: 2, group: 'precip' },
  { id: 'w9_lightning', en: 'lightning', he: 'ברק', emoji: '⚡', world: 9, level: 2 },
  { id: 'w9_rainbow', en: 'rainbow', he: 'קשת בענן', emoji: '🌈', world: 9, level: 2 },
  { id: 'w9_snowman', en: 'snowman', he: 'איש שלג', emoji: '☃️', world: 9, level: 2, group: 'wintry' },
  { id: 'w9_umbrella', en: 'umbrella', he: 'מטרייה', emoji: '☂️', world: 9, level: 2 },
  { id: 'w9_mountain', en: 'mountain', he: 'הר', emoji: '⛰️', world: 9, level: 2, group: 'peak' },
  { id: 'w9_volcano', en: 'volcano', he: 'הר געש', emoji: '🌋', world: 9, level: 2, group: 'peak' },
  { id: 'w9_river', en: 'river', he: 'נהר', emoji: '🏞️', world: 9, level: 2 },
  { id: 'w9_forest', en: 'forest', he: 'יער', emoji: '🌲', world: 9, level: 2 },
  { id: 'w9_desert', en: 'desert', he: 'מדבר', emoji: '🏜️', world: 9, level: 2 },
  { id: 'w9_fire', en: 'fire', he: 'אש', emoji: '🔥', world: 9, level: 2 },
  { id: 'w9_ice', en: 'ice', he: 'קרח', emoji: '🧊', world: 9, level: 2, group: 'wintry' },
  { id: 'w9_tornado', en: 'tornado', he: 'טורנדו', emoji: '🌪️', world: 9, level: 2 },
  { id: 'w9_fog', en: 'fog', he: 'ערפל', emoji: '🌫️', world: 9, level: 2, group: 'overcast' },
  { id: 'w9_autumn', en: 'autumn', he: 'סתיו', emoji: '🍂', world: 9, level: 2 },
  { id: 'w9_summer', en: 'summer', he: 'קיץ', emoji: null, world: 9, level: 2 },
  { id: 'w9_winter', en: 'winter', he: 'חורף', emoji: null, world: 9, level: 2 },
  { id: 'w9_spring', en: 'spring', he: 'אביב', emoji: null, world: 9, level: 2 },
  { id: 'w9_thunder', en: 'thunder', he: 'רעם', emoji: null, world: 9, level: 2 },

  // World 10: Clothes Mall (24)
  { id: 'w10_shirt', en: 'shirt', he: 'חולצה', emoji: '👕', world: 10, level: 2 },
  { id: 'w10_pants', en: 'pants', he: 'מכנסיים', emoji: '👖', world: 10, level: 2, group: 'bottoms' },
  { id: 'w10_dress', en: 'dress', he: 'שמלה', emoji: '👗', world: 10, level: 2 },
  { id: 'w10_shorts', en: 'shorts', he: 'מכנסיים קצרים', emoji: '🩳', world: 10, level: 2, group: 'bottoms' },
  { id: 'w10_coat', en: 'coat', he: 'מעיל', emoji: '🧥', world: 10, level: 2, group: 'outerwear' },
  { id: 'w10_socks', en: 'socks', he: 'גרביים', emoji: '🧦', world: 10, level: 2 },
  { id: 'w10_shoe', en: 'shoe', he: 'נעל', emoji: '👟', world: 10, level: 2, group: 'footwear' },
  { id: 'w10_boot', en: 'boot', he: 'מגף', emoji: '🥾', world: 10, level: 2, group: 'footwear' },
  { id: 'w10_sandal', en: 'sandal', he: 'סנדל', emoji: '👡', world: 10, level: 2, group: 'footwear' },
  { id: 'w10_hat', en: 'hat', he: 'כובע', emoji: '👒', world: 10, level: 2, group: 'headwear' },
  { id: 'w10_cap', en: 'cap', he: 'כובע מצחייה', emoji: '🧢', world: 10, level: 2, group: 'headwear' },
  { id: 'w10_gloves', en: 'gloves', he: 'כפפות', emoji: '🧤', world: 10, level: 2 },
  { id: 'w10_scarf', en: 'scarf', he: 'צעיף', emoji: '🧣', world: 10, level: 2 },
  { id: 'w10_glasses', en: 'glasses', he: 'משקפיים', emoji: '👓', world: 10, level: 2, group: 'eyewear' },
  { id: 'w10_sunglasses', en: 'sunglasses', he: 'משקפי שמש', emoji: '🕶️', world: 10, level: 2, group: 'eyewear' },
  { id: 'w10_crown', en: 'crown', he: 'כתר', emoji: '👑', world: 10, level: 2 },
  { id: 'w10_ring', en: 'ring', he: 'טבעת', emoji: '💍', world: 10, level: 2 },
  { id: 'w10_tie', en: 'tie', he: 'עניבה', emoji: '👔', world: 10, level: 2 },
  { id: 'w10_swimsuit', en: 'swimsuit', he: 'בגד ים', emoji: '🩱', world: 10, level: 2 },
  { id: 'w10_purse', en: 'purse', he: 'ארנק', emoji: '👛', world: 10, level: 2 },
  { id: 'w10_jacket', en: 'jacket', he: "ז'קט", emoji: null, world: 10, level: 2, group: 'outerwear' },
  { id: 'w10_skirt', en: 'skirt', he: 'חצאית', emoji: null, world: 10, level: 2 },
  { id: 'w10_sweater', en: 'sweater', he: 'סוודר', emoji: null, world: 10, level: 2 },
  { id: 'w10_belt', en: 'belt', he: 'חגורה', emoji: null, world: 10, level: 2 },

  // World 11: Transport Station (24)
  { id: 'w11_car', en: 'car', he: 'מכונית', emoji: '🚗', world: 11, level: 2, group: 'auto' },
  { id: 'w11_bus', en: 'bus', he: 'אוטובוס', emoji: '🚌', world: 11, level: 2 },
  { id: 'w11_train', en: 'train', he: 'רכבת', emoji: '🚂', world: 11, level: 2, group: 'rail' },
  { id: 'w11_plane', en: 'plane', he: 'מטוס', emoji: '✈️', world: 11, level: 2 },
  { id: 'w11_boat', en: 'boat', he: 'סירה', emoji: '⛵', world: 11, level: 2, group: 'watercraft' },
  { id: 'w11_ship', en: 'ship', he: 'אונייה', emoji: '🚢', world: 11, level: 2, group: 'watercraft' },
  { id: 'w11_bike', en: 'bike', he: 'אופניים', emoji: '🚲', world: 11, level: 2 },
  { id: 'w11_truck', en: 'truck', he: 'משאית', emoji: '🚚', world: 11, level: 2, group: 'auto' },
  { id: 'w11_taxi', en: 'taxi', he: 'מונית', emoji: '🚕', world: 11, level: 2, group: 'auto' },
  { id: 'w11_tractor', en: 'tractor', he: 'טרקטור', emoji: '🚜', world: 11, level: 2 },
  { id: 'w11_helicopter', en: 'helicopter', he: 'מסוק', emoji: '🚁', world: 11, level: 2 },
  { id: 'w11_motorcycle', en: 'motorcycle', he: 'אופנוע', emoji: '🏍️', world: 11, level: 2, group: 'twowheel' },
  { id: 'w11_scooter', en: 'scooter', he: 'קורקינט', emoji: '🛴', world: 11, level: 2, group: 'twowheel' },
  { id: 'w11_ambulance', en: 'ambulance', he: 'אמבולנס', emoji: '🚑', world: 11, level: 2, group: 'emergency' },
  { id: 'w11_firetruck', en: 'firetruck', he: 'כבאית', emoji: '🚒', world: 11, level: 2, group: 'emergency' },
  { id: 'w11_subway', en: 'subway', he: 'רכבת תחתית', emoji: '🚇', world: 11, level: 2, group: 'rail' },
  { id: 'w11_station', en: 'station', he: 'תחנה', emoji: '🚉', world: 11, level: 2, group: 'rail' },
  { id: 'w11_skateboard', en: 'skateboard', he: 'סקייטבורד', emoji: '🛹', world: 11, level: 2 },
  { id: 'w11_canoe', en: 'canoe', he: 'קאנו', emoji: '🛶', world: 11, level: 2, group: 'watercraft' },
  { id: 'w11_wheel', en: 'wheel', he: 'גלגל', emoji: '🛞', world: 11, level: 2 },
  { id: 'w11_ticket', en: 'ticket', he: 'כרטיס', emoji: '🎫', world: 11, level: 2 },
  { id: 'w11_luggage', en: 'luggage', he: 'מזוודה', emoji: '🧳', world: 11, level: 2 },
  { id: 'w11_traffic_light', en: 'traffic light', he: 'רמזור', emoji: '🚦', world: 11, level: 2 },
  { id: 'w11_road', en: 'road', he: 'כביש', emoji: '🛣️', world: 11, level: 2 },

  // World 12: Sports Stadium (24)
  { id: 'w12_soccer', en: 'soccer', he: 'כדורגל', emoji: '⚽', world: 12, level: 2 },
  { id: 'w12_basketball', en: 'basketball', he: 'כדורסל', emoji: '🏀', world: 12, level: 2 },
  { id: 'w12_tennis', en: 'tennis', he: 'טניס', emoji: '🎾', world: 12, level: 2 },
  { id: 'w12_baseball', en: 'baseball', he: 'בייסבול', emoji: '⚾', world: 12, level: 2 },
  { id: 'w12_volleyball', en: 'volleyball', he: 'כדורעף', emoji: '🏐', world: 12, level: 2 },
  { id: 'w12_football', en: 'football', he: 'פוטבול', emoji: '🏈', world: 12, level: 2 },
  { id: 'w12_surfing', en: 'surfing', he: 'גלישה', emoji: '🏄', world: 12, level: 2 },
  { id: 'w12_skiing', en: 'skiing', he: 'סקי', emoji: '⛷️', world: 12, level: 2 },
  { id: 'w12_skating', en: 'skating', he: 'החלקה על קרח', emoji: '⛸️', world: 12, level: 2 },
  { id: 'w12_boxing', en: 'boxing', he: 'אגרוף', emoji: '🥊', world: 12, level: 2 },
  { id: 'w12_golf', en: 'golf', he: 'גולף', emoji: '⛳', world: 12, level: 2 },
  { id: 'w12_bowling', en: 'bowling', he: 'באולינג', emoji: '🎳', world: 12, level: 2 },
  { id: 'w12_karate', en: 'karate', he: 'קראטה', emoji: '🥋', world: 12, level: 2 },
  { id: 'w12_ping_pong', en: 'ping pong', he: 'פינג פונג', emoji: '🏓', world: 12, level: 2, group: 'racket' },
  { id: 'w12_badminton', en: 'badminton', he: 'בדמינטון', emoji: '🏸', world: 12, level: 2, group: 'racket' },
  { id: 'w12_medal', en: 'medal', he: 'מדליה', emoji: '🏅', world: 12, level: 2, group: 'prize' },
  { id: 'w12_trophy', en: 'trophy', he: 'גביע', emoji: '🏆', world: 12, level: 2, group: 'prize' },
  { id: 'w12_goal', en: 'goal', he: 'שער', emoji: '🥅', world: 12, level: 2 },
  { id: 'w12_race', en: 'race', he: 'מרוץ', emoji: '🏁', world: 12, level: 2 },
  { id: 'w12_winner', en: 'winner', he: 'מנצח', emoji: '🥇', world: 12, level: 2, group: 'prize' },
  { id: 'w12_whistle', en: 'whistle', he: 'משרוקית', emoji: null, world: 12, level: 2 },
  { id: 'w12_team', en: 'team', he: 'קבוצה', emoji: null, world: 12, level: 2 },
  { id: 'w12_score', en: 'score', he: 'ניקוד', emoji: null, world: 12, level: 2 },
  { id: 'w12_coach', en: 'coach', he: 'מאמן', emoji: null, world: 12, level: 2 },

  // World 13: Jobs Town (24)
  { id: 'w13_doctor', en: 'doctor', he: 'רופא', emoji: '👨‍⚕️', world: 13, level: 2, group: 'medical' },
  { id: 'w13_nurse', en: 'nurse', he: 'אחות', emoji: '👩‍⚕️', world: 13, level: 2, group: 'medical' },
  { id: 'w13_teacher', en: 'teacher', he: 'מורה', emoji: '👩‍🏫', world: 13, level: 2 },
  { id: 'w13_police', en: 'police', he: 'שוטר', emoji: '👮', world: 13, level: 2 },
  { id: 'w13_firefighter', en: 'firefighter', he: 'כבאי', emoji: '👨‍🚒', world: 13, level: 2 },
  { id: 'w13_chef', en: 'chef', he: 'שף', emoji: '👨‍🍳', world: 13, level: 2 },
  { id: 'w13_farmer', en: 'farmer', he: 'חקלאי', emoji: '👨‍🌾', world: 13, level: 2 },
  { id: 'w13_pilot', en: 'pilot', he: 'טייס', emoji: '👨‍✈️', world: 13, level: 2 },
  { id: 'w13_astronaut', en: 'astronaut', he: 'אסטרונאוט', emoji: '👨‍🚀', world: 13, level: 2 },
  { id: 'w13_artist', en: 'artist', he: 'אמן', emoji: '👩‍🎨', world: 13, level: 2 },
  { id: 'w13_singer', en: 'singer', he: 'זמר', emoji: '👩‍🎤', world: 13, level: 2 },
  { id: 'w13_scientist', en: 'scientist', he: 'מדען', emoji: '👩‍🔬', world: 13, level: 2 },
  { id: 'w13_judge', en: 'judge', he: 'שופט', emoji: '👩‍⚖️', world: 13, level: 2 },
  { id: 'w13_mechanic', en: 'mechanic', he: 'מכונאי', emoji: '👨‍🔧', world: 13, level: 2 },
  { id: 'w13_builder', en: 'builder', he: 'בנאי', emoji: '👷', world: 13, level: 2 },
  { id: 'w13_detective', en: 'detective', he: 'בלש', emoji: '🕵️', world: 13, level: 2 },
  { id: 'w13_king', en: 'king', he: 'מלך', emoji: '🤴', world: 13, level: 2, group: 'royal' },
  { id: 'w13_queen', en: 'queen', he: 'מלכה', emoji: '👸', world: 13, level: 2, group: 'royal' },
  { id: 'w13_clown', en: 'clown', he: 'ליצן', emoji: '🤡', world: 13, level: 2 },
  { id: 'w13_wizard', en: 'wizard', he: 'קוסם', emoji: '🧙', world: 13, level: 2 },
  { id: 'w13_dentist', en: 'dentist', he: 'רופא שיניים', emoji: null, world: 13, level: 2, group: 'medical' },
  { id: 'w13_driver', en: 'driver', he: 'נהג', emoji: null, world: 13, level: 2 },
  { id: 'w13_baker', en: 'baker', he: 'אופה', emoji: null, world: 13, level: 2 },
  { id: 'w13_vet', en: 'vet', he: 'וטרינר', emoji: null, world: 13, level: 2, group: 'medical' },

  // World 14: Kitchen Corner (24)
  { id: 'w14_spoon', en: 'spoon', he: 'כף', emoji: '🥄', world: 14, level: 2, group: 'cutlery' },
  { id: 'w14_fork', en: 'fork', he: 'מזלג', emoji: '🍴', world: 14, level: 2, group: 'cutlery' },
  { id: 'w14_knife', en: 'knife', he: 'סכין', emoji: '🔪', world: 14, level: 2, group: 'cutlery' },
  { id: 'w14_plate', en: 'plate', he: 'צלחת', emoji: '🍽️', world: 14, level: 2, group: 'dish' },
  { id: 'w14_bowl', en: 'bowl', he: 'קערה', emoji: '🥣', world: 14, level: 2, group: 'dish' },
  { id: 'w14_pot', en: 'pot', he: 'סיר', emoji: '🍲', world: 14, level: 2, group: 'cookware' },
  { id: 'w14_pan', en: 'pan', he: 'מחבת', emoji: '🍳', world: 14, level: 2, group: 'cookware' },
  { id: 'w14_salt', en: 'salt', he: 'מלח', emoji: '🧂', world: 14, level: 2 },
  { id: 'w14_pasta', en: 'pasta', he: 'פסטה', emoji: '🍝', world: 14, level: 2 },
  { id: 'w14_salad', en: 'salad', he: 'סלט', emoji: '🥗', world: 14, level: 2 },
  { id: 'w14_rice', en: 'rice', he: 'אורז', emoji: '🍚', world: 14, level: 2 },
  { id: 'w14_butter', en: 'butter', he: 'חמאה', emoji: '🧈', world: 14, level: 2 },
  { id: 'w14_honey', en: 'honey', he: 'דבש', emoji: '🍯', world: 14, level: 2 },
  { id: 'w14_chocolate', en: 'chocolate', he: 'שוקולד', emoji: '🍫', world: 14, level: 2 },
  { id: 'w14_candy', en: 'candy', he: 'סוכרייה', emoji: '🍬', world: 14, level: 2, group: 'sweets' },
  { id: 'w14_donut', en: 'donut', he: 'דונאט', emoji: '🍩', world: 14, level: 2, group: 'sweets' },
  { id: 'w14_pancake', en: 'pancake', he: 'פנקייק', emoji: '🥞', world: 14, level: 2 },
  { id: 'w14_corn', en: 'corn', he: 'תירס', emoji: '🌽', world: 14, level: 2 },
  { id: 'w14_potato', en: 'potato', he: 'תפוח אדמה', emoji: '🥔', world: 14, level: 2 },
  { id: 'w14_onion', en: 'onion', he: 'בצל', emoji: '🧅', world: 14, level: 2 },
  { id: 'w14_cucumber', en: 'cucumber', he: 'מלפפון', emoji: '🥒', world: 14, level: 2 },
  { id: 'w14_fridge', en: 'fridge', he: 'מקרר', emoji: null, world: 14, level: 2 },
  { id: 'w14_oven', en: 'oven', he: 'תנור', emoji: null, world: 14, level: 2 },
  { id: 'w14_soup', en: 'soup', he: 'מרק', emoji: null, world: 14, level: 2 },

  // ================= LEVEL 3: ADVANCED =================
  // World 15: Feelings Forest (24)
  { id: 'w15_happy', en: 'happy', he: 'שמח', emoji: '😊', world: 15, level: 3, group: 'joy' },
  { id: 'w15_sad', en: 'sad', he: 'עצוב', emoji: '😢', world: 15, level: 3 },
  { id: 'w15_angry', en: 'angry', he: 'כועס', emoji: '😠', world: 15, level: 3 },
  { id: 'w15_scared', en: 'scared', he: 'מפחד', emoji: '😨', world: 15, level: 3, group: 'fear' },
  { id: 'w15_tired', en: 'tired', he: 'עייף', emoji: '🥱', world: 15, level: 3 },
  { id: 'w15_surprised', en: 'surprised', he: 'מופתע', emoji: '😮', world: 15, level: 3 },
  { id: 'w15_excited', en: 'excited', he: 'נרגש', emoji: '🤩', world: 15, level: 3, group: 'joy' },
  { id: 'w15_bored', en: 'bored', he: 'משועמם', emoji: null, world: 15, level: 3 },
  { id: 'w15_shy', en: 'shy', he: 'ביישן', emoji: '😳', world: 15, level: 3 },
  { id: 'w15_funny', en: 'funny', he: 'מצחיק', emoji: '🤪', world: 15, level: 3 },
  { id: 'w15_sick', en: 'sick', he: 'חולה', emoji: '🤒', world: 15, level: 3 },
  { id: 'w15_calm', en: 'calm', he: 'רגוע', emoji: null, world: 15, level: 3 },
  { id: 'w15_worried', en: 'worried', he: 'מודאג', emoji: '😟', world: 15, level: 3, group: 'fear' },
  { id: 'w15_confused', en: 'confused', he: 'מבולבל', emoji: '😕', world: 15, level: 3 },
  { id: 'w15_smart', en: 'smart', he: 'חכם', emoji: null, world: 15, level: 3 },
  { id: 'w15_curious', en: 'curious', he: 'סקרן', emoji: null, world: 15, level: 3 },
  { id: 'w15_strong', en: 'strong', he: 'חזק', emoji: '💪', world: 15, level: 3 },
  { id: 'w15_dizzy', en: 'dizzy', he: 'מסוחרר', emoji: '😵', world: 15, level: 3 },
  { id: 'w15_brave', en: 'brave', he: 'אמיץ', emoji: null, world: 15, level: 3 },
  { id: 'w15_proud', en: 'proud', he: 'גאה', emoji: null, world: 15, level: 3 },
  { id: 'w15_kind', en: 'kind', he: 'נחמד', emoji: null, world: 15, level: 3 },
  { id: 'w15_hungry', en: 'hungry', he: 'רעב', emoji: null, world: 15, level: 3 },
  { id: 'w15_thirsty', en: 'thirsty', he: 'צמא', emoji: null, world: 15, level: 3 },
  { id: 'w15_polite', en: 'polite', he: 'מנומס', emoji: null, world: 15, level: 3 },

  // World 16: Opposites Park (24)
  { id: 'w16_hot', en: 'hot', he: 'חם', emoji: '🥵', world: 16, level: 3, group: 'temp' },
  { id: 'w16_cold', en: 'cold', he: 'קר', emoji: '🥶', world: 16, level: 3, group: 'temp' },
  { id: 'w16_fast', en: 'fast', he: 'מהיר', emoji: '🏎️', world: 16, level: 3, group: 'speed' },
  { id: 'w16_slow', en: 'slow', he: 'איטי', emoji: '🐢', world: 16, level: 3, group: 'speed' },
  { id: 'w16_up', en: 'up', he: 'למעלה', emoji: '⬆️', world: 16, level: 3, group: 'dir_v' },
  { id: 'w16_down', en: 'down', he: 'למטה', emoji: '⬇️', world: 16, level: 3, group: 'dir_v' },
  { id: 'w16_left', en: 'left', he: 'שמאלה', emoji: '⬅️', world: 16, level: 3, group: 'dir_h' },
  { id: 'w16_right', en: 'right', he: 'ימינה', emoji: '➡️', world: 16, level: 3, group: 'dir_h' },
  { id: 'w16_loud', en: 'loud', he: 'רועש', emoji: '📢', world: 16, level: 3, group: 'volume' },
  { id: 'w16_quiet', en: 'quiet', he: 'שקט', emoji: '🤫', world: 16, level: 3, group: 'volume' },
  { id: 'w16_old', en: 'old', he: 'זקן', emoji: '👴', world: 16, level: 3, group: 'age' },
  { id: 'w16_young', en: 'young', he: 'צעיר', emoji: '👶', world: 16, level: 3, group: 'age' },
  { id: 'w16_light', en: 'light', he: 'קל', emoji: '🪶', world: 16, level: 3, group: 'weight' },
  { id: 'w16_heavy', en: 'heavy', he: 'כבד', emoji: null, world: 16, level: 3, group: 'weight' },
  { id: 'w16_wet', en: 'wet', he: 'רטוב', emoji: '💦', world: 16, level: 3, group: 'moisture' },
  { id: 'w16_dry', en: 'dry', he: 'יבש', emoji: null, world: 16, level: 3, group: 'moisture' },
  { id: 'w16_good', en: 'good', he: 'טוב', emoji: '👍', world: 16, level: 3, group: 'quality' },
  { id: 'w16_bad', en: 'bad', he: 'רע', emoji: '👎', world: 16, level: 3, group: 'quality' },
  { id: 'w16_big', en: 'big', he: 'גדול', emoji: null, world: 16, level: 3, group: 'size' },
  { id: 'w16_small', en: 'small', he: 'קטן', emoji: null, world: 16, level: 3, group: 'size' },
  { id: 'w16_full', en: 'full', he: 'מלא', emoji: null, world: 16, level: 3, group: 'amount' },
  { id: 'w16_empty', en: 'empty', he: 'ריק', emoji: null, world: 16, level: 3, group: 'amount' },
  { id: 'w16_clean', en: 'clean', he: 'נקי', emoji: null, world: 16, level: 3, group: 'neat' },
  { id: 'w16_dirty', en: 'dirty', he: 'מלוכלך', emoji: null, world: 16, level: 3, group: 'neat' },

  // World 17: Space Station (24)
  { id: 'w17_planet', en: 'planet', he: 'כוכב לכת', emoji: '🪐', world: 17, level: 3 },
  { id: 'w17_earth', en: 'earth', he: 'כדור הארץ', emoji: '🌍', world: 17, level: 3 },
  { id: 'w17_moon', en: 'moon', he: 'ירח', emoji: '🌕', world: 17, level: 3 },
  { id: 'w17_star', en: 'star', he: 'כוכב', emoji: '⭐', world: 17, level: 3 },
  { id: 'w17_rocket', en: 'rocket', he: 'טיל', emoji: '🚀', world: 17, level: 3, group: 'craft' },
  { id: 'w17_spaceship', en: 'spaceship', he: 'חללית', emoji: '🛸', world: 17, level: 3, group: 'craft' },
  { id: 'w17_satellite', en: 'satellite', he: 'לוויין', emoji: '🛰️', world: 17, level: 3 },
  { id: 'w17_telescope', en: 'telescope', he: 'טלסקופ', emoji: '🔭', world: 17, level: 3 },
  { id: 'w17_comet', en: 'comet', he: 'שביט', emoji: '☄️', world: 17, level: 3, group: 'streaker' },
  { id: 'w17_alien', en: 'alien', he: 'חייזר', emoji: '👽', world: 17, level: 3 },
  { id: 'w17_robot', en: 'robot', he: 'רובוט', emoji: '🤖', world: 17, level: 3 },
  { id: 'w17_galaxy', en: 'galaxy', he: 'גלקסיה', emoji: '🌌', world: 17, level: 3 },
  { id: 'w17_meteor', en: 'meteor', he: 'מטאור', emoji: '🌠', world: 17, level: 3, group: 'streaker' },
  { id: 'w17_sky', en: 'sky', he: 'שמיים', emoji: '🌤️', world: 17, level: 3 },
  { id: 'w17_antenna', en: 'antenna', he: 'אנטנה', emoji: '📡', world: 17, level: 3 },
  { id: 'w17_battery', en: 'battery', he: 'סוללה', emoji: '🔋', world: 17, level: 3 },
  { id: 'w17_magnet', en: 'magnet', he: 'מגנט', emoji: '🧲', world: 17, level: 3 },
  { id: 'w17_compass', en: 'compass', he: 'מצפן', emoji: '🧭', world: 17, level: 3 },
  { id: 'w17_space', en: 'space', he: 'חלל', emoji: null, world: 17, level: 3 },
  { id: 'w17_gravity', en: 'gravity', he: 'כוח כבידה', emoji: null, world: 17, level: 3 },
  { id: 'w17_orbit', en: 'orbit', he: 'מסלול', emoji: null, world: 17, level: 3 },
  { id: 'w17_crater', en: 'crater', he: 'מכתש', emoji: null, world: 17, level: 3 },
  { id: 'w17_mars', en: 'Mars', he: 'מאדים', emoji: null, world: 17, level: 3 },
  { id: 'w17_dark', en: 'dark', he: 'חשוך', emoji: null, world: 17, level: 3 },

  // World 18: Music Hall (24)
  { id: 'w18_music', en: 'music', he: 'מוזיקה', emoji: '🎵', world: 18, level: 3, group: 'notes' },
  { id: 'w18_guitar', en: 'guitar', he: 'גיטרה', emoji: '🎸', world: 18, level: 3 },
  { id: 'w18_piano', en: 'piano', he: 'פסנתר', emoji: '🎹', world: 18, level: 3 },
  { id: 'w18_drum', en: 'drum', he: 'תוף', emoji: '🥁', world: 18, level: 3 },
  { id: 'w18_trumpet', en: 'trumpet', he: 'חצוצרה', emoji: '🎺', world: 18, level: 3 },
  { id: 'w18_violin', en: 'violin', he: 'כינור', emoji: '🎻', world: 18, level: 3 },
  { id: 'w18_saxophone', en: 'saxophone', he: 'סקסופון', emoji: '🎷', world: 18, level: 3 },
  { id: 'w18_flute', en: 'flute', he: 'חליל', emoji: '🪈', world: 18, level: 3 },
  { id: 'w18_accordion', en: 'accordion', he: 'אקורדיון', emoji: '🪗', world: 18, level: 3 },
  { id: 'w18_banjo', en: 'banjo', he: "בנג'ו", emoji: '🪕', world: 18, level: 3 },
  { id: 'w18_microphone', en: 'microphone', he: 'מיקרופון', emoji: '🎤', world: 18, level: 3 },
  { id: 'w18_headphones', en: 'headphones', he: 'אוזניות', emoji: '🎧', world: 18, level: 3 },
  { id: 'w18_radio', en: 'radio', he: 'רדיו', emoji: '📻', world: 18, level: 3 },
  { id: 'w18_speaker', en: 'speaker', he: 'רמקול', emoji: '🔊', world: 18, level: 3 },
  { id: 'w18_bell', en: 'bell', he: 'פעמון', emoji: '🔔', world: 18, level: 3 },
  { id: 'w18_note', en: 'note', he: 'תו', emoji: null, world: 18, level: 3, group: 'notes' },
  { id: 'w18_voice', en: 'voice', he: 'קול', emoji: '🗣️', world: 18, level: 3 },
  { id: 'w18_maracas', en: 'maracas', he: 'רעשן', emoji: '🪇', world: 18, level: 3 },
  { id: 'w18_song', en: 'song', he: 'שיר', emoji: null, world: 18, level: 3 },
  { id: 'w18_band', en: 'band', he: 'להקה', emoji: null, world: 18, level: 3 },
  { id: 'w18_concert', en: 'concert', he: 'הופעה', emoji: null, world: 18, level: 3 },
  { id: 'w18_rhythm', en: 'rhythm', he: 'קצב', emoji: null, world: 18, level: 3 },
  { id: 'w18_stage', en: 'stage', he: 'במה', emoji: null, world: 18, level: 3 },
  { id: 'w18_melody', en: 'melody', he: 'מנגינה', emoji: null, world: 18, level: 3 },

  // World 19: School Lane (24)
  { id: 'w19_school', en: 'school', he: 'בית ספר', emoji: '🏫', world: 19, level: 3 },
  { id: 'w19_pencil', en: 'pencil', he: 'עיפרון', emoji: '✏️', world: 19, level: 3, group: 'writing' },
  { id: 'w19_pen', en: 'pen', he: 'עט', emoji: '🖊️', world: 19, level: 3, group: 'writing' },
  { id: 'w19_notebook', en: 'notebook', he: 'מחברת', emoji: '📓', world: 19, level: 3 },
  { id: 'w19_backpack', en: 'backpack', he: 'ילקוט', emoji: '🎒', world: 19, level: 3 },
  { id: 'w19_ruler', en: 'ruler', he: 'סרגל', emoji: '📏', world: 19, level: 3 },
  { id: 'w19_scissors', en: 'scissors', he: 'מספריים', emoji: '✂️', world: 19, level: 3 },
  { id: 'w19_crayon', en: 'crayon', he: 'צבע שעווה', emoji: '🖍️', world: 19, level: 3 },
  { id: 'w19_paintbrush', en: 'paintbrush', he: 'מכחול', emoji: '🖌️', world: 19, level: 3 },
  { id: 'w19_globe', en: 'globe', he: 'גלובוס', emoji: '🌐', world: 19, level: 3 },
  { id: 'w19_map', en: 'map', he: 'מפה', emoji: '🗺️', world: 19, level: 3 },
  { id: 'w19_math', en: 'math', he: 'חשבון', emoji: '🧮', world: 19, level: 3 },
  { id: 'w19_science', en: 'science', he: 'מדעים', emoji: '🔬', world: 19, level: 3 },
  { id: 'w19_art', en: 'art', he: 'אומנות', emoji: '🎨', world: 19, level: 3 },
  { id: 'w19_history', en: 'history', he: 'היסטוריה', emoji: null, world: 19, level: 3 },
  { id: 'w19_english', en: 'English', he: 'אנגלית', emoji: null, world: 19, level: 3 },
  { id: 'w19_test', en: 'test', he: 'מבחן', emoji: null, world: 19, level: 3 },
  { id: 'w19_student', en: 'student', he: 'תלמיד', emoji: '🧑‍🎓', world: 19, level: 3 },
  { id: 'w19_eraser', en: 'eraser', he: 'מחק', emoji: null, world: 19, level: 3 },
  { id: 'w19_glue', en: 'glue', he: 'דבק', emoji: null, world: 19, level: 3 },
  { id: 'w19_desk', en: 'desk', he: 'שולחן כתיבה', emoji: null, world: 19, level: 3 },
  { id: 'w19_board', en: 'board', he: 'לוח', emoji: null, world: 19, level: 3 },
  { id: 'w19_homework', en: 'homework', he: 'שיעורי בית', emoji: null, world: 19, level: 3 },
  { id: 'w19_class', en: 'class', he: 'כיתה', emoji: null, world: 19, level: 3 },

  // World 20: Town Map (24)
  { id: 'w20_city', en: 'city', he: 'עיר', emoji: '🏙️', world: 20, level: 3 },
  { id: 'w20_bank', en: 'bank', he: 'בנק', emoji: '🏦', world: 20, level: 3 },
  { id: 'w20_hospital', en: 'hospital', he: 'בית חולים', emoji: '🏥', world: 20, level: 3 },
  { id: 'w20_library', en: 'library', he: 'ספרייה', emoji: '📚', world: 20, level: 3 },
  { id: 'w20_museum', en: 'museum', he: 'מוזיאון', emoji: '🏛️', world: 20, level: 3 },
  { id: 'w20_hotel', en: 'hotel', he: 'מלון', emoji: '🏨', world: 20, level: 3 },
  { id: 'w20_store', en: 'store', he: 'חנות', emoji: '🏪', world: 20, level: 3, group: 'shop' },
  { id: 'w20_market', en: 'market', he: 'שוק', emoji: '🛒', world: 20, level: 3, group: 'shop' },
  { id: 'w20_bakery', en: 'bakery', he: 'מאפייה', emoji: '🥐', world: 20, level: 3 },
  { id: 'w20_cafe', en: 'cafe', he: 'בית קפה', emoji: '☕', world: 20, level: 3 },
  { id: 'w20_cinema', en: 'cinema', he: 'קולנוע', emoji: '🎬', world: 20, level: 3 },
  { id: 'w20_playground', en: 'playground', he: 'גן שעשועים', emoji: '🛝', world: 20, level: 3 },
  { id: 'w20_castle', en: 'castle', he: 'טירה', emoji: '🏰', world: 20, level: 3 },
  { id: 'w20_bridge', en: 'bridge', he: 'גשר', emoji: '🌉', world: 20, level: 3 },
  { id: 'w20_fountain', en: 'fountain', he: 'מזרקה', emoji: '⛲', world: 20, level: 3 },
  { id: 'w20_post_office', en: 'post office', he: 'דואר', emoji: '📮', world: 20, level: 3 },
  { id: 'w20_factory', en: 'factory', he: 'מפעל', emoji: '🏭', world: 20, level: 3 },
  { id: 'w20_stadium', en: 'stadium', he: 'אצטדיון', emoji: '🏟️', world: 20, level: 3 },
  { id: 'w20_tent', en: 'tent', he: 'אוהל', emoji: '⛺', world: 20, level: 3 },
  { id: 'w20_farm', en: 'farm', he: 'חווה', emoji: '🌾', world: 20, level: 3 },
  { id: 'w20_zoo', en: 'zoo', he: 'גן חיות', emoji: null, world: 20, level: 3 },
  { id: 'w20_park', en: 'park', he: 'פארק', emoji: null, world: 20, level: 3 },
  { id: 'w20_street', en: 'street', he: 'רחוב', emoji: null, world: 20, level: 3 },
  { id: 'w20_restaurant', en: 'restaurant', he: 'מסעדה', emoji: null, world: 20, level: 3 },

  // World 21: Action Airport 2 (24)
  { id: 'w21_build', en: 'build', he: 'לבנות', emoji: '🧱', world: 21, level: 3 },
  { id: 'w21_cut', en: 'cut', he: 'לגזור', emoji: '✂️', world: 21, level: 3 },
  { id: 'w21_wash', en: 'wash', he: 'לשטוף', emoji: '🧼', world: 21, level: 3 },
  { id: 'w21_buy', en: 'buy', he: 'לקנות', emoji: '🛍️', world: 21, level: 3 },
  { id: 'w21_pay', en: 'pay', he: 'לשלם', emoji: '💳', world: 21, level: 3 },
  { id: 'w21_open', en: 'open', he: 'לפתוח', emoji: '🔓', world: 21, level: 3, group: 'lockstate' },
  { id: 'w21_close', en: 'close', he: 'לסגור', emoji: '🔒', world: 21, level: 3, group: 'lockstate' },
  { id: 'w21_stop', en: 'stop', he: 'לעצור', emoji: '🛑', world: 21, level: 3 },
  { id: 'w21_wait', en: 'wait', he: 'לחכות', emoji: null, world: 21, level: 3 },
  { id: 'w21_help', en: 'help', he: 'לעזור', emoji: null, world: 21, level: 3 },
  { id: 'w21_listen', en: 'listen', he: 'להקשיב', emoji: '👂', world: 21, level: 3 },
  { id: 'w21_look', en: 'look', he: 'להסתכל', emoji: '👀', world: 21, level: 3 },
  { id: 'w21_smile', en: 'smile', he: 'לחייך', emoji: '😄', world: 21, level: 3 },
  { id: 'w21_clap', en: 'clap', he: 'למחוא כפיים', emoji: '👏', world: 21, level: 3 },
  { id: 'w21_kick', en: 'kick', he: 'לבעוט', emoji: '🦵', world: 21, level: 3 },
  { id: 'w21_think', en: 'think', he: 'לחשוב', emoji: null, world: 21, level: 3 },
  { id: 'w21_win', en: 'win', he: 'לנצח', emoji: '🏆', world: 21, level: 3 },
  { id: 'w21_break', en: 'break', he: 'לשבור', emoji: '💥', world: 21, level: 3 },
  { id: 'w21_catch', en: 'catch', he: 'לתפוס', emoji: null, world: 21, level: 3 },
  { id: 'w21_throw', en: 'throw', he: 'לזרוק', emoji: null, world: 21, level: 3 },
  { id: 'w21_push', en: 'push', he: 'לדחוף', emoji: null, world: 21, level: 3 },
  { id: 'w21_pull', en: 'pull', he: 'למשוך', emoji: null, world: 21, level: 3 },
  { id: 'w21_ask', en: 'ask', he: 'לשאול', emoji: null, world: 21, level: 3 },
  { id: 'w21_answer', en: 'answer', he: 'לענות', emoji: null, world: 21, level: 3 },

  // World 22: Time Tunnel (24)
  { id: 'w22_morning', en: 'morning', he: 'בוקר', emoji: null, world: 22, level: 3, group: 'daypart' },
  { id: 'w22_evening', en: 'evening', he: 'ערב', emoji: null, world: 22, level: 3, group: 'daypart' },
  { id: 'w22_midnight', en: 'midnight', he: 'חצות', emoji: '🕛', world: 22, level: 3 },
  { id: 'w22_today', en: 'today', he: 'היום', emoji: '📅', world: 22, level: 3, group: 'relday' },
  { id: 'w22_week', en: 'week', he: 'שבוע', emoji: null, world: 22, level: 3, group: 'cal' },
  { id: 'w22_year', en: 'year', he: 'שנה', emoji: null, world: 22, level: 3, group: 'cal' },
  { id: 'w22_hour', en: 'hour', he: 'שעה', emoji: null, world: 22, level: 3, group: 'unit' },
  { id: 'w22_minute', en: 'minute', he: 'דקה', emoji: null, world: 22, level: 3, group: 'unit' },
  { id: 'w22_birthday', en: 'birthday', he: 'יום הולדת', emoji: '🎂', world: 22, level: 3 },
  { id: 'w22_always', en: 'always', he: 'תמיד', emoji: null, world: 22, level: 3 },
  { id: 'w22_never', en: 'never', he: 'אף פעם', emoji: null, world: 22, level: 3 },
  { id: 'w22_first', en: 'first', he: 'ראשון', emoji: '🥇', world: 22, level: 3, group: 'ordinal' },
  { id: 'w22_third', en: 'third', he: 'שלישי', emoji: '🥉', world: 22, level: 3, group: 'ordinal' },
  { id: 'w22_sunrise', en: 'sunrise', he: 'זריחה', emoji: '🌄', world: 22, level: 3, group: 'daypart' },
  { id: 'w22_sunset', en: 'sunset', he: 'שקיעה', emoji: '🌇', world: 22, level: 3, group: 'daypart' },
  { id: 'w22_alarm', en: 'alarm', he: 'שעון מעורר', emoji: '⏰', world: 22, level: 3 },
  { id: 'w22_tomorrow', en: 'tomorrow', he: 'מחר', emoji: null, world: 22, level: 3, group: 'relday' },
  { id: 'w22_yesterday', en: 'yesterday', he: 'אתמול', emoji: null, world: 22, level: 3, group: 'relday' },
  { id: 'w22_month', en: 'month', he: 'חודש', emoji: null, world: 22, level: 3, group: 'cal' },
  { id: 'w22_early', en: 'early', he: 'מוקדם', emoji: null, world: 22, level: 3 },
  { id: 'w22_late', en: 'late', he: 'מאוחר', emoji: null, world: 22, level: 3 },
  { id: 'w22_sunday', en: 'Sunday', he: 'יום ראשון', emoji: null, world: 22, level: 3 },
  { id: 'w22_friday', en: 'Friday', he: 'יום שישי', emoji: null, world: 22, level: 3 },
  { id: 'w22_january', en: 'January', he: 'ינואר', emoji: null, world: 22, level: 3 }
];

export function createRng(seedValue) {
  if (seedValue === null || seedValue === undefined) {
    return () => Math.random();
  }
  let state = (Number(seedValue) >>> 0) || 1;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle(arr, rng) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

export function getLevelById(levelId) {
  return LEVELS.find((l) => l.id === Number(levelId)) || LEVELS[0];
}

export function getWorldById(worldId) {
  return WORLDS.find((w) => w.id === Number(worldId)) || WORLDS[0];
}

export function getWorldsByLevel(levelId) {
  return WORLDS.filter((w) => w.level === Number(levelId));
}

export function getWordsByWorld(worldId) {
  return WORDS.filter((w) => w.world === Number(worldId));
}

/**
 * Selects words for a race run using spaced repetition lite:
 * - In 'picture' mode, skips words without an emoji (emoji: null).
 * - Words missed in the previous run appear earlier.
 * - ~60% lowest mastery scores, ~40% random from the remaining eligible world words.
 */
export function pickRunWords(worldId, wordScores = {}, lastMissedIds = [], rng = Math.random, count = 18, mode = 'picture') {
  const allWorldWords = getWordsByWorld(worldId);
  const eligible = mode === 'picture'
    ? allWorldWords.filter((w) => Boolean(w.emoji))
    : allWorldWords;
  const pool = eligible.length > 0 ? eligible : allWorldWords;

  const total = Math.min(count, pool.length);
  const missedSet = new Set(lastMissedIds || []);

  // Partition missed words from last run so they show up early
  const missedWords = shuffle(pool.filter((w) => missedSet.has(w.id)), rng);
  const nonMissed = pool.filter((w) => !missedSet.has(w.id));

  // Sort non-missed by mastery score ascending, randomizing ties
  const shuffledNonMissed = shuffle(nonMissed, rng);
  shuffledNonMissed.sort((a, b) => (wordScores[a.id] || 0) - (wordScores[b.id] || 0));

  const lowCount = Math.round(total * 0.6);
  const selected = [];
  const selectedIds = new Set();

  for (const w of missedWords) {
    if (selected.length >= total) break;
    selected.push(w);
    selectedIds.add(w.id);
  }

  for (const w of shuffledNonMissed) {
    if (selected.length >= Math.min(total, lowCount + missedWords.length)) break;
    if (!selectedIds.has(w.id)) {
      selected.push(w);
      selectedIds.add(w.id);
    }
  }

  const remaining = shuffle(pool.filter((w) => !selectedIds.has(w.id)), rng);
  for (const w of remaining) {
    if (selected.length >= total) break;
    selected.push(w);
    selectedIds.add(w.id);
  }

  // Keep previously missed words in the earlier third, shuffle the rest smoothly
  const earlyMissed = selected.filter((w) => missedSet.has(w.id));
  const others = shuffle(selected.filter((w) => !missedSet.has(w.id)), rng);
  return [...earlyMissed, ...others];
}

/**
 * Picks 2 unambiguous distractors from the same world.
 * Never picks the same non-null emoji or a word in the same conflict group.
 */
export function pickDistractors(targetWord, worldWords, rng = Math.random, count = 2) {
  const candidates = worldWords.filter((w) => {
    if (w.id === targetWord.id) return false;
    if (targetWord.emoji && w.emoji && w.emoji === targetWord.emoji) return false;
    if (targetWord.group && w.group && targetWord.group === w.group) return false;
    return true;
  });

  const shuffled = shuffle(candidates, rng);
  const chosen = [];
  const usedGroups = new Set(targetWord.group ? [targetWord.group] : []);

  for (const cand of shuffled) {
    if (chosen.length >= count) break;
    if (cand.group && usedGroups.has(cand.group)) continue;
    chosen.push(cand);
    if (cand.group) usedGroups.add(cand.group);
  }

  // Fallback if group filtering was overly strict
  if (chosen.length < count) {
    for (const cand of shuffled) {
      if (chosen.length >= count) break;
      if (!chosen.some((c) => c.id === cand.id)) {
        chosen.push(cand);
      }
    }
  }

  return chosen;
}
