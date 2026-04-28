# Claude Kickoff: Cityverse AI Phase 2

Work in this repo:
- `~/ .openclaw/workspace-main/projects/Cityverse_MVP`

Your mission:
- implement Cityverse AI Phase 2 portable scenario analysis
- keep portability as a first-class requirement
- extend Phase 1 instead of replacing it
- leave the repo in a reviewable state

Read these first:
1. `docs/CLAUDE_PACKET_CITYVERSE_AI_PHASE2_SCENARIO_ANALYSIS.md`
2. `docs/CLAUDE_TASK_CITYVERSE_AI_PHASE2_IMPLEMENTATION.md`
3. `docs/CITYVERSE_AI_PORTABILITY_REQUIREMENTS.md`
4. `docs/CITYVERSE_AI_ARCHITECTURE.md`
5. `docs/CITYVERSE_AI_OPERATOR_API.md`

Then inspect current code under:
- `packages/cityverse-operator/src/`
- `openclaw-skill/cityverse/`

Important rules:
- do not mutate live VC state for branch evaluation
- do not invent unsupported DT/generator capabilities
- keep the analysis core in `@cityverse/operator`
- update the portable skill docs too
- add tests and a demo script
- verify with build/tests/demo before stopping

Deliver the smallest clean implementation that honestly satisfies the packet.
