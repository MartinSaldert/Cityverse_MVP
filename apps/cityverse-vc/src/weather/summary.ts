import { WeatherSummarySchema } from '@cityverse/contracts'
import type { WeatherState } from './types.js'

export function toWeatherSummary(state: WeatherState) {
  return WeatherSummarySchema.parse({
    condition: toCondition(state.category),
    temperatureC: state.temperatureC,
    feelsLikeC: state.feelsLikeC,
    humidity: Math.round(state.humidity01 * 100),
    pressureHpa: state.pressureHpa,
    windSpeedMs: state.windSpeedMps,
    windDirectionDeg: 180,
    cloudCover: state.cloudCover01,
    precipitationMmH: state.precipitation01 * 10,
    isDaytime: state.daylightFactor > 0.01,
    season: state.season,
    updatedAt: state.simTime,
  })
}

function toCondition(category: WeatherState['category']) {
  switch (category) {
    case 'cloudy':
      return 'overcast'
    case 'partly_cloudy':
      return 'partly_cloudy'
    case 'rain':
      return 'rain'
    case 'storm':
      return 'storm'
    case 'clear':
    default:
      return 'clear'
  }
}
