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
    assert(initial.evaluation !== null, "Expected initial evaluation to exist");

    await page.keyboard.press("v");
    await page.keyboard.press("e");
    await page.keyboard.press("q");

    await solveCurrentLevel(page);
    const solved = await page.evaluate(() => window.__eternalWeaveDebug.getState());
    assert(solved.evaluation?.stable, "Expected level to become stable after solving path");

    await page.keyboard.press("Enter");
    await page.waitForTimeout(120);
    const advanced = await page.evaluate(() => window.__eternalWeaveDebug.getState());
    assert(advanced.level === 2, `Expected level to advance to 2, got ${advanced.level}`);
    assert(advanced.score > 0, "Expected score to increase after advancing");

    console.log("Playability test passed.");
    console.log(
      JSON.stringify(
        {
          initialLevel: initial.level,
          advancedLevel: advanced.level,
          scoreAfterAdvance: advanced.score,
          remainingTargetsOnNewLevel: advanced.targets.length,
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
