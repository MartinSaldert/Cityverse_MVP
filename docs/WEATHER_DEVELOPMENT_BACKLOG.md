# Cityverse MVP, Weather Development Backlog

Date: 2026-04-17
Status: execution backlog draft

## Purpose

This backlog turns the weather plan and specification into concrete development tasks.

## Milestone W0, Model Definition and Decisions

### W0-01, Confirm weather design principles
**Deliver**
- one city-wide weather model for MVP
- causal state model approach
- no full fluid-grid simulation in MVP
- reactive user controls

**Acceptance criteria**
- decisions documented and accepted as project direction

### W0-02, Define canonical weather state types
**Deliver**
- TypeScript weather state interface
- seasonal enums
- weather category enums
- override command DTOs

**Acceptance criteria**
- weather state types compile and are shared cleanly inside VC

### W0-03, Define weather config schema
**Deliver**
- city location config
- baseline seasonal ranges
- response rates
- thresholds
- scenario preset schema

**Acceptance criteria**
- config can be loaded and validated

## Milestone W1, Calendar and Baseline Weather Runtime

### W1-01, Implement simulation calendar integration
**Deliver**
- date/time input from simulation clock
- month and season derivation
- local hour derivation
- simulation speed compatibility

**Acceptance criteria**
- weather system reads simulation time correctly at all supported speeds

### W1-02, Implement daylight and solar baseline model
**Deliver**
- sunrise calculation or lookup
- sunset calculation or lookup
- daylight factor
- clear-sky solar availability curve

**Acceptance criteria**
- daylight varies correctly by time and season
- solar value is zero at night

### W1-03, Implement baseline seasonal temperature model
**Deliver**
- seasonal min/max temperature curves
- hourly baseline target temperature
- winter/summer differentiation

**Acceptance criteria**
- January baseline is colder than July baseline
- nights trend colder than days

### W1-04, Implement initial weather state bootstrap
**Deliver**
- initial state generation on sim start
- valid default weather state
- startup weather category derivation

**Acceptance criteria**
- simulation can start with a coherent weather state without manual input

## Milestone W2, Reactive Variable Dynamics

### W2-01, Implement pressure state and trend model
**Deliver**
- pressure value
- pressure trend
- user pressure nudge support

**Acceptance criteria**
- pressure can evolve and be adjusted during simulation

### W2-02, Implement humidity model
**Deliver**
- humidity state
- seasonal humidity tendency
- user humidity adjustment support

**Acceptance criteria**
- humidity affects later cloud and rain logic

### W2-03, Implement cloud model
**Deliver**
- cloud cover state
- cloud target logic from humidity, pressure, and storminess
- user cloud adjustment support

**Acceptance criteria**
- increased clouds reduce solar output and daytime heating tendency

### W2-04, Implement wind model
**Deliver**
- wind speed state
- wind direction state or placeholder
- wind target logic from pressure trend and storminess
- user wind adjustment support

**Acceptance criteria**
- stronger wind increases wind-related outputs and cooling tendency

### W2-05, Implement precipitation model
**Deliver**
- precipitation intensity state
- threshold-based rain formation logic
- user rain forcing support if desired

**Acceptance criteria**
- rain occurs only under supportive conditions

### W2-06, Implement temperature response model
**Deliver**
- temperature update logic from season, solar, cloud, wind, and rain
- feels-like temperature calculation

**Acceptance criteria**
- cloud increase lowers daytime warming
- wind and night cooling affect temperature believably

### W2-07, Implement weather category derivation
**Deliver**
- clear
- partly cloudy
- cloudy
- rain
- storm

**Acceptance criteria**
- category updates reflect actual state values

## Milestone W3, Overrides, Scenarios, and Controls

### W3-01, Implement weather override system
**Deliver**
- nudge commands
- force commands
- clear override support

**Acceptance criteria**
- users can change weather variables live

### W3-02, Implement scenario preset system
**Deliver**
- clear winter morning preset
- cloudy windy autumn preset
- storm preset
- warm summer preset

**Acceptance criteria**
- preset application updates targets coherently

### W3-03, Implement override precedence rules
**Deliver**
- documented priority order
- predictable blending behavior

**Acceptance criteria**
- forced settings override baseline cleanly
- nudges do not create impossible command ambiguity

### W3-04, Verify simulation speed behavior
**Deliver**
- 1x support
- 10x support
- high-speed smoothing safeguards

**Acceptance criteria**
- weather changes speed up without collapsing into nonsense

## Milestone W4, Downstream Integration

### W4-01, Integrate solar farm weather inputs
**Deliver**
- solar radiation output binding
- daylight binding
- cloud attenuation effect

**Acceptance criteria**
- solar farm output visibly drops under cloud and at night

### W4-02, Integrate wind farm weather inputs
**Deliver**
- wind speed output binding

**Acceptance criteria**
- wind farm output reacts to wind changes

### W4-03, Implement weather telemetry publishing
**Deliver**
- weather telemetry DTO mapping
- publish schedule
- weather change event hooks if useful

**Acceptance criteria**
- IOT can ingest live weather data from VC

### W4-04, Implement DT-facing weather bundle
**Deliver**
- current weather summary payload
- values for cloud, rain, wind, sunlight, and day/night

**Acceptance criteria**
- DT and Unity can render weather state from VC/IOT outputs

## Milestone W5, Validation and Tuning

### W5-01, Create deterministic weather test scenarios
**Deliver**
- test inputs for date, time, and variable changes
- expected outcomes or ranges

### W5-02, Tune response rates and thresholds
**Deliver**
- balanced variable response curves
- reduced instability and unrealistic oscillation

### W5-03, Validate causal demo flows
**Deliver**
- pressure down worsens weather over time
- cloud up lowers sunlight and temperature tendency
- wind up affects wind output and cooling
- winter dates produce colder baselines
- night produces lower temperatures

**Acceptance criteria for milestone**
- demo behavior feels coherent to a human observer

## Recommended Build Order

Start in this order:
1. W0-02
2. W0-03
3. W1-01
4. W1-02
5. W1-03
6. W1-04
7. W2-01 through W2-07
8. W3-01 through W3-04
9. W4-01 through W4-04
10. W5-01 through W5-03

## Key Design Rule

Do not implement weather as disconnected sliders with no causal links.
If pressure, cloud, wind, and temperature do not influence one another, then we have built a control panel, not a weather system.

## Short conclusion

This backlog should be enough to take the weather system from idea to implementation in a disciplined way.
The next sensible step after this is either scaffolding the VC weather module or selecting the exact formulas and response rules for the first pass.
