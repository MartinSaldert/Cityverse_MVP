# Cityverse MVP, Claude Packet: Oil Backup Generator, Weather-Tied Renewables, and First CO2 Model

Date: 2026-04-20
Owner: The Sage
Target implementer: Claude
Status: ready for delegation

## Purpose

Implement the next major simulation step for Cityverse MVP:
- add a dirty fallback generator
- make the energy mix more explicit
- add the first real CO2 model
- preserve and strengthen the weather-driven logic for renewables and building demand

This packet is meant to produce a more believable city energy story:
- wind and solar rise and fall with weather
- homes and buildings demand more electricity when cold or hot
- when renewables are insufficient, a fossil backup source comes online
- CO2 spikes when that dirty fallback is active

That gives the simulation real tension and makes the dashboard data more meaningful.

## Product direction

Martin explicitly wants:
- a coal or oil-like dirty generator so CO2 can spike when sun and wind are low
- weather-sensitive renewables
- houses using more electricity when the weather is cold

The research already supports this direction strongly.
The implementation should now make it visible in the product.

## Strong recommendation for MVP

Use an **oil backup generator** first.

Why:
- simpler and more dramatic than coal for the MVP
- easy to explain in demos
- easier to model as an emergency or deficit-filling generator
- aligns with earlier generation research

Do **not** build coal first unless there is a compelling product reason.

## Current implementation reality

### Already true in code
- solar output is already tied to weather through `solarRadiationWm2`
- wind output is already tied to weather through `windSpeedMps`
- building demand already reacts to weather, especially residential demand in cold weather
- city demand is now building-driven

### Relevant current files
- `apps/cityverse-vc/src/energy/service.ts`
- `apps/cityverse-vc/src/city/service.ts`
- `apps/cityverse-vc/src/buildings/service.ts`
- `apps/cityverse-vc/src/ui.ts`
- `apps/cityverse-vc/src/energy/routes.ts`
- `packages/contracts/src/index.ts`
- `packages/contracts/src/city/summary.ts`
- `packages/contracts/src/energy/summary.ts`
- `tests/smoke.test.mjs`

### Relevant research docs
- `docs/RESEARCH_01_WEATHER_SIMULATION.md`
- `docs/RESEARCH_02_BUILDING_ELECTRICITY_USAGE.md`
- `docs/RESEARCH_03_ELECTRICITY_GENERATION_MODELS.md`

## Scope

### In scope
- add an explicit oil backup generator model in VC
- extend energy summary beyond only solar + wind + total renewable
- keep renewables weather-driven
- preserve or improve building weather sensitivity
- compute a first real CO2/emissions summary based on active generation mix
- update city balance logic to use total generation, not only renewables
- update UI to make the dirty fallback and CO2 visible
- update tests
- keep changes additive/backward-compatible where practical

### Out of scope
- full generator fleet framework
- nuclear implementation
- gas peaker implementation if it causes major scope growth
- traffic emissions
- historical CO2 persistence in IOT
- full dispatch market simulation
- perfect startup/shutdown realism

## Architectural rules

1. Renewables must remain weather-driven.
2. Buildings must remain building-driven demand, not revert to synthetic aggregate placeholder logic.
3. CO2 must come from active generation mix, not arbitrary random values.
4. Oil backup should turn on because of energy deficit, not because of manual drama alone.
5. Keep the first implementation explainable.

## Part 1, explicit energy mix with oil backup

Extend the VC energy model so it exposes at least:
- solar output
- wind output
- total renewable output
- oil backup output
- total generation output
- oil backup online/offline state

### Oil backup behavior
Recommended first-pass logic:
1. compute weather-driven solar output
2. compute weather-driven wind output
3. compute current city/building demand
4. if renewable output is below demand, use oil backup to fill the deficit up to its capacity
5. if renewables cover demand, oil backup output should be zero and state should be offline

### First-pass oil generator assumptions
Keep these simple and explicit.
Suggested fields/values:
- `id: oil-backup-01`
- `label: Oil Backup`
- `installedCapacityKw`: choose a sensible MVP number large enough to matter but not absurd
- `currentOutputKw`
- `isOnline`
- `co2IntensityKgPerMwh`

You may keep these inside the energy service for the first pass if that is cleaner than introducing a full new subsystem.

## Part 2, ensure weather-driven renewables stay explicit

Do not regress the current weather coupling.

