# Cityverse MVP, Research 02: Building Electricity Usage Statistics

Date: 2026-04-16
Task reference: `TASKS.md` item 2, Investigate realistic building electricity usage statistics

## Purpose

This document investigates realistic electricity usage patterns and related building metadata for the main building types currently planned for Cityverse MVP:
- villa / detached house,
- apartment building,
- office building,
- shopping mall / retail,
- datacenter.

The goal is not merely to collect a few average numbers. The goal is to identify:
- credible benchmark sources,
- annual usage patterns,
- time-of-day and seasonal behavior,
- the most important metadata fields,
- which values should be simulated directly,
- which values should be derived from floor area, occupancy, weather, equipment, and schedule.

## Important Scope Note

Most of the strongest official benchmark data I found is U.S.-based, mainly from:
- EIA,
- DOE,
- DOE-linked national lab publications,
- EPA ENERGY STAR.

That makes this a strong starting point for system design and data model design, but not necessarily the final regional calibration for a future Swedish or European deployment.

Inference:
The right MVP move is to use these sources to define the initial simulation model and later recalibrate by geography if the target city becomes region-specific.

## Executive Summary

The clearest findings are:

1. **Detached homes and apartments should not share the same base electricity model.**
   EIA states the average U.S. household uses about 10,500 kWh/year, but apartment electricity and total site energy are materially lower than single-family detached homes, especially because apartment space heating and cooling loads are lower.

2. **Office and retail loads are best handled using intensity plus schedule models.**
   EIA CBECS provides electricity intensity data in kWh per square foot and end-use breakdowns that are useful for first-pass simulation.

3. **Shopping malls and strip centers behave differently from general retail stores.**
   EIA data shows significantly higher mall/strip-mall intensity than retail stores outside malls.

4. **Datacenters are a special case and should be modeled separately from normal commercial buildings.**
   DOE states datacenters consume 10 to 50 times the energy per floor area of a typical office. They also run 24/7 and carry large cooling loads.

5. **The most important modeling pattern is not one fixed yearly kWh number.**
   The more realistic pattern is:
   - building archetype,
   - floor area,
   - occupancy schedule,
   - climate / weather,
   - HVAC and heating type,
   - plug/process load,
   - local battery or local generation,
   - operating hours.

6. **DOE prototype models are highly valuable for implementation.**
   They include archetypes, internal loads, schedules, and climate variations, which makes them useful not just for benchmarking but for actually shaping Cityverse simulation logic.

## Core Source Findings

## 1. Detached houses / villas

### Official benchmark findings

EIA says the average U.S. household consumes about **10,500 kWh of electricity per year**. EIA also separately states that in 2022 the average amount of electricity sold to a U.S. residential electric-utility customer was **10,791 kWh**, about **899 kWh/month**.

EIA also states that electricity use varies widely by home type and region, and that:
- apartments in the Northeast consume the least electricity,
- single-family detached homes in the South consume the most.

For residential electricity end uses in 2020, EIA says the three largest categories were:
- air conditioning: **19%**,
- space heating: **12%**,
- water heating: **12%**.

### What this means for Cityverse

Detached houses should not be modeled as flat all-day consumers.

They need at least:
- morning activity rise,
- daytime reduction when occupants are away,
- evening peak,
- seasonal cooling and heating sensitivity,
- appliance and water-heating background load,
- possible EV charging later,
- optional house battery and rooftop solar later.

### Recommended modeling approach for villas

Use a detached-house archetype driven by:
- floor area,
- household size,
- heating system type,
- climate/weather,
- occupancy schedule,
- appliance level,
- efficiency / insulation quality,
- battery / solar presence.

### Provisional implementation note

Inference from the sources:
A detached house baseline can reasonably start near the U.S. household average and then be adjusted upward or downward using building size, climate, and electrification assumptions. The stronger move is to derive annual demand from parameters than to hardcode one number for all villas.

