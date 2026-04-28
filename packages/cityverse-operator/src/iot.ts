import { httpGet } from './http.js'
import type { CityverseConfig, ReadResult } from './types.js'

function readOk<T>(action: string, data: T): ReadResult<T> {
  return { success: true, source: 'iot', action, timestampUtc: now(), data }
}

function readErr(action: string, err: unknown): ReadResult {
  return { success: false, source: 'iot', action, timestampUtc: now(), data: null, error: message(err) }
}

export async function getIotWeatherState(config: CityverseConfig): Promise<ReadResult> {
  try {
    const data = await httpGet(`${config.iotBaseUrl}/weather/current`)
    return readOk('get_weather', data)
  } catch (err) { return readErr('get_weather', err) }
}

export async function getIotEnergyState(config: CityverseConfig): Promise<ReadResult> {
  try {
    const data = await httpGet(`${config.iotBaseUrl}/energy/current`)
    return readOk('get_energy', data)
  } catch (err) { return readErr('get_energy', err) }
}

export async function getIotDemandState(config: CityverseConfig): Promise<ReadResult> {
  try {
    const data = await httpGet(`${config.iotBaseUrl}/demand/current`)
    return readOk('get_demand', data)
  } catch (err) { return readErr('get_demand', err) }
}

export async function getIotCityState(config: CityverseConfig): Promise<ReadResult> {
  try {
    const data = await httpGet(`${config.iotBaseUrl}/city/current`)
    return readOk('get_city', data)
  } catch (err) { return readErr('get_city', err) }
}

export async function getIotBuildingsState(config: CityverseConfig): Promise<ReadResult> {
  try {
    const data = await httpGet(`${config.iotBaseUrl}/buildings/current`)
    return readOk('get_buildings', data)
  } catch (err) { return readErr('get_buildings', err) }
}

export async function getIotBuildingsSummary(config: CityverseConfig): Promise<ReadResult> {
  try {
    const data = await httpGet(`${config.iotBaseUrl}/buildings/summary`)
    return readOk('get_buildings_summary', data)
  } catch (err) { return readErr('get_buildings_summary', err) }
}

export async function getIotOpsSummary(config: CityverseConfig): Promise<ReadResult> {
  try {
    const data = await httpGet(`${config.iotBaseUrl}/ops/summary`)
    return readOk('get_ops_summary', data)
  } catch (err) { return readErr('get_ops_summary', err) }
}

function now(): string {
  return new Date().toISOString()
}

function message(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}
