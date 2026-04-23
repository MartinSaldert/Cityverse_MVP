import test from 'node:test'
import assert from 'node:assert/strict'

import { buildServer as buildVcServer } from '../apps/cityverse-vc/dist/server.js'
import { buildServer as buildIotServer } from '../apps/cityverse-iot/dist/server.js'
process.env.MQTT_URL = 'mqtt://127.0.0.1:1'

import { mqttTopics, WeatherSummarySchema, EnergySummarySchema, CitySummarySchema, BuildingDemandSchema, BuildingsSummarySchema, BuildingTelemetryPayloadSchema } from '../packages/contracts/dist/index.js'
import { setLatestTelemetry as setIotWeatherTelemetry, resetLatestWeather } from '../apps/cityverse-iot/dist/weather/state.js'
import { setLatestEnergy as setIotEnergy, resetLatestEnergy } from '../apps/cityverse-iot/dist/energy/state.js'
import { setLatestBuildings as setIotBuildings, resetLatestBuildings } from '../apps/cityverse-iot/dist/buildings/state.js'
import { recordFlowIngest } from '../apps/cityverse-iot/dist/ops/flowRegistry.js'
import { appendHistoryRecord, getRecentHistory, getFlowHistoryStats, resetHistoryStore } from '../apps/cityverse-iot/dist/history/store.js'

test.beforeEach(() => {
  resetLatestWeather()
  resetLatestEnergy()
  resetLatestBuildings()
  resetHistoryStore()
})

