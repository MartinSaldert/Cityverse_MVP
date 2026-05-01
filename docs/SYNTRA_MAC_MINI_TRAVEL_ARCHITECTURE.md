# Syntra Travel Architecture: Mac mini + Workstation Split

Date: 2026-04-30
Status: current recommended travel architecture
Supersedes: `TRIP_DEPLOYMENT_OPENCLAW_VM.md` for the preferred demo/travel runtime

## Decision

For travel/demo use, the runtime is split across two physical machines:

```text
Mac mini
  - OpenClaw Gateway
  - Syntra agent/sub-agent
  - Cityverse skill
  - model/provider configuration
  - VC
  - IOT
  - Avatar Voice Bridge

Workstation
  - Unity Avatar / 3D display runtime
  - DT / Cityverse Unity scene if needed there
```

The earlier Linux-VM-on-laptop deployment remains a fallback option, but it is no longer the preferred setup.

## Why this is the better split now

This layout preserves the important architecture boundaries while avoiding the current blocker with the 3D display on the Mac mini.

- **Mac mini** becomes the Syntra/OpenClaw brain box.
- **Mac mini** keeps the existing service/runtime scripts in one place.
- **Workstation** handles the display-dependent avatar path.
- VC/IOT do not need to be moved during demo prep.
- The workstation becomes mostly a render/playback client for the avatar side.

In short: the Mac thinks and orchestrates; the workstation shows the face.

## Runtime ownership

### Mac mini owns
- OpenClaw Gateway and sessions
- `Syntra` agent runtime
- Cityverse tool/skill access
- operator reasoning and orchestration
- VC simulation truth
- IOT telemetry/current-state/history APIs
- Avatar Voice Bridge

### Workstation owns
- Unity avatar rendering on the 3D display
- DT / Unity city visualization if needed there
- avatar playback client / command receiver

## Core architecture rule

The avatar is still an **OpenClaw I/O surface**, not the system of record.

Recommended principle:

> OpenClaw thinks on the Mac mini. Cityverse services own truth on the workstation. The workstation also renders the avatar and city.

## Network topology

Both machines should be on the same reliable local network.

Recommended addressing model:

- Give the **Mac mini** a stable/private LAN IP if possible.
- Let the workstation reach the Mac mini bridge/audio endpoints over LAN.
- Keep OpenClaw on the Mac mini private unless a remote client truly needs access.

Example service map:

```text
Mac mini VC:               http://127.0.0.1:3001
Mac mini IOT:              http://127.0.0.1:3002
Mac mini Avatar Bridge:    http://<mini-ip>:3099
Mac mini OpenClaw Gateway: http://<mini-ip>:18789

Workstation Avatar WS:     ws://127.0.0.1:8787/avatar
Workstation DT:            http://<workstation-ip>:3003   (only if needed)
```

## Cityverse skill configuration on Mac mini

When OpenClaw/Cityverse runs on the Mac mini and VC/IOT also remain on the Mac mini, keep those service URLs local where possible.

Example environment:

```bash
export CITYVERSE_VC_BASE_URL="http://127.0.0.1:3001"
export CITYVERSE_IOT_BASE_URL="http://127.0.0.1:3002"
export CITYVERSE_DT_BASE_URL="http://<workstation-ip>:3003"   # only if DT stays on workstation
```

Use LAN IPs only for services that truly live on the other machine.

## Avatar path

### Output path

```text
User / operator request
  → OpenClaw on Mac mini
  → Syntra agent uses Cityverse skill
  → reply text / action metadata
  → Mac mini Avatar Voice Bridge
  → audio URL + avatar command over LAN
  → Unity Avatar on workstation
  → 3D display
```

### Input path (later, if added)

```text
Microphone on/near workstation
  → Avatar Voice Bridge STT
  → OpenClaw Gateway / Syntra session on Mac mini
  → Cityverse skill/tools against workstation VC/IOT/DT
  → reply text
  → TTS
  → Unity Avatar speaks
```

## Why this is better than the previous Mac-mini-avatar plan

Compared with moving the whole Cityverse runtime to the workstation, this approach improves:

- **lower migration risk during demo prep**
- **keeps known-good service scripts on the Mac mini**
- **still solves the Looking Glass/Mac display problem**

It trades that for:
- one cross-machine hop from Mac bridge → workstation avatar

That is a much better bargain.

## Security / exposure rule

- Prefer a trusted private LAN.
- Do not expose unauthenticated OpenClaw or control surfaces broadly.
- If any service binds beyond loopback, confirm auth and firewall posture.
- Keep avatar-local control endpoints loopback-only unless there is a specific reason not to.

## Recommended startup order

1. Start Mac mini VC.
2. Start Mac mini IOT.
3. Start Mac mini Avatar Voice Bridge.
4. Start Mac mini OpenClaw Gateway.
5. Start Syntra agent/session environment.
6. Start workstation Unity Avatar / 3D display runtime.
7. Start workstation DT / Unity city scene if needed.
8. Verify workstation can reach the Mac mini bridge/audio endpoint.
9. Verify voice/output path from OpenClaw → Mac bridge → workstation avatar.

## First verification checks

From the Mac mini:

```bash
curl http://127.0.0.1:3001/health
curl http://127.0.0.1:3002/health
curl http://127.0.0.1:3099/health
```

From the workstation:

```bash
curl http://<mini-ip>:3099/health
```

If those fail, stop there and fix networking before touching OpenClaw, STT, or TTS.

## First implementation target

The first meaningful milestone is still:

```text
OpenClaw reply text on Mac mini → Mac mini Avatar Voice Bridge → workstation Unity Avatar speaks
```

Do not begin with:

- always-on listening
- replacing working lipsync
- direct bridge writes to VC/IOT/DT control APIs
- merging the avatar into the DT Unity project

## Fallback plan

If travel/network conditions make the two-machine split unreliable, the VM-on-laptop plan remains the fallback architecture.

But the preferred plan is now Mac mini runtime + workstation avatar/display split.
