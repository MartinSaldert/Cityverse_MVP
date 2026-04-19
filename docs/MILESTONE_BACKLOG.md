# Cityverse MVP, Milestone Backlog

## Purpose

This document turns the existing backlog into a milestone-ordered execution plan with clear dependencies, acceptance criteria, and recommended implementation order.

It is intended to be the practical build sheet for Cityverse MVP.

## Working Assumptions

Unless explicitly changed later, this backlog assumes:
- three separate executables: VC, IOT, DT
- all run locally on one Windows machine for the MVP
- shared contracts are implemented before executable-specific message handling
- the first meaningful demo is a small seeded city slice

## Milestone M0, Technical Decisions and Repo Setup

### M0-01, Confirm runtime stack
**Deliver**
- written decision for language/runtime
- written decision for HTTP stack
- written decision for MQTT stack
- written decision for persistence stack

**Acceptance criteria**
- no unresolved critical runtime decision blocks implementation
- decisions are documented in project docs

### M0-02, Define repo/package layout
**Deliver**
- monorepo or multi-repo decision
- package/app naming rules
- shared package placement
- config and env conventions

**Acceptance criteria**
- developers and coding agents can scaffold without guessing structure

### M0-03, Create implementation bootstrap docs
**Deliver**
- local run instructions
- config bootstrap instructions
- service port map
- local dependency list

**Acceptance criteria**
- a new contributor can understand how the system is expected to start locally

## Milestone M1, Shared Contracts and Foundations

### M1-01, Create shared contracts package
**Maps to:** BL-001

**Deliver**
- entity ID types
- entity type enums
- metric constants or enums
- common time types
- dataset/session context types

**Acceptance criteria**
- package builds cleanly
- basic imports work from placeholder VC/IOT/DT apps

### M1-02, Implement telemetry message schema in code
**Maps to:** BL-002

**Deliver**
- telemetry DTOs
- event DTOs
- schema validation helpers
- serialization tests

**Depends on**
- M1-01

**Acceptance criteria**
- representative telemetry payloads validate successfully
- invalid payloads fail predictably
- schema round-trip tests pass

### M1-03, Implement MQTT topic taxonomy helpers
**Maps to:** BL-003

**Deliver**
- topic builders
- topic parsers
- topic validation tests

**Depends on**
- M1-01

**Acceptance criteria**
- topics can be constructed from entity metadata
- incoming topics can be parsed back into structured parts
- tests cover expected topic families

### M1-04, Implement API DTO package
**Maps to:** BL-004

**Deliver**
- VC command DTOs
- IOT query DTOs
- DT query DTOs
- common response envelope

**Depends on**
- M1-01

**Acceptance criteria**
- DTOs are importable by all services
- request/response shapes cover current planned endpoints

## Milestone M2, Executable Skeletons

### M2-01, Scaffold `cityverse-vc`
**Maps to:** BL-010

**Deliver**
- executable shell
- config loading
- logging
- HTTP host
- health endpoint

**Depends on**
- M1-04

**Acceptance criteria**
- service starts and answers health checks

### M2-02, Scaffold `cityverse-iot`
**Maps to:** BL-020

**Deliver**
- executable shell
- config loading
- logging
- HTTP host
- MQTT ingest host or client integration
- health endpoint

**Depends on**
- M1-04

**Acceptance criteria**
- service starts and answers health checks
- MQTT layer initializes cleanly

### M2-03, Scaffold `cityverse-dt`
**Maps to:** BL-030

**Deliver**
- executable shell
- config loading
- logging
- HTTP host
- live update client shell
- health endpoint

**Depends on**
- M1-04

**Acceptance criteria**
- service starts and answers health checks

### M2-04, Establish local integration config
**Deliver**
- default ports
- local service URLs
- MQTT connection config
- local environment templates

**Depends on**
- M2-01, M2-02, M2-03

**Acceptance criteria**
- all three services can be pointed at each other with local config only

## Milestone M3, VC Core Simulation

### M3-01, Implement simulation clock
**Maps to:** BL-011

**Deliver**
- simulation time service
- pause/resume support
- speed multiplier support
- set time/date support

**Depends on**
- M2-01

**Acceptance criteria**
- time advances predictably
- pause/resume works
- changing speed affects simulation rate correctly

### M3-02, Implement weather state service
**Maps to:** BL-012

**Deliver**
- weather state model
- current weather snapshot
- manual override support
- day/night integration hooks

**Depends on**
- M3-01

**Acceptance criteria**
- current weather can be queried
- manual override takes effect without restart

### M3-03, Implement building state skeleton
**Maps to:** BL-013

**Deliver**
- building entity model
- occupancy fields
- baseline power-demand fields
- battery state fields

**Depends on**
- M2-01

**Acceptance criteria**
- sample buildings can be created in simulation state
- building summaries expose expected fields

### M3-04, Implement generator state skeleton
**Maps to:** BL-014

**Deliver**
- generator entity model
- mode/state handling
- output target support
- renewable behavior hooks

**Depends on**
- M2-01

**Acceptance criteria**
- sample generators can be created and controlled
- generator summaries expose expected fields

### M3-05, Implement VC command API
**Maps to:** BL-015

**Deliver**
- time commands
- weather commands
- generator commands
- simulation speed commands

**Depends on**
- M3-01, M3-02, M3-04

**Acceptance criteria**
- commands succeed through HTTP
- command responses reflect real state changes

### M3-06, Implement telemetry publisher
**Maps to:** BL-016

**Deliver**
- MQTT publish integration
- weather telemetry
- building telemetry
- generator telemetry
- city aggregate telemetry

**Depends on**
- M1-02, M1-03, M3-02, M3-03, M3-04

**Acceptance criteria**
- VC publishes valid messages on expected topics
- representative telemetry stream can be observed externally

