// Word Race v3 entry point: screen router, 3D loop (title turntable, countdown, race, results orbit),
// input bindings, Phase B extension hooks, and window.__game test hooks.

import { WORLDS, getWorldById } from '../../js/words.js';
import { getWorld3DTheme } from './worlds3d.js';
import { ProgressStore } from './progress.js';
import { AudioEngine } from './audio.js';
import { SceneManager } from './scene.js';
import { RaceEngine3D } from './race.js';
import { ReadingSession } from './reading.js';
import { UIController } from './ui.js';
import { RewardsUIController } from './rewards-ui.js';

const progress = new ProgressStore();
const audio = new AudioEngine();
audio.syncSettings(progress.settings);

const raceCanvas = document.getElementById('race-canvas');
const sceneMgr = new SceneManager(raceCanvas);
const reading = new ReadingSession();

let currentWorldId = 1;
let currentStep = 'listen'; // 'listen' | 'reading' | 'race'
let currentMode = progress.lastMode || 'picture';
let currentBossFlag = false;
let countdownTimerId = null;
let readingAdvanceTimer = null;
let lastFrameTs = null;
let rafId = null;
let titleTime = 0;
let pitTime = 0;
let garageTime = 0;
let garageYawOffset = 0;
let runWordResults = [];
let runNewStickers = [];
let runXpGained = 0;
let runLeveledUpTo = null;
let pendingChest = null;
let resultsFinalized = false;
let pendingNextStep = null;

function resolveStepAndMode(stepOrMode) {
  if (stepOrMode === 'reading') return { step: 'reading', mode: 'reading' };
  if (stepOrMode === 'listen') return { step: 'listen', mode: 'listen' };
  if (stepOrMode === 'hebrew') return { step: 'race', mode: 'hebrew' };
  return { step: 'race', mode: 'picture' };
}

// Phase B extension hooks
const phaseBHooks = {
  onTitleReady: null,
  onResultsReady: null
};
window.__phaseBHooks = phaseBHooks;

const ui = new UIController({
  progress,
  audio,
  handlers: {
    onOpenTitle: () => {
      stopCountdown();
      audio.updateEngine(0, false, false, false);
      audio.setNitroPitch(false);
      race.active = false;
      race.resultsOrbitMode = false;
      sceneMgr.setupTitleShowcase(progress.getEffectiveSkin());
      ui.showScreen('title');
      syncTitlePhaseB();
      if (phaseBHooks.onTitleReady) phaseBHooks.onTitleReady({ progress, ui, sceneMgr });
      ensureMainLoop();
    },
    onOpenMap: () => {
      stopCountdown();
      audio.updateEngine(0, false, false, false);
      audio.setNitroPitch(false);
      race.active = false;
      race.resultsOrbitMode = false;
      ui.showScreen('map');
    },
    onOpenSettings: () => {
      ui.showScreen('settings');
    },
    onSelectWorld: (worldId) => {
      currentWorldId = Number(worldId);
      ui.showScreen('mode');
    },
    onStartStep: (worldId, step, boss) => {
      if (step === 'reading') {
        startReadingTraining(worldId, false);
      } else {
        startWithCountdown(worldId, step, boss);
      }
    },
    onStartRace: (worldId, mode, boss) => {
      startWithCountdown(worldId, mode, boss);
    },
    onReadingBack: () => {
      clearTimeout(readingAdvanceTimer);
      readingAdvanceTimer = null;
      ui.renderModePicker(currentWorldId);
      ui.showScreen('mode');
    },
    onReadingSpeak: () => {
      if (ui.currentScreen !== 'reading') return;
      const card = reading.getCurrentCard();
      if (card) audio.speak(card.target.en);
    },
    onReadingAnswer: (optionIdx) => {
      handleReadingAnswer(optionIdx, false);
    },
    onNextStep: () => {
      if (!pendingNextStep) return;
      if (pendingNextStep === 'reading') {
        startReadingTraining(currentWorldId, false);
      } else if (pendingNextStep === 'race') {
        startWithCountdown(currentWorldId, 'race', false);
      }
    },
    onPause: () => {
      if (ui.currentScreen !== 'race') return;
      race.paused = true;
      audio.updateEngine(0, false, false, false);
      audio.setNitroPitch(false);
      ui.showScreen('pause');
    },
    onResume: () => {
      if (ui.currentScreen !== 'pause') return;
      race.paused = false;
      lastFrameTs = null;
      ui.showScreen('race');
      ensureMainLoop();
    },
    onRestart: () => {
      if (currentStep === 'reading') {
        startReadingTraining(currentWorldId, false);
      } else {
        startWithCountdown(currentWorldId, currentStep, currentBossFlag);
      }
    },
    onQuitToMap: () => {
      clearTimeout(readingAdvanceTimer);
      readingAdvanceTimer = null;
      race.active = false;
      race.resultsOrbitMode = false;
      audio.updateEngine(0, false, false, false);
      audio.setNitroPitch(false);
      ui.showScreen('map');
    },
    onSteerDelta: (delta) => {
      if (ui.currentScreen !== 'race') return;
      race.steerStep(delta);
    },
    onTriggerNitro: () => {
      if (ui.currentScreen !== 'race') return;
      race.activateNitro();
    },
    onPromptTap: () => {
      if (ui.currentScreen !== 'race') return;
      if (currentStep === 'listen') {
        const next = race.getNextGate();
        if (next) audio.speak(next.target.en);
      }
    }
  }
});

