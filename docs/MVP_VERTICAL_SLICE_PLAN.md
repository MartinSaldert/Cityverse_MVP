# Cityverse MVP, Vertical Slice Plan

Date: 2026-04-17
Status: execution plan draft

## Purpose

This document defines the first development slice to build now.

The goal is not to finish all of Cityverse at once.
The goal is to build the first working chain:
- VC with time, weather, and a simple UI
- IOT broker setup for live data transfer
- Unity receiver of data

Once this chain works, the project will have a real spine.
After that, refinement becomes practical instead of speculative.

## Target Outcome

The first vertical slice is successful when:
- VC starts and simulates time
- VC runs the first weather system
- a simple UI can show and change time/weather controls
- VC publishes live weather telemetry
- IOT receives and relays or stores the live telemetry
- Unity receives the weather/state data and reflects it visibly or at least in logs/state

## Scope of This Slice

## In scope
- simulation clock in VC
- weather runtime in VC
- simple VC control UI
- live telemetry publishing from VC
- IOT live ingest path
- IOT current-state relay or live stream
- Unity-side receiver/client
- one weather station style data path

## Out of scope for this slice
- full building simulation
- full generator simulation
- long historical replay
- full DT graph system
- polished UI
- detailed CO2 model
- district-level weather variation

That work can come after the chain exists.

## Slice Architecture

### VC
Owns:
- simulation time
- simulation speed
- weather state
- UI commands for weather/time
- weather telemetry publishing

### IOT
Owns:
- live telemetry ingest
- validation and current-state projection
- simple live update output for downstream consumers

### Unity receiver
Owns:
- connect to downstream state/live endpoint
- receive weather updates
- expose them in scene logic, debug UI, or logs

## Recommended MVP Shape

## Phase A, VC standalone weather demo
Build VC first so it can:
- start
- tick time
- run weather
- show current values
- accept weather/time controls locally

This gives immediate proof that the simulation itself works.

## Phase B, VC to IOT live data path
Then connect VC telemetry to IOT so:
- live weather data leaves VC
- IOT receives it
- IOT exposes current weather state

This proves the transport path.

## Phase C, Unity receiver
Then build the Unity receiver so it can:
- connect to IOT or DT-facing state output
- receive live weather updates
- display or log weather values
- eventually drive visual reactions later

This proves the first end-to-end loop.

## Detailed Deliverables

## Deliverable 1, VC time system
Must support:
- current simulation time
- current date
- pause/resume
- speed multiplier
- set time/date

## Deliverable 2, VC weather runtime
Must support:
- weather state bootstrap on start
- weather update loop
- season-aware behavior
- day/night behavior
- parameter changes during runtime

## Deliverable 3, simple VC UI
Must support:
- view current time/date
- change time/date
- change simulation speed
- view weather values
- nudge or force weather variables
- show weather category

This UI can be simple web UI or local operator page.
It does not need to win beauty contests.

## Deliverable 4, VC live telemetry publisher
Must support publishing at least:
- timestamp
- temperature
- pressure
- humidity
- cloud cover
- precipitation
- wind speed
- solar radiation
- weather category
- isDay

## Deliverable 5, IOT live ingest and current state
Must support:
- telemetry subscription
- message validation
- current state projection
- simple current weather query
- optional live push stream

For this slice, history persistence is useful but not mandatory if it slows down the chain too much.
Current-state and live relay matter most first.

## Deliverable 6, Unity live receiver
Must support:
- connection to current-state or live update source
- deserialization of weather payloads
- display of current values in logs, HUD, or test object behavior

Examples of first useful Unity reactions:
- show current weather text on screen
- adjust directional light intensity based on `isDay` or sunlight
- print wind and temperature updates in debug UI

## Recommended Implementation Order

1. VC time runtime
2. VC weather runtime
3. VC simple UI
4. VC weather telemetry publish
5. IOT live ingest and current-state output
6. Unity receiver and debug display
7. first end-to-end test

## Acceptance Criteria

The vertical slice is done when:
- changing time in VC updates weather over time
- increasing cloud lowers solar output in VC state
- VC publishes updated weather telemetry live
- IOT receives and exposes the current weather state
- Unity receives updates without manual file editing or restarts
- one operator can run the slice and see the chain function end to end

## Risks and Simplifications

### Risk 1, overbuilding IOT too early
Mitigation:
- prioritize live ingest and current-state first
- defer broad historical tooling until the slice works

### Risk 2, overcomplicating Unity integration
Mitigation:
- start with a plain receiver and debug visualization
- do not begin with advanced scene FX

### Risk 3, overengineering weather
Mitigation:
- implement the first causal rules only
- tune later after the pipeline works

## Short conclusion

This slice is the correct place to start.
It gives us:
- simulation
- transport
- reception

Which is the minimum respectable skeleton for Cityverse before we ask it to become clever.
