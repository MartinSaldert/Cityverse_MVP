# Cityverse MVP, Weather System Specification

Date: 2026-04-17
Status: implementation-facing draft

## Purpose

This document defines the first implementation specification for the Cityverse reactive weather system.

It is designed to support:
- live simulation
- causal weather changes
- adjustable simulation speed
- season-aware behavior
- downstream effects on energy and telemetry systems

## Design Goal

The system should feel weather-like, reactive, and believable.
It does not need to solve atmospheric physics in full.

## Scope of the First Version

The first version should support:
- one city-wide weather state
- adjustable time and date
- adjustable simulation speed
- day/night cycle
- season-aware temperature and sunlight behavior
- pressure, cloud, wind, humidity, precipitation, and temperature interactions
- user parameter changes while simulation is running
- solar farm and wind farm relevant outputs

## Canonical Weather State

Suggested first-pass weather state object:

```ts
interface WeatherState {
  timestampUtc: string;
  simTimeScale: number;

  latitude: number;
  longitude: number;
  timezone: string;

  dayOfYear: number;
  month: number;
  hourLocal: number;
  season: 'winter' | 'spring' | 'summer' | 'autumn';

  sunriseLocalHour: number;
  sunsetLocalHour: number;
  daylightFactor: number;
  isDay: boolean;

  pressureHpa: number;
  pressureTrend: number;

  temperatureC: number;
  feelsLikeC: number;

  humidity01: number;
  cloudCover01: number;
  precipitation01: number;

  windSpeedMps: number;
  windDirectionDeg: number;

  solarRadiationWm2: number;

  instability01: number;
  storminess01: number;

  weatherCategory:
    | 'clear'
    | 'partly_cloudy'
    | 'cloudy'
    | 'rain'
    | 'storm';

  sourceMode: 'simulated' | 'override' | 'scenario' | 'replay';
}
```

## State Philosophy

A few important notes:
- `pressureTrend` matters as much as absolute pressure
- `daylightFactor` should be 0 to 1, not only day or night
- `precipitation01` is an intensity value, not just boolean rain
- `instability01` and `storminess01` are useful compact helpers for believable reactions without full physics

## Required Input Controls

The weather system should support commands such as:
- set simulation time
- set simulation date
- set simulation speed
- nudge pressure
- set cloud target
- set wind target
- set humidity target
- set temperature override optionally
- set named weather scenario
- clear overrides

## Control Modes

### 1. Nudge
Change a variable target and let the simulation evolve.

Example:
- lower pressure by 6 hPa
- increase cloud target by 0.25

### 2. Force override
Hold a variable or weather type more directly.

Example:
- force overcast
- force heavy wind
- force rain

### 3. Scenario preset
Apply a coordinated state pack.

Example:
- winter storm
- clear cold morning
- warm summer afternoon

## Seasonal Baseline Model

The system should define seasonal baseline curves.

### Baseline outputs by date and hour
Need functions or lookup curves for:
- expected daily min temperature
- expected daily max temperature
- expected daylight duration
- expected solar peak intensity
- expected humidity tendency
- expected storm tendency

### MVP shortcut
Do not use a global climate model.
Use configurable seasonal curves for the chosen city.

For example:
- winter baseline temp range: -5C to 4C
- spring baseline temp range: 3C to 15C
- summer baseline temp range: 14C to 27C
- autumn baseline temp range: 5C to 16C

These should be configurable, not hard-coded forever.

## Daylight and Solar Model

## Required behavior
- no solar radiation at night
- longer days in summer
- shorter days in winter
- cloud cover reduces solar radiation
- solar peak near midday

## MVP formula shape
Use a simple solar availability curve based on:
- day of year
- local hour
- latitude

Then multiply by cloud attenuation.

Example conceptual form:
- `clearSkySolar = seasonalSolarPeak * daylightCurve(hour, sunrise, sunset)`
- `solarRadiation = clearSkySolar * (1 - cloudAttenuation)`

