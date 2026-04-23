import { z } from 'zod'
import { BuildingDemandSchema } from './summary.js'

export const BuildingTelemetryPayloadSchema = z.object({
  updatedAt: z.string().datetime(),
  buildings: z.array(BuildingDemandSchema),
})

export type BuildingTelemetryPayload = z.infer<typeof BuildingTelemetryPayloadSchema>
