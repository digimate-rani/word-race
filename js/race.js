// Pseudo-3D arcade race engine: road, scenery props, gates, obstacles, car, particles, and deterministic sim.

import { getWorldById, getWordsByWorld, pickRunWords, pickDistractors, createRng } from './words.js';

const GATE_COUNT = 18;
const GATE_SPACING = 4.3;
const HORIZON_Z = 4.3;
const FINISH_BUFFER = 3.2;
const FIXED_DT = 1 / 60;

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function roundRectPath(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w * 0.5, h * 0.5);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Shared cartoon car renderer used both during the race and in Title / Garage previews.
 */
export function drawCartoonCar(ctx, x, y, scale, skin, options = {}) {
  const {
    roll = 0,
    bounce = 0,
    spin = 0,
    boosted = false,
    time = 0,
    brakeGlow = false
  } = options;

  ctx.save();
  ctx.translate(x, y + bounce);
  ctx.scale(scale, scale);

  // Ground shadow
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.34)';
  ctx.beginPath();
  ctx.ellipse(0, 26, 62, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.rotate(roll + spin);

  // Boost exhaust flames
  if (boosted) {
    const flicker = Math.sin(time * 48) * 6;
    for (const ex of [-24, 24]) {
      ctx.save();
      const grad = ctx.createRadialGradient(ex, 26, 2, ex, 38 + flicker * 0.4, 26);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.35, '#fde047');
      grad.addColorStop(0.75, '#f97316');
      grad.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(ex - 11, 20);
      ctx.quadraticCurveTo(ex, 58 + flicker, ex + 11, 20);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  // Tires
  ctx.fillStyle = '#0f172a';
  roundRectPath(ctx, -58, -4, 20, 32, 7);
  ctx.fill();
  roundRectPath(ctx, 38, -4, 20, 32, 7);
  ctx.fill();

  // Tire tread shine
  ctx.fillStyle = '#334155';
  const treadOffset = ((time * 24) % 8);
  for (let ty = 0; ty < 22; ty += 8) {
    ctx.fillRect(-54, -1 + ((ty + treadOffset) % 24), 12, 3);
    ctx.fillRect(42, -1 + ((ty + treadOffset) % 24), 12, 3);
  }

  // Lower chassis / bumper
  ctx.fillStyle = skin.shadeColor;
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 4;
  roundRectPath(ctx, -52, -12, 104, 34, 14);
  ctx.fill();
  ctx.stroke();

  // Exhaust pipes
  ctx.fillStyle = '#cbd5e1';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2.5;
  for (const ex of [-24, 24]) {
    ctx.beginPath();
    ctx.arc(ex, 16, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(ex, 16, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#cbd5e1';
  }

  // Main upper body
  ctx.fillStyle = skin.bodyColor;
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 4;
  roundRectPath(ctx, -48, -32, 96, 36, 16);
  ctx.fill();
  ctx.stroke();

  // Racing stripe
  if (skin.rainbow) {
    const grad = ctx.createLinearGradient(-10, -30, 10, 12);
    grad.addColorStop(0, '#f43f5e');
    grad.addColorStop(0.25, '#facc15');
    grad.addColorStop(0.5, '#22c55e');
    grad.addColorStop(0.75, '#38bdf8');
    grad.addColorStop(1, '#a855f7');
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = skin.stripeColor;
  }
  ctx.fillRect(-10, -30, 20, 42);

  // Cabin roof
  ctx.fillStyle = skin.bodyColor;
  roundRectPath(ctx, -34, -56, 68, 30, 14);
  ctx.fill();
  ctx.stroke();

  // Cabin stripe
  if (skin.rainbow) {
    const grad = ctx.createLinearGradient(-8, -54, 8, -28);
    grad.addColorStop(0, '#f43f5e');
    grad.addColorStop(0.35, '#facc15');
    grad.addColorStop(0.68, '#22c55e');
    grad.addColorStop(1, '#38bdf8');
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = skin.stripeColor;
  }
  ctx.fillRect(-8, -54, 16, 26);

  // Rear windshield
  ctx.fillStyle = skin.windowColor;
  roundRectPath(ctx, -27, -49, 54, 19, 8);
  ctx.fill();
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Windshield shine
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.beginPath();
  ctx.moveTo(-20, -47);
  ctx.lineTo(-8, -47);
  ctx.lineTo(-16, -32);
  ctx.lineTo(-24, -32);
  ctx.closePath();
  ctx.fill();

  // Rear spoiler
  if (skin.spoiler) {
    ctx.fillStyle = skin.shadeColor;
    ctx.fillRect(-32, -32, 6, 8);
    ctx.fillRect(26, -32, 6, 8);

    ctx.fillStyle = skin.accentColor;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    roundRectPath(ctx, -46, -37, 92, 9, 4);
    ctx.fill();
    ctx.stroke();
  }

  // Tail lights
  for (const lx of [-42, 24]) {
    ctx.fillStyle = brakeGlow ? '#ff1f4b' : '#fb7185';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    roundRectPath(ctx, lx, -10, 18, 10, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(lx + 9, -5, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // License plate badge
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;
  roundRectPath(ctx, -14, -4, 28, 12, 4);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

export class RaceEngine {
  constructor(canvas, callbacks = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.callbacks = callbacks;

    this.width = 960;
    this.height = 540;
    this.dpr = 1;

    this.seedValue = null;
    this.rng = createRng(null);

    this.active = false;
    this.paused = false;
    this.finished = false;
    this.finishCelebration = 0;

    this.world = getWorldById(1);
    this.mode = 'picture';
    this.skin = null;

    this.distance = 0;
    this.finishDist = GATE_COUNT * GATE_SPACING + FINISH_BUFFER;
    this.speed = 1.0;
    this.lane = 1;
    this.visualLane = 1;
    this.laneFrom = 1;
    this.laneLerpT = 1;

    this.boostTimer = 0;
    this.wobbleTimer = 0;
    this.obstacleSlowTimer = 0;
    this.shakeTimer = 0;
    this.shakeIntensity = 0;
    this.fovZoom = 1;

    this.coins = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.correct = 0;
    this.wrong = 0;

    this.gates = [];
    this.obstacles = [];
    this.props = [];
    this.particles = [];
    this.floatingTexts = [];
    this.confetti = [];
    this.feedbackBanner = null;

    this.time = 0;
    this.currentTargetId = null;

    this.resize();
  }

  setSeed(n) {
    this.seedValue = n === null || n === undefined ? null : Number(n);
    this.rng = createRng(this.seedValue);
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const w = Math.max(320, Math.floor(rect.width || window.innerWidth || 960));
    const h = Math.max(320, Math.floor(rect.height || window.innerHeight || 540));
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = w;
    this.height = h;
    this.canvas.width = Math.floor(w * this.dpr);
    this.canvas.height = Math.floor(h * this.dpr);
  }

  startRun({ worldId, mode, skin, wordScores = {}, lastMissed = [] }) {
    if (this.seedValue !== null) {
      this.rng = createRng(this.seedValue);
    } else {
      this.rng = createRng(null);
    }

    this.world = getWorldById(worldId);
    this.mode = mode || 'picture';
    this.skin = skin;

    this.active = true;
    this.paused = false;
    this.finished = false;
    this.finishCelebration = 0;

    this.distance = 0;
    this.speed = 1.0;
    this.lane = 1;
    this.visualLane = 1;
    this.laneFrom = 1;
    this.laneLerpT = 1;

    this.boostTimer = 0;
    this.wobbleTimer = 0;
    this.obstacleSlowTimer = 0;
    this.shakeTimer = 0;
    this.shakeIntensity = 0;
    this.fovZoom = 1;

    this.coins = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.correct = 0;
    this.wrong = 0;

    this.particles = [];
    this.floatingTexts = [];
    this.confetti = [];
    this.feedbackBanner = null;
    this.time = 0;
    this.currentTargetId = null;

    this._buildTrack(wordScores, lastMissed);
    this._buildScenery();
    this._notifyTargetChange(false);
    this.render();
  }

  _buildTrack(wordScores, lastMissed) {
    const worldWords = getWordsByWorld(this.world.id);
    const chosenTargets = pickRunWords(this.world.id, wordScores, lastMissed, this.rng, GATE_COUNT, this.mode);

    this.gates = [];
    this.obstacles = [];

    let prevCorrectLane = -1;

    for (let i = 0; i < chosenTargets.length; i++) {
      const target = chosenTargets[i];
      const distractors = pickDistractors(target, worldWords, this.rng, 2);

      // Avoid repeating the exact same correct lane 3 times in a row
      let correctLane = Math.floor(this.rng() * 3);
      if (correctLane === prevCorrectLane && this.rng() < 0.6) {
        correctLane = (correctLane + 1 + Math.floor(this.rng() * 2)) % 3;
      }
      prevCorrectLane = correctLane;

      const lanes = [null, null, null];
      lanes[correctLane] = target;
      let dIdx = 0;
      for (let l = 0; l < 3; l++) {
        if (!lanes[l]) {
          lanes[l] = distractors[dIdx++] || worldWords[(i + l) % worldWords.length];
        }
      }

      const dist = (i + 1) * GATE_SPACING;
      this.gates.push({
        index: i,
        dist,
        target,
        correctLane,
        lanes,
        passed: false,
        result: null, // 'correct' | 'wrong'
        chosenLane: -1,
        flashTimer: 0
      });

      // Obstacles from World 3 on, strictly between gate rows
      if (this.world.id >= 3 && i < chosenTargets.length - 1 && this.rng() < 0.55) {
        const obsLane = Math.floor(this.rng() * 3);
        const obsType = this.rng() < 0.55 ? 'cone' : 'puddle';
        this.obstacles.push({
          dist: dist + GATE_SPACING * 0.5,
          lane: obsLane,
          type: obsType,
          hit: false
        });
      }
    }

    this.finishDist = chosenTargets.length * GATE_SPACING + FINISH_BUFFER;
  }

  _buildScenery() {
    this.props = [];
    const totalLength = this.finishDist + 10;
    for (let d = 1.2; d < totalLength; d += 1.65) {
      for (const side of [-1, 1]) {
        if (this.rng() < 0.85) {
          this.props.push({
            dist: d + this.rng() * 0.5,
            side,
            offset: 1.28 + this.rng() * 1.15,
            variant: Math.floor(this.rng() * 3),
            scale: 0.85 + this.rng() * 0.45
          });
        }
      }
    }
  }

  steerStep(delta) {
    if (!this.active || this.paused || this.finished) return this.lane;
    return this.steerTo(this.lane + delta);
  }

  steerTo(laneIndex) {
    const clamped = clamp(Math.round(laneIndex), 0, 2);
    if (clamped !== this.lane) {
      this.laneFrom = this.visualLane;
      this.lane = clamped;
      this.laneLerpT = 0;
    }
    return this.lane;
  }

  getNextGate() {
    return this.gates.find((g) => !g.passed) || null;
  }

  getGatesLeft() {
    return this.gates.filter((g) => !g.passed).length;
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

  /**
   * Advances simulation deterministically for tests.
   */
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
    this.render();
  }

  step(dt, isSim = false) {
    if (!this.active || this.paused) return;

    this.time += dt;

    // Smooth lane transition (~150ms ease)
    if (this.laneLerpT < 1) {
      this.laneLerpT = Math.min(1, this.laneLerpT + dt / 0.15);
      const eased = 1 - Math.pow(1 - this.laneLerpT, 3);
      this.visualLane = lerp(this.laneFrom, this.lane, eased);
    } else {
      this.visualLane = this.lane;
    }

    // Timers
    if (this.boostTimer > 0) this.boostTimer = Math.max(0, this.boostTimer - dt);
    if (this.wobbleTimer > 0) this.wobbleTimer = Math.max(0, this.wobbleTimer - dt);
    if (this.obstacleSlowTimer > 0) this.obstacleSlowTimer = Math.max(0, this.obstacleSlowTimer - dt);
    if (this.shakeTimer > 0) this.shakeTimer = Math.max(0, this.shakeTimer - dt);
    if (this.feedbackBanner) {
      this.feedbackBanner.timer -= dt;
      if (this.feedbackBanner.timer <= 0) this.feedbackBanner = null;
    }

    // FOV stretch on boost
    const targetZoom = this.boostTimer > 0 ? 1.055 : 1.0;
    this.fovZoom = lerp(this.fovZoom, targetZoom, Math.min(1, dt * 8));

    // Speed ramps gently through the run (1.0 -> 1.28)
    const progress = this.getProgressRatio();
    const baseSpeed = 1.0 + progress * 0.28;
    let speedMult = 1.0;
    if (this.boostTimer > 0) speedMult *= 1.25;
    if (this.wobbleTimer > 0) speedMult *= 0.5;
    if (this.obstacleSlowTimer > 0) speedMult *= 0.65;

    this.speed = this.finished ? Math.max(0.25, this.speed * (1 - dt * 2)) : baseSpeed * speedMult;
    this.distance += this.speed * dt;

    // Update particles and floating texts
    this._updateParticles(dt);

    // Check gate crossings
    for (const gate of this.gates) {
      if (gate.flashTimer > 0) {
        gate.flashTimer = Math.max(0, gate.flashTimer - dt);
      }
      if (!gate.passed && this.distance >= gate.dist) {
        gate.passed = true;
        gate.chosenLane = this.lane;
        gate.flashTimer = 0.75;

        if (this.lane === gate.correctLane) {
          this._handleCorrectGate(gate, isSim);
        } else {
          this._handleWrongGate(gate, isSim);
        }
        this._notifyTargetChange(isSim);
      }
    }

    // Check obstacle hits
    for (const obs of this.obstacles) {
      if (!obs.hit && Math.abs(this.distance - obs.dist) < 0.22 && this.lane === obs.lane) {
        obs.hit = true;
        this.obstacleSlowTimer = 0.45;
        this.shakeTimer = 0.22;
        this.shakeIntensity = 6;
        this._spawnBurst(this._getLaneScreenX(0, this.visualLane), this._getCarY(), '#fb923c', 10);
        this._spawnFloatingText(this._getLaneScreenX(0, this.visualLane), this._getCarY() - 55, 'אופס!', '#fb923c');
        if (!isSim && this.callbacks.onObstacle) {
          this.callbacks.onObstacle();
        }
      }
    }

    // Check finish line
    if (!this.finished && this.distance >= this.finishDist) {
      this.finished = true;
      this.finishCelebration = 1.0;
      this._spawnConfetti(80);
      if (!isSim && this.callbacks.onFinishLine) {
        this.callbacks.onFinishLine();
      }
    }

    if (this.finished) {
      this.finishCelebration -= dt;
      if (this.finishCelebration <= 0) {
        this.active = false;
        if (this.callbacks.onRunComplete) {
          this.callbacks.onRunComplete();
        }
      }
    }
  }

  _handleCorrectGate(gate, isSim) {
    const multiplier = this.combo >= 6 ? 3 : this.combo >= 3 ? 2 : 1;
    const earned = 10 * multiplier;
    this.coins += earned;
    this.combo += 1;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    this.correct += 1;
    this.boostTimer = 2.0;
    gate.result = 'correct';

    const cx = this._getLaneScreenX(0, this.visualLane);
    const cy = this._getCarY() - 40;
    this._spawnBurst(cx, cy, '#22c55e', 18);
    this._spawnBurst(cx, cy, '#fde047', 12);
    this._spawnFloatingText(cx, cy - 20, `+${earned}`, '#22c55e');

    if (this.callbacks.onGateResult) {
      this.callbacks.onGateResult({
        gate,
        correct: true,
        earned,
        combo: this.combo,
        silent: isSim
      });
    }
  }

  _handleWrongGate(gate, isSim) {
    this.combo = 0;
    this.wrong += 1;
    this.wobbleTimer = 0.6;
    this.boostTimer = 0;
    this.shakeTimer = 0.35;
    this.shakeIntensity = 9;
    gate.result = 'wrong';

    const cx = this._getLaneScreenX(0, this.visualLane);
    const cy = this._getCarY() - 40;
    this._spawnBurst(cx, cy, '#ef4444', 14);
    this.feedbackBanner = {
      word: gate.target.en,
      emoji: gate.target.emoji,
      timer: 1.5
    };

    if (this.callbacks.onGateResult) {
      this.callbacks.onGateResult({
        gate,
        correct: false,
        earned: 0,
        combo: 0,
        silent: isSim
      });
    }
  }

  _spawnBurst(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + this.rng() * 0.5;
      const spd = 90 + this.rng() * 200;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 60,
        size: 5 + this.rng() * 6,
        color,
        life: 0.45 + this.rng() * 0.3,
        maxLife: 0.75
      });
    }
  }

  _spawnFloatingText(x, y, text, color) {
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      life: 0.95,
      maxLife: 0.95
    });
  }

  _spawnConfetti(count) {
    const colors = ['#ef4444', '#facc15', '#22c55e', '#38bdf8', '#a855f7', '#ec4899'];
    for (let i = 0; i < count; i++) {
      this.confetti.push({
        x: this.rng() * this.width,
        y: -20 - this.rng() * 140,
        vx: (this.rng() - 0.5) * 180,
        vy: 140 + this.rng() * 240,
        w: 8 + this.rng() * 8,
        h: 6 + this.rng() * 6,
        rot: this.rng() * Math.PI * 2,
        vRot: (this.rng() - 0.5) * 10,
        color: colors[i % colors.length]
      });
    }
  }

  _updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 320 * dt;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const f = this.floatingTexts[i];
      f.y -= 68 * dt;
      f.life -= dt;
      if (f.life <= 0) this.floatingTexts.splice(i, 1);
    }
    for (const c of this.confetti) {
      c.x += c.vx * dt;
      c.y += c.vy * dt;
      c.rot += c.vRot * dt;
    }
  }

  _getHorizonY() {
    return this.height * 0.35;
  }

  _getCarY() {
    const isPortrait = this.height > this.width && this.width < 640;
    return this.height * (isPortrait ? 0.76 : 0.83);
  }

  _getRoadHalfW0() {
    return Math.min(this.width * 0.45, this.height * 0.62);
  }

  _projectZ(z) {
    const scale = 1 / (1 + z * 1.4);
    const horizonY = this._getHorizonY();
    const carY = this._getCarY();
    const y = horizonY + (carY - horizonY) * scale;
    const halfW = this._getRoadHalfW0() * scale;
    return { scale, y, halfW };
  }

  _getLaneScreenX(z, lanePos) {
    const { halfW } = this._projectZ(z);
    const laneOffset = (lanePos - 1) * (halfW * 0.66);
    return this.width * 0.5 + laneOffset;
  }

  render() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const theme = this.world.theme;

    ctx.save();
    ctx.scale(this.dpr, this.dpr);

    // Camera zoom + shake
    let shakeX = 0;
    let shakeY = 0;
    if (this.shakeTimer > 0) {
      shakeX = (Math.sin(this.time * 62) * this.shakeIntensity) * (this.shakeTimer / 0.35);
      shakeY = (Math.cos(this.time * 54) * this.shakeIntensity * 0.6) * (this.shakeTimer / 0.35);
    }
    if (this.fovZoom !== 1 || shakeX !== 0 || shakeY !== 0) {
      ctx.translate(w * 0.5 + shakeX, h * 0.5 + shakeY);
      ctx.scale(this.fovZoom, this.fovZoom);
      ctx.translate(-w * 0.5, -h * 0.5);
    }

    const horizonY = this._getHorizonY();

    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    skyGrad.addColorStop(0, theme.skyTop);
    skyGrad.addColorStop(1, theme.skyBottom);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(-30, -30, w + 60, horizonY + 40);

    // Sun and clouds
    this._drawSkyDecor(ctx, w, horizonY, theme);

    // Distant horizon hills
    this._drawHorizonHills(ctx, w, horizonY, theme);

    // Road + striped terrain slices
    this._drawRoad(ctx, w, h, horizonY, theme);

    // Collect depth-sorted drawables (props, obstacles, finish line, gates)
    const drawables = [];

    for (const p of this.props) {
      const z = p.dist - this.distance;
      if (z > -0.15 && z <= HORIZON_Z + 2.5) {
        drawables.push({ z, kind: 'prop', data: p });
      }
    }

    for (const obs of this.obstacles) {
      const z = obs.dist - this.distance;
      if (z > -0.15 && z <= HORIZON_Z + 0.3 && !obs.hit) {
        drawables.push({ z, kind: 'obstacle', data: obs });
      }
    }

    const finishZ = this.finishDist - this.distance;
    if (finishZ > -0.2 && finishZ <= HORIZON_Z + 1.2) {
      drawables.push({ z: finishZ, kind: 'finish', data: null });
    }

    for (const gate of this.gates) {
      const z = gate.dist - this.distance;
      const keepBrief = gate.passed && gate.flashTimer > 0 && z > -0.28;
      if ((z > -0.05 && z <= HORIZON_Z + 0.1) || keepBrief) {
        drawables.push({ z: Math.max(-0.02, z), kind: 'gate', data: gate });
      }
    }

    drawables.sort((a, b) => b.z - a.z);

    for (const item of drawables) {
      if (item.kind === 'prop') {
        this._drawProp(ctx, item.z, item.data, theme);
      } else if (item.kind === 'obstacle') {
        this._drawObstacle(ctx, item.z, item.data);
      } else if (item.kind === 'finish') {
        this._drawFinishLine(ctx, item.z);
      } else if (item.kind === 'gate') {
        this._drawGateRow(ctx, item.z, item.data, theme);
      }
    }

    // Speed lines during boost
    if (this.boostTimer > 0) {
      this._drawSpeedLines(ctx, w, h);
    }

    // Player car
    this._drawPlayerCar(ctx);

    // Particles & floating texts
    this._drawParticles(ctx);

    // Wrong-answer visual callout banner
    if (this.feedbackBanner) {
      this._drawFeedbackBanner(ctx, w);
    }

    // Confetti
    this._drawConfetti(ctx);

    ctx.restore();
  }

  _drawSkyDecor(ctx, w, horizonY, theme) {
    if (theme.skyStars) {
      // Starry cosmos sky with glowing ringed planet
      ctx.save();
      for (let i = 0; i < 28; i++) {
        const sx = ((i * 173 + 41) % 997) / 997 * w;
        const sy = ((i * 97 + 19) % 499) / 499 * (horizonY * 0.85);
        const twinkle = 0.45 + 0.55 * Math.abs(Math.sin(this.time * 2.2 + i));
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkle.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(sx, sy, (i % 3 === 0 ? 2.4 : 1.5), 0, Math.PI * 2);
        ctx.fill();
      }
      const px = w * 0.8;
      const py = horizonY * 0.34;
      ctx.fillStyle = theme.sunColor;
      ctx.beginPath();
      ctx.arc(px, py, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(253, 224, 71, 0.75)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(px, py, 40, 10, -0.25, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      return;
    }

    // Sun
    const sunX = w * 0.82;
    const sunY = horizonY * 0.36;
    ctx.save();
    ctx.fillStyle = theme.sunColor;
    ctx.globalAlpha = 0.28;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 46, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.95;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Soft drifting clouds
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
    const cloudXs = [0.16, 0.48, 0.72];
    cloudXs.forEach((frac, idx) => {
      const cx = ((frac * w + this.time * (6 + idx * 2)) % (w + 160)) - 80;
      const cy = horizonY * (0.24 + (idx % 2) * 0.16);
      ctx.beginPath();
      ctx.arc(cx, cy, 18, 0, Math.PI * 2);
      ctx.arc(cx + 20, cy - 6, 22, 0, Math.PI * 2);
      ctx.arc(cx + 42, cy, 17, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  _drawHorizonHills(ctx, w, horizonY, theme) {
    ctx.save();
    ctx.fillStyle = theme.horizonHills;
    ctx.beginPath();
    ctx.moveTo(0, horizonY + 2);
    const step = w / 6;
    for (let i = 0; i <= 6; i++) {
      const x = i * step;
      const peak = (i % 2 === 0 ? 18 : 34);
      ctx.quadraticCurveTo(x - step * 0.5, horizonY - peak, x, horizonY + 2);
    }
    ctx.lineTo(w, horizonY + 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  _drawRoad(ctx, w, h, horizonY, theme) {
    const zSteps = [14, 9, 6.2, 4.4, 3.2, 2.3, 1.65, 1.15, 0.75, 0.42, 0.15, -0.35];
    const segLen = 0.6;

    // Fill base terrain below horizon first
    ctx.fillStyle = theme.groundB;
    ctx.fillRect(-30, horizonY, w + 60, h - horizonY + 40);

    // Draw banded road & terrain from horizon toward foreground
    for (let d = Math.floor((this.distance + 12) / segLen) * segLen; d >= this.distance - 0.5; d -= segLen) {
      const zFar = d - this.distance;
      const zNear = zFar - segLen;
      if (zFar <= -0.4 || zNear >= 14) continue;

      const pFar = this._projectZ(Math.max(-0.35, zFar));
      const pNear = this._projectZ(Math.max(-0.35, zNear));
      const bandIdx = Math.floor(d / segLen);
      const isAlt = (bandIdx % 2 === 0);

      // Terrain band
      ctx.fillStyle = isAlt ? theme.groundA : theme.groundB;
      ctx.fillRect(-30, pFar.y, w + 60, Math.max(1, pNear.y - pFar.y + 1.5));

      // Shoulder curb
      const curbScale = 1.075;
      ctx.fillStyle = isAlt ? theme.shoulderA : theme.shoulderB;
      ctx.beginPath();
      ctx.moveTo(w * 0.5 - pFar.halfW * curbScale, pFar.y);
      ctx.lineTo(w * 0.5 + pFar.halfW * curbScale, pFar.y);
      ctx.lineTo(w * 0.5 + pNear.halfW * curbScale, pNear.y + 1);
      ctx.lineTo(w * 0.5 - pNear.halfW * curbScale, pNear.y + 1);
      ctx.closePath();
      ctx.fill();

      // Road asphalt/dirt
      ctx.fillStyle = isAlt ? theme.roadA : theme.roadB;
      ctx.beginPath();
      ctx.moveTo(w * 0.5 - pFar.halfW, pFar.y);
      ctx.lineTo(w * 0.5 + pFar.halfW, pFar.y);
      ctx.lineTo(w * 0.5 + pNear.halfW, pNear.y + 1);
      ctx.lineTo(w * 0.5 - pNear.halfW, pNear.y + 1);
      ctx.closePath();
      ctx.fill();

      // Dashed lane dividers (between 3 lanes -> at -0.33 and +0.33 of halfW)
      if (isAlt) {
        ctx.fillStyle = theme.stripe;
        for (const laneEdge of [-0.33, 0.33]) {
          const xFar = w * 0.5 + pFar.halfW * laneEdge;
          const xNear = w * 0.5 + pNear.halfW * laneEdge;
          const swFar = Math.max(1.2, 5 * pFar.scale);
          const swNear = Math.max(1.5, 5 * pNear.scale);
          ctx.beginPath();
          ctx.moveTo(xFar - swFar, pFar.y);
          ctx.lineTo(xFar + swFar, pFar.y);
          ctx.lineTo(xNear + swNear, pNear.y + 1);
          ctx.lineTo(xNear - swNear, pNear.y + 1);
          ctx.closePath();
          ctx.fill();
        }
      }
    }

    // Subtle unused reference guard
    void zSteps;
  }

  _drawProp(ctx, z, prop, theme) {
    const { scale, y, halfW } = this._projectZ(z);
    const x = this.width * 0.5 + prop.side * halfW * prop.offset;
    const s = scale * prop.scale * (this.width < 600 ? 0.8 : 1.0);

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);

    const type = theme.propType;
    if (type === 'jungle') {
      // Palm tree & lush leaves
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-7, -85, 14, 85);
      ctx.fillStyle = prop.variant === 0 ? '#16a34a' : '#22c55e';
      for (let a = -2; a <= 2; a++) {
        ctx.beginPath();
        ctx.ellipse(a * 16, -88 + Math.abs(a) * 6, 24, 9, a * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }
      if (prop.variant === 2) {
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(-18, -8, 9, 0, Math.PI * 2);
        ctx.arc(16, -10, 8, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (type === 'city') {
      // Colorful city buildings / streetlamps
      const bColors = ['#f472b6', '#38bdf8', '#fb923c'];
      ctx.fillStyle = bColors[prop.variant % 3];
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      roundRectPath(ctx, -34, -120, 68, 120, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fef08a';
      for (let wy = -102; wy < -24; wy += 24) {
        ctx.fillRect(-20, wy, 14, 14);
        ctx.fillRect(6, wy, 14, 14);
      }
    } else if (type === 'canyon') {
      // Cactus or colorful canyon rock
      if (prop.variant % 2 === 0) {
        ctx.fillStyle = '#16a34a';
        ctx.strokeStyle = '#052e16';
        ctx.lineWidth = 3;
        roundRectPath(ctx, -10, -82, 20, 82, 9);
        ctx.fill();
        ctx.stroke();
        roundRectPath(ctx, -28, -56, 18, 12, 6);
        ctx.fill();
        roundRectPath(ctx, -28, -72, 12, 26, 6);
        ctx.fill();
        roundRectPath(ctx, 10, -48, 18, 12, 6);
        ctx.fill();
        roundRectPath(ctx, 16, -66, 12, 26, 6);
        ctx.fill();
      } else {
        ctx.fillStyle = prop.variant === 1 ? '#f43f5e' : '#eab308';
        ctx.beginPath();
        ctx.moveTo(-36, 0);
        ctx.lineTo(-18, -70);
        ctx.lineTo(14, -64);
        ctx.lineTo(36, 0);
        ctx.closePath();
        ctx.fill();
      }
    } else if (type === 'home') {
      // Cozy house with roof
      ctx.fillStyle = prop.variant === 0 ? '#fef3c7' : '#e0f2fe';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      ctx.fillRect(-34, -66, 68, 66);
      ctx.strokeRect(-34, -66, 68, 66);
      ctx.fillStyle = prop.variant === 1 ? '#0284c7' : '#ef4444';
      ctx.beginPath();
      ctx.moveTo(-42, -66);
      ctx.lineTo(0, -104);
      ctx.lineTo(42, -66);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-10, -34, 20, 34);
    } else if (type === 'bridge') {
      // Bridge suspension tower & light
      ctx.fillStyle = '#f43f5e';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      ctx.fillRect(-10, -110, 20, 110);
      ctx.strokeRect(-10, -110, 20, 110);
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(0, -116, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (type === 'airport') {
      // Runway edge beacon & control tower / windsock
      if (prop.variant === 0) {
        ctx.fillStyle = '#e2e8f0';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 3;
        ctx.fillRect(-12, -105, 24, 105);
        ctx.strokeRect(-12, -105, 24, 105);
        ctx.fillStyle = '#38bdf8';
        roundRectPath(ctx, -26, -128, 52, 26, 6);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillStyle = '#475569';
        ctx.fillRect(-4, -55, 8, 55);
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.moveTo(0, -55);
        ctx.lineTo(36, -48);
        ctx.lineTo(36, -38);
        ctx.lineTo(0, -40);
        ctx.closePath();
        ctx.fill();
      }
    } else if (type === 'sea') {
      // Coral reefs & tall seaweed
      if (prop.variant === 0) {
        ctx.fillStyle = '#fb7185';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;
        roundRectPath(ctx, -8, -76, 16, 76, 8);
        ctx.fill();
        ctx.stroke();
        roundRectPath(ctx, -26, -54, 14, 34, 7);
        ctx.fill();
        ctx.stroke();
        roundRectPath(ctx, 12, -62, 14, 42, 7);
        ctx.fill();
        ctx.stroke();
      } else if (prop.variant === 1) {
        ctx.fillStyle = '#10b981';
        for (const ox of [-10, 0, 10]) {
          ctx.beginPath();
          ctx.ellipse(ox, -42, 7, 42, ox * 0.02, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        ctx.fillStyle = '#fde047';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, -18, 22, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    } else if (type === 'garden') {
      // Giant garden flowers & spotted mushrooms
      if (prop.variant % 2 === 0) {
        ctx.fillStyle = '#15803d';
        ctx.fillRect(-4, -68, 8, 68);
        ctx.fillStyle = prop.variant === 0 ? '#ec4899' : '#a855f7';
        for (let a = 0; a < 5; a++) {
          const ang = (Math.PI * 2 * a) / 5;
          ctx.beginPath();
          ctx.arc(Math.cos(ang) * 14, -74 + Math.sin(ang) * 14, 10, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(0, -74, 9, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(-10, -36, 20, 36);
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, -36, 28, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-10, -48, 5, 0, Math.PI * 2);
        ctx.arc(9, -50, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (type === 'mountain') {
      // Snow-capped alpine pines & snowy rocks
      if (prop.variant !== 2) {
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-7, -24, 14, 24);
        ctx.fillStyle = '#0f766e';
        ctx.beginPath();
        ctx.moveTo(-34, -22);
        ctx.lineTo(0, -96);
        ctx.lineTo(34, -22);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.moveTo(-14, -66);
        ctx.lineTo(0, -96);
        ctx.lineTo(14, -66);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.moveTo(-32, 0);
        ctx.lineTo(-10, -48);
        ctx.lineTo(24, -36);
        ctx.lineTo(34, 0);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(-18, -32);
        ctx.lineTo(-10, -48);
        ctx.lineTo(2, -42);
        ctx.closePath();
        ctx.fill();
      }
    } else if (type === 'mall') {
      // Boutiques with colorful awnings & street lamps
      const awnings = ['#ec4899', '#06b6d4', '#eab308'];
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      roundRectPath(ctx, -34, -108, 68, 108, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = awnings[prop.variant % 3];
      roundRectPath(ctx, -38, -68, 76, 18, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#bae6fd';
      ctx.fillRect(-22, -44, 44, 34);
    } else if (type === 'station') {
      // Railway signals & station signposts
      ctx.fillStyle = '#334155';
      ctx.fillRect(-5, -96, 10, 96);
      ctx.fillStyle = '#0f172a';
      roundRectPath(ctx, -16, -112, 32, 46, 8);
      ctx.fill();
      ctx.fillStyle = prop.variant === 0 ? '#22c55e' : '#ef4444';
      ctx.beginPath();
      ctx.arc(0, -98, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(0, -78, 7, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'stadium') {
      // Stadium floodlight towers & team pennants
      if (prop.variant === 0) {
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(-5, -116, 10, 116);
        ctx.fillStyle = '#1e293b';
        roundRectPath(ctx, -26, -134, 52, 22, 5);
        ctx.fill();
        ctx.fillStyle = '#fef9c3';
        for (const lx of [-16, 0, 16]) {
          ctx.beginPath();
          ctx.arc(lx, -123, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(-4, -84, 8, 84);
        ctx.fillStyle = prop.variant === 1 ? '#2563eb' : '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(4, -84);
        ctx.lineTo(38, -72);
        ctx.lineTo(4, -60);
        ctx.closePath();
        ctx.fill();
      }
    } else if (type === 'jobs') {
      // Town service buildings (clinic, bakery, firehouse)
      const colors = ['#fee2e2', '#fef3c7', '#e0f2fe'];
      const roofs = ['#ef4444', '#f59e0b', '#0284c7'];
      ctx.fillStyle = colors[prop.variant % 3];
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      roundRectPath(ctx, -34, -92, 68, 92, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = roofs[prop.variant % 3];
      roundRectPath(ctx, -38, -104, 76, 18, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-14, -74, 28, 22);
      ctx.fillStyle = roofs[prop.variant % 3];
      ctx.fillRect(-3, -71, 6, 16);
      ctx.fillRect(-8, -66, 16, 6);
    } else if (type === 'kitchen') {
      // Giant chef hats & colorful kitchen mugs/jars
      if (prop.variant === 0) {
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 3;
        ctx.fillRect(-20, -48, 40, 48);
        ctx.strokeRect(-20, -48, 40, 48);
        ctx.beginPath();
        ctx.arc(-14, -56, 16, 0, Math.PI * 2);
        ctx.arc(14, -56, 16, 0, Math.PI * 2);
        ctx.arc(0, -68, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillStyle = prop.variant === 1 ? '#f97316' : '#ec4899';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 3;
        roundRectPath(ctx, -22, -62, 44, 62, 8);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(-16, -42, 32, 16);
      }
    } else if (type === 'feelings') {
      // Enchanted colorful trees & glowing lanterns
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-7, -56, 14, 56);
      const foliage = ['#f472b6', '#fbbf24', '#34d399'];
      ctx.fillStyle = foliage[prop.variant % 3];
      ctx.beginPath();
      ctx.arc(0, -76, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.beginPath();
      ctx.arc(-9, -84, 10, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'opposites') {
      // Contrasting black-and-white checkered pillars
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = (i + prop.variant) % 2 === 0 ? '#ffffff' : '#0f172a';
        ctx.fillRect(-14, -24 * (i + 1), 28, 24);
        ctx.strokeRect(-14, -24 * (i + 1), 28, 24);
      }
      ctx.fillStyle = prop.variant % 2 === 0 ? '#f43f5e' : '#38bdf8';
      ctx.beginPath();
      ctx.arc(0, -108, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (type === 'space') {
      // Neon space beacons & glowing crystal spires
      if (prop.variant === 0) {
        ctx.fillStyle = '#334155';
        ctx.fillRect(-6, -86, 12, 86);
        ctx.fillStyle = '#22d3ee';
        ctx.beginPath();
        ctx.arc(0, -94, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-4, -98, 4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = prop.variant === 1 ? '#a855f7' : '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(-22, 0);
        ctx.lineTo(-6, -82);
        ctx.lineTo(14, -68);
        ctx.lineTo(24, 0);
        ctx.closePath();
        ctx.fill();
      }
    } else if (type === 'music') {
      // Glowing stage speakers & giant music note poles
      if (prop.variant === 0) {
        ctx.fillStyle = '#1e1b4b';
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3;
        roundRectPath(ctx, -24, -84, 48, 84, 8);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.arc(0, -56, 14, 0, Math.PI * 2);
        ctx.arc(0, -24, 16, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#facc15';
        ctx.fillRect(6, -96, 8, 76);
        ctx.fillRect(6, -96, 26, 10);
        ctx.beginPath();
        ctx.ellipse(-2, -18, 14, 10, -0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (type === 'school') {
      // Giant colorful pencils & school lockers
      if (prop.variant !== 2) {
        ctx.fillStyle = prop.variant === 0 ? '#facc15' : '#38bdf8';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;
        ctx.fillRect(-10, -76, 20, 76);
        ctx.strokeRect(-10, -76, 20, 76);
        ctx.fillStyle = '#fde68a';
        ctx.beginPath();
        ctx.moveTo(-10, -76);
        ctx.lineTo(0, -100);
        ctx.lineTo(10, -76);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.moveTo(-3, -93);
        ctx.lineTo(0, -100);
        ctx.lineTo(3, -93);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillStyle = '#ef4444';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 3;
        roundRectPath(ctx, -28, -94, 56, 94, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-16, -78, 32, 16);
      }
    } else if (type === 'town') {
      // Clocktowers & city street lamps
      if (prop.variant === 0) {
        ctx.fillStyle = '#f1f5f9';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 3;
        ctx.fillRect(-20, -110, 40, 110);
        ctx.strokeRect(-20, -110, 40, 110);
        ctx.fillStyle = '#0d9488';
        ctx.beginPath();
        ctx.moveTo(-24, -110);
        ctx.lineTo(0, -138);
        ctx.lineTo(24, -110);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, -84, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-4, -84, 8, 84);
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(0, -90, 12, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (type === 'airport2') {
      // Sunset runway radar towers & red-white approach beacons
      if (prop.variant === 0) {
        ctx.fillStyle = '#cbd5e1';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 3;
        ctx.fillRect(-10, -96, 20, 96);
        ctx.strokeRect(-10, -96, 20, 96);
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(0, -108, 18, Math.PI * 0.8, Math.PI * 2.2);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-8, -60, 16, 20);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-8, -40, 16, 20);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-8, -20, 16, 20);
      }
    } else if (type === 'tunnel') {
      // Glowing time-portal pillars & floating hourglass crystals
      ctx.fillStyle = '#1e1b4b';
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 3;
      roundRectPath(ctx, -14, -106, 28, 106, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = prop.variant % 2 === 0 ? '#fde047' : '#f472b6';
      ctx.beginPath();
      ctx.moveTo(-12, -92);
      ctx.lineTo(12, -92);
      ctx.lineTo(0, -76);
      ctx.lineTo(12, -60);
      ctx.lineTo(-12, -60);
      ctx.lineTo(0, -76);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  _drawObstacle(ctx, z, obs) {
    const { scale, y } = this._projectZ(z);
    const x = this._getLaneScreenX(z, obs.lane);
    const s = scale * (this.width < 600 ? 0.85 : 1.0);

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);

    if (obs.type === 'cone') {
      // Traffic cone
      ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
      ctx.beginPath();
      ctx.ellipse(0, 4, 24, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f97316';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-22, 2);
      ctx.lineTo(-7, -46);
      ctx.lineTo(7, -46);
      ctx.lineTo(22, 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // White reflective stripe
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-14, -18);
      ctx.lineTo(-10, -30);
      ctx.lineTo(10, -30);
      ctx.lineTo(14, -18);
      ctx.closePath();
      ctx.fill();
    } else {
      // Shiny puddle
      ctx.fillStyle = '#0284c7';
      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, 0, 36, 13, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.beginPath();
      ctx.ellipse(-10, -3, 12, 4, -0.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  _drawFinishLine(ctx, z) {
    const { scale, y, halfW } = this._projectZ(z);
    const cx = this.width * 0.5;
    const totalW = halfW * 2.12;
    const archH = 128 * scale;
    const bannerH = Math.max(24, 48 * scale);

    ctx.save();
    // Checkered road strip
    const cols = 12;
    const cellW = (halfW * 2) / cols;
    const stripH = Math.max(6, 18 * scale);
    for (let i = 0; i < cols; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#0f172a' : '#ffffff';
      ctx.fillRect(cx - halfW + i * cellW, y - stripH * 0.5, cellW + 0.5, stripH);
    }

    // Pillars
    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = Math.max(2, 4 * scale);
    const pillarW = Math.max(6, 18 * scale);
    ctx.fillRect(cx - totalW * 0.5, y - archH, pillarW, archH);
    ctx.strokeRect(cx - totalW * 0.5, y - archH, pillarW, archH);
    ctx.fillRect(cx + totalW * 0.5 - pillarW, y - archH, pillarW, archH);
    ctx.strokeRect(cx + totalW * 0.5 - pillarW, y - archH, pillarW, archH);

    // Checkered top banner
    roundRectPath(ctx, cx - totalW * 0.5, y - archH, totalW, bannerH, 10 * scale);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fde047';
    ctx.font = `700 ${Math.max(16, Math.round(32 * scale))}px "Fredoka", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('FINISH!', cx, y - archH + bannerH * 0.52);
    ctx.restore();
  }

  _drawGateRow(ctx, z, gate, theme) {
    const { scale, y, halfW } = this._projectZ(z);
    const laneW = (halfW * 2) / 3;
    const archH = Math.max(40, 128 * scale);
    const bannerH = Math.max(28, 66 * scale);

    for (let lane = 0; lane < 3; lane++) {
      const wordObj = gate.lanes[lane];
      const gx = this._getLaneScreenX(z, lane);
      const boxW = Math.max(54, laneW * 0.94);

      let bg = theme.gatePalette[lane % theme.gatePalette.length];
      let border = '#0f172a';
      let glow = null;

      if (gate.passed) {
        if (lane === gate.correctLane) {
          bg = '#22c55e';
          border = '#ffffff';
          glow = 'rgba(34, 197, 94, 0.75)';
        } else if (lane === gate.chosenLane && gate.result === 'wrong') {
          bg = '#ef4444';
          border = '#fee2e2';
          glow = 'rgba(239, 68, 68, 0.75)';
        } else {
          bg = '#64748b';
        }
      }

      ctx.save();

      // Arch posts
      const postW = Math.max(4, 11 * scale);
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = Math.max(1.5, 3 * scale);
      ctx.fillRect(gx - boxW * 0.45, y - archH, postW, archH);
      ctx.strokeRect(gx - boxW * 0.45, y - archH, postW, archH);
      ctx.fillRect(gx + boxW * 0.45 - postW, y - archH, postW, archH);
      ctx.strokeRect(gx + boxW * 0.45 - postW, y - archH, postW, archH);

      // Banner
      if (glow) {
        ctx.shadowColor = glow;
        ctx.shadowBlur = 20;
      }
      ctx.fillStyle = bg;
      ctx.strokeStyle = border;
      ctx.lineWidth = Math.max(2, 4 * scale);
      roundRectPath(ctx, gx - boxW * 0.5, y - archH, boxW, bannerH, Math.max(8, 16 * scale));
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.stroke();

      // Glossy top highlight strip
      ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
      roundRectPath(ctx, gx - boxW * 0.46, y - archH + 3, boxW * 0.92, bannerH * 0.34, Math.max(5, 10 * scale));
      ctx.fill();

      // English word text (min 28px at arrival on standard viewports, crisp white with thick dark outline)
      let fontSize = Math.round(38 * scale);
      if (z <= 0.75) {
        fontSize = Math.max(28, fontSize);
      } else {
        fontSize = Math.max(12, fontSize);
      }

      ctx.font = `700 ${fontSize}px "Fredoka", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const maxTextW = boxW * 0.88;
      let measured = ctx.measureText(wordObj.en).width;
      if (measured > maxTextW && maxTextW > 24) {
        const ratio = maxTextW / measured;
        const fitted = Math.max(z <= 0.75 && this.width >= 500 ? 28 : 11, Math.floor(fontSize * ratio));
        ctx.font = `700 ${fitted}px "Fredoka", sans-serif`;
      }

      const textY = y - archH + bannerH * 0.53;
      ctx.lineJoin = 'round';
      ctx.lineWidth = Math.max(3, fontSize * 0.22);
      ctx.strokeStyle = '#0f172a';
      ctx.strokeText(wordObj.en, gx, textY);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(wordObj.en, gx, textY);

      ctx.restore();
    }
  }

  _drawSpeedLines(ctx, w, h) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 3;
    const cx = w * 0.5;
    const cy = this._getHorizonY();
    for (let i = 0; i < 16; i++) {
      const angle = (Math.PI * 2 * i) / 16 + Math.sin(this.time * 12 + i) * 0.04;
      const r1 = Math.min(w, h) * 0.32 + ((this.time * 400 + i * 70) % 140);
      const r2 = r1 + 90;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
      ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
      ctx.stroke();
    }
    ctx.restore();
  }

  _drawPlayerCar(ctx) {
    const carX = this._getLaneScreenX(0, this.visualLane);
    const carY = this._getCarY();
    const baseScale = clamp(this.width / 820, 0.75, 1.15);

    const laneDelta = this.lane - this.visualLane;
    const roll = clamp(laneDelta * 0.16, -0.22, 0.22);
    const bounce = Math.sin(this.time * (14 + this.speed * 6)) * 2.2;
    const spin = this.wobbleTimer > 0
      ? Math.sin((this.wobbleTimer / 0.6) * Math.PI * 4) * 0.45
      : 0;

    drawCartoonCar(ctx, carX, carY, baseScale, this.skin, {
      roll,
      bounce,
      spin,
      boosted: this.boostTimer > 0,
      time: this.time,
      brakeGlow: this.wobbleTimer > 0 || this.obstacleSlowTimer > 0
    });
  }

  _drawParticles(ctx) {
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = clamp(p.life / p.maxLife, 0, 1);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    for (const f of this.floatingTexts) {
      ctx.save();
      const alpha = clamp(f.life / f.maxLife, 0, 1);
      ctx.globalAlpha = alpha;
      ctx.font = '700 34px "Fredoka", sans-serif';
      ctx.textAlign = 'center';
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#0f172a';
      ctx.strokeText(f.text, f.x, f.y);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);
      ctx.restore();
    }
  }

  _drawFeedbackBanner(ctx, w) {
    if (!this.feedbackBanner) return;
    ctx.save();
    const alpha = clamp(this.feedbackBanner.timer / 0.4, 0, 1);
    ctx.globalAlpha = alpha;
    const bx = w * 0.5;
    const by = this._getCarY() - 108;

    ctx.fillStyle = '#16a34a';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    roundRectPath(ctx, bx - 135, by - 28, 270, 56, 28);
    ctx.fill();
    ctx.stroke();

    ctx.font = '700 28px "Fredoka", "Noto Color Emoji", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const label = this.feedbackBanner.emoji
      ? `${this.feedbackBanner.emoji}  ${this.feedbackBanner.word}`
      : this.feedbackBanner.word;
    ctx.fillText(label, bx, by + 1);
    ctx.restore();
  }

  _drawConfetti(ctx) {
    for (const c of this.confetti) {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot);
      ctx.fillStyle = c.color;
      ctx.fillRect(-c.w * 0.5, -c.h * 0.5, c.w, c.h);
      ctx.restore();
    }
  }
}
