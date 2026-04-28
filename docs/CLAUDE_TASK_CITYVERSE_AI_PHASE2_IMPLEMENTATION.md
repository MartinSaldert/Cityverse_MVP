# Cityverse MVP, Claude Task: Phase 2 Portable Scenario Analysis

Date: 2026-04-28
Status: ready for delegation

## Mission

Implement Phase 2 of the Cityverse AI operator:

- portable scenario-analysis foundation
- deterministic baseline-vs-branch comparison
- explicit limitations and provenance
- updated portable skill docs

This task must keep portability as a first-class requirement.

## Read first

1. `docs/CLAUDE_PACKET_CITYVERSE_AI_PHASE2_SCENARIO_ANALYSIS.md`
2. `docs/CITYVERSE_AI_PORTABILITY_REQUIREMENTS.md`
3. `docs/CITYVERSE_AI_ARCHITECTURE.md`
4. `docs/CITYVERSE_AI_OPERATOR_API.md`

Then inspect existing Phase 1 code under:
- `packages/cityverse-operator/src/`
- `openclaw-skill/cityverse/`

## Required implementation checklist

### A. Analysis module
- add a Phase 2 analysis module under `packages/cityverse-operator/src/analysis/`
- keep type boundaries explicit
- do not entangle analysis logic with live command execution paths

### B. Baseline capture
- implement baseline capture from current VC/IOT adapters
- include DT as unavailable/stubbed where appropriate
- include warnings/capability flags

### C. Structured branch model
- implement structured branch commands and horizon types
- validate branch inputs
- keep supported command scope narrow and honest

### D. Non-live evaluation
- implement branch projection/evaluation without mutating live VC state
- do not call live mutation endpoints during branch evaluation

### E. Comparison result
- produce structured metric deltas
- produce changed entities where available
- include top findings, limitations, unsupported claims, and provenance

### F. Portable entrypoint
- add a demo script proving end-to-end Phase 2 behavior

### G. Skill updates
- update `openclaw-skill/cityverse/SKILL.md`
- update `openclaw-skill/cityverse/README.md`
- explain the new `analyze` path and limits

### H. Tests
- add focused Phase 2 tests
- include a guard against live-state mutation during analysis

## Hard rules

- do not broaden scope into retrieval or avatar work
- do not mutate live state for scenario analysis
- do not invent unsupported generator/DT capabilities
- do not hardcode machine-specific paths
- do not rewrite Phase 1 architecture without cause

## Required output quality

The result should be usable by:
- a CLI/demo script
- an OpenClaw skill
- another OpenClaw instance later

So the core logic belongs in the operator package, not only in prompt text.

## Verification checklist before stopping

- `pnpm build:operator`
- relevant new tests pass
- demo script runs
- skill docs updated
- no live mutation during branch evaluation

## Delivery note

Leave the repo in a reviewable state.
Prefer small clear files over clever tangles.

## Short conclusion

Build the first honest “what happens if” engine for Cityverse.
Not a prophet. A control-desk analyst with receipts.
