// Core 3D Race Engine: deterministic physics & sim, rival & boss AI, nitro, combo x2/x3/x5,
// road coins, jump ramps, power-ups, near-miss detection, and Three.js scene integration.

import * as THREE from 'three';
import { getWordsByWorld, pickRunWords, pickDistractors, createRng } from '../../js/words.js';
import { getWorld3DTheme, buildWorldProps } from './worlds3d.js';
import { TrackBuilder, WeatherSystem } from './track.js';
import { Car3D } from './car.js';
import { GateManager3D } from './gates.js';
import { PickupManager3D, getPowerupMeta } from './pickups.js';
import { EffectsManager3D } from './effects.js';

const GATE_COUNT = 18;
const GATE_SPACING = 4.3;
const FIRST_GATE_DIST = 4.8;
const FINISH_BUFFER = 3.2;
const METERS_PER_UNIT = 13.5;
const FIXED_DT = 1 / 60;

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function pickBossDistractors(targetWord, worldWords, rng) {
  const base = pickDistractors(targetWord, worldWords, rng, 6);
  if (base.length <= 2) return base;
  // Prefer words with similar length or matching initial letter (still conflict-free from pickDistractors)
  const sorted = base.slice().sort((a, b) => {
    const scoreA =
      (a.en[0].toLowerCase() === targetWord.en[0].toLowerCase() ? -2 : 0) +
      Math.abs(a.en.length - targetWord.en.length) * 0.4;
    const scoreB =
      (b.en[0].toLowerCase() === targetWord.en[0].toLowerCase() ? -2 : 0) +
      Math.abs(b.en.length - targetWord.en.length) * 0.4;
    return scoreA - scoreB;
  });
  return sorted.slice(0, 2);
}

export class RaceEngine3D {
  constructor(sceneManager, callbacks = {}) {
    this.sceneMgr = sceneManager;
    this.callbacks = callbacks;

    this.seedValue = null;
    this.rng = Math.random;

    this.active = false;
    this.paused = false;
    this.finished = false;
    this.resultsOrbitMode = false;

    this.worldId = 1;
    this.runStep = 'race';
    this.mode = 'picture';
    this.isBossRace = false;
    this.worldTheme = getWorld3DTheme(1);

    this.lane = 1;
    this.laneFrom = 1;
    this.visualLane = 1;
    this.laneLerpT = 1;

    this.distance = 0;
    this.finishDist = FIRST_GATE_DIST + GATE_COUNT * GATE_SPACING + FINISH_BUFFER;
    this.speed = 1.0;
    this.time = 0;

    // Gameplay stats & timers
    this.coins = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.correct = 0;
    this.wrong = 0;
    this.nitro = 0; // 0..100
    this.nitroTimer = 0;
    this.boostTimer = 0;
    this.rampBoostTimer = 0;
    this.wobbleTimer = 0;
    this.obstacleSlowTimer = 0;
    this.shakeTimer = 0;
    this.shakeIntensity = 0;
    this.jumpTimer = 0;
    this.jumpDuration = 0.95;

    // Power-up (one at a time)
    this.powerup = null; // 'magnet' | 'shield' | 'slowmo' | 'double' | null
    this.powerupTimer = 0;
    this.powerupMaxDuration = 1;

    // Rival / Boss
    this.rivalDistance = 0.08;
    this.rivalLane = 0;
    this.rivalVisualLane = 0;
    this.rivalSpeed = 1.0;
    this.rivalBoostTimer = 0;
    this.wasBehindRival = false;
    this.overtakeCooldown = 0;
    this.overtakeSlowMoTimer = 0;
    this.finishPosition = 1;

    // Entities
    this.gates = [];
    this.coinsList = [];
    this.ramps = [];
    this.powerups = [];
    this.obstacles = [];
    this.currentTargetId = null;

    // 3D sub-managers
    this.track = null;
    this.weather = null;
    this.playerCar = null;
    this.rivalCar = null;
    this.gateMgr = null;
    this.pickupMgr = null;
    this.effectsMgr = null;
    this.finishCelebration = 0;
  }

