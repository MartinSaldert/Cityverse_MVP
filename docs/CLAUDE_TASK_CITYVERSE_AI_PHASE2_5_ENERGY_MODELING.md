# Cityverse MVP, Claude Task: Phase 2.5 Energy and Wind Modeling Tightening

Date: 2026-04-28
Status: ready for delegation

## Mission

Tighten the Phase 2 energy/weather projection model so scenario answers about cloud and wind changes are less misleading.

## Read first

1. `docs/CLAUDE_PACKET_CITYVERSE_AI_PHASE2_5_ENERGY_MODELING.md`
2. `docs/CLAUDE_PACKET_CITYVERSE_AI_PHASE2_SCENARIO_ANALYSIS.md`
3. `docs/CITYVERSE_AI_PORTABILITY_REQUIREMENTS.md`
4. `packages/cityverse-operator/src/analysis/projector.ts`
5. `packages/cityverse-operator/src/analysis/compare.ts`

## Required work

### A. Improve wind modeling
- replace or improve the current too-thin wind projection logic
- handle low/zero baseline wind output better

### B. Review solar interaction
- keep solar projection deterministic and explainable
- refine only if it clearly improves honesty/usefulness

### C. Improve result notes
- make energy scenario findings and limitations clearer

### D. Add tests
- especially for the cloud-plus-stronger-wind case
- especially for zero/near-zero baseline wind cases

### E. Update skill/docs if limitations or behavior change

## Hard rules

- do not mutate live state
- do not pretend to have full grid realism
- do not spread analysis logic out of `@cityverse/operator`
- do not hide assumptions

## Short conclusion

Make the energy side of Phase 2 more credible without turning it into a research grant.
