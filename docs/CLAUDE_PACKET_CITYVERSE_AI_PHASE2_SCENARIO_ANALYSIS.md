# Cityverse MVP, Claude Packet: AI Operator Phase 2 Scenario Analysis

Date: 2026-04-28
Status: ready for delegation
Priority: high

## Goal

Implement the first trustworthy scenario-analysis foundation for the Cityverse AI operator.

The result should let an OpenClaw-based agent answer questions such as:
- what happens if we worsen weather conditions,
- what changes if we increase simulation speed and then analyze a later horizon,
- which buildings are most affected if occupancy-related demand rises,
- how a hypothetical branch differs from the current baseline.

This packet must not rely on raw LLM guessing for causal claims.
The LLM may explain the results, but the branch comparison itself must come from deterministic code and explicit provenance.

---

## Mandatory framing

This is **not** a live-control feature.

Phase 2 must produce a **non-live analysis path** that:
- captures baseline state,
- represents hypothetical changes as structured commands,
- evaluates those changes outside the live operator state,
- returns structured diffs plus limitations.

If a question cannot be answered honestly from current simulation logic, the result must say so in machine-readable form.

---

## Portability requirement

Portability is a first-class requirement for this packet.

The Phase 2 implementation must be portable across future OpenClaw installs by living primarily in:
- `packages/cityverse-operator/`
- `openclaw-skill/cityverse/`
- repo-shipped docs

It must **not** depend on:
- Martin-specific absolute paths
- hidden local memory outside the repo
- hand-edited machine-specific scripts
- OpenClaw-only runtime behavior baked into the analysis core

See also:
- `docs/CITYVERSE_AI_PORTABILITY_REQUIREMENTS.md`

---

## Claude must read these first

- `docs/CITYVERSE_AI_ARCHITECTURE.md`
- `docs/CITYVERSE_AI_OPERATOR_API.md`
- `docs/CITYVERSE_AI_PORTABILITY_REQUIREMENTS.md`
- `docs/CLAUDE_TASK_CITYVERSE_AI_PHASE2_IMPLEMENTATION.md`
- `docs/API_COMMAND_SURFACE.md`
- `docs/CURRENT_IMPLEMENTATION_STATUS.md`
- `docs/DT_IMPLEMENTATION_PLAN.md`
- `docs/IOT_STORAGE_MODEL.md`
- `docs/DT_STATE_AND_GRAPH_MODEL.md`

Also inspect current Phase 1 code before changing architecture:
- `packages/cityverse-operator/src/index.ts`
- `packages/cityverse-operator/src/types.ts`
- `packages/cityverse-operator/src/vc.ts`
- `packages/cityverse-operator/src/iot.ts`
- `packages/cityverse-operator/src/dt.ts`
- `openclaw-skill/cityverse/SKILL.md`

---

## What already exists from Phase 1

Claude should assume the following is already present and should be extended rather than reinvented:

- a portable Cityverse skill draft under `openclaw-skill/cityverse/`
- a working operator package under `packages/cityverse-operator/`
- VC reads and narrow safe VC commands
- IOT reads
- DT stubs
- docs search
- in-memory audit logging

Phase 2 should preserve these boundaries.

---

## Architectural decision for Phase 2

Claude should implement the simplest honest design that works now:

### Preferred approach

Use a **local deterministic analysis engine** inside `@cityverse/operator` that:
- captures live baseline state through Phase 1 adapters,
- converts that state into an analysis snapshot,
- applies a structured branch command list to that snapshot,
- evaluates projected branch state without calling live mutation endpoints,
- returns a structured comparison result.

### Why this is preferred

Because the current system does not yet expose a full isolated branch runtime, the cleanest truthful Phase 2 is:
- baseline capture from live reads,
- branch projection in code,
- explicit limitations where today’s simulation model is too thin.

### Avoid for now

Do not implement Phase 2 by:
- mutating the live VC and then trying to undo it,
- shelling out to ad hoc one-off project scripts as the main engine,
- building a fake “AI prediction” layer with invented numbers,
- tightly coupling scenario analysis to OpenClaw runtime internals.

---

## Minimum deliverables

## 1. Add a Phase 2 analysis module in `@cityverse/operator`

Suggested shape:

- `packages/cityverse-operator/src/analysis/types.ts`
- `packages/cityverse-operator/src/analysis/baseline.ts`
- `packages/cityverse-operator/src/analysis/branch.ts`
- `packages/cityverse-operator/src/analysis/projector.ts`
- `packages/cityverse-operator/src/analysis/compare.ts`
- `packages/cityverse-operator/src/analysis/limits.ts`
- `packages/cityverse-operator/src/analysis/index.ts`

Adjust names if needed, but keep the separation explicit.

## 2. Extend the package public surface

Export the Phase 2 analysis API from:
- `packages/cityverse-operator/src/index.ts`

## 3. Add one real operator-facing entrypoint

Suggested:
- `scripts/cityverse-scenario-demo.mjs`

The demo should prove:
- baseline capture,
- branch parsing,
- branch evaluation,
- diff output,
- limitations reporting.

## 4. Update the portable skill

Update at minimum:
- `openclaw-skill/cityverse/SKILL.md`
- `openclaw-skill/cityverse/README.md`

