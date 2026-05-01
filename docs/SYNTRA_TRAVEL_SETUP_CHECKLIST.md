# Syntra Travel Setup Checklist

Date: 2026-04-30
Status: operational checklist for Mac mini + workstation deployment

## Target topology

```text
Mac mini:
  OpenClaw + Syntra

Workstation:
  Avatar Bridge + Unity Avatar + VC + IOT + DT
```

## 1. Physical / gear

- [ ] Mac mini packed
- [ ] Mac mini power supply packed
- [ ] workstation packed / available
- [ ] required display/cables/adapters for Mac mini packed
- [ ] 3D display hardware packed
- [ ] network accessories packed if needed (router/switch/ethernet adapters)
- [ ] microphone/audio hardware packed if required

## 2. Workstation simulation/avatar stack

- [ ] VC starts locally on workstation
- [ ] IOT starts locally on workstation
- [ ] DT / Unity Cityverse scene starts on workstation
- [ ] Unity Avatar project/executable starts on workstation
- [ ] 3D display path works on workstation
- [ ] Avatar Voice Bridge starts on workstation
- [ ] existing audio playback/lipsync path still works
- [ ] workstation local checks succeed:
  - [ ] `http://127.0.0.1:3001/health`
  - [ ] `http://127.0.0.1:3002/health`
- [ ] note the workstation LAN IP address

## 3. Mac mini OpenClaw stack

- [ ] OpenClaw Gateway starts on Mac mini
- [ ] `Syntra` agent exists or is created
- [ ] Cityverse skill is available on Mac mini runtime
- [ ] provider/model credentials are present
- [ ] Cityverse env vars point to workstation LAN IP, not localhost

Example:

```bash
CITYVERSE_VC_BASE_URL=http://<workstation-ip>:3001
CITYVERSE_IOT_BASE_URL=http://<workstation-ip>:3002
CITYVERSE_DT_BASE_URL=http://<workstation-ip>:3003
```

## 4. Cross-machine networking

From Mac mini:

- [ ] can reach workstation VC health endpoint
- [ ] can reach workstation IOT health endpoint
- [ ] can reach workstation DT endpoint if needed

From workstation:

- [ ] can reach OpenClaw Gateway on Mac mini if needed for avatar reply hookup

Suggested checks:

```bash
curl http://<workstation-ip>:3001/health
curl http://<workstation-ip>:3002/health
curl http://<mini-ip>:18789/healthz
```

If these fail, fix LAN/networking before debugging Syntra.

## 5. Syntra agent verification

- [ ] Syntra session responds in text
- [ ] Syntra can answer a simple Cityverse read query
- [ ] Syntra can distinguish inspect vs control requests
- [ ] Syntra uses Cityverse tooling rather than invented state

Suggested tests:

- [ ] “What is the current weather?”
- [ ] “Why is demand high?”
- [ ] “Pause the simulation.”

## 6. Avatar output path

- [ ] OpenClaw reply reaches workstation Avatar Voice Bridge
- [ ] bridge generates or serves audio
- [ ] avatar receives speak command
- [ ] avatar plays audio successfully
- [ ] lipsync still works during playback
- [ ] expression/state changes work if implemented

## 7. Demo readiness

- [ ] one reliable end-to-end read query works
- [ ] one reliable control query works
- [ ] spoken output is audible and understandable
- [ ] system can recover from one restart of either machine
- [ ] startup order is documented for quick recovery

## 8. Recovery notes

If something breaks, check in this order:

1. workstation VC/IOT health
2. Mac mini → workstation network reachability
3. workstation → Mac mini OpenClaw reachability
4. OpenClaw Gateway on Mac mini
5. Syntra session/tool access
6. workstation Avatar Voice Bridge
7. workstation Unity Avatar playback/lipsync

Networking first. Heroics later.

## 9. Nice-to-have after core success

- [ ] push-to-talk microphone input
- [ ] STT path into Syntra session
- [ ] richer avatar expressions/gestures
- [ ] DT-linked presentation actions
- [ ] fallback text UI if avatar path fails
