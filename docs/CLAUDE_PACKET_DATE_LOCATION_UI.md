# Cityverse MVP, Claude Packet: Date, Location, Daylight, and Unity-Facing Cleanup

Date: 2026-04-20
Owner: The Sage
Target implementer: Claude
Status: ready for delegation

## Purpose

Implement the next simulation-context upgrade for Cityverse VC so the system becomes date-first and location-aware instead of season-first in the operator experience.

This packet covers four connected changes:

1. make date and time the primary simulation controls
2. add a location model with a major-city dropdown in the VC UI
3. make daylight and sun timing derive from date plus location
4. reduce the importance of `season` as a Unity-facing concept without breaking current internals

The goal is not to build a full astronomy simulator. The goal is to make the simulation feel anchored in time and place, and to expose the right concepts to Unity and the operator UI.

## Product direction

Martin explicitly wants:
- the user to set the date in the UI
- the weather to adapt to the month/date
- sunrise and sunset to react appropriately
- location to matter, likely through a long/lat or major-city dropdown
- the Unity experience to stop emphasizing a raw `spring` value as if that were the important thing

So the operator-facing hierarchy should become:
- date
- time
- location
- derived daylight and weather results

Not:
- season as the main user concept

## Current implementation reality

Relevant current files:
- `apps/cityverse-vc/src/ui.ts`
- `apps/cityverse-vc/src/clock/clock.service.ts`
- `apps/cityverse-vc/src/weather/calendar.ts`
- `apps/cityverse-vc/src/weather/service.ts`
- `apps/cityverse-vc/src/weather/types.ts`
- `packages/contracts/src/index.ts`
- `unity/cityverse-receiver/WeatherStateDto.cs`

Important current behavior:
- the UI already has date and time fields and can set ISO time
- `weather/calendar.ts` currently derives `season`, `sunrise`, `sunset`, and `daylightFactor` from month using a coarse season table
- `WeatherState` includes `season` but not explicit location metadata
- Unity weather DTO currently includes `season`

## Packet scope

### In scope
- add a location configuration/domain model in VC
- add a major-city dropdown to the VC operator UI
- persist selected location in runtime state while the app runs
- derive daylight timing from latitude plus date instead of a season-only fixed table
- expose sunrise and sunset in the weather/current payload or a closely related payload
- keep date/time controls working and make them more clearly central in the UI
- keep current weather simulation behavior broadly intact while improving its calendar anchor
- make Unity-facing weather consumption less dependent on displaying `season`
- update docs if required for clarity

### Out of scope
- historical weather import
- true timezone-aware civil-time modeling across arbitrary regions
- DST correctness for every country
- full solar azimuth/elevation model for rendering
- replacing the whole weather system
- breaking current HTTP routes unnecessarily

## Architectural rules

1. Preserve the current public API routes unless there is a very strong reason not to.
2. Prefer additive contract changes over breaking ones.
3. Keep `season` internally if it is still useful for rule baselines.
4. Make `date + time + location` the primary simulation context.
5. Avoid overengineering. We need believable behavior, not a planetarium dissertation.

## Required implementation plan

## Part 1, location domain model

Create a location module for VC.

Suggested file:
- `apps/cityverse-vc/src/location/catalog.ts`

Define a small built-in catalog of major cities.
Recommended initial entries:
- Stockholm
- Gothenburg
- Malmö
- London
- Berlin
- New York
- Tokyo

Each location should have at least:
- `id`
- `label`
- `latitude`
- `longitude`

Optional if useful:
- `countryCode`
- `utcOffsetMinutes` or similar

Important note:
For this packet, latitude is the critical input. Longitude and timezone can be present for future value, but do not let that complexity derail the work.

Also create a lightweight runtime holder for the currently selected location.
This can be a small service or stateful module owned by VC server composition.

## Part 2, API surface for location

Add minimal API support for the selected location.

Recommended endpoints:
- `GET /api/location/current`
- `GET /api/location/options`
- `POST /api/location/select`

Suggested response shape for current location:
```json
{
  "ok": true,
  "data": {
    "id": "stockholm",
    "label": "Stockholm",
    "latitude": 59.3293,
    "longitude": 18.0686
  }
}
```

Suggested select payload:
```json
{ "locationId": "stockholm" }
```

If you can keep this cleanly typed in contracts, do so. But do not balloon the contracts package for a tiny change.

## Part 3, daylight calculation upgrade

Replace the fixed season-based daylight duration model in `weather/calendar.ts` with a date-plus-latitude-based approximation.

### Required outcome
Given:
- current simulation date/time
- selected location latitude

The system should compute at least:
- sunrise hour
- sunset hour
- daylight duration
- daylight factor
- season if still desired for weather rules