  setSeed(n) {
    this.seedValue = n === null || n === undefined ? null : Number(n);
  }

  startRun({ worldId, step = 'race', mode, skin, wordScores = {}, lastMissed = [], boss = false }) {
    this.rng = createRng(this.seedValue);
    this.worldId = Number(worldId) || 1;
    this.runStep = step === 'listen' ? 'listen' : 'race';
    this.mode = mode || (this.runStep === 'listen' ? 'listen' : 'picture');
    this.isBossRace = Boolean(boss) && this.runStep === 'race';
    this.worldTheme = getWorld3DTheme(this.worldId);

    this.active = true;
    this.paused = false;
    this.finished = false;
    this.resultsOrbitMode = false;

    this.lane = 1;
    this.laneFrom = 1;
    this.visualLane = 1;
    this.laneLerpT = 1;

    this.distance = 0;
    this.speed = 1.0;
    this.time = 0;

    this.coins = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.correct = 0;
    this.wrong = 0;
    this.nitro = 0;
    this.nitroTimer = 0;
    this.boostTimer = 0;
    this.rampBoostTimer = 0;
    this.wobbleTimer = 0;
    this.obstacleSlowTimer = 0;
    this.shakeTimer = 0;
    this.shakeIntensity = 0;
    this.jumpTimer = 0;

    this.powerup = null;
    this.powerupTimer = 0;
    this.powerupMaxDuration = 1;

    this.rivalDistance = 0.05;
    this.rivalLane = 0;
    this.rivalVisualLane = 0;
    this.rivalSpeed = this.isBossRace ? 1.15 : 1.04;
    this.rivalBoostTimer = 0;
    this.wasBehindRival = false;
    this.overtakeCooldown = 0;
    this.overtakeSlowMoTimer = 0;
    this.finishPosition = 1;

    this.currentTargetId = null;
    this.finishCelebration = 0;

    this._generateEntities(wordScores, lastMissed);
    this._build3DWorld(skin);
    this._notifyTargetChange(true);
  }

  _generateEntities(wordScores, lastMissed) {
    const worldWords = getWordsByWorld(this.worldId);
    // Use 'listen' pool selection so words with emoji: null are included in Step 1 and Step 3
    const chosenWords = pickRunWords(
      this.worldId,
      wordScores,
      lastMissed,
      this.rng,
      GATE_COUNT,
      this.runStep === 'listen' || this.runStep === 'race' ? 'listen' : this.mode
    );

    this.gates = [];
    for (let i = 0; i < chosenWords.length; i++) {
      const target = chosenWords[i];
      const distractors = this.isBossRace
        ? pickBossDistractors(target, worldWords, this.rng)
        : pickDistractors(target, worldWords, this.rng, 2);

      const correctLane = Math.floor(this.rng() * 3);
      const lanes = [null, null, null];
      lanes[correctLane] = target;
      let dIdx = 0;
      for (let l = 0; l < 3; l++) {
        if (!lanes[l]) {
          lanes[l] = distractors[dIdx % Math.max(1, distractors.length)] || target;
          dIdx++;
        }
      }

      this.gates.push({
        index: i,
        dist: FIRST_GATE_DIST + i * GATE_SPACING,
        target,
        lanes,
        correctLane,
        passed: false,
        chosenLane: null,
        result: null
      });
    }

    const lastGateDist = this.gates.length
      ? this.gates[this.gates.length - 1].dist
      : FIRST_GATE_DIST + GATE_COUNT * GATE_SPACING;
    this.finishDist = lastGateDist + FINISH_BUFFER;

    // Generate road coins, ramps, power-ups & obstacles cleanly between gate rows
    this.coinsList = [];
    this.ramps = [];
    this.powerups = [];
    this.obstacles = [];

    const powerupTypes = ['magnet', 'shield', 'slowmo', 'double'];
    let lastCoinLane = 1;

    for (let i = 0; i < this.gates.length; i++) {
      const gapStart = i === 0 ? 1.5 : this.gates[i - 1].dist + 1.05;
      const gapEnd = this.gates[i].dist - 1.15;
      const midDist = (gapStart + gapEnd) * 0.5;
      if (gapEnd <= gapStart) continue;

      // Coin line in most gaps
      if (i % 2 === 0 || this.rng() < 0.7) {
        const coinLane = Math.floor(this.rng() * 3);
        lastCoinLane = coinLane;
        const count = 3 + Math.floor(this.rng() * 2);
        for (let c = 0; c < count; c++) {
          const cd = gapStart + ((gapEnd - gapStart) * (c + 0.5)) / count;
          this.coinsList.push({ dist: cd, lane: coinLane, collected: false });
        }
      }

      // Occasional Ramp (gaps 2, 6, 11, 15)
      if (i === 2 || i === 6 || i === 11 || i === 15) {
        const rampLane = (lastCoinLane + 1) % 3;
        this.ramps.push({ dist: midDist, lane: rampLane, triggered: false });
        continue;
      }

      // Occasional Power-up (gaps 4, 8, 12, 16)
      if (i === 4 || i === 8 || i === 12 || i === 16) {
        const pLane = (lastCoinLane + 2) % 3;
        const pType = powerupTypes[(i / 4 - 1) % powerupTypes.length];
        this.powerups.push({ dist: midDist, lane: pLane, type: pType, collected: false });
        continue;
      }

      // Obstacles in other gaps (light in world 1, regular from world 2+)
      const spawnObs = this.worldId >= 2 ? i >= 1 : i >= 5 && i % 2 === 1;
      if (spawnObs && this.rng() < 0.72) {
        const obsLane = (lastCoinLane + 1 + Math.floor(this.rng() * 2)) % 3;
        this.obstacles.push({
          dist: midDist,
          lane: obsLane,
          hit: false,
          nearMissChecked: false
        });
      }
    }
  }

