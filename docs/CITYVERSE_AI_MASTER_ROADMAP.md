# Cityverse MVP, AI Master Roadmap

Date: 2026-04-27
Status: planning draft

## Purpose

This document turns the Cityverse AI work into one ordered execution roadmap.

It connects:
- the portable OpenClaw skill,
- the operator tool/API layer,
- scenario analysis,
- retrieval,
- DT integration,
- avatar embodiment,
- and future operational hardening.

The aim is to give Claude and future implementers a dependency-aware path instead of a philosophical fog bank.

## Strategic objective

Create an AI operator for Cityverse that can:
- understand the system architecture,
- read live VC/IOT/DT state,
- control VC safely,
- explain how the simulation works,
- answer why the current system is behaving as it is,
- analyze hypothetical changes without guessing,
- later appear as an embodied assistant inside the digital twin.

## Architectural rules

The following rules should remain true throughout the roadmap:
- VC remains the authoritative simulation runtime
- IOT remains the authoritative ingest, latest-state, history, and replay runtime
- DT remains the authoritative twin composition and visualization-facing runtime
- the AI is an operator and explanation layer, not the source of truth
- hypothetical reasoning must come from explicit analysis paths, not raw LLM improvisation
- portability matters: the skill must travel with the software and avoid machine-specific assumptions

## Delivery sequence overview

Recommended order:
1. portable skill and operator foundation
2. live state tool adapter and narrow control surface
3. audit and safety layer
4. scenario analysis
5. real OpenClaw-facing tool surface
6. energy/scenario-model tightening
7. AI implementation runtime + guardrails + acceptance
8. retrieval/doc intelligence
9. DT-aware twin and scene reasoning
10. Unity/avatar embodiment
11. operational hardening and deployment profiles

This order is admirably dull, which is precisely why it has a chance of working.

## Milestone A, portable AI foundation

### Goal
Create the first portable Cityverse OpenClaw skill and define the operator contract.

### Deliver
- `docs/CITYVERSE_AI_ARCHITECTURE.md`
- `docs/CITYVERSE_AI_OPERATOR_API.md`
- portable `SKILL.md` draft
- config contract for VC/IOT/DT discovery
- source-priority rules
- safety and capability rules

### Exit criteria
- the skill is repo-portable
- the skill does not depend on Martin-specific paths
- the skill clearly distinguishes explain vs inspect vs control vs analyze
- installation assumptions are explicit

## Milestone B, operator adapter Phase 1

### Goal
Create a working operator adapter and narrow safe command set.

### Deliver
- service discovery/config loading
- HTTP adapter for VC/IOT/DT
- read flows for current state
- docs search capability
- narrow safe VC command set
- normalized result envelopes

### Reference packet
- `docs/CLAUDE_PACKET_CITYVERSE_AI_PHASE1.md`

### Exit criteria
- the agent can inspect live state
- the agent can issue a small safe VC command set
- command responses are normalized and reviewable
- command flow is portable and not hardcoded to one machine layout

## Milestone C, audit and safety layer

### Goal
Make AI control actions traceable and trustworthy.

### Deliver
- actor-aware command logging
- command IDs and timestamps
- payload summary/hashes where useful
- structured failure reporting
- support for future confirmation policy hooks

### Exit criteria
- every AI-issued command is observable
- failures are explicit and diagnosable
- the system is ready for later role separation and operator approvals

## Milestone D, scenario analysis Phase 2

### Goal
Create the first trustworthy path for hypothetical questions.

### Deliver
- baseline snapshot model
- branch command model
- non-live evaluation path
- structured diff results
- limitations/provenance reporting
- operator-facing analysis entrypoint
- portable skill and operator-package updates so Phase 2 can travel across OpenClaw installs

