// LocalStorage persistence, car skins, level/world unlocks, and spaced-repetition mastery scores.

import { LEVELS, WORLDS, getWorldById, getWorldsByLevel } from './words.js';

const STORAGE_KEY = 'word_race_progress_v1';

export const SKINS = [
  {
    id: 'red_racer',
    nameHe: 'ברק אדום',
    price: 0,
    bodyColor: '#ef4444',
    shadeColor: '#b91c1c',
    accentColor: '#fef08a',
    windowColor: '#38bdf8',
    stripeColor: '#ffffff',
    spoiler: true
  },
  {
    id: 'sunny_turbo',
    nameHe: 'טורבו שמש',
    price: 100,
    bodyColor: '#f59e0b',
    shadeColor: '#b45309',
    accentColor: '#ffffff',
    windowColor: '#0284c7',
    stripeColor: '#dc2626',
    spoiler: true
  },
  {
    id: 'ocean_bolt',
    nameHe: 'חץ כחול',
    price: 250,
    bodyColor: '#0ea5e9',
    shadeColor: '#0369a1',
    accentColor: '#fde047',
    windowColor: '#bae6fd',
    stripeColor: '#f8fafc',
    spoiler: true
  },
  {
    id: 'jungle_beast',
    nameHe: "מפלצת ג'ונגל",
    price: 500,
    bodyColor: '#22c55e',
    shadeColor: '#15803d',
    accentColor: '#fb923c',
    windowColor: '#fef08a',
    stripeColor: '#052e16',
    spoiler: true
  },
  {
    id: 'neon_galaxy',
    nameHe: 'גלקסי ניאון',
    price: 800,
    bodyColor: '#a855f7',
    shadeColor: '#6b21a8',
    accentColor: '#22d3ee',
    windowColor: '#f0abfc',
    stripeColor: '#22d3ee',
    spoiler: true
  },
  {
    id: 'golden_champ',
    nameHe: 'אלוף הזהב',
    price: 1200,
    bodyColor: '#eab308',
    shadeColor: '#a16207',
    accentColor: '#fef9c3',
    windowColor: '#0f172a',
    stripeColor: '#fffbeb',
    spoiler: true
  },
  {
    id: 'arctic_frost',
    nameHe: 'כפור ארקטי',
    price: 1600,
    bodyColor: '#38bdf8',
    shadeColor: '#0284c7',
    accentColor: '#e0f2fe',
    windowColor: '#0f172a',
    stripeColor: '#ffffff',
    spoiler: true
  },
  {
    id: 'lava_dragon',
    nameHe: 'דרקון לבה',
    price: 2000,
    bodyColor: '#dc2626',
    shadeColor: '#450a0a',
    accentColor: '#fb923c',
    windowColor: '#fde047',
    stripeColor: '#f97316',
    spoiler: true
  },
  {
    id: 'emerald_viper',
    nameHe: 'צפע ברקת',
    price: 2500,
    bodyColor: '#10b981',
    shadeColor: '#064e3b',
    accentColor: '#bef264',
    windowColor: '#0f172a',
    stripeColor: '#a3e635',
    spoiler: true
  },
  {
    id: 'cyber_pink',
    nameHe: 'סייבר ורוד',
    price: 3000,
    bodyColor: '#ec4899',
    shadeColor: '#831843',
    accentColor: '#22d3ee',
    windowColor: '#1e1b4b',
    stripeColor: '#22d3ee',
    spoiler: true
  },
  {
    id: 'shadow_phantom',
    nameHe: 'פנטום צללים',
    price: 4000,
    bodyColor: '#334155',
    shadeColor: '#0f172a',
    accentColor: '#facc15',
    windowColor: '#38bdf8',
    stripeColor: '#facc15',
    spoiler: true
  },
  {
    id: 'rainbow_legend',
    nameHe: 'אגדת הקשת',
    price: 5000,
    bodyColor: '#6366f1',
    shadeColor: '#312e81',
    accentColor: '#fde047',
    windowColor: '#fef08a',
    stripeColor: '#f43f5e',
    rainbow: true,
    spoiler: true
  }
];

function createDefaultWorldStars() {
  const map = {};
  for (const w of WORLDS) {
    map[w.id] = 0;
  }
  return map;
}

function createDefaultData() {
  return {
    coins: 0,
    unlockedSkins: ['red_racer'],
    selectedSkin: 'red_racer',
    worldStars: createDefaultWorldStars(),
    wordScores: {},
    lastMissed: {},
    lastMode: 'picture',
    settings: {
      sound: true,
      music: true,
      voiceSpeed: 'normal'
    }
  };
}

