import type { FastifyInstance } from 'fastify'
import { BuildingsSummarySchema } from '@cityverse/contracts'
import { getLatestBuildings } from './state.js'
import {
  getBuildingHistory,
  isValidMetric,
  isValidRange,
  BUILDING_METRICS,
  HISTORY_RANGES,
  type HistoryRange,
} from './history.js'

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

  app.get('/buildings/:buildingId/history', async (req, reply) => {
    const { buildingId } = req.params as { buildingId: string }
    const query = req.query as { metric?: string; range?: string; limit?: string }

    const metricRaw = query.metric ?? ''
    if (!isValidMetric(metricRaw)) {
      return reply.code(400).send({
        ok: false,
        error: `metric must be one of: ${BUILDING_METRICS.join(', ')}`,
      })
    }

    const rangeRaw = query.range ?? '1h'
    if (!isValidRange(rangeRaw)) {
      return reply.code(400).send({
        ok: false,
        error: `range must be one of: ${HISTORY_RANGES.join(', ')}`,
      })
    }
    const range: HistoryRange = rangeRaw

    const limitParsed = Number.parseInt(query.limit ?? '300', 10)
    const limit = Number.isFinite(limitParsed)
      ? Math.min(Math.max(limitParsed, 1), 2000)
      : 300

    const points = getBuildingHistory(buildingId, metricRaw, range, limit)
    return { ok: true, data: { buildingId, metric: metricRaw, range, points } }
  })
}
