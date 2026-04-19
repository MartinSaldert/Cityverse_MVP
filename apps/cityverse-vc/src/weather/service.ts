import { SimulationClock } from '../clock/clock.service.js'
import { getCalendarContext } from './calendar.js'
import { WEATHER_CONFIG } from './config.js'
import {
  clamp,
  computeBaselineTemp,
  computeCloudTarget,
  computeHumidityTarget,
  computeInstabilityTarget,
  computePrecipitationTarget,
  computePressureHelpers,
  computePressureStormContribution,
  computeSolarRadiation,
  computeStorminessTarget,
  computeTemperatureTarget,
  computeWindTarget,
  deriveCategory,
  getSeasonalBaseline,
  moveToward,
} from './rules.js'
import type { WeatherNudge, WeatherState } from './types.js'

export class WeatherService {
  private state: WeatherState
  private nudges: Required<WeatherNudge>
  private lastTickRealMs: number

  constructor(private readonly clock: SimulationClock) {
    this.nudges = {
      pressureBias: 0,
      cloudBias: 0,
      windBias: 0,
      tempBias: 0,
      humidityBias: 0,
    }
    this.lastTickRealMs = Date.now()
    this.state = this.createInitialState()
  }

  private createInitialState(): WeatherState {
    const simTime = this.clock.getState().simTime
    const cal = getCalendarContext(simTime)
    const baseline = getSeasonalBaseline(cal.season)
    const cloudCover01 = WEATHER_CONFIG.defaults.cloudCover01
    const solarRadiationWm2 = computeSolarRadiation(baseline, cal, cloudCover01)
    const baselineTemp = computeBaselineTemp(baseline, cal)
    const category = deriveCategory(0, WEATHER_CONFIG.defaults.windSpeedMps, 0.1, cloudCover01)

    return {
      simTime,
      season: cal.season,
      daylightFactor: cal.daylightFactor,
      solarRadiationWm2,
      pressureHpa: WEATHER_CONFIG.defaults.pressureHpa,
      pressureTrend: 0,
      temperatureC: baselineTemp,
      feelsLikeC: baselineTemp - Math.min(4, WEATHER_CONFIG.defaults.windSpeedMps * 0.15),
      humidity01: WEATHER_CONFIG.defaults.humidity01,
      cloudCover01,
      windSpeedMps: WEATHER_CONFIG.defaults.windSpeedMps,
      precipitation01: 0,
      storminess01: 0.1,
      instability01: 0.1,
      category,
    }
  }

  tick(): WeatherState {
    const now = Date.now()
    const realDeltaHours = (now - this.lastTickRealMs) / 3600000
    this.lastTickRealMs = now

    const clockState = this.clock.getState()
    const simSpeed = clockState.speed
    const dt = Math.max(1 / 3600, realDeltaHours * simSpeed)

    const previousPressure = this.state.pressureHpa
    const simTime = clockState.simTime
    const cal = getCalendarContext(simTime)
    const baseline = getSeasonalBaseline(cal.season)

    const pressureTarget = clamp(1015 + this.nudges.pressureBias, 980, 1045)
    const nextPressure = moveToward(this.state.pressureHpa, pressureTarget, WEATHER_CONFIG.responseRates.pressure, dt)
    const pressureTrend = (nextPressure - previousPressure) / dt

    const { lowPressureFactor, fallingPressureFactor } = computePressureHelpers(nextPressure, pressureTrend)
    const pressureStormContribution = computePressureStormContribution(lowPressureFactor, fallingPressureFactor)

    const humidityTarget = computeHumidityTarget(baseline, this.state.precipitation01, this.nudges.humidityBias)
    const humidity01 = moveToward(this.state.humidity01, humidityTarget, WEATHER_CONFIG.responseRates.humidity, dt)

    const storminessTarget = computeStorminessTarget(pressureStormContribution, humidity01, this.state.cloudCover01)
    const storminess01 = moveToward(this.state.storminess01, storminessTarget, WEATHER_CONFIG.responseRates.storminess, dt)

    const instabilityTarget = computeInstabilityTarget(humidity01, cal.daylightFactor, cal.summerFactor, fallingPressureFactor)
    const instability01 = moveToward(this.state.instability01, instabilityTarget, WEATHER_CONFIG.responseRates.instability, dt)

    const cloudTarget = computeCloudTarget(humidity01, lowPressureFactor, fallingPressureFactor, storminess01, this.nudges.cloudBias)
    const cloudCover01 = moveToward(this.state.cloudCover01, cloudTarget, WEATHER_CONFIG.responseRates.cloud, dt)

    const windTarget = computeWindTarget(baseline, fallingPressureFactor, storminess01, this.nudges.windBias)
    const windSpeedMps = moveToward(this.state.windSpeedMps, windTarget, WEATHER_CONFIG.responseRates.wind, dt)

    const precipitationTarget = computePrecipitationTarget(cloudCover01, humidity01, storminess01, lowPressureFactor)
    const precipitation01 = moveToward(this.state.precipitation01, precipitationTarget, WEATHER_CONFIG.responseRates.precipitation, dt)

    const solarRadiationWm2 = computeSolarRadiation(baseline, cal, cloudCover01)
    const baselineTemp = computeBaselineTemp(baseline, cal)
    const temperatureTarget = computeTemperatureTarget(
      baselineTemp,
      solarRadiationWm2,
      cloudCover01,
      cal.daylightFactor,
      windSpeedMps,
      precipitation01,
      this.nudges.tempBias,
      baseline,
    )
    const temperatureC = moveToward(this.state.temperatureC, temperatureTarget, WEATHER_CONFIG.responseRates.temperature, dt)
    const feelsLikeC = temperatureC - Math.min(4.0, windSpeedMps * 0.15)

    const category = deriveCategory(precipitation01, windSpeedMps, storminess01, cloudCover01)

    this.state = {
      simTime,
      season: cal.season,
      daylightFactor: cal.daylightFactor,
      solarRadiationWm2,
      pressureHpa: nextPressure,
      pressureTrend,
      temperatureC,
      feelsLikeC,
      humidity01,
      cloudCover01,
      windSpeedMps,
      precipitation01,
      storminess01,
      instability01,
      category,
    }

    return this.state
  }

  getState(): WeatherState {
    return this.tick()
  }

  applyNudge(nudge: WeatherNudge): WeatherState {
    if (typeof nudge.pressureBias === 'number') this.nudges.pressureBias = nudge.pressureBias
    if (typeof nudge.cloudBias === 'number') this.nudges.cloudBias = nudge.cloudBias
    if (typeof nudge.windBias === 'number') this.nudges.windBias = nudge.windBias
    if (typeof nudge.tempBias === 'number') this.nudges.tempBias = nudge.tempBias
    if (typeof nudge.humidityBias === 'number') this.nudges.humidityBias = nudge.humidityBias
    return this.getState()
  }
}
