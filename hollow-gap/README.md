# The Hollow Gap Arcade

Three short browser games in a fictional pixel-art cabinet, from the Crew:

- **Night Shift at the Diner:** serve a late-night rush and face the boss.
- **Tower Climb:** climb toward a beacon through the wind.
- **Static:** tune a radio dial and catch transmissions.

## Play

Open `index.html` in a modern browser. Alternatively, serve this directory with
any static web server. For example, with Python 3:

```sh
python3 -m http.server 8900 --bind 127.0.0.1
```

Then open `http://127.0.0.1:8900/`. Stop the server with Ctrl+C.
No package installation or build step is required.

## Controls

Arrows or WASD move and tune; Space or Z performs an action or jump. Enter starts
from attract mode; P pauses. On-screen touch controls and the browser Gamepad API
are also supported. Sound starts after a user gesture. The CRT toggle adds a
visual effect.

Artwork uses Canvas and CSS; audio is synthesized with Web Audio. Scores and
initials are stored only in this browser's local storage. There are no remote
scores, analytics, downloaded assets or external service dependencies.

## Automated checks and limits

The existing `window.__hollowGap.runScriptedTest(name)` hook runs a deterministic
accelerated playthrough for `diner`, `tower`, or `static` and returns completion,
score and elapsed-time results. It is not a standalone test runner. Ordinary
play uses the normal game clock.

Headless Chromium checks cover these three playthroughs and basic desktop/mobile
controls. They do not establish game balance, real gamepad compatibility,
subjective audio quality, or support in every browser.
