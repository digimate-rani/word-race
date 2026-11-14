// DOM rendering and UI interaction controller for Word Race v3 Phase A screens.

import { LEVELS, getLevelById, getWorldById, getWorldsByLevel } from '../../js/words.js';
import { getPowerupMeta } from './pickups.js';

export class UIController {
  constructor({ progress, audio, handlers }) {
    this.progress = progress;
    this.audio = audio;
    this.handlers = handlers;

    this.currentScreen = 'title';
    this.selectedLevel = progress.getHighestUnlockedLevel();
    this.selectedWorldId = 1;
    this.bossModeSelected = false;
    this.confirmResetOpen = false;

    this.calloutTimer = null;
    this.toastTimer = null;

    this._cacheElements();
    this._bindStaticEvents();
  }

  _cacheElements() {
    this.screens = {
      title: document.getElementById('screen-title'),
      map: document.getElementById('screen-map'),
      mode: document.getElementById('screen-mode'),
      reading: document.getElementById('screen-reading'),
      garage: document.getElementById('screen-garage'),
      album: document.getElementById('screen-album'),
      countdown: document.getElementById('screen-countdown'),
      race: document.getElementById('screen-race'),
      pause: document.getElementById('screen-pause'),
      results: document.getElementById('screen-results'),
      settings: document.getElementById('screen-settings')
    };

    this.fxOverlayEl = document.getElementById('fx-overlay');
    this.titleCoinsEl = document.getElementById('title-coins');

    this.mapLevelTabsEl = document.getElementById('map-level-tabs');
    this.mapLevelBannerEl = document.getElementById('map-level-banner');
    this.mapRoadSvgEl = document.getElementById('map-road-svg');
    this.mapNodesEl = document.getElementById('world-map-nodes');
    this.mapCoinsEl = document.getElementById('map-coins');

    this.modeWorldBadgeEl = document.getElementById('mode-world-badge');
    this.modeCardsEl = document.getElementById('mode-cards');
    this.btnToggleBossEl = document.getElementById('btn-toggle-boss');
    this.bossToggleStateEl = document.getElementById('boss-toggle-state');

    this.countdownRivalTagEl = document.getElementById('countdown-rival-tag');
    this.countdownNumberEl = document.getElementById('countdown-number');

    this.hudCoinsEl = document.getElementById('hud-coins');
    this.hudComboEl = document.getElementById('hud-combo');
    this.hudPosEl = document.getElementById('hud-position');
    this.hudPosIconEl = document.getElementById('hud-pos-icon');
    this.hudPosTextEl = document.getElementById('hud-pos-text');
    this.hudProgressFillEl = document.getElementById('hud-progress-fill');
    this.hudProgressCarEl = document.getElementById('hud-progress-car');
    this.hudProgressRivalEl = document.getElementById('hud-progress-rival');
    this.promptCardEl = document.getElementById('prompt-card');

    this.hudPowerupEl = document.getElementById('hud-powerup');
    this.hudPowerupIconEl = document.getElementById('hud-powerup-icon');
    this.hudPowerupNameEl = document.getElementById('hud-powerup-name');
    this.hudPowerupBarEl = document.getElementById('hud-powerup-bar');

    this.btnNitroEl = document.getElementById('btn-nitro');
    this.nitroFillEl = document.getElementById('nitro-fill');
    this.nitroPctEl = document.getElementById('nitro-pct');

    this.calloutEl = document.getElementById('race-callout');
    this.feedbackToastEl = document.getElementById('race-feedback-toast');

    this.resPosBannerEl = document.getElementById('results-position-banner');
    this.resTitleEl = document.getElementById('results-title');
    this.resStarsEl = document.getElementById('results-stars');
    this.resCoinsEl = document.getElementById('results-coins');
    this.resScoreEl = document.getElementById('results-score');
    this.resComboEl = document.getElementById('results-combo');
    this.resUnlockEl = document.getElementById('results-unlock');
    this.resWordsEl = document.getElementById('results-words');
    this.btnNextStepEl = document.getElementById('btn-next-step');

    this.readingWorldBadgeEl = document.getElementById('reading-world-badge');
    this.readingCoinsEl = document.getElementById('reading-coins');
    this.readingDotsEl = document.getElementById('reading-dots');
    this.readingCounterEl = document.getElementById('reading-counter');
    this.readingCardEl = document.getElementById('reading-card');
    this.readingInstructionEl = document.getElementById('reading-instruction');
    this.readingPromptBoxEl = document.getElementById('reading-prompt-box');
    this.btnReadingSpeakEl = document.getElementById('btn-reading-speak');
    this.readingOptionsEl = document.getElementById('reading-options');

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
    document.getElementById('btn-settings').addEventListener('click', () => {
      clickSfx();
      this.handlers.onOpenSettings();
    });
    document.getElementById('btn-map-back').addEventListener('click', () => {
      clickSfx();
      this.handlers.onOpenTitle();
    });
    document.getElementById('btn-mode-back').addEventListener('click', () => {
      clickSfx();
      this.handlers.onOpenMap();
    });

    this.btnToggleBossEl.addEventListener('click', () => {
      clickSfx();
      this.bossModeSelected = !this.bossModeSelected;
      this._syncBossToggleUi();
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
    this.btnNextStepEl.addEventListener('click', () => {
      clickSfx();
      this.handlers.onNextStep();
    });
    document.getElementById('btn-reading-back').addEventListener('click', () => {
      clickSfx();
      this.handlers.onReadingBack();
    });
    this.btnReadingSpeakEl.addEventListener('click', () => {
      this.audio.unlock();
      this.handlers.onReadingSpeak();
    });

    document.getElementById('btn-settings-back').addEventListener('click', () => {
      clickSfx();
      this.handlers.onOpenTitle();
    });

    // Touch steering & Nitro
    document.getElementById('btn-steer-left').addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.audio.unlock();
      this.handlers.onSteerDelta(-1);
    });
    document.getElementById('btn-steer-right').addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.audio.unlock();
      this.handlers.onSteerDelta(1);
    });
    this.btnNitroEl.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.audio.unlock();
      this.handlers.onTriggerNitro();
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
      this.selectedLevel = 1;
      this.selectedWorldId = 1;
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

    if (name !== 'race') {
      this.setFxState({ boost: false, nitro: false, slowmo: false });
    }

    if (name === 'title') {
      this.updateTitleSummary();
    } else if (name === 'map') {
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

  renderWorldMap() {
    this.mapCoinsEl.textContent = String(this.progress.coins);

    const activeLevel = getLevelById(this.selectedLevel);
    this.selectedLevel = activeLevel.id;

    this.screens.map.classList.remove('level-1', 'level-2', 'level-3');
    this.screens.map.classList.add(`level-${activeLevel.id}`);

    // 3 level tabs
    this.mapLevelTabsEl.innerHTML = '';
    LEVELS.forEach((lvl) => {
      const unlocked = this.progress.isLevelUnlocked(lvl.id);
      const prog = this.progress.getLevelProgress(lvl.id);
      const isActive = lvl.id === activeLevel.id;

      const tab = document.createElement('button');
      tab.type = 'button';
      tab.role = 'tab';
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      tab.dataset.level = String(lvl.id);
      tab.className = `level-tab ${isActive ? 'active' : ''} ${unlocked ? 'unlocked' : 'locked'}`;
      tab.style.setProperty('--lvl-color', lvl.color);
      tab.style.setProperty('--lvl-dark', lvl.darkColor);

      tab.innerHTML = `
        <div class="level-tab-main">
          <span class="level-tab-icon">${unlocked ? lvl.icon : '🔒'}</span>
          <div class="level-tab-text">
            <span class="level-tab-num">רמה ${lvl.id}</span>
            <span class="level-tab-name">${lvl.nameHe}</span>
          </div>
        </div>
        <span class="level-tab-progress" dir="ltr">★ ${prog.earned}/${prog.possible}</span>
      `;

      tab.addEventListener('click', () => {
        this.audio.unlock();
        this.audio.playSfx('click');
        this.selectedLevel = lvl.id;
        this.renderWorldMap();
      });

      this.mapLevelTabsEl.appendChild(tab);
    });

    // Level banner
    const levelUnlocked = this.progress.isLevelUnlocked(activeLevel.id);
    const activeProg = this.progress.getLevelProgress(activeLevel.id);
    if (!levelUnlocked) {
      this.mapLevelBannerEl.innerHTML = `
        <span class="banner-text">🔒 רמה ${activeLevel.id} נעולה - השיגו לפחות כוכב אחד בכל עולמות רמה ${activeLevel.id - 1} כדי לפתוח</span>
      `;
    } else {
      const pct = activeProg.possible > 0 ? Math.round((activeProg.earned / activeProg.possible) * 100) : 0;
      this.mapLevelBannerEl.innerHTML = `
        <span class="banner-text">${activeLevel.icon} רמה ${activeLevel.id} - ${activeLevel.nameHe}: ${activeProg.earned} / ${activeProg.possible} כוכבים</span>
        <div class="banner-bar-wrap" aria-hidden="true">
          <div class="banner-bar-fill" style="width: ${pct}%"></div>
        </div>
      `;
    }

    // Winding road SVG
    const levelWorlds = getWorldsByLevel(activeLevel.id);
    if (this.mapRoadSvgEl) {
      const roadPath = levelWorlds.length > 6
        ? 'M 690 115 L 110 115 C 30 115, 30 390, 110 390 L 690 390'
        : 'M 670 115 L 130 115 C 40 115, 40 390, 130 390 L 670 390';
      this.mapRoadSvgEl.innerHTML = `
        <path d="${roadPath}" fill="none" stroke="rgba(15,23,42,0.22)" stroke-width="52" stroke-linecap="round" />
        <path d="${roadPath}" fill="none" stroke="#475569" stroke-width="40" stroke-linecap="round" />
        <path d="${roadPath}" fill="none" stroke="#fef08a" stroke-width="6" stroke-dasharray="18 18" stroke-linecap="round" />
      `;
    }

    // World nodes
    this.mapNodesEl.innerHTML = '';
    this.mapNodesEl.classList.toggle('cols-4', levelWorlds.length > 6);

    levelWorlds.forEach((world) => {
      const unlocked = this.progress.isWorldUnlocked(world.id);
      const stars = this.progress.getStars(world.id);
      const bossBeaten = this.progress.isBossBeaten(world.id);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `world-node ${unlocked ? 'unlocked' : 'locked'}`;
      btn.dataset.worldId = String(world.id);
      btn.style.setProperty('--node-accent', world.accent);
      btn.style.setProperty('--node-bg', world.badgeBg);
      if (!unlocked) btn.setAttribute('aria-disabled', 'true');

      const starsHtml = [1, 2, 3]
        .map((n) => `<span class="star ${n <= stars ? 'filled' : ''}">★</span>`)
        .join('');

      const wSteps = this.progress.getWorldSteps(world.id);
      const readingOpen = this.progress.isStepUnlocked(world.id, 'reading');
      const raceOpen = this.progress.isStepUnlocked(world.id, 'race');
      const stepsHtml = unlocked
        ? `
          <div class="world-steps-row" aria-label="שלבי למידה">
            <span class="world-step-pill ${wSteps.listen >= 2 ? 'done' : ''}" title="האזנה">🎧${wSteps.listen >= 2 ? '✓' : ''}</span>
            <span class="world-step-pill ${wSteps.reading >= 2 ? 'done' : readingOpen ? '' : 'locked'}" title="קריאה">📖${wSteps.reading >= 2 ? '✓' : ''}</span>
            <span class="world-step-pill ${wSteps.race >= 2 ? 'done' : raceOpen ? '' : 'locked'}" title="מרוץ">🏎️${wSteps.race >= 2 ? '✓' : ''}</span>
          </div>
        `
        : '';

      const lockHint = !levelUnlocked ? 'רמה נעולה' : '2 כוכבים או בוס';

      btn.innerHTML = `
        <div class="world-num">${world.id}</div>
        ${bossBeaten ? '<div class="world-boss-badge" title="הבוס נוצח!">👑</div>' : ''}
        <div class="world-emoji">${unlocked ? world.icon : '🔒'}</div>
        <div class="world-name-he">${world.nameHe}</div>
        ${stepsHtml}
        <div class="world-stars">${unlocked ? starsHtml : `<span class="lock-hint">${lockHint}</span>`}</div>
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
        this.selectedLevel = world.level;
        this.renderModePicker(world.id);
        this.handlers.onSelectWorld(world.id);
      });

      this.mapNodesEl.appendChild(btn);
    });
  }

  renderModePicker(worldId) {
    const world = getWorldById(worldId);
    const stars = this.progress.getStars(world.id);
    const wSteps = this.progress.getWorldSteps(world.id);
    const starsHtml = [1, 2, 3]
      .map((n) => `<span class="star ${n <= stars ? 'filled' : ''}">★</span>`)
      .join('');

    this.modeWorldBadgeEl.innerHTML = `
      <span class="mode-world-icon">${world.icon}</span>
      <span class="mode-world-name">${world.nameHe}</span>
      <span class="mode-world-stars">${starsHtml}</span>
    `;

    // Auto-select Boss Race when Step 3 is unlocked and player has 2 stars without Boss win
    const raceUnlocked = this.progress.isStepUnlocked(world.id, 'race');
    this.bossModeSelected = raceUnlocked && stars === 2 && !this.progress.isBossBeaten(world.id);
    this._syncBossToggleUi();

    const steps = [
      {
        id: 'listen',
        num: 'שלב 1',
        title: 'מרוץ האזנה',
        sub: 'מקשיבים למילה ונוסעים לשלט התמונה',
        icon: '🎧',
        stars: wSteps.listen,
        unlocked: this.progress.isStepUnlocked(world.id, 'listen'),
        lockHint: '',
        reqHint: '2+ כוכבים לפתיחת שלב 2'
      },
      {
        id: 'reading',
        num: 'שלב 2',
        title: 'אימון קריאה',
        sub: '10 קלפים רגועים ללא זמן - מילה ותמונה',
        icon: '📖',
        stars: wSteps.reading,
        unlocked: this.progress.isStepUnlocked(world.id, 'reading'),
        lockHint: 'נעול - 2 כוכבים במרוץ האזנה',
        reqHint: '8/10 מכה ראשונה לפתיחת שלב 3'
      },
      {
        id: 'race',
        num: 'שלב 3',
        title: 'מרוץ מילים',
        sub: 'רואים תמונה ובוחרים את המילה באנגלית',
        icon: '🏎️',
        stars: wSteps.race,
        unlocked: raceUnlocked,
        lockHint: 'נעול - עברו אימון קריאה (8/10)',
        reqHint: 'מרוץ גמר + בוס'
      }
    ];

    this.modeCardsEl.innerHTML = '';
    steps.forEach((s) => {
      const done = s.stars >= 2;
      const card = document.createElement('button');
      card.type = 'button';
      card.className = `step-card step-${s.id} ${s.unlocked ? 'unlocked' : 'locked'} ${done ? 'completed' : ''}`;
      card.dataset.step = s.id;
      if (!s.unlocked) card.setAttribute('aria-disabled', 'true');

      const miniStars = [1, 2, 3]
        .map((n) => `<span class="star ${n <= s.stars ? 'filled' : ''}">★</span>`)
        .join('');

      card.innerHTML = `
        <div class="step-badge-num">${done ? '✓ הושלם' : s.num}</div>
        <div class="step-icon-big">${s.unlocked ? s.icon : '🔒'}</div>
        <div class="step-title">${s.title}</div>
        <div class="step-sub">${s.unlocked ? s.sub : s.lockHint}</div>
        <div class="step-stars">${s.unlocked ? miniStars : ''}</div>
        <div class="step-req-note">${s.reqHint}</div>
      `;

      card.addEventListener('click', () => {
        this.audio.unlock();
        if (!s.unlocked) {
          this.audio.playSfx('wrong');
          card.classList.remove('shake');
          void card.offsetWidth;
          card.classList.add('shake');
          return;
        }
        this.audio.playSfx('click');
        this.progress.setLastMode(s.id === 'listen' ? 'listen' : 'picture');
        this.handlers.onStartStep(world.id, s.id, s.id === 'race' ? this.bossModeSelected : false);
      });
      this.modeCardsEl.appendChild(card);
    });
  }

  renderReadingCard(session, world) {
    const card = session.getCurrentCard();
    if (!card) return;

    this.readingWorldBadgeEl.textContent = `${world.icon} ${world.nameHe}`;
    this.readingCoinsEl.textContent = String(this.progress.coins + session.coins);
    this.readingCounterEl.textContent = `${session.cardIndex + 1} / ${session.cards.length}`;

    this.readingDotsEl.innerHTML = '';
    for (let i = 0; i < session.cards.length; i++) {
      const c = session.cards[i];
      const dot = document.createElement('span');
      const stateCls = i < session.cardIndex
        ? (c && c.hadMistake ? 'done-miss' : 'done-ok')
        : i === session.cardIndex
          ? 'active'
          : '';
      dot.className = stateCls ? `reading-dot ${stateCls}` : 'reading-dot';
      this.readingDotsEl.appendChild(dot);
    }

    if (card.kind === 'word_to_pic') {
      this.readingInstructionEl.textContent = 'קראו והקשיבו למילה - בחרו את התמונה המתאימה';
      this.readingPromptBoxEl.innerHTML = `<div class="reading-prompt-word" dir="ltr">${card.prompt}</div>`;
      this.btnReadingSpeakEl.classList.remove('hidden');
    } else {
      this.readingInstructionEl.textContent = 'הביטו בתמונה - בחרו את המילה הנכונה באנגלית';
      if (card.target.emoji) {
        this.readingPromptBoxEl.innerHTML = `<div class="reading-prompt-emoji">${card.prompt}</div>`;
      } else {
        this.readingPromptBoxEl.innerHTML = `<div class="reading-prompt-hebrew" dir="rtl">${card.prompt}</div>`;
      }
      this.btnReadingSpeakEl.classList.add('hidden');
    }

    this.readingOptionsEl.innerHTML = '';
    card.options.forEach((optText, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'reading-option-btn';
      btn.dataset.optionIndex = String(idx);

      const isPic = card.kind === 'word_to_pic';
      const optWord = card.optionWords[idx];
      const span = document.createElement('span');
      if (isPic && optWord && optWord.emoji) {
        span.className = 'reading-opt-emoji';
      } else if (isPic) {
        span.className = 'reading-opt-he';
        span.setAttribute('dir', 'rtl');
      } else {
        span.className = 'reading-opt-en';
        span.setAttribute('dir', 'ltr');
      }
      span.textContent = optText;
      btn.appendChild(span);

      btn.addEventListener('click', () => {
        this.audio.unlock();
        this.handlers.onReadingAnswer(idx);
      });
      this.readingOptionsEl.appendChild(btn);
    });

    this.readingCardEl.classList.remove('pop-in', 'card-shake');
    void this.readingCardEl.offsetWidth;
    this.readingCardEl.classList.add('pop-in');
  }

  showReadingFeedback(chosenIdx, correctIdx, isCorrect) {
    const btns = Array.from(this.readingOptionsEl.querySelectorAll('.reading-option-btn'));
    btns.forEach((b) => b.classList.remove('is-wrong', 'is-correct'));

    if (isCorrect) {
      if (btns[chosenIdx]) btns[chosenIdx].classList.add('is-correct');
      return;
    }

    if (btns[chosenIdx]) {
      void btns[chosenIdx].offsetWidth;
      btns[chosenIdx].classList.add('is-wrong');
    }
    if (btns[correctIdx]) {
      btns[correctIdx].classList.add('is-correct');
    }
    this.readingCardEl.classList.remove('card-shake');
    void this.readingCardEl.offsetWidth;
    this.readingCardEl.classList.add('card-shake');
  }

  _syncBossToggleUi() {
    this.btnToggleBossEl.classList.toggle('is-on', this.bossModeSelected);
    this.bossToggleStateEl.textContent = this.bossModeSelected ? 'מופעל!' : 'כבוי';
  }

  setCountdownRival(worldTheme, isBoss) {
    if (!this.countdownRivalTagEl) return;
    if (isBoss) {
      this.countdownRivalTagEl.textContent = `👑 קרב בוס: נגד ${worldTheme.bossEmoji} ${worldTheme.bossName}!`;
    } else {
      this.countdownRivalTagEl.textContent = `🏁 מרוץ נגד ${worldTheme.rivalEmoji} ${worldTheme.rivalName}`;
    }
  }

  setCountdownText(label) {
    if (!this.countdownNumberEl) return;
    this.countdownNumberEl.textContent = label;
    this.countdownNumberEl.classList.remove('pop');
    void this.countdownNumberEl.offsetWidth;
    this.countdownNumberEl.classList.add('pop');
  }

  setFxState({ boost = false, nitro = false, slowmo = false }) {
    if (!this.fxOverlayEl) return;
    this.fxOverlayEl.classList.toggle('boost', Boolean(boost && !nitro));
    this.fxOverlayEl.classList.toggle('nitro', Boolean(nitro));
    this.fxOverlayEl.classList.toggle('slowmo', Boolean(slowmo));
  }

  updateRaceHud({
    coins,
    combo,
    multiplier,
    position,
    progress,
    rivalProgress,
    nitro,
    nitroActive,
    powerup,
    powerupRatio
  }) {
    this.hudCoinsEl.textContent = String(coins);

    const mult = multiplier || 1;
    this.hudComboEl.textContent = combo >= 2 ? `🔥 x${mult} (${combo})` : `x${mult}`;
    this.hudComboEl.classList.remove('tier-2', 'tier-3', 'tier-5');
    if (mult >= 5) this.hudComboEl.classList.add('tier-5');
    else if (mult >= 3) this.hudComboEl.classList.add('tier-3');
    else if (mult >= 2) this.hudComboEl.classList.add('tier-2');

    const pos = position === 2 ? 2 : 1;
    this.hudPosEl.classList.toggle('pos-1', pos === 1);
    this.hudPosEl.classList.toggle('pos-2', pos === 2);
    this.hudPosIconEl.textContent = pos === 1 ? '🥇' : '🥈';
    this.hudPosTextEl.textContent = pos === 1 ? '1st / 2' : '2nd / 2';

    const pct = Math.round(Math.max(0, Math.min(1, progress)) * 100);
    const rPct = Math.round(Math.max(0, Math.min(1, rivalProgress || 0)) * 100);
    this.hudProgressFillEl.style.width = `${pct}%`;
    this.hudProgressCarEl.style.left = `calc(${pct}% - 12px)`;
    this.hudProgressRivalEl.style.left = `calc(${rPct}% - 10px)`;

    const nVal = Math.round(Math.max(0, Math.min(100, nitro || 0)));
    this.nitroFillEl.style.width = nitroActive ? '100%' : `${nVal}%`;
    this.nitroPctEl.textContent = nitroActive ? 'ON!' : `${nVal}%`;
    this.btnNitroEl.classList.toggle('ready', nVal >= 100 && !nitroActive);
    this.btnNitroEl.classList.toggle('active-burst', Boolean(nitroActive));

    if (powerup) {
      const meta = getPowerupMeta(powerup);
      if (meta) {
        this.hudPowerupEl.classList.remove('hidden');
        this.hudPowerupIconEl.textContent = meta.icon;
        this.hudPowerupNameEl.textContent = meta.nameHe;
        this.hudPowerupBarEl.style.width = `${Math.round(Math.max(0, Math.min(1, powerupRatio || 0)) * 100)}%`;
      }
    } else {
      this.hudPowerupEl.classList.add('hidden');
    }
  }

  renderPromptCard(gate, mode) {
    if (!gate) {
      this.promptCardEl.classList.add('hidden');
      return;
    }
    this.promptCardEl.classList.remove('hidden', 'mode-picture', 'mode-listen', 'mode-hebrew');
    this.promptCardEl.classList.add(`mode-${mode}`);

    if (mode === 'picture') {
      if (gate.target.emoji) {
        this.promptCardEl.innerHTML = `<div class="prompt-emoji" aria-label="picture prompt">${gate.target.emoji}</div>`;
      } else {
        this.promptCardEl.innerHTML = `<div class="prompt-hebrew" dir="rtl">${gate.target.he}</div>`;
      }
    } else if (mode === 'listen') {
      this.promptCardEl.innerHTML = `
        <div class="prompt-speaker" aria-label="listen prompt">
          <span class="speaker-icon">🔊</span>
          <span class="speaker-hint">הקשיבו למילה - לחצו לשמיעה חוזרת</span>
        </div>
      `;
    } else {
      this.promptCardEl.innerHTML = `<div class="prompt-hebrew" dir="rtl">${gate.target.he}</div>`;
    }

    this.promptCardEl.classList.remove('pop-in');
    void this.promptCardEl.offsetWidth;
    this.promptCardEl.classList.add('pop-in');
  }

  showCallout(text, variant = 'gold', durationMs = 1200) {
    if (!this.calloutEl) return;
    if (this.calloutTimer) clearTimeout(this.calloutTimer);
    this.calloutEl.textContent = text;
    this.calloutEl.className = `race-callout ${variant === 'cyan' ? 'callout-cyan' : variant === 'boss' ? 'callout-boss' : ''}`;
    this.calloutEl.classList.remove('hidden');
    this.calloutTimer = setTimeout(() => {
      this.calloutEl.classList.add('hidden');
    }, durationMs);
  }

  showFeedbackWord(wordObj) {
    if (!this.feedbackToastEl || !wordObj) return;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.feedbackToastEl.textContent = wordObj.emoji ? `${wordObj.emoji} ${wordObj.en}` : wordObj.en;
    this.feedbackToastEl.classList.remove('hidden');
    this.toastTimer = setTimeout(() => {
      this.feedbackToastEl.classList.add('hidden');
    }, 1500);
  }

  renderResults({
    step = 'race',
    readingPassed = false,
    stars,
    position,
    isBossRace,
    beatBoss,
    coinsEarned,
    correct,
    total,
    bestCombo,
    wordResults,
    newlyUnlockedWorld,
    nextStepLabel
  }) {
    if (step === 'reading') {
      this.resPosBannerEl.textContent = readingPassed
        ? '📖 אימון קריאה הושלם בהצלחה!'
        : '📖 אימון קריאה הושלם - כמעט שם!';
      this.resPosBannerEl.className = `results-position-banner ${readingPassed ? 'pos-1' : 'pos-2'}`;
      this.resTitleEl.textContent = stars >= 3 ? 'מושלם! 10/10!' : readingPassed ? 'שלב 3 נפתח!' : 'עוד תרגול קטן!';
      this.resScoreEl.textContent = `${correct} / ${total} מכה ראשונה`;
      this.resComboEl.textContent = readingPassed ? '🔓 מרוץ מילים פתוח' : 'נדרש 8/10 לפתיחה';
    } else {
      if (beatBoss) {
        this.resPosBannerEl.textContent = '🏆 ניצחת את הבוס! מקום ראשון!';
        this.resPosBannerEl.className = 'results-position-banner boss-win';
      } else if (position === 1) {
        this.resPosBannerEl.textContent = '🥇 מקום ראשון! (1st)';
        this.resPosBannerEl.className = 'results-position-banner pos-1';
      } else {
        this.resPosBannerEl.textContent = '🥈 מקום שני (2nd)';
        this.resPosBannerEl.className = 'results-position-banner pos-2';
      }

      const titles = {
        1: 'סיימתם את המרוץ!',
        2: 'כל הכבוד!',
        3: 'אלופים אמיתיים!'
      };
      this.resTitleEl.textContent = beatBoss ? 'אלוף העולם!' : (titles[stars] || titles[1]);
      this.resScoreEl.textContent = `${correct} / ${total} נכונות`;
      const bestMult = bestCombo >= 6 ? 5 : bestCombo >= 4 ? 3 : bestCombo >= 2 ? 2 : 1;
      this.resComboEl.textContent = `🔥 שיא x${bestMult}`;
    }

    if (this.btnNextStepEl) {
      if (nextStepLabel) {
        this.btnNextStepEl.classList.remove('hidden');
        this.btnNextStepEl.textContent = nextStepLabel;
      } else {
        this.btnNextStepEl.classList.add('hidden');
      }
    }

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
      let cur = 0;
      const stepVal = Math.max(1, Math.ceil(coinsEarned / 18));
      const iv = setInterval(() => {
        cur = Math.min(coinsEarned, cur + stepVal);
        this.resCoinsEl.textContent = String(cur);
        if (cur >= coinsEarned) clearInterval(iv);
      }, 28);
    }

    if (newlyUnlockedWorld) {
      this.resUnlockEl.classList.remove('hidden');
      this.resUnlockEl.textContent = `🎉 עולם חדש נפתח: ${newlyUnlockedWorld.icon} ${newlyUnlockedWorld.nameHe}!`;
    } else if (isBossRace && !beatBoss) {
      this.resUnlockEl.classList.remove('hidden');
      this.resUnlockEl.textContent = '👑 נסו לעקוף את הבוס כדי לזכות בגביע ובכוכב השלישי!';
    } else {
      this.resUnlockEl.classList.add('hidden');
    }

    this.resWordsEl.innerHTML = '';
    wordResults.forEach(({ word, correct: ok }) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `result-word-chip ${ok ? 'is-correct' : 'is-missed'}`;
      btn.innerHTML = `
        <span class="chip-emoji">${word.emoji || '🔤'}</span>
        <div>
          <div class="chip-en" dir="ltr">${word.en}</div>
          <div class="chip-he">${word.he}</div>
        </div>
        <span>${ok ? '✅' : '🔊'}</span>
      `;
      btn.addEventListener('click', () => {
        this.audio.unlock();
        this.audio.speak(word.en);
      });
      this.resWordsEl.appendChild(btn);
    });
  }

  renderSettings() {
    const s = this.progress.settings;
    this.toggleSoundEl.classList.toggle('is-on', s.sound);
    this.toggleSoundEl.textContent = s.sound ? 'מופעל' : 'כבוי';
    this.toggleMusicEl.classList.toggle('is-on', s.music);
    this.toggleMusicEl.textContent = s.music ? 'מופעל' : 'כבוי';
    this.speedNormalEl.classList.toggle('active', s.voiceSpeed !== 'slow');
    this.speedSlowEl.classList.toggle('active', s.voiceSpeed === 'slow');
  }
}
