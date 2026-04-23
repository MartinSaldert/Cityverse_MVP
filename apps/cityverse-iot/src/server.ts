import Fastify from 'fastify'
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
