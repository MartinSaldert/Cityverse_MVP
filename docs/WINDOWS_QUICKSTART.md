# Cityverse MVP, Windows Quickstart

Date: 2026-04-17
Status: first PC run guide

## Goal

Get the first Cityverse weather slice running on a Windows PC.

This starts:
- MQTT broker
- VC
- IOT
- Unity receiver

## Ports
- MQTT broker: `1883`
- VC: `3001`
- IOT: `3002`

## Step 1, install prerequisites
Install on Windows:
- Node.js 22+
- Unity
- Mosquitto MQTT broker

Then in a terminal from the project root:

```bash
corepack enable
corepack prepare pnpm@10.8.1 --activate
pnpm install
pnpm build
```

## Step 2, start MQTT broker
Start Mosquitto so it listens on:
- `mqtt://localhost:1883`

## Step 3, start VC
From the project root:

```bash
pnpm start:vc
```

Expected:
- VC available at `http://localhost:3001`
- operator UI at `http://localhost:3001/`

## Step 4, start IOT
From the project root in a second terminal:

```bash
pnpm start:iot
```

Expected:
- IOT available at `http://localhost:3002`
- successful MQTT connection in logs

## Step 5, verify browser endpoints

### VC
- `http://localhost:3001/health`
- `http://localhost:3001/api/clock`
- `http://localhost:3001/api/weather/current`

### IOT
- `http://localhost:3002/health`
- `http://localhost:3002/weather/current`

Expected:
- IOT `/weather/current` should return weather data once VC is publishing through MQTT

## Step 6, Unity receiver
Copy these files into your Unity project under `Assets/`:
- `unity/cityverse-receiver/WeatherStateDto.cs`
- `unity/cityverse-receiver/WeatherApiClient.cs`
- `unity/cityverse-receiver/WeatherReceiverBehaviour.cs`

Then:
1. create an empty GameObject
2. add `WeatherReceiverBehaviour`
3. let Unity auto-add `WeatherApiClient`
4. set Base URL to `http://localhost:3002`
5. press Play

Expected:
- Console logs weather updates
- Inspector shows live values
- optional directional light reacts if assigned

## First manual test actions
In the VC UI:
- change speed
- set time/date
- increase cloud bias
- adjust pressure bias
- adjust wind bias

Then verify:
- VC weather changes
- IOT current weather changes
- Unity reflects the new values

## If something fails

### IOT says no telemetry received yet
Check:
- Mosquitto is running
- VC is running
- IOT is connected to MQTT

### Unity gets nothing
Check:
- base URL is `http://localhost:3002`
- IOT `/weather/current` returns `ok: true`

### VC UI works but IOT stays empty
Check:
- broker is really on port `1883`
- no firewall or local port conflict

## Short conclusion

This is the shortest respectable path to the first PC test. If it works, we have a living slice. If it breaks, we should get useful error signals rather than mystical silence.
