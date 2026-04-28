# Claude Kickoff: Cityverse AI Phase 2.5 Energy Modeling

Work in this repo:
- `~/.openclaw/workspace-main/projects/Cityverse_MVP`

Your mission:
- improve the weakest parts of the Phase 2 energy/weather projection model
- especially fix the thin wind modeling and near-zero baseline wind behavior
- preserve deterministic in-memory analysis and portability
- leave the repo in a reviewable state

Read these first:
1. `docs/CLAUDE_PACKET_CITYVERSE_AI_PHASE2_5_ENERGY_MODELING.md`
2. `docs/CLAUDE_TASK_CITYVERSE_AI_PHASE2_5_ENERGY_MODELING.md`
3. `docs/CLAUDE_PACKET_CITYVERSE_AI_PHASE2_SCENARIO_ANALYSIS.md`
4. `docs/CITYVERSE_AI_PORTABILITY_REQUIREMENTS.md`
5. `packages/cityverse-operator/src/analysis/projector.ts`
6. `packages/cityverse-operator/src/analysis/compare.ts`
7. `openclaw-skill/cityverse/SKILL.md`

Important rules:
- do not mutate live VC state
- do not move analysis logic out of `@cityverse/operator`
- do not claim full grid realism you do not have
- improve honesty/usefulness for cloud-plus-stronger-wind cases
- add focused tests
- verify with build/tests/demo before stopping

Deliver the smallest clean implementation that makes Phase 2 energy answers more credible without turning the repo into a thesis defense.
