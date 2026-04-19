# Cityverse MVP, Technical Decisions

Date: 2026-04-17
Status: first decision draft

## Purpose

This document records the first practical technology decisions for Cityverse MVP.

The goal is not to declare eternal truth. The goal is to remove enough ambiguity that implementation can begin cleanly.

## Decision Summary

The current recommended MVP stack is:
- **VC**: TypeScript/Node.js service
- **IOT**: TypeScript/Node.js service
- **DT service layer**: TypeScript/Node.js service
- **DT visual client**: Unity client consuming DT scene/state APIs
- **Telemetry transport**: MQTT
- **Command/query transport**: HTTP for commands and queries, WebSocket for live updates
- **IOT database**: SQLite for MVP
- **Repo structure**: monorepo
- **Weather system**: hybrid weather architecture with VC as authority, local solar/daylight logic, and Open-Meteo as baseline source

## Why This Stack

These choices best match the current project requirements:
- three separate executables
- Windows-first MVP
- future remote deployment support
- Unity as the main visualization environment
- realistic IoT-style architecture
- fast implementation without building three incompatible runtimes out of wounded pride

---

## 1. Runtime and Language Choice

## Decision
Use **TypeScript on Node.js** as the default implementation language for shared contracts, VC, IOT, and the DT service layer.

## Why
Advantages:
- one language across shared contracts and services
- fast scaffolding and iteration
- strong support for HTTP, WebSocket, MQTT, validation, and SQLite tooling
- good developer ergonomics for coding agents
- easy JSON/message schema handling
- easy monorepo package sharing
- simple local execution on Windows

## Why not make Unity/C# the core runtime for everything
Unity and C# are very valuable for the visual client, but making Unity the authoritative platform runtime would create unnecessary coupling for:
- weather authority
- simulation services
- telemetry infrastructure
- future remote deployment

Unity should be the renderer and interactive twin client, not the hidden backend for all system responsibilities.

## Caveat
If a later phase proves that VC specifically benefits from a .NET simulation core, that can be revisited. But for MVP speed and coherence, TypeScript is the cleanest starting point.

---

## 2. Repo and Package Structure

## Decision
Use a **monorepo**.

## Recommended layout
- `apps/cityverse-vc`
- `apps/cityverse-iot`
- `apps/cityverse-dt`
- `packages/contracts`
- `packages/config`
- `packages/logging`
- `packages/test-utils`
- `unity/` for the Unity client project or adapter package
- `docs/`

## Why
Advantages:
- shared contracts stay version-aligned
- cross-service refactors are manageable
- coding agents can work with less ambiguity
- local development is easier
- integration tests are easier to stage

## Rule
Shared transport contracts must live in `packages/contracts`, not be copied into each app like a folk tradition.

---

## 3. Telemetry Transport Choice

## Decision
Use **MQTT** for telemetry from VC to IOT.

## Why
Advantages:
- realistic IoT publishing model
- natural fit for simulated sensors and device-like entities
- supports topic taxonomy cleanly
- good future path from localhost to remote deployment
- easy to explain and test

## Recommended MVP shape
- VC publishes weather, building, generator, and aggregate telemetry over MQTT
- IOT subscribes, validates, normalizes, and persists
- DT does not consume raw MQTT as its primary integration path

## Rationale
This keeps ingestion and presentation separate, which is a surprisingly rare act of maturity.

---

## 4. Command and Query Transport Choice

## Decision
Use:
- **HTTP** for commands and queries
- **WebSocket** for live state updates from IOT and/or DT

## Why
Commands need explicit success/failure behavior.
Queries need request/response semantics.
Live dashboards and Unity benefit from push updates.

## Recommended split
- UI or DT sends simulation-changing commands to VC over HTTP
- UI or DT queries historical and current state from IOT over HTTP
- DT or UI receives live state changes from IOT over WebSocket

## Why not commands over MQTT for MVP
Possible, yes. Wise for the first version, no.
HTTP is easier to debug, easier to document, and less likely to create accidental command chaos.

---

## 5. IOT Database Choice

## Decision
Use **SQLite** for the IOT MVP.

## Why
Advantages:
- trivial local setup on one Windows machine
- sufficient for MVP scale
- excellent for rapid iteration and demo environments
- supports historical queries and latest-state projections without infrastructure burden
- easier for seeded one-year dataset workflows

## Suggested storage split inside SQLite
Use logical tables for:
- telemetry history
- latest entity state
- entity metadata
- datasets
- replay jobs
- operations log

## Why not PostgreSQL first
PostgreSQL is a strong later option, especially for remote or larger-scale deployment.
But starting with it now would add operational weight before the MVP has earned the ceremony.

## Upgrade path
Design the persistence layer behind a clean repository boundary so SQLite can be replaced later if needed.

---

