# Cityverse MVP, Repo Scaffold Plan

Date: 2026-04-17
Status: initialized

## Created structure

- `apps/cityverse-vc`
- `apps/cityverse-iot`
- `packages/contracts`
- `packages/config`
- `packages/logging`
- `packages/test-utils`
- `unity/cityverse-receiver`

## Root files created

- `package.json`
- `pnpm-workspace.yaml`
- `tsconfig.base.json`

## Immediate next scaffold targets

### `packages/contracts`
- package.json
- tsconfig.json
- src/weather.ts
- src/topics.ts
- src/index.ts

### `apps/cityverse-vc`
- package.json
- tsconfig.json
- src/index.ts
- src/server.ts
- src/weather/
- public/

### `apps/cityverse-iot`
- package.json
- tsconfig.json
- src/index.ts
- src/server.ts
- src/weather/

### `unity/cityverse-receiver`
- placeholder README or notes
- scripts for HTTP weather fetch

## Current intent

This scaffold is only the structure foundation.
It is not yet the full application implementation.

That work should now be delegated in coding packets, reviewed, and integrated.