Suggested cloud attenuation start:
- attenuation = `cloudCover01 * 0.75`

Meaning full cloud does not necessarily mean absolute darkness, which would be melodramatic even for weather.

## Temperature Model

Temperature should evolve from multiple influences.

## Inputs to temperature
- seasonal baseline
- time of day
- daylight/solar radiation
- cloud cover
- wind cooling effect
- precipitation cooling effect
- previous temperature inertia

## Recommended update shape
At each tick:
1. compute baseline seasonal target temperature for current date/hour
2. compute solar heating contribution
3. compute cloud cooling or reduced heating effect
4. compute wind cooling contribution
5. compute precipitation cooling contribution
6. blend toward resulting target using smoothing/inertia

Example conceptual target:

`targetTemp = baselineTemp + solarHeating - cloudCooling - rainCooling - windCoolingAdjustment`

Then:

`temperatureC = moveToward(temperatureC, targetTemp, tempResponseRate * simDelta)`

## Specific desired behaviors
- nights become colder
- clear nights cool more strongly than cloudy nights
- cloudy days heat less than clear days
- strong wind can cool the effective temperature
- rain tends to cool temperature somewhat

## Pressure Model

Pressure is one of the main weather drivers in the MVP.

## Inputs to pressure behavior
- user nudges
- scenario presets
- random drift within stable bounds
- season-specific storm tendency later if useful

## Required effects of pressure
- falling pressure increases storminess tendency
- low pressure supports cloud and rain growth
- rising pressure gradually improves weather
- strong pressure changes can increase wind tendency

## Recommended simplification
Do not simulate pressure as a spatial field.
Treat it as a city-scale atmospheric state plus trend.

## Pressure ranges
Suggested broad operating range:
- 980 to 1045 hPa

Suggested normal stable range:
- 995 to 1030 hPa

## Pressure logic example
- if pressureTrend is sharply negative, increase storminess target
- if pressure is low and humidity high, increase cloud formation target
- if pressure rises and humidity is moderate, reduce precipitation tendency over time

## Cloud Model

Cloud cover should be a dynamic state driven by:
- humidity
- pressure
- storminess
- daylight heating later if desired
- user changes

## Required effects of cloud cover
- reduce solar radiation
- reduce daytime heating
- reduce nighttime radiative cooling somewhat
- increase chance of precipitation when humidity is high

## Cloud logic example
`cloudTarget = f(humidity, pressure, storminess, userTarget)`

Then:
`cloudCover01 = moveToward(cloudCover01, cloudTarget, cloudResponseRate * simDelta)`

## Humidity Model

Humidity can be modeled as a compact scalar.

## Inputs
- seasonal baseline tendency
- precipitation persistence
- cloud presence
- user adjustments
- temperature interactions later if desired

## Effects
- supports cloud formation
- supports precipitation formation
- affects storm persistence

## Suggested MVP rule
Keep humidity simple but meaningful.
It does not need to be perfect. It only needs to help clouds and rain behave like relatives instead of strangers.

## Wind Model

Wind should be influenced by:
- pressure trend
- storminess
- scenario presets
- user target

## Required effects
- stronger wind raises wind farm output
- stronger wind increases cooling tendency
- storm conditions often raise wind

## Wind logic example
`windTarget = baseWind + pressureChangeWindBoost + stormWindBoost + userWindAdjustment`

Then smooth toward target.

## Precipitation Model

Precipitation should emerge when conditions support it.

## Inputs
- cloud cover
- humidity
- storminess
- pressure
- temperature if snow is later added

## Rule shape
Rain should not appear from cloud alone.
It should require a threshold combination.

Example:
- if cloud > 0.65
- and humidity > 0.6
- and storminess > 0.4
- then precipitation target rises

Then smooth precipitation toward target.

## Weather Category Derivation

Derive weather category from the actual values.

