import { z } from 'zod'
import type { ScenarioBranch } from './types.js'

const ScenarioCommandSchema = z.object({
  targetService: z.enum(['vc', 'iot', 'dt', 'analysis']),
  commandName: z.enum(['set_time', 'set_speed', 'weather_nudge']),
  targetEntityId: z.string().nullable().default(null),
  payload: z.record(z.unknown()),
  order: z.number().int().min(0),
  intentSummary: z.string().optional(),
})

const ScenarioHorizonSchema = z.object({
  durationMinutes: z.number().positive(),
  sampleIntervalMinutes: z.number().positive().optional(),
  evaluationMode: z.enum(['instant', 'projected']),
})

const ScenarioBranchSchema = z.object({
  branchId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  commands: z.array(ScenarioCommandSchema),
  horizon: ScenarioHorizonSchema,
  assumptions: z.array(z.string()),
})

export function validateBranch(input: unknown): ScenarioBranch {
  return ScenarioBranchSchema.parse(input) as ScenarioBranch
}

export function validateBranchSafe(
  input: unknown
): { ok: true; branch: ScenarioBranch } | { ok: false; errors: string[] } {
  const result = ScenarioBranchSchema.safeParse(input)
  if (!result.success) {
    return {
      ok: false,
      errors: result.error.errors.map(e => `${e.path.join('.') || 'root'}: ${e.message}`),
    }
  }
  return { ok: true, branch: result.data as ScenarioBranch }
}
