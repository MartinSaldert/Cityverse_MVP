# Syntra / Cityverse OpenClaw Avatar Voice Architecture

Date: 2026-04-29
Status: recommended integration plan

## Purpose

Define the best first architecture for making the Syntra system — VC + IOT + DT-in-Unity — work with:

- OpenClaw as the AI/operator brain
- the Cityverse OpenClaw skill as the Syntra control interface
- STT/TTS voice I/O
- a separate Unity VRM avatar executable on a special 3D display

## Current system facts

The existing Cityverse/Syntra architecture already separates runtime ownership:

- **VC** owns simulation truth: clock, weather, energy, city/building behavior, simulation-changing commands.
- **IOT** owns telemetry ingest/current projections/history-facing state.
- **DT** owns twin graph/scene composition and Unity-facing presentation, though the separate DT service is not yet fully implemented.
- Current Unity DT view polls IOT directly for `/weather/current`, `/energy/current`, `/demand/current`, `/city/current`, and `/buildings/current`.
- The Cityverse OpenClaw skill already defines tool semantics for VC/IOT reads, safe VC controls, scenario analysis, docs search, and explicit unsupported DT commands.
- The working avatar Unity project is `Unity_Projects/Avatar/Avatar_1`.
- `Avatar_1` includes the Looking Glass plugin and bundled `WebSocketSharp`, which is useful for the 3D display target and local bridge control.
- The avatar scene snapshot shows VRM-style expression/phoneme states including `aa`, `ih`, `ou`, `ee`, `oh`, blink/look states, and emotion states such as `happy`, `sad`, `angry`, and `surprised`.
- Martin reports that audio playback and lipsync are already working in the avatar project; therefore the first integration should reuse that existing lipsync path rather than replacing it.

## Core decision

The avatar should be an **OpenClaw I/O surface**, not the Syntra brain and not the DT brain.

Recommended principle:

> OpenClaw thinks and operates. Syntra services own truth. Unity DT visualizes the city. Unity Avatar speaks and listens.

## Recommended runtime components

```text
[Microphone]
    ↓
[Avatar Voice Bridge]
    - wake/listen/session routing
    - STT capture/transcription
    - sends transcript into OpenClaw session
    - receives assistant replies/events
    - TTS generation or TTS file pickup
    - sends speak/listen/thinking commands to avatar
    ↓                          ↑
[OpenClaw Gateway + Agent + Cityverse Skill]
    - routes user utterances to the correct agent/session
    - uses cityverse.* tools for VC/IOT/DT interaction
    - returns answer text + optional action metadata
    ↓ tools/API calls          ↑ state
[Syntra VC / IOT / DT services]
    - VC simulation truth + commands
    - IOT telemetry and projected current state
    - DT twin graph/scene projections when available

[Unity Avatar Executable]
    - VRM render on special 3D screen
    - audio playback
    - lip sync / visemes
    - expression/gesture states

[Unity DT Executable / Scene]
    - City/twin visualization
    - building/weather/energy HUD
    - polls or subscribes to IOT/DT state
```

## Why this is the best split

### 1. OpenClaw stays the operator brain

The Cityverse skill already gives OpenClaw the right discipline:

- classify requests as explain / inspect / control / analyze
- read current VC/IOT state before control actions
- use explicit VC commands for mutations
- avoid hallucinating state
- report command IDs for audit
- use scenario analysis for hypotheticals

Voice should feed into this same operator path, not bypass it.

### 2. Syntra services remain authoritative

Do not let the avatar app or voice bridge directly modify simulation truth except through OpenClaw/tool-authorized APIs. Otherwise the nice architecture quietly becomes a bucket of snakes with a microphone.

Allowed direct paths:

- DT Unity reads IOT/DT for visualization.
- Avatar Unity receives presentation commands only.
- Voice bridge sends user transcripts to OpenClaw and receives assistant output.

Restricted path:

- Voice bridge should not directly call VC/IOT/DT control commands as the main control layer.

