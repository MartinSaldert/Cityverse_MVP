import type { FastifyInstance } from 'fastify'
import type { BuildingService } from './service.js'

export function registerBuildingRoutes(app: FastifyInstance, buildings: BuildingService): void {
  app.get('/api/buildings/current', async () => {
    return { ok: true, data: buildings.getCurrentDemands() }
  })

  app.get('/api/buildings/summary', async () => {
    return { ok: true, data: buildings.getBuildingsSummary() }
  })
}
