# Cityverse MVP, Research 07: Executable and Deployment Boundaries

Date: 2026-04-16
Task reference: `TASKS.md` item 7, Define executable and deployment boundaries

## Purpose

This document defines the most practical first-pass runtime boundary between:
- **VC** (Virtual City),
- **IOT** (IoT Broker),
- **DT** (Digital Twin).

The goal is to make the system:
- realistic in its architecture,
- implementable on one Windows machine first,
- ready for later remote or cloud deployment of VC and IOT,
- cleanly separated so each part has a clear job.

## Executive Summary

The recommended first-pass boundary is:

- **VC** is the authoritative simulation executable.
- **IOT** is the telemetry ingress, persistence, and latest-state executable.
- **DT** is the twin graph, composition, and visualization-facing executable.

For the MVP, all three should run on the same Windows computer as separate executables.

Recommended communication pattern:
- **VC -> IOT**: MQTT telemetry publish
- **DT/UI -> VC or IOT**: HTTP command/query APIs
- **IOT -> DT/UI**: HTTP queries plus WebSocket or similar live update stream

This separation matches real-world IoT patterns well enough to be useful, without becoming absurdly heavy for an MVP.

## Why the Boundary Matters

If these three concerns are blurred together, several bad things happen:
- simulation logic becomes entangled with storage logic,
- the digital twin becomes a broker by accident,
- the visualization layer gets overloaded with raw telemetry concerns,
- remote deployment later becomes painful,
- testing becomes awkward because there is no clear ownership boundary.

In short, separate executables are not ceremony here. They are structural hygiene.

## Real-World Pattern Support

### IoT systems separate telemetry from state
Microsoft’s IoT Hub twin documentation says device twins store device state information including metadata, configurations, and conditions, and says they are useful for last-known values, configuration synchronization, and querying. The same page says to use device-to-cloud messages when you want telemetry as sequences of timestamped events such as time series. This is exactly the separation Cityverse needs between live event streams and latest state. Source: Microsoft Learn, IoT Hub device twins.

### IoT systems can separate components under one device identity
Microsoft’s module twin documentation says you can create module identities under a device identity, and that module identities provide finer-grained separation of concerns for modular software components. That is a useful architectural analogy for Cityverse even if Cityverse is not literally using Azure module twins. Source: Microsoft Learn, IoT Hub module twins.

### Azure Digital Twins is fed by upstream services, not used as the broker itself
Microsoft’s Azure Digital Twins overview describes it as a platform for twin graphs and says it can connect to IoT Hub device twins and live data. Microsoft’s data ingress/egress documentation says Azure Digital Twins typically receives data from upstream services such as IoT Hub or Logic Apps. That strongly supports the pattern that DT should sit downstream of ingestion and not become the ingestion service itself. Sources: Microsoft Learn, Azure Digital Twins overview; Microsoft Learn, Azure Digital Twins data ingress and egress.

### Unity supports Windows standalone executables and headless/server style modes
Unity’s Windows standalone build docs say a Windows build produces a project `.exe`, `UnityPlayer.dll`, and a `ProjectName_Data` folder. Unity’s standalone player command line docs say Unity players can be launched from the command line, and that `-batchmode` runs in headless mode and `-nographics` avoids initializing a graphics device in batch mode. This matters because it means DT or even some future VC-side Unity-based runtime can operate as a clear standalone executable, and Unity can also support headless/networked scenarios if needed. Sources: Unity Manual, Windows standalone Player build binaries; Unity Manual, Standalone Player command line arguments.

### Web desktop shells are naturally distributable as separate executables
Electron’s packaging docs say an Electron app can be packaged into a distributable and delivered as an executable on Windows. That supports a practical path for the web UI or a desktop operator console if Cityverse later wants a packaged DT/operator app rather than a browser-only UI. Source: Electron docs, Packaging Your Application and Application Packaging.

## Recommended Boundary Definition

## 1. VC (Virtual City)

### Primary responsibility
VC owns simulation truth.

### VC should own
- world time and date progression,
- season and weather progression,
- day/night and solar behavior,
- buildings and occupancy simulation,
- traffic and movement simulation,
- power generation behavior,
- local energy demand behavior,
- synthetic sensor generation,
- execution of simulation-changing commands.

### VC should expose
- command endpoints for simulation controls,
- current simulation state summaries,
- synthetic telemetry publishing into IOT.

### VC should not own
- long-term telemetry history storage,
- general-purpose querying of historical time series,
- twin graph relationship management,
- UI-specific scene composition.

### Why
VC is the source of simulated truth. It should generate data and react to commands, but it should not become a general-purpose telemetry warehouse or digital twin graph database.

## 2. IOT (IoT Broker)

