import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function circularDelta(a, b) {
  const diff = Math.abs(a - b) % (Math.PI * 2);
  return diff > Math.PI ? Math.PI * 2 - diff : diff;
}

async function solveCurrentLevel(page) {
  await page.evaluate(() => window.__eternalWeaveDebug.autoSolveCurrentLevel());
  await page.waitForFunction(() => window.__eternalWeaveDebug.getState().phase === "won", { timeout: 10000 });
}

async function verifyMobileControls(browser, pageUrl) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();

  try {
    await page.goto(pageUrl);
    await page.waitForFunction(() => typeof window.__eternalWeaveDebug?.getState === "function");

    const mobileVisible = await page.evaluate(() => {
      const controls = document.querySelector(".mobile-controls");
      return controls ? window.getComputedStyle(controls).display !== "none" : false;
    });
    assert(mobileVisible, "Expected mobile controls to be visible in mobile emulation");

    await page.evaluate(() => window.__eternalWeaveDebug.setNowSpeed(0));
    const before = await page.evaluate(() => window.__eternalWeaveDebug.getState());

    await page.locator('[data-action="sliceNext"]').click();
    await page.locator('[data-action="moveXPos"]').click();
    await page.locator('[data-action="moveYPos"]').click();
    await page.locator('[data-action="moveZPos"]').click();
    await page.locator('[data-action="tiltPos"]').click();
    await page.locator('[data-action="toggleView"]').click();

    const after = await page.evaluate(() => window.__eternalWeaveDebug.getState());
    assert(after.cursorT === before.cursorT + 1, "Expected mobile slice button to advance selected time slice");
    assert(after.worldtube[1].x === before.worldtube[1].x + 1, "Expected mobile x control to modify worldtube");
    assert(after.worldtube[1].y === before.worldtube[1].y + 1, "Expected mobile y control to modify worldtube");
    assert(after.worldtube[1].z === before.worldtube[1].z + 1, "Expected mobile z control to modify worldtube");
    assert(after.frameSkew === before.frameSkew + 1, "Expected mobile tilt control to change frame skew");
    assert(after.viewMode === "B", "Expected mobile view button to toggle to B-series");
  } finally {
    await context.close();
  }
}

async function main() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const pagePath = path.resolve(__dirname, "../index.html");
  const pageUrl = `file://${pagePath}`;

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await verifyMobileControls(browser, pageUrl);

    await page.goto(pageUrl);
    await page.waitForFunction(() => typeof window.__eternalWeaveDebug?.getState === "function");

    const initial = await page.evaluate(() => window.__eternalWeaveDebug.getState());
    assert(initial.level === 1, "Expected initial level to be 1");
    assert(initial.phase === "running", "Expected initial phase to be running");
    assert(initial.totalCore >= 5, "Expected multiple core anchors on level 1");
    assert(initial.paradoxLedger.length > 0, "Expected paradox ledger entries to exist");

    // Freeze lockline while exercising real controls.
    await page.evaluate(() => window.__eternalWeaveDebug.setNowSpeed(0));

    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("v");
    await page.keyboard.press("a");
    await page.keyboard.press("d");
    await page.keyboard.press("w");
    await page.keyboard.press("s");
    await page.keyboard.press("q");
    await page.keyboard.press("e");
    await page.keyboard.press("j");
    await page.keyboard.press("l");

    const manipulated = await page.evaluate(() => window.__eternalWeaveDebug.getState());
    assert(manipulated.cursorT === 1, "Expected ArrowDown to change selected time slice");
    assert(manipulated.viewMode === "B", "Expected V key to toggle B-series mode");
    assert(manipulated.frameSkew === 0, "Expected E then Q to net zero frame skew");

    const canvas = page.locator("#gameCanvas");
    const box = await canvas.boundingBox();
    assert(box !== null, "Expected canvas bounding box for drag test");

    const dragStartX = box.x + box.width * 0.55;
    const dragStartY = box.y + box.height * 0.5;
    await page.mouse.move(dragStartX, dragStartY);
    await page.mouse.down();
    await page.mouse.move(dragStartX + 170, dragStartY - 90, { steps: 14 });
    await page.mouse.up();

    const afterDrag = await page.evaluate(() => window.__eternalWeaveDebug.getState());
    const yawShift = circularDelta(manipulated.cameraYaw, afterDrag.cameraYaw);
    const pitchShift = Math.abs(afterDrag.cameraPitch - manipulated.cameraPitch);
    assert(yawShift > 0.1, `Expected camera yaw to change after drag, got ${yawShift}`);
    assert(pitchShift > 0.04, `Expected camera pitch to change after drag, got ${pitchShift}`);

    await solveCurrentLevel(page);
    const solved = await page.evaluate(() => window.__eternalWeaveDebug.getState());
    assert(solved.phase === "won", "Expected level 1 to stabilize");
    assert(solved.capturedCore === solved.totalCore, "Expected all core anchors captured for level completion");

    await page.keyboard.press("Enter");
    await page.waitForFunction(() => window.__eternalWeaveDebug.getState().level === 2, { timeout: 5000 });
    const levelTwo = await page.evaluate(() => window.__eternalWeaveDebug.getState());
    assert(levelTwo.level === 2, `Expected level to advance to 2, got ${levelTwo.level}`);
    assert(levelTwo.totalCore >= 6, "Expected level 2 to have harder anchor count");

    await page.evaluate(() => window.__eternalWeaveDebug.autoSolveCurrentLevel());
    await page.waitForFunction(() => window.__eternalWeaveDebug.getState().phase === "won", { timeout: 8000 });

    await page.keyboard.press("Enter");
    await page.waitForFunction(() => window.__eternalWeaveDebug.getState().level === 3, { timeout: 5000 });
    const afterTwoLevels = await page.evaluate(() => window.__eternalWeaveDebug.getState());
    assert(afterTwoLevels.level === 3, "Expected progression into level 3");
    assert(afterTwoLevels.score > 0, "Expected score to increase after completing levels");
    assert(afterTwoLevels.paradoxLedger.length > 0, "Expected paradox ledger to persist on higher levels");

    console.log("Playability test passed.");
    console.log(
      JSON.stringify(
        {
          initialLevel: initial.level,
          reachedLevel: afterTwoLevels.level,
          scoreAfterTwoCompletions: afterTwoLevels.score,
          phaseAtEnd: afterTwoLevels.phase,
          coreAnchorsOnCurrentLevel: afterTwoLevels.totalCore,
          paradoxRulesOnCurrentLevel: afterTwoLevels.paradoxLedger.length,
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
