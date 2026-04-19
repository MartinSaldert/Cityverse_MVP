# Cityverse MVP, VC Weather Module Architecture

Date: 2026-04-17
Status: implementation-facing draft

## Purpose

This document defines the module architecture for the weather system inside VC.

The goals are:
- clear separation of responsibilities
- easy testing
- tunable formulas
- easy integration with simulation time, UI commands, telemetry, and energy systems

## Module Design Principles

The weather module should:
- keep state representation separate from update logic
- keep formulas separate from transport and UI handlers
- keep override logic explicit
- make downstream outputs easy to consume
- allow tuning without architectural surgery

## Recommended Module Layout

Suggested structure inside `cityverse-vc`:

- `src/weather/types.ts`
- `src/weather/config.ts`
- `src/weather/calendar.ts`
- `src/weather/baseline.ts`
- `src/weather/overrides.ts`
- `src/weather/rules.ts`
- `src/weather/update.ts`
- `src/weather/scenarios.ts`
- `src/weather/service.ts`
- `src/weather/telemetry.ts`
- `src/weather/selectors.ts`
- `src/weather/tests/`

## Module Responsibilities

### `types.ts`
Owns:
- `WeatherState`
- weather category enum/type
- season enum/type
- override DTOs
- scenario types
- weather config types

This file should contain shape definitions only.

### `config.ts`
Owns:
- loading weather config
- default weather config values
- validation of config structure

Examples:
- location
- seasonal temp ranges
- response rates
- cloud attenuation constants
- scenario defaults

### `calendar.ts`
Owns:
- deriving local hour from simulation time
- deriving day of year
- deriving month and season
- sunrise/sunset approximation or helper use
- daylight factor calculation

This module should not know anything about cloud, rain, or pressure.
It is calendar and solar context only.

### `baseline.ts`
Owns:
- seasonal baseline temperature targets
- seasonal humidity tendency
- seasonal base wind tendency
- seasonal solar peak baseline
- climate-style default tendencies for the chosen city

This is the city climate personality layer.

### `overrides.ts`
Owns:
- active user nudges
- hard force overrides
- scenario target application
- precedence handling
- override expiration if needed later

This module should make it obvious why the weather is doing what it is doing.
That is no small kindness.

### `rules.ts`
Owns:
- first-pass formulas and helper calculations
- storminess calculations
- rain support calculations
- cloud target calculations
- temperature component calculations
- moveToward and clamp helpers if not shared elsewhere

This is where the causal logic lives.

### `update.ts`
Owns:
- the ordered weather update tick
- applying calendar context
- computing targets
- updating actual state
- returning the next weather state

This should be the orchestration layer, not the home of every formula.

### `scenarios.ts`
Owns:
- named scenario definitions
- scenario parameter bundles
- scenario lookup

Examples:
- clear winter morning
- cloudy autumn day
- windy storm
- warm summer afternoon

### `service.ts`
Owns:
- runtime weather service
- integration with VC simulation clock
- tick scheduling hooks
- state storage in memory
- public methods for command handlers and queries

This is the main runtime entry point.

### `telemetry.ts`
Owns:
- conversion from weather state to telemetry messages
- scheduling of weather publish events
- optional change-event emission

Keep telemetry mapping separate from weather logic so schema changes do not require weather-brain surgery.

### `selectors.ts`
Owns:
- derived read models for other systems
- energy-facing weather summaries
- UI-facing weather summary
- DT-facing weather bundle

This prevents every consumer from reinventing field interpretation.

## Weather Service Responsibilities

The runtime weather service should be responsible for:
- bootstrapping an initial weather state when VC starts
- updating weather on each simulation step
- exposing current weather state
- accepting user command inputs
- exposing summaries for UI and telemetry layers

## Suggested Service Interface

Example conceptual interface:

```ts
interface WeatherService {
  initialize(initialSimTime: Date): Promise<void>;
  tick(simulatedDeltaSeconds: number, currentSimTime: Date): void;
  getState(): WeatherState;
  applyNudge(command: WeatherNudgeCommand): void;
  applyForce(command: WeatherForceCommand): void;
  applyScenario(command: WeatherScenarioCommand): void;
  clearOverrides(): void;
  getUiSummary(): WeatherUiSummary;
  getEnergySummary(): WeatherEnergySummary;
}
```

## Integration Points

## 1. VC simulation clock
Inputs:
- current simulation time
- current simulation speed multiplier
- pause/resume state

The weather service should never invent its own time source.
That way lies duplicated reality.

## 2. VC command API
Commands should include:
- set time/date
- set weather scenario
- nudge pressure/cloud/wind/humidity
- force state changes
- clear overrides

## 3. VC UI layer
The simple VC UI should be able to:
- show current weather values
- show weather category
- adjust simulation speed
- apply nudges and scenarios

## 4. VC energy systems
Energy systems should consume:
- `solarRadiationWm2`
- `daylightFactor`
- `windSpeedMps`
- `temperatureC`
- precipitation or storminess if later useful

## 5. VC telemetry publisher
Publisher should consume weather summaries and serialize them into the shared telemetry schema.

## 6. DT and Unity consumers
DT should receive a compact weather bundle for visual and twin-state use.
Unity should not need the entire internal weather engine state to render cloudiness, rain, windiness, and day/night.

## Ordered Weather Tick

Recommended update flow in `update.ts`:

1. derive calendar context
2. derive seasonal baseline targets
3. resolve active overrides and scenario inputs
4. compute pressure target and pressure trend
5. compute storminess and instability targets
6. compute humidity target and next humidity
7. compute cloud target and next cloud cover
8. compute wind target and next wind speed
9. compute precipitation target and next precipitation
10. compute solar radiation
11. compute temperature and feels-like temperature
12. derive weather category
13. return next state

## State Persistence Strategy

For MVP, keep current weather state in memory inside VC.

Optional later additions:
- event history ring buffer in VC for debugging
- persistence snapshots
- replay mode input source

For now, authoritative persistence belongs to IOT after telemetry emission.

## Testing Strategy

## Unit tests
Cover:
- season derivation
- daylight calculation
- solar attenuation by cloud
- pressure effect on storminess
- cloud effect on solar and temperature tendency
- wind effect on feels-like temperature
- precipitation threshold logic

## Scenario tests
Cover:
- January night vs July noon
- lowering pressure worsens conditions over simulated time
- increasing cloud reduces solar farm output
- 10x speed still gives stable progression

## Integration tests
Cover:
- VC weather tick runs from simulation clock
- command API changes weather state
- telemetry mapper emits expected messages

## Configuration Strategy

Recommended config layers:
- hard defaults in code
- environment or file override for city settings
- scenario preset config

Example config sections:
- `location`
- `seasonalCurves`
- `solar`
- `responseRates`
- `thresholds`
- `scenarios`

## Anti-Patterns to Avoid

Do not:
- mix HTTP handlers into weather formulas
- hard-code UI assumptions into the weather service
- let Unity become the source of truth for weather
- implement every variable as an isolated slider with no interaction
- bury coupling constants across random files like a scavenger hunt

## Recommended First Build Sequence

1. create types and config
2. implement calendar and baseline modules
3. implement rules helpers
4. implement update orchestrator
5. implement service wrapper
6. add UI command integration
7. add telemetry mapping
8. add downstream energy selectors

## Short conclusion

This structure should let us build the weather system cleanly and iteratively.
It keeps the engine understandable, which is particularly helpful when one inevitably discovers that weather, like software architecture and goats, behaves best when not overcomplicated on day one.
