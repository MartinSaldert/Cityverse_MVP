# Cityverse MVP, Building Metadata Model

## Purpose

This document defines the first building metadata model for Cityverse MVP.

Its purpose is to ensure that buildings in the virtual city are not just visual objects, but structured simulation entities with enough information to support:
- occupancy simulation,
- electricity monitoring,
- battery behavior,
- weather sensitivity,
- CO2 calculations later,
- digital twin representation,
- IoT telemetry generation.

This model should be considered the foundation for later work on:
- electricity usage statistics,
- building behavior simulation,
- CO2 emissions modeling,
- digital twin schemas,
- seeded historical data generation,
- live telemetry recording.

## Design Principles

The building metadata model should follow a few principles:

- simple enough for MVP implementation,
- rich enough to drive realistic telemetry,
- extensible for later systems,
- explicit rather than vague,
- compatible with both simulation and data storage.

The goal is to avoid buildings that are either:
- so simple they are analytically useless, or
- so detailed they become a cathedral of metadata before the first watt has been simulated.

## Building as a Simulation Entity

Each building should be treated as a stateful entity with:
- identity,
- type,
- spatial placement,
- structural properties,
- occupancy behavior,
- energy behavior,
- optional local storage or generation,
- current and historical telemetry.

## Core Entity Fields

Every building should have a core identity block.

### Identity
- `buildingId`
- `name`
- `buildingType`
- `districtId`
- `zoneType`
- `status`

Notes:
- `buildingId` should be unique and stable.
- `buildingType` may be values such as `villa`, `apartment`, `office`, `shopping_mall`, `datacenter`.
- `status` can later support values such as active, offline, under-maintenance, or faulted.

## Spatial and Structural Fields

These fields define what the building is physically.

### Spatial fields
- `position`
- `rotation`
- `footprintAreaM2`
- `grossFloorAreaM2`
- `floorCount`

### Structural fields
- `constructionYear`
- `efficiencyClass`
- `insulationQuality`
- `windowQuality`
- `heatingSystemType`
- `coolingSystemType`
- `hasSmartMeter`
- `hasBuildingManagementSystem`

Notes:
- `grossFloorAreaM2` is especially important for normalizing energy use.
- `insulationQuality` and system types will strongly affect weather-driven demand.

## Occupancy and Activity Fields

These fields describe how people use the building.

### Occupancy fields
- `occupancyType`
- `residentCount`
- `workerCount`
- `visitorCapacity`
- `maxOccupancy`
- `occupancyScheduleProfile`
- `activityProfile`

Notes:
- A villa may have residents but little visitor traffic.
- An office may have workers concentrated on weekdays.
- A shopping mall may have large time-varying visitor flows.
- A datacenter may have very low occupant count but high energy use.

## Electricity and Energy Fields

These are some of the most important fields in the system.

The project requires realistic electricity monitoring, so buildings must support both cumulative energy values and moment-to-moment demand values.

### Electrical baseline fields
- `baselineLoadKw`
- `peakLoadKw`
- `averageDailyUsageKwh`
- `seasonalUsageProfile`
- `dailyUsageProfile`
- `weatherSensitivityProfile`

### Live electrical state fields
- `currentDemandKw`
- `currentGridImportKw`
- `currentGridExportKw`
- `currentBatteryChargeKw`
- `currentBatteryDischargeKw`
- `currentLocalGenerationKw`
- `totalUsageTodayKwh`
- `totalUsageThisMonthKwh`
- `totalUsageThisYearKwh`

Notes:
- `currentDemandKw` represents live instantaneous demand.
- `totalUsage...Kwh` values support monitoring over time.
- `currentGridImportKw` and `currentGridExportKw` allow later support for local generation and storage.

## Battery and Local Storage Fields

Some buildings, especially houses and advanced facilities, may have local battery systems.

### Battery metadata fields
- `hasBattery`
- `batteryCapacityKwh`
- `batteryMaxChargeKw`
- `batteryMaxDischargeKw`
- `batteryRoundTripEfficiency`
- `batteryControlMode`

### Battery live state fields
- `batteryStateOfChargeKwh`
- `batteryStateOfChargePct`
- `batteryHealthPct`
- `batteryCharging`
- `batteryDischarging`

Notes:
- Houses with batteries should be able to show whether energy is coming from the grid or from local storage.
- Later versions may support arbitrage, backup reserve behavior, or AI-controlled storage logic.

## Optional Local Generation Fields

