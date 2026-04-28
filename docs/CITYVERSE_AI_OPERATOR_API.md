# Cityverse MVP, AI Operator API and Skill Contract

Date: 2026-04-27
Status: planning draft

## Purpose

This document defines the first practical contract between:
- the Cityverse OpenClaw skill,
- the Cityverse service APIs,
- and the future Claude/OpenClaw implementation work.

The goal is to make the AI operator portable, explicit, and implementable.

## Design rule

The AI should not scrape random internals.

It should use:
- explicit HTTP APIs,
- explicit tool wrappers,
- explicit config,
- explicit response envelopes.

## Skill-facing capability groups

The OpenClaw skill should reason in terms of the following capability groups.

### 1. System overview
Read-only system understanding.

Examples:
- what services are available,
- which endpoints are reachable,
- what the current deployment profile is,
- what features are enabled.

### 2. Current state inspection
Read current truth from VC, IOT, and DT.

Examples:
- clock state,
- current weather,
- current energy,
- current city aggregate,
- building state,
- active DT view mode,
- focused entity.

### 3. Simulation control
Change simulation state through VC-owned commands.

Examples:
- pause and resume,
- set speed,
- set time/date,
- weather override,
- scenario activation,
- generator commands,
- building and district modifiers.

### 4. History and replay
Read and manage stored state through IOT.

Examples:
- latest state query,
- historical query,
- replay status,
- start replay,
- stop replay,
- rebuild projections.

### 5. Twin and view operations
Interact with DT-owned projection and view behavior.

Examples:
- focus entity,
- focus district,
- set view mode,
- get scene state,
- refresh graph projection.

### 6. Scenario analysis
Evaluate hypothetical changes through a dedicated analysis path.

Examples:
- compare baseline to branch,
- estimate system impacts,
- identify largest shifts,
- explain why branch outcomes differ.

## Recommended operator tool surface

These tool names are not sacred, but the split is sensible.

### A. `cityverse.system.status`
Return overall service availability and version/config summary.

Suggested output:
- VC reachable or not
- IOT reachable or not
- DT reachable or not
- feature flags
- deployment profile

### B. `cityverse.vc.get_state`
Return current VC summary.

Suggested fields:
- clock
- weather
- energy
- generators
- demand
- active scenarios

### C. `cityverse.vc.command`
Execute one validated VC command.

Suggested inputs:
- `commandName`
- `target`
- `payload`
- `reason`
- `actor`

Suggested behavior:
- validate payload
- call appropriate VC endpoint
- return standard command result envelope

### D. `cityverse.iot.get_current`
Return current IOT-projected state for a requested scope.

Suggested scopes:
- weather
- energy
- demand
- city
- buildings
- entity by ID

### E. `cityverse.iot.get_history`
Return historical telemetry or aggregate slices.

Suggested inputs:
- entity type
- entity ID
- metric
- from/to
- aggregation mode

### F. `cityverse.iot.command`
Execute IOT maintenance or replay commands.

### G. `cityverse.dt.get_state`
Return DT twin/view state.

Suggested scopes:
- whole city scene
- district scene
- entity twin
- active view state

### H. `cityverse.dt.command`
Execute DT focus/view commands.

### I. `cityverse.analysis.compare_scenario`
Run a structured baseline-vs-branch comparison.

Suggested inputs:
- baseline selection
- hypothetical command list
- time horizon
- output metrics

Suggested outputs:
- baseline summary
- branch summary
- diff list
- key impacts
- confidence/explanation notes

### J. `cityverse.docs.search`
Search local Cityverse docs and implementation notes.

This may later become retrieval-backed instead of plain file search.

## Standard response envelope

All tool wrappers should normalize toward a standard envelope.

```json
{
  "success": true,
  "source": "vc",
  "action": "set_weather_preset",
  "timestampUtc": "2026-04-27T20:00:00Z",
  "target": {
    "service": "vc",
    "entityId": null
  },
  "result": {},
  "errors": []
}
```

This should remain close to the broader API command surface already documented in `docs/API_COMMAND_SURFACE.md`.

## Portable skill contract

The portable skill should include at minimum:
- architecture summary,
- service ownership rules,
- operator workflows,
- safety rules,
- capability mapping,
- configuration contract,
- source priorities.

## Source priority rules for the skill

The skill should instruct the agent to prioritize sources in this order.

### For control questions
1. live API/tool results
2. current command surface docs
3. architecture docs

### For diagnosis questions
1. live VC/IOT/DT state
2. recent command/audit history
3. architecture docs

### For explanation questions
1. architecture and implementation docs
2. current API docs
3. live state as supporting evidence

### For hypothetical questions
1. scenario-analysis tool results
2. current state
3. architecture docs

The skill should explicitly forbid answering hypothetical outcome questions as if they were verified facts unless a scenario-analysis path has actually been used.

## Portable config contract

The skill should expect installation-provided config rather than hardcoded paths.

Suggested keys:
- `CITYVERSE_PROFILE`
- `CITYVERSE_VC_BASE_URL`
- `CITYVERSE_IOT_BASE_URL`
- `CITYVERSE_DT_BASE_URL`
- `CITYVERSE_DOCS_ROOT`
- `CITYVERSE_ENABLE_DANGEROUS_COMMANDS`

## OpenClaw packaging recommendation

The skill should be prepared to ship as:
- a repository-local skill during development,
- and later as a ClawHub-installable skill.

Portable packaging should include:
- `SKILL.md`
- optional helper docs
- minimal assumptions about local machine layout
- clear install instructions
- example config

## Initial question handling policy

The agent should be guided to classify user requests before acting.

### Classify as `explain`
Answer from docs and architecture.

### Classify as `inspect`
Check live state and summarize findings.

### Classify as `control`
Validate and execute explicit commands.

### Classify as `analyze`
Run scenario comparison or report that such analysis is not yet available.

This keeps the operator from using the wrong method for the wrong question.

## Recommended first implementation slice

The first implementable AI operator slice should support:
- service status
- VC weather/clock reads
- IOT current weather/energy/city/buildings reads
- VC pause/resume/time/speed/weather commands
- docs search over Cityverse docs
- basic audit logging for AI-issued commands

That is enough to make the agent useful without pretending Phase 2 already exists.

## Short conclusion

The AI operator should speak through a narrow, explicit contract.
That is how we get portability, safety, and answers that are better than expensive improvisation.