## 2. Apartments and apartment buildings

### Official benchmark findings

EIA states that space heating and air conditioning account for a much smaller share of household energy use in apartments than in detached single-family homes.

EIA also states that in 2020 the average household living in a single-family detached home consumed **nearly three times more total site energy** than a household in an apartment building with five or more apartments.

EIA further notes that apartments in larger buildings tend to use much less energy than other home types and that this is partly explained by:
- smaller living space,
- fewer exposed exterior surfaces,
- partial insulation from adjacent units and common areas.

DOE Building Energy Codes prototype models explicitly include:
- single-family detached houses,
- multi-family low-rise apartment buildings,
- commercial prototype sets that include mid-rise apartment and high-rise apartment archetypes.

### What this means for Cityverse

Apartment buildings should not be treated as “many villas stacked together.”

They need at least two load layers:
1. **unit loads**, such as occupant devices, cooking, domestic hot water related electricity where relevant, lighting, and in-unit HVAC if applicable,
2. **building common loads**, such as corridor lighting, elevators, ventilation, shared pumps, central systems, and shared services.

### Recommended modeling approach for apartments

At minimum, the apartment model should include:
- number of units,
- unit mix if relevant,
- occupied unit count,
- residents per unit,
- common-area floor area,
- central vs in-unit HVAC,
- ventilation intensity,
- elevator presence,
- laundry model,
- battery and solar if later supported.

### Provisional implementation note

Inference from the sources:
Apartment energy should generally be flatter and less weather-exposed per dwelling than detached houses, but common-area systems can create a baseline load that detached houses usually do not have.

## 3. Office buildings

### Official benchmark findings

EIA’s 2012 CBECS electricity intensity table shows the following for office buildings:
- **Office:** **15.9 kWh per square foot**
- **All commercial buildings:** **14.6 kWh per square foot**

EIA’s 2018 office building report says:
- office buildings used **1,093 TBtu** of energy in 2018,
- electricity was the most-used fuel at **775 TBtu**,
- office mean total energy intensity was **65.6 MBtu per square foot**.

The same office report says the largest end-use shares in office buildings were:
- space heating: **30%**,
- ventilation: **20%**,
- other: **17%**,
- lighting: **12%**.

EIA also notes office buildings accounted for large shares of:
- ventilation consumption,
- office equipment consumption,
- computing consumption.

The report also says:
- the average office building was **17,200 square feet**,
- 53% of office buildings were between **1,000 and 5,000 square feet**,
- 56% had only one floor.

DOE prototype building models include:
- small office,
- medium office,
- large office,
with downloadable EnergyPlus models and a scorecard that summarizes internal loads, schedules, and key modeling assumptions.

### What this means for Cityverse

Office buildings need strong schedule dependence.

Expected pattern:
- low overnight base load,
- rising occupancy and plug load in morning,
- daytime plateau,
- drop after work hours,
- lower weekend load,
- possible after-hours cleaning/security baseline.

Weather should affect:
- ventilation,
- cooling,
- some heating-related electric loads depending on HVAC strategy.

### Recommended modeling approach for offices

Use office electricity as a combination of:
- base building systems load,
- occupancy-driven plug load,
- lighting schedule,
- ventilation schedule,
- weather-driven HVAC load,
- optional server room / embedded data center load.

Important metadata fields:
- floor area,
- office subtype,
- worker count,
- operating hours,
- weekday vs weekend behavior,
- HVAC system type,
- ventilation intensity,
- percentage of computing-heavy space,
- presence of server room or embedded data center.

## 4. Shopping malls and retail buildings

### Official benchmark findings

EIA’s 2012 CBECS electricity intensity table shows:
- **Mercantile overall:** **18.3 kWh per square foot**
- **Retail (other than mall):** **15.2 kWh per square foot**
- **Enclosed and strip malls:** **21.1 kWh per square foot**

