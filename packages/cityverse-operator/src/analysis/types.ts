export interface BaselineSnapshot {
  snapshotId: string
  capturedAtUtc: string
  profile: string
  sources: BaselineSources
  capabilities: BaselineCapabilities
  vc: VcBaselineState | null
  iot: IotBaselineState | null
  dt: null
  warnings: string[]
}

export interface BaselineSources {
  vc: 'live' | 'unavailable'
  iot: 'live' | 'unavailable'
  dt: 'unavailable'
}

export interface BaselineCapabilities {
  vcReachable: boolean
  iotReachable: boolean
  dtReachable: false
}

// Stores unwrapped API response objects (envelope already stripped)
export interface VcBaselineState {
  clock: Record<string, unknown> | null
  weather: Record<string, unknown> | null
  energy: Record<string, unknown> | null
  city: Record<string, unknown> | null
  buildings: unknown[] | null
}

export interface IotBaselineState {
  weather: Record<string, unknown> | null
  energy: Record<string, unknown> | null
  demand: Record<string, unknown> | null
  city: Record<string, unknown> | null
  buildings: unknown | null
}

export interface ScenarioBranch {
  branchId: string
  name: string
  description?: string
  commands: ScenarioCommand[]
  horizon: ScenarioHorizon
  assumptions: string[]
}

export interface ScenarioCommand {
  targetService: 'vc' | 'iot' | 'dt' | 'analysis'
  commandName: SupportedScenarioCommandName
  targetEntityId: string | null
  payload: Record<string, unknown>
  order: number
  intentSummary?: string
}

export type SupportedScenarioCommandName = 'set_time' | 'set_speed' | 'weather_nudge'

export interface ScenarioHorizon {
  durationMinutes: number
  sampleIntervalMinutes?: number
  evaluationMode: 'instant' | 'projected'
}

export interface ScenarioComparisonResult {
  baseline: BaselineSummary
  branch: BranchSummary
  metricDeltas: ScenarioMetricDelta[]
  entityDeltas: ScenarioEntityDelta[]
  topFindings: string[]
  riskNotes: string[]
  limitations: string[]
  unsupportedClaims: UnsupportedClaim[]
  provenance: ScenarioProvenance
}

export interface BaselineSummary {
  snapshotId: string
  capturedAtUtc: string
  profile: string
  sources: BaselineSources
  capabilities: BaselineCapabilities
  vcClockSummary?: string
  vcWeatherSummary?: string
  vcEnergySummary?: string
  vcCitySummary?: string
}

export interface BranchSummary {
  branchId: string
  name: string
  commandsApplied: number
  horizon: ScenarioHorizon
  evaluationMode: 'instant' | 'projected'
}

export interface ScenarioMetricDelta {
  metric: string
  baselineValue: number | null
  branchValue: number | null
  absoluteDelta: number | null
  relativeDelta: number | null
  units: string | null
  note?: string
}

export interface ScenarioEntityDelta {
  entityId: string
  entityType: string
  metric: string
  baselineValue: number | null
  branchValue: number | null
  absoluteDelta: number | null
  units: string | null
}

export interface UnsupportedClaim {
  claim: string
  reason: string
}

export interface ScenarioProvenance {
  method: string
  engineVersion: string
  capturedAt: string
  evaluatedAt: string
  commandsApplied: Array<{
    order: number
    commandName: string
    targetService: string
    intentSummary?: string
  }>
}
