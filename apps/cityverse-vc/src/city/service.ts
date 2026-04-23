import { CitySummarySchema } from '@cityverse/contracts'
import type { EnergyService } from '../energy/service.js'
import { toWeatherSummary } from '../weather/summary.js'
import type { WeatherService } from '../weather/service.js'
import type { BuildingService } from '../buildings/service.js'

export class CityService {
  constructor(
    private readonly weather: WeatherService,
    private readonly energy: EnergyService,
    private readonly buildings: BuildingService,
  ) {}

  getDemandSummary() {
    return this.buildings.getDemandSummary()
  }

  getCitySummary() {
    const weather = toWeatherSummary(this.weather.getState())
    const energy = this.energy.getSummary()
    const demand = this.getDemandSummary()
    const balanceKw = energy.totalGenerationKw - demand.demandKw

    return CitySummarySchema.parse({
      weather,
      energy,
      demand,
      balanceKw,
      updatedAt: weather.updatedAt,
    })
  }
}
