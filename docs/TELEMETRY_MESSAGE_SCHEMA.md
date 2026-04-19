# Cityverse MVP, Telemetry Message Schema

## Purpose

This document defines the first telemetry message schema for Cityverse MVP.

Its purpose is to standardize how telemetry messages are represented when moving from VC into IOT and then into downstream processing.

The schema should support:
- consistent ingestion,
- consistent storage,
- replay,
- historical queries,
- schema evolution,
- DT and analytics compatibility.

## Design Principles

The telemetry schema should be:
- explicit,
- stable,
- versioned,
- machine-friendly,
- consistent across domains,
- simple enough for MVP implementation.

## Core Schema

Recommended first-pass telemetry message envelope:

```json
{
  "messageId": "msg-123",
  "schemaVersion": "1.0",
  "timestampUtc": "2026-04-16T21:00:00Z",
  "sourceTimestampUtc": "2026-01-15T08:30:00Z",
  "cityId": "main",
  "entityType": "building",
  "entityId": "bldg-001",
  "sensorId": "sm-001",
  "metricName": "power_demand_kw",
  "value": 12.4,
  "unit": "kW",
  "quality": "good",
  "sourceType": "simulated",
  "datasetId": "live-session-2026-04-16-a",
  "tags": {
    "districtId": "district-north"
  }
}
```

## Field Definitions

### Identity fields
- `messageId`: unique ID for the message
- `schemaVersion`: schema version string
- `cityId`: city identifier
- `entityType`: entity category
- `entityId`: unique entity identifier
- `sensorId`: optional sensor or source identifier

### Time fields
- `timestampUtc`: logical event time used by downstream systems
- `sourceTimestampUtc`: optional original source time if different

For MVP, `timestampUtc` should normally be the simulated city time represented in UTC form.

### Metric fields
- `metricName`: normalized metric key
- `value`: metric value
- `unit`: unit string
- `quality`: data quality indicator

### Source fields
- `sourceType`: for example `simulated`, `derived`, `override`, `replay`
- `datasetId`: dataset or session context

### Extra classification
- `tags`: optional lightweight metadata for routing, filtering, or grouping

## Allowed Quality Values

Recommended first-pass quality values:
- `good`
- `estimated`
- `derived`
- `override`
- `invalid`

## Allowed Source Types

Recommended first-pass source types:
- `simulated`
- `derived`
- `override`
- `seeded`
- `replay`

## Metric Naming Rules

Metric names should:
- use lowercase,
- use underscores,
- include units where helpful,
- stay stable across versions.

Examples:
- `temperature_c`
- `power_demand_kw`
- `energy_today_kwh`
- `output_mw`
- `co2_kg_per_hour`
- `cloud_cover_pct`
- `avg_speed_kph`

## Domain Examples

### Building telemetry example

```json
{
  "messageId": "msg-bldg-001-01",
  "schemaVersion": "1.0",
  "timestampUtc": "2026-01-15T07:30:00Z",
  "cityId": "main",
  "entityType": "building",
  "entityId": "bldg-001",
  "sensorId": "smart-meter-001",
  "metricName": "power_demand_kw",
  "value": 12.4,
  "unit": "kW",
  "quality": "good",
  "sourceType": "simulated",
  "datasetId": "live-session-2026-04-16-a"
}
```

### Generator telemetry example

```json
{
  "messageId": "msg-gen-001-01",
  "schemaVersion": "1.0",
  "timestampUtc": "2026-01-15T07:30:00Z",
  "cityId": "main",
  "entityType": "generator",
  "entityId": "gas-ccgt-01",
  "metricName": "output_mw",
  "value": 32.1,
  "unit": "MW",
  "quality": "good",
  "sourceType": "simulated",
  "datasetId": "live-session-2026-04-16-a"
}
```

### Weather telemetry example

```json
{
  "messageId": "msg-weather-001-01",
  "schemaVersion": "1.0",
  "timestampUtc": "2026-01-15T07:30:00Z",
  "cityId": "main",
  "entityType": "weather_station",
  "entityId": "ws-01",
  "metricName": "temperature_c",
  "value": -7.5,
  "unit": "C",
  "quality": "good",
  "sourceType": "simulated",
  "datasetId": "live-session-2026-04-16-a"
}
```

## Event Schema

Not everything should be a metric.

For discrete events, use a related but different shape:

```json
{
  "eventId": "evt-001",
  "schemaVersion": "1.0",
  "timestampUtc": "2026-01-15T07:31:00Z",
  "cityId": "main",
  "entityType": "generator",
  "entityId": "oil-backup-01",
  "eventName": "started",
  "severity": "warning",
  "sourceType": "simulated",
  "datasetId": "live-session-2026-04-16-a",
  "details": {
    "reason": "power_shortfall"
  }
}
```

## Recommended Units

Use normalized unit strings consistently.

Examples:
- `kW`
- `kWh`
- `MW`
- `MWh`
- `C`
- `pct`
- `kg_per_hour`
- `mps`
- `kph`
- `mm_per_hr`
- `count`

## Recommended Decision

Recommended decision for now:
- use one common telemetry envelope across domains,
- keep event messages adjacent but distinct,
- require schema versioning from the start,
- standardize metric names and units early,
- carry dataset/session context in every message.

## Short conclusion

A decent telemetry schema is unglamorous, which is precisely why it matters. It keeps the whole platform from becoming an anthology of incompatible guesses.
