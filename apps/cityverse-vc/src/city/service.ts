import { CitySummarySchema, DemandSummarySchema } from '@cityverse/contracts'
import type { EnergyService } from '../energy/service.js'
import { toWeatherSummary } from '../weather/summary.js'
import type { WeatherService } from '../weather/service.js'

export class CityService {
  constructor(
    private readonly weather: WeatherService,
    private readonly energy: EnergyService,
  ) {}

  getDemandSummary() {
    const weatherState = this.weather.getState()
    const weather = toWeatherSummary(weatherState)

    const baseDemandKw = 900
    const heatingDemandKw = weather.temperatureC < 12 ? (12 - weather.temperatureC) * 35 : 0
    const coolingDemandKw = weather.temperatureC > 22 ? (weather.temperatureC - 22) * 28 : 0
    const nightDemandKw = weather.isDaytime ? 0 : 120

    return DemandSummarySchema.parse({
      demandKw: baseDemandKw + heatingDemandKw + coolingDemandKw + nightDemandKw,
      updatedAt: weather.updatedAt,
    })
  }

  getCitySummary() {
    const weather = toWeatherSummary(this.weather.getState())
    const energy = this.energy.getSummary()
    const demand = this.getDemandSummary()
    const balanceKw = energy.totalRenewableKw - demand.demandKw

    return CitySummarySchema.parse({
      weather,
      energy,
      demand,
      balanceKw,
      updatedAt: weather.updatedAt,
    })
  }
}
