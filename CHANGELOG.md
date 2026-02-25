# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.4.0] - 2026-02-25

### Added

- Mouse drag camera orbit with full 360-degree yaw rotation and pitch control, enabling free inspection of the 3D spacetime representation from any angle.
- Camera zoom via mouse wheel for depth control while planning worldtube edits.
- Camera state debug hooks for automated browser testing and deterministic camera assertions.

### Changed

- Replaced fixed isometric projection with a camera-based 3D projection pipeline.
- Updated rendering order (slices, anchors, hazards, worldtube segments) to depth-sort correctly under arbitrary camera angles.
- Updated controls/UI/help text to explain orbit-camera interaction.
- Expanded browser playability tests to verify that mouse dragging changes camera orientation.

## [0.3.0] - 2026-02-25

### Added

- Full 3D spatial control model (`x`,`y`,`z`) across time slices, turning the player path into a true 4D worldtube puzzle.
- Isometric spacetime visualization with per-slice geometry and explicit temporal rail indicators for now/lockline state.
- Paradox ledger system with concept-driven contradiction checks:
  - causal precedence constraints,
  - bootstrap loop coherence constraints,
  - grandfather-style self-negation constraints.
- Optional paradox-switch anchors that can trigger contradiction states if combined with incompatible core identity anchors.

### Changed

- Replaced the earlier 2D lane mechanic with a substantially deeper 3D + time puzzle structure.
- Reworked controls to separate spatial axes (`A/D`, `W/S`, `Q/E`) from frame tilt (`J/L`) and view mode (`V`).
- Expanded progression/difficulty scaling with denser hazards, stronger frame dependence, and higher causal complexity.
- Updated browser playability automation to validate the new dimensional controls and paradox-enabled progression.

### Fixed

- Fixed anchor fairness by preserving pre-lock stabilizations: anchors now remain captured once conditions are met before lock.

## [0.2.0] - 2026-02-25

### Changed

- Reworked the core game loop so the moving now-line acts as a true **lockline** that freezes past slices and forces forward planning.
- Made A-series/B-series mode and frame tilt gameplay-relevant through mandatory anchor requirements on higher levels.
- Upgraded progression into a concept-driven sequence with substantially higher difficulty and denser constraint stacking.
- Expanded the status panel with chronons, lockline progress, phase state, level concept text, and per-anchor schedule.
- Refined visuals to communicate locked past slices, active/inactive hazards, relativistic anchors, and upcoming risk rows.

### Added

- New anchor system with absolute and relativistic anchors (drift + required tilt/view conditions).
- Hazard rule system with static, phase-dependent, tilt-dependent, and constraint-enforcing paradox cells.
- Chronon reserve penalties for paradox shocks and coherence breaks.
- Multiple handcrafted difficulty blueprints (with extension scaling beyond the base sequence).
- Expanded debug hooks for deterministic browser playability automation on advanced mechanics.

## [0.1.0] - 2026-02-25

### Added

- Initial release of **Eternal Weave**, a browser-playable game centered on eternalism and block-universe ideas.
- Canvas-based spacetime board where players edit an entire worldline across all time slices.
- A-series and B-series visualization toggle.
- Frame-tilt visualization inspired by relativity of simultaneity.
- Level generation with solvable target events, paradox hazards, and speed constraints inspired by proper acceleration limits.
- Score, status panel, controls reference, and progression system.
- Playability automation using Playwright to verify keyboard gameplay, level completion, and progression.
- Project documentation (`README.md`) with run and test instructions.

[unreleased]: https://github.com/151henry151/time/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/151henry151/time/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/151henry151/time/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/151henry151/time/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/151henry151/time/releases/tag/v0.1.0