const rewardsUi = new RewardsUIController({
  progress,
  audio,
  handlers: {
    onOpenGarage: () => {
      stopCountdown();
      race.active = false;
      race.resultsOrbitMode = false;
      garageYawOffset = 0;
      sceneMgr.resize();
      sceneMgr.setupGarageShowcase(progress.getEffectiveSkin());
      rewardsUi.renderGarage();
      ui.showScreen('garage');
      ensureMainLoop();
    },
    onOpenAlbum: () => {
      stopCountdown();
      race.active = false;
      race.resultsOrbitMode = false;
      rewardsUi.renderAlbum();
      ui.showScreen('album');
    },
    onBackToTitle: () => {
      sceneMgr.setupTitleShowcase(progress.getEffectiveSkin());
      ui.showScreen('title');
      syncTitlePhaseB();
      ensureMainLoop();
    },
    onGarageRefresh3D: () => {
      sceneMgr.setupGarageShowcase(progress.getEffectiveSkin());
      rewardsUi.updateTitleBadges();
      ui.updateTitleSummary();
    },
    onGarageSpinDelta: (deltaYaw) => {
      garageYawOffset += deltaYaw;
    },
    onOpenChest: () => {
      handleOpenChest(false);
    },
    onOpenDailyModal: () => {
      const info = progress.evaluateDailyStreak();
      rewardsUi.showDailyGiftModal(info);
    },
    onClaimDailyGift: () => {
      const res = progress.claimDailyGift();
      rewardsUi.hideDailyGiftModal();
      if (res.claimed) {
        audio.playSfx('confetti');
        ui.updateTitleSummary();
        rewardsUi.updateTitleBadges();
        if (res.levelResult && res.levelResult.leveledUp) {
          progress.addCoins(50);
          ui.updateTitleSummary();
          rewardsUi.updateTitleBadges();
          rewardsUi.showLevelUpModal(res.levelResult.newLevel);
        }
      }
    }
  }
});

function syncTitlePhaseB() {
  ui.updateTitleSummary();
  rewardsUi.updateTitleBadges();
}

