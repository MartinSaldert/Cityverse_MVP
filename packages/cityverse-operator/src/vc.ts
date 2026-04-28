import { randomUUID } from 'node:crypto'
import { httpGet, httpPost } from './http.js'
import { recordAuditEntry } from './audit.js'
import type { CityverseConfig, CommandResult, ReadResult, WeatherNudge } from './types.js'

// --- Read helpers ---

function readOk<T>(action: string, data: T): ReadResult<T> {
  return { success: true, source: 'vc', action, timestampUtc: now(), data }
}

function readErr(action: string, err: unknown): ReadResult {
  return { success: false, source: 'vc', action, timestampUtc: now(), data: null, error: message(err) }
}

// --- Command helper ---

async function executeVcCommand<T>(
  action: string,
  actor: string,
  entityId: string | null,
  payload: unknown,
  fn: () => Promise<T>
): Promise<CommandResult<T>> {
  const commandId = `cmd-${randomUUID()}`
  const timestampUtc = now()
  const payloadSummary = JSON.stringify(payload).slice(0, 256)

  try {
    const result = await fn()
    recordAuditEntry({ commandId, timestampUtc, action, actor, targetService: 'vc', targetEntityId: entityId, payloadSummary, resultStatus: 'success' })
    return { success: true, commandId, timestampUtc, action, actor, target: { service: 'vc', entityId }, payload, result, errors: [] }
  } catch (err) {
    const msg = message(err)
    recordAuditEntry({ commandId, timestampUtc, action, actor, targetService: 'vc', targetEntityId: entityId, payloadSummary, resultStatus: 'failure', errorCode: 'command_failed' })
    return { success: false, commandId, timestampUtc, action, actor, target: { service: 'vc', entityId }, payload, result: null, errors: [{ code: 'command_failed', message: msg }] }
  }
}

// --- Reads ---

export async function getVcClockState(config: CityverseConfig): Promise<ReadResult> {
  try {
    const data = await httpGet(`${config.vcBaseUrl}/api/clock`)
    return readOk('get_clock', data)
  } catch (err) { return readErr('get_clock', err) }
}

export async function getVcWeatherState(config: CityverseConfig): Promise<ReadResult> {
  try {
    const data = await httpGet(`${config.vcBaseUrl}/api/weather/current`)
    return readOk('get_weather', data)
  } catch (err) { return readErr('get_weather', err) }
}

export async function getVcEnergyState(config: CityverseConfig): Promise<ReadResult> {
  try {
    const data = await httpGet(`${config.vcBaseUrl}/api/energy/current`)
    return readOk('get_energy', data)
  } catch (err) { return readErr('get_energy', err) }
}

export async function getVcDemandState(config: CityverseConfig): Promise<ReadResult> {
  try {
    const data = await httpGet(`${config.vcBaseUrl}/api/demand/current`)
    return readOk('get_demand', data)
  } catch (err) { return readErr('get_demand', err) }
}

export async function getVcCityState(config: CityverseConfig): Promise<ReadResult> {
  try {
    const data = await httpGet(`${config.vcBaseUrl}/api/city/current`)
    return readOk('get_city', data)
  } catch (err) { return readErr('get_city', err) }
}

export async function getVcBuildingsState(config: CityverseConfig): Promise<ReadResult> {
  try {
    const data = await httpGet(`${config.vcBaseUrl}/api/buildings/current`)
    return readOk('get_buildings', data)
  } catch (err) { return readErr('get_buildings', err) }
}

// Composite: fetch clock, weather, energy, city in parallel
export async function getVcState(config: CityverseConfig): Promise<ReadResult<Record<string, unknown>>> {
  const [clock, weather, energy, city] = await Promise.allSettled([
    httpGet(`${config.vcBaseUrl}/api/clock`),
    httpGet(`${config.vcBaseUrl}/api/weather/current`),
    httpGet(`${config.vcBaseUrl}/api/energy/current`),
    httpGet(`${config.vcBaseUrl}/api/city/current`),
  ])

  const state: Record<string, unknown> = {
    clock: settled(clock),
    weather: settled(weather),
    energy: settled(energy),
    city: settled(city),
  }

  const anySuccess = [clock, weather, energy, city].some(r => r.status === 'fulfilled')
  return {
    success: anySuccess,
    source: 'vc',
    action: 'get_state',
    timestampUtc: now(),
    data: state,
  }
}

// --- Commands (Phase 1 narrow safe set) ---

export async function pauseSimulation(config: CityverseConfig, actor: string): Promise<CommandResult> {
  return executeVcCommand('pause', actor, null, {}, () =>
    httpPost(`${config.vcBaseUrl}/api/clock/pause`, {})
  )
}

export async function resumeSimulation(config: CityverseConfig, actor: string): Promise<CommandResult> {
  return executeVcCommand('resume', actor, null, {}, () =>
    httpPost(`${config.vcBaseUrl}/api/clock/resume`, {})
  )
}

export async function setSimulationSpeed(config: CityverseConfig, speed: number, actor: string): Promise<CommandResult> {
  const payload = { speed }
  return executeVcCommand('set_speed', actor, null, payload, () =>
    httpPost(`${config.vcBaseUrl}/api/clock/speed`, payload)
  )
}

export async function setSimulationTime(config: CityverseConfig, simTime: string, actor: string): Promise<CommandResult> {
  const payload = { simTime }
  return executeVcCommand('set_time', actor, null, payload, () =>
    httpPost(`${config.vcBaseUrl}/api/clock/time`, payload)
  )
}

export async function applyWeatherNudge(config: CityverseConfig, nudge: WeatherNudge, actor: string): Promise<CommandResult> {
  return executeVcCommand('weather_nudge', actor, null, nudge, () =>
    httpPost(`${config.vcBaseUrl}/api/weather/nudge`, nudge)
  )
}

// --- Utilities ---

function now(): string {
  return new Date().toISOString()
}

function message(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}

function settled<T>(r: PromiseSettledResult<T>): T | { error: string } {
  return r.status === 'fulfilled' ? r.value : { error: message(r.reason) }
}