### Reference packet
- `docs/CLAUDE_PACKET_CITYVERSE_AI_PHASE2_SCENARIO_ANALYSIS.md`
- `docs/CLAUDE_TASK_CITYVERSE_AI_PHASE2_IMPLEMENTATION.md`
- `docs/CITYVERSE_AI_PORTABILITY_REQUIREMENTS.md`

### Exit criteria
- hypothetical analysis does not mutate live operator state
- results are structured and explainable
- unsupported areas are reported honestly
- the agent no longer has to bluff when asked “what happens if…”

## Milestone E, OpenClaw tool surface integration

### Goal
Expose Cityverse as a real OpenClaw-facing operator surface rather than relying on demos and implied wiring.

### Deliver
- a concrete OpenClaw-facing tool wrapper layer
- explicit inspect/control/analyze/docs-search tool mapping
- normalized outputs over `@cityverse/operator`
- updated skill docs reflecting the real callable tool names
- verification proving the wrapper works end to end

### Reference packet
- `docs/CLAUDE_PACKET_CITYVERSE_AI_OPENCLAW_TOOL_SURFACE.md`
- `docs/CLAUDE_TASK_CITYVERSE_AI_OPENCLAW_TOOL_SURFACE.md`
- `docs/CITYVERSE_AI_PORTABILITY_REQUIREMENTS.md`

### Exit criteria
- an OpenClaw agent can explicitly call Cityverse inspect/control/analyze flows
- the wrapper remains thin and portable
- the skill docs reflect reality instead of aspiration

## Milestone F, Phase 2.5 energy/scenario-model tightening

### Goal
Improve the weakest current scenario-analysis behaviors, especially around wind and energy projection.

### Deliver
- improved wind projection behavior
- better low/zero baseline handling
- clearer energy result shaping and limitations
- focused tests for cloud-plus-wind scenarios

### Reference packet
- `docs/CLAUDE_PACKET_CITYVERSE_AI_PHASE2_5_ENERGY_MODELING.md`
- `docs/CLAUDE_TASK_CITYVERSE_AI_PHASE2_5_ENERGY_MODELING.md`

### Exit criteria
- wind-related scenario answers are less misleading
- weak near-zero wind cases are handled more honestly
- deterministic portable analysis behavior is preserved

## Milestone G, AI implementation runtime + guardrails + acceptance

### Goal
Turn the Cityverse AI surface into a genuinely runnable operator workflow in OpenClaw.

### Deliver
- end-to-end runtime wiring for Cityverse tools
- explicit action policy and guardrails
- canonical inspect/explain/propose/compare operator flow
- degraded-mode behavior for VC/IOT/DT availability differences
- acceptance checks proving real operator readiness

### Reference packet
- `docs/CLAUDE_PACKET_CITYVERSE_AI_PHASE3_IMPLEMENTATION.md`
- `docs/CLAUDE_TASK_CITYVERSE_AI_PHASE3_IMPLEMENTATION.md`

### Exit criteria
- Cityverse tools are callable through a real runtime path
- safe vs blocked actions are explicit and enforced
- operator flow is repeatable and documented
- acceptance checks pass

## Milestone H, retrieval and doc intelligence

### Goal
Improve explanation quality for architecture and operations questions.

### Deliver
- document corpus definition
- indexing/retrieval pipeline
- source-aware answer formatting
- runbook and history retrieval hooks

### Suggested corpus
- `docs/*.md`
- implementation packets
- technical decisions
- runbooks
- future operator audit summaries

### Exit criteria
- the agent can answer system-design questions from repo truth
- retrieval is focused and source-aware
- the skill no longer needs to overstuff static instructions with every detail

## Milestone I, DT-aware AI reasoning

### Goal
Teach the operator to reason about the twin and scene, not just service APIs.

### Deliver
- DT view-state queries
- entity focus workflows
- scene bundle interpretation helpers
- district/building/generator relationship-aware explanations
- UI-facing explanation payloads for the DT/Unity side

