# Cityverse MVP, Claude Packet: IOT Monitoring UI v1

Date: 2026-04-20
Owner: The Sage
Target implementer: Claude
Status: ready for delegation

## Purpose

Build the first IOT monitoring UI based on the current and intended role of IOT as the telemetry ingest, latest-state, and observability layer between VC and DT/Unity.

This UI is not a replacement for the VC operator UI.
The VC UI controls the simulation.
The IOT UI should show what data is arriving, whether flows are healthy, and what the current ingested state looks like.

The first version should feel like a compact telemetry operations dashboard.

## Architectural basis

Use these docs as the source of truth:
- `docs/IOT_ARCHITECTURE.md`
- `docs/IOT_IMPLEMENTATION_PLAN.md`
- `docs/IOT_BROKER.md`
- `docs/IOT_STORAGE_MODEL.md`

Important direction:
- IOT should be easy to extend with new flows
- IOT should support historical memory later
- IOT should expose flow health and freshness
- this UI should help make the broker layer visible and credible

## Current implementation context

The system currently has IOT flows for at least:
- weather
- energy
- buildings

IOT already exposes current-state endpoints for these, and buildings now arrive via MQTT from VC.

What is still missing is a unified IOT-facing dashboard showing:
- broker/service health
- flow freshness
- current availability per flow
- summary state for downstream confidence

## Scope

### In scope
- add a simple IOT web UI served by the IOT app
- show service health and flow health
- show last-update / freshness indicators for weather, energy, and buildings
- show current-state summary cards for those flows
- add backend endpoints or summary helpers as needed to support the UI cleanly
- keep implementation light and additive
- add tests where practical

### Out of scope
- full historical charts
- persistent storage implementation
- replay controls
- start/stop flow controls if not already supported
- frontend frameworks
- major design systems

## Product requirements

The UI should make it immediately obvious:
- whether IOT is alive
- whether MQTT ingest is alive
- whether weather data is arriving
- whether energy data is arriving
- whether building data is arriving
- how fresh the most recent data is
- what the latest current state looks like at a glance

The UI should feel like an observability dashboard for the broker layer, not another raw JSON debug page.

## Recommended backend additions

### 1. Flow status model
Introduce a small internal flow-status concept if it does not already exist.

For each flow, track at least:
- `flowKey`
- `enabled` or assumed enabled
- `hasData`
- `lastPayloadTimestamp`
- `lastIngestedAt`
- `freshnessSeconds`
- `status` such as `ok`, `stale`, `no_data`, `error`
- optional `messageCount`
- optional `lastError`

For MVP, this can remain in memory.

### 2. Summary endpoint
Add a clean summary endpoint, for example:
- `GET /ops/summary`

Suggested response shape:
```json
{
  "ok": true,
  "data": {
    "service": "cityverse-iot",
    "brokerConnected": true,
    "flows": [
      {
        "flowKey": "weather",
        "status": "ok",
        "hasData": true,
        "lastPayloadTimestamp": "2026-04-20T16:20:00.000Z",
        "lastIngestedAt": "2026-04-20T16:20:01.000Z",
        "freshnessSeconds": 2
      }
    ]
  }
}
```

If you prefer separate endpoints such as `/flows/current`, that is acceptable, but keep the surface coherent and compact.

### 3. Current summaries
Use existing current endpoints where practical:
- `/weather/current`
- `/energy/current`
- `/buildings/current`
- `/buildings/summary`
- `/city/current` if valid

If `/city/current` is not yet architecturally correct because it still derives demand from old placeholder logic, do not overstate it in the UI.
Either fix it if trivial, or label it carefully / omit it until trustworthy.

## UI requirements

### Main sections
The page should include:
- service status header
- flow health cards
- current-state summary cards
- optional recent detail panels

### Flow health cards
Show one card for each of:
- weather
- energy
- buildings

Each card should show at least:
- flow name
- status
- has data or not
- last payload time
- freshness indicator

If easy, include:
- last ingest time
- message count

### Current-state summary cards
Show concise operator-friendly summaries for:
- weather
- energy
- buildings

Examples:
- weather: condition, temperature, wind, daylight/day state
- energy: solar, wind, total renewable
- buildings: building count, total demand, top contributor

### Visual tone
Keep it simple, readable, and operational.
Avoid giant raw JSON blocks as the primary UI.
Small debug blocks are acceptable if secondary.

### Freshness behavior
Use simple freshness labeling, for example:
- `ok` if recent
- `stale` if no update within a threshold
- `no data` if no payload yet

Thresholds can be simple and static for MVP.

## Suggested route placement

If the IOT app already serves a root page or no page, add:
- `GET /` for the IOT dashboard

Keep the operator UI and IOT UI conceptually separate.
The IOT UI should clearly say it is the IOT monitoring dashboard.

## Tests

Add or update tests where practical.

Minimum useful coverage:
- ops/summary endpoint returns flow entries
- flow summary reflects seeded current-state setup in tests
- root UI route responds successfully if you add it

Do not overbuild UI snapshot testing.
Focus on backend shape and route sanity.

## Suggested implementation order

1. add or standardize flow status tracking in IOT ingest paths
2. add summary endpoint(s)
3. build the simple IOT dashboard HTML page
4. wire the page to fetch summary/current endpoints
5. add tests

## Acceptance criteria

This packet is complete when:
- IOT serves a monitoring UI page
- the UI shows weather, energy, and building flow health
- the UI shows freshness or stale/no-data state per flow
- the UI shows current summaries in a readable form
- backend summary endpoint exists and is clean
- build passes
- tests pass

## Non-goals and anti-goals

Do not:
- build charts yet unless trivially easy
- add a frontend framework
- hide uncertainty behind fake polished numbers
- present `/city/current` as authoritative if it is still based on outdated logic
- turn this into the replay UI already

## Deliverable expectations from Claude

Claude should return:
- changed files
- backend summary endpoint shape
- flow health model used
- notable assumptions
- recommended next step for historical charts and stats

## Short conclusion

The mission is to make IOT visible as a real middle layer.
When someone opens the page, they should immediately understand whether the broker layer is healthy, what data is flowing, and what the city currently looks like from IOT’s point of view.