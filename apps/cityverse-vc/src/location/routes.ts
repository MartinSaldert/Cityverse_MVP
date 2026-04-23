import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { LocationService } from './service.js'

const SelectBody = z.object({ locationId: z.string() })

export function registerLocationRoutes(app: FastifyInstance, location: LocationService): void {
  app.get('/api/location/current', async () => ({ ok: true, data: location.getCurrent() }))

  app.get('/api/location/options', async () => ({ ok: true, data: location.getOptions() }))

  app.post('/api/location/select', async (req, reply) => {
    const parsed = SelectBody.safeParse(req.body)
    if (!parsed.success) {
      reply.status(400)
      return { ok: false, error: parsed.error.flatten() }
    }
    const selected = location.select(parsed.data.locationId)
    if (!selected) {
      reply.status(404)
      return { ok: false, error: `Unknown location: ${parsed.data.locationId}` }
    }
    return { ok: true, data: selected }
  })
}
