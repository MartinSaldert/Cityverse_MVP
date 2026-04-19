import { z } from 'zod'
import { WeatherSummarySchema } from './summary.js'

export const CurrentWeatherResponseSchema = z.object({
  ok: z.literal(true),
  data: WeatherSummarySchema,
})

export type CurrentWeatherResponse = z.infer<typeof CurrentWeatherResponseSchema>
