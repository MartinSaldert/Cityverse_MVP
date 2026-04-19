# Cityverse MVP, Building Roster

Date: 2026-04-19
Status: recommended first demo roster

## Purpose

This document defines the recommended first building roster for the Cityverse MVP demo.
The goal is to make the city feel believable without creating an entire simulation burden before the core slice has earned that privilege.

## Design goals

The MVP building set should:
- feel like a small but real district
- show different demand behavior by time of day
- show different demand behavior by building type
- be simple enough to simulate with explicit rules
- give Unity enough variety to look intentional rather than accidental

## Recommended core roster

### 1. Villa A
Type:
- detached residential house

Role in demo:
- represents household demand with morning and evening peaks

Behavior notes:
- lower daytime occupancy on weekdays
- stronger evening load
- moderate weather sensitivity

### 2. Villa B
Type:
- detached residential house

Role in demo:
- provides a second residential unit so the city does not look like a single-example science fair board

Behavior notes:
- similar profile to Villa A, but allow slight random variation

### 3. Apartment Building
Type:
- multi-family residential

Role in demo:
- provides steadier residential demand than villas
- useful counterweight to office and retail patterns

Behavior notes:
- always partially occupied
- morning and evening peaks
- more stable overnight base load

### 4. Office Building
Type:
- commercial office

Role in demo:
- provides strong weekday daytime demand
- clearly contrasts with residential patterns

Behavior notes:
- occupancy ramps in morning
- strongest load during workday
- reduced load at night

### 5. Retail Building
Type:
- shop, café, or convenience retail

Role in demo:
- adds a different daytime commercial pattern than office
- makes the city feel more like a lived place

Behavior notes:
- opens later than office
- midday and late-afternoon activity
- lighting and climate load matter visibly

### 6. School or Municipal Building
Type:
- school, library, or civic office

Role in demo:
- gives the district civic credibility
- helps explain why the city has structured daytime demand outside purely commercial logic

Behavior notes:
- strong weekday daytime pattern
- low night usage
- modest weather sensitivity

### 7. Utility Node or Substation
Type:
- infrastructure support building or fenced service node

Role in demo:
- visual anchor for the energy story
- helps the city feel like it has infrastructure and not merely buildings placed by optimism

Behavior notes:
- low direct demand importance in MVP
- mainly a scene and narrative support element

## Recommended non-building energy assets

These are not ordinary buildings, but they should be present in the demo slice.

### Solar Farm
Role:
- visible renewable output source
- clearly weather and daylight dependent

### Wind Asset or Small Wind Farm
Role:
- visible second renewable source
- contrasts with solar behavior

### Gas Generator or Backup Plant
Role:
- dispatchable generation source for later phases
- useful future hook for emissions and control demos

## Minimum believable subset

If the first pass must stay very lean, keep:
- Villa A
- Villa B
- Apartment Building
- Office Building
- Retail Building
- School or Municipal Building

Plus:
- Solar Farm
- one utility node

That is enough for a credible small district.

## Why this roster works

This combination gives you:
- residential load
- commercial load
- civic load
- infrastructure presence
- weather-sensitive generation
- day versus night differences
- weekday pattern variety

It is small enough to reason about and rich enough to demo.

## Suggested first simulation grouping

### Residential cluster
- Villa A
- Villa B
- Apartment Building

### Commercial cluster
- Office Building
- Retail Building

### Civic cluster
- School or Municipal Building

### Infrastructure edge
- Utility node
- Solar farm
- wind asset
- future generator location

## Suggested first demand behavior model

For the first explicit building-driven demand model, use per-building rules based on:
- building type
- occupancy schedule class
- weather sensitivity
- day/night multiplier
- weekday/weekend multiplier later

### Simple schedule classes
- residential
- office
- retail
- civic
- infrastructure

### Initial weather effects
- cold weather increases residential and civic demand
- hot weather increases office and retail cooling demand
- daylight and cloud affect solar generation
- wind speed affects wind generation

## Demo storytelling value

This roster supports a convincing demo narrative:
- homes wake up and consume more in the morning and evening
- office and civic buildings dominate daytime
- retail has its own business-hour pattern
- renewable output changes with weather and daylight
- total city balance becomes easy to explain visually

## Recommended next implementation step

After the current aggregate-only model, the next simulation upgrade should be:
1. define this roster in data
2. assign each building a simple schedule class
3. compute per-building demand
4. aggregate into city demand
5. expose building-level and city-level summaries

## Short conclusion

The recommended MVP city should be a small district, not a whole metropolis.
That gives enough realism to feel convincing while preserving the only finite resource software projects ever truly have, namely patience.
