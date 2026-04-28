import test from 'node:test'
import assert from 'node:assert/strict'

import {
  validateBranch,
  validateBranchSafe,
  projectBranchState,
  compareScenario,
} from '../packages/cityverse-operator/dist/index.js'

// Baseline with realistic field names matching the WeatherSummary/EnergySummary contracts
const MOCK_BASELINE = {
  snapshotId: 'snap-test-001',
  capturedAtUtc: '2026-04-28T10:00:00Z',
  profile: 'test',
  sources: { vc: 'live', iot: 'live', dt: 'unavailable' },
  capabilities: { vcReachable: true, iotReachable: true, dtReachable: false },
  vc: {
    clock: { simTime: '2026-04-28T12:00:00Z', speed: 1, paused: false },
    weather: {
      condition: 'partly_cloudy',
      temperatureC: 15,
      cloudCover: 0.3,
      windSpeedMs: 8,
      humidity: 60,
      pressureHpa: 1013,
    },
    energy: {
      solarOutputKw: 1000,
      windOutputKw: 500,
      totalRenewableKw: 1500,
      oilBackupOutputKw: 0,
      oilBackupOnline: false,
      totalGenerationKw: 1500,
      currentCo2KgPerHour: 0,
    },
    city: { demand: { demandKw: 1400 }, balanceKw: 100 },
    buildings: null,
  },
  iot: null,
  dt: null,
  warnings: [],
}

// --- Branch validation ---

test('validateBranch accepts a valid branch', () => {
  const branch = validateBranch({
    branchId: 'b1',
    name: 'Test branch',
    commands: [
      {
        targetService: 'vc',
        commandName: 'weather_nudge',
        targetEntityId: null,
        payload: { cloudBias: 0.2 },
        order: 1,
      },
    ],
    horizon: { durationMinutes: 60, evaluationMode: 'instant' },
    assumptions: [],
  })
  assert.equal(branch.branchId, 'b1')
  assert.equal(branch.commands.length, 1)
  assert.equal(branch.commands[0].commandName, 'weather_nudge')
})

test('validateBranch rejects an unsupported commandName', () => {
  assert.throws(() =>
    validateBranch({
      branchId: 'b-bad',
      name: 'Bad command',
      commands: [
        {
          targetService: 'vc',
          commandName: 'destroy_city',
          targetEntityId: null,
          payload: {},
          order: 1,
        },
      ],
      horizon: { durationMinutes: 60, evaluationMode: 'instant' },
      assumptions: [],
    })
  )
})

test('validateBranchSafe returns ok:false for missing required fields', () => {
  const result = validateBranchSafe({ name: 'No branchId or commands' })
  assert.equal(result.ok, false)
  if (!result.ok) {
    assert.ok(result.errors.length > 0, 'should have validation errors')
  }
})

test('validateBranchSafe returns ok:false for negative durationMinutes', () => {
  const result = validateBranchSafe({
    branchId: 'b-neg',
    name: 'Negative duration',
    commands: [],
    horizon: { durationMinutes: -5, evaluationMode: 'instant' },
    assumptions: [],
  })
  assert.equal(result.ok, false)
})

test('validateBranchSafe returns ok:true for valid branch with set_time', () => {
  const result = validateBranchSafe({
    branchId: 'b-time',
    name: 'Time branch',
    commands: [
      { targetService: 'vc', commandName: 'set_time', targetEntityId: null, payload: { simTime: '2026-04-28T22:00:00Z' }, order: 1 },
    ],
    horizon: { durationMinutes: 30, evaluationMode: 'instant' },
    assumptions: ['Night scenario'],
  })
  assert.equal(result.ok, true)
})

// --- Projector: no live-state mutation ---