EIA’s 2018 mercantile building report says:
- mercantile buildings used **953 TBtu** of energy in 2018,
- electricity was the most-used fuel at **616 TBtu**,
- average total energy intensity was **88.4 MBtu per square foot**,
- enclosed malls and strip shopping centers consumed **111.0 MBtu per square foot**,
- retail outside malls consumed **64.1 MBtu per square foot**.

The same EIA report says:
- space heating was the largest end-use share for both enclosed/strip malls (**25%**) and retail other than mall (**24%**),
- enclosed malls and strip centers had a larger cooking share (**13%**),
- retail other than mall had larger ventilation share (**18%**).

The report also says:
- average mercantile building size was **20,900 square feet**,
- average retail store was **15,200 square feet**,
- average strip shopping center was **29,600 square feet**,
- average enclosed mall was **727,800 square feet**.

### What this means for Cityverse

Retail and mall loads should not be lumped together.

At minimum, Cityverse should distinguish between:
- stand-alone retail,
- strip mall / shopping center,
- enclosed mall.

These differ in:
- operating hours,
- lighting load,
- common-area HVAC load,
- food court / cooking contribution,
- ventilation burden,
- weekend behavior,
- tenant count.

### Recommended modeling approach for retail and malls

Use a tenant-plus-common-area structure:
- tenant electricity load,
- common corridor / mall-area lighting,
- escalators and elevators if relevant,
- ventilation / HVAC,
- signage and display lighting,
- food-service contribution if included.

Expected load shape:
- low overnight baseline,
- pre-opening rise,
- broad daytime plateau,
- possible weekend peaks,
- seasonal HVAC impact,
- higher evening lighting burden in darker months.

## 5. Datacenters

### Official benchmark findings

DOE states datacenters are among the most energy-intensive building types and consume **10 to 50 times the energy per floor area of a typical commercial office building**.

DOE also states datacenters collectively account for about **2% of total U.S. electricity use**.

Berkeley Lab’s 2016 U.S. Data Center Energy Usage Report estimates that in 2014 U.S. datacenters consumed about **70 billion kWh**, representing about **1.8% of total U.S. electricity consumption**.

EIA says office buildings with datacenters have significantly higher electricity intensity than those without. Specifically:
- computing electricity intensity is higher in buildings with datacenters,
- cooling electricity intensity is much higher,
- total electricity intensity is **87%**, **60%**, and **20%** higher than comparable offices without datacenters across the small, medium, and large size bands EIA compared.

EIA also notes that datacenters:
- operate continuously, day and night,
- are typically kept very cool,
- may require dedicated UPS systems.

### What this means for Cityverse

Datacenters must be modeled as a separate class, not as a heavy office.

The biggest differences are:
- essentially 24/7 utilization,
- large IT load,
- large cooling and power-conditioning overhead,
- small occupant count but high infrastructure significance,
- strong monitoring needs.

### Recommended modeling approach for datacenters

At minimum, datacenter simulation should include:
- IT load,
- cooling load,
- UPS and power-distribution losses,
- redundancy mode if later needed,
- PUE-like overhead factor,
- outside temperature sensitivity for cooling efficiency,
- generator / backup behavior later.

A first-pass datacenter model can be:
- IT load as the core constant or slowly varying load,
- total demand = IT load × infrastructure overhead factor,
- cooling sensitivity tied partly to outside air temperature,
- optional efficiency class controlling overhead.

### Provisional implementation note

Inference from the sources:
For MVP, a datacenter should probably be modeled as a largely flat 24/7 load with modest weather sensitivity through cooling efficiency, rather than with strong occupant-driven daily cycles.

## DOE Prototype Models as Implementation Assets

One of the most useful findings is that DOE and DOE-linked prototype model resources are not just background reading. They are implementation assets.

