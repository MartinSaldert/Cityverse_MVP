# Cityverse MVP, MQTT Topic Taxonomy

## Purpose

This document defines the first MQTT topic taxonomy for Cityverse MVP.

Its purpose is to provide a realistic, structured, and implementation-friendly topic layout for telemetry and selected event-style messaging between:
- VC,
- IOT,
- downstream subscribers such as DT and internal processing components.

This taxonomy is designed to:
- match real-world IoT publish/subscribe patterns,
- keep telemetry organized by city entity and system,
- support both local Windows MVP deployment and later remote deployment,
- avoid collapsing telemetry, state, and commands into one undifferentiated swamp.

## Design Principles

The topic taxonomy should follow these principles:
- topic paths should be stable and predictable,
- entity identity should be explicit,
- telemetry should be separated from state-change events,
- commands should not be treated as normal telemetry,
- topics should be useful for both broad subscriptions and narrow subscriptions,
- naming should be machine-friendly and boring in the best possible way.

## Important Scope Rule

For the MVP:
- **MQTT is primarily for telemetry and selected event notifications**,
- **HTTP is the preferred command and query surface**,
- **latest state lives in IOT projections / twin-like state models**.

That means MQTT topics should not become the universal interface for everything.

## Top-Level Namespace

Recommended top-level root:
- `cityverse/`

This keeps the namespace clean and leaves room for:
- multiple cities,
- multiple environments,
- versioning later if needed.

## Recommended Topic Structure

General pattern:

`cityverse/{cityId}/{domain}/{entityType}/{entityId}/{channel}/{metricOrEvent}`

Where:
- `cityId` identifies the simulated city,
- `domain` identifies the broader system area,
- `entityType` identifies the entity category,
- `entityId` identifies the individual entity,
- `channel` identifies the message class,
- `metricOrEvent` identifies the value or event name.

## Allowed Channel Categories

Recommended channel categories:
- `telemetry`
- `events`
- `status`

For the MVP:
- `telemetry` is the primary one,
- `events` is for discrete noteworthy events,
- `status` should be used sparingly, because the main latest-state source should still be the IOT state projection rather than raw MQTT status spam.

## Domain Layout

Recommended domains:
- `weather`
- `buildings`
- `power`
- `traffic`
- `environment`
- `city`
- `devices`

These domains reflect major simulation areas rather than implementation modules.

## Topic Patterns by Domain

## 1. Weather topics

### Weather station telemetry
`cityverse/{cityId}/weather/station/{stationId}/telemetry/{metric}`

Examples:
- `cityverse/main/weather/station/ws-01/telemetry/temperature_c`
- `cityverse/main/weather/station/ws-01/telemetry/wind_speed_mps`
- `cityverse/main/weather/station/ws-01/telemetry/cloud_cover_pct`
- `cityverse/main/weather/station/ws-01/telemetry/solar_radiation_wm2`

### Weather events
`cityverse/{cityId}/weather/station/{stationId}/events/{eventName}`

Examples:
- `cityverse/main/weather/station/ws-01/events/storm_started`
- `cityverse/main/weather/station/ws-01/events/heavy_rain_started`
- `cityverse/main/weather/station/ws-01/events/weather_override_applied`

## 2. Building topics

### Building telemetry
`cityverse/{cityId}/buildings/building/{buildingId}/telemetry/{metric}`

Examples:
- `cityverse/main/buildings/building/bldg-001/telemetry/power_demand_kw`
- `cityverse/main/buildings/building/bldg-001/telemetry/energy_today_kwh`
- `cityverse/main/buildings/building/bldg-001/telemetry/occupancy_count`
- `cityverse/main/buildings/building/bldg-001/telemetry/indoor_temperature_c`
- `cityverse/main/buildings/building/bldg-001/telemetry/co2_kg_per_hour`

### Building battery telemetry
`cityverse/{cityId}/buildings/building/{buildingId}/telemetry/{metric}`

Examples:
- `cityverse/main/buildings/building/bldg-001/telemetry/battery_soc_pct`
- `cityverse/main/buildings/building/bldg-001/telemetry/battery_charge_kw`
- `cityverse/main/buildings/building/bldg-001/telemetry/battery_discharge_kw`
- `cityverse/main/buildings/building/bldg-001/telemetry/grid_import_kw`
- `cityverse/main/buildings/building/bldg-001/telemetry/grid_export_kw`

### Building events
`cityverse/{cityId}/buildings/building/{buildingId}/events/{eventName}`

Examples:
- `cityverse/main/buildings/building/bldg-001/events/occupancy_peak`
- `cityverse/main/buildings/building/bldg-001/events/load_anomaly_detected`
- `cityverse/main/buildings/building/bldg-001/events/battery_low`

