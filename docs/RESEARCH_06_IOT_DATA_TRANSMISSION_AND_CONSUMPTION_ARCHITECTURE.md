# Cityverse MVP, Research 06: IoT Data Transmission and Consumption Architecture

Date: 2026-04-16
Task reference: `TASKS.md` item 6, Major investigation: realistic IoT data transmission and consumption architecture

## Purpose

This document investigates how data should move between:
- simulated sensors and assets inside VC,
- IOT as the broker and persistence layer,
- DT and Unity as consumers of live and historical state.

The goal is to design a transmission and consumption architecture that:
- resembles real-world IoT systems as closely as practical,
- fits the current MVP requirement of three separate executables on one Windows machine,
- still supports a future where VC and IOT may run remotely or in the cloud,
- keeps the architecture clear enough to implement without turning the first version into a doctoral thesis in distributed disappointment.

## Executive Summary

The strongest conclusion from the research is this:

**Cityverse should use a hybrid architecture, not one protocol for everything.**

Recommended first-pass architecture:
- **MQTT-style publish/subscribe telemetry** from simulated devices and subsystems in VC into IOT,
- **state/config channels** separated from telemetry, using device-state concepts similar to Azure device twins,
- **command/control paths** separated from telemetry, using a direct-method or command endpoint pattern,
- **DT and Unity** consuming:
  - real-time updates via subscription or event stream,
  - historical and graph/state queries via API,
- **IOT** acting as the central ingress, storage, normalization, and fan-out layer.

This best matches real-world IoT architecture because real systems usually separate:
- telemetry,
- device state,
- commands,
- historical storage,
- digital twin graph concerns.

## What Real-World IoT Systems Commonly Separate

A major lesson from Azure IoT Hub and Azure Digital Twins documentation is that different kinds of information should not all be sent the same way.

### 1. Telemetry
Time-series sensor values and alerts.

Examples:
- temperature,
- humidity,
- kW demand,
- battery state of charge snapshots,
- traffic counts,
- weather station output.

### 2. State and configuration
Last-known state, capabilities, conditions, and configuration.

Examples:
- plant on/off state,
- sensor online/offline state,
- firmware/configuration values,
- building automation mode,
- battery control mode.

### 3. Commands
Immediate request/response actions.

Examples:
- turn oil plant on,
- change simulation speed,
- set building override mode,
- force weather scenario,
- reconnect module.

### 4. Historical storage and analytics
Longer-term data retrieval, replay, analysis, and trend work.

### 5. Twin graph / relational model
Entity model and relationships.

Examples:
- this sensor belongs to this building,
- this building belongs to this district,
- this power plant feeds this grid zone,
- this room belongs to this building.

This is extremely close to the architecture Cityverse needs.

## Source Findings

## 1. Azure IoT guidance strongly separates telemetry, twins, and file/batch uploads

Microsoft’s device-to-cloud communication guidance says IoT Hub supports three primary device-to-cloud options:
- device-to-cloud messages for telemetry time series and alerts,
- device twin reported properties for device state and condition synchronization,
- file uploads for large payloads.

The same guidance says:
- telemetry messages support high frequency,
- reported properties are for medium-frequency state-like information,
- twins are stored and queryable as JSON state,
- telemetry is higher-throughput than device twin updates.

### Implication for Cityverse
Cityverse should not send every changing value into one giant state document.

Recommended mapping:
- **telemetry** goes through a message stream,
- **last-known configuration/state** goes into a state store or twin-like structure,
- **large batch exports** use batch/history paths, not the live telemetry path.

## 2. Azure IoT Hub protocol guidance favors MQTT for many device scenarios

Microsoft’s protocol guidance says IoT Hub supports:
- MQTT,
- MQTT over WebSockets,
- AMQP,
- AMQP over WebSockets,
- HTTPS.

The same guidance recommends MQTT for many device scenarios, especially for low-resource devices, while noting AMQP is better when a field gateway must multiplex multiple device identities over fewer upstream connections.

Microsoft’s direct MQTT documentation for IoT Hub says:
- MQTT v3.1.1 is supported on port 8883,
- MQTT over WebSockets is supported on port 443,
- all device communication must use TLS,
- IoT Hub is not a full-featured general MQTT broker.

### Implication for Cityverse
For a local Windows MVP, **MQTT is the most natural first telemetry pattern** because:
- it is already common in IoT,
- it matches pub/sub semantics well,
- it maps well to simulated sensors publishing to IOT,
- it can later move from localhost to remote deployment without redesigning the mental model.

However, Cityverse does **not** need to copy Azure IoT Hub’s exact product limitations. It should borrow the architecture pattern, not the handcuffs.

