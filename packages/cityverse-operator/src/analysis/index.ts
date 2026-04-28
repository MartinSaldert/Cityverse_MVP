export { captureBaseline } from './baseline.js'
export { validateBranch, validateBranchSafe } from './branch.js'
export { projectBranchState } from './projector.js'
export type { ProjectedBranchState } from './projector.js'
export { compareScenario } from './compare.js'
export { KNOWN_LIMITATIONS, UNSUPPORTED_CLAIMS } from './limits.js'

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
} from './types.js'