The DOE Building Energy Codes prototype pages say:
- commercial prototype models cover office, stand-alone retail, strip mall, mid-rise apartment, and high-rise apartment,
- residential prototype models include single-family detached and multi-family low-rise apartment,
- downloadable packages include EnergyPlus models,
- the scorecard summarizes building descriptions, thermal zone internal loads, schedules, and other key modeling inputs.

This matters because Cityverse needs:
- believable building archetypes,
- realistic schedules,
- occupancy assumptions,
- internal loads,
- climate sensitivity.

Inference:
DOE prototype models are probably the single most useful practical source for first-pass schedule and archetype design in VC.

## Recommended Cityverse Building Usage Strategy

## 1. Use parameterized archetypes, not single magic numbers

Each building type should be defined by:
- archetype,
- floor area,
- occupancy,
- operating hours,
- HVAC type,
- heating / cooling exposure,
- plug/process load intensity,
- efficiency class,
- climate sensitivity.

## 2. Separate annual energy from hourly shape

For each building, model:
- annual or monthly energy target,
- daily shape profile,
- weekday/weekend modifier,
- seasonal modifier,
- weather modifier,
- anomaly modifier.

This creates far more believable telemetry than choosing one static kWh value.

## 3. Use intensity units where possible

Recommended core metrics:
- kWh/year,
- kWh/m2/year,
- current kW demand,
- kW/m2,
- kWh per occupant where useful,
- load factor,
- peak-to-baseload ratio.

## 4. Distinguish occupancy-driven and infrastructure-driven loads

Examples:
- villas: mostly occupancy-driven plus weather-driven HVAC,
- apartments: unit loads plus common-area loads,
- offices: occupancy-driven plus ventilation/HVAC/system loads,
- malls: tenant loads plus common-area loads,
- datacenters: infrastructure-driven with low occupancy impact.

## Recommended Metadata Fields from This Research

Based on the sources, the following fields are especially important:

### Common to all buildings
- `buildingType`
- `grossFloorAreaM2`
- `floorCount`
- `occupancyType`
- `operatingScheduleProfile`
- `climateRegion`
- `heatingSystemType`
- `coolingSystemType`
- `ventilationProfile`
- `baselineLoadKw`
- `peakLoadKw`
- `annualElectricityTargetKwh`
- `dailyLoadProfileId`
- `seasonalAdjustmentProfileId`
- `weatherSensitivityProfileId`

### Residential-specific
- `residentCount`
- `dwellingCount`
- `unitAverageFloorAreaM2`
- `electricHeatingShare`
- `airConditioningPresence`
- `waterHeatingType`
- `applianceLevel`
- `hasBattery`
- `batteryCapacityKwh`

### Office-specific
- `workerCount`
- `deskDensity`
- `computerDensity`
- `serverRoomPresence`
- `weekdayHours`
- `weekendHours`

### Retail-specific
- `tenantCount`
- `customerTrafficProfile`
- `displayLightingIntensity`
- `foodServicePresence`
- `signageLoadFactor`
- `commonAreaShare`

### Datacenter-specific
- `itLoadKw`
- `coolingOverheadFactor`
- `upsLossFactor`
- `redundancyClass`
- `pueTarget`
- `rackDensityKw`

## Recommended First-Pass Archetype Shapes

The following are implementation recommendations derived from the source findings.

### Villa / detached house
Inference:
- low overnight baseload,
- morning rise,
- daytime dip,
- evening peak,
- strong weather effect,
- optional EV or battery spike later.

### Apartment building
Inference:
- flatter unit-level total than detached house,
- lower weather exposure per unit,
- stronger common-area base load,
- morning and evening residential activity still visible,
- less dramatic midday dip than detached homes.

### Office
Inference:
- low night load but not zero,
- sharp morning ramp,
- broad daytime plateau,
- evening drop,
- much lower weekend occupancy load,
- ventilation and HVAC weather dependence.

