import type { FastifyInstance } from 'fastify'
import { CityService } from './service.js'

export function registerCityRoutes(app: FastifyInstance, city: CityService): void {
  app.get('/api/demand/current', async () => {
    return { ok: true, data: city.getDemandSummary() }
  })

  app.get('/api/city/current', async () => {
    return { ok: true, data: city.getCitySummary() }
  })
}
