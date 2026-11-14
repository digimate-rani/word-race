// Phase B Rewards UI: Title Streak/Level HUD, Treasure Chest opening, New Sticker Fly-In reveal,
// Garage 2.0 (12 skins + 3 boss cars + 4 upgrade categories), Sticker Album, Daily Gift & Level-Up modals.

import { LEVELS, getWorldsByLevel, getWordsByWorld } from '../../js/words.js';
import { SKINS, UPGRADE_CATALOG, DAILY_GIFTS } from './progress.js';

export class RewardsUIController {
  constructor({ progress, audio, handlers }) {
    this.progress = progress;
    this.audio = audio;
    this.handlers = handlers;

    this.garageTab = 'skins'; // 'skins' | 'paint' | 'wheels' | 'spoiler' | 'trail'
    this.albumLevel = 'all'; // 'all' | 1 | 2 | 3

    this._cacheElements();
    this._bindEvents();
  }

  _cacheElements() {
    this.titleStreakCountEl = document.getElementById('title-streak-count');
    this.titleDriverLvlEl = document.getElementById('title-driver-lvl');
    this.titleDriverXpFillEl = document.getElementById('title-driver-xp-fill');
    this.titleStickerCountEl = document.getElementById('title-sticker-count');

    this.resLevelBarEl = document.getElementById('results-level-bar');
    this.resChestBoxEl = document.getElementById('results-chest-box');
    this.resStickersEl = document.getElementById('results-stickers-reveal');

    this.garageCoinsEl = document.getElementById('garage-coins');
    this.garageCarLabelEl = document.getElementById('garage-car-label');
    this.garageTabsEl = document.getElementById('garage-tabs');
    this.garageGridEl = document.getElementById('garage-items-grid');
    this.garageTouchEl = document.getElementById('garage-stage-touch');

    this.albumCounterEl = document.getElementById('album-counter');
    this.albumTabsEl = document.getElementById('album-level-tabs');
    this.albumGroupsEl = document.getElementById('album-groups');

    this.dailyModalEl = document.getElementById('daily-gift-modal');
    this.dailyTitleEl = document.getElementById('daily-gift-title');
    this.dailyDescEl = document.getElementById('daily-gift-desc');
    this.dailyDaysEl = document.getElementById('daily-gift-days');
    this.btnClaimDailyEl = document.getElementById('btn-claim-daily-gift');

    this.levelupModalEl = document.getElementById('levelup-modal');
    this.levelupBadgeEl = document.getElementById('levelup-badge');
    this.levelupDescEl = document.getElementById('levelup-desc');
  }

  _bindEvents() {
    const clickSfx = () => {
      this.audio.unlock();
      this.audio.playSfx('click');
    };

    document.getElementById('btn-garage').addEventListener('click', () => {
      clickSfx();
      this.handlers.onOpenGarage();
    });
    document.getElementById('btn-album').addEventListener('click', () => {
      clickSfx();
      this.handlers.onOpenAlbum();
    });
    document.getElementById('btn-daily-streak').addEventListener('click', () => {
      clickSfx();
      this.handlers.onOpenDailyModal();
    });

    document.getElementById('btn-garage-back').addEventListener('click', () => {
      clickSfx();
      this.handlers.onBackToTitle();
    });
    document.getElementById('btn-album-back').addEventListener('click', () => {
      clickSfx();
      this.handlers.onBackToTitle();
    });

    this.btnClaimDailyEl.addEventListener('click', () => {
      clickSfx();
      this.handlers.onClaimDailyGift();
    });
    document.getElementById('btn-close-levelup').addEventListener('click', () => {
      clickSfx();
      this.hideLevelUpModal();
    });

    // Drag to spin car on Garage 3D turntable
    if (this.garageTouchEl) {
      let dragX = null;
      this.garageTouchEl.addEventListener('pointerdown', (e) => {
        dragX = e.clientX;
      });
      this.garageTouchEl.addEventListener('pointermove', (e) => {
        if (dragX === null) return;
        const dx = e.clientX - dragX;
        dragX = e.clientX;
        this.handlers.onGarageSpinDelta(dx * 0.012);
      });
      const stopDrag = () => { dragX = null; };
      this.garageTouchEl.addEventListener('pointerup', stopDrag);
      this.garageTouchEl.addEventListener('pointercancel', stopDrag);
    }
  }