test('projectBranchState does not mutate baseline weather object', () => {
  const branch = validateBranch({
    branchId: 'b-nomutate',
    name: 'No-mutate check',
    commands: [
      { targetService: 'vc', commandName: 'weather_nudge', targetEntityId: null, payload: { cloudBias: 0.5, tempBias: -10, windBias: 3 }, order: 1 },
    ],
    horizon: { durationMinutes: 60, evaluationMode: 'instant' },
    assumptions: [],
  })

  const originalCloud = MOCK_BASELINE.vc.weather.cloudCover
  const originalTemp = MOCK_BASELINE.vc.weather.temperatureC
  const originalWind = MOCK_BASELINE.vc.weather.windSpeedMs

  projectBranchState(MOCK_BASELINE, branch)

  assert.equal(MOCK_BASELINE.vc.weather.cloudCover, originalCloud, 'cloudCover must not be mutated')
  assert.equal(MOCK_BASELINE.vc.weather.temperatureC, originalTemp, 'temperatureC must not be mutated')
  assert.equal(MOCK_BASELINE.vc.weather.windSpeedMs, originalWind, 'windSpeedMs must not be mutated')
})

test('projectBranchState does not mutate baseline clock object', () => {
  const branch = validateBranch({
    branchId: 'b-clock-nomutate',
    name: 'Clock no-mutate',
    commands: [
      { targetService: 'vc', commandName: 'set_time', targetEntityId: null, payload: { simTime: '2026-04-28T02:00:00Z' }, order: 1 },
    ],
    horizon: { durationMinutes: 60, evaluationMode: 'instant' },
    assumptions: [],
  })

  const originalSimTime = MOCK_BASELINE.vc.clock.simTime
  projectBranchState(MOCK_BASELINE, branch)
  assert.equal(MOCK_BASELINE.vc.clock.simTime, originalSimTime, 'simTime must not be mutated in baseline')
})

// --- Projector: weather_nudge effects ---

test('weather_nudge cloudBias increases cloudCover and reduces solar', () => {
  const branch = validateBranch({
    branchId: 'b-cloud',
    name: 'Cloud increase',
    commands: [
      { targetService: 'vc', commandName: 'weather_nudge', targetEntityId: null, payload: { cloudBias: 0.4 }, order: 1 },
    ],
    horizon: { durationMinutes: 60, evaluationMode: 'instant' },
    assumptions: [],
  })

  const projected = projectBranchState(MOCK_BASELINE, branch)
  assert.ok(projected.cloudCover !== null && projected.cloudCover > 0.3, 'cloud should increase')
  assert.ok(projected.solarOutputKw !== null && projected.solarOutputKw < 1000, 'solar should decrease')
  // floating-point: 0.3 + 0.4 ≈ 0.7000...001; use tolerance
  assert.ok(projected.cloudCover !== null && Math.abs(projected.cloudCover - 0.7) < 0.001, 'cloudCover ≈ 0.7')
})

test('weather_nudge windBias increases windSpeedMs and windOutputKw', () => {
  const branch = validateBranch({
    branchId: 'b-wind',
    name: 'Wind increase',
    commands: [
      { targetService: 'vc', commandName: 'weather_nudge', targetEntityId: null, payload: { windBias: 4 }, order: 1 },
    ],
    horizon: { durationMinutes: 60, evaluationMode: 'instant' },
    assumptions: [],
  })

  const projected = projectBranchState(MOCK_BASELINE, branch)
  assert.equal(projected.windSpeedMs, 12, 'windSpeed = 8 + 4 = 12 m/s')
  assert.ok(projected.windOutputKw !== null && projected.windOutputKw > 500, 'wind output should increase')
  // Linear scale: 500 * 12/8 = 750
  assert.equal(projected.windOutputKw, 750, 'windOutput = 500 * 12/8 = 750 kW')
})

test('weather_nudge tempBias changes temperature', () => {
  const branch = validateBranch({
    branchId: 'b-temp',
    name: 'Temperature drop',
    commands: [
      { targetService: 'vc', commandName: 'weather_nudge', targetEntityId: null, payload: { tempBias: -10 }, order: 1 },
    ],
    horizon: { durationMinutes: 60, evaluationMode: 'instant' },
    assumptions: [],
  })

  const projected = projectBranchState(MOCK_BASELINE, branch)
  assert.equal(projected.temperatureC, 5, 'temperature = 15 - 10 = 5°C')
})

