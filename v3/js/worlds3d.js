// Rich 3D world themes, weather configurations, sky gradients, and instanced low-poly roadside props
// for all 22 worlds from words.js.

import * as THREE from 'three';
import { getWorldById } from '../../js/words.js';

const WORLD_EXTRAS = {
  1:  { weather: 'leaves',   neon: false, fogNear: 55, fogFar: 210, roadEmissive: 0x000000, stripeEmissive: false, curveAmp: 12, hillAmp: 3.5, sunY: 52, rivalName: 'ליאו',   rivalEmoji: '🦁', bossName: 'מלך הג׳ונגל', bossEmoji: '🦍' },
  2:  { weather: 'sparkles', neon: false, fogNear: 60, fogFar: 220, roadEmissive: 0x000000, stripeEmissive: false, curveAmp: 9,  hillAmp: 2.5, sunY: 58, rivalName: 'שף פיצה', rivalEmoji: '🍕', bossName: 'בורגר ענק',  bossEmoji: '🍔' },
  3:  { weather: 'dust',     neon: true,  fogNear: 58, fogFar: 215, roadEmissive: 0x1e0836, stripeEmissive: true,  curveAmp: 15, hillAmp: 4.5, sunY: 44, rivalName: 'פריזמה',  rivalEmoji: '🌈', bossName: 'קריסטל בוס', bossEmoji: '💎' },
  4:  { weather: 'petals',   neon: false, fogNear: 62, fogFar: 220, roadEmissive: 0x000000, stripeEmissive: false, curveAmp: 8,  hillAmp: 2.8, sunY: 60, rivalName: 'טדי',     rivalEmoji: '🐶', bossName: 'טורבו בוס',  bossEmoji: '🏠' },
  5:  { weather: 'sparkles', neon: false, fogNear: 58, fogFar: 215, roadEmissive: 0x000000, stripeEmissive: false, curveAmp: 7,  hillAmp: 4.2, sunY: 55, rivalName: 'ספארק',   rivalEmoji: '⚡', bossName: 'ענק הגשר',   bossEmoji: '🦾' },
  6:  { weather: 'dust',     neon: false, fogNear: 65, fogFar: 230, roadEmissive: 0x000000, stripeEmissive: true,  curveAmp: 10, hillAmp: 2.2, sunY: 42, rivalName: 'סקיי',    rivalEmoji: '✈️', bossName: 'קפטן סילון', bossEmoji: '🛩️' },
  7:  { weather: 'bubbles',  neon: true,  fogNear: 42, fogFar: 175, roadEmissive: 0x043344, stripeEmissive: true,  curveAmp: 13, hillAmp: 4.0, sunY: 62, rivalName: 'נמו',     rivalEmoji: '🐠', bossName: 'מלך הים',    bossEmoji: '🦈' },
  8:  { weather: 'fireflies',neon: false, fogNear: 55, fogFar: 205, roadEmissive: 0x000000, stripeEmissive: false, curveAmp: 14, hillAmp: 3.2, sunY: 54, rivalName: 'פלאטר',   rivalEmoji: '🦋', bossName: 'החיפושית',   bossEmoji: '🪲' },
  9:  { weather: 'snow',     neon: false, fogNear: 45, fogFar: 185, roadEmissive: 0x000000, stripeEmissive: false, curveAmp: 15, hillAmp: 5.5, sunY: 48, rivalName: 'פרוסט',   rivalEmoji: '❄️', bossName: 'מלך השלג',   bossEmoji: '⛄' },
  10: { weather: 'sparkles', neon: true,  fogNear: 58, fogFar: 215, roadEmissive: 0x151136, stripeEmissive: true,  curveAmp: 10, hillAmp: 2.4, sunY: 50, rivalName: 'סטייל',   rivalEmoji: '🕶️', bossName: 'מלכת האופנה', bossEmoji: '👑' },
  11: { weather: 'embers',   neon: false, fogNear: 56, fogFar: 210, roadEmissive: 0x000000, stripeEmissive: true,  curveAmp: 11, hillAmp: 3.0, sunY: 46, rivalName: 'אקספרס',  rivalEmoji: '🚂', bossName: 'קטר העל',    bossEmoji: '🚄' },
  12: { weather: 'confetti', neon: true,  fogNear: 60, fogFar: 220, roadEmissive: 0x1a0404, stripeEmissive: true,  curveAmp: 9,  hillAmp: 2.0, sunY: 65, rivalName: 'צ׳אמפ',   rivalEmoji: '🏆', bossName: 'אלוף העולם', bossEmoji: '🥇' },
  13: { weather: 'leaves',   neon: false, fogNear: 60, fogFar: 215, roadEmissive: 0x000000, stripeEmissive: false, curveAmp: 10, hillAmp: 2.8, sunY: 56, rivalName: 'השריף',   rivalEmoji: '🚓', bossName: 'ראש העיר',   bossEmoji: '🎩' },
  14: { weather: 'embers',   neon: false, fogNear: 56, fogFar: 210, roadEmissive: 0x000000, stripeEmissive: false, curveAmp: 12, hillAmp: 3.0, sunY: 45, rivalName: 'פאן-קייק', rivalEmoji: '🥞', bossName: 'מאסטר שף',   bossEmoji: '👨‍🍳' },
  15: { weather: 'fireflies',neon: true,  fogNear: 48, fogFar: 190, roadEmissive: 0x1b0b3b, stripeEmissive: true,  curveAmp: 14, hillAmp: 3.8, sunY: 46, rivalName: 'ג׳וי',    rivalEmoji: '😊', bossName: 'שומר היער',  bossEmoji: '🦄' },
  16: { weather: 'petals',   neon: false, fogNear: 60, fogFar: 220, roadEmissive: 0x000000, stripeEmissive: true,  curveAmp: 11, hillAmp: 3.4, sunY: 56, rivalName: 'פליפ',    rivalEmoji: '⚖️', bossName: 'דוקטור הפך', bossEmoji: '🎭' },
  17: { weather: 'stars',    neon: true,  fogNear: 55, fogFar: 230, roadEmissive: 0x08142b, stripeEmissive: true,  curveAmp: 14, hillAmp: 4.8, sunY: 50, rivalName: 'אסטרו',   rivalEmoji: '🚀', bossName: 'קפטן גלקסי', bossEmoji: '👽' },
  18: { weather: 'notes',    neon: true,  fogNear: 50, fogFar: 205, roadEmissive: 0x240744, stripeEmissive: true,  curveAmp: 13, hillAmp: 3.2, sunY: 44, rivalName: 'דיג׳יי',  rivalEmoji: '🎧', bossName: 'מאסטר רוק',  bossEmoji: '🎸' },
  19: { weather: 'leaves',   neon: false, fogNear: 60, fogFar: 220, roadEmissive: 0x000000, stripeEmissive: false, curveAmp: 9,  hillAmp: 2.5, sunY: 58, rivalName: 'פנסיל',   rivalEmoji: '✏️', bossName: 'פרופסור X',  bossEmoji: '🎓' },
  20: { weather: 'sparkles', neon: false, fogNear: 58, fogFar: 215, roadEmissive: 0x000000, stripeEmissive: false, curveAmp: 11, hillAmp: 2.8, sunY: 55, rivalName: 'מוני',    rivalEmoji: '🚌', bossName: 'סופר טקסי',  bossEmoji: '🚕' },
  21: { weather: 'embers',   neon: true,  fogNear: 54, fogFar: 215, roadEmissive: 0x1e0f04, stripeEmissive: true,  curveAmp: 12, hillAmp: 3.6, sunY: 32, rivalName: 'פלקון',   rivalEmoji: '🦅', bossName: 'טייס על',    bossEmoji: '🛫' },
  22: { weather: 'stars',    neon: true,  fogNear: 48, fogFar: 215, roadEmissive: 0x0b2545, stripeEmissive: true,  curveAmp: 16, hillAmp: 5.0, sunY: 46, rivalName: 'כרונו',   rivalEmoji: '⏳', bossName: 'אדון הזמן',  bossEmoji: '🕰️' }
};

