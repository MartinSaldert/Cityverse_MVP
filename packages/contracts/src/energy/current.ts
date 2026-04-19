import { z } from 'zod'
import { EnergySummarySchema } from './summary.js'

export const CurrentEnergyResponseSchema = z.object({
  ok: z.literal(true),
  data: EnergySummarySchema,
})

export type CurrentEnergyResponse = z.infer<typeof CurrentEnergyResponseSchema>
