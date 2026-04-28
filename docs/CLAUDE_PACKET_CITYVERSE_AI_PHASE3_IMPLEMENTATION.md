# Cityverse MVP, Claude Packet: AI Implementation Phase 3 (Runtime Integration + Guardrails + Operator Flows)

Date: 2026-04-28
Status: ready for delegation
Priority: high

## Goal

Move Cityverse AI from “packages exist” to a real runnable operator behavior in OpenClaw:
- tools are callable end-to-end,
- safety policy is explicit,
- conversation flow is operational,
- acceptance checks prove it works.

## Read first

- `docs/CITYVERSE_AI_MASTER_ROADMAP.md`
- `docs/CITYVERSE_AI_OPERATOR_API.md`
- `docs/CITYVERSE_AI_PORTABILITY_REQUIREMENTS.md`
- `docs/CLAUDE_PACKET_CITYVERSE_AI_OPENCLAW_TOOL_SURFACE.md`
- `docs/CLAUDE_PACKET_CITYVERSE_AI_PHASE2_5_ENERGY_MODELING.md`
- `openclaw-skill/cityverse/SKILL.md`
- `openclaw-skill/cityverse/README.md`
- `packages/cityverse-tool-surface/src/index.ts`
- `packages/cityverse-operator/src/index.ts`

## Scope

### 1) End-to-end tool runtime wiring
Ensure an OpenClaw agent can invoke Cityverse tools through the real runtime path (not just package imports/tests).

Deliver:
- one concrete runtime wiring path documented and verifiable,
- stable tool name mapping preserved,
- clear startup/config instructions.

### 2) Operator safety/guardrail layer
Implement policy-oriented wrapping for tool usage:
- safe read actions default allowed,
- safe live-control actions explicitly gated by current policy,
- dangerous/unimplemented actions rejected with structured reasons.

Deliver:
- explicit action policy table in docs,
- consistent structured error envelope for blocked actions,
- audit-friendly metadata in control responses.

### 3) Canonical conversation flow helpers
Implement flow helpers for operator behavior:
- inspect current state,
- explain key drivers,
- propose a branch,
- run scenario analysis,
- summarize findings + limitations.

Deliver:
- minimal helper module(s) or examples showing this sequence,
- deterministic analysis usage (no live mutation in hypothetical path),
- limitations/unsupported-claims always surfaced.

### 4) Service capability and degraded-mode handling
Make runtime behavior explicit when VC/IOT/DT availability differs.

Deliver:
- robust `cityverse.system.status` capability output,
- consistent behavior for VC-up / IOT-down / DT-missing modes,
- docs for expected degraded behavior.

### 5) Acceptance suite
Create a repo-local acceptance checklist script or tests proving AI operator readiness.

At minimum prove:
1. inspect weather/energy/city
2. run safe control (`set_time` or `set_speed`)
3. run analysis baseline/project/compare
4. surface limitations and unsupported claims
5. docs search works
6. degraded-mode output remains structured

## Acceptance criteria

Packet is complete when:
- end-to-end runtime invocation is demonstrated,
- guardrail policy exists and is enforced,
- operator flow exists and is repeatable,
- degraded modes are explicit,
- acceptance suite passes,
- docs are updated for another machine to reproduce.

## Non-goals

- DT full implementation
- major new simulation physics
- broadening live command surface beyond current policy
- custom UI/avatar embodiment work

## Verification requirements

Claude must run and report:
- build commands
- relevant tests (existing + new acceptance checks)
- one concise end-to-end run log showing inspect/control/analyze/docs-search

## Short conclusion

Phase 3 is where Cityverse AI becomes operationally real: callable, safe, explainable, and testable end-to-end.
