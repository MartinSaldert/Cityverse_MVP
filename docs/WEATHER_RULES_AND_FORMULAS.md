# Cityverse MVP, Weather Rules and Formulas

Date: 2026-04-17
Status: first-pass implementation draft

## Purpose

This document defines the first practical rules and formulas for the Cityverse weather system.

These rules are meant to be:
- simple enough to implement quickly
- believable enough for simulation
- tunable without rewriting the engine
- stable under accelerated simulation time

This is not a full physical weather model.
It is a causal weather model for a city simulation.

## Modeling Principles

The first implementation should follow these principles:
- all major weather values change gradually, not by teleportation
- user actions should push the system, not necessarily replace all dynamics forever
- day, night, season, cloud, wind, humidity, and pressure should interact
- values should be clamped to sane ranges
- formulas should be explicit and configurable

## Core Runtime Variables

Suggested normalized ranges and physical-ish values:
- `pressureHpa`: 980 to 1045
- `pressureTrend`: -2.0 to +2.0 hPa per simulated hour
- `temperatureC`: -30 to +45
- `humidity01`: 0.0 to 1.0
- `cloudCover01`: 0.0 to 1.0
- `precipitation01`: 0.0 to 1.0
- `windSpeedMps`: 0 to 35
- `solarRadiationWm2`: 0 to 1100
- `instability01`: 0.0 to 1.0
- `storminess01`: 0.0 to 1.0

## Utility Functions

### Clamp
`clamp(x, min, max)`

### Move toward
Use smoothing instead of direct jumps.

`moveToward(current, target, rate, dt)`

Recommended interpretation:
- `rate` is response per simulated hour
- `dt` is simulated hours since last weather tick

Example:
`next = current + (target - current) * min(1, rate * dt)`

### Normalize
For converting values into 0..1 influence factors.

`normalize(value, min, max)`

---

## 1. Season and Daylight Baselines

## Season lookup
Example first-pass month mapping:
- winter: 12, 1, 2
- spring: 3, 4, 5
- summer: 6, 7, 8
- autumn: 9, 10, 11

## Seasonal temperature baselines
Use configurable daily min/max curves.

Example defaults:
- winter: min -5, max 3
- spring: min 3, max 15
- summer: min 14, max 27
- autumn: min 6, max 16

### Baseline daily temperature target
Use a simple shaped daily temperature curve.

Concept:
- coolest near early morning
- warmest in mid-late afternoon

Recommended approach:
1. compute daily seasonal min/max
2. compute day phase factor from local hour
3. interpolate between min and max

Example simplified day-phase curve:
- pre-dawn: near min
- noon: rising strongly
- 15:00 to 16:00: near max
- late evening: cooling

A simple usable approximation:
`dayHeatCurve = max(0, sin(pi * daylightFactor))`

Then:
`baselineTemp = dailyMin + (dailyMax - dailyMin) * shiftedDailyHeatCurve`

This should be shaped so the peak occurs after noon, not exactly at noon.

## Sunrise and sunset
For MVP, this can be computed using:
- a simplified seasonal daylight-duration approximation
- or a proper solar calculation helper later

Example simplified output:
- winter daylight duration shorter
- summer daylight duration longer

Then:
- `sunrise = 12 - daylightDuration / 2`
- `sunset = 12 + daylightDuration / 2`

## Daylight factor
If hour is outside sunrise/sunset:
- `daylightFactor = 0`

If inside daylight:
- map hour between sunrise and sunset to 0..1
- shape with sine to get a daylight arc

Example:
`solarArc = sin(pi * daylightProgress)`
`daylightFactor = max(0, solarArc)`

---

## 2. Solar Radiation

## Clear-sky solar baseline
`clearSkySolar = seasonalSolarPeak * daylightFactor`

Example seasonal solar peak defaults:
- winter: 350 to 500 W/m2 first-pass simplified
- spring: 550 to 750
- summer: 800 to 1000
- autumn: 500 to 700

## Cloud attenuation
Clouds reduce solar radiation.

Suggested first-pass formula:
`cloudAttenuation = 0.15 + cloudCover01 * 0.75`
when cloudCover is above 0, otherwise 0

