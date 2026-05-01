# Cityverse MVP, Claude Task: Syntra Avatar Output Path

Date: 2026-04-30
Status: ready for delegation
Priority: high

## Mission

Implement the first robust output path so Martin can chat with Syntra in OpenClaw text chat on the Mac mini and have the Unity avatar on the workstation speak Syntra’s replies.

## Read first

1. `docs/SYNTRA_AVATAR_OUTPUT_INTEGRATION_PLAN.md`
2. `docs/SYNTRA_OPENCLAW_AVATAR_VOICE_ARCHITECTURE.md`
3. `docs/SYNTRA_MAC_MINI_TRAVEL_ARCHITECTURE.md`
4. `docs/SYNTRA_AGENT_DESIGN.md`
5. `docs/SYNTRA_KNOWLEDGE_MAP.md`
6. `scripts/syntra-cityverse.mjs`

## Required work

### A. Define the payload contract
Create or document the exact message shape between the local Avatar Voice Bridge and the Unity avatar.

Deliver:
- payload fields for `speak`
- any state messages needed (`thinking`, `idle`, etc.)
- clear transport choice (prefer local WebSocket)

### B. Build the Avatar Voice Bridge skeleton
Implement a small bridge service on the workstation side that can:
- receive text intended for avatar speech
- prepare an audio file path/URL
- send a command to Unity avatar

For the first milestone, a static test WAV is acceptable before provider-backed TTS.

### C. Build the Unity avatar receiver skeleton
In the Unity avatar project:
- add a minimal command receiver
- receive the bridge payload
- load and play audio through the existing audio/lipsync path
- keep the implementation minimal and safe

### D. Verify end-to-end output-only flow
Prove this path works:

```text
text reply payload → bridge → avatar command → audio playback in Unity avatar
```

### E. Do not take on STT yet
Do not expand scope into:
- always-on listening
- microphone capture
- wake word
- room-noise handling

This task is output-first only.

## Hard rules

- reuse the existing avatar audio/lipsync path; do not rebuild lipsync
- keep text chat as the primary input path
- do not let avatar/bridge own simulation truth or direct Cityverse control logic
- prefer local-only communication between bridge and avatar
- if avatar output fails, the core text reply path must still work
- the Mac mini remains the Syntra/OpenClaw host; the workstation remains the avatar/render host

## Deliverable format

Return:
1. changed files list
2. what was implemented in sections A–D
3. exact run/test steps
4. known limitations remaining
