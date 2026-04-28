# Claude Kickoff: Cityverse AI OpenClaw Tool Surface

Work in this repo:
- `~/.openclaw/workspace-main/projects/Cityverse_MVP`

Your mission:
- implement the real OpenClaw-facing tool surface for Cityverse
- keep the wrapper layer thin
- keep business logic in `@cityverse/operator`
- preserve portability across OpenClaw installs
- leave the repo in a reviewable state

Read these first:
1. `docs/CLAUDE_PACKET_CITYVERSE_AI_OPENCLAW_TOOL_SURFACE.md`
2. `docs/CLAUDE_TASK_CITYVERSE_AI_OPENCLAW_TOOL_SURFACE.md`
3. `docs/CITYVERSE_AI_OPERATOR_API.md`
4. `docs/CITYVERSE_AI_PORTABILITY_REQUIREMENTS.md`
5. `openclaw-skill/cityverse/SKILL.md`
6. `packages/cityverse-operator/src/index.ts`

Important rules:
- do not move Cityverse business logic out of `@cityverse/operator`
- do not broaden the live command surface beyond the approved Phase 1 controls
- do not hardcode local machine paths
- do not treat demo scripts as the primary product surface
- update skill docs to reflect the real tool names and usage
- verify with build/tests/integration before stopping

Deliver the smallest clean implementation that gives Cityverse a real OpenClaw-facing inspect/control/analyze/docs-search tool surface.
