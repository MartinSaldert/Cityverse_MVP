# Cityverse MVP, Claude Task Packets

Date: 2026-04-17
Status: ready for delegation

## Rules

- Claude is used for coding tasks only
- The Sage retains architecture and integration ownership
- Each packet should be implemented with minimal scope drift
- Each packet should leave the repo in a reviewable state

## Packet 1, Shared contracts for weather slice

### Goal
Create the minimal shared contracts package needed by VC and IOT for the first weather slice.

### Scope
Inside `packages/contracts`:
- scaffold package metadata and tsconfig
- implement weather telemetry DTOs
- implement weather summary DTOs
- implement weather command DTOs
- implement current weather API DTO
- implement MQTT weather topic helper
- export from index

### Preferred stack assumptions
- TypeScript
- Zod for schemas

### Acceptance criteria
- package builds conceptually cleanly
- DTOs and topic helpers are easy to import from VC and IOT
- no unrelated architecture added

## Packet 2, VC app shell plus simulation clock

### Goal
Create the first VC executable shell with HTTP server and simulation clock.

### Scope
Inside `apps/cityverse-vc`:
- scaffold package metadata and tsconfig
- add Fastify server
- implement `/health`
- implement simulation clock service with:
  - current time
  - pause/resume
  - speed multiplier
  - set time/date support
- expose simple time endpoints

### Acceptance criteria
- VC can start
- time state can be queried and changed
- code stays cleanly separable from weather logic

## Packet 3, VC weather runtime and simple UI

### Goal
Add the first weather runtime and a plain operator UI to VC.

### Scope
Inside `apps/cityverse-vc`:
- implement weather module structure
- implement first-pass weather state and update loop
- support date/season/daylight behavior
- support pressure/cloud/wind nudges
- implement `/api/weather/current`
- implement `/api/weather/nudge`
- serve a simple HTML UI showing current values and controls

### Acceptance criteria
- weather changes over time
- user can adjust values from the UI
- UI is simple but usable

## Packet 4, VC weather telemetry publisher

### Goal
Publish current weather telemetry from VC over MQTT.

### Scope
Inside `apps/cityverse-vc`:
- add MQTT client integration
- publish weather telemetry on interval
- use shared contracts topic helper and schema shapes
- keep broker URL configurable

### Acceptance criteria
- valid weather telemetry messages are published
- no unnecessary coupling to IOT internals

## Packet 5, IOT app shell plus weather ingest

### Goal
Create the first IOT executable shell and ingest live weather telemetry.

### Scope
Inside `apps/cityverse-iot`:
- scaffold package metadata and tsconfig
- add Fastify server
- implement `/health`
- add MQTT subscriber
- validate incoming weather telemetry
- maintain in-memory latest weather state
- implement `/weather/current`

### Acceptance criteria
- IOT receives VC weather telemetry
- latest weather can be queried over HTTP

## Packet 6, Unity weather receiver

### Goal
Create the first Unity-side receiver for current weather state.

### Scope
Inside `unity/cityverse-receiver` or documented Unity script files:
- define weather payload model in C#
- implement simple HTTP polling client
- implement MonoBehaviour that fetches `/weather/current`
- log or display values in a simple debug UI
- optional: bind daylight to light intensity

### Acceptance criteria
- Unity can consume current weather state from IOT
- values are visibly or verifiably surfaced

## Recommended execution order

1. Packet 1
2. Packet 2
3. Packet 3
4. Packet 4
5. Packet 5
6. Packet 6

## Review rule

After each packet:
- inspect file structure
- inspect architecture boundaries
- verify assumptions still match the plan

## Short conclusion

These packets are intentionally narrow enough to move quickly without asking Claude to improvise an entire civilization from one markdown file.
