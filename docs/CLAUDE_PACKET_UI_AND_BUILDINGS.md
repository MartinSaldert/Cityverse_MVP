# Cityverse MVP, Claude Packet: Demo Operator UI and Building-Driven Demand

Date: 2026-04-20
Owner: The Sage
Target implementer: Claude
Status: ready for delegation

## Purpose

Implement the next meaningful Cityverse MVP upgrade in two connected parts:

1. improve the VC operator UI so it is useful for demo operation rather than mainly raw JSON inspection
2. replace the synthetic aggregate city demand formula with a seeded building roster and building-driven demand model

This packet should move the project forward in visible product value, not merely increase architectural elegance. The Cityverse demo needs to feel like an operator is controlling a place, not a pile of endpoints wearing a browser.

## Product direction

The project now has:
- date and time controls
- location selection
- weather nudges
- daylight context
- weather, energy, and city summaries

What it still lacks is:
- a more readable demo operator surface
- explicit city entities that contribute demand

The next milestone should make the city feel like a small district with recognizable demand behavior.

## Current implementation reality

Relevant current files:
- `apps/cityverse-vc/src/ui.ts`
- `apps/cityverse-vc/src/city/service.ts`
- `apps/cityverse-vc/src/city/routes.ts`
- `apps/cityverse-vc/src/energy/service.ts`
- `packages/contracts/src/city/summary.ts`
- `docs/MVP_BUILDING_ROSTER.md`

Current city demand logic is still a simple aggregate formula in `apps/cityverse-vc/src/city/service.ts`.
That formula should be replaced with explicit building simulation.

## Scope

### In scope
- improve the VC operator UI for demo readability and usability
- introduce a seeded building roster in VC
- compute city demand from explicit buildings instead of a single formula
- expose building-level data over HTTP in a clean additive way
- show building demand in the operator UI
- preserve existing core routes if possible
- keep energy model as-is for now, except where city balance uses the new demand
- add or update tests where practical

### Out of scope
- full generator entity implementation
- CO2 model
- traffic simulation
- Unity scene binding for buildings
- historical persistence
- database work
- perfect visual design

## Architectural rules

1. Keep the current VC routes working:
   - `GET /api/demand/current`
   - `GET /api/city/current`
2. Add new routes if needed, do not break current ones casually.
3. Prefer explicit seeded data over overcomplicated procedural generation.
4. Keep the building model simple but real enough to explain in a demo.
5. Make the UI more useful without turning it into a frontend framework project.

## Part 1, seeded building roster

Create a seeded building roster inside VC based on `docs/MVP_BUILDING_ROSTER.md`.

Recommended first roster:
- villa-a
- villa-b
- apartment-01
- office-01
- retail-01
- school-01
- factory-01
- utility-01

Each building should have at least:
- `id`
- `label`
- `type`
- `scheduleClass`
- `baseDemandKw`
- `weatherSensitivity`
- optional `priority` or display ordering if useful for UI

Suggested building types:
- `villa`
- `apartment`
- `office`
- `retail`
- `civic`
- `industrial`
- `utility`

Suggested schedule classes:
- `residential`
- `office`
- `retail`
- `civic`
- `industrial`
- `infrastructure`

Suggested file structure:
- `apps/cityverse-vc/src/buildings/types.ts`
- `apps/cityverse-vc/src/buildings/roster.ts`
- `apps/cityverse-vc/src/buildings/service.ts`

You may choose a slightly different file shape if it stays clean.

## Part 2, building-driven demand model

Replace the current aggregate demand formula with explicit per-building computation.

### Required outcome
Each building should contribute current demand based on at least:
- building type / schedule class
- current simulation time
- weather sensitivity
- day versus night behavior

### Minimum believable behavior
- villas: morning and evening peaks, lower weekday daytime demand
- apartment: steadier residential demand, still with morning/evening lift
- office: strong weekday daytime demand, low night load
- retail: later daytime activity, some afternoon lift
- school/civic: weekday daytime demand, low at night
- factory/industrial: strong weekday daytime demand, early-start production profile, lower but non-zero off-hours base load
- utility: low steady load

### Weather effects
Keep the first pass simple and visible:
- colder weather increases residential and civic demand
- hotter weather increases office and retail cooling demand
- factory/industrial may have mild weather sensitivity but should remain primarily schedule-driven
- apartment gets a moderate version of both where sensible
- utility stays mostly flat

### Time effects
Use a simple time-of-day multiplier model, for example:
- residential peaks around morning and evening
- office peaks during workday
- retail ramps later than office
- civic aligns with daytime service hours

Do not overbuild weekly calendars unless it falls out naturally and cleanly.
If weekday/weekend support is easy, include it. If not, omit it.

## Part 3, city service integration

Update `apps/cityverse-vc/src/city/service.ts`.

