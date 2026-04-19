# Cityverse MVP, Research 03: Electricity Generation Statistics and Models

Date: 2026-04-16
Task reference: `TASKS.md` item 3, Investigate electricity generation statistics and models

## Purpose

This document investigates realistic generation behavior for the main power sources currently planned for Cityverse MVP:
- wind farm,
- solar farm,
- mini nuclear plant,
- gas or oil plant.

The goal is to identify:
- credible benchmark sources,
- realistic capacity factor ranges,
- weather and time dependencies,
- operational constraints,
- practical MVP approximation models,
- what should later feed CO2 calculations.

## Scope Note

The strongest official benchmark sources found for this task are mainly:
- U.S. Energy Information Administration (EIA),
- National Renewable Energy Laboratory (NREL),
- International Atomic Energy Agency (IAEA).

These are strong for first-pass system design.

However, one important limitation is that there is not much public operating data for real commercial “mini nuclear plant” deployments because that category is still limited in real-world commercial operation. So for the MVP, the practical move is to model the mini nuclear plant as a simplified nuclear-like asset informed by conventional nuclear data and load-following guidance.

That is an inference, but a sensible one.

## Executive Summary

The clearest findings are:

1. **Wind and solar must be weather-driven first, dispatch-driven second.**
   Their output should primarily be determined by resource availability, with optional curtailment or forced outages layered on top.

2. **Nuclear should be modeled as a high-capacity-factor, mostly-steady asset.**
   EIA’s 2025 annual utility-scale nuclear capacity factor is about **91.0%**. IAEA guidance confirms nuclear load following is possible, but it is not the simplest default mode.

3. **Natural gas should probably be split into at least two operational patterns.**
   EIA data shows combined-cycle natural gas runs much harder than gas turbines. In 2025, EIA reports annual capacity factors of about **58.4%** for natural gas combined cycle and **14.1%** for natural gas turbine units. That is a major behavioral difference.

4. **Oil plants are likely best treated as rare, expensive, dirtier peaking or backup units in the MVP.**
   EIA’s 2025 annual capacity factors for petroleum units are low, around **11.3%** for petroleum steam turbine and roughly **2%** for petroleum gas turbine and internal combustion categories.

5. **Capacity factor alone is not enough.**
   Cityverse needs operational models with:
   - weather dependency,
   - ramp behavior,
   - minimum stable output where relevant,
   - availability / outages,
   - startup logic where relevant,
   - CO2 intensity implications.

6. **For implementation, a hybrid modeling strategy is best.**
   Use source-backed annual or class-based benchmarks for realism, then use simplified plant-type-specific time-step models in VC.

## Key Source Findings

## 1. Capacity factor benchmarks from EIA

EIA’s latest Electric Power Monthly capacity-factor tables are very useful because they provide annual and monthly operating benchmarks for utility-scale generators.

### Non-fossil generators, annual 2025
EIA reports these 2025 annual capacity factors for utility-scale non-fossil generators:
- nuclear: **91.0%**
- solar photovoltaic: **24.4%**
- wind: **34.2%**

### Fossil generators, annual 2025
EIA reports these 2025 annual capacity factors for utility-scale fossil generators:
- natural gas combined cycle: **58.4%**
- natural gas gas turbine: **14.1%**
- natural gas steam turbine: **19.8%**
- natural gas internal combustion: **17.4%**
- petroleum steam turbine: **11.3%**
- petroleum gas turbine: **2.1%**
- petroleum internal combustion: **1.9%**

### Why this matters for Cityverse
These numbers strongly support modeling the planned plant types as different behavioral classes rather than one generic “generator” with different skins.

Inference from EIA:
- nuclear behaves like a mostly-on baseload unit,
- gas combined cycle behaves like a heavily used dispatchable unit,
- gas turbine behaves more like a peaker or balancing asset,
- petroleum behaves like a low-utilization backup or niche unit,
- wind and solar are resource-constrained rather than freely dispatchable.

## 2. Solar generation behavior from EIA and NREL

### EIA operational benchmark
EIA reports utility-scale solar photovoltaic capacity factor at **24.4%** for 2025.

