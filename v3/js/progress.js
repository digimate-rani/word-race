// LocalStorage persistence (v3 key), car skins, level/world unlock rules (SPEC 6b + boss route),
// spaced-repetition mastery scores, and Phase B reward hooks.

import { LEVELS, WORLDS, WORDS, getWorldById, getWorldsByLevel } from '../../js/words.js';

const STORAGE_KEY = 'word_race_v3_progress';
const XP_PER_LEVEL = 200;

export const UPGRADE_CATALOG = {
  paint: [
    { id: 'default', nameHe: 'צבע מקורי', price: 0, swatch: null, metalness: 0.3, roughness: 0.24 },
    { id: 'chrome_silver', nameHe: 'כרום מראה', price: 180, swatch: '#e2e8f0', bodyColor: '#e2e8f0', shadeColor: '#64748b', accentColor: '#38bdf8', stripeColor: '#0f172a', metalness: 0.85, roughness: 0.12 },
    { id: 'candy_red', nameHe: 'אדום מטאלי', price: 220, swatch: '#f43f5e', bodyColor: '#f43f5e', shadeColor: '#9f1239', accentColor: '#fde047', stripeColor: '#ffffff', metalness: 0.55, roughness: 0.16 },
    { id: 'electric_cyan', nameHe: 'טורבו כחול', price: 260, swatch: '#06b6d4', bodyColor: '#06b6d4', shadeColor: '#155e75', accentColor: '#fde047', stripeColor: '#f8fafc', metalness: 0.5, roughness: 0.18 },
    { id: 'toxic_lime', nameHe: 'ניאון ליים', price: 320, swatch: '#84cc16', bodyColor: '#84cc16', shadeColor: '#365314', accentColor: '#ecfccb', stripeColor: '#0f172a', metalness: 0.4, roughness: 0.2 },
    { id: 'royal_violet', nameHe: 'סגול מלכותי', price: 380, swatch: '#8b5cf6', bodyColor: '#8b5cf6', shadeColor: '#4c1d95', accentColor: '#facc15', stripeColor: '#22d3ee', metalness: 0.55, roughness: 0.16 },
    { id: 'solar_gold', nameHe: 'זהב טהור', price: 460, swatch: '#facc15', bodyColor: '#facc15', shadeColor: '#a16207', accentColor: '#ffffff', stripeColor: '#fffbeb', metalness: 0.82, roughness: 0.14 },
    { id: 'obsidian_gold', nameHe: 'שחור זהב', price: 540, swatch: '#1e293b', bodyColor: '#1e293b', shadeColor: '#020617', accentColor: '#facc15', stripeColor: '#facc15', metalness: 0.6, roughness: 0.18 }
  ],
  wheels: [
    { id: 'standard', nameHe: 'גלגלי ספורט', price: 0, icon: '🛞' },
    { id: 'gold_mesh', nameHe: 'חישוקי זהב', price: 240, icon: '✨' },
    { id: 'neon_cyan', nameHe: 'ניאון כחול', price: 420, icon: '💠' },
    { id: 'monster_track', nameHe: 'גלגלי שטח', price: 620, icon: '🚙' },
    { id: 'turbo_blade', nameHe: 'להבי טורבו', price: 850, icon: '⚡' }
  ],
  spoiler: [
    { id: 'standard', nameHe: 'כנף ספורט', price: 0, icon: '🏎️' },
    { id: 'twin_deck', nameHe: 'כנף כפולה', price: 280, icon: '✈️' },
    { id: 'dragon_fins', nameHe: 'סנפירי דרקון', price: 520, icon: '🐉' },
    { id: 'hyper_neon', nameHe: 'כנף ניאון', price: 820, icon: '💫' }
  ],
  trail: [
    { id: 'standard', nameHe: 'להבת אש', price: 0, icon: '🔥', color: '#f97316' },
    { id: 'cyan_plasma', nameHe: 'פלזמה כחולה', price: 280, icon: '❄️', color: '#22d3ee' },
    { id: 'emerald_bolt', nameHe: 'ברק ירוק', price: 460, icon: '⚡', color: '#22c55e' },
    { id: 'rainbow_rush', nameHe: 'שובל קשת', price: 680, icon: '🌈', color: '#ec4899' },
    { id: 'star_gold', nameHe: 'אבק כוכבים', price: 880, icon: '🌟', color: '#facc15' }
  ]
};

