# Tomorrow Start: OpenClaw Avatar Voice Integration

Date saved: 2026-04-29
Status: handoff note for next session

## Goal

Make the working Unity avatar project become the spoken/listening OpenClaw avatar for Syntra / Cityverse.

Trip deployment decision:

- Laptop host OS runs VC, IOT, Unity DT, Unity Avatar, and Avatar Voice Bridge.
- Linux VM on the same laptop runs OpenClaw Gateway, agents, sessions, and Cityverse skill.
- Mac mini is not part of the travel runtime.

The avatar should be an OpenClaw I/O surface:

- OpenClaw remains the brain/operator.
- Cityverse skill remains the Syntra control interface.
- VC/IOT/DT remain the source of truth.
- Unity Avatar renders, speaks, animates, and later listens.

## Confirmed working project

Use this Unity project:

```text
Unity_Projects/Avatar/Avatar_1
```

Martin confirmed this is the working avatar project.

## Current avatar facts

From Martin's Unity snapshot and project inspection:

- The avatar has VRM-style expression/phoneme states.
- Visible states include:
  - phonemes: `aa`, `ih`, `ou`, `ee`, `oh`
  - blink/look states: `blink`, `blinkLeft`, `blinkRight`, `lookUp`, `lookDown`, `lookLeft`, `lookRight`
  - emotions: `happy`, `sad`, `angry`, `surprised`, `relaxed`, `neutral`
- Martin reports that audio playback works.
- Martin reports that lipsync is working.
- The project includes the Looking Glass Plugin for the special 3D screen.
- The project includes bundled `WebSocketSharp`, which can be useful for local bridge communication.

Important implication:

> Do not start by rebuilding lipsync. Reuse the existing audio/lipsync path.

## Recommended architecture

```text
OpenClaw + Cityverse Skill
        ↓ reply text
Avatar Voice Bridge
        ↓ TTS audio + command
Unity Avatar executable
        ↓
Special 3D screen
```

Later input path:

```text
Microphone
        ↓
Avatar Voice Bridge STT
        ↓ transcript
OpenClaw avatar session
        ↓ reply
TTS → Unity Avatar speaks
```

## First build target

Before voice features, verify VM networking:

```text
Linux VM OpenClaw → laptop-host VC/IOT
Laptop host browser/bridge → Linux VM OpenClaw Gateway
```

Then build the smallest useful output path:

```text
OpenClaw text reply in VM → TTS/audio file on bridge → Unity Avatar speaks it
```

Do not start with always-on listening. Push-to-talk/STT comes after speech output works.

## Unity-side first task

In `Avatar_1`, add a minimal avatar command receiver.

Suggested component name:

```text
AvatarCommandReceiver.cs
```

Responsibilities:

1. Receive a local command from the bridge.
2. Load/download an audio file.
3. Play it through the existing `AudioSource` / lipsync setup.
4. Optionally set an expression/state such as `happy`, `neutral`, `thinking`, or `speaking`.

Suggested first command shape:

```json
{
  "type": "speak",
  "utteranceId": "test-001",
  "text": "Hello Martin. Syntra voice output is connected.",
  "audioUrl": "http://127.0.0.1:3099/audio/test.wav",
  "expression": "happy"
}
```

Use WebSocket if convenient because WebSocketSharp is already present. HTTP polling is acceptable for the very first test if it is faster.

## Bridge-side first task

Create a small local service, probably Node or Python, tentatively:

```text
syntra-avatar-voice-bridge
```

Responsibilities for first version:

1. Accept text to speak.
2. Generate or provide a test audio file.
3. Serve audio files locally.
4. Send `speak` command to Unity Avatar.

First milestone can use a static `.wav` file before real TTS. Then add TTS provider.

## TTS/STT placement decision

TTS/STT should not live inside Unity.

They should live in the Avatar Voice Bridge or use OpenClaw's existing TTS/audio facilities.

Recommended order:

### TTS
1. ElevenLabs if voice quality/personality matters most.
2. OpenAI TTS if simplicity matters most.
3. Azure Speech if enterprise-style stability matters.
4. Local CLI/Microsoft as fallback/prototype.

### STT
1. OpenAI transcription for simple first implementation.
2. Deepgram if low-latency streaming becomes important.
3. Local Whisper/whisper.cpp if offline matters.

## OpenClaw / Cityverse integration

Once avatar speech works:

1. Bind a dedicated OpenClaw avatar/Syntra session.
2. Make OpenClaw replies in that session route to the Avatar Voice Bridge.
3. Ensure the Cityverse skill is active for that session.
4. Test spoken Syntra questions, for example:
   - "What is the current weather in the city?"
   - "Why is energy demand high?"
   - "Pause the simulation."

The Cityverse skill must remain the control interface. The voice bridge should not directly mutate VC/IOT/DT state.

## Safety rule

For simulation-changing voice commands:

- OpenClaw should classify as `control`.
- Read current state first.
- Call explicit VC tool/API command.
- Confirm with command result / command ID.
- Then avatar speaks the confirmation.

## What not to do first

Do not begin with:

- always-on listening
- rebuilding lipsync
- direct voice bridge calls to VC controls
- merging avatar into the city Unity project
- making the avatar app own Cityverse/Syntra logic

That path is tempting, and therefore suspicious.

## Existing docs to continue from

Primary architecture doc:

```text
docs/SYNTRA_OPENCLAW_AVATAR_VOICE_ARCHITECTURE.md
```

Trip deployment doc:

```text
docs/TRIP_DEPLOYMENT_OPENCLAW_VM.md
```

Current system status doc:

```text
docs/CURRENT_IMPLEMENTATION_STATUS.md
```

## Best first test tomorrow

1. Start/inspect the Linux VM.
2. Find the laptop-host address from inside the VM.
3. Verify VM can call laptop-host VC/IOT health endpoints.
4. Verify laptop host can reach OpenClaw Gateway in VM, preferably through port forwarding.
5. Open `Unity_Projects/Avatar/Avatar_1`.
6. Identify the existing audio/lipsync component and `AudioSource`.
7. Add a tiny test receiver or inspector button that plays a known local audio clip through that same path.
8. If lipsync responds, add bridge command input.
9. Only after that, connect real TTS.

Short version:

> First make the avatar speak a file on command. Then make OpenClaw generate that file. Then add ears.
