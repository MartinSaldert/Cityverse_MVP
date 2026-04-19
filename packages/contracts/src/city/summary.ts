import { z } from 'zod'
import { EnergySummarySchema } from '../energy/summary.js'
import { WeatherSummarySchema } from '../weather/summary.js'

export const DemandSummarySchema = z.object({
  demandKw: z.number().min(0),
  updatedAt: z.string().datetime(),
})

export const CitySummarySchema = z.object({
  weather: WeatherSummarySchema,
  energy: EnergySummarySchema,
  demand: DemandSummarySchema,
  balanceKw: z.number(),
  updatedAt: z.string().datetime(),
})

export type DemandSummary = z.infer<typeof DemandSummarySchema>
export type CitySummary = z.infer<typeof CitySummarySchema>
