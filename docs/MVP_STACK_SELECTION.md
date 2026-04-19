# Cityverse MVP, Stack Selection

Date: 2026-04-17
Status: selected for Phase 1 vertical slice

## Purpose

This document selects the concrete stack for the first Cityverse implementation slice.

Target slice:
1. VC with time, weather, and simple UI
2. IOT broker setup for live data transfer
3. Unity receiver of data

## Selected Stack Summary

### Core service runtime
- **Language:** TypeScript
- **Runtime:** Node.js
- **Package manager / workspace:** pnpm workspace
- **Monorepo style:** apps + packages

### Service web layer
- **HTTP framework:** Fastify
- **Validation and schemas:** Zod
- **WebSocket support:** Fastify WebSocket or plain `ws` depending on simplicity needs

### Messaging
- **MQTT client library:** `mqtt`
- **Broker for local development:** external local MQTT broker first

### Persistence for MVP
- **Initial IOT live slice:** in-memory current-state store
- **Next step after slice works:** SQLite
- **SQLite library recommendation:** `better-sqlite3`

### Front-end for VC simple UI
- **First version:** server-rendered or static simple web UI served by VC
- **Preferred first approach:** plain HTML + minimal client-side JavaScript

### Unity receiver
- **First transport:** HTTP polling of current state
- **Second transport later:** WebSocket live updates
- **Serialization:** Unity built-in JSON or lightweight helper as needed

### Testing
- **Unit/integration test runner:** Vitest

### Logging
- **Default logging:** Fastify logger or Pino-compatible logging

## Why These Choices

## TypeScript + Node.js
Why:
- fast iteration
- strong JSON and API ergonomics
- clean shared contract story
- excellent for Fastify, MQTT, and Zod
- good fit for coding agents

## pnpm workspace
Why:
- efficient monorepo dependency management
- good workspace support
- fast installs
- clean package linking

## Fastify
Why:
- fast and lightweight
- strong TypeScript support
- easy route setup
- good plugin ecosystem
- simple enough for VC and IOT service shells

## Zod
Why:
- good developer ergonomics
- excellent for DTO validation
- useful for config validation and runtime boundaries

## MQTT client `mqtt`
Why:
- standard and mature enough for MVP
- easy publish/subscribe setup
- low friction for the first slice

## In-memory current-state first for IOT
Why:
- fastest route to proving the live data chain
- avoids early storage overbuild
- current-state is enough for Unity receiver and debug workflows initially

## SQLite second
Why:
- practical local persistence step after the slice works
- easy to add once the event shape is stable

## Plain web UI first
Why:
- faster than setting up a larger front-end stack
- enough for operator controls in the first slice
- fewer moving parts while the backend is still settling

## Unity HTTP polling first
Why:
- simpler than WebSocket for first proof
- easy to test and debug
- sufficient for the first weather slice

## Selected Monorepo Layout

Recommended structure:

```text
Cityverse_MVP/
  apps/
    cityverse-vc/
    cityverse-iot/
  packages/
    contracts/
    config/
    logging/
    test-utils/
  unity/
    cityverse-receiver/
  docs/
```

## Phase 1 Package Responsibilities

### `apps/cityverse-vc`
Owns:
- simulation clock
- weather service
- simple UI
- weather command API
- MQTT weather publish

### `apps/cityverse-iot`
Owns:
- MQTT ingest
- weather payload validation
- in-memory latest weather state
- `/weather/current` endpoint
- optional WebSocket updates later

### `packages/contracts`
Owns:
- weather DTOs
- command DTOs
- topic helpers
- schema validation

### `unity/cityverse-receiver`
Owns:
- current weather DTO mapping
- HTTP client
- polling loop
- debug display MonoBehaviour

## Libraries to Install First

### Root / workspace
- `typescript`
- `pnpm`
- `vitest`
- `tsx`

### Shared contracts
- `zod`

### VC and IOT apps
- `fastify`
- `@fastify/static`
- `@fastify/formbody`
- `mqtt`
- `zod`

### IOT later persistence
- `better-sqlite3`

## Configuration Approach

Use simple environment or config files for:
- service ports
- MQTT broker URL
- city location
- weather defaults
- poll intervals

Recommended config files per app:
- `config/default.ts`
- optional `.env`

## First Concrete Implementation Targets

### Contracts target
- weather telemetry schema
- weather summary schema
- weather topic helper
- current weather API schema

### VC target
- `/health`
- `/api/time`
- `/api/weather/current`
- `/api/weather/nudge`
- simple UI page
- MQTT weather publisher

### IOT target
- `/health`
- `/weather/current`
- MQTT weather subscriber
- in-memory latest state store

### Unity target
- one MonoBehaviour polling `/weather/current`
- debug UI text showing values
- optional light intensity reaction

## Deferred Until After Slice Works

Do not prioritize yet:
- React or heavier front-end frameworks
- complex persistence architecture
- full DT graph service
- protobuf/gRPC
- multi-city support
- microservice deployment ceremony

## Short conclusion

This stack is intentionally pragmatic.
It is fast to build, easy to debug, and sufficient for the first Cityverse weather slice.
That is exactly what we need right now, and miraculously little more.