### Acceptable implementation style
Use a lightweight solar/daylight approximation, not a heavy astronomy dependency.
A reasonable approach is:
- derive day-of-year from sim date
- estimate declination or seasonal solar angle using a standard approximation
- estimate day length from latitude plus day-of-year
- derive sunrise/sunset from solar noon assumptions
- derive daylightFactor from time position between sunrise and sunset

This can remain approximate as long as it is believable and stable.

### Constraints
- Do not depend on external web APIs
- Do not add a large astronomy library unless truly necessary, which it probably is not
- Keep the function deterministic and testable

## Part 4, weather service integration

Update weather state generation so the weather engine uses the improved calendar context.

Requirements:
- existing monthly/seasonal weather adaptation should still function
- sunrise/sunset and daylight should now depend on location plus date
- solar radiation should react through the new daylight model
- weather should still be nudgable through the current weather nudge API

If useful, extend `CalendarContext` and `WeatherState` with:
- `dayOfYear`
- `sunrise`
- `sunset`
- `daylightHours`
- maybe `locationId`

Be conservative about what gets pushed into long-term contracts if the values are only operator-facing.

## Part 5, VC operator UI update

Update `apps/cityverse-vc/src/ui.ts`.

### Required UI behavior
The operator UI should make these controls clearly visible and central:
- simulation date
- simulation time
- location dropdown

The UI should also display derived context, ideally in the weather panel or a simulation-context section:
- selected location name
- sunrise
- sunset
- daylight hours
- maybe local season as a secondary/debug value

### Important UI direction
Do not remove date/time controls. Improve their importance.
Do not make season a star of the interface.
If season is shown at all, it should be secondary.

### Interaction requirements
- changing location should refresh the displayed weather/daylight context
- changing date/time should refresh the displayed weather/daylight context
- existing clock controls should keep working

## Part 6, Unity-facing cleanup

Current Unity DTO includes:
- `season`

Martin does not want Unity to care much about a raw `spring` value.

### Required outcome
Make Unity-facing weather use less dependent on `season` as a user-facing concept.

### Acceptable ways to do this
Option A, preferred:
- keep `season` in the JSON for backward compatibility
- add more useful fields such as `sunrise`, `sunset`, `daylightHours`, or `locationLabel`
- update Unity receiver docs/comments to frame season as secondary

Option B:
- keep the API unchanged for now, but update the Unity scripts/comments so they do not present season as important

### Important constraint
Do not break the existing Unity polling path casually.
If you add fields, add them in a backward-compatible way.

## Part 7, tests

Add or update tests where practical.

Minimum useful test coverage:
- calendar/daylight helper behaves plausibly for at least two latitudes and two dates
- changing date in winter vs summer changes daylight duration meaningfully
- location selection endpoint behaves correctly
- weather/current route still returns valid shape

Do not obsess over exact astronomical correctness. Test for plausible directional behavior.

## Concrete design recommendation

### Suggested internal structure
- keep `SimulationClock` responsible only for time progression
- add a separate location service/state holder
- pass location state into weather/calendar computations
- keep weather rules separate from location selection plumbing

### Suggested contract strategy
If you touch shared contracts, prefer adding fields rather than renaming/removing current ones.

## Acceptance criteria

This packet is complete when:

1. VC operator UI has a working location dropdown with major-city options.
2. Date and time remain operator-settable and clearly central.
3. Weather/daylight behavior changes plausibly when date changes across the year.
4. Daylight behavior changes plausibly when location changes across latitudes.
5. Weather/current or related UI-facing data includes sunrise/sunset or equivalent daylight context.
6. Unity-facing integration is not centered on `season` anymore.
7. Existing routes and the current vertical slice remain working.
8. Tests pass.

## Non-goals and anti-goals

Do not:
- rebuild the entire weather engine
- introduce a giant dependency for solar math unless absolutely necessary
- break the existing Windows-verified slice
- turn this into a timezone correctness crusade

## Suggested implementation order

1. add location catalog and location endpoints
2. upgrade calendar/daylight calculation to use latitude plus date
3. wire location into weather service
4. update operator UI
5. add additive payload fields if useful
6. update Unity-side docs/comments if needed
7. add tests

## Deliverable expectations from Claude

Claude should return:
- changed files
- short explanation of the daylight approximation chosen
- any assumptions made
- any follow-up recommendations

If a tradeoff appears, favor:
- stable behavior
- additive changes
- readable code

Over:
- cleverness
- unnecessary realism theater

## Short conclusion

The mission is simple: make Cityverse feel tied to a real date and place, so sunlight and weather behave like they belong to an actual city instead of a seasonal mood ring.