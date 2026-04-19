import Fastify from 'fastify'
import { registerCityRoutes } from './city/routes.js'
import { startEnergyIngest } from './energy/ingest.js'
import { registerEnergyRoutes } from './energy/routes.js'
import { startWeatherIngest } from './weather/ingest.js'
import { registerWeatherRoutes } from './weather/routes.js'

export function buildServer() {
  const app = Fastify({ logger: true })

  app.get('/health', async () => {
    return { ok: true, service: 'cityverse-iot' }
  })

  registerWeatherRoutes(app)
  registerEnergyRoutes(app)
  registerCityRoutes(app)

  app.addHook('onReady', async () => {
    startWeatherIngest(app.log)
    startEnergyIngest(app.log)
  })

  return app
}