  updateTitleBadges() {
    const lvlInfo = this.progress.getLevelInfo();
    const stickers = this.progress.getStickerCount();
    const totalWords = this.progress.getTotalWordCount();

    if (this.titleStreakCountEl) {
      this.titleStreakCountEl.textContent = String(Math.max(1, this.progress.dailyStreak || 1));
    }
    if (this.titleDriverLvlEl) {
      this.titleDriverLvlEl.textContent = String(lvlInfo.level);
    }
    if (this.titleDriverXpFillEl) {
      this.titleDriverXpFillEl.style.width = `${Math.round(lvlInfo.ratio * 100)}%`;
    }
    if (this.titleStickerCountEl) {
      this.titleStickerCountEl.textContent = `${stickers} / ${totalWords}`;
    }
  }

  renderResultsExtras({ pendingChest, newStickers = [], xpGained = 0, newBossCars = [] }) {
    this.renderResultsLevelBar(xpGained);
    this.renderChestBox(pendingChest);
    this.renderNewStickersReveal(newStickers, newBossCars);
  }

  renderResultsLevelBar(xpGained = 0) {
    if (!this.resLevelBarEl) return;
    const info = this.progress.getLevelInfo();
    const pct = Math.round(info.ratio * 100);
    this.resLevelBarEl.innerHTML = `
      <div class="res-lvl-head">
        <span>⭐ נהג רמה <strong dir="ltr">${info.level}</strong></span>
        <span class="res-lvl-xp" dir="ltr">${xpGained > 0 ? `+${xpGained} XP | ` : ''}${info.intoLevel} / ${info.neededForNext} XP</span>
      </div>
      <div class="res-lvl-track" aria-hidden="true">
        <div class="res-lvl-fill" style="width: ${pct}%"></div>
      </div>
    `;
  }

  renderChestBox(chestState) {
    if (!this.resChestBoxEl) return;
    if (!chestState) {
      this.resChestBoxEl.classList.add('hidden');
      this.resChestBoxEl.innerHTML = '';
      return;
    }

    this.resChestBoxEl.classList.remove('hidden', 'is-opened', 'is-waiting');
    const tierNames = {
      bronze: 'תיבת אוצר',
      silver: 'תיבת ניצחון מוכספת!',
      gold: 'תיבת בוס מלכותית!'
    };
    const tierLabel = tierNames[chestState.tier] || tierNames.bronze;

    if (!chestState.opened) {
      this.resChestBoxEl.classList.add('is-waiting');
      this.resChestBoxEl.innerHTML = `
        <button id="btn-open-chest" type="button" class="chest-trigger-btn tier-${chestState.tier}">
          <span class="chest-bounce-icon">🧰</span>
          <div class="chest-btn-text">
            <span class="chest-btn-title">${tierLabel}</span>
            <span class="chest-btn-sub">לחצו לפתיחת התיבה!</span>
          </div>
          <span class="chest-sparkles">✨</span>
        </button>
      `;
      document.getElementById('btn-open-chest').addEventListener('click', () => {
        this.audio.unlock();
        this.handlers.onOpenChest();
      });
      return;
    }

    const r = chestState.reward;
    this.resChestBoxEl.classList.add('is-opened');
    const extras = [];
    if (r.bossCar) {
      extras.push(`<span class="loot-pill loot-boss">👑 מכונית בוס: ${r.bossCar.nameHe}!</span>`);
    }
    if (r.upgrade) {
      extras.push(`<span class="loot-pill loot-part">🔧 שדרוג חדש: ${r.upgrade.item.nameHe}!</span>`);
    }
    if (r.sticker) {
      const pic = r.sticker.emoji || r.sticker.he;
      extras.push(`<span class="loot-pill loot-sticker">📒 מדבקה חדשה: ${pic} <span dir="ltr">${r.sticker.en}</span>!</span>`);
    }

    this.resChestBoxEl.innerHTML = `
      <div class="chest-opened-card tier-${r.tier}">
        <div class="chest-opened-head">
          <span class="chest-open-emoji">🎁</span>
          <span>התיבה נפתחה!</span>
        </div>
        <div class="chest-loot-row">
          <span class="loot-pill loot-coins">🪙 +${r.coins} מטבעות</span>
          <span class="loot-pill loot-xp">⭐ +${r.xp} XP</span>
          ${extras.join('')}
        </div>
      </div>
    `;
  }

