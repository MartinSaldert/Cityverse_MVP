import type { CityverseConfig } from './types.js'
import type { ScenarioCommand, ScenarioComparisonResult, UnsupportedClaim } from './analysis/types.js'
import {
  captureBaseline,
  validateBranchSafe,
  projectBranchState,
  compareScenario,
  KNOWN_LIMITATIONS,
  UNSUPPORTED_CLAIMS,
} from './analysis/index.js'
import { getVcWeatherState, getVcEnergyState, getVcCityState } from './vc.js'
import { getIotWeatherState, getIotEnergyState, getIotCityState } from './iot.js'

// Canonical operator flow helpers for inspect → explain → propose → compare sequences.
// All analysis paths are non-live and deterministic (no live mutations).

export interface InspectStateResult {
  success: boolean
  vc: {
    weather: Record<string, unknown> | null
    energy: Record<string, unknown> | null
    city: Record<string, unknown> | null
  } | null
  iot: {
    weather: Record<string, unknown> | null
    energy: Record<string, unknown> | null
    city: Record<string, unknown> | null
  } | null
  warnings: string[]
  timestampUtc: string
}

export interface LimitationsSummary {
  limitations: string[]
  unsupportedClaims: UnsupportedClaim[]
}

export interface ScenarioFlowResult {
  flowId: string
  label: string
  comparison: ScenarioComparisonResult
  limitations: LimitationsSummary
  timestampUtc: string
}

export async function inspectState(config: CityverseConfig): Promise<InspectStateResult> {
  const warnings: string[] = []
  const timestampUtc = new Date().toISOString()

  const [vcWeather, vcEnergy, vcCity, iotWeather, iotEnergy, iotCity] = await Promise.all([
    getVcWeatherState(config),
    getVcEnergyState(config),
    getVcCityState(config),
    getIotWeatherState(config),
    getIotEnergyState(config),
    getIotCityState(config),
  ])

  const vcOk = vcWeather.success || vcEnergy.success || vcCity.success
  const iotOk = iotWeather.success || iotEnergy.success || iotCity.success

  if (!vcOk) warnings.push('VC service is not reachable. VC state is unavailable.')
  if (!iotOk) warnings.push('IOT service is not reachable or has no telemetry yet. IOT projected state is unavailable.')

  return {
    success: vcOk || iotOk,
    vc: vcOk
      ? {
          weather: vcWeather.data as Record<string, unknown> | null,
          energy: vcEnergy.data as Record<string, unknown> | null,
          city: vcCity.data as Record<string, unknown> | null,
        }
      : null,
    iot: iotOk
      ? {
          weather: iotWeather.data as Record<string, unknown> | null,
          energy: iotEnergy.data as Record<string, unknown> | null,
          city: iotCity.data as Record<string, unknown> | null,
        }
      : null,
    warnings,
    timestampUtc,
  }
}

export function explainLimitations(): LimitationsSummary {
  return {
    limitations: KNOWN_LIMITATIONS,
    unsupportedClaims: UNSUPPORTED_CLAIMS,
  }
}

export async function runScenarioComparison(
  config: CityverseConfig,
  commands: ScenarioCommand[],
  label: string,
): Promise<ScenarioFlowResult> {
  const flowId = `flow-${Date.now()}`

  const branchResult = validateBranchSafe({
    branchId: flowId,
    name: label,
    commands,
    horizon: { durationMinutes: 60, evaluationMode: 'instant' },
    assumptions: [],
  })

  if (!branchResult.ok) {
    throw new Error(`Invalid scenario branch: ${branchResult.errors.join(', ')}`)
  }

  const baseline = await captureBaseline(config)
  const projected = projectBranchState(baseline, branchResult.branch)
  const comparison = compareScenario(baseline, branchResult.branch, projected)

  return {
    flowId,
    label,
    comparison,
    limitations: explainLimitations(),
    timestampUtc: new Date().toISOString(),
  }
}
