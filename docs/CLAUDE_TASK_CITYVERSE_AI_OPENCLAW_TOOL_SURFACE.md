# Cityverse MVP, Claude Task: OpenClaw Tool Surface Integration

Date: 2026-04-28
Status: ready for delegation

## Mission

Implement the real OpenClaw-facing tool surface for the Cityverse AI operator.

The core logic must remain in `@cityverse/operator`.
The OpenClaw-facing layer should be thin and explicit.

## Read first

1. `docs/CLAUDE_PACKET_CITYVERSE_AI_OPENCLAW_TOOL_SURFACE.md`
2. `docs/CITYVERSE_AI_OPERATOR_API.md`
3. `docs/CITYVERSE_AI_PORTABILITY_REQUIREMENTS.md`
4. `openclaw-skill/cityverse/SKILL.md`
5. `packages/cityverse-operator/src/index.ts`

## Required work

### A. Implement the wrapper layer
- add the real OpenClaw-facing wrapper/plugin/tool layer
- map stable tool names to operator package functions
- keep this layer thin

### B. Cover the core flows
- inspect
- control
- analyze
- docs search

### C. Normalize outputs
- keep outputs explicit and reviewable
- preserve audit-friendly command results

### D. Update docs
- update the skill docs to reflect the real tool surface
- add any install/usage notes needed for another OpenClaw instance

### E. Verify
- prove that the wrapper can actually call the operator package successfully

## Hard rules

- do not move business logic out of `@cityverse/operator`
- do not broaden live commands unnecessarily
- do not hardcode local machine paths
- do not turn demos into the primary product surface

## Short conclusion

Build the missing bridge between Cityverse’s operator package and OpenClaw’s actual tool surface.
