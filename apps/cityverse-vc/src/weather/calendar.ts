import { Season } from './types.js'

export interface CalendarContext {
  month: number
  hourDecimal: number
  season: Season
  sunrise: number
  sunset: number
  daylightFactor: number
  summerFactor: number
}

const SEASON_DAYLIGHT: Record<Season, number> = {
  winter: 8,
  spring: 12,
  summer: 16,
  autumn: 11,
}

export function getSeason(month: number): Season {
  if (month === 12 || month <= 2) return 'winter'
  if (month <= 5) return 'spring'
  if (month <= 8) return 'summer'
  return 'autumn'
}

export function getCalendarContext(simTimeIso: string): CalendarContext {
  const d = new Date(simTimeIso)
  const month = d.getUTCMonth() + 1
  const hourDecimal = d.getUTCHours() + d.getUTCMinutes() / 60 + d.getUTCSeconds() / 3600

  const season = getSeason(month)
  const daylightDuration = SEASON_DAYLIGHT[season]
  const sunrise = 12 - daylightDuration / 2
  const sunset = 12 + daylightDuration / 2

  let daylightFactor = 0
  if (hourDecimal >= sunrise && hourDecimal <= sunset) {
    const progress = (hourDecimal - sunrise) / (sunset - sunrise)
    daylightFactor = Math.max(0, Math.sin(Math.PI * progress))
  }

  const summerFactor = season === 'summer' ? 1.0 : (season === 'spring' || season === 'autumn' ? 0.4 : 0.0)

  return { month, hourDecimal, season, sunrise, sunset, daylightFactor, summerFactor }
}