const race = new RaceEngine3D(sceneMgr, {
  onTargetChange: (gate, silent) => {
    ui.renderPromptCard(gate, currentMode);
    if (!silent && gate && currentStep === 'listen') {
      audio.speak(gate.target.en);
    }
  },
  onGateResult: ({ gate, correct, earned, combo, multiplier, shielded, silent }) => {
    const scoreRes = progress.updateWordScore(gate.target.id, correct);
    if (scoreRes.becameSticker && !runNewStickers.some((w) => w.id === gate.target.id)) {
      runNewStickers.push(gate.target);
    }
    if (correct) {
      const lvlRes = progress.addXp(15);
      runXpGained += 15;
      if (lvlRes.leveledUp) {
        runLeveledUpTo = lvlRes.newLevel;
        progress.addCoins(50);
      }
      if (earned > 0) progress.addCoins(earned);
    }
    runWordResults.push({ word: gate.target, correct });

    if (!silent) {
      if (correct) {
        audio.playSfx('correct', combo);
        audio.playSfx('coin', combo);
        audio.playSfx('boost');
        if (multiplier >= 5 && combo === 6) {
          ui.showCallout('🔥 אש! x5', 'gold', 1100);
        }
      } else {
        audio.playSfx(shielded ? 'shield' : 'shatter');
        if (shielded) {
          ui.showCallout('🛡️ מגן הציל אותך!', 'cyan', 1100);
        }
        ui.showFeedbackWord(gate.target);
      }
      // Note per SPEC-V3 section 6: NO speech when passing a gate sign
    }
    syncHud();
  },
  onCoinPickup: (amount) => {
    progress.addCoins(amount);
    audio.playSfx('coin', race.combo);
  },
  onJump: () => {
    audio.playSfx('jump');
    ui.showCallout('🚀 קפיצה!', 'gold', 850);
  },
  onRampLand: (bonusCoins) => {
    progress.addCoins(bonusCoins);
    audio.playSfx('land');
    ui.showCallout(`+${bonusCoins} נחיתה!`, 'gold', 900);
  },
  onPowerup: (type, meta) => {
    audio.playSfx('powerup');
    if (meta) ui.showCallout(`${meta.icon} ${meta.nameHe}!`, 'cyan', 1100);
  },
  onShieldAbsorb: () => {
    audio.playSfx('shield');
    ui.showCallout('🛡️ המגן ספג!', 'cyan', 1000);
  },
  onObstacle: () => {
    audio.playSfx('obstacle');
    ui.showCallout('אופס!', 'gold', 700);
  },
  onNearMiss: (bonus) => {
    progress.addCoins(bonus);
    audio.playSfx('nearmiss');
    ui.showCallout(`⚡ כמעט! +${bonus}`, 'cyan', 950);
  },
  onOvertake: () => {
    audio.playSfx('overtake');
    ui.showCallout('PASSED! עקפת! 🥇', 'gold', 1200);
  },
  onNitroStart: () => {
    audio.playSfx('nitro');
    audio.setNitroPitch(true);
    ui.showCallout('⚡ ניטרו טורבו!', 'cyan', 1100);
  },
  onNitroEnd: () => {
    audio.setNitroPitch(false);
  },
  onFinishLine: () => {
    audio.playSfx('confetti');
    audio.setNitroPitch(false);
    audio.updateEngine(0, false, false, false);
  },
  onRunComplete: () => {
    finalizeAndShowResults(false);
  }
});

function syncHud() {
  const powerupRatio = race.powerup && race.powerupMaxDuration > 0
    ? race.powerupTimer / race.powerupMaxDuration
    : 0;
  ui.updateRaceHud({
    coins: race.coins,
    combo: race.combo,
    multiplier: race.getComboMultiplier(),
    position: race.getPosition(),
    progress: race.getProgressRatio(),
    rivalProgress: race.getRivalProgressRatio(),
    nitro: race.nitro,
    nitroActive: race.nitroTimer > 0,
    powerup: race.powerup,
    powerupRatio
  });
  ui.setFxState({
    boost: race.boostTimer > 0 || race.rampBoostTimer > 0,
    nitro: race.nitroTimer > 0,
    slowmo: race.powerup === 'slowmo' || race.overtakeSlowMoTimer > 0
  });
}

function stopCountdown() {
  if (countdownTimerId) {
    clearTimeout(countdownTimerId);
    countdownTimerId = null;
  }
}