### Primary responsibility
IOT owns telemetry ingestion, normalization, persistence, and latest-value state projection.

### IOT should own
- MQTT or equivalent telemetry ingress,
- telemetry validation and normalization,
- message timestamping rules,
- historical data persistence,
- latest-known value projections,
- state/twin-adjacent last-known device and asset state,
- APIs for historical queries,
- APIs or streams for live update fan-out,
- seeded historical data import and storage.

### IOT should expose
- telemetry ingest endpoints or broker listener,
- historical query API,
- current-state/latest-value API,
- live event stream for subscribers,
- optionally twin/state change feed to DT.

### IOT should not own
- authoritative simulation progression,
- scene rendering,
- twin graph composition as the main concern,
- direct manipulation of simulation truth except through explicit command routing.

### Why
IOT is the backbone between simulated sources and downstream consumers. It should behave like a believable telemetry backend, not like a hidden second simulator.

## 3. DT (Digital Twin)

### Primary responsibility
DT owns the twin graph, relationships, and visualization-facing state composition.

### DT should own
- digital twin models and entity structure,
- relationships between city entities,
- composition of live state plus metadata into twin objects,
- scene-ready state for Unity,
- operator-facing spatial and semantic query layers,
- projected data for city, district, building, room, and asset views.

### DT should expose
- entity graph queries,
- scene-ready state payloads,
- relationship queries,
- selected live twin change streams,
- optional 3D or map-facing APIs.

### DT should not own
- raw telemetry ingestion,
- long-term event history as the primary storage system,
- source-of-truth simulation logic,
- low-level device protocol handling.

### Why
DT should represent and organize the environment, not impersonate an IoT hub.

## Recommended Windows MVP Deployment Shape

## First deployment
All three executables run on the same Windows machine.

### Suggested layout
- `cityverse-vc.exe`
- `cityverse-iot.exe`
- `cityverse-dt.exe`

Potential supporting pieces:
- local database service or embedded DB for IOT,
- local MQTT broker inside IOT or alongside it,
- local browser UI for DT or an Electron shell later.

### Why this is good for MVP
- easier local development,
- easier debugging,
- no network deployment burden yet,
- still preserves service boundaries,
- lets us move parts off-machine later.

## Recommended Network and Runtime Contract

### VC -> IOT
**Telemetry publish path**

Recommended contract:
- MQTT topics for telemetry,
- message envelope with timestamp, entity ID, metric name, unit, value, source type, and schema version.

Why:
- realistic IoT pattern,
- efficient for synthetic sensors,
- future remote deployment friendly.

### DT/UI -> VC
**Simulation command path**

Recommended contract:
- HTTP API for simulation-changing commands.

Examples:
- set time,
- change date,
- override weather,
- start gas plant,
- stop oil plant,
- adjust simulation speed.

Why:
- commands need explicit success/failure,
- easier debugging than hiding commands in telemetry topics,
- good fit for web UI and Unity tooling.

### DT/UI -> IOT
**History and current-state query path**

Recommended contract:
- HTTP query API for historical telemetry and current latest values.

Why:
- history and state lookups are query problems, not pub/sub problems.

### IOT -> DT/UI
**Live update path**

Recommended contract:
- WebSocket or similar push stream for selected live updates.

Why:
- good for dashboards and Unity views,
- easier than making every consumer a raw MQTT client,
- clean separation between ingestion and presentation.

## Should DT be the Unity executable?

### Recommendation
Probably yes for the MVP, or at least DT should contain the Unity-facing runtime if Unity is the main visualization environment.

A practical interpretation is:
- DT includes the twin graph and visualization-facing service layer,
- Unity is the primary front-end or rendering client of DT,
- Unity can be embedded as the visible DT executable or consume DT as a local companion service.

### Two viable shapes

#### Shape A, DT as one executable with Unity inside
Good for simplicity.

- DT executable is effectively the Unity-based digital twin app.
- It queries IOT and listens for live updates.
- It may also hold local twin graph logic.

Pros:
- simpler first user experience,
- fewer moving parts.

Cons:
- more code inside Unity,
- harder to keep clean separation between graph logic and rendering logic.

#### Shape B, DT service plus Unity client
Better architecture, slightly more moving parts.

- DT service executable handles twin graph and state composition.
- Unity client renders and interacts with DT service.

Pros:
- cleaner separation,
- easier remote deployment later,
- easier to support multiple front ends.

Cons:
- more work in MVP.

### Recommendation for now
Start with **Shape A.5**:
- DT is the official digital twin executable,
- Unity is the main DT runtime,
- but keep graph/state composition in a well-separated service layer inside DT so it can be extracted later if needed.

In other words, behave as if Shape B may come later.

