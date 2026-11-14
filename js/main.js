// Application entry point, screen router, game loop, input bindings, and window.__game test hooks.

import { WORLDS, getWorldById } from './words.js';
import { ProgressStore } from './progress.js';
import { AudioEngine } from './audio.js';
import { RaceEngine } from './race.js';
import { UIController } from './ui.js';

const progress = new ProgressStore();
const audio = new AudioEngine();
audio.syncSettings(progress.settings);

const raceCanvas = document.getElementById('race-canvas');

let currentWorldId = 1;
let currentMode = progress.lastMode || 'picture';
let countdownTimerId = null;
let lastFrameTs = null;
let rafId = null;
let garageReturnScreen = 'title';
let runWordResults = [];
let resultsFinalized = false;

const ui = new UIController({
  progress,
  audio,
  handlers: {
    onOpenTitle: () => {
      stopCountdown();
      stopRaceLoop();
      audio.updateEngine(0, false, false);
      ui.showScreen('title');
    },
    onOpenMap: () => {
      stopCountdown();
      stopRaceLoop();
      audio.updateEngine(0, false, false);
      ui.showScreen('map');
    },
    onOpenGarage: () => {
      garageReturnScreen = ui.currentScreen === 'map' ? 'map' : 'title';
      ui.showScreen('garage');
    },
    onBackFromGarage: () => {
      ui.showScreen(garageReturnScreen || 'title');
    },
    onOpenSettings: () => {
      ui.showScreen('settings');
    },
    onSelectWorld: (worldId) => {
      currentWorldId = Number(worldId);
      ui.showScreen('mode');
    },
    onStartRace: (worldId, mode) => {
      startWithCountdown(worldId, mode);
    },
    onPause: () => {
      if (ui.currentScreen !== 'race') return;
      race.paused = true;
      audio.updateEngine(0, false, false);
      ui.showScreen('pause');
    },
    onResume: () => {
      if (ui.currentScreen !== 'pause') return;
      race.paused = false;
      lastFrameTs = null;
      ui.showScreen('race');
    },
    onRestart: () => {
      startWithCountdown(currentWorldId, currentMode);
    },
    onQuitToMap: () => {
      race.active = false;
      stopRaceLoop();
      audio.updateEngine(0, false, false);
      ui.showScreen('map');
    },
    onSteerDelta: (delta) => {
      if (ui.currentScreen !== 'race') return;
      race.steerStep(delta);
    },
    onPromptTap: () => {
      if (ui.currentScreen !== 'race') return;
      if (currentMode === 'listen') {
        const next = race.getNextGate();
        if (next) audio.speak(next.target.en);
      }
    }
  }
});

const race = new RaceEngine(raceCanvas, {
  onTargetChange: (gate, silent) => {
    ui.renderPromptCard(gate, currentMode);
    if (!silent && gate && currentMode === 'listen') {
      audio.speak(gate.target.en);
    }
  },
  onGateResult: ({ gate, correct, earned, silent }) => {
    progress.updateWordScore(gate.target.id, correct);
    if (correct && earned > 0) {
      progress.addCoins(earned);
    }
    runWordResults.push({ word: gate.target, correct });

    if (!silent) {
      if (correct) {
        audio.playSfx('correct');
        audio.playSfx('coin');
        audio.playSfx('boost');
      } else {
        audio.playSfx('wrong');
      }
      audio.speak(gate.target.en);
    }
    ui.updateRaceHud({
      coins: race.coins,
      combo: race.combo,
      progress: race.getProgressRatio()
    });
  },
  onObstacle: () => {
    audio.playSfx('obstacle');
  },
  onFinishLine: () => {
    audio.playSfx('confetti');
    audio.updateEngine(0, false, false);
  },
  onRunComplete: () => {
    finalizeAndShowResults(false);
  }
});

function stopCountdown() {
  if (countdownTimerId) {
    clearTimeout(countdownTimerId);
    countdownTimerId = null;
  }
}

function stopRaceLoop() {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  lastFrameTs = null;
}