function ensureMainLoop() {
  if (rafId) return;
  lastFrameTs = null;

  const tick = (ts) => {
    const active3DScreen =
      ui.currentScreen === 'title' ||
      ui.currentScreen === 'garage' ||
      ui.currentScreen === 'reading' ||
      ui.currentScreen === 'countdown' ||
      ui.currentScreen === 'race' ||
      ui.currentScreen === 'results';

    if (!active3DScreen) {
      rafId = null;
      lastFrameTs = null;
      return;
    }

    if (document.hidden) {
      lastFrameTs = null;
      rafId = requestAnimationFrame(tick);
      return;
    }

    if (lastFrameTs === null) {
      lastFrameTs = ts;
    }
    const rawDt = Math.max(0, (ts - lastFrameTs) / 1000);
    const dt = Math.min(0.05, rawDt);
    lastFrameTs = ts;

    if (ui.currentScreen === 'title') {
      titleTime += dt;
      sceneMgr.renderTitleShowcase(dt, titleTime);
    } else if (ui.currentScreen === 'garage') {
      garageTime += dt;
      sceneMgr.renderGarageShowcase(dt, garageTime, progress.getEffectiveSkin().trailStyle, garageYawOffset);
    } else if (ui.currentScreen === 'reading') {
      pitTime += dt;
      sceneMgr.renderPitStop(dt, pitTime);
    } else if (ui.currentScreen === 'countdown') {
      race.time += dt;
      race.render(dt, false);
    } else if (ui.currentScreen === 'race' && race.active && !race.paused) {
      sceneMgr.recordFrameTime(rawDt);
      race.step(dt, false);
      race.render(dt, false);
      syncHud();
      audio.updateEngine(
        race.speed,
        !race.finished,
        race.boostTimer > 0 || race.rampBoostTimer > 0,
        race.nitroTimer > 0
      );
    } else if (ui.currentScreen === 'results') {
      if (race.resultsOrbitMode) {
        race.time += dt;
        race.render(dt, false);
      } else {
        pitTime += dt;
        sceneMgr.renderPitStop(dt, pitTime);
      }
    }

    rafId = requestAnimationFrame(tick);
  };

  rafId = requestAnimationFrame(tick);
}

function startReadingTraining(worldId, silent = false) {
  stopCountdown();
  clearTimeout(readingAdvanceTimer);
  readingAdvanceTimer = null;
  race.active = false;
  race.resultsOrbitMode = false;
  audio.updateEngine(0, false, false, false);
  audio.setNitroPitch(false);

  const world = getWorldById(worldId);
  currentWorldId = world.id;
  currentStep = 'reading';
  currentMode = 'reading';
  currentBossFlag = false;
  ui.selectedLevel = world.level;
  runNewStickers = [];
  runXpGained = 0;
  runLeveledUpTo = null;
  pendingChest = null;
  resultsFinalized = false;
  pendingNextStep = null;

  sceneMgr.resize();
  sceneMgr.setupPitStopScene(getWorld3DTheme(world.id), progress.getEffectiveSkin());
  const firstCard = reading.start(world.id, progress.data.wordScores, progress.getLastMissed(world.id));
  ui.renderReadingCard(reading, world);
  ui.showScreen('reading');
  ensureMainLoop();

  if (!silent && firstCard && firstCard.kind === 'word_to_pic') {
    audio.speak(firstCard.target.en);
  }
}

function handleReadingAnswer(optionIdx, silent = false) {
  if (reading.done || ui.currentScreen !== 'reading') {
    return { correct: false, done: reading.done, correctIndex: -1 };
  }
  if (!silent && readingAdvanceTimer) {
    return { correct: false, done: false, correctIndex: -1 };
  }
  if (silent && readingAdvanceTimer) {
    clearTimeout(readingAdvanceTimer);
    readingAdvanceTimer = null;
  }

  const res = reading.answer(optionIdx);
  if (res.target) {
    const scoreRes = progress.updateWordScore(res.target.id, res.correct);
    if (scoreRes.becameSticker && !runNewStickers.some((w) => w.id === res.target.id)) {
      runNewStickers.push(res.target);
    }
    if (res.correct && res.firstTry) {
      const lvlRes = progress.addXp(10);
      runXpGained += 10;
      if (lvlRes.leveledUp) {
        runLeveledUpTo = lvlRes.newLevel;
        progress.addCoins(50);
      }
    }
  }

  if (!res.correct) {
    ui.showReadingFeedback(res.chosenIndex, res.correctIndex, false);
    if (!silent) {
      audio.playSfx('wrong');
      if (res.target) audio.speak(res.target.en);
    }
    return { correct: false, done: false, correctIndex: res.correctIndex };
  }

  if (!silent) {
    audio.playSfx('correct', reading.firstTryCorrect);
    ui.showReadingFeedback(res.chosenIndex, res.correctIndex, true);
  }

  const advanceNext = () => {
    readingAdvanceTimer = null;
    if (res.done) {
      finalizeReadingResults(silent);
    } else {
      const world = getWorldById(currentWorldId);
      const nextCard = reading.getCurrentCard();
      ui.renderReadingCard(reading, world);
      if (!silent && nextCard && nextCard.kind === 'word_to_pic') {
        audio.speak(nextCard.target.en);
      }
    }
  };

  if (silent) {
    advanceNext();
  } else {
    readingAdvanceTimer = setTimeout(advanceNext, 240);
  }

  return { correct: true, done: res.done, correctIndex: res.correctIndex };
}