## 3. Power generation topics

### Generator telemetry
`cityverse/{cityId}/power/generator/{generatorId}/telemetry/{metric}`

Examples:
- `cityverse/main/power/generator/wind-01/telemetry/output_mw`
- `cityverse/main/power/generator/wind-01/telemetry/capacity_factor_pct`
- `cityverse/main/power/generator/solar-01/telemetry/output_mw`
- `cityverse/main/power/generator/nuclear-01/telemetry/output_mw`
- `cityverse/main/power/generator/gas-ccgt-01/telemetry/output_mw`
- `cityverse/main/power/generator/oil-backup-01/telemetry/output_mw`
- `cityverse/main/power/generator/gas-ccgt-01/telemetry/co2_kg_per_hour`

### Generator events
`cityverse/{cityId}/power/generator/{generatorId}/events/{eventName}`

Examples:
- `cityverse/main/power/generator/gas-ccgt-01/events/startup_initiated`
- `cityverse/main/power/generator/oil-backup-01/events/started`
- `cityverse/main/power/generator/nuclear-01/events/maintenance_started`
- `cityverse/main/power/generator/wind-01/events/curtailed`

## 4. Traffic topics

### Traffic segment telemetry
`cityverse/{cityId}/traffic/segment/{segmentId}/telemetry/{metric}`

Examples:
- `cityverse/main/traffic/segment/seg-1001/telemetry/vehicle_count`
- `cityverse/main/traffic/segment/seg-1001/telemetry/avg_speed_kph`
- `cityverse/main/traffic/segment/seg-1001/telemetry/congestion_pct`
- `cityverse/main/traffic/segment/seg-1001/telemetry/co2_kg_per_hour`

### Traffic node / intersection telemetry
`cityverse/{cityId}/traffic/node/{nodeId}/telemetry/{metric}`

Examples:
- `cityverse/main/traffic/node/int-01/telemetry/queue_length`
- `cityverse/main/traffic/node/int-01/telemetry/signal_state`

### Traffic events
`cityverse/{cityId}/traffic/segment/{segmentId}/events/{eventName}`

Examples:
- `cityverse/main/traffic/segment/seg-1001/events/congestion_started`
- `cityverse/main/traffic/segment/seg-1001/events/incident_detected`

## 5. Environment and city aggregate topics

### City aggregate telemetry
`cityverse/{cityId}/city/aggregate/{scopeId}/telemetry/{metric}`

Examples:
- `cityverse/main/city/aggregate/whole-city/telemetry/total_power_demand_mw`
- `cityverse/main/city/aggregate/whole-city/telemetry/total_generation_mw`
- `cityverse/main/city/aggregate/whole-city/telemetry/total_co2_kg_per_hour`
- `cityverse/main/city/aggregate/district-north/telemetry/total_power_demand_mw`

### City aggregate events
`cityverse/{cityId}/city/aggregate/{scopeId}/events/{eventName}`

Examples:
- `cityverse/main/city/aggregate/whole-city/events/power_shortfall_detected`
- `cityverse/main/city/aggregate/whole-city/events/emissions_spike_detected`

## 6. Device-oriented topics

If Cityverse later wants to represent more explicit sensor/device identity, use:

`cityverse/{cityId}/devices/{deviceType}/{deviceId}/telemetry/{metric}`

Examples:
- `cityverse/main/devices/smart_meter/sm-001/telemetry/power_kw`
- `cityverse/main/devices/weather_sensor/ws-temp-01/telemetry/temperature_c`

This is useful if the simulation later distinguishes clearly between:
- physical asset,
- digital entity,
- individual device mounted on that asset.

For MVP, building- and asset-level topics may be enough.

## Wildcard Subscription Examples

Useful subscriber patterns:

### All weather telemetry
- `cityverse/main/weather/+/+/telemetry/+`

### All building telemetry
- `cityverse/main/buildings/building/+/telemetry/+`

### All power output metrics
- `cityverse/main/power/generator/+/telemetry/output_mw`

### All city aggregate telemetry
- `cityverse/main/city/aggregate/+/telemetry/+`

### All events in the city
- `cityverse/main/+/+/+/events/+`

These patterns make the taxonomy useful for both focused consumers and broader processors.

## Topic Naming Rules

Recommended naming rules:
- use lowercase only,
- use hyphens in IDs where needed,
- use underscores in metric names,
- never include spaces,
- keep units in the metric name where helpful,
- do not encode timestamps in topic names,
- do not encode random state variants into the path when they belong in the payload.

Examples of good metric names:
- `temperature_c`
- `power_demand_kw`
- `energy_today_kwh`
- `output_mw`
- `co2_kg_per_hour`
- `wind_speed_mps`