Monthly 2024 EIA values also show strong seasonal variation. For example:
- January 2024 solar capacity factor: **13.4%**
- June 2024 solar capacity factor: **40.1%**

This is useful because it shows the model should not produce roughly equal monthly solar output through the year.

### NREL resource and modeling findings
NREL’s 2024 ATB page for utility-scale PV states:
- estimated 2021 first-year AC capacity factors ranged from **21.4%** to **34.0%** depending on solar resource class,
- from 2007 to 2021 the cumulative median AC capacity factor for U.S. utility-scale PV projects was **24%**,
- individual project-level capacity factors showed a wide range of **9%–35%**,
- the capacity factor is influenced by the hourly solar profile, technology, bifaciality, albedo, tracking type, shading, downtime, inverter loading ratio, and inverter losses.

NREL also states that PVWatts Version 8 uses more detailed and industry-accepted algorithms and updated weather data from the National Solar Radiation Database.

### What this means for Cityverse
Solar farm output should depend on:
- time of day,
- day of year,
- solar angle,
- cloud cover,
- irradiance,
- optionally temperature and system losses.

A useful first-pass model should not attempt full bankable PV engineering, but it should at least include:
- sunrise / sunset gating,
- a day-shape driven by solar elevation or irradiance,
- cloud attenuation,
- seasonal variation,
- optional temperature / efficiency derate later.

### Recommended solar MVP approximation
A good MVP solar model is:
1. compute solar position from time, date, and location,
2. derive a clear-sky daylight intensity curve,
3. reduce it by cloud / weather factors,
4. apply site quality and plant efficiency factors,
5. cap at installed capacity,
6. optionally add outages or curtailment.

This should produce:
- zero output at night,
- lower winter output,
- higher summer midday output,
- weather-sensitive generation,
- realistic daily curves.

### Suggested solar plant fields
- `installedCapacityMw`
- `resourceClass`
- `trackingType`
- `availabilityPct`
- `cloudLossFactor`
- `temperatureLossFactor`
- `curtailmentPct`
- `currentOutputMw`
- `dailyEnergyMwh`
- `annualExpectedCapacityFactor`

## 3. Wind generation behavior from EIA and NREL

### EIA operational benchmark
EIA reports utility-scale wind capacity factor at **34.2%** for 2025.

Monthly 2024 EIA values show significant seasonal variability as well. For example:
- April 2024 wind capacity factor: **43.7%**
- July 2024 wind capacity factor: **25.2%**

This is useful because it shows wind should not be modeled as flat output with minor noise.

### NREL modeling findings
NREL’s 2024 ATB page for land-based wind says:
- net capacity factor is influenced by the generation profile, expected downtime, and plant energy losses,
- gross energy production is derived from power curves for representative wind turbine characteristics,
- the 2022 market-average wind turbine had an NCF around **37%**,
- representative 2030 technologies in the moderate scenario ranged from about **27.6%** to **47.5%** depending on wind speed class and turbine configuration,
- total system losses differ by scenario and matter materially.

NREL also explains that the base-year capacity factors are calculated from power curves and wind speed distributions.

### What this means for Cityverse
Wind farm output should depend on:
- wind speed,
- site quality,
- turbine configuration class,
- losses and downtime,
- optional curtailment,
- extreme weather or storm behavior later.

### Recommended wind MVP approximation
A good MVP wind model is:
1. use weather-system wind speed as the primary driver,
2. apply a simplified turbine power-curve approximation,
3. multiply by plant availability and loss factors,
4. cap at installed capacity,
5. optionally apply curtailment or outage events.

A simple first-pass engineering approximation can use three regimes:
- below cut-in wind speed, output near zero,
- between cut-in and rated wind speed, output rises nonlinearly,
- between rated and cut-out, output near rated,
- above cut-out, output drops for protection.

The exact thresholds can be implementation assumptions rather than official benchmark values, but the overall power-curve structure is strongly supported by NREL’s modeling approach.

