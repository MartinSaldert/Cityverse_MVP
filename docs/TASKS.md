# Cityverse MVP, Tasks

## Purpose

This file tracks the first research and implementation tasks for Cityverse MVP.

The project direction is currently:
- one virtual city,
- synthetic IoT data generation,
- DT alignment,
- simulation of time, weather, buildings, occupancy, traffic, emissions, and energy systems,
- realistic data flow between VC, IOT, and DT.

## Current implementation snapshot, verified 2026-04-20

Already implemented in code:
- monorepo scaffold
- shared contracts package
- VC executable entrypoint and Fastify server
- VC operator UI
- VC simulation clock controls
- VC weather simulation and weather nudge API
- VC energy summary generation
- VC city aggregate summary generation
- VC MQTT publish for weather and energy
- IOT executable entrypoint and Fastify server
- IOT MQTT ingest for weather and energy
- IOT current weather, energy, demand, and city aggregate endpoints
- Unity receiver docs for weather and energy polling

Not yet implemented or not yet verified strongly enough:
- expanded automated tests beyond current smoke coverage
- explicit building entity model in VC
- explicit generator control model in VC
- CO2 model
- traffic model
- live push consumption path for Unity

Already manually verified end to end on the target Windows PC:
- MQTT broker plus VC plus IOT plus Unity polling path

## Immediate practical tasks

### 1. Expand automated smoke tests
Goal:
- strengthen the current test suite so the verified vertical slice stays verified

Minimum useful coverage:
- VC health and route shape checks
- IOT health and route shape checks
- contract validation for sample payloads
- city aggregate calculation sanity checks
- demand calculation sanity checks
- targeted checks for weather nudge behavior and downstream shape stability

Status: in progress, first smoke suite exists  
Priority: very high

### 2. Keep the Windows PC vertical slice as the regression baseline
Goal:
- preserve the manually verified Windows workflow as the reference acceptance path after code changes

Check:
- VC starts
- IOT starts
- MQTT broker is reachable
- VC publishes weather and energy telemetry
- IOT receives weather and energy telemetry
- Unity receives weather and energy over HTTP polling

Status: manually verified  
Priority: very high  
Primary docs: `docs/WINDOWS_PC_TEST_PLAN.md`, `docs/PC_VERIFIED_TEST_WORKFLOW.md`, `docs/PC_REGRESSION_CHECKLIST.md`

### 3. Define the MVP building roster
Goal:
- lock the first believable building set for the demo so simulation and Unity scene work stop drifting

Recommended first roster:
- 2 villas
- 1 apartment building
- 1 office building
- 1 retail building
- 1 school or municipal building
- 1 utility node or substation visual anchor

Status: pending  
Priority: high

### 4. Replace placeholder city demand logic with explicit building-driven demand
Goal:
- move from a single aggregate formula to a small but explicit building set and building-level contribution model

Desired result:
- each building contributes demand based on type, occupancy pattern, and weather sensitivity
- city demand becomes an aggregate of actual simulated building records

Status: pending  
Priority: very high

### 5. Extend energy model beyond renewable-only summary
Goal:
- move from current solar plus wind summary into a more explicit generator model

Desired result:
- dispatchable generator support
- generator state and mode
- start/stop controls
- clearer city balance behavior

Status: pending  
Priority: high

### 6. Add CO2 model after building and generator definitions stabilize
Goal:
- expose believable live emissions tied to demand and generation mix

Status: pending  
Priority: medium-high  
Dependency: building and generator model stabilization

## Research tasks

### 7. Investigate weather simulation options
Research a weather simulation approach that is realistic enough for Cityverse MVP and practical to integrate.

Questions to answer:
- Should we build a lightweight custom weather system for the MVP?
- Is there an existing weather simulator or open-source framework we can reuse or adapt?
- Are there GitHub projects that simulate seasonal weather, day/night cycles, wind, rain, cloud cover, and solar radiation in a way that could drive our city systems?
- Which approach integrates best with our likely simulation stack?