function startRaceLoop() {
  if (rafId) return;
  lastFrameTs = null;
  const tick = (ts) => {
    if (!race.active && ui.currentScreen !== 'race' && ui.currentScreen !== 'countdown') {
      rafId = null;
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
    const dt = Math.min(0.05, Math.max(0, (ts - lastFrameTs) / 1000));
    lastFrameTs = ts;

    if (ui.currentScreen === 'race' && race.active && !race.paused) {
      race.step(dt, false);
      race.render();
      ui.updateRaceHud({
        coins: race.coins,
        combo: race.combo,
        progress: race.getProgressRatio()
      });
      audio.updateEngine(race.speed, !race.finished, race.boostTimer > 0);
    } else if (ui.currentScreen === 'countdown') {
      race.time += dt;
      race.render();
    }

    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);
}

function initRaceState(worldId, mode, silent = false) {
  const world = getWorldById(worldId);
  currentWorldId = world.id;
  ui.selectedLevel = world.level;
  currentMode = mode || progress.lastMode || 'picture';
  runWordResults = [];
  resultsFinalized = false;

  race.resize();
  race.startRun({
    worldId: currentWorldId,
    mode: currentMode,
    skin: progress.getSelectedSkin(),
    wordScores: progress.data.wordScores,
    lastMissed: progress.getLastMissed(currentWorldId)
  });

  ui.updateRaceHud({ coins: 0, combo: 0, progress: 0 });
  if (silent) {
    ui.renderPromptCard(race.getNextGate(), currentMode);
  }
}

function startWithCountdown(worldId, mode) {
  stopCountdown();
  stopRaceLoop();
  initRaceState(worldId, mode, true);
  race.paused = true;
  ui.showScreen('countdown');
  startRaceLoop();

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
        if (next && currentMode === 'listen') {
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
  stopRaceLoop();
  audio.updateEngine(0, false, false);

  const totalAnswered = race.correct + race.wrong;
  const totalGates = race.gates.length || 1;
  const ratio = totalAnswered > 0 ? race.correct / totalGates : 0;

  let stars = 1;
  if (ratio >= 0.9) stars = 3;
  else if (ratio >= 0.7) stars = 2;

  const prevUnlocked = new Set(
    WORLDS.filter((w) => progress.isWorldUnlocked(w.id)).map((w) => w.id)
  );

  const missedIds = runWordResults.filter((r) => !r.correct).map((r) => r.word.id);
  progress.recordRunResult({
    worldId: currentWorldId,
    stars,
    missedIds
  });

  const newlyUnlockedWorld =
    WORLDS.find((w) => !prevUnlocked.has(w.id) && progress.isWorldUnlocked(w.id)) || null;

  // Ensure every gate word is represented on Results even if finish() was called early
  const seenIds = new Set(runWordResults.map((r) => r.word.id));
  for (const g of race.gates) {
    if (!seenIds.has(g.target.id)) {
      runWordResults.push({ word: g.target, correct: g.result === 'correct' });
    }
  }

  ui.renderResults({
    stars,
    coinsEarned: race.coins,
    correct: race.correct,
    total: race.gates.length,
    wordResults: runWordResults,
    newlyUnlockedWorld
  });
  ui.showScreen('results');

  if (!silent) {
    for (let i = 0; i < stars; i++) {
      setTimeout(() => audio.playSfx('star'), i * 220);
    }
  }
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
    } else if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
      e.preventDefault();
      race.paused = true;
      audio.updateEngine(0, false, false);
      ui.showScreen('pause');
    }
  } else if (ui.currentScreen === 'pause' && (e.key === 'Escape' || e.key === 'p' || e.key === 'P')) {
    e.preventDefault();
    race.paused = false;
    lastFrameTs = null;
    ui.showScreen('race');
  }
});

// Touch swipe steering on race canvas
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

// Unlock audio on first gesture anywhere
window.addEventListener('pointerdown', () => audio.unlock(), { once: true });

// Resize handling
window.addEventListener('resize', () => {
  race.resize();
  if (ui.currentScreen === 'race' || ui.currentScreen === 'countdown' || ui.currentScreen === 'pause') {
    race.render();
  }
});

// Pause loop & audio cleanly when tab is hidden
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    lastFrameTs = null;
    audio.pauseAll();
  } else {
    audio.resumeAll();
  }
});

// Required test hooks (Section 10)
window.__game = {
  state() {
    const isRunScreen = ['countdown', 'race', 'pause', 'results'].includes(ui.currentScreen);
    return {
      screen: ui.currentScreen,
      world: currentWorldId,
      mode: currentMode,
      lane: race.lane,
      speed: Number(race.speed.toFixed(3)),
      coins: isRunScreen ? race.coins : progress.coins,
      combo: race.combo,
      correct: race.correct,
      wrong: race.wrong,
      gatesLeft: race.getGatesLeft()
    };
  },
  start(world, mode) {
    stopCountdown();
    stopRaceLoop();
    const w = world || 1;
    const m = mode || 'picture';
    initRaceState(w, m, false);
    race.paused = false;
    ui.showScreen('race');
    ui.renderPromptCard(race.getNextGate(), currentMode);
    race.render();
    startRaceLoop();
  },
  steer(lane) {
    const next = race.steerTo(lane);
    race.render();
    return next;
  },
  target() {
    return race.getTargetInfo();
  },
  sim(seconds) {
    if (!race.active) return;
    race.sim(seconds);
    if (ui.currentScreen === 'race') {
      ui.updateRaceHud({
        coins: race.coins,
        combo: race.combo,
        progress: race.getProgressRatio()
      });
      ui.renderPromptCard(race.getNextGate(), currentMode);
    }
  },
  finish() {
    finalizeAndShowResults(true);
  },
  seed(n) {
    race.setSeed(n);
  }
};

// Boot on Title screen
ui.showScreen('title');
