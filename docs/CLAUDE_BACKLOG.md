# Cityverse MVP, Claude Backlog

## Purpose

This document is the first concrete implementation backlog for Cityverse MVP.

It breaks the current architecture into practical development tasks suitable for Claude, Codex, or similar coding agents.

## Backlog Structure

The backlog is organized by:
- milestone,
- executable,
- dependency order,
- expected output.

## Milestone 1, Shared Contracts and Foundations

### BL-001, Create shared contracts package
**Owner:** shared

Deliver:
- entity ID types
- entity type enums
- metric name enums or constants
- common time types
- dataset/session context types

Dependency:
- none

### BL-002, Implement telemetry message schema in code
**Owner:** shared

Deliver:
- telemetry message DTOs
- event DTOs
- validation helpers
- serialization tests

Dependency:
- BL-001

### BL-003, Implement MQTT topic taxonomy helpers
**Owner:** shared

Deliver:
- topic builder helpers
- topic parser helpers
- topic validation tests

Dependency:
- BL-001

### BL-004, Implement API DTO package
**Owner:** shared

Deliver:
- VC command request/response DTOs
- IOT query DTOs
- DT query DTOs
- common response envelope

Dependency:
- BL-001

## Milestone 2, VC Skeleton

### BL-010, Scaffold `cityverse-vc`
**Owner:** VC

Deliver:
- executable shell
- config loading
- HTTP host
- logging setup
- health endpoint

Dependency:
- BL-004

### BL-011, Implement simulation clock
**Owner:** VC

Deliver:
- simulation time service
- pause/resume/speed support
- set time and set date support

Dependency:
- BL-010

### BL-012, Implement weather state service
**Owner:** VC

Deliver:
- weather state model
- current weather snapshot
- manual override support
- day/night integration hooks

Dependency:
- BL-011

### BL-013, Implement building state skeleton
**Owner:** VC

Deliver:
- building entity model
- occupancy fields
- baseline power-demand fields
- battery state fields

Dependency:
- BL-010

### BL-014, Implement generator state skeleton
**Owner:** VC

Deliver:
- generator entity model
- generator mode/state
- output target support
- weather-driven renewable hooks

Dependency:
- BL-010

### BL-015, Implement VC command API
**Owner:** VC

Deliver:
- time commands
- weather commands
- generator start/stop commands
- simulation speed commands

Dependency:
- BL-011, BL-012, BL-014

### BL-016, Implement telemetry publisher
**Owner:** VC

Deliver:
- MQTT publish integration
- weather telemetry publish
- building telemetry publish
- generator telemetry publish
- aggregate telemetry publish

Dependency:
- BL-002, BL-003, BL-012, BL-013, BL-014

## Milestone 3, IOT Skeleton

### BL-020, Scaffold `cityverse-iot`
**Owner:** IOT

Deliver:
- executable shell
- config loading
- HTTP host
- MQTT ingest host
- logging setup
- health endpoint

Dependency:
- BL-004

### BL-021, Implement storage schema
**Owner:** IOT

Deliver:
- telemetry history schema
- latest-state projection schema
- entity metadata schema
- datasets schema
- replay jobs schema
- operations log schema

Dependency:
- BL-020

### BL-022, Implement telemetry ingest pipeline
**Owner:** IOT

Deliver:
- topic subscription
- schema validation
- normalization
- history persistence
- failure logging

Dependency:
- BL-002, BL-003, BL-021

### BL-023, Implement latest-state projection updater
**Owner:** IOT

Deliver:
- per-entity latest state updates
- aggregate state updates
- current-state query access

Dependency:
- BL-022

### BL-024, Implement historical query API
**Owner:** IOT

Deliver:
- history query by entity
- history query by metric
- time-window filtering
- aggregate query endpoints

Dependency:
- BL-021, BL-022

### BL-025, Implement live update stream
**Owner:** IOT

Deliver:
- WebSocket or equivalent stream
- subscription filtering
- current-state change events

Dependency:
- BL-023

### BL-026, Implement dataset import and replay controls
**Owner:** IOT

Deliver:
- dataset registry
- import endpoint
- replay job tracking
- replay control endpoints

Dependency:
- BL-021, BL-024

## Milestone 4, DT Skeleton

### BL-030, Scaffold `cityverse-dt`
**Owner:** DT

Deliver:
- executable shell
- config loading
- HTTP host
- live update client
- logging setup
- health endpoint

Dependency:
- BL-004

### BL-031, Implement entity registry and metadata layer
**Owner:** DT

Deliver:
- entity metadata store
- entity type handling
- district/building/generator/weather entity support

Dependency:
- BL-030

### BL-032, Implement relationship graph model
**Owner:** DT

Deliver:
- relationship storage
- graph queries
- graph traversal helpers

Dependency:
- BL-031

### BL-033, Implement twin state projection layer
**Owner:** DT

Deliver:
- twin current-state store
- merge of metadata + current state
- per-entity twin queries

Dependency:
- BL-031

### BL-034, Implement scene projection layer
**Owner:** DT

Deliver:
- whole-city scene bundle
- district scene bundle
- view mode projections
- scene-ready entity summaries

Dependency:
- BL-032, BL-033

### BL-035, Implement DT query API
**Owner:** DT

Deliver:
- twin query endpoints
- graph query endpoints
- scene bundle endpoints
- focus/view-mode endpoints

Dependency:
- BL-034

## Milestone 5, First End-to-End Vertical Slice

### BL-040, Build first seeded demo city
**Owner:** integration

Deliver:
- one city
- two villas
- one apartment building
- one office
- one solar farm
- one gas generator
- one weather station
- one whole-city aggregate

Dependency:
- BL-013, BL-014, BL-021, BL-031

### BL-041, Wire VC to IOT end-to-end
**Owner:** integration

Deliver:
- live telemetry flow verified
- current-state flow verified
- history storage verified

Dependency:
- BL-016, BL-022, BL-023

### BL-042, Wire IOT to DT end-to-end
**Owner:** integration

Deliver:
- DT twin updates from IOT
- DT scene bundle updates
- live update stream verified

Dependency:
- BL-025, BL-033, BL-034

### BL-043, Add first operator UI controls
**Owner:** DT/UI

Deliver:
- set time
- weather override
- generator on/off
- summary panels for power and CO2

Dependency:
- BL-015, BL-035

## Milestone 6, Research Follow-Through

### BL-050, Implement weather baseline import
**Owner:** VC/IOT

Deliver:
- Open-Meteo-backed import pipeline or cached ingest path

### BL-051, Implement first building load archetypes
**Owner:** VC

Deliver:
- villa archetype
- apartment archetype
- office archetype
- datacenter placeholder archetype

### BL-052, Implement first generator behavior models
**Owner:** VC

Deliver:
- solar generation model
- wind generation model
- gas ccgt model
- oil backup model
- mini nuclear placeholder model

### BL-053, Implement first CO2 model
**Owner:** VC/IOT

Deliver:
- generator CO2
- building electricity-linked CO2
- city aggregate CO2

## Recommended First Agent Assignments

### Shared contracts agent
Take:
- BL-001
- BL-002
- BL-003
- BL-004

### VC agent
Take:
- BL-010 through BL-016

### IOT agent
Take:
- BL-020 through BL-026

### DT agent
Take:
- BL-030 through BL-035

### Integration agent
Take:
- BL-040 through BL-043

## Short conclusion

This backlog is the first version of the real work.

At last, the city has stopped being only an idea and begun the more honorable process of becoming a pile of tasks.