## 6. DT Architecture Choice

## Decision
Use **DT as a service plus Unity client**.

## Shape
- `cityverse-dt` owns graph, twin state composition, and scene bundle APIs
- Unity is the primary visual client consuming DT state and scene bundles
- Unity may also issue focus and interaction requests, but it is not the canonical twin backend

## Why
Advantages:
- keeps twin logic outside the Unity scene lifecycle
- makes testing easier
- preserves remote deployment flexibility
- avoids turning visualization into infrastructure by accident

## Not recommended for MVP
Do not make DT exclusively Unity-internal from day one.
That would collapse service and client concerns too early.

---

## 7. Weather System Choice

## Decision
Use a **hybrid weather system**.

### The hybrid model
1. **VC owns the authoritative weather state**
2. **VC computes day/night and solar behavior locally**
3. **Open-Meteo provides baseline historical and forecast weather inputs**
4. **VC adds synthetic overrides, scenario forcing, and anomaly injection**
5. **IOT receives normalized weather telemetry from VC**
6. **DT and Unity consume weather state downstream, not as source of truth**

## Why this is the right weather decision
A pure custom weather simulator would be flexible but risks unrealistic outputs and slower progress.
A Unity weather package would help visuals but is the wrong authority layer.
Open-Meteo alone is useful data, but not a full simulation system.

The hybrid model gives us:
- believable baseline weather
- seeded one-year history capability
- realistic wind and solar inputs
- local deterministic day/night logic
- controllable scenarios for demos and testing
- clean separation from Unity visuals

## Concrete weather recommendation for MVP

### Authoritative weather service behavior in VC
VC should maintain a weather state object with fields such as:
- timestamp
- latitude and longitude
- timezone
- season
- sunrise and sunset
- isDay
- temperature
- wind speed and direction
- cloud cover
- precipitation
- humidity
- solar radiation or sunlight intensity
- weather category
- source mode: baseline, override, synthetic, replay

### Baseline data source
Use **Open-Meteo** for:
- historical weather seeding
- baseline real-world weather scenarios
- forecast-like baseline inputs for live mode if useful

### Local daylight and solar logic
Implement deterministic local logic in VC for:
- day/night state
- sunrise/sunset
- solar position or simplified solar intensity curve

For MVP, a simpler astronomy implementation is acceptable first.
It does not need to begin life as a doctoral defense in celestial mechanics.

### Scenario layer
VC should support:
- manual weather override
- temporary scenario forcing such as storm, heatwave, high wind, heavy cloud
- anomaly injection for testing
- blending from baseline weather into forced scenarios

## Recommended phased weather implementation

### Weather Phase W1
- fixed city location
- Open-Meteo historical import for one seeded year
- local day/night and sunrise/sunset computation
- current weather snapshot state in VC
- manual override support

### Weather Phase W2
- weather interpolation across time steps
- synthetic perturbation layer
- solar and wind generation hooks
- building load response hooks

### Weather Phase W3
- replayable weather scenarios
- anomaly library
- district micro-variation if later needed

---

## 8. MQTT Broker Choice

## Decision
For MVP, keep the broker approach simple and explicit.

### Recommended options
Preferred order:
1. use a standard external local MQTT broker during development
2. optionally embed broker behavior inside IOT later if that proves simpler operationally

## Why
An external broker keeps the architecture honest and the debugging clearer.
Embedding is tempting, but temptation has founded many bad systems.

If Martin wants minimal external moving parts, we can still evaluate an embedded approach after the first working telemetry slice.

---

## 9. Validation and Schema Choice

## Decision
Use code-defined DTOs with explicit runtime validation.

## Why
Cityverse has multiple services and message boundaries.
Validation should be present at the edges, not merely hoped for in the middle.

## Recommendation
Define schemas once in shared contracts and use them for:
- VC publish validation
- IOT ingest validation
- API request validation
- serialization tests

---

## 10. Immediate Follow-Up Decisions Still Worth Making

The most important next technical choices to lock after this document are:
- exact Node framework choices for HTTP and WebSocket
- exact schema-validation library
- exact SQLite access layer
- exact MQTT library
- exact Unity integration shape for the DT client
- how seeded historical weather import should be stored and versioned

## Recommended next step
Create a second document called something like:
- `MVP_STACK_SELECTION.md`

That document should pick the concrete libraries, for example:
- HTTP framework
- validation library
- SQLite library
- MQTT client library
- monorepo tooling
- test runner

## Short conclusion

The most important decision here is not merely which library to install.
It is the structural choice that:
- VC simulates,
- IOT ingests and stores,
- DT composes and presents,
- Unity renders,
- weather is authoritative in VC but informed by real baseline data.

That gives Cityverse a credible architecture and a weather system that is both useful and controllable, which is rather more than many grand projects manage in their first serious week.
