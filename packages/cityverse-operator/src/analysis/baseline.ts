import { randomUUID } from 'node:crypto'
import {
  getVcClockState,
  getVcWeatherState,
  getVcEnergyState,
  getVcCityState,
  getVcBuildingsState,
} from '../vc.js'
import {
  getIotWeatherState,
  getIotEnergyState,
  getIotDemandState,
  getIotCityState,
  getIotBuildingsState,
} from '../iot.js'
import type { CityverseConfig, ReadResult } from '../types.js'
import type {
  BaselineSnapshot,
  VcBaselineState,
  IotBaselineState,
  BaselineSources,
  BaselineCapabilities,
} from './types.js'

// Strip the { ok, data: <actual> } or { data: <actual> } API envelope.
// Returns the inner data object, or the raw object if no envelope is detected.
function unwrapEnvelope(raw: unknown): Record<string, unknown> | null {
  if (raw === null || raw === undefined) return null
  if (typeof raw !== 'object') return null
  const d = raw as Record<string, unknown>
  if ('data' in d && d.data !== null && d.data !== undefined && typeof d.data === 'object' && !Array.isArray(d.data)) {
    return d.data as Record<string, unknown>
  }
  return d
}

function extractRecord(
  result: PromiseSettledResult<ReadResult>,
  label: string,
  warnings: string[]
): Record<string, unknown> | null {
  if (result.status === 'rejected') {
    warnings.push(`${label}: request failed — ${String(result.reason)}`)
    return null
  }
  const rr = result.value
  if (!rr.success || rr.data === null || rr.data === undefined) {
    if (rr.error) warnings.push(`${label}: ${rr.error}`)
    return null
  }
  return unwrapEnvelope(rr.data)
}

function extractArray(
  result: PromiseSettledResult<ReadResult>,
  label: string,
  warnings: string[]
): unknown[] | null {
  if (result.status === 'rejected') {
    warnings.push(`${label}: request failed — ${String(result.reason)}`)
    return null
  }
  const rr = result.value
  if (!rr.success || rr.data === null || rr.data === undefined) {
    if (rr.error) warnings.push(`${label}: ${rr.error}`)
    return null
  }
  const raw = rr.data
  if (Array.isArray(raw)) return raw as unknown[]
  if (typeof raw === 'object' && raw !== null) {
    const d = raw as Record<string, unknown>
    if (Array.isArray(d.data)) return d.data as unknown[]
  }
  return null
}

export async function captureBaseline(config: CityverseConfig): Promise<BaselineSnapshot> {
  const snapshotId = `snap-${randomUUID()}`
  const capturedAtUtc = new Date().toISOString()
  const warnings: string[] = []

  const [vcClock, vcWeather, vcEnergy, vcCity, vcBuildings] = await Promise.allSettled([
    getVcClockState(config),
    getVcWeatherState(config),
    getVcEnergyState(config),
    getVcCityState(config),
    getVcBuildingsState(config),
  ])

  const [iotWeather, iotEnergy, iotDemand, iotCity, iotBuildings] = await Promise.allSettled([
    getIotWeatherState(config),
    getIotEnergyState(config),
    getIotDemandState(config),
    getIotCityState(config),
    getIotBuildingsState(config),
  ])

  const vcClockData = extractRecord(vcClock, 'vc.clock', warnings)
  const vcWeatherData = extractRecord(vcWeather, 'vc.weather', warnings)
  const vcEnergyData = extractRecord(vcEnergy, 'vc.energy', warnings)
  const vcCityData = extractRecord(vcCity, 'vc.city', warnings)
  const vcBuildingsData = extractArray(vcBuildings, 'vc.buildings', warnings)

  const vcReachable = [vcClockData, vcWeatherData, vcEnergyData, vcCityData].some(d => d !== null)

  const iotWeatherData = extractRecord(iotWeather, 'iot.weather', warnings)
  const iotEnergyData = extractRecord(iotEnergy, 'iot.energy', warnings)
  const iotDemandData = extractRecord(iotDemand, 'iot.demand', warnings)
  const iotCityData = extractRecord(iotCity, 'iot.city', warnings)
  const iotBuildingsData = extractArray(iotBuildings, 'iot.buildings', warnings)

  const iotReachable = [iotWeatherData, iotEnergyData, iotCityData].some(d => d !== null)

  const vc: VcBaselineState | null = vcReachable
    ? {
        clock: vcClockData,
        weather: vcWeatherData,
        energy: vcEnergyData,
        city: vcCityData,
        buildings: vcBuildingsData,
      }
    : null

  const iot: IotBaselineState | null = iotReachable
    ? {
        weather: iotWeatherData,
        energy: iotEnergyData,
        demand: iotDemandData,
        city: iotCityData,
        buildings: iotBuildingsData,
      }
    : null

  const sources: BaselineSources = {
    vc: vcReachable ? 'live' : 'unavailable',
    iot: iotReachable ? 'live' : 'unavailable',
    dt: 'unavailable',
  }

  const capabilities: BaselineCapabilities = {
    vcReachable,
    iotReachable,
    dtReachable: false,
  }

  if (!vcReachable) {
    warnings.push('VC service unavailable — analysis will use null energy/weather baseline')
  }
  if (!iotReachable) {
    warnings.push('IOT service unavailable — IOT state missing from baseline')
  }
  warnings.push('DT service not implemented — DT scene impact unavailable in all scenarios')

  return {
    snapshotId,
    capturedAtUtc,
    profile: config.profile,
    sources,
    capabilities,
    vc,
    iot,
    dt: null,
    warnings,
  }
}
