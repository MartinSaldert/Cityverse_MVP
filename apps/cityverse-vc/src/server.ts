import Fastify from 'fastify'
import formbody from '@fastify/formbody'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { BuildingService } from './buildings/service.js'
import { registerBuildingRoutes } from './buildings/routes.js'
import { CityService } from './city/service.js'
import { registerCityRoutes } from './city/routes.js'
import { SimulationClock } from './clock/clock.service.js'
import { registerClockRoutes } from './clock/clock.routes.js'
import { LocationService } from './location/service.js'
import { registerLocationRoutes } from './location/routes.js'
import { renderHomePage } from './ui.js'
import { renderSyntraPage } from './syntra.page.js'
import { runSyntraPrompt } from './syntra.runner.js'
import { EnergyService } from './energy/service.js'
import { EnergyTelemetryPublisher } from './energy/telemetry.js'
import { BuildingTelemetryPublisher } from './buildings/telemetry.js'
import { registerEnergyRoutes } from './energy/routes.js'
import { WeatherService } from './weather/service.js'
import { WeatherTelemetryPublisher } from './weather/telemetry.js'
import { registerWeatherRoutes } from './weather/weather.routes.js'

export function buildServer() {
  const app = Fastify({ logger: true })
  const clock = new SimulationClock()
  const location = new LocationService()
  const weather = new WeatherService(clock, location)
  const buildings = new BuildingService(weather)
  const energy = new EnergyService(weather, buildings)
  const city = new CityService(weather, energy, buildings)
  const telemetryPublisher = new WeatherTelemetryPublisher(app.log, () => weather.getState())
  const energyTelemetryPublisher = new EnergyTelemetryPublisher(app.log, energy)
  const buildingTelemetryPublisher = new BuildingTelemetryPublisher(app.log, buildings)

  app.register(formbody)

  app.get('/health', async () => {
    return { ok: true, service: 'cityverse-vc' }
  })

  app.get('/', async (_, reply) => {
    reply.type('text/html')
    return renderHomePage()
  })

  app.get('/syntra', async (_, reply) => {
    reply.type('text/html')
    return renderSyntraPage()
  })

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

  async function getHeaderStatus() {
    const bridgeBaseUrl = process.env.AVATAR_BRIDGE_BASE_URL ?? 'http://127.0.0.1:3099'
    const openClawUrl = process.env.MAC_MINI_OPENCLAW_URL ?? 'http://127.0.0.1:18789'
    const iotSummaryUrl = process.env.CITYVERSE_IOT_SUMMARY_URL ?? 'http://127.0.0.1:3002/ops/summary'

    const [bridgeResult, openClawResult, brokerResult] = await Promise.all([
      fetchFirstOkJson([`${bridgeBaseUrl}/health`, 'http://127.0.0.1:3099/health']),
      fetchFirstOk([`${openClawUrl}/health`, 'http://127.0.0.1:18789/health', 'http://localhost:18789/health']),
      fetchFirstOkJson([iotSummaryUrl, 'http://127.0.0.1:3002/ops/summary']),
    ])

    const bridgeJson = bridgeResult.ok ? bridgeResult.json : null
    const brokerJson = brokerResult.ok ? brokerResult.json as { data?: { brokerConnected?: boolean } } : null

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
        ok: brokerJson?.data?.brokerConnected === true,
      },
    }
  }

  app.get('/api/header-status', async (_req, reply) => {
    try {
      return await getHeaderStatus()
    } catch (error) {
      reply.code(500)
      return { ok: false, error: error instanceof Error ? error.message : String(error) }
    }
  })

  app.get('/api/syntra/status', async (_req, reply) => {
    try {
      return await getHeaderStatus()
    } catch (error) {
      reply.code(500)
      return { ok: false, error: error instanceof Error ? error.message : String(error) }
    }
  })

  app.post('/api/syntra/prompt', async (req, reply) => {
    const body = (req.body ?? {}) as { prompt?: string }
    const prompt = body.prompt?.trim()

    if (!prompt) {
      reply.code(400)
      return { ok: false, error: 'Prompt is required.' }
    }

    try {
      const result = await runSyntraPrompt(prompt)
      const bridgeSent = (result.bridgeResult as { bridgeResult?: { sent?: { audioUrl?: string } } } | null)?.bridgeResult?.sent

      return {
        ok: true,
        replyText: result.replyText,
        bridgeAudioUrl: bridgeSent?.audioUrl ?? null,
        bridgeResult: result.bridgeResult,
      }
    } catch (error) {
      req.log.error({ error }, 'Syntra prompt relay failed')
      reply.code(500)
      return { ok: false, error: error instanceof Error ? error.message : String(error) }
    }
  })

  app.get('/branding/syntra-logo.png', async (_, reply) => {
    const candidatePaths = [
      path.resolve(process.cwd(), '../../assets/branding/Syntra_Logo_Light.png'),
      path.resolve(process.cwd(), '../../assets/branding/syntra-logo-light.png'),
      path.resolve(process.cwd(), './assets/branding/Syntra_Logo_Light.png'),
      path.resolve(process.cwd(), './assets/branding/syntra-logo-light.png'),
      path.resolve(process.cwd(), '../../assets/branding/Syntra_Logo.png'),
      path.resolve(process.cwd(), '../../assets/branding/syntra-logo.png'),
      path.resolve(process.cwd(), './assets/branding/Syntra_Logo.png'),
      path.resolve(process.cwd(), './assets/branding/syntra-logo.png'),
    ]

    for (const filePath of candidatePaths) {
      try {
        const data = await readFile(filePath)
        reply.type('image/png')
        return data
      } catch {
        // try next path
      }
    }

    reply.code(404)
    return { ok: false, error: 'Syntra logo not found', expected: candidatePaths }
  })


  app.get('/branding/syntra-icon.png', async (_, reply) => {
    const candidatePaths = [
      path.resolve(process.cwd(), '../../assets/branding/Syntra_Icon.png'),
      path.resolve(process.cwd(), '../../assets/branding/syntra-icon.png'),
      path.resolve(process.cwd(), './assets/branding/Syntra_Icon.png'),
      path.resolve(process.cwd(), './assets/branding/syntra-icon.png'),
    ]

    for (const filePath of candidatePaths) {
      try {
        const data = await readFile(filePath)
        reply.type('image/png')
        return data
      } catch {
        // try next path
      }
    }

    reply.code(404)
    return { ok: false, error: 'Syntra icon not found', expected: candidatePaths }
  })


  registerClockRoutes(app, clock)
  registerLocationRoutes(app, location)
  registerWeatherRoutes(app, weather)
  registerEnergyRoutes(app, energy)
  registerCityRoutes(app, city)
  registerBuildingRoutes(app, buildings)

  app.addHook('onReady', async () => {
    telemetryPublisher.start()
    energyTelemetryPublisher.start()
    buildingTelemetryPublisher.start()
  })

  app.addHook('onClose', async () => {
    telemetryPublisher.stop()
    energyTelemetryPublisher.stop()
    buildingTelemetryPublisher.stop()
  })

  return app
}
