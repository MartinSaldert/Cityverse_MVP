# Cityverse MVP, PC Regression Checklist

Date: 2026-04-19
Status: first regression checklist based on verified PC run

## Purpose

Use this checklist before demos or after significant code changes.
It is the practical acceptance layer for the Windows setup.

## Environment setup

- [ ] latest source synced from Mac share to local mirror
- [ ] local mirror path is correct
- [ ] Mosquitto is installed on PC
- [ ] Unity project is available if Unity-side verification is needed

## Source sync

- [ ] run robocopy sync from share to local mirror
- [ ] confirm no sync errors on source files
- [ ] confirm `node_modules` and `dist` were not copied from share

## Local build

From local mirror:
- [ ] `pnpm install` succeeds
- [ ] `pnpm build` succeeds

## Broker startup

- [ ] Mosquitto starts on port 1883
- [ ] no immediate broker startup errors

## VC startup

- [ ] `pnpm start:vc` starts successfully
- [ ] `http://localhost:3001/health` returns ok
- [ ] `http://localhost:3001/` loads operator UI
- [ ] `http://localhost:3001/api/weather/current` returns data
- [ ] `http://localhost:3001/api/energy/current` returns data
- [ ] `http://localhost:3001/api/city/current` returns data

## IOT startup

- [ ] `pnpm start:iot` starts successfully
- [ ] `http://localhost:3002/health` returns ok
- [ ] weather endpoint eventually returns data
- [ ] energy endpoint eventually returns data
- [ ] city endpoint eventually returns data

## Telemetry flow

- [ ] VC logs indicate MQTT publishing connected
- [ ] IOT logs indicate MQTT connected and subscribed
- [ ] IOT weather reflects VC weather changes
- [ ] IOT energy reflects VC energy changes
- [ ] IOT city aggregate updates

## Operator UI checks

- [ ] change simulation speed and verify clock updates
- [ ] pause simulation and verify state changes
- [ ] resume simulation and verify state changes
- [ ] set simulation date/time and verify update
- [ ] apply weather nudges and verify weather changes
- [ ] verify energy responds plausibly to weather/time changes
- [ ] verify city summary responds plausibly to demand and energy changes

## Unity optional checks

- [ ] weather receiver runs in Play mode
- [ ] energy receiver runs in Play mode
- [ ] correct base URL is set to `http://localhost:3002`
- [ ] weather updates appear in logs or inspector
- [ ] energy updates appear in logs or inspector
- [ ] optional light response still works if assigned

## Failure capture

If any item fails, capture:
- [ ] broker output
- [ ] VC output
- [ ] IOT output
- [ ] exact failing URL response
- [ ] whether failure is reproducible after restart

## Suggested pass criteria

A test run counts as pass if:
- build succeeds locally
- broker, VC, and IOT all start
- VC endpoints respond
- IOT weather, energy, and city endpoints return live data
- at least one VC control change is reflected downstream in IOT
- Unity polling path works when Unity is included in the test