export const DAILY_GIFTS = [
  { day: 1, coins: 35, xp: 30, label: 'מתנת התחלה' },
  { day: 2, coins: 55, xp: 40, label: 'יומיים ברצף!' },
  { day: 3, coins: 80, xp: 55, label: 'רצף של 3 ימים' },
  { day: 4, coins: 110, xp: 70, label: 'נהג מתמיד!' },
  { day: 5, coins: 145, xp: 90, label: 'אלוף ההתמדה' },
  { day: 6, coins: 185, xp: 115, label: 'כמעט שבוע שלם!' },
  { day: 7, coins: 280, xp: 180, label: 'סופר בונוס יום 7!' }
];

function getLocalTodayStr() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseDateDayIndex(yyyyMmDd) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(yyyyMmDd || ''));
  if (!m) return null;
  return Math.floor(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])) / 86400000);
}

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
  },
  // Special Boss-reward skins (unlocked by beating Bosses)
  {
    id: 'boss_crown_gt',
    nameHe: 'מלך המסלול GT',
    price: 0,
    bossReward: true,
    bossReqWins: 1,
    bodyColor: '#7c3aed',
    shadeColor: '#4c1d95',
    accentColor: '#facc15',
    windowColor: '#22d3ee',
    stripeColor: '#fde047',
    spoiler: true
  },
  {
    id: 'boss_inferno',
    nameHe: 'אינפרנו בוס',
    price: 0,
    bossReward: true,
    bossReqWins: 3,
    bodyColor: '#f43f5e',
    shadeColor: '#881337',
    accentColor: '#fde047',
    windowColor: '#0f172a',
    stripeColor: '#fb923c',
    spoiler: true
  },
  {
    id: 'boss_hypernova',
    nameHe: 'היפר-נובה',
    price: 0,
    bossReward: true,
    bossReqWins: 6,
    bodyColor: '#06b6d4',
    shadeColor: '#164e63',
    accentColor: '#f472b6',
    windowColor: '#fef08a',
    stripeColor: '#ffffff',
    spoiler: true
  }
];

function createDefaultWorldMap(fillVal = 0) {
  const map = {};
  for (const w of WORLDS) {
    map[w.id] = typeof fillVal === 'function' ? fillVal() : fillVal;
  }
  return map;
}

function createDefaultData() {
  return {
    coins: 0,
    unlockedSkins: ['red_racer'],
    selectedSkin: 'red_racer',
    worldStars: createDefaultWorldMap(0),
    worldSteps: createDefaultWorldMap(() => ({ listen: 0, reading: 0, race: 0 })),
    bossBeaten: createDefaultWorldMap(false),
    wordScores: {},
    lastMissed: {},
    lastMode: 'listen',
    // Phase B hooks (stored cleanly so Phase B activates them seamlessly)
    xp: 0,
    driverLevel: 1,
    dailyStreak: 0,
    lastPlayDate: null,
    lastDailyClaimDate: null,
    chestsOpened: 0,
    unlockedUpgrades: {
      paint: ['default'],
      wheels: ['standard'],
      spoiler: ['standard'],
      trail: ['standard']
    },
    upgrades: {
      paint: 'default',
      wheels: 'standard',
      spoiler: 'standard',
      trail: 'standard'
    },
    settings: {
      sound: true,
      music: true,
      voiceSpeed: 'normal'
    }
  };
}

export class ProgressStore {
  constructor() {
    this.todayOverride = null;
    this.data = this._load();
    this.checkBossCarUnlocks();
  }

