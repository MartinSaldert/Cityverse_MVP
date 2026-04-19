# Cityverse MVP, API Command Surface

## Purpose

This document defines the first command API surface for Cityverse MVP.

Its purpose is to establish how external clients such as:
- the web control UI,
- DT,
- Unity-based visualization tools,
- internal operator tools,
- future automation or AI agents,

can control and query the system in a structured way.

The command surface is primarily concerned with:
- changing simulation state,
- controlling runtime behavior,
- triggering operational actions,
- requesting explicit success or failure results.

## Architectural Rule

For the MVP:
- **commands should use HTTP APIs**,
- **telemetry should use MQTT**,
- **historical and state queries should use HTTP APIs**,
- **live update subscriptions should use WebSocket or similar streaming APIs**.

This means commands should not be disguised as telemetry.

## Scope Split

### VC command surface
VC should own commands that change the simulation.

Examples:
- set time,
- set date,
- change simulation speed,
- pause or resume the simulation,
- force weather overrides,
- start or stop generators,
- enable or disable anomaly scenarios,
- set traffic or occupancy modifiers.

### IOT command surface
IOT should own commands related to ingestion, storage, and replay behavior.

Examples:
- trigger seeded history import,
- start or stop replay mode,
- reset projections,
- rebuild latest-state projections,
- export telemetry slices.

### DT command surface
DT should own commands related to visualization-facing behavior and selected twin operations.

Examples:
- focus a district or entity,
- change active layer or view mode,
- request a scene snapshot,
- refresh graph projections.

## API Style Recommendation

Recommended style for MVP:
- HTTP JSON APIs,
- explicit resource naming,
- command endpoints that clearly describe intent,
- structured success and error responses,
- version prefix from the start.

Recommended API root:
- `/api/v1/`

## Command Design Principles

The command surface should follow these principles:
- commands should target the authoritative owner,
- command names should express intent clearly,
- success or failure should be explicit,
- commands should be idempotent where practical,
- the result of a command should later appear through telemetry and state updates,
- command payloads should be stable and versioned.

## Response Envelope Recommendation

Recommended standard response shape:

```json
{
  "success": true,
  "commandId": "cmd-123",
  "timestampUtc": "2026-04-16T21:00:00Z",
  "target": {
    "service": "vc",
    "entityId": "gas-ccgt-01"
  },
  "result": {
    "status": "accepted"
  },
  "errors": []
}
```

Error example:

```json
{
  "success": false,
  "commandId": "cmd-124",
  "timestampUtc": "2026-04-16T21:00:10Z",
  "target": {
    "service": "vc",
    "entityId": "oil-backup-01"
  },
  "result": null,
  "errors": [
    {
      "code": "generator_not_available",
      "message": "Generator is in maintenance state"
    }
  ]
}
```

## VC Command Surface

## 1. Time and simulation control

### Set simulation time
`POST /api/v1/vc/time/set`

Example request:

```json
{
  "timestampLocal": "2026-01-15T08:30:00",
  "timezone": "Europe/Stockholm"
}
```

Purpose:
- set the city’s simulated date and time directly.

### Set simulation speed
`POST /api/v1/vc/time/speed`

Example request:

```json
{
  "speedMultiplier": 60
}
```

Purpose:
- set the simulation speed multiplier.

### Pause simulation
`POST /api/v1/vc/simulation/pause`

### Resume simulation
`POST /api/v1/vc/simulation/resume`

### Step simulation
`POST /api/v1/vc/simulation/step`

Example request:

```json
{
  "seconds": 60
}
```

Purpose:
- advance the simulation by a discrete amount in paused or debug modes.

## 2. Weather control

### Set weather override
`POST /api/v1/vc/weather/override`

Example request:

```json
{
  "mode": "manual",
  "values": {
    "temperatureC": -8,
    "windSpeedMps": 12,
    "cloudCoverPct": 90,
    "precipitationMmPerHr": 4,
    "solarRadiationWm2": 50
  }
}
```

Purpose:
- manually override weather values for scenario testing.

### Clear weather override
`POST /api/v1/vc/weather/override/clear`

Purpose:
- return weather behavior to normal simulated or data-driven control.

### Set weather preset
`POST /api/v1/vc/weather/preset`

Example request:

