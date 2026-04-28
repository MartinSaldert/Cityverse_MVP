import type { BaselineSnapshot, ScenarioBranch } from './types.js'

export interface ProjectedBranchState {
  branchId: string
  horizon: ScenarioBranch['horizon']
  // Weather (field names match WeatherSummary contract)
  temperatureC: number | null
  cloudCover: number | null
  windSpeedMs: number | null
  humidity: number | null
  pressureHpa: number | null
  // Energy (field names match EnergySummary contract)
  solarOutputKw: number | null
  windOutputKw: number | null
  totalRenewableKw: number | null
  oilBackupOutputKw: number | null
  oilBackupOnline: boolean | null
  totalGenerationKw: number | null
  currentCo2KgPerHour: number | null
  // City
  demandKw: number | null
  balanceKw: number | null
  // Clock
  simTime: string | null
  speed: number | null
  // Notes accumulated during projection
  estimationNotes: string[]
}

// Safe deep-read helpers — never mutate the source object
function num(obj: unknown, ...keys: string[]): number | null {
  let v: unknown = obj
  for (const k of keys) {
    if (v === null || v === undefined || typeof v !== 'object') return null
    v = (v as Record<string, unknown>)[k]
  }
  return typeof v === 'number' ? v : null
}

function boolVal(obj: unknown, ...keys: string[]): boolean | null {
  let v: unknown = obj
  for (const k of keys) {
    if (v === null || v === undefined || typeof v !== 'object') return null
    v = (v as Record<string, unknown>)[k]
  }
  return typeof v === 'boolean' ? v : null
}

function strVal(obj: unknown, ...keys: string[]): string | null {
  let v: unknown = obj
  for (const k of keys) {
    if (v === null || v === undefined || typeof v !== 'object') return null
    v = (v as Record<string, unknown>)[k]
  }
  return typeof v === 'string' ? v : null
}

// Simplified daylight model: sin curve from 06:00 to 20:00, 0 outside that window
function solarFactor(hour: number): number {
  if (hour < 6 || hour >= 20) return 0
  return Math.sin(Math.PI * (hour - 6) / 14)
}

function extractHour(simTime: string | null): number | null {
  if (!simTime) return null
  const m = simTime.match(/T(\d{2}):/) ?? simTime.match(/^(\d{2}):/)
  return m ? parseInt(m[1], 10) : null
}

