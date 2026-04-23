import type { FastifyInstance } from 'fastify'
import { getAllFlowStatuses, isBrokerConnected } from './flowRegistry.js'
import { getDashboardHtml } from './ui.js'
import { getFlowHistoryStats, getRecentHistory } from '../history/store.js'
import type { FlowKey } from './flowRegistry.js'

const VALID_FLOW_KEYS = new Set<string>(['weather', 'energy', 'buildings'])

export function registerOpsRoutes(app: FastifyInstance): void {
  app.get('/', async (_req, reply) => {
    reply.type('text/html')
    return getDashboardHtml()
  })

  app.get('/ops/summary', async () => {
    const flows = getAllFlowStatuses()
    const brokerConnected = isBrokerConnected()
    const allOk = flows.every(f => f.status === 'ok')
    return {
      ok: true,
      data: {
        service: 'cityverse-iot',
        brokerConnected,
        overallStatus: allOk && brokerConnected ? 'ok' : 'degraded',
        flows,
      },
    }
  })

  app.get('/ops/stats', async () => {
    const flowStatuses = getAllFlowStatuses()
    const historyStats = getFlowHistoryStats()
    const flows = flowStatuses.map(status => {
      const hist = historyStats.find(h => h.flowKey === status.flowKey)
      return {
        flowKey: status.flowKey,
        messageCount: status.messageCount,
        recentRecordCount: hist?.recentRecordCount ?? 0,
        latestPayloadTimestamp: hist?.latestPayloadTimestamp ?? null,
        oldestPayloadTimestamp: hist?.oldestPayloadTimestamp ?? null,
      }
    })
    return { ok: true, data: { flows } }
  })

  app.get('/ops/history/:flowKey', async (req, reply) => {
    const { flowKey } = req.params as { flowKey: string }
    if (!VALID_FLOW_KEYS.has(flowKey)) {
      return reply.code(400).send({ ok: false, error: `Unknown flow key: ${flowKey}` })
    }
    const records = getRecentHistory(flowKey as FlowKey)
    return { ok: true, data: { flowKey, records } }
  })
}