### Solar must remain tied to:
- daylight / solar radiation
- cloud cover indirectly through solar radiation
- date and time through the weather/daylight model

### Wind must remain tied to:
- weather wind speed
- a power-curve style approximation

If you can make the wind model slightly cleaner while staying small, do so.
But do not overbuild this packet.

## Part 3, preserve and verify weather-sensitive building demand

Current building demand already has weather sensitivity.
Preserve that.

### Important product rule
Residential buildings should clearly demand more electricity when the weather is cold.
That must remain true.

### Optional small improvement
If clean and low-risk, make residential heating sensitivity slightly more visible or readable in the code/UI.
But do not destabilize the existing building model.

## Part 4, update city energy balance logic

Update city aggregate logic so balance uses **total generation**, not just renewable output.

### Required behavior
City balance should reflect:
- solar
- wind
- oil backup
- building-driven demand

If oil backup fills the gap fully, the city balance may be near zero.
If total generation still cannot cover demand, balance may remain negative.

## Part 5, first CO2 model

Add the first real emissions model.

### Required outcomes
Expose at least:
- current emissions rate
- current grid/generation carbon intensity
- visible CO2 spike behavior when oil backup is active

### Recommended simple formula
Use generation-source-based emissions intensity.

Suggested defaults for first pass:
- solar: `0 kg CO2 / MWh`
- wind: `0 kg CO2 / MWh`
- oil backup: high nonzero value, configurable constant

Then derive:
- `currentCo2KgPerHour`
- `gridIntensityKgPerMwh`

You may also expose:
- `co2TodayKg` if it falls out naturally and cleanly, but it is optional for this packet

### Important note
This is a first-pass operational CO2 model.
Do not overcomplicate lifecycle emissions, indirect emissions, traffic emissions, or district heating in this packet.

## Part 6, contracts and route shapes

Update shared contracts if needed, but keep changes additive.

Likely needs:
- richer energy summary shape
- possibly richer city summary shape
- perhaps a new emissions payload or fields nested under energy/city

### Acceptable approaches
Option A:
- extend existing energy summary and city summary with additive fields

Option B:
- add a dedicated emissions endpoint such as `GET /api/emissions/current`

Recommendation:
- keep the main energy/city routes richer
- add a dedicated emissions route only if it materially improves clarity

## Part 7, UI updates in VC

Update the VC UI so the new energy/emissions behavior is visible.

### Must show
- oil backup online/offline state
- oil backup output
- total generation
- CO2 current value or emissions rate
- a clear visual indication when dirty backup is active

### Design direction
Keep the new premium VC UI styling.
Integrate this into the existing energy/city area cleanly.
Do not bloat the page.

### Good additions
- a red/amber fossil backup indicator
- emissions stat card
- updated balance section

## Part 8, tests

Add or update tests.

### Minimum useful coverage
- energy output remains weather-driven for solar and wind
- building-driven demand still works and residential cold sensitivity still exists
- oil backup activates when renewable generation is insufficient
- oil backup stays off when renewables cover demand
- CO2 is zero or near zero when only renewables are active
- CO2 rises when oil backup is active
- city balance uses total generation including oil backup

Do not obsess over exact constants unless needed. Test directional correctness and shape validity.

## Suggested implementation order

1. extend energy model to include oil backup and total generation
2. update city balance logic
3. add CO2 calculations
4. update contracts / route payloads as needed
5. update VC UI
6. add or update tests
7. run build/tests

## Acceptance criteria

This packet is complete when:
- renewables remain weather-driven
- residential demand still increases in cold weather
- oil backup generator exists and activates on renewable deficit
- city balance includes oil backup generation
- first CO2 model exists and visibly spikes when oil backup runs
- VC UI surfaces the new generator + emissions state
- build passes
- tests pass

## Non-goals and anti-goals

Do not:
- build a full market dispatch simulator
- add five generator types at once
- pretend lifecycle emissions are solved
- add traffic emissions here
- undo the clean building-driven demand work
- invent fake smart-grid complexity for its own sake

## Deliverable expectations from Claude

Claude should return:
- changed files
- short explanation of the oil backup dispatch logic
- short explanation of the CO2 calculation chosen
- what route/contract changes were made
- any assumptions or follow-up recommendations

## Short conclusion

The mission is to make the city energy story believable:
clean renewables when weather allows, dirty backup when they fail, and visible CO2 consequences when that happens.
That is more persuasive than a thousand polite placeholder numbers.