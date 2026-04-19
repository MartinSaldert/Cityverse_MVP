import type { CitySummary, DemandSummary } from '@cityverse/contracts'
import { getLatestEnergy } from '../energy/state.js'
import { getLatestSummary as getLatestWeather } from '../weather/state.js'

export function getLatestDemand(): DemandSummary | null {
  const weather = getLatestWeather()
  if (!weather) return null

  const baseDemandKw = 900
  const heatingDemandKw = weather.temperatureC < 12 ? (12 - weather.temperatureC) * 35 : 0
  const coolingDemandKw = weather.temperatureC > 22 ? (weather.temperatureC - 22) * 28 : 0
  const nightDemandKw = weather.isDaytime ? 0 : 120

  return {
    demandKw: baseDemandKw + heatingDemandKw + coolingDemandKw + nightDemandKw,
    updatedAt: weather.updatedAt,
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
    updatedAt: weather.updatedAt,
  }
}