export function getWorld3DTheme(worldId) {
  const world = getWorldById(worldId);
  const extra = WORLD_EXTRAS[world.id] || WORLD_EXTRAS[1];
  return {
    world,
    ...world.theme,
    ...extra
  };
}

/**
 * Generates instanced low-poly props tailored to each of the 22 world themes.
 */
export function buildWorldProps(worldTheme, track, finishDist, rng) {
  const group = new THREE.Group();
  const propType = worldTheme.propType || 'jungle';

  const makeMat = (color, opts = {}) =>
    new THREE.MeshStandardMaterial({
      color,
      roughness: opts.roughness ?? 0.65,
      metalness: opts.metalness ?? 0.08,
      emissive: opts.emissive ?? 0x000000,
      emissiveIntensity: opts.emissiveIntensity ?? 0,
      flatShading: opts.flatShading ?? true
    });

  // Helper to place instanced archetypes cleanly on both sides of the track
  const addInstances = (parts, count, sideMode = 'both', minOff = 9.5, maxOff = 36, yBase = 0, scaleRange = [0.85, 1.5]) => {
    const matrices = [];
    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      const s = -10 + ((finishDist + 100) * (i + rng() * 0.7)) / count;
      const side = sideMode === 'left' ? -1 : sideMode === 'right' ? 1 : i % 2 === 0 ? -1 : 1;
      const off = minOff + rng() * (maxOff - minOff);
      const pt = track.getFrame(s);
      const pos = pt.pos.clone().addScaledVector(pt.right, side * off);
      pos.y += yBase;

      const sc = scaleRange[0] + rng() * (scaleRange[1] - scaleRange[0]);
      dummy.position.copy(pos);
      dummy.rotation.set(0, rng() * Math.PI * 2, 0);
      dummy.scale.setScalar(sc);
      dummy.updateMatrix();
      matrices.push(dummy.matrix.clone());
    }

    for (const part of parts) {
      const im = new THREE.InstancedMesh(part.geo, part.mat, matrices.length);
      im.castShadow = Boolean(part.castShadow);
      im.receiveShadow = true;
      const tmp = new THREE.Matrix4();
      const offsetMat = new THREE.Matrix4().makeTranslation(part.ox || 0, part.oy || 0, part.oz || 0);
      if (part.rotX || part.rotY || part.rotZ) {
        const rotMat = new THREE.Matrix4().makeRotationFromEuler(
          new THREE.Euler(part.rotX || 0, part.rotY || 0, part.rotZ || 0)
        );
        offsetMat.multiply(rotMat);
      }
      for (let i = 0; i < matrices.length; i++) {
        tmp.multiplyMatrices(matrices[i], offsetMat);
        im.setMatrixAt(i, tmp);
        if (part.palette) {
          im.setColorAt(i, new THREE.Color(part.palette[i % part.palette.length]));
        }
      }
      im.instanceMatrix.needsUpdate = true;
      if (im.instanceColor) im.instanceColor.needsUpdate = true;
      group.add(im);
    }
  };

  // World-specific multi-part low-poly props
  switch (propType) {
    case 'jungle': {
      // Palm trees + giant jungle ferns
      addInstances(
        [
          { geo: new THREE.CylinderGeometry(0.28, 0.45, 5.2, 6), mat: makeMat(0x92400e), oy: 2.6, castShadow: true },
          { geo: new THREE.DodecahedronGeometry(1.9, 0), mat: makeMat(0x16a34a), oy: 5.5, castShadow: true },
          { geo: new THREE.ConeGeometry(2.2, 1.2, 6), mat: makeMat(0x4ade80), oy: 4.8 }
        ],
        84, 'both', 9.5, 34, 0, [0.9, 1.45]
      );
      addInstances(
        [{ geo: new THREE.ConeGeometry(1.4, 2.2, 5), mat: makeMat(0x15803d), oy: 1.0 }],
        64, 'both', 8.2, 20, 0, [0.7, 1.2]
      );
      break;
    }
    case 'city': {
      // Colorful city buildings + glowing diner signs
      addInstances(
        [
          { geo: new THREE.BoxGeometry(4.2, 8.5, 4.2), mat: makeMat(0xffffff), oy: 4.25, palette: [0xfb7185, 0x38bdf8, 0xfbbf24, 0x34d399], castShadow: true },
          { geo: new THREE.BoxGeometry(4.5, 0.7, 4.5), mat: makeMat(0xf43f5e), oy: 8.7 },
          { geo: new THREE.BoxGeometry(2.8, 1.4, 0.4), mat: makeMat(0xfef08a, { emissive: 0xfacc15, emissiveIntensity: 0.45 }), oy: 5.2, oz: 2.15 }
        ],
        72, 'both', 11.5, 38, 0, [0.85, 1.65]
      );
      break;
    }
    case 'canyon': {
      // Layered canyon mesas + glowing neon crystals
      addInstances(
        [
          { geo: new THREE.CylinderGeometry(2.2, 3.8, 7.5, 6), mat: makeMat(0xd97706), oy: 3.75, palette: [0xea580c, 0xc2410c, 0xf97316], castShadow: true },
          { geo: new THREE.CylinderGeometry(1.6, 2.3, 2.5, 6), mat: makeMat(0xfbbf24), oy: 8.5 }
        ],
        64, 'both', 12, 40, 0, [0.9, 1.8]
      );
      addInstances(
        [
          { geo: new THREE.OctahedronGeometry(1.4, 0), mat: makeMat(0x22d3ee, { emissive: 0x06b6d4, emissiveIntensity: 0.8 }), oy: 1.8, palette: [0x22d3ee, 0xf43f5e, 0xa855f7] }
        ],
        52, 'both', 8.5, 18, 0, [0.7, 1.3]
      );
      break;
    }
    case 'home': {
      // Cozy gabled houses + garden trees
      addInstances(
        [
          { geo: new THREE.BoxGeometry(4.0, 3.2, 4.0), mat: makeMat(0xffffff), oy: 1.6, palette: [0xfef3c7, 0xdbeafe, 0xfce7f3, 0xdcfce7], castShadow: true },
          { geo: new THREE.ConeGeometry(3.3, 2.3, 4), mat: makeMat(0xef4444), oy: 4.3, rotY: Math.PI / 4, palette: [0xef4444, 0x2563eb, 0xf97316] },
          { geo: new THREE.BoxGeometry(1.0, 1.0, 0.2), mat: makeMat(0xfde047, { emissive: 0xfacc15, emissiveIntensity: 0.5 }), oy: 1.7, oz: 2.02 }
        ],
        64, 'both', 11, 32, 0, [0.9, 1.35]
      );
      addInstances(
        [
          { geo: new THREE.CylinderGeometry(0.25, 0.3, 2.2, 6), mat: makeMat(0x78350f), oy: 1.1 },
          { geo: new THREE.SphereGeometry(1.4, 7, 6), mat: makeMat(0x22c55e), oy: 2.9 }
        ],
        60, 'both', 8.5, 18, 0, [0.8, 1.2]
      );
      break;
    }
    case 'bridge': {
      // Suspension bridge towers + cables & harbor buoys
      addInstances(
        [
          { geo: new THREE.BoxGeometry(1.2, 13.0, 1.2), mat: makeMat(0xf43f5e), oy: 6.5, castShadow: true },
          { geo: new THREE.BoxGeometry(1.5, 1.2, 1.5), mat: makeMat(0xfacc15, { emissive: 0xfacc15, emissiveIntensity: 0.4 }), oy: 13.2 }
        ],
        48, 'both', 8.5, 10.5, 0, [1.0, 1.05]
      );
      break;
    }
    case 'airport':
    case 'airport2': {
      const isSunset = propType === 'airport2';
      // Hangars, control radar towers & runway beacon lights
      addInstances(
        [
          { geo: new THREE.CylinderGeometry(0.45, 0.7, 8.0, 8), mat: makeMat(0xe2e8f0), oy: 4.0, castShadow: true },
          { geo: new THREE.BoxGeometry(2.8, 1.8, 2.8), mat: makeMat(isSunset ? 0xf97316 : 0x38bdf8, { emissive: isSunset ? 0xea580c : 0x0284c7, emissiveIntensity: 0.45 }), oy: 8.6 }
        ],
        38, 'both', 12, 34, 0, [0.9, 1.4]
      );
      addInstances(
        [{ geo: new THREE.SphereGeometry(0.45, 8, 8), mat: makeMat(isSunset ? 0xfb923c : 0x22d3ee, { emissive: isSunset ? 0xf97316 : 0x06b6d4, emissiveIntensity: 1.0 }), oy: 0.45 }],
        90, 'both', 7.6, 8.2, 0, [0.9, 1.0]
      );
      break;
    }
    case 'sea': {
      // Vibrant underwater coral branches + glowing sea rocks + giant kelp
      addInstances(
        [
          { geo: new THREE.CylinderGeometry(0.28, 0.55, 4.5, 6), mat: makeMat(0xffffff), oy: 2.25, palette: [0xf43f5e, 0xfb923c, 0xc084fc, 0x2dd4bf] },
          { geo: new THREE.DodecahedronGeometry(1.2, 0), mat: makeMat(0xffffff), oy: 4.6, palette: [0xfb7185, 0xfacc15, 0xe879f9, 0x38bdf8] }
        ],
        86, 'both', 9.0, 34, 0, [0.85, 1.6]
      );
      addInstances(
        [{ geo: new THREE.SphereGeometry(1.1, 7, 6), mat: makeMat(0x22d3ee, { emissive: 0x0891b2, emissiveIntensity: 0.55 }), oy: 1.0 }],
        44, 'both', 8.4, 18, 0, [0.7, 1.4]
      );
      break;
    }
    case 'garden': {
      // Giant colorful flowers + oversized spotted mushrooms
      addInstances(
        [
          { geo: new THREE.CylinderGeometry(0.2, 0.28, 3.8, 6), mat: makeMat(0x4d7c0f), oy: 1.9 },
          { geo: new THREE.SphereGeometry(1.3, 8, 6), mat: makeMat(0xffffff), oy: 4.1, palette: [0xf472b6, 0xfacc15, 0xa855f7, 0xfb7185] },
          { geo: new THREE.SphereGeometry(0.55, 7, 6), mat: makeMat(0xfef08a), oy: 4.6 }
        ],
        88, 'both', 8.5, 30, 0, [0.8, 1.5]
      );
      break;
    }
    case 'mountain': {
      // Snow-capped pines + jagged snowy peaks
      addInstances(
        [
          { geo: new THREE.CylinderGeometry(0.3, 0.45, 2.2, 6), mat: makeMat(0x78350f), oy: 1.1 },
          { geo: new THREE.ConeGeometry(2.0, 4.2, 6), mat: makeMat(0x166534), oy: 3.8, castShadow: true },
          { geo: new THREE.ConeGeometry(1.2, 2.0, 6), mat: makeMat(0xf8fafc), oy: 5.2 }
        ],
        84, 'both', 9.0, 32, 0, [0.85, 1.5]
      );
      addInstances(
        [
          { geo: new THREE.ConeGeometry(4.5, 12, 5), mat: makeMat(0x64748b), oy: 6.0 },
          { geo: new THREE.ConeGeometry(2.3, 5.2, 5), mat: makeMat(0xffffff), oy: 9.8 }
        ],
        34, 'both', 24, 46, 0, [1.0, 1.7]
      );
      break;
    }
    case 'mall':
    case 'town':
    case 'jobs': {
      // Boutique shops / town landmarks with neon signage
      const neon = propType === 'mall';
      addInstances(
        [
          { geo: new THREE.BoxGeometry(4.6, 7.2, 4.4), mat: makeMat(0xffffff), oy: 3.6, palette: [0xf472b6, 0x38bdf8, 0xfbbf24, 0x2dd4bf, 0x818cf8], castShadow: true },
          { geo: new THREE.BoxGeometry(4.9, 1.1, 4.7), mat: makeMat(neon ? 0x22d3ee : 0x1e293b, { emissive: neon ? 0x06b6d4 : 0x000000, emissiveIntensity: 0.6 }), oy: 7.4 },
          { geo: new THREE.BoxGeometry(2.6, 1.6, 0.25), mat: makeMat(0xfef08a, { emissive: 0xfacc15, emissiveIntensity: 0.55 }), oy: 3.5, oz: 2.25 }
        ],
        68, 'both', 11.5, 36, 0, [0.85, 1.5]
      );
      break;
    }
    case 'station': {
      // Railway gantry arches + signal lights
      addInstances(
        [
          { geo: new THREE.BoxGeometry(0.65, 6.2, 0.65), mat: makeMat(0x52525b), oy: 3.1, castShadow: true },
          { geo: new THREE.BoxGeometry(1.4, 2.2, 0.8), mat: makeMat(0x18181b), oy: 5.5 },
          { geo: new THREE.SphereGeometry(0.35, 8, 8), mat: makeMat(0x22c55e, { emissive: 0x22c55e, emissiveIntensity: 0.9 }), oy: 6.0, oz: 0.45 },
          { geo: new THREE.SphereGeometry(0.35, 8, 8), mat: makeMat(0xfacc15, { emissive: 0xfacc15, emissiveIntensity: 0.9 }), oy: 5.1, oz: 0.45 }
        ],
        54, 'both', 9.0, 24, 0, [0.9, 1.25]
      );
      break;
    }
    case 'stadium': {
      // Floodlight towers + colorful team banners
      addInstances(
        [
          { geo: new THREE.CylinderGeometry(0.35, 0.5, 9.5, 6), mat: makeMat(0xe2e8f0), oy: 4.75, castShadow: true },
          { geo: new THREE.BoxGeometry(3.2, 1.6, 0.6), mat: makeMat(0xfef9c3, { emissive: 0xfef08a, emissiveIntensity: 0.9 }), oy: 9.8 }
        ],
        46, 'both', 10.5, 26, 0, [0.95, 1.3]
      );
      addInstances(
        [{ geo: new THREE.BoxGeometry(3.5, 3.2, 2.4), mat: makeMat(0xffffff), oy: 1.6, palette: [0x2563eb, 0xef4444, 0xfacc15, 0x22c55e] }],
        64, 'both', 14, 34, 0, [1.0, 1.5]
      );
      break;
    }
    case 'kitchen': {
      // Giant colorful mugs, chef hats & spice jars
      addInstances(
        [
          { geo: new THREE.CylinderGeometry(1.4, 1.2, 3.4, 10), mat: makeMat(0xffffff), oy: 1.7, palette: [0xf97316, 0xef4444, 0xfacc15, 0x22c55e], castShadow: true },
          { geo: new THREE.SphereGeometry(1.5, 8, 6), mat: makeMat(0xffffff), oy: 3.9 }
        ],
        66, 'both', 10.0, 32, 0, [0.85, 1.4]
      );
      break;
    }
    case 'feelings': {
      // Glowing enchanted forest trees + heart-like glowing lanterns
      addInstances(
        [
          { geo: new THREE.CylinderGeometry(0.3, 0.5, 4.0, 6), mat: makeMat(0x581c87), oy: 2.0 },
          { geo: new THREE.IcosahedronGeometry(2.0, 0), mat: makeMat(0xffffff), oy: 4.8, palette: [0xec4899, 0x10b981, 0xa855f7, 0xf59e0b], castShadow: true },
          { geo: new THREE.SphereGeometry(0.45, 7, 7), mat: makeMat(0xfde047, { emissive: 0xfacc15, emissiveIntensity: 0.9 }), oy: 3.2, oz: 1.1 }
        ],
        78, 'both', 9.0, 34, 0, [0.85, 1.45]
      );
      break;
    }
    case 'opposites': {
      // Checkerboard contrast monoliths + dual spheres
      addInstances(
        [
          { geo: new THREE.BoxGeometry(2.0, 5.8, 2.0), mat: makeMat(0xffffff), oy: 2.9, palette: [0x0f172a, 0xf8fafc, 0x38bdf8, 0xf43f5e], castShadow: true },
          { geo: new THREE.SphereGeometry(1.1, 8, 8), mat: makeMat(0xfacc15), oy: 6.8 }
        ],
        64, 'both', 10.0, 32, 0, [0.85, 1.35]
      );
      break;
    }
    case 'space': {
      // Floating ringed planets + glowing asteroids
      addInstances(
        [
          { geo: new THREE.IcosahedronGeometry(1.8, 1), mat: makeMat(0xffffff), oy: 5.5, palette: [0x38bdf8, 0xa855f7, 0xf472b6, 0xfacc15], emissive: 0x1e1b4b, emissiveIntensity: 0.35 },
          { geo: new THREE.TorusGeometry(2.9, 0.3, 6, 20), mat: makeMat(0x22d3ee, { emissive: 0x06b6d4, emissiveIntensity: 0.8 }), oy: 5.5, rotX: 1.1 }
        ],
        54, 'both', 13, 38, 0, [0.8, 1.7]
      );
      addInstances(
        [{ geo: new THREE.DodecahedronGeometry(1.2, 0), mat: makeMat(0x64748b), oy: 2.4 }],
        58, 'both', 8.5, 22, 0, [0.6, 1.3]
      );
      break;
    }
    case 'music': {
      // Glowing equalizer neon towers + floating rings
      addInstances(
        [
          { geo: new THREE.BoxGeometry(1.4, 7.0, 1.4), mat: makeMat(0xffffff, { emissive: 0xc026d3, emissiveIntensity: 0.65 }), oy: 3.5, palette: [0xf43f5e, 0xfacc15, 0x22d3ee, 0xa855f7] },
          { geo: new THREE.TorusGeometry(1.3, 0.25, 6, 16), mat: makeMat(0xfde047, { emissive: 0xfacc15, emissiveIntensity: 0.8 }), oy: 8.2 }
        ],
        68, 'both', 9.5, 30, 0, [0.8, 1.5]
      );
      break;
    }
    case 'school': {
      // Giant pencils + colorful blocks & school trees
      addInstances(
        [
          { geo: new THREE.CylinderGeometry(0.65, 0.65, 5.2, 6), mat: makeMat(0xfacc15), oy: 2.6, palette: [0xfacc15, 0x3b82f6, 0xef4444, 0x22c55e], castShadow: true },
          { geo: new THREE.ConeGeometry(0.65, 1.6, 6), mat: makeMat(0xfed7aa), oy: 6.0 },
          { geo: new THREE.ConeGeometry(0.24, 0.6, 6), mat: makeMat(0x0f172a), oy: 6.6 }
        ],
        64, 'both', 9.5, 30, 0, [0.85, 1.35]
      );
      break;
    }
    case 'tunnel': {
      // Giant glowing neon portal rings arching OVER the road + energy pylons
      const dummy = new THREE.Object3D();
      const ringGeo = new THREE.TorusGeometry(9.6, 0.42, 8, 28, Math.PI);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0x22d3ee,
        emissive: 0xa855f7,
        emissiveIntensity: 0.95,
        roughness: 0.2
      });
      const count = 28;
      const im = new THREE.InstancedMesh(ringGeo, ringMat, count);
      for (let i = 0; i < count; i++) {
        const s = 10 + (finishDist * i) / count;
        const pt = track.getFrame(s);
        dummy.position.copy(pt.pos);
        dummy.position.y -= 0.4;
        const yaw = pt.yaw;
        dummy.rotation.set(0, yaw, 0);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        im.setMatrixAt(i, dummy.matrix);
        im.setColorAt(i, new THREE.Color(i % 2 === 0 ? 0x22d3ee : 0xf472b6));
      }
      im.instanceMatrix.needsUpdate = true;
      if (im.instanceColor) im.instanceColor.needsUpdate = true;
      group.add(im);
      break;
    }
    default: {
      addInstances(
        [
          { geo: new THREE.CylinderGeometry(0.3, 0.4, 3.0, 6), mat: makeMat(0x78350f), oy: 1.5 },
          { geo: new THREE.DodecahedronGeometry(1.6, 0), mat: makeMat(0x22c55e), oy: 3.8 }
        ],
        70, 'both', 9.5, 32, 0, [0.9, 1.4]
      );
      break;
    }
  }

  return group;
}
