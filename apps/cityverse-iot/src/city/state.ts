import type { CitySummary, DemandSummary } from '@cityverse/contracts'
import { getLatestEnergy } from '../energy/state.js'
import { getLatestSummary as getLatestWeather } from '../weather/state.js'
import { getLatestBuildings } from '../buildings/state.js'

export function getLatestDemand(): DemandSummary | null {
  const buildings = getLatestBuildings()
  if (!buildings) return null

  const demandKw = buildings.buildings.reduce((sum, b) => sum + b.currentDemandKw, 0)
  return {
    demandKw,
    updatedAt: buildings.updatedAt,
  }
}

export function getLatestCity(): CitySummary | null {
  const weather = getLatestWeather()
  const energy = getLatestEnergy()
  const demand = getLatestDemand()
  if (!weather || !energy || !demand) return null

  return {
    weather,
    energy,
    demand,
    balanceKw: energy.totalRenewableKw - demand.demandKw,
    updatedAt: demand.updatedAt,
  }
}
