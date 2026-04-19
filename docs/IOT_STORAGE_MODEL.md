# Cityverse MVP, IOT Storage Model

## Purpose

This document defines the first storage model for **IOT** in Cityverse MVP.

Its purpose is to describe how IOT should store:
- incoming telemetry,
- latest-known state,
- seeded historical data,
- replayable datasets,
- aggregate and projection data,
- audit and command-adjacent operational records where useful.

The storage model should support the project goals of:
- realistic IoT behavior,
- one year of seeded fake historical data,
- live recording while the simulation runs,
- efficient current-state queries,
- historical analysis and replay,
- DT and UI consumption,
- future remote deployment.

## Executive Summary

The recommended first-pass IOT storage model is a **hybrid model** with distinct storage concerns:

1. **Telemetry history store** for time-series events
2. **Latest-state projection store** for current known values
3. **Entity metadata and identity store** for assets and sensor definitions
4. **Replay and seeded dataset store** for imported or generated synthetic historical data
5. **Operational/audit store** for replay jobs, projection rebuilds, ingest health, and command-related events

This is the strongest MVP approach because one single table or one single document type will become miserable surprisingly quickly.

## Architectural Position

IOT sits between VC and DT.

That means its storage layer must support two broad consumption styles:

### 1. Event-style and historical access
Used for:
- charts,
- analytics,
- replay,
- anomaly detection,
- export,
- AI training data,
- historical comparisons.

### 2. Current-state access
Used for:
- live dashboards,
- DT scene state,
- current city summaries,
- operator UI views,
- current building, generator, traffic, and weather values.

These should not be forced into the same storage shape.

## Storage Domains

## 1. Telemetry history store

### What it stores
Time-series telemetry and event records.

Examples:
- building power demand,
- energy usage over time,
- weather readings,
- generator output,
- traffic counts,
- CO2 metrics,
- notable event records such as generator started, storm started, anomaly detected.

### Why it exists
This is the core historical record of the city.

It must support:
- time-window queries,
- filtering by entity or metric,
- replay,
- export,
- aggregation.

### Recommended shape
A time-series-oriented storage model.

For MVP, this could be implemented with either:
- a relational database table designed for time-series access,
- a time-series database,
- or SQLite/Postgres-style implementation with appropriate indexing if we keep the initial system modest.

### Recommended logical fields
- `recordId`
- `timestampUtc`
- `sourceTimestampUtc`
- `cityId`
- `entityType`
- `entityId`
- `sensorId`
- `metricName`
- `value`
- `unit`
- `quality`
- `sourceType`
- `datasetId`
- `schemaVersion`
- `ingestTimestampUtc`

### Notes
- `timestampUtc` should represent the logical time of the measurement in the city.
- `ingestTimestampUtc` should record when IOT stored it.
- `datasetId` helps separate seeded history from live simulation data.

## 2. Latest-state projection store

### What it stores
The most recent known state for important entities and metrics.

Examples:
- current weather,
- current building demand,
- current battery state of charge,
- current generator mode and output,
- current city aggregate CO2,
- current traffic congestion level,
- current occupancy estimate.

### Why it exists
DT and operator views need current state quickly.

Reading the latest value by scanning a telemetry history table for everything would be tedious, slower, and faintly vindictive.

### Recommended shape
A projection table or state document store keyed by entity and metric scope.

### Recommended logical fields
- `projectionId`
- `cityId`
- `entityType`
- `entityId`
- `projectionType`
- `stateJson`
- `lastSourceTimestampUtc`
- `lastIngestTimestampUtc`
- `datasetContext`
- `schemaVersion`

### Projection examples
#### Building state projection
Contains:
- current demand,
- current occupancy,
- battery SOC,
- current indoor temperature,
- current CO2 rate,
- status flags.

#### Generator state projection
Contains:
- current output,
- mode,
- availability,
- startup state,
- current CO2 rate.

#### Whole-city aggregate projection
Contains:
- total demand,
- total generation,
- total emissions,
- weather summary,
- current alerts.

## 3. Entity metadata and identity store

### What it stores
Stable or slowly changing metadata about the city’s entities.

Examples:
- building definitions,
- generator definitions,
- sensor identities,
- district mappings,
- traffic segment metadata,
- entity-to-district relationships,
- device profile references.