### 3. Unity avatar remains a renderer

The avatar executable should own visual embodiment only:

- VRM setup
- display/camera/framing for the 3D screen
- idle/listening/thinking/speaking animation states
- audio playback
- lip sync from audio amplitude first, better visemes later
- expression/gesture triggers from OpenClaw/bridge metadata

It should not own STT, TTS provider credentials, Cityverse logic, or operator rules.

## STT recommendation

For the first version, run STT in the **Avatar Voice Bridge** or OpenClaw audio media path.

Recommended first implementation:

- local bridge captures mic audio
- transcribes with one configured provider/model
- sends transcript as a normal inbound message into a dedicated OpenClaw avatar/session route

Provider order to evaluate:

1. OpenAI `gpt-4o-mini-transcribe` / `gpt-4o-transcribe` for simplicity and accuracy
2. Deepgram for low-latency streaming if we need fast always-on voice
3. local Whisper/whisper.cpp if offline operation matters more than latency/accuracy

## TTS recommendation

For the first version, TTS should be produced by OpenClaw TTS or by the Avatar Voice Bridge using the same configured voice persona.

Recommended first implementation:

- OpenClaw produces assistant text normally
- bridge intercepts/subscribes to outbound replies for the avatar session
- bridge calls TTS provider
- bridge sends `{ type: "speak", text, audioUrl/audioPath, expression }` to Unity avatar

Provider order to evaluate:

1. ElevenLabs if voice quality/personality is the priority
2. OpenAI TTS if simplicity and ecosystem consistency matter
3. Azure Speech if enterprise-style stability and language/voice control matter
4. local CLI/Microsoft Edge TTS only as fallback/prototype

## Avatar control protocol

Use a small local WebSocket server/client pair. WebSocket is better than plain HTTP here because the avatar needs live state changes:

- listening
- thinking
- speaking
- interrupted
- idle
- expression/gesture events

Example message from bridge to avatar:

```json
{
  "type": "speak",
  "utteranceId": "utt-20260429-001",
  "text": "Solar output is low because cloud cover is high and it is late in the simulated day.",
  "audioUrl": "http://127.0.0.1:3099/audio/utt-20260429-001.wav",
  "expression": "explaining",
  "gesture": "present",
  "sourceSession": "openclaw-avatar"
}
```

Example state message:

```json
{
  "type": "state",
  "state": "listening"
}
```

## OpenClaw / Cityverse skill integration

The Cityverse skill remains the interface for Syntra operations. Voice does not require a separate Cityverse brain.

Voice user says:

> Why is the factory using so much power?

Flow:

1. Voice bridge captures mic audio.
2. STT produces transcript.
3. Transcript is sent into OpenClaw avatar session.
4. Cityverse skill classifies as `inspect` or diagnosis.
5. OpenClaw calls `cityverse.iot.get_buildings`, possibly weather/energy/city reads.
6. OpenClaw replies with evidence-based explanation.
7. TTS produces audio.
8. Avatar speaks the reply and optionally gestures toward DT.

Voice user says:

> Pause the simulation.

Flow:

1. STT -> OpenClaw.
2. Skill classifies as `control`.
3. OpenClaw reads current state.
4. OpenClaw calls `cityverse.vc.pause`.
5. OpenClaw confirms with command result.
6. Avatar speaks confirmation.

## DT-in-Unity interaction

There are two sensible levels of avatar ↔ DT integration.

### Phase A: loose coupling

Avatar does not control Unity DT directly. It only speaks OpenClaw replies.

DT Unity continues to poll IOT/DT and update city HUD.

This is the first implementation target.

### Phase B: coordinated presentation

OpenClaw/bridge can also send presentation hints to DT Unity:

```json
{
  "type": "focus_entity",
  "entityId": "factory-01",
  "reason": "assistant_explaining"
}
```

The correct future owner for this is the DT service/tool surface, but until DT is implemented, a local Unity presentation bridge can handle non-authoritative focus/highlight events.