Required changes:
- city demand should be aggregated from building current demand
- city summary should continue to expose overall demand and balance
- demand timestamps should stay coherent with simulation/weather state

Optional but recommended:
- expose building count or building summary metadata somewhere in city output or a dedicated endpoint

## Part 4, new API routes for buildings

Add additive building routes.

Recommended routes:
- `GET /api/buildings/current`
- `GET /api/buildings/summary`

Suggested response for current buildings:
```json
{
  "ok": true,
  "data": [
    {
      "id": "villa-a",
      "label": "Villa A",
      "type": "villa",
      "scheduleClass": "residential",
      "currentDemandKw": 42.5,
      "baseDemandKw": 18,
      "occupancyFactor": 0.9,
      "weatherFactor": 1.2,
      "updatedAt": "2026-04-20T09:00:00.000Z"
    }
  ]
}
```

Suggested summary route could return:
- total building demand
- building count
- counts by type
- top demand contributors

If one route is enough and the second is unnecessary, keep it lean.

## Part 5, contracts

If shared contracts are touched, keep changes additive.

Recommended additions:
- building DTO/schema file(s) under `packages/contracts/src/buildings/`
- export from `packages/contracts/src/index.ts`

If building payloads are only VC-local for now, you may keep them local to VC to reduce churn, but shared contracts are preferred if the shapes are clearly useful.

Do not redesign the entire contracts package for this packet.

## Part 6, operator UI improvements

Upgrade `apps/cityverse-vc/src/ui.ts` so the page is more demo-usable.

### Required UI improvements
Keep the current sections, but make them more readable and operator-friendly.

The UI should now show, in a more legible form:
- simulation context
- weather and daylight
- energy summary
- city summary
- building demand summary
- weather controls

### Strong recommendation
Reduce dependence on raw `<pre>` JSON blocks as the primary presentation.
A small amount of debug JSON can remain, but the main information should be surfaced as readable operator cards/stats.

### Minimum useful presentation changes
Add readable stat cards or summary rows for:
- current date/time
- current location
- sunrise / sunset / day length
- weather condition
- temperature
- cloud cover
- wind speed
- renewable output total
- city demand total
- city balance
- number of buildings
- top 3 building demand contributors

Also add a building panel or table that lists at least:
- building label
- type
- current demand

Do not get lost in CSS theatrics. Functional clarity matters more than beauty.

## Part 7, tests

Add or update tests as practical.

Minimum useful test coverage:
- building roster returns expected seeded entries
- city demand is the sum of building demand entries
- building demand changes plausibly with time or weather for at least one residential and one office case
- existing `GET /api/demand/current` and `GET /api/city/current` still return valid shapes
- new building route works

Do not obsess over exact numeric values if the model uses approximations. Test for directional correctness and shape validity.

## Suggested model shape

A very reasonable first-pass formula per building is:

`currentDemandKw = baseDemandKw × scheduleMultiplier × weatherMultiplier × smallTypeAdjustment`

Where:
- `scheduleMultiplier` depends on schedule class and hour of day
- `weatherMultiplier` depends on current temperature and building sensitivity
- `smallTypeAdjustment` can reflect building-specific character or variation

Keep the formulas explainable.
The operator should be able to understand why a building is consuming more.

## Acceptance criteria

This packet is complete when:

1. VC has a seeded building roster with the recommended small district.
2. `GET /api/demand/current` is now derived from explicit building demand.
3. `GET /api/city/current` still works and uses the new demand model.
4. At least one additive building route exists and returns useful data.
5. The operator UI shows building-related information in a readable way.
6. The main UI is less dependent on raw JSON blocks for primary understanding.
7. Build passes.
8. Tests pass.
9. Existing weather/date/location/demand/energy operator flow remains intact.

## Non-goals and anti-goals

Do not:
- add a database
- build a complete occupancy simulator
- build drag-and-drop UI tools
- add a frontend framework
- redesign the whole backend around buildings
- start generator controls in this packet unless a tiny stub is needed

## Suggested implementation order

1. add building types and seeded roster
2. implement building demand computation service
3. wire city service to aggregate building demand
4. add building API route(s)
5. improve UI presentation and building panel
6. update contracts if needed
7. add tests

## Deliverable expectations from Claude

Claude should return:
- changed files
- short explanation of the building demand model chosen
- any assumptions made
- any follow-up recommendations, especially around next-step generator modeling

If a tradeoff appears, favor:
- clarity
- additive changes
- demo usefulness
- stable code

Over:
- deep simulation cleverness
- speculative architecture
- ornamental UI complexity

## Short conclusion

The mission is to make Cityverse look and behave more like a small controllable district.
A demo operator should be able to say, with a straight face, that homes, offices, and civic buildings are driving the city's load. That would be progress, and for once not merely the decorative kind.