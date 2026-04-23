# Cityverse MVP, Claude Packet: Fix IOT City Summary and Add History/Stats Groundwork

Date: 2026-04-20
Owner: The Sage
Target implementer: Claude
Status: ready for delegation

## Purpose

Implement the next IOT backend correction and groundwork step.

This packet has two goals:

1. fix IOT city summary correctness so `/city/current` and `/demand/current` reflect real ingested building demand rather than the old placeholder weather-derived demand formula
2. lay the first practical groundwork for historical memory and stats so the IOT layer can grow toward charts, trend views, and a data-lake-style memory model

This is about making the IOT backend more truthful and more useful.

## Problem statement

The project now has:
- VC publishing weather, energy, and building telemetry
- IOT ingesting weather, energy, and building telemetry
- Unity and UI increasingly consuming from IOT
- a first IOT monitoring dashboard

But the current IOT city summary logic is still stale in architecture terms.
It appears to derive demand from old weather-based placeholder logic instead of using the real ingested building demand flow.
That undermines the credibility of the IOT layer.

At the same time, IOT still lacks the first real history/stats foundation needed for old data, charts, and real broker-style observability.

## Scope

### In scope
- fix `/demand/current` in IOT to derive from latest ingested building telemetry
- fix `/city/current` in IOT to use ingested building demand plus ingested weather and energy
- add a first lightweight history/stats groundwork path
- keep the history/stats groundwork small but real enough to support later chart work
- add/update tests

### Out of scope
- full database persistence if that becomes too large for this packet
- full replay system
- chart UI implementation
- large schema redesigns
- full retention policy system

## Architectural rules

1. IOT current-state summaries must be based on ingested telemetry, not leftover VC-like formulas.
2. Historical groundwork should be additive and simple.
3. Prefer a small but honest implementation over a grand but fake abstraction.
4. If storage must stay in-memory for this packet, structure it so persistence can replace it later.
5. Keep route naming consistent with current IOT patterns.

## Current implementation references

Relevant files:
- `apps/cityverse-iot/src/city/state.ts`
- `apps/cityverse-iot/src/city/routes.ts`
- `apps/cityverse-iot/src/buildings/state.ts`
- `apps/cityverse-iot/src/weather/state.ts`
- `apps/cityverse-iot/src/energy/state.ts`
- `apps/cityverse-iot/src/ops/flowRegistry.ts`
- `docs/IOT_ARCHITECTURE.md`
- `docs/IOT_STORAGE_MODEL.md`

## Part 1, fix IOT demand summary

Replace the old placeholder logic in `apps/cityverse-iot/src/city/state.ts`.

### Required outcome
`getLatestDemand()` should derive demand from the latest ingested building telemetry payload.

That means:
- read latest building state from `apps/cityverse-iot/src/buildings/state.ts`
- sum `currentDemandKw` across buildings
- use the appropriate latest timestamp
- return a proper `DemandSummary`

If no building telemetry has arrived yet, demand should be unavailable.

### Important rule
Do not keep the old weather-based demand formula in the active path.
It was fine for early slicing, but now it is misleading.

## Part 2, fix IOT city summary

Update `getLatestCity()` in `apps/cityverse-iot/src/city/state.ts`.

### Required outcome
`/city/current` should now combine:
- latest weather summary from IOT ingest
- latest energy summary from IOT ingest
- latest demand summary derived from ingested building telemetry

Balance should be:
- `energy.totalRenewableKw - demand.demandKw`

Use the most coherent updated timestamp available.

### Important note
Do not fabricate a city summary if building demand is missing.
Return null and allow the route to return 503 until required upstream state exists.

## Part 3, first history groundwork

Add the first small history/stats foundation.

### Goal
Create a modest, append-oriented in-memory history buffer that tracks recent ingest records per flow.
This is not the final data lake, but it is the first real step toward one.

### Recommended shape
Create a lightweight history module, for example:
- `apps/cityverse-iot/src/history/store.ts`

It should support at minimum:
- append record by flow key
- fetch recent records by flow key
- maybe fetch simple counts or recent timestamps

Recommended record fields:
- `flowKey`
- `recordedAt`
- `payloadTimestamp`
- `summary` or compact payload snapshot

Keep the payloads compact. You do not need to store every raw nested structure forever in this packet.
The goal is recent history and stats groundwork, not full durability yet.

### Integration
On each successful ingest for weather, energy, and buildings, append a recent-history record.

## Part 4, stats endpoint groundwork

Add a small endpoint for recent stats or history summary.

Recommended endpoint:
- `GET /ops/stats`

Suggested response shape:
```json
{
  "ok": true,
  "data": {
    "flows": [
      {
        "flowKey": "weather",
        "messageCount": 12,
        "recentRecordCount": 12,
        "latestPayloadTimestamp": "2026-04-20T18:20:00.000Z"
      }
    ]
  }
}
```

Optional additions if easy:
- recent ingest timestamps
- oldest record in buffer
- buffer size per flow

Do not overbuild this. It is groundwork for later chart/stat UI work.

## Part 5, optional recent-history endpoint

If it stays clean, add a minimal recent-history endpoint such as:
- `GET /ops/history/:flowKey`

This can return the last N records from the in-memory history buffer.

This is optional but useful if it comes cheaply.
If added, keep it clearly framed as recent in-memory history, not final historical storage.

## Part 6, IOT monitoring UI support

If trivial and clean, you may update the IOT monitoring UI so it can later use `/ops/stats`, but do not let UI changes dominate this packet.
The priority is correctness and groundwork in the backend.

## Part 7, tests

Add or update tests where practical.

Minimum useful coverage:
- `/demand/current` now reflects seeded building telemetry in IOT
- `/city/current` uses ingested building demand rather than old placeholder behavior
- `/ops/stats` returns entries for weather, energy, and buildings
- history/stat groundwork updates when ingest is recorded

If you add a recent-history endpoint, test that too.

## Suggested implementation order

1. fix IOT demand summary to use building telemetry
2. fix IOT city summary to use real ingested building demand
3. add lightweight history store
4. append recent-history records in ingest paths
5. add `/ops/stats`
6. optionally add recent-history endpoint
7. update tests

## Acceptance criteria

This packet is complete when:
- IOT `/demand/current` is derived from ingested building telemetry
- IOT `/city/current` uses ingested weather, energy, and building demand
- old placeholder weather-derived demand is removed from the active path
- a small recent-history/stats groundwork exists
- `/ops/stats` returns useful flow stats
- build passes
- tests pass

## Non-goals and anti-goals

Do not:
- build full persistence if it becomes a major detour
- fake a data lake with decorative naming only
- keep old placeholder demand logic live beside the corrected path
- bloat this packet into chart UI work

## Deliverable expectations from Claude

Claude should return:
- changed files
- how demand/city correctness was fixed
- history/stats shape chosen
- whether any UI endpoints were added
- assumptions and follow-up recommendations for real persistence next

## Short conclusion

The mission is to make IOT tell the truth about the city now, and begin to remember what happened a moment ago.
That is the first real step from relay service toward broker platform.