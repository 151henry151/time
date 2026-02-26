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
    paradoxList: document.getElementById("paradoxList"),
  };
  const mobileButtons = Array.from(document.querySelectorAll("[data-action]"));

  const config = {
    timeSlices: 12,
    space: {
      x: 5,
      y: 5,
      z: 4,
    },
    maxFrameTilt: 4,
    camera: {
      screenX: 350,
      screenY: 348,
      focalLength: 700,
      spaceScale: 56,
      levelScale: 58,
      timeVector: {
        x: 30,
        y: -46,
        z: 26,
      },
      distance: {
        min: 430,
        max: 980,
        initial: 640,
      },
    },
    timeRail: {
      x: 790,
      top: 78,
      bottom: 586,
    },
  };

  const LEVEL_BLUEPRINTS = [
    {
      title: "Block Hypercube",
      concept:
        "You edit a full 3D position (x,y,z) at every time slice. The lockline freezes slices, so plan a 4D worldtube early.",
      nowSpeed: 0.16,
      chronons: 10,
      coreAnchors: 5,
      optionalAnchors: 1,
      viewAnchors: 1,
      tiltAnchors: 1,
      relativeAnchors: 1,
      staticHazards: 10,
      phaseHazards: 2,
      shearHazards: 1,
      causeLinks: 1,
      maxStep: 2,
      accelCap: null,
      complexity: 1,
      seed: 1111,
    },
    {
      title: "Relativistic Corridor",
      concept:
        "Some anchors drift with observer frame tilt. A-series/B-series perspective now gates what can be stabilized in time.",
      nowSpeed: 0.18,
      chronons: 9,
      coreAnchors: 6,
      optionalAnchors: 1,
      viewAnchors: 2,
      tiltAnchors: 2,
      relativeAnchors: 2,
      staticHazards: 13,
      phaseHazards: 4,
      shearHazards: 2,
      causeLinks: 2,
      maxStep: 2,
      accelCap: null,
      complexity: 2,
      seed: 2221,
    },
    {
      title: "Causal Weave",
      concept:
        "Effects must have locked-in causes. The paradox ledger checks causal precedence while lockline pressure keeps rising.",
      nowSpeed: 0.2,
      chronons: 8,
      coreAnchors: 6,
      optionalAnchors: 2,
      viewAnchors: 2,
      tiltAnchors: 3,
      relativeAnchors: 2,
      staticHazards: 15,
      phaseHazards: 5,
      shearHazards: 3,
      causeLinks: 3,
      maxStep: 2,
      accelCap: 2,
      complexity: 3,
      seed: 3337,
    },
    {
      title: "Bootstrap Vault",
      concept:
        "Past and future anchors must co-support one another. Closed causal loops become mandatory to avoid contradiction.",
      nowSpeed: 0.22,
      chronons: 8,
      coreAnchors: 7,
      optionalAnchors: 2,
      viewAnchors: 3,
      tiltAnchors: 3,
      relativeAnchors: 3,
      staticHazards: 17,
      phaseHazards: 6,
      shearHazards: 4,
      causeLinks: 3,
      maxStep: 2,
      accelCap: 2,
      complexity: 4,
      seed: 4481,
    },
    {
      title: "Grandfather Labyrinth",
      concept:
        "Optional paradox switches can erase future consistency. Avoid self-negating paths while preserving required identity anchors.",
      nowSpeed: 0.24,
      chronons: 7,
      coreAnchors: 7,
      optionalAnchors: 2,
      viewAnchors: 3,
      tiltAnchors: 4,
      relativeAnchors: 3,
      staticHazards: 19,
      phaseHazards: 7,
      shearHazards: 5,
      causeLinks: 4,
      maxStep: 2,
      accelCap: 2,
      complexity: 5,
      seed: 5563,
    },
    {
      title: "Centered World Collapse",
      concept:
        "Truth now depends on world + observer + time. The same geometry can stabilize or collapse under different frame commitments.",
      nowSpeed: 0.27,
      chronons: 7,
      coreAnchors: 8,
      optionalAnchors: 3,
      viewAnchors: 4,
      tiltAnchors: 4,
      relativeAnchors: 4,
      staticHazards: 21,
      phaseHazards: 8,
      shearHazards: 6,
      causeLinks: 4,
      maxStep: 2,
      accelCap: 2,
      complexity: 6,
      seed: 6697,
    },
    {
      title: "Problem of Time",
      concept:
        "Temporal ontology fractures under stacked constraints. Maintain coherence across x/y/z while preserving non-contradictory causality.",
      nowSpeed: 0.3,
      chronons: 6,
      coreAnchors: 8,
      optionalAnchors: 3,
      viewAnchors: 4,
      tiltAnchors: 5,
      relativeAnchors: 4,
      staticHazards: 24,
      phaseHazards: 9,
      shearHazards: 7,
      causeLinks: 5,
      maxStep: 2,
      accelCap: 1,
      complexity: 7,
      seed: 7741,
    },
    {
      title: "Eternalist Singularity",
      concept:
        "Final synthesis: 3D spatial mastery + frame dependence + causal paradox control inside one locked block universe.",
      nowSpeed: 0.33,
      chronons: 6,
      coreAnchors: 9,
      optionalAnchors: 3,
      viewAnchors: 5,
      tiltAnchors: 5,
      relativeAnchors: 5,
      staticHazards: 27,
      phaseHazards: 10,
      shearHazards: 8,
      causeLinks: 5,
      maxStep: 2,
      accelCap: 1,
      complexity: 8,
      seed: 8821,
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
    worldtube: [],
    solutionTube: [],
    anchors: [],
    hazards: [],
    paradoxLinks: [],
    paradoxLedger: [],
    chronons: 0,
    maxChronons: 0,
    levelStatus: "running",
    statusOverride: "",
    lastLockMessage: "",
    currentPreview: null,
    anchorListCache: "",
    paradoxListCache: "",
    cameraYaw: -0.85,
    cameraPitch: 0.42,
    cameraDistance: config.camera.distance.initial,
    gameEndDialogShown: false,
    cameraPresetIndex: 0,
  };

  const HIGH_SCORES_KEY = "eternalWeaveHighScores";
  const HIGH_SCORES_MAX = 10;

  function getHighScores() {
    try {
      const raw = localStorage.getItem(HIGH_SCORES_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveHighScores(entries) {
    try {
      localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(entries));
    } catch {
      // Ignore storage errors
    }
  }

  function isHighScore(score) {
    const list = getHighScores();
    if (list.length < HIGH_SCORES_MAX) return true;
    const lowest = list[list.length - 1];
    return score > (lowest && lowest.score != null ? lowest.score : 0);
  }

  function addHighScore(name, score, level) {
    const list = getHighScores();
    const entry = { name: String(name).trim().slice(0, 24), score, level };
    const next = [...list, entry].sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, HIGH_SCORES_MAX);
    saveHighScores(next);
    return next;
  }

  function showGameEndDialog() {
    const level = state.level;
    const score = state.totalScore;
    const qualifiesForEntry = level >= 2 && isHighScore(score);
    if (qualifiesForEntry) {
      const name = prompt("New high score! Enter your name:");
      if (name != null && String(name).trim()) {
        addHighScore(name.trim(), score, level);
      }
    }

    const overlay = document.createElement("div");
    overlay.className = "high-score-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-label", "Game over – High scores");

    const box = document.createElement("div");
    box.className = "high-score-dialog";

    const title = document.createElement("h2");
    title.className = "high-score-dialog__title";
    title.textContent = "Phase collapsed";
    box.appendChild(title);

    const tableWrap = document.createElement("div");
    tableWrap.className = "high-score-dialog__table-wrap";
    const table = document.createElement("table");
    table.className = "high-score-table";
    table.setAttribute("aria-label", "High scores");
    let header = "<thead><tr><th>#</th><th>Name</th><th>Score</th><th>Level</th></tr></thead><tbody>";
    const list = getHighScores();
    if (list.length === 0) {
      header += "<tr><td colspan=\"4\" class=\"high-score-empty\">No high scores yet</td></tr>";
    } else {
      list.forEach((entry, i) => {
        header += `<tr><td>${i + 1}</td><td>${escapeHtml(entry.name || "—")}</td><td>${entry.score ?? 0}</td><td>${entry.level ?? 0}</td></tr>`;
      });
    }
    table.innerHTML = header + "</tbody>";
    tableWrap.appendChild(table);
    box.appendChild(tableWrap);

    const playAgain = document.createElement("button");
    playAgain.type = "button";
    playAgain.className = "high-score-dialog__play-again";
    playAgain.textContent = "Play again";
    playAgain.addEventListener("click", () => {
      overlay.remove();
      state.gameEndDialogShown = false;
      state.totalScore = 0;
      loadLevel(1);
    });
    box.appendChild(playAgain);

    overlay.appendChild(box);
    document.body.appendChild(overlay);
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  const pointerState = {
    dragging: false,
    pointerId: null,
    lastX: 0,
    lastY: 0,
  };

  const holdStateByPointer = new Map();
  const repeatableActions = new Set([
    "slicePrev",
    "sliceNext",
    "moveXNeg",
    "moveXPos",
    "moveYNeg",
    "moveYPos",
    "moveZNeg",
    "moveZPos",
    "tiltNeg",
    "tiltPos",
  ]);

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

  function clonePos(pos) {
    return { x: pos.x, y: pos.y, z: pos.z };
  }

  function equalPos(a, b) {
    return a.x === b.x && a.y === b.y && a.z === b.z;
  }

  function addPos(a, b) {
    return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
  }

  function subPos(a, b) {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  }

  function posKey(t, pos) {
    return `${t},${pos.x},${pos.y},${pos.z}`;
  }

  function inBounds(pos) {
    return (
      pos.x >= 0 &&
      pos.x < config.space.x &&
      pos.y >= 0 &&
      pos.y < config.space.y &&
      pos.z >= 0 &&
      pos.z < config.space.z
    );
  }

  function clampPos(pos) {
    return {
      x: clamp(Math.round(pos.x), 0, config.space.x - 1),
      y: clamp(Math.round(pos.y), 0, config.space.y - 1),
      z: clamp(Math.round(pos.z), 0, config.space.z - 1),
    };
  }

  function manhattan(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z);
  }

  function vecMagnitude(pos) {
    return Math.abs(pos.x) + Math.abs(pos.y) + Math.abs(pos.z);
  }

  function getBlueprint(levelNumber) {
    if (levelNumber <= LEVEL_BLUEPRINTS.length) {
      return { ...LEVEL_BLUEPRINTS[levelNumber - 1] };
    }
    const base = LEVEL_BLUEPRINTS[LEVEL_BLUEPRINTS.length - 1];
    const extra = levelNumber - LEVEL_BLUEPRINTS.length;
    const coreAnchors = Math.min(config.timeSlices - 2, base.coreAnchors + Math.floor(extra / 2));
    return {
      ...base,
      title: `Eternal Extension ${levelNumber}`,
      concept:
        "Post-canonical escalation: denser paradox webs, faster lockline, and stricter worldtube coherence in 4D.",
      nowSpeed: Math.min(0.45, base.nowSpeed + extra * 0.012),
      chronons: Math.max(4, base.chronons - Math.floor(extra / 3)),
      coreAnchors,
      optionalAnchors: Math.min(4, base.optionalAnchors + Math.floor(extra / 3)),
      staticHazards: base.staticHazards + extra * 2,
      phaseHazards: base.phaseHazards + extra,
      shearHazards: base.shearHazards + extra,
      viewAnchors: Math.min(coreAnchors - 1, base.viewAnchors + Math.floor(extra / 2)),
      tiltAnchors: Math.min(coreAnchors - 1, base.tiltAnchors + Math.floor(extra / 2)),
      relativeAnchors: Math.min(coreAnchors - 1, base.relativeAnchors + Math.floor(extra / 2)),
      causeLinks: Math.min(coreAnchors - 1, base.causeLinks + Math.floor(extra / 2)),
      accelCap: 1,
      complexity: base.complexity + extra,
      seed: base.seed + extra * 997,
    };
  }

  function pickAnchorTimes(rng, count) {
    const times = [];
    const start = 1;
    const end = config.timeSlices - 2;
    const span = end - start + 1;
    const stride = span / (count + 1);
    let last = 0;
    for (let i = 0; i < count; i += 1) {
      const base = Math.round(start + stride * (i + 1));
      const jitter = Math.floor(rng() * 3) - 1;
      let t = clamp(base + jitter, start, end);
      if (t <= last) {
        t = last + 1;
      }
      const maxAllowed = end - (count - i - 1);
      if (t > maxAllowed) {
        t = maxAllowed;
      }
      times.push(t);
      last = t;
    }
    return times;
  }

  function generateSolutionTube(rng, blueprint) {
    const tube = Array.from({ length: config.timeSlices }, () => ({ x: 0, y: 0, z: 0 }));
    tube[0] = {
      x: Math.floor(config.space.x / 2),
      y: Math.floor(config.space.y / 2),
      z: Math.floor(config.space.z / 2),
    };

    const stepTemplates = [
      { x: 0, y: 0, z: 0, weight: 0.72 },
      { x: 1, y: 0, z: 0, weight: 1 },
      { x: -1, y: 0, z: 0, weight: 1 },
      { x: 0, y: 1, z: 0, weight: 1 },
      { x: 0, y: -1, z: 0, weight: 1 },
      { x: 0, y: 0, z: 1, weight: 0.85 },
      { x: 0, y: 0, z: -1, weight: 0.85 },
    ];

    for (let t = 1; t < config.timeSlices; t += 1) {
      const prev = tube[t - 1];
      const prevVelocity = t > 1 ? subPos(tube[t - 1], tube[t - 2]) : { x: 0, y: 0, z: 0 };
      const options = [];

      for (const template of stepTemplates) {
        const step = { x: template.x, y: template.y, z: template.z };
        const next = addPos(prev, step);
        if (!inBounds(next)) {
          continue;
        }

        if (vecMagnitude(step) > blueprint.maxStep) {
          continue;
        }

        if (blueprint.accelCap !== null && t > 1) {
          const accel = vecMagnitude(subPos(step, prevVelocity));
          if (accel > blueprint.accelCap + 1) {
            continue;
          }
        }

        let weight = template.weight;
        if (equalPos(step, prevVelocity)) {
          weight += 0.38;
        }
        if (step.x === -prevVelocity.x && step.y === -prevVelocity.y && step.z === -prevVelocity.z) {
          weight += 0.1 + blueprint.complexity * 0.03;
        }
        options.push({ value: step, weight: Math.max(0.05, weight) });
      }

      const chosen = options.length > 0 ? weightedPick(options, rng) : { x: 0, y: 0, z: 0 };
      tube[t] = addPos(prev, chosen);
    }

    return tube;
  }

  function chooseTilt(rng, complexity) {
    const cap = Math.min(config.maxFrameTilt, 1 + Math.floor(complexity / 2));
    const values = [];
    for (let i = 1; i <= cap; i += 1) {
      values.push(i, -i);
    }
    return values[Math.floor(rng() * values.length)] || 0;
  }

  function createRelativeBase(target, requiredTilt, rng) {
    const drifts = shuffle(
      [
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: -1 },
        { x: 1, y: -1 },
        { x: -1, y: 1 },
      ],
      rng
    );

    for (const drift of drifts) {
      const base = {
        x: target.x - requiredTilt * drift.x,
        y: target.y - requiredTilt * drift.y,
        z: target.z,
      };
      if (inBounds(base)) {
        return { base, drift };
      }
    }
    return null;
  }

  function anchorExpectedForTilt(anchor, frameSkew) {
    const expected = clonePos(anchor.basePos);
    if (anchor.relativeDrift) {
      expected.x += frameSkew * anchor.relativeDrift.x;
      expected.y += frameSkew * anchor.relativeDrift.y;
    }
    return clampPos(expected);
  }

  function generateAnchors(levelNumber, rng, blueprint, solutionTube) {
    const coreCount = clamp(blueprint.coreAnchors, 3, config.timeSlices - 2);
    const coreTimes = pickAnchorTimes(rng, coreCount);
    const coreIndices = Array.from({ length: coreCount }, (_, index) => index);
    const viewIndexSet = new Set(shuffle(coreIndices, rng).slice(0, Math.min(blueprint.viewAnchors, coreCount)));
    const tiltIndexSet = new Set(shuffle(coreIndices, rng).slice(0, Math.min(blueprint.tiltAnchors, coreCount)));
    const relativeIndexSet = new Set(shuffle(Array.from(tiltIndexSet), rng).slice(0, Math.min(blueprint.relativeAnchors, tiltIndexSet.size)));

    const anchors = [];
    const occupied = new Set();

    for (let i = 0; i < coreCount; i += 1) {
      const t = coreTimes[i];
      const target = solutionTube[t];
      const requiredView = viewIndexSet.has(i) ? (i % 2 === 0 ? "A" : "B") : null;
      const requiredTilt = tiltIndexSet.has(i) ? chooseTilt(rng, blueprint.complexity) : null;
      const shouldBeRelative = requiredTilt !== null && relativeIndexSet.has(i);

      let basePos = clonePos(target);
      let relativeDrift = null;
      if (shouldBeRelative) {
        const relative = createRelativeBase(target, requiredTilt, rng);
        if (relative) {
          basePos = relative.base;
          relativeDrift = relative.drift;
        }
      }

      const anchor = {
        id: `L${levelNumber}-C${i + 1}`,
        title: `Core ${i + 1}`,
        class: "core",
        t,
        basePos,
        relativeDrift,
        requiredView,
        requiredTilt,
        status: "pending",
        captureContext: null,
      };
      anchors.push(anchor);
      const expectedAtIntended = anchorExpectedForTilt(anchor, requiredTilt || 0);
      occupied.add(posKey(t, expectedAtIntended));
    }

    const optionalTypes = [
      { key: "ancestor-switch", title: "Ancestor switch" },
      { key: "aether-lure", title: "Aether lure" },
      { key: "entropy-sink", title: "Entropy sink" },
    ];

    const optionalCount = blueprint.optionalAnchors;
    const candidateTimes = Array.from({ length: config.timeSlices - 2 }, (_, i) => i + 1);
    const randomizedTimes = shuffle(candidateTimes, rng);
    for (let i = 0; i < optionalCount; i += 1) {
      const t = randomizedTimes[i % randomizedTimes.length];
      const near = solutionTube[t];
      const offsets = shuffle(
        [
          { x: 1, y: 0, z: 0 },
          { x: -1, y: 0, z: 0 },
          { x: 0, y: 1, z: 0 },
          { x: 0, y: -1, z: 0 },
          { x: 0, y: 0, z: 1 },
          { x: 0, y: 0, z: -1 },
          { x: 1, y: 1, z: 0 },
          { x: -1, y: -1, z: 0 },
          { x: 1, y: 0, z: 1 },
          { x: -1, y: 0, z: -1 },
        ],
        rng
      );

      let basePos = null;
      for (const offset of offsets) {
        const trial = addPos(near, offset);
        if (!inBounds(trial)) {
          continue;
        }
        if (equalPos(trial, near)) {
          continue;
        }
        const key = posKey(t, trial);
        if (occupied.has(key)) {
          continue;
        }
        basePos = trial;
        occupied.add(key);
        break;
      }

      if (!basePos) {
        continue;
      }

      const typeMeta = optionalTypes[i % optionalTypes.length];
      anchors.push({
        id: `L${levelNumber}-O${i + 1}`,
        title: typeMeta.title,
        class: "optional",
        optionalType: typeMeta.key,
        t,
        basePos,
        relativeDrift: null,
        requiredView: null,
        requiredTilt: null,
        status: "pending",
        captureContext: null,
      });
    }

    return anchors;
  }

  function buildIntendedSettings(anchors) {
    const intendedView = Array.from({ length: config.timeSlices }, () => "A");
    const intendedTilt = Array.from({ length: config.timeSlices }, () => 0);
    for (const anchor of anchors) {
      if (anchor.class !== "core") {
        continue;
      }
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

  function generateHazards(rng, levelNumber, blueprint, anchors, solutionTube, intendedSettings) {
    const hazards = [];
    const occupied = new Set();
    const protectedCells = new Set(solutionTube.map((pos, t) => posKey(t, pos)));

    function addHazard(hazard) {
      const key = posKey(hazard.t, hazard.pos);
      if (occupied.has(key)) {
        return false;
      }
      occupied.add(key);
      hazards.push(hazard);
      return true;
    }

    function randomPos(t) {
      return {
        x: Math.floor(rng() * config.space.x),
        y: Math.floor(rng() * config.space.y),
        z: Math.floor(rng() * config.space.z),
      };
    }

    function placeRandom(count, createRule, options = {}) {
      let placed = 0;
      let attempts = 0;
      const maxAttempts = count * 150;

      while (placed < count && attempts < maxAttempts) {
        attempts += 1;
        const t = Math.floor(rng() * config.timeSlices);
        const pos = randomPos(t);
        const key = posKey(t, pos);
        const isProtected = protectedCells.has(key);

        if (options.avoidProtected && isProtected) {
          continue;
        }

        const rule = createRule(t, pos);
        if (!rule) {
          continue;
        }

        if (options.avoidIntendedActive && isProtected) {
          const context = {
            viewMode: intendedSettings.intendedView[t],
            frameSkew: intendedSettings.intendedTilt[t],
          };
          if (ruleIsActive(rule, context)) {
            continue;
          }
        }

        const hazard = {
          id: `L${levelNumber}-HZ-${hazards.length + 1}`,
          t,
          pos,
          damage: options.damage || 1,
          style: options.style || "static",
          rule,
        };
        if (addHazard(hazard)) {
          placed += 1;
        }
      }
    }

    placeRandom(
      blueprint.staticHazards,
      () => ({ type: "always" }),
      {
        avoidProtected: true,
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
        avoidIntendedActive: true,
        style: "phase",
        damage: 1,
      }
    );

    placeRandom(
      blueprint.shearHazards,
      (t) => {
        const safe = intendedSettings.intendedTilt[t];
        return {
          type: "tiltOutside",
          min: clamp(safe - 1, -config.maxFrameTilt, config.maxFrameTilt),
          max: clamp(safe + 1, -config.maxFrameTilt, config.maxFrameTilt),
        };
      },
      {
        avoidIntendedActive: true,
        style: "shear",
        damage: 1,
      }
    );

    for (const anchor of anchors) {
      if (anchor.class !== "core") {
        continue;
      }
      const badRules = [];
      if (anchor.requiredView) {
        badRules.push({ type: "viewNot", view: anchor.requiredView });
      }
      if (anchor.requiredTilt !== null) {
        badRules.push({ type: "tiltNot", tilt: anchor.requiredTilt });
      }
      if (badRules.length === 0) {
        continue;
      }

      const enforcedPos = anchorExpectedForTilt(anchor, anchor.requiredTilt || 0);
      const rule = badRules.length === 1 ? badRules[0] : { type: "any", rules: badRules };
      addHazard({
        id: `L${levelNumber}-ENF-${anchor.id}`,
        t: anchor.t,
        pos: enforcedPos,
        damage: 2,
        style: "enforcer",
        rule,
      });
    }

    return hazards;
  }

  function generateParadoxLinks(levelNumber, blueprint, anchors) {
    const core = anchors.filter((anchor) => anchor.class === "core").sort((a, b) => a.t - b.t);
    const optional = anchors.filter((anchor) => anchor.class === "optional").sort((a, b) => a.t - b.t);
    const links = [];
    const usedCausePairs = new Set();

    const causeLinks = clamp(blueprint.causeLinks, 1, Math.max(1, core.length - 1));
    for (let i = 0; i < causeLinks; i += 1) {
      const idx = clamp(Math.floor(((i + 1) * (core.length - 2)) / (causeLinks + 1)), 0, core.length - 2);
      const cause = core[idx];
      const effect = core[idx + 1];
      const pairKey = `${cause.id}->${effect.id}`;
      if (usedCausePairs.has(pairKey)) {
        continue;
      }
      usedCausePairs.add(pairKey);
      links.push({
        id: `L${levelNumber}-P${links.length + 1}`,
        type: "cause-before",
        causeId: cause.id,
        effectId: effect.id,
        label: `${cause.title} must causally precede ${effect.title}`,
      });
    }

    if (core.length >= 4) {
      links.push({
        id: `L${levelNumber}-P${links.length + 1}`,
        type: "bootstrap",
        pastId: core[1].id,
        futureId: core[core.length - 2].id,
        label: `Bootstrap loop: ${core[1].title} and ${core[core.length - 2].title} must co-stabilize`,
      });
    }

    if (optional.length > 0) {
      links.push({
        id: `L${levelNumber}-P${links.length + 1}`,
        type: "grandfather",
        switchId: optional[0].id,
        selfId: core[core.length - 1].id,
        label: `${optional[0].title} cannot coexist with ${core[core.length - 1].title}`,
      });
    }

    return links;
  }

  function createLevelData(levelNumber) {
    const blueprint = getBlueprint(levelNumber);
    const rng = mulberry32(blueprint.seed + levelNumber * 1337);
    const solutionTube = generateSolutionTube(rng, blueprint);
    const anchors = generateAnchors(levelNumber, rng, blueprint, solutionTube);
    const intendedSettings = buildIntendedSettings(anchors);
    const hazards = generateHazards(rng, levelNumber, blueprint, anchors, solutionTube, intendedSettings);
    const paradoxLinks = generateParadoxLinks(levelNumber, blueprint, anchors);

    return {
      ...blueprint,
      solutionTube,
      anchors,
      hazards,
      paradoxLinks,
      intendedView: intendedSettings.intendedView,
      intendedTilt: intendedSettings.intendedTilt,
    };
  }

  function loadLevel(levelNumber) {
    state.level = levelNumber;
    state.levelData = createLevelData(levelNumber);
    state.solutionTube = state.levelData.solutionTube.map(clonePos);
    state.worldtube = Array.from({ length: config.timeSlices }, () => ({
      x: Math.floor(config.space.x / 2),
      y: Math.floor(config.space.y / 2),
      z: Math.floor(config.space.z / 2),
    }));
    state.anchors = state.levelData.anchors.map((anchor) => ({
      ...anchor,
      basePos: clonePos(anchor.basePos),
      relativeDrift: anchor.relativeDrift ? { ...anchor.relativeDrift } : null,
      status: "pending",
      captureContext: null,
    }));
    state.hazards = state.levelData.hazards.map((hazard) => ({
      ...hazard,
      pos: clonePos(hazard.pos),
    }));
    state.paradoxLinks = state.levelData.paradoxLinks.map((link) => ({ ...link }));
    state.paradoxLedger = [];
    state.viewMode = "A";
    state.frameSkew = 0;
    state.cursorT = 0;
    state.nowPhase = 0;
    state.nowSpeed = state.levelData.nowSpeed;
    state.lockedThrough = -1;
    state.chronons = state.levelData.chronons;
    state.maxChronons = state.levelData.chronons;
    state.levelStatus = "running";
    state.statusOverride = "";
    state.lastLockMessage = "";
    state.anchorListCache = "";
    state.paradoxListCache = "";
    state.currentPreview = computePreview();
    const paradoxState = evaluateParadoxState();
    state.paradoxLedger = paradoxState.ledger;
  }

  function editableStartRow() {
    return clamp(state.lockedThrough + 1, 0, config.timeSlices - 1);
  }

  function rowIsLocked(row) {
    return row <= state.lockedThrough;
  }

  function anchorExpectedPos(anchor, frameSkew = state.frameSkew) {
    return anchorExpectedForTilt(anchor, frameSkew);
  }

  function anchorRequirementSummary(anchor) {
    const fragments = [];
    if (anchor.requiredView) {
      fragments.push(viewNames[anchor.requiredView]);
    }
    if (anchor.requiredTilt !== null) {
      fragments.push(`tilt ${signed(anchor.requiredTilt)}`);
    }
    if (anchor.relativeDrift) {
      fragments.push(`drift (${signed(anchor.relativeDrift.x)},${signed(anchor.relativeDrift.y)})`);
    }
    return fragments.join(" / ");
  }

  function anchorSatisfied(anchor, expectedPos = anchorExpectedPos(anchor)) {
    const positionOk = equalPos(state.worldtube[anchor.t], expectedPos);
    const viewOk = !anchor.requiredView || state.viewMode === anchor.requiredView;
    const tiltOk = anchor.requiredTilt === null || state.frameSkew === anchor.requiredTilt;
    return positionOk && viewOk && tiltOk;
  }

  function ruleLabel(rule) {
    if (rule.type === "always") {
      return "always";
    }
    if (rule.type === "viewIs") {
      return `${viewNames[rule.view]} only`;
    }
    if (rule.type === "viewNot") {
      return `not ${viewNames[rule.view]}`;
    }
    if (rule.type === "tiltNot") {
      return `tilt != ${signed(rule.tilt)}`;
    }
    if (rule.type === "tiltOutside") {
      return `tilt outside [${signed(rule.min)},${signed(rule.max)}]`;
    }
    return "conditional";
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

  function activeHazardsAt(t, pos, viewMode = state.viewMode, frameSkew = state.frameSkew) {
    return state.hazards.filter(
      (hazard) => hazard.t === t && equalPos(hazard.pos, pos) && hazardIsActive(hazard, viewMode, frameSkew)
    );
  }

  function anchorById(id) {
    return state.anchors.find((anchor) => anchor.id === id);
  }

  function evaluateParadoxState() {
    const ledger = [];
    let failure = null;

    for (const link of state.paradoxLinks) {
      if (link.type === "cause-before") {
        const cause = anchorById(link.causeId);
        const effect = anchorById(link.effectId);
        if (!cause || !effect) {
          continue;
        }

        let status = "ok";
        let text = link.label;

        if (effect.status === "captured" && cause.status !== "captured") {
          if (effect.t <= state.lockedThrough) {
            status = "failed";
            text = `${link.label} failed: effect locked before cause.`;
          } else {
            status = "warning";
            text = `${link.label}: effect stabilized before cause; cause must lock in before t=${effect.t}.`;
          }
        } else if (effect.t <= state.lockedThrough && effect.status !== "captured") {
          status = "failed";
          text = `${link.label} failed: effect never stabilized.`;
        } else if (cause.t <= state.lockedThrough && cause.status !== "captured") {
          status = "failed";
          text = `${link.label} failed: cause never stabilized before lock.`;
        } else if (cause.status !== "captured" || effect.status !== "captured") {
          status = "warning";
          text = `${link.label}: unresolved.`;
        } else {
          text = `${link.label}: coherent.`;
        }

        if (status === "failed" && !failure) {
          failure = text;
        }
        ledger.push({ id: link.id, status, text });
      } else if (link.type === "bootstrap") {
        const past = anchorById(link.pastId);
        const future = anchorById(link.futureId);
        if (!past || !future) {
          continue;
        }
        const pastCaptured = past.status === "captured";
        const futureCaptured = future.status === "captured";
        const pastClosed = past.t <= state.lockedThrough && !pastCaptured;
        const futureClosed = future.t <= state.lockedThrough && !futureCaptured;

        let status = "ok";
        let text = link.label;

        if ((pastCaptured && futureClosed) || (futureCaptured && pastClosed)) {
          status = "failed";
          text = `${link.label} failed: one side of the loop collapsed.`;
        } else if (pastCaptured !== futureCaptured) {
          status = "warning";
          text = `${link.label}: one side captured, the other still open.`;
        } else if (!pastCaptured && !futureCaptured) {
          status = "warning";
          text = `${link.label}: unresolved loop.`;
        } else {
          text = `${link.label}: closed loop coherent.`;
        }

        if (status === "failed" && !failure) {
          failure = text;
        }
        ledger.push({ id: link.id, status, text });
      } else if (link.type === "grandfather") {
        const sw = anchorById(link.switchId);
        const selfAnchor = anchorById(link.selfId);
        if (!sw || !selfAnchor) {
          continue;
        }

        let status = "ok";
        let text = link.label;

        if (sw.status === "captured" && selfAnchor.status === "captured") {
          status = "failed";
          text = `${link.label} failed: self-negation paradox triggered.`;
        } else if (sw.status === "captured") {
          status = "warning";
          text = `${link.label}: paradox switch active; avoid stabilizing the linked self-anchor.`;
        } else {
          text = `${link.label}: safe.`;
        }

        if (status === "failed" && !failure) {
          failure = text;
        }
        ledger.push({ id: link.id, status, text });
      }
    }

    return { ledger, failure };
  }

  function computePreview() {
    const speedBreaks = new Set();
    const accelBreaks = new Set();
    const hazardRows = new Set();
    const readyAnchors = new Set();
    const expectedByAnchor = new Map();

    for (const anchor of state.anchors) {
      const expected = anchorExpectedPos(anchor);
      expectedByAnchor.set(anchor.id, expected);
      if (anchor.status === "captured" || anchorSatisfied(anchor, expected)) {
        readyAnchors.add(anchor.id);
      }
    }

    for (let t = 0; t < config.timeSlices; t += 1) {
      const pos = state.worldtube[t];
      if (activeHazardsAt(t, pos).length > 0) {
        hazardRows.add(t);
      }

      if (t > 0) {
        const step = manhattan(state.worldtube[t], state.worldtube[t - 1]);
        if (step > state.levelData.maxStep) {
          speedBreaks.add(t);
        }
      }

      if (state.levelData.accelCap !== null && t > 1) {
        const v1 = subPos(state.worldtube[t], state.worldtube[t - 1]);
        const v0 = subPos(state.worldtube[t - 1], state.worldtube[t - 2]);
        const accel = vecMagnitude(subPos(v1, v0));
        if (accel > state.levelData.accelCap) {
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
    state.statusOverride = `${message} Press Backspace to rewind this level.`;
  }

  function anchorReward(anchor) {
    if (anchor.class === "optional") {
      return 14;
    }
    return 52 + (anchor.requiredView ? 8 : 0) + (anchor.requiredTilt !== null ? 10 : 0);
  }

  function markAnchorCaptured(anchor, expectedPos, reason) {
    if (anchor.status !== "pending") {
      return;
    }
    anchor.status = "captured";
    anchor.captureContext = {
      timeIndex: anchor.t,
      position: clonePos(expectedPos),
      viewMode: state.viewMode,
      frameSkew: state.frameSkew,
      reason,
    };
    state.totalScore += anchorReward(anchor);
    if (reason === "prelock") {
      state.lastLockMessage = `Stabilized ${anchor.title} early at (${expectedPos.x},${expectedPos.y},${expectedPos.z}).`;
    }
  }

  function captureSatisfiedPendingAnchors() {
    if (state.levelStatus !== "running") {
      return;
    }
    for (const anchor of state.anchors) {
      if (anchor.status !== "pending" || anchor.t <= state.lockedThrough) {
        continue;
      }
      const expected = anchorExpectedPos(anchor);
      if (anchorSatisfied(anchor, expected)) {
        markAnchorCaptured(anchor, expected, "prelock");
      }
    }
  }

  function finalizeRow(row) {
    if (state.levelStatus !== "running") {
      return;
    }

    const notes = [];
    let damage = 0;
    const pos = state.worldtube[row];

    for (const anchor of state.anchors) {
      if (anchor.t !== row) {
        continue;
      }

      if (anchor.status === "captured") {
        notes.push(`${anchor.title} held`);
        continue;
      }
      if (anchor.status === "missed") {
        failLevel(`Anchor failure persisted at t=${row}.`);
        return;
      }
      if (anchor.status === "skipped") {
        continue;
      }

      const expected = anchorExpectedPos(anchor);
      if (anchorSatisfied(anchor, expected)) {
        markAnchorCaptured(anchor, expected, "lock");
        notes.push(`${anchor.title} captured`);
      } else if (anchor.class === "core") {
        anchor.status = "missed";
        const req = anchorRequirementSummary(anchor);
        const reqText = req ? ` with ${req}` : "";
        failLevel(
          `Missed ${anchor.title} at t=${row}. Required (${expected.x},${expected.y},${expected.z})${reqText}.`
        );
        return;
      } else {
        anchor.status = "skipped";
        notes.push(`${anchor.title} skipped`);
      }
    }

    const hits = activeHazardsAt(row, pos);
    if (hits.length > 0) {
      const shock = hits.reduce((sum, hazard) => sum + hazard.damage, 0);
      damage += shock;
      notes.push(`paradox shock -${shock}`);
    }

    if (row > 0) {
      const step = manhattan(state.worldtube[row], state.worldtube[row - 1]);
      if (step > state.levelData.maxStep) {
        damage += 1;
        notes.push("speed-of-causality break -1");
      }
    }

    if (state.levelData.accelCap !== null && row > 1) {
      const v1 = subPos(state.worldtube[row], state.worldtube[row - 1]);
      const v0 = subPos(state.worldtube[row - 1], state.worldtube[row - 2]);
      const accel = vecMagnitude(subPos(v1, v0));
      if (accel > state.levelData.accelCap) {
        damage += 1;
        notes.push("proper-acceleration break -1");
      }
    }

    if (damage > 0) {
      state.chronons = Math.max(0, state.chronons - damage);
    } else {
      state.totalScore += 8;
      notes.push("clean lock +8");
    }

    if (state.chronons <= 0) {
      failLevel(`Chronon reserve depleted at t=${row}.`);
      return;
    }

    const paradox = evaluateParadoxState();
    state.paradoxLedger = paradox.ledger;
    if (paradox.failure) {
      failLevel(paradox.failure);
      return;
    }

    state.lastLockMessage = `Slice ${row} locked: ${notes.join(", ")}.`;
  }

  function processLockline() {
    const targetLock = clamp(Math.floor(state.nowPhase) - 1, -1, config.timeSlices - 1);
    while (state.lockedThrough < targetLock && state.levelStatus === "running") {
      state.lockedThrough += 1;
      finalizeRow(state.lockedThrough);
    }

    const minCursor = editableStartRow();
    if (state.cursorT < minCursor) {
      state.cursorT = minCursor;
    }
  }

  function allCoreCaptured() {
    const core = state.anchors.filter((anchor) => anchor.class === "core");
    return core.every((anchor) => anchor.status === "captured");
  }

  function checkForWin() {
    if (state.levelStatus !== "running") {
      return;
    }
    if (state.lockedThrough < config.timeSlices - 1) {
      return;
    }

    const paradox = evaluateParadoxState();
    state.paradoxLedger = paradox.ledger;
    if (paradox.failure) {
      failLevel(paradox.failure);
      return;
    }

    if (!allCoreCaptured()) {
      failLevel("Timeline reached full lock with unresolved core anchors.");
      return;
    }

    state.levelStatus = "won";
    const bonus = state.chronons * 40 + state.level * 20;
    state.totalScore += bonus;
    state.statusOverride = `Timeline stabilized. Press Enter for level ${state.level + 1} (+${bonus} bonus).`;
  }

  function moveCursor(delta) {
    const minRow = editableStartRow();
    state.cursorT = clamp(state.cursorT + delta, minRow, config.timeSlices - 1);
  }

  function moveAxis(axis, delta) {
    if (state.levelStatus !== "running") {
      return;
    }
    if (rowIsLocked(state.cursorT)) {
      state.statusOverride = "That slice is locked by the observation frontier.";
      return;
    }
    const next = clonePos(state.worldtube[state.cursorT]);
    next[axis] = clamp(next[axis] + delta, 0, config.space[axis] - 1);
    state.worldtube[state.cursorT] = next;
  }

  function toggleViewMode() {
    state.viewMode = state.viewMode === "A" ? "B" : "A";
  }

  function resetCurrentLevel() {
    loadLevel(state.level);
  }

  function advanceAfterPhaseEnd() {
    if (state.levelStatus === "won") {
      loadLevel(state.level + 1);
    } else if (state.levelStatus === "failed") {
      resetCurrentLevel();
    }
  }

  function toScenePoint(pos, t) {
    const cx = (config.space.x - 1) / 2;
    const cy = (config.space.y - 1) / 2;
    const cz = (config.space.z - 1) / 2;
    const ct = (config.timeSlices - 1) / 2;
    const timeDelta = t - ct;

    return {
      x: (pos.x - cx) * config.camera.spaceScale + timeDelta * config.camera.timeVector.x,
      y: (pos.y - cy) * config.camera.spaceScale + timeDelta * config.camera.timeVector.y,
      z: (pos.z - cz) * config.camera.levelScale + timeDelta * config.camera.timeVector.z,
    };
  }

  function project(pos, t) {
    const scene = toScenePoint(pos, t);
    const yaw = state.cameraYaw;
    const pitch = state.cameraPitch;
    const cosYaw = Math.cos(yaw);
    const sinYaw = Math.sin(yaw);
    const cosPitch = Math.cos(pitch);
    const sinPitch = Math.sin(pitch);

    // Orbit camera by rotating world around scene origin.
    const xYaw = scene.x * cosYaw - scene.y * sinYaw;
    const yYaw = scene.x * sinYaw + scene.y * cosYaw;
    const zYaw = scene.z;

    const yPitch = yYaw * cosPitch - zYaw * sinPitch;
    const zPitch = yYaw * sinPitch + zYaw * cosPitch;

    const rawDepth = yPitch + state.cameraDistance;
    const depth = Math.max(45, rawDepth);
    const scale = config.camera.focalLength / depth;

    return {
      x: config.camera.screenX + xYaw * scale,
      y: config.camera.screenY - zPitch * scale,
      depth,
      rawDepth,
      visible: rawDepth > 5,
    };
  }

  function sliceDepthForSort(t) {
    const center = project(
      {
        x: (config.space.x - 1) / 2,
        y: (config.space.y - 1) / 2,
        z: (config.space.z - 1) / 2,
      },
      t
    );
    return center.depth;
  }

  function drawTriangle(x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size, y + size);
    ctx.lineTo(x - size, y + size);
    ctx.closePath();
  }

  function drawDiamond(x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size, y);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x - size, y);
    ctx.closePath();
  }

  function drawBackground() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#071523";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    for (let i = 0; i < 120; i += 1) {
      const x = (i * 71) % canvas.width;
      const y = (i * 53) % canvas.height;
      const alpha = 0.06 + ((i * 17) % 30) / 250;
      ctx.fillStyle = `rgba(185, 220, 255, ${alpha.toFixed(3)})`;
      ctx.fillRect(x, y, 1.2, 1.2);
    }
    ctx.restore();
  }

  function drawSliceFrame(t) {
    const maxX = config.space.x - 1;
    const maxY = config.space.y - 1;
    const maxZ = config.space.z - 1;
    const p00 = project({ x: 0, y: 0, z: 0 }, t);
    const p10 = project({ x: maxX, y: 0, z: 0 }, t);
    const p11 = project({ x: maxX, y: maxY, z: 0 }, t);
    const p01 = project({ x: 0, y: maxY, z: 0 }, t);
    const pTop = project({ x: 0, y: 0, z: maxZ }, t);

    ctx.save();
    const locked = t <= state.lockedThrough;
    const selected = t === state.cursorT;
    const nearNow = Math.abs(t - state.nowPhase) < 0.6;

    if (locked) {
      ctx.fillStyle = "rgba(92, 125, 157, 0.22)";
    } else if (state.viewMode === "A" && nearNow) {
      ctx.fillStyle = "rgba(246, 222, 138, 0.2)";
    } else if (state.viewMode === "A" && t < state.nowPhase) {
      ctx.fillStyle = "rgba(114, 170, 235, 0.11)";
    } else if (state.viewMode === "A") {
      ctx.fillStyle = "rgba(182, 143, 239, 0.09)";
    } else {
      ctx.fillStyle = "rgba(123, 162, 198, 0.1)";
    }

    if (p00.visible || p10.visible || p11.visible || p01.visible) {
      ctx.beginPath();
      ctx.moveTo(p00.x, p00.y);
      ctx.lineTo(p10.x, p10.y);
      ctx.lineTo(p11.x, p11.y);
      ctx.lineTo(p01.x, p01.y);
      ctx.closePath();
      ctx.fill();
    }

    ctx.strokeStyle = selected ? "rgba(255, 255, 255, 0.86)" : "rgba(127, 167, 205, 0.42)";
    ctx.lineWidth = selected ? 1.7 : 1;
    ctx.stroke();

    for (let x = 1; x < config.space.x - 1; x += 1) {
      const a = project({ x, y: 0, z: 0 }, t);
      const b = project({ x, y: maxY, z: 0 }, t);
      ctx.strokeStyle = "rgba(119, 159, 196, 0.24)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    for (let y = 1; y < config.space.y - 1; y += 1) {
      const a = project({ x: 0, y, z: 0 }, t);
      const b = project({ x: maxX, y, z: 0 }, t);
      ctx.strokeStyle = "rgba(119, 159, 196, 0.24)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    ctx.strokeStyle = "rgba(183, 214, 242, 0.6)";
    ctx.lineWidth = 1.2;
    if (p00.visible || pTop.visible) {
      ctx.beginPath();
      ctx.moveTo(p00.x, p00.y);
      ctx.lineTo(pTop.x, pTop.y);
      ctx.stroke();
    }

    ctx.fillStyle = "rgba(216, 233, 255, 0.88)";
    ctx.font = "11px system-ui, sans-serif";
    ctx.fillText(`t=${t}`, p00.x - 15, p00.y + 12);
    ctx.restore();
  }

  function drawSlices() {
    const order = Array.from({ length: config.timeSlices }, (_, t) => ({
      t,
      depth: sliceDepthForSort(t),
    })).sort((a, b) => b.depth - a.depth);
    for (const item of order) {
      drawSliceFrame(item.t);
    }
  }

  function drawHazards(preview) {
    const orderedHazards = state.hazards
      .map((hazard) => ({
        hazard,
        projected: project(hazard.pos, hazard.t),
      }))
      .sort((a, b) => b.projected.depth - a.projected.depth);

    for (const entry of orderedHazards) {
      const hazard = entry.hazard;
      if (!hazardVisible(hazard)) {
        continue;
      }
      const p = entry.projected;
      const active = hazardIsActive(hazard);
      const onTube = equalPos(state.worldtube[hazard.t], hazard.pos);
      const hot = active && onTube;
      const locked = hazard.t <= state.lockedThrough;

      ctx.save();
      if (!active) {
        ctx.globalAlpha = 0.35;
      } else if (locked) {
        ctx.globalAlpha = 0.65;
      }

      if (hazard.style === "enforcer") {
        ctx.fillStyle = hot ? "#ff4f70" : active ? "#d96a9a" : "#7f5a72";
      } else if (hazard.style === "phase") {
        ctx.fillStyle = hot ? "#ff6e7b" : active ? "#be6f86" : "#715c72";
      } else if (hazard.style === "shear") {
        ctx.fillStyle = hot ? "#ff9850" : active ? "#c18e64" : "#705d53";
      } else {
        ctx.fillStyle = hot ? "#ff4f70" : active ? "#9a3f52" : "#6f5662";
      }

      ctx.fillRect(p.x - 7, p.y - 7, 14, 14);
      ctx.strokeStyle = hot ? "#ffe3ea" : "rgba(247, 202, 215, 0.84)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(p.x - 6, p.y - 6);
      ctx.lineTo(p.x + 6, p.y + 6);
      ctx.moveTo(p.x + 6, p.y - 6);
      ctx.lineTo(p.x - 6, p.y + 6);
      ctx.stroke();
      ctx.restore();
    }

    if (preview.hazardRows.size > 0 && state.levelStatus === "running") {
      for (const row of preview.hazardRows) {
        if (row <= state.lockedThrough) {
          continue;
        }
        const p = project(state.worldtube[row], row);
        ctx.strokeStyle = "rgba(255, 143, 164, 0.28)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 18, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  function drawAnchors(preview) {
    const ordered = state.anchors
      .map((anchor) => {
        const expected = preview.expectedByAnchor.get(anchor.id);
        return {
          anchor,
          expected,
          projected: project(expected, anchor.t),
        };
      })
      .sort((a, b) => b.projected.depth - a.projected.depth);

    for (const item of ordered) {
      const anchor = item.anchor;
      const expected = item.expected;
      const p = item.projected;
      const ready = preview.readyAnchors.has(anchor.id);

      let fill = "#55d6ff";
      let stroke = "#cff4ff";
      if (anchor.status === "captured") {
        fill = "#8dffc7";
        stroke = "#d9ffe9";
      } else if (anchor.status === "missed") {
        fill = "#ff7386";
        stroke = "#ffd9df";
      } else if (anchor.status === "skipped") {
        fill = "#887783";
        stroke = "#c5b4c2";
      } else if (anchor.class === "optional") {
        fill = ready ? "#ffbf86" : "#d49263";
        stroke = "#ffe2c9";
      } else if (anchor.requiredView && anchor.requiredTilt !== null) {
        fill = ready ? "#f4a8ff" : "#c08ad7";
        stroke = "#f4d9ff";
      } else if (anchor.requiredTilt !== null) {
        fill = ready ? "#ffc884" : "#dd9f5f";
        stroke = "#ffe6be";
      } else if (anchor.requiredView) {
        fill = ready ? "#bdd9ff" : "#87afe0";
        stroke = "#e3efff";
      }

      ctx.save();
      ctx.fillStyle = fill;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1.9;
      if (anchor.class === "optional") {
        drawTriangle(p.x, p.y, 7.8);
      } else if (anchor.relativeDrift) {
        drawDiamond(p.x, p.y, 8.2);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 7.2, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.stroke();

      if (anchor.status === "pending") {
        ctx.strokeStyle = "rgba(238, 248, 255, 0.8)";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 11.8, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  function drawWorldtube(preview) {
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const segmentOrder = [];
    for (let t = 0; t < config.timeSlices - 1; t += 1) {
      const a = project(state.worldtube[t], t);
      const b = project(state.worldtube[t + 1], t + 1);
      segmentOrder.push({ t, a, b, depth: (a.depth + b.depth) / 2 });
    }
    segmentOrder.sort((left, right) => right.depth - left.depth);

    for (const segment of segmentOrder) {
      const t = segment.t;
      const a = segment.a;
      const b = segment.b;
      const locked = t <= state.lockedThrough;
      const speedBroken = preview.speedBreaks.has(t + 1);
      const accelBroken = preview.accelBreaks.has(t + 1);

      if (state.levelStatus === "won") {
        ctx.strokeStyle = "#73ffb6";
      } else if (speedBroken || accelBroken) {
        ctx.strokeStyle = "#ff8f7f";
      } else if (locked) {
        ctx.strokeStyle = "#7fb3df";
      } else {
        ctx.strokeStyle = "#ffd97d";
      }

      ctx.lineWidth = locked ? 3.6 : 4.8;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    const pointOrder = Array.from({ length: config.timeSlices }, (_, t) => ({
      t,
      p: project(state.worldtube[t], t),
    })).sort((left, right) => right.p.depth - left.p.depth);

    for (const pointEntry of pointOrder) {
      const t = pointEntry.t;
      const p = pointEntry.p;
      const selected = t === state.cursorT;
      const locked = t <= state.lockedThrough;
      const speedBroken = preview.speedBreaks.has(t);
      const accelBroken = preview.accelBreaks.has(t);

      ctx.fillStyle = speedBroken || accelBroken ? "#ffb57f" : locked ? "#9ec9eb" : "#dff4ff";
      ctx.beginPath();
      ctx.arc(p.x, p.y, selected ? 7.6 : locked ? 4.8 : 5.8, 0, Math.PI * 2);
      ctx.fill();

      if (selected) {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 11.4, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawTimeRail() {
    const { x, top, bottom } = config.timeRail;
    const span = bottom - top;

    ctx.save();
    ctx.strokeStyle = "rgba(137, 180, 219, 0.55)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
    ctx.stroke();

    for (let t = 0; t < config.timeSlices; t += 1) {
      const y = top + (t / (config.timeSlices - 1)) * span;
      const locked = t <= state.lockedThrough;
      ctx.strokeStyle = locked ? "rgba(132, 171, 209, 0.76)" : "rgba(151, 186, 219, 0.35)";
      ctx.lineWidth = locked ? 2 : 1.2;
      ctx.beginPath();
      ctx.moveTo(x - 6, y);
      ctx.lineTo(x + 6, y);
      ctx.stroke();

      ctx.fillStyle = "rgba(216, 235, 255, 0.9)";
      ctx.font = "11px system-ui, sans-serif";
      ctx.fillText(`${t}`, x + 10, y + 4);
    }

    const lockProgress = clamp((state.lockedThrough + 1) / config.timeSlices, 0, 1);
    const nowProgress = clamp(state.nowPhase / config.timeSlices, 0, 1);
    const lockY = top + lockProgress * span;
    const nowY = top + nowProgress * span;

    ctx.strokeStyle = "rgba(255, 157, 104, 0.95)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 11, lockY);
    ctx.lineTo(x + 11, lockY);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 233, 126, 0.95)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 11, nowY);
    ctx.lineTo(x + 11, nowY);
    ctx.stroke();

    ctx.fillStyle = "rgba(236, 243, 255, 0.95)";
    ctx.font = "12px system-ui, sans-serif";
    ctx.fillText("NOW", x - 22, nowY - 8);
    ctx.fillText("LOCK", x - 28, lockY + 16);
    ctx.restore();
  }

  function drawLegend(preview) {
    const x = 610;
    const y = 70;
    ctx.save();
    ctx.fillStyle = "rgba(214, 232, 252, 0.92)";
    ctx.font = "12px system-ui, sans-serif";
    ctx.fillText("4D legend", x, y);

    ctx.fillStyle = "#58d5ff";
    ctx.beginPath();
    ctx.arc(x + 7, y + 16, 5.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#dceeff";
    ctx.fillText("Core anchor", x + 18, y + 20);

    ctx.fillStyle = "#f1a264";
    drawTriangle(x + 7, y + 35, 5.5);
    ctx.fill();
    ctx.fillStyle = "#dceeff";
    ctx.fillText("Paradox switch (optional)", x + 18, y + 39);

    ctx.fillStyle = "#9d3f52";
    ctx.fillRect(x + 1, y + 47, 11, 11);
    ctx.fillStyle = "#dceeff";
    ctx.fillText("Hazard", x + 18, y + 56);

    ctx.strokeStyle = "#ffd87a";
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(x + 1, y + 72);
    ctx.lineTo(x + 14, y + 82);
    ctx.stroke();
    ctx.fillStyle = "#dceeff";
    ctx.fillText("Worldtube", x + 18, y + 82);
    ctx.fillStyle = "#bcd8f4";
    ctx.fillText("Drag canvas: orbit camera", x, y + 96);

    if (preview.speedBreaks.size > 0 || preview.accelBreaks.size > 0) {
      ctx.fillStyle = "#ffbf8a";
      ctx.fillText("Coherence warning active", x, y + 114);
    }
    ctx.restore();
  }

  function drawCoordinateHint() {
    const p = state.worldtube[state.cursorT];
    const x = 22;
    const y = 555;

    ctx.save();
    ctx.fillStyle = "rgba(13, 34, 57, 0.82)";
    ctx.strokeStyle = "rgba(78, 118, 159, 0.75)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(x, y, 255, 70, 9);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#d9edff";
    ctx.font = "12px system-ui, sans-serif";
    ctx.fillText(`selected slice t=${state.cursorT}`, x + 10, y + 20);
    ctx.fillText(`x=${p.x}  y=${p.y}  z=${p.z}`, x + 10, y + 38);
    ctx.fillText(`controls: F/R slice, W/S y, A/D x, Q/E z, Z/X tilt, Space view, Shift camera, drag+wheel orbit`, x + 10, y + 56);
    ctx.restore();
  }

  function renderAnchorList(preview) {
    const ordered = state.anchors.slice().sort((a, b) => a.t - b.t);
    const html = ordered
      .map((anchor) => {
        const expected = preview.expectedByAnchor.get(anchor.id);
        const stateClass = anchor.status || "pending";
        const marker =
          anchor.status === "captured"
            ? "✓"
            : anchor.status === "missed"
              ? "✕"
              : anchor.status === "skipped"
                ? "·"
                : "•";
        const chips = [];
        chips.push(`<span class="chip">${anchor.class}</span>`);
        chips.push(`<span class="chip">x=${expected.x}</span>`);
        chips.push(`<span class="chip">y=${expected.y}</span>`);
        chips.push(`<span class="chip">z=${expected.z}</span>`);
        if (anchor.requiredView) {
          chips.push(`<span class="chip">${viewNames[anchor.requiredView]}</span>`);
        }
        if (anchor.requiredTilt !== null) {
          chips.push(`<span class="chip">tilt ${signed(anchor.requiredTilt)}</span>`);
        }
        if (anchor.relativeDrift) {
          chips.push(`<span class="chip">drift ${signed(anchor.relativeDrift.x)},${signed(anchor.relativeDrift.y)}</span>`);
        }
        return `<li class="${stateClass}">${marker} t=${anchor.t} ${anchor.title} ${chips.join("")}</li>`;
      })
      .join("");

    if (html !== state.anchorListCache && ui.anchorList) {
      state.anchorListCache = html;
      ui.anchorList.innerHTML = html;
    }
  }

  function renderParadoxList() {
    const html = state.paradoxLedger
      .map((item) => `<li class="${item.status}">${item.text}</li>`)
      .join("");
    if (html !== state.paradoxListCache && ui.paradoxList) {
      state.paradoxListCache = html;
      ui.paradoxList.innerHTML = html;
    }
  }

  function updateStatus(preview) {
    const coreAnchors = state.anchors.filter((anchor) => anchor.class === "core");
    const capturedCore = coreAnchors.filter((anchor) => anchor.status === "captured").length;

    ui.levelValue.textContent = `${state.level}`;
    ui.scoreValue.textContent = `${state.totalScore}`;
    ui.chrononValue.textContent = `${state.chronons}/${state.maxChronons}`;
    ui.lockValue.textContent = `${Math.max(0, state.lockedThrough + 1)}/${config.timeSlices}`;
    ui.targetsValue.textContent = `${capturedCore}/${coreAnchors.length}`;
    ui.phaseValue.textContent = phaseNames[state.levelStatus];
    ui.viewValue.textContent = viewNames[state.viewMode];
    ui.tiltValue.textContent = signed(state.frameSkew);

    if (state.levelData) {
      ui.levelTitle.textContent = state.levelData.title;
      ui.levelLore.textContent = state.levelData.concept;
    }

    let message = state.statusOverride || "";
    if (!message) {
      const nextCore = coreAnchors
        .filter((anchor) => anchor.status === "pending")
        .sort((a, b) => a.t - b.t)[0];
      if (nextCore) {
        const expected = preview.expectedByAnchor.get(nextCore.id);
        const requirements = anchorRequirementSummary(nextCore);
        const slicesLeft = Math.max(0, nextCore.t - state.lockedThrough);
        const reqText = requirements ? ` | ${requirements}` : "";
        message = `Next core anchor t=${nextCore.t} at (${expected.x},${expected.y},${expected.z})${reqText}. Lock in ${slicesLeft} slice(s).`;
      } else {
        message = "All core anchors appear stable. Survive until final lock.";
      }
      const warning = state.paradoxLedger.find((entry) => entry.status === "warning");
      if (warning) {
        message = `${message} ${warning.text}`;
      }
      if (state.lastLockMessage) {
        message = `${message} ${state.lastLockMessage}`;
      }
    }
    ui.statusMessage.textContent = message;
    renderAnchorList(preview);
    renderParadoxList();
  }

  function drawFrame(preview) {
    drawBackground();
    drawSlices();
    drawHazards(preview);
    drawAnchors(preview);
    drawWorldtube(preview);
    drawTimeRail();
    drawLegend(preview);
    drawCoordinateHint();
    updateStatus(preview);
  }

  function performAction(action) {
    switch (action) {
      case "slicePrev":
        moveCursor(-1);
        state.statusOverride = "";
        return true;
      case "sliceNext":
        moveCursor(1);
        state.statusOverride = "";
        return true;
      case "moveXNeg":
        moveAxis("x", -1);
        state.statusOverride = "";
        return true;
      case "moveXPos":
        moveAxis("x", 1);
        state.statusOverride = "";
        return true;
      case "moveYNeg":
        moveAxis("y", -1);
        state.statusOverride = "";
        return true;
      case "moveYPos":
        moveAxis("y", 1);
        state.statusOverride = "";
        return true;
      case "moveZNeg":
        moveAxis("z", -1);
        state.statusOverride = "";
        return true;
      case "moveZPos":
        moveAxis("z", 1);
        state.statusOverride = "";
        return true;
      case "tiltNeg":
        state.frameSkew = clamp(state.frameSkew - 1, -config.maxFrameTilt, config.maxFrameTilt);
        state.statusOverride = "";
        return true;
      case "tiltPos":
        state.frameSkew = clamp(state.frameSkew + 1, -config.maxFrameTilt, config.maxFrameTilt);
        state.statusOverride = "";
        return true;
      case "toggleView":
        toggleViewMode();
        state.statusOverride = "";
        return true;
      case "reset":
        resetCurrentLevel();
        return true;
      case "advance":
        advanceAfterPhaseEnd();
        return true;
      case "cycleCameraPreset":
        cycleCameraPreset();
        return true;
      default:
        return false;
    }
  }

  function getKeyAction(event) {
    const key = event.key;
    const code = event.code;
    const keyNorm = key.length === 1 ? (key === " " ? " " : key.toLowerCase()) : key.toLowerCase();
    const codeNorm = code ? code.toLowerCase() : "";

    const byKey = {
      f: "slicePrev",
      r: "sliceNext",
      arrowup: "slicePrev",
      arrowdown: "sliceNext",
      a: "moveXNeg",
      d: "moveXPos",
      w: "moveYNeg",
      s: "moveYPos",
      q: "moveZNeg",
      e: "moveZPos",
      z: "tiltNeg",
      x: "tiltPos",
      " ": "toggleView",
      backspace: "reset",
      enter: "advance",
      shift: "cycleCameraPreset",
    };
    const byCode = {
      keyf: "slicePrev",
      keyr: "sliceNext",
      keya: "moveXNeg",
      keyd: "moveXPos",
      keyw: "moveYNeg",
      keys: "moveYPos",
      keyq: "moveZNeg",
      keye: "moveZPos",
      keyz: "tiltNeg",
      keyx: "tiltPos",
      space: "toggleView",
      backspace: "reset",
      enter: "advance",
      shiftleft: "cycleCameraPreset",
      shiftright: "cycleCameraPreset",
      arrowup: "slicePrev",
      arrowdown: "sliceNext",
    };

    return byKey[keyNorm] || byCode[codeNorm] || null;
  }

  function handleKeydown(event) {
    const action = getKeyAction(event);
    if (action) {
      event.preventDefault();
      event.stopPropagation();
      performAction(action);
    }
  }

  function stopMobileHold(pointerId) {
    const hold = holdStateByPointer.get(pointerId);
    if (!hold) {
      return;
    }
    clearTimeout(hold.timeoutId);
    if (hold.intervalId) {
      clearInterval(hold.intervalId);
    }
    hold.button.classList.remove("mobile-btn--active");
    holdStateByPointer.delete(pointerId);
  }

  function handleMobileButtonDown(event) {
    const button = event.currentTarget;
    const action = button.dataset.action;
    if (!action) {
      return;
    }

    event.preventDefault();
    performAction(action);

    if (button.setPointerCapture) {
      button.setPointerCapture(event.pointerId);
    }

    button.classList.add("mobile-btn--active");
    if (!repeatableActions.has(action)) {
      holdStateByPointer.set(event.pointerId, {
        button,
        timeoutId: null,
        intervalId: null,
      });
      return;
    }

    const holdData = {
      button,
      timeoutId: null,
      intervalId: null,
    };
    holdData.timeoutId = setTimeout(() => {
      const liveHold = holdStateByPointer.get(event.pointerId);
      if (!liveHold) {
        return;
      }
      liveHold.intervalId = setInterval(() => {
        performAction(action);
      }, 78);
    }, 220);

    holdStateByPointer.set(event.pointerId, holdData);
  }

  function handleMobileButtonUp(event) {
    stopMobileHold(event.pointerId);
  }

  function bindMobileControls() {
    for (const button of mobileButtons) {
      button.addEventListener("pointerdown", handleMobileButtonDown);
      button.addEventListener("pointerup", handleMobileButtonUp);
      button.addEventListener("pointercancel", handleMobileButtonUp);
      button.addEventListener("lostpointercapture", handleMobileButtonUp);
      // Keyboard/assistive fallback (detail===0) without duplicating pointer taps.
      button.addEventListener("click", (event) => {
        if (event.detail !== 0) {
          return;
        }
        event.preventDefault();
        const action = button.dataset.action;
        if (action) {
          performAction(action);
        }
      });
    }
  }

  function normalizeYaw(yaw) {
    let out = yaw;
    const full = Math.PI * 2;
    while (out > Math.PI) {
      out -= full;
    }
    while (out < -Math.PI) {
      out += full;
    }
    return out;
  }

  const CAMERA_PRESETS = [
    { name: "default", yaw: -0.85, pitch: 0.42 },
    { name: "front", yaw: 0, pitch: 0.2 },
    { name: "top", yaw: -0.85, pitch: -1.2 },
    { name: "side", yaw: -Math.PI / 2 + 0.1, pitch: 0.2 },
  ];

  function cycleCameraPreset() {
    state.cameraPresetIndex = (state.cameraPresetIndex + 1) % CAMERA_PRESETS.length;
    const preset = CAMERA_PRESETS[state.cameraPresetIndex];
    state.cameraYaw = normalizeYaw(preset.yaw);
    state.cameraPitch = clamp(preset.pitch, -1.32, 1.32);
  }

  function rotateCameraBy(deltaX, deltaY) {
    state.cameraYaw = normalizeYaw(state.cameraYaw + deltaX * 0.0105);
    state.cameraPitch = clamp(state.cameraPitch + deltaY * 0.0085, -1.32, 1.32);
  }

  function handlePointerDown(event) {
    if (event.button !== 0 && event.pointerType !== "touch") {
      return;
    }
    pointerState.dragging = true;
    pointerState.pointerId = event.pointerId;
    pointerState.lastX = event.clientX;
    pointerState.lastY = event.clientY;
    canvas.style.cursor = "grabbing";
    if (canvas.setPointerCapture) {
      canvas.setPointerCapture(event.pointerId);
    }
    event.preventDefault();
  }

  function handlePointerMove(event) {
    if (!pointerState.dragging || event.pointerId !== pointerState.pointerId) {
      return;
    }
    const dx = event.clientX - pointerState.lastX;
    const dy = event.clientY - pointerState.lastY;
    pointerState.lastX = event.clientX;
    pointerState.lastY = event.clientY;
    if (dx === 0 && dy === 0) {
      return;
    }
    rotateCameraBy(dx, dy);
    event.preventDefault();
  }

  function stopPointerDrag(event) {
    if (!pointerState.dragging || event.pointerId !== pointerState.pointerId) {
      return;
    }
    pointerState.dragging = false;
    pointerState.pointerId = null;
    canvas.style.cursor = "grab";
    if (canvas.releasePointerCapture) {
      try {
        canvas.releasePointerCapture(event.pointerId);
      } catch {
        // Ignore release errors on some browser edge-cases.
      }
    }
  }

  function handleWheel(event) {
    const zoomDelta = event.deltaY * 0.45;
    state.cameraDistance = clamp(
      state.cameraDistance + zoomDelta,
      config.camera.distance.min,
      config.camera.distance.max
    );
    event.preventDefault();
  }

  let lastTimestamp = performance.now();

  function tick(timestamp) {
    const dt = Math.min(0.05, (timestamp - lastTimestamp) / 1000);
    lastTimestamp = timestamp;

    if (state.levelStatus === "running") {
      captureSatisfiedPendingAnchors();
      const paradoxPre = evaluateParadoxState();
      state.paradoxLedger = paradoxPre.ledger;
      if (paradoxPre.failure) {
        failLevel(paradoxPre.failure);
      }

      if (state.levelStatus === "running") {
        state.nowPhase = clamp(state.nowPhase + dt * state.nowSpeed, 0, config.timeSlices);
        processLockline();
        const paradoxPost = evaluateParadoxState();
        state.paradoxLedger = paradoxPost.ledger;
        if (paradoxPost.failure) {
          failLevel(paradoxPost.failure);
        } else {
          checkForWin();
        }
      }
    } else {
      const paradox = evaluateParadoxState();
      state.paradoxLedger = paradox.ledger;
    }

    state.currentPreview = computePreview();
    drawFrame(state.currentPreview);

    if (state.levelStatus === "failed" && !state.gameEndDialogShown) {
      state.gameEndDialogShown = true;
      setTimeout(showGameEndDialog, 0);
    }

    window.requestAnimationFrame(tick);
  }

  function snapshotState() {
    const core = state.anchors.filter((anchor) => anchor.class === "core");
    const capturedCore = core.filter((anchor) => anchor.status === "captured").length;
    return {
      level: state.level,
      levelTitle: state.levelData ? state.levelData.title : "",
      phase: state.levelStatus,
      score: state.totalScore,
      chronons: state.chronons,
      maxChronons: state.maxChronons,
      lockline: state.lockedThrough,
      viewMode: state.viewMode,
      frameSkew: state.frameSkew,
      cameraYaw: state.cameraYaw,
      cameraPitch: state.cameraPitch,
      cameraDistance: state.cameraDistance,
      cursorT: state.cursorT,
      nowPhase: state.nowPhase,
      nowSpeed: state.nowSpeed,
      capturedCore,
      totalCore: core.length,
      worldtube: state.worldtube.map(clonePos),
      solutionTube: state.solutionTube.map(clonePos),
      anchors: state.anchors.map((anchor) => ({
        ...anchor,
        basePos: clonePos(anchor.basePos),
        relativeDrift: anchor.relativeDrift ? { ...anchor.relativeDrift } : null,
        captureContext: anchor.captureContext
          ? {
              ...anchor.captureContext,
              position: clonePos(anchor.captureContext.position),
            }
          : null,
      })),
      hazards: state.hazards.map((hazard) => ({
        ...hazard,
        pos: clonePos(hazard.pos),
        ruleLabel: ruleLabel(hazard.rule),
      })),
      paradoxLedger: state.paradoxLedger.map((item) => ({ ...item })),
    };
  }

  function autoSolveCurrentLevel() {
    if (state.levelStatus !== "running") {
      return;
    }

    state.worldtube = state.solutionTube.map(clonePos);
    const start = editableStartRow();
    for (let row = start; row < config.timeSlices && state.levelStatus === "running"; row += 1) {
      state.viewMode = state.levelData.intendedView[row];
      state.frameSkew = state.levelData.intendedTilt[row];
      captureSatisfiedPendingAnchors();
      state.nowPhase = Math.max(state.nowPhase, row + 1.02);
      processLockline();
      const paradox = evaluateParadoxState();
      state.paradoxLedger = paradox.ledger;
      if (paradox.failure) {
        failLevel(paradox.failure);
        break;
      }
      checkForWin();
    }

    if (state.levelStatus === "running") {
      state.nowPhase = config.timeSlices;
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
    setWorldtube(tube) {
      if (!Array.isArray(tube) || tube.length !== config.timeSlices) {
        return;
      }
      state.worldtube = tube.map((pos) =>
        clampPos({
          x: Number(pos.x),
          y: Number(pos.y),
          z: Number(pos.z),
        })
      );
    },
    setPoint(timeIndex, pos) {
      const t = Number(timeIndex);
      if (!Number.isInteger(t) || t < 0 || t >= config.timeSlices) {
        return;
      }
      state.worldtube[t] = clampPos(pos);
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
      state.nowPhase = config.timeSlices;
      processLockline();
      checkForWin();
    },
    setCamera(camera) {
      if (!camera || typeof camera !== "object") {
        return;
      }
      if (Number.isFinite(camera.yaw)) {
        state.cameraYaw = normalizeYaw(Number(camera.yaw));
      }
      if (Number.isFinite(camera.pitch)) {
        state.cameraPitch = clamp(Number(camera.pitch), -1.32, 1.32);
      }
      if (Number.isFinite(camera.distance)) {
        state.cameraDistance = clamp(
          Number(camera.distance),
          config.camera.distance.min,
          config.camera.distance.max
        );
      }
    },
    autoSolveCurrentLevel,
  };

  canvas.style.cursor = "grab";
  canvas.style.touchAction = "none";
  window.addEventListener("keydown", handleKeydown);
  bindMobileControls();
  canvas.addEventListener("pointerdown", handlePointerDown);
  canvas.addEventListener("pointermove", handlePointerMove);
  canvas.addEventListener("pointerup", stopPointerDrag);
  canvas.addEventListener("pointercancel", stopPointerDrag);
  canvas.addEventListener("wheel", handleWheel, { passive: false });
  loadLevel(1);
  window.requestAnimationFrame(tick);
})();
