# Cityverse MVP, IoT Broker

## Purpose

IOT should behave as closely as practical to a real IoT broker or cloud ingestion platform, such as Azure IoT-style infrastructure.

It is not just a message relay. It is a core platform service responsible for:
- receiving simulated device and system telemetry,
- storing data in a database,
- exposing data for downstream consumers,
- acting as a realistic integration surface for DT, analytics, dashboards, and AI systems.

The broker should feel believable enough that downstream systems can interact with it as though they are connected to a real IoT environment rather than a toy event emitter.

## Core Requirements

IOT must:
- ingest synthetic data from VC,
- make it easy to add and remove telemetry flows,
- store incoming data in a database or equivalent historical memory layer,
- support retrieval of historical data,
- support live data recording while the simulation is running,
- expose current-state projections efficiently,
- provide flow health and operational visibility,
- provide a realistic enough structure to resemble a production IoT backend.

This means IOT should serve both as:
- a live telemetry ingestion service,
- a persistent historical data platform,
- and a flow-aware observability layer.

## Historical Data Requirement

The system should include a mock database containing approximately one year of fake historical data.

This data is important because many realistic IoT and digital twin workflows require history, not just current values.

The historical dataset should:
- cover a representative set of city entities,
- include building telemetry,
- include weather-related values,
- include energy generation and consumption data,
- include time variation across days, weeks, and seasons,
- support queries over long time spans,
- be believable enough for analytics, dashboards, and AI experiments.

The historical data does not need to begin at production scale for MVP, but it should be broad enough to support meaningful testing.

## Live Recording During Simulation

When VC is running, IOT must be able to record new incoming data continuously.

This means the platform should support:
- real-time data ingestion from simulated sources,
- timestamped event or metric storage,
- separation or tagging of historical seeded data vs newly recorded live data,
- continuous accumulation of data over runtime.

VC should be able to act like a population of devices and systems publishing telemetry into IOT.

## Data Types to Store

IOT should support data from multiple parts of the virtual city.

### Building telemetry
- electricity consumption,
- occupancy state,
- indoor temperature,
- device activity,
- building status values,
- battery-related telemetry where applicable.

### Weather telemetry
- air temperature,
- wind speed,
- precipitation,
- cloud cover,
- solar intensity.

### Energy system telemetry
- wind farm generation,
- solar farm generation,
- mini nuclear plant output,
- gas or oil plant output,
- total city production,
- load and demand metrics,
- grid import and export values later.

### Emissions telemetry
- building CO2 emissions,
- traffic CO2 emissions,
- generation-related CO2 emissions,
- city-wide emissions totals.

### System and operational values
- alerts,
- anomalies,
- state changes,
- simulation metadata,
- DT synchronization state where relevant.

## Real-World Fidelity

IOT should resemble a real IoT platform in spirit and structure.

Relevant characteristics include:
- devices or simulated entities publishing telemetry,
- normalized message schemas,
- persistent storage,
- queryable history,
- support for both live and historical views,
- ability to integrate with analytics and twin systems,
- eventual compatibility with realistic ingestion patterns and APIs.

The reference comparison is Azure-style IoT infrastructure. That does not mean the MVP must clone Azure feature-for-feature. It means IOT should behave like a credible cloud-style telemetry backend, not like a thin debug log.

## Relationship to VC and DT

IOT sits between VC and DT as the primary data backbone.

The intended path is:
1. VC simulates sensors, buildings, weather, traffic, and energy systems,
2. VC publishes synthetic telemetry into IOT,
3. IOT ingests, validates, normalizes, and stores the data,
4. IOT updates latest-state projections and operational flow status,
5. DT and Unity consume live and historical data from IOT,
6. Unity or another visual client renders the current or replayed state.

This interaction model should match real-world IoT architecture patterns as closely as the MVP allows.

The key rule is simple:
- no direct VC-to-Unity shortcut for normal data consumption
- the IOT layer must remain the believable broker and telemetry platform

## Data Persistence

IOT should write incoming data to a database rather than holding it only in memory.

At a minimum, persistence should support:
- historical storage,
- time-based queries,
- entity-based queries,
- retrieval of recent live telemetry,
- seeded historical data plus newly recorded runtime data.

A likely data architecture may eventually combine:
- time-series storage for telemetry history,
- relational or document storage for metadata,
- graph or relationship modeling later if the twin model becomes more advanced.

For MVP, the important thing is not to overbuild. The important thing is to persist believable telemetry in a way that supports querying, playback, and downstream integration.

## Deployment Direction

The current intended deployment model is:
- VC as a separate executable,
- IOT as a separate executable,
- DT as a separate executable.

For the MVP, all three should run on the same Windows computer.

However, the architecture should not assume permanent co-location. It should leave room for future deployment where VC and IOT can run remotely or in the cloud while DT or the visualization layer runs elsewhere.

That means APIs, protocols, and data contracts should be designed with future distribution in mind.

## MVP Direction

For the MVP, IOT should support:
- a defined set of synthetic city entities,
- a normalized telemetry schema,
- easy extension for new flows such as weather, energy, buildings, generators, and CO2,
- one year of seeded fake history as the target direction,
- live recording during simulation runtime,
- query access to historical and recent data,
- current-state projections,
- flow health and freshness visibility,
- enough realism that dashboards, AI workflows, and DT views can use it credibly.

## Immediate Design Questions

These questions should be answered in later architecture work:
- what message schema should we standardize on,
- what database or combination of databases should store telemetry and metadata,
- how should seeded historical data be generated,
- how should live and seeded data be distinguished if needed,
- what API shape should expose ingestion and querying,
- how closely should we emulate Azure IoT patterns vs designing a simpler compatible abstraction.
