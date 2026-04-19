# Cityverse MVP, DT Implementation Plan

## Purpose

This document defines the first implementation plan for **DT**.

DT is the twin graph, current-state composition, and visualization-facing executable for Cityverse MVP.

## Core Responsibilities

DT must own:
- entity metadata composition
- relationship graph
- current twin state
- scene-ready projections
- view modes
- focus and layer state
- Unity-facing state bundles

## First MVP Scope for DT

The first working DT should support:
- entity registry
- relationships between districts, buildings, generators, and weather stations
- current twin state projection
- whole-city and district scene bundles
- basic view modes
- simple focus and scene query APIs

## Phase 1, executable skeleton

### Deliver
- `cityverse-dt` executable
- config loading
- logging
- HTTP host
- live update client
- health endpoint

## Phase 2, entity and relationship layer

### Deliver
- entity metadata registry
- district/building/generator/weather entity support
- relationship store
- graph query support

## Phase 3, current-state composition

### Deliver
- ingestion of current-state updates from IOT
- per-entity twin state merge
- twin query endpoints

## Phase 4, scene projection layer

### Deliver
- whole-city scene bundle
- district scene bundle
- physical view mode
- power view mode
- CO2 heatmap view mode
- weather overlay mode

## Phase 5, UI and Unity-facing query surface

### Deliver
- scene state query endpoints
- focus entity endpoint
- focus district endpoint
- layer visibility state
- active view mode state

## Recommended Internal Modules

Suggested internal module layout:
- `entities`
- `graph`
- `twins`
- `scene`
- `views`
- `api/http`
- `api/live`
- `config`
- `logging`

## Recommended First Vertical Slice

The first DT demo should:
- show a whole-city view
- show district grouping
- render buildings and generators as distinct entities
- reflect weather state
- reflect current power and CO2 values
- allow focus on one building

## Open Decisions to Confirm

Before implementation starts in earnest, confirm:
- whether DT is Unity-first or service-plus-Unity-client
- how much graph logic lives inside the Unity runtime vs separate service layer
- how scene bundles are versioned

## Short conclusion

DT should make the city understandable.

If IOT remembers and VC behaves, DT must make the whole thing legible to humans, which is no small mercy.
