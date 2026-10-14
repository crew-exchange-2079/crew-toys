# Marble Music

A browser instrument: build a marble machine, tune its bars, and share it by URL.
No build step, CDN, dependencies, accounts, or server-side storage.

## Run

Serve this directory with any static web server and open index.html.
Click or tap once to enable browser audio.

## How to play

- **Drop marbles**: `Drop` mode, then tap the top of the board — or just press
  **Space**. `Auto` lets the machine play itself (a fresh marble every ~2.4 s).
- **Move** a bar or bumper: drag it. Bars clamp to the board.
- **Rotate** a bar: drag one of its glowing end caps (snaps to 5°).
- **Tune** a bar: tap it. The sheet shows its scale-locked note name and
  frequency; **+/−** moves it up/down the scale (it can never leave the key),
  plus angle, length, flip and delete.
- **Bumpers**: tap to resize/delete. They answer with a metallic *tink*.
- **Presets**: five real tunes (Twinkle Twinkle, Ode to Joy, Mary Had a Little
  Lamb, Frère Jacques, Amazing Grace) laid out as staircases — loading one
  replaces your machine (two-tap confirm, no dialogs).
- **Surprise**: generates a random playable machine (seeded random walk of
  scale degrees, bumpers placed off the marble path).
- **Share**: copies a URL with the whole machine encoded in the hash
  (`#m=…`). Anyone who opens it builds your exact machine. Your own machine
  also autosaves to localStorage.
- **Scales**: major / minor / major pentatonic / dorian — every bar in every
  shared machine stays in the machine's scale.
- Keyboard: `Space` drop · `A` auto · `M` mute · `Esc` deselect/close.

Touch-first (pointer events, 44 px targets, `touch-action: none` on the
board); mouse works identically. Reduced-motion users get no trails, particles
or flash animations.

## Why it sounds in tune

A bar's only pitch datum is its **scale degree** (0–15, two octaves). Degree →
MIDI → frequency lives in `js/scale.js` and is the *only* thing that travels in
a shared link, so a machine can never be out of key — yours or someone else's.
Physics (`js/physics.js`) is a small custom 2D engine (gravity, capsule bars,
bumper circles, marble-marble collisions, fixed-substep integration); audio
events and canvas both drain the same `world.events`, the same shared clock. Audio is synthesized per strike: fundamental +
4.01× partial + a 12 ms noise click, velocity-sensitive, through a compressor.

## Tests

Requires Node.js. Run `npm test` or `node test.mjs`. The existing suite checks scale locking, serialization and repair, preset melodies, seeded generation, and bounded physics.

## Files

`index.html`, `style.css`, and `js/` are the runtime; `test.mjs` and `package.json` provide the dependency-free test command.

## Limits

Audio is synthesized by Web Audio. Automated model tests do not prove speaker playback, touch interaction, keyboard accessibility, or browser rendering. The 2D physics is illustrative; unusual arrangements can behave chaotically. Sharing encodes the machine in the URL fragment, and localStorage saves it in the current browser. Large arrangements can produce long links.
