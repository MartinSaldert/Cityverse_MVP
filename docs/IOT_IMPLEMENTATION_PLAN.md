# Cityverse MVP, IOT Implementation Plan

## Purpose

This document defines the first implementation plan for **IOT**.

IOT is the telemetry ingress, normalization, persistence, projection, and query executable for Cityverse MVP.

## Core Responsibilities

IOT must own:
- MQTT ingest
- telemetry validation
- normalization
- telemetry history persistence
- latest-state projections
- dataset import and replay support
- aggregate calculations or rollups
- query APIs
- live update fan-out

## First MVP Scope for IOT

The first working IOT should support:
- MQTT ingest for telemetry
- history storage
- latest-state projection storage
- HTTP query API
- WebSocket or similar live updates
- dataset registry and basic replay controls

## Phase 1, executable skeleton

### Deliver
- `cityverse-iot` executable
- config loading
- logging
- HTTP host
- MQTT host/client integration
- health endpoint

## Phase 2, storage layer

### Deliver
- storage schema creation
- telemetry history table or collection
- entity state projection table or collection
- entity metadata table or collection
- datasets table or collection
- replay jobs table or collection
- operations log table or collection

## Phase 3, ingest pipeline

### Deliver
- MQTT topic subscription
- schema validation
- normalization logic
- history persistence
- projection update pipeline
- ingest error logging

## Phase 4, query API

### Deliver
- history query endpoint
- current entity state endpoint
- aggregate query endpoint
- dataset listing endpoint
- replay status endpoint

## Phase 5, live update stream

### Deliver
- subscription-capable live update stream
- entity filtering
- aggregate filtering
- selected twin/state change events

## Phase 6, dataset and replay support

### Deliver
- dataset import registration
- replay job creation
- replay start/stop controls
- replay status tracking

## Recommended Internal Modules

Suggested internal module layout:
- `ingest/mqtt`
- `ingest/validation`
- `storage/history`
- `storage/projections`
- `storage/metadata`
- `storage/datasets`
- `replay`
- `api/http`
- `api/live`
- `config`
- `logging`

## Recommended First Vertical Slice

The first IOT demo should:
- ingest weather telemetry
- ingest building telemetry
- ingest generator telemetry
- persist those events
- update latest state
- serve current state to DT
- serve history to simple test queries

## Open Decisions to Confirm

Before implementation starts in earnest, confirm:
- SQLite vs PostgreSQL for MVP
- whether MQTT broker is embedded or external
- replay implementation strategy
- retention defaults for live data

## Short conclusion

IOT should be boring, reliable, and precise.

That is not an insult. It is the highest compliment one can pay to infrastructure.
