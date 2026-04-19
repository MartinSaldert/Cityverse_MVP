# Cityverse MVP, Agent Task List

Date: 2026-04-17
Status: active execution draft

## Purpose

This document defines the concrete task split for The Sage and Claude-style coding agents for the first Cityverse vertical slice.

Current target:
1. VC with time, weather, and simple UI
2. IOT broker setup for live data transfer
3. Unity receiver of data

## Working Style

- The Sage owns architecture, task shaping, integration review, and execution flow
- Claude or another coding agent can take implementation chunks with explicit boundaries
- Tasks should be small enough to verify and integrate cleanly
- No agent should be asked to build the entire city in one feverish burst

## Task Group A, The Sage

### A1, Own the architecture and planning set
Deliver:
- roadmap
- milestone backlog
- technical decisions
- weather plan/spec/backlog
- vertical slice plan
- development plan

Status:
- in progress and largely complete in docs

### A2, Finalize exact stack/library recommendations
Deliver:
- concrete framework choices
- exact package/library recommendations
- implementation bootstrap doc

### A3, Shape implementation tasks for coding agents
Deliver:
- explicit task packets
- dependencies
- acceptance criteria

### A4, Review outputs from coding agents
Deliver:
- code review
- architecture conformance review
- integration validation

### A5, Own end-to-end integration
Deliver:
- verify VC to IOT path
- verify IOT to Unity path
- identify fixes and next steps

## Task Group B, Claude Task Packet, Shared Weather Slice Contracts

### B1, Create minimal shared contracts package for weather slice
Deliver:
- weather telemetry DTO
- weather summary DTO
- VC weather command DTOs
- current weather API DTO
- schema validation helpers

Acceptance criteria:
- DTOs are importable by VC and IOT
- serialization tests pass

### B2, Create weather MQTT topic helpers
Deliver:
- topic builder for weather telemetry
- parser or validator for weather topic

Acceptance criteria:
- topic usage is consistent across VC and IOT

## Task Group C, Claude Task Packet, VC Runtime

### C1, Scaffold `cityverse-vc`
Deliver:
- app shell
- config loading
- logging
- HTTP server
- health endpoint

### C2, Implement simulation clock
Deliver:
- simulation time
- pause/resume
- speed control
- set time/date API

### C3, Implement weather module skeleton
Deliver:
- weather state types
- weather service
- tick loop integration
- calendar/season/daylight support

### C4, Implement first-pass causal weather rules
Deliver:
- pressure, cloud, wind, humidity, temperature, precipitation interactions
- weather category derivation

### C5, Implement simple VC UI
Deliver:
- current time/date display
- current weather display
- controls for time/date/speed
- controls for pressure/cloud/wind or scenario changes

### C6, Implement weather telemetry publishing
Deliver:
- MQTT client publish path
- periodic weather messages

Acceptance criteria for VC packet:
- VC can run locally and expose a controllable weather simulation
- UI can change weather inputs live
- telemetry messages are emitted correctly

## Task Group D, Claude Task Packet, IOT Live Ingest

### D1, Scaffold `cityverse-iot`
Deliver:
- app shell
- config loading
- logging
- HTTP server
- health endpoint

### D2, Implement MQTT weather ingest
Deliver:
- subscribe to weather topic
- validate incoming payloads
- error logging

### D3, Implement current weather state projection
Deliver:
- latest-state store for weather
- current weather read model

### D4, Implement weather query endpoint
Deliver:
- `GET /weather/current` or similar endpoint

### D5, Optional, implement WebSocket weather update stream
Deliver:
- push latest weather changes to clients

Acceptance criteria for IOT packet:
- IOT receives VC weather telemetry and exposes latest state cleanly

## Task Group E, Claude Task Packet, Unity Receiver

### E1, Define Unity weather payload model
Deliver:
- C# DTO or equivalent data model matching current weather endpoint

### E2, Implement Unity weather client
Deliver:
- HTTP fetch client first, or WebSocket client if practical
- polling loop or subscription hook

### E3, Implement test MonoBehaviour receiver
Deliver:
- receives weather data
- logs or displays values
- exposes a simple debug panel or text output

### E4, Optional, bind first visible reaction
Deliver:
- light intensity driven by daylight
- text or simple material/color response for weather category

Acceptance criteria for Unity packet:
- Unity can consume live or latest weather state from the pipeline and show it in a verifiable way

## Recommended Assignment Order

### First
The Sage:
- finish stack selections
- package tasks cleanly

### Second
Claude packet B plus C:
- shared contracts
- VC runtime

### Third
Claude packet D:
- IOT live ingest

### Fourth
Claude packet E:
- Unity receiver

### Fifth
The Sage:
- integrate and review all packets

## Suggested First Claude Run Sequence

### Run 1
Take packets:
- B1
- B2
- C1
- C2

### Run 2
Take packets:
- C3
- C4
- C5
- C6

### Run 3
Take packets:
- D1
- D2
- D3
- D4

### Run 4
Take packets:
- E1
- E2
- E3
- E4 optional

This keeps the work incremental and testable.
A rare luxury in software, and therefore worth preserving.

## Definition of Success

We have succeeded when:
- VC runs a controllable weather simulation
- IOT receives the weather stream
- Unity receives the weather state
- the chain can be demonstrated live

## Short conclusion

This is the correct first execution split.
The city can wait. First we give it weather, a nervous system, and one set of eyes.
