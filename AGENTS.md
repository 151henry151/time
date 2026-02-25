# AGENTS.md

## Cursor Cloud specific instructions

**Eternal Weave** is a static browser game (vanilla JS/HTML/CSS, no build step). See `README.md` for controls and gameplay.

### Running the app

```bash
npm run start          # python3 -m http.server 8080
```

Open http://localhost:8080. No build step needed — files are served directly.

### Testing

```bash
npm test               # runs tests/playability.test.mjs via Playwright + headless Chromium
```

Playwright Chromium is pre-installed via the update script (`npm install && npx playwright install chromium`). If tests fail with a missing-browser error, re-run `npx playwright install chromium`.

### Gotchas

- The dev server is Python's built-in `http.server` (called via `npm run start`). Python 3 must be available on `PATH`.
- There is no linter or type-checker configured in this project; skip lint checks.
- The test uses `file://` URLs to load `index.html` directly (no running server required for tests). The dev server is only needed for manual browser testing.
- The game exposes `window.__eternalWeaveDebug` for programmatic testing (get state, solution path, etc.).
