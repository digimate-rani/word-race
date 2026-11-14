// DOM rendering and UI interaction controller for all 9 game screens.

import { WORLDS } from './words.js';
import { SKINS } from './progress.js';
import { drawCartoonCar } from './race.js';

export class UIController {
  constructor({ progress, audio, handlers }) {
    this.progress = progress;
    this.audio = audio;
    this.handlers = handlers;

    this.currentScreen = 'title';
    this.selectedWorldId = 1;
    this.previewSkinId = progress.getSelectedSkin().id;
    this.previewTime = 0;
    this.titleCarRaf = null;
    this.garageCarRaf = null;
    this.confirmResetOpen = false;

    this._cacheElements();
    this._bindStaticEvents();
  }

  _cacheElements() {
    this.screens = {
      title: document.getElementById('screen-title'),
      map: document.getElementById('screen-map'),
      mode: document.getElementById('screen-mode'),
      countdown: document.getElementById('screen-countdown'),
      race: document.getElementById('screen-race'),
      pause: document.getElementById('screen-pause'),
      results: document.getElementById('screen-results'),
      garage: document.getElementById('screen-garage'),
      settings: document.getElementById('screen-settings')
    };

    this.titleCanvas = document.getElementById('title-car-canvas');
    this.garageCanvas = document.getElementById('garage-car-canvas');

    this.mapNodesEl = document.getElementById('world-map-nodes');
    this.mapCoinsEl = document.getElementById('map-coins');
    this.titleCoinsEl = document.getElementById('title-coins');

    this.modeWorldBadgeEl = document.getElementById('mode-world-badge');
    this.modeCardsEl = document.getElementById('mode-cards');

    this.countdownNumberEl = document.getElementById('countdown-number');

    this.hudCoinsEl = document.getElementById('hud-coins');
    this.hudComboEl = document.getElementById('hud-combo');
    this.hudProgressFillEl = document.getElementById('hud-progress-fill');
    this.hudProgressCarEl = document.getElementById('hud-progress-car');
    this.promptCardEl = document.getElementById('prompt-card');

    this.resTitleEl = document.getElementById('results-title');
    this.resStarsEl = document.getElementById('results-stars');
    this.resCoinsEl = document.getElementById('results-coins');
    this.resScoreEl = document.getElementById('results-score');
    this.resUnlockEl = document.getElementById('results-unlock');
    this.resWordsEl = document.getElementById('results-words');

    this.garageCoinsEl = document.getElementById('garage-coins');
    this.garageSkinNameEl = document.getElementById('garage-skin-name');
    this.garageGridEl = document.getElementById('garage-grid');

    this.toggleSoundEl = document.getElementById('setting-sound');
    this.toggleMusicEl = document.getElementById('setting-music');
    this.speedNormalEl = document.getElementById('setting-speed-normal');
    this.speedSlowEl = document.getElementById('setting-speed-slow');
    this.resetModalEl = document.getElementById('reset-confirm-modal');
  }

