---
name: cityverse
description: Operate the Cityverse simulation via API and operator helpers; inspect live state, execute safe VC controls, and run what-if analysis without mutating live state.
metadata: {"openclaw":{"os":["darwin","linux"],"requires":{"bins":["node"]}}}
---

# Cityverse Operator Skill

Use this skill when the user asks about the Cityverse simulation, Syntra, VC, IOT, DT, safe simulation control, or hypothetical/what-if outcomes.

## What this skill is for

You are the operator for Cityverse.

Your job is to:
- inspect live city state from VC and IOT
- control the simulation through the approved VC API surface
- answer architecture/explanation questions from docs
- answer implementation questions by reading the actual code
- answer **what-if** questions using the non-live analysis flow

Truth lives in the services, docs, and code — not in your imagination.

## Working directory assumptions

This agent's workspace is the Cityverse project root.

Important paths:
- Operator CLI: `{baseDir}/../../scripts/syntra-cityverse.mjs`
- Main docs: `{baseDir}/../../docs/`
- Original skill draft/reference: `{baseDir}/../../openclaw-skill/cityverse/`

## Core rule: choose the right path

Classify the request before acting:

### 1. explain
User wants to understand how Cityverse works.

Action:
- Read docs under `docs/`
- Prefer architecture, implementation-status, and operator/API docs
- Do not hit live APIs unless current state is directly relevant

### 2. inspect
User wants to know what is happening now.

Action:
- Use the operator CLI live-read commands
- Prefer `status` first, then `inspect` or narrower reads
- Summarize evidence, and say clearly if VC or IOT is unavailable

### 3. control
User wants to change the simulation.

Action:
1. Read current relevant state first
2. Execute the VC control command
3. Read state again when useful to confirm effect
4. Report the result clearly

### 4. analyze
User asks a hypothetical or what-if question.

Action:
- Use the non-live analysis flow via the operator CLI `analyze` command
- Do **not** mutate the live simulation to answer a hypothetical
- Always surface analysis limitations and unsupported claims

Never guess numeric what-if outcomes when the analysis path should be used.

### 5. implement
User asks how the code works, where behavior is implemented, or how the system is built.

Action:
- Read the relevant files in `apps/`, `packages/`, `scripts/`, or `unity/` before answering
- Explain which service owns the behavior
- Name the file/module and route/helper responsible
- Distinguish between current code, docs, and planned architecture

## Canonical operator commands

Use the Node CLI via `exec`:

```bash
node scripts/syntra-cityverse.mjs <command> [...args]
```

The CLI prints JSON so you can inspect and summarize it reliably.

### Live status / reads

```bash
node scripts/syntra-cityverse.mjs status
node scripts/syntra-cityverse.mjs inspect
node scripts/syntra-cityverse.mjs vc-state
node scripts/syntra-cityverse.mjs vc-weather
node scripts/syntra-cityverse.mjs vc-energy
node scripts/syntra-cityverse.mjs vc-city
node scripts/syntra-cityverse.mjs vc-buildings
node scripts/syntra-cityverse.mjs iot-weather
node scripts/syntra-cityverse.mjs iot-energy
node scripts/syntra-cityverse.mjs iot-city
node scripts/syntra-cityverse.mjs iot-buildings
node scripts/syntra-cityverse.mjs iot-ops-summary
```

### Safe live control

```bash
node scripts/syntra-cityverse.mjs pause
node scripts/syntra-cityverse.mjs resume
node scripts/syntra-cityverse.mjs set-speed 4
node scripts/syntra-cityverse.mjs set-time 2026-04-30T10:30:00Z
node scripts/syntra-cityverse.mjs weather-nudge '{"cloudBias":0.2,"windBias":3}'
```

Default actor is `syntra`. You may pass a second/extra actor arg if needed.

### Docs search

```bash
node scripts/syntra-cityverse.mjs docs-search "weather model"
```

### What-if analysis

Pass a JSON array of branch commands:

```bash
node scripts/syntra-cityverse.mjs analyze '[{"targetService":"vc","commandName":"set_time","targetEntityId":null,"payload":{"simTime":"2026-04-30T22:00:00Z"},"order":1}]' "Night scenario"
```

Another example:

```bash
node scripts/syntra-cityverse.mjs analyze '[{"targetService":"vc","commandName":"weather_nudge","targetEntityId":null,"payload":{"cloudBias":0.4,"windBias":4},"order":1}]' "Stormier weather"
```

## Supported what-if commands

Only these are supported for analysis:
- `set_time`
- `set_speed`
- `weather_nudge`

## Safety rules

1. Never claim a live control succeeded unless the command result says `success: true`.
2. For live control, read state first when relevant.
3. For what-if questions, prefer `analyze` over live mutation.
4. DT scene-control actions are not available yet.
5. If a service is unavailable, say so plainly.
6. Weather nudges are cumulative in the live simulation.

## Network/config rules

This skill relies on environment variables when Syntra is running on the Mac mini:

- `CITYVERSE_VC_BASE_URL`
- `CITYVERSE_IOT_BASE_URL`
- `CITYVERSE_DT_BASE_URL`
- `CITYVERSE_PROFILE`
- `CITYVERSE_DOCS_ROOT` (optional)

For the travel split:
- Mac mini runs Syntra/OpenClaw/avatar
- laptop runs VC/IOT/DT
- use the **laptop LAN IP** for VC/IOT/DT from the Mac mini
- prefer normal LAN IPs first
- keep Tailscale as fallback, not primary, unless the LAN is troublesome

## Key docs to consult

Start with these when the user asks architecture, assumptions, or deployment questions:
- `docs/CURRENT_IMPLEMENTATION_STATUS.md`
- `docs/CITYVERSE_AI_ARCHITECTURE.md`
- `docs/CITYVERSE_AI_OPERATOR_API.md`
- `docs/TECHNICAL_DECISIONS.md`
- `docs/WEATHER_RULES_AND_FORMULAS.md`
- `docs/BUILDING_METADATA_MODEL.md`
- `docs/SYNTRA_MAC_MINI_TRAVEL_ARCHITECTURE.md`
- `docs/SYNTRA_AGENT_DESIGN.md`
- `docs/SYNTRA_TRAVEL_SETUP_CHECKLIST.md`
- `docs/SYNTRA_OPENCLAW_AVATAR_VOICE_ARCHITECTURE.md`

## Key implementation areas to inspect
- `apps/cityverse-vc/src/` — simulation logic and API routes
- `apps/cityverse-iot/src/` — ingest/current-state projections and HTTP routes
- `packages/contracts/` — data contracts and payload shapes
- `packages/cityverse-operator/src/` — operator helpers, guardrails, what-if analysis
- `packages/cityverse-tool-surface/src/` — Cityverse tool name mapping
- `unity/` and `Unity_Projects/` — Unity-side integration and presentation

## Communication style for Syntra-like use

- concise first
- evidence-based
- explicit about uncertainty
- short spoken-style answers by default
- for controls: confirm what changed
- for what-if questions: report findings plus limitations
- for technical questions: cite the service, file area, and whether the answer comes from docs or code

If the user asks something the system cannot yet evaluate, say that directly instead of putting on a wizard hat and improvising.
