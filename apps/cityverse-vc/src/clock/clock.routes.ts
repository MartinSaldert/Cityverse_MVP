import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { SimulationClock } from './clock.service.js'

const SetSpeedBody = z.object({ speed: z.number().positive() })
const SetTimeBody = z.object({ simTime: z.string().datetime() })

export function registerClockRoutes(app: FastifyInstance, clock: SimulationClock): void {
  app.get('/api/clock', async () => {
    return { ok: true, data: clock.getState() }
  })

  app.post('/api/clock/pause', async () => {
    return { ok: true, data: clock.pause() }
  })

  app.post('/api/clock/resume', async () => {
    return { ok: true, data: clock.resume() }
  })

  app.post<{ Body: { speed: number } }>('/api/clock/speed', async (req, reply) => {
    const parsed = SetSpeedBody.safeParse(req.body)
    if (!parsed.success) {
      reply.status(400)
      return { ok: false, error: parsed.error.flatten() }
    }
    return { ok: true, data: clock.setSpeed(parsed.data.speed) }
  })

  app.post<{ Body: { simTime: string } }>('/api/clock/time', async (req, reply) => {
    const parsed = SetTimeBody.safeParse(req.body)
    if (!parsed.success) {
      reply.status(400)
      return { ok: false, error: parsed.error.flatten() }
    }
    try {
      return { ok: true, data: clock.setTime(parsed.data.simTime) }
    } catch (err) {
      reply.status(400)
      return { ok: false, error: (err as Error).message }
    }
  })
}
