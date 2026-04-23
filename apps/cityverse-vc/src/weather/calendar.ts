import { Season } from './types.js'

export interface CalendarContext {
  month: number
  hourDecimal: number
  dayOfYear: number
  season: Season
  sunrise: number
  sunset: number
  daylightHours: number
  daylightFactor: number
  summerFactor: number
}

export function getSeason(month: number): Season {
  if (month === 12 || month <= 2) return 'winter'
  if (month <= 5) return 'spring'
  if (month <= 8) return 'summer'
  return 'autumn'
}

function getDayOfYear(d: Date): number {
  const startOfYear = Date.UTC(d.getUTCFullYear(), 0, 1)
  return Math.floor((d.getTime() - startOfYear) / 86400000) + 1
}

// Cooper's equation for solar declination + hour-angle sunrise formula.
// Returns day length in hours for the given latitude and day of year.
export function computeDaylightHours(latitude: number, dayOfYear: number): number {
  const declination = -23.45 * Math.cos((2 * Math.PI / 365) * (dayOfYear + 10))
  const latRad = (latitude * Math.PI) / 180
  const declRad = (declination * Math.PI) / 180

  const cosH = -Math.tan(latRad) * Math.tan(declRad)
  if (cosH <= -1) return 24  // polar day
  if (cosH >= 1) return 0    // polar night

  const hourAngle = Math.acos(cosH)
  return (2 * hourAngle * 180) / (Math.PI * 15)
}

export function getCalendarContext(simTimeIso: string, latitude = 59.33): CalendarContext {
  const d = new Date(simTimeIso)
  const month = d.getUTCMonth() + 1
  const hourDecimal = d.getUTCHours() + d.getUTCMinutes() / 60 + d.getUTCSeconds() / 3600
  const dayOfYear = getDayOfYear(d)

  const season = getSeason(month)
  const daylightHours = computeDaylightHours(latitude, dayOfYear)
  const sunrise = 12 - daylightHours / 2
  const sunset = 12 + daylightHours / 2

  let daylightFactor = 0
  if (daylightHours > 0 && hourDecimal >= sunrise && hourDecimal <= sunset) {
    const progress = (hourDecimal - sunrise) / (sunset - sunrise)
    daylightFactor = Math.max(0, Math.sin(Math.PI * progress))
  }

  // 0 near winter solstice, 1 near summer solstice — smooth latitude+date gradient
  const summerFactor = Math.max(0, (daylightHours - 9) / 9)

  return { month, hourDecimal, dayOfYear, season, sunrise, sunset, daylightHours, daylightFactor, summerFactor }
}
