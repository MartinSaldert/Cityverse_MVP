# Cityverse MVP, AI Operator Architecture

Date: 2026-04-27
Status: planning draft

## Purpose

This document defines the recommended architecture for adding an AI operator layer to Cityverse.

The AI layer must be able to:
- control VC safely,
- read and explain current system state,
- answer how the simulation works,
- reason about hypothetical changes,
- travel with the software as a portable OpenClaw skill.

## Core recommendation

Do not begin with fine-tuning, LoRA, or a heavyweight training project.

Begin with:
- a strong general LLM,
- a portable Cityverse OpenClaw skill,
- explicit tool wrappers over VC, IOT, and DT,
- a scenario-analysis layer for hypothetical outcomes,
- a small focused retrieval layer later for docs, runbooks, and history.

## Architectural principle

The model is not the source of truth.

Truth must remain in:
- **VC** for simulation state and simulation-changing commands,
- **IOT** for ingest, current state, history, and replay,
- **DT** for twin composition, scene projections, and view state.

The AI layer is an operator and explanation layer over those systems.

## Why this approach

This gives us:
- better answers than a generic chatbot,
- better control than a document-only assistant,
- lower cost and lower maintenance than tuning a custom model early,
- portability across future OpenClaw installations,
- safer reasoning because live state and commands are explicit.

## High-level component model

### 1. OpenClaw Cityverse skill
Portable operator skill that ships with the software.

Responsibilities:
- describe the VC / IOT / DT architecture,
- describe available operator workflows,
- define safe control rules,
- guide tool usage order,
- distinguish docs vs live state vs hypothetical analysis,
- define configuration contract,
- remain reusable across installations.

### 2. Cityverse tool adapter layer
A narrow API client layer used by the skill.

Responsibilities:
- call VC command and query APIs,
- call IOT current-state and history APIs,
- call DT view and twin APIs,
- normalize responses for the agent,
- enforce request validation,
- centralize auth/config.

### 3. Scenario-analysis layer
A deterministic analysis layer for predictions.

Responsibilities:
- capture baseline state,
- apply hypothetical command branches,
- simulate or evaluate resulting state,
- produce structured diffs,
- feed those diffs back to the LLM for explanation.

The model should explain scenario outcomes, not invent them.

### 4. Retrieval layer, later
A focused retrieval layer should be added after tool control works.

Responsibilities:
- search architecture docs,
- search runbooks,
- search command history and decision notes,
- support explanation questions about how the system works.

### 5. Optional avatar layer, later
The avatar is presentation only.

Responsibilities:
- render speech and presence in Unity,
- consume responses from the AI layer,
- remain separate from the reasoning/control stack.

## User question classes

The AI should distinguish at least four question types.

### A. Control requests
Examples:
- pause the simulation
- set the city to winter morning
- activate storm scenario
- reduce occupancy in district north

Required behavior:
- inspect current state when relevant,
- call explicit commands,
- confirm results from live state,
- log and audit the action.

### B. System understanding questions
Examples:
- how does weather affect energy
- what does IOT own
- why is DT separate from VC

Required behavior:
- answer from docs, skill guidance, and architecture notes,
- cite the relevant source when possible,
- avoid pretending undocumented behavior exists.

### C. Live diagnosis questions
Examples:
- why is demand high right now
- why did solar output drop
- why is Unity showing stale data

Required behavior:
- inspect current state,
- inspect recent command history if available,
- compare signals across VC, IOT, and DT,
- answer from evidence, not generic theory.

### D. Hypothetical scenario questions
Examples:
- what happens if we trigger winter storm
- what would change if we double wind and pause a generator
- which buildings would be stressed if occupancy rises 30 percent

Required behavior:
- capture baseline,
- run branch analysis through scenario tools,
- produce structured differences,
- explain the causal path in plain language.

## Recommended phased implementation

## Phase 1, Cityverse operator foundation

### Goal
Create the first useful AI operator that can read and control the system safely.

### Deliver
- portable OpenClaw Cityverse skill,
- Cityverse tool adapter over VC/IOT/DT HTTP APIs,
- live state reading flows,
- safe VC command execution flows,
- audit log for AI-initiated commands,
- install/config documentation.

### Capabilities
- explain the system at a high level,
- read weather, energy, city, building, and DT state,
- pause/resume,
- set time/date/speed,
- trigger weather and scenario controls already supported by APIs,
- explain why current outputs look the way they do.

## Phase 2, scenario-analysis layer

### Goal
Support trustworthy what-if reasoning.

### Deliver
- baseline snapshot capture,
- branch command set representation,
- scenario execution or deterministic projection path,
- baseline-vs-branch diff objects,
- explanation templates for outcomes.

### Capabilities
- compare current state vs hypothetical,
- rank likely impacts,
- identify stressed systems,
- explain which result came from weather, occupancy, generation, or control changes.

## Phase 3, retrieval layer

### Goal
Improve deep explanation quality without hardcoding too much into the skill.

### Deliver
- document corpus definition,
- indexing pipeline,
- retrieval interfaces,
- source-aware answer formatting.

### Suggested corpus
- `docs/*.md`
- runbooks
- API references
- implementation plans
- future command logs and operational notes

## Phase 4, Unity embodiment

### Goal
Add a visible AI presence in the digital twin.

### Deliver
- Unity-facing AI message bridge,
- speech output integration,
- avatar animation triggers,
- optional panel showing tool actions and evidence.

## Portable skill requirement

The skill must travel with Cityverse.

That means the portable part must depend on:
- documented APIs,
- stable contracts,
- environment-based configuration,
- repo-shipped docs,
- service capability discovery.

It must not depend on:
- Martin-specific file paths,
- local memory files outside the project,
- hardcoded localhost assumptions without config,
- one specific Unity project path,
- hidden installation knowledge.

## Suggested config contract

The skill should be configurable through environment or install config such as:
- `CITYVERSE_PROFILE`
- `CITYVERSE_VC_BASE_URL`
- `CITYVERSE_IOT_BASE_URL`
- `CITYVERSE_DT_BASE_URL`
- `CITYVERSE_API_TOKEN` if auth is later introduced
- `CITYVERSE_DOCS_ROOT`

## Safety and audit requirements

Every AI-issued command should support:
- actor identity, such as `automation_agent` or `operator_agent`,
- command ID,
- timestamp,
- target service,
- target entity,
- payload snapshot or hash,
- result status,
- failure reason.

High-impact commands should support a confirmation policy later.

## Non-goals for the first AI phase

Do not require initially:
- custom model training,
- LoRA or fine-tuning,
- full autonomous planning without operator approval,
- a complete avatar stack,
- deep long-term memory beyond docs/config/audit.

## Recommended immediate next build step

Implement Phase 1 as a portable operator skill plus tool adapter first.

That gives Cityverse an AI that can already:
- answer better,
- control the system safely,
- explain state using live evidence,
- provide the foundation for later scenario analysis.

## Short conclusion

The correct first AI for Cityverse is not a mystical oracle trained on your project.
It is a disciplined operator with manuals, dashboards, and properly labeled buttons.