  _build3DWorld(skin) {
    this.sceneMgr.prepareRaceScene(this.worldTheme);
    this.sceneMgr.clearWorld();

    const finishMeters = this.finishDist * METERS_PER_UNIT;
    this.track = new TrackBuilder(this.worldTheme, finishMeters);

    this.sceneMgr.worldGroup.add(this.track.buildSkyDome());
    this.sceneMgr.worldGroup.add(this.track.buildRoadGroup());
    this.sceneMgr.worldGroup.add(
      buildWorldProps(this.worldTheme, this.track, finishMeters, this.rng)
    );

    const weatherCount = this.sceneMgr.quality === 'high' ? 240 : this.sceneMgr.quality === 'medium' ? 140 : 75;
    this.weather = new WeatherSystem(this.worldTheme.weather, weatherCount);
    this.sceneMgr.worldGroup.add(this.weather.group);

    // Player 3D Car
    this.playerCar = new Car3D(skin, { isRival: false });
    this.sceneMgr.worldGroup.add(this.playerCar.root);

    // Rival or Boss 3D Car
    const rivalSkin = this.isBossRace
      ? {
          bodyColor: '#7c3aed',
          shadeColor: '#3b0764',
          accentColor: '#facc15',
          windowColor: '#f43f5e',
          stripeColor: '#fde047',
          spoiler: true
        }
      : {
          bodyColor: '#0ea5e9',
          shadeColor: '#0369a1',
          accentColor: '#fde047',
          windowColor: '#e0f2fe',
          stripeColor: '#ffffff',
          spoiler: true
        };

    this.rivalCar = new Car3D(rivalSkin, {
      isRival: true,
      isBoss: this.isBossRace,
      badgeEmoji: this.isBossRace ? this.worldTheme.bossEmoji : this.worldTheme.rivalEmoji,
      badgeName: this.isBossRace ? this.worldTheme.bossName : this.worldTheme.rivalName
    });
    this.sceneMgr.worldGroup.add(this.rivalCar.root);

    // Gates, Pickups, Effects
    const signMode = this.runStep === 'listen' ? 'picture' : 'word';
    this.gateMgr = new GateManager3D(this.sceneMgr.worldGroup, this.track, this.worldTheme);
    this.gateMgr.buildGates(this.gates, METERS_PER_UNIT, signMode);

    this.pickupMgr = new PickupManager3D(this.sceneMgr.worldGroup, this.track, this.worldTheme);
    this.pickupMgr.buildAll(
      {
        coins: this.coinsList,
        ramps: this.ramps,
        powerups: this.powerups,
        obstacles: this.obstacles
      },
      METERS_PER_UNIT
    );

    this.effectsMgr = new EffectsManager3D(this.sceneMgr.worldGroup);

    this._syncCarTransforms(0, true);
  }

