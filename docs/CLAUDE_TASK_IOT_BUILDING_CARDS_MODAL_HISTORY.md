# Claude Task — Implement IOT Building Cards + Drilldown Modal + Metric History

## Context
Use:
- `docs/IOT_UI_BUILDING_CARDS_MODAL_HISTORY_PLAN.md`
- Existing IOT UI implementation in `apps/cityverse-iot/src/ops/ui.ts`
- Existing IOT routes/history in `apps/cityverse-iot/src/*`

## Objective
Implement the planned feature on IOT page:
1. One card per building
2. Modal on card click
3. Click metric to show history chart

## Constraints
- Keep current visual style and dark Syntra branding
- Avoid framework migration; stay in current server-rendered HTML approach
- Keep existing endpoints and cards working

## Deliverables
1. New/updated backend endpoint(s) for building metric history
2. Building Fleet card section in IOT UI
3. Modal component with clickable metrics
4. Inline chart renderer (canvas or SVG) with time range switch
5. Error/empty/loading states for history
6. Brief implementation notes in docs

## Required Output Files (PR contents)
- Updated source files in `apps/cityverse-iot/src/...`
- Optional new helper modules if needed
- Update to docs with endpoint details

## Verification Checklist
- [ ] `pnpm build:iot` passes
- [ ] `pnpm start:iot` runs without runtime errors
- [ ] Building cards appear
- [ ] Modal opens/closes correctly
- [ ] Metric click updates chart
- [ ] Range switch updates points
- [ ] No breakage to existing ops summary panels

## Test Steps
1. Open `http://localhost:3002/`
2. Confirm Building Fleet section renders all buildings
3. Click one building card
4. Click each metric row; verify chart updates
5. Toggle range 15m/1h/6h/24h/7d
6. Leave page for 5 minutes and confirm no UI drift/errors

## Done Condition
All checklist items pass and UI matches Syntra style without layout regressions.
