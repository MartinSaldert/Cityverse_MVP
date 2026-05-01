import Fastify from 'fastify'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { registerCityRoutes } from './city/routes.js'
import { startEnergyIngest } from './energy/ingest.js'
import { registerEnergyRoutes } from './energy/routes.js'
import { startWeatherIngest } from './weather/ingest.js'
import { registerWeatherRoutes } from './weather/routes.js'
import { startBuildingIngest } from './buildings/ingest.js'
import { registerBuildingRoutes } from './buildings/routes.js'
import { registerOpsRoutes } from './ops/routes.js'

export interface BuildServerOptions {
  startIngest?: boolean
}

export function buildServer(options: BuildServerOptions = {}) {
  const app = Fastify({ logger: true })

  app.get('/health', async () => {
    return { ok: true, service: 'cityverse-iot' }
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


  registerOpsRoutes(app)
  registerWeatherRoutes(app)
  registerEnergyRoutes(app)
  registerCityRoutes(app)
  registerBuildingRoutes(app)

  if (options.startIngest !== false) {
    app.addHook('onReady', async () => {
      startWeatherIngest(app.log)
      startEnergyIngest(app.log)
      startBuildingIngest(app.log)
    })
  }

  return app
}