  getComboMultiplier() {
    if (this.combo >= 6) return 5;
    if (this.combo >= 4) return 3;
    if (this.combo >= 2) return 2;
    return 1;
  }

  getPosition() {
    if (this.finished) return this.finishPosition;
    return this.distance >= this.rivalDistance ? 1 : 2;
  }

  getGatesLeft() {
    return this.gates.filter((g) => !g.passed).length;
  }

  getNextGate() {
    return this.gates.find((g) => !g.passed) || null;
  }

  getTargetInfo() {
    const next = this.getNextGate();
    if (!next) return null;
    return {
      word: next.target.en,
      correctLane: next.correctLane
    };
  }

  getProgressRatio() {
    return clamp(this.distance / this.finishDist, 0, 1);
  }

  getRivalProgressRatio() {
    return clamp(this.rivalDistance / this.finishDist, 0, 1);
  }

  steerStep(delta) {
    if (!this.active || this.paused || this.finished) return this.lane;
    return this.steerTo(this.lane + delta);
  }

  steerTo(targetLane) {
    const clamped = clamp(Math.round(Number(targetLane)), 0, 2);
    if (clamped !== this.lane) {
      this.laneFrom = this.visualLane;
      this.lane = clamped;
      this.laneLerpT = 0;
    }
    return this.lane;
  }

  activateNitro() {
    if (!this.active || this.paused || this.finished) return false;
    if (this.nitro < 100 || this.nitroTimer > 0) return false;

    this.nitro = 0;
    this.nitroTimer = 3.0;
    this.shakeTimer = 0.45;
    this.shakeIntensity = 0.7;

    if (this.callbacks.onNitroStart) {
      this.callbacks.onNitroStart();
    }
    return true;
  }

  _notifyTargetChange(silent) {
    const next = this.getNextGate();
    const nextId = next ? next.index : null;
    if (nextId !== this.currentTargetId) {
      this.currentTargetId = nextId;
      if (this.callbacks.onTargetChange) {
        this.callbacks.onTargetChange(next, silent);
      }
    }
  }

  sim(seconds) {
    const total = Math.max(0, Number(seconds) || 0);
    const steps = Math.floor(total / FIXED_DT);
    const rem = total - steps * FIXED_DT;

    for (let i = 0; i < steps; i++) {
      this.step(FIXED_DT, true);
    }
    if (rem > 0.0001) {
      this.step(rem, true);
    }
    this.render(0.016, true);
  }