### Suggested wind plant fields
- `installedCapacityMw`
- `windResourceClass`
- `availabilityPct`
- `lossFactor`
- `currentWindSpeedMps`
- `currentOutputMw`
- `dailyEnergyMwh`
- `annualExpectedCapacityFactor`

## 4. Nuclear generation behavior from EIA and IAEA

### EIA operational benchmark
EIA reports nuclear capacity factor at **91.0%** for 2025 and around **90.8%** for 2024. That is dramatically steadier than wind, solar, oil, or peaking gas assets.

### IAEA operational guidance
IAEA’s publication on non-baseload operation in nuclear power plants states that flexible operation and changing electrical output to match demand are real and relevant operating modes. The publication specifically addresses changing electrical output to match electrical demand and control grid frequency.

This matters because it means nuclear is not strictly incapable of load following. However, for the MVP, the simpler and more realistic default is still that nuclear is mostly steady rather than frequently cycled.

### What this means for Cityverse
The “mini nuclear plant” should probably be modeled as:
- a mostly-on baseload asset,
- high availability,
- slow-changing relative to gas units,
- low direct operational CO2 emissions,
- not strongly weather dependent.

Because public real-world SMR operating telemetry is limited, the MVP should likely use a simplified nuclear-like model rather than pretending we have detailed mini-reactor fleet statistics.

### Recommended nuclear MVP approximation
Recommended first-pass behavior:
- target output near a high steady setpoint,
- rare outages or maintenance events,
- optional slow manual load-follow mode,
- long startup and shutdown assumptions relative to gas plants,
- very low direct CO2 emissions during operation.

### Suggested nuclear plant fields
- `installedCapacityMw`
- `availabilityPct`
- `targetOutputPct`
- `minStableOutputPct`
- `rampRatePctPerMinute`
- `maintenanceState`
- `forcedOutageState`
- `currentOutputMw`
- `dailyEnergyMwh`
- `annualExpectedCapacityFactor`

## 5. Natural gas generation behavior from EIA

### EIA operational benchmark
EIA shows large differences between gas technologies.

For 2025 annual capacity factor:
- natural gas combined cycle: **58.4%**
- natural gas gas turbine: **14.1%**
- natural gas steam turbine: **19.8%**
- natural gas internal combustion: **17.4%**

EIA also states in a 2021 analysis that average NGCC utilization rose from **35%** in 2005 to more than **57%** in 2020, and that newer plants tend to run harder than older ones.

### What this means for Cityverse
A single “gas plant” is too vague.

At minimum, Cityverse should distinguish between:
- **gas combined cycle**, for heavier sustained generation,
- **gas turbine peaker**, for flexible balancing or peak periods.

This distinction is important because it affects:
- dispatch behavior,
- startup and shutdown logic,
- CO2 intensity,
- role in balancing wind and solar,
- typical capacity factor.

### Recommended gas MVP approximation
#### Gas combined cycle
Model as:
- dispatchable,
- medium to high utilization,
- suitable for sustained output,
- less variable than peakers,
- useful for covering residual load after renewables and nuclear.

#### Gas turbine / peaker
Model as:
- low annual utilization,
- fast response,
- mainly used during peak demand, low renewable output, or contingency events.

### Suggested gas plant fields
- `plantSubtype` such as `combined_cycle` or `peaker`
- `installedCapacityMw`
- `availabilityPct`
- `minStableOutputPct`
- `rampRatePctPerMinute`
- `startupState`
- `startupDelayMinutes`
- `currentOutputMw`
- `fuelCostIndex`
- `co2IntensityKgPerMwh`
- `dailyEnergyMwh`
- `annualExpectedCapacityFactor`

## 6. Oil generation behavior from EIA

### EIA operational benchmark
EIA’s 2025 annual capacity factors for petroleum technologies are low:
- petroleum steam turbine: **11.3%**
- petroleum gas turbine: **2.1%**
- petroleum internal combustion: **1.9%**

### What this means for Cityverse
Oil generation is probably best treated as:
- emergency backup,
- expensive reserve generation,
- rare peaking support,
- high-emissions generation.