export class ProgressStore {
  constructor() {
    this.data = this._load();
  }

  _load() {
    const fallback = createDefaultData();
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return {
        ...fallback,
        ...parsed,
        worldStars: { ...fallback.worldStars, ...(parsed.worldStars || {}) },
        wordScores: { ...(parsed.wordScores || {}) },
        lastMissed: { ...(parsed.lastMissed || {}) },
        settings: { ...fallback.settings, ...(parsed.settings || {}) },
        unlockedSkins: Array.isArray(parsed.unlockedSkins) && parsed.unlockedSkins.length
          ? parsed.unlockedSkins
          : ['red_racer']
      };
    } catch {
      return fallback;
    }
  }

  _save() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch {
      // Ignore storage quota or privacy-mode errors gracefully
    }
  }

  get coins() {
    return this.data.coins;
  }

  get settings() {
    return this.data.settings;
  }

  get lastMode() {
    return this.data.lastMode || 'picture';
  }

  getSelectedSkin() {
    return SKINS.find((s) => s.id === this.data.selectedSkin) || SKINS[0];
  }

  isSkinUnlocked(skinId) {
    return this.data.unlockedSkins.includes(skinId);
  }

  buySkin(skinId) {
    const skin = SKINS.find((s) => s.id === skinId);
    if (!skin) return false;
    if (this.isSkinUnlocked(skinId)) {
      this.selectSkin(skinId);
      return true;
    }
    if (this.data.coins < skin.price) return false;
    this.data.coins -= skin.price;
    this.data.unlockedSkins.push(skinId);
    this.data.selectedSkin = skinId;
    this._save();
    return true;
  }

  selectSkin(skinId) {
    if (!this.isSkinUnlocked(skinId)) return false;
    this.data.selectedSkin = skinId;
    this._save();
    return true;
  }

  getStars(worldId) {
    return this.data.worldStars[worldId] || 0;
  }

  isLevelUnlocked(levelId) {
    const lvl = Number(levelId);
    if (lvl <= 1) return true;
    const prevWorlds = getWorldsByLevel(lvl - 1);
    if (!prevWorlds.length) return false;
    return prevWorlds.every((w) => this.getStars(w.id) >= 1);
  }

  getLevelProgress(levelId) {
    const worlds = getWorldsByLevel(levelId);
    let earned = 0;
    let completedWorlds = 0;
    for (const w of worlds) {
      const s = this.getStars(w.id);
      earned += s;
      if (s >= 1) completedWorlds++;
    }
    return {
      earned,
      possible: worlds.length * 3,
      completedWorlds,
      totalWorlds: worlds.length
    };
  }

  getHighestUnlockedLevel() {
    let highest = 1;
    for (const lvl of LEVELS) {
      if (this.isLevelUnlocked(lvl.id)) {
        highest = lvl.id;
      }
    }
    return highest;
  }

  isWorldUnlocked(worldId) {
    const id = Number(worldId);
    if (id <= 1) return true;
    const world = getWorldById(id);
    if (!world || world.id !== id) return false;
    if (!this.isLevelUnlocked(world.level)) return false;

    const levelWorlds = getWorldsByLevel(world.level);
    if (levelWorlds.length && levelWorlds[0].id === id) {
      return true;
    }
    return this.getStars(id - 1) >= 2;
  }

  setLastMode(mode) {
    if (['picture', 'listen', 'hebrew'].includes(mode)) {
      this.data.lastMode = mode;
      this._save();
    }
  }

  setSetting(key, value) {
    this.data.settings[key] = value;
    this._save();
  }

  addCoins(amount) {
    this.data.coins = Math.max(0, this.data.coins + Math.floor(amount));
    this._save();
  }

  updateWordScore(wordId, isCorrect) {
    const current = this.data.wordScores[wordId] || 0;
    const next = isCorrect ? Math.min(5, current + 1) : Math.max(0, current - 2);
    this.data.wordScores[wordId] = next;
    this._save();
  }

  recordRunResult({ worldId, stars, missedIds }) {
    const prevStars = this.getStars(worldId);
    if (stars > prevStars) {
      this.data.worldStars[worldId] = stars;
    }
    this.data.lastMissed[worldId] = Array.isArray(missedIds) ? missedIds.slice() : [];
    this._save();
  }

  getLastMissed(worldId) {
    return this.data.lastMissed[worldId] || [];
  }

  reset() {
    this.data = createDefaultData();
    this._save();
  }
}
