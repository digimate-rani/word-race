// Curving, rising & falling 3D track geometry, sky gradient dome, finish gantry, and weather particles.

import * as THREE from 'three';

export const LANE_WIDTH = 3.6;
export const ROAD_HALF_W = 5.9;
export const CURB_W = 0.9;

function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function makeRoadTexture(theme) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Subtle asphalt alternating bands
  ctx.fillStyle = theme.roadA;
  ctx.fillRect(0, 0, 512, 256);
  ctx.fillStyle = theme.roadB;
  ctx.fillRect(0, 256, 512, 256);

  // Subtle surface grain for speed perception
  for (let i = 0; i < 650; i++) {
    const x = (i * 73) % 512;
    const y = (i * 137) % 512;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)';
    ctx.fillRect(x, y, 4, 8);
  }

  // Outer edge white/bright borders
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fillRect(10, 0, 10, 512);
  ctx.fillRect(492, 0, 10, 512);

  // Two lane divider dashed stripes (splitting 3 equal lanes)
  ctx.fillStyle = theme.stripe || '#ffffff';
  const lane1X = Math.round(512 * (1 / 3)) - 6;
  const lane2X = Math.round(512 * (2 / 3)) - 6;
  for (let y = 24; y < 512; y += 128) {
    ctx.fillRect(lane1X, y, 12, 74);
    ctx.fillRect(lane2X, y, 12, 74);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function makeCurbTexture(theme) {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = theme.shoulderA || '#fde047';
  ctx.fillRect(0, 0, 64, 128);
  ctx.fillStyle = theme.shoulderB || '#ef4444';
  ctx.fillRect(0, 128, 64, 128);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeTerrainTexture(theme) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = theme.groundA;
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = theme.groundB;
  ctx.fillRect(0, 0, 256, 128);
  for (let i = 0; i < 180; i++) {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
    ctx.fillRect((i * 47) % 256, (i * 89) % 256, 14, 14);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeCheckeredTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const sq = 32;
  for (let y = 0; y < 128; y += sq) {
    for (let x = 0; x < 256; x += sq) {
      ctx.fillStyle = ((x / sq + y / sq) % 2 === 0) ? '#ffffff' : '#0f172a';
      ctx.fillRect(x, y, sq, sq);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export class TrackBuilder {
  constructor(worldTheme, finishDist) {
    this.theme = worldTheme;
    this.finishDist = finishDist;
    const id = worldTheme.world ? worldTheme.world.id : 1;
    this.phase1 = (id * 1.17) % (Math.PI * 2);
    this.phase2 = (id * 2.31) % (Math.PI * 2);
    this.curveAmp = worldTheme.curveAmp || 11;
    this.hillAmp = worldTheme.hillAmp || 3.2;
  }

  getPoint(s) {
    // Keep start straight/flat for clean countdown, then smoothly introduce sweeping curves & hills
    const intro = smoothstep(0, 38, s);
    const x =
      intro *
      (this.curveAmp * Math.sin(s * 0.0145 + this.phase1) +
        this.curveAmp * 0.42 * Math.sin(s * 0.031 + this.phase2));
    const y =
      intro *
      (this.hillAmp * Math.sin(s * 0.019 + this.phase2) +
        this.hillAmp * 0.45 * Math.cos(s * 0.041 + this.phase1));
    // Forward direction is -Z in world space
    return new THREE.Vector3(x, y, -s);
  }

  getFrame(s) {
    const p0 = this.getPoint(s);
    const p1 = this.getPoint(s + 0.6);
    const forward = p1.clone().sub(p0).normalize();
    const worldUp = new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3().crossVectors(forward, worldUp).normalize();
    const up = new THREE.Vector3().crossVectors(right, forward).normalize();
    const yaw = Math.atan2(-forward.x, -forward.z);
    const pitch = Math.asin(Math.max(-0.99, Math.min(0.99, forward.y)));
    return { pos: p0, forward, right, up, yaw, pitch };
  }

  getLanePosition(s, laneFloat, heightOffset = 0) {
    const frame = this.getFrame(s);
    const lateral = (laneFloat - 1) * LANE_WIDTH;
    return frame.pos
      .clone()
      .addScaledVector(frame.right, lateral)
      .addScaledVector(frame.up, heightOffset);
  }

  buildRoadGroup() {
    const group = new THREE.Group();
    const startS = -28;
    const endS = this.finishDist + 150;
    const segLen = 4.0;
    const count = Math.ceil((endS - startS) / segLen);

    const roadPositions = [];
    const roadNormals = [];
    const roadUvs = [];
    const roadIndices = [];

    const curbPositions = [];
    const curbNormals = [];
    const curbUvs = [];
    const curbIndices = [];

    const groundPositions = [];
    const groundNormals = [];
    const groundUvs = [];
    const groundIndices = [];

    for (let i = 0; i <= count; i++) {
      const s = startS + i * segLen;
      const f = this.getFrame(s);
      const vCoord = s * 0.06;

      // Road vertices (left, right)
      const rl = f.pos.clone().addScaledVector(f.right, -ROAD_HALF_W);
      const rr = f.pos.clone().addScaledVector(f.right, ROAD_HALF_W);
      roadPositions.push(rl.x, rl.y, rl.z, rr.x, rr.y, rr.z);
      roadNormals.push(f.up.x, f.up.y, f.up.z, f.up.x, f.up.y, f.up.z);
      roadUvs.push(0, vCoord, 1, vCoord);

      // Curbs (left strip and right strip, slightly raised)
      const clOut = f.pos.clone().addScaledVector(f.right, -(ROAD_HALF_W + CURB_W)).addScaledVector(f.up, 0.14);
      const clIn = f.pos.clone().addScaledVector(f.right, -ROAD_HALF_W).addScaledVector(f.up, 0.08);
      const crIn = f.pos.clone().addScaledVector(f.right, ROAD_HALF_W).addScaledVector(f.up, 0.08);
      const crOut = f.pos.clone().addScaledVector(f.right, ROAD_HALF_W + CURB_W).addScaledVector(f.up, 0.14);

      curbPositions.push(
        clOut.x, clOut.y, clOut.z,
        clIn.x, clIn.y, clIn.z,
        crIn.x, crIn.y, crIn.z,
        crOut.x, crOut.y, crOut.z
      );
      for (let k = 0; k < 4; k++) curbNormals.push(f.up.x, f.up.y, f.up.z);
      const cv = s * 0.18;
      curbUvs.push(0, cv, 1, cv, 0, cv, 1, cv);

      // Terrain skirts (extending 110m to both sides with gentle undulation)
      const glOut = f.pos.clone().addScaledVector(f.right, -120).addScaledVector(f.up, -0.35);
      const glIn = f.pos.clone().addScaledVector(f.right, -(ROAD_HALF_W + CURB_W * 0.9)).addScaledVector(f.up, -0.08);
      const grIn = f.pos.clone().addScaledVector(f.right, ROAD_HALF_W + CURB_W * 0.9).addScaledVector(f.up, -0.08);
      const grOut = f.pos.clone().addScaledVector(f.right, 120).addScaledVector(f.up, -0.35);

      groundPositions.push(
        glOut.x, glOut.y, glOut.z,
        glIn.x, glIn.y, glIn.z,
        grIn.x, grIn.y, grIn.z,
        grOut.x, grOut.y, grOut.z
      );
      for (let k = 0; k < 4; k++) groundNormals.push(0, 1, 0);
      const gv = s * 0.04;
      groundUvs.push(0, gv, 8, gv, 0, gv, 8, gv);

      if (i < count) {
        const b = i * 2;
        roadIndices.push(b, b + 1, b + 2, b + 1, b + 3, b + 2);

        const cb = i * 4;
        // Left curb quad
        curbIndices.push(cb, cb + 1, cb + 4, cb + 1, cb + 5, cb + 4);
        // Right curb quad
        curbIndices.push(cb + 2, cb + 3, cb + 6, cb + 3, cb + 7, cb + 6);

        // Left & right terrain quads
        groundIndices.push(cb, cb + 1, cb + 4, cb + 1, cb + 5, cb + 4);
        groundIndices.push(cb + 2, cb + 3, cb + 6, cb + 3, cb + 7, cb + 6);
      }
    }

    const roadGeo = new THREE.BufferGeometry();
    roadGeo.setAttribute('position', new THREE.Float32BufferAttribute(roadPositions, 3));
    roadGeo.setAttribute('normal', new THREE.Float32BufferAttribute(roadNormals, 3));
    roadGeo.setAttribute('uv', new THREE.Float32BufferAttribute(roadUvs, 2));
    roadGeo.setIndex(roadIndices);

    const roadMat = new THREE.MeshStandardMaterial({
      map: makeRoadTexture(this.theme),
      roughness: 0.78,
      metalness: 0.08,
      emissive: this.theme.roadEmissive || 0x000000,
      emissiveIntensity: this.theme.stripeEmissive ? 0.35 : 0
    });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.receiveShadow = true;
    group.add(roadMesh);

    const curbGeo = new THREE.BufferGeometry();
    curbGeo.setAttribute('position', new THREE.Float32BufferAttribute(curbPositions, 3));
    curbGeo.setAttribute('normal', new THREE.Float32BufferAttribute(curbNormals, 3));
    curbGeo.setAttribute('uv', new THREE.Float32BufferAttribute(curbUvs, 2));
    curbGeo.setIndex(curbIndices);
    const curbMesh = new THREE.Mesh(
      curbGeo,
      new THREE.MeshStandardMaterial({ map: makeCurbTexture(this.theme), roughness: 0.6 })
    );
    curbMesh.receiveShadow = true;
    group.add(curbMesh);

    const groundGeo = new THREE.BufferGeometry();
    groundGeo.setAttribute('position', new THREE.Float32BufferAttribute(groundPositions, 3));
    groundGeo.setAttribute('normal', new THREE.Float32BufferAttribute(groundNormals, 3));
    groundGeo.setAttribute('uv', new THREE.Float32BufferAttribute(groundUvs, 2));
    groundGeo.setIndex(groundIndices);
    const groundMesh = new THREE.Mesh(
      groundGeo,
      new THREE.MeshStandardMaterial({ map: makeTerrainTexture(this.theme), roughness: 0.92 })
    );
    groundMesh.receiveShadow = true;
    group.add(groundMesh);

    // Bridge water plane for Body Bridge (world 5)
    if (this.theme.propType === 'bridge') {
      const waterGeo = new THREE.PlaneGeometry(460, this.finishDist + 320);
      waterGeo.rotateX(-Math.PI / 2);
      const waterMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        roughness: 0.18,
        metalness: 0.35
      });
      const water = new THREE.Mesh(waterGeo, waterMat);
      water.position.set(0, -7.5, -this.finishDist * 0.5);
      group.add(water);
    }

    // Finish Line Gantry + Checkered Strip
    group.add(this._buildFinishArch());

    return group;
  }

  _buildFinishArch() {
    const archGroup = new THREE.Group();
    const f = this.getFrame(this.finishDist);
    archGroup.position.copy(f.pos);
    archGroup.rotation.y = f.yaw;

    const pillarMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35, metalness: 0.2 });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.45,
      roughness: 0.25,
      metalness: 0.6
    });

    for (const side of [-1, 1]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 7.6, 10), pillarMat);
      post.position.set(side * (ROAD_HALF_W + 0.5), 3.8, 0);
      post.castShadow = true;
      archGroup.add(post);

      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.75, 10, 10), goldMat);
      cap.position.set(side * (ROAD_HALF_W + 0.5), 7.8, 0);
      archGroup.add(cap);
    }

    const bannerGeo = new THREE.BoxGeometry(ROAD_HALF_W * 2 + 1.4, 2.0, 0.65);
    const bannerMat = new THREE.MeshStandardMaterial({
      map: makeCheckeredTexture(),
      roughness: 0.4
    });
    const banner = new THREE.Mesh(bannerGeo, bannerMat);
    banner.position.set(0, 6.7, 0);
    banner.castShadow = true;
    archGroup.add(banner);

    // Checkered road strip
    const stripGeo = new THREE.PlaneGeometry(ROAD_HALF_W * 2, 3.2);
    stripGeo.rotateX(-Math.PI / 2);
    const strip = new THREE.Mesh(stripGeo, new THREE.MeshStandardMaterial({ map: makeCheckeredTexture(), roughness: 0.6 }));
    strip.position.set(0, 0.06, 0);
    archGroup.add(strip);

    return archGroup;
  }

  buildSkyDome() {
    const group = new THREE.Group();
    const skyGeo = new THREE.SphereGeometry(320, 24, 16);
    const cTop = new THREE.Color(this.theme.skyTop);
    const cBot = new THREE.Color(this.theme.skyBottom);

    const mat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        topColor: { value: cTop },
        bottomColor: { value: cBot }
      },
      vertexShader: `
        varying vec3 vWorldPos;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        varying vec3 vWorldPos;
        void main() {
          float h = clamp(normalize(vWorldPos).y * 1.4 + 0.15, 0.0, 1.0);
          gl_FragColor = vec4(mix(bottomColor, topColor, pow(h, 0.75)), 1.0);
        }
      `
    });
    group.add(new THREE.Mesh(skyGeo, mat));

    // Glowing Sun / Planet disc in the sky
    const sunColor = new THREE.Color(this.theme.sunColor || '#fde047');
    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(14, 16, 16),
      new THREE.MeshBasicMaterial({ color: sunColor, fog: false })
    );
    sun.position.set(42, this.theme.sunY || 52, -210);
    group.add(sun);

    return group;
  }
}