// Applies branch commands to baseline snapshot values in memory.
// Does NOT call any live service endpoints. Baseline objects are read-only.
export function projectBranchState(
  baseline: BaselineSnapshot,
  branch: ScenarioBranch
): ProjectedBranchState {
  const vc = baseline.vc
  const notes: string[] = []

  // Extract baseline primitives — reading from objects does not mutate them
  let temperatureC = num(vc?.weather, 'temperatureC')
  let cloudCover = num(vc?.weather, 'cloudCover')
  let windSpeedMs = num(vc?.weather, 'windSpeedMs')
  let humidity = num(vc?.weather, 'humidity')
  let pressureHpa = num(vc?.weather, 'pressureHpa')
  let solarOutputKw = num(vc?.energy, 'solarOutputKw')
  let windOutputKw = num(vc?.energy, 'windOutputKw')
  let oilBackupOutputKw = num(vc?.energy, 'oilBackupOutputKw')
  let oilBackupOnline = boolVal(vc?.energy, 'oilBackupOnline')
  let currentCo2KgPerHour = num(vc?.energy, 'currentCo2KgPerHour')
  let demandKw = num(vc?.city, 'demand', 'demandKw')
  let simTime = strVal(vc?.clock, 'simTime')
  let speed = num(vc?.clock, 'speed')

  const sorted = [...branch.commands].sort((a, b) => a.order - b.order)

  for (const cmd of sorted) {
    if (cmd.commandName === 'set_time') {
      const newTime = cmd.payload.simTime
      if (typeof newTime === 'string') {
        const oldHour = extractHour(simTime)
        const newHour = extractHour(newTime)
        simTime = newTime
        if (oldHour !== null && newHour !== null && solarOutputKw !== null) {
          const oldF = solarFactor(oldHour)
          const newF = solarFactor(newHour)
          solarOutputKw = oldF > 0
            ? Math.max(0, solarOutputKw * newF / oldF)
            : 0
          notes.push(`Solar adjusted for time change hour ${oldHour}→${newHour} using simplified sin daylight model.`)
        } else {
          notes.push('Could not adjust solar for time change: clock or solar baseline data unavailable.')
        }
      }
    } else if (cmd.commandName === 'set_speed') {
      const s = cmd.payload.speed
      if (typeof s === 'number') {
        speed = s
        notes.push('Speed change affects simulation rate, not instantaneous state values.')
      }
    } else if (cmd.commandName === 'weather_nudge') {
      const p = cmd.payload as Record<string, unknown>

      if (typeof p.tempBias === 'number') {
        temperatureC = (temperatureC ?? 0) + p.tempBias
      }

      if (typeof p.cloudBias === 'number') {
        const oldCloud = cloudCover ?? 0.5
        if (cloudCover === null) {
          notes.push('cloudCover not in baseline; assumed 0.5 for cloudBias projection.')
        }
        cloudCover = Math.max(0, Math.min(1, oldCloud + p.cloudBias))
        if (solarOutputKw !== null) {
          const oldSolarFrac = Math.max(0, 1 - oldCloud)
          const newSolarFrac = Math.max(0, 1 - cloudCover)
          solarOutputKw = oldSolarFrac > 0
            ? Math.max(0, solarOutputKw * newSolarFrac / oldSolarFrac)
            : 0
          notes.push('Solar output scaled proportionally to cloud cover change (simplified linear model).')
        }
      }

      if (typeof p.windBias === 'number') {
        const oldWind = windSpeedMs ?? 0
        windSpeedMs = Math.max(0, oldWind + p.windBias)
        if (windOutputKw !== null && oldWind > 0) {
          windOutputKw = Math.max(0, windOutputKw * windSpeedMs / oldWind)
          notes.push('Wind output scaled proportionally to wind speed (simplified linear; actual is cubic in wind speed).')
        } else if (windOutputKw !== null && oldWind === 0 && windSpeedMs > 0) {
          notes.push('Wind speed increased from 0; output cannot be derived without rated capacity data.')
        }
      }

      if (typeof p.humidityBias === 'number') {
        humidity = Math.max(0, Math.min(100, (humidity ?? 50) + p.humidityBias))
      }

      if (typeof p.pressureBias === 'number') {
        pressureHpa = Math.max(870, Math.min(1085, (pressureHpa ?? 1013) + p.pressureBias))
        notes.push('Pressure change has no direct effect on energy output in the current model.')
      }
    }
  }

  const totalRenewableKw =
    solarOutputKw !== null || windOutputKw !== null
      ? (solarOutputKw ?? 0) + (windOutputKw ?? 0)
      : null

  const totalGenerationKw =
    totalRenewableKw !== null || oilBackupOutputKw !== null
      ? (totalRenewableKw ?? 0) + (oilBackupOutputKw ?? 0)
      : null

  const balanceKw =
    totalGenerationKw !== null || demandKw !== null
      ? (totalGenerationKw ?? 0) - (demandKw ?? 0)
      : null

  return {
    branchId: branch.branchId,
    horizon: branch.horizon,
    temperatureC,
    cloudCover,
    windSpeedMs,
    humidity,
    pressureHpa,
    solarOutputKw,
    windOutputKw,
    totalRenewableKw,
    oilBackupOutputKw,
    oilBackupOnline,
    totalGenerationKw,
    currentCo2KgPerHour,
    demandKw,
    balanceKw,
    simTime,
    speed,
    estimationNotes: notes,
  }
}
