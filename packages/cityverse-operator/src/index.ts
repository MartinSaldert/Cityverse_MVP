import { checkReachable } from './http.js'
import type { CityverseConfig, SystemStatus } from './types.js'

export { loadConfig } from './config.js'
export { getAuditLog, clearAuditLog } from './audit.js'
export { searchDocs } from './docs.js'

// Phase 2: scenario analysis
export {
  captureBaseline,
  validateBranch,
  validateBranchSafe,
  projectBranchState,
  compareScenario,
  KNOWN_LIMITATIONS,
  UNSUPPORTED_CLAIMS,
} from './analysis/index.js'

export type {
  BaselineSnapshot,
  BaselineSources,
  BaselineCapabilities,
  VcBaselineState,
  IotBaselineState,
  ScenarioBranch,
  ScenarioCommand,
  SupportedScenarioCommandName,
  ScenarioHorizon,
  ScenarioComparisonResult,
  BaselineSummary,
  BranchSummary,
  ScenarioMetricDelta,
  ScenarioEntityDelta,
  UnsupportedClaim,
  ScenarioProvenance,
  ProjectedBranchState,
} from './analysis/index.js'

export {
  getVcState,
  getVcClockState,
  getVcWeatherState,
  getVcEnergyState,
  getVcDemandState,
  getVcCityState,
  getVcBuildingsState,
  pauseSimulation,
  resumeSimulation,
  setSimulationSpeed,
  setSimulationTime,
  applyWeatherNudge,
} from './vc.js'

export {
  getIotWeatherState,
  getIotEnergyState,
  getIotDemandState,
  getIotCityState,
  getIotBuildingsState,
  getIotBuildingsSummary,
  getIotOpsSummary,
} from './iot.js'

export {
  getDtSceneState,
  getDtViewState,
  getDtEntityTwin,
  focusDtEntity,
  setDtViewMode,
} from './dt.js'

export type {
  CityverseConfig,
  SystemStatus,
  ServiceStatus,
  CommandResult,
  ReadResult,
  AuditEntry,
  WeatherNudge,
  DocsSearchResult,
  VcCommandName,
} from './types.js'

export async function checkSystemStatus(config: CityverseConfig): Promise<SystemStatus> {
  const [vc, iot, dt] = await Promise.all([
    checkReachable(config.vcBaseUrl, 'vc'),
    checkReachable(config.iotBaseUrl, 'iot'),
    checkReachable(config.dtBaseUrl, 'dt'),
  ])
  return { vc, iot, dt, checkedAt: new Date().toISOString() }
}
