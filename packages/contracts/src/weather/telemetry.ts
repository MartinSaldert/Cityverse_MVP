import { z } from 'zod'

export const WeatherTelemetrySchema = z.object({
  timestamp: z.string().datetime(),
  temperatureC: z.number(),
  humidity: z.number().min(0).max(100),
  pressureHpa: z.number(),
  windSpeedMs: z.number().min(0),
  windDirectionDeg: z.number().min(0).max(360),
  cloudCover: z.number().min(0).max(1),
  precipitationMmH: z.number().min(0),
})

export type WeatherTelemetry = z.infer<typeof WeatherTelemetrySchema>