test('weather_nudge cloudBias clamps at 1.0', () => {
  const branch = validateBranch({
    branchId: 'b-maxcloud',
    name: 'Max cloud',
    commands: [
      { targetService: 'vc', commandName: 'weather_nudge', targetEntityId: null, payload: { cloudBias: 0.9 }, order: 1 },
    ],
    horizon: { durationMinutes: 60, evaluationMode: 'instant' },
    assumptions: [],
  })

  const projected = projectBranchState(MOCK_BASELINE, branch)
  assert.equal(projected.cloudCover, 1.0, 'cloudCover should clamp at 1.0')
  assert.equal(projected.solarOutputKw, 0, 'solar should be 0 at full overcast')
})

// --- Projector: set_time effects ---

test('set_time to midnight reduces solar to zero', () => {
  const branch = validateBranch({
    branchId: 'b-midnight',
    name: 'Midnight scenario',
    commands: [
      { targetService: 'vc', commandName: 'set_time', targetEntityId: null, payload: { simTime: '2026-04-28T00:00:00Z' }, order: 1 },
    ],
    horizon: { durationMinutes: 60, evaluationMode: 'instant' },
    assumptions: [],
  })

  const projected = projectBranchState(MOCK_BASELINE, branch)
  assert.equal(projected.solarOutputKw, 0, 'solar at midnight should be 0')
  assert.equal(projected.simTime, '2026-04-28T00:00:00Z', 'simTime should update in projected state')
})

test('set_speed updates speed in projected state', () => {
  const branch = validateBranch({
    branchId: 'b-speed',
    name: 'Speed change',
    commands: [
      { targetService: 'vc', commandName: 'set_speed', targetEntityId: null, payload: { speed: 5 }, order: 1 },
    ],
    horizon: { durationMinutes: 60, evaluationMode: 'instant' },
    assumptions: [],
  })

  const projected = projectBranchState(MOCK_BASELINE, branch)
  assert.equal(projected.speed, 5)
})

// --- Projector: energy totals recomputed ---

test('projectBranchState recomputes totalRenewableKw and balanceKw', () => {
  const branch = validateBranch({
    branchId: 'b-totals',
    name: 'Totals recompute',
    commands: [
      { targetService: 'vc', commandName: 'weather_nudge', targetEntityId: null, payload: { cloudBias: 0.3, windBias: 4 }, order: 1 },
    ],
    horizon: { durationMinutes: 60, evaluationMode: 'instant' },
    assumptions: [],
  })

  const projected = projectBranchState(MOCK_BASELINE, branch)
  // cloud 0.3+0.3=0.6 → solar fraction (1-0.6)/(1-0.3) = 0.4/0.7 ≈ 0.571 → solar ≈ 571.4
  // wind 8+4=12 → 500*12/8 = 750
  assert.ok(projected.totalRenewableKw !== null, 'totalRenewableKw should be computed')
  assert.ok(projected.balanceKw !== null, 'balanceKw should be computed')
  const expectedTotal = (projected.solarOutputKw ?? 0) + (projected.windOutputKw ?? 0) + (projected.oilBackupOutputKw ?? 0)
  assert.ok(Math.abs((projected.totalGenerationKw ?? 0) - expectedTotal) < 0.01, 'totalGenerationKw = solar + wind + oil')
  assert.ok(Math.abs((projected.balanceKw ?? 0) - (expectedTotal - (projected.demandKw ?? 0))) < 0.01, 'balanceKw = generation - demand')
})

// --- Comparison result structure ---