### Why it exists
Telemetry records should not be bloated with full metadata copies for every event.

The metadata store should make it possible to resolve:
- what an entity is,
- where it belongs,
- what metrics it should emit,
- how it relates to the rest of the city.

### Recommended logical fields
- `entityId`
- `entityType`
- `cityId`
- `displayName`
- `metadataJson`
- `parentEntityId`
- `districtId`
- `createdUtc`
- `updatedUtc`
- `status`

### Important note
This is not necessarily the same as the full DT graph model, but it provides the identity and metadata backbone that IOT needs.

## 4. Seeded dataset and replay store

### What it stores
Information about imported or generated historical datasets and replay sessions.

Examples:
- one-year seeded weather and telemetry dataset,
- dataset version info,
- import status,
- replay jobs,
- replay time mappings,
- replay run state.

### Why it exists
Cityverse explicitly needs:
- a year of fake data,
- live simulation recording,
- the ability to replay historical data.

That requires datasets to be identifiable and manageable.

### Recommended dataset fields
- `datasetId`
- `datasetType`
- `name`
- `source`
- `description`
- `timeRangeStartUtc`
- `timeRangeEndUtc`
- `recordCount`
- `createdUtc`
- `importStatus`
- `schemaVersion`

### Recommended replay job fields
- `replayJobId`
- `datasetId`
- `status`
- `startedUtc`
- `stoppedUtc`
- `fromUtc`
- `toUtc`
- `speedMultiplier`
- `targetMode`
- `lastReplayTimestampUtc`

## 5. Aggregate and rollup store

### What it stores
Precomputed or incrementally maintained summaries.

Examples:
- hourly building energy totals,
- daily district emissions,
- whole-city five-minute power balance summaries,
- monthly generator utilization,
- daily weather summaries.

### Why it exists
Some queries become expensive or annoying if every chart is computed from raw telemetry every time.

A rollup store improves:
- dashboards,
- trend views,
- reporting,
- AI summary generation,
- export efficiency.

### Recommended logical fields
- `aggregateId`
- `cityId`
- `scopeType`
- `scopeId`
- `metricName`
- `windowType`
- `windowStartUtc`
- `windowEndUtc`
- `value`
- `unit`
- `datasetId`
- `schemaVersion`

### Recommended early windows
- 5-minute
- hourly
- daily
- monthly

## 6. Operational and audit store

### What it stores
Operational metadata about the IOT system itself.

Examples:
- ingest health,
- failed messages,
- schema validation errors,
- projection rebuild runs,
- replay job logs,
- exports,
- maintenance actions,
- selected command logs if routed through IOT.

### Why it exists
A believable platform needs operational visibility.

Otherwise debugging becomes speculative fiction.

### Recommended logical fields
- `operationId`
- `operationType`
- `status`
- `startedUtc`
- `completedUtc`
- `actorType`
- `actorId`
- `detailsJson`
- `errorCode`
- `errorMessage`

## Data Flow Into Storage

Recommended ingest pipeline inside IOT:

1. receive telemetry from MQTT or compatible ingest path,
2. validate message schema,
3. normalize entity identity and metric shape,
4. write raw logical event into telemetry history store,
5. update latest-state projection for affected entity,
6. update affected aggregates if required,
7. emit live update stream to DT/UI subscribers,
8. record failures or anomalies in the operational store when needed.

This pipeline separates durable history from latest-state projection, which is exactly the discipline this system needs.

## Recommended Data Separation Rules

## Rule 1
**Telemetry history is append-oriented.**
Do not overwrite the historical record except for controlled maintenance or test cleanup operations.

## Rule 2
**Latest-state projections are replace/update-oriented.**
They represent “what is currently known now.”

## Rule 3
**Entity metadata changes slowly and should not be rewritten on every telemetry message.**

## Rule 4
**Datasets and replay jobs need explicit identity.**
Do not mix seeded data and live data without a traceable dataset context.

## Rule 5
**Aggregates are derived, not primary truth.**
They can be rebuilt if needed.

## Seeded History vs Live Data Strategy

Cityverse needs both seeded fake history and live runtime data.

Recommended model:
- seeded data is imported with a `datasetId`,
- live runtime data is also tagged with a dataset or session context,
- replay mode can read historical records and emit them into live-style streams,
- latest-state projections should clearly indicate which dataset or live context they represent.

