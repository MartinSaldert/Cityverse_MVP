# Cityverse MVP, Claude Packet: AI Operator Phase 1

Date: 2026-04-27
Status: ready for delegation

## Goal

Implement the first working Cityverse AI operator foundation.

The result should make it possible for an OpenClaw-based agent to:
- understand the Cityverse architecture,
- discover service configuration,
- read live state from VC and IOT,
- issue a small safe set of VC commands,
- search project docs,
- produce audit-friendly command results.

This packet is deliberately limited to Phase 1. It should not attempt to solve avatar work, full DT runtime, or advanced predictive simulation.

## Reference docs

Claude should read and follow these documents first:
- `docs/CITYVERSE_AI_ARCHITECTURE.md`
- `docs/CITYVERSE_AI_OPERATOR_API.md`
- `docs/API_COMMAND_SURFACE.md`
- `docs/CURRENT_IMPLEMENTATION_STATUS.md`
- `docs/DT_IMPLEMENTATION_PLAN.md`

## Scope

## 1. Create a portable Cityverse OpenClaw skill draft

Create a repository-local skill directory for Cityverse operator behavior.

Minimum deliverables:
- `SKILL.md`
- install/config notes
- capability summary
- source priority rules
- safety rules
- environment/config contract

The skill must be written so it can later travel with the software and be adapted into a ClawHub-installable package.

## 2. Create a Cityverse tool adapter layer

Implement a small adapter layer that wraps current HTTP APIs.

Suggested module responsibilities:
- configuration loading
- service URL discovery
- HTTP request helpers
- response normalization
- command envelope normalization
- error mapping

Keep this small and explicit.

## 3. Implement read tools first

The first supported read flows should include:
- overall service status
- VC clock state
- VC weather state
- IOT weather state
- IOT energy state
- IOT demand state
- IOT city state
- IOT buildings state if available
- docs search over Cityverse `docs/`

## 4. Implement a narrow command set

The first supported command flows should include only:
- pause simulation
- resume simulation
- set simulation speed
- set simulation time/date
- weather nudge or weather preset if available

Do not broaden scope into every future command surface yet.

## 5. Add audit-friendly command logging

Every AI-issued command path should produce a normalized result record containing at minimum:
- action
- timestamp
- target service
- payload summary
- success/failure
- raw response summary

If a persistent audit store is too much for this packet, start with in-memory plus structured logs and document the limitation.

## 6. Add a simple operator entrypoint

Create one simple operator-facing entry surface that proves the architecture.

This may be:
- a minimal CLI,
- or a small internal module intended for future OpenClaw tool exposure,
- or both if trivial.

The point is to prove the shape of the adapter and command flow cleanly.

## Non-goals

Do not implement in this packet:
- LoRA or fine-tuning
- full RAG system
- avatar rendering
- complete DT executable
- advanced scenario branching engine
- broad autonomous task planning

## Acceptance criteria

The packet is successful when all of the following are true:
- a portable Cityverse skill draft exists in the repo
- the skill documents config and source-priority rules clearly
- a Cityverse adapter can query current VC and IOT state
- a Cityverse adapter can execute the narrow VC command set cleanly
- command results are normalized and audit-friendly
- the implementation does not hardcode Martin-specific machine paths
- the implementation is reviewable and clearly extensible toward later DT and scenario work

## Suggested file/folder shape

Claude may adjust names if needed, but a structure like this is sensible:

- `openclaw-skill/cityverse/`
  - `SKILL.md`
  - `README.md`
- `packages/cityverse-operator/`
  - `src/config.ts`
  - `src/http.ts`
  - `src/vc.ts`
  - `src/iot.ts`
  - `src/dt.ts`
  - `src/docs.ts`
  - `src/types.ts`
  - `src/index.ts`
- optional:
  - `scripts/cityverse-operator-demo.mjs`

If the monorepo suggests a better location, keep the same separation of concerns.

## Implementation guidance

- prefer explicit functions over clever abstraction
- reuse existing contracts where sensible
- keep service ownership boundaries visible
- document unsupported capabilities instead of faking them
- where current APIs do not yet exist, stub only the adapter interface and clearly mark the missing backend dependency

## Verification guidance

Before handing back the work, Claude should verify at minimum:
- project still builds, or clearly document why build wiring is pending
- adapter calls line up with real current endpoints
- the narrow command set matches implemented VC behavior
- docs search works against the local `docs/` folder

## Follow-up packet likely next

The next logical packet after this one should be:
- Phase 2 scenario-analysis foundation
- or DT-facing operator extensions

But only after Phase 1 is clean and real.

## Short conclusion

This packet should produce the first serious AI operator foundation for Cityverse.
Not a toy chatbot, not a speculative brain transplant — just the first proper control desk.