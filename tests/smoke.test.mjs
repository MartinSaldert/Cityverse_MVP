import test from 'node:test'
import assert from 'node:assert/strict'

import { buildServer as buildVcServer } from '../apps/cityverse-vc/dist/server.js'
import { buildServer as buildIotServer } from '../apps/cityverse-iot/dist/server.js'
process.env.MQTT_URL = 'mqtt://127.0.0.1:1'

import { mqttTopics, WeatherSummarySchema, EnergySummarySchema, CitySummarySchema } from '../packages/contracts/dist/index.js'
import { setLatestTelemetry as setIotWeatherTelemetry } from '../apps/cityverse-iot/dist/weather/state.js'
import { setLatestEnergy as setIotEnergy } from '../apps/cityverse-iot/dist/energy/state.js'

test('contracts export expected mqtt topics', () => {
  assert.equal(typeof mqttTopics.weatherTelemetry, 'string')
  assert.equal(typeof mqttTopics.energyTelemetry, 'string')
  assert.ok(mqttTopics.weatherTelemetry.length > 0)
  assert.ok(mqttTopics.energyTelemetry.length > 0)
})

test('VC health endpoint responds ok', async (t) => {
  const app = buildVcServer()
  t.after(() => app.close())
  const response = await app.inject({ method: 'GET', url: '/health' })
  assert.equal(response.statusCode, 200)
  assert.deepEqual(response.json(), { ok: true, service: 'cityverse-vc' })
})

test('VC clock endpoint returns state shape', async (t) => {
  const app = buildVcServer()
  t.after(() => app.close())
  const response = await app.inject({ method: 'GET', url: '/api/clock' })
  assert.equal(response.statusCode, 200)
  const body = response.json()
  assert.equal(body.ok, true)
  assert.equal(typeof body.data.speed, 'number')
  assert.equal(typeof body.data.paused, 'boolean')
  assert.match(body.data.simTime, /T/)
})

test('VC weather endpoint returns contract-valid summary', async (t) => {
  const app = buildVcServer()
  t.after(() => app.close())
  const response = await app.inject({ method: 'GET', url: '/api/weather/current' })
  assert.equal(response.statusCode, 200)
  const body = response.json()
  assert.equal(body.ok, true)
  WeatherSummarySchema.parse(body.data)
})

test('VC energy endpoint returns contract-valid summary', async (t) => {
  const app = buildVcServer()
  t.after(() => app.close())
  const response = await app.inject({ method: 'GET', url: '/api/energy/current' })
  assert.equal(response.statusCode, 200)
  const body = response.json()
  assert.equal(body.ok, true)
  EnergySummarySchema.parse(body.data)
})

test('VC city endpoint returns contract-valid aggregate', async (t) => {
  const app = buildVcServer()
  t.after(() => app.close())
  const response = await app.inject({ method: 'GET', url: '/api/city/current' })
  assert.equal(response.statusCode, 200)
  const body = response.json()
  assert.equal(body.ok, true)
  CitySummarySchema.parse(body.data)
})

test('VC rejects invalid clock speed payload', async (t) => {
  const app = buildVcServer()
  t.after(() => app.close())
  const response = await app.inject({
    method: 'POST',
    url: '/api/clock/speed',
    payload: { speed: 0 },
  })
  assert.equal(response.statusCode, 400)
  assert.equal(response.json().ok, false)
})

test('VC weather nudge changes weather and remains contract-valid', async (t) => {
  const app = buildVcServer()
  t.after(() => app.close())

  const before = await app.inject({ method: 'GET', url: '/api/weather/current' })
  const beforeBody = before.json()

  const nudged = await app.inject({
    method: 'POST',
    url: '/api/weather/nudge',
    payload: { cloudBias: 0.5, windBias: 3, tempBias: 1.5 },
  })

  assert.equal(nudged.statusCode, 200)
  const nudgedBody = nudged.json()
  assert.equal(nudgedBody.ok, true)
  WeatherSummarySchema.parse(nudgedBody.data)
  assert.notDeepEqual(nudgedBody.data, beforeBody.data)
})

test('IOT endpoints return 503 before telemetry arrives', async (t) => {
  const app = buildIotServer()
  t.after(() => app.close())

  const weather = await app.inject({ method: 'GET', url: '/weather/current' })
  const energy = await app.inject({ method: 'GET', url: '/energy/current' })
  const city = await app.inject({ method: 'GET', url: '/city/current' })

  assert.equal(weather.statusCode, 503)
  assert.equal(energy.statusCode, 503)
  assert.equal(city.statusCode, 503)
})

test('IOT endpoints return data after state is seeded', async (t) => {
  const vc = buildVcServer()
  const iot = buildIotServer()
  t.after(() => vc.close())
  t.after(() => iot.close())

  const vcWeatherRes = await vc.inject({ method: 'GET', url: '/api/weather/current' })
  const vcEnergyRes = await vc.inject({ method: 'GET', url: '/api/energy/current' })

  const vcWeather = vcWeatherRes.json().data
  const vcEnergy = vcEnergyRes.json().data

  setIotWeatherTelemetry({
    timestamp: vcWeather.updatedAt,
    temperatureC: vcWeather.temperatureC,
    humidity: vcWeather.humidity,
    pressureHpa: vcWeather.pressureHpa,
    windSpeedMs: vcWeather.windSpeedMs,
    windDirectionDeg: vcWeather.windDirectionDeg,
    cloudCover: vcWeather.cloudCover,
    precipitationMmH: vcWeather.precipitationMmH,
  })
  setIotEnergy(vcEnergy)

  const weather = await iot.inject({ method: 'GET', url: '/weather/current' })
  const energy = await iot.inject({ method: 'GET', url: '/energy/current' })
  const demand = await iot.inject({ method: 'GET', url: '/demand/current' })
  const city = await iot.inject({ method: 'GET', url: '/city/current' })

  assert.equal(weather.statusCode, 200)
  assert.equal(energy.statusCode, 200)
  assert.equal(demand.statusCode, 200)
  assert.equal(city.statusCode, 200)

  WeatherSummarySchema.parse(weather.json().data)
  EnergySummarySchema.parse(energy.json().data)
  CitySummarySchema.parse(city.json().data)
})
