# Cityverse MVP, Master Roadmap

## Purpose

This document is the execution-facing roadmap for Cityverse MVP.

It connects the project vision, executable boundaries, implementation plans, and backlog into one ordered path from architecture to a working first demo.

## Current Planning Status

Cityverse MVP already has:
- project description
- executable boundary specification
- telemetry and API planning
- implementation plans for VC, IOT, and DT
- a first backlog draft
- first-pass research for weather, building loads, generation, and IoT architecture

What this roadmap adds is:
- milestone order
- dependency-aware delivery path
- exit criteria for each milestone
- a clear definition of what counts as MVP success

## MVP Outcome

The first useful MVP is complete when the system can:
- run VC, IOT, and DT as separate executables on one Windows machine
- simulate time and weather in VC
- simulate a small city slice with a few buildings and generators
- emit believable synthetic telemetry over MQTT
- ingest, validate, and store telemetry in IOT
- expose current and historical state from IOT
- build twin and scene-ready state in DT
- show a live city view and basic operator controls
- let an operator change time, weather, and generator state and see the consequences

## Architectural Guardrails

The following rules should hold throughout implementation:
- VC is the authoritative simulation runtime
- IOT is the authoritative telemetry ingest and storage runtime
- DT is the authoritative twin composition and visualization-facing runtime
- service boundaries should remain explicit even though the MVP runs on one machine
- contracts should be shared, versionable, and transport-shaped
- avoid hidden same-process shortcuts that would block later remote deployment

## Delivery Strategy

Recommended delivery sequence:
1. shared contracts first
2. executable skeletons second
3. first end-to-end telemetry slice third
4. first DT scene projection fourth
5. operator UI fifth
6. realism upgrades after the core loop works

This order is intentionally boring. Boring is excellent when one is trying not to build three incompatible systems at once.

## Milestone 0, Technical Foundation Decisions

### Goal
Lock the decisions that unblock serious implementation.

### Must decide
- primary language/runtime for shared code and services
- HTTP framework approach
- MQTT library/broker approach
- database choice for IOT MVP
- repo/package structure
- whether DT is implemented as service-plus-Unity-client or more Unity-first

### Recommended default decisions
Unless a better local constraint exists, the sensible MVP default is:
- TypeScript/Node.js for shared contracts and service executables
- SQLite for IOT MVP persistence
- external or embedded MQTT broker, but treated as explicit infrastructure
- DT as a service with a Unity client consuming scene bundles
- monorepo structure with shared contracts package plus three executable apps

### Exit criteria
- decisions written down in project docs
- repo/package structure agreed
- no critical runtime-choice ambiguity remains

## Milestone 1, Shared Contracts and Foundations

### Goal
Create the common language used by VC, IOT, and DT.

### Deliver
- entity IDs and entity type enums
- metric constants or enums
- shared time/date types
- telemetry message DTOs
- event DTOs
- MQTT topic helpers
- API DTOs for VC, IOT, and DT
- serialization and validation tests

### Why it matters
If the contracts are unstable, every later milestone becomes integration archaeology.

### Exit criteria
- shared package builds and tests cleanly
- all executables can import the same contract types
- telemetry examples round-trip through validation and serialization

## Milestone 2, Executable Skeletons

### Goal
Stand up the three runtimes with configuration, logging, and health surfaces.

### Deliver
- `cityverse-vc` executable shell
- `cityverse-iot` executable shell
- `cityverse-dt` executable shell
- config loading in each service
- logging setup in each service
- HTTP host and health endpoints in each service
- MQTT host/client integration in IOT and publish client in VC

### Exit criteria
- all three executables start locally
- all three expose health endpoints
- configuration is externalized and environment-safe
- logs are readable enough to debug startup and message flow

## Milestone 3, VC Core Simulation Slice

### Goal
Make VC capable of producing coherent simulation state.

### Deliver
- simulation clock with pause/resume/speed controls
- set time and set date commands
- weather state model with manual override
- day/night support hooks
- building skeletons with occupancy and power-demand fields
- generator skeletons with state and output fields
- aggregate city metrics calculation hooks
- VC command API