The skill must describe:
- how `analyze` requests now work,
- what is still unsupported,
- the provenance and safety expectations,
- the portability/config assumptions.

## 5. Add tests

Add targeted tests for Phase 2 behavior.

At minimum verify:
- branch evaluation does not mutate live state
- structured commands are validated
- comparison output includes limitations/provenance
- default config/path assumptions remain portable

---

## Required domain model

Implement explicit types. Suggested names are fine if Claude has a better repo-consistent alternative.

### `BaselineSnapshot`
Should include at minimum:
- `snapshotId`
- `capturedAtUtc`
- `profile`
- `sources`
- `capabilities`
- `vc`
- `iot`
- `dt`
- `warnings`

### `ScenarioBranch`
Should include:
- `branchId`
- `name`
- `description?`
- `commands`
- `horizon`
- `assumptions`

### `ScenarioCommand`
Should include:
- `targetService`
- `commandName`
- `targetEntityId`
- `payload`
- `order`
- `intentSummary?`

### `ScenarioHorizon`
Should include:
- `durationMinutes`
- `sampleIntervalMinutes?`
- `evaluationMode`

Initial acceptable `evaluationMode` values:
- `instant`
- `projected`

### `ScenarioComparisonResult`
Should include:
- `baseline`
- `branch`
- `metricDeltas`
- `entityDeltas`
- `topFindings`
- `riskNotes`
- `limitations`
- `unsupportedClaims`
- `provenance`

### `ScenarioMetricDelta`
Should include:
- metric name
- baseline value
- branch value
- absolute delta
- relative delta if meaningful
- units if known

---

## Required command scope for first Phase 2 implementation

Claude must keep the first command set narrow and aligned to current reality.

The first supported hypothetical branch commands should map to currently meaningful Phase 1 / current simulation concepts:
- `set_time`
- `set_speed`
- `weather_nudge`

Optional only if clearly supportable without fantasy:
- a synthetic demand modifier inside the analysis layer only

If Claude introduces analysis-only commands, they must:
- be clearly marked as analysis-only,
- never call live mutation endpoints,
- be documented in the skill and packet output.

Do **not** pretend generator, district, or DT branch controls are real unless they truly are implemented.

---

## Required baseline coverage

Baseline capture should include, when available:

### VC
- clock state
- weather state
- energy state
- city state
- buildings state

### IOT
- weather state
- energy state
- demand state
- city state
- buildings state
- ops summary if useful

### DT
- mark as unavailable / stubbed if not implemented

The baseline model must degrade gracefully when some sources are unavailable.

---

## Required comparison output

The result must make it easy for an LLM or CLI to answer honestly.

Required sections:
- `baselineSummary`
- `branchSummary`
- `metricDeltas`
- `changedEntities`
- `topFindings`
- `limitations`
- `unsupportedClaims`
- `provenance`

Suggested first metrics:
- temperature
- cloud cover
- humidity
- wind speed
- solar output
- wind output
- total renewable output
- oil backup output if present
- current CO2 if present
- demand
- balance
- building demand changes where available

---

## Honest limitations behavior

Phase 2 must be candid about thin areas.

Examples of acceptable limitations:
- “DT scene impact unavailable because DT service is not implemented”
- “Generator dispatch changes unsupported in current analysis engine”
- “This result reflects current simplified energy and building models”
- “Relative demand projection is estimated from current model, not historical replay”

Unsupported claims must be returned as structured data, not only buried in prose.

---

## Portability tasks are mandatory in this packet

Claude must make Phase 2 portable in practice, not just in rhetoric.

That means:
- no absolute machine paths
- repo-relative docs/config discovery
- environment-based service URLs
- analysis core independent from OpenClaw-specific APIs
- skill text updated to describe install/move assumptions

If packaging assumptions become clearer, document them now rather than waiting for a mythical future adult in the room.

---

## Verification requirements

Before handing back the work, Claude should verify at minimum:

1. `pnpm build:operator` succeeds
2. new Phase 2 tests pass
3. the scenario demo runs and prints a reviewable comparison result
4. the analysis path does not issue live VC mutation commands during branch evaluation
5. the skill docs reflect the new `analyze` capability and its limits

If any of the above cannot be completed, Claude must say exactly why.

---

## Acceptance criteria

This packet is successful when all of the following are true:

- a baseline snapshot can be captured from current services or adapter state
- a hypothetical branch can be represented as structured commands
- the branch can be evaluated without mutating live operator state
- a structured comparison result is produced
- limitations and unsupported areas are explicit in machine-readable form
- the implementation is clearly extensible toward richer models later
- the skill is updated to describe Phase 2 analysis behavior
- the implementation preserves portability across OpenClaw installs
- the implementation does not claim predictive certainty beyond current simulation logic

---

## Out of scope

Do not implement in this packet:
- full RAG/retrieval
- final avatar embodiment
- live branch runtimes spun from production state
- generator fleet simulation that does not already exist
- DT scene reasoning that depends on an unimplemented DT service
- fake confidence theatre

---

## Handoff expectation

Claude should leave the repo in a reviewable state with:
- clear file boundaries
- a working demo
- focused tests
- updated skill docs
- no broad unrelated cleanup

## Short conclusion

Phase 2 should give Cityverse its first honest answer to “what happens if…?”
Not omniscience. Just disciplined counterfactual machinery with labeled edges.
