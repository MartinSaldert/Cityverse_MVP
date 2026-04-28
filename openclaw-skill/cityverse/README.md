# Cityverse OpenClaw Skill

Phase 2 operator skill for Cityverse.

## What it does

This skill gives an OpenClaw-based agent the knowledge and tool mapping to:
- understand the Cityverse architecture (VC / IOT / DT boundaries)
- read live state from VC and IOT
- issue a narrow safe command set against VC
- search Cityverse documentation
- produce audit-friendly command results
- run portable scenario analysis (Phase 2): capture baseline, evaluate hypothetical branches in memory, produce structured metric diffs and limitations

## Install

1. Ensure `@cityverse/operator` is built:
   ```
   pnpm build:operator
   ```

2. Set config via environment variables (see below).

3. Register this skill with your OpenClaw agent, pointing it at `SKILL.md`.

## Config

| Variable | Purpose | Default |
|---|---|---|
| `CITYVERSE_VC_BASE_URL` | VC HTTP base URL | `http://localhost:3001` |
| `CITYVERSE_IOT_BASE_URL` | IOT HTTP base URL | `http://localhost:3002` |
| `CITYVERSE_DT_BASE_URL` | DT HTTP base URL | `http://localhost:3003` |
| `CITYVERSE_DOCS_ROOT` | Absolute path to `docs/` directory | auto-resolved |
| `CITYVERSE_PROFILE` | Deployment label shown in status | `local` |
| `CITYVERSE_ENABLE_DANGEROUS_COMMANDS` | Unlock destructive commands | `false` |

The `@cityverse/operator` package resolves `docsRoot` from its own install location when `CITYVERSE_DOCS_ROOT` is not set. This works correctly in the monorepo. For external installs, set the variable explicitly.

## Tool adapter

The underlying tool adapter lives at `packages/cityverse-operator/`. It provides typed TypeScript functions for every read and command flow. See `src/index.ts` for the full exported surface.

## Phase 1 command set

Live simulation commands (VC only):
- pause
- resume
- set_speed
- set_time
- weather_nudge

Generator control, building overrides, and district modifiers are not implemented.

## Phase 2 scenario analysis

The analysis path is deterministic and runs in memory — it never calls live mutation endpoints.

Functions exported from `@cityverse/operator`:
- `captureBaseline(config)` — snapshot current VC/IOT state into a `BaselineSnapshot`
- `validateBranch(input)` / `validateBranchSafe(input)` — parse and validate a `ScenarioBranch`
- `projectBranchState(baseline, branch)` — apply branch commands to baseline snapshot (no live I/O)
- `compareScenario(baseline, branch, projected)` — produce `ScenarioComparisonResult`

Supported scenario commands in Phase 2:
- `set_time` — adjust clock; solar output updated via simplified daylight model
- `set_speed` — adjust simulation speed multiplier
- `weather_nudge` — apply cloudBias, windBias, tempBias, humidityBias, pressureBias

The result includes `limitations` and `unsupportedClaims` in machine-readable form. Always surface these when reporting analysis results.

## Demo

After building the operator package, run the Phase 1 demo:

```
node scripts/cityverse-operator-demo.mjs
```

Or the Phase 2 scenario analysis demo:

```
node scripts/cityverse-scenario-demo.mjs
```

The scenario demo runs end-to-end even when services are not running, demonstrating baseline capture with graceful degradation, branch projection, metric diff, and limitations output.

## DT

DT adapter stubs exist but all calls return `not_implemented`. DT will be wired up once the DT service is running.

## Audit log

Commands write structured JSON to stderr and to an in-memory ring buffer (1000 entries). Call `getAuditLog()` from `@cityverse/operator` to inspect the buffer. The log is not persisted across process restarts in Phase 1.

