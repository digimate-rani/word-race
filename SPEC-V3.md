# Word Race v3 - "Can't put it down" (3D)

v3 is a new layer on top of v2. v2 stays untouched at the repo root (git tag `v2`) and keeps working.
v3 lives in its own folder `v3/` and is played at `/v3/`. Everything in SPEC.md still applies
(vocabulary, modes, levels, Hebrew UI / English content, audio, test hooks) unless this file says otherwise.

The goal in one line: **a child who plays it does not want to put it down.** v2 is correct but
flat and boring. v3 must look like a modern mobile racing game and feel exciting every few seconds.

---

## 1. Look: real 3D
- Three.js `0.160.0` from cdn.jsdelivr.net via an import map (exact version). No other engine.
- Style: bright stylized low-poly / toy-like (think premium mobile racer), not realistic. All models
  built in code from primitives (no external model files), but with care: rounded bevels, nice
  proportions, emissive details, wheels that spin, suspension bounce.
- Lighting: hemisphere + directional sun with soft shadows, fog to the horizon, per-world sky
  gradient. Post-processing where it pays off (bloom on boost/nitro and neon worlds), kept light
  for phones.
- Camera: chase cam behind the car, smooth follow, leans into lane changes, FOV widens and slight
  shake on boost, dramatic low angle on the finish line, short orbit on the results.
- Road: a curving, rising and falling track (not a straight line), 3 lanes, with roadside scenery
  per world built from instanced low-poly props (trees, buildings, crystals, coral, planets...).
  All 22 worlds keep their theme from v2 (sky, road, props); they must look clearly different.
- Gates: big 3D arches over each lane with the English word on a glowing sign, readable at speed.
  The correct gate bursts into confetti when you pass it; a wrong gate shatters.
- Weather/ambience per world: rain, snow, bubbles under the sea, stars in space, leaves in the forest.
- Performance budget: 60fps on a mid laptop, 30+ on a 3-year-old phone. Auto quality (pixel ratio,
  shadows, bloom off) when frame time is high. Pause when the tab is hidden.

## 2. Feel: something happens every few seconds
- **Rival racer**: every race has a rival car (with a name and a face badge). Correct answers boost
  you past it, mistakes let it pass. Position shown "1st / 2nd". Winning the race = bonus chest.
  Overtaking moments get a slow-motion beat and a "PASSED!" pop.
- **Nitro**: a bar fills with each correct answer; full bar = tap the nitro button (or Space) for a
  huge 3s burst: blur, flames, camera kick, music pitch up.
- **Combo streak**: x2 / x3 / x5 with escalating effects and sounds (fire trail at x5).
- **Coins on the road**: lines of coins between gate rows to steer through; magnet power-up.
- **Ramps and jumps**: occasional ramp in a lane = air time with a flip, land for a small boost.
- **Power-ups** (picked up on the road, one at a time): magnet (coins), shield (one mistake does
  not slow you), slow-mo (more time to read the next row), double coins.
- **Boss race**: the last race of each world is a boss: a bigger, faster rival car with a special
  look, harder distractors, and a big trophy scene when you beat it. Beating the boss = 3rd star
  route and unlocks the next world.
- **Near-miss rewards**: passing close to an obstacle gives "+5 Close call!".
- Mistakes are never punishing: no game over, no lives. The correct word is always shown and spoken.

## 3. Rewards loop (why come back)
- **Chest after every race**: tap to open, juicy animation, coins + sometimes a car part or a sticker.
- **Word stickers album**: every word learned to score 3+ becomes a collectible sticker card
  (emoji + word + Hebrew), sorted by world. Album shows "137 / 504". Tap a sticker to hear it.
- **Garage 2.0**: cars (12 skins from v2 + 3 special boss-reward cars), plus upgrades bought with
  coins: paint colors, wheels, spoiler, trail effect. Shown on a rotating turntable in 3D.
- **Daily streak**: playing on consecutive days gives a growing daily gift (day 1-7), shown on the
  title screen with a flame counter.
- **Level-up**: a driver level (XP from every correct answer) with a satisfying level-up screen
  every few races.

## 4. Screens (Hebrew RTL UI, same as v2, all redesigned to match the 3D look)
Title (3D car on a turntable, daily streak, Play) -> World map (3 levels, now with the 3D style or a
rich illustrated map) -> Mode picker -> 3-2-1 -> Race -> Results (position, stars, coins, chest,
words list with audio) -> Garage, Album, Settings. Every transition animated.

## 5. Technical
- Folder:
  ```
  v3/index.html
  v3/css/style.css
  v3/js/...           split by concern (scene, track, car, gates, rival, effects, ui, audio, progress...)
  ```
- Reuse: vocabulary = import `../js/words.js` from v2 (do not copy or change it). Audio clips =
  `../audio/manifest.json` and `../audio/words/` (the v2 audio module can be copied into v3 and
  pointed at `../audio/`). Progress saves under a new localStorage key so v2 and v3 do not clash.
- Controls: arrows / A-D / swipe / on-screen lane buttons, Space or a big button for nitro.
- Test hooks: everything in SPEC.md section 10, plus `state()` adds `position`, `nitro`, `powerup`.
- No em-dash character anywhere.

## 6. Learning path per world (Rani, 2026-11-14) - replaces the free mode picker
The kids are Hebrew speakers. Reading English fast is hard for them, so each world is a 3-step path.
A step unlocks the next one. The world map shows the 3 steps on each world (icons + done marks).
1. **Listen race** (step 1): the word is SPOKEN when the row appears; the gate signs show PICTURES
   (big emoji on the sign, no English text). Drive to the picture that matches what you heard.
   Example: hear "elephant", drive to the 🐘 sign. A word with `emoji: null` shows its Hebrew word
   on the sign instead. Pass = 2+ stars.
2. **Reading training** (step 2): not a race. Calm, untimed practice screen in the same 3D style
   (the car parked in a garage/pit stop scene is fine). 10 cards, two kinds mixed:
   a) the English word is shown big, tap the speaker to hear it, then pick its picture out of 3;
   b) a picture (or Hebrew word) is shown, pick the written English word out of 3.
   Wrong answer = gentle shake, the right one glows, the word is spoken, try again. 8/10 first-try
   correct = passed (stars by score). This is where the child learns to read the words.
3. **Word race** (step 3): the race as it is now (signs show English words; prompt = picture,
   or Hebrew word for emoji-null words; a "Listen" variant may stay as an option).
- **No speech when the car passes a sign** (correct or wrong). The word is spoken only when its row
  appears (and on tap of the prompt / speaker). Speaking again on the pass overlapped the next word
  and made a "word salad". Feedback on the pass = sound effects + visuals only.
- Boss race = after step 3, as today.
