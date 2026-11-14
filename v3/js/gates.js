// 3D Word Gate arches with large high-contrast banners (English words OR Picture/Hebrew signs for Step 1),
// readable from far down the road, with confetti glow on correct and 3D shatter on wrong.

import * as THREE from 'three';
import { LANE_WIDTH } from './track.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawGateBannerTexture(wordObj, bgColor, signMode = 'word', borderColor = '#ffffff') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 288;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, 512, 288);

  // Outer dark rim
  ctx.fillStyle = '#0f172a';
  roundRect(ctx, 4, 4, 504, 280, 42);
  ctx.fill();

  // Inner bright border
  ctx.fillStyle = borderColor;
  roundRect(ctx, 13, 13, 486, 262, 34);
  ctx.fill();

  // Saturated main banner
  ctx.fillStyle = bgColor;
  roundRect(ctx, 22, 22, 468, 244, 28);
  ctx.fill();

  // Glossy top specular strip
  ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
  roundRect(ctx, 34, 30, 444, 76, 18);
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (signMode === 'picture') {
    if (wordObj.emoji) {
      // Full-bleed bright picture billboard framed by world color so emoji reads from far away
      ctx.fillStyle = '#ffffff';
      roundRect(ctx, 26, 24, 460, 240, 24);
      ctx.fill();

      // Subtle glossy highlight across upper third of billboard
      ctx.fillStyle = 'rgba(226, 232, 240, 0.55)';
      roundRect(ctx, 32, 28, 448, 84, 18);
      ctx.fill();

      ctx.shadowColor = 'rgba(15, 23, 42, 0.18)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 4;
      ctx.font = '198px "Noto Color Emoji", "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
      ctx.fillText(wordObj.emoji, 256, 152);
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
    } else {
      // Fallback for emoji: null -> Hebrew word on sign
      let fontSize = 96;
      ctx.font = `900 ${fontSize}px "Rubik", system-ui, sans-serif`;
      const width = ctx.measureText(wordObj.he).width;
      const maxW = 430;
      if (width > maxW) {
        fontSize = Math.max(46, Math.floor(fontSize * (maxW / width)));
        ctx.font = `900 ${fontSize}px "Rubik", system-ui, sans-serif`;
      }
      ctx.lineJoin = 'round';
      ctx.lineWidth = Math.max(12, fontSize * 0.22);
      ctx.strokeStyle = '#0f172a';
      ctx.strokeText(wordObj.he, 256, 148);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(wordObj.he, 256, 148);
    }
  } else {
    // Large, high-contrast English word
    const text = wordObj.en;
    let fontSize = 118;
    ctx.font = `700 ${fontSize}px "Fredoka", system-ui, sans-serif`;
    const width = ctx.measureText(text).width;
    const maxW = 434;
    if (width > maxW) {
      fontSize = Math.max(50, Math.floor(fontSize * (maxW / width)));
      ctx.font = `700 ${fontSize}px "Fredoka", system-ui, sans-serif`;
    }

    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(12, fontSize * 0.22);
    ctx.strokeStyle = '#0f172a';
    ctx.strokeText(text, 256, 148);

    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, 256, 148);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export class GateManager3D {
  constructor(scene, track, worldTheme) {
    this.scene = scene;
    this.track = track;
    this.theme = worldTheme;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.gateEntries = [];
    this.shards = [];
    this.signMode = 'word';

    this.pillarGeo = new THREE.CylinderGeometry(0.17, 0.22, 3.8, 8);
    this.signGeo = new THREE.BoxGeometry(3.52, 2.02, 0.34);
    this.shardGeo = new THREE.BoxGeometry(0.48, 0.48, 0.26);
    this.pillarMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.28, metalness: 0.22 });
    this.sideMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
  }

  buildGates(gates, metersPerUnit, signMode = 'word') {
    this.clear();
    this.signMode = signMode;
    const palette = this.theme.gatePalette || ['#f97316', '#0ea5e9', '#a855f7'];

    for (const gate of gates) {
      const s = gate.dist * metersPerUnit;
      const frame = this.track.getFrame(s);

      const rowGroup = new THREE.Group();
      rowGroup.position.copy(frame.pos);
      rowGroup.rotation.y = frame.yaw;

      const laneMeshes = [];
      for (let lane = 0; lane < 3; lane++) {
        const laneX = (lane - 1) * LANE_WIDTH;
        const wordObj = gate.lanes[lane];
        const baseColor = palette[lane % palette.length];

        const arch = new THREE.Group();
        arch.position.set(laneX, 0, 0);

        const postL = new THREE.Mesh(this.pillarGeo, this.pillarMat);
        postL.position.set(-1.58, 1.9, 0);
        postL.castShadow = true;
        arch.add(postL);

        const postR = new THREE.Mesh(this.pillarGeo, this.pillarMat);
        postR.position.set(1.58, 1.9, 0);
        postR.castShadow = true;
        arch.add(postR);

        const tex = drawGateBannerTexture(wordObj, baseColor, signMode);
        const frontMat = new THREE.MeshStandardMaterial({
          map: tex,
          emissive: 0xffffff,
          emissiveMap: tex,
          emissiveIntensity: 0.42,
          roughness: 0.32
        });

        const materials = [
          this.sideMat,
          this.sideMat,
          this.sideMat,
          this.sideMat,
          frontMat,
          this.sideMat
        ];
        const sign = new THREE.Mesh(this.signGeo, materials);
        sign.position.set(0, 3.55, 0);
        sign.rotation.x = 0.08;
        sign.castShadow = true;
        arch.add(sign);

        rowGroup.add(arch);
        laneMeshes.push({ arch, sign, frontMat, baseColor, wordObj, tex });
      }

      this.group.add(rowGroup);
      this.gateEntries.push({ gate, rowGroup, laneMeshes, s });
    }
  }

  triggerGateResult(gate, isCorrect, chosenLane) {
    const entry = this.gateEntries.find((e) => e.gate === gate);
    if (!entry) return;

    const correctLane = gate.correctLane;
    const correctObj = entry.laneMeshes[correctLane];
    if (correctObj) {
      const greenTex = drawGateBannerTexture(correctObj.wordObj, '#22c55e', this.signMode, '#fef08a');
      correctObj.frontMat.map = greenTex;
      correctObj.frontMat.emissiveMap = greenTex;
      correctObj.frontMat.emissiveIntensity = 0.85;
      correctObj.frontMat.needsUpdate = true;
      correctObj.tex.dispose();
      correctObj.tex = greenTex;
    }

    if (!isCorrect && chosenLane >= 0 && chosenLane < 3) {
      const wrongObj = entry.laneMeshes[chosenLane];
      if (wrongObj) {
        wrongObj.sign.visible = false;
        const worldPos = new THREE.Vector3();
        wrongObj.sign.getWorldPosition(worldPos);
        this._spawnShatter(worldPos, wrongObj.baseColor);
      }
    }
  }

  _spawnShatter(origin, colorHex) {
    const mat = new THREE.MeshStandardMaterial({
      color: colorHex,
      emissive: 0xef4444,
      emissiveIntensity: 0.4,
      roughness: 0.4
    });
    for (let i = 0; i < 18; i++) {
      const mesh = new THREE.Mesh(this.shardGeo, mat);
      mesh.position.copy(origin).add(
        new THREE.Vector3((Math.random() - 0.5) * 2.8, (Math.random() - 0.5) * 1.4, (Math.random() - 0.5) * 0.4)
      );
      this.group.add(mesh);
      this.shards.push({
        mesh,
        vel: new THREE.Vector3((Math.random() - 0.5) * 14, 3 + Math.random() * 8, (Math.random() - 0.5) * 10),
        rotVel: new THREE.Vector3((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12),
        life: 1.1
      });
    }
  }

  update(dt, playerS) {
    for (const entry of this.gateEntries) {
      const dz = entry.s - playerS;
      entry.rowGroup.visible = dz > -18 && dz < 280;
    }

    for (let i = this.shards.length - 1; i >= 0; i--) {
      const sh = this.shards[i];
      sh.life -= dt;
      sh.vel.y -= 22 * dt;
      sh.mesh.position.addScaledVector(sh.vel, dt);
      sh.mesh.rotation.x += sh.rotVel.x * dt;
      sh.mesh.rotation.y += sh.rotVel.y * dt;
      sh.mesh.rotation.z += sh.rotVel.z * dt;
      const sc = Math.max(0.01, sh.life / 1.1);
      sh.mesh.scale.setScalar(sc);
      if (sh.life <= 0) {
        this.group.remove(sh.mesh);
        this.shards.splice(i, 1);
      }
    }
  }

  clear() {
    for (const entry of this.gateEntries) {
      for (const lm of entry.laneMeshes) {
        lm.tex.dispose();
        lm.frontMat.dispose();
      }
      this.group.remove(entry.rowGroup);
    }
    for (const sh of this.shards) {
      this.group.remove(sh.mesh);
    }
    this.gateEntries = [];
    this.shards = [];
  }
}
