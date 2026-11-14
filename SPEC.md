# Word Race - Game Spec (v1)

An English vocabulary racing game for Israeli kids aged 7-11 who know basic English.
The child drives a car down a 3-lane road. A prompt card shows a picture (or plays a word, or shows
a Hebrew word). Three gates approach, each with an English word. Steer into the correct gate.
Correct = boost + coins + combo. Wrong = short spin-out and the right answer is shown and spoken.

The learning is the steering. There is no quiz screen, no "question 3 of 10". It must feel like a
racing game first.

---

## 1. Goals and "done"
- A child opens the page and is racing within 2 taps, with no reading needed to start.
- One run = 60-90 seconds, ~15-20 gates. Ends with a results screen: stars (1-3), coins, words learned.
- Feels premium: smooth 60fps, juicy feedback (screen shake, particles, speed lines, sound), bright
  cartoon look. Not a "school app".
- Done when: all screens in section 4 work, all 6 worlds playable, progress saves, works on desktop
  (keyboard) and touch (tablet + phone), no console errors, test hooks (section 10) work.

## 2. Tech
- Static site, no build step, no server, no API keys. Opens from `index.html` via any static server.
- Vanilla JS (ES modules) + HTML Canvas 2D for the race. DOM/CSS for menus and HUD overlays.
  No framework needed. Libraries allowed only from cdn.jsdelivr.net with an exact version.
- Files:
  ```
  index.html
  css/style.css
  js/main.js          boot, screen router
  js/race.js          game loop, road, car, gates, collisions
  js/words.js         vocabulary data (section 6)
  js/audio.js         speech + SFX + music (section 7)
  js/progress.js      localStorage save/load
  js/ui.js            menus, HUD, results
  audio/manifest.json word -> clip file map (empty {} in v1 is fine)
  audio/words/        pre-generated word clips (added later)
  ```
- Pictures: emoji rendered with the "Noto Color Emoji" Google Font so they look the same on every
  device. Each word in `words.js` has its emoji.
- Fonts: "Fredoka" (English, game text) and "Rubik" (Hebrew UI) from Google Fonts.
- Responsive: landscape tablet/desktop is the primary layout; phone portrait must also work
  (road fills the screen, prompt card on top, lane buttons at the bottom).

## 3. Core loop (the race)
- Pseudo-3D road (classic arcade perspective: road narrows to a horizon, stripes scroll, roadside
  props per world scroll past). Car seen from behind, bottom center, in one of 3 lanes.
- Every ~4 seconds a row of 3 gates appears at the horizon and grows toward the car. Each gate is an
  arch/banner with one English word, big and readable (min 28px at arrival).
- The prompt card (top center) shows the target for the coming row as soon as the row appears:
  - Mode PICTURE: big emoji. Word is NOT shown. Audio is not auto-played.
  - Mode LISTEN: a speaker icon; the word is spoken automatically when the row appears; tap card to replay.
  - Mode HEBREW: the Hebrew word (RTL, Rubik font).
- Steering: one lane step per input. Car glides between lanes (~150ms ease).
- Passing a gate:
  - Correct: "boost" (speed +25% for 2s, flame trail, speed lines, whoosh), +10 coins x combo
    multiplier, combo counter +1, the word is spoken in English, a green "+10" floats up.
  - Wrong: car wobbles/spins 0.6s, speed drops, combo resets, red flash on the wrong gate, the correct
    gate glows green, the correct word is spoken. No lives lost, no game over. Mistakes only cost time
    and coins.
  - Distractors are always from the same world, never the same emoji, and never a word the child
    could argue is also correct (e.g. not "cat" and "kitten" together).
- Combo: x1, x2 at 3 in a row, x3 at 6 in a row. Shown in the HUD with a pulsing badge.
- Speed ramps gently through the run; gates arrive a bit faster in the last third.
- Obstacles (optional flavor, from World 3 on): cones/puddles in a lane between gate rows that slow
  the car if hit. Never on the same row as gates.