function finalizeReadingResults(silent = false) {
  if (resultsFinalized) return;
  resultsFinalized = true;

  const res = reading.getResults();
  if (res.coins > 0) {
    progress.addCoins(res.coins);
  }

  const finLvl = progress.addXp(40);
  runXpGained += 40;
  if (finLvl.leveledUp) {
    runLeveledUpTo = finLvl.newLevel;
    progress.addCoins(50);
  }

  progress.recordRunResult({
    worldId: currentWorldId,
    step: 'reading',
    stars: res.stars,
    missedIds: res.missedIds,
    beatBoss: false
  });

  const chestTier = res.firstTryCorrect >= 10 ? 'silver' : 'bronze';
  pendingChest = { tier: chestTier, opened: false, reward: null };

  const raceUnlocked = progress.isStepUnlocked(currentWorldId, 'race');
  pendingNextStep = raceUnlocked ? 'race' : null;
  const nextStepLabel = pendingNextStep ? '🏎️ המשך לשלב 3: מרוץ מילים' : null;

  ui.renderResults({
    step: 'reading',
    readingPassed: res.passed,
    stars: res.stars,
    position: 1,
    isBossRace: false,
    beatBoss: false,
    coinsEarned: res.coins,
    correct: res.firstTryCorrect,
    total: res.total,
    bestCombo: res.firstTryCorrect,
    wordResults: res.wordResults,
    newlyUnlockedWorld: null,
    nextStepLabel
  });
  rewardsUi.renderResultsExtras({
    pendingChest,
    newStickers: runNewStickers,
    xpGained: runXpGained,
    newBossCars: []
  });
  syncTitlePhaseB();
  ui.showScreen('results');
  ensureMainLoop();

  if (!silent && runLeveledUpTo) {
    rewardsUi.showLevelUpModal(runLeveledUpTo);
    audio.playSfx('confetti');
  }

  if (phaseBHooks.onResultsReady) {
    phaseBHooks.onResultsReady({
      progress,
      ui,
      worldId: currentWorldId,
      step: 'reading',
      stars: res.stars,
      position: 1,
      beatBoss: false
    });
  }

  if (!silent) {
    for (let i = 0; i < res.stars; i++) {
      setTimeout(() => audio.playSfx('star'), i * 220);
    }
  }
}

function initRaceState(worldId, stepOrMode, bossFlag = false, silent = false) {
  clearTimeout(readingAdvanceTimer);
  readingAdvanceTimer = null;
  const world = getWorldById(worldId);
  const resolved = resolveStepAndMode(stepOrMode);
  currentWorldId = world.id;
  ui.selectedLevel = world.level;
  currentStep = resolved.step;
  currentMode = resolved.mode;
  currentBossFlag = currentStep === 'race' && Boolean(bossFlag);
  runWordResults = [];
  runNewStickers = [];
  runXpGained = 0;
  runLeveledUpTo = null;
  pendingChest = null;
  resultsFinalized = false;
  pendingNextStep = null;

  sceneMgr.resize();
  race.startRun({
    worldId: currentWorldId,
    step: currentStep,
    mode: currentMode,
    boss: currentBossFlag,
    skin: progress.getEffectiveSkin(),
    wordScores: progress.data.wordScores,
    lastMissed: progress.getLastMissed(currentWorldId)
  });

  syncHud();
  if (silent) {
    ui.renderPromptCard(race.getNextGate(), currentMode);
  }
}

