# Cityverse Unity Receiver

## Purpose

This Unity-side folder is for the first weather receiver slice.

The first receiver should:
- fetch current weather state from IOT
- deserialize the payload
- expose it in a MonoBehaviour
- display the values in debug UI or logs
- optionally drive a light intensity response from daylight

## Planned first scripts
- `WeatherStateDto.cs`
- `WeatherApiClient.cs`
- `WeatherReceiverBehaviour.cs`
- `EnergyStateDto.cs`
- `EnergyApiClient.cs`
- `EnergyReceiverBehaviour.cs`
- optional `WeatherDebugPanel.cs`

## Implemented scripts

| File | Role |
|---|---|
| `WeatherStateDto.cs` | Plain C# data class mirroring the `WeatherSummary` JSON shape |
| `WeatherApiClient.cs` | MonoBehaviour — polls `GET /weather/current`, fires `OnWeatherUpdated` |
| `WeatherReceiverBehaviour.cs` | MonoBehaviour — consumes the client, logs values, drives optional light |
| `EnergyStateDto.cs` | Plain C# data class for current renewable output summary |
| `EnergyApiClient.cs` | MonoBehaviour — polls `GET /energy/current`, fires `OnEnergyUpdated` |
| `EnergyReceiverBehaviour.cs` | MonoBehaviour — consumes energy updates and logs live solar/wind/total |

## Quick setup

1. Copy the `.cs` files into your Unity project (any folder under `Assets/`).
2. Create an empty GameObject, e.g. **WeatherReceiver**.
3. Add **WeatherReceiverBehaviour** — Unity auto-adds **WeatherApiClient** via `[RequireComponent]`.
4. In the Inspector set **Base Url** to point at your IOT service (default `http://localhost:3002`).
5. Optionally assign a **Directional Light** to the `Sun Light` slot for day/cloud intensity driving.
6. Create another empty GameObject, e.g. **EnergyReceiver**.
7. Add **EnergyReceiverBehaviour** — Unity auto-adds **EnergyApiClient**.
8. Hit Play — weather and energy values appear in the Console each poll cycle and are visible live in the Inspector.

## JSON contract

`GET /weather/current` returns:

```json
{
  "ok": true,
  "data": {
    "condition": "partly_cloudy",
    "temperatureC": 14.2,
    "feelsLikeC": 12.8,
    "humidity": 72,
    "pressureHpa": 1013,
    "windSpeedMs": 3.1,
    "windDirectionDeg": 220,
    "cloudCover": 0.45,
    "precipitationMmH": 0.0,
    "isDaytime": true,
    "season": "spring",
    "updatedAt": "2026-04-17T10:00:00.000Z"
  }
}
```

## Next steps
- Replace `Debug.Log` with on-screen UI panels.
- Bind renewable output to scene indicators or dashboards.
- Switch from HTTP polling to WebSocket live updates once the slice is stable.