Important: focus/highlight is presentation, not simulation truth.

## Deployment recommendation

For MVP, run these as separate processes on the same machine:

- `cityverse-vc`
- `cityverse-iot`
- future `cityverse-dt` or current Unity DT scene
- `openclaw gateway`
- `syntra-avatar-voice-bridge`
- Unity Avatar executable

This preserves failure isolation:

- avatar can crash without stopping simulation
- voice can fail without breaking DT visualization
- VC/IOT keep running without OpenClaw
- OpenClaw can answer text even if avatar display is offline

## Implementation phases

### Phase 1: Text-to-avatar output

Goal: all OpenClaw replies in the avatar session are spoken by the avatar.

Deliver:

- Unity Avatar executable with WebSocket listener
- bridge command: `speak(text, audioPath)`
- TTS provider configured
- basic audio playback and amplitude lip sync
- states: idle, thinking, speaking

### Phase 2: Mic-to-OpenClaw input

Goal: speak to the avatar and have it route to OpenClaw.

Deliver:

- bridge microphone capture
- push-to-talk or wake/listen mode
- STT transcription
- send transcript into OpenClaw avatar session
- interrupt/stop speaking behavior

### Phase 3: Cityverse/Syntra tool flow

Goal: voice asks questions and controls Syntra through Cityverse skill.

Deliver:

- install/register Cityverse skill cleanly
- confirm `cityverse.system.status`
- inspect VC/IOT from voice
- safe command execution from voice
- spoken command confirmations with command IDs

### Phase 4: DT presentation coordination

Goal: spoken explanations can point the city visualization at the relevant entity.

Deliver:

- presentation event contract
- Unity DT focus/highlight receiver
- optional OpenClaw tool or bridge API for non-authoritative focus commands
- later replace with proper DT service API

## Recommended first prototype

Build this first:

```text
OpenClaw reply text → bridge TTS → Unity Avatar speaks
```

Then add:

```text
Mic → bridge STT → OpenClaw avatar session → Cityverse skill/tools → avatar TTS reply
```

Do **not** start by putting STT/TTS inside Unity or letting the avatar directly call VC/IOT controls. That would work quickly, then punish us later. Groo would approve; architecture would not.

## Open questions

- Which TTS voice/provider should become the official Syntra/OpenClaw avatar voice?
- Should the avatar listen always-on, push-to-talk, or wake-word first?
- Is the 3D screen driven by the same machine or another networked machine?
- Should the avatar session be bound to Groo, The Sage, or a dedicated Syntra operator agent?
- Should all OpenClaw sessions speak through the avatar, or only a dedicated avatar/Syntra session?

## Current recommendation answers

- Use a dedicated avatar/Syntra session first, not every OpenClaw message globally.
- Use push-to-talk first to avoid accidental controls.
- Use WebSocket bridge between voice service and Unity avatar.
- Keep Cityverse skill as the only authoritative AI interface to Syntra.
- Treat Unity avatar and Unity DT as separate executables/processes.

## Next-session handoff

A concise next-session start note has been saved here:

```text
docs/TOMORROW_START_OPENCLAW_AVATAR_VOICE.md
```

Use that as the first checklist before continuing implementation.

## Travel deployment update — 2026-04-30

For the trip, the Mac mini is not part of the runtime.

Use this topology instead:

```text
Laptop host OS
  - VC
  - IOT
  - Unity DT / Cityverse scene
  - Unity Avatar / Avatar_1
  - Avatar Voice Bridge

Linux VM on same laptop
  - OpenClaw Gateway
  - agents/sessions
  - Cityverse skill
```

The primary new constraint is networking: from inside the Linux VM, `localhost` is the VM, not the laptop host. Cityverse skill URLs must point to the laptop-host address as seen from the VM, for example `http://10.0.2.2:3001` / `http://10.0.2.2:3002` if that is the VM host gateway.

Detailed deployment note:

```text
docs/TRIP_DEPLOYMENT_OPENCLAW_VM.md
```
