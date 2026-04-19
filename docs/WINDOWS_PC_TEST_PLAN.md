# Cityverse MVP, Windows PC Test Plan

Date: 2026-04-19
Status: updated against current implementation

## Purpose

This document defines the first practical Windows PC test plan for the current Cityverse vertical slice.

Target chain:
- VC
- MQTT broker
- IOT
- Unity receiver

## What should work in this test

After setup, the PC test should allow you to:
- run VC on port 3001
- open the VC operator UI in a browser
- run IOT on port 3002
- run a local MQTT broker on port 1883
- see IOT receive weather telemetry from VC
- see IOT receive energy telemetry from VC
- query current weather, energy, demand, and city aggregate from IOT
- see Unity fetch current weather and energy from IOT

## Current implementation summary

### VC endpoints
- `GET /health`
- `GET /`
- `GET /api/clock`
- `POST /api/clock/pause`
- `POST /api/clock/resume`
- `POST /api/clock/speed`
- `POST /api/clock/time`
- `GET /api/weather/current`
- `POST /api/weather/nudge`
- `GET /api/energy/current`
- `GET /api/demand/current`
- `GET /api/city/current`

### IOT endpoints
- `GET /health`
- `GET /weather/current`
- `GET /energy/current`
- `GET /demand/current`
- `GET /city/current`

## Current contract expectations

### IOT `GET /weather/current`

```json
{
  "ok": true,
  "data": {
    "condition": "clear",
    "temperatureC": 14.2,
    "feelsLikeC": 13.8,
    "humidity": 55,
    "pressureHpa": 1015,
    "windSpeedMs": 2.5,
    "windDirectionDeg": 180,
    "cloudCover": 0.2,
    "precipitationMmH": 0,
    "isDaytime": true,
    "season": "spring",
    "updatedAt": "2026-04-17T10:00:00.000Z"
  }
}
```

### IOT `GET /energy/current`

```json
{
  "ok": true,
  "data": {
    "solarOutputKw": 120,
    "windOutputKw": 85,
    "totalRenewableKw": 205,
    "updatedAt": "2026-04-17T10:00:00.000Z"
  }
}
```

### IOT `GET /city/current`

```json
{
  "ok": true,
  "data": {
    "weather": {
      "condition": "clear"
    },
    "energy": {
      "solarOutputKw": 120,
      "windOutputKw": 85,
      "totalRenewableKw": 205,
      "updatedAt": "2026-04-17T10:00:00.000Z"
    },
    "demand": {
      "demandKw": 900,
      "updatedAt": "2026-04-17T10:00:00.000Z"
    },
    "balanceKw": -695,
    "updatedAt": "2026-04-17T10:00:00.000Z"
  }
}
```

## Prerequisites on the PC

Install:
- Node.js 22 or compatible modern Node
- npm/corepack
- pnpm via corepack
- Unity
- an MQTT broker such as Mosquitto

## Step 1, install dependencies

From the project root:

```bash
corepack enable
corepack prepare pnpm@10.8.1 --activate
pnpm install
```

## Step 2, build the apps

```bash
pnpm --filter @cityverse/contracts build
pnpm --filter @cityverse/vc build
pnpm --filter @cityverse/iot build
```

Or simply:

```bash
pnpm build
```

Expected:
- all three package builds succeed

## Step 3, start MQTT broker

Run a local broker on port 1883.

Example expectation:
- broker reachable at `mqtt://localhost:1883`

## Step 4, start VC

From project root:

```bash
pnpm start:vc
```

Or directly:

```bash
cd apps/cityverse-vc
node dist/main.js
```

Expected:
- VC listening on `http://localhost:3001`
- browser UI at `http://localhost:3001/`
- VC logs show MQTT publishers connecting once broker is available

## Step 5, start IOT

From project root:

```bash
pnpm start:iot
```

Or directly:

```bash
cd apps/cityverse-iot
node dist/main.js
```

Expected:
- IOT listening on `http://localhost:3002`
- IOT logs show successful MQTT connection and topic subscriptions

## Step 6, verify VC endpoints

Open or query:
- `http://localhost:3001/health`
- `http://localhost:3001/`
- `http://localhost:3001/api/clock`
- `http://localhost:3001/api/weather/current`
- `http://localhost:3001/api/energy/current`
- `http://localhost:3001/api/city/current`

Expected:
- all respond successfully
- operator UI loads
- clock, weather, energy, and city sections show live values

## Step 7, verify IOT endpoints

Open or query:
- `http://localhost:3002/health`
- `http://localhost:3002/weather/current`
- `http://localhost:3002/energy/current`
- `http://localhost:3002/demand/current`
- `http://localhost:3002/city/current`

Expected:
- before MQTT arrives, some endpoints may return `503`
- after MQTT is flowing, weather and energy should return `ok: true`
- city and demand should also return data once required upstream state exists

## Step 8, manual operator test in VC UI

From the VC UI:
- change simulation speed
- set simulation date and time
- pause and resume simulation
- change pressure bias
- change cloud bias
- change wind bias
- change temperature bias
- change humidity bias

Then verify:
- VC weather values change
- VC energy and city values react
- IOT weather changes after telemetry arrives
- IOT energy changes after telemetry arrives
- IOT city aggregate updates

## Step 9, Unity receiver test

In Unity:
1. copy files from `unity/cityverse-receiver/` into `Assets/`
2. create an empty GameObject for weather
3. add `WeatherReceiverBehaviour`
4. confirm `WeatherApiClient` auto-adds
5. set base URL to `http://localhost:3002`
6. optionally assign a directional light
7. create another empty GameObject for energy
8. add `EnergyReceiverBehaviour`
9. confirm `EnergyApiClient` auto-adds
10. press Play

Expected:
- weather values appear in Console
- energy values appear in Console
- values update in Inspector
- optional light intensity reacts if assigned

## Likely failure points

### IOT returns 503
Cause:
- broker not running
- VC not connected to broker
- VC publish not reaching broker
- not enough time has passed for first telemetry to arrive

### Weather works but energy is empty
Cause:
- energy publish path failed in VC
- IOT energy subscription failed
- contract mismatch on energy payload

### City aggregate stays empty
Cause:
- IOT has weather but not energy yet
- city route needs both weather and energy state

### Unity shows no updates
Cause:
- wrong base URL
- IOT not receiving telemetry
- firewall or localhost restriction
- scripts not attached correctly in scene

## What Martin should report back from PC test

Please capture:
- whether VC starts
- whether IOT starts
- whether broker runs
- whether VC UI loads
- whether `GET /weather/current` on IOT returns data
- whether `GET /energy/current` on IOT returns data
- whether `GET /city/current` on IOT returns data
- whether Unity weather receiver logs updates
- whether Unity energy receiver logs updates
- any exact error text

## Short conclusion

This is now a fuller vertical slice than the original weather-only test plan.
If this works on the Windows PC, we have a real integrated demo path rather than a particularly elegant pile of intentions.
