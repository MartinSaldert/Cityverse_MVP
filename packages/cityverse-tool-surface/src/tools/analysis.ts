import { z } from 'zod'
import {
  loadConfig,
  captureBaseline,
  validateBranchSafe,
  projectBranchState,
  compareScenario,
} from '../../../cityverse-operator/dist/index.js'
import type {
  CityverseConfig,
  BaselineSnapshot,
} from '../../../cityverse-operator/dist/index.js'
import type { ProjectedBranchState } from '../../../cityverse-operator/dist/analysis/projector.js'
import { errorEnvelope } from '../envelope.js'
import type { ToolEnvelope } from '../envelope.js'

export async function handleAnalysisCaptureBaseline(
  _input: Record<string, unknown> = {},
  config?: CityverseConfig,
): Promise<ToolEnvelope> {
  const cfg = config ?? loadConfig()
  const snapshot = await captureBaseline(cfg)
  return {
    success: true,
    tool: 'cityverse.analysis.capture_baseline',
    source: 'analysis',
    action: 'capture_baseline',
    timestampUtc: snapshot.capturedAtUtc,
    result: snapshot,
    errors: snapshot.warnings.length > 0 ? snapshot.warnings : [],
  }
}

const ProjectBranchInput = z.object({
  baseline: z.record(z.unknown()),
  branch: z.record(z.unknown()),
})

export async function handleAnalysisProjectBranch(
  input: Record<string, unknown> = {},
  _config?: CityverseConfig,
): Promise<ToolEnvelope> {
  const parsed = ProjectBranchInput.safeParse(input)
  if (!parsed.success) {
    return errorEnvelope(
      'cityverse.analysis.project_branch',
      'project_branch',
      'analysis',
      parsed.error.message,
    )
  }

  const branchResult = validateBranchSafe(parsed.data.branch)
  if (!branchResult.ok) {
    return errorEnvelope(
      'cityverse.analysis.project_branch',
      'project_branch',
      'analysis',
      `Branch validation failed: ${branchResult.errors.join('; ')}`,
    )
  }

  // baseline and projected are trusted output from prior tool calls — shape guaranteed by operator
  const baseline = parsed.data.baseline as unknown as BaselineSnapshot
  const projected = projectBranchState(baseline, branchResult.branch)

  return {
    success: true,
    tool: 'cityverse.analysis.project_branch',
    source: 'analysis',
    action: 'project_branch',
    timestampUtc: new Date().toISOString(),
    result: projected,
    errors: [],
  }
}

const CompareInput = z.object({
  baseline: z.record(z.unknown()),
  branch: z.record(z.unknown()),
  projected: z.record(z.unknown()),
})

export async function handleAnalysisCompare(
  input: Record<string, unknown> = {},
  _config?: CityverseConfig,
): Promise<ToolEnvelope> {
  const parsed = CompareInput.safeParse(input)
  if (!parsed.success) {
    return errorEnvelope(
      'cityverse.analysis.compare',
      'compare',
      'analysis',
      parsed.error.message,
    )
  }

  const branchResult = validateBranchSafe(parsed.data.branch)
  if (!branchResult.ok) {
    return errorEnvelope(
      'cityverse.analysis.compare',
      'compare',
      'analysis',
      `Branch validation failed: ${branchResult.errors.join('; ')}`,
    )
  }

  const baseline = parsed.data.baseline as unknown as BaselineSnapshot
  const projected = parsed.data.projected as unknown as ProjectedBranchState

  const result = compareScenario(
    baseline,
    branchResult.branch,
    projected,
  )

  return {
    success: true,
    tool: 'cityverse.analysis.compare',
    source: 'analysis',
    action: 'compare',
    timestampUtc: result.provenance.evaluatedAt,
    result,
    errors: [],
  }
}
