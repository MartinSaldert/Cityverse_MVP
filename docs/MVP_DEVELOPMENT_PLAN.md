# Cityverse MVP, Development Plan

Date: 2026-04-17
Status: active working plan

## Purpose

This document defines what we should start with for the first practical implementation phase.

Martin's current requested first build order is:
1. VC with time, weather, and simple UI
2. IOT broker setup at least for live data transfer
3. Unity receiver of data

This plan translates that into a disciplined execution path.

## Phase 1 Goal

Build the first end-to-end weather slice for Cityverse.

The slice should prove:
- VC can simulate time and weather
- weather can be controlled live
- weather data can be pushed through IOT
- Unity can receive and react to the data

## Phase 1 Deliverables

### D1, VC time system
- simulation clock
- pause/resume
- speed control
- set date/time

### D2, VC weather runtime
- initial weather engine
- day/night behavior
- season-aware baseline behavior
- reactive weather controls

### D3, VC operator UI
- show time and date
- show weather values
- modify time/date
- modify speed
- nudge weather values
- show weather category

### D4, VC telemetry publishing
- weather telemetry output over MQTT

### D5, IOT live ingest layer
- subscribe to VC weather telemetry
- validate payloads
- maintain current weather state
- expose current weather query
- optional live push stream

### D6, Unity weather receiver
- receive current or live weather updates
- expose them in a test MonoBehaviour or debug UI
- optionally map some values to scene lighting or logs

## Recommended Phase Order

## Step 1, shared contracts for weather slice only
Do the minimum shared contracts needed for this vertical slice:
- weather telemetry DTO
- MQTT topic helper for weather
- VC weather command DTOs
- IOT current weather response DTO

Do not wait for the entire future contract universe to be perfected.
We are building a vertical slice, not canon law.

## Step 2, VC standalone implementation
Build VC until it can run the whole weather loop locally with UI.

### Success condition
A user can:
- start VC
- change time to January or July
- set speed to 10x
- increase cloud cover
- lower pressure
- see weather values react over time

## Step 3, IOT live ingest implementation
Build the smallest useful IOT slice.

### Success condition
IOT receives VC weather telemetry and exposes current weather state through a simple endpoint.

## Step 4, Unity receiver implementation
Build a simple Unity-side client.

### Success condition
Unity can receive current or live weather updates and surface them in scene/debug output.

## Step 5, end-to-end integration and tuning
Verify the chain and fix the obvious breaks.

## Suggested Technical Shape for Phase 1

### VC
- Node/TypeScript app
- HTTP server
- simple web UI
- internal weather service
- MQTT client publisher

### IOT
- Node/TypeScript app
- MQTT subscriber
- in-memory current-state store first, optional SQLite immediately after
- HTTP endpoint for latest weather state
- optional WebSocket for live updates

### Unity
- C# client
- HTTP polling first or WebSocket if easy enough
- debug UI or scene controller script

## Recommendation for Unity integration order

Start with **HTTP polling or simple current-state fetch first** if that gets us moving faster.
Then add live streaming after the first chain works.

Why:
- simpler debugging
- fewer moving parts initially
- faster proof that the data model is correct

This is not ideological. It is sensible sequencing.

## Immediate Build Priorities

### Priority A
VC weather runtime and simple UI

### Priority B
Weather telemetry contract and publish path

### Priority C
IOT ingest and latest weather endpoint

### Priority D
Unity receiver and test display

## Exit Criteria for Phase 1

Phase 1 is complete when:
- VC can run time and weather independently
- VC UI can change weather/time inputs live
- VC publishes weather telemetry
- IOT receives weather telemetry and exposes latest state
- Unity consumes the latest weather state and updates visibly or in debug output

## What Comes After Phase 1

After this works, we can expand to:
- building energy responses
- solar and wind farm simulation
- richer live updates
- DT scene state composition
- storage/history and replay
- richer Unity presentation

## Short conclusion

The correct place to start is not the entire city.
It is the first working weather slice across VC, IOT, and Unity.
Once that exists, the rest of the city can attach to something real.
