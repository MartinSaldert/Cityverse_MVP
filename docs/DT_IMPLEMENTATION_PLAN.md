# Cityverse MVP, DT Implementation Plan

## Session note, 2026-04-22

A substantial Unity-first DT UI implementation pass has already started, and AI/avatar planning has now been added as a parallel design track.

That means this plan should now be read alongside the current Unity runtime work, not as a blank-slate DT design document.

### Where the Unity DT UI stands now
- Unity is currently acting as the visualization-facing DT client against IOT
- live building data is already flowing into Unity from `http://localhost:3002/buildings/current`
- live weather data is already flowing into Unity from `http://localhost:3002/weather/current`
- the active UI direction is a **Canvas-based hybrid DT UX**:
  - one small marker per building
  - one shared world-space quick card
  - one shared HUD detail panel
  - one time/weather widget in the HUD
- installer/menu path exists in Unity:
  - `Tools/Cityverse/Install Building UI`
  - `Tools/Cityverse/Switch To Expert Mode`
  - `Tools/Cityverse/Switch To Kids Mode`
- code now also includes interaction-side building components for hover/click selection behavior

### Practical starting point for the next session
Start from the live Unity scene, not from theory.

First checks tomorrow should be:
1. run `Tools/Cityverse/Install Building UI`
2. verify building markers are installed on all buildings
3. verify hover shows the shared quick card
4. verify click updates the shared HUD detail panel
5. verify weather/time widget opens the intended weather HUD
6. verify kids mode and expert mode both render correctly
7. continue UI polish only after the shared marker/hover/click path is behaving correctly

### Recommended immediate next implementation focus
Before any larger DT service-layer expansion, finish the current Unity DT UX slice:
- interaction polish for hover/click/select
- kids mode verification and polish
- weather HUD behavior and weather widget binding
- removal/fallback strategy for old legacy overlay components
- visual polish on marker, quick card, and HUD hierarchy

### Parallel planning track now active: Cityverse AI assistant
A separate but related planning track is now active for an AI assistant that can:
- interact with VC controls
- discuss system results
- analyze scenario changes across the VC → IOT → DT chain
- later support a speaking avatar presence in the DT

Current recommendation:
- Phase 1 and 2 should be **tool-driven and cloud-first**
- predictive reasoning should come from a scenario-analysis layer, not model guessing
- Phase 3 should introduce a focused RAG layer for docs/runbooks/history
- Phase 4 may add local inference support (Mac and/or DGX Spark)

### Parallel planning track now active: avatar embodiment
Avatar planning also started.

Current recommendation:
- use a Unity-native avatar
- use Animator-driven idle/breathing/pose layers
- use audio-driven lip sync / facial animation for speech
- likely investigate NVIDIA Audio2Face for the speech/facial layer
- do not expect Audio2Face to replace the general pose/idle animation system

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
