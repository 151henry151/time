# Eternal Weave

Eternal Weave is a small browser game inspired by philosophy of time, with **eternalism** as the central mechanic:
all moments are equally real, so you edit your entire worldline at once.

## Core gameplay loop (3D space + 1D time)

- You control a **worldtube**: one 3D position `(x,y,z)` for each time slice `t`.
- Time is the fourth axis: all slices exist at once, but a moving **now/lockline** freezes slices as it passes them.
- You can **orbit the camera in 360°** by click-dragging the canvas to inspect the full 3D representation from any angle.
- You can only edit slices that are still in the open future.
- You stabilize **core anchors** (required events) while avoiding hazards and paradox switches.
- A timeline collapses if lockline reaches unresolved core anchors, chronons are depleted, or paradox rules are violated.

## Why the mechanics map to the concepts

- **Eternalism / block universe**: every time slice is simultaneously present in the editor.
- **A-series vs B-series**: `V` switches observational mode; some anchors/hazards are frame-dependent.
- **Relativity of simultaneity**: observer tilt (`J`/`L`) shifts relativistic anchors and hazard activation.
- **Four-dimensionalism / perdurantism**: player identity is the full 4D worldtube, not a single instant.
- **Proper acceleration / causal coherence**: abrupt 4D turns are penalized on harder levels.
- **Paradoxes of time**: a ledger enforces causal precedence, bootstrap coherence, and grandfather-style contradictions.

## Difficulty progression

Levels become progressively harder by combining:

- faster lockline speeds,
- denser 3D hazard fields,
- mandatory view and tilt constraints,
- relative anchors that shift with observer frame,
- stricter causal coherence checks,
- explicit paradox ledgers that can invalidate a run.

## Controls

- `↑` / `↓`: choose time slice
- `A` / `D`: move X coordinate in selected slice
- `W` / `S`: move Y coordinate in selected slice
- `Q` / `E`: move Z coordinate in selected slice
- `J` / `L`: change observer frame tilt
- `V`: toggle A-series / B-series view
- Mouse drag: orbit camera in 360° around the full scene
- Mouse wheel: zoom camera distance in/out
- `R`: reset worldline for current level
- `Enter`: advance after timeline stabilization (or retry after collapse)

## Run locally

Open `index.html` directly in a browser, or run a static server:

```bash
npm install
npm run start
```

Then open <http://localhost:8080>.

## Playability test

This repository includes a headless browser test that:

1. Opens the game in Chromium.
2. Exercises live keyboard controls in the new 3D input model.
3. Solves level 1 and verifies stabilization with paradox constraints active.
4. Confirms progression into harder levels and score growth.

Run:

```bash
npm test
```

If Playwright browsers are not installed yet:

```bash
npx playwright install chromium
```