  step(rawDt, isSim = false) {
    if (!this.active || this.paused) return;

    // Brief cinematic slow-motion beat on overtaking the rival
    let dt = rawDt;
    if (this.overtakeSlowMoTimer > 0) {
      this.overtakeSlowMoTimer = Math.max(0, this.overtakeSlowMoTimer - rawDt);
      if (!isSim) {
        dt = rawDt * 0.38;
      }
    }

    this.time += dt;

    // Smooth lane transition (~140ms ease)
    if (this.laneLerpT < 1) {
      this.laneLerpT = Math.min(1, this.laneLerpT + dt / 0.14);
      const eased = 1 - Math.pow(1 - this.laneLerpT, 3);
      this.visualLane = lerp(this.laneFrom, this.lane, eased);
    } else {
      this.visualLane = this.lane;
    }

    // Timers
    if (this.boostTimer > 0) this.boostTimer = Math.max(0, this.boostTimer - dt);
    if (this.rampBoostTimer > 0) this.rampBoostTimer = Math.max(0, this.rampBoostTimer - dt);
    if (this.wobbleTimer > 0) this.wobbleTimer = Math.max(0, this.wobbleTimer - dt);
    if (this.obstacleSlowTimer > 0) this.obstacleSlowTimer = Math.max(0, this.obstacleSlowTimer - dt);
    if (this.shakeTimer > 0) this.shakeTimer = Math.max(0, this.shakeTimer - dt);
    if (this.overtakeCooldown > 0) this.overtakeCooldown = Math.max(0, this.overtakeCooldown - dt);

    const wasNitro = this.nitroTimer > 0;
    if (this.nitroTimer > 0) {
      this.nitroTimer = Math.max(0, this.nitroTimer - dt);
      if (wasNitro && this.nitroTimer === 0 && this.callbacks.onNitroEnd) {
        this.callbacks.onNitroEnd();
      }
    }

    if (this.jumpTimer > 0) {
      this.jumpTimer = Math.max(0, this.jumpTimer - dt);
      if (this.jumpTimer === 0) {
        // Landed from ramp jump -> small boost + bonus coins!
        this.rampBoostTimer = 1.25;
        const jumpCoins = this.powerup === 'double' ? 30 : 15;
        this.coins += jumpCoins;
        if (!isSim && this.callbacks.onRampLand) {
          this.callbacks.onRampLand(jumpCoins);
        }
      }
    }

    if (this.powerup && this.powerupTimer > 0) {
      this.powerupTimer = Math.max(0, this.powerupTimer - dt);
      if (this.powerupTimer === 0) {
        this.powerup = null;
      }
    }

    // Speed calculation
    const progress = this.getProgressRatio();
    const baseSpeed = 1.0 + progress * 0.28;
    let speedMult = 1.0;
    if (this.nitroTimer > 0) speedMult *= 1.65;
    else if (this.boostTimer > 0 || this.rampBoostTimer > 0) speedMult *= 1.25;
    if (this.wobbleTimer > 0) speedMult *= 0.52;
    if (this.obstacleSlowTimer > 0) speedMult *= 0.65;
    if (this.powerup === 'slowmo' && this.nitroTimer <= 0) speedMult *= 0.68;

    this.speed = this.finished ? Math.max(0.2, this.speed * (1 - dt * 2.4)) : baseSpeed * speedMult;
    this.distance += this.speed * dt;

    // Update Rival / Boss AI
    this._stepRival(dt);

    // Overtake detection (2nd -> 1st after race start)
    const curPos = this.distance >= this.rivalDistance ? 1 : 2;
    if (this.distance > 2.2) {
      if (this.wasBehindRival && curPos === 1 && this.overtakeCooldown <= 0 && !this.finished) {
        this.overtakeCooldown = 3.0;
        this.overtakeSlowMoTimer = 0.35;
        if (!isSim && this.callbacks.onOvertake) {
          this.callbacks.onOvertake();
        }
      }
      this.wasBehindRival = curPos === 2;
    }

    // Check gate crossings
    for (const gate of this.gates) {
      if (!gate.passed && this.distance >= gate.dist) {
        gate.passed = true;
        gate.chosenLane = this.lane;

        if (this.lane === gate.correctLane) {
          this._handleCorrectGate(gate, isSim);
        } else {
          this._handleWrongGate(gate, isSim);
        }
        this._notifyTargetChange(isSim);
      }
    }

    // Check road coins (Magnet pulls across all 3 lanes!)
    const magnetOn = this.powerup === 'magnet';
    for (const c of this.coinsList) {
      if (c.collected) continue;
      const dz = c.dist - this.distance;
      const hitDist = magnetOn ? 0.38 : 0.24;
      const laneMatch = magnetOn ? Math.abs(dz) < hitDist : Math.abs(dz) < hitDist && Math.abs(this.visualLane - c.lane) < 0.55;
      if (laneMatch) {
        c.collected = true;
        const val = this.powerup === 'double' ? 4 : 2;
        this.coins += val;
        if (!isSim && this.callbacks.onCoinPickup) {
          this.callbacks.onCoinPickup(val);
        }
        if (!isSim && this.effectsMgr && this.track) {
          const p = this.track.getLanePosition(this.distance * METERS_PER_UNIT, this.visualLane, 0.9);
          this.effectsMgr.spawnBurst(p, 0xfacc15, 8);
        }
      }
    }

    // Check Ramps
    for (const r of this.ramps) {
      if (!r.triggered && Math.abs(this.distance - r.dist) < 0.24 && this.lane === r.lane && this.jumpTimer <= 0) {
        r.triggered = true;
        this.jumpTimer = this.jumpDuration;
        if (!isSim && this.callbacks.onJump) {
          this.callbacks.onJump();
        }
      }
    }

    // Check Power-ups (one at a time)
    for (const p of this.powerups) {
      if (!p.collected && Math.abs(this.distance - p.dist) < 0.28 && Math.abs(this.visualLane - p.lane) < 0.6) {
        p.collected = true;
        const meta = getPowerupMeta(p.type);
        this.powerup = p.type;
        this.powerupTimer = meta ? meta.duration : 7;
        this.powerupMaxDuration = this.powerupTimer;
        if (!isSim && this.callbacks.onPowerup) {
          this.callbacks.onPowerup(p.type, meta);
        }
        if (!isSim && this.effectsMgr && this.track && meta) {
          const pos = this.track.getLanePosition(this.distance * METERS_PER_UNIT, this.visualLane, 1.1);
          this.effectsMgr.spawnBurst(pos, meta.color, 18);
        }
      }
    }

    // Check Obstacles & Near-Miss rewards
    for (const obs of this.obstacles) {
      if (obs.hit) continue;
      const distDiff = this.distance - obs.dist;

      if (Math.abs(distDiff) < 0.2 && this.lane === obs.lane) {
        obs.hit = true;
        obs.nearMissChecked = true;
        if (this.jumpTimer > 0 || this.nitroTimer > 0) {
          // Jump over or blast right through during Nitro!
          if (!isSim && this.effectsMgr && this.track) {
            const pos = this.track.getLanePosition(obs.dist * METERS_PER_UNIT, obs.lane, 0.8);
            this.effectsMgr.spawnBurst(pos, 0x22d3ee, 14);
          }
        } else if (this.powerup === 'shield') {
          this.powerup = null;
          this.powerupTimer = 0;
          if (!isSim && this.callbacks.onShieldAbsorb) {
            this.callbacks.onShieldAbsorb();
          }
        } else {
          this.obstacleSlowTimer = 0.45;
          this.shakeTimer = 0.25;
          this.shakeIntensity = 0.7;
          if (!isSim && this.callbacks.onObstacle) {
            this.callbacks.onObstacle();
          }
        }
      } else if (!obs.nearMissChecked && distDiff > 0.14 && distDiff < 0.45) {
        obs.nearMissChecked = true;
        if (Math.abs(this.lane - obs.lane) === 1) {
          const bonus = this.powerup === 'double' ? 10 : 5;
          this.coins += bonus;
          if (!isSim && this.callbacks.onNearMiss) {
            this.callbacks.onNearMiss(bonus);
          }
        }
      }
    }

    // Update 3D particles/effects (skip visual emissions during sim)
    if (!isSim && this.effectsMgr && this.track) {
      const carPos = this.track.getLanePosition(this.distance * METERS_PER_UNIT, this.visualLane, 0);
      const frame = this.track.getFrame(this.distance * METERS_PER_UNIT);
      const isBoosted = this.boostTimer > 0 || this.rampBoostTimer > 0;
      const trailStyle = this.playerCar?.skin?.trailStyle || 'standard';
      this.effectsMgr.emitFireTrail(
        dt,
        carPos,
        frame.forward,
        this.nitroTimer > 0,
        this.getComboMultiplier(),
        isBoosted,
        trailStyle
      );
      this.effectsMgr.update(dt);
    }

    // Check Finish Line
    if (!this.finished && this.distance >= this.finishDist) {
      this.finished = true;
      this.finishPosition = this.distance >= this.rivalDistance ? 1 : 2;
      this.finishCelebration = 1.45;
      if (!isSim && this.effectsMgr && this.track) {
        const finPos = this.track.getLanePosition(this.finishDist * METERS_PER_UNIT, this.visualLane, 2.5);
        this.effectsMgr.spawnConfetti(finPos, 65);
        if (this.isBossRace && this.finishPosition === 1) {
          const podiumPos = this.track.getLanePosition((this.finishDist + 1.1) * METERS_PER_UNIT, 1, 0);
          const f = this.track.getFrame((this.finishDist + 1.1) * METERS_PER_UNIT);
          this.sceneMgr.showBossTrophy(podiumPos, f.yaw);
        }
      }
      if (!isSim && this.callbacks.onFinishLine) {
        this.callbacks.onFinishLine(this.finishPosition);
      }
    }

    if (this.finished) {
      this.finishCelebration -= dt;
      if (this.finishCelebration <= 0) {
        this.active = false;
        this.resultsOrbitMode = true;
        if (this.callbacks.onRunComplete) {
          this.callbacks.onRunComplete();
        }
      }
    }
  }

