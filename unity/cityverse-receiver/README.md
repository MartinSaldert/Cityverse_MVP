# Cityverse Unity Receiver

## Purpose

Polling receiver scripts that fetch live state from the Cityverse services and
expose it inside Unity.  Drop the `.cs` files into any folder under `Assets/`.

## Implemented scripts

| File | Role |
|---|---|
| `WeatherStateDto.cs` | Data class mirroring the `WeatherSummary` JSON shape |
| `WeatherApiClient.cs` | MonoBehaviour — polls `GET /weather/current`, fires `OnWeatherUpdated` |
| `WeatherReceiverBehaviour.cs` | Consumes weather updates, logs values, drives optional directional light |
| `EnergyStateDto.cs` | Data class for current renewable output |
| `EnergyApiClient.cs` | MonoBehaviour — polls `GET /energy/current`, fires `OnEnergyUpdated` |
| `EnergyReceiverBehaviour.cs` | Consumes energy updates and logs solar/wind/total |
| `BuildingStateDto.cs` | Data class for per-building live state (occupancy + demand) |
| `BuildingsApiClient.cs` | MonoBehaviour — polls `GET /buildings/current` on IOT service, fires `OnBuildingsUpdated` |
| `BuildingOverlayBehaviour.cs` | Attaches to a building GameObject and renders a world-space text label above it |

---

## Quick setup — weather and energy

1. Copy all `.cs` files into your Unity project (any folder under `Assets/`).
2. Create an empty GameObject, e.g. **WeatherReceiver**.
3. Add **WeatherReceiverBehaviour** — Unity auto-adds **WeatherApiClient** via `[RequireComponent]`.
4. In the Inspector set **Base Url** to your IOT service (default `http://localhost:3002`).
5. Optionally assign a Directional Light to the `Sun Light` slot.
6. Create another empty GameObject, e.g. **EnergyReceiver**.
7. Add **EnergyReceiverBehaviour** — Unity auto-adds **EnergyApiClient**.
8. Hit Play — values appear in the Console each poll cycle.

---

## Quick setup — building overlays

The building overlay system uses **one shared polling client** and **one overlay
component per building**.  This keeps it to one HTTP request regardless of how
many buildings are in the scene.

### Step 1 — create the shared client

1. Create an empty GameObject named **BuildingsReceiver**.
2. Add the **BuildingsApiClient** component.
3. Set **Base Url** to the cityverse-iot service (default `http://localhost:3002`).
4. Optionally adjust **Poll Interval Seconds** (default 5).

### Step 2 — attach an overlay to each building

For each building GameObject in your scene:

1. Select the building GameObject.
2. Add the **BuildingOverlayBehaviour** component.
3. Set **Building Id** to the stable roster ID for that building, e.g. `villa-a`.
4. Drag the **BuildingsReceiver** GameObject into the **Buildings Client** slot.
5. Adjust **Vertical Offset** so the label clears the building roof (default 3).
6. Optionally toggle **Look At Camera** (default on) for billboard behaviour.

### Step 3 — hit Play

Each building shows a floating label updated every poll cycle:

```
Villa A
People: 3
Load: 18.4 kW
```

Values update automatically as the simulation clock advances.

---

## Building IDs

The stable roster IDs are:

| ID | Label |
|---|---|
| `villa-a` | Villa A |
| `villa-b` | Villa B |
| `apartment-01` | Apartment Block |
| `office-01` | Office Building |
| `retail-01` | Retail Unit |
| `school-01` | School |
| `utility-01` | Utility Node |
| `factory-01` | Factory |

---

## JSON contracts

### `GET /weather/current` (IOT service, default port 3002)

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
    "updatedAt": "2026-04-20T10:00:00.000Z"
  }
}
```

### `GET /buildings/current` (IOT service, default port 3002)

```json
{
  "ok": true,
  "data": [
    {
      "id": "villa-a",
      "label": "Villa A",
      "type": "villa",
      "scheduleClass": "residential",
      "occupancyCount": 3,
      "occupancyCapacity": 4,
      "currentDemandKw": 18.4,
      "baseDemandKw": 18,
      "occupancyFactor": 0.9,
      "weatherFactor": 1.13,
      "updatedAt": "2026-04-20T10:00:00.000Z"
    }
  ]
}
```

---

## Next steps

- Replace `Debug.Log` with on-screen UI panels.
- Bind renewable output to scene indicators or dashboards.
- Add a colour gradient to the load label (green → amber → red) based on fraction of base demand.
- Switch from HTTP polling to WebSocket live updates once the slice is stable.