Suggested logic:
- `storm` if precipitation high and wind high and storminess high
- `rain` if precipitation above threshold
- `cloudy` if cloud cover high
- `partly_cloudy` if cloud cover moderate
- `clear` otherwise

## Override Precedence

Recommended order of influence:
1. hard force overrides
2. scenario preset targets
3. manual nudges and target biases
4. causal model dynamics
5. seasonal baseline tendencies

This order should be explicit in code.
Without this, overrides become mystical and debugging becomes a punishment ritual.

## Update Loop Specification

Each weather update tick should run in this order:

1. update simulation calendar context
2. compute season and daylight state
3. compute seasonal baseline targets
4. apply user overrides and scenario targets
5. update pressure and pressure trend
6. update storminess and instability
7. update humidity target and humidity state
8. update cloud target and cloud state
9. update wind target and wind state
10. update precipitation target and precipitation state
11. update solar radiation from daylight and cloud cover
12. update temperature and feels-like temperature
13. derive weather category
14. publish weather state for downstream systems

## Simulation Speed Handling

Simulation speed affects the weather by increasing simulated delta time.

Recommended safeguards:
- keep per-tick variable deltas clamped
- use response rates rather than instant jumps
- optionally substep weather updates if sim speed is very high

Recommended initial supported speeds:
- 1x
- 5x
- 10x
- 30x
- 60x

## Energy Integration Requirements

### Solar farms
Solar generation should depend on:
- solarRadiationWm2
- daylightFactor
- cloudCover01

### Wind farms
Wind generation should depend on:
- windSpeedMps
- optional turbine cut-in/cut-out logic later

## Telemetry Outputs

The weather system should emit telemetry such as:
- air temperature
- feels-like temperature
- pressure
- humidity
- cloud cover
- precipitation intensity
- wind speed
- wind direction
- solar radiation
- weather category
- isDay

## Configuration Requirements

The system should be configurable through a weather config object or file.

Recommended config groups:
- city location
- seasonal temperature curves
- daylight parameters
- variable response rates
- cloud attenuation constants
- precipitation thresholds
- wind sensitivity
- override blending rules
- scenario presets

## Test Scenarios

The first test set should include:

### Scenario T1, clear summer noon
Expected:
- strong solar radiation
- warm temperature
- no precipitation
- high solar farm output

### Scenario T2, cloudy summer noon
Expected:
- reduced solar radiation
- lower temperature trend than clear noon
- lower solar output

### Scenario T3, winter night
Expected:
- no sunlight
- colder temperature
- lower baseline than summer night

### Scenario T4, falling pressure event
Expected:
- storminess rises over time
- cloud tendency rises
- wind tendency rises
- rain probability rises if humidity supports it

### Scenario T5, force heavy cloud
Expected:
- solar radiation falls
- temperature heating weakens
- solar farm output drops

### Scenario T6, increase wind
Expected:
- wind farm output rises
- feels-like temperature falls somewhat

### Scenario T7, 10x time speed
Expected:
- weather evolves faster
- no absurd single-tick jumps
- day/night and temperature changes remain smooth

## Recommended Implementation Modules

Suggested internal module layout inside VC:
- `weather/types`
- `weather/config`
- `weather/calendar`
- `weather/baseline`
- `weather/overrides`
- `weather/rules`
- `weather/update`
- `weather/scenarios`
- `weather/telemetry`

## Definition of Done for the First Weather Implementation

Done means:
- the weather system runs automatically when VC starts
- the simulation clock drives weather changes
- date and season affect weather baseline behavior
- nights cool down
- clouds reduce sunlight and temperature tendency
- pressure changes affect weather quality over time
- wind affects wind output and cooling tendency
- solar output reacts to sunlight and cloud cover
- user control inputs cause believable responses
- telemetry can be emitted from the weather state

## Short conclusion

This specification aims for the correct level of ambition.
Not toy weather, not planetary science, but a reactive city-scale weather engine that behaves like a coherent system and supports the rest of Cityverse properly.
