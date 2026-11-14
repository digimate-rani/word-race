// LocalStorage persistence, car skins, world unlocks, and spaced-repetition mastery scores.

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
  }
];

function createDefaultData() {
  return {
    coins: 0,
    unlockedSkins: ['red_racer'],
    selectedSkin: 'red_racer',
    worldStars: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
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

  isWorldUnlocked(worldId) {
    const id = Number(worldId);
    if (id <= 1) return true;
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
