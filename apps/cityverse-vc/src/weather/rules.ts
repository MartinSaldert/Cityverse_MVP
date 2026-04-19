import { Season, WeatherCategory } from './types.js'
import { CalendarContext } from './calendar.js'

export function clamp(x: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, x))
}

export function moveToward(current: number, target: number, rate: number, dt: number): number {
  return current + (target - current) * Math.min(1, rate * dt)
}

export function normalize(value: number, min: number, max: number): number {
  return clamp((value - min) / (max - min), 0, 1)
}

// ──────────────────────────────────────────────
// Seasonal baselines

export interface SeasonalBaseline {
  tempMin: number
  tempMax: number
  solarPeak: number
  baseWind: number
  humidityBase: number
}

const SEASONAL: Record<Season, SeasonalBaseline> = {
  winter: { tempMin: -5, tempMax: 3,  solarPeak: 400, baseWind: 4.0, humidityBase: 0.60 },
  spring: { tempMin: 3,  tempMax: 15, solarPeak: 650, baseWind: 3.0, humidityBase: 0.55 },
  summer: { tempMin: 14, tempMax: 27, solarPeak: 900, baseWind: 2.0, humidityBase: 0.55 },
  autumn: { tempMin: 6,  tempMax: 16, solarPeak: 600, baseWind: 3.5, humidityBase: 0.65 },
}

export function getSeasonalBaseline(season: Season): SeasonalBaseline {
  return SEASONAL[season]
}

// ──────────────────────────────────────────────
// Baseline temperature

export function computeBaselineTemp(baseline: SeasonalBaseline, cal: CalendarContext): number {
  // Peak around 15:00–16:00 — shift the sine so max occurs there
  // Use daylightFactor from calendar; shift peak by multiplying progress by 0.85 before sin
  const { hourDecimal, sunrise, sunset } = cal
  let dayCurve = 0
  if (hourDecimal >= sunrise && hourDecimal <= sunset) {
    const progress = (hourDecimal - sunrise) / (sunset - sunrise)
    // shift peak to ~62% of day (≈15:00 for 08:00–20:00 window)
    dayCurve = Math.max(0, Math.sin(Math.PI * progress * 0.9))
  }
  return baseline.tempMin + (baseline.tempMax - baseline.tempMin) * dayCurve
}

// ──────────────────────────────────────────────
// Solar radiation

export function computeSolarRadiation(baseline: SeasonalBaseline, cal: CalendarContext, cloudCover01: number): number {
  const clearSky = baseline.solarPeak * cal.daylightFactor
  const attenuated = clearSky * (1 - 0.75 * cloudCover01)
  return clamp(attenuated, 0, 1100)
}

// ──────────────────────────────────────────────
// Pressure-derived helpers

export function computePressureHelpers(pressureHpa: number, pressureTrend: number) {
  const lowPressureFactor = clamp(normalize(1012 - pressureHpa, 0, 25), 0, 1)
  const fallingPressureFactor = clamp(normalize(-pressureTrend, 0, 1.5), 0, 1)
  return { lowPressureFactor, fallingPressureFactor }
}

export function computePressureStormContribution(lowPressureFactor: number, fallingPressureFactor: number): number {
  return clamp(0.6 * lowPressureFactor + 0.4 * fallingPressureFactor, 0, 1)
}

// ──────────────────────────────────────────────
// Storminess and instability targets

export function computeStorminessTarget(
  pressureStormContribution: number,
  humidity01: number,
  cloudCover01: number,
): number {
  return clamp(0.45 * pressureStormContribution + 0.25 * humidity01 + 0.20 * cloudCover01, 0, 1)
}

export function computeInstabilityTarget(
  humidity01: number,
  daylightFactor: number,
  summerFactor: number,
  fallingPressureFactor: number,
): number {
  return clamp(
    0.30 * humidity01 + 0.25 * daylightFactor + 0.20 * summerFactor + 0.25 * fallingPressureFactor,
    0, 1,
  )
}

// ──────────────────────────────────────────────
// Cloud target

export function computeCloudTarget(
  humidity01: number,
  lowPressureFactor: number,
  fallingPressureFactor: number,
  storminess01: number,
  userCloudBias: number,
): number {
  return clamp(
    0.35 * humidity01 + 0.25 * lowPressureFactor + 0.20 * fallingPressureFactor + 0.20 * storminess01 + userCloudBias,
    0, 1,
  )
}

// ──────────────────────────────────────────────
// Wind target

export function computeWindTarget(
  baseline: SeasonalBaseline,
  fallingPressureFactor: number,
  storminess01: number,
  userWindBias: number,
): number {
  return clamp(
    baseline.baseWind + 4.0 * fallingPressureFactor + 6.0 * storminess01 + userWindBias,
    0, 35,
  )
}

// ──────────────────────────────────────────────
// Humidity target

export function computeHumidityTarget(
  baseline: SeasonalBaseline,
  precipitation01: number,
  userHumidityBias: number,
): number {
  return clamp(baseline.humidityBase + 0.10 * precipitation01 + userHumidityBias, 0, 1)
}

// ──────────────────────────────────────────────
// Precipitation target

export function computePrecipitationTarget(
  cloudCover01: number,
  humidity01: number,
  storminess01: number,
  lowPressureFactor: number,
): number {
  const rainSupport =
    0.35 * cloudCover01 + 0.30 * humidity01 + 0.20 * storminess01 + 0.15 * lowPressureFactor
  if (rainSupport < 0.55) return 0
  return normalize(rainSupport, 0.55, 1.0)
}

// ──────────────────────────────────────────────
// Temperature target

export function computeTemperatureTarget(
  baselineTemp: number,
  solarRadiationWm2: number,
  cloudCover01: number,
  daylightFactor: number,
  windSpeedMps: number,
  precipitation01: number,
  userTempBias: number,
  baseline: SeasonalBaseline,
): number {
  const solarHeating = normalize(solarRadiationWm2, 0, baseline.solarPeak) * 6.0
  const dayCloudCooling = cloudCover01 * 4.0 * daylightFactor
  const nightCloudWarming = cloudCover01 * 1.5 * (1 - daylightFactor)
  const windCooling = Math.min(4.0, windSpeedMps * 0.15)
  const rainCooling = precipitation01 * 2.5

  return baselineTemp + solarHeating - dayCloudCooling + nightCloudWarming - windCooling - rainCooling + userTempBias
}

// ──────────────────────────────────────────────
// Weather category

export function deriveCategory(
  precipitation01: number,
  windSpeedMps: number,
  storminess01: number,
  cloudCover01: number,
): WeatherCategory {
  if (precipitation01 > 0.6 && windSpeedMps > 12 && storminess01 > 0.65) return 'storm'
  if (precipitation01 > 0.2) return 'rain'
  if (cloudCover01 > 0.7) return 'cloudy'
  if (cloudCover01 > 0.3) return 'partly_cloudy'
  return 'clear'
}
