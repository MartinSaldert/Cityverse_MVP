# Cityverse MVP, Weather System Plan

Date: 2026-04-17
Status: planning draft

## Purpose

This document defines the recommended plan for building a custom reactive weather system for Cityverse MVP.

The goal is not weather forecasts.
The goal is a live, simulation-driven weather system that:
- starts when the simulation starts,
- evolves over simulated time,
- reacts to user parameter changes,
- affects downstream city systems,
- remains believable enough for demo, energy, IoT, and digital twin use.

## What the Weather System Must Do

The weather system must support:
- simulation start with initial weather state
- continuous update over simulation time
- adjustable simulation speed, for example 1x, 10x, or faster
- season-aware behavior based on date
- colder nights than days
- winter-like January behavior and summer-like July behavior
- causal changes between pressure, cloud, wind, temperature, sunlight, and precipitation
- user overrides that nudge or force weather behavior
- downstream effects on:
  - solar farms
  - wind farms
  - building demand later
  - visuals in DT and Unity
  - telemetry emitted through IOT

## What the Weather System Does Not Need to Be

The weather system does not need to be:
- a full physical atmospheric simulation
- forecast-accurate
- globally realistic across the planet
- a 3D meteorology engine
- a substitute for professional weather modeling software

The weather system needs to be:
- coherent
- reactive
- tunable
- deterministic enough to test
- believable enough to feel alive

## Recommended Core Approach

Build a **custom causal weather simulation** inside VC.

This should be a **state-based weather model with dependency rules**, not a full fluid simulation.

### Why this is the right level
A full atmospheric simulation is too heavy for Cityverse MVP.
A static random weather system is too fake.
A causal state model is the useful middle path.

This means:
- variables influence each other
- changes unfold over time
- user inputs push the system rather than simply replacing reality forever
- the system produces trends and reactions rather than disconnected toggles

## Useful Shortcut From Existing Work

### Reference only: 2D Weather Sandbox
Useful ideas we can borrow:
- weather should evolve by timestep
- weather variables should interact, not just sit in a static preset
- cloud, rain, heating, and cooling are best treated as linked processes

What we should not borrow directly:
- full fluid-grid complexity
- low-level cell simulation
- rendering-driven design
- 2D atmosphere mechanics as the actual Cityverse backend

### Practical shortcut
Borrow the **conceptual dependency structure**, not the full simulator.

Meaning:
- use a compact city-scale weather state
- use tunable rules instead of grid fluid dynamics
- keep the model explainable and debuggable

## Recommended Weather Architecture

## Layer 1, world and calendar context
This layer provides:
- simulation time
- date
- month
- season
- hour of day
- daylight fraction
- sunrise and sunset
- simulation speed multiplier

This layer drives baseline tendencies such as:
- colder nights
- warmer afternoons
- winter vs summer temperature range
- shorter winter days
- longer summer days
- seasonal sunlight availability

## Layer 2, baseline environmental tendencies
This layer defines what conditions are seasonally normal.

Examples:
- January baseline temperature range is low
- July baseline temperature range is high
- winter sun intensity is lower
- winter storminess may be higher depending on chosen city profile
- summer convective instability may be higher later if desired

This layer acts like the climate tendency for the chosen city.

## Layer 3, live weather state
This is the actual evolving weather state.

Recommended variables:
- pressure
- temperature
- humidity
- cloud cover
- precipitation intensity
- wind speed
- wind direction
- solar radiation
- weather category
- stability index or storm tendency

Optional later variables:
- dew point
- snowfall flag or snow intensity
- fog
- ground wetness

## Layer 4, causal rule engine
This layer updates the live weather state based on:
- time progression
- seasonal baselines
- current weather values
- user changes
- optional randomness or noise

This is the real heart of the MVP weather system.

## Weather Variables and Causal Relationships

The model should include simple but believable causal relationships.

### Pressure
Pressure should influence:
- storm tendency
- cloud formation tendency
- wind tendency when changing sharply

Useful rule direction:
- lower pressure tends to worsen weather
- higher pressure tends to stabilize weather
- falling pressure raises chance of thicker cloud and precipitation
- rising pressure tends to improve conditions over time

### Cloud cover
Cloud cover should influence:
- solar radiation down
- daytime heating down
- nighttime cooling reduced slightly compared to clear-sky nights
- precipitation chance up when humidity and instability support it

Useful rule direction:
- more cloud means less sunlight
- less sunlight reduces solar farm output
- more cloud during day usually cools the city

### Temperature
Temperature should be influenced by:
- season
- time of day
- cloud cover
- wind chill tendency
- precipitation cooling
- recent sunlight exposure

Useful rule direction:
- daytime warms, especially with strong sunlight
- night cools, especially with clear skies
- clouds reduce daytime warming
- wind can push temperature toward ambient equilibrium faster
- precipitation often cools the air somewhat

### Sunlight / solar radiation
Solar radiation should be influenced by:
- time of day
- season
- cloud cover
- possibly haze later

Useful rule direction:
- no sunlight at night
- winter sunlight lower than summer
- cloud cover reduces available solar energy
- solar farm production should read from this value, not from time alone