## Process and Failure Boundaries

A separate-executable design gives useful failure isolation.

### If VC crashes
- simulation stops,
- IOT still retains history,
- DT can still show historical and last-known state,
- restart strategy is clearer.

### If IOT crashes
- live ingest stops,
- VC may buffer or drop according to policy,
- DT can still show stale/current cached state,
- history continuity becomes the main recovery concern.

### If DT crashes
- simulation and telemetry can continue,
- the city still runs,
- UI and visualization recover independently.

This is far healthier than a monolith where one failure takes the whole city with it in a single dramatic swoon.

## Buffering and Time Sync Considerations

Because the system will be split into executables, a few contracts should be explicit early:

- all timestamps should use UTC internally,
- IOT should record both source timestamp and ingest timestamp where useful,
- VC should be authoritative for simulated time,
- DT should never invent simulation time,
- buffering behavior should be defined if IOT becomes temporarily unavailable.

Recommended MVP rule:
- VC emits source timestamps based on simulation time,
- IOT records ingestion timestamps as real wall-clock time if needed,
- DT displays simulated time as the primary user-facing city time.

## Remote/Cloud Evolution Path

The first deployment is local Windows only, but the architecture should allow later evolution.

### Likely future move 1
Move **IOT** to a remote or cloud-hosted service.

Why:
- centralized storage,
- remote dashboards,
- easier multi-user access,
- better long-term analytics.

### Likely future move 2
Move **VC** to remote compute.

Why:
- simulation can become resource-heavy,
- easier to run longer-lived environments,
- better support for automated generation or multiple cities later.

### DT may remain local
DT may still remain local for:
- rendering performance,
- operator interaction,
- Unity-based visual control.

This is why the local MVP should already behave like three services, not three tabs in one confused process.

## Security and Identity Note

Even for a single-machine MVP, it is wise to design as if the parts are separate trust boundaries.

Recommended early assumptions:
- command APIs should not be anonymous forever,
- telemetry channels should have basic client identity or at least component identity,
- schema versioning should be explicit,
- local transport choices should not prevent TLS/auth later.

No need to overbuild this on day one, but one should at least avoid architectural innocence.

## Recommended Decision

Recommended decision for now:
- keep **VC**, **IOT**, and **DT** as separate executables from the start,
- let **VC** own simulation truth,
- let **IOT** own telemetry ingestion, state projection, and history,
- let **DT** own the twin graph and visualization-facing state,
- use **MQTT** for telemetry,
- use **HTTP** for commands and query APIs,
- use **WebSocket or similar** for live DT/UI updates,
- run all three on one Windows machine first,
- keep contracts clean so VC and IOT can later move off-machine.

## Suggested Follow-Up Tasks

After this research, the next useful implementation documents are:
1. `docs/EXECUTABLE_BOUNDARY_SPEC.md`
2. `docs/API_COMMAND_SURFACE.md`
3. `docs/MQTT_TOPIC_TAXONOMY.md`
4. `docs/DT_STATE_AND_GRAPH_MODEL.md`
5. `docs/IOT_STORAGE_MODEL.md`

## Sources

Primary sources used:
- Microsoft Learn, Understand and use device twins in IoT Hub: https://learn.microsoft.com/en-us/azure/iot-hub/iot-hub-devguide-device-twins
- Microsoft Learn, Understand and use module twins in IoT Hub: https://learn.microsoft.com/en-us/azure/iot-hub/iot-hub-devguide-module-twins
- Microsoft Learn, What is Azure Digital Twins?: https://learn.microsoft.com/en-us/azure/digital-twins/overview
- Microsoft Learn, Data ingress and egress for Azure Digital Twins: https://learn.microsoft.com/en-us/azure/digital-twins/concepts-data-ingress-egress
- Microsoft Learn, Architecture best practices for Azure IoT Hub: https://learn.microsoft.com/en-us/azure/well-architected/service-guides/azure-iot-hub
- Unity Manual, Windows standalone Player build binaries: https://docs.unity3d.com/2019.4/Documentation/Manual/WindowsStandaloneBinaries.html
- Unity Manual, Unity Standalone Player command line arguments: https://docs.unity3d.com/2019.4/Documentation/Manual/PlayerCommandLineArguments.html
- Electron docs, Packaging Your Application: https://www.electronjs.org/docs/latest/tutorial/tutorial-packaging
- Electron docs, Application Packaging: https://www.electronjs.org/docs/tutorial/application-distribution/

## Short conclusion

The right first boundary is not mysterious:
- **VC simulates**,
- **IOT stores and brokers**,
- **DT models and presents**.

Keep them separate now, even on one Windows machine, and future remote deployment becomes an extension instead of a reconstruction project.