Requirements for a useful solution:
- supports time and date awareness,
- supports seasonal variation,
- affects daylight and night/day cycle,
- exposes variables such as temperature, precipitation, wind, and solar input,
- can influence energy generation and city behavior,
- is practical for MVP integration.

Status: researched, first pass complete  
Priority: high  
Document: `docs/RESEARCH_01_WEATHER_SIMULATION.md`

### 8. Investigate realistic building electricity usage statistics
Find realistic usage patterns and statistics for different building types.

Building categories to research:
- villas / detached houses,
- apartment buildings,
- office buildings,
- shopping malls / retail,
- datacenter,
- possibly schools, industrial buildings, and mixed-use buildings later.

Questions to answer:
- What are realistic daily and seasonal electricity usage patterns for each building type?
- How does usage vary by occupancy, time of day, and season?
- What metadata should each building hold to support simulation?
- What parameters are needed for proper electrical monitoring, including kWh usage, kW demand, battery usage, and load profiles?
- Are there public datasets or benchmark models we can use for baseline values?

Target outputs:
- representative usage curves,
- recommended metadata fields,
- candidate source datasets,
- kWh and kW monitoring parameters,
- battery-related parameters where relevant,
- MVP simplification strategy.

Status: researched, first pass complete  
Priority: high  
Document: `docs/RESEARCH_02_BUILDING_ELECTRICITY_USAGE.md`

### 9. Investigate electricity generation statistics and models
Research realistic generation behavior for different power sources.

Generation types to investigate:
- wind farms,
- solar farms,
- mini nuclear plant,
- gas or oil plant.

Questions to answer:
- What are realistic generation profiles for each source?
- How should output vary with weather and time?
- What control logic or constraints should exist for dispatchable generators like gas, oil, or nuclear?
- What public datasets or engineering references can provide useful baseline values?

Important simulation requirement:
- generation must be weather-sensitive where appropriate,
- low wind should reduce wind generation,
- low solar radiation should reduce solar generation.

Target outputs:
- baseline production ranges,
- weather dependency rules,
- operational constraints,
- recommended MVP approximation model.

Status: researched, first pass complete  
Priority: high  
Document: `docs/RESEARCH_03_ELECTRICITY_GENERATION_MODELS.md`

### 10. Investigate CO2 emissions modeling after the building model is finalized
Research how to calculate believable real-time CO2 emissions for the city once building types and metadata are finalized.

This task should begin after the building definitions are stable enough to support meaningful emissions calculations.

Questions to answer:
- How should building electricity usage map to CO2 emissions?
- How should emissions vary depending on the active energy mix?
- How should traffic emissions be estimated in the MVP?
- How should direct emissions from generation sources such as oil or gas plants be modeled?
- What public references, benchmark factors, or engineering assumptions are suitable for a first-pass MVP model?

Important simulation requirement:
- CO2 must react in real time to simulation state,
- colder weather should increase emissions where heating or electricity demand rises,
- dirtier generators coming online should increase emissions,
- traffic activity should affect transport emissions,
- cleaner generation should reduce city-wide emissions intensity.

Target outputs:
- recommended emissions model,
- emissions factors or baseline coefficients,
- per-building and city-wide aggregation strategy,
- MVP simplification rules.

Status: pending  
Priority: medium-high  
Dependency: finalize building definitions and metadata first

### 11. Define the next web control UI for VC
Design the next version of the webpage-based control surface for operating the simulation.

Current UI already supports:
- time and date setting
- pause and resume
- speed changes
- weather nudges
- live clock, weather, energy, and city views

Next questions:
- what controls are required for buildings and generators?
- what live values should be highlighted for demo use?
- should operator and dashboard views be separated later?
- how should CO2 be surfaced once implemented?

Status: partially implemented, refinement pending  
Priority: high

### 12. Major investigation: realistic IoT data transmission and consumption architecture
Investigate in detail how IoT data and related information should move between simulated sensors in the city, IOT, and the Unity-based visual DT.

