// Pooled 3D Particle & Confetti Effects: correct-gate confetti, x5 combo fire trail,
// coin sparkles, landing bursts, and finish celebration.

import * as THREE from 'three';

const POOL_SIZE = 240;

export class EffectsManager3D {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
    this.freeList = [];

    const boxGeo = new THREE.BoxGeometry(0.24, 0.24, 0.08);
    const sphereGeo = new THREE.SphereGeometry(0.18, 6, 6);

    for (let i = 0; i < POOL_SIZE; i++) {
      const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1 });
      const mesh = new THREE.Mesh(i % 2 === 0 ? boxGeo : sphereGeo, mat);
      mesh.visible = false;
      this.scene.add(mesh);
      const p = {
        mesh,
        mat,
        active: false,
        vel: new THREE.Vector3(),
        rotVel: new THREE.Vector3(),
        gravity: 16,
        life: 0,
        maxLife: 1,
        baseScale: 1
      };
      this.particles.push(p);
      this.freeList.push(p);
    }

    this.trailAccum = 0;
  }

  _spawn(pos, vel, colorHex, life, scale = 1, gravity = 16) {
    let p = this.freeList.pop();
    if (!p) {
      // Recycle oldest active particle if pool saturated
      p = this.particles[0];
    }
    p.active = true;
    p.mesh.visible = true;
    p.mesh.position.copy(pos);
    p.mesh.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
    p.vel.copy(vel);
    p.rotVel.set((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12);
    p.mat.color.setHex(colorHex);
    p.mat.opacity = 1;
    p.life = life;
    p.maxLife = life;
    p.baseScale = scale;
    p.gravity = gravity;
  }

  spawnConfetti(origin, count = 42) {
    const colors = [0x22c55e, 0xfacc15, 0x38bdf8, 0xf43f5e, 0xa855f7, 0xffffff];
    for (let i = 0; i < count; i++) {
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 18,
        5 + Math.random() * 11,
        (Math.random() - 0.5) * 14
      );
      this._spawn(origin, vel, colors[i % colors.length], 1.1 + Math.random() * 0.6, 1.35, 14);
    }
  }

  spawnBurst(origin, colorHex, count = 16) {
    for (let i = 0; i < count; i++) {
      const ang = (Math.PI * 2 * i) / count;
      const spd = 4 + Math.random() * 7;
      const vel = new THREE.Vector3(
        Math.cos(ang) * spd,
        2 + Math.random() * 5,
        Math.sin(ang) * spd
      );
      this._spawn(origin, vel, colorHex, 0.5 + Math.random() * 0.3, 1.0, 12);
    }
  }

  emitFireTrail(dt, carPos, forward, isNitro, comboTier, isBoosted = false, trailStyle = 'standard') {
    const hasCustomTrail = trailStyle && trailStyle !== 'standard';
    if (!isNitro && !isBoosted && comboTier < 5 && !hasCustomTrail) return;
    const rate = isNitro ? 52 : comboTier >= 5 ? 32 : isBoosted ? 20 : 12;
    this.trailAccum += dt * rate;
    const rainbowCols = [0xef4444, 0xf59e0b, 0x22c55e, 0x06b6d4, 0x3b82f6, 0xa855f7];
    while (this.trailAccum >= 1) {
      this.trailAccum -= 1;
      const side = Math.random() > 0.5 ? 0.38 : -0.38;
      const backPos = carPos.clone().addScaledVector(forward, -2.05);
      backPos.y += 0.36 + Math.random() * 0.16;
      backPos.x += side + (Math.random() - 0.5) * 0.25;
      const vel = forward.clone().multiplyScalar(-6 - Math.random() * 4);
      vel.y += 0.8 + Math.random() * 1.8;

      let color;
      if (isNitro) {
        color = Math.random() > 0.4 ? 0x22d3ee : 0xffffff;
      } else if (trailStyle === 'cyan_plasma') {
        color = Math.random() > 0.4 ? 0x06b6d4 : 0xbae6fd;
      } else if (trailStyle === 'emerald_bolt') {
        color = Math.random() > 0.4 ? 0x22c55e : 0xbef264;
      } else if (trailStyle === 'rainbow_rush') {
        color = rainbowCols[Math.floor(Math.random() * rainbowCols.length)];
      } else if (trailStyle === 'star_gold') {
        color = Math.random() > 0.35 ? 0xfacc15 : 0xfef08a;
      } else {
        color = Math.random() > 0.45 ? 0xf97316 : 0xfacc15;
      }

      this._spawn(backPos, vel, color, isNitro ? 0.4 : 0.3, isNitro ? 1.35 : 0.95, -2);
    }
  }

  update(dt) {
    for (const p of this.particles) {
      if (!p.active) continue;
      p.life -= dt;
      if (p.life <= 0) {
        p.active = false;
        p.mesh.visible = false;
        this.freeList.push(p);
        continue;
      }
      p.vel.y -= p.gravity * dt;
      p.mesh.position.addScaledVector(p.vel, dt);
      p.mesh.rotation.x += p.rotVel.x * dt;
      p.mesh.rotation.y += p.rotVel.y * dt;
      const t = p.life / p.maxLife;
      p.mat.opacity = Math.min(1, t * 1.4);
      p.mesh.scale.setScalar(p.baseScale * (0.4 + 0.6 * t));
    }
  }

  clear() {
    this.freeList = [];
    for (const p of this.particles) {
      p.active = false;
      p.mesh.visible = false;
      this.freeList.push(p);
    }
  }
}
