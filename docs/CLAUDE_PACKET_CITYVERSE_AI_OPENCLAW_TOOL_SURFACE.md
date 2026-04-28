# Cityverse MVP, Claude Packet: OpenClaw Tool Surface Integration

Date: 2026-04-28
Status: ready for delegation
Priority: high

## Goal

Turn the current Cityverse AI skill + operator package into a real OpenClaw-facing tool surface.

The objective is to let an OpenClaw-based agent use Cityverse through explicit tools rather than through demo scripts, implied wiring, or prompt-roleplay.

The result should make it possible for an agent to:
- inspect live Cityverse state,
- execute the approved narrow VC command set,
- run Phase 2 analysis,
- search Cityverse docs,
- return normalized, audit-friendly results.

---

## Why this packet exists

Right now Cityverse has:
- a portable skill draft,
- a working operator package,
- Phase 1 and Phase 2 demos,
- deterministic scenario analysis.

What it does **not** yet have is a clean OpenClaw-facing tool integration layer.

This packet closes that gap.

---

## Portability requirement

This packet must preserve the portability rules already established in:
- `docs/CITYVERSE_AI_PORTABILITY_REQUIREMENTS.md`

That means:
- the business logic must remain in `packages/cityverse-operator/`
- the skill must remain repo-portable
- the OpenClaw-facing layer should be thin, explicit, and config-driven
- no Martin-specific hardcoded paths

---

## Claude must read these first

- `docs/CITYVERSE_AI_OPERATOR_API.md`
- `docs/CITYVERSE_AI_PORTABILITY_REQUIREMENTS.md`
- `docs/CITYVERSE_AI_ARCHITECTURE.md`
- `docs/CLAUDE_TASK_CITYVERSE_AI_OPENCLAW_TOOL_SURFACE.md`
- `openclaw-skill/cityverse/SKILL.md`
- `openclaw-skill/cityverse/README.md`
- `packages/cityverse-operator/src/index.ts`
- `packages/cityverse-operator/src/analysis/index.ts`

---

## Scope

## 1. Define a concrete OpenClaw tool surface

Implement a thin integration layer that maps stable tool names onto `@cityverse/operator` exports.

At minimum, the tool surface should include:

### System
- `cityverse.system.status`

### VC reads
- `cityverse.vc.get_state`
- `cityverse.vc.get_clock`
- `cityverse.vc.get_weather`
- `cityverse.vc.get_energy`
- `cityverse.vc.get_city`
- `cityverse.vc.get_buildings`

### IOT reads
- `cityverse.iot.get_weather`
- `cityverse.iot.get_energy`
- `cityverse.iot.get_city`
- `cityverse.iot.get_buildings`
- `cityverse.iot.get_ops_summary`

### VC control
- `cityverse.vc.pause`
- `cityverse.vc.resume`
- `cityverse.vc.set_speed`
- `cityverse.vc.set_time`
- `cityverse.vc.weather_nudge`

### Analysis
- `cityverse.analysis.capture_baseline`
- `cityverse.analysis.project_branch`
- `cityverse.analysis.compare`

### Docs
- `cityverse.docs.search`

If a slightly different OpenClaw plugin shape is required by the current local extension/runtime conventions, Claude should adapt to that reality while preserving these external tool names.

## 2. Keep the integration layer thin

The tool surface should:
- validate inputs,
- call the operator package,
- normalize outputs,
- avoid re-implementing simulation logic in the OpenClaw wrapper.

Do not move Cityverse business logic out of `@cityverse/operator`.

## 3. Add capability discovery if practical

If easy and clean, add a small status/capability response that tells an agent which Cityverse capabilities are live:
- VC reachable
- IOT reachable
- DT reachable
- Phase 2 analysis available
- docs search available

This can be folded into `cityverse.system.status`.

## 4. Update skill docs

Update the skill docs so they describe the real tool surface rather than an aspirational one.

At minimum update:
- `openclaw-skill/cityverse/SKILL.md`
- `openclaw-skill/cityverse/README.md`

## 5. Add an integration verification path

Provide a real verification path that proves the OpenClaw-facing tool layer works.

This may be:
- a test suite,
- a local harness script,
- or a minimal repo-local integration example.

The important thing is to prove the skill is no longer just demos plus noble intentions.

---

## Acceptance criteria

This packet is successful when all of the following are true:
- Cityverse exposes a concrete OpenClaw-facing tool surface
- the tool surface maps to `@cityverse/operator` rather than duplicating logic
- the approved inspect/control/analyze flows are callable explicitly
- outputs are normalized and reviewable
- portability is preserved
- skill docs describe the actual tool names and behavior
- verification exists and passes

---

## Non-goals

Do not use this packet to:
- redesign Phase 2 analysis internals
- broaden the live command set beyond the Phase 1 safe surface
- build retrieval/Phase 3
- build DT integrations that do not yet exist
- entangle Cityverse logic tightly with OpenClaw internals

---

## Verification requirements

Claude should verify at minimum:
1. package build still succeeds
2. any new integration tests pass
3. the OpenClaw-facing tool wrapper can successfully call inspect/control/analyze paths
4. docs reflect the real tool names

## Short conclusion

This packet should turn Cityverse AI from “well-structured demos” into a real operator surface that OpenClaw agents can actually use.
