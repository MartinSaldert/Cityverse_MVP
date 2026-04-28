import test from 'node:test'
import assert from 'node:assert/strict'

import { EnergyService } from '../apps/cityverse-vc/dist/energy/service.js'

function makeService({
  windSpeedMps,
  solarRadiationWm2 = 550,
  temperatureC = 15,
  simTime = '2026-04-28T12:00:00.000Z',
  demandKw = 1746.95,
} = {}) {
  const weather = {
    getState() {
      return {
        simTime,
        solarRadiationWm2,
        windSpeedMps,
        temperatureC,
      }
    },
  }

  const buildings = {
    getDemandSummary() {
      return {
        demandKw,
        updatedAt: simTime,
      }
    },
  }

  return new EnergyService(weather, buildings)
}

test('vc energy model gives meaningful district-scale wind output at 4.1 m/s', () => {
  const service = makeService({ windSpeedMps: 4.1 })
  const summary = service.getSummary()

  assert.ok(summary.windOutputKw > 30, `expected >30 kW at 4.1 m/s, got ${summary.windOutputKw}`)
  assert.ok(summary.windOutputKw < 120, `expected <120 kW at 4.1 m/s, got ${summary.windOutputKw}`)
  assert.ok(summary.solarOutputKw > 500, `expected stronger solar fleet output, got ${summary.solarOutputKw}`)
})

test('vc energy model stays at zero below cut-in wind speed', () => {
  const service = makeService({ windSpeedMps: 2.4 })
  const summary = service.getSummary()

  assert.equal(summary.windOutputKw, 0)
})

test('vc energy model reaches rated district-scale wind capacity at 12 m/s', () => {
  const service = makeService({ windSpeedMps: 12 })
  const summary = service.getSummary()

  assert.equal(summary.windOutputKw, 1800)
})

test('vc oil backup fills remaining deficit without exceeding demand', () => {
  const service = makeService({ windSpeedMps: 4.1 })
  const summary = service.getSummary()

  assert.ok(summary.totalGenerationKw <= 1746.95 + 0.001)
  assert.ok(summary.oilBackupOutputKw > 0)
  assert.ok(summary.totalRenewableKw > summary.windOutputKw)
})