Safer implementation:
`solarRadiationWm2 = clearSkySolar * (1 - 0.75 * cloudCover01)`

Clamp to >= 0.

This means:
- clear sky gives full baseline
- full cloud still leaves a little ambient light

---

## 3. Pressure Dynamics

## Pressure target sources
Pressure target may come from:
- baseline drift
- scenario preset
- user nudge
- override target

## Pressure update
`pressureHpa = moveToward(pressureHpa, pressureTargetHpa, pressureResponseRate, dt)`

## Pressure trend
Track change over simulated hour.

`pressureTrend = (pressureHpa - previousPressureHpa) / dtHours`

Clamp trend to a sane range.

## Storminess contribution from pressure
Lower and falling pressure should worsen weather.

Example:
`lowPressureFactor = normalize(1012 - pressureHpa, 0, 25)` clamped 0..1
`fallingPressureFactor = normalize(-pressureTrend, 0, 1.5)` clamped 0..1

Then:
`pressureStormContribution = 0.6 * lowPressureFactor + 0.4 * fallingPressureFactor`

---

## 4. Humidity Dynamics

## Baseline humidity target
Use season-dependent target ranges.

Example:
- winter: 0.45 to 0.75
- spring: 0.40 to 0.70
- summer: 0.35 to 0.75
- autumn: 0.50 to 0.85

Humidity target can also be nudged by:
- cloud persistence
- rain persistence
- user adjustment

Example:
`humidityTarget = seasonalHumidityBase + 0.10 * precipitation01 + userHumidityBias`

Then:
`humidity01 = moveToward(humidity01, humidityTarget, humidityResponseRate, dt)`

Clamp 0..1.

---

## 5. Storminess and Instability

These are compact helper values to avoid needing a full physics model.

## Storminess target
Example:
`storminessTarget =`
- `0.45 * pressureStormContribution`
- `+ 0.25 * humidity01`
- `+ 0.20 * cloudCover01`
- `+ scenarioStormBias`

Clamp 0..1 and smooth over time.

## Instability target
Instability can be a lighter helper for rain/storm development.

Example:
`instabilityTarget =`
- `0.30 * humidity01`
- `+ 0.25 * daylightFactor`
- `+ 0.20 * summerFactor`
- `+ 0.25 * fallingPressureFactor`

This is intentionally approximate.
It exists to make conditions feel connected rather than assembled by committee.

---

## 6. Cloud Dynamics

## Cloud target
Clouds should depend on:
- humidity
- low/falling pressure
- storminess
- user cloud target/bias

Example:
`cloudTarget =`
- `0.35 * humidity01`
- `+ 0.25 * lowPressureFactor`
- `+ 0.20 * fallingPressureFactor`
- `+ 0.20 * storminess01`
- `+ userCloudBias`

Clamp 0..1.

Then:
`cloudCover01 = moveToward(cloudCover01, cloudTarget, cloudResponseRate, dt)`

## Cloud effect on temperature
During daytime:
`dayCloudCooling = cloudCover01 * 4.0 * daylightFactor`

At night, clouds reduce cooling slightly:
`nightCloudWarming = cloudCover01 * 1.5 * (1 - daylightFactor)`

---

## 7. Wind Dynamics

## Wind target
Wind should depend on:
- baseline seasonal wind
- pressure changes
- storminess
- user target/bias

Example:
`windTargetMps =`
- `seasonalBaseWind`
- `+ 4.0 * fallingPressureFactor`
- `+ 6.0 * storminess01`
- `+ userWindBiasMps`

Then:
`windSpeedMps = moveToward(windSpeedMps, windTargetMps, windResponseRate, dt)`

Clamp to a sane range.

## Effective cooling from wind
Wind should cool temperature somewhat.

Simple first-pass adjustment:
`windCooling = min(4.0, windSpeedMps * 0.15)`

Feels-like:
`feelsLikeC = temperatureC - windCooling`

---

## 8. Precipitation Dynamics

## Rain support score
Rain should depend on multiple conditions.

Example:
`rainSupport =`
- `0.35 * cloudCover01`
- `+ 0.30 * humidity01`
- `+ 0.20 * storminess01`
- `+ 0.15 * lowPressureFactor`

