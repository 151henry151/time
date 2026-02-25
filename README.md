# Eternal Weave

Eternal Weave is a small browser game inspired by philosophy of time, with **eternalism** as the central mechanic:
all moments are equally real, so you edit your entire worldline at once.

## Core gameplay loop

- The board is a spacetime grid.
- Each row is a time slice.
- Your worldline is one position per time slice, connected as a 4D "time worm" (perdurant style).
- The moving **now/lockline** freezes slices as it passes them.
- You can only edit slices that are still in the open future.
- You win by stabilizing all mandatory anchors before the lockline reaches the end.

## Why the mechanics map to the concepts

- **Eternalism**: every slice exists and is editable simultaneously.
- **A-series vs B-series**: perspective mode (`V`) changes observational framing and affects some anchor constraints.
- **Relativity of simultaneity**: frame tilt (`Q`/`E`) changes relativistic anchor alignment.
- **Perdurantism / four-dimensionalism**: identity is the full worldline, not a single present instant.
- **Proper acceleration inspiration**: abrupt worldline changes trigger penalties on stricter levels.

## Difficulty progression

Levels become progressively harder by combining:

- faster lockline speeds,
- more paradox hazards,
- mandatory perspective constraints (A-series or B-series),
- mandatory tilt constraints on relativistic anchors,
- tighter coherence checks across adjacent slices.

## Controls

- `↑` / `↓` (or `W` / `S`): choose time slice
- `←` / `→` (or `A` / `D`): move your position in that slice (if still unlocked)
- `Q` / `E`: change frame tilt (relativity-of-simultaneity visualization)
- `V`: toggle A-series / B-series view
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
2. Uses keyboard controls to build a valid level-1 worldline.
3. Verifies lockline-based completion and progression.
4. Validates solvability of the next harder level and confirms score growth.

Run:

```bash
npm test
```

If Playwright browsers are not installed yet:

```bash
npx playwright install chromium
```
