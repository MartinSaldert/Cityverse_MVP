import type { FastifyInstance } from 'fastify'
import { getLatestCity, getLatestDemand } from './state.js'

export function registerCityRoutes(app: FastifyInstance): void {
  app.get('/demand/current', async (_, reply) => {
    const demand = getLatestDemand()
    if (!demand) {
      return reply.code(503).send({ ok: false, error: 'No demand data available yet' })
    }
    return { ok: true, data: demand }
  })

  app.get('/city/current', async (_, reply) => {
    const city = getLatestCity()
    if (!city) {
      return reply.code(503).send({ ok: false, error: 'No city aggregate data available yet' })
    }
    return { ok: true, data: city }
  })
}