It should not be the normal backbone of a modern city unless the scenario deliberately wants a dirtier or more fragile energy system.

### Recommended oil MVP approximation
Model as:
- off by default,
- available for emergencies, peak events, or scenario forcing,
- high CO2 intensity,
- low annual runtime,
- possibly fast-start if represented as oil turbine or generator backup.

### Suggested oil plant fields
- `installedCapacityMw`
- `availabilityPct`
- `startupState`
- `startupDelayMinutes`
- `currentOutputMw`
- `co2IntensityKgPerMwh`
- `dispatchPriority`
- `fuelCostIndex`
- `dailyEnergyMwh`
- `annualExpectedCapacityFactor`

## Recommended Cityverse Plant Classes

Based on the research, the simplest strong first-pass generator set is:
- `wind_farm`
- `solar_farm`
- `mini_nuclear`
- `gas_ccgt`
- `gas_peaker`
- `oil_backup`

This is better than trying to force everything into four classes, because a gas peaker behaves far more like emergency flexibility than like a combined-cycle unit.

## Recommended First-Pass Capacity Factor Targets

These are practical benchmark targets for early calibration, not hard laws.

### Wind farm
- target annual range: roughly **30%–40%** for a decent site
- source basis: EIA 2025 annual wind **34.2%**, NREL representative range extending wider by class

### Solar farm
- target annual range: roughly **20%–30%** for a realistic first-pass model, with stronger sites above that
- source basis: EIA 2025 annual solar **24.4%**, NREL class range **21.4%–34.0%**, historical median **24%**

### Mini nuclear plant
- target annual range: roughly **85%–92%** depending on outage assumptions
- source basis: EIA nuclear **91.0%**, plus simplifying adjustment for a synthetic city asset

### Gas combined cycle
- target annual range: roughly **45%–65%** depending on city design and renewable penetration
- source basis: EIA 2025 NGCC **58.4%**, 2020 fleet average above **57%**

### Gas peaker
- target annual range: roughly **5%–20%** depending on how aggressively it is used to fill peaks
- source basis: EIA 2025 natural-gas gas turbine **14.1%**

### Oil backup
- target annual range: roughly **0%–10%** in most normal scenarios
- source basis: EIA 2025 petroleum values, mostly very low

## Operational Logic Recommendations

## 1. Dispatch order for a normal scenario
A sensible default dispatch order for Cityverse is:
1. wind and solar produce whatever resource allows,
2. mini nuclear provides a steady baseload block,
3. gas combined cycle fills sustained residual demand,
4. gas peaker covers sharp peaks or sudden renewable shortfalls,
5. oil backup handles emergency or forced scenarios.

This is an inference based on source-backed utilization patterns, not a universal market rule.

## 2. Weather dependency rules
### Wind farm
Depends strongly on:
- wind speed,
- availability,
- losses.

### Solar farm
Depends strongly on:
- daylight,
- irradiance,
- cloud cover,
- season,
- optionally temperature.

### Mini nuclear plant
Depends weakly on weather directly.

Indirect weather impact may matter later through cooling conditions or grid needs, but this is not the first-order driver.

### Gas and oil plants
Not resource-driven like wind and solar.

They should depend mainly on:
- dispatch need,
- fuel cost / scenario rules,
- startup state,
- operational constraints,
- outage state.

## 3. CO2 implications
This research is not the final CO2 model, but it directly supports it.

Qualitative emissions order in normal operation should be:
- wind and solar: very low direct operating CO2,
- nuclear: very low direct operating CO2,
- gas combined cycle: moderate fossil CO2,
- gas peaker: likely worse per unit of energy than efficient combined cycle,
- oil backup: highest and dirtiest normal option among planned generators.

This is the practical reason the city-wide CO2 signal should jump when oil or inefficient fossil backup plants start.

## Recommended MVP Implementation Strategy

## Option A, simple but strong
For MVP, each plant type uses:
- installed capacity,
- current availability,
- a type-specific generation model,
- a dispatch target where applicable,
- output telemetry,
- cumulative energy,
- CO2 intensity placeholder.

This is likely the best first implementation path.

