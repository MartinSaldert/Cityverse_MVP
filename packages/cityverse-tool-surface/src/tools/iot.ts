import {
  loadConfig,
  getIotWeatherState,
  getIotEnergyState,
  getIotCityState,
  getIotBuildingsState,
  getIotOpsSummary,
} from '../../../cityverse-operator/dist/index.js'
import type { CityverseConfig } from '../../../cityverse-operator/dist/index.js'
import { fromReadResult } from '../envelope.js'
import type { ToolEnvelope } from '../envelope.js'

export async function handleIotGetWeather(
  _input: Record<string, unknown> = {},
  config?: CityverseConfig,
): Promise<ToolEnvelope> {
  const cfg = config ?? loadConfig()
  const r = await getIotWeatherState(cfg)
  return fromReadResult('cityverse.iot.get_weather', r)
}

export async function handleIotGetEnergy(
  _input: Record<string, unknown> = {},
  config?: CityverseConfig,
): Promise<ToolEnvelope> {
  const cfg = config ?? loadConfig()
  const r = await getIotEnergyState(cfg)
  return fromReadResult('cityverse.iot.get_energy', r)
}

export async function handleIotGetCity(
  _input: Record<string, unknown> = {},
  config?: CityverseConfig,
): Promise<ToolEnvelope> {
  const cfg = config ?? loadConfig()
  const r = await getIotCityState(cfg)
  return fromReadResult('cityverse.iot.get_city', r)
}

export async function handleIotGetBuildings(
  _input: Record<string, unknown> = {},
  config?: CityverseConfig,
): Promise<ToolEnvelope> {
  const cfg = config ?? loadConfig()
  const r = await getIotBuildingsState(cfg)
  return fromReadResult('cityverse.iot.get_buildings', r)
}

export async function handleIotGetOpsSummary(
  _input: Record<string, unknown> = {},
  config?: CityverseConfig,
): Promise<ToolEnvelope> {
  const cfg = config ?? loadConfig()
  const r = await getIotOpsSummary(cfg)
  return fromReadResult('cityverse.iot.get_ops_summary', r)
}
