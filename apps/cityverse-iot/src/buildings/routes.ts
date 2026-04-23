import type { FastifyInstance } from 'fastify'
import { BuildingsSummarySchema } from '@cityverse/contracts'
import { getLatestBuildings } from './state.js'

export function registerBuildingRoutes(app: FastifyInstance): void {
  app.get('/buildings/current', async (_, reply) => {
    const payload = getLatestBuildings()
    if (payload === null) {
      return reply.code(503).send({ ok: false, error: 'No building telemetry received yet' })
    }
    return { ok: true, data: payload.buildings }
  })

  app.get('/buildings/summary', async (_, reply) => {
    const payload = getLatestBuildings()
    if (payload === null) {
      return reply.code(503).send({ ok: false, error: 'No building telemetry received yet' })
    }

    const demands = payload.buildings
    const totalDemandKw = demands.reduce((sum, b) => sum + b.currentDemandKw, 0)

    const byType: Record<string, number> = {}
    for (const b of demands) {
      byType[b.type] = (byType[b.type] ?? 0) + b.currentDemandKw
    }

    const topContributors = [...demands]
      .sort((a, b) => b.currentDemandKw - a.currentDemandKw)
      .slice(0, 3)
      .map(b => ({ id: b.id, label: b.label, currentDemandKw: b.currentDemandKw }))

    const summary = BuildingsSummarySchema.parse({
      totalDemandKw,
      buildingCount: demands.length,
      byType,
      topContributors,
      updatedAt: payload.updatedAt,
    })

    return { ok: true, data: summary }
  })
}