## 3. MQTT is a very strong fit for synthetic sensor publishing

GitHub’s official MQTTnet repository describes MQTTnet as a high-performance .NET library providing both MQTT client and server support, including:
- MQTT protocol support up to version 5,
- TLS,
- WebSocket support,
- client and broker support,
- compatibility with Microsoft Azure IoT Hub.

This matters because Cityverse is initially Windows-based and likely to benefit from a .NET-friendly transport option if any part of the stack sits in .NET or needs easy C# integration for Unity-facing tools.

### Implication for Cityverse
MQTT is not just architecturally sensible. It is also practical for a Windows MVP.

A realistic first-pass pattern is:
- VC simulates many sensors,
- VC publishes sensor telemetry to IOT over MQTT topics,
- IOT stores and normalizes the events,
- DT and Unity subscribe to selected live streams or consume downstream normalized APIs.

## 4. Azure IoT twins are a strong model for state, not telemetry

Microsoft’s device twin documentation says device twins are JSON documents storing:
- metadata,
- desired properties,
- reported properties,
- device state information.

The same documentation explicitly notes that reported properties are useful for last-known values and state synchronization, while device-to-cloud messages should be used for time-series telemetry.

### Implication for Cityverse
Cityverse should adopt a twin-like split:
- **time-series measurements** go to telemetry storage,
- **last-known entity state/configuration** goes to a state/twin store.

Examples:
- temperature readings every minute: telemetry,
- current battery control mode: twin/state,
- current building occupancy estimate: twin/state plus selected telemetry if historically tracked,
- current power plant availability state: twin/state,
- on/off command result: command event plus updated state.

## 5. Azure direct methods are a strong pattern for control operations

Microsoft’s direct methods documentation says direct methods are for:
- immediate request/response communication,
- interactive control,
- synchronous cloud-to-device calls,
- cases where the caller wants immediate success or failure.

### Implication for Cityverse
Cityverse should not use telemetry topics for commands like:
- turn plant on,
- change weather override,
- reset subsystem,
- switch simulation mode.

Those should be modeled as **command calls** with explicit success/failure behavior.

For the MVP this could be:
- HTTP or gRPC command API,
- or MQTT command topics with explicit response topics,
- but conceptually it should behave like a direct-method channel, not like ordinary telemetry.

My recommendation for the MVP is simpler than full cloud-style device methods:
- **HTTP or local RPC for commands** between UI/DT and VC or IOT,
- **MQTT for telemetry**.

That gives cleaner implementation boundaries.

## 6. Azure Digital Twins strongly separates graph/twin concerns from ingestion plumbing

Microsoft’s Azure Digital Twins documentation says:
- digital twins form a twin graph,
- Azure Digital Twins receives data from upstream services such as IoT Hub or Logic Apps,
- Azure Digital Twins can send data to downstream services using event routes,
- the service is about models, twins, relationships, queries, and connected environment logic.

This is a very important architectural pattern.

### Implication for Cityverse
**DT should not be the broker.**

DT should primarily own:
- graph model,
- twin/entity state representation,
- relationships,
- query/view composition,
- visualization-facing projections.

IOT should own:
- ingestion,
- message handling,
- normalization,
- historical persistence,
- stream fan-out.

VC should own:
- authoritative simulation state,
- sensor generation,
- physics/logic/time/weather/building behavior,
- command execution for simulation systems.

This separation is clean, realistic, and future-proof.

## 7. OPC UA matters as a future realism path, especially for industrial-style assets

OPC Foundation describes OPC as an interoperability standard for secure and reliable exchange of data in industrial automation and other industries.

### Implication for Cityverse
For the first MVP, OPC UA is probably **not necessary as the primary internal transport**.

However, it is strategically relevant for later realism, especially if Cityverse wants to emulate or connect to:
- industrial facilities,
- power plants,
- SCADA-like systems,
- building automation systems.

Recommendation:
- do **not** make OPC UA the first internal Cityverse transport,
- do keep it in mind as a later gateway or adapter layer.

## Recommended Cityverse Data Flow Architecture

## High-level flow

### Telemetry flow
1. VC simulates entities and sensors.
2. Simulated sensors publish telemetry to IOT using MQTT topics.
3. IOT validates, timestamps, normalizes, and stores the events.
4. IOT updates relevant last-known state projections.
5. DT consumes either:
   - a live event stream for near-real-time display, and/or
   - query APIs for state and history.
6. Unity renders the resulting DT state and live changes.

### State flow
1. VC or IOT updates current state for an entity.
2. IOT stores the latest state in a twin/state store.
3. DT pulls or subscribes to state changes.
4. UI and Unity consume projected state rather than raw message noise.

