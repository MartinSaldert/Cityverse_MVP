import type { FastifyInstance } from 'fastify'
import { EnergyService } from './service.js'

export function registerEnergyRoutes(app: FastifyInstance, energy: EnergyService): void {
  app.get('/api/energy/current', async () => {
    return { ok: true, data: energy.getSummary() }
  })
}