## Milestone M4, IOT Ingest and Query Core

### M4-01, Implement storage schema
**Maps to:** BL-021

**Deliver**
- telemetry history schema
- latest-state projection schema
- entity metadata schema
- datasets schema
- replay jobs schema
- operations log schema

**Depends on**
- M2-02

**Acceptance criteria**
- schema can be created from a clean environment
- basic persistence smoke tests pass

### M4-02, Implement telemetry ingest pipeline
**Maps to:** BL-022

**Deliver**
- topic subscription
- schema validation
- normalization
- history persistence
- failure logging

**Depends on**
- M1-02, M1-03, M4-01

**Acceptance criteria**
- valid telemetry is ingested and stored
- invalid telemetry is rejected and logged

### M4-03, Implement latest-state projection updater
**Maps to:** BL-023

**Deliver**
- per-entity latest-state updates
- aggregate state updates
- current-state access layer

**Depends on**
- M4-02

**Acceptance criteria**
- current state reflects latest ingested values
- aggregate state updates are queryable

### M4-04, Implement historical query API
**Maps to:** BL-024

**Deliver**
- history-by-entity query
- history-by-metric query
- time-window filtering
- aggregate query endpoints

**Depends on**
- M4-01, M4-02

**Acceptance criteria**
- queries return expected data for seeded ingestion cases

### M4-05, Implement live update stream
**Maps to:** BL-025

**Deliver**
- WebSocket or equivalent stream
- subscription filtering
- current-state change events

**Depends on**
- M4-03

**Acceptance criteria**
- connected clients receive state changes in near real time

## Milestone M5, DT Twin and Scene Core

### M5-01, Implement entity registry and metadata layer
**Maps to:** BL-031

**Deliver**
- entity metadata store
- entity type handling
- district/building/generator/weather entity support

**Depends on**
- M2-03

**Acceptance criteria**
- DT can load and return core entity metadata

### M5-02, Implement relationship graph model
**Maps to:** BL-032

**Deliver**
- relationship storage
- graph queries
- traversal helpers

**Depends on**
- M5-01

**Acceptance criteria**
- DT can answer basic graph queries for demo entities

### M5-03, Implement twin state projection layer
**Maps to:** BL-033

**Deliver**
- twin current-state store
- metadata + current-state merge
- per-entity twin queries

**Depends on**
- M5-01

**Acceptance criteria**
- DT returns merged twin state for demo entities

### M5-04, Implement scene projection layer
**Maps to:** BL-034

**Deliver**
- whole-city scene bundle
- district scene bundle
- view mode projections
- scene-ready entity summaries

**Depends on**
- M5-02, M5-03

**Acceptance criteria**
- DT returns scene bundles suitable for a client renderer

### M5-05, Implement DT query API
**Maps to:** BL-035

**Deliver**
- twin query endpoints
- graph query endpoints
- scene bundle endpoints
- focus/view-mode endpoints

**Depends on**
- M5-04

**Acceptance criteria**
- DT query endpoints cover planned demo interactions

## Milestone M6, First Vertical Slice

### M6-01, Build first seeded demo city
**Maps to:** BL-040

**Deliver**
- one city
- two villas
- one apartment building
- one office
- one solar farm
- one gas generator
- one weather station
- whole-city aggregate

**Depends on**
- M3-03, M3-04, M4-01, M5-01

**Acceptance criteria**
- all seeded entities exist with IDs, metadata, and basic state

### M6-02, Wire VC to IOT end to end
**Maps to:** BL-041

**Deliver**
- live telemetry flow verification
- current-state verification
- history verification

**Depends on**
- M3-06, M4-02, M4-03

**Acceptance criteria**
- telemetry emitted by VC appears in IOT history and current-state views

### M6-03, Wire IOT to DT end to end
**Maps to:** BL-042

**Deliver**
- DT twin updates from IOT
- DT scene updates from IOT
- live update stream verification

**Depends on**
- M4-05, M5-03, M5-04

**Acceptance criteria**
- DT state changes when IOT state changes
- scene bundles reflect updated values

### M6-04, Add first operator UI controls
**Maps to:** BL-043

**Deliver**
- set time
- weather override
- generator on/off
- summary panels for power and CO2

**Depends on**
- M3-05, M5-05

**Acceptance criteria**
- operator can change core conditions and observe results live

## Milestone M7, Realism Upgrades

### M7-01, Implement weather baseline import
**Maps to:** BL-050

### M7-02, Implement first building load archetypes
**Maps to:** BL-051

### M7-03, Implement first generator behavior models
**Maps to:** BL-052

### M7-04, Implement first CO2 model
**Maps to:** BL-053

**Acceptance criteria for milestone**
- city behavior becomes causally believable across time, weather, load, generation, and emissions

## Recommended Build Order Right Now

Start here:
1. M0-01
2. M0-02
3. M0-03
4. M1-01 through M1-04
5. M2-01 through M2-04
6. M3-01 through M3-06
7. M4-01 through M4-05
8. M5-01 through M5-05
9. M6-01 through M6-04

## Critical Blockers to Resolve Early

The main blockers still visible in the planning set are:
- runtime/language choice
- DB choice for IOT MVP
- exact DT service versus Unity-client split
- repo/package structure

These are not decorative details. They determine whether the backlog turns into software or merely another noble pile of markdown.

## Definition of Ready for Coding Agents

A task is ready for a coding agent when:
- its dependencies are complete or intentionally stubbed
- input and output boundaries are defined
- acceptance criteria are explicit
- target package or executable is known
- runtime stack assumptions are documented

## Short conclusion

This backlog is now suitable as the working execution plan.

What remains is not more philosophical planning. It is choosing the stack, then building the thing with some discipline and a minimum of theatrical self-sabotage.