```json
{
  "preset": "winter_storm"
}
```

Purpose:
- apply a named weather scenario.

## 3. Generator control

### Start generator
`POST /api/v1/vc/generators/{generatorId}/start`

Purpose:
- request startup of a generator.

### Stop generator
`POST /api/v1/vc/generators/{generatorId}/stop`

Purpose:
- request shutdown of a generator.

### Set generator output target
`POST /api/v1/vc/generators/{generatorId}/target-output`

Example request:

```json
{
  "targetOutputPct": 75
}
```

Purpose:
- set a requested output target for dispatchable generators where supported.

### Set generator mode
`POST /api/v1/vc/generators/{generatorId}/mode`

Example request:

```json
{
  "mode": "automatic"
}
```

Possible values:
- `automatic`
- `manual`
- `maintenance`
- `offline`

## 4. Building and district control

### Set building override mode
`POST /api/v1/vc/buildings/{buildingId}/mode`

Example request:

```json
{
  "mode": "manual"
}
```

### Set building occupancy modifier
`POST /api/v1/vc/buildings/{buildingId}/occupancy-modifier`

Example request:

```json
{
  "multiplier": 1.25
}
```

Purpose:
- raise or lower normal occupancy behavior for scenario testing.

### Set building power modifier
`POST /api/v1/vc/buildings/{buildingId}/power-modifier`

Example request:

```json
{
  "multiplier": 1.15
}
```

Purpose:
- adjust a building’s electricity demand for testing.

### Set district modifier
`POST /api/v1/vc/districts/{districtId}/modifier`

Example request:

```json
{
  "type": "occupancy",
  "multiplier": 0.8
}
```

Purpose:
- apply higher-level scenario modifiers without editing every entity individually.

## 5. Traffic control

### Set traffic level modifier
`POST /api/v1/vc/traffic/modifier`

Example request:

```json
{
  "multiplier": 1.4
}
```

### Trigger traffic incident
`POST /api/v1/vc/traffic/incidents`

Example request:

```json
{
  "segmentId": "seg-1001",
  "type": "accident",
  "severity": "high",
  "durationMinutes": 45
}
```

## 6. Scenario and anomaly control

### Activate scenario
`POST /api/v1/vc/scenarios/{scenarioId}/activate`

### Deactivate scenario
`POST /api/v1/vc/scenarios/{scenarioId}/deactivate`

### Trigger anomaly
`POST /api/v1/vc/anomalies`

Example request:

```json
{
  "type": "power_shortfall",
  "scope": "whole-city",
  "severity": "high"
}
```

## 7. Sensor and telemetry generation control

### Enable or disable synthetic sensor class
`POST /api/v1/vc/sensors/{sensorClass}/mode`

Example request:

```json
{
  "mode": "enabled"
}
```

Possible sensor classes:
- `weather`
- `building_power`
- `building_environment`
- `traffic`
- `generator`
- `city_aggregate`

## VC Query Surface

Commands are only half the story. The UI and DT also need selected query endpoints.

### Get current simulation time
`GET /api/v1/vc/time`

### Get current weather state
`GET /api/v1/vc/weather`

### Get generator state
`GET /api/v1/vc/generators/{generatorId}`

### List generators
`GET /api/v1/vc/generators`

### Get building state
`GET /api/v1/vc/buildings/{buildingId}`

### Get traffic summary
`GET /api/v1/vc/traffic/summary`

### Get simulation summary
`GET /api/v1/vc/summary`

This query surface is useful because operator interfaces need authoritative snapshots, not just the consequences that eventually drift out through telemetry.

## IOT Command Surface

## 1. Seed and replay operations

### Import seeded historical data
`POST /api/v1/iot/history/import`

Example request:

```json
{
  "datasetId": "seed-2025-full-year",
  "replaceExisting": false
}
```

### Start replay
`POST /api/v1/iot/replay/start`

Example request:

```json
{
  "datasetId": "seed-2025-full-year",
  "fromUtc": "2025-01-01T00:00:00Z",
  "speedMultiplier": 120
}
```

### Stop replay
`POST /api/v1/iot/replay/stop`

## 2. Projection and state maintenance

### Rebuild latest-state projections
`POST /api/v1/iot/projections/rebuild`

