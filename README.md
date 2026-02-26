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
- **A-series vs B-series**: `Space` switches observational mode; some anchors/hazards are frame-dependent.
- **Relativity of simultaneity**: observer tilt (`Z`/`X`) shifts relativistic anchors and hazard activation.
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

All main keys are in the left-hand home area:

- `F` / `R`: choose time slice (↑/↓ also work)
- `W` / `S`: move Y in selected slice
- `A` / `D`: move X in selected slice
- `Q` / `E`: move Z in selected slice
- `Z` / `X`: change observer frame tilt
- `Space`: toggle A-series / B-series view
- `Shift`: cycle camera angle (front / top / side / default)
- Mouse drag: orbit camera in 360° around the full scene
- Mouse wheel: zoom in/out
- `Backspace`: reset worldline for current level
- `Enter`: advance after timeline stabilization (or retry after collapse)

### Mobile controls

On touch devices, an on-screen control deck appears automatically with:

- slice controls (`t-1`, `t+1`),
- direct axis controls (`x`, `y`, `z`),
- frame controls (`tilt`, `view`),
- action buttons (`enter`, `reset`).

Buttons support press-and-hold repeat for fast movement.

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
2. Verifies mobile control visibility and touch interactions in mobile emulation.
3. Exercises live keyboard controls in the 3D input model.
4. Solves level 1 and verifies stabilization with paradox constraints active.
5. Confirms progression into harder levels and score growth.

Run:

```bash
npm test
```

If Playwright browsers are not installed yet:

```bash
npx playwright install chromium
```