Some buildings may eventually have local generation such as rooftop solar.

### Local generation fields
- `hasLocalSolar`
- `solarCapacityKw`
- `solarOrientation`
- `solarEfficiency`
- `currentSolarOutputKw`

These are optional for the first building schema but fit naturally with the energy system.

## Environmental and Thermal Fields

These fields help buildings react to weather.

### Environmental fields
- `targetIndoorTemperatureC`
- `currentIndoorTemperatureC`
- `thermalMassClass`
- `airTightnessClass`
- `ventilationType`
- `weatherExposureClass`

These fields matter because colder weather, warmer weather, and solar conditions should influence energy demand.

## CO2-Relevant Fields

These fields support later CO2 calculations.

### CO2-related fields
- `currentCo2EmissionsKgPerHour`
- `totalCo2TodayKg`
- `totalCo2ThisMonthKg`
- `co2IntensityKgPerKwh`
- `emissionsProfileType`

Important note:
CO2 modeling should be finalized after the building definitions are stable, but the schema should make room for it now so later integration is not awkward.

## IoT and Twin Integration Fields

Buildings should also be easy to connect to the IoT broker and digital twin.

### Integration fields
- `sensorProfileId`
- `telemetryTopicPrefix`
- `twinEntityId`
- `lastTelemetryTimestamp`
- `dataQualityState`

These fields help connect the simulation model to message publishing, storage, and visualization systems.

## Recommended Building Types for MVP

The first building metadata model should explicitly support at least:
- `villa`
- `apartment`
- `office`
- `shopping_mall`
- `datacenter`

Additional types can be added later, but these give a useful spread of:
- occupancy patterns,
- energy patterns,
- operational behavior,
- CO2 implications.

## Minimum Required Fields for MVP

If we need a strict MVP subset, the first implementation should at minimum include:

### Identity and structure
- `buildingId`
- `name`
- `buildingType`
- `districtId`
- `grossFloorAreaM2`
- `floorCount`

### Occupancy
- `occupancyType`
- `residentCount`
- `workerCount`
- `visitorCapacity`
- `occupancyScheduleProfile`

### Energy
- `baselineLoadKw`
- `peakLoadKw`
- `averageDailyUsageKwh`
- `dailyUsageProfile`
- `seasonalUsageProfile`
- `currentDemandKw`
- `totalUsageTodayKwh`

### Battery
- `hasBattery`
- `batteryCapacityKwh`
- `batteryStateOfChargePct`

### Environment
- `heatingSystemType`
- `coolingSystemType`
- `insulationQuality`

### Integration
- `sensorProfileId`
- `twinEntityId`

## Derived Values

Some values may be stored directly, while others can be derived.

Examples of derived values include:
- kWh per square meter,
- kWh per occupant,
- estimated heating demand,
- estimated CO2 emissions,
- abnormal load detection,
- battery contribution ratio,
- import vs export ratio.

Derived values are useful because they allow the system to generate more intelligent dashboards and AI summaries.

## Example Building Archetypes

### Villa
Typical characteristics:
- low to moderate occupancy,
- morning and evening demand peaks,
- strong weather sensitivity,
- optional house battery,
- possible rooftop solar later.

### Apartment building
Typical characteristics:
- many residents,
- more stable aggregated demand,
- moderate weather sensitivity,
- shared systems possible.

### Office
Typical characteristics:
- weekday daytime occupancy,
- strong working-hours demand,
- cooling sensitivity in warmer periods,
- possibly lower demand at night.

### Shopping mall
Typical characteristics:
- high daytime and weekend variation,
- strong lighting and HVAC loads,
- visitor-driven variability,
- large floor area.

### Datacenter
Typical characteristics:
- high steady load,
- cooling-dominated energy behavior,
- low occupancy but high infrastructure significance,
- strong monitoring value.

## Open Questions

These questions still need follow-up research:
- what realistic usage curves should each building type use,
- which public datasets are best for calibration,
- which fields should be static metadata versus computed state,
- how detailed should thermal simulation be in the first MVP,
- how should battery logic behave for houses versus larger facilities,
- how should buildings publish telemetry to the broker.

## Recommended Next Documents

After this, the most useful related documents are likely:
- `docs/MVP_SCOPE.md`
- `docs/ENERGY_SYSTEM_MODEL.md`
- `docs/SENSOR_TAXONOMY.md`
- `docs/WEATHER_SYSTEM_NOTES.md`
- `docs/CO2_MODEL.md` later
