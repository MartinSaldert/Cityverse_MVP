# Cityverse MVP, VC Implementation Plan

## Purpose

This document defines the first implementation plan for **VC**.

VC is the authoritative simulation executable. It owns the city’s evolving behavior and emits synthetic telemetry into IOT.

## Core Responsibilities

VC must own:
- simulation time/date progression
- weather state and progression
- day/night logic
- building behavior
- occupancy behavior
- electricity demand behavior
- generator behavior
- traffic behavior later
- scenario overrides
- synthetic telemetry generation

## First MVP Scope for VC

The first working VC should support:
- simulation clock
- current weather state
- a small set of buildings
- a small set of generators
- whole-city aggregate calculations
- command API for time/weather/generator control
- MQTT telemetry publishing to IOT

## Phase 1, executable skeleton

### Deliver
- `cityverse-vc` executable
- config loading
- logging
- HTTP host
- health endpoint

## Phase 2, simulation time and control

### Deliver
- simulation clock service
- pause/resume support
- speed multiplier support
- set time/date command support
- simulation summary endpoint

## Phase 3, weather system

### Deliver
- weather state model
- day/night flag
- sunrise/sunset support or placeholder
- manual weather override
- weather preset support
- current weather query endpoint

## Phase 4, building model

### Deliver
- building entity model
- static metadata loading
- current occupancy fields
- current power-demand fields
- battery state fields where applicable
- current CO2 placeholder fields

Recommended first building types:
- villa
- apartment
- office

## Phase 5, generator model

### Deliver
- generator entity model
- generator mode/state
- start/stop support
- current output fields
- solar and gas first-pass behavior
- city aggregate generation calculations

Recommended first generator types:
- solar
- gas ccgt
- oil backup placeholder

## Phase 6, telemetry publisher

### Deliver
- MQTT connection
- topic helper integration
- telemetry publish scheduler
- event publish support
- weather/building/generator aggregate messages

## Phase 7, command API

### Deliver
- time commands
- simulation speed commands
- weather override commands
- generator start/stop commands
- summary/state queries

## Recommended Internal Modules

Suggested internal module layout:
- `core/clock`
- `core/weather`
- `core/buildings`
- `core/generators`
- `core/aggregates`
- `telemetry/publisher`
- `api/http`
- `config`
- `logging`

## Recommended First Vertical Slice

The first VC demo should simulate:
- one weather station
- two villas
- one office
- one apartment building
- one solar farm
- one gas generator
- one whole-city aggregate

And emit:
- weather telemetry
- building power telemetry
- generator output telemetry
- city aggregate power and CO2 telemetry

## Open Decisions to Confirm

Before implementation starts in earnest, confirm:
- language/runtime for VC
- simulation tick rate
- config format
- whether weather starts purely local or partially data-backed
- whether traffic is phase 1 or phase 2

## Short conclusion

VC should start small but authoritative.

If it can tell time, change weather, run a few buildings and generators, and emit believable telemetry, then it is already doing the part that matters most.
