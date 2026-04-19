# Cityverse MVP, DT State and Graph Model

## Purpose

This document defines the first state and graph model for **DT** in Cityverse MVP.

Its purpose is to describe how DT should represent:
- city entities,
- relationships between those entities,
- current twin state,
- scene-ready projections for Unity,
- the bridge between IOT data and visual digital twin views.

DT should not be the raw telemetry broker. DT should be the structured, queryable, visualization-facing representation of the city.

## Core Role of DT

DT exists to answer questions like:
- what entities exist in the city,
- how are they related,
- what is their current state,
- how should that state be presented spatially and semantically,
- what should Unity render right now.

That means DT combines:
- metadata,
- relationships,
- selected latest state from IOT,
- projection logic,
- view-oriented composition.

## Design Principles

The DT model should follow these principles:
- entities are explicit,
- relationships are explicit,
- current state is separated from metadata,
- scene-ready projections are derived rather than treated as the primary truth,
- DT should be query-friendly,
- Unity should consume curated state bundles, not raw broker noise.

## Core Entity Types

The first DT model should support at least these entity types:
- `city`
- `district`
- `building`
- `room` later if needed
- `generator`
- `weather_station`
- `traffic_segment`
- `traffic_node`
- `sensor`
- `grid_zone` later

## Core Entity Structure

A DT entity should have four broad parts:
- identity
- metadata
- current state
- relationships

### Example logical shape

```json
{
  "entityId": "bldg-001",
  "entityType": "building",
  "metadata": {
    "name": "Villa 1",
    "districtId": "district-north",
    "position": { "x": 10, "y": 0, "z": 5 }
  },
  "currentState": {
    "powerDemandKw": 12.4,
    "occupancyCount": 3,
    "co2KgPerHour": 1.8
  },
  "relationships": [
    {
      "type": "located_in",
      "targetEntityId": "district-north"
    }
  ],
  "lastUpdatedUtc": "2026-04-16T21:00:00Z"
}
```

## Metadata Model

Metadata should include stable or slowly changing values.

### Building metadata examples
- `name`
- `buildingType`
- `districtId`
- `grossFloorAreaM2`
- `floorCount`
- `occupancyType`
- `heatingSystemType`
- `coolingSystemType`
- `hasBattery`
- `batteryCapacityKwh`
- `position`
- `rotation`
- `bounds`

### Generator metadata examples
- `generatorType`
- `generatorSubtype`
- `installedCapacityMw`
- `districtId`
- `position`

### Traffic metadata examples
- `segmentType`
- `lengthM`
- `districtId`
- `positionPath`

Metadata should not be rewritten for every state change.

## Current State Model

Current state should include the latest important values used by DT and Unity.

### Building current state examples
- `powerDemandKw`
- `energyTodayKwh`
- `occupancyCount`
- `indoorTemperatureC`
- `batterySocPct`
- `gridImportKw`
- `gridExportKw`
- `co2KgPerHour`
- `status`

### Generator current state examples
- `currentOutputMw`
- `availabilityPct`
- `mode`
- `startupState`
- `co2KgPerHour`
- `status`

### Weather station current state examples
- `temperatureC`
- `windSpeedMps`
- `cloudCoverPct`
- `solarRadiationWm2`
- `precipitationMmPerHr`
- `isDay`
- `weatherCode`

### Traffic current state examples
- `vehicleCount`
- `avgSpeedKph`
- `congestionPct`
- `co2KgPerHour`
- `status`

## Relationship Model

Relationships should be explicit and queryable.

### Important first relationships
- `located_in`
- `contains`
- `monitors`
- `attached_to`
- `feeds`
- `connected_to`
- `belongs_to`
- `reports_to`

### Examples
- building `located_in` district
- sensor `attached_to` building
- generator `feeds` city or grid zone
- weather station `located_in` district
- traffic node `connected_to` traffic segment

## First Graph Hierarchy

A useful first-pass city graph is:
- city
  - contains districts
    - contains buildings
      - contains sensors later
    - contains generators
    - contains weather stations
    - contains traffic segments and nodes

This gives DT a clean spatial and organizational hierarchy.

## DT Projection Layers

DT should maintain more than one useful projection.

### 1. Entity twin projection
Per-entity twin object with metadata, current state, and relationships.

### 2. Scene projection
Scene-oriented bundle for Unity.

Examples:
- visible buildings and their colors/status,
- generator status markers,
- traffic heat overlays,
- weather effects state,
- selected labels and summaries.

### 3. Aggregate projection
Higher-level summaries.

Examples:
- district summaries,
- whole-city summaries,
- current power balance,
- current emissions totals.

## Unity-Facing Scene Model

Unity should consume a scene-ready projection rather than rebuilding the whole graph itself from raw pieces.

### Scene state bundle should include
- entity IDs and types
- positions and transforms
- display labels
- current highlight values
- color/heatmap values
- icon state
- visibility flags
- selected alert markers
- simulation timestamp

### Example scene-ready values
For a building:
- `entityId`
- `position`
- `displayName`
- `powerDemandKw`
- `co2KgPerHour`
- `statusColor`
- `heatmapValue`
- `isSelected`

This allows Unity to render meaningfully without becoming the system architect by accident.

## DT Update Model

DT should be updated from IOT and selected VC queries.

Recommended update flow:
1. IOT ingests telemetry and updates latest-state projections.
2. DT consumes latest-state updates and metadata references.
3. DT rebuilds or updates entity twin state.
4. DT produces scene and aggregate projections.
5. Unity consumes those projections.

## Recommended DT Data Structures

### `dt_entities`
Stores entity identity and metadata.

Fields:
- `entityId`
- `entityType`
- `cityId`
- `metadataJson`
- `createdUtc`
- `updatedUtc`

### `dt_relationships`
Stores graph relationships.

Fields:
- `relationshipId`
- `sourceEntityId`
- `relationshipType`
- `targetEntityId`
- `metadataJson`
- `createdUtc`
- `updatedUtc`

### `dt_twin_state`
Stores current twin state by entity.

Fields:
- `entityId`
- `entityType`
- `stateJson`
- `lastSourceTimestampUtc`
- `lastUpdatedUtc`

### `dt_scene_projection`
Stores or generates scene-focused views.

Fields:
- `projectionId`
- `scopeType`
- `scopeId`
- `viewMode`
- `projectionJson`
- `generatedUtc`

## Recommended View Modes

DT should support at least these first view modes:
- `physical`
- `semantic`
- `power`
- `co2_heatmap`
- `weather`
- `traffic`

Each mode should use the same entity graph but different scene projections.

## Query Surface Expectations

DT should support queries such as:
- get twin by ID
- get all entities in district
- get all generators
- get relationships for entity
- get current scene bundle for whole city
- get current scene bundle for district
- get active alerts and anomalies

## Recommended Decision

Recommended decision for now:
- DT owns entity metadata, relationships, current twin state, and scene-ready projections,
- IOT remains the primary store of telemetry history and latest raw state,
- DT reshapes that into graph and visualization form,
- Unity consumes scene and twin projections rather than raw broker streams.

## Suggested Follow-Up Docs

After this, the most useful next docs are:
- `docs/TELEMETRY_MESSAGE_SCHEMA.md`
- `docs/EXECUTABLE_BOUNDARY_SPEC.md`
- `docs/CLAUDE_DEVELOPMENT_PLAN.md`

## Short conclusion

DT should know:
- what exists,
- how it connects,
- what it looks like now,
- how to present that coherently.

That is a different job from storing every telemetry record, and wisdom lies in not confusing the two.
