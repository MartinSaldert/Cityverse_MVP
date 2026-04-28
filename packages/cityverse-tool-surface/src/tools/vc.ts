import { z } from 'zod'
import {
  loadConfig,
  getVcState,
  getVcClockState,
  getVcWeatherState,
  getVcEnergyState,
  getVcCityState,
  getVcBuildingsState,
  pauseSimulation,
  resumeSimulation,
  setSimulationSpeed,
  setSimulationTime,
  applyWeatherNudge,
} from '../../../cityverse-operator/dist/index.js'
import type { CityverseConfig } from '../../../cityverse-operator/dist/index.js'
import { fromReadResult, fromCommandResult, errorEnvelope } from '../envelope.js'
import type { ToolEnvelope } from '../envelope.js'

const DEFAULT_ACTOR = 'cityverse_operator'

// --- Input schemas ---

const ActorInput = z.object({ actor: z.string().optional() })

const SetSpeedInput = z.object({
  speed: z.number().positive('speed must be a positive number'),
  actor: z.string().optional(),
})

const SetTimeInput = z.object({
  simTime: z.string().min(1, 'simTime must be a non-empty ISO string'),
  actor: z.string().optional(),
})

const WeatherNudgeInput = z.object({
  nudge: z.object({
    pressureBias: z.number().optional(),
    cloudBias: z.number().optional(),
    windBias: z.number().optional(),
    tempBias: z.number().optional(),
    humidityBias: z.number().optional(),
  }),
  actor: z.string().optional(),
})

// --- Reads ---

export async function handleVcGetState(
  _input: Record<string, unknown> = {},
  config?: CityverseConfig,
): Promise<ToolEnvelope> {
  const cfg = config ?? loadConfig()
  const r = await getVcState(cfg)
  return fromReadResult('cityverse.vc.get_state', r)
}

export async function handleVcGetClock(
  _input: Record<string, unknown> = {},
  config?: CityverseConfig,
): Promise<ToolEnvelope> {
  const cfg = config ?? loadConfig()
  const r = await getVcClockState(cfg)
  return fromReadResult('cityverse.vc.get_clock', r)
}

export async function handleVcGetWeather(
  _input: Record<string, unknown> = {},
  config?: CityverseConfig,
): Promise<ToolEnvelope> {
  const cfg = config ?? loadConfig()
  const r = await getVcWeatherState(cfg)
  return fromReadResult('cityverse.vc.get_weather', r)
}

export async function handleVcGetEnergy(
  _input: Record<string, unknown> = {},
  config?: CityverseConfig,
): Promise<ToolEnvelope> {
  const cfg = config ?? loadConfig()
  const r = await getVcEnergyState(cfg)
  return fromReadResult('cityverse.vc.get_energy', r)
}

export async function handleVcGetCity(
  _input: Record<string, unknown> = {},
  config?: CityverseConfig,
): Promise<ToolEnvelope> {
  const cfg = config ?? loadConfig()
  const r = await getVcCityState(cfg)
  return fromReadResult('cityverse.vc.get_city', r)
}

export async function handleVcGetBuildings(
  _input: Record<string, unknown> = {},
  config?: CityverseConfig,
): Promise<ToolEnvelope> {
  const cfg = config ?? loadConfig()
  const r = await getVcBuildingsState(cfg)
  return fromReadResult('cityverse.vc.get_buildings', r)
}

// --- Commands ---

export async function handleVcPause(
  input: Record<string, unknown> = {},
  config?: CityverseConfig,
): Promise<ToolEnvelope> {
  const parsed = ActorInput.safeParse(input)
  if (!parsed.success) return errorEnvelope('cityverse.vc.pause', 'pause', 'vc', parsed.error.message)
  const cfg = config ?? loadConfig()
  const r = await pauseSimulation(cfg, parsed.data.actor ?? DEFAULT_ACTOR)
  return fromCommandResult('cityverse.vc.pause', r)
}

export async function handleVcResume(
  input: Record<string, unknown> = {},
  config?: CityverseConfig,
): Promise<ToolEnvelope> {
  const parsed = ActorInput.safeParse(input)
  if (!parsed.success) return errorEnvelope('cityverse.vc.resume', 'resume', 'vc', parsed.error.message)
  const cfg = config ?? loadConfig()
  const r = await resumeSimulation(cfg, parsed.data.actor ?? DEFAULT_ACTOR)
  return fromCommandResult('cityverse.vc.resume', r)
}

export async function handleVcSetSpeed(
  input: Record<string, unknown> = {},
  config?: CityverseConfig,
): Promise<ToolEnvelope> {
  const parsed = SetSpeedInput.safeParse(input)
  if (!parsed.success) return errorEnvelope('cityverse.vc.set_speed', 'set_speed', 'vc', parsed.error.message)
  const cfg = config ?? loadConfig()
  const r = await setSimulationSpeed(cfg, parsed.data.speed, parsed.data.actor ?? DEFAULT_ACTOR)
  return fromCommandResult('cityverse.vc.set_speed', r)
}

export async function handleVcSetTime(
  input: Record<string, unknown> = {},
  config?: CityverseConfig,
): Promise<ToolEnvelope> {
  const parsed = SetTimeInput.safeParse(input)
  if (!parsed.success) return errorEnvelope('cityverse.vc.set_time', 'set_time', 'vc', parsed.error.message)
  const cfg = config ?? loadConfig()
  const r = await setSimulationTime(cfg, parsed.data.simTime, parsed.data.actor ?? DEFAULT_ACTOR)
  return fromCommandResult('cityverse.vc.set_time', r)
}

export async function handleVcWeatherNudge(
  input: Record<string, unknown> = {},
  config?: CityverseConfig,
): Promise<ToolEnvelope> {
  const parsed = WeatherNudgeInput.safeParse(input)
  if (!parsed.success) return errorEnvelope('cityverse.vc.weather_nudge', 'weather_nudge', 'vc', parsed.error.message)
  const cfg = config ?? loadConfig()
  const r = await applyWeatherNudge(cfg, parsed.data.nudge, parsed.data.actor ?? DEFAULT_ACTOR)
  return fromCommandResult('cityverse.vc.weather_nudge', r)
}
