# IOT UI Expansion Plan — Building Cards + Drilldown Modal + Metric History

## Goal
Upgrade the IOT Operations page so operators can:
1. See one card per building
2. Click a building card to open a detail modal
3. Click any metric in the modal to see a history chart for that metric

## Scope (this packet)
- IOT web UI only (`apps/cityverse-iot/src/ops/ui.ts` + related routes)
- Data from existing IOT state/history first
- No Unity work in this phase

## UX Requirements

### A) Building card grid
- Add a dedicated section: **Building Fleet**
- Render one card per building from live/current-state data
- Each card should at minimum show:
  - Building label + ID
  - Current demand (kW)
  - Occupancy count/capacity
  - Weather factor
  - Last update freshness (seconds)
  - Status badge (ok/stale/no_data)

### B) Building detail modal
- Open on card click
- Modal header:
  - Building label + ID
  - Type + schedule class
  - Live freshness
- Modal body: clickable metric rows/cards
  - demandKw
  - baseDemandKw
  - occupancyCount
  - occupancyPercent
  - weatherFactor

### C) Metric history chart
- Clicking a metric loads/updates chart panel in modal
- Default chart type: line
- Time ranges:
  - 15m, 1h, 6h, 24h, 7d
- If no history points: show explicit empty state

## Data Contract Plan

## Existing endpoints used
- `GET /buildings/current`
- `GET /buildings/summary`
- `GET /ops/summary`

## New endpoint to add
### `GET /buildings/:buildingId/history`
Query params:
- `metric` (required) — `demandKw | occupancyCount | occupancyPercent | weatherFactor | baseDemandKw`
- `range` (optional) — `15m | 1h | 6h | 24h | 7d` (default `1h`)
- `limit` (optional, default 300)

Response shape:
```json
{
  "ok": true,
  "data": {
    "buildingId": "villa-a",
    "metric": "demandKw",
    "range": "1h",
    "points": [
      {"ts": "2026-04-29T11:20:00.000Z", "value": 12.4}
    ]
  }
}
```

## Storage/History Notes
- Prefer reading from current IOT history store if possible
- If building-level history is not captured yet, add ingest write-path so each building metric is recorded with:
  - `flowKey`
  - `entityId` (building id)
  - `metric`
  - `value`
  - `ts`

## UI Architecture Notes
- Keep single-file HTML generator style for now (consistent with current `ops/ui.ts`)
- Introduce clear client-side modules inside script block:
  - `state.buildings`
  - `modal.open/close`
  - `charts.render`
  - `api.getBuildingHistory`
- Avoid full rerender of modal while chart is open; patch only chart area

## Performance Targets
- Building grid render under 200ms for 50 buildings
- Modal open under 120ms (without history fetch)
- History chart update under 300ms for 300 points

## Acceptance Criteria
1. Building grid is visible with one card per building
2. Clicking a card opens modal with live values
3. Clicking metric loads correct chart data
4. Range switch updates chart while modal stays open
5. Missing history shows friendly empty state
6. No console errors during 5-minute auto-refresh run

## Non-Goals (this phase)
- Cross-filtering by district/type
- Comparative multi-building overlay chart
- CSV export
- Auth/role gating

## Suggested Delivery Phases
- Phase 1: UI skeleton + card grid + modal shell
- Phase 2: new history endpoint + metric click wiring
- Phase 3: chart polish + range controls + empty/error states
- Phase 4: regression pass + visual alignment with existing Syntra theme

## Risks
- History granularity may be insufficient for all metrics
- Frequent polling could cause UI jitter unless modal state is isolated
- Large building counts need virtualized rendering later

## Definition of Done
Feature is done when all acceptance criteria pass and no existing IOT overview cards regress.
