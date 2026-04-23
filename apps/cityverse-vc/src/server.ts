import Fastify from 'fastify'
import formbody from '@fastify/formbody'
import { BuildingService } from './buildings/service.js'
import { registerBuildingRoutes } from './buildings/routes.js'
import { CityService } from './city/service.js'
import { registerCityRoutes } from './city/routes.js'
import { SimulationClock } from './clock/clock.service.js'
import { registerClockRoutes } from './clock/clock.routes.js'
import { LocationService } from './location/service.js'
import { registerLocationRoutes } from './location/routes.js'
import { renderHomePage } from './ui.js'
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
