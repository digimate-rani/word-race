// Stylized low-poly / toy-like 3D car builder (player, rival, boss) with rich rear detailing:
// flared wheel arches, rear diffuser with fins, glowing LED taillights + halo, 3-piece aero spoiler,
// 5-spoke rims, additive flame-sprite exhausts, and Boss Victory trophy.

import * as THREE from 'three';

function createExtrudedBody(width, length, heightPoints) {
  const shape = new THREE.Shape();
  shape.moveTo(-length * 0.5, 0.24);
  shape.lineTo(-length * 0.5, heightPoints[0]);
  shape.quadraticCurveTo(-length * 0.35, heightPoints[1], -length * 0.12, heightPoints[2]);
  shape.lineTo(length * 0.25, heightPoints[2]);
  shape.quadraticCurveTo(length * 0.45, heightPoints[3], length * 0.5, heightPoints[4]);
  shape.lineTo(length * 0.5, 0.22);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: width,
    bevelEnabled: true,
    bevelThickness: 0.16,
    bevelSize: 0.13,
    bevelSegments: 3
  });
  geo.translate(0, 0, -width * 0.5);
  geo.rotateY(-Math.PI / 2);
  return geo;
}

function makeGlowSpriteTexture(innerColor, midColor, outerColor) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 62);
  grad.addColorStop(0, innerColor);
  grad.addColorStop(0.35, midColor);
  grad.addColorStop(0.7, outerColor);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makePlateTexture(text, bgHex, fgHex) {
  const canvas = document.createElement('canvas');
  canvas.width = 160;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = bgHex;
  ctx.fillRect(0, 0, 160, 64);
  ctx.strokeStyle = fgHex;
  ctx.lineWidth = 5;
  ctx.strokeRect(4, 4, 152, 56);
  ctx.font = '700 32px "Fredoka", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = fgHex;
  ctx.fillText(text, 80, 34);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeBadgeTexture(emoji, label, isBoss) {
  const canvas = document.createElement('canvas');
  canvas.width = 288;
  canvas.height = 104;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, 288, 104);
  ctx.fillStyle = isBoss ? 'rgba(124, 58, 237, 0.94)' : 'rgba(15, 23, 42, 0.9)';
  ctx.strokeStyle = isBoss ? '#fde047' : '#38bdf8';
  ctx.lineWidth = 6;

  const r = 26;
  ctx.beginPath();
  ctx.moveTo(8 + r, 8);
  ctx.lineTo(280 - r, 8);
  ctx.quadraticCurveTo(280, 8, 280, 8 + r);
  ctx.lineTo(280, 92 - r);
  ctx.quadraticCurveTo(280, 92, 280 - r, 92);
  ctx.lineTo(8 + r, 92);
  ctx.quadraticCurveTo(8, 92, 8, 92 - r);
  ctx.lineTo(8, 8 + r);
  ctx.quadraticCurveTo(8, 8, 8 + r, 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  const labelText = `${emoji} ${label}`.trim();
  let fontSize = 35;
  ctx.font = `700 ${fontSize}px "Rubik", "Noto Color Emoji", sans-serif`;
  const textW = ctx.measureText(labelText).width;
  if (textW > 246) {
    fontSize = Math.max(22, Math.floor(fontSize * (246 / textW)));
    ctx.font = `700 ${fontSize}px "Rubik", "Noto Color Emoji", sans-serif`;
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(labelText, 144, 50);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

let sharedFlameOrangeTex = null;
let sharedFlameCyanTex = null;
let sharedTailGlowTex = null;

function getFlameTextures() {
  if (!sharedFlameOrangeTex) {
    sharedFlameOrangeTex = makeGlowSpriteTexture('#ffffff', '#fde047', 'rgba(249, 115, 22, 0.55)');
    sharedFlameCyanTex = makeGlowSpriteTexture('#ffffff', '#67e8f9', 'rgba(59, 130, 246, 0.55)');
    sharedTailGlowTex = makeGlowSpriteTexture('#ff8fa3', 'rgba(239, 68, 68, 0.6)', 'rgba(239, 68, 68, 0)');
  }
  return {
    orange: sharedFlameOrangeTex,
    cyan: sharedFlameCyanTex,
    tail: sharedTailGlowTex
  };
}

export class Car3D {
  constructor(skin, options = {}) {
    this.skin = skin;
    this.isBoss = Boolean(options.isBoss);
    this.isRival = Boolean(options.isRival);
    this.root = new THREE.Group();
    this.flipGroup = new THREE.Group();
    this.bodyGroup = new THREE.Group();
    this.root.add(this.flipGroup);
    this.flipGroup.add(this.bodyGroup);

    this.wheels = [];
    this.frontWheelPivots = [];
    this.flames = [];
    this.tailLights = [];
    this.tailHalos = [];
    this.rainbowMats = [];

    this._build(options);
  }

  _build(options) {
    const scale = this.isBoss ? 1.28 : 1.0;
    this.flipGroup.scale.setScalar(scale);
    const textures = getFlameTextures();

    // Ground shadow disc
    const shadowGeo = new THREE.CircleGeometry(1.7 * scale, 22);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x0f172a,
      transparent: true,
      opacity: 0.38,
      depthWrite: false
    });
    this.shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowMesh.position.y = 0.05;
    this.root.add(this.shadowMesh);

    const bodyMat = new THREE.MeshStandardMaterial({
      color: this.skin.bodyColor || '#ef4444',
      roughness: this.skin.paintRoughness !== undefined ? this.skin.paintRoughness : 0.24,
      metalness: this.skin.paintMetalness !== undefined ? this.skin.paintMetalness : 0.3
    });
    const shadeMat = new THREE.MeshStandardMaterial({
      color: this.skin.shadeColor || '#b91c1c',
      roughness: 0.38,
      metalness: 0.28
    });
    const carbonMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.55,
      metalness: 0.35
    });
    const accentMat = new THREE.MeshStandardMaterial({
      color: this.skin.accentColor || '#fde047',
      roughness: 0.22,
      metalness: 0.4
    });
    const stripeMat = new THREE.MeshStandardMaterial({
      color: this.skin.stripeColor || '#ffffff',
      roughness: 0.24,
      metalness: 0.18
    });
    if (this.skin.rainbow) {
      this.rainbowMats.push(stripeMat);
    }

    const windowMat = new THREE.MeshStandardMaterial({
      color: this.skin.windowColor || '#38bdf8',
      roughness: 0.1,
      metalness: 0.6
    });

    // Wide sculpted side skirts & rear bumper apron
    const skirt = new THREE.Mesh(new THREE.BoxGeometry(1.94, 0.26, 3.52), carbonMat);
    skirt.position.set(0, 0.34, 0);
    skirt.castShadow = true;
    this.bodyGroup.add(skirt);

    // Flared sculpted wheel arch fenders (front & rear)
    for (const fx of [-0.94, 0.94]) {
      for (const fz of [-1.1, 1.08]) {
        const arch = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.56, 0.34, 12, 1, false, 0, Math.PI), shadeMat);
        arch.rotation.z = Math.PI / 2;
        arch.rotation.y = Math.PI / 2;
        arch.position.set(fx, 0.44, fz);
        arch.castShadow = true;
        this.bodyGroup.add(arch);
      }
    }

    // Sculpted beveled main chassis (sleek nose at -Z, muscular wide rear haunches at +Z)
    const chassisGeo = createExtrudedBody(1.56, 3.45, [0.5, 0.72, 0.88, 0.96, 0.88]);
    const chassis = new THREE.Mesh(chassisGeo, bodyMat);
    chassis.position.set(0, 0.16, 0);
    chassis.castShadow = true;
    chassis.receiveShadow = true;
    this.bodyGroup.add(chassis);

    // Sporty tapered cabin
    const cabinGeo = createExtrudedBody(1.18, 1.78, [0.46, 0.74, 0.78, 0.74, 0.52]);
    const cabin = new THREE.Mesh(cabinGeo, bodyMat);
    cabin.position.set(0, 0.8, 0.22);
    cabin.castShadow = true;
    this.bodyGroup.add(cabin);

    // Front & rear windshields + glossy rear engine louver glass
    const glassFront = new THREE.Mesh(new THREE.BoxGeometry(1.14, 0.38, 0.16), windowMat);
    glassFront.position.set(0, 1.24, -0.54);
    glassFront.rotation.x = -0.54;
    this.bodyGroup.add(glassFront);

    const glassRear = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.38, 0.16), windowMat);
    glassRear.position.set(0, 1.26, 0.96);
    glassRear.rotation.x = 0.56;
    this.bodyGroup.add(glassRear);

    // Rear louver slats on rear glass for supercar silhouette
    for (let i = 0; i < 3; i++) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.04, 0.12), carbonMat);
      slat.position.set(0, 1.36 - i * 0.11, 0.88 + i * 0.11);
      slat.rotation.x = 0.25;
      this.bodyGroup.add(slat);
    }

    // Twin tapered racing stripes (hood, roof, rear deck)
    for (const sx of [-0.17, 0.17]) {
      const hoodStripe = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 1.18), stripeMat);
      hoodStripe.position.set(sx, 0.92, -1.06);
      hoodStripe.rotation.x = 0.18;
      this.bodyGroup.add(hoodStripe);

      const roofStripe = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 1.25), stripeMat);
      roofStripe.position.set(sx, 1.68, 0.2);
      this.bodyGroup.add(roofStripe);

      const rearStripe = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 0.68), stripeMat);
      rearStripe.position.set(sx, 1.12, 1.44);
      rearStripe.rotation.x = -0.14;
      this.bodyGroup.add(rearStripe);
    }

    // Sculpted Rear Wing Spoiler (supports Garage 2.0 spoiler upgrades!)
    const spoilerStyle = this.skin.spoilerStyle || 'standard';
    if (this.skin.spoiler !== false) {
      for (const sx of [-0.52, 0.52]) {
        const strutH = spoilerStyle === 'twin_deck' ? 0.54 : 0.36;
        const strut = new THREE.Mesh(new THREE.BoxGeometry(0.1, strutH, 0.24), carbonMat);
        strut.position.set(sx, 1.08 + strutH * 0.42, 1.54);
        strut.rotation.x = 0.16;
        this.bodyGroup.add(strut);
      }

      if (spoilerStyle === 'twin_deck') {
        for (const wy of [1.38, 1.62]) {
          const wing = new THREE.Mesh(new THREE.BoxGeometry(1.94, 0.08, 0.4), accentMat);
          wing.position.set(0, wy, 1.63);
          wing.rotation.x = 0.16;
          wing.castShadow = true;
          this.bodyGroup.add(wing);
        }
        for (const ex of [-0.98, 0.98]) {
          const endplate = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.46, 0.56), shadeMat);
          endplate.position.set(ex, 1.48, 1.63);
          this.bodyGroup.add(endplate);
        }
      } else if (spoilerStyle === 'dragon_fins') {
        const mainWing = new THREE.Mesh(new THREE.BoxGeometry(1.88, 0.09, 0.42), accentMat);
        mainWing.position.set(0, 1.4, 1.62);
        mainWing.rotation.x = 0.18;
        this.bodyGroup.add(mainWing);
        for (const fx of [-0.88, 0.88]) {
          const fin = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.58, 0.62), bodyMat);
          fin.position.set(fx, 1.54, 1.62);
          fin.rotation.z = fx > 0 ? -0.24 : 0.24;
          this.bodyGroup.add(fin);
        }
        const dorsal = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.42, 0.72), accentMat);
        dorsal.position.set(0, 1.66, 1.38);
        this.bodyGroup.add(dorsal);
      } else if (spoilerStyle === 'hyper_neon') {
        const mainWing = new THREE.Mesh(new THREE.BoxGeometry(2.04, 0.11, 0.48), carbonMat);
        mainWing.position.set(0, 1.46, 1.64);
        mainWing.rotation.x = 0.18;
        mainWing.castShadow = true;
        this.bodyGroup.add(mainWing);
        const neonBar = new THREE.Mesh(
          new THREE.BoxGeometry(2.06, 0.07, 0.12),
          new THREE.MeshBasicMaterial({ color: 0x22d3ee })
        );
        neonBar.position.set(0, 1.48, 1.86);
        this.bodyGroup.add(neonBar);
        for (const ex of [-1.04, 1.04]) {
          const endplate = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.4, 0.62), accentMat);
          endplate.position.set(ex, 1.44, 1.64);
          this.bodyGroup.add(endplate);
        }
      } else {
        const mainWing = new THREE.Mesh(new THREE.BoxGeometry(1.88, 0.1, 0.44), accentMat);
        mainWing.position.set(0, 1.42, 1.62);
        mainWing.rotation.x = 0.18;
        mainWing.castShadow = true;
        this.bodyGroup.add(mainWing);

        const wingEdge = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.06, 0.12), bodyMat);
        wingEdge.position.set(0, 1.46, 1.8);
        this.bodyGroup.add(wingEdge);

        for (const ex of [-0.96, 0.96]) {
          const endplate = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.34, 0.56), shadeMat);
          endplate.position.set(ex, 1.4, 1.62);
          endplate.rotation.x = 0.12;
          this.bodyGroup.add(endplate);
        }
      }
    }

    // Recessed Dark Rear Diffuser + 4 Vertical Aero Fins
    const diffuser = new THREE.Mesh(new THREE.BoxGeometry(1.66, 0.34, 0.24), carbonMat);
    diffuser.position.set(0, 0.42, 1.82);
    this.bodyGroup.add(diffuser);
    for (const fx of [-0.52, -0.18, 0.18, 0.52]) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.3, 0.3), shadeMat);
      fin.position.set(fx, 0.38, 1.86);
      this.bodyGroup.add(fin);
    }

    // Rear License Plate Badge ("WR-3D" / "RIVAL" / "BOSS")
    const plateText = this.isBoss ? 'BOSS' : this.isRival ? 'RIVAL' : 'WR-3D';
    const plateBg = this.isBoss ? '#7c3aed' : this.isRival ? '#0284c7' : '#0f172a';
    const plateFg = this.isBoss ? '#fde047' : '#ffffff';
    const plate = new THREE.Mesh(
      new THREE.PlaneGeometry(0.68, 0.26),
      new THREE.MeshBasicMaterial({ map: makePlateTexture(plateText, plateBg, plateFg) })
    );
    plate.position.set(0, 0.74, 1.89);
    this.bodyGroup.add(plate);

    // Headlights (front -Z)
    const headMat = new THREE.MeshStandardMaterial({
      color: 0xfef9c3,
      emissive: 0xfef08a,
      emissiveIntensity: 0.95
    });
    for (const hx of [-0.58, 0.58]) {
      const hl = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), headMat);
      hl.scale.set(1.2, 0.75, 0.6);
      hl.position.set(hx, 0.64, -1.78);
      this.bodyGroup.add(hl);
    }

    // Dual Glowing LED Taillights + Additive Bloom Halo Sprites
    for (const tx of [-0.62, 0.62]) {
      const housing = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.2, 0.1), carbonMat);
      housing.position.set(tx, 0.82, 1.86);
      this.bodyGroup.add(housing);

      const tailMat = new THREE.MeshStandardMaterial({
        color: 0xff2e54,
        emissive: 0xff1e42,
        emissiveIntensity: 1.5
      });
      const tl = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.13, 0.12), tailMat);
      tl.position.set(tx, 0.82, 1.88);
      this.bodyGroup.add(tl);
      this.tailLights.push(tailMat);

      const halo = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: textures.tail,
          transparent: true,
          opacity: 0.7,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        })
      );
      halo.position.set(tx, 0.82, 1.98);
      halo.scale.set(0.95, 0.58, 1);
      this.bodyGroup.add(halo);
      this.tailHalos.push(halo);
    }

    // Twin Chrome Exhausts + Layered Soft Additive Flame Sprites (never carrot cones!)
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.88, roughness: 0.14 });
    const innerPipeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    for (const ex of [-0.38, 0.38]) {
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.13, 0.34, 12), chromeMat);
      pipe.rotation.x = Math.PI / 2;
      pipe.position.set(ex, 0.38, 1.92);
      this.bodyGroup.add(pipe);

      const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.35, 10), innerPipeMat);
      hole.rotation.x = Math.PI / 2;
      hole.position.set(ex, 0.38, 1.93);
      this.bodyGroup.add(hole);

      const puffs = [];
      for (let p = 0; p < 3; p++) {
        const spMat = new THREE.SpriteMaterial({
          map: textures.orange,
          transparent: true,
          opacity: 0.9 - p * 0.22,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });
        const sp = new THREE.Sprite(spMat);
        sp.position.set(ex, 0.38, 2.15 + p * 0.34);
        sp.visible = false;
        this.bodyGroup.add(sp);
        puffs.push({ sprite: sp, mat: spMat, index: p });
      }
      this.flames.push({ ex, puffs });
    }

    // 4 Detailed Chunky Wheels (supports Garage 2.0 wheel upgrades!)
    const wheelStyle = this.skin.wheelStyle || 'standard';
    const wheelScale = wheelStyle === 'monster_track' ? 1.16 : 1.0;
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.72 });
    const rimColor = wheelStyle === 'gold_mesh'
      ? '#facc15'
      : wheelStyle === 'neon_cyan'
        ? '#22d3ee'
        : wheelStyle === 'monster_track'
          ? '#f43f5e'
          : wheelStyle === 'turbo_blade'
            ? '#ffffff'
            : (this.skin.accentColor || '#facc15');
    const rimMat = new THREE.MeshStandardMaterial({
      color: rimColor,
      emissive: wheelStyle === 'neon_cyan' ? 0x06b6d4 : 0x000000,
      emissiveIntensity: wheelStyle === 'neon_cyan' ? 0.85 : 0,
      metalness: 0.68,
      roughness: 0.18
    });
    const hubMat = new THREE.MeshStandardMaterial({
      color: wheelStyle === 'gold_mesh' ? 0xfde047 : 0xe2e8f0,
      metalness: 0.82,
      roughness: 0.14
    });
    const wheelCoords = [
      { x: -0.98, z: -1.1, front: true },
      { x: 0.98, z: -1.1, front: true },
      { x: -0.98, z: 1.08, front: false },
      { x: 0.98, z: 1.08, front: false }
    ];

    for (const wc of wheelCoords) {
      const pivot = new THREE.Group();
      pivot.position.set(wc.x * (wheelStyle === 'monster_track' ? 1.06 : 1), 0.43 * wheelScale, wc.z);
      this.bodyGroup.add(pivot);
      if (wc.front) this.frontWheelPivots.push(pivot);

      const wheelMesh = new THREE.Group();
      wheelMesh.scale.setScalar(wheelScale);
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.43, 0.34, 16), tireMat);
      tire.rotation.z = Math.PI / 2;
      tire.castShadow = true;
      wheelMesh.add(tire);

      const rimRing = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.28, 0.36, 12),
        wheelStyle === 'neon_cyan' ? rimMat : carbonMat
      );
      rimRing.rotation.z = Math.PI / 2;
      wheelMesh.add(rimRing);

      const spokeCount = wheelStyle === 'gold_mesh' ? 8 : wheelStyle === 'turbo_blade' ? 6 : 5;
      const sideSign = wc.x > 0 ? 1 : -1;
      for (let s = 0; s < spokeCount; s++) {
        const spoke = new THREE.Mesh(
          new THREE.BoxGeometry(0.05, wheelStyle === 'turbo_blade' ? 0.52 : 0.46, 0.08),
          rimMat
        );
        spoke.position.x = sideSign * 0.17;
        spoke.rotation.x = (s * Math.PI) / spokeCount;
        wheelMesh.add(spoke);
      }

      if (wheelStyle === 'neon_cyan' || wheelStyle === 'monster_track') {
        const glowRing = new THREE.Mesh(
          new THREE.TorusGeometry(0.32, 0.035, 8, 20),
          wheelStyle === 'neon_cyan' ? new THREE.MeshBasicMaterial({ color: 0x22d3ee }) : rimMat
        );
        glowRing.rotation.y = Math.PI / 2;
        glowRing.position.x = sideSign * 0.18;
        wheelMesh.add(glowRing);
      }

      const centerCap = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.39, 8), hubMat);
      centerCap.rotation.z = Math.PI / 2;
      wheelMesh.add(centerCap);

      pivot.add(wheelMesh);
      this.wheels.push(wheelMesh);
    }

    // Power-up Auras (Player car)
    if (!this.isRival) {
      this.shieldMesh = new THREE.Mesh(
        new THREE.IcosahedronGeometry(2.4, 1),
        new THREE.MeshBasicMaterial({
          color: 0x22d3ee,
          wireframe: true,
          transparent: true,
          opacity: 0.55
        })
      );
      this.shieldMesh.position.set(0, 0.95, 0);
      this.shieldMesh.visible = false;
      this.bodyGroup.add(this.shieldMesh);

      this.magnetGroup = new THREE.Group();
      const magMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.78 });
      for (let i = 0; i < 2; i++) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.06, 6, 24), magMat);
        ring.rotation.x = Math.PI / 2 + (i === 0 ? 0.35 : -0.35);
        this.magnetGroup.add(ring);
      }
      this.magnetGroup.position.set(0, 0.85, 0);
      this.magnetGroup.visible = false;
      this.bodyGroup.add(this.magnetGroup);
    }

    // Rival distinct neon roof fin + underglow so it is unmistakable on track
    if (this.isRival) {
      const underColor = this.isBoss ? 0xf43f5e : 0x38bdf8;
      const underglow = new THREE.Mesh(
        new THREE.PlaneGeometry(2.35, 4.1),
        new THREE.MeshBasicMaterial({ color: underColor, transparent: true, opacity: 0.55, side: THREE.DoubleSide })
      );
      underglow.rotation.x = -Math.PI / 2;
      underglow.position.y = 0.08;
      this.bodyGroup.add(underglow);
    }

    // Boss special visuals: Golden Crown
    if (this.isBoss) {
      const goldMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.55,
        metalness: 0.75,
        roughness: 0.18
      });
      const crownBase = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.38, 0.24, 8), goldMat);
      crownBase.position.set(0, 1.84, 0.22);
      this.bodyGroup.add(crownBase);

      for (let i = 0; i < 5; i++) {
        const ang = (i / 5) * Math.PI * 2;
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.36, 5), goldMat);
        spike.position.set(Math.cos(ang) * 0.35, 2.04, 0.22 + Math.sin(ang) * 0.35);
        this.bodyGroup.add(spike);
      }
    }

    // Floating Rival / Boss Name & Face Badge
    this.badgeBaseY = this.isBoss ? 2.85 : 2.45;
    this.badgeBaseScaleW = 2.55;
    this.badgeBaseScaleH = 0.94;
    if (this.isRival && options.badgeEmoji) {
      const tex = makeBadgeTexture(options.badgeEmoji, options.badgeName || '', this.isBoss);
      const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
      this.badgeSprite = new THREE.Sprite(spriteMat);
      this.badgeSprite.scale.set(this.badgeBaseScaleW, this.badgeBaseScaleH, 1);
      this.badgeSprite.position.set(0, this.badgeBaseY, 0);
      this.flipGroup.add(this.badgeSprite);
    }
  }

  clampBadgeToViewport(camera, aspect = 1.5, viewportWidth = 1280) {
    if (!this.badgeSprite || !camera) return;
    this.badgeSprite.position.set(0, this.badgeBaseY, 0);
    this.badgeSprite.scale.set(this.badgeBaseScaleW, this.badgeBaseScaleH, 1);
    this.root.updateMatrixWorld(true);
    camera.updateMatrixWorld(true);

    const worldAnchor = new THREE.Vector3();
    this.badgeSprite.getWorldPosition(worldAnchor);

    const camPos = camera.position;
    const camForward = new THREE.Vector3();
    camera.getWorldDirection(camForward);
    const toBadge = worldAnchor.clone().sub(camPos);
    const forwardDist = toBadge.dot(camForward);

    // Fade out cleanly when rival is behind or very close next to the camera
    if (forwardDist <= 1.2) {
      this.badgeSprite.visible = false;
      return;
    }
    this.badgeSprite.visible = true;
    this.badgeSprite.material.opacity = forwardDist < 4.5
      ? Math.max(0.05, Math.min(1, (forwardDist - 1.2) / 3.3))
      : 1;

    const halfViewH = Math.max(0.25, forwardDist * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)));
    const safeAspect = Math.max(0.35, aspect);
    const halfViewW = Math.max(0.35, halfViewH * safeAspect);

    // Cap rendered on-screen pixel width (~210px max on desktop, ~156px on phone portrait)
    const viewportH = Math.max(200, viewportWidth / safeAspect);
    const pxPerWorldUnit = viewportH / (2 * halfViewH);
    const maxPxWidth = safeAspect < 1 ? 156 : 210;
    const maxWorldWByPx = maxPxWidth / Math.max(1, pxPerWorldUnit);

    const wScale = Math.min(this.badgeBaseScaleW, Math.max(0.55, maxWorldWByPx));
    const hScale = this.badgeBaseScaleH * (wScale / this.badgeBaseScaleW);
    this.badgeSprite.scale.set(wScale, hScale, 1);

    const ndc = worldAnchor.clone().project(camera);
    if (ndc.z < -1 || ndc.z > 1) return;

    const halfNdcX = (wScale * 0.5) / halfViewW;
    const halfNdcY = (hScale * 0.5) / halfViewH;
    const minX = -0.92 + halfNdcX;
    const maxX = 0.92 - halfNdcX;
    const minY = -0.86 + halfNdcY;
    const maxY = 0.88 - halfNdcY;

    const clampedX = minX <= maxX ? Math.max(minX, Math.min(maxX, ndc.x)) : 0;
    const clampedY = minY <= maxY ? Math.max(minY, Math.min(maxY, ndc.y)) : ndc.y;

    if (Math.abs(clampedX - ndc.x) > 0.001 || Math.abs(clampedY - ndc.y) > 0.001) {
      ndc.x = clampedX;
      ndc.y = clampedY;
      ndc.unproject(camera);
      this.flipGroup.worldToLocal(ndc);
      this.badgeSprite.position.copy(ndc);
    }
  }

  updateVisuals(dt, opts = {}) {
    const {
      speed = 1,
      time = 0,
      steerDelta = 0,
      boosted = false,
      nitro = false,
      wobbleTimer = 0,
      jumpAirT = 0,
      powerup = null
    } = opts;

    const wheelSpin = speed * dt * 16;
    for (const w of this.wheels) {
      w.rotation.x -= wheelSpin;
    }

    const targetSteerAngle = Math.max(-0.4, Math.min(0.4, -steerDelta * 0.45));
    for (const fp of this.frontWheelPivots) {
      fp.rotation.y = targetSteerAngle;
    }

    const bounce = jumpAirT > 0 ? 0 : Math.sin(time * (14 + speed * 5)) * 0.035;
    const roll = Math.max(-0.22, Math.min(0.22, -steerDelta * 0.24));
    const wobbleYaw = wobbleTimer > 0 ? Math.sin((wobbleTimer / 0.6) * Math.PI * 4) * 0.48 : 0;
    const pitch = nitro ? 0.075 : boosted ? 0.035 : 0;

    this.bodyGroup.position.y = bounce;
    this.bodyGroup.rotation.set(pitch, wobbleYaw, roll);

    if (jumpAirT > 0) {
      const airArc = Math.sin(jumpAirT * Math.PI) * 3.6;
      this.flipGroup.position.y = airArc;
      this.flipGroup.rotation.x = -jumpAirT * Math.PI * 2;
      const shScale = Math.max(0.45, 1 - airArc * 0.14);
      this.shadowMesh.scale.setScalar(shScale);
      this.shadowMesh.material.opacity = 0.38 * shScale;
    } else {
      this.flipGroup.position.y = 0;
      this.flipGroup.rotation.x = 0;
      this.shadowMesh.scale.setScalar(1);
      this.shadowMesh.material.opacity = 0.38;
    }

    // Soft glowing exhaust flame sprites (no carrot cones!)
    const showFlames = boosted || nitro;
    const textures = getFlameTextures();
    for (const f of this.flames) {
      for (const puff of f.puffs) {
        puff.sprite.visible = showFlames;
        if (showFlames) {
          puff.mat.map = nitro ? textures.cyan : textures.orange;
          const flick = 0.8 + Math.sin(time * 48 + puff.index * 2.1) * 0.28;
          const baseSize = (nitro ? 0.92 : 0.62) * (1 - puff.index * 0.2) * flick;
          puff.sprite.scale.set(baseSize, baseSize * 1.15, 1);
          puff.sprite.position.z = 2.08 + puff.index * (nitro ? 0.46 : 0.3) + Math.sin(time * 60 + puff.index) * 0.05;
        }
      }
    }

    // Taillight glow flare
    for (const tm of this.tailLights) {
      tm.emissiveIntensity = wobbleTimer > 0 ? 2.8 : 1.4;
    }
    for (const th of this.tailHalos) {
      th.material.opacity = wobbleTimer > 0 ? 0.95 : 0.55;
      const sc = wobbleTimer > 0 ? 1.35 : 0.95;
      th.scale.set(sc, sc * 0.6, 1);
    }

    for (const rm of this.rainbowMats) {
      rm.color.setHSL((time * 0.45) % 1, 0.9, 0.58);
    }

    if (this.shieldMesh) {
      this.shieldMesh.visible = powerup === 'shield';
      if (this.shieldMesh.visible) {
        this.shieldMesh.rotation.y += dt * 1.8;
        this.shieldMesh.rotation.x += dt * 0.9;
      }
    }
    if (this.magnetGroup) {
      this.magnetGroup.visible = powerup === 'magnet';
      if (this.magnetGroup.visible) {
        this.magnetGroup.rotation.y += dt * 4.5;
      }
    }
  }
}

export function buildTrophyMesh() {
  const group = new THREE.Group();
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.45,
    metalness: 0.78,
    roughness: 0.18
  });
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.3, 0.8, 12), baseMat);
  base.position.y = 0.4;
  group.add(base);

  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.45, 1.3, 10), goldMat);
  stem.position.y = 1.45;
  group.add(stem);

  const cup = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 0.45, 1.6, 14), goldMat);
  cup.position.y = 2.75;
  group.add(cup);

  for (const side of [-1, 1]) {
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.1, 8, 16, Math.PI), goldMat);
    handle.rotation.z = side * (Math.PI / 2);
    handle.position.set(side * 1.0, 2.8, 0);
    group.add(handle);
  }

  return group;
}
