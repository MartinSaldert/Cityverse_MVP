# Cityverse MVP, Claude Task: AI Implementation Phase 3

Date: 2026-04-28
Status: ready for delegation

## Mission

Implement Phase 3 so Cityverse AI is runnable end-to-end in OpenClaw with clear guardrails and a verified operator flow.

## Read first

1. `docs/CLAUDE_PACKET_CITYVERSE_AI_PHASE3_IMPLEMENTATION.md`
2. `docs/CITYVERSE_AI_MASTER_ROADMAP.md`
3. `docs/CITYVERSE_AI_PORTABILITY_REQUIREMENTS.md`
4. `openclaw-skill/cityverse/SKILL.md`
5. `packages/cityverse-tool-surface/src/index.ts`
6. `packages/cityverse-operator/src/index.ts`

## Required work

### A. End-to-end runtime wiring
- ensure tools are callable through a real OpenClaw runtime path
- document exact usage/startup path

### B. Guardrail policy
- define and enforce allowed/blocked action policy
- return structured blocked-action errors

### C. Operator flow sequence
- implement/provide canonical inspect → explain → propose branch → compare path
- always include limitations and unsupported claims in analysis reporting

### D. Degraded-mode behavior
- make service availability handling explicit and consistent

### E. Acceptance verification
- add a practical acceptance suite/checklist and run it

## Hard rules

- keep business logic in `@cityverse/operator`
- keep hypothetical analysis non-live and deterministic
- avoid machine-specific hardcoded paths
- no fake support claims for unimplemented DT/generator capabilities

## Deliverable format

Return:
1. changed files list
2. what was implemented by section (A–E)
3. verification commands run + results
4. known limitations remaining