- End of run: finish line, confetti, results screen.

## 4. Screens
1. **Title**: game logo "WORD RACE", animated car idling, big Play button, small buttons: Garage,
   Settings. Music starts on first tap (browsers block autoplay before a gesture).
2. **World map**: 6 worlds as a winding road with nodes. Locked worlds greyed with a lock.
   Each world shows stars earned (0-3). Tap a world -> Mode picker.
3. **Mode picker**: 3 big cards with icons: Picture (eye), Listen (ear), Hebrew (the letter א).
   A child who cannot read can still pick by icon. Remember the last mode.
4. **Countdown**: 3-2-1-GO with sound, car revs.
5. **Race** (section 3) with HUD: coins, combo badge, progress bar to the finish line, pause button.
6. **Pause**: resume, restart, back to map. Game freezes fully.
7. **Results**: stars animate in one by one, coins counted up, list of the run's words with emoji,
   tap a word to hear it. Words missed in this run are marked to practise. Buttons: Race again, Map.
8. **Garage**: car skins bought with coins (6 skins: price 0, 100, 250, 500, 800, 1200). Shows the car
   rotating/bouncing. Selected skin is used in races.
9. **Settings**: sound on/off, music on/off, voice speed (normal/slow), reset progress (with confirm).

UI chrome (menus, buttons, settings) is in **Hebrew, RTL**. Game content (words on gates, results
words) is **English, LTR**. Mixed screens must lay out correctly in both directions.

## 5. Progression
- Stars per run: 1 star = finished, 2 stars = 70%+ correct, 3 stars = 90%+ correct.
- A world unlocks when the previous world has 2+ stars in any mode.
- World 1 is open from the start.
- Spaced repetition lite: each word has a score 0-5 in progress. Correct +1, wrong -2 (min 0).
  Word selection for a run: ~60% words with the lowest score, ~40% random from the world. Words missed
  in the last run appear earlier in the next one.

## 6. Vocabulary (`js/words.js`)
Shape: `{ id, en, he, emoji, world }`. Lowercase English, singular nouns unless stated.
Six worlds, 20 words each (120 total). Fill each list to 20 words with simple, picturable,
unambiguous words that have a clear emoji:
1. **Animal Jungle**: dog, cat, lion, monkey, elephant, fish, bird, horse, cow, frog, snake, rabbit,
   bear, duck, pig, sheep, tiger, mouse, turtle, giraffe
2. **Food City**: apple, banana, bread, cheese, egg, milk, pizza, cake, carrot, grapes, orange,
   strawberry, ice cream, cookie, water, chicken, tomato, watermelon, sandwich, lemon
3. **Color Canyon**: red, blue, green, yellow, orange, purple, pink, black, white, brown (shown as
   a colored blob, use colored circle/square emoji) + numbers one-ten (shown as keycap emoji)
4. **Home Highway**: house, bed, chair, table, door, window, lamp, sofa, book, phone, clock, key,
   cup, bath, TV, box, ball, toy, bag, computer
5. **Body Bridge**: head, eye, ear, nose, mouth, hand, foot, leg, arm, tooth, hair, finger, heart,
   brain, face, tongue, back, knee, lips, muscle (pick emoji that clearly show the body part)
6. **Action Airport** (verbs, base form): run, swim, eat, sleep, jump, read, write, sing, dance,
   cook, drive, fly, climb, cry, laugh, play, walk, drink, ride, paint
Each world has its own roadside theme (props, sky color, road color) so the map feels like a journey.

### 6b. v2: three levels, ~500 words (added 2026-11-14)
The game grows to three levels. Shape gains `level` (1-3); `emoji` may be `null` for a word with no
clear emoji (such a word is skipped in Picture mode, used in Listen and Hebrew modes).
- **Level 1 - Beginner**: the 6 worlds above (120 words), unchanged.
- **Level 2 - Intermediate**: 8 new worlds x 24 words (~190). Suggested themes: Sea World (sea
  animals), Bug Garden (insects, plants), Weather Mountain (weather, seasons, nature), Clothes Mall,
  Transport Station, Sports Stadium, Jobs Town (people and jobs), Kitchen Corner (kitchen, more foods).
