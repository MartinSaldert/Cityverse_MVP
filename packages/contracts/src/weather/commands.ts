import { z } from 'zod'
import { WeatherConditionSchema } from './summary.js'

export const WeatherNudgeSchema = z.object({
  temperatureDeltaC: z.number().optional(),
  pressureDeltaHpa: z.number().optional(),
  cloudCoverDelta: z.number().optional(),
  windSpeedDeltaMs: z.number().optional(),
  forceCondition: WeatherConditionSchema.optional(),
})

export type WeatherNudge = z.infer<typeof WeatherNudgeSchema>