  _stepRival(dt) {
    if (this.finished) return;
    if (this.rivalBoostTimer > 0) this.rivalBoostTimer = Math.max(0, this.rivalBoostTimer - dt);

    // Look ahead for next gate or obstacle so rival steers realistically
    const nextObs = this.obstacles.find((o) => !o.hit && o.dist > this.rivalDistance && o.dist - this.rivalDistance < 1.2);
    const nextGate = this.gates.find((g) => g.dist > this.rivalDistance && g.dist - this.rivalDistance < 2.2);

    let desiredLane = this.rivalLane;
    if (nextObs && nextObs.lane === this.rivalLane) {
      desiredLane = (this.rivalLane + 1) % 3;
    } else if (nextGate) {
      desiredLane = nextGate.correctLane;
    }
    this.rivalLane = desiredLane;
    this.rivalVisualLane = lerp(this.rivalVisualLane, this.rivalLane, Math.min(1, dt * 6));

    // Gentle pacing + rubber-banding so race always feels tense and exciting
    const progress = clamp(this.rivalDistance / this.finishDist, 0, 1);
    const baseRival = (this.isBossRace ? 1.14 : 1.03) + progress * 0.25;
    const gap = this.distance - this.rivalDistance; // positive if player ahead
    const rubber = this.isBossRace
      ? clamp(gap * 0.055, -0.06, 0.14)
      : clamp(gap * 0.045, -0.1, 0.09);

    this.rivalSpeed = baseRival + rubber + (this.rivalBoostTimer > 0 ? 0.12 : 0);
    this.rivalDistance += this.rivalSpeed * dt;
  }