### Exit criteria
- the AI can answer twin-facing questions coherently
- the AI can explain what the user is seeing in the scene
- DT is treated as a first-class reasoning surface, not an afterthought

## Milestone J, Unity embodiment and avatar layer

### Goal
Give the Cityverse AI an in-world presence without entangling reasoning and rendering.

### Deliver
- Unity bridge for AI messages
- optional voice output pipeline
- avatar state triggers
- tool-action/evidence panel for transparency
- integration path for facial speech animation and Animator-driven body states

### Exit criteria
- the AI can speak or present in the DT
- embodiment remains optional and decoupled from core reasoning/control
- failures in avatar systems do not break operator reasoning

## Milestone K, operational hardening

### Goal
Prepare the AI operator for broader deployment and long-term use.

### Deliver
- deployment profiles such as local/dev/demo/prod
- auth support if introduced later
- command confirmation policies for high-impact actions
- more complete capability discovery
- better test coverage across adapter, analysis, and retrieval layers
- packaging for ClawHub or equivalent portable distribution

### Exit criteria
- the skill travels cleanly across OpenClaw installs
- the AI operator can be configured without code edits
- trust, observability, and portability are no longer accidental

## Capability maturity model

### Level 1, explain
The AI can explain docs and architecture.

### Level 2, inspect
The AI can inspect live state and summarize what is happening.

### Level 3, control
The AI can safely operate approved VC controls.

### Level 4, analyze
The AI can compare baseline vs hypothetical branches honestly.

### Level 5, twin-aware
The AI can explain scene, entity, and relationship state through DT.

### Level 6, embodied
The AI can appear and communicate inside Unity.

This ladder is useful because it stops us pretending Level 6 matters before Level 3 is reliable.

## Recommended immediate execution order for Claude

1. implement `CLAUDE_PACKET_CITYVERSE_AI_PHASE1.md`
2. implement command audit/safety hardening if not already folded into Phase 1
3. implement `CLAUDE_PACKET_CITYVERSE_AI_PHASE2_SCENARIO_ANALYSIS.md`
4. implement `CLAUDE_PACKET_CITYVERSE_AI_OPENCLAW_TOOL_SURFACE.md`
5. implement `CLAUDE_PACKET_CITYVERSE_AI_PHASE2_5_ENERGY_MODELING.md`
6. implement `CLAUDE_PACKET_CITYVERSE_AI_PHASE3_IMPLEMENTATION.md`
7. create retrieval packet after runtime+guardrail implementation is proven
8. extend toward DT-aware reasoning
9. only then begin avatar implementation planning as executable work

## Recommended future packets to add

The next likely planning docs after Phase 2 are now:
- `CLAUDE_PACKET_CITYVERSE_AI_OPENCLAW_TOOL_SURFACE.md`
- `CLAUDE_PACKET_CITYVERSE_AI_PHASE2_5_ENERGY_MODELING.md`
- `CLAUDE_PACKET_CITYVERSE_AI_PHASE3_IMPLEMENTATION.md`
- `CLAUDE_PACKET_CITYVERSE_AI_PHASE3_RETRIEVAL.md`
- `CLAUDE_PACKET_CITYVERSE_AI_DT_REASONING.md`
- `CLAUDE_PACKET_CITYVERSE_AI_AVATAR_BRIDGE.md`
- `CLAUDE_PACKET_CITYVERSE_AI_HARDENING_AND_PACKAGING.md`

## Success definition

The Cityverse AI effort should be considered genuinely successful when:
- the agent can answer architecture questions from project truth
- the agent can inspect live state from VC/IOT/DT
- the agent can control approved simulation functions safely
- the agent can analyze hypothetical branches without bluffing
- the operator can trust where answers came from
- the skill can travel with the software to future OpenClaw installs

## Short conclusion

The Cityverse AI should be built as an operator first, an analyst second, and an avatar third.
That order is less glamorous, but much less likely to produce expensive nonsense.