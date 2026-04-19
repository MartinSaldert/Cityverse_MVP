# Cityverse MVP, Executable Boundary Spec

## Purpose

This document turns the higher-level runtime research into a concrete first-pass boundary specification for:
- VC
- IOT
- DT

It is intended to be implementation-facing.

## Canonical Executables

The first MVP should assume three canonical executables:
- `cityverse-vc`
- `cityverse-iot`
- `cityverse-dt`

For the first deployment, all three run on one Windows machine.

## VC Boundary

### VC owns
- simulation time/date progression
- weather state and progression
- buildings, occupancy, and energy behavior
- traffic behavior
- generator behavior
- synthetic sensor generation
- simulation-affecting command execution

### VC exposes
- HTTP command API
- selected HTTP state queries
- MQTT telemetry publishing to IOT

### VC does not own
- telemetry history persistence
- latest-state projection store as the main platform source
- DT graph logic
- long-term analytics storage

## IOT Boundary

### IOT owns
- MQTT ingest
- telemetry validation and normalization
- telemetry history storage
- latest-state projections
- aggregates and rollups
- replay datasets and replay jobs
- export and query APIs
- live fan-out stream for subscribers

### IOT exposes
- MQTT broker or MQTT ingest listener
- HTTP history/state/export APIs
- WebSocket or similar live stream

### IOT does not own
- simulation progression
- DT graph modeling
- scene rendering
- direct simulation logic

## DT Boundary

### DT owns
- entity/twin model
- relationship graph
- scene-ready state composition
- view modes and visualization-facing projections
- focus and layer control

### DT exposes
- HTTP twin/graph/query APIs
- WebSocket or similar scene/live state updates
- Unity-facing scene bundles

### DT does not own
- raw telemetry history as the primary source
- authoritative simulation truth
- MQTT ingestion as a primary concern

## Communication Contracts

### VC -> IOT
- MQTT telemetry

### UI/DT -> VC
- HTTP commands for simulation changes

### UI/DT -> IOT
- HTTP queries for history/current state

### IOT -> DT/UI
- WebSocket or similar live update stream
- HTTP current-state responses

## Failure Isolation Expectations

### If VC fails
- simulation pauses or stops
- IOT and DT remain available

### If IOT fails
- ingest and history break
- VC may buffer or drop according to policy
- DT can still display stale cached state if available

### If DT fails
- simulation and storage continue
- only visualization/control is affected

## Deployment Evolution

The boundary must support later evolution where:
- VC runs remotely
- IOT runs remotely
- DT may remain local or become remote

That means APIs and message contracts should not assume same-process shortcuts.

## Recommended Decision

Recommended decision for now:
- implement as three explicit executables from day one
- keep contracts transport-based and service-like
- resist merging responsibilities just because the first deployment is on one machine

## Short conclusion

This is the practical boundary:
- VC simulates
- IOT stores and brokers
- DT models and presents

Which is pleasingly simple, and therefore worth defending.