  _handleCorrectGate(gate, isSim) {
    this.combo += 1;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    this.correct += 1;

    const multiplier = this.getComboMultiplier();
    const doubleMult = this.powerup === 'double' ? 2 : 1;
    const earned = 10 * multiplier * doubleMult;
    this.coins += earned;
    this.boostTimer = 2.0;
    this.nitro = Math.min(100, this.nitro + 25);
    gate.result = 'correct';

    if (!isSim && this.gateMgr && this.effectsMgr && this.track) {
      this.gateMgr.triggerGateResult(gate, true, this.lane);
      const gPos = this.track.getLanePosition(gate.dist * METERS_PER_UNIT, this.lane, 2.8);
      this.effectsMgr.spawnConfetti(gPos, 44);
    }

    if (this.callbacks.onGateResult) {
      this.callbacks.onGateResult({
        gate,
        correct: true,
        earned,
        combo: this.combo,
        multiplier,
        nitro: this.nitro,
        silent: isSim
      });
    }
  }

  _handleWrongGate(gate, isSim) {
    const shielded = this.powerup === 'shield';
    if (shielded) {
      this.powerup = null;
      this.powerupTimer = 0;
    } else {
      this.combo = 0;
      this.wobbleTimer = 0.6;
      this.boostTimer = 0;
      this.shakeTimer = 0.35;
      this.shakeIntensity = 0.85;
    }

    this.wrong += 1;
    gate.result = 'wrong';

    if (!isSim && this.gateMgr) {
      this.gateMgr.triggerGateResult(gate, false, this.lane);
    }

    if (this.callbacks.onGateResult) {
      this.callbacks.onGateResult({
        gate,
        correct: false,
        earned: 0,
        combo: this.combo,
        multiplier: this.getComboMultiplier(),
        shielded,
        silent: isSim
      });
    }
  }