  renderNewStickersReveal(newStickers = [], newBossCars = []) {
    if (!this.resStickersEl) return;
    if (!newStickers.length && !newBossCars.length) {
      this.resStickersEl.classList.add('hidden');
      this.resStickersEl.innerHTML = '';
      return;
    }

    this.resStickersEl.classList.remove('hidden');
    const stickerChips = newStickers.map((w, i) => `
      <button type="button" class="sticker-reveal-chip" style="animation-delay: ${i * 0.1}s" data-word-en="${w.en}">
        <span class="sticker-chip-pic">${w.emoji || w.he}</span>
        <span class="sticker-chip-en" dir="ltr">${w.en}</span>
      </button>
    `).join('');

    const bossBanner = newBossCars.map((car) => `
      <div class="boss-car-unlock-banner">👑 מכונית בוס חדשה נפתחה במוסך: <strong>${car.nameHe}</strong>!</div>
    `).join('');

    this.resStickersEl.innerHTML = `
      ${bossBanner}
      ${newStickers.length ? `
        <div class="stickers-reveal-header">
          <span>📒 מדבקות חדשות עפו לאלבום! (${this.progress.getStickerCount()} / ${this.progress.getTotalWordCount()})</span>
          <button id="btn-results-album" type="button" class="btn-mini-album">לאלבום 📒</button>
        </div>
        <div class="stickers-reveal-row">${stickerChips}</div>
      ` : ''}
    `;

    this.resStickersEl.querySelectorAll('.sticker-reveal-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.audio.unlock();
        this.audio.speak(btn.dataset.wordEn);
      });
    });

    const albumShortcut = document.getElementById('btn-results-album');
    if (albumShortcut) {
      albumShortcut.addEventListener('click', () => {
        this.audio.unlock();
        this.audio.playSfx('click');
        this.handlers.onOpenAlbum();
      });
    }
  }

  renderGarage() {
    this.garageCoinsEl.textContent = String(this.progress.coins);
    const activeSkin = this.progress.getSelectedSkin();
    const u = this.progress.data.upgrades || {};
    this.garageCarLabelEl.textContent = `${activeSkin.bossReward ? '👑 ' : ''}${activeSkin.nameHe}`;

    const tabs = [
      { id: 'skins', label: '🏎️ מכוניות' },
      { id: 'paint', label: '🎨 צבע' },
      { id: 'wheels', label: '🛞 גלגלים' },
      { id: 'spoiler', label: '🪶 ספוילר' },
      { id: 'trail', label: '✨ שובל' }
    ];

    this.garageTabsEl.innerHTML = '';
    tabs.forEach((t) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `garage-tab-btn ${this.garageTab === t.id ? 'active' : ''}`;
      btn.textContent = t.label;
      btn.addEventListener('click', () => {
        this.audio.unlock();
        this.audio.playSfx('click');
        this.garageTab = t.id;
        this.renderGarage();
      });
      this.garageTabsEl.appendChild(btn);
    });

    this.garageGridEl.innerHTML = '';

    if (this.garageTab === 'skins') {
      SKINS.forEach((skin) => {
        const unlocked = this.progress.isSkinUnlocked(skin.id);
        const equipped = activeSkin.id === skin.id;
        const canAfford = this.progress.coins >= skin.price;
        const bossHint = skin.bossReward ? `👑 נצחו ${skin.bossReqWins || 1} בוסים` : `🪙 ${skin.price}`;

        const card = document.createElement('button');
        card.type = 'button';
        card.className = `garage-item-card ${equipped ? 'equipped' : unlocked ? 'owned' : 'locked'}`;
        card.innerHTML = `
          <div class="garage-swatch-car" style="--swatch-a:${skin.bodyColor}; --swatch-b:${skin.accentColor};">
            ${skin.bossReward ? '👑' : '🏎️'}
          </div>
          <div class="garage-item-name">${skin.nameHe}</div>
          <div class="garage-item-status ${!unlocked && !skin.bossReward && !canAfford ? 'cant-afford' : ''}">
            ${equipped ? '✅ בשימוש' : unlocked ? 'בחרו' : bossHint}
          </div>
        `;
        card.addEventListener('click', () => {
          this.audio.unlock();
          const res = this.progress.buyOrSelectSkin(skin.id);
          if (!res.ok) {
            this.audio.playSfx('wrong');
            card.classList.remove('shake');
            void card.offsetWidth;
            card.classList.add('shake');
            return;
          }
          this.audio.playSfx(res.action === 'bought' ? 'confetti' : 'click');
          this.renderGarage();
          this.handlers.onGarageRefresh3D();
        });
        this.garageGridEl.appendChild(card);
      });
      return;
    }

    const cat = this.garageTab;
    const list = UPGRADE_CATALOG[cat] || [];
    const currentId = u[cat];

    list.forEach((item) => {
      const unlocked = this.progress.isUpgradeUnlocked(cat, item.id);
      const equipped = currentId === item.id;
      const canAfford = this.progress.coins >= item.price;

      const previewHtml = cat === 'paint'
        ? `<div class="garage-paint-dot" style="background:${item.swatch || activeSkin.bodyColor};"></div>`
        : `<div class="garage-part-icon" style="${item.color ? `text-shadow: 0 0 12px ${item.color}` : ''}">${item.icon}</div>`;

      const card = document.createElement('button');
      card.type = 'button';
      card.className = `garage-item-card ${equipped ? 'equipped' : unlocked ? 'owned' : 'locked'}`;
      card.innerHTML = `
        ${previewHtml}
        <div class="garage-item-name">${item.nameHe}</div>
        <div class="garage-item-status ${!unlocked && !canAfford ? 'cant-afford' : ''}">
          ${equipped ? '✅ מורכב' : unlocked ? 'הרכיבו' : `🪙 ${item.price}`}
        </div>
      `;
      card.addEventListener('click', () => {
        this.audio.unlock();
        const res = this.progress.buyOrEquipUpgrade(cat, item.id);
        if (!res.ok) {
          this.audio.playSfx('wrong');
          card.classList.remove('shake');
          void card.offsetWidth;
          card.classList.add('shake');
          return;
        }
        this.audio.playSfx(res.action === 'bought' ? 'confetti' : 'click');
        this.renderGarage();
        this.handlers.onGarageRefresh3D();
      });
      this.garageGridEl.appendChild(card);
    });
  }

  renderAlbum() {
    const count = this.progress.getStickerCount();
    const total = this.progress.getTotalWordCount();
    this.albumCounterEl.textContent = `${count} / ${total}`;

    const filterTabs = [
      { id: 'all', label: 'הכל' },
      ...LEVELS.map((l) => ({ id: l.id, label: `${l.icon} רמה ${l.id}` }))
    ];

    this.albumTabsEl.innerHTML = '';
    filterTabs.forEach((t) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `level-tab ${this.albumLevel === t.id ? 'active' : 'unlocked'}`;
      btn.textContent = t.label;
      btn.addEventListener('click', () => {
        this.audio.unlock();
        this.audio.playSfx('click');
        this.albumLevel = t.id;
        this.renderAlbum();
      });
      this.albumTabsEl.appendChild(btn);
    });

    const targetLevels = this.albumLevel === 'all'
      ? LEVELS
      : LEVELS.filter((l) => l.id === this.albumLevel);

    this.albumGroupsEl.innerHTML = '';
    targetLevels.forEach((lvl) => {
      const worlds = getWorldsByLevel(lvl.id);
      worlds.forEach((world) => {
        const words = getWordsByWorld(world.id);
        const earnedInWorld = words.filter((w) => (this.progress.data.wordScores[w.id] || 0) >= 3).length;

        const section = document.createElement('div');
        section.className = 'album-world-group';
        section.style.setProperty('--world-accent', world.accent);
        section.innerHTML = `
          <div class="album-world-head">
            <span>${world.icon} עולם ${world.id}: ${world.nameHe}</span>
            <span class="album-world-count" dir="ltr">${earnedInWorld} / ${words.length}</span>
          </div>
        `;

        const grid = document.createElement('div');
        grid.className = 'album-stickers-grid';
        words.forEach((w) => {
          const score = this.progress.data.wordScores[w.id] || 0;
          const earned = score >= 3;
          const card = document.createElement('button');
          card.type = 'button';
          card.className = `sticker-card ${earned ? 'unlocked' : 'locked'}`;
          card.innerHTML = earned
            ? `
              <div class="sticker-pic ${w.emoji ? '' : 'is-he'}">${w.emoji || w.he}</div>
              <div class="sticker-en" dir="ltr">${w.en}</div>
              <div class="sticker-he">${w.he}</div>
            `
            : `
              <div class="sticker-pic locked-pic">${w.emoji ? '❓' : '🔒'}</div>
              <div class="sticker-en" dir="ltr">???</div>
              <div class="sticker-prog" dir="ltr">${score}/3</div>
            `;
          card.addEventListener('click', () => {
            this.audio.unlock();
            if (earned) {
              this.audio.speak(w.en);
              card.classList.remove('pop-bounce');
              void card.offsetWidth;
              card.classList.add('pop-bounce');
            } else {
              this.audio.playSfx('click');
            }
          });
          grid.appendChild(card);
        });

        section.appendChild(grid);
        this.albumGroupsEl.appendChild(section);
      });
    });
  }

  showDailyGiftModal(streakInfo) {
    if (!this.dailyModalEl || !streakInfo) return;
    const { dailyStreak, daySlot, alreadyClaimed } = streakInfo;
    this.dailyTitleEl.textContent = alreadyClaimed
      ? `🔥 רצף של ${dailyStreak} ימים!`
      : `🎁 מתנת יום ${daySlot}! (רצף ${dailyStreak})`;

    this.dailyDescEl.textContent = alreadyClaimed
      ? 'כבר אספתם את המתנה של היום - חזרו מחר להמשיך את הרצף!'
      : `שיחקתם ${dailyStreak} ימים ברצף! קבלו +${streakInfo.gift.coins} מטבעות ו-+${streakInfo.gift.xp} XP!`;

    this.dailyDaysEl.innerHTML = DAILY_GIFTS.map((g) => {
      const passed = g.day < daySlot || (g.day === daySlot && alreadyClaimed);
      const isToday = g.day === daySlot && !alreadyClaimed;
      return `
        <div class="daily-day-chip ${isToday ? 'is-today' : passed ? 'is-passed' : ''}">
          <div class="day-num">יום ${g.day}</div>
          <div class="day-reward">🪙${g.coins}</div>
        </div>
      `;
    }).join('');

    this.btnClaimDailyEl.textContent = alreadyClaimed ? 'סגור ▶' : 'אספו מתנה! 🎁';
    this.dailyModalEl.classList.remove('hidden');
  }

  hideDailyGiftModal() {
    if (this.dailyModalEl) this.dailyModalEl.classList.add('hidden');
  }

  showLevelUpModal(newLevel) {
    if (!this.levelupModalEl) return;
    this.levelupBadgeEl.textContent = String(newLevel);
    this.levelupModalEl.classList.remove('hidden');
  }

  hideLevelUpModal() {
    if (this.levelupModalEl) this.levelupModalEl.classList.add('hidden');
  }
}
