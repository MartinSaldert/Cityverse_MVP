# Cityverse MVP, Research 01: Weather Simulation

Date: 2026-04-16
Task reference: `TASKS.md` item 1, Investigate weather simulation options

## Purpose

This document investigates how Cityverse MVP should handle weather simulation in a way that is:
- realistic enough to drive downstream systems,
- practical to implement on Windows for the MVP,
- compatible with VC, IOT, and DT as separate executables,
- useful for both seeded historical data and live simulation.

This is the first research document in the implementation investigation series.

## Problem We Need to Solve

Cityverse needs weather that is not merely decorative.

The weather system must influence:
- time and date dependent daylight,
- season-aware day and night behavior,
- solar generation,
- wind generation,
- building electricity demand,
- heating and cooling demand later,
- traffic and possibly occupancy behavior later,
- CO2 emissions.

It must also support two different operating modes:
1. seeded historical or baseline simulation data, and
2. live simulation runtime with user control from the UI.

## Required Outputs From the Weather System

At minimum, the weather model for Cityverse should expose:
- timestamp,
- city location,
- season,
- daylight state,
- sunrise and sunset,
- temperature,
- wind speed,
- wind direction,
- cloud cover,
- precipitation,
- solar radiation or sunlight intensity,
- humidity if available,
- weather state category such as clear, cloudy, rain, snow, storm.

These values should be available to:
- VC simulation systems,
- IOT telemetry generation,
- DT visualization,
- the web control UI,
- seeded historical data generation.

## Evaluation Criteria

A useful weather solution for Cityverse should satisfy most or all of these:
- supports time and date awareness,
- supports seasonal variation,
- supports daylight and sunrise/sunset behavior,
- provides wind and solar inputs for power simulation,
- provides precipitation and cloud conditions for realism,
- can support a year of seeded data,
- can support live runtime updates,
- can run locally on Windows,
- can later support remote deployment,
- has a licensing model compatible with the project,
- is practical to integrate with separate VC, IOT, and DT executables.

## Main Options Investigated

### Option A, fully custom procedural weather system

This means Cityverse would generate all weather internally using its own logic.

Advantages:
- full control,
- no external service dependency,
- easy to force scenarios,
- works fully offline,
- naturally fits a synthetic city.

Disadvantages:
- large design burden,
- easy to produce unrealistic results,
- difficult to get seasonal and solar behavior right without additional scientific components,
- likely poor starting point for seeded one-year history unless carefully calibrated.

Assessment:
Good as a later layer for scenario variation and synthetic anomalies, but probably not the best sole foundation for the MVP.

### Option B, existing weather API plus local simulation layer

This means Cityverse uses a real weather data source or model-derived source as a baseline, then adds local simulation logic on top.

Advantages:
- much higher realism quickly,
- supports seeded history immediately,
- gives access to temperature, precipitation, wind, cloud cover, and solar variables,
- easier to map to real-world patterns,
- useful for realistic training data and benchmarking.

Disadvantages:
- dependency on external data or a local hosted service,
- requires data normalization and caching,
- still needs local logic for scenario forcing and synthetic events.

Assessment:
Strong candidate for MVP foundation.

### Option C, Unity weather package as the main weather engine

This means a Unity package would become the primary weather logic source.

Advantages:
- easy visual integration for DT,
- fast prototyping of visible weather,
- often includes built-in effects like rain, fog, sky changes.

Disadvantages:
- many Unity weather packages are visual-first rather than simulation-first,
- often not ideal as the authoritative system for VC + IOT + DT separation,
- may be outdated or too tightly coupled to Unity scenes,
- weak fit if VC later runs remotely or outside Unity.

Assessment:
Useful for DT-side rendering or prototyping, but not ideal as the authoritative weather model for the whole platform.

## Source Findings

## 1. Open-Meteo is a strong baseline data source

Open-Meteo’s official docs and repository show that it exposes:
- hourly forecasts up to 16 days,
- historical weather data across long ranges,
- wind,
- precipitation,
- cloud cover,
- solar radiation,
- sunrise and sunset related values,
- an `is_day` style signal,
- multiple underlying weather models,
- open source code with self-hosting options.

Useful findings from Open-Meteo:
- the GitHub repository says it provides hourly weather forecast data for up to 16 days and an 80-year Historical Weather API
- the same repository says it is possible to launch your own weather API with Docker or prebuilt Ubuntu packages
- the historical and forecast docs include solar radiation variables such as shortwave radiation, direct radiation, diffuse radiation, DNI, and GTI
- the docs also include sunrise, sunset, daylight duration, sunshine duration, and day/night fields
- the docs include wind speed, precipitation, cloud cover, temperature, and other variables directly useful for Cityverse systems

