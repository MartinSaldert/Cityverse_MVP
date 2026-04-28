# Claude Kickoff: Cityverse AI Phase 3 Implementation

Work in this repo:
- `~/.openclaw/workspace-main/projects/Cityverse_MVP`

Your mission:
- implement Phase 3 so Cityverse AI is truly runnable end-to-end in OpenClaw
- enforce explicit action guardrails
- provide canonical operator flow behavior
- handle degraded service modes cleanly
- prove readiness with acceptance checks

Read these first (in order):
1. `docs/CLAUDE_PACKET_CITYVERSE_AI_PHASE3_IMPLEMENTATION.md`
2. `docs/CLAUDE_TASK_CITYVERSE_AI_PHASE3_IMPLEMENTATION.md`
3. `docs/CITYVERSE_AI_MASTER_ROADMAP.md`
4. `docs/CITYVERSE_AI_PORTABILITY_REQUIREMENTS.md`
5. `openclaw-skill/cityverse/SKILL.md`
6. `packages/cityverse-tool-surface/src/index.ts`
7. `packages/cityverse-operator/src/index.ts`

Hard rules:
- keep business logic in `@cityverse/operator`
- keep hypothetical analysis deterministic and non-live
- do not hardcode machine-specific paths
- do not claim unsupported DT/generator features
- preserve stable Cityverse tool names

Deliverables:
- changed files implementing Phase 3 sections A-E
- concise verification summary with commands and pass/fail
- clear list of remaining limitations

You are expected to finish in a reviewable state, not hand back a philosophical weather report.
