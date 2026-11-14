// Three.js 0.160.0 Scene, Lighting, Post-Processing Bloom, Camera Choreography,
// Title Turntable Stage, and Auto-Quality Controller.

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { Car3D, buildTrophyMesh } from './car.js';
import { EffectsManager3D } from './effects.js';

export class SceneManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = window.innerWidth || 1280;
    this.height = window.innerHeight || 720;

    this.quality = 'high'; // 'high' | 'medium' | 'low'
    this.frameTimes = [];
    this.autoQualityCooldown = 0;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, this.width / this.height, 0.3, 450);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Lights
    this.hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x166534, 1.15);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xfffbeb, 1.85);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.set(1024, 1024);
    this.sunLight.shadow.camera.near = 2;
    this.sunLight.shadow.camera.far = 120;
    const d = 28;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0008;
    this.scene.add(this.sunLight);
    this.scene.add(this.sunLight.target);

    // Post-processing Bloom Composer (activated on neon worlds or boost/nitro in high quality)
    this.composer = null;
    this.bloomPass = null;
    this._setupComposer();

    // Turntable group for Title Screen
    this.turntableGroup = new THREE.Group();
    this.turntableCar = null;
    this.trophyMesh = null;
    this.worldGroup = new THREE.Group();
    this.scene.add(this.worldGroup);
    this.scene.add(this.turntableGroup);

    // Camera state
    this.camCurrentPos = new THREE.Vector3(0, 5, 11);
    this.camCurrentLook = new THREE.Vector3(0, 1.5, -15);
    this.camRoll = 0;
    this.camFov = 60;
    this.orbitAngle = 0;

    this.resize();
  }

  _setupComposer() {
    try {
      this.composer = new EffectComposer(this.renderer);
      this.composer.addPass(new RenderPass(this.scene, this.camera));
      this.bloomPass = new UnrealBloomPass(
        new THREE.Vector2(this.width, this.height),
        0.35, // strength
        0.45, // radius
        0.82  // threshold
      );
      this.composer.addPass(this.bloomPass);
      this.composer.addPass(new OutputPass());
    } catch {
      this.composer = null;
      this.bloomPass = null;
    }
  }

  resize() {
    this.width = Math.max(320, window.innerWidth || 1280);
    this.height = Math.max(240, window.innerHeight || 720);

    const maxDpr = this.quality === 'high' ? 2 : this.quality === 'medium' ? 1.5 : 1;
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);

    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(this.width, this.height, false);
    if (this.composer) {
      this.composer.setPixelRatio(dpr);
      this.composer.setSize(this.width, this.height);
    }
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  applyQuality(tier) {
    if (this.quality === tier) return;
    this.quality = tier;
    if (tier === 'high') {
      this.renderer.shadowMap.enabled = true;
      this.sunLight.castShadow = true;
    } else if (tier === 'medium') {
      this.renderer.shadowMap.enabled = true;
      this.sunLight.castShadow = true;
    } else {
      this.renderer.shadowMap.enabled = false;
      this.sunLight.castShadow = false;
    }
    this.resize();
  }

  recordFrameTime(rawDtSec) {
    if (rawDtSec <= 0 || rawDtSec > 0.25) return;
    this.frameTimes.push(rawDtSec * 1000);
    if (this.frameTimes.length > 45) this.frameTimes.shift();

    if (this.autoQualityCooldown > 0) {
      this.autoQualityCooldown -= rawDtSec;
      return;
    }
    if (this.frameTimes.length < 30) return;

    const avg = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    if (this.quality === 'high' && avg > 26) {
      this.applyQuality('medium');
      this.frameTimes = [];
      this.autoQualityCooldown = 3.0;
    } else if (this.quality === 'medium' && avg > 38) {
      this.applyQuality('low');
      this.frameTimes = [];
      this.autoQualityCooldown = 4.0;
    }
  }

  configureWorldLighting(worldTheme) {
    this.hemiLight.color.set(worldTheme.skyTop || '#bae6fd');
    this.hemiLight.groundColor.set(worldTheme.groundB || '#15803d');
    this.sunLight.color.set(worldTheme.sunColor || '#fffbeb');
    this.sunLight.intensity = worldTheme.neon ? 1.45 : 1.95;

    const fogCol = new THREE.Color(worldTheme.skyBottom || '#bae6fd');
    this.scene.fog = new THREE.Fog(
      fogCol,
      worldTheme.fogNear || 68,
      (worldTheme.fogFar || 210) + 45
    );
    this.scene.background = fogCol;
  }

  setupTitleShowcase(skin) {
    this.clearWorld();
    this.turntableGroup.clear();
    this.turntableGroup.visible = true;
    this.worldGroup.visible = false;

    this.scene.background = new THREE.Color('#0ea5e9');
    this.scene.fog = new THREE.Fog('#0ea5e9', 18, 60);
    this.hemiLight.color.set('#e0f2fe');
    this.hemiLight.groundColor.set('#1e3a8a');
    this.sunLight.position.set(8, 16, 12);
    this.sunLight.target.position.set(0, 0, 0);

    // Glowing showroom floor + circular turntable podium
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(28, 32),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.45, metalness: 0.3 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.3;
    floor.receiveShadow = true;
    this.turntableGroup.add(floor);

    const podium = new THREE.Mesh(
      new THREE.CylinderGeometry(3.2, 3.5, 0.35, 32),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.25, metalness: 0.6 })
    );
    podium.position.y = -0.15;
    podium.receiveShadow = true;
    this.turntableGroup.add(podium);

    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(3.22, 0.09, 8, 40),
      new THREE.MeshBasicMaterial({ color: 0x22d3ee })
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.04;
    this.turntableGroup.add(rim);

    this.turntableCar = new Car3D(skin, { isRival: false });
    this.turntableCar.root.position.set(0, 0.04, 0);
    this.turntableGroup.add(this.turntableCar.root);

    this.camera.fov = 46;
    this.camera.updateProjectionMatrix();
    this.camera.position.set(4.5, 2.5, 6.2);
    this.camera.lookAt(0, 0.9, 0);
  }

  renderTitleShowcase(dt, time) {
    if (!this.turntableCar) return;
    this.turntableCar.root.rotation.y = time * 0.65;
    this.turntableCar.updateVisuals(dt, {
      speed: 0.7,
      time,
      boosted: Math.sin(time * 1.4) > 0.35
    });
    this.renderer.render(this.scene, this.camera);
  }

  setupGarageShowcase(skin) {
    this.clearWorld();
    this.turntableGroup.clear();
    this.turntableGroup.visible = true;
    this.worldGroup.visible = false;

    this.scene.background = new THREE.Color('#0f172a');
    this.scene.fog = new THREE.Fog('#0f172a', 20, 68);
    this.hemiLight.color.set('#e0f2fe');
    this.hemiLight.groundColor.set('#1e1b4b');
    this.sunLight.color.set('#fffbeb');
    this.sunLight.intensity = 1.9;
    this.sunLight.position.set(7, 15, 11);
    this.sunLight.target.position.set(0, 0, 0);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(30, 36),
      new THREE.MeshStandardMaterial({ color: 0x0b1120, roughness: 0.38, metalness: 0.35 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.28;
    floor.receiveShadow = true;
    this.turntableGroup.add(floor);

    const podium = new THREE.Mesh(
      new THREE.CylinderGeometry(3.15, 3.5, 0.32, 36),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.22, metalness: 0.68 })
    );
    podium.position.y = -0.14;
    podium.receiveShadow = true;
    this.turntableGroup.add(podium);

    const accent = skin?.accentColor || '#22d3ee';
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(3.2, 0.09, 10, 44),
      new THREE.MeshBasicMaterial({ color: accent })
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.04;
    this.turntableGroup.add(rim);

    // Showroom neon light arches behind turntable
    const archColor = skin?.bodyColor || '#38bdf8';
    for (let i = 0; i < 3; i++) {
      const arch = new THREE.Mesh(
        new THREE.TorusGeometry(4.4 + i * 0.9, 0.06, 8, 36, Math.PI),
        new THREE.MeshBasicMaterial({ color: i === 1 ? '#facc15' : archColor })
      );
      arch.position.set(0, -0.1, -2.5 - i * 1.1);
      this.turntableGroup.add(arch);
    }

    this.turntableCar = new Car3D(skin, { isRival: false });
    this.turntableCar.root.position.set(0, 0.04, 0);
    this.turntableGroup.add(this.turntableCar.root);

    this.garageEffects = new EffectsManager3D(this.turntableGroup);

    const isPortrait = this.width < this.height;
    this.camera.fov = isPortrait ? 56 : 44;
    this.camera.updateProjectionMatrix();
    this.camera.position.set(isPortrait ? 4.8 : 4.4, isPortrait ? 2.45 : 2.15, isPortrait ? 6.8 : 6.0);
    // Offset lookAt slightly downward so car renders cleanly in upper viewport above upgrade drawer
    this.camera.lookAt(0, isPortrait ? 0.15 : 0.2, 0);
  }

  renderGarageShowcase(dt, time, trailStyle = 'standard', yawOffset = 0) {
    if (!this.turntableCar) return;
    const yaw = time * 0.62 + yawOffset;
    this.turntableCar.root.rotation.y = yaw;
    const isBoost = Math.sin(time * 1.6) > 0.15 || (trailStyle && trailStyle !== 'standard');
    this.turntableCar.updateVisuals(dt, {
      speed: 0.85,
      time,
      boosted: isBoost
    });
    if (this.garageEffects) {
      const fwd = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
      const pos = this.turntableCar.root.position;
      this.garageEffects.emitFireTrail(dt, pos, fwd, false, 1, isBoost, trailStyle);
      this.garageEffects.update(dt);
    }
    this.renderer.render(this.scene, this.camera);
  }

  setupPitStopScene(worldTheme, skin) {
    this.clearWorld();
    this.turntableGroup.clear();
    this.turntableGroup.visible = true;
    this.worldGroup.visible = false;
    this.pitAnimItems = [];

    const skyTop = worldTheme?.skyTop || '#38bdf8';
    const skyBottom = worldTheme?.skyBottom || '#e0f2fe';
    const groundA = worldTheme?.groundA || '#334155';
    const groundCol = worldTheme?.groundB || '#1e293b';
    const accentCol = worldTheme?.roadEdge || '#22d3ee';

    this.scene.background = new THREE.Color(skyBottom);
    this.scene.fog = new THREE.Fog(skyBottom, 45, 130);
    this.hemiLight.color.set(skyTop);
    this.hemiLight.groundColor.set(groundCol);
    this.sunLight.color.set(worldTheme?.sunColor || '#fffbeb');
    this.sunLight.intensity = 1.85;
    this.sunLight.position.set(10, 18, 12);
    this.sunLight.target.position.set(0, 0, 0);

    // Vivid Sky Gradient Dome
    const skyCanvas = document.createElement('canvas');
    skyCanvas.width = 16;
    skyCanvas.height = 128;
    const sctx = skyCanvas.getContext('2d');
    const sgrad = sctx.createLinearGradient(0, 0, 0, 128);
    sgrad.addColorStop(0, skyTop);
    sgrad.addColorStop(0.65, skyBottom);
    sgrad.addColorStop(1, groundA);
    sctx.fillStyle = sgrad;
    sctx.fillRect(0, 0, 16, 128);
    const skyTex = new THREE.CanvasTexture(skyCanvas);
    skyTex.colorSpace = THREE.SRGBColorSpace;
    const skyDome = new THREE.Mesh(
      new THREE.SphereGeometry(75, 24, 16),
      new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false })
    );
    this.turntableGroup.add(skyDome);

    // Textured Pit Apron + Checkered Lane Strip
    const floorCanvas = document.createElement('canvas');
    floorCanvas.width = 256;
    floorCanvas.height = 256;
    const fctx = floorCanvas.getContext('2d');
    fctx.fillStyle = '#1e293b';
    fctx.fillRect(0, 0, 256, 256);
    fctx.strokeStyle = 'rgba(255,255,255,0.08)';
    fctx.lineWidth = 4;
    for (let g = 0; g <= 256; g += 64) {
      fctx.beginPath();
      fctx.moveTo(g, 0);
      fctx.lineTo(g, 256);
      fctx.stroke();
      fctx.beginPath();
      fctx.moveTo(0, g);
      fctx.lineTo(256, g);
      fctx.stroke();
    }
    const floorTex = new THREE.CanvasTexture(floorCanvas);
    floorTex.wrapS = THREE.RepeatWrapping;
    floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(12, 12);
    floorTex.colorSpace = THREE.SRGBColorSpace;

    const apron = new THREE.Mesh(
      new THREE.CircleGeometry(36, 40),
      new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.55, metalness: 0.25 })
    );
    apron.rotation.x = -Math.PI / 2;
    apron.position.y = -0.22;
    apron.receiveShadow = true;
    this.turntableGroup.add(apron);

    // Checkered Racing Curb Ring around pit bay
    const kerbMatA = new THREE.MeshStandardMaterial({ color: accentCol, roughness: 0.35 });
    const kerbMatB = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35 });
    for (let k = 0; k < 16; k++) {
      const ang = (k / 16) * Math.PI * 2;
      const kerb = new THREE.Mesh(
        new THREE.BoxGeometry(0.95, 0.14, 0.42),
        k % 2 === 0 ? kerbMatA : kerbMatB
      );
      kerb.position.set(Math.cos(ang) * 4.35, -0.14, Math.sin(ang) * 4.35);
      kerb.rotation.y = -ang + Math.PI / 2;
      this.turntableGroup.add(kerb);
    }

    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(3.4, 3.7, 0.28, 32),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.28, metalness: 0.6 })
    );
    pad.position.y = -0.08;
    pad.receiveShadow = true;
    this.turntableGroup.add(pad);

    const padRim = new THREE.Mesh(
      new THREE.TorusGeometry(3.44, 0.09, 8, 40),
      new THREE.MeshBasicMaterial({ color: accentCol })
    );
    padRim.rotation.x = Math.PI / 2;
    padRim.position.y = 0.07;
    this.turntableGroup.add(padRim);

    // Pit Stop Garage Arch / Gantry behind parked car
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.35, roughness: 0.3 });
    const archDarkMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.4, roughness: 0.4 });
    const neonMat = new THREE.MeshBasicMaterial({ color: accentCol });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xf59e0b, emissiveIntensity: 0.35, metalness: 0.7, roughness: 0.2 });

    for (const px of [-4.4, 4.4]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.55, 4.6, 0.55), pillarMat);
      post.position.set(px, 2.08, -2.5);
      post.castShadow = true;
      this.turntableGroup.add(post);

      const postStripe = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.45, 0.6), neonMat);
      postStripe.position.set(px, 3.2, -2.5);
      this.turntableGroup.add(postStripe);
    }

    const headerBeam = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.9, 0.72), archDarkMat);
    headerBeam.position.set(0, 4.35, -2.5);
    this.turntableGroup.add(headerBeam);

    // Checkered Pit Banner on Gantry
    const bannerCanvas = document.createElement('canvas');
    bannerCanvas.width = 512;
    bannerCanvas.height = 96;
    const bctx = bannerCanvas.getContext('2d');
    bctx.fillStyle = '#0f172a';
    bctx.fillRect(0, 0, 512, 96);
    for (let cx = 0; cx < 16; cx++) {
      for (let cy = 0; cy < 3; cy++) {
        if ((cx + cy) % 2 === 0) {
          bctx.fillStyle = '#f8fafc';
          bctx.fillRect(cx * 32, cy * 32, 32, 32);
        }
      }
    }
    bctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    bctx.fillRect(110, 12, 292, 72);
    bctx.font = '700 44px "Fredoka", sans-serif';
    bctx.textAlign = 'center';
    bctx.textBaseline = 'middle';
    bctx.fillStyle = '#fde047';
    bctx.fillText('PIT STOP', 256, 48);
    const bannerTex = new THREE.CanvasTexture(bannerCanvas);
    bannerTex.colorSpace = THREE.SRGBColorSpace;
    const bannerPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(8.6, 0.8),
      new THREE.MeshBasicMaterial({ map: bannerTex })
    );
    bannerPlane.position.set(0, 4.35, -2.12);
    this.turntableGroup.add(bannerPlane);

    // Stacked Racing Tires + Waving Checkered Flags on left and right
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.75 });
    for (const side of [-1, 1]) {
      for (let t = 0; t < 3; t++) {
        const tire = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.16, 10, 18), tireMat);
        tire.rotation.x = Math.PI / 2;
        tire.position.set(side * 3.85, -0.05 + t * 0.3, 0.65);
        this.turntableGroup.add(tire);
      }

      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 3.1, 8), pillarMat);
      pole.position.set(side * 4.9, 1.35, -1.2);
      this.turntableGroup.add(pole);

      const flag = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 0.68), goldMat);
      flag.position.set(side * 4.9 + (side < 0 ? 0.52 : -0.52), 2.52, -1.2);
      this.turntableGroup.add(flag);
      this.pitAnimItems.push({ type: 'flag', mesh: flag, phase: side > 0 ? 0 : 1.4 });
    }

    // Mechanic Tool Chest + Racing Cones
    const toolChest = new THREE.Mesh(
      new THREE.BoxGeometry(1.15, 0.95, 0.65),
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.32, metalness: 0.35 })
    );
    toolChest.position.set(-3.3, 0.25, -1.8);
    toolChest.rotation.y = 0.35;
    this.turntableGroup.add(toolChest);

    // Floating Pit Sparks / Glow Orbs
    const orbColors = [0xfacc15, 0x38bdf8, 0xf43f5e, 0x4ade80];
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      const orb = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.16, 0),
        new THREE.MeshBasicMaterial({ color: orbColors[i % orbColors.length] })
      );
      const baseY = 1.4 + (i % 3) * 0.55;
      orb.position.set(Math.cos(ang) * 5.2, baseY, Math.sin(ang) * 4.2 - 0.6);
      this.turntableGroup.add(orb);
      this.pitAnimItems.push({ type: 'orb', mesh: orb, baseY, phase: i * 0.8 });
    }

    this.turntableCar = new Car3D(skin, { isRival: false });
    this.turntableCar.root.position.set(0, 0.06, 0.2);
    this.turntableCar.root.rotation.y = 0.42;
    this.turntableGroup.add(this.turntableCar.root);

    this.camera.fov = this.width < this.height ? 62 : 46;
    this.camera.updateProjectionMatrix();
    this.camera.position.set(5.1, 2.55, 7.6);
    this.camera.lookAt(0, 1.05, -0.5);
  }

  renderPitStop(dt, time) {
    if (!this.turntableCar) return;
    this.turntableCar.root.rotation.y = 0.38 + Math.sin(time * 0.48) * 0.26;
    this.turntableCar.updateVisuals(dt, {
      speed: 0.22,
      time,
      boosted: false
    });
    if (this.pitAnimItems) {
      for (const item of this.pitAnimItems) {
        if (item.type === 'flag') {
          item.mesh.rotation.y = Math.sin(time * 3.4 + item.phase) * 0.28;
        } else if (item.type === 'orb') {
          item.mesh.position.y = item.baseY + Math.sin(time * 2.1 + item.phase) * 0.28;
          item.mesh.rotation.y = time * 1.8 + item.phase;
        }
      }
    }
    this.camera.position.x = 5.1 + Math.sin(time * 0.35) * 0.65;
    this.camera.position.y = 2.55 + Math.cos(time * 0.4) * 0.16;
    this.camera.lookAt(0, 1.05, -0.5);
    this.renderer.render(this.scene, this.camera);
  }

  prepareRaceScene(worldTheme) {
    this.turntableGroup.visible = false;
    this.worldGroup.visible = true;
    this.configureWorldLighting(worldTheme);
    this.orbitAngle = 0;
  }

  clearWorld() {
    while (this.worldGroup.children.length > 0) {
      this.worldGroup.remove(this.worldGroup.children[0]);
    }
    if (this.trophyMesh) {
      this.scene.remove(this.trophyMesh);
      this.trophyMesh = null;
    }
  }

  showBossTrophy(pos, yaw) {
    if (this.trophyMesh) this.scene.remove(this.trophyMesh);
    this.trophyMesh = buildTrophyMesh();
    this.trophyMesh.position.copy(pos).add(new THREE.Vector3(0, 0.2, 0));
    this.trophyMesh.rotation.y = yaw;
    this.scene.add(this.trophyMesh);
  }

  updateRaceCamera(dt, {
    mode, // 'countdown' | 'race' | 'finish' | 'results'
    track,
    playerS,
    playerLaneFloat,
    steerDelta,
    boosted,
    nitro,
    slowmo,
    shakeIntensity,
    time,
    snap = false
  }) {
    const frame = track.getFrame(playerS);
    const carPos = track.getLanePosition(playerS, playerLaneFloat, 0);

    // Keep directional sun shadow centered near the car
    this.sunLight.position.copy(carPos).add(new THREE.Vector3(18, 32, 16));
    this.sunLight.target.position.copy(carPos);

    let desiredPos;
    let desiredLook;
    let targetFov = 60;
    let targetRoll = 0;

    const aspect = this.height > 0 ? this.width / this.height : 1.5;
    const portraitExtra = aspect < 1 ? Math.min(1, (1 - aspect) / 0.5) : 0;
    const portraitFovFactor = aspect < 1 ? Math.min(1.36, 1 / Math.pow(Math.max(0.45, aspect), 0.36)) : 1;

    if (mode === 'countdown') {
      const ang = Math.sin(time * 1.2) * 0.35;
      desiredPos = carPos
        .clone()
        .addScaledVector(frame.forward, -(8.5 + portraitExtra * 2.6))
        .addScaledVector(frame.right, Math.sin(ang) * (aspect < 1 ? 1.8 : 3.5))
        .add(new THREE.Vector3(0, 3.6 + portraitExtra * 0.8, 0));
      desiredLook = carPos.clone().addScaledVector(frame.forward, 12).add(new THREE.Vector3(0, 1.3, 0));
      targetFov = Math.min(86, 56 * portraitFovFactor);
    } else if (mode === 'finish') {
      // Dramatic low-angle finish line shot
      desiredPos = carPos
        .clone()
        .addScaledVector(frame.forward, 7.5)
        .addScaledVector(frame.right, 4.6)
        .add(new THREE.Vector3(0, 1.5, 0));
      desiredLook = carPos.clone().add(new THREE.Vector3(0, 1.3, 0));
      targetFov = 54;
    } else if (mode === 'results') {
      // Short celebratory orbit around car (and Trophy if present)
      this.orbitAngle += dt * 0.62;
      const rad = 7.4;
      desiredPos = carPos
        .clone()
        .add(new THREE.Vector3(Math.sin(this.orbitAngle) * rad, 2.8, Math.cos(this.orbitAngle) * rad));
      desiredLook = carPos.clone().add(new THREE.Vector3(0, 1.25, 0));
      targetFov = 50;
      if (this.trophyMesh) {
        this.trophyMesh.rotation.y += dt * 1.4;
      }
    } else {
      // Dynamic Chase Cam - adjust FOV and chase distance for narrow portrait aspect ratios
      // so upcoming gates stay well-framed and never fill the mobile viewport
      const aspect = this.height > 0 ? this.width / this.height : 1.5;
      const portraitExtra = aspect < 1 ? Math.min(1, (1 - aspect) / 0.5) : 0;
      const chaseDist = (nitro ? 9.4 : 8.5) + portraitExtra * 2.4;
      const chaseHeight = (nitro ? 3.65 : 4.1) + portraitExtra * 0.9;
      desiredPos = frame.pos
        .clone()
        .addScaledVector(frame.right, (playerLaneFloat - 1) * 2.1)
        .addScaledVector(frame.forward, -chaseDist)
        .add(new THREE.Vector3(0, chaseHeight, 0));

      desiredLook = carPos
        .clone()
        .addScaledVector(frame.forward, 17)
        .add(new THREE.Vector3(0, 1.55, 0));

      const baseFov = nitro ? 79 : boosted ? 68 : slowmo ? 54 : 60;
      const portraitFovFactor = aspect < 1 ? Math.min(1.36, 1 / Math.pow(Math.max(0.45, aspect), 0.36)) : 1;
      targetFov = Math.min(88, baseFov * portraitFovFactor);
      targetRoll = Math.max(-0.08, Math.min(0.08, -steerDelta * 0.09));
    }

    if (snap) {
      this.camCurrentPos.copy(desiredPos);
      this.camCurrentLook.copy(desiredLook);
      this.camFov = targetFov;
      this.camRoll = targetRoll;
    } else {
      const followRate = Math.min(1, dt * 10);
      this.camCurrentPos.lerp(desiredPos, followRate);
      this.camCurrentLook.lerp(desiredLook, Math.min(1, dt * 12));
      this.camFov += (targetFov - this.camFov) * Math.min(1, dt * 8);
      this.camRoll += (targetRoll - this.camRoll) * Math.min(1, dt * 10);
    }

    this.camera.position.copy(this.camCurrentPos);
    if (shakeIntensity > 0) {
      this.camera.position.x += (Math.random() - 0.5) * shakeIntensity * 0.14;
      this.camera.position.y += (Math.random() - 0.5) * shakeIntensity * 0.12;
    }

    if (Math.abs(this.camera.fov - this.camFov) > 0.05) {
      this.camera.fov = this.camFov;
      this.camera.updateProjectionMatrix();
    }

    this.camera.lookAt(this.camCurrentLook);
    this.camera.rotateZ(this.camRoll);
  }

  renderWorld(worldTheme, boostOrNitro) {
    const useBloom =
      this.quality === 'high' &&
      this.composer &&
      this.bloomPass &&
      (worldTheme?.neon || boostOrNitro);

    if (useBloom) {
      this.bloomPass.strength = boostOrNitro ? 0.55 : 0.28;
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }
}
