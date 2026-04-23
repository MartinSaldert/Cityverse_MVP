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
  // Daylight context — preferred over season for lighting decisions
  sunrise: z.number().optional(),       // decimal hour, e.g. 6.5 = 06:30
  sunset: z.number().optional(),        // decimal hour, e.g. 19.75 = 19:45
  daylightHours: z.number().optional(), // total daylight duration today
  locationId: z.string().optional(),    // selected simulation location
  updatedAt: z.string().datetime(),
})

export type WeatherSummary = z.infer<typeof WeatherSummarySchema>
