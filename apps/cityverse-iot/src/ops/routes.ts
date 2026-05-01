import type { FastifyInstance } from 'fastify'
import { getAllFlowStatuses, isBrokerConnected } from './flowRegistry.js'
import { getDashboardHtml } from './ui.js'
import { getDashboardV2Html } from './ui-v2.js'
import { getFlowHistoryStats, getRecentHistory } from '../history/store.js'
import type { FlowKey } from './flowRegistry.js'

const VALID_FLOW_KEYS = new Set<string>(['weather', 'energy', 'buildings'])

export function registerOpsRoutes(app: FastifyInstance): void {
  app.get('/', async (_req, reply) => {
    reply.type('text/html')
    return getDashboardV2Html()
  })

  app.get('/ops-v2', async (_req, reply) => {
    reply.type('text/html')
    return getDashboardV2Html()
  })

  app.get('/api/header-status', async (_req, reply) => {
    const bridgeBaseUrl = process.env.AVATAR_BRIDGE_BASE_URL ?? 'http://127.0.0.1:3099'
    const openClawUrl = process.env.MAC_MINI_OPENCLAW_URL ?? 'http://127.0.0.1:18789'

    async function fetchFirstOkJson(urls: string[]) {
      const seen = new Set<string>()

      for (const url of urls) {
        if (!url || seen.has(url)) continue
        seen.add(url)
        try {
          const res = await fetch(url)
          if (!res.ok) continue
          return { ok: true as const, url, json: await res.json() as Record<string, unknown> }
        } catch {
          // try next candidate
        }
      }

      return { ok: false as const, url: null, json: null }
    }

    async function fetchFirstOk(urls: string[]) {
      const seen = new Set<string>()

      for (const url of urls) {
        if (!url || seen.has(url)) continue
        seen.add(url)
        try {
          const res = await fetch(url)
          if (res.ok) return { ok: true as const, url }
        } catch {
          // try next candidate
        }
      }

      return { ok: false as const, url: null }
    }

    try {
      const [bridgeResult, openClawResult] = await Promise.all([
        fetchFirstOkJson([`${bridgeBaseUrl}/health`, 'http://127.0.0.1:3099/health']),
        fetchFirstOk([`${openClawUrl}/health`, 'http://127.0.0.1:18789/health', 'http://localhost:18789/health']),
      ])

      const bridgeJson = bridgeResult.ok ? bridgeResult.json : null

      return {
        ok: true,
        bridge: {
          ok: bridgeResult.ok,
          unityConnected: bridgeJson?.wsConnected === true,
          details: bridgeJson,
        },
        openclaw: {
          ok: openClawResult.ok,
        },
        broker: {
          ok: isBrokerConnected(),
        },
      }
    } catch (error) {
      reply.code(500)
      return { ok: false, error: error instanceof Error ? error.message : String(error) }
    }
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
