import { BuildingDemandSchema, BuildingsSummarySchema, DemandSummarySchema } from '@cityverse/contracts'
import type { WeatherService } from '../weather/service.js'
import { buildingRoster } from './roster.js'
import type { ScheduleClass } from './types.js'

export class BuildingService {
  constructor(private readonly weather: WeatherService) {}

  getCurrentDemands() {
    const state = this.weather.getState()
    const simTime = new Date(state.simTime)
    const hour = simTime.getUTCHours()
    const dayOfWeek = simTime.getUTCDay() // 0=Sunday, 6=Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const tempC = state.temperatureC

    return buildingRoster.map(building => {
      const occupancyFactor = computeScheduleMultiplier(building.scheduleClass, hour, isWeekend)
      const weatherFactor = computeWeatherMultiplier(building.scheduleClass, tempC, building.weatherSensitivity)
      const currentDemandKw = building.baseDemandKw * occupancyFactor * weatherFactor

      const occupancyCount = Math.round(
        building.occupancyCapacity * computeOccupancyFactor(building.scheduleClass, hour, isWeekend)
      )

      return BuildingDemandSchema.parse({
        id: building.id,
        label: building.label,
        type: building.type,
        scheduleClass: building.scheduleClass,
        baseDemandKw: building.baseDemandKw,
        currentDemandKw,
        occupancyFactor,
        weatherFactor,
        occupancyCount,
        occupancyCapacity: building.occupancyCapacity,
        updatedAt: state.simTime,
      })
    })
  }

  getDemandSummary() {
    const demands = this.getCurrentDemands()
    const totalKw = demands.reduce((sum, b) => sum + b.currentDemandKw, 0)
    const updatedAt = demands[0]?.updatedAt ?? new Date().toISOString()
    return DemandSummarySchema.parse({ demandKw: totalKw, updatedAt })
  }

  getBuildingsSummary() {
    const demands = this.getCurrentDemands()
    const totalDemandKw = demands.reduce((sum, b) => sum + b.currentDemandKw, 0)

    const byType: Record<string, number> = {}
    for (const b of demands) {
      byType[b.type] = (byType[b.type] ?? 0) + b.currentDemandKw
    }

    const topContributors = [...demands]
      .sort((a, b) => b.currentDemandKw - a.currentDemandKw)
      .slice(0, 3)
      .map(b => ({ id: b.id, label: b.label, currentDemandKw: b.currentDemandKw }))

    const updatedAt = demands[0]?.updatedAt ?? new Date().toISOString()

    return BuildingsSummarySchema.parse({
      totalDemandKw,
      buildingCount: demands.length,
      byType,
      topContributors,
      updatedAt,
    })
  }
}

// Hour-of-day multipliers per schedule class, with weekend factor applied
function computeScheduleMultiplier(cls: ScheduleClass, hour: number, isWeekend: boolean): number {
  switch (cls) {
    case 'residential': {
      let m: number
      if (hour < 6)       m = 0.40  // sleeping, standby
      else if (hour < 7)  m = 1.20  // waking up
      else if (hour < 9)  m = 1.40  // morning peak: breakfast, hot water
      else if (hour < 16) m = 0.65  // low daytime occupancy on workdays
      else if (hour < 17) m = 0.90  // returning home
      else if (hour < 21) m = 1.30  // evening peak: cooking, heating, TV
      else if (hour < 23) m = 1.00  // winding down
      else                m = 0.70  // late night
      return m * (isWeekend ? 1.10 : 1.0)  // slightly higher weekend home occupancy
    }
    case 'office': {
      let m: number
      if (hour < 7)       m = 0.15  // standby/security/HVAC base
      else if (hour < 8)  m = 0.45  // early arrivals
      else if (hour < 9)  m = 0.80  // ramp-up
      else if (hour < 17) m = 1.25  // peak workday
      else if (hour < 18) m = 0.80  // end of day
      else if (hour < 20) m = 0.35  // stragglers
      else                m = 0.15  // empty
      return isWeekend ? m * 0.20 : m  // skeleton load only on weekends
    }
    case 'retail': {
      let m: number
      if (hour < 9)       m = 0.10  // closed
      else if (hour < 10) m = 0.60  // opening
      else if (hour < 13) m = 1.00  // midday
      else if (hour < 18) m = 1.25  // afternoon peak
      else if (hour < 21) m = 0.80  // evening
      else                m = 0.20  // closing/overnight
      return m * (isWeekend ? 0.90 : 1.0)
    }
    case 'civic': {
      let m: number
      if (hour < 8)       m = 0.10  // closed
      else if (hour < 9)  m = 0.75  // opening
      else if (hour < 16) m = 1.20  // daytime service hours
      else if (hour < 18) m = 0.50  // afternoon wind-down
      else                m = 0.10  // closed
      return isWeekend ? m * 0.10 : m  // school/civic mostly closed on weekends
    }
    case 'infrastructure':
      return 1.0  // constant load: pumps, switching, monitoring
    case 'industrial': {
      // Two-shift operation: full production 06:00–21:59, night-shift skeleton otherwise
      const m = (hour >= 6 && hour < 22) ? 1.00 : 0.65
      return m * (isWeekend ? 0.80 : 1.0)  // reduced weekend production schedule
    }
    default:
      return 1.0
  }
}