function startWithCountdown(worldId, stepOrMode, bossFlag = false) {
  stopCountdown();
  initRaceState(worldId, stepOrMode, bossFlag, true);
  race.paused = true;
  ui.setCountdownRival(race.worldTheme, currentBossFlag);
  ui.showScreen('countdown');
  ensureMainLoop();

  if (currentBossFlag) {
    audio.playSfx('boss');
  }

  const steps = ['3', '2', '1', 'GO!'];
  let idx = 0;

  const advance = () => {
    if (ui.currentScreen !== 'countdown') return;
    const label = steps[idx];
    ui.setCountdownText(label);
    if (label === 'GO!') {
      audio.playSfx('go');
      countdownTimerId = setTimeout(() => {
        if (ui.currentScreen !== 'countdown') return;
        race.paused = false;
        ui.showScreen('race');
        const next = race.getNextGate();
        ui.renderPromptCard(next, currentMode);
        if (currentBossFlag) {
          ui.showCallout('👑 עקפו את הבוס!', 'boss', 1400);
        }
        if (next && currentStep === 'listen') {
          audio.speak(next.target.en);
        }
      }, 450);
    } else {
      audio.playSfx('countdown');
      idx++;
      countdownTimerId = setTimeout(advance, 650);
    }
  };

  advance();
}

function finalizeAndShowResults(silent = false) {
  if (resultsFinalized) return;
  resultsFinalized = true;

  stopCountdown();
  race.active = false;
  race.paused = false;
  race.resultsOrbitMode = true;
  audio.setNitroPitch(false);
  audio.updateEngine(0, false, false, false);

  const totalAnswered = race.correct + race.wrong;
  const totalGates = race.gates.length || 1;
  const ratio = totalAnswered > 0 ? race.correct / totalGates : 0;
  const position = race.getPosition();
  const beatBoss = currentBossFlag && position === 1;

  // Win bonus for beating rival
  if (position === 1 && !silent) {
    const winBonus = beatBoss ? 50 : 25;
    race.coins += winBonus;
    progress.addCoins(winBonus);
  }

  // Stars calculation: SPEC 6b + Boss 3rd-star route
  let stars = 1;
  if (beatBoss) {
    stars = 3;
  } else if (ratio >= 0.9) {
    stars = 3;
  } else if (ratio >= 0.7) {
    stars = 2;
  }

  const prevUnlocked = new Set(
    WORLDS.filter((w) => progress.isWorldUnlocked(w.id)).map((w) => w.id)
  );

  const finXp = position === 1 ? 60 : 35;
  const finLvl = progress.addXp(finXp);
  runXpGained += finXp;
  if (finLvl.leveledUp) {
    runLeveledUpTo = finLvl.newLevel;
    progress.addCoins(50);
  }

  const missedIds = runWordResults.filter((r) => !r.correct).map((r) => r.word.id);
  const { newBossCars = [] } = progress.recordRunResult({
    worldId: currentWorldId,
    step: currentStep,
    stars,
    missedIds,
    beatBoss
  });

  const chestTier = beatBoss ? 'gold' : position === 1 ? 'silver' : 'bronze';
  pendingChest = { tier: chestTier, opened: false, reward: null };

  const newlyUnlockedWorld =
    WORLDS.find((w) => !prevUnlocked.has(w.id) && progress.isWorldUnlocked(w.id)) || null;

  pendingNextStep =
    currentStep === 'listen' && progress.isStepUnlocked(currentWorldId, 'reading')
      ? 'reading'
      : null;
  const nextStepLabel = pendingNextStep === 'reading' ? '📖 המשך לשלב 2: אימון קריאה' : null;

  const seenIds = new Set(runWordResults.map((r) => r.word.id));
  for (const g of race.gates) {
    if (!seenIds.has(g.target.id)) {
      runWordResults.push({ word: g.target, correct: g.result === 'correct' });
    }
  }

  ui.renderResults({
    step: currentStep,
    stars,
    position,
    isBossRace: currentBossFlag,
    beatBoss,
    coinsEarned: race.coins,
    correct: race.correct,
    total: race.gates.length,
    bestCombo: race.bestCombo,
    wordResults: runWordResults,
    newlyUnlockedWorld,
    nextStepLabel
  });
  rewardsUi.renderResultsExtras({
    pendingChest,
    newStickers: runNewStickers,
    xpGained: runXpGained,
    newBossCars
  });
  syncTitlePhaseB();
  ui.showScreen('results');
  ensureMainLoop();

  if (phaseBHooks.onResultsReady) {
    phaseBHooks.onResultsReady({
      progress,
      ui,
      worldId: currentWorldId,
      stars,
      position,
      beatBoss
    });
  }

  if (!silent) {
    for (let i = 0; i < stars; i++) {
      setTimeout(() => audio.playSfx('star'), i * 220);
    }
    if (runLeveledUpTo) {
      setTimeout(() => {
        rewardsUi.showLevelUpModal(runLeveledUpTo);
        audio.playSfx('confetti');
      }, 450);
    }
  }
}