Example dataset contexts:
- `seed-2025-full-year`
- `live-session-2026-04-16-a`
- `replay-seed-2025-q1`

This avoids confusion when comparing history, live simulation, and replayed streams.

## Suggested Physical Storage Options for MVP

## Option A, PostgreSQL-style hybrid relational approach

Good fit if we want:
- one robust local DB,
- clear tables,
- strong indexing,
- future server deployment,
- moderate complexity.

Possible table families:
- `telemetry_history`
- `latest_state_projection`
- `entity_metadata`
- `datasets`
- `replay_jobs`
- `aggregates`
- `operations_log`

Pros:
- practical,
- mature,
- flexible,
- future-ready.

Cons:
- more setup than a tiny embedded DB.

## Option B, SQLite for early local MVP

Good fit if we want:
- minimal local setup,
- one-file database,
- quick prototyping.

Pros:
- very easy to run on one Windows machine,
- good for local development and testing.

Cons:
- less ideal for scaling,
- more limited for heavier concurrent access,
- may become a migration step later.

## Option C, dedicated time-series plus relational store

Good fit later if scale and analytics grow.

Pros:
- better specialization.

Cons:
- too much system weight for early MVP unless clearly needed.

## Recommendation
For MVP, the best practical choice is likely:
- **start with a relational hybrid model**,
- use **PostgreSQL if operational setup is acceptable**,
- otherwise start with **SQLite** but keep schema design portable to PostgreSQL.

That is the most sensible compromise between seriousness and not building a tiny empire before the first building sends one watt reading.

## Recommended Core Tables or Collections

### `telemetry_history`
Primary raw time-series store.

### `entity_state_projection`
Latest-value or latest-state store by entity.

### `entity_metadata`
Stable metadata for buildings, generators, sensors, districts, and traffic entities.

### `datasets`
Seeded and imported dataset registry.

### `replay_jobs`
Replay execution tracking.

### `metric_aggregates`
Precomputed rollups.

### `operations_log`
Operational and audit trail.

## Recommended Query Patterns

The storage model should efficiently support these query types:

### Historical telemetry query
Examples:
- building power demand for last 24 hours,
- wind farm output for one month,
- city CO2 emissions for one year.

### Latest entity state query
Examples:
- current weather,
- current state of a building,
- current state of a generator,
- current district summary.

### Aggregate trend query
Examples:
- daily total emissions this month,
- hourly power demand for a district,
- monthly generator utilization.

### Replay dataset query
Examples:
- available datasets,
- replay job status,
- replay progress.

### Metadata lookup
Examples:
- find all buildings in a district,
- find generator type by ID,
- find sensor profile for a building.

## Retention and Lifecycle Guidance

Recommended first-pass retention rules:
- seeded history stays until explicitly removed,
- live simulation history stays by default for MVP unless storage becomes a problem,
- aggregates can be rebuilt,
- operations logs can have shorter retention if needed,
- failed-message logs can have shorter retention than telemetry history.

## Relationship to DT

DT should not own the authoritative telemetry storage.

Instead:
- IOT stores history,
- IOT exposes latest-state projections,
- DT consumes and reshapes these into twin objects and visual state.

This keeps DT from becoming a second database of everything, which is how systems quietly begin to resent their creators.

## Recommended Decision

Recommended decision for now:
- use a hybrid IOT storage model,
- separate telemetry history from latest-state projections,
- keep metadata, dataset tracking, replay jobs, aggregates, and operational logs distinct,
- tag all history with dataset or session context,
- keep the schema portable so local Windows MVP deployment can start simple and later move to stronger infrastructure.

## Suggested Follow-Up Docs

After this, the most useful next docs are:
- `docs/DT_STATE_AND_GRAPH_MODEL.md`
- `docs/TELEMETRY_MESSAGE_SCHEMA.md`
- `docs/EXECUTABLE_BOUNDARY_SPEC.md`
- `docs/CLAUDE_DEVELOPMENT_PLAN.md`

## Short conclusion

A good IOT storage model needs two brains:
- one for remembering everything that happened,
- one for knowing what is true right now.

That means:
- telemetry history,
- latest-state projections,
- metadata,
- datasets and replay,
- aggregates,
- operational logs.

Anything flatter than that will become inconvenient long before the city becomes interesting.
