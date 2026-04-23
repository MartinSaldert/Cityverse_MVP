import { EnergySummarySchema } from '@cityverse/contracts'
import type { WeatherService } from '../weather/service.js'
import type { BuildingService } from '../buildings/service.js'

const OIL_BACKUP_CAPACITY_KW = 1200
const OIL_CO2_KG_PER_MWH = 800

export class EnergyService {
  constructor(
    private readonly weather: WeatherService,
    private readonly buildings: BuildingService,
  ) {}

  getSummary() {
    const weather = this.weather.getState()
    const demand = this.buildings.getDemandSummary()

    const solarOutputKw = Math.max(0, (weather.solarRadiationWm2 / 1000) * 500)
    const windOutputKw = Math.max(0, this.computeWindOutputKw(weather.windSpeedMps))
    const totalRenewableKw = solarOutputKw + windOutputKw

    const deficit = demand.demandKw - totalRenewableKw
    const oilBackupOnline = deficit > 0
    const oilBackupOutputKw = oilBackupOnline ? Math.min(OIL_BACKUP_CAPACITY_KW, deficit) : 0
    const totalGenerationKw = totalRenewableKw + oilBackupOutputKw

    const currentCo2KgPerHour = (oilBackupOutputKw / 1000) * OIL_CO2_KG_PER_MWH
    const gridIntensityKgPerMwh = totalGenerationKw > 0
      ? (oilBackupOutputKw / totalGenerationKw) * OIL_CO2_KG_PER_MWH
      : 0

    return EnergySummarySchema.parse({
      solarOutputKw,
      windOutputKw,
      totalRenewableKw,
      oilBackupOutputKw,
      oilBackupOnline,
      totalGenerationKw,
      currentCo2KgPerHour,
      gridIntensityKgPerMwh,
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