### Wind
Wind should influence:
- wind farm output
- cooling tendency or effective temperature
- cloud movement tendency later
- storm roughness perception in DT

Wind should be influenced by:
- pressure tendency
- storm tendency
- weather regime

Useful rule direction:
- stronger pressure changes can increase wind tendency
- storm conditions can increase wind
- higher wind can cool the environment modestly

### Humidity
Humidity should influence:
- cloud formation tendency
- precipitation probability
- persistence of cloudy or rainy conditions

Useful rule direction:
- high humidity plus cooling plus low pressure can grow cloud/rain
- dry air resists cloud and precipitation formation

### Precipitation
Precipitation should depend on:
- cloud cover
- humidity
- pressure and storm tendency
- temperature if snow is later added

Useful rule direction:
- not every cloudy condition should produce rain
- rain should emerge from a threshold combination of supportive factors

## User Interaction Model

The user should be able to change parameters while the simulation runs.

Recommended interaction modes:

### Mode A, nudge
User changes a variable and the system responds causally.

Examples:
- reduce pressure by 8 hPa
- increase cloud cover target
- increase wind target

The system then evolves from there rather than instantly freezing in a fake preset.

### Mode B, force
User forces a condition directly.

Examples:
- set weather to storm
- set cloud cover to 90%
- set rain to heavy

Useful for demos and testing.

### Mode C, scenario preset
User applies a named scenario.

Examples:
- cold clear winter day
- overcast windy autumn storm
- hot summer afternoon

## Recommended Simulation Mechanics

Use a fixed update timestep inside VC.

Each weather tick should:
1. read simulation clock and date
2. compute seasonal baseline targets
3. compute daylight and solar target
4. apply user overrides or nudges
5. update pressure trend
6. update cloud tendency
7. update humidity tendency
8. update wind tendency
9. update precipitation tendency
10. update temperature from all active influences
11. derive weather category
12. publish updated state and telemetry as needed

## Time Speed Support

The weather system must support simulation speed multipliers.

Recommended approach:
- weather logic runs on fixed logical ticks
- simulation speed changes how much simulated time advances per real second
- model smoothing and rate limits prevent absurd instant jumps

Examples:
- 1x shows natural progression
- 10x lets users observe weather changes faster
- 100x may be useful for testing but may require stronger damping or coarser rules

## MVP Simplification Strategy

To keep this buildable, we should simplify aggressively but intelligently.

### Use one city-wide weather state first
Do not begin with district microclimates.

### Use scalar variables, not spatial weather grids
A single city weather state is enough for MVP.

### Use trend-based rules, not physical equations everywhere
The point is causal believability, not atmospheric PhD cosplay.

### Start with rain only
Snow, fog, and ice can come later if needed.

### Keep pressure semi-abstract
Pressure should be realistic enough to drive other variables, but does not need to be modeled as a full fluid field.

## Downstream Integration Requirements

The weather system must output values usable by other systems.

### For solar farms
- solar radiation
- daylight flag
- cloud cover

### For wind farms
- wind speed
- optional gust factor later

### For buildings later
- outdoor temperature
- sunlight level
- wind level
- precipitation flag

### For DT and Unity
- weather category
- cloud level
- rain level
- wind level
- daylight state
- current temperature

### For IOT telemetry
- weather station telemetry stream
- aggregate environmental state
- change events for major transitions if useful

## Recommended Development Phases

### Phase W0, planning and model definition
Deliver:
- variable list
- dependency rules
- update-loop definition
- test scenarios

### Phase W1, baseline runtime model
Deliver:
- weather state object
- simulation tick integration
- date/season integration
- day/night and sunlight logic
- temperature baseline behavior

### Phase W2, causal relationships
Deliver:
- pressure effects
- cloud effects
- wind effects
- precipitation effects
- humidity support

### Phase W3, user controls and scenarios
Deliver:
- parameter nudges
- force controls
- preset scenarios
- simulation speed behavior verification

### Phase W4, downstream integration
Deliver:
- solar farm integration
- wind farm integration
- telemetry output
- DT-facing weather state bundle

## Acceptance Criteria for the First Useful Weather MVP

The first useful weather MVP is done when:
- weather begins in a valid state on simulation start
- time/date/season affect weather tendencies
- night is colder than day in believable ways
- winter behaves colder and darker than summer
- cloud increases reduce sunlight and daytime temperature tendency
- pressure changes can worsen or improve weather over time
- wind affects wind farm output and cooling tendency
- solar farms react to sunlight and cloud cover
- simulation speed changes weather progression speed without chaos
- user changes produce causal responses rather than disconnected toggles

## Recommended Next Step

After this plan, the next document should define the exact model in implementation-facing form:
- state fields
- update equations or rules
- override precedence
- config values
- test scenarios

That should become the weather system specification.

## Short conclusion

We should build a custom weather system.
Not because reinvention is noble, but because this project needs a very particular kind of reactive, controllable, simulation-facing weather that existing tools do not cleanly provide.

The shortcut is to build a compact causal model rather than a full atmospheric simulator. That is the civilized compromise.
