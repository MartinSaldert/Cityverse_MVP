import type { FastifyInstance } from 'fastify'
import { getLatestSummary } from './state.js'

export function registerWeatherRoutes(app: FastifyInstance): void {
  app.get('/weather/current', async (_, reply) => {
    const summary = getLatestSummary()
    if (summary === null) {
      return reply.code(503).send({ ok: false, error: 'No telemetry received yet' })
    }
    return { ok: true, data: summary }
  })
}
