# Cityverse MVP, Claude Packet: AI Phase 2.5 Energy and Wind Modeling Tightening

Date: 2026-04-28
Status: ready for delegation
Priority: high

## Goal

Improve the weakest parts of the current Phase 2 scenario-analysis model so hypothetical answers become less misleading.

The immediate focus is the energy model, especially:
- wind-power projection,
- solar/wind interaction under weather changes,
- oil-backup and total-generation behavior,
- handling near-zero baselines honestly.

---

## Why this packet exists

Phase 2 is working, but the current analysis engine is thin in precisely the place users immediately notice:
- cloud increases reduce solar plausibly,
- wind increases may fail to improve modeled output enough,
- zero or near-zero baseline wind output creates weak branch answers,
- the model can understate how stronger wind should help.

This packet is meant to improve that without pretending the simulator is a full power-grid model.

---

## Portability requirement

All improvements must stay inside the portable operator package and skill/docs architecture:
- `packages/cityverse-operator/`
- `openclaw-skill/cityverse/`
- repo-shipped docs

Do not hardcode anything machine-specific.

---

## Claude must read these first

- `docs/CLAUDE_PACKET_CITYVERSE_AI_PHASE2_SCENARIO_ANALYSIS.md`
- `docs/CITYVERSE_AI_PORTABILITY_REQUIREMENTS.md`
- `docs/CLAUDE_TASK_CITYVERSE_AI_PHASE2_5_ENERGY_MODELING.md`
- `packages/cityverse-operator/src/analysis/projector.ts`
- `packages/cityverse-operator/src/analysis/compare.ts`
- `packages/cityverse-operator/src/analysis/limits.ts`
- current energy/weather docs relevant to VC behavior

---

## Scope

## 1. Improve wind projection behavior

The current model scales wind output linearly from baseline wind speed and baseline wind output. That is too weak, especially when baseline output is zero.

Claude should improve this using the cleanest honest approximation supported by current project reality.

Acceptable directions include:
- deriving wind output from wind speed using a simple piecewise/turbine-style approximation,
- using current VC energy semantics to infer a more realistic wind-output curve,
- introducing a small explicit projection helper for wind generation.

Requirements:
- no fake precision
- no hidden magic constants without comments
- clear limitations documented

## 2. Improve solar + weather projection clarity

The current solar projection is simple and acceptable as a first pass, but Claude should review whether it can be tightened modestly without destabilizing the code.

Any refinement should remain:
- deterministic
- explainable
- portable

## 3. Improve near-zero baseline handling

If baseline wind output is zero or near zero, the engine should not silently imply that stronger wind has no modeled value unless that is truly unavoidable.

Possible outcomes:
- produce a projected nonzero wind output from a speed-based curve,
- or return a sharper limitation/provenance note if not enough information exists.

The important thing is to be less misleading.

## 4. Improve result shaping for energy scenarios

Enhance result shaping so energy-related hypothetical outcomes are easier to trust.

Useful additions may include:
- clearer energy-specific findings
- clearer note when fossil backup is masking renewable loss
- explicit statement when demand is held constant
- clearer distinction between modeled generation change and unmodeled dispatch behavior

## 5. Update limitations and docs

If the model improves, update:
- `openclaw-skill/cityverse/SKILL.md`
- `openclaw-skill/cityverse/README.md`
- relevant Phase 2 limitation text

---

## Acceptance criteria

This packet is successful when all of the following are true:
- wind-related branch answers are less misleading than current Phase 2
- near-zero baseline wind cases are handled better
- the model remains deterministic and portable
- limitations remain explicit
- tests cover the new behavior
- scenario results are easier to interpret for energy questions

---

## Non-goals

Do not use this packet to:
- build a full generator fleet simulator
- add broad DT reasoning
- add retrieval
- mutate live VC state for analysis
- claim grid-model fidelity that the project does not yet have

---

## Verification requirements

Claude should verify at minimum:
1. operator build succeeds
2. analysis tests pass
3. at least one new test covers the previously weak “clouds plus stronger wind” case
4. the scenario demo still runs

## Short conclusion

This packet should make Cityverse’s hypothetical energy answers less embarrassing and more useful — still simplified, but no longer quite so easily caught in the act.