Practical value for Cityverse:
- excellent candidate for seeded one-year weather history,
- good candidate for live baseline weather,
- useful for solar and wind generation modeling,
- useful for seasonally believable patterns,
- strong fit for realistic downstream telemetry.

Caution:
- Open-Meteo is a weather data platform, not a full game weather simulator,
- Cityverse would still need its own internal weather state model and scenario-control layer.

## 2. NREL SPA is strong for accurate solar position

NREL’s Solar Position Algorithm page states that the algorithm calculates solar zenith and azimuth from year -2000 to 6000 with uncertainty of plus or minus 0.0003 degrees.

Practical value for Cityverse:
- very strong basis for accurate daylight and solar angle calculations,
- useful if we want the sun path to be deterministic and physically grounded,
- valuable for solar generation calculations,
- good foundation if we want VC to compute day/night and solar geometry locally rather than depending on an external service for that part.

Caution:
- the NREL page says the provided software has specific licensing terms and is offered as a convenience,
- the downloadable implementation is in ANSI C,
- this suggests using the published algorithm or a compatible implementation may be more practical than directly embedding the exact NREL code without reviewing license implications carefully.

## 3. NOAA solar calculator details are good for sanity checks

NOAA’s solar calculation details page states that its sunrise and sunset calculations are based on equations from Astronomical Algorithms and are theoretically accurate to within about a minute for locations between plus or minus 72 degrees latitude, and within 10 minutes outside those latitudes.

Practical value for Cityverse:
- useful as a validation reference for day/night logic,
- useful for simpler sunrise and sunset validation if we do not start with the full SPA route,
- helpful for checking expected behavior in test cases.

## 4. Existing open-source Unity weather systems exist, but look DT-side rather than platform-core

### Slord6/WeatherSystem
The GitHub repository describes it as an open-source Unity weather package. The repo says it provides:
- procedural and manually curated weather events,
- a queryable interface based on weather intensity, temperature, and humidity,
- delegate callbacks for weather changes,
- extensibility for adding weather types.

Practical value for Cityverse:
- useful as a reference implementation,
- useful for DT-side visualization or prototype behavior,
- proof that a Unity weather layer can expose queryable state rather than just visuals.

Caution:
- the repository is from an older Unity era,
- it appears more suitable as a Unity-side weather layer than as the authoritative weather service for separated executables,
- it does not obviously solve historical weather seeding, cloud deployment, or platform-level realism on its own.

### EnricoMonese/DayNightCycle
This repository describes itself as an easy and simple day-night cycle for Unity.

Practical value for Cityverse:
- useful for quick DT-side visual prototyping,
- useful as a reference for simple directional light and skybox control.

Caution:
- it is only a day/night cycle helper,
- not sufficient as a full weather system,
- not a platform weather authority.

## Key Architectural Insight

Inference from the sources:
The best MVP direction is probably not to choose a single off-the-shelf weather package and declare victory.

A better architecture is likely a hybrid weather system with three layers:

### Layer 1, authoritative weather state in VC
VC should own the authoritative weather state for the city.

This state should include:
- time and date,
- location,
- season,
- current weather variables,
- short-term forecast state,
- scenario overrides from the UI.

This keeps weather aligned with the rest of the simulation and avoids making DT or a Unity plugin the source of truth.

### Layer 2, deterministic solar and daylight model
VC should compute day/night, sunrise/sunset, and solar angle locally.

Recommended basis:
- NREL SPA or a compatible implementation for higher accuracy, or
- NOAA-style sunrise/sunset equations for a simpler first version.

This gives the project:
- stable day/night behavior,
- season-aware daylight,
- accurate solar geometry for solar power simulation,
- freedom from network dependency for basic daylight logic.

### Layer 3, weather baseline and history source
Use Open-Meteo as the baseline source for:
- historical seeded weather,
- real-world weather-informed scenarios,
- wind and solar input values,
- temperature, precipitation, and cloud patterns.

Then add Cityverse-specific simulation logic on top, such as:
- scenario forcing,
- anomaly injection,
- local synthetic perturbations,
- user-controlled weather overrides.

This gives a weather system that is both realistic and controllable, which is exactly the sort of compromise mature systems make after learning not to trust purity.

## Recommended MVP Approach

### Recommendation
Use a hybrid approach.

#### Recommended stack for MVP
1. VC owns the canonical weather state.
2. VC computes time, date, season, day/night, and solar angle locally.
3. Open-Meteo provides baseline historical and forecast weather inputs.
4. VC adds a synthetic scenario layer for overrides and event forcing.
5. IOT receives weather telemetry from VC as normalized simulated sensor output.
6. DT and Unity consume weather state from IOT or from a DT-facing API, not from an independent Unity weather package acting as the source of truth.

