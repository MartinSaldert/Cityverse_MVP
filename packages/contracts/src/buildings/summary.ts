import { z } from 'zod'

export const BuildingDemandSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(['villa', 'apartment', 'office', 'retail', 'civic', 'utility', 'industrial']),
  scheduleClass: z.enum(['residential', 'office', 'retail', 'civic', 'infrastructure', 'industrial']),
  baseDemandKw: z.number().min(0),
  currentDemandKw: z.number().min(0),
  occupancyFactor: z.number(),
  weatherFactor: z.number(),
  occupancyCount: z.number().int().min(0),
  occupancyCapacity: z.number().int().min(0),
  updatedAt: z.string().datetime(),
})

export const BuildingsSummarySchema = z.object({
  totalDemandKw: z.number().min(0),
  buildingCount: z.number().int().min(0),
  byType: z.record(z.number()),
  topContributors: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      currentDemandKw: z.number(),
    }),
  ),
  updatedAt: z.string().datetime(),
})

export type BuildingDemand = z.infer<typeof BuildingDemandSchema>
export type BuildingsSummary = z.infer<typeof BuildingsSummarySchema>
