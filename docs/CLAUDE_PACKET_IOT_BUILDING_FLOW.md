# Cityverse MVP, Claude Packet: Move Building State onto the VC -> IOT -> Unity Path

Date: 2026-04-20
Owner: The Sage
Target implementer: Claude
Status: ready for delegation

## Purpose

Correct the current building overlay architecture so Unity no longer reads building state directly from VC.

Martin explicitly wants the system to mirror the intended real-world flow:
- Real city -> IOT broker -> Digital twin

So in Cityverse the architecture must be:
- VC -> IOT -> DT/Unity

That means the current direct Unity -> VC building-state path is not acceptable as the long-term integration shape.
This packet moves building telemetry and building current-state consumption onto the proper architecture.

## Product direction

We already have:
- VC producing weather and energy state
- MQTT transport into IOT for weather and energy
- Unity consuming weather and energy from IOT
- building-driven demand and occupancy in VC
- Unity building overlay scripts currently pointing at VC

What must happen now:
- VC must publish building telemetry
- IOT must ingest building telemetry and maintain latest building state
- IOT must expose building current-state endpoints
- Unity building overlays must read from IOT, not VC

This is not optional polish. This is architectural correctness.

## Scope

### In scope
- add building telemetry topic(s) and schemas as needed
- publish building state from VC over MQTT
- ingest building state in IOT
- expose current building state from IOT over HTTP
- retarget Unity `BuildingsApiClient` and docs to use IOT service
- keep changes additive where practical
- update tests accordingly

### Out of scope
- historical building persistence
- replay queries
- flow control UI for IOT
- WebSocket push updates
- large refactors of weather/energy architecture

## Architectural rules

1. Unity building overlays must not depend on VC endpoints.
2. IOT becomes the sole Unity-facing source of building live state.
3. The pattern should match existing weather/energy flow as closely as reasonable.
4. Prefer additive changes over breaking ones.
5. Keep the route names clear and consistent.

## Current implementation references

Relevant current files:
- `apps/cityverse-vc/src/buildings/service.ts`
- `apps/cityverse-vc/src/buildings/routes.ts`
- `apps/cityverse-vc/src/energy/telemetry.ts`
- `apps/cityverse-iot/src/weather/ingest.ts`
- `apps/cityverse-iot/src/energy/ingest.ts`
- `apps/cityverse-iot/src/server.ts`
- `packages/contracts/src/mqtt/topics.ts`
- `packages/contracts/src/buildings/summary.ts`
- `unity/cityverse-receiver/BuildingsApiClient.cs`
- `unity/cityverse-receiver/README.md`

## Part 1, contracts and telemetry topic

Add a building telemetry topic to the shared MQTT topics.

Recommended addition in `packages/contracts/src/mqtt/topics.ts`:
- `buildingTelemetry: 'cityverse/buildings/telemetry'`

If helpful, create an explicit building telemetry schema. You may reuse the current building-demand schema if that is already the correct transport shape, but make the intent clear.

Recommended shared shape for each building telemetry item:
- `id`
- `label`
- `type`
- `scheduleClass`
- `occupancyCount`
- `occupancyCapacity`
- `currentDemandKw`
- `baseDemandKw`
- `occupancyFactor`
- `weatherFactor`
- `updatedAt`

Decide whether the telemetry payload should be:
- one message per building, or
- one message containing the full building list

Recommendation for MVP simplicity:
- publish the full building list as one payload on each interval

That keeps ingest and projection simple.

## Part 2, VC building telemetry publisher

Add a building telemetry publisher in VC following the existing weather/energy pattern.

Suggested file:
- `apps/cityverse-vc/src/buildings/telemetry.ts`

Required behavior:
- connect to MQTT broker using existing env pattern
- publish building current-state list on interval
- use shared topic helper
- validate or shape payload with shared schema before publish

Suggested integration:
- instantiate in `apps/cityverse-vc/src/server.ts`
- start on `onReady`
- stop on `onClose`

Do not remove the current VC building routes yet if they help operator UI, but Unity must stop using them.

## Part 3, IOT ingest and latest-state projection

Add building ingest to IOT.

Suggested files:
- `apps/cityverse-iot/src/buildings/ingest.ts`
- `apps/cityverse-iot/src/buildings/state.ts`
- `apps/cityverse-iot/src/buildings/routes.ts`

