# Cityverse MVP, PC Handoff Checklist

Date: 2026-04-17
Status: ready for first PC attempt

## Project root
Use this folder on the PC:

`/Users/martinsaldert/.openclaw/workspace-main/projects/Cityverse_MVP`

On Windows, use the equivalent copied project location.

## What is implemented for the first PC test

### VC
- simulation clock
- weather runtime
- simple browser UI
- `/health`
- `/api/clock`
- `/api/weather/current`
- `/api/weather/nudge`
- MQTT weather publish code

### IOT
- `/health`
- MQTT weather ingest
- in-memory latest weather state
- `/weather/current`

### Unity
- polling weather receiver scripts
- debug/log output
- optional light reaction

## Required external dependency

You need a local MQTT broker.

Recommended:
- Mosquitto

Expected broker URL:
- `mqtt://localhost:1883`

## PC run order

1. install Node.js
2. install Unity
3. install Mosquitto
4. install dependencies with pnpm
5. build project
6. start broker
7. start VC
8. start IOT
9. verify browser endpoints
10. test Unity receiver

## Commands

### Install tools
```bash
corepack enable
corepack prepare pnpm@10.8.1 --activate
pnpm install
pnpm build
```

### Start VC
```bash
pnpm start:vc
```

### Start IOT
```bash
pnpm start:iot
```

## Browser checks

### VC
- `http://localhost:3001/`
- `http://localhost:3001/health`
- `http://localhost:3001/api/clock`
- `http://localhost:3001/api/weather/current`

### IOT
- `http://localhost:3002/health`
- `http://localhost:3002/weather/current`

## Expected result

After broker + VC + IOT are all running:
- VC UI should load
- VC weather should update
- IOT should eventually return `ok: true` from `/weather/current`
- Unity should be able to poll from `http://localhost:3002/weather/current`

## What to report if something breaks

Please capture:
- exact terminal output from VC
- exact terminal output from IOT
- whether Mosquitto is running
- response body from `http://localhost:3002/weather/current`
- Unity Console errors if any

## Most likely failure causes

### IOT returns no telemetry
- broker not running
- VC not connected to broker
- port 1883 blocked or different

### Unity gets no updates
- wrong base URL
- IOT not receiving telemetry
- firewall issue

### VC UI loads but chain is dead
- MQTT path broken

## Stop condition

If VC and IOT start, but IOT never gets telemetry after the broker is confirmed running, stop there and report the exact logs. That will be enough to diagnose the next issue without guessing.

## Short conclusion

This is the first serious PC test package. It should be enough to prove whether the weather slice is alive end to end or where exactly it still fails.
