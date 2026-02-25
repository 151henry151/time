import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function solveCurrentLevel(page) {
  const before = await page.evaluate(() => window.__eternalWeaveDebug.getState());
  const solution = before.solutionPath;
  let cursor = before.cursorT;
  let x = before.worldline[cursor];

  for (let t = 0; t < solution.length; t += 1) {
    while (cursor < t) {
      await page.keyboard.press("ArrowDown");
      cursor += 1;
      x = (await page.evaluate(() => window.__eternalWeaveDebug.getState())).worldline[cursor];
    }

    while (cursor > t) {
      await page.keyboard.press("ArrowUp");
      cursor -= 1;
      x = (await page.evaluate(() => window.__eternalWeaveDebug.getState())).worldline[cursor];
    }

    const targetX = solution[t];
    while (x < targetX) {
      await page.keyboard.press("ArrowRight");
      x += 1;
    }
    while (x > targetX) {
      await page.keyboard.press("ArrowLeft");
      x -= 1;
    }
  }

  await page.waitForTimeout(120);
}

async function main() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const pagePath = path.resolve(__dirname, "../index.html");
  const pageUrl = `file://${pagePath}`;

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(pageUrl);
    await page.waitForFunction(() => typeof window.__eternalWeaveDebug?.getState === "function");

    const initial = await page.evaluate(() => window.__eternalWeaveDebug.getState());
    assert(initial.level === 1, "Expected initial level to be 1");
    assert(initial.phase === "running", "Expected initial phase to be running");

    // Freeze lockline while entering a path with real key input.
    await page.evaluate(() => window.__eternalWeaveDebug.setNowSpeed(0));

    await page.keyboard.press("v");
    await page.keyboard.press("e");
    await page.keyboard.press("q");
    const manipulated = await page.evaluate(() => window.__eternalWeaveDebug.getState());
    assert(manipulated.viewMode === "B", "Expected V key to toggle to B mode");
    assert(manipulated.frameSkew === 0, "Expected E then Q to net zero frame skew");

    await solveCurrentLevel(page);

    // Let lockline process quickly and verify level completion.
    await page.evaluate(() => window.__eternalWeaveDebug.setNowSpeed(12));
    await page.waitForFunction(() => window.__eternalWeaveDebug.getState().phase === "won", { timeout: 12000 });
    const solved = await page.evaluate(() => window.__eternalWeaveDebug.getState());
    assert(solved.phase === "won", "Expected level 1 to stabilize");

    await page.keyboard.press("Enter");
    await page.waitForFunction(() => window.__eternalWeaveDebug.getState().level === 2, { timeout: 5000 });
    const advanced = await page.evaluate(() => window.__eternalWeaveDebug.getState());
    assert(advanced.level === 2, `Expected level to advance to 2, got ${advanced.level}`);

    // Harder levels are solved through the in-game mechanics debugger to validate solvability.
    await page.evaluate(() => window.__eternalWeaveDebug.autoSolveCurrentLevel());
    await page.waitForFunction(() => window.__eternalWeaveDebug.getState().phase === "won", { timeout: 8000 });

    await page.keyboard.press("Enter");
    await page.waitForFunction(() => window.__eternalWeaveDebug.getState().level === 3, { timeout: 5000 });
    const afterTwoLevels = await page.evaluate(() => window.__eternalWeaveDebug.getState());
    assert(afterTwoLevels.level === 3, "Expected progression into level 3");
    assert(afterTwoLevels.score > 0, "Expected score to increase after completing levels");

    console.log("Playability test passed.");
    console.log(
      JSON.stringify(
        {
          initialLevel: initial.level,
          reachedLevel: afterTwoLevels.level,
          scoreAfterTwoCompletions: afterTwoLevels.score,
          phaseAtEnd: afterTwoLevels.phase,
          anchorsOnCurrentLevel: afterTwoLevels.totalAnchors,
        },
        null,
        2
      )
    );
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error.stack || String(error));
  process.exitCode = 1;
});