function handleOpenChest(silent = false) {
  let reward;
  if (pendingChest && !pendingChest.opened) {
    reward = progress.rollChestReward(pendingChest.tier);
    pendingChest.opened = true;
    pendingChest.reward = reward;
    race.coins += reward.coins;
    if (ui.resCoinsEl) {
      ui.resCoinsEl.textContent = String(Number(ui.resCoinsEl.textContent || 0) + reward.coins);
    }
  } else {
    reward = progress.rollChestReward('bronze');
    if (pendingChest) {
      pendingChest.opened = true;
      pendingChest.reward = reward;
    }
  }

  if (reward.levelResult && reward.levelResult.leveledUp) {
    progress.addCoins(50);
    if (!silent) {
      rewardsUi.showLevelUpModal(reward.levelResult.newLevel);
    }
  }

  if (reward.sticker && !runNewStickers.some((w) => w.id === reward.sticker.id)) {
    runNewStickers.push(reward.sticker);
  }

  if (ui.currentScreen === 'results') {
    rewardsUi.renderChestBox(pendingChest);
    rewardsUi.renderResultsLevelBar(runXpGained + reward.xp);
    rewardsUi.renderNewStickersReveal(runNewStickers, reward.bossCar ? [reward.bossCar] : []);
  }
  syncTitlePhaseB();

  if (!silent) {
    audio.playSfx('confetti');
    audio.playSfx('coin', 3);
  }

  return reward;
}

// Keyboard controls
window.addEventListener('keydown', (e) => {
  audio.unlock();
  if (ui.currentScreen === 'race') {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      e.preventDefault();
      race.steerStep(-1);
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      e.preventDefault();
      race.steerStep(1);
    } else if (e.code === 'Space' || e.key === ' ') {
      e.preventDefault();
      race.activateNitro();
    } else if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
      e.preventDefault();
      race.paused = true;
      audio.updateEngine(0, false, false, false);
      audio.setNitroPitch(false);
      ui.showScreen('pause');
    }
  } else if (ui.currentScreen === 'pause' && (e.key === 'Escape' || e.key === 'p' || e.key === 'P')) {
    e.preventDefault();
    race.paused = false;
    lastFrameTs = null;
    ui.showScreen('race');
    ensureMainLoop();
  }
});

// Touch swipe steering on 3D canvas
let swipeStartX = null;
let swipeTriggered = false;
raceCanvas.addEventListener('pointerdown', (e) => {
  audio.unlock();
  swipeStartX = e.clientX;
  swipeTriggered = false;
});
raceCanvas.addEventListener('pointermove', (e) => {
  if (swipeStartX === null || swipeTriggered || ui.currentScreen !== 'race') return;
  const dx = e.clientX - swipeStartX;
  if (Math.abs(dx) >= 28) {
    race.steerStep(dx > 0 ? 1 : -1);
    swipeTriggered = true;
  }
});
raceCanvas.addEventListener('pointerup', () => {
  swipeStartX = null;
  swipeTriggered = false;
});

window.addEventListener('pointerdown', () => audio.unlock(), { once: true });

window.addEventListener('resize', () => {
  sceneMgr.resize();
  if (ui.currentScreen === 'title') {
    sceneMgr.renderTitleShowcase(0.016, titleTime);
  } else if (ui.currentScreen === 'garage') {
    sceneMgr.renderGarageShowcase(0.016, garageTime, progress.getEffectiveSkin().trailStyle, garageYawOffset);
  } else if (ui.currentScreen === 'reading' || (ui.currentScreen === 'results' && !race.resultsOrbitMode)) {
    sceneMgr.renderPitStop(0.016, pitTime);
  } else if (ui.currentScreen === 'race' || ui.currentScreen === 'countdown' || ui.currentScreen === 'pause') {
    race.render(0.016, false);
  }
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    lastFrameTs = null;
    audio.pauseAll();
  } else {
    audio.resumeAll();
  }
});