This is a major architectural task and should be treated as one of the core investigations of the project.

Questions to answer:
- How would real-world sensors or edge devices normally publish their data?
- Which transport and messaging patterns should be considered for the MVP, for example MQTT, HTTP, WebSocket, event streaming, polling, or hybrid approaches?
- How should simulated sensors in VC be represented so the transmission pattern still resembles reality?
- How should IOT ingest, normalize, store, and expose this data?
- How should Unity and DT consume the data, through push, pull, subscriptions, replay queries, or a combination?
- Which architecture most closely matches real-world IoT systems while still being practical for a Windows MVP?
- How should the interfaces be designed so VC and IOT can later run remotely or in the cloud?

Target outputs:
- recommended end-to-end data flow architecture,
- protocol and transport recommendations,
- message schema considerations,
- live vs historical consumption strategy,
- Unity consumption strategy,
- separation-of-concerns recommendations for VC, IOT, and DT.

Status: researched, first pass complete  
Priority: very high  
Document: `docs/RESEARCH_06_IOT_DATA_TRANSMISSION_AND_CONSUMPTION_ARCHITECTURE.md`

### 13. Define executable and deployment boundaries
Document the runtime boundaries between VC, IOT, and DT.

Questions to answer:
- What belongs inside VC?
- What belongs inside IOT?
- What belongs inside DT?
- What communication contracts should exist between them?
- What assumptions are safe when all three run on one Windows machine?
- What must be designed differently to allow later remote or cloud deployment of VC and IOT?

Required current direction:
- VC must be a separate executable,
- IOT must be a separate executable,
- DT must be a separate executable,
- all three should run on the same Windows computer in the first setup.

Future direction to account for:
- VC may later run remotely,
- IOT may later run remotely,
- the system should not depend on all components always being in one process or one machine.

Status: researched, first pass complete  
Priority: high  
Document: `docs/RESEARCH_07_EXECUTABLE_AND_DEPLOYMENT_BOUNDARIES.md`

## Core requirements to carry forward

### Time system
The city must simulate:
- time,
- date,
- progression of time,
- season-aware calendar behavior.

### Day and night cycle
The city must support:
- day/night changes,
- daylight variation depending on season and date,
- links between daylight and weather.

### Building system
The city should include multiple building types, for example:
- villas,
- offices,
- shopping malls,
- apartment buildings,
- datacenter,
- additional urban structures later.

Each building should eventually have metadata such as:
- building type,
- occupancy type,
- number of residents, workers, or visitors,
- activity schedules,
- energy usage profile,
- battery or storage properties where relevant,
- thermal characteristics,
- IoT device or sensor profile.

### Energy system
The city should include electricity generation sources such as:
- wind farms,
- solar farms,
- mini nuclear plant,
- gas or oil plant.

These should have realistic generation behavior and appropriate dependency on:
- weather,
- time of day,
- operational constraints.

The city should also support:
- building-level batteries where relevant,
- realistic kWh usage tracking,
- current kW demand monitoring,
- local storage behavior,
- grid import and export logic later.

### CO2 emissions
The whole city and the city’s individual parts should expose real-time CO2 emissions data.

CO2 should react to simulation state, for example:
- colder weather increasing demand,
- oil or gas generation increasing emissions,
- higher building electricity usage increasing emissions,
- traffic increasing emissions.

### Executable separation
The architecture should currently assume:
- VC as a separate executable,
- IOT as a separate executable,
- DT as a separate executable,
- all running on the same Windows machine in the first MVP.

The architecture should also leave room for later remote or cloud deployment of VC and IOT.

## Suggested next documentation

After the next round of implementation, create or update:
- `docs/CURRENT_IMPLEMENTATION_STATUS.md`
- `docs/MVP_SCOPE.md`
- `docs/ENERGY_SYSTEM_MODEL.md`
- `docs/WEATHER_SYSTEM_NOTES.md`
- `docs/SENSOR_TAXONOMY.md`
- `docs/DT_DATA_CONSUMPTION.md`
