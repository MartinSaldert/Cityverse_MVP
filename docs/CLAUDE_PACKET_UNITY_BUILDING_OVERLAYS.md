# Cityverse MVP, Claude Packet: Building Occupancy and Unity World-Text Overlays

Date: 2026-04-20
Owner: The Sage
Target implementer: Claude
Status: ready for delegation

## Purpose

Implement the next Cityverse MVP integration slice so Unity can show per-building live state above buildings as simple world-space text.

Martin explicitly wants to know, for each building in Unity:
- how many people are in the house/building right now
- how much power it draws right now
- and to present that above the house as text for now

This packet therefore covers two connected parts:

1. extend the building simulation model so it exposes a current occupancy / people count
2. add Unity receiver scripts that fetch per-building live state and present it as text above each building

The goal is not visual polish. The goal is a working live overlay path that makes the simulated city legible in-scene.

## Product direction

The project now has:
- weather receiver scripts in Unity
- energy receiver scripts in Unity
- building-driven demand in VC
- stable building IDs in the seeded roster

What it still lacks is:
- occupancy per building
- a Unity building-state receiver
- world-space labels above buildings

This packet should create the first useful building-to-Unity path.

## Current implementation reality

Relevant current files:
- `unity/cityverse-receiver/README.md`
- `unity/cityverse-receiver/WeatherApiClient.cs`
- `unity/cityverse-receiver/WeatherReceiverBehaviour.cs`
- `unity/cityverse-receiver/EnergyApiClient.cs`
- `unity/cityverse-receiver/EnergyReceiverBehaviour.cs`
- `apps/cityverse-vc/src/buildings/service.ts`
- `apps/cityverse-vc/src/buildings/roster.ts`
- any current building contracts or routes added by the previous packet

Current building state includes demand-related values, but does not yet clearly expose occupancy/people count.
That must be added.

## Scope

### In scope
- add occupancy / people count to building simulation output
- expose per-building current state over HTTP in a clean stable shape
- add Unity C# DTOs and polling client(s) for building state
- add a MonoBehaviour that renders world-space text above a building
- map Unity objects to building IDs via a simple inspector field
- keep the implementation usable with copied scripts under `Assets/`
- update Unity receiver README/setup docs
- add or update tests where practical

### Out of scope
- TextMeshPro package dependency unless absolutely necessary
- fancy UI skinning
- automatic scene scanning or procedural building matching
- WebSocket push updates
- DT service work
- asset/prefab generation
- full crowd simulation

## Architectural rules

1. Keep the solution simple and copy-paste-friendly for Unity.
2. Prefer no extra Unity package dependency if possible.
3. Stable building IDs are the integration key.
4. Keep the API additive and readable.
5. Occupancy should be explainable and tied to time-of-day behavior, not random noise masquerading as simulation.

## Part 1, add occupancy to building state

Extend the building model so each building returns current occupancy.

### Required outcome
Each building current-state payload should include at least:
- `id`
- `label`
- `type`
- `scheduleClass`
- `currentDemandKw`
- `occupancyCount`
- `updatedAt`

Recommended additional fields if useful:
- `occupancyCapacity`
- `occupancyFactor`
- `weatherFactor`
- `baseDemandKw`

### Modeling guidance
Occupancy should be simple and believable.
Suggested approach:
- each building has an occupancy capacity or nominal population
- current occupancy is derived from schedule class and time-of-day
- residential stays partially occupied overnight and rises morning/evening
- office rises strongly during workday
- retail ramps later in the day
- civic aligns with daytime operation
- industrial has a production-shift occupancy
- utility stays near zero or a tiny fixed staffing level

### Important product rule
For houses, the occupancy count should read like "people in this house right now".
That means the values should stay interpretable, not abstract percentages.

### Suggested data additions to roster
Each building should likely gain:
- `occupancyCapacity`
- maybe `displayOrder`

Keep it lean.

## Part 2, building HTTP contract

Ensure the building API exposes a clean per-building current-state shape suitable for Unity polling.

Recommended route:
- `GET /api/buildings/current`

If already present, extend it rather than inventing a second incompatible route.

Suggested response shape:
```json
{
  "ok": true,
  "data": [
    {
      "id": "villa-a",
      "label": "Villa A",
      "type": "villa",
      "scheduleClass": "residential",
      "occupancyCount": 3,
      "occupancyCapacity": 4,
      "currentDemandKw": 18.4,
      "baseDemandKw": 15,
      "updatedAt": "2026-04-20T10:00:00.000Z"
    }
  ]
}
```

Optional helper route if useful:
- `GET /api/buildings/:id/current`

However, a single list route is enough for the first Unity slice if the client filters locally.