Required behavior:
- subscribe to building telemetry topic
- validate payload
- keep latest building state in memory
- expose HTTP current-state endpoints

Recommended endpoints:
- `GET /buildings/current`
- `GET /buildings/summary`

Optional if useful:
- `GET /buildings/:id/current`

### Important route direction
Use IOT-style routes, not VC-style routes.
The existing IOT pattern is:
- `/weather/current`
- `/energy/current`
- `/city/current`

So building routes should match that style:
- `/buildings/current`
- `/buildings/summary`

Do not expose Unity to `/api/buildings/current` on VC anymore.

## Part 4, IOT server wiring

Update `apps/cityverse-iot/src/server.ts` so it:
- registers building routes
- starts building ingest on server ready

Keep behavior consistent with weather and energy ingest startup.

## Part 5, Unity retargeting

Update Unity building receiver scripts so they consume from IOT.

Required changes:
- `BuildingsApiClient.cs` should point to IOT service URL by default, not VC
- building request path should use the IOT route, preferably `/buildings/current`
- README/setup text must clearly say building overlays use IOT

### Important product rule
Unity should now consume:
- weather from IOT
- energy from IOT
- buildings from IOT

No architectural cheating.

## Part 6, docs and setup guidance

Update `unity/cityverse-receiver/README.md` and any other relevant docs.

Required correction:
- remove or replace any guidance saying the building overlay uses VC directly
- document that the base URL for BuildingsApiClient should be the IOT service, e.g. `http://localhost:3002`

If there is still a VC-side building route for operator UI or debugging, make that distinction explicit.

## Part 7, tests

Add or update tests where practical.

Minimum useful coverage:
- contracts include the building telemetry topic
- VC can produce building payload shape suitable for telemetry
- IOT building endpoints return 503 before telemetry arrives if that is the chosen pattern
- IOT building endpoints return occupancy and demand after state is seeded
- Unity-facing route path assumption is now IOT-style, not VC-style

Reuse the existing smoke-test style where possible.

## Suggested implementation shape

### Telemetry payload recommendation
Publish one full building list payload per interval.
That is simpler than per-building topics for this MVP.

Suggested MQTT payload shape:
```json
{
  "updatedAt": "2026-04-20T10:00:00.000Z",
  "buildings": [
    {
      "id": "villa-a",
      "label": "Villa A",
      "type": "villa",
      "scheduleClass": "residential",
      "occupancyCount": 3,
      "occupancyCapacity": 4,
      "currentDemandKw": 18.4,
      "baseDemandKw": 18,
      "occupancyFactor": 0.9,
      "weatherFactor": 1.13,
      "updatedAt": "2026-04-20T10:00:00.000Z"
    }
  ]
}
```

If a simpler schema is already available, keep it pragmatic.

## Acceptance criteria

This packet is complete when:

1. VC publishes building state over MQTT.
2. IOT ingests and stores the latest building state.
3. IOT exposes building current-state endpoints.
4. Unity `BuildingsApiClient` points to IOT and uses IOT route paths.
5. README/setup guidance says building overlays use IOT, not VC.
6. Build passes.
7. Tests pass.
8. The architecture now matches VC -> IOT -> Unity for buildings.

## Non-goals and anti-goals

Do not:
- rewrite the whole service architecture
- add persistence unless truly required
- keep Unity directly bound to VC for convenience
- add per-building network polling from Unity

## Suggested implementation order

1. add MQTT topic and building telemetry schema if needed
2. add VC building telemetry publisher
3. add IOT building ingest and state store
4. add IOT building routes
5. retarget Unity client and docs to IOT
6. update tests

## Deliverable expectations from Claude

Claude should return:
- changed files
- telemetry shape chosen
- route paths exposed by IOT
- Unity retargeting details
- any assumptions or follow-up recommendations

If a tradeoff appears, favor:
- architectural correctness
- additive changes
- consistency with existing weather/energy flow
- simplicity

Over:
- expedient shortcuts
- clever abstractions that obscure the path

## Short conclusion

The mission is to stop cheating. Building state must travel through IOT before Unity sees it. That is the system we are actually trying to build, so that is the system the code should now reflect.