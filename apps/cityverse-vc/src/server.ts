import Fastify from 'fastify'
import formbody from '@fastify/formbody'
import { CityService } from './city/service.js'
import { registerCityRoutes } from './city/routes.js'
import { SimulationClock } from './clock/clock.service.js'
import { registerClockRoutes } from './clock/clock.routes.js'
import { renderHomePage } from './ui.js'
import { EnergyService } from './energy/service.js'
import { EnergyTelemetryPublisher } from './energy/telemetry.js'
import { registerEnergyRoutes } from './energy/routes.js'
import { WeatherService } from './weather/service.js'
import { WeatherTelemetryPublisher } from './weather/telemetry.js'
import { registerWeatherRoutes } from './weather/weather.routes.js'

export function buildServer() {
  const app = Fastify({ logger: true })
  const clock = new SimulationClock()
  const weather = new WeatherService(clock)
  const energy = new EnergyService(weather)
  const city = new CityService(weather, energy)
  const telemetryPublisher = new WeatherTelemetryPublisher(app.log, () => weather.getState())
  const energyTelemetryPublisher = new EnergyTelemetryPublisher(app.log, energy)

  app.register(formbody)

  app.get('/health', async () => {
    return { ok: true, service: 'cityverse-vc' }
  })

  app.get('/', async (_, reply) => {
    reply.type('text/html')
    return renderHomePage()
  })

  registerClockRoutes(app, clock)
  registerWeatherRoutes(app, weather)
  registerEnergyRoutes(app, energy)
  registerCityRoutes(app, city)

  app.addHook('onReady', async () => {
    telemetryPublisher.start()
    energyTelemetryPublisher.start()
  })

  app.addHook('onClose', async () => {
    telemetryPublisher.stop()
    energyTelemetryPublisher.stop()
  })

  return app
}
