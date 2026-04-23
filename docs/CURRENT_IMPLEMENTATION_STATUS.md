# Cityverse MVP, Current Implementation Status

Date: 2026-04-22
Status: verified against current code structure, extended with live Unity DT UI work on Martin's Mac, and expanded with AI/avatar planning notes

## Summary

The current Cityverse MVP implementation already provides a working first vertical slice on the code level:
- VC simulates time, weather, renewable energy, and a derived city aggregate
- VC exposes an operator UI and HTTP control surface
- VC publishes weather and energy telemetry over MQTT
- IOT ingests weather and energy telemetry from MQTT
- IOT exposes current weather, energy, demand, and city aggregate over HTTP
- Unity receiver documentation exists for polling both weather and energy from IOT

The largest remaining gap is no longer basic app structure or first end to end runtime verification. The Windows PC vertical slice has been manually verified. The main remaining gaps are automated testing, explicit building-driven demand, and richer generator modeling.

## Monorepo structure

### Root
- workspace managed with `pnpm`
- root scripts include:
  - `pnpm build`
  - `pnpm build:contracts`
  - `pnpm build:vc`
  - `pnpm build:iot`
  - `pnpm start:vc`
  - `pnpm start:iot`

### Packages
- `packages/contracts`
- `apps/cityverse-vc`
- `apps/cityverse-iot`
- `unity/cityverse-receiver`

## Build and test status

### Verified build status
- `pnpm build` succeeds
- contracts compile
- VC compiles
- IOT compiles

### Test status
- `pnpm test` exists and runs the current smoke suite
- a real smoke test file is present at `tests/smoke.test.mjs`
- current test coverage is still limited and should be expanded for stronger runtime confidence

## Contracts package

Shared contract modules currently include:
- weather telemetry
- weather summary
- weather commands
- weather current payload
- energy summary
- energy current payload
- city summary
- MQTT topics

These contracts are used to keep VC publish shape and IOT ingest shape aligned.

## VC implementation

### Entrypoint and runtime
VC has:
- `src/main.ts`
- `src/server.ts`
- Fastify server
- `/health` endpoint
- root browser UI at `/`

### Clock subsystem
VC clock support includes:
- get current simulation clock state
- pause simulation
- resume simulation
- change simulation speed
- set simulation time directly

Routes:
- `GET /api/clock`
- `POST /api/clock/pause`
- `POST /api/clock/resume`
- `POST /api/clock/speed`
- `POST /api/clock/time`

### Weather subsystem
Weather support includes:
- season-aware calendar context
- daylight factor
- solar radiation approximation
- pressure evolution
- humidity evolution
- cloud cover evolution
- wind evolution
- precipitation evolution
- temperature and feels-like evolution
- derived weather category
- manual weather nudges

Routes:
- `GET /api/weather/current`
- `POST /api/weather/nudge`

Current note:
- weather control is currently a nudge model, not a preset library or hard override mode

### Energy subsystem
Energy support includes:
- solar output approximation derived from solar radiation
- wind output approximation derived from wind speed
- total renewable output aggregation

Routes:
- `GET /api/energy/current`

Current note:
- this is a renewable summary model, not yet a full explicit generator fleet

### City aggregate subsystem
City support includes:
- derived current demand summary
- derived city aggregate summary
- city balance calculation

Routes:
- `GET /api/demand/current`
- `GET /api/city/current`

Current note:
- demand is still a synthetic aggregate formula, not yet a building-driven simulation

### Operator UI
The VC UI currently supports:
- viewing live clock state
- viewing live weather state
- viewing live energy state
- viewing live city state
- setting speed
- quick speed presets
- setting simulation date and time
- pause and resume
- applying weather nudges

It is functional and useful for the slice, though still intentionally spare.

### MQTT publishing
VC publishes:
- weather telemetry
- energy telemetry

Current note:
- no separate city aggregate telemetry topic is implemented yet
- IOT derives city aggregate from latest weather and energy state

