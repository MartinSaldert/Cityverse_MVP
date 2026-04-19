# Cityverse MVP, Claude Development Plan

## Purpose

This document translates the current architecture work into an implementation planning structure suitable for Claude, Codex, or other coding agents.

It is not yet a full ticket breakdown, but it defines the major development workstreams and their dependency order.

## Current Foundation Status

The project now has first-pass documentation for:
- project description
- tasks
- building metadata model
- IOT broker behavior
- weather research
- building electricity usage research
- electricity generation research
- IoT data transmission research
- executable boundary research
- MQTT topic taxonomy
- API command surface
- IOT storage model
- DT state and graph model
- telemetry message schema
- executable boundary spec

This is enough to begin serious implementation planning.

## Recommended Development Order

## Phase 1, contracts first
Build the shared contracts before the heavy runtime systems.

### Work items
1. define shared domain models
2. define telemetry message schema in code
3. define MQTT topic helpers/constants
4. define HTTP API request/response DTOs
5. define core entity IDs and type enums

### Why first
If we skip this, every executable will invent its own dialect and then act surprised when integration becomes archaeology.

## Phase 2, VC core simulation skeleton
Build the minimal VC runtime.

### Work items
1. simulation clock and time control
2. weather state model
3. generator model skeleton
4. building model skeleton
5. telemetry emission pipeline
6. command API shell

## Phase 3, IOT core ingest and storage
Build the minimal IOT runtime.

### Work items
1. MQTT ingest listener
2. telemetry validation and normalization
3. telemetry history persistence
4. latest-state projection updates
5. historical query API
6. current-state API

## Phase 4, DT core twin and scene state
Build the minimal DT runtime.

### Work items
1. entity metadata registry
2. relationship graph model
3. twin state projection ingestion
4. scene-ready projection generation
5. DT query API
6. basic live update stream

## Phase 5, first vertical slice
Connect all three executables in one end-to-end scenario.

### Suggested first slice
- one weather station
- two or three buildings
- one solar farm
- one gas generator
- whole-city aggregate metrics
- web UI controls for time/weather/generator on-off
- Unity-based DT showing live state

## Recommended Claude/Codex Workstreams

### Workstream A, shared contracts package
Deliverables:
- entity model types
- telemetry schema types
- topic taxonomy helpers
- API DTOs

### Workstream B, VC executable
Deliverables:
- simulation host
- time/weather loop
- building/generator stubs
- telemetry publisher
- command endpoints

### Workstream C, IOT executable
Deliverables:
- MQTT ingest service
- persistence layer
- latest-state projection service
- query APIs

### Workstream D, DT executable
Deliverables:
- twin graph service
- scene projection service
- Unity-facing API/state bundle layer

### Workstream E, integration harness
Deliverables:
- local Windows run scripts
- config files
- sample seeded dataset
- end-to-end smoke tests

## Suggested First Claude Tasks

### Task 1
Create the shared Cityverse contracts package.

### Task 2
Implement the first telemetry schema types and serializers.

### Task 3
Implement MQTT topic taxonomy helpers.

### Task 4
Scaffold `cityverse-vc` with time control and weather state.

### Task 5
Scaffold `cityverse-iot` with ingest endpoint and local DB schema.

### Task 6
Scaffold `cityverse-dt` with entity graph and scene state API.

## Immediate Human Review Points

Before large coding bursts, confirm:
- language/runtime choice for each executable
- DB choice for IOT MVP
- whether DT is Unity-first or DT-service-plus-Unity-client
- whether shared code lives in one repo or multiple packages

## Recommended Decision

Recommended next step after this document:
- create a more concrete implementation backlog with milestone-based Claude/Codex tasks
- likely one markdown plan per executable plus one integration plan

## Short conclusion

We are now close to the point where coding agents can be given sharply defined work instead of inspirational literature, which is progress by any civilized standard.
