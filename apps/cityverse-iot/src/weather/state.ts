import type { WeatherSummary, WeatherTelemetry } from '@cityverse/contracts'

let latestTelemetry: WeatherTelemetry | null = null
let latestSummary: WeatherSummary | null = null

export function setLatestTelemetry(payload: WeatherTelemetry): void {
  latestTelemetry = payload
  latestSummary = {
    condition: deriveCondition(payload.cloudCover, payload.precipitationMmH, payload.windSpeedMs),
    temperatureC: payload.temperatureC,
    feelsLikeC: payload.temperatureC - Math.min(4, payload.windSpeedMs * 0.15),
    humidity: payload.humidity,
    pressureHpa: payload.pressureHpa,
    windSpeedMs: payload.windSpeedMs,
    windDirectionDeg: payload.windDirectionDeg,
    cloudCover: payload.cloudCover,
    precipitationMmH: payload.precipitationMmH,
    isDaytime: true,
    season: 'spring',
    updatedAt: payload.timestamp,
  }
}

export function getLatestTelemetry(): WeatherTelemetry | null {
  return latestTelemetry
}

export function getLatestSummary(): WeatherSummary | null {
  return latestSummary
}

export function resetLatestWeather(): void {
  latestTelemetry = null
  latestSummary = null
}

function deriveCondition(cloudCover: number, precipitationMmH: number, windSpeedMs: number): WeatherSummary['condition'] {
  if (precipitationMmH > 4 && windSpeedMs > 12) return 'storm'
  if (precipitationMmH > 0.1) return 'rain'
  if (cloudCover > 0.7) return 'overcast'
  if (cloudCover > 0.3) return 'partly_cloudy'
  return 'clear'
}
