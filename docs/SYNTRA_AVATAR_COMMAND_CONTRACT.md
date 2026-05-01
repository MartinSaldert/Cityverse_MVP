# Syntra Avatar Command Contract

Date: 2026-04-30
Status: first working contract

## Goal

Define the thinnest practical contract between:
- **Syntra/OpenClaw side** on the Mac mini
- **Avatar Bridge** on the workstation
- **Unity Avatar receiver** on the workstation

The first slice is **output-only**.

## Runtime split

```text
Mac mini
  Syntra / OpenClaw
    -> sends text-for-speech requests
  Avatar Bridge (Node)
    -> turns request into avatar command
    -> hosts or references audio
    -> sends command over LAN to Unity

Workstation
  Unity Avatar receiver
    -> loads audio
    -> calls existing TalkingHeadPlayer
    -> existing lipsync path handles the mouth
```

## Why this contract is deliberately boring

Because the avatar already has a working playback/lipsync path.
The clean job is not to rebuild speech inside Unity.
It is to hand Unity a URL to playable audio and a tiny amount of expression metadata.

## Bridge ingest API on the Mac mini

### Health
`GET /health`

Response:
```json
{
  "ok": true,
  "bridgePort": 3099,
  "unityWsUrl": "ws://127.0.0.1:8787/avatar",
  "wsConnected": true
}
```

### Speak
`POST /speak`

Request body:
```json
{
  "text": "Hello Martin. Syntra voice output is connected.",
  "utteranceId": "utt-001",
  "expression": "relaxed",
  "emotionWeight": 0.5,
  "audioFile": "/absolute/path/to/file.mp3"
}
```

Minimum useful body:
```json
{
  "text": "Hello Martin.",
  "audioFile": "/absolute/path/to/file.mp3"
}
```

For the first bridge skeleton, `audioFile` may be omitted and the bridge can fall back to a configured static test audio file.

### Stop
`POST /stop`

Request body: empty

## Unity WebSocket command

The bridge sends JSON text frames to Unity over WebSocket.

Default Unity receiver URL from the Mac bridge:
- `ws://<workstation-ip>:8787/avatar`

### Speak command
```json
{
  "type": "speak",
  "utteranceId": "utt-001",
  "text": "Hello Martin. Syntra voice output is connected.",
  "audioUrl": "http://<mini-ip>:3099/audio/utt-001.mp3",
  "expression": "relaxed",
  "emotionWeight": 0.5
}
```

### Stop command
```json
{
  "type": "stop"
}
```

## Expression vocabulary

Keep the first set tiny:
- `neutral`
- `relaxed`
- `happy`
- `sad`
- `angry`
- `surprised`
- `thinking`
- `explaining`

For now, `thinking` and `explaining` can map to `relaxed` in Unity.

## Unity-side behavior

On `speak`:
1. download/load audio clip from `audioUrl`
2. map `expression` to `CrabFaceBlendShapeController.Emotion`
3. call `TalkingHeadPlayer.Speak(...)`
4. let existing audio/lipsync path do the rest

On `stop`:
1. stop current playback
2. return face/pose to idle/neutral

## Syntra hookup recommendation

Do this in two steps.

### Step 1: prove Mac bridge -> workstation avatar path
Manually send bridge requests with curl or a tiny helper script.

### Step 2: add Syntra reply relay on the Mac mini
Once that path is stable, add a small Syntra/OpenClaw-side relay that POSTs selected replies to the local Mac bridge.

That relay should:
- be agent-specific or session-specific
- fail open (text chat still works if avatar path fails)
- keep spoken replies shorter than normal text replies when appropriate

## Non-goals for this contract

Not yet:
- STT
- wake words
- live viseme streaming
- full animation state machines
- simulation control from avatar runtime

Wisdom occasionally means refusing more scope.