## Precipitation target
Use thresholds:
- below 0.55: no rain target
- 0.55 to 0.75: light rain target
- above 0.75: moderate to heavy rain target depending on score

Example:
```
if rainSupport < 0.55: precipitationTarget = 0
else precipitationTarget = normalize(rainSupport, 0.55, 1.0)
```

Then:
`precipitation01 = moveToward(precipitation01, precipitationTarget, precipitationResponseRate, dt)`

## Rain cooling
Simple effect:
`rainCooling = precipitation01 * 2.5`

---

## 9. Temperature Update

## Components
`targetTemp =`
- `baselineTemp`
- `+ solarHeating`
- `- dayCloudCooling`
- `+ nightCloudWarming`
- `- windCooling`
- `- rainCooling`
- `+ userTempBias`

## Solar heating
Example:
`solarHeating = normalize(solarRadiationWm2, 0, seasonalSolarPeakMax) * 6.0`

This can be tuned by season if needed.

## Temperature smoothing
`temperatureC = moveToward(temperatureC, targetTemp, temperatureResponseRate, dt)`

## Desired behavior checks
- clear summer noon warmer than cloudy summer noon
- clear winter night colder than cloudy winter night
- stronger wind cools temperature modestly
- rain cools temperature somewhat

---

## 10. Weather Category

Suggested derivation:
- `storm` if precipitation01 > 0.6 and windSpeedMps > 12 and storminess01 > 0.65
- `rain` if precipitation01 > 0.2
- `cloudy` if cloudCover01 > 0.7
- `partly_cloudy` if cloudCover01 > 0.3
- `clear` otherwise

---

## 11. User Input Rules

## Pressure change
When user lowers pressure:
- pressure target drops
- storminess rises gradually
- cloud tendency rises gradually
- wind tendency may rise
- precipitation chance may rise if humidity supports it

## Cloud increase
When user increases cloud target:
- solar radiation drops quickly
- daytime warming weakens
- precipitation chance may rise if humidity is already supportive
- pressure may be nudged slightly lower if desired

Suggested optional coupling:
`pressureTargetHpa += (0.5 - cloudCover01) * cloudPressureCoupling`

Keep this small.
Cloud should not wildly rewrite pressure like an irritated deity.

## Wind increase
When user increases wind target:
- wind farm output rises
- feels-like temperature falls
- cloud motion or clearing effects can be added later

## Date change to January
When user changes date to January:
- baseline temp range becomes winter-like
- daylight shortens
- solar baseline drops
- nights cool more quickly

## Time speed to 10x
When user sets 10x:
- weather tick sees more simulated time per real second
- smoothing and clamped deltas prevent violent jumps

---

## 12. Configurable Parameters

Recommended config values:
- `pressureResponseRate`
- `humidityResponseRate`
- `cloudResponseRate`
- `windResponseRate`
- `precipitationResponseRate`
- `temperatureResponseRate`
- `cloudPressureCoupling`
- `solarCloudAttenuation`
- `storminessResponseRate`
- `instabilityResponseRate`

These should be external config, not magic numbers buried in the engine like guilty secrets.

---

## 13. Stability Safeguards

To avoid oscillation and nonsense:
- clamp all normalized variables to 0..1
- clamp pressure and wind to sane bounds
- smooth all major changes
- avoid circular instant updates in one tick
- use previous tick values when computing some targets if necessary
- allow substeps for high simulation speeds later

---

## 14. First-Pass Tuning Targets

The first implementation should try to achieve these qualitative results:
- pressure decrease makes weather worsen over 15 to 90 simulated minutes, not instantly
- cloud increase reduces sunlight almost immediately but temperature more gradually
- night cooling is visible over a few simulated hours
- moving from summer to winter changes both light and temperature meaningfully
- wind changes affect power output quickly and thermal effects moderately

## Short conclusion

These formulas are not sacred, but they are enough to build a coherent first-pass reactive weather engine.
The important thing is that the relationships are explicit, tunable, and believable, which is far more useful at this stage than pseudo-scientific complexity in a trench coat.