### Shopping mall / strip center
Inference:
- early morning prep load,
- high open-hours plateau,
- weekend strength,
- stronger common-area lighting,
- HVAC and ventilation significant,
- food court or cooking zones if included.

### Datacenter
Inference:
- flat 24/7 IT core load,
- cooling overhead layered on top,
- weak occupancy relationship,
- mild weather effect through cooling,
- high importance of power-quality and backup systems later.

## What We Can Use Immediately in Implementation

Immediately useful implementation material from this research:
- detached-home electricity baseline anchored to EIA residential averages,
- apartment model designed as lower per-dwelling use plus common-area load,
- office electricity intensity around **15.9 kWh/ft2** from CBECS 2012,
- mercantile intensity around **18.3 kWh/ft2** overall,
- retail-other-than-mall around **15.2 kWh/ft2**,
- enclosed/strip mall around **21.1 kWh/ft2**,
- datacenter modeled as a special high-intensity 24/7 class using DOE and LBNL guidance.

## What Still Needs Follow-Up

This research is enough to begin implementation planning, but a few deeper follow-ups would improve realism:
- extract more detailed RECS electricity values by housing type and climate from tabular or microdata sources,
- extract DOE prototype scorecard schedule data for direct use in VC archetypes,
- decide whether Cityverse should start in U.S.-style calibration or a Europe/Sweden-style calibration,
- decide whether apartment modeling will be at unit level, building level, or both,
- decide whether mall and strip-center common-area systems are modeled explicitly in the MVP,
- decide whether datacenter loads are entered as IT load plus PUE or as total facility demand directly.

## Recommended Decision

Recommended decision for now:
- use official EIA and DOE data as the initial calibration backbone,
- use DOE prototype models for schedules and archetype structure,
- model detached homes, apartments, offices, malls/retail, and datacenters as separate electricity classes,
- keep annual kWh targets parameterized by area, occupancy, climate, and schedule instead of hardcoding one number per type.

## Sources

Primary sources used:
- EIA FAQ, average household electricity use: https://www.eia.gov/tools/faqs/faq.php?id=97&t=1
- EIA, Electricity use in homes: https://www.eia.gov/energyexplained/use-of-energy/electricity-use-in-homes.php
- EIA, Use of energy in homes: https://www.eia.gov/energyexplained/use-of-energy/homes.php
- EIA RECS 2020 data portal: https://www.eia.gov/consumption/residential/data/2020/
- EIA CBECS Office building report: https://www.eia.gov/consumption/commercial/pba/office.php
- EIA CBECS Mercantile building report: https://www.eia.gov/consumption/commercial/pba/mercantile.php
- EIA CBECS 2012 Table C14 electricity intensities: https://www.eia.gov/consumption/commercial/data/2012/c%26e/cfm/c14.php
- DOE Building Energy Codes prototype building models: https://www.energycodes.gov/prototype-building-models
- DOE Commercial Reference Buildings overview: https://www.energy.gov/eere/buildings/commercial-reference-buildings
- DOE, Data Centers and Servers: https://www.energy.gov/cmei/buildings/data-centers-and-servers
- Berkeley Lab, United States Data Center Energy Usage Report: https://seta.lbl.gov/publications/united-states-data-center-energy
- EIA, Office buildings with data centers use significantly more electricity than other offices: https://www.eia.gov/todayinenergy/detail.php?id=28232
- ENERGY STAR, What is Energy Use Intensity (EUI)?: https://www.energystar.gov/buildings/benchmark/understand-metrics/what-eui
- ENERGY STAR, Data Centers for Utilities: https://www.energystar.gov/products/data_centers/utilities

## Short conclusion

The strongest implementation path is to build Cityverse electricity simulation around parameterized archetypes backed by EIA and DOE data.

The key split is:
- detached residential,
- apartment residential,
- office,
- retail / mall,
- datacenter.

These should not share one generic kWh model. Their load shapes, weather sensitivity, occupancy dependence, and monitoring needs are materially different.
