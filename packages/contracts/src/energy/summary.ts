import { z } from 'zod'

export const EnergySummarySchema = z.object({
  solarOutputKw: z.number().min(0),
  windOutputKw: z.number().min(0),
  totalRenewableKw: z.number().min(0),
  oilBackupOutputKw: z.number().min(0),
  oilBackupOnline: z.boolean(),
  totalGenerationKw: z.number().min(0),
  currentCo2KgPerHour: z.number().min(0),
  gridIntensityKgPerMwh: z.number().min(0),
  updatedAt: z.string().datetime(),
})

export type EnergySummary = z.infer<typeof EnergySummarySchema>
