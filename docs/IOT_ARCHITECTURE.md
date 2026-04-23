# Cityverse MVP, IOT Architecture

Date: 2026-04-20
Status: active architecture direction

## Purpose

This document upgrades the IOT design from a simple live-state relay into a more realistic and extensible IoT platform layer for Cityverse MVP.

IOT should behave like a believable telemetry platform between VC and DT/Unity.
Its role is not merely to forward a few values. It should become the system responsible for ingest, normalization, historical memory, latest-state projection, flow supervision, and operational visibility.

The target architecture is:
- VC as the authoritative simulation runtime and synthetic telemetry source
- IOT as the authoritative ingest, storage, projection, and observability runtime
- DT and Unity as downstream consumers of live and historical state

That means the intended data path is:
- VC -> IOT -> DT/Unity

Not:
- VC -> Unity directly

## Design goals

The IOT architecture should satisfy the following goals:
- easy to add or remove data flows
- realistic enough to resemble a production IoT backend
- support both live data and historical queries
- expose current-state projections efficiently
- support charts, trend analysis, and statistics later
- support operational monitoring of ingest health and flow freshness
- remain simple enough to run on one Windows machine for MVP
- stay portable enough for later remote or cloud deployment

## Core responsibilities

IOT must own:
- MQTT ingest from VC
- schema validation
- normalization of telemetry payloads
- append-oriented telemetry history
- latest-state projections
- flow registry and flow status tracking
- query APIs for current state, history, and summaries
- live-update fan-out later
- operational monitoring surfaces
- dataset context for seeded history versus live runtime data

It should not own:
- simulation truth
- command execution for simulation systems
- scene composition logic
- Unity-specific visualization logic

## Architectural model

IOT should use a layered model with five main concerns.

### 1. Flow registry
This defines what data flows exist and how IOT handles them.

Each flow should conceptually declare:
- flow key
- source topic or ingress path
- schema validator
- latest-state projection behavior
- historical persistence behavior
- summary/aggregation behavior
- health/freshness behavior
- whether the flow is enabled or disabled

For the current MVP, the first flows are:
- weather
- energy
- buildings

Later flows may include:
- generators
n- traffic
- CO2
- alerts
- device health

The important design rule is that adding a new flow should feel like registering another pipeline, not editing hardcoded special cases across the entire service.

### 2. Telemetry history store
This is the append-oriented memory of what happened over time.

It stores timestamped events or snapshots for each flow and entity.
This is the source for:
- history queries
- charts
- trend analysis
- replay later
- debugging and auditing

For MVP, a relational or hybrid local database is fine.
SQLite is an acceptable starting point if we want low setup cost on one Windows machine, but the schema should be designed so migration to PostgreSQL later is straightforward.

### 3. Latest-state projection store
This stores what is currently true now, or rather what IOT currently believes to be true based on the latest ingested telemetry.

This is what downstream consumers usually want for:
- current weather
- current building state
- current city summary
- live operator panels
- digital twin current overlays

The projection store should remain separate in concept from the historical event store.
History remembers what happened. Projection answers what is current now.

### 4. Summary and aggregation layer
This derives useful higher-level outputs from the latest state and eventually from history.

Examples:
- current whole-city demand
- building demand summary by type
- top load contributors
- latest renewable balance
- daily or hourly rollups later
- trend stats later

These should be rebuildable derived views, not the only source of truth.

### 5. Monitoring and operations layer
This is what turns IOT from a hidden transport layer into an observable platform.

It should track:
- whether each flow is enabled
- whether each flow is receiving data
- last message ingest time
- last payload timestamp
- message counters
- validation failures
- stale-data conditions
- broker connection health
- current projection availability

This is the foundation for the future IOT UI.

## Data flow strategy

The recommended runtime pipeline for each flow is:
1. VC publishes telemetry over MQTT
2. IOT ingests the message
3. IOT validates schema and rejects malformed data
4. IOT normalizes payload shape if needed
5. IOT writes the event into telemetry history
6. IOT updates the latest-state projection for that flow/entity
7. IOT updates summary views or counters as needed
8. IOT exposes the resulting state and metrics through HTTP APIs
9. IOT later emits live update streams to DT/UI subscribers

This pipeline should be reusable per flow.

## Flow model recommendation

The current IOT implementation already contains separate weather, energy, and building logic, but it is still rather hand-wired.
The architecture should evolve toward a light flow-registration model.

A flow registration concept should describe, at minimum:
- `flowKey`
- `topic`
- `ingestSchema`
- `historyWrite`
- `projectionWrite`
- `summaryBuilder`
- `healthTracker`
- `routesExposed`