  _load() {
    const fallback = createDefaultData();
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      const mergedSteps = { ...fallback.worldSteps };
      if (parsed.worldSteps && typeof parsed.worldSteps === 'object') {
        for (const w of WORLDS) {
          mergedSteps[w.id] = {
            listen: 0,
            reading: 0,
            race: 0,
            ...(parsed.worldSteps[w.id] || {})
          };
        }
      }
      const rawUpgrades = { ...fallback.upgrades, ...(parsed.upgrades || {}) };
      if (!rawUpgrades.paint) rawUpgrades.paint = 'default';
      const rawUnlockedUpg = parsed.unlockedUpgrades || {};
      const unlockedUpgrades = {
        paint: Array.isArray(rawUnlockedUpg.paint) && rawUnlockedUpg.paint.length ? rawUnlockedUpg.paint : ['default'],
        wheels: Array.isArray(rawUnlockedUpg.wheels) && rawUnlockedUpg.wheels.length ? rawUnlockedUpg.wheels : ['standard'],
        spoiler: Array.isArray(rawUnlockedUpg.spoiler) && rawUnlockedUpg.spoiler.length ? rawUnlockedUpg.spoiler : ['standard'],
        trail: Array.isArray(rawUnlockedUpg.trail) && rawUnlockedUpg.trail.length ? rawUnlockedUpg.trail : ['standard']
      };
      const xpVal = Math.max(0, Number(parsed.xp) || 0);
      return {
        ...fallback,
        ...parsed,
        xp: xpVal,
        driverLevel: 1 + Math.floor(xpVal / XP_PER_LEVEL),
        worldStars: { ...fallback.worldStars, ...(parsed.worldStars || {}) },
        worldSteps: mergedSteps,
        bossBeaten: { ...fallback.bossBeaten, ...(parsed.bossBeaten || {}) },
        wordScores: { ...(parsed.wordScores || {}) },
        lastMissed: { ...(parsed.lastMissed || {}) },
        upgrades: rawUpgrades,
        unlockedUpgrades,
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

  getEffectiveSkin() {
    const base = { ...this.getSelectedSkin() };
    const u = this.data.upgrades || {};
    const paintItem = UPGRADE_CATALOG.paint.find((p) => p.id === u.paint);
    if (paintItem && paintItem.id !== 'default') {
      base.bodyColor = paintItem.bodyColor;
      base.shadeColor = paintItem.shadeColor;
      base.accentColor = paintItem.accentColor;
      base.stripeColor = paintItem.stripeColor;
      base.paintMetalness = paintItem.metalness;
      base.paintRoughness = paintItem.roughness;
      base.rainbow = false;
    }
    base.wheelStyle = u.wheels || 'standard';
    base.spoilerStyle = u.spoiler || 'standard';
    base.trailStyle = u.trail || 'standard';
    return base;
  }

  isSkinUnlocked(skinId) {
    return this.data.unlockedSkins.includes(skinId);
  }

  getBossWinCount() {
    return Object.values(this.data.bossBeaten || {}).filter(Boolean).length;
  }

  checkBossCarUnlocks() {
    const wins = this.getBossWinCount();
    const newlyUnlocked = [];
    for (const skin of SKINS) {
      if (skin.bossReward && wins >= (skin.bossReqWins || 1) && !this.isSkinUnlocked(skin.id)) {
        this.data.unlockedSkins.push(skin.id);
        newlyUnlocked.push(skin);
      }
    }
    if (newlyUnlocked.length) this._save();
    return newlyUnlocked;
  }

  buyOrSelectSkin(skinId) {
    const skin = SKINS.find((s) => s.id === skinId);
    if (!skin) return { ok: false, action: 'missing' };

    if (this.isSkinUnlocked(skin.id)) {
      this.data.selectedSkin = skin.id;
      this._save();
      return { ok: true, action: 'selected', skin };
    }

    if (skin.bossReward) {
      return { ok: false, action: 'boss_locked', skin };
    }

    if (this.data.coins < skin.price) {
      return { ok: false, action: 'insufficient', skin };
    }

    this.data.coins -= skin.price;
    this.data.unlockedSkins.push(skin.id);
    this.data.selectedSkin = skin.id;
    this._save();
    return { ok: true, action: 'bought', skin };
  }

  isUpgradeUnlocked(category, id) {
    const list = this.data.unlockedUpgrades?.[category] || [];
    return list.includes(id);
  }

  buyOrEquipUpgrade(category, upgradeId) {
    const catalog = UPGRADE_CATALOG[category];
    if (!catalog) return { ok: false, action: 'missing' };
    const item = catalog.find((x) => x.id === upgradeId);
    if (!item) return { ok: false, action: 'missing' };

    if (this.isUpgradeUnlocked(category, item.id)) {
      this.data.upgrades[category] = item.id;
      this._save();
      return { ok: true, action: 'equipped', category, item };
    }

    if (this.data.coins < item.price) {
      return { ok: false, action: 'insufficient', category, item };
    }

    this.data.coins -= item.price;
    if (!this.data.unlockedUpgrades[category]) this.data.unlockedUpgrades[category] = [];
    this.data.unlockedUpgrades[category].push(item.id);
    this.data.upgrades[category] = item.id;
    this._save();
    return { ok: true, action: 'bought', category, item };
  }

  getStars(worldId) {
    return this.data.worldStars[worldId] || 0;
  }

  getWorldSteps(worldId) {
    return this.data.worldSteps[worldId] || { listen: 0, reading: 0, race: 0 };
  }

  getStepStars(worldId, step) {
    const steps = this.getWorldSteps(worldId);
    return steps[step] || 0;
  }

  isStepUnlocked(worldId, step) {
    if (!this.isWorldUnlocked(worldId)) return false;
    const steps = this.getWorldSteps(worldId);
    if (step === 'listen') return true;
    if (step === 'reading') return (steps.listen || 0) >= 2;
    if (step === 'race') return (steps.reading || 0) >= 2;
    return false;
  }

  isBossBeaten(worldId) {
    return Boolean(this.data.bossBeaten[worldId]);
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
    // SPEC 6b: 2+ stars on previous world, OR boss beaten on previous world (SPEC-V3)
    return this.getStars(id - 1) >= 2 || this.isBossBeaten(id - 1);
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

  get xp() {
    return this.data.xp || 0;
  }

  get driverLevel() {
    return this.data.driverLevel || 1;
  }

  get dailyStreak() {
    return this.data.dailyStreak || 0;
  }

  getTodayStr() {
    return this.todayOverride || getLocalTodayStr();
  }

  setToday(dateStr) {
    this.todayOverride = dateStr ? String(dateStr) : null;
    return this.evaluateDailyStreak();
  }

  evaluateDailyStreak() {
    const today = this.getTodayStr();
    const last = this.data.lastPlayDate;
    let isNewDay = false;

    if (last !== today) {
      isNewDay = true;
      if (!last) {
        this.data.dailyStreak = 1;
      } else {
        const diff = parseDateDayIndex(today) - parseDateDayIndex(last);
        if (diff === 1) {
          this.data.dailyStreak = (this.data.dailyStreak || 0) + 1;
        } else if (diff > 1 || diff === null || Number.isNaN(diff)) {
          this.data.dailyStreak = 1;
        }
      }
      this.data.lastPlayDate = today;
      this._save();
    }

    const streak = Math.max(1, this.data.dailyStreak || 1);
    const daySlot = ((streak - 1) % 7) + 1;
    const gift = DAILY_GIFTS[daySlot - 1] || DAILY_GIFTS[0];
    const alreadyClaimed = this.data.lastDailyClaimDate === today;

    return {
      isNewDay,
      dailyStreak: streak,
      daySlot,
      gift,
      alreadyClaimed
    };
  }

  claimDailyGift() {
    const info = this.evaluateDailyStreak();
    if (info.alreadyClaimed) {
      return { claimed: false, ...info, coins: 0, xp: 0, levelResult: { leveledUp: false } };
    }
    this.data.lastDailyClaimDate = this.getTodayStr();
    this.data.coins += info.gift.coins;
    const levelResult = this.addXp(info.gift.xp);
    this._save();
    return {
      claimed: true,
      dailyStreak: info.dailyStreak,
      daySlot: info.daySlot,
      label: info.gift.label,
      coins: info.gift.coins,
      xp: info.gift.xp,
      levelResult
    };
  }

  getLevelInfo() {
    const xp = this.xp;
    const level = 1 + Math.floor(xp / XP_PER_LEVEL);
    this.data.driverLevel = level;
    const intoLevel = xp % XP_PER_LEVEL;
    return {
      level,
      xp,
      intoLevel,
      neededForNext: XP_PER_LEVEL,
      ratio: intoLevel / XP_PER_LEVEL
    };
  }

  addXp(amount) {
    const oldLevel = 1 + Math.floor((this.data.xp || 0) / XP_PER_LEVEL);
    this.data.xp = Math.max(0, (this.data.xp || 0) + Math.floor(amount));
    const newLevel = 1 + Math.floor(this.data.xp / XP_PER_LEVEL);
    this.data.driverLevel = newLevel;
    this._save();
    return {
      xp: this.data.xp,
      oldLevel,
      newLevel,
      leveledUp: newLevel > oldLevel
    };
  }

  getStickerCount() {
    let count = 0;
    for (const w of WORDS) {
      if ((this.data.wordScores[w.id] || 0) >= 3) count++;
    }
    return count;
  }

  getTotalWordCount() {
    return WORDS.length;
  }

  updateWordScore(wordId, isCorrect) {
    const prev = this.data.wordScores[wordId] || 0;
    const next = isCorrect ? Math.min(5, prev + 1) : Math.max(0, prev - 2);
    this.data.wordScores[wordId] = next;
    this._save();
    return { prev, next, becameSticker: prev < 3 && next >= 3 };
  }

  rollChestReward(tier = 'bronze') {
    const ranges = {
      bronze: { minCoins: 45, maxCoins: 75, xp: 35, bonusChance: 0.45 },
      silver: { minCoins: 90, maxCoins: 145, xp: 65, bonusChance: 0.78 },
      gold: { minCoins: 180, maxCoins: 260, xp: 120, bonusChance: 1.0 }
    };
    const cfg = ranges[tier] || ranges.bronze;
    const coins = cfg.minCoins + Math.floor(Math.random() * (cfg.maxCoins - cfg.minCoins + 1));

    let sticker = null;
    let upgrade = null;
    let bossCar = null;

    if (Math.random() < cfg.bonusChance) {
      // Collect locked upgrades and unowned stickers (preferring unlocked worlds first)
      const lockedUpgrades = [];
      for (const [cat, items] of Object.entries(UPGRADE_CATALOG)) {
        for (const item of items) {
          if (!this.isUpgradeUnlocked(cat, item.id)) {
            lockedUpgrades.push({ category: cat, item });
          }
        }
      }

      const lockedStickers = WORDS.filter((w) => (this.data.wordScores[w.id] || 0) < 3);
      const unlockedWorldStickers = lockedStickers.filter((w) => this.isWorldUnlocked(w.world));
      const stickerPool = unlockedWorldStickers.length ? unlockedWorldStickers : lockedStickers;

      if (tier === 'gold') {
        const lockedBoss = SKINS.find((s) => s.bossReward && !this.isSkinUnlocked(s.id));
        if (lockedBoss && Math.random() < 0.35) {
          this.data.unlockedSkins.push(lockedBoss.id);
          bossCar = lockedBoss;
        }
      }

      if (!bossCar) {
        const pickUpgrade = lockedUpgrades.length > 0 && (stickerPool.length === 0 || Math.random() < 0.48);
        if (pickUpgrade) {
          const picked = lockedUpgrades[Math.floor(Math.random() * lockedUpgrades.length)];
          if (!this.data.unlockedUpgrades[picked.category]) this.data.unlockedUpgrades[picked.category] = [];
          this.data.unlockedUpgrades[picked.category].push(picked.item.id);
          upgrade = picked;
        } else if (stickerPool.length > 0) {
          const w = stickerPool[Math.floor(Math.random() * stickerPool.length)];
          this.data.wordScores[w.id] = 3;
          sticker = w;
        }
      }
    }

    this.data.coins += coins;
    this.data.chestsOpened = (this.data.chestsOpened || 0) + 1;
    const levelResult = this.addXp(cfg.xp);
    this._save();

    return {
      opened: true,
      tier,
      coins,
      xp: cfg.xp,
      sticker,
      upgrade,
      bossCar,
      levelResult
    };
  }

  recordRunResult({ worldId, step = 'race', stars, missedIds, beatBoss = false }) {
    if (!this.data.worldSteps[worldId]) {
      this.data.worldSteps[worldId] = { listen: 0, reading: 0, race: 0 };
    }
    const prevStepStars = this.data.worldSteps[worldId][step] || 0;
    if (stars > prevStepStars) {
      this.data.worldSteps[worldId][step] = stars;
    }

    if (step === 'race') {
      const prevStars = this.getStars(worldId);
      if (stars > prevStars) {
        this.data.worldStars[worldId] = stars;
      }
    }
    if (beatBoss) {
      this.data.bossBeaten[worldId] = true;
      this.data.worldStars[worldId] = 3;
      this.data.worldSteps[worldId].race = 3;
    }
    if (Array.isArray(missedIds)) {
      this.data.lastMissed[worldId] = missedIds.slice();
    }
    const newBossCars = this.checkBossCarUnlocks();
    this._save();
    return { newBossCars };
  }

  getLastMissed(worldId) {
    return this.data.lastMissed[worldId] || [];
  }

  reset() {
    this.todayOverride = null;
    this.data = createDefaultData();
    this._save();
  }
}
