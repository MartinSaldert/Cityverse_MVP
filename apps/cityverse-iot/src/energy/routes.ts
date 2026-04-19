import type { FastifyInstance } from 'fastify'
import { getLatestEnergy } from './state.js'

export function registerEnergyRoutes(app: FastifyInstance): void {
  app.get('/energy/current', async (_, reply) => {
    const energy = getLatestEnergy()
    if (energy === null) {
      return reply.code(503).send({ ok: false, error: 'No energy telemetry received yet' })
    }
    return { ok: true, data: energy }
  })
}
