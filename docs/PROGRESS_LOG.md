# Cityverse MVP, Progress Log

## 2026-04-20

### Windows PC vertical slice manually verified
- Martin confirmed the current Windows PC workflow checks out OK so far
- verified path remains: sync source to local PC mirror, build locally, run Mosquitto, start VC, start IOT, verify browser and Unity polling flow
- this should now be treated as the practical regression baseline rather than an unverified future step

### Test status clarified
- `pnpm test` is not a placeholder anymore
- `tests/smoke.test.mjs` exists and covers core route and contract checks
- coverage is still modest and should be expanded, but the repo is no longer in a zero-test state

### Next implementation target clarified
- the next major code step should be replacing the synthetic aggregate demand formula with an explicit building roster and building-driven demand model
- current demand logic still lives in `apps/cityverse-vc/src/city/service.ts` as a simple weather-based aggregate formula
- generator modeling should follow once the building load layer is explicit

## 2026-04-19

### Current implementation status verified
- root monorepo scripts are present and working
- `pnpm build` completes successfully for contracts, VC, and IOT
- `pnpm test` now exists and runs the current smoke test suite, though coverage remains limited

### Shared contracts implemented
- weather summary and telemetry schemas
- weather command payload schemas
- energy summary and current payload schemas
- city summary and demand summary schemas
- MQTT topic helper exports

### VC implemented
- executable entrypoint at `apps/cityverse-vc/src/main.ts`
- Fastify server and `/health` endpoint
- browser operator UI at `/`
- simulation clock service with:
  - query
  - pause/resume
  - speed control
  - set simulation time
- weather simulation service with:
  - season-aware calendar context
  - daylight factor
  - pressure, humidity, cloud, wind, precipitation, and temperature evolution
  - manual weather nudges through HTTP
- energy summary service with:
  - solar output approximation from solar radiation
  - wind output approximation from wind speed
  - total renewable output summary
- city aggregate service with:
  - synthetic demand calculation
  - city balance calculation
- HTTP routes currently exposed by VC:
  - `/health`
  - `/`
  - `/api/clock`
  - `/api/clock/pause`
  - `/api/clock/resume`
  - `/api/clock/speed`
  - `/api/clock/time`
  - `/api/weather/current`
  - `/api/weather/nudge`
  - `/api/energy/current`
  - `/api/demand/current`
  - `/api/city/current`
- MQTT publishing implemented for:
  - weather telemetry
  - energy telemetry

### IOT implemented
- executable entrypoint at `apps/cityverse-iot/src/main.ts`
- Fastify server and `/health` endpoint
- MQTT ingest for weather telemetry
- MQTT ingest for energy telemetry
- derived current demand summary from latest weather
- derived current city aggregate from latest weather plus energy
- HTTP routes currently exposed by IOT:
  - `/health`
  - `/weather/current`
  - `/energy/current`
  - `/demand/current`
  - `/city/current`
- current behavior when no telemetry has arrived yet:
  - weather route returns `503`
  - energy route returns `503`
  - city and demand routes may return `503` until the required upstream state exists

### Unity receiver status
- Unity receiver README is present
- receiver scripts are documented for both weather and energy polling from IOT
- current Unity path is HTTP polling, not live push yet

### What changed relative to the earlier log
The previous progress note was stale.
These items are no longer pending:
- VC `src/main.ts` now exists
- weather runtime is implemented
- weather MQTT publish is implemented
- IOT weather ingest is implemented
- Unity receiver files and setup guidance are documented
- energy and city aggregate slices also exist now

### Current main gaps
- no real automated tests yet
- no verified local end to end run was completed on this machine because an MQTT broker is not installed here
- docs needed a reconciliation pass because planning docs had drifted behind code reality

### Recommended next actions
1. run a full end to end vertical slice with MQTT broker, VC, IOT, and Unity receiver
2. add automated smoke tests for HTTP endpoints and key contract shapes
3. decide whether to keep city demand as derived-in-IOT placeholder logic or move to explicit VC telemetry later
4. document the current implementation status whenever a coding packet lands, so archaeology does not become our primary engineering discipline
