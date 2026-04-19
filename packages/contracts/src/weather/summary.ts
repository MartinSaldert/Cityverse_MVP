import { z } from 'zod'

export const WeatherConditionSchema = z.enum([
  'clear',
  'partly_cloudy',
  'overcast',
  'rain',
  'storm',
  'snow',
  'fog',
])

export type WeatherCondition = z.infer<typeof WeatherConditionSchema>

export const SeasonSchema = z.enum(['spring', 'summer', 'autumn', 'winter'])
export type Season = z.infer<typeof SeasonSchema>

export const WeatherSummarySchema = z.object({
  condition: WeatherConditionSchema,
  temperatureC: z.number(),
  feelsLikeC: z.number(),
  humidity: z.number().min(0).max(100),
  pressureHpa: z.number(),
  windSpeedMs: z.number().min(0),
  windDirectionDeg: z.number().min(0).max(360),
  cloudCover: z.number().min(0).max(1),
  precipitationMmH: z.number().min(0),
  isDaytime: z.boolean(),
  season: SeasonSchema,
  updatedAt: z.string().datetime(),
})

export type WeatherSummary = z.infer<typeof WeatherSummarySchema>