  _bindStaticEvents() {
    const clickSfx = () => {
      this.audio.unlock();
      this.audio.playSfx('click');
    };

    document.getElementById('btn-play').addEventListener('click', () => {
      clickSfx();
      this.handlers.onOpenMap();
    });
    document.getElementById('btn-garage').addEventListener('click', () => {
      clickSfx();
      this.handlers.onOpenGarage();
    });
    document.getElementById('btn-settings').addEventListener('click', () => {
      clickSfx();
      this.handlers.onOpenSettings();
    });

    document.getElementById('btn-map-back').addEventListener('click', () => {
      clickSfx();
      this.handlers.onOpenTitle();
    });
    document.getElementById('btn-map-garage').addEventListener('click', () => {
      clickSfx();
      this.handlers.onOpenGarage();
    });

    document.getElementById('btn-mode-back').addEventListener('click', () => {
      clickSfx();
      this.handlers.onOpenMap();
    });

    document.getElementById('btn-pause').addEventListener('click', () => {
      clickSfx();
      this.handlers.onPause();
    });
    document.getElementById('btn-resume').addEventListener('click', () => {
      clickSfx();
      this.handlers.onResume();
    });
    document.getElementById('btn-restart').addEventListener('click', () => {
      clickSfx();
      this.handlers.onRestart();
    });
    document.getElementById('btn-pause-map').addEventListener('click', () => {
      clickSfx();
      this.handlers.onQuitToMap();
    });

    document.getElementById('btn-race-again').addEventListener('click', () => {
      clickSfx();
      this.handlers.onRestart();
    });
    document.getElementById('btn-results-map').addEventListener('click', () => {
      clickSfx();
      this.handlers.onOpenMap();
    });

    document.getElementById('btn-garage-back').addEventListener('click', () => {
      clickSfx();
      this.handlers.onBackFromGarage();
    });
    document.getElementById('btn-settings-back').addEventListener('click', () => {
      clickSfx();
      this.handlers.onOpenTitle();
    });

    // Touch / pointer steering buttons
    const btnLeft = document.getElementById('btn-steer-left');
    const btnRight = document.getElementById('btn-steer-right');
    btnLeft.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.audio.unlock();
      this.handlers.onSteerDelta(-1);
    });
    btnRight.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.audio.unlock();
      this.handlers.onSteerDelta(1);
    });

    // Prompt card click (replays word in listen mode)
    this.promptCardEl.addEventListener('click', () => {
      this.audio.unlock();
      this.handlers.onPromptTap();
    });

    // Settings controls
    this.toggleSoundEl.addEventListener('click', () => {
      this.audio.unlock();
      const next = !this.progress.settings.sound;
      this.progress.setSetting('sound', next);
      this.audio.syncSettings(this.progress.settings);
      if (next) this.audio.playSfx('click');
      this.renderSettings();
    });

    this.toggleMusicEl.addEventListener('click', () => {
      this.audio.unlock();
      const next = !this.progress.settings.music;
      this.progress.setSetting('music', next);
      this.audio.syncSettings(this.progress.settings);
      this.audio.playSfx('click');
      this.renderSettings();
    });

    this.speedNormalEl.addEventListener('click', () => {
      clickSfx();
      this.progress.setSetting('voiceSpeed', 'normal');
      this.audio.syncSettings(this.progress.settings);
      this.audio.speak('ready');
      this.renderSettings();
    });

    this.speedSlowEl.addEventListener('click', () => {
      clickSfx();
      this.progress.setSetting('voiceSpeed', 'slow');
      this.audio.syncSettings(this.progress.settings);
      this.audio.speak('ready');
      this.renderSettings();
    });

    document.getElementById('btn-reset-progress').addEventListener('click', () => {
      clickSfx();
      this.confirmResetOpen = true;
      this.resetModalEl.classList.remove('hidden');
    });

    document.getElementById('btn-reset-cancel').addEventListener('click', () => {
      clickSfx();
      this.confirmResetOpen = false;
      this.resetModalEl.classList.add('hidden');
    });

    document.getElementById('btn-reset-confirm').addEventListener('click', () => {
      clickSfx();
      this.progress.reset();
      this.previewSkinId = this.progress.getSelectedSkin().id;
      this.audio.syncSettings(this.progress.settings);
      this.confirmResetOpen = false;
      this.resetModalEl.classList.add('hidden');
      this.renderSettings();
      this.updateTitleSummary();
    });
  }

  showScreen(name) {
    this.currentScreen = name;
    const overlayRace = name === 'countdown' || name === 'pause';

    for (const [key, el] of Object.entries(this.screens)) {
      if (!el) continue;
      if (key === name || (overlayRace && key === 'race')) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    }

    if (name === 'title') {
      this.updateTitleSummary();
      this._startTitlePreview();
    } else {
      this._stopTitlePreview();
    }

    if (name === 'garage') {
      this.previewSkinId = this.progress.getSelectedSkin().id;
      this.renderGarage();
      this._startGaragePreview();
    } else {
      this._stopGaragePreview();
    }

    if (name === 'map') {
      this.renderWorldMap();
    } else if (name === 'settings') {
      this.renderSettings();
    }
  }

  updateTitleSummary() {
    if (this.titleCoinsEl) {
      this.titleCoinsEl.textContent = String(this.progress.coins);
    }
  }

  _startTitlePreview() {
    if (this.titleCarRaf) return;
    const loop = (ts) => {
      if (this.currentScreen !== 'title') {
        this.titleCarRaf = null;
        return;
      }
      this._drawCarStage(this.titleCanvas, this.progress.getSelectedSkin(), ts * 0.001, true);
      this.titleCarRaf = requestAnimationFrame(loop);
    };
    this.titleCarRaf = requestAnimationFrame(loop);
  }

  _stopTitlePreview() {
    if (this.titleCarRaf) {
      cancelAnimationFrame(this.titleCarRaf);
      this.titleCarRaf = null;
    }
  }

  _startGaragePreview() {
    if (this.garageCarRaf) return;
    const loop = (ts) => {
      if (this.currentScreen !== 'garage') {
        this.garageCarRaf = null;
        return;
      }
      const skin = SKINS.find((s) => s.id === this.previewSkinId) || this.progress.getSelectedSkin();
      this._drawCarStage(this.garageCanvas, skin, ts * 0.001, false);
      this.garageCarRaf = requestAnimationFrame(loop);
    };
    this.garageCarRaf = requestAnimationFrame(loop);
  }

  _stopGaragePreview() {
    if (this.garageCarRaf) {
      cancelAnimationFrame(this.garageCarRaf);
      this.garageCarRaf = null;
    }
  }

  _drawCarStage(canvas, skin, t, isTitle) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Road stripe pedestal
    ctx.save();
    ctx.fillStyle = isTitle ? 'rgba(15, 23, 42, 0.25)' : 'rgba(255, 255, 255, 0.14)';
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.74, w * 0.34, h * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const roll = isTitle ? Math.sin(t * 2.2) * 0.04 : Math.sin(t * 2.5) * 0.12;
    const bounce = Math.sin(t * 7) * 3.5;
    drawCartoonCar(ctx, w * 0.5, h * 0.56, isTitle ? 1.2 : 1.35, skin, {
      roll,
      bounce,
      boosted: isTitle ? Math.sin(t * 1.5) > 0.35 : false,
      time: t
    });
  }

  renderWorldMap() {
    this.mapCoinsEl.textContent = String(this.progress.coins);
    this.mapNodesEl.innerHTML = '';

    WORLDS.forEach((world, idx) => {
      const unlocked = this.progress.isWorldUnlocked(world.id);
      const stars = this.progress.getStars(world.id);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `world-node ${unlocked ? 'unlocked' : 'locked'}`;
      btn.dataset.worldId = String(world.id);
      btn.style.setProperty('--node-accent', world.accent);
      btn.style.setProperty('--node-bg', world.badgeBg);
      btn.style.setProperty('--stagger', idx % 2 === 0 ? '0' : '1');
      if (!unlocked) {
        btn.setAttribute('aria-disabled', 'true');
      }

      const starsHtml = [1, 2, 3]
        .map((n) => `<span class="star ${n <= stars ? 'filled' : ''}">★</span>`)
        .join('');

      btn.innerHTML = `
        <div class="world-num">${world.id}</div>
        <div class="world-emoji">${unlocked ? world.icon : '🔒'}</div>
        <div class="world-info">
          <div class="world-name-he">${world.nameHe}</div>
          <div class="world-stars">${unlocked ? starsHtml : '<span class="lock-hint">נדרשים 2 כוכבים</span>'}</div>
        </div>
      `;

      btn.addEventListener('click', () => {
        this.audio.unlock();
        if (!unlocked) {
          this.audio.playSfx('wrong');
          btn.classList.remove('shake');
          void btn.offsetWidth;
          btn.classList.add('shake');
          return;
        }
        this.audio.playSfx('click');
        this.selectedWorldId = world.id;
        this.renderModePicker(world.id);
        this.handlers.onSelectWorld(world.id);
      });

      this.mapNodesEl.appendChild(btn);
    });
  }

  renderModePicker(worldId) {
    const world = WORLDS.find((w) => w.id === Number(worldId)) || WORLDS[0];
    const stars = this.progress.getStars(world.id);
    const starsHtml = [1, 2, 3]
      .map((n) => `<span class="star ${n <= stars ? 'filled' : ''}">★</span>`)
      .join('');

    this.modeWorldBadgeEl.innerHTML = `
      <span class="mode-world-icon">${world.icon}</span>
      <span class="mode-world-name">${world.nameHe}</span>
      <span class="mode-world-stars">${starsHtml}</span>
    `;

    const lastMode = this.progress.lastMode;
    const modes = [
      {
        id: 'picture',
        label: 'תמונה',
        sub: 'ראו את התמונה וסעו לשער',
        iconHtml: '<span class="mode-big-emoji">👁️</span>'
      },
      {
        id: 'listen',
        label: 'האזנה',
        sub: 'הקשיבו למילה באנגלית',
        iconHtml: '<span class="mode-big-emoji">👂</span>'
      },
      {
        id: 'hebrew',
        label: 'עברית',
        sub: 'קראו את המילה בעברית',
        iconHtml: '<span class="mode-hebrew-letter">א</span>'
      }
    ];

    this.modeCardsEl.innerHTML = '';
    modes.forEach((m) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = `mode-card mode-${m.id} ${m.id === lastMode ? 'is-last' : ''}`;
      card.dataset.mode = m.id;
      card.innerHTML = `
        ${m.id === lastMode ? '<span class="mode-recent-tag">אחרון</span>' : ''}
        <div class="mode-icon-wrap">${m.iconHtml}</div>
        <div class="mode-title">${m.label}</div>
        <div class="mode-sub">${m.sub}</div>
      `;
      card.addEventListener('click', () => {
        this.audio.unlock();
        this.audio.playSfx('click');
        this.progress.setLastMode(m.id);
        this.handlers.onStartRace(world.id, m.id);
      });
      this.modeCardsEl.appendChild(card);
    });
  }

  setCountdownText(label) {
    if (!this.countdownNumberEl) return;
    this.countdownNumberEl.textContent = label;
    this.countdownNumberEl.classList.remove('pop');
    void this.countdownNumberEl.offsetWidth;
    this.countdownNumberEl.classList.add('pop');
  }

  updateRaceHud({ coins, combo, progress }) {
    this.hudCoinsEl.textContent = String(coins);

    const mult = combo >= 6 ? 3 : combo >= 3 ? 2 : 1;
    this.hudComboEl.textContent = combo >= 2 ? `🔥 x${mult} (${combo})` : `x${mult}`;
    this.hudComboEl.classList.toggle('hot', mult >= 2);
    this.hudComboEl.classList.toggle('blazing', mult >= 3);

    const pct = Math.round(Math.max(0, Math.min(1, progress)) * 100);
    this.hudProgressFillEl.style.width = `${pct}%`;
    this.hudProgressCarEl.style.left = `calc(${pct}% - 14px)`;
  }

  renderPromptCard(gate, mode) {
    if (!gate) {
      this.promptCardEl.classList.add('hidden');
      return;
    }
    this.promptCardEl.classList.remove('hidden');
    this.promptCardEl.classList.remove('mode-picture', 'mode-listen', 'mode-hebrew');
    this.promptCardEl.classList.add(`mode-${mode}`);

    if (mode === 'picture') {
      this.promptCardEl.innerHTML = `
        <div class="prompt-emoji" aria-label="picture prompt">${gate.target.emoji}</div>
      `;
    } else if (mode === 'listen') {
      this.promptCardEl.innerHTML = `
        <div class="prompt-speaker" aria-label="listen prompt">
          <span class="speaker-icon">🔊</span>
          <span class="speaker-hint">הקשיבו - לחצו לשמיעה חוזרת</span>
        </div>
      `;
    } else {
      this.promptCardEl.innerHTML = `
        <div class="prompt-hebrew" dir="rtl">${gate.target.he}</div>
      `;
    }

    this.promptCardEl.classList.remove('pop-in');
    void this.promptCardEl.offsetWidth;
    this.promptCardEl.classList.add('pop-in');
  }

  renderResults({ stars, coinsEarned, correct, total, wordResults, newlyUnlockedWorld }) {
    const titles = {
      1: 'סיימתם את המרוץ!',
      2: 'כל הכבוד!',
      3: 'אלופים אמיתיים!'
    };
    this.resTitleEl.textContent = titles[stars] || titles[1];
    this.resScoreEl.textContent = `${correct} / ${total} נכונות`;

    // Animated stars
    this.resStarsEl.innerHTML = '';
    for (let i = 1; i <= 3; i++) {
      const span = document.createElement('span');
      span.className = `result-star ${i <= stars ? 'earned' : 'empty'}`;
      span.style.animationDelay = `${(i - 1) * 0.22}s`;
      span.textContent = '★';
      this.resStarsEl.appendChild(span);
    }

    // Count-up coins
    this.resCoinsEl.textContent = String(coinsEarned);
    if (coinsEarned > 0) {
      let current = 0;
      const stepVal = Math.max(1, Math.ceil(coinsEarned / 20));
      const timer = setInterval(() => {
        current = Math.min(coinsEarned, current + stepVal);
        this.resCoinsEl.textContent = String(current);
        if (current >= coinsEarned) clearInterval(timer);
      }, 28);
    }

    if (newlyUnlockedWorld) {
      this.resUnlockEl.textContent = `נפתח עולם חדש: ${newlyUnlockedWorld.nameHe} ${newlyUnlockedWorld.icon}`;
      this.resUnlockEl.classList.remove('hidden');
    } else {
      this.resUnlockEl.classList.add('hidden');
    }

    this.resWordsEl.innerHTML = '';
    wordResults.forEach((item) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `result-word-chip ${item.correct ? 'ok' : 'missed'}`;
      btn.innerHTML = `
        <span class="rw-emoji">${item.word.emoji}</span>
        <span class="rw-en" dir="ltr">${item.word.en}</span>
        <span class="rw-audio">🔊</span>
        ${item.correct ? '' : '<span class="rw-practice">לתרגול</span>'}
      `;
      btn.addEventListener('click', () => {
        this.audio.unlock();
        this.audio.speak(item.word.en);
      });
      this.resWordsEl.appendChild(btn);
    });
  }

  renderGarage() {
    this.garageCoinsEl.textContent = String(this.progress.coins);
    const activeSkin = this.progress.getSelectedSkin();
    const previewSkin = SKINS.find((s) => s.id === this.previewSkinId) || activeSkin;
    this.garageSkinNameEl.textContent = previewSkin.nameHe;

    this.garageGridEl.innerHTML = '';
    SKINS.forEach((skin) => {
      const unlocked = this.progress.isSkinUnlocked(skin.id);
      const selected = activeSkin.id === skin.id;
      const canAfford = this.progress.coins >= skin.price;

      const card = document.createElement('button');
      card.type = 'button';
      card.className = `skin-card ${selected ? 'selected' : ''} ${unlocked ? 'unlocked' : 'locked'}`;

      let statusText = '';
      if (selected) {
        statusText = '<span class="skin-badge equipped">נבחר ✓</span>';
      } else if (unlocked) {
        statusText = '<span class="skin-badge owned">בחר</span>';
      } else {
        statusText = `<span class="skin-badge price ${canAfford ? 'affordable' : 'expensive'}">🪙 ${skin.price}</span>`;
      }

      card.innerHTML = `
        <div class="skin-swatch" style="background: linear-gradient(135deg, ${skin.bodyColor} 60%, ${skin.accentColor} 100%)">
          <span class="skin-car-emoji">🏎️</span>
        </div>
        <div class="skin-name">${skin.nameHe}</div>
        ${statusText}
      `;

      card.addEventListener('click', () => {
        this.audio.unlock();
        this.previewSkinId = skin.id;
        if (unlocked) {
          this.progress.selectSkin(skin.id);
          this.audio.playSfx('click');
        } else if (canAfford) {
          this.progress.buySkin(skin.id);
          this.audio.playSfx('unlock');
        } else {
          this.audio.playSfx('wrong');
          card.classList.remove('shake');
          void card.offsetWidth;
          card.classList.add('shake');
        }
        this.renderGarage();
      });

      this.garageGridEl.appendChild(card);
    });
  }

  renderSettings() {
    const s = this.progress.settings;
    this.toggleSoundEl.textContent = s.sound ? 'מופעל' : 'כבוי';
    this.toggleSoundEl.classList.toggle('is-on', !!s.sound);

    this.toggleMusicEl.textContent = s.music ? 'מופעל' : 'כבוי';
    this.toggleMusicEl.classList.toggle('is-on', !!s.music);

    this.speedNormalEl.classList.toggle('active', s.voiceSpeed !== 'slow');
    this.speedSlowEl.classList.toggle('active', s.voiceSpeed === 'slow');
  }
}