- **Level 3 - Advanced**: 8 new worlds x 24 words (~190). Suggested themes: Feelings Forest
  (emotions and adjectives: happy, angry, tired, brave...), Opposites Park (big/small, hot/cold, fast/slow,
  full/empty...), Space Station, Music Hall (instruments and music words), School Lane (school
  objects and subjects), Town Map (places in town: bank, hospital, library...), Action Airport 2
  (more verbs: build, catch, throw, push, pull...), Time Tunnel (days, months, time words, ordinals).
- Words across the whole game are unique (no word in two worlds; "orange" lives in Color Canyon
  only, Food City uses another word instead). Words get harder through the levels: longer, less
  common, adjectives and verbs, but still something a child 8-11 meets in school English.
- Hebrew `he`: the natural word an Israeli child uses, with no nikud.
- Distractors stay inside the world and must not be synonyms or near-opposites that confuse in
  Picture mode (e.g. Feelings: never "sad" and "unhappy" in one row).
- **Map**: three level tabs (or three map sections) on the world map, each with its own color and
  icon. A level opens when every world of the level before has 1+ star; inside a level the
  2-stars-to-unlock-next rule stays. Show progress per level (stars earned / possible).
- Garage: add 6 more car skins (prices 1600, 2000, 2500, 3000, 4000, 5000) so coins stay meaningful.

## 7. Audio (`js/audio.js`)
One module, three layers:
- **Speech**: `speak(text)` plays `audio/words/<file>` if `audio/manifest.json` has an entry for the
  text; otherwise falls back to the browser's `speechSynthesis` with `lang: en-US`, picking the best
  available voice in this order: names containing "Google US English", "Samantha", "Aria", "Jenny",
  any en-US. Rate 0.9 (slow setting: 0.7). Never two utterances at once: cancel the previous one.
  The manifest will be filled later with high-quality pre-generated clips; the game must not change
  when they arrive.
- **SFX**: synthesized with the Web Audio API (no files): engine hum that follows speed, boost whoosh,
  correct chime, wrong buzz (soft, not scary), coin ding, countdown beeps, button click, confetti pop.
- **Music**: a light looping track, synthesized or a small file; ducks (gets quieter) while a word
  is spoken. Off switch in Settings.
- Unlock the AudioContext and speech on the first user tap.

## 8. Look and feel
- Bright saturated cartoon palette, thick rounded shapes, soft shadows, big touch targets (min 56px).
- Juice: screen shake on wrong (small), particles on coins, speed lines and FOV stretch on boost,
  squash-and-stretch on buttons, eased screen transitions (no hard cuts).
- Text on gates must stay readable at speed: white bold text with dark outline on a colored banner.
- No ads, no external links, no data collection.

## 9. Performance and quality
- 60fps on a mid-range laptop and a 3-year-old tablet. Pause the loop when the tab is hidden.
- No console errors or warnings in a full run.
- Works offline once loaded (all assets local or from the allowed CDNs).

## 10. Test hooks (required, for automated checks)
Expose `window.__game` with:
- `state()` -> `{ screen, world, mode, lane, speed, coins, combo, correct, wrong, gatesLeft }`
- `start(world, mode)` -> jumps straight into a race
- `steer(lane)` -> 0/1/2
- `target()` -> `{ word, correctLane }` for the next row
- `sim(seconds)` -> advances the game by N seconds instantly (deterministic, for tests)
- `finish()` -> ends the run and shows results
- `seed(n)` -> makes word selection deterministic

## 11. Out of scope for v1
Accounts, servers, multiplayer, leaderboards, in-app purchases, teacher dashboards, sentence-level
grammar (that is the other game, Monster Feast).