test('compareScenario result includes limitations and unsupported claims', () => {
  const branch = validateBranch({
    branchId: 'b-cmp',
    name: 'Compare test',
    commands: [],
    horizon: { durationMinutes: 60, evaluationMode: 'instant' },
    assumptions: [],
  })

  const projected = projectBranchState(MOCK_BASELINE, branch)
  const result = compareScenario(MOCK_BASELINE, branch, projected)

  assert.ok(result.limitations.length > 0, 'should have limitations')
  assert.ok(result.unsupportedClaims.length > 0, 'should have unsupported claims')
  assert.ok(result.provenance.method.length > 0, 'provenance.method must be set')
  assert.ok(result.provenance.capturedAt, 'provenance.capturedAt must be set')
  assert.ok(result.provenance.evaluatedAt, 'provenance.evaluatedAt must be set')
  assert.equal(result.baseline.snapshotId, 'snap-test-001')
  assert.equal(result.branch.branchId, 'b-cmp')
})

test('compareScenario solar delta is negative with cloudBias increase', () => {
  const branch = validateBranch({
    branchId: 'b-solar-delta',
    name: 'Solar delta',
    commands: [
      { targetService: 'vc', commandName: 'weather_nudge', targetEntityId: null, payload: { cloudBias: 0.3 }, order: 1 },
    ],
    horizon: { durationMinutes: 60, evaluationMode: 'instant' },
    assumptions: [],
  })

  const projected = projectBranchState(MOCK_BASELINE, branch)
  const result = compareScenario(MOCK_BASELINE, branch, projected)

  const solarDelta = result.metricDeltas.find(m => m.metric === 'solarOutput')
  assert.ok(solarDelta !== undefined, 'should have solarOutput metric delta')
  assert.ok(solarDelta.absoluteDelta !== null && solarDelta.absoluteDelta < 0, 'solar delta should be negative')
})

test('compareScenario includes riskNote when balance goes negative', () => {
  // Build a baseline where balance can go negative
  const tightBaseline = {
    ...MOCK_BASELINE,
    vc: {
      ...MOCK_BASELINE.vc,
      energy: {
        solarOutputKw: 200,
        windOutputKw: 200,
        totalRenewableKw: 400,
        oilBackupOutputKw: 0,
        oilBackupOnline: false,
        totalGenerationKw: 400,
        currentCo2KgPerHour: 0,
      },
      city: { demand: { demandKw: 1400 }, balanceKw: -1000 },
    },
  }

  const branch = validateBranch({
    branchId: 'b-negative',
    name: 'High cloud low gen',
    commands: [
      { targetService: 'vc', commandName: 'weather_nudge', targetEntityId: null, payload: { cloudBias: 0.6 }, order: 1 },
    ],
    horizon: { durationMinutes: 60, evaluationMode: 'instant' },
    assumptions: [],
  })

  const projected = projectBranchState(tightBaseline, branch)
  const result = compareScenario(tightBaseline, branch, projected)

  assert.ok(result.riskNotes.some(n => n.includes('negative')), 'should have negative balance risk note')
})

// --- Portability: works without hardcoded paths ---

test('analysis core functions work with fully null baseline (no services required)', () => {
  const nullBaseline = {
    snapshotId: 'snap-portable',
    capturedAtUtc: new Date().toISOString(),
    profile: 'portable-test',
    sources: { vc: 'unavailable', iot: 'unavailable', dt: 'unavailable' },
    capabilities: { vcReachable: false, iotReachable: false, dtReachable: false },
    vc: null,
    iot: null,
    dt: null,
    warnings: ['VC unavailable', 'IOT unavailable', 'DT not implemented'],
  }

  const branch = validateBranch({
    branchId: 'b-portable',
    name: 'Portable test',
    commands: [
      { targetService: 'vc', commandName: 'weather_nudge', targetEntityId: null, payload: { cloudBias: 0.2 }, order: 1 },
    ],
    horizon: { durationMinutes: 1, evaluationMode: 'instant' },
    assumptions: [],
  })

  const projected = projectBranchState(nullBaseline, branch)
  const result = compareScenario(nullBaseline, branch, projected)

  assert.ok(result !== null)
  assert.ok(result.limitations.length > 0, 'limitations must be present even with null baseline')
  assert.ok(result.unsupportedClaims.length > 0)
  assert.equal(result.baseline.profile, 'portable-test')
  assert.equal(result.baseline.sources.vc, 'unavailable')
})
