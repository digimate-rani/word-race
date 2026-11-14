// Vocabulary data, world themes, and distractor/word-selection helpers.
// 6 worlds x 20 words = 120 words total.

export const WORLDS = [
  {
    id: 1,
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
  }
];

export const WORDS = [
  // World 1: Animal Jungle (20)
  { id: 'w1_dog', en: 'dog', he: 'כלב', emoji: '🐶', world: 1 },
  { id: 'w1_cat', en: 'cat', he: 'חתול', emoji: '🐱', world: 1, group: 'feline' },
  { id: 'w1_lion', en: 'lion', he: 'אריה', emoji: '🦁', world: 1, group: 'bigcat' },
  { id: 'w1_monkey', en: 'monkey', he: 'קוף', emoji: '🐵', world: 1 },
  { id: 'w1_elephant', en: 'elephant', he: 'פיל', emoji: '🐘', world: 1 },
  { id: 'w1_fish', en: 'fish', he: 'דג', emoji: '🐟', world: 1 },
  { id: 'w1_bird', en: 'bird', he: 'ציפור', emoji: '🐦', world: 1, group: 'avian' },
  { id: 'w1_horse', en: 'horse', he: 'סוס', emoji: '🐴', world: 1 },
  { id: 'w1_cow', en: 'cow', he: 'פרה', emoji: '🐄', world: 1 },
  { id: 'w1_frog', en: 'frog', he: 'צפרדע', emoji: '🐸', world: 1 },
  { id: 'w1_snake', en: 'snake', he: 'נחש', emoji: '🐍', world: 1 },
  { id: 'w1_rabbit', en: 'rabbit', he: 'ארנב', emoji: '🐰', world: 1 },
  { id: 'w1_bear', en: 'bear', he: 'דוב', emoji: '🐻', world: 1 },
  { id: 'w1_duck', en: 'duck', he: 'ברווז', emoji: '🦆', world: 1, group: 'avian' },
  { id: 'w1_pig', en: 'pig', he: 'חזיר', emoji: '🐷', world: 1 },
  { id: 'w1_sheep', en: 'sheep', he: 'כבשה', emoji: '🐑', world: 1 },
  { id: 'w1_tiger', en: 'tiger', he: 'טיגריס', emoji: '🐯', world: 1, group: 'feline' },
  { id: 'w1_mouse', en: 'mouse', he: 'עכבר', emoji: '🐭', world: 1 },
  { id: 'w1_turtle', en: 'turtle', he: 'צב', emoji: '🐢', world: 1 },
  { id: 'w1_giraffe', en: 'giraffe', he: "ג'ירפה", emoji: '🦒', world: 1 },

  // World 2: Food City (20)
  { id: 'w2_apple', en: 'apple', he: 'תפוח', emoji: '🍎', world: 2 },
  { id: 'w2_banana', en: 'banana', he: 'בננה', emoji: '🍌', world: 2 },
  { id: 'w2_bread', en: 'bread', he: 'לחם', emoji: '🍞', world: 2 },
  { id: 'w2_cheese', en: 'cheese', he: 'גבינה', emoji: '🧀', world: 2 },
  { id: 'w2_egg', en: 'egg', he: 'ביצה', emoji: '🥚', world: 2 },
  { id: 'w2_milk', en: 'milk', he: 'חלב', emoji: '🥛', world: 2 },
  { id: 'w2_pizza', en: 'pizza', he: 'פיצה', emoji: '🍕', world: 2 },
  { id: 'w2_cake', en: 'cake', he: 'עוגה', emoji: '🎂', world: 2 },
  { id: 'w2_carrot', en: 'carrot', he: 'גזר', emoji: '🥕', world: 2 },
  { id: 'w2_grapes', en: 'grapes', he: 'ענבים', emoji: '🍇', world: 2 },
  { id: 'w2_orange', en: 'orange', he: 'תפוז', emoji: '🍊', world: 2 },
  { id: 'w2_strawberry', en: 'strawberry', he: 'תות', emoji: '🍓', world: 2 },
  { id: 'w2_ice_cream', en: 'ice cream', he: 'גלידה', emoji: '🍦', world: 2 },
  { id: 'w2_cookie', en: 'cookie', he: 'עוגייה', emoji: '🍪', world: 2 },
  { id: 'w2_water', en: 'water', he: 'מים', emoji: '💧', world: 2 },
  { id: 'w2_chicken', en: 'chicken', he: 'עוף', emoji: '🍗', world: 2 },
  { id: 'w2_tomato', en: 'tomato', he: 'עגבנייה', emoji: '🍅', world: 2 },
  { id: 'w2_watermelon', en: 'watermelon', he: 'אבטיח', emoji: '🍉', world: 2 },
  { id: 'w2_sandwich', en: 'sandwich', he: 'כריך', emoji: '🥪', world: 2 },
  { id: 'w2_lemon', en: 'lemon', he: 'לימון', emoji: '🍋', world: 2 },

  // World 3: Color Canyon (20: 10 colors + 10 numbers)
  { id: 'w3_red', en: 'red', he: 'אדום', emoji: '🔴', world: 3 },
  { id: 'w3_blue', en: 'blue', he: 'כחול', emoji: '🔵', world: 3 },
  { id: 'w3_green', en: 'green', he: 'ירוק', emoji: '🟢', world: 3 },
  { id: 'w3_yellow', en: 'yellow', he: 'צהוב', emoji: '🟡', world: 3 },
  { id: 'w3_orange', en: 'orange', he: 'כתום', emoji: '🟠', world: 3 },
  { id: 'w3_purple', en: 'purple', he: 'סגול', emoji: '🟣', world: 3 },
  { id: 'w3_pink', en: 'pink', he: 'ורוד', emoji: '🩷', world: 3 },
  { id: 'w3_black', en: 'black', he: 'שחור', emoji: '⚫', world: 3 },
  { id: 'w3_white', en: 'white', he: 'לבן', emoji: '⚪', world: 3 },
  { id: 'w3_brown', en: 'brown', he: 'חום', emoji: '🟤', world: 3 },
  { id: 'w3_one', en: 'one', he: 'אחת', emoji: '1️⃣', world: 3 },
  { id: 'w3_two', en: 'two', he: 'שתיים', emoji: '2️⃣', world: 3 },
  { id: 'w3_three', en: 'three', he: 'שלוש', emoji: '3️⃣', world: 3 },
  { id: 'w3_four', en: 'four', he: 'ארבע', emoji: '4️⃣', world: 3 },
  { id: 'w3_five', en: 'five', he: 'חמש', emoji: '5️⃣', world: 3 },
  { id: 'w3_six', en: 'six', he: 'שש', emoji: '6️⃣', world: 3 },
  { id: 'w3_seven', en: 'seven', he: 'שבע', emoji: '7️⃣', world: 3 },
  { id: 'w3_eight', en: 'eight', he: 'שמונה', emoji: '8️⃣', world: 3 },
  { id: 'w3_nine', en: 'nine', he: 'תשע', emoji: '9️⃣', world: 3 },
  { id: 'w3_ten', en: 'ten', he: 'עשר', emoji: '🔟', world: 3 },

  // World 4: Home Highway (20)
  { id: 'w4_house', en: 'house', he: 'בית', emoji: '🏠', world: 4 },
  { id: 'w4_bed', en: 'bed', he: 'מיטה', emoji: '🛏️', world: 4 },
  { id: 'w4_chair', en: 'chair', he: 'כיסא', emoji: '🪑', world: 4, group: 'seat' },
  { id: 'w4_table', en: 'table', he: 'שולחן', emoji: '🍽️', world: 4 },
  { id: 'w4_door', en: 'door', he: 'דלת', emoji: '🚪', world: 4 },
  { id: 'w4_window', en: 'window', he: 'חלון', emoji: '🪟', world: 4 },
  { id: 'w4_lamp', en: 'lamp', he: 'מנורה', emoji: '💡', world: 4 },
  { id: 'w4_sofa', en: 'sofa', he: 'ספה', emoji: '🛋️', world: 4, group: 'seat' },
  { id: 'w4_book', en: 'book', he: 'ספר', emoji: '📖', world: 4 },
  { id: 'w4_phone', en: 'phone', he: 'טלפון', emoji: '📱', world: 4 },
  { id: 'w4_clock', en: 'clock', he: 'שעון', emoji: '⏰', world: 4 },
  { id: 'w4_key', en: 'key', he: 'מפתח', emoji: '🔑', world: 4 },
  { id: 'w4_cup', en: 'cup', he: 'כוס', emoji: '🥤', world: 4 },
  { id: 'w4_bath', en: 'bath', he: 'אמבטיה', emoji: '🛁', world: 4 },
  { id: 'w4_tv', en: 'TV', he: 'טלוויזיה', emoji: '📺', world: 4 },
  { id: 'w4_box', en: 'box', he: 'קופסה', emoji: '📦', world: 4 },
  { id: 'w4_ball', en: 'ball', he: 'כדור', emoji: '⚽', world: 4 },
  { id: 'w4_toy', en: 'toy', he: 'צעצוע', emoji: '🧸', world: 4 },
  { id: 'w4_bag', en: 'bag', he: 'תיק', emoji: '🎒', world: 4 },
  { id: 'w4_computer', en: 'computer', he: 'מחשב', emoji: '💻', world: 4 },

  // World 5: Body Bridge (20)
  { id: 'w5_head', en: 'head', he: 'ראש', emoji: '🧑', world: 5, group: 'headface' },
  { id: 'w5_eye', en: 'eye', he: 'עין', emoji: '👁️', world: 5 },
  { id: 'w5_ear', en: 'ear', he: 'אוזן', emoji: '👂', world: 5 },
  { id: 'w5_nose', en: 'nose', he: 'אף', emoji: '👃', world: 5 },
  { id: 'w5_mouth', en: 'mouth', he: 'פה', emoji: '👄', world: 5, group: 'mouthlips' },
  { id: 'w5_hand', en: 'hand', he: 'יד', emoji: '✋', world: 5, group: 'handfinger' },
  { id: 'w5_foot', en: 'foot', he: 'כף רגל', emoji: '🦶', world: 5, group: 'legfoot' },
  { id: 'w5_leg', en: 'leg', he: 'רגל', emoji: '🦵', world: 5, group: 'legfoot' },
  { id: 'w5_arm', en: 'arm', he: 'זרוע', emoji: '🦾', world: 5, group: 'armmuscle' },
  { id: 'w5_tooth', en: 'tooth', he: 'שן', emoji: '🦷', world: 5 },
  { id: 'w5_hair', en: 'hair', he: 'שיער', emoji: '💇', world: 5 },
  { id: 'w5_finger', en: 'finger', he: 'אצבע', emoji: '☝️', world: 5, group: 'handfinger' },
  { id: 'w5_heart', en: 'heart', he: 'לב', emoji: '❤️', world: 5 },
  { id: 'w5_brain', en: 'brain', he: 'מוח', emoji: '🧠', world: 5 },
  { id: 'w5_face', en: 'face', he: 'פנים', emoji: '😀', world: 5, group: 'headface' },
  { id: 'w5_tongue', en: 'tongue', he: 'לשון', emoji: '👅', world: 5 },
  { id: 'w5_back', en: 'back', he: 'גב', emoji: '🔙', world: 5 },
  { id: 'w5_knee', en: 'knee', he: 'ברך', emoji: '🧎', world: 5, group: 'legfoot' },
  { id: 'w5_lips', en: 'lips', he: 'שפתיים', emoji: '🫦', world: 5, group: 'mouthlips' },
  { id: 'w5_muscle', en: 'muscle', he: 'שריר', emoji: '💪', world: 5, group: 'armmuscle' },

  // World 6: Action Airport (20)
  { id: 'w6_run', en: 'run', he: 'לרוץ', emoji: '🏃', world: 6, group: 'move' },
  { id: 'w6_swim', en: 'swim', he: 'לשחות', emoji: '🏊', world: 6 },
  { id: 'w6_eat', en: 'eat', he: 'לאכול', emoji: '🍽️', world: 6 },
  { id: 'w6_sleep', en: 'sleep', he: 'לישון', emoji: '😴', world: 6 },
  { id: 'w6_jump', en: 'jump', he: 'לקפוץ', emoji: '🤸', world: 6 },
  { id: 'w6_read', en: 'read', he: 'לקרוא', emoji: '📖', world: 6 },
  { id: 'w6_write', en: 'write', he: 'לכתוב', emoji: '✍️', world: 6 },
  { id: 'w6_sing', en: 'sing', he: 'לשיר', emoji: '🎤', world: 6 },
  { id: 'w6_dance', en: 'dance', he: 'לרקוד', emoji: '💃', world: 6 },
  { id: 'w6_cook', en: 'cook', he: 'לבשל', emoji: '👨‍🍳', world: 6 },
  { id: 'w6_drive', en: 'drive', he: 'לנהוג', emoji: '🚗', world: 6, group: 'vehicle' },
  { id: 'w6_fly', en: 'fly', he: 'לעוף', emoji: '✈️', world: 6 },
  { id: 'w6_climb', en: 'climb', he: 'לטפס', emoji: '🧗', world: 6 },
  { id: 'w6_cry', en: 'cry', he: 'לבכות', emoji: '😢', world: 6 },
  { id: 'w6_laugh', en: 'laugh', he: 'לצחוק', emoji: '😂', world: 6 },
  { id: 'w6_play', en: 'play', he: 'לשחק', emoji: '🎮', world: 6 },
  { id: 'w6_walk', en: 'walk', he: 'ללכת', emoji: '🚶', world: 6, group: 'move' },
  { id: 'w6_drink', en: 'drink', he: 'לשתות', emoji: '🥤', world: 6 },
  { id: 'w6_ride', en: 'ride', he: 'לרכוב', emoji: '🚲', world: 6, group: 'vehicle' },
  { id: 'w6_paint', en: 'paint', he: 'לצייר', emoji: '🎨', world: 6 }
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

export function getWorldById(worldId) {
  return WORLDS.find((w) => w.id === Number(worldId)) || WORLDS[0];
}

export function getWordsByWorld(worldId) {
  return WORDS.filter((w) => w.world === Number(worldId));
}

/**
 * Selects words for a race run using spaced repetition lite:
 * - Words missed in the previous run appear earlier.
 * - ~60% lowest mastery scores, ~40% random from the remaining world words.
 */
export function pickRunWords(worldId, wordScores = {}, lastMissedIds = [], rng = Math.random, count = 18) {
  const pool = getWordsByWorld(worldId);
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
 * Never picks the same emoji or a word in the same conflict group.
 */
export function pickDistractors(targetWord, worldWords, rng = Math.random, count = 2) {
  const candidates = worldWords.filter((w) => {
    if (w.id === targetWord.id) return false;
    if (w.emoji === targetWord.emoji) return false;
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