## IOT implementation

### Entrypoint and runtime
IOT has:
- `src/main.ts`
- `src/server.ts`
- Fastify server
- `/health` endpoint

### MQTT ingest
IOT subscribes to:
- weather telemetry topic
- energy telemetry topic

IOT validates payloads using shared contracts and stores latest values in memory.

### HTTP routes
IOT exposes:
- `GET /weather/current`
- `GET /energy/current`
- `GET /demand/current`
- `GET /city/current`

### Current behavior when data is missing
- weather route returns `503` until weather telemetry arrives
- energy route returns `503` until energy telemetry arrives
- demand route requires weather state
- city route requires weather, energy, and demand availability

### Data model note
IOT currently behaves as a live state gateway, not a historical storage system.
That is acceptable for this MVP slice, though history and replay will likely matter later.

## Unity receiver status

The Unity receiver folder currently includes working runtime code for:
- weather DTO and API client
- weather receiver behaviour
- energy DTO and API client
- energy receiver behaviour
- building DTO and API client
- legacy TextMesh building overlay behaviour
- first-pass Canvas-based DT building UI
- installer-driven scene wiring for DT UI

Current Unity path:
- HTTP polling from IOT at `http://localhost:3002`
- live building polling from `GET /buildings/current`
- live weather polling from `GET /weather/current`
- live energy polling from `GET /energy/current`
- optional light reaction for weather/daylight
- Canvas-based DT HUD and world-space UI

### New Unity DT UI work completed on 2026-04-21 and refined further on 2026-04-22

The Unity DT UI has moved beyond basic text overlays.

Implemented in project:
- `Assets/Scripts/CityverseBuildingUI.cs`
- `Assets/Scripts/BuildingQuickCardView.cs`
- `Assets/Scripts/BuildingDetailPanelView.cs`
- `Assets/Scripts/BuildingSelectionUIController.cs`
- `Assets/Scripts/CityverseBuildingUIInstaller.cs`
- `Assets/Scripts/BuildingCardAnchor.cs`
- `Assets/Scripts/BuildingCardsManager.cs`
- `Assets/Scripts/BuildingMarkerView.cs`
- `Assets/Scripts/BuildingInteractable.cs`
- `Assets/Scripts/WeatherHudWidget.cs`

### Verified Unity DT behavior now
- a Canvas-based **world-space building quick card** works
- a Canvas-based **screen HUD building detail card** works
- both are bound to **live IOT building data**, not design placeholders
- a deterministic installer exists under Unity menu:
  - `Tools/Cityverse/Install Building UI`
  - `Tools/Cityverse/Switch To Expert Mode`
  - `Tools/Cityverse/Switch To Kids Mode`
- all intended buildings in the city scene are active and visible again
- old `BuildingOverlayBehaviour` can now be disabled in favor of the new UX path

### Current DT UX direction in Unity
The current agreed DT UX direction is:
- one **small world marker** per building by default
- one **shared 3D quick card** for hover/selection context
- one **shared HUD detail panel** for focused inspection
- one **time/weather HUD widget** that can open weather details
- click/hover interaction handled on building colliders rather than permanent full 3D cards on every building

This replaces the earlier idea of keeping a full floating 3D card open on every building at once, which was judged too visually crowded.

### What is working versus still in progress in Unity DT UI

Working now:
- live building polling from IOT
- live building quick card
- live building HUD detail panel
- expert mode UI path
- kids mode structural support in code
- marker-based low-clutter architecture in code
- weather/time widget code path exists
- installer-based repeatable setup path exists
- old `BuildingOverlayBehaviour` can be disabled automatically by the current installer path
- mouse-driven building interaction code now exists in project (`BuildingInteractable.cs`)
- shared quick-card / shared HUD / per-building marker architecture is now the intended path