### Exit criteria
- VC can be started and controlled over HTTP
- VC can report current simulation summary
- at least one weather state and one generator state can be changed live
- building and generator entities exist as simulation objects, not just concepts in a markdown file

## Milestone 4, IOT Core Ingest and State Slice

### Goal
Make IOT reliably receive and remember telemetry.

### Deliver
- storage schema
- telemetry ingest listener
- schema validation and normalization
- telemetry history persistence
- latest-state projection updates
- current-state query endpoint
- historical query endpoint
- initial aggregate query support

### Exit criteria
- valid telemetry from VC is stored
- malformed telemetry is rejected and logged
- current-state responses reflect most recent updates
- simple history queries work over time windows

## Milestone 5, DT Core Twin and Scene Slice

### Goal
Make DT capable of turning state into a usable twin and scene representation.

### Deliver
- entity metadata registry
- district/building/generator/weather entity support
- relationship graph model
- twin current-state merge layer
- whole-city scene bundle
- district scene bundle
- basic view modes
- DT query API

### Exit criteria
- DT can answer twin queries for key entities
- DT can produce a whole-city scene bundle
- DT can produce a focused district or building view
- DT scene output reflects changing live state from IOT

## Milestone 6, First End-to-End Vertical Slice

### Goal
Prove the core system loop with one small city.

### Deliver
- one seeded city
- two villas
- one apartment building
- one office
- one solar farm
- one gas generator
- one weather station
- whole-city aggregate metrics
- verified VC to IOT telemetry flow
- verified IOT to DT state flow

### Exit criteria
- changing time or weather in VC changes outgoing telemetry
- IOT stores both history and current state
- DT updates scene-ready state from IOT changes
- one operator can observe the loop end to end without manual file edits

## Milestone 7, Operator UI

### Goal
Give the system a usable human control surface.

### Deliver
- operator webpage or equivalent control UI
- time controls
- date controls
- weather override controls
- generator on/off controls
- simulation play/pause/speed controls if practical
- summary panels for weather, power, and CO2

### Exit criteria
- operator can change core simulation conditions without developer tools
- operator can observe current state and major aggregates live
- the UI is useful for demos, not merely technically present

## Milestone 8, Realism and Research Follow-Through

### Goal
Upgrade the MVP from technically connected to believably useful.

### Deliver
- baseline weather import or weather profile system
- first building load archetypes
- first generator behavior models
- first CO2 model
- improved entity metadata fidelity
- initial dataset import and replay path

### Exit criteria
- telemetry values are causally believable
- city behavior changes across time, weather, and generator conditions in visible ways
- the demo begins to resemble a synthetic urban system rather than a polite spreadsheet with scenery

## MVP Success Definition

Cityverse MVP should be considered successful when all of the following are true:
- the three-executable architecture is real and working
- the first seeded city runs reliably on one machine
- telemetry moves end to end with clear contracts
- current state and history are queryable
- DT provides live scene-ready outputs
- an operator can manipulate core simulation conditions live
- the system produces believable enough outputs to support demos, testing, and follow-on development

## Non-Goals for the First MVP

The first MVP does not need to fully solve:
- full traffic simulation
- detailed pedestrian simulation
- highly accurate physical power-grid modeling
- exhaustive emissions science
- large-scale geographic city generation
- production-grade cloud deployment
- final-polish visualization

These may arrive later. Civilization survives by sequencing its ambitions.

## Recommended Immediate Next Step

After this roadmap, the next practical step is:
- convert the backlog into milestone-gated execution tasks with acceptance criteria and recommended order inside each milestone

That backlog should be treated as the working build plan.

## AI roadmap companion

A dedicated AI roadmap now also exists:
- `docs/CITYVERSE_AI_MASTER_ROADMAP.md`

That document should guide the portable OpenClaw skill, operator API/tooling layer, scenario analysis, retrieval, DT-aware reasoning, and later avatar embodiment work.