For the first MVP UI and backend evolution, it is acceptable if this remains an internal pattern rather than a fully generic plugin framework.
The important thing is to shape the code so new flows are easy to add without spreading edits everywhere.

## Storage direction

The current in-memory latest-state approach is acceptable for the current slice, but it is not enough for the IOT standard Martin now wants.
The intended storage model should support:
- append-only history records
- latest-state projections
- flow health metadata
- dataset/session tagging for live versus seeded history

### Recommended practical MVP storage path
Phase 1:
- keep in-memory latest-state projections for speed of iteration
- add an append-oriented historical store with portable schema
- use a local database suitable for Windows MVP

Phase 2:
- add rollups and trend-oriented query helpers
- add retention rules and rebuildable summaries

Phase 3:
- add replay and seeded-history management

## Query surface recommendation

IOT should eventually expose four broad kinds of HTTP/API queries.

### 1. Current-state queries
Examples:
- `/weather/current`
- `/energy/current`
- `/buildings/current`
- `/city/current`

### 2. Summary queries
Examples:
- `/buildings/summary`
- `/city/summary`
- `/flows/summary`
- `/stats/current`

### 3. History queries
Examples:
- `/history/weather?...`
- `/history/buildings?...`
- `/history/energy?...`
- `/history/city?...`

These should support:
- time windows
- entity or flow filters
- resolution or aggregation window later

### 4. Operations and flow queries
Examples:
- `/flows`
- `/flows/current`
- `/flows/{id}`
- `/ops/health`
- `/ops/errors`
- `/ops/stats`

The future IOT UI should mainly consume this category plus current-state summaries.

## Monitoring UI target

The first IOT UI should not try to replicate VC controls.
It should behave like a telemetry operations and observability panel.

Its first responsibilities should be:
- show broker and service health
- show whether each flow is active
- show last received time per flow
- show freshness and stale conditions
- show current payload availability per flow
- show current summary cards for weather, energy, buildings, and city
- show message counters and validation errors when practical

Later versions can add:
- start/stop flow controls
- history charts
- data rate charts
- validation error inspection
- dataset and replay controls

## Data lake style memory direction

Martin wants the IOT service to behave more like a real IoT broker and data platform, with old data available for charts, stats, and inspection.
That means the architecture must support a data-lake-style memory, even if the first MVP implementation is more modest underneath.

For Cityverse MVP, this should mean:
- old telemetry is retained in historical storage
- live runtime data is appended rather than replacing the past
- current-state endpoints are projections, not the only store
- history can later be queried for charts and statistics
- the UI can eventually show both current state and historical trends

This does not require a literal cloud data lake product on day one.
It requires the same conceptual separation between history and projections.

## Relationship to docs already in the repo

This architecture builds on and upgrades:
- `docs/IOT_IMPLEMENTATION_PLAN.md`
- `docs/IOT_STORAGE_MODEL.md`
- `docs/IOT_BROKER.md`
- `docs/RESEARCH_06_IOT_DATA_TRANSMISSION_AND_CONSUMPTION_ARCHITECTURE.md`

Those docs contain good foundations, but they still describe IOT more as an ingest-and-query executable than as a flow-oriented, observable, history-capable platform.
This document is meant to sharpen that direction.

## Recommended implementation phases

### Phase A, current-state and flow observability
- keep existing flows working
- standardize weather, energy, buildings on the same pattern
- add flow status tracking
- add a first IOT monitoring UI

### Phase B, historical storage foundation
- add append-oriented telemetry history
- add dataset/session context for live data
- add first history query endpoints

### Phase C, chart and stats support
- add summary endpoints for trends and counts
- add rollup queries
- surface charts in the IOT UI

### Phase D, flow control and replay
- enable per-flow control state
- add pause/resume behavior where appropriate
- add replay and seeded-history handling

## Architectural guardrails

The following rules should be kept explicit:
- VC remains the authoritative source of simulated truth
- IOT remains the authoritative source of telemetry ingest and stored history
- DT/Unity consume from IOT rather than bypassing it
- latest-state projections are derived from ingest, not magic shared-memory shortcuts
- adding a new flow should be structurally easy
- historical memory is append-oriented
- operational visibility is a first-class requirement, not an afterthought

## Short conclusion

IOT should evolve from a thin relay into a believable telemetry platform.
That means:
- clear flow registration patterns
- append-oriented history
- latest-state projections
- operational monitoring
- easy extension for new data streams
- and a UI that shows what the platform is doing, not just that it exists.

In short, IOT should become boring infrastructure in the best possible way: capable, inspectable, and difficult to surprise for stupid reasons.