### Command flow
1. UI or DT sends command.
2. Command is routed to the authoritative owner, usually VC for simulation actions.
3. VC executes or rejects the action.
4. Result is returned immediately.
5. Resulting state changes are then published through state and telemetry channels.

This is the important architectural rule:
**commands change the simulation, telemetry describes what happened, state stores where things now stand.**

## Recommended Protocol Choices for MVP

## 1. VC to IOT, telemetry
**Recommendation: MQTT**

Why:
- realistic IoT pub/sub model,
- clean device/topic metaphor,
- efficient local and remote operation,
- easy future remote deployment,
- well understood in IoT,
- good fit for sensor/event streams.

## 2. UI/DT to VC or IOT, commands and queries
**Recommendation: HTTP API first, optionally gRPC later**

Why:
- simple for a Windows MVP,
- easy for web UI integration,
- easy for Unity to call,
- straightforward debugging,
- cleaner command semantics than pretending every control action is MQTT telemetry.

## 3. IOT to DT live updates
**Recommendation: WebSocket or MQTT subscription, but expose a DT-facing abstraction**

Why:
- DT and Unity need near-real-time updates,
- WebSocket is convenient for UI and Unity-facing live streams,
- MQTT subscription is also viable if DT directly consumes topics,
- abstraction matters more than the exact first implementation.

My recommendation:
- **IOT internal ingest uses MQTT**,
- **DT/UI live feed uses WebSocket or server-sent event style stream from IOT or DT service**,
- **DT historical/state queries use HTTP API**.

That avoids forcing Unity and the browser to directly think like brokers unless there is a good reason.

## 4. Historical queries
**Recommendation: HTTP query API over a database-backed store**

Why:
- history is not a pub/sub problem,
- easier pagination, filters, time windows, and aggregations,
- cleaner for charts, dashboards, and replay.

## Recommended Topic and Data Contract Strategy

## Telemetry topics
A realistic MQTT topic structure could look like:
- `vc/city/{cityId}/district/{districtId}/building/{buildingId}/sensor/{sensorType}`
- `vc/city/{cityId}/power/{generatorId}/telemetry/{metric}`
- `vc/city/{cityId}/weather/{stationId}/{metric}`
- `vc/city/{cityId}/traffic/{segmentId}/{metric}`

Examples:
- `vc/city/main/building/bldg-102/sensor/power_demand_kw`
- `vc/city/main/power/gas-01/telemetry/output_mw`
- `vc/city/main/weather/ws-01/temperature_c`

## State topics or state projection keys
State should not explode into endless raw topics. Better options:
- maintain state in a database projection,
- publish compact state-change events separately,
- let DT query the latest state through API.

## Command endpoints
Examples:
- `POST /api/vc/generators/{id}/start`
- `POST /api/vc/generators/{id}/stop`
- `POST /api/vc/weather/override`
- `POST /api/vc/time/set`
- `POST /api/vc/simulation/speed`

## Recommended Separation of Concerns

## VC should own
- simulation truth,
- time/date/weather progression,
- buildings and occupancy behavior,
- energy and traffic simulation,
- command execution for simulation systems,
- synthetic sensor generation.

## IOT should own
- broker ingress,
- topic authorization and validation,
- normalization,
- historical persistence,
- latest-value projections,
- stream fan-out,
- API surface for telemetry history and current state.

## DT should own
- twin/entity model,
- relationships and graph,
- visualization-facing state composition,
- scene-ready projections for Unity,
- UI-friendly exploration of current and historical context.

This division is very close to real-world cloud/edge/twin patterns.

## Unity and DT Consumption Recommendations

Unity should ideally **not** consume millions of raw sensor events directly unless the goal is to simulate suffering.

Better pattern:

### For live visuals
Unity consumes:
- DT state snapshots,
- state-change events,
- selected live telemetry streams for highlighted metrics,
- replay streams when needed.

### For graph/entity navigation
Unity queries:
- entities,
- relationships,
- metadata,
- current state.

### For charts and timelines
Unity or the web UI queries:
- time-windowed historical telemetry,
- aggregated values,
- CO2 history,
- power balance history,
- weather history.

### Recommended practical rule
- raw telemetry is for IOT storage and processing,
- projected entity state is for DT,
- scene-focused payloads are for Unity.

That keeps the visualization layer from drowning in perfectly authentic irrelevance.

## Data Model Recommendation

A realistic first-pass message envelope for telemetry could include:
- `messageId`
- `timestampUtc`
- `cityId`
- `entityId`
- `entityType`
- `sensorId`
- `metricName`
- `value`
- `unit`
- `quality`
- `sourceType` such as simulated, derived, override
- `schemaVersion`