// Occupancy factor [0, 1]: fraction of capacity present at this hour.
// Derived from the same schedule-class logic as demand, but tells a people story not a watt story.
function computeOccupancyFactor(cls: ScheduleClass, hour: number, isWeekend: boolean): number {
  switch (cls) {
    case 'residential': {
      // People are home overnight; daytime dip as residents leave for work/school.
      let f: number
      if (hour < 6)       f = 1.00  // everyone asleep at home
      else if (hour < 7)  f = 0.90  // starting to wake and leave
      else if (hour < 9)  f = 0.60  // morning rush out
      else if (hour < 16) f = 0.30  // at work / school
      else if (hour < 17) f = 0.50  // returning
      else if (hour < 21) f = 0.90  // full household evening
      else                f = 1.00  // winding down / asleep
      return Math.min(1.0, f * (isWeekend ? 1.20 : 1.0))
    }
    case 'office': {
      // Near-empty outside business hours; full staffing 09:00–17:00.
      let f: number
      if (hour < 7)       f = 0.03
      else if (hour < 8)  f = 0.15
      else if (hour < 9)  f = 0.40
      else if (hour < 17) f = 1.00
      else if (hour < 18) f = 0.50
      else if (hour < 20) f = 0.10
      else                f = 0.02
      return isWeekend ? f * 0.10 : f
    }
    case 'retail': {
      // Closed before 09:00; peak customers in afternoon; closed after 21:00.
      let f: number
      if (hour < 9)       f = 0.00
      else if (hour < 10) f = 0.20
      else if (hour < 13) f = 0.50
      else if (hour < 18) f = 0.80
      else if (hour < 21) f = 0.40
      else                f = 0.00
      return Math.min(1.0, f * (isWeekend ? 1.30 : 1.0))
    }
    case 'civic': {
      // School/civic hours: full during teaching day, empty evenings and weekends.
      let f: number
      if (hour < 8)       f = 0.00
      else if (hour < 9)  f = 0.40
      else if (hour < 16) f = 1.00
      else if (hour < 18) f = 0.20
      else                f = 0.00
      return isWeekend ? f * 0.05 : f
    }
    case 'infrastructure':
      // Always a small monitoring crew; no meaningful variation.
      return 0.50
    case 'industrial': {
      // Full day-shift 06:00–22:00; reduced night-shift otherwise.
      const f = (hour >= 6 && hour < 22) ? 1.00 : 0.40
      return f * (isWeekend ? 0.70 : 1.0)
    }
    default:
      return 0.50
  }
}

// Temperature-driven weather multiplier: more demand in thermal extremes
function computeWeatherMultiplier(cls: ScheduleClass, tempC: number, sensitivity: number): number {
  switch (cls) {
    case 'residential':
      // Heating when cold, some cooling when very hot
      return 1 + sensitivity * (
        Math.max(0, (10 - tempC) * 0.03) +
        Math.max(0, (tempC - 25) * 0.015)
      )
    case 'office':
    case 'retail':
      // Cooling-led with minor heating load in deep cold
      return 1 + sensitivity * (
        Math.max(0, (tempC - 22) * 0.025) +
        Math.max(0, (8 - tempC) * 0.01)
      )
    case 'civic':
      // Moderate heating sensitivity (buildings open in winter)
      return 1 + sensitivity * Math.max(0, (10 - tempC) * 0.02)
    case 'infrastructure':
      return 1.0  // utility load is weather-independent
    case 'industrial':
      // Process cooling in summer heat; minor space-heating in deep winter
      return 1 + sensitivity * (
        Math.max(0, (tempC - 25) * 0.02) +
        Math.max(0, (5 - tempC) * 0.01)
      )
    default:
      return 1.0
  }
}
