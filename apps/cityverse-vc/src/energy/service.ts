import { EnergySummarySchema } from '@cityverse/contracts'
import type { WeatherService } from '../weather/service.js'
import type { BuildingService } from '../buildings/service.js'

const SOLAR_CAPACITY_KW = 1200
const WIND_FLEET_RATED_CAPACITY_KW = 1800
const WIND_CUT_IN_MPS = 2.5
const WIND_RATED_MPS = 12
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

    const solarOutputKw = Math.max(0, (weather.solarRadiationWm2 / 1000) * SOLAR_CAPACITY_KW)
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
    if (windSpeedMps < WIND_CUT_IN_MPS) return 0
    if (windSpeedMps >= WIND_RATED_MPS) return WIND_FLEET_RATED_CAPACITY_KW

    // Treat VC wind as a small district-scale fleet, not a single decorative turbine.
    // A lightly smoothed power curve is more believable at modest wind speeds than the
    // previous near-zero cubic ramp, while still preserving strong gains in windier weather.
    const normalized = (windSpeedMps - WIND_CUT_IN_MPS) / (WIND_RATED_MPS - WIND_CUT_IN_MPS)
    const eased = Math.pow(normalized, 2.2)
    const floorFraction = normalized < 0.2 ? normalized * 0.12 : 0.024
    const capacityFactor = Math.max(floorFraction, eased)

    return Math.min(WIND_FLEET_RATED_CAPACITY_KW, capacityFactor * WIND_FLEET_RATED_CAPACITY_KW)
  }
}
