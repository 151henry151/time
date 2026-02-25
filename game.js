(() => {
  const canvas = document.getElementById("gameCanvas");
  if (!canvas) {
    return;
  }

  const ctx = canvas.getContext("2d");
  const ui = {
    levelValue: document.getElementById("levelValue"),
    scoreValue: document.getElementById("scoreValue"),
    chrononValue: document.getElementById("chrononValue"),
    lockValue: document.getElementById("lockValue"),
    targetsValue: document.getElementById("targetsValue"),
    phaseValue: document.getElementById("phaseValue"),
    viewValue: document.getElementById("viewValue"),
    tiltValue: document.getElementById("tiltValue"),
    statusMessage: document.getElementById("statusMessage"),
    levelTitle: document.getElementById("levelTitle"),
    levelLore: document.getElementById("levelLore"),
    anchorList: document.getElementById("anchorList"),
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

  const LEVEL_BLUEPRINTS = [
    {
      title: "Block Universe Primer",
      concept:
        "Eternalism first: every slice exists now, but the lockline freezes the past. Plan your path before observation catches it.",
      nowSpeed: 0.18,
      chronons: 8,
      eventCount: 4,
      staticHazards: 12,
      phaseHazards: 0,
      tiltHazards: 0,
      viewEvents: 0,
      tiltEvents: 0,
      maxStep: 1,
      accelCap: null,
      complexity: 1,
      seed: 1031,
    },
    {
      title: "A-Series / B-Series Split",
      concept:
        "Some anchors only stabilize if observed in the right tense perspective. Switch A-series and B-series deliberately.",
      nowSpeed: 0.2,
      chronons: 8,
      eventCount: 5,
      staticHazards: 14,
      phaseHazards: 4,
      tiltHazards: 1,
      viewEvents: 2,
      tiltEvents: 0,
      maxStep: 1,
      accelCap: null,
      complexity: 2,
      seed: 2047,
    },
    {
      title: "Relativity of Simultaneity",
      concept:
        "Frame tilt changes where relativistic anchors appear. Simultaneity is frame-dependent, so adjust tilt at the right moment.",
      nowSpeed: 0.22,
      chronons: 7,
      eventCount: 6,
      staticHazards: 16,
      phaseHazards: 5,
      tiltHazards: 3,
      viewEvents: 2,
      tiltEvents: 2,
      maxStep: 1,
      accelCap: null,
      complexity: 3,
      seed: 3091,
    },
    {
      title: "Perduring Identity",
      concept:
        "You are a temporal worm, not a point-instant self. Keep adjacent slices coherent while perspective constraints intensify.",
      nowSpeed: 0.24,
      chronons: 7,
      eventCount: 6,
      staticHazards: 18,
      phaseHazards: 6,
      tiltHazards: 4,
      viewEvents: 3,
      tiltEvents: 2,
      maxStep: 1,
      accelCap: 1,
      complexity: 4,
      seed: 4013,
    },
    {
      title: "New Riddle Corridor",
      concept:
        "Rules that looked stable start to depend on timing and perspective. Anticipate shifts before the lockline reaches them.",
      nowSpeed: 0.26,
      chronons: 6,
      eventCount: 7,
      staticHazards: 20,
      phaseHazards: 8,
      tiltHazards: 5,
      viewEvents: 3,
      tiltEvents: 3,
      maxStep: 1,
      accelCap: 1,
      complexity: 5,
      seed: 5099,
    },
    {
      title: "Centered World Trial",
      concept:
        "Like centered-world semantics, truth depends on world + agent + time. Your stance (view + tilt) is now part of the puzzle.",
      nowSpeed: 0.28,
      chronons: 6,
      eventCount: 7,
      staticHazards: 22,
      phaseHazards: 9,
      tiltHazards: 6,
      viewEvents: 4,
      tiltEvents: 3,
      maxStep: 1,
      accelCap: 1,
      complexity: 6,
      seed: 6029,
    },
    {
      title: "Problem of Time",
      concept:
        "Global time feels less trustworthy: the lockline accelerates and constraint stacks become brutal. Plan many slices ahead.",
      nowSpeed: 0.31,
      chronons: 5,
      eventCount: 8,
      staticHazards: 24,
      phaseHazards: 10,
      tiltHazards: 7,
      viewEvents: 4,
      tiltEvents: 4,
      maxStep: 1,
      accelCap: 1,
      complexity: 7,
      seed: 7001,
    },
    {
      title: "Eternalist Grandmaster",
      concept:
        "Full synthesis: eternalism, perspective switching, relativistic alignment, and strict temporal coherence under pressure.",
      nowSpeed: 0.34,
      chronons: 5,
      eventCount: 8,
      staticHazards: 27,
      phaseHazards: 12,
      tiltHazards: 8,
      viewEvents: 5,
      tiltEvents: 4,
      maxStep: 1,
      accelCap: 1,
      complexity: 8,
      seed: 8053,
    },
  ];

  const viewNames = {
    A: "A-series",
    B: "B-series",
  };

  const phaseNames = {
    running: "Running",
    won: "Stabilized",
    failed: "Collapsed",
  };

  const cellW = config.board.width / (config.cols - 1);
  const cellH = config.board.height / (config.rows - 1);

  const state = {
    level: 1,
    totalScore: 0,
    levelData: null,
    viewMode: "A",
    frameSkew: 0,
    cursorT: 0,
    nowPhase: 0,
    nowSpeed: 0,
    lockedThrough: -1,
    worldline: [],
    solutionPath: [],
    anchors: [],
    hazards: [],
    chronons: 0,
    maxChronons: 0,
    levelStatus: "running",
    lastLockMessage: "",
    statusOverride: "",
    lastBonus: 0,
    currentPreview: null,
    anchorListCache: "",
  };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function signed(value) {
    return value > 0 ? `+${value}` : `${value}`;
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

  function shuffle(values, rng) {
    const out = values.slice();
    for (let i = out.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      const tmp = out[i];
      out[i] = out[j];
      out[j] = tmp;
    }
    return out;
  }

  function weightedPick(options, rng) {
    const total = options.reduce((sum, option) => sum + option.weight, 0);
    let marker = rng() * total;
    for (const option of options) {
      marker -= option.weight;
      if (marker <= 0) {
        return option.value;
      }
    }
    return options[options.length - 1].value;
  }

  function getBlueprint(levelNumber) {
    if (levelNumber <= LEVEL_BLUEPRINTS.length) {
      return { ...LEVEL_BLUEPRINTS[levelNumber - 1] };
    }

    const base = LEVEL_BLUEPRINTS[LEVEL_BLUEPRINTS.length - 1];
    const extra = levelNumber - LEVEL_BLUEPRINTS.length;
    const eventCount = Math.min(config.rows - 2, base.eventCount + Math.floor(extra / 2));
    return {
      ...base,
      title: `Eternal Extension ${levelNumber}`,
      concept:
        "Beyond the canonical sequence: escalating synthesis of eternalism, simultaneity shifts, and strict worldline coherence.",
      nowSpeed: Math.min(0.5, base.nowSpeed + extra * 0.01),
      chronons: Math.max(3, base.chronons - Math.floor(extra / 3)),
      eventCount,
      staticHazards: base.staticHazards + extra * 2,
      phaseHazards: base.phaseHazards + extra,
      tiltHazards: base.tiltHazards + extra,
      viewEvents: Math.min(eventCount - 1, base.viewEvents + Math.floor(extra / 2)),
      tiltEvents: Math.min(eventCount - 1, base.tiltEvents + Math.floor(extra / 2)),
      complexity: base.complexity + extra,
      seed: base.seed + extra * 991,
    };
  }

  function generateSolutionPath(rng, blueprint) {
    const path = Array.from({ length: config.rows }, () => 0);
    const center = Math.floor(config.cols / 2);
    path[0] = clamp(center + (rng() < 0.5 ? 0 : rng() < 0.75 ? 1 : -1), 0, config.cols - 1);

    for (let t = 1; t < config.rows; t += 1) {
      const prevX = path[t - 1];
      const prevVelocity = t > 1 ? path[t - 1] - path[t - 2] : 0;
      const candidates = [];

      for (const step of [-1, 0, 1]) {
        if (blueprint.accelCap !== null && t > 1 && Math.abs(step - prevVelocity) > blueprint.accelCap) {
          continue;
        }
        const nextX = prevX + step;
        if (nextX < 0 || nextX >= config.cols) {
          continue;
        }
        const moveBias = clamp(0.32 + blueprint.complexity * 0.05, 0.32, 0.82);
        const baseWeight = step === 0 ? 1 - moveBias : moveBias / 2;
        const continuityBonus = step === prevVelocity ? 0.2 : 0;
        const twistBonus = step === -prevVelocity ? blueprint.complexity * 0.02 : 0;
        candidates.push({
          value: step,
          weight: Math.max(0.05, baseWeight + continuityBonus + twistBonus),
        });
      }

      const chosenStep = candidates.length > 0 ? weightedPick(candidates, rng) : 0;
      path[t] = clamp(prevX + chosenStep, 0, config.cols - 1);
    }

    return path;
  }

  function pickAnchorTimes(rng, eventCount) {
    const times = [];
    const start = 1;
    const end = config.rows - 2;
    const span = end - start + 1;
    const stride = span / (eventCount + 1);
    let last = 0;

    for (let i = 0; i < eventCount; i += 1) {
      const base = Math.round(start + stride * (i + 1));
      const jitter = Math.floor(rng() * 3) - 1;
      let t = clamp(base + jitter, start, end);
      if (t <= last) {
        t = last + 1;
      }
      const maxAllowed = end - (eventCount - i - 1);
      if (t > maxAllowed) {
        t = maxAllowed;
      }
      times.push(t);
      last = t;
    }

    return times;
  }

  function makeRelativeConstraint(solutionX, rng, complexity) {
    const magnitudeCap = Math.min(config.maxFrameTilt, 1 + Math.floor(complexity / 2));
    const tilts = [];
    for (let i = 1; i <= magnitudeCap; i += 1) {
      tilts.push(i, -i);
    }

    const randomizedTilts = shuffle(tilts, rng);
    for (const tilt of randomizedTilts) {
      for (const drift of shuffle([1, -1], rng)) {
        const baseX = solutionX - tilt * drift;
        if (baseX >= 0 && baseX < config.cols) {
          return { tilt, drift, baseX };
        }
      }
    }

    return null;
  }

  function generateAnchors(rng, blueprint, solutionPath, levelNumber) {
    const count = Math.min(blueprint.eventCount, config.rows - 2);
    const times = pickAnchorTimes(rng, count);
    const indices = Array.from({ length: count }, (_, i) => i);
    const viewIndexSet = new Set(shuffle(indices, rng).slice(0, Math.min(blueprint.viewEvents, count)));
    const tiltIndexSet = new Set(shuffle(indices, rng).slice(0, Math.min(blueprint.tiltEvents, count)));

    const anchors = [];
    for (let i = 0; i < count; i += 1) {
      const t = times[i];
      const solutionX = solutionPath[t];
      const requiredView = viewIndexSet.has(i) ? (i % 2 === 0 ? "A" : "B") : null;
      const shouldBeRelative = tiltIndexSet.has(i);
      const relative = shouldBeRelative ? makeRelativeConstraint(solutionX, rng, blueprint.complexity) : null;

      anchors.push({
        id: `L${levelNumber}-A${i + 1}`,
        t,
        kind: relative ? "relative" : "absolute",
        baseX: relative ? relative.baseX : solutionX,
        drift: relative ? relative.drift : 0,
        requiredTilt: relative ? relative.tilt : null,
        requiredView,
        status: "pending",
      });
    }
    return anchors;
  }

  function buildIntendedSettings(anchors) {
    const intendedView = Array.from({ length: config.rows }, () => "A");
    const intendedTilt = Array.from({ length: config.rows }, () => 0);
    for (const anchor of anchors) {
      if (anchor.requiredView) {
        intendedView[anchor.t] = anchor.requiredView;
      }
      if (anchor.requiredTilt !== null) {
        intendedTilt[anchor.t] = anchor.requiredTilt;
      }
    }
    return { intendedView, intendedTilt };
  }

  function ruleIsActive(rule, context) {
    switch (rule.type) {
      case "always":
        return true;
      case "viewIs":
        return context.viewMode === rule.view;
      case "viewNot":
        return context.viewMode !== rule.view;
      case "tiltNot":
        return context.frameSkew !== rule.tilt;
      case "tiltOutside":
        return context.frameSkew < rule.min || context.frameSkew > rule.max;
      case "any":
        return rule.rules.some((nested) => ruleIsActive(nested, context));
      default:
        return false;
    }
  }

  function generateHazards(rng, blueprint, solutionPath, anchors, intendedSettings) {
    const hazards = [];
    const usedCells = new Set();

    function addHazard(hazard) {
      const cellKey = `${hazard.t},${hazard.x}`;
      if (usedCells.has(cellKey)) {
        return false;
      }
      usedCells.add(cellKey);
      hazards.push(hazard);
      return true;
    }

    for (const anchor of anchors) {
      const wrongRules = [];
      if (anchor.requiredView) {
        wrongRules.push({ type: "viewNot", view: anchor.requiredView });
      }
      if (anchor.requiredTilt !== null) {
        wrongRules.push({ type: "tiltNot", tilt: anchor.requiredTilt });
      }
      if (wrongRules.length > 0) {
        addHazard({
          id: `HZ-ENF-${anchor.id}`,
          t: anchor.t,
          x: solutionPath[anchor.t],
          damage: 2,
          style: "enforcer",
          rule: wrongRules.length === 1 ? wrongRules[0] : { type: "any", rules: wrongRules },
        });
      }
    }

    function placeRandom(count, createRule, options = {}) {
      const maxAttempts = count * 120;
      let attempts = 0;
      let placed = 0;

      while (placed < count && attempts < maxAttempts) {
        attempts += 1;
        const t = Math.floor(rng() * config.rows);
        const x = Math.floor(rng() * config.cols);
        const cellKey = `${t},${x}`;
        if (usedCells.has(cellKey)) {
          continue;
        }

        const rule = createRule(t, x);
        if (!rule) {
          continue;
        }

        if (options.avoidSolutionAlways && x === solutionPath[t]) {
          continue;
        }

        if (options.avoidTriggerOnIntendedSolution && x === solutionPath[t]) {
          const context = {
            viewMode: intendedSettings.intendedView[t],
            frameSkew: intendedSettings.intendedTilt[t],
          };
          if (ruleIsActive(rule, context)) {
            continue;
          }
        }

        const style = options.style || "static";
        const damage = options.damage || 1;
        addHazard({
          id: `HZ-${style}-${t}-${x}-${placed}`,
          t,
          x,
          damage,
          style,
          rule,
        });
        placed += 1;
      }
    }

    placeRandom(
      blueprint.staticHazards,
      () => ({
        type: "always",
      }),
      {
        avoidSolutionAlways: true,
        style: "static",
        damage: 1,
      }
    );

    placeRandom(
      blueprint.phaseHazards,
      () => ({
        type: "viewIs",
        view: rng() < 0.5 ? "A" : "B",
      }),
      {
        avoidTriggerOnIntendedSolution: true,
        style: "phase",
        damage: 1,
      }
    );

    placeRandom(
      blueprint.tiltHazards,
      (t) => {
        const safeTilt = intendedSettings.intendedTilt[t];
        const min = clamp(safeTilt - 1, -config.maxFrameTilt, config.maxFrameTilt);
        const max = clamp(safeTilt + 1, -config.maxFrameTilt, config.maxFrameTilt);
        return {
          type: "tiltOutside",
          min,
          max,
        };
      },
      {
        avoidTriggerOnIntendedSolution: true,
        style: "shear",
        damage: 1,
      }
    );

    return hazards;
  }

  function createLevelData(levelNumber) {
    const blueprint = getBlueprint(levelNumber);
    const rng = mulberry32(blueprint.seed + levelNumber * 9973);
    const solutionPath = generateSolutionPath(rng, blueprint);
    const anchors = generateAnchors(rng, blueprint, solutionPath, levelNumber);
    const intendedSettings = buildIntendedSettings(anchors);
    const hazards = generateHazards(rng, blueprint, solutionPath, anchors, intendedSettings);

    return {
      ...blueprint,
      solutionPath,
      anchors,
      hazards,
      intendedView: intendedSettings.intendedView,
      intendedTilt: intendedSettings.intendedTilt,
    };
  }

  function loadLevel(levelNumber) {
    const levelData = createLevelData(levelNumber);
    state.level = levelNumber;
    state.levelData = levelData;
    state.solutionPath = levelData.solutionPath.slice();
    state.anchors = levelData.anchors.map((anchor) => ({ ...anchor, status: "pending" }));
    state.hazards = levelData.hazards.map((hazard) => ({ ...hazard }));
    state.worldline = Array.from({ length: config.rows }, () => Math.floor(config.cols / 2));
    state.viewMode = "A";
    state.frameSkew = 0;
    state.nowPhase = 0;
    state.nowSpeed = levelData.nowSpeed;
    state.lockedThrough = -1;
    state.cursorT = 0;
    state.levelStatus = "running";
    state.chronons = levelData.chronons;
    state.maxChronons = levelData.chronons;
    state.lastLockMessage = "";
    state.statusOverride = "";
    state.lastBonus = 0;
    state.anchorListCache = "";
  }

  function editableStartRow() {
    return clamp(state.lockedThrough + 1, 0, config.rows - 1);
  }

  function rowIsLocked(row) {
    return row <= state.lockedThrough;
  }

  function anchorExpectedX(anchor, frameSkew = state.frameSkew) {
    if (anchor.kind === "relative") {
      return clamp(anchor.baseX + frameSkew * anchor.drift, 0, config.cols - 1);
    }
    return anchor.baseX;
  }

  function anchorSatisfied(anchor, expectedX = anchorExpectedX(anchor)) {
    const positionOk = state.worldline[anchor.t] === expectedX;
    const viewOk = !anchor.requiredView || state.viewMode === anchor.requiredView;
    const tiltOk = anchor.requiredTilt === null || state.frameSkew === anchor.requiredTilt;
    return positionOk && viewOk && tiltOk;
  }

  function hazardIsActive(hazard, viewMode = state.viewMode, frameSkew = state.frameSkew) {
    return ruleIsActive(hazard.rule, { viewMode, frameSkew });
  }

  function hazardVisible(hazard) {
    if (state.viewMode === "B") {
      return true;
    }
    if (hazard.rule.type === "viewIs" && hazard.rule.view === "B") {
      return false;
    }
    if (hazard.rule.type === "viewNot" && hazard.rule.view === "A") {
      return false;
    }
    if (hazard.rule.type === "any") {
      return hazard.rule.rules.every((nested) => {
        if (nested.type === "viewIs" && nested.view === "B") {
          return false;
        }
        if (nested.type === "viewNot" && nested.view === "A") {
          return false;
        }
        return true;
      });
    }
    return true;
  }

  function activeHazardsAt(t, x, viewMode = state.viewMode, frameSkew = state.frameSkew) {
    return state.hazards.filter(
      (hazard) => hazard.t === t && hazard.x === x && hazardIsActive(hazard, viewMode, frameSkew)
    );
  }

  function computePreview() {
    const speedBreaks = new Set();
    const accelBreaks = new Set();
    const hazardRows = new Set();
    const readyAnchors = new Set();
    const expectedByAnchor = new Map();
    const levelData = state.levelData;

    for (const anchor of state.anchors) {
      const expectedX = anchorExpectedX(anchor);
      expectedByAnchor.set(anchor.id, expectedX);
      if (anchor.status !== "pending" || anchorSatisfied(anchor, expectedX)) {
        readyAnchors.add(anchor.id);
      }
    }

    for (let t = 0; t < config.rows; t += 1) {
      const x = state.worldline[t];
      if (activeHazardsAt(t, x).length > 0) {
        hazardRows.add(t);
      }
      if (t > 0) {
        const step = Math.abs(state.worldline[t] - state.worldline[t - 1]);
        if (step > levelData.maxStep) {
          speedBreaks.add(t);
        }
      }
      if (levelData.accelCap !== null && t > 1) {
        const v1 = state.worldline[t] - state.worldline[t - 1];
        const v0 = state.worldline[t - 1] - state.worldline[t - 2];
        if (Math.abs(v1 - v0) > levelData.accelCap) {
          accelBreaks.add(t);
        }
      }
    }

    return {
      speedBreaks,
      accelBreaks,
      hazardRows,
      readyAnchors,
      expectedByAnchor,
    };
  }

  function failLevel(message) {
    if (state.levelStatus !== "running") {
      return;
    }
    state.levelStatus = "failed";
    state.statusOverride = `${message} Press R to rewind this level.`;
  }

  function anchorRequirementSummary(anchor) {
    const chunks = [];
    if (anchor.requiredView) {
      chunks.push(viewNames[anchor.requiredView]);
    }
    if (anchor.requiredTilt !== null) {
      chunks.push(`tilt ${signed(anchor.requiredTilt)}`);
    }
    return chunks.join(" / ");
  }

  function finalizeRow(row) {
    if (state.levelStatus !== "running") {
      return;
    }

    const x = state.worldline[row];
    let damage = 0;
    const notes = [];

    for (const anchor of state.anchors) {
      if (anchor.t !== row || anchor.status !== "pending") {
        continue;
      }
      const expectedX = anchorExpectedX(anchor);
      if (anchorSatisfied(anchor, expectedX)) {
        anchor.status = "captured";
        state.totalScore += 40 + (anchor.requiredTilt !== null ? 10 : 0) + (anchor.requiredView ? 8 : 0);
        notes.push(`anchor ${anchor.id.split("-")[1]} captured`);
      } else {
        anchor.status = "missed";
        const requirementText = anchorRequirementSummary(anchor);
        const requirementFragment = requirementText ? ` while matching ${requirementText}` : "";
        failLevel(`Missed anchor at t=${row}. Required x=${expectedX}${requirementFragment}.`);
        return;
      }
    }

    const hazardHits = activeHazardsAt(row, x);
    if (hazardHits.length > 0) {
      const hitDamage = hazardHits.reduce((sum, hazard) => sum + hazard.damage, 0);
      damage += hitDamage;
      notes.push(`paradox shock -${hitDamage}`);
    }

    if (row > 0) {
      const step = Math.abs(state.worldline[row] - state.worldline[row - 1]);
      if (step > state.levelData.maxStep) {
        damage += 1;
        notes.push("speed break -1");
      }
    }

    if (state.levelData.accelCap !== null && row > 1) {
      const v1 = state.worldline[row] - state.worldline[row - 1];
      const v0 = state.worldline[row - 1] - state.worldline[row - 2];
      if (Math.abs(v1 - v0) > state.levelData.accelCap) {
        damage += 1;
        notes.push("proper acceleration break -1");
      }
    }

    if (damage > 0) {
      state.chronons = Math.max(0, state.chronons - damage);
    } else {
      state.totalScore += 6;
      notes.push("clean lock +6");
    }

    if (state.chronons <= 0) {
      failLevel(`Chronon reserve depleted at t=${row}.`);
      return;
    }

    state.lastLockMessage = `Slice ${row} locked: ${notes.join(", ")}.`;
  }

  function processLockline() {
    const targetLock = clamp(Math.floor(state.nowPhase) - 1, -1, config.rows - 1);
    while (state.lockedThrough < targetLock && state.levelStatus === "running") {
      state.lockedThrough += 1;
      finalizeRow(state.lockedThrough);
    }

    const minCursor = editableStartRow();
    if (state.cursorT < minCursor) {
      state.cursorT = minCursor;
    }
  }

  function checkForWin() {
    if (state.levelStatus !== "running") {
      return;
    }
    if (state.lockedThrough < config.rows - 1) {
      return;
    }

    const missed = state.anchors.some((anchor) => anchor.status === "missed");
    const capturedAll = state.anchors.every((anchor) => anchor.status === "captured");

    if (!missed && capturedAll) {
      state.levelStatus = "won";
      const bonus = state.chronons * 35 + state.level * 15;
      state.lastBonus = bonus;
      state.totalScore += bonus;
      state.statusOverride = `Timeline stabilized. Press Enter for level ${state.level + 1} (+${bonus} bonus).`;
    } else {
      failLevel("Timeline reached the end with unresolved anchors.");
    }
  }

  function moveCursor(delta) {
    const minRow = editableStartRow();
    state.cursorT = clamp(state.cursorT + delta, minRow, config.rows - 1);
  }

  function movePoint(delta) {
    if (state.levelStatus !== "running") {
      return;
    }
    if (rowIsLocked(state.cursorT)) {
      state.statusOverride = "That slice is locked by the observation frontier.";
      return;
    }
    const current = state.worldline[state.cursorT];
    state.worldline[state.cursorT] = clamp(current + delta, 0, config.cols - 1);
  }

  function toggleViewMode() {
    state.viewMode = state.viewMode === "A" ? "B" : "A";
  }

  function resetCurrentLevel() {
    loadLevel(state.level);
  }

  function advanceAfterWin() {
    if (state.levelStatus === "won") {
      loadLevel(state.level + 1);
    } else if (state.levelStatus === "failed") {
      resetCurrentLevel();
    }
  }

  function toPoint(t, x) {
    return {
      px: config.board.x + x * cellW,
      py: config.board.y + t * cellH,
    };
  }

  function drawBackground() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#081726";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let t = 0; t < config.rows; t += 1) {
      const y = config.board.y + t * cellH;
      if (t <= state.lockedThrough) {
        ctx.fillStyle = "rgba(79, 108, 139, 0.25)";
        ctx.fillRect(config.board.x - 18, y - cellH * 0.45, config.board.width + 36, cellH * 0.9);
      } else if (state.viewMode === "A") {
        const delta = t - state.nowPhase;
        ctx.fillStyle = delta < 0 ? "rgba(90, 148, 208, 0.08)" : "rgba(164, 132, 224, 0.06)";
        ctx.fillRect(config.board.x - 18, y - cellH * 0.45, config.board.width + 36, cellH * 0.9);
      }
    }

    ctx.save();
    ctx.strokeStyle = "rgba(111, 158, 207, 0.3)";
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
    const spacing = cellH * 1.65;
    const base = config.board.y + (state.nowPhase % 1) * spacing;

    ctx.save();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = state.viewMode === "A" ? "rgba(125, 204, 255, 0.2)" : "rgba(210, 210, 225, 0.15)";
    for (let i = -4; i <= 16; i += 1) {
      const y = base + i * spacing;
      ctx.beginPath();
      ctx.moveTo(config.board.x - 26, y);
      ctx.lineTo(config.board.x + config.board.width + 26, y - skewPx);
      ctx.stroke();
    }

    const lockY = config.board.y + clamp(state.lockedThrough + 1, 0, config.rows - 1) * cellH;
    const nowY = config.board.y + clamp(state.nowPhase, 0, config.rows - 0.01) * cellH;

    ctx.strokeStyle = "rgba(255, 163, 107, 0.95)";
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(config.board.x - 26, lockY);
    ctx.lineTo(config.board.x + config.board.width + 26, lockY - skewPx);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 232, 125, 0.92)";
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(config.board.x - 26, nowY);
    ctx.lineTo(config.board.x + config.board.width + 26, nowY - skewPx);
    ctx.stroke();
    ctx.restore();
  }

  function drawHazards(preview) {
    for (const hazard of state.hazards) {
      if (!hazardVisible(hazard)) {
        continue;
      }
      const { px, py } = toPoint(hazard.t, hazard.x);
      const active = hazardIsActive(hazard);
      const onWorldline = state.worldline[hazard.t] === hazard.x;
      const highlighted = active && onWorldline && hazard.t <= state.lockedThrough;
      const locked = hazard.t <= state.lockedThrough;

      ctx.save();
      if (!active) {
        ctx.globalAlpha = 0.35;
      } else if (locked) {
        ctx.globalAlpha = 0.72;
      }

      if (hazard.style === "enforcer") {
        ctx.fillStyle = highlighted ? "#ff3f59" : active ? "#f56a78" : "#85515d";
      } else if (hazard.style === "phase") {
        ctx.fillStyle = highlighted ? "#ff636f" : active ? "#ca5e76" : "#74526a";
      } else if (hazard.style === "shear") {
        ctx.fillStyle = highlighted ? "#ff8d43" : active ? "#c78659" : "#745e4e";
      } else {
        ctx.fillStyle = highlighted ? "#ff4c67" : active ? "#9f3241" : "#6b4f56";
      }

      ctx.fillRect(px - 8, py - 8, 16, 16);
      ctx.strokeStyle = highlighted ? "#ffe6ea" : active ? "#ffc6cf" : "#af8e95";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(px - 7, py - 7);
      ctx.lineTo(px + 7, py + 7);
      ctx.moveTo(px + 7, py - 7);
      ctx.lineTo(px - 7, py + 7);
      ctx.stroke();
      ctx.restore();
    }

    if (preview.hazardRows.size > 0 && state.levelStatus === "running") {
      for (const row of preview.hazardRows) {
        if (row <= state.lockedThrough) {
          continue;
        }
        const y = config.board.y + row * cellH;
        ctx.strokeStyle = "rgba(255, 128, 153, 0.25)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(config.board.x - 18, y);
        ctx.lineTo(config.board.x + config.board.width + 18, y);
        ctx.stroke();
      }
    }
  }

  function drawDiamond(px, py, radius) {
    ctx.beginPath();
    ctx.moveTo(px, py - radius);
    ctx.lineTo(px + radius, py);
    ctx.lineTo(px, py + radius);
    ctx.lineTo(px - radius, py);
    ctx.closePath();
  }

  function drawAnchors(preview) {
    for (const anchor of state.anchors) {
      const x = preview.expectedByAnchor.get(anchor.id);
      const { px, py } = toPoint(anchor.t, x);
      const ready = preview.readyAnchors.has(anchor.id);

      let fill = "#58d5ff";
      let stroke = "#8fdfff";
      if (anchor.status === "captured") {
        fill = "#88ffc8";
        stroke = "#d5ffe9";
      } else if (anchor.status === "missed") {
        fill = "#ff7080";
        stroke = "#ffd2d8";
      } else if (anchor.requiredView && anchor.requiredTilt !== null) {
        fill = ready ? "#f7b2ff" : "#c48ae0";
        stroke = "#f3d8ff";
      } else if (anchor.requiredTilt !== null) {
        fill = ready ? "#ffcb7d" : "#f0a84f";
        stroke = "#ffe2ba";
      } else if (anchor.requiredView) {
        fill = ready ? "#b7d5ff" : "#83b3e7";
        stroke = "#dfecff";
      }

      ctx.fillStyle = fill;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 2;
      if (anchor.kind === "relative") {
        drawDiamond(px, py, 8.2);
      } else {
        ctx.beginPath();
        ctx.arc(px, py, 7.2, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.stroke();

      if (anchor.status === "pending") {
        ctx.strokeStyle = "rgba(216, 244, 255, 0.82)";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(px, py, 12.2, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  function drawWorldline(preview) {
    ctx.save();
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    for (let t = 0; t < config.rows - 1; t += 1) {
      const current = toPoint(t, state.worldline[t]);
      const next = toPoint(t + 1, state.worldline[t + 1]);
      const locked = t <= state.lockedThrough;
      const speedBroken = preview.speedBreaks.has(t + 1);
      const accelBroken = preview.accelBreaks.has(t + 1);

      if (state.levelStatus === "won") {
        ctx.strokeStyle = "#72ffb2";
      } else if (speedBroken || accelBroken) {
        ctx.strokeStyle = "#ff7f7f";
      } else if (locked) {
        ctx.strokeStyle = "#7cb2de";
      } else {
        ctx.strokeStyle = "#ffd97c";
      }

      ctx.lineWidth = locked ? 4 : 5.2;
      ctx.beginPath();
      ctx.moveTo(current.px, current.py);
      ctx.lineTo(next.px, next.py);
      ctx.stroke();
    }

    for (let t = 0; t < config.rows; t += 1) {
      const point = toPoint(t, state.worldline[t]);
      const locked = rowIsLocked(t);
      const selected = t === state.cursorT;
      const speedBroken = preview.speedBreaks.has(t);
      const accelBroken = preview.accelBreaks.has(t);

      ctx.fillStyle = speedBroken || accelBroken ? "#ffb07f" : locked ? "#9cc9ec" : "#d8f4ff";
      ctx.beginPath();
      ctx.arc(point.px, point.py, selected ? 8 : locked ? 5 : 6, 0, Math.PI * 2);
      ctx.fill();

      if (selected) {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(point.px, point.py, 12.5, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawLabels() {
    ctx.save();
    ctx.fillStyle = "#d9edff";
    ctx.font = "13px system-ui, sans-serif";
    ctx.fillText("PAST / LOCKED", config.board.x + config.board.width + 14, config.board.y + 4);
    ctx.fillText("OPEN FUTURE", config.board.x + config.board.width + 24, config.board.y + config.board.height + 6);

    for (let t = 0; t < config.rows; t += 1) {
      const y = config.board.y + t * cellH + 4;
      ctx.fillStyle = t <= state.lockedThrough ? "rgba(112, 156, 197, 0.34)" : "rgba(152, 178, 208, 0.18)";
      ctx.fillRect(config.board.x - 44, y - 11, 36, 18);
      ctx.fillStyle = "#e5f2ff";
      ctx.fillText(`${t}`, config.board.x - 34, y + 2);
    }

    ctx.fillStyle = "#b5d3f3";
    ctx.fillText("time slices", config.board.x - 65, config.board.y - 14);
    ctx.fillText("space position", config.board.x + config.board.width - 58, config.board.y + config.board.height + 32);
    ctx.restore();
  }

  function drawLegend() {
    const x = config.board.x + config.board.width + 14;
    const y = config.board.y + 90;
    ctx.save();
    ctx.fillStyle = "#cae7ff";
    ctx.font = "13px system-ui, sans-serif";
    ctx.fillText("Legend", x, y - 20);

    ctx.fillStyle = "#58d5ff";
    ctx.beginPath();
    ctx.arc(x + 7, y + 2, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#d9ecff";
    ctx.fillText("Anchor", x + 20, y + 6);

    ctx.fillStyle = "#f0a84f";
    drawDiamond(x + 6, y + 26, 6);
    ctx.fill();
    ctx.fillStyle = "#d9ecff";
    ctx.fillText("Relativistic anchor", x + 20, y + 30);

    ctx.fillStyle = "#9f3241";
    ctx.fillRect(x, y + 43, 12, 12);
    ctx.fillStyle = "#d9ecff";
    ctx.fillText("Paradox hazard", x + 20, y + 53);

    ctx.strokeStyle = "#ffd97c";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, y + 74);
    ctx.lineTo(x + 14, y + 86);
    ctx.stroke();
    ctx.fillStyle = "#d9ecff";
    ctx.fillText("Worldline", x + 20, y + 85);
    ctx.restore();
  }

  function renderAnchorList(preview) {
    const sortedAnchors = state.anchors.slice().sort((a, b) => a.t - b.t);
    const html = sortedAnchors
      .map((anchor) => {
        const expectedX = preview.expectedByAnchor.get(anchor.id);
        const stateText = anchor.status === "captured" ? "captured" : anchor.status === "missed" ? "missed" : "pending";
        const chips = [];
        chips.push(`<span class="chip">x=${expectedX}</span>`);
        if (anchor.requiredView) {
          chips.push(`<span class="chip">${viewNames[anchor.requiredView]}</span>`);
        }
        if (anchor.requiredTilt !== null) {
          chips.push(`<span class="chip">tilt ${signed(anchor.requiredTilt)}</span>`);
        }
        if (anchor.kind === "relative") {
          chips.push(`<span class="chip">drift ${signed(anchor.drift)}</span>`);
        }

        const icon = anchor.status === "captured" ? "✓" : anchor.status === "missed" ? "✕" : "•";
        return `<li class="${stateText}">${icon} t=${anchor.t} ${chips.join("")}</li>`;
      })
      .join("");

    if (html !== state.anchorListCache) {
      state.anchorListCache = html;
      if (ui.anchorList) {
        ui.anchorList.innerHTML = html;
      }
    }
  }

  function updateStatus(preview) {
    const capturedCount = state.anchors.filter((anchor) => anchor.status === "captured").length;
    ui.levelValue.textContent = `${state.level}`;
    ui.scoreValue.textContent = `${state.totalScore}`;
    ui.chrononValue.textContent = `${state.chronons}/${state.maxChronons}`;
    ui.lockValue.textContent = `${Math.max(0, state.lockedThrough + 1)}/${config.rows}`;
    ui.targetsValue.textContent = `${capturedCount}/${state.anchors.length}`;
    ui.phaseValue.textContent = phaseNames[state.levelStatus];
    ui.viewValue.textContent = viewNames[state.viewMode];
    ui.tiltValue.textContent = signed(state.frameSkew);

    if (state.levelData) {
      ui.levelTitle.textContent = state.levelData.title;
      ui.levelLore.textContent = state.levelData.concept;
    }

    let message = state.statusOverride || "";
    if (!message) {
      const nextPending = state.anchors.find((anchor) => anchor.status === "pending");
      if (nextPending) {
        const expectedX = preview.expectedByAnchor.get(nextPending.id);
        const requirement = anchorRequirementSummary(nextPending);
        const slicesLeft = Math.max(0, nextPending.t - state.lockedThrough);
        const requirementText = requirement ? ` | ${requirement}` : "";
        message = `Next anchor at t=${nextPending.t}: x=${expectedX}${requirementText}. Lockline reaches it in ${slicesLeft} slice(s).`;
      } else if (state.levelStatus === "running") {
        message = "All anchors prepared. Survive until the lockline reaches the end.";
      }
      if (state.lastLockMessage) {
        message = `${message} ${state.lastLockMessage}`;
      }
    }
    ui.statusMessage.textContent = message;
    renderAnchorList(preview);
  }

  function drawFrame(preview) {
    drawBackground();
    drawSimultaneityLines();
    drawHazards(preview);
    drawAnchors(preview);
    drawWorldline(preview);
    drawLabels();
    drawLegend();
    updateStatus(preview);
  }

  function handleKeydown(event) {
    const key = event.key.toLowerCase();
    const shouldPrevent =
      key === "arrowup" || key === "arrowdown" || key === "arrowleft" || key === "arrowright" || key === "enter";
    if (shouldPrevent) {
      event.preventDefault();
    }

    if (key === "arrowup" || key === "w") {
      moveCursor(-1);
      state.statusOverride = "";
    } else if (key === "arrowdown" || key === "s") {
      moveCursor(1);
      state.statusOverride = "";
    } else if (key === "arrowleft" || key === "a") {
      movePoint(-1);
    } else if (key === "arrowright" || key === "d") {
      movePoint(1);
    } else if (key === "q") {
      state.frameSkew = clamp(state.frameSkew - 1, -config.maxFrameTilt, config.maxFrameTilt);
      state.statusOverride = "";
    } else if (key === "e") {
      state.frameSkew = clamp(state.frameSkew + 1, -config.maxFrameTilt, config.maxFrameTilt);
      state.statusOverride = "";
    } else if (key === "v") {
      toggleViewMode();
      state.statusOverride = "";
    } else if (key === "r") {
      resetCurrentLevel();
    } else if (key === "enter") {
      advanceAfterWin();
    }
  }

  let lastTimestamp = performance.now();

  function tick(timestamp) {
    const dt = Math.min(0.05, (timestamp - lastTimestamp) / 1000);
    lastTimestamp = timestamp;

    if (state.levelStatus === "running") {
      state.nowPhase = clamp(state.nowPhase + dt * state.nowSpeed, 0, config.rows);
      processLockline();
      checkForWin();
    }

    state.currentPreview = computePreview();
    drawFrame(state.currentPreview);
    window.requestAnimationFrame(tick);
  }

  function snapshotState() {
    const captured = state.anchors.filter((anchor) => anchor.status === "captured").length;
    return {
      level: state.level,
      levelTitle: state.levelData ? state.levelData.title : "",
      score: state.totalScore,
      chronons: state.chronons,
      maxChronons: state.maxChronons,
      lockline: state.lockedThrough,
      viewMode: state.viewMode,
      frameSkew: state.frameSkew,
      cursorT: state.cursorT,
      nowPhase: state.nowPhase,
      nowSpeed: state.nowSpeed,
      phase: state.levelStatus,
      capturedAnchors: captured,
      totalAnchors: state.anchors.length,
      worldline: state.worldline.slice(),
      solutionPath: state.solutionPath.slice(),
      anchors: state.anchors.map((anchor) => ({ ...anchor })),
      hazards: state.hazards.map((hazard) => ({ ...hazard })),
    };
  }

  function autoSolveCurrentLevel() {
    if (state.levelStatus !== "running") {
      return;
    }

    state.worldline = state.solutionPath.slice();
    const anchorsByRow = new Map();
    for (const anchor of state.anchors) {
      anchorsByRow.set(anchor.t, anchor);
    }

    for (let row = state.lockedThrough + 1; row < config.rows && state.levelStatus === "running"; row += 1) {
      const anchor = anchorsByRow.get(row);
      if (anchor) {
        if (anchor.requiredView) {
          state.viewMode = anchor.requiredView;
        } else {
          state.viewMode = "A";
        }
        if (anchor.requiredTilt !== null) {
          state.frameSkew = anchor.requiredTilt;
        } else {
          state.frameSkew = 0;
        }
        state.worldline[row] = anchorExpectedX(anchor);
      } else {
        state.viewMode = state.levelData.intendedView[row];
        state.frameSkew = state.levelData.intendedTilt[row];
      }
      state.nowPhase = Math.max(state.nowPhase, row + 1.01);
      processLockline();
      checkForWin();
    }
  }

  window.__eternalWeaveDebug = {
    getState: snapshotState,
    setNowSpeed(speed) {
      const parsed = Number(speed);
      if (Number.isFinite(parsed)) {
        state.nowSpeed = clamp(parsed, 0, 25);
      }
    },
    setView(mode) {
      if (mode === "A" || mode === "B") {
        state.viewMode = mode;
      }
    },
    setTilt(tilt) {
      const parsed = Number(tilt);
      if (Number.isFinite(parsed)) {
        state.frameSkew = clamp(Math.round(parsed), -config.maxFrameTilt, config.maxFrameTilt);
      }
    },
    setWorldline(path) {
      if (!Array.isArray(path) || path.length !== config.rows) {
        return;
      }
      state.worldline = path.map((x) => clamp(Math.round(x), 0, config.cols - 1));
    },
    loadLevel(levelNumber) {
      const parsed = Number(levelNumber);
      if (Number.isInteger(parsed) && parsed > 0) {
        loadLevel(parsed);
      }
    },
    lockEverything() {
      if (state.levelStatus !== "running") {
        return;
      }
      state.nowPhase = config.rows;
      processLockline();
      checkForWin();
    },
    autoSolveCurrentLevel,
  };

  window.addEventListener("keydown", handleKeydown);
  loadLevel(1);
  state.currentPreview = computePreview();
  window.requestAnimationFrame(tick);
})();