A twin/state object could include:
- `entityId`
- `entityType`
- `metadata`
- `currentState`
- `lastUpdatedUtc`
- `relationships`

This follows the real-world split between event streams and stateful twins.

## Recommended MVP Architecture Decision

## Best first implementation

### Telemetry
- MQTT from VC to IOT

### Latest state / current values
- state projection store inside IOT

### Historical storage
- time-series oriented database or database tables inside IOT

### Commands
- HTTP API from UI/DT to VC or to IOT services that route into VC

### DT consumption
- HTTP query API for graph and state
- WebSocket or equivalent live event feed for updates

### Unity consumption
- HTTP for snapshots, metadata, and historical queries
- WebSocket for live scene updates

This is the cleanest MVP path that still resembles the architecture of real systems.

## Why not just use MQTT for everything?

Because real systems rarely benefit from collapsing:
- telemetry,
- command handling,
- state queries,
- history queries,
- graph queries,
into one transport model.

MQTT is excellent for sensor-style event delivery.
It is not the best universal answer for every query and control concern.

## Future Evolution Path

Later, Cityverse can grow toward:
- remote VC and IOT deployment,
- edge gateways,
- OPC UA adapters for industrial realism,
- more Azure-like or cloud-like device identity management,
- event routing into analytics systems,
- richer twin synchronization pipelines,
- digital-twin graph updates triggered from IOT ingestion rules.

The recommended MVP architecture does not block any of that.

## Risks and Caveats

### Risk 1, making DT the broker
This would blur graph logic with ingestion logic and create a messy center of gravity.

### Risk 2, sending every state update as a commandless event
You would lose the distinction between state, event history, and intent.

### Risk 3, making Unity consume raw telemetry directly
This may look simple at first and become ugly very quickly.

### Risk 4, over-copying Azure products literally
The goal is to match real-world architecture patterns, not to cosplay every managed-service detail.

## Recommended Decision

Recommended decision for now:
- use **MQTT-style telemetry ingestion** from VC into IOT,
- use **twin/state projections** for latest-known conditions and metadata,
- use **HTTP command/query APIs** for control and history access,
- let **DT focus on graph and entity state**, not low-level broker duties,
- let **Unity consume scene-ready projections and live update feeds**, not raw ingestion firehoses,
- keep **OPC UA** as a future adapter/gateway path, not the initial core transport.

## Suggested Follow-Up Tasks

After this research, the next useful implementation tasks are:
1. define the first MQTT topic taxonomy,
2. define the telemetry message schema,
3. define the entity state / twin schema,
4. define command API endpoints for VC control,
5. define how IOT stores telemetry history and latest-value projections,
6. define the DT-to-Unity live update contract,
7. decide whether DT consumes directly from IOT or through a DT service layer.

## Sources

Primary sources used:
- Azure IoT Hub device-to-cloud communications guidance: https://learn.microsoft.com/en-us/azure/iot-hub/iot-hub-devguide-d2c-guidance/
- Azure IoT Hub overview: https://learn.microsoft.com/en-us/azure/iot-hub/iot-concepts-and-iot-hub
- Azure IoT Hub protocol guidance: https://learn.microsoft.com/en-us/azure/iot-hub/iot-hub-devguide-protocols
- Azure IoT Hub MQTT communication: https://learn.microsoft.com/en-us/azure/iot-hub/iot-mqtt-connect-to-iot-hub
- Azure IoT Hub device twins: https://learn.microsoft.com/en-us/azure/iot-hub/iot-hub-devguide-device-twins
- Azure IoT Hub direct methods: https://learn.microsoft.com/en-us/azure/iot-hub/iot-hub-devguide-direct-methods
- Azure Digital Twins overview: https://learn.microsoft.com/en-us/azure/digital-twins/overview
- Azure Digital Twins twin graph concepts: https://learn.microsoft.com/en-us/azure/digital-twins/concepts-twins-graph
- Azure Digital Twins data ingress and egress: https://learn.microsoft.com/en-us/azure/digital-twins/concepts-data-ingress-egress
- OPC Foundation, What is OPC?: https://opcfoundation.org/about/what-is-opc/
- MQTTnet official GitHub repository: https://github.com/dotnet/MQTTnet

## Short conclusion

The best first architecture for Cityverse is:
- **MQTT for telemetry**,
- **HTTP for commands and queries**,
- **twin/state projections for current conditions**,
- **DT for graph and visualization-facing state**,
- **Unity consuming scene-ready live/state APIs rather than raw broker firehose data**.

That is realistic, implementable, and future-proof enough to survive contact with actual development.
