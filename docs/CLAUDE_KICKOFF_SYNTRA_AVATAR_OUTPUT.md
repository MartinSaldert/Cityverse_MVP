# Claude Kickoff: Syntra Avatar Output Path

You are working in the Cityverse MVP repo.

## Goal
Make Syntra able to speak through the Unity avatar on the Mac mini while Martin continues chatting with Syntra through normal OpenClaw text chat.

This is an **output-only first implementation**.
Do not take on STT or microphone input yet.

## Read first
1. `docs/CLAUDE_TASK_SYNTRA_AVATAR_OUTPUT.md`
2. `docs/SYNTRA_AVATAR_OUTPUT_INTEGRATION_PLAN.md`
3. `docs/SYNTRA_OPENCLAW_AVATAR_VOICE_ARCHITECTURE.md`
4. `docs/SYNTRA_MAC_MINI_TRAVEL_ARCHITECTURE.md`

## What matters most
- smallest end-to-end working path
- reuse existing avatar audio/lipsync
- keep text chat as primary input
- keep the architecture clean
- make the bridge/avatar path fail-safe

## Preferred first milestone
A hardcoded or static WAV triggered from a local bridge into the Unity avatar is acceptable before full TTS.

## Suggested implementation order
1. define payload schema
2. implement bridge skeleton
3. implement Unity receiver skeleton
4. validate bridge → avatar audio playback
5. then identify the cleanest reply-hook path for Syntra/OpenClaw

## Deliver back
- changed files
- what works now
- how to run it
- what still needs wiring