test('contracts export expected mqtt topics', () => {
  assert.equal(typeof mqttTopics.weatherTelemetry, 'string')
  assert.equal(typeof mqttTopics.energyTelemetry, 'string')
  assert.equal(typeof mqttTopics.buildingTelemetry, 'string')
  assert.ok(mqttTopics.weatherTelemetry.length > 0)
  assert.ok(mqttTopics.energyTelemetry.length > 0)
  assert.ok(mqttTopics.buildingTelemetry.length > 0)
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

test('VC location options returns all cities', async (t) => {
  const app = buildVcServer()
  t.after(() => app.close())
  const response = await app.inject({ method: 'GET', url: '/api/location/options' })
  assert.equal(response.statusCode, 200)
  const body = response.json()
  assert.equal(body.ok, true)
  assert.ok(Array.isArray(body.data), 'data should be an array')
  assert.ok(body.data.length >= 7, 'should have at least 7 cities')
  for (const loc of body.data) {
    assert.equal(typeof loc.id, 'string')
    assert.equal(typeof loc.label, 'string')
    assert.equal(typeof loc.latitude, 'number')
    assert.equal(typeof loc.longitude, 'number')
  }
})

test('VC location current returns a valid location', async (t) => {
  const app = buildVcServer()
  t.after(() => app.close())
  const response = await app.inject({ method: 'GET', url: '/api/location/current' })
  assert.equal(response.statusCode, 200)
  const body = response.json()
  assert.equal(body.ok, true)
  assert.equal(typeof body.data.id, 'string')
  assert.equal(typeof body.data.latitude, 'number')
})

test('VC location select switches location successfully', async (t) => {
  const app = buildVcServer()
  t.after(() => app.close())
  const response = await app.inject({
    method: 'POST',
    url: '/api/location/select',
    payload: { locationId: 'tokyo' },
  })
  assert.equal(response.statusCode, 200)
  const body = response.json()
  assert.equal(body.ok, true)
  assert.equal(body.data.id, 'tokyo')

  // confirm current reflects the change
  const current = await app.inject({ method: 'GET', url: '/api/location/current' })
  assert.equal(current.json().data.id, 'tokyo')
})

test('VC location select rejects unknown location id', async (t) => {
  const app = buildVcServer()
  t.after(() => app.close())
  const response = await app.inject({
    method: 'POST',
    url: '/api/location/select',
    payload: { locationId: 'atlantis' },
  })
  assert.equal(response.statusCode, 404)
  assert.equal(response.json().ok, false)
})

test('VC weather/current includes sunrise, sunset and daylightHours', async (t) => {
  const app = buildVcServer()
  t.after(() => app.close())
  const response = await app.inject({ method: 'GET', url: '/api/weather/current' })
  assert.equal(response.statusCode, 200)
  const { data } = response.json()
  assert.equal(typeof data.sunrise, 'number', 'sunrise should be a number')
  assert.equal(typeof data.sunset, 'number', 'sunset should be a number')
  assert.equal(typeof data.daylightHours, 'number', 'daylightHours should be a number')
  assert.ok(data.sunrise < data.sunset, 'sunrise should precede sunset')
  assert.ok(data.daylightHours > 0 && data.daylightHours <= 24, 'daylightHours should be in (0, 24]')
})

test('IOT endpoints return 503 before telemetry arrives', async (t) => {
  const app = buildIotServer({ startIngest: false })
  t.after(() => app.close())

  const weather = await app.inject({ method: 'GET', url: '/weather/current' })
  const energy = await app.inject({ method: 'GET', url: '/energy/current' })
  const city = await app.inject({ method: 'GET', url: '/city/current' })
  const buildings = await app.inject({ method: 'GET', url: '/buildings/current' })
  const buildingsSummary = await app.inject({ method: 'GET', url: '/buildings/summary' })

  assert.equal(weather.statusCode, 503)
  assert.equal(energy.statusCode, 503)
  assert.equal(city.statusCode, 503)
  assert.equal(buildings.statusCode, 503)
  assert.equal(buildingsSummary.statusCode, 503)
})

test('IOT endpoints return data after state is seeded', async (t) => {
  const vc = buildVcServer()
  const iot = buildIotServer({ startIngest: false })
  t.after(() => vc.close())
  t.after(() => iot.close())

  const vcWeatherRes = await vc.inject({ method: 'GET', url: '/api/weather/current' })
  const vcEnergyRes = await vc.inject({ method: 'GET', url: '/api/energy/current' })
  const vcBuildingsRes = await vc.inject({ method: 'GET', url: '/api/buildings/current' })

  const vcWeather = vcWeatherRes.json().data
  const vcEnergy = vcEnergyRes.json().data
  const vcBuildings = vcBuildingsRes.json().data

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
  setIotBuildings({ updatedAt: vcBuildings[0].updatedAt, buildings: vcBuildings })

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

  // demand must sum building telemetry, not use old weather-based formula
  const buildingSum = vcBuildings.reduce((s, b) => s + b.currentDemandKw, 0)
  const demandKw = demand.json().data.demandKw
  assert.ok(Math.abs(demandKw - buildingSum) < 0.01, `IOT demand (${demandKw}) should equal building sum (${buildingSum})`)
})

test('buildings/current returns seeded roster with valid shapes', async (t) => {
  const app = buildVcServer()
  t.after(() => app.close())
  const response = await app.inject({ method: 'GET', url: '/api/buildings/current' })
  assert.equal(response.statusCode, 200)
  const body = response.json()
  assert.equal(body.ok, true)
  assert.ok(Array.isArray(body.data))
  assert.ok(body.data.length >= 8, 'should have at least 8 buildings')
  const ids = body.data.map(b => b.id)
  assert.ok(ids.includes('villa-a'))
  assert.ok(ids.includes('apartment-01'))
  assert.ok(ids.includes('office-01'))
  assert.ok(ids.includes('factory-01'))
  for (const b of body.data) {
    BuildingDemandSchema.parse(b)
  }
})

test('city demand equals sum of building demands', async (t) => {
  const app = buildVcServer()
  t.after(() => app.close())
  const [buildingsRes, demandRes] = await Promise.all([
    app.inject({ method: 'GET', url: '/api/buildings/current' }),
    app.inject({ method: 'GET', url: '/api/demand/current' }),
  ])
  const buildingSum = buildingsRes.json().data.reduce((s, b) => s + b.currentDemandKw, 0)
  const cityDemand = demandRes.json().data.demandKw
  assert.ok(Math.abs(buildingSum - cityDemand) < 1.0, 'city demand should equal sum of building demands')
})

test('residential demand is higher in evening than at midnight', async (t) => {
  const app = buildVcServer()
  t.after(() => app.close())

  await app.inject({ method: 'POST', url: '/api/clock/time', payload: { simTime: '2026-04-21T00:00:00.000Z' } })
  const midnightRes = await app.inject({ method: 'GET', url: '/api/buildings/current' })
  const midnightVilla = midnightRes.json().data.find(b => b.id === 'villa-a')

  await app.inject({ method: 'POST', url: '/api/clock/time', payload: { simTime: '2026-04-21T18:00:00.000Z' } })
  const eveningRes = await app.inject({ method: 'GET', url: '/api/buildings/current' })
  const eveningVilla = eveningRes.json().data.find(b => b.id === 'villa-a')

  assert.ok(eveningVilla.currentDemandKw > midnightVilla.currentDemandKw,
    'villa demand higher at 18:00 than at midnight')
})

test('office demand is lower on Sunday than on weekday daytime', async (t) => {
  const app = buildVcServer()
  t.after(() => app.close())

  // Monday 10:00
  await app.inject({ method: 'POST', url: '/api/clock/time', payload: { simTime: '2026-04-20T10:00:00.000Z' } })
  const weekdayRes = await app.inject({ method: 'GET', url: '/api/buildings/current' })
  const weekdayOffice = weekdayRes.json().data.find(b => b.id === 'office-01')

  // Sunday 10:00
  await app.inject({ method: 'POST', url: '/api/clock/time', payload: { simTime: '2026-04-19T10:00:00.000Z' } })
  const weekendRes = await app.inject({ method: 'GET', url: '/api/buildings/current' })
  const weekendOffice = weekendRes.json().data.find(b => b.id === 'office-01')

  assert.ok(weekdayOffice.currentDemandKw > weekendOffice.currentDemandKw,
    'office demand higher on weekday than on Sunday')
})

test('buildings/summary returns expected shape', async (t) => {
  const app = buildVcServer()
  t.after(() => app.close())
  const response = await app.inject({ method: 'GET', url: '/api/buildings/summary' })
  assert.equal(response.statusCode, 200)
  const body = response.json()
  assert.equal(body.ok, true)
  BuildingsSummarySchema.parse(body.data)
  assert.ok(body.data.buildingCount >= 8)
  assert.ok(typeof body.data.totalDemandKw === 'number')
  assert.ok(Array.isArray(body.data.topContributors))
  assert.ok(body.data.topContributors.length === 3)
})

test('buildings/current includes occupancyCount and occupancyCapacity', async (t) => {
  const app = buildVcServer()
  t.after(() => app.close())
  const response = await app.inject({ method: 'GET', url: '/api/buildings/current' })
  assert.equal(response.statusCode, 200)
  const body = response.json()
  for (const b of body.data) {
    assert.equal(typeof b.occupancyCount, 'number', `${b.id} should have occupancyCount`)
    assert.equal(typeof b.occupancyCapacity, 'number', `${b.id} should have occupancyCapacity`)
    assert.ok(Number.isInteger(b.occupancyCount), `${b.id} occupancyCount should be integer`)
    assert.ok(b.occupancyCount >= 0, `${b.id} occupancyCount should be non-negative`)
    assert.ok(b.occupancyCapacity > 0, `${b.id} occupancyCapacity should be positive`)
    assert.ok(b.occupancyCount <= b.occupancyCapacity, `${b.id} occupancyCount should not exceed capacity`)
  }
})

test('residential occupancy is higher at night than during work hours', async (t) => {
  const app = buildVcServer()
  t.after(() => app.close())

  // Workday 11:00 — residents away
  await app.inject({ method: 'POST', url: '/api/clock/time', payload: { simTime: '2026-04-21T11:00:00.000Z' } })
  const daytimeRes = await app.inject({ method: 'GET', url: '/api/buildings/current' })
  const daytimeVilla = daytimeRes.json().data.find(b => b.id === 'villa-a')

  // Midnight — everyone home
  await app.inject({ method: 'POST', url: '/api/clock/time', payload: { simTime: '2026-04-21T01:00:00.000Z' } })
  const nightRes = await app.inject({ method: 'GET', url: '/api/buildings/current' })
  const nightVilla = nightRes.json().data.find(b => b.id === 'villa-a')

  assert.ok(nightVilla.occupancyCount > daytimeVilla.occupancyCount,
    `villa-a midnight occupancy (${nightVilla.occupancyCount}) should exceed workday (${daytimeVilla.occupancyCount})`)
})

test('office occupancy is near zero on Sunday and positive on Monday', async (t) => {
  const app = buildVcServer()
  t.after(() => app.close())

  // Monday 10:00
  await app.inject({ method: 'POST', url: '/api/clock/time', payload: { simTime: '2026-04-20T10:00:00.000Z' } })
  const weekdayRes = await app.inject({ method: 'GET', url: '/api/buildings/current' })
  const weekdayOffice = weekdayRes.json().data.find(b => b.id === 'office-01')

  // Sunday 10:00
  await app.inject({ method: 'POST', url: '/api/clock/time', payload: { simTime: '2026-04-19T10:00:00.000Z' } })
  const weekendRes = await app.inject({ method: 'GET', url: '/api/buildings/current' })
  const weekendOffice = weekendRes.json().data.find(b => b.id === 'office-01')

  assert.ok(weekdayOffice.occupancyCount > weekendOffice.occupancyCount,
    `office weekday occupancy (${weekdayOffice.occupancyCount}) should exceed weekend (${weekendOffice.occupancyCount})`)
  assert.ok(weekdayOffice.occupancyCount > 10,
    'office should have meaningful occupancy on weekday morning')
})

test('VC produces building telemetry payload matching contract schema', async (t) => {
  const app = buildVcServer()
  t.after(() => app.close())
  const response = await app.inject({ method: 'GET', url: '/api/buildings/current' })
  assert.equal(response.statusCode, 200)
  const buildings = response.json().data
  const payload = BuildingTelemetryPayloadSchema.parse({
    updatedAt: buildings[0].updatedAt,
    buildings,
  })
  assert.ok(Array.isArray(payload.buildings))
  assert.ok(payload.buildings.length >= 8)
})

test('IOT buildings/current returns data after telemetry is seeded', async (t) => {
  const vc = buildVcServer()
  const iot = buildIotServer({ startIngest: false })
  t.after(() => vc.close())
  t.after(() => iot.close())

  const vcRes = await vc.inject({ method: 'GET', url: '/api/buildings/current' })
  const vcBuildings = vcRes.json().data

  setIotBuildings({ updatedAt: vcBuildings[0].updatedAt, buildings: vcBuildings })

  const res = await iot.inject({ method: 'GET', url: '/buildings/current' })
  assert.equal(res.statusCode, 200)
  const body = res.json()
  assert.equal(body.ok, true)
  assert.ok(Array.isArray(body.data))
  assert.ok(body.data.length >= 8)
  for (const b of body.data) {
    BuildingDemandSchema.parse(b)
  }
})

test('IOT buildings/summary returns valid shape after telemetry is seeded', async (t) => {
  const vc = buildVcServer()
  const iot = buildIotServer({ startIngest: false })
  t.after(() => vc.close())
  t.after(() => iot.close())

  const vcRes = await vc.inject({ method: 'GET', url: '/api/buildings/current' })
  const vcBuildings = vcRes.json().data

  setIotBuildings({ updatedAt: vcBuildings[0].updatedAt, buildings: vcBuildings })

  const res = await iot.inject({ method: 'GET', url: '/buildings/summary' })
  assert.equal(res.statusCode, 200)
  const body = res.json()
  assert.equal(body.ok, true)
  BuildingsSummarySchema.parse(body.data)
  assert.ok(body.data.buildingCount >= 8)
  assert.ok(body.data.topContributors.length === 3)
})

test('IOT /ops/summary returns three flow entries', async (t) => {
  const app = buildIotServer({ startIngest: false })
  t.after(() => app.close())
  const res = await app.inject({ method: 'GET', url: '/ops/summary' })
  assert.equal(res.statusCode, 200)
  const body = res.json()
  assert.equal(body.ok, true)
  assert.equal(body.data.service, 'cityverse-iot')
  assert.equal(typeof body.data.brokerConnected, 'boolean')
  assert.ok(Array.isArray(body.data.flows))
  assert.equal(body.data.flows.length, 3)
  const keys = body.data.flows.map(f => f.flowKey)
  assert.ok(keys.includes('weather'))
  assert.ok(keys.includes('energy'))
  assert.ok(keys.includes('buildings'))
})

test('IOT /ops/summary reflects recorded flow ingest', async (t) => {
  const app = buildIotServer({ startIngest: false })
  t.after(() => app.close())
  const ts = new Date().toISOString()
  recordFlowIngest('energy', ts)
  const res = await app.inject({ method: 'GET', url: '/ops/summary' })
  assert.equal(res.statusCode, 200)
  const body = res.json()
  const energyFlow = body.data.flows.find(f => f.flowKey === 'energy')
  assert.ok(energyFlow, 'energy flow entry should exist')
  assert.equal(energyFlow.hasData, true)
  assert.equal(energyFlow.lastPayloadTimestamp, ts)
  assert.ok(energyFlow.messageCount >= 1)
  assert.ok(energyFlow.status === 'ok' || energyFlow.status === 'stale')
})

test('IOT root route returns HTML dashboard', async (t) => {
  const app = buildIotServer({ startIngest: false })
  t.after(() => app.close())
  const res = await app.inject({ method: 'GET', url: '/' })
  assert.equal(res.statusCode, 200)
  assert.ok(res.headers['content-type'].startsWith('text/html'), 'should be text/html')
  assert.ok(res.body.includes('Cityverse IOT'), 'should contain dashboard title')
  assert.ok(res.body.includes('ops/summary'), 'should reference ops/summary endpoint')
})

test('factory demand does not collapse on weekends unlike office', async (t) => {
  const app = buildVcServer()
  t.after(() => app.close())

  // Monday 10:00 — full production shift
  await app.inject({ method: 'POST', url: '/api/clock/time', payload: { simTime: '2026-04-20T10:00:00.000Z' } })
  const weekdayRes = await app.inject({ method: 'GET', url: '/api/buildings/current' })
  const weekdayFactory = weekdayRes.json().data.find(b => b.id === 'factory-01')
  const weekdayOffice = weekdayRes.json().data.find(b => b.id === 'office-01')

  // Sunday 10:00 — reduced schedule
  await app.inject({ method: 'POST', url: '/api/clock/time', payload: { simTime: '2026-04-19T10:00:00.000Z' } })
  const weekendRes = await app.inject({ method: 'GET', url: '/api/buildings/current' })
  const weekendFactory = weekendRes.json().data.find(b => b.id === 'factory-01')
  const weekendOffice = weekendRes.json().data.find(b => b.id === 'office-01')

  // Factory weekend drop is modest (≤25%); office drop is steep (≥70%)
  const factoryDrop = 1 - weekendFactory.currentDemandKw / weekdayFactory.currentDemandKw
  const officeDrop  = 1 - weekendOffice.currentDemandKw  / weekdayOffice.currentDemandKw
  assert.ok(factoryDrop <= 0.25, `factory drop ${factoryDrop.toFixed(2)} should be ≤25%`)
  assert.ok(officeDrop  >= 0.70, `office drop ${officeDrop.toFixed(2)} should be ≥70%`)
})

test('IOT /demand/current returns 503 without building telemetry', async (t) => {
  const app = buildIotServer({ startIngest: false })
  t.after(() => app.close())
  const res = await app.inject({ method: 'GET', url: '/demand/current' })
  assert.equal(res.statusCode, 503)
  assert.equal(res.json().ok, false)
})

test('IOT /ops/stats returns three flow entries', async (t) => {
  const app = buildIotServer({ startIngest: false })
  t.after(() => app.close())
  const res = await app.inject({ method: 'GET', url: '/ops/stats' })
  assert.equal(res.statusCode, 200)
  const body = res.json()
  assert.equal(body.ok, true)
  assert.ok(Array.isArray(body.data.flows))
  assert.equal(body.data.flows.length, 3)
  const keys = body.data.flows.map(f => f.flowKey)
  assert.ok(keys.includes('weather'))
  assert.ok(keys.includes('energy'))
  assert.ok(keys.includes('buildings'))
  for (const f of body.data.flows) {
    assert.equal(typeof f.messageCount, 'number')
    assert.equal(typeof f.recentRecordCount, 'number')
  }
})

test('IOT /ops/stats reflects history after appendHistoryRecord', async (t) => {
  const app = buildIotServer({ startIngest: false })
  t.after(() => app.close())
  const ts = new Date().toISOString()
  appendHistoryRecord('weather', ts, { temperatureC: 15 })
  const res = await app.inject({ method: 'GET', url: '/ops/stats' })
  assert.equal(res.statusCode, 200)
  const weatherStat = res.json().data.flows.find(f => f.flowKey === 'weather')
  assert.ok(weatherStat.recentRecordCount >= 1)
  assert.equal(weatherStat.latestPayloadTimestamp, ts)
})

test('IOT /ops/history/:flowKey returns recent records', async (t) => {
  const app = buildIotServer({ startIngest: false })
  t.after(() => app.close())
  const ts = new Date().toISOString()
  appendHistoryRecord('energy', ts, { totalRenewableKw: 500 })
  const res = await app.inject({ method: 'GET', url: '/ops/history/energy' })
  assert.equal(res.statusCode, 200)
  const body = res.json()
  assert.equal(body.ok, true)
  assert.equal(body.data.flowKey, 'energy')
  assert.ok(Array.isArray(body.data.records))
  const last = body.data.records[body.data.records.length - 1]
  assert.equal(last.payloadTimestamp, ts)
  assert.equal(last.summary.totalRenewableKw, 500)
})

test('IOT /ops/history/:flowKey returns 400 for unknown flow', async (t) => {
  const app = buildIotServer({ startIngest: false })
  t.after(() => app.close())
  const res = await app.inject({ method: 'GET', url: '/ops/history/unknown' })
  assert.equal(res.statusCode, 400)
  assert.equal(res.json().ok, false)
})

test('getFlowHistoryStats returns stats for all flows', () => {
  const stats = getFlowHistoryStats()
  assert.equal(stats.length, 3)
  const keys = stats.map(s => s.flowKey)
  assert.ok(keys.includes('weather'))
  assert.ok(keys.includes('energy'))
  assert.ok(keys.includes('buildings'))
})

test('getRecentHistory respects limit', () => {
  const ts = () => new Date().toISOString()
  for (let i = 0; i < 10; i++) {
    appendHistoryRecord('buildings', ts(), { buildingCount: i })
  }
  const records = getRecentHistory('buildings', 3)
  assert.ok(records.length <= 3)
})

test('energy summary includes all new oil backup and CO2 fields', async (t) => {
  const app = buildVcServer()
  t.after(() => app.close())
  const res = await app.inject({ method: 'GET', url: '/api/energy/current' })
  assert.equal(res.statusCode, 200)
  const { data: e } = res.json()
  EnergySummarySchema.parse(e)
  assert.equal(typeof e.oilBackupOutputKw, 'number')
  assert.equal(typeof e.oilBackupOnline, 'boolean')
  assert.equal(typeof e.totalGenerationKw, 'number')
  assert.equal(typeof e.currentCo2KgPerHour, 'number')
  assert.equal(typeof e.gridIntensityKgPerMwh, 'number')
  assert.ok(e.totalGenerationKw >= e.totalRenewableKw, 'totalGenerationKw must be >= totalRenewableKw')
  assert.ok(e.oilBackupOutputKw >= 0)
  assert.ok(e.currentCo2KgPerHour >= 0)
})

test('oil backup activates and CO2 spikes at dark night with no wind', async (t) => {
  const app = buildVcServer()
  t.after(() => app.close())

  await app.inject({ method: 'POST', url: '/api/clock/time', payload: { simTime: '2026-01-15T03:00:00.000Z' } })
  await app.inject({ method: 'POST', url: '/api/weather/nudge', payload: { windBias: -50 } })

  const res = await app.inject({ method: 'GET', url: '/api/energy/current' })
  assert.equal(res.statusCode, 200)
  const { data: e } = res.json()
  EnergySummarySchema.parse(e)

  assert.equal(e.solarOutputKw, 0, 'no solar at 3am')
  assert.equal(e.windOutputKw, 0, 'wind killed by nudge')
  assert.equal(e.totalRenewableKw, 0)
  assert.equal(e.oilBackupOnline, true, 'oil backup must activate when renewables are zero')
  assert.ok(e.oilBackupOutputKw > 0, 'oil backup must produce positive output')
  assert.ok(e.currentCo2KgPerHour > 0, 'CO2 must be positive when oil backup runs')
  assert.ok(e.gridIntensityKgPerMwh > 0, 'grid intensity must be positive when only oil generation runs')
  assert.ok(e.totalGenerationKw > 0, 'city must still have generation via oil backup')
})

test('oil backup is offline and CO2 is zero when oil backup output is zero', async (t) => {
  const app = buildVcServer()
  t.after(() => app.close())

  const res = await app.inject({ method: 'GET', url: '/api/energy/current' })
  const { data: e } = res.json()
  EnergySummarySchema.parse(e)

  if (!e.oilBackupOnline) {
    assert.equal(e.oilBackupOutputKw, 0, 'oil output must be zero when offline')
    assert.equal(e.currentCo2KgPerHour, 0, 'CO2 must be zero when oil backup is offline')
    assert.equal(e.gridIntensityKgPerMwh, 0, 'grid intensity must be zero when no fossil generation')
  }
})

test('city balance uses total generation including oil backup', async (t) => {
  const app = buildVcServer()
  t.after(() => app.close())

  await app.inject({ method: 'POST', url: '/api/clock/time', payload: { simTime: '2026-01-15T03:00:00.000Z' } })
  await app.inject({ method: 'POST', url: '/api/weather/nudge', payload: { windBias: -50 } })

  const [energyRes, cityRes] = await Promise.all([
    app.inject({ method: 'GET', url: '/api/energy/current' }),
    app.inject({ method: 'GET', url: '/api/city/current' }),
  ])
  const energy = energyRes.json().data
  const city = cityRes.json().data
  CitySummarySchema.parse(city)

  const expectedBalance = energy.totalGenerationKw - city.demand.demandKw
  assert.ok(
    Math.abs(city.balanceKw - expectedBalance) < 0.01,
    `city balance (${city.balanceKw.toFixed(2)}) should equal totalGenerationKw - demand (${expectedBalance.toFixed(2)})`
  )
})