// Required Test Hooks (SPEC section 10 + SPEC-V3 section 5 & 6 + Phase B)
window.__game = {
  state() {
    const isRunScreen = ['countdown', 'race', 'pause', 'results'].includes(ui.currentScreen);
    return {
      screen: ui.currentScreen,
      world: currentWorldId,
      step: currentStep,
      mode: currentMode,
      lane: race.lane,
      speed: Number(race.speed.toFixed(3)),
      coins: ui.currentScreen === 'reading'
        ? progress.coins + reading.coins
        : isRunScreen
          ? race.coins
          : progress.coins,
      combo: race.combo,
      correct: currentStep === 'reading' ? reading.firstTryCorrect : race.correct,
      wrong: race.wrong,
      gatesLeft: currentStep === 'reading' ? Math.max(0, reading.cards.length - reading.cardIndex) : race.getGatesLeft(),
      cardIndex: reading.cardIndex,
      firstTryCorrect: reading.firstTryCorrect,
      position: race.getPosition(),
      nitro: Math.round(race.nitro),
      powerup: race.powerup,
      xp: progress.xp,
      driverLevel: progress.driverLevel,
      dailyStreak: progress.dailyStreak,
      stickers: progress.getStickerCount()
    };
  },
  start(world, stepOrMode, options = {}) {
    stopCountdown();
    rewardsUi.hideDailyGiftModal();
    rewardsUi.hideLevelUpModal();
    const w = world || 1;
    const resolved = resolveStepAndMode(stepOrMode);
    if (resolved.step === 'reading') {
      startReadingTraining(w, true);
      return;
    }
    const boss = Boolean(options && options.boss);
    initRaceState(w, stepOrMode || 'race', boss, false);
    race.paused = false;
    ui.showScreen('race');
    ui.renderPromptCard(race.getNextGate(), currentMode);
    race.render(0.016, true);
    ensureMainLoop();
  },
  card() {
    if (currentStep !== 'reading' || ui.currentScreen !== 'reading') return null;
    return reading.getHookCard();
  },
  answer(i) {
    if (currentStep !== 'reading' || ui.currentScreen !== 'reading') {
      return { correct: false, done: true, correctIndex: -1 };
    }
    return handleReadingAnswer(i, true);
  },
  openChest() {
    const reward = handleOpenChest(true);
    return {
      ...reward,
      state: window.__game.state()
    };
  },
  setToday(dateStr) {
    const info = progress.setToday(dateStr);
    syncTitlePhaseB();
    if (ui.currentScreen === 'title' && !info.alreadyClaimed) {
      rewardsUi.showDailyGiftModal(info);
    }
    return {
      dailyStreak: info.dailyStreak,
      daySlot: info.daySlot,
      alreadyClaimed: info.alreadyClaimed,
      giftCoins: info.gift.coins,
      giftXp: info.gift.xp
    };
  },
  steer(lane) {
    const next = race.steerTo(lane);
    race.render(0.016, false);
    return next;
  },
  target() {
    return race.getTargetInfo();
  },
  sim(seconds) {
    if (!race.active) return;
    race.sim(seconds);
    if (ui.currentScreen === 'race') {
      syncHud();
      ui.renderPromptCard(race.getNextGate(), currentMode);
    }
  },
  nitro() {
    const ok = race.activateNitro();
    if (ui.currentScreen === 'race') syncHud();
    return ok;
  },
  finish() {
    if (currentStep === 'reading') {
      finalizeReadingResults(true);
      return;
    }
    finalizeAndShowResults(true);
  },
  seed(n) {
    race.setSeed(n);
    reading.setSeed(n);
  }
};

// Boot on Title Screen with live 3D rotating car turntable & Daily Streak check
const bootStreak = progress.evaluateDailyStreak();
sceneMgr.setupTitleShowcase(progress.getEffectiveSkin());
ui.showScreen('title');
syncTitlePhaseB();
if (!bootStreak.alreadyClaimed) {
  rewardsUi.showDailyGiftModal(bootStreak);
}
if (phaseBHooks.onTitleReady) phaseBHooks.onTitleReady({ progress, ui, sceneMgr });
ensureMainLoop();
