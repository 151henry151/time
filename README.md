# Eternal Weave

Eternal Weave is a small browser game inspired by philosophy of time, with **eternalism** as the central mechanic:
all moments are equally real, so you edit your entire worldline at once.

## Core idea

- The board is a spacetime grid.
- Each row is a time slice.
- Your worldline is one position per time slice, connected as a 4D "time worm."
- You win by creating one stable worldline that:
  - touches all required blue events,
  - avoids red paradox cells,
  - never jumps more than one column between adjacent times.

The yellow scanline is only the experienced "now" (A-series perspective).  
Press `V` to switch to B-series style visualization (earlier/later structure).

## Controls

- `↑` / `↓` (or `W` / `S`): choose time slice
- `←` / `→` (or `A` / `D`): move your position in that slice
- `Q` / `E`: change frame tilt (relativity-of-simultaneity visualization)
- `V`: toggle A-series / B-series view
- `R`: reset worldline for current level
- `Enter`: advance once the level is stable

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
2. Uses keyboard controls to solve level 1.
3. Verifies the level advances and score increases.

Run:

```bash
npm test
```

If Playwright browsers are not installed yet:

```bash
npx playwright install chromium
```