Still in progress / next to verify in-scene:
- hover behaviour should show the shared quick card cleanly for the hovered building
- click behaviour should switch selected building and update HUD consistently
- marker-only default state must fully replace any leftover always-on full quick cards
- weather widget should cleanly toggle/open the intended weather HUD target
- kids mode visual/runtime verification in-scene still needs explicit confirmation
- further visual polish is still needed for spacing, hierarchy, and motion

### AI planning work completed on 2026-04-22
A planning investigation was completed for adding an AI layer to Cityverse.

Current architectural recommendation:
- use a **tool-driven cloud AI** first for Phase 1 and Phase 2
- keep truth in VC/IOT/DT, not in the model
- do not start with LoRA or fine-tuning
- use a scenario-analysis layer for predictions instead of asking the model to hallucinate causality
- prepare for a small RAG layer later for docs/runbooks/history
- prepare for an optional local inference backend later (Mac / DGX Spark)

Recommended Phase 1 AI scope:
- conversational assistant over structured tools
- read VC/IOT/DT state
- safely call VC controls
- discuss current system state and results
- tracing/audit from day one

Recommended Phase 2 AI scope:
- scenario branching
- baseline vs branch comparison
- structured diffs across VC → IOT → DT
- explanation of predicted effects based on simulated outputs, not raw LLM intuition

### Avatar investigation work completed on 2026-04-22
A first avatar investigation was also completed.

Current recommendation:
- use a **Unity 3D avatar** for embodiment
- keep the AI brain separate from avatar rendering
- use Unity animation for idle/breathing/poses
- use audio-driven facial animation for speech/lip sync
- likely investigate **NVIDIA Audio2Face** for facial speech animation
- use Animator-driven pose states for presenting, listening, talking, thinking, etc.

Important conclusion:
- Audio2Face is useful mainly for **speech/facial animation**, not for the whole pose system
- breathing, idle motion, and body/head pose states still need a normal Unity animation layer

### Important practical note for tomorrow
The project is now at the point where the next session should begin by:
1. running `Tools/Cityverse/Install Building UI`
2. verifying marker/hover/click behavior in-scene
3. verifying `Switch To Kids Mode` and `Switch To Expert Mode`
4. confirming the weather/time widget opens the correct weather HUD
5. continuing UI polish and interaction refinement from that live installed state
6. if Unity UI stabilizes, turn the AI planning notes into a proper implementation architecture doc
7. if avatar work begins, first inspect the bust model for rig/blendshape readiness before choosing a face-animation path

Not yet implemented in the broader Unity path:
- WebSocket or event-stream push updates
- formal prefab pipeline for the new DT UI
- polished animation/transitions
- power plant card UX parity with building cards
- finalized weather detail panel UX

## What is implemented versus planned

### Implemented now
- executable separation between VC and IOT
- shared contracts
- simulation clock
- weather simulation
- renewable energy summary
- city aggregate summary
- operator UI
- MQTT weather and energy flow
- IOT live current-state API
- Unity polling receiver documentation

### Still planned
- explicit building entity model
- explicit generator control model
- CO2 model
- traffic model
- historical persistence and replay in IOT
- expanded automated tests beyond current smoke coverage

## Main risks

### 1. Automated test coverage is still thin
The current smoke tests are useful, but they do not yet provide strong protection against regressions across simulation behavior, ingest behavior, or contract drift.

### 2. Demand is still synthetic
Current city demand is still computed from a simple aggregate formula, not an explicit building roster with building-level load behavior.

### 3. Some docs had drifted behind implementation
The project had planning docs that still described already-completed steps as pending. That reconciliation is in progress.

## Recommended next steps

1. expand automated smoke tests for VC, IOT, and contracts
2. define the first explicit building roster and building-driven demand model
3. decide whether city aggregate should remain derived in IOT or also be emitted directly from VC
4. add a lightweight historical state layer in IOT once the live path is stable
5. extend the energy model toward explicit generator entities and controls