### Reset latest-state projection for an entity
`POST /api/v1/iot/projections/entities/{entityId}/reset`

## 3. Export and maintenance operations

### Export telemetry slice
`POST /api/v1/iot/export`

Example request:

```json
{
  "entityType": "building",
  "entityId": "bldg-001",
  "fromUtc": "2026-01-01T00:00:00Z",
  "toUtc": "2026-01-07T00:00:00Z",
  "format": "json"
}
```

### Purge a test dataset
`POST /api/v1/iot/datasets/{datasetId}/purge`

Use with caution, obviously.

## IOT Query Surface

### Get latest state for an entity
`GET /api/v1/iot/state/{entityType}/{entityId}`

### Query telemetry history
`GET /api/v1/iot/history?entityType=building&entityId=bldg-001&metric=power_demand_kw&fromUtc=...&toUtc=...`

### Get aggregate metrics
`GET /api/v1/iot/aggregates?scope=whole-city&metric=total_co2_kg_per_hour`

### Get replay status
`GET /api/v1/iot/replay/status`

### Get ingestion health
`GET /api/v1/iot/health/ingestion`

## DT Command Surface

## 1. View and focus operations

### Focus entity
`POST /api/v1/dt/focus/entity`

Example request:

```json
{
  "entityType": "building",
  "entityId": "bldg-001"
}
```

### Focus district
`POST /api/v1/dt/focus/district`

### Set view mode
`POST /api/v1/dt/view-mode`

Example request:

```json
{
  "mode": "co2_heatmap"
}
```

Possible modes:
- `physical`
- `semantic`
- `power`
- `co2_heatmap`
- `weather`
- `traffic`

### Set layer visibility
`POST /api/v1/dt/layers/{layerId}`

Example request:

```json
{
  "visible": true
}
```

## 2. Twin and graph refresh operations

### Refresh twin projection
`POST /api/v1/dt/twins/{entityId}/refresh`

### Refresh graph projection
`POST /api/v1/dt/graph/refresh`

## DT Query Surface

### Get entity twin
`GET /api/v1/dt/twins/{entityId}`

### Query graph relationships
`GET /api/v1/dt/graph/relationships?entityId=bldg-001`

### Get scene state bundle
`GET /api/v1/dt/scene/state?scope=whole-city`

### Get active view state
`GET /api/v1/dt/view-state`

## Authentication and Authorization Note

For MVP on one Windows machine, this can start simply.

But the API surface should still be designed so it can later support:
- operator authentication,
- service-to-service authentication,
- role separation,
- auditability.

Recommended future roles:
- `operator`
- `simulation_admin`
- `viewer`
- `automation_agent`

## Idempotency Guidance

Some commands should be idempotent where practical.

Examples:
- setting simulation speed to 60 twice should not create two different side effects,
- setting a generator mode to `automatic` twice should be safe,
- pausing an already paused simulation should return a clear and harmless response.

This makes the system easier to automate.

## Audit and Observability Guidance

Every command should be auditable.

Recommended command log fields:
- `commandId`
- `timestampUtc`
- `actorType`
- `actorId`
- `targetService`
- `targetEntityId`
- `commandName`
- `payloadHash` or payload snapshot where safe
- `resultStatus`
- `errorCode` if failed

This is valuable for debugging, replay, and operator trust.

## Recommended Decision

Recommended decision for now:
- use `/api/v1/` versioned HTTP APIs,
- let VC own simulation-changing commands,
- let IOT own history/replay/projection maintenance commands,
- let DT own view and twin-projection commands,
- keep commands explicit and response-oriented,
- let resulting changes flow back through telemetry and state updates rather than treating command responses as the only truth.

## Suggested Follow-Up Docs

After this, the next useful docs are:
- `docs/IOT_STORAGE_MODEL.md`
- `docs/DT_STATE_AND_GRAPH_MODEL.md`
- `docs/TELEMETRY_MESSAGE_SCHEMA.md`
- `docs/EXECUTABLE_BOUNDARY_SPEC.md`

## Short conclusion

A good command surface makes ownership obvious:
- VC changes the city,
- IOT manages ingest and history behavior,
- DT manages how the twin is projected and viewed.

That gives us a control plane that is explicit, debuggable, and suitable for both human operators and future Claude-driven implementation work.
