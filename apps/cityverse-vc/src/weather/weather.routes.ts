import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { WeatherService } from './service.js'
import { toWeatherSummary } from './summary.js'

const WeatherNudgeBody = z.object({
  pressureBias: z.number().optional(),
  cloudBias: z.number().optional(),
  windBias: z.number().optional(),
  tempBias: z.number().optional(),
  humidityBias: z.number().optional(),
})

export function registerWeatherRoutes(app: FastifyInstance, weather: WeatherService): void {
  app.get('/api/weather/current', async () => {
    return { ok: true, data: toWeatherSummary(weather.getState()) }
  })

  app.post('/api/weather/nudge', async (req, reply) => {
    const parsed = WeatherNudgeBody.safeParse(req.body)
    if (!parsed.success) {
      reply.status(400)
      return { ok: false, error: parsed.error.flatten() }
    }

    return { ok: true, data: toWeatherSummary(weather.applyNudge(parsed.data)) }
  })
}