## Payload Design Recommendation

MQTT topics should identify the stream. The payload should carry the actual value and metadata.

Recommended telemetry payload envelope:

```json
{
  "messageId": "msg-123",
  "timestampUtc": "2026-04-16T21:00:00Z",
  "cityId": "main",
  "entityId": "bldg-001",
  "entityType": "building",
  "metricName": "power_demand_kw",
  "value": 12.4,
  "unit": "kW",
  "quality": "good",
  "sourceType": "simulated",
  "schemaVersion": "1.0"
}
```

Recommended event payload envelope:

```json
{
  "messageId": "evt-001",
  "timestampUtc": "2026-04-16T21:01:00Z",
  "cityId": "main",
  "entityId": "oil-backup-01",
  "entityType": "generator",
  "eventName": "started",
  "severity": "warning",
  "details": {
    "reason": "power_shortfall"
  },
  "schemaVersion": "1.0"
}
```

## QoS and Retention Recommendations

For MVP, a practical first-pass approach is:

### Telemetry
- QoS 0 or 1 depending on metric importance
- generally not retained as the primary history mechanism
- history should live in IOT storage, not in broker retain flags

### Events
- QoS 1 recommended for important events
- retained only when specifically useful, otherwise store in IOT

### Status-like signals
- retained can be useful for selected current-status topics
- but should still not replace the official latest-state store in IOT

Recommended practical rule:
- do not rely on MQTT retained messages as the system of record
- use retained messages only as a convenience layer where clearly justified

## What Should Not Be MQTT Topics

The following should generally not be implemented as ordinary MQTT telemetry topics:
- set time commands,
- force weather override commands,
- start/stop plant commands,
- historical data queries,
- large state snapshots,
- complex graph/entity relationship queries.

These belong in:
- HTTP command APIs,
- HTTP or DT query APIs,
- state projection stores,
- graph query layers.

## Recommended First MVP Topic Set

If we want a minimal first implementation, start with these topic families:

### Weather
- `cityverse/{cityId}/weather/station/{stationId}/telemetry/temperature_c`
- `cityverse/{cityId}/weather/station/{stationId}/telemetry/wind_speed_mps`
- `cityverse/{cityId}/weather/station/{stationId}/telemetry/cloud_cover_pct`
- `cityverse/{cityId}/weather/station/{stationId}/telemetry/solar_radiation_wm2`

### Buildings
- `cityverse/{cityId}/buildings/building/{buildingId}/telemetry/power_demand_kw`
- `cityverse/{cityId}/buildings/building/{buildingId}/telemetry/energy_today_kwh`
- `cityverse/{cityId}/buildings/building/{buildingId}/telemetry/occupancy_count`
- `cityverse/{cityId}/buildings/building/{buildingId}/telemetry/co2_kg_per_hour`

### Power
- `cityverse/{cityId}/power/generator/{generatorId}/telemetry/output_mw`
- `cityverse/{cityId}/power/generator/{generatorId}/telemetry/co2_kg_per_hour`
- `cityverse/{cityId}/power/generator/{generatorId}/events/started`
- `cityverse/{cityId}/power/generator/{generatorId}/events/stopped`

### Traffic
- `cityverse/{cityId}/traffic/segment/{segmentId}/telemetry/vehicle_count`
- `cityverse/{cityId}/traffic/segment/{segmentId}/telemetry/co2_kg_per_hour`

### City aggregate
- `cityverse/{cityId}/city/aggregate/whole-city/telemetry/total_power_demand_mw`
- `cityverse/{cityId}/city/aggregate/whole-city/telemetry/total_generation_mw`
- `cityverse/{cityId}/city/aggregate/whole-city/telemetry/total_co2_kg_per_hour`

## Recommended Decision

Recommended decision for now:
- adopt `cityverse/...` as the root namespace,
- use domain/entity/channel/metric structure,
- keep telemetry and events distinct,
- keep commands out of normal MQTT topics,
- use payload envelopes with timestamps, IDs, and schema version,
- let IOT store history and latest state rather than abusing retained messages.

## Suggested Follow-Up Docs

After this, the most useful next docs are:
- `docs/API_COMMAND_SURFACE.md`
- `docs/IOT_STORAGE_MODEL.md`
- `docs/DT_STATE_AND_GRAPH_MODEL.md`
- `docs/TELEMETRY_MESSAGE_SCHEMA.md`

## Short conclusion

A good MQTT taxonomy should be simple enough to implement and structured enough to survive growth.

This one gives Cityverse:
- realistic telemetry organization,
- clear subscriptions,
- room for weather, buildings, power, traffic, and emissions,
- and enough discipline to stop MQTT from becoming the communal junk drawer of the whole platform.
