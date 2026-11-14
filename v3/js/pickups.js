// 3D road pickups & track features: Coins (with Magnet attraction), Jump Ramps, Power-Ups, and Obstacles.

import * as THREE from 'three';
import { LANE_WIDTH } from './track.js';

function makePowerupLabelTex(icon, bgHex) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = bgHex;
  ctx.beginPath();
  ctx.arc(64, 64, 54, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  ctx.font = '64px "Noto Color Emoji", "Fredoka", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(icon, 64, 68);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const POWERUP_META = {
  magnet: { icon: '🧲', color: 0xf43f5e, hex: '#f43f5e', nameHe: 'מגנט מטבעות', duration: 7.5 },
  shield: { icon: '🛡️', color: 0x06b6d4, hex: '#06b6d4', nameHe: 'מגן', duration: 12.0 },
  slowmo: { icon: '⏱️', color: 0x3b82f6, hex: '#3b82f6', nameHe: 'הילוך איטי', duration: 5.0 },
  double: { icon: '✖️2', color: 0xeab308, hex: '#eab308', nameHe: 'כפול מטבעות', duration: 8.5 }
};

export function getPowerupMeta(type) {
  return POWERUP_META[type] || null;
}

export class PickupManager3D {
  constructor(scene, track, worldTheme) {
    this.scene = scene;
    this.track = track;
    this.theme = worldTheme;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.coinMeshes = [];
    this.rampMeshes = [];
    this.powerupMeshes = [];
    this.obstacleMeshes = [];

    // Shared shiny 3D gold coin geometries & materials (metallic rim + embossed star + sparkle)
    this.coinGeo = new THREE.CylinderGeometry(0.56, 0.56, 0.12, 20);
    this.coinGeo.rotateX(Math.PI / 2);
    this.coinRimGeo = new THREE.TorusGeometry(0.54, 0.085, 8, 22);
    this.coinStarGeo = new THREE.OctahedronGeometry(0.24, 0);
    this.coinMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xca8a04,
      emissiveIntensity: 0.28,
      metalness: 0.88,
      roughness: 0.14
    });
    this.coinRimMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.35,
      metalness: 0.92,
      roughness: 0.1
    });

    const spCanvas = document.createElement('canvas');
    spCanvas.width = 64;
    spCanvas.height = 64;
    const spCtx = spCanvas.getContext('2d');
    const spGrad = spCtx.createRadialGradient(32, 32, 2, 32, 32, 30);
    spGrad.addColorStop(0, '#ffffff');
    spGrad.addColorStop(0.35, '#fef08a');
    spGrad.addColorStop(1, 'rgba(255,255,255,0)');
    spCtx.fillStyle = spGrad;
    spCtx.fillRect(0, 0, 64, 64);
    spCtx.fillStyle = '#ffffff';
    spCtx.fillRect(30, 8, 4, 48);
    spCtx.fillRect(8, 30, 48, 4);
    this.coinSparkleTex = new THREE.CanvasTexture(spCanvas);
    this.coinSparkleTex.colorSpace = THREE.SRGBColorSpace;

    this.rampGeo = new THREE.BufferGeometry();
    const hw = 1.35;
    const len = 4.2;
    const h = 1.05;
    // Wedge ramp rising toward -Z (ahead of car)
    const verts = new Float32Array([
      // Sloped top
      -hw, 0.06, len * 0.5,  hw, 0.06, len * 0.5,  hw, h, -len * 0.5,
      -hw, 0.06, len * 0.5,  hw, h, -len * 0.5,   -hw, h, -len * 0.5,
      // Back wall
      -hw, 0, -len * 0.5,   -hw, h, -len * 0.5,    hw, h, -len * 0.5,
      -hw, 0, -len * 0.5,    hw, h, -len * 0.5,    hw, 0, -len * 0.5,
      // Left side
      -hw, 0.06, len * 0.5, -hw, h, -len * 0.5,   -hw, 0, -len * 0.5,
      // Right side
       hw, 0.06, len * 0.5,  hw, 0, -len * 0.5,    hw, h, -len * 0.5
    ]);
    this.rampGeo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
    this.rampGeo.computeVertexNormals();
    this.rampMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xfacc15,
      emissiveIntensity: 0.5,
      roughness: 0.3,
      side: THREE.DoubleSide
    });

    this.powerupTextures = {};
    for (const [key, meta] of Object.entries(POWERUP_META)) {
      this.powerupTextures[key] = makePowerupLabelTex(meta.icon, meta.hex);
    }

    // Obstacle meshes (cone or crystal mine depending on world)
    this.coneGeo = new THREE.ConeGeometry(0.68, 1.45, 10);
    this.coneBaseGeo = new THREE.BoxGeometry(1.4, 0.16, 1.4);
    this.coneMat = new THREE.MeshStandardMaterial({
      color: worldTheme.neon ? 0xf43f5e : 0xf97316,
      emissive: worldTheme.neon ? 0xbe123c : 0x000000,
      emissiveIntensity: worldTheme.neon ? 0.65 : 0,
      roughness: 0.45
    });
    this.coneBaseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
  }

  buildAll({ coins, ramps, powerups, obstacles }, metersPerUnit) {
    this.clear();

    for (const c of coins) {
      const s = c.dist * metersPerUnit;
      const pos = this.track.getLanePosition(s, c.lane, 0.95);
      const wrap = new THREE.Group();
      wrap.position.copy(pos);

      const disc = new THREE.Mesh(this.coinGeo, this.coinMat);
      disc.castShadow = true;
      wrap.add(disc);

      const rim = new THREE.Mesh(this.coinRimGeo, this.coinRimMat);
      wrap.add(rim);

      const emblem = new THREE.Mesh(this.coinStarGeo, this.coinRimMat);
      emblem.scale.set(1, 1, 0.45);
      wrap.add(emblem);

      const sparkle = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: this.coinSparkleTex,
          transparent: true,
          opacity: 0.9,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        })
      );
      sparkle.position.set(0.36, 0.4, 0.12);
      sparkle.scale.set(0.65, 0.65, 1);
      wrap.add(sparkle);

      this.group.add(wrap);
      this.coinMeshes.push({ data: c, mesh: wrap, sparkle, s, basePos: pos.clone() });
    }

    for (const r of ramps) {
      const s = r.dist * metersPerUnit;
      const frame = this.track.getFrame(s);
      const pos = this.track.getLanePosition(s, r.lane, 0.04);
      const mesh = new THREE.Mesh(this.rampGeo, this.rampMat);
      mesh.position.copy(pos);
      mesh.rotation.y = frame.yaw;
      this.group.add(mesh);
      this.rampMeshes.push({ data: r, mesh, s });
    }

    for (const p of powerups) {
      const s = p.dist * metersPerUnit;
      const pos = this.track.getLanePosition(s, p.lane, 1.25);
      const meta = POWERUP_META[p.type] || POWERUP_META.magnet;

      const wrap = new THREE.Group();
      wrap.position.copy(pos);

      const halo = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.92, 0),
        new THREE.MeshStandardMaterial({
          color: meta.color,
          emissive: meta.color,
          emissiveIntensity: 0.65,
          transparent: true,
          opacity: 0.45,
          wireframe: true
        })
      );
      wrap.add(halo);

      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: this.powerupTextures[p.type], transparent: true })
      );
      sprite.scale.set(1.35, 1.35, 1);
      wrap.add(sprite);

      this.group.add(wrap);
      this.powerupMeshes.push({ data: p, mesh: wrap, halo, s, basePos: pos.clone() });
    }

    for (const o of obstacles) {
      const s = o.dist * metersPerUnit;
      const frame = this.track.getFrame(s);
      const pos = this.track.getLanePosition(s, o.lane, 0);

      const wrap = new THREE.Group();
      wrap.position.copy(pos);
      wrap.rotation.y = frame.yaw;

      const base = new THREE.Mesh(this.coneBaseGeo, this.coneBaseMat);
      base.position.y = 0.08;
      wrap.add(base);

      const cone = new THREE.Mesh(this.coneGeo, this.coneMat);
      cone.position.y = 0.85;
      cone.castShadow = true;
      wrap.add(cone);

      const stripe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.36, 0.48, 0.28, 10),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      stripe.position.y = 0.82;
      wrap.add(stripe);

      this.group.add(wrap);
      this.obstacleMeshes.push({ data: o, mesh: wrap, s });
    }
  }

  update(dt, time, playerS, playerPos, magnetActive) {
    // Animate & cull coins
    for (const item of this.coinMeshes) {
      if (item.data.collected) {
        item.mesh.visible = false;
        continue;
      }
      const dz = item.s - playerS;
      const inRange = dz > -12 && dz < 165;
      item.mesh.visible = inRange;
      if (!inRange) continue;

      if (magnetActive && dz > -4 && dz < 36) {
        item.mesh.position.lerp(playerPos.clone().add(new THREE.Vector3(0, 0.8, 0)), Math.min(1, dt * 11));
      } else {
        item.mesh.position.copy(item.basePos);
        item.mesh.position.y += Math.sin(time * 4.5 + item.s * 0.25) * 0.16;
      }
      item.mesh.rotation.y = time * 4.0 + item.s * 0.25;
      if (item.sparkle) {
        const pulse = 0.55 + Math.abs(Math.sin(time * 5.2 + item.s)) * 0.55;
        item.sparkle.scale.set(pulse, pulse, 1);
      }
    }

    for (const item of this.rampMeshes) {
      const dz = item.s - playerS;
      item.mesh.visible = dz > -15 && dz < 180;
    }

    for (const item of this.powerupMeshes) {
      if (item.data.collected) {
        item.mesh.visible = false;
        continue;
      }
      const dz = item.s - playerS;
      item.mesh.visible = dz > -12 && dz < 175;
      if (item.mesh.visible) {
        item.mesh.position.y = item.basePos.y + Math.sin(time * 3.5 + item.s) * 0.22;
        item.halo.rotation.y += dt * 2.4;
        item.halo.rotation.x += dt * 1.4;
      }
    }

    for (const item of this.obstacleMeshes) {
      const dz = item.s - playerS;
      item.mesh.visible = !item.data.hit && dz > -14 && dz < 175;
    }
  }

  clear() {
    for (const list of [this.coinMeshes, this.rampMeshes, this.powerupMeshes, this.obstacleMeshes]) {
      for (const item of list) {
        this.group.remove(item.mesh);
      }
    }
    this.coinMeshes = [];
    this.rampMeshes = [];
    this.powerupMeshes = [];
    this.obstacleMeshes = [];
  }
}
