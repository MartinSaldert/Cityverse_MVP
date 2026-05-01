# Syntra Avatar Output Integration Plan

Date: 2026-04-30
Status: current implementation plan
Priority: high

## Goal

Make Syntra reply in the existing OpenClaw text chat **and** speak through the Unity avatar running on the workstation.

First target:

```text
Text chat input → Syntra reply on Mac mini → workstation bridge → TTS/static audio → Unity avatar playback/lipsync
```

This is an **output-first** integration.

## Why output-first is the right first slice

The demo environment may be noisy.
That makes microphone/STT less reliable than text input.

So the first production-worthy path should be:
- text input remains in OpenClaw chat
- avatar acts as a voice/rendering surface for Syntra replies
- STT is deferred until output is robust

This reduces demo risk while still making Syntra feel embodied.

## Scope of Phase 1

### In scope
- route Syntra reply text from the Mac mini to the bridge on the workstation
- generate TTS audio from that reply
- send a local `speak` command to the Unity avatar
- make the avatar play the audio with the existing lipsync path
- optionally mirror short captions/subtitles alongside speech

### Out of scope for Phase 1
- always-on listening
- room-noise-robust STT
- wake word detection
- direct avatar-side simulation control
- DT scene control from the avatar path
- replacing existing lipsync

## Current known facts

- `Unity_Projects/Avatar/Avatar_1` is the working avatar project.
- The avatar already has working audio playback and lipsync according to Martin.
- `Avatar_1` includes `WebSocketSharp`, making local WebSocket control practical.
- Syntra already exists as an OpenClaw agent.
- The Cityverse operator CLI already exists at `scripts/syntra-cityverse.mjs`.
- The current preferred runtime split is:
  - Mac mini: OpenClaw + Syntra
  - Workstation: Avatar Bridge + Unity Avatar + VC + IOT + DT

## Architecture

```text
User types in OpenClaw chat
    ↓
Syntra generates normal text reply on the Mac mini
    ↓
Reply relay / hook forwards reply text to the workstation Avatar Voice Bridge
    ↓
Avatar Voice Bridge creates or selects audio and hosts/locates it locally on the workstation
    ↓
Bridge sends `speak` message to Unity avatar
    ↓
Unity avatar plays audio and uses existing lipsync path
```

## Main components to implement

### 1. Syntra reply relay

Responsibility:
- observe or receive Syntra outbound text replies
- forward them from the Mac mini to the Avatar Voice Bridge on the workstation

Design requirements:
- should be session-specific or agent-specific, not global to every reply
- should preserve message text and optional metadata like tone/expression
- should fail safely: text chat must still work even if avatar output fails

### 2. Avatar Voice Bridge

Responsibility:
- receive Syntra reply payloads
- call TTS or map to a generated audio file
- expose audio file path/URL locally
- send avatar control messages to Unity

Suggested location:
- project-local Node service/script on the workstation in `voice/bridge/`

Suggested transport to Unity:
- local WebSocket

Suggested first payload:

```json
{
  "type": "speak",
  "utteranceId": "utt-20260430-001",
  "text": "Hello Martin. Syntra voice output is connected.",
  "audioUrl": "http://127.0.0.1:3099/audio/utt-20260430-001.wav",
  "expression": "neutral"
}
```

### 3. Unity avatar command receiver

Responsibility:
- listen for local bridge messages
- download/load audio
- play audio through existing avatar audio/lipsync path
- optionally change expression/state

Suggested component:
- `AvatarCommandReceiver.cs`

Suggested states:
- `idle`
- `thinking`
- `speaking`
- `happy`
- `neutral`
- `explaining`

## TTS strategy

### Recommendation for Phase 1
Start with whichever option gets sound out fastest.

Order:
1. local/static test WAV file to validate the bridge → avatar path
2. simple provider-backed TTS
3. voice quality polish after the path is reliable

### Noisy-room recommendation
The main problem in a noisy room is STT, not TTS.

For TTS in demos:
- use a clear, strong voice
- keep spoken replies short by default
- consider captions/subtitles as backup
- avoid long explanatory speeches unless invited

## Failure behavior

If avatar output fails:
- Syntra must still answer in text chat
- bridge errors should be visible in logs
- failure should not block the core OpenClaw reply path

If TTS fails:
- allow fallback to static test audio during debugging
- optionally allow avatar text-only mode later

## Phase breakdown

### Phase 1A — transport and playback proof
- define payload contract
- create bridge skeleton
- create Unity receiver skeleton
- validate a hardcoded local WAV file can be triggered from bridge to avatar

### Phase 1B — live TTS output
- bridge accepts text and produces audio
- avatar plays generated audio
- verify speech + lipsync for real Syntra reply content

### Phase 1C — Syntra runtime hookup
- connect Syntra/OpenClaw reply path on the Mac mini to the workstation bridge
- verify a real chat reply causes avatar speech
- ensure text chat remains primary control input

### Phase 1D — polish
- add expression hints
- optionally add subtitles/captions
- trim reply length for spoken delivery

## Acceptance criteria

Phase 1 is successful when:
1. Martin can chat with Syntra in text as normal
2. Syntra’s reply is forwarded from the Mac mini to the workstation avatar pipeline
3. the avatar speaks the reply aloud
4. existing lipsync still works
5. a bridge/avatar failure does not break the text reply path

## Follow-up after Phase 1

Only after output is reliable should we add:
- push-to-talk STT
- noise-handling strategy
- avatar input state transitions
- session routing for spoken input

## Key project references

- `docs/SYNTRA_OPENCLAW_AVATAR_VOICE_ARCHITECTURE.md`
- `docs/SYNTRA_MAC_MINI_TRAVEL_ARCHITECTURE.md`
- `docs/SYNTRA_AGENT_DESIGN.md`
- `docs/SYNTRA_KNOWLEDGE_MAP.md`
- `scripts/syntra-cityverse.mjs`
- `Unity_Projects/Avatar/Avatar_1`