### Why this is the best fit
This approach best satisfies the actual project requirements:
- realistic enough for implementation planning,
- supports seeded one-year data generation,
- supports live runtime weather changes,
- supports later remote deployment,
- avoids over-coupling to Unity,
- keeps the weather model useful for energy and emissions simulation.

## Suggested Weather Data Model for VC

A first-pass weather state object could include:
- `timestampUtc`
- `timezone`
- `latitude`
- `longitude`
- `dayOfYear`
- `season`
- `isDay`
- `sunriseLocal`
- `sunsetLocal`
- `solarElevationDeg`
- `solarAzimuthDeg`
- `temperatureC`
- `humidityPct`
- `cloudCoverPct`
- `precipitationMmPerHr`
- `windSpeedMps`
- `windDirectionDeg`
- `solarRadiationWm2`
- `weatherCode`
- `sourceType` such as seeded, live, overridden, synthetic
- `overrideState`

## How This Connects to Other Systems

### Energy simulation
Needs:
- wind speed,
- solar radiation,
- temperature,
- day/night.

### Buildings
Needs:
- temperature,
- season,
- sunlight,
- precipitation later,
- humidity later.

### CO2 modeling
Needs:
- weather-driven demand changes,
- weather-driven renewable generation changes.

### DT and Unity
Needs:
- a clean weather state contract,
- no hidden Unity-only weather authority,
- ability to render clouds, rain, sky color, lighting, fog, and day/night based on authoritative values.

### IOT
Needs:
- weather stations or synthetic sensors publishing normalized telemetry derived from the authoritative weather state.

## Practical Integration Plan

### MVP phase 1
- implement local time, date, season, and day/night model in VC
- implement a simple weather state schema in VC
- ingest Open-Meteo historical weather for one chosen city location
- seed one year of historical weather values for IOT storage
- expose current weather state through VC and IOT APIs

### MVP phase 2
- add UI controls for forcing weather and time
- add weather influence on wind farm and solar farm output
- add weather influence on building electricity demand
- publish weather telemetry into IOT as synthetic weather-station data
- drive DT visuals from the weather state

### MVP phase 3
- add anomaly and event layers such as storms, heat waves, cold snaps, and extreme wind events
- decide whether to self-host a weather backend or cache required weather data locally
- add richer district-level weather variation only if needed

## Risks and Caveats

### Risk 1, overbuilding the weather engine
A giant bespoke weather simulator is tempting, but it is probably too much for the MVP.

### Risk 2, overtrusting a Unity weather package
A Unity package may solve visuals while failing the larger architecture.

### Risk 3, external dependency lock-in
If real weather APIs become central, Cityverse must still support caching, local data storage, and scenario overrides.

### Risk 4, mixing visual weather with simulation weather
DT visuals should reflect the authoritative weather state, not invent a competing one.

## Recommended Decision

Recommended decision for now:
- do not use a Unity weather asset as the system authority,
- do not build a purely custom weather engine first,
- use a hybrid architecture with local solar/day-night calculations plus Open-Meteo-backed baseline weather and Cityverse-controlled overrides.

## Proposed Follow-Up Tasks

After this research, the next useful weather-specific implementation tasks are:
1. define the VC weather state schema,
2. choose the first city location for seeded weather history,
3. decide whether the MVP uses live Open-Meteo calls, cached files, or both,
4. choose the day/night calculation implementation path,
5. define how weather telemetry is published into IOT,
6. define how DT and Unity consume weather state.

## Sources

Primary sources used:
- Open-Meteo Historical Forecast API: https://open-meteo.com/en/docs/historical-forecast-api
- Open-Meteo Historical Weather API: https://open-meteo.com/en/docs/historical-weather-api
- Open-Meteo GitHub repository: https://github.com/open-meteo/open-meteo
- NREL Solar Position Algorithm page: https://midcdmz.nrel.gov/spa/
- NOAA Solar Calculation Details: https://www.gml.noaa.gov/grad/solcalc/calcdetails.html
- Slord6 WeatherSystem repository: https://github.com/Slord6/WeatherSystem
- EnricoMonese DayNightCycle repository: https://github.com/EnricoMonese/DayNightCycle

## Short conclusion

The most practical and realistic MVP weather strategy is a hybrid one:
- VC owns the weather state,
- solar/day-night is computed locally,
- Open-Meteo provides realistic baseline weather and history,
- Cityverse adds scenario control and synthetic perturbation,
- DT renders the result rather than inventing its own weather truth.