  _syncCarTransforms(dt, snap = false) {
    if (!this.track || !this.playerCar || !this.rivalCar) return;

    const playerMeters = this.distance * METERS_PER_UNIT;
    const pFrame = this.track.getFrame(playerMeters);
    const pPos = this.track.getLanePosition(playerMeters, this.visualLane, 0);
    this.playerCar.root.position.copy(pPos);
    this.playerCar.root.rotation.set(pFrame.pitch, pFrame.yaw, 0, 'YXZ');

    const jumpProgress = this.jumpTimer > 0 ? 1 - this.jumpTimer / this.jumpDuration : 0;
    this.playerCar.updateVisuals(dt, {
      speed: this.speed,
      time: this.time,
      steerDelta: this.lane - this.visualLane,
      boosted: this.boostTimer > 0 || this.rampBoostTimer > 0,
      nitro: this.nitroTimer > 0,
      wobbleTimer: this.wobbleTimer,
      jumpAirT: jumpProgress,
      powerup: this.powerup
    });

    const rivalMeters = this.rivalDistance * METERS_PER_UNIT;
    const rFrame = this.track.getFrame(rivalMeters);
    const rPos = this.track.getLanePosition(rivalMeters, this.rivalVisualLane, 0);
    this.rivalCar.root.position.copy(rPos);
    this.rivalCar.root.rotation.set(rFrame.pitch, rFrame.yaw, 0, 'YXZ');
    this.rivalCar.updateVisuals(dt, {
      speed: this.rivalSpeed,
      time: this.time,
      steerDelta: this.rivalLane - this.rivalVisualLane,
      boosted: this.isBossRace || this.rivalBoostTimer > 0
    });

    if (this.gateMgr) this.gateMgr.update(dt, playerMeters);
    if (this.pickupMgr) this.pickupMgr.update(dt, this.time, playerMeters, pPos, this.powerup === 'magnet');
    if (this.weather) this.weather.update(dt, pPos, this.time);

    if (this.resultsOrbitMode) {
      this.effectsMgr.update(dt);
    }

    const camMode = this.resultsOrbitMode
      ? 'results'
      : this.finished
        ? 'finish'
        : this.paused && this.distance === 0
          ? 'countdown'
          : 'race';

    this.sceneMgr.updateRaceCamera(dt, {
      mode: camMode,
      track: this.track,
      playerS: playerMeters,
      playerLaneFloat: this.visualLane,
      steerDelta: this.lane - this.visualLane,
      boosted: this.boostTimer > 0 || this.rampBoostTimer > 0,
      nitro: this.nitroTimer > 0,
      slowmo: this.powerup === 'slowmo' || this.overtakeSlowMoTimer > 0,
      shakeIntensity: this.shakeTimer > 0 ? this.shakeIntensity : 0,
      time: this.time,
      snap
    });

    if (this.rivalCar) {
      const aspect = this.sceneMgr.height > 0 ? this.sceneMgr.width / this.sceneMgr.height : 1.5;
      this.rivalCar.clampBadgeToViewport(this.sceneMgr.camera, aspect, this.sceneMgr.width);
    }
  }

  render(dt = 0.016, snapCamera = false) {
    this._syncCarTransforms(dt, snapCamera);
    const boostOrNitro = this.nitroTimer > 0 || this.boostTimer > 0 || this.rampBoostTimer > 0;
    this.sceneMgr.renderWorld(this.worldTheme, boostOrNitro);
  }
}
