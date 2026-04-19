# Cityverse MVP, Current Implementation Status

Date: 2026-04-19
Status: verified against current code structure

## Summary

The current Cityverse MVP implementation already provides a working first vertical slice on the code level:
- VC simulates time, weather, renewable energy, and a derived city aggregate
- VC exposes an operator UI and HTTP control surface
- VC publishes weather and energy telemetry over MQTT
- IOT ingests weather and energy telemetry from MQTT
- IOT exposes current weather, energy, demand, and city aggregate over HTTP
- Unity receiver documentation exists for polling both weather and energy from IOT

The largest remaining gap is not basic app structure. It is end to end verification and automated testing.

## Monorepo structure

### Root
- workspace managed with `pnpm`
- root scripts include:
  - `pnpm build`
  - `pnpm build:contracts`
  - `pnpm build:vc`
  - `pnpm build:iot`
  - `pnpm start:vc`
  - `pnpm start:iot`

### Packages
- `packages/contracts`
- `apps/cityverse-vc`
- `apps/cityverse-iot`
- `unity/cityverse-receiver`

## Build and test status

### Verified build status
- `pnpm build` succeeds
- contracts compile
- VC compiles
- IOT compiles

### Test status
- `pnpm test` is still a placeholder
- no real automated test suite is wired in yet

## Contracts package

Shared contract modules currently include:
- weather telemetry
- weather summary
- weather commands
- weather current payload
- energy summary
- energy current payload
- city summary
- MQTT topics

These contracts are used to keep VC publish shape and IOT ingest shape aligned.

## VC implementation

### Entrypoint and runtime
VC has:
- `src/main.ts`
- `src/server.ts`
- Fastify server
- `/health` endpoint
- root browser UI at `/`

### Clock subsystem
VC clock support includes:
- get current simulation clock state
- pause simulation
- resume simulation
- change simulation speed
- set simulation time directly

Routes:
- `GET /api/clock`
- `POST /api/clock/pause`
- `POST /api/clock/resume`
- `POST /api/clock/speed`
- `POST /api/clock/time`

### Weather subsystem
Weather support includes:
- season-aware calendar context
- daylight factor
- solar radiation approximation
- pressure evolution
- humidity evolution
- cloud cover evolution
- wind evolution
- precipitation evolution
- temperature and feels-like evolution
- derived weather category
- manual weather nudges

Routes:
- `GET /api/weather/current`
- `POST /api/weather/nudge`

Current note:
- weather control is currently a nudge model, not a preset library or hard override mode

### Energy subsystem
Energy support includes:
- solar output approximation derived from solar radiation
- wind output approximation derived from wind speed
- total renewable output aggregation

Routes:
- `GET /api/energy/current`

Current note:
- this is a renewable summary model, not yet a full explicit generator fleet

### City aggregate subsystem
City support includes:
- derived current demand summary
- derived city aggregate summary
- city balance calculation

Routes:
- `GET /api/demand/current`
- `GET /api/city/current`

Current note:
- demand is still a synthetic aggregate formula, not yet a building-driven simulation

### Operator UI
The VC UI currently supports:
- viewing live clock state
- viewing live weather state
- viewing live energy state
- viewing live city state
- setting speed
- quick speed presets
- setting simulation date and time
- pause and resume
- applying weather nudges

It is functional and useful for the slice, though still intentionally spare.

### MQTT publishing
VC publishes:
- weather telemetry
- energy telemetry

Current note:
- no separate city aggregate telemetry topic is implemented yet
- IOT derives city aggregate from latest weather and energy state

## IOT implementation

### Entrypoint and runtime
IOT has:
- `src/main.ts`
- `src/server.ts`
- Fastify server
- `/health` endpoint

### MQTT ingest
IOT subscribes to:
- weather telemetry topic
- energy telemetry topic

IOT validates payloads using shared contracts and stores latest values in memory.

### HTTP routes
IOT exposes:
- `GET /weather/current`
- `GET /energy/current`
- `GET /demand/current`
- `GET /city/current`

### Current behavior when data is missing
- weather route returns `503` until weather telemetry arrives
- energy route returns `503` until energy telemetry arrives
- demand route requires weather state
- city route requires weather, energy, and demand availability

### Data model note
IOT currently behaves as a live state gateway, not a historical storage system.
That is acceptable for this MVP slice, though history and replay will likely matter later.

## Unity receiver status

The Unity receiver folder currently documents:
- weather DTO and API client
- weather receiver behaviour
- energy DTO and API client
- energy receiver behaviour

Current Unity path:
- HTTP polling from IOT
- debug logging and inspector-visible values
- optional light reaction for weather/daylight

Not yet implemented in the documented path:
- WebSocket or event-stream push updates
- richer in-scene visualization binding
- dashboard UI beyond logs and basic inspector state

## What is implemented versus planned

### Implemented now
- executable separation between VC and IOT
- shared contracts
- simulation clock
- weather simulation
- renewable energy summary
- city aggregate summary
- operator UI
- MQTT weather and energy flow
- IOT live current-state API
- Unity polling receiver documentation

### Still planned
- explicit building entity model
- explicit generator control model
- CO2 model
- traffic model
- historical persistence and replay in IOT
- automated tests
- end to end validation on target Windows setup

## Main risks

### 1. End to end integration is not yet verified here
This machine does not currently have a local MQTT broker installed, so a full local live run was not completed in this verification pass.

### 2. Tests are absent
The build passes, but build success is not the same thing as runtime confidence. A lesson many teams learn several outages too late.

### 3. Some docs had drifted behind implementation
The project had planning docs that still described already-completed steps as pending. That has now started to be corrected.

## Recommended next steps

1. run the Windows PC vertical slice using the updated test plan
2. add automated smoke tests for VC, IOT, and contracts
3. define the first explicit building roster and building-driven demand model
4. decide whether city aggregate should remain derived in IOT or also be emitted directly from VC
5. add a lightweight historical state layer in IOT once the live path is stable