function makeWeatherTexture(type) {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 64, 64);

  if (type === 'rain') {
    const grad = ctx.createLinearGradient(32, 4, 32, 60);
    grad.addColorStop(0, 'rgba(255,255,255,0)');
    grad.addColorStop(0.5, 'rgba(224,242,254,0.95)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(36, 8);
    ctx.lineTo(28, 56);
    ctx.stroke();
  } else if (type === 'bubbles') {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(32, 32, 22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(186, 230, 253, 0.25)';
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(23, 22, 5, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'stars') {
    const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, 'rgba(254, 240, 138, 0.9)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(32, 4); ctx.lineTo(36, 28); ctx.lineTo(60, 32); ctx.lineTo(36, 36);
    ctx.lineTo(32, 60); ctx.lineTo(28, 36); ctx.lineTo(4, 32); ctx.lineTo(28, 28);
    ctx.closePath();
    ctx.fill();
  } else if (type === 'leaves' || type === 'petals') {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(32, 32, 20, 11, -0.5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Soft radial bokeh orb (snow, fireflies, sparkles, embers, dust, notes, confetti)
    const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 28);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.45, 'rgba(255, 255, 255, 0.72)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(32, 32, 28, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Lightweight 3D Weather / Ambience Particle Field wrapping around the active camera.
 */
export class WeatherSystem {
  constructor(weatherType, count = 240) {
    this.type = weatherType || 'sparkles';
    this.count = count;
    this.group = new THREE.Group();
    this.positions = new Float32Array(count * 3);
    this.velocities = new Float32Array(count * 3);
    this.boxSize = 68;
    this.heightSize = 26;

    const palette = {
      leaves: 0x4ade80,
      snow: 0xffffff,
      bubbles: 0x67e8f9,
      stars: 0xfef08a,
      fireflies: 0xd9f99d,
      sparkles: 0xfde047,
      confetti: 0xf472b6,
      dust: 0xfdba74,
      petals: 0xf9a8d4,
      embers: 0xfb923c,
      notes: 0xe879f9,
      rain: 0x93c5fd
    };

    const geo = new THREE.BufferGeometry();
    for (let i = 0; i < count; i++) {
      this.positions[i * 3] = (Math.random() - 0.5) * this.boxSize;
      this.positions[i * 3 + 1] = Math.random() * this.heightSize;
      this.positions[i * 3 + 2] = (Math.random() - 0.5) * this.boxSize;

      const vy =
        this.type === 'bubbles' || this.type === 'embers' || this.type === 'fireflies' || this.type === 'notes'
          ? 1.5 + Math.random() * 2.5
          : this.type === 'rain'
            ? -18 - Math.random() * 8
            : this.type === 'stars'
              ? 0
              : -1.4 - Math.random() * 2.2;
      this.velocities[i * 3] = (Math.random() - 0.5) * 1.6;
      this.velocities[i * 3 + 1] = vy;
      this.velocities[i * 3 + 2] = (Math.random() - 0.5) * 1.6;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));

    const sizeMap = {
      stars: 1.45,
      bubbles: 1.35,
      fireflies: 1.25,
      snow: 0.95,
      leaves: 1.05,
      petals: 1.0,
      rain: 1.1
    };
    const isAdditive = ['stars', 'fireflies', 'sparkles', 'embers', 'notes'].includes(this.type);
    const mat = new THREE.PointsMaterial({
      color: palette[this.type] || 0xffffff,
      map: makeWeatherTexture(this.type),
      size: sizeMap[this.type] || 1.05,
      sizeAttenuation: true,
      transparent: true,
      opacity: this.type === 'stars' ? 0.95 : 0.85,
      blending: isAdditive ? THREE.AdditiveBlending : THREE.NormalBlending,
      alphaTest: 0.02,
      depthWrite: false
    });

    this.points = new THREE.Points(geo, mat);
    this.points.frustumCulled = false;
    this.group.add(this.points);
  }

  setVisibleCount(n) {
    this.points.geometry.setDrawRange(0, Math.min(this.count, n));
  }

  update(dt, anchorPos, time) {
    const pos = this.positions;
    const vel = this.velocities;
    const half = this.boxSize * 0.5;
    const hMax = this.heightSize;
    const activeCount = this.points.geometry.drawRange.count === Infinity
      ? this.count
      : Math.min(this.count, this.points.geometry.drawRange.count);

    for (let i = 0; i < activeCount; i++) {
      const idx = i * 3;
      pos[idx] += vel[idx] * dt + Math.sin(time * 2 + i) * dt * 0.7;
      pos[idx + 1] += vel[idx + 1] * dt;
      pos[idx + 2] += vel[idx + 2] * dt;

      // Wrap relative to anchor (camera/car)
      const dx = pos[idx] - anchorPos.x;
      if (dx > half) pos[idx] -= this.boxSize;
      else if (dx < -half) pos[idx] += this.boxSize;

      const dz = pos[idx + 2] - anchorPos.z;
      if (dz > half) pos[idx + 2] -= this.boxSize;
      else if (dz < -half) pos[idx + 2] += this.boxSize;

      const minY = anchorPos.y - 2;
      const maxY = anchorPos.y + hMax;
      if (pos[idx + 1] < minY) pos[idx + 1] = maxY;
      else if (pos[idx + 1] > maxY) pos[idx + 1] = minY;
    }
    this.points.geometry.attributes.position.needsUpdate = true;
  }
}
