# Cityverse AI Phase 3: Runtime Wiring

Date: 2026-04-28
Status: implemented

## Overview

This document describes the exact path from OpenClaw agent → Cityverse tool call → operator business logic → service response. It supersedes any informal wiring described in earlier packets.

## Package dependency chain

```
OpenClaw agent
  → calls tool by stable name (e.g. cityverse.vc.get_weather)
  → CITYVERSE_TOOLS registry (packages/cityverse-tool-surface)
    → handler function (e.g. handleVcGetWeather)
      → guardrail check via checkActionPolicy (packages/cityverse-operator/src/guardrail.ts)
      → operator business logic (packages/cityverse-operator/src/vc.ts, iot.ts, analysis/, flow.ts)
        → HTTP adapter (packages/cityverse-operator/src/http.ts)
          → live VC/IOT/DT services (or in-memory for analysis)
      → ToolEnvelope response returned to agent
```

## Build order

The operator package must be built before the tool-surface:

```sh
pnpm build:operator      # builds @cityverse/operator
pnpm build:tool-surface  # builds @cityverse/tool-surface (imports operator dist)
```

Or build everything:

```sh
pnpm build
```

## Runtime invocation pattern

An OpenClaw agent uses tools by name from `CITYVERSE_TOOLS`. The canonical invocation path is:

```js
import { CITYVERSE_TOOLS } from '@cityverse/tool-surface'

const result = await CITYVERSE_TOOLS['cityverse.vc.get_weather']({})
// result is a ToolEnvelope: { success, tool, source, action, timestampUtc, result, errors, meta? }
```

For control actions:

```js
const result = await CITYVERSE_TOOLS['cityverse.vc.set_speed']({ speed: 2, actor: 'operator_claude' })
// result.meta.commandId contains the audit ID
```

For scenario analysis:

```js
const result = await CITYVERSE_TOOLS['cityverse.analysis.capture_baseline']({})
const projected = await CITYVERSE_TOOLS['cityverse.analysis.project_branch']({
  baseline: result.result,
  branch: { branchId: 'b1', name: 'High cloud cover', commands: [...], horizon: {...}, assumptions: [] },
})
const comparison = await CITYVERSE_TOOLS['cityverse.analysis.compare']({
  baseline: result.result,
  projected: projected.result,
  branch: { ... },
})
```

## Environment variables

Set these before running. All have safe defaults for local development.

| Variable | Default | Purpose |
|---|---|---|
| `CITYVERSE_VC_BASE_URL` | `http://localhost:3001` | VC service base URL |
| `CITYVERSE_IOT_BASE_URL` | `http://localhost:3002` | IOT service base URL |
| `CITYVERSE_DT_BASE_URL` | `http://localhost:3003` | DT service base URL (not yet used) |
| `CITYVERSE_DOCS_ROOT` | auto-resolved from package | Absolute path to `docs/` directory |
| `CITYVERSE_PROFILE` | `local` | Deployment profile label (appears in envelopes and baselines) |
| `CITYVERSE_ENABLE_DANGEROUS_COMMANDS` | `false` | Enable destructive command class (no such commands exist yet) |

## Stable tool names

These names are stable and must not change without a versioned migration:

| Tool | Category | Always available? |
|---|---|---|
| `cityverse.system.status` | system | yes |
| `cityverse.vc.get_state` | vc read | when VC reachable |
| `cityverse.vc.get_clock` | vc read | when VC reachable |
| `cityverse.vc.get_weather` | vc read | when VC reachable |
| `cityverse.vc.get_energy` | vc read | when VC reachable |
| `cityverse.vc.get_city` | vc read | when VC reachable |
| `cityverse.vc.get_buildings` | vc read | when VC reachable |
| `cityverse.vc.pause` | vc control | when VC reachable + guardrail pass |
| `cityverse.vc.resume` | vc control | when VC reachable + guardrail pass |
| `cityverse.vc.set_speed` | vc control | when VC reachable + guardrail pass |
| `cityverse.vc.set_time` | vc control | when VC reachable + guardrail pass |
| `cityverse.vc.weather_nudge` | vc control | when VC reachable + guardrail pass |
| `cityverse.iot.get_weather` | iot read | when IOT reachable |
| `cityverse.iot.get_energy` | iot read | when IOT reachable |
| `cityverse.iot.get_city` | iot read | when IOT reachable |
| `cityverse.iot.get_buildings` | iot read | when IOT reachable |
| `cityverse.iot.get_ops_summary` | iot read | when IOT reachable |
| `cityverse.analysis.capture_baseline` | analysis | always (in-memory) |
| `cityverse.analysis.project_branch` | analysis | always (in-memory) |
| `cityverse.analysis.compare` | analysis | always (in-memory) |
| `cityverse.docs.search` | docs | always (local files) |

## Guardrail policy

All control actions pass through `checkActionPolicy()` before execution. The policy check returns:

```
{ allowed: true, actionClass, policyVersion }
  or
{ allowed: false, blockedReason, blockedMessage, policyVersion }
```

A blocked result returns a structured `ToolEnvelope` with `success: false`, the error message, and `meta.blocked = true`. The calling agent must never retry a blocked action without a policy change.

See `packages/cityverse-operator/src/guardrail.ts` for the full policy table.

## Degraded-mode startup

When VC or IOT is unreachable, `cityverse.system.status` returns a `serviceMode` field and `availableFlows` that tell the caller exactly what is and isn't available:

```json
{
  "serviceMode": "vc_only",
  "availableFlows": {
    "inspect": true,
    "control": true,
    "analyze": true,
    "docsSearch": true,
    "iotHistory": false
  },
  "degradedNotes": [
    "IOT is not reachable. IOT projected-state reads are unavailable. ..."
  ]
}
```

Always call `cityverse.system.status` first in a new operator session to understand what is available.

## Operator flow sequence

The canonical operator flow (inspect → explain → propose → compare) is available as reusable helpers:

```js
import { inspectState, explainLimitations, runScenarioComparison } from '@cityverse/operator'

// 1. Inspect current state
const state = await inspectState(config)

// 2. Explain limitations before analysis
const limits = explainLimitations()

// 3. Run a full scenario comparison
const result = await runScenarioComparison(config, [
  { targetService: 'vc', commandName: 'weather_nudge', targetEntityId: null, payload: { cloudBias: 0.3 }, order: 1 }
], 'High cloud cover scenario')

// result.comparison has metricDeltas, topFindings, riskNotes, limitations, unsupportedClaims, provenance
// result.limitations has the full KNOWN_LIMITATIONS and UNSUPPORTED_CLAIMS
```

## Reproducing on another machine

1. Clone the repo
2. `pnpm install`
3. `pnpm build`
4. Set environment variables for VC/IOT URLs (defaults work for local dev)
5. Start VC and IOT services: `pnpm start:vc` and `pnpm start:iot` in separate terminals
6. Run tests: `pnpm test`
7. Run the demo: `pnpm demo:operator`

No machine-specific paths are required. `CITYVERSE_DOCS_ROOT` auto-resolves from the operator package location.