## Option B, more detailed later
Later versions can add:
- startup fuel penalties,
- minimum up/down times,
- detailed heat-rate efficiency curves,
- maintenance calendars,
- curtailment logic,
- battery storage interaction,
- market dispatch or AI optimization.

## Suggested VC Data Model Fields for Generators

### Common fields
- `generatorId`
- `generatorType`
- `generatorSubtype`
- `installedCapacityMw`
- `availabilityPct`
- `currentOutputMw`
- `dailyEnergyMwh`
- `annualExpectedCapacityFactor`
- `status`
- `forcedOutageState`
- `maintenanceState`
- `districtId`

### Weather-driven fields
- `currentWindSpeedMps`
- `currentSolarIrradianceWm2`
- `cloudCoverPct`
- `temperatureC`

### Dispatchable plant fields
- `targetOutputPct`
- `minStableOutputPct`
- `rampRatePctPerMinute`
- `startupState`
- `startupDelayMinutes`
- `dispatchPriority`

### Emissions-related fields
- `co2IntensityKgPerMwh`
- `currentCo2KgPerHour`
- `totalCo2TodayKg`

## What We Can Use Immediately

Immediately useful implementation guidance from this research:
- wind is weather-driven and should use a power-curve style model,
- solar is irradiance-driven and should use daylight plus weather,
- mini nuclear should be mostly steady and high-availability,
- gas should be split into at least combined-cycle and peaker behavior,
- oil should be backup or emergency generation,
- annual capacity-factor calibration can start from EIA benchmarks.

## What Still Needs Follow-Up

This research is enough for early implementation planning, but deeper follow-ups would improve realism:
- decide whether gas/oil should be one user-facing category or explicitly split in the simulation,
- choose the exact first-pass solar and wind output equations for VC,
- define first-pass CO2 intensity assumptions for each generator class,
- decide whether mini nuclear should allow limited load following in the MVP or remain mostly steady,
- decide whether outages and maintenance should exist in MVP phase 1 or phase 2.

## Recommended Decision

Recommended decision for now:
- model wind and solar as weather-driven generators,
- model mini nuclear as a mostly-steady high-availability plant,
- split gas into combined-cycle and peaker internally,
- model oil as emergency or high-emissions backup,
- calibrate first-pass annual behavior against EIA capacity-factor benchmarks,
- use NREL resource and modeling guidance to shape weather-driven output logic.

## Sources

Primary sources used:
- EIA Electric Power Monthly, Table 6.07.A, Capacity Factors for Utility Scale Generators Primarily Using Fossil Fuels: https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=epmt_6_07_a
- EIA Electric Power Monthly, Table 6.07.B, Capacity Factors for Utility Scale Generators Primarily Using Non-Fossil Fuels: https://www.eia.gov/electricity/monthly/epm_table_grapher.php?kref=QOWNqTgorKXc&kuid=502f46f0-7dcf-4b4b-a3fd-04df098a0e31-1737572144&t=epmt_6_07_b
- EIA, Natural gas combined-cycle plant use varies by region and age: https://www.eia.gov/todayinenergy/detail.php?id=48036
- NREL ATB 2024, Utility-Scale PV: https://atb.nrel.gov/electricity/2024/utility-scale_pv
- NREL ATB 2024, Land-Based Wind: https://atb.nrel.gov/electricity/2024/2023/land-based_wind
- NREL PVWatts API: https://developer.nrel.gov/docs/solar/pvwatts/
- IAEA, Non-baseload Operation in Nuclear Power Plants: Load Following and Frequency Control Modes of Flexible Operation: https://www.iaea.org/publications/11104/non-baseload-operation-in-nuclear-power-plants-load-following-and-frequency-control-modes-of-flexible-operation

## Short conclusion

The strongest MVP approach is to model generation as a mix of distinct behavioral classes:
- weather-driven renewables,
- mostly-steady nuclear,
- dispatchable gas,
- rarely used oil backup.

That gives Cityverse a power system that can respond credibly to time, date, weather, and operational control, which is exactly what the rest of the simulation needs.
