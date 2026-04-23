---
name: UI and Buildings Packet (2026-04-20)
description: Building-driven demand model and operator UI redesign implemented; key decisions and follow-ups
type: project
---

Building-driven demand model and operator UI redesign implemented per CLAUDE_PACKET_UI_AND_BUILDINGS.md.

**Why:** Replace synthetic 900 kW aggregate with per-building simulation; improve operator UI readability.

**How to apply:** Next work should be aware of these architectural changes.

## What was done

### New files
- `packages/contracts/src/buildings/summary.ts` — `BuildingDemandSchema`, `BuildingsSummarySchema` (Zod)
- `apps/cityverse-vc/src/buildings/types.ts` — `BuildingType`, `ScheduleClass`, `Building` interface
- `apps/cityverse-vc/src/buildings/roster.ts` — 7-building seeded roster (villas, apartment, office, retail, school, utility node)
- `apps/cityverse-vc/src/buildings/service.ts` — `BuildingService` with demand computation
- `apps/cityverse-vc/src/buildings/routes.ts` — `GET /api/buildings/current`, `GET /api/buildings/summary`

### Modified files
- `packages/contracts/src/index.ts` — added buildings export
- `apps/cityverse-vc/src/city/service.ts` — `CityService` now takes `BuildingService`, delegates demand to it
- `apps/cityverse-vc/src/server.ts` — wires `BuildingService`, registers building routes
- `apps/cityverse-vc/src/ui.ts` — full redesign: stat cards for weather/energy/city/sim context, buildings table, no raw JSON pre blocks
- `tests/smoke.test.mjs` — 5 new building tests added

## Demand model

`currentDemandKw = baseDemandKw × scheduleMultiplier(class, hour, isWeekend) × weatherMultiplier(class, tempC, sensitivity)`

Base demand total (all buildings, all multipliers = 1): ~913 kW ≈ old 900 kW base.

## Roster base values
- villa-a: 18 kW, residential, sensitivity 0.90
- villa-b: 15 kW, residential, sensitivity 0.85
- apartment-01: 240 kW, residential, sensitivity 0.70
- office-01: 350 kW, office, sensitivity 0.60
- retail-01: 120 kW, retail, sensitivity 0.50
- school-01: 110 kW, civic, sensitivity 0.40
- utility-01: 60 kW, infrastructure, sensitivity 0.10 (flat)

## Follow-up recommendations
- Generator entity modeling (next logical step: dispatchable generation)
- CO2 accounting per building type
- Unity scene binding for building IDs
- MQTT building telemetry publication if IoT app needs building-level data
