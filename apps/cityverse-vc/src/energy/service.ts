import { EnergySummarySchema } from '@cityverse/contracts'
import type { WeatherService } from '../weather/service.js'

export class EnergyService {
  constructor(private readonly weather: WeatherService) {}

  getSummary() {
    const weather = this.weather.getState()

    const solarOutputKw = Math.max(0, (weather.solarRadiationWm2 / 1000) * 500)
    const windOutputKw = Math.max(0, this.computeWindOutputKw(weather.windSpeedMps))
    const totalRenewableKw = solarOutputKw + windOutputKw

    return EnergySummarySchema.parse({
      solarOutputKw,
      windOutputKw,
      totalRenewableKw,
      updatedAt: weather.simTime,
    })
  }

  private computeWindOutputKw(windSpeedMps: number): number {
    if (windSpeedMps < 3) return 0
    if (windSpeedMps >= 12) return 750
    const normalized = (windSpeedMps - 3) / 9
    return Math.pow(normalized, 3) * 750
  }
}