## Part 3, shared contracts

If building payloads already live in `packages/contracts`, extend them there.
Prefer additive changes.

Recommended shared additions:
- occupancy fields on the building current-state schema
- response schema for building list if not already present

Do not turn this into a contract-rewrite expedition.

## Part 4, Unity receiver scripts

Add Unity scripts under `unity/cityverse-receiver/` following the style of the existing weather and energy scripts.

### Required new scripts
Recommended minimum:
- `BuildingStateDto.cs`
- `BuildingsApiClient.cs`
- `BuildingOverlayBehaviour.cs`

Optional if it helps clarity:
- `BuildingListApiResponse.cs` if you do not want nested internal classes
- `SimpleWorldText.cs` or similar helper

### Required behavior
`BuildingsApiClient` should:
- poll `GET /api/buildings/current`
- deserialize the building list
- expose latest list and update event(s)

`BuildingOverlayBehaviour` should:
- be attached to a building GameObject
- expose `buildingId` in the inspector
- find the corresponding building DTO in the latest list
- render text above the building showing at minimum:
  - building label
  - people count
  - current load in kW

### Rendering requirement
The text should appear above the building in world space.
Use the simplest robust Unity-native option.

### Preferred implementation path
Use a child `TextMesh` or another built-in world-text option if possible, to avoid extra package requirements.
If TextMeshPro is used, it must be optional and documented clearly.

## Part 5, overlay content and formatting

Minimum overlay text format:
```text
Villa A
People: 3
Load: 18.4 kW
```

Optional fourth line:
- building type or occupancy capacity

Keep the text readable, stable, and concise.

### Useful inspector fields
`BuildingOverlayBehaviour` should ideally expose:
- `buildingId`
- `verticalOffset`
- `lookAtCamera` or billboard toggle
- optional text color / font size settings

### Nice-to-have
If easy, make the label face the main camera each frame.
But do not let billboarding complexity block delivery.

## Part 6, Unity setup docs

Update `unity/cityverse-receiver/README.md`.

Document how to:
- copy the new scripts into Unity
- create a central BuildingsReceiver object if needed
- attach a `BuildingOverlayBehaviour` to each building object
- assign the `buildingId`
- point the base URL to the service
- view live text above buildings in Play mode

If the design uses one shared `BuildingsApiClient` and many overlay behaviours, explain that clearly.
That is probably the cleanest shape.

## Part 7, tests

Add or update tests where practical.

Minimum useful test coverage:
- building current-state payload includes `occupancyCount`
- occupancy changes plausibly across time for at least one residential and one office/industrial building
- building route remains valid and additive

You do not need Unity runtime tests here. Focus on backend/output correctness.

## Suggested design recommendation

### Backend
- keep one building service that computes both occupancy and demand
- occupancy should be derived from the same schedule logic family as demand, not a separate random system
- demand and occupancy do not have to be mathematically identical, but they should tell the same story

### Unity
A clean pattern is:
- one `BuildingsApiClient` in scene, polling the endpoint
- many `BuildingOverlayBehaviour` components referencing that client
- each overlay filters by `buildingId`

This avoids one HTTP request per building, which would be gloriously inefficient.

## Acceptance criteria

This packet is complete when:

1. Building current-state output includes occupancy / people count.
2. The occupancy values are plausible and schedule-driven.
3. Unity has scripts for polling building state and showing world-space text per building.
4. Each building overlay is keyed by stable `buildingId`.
5. The overlay shows at least label, people count, and current kW.
6. Unity setup is documented in the receiver README.
7. Build passes.
8. Backend tests pass.
9. Existing weather and energy Unity receiver flows remain intact.

## Non-goals and anti-goals

Do not:
- build a full UI framework inside Unity
- add one HTTP poller per building object
- introduce a required package dependency unless necessary
- make occupancy random just to make it "look alive"
- redesign the whole API surface

## Suggested implementation order

1. extend building roster data with occupancy capacity
2. extend building service to compute occupancy counts
3. update contracts and/or building route payloads
4. add Unity DTO and shared list client
5. add building overlay behaviour with world text
6. update README
7. add backend tests

## Deliverable expectations from Claude

Claude should return:
- changed files
- short explanation of the occupancy model chosen
- Unity script layout used
- any assumptions made
- follow-up recommendations for richer Unity visualization later

If a tradeoff appears, favor:
- clarity
- stable IDs
- one shared polling client
- low-friction Unity setup

Over:
- overabstracted architecture
- per-building network calls
- decorative complexity

## Short conclusion

The mission is simple: make each building in Unity say who is inside and how much power it is using.
That gives Martin immediate live city legibility, which is worth far more than another page of elegant intentions.