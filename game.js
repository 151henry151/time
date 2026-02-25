(() => {
  const canvas = document.getElementById("gameCanvas");
  if (!canvas) {
    return;
  }

  const ctx = canvas.getContext("2d");
  const ui = {
    levelValue: document.getElementById("levelValue"),
    scoreValue: document.getElementById("scoreValue"),
    targetsValue: document.getElementById("targetsValue"),
    paradoxValue: document.getElementById("paradoxValue"),
    speedValue: document.getElementById("speedValue"),
    viewValue: document.getElementById("viewValue"),
    tiltValue: document.getElementById("tiltValue"),
    statusMessage: document.getElementById("statusMessage"),
  };

  const config = {
    cols: 11,
    rows: 15,
    board: {
      x: 78,
      y: 54,
      width: 640,
      height: 530,
    },
    maxFrameTilt: 4,
  };

  const state = {
    level: 1,
    totalScore: 0,
    viewMode: "A",
    frameSkew: 0,
    cursorT: 0,
    nowPhase: 0,
    nowSpeed: 0.45,
    worldline: [],
    baselinePath: [],
    solutionPath: [],
    targets: [],
    hazards: new Set(),
    currentEvaluation: null,
  };

  const viewNames = {
    A: "A-series",
    B: "B-series",
  };

  const cellW = config.board.width / (config.cols - 1);
  const cellH = config.board.height / (config.rows - 1);

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function keyOf(t, x) {
    return `${t},${x}`;
  }

  function mulberry32(seed) {
    let a = seed >>> 0;
    return () => {
      a += 0x6d2b79f5;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function pickStep(rng) {
    const roll = rng();
    if (roll < 0.3) {
      return -1;
    }
    if (roll > 0.7) {
      return 1;
    }
    return 0;
  }

  function shuffle(array, rng) {
    const copy = array.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      const tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  function generateLevel(level) {
    const rng = mulberry32((level + 11) * 2654435761);

    const solutionPath = Array.from({ length: config.rows }, () => 0);
    solutionPath[0] = Math.floor(config.cols / 2);

    for (let t = 1; t < config.rows; t += 1) {
      const next = solutionPath[t - 1] + pickStep(rng);
      solutionPath[t] = clamp(next, 0, config.cols - 1);
    }

    // Add sparse bends to prevent over-straight paths.
    for (let t = 2; t < config.rows - 2; t += 1) {
      if (rng() < 0.15) {
        const bend = rng() < 0.5 ? -1 : 1;
        const trial = clamp(solutionPath[t] + bend, 0, config.cols - 1);
        if (Math.abs(trial - solutionPath[t - 1]) <= 1 && Math.abs(solutionPath[t + 1] - trial) <= 1) {
          solutionPath[t] = trial;
        }
      }
    }

    const candidateTimes = Array.from({ length: config.rows - 2 }, (_, i) => i + 1);
    const targetCount = Math.min(4 + Math.floor(level / 2), 8);
    const targetTimes = shuffle(candidateTimes, rng).slice(0, targetCount).sort((a, b) => a - b);
    const targets = targetTimes.map((t, idx) => ({ id: idx + 1, t, x: solutionPath[t] }));

    const blocked = new Set(solutionPath.map((x, t) => keyOf(t, x)));
    for (const target of targets) {
      blocked.add(keyOf(target.t, target.x));
    }

    const hazards = new Set();
    const hazardCount = Math.min(8 + level * 2, Math.floor(config.rows * config.cols * 0.28));
    let attempts = 0;

    while (hazards.size < hazardCount && attempts < 6000) {
      attempts += 1;
      const t = Math.floor(rng() * config.rows);
      const x = Math.floor(rng() * config.cols);
      const key = keyOf(t, x);
      if (blocked.has(key)) {
        continue;
      }
      hazards.add(key);
    }

    state.solutionPath = solutionPath;
    state.targets = targets;
    state.hazards = hazards;
    state.baselinePath = Array.from({ length: config.rows }, () => Math.floor(config.cols / 2));
    state.worldline = state.baselinePath.slice();
    state.cursorT = 0;
    state.nowPhase = 0;
  }

  function evaluateWorldline() {
    const hitTargets = [];
    const paradoxTimes = [];
    const speedBreaks = [];
    let properAcceleration = 0;

    for (const target of state.targets) {
      if (state.worldline[target.t] === target.x) {
        hitTargets.push(target.id);
      }
    }

    for (let t = 0; t < config.rows; t += 1) {
      if (state.hazards.has(keyOf(t, state.worldline[t]))) {
        paradoxTimes.push(t);
      }

      if (t > 0) {
        const speedDiff = Math.abs(state.worldline[t] - state.worldline[t - 1]);
        if (speedDiff > 1) {
          speedBreaks.push(t);
        }
      }

      if (t > 1) {
        const v1 = state.worldline[t] - state.worldline[t - 1];
        const v0 = state.worldline[t - 1] - state.worldline[t - 2];
        properAcceleration += Math.abs(v1 - v0);
      }
    }

    const stable =
      hitTargets.length === state.targets.length && paradoxTimes.length === 0 && speedBreaks.length === 0;

    return {
      hitTargets,
      paradoxTimes,
      speedBreaks,
      properAcceleration,
      stable,
    };
  }

  function toPoint(t, x) {
    return {
      px: config.board.x + x * cellW,
      py: config.board.y + t * cellH,
    };
  }

  function rowColorForMode(t) {
    if (state.viewMode === "B") {
      return "rgba(115, 152, 186, 0.22)";
    }

    const delta = t - state.nowPhase;
    if (Math.abs(delta) < 0.5) {
      return "rgba(255, 231, 132, 0.36)";
    }
    if (delta < 0) {
      return "rgba(106, 170, 255, 0.2)";
    }
    return "rgba(176, 134, 255, 0.2)";
  }

  function drawBackground() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#081726";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.strokeStyle = "rgba(111, 158, 207, 0.32)";
    ctx.lineWidth = 1;

    for (let t = 0; t < config.rows; t += 1) {
      const y = config.board.y + t * cellH;
      ctx.beginPath();
      ctx.moveTo(config.board.x - 20, y);
      ctx.lineTo(config.board.x + config.board.width + 20, y);
      ctx.stroke();
    }

    for (let x = 0; x < config.cols; x += 1) {
      const px = config.board.x + x * cellW;
      ctx.beginPath();
      ctx.moveTo(px, config.board.y - 18);
      ctx.lineTo(px, config.board.y + config.board.height + 18);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawSimultaneityLines() {
    const skewPx = state.frameSkew * cellH * 0.38;
    const spacing = cellH * 1.7;
    const base = config.board.y + (state.nowPhase % 1) * spacing;

    ctx.save();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = state.viewMode === "A" ? "rgba(127, 205, 255, 0.2)" : "rgba(193, 193, 204, 0.18)";

    for (let i = -4; i <= 15; i += 1) {
      const y = base + i * spacing;
      ctx.beginPath();
      ctx.moveTo(config.board.x - 26, y);
      ctx.lineTo(config.board.x + config.board.width + 26, y - skewPx);
      ctx.stroke();
    }

    const nowY = config.board.y + state.nowPhase * cellH;
    ctx.strokeStyle = "rgba(255, 225, 115, 0.88)";
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(config.board.x - 26, nowY);
    ctx.lineTo(config.board.x + config.board.width + 26, nowY - skewPx);
    ctx.stroke();
    ctx.restore();
  }

  function drawTargets(evaluation) {
    for (const target of state.targets) {
      const { px, py } = toPoint(target.t, target.x);
      const hit = evaluation.hitTargets.includes(target.id);

      ctx.fillStyle = hit ? "#90ffe2" : "#58d5ff";
      ctx.beginPath();
      ctx.arc(px, py, hit ? 8.4 : 7.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = hit ? "rgba(145, 255, 233, 0.95)" : "rgba(104, 211, 255, 0.84)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px, py, 12.5, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function drawHazards(evaluation) {
    for (const hazard of state.hazards) {
      const [tStr, xStr] = hazard.split(",");
      const t = Number(tStr);
      const x = Number(xStr);
      const { px, py } = toPoint(t, x);
      const active = evaluation.paradoxTimes.includes(t) && state.worldline[t] === x;

      ctx.fillStyle = active ? "#ff3f59" : "#9f3241";
      ctx.fillRect(px - 8, py - 8, 16, 16);

      ctx.strokeStyle = active ? "#ffd3d8" : "#f6929f";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(px - 7, py - 7);
      ctx.lineTo(px + 7, py + 7);
      ctx.moveTo(px + 7, py - 7);
      ctx.lineTo(px - 7, py + 7);
      ctx.stroke();
    }
  }

  function drawWorldline(evaluation) {
    ctx.save();
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = evaluation.stable ? "#7dffad" : "#ffe07a";
    ctx.lineWidth = 5.5;

    for (let t = 0; t < config.rows - 1; t += 1) {
      const current = toPoint(t, state.worldline[t]);
      const next = toPoint(t + 1, state.worldline[t + 1]);
      const broken = Math.abs(state.worldline[t + 1] - state.worldline[t]) > 1;

      ctx.strokeStyle = broken ? "#ff6f6f" : evaluation.stable ? "#6fffb4" : "#ffd871";
      ctx.beginPath();
      ctx.moveTo(current.px, current.py);
      ctx.lineTo(next.px, next.py);
      ctx.stroke();
    }

    for (let t = 0; t < config.rows; t += 1) {
      const point = toPoint(t, state.worldline[t]);
      const selected = t === state.cursorT;
      const unsafe = evaluation.paradoxTimes.includes(t);
      const speedBroken = evaluation.speedBreaks.includes(t);

      ctx.fillStyle = unsafe ? "#ff7080" : speedBroken ? "#ffbc7c" : "#d1f2ff";
      ctx.beginPath();
      ctx.arc(point.px, point.py, selected ? 8.2 : 5.8, 0, Math.PI * 2);
      ctx.fill();

      if (selected) {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(point.px, point.py, 12.8, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  function drawLabels() {
    ctx.save();
    ctx.fillStyle = "#d9edff";
    ctx.font = "14px system-ui, sans-serif";
    ctx.fillText("PAST", config.board.x + config.board.width + 32, config.board.y + 6);
    ctx.fillText("FUTURE", config.board.x + config.board.width + 24, config.board.y + config.board.height + 4);

    for (let t = 0; t < config.rows; t += 1) {
      const y = config.board.y + t * cellH + 4;
      ctx.fillStyle = rowColorForMode(t);
      ctx.fillRect(config.board.x - 42, y - 11, 34, 18);
      ctx.fillStyle = "#e5f2ff";
      ctx.fillText(`${t}`, config.board.x - 34, y + 2);
    }

    ctx.fillStyle = "#b5d3f3";
    ctx.fillText("time slices", config.board.x - 65, config.board.y - 14);
    ctx.fillText("space position", config.board.x + config.board.width - 58, config.board.y + config.board.height + 32);
    ctx.restore();
  }

  function drawLegend(evaluation) {
    const x = config.board.x + config.board.width + 14;
    const y = config.board.y + 88;
    ctx.save();

    ctx.fillStyle = "#c9e4ff";
    ctx.font = "13px system-ui, sans-serif";
    ctx.fillText("Legend", x, y - 20);

    ctx.fillStyle = "#58d5ff";
    ctx.beginPath();
    ctx.arc(x + 7, y + 2, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#d9ecff";
    ctx.fillText("Event (must hit)", x + 20, y + 6);

    ctx.fillStyle = "#a53a4d";
    ctx.fillRect(x, y + 20, 12, 12);
    ctx.fillStyle = "#d9ecff";
    ctx.fillText("Paradox cell", x + 20, y + 30);

    ctx.strokeStyle = evaluation.stable ? "#6dffb0" : "#ffd871";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, y + 52);
    ctx.lineTo(x + 14, y + 64);
    ctx.stroke();
    ctx.fillStyle = "#d9ecff";
    ctx.fillText("Your worldline", x + 20, y + 63);
    ctx.restore();
  }

  function updateStatus(evaluation) {
    ui.levelValue.textContent = String(state.level);
    ui.scoreValue.textContent = String(state.totalScore);
    ui.targetsValue.textContent = `${evaluation.hitTargets.length}/${state.targets.length}`;
    ui.paradoxValue.textContent = String(evaluation.paradoxTimes.length);
    ui.speedValue.textContent = String(evaluation.speedBreaks.length);
    ui.viewValue.textContent = viewNames[state.viewMode];
    ui.tiltValue.textContent = state.frameSkew > 0 ? `+${state.frameSkew}` : String(state.frameSkew);

    let status = "Edit any time slice. Every move changes the whole block universe.";
    if (evaluation.speedBreaks.length > 0) {
      status = "Speed break detected: move between adjacent times by at most one column.";
    } else if (evaluation.paradoxTimes.length > 0) {
      status = "Paradox hit: your worldline enters a red cell. Reroute around it.";
    } else if (evaluation.hitTargets.length < state.targets.length) {
      status = "Good. Keep shaping your path until all blue events are touched.";
    } else if (evaluation.stable) {
      const bonus = Math.max(60, 150 + state.level * 20 - evaluation.properAcceleration * 8);
      status = `Stable block achieved! Press Enter for next level (+${bonus} points).`;
    }
    ui.statusMessage.textContent = status;
  }

  function resetPath() {
    state.worldline = state.baselinePath.slice();
    state.cursorT = 0;
  }

  function moveCursor(delta) {
    state.cursorT = clamp(state.cursorT + delta, 0, config.rows - 1);
  }

  function movePoint(delta) {
    const t = state.cursorT;
    state.worldline[t] = clamp(state.worldline[t] + delta, 0, config.cols - 1);
  }

  function toggleViewMode() {
    state.viewMode = state.viewMode === "A" ? "B" : "A";
  }

  function advanceIfStable() {
    const evaluation = state.currentEvaluation;
    if (!evaluation || !evaluation.stable) {
      return;
    }
    const bonus = Math.max(60, 150 + state.level * 20 - evaluation.properAcceleration * 8);
    state.totalScore += bonus;
    state.level += 1;
    generateLevel(state.level);
  }

  function handleKeydown(event) {
    const key = event.key.toLowerCase();
    const prevent =
      key === "arrowup" ||
      key === "arrowdown" ||
      key === "arrowleft" ||
      key === "arrowright" ||
      key === " " ||
      key === "enter";

    if (prevent) {
      event.preventDefault();
    }

    if (key === "arrowup" || key === "w") {
      moveCursor(-1);
    } else if (key === "arrowdown" || key === "s") {
      moveCursor(1);
    } else if (key === "arrowleft" || key === "a") {
      movePoint(-1);
    } else if (key === "arrowright" || key === "d") {
      movePoint(1);
    } else if (key === "q") {
      state.frameSkew = clamp(state.frameSkew - 1, -config.maxFrameTilt, config.maxFrameTilt);
    } else if (key === "e") {
      state.frameSkew = clamp(state.frameSkew + 1, -config.maxFrameTilt, config.maxFrameTilt);
    } else if (key === "v") {
      toggleViewMode();
    } else if (key === "r") {
      resetPath();
    } else if (key === "enter") {
      advanceIfStable();
    }
  }

  function drawFrame(evaluation) {
    drawBackground();
    drawSimultaneityLines();
    drawHazards(evaluation);
    drawTargets(evaluation);
    drawWorldline(evaluation);
    drawLabels();
    drawLegend(evaluation);
    updateStatus(evaluation);
  }

  let lastTimestamp = performance.now();

  function tick(timestamp) {
    const dt = Math.min(0.05, (timestamp - lastTimestamp) / 1000);
    lastTimestamp = timestamp;

    state.nowPhase += dt * state.nowSpeed;
    if (state.nowPhase >= config.rows) {
      state.nowPhase -= config.rows;
    }

    state.currentEvaluation = evaluateWorldline();
    drawFrame(state.currentEvaluation);
    window.requestAnimationFrame(tick);
  }

  function snapshotState() {
    return {
      level: state.level,
      score: state.totalScore,
      viewMode: state.viewMode,
      frameSkew: state.frameSkew,
      cursorT: state.cursorT,
      worldline: state.worldline.slice(),
      solutionPath: state.solutionPath.slice(),
      targets: state.targets.map((target) => ({ ...target })),
      hazards: Array.from(state.hazards),
      evaluation: state.currentEvaluation
        ? {
            stable: state.currentEvaluation.stable,
            properAcceleration: state.currentEvaluation.properAcceleration,
            hitTargets: state.currentEvaluation.hitTargets.slice(),
            paradoxTimes: state.currentEvaluation.paradoxTimes.slice(),
            speedBreaks: state.currentEvaluation.speedBreaks.slice(),
          }
        : null,
    };
  }

  window.__eternalWeaveDebug = {
    getState: snapshotState,
  };

  window.addEventListener("keydown", handleKeydown);
  generateLevel(1);
  state.currentEvaluation = evaluateWorldline();
  window.requestAnimationFrame(tick);
})();
