import test from 'node:test'
import assert from 'node:assert/strict'

import {
  CITYVERSE_TOOLS,
  TOOL_NAMES,
  handleSystemStatus,
  handleVcGetWeather,
  handleVcSetSpeed,
  handleVcSetTime,
  handleVcWeatherNudge,
  handleIotGetWeather,
  handleAnalysisCaptureBaseline,
  handleAnalysisProjectBranch,
  handleAnalysisCompare,
  handleDocsSearch,
} from '../packages/cityverse-tool-surface/dist/index.js'

// Reuse the same mock baseline from operator-phase2 tests
const MOCK_BASELINE = {
  snapshotId: 'snap-ts-001',
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

const MOCK_BRANCH = {
  branchId: 'b-ts-001',
  name: 'Tool surface test branch',
  commands: [
    {
      targetService: 'vc',
      commandName: 'weather_nudge',
      targetEntityId: null,
      payload: { cloudBias: 0.2, windBias: 2 },
      order: 1,
    },
  ],
  horizon: { durationMinutes: 60, evaluationMode: 'instant' },
  assumptions: [],
}

// --- Tool registry ---

test('CITYVERSE_TOOLS exports all expected stable tool names', () => {
  const EXPECTED = [
    'cityverse.system.status',
    'cityverse.vc.get_state',
    'cityverse.vc.get_clock',
    'cityverse.vc.get_weather',
    'cityverse.vc.get_energy',
    'cityverse.vc.get_city',
    'cityverse.vc.get_buildings',
    'cityverse.vc.pause',
    'cityverse.vc.resume',
    'cityverse.vc.set_speed',
    'cityverse.vc.set_time',
    'cityverse.vc.weather_nudge',
    'cityverse.iot.get_weather',
    'cityverse.iot.get_energy',
    'cityverse.iot.get_city',
    'cityverse.iot.get_buildings',
    'cityverse.iot.get_ops_summary',
    'cityverse.analysis.capture_baseline',
    'cityverse.analysis.project_branch',
    'cityverse.analysis.compare',
    'cityverse.docs.search',
  ]
  for (const name of EXPECTED) {
    assert.ok(name in CITYVERSE_TOOLS, `missing tool: ${name}`)
    assert.equal(typeof CITYVERSE_TOOLS[name], 'function', `${name} must be a function`)
  }
})

test('TOOL_NAMES contains all registry keys', () => {
  assert.deepEqual(TOOL_NAMES.sort(), Object.keys(CITYVERSE_TOOLS).sort())
})

// --- Envelope shape ---

test('system.status returns a valid envelope (services unreachable in CI is acceptable)', async () => {
  const env = await handleSystemStatus()
  assert.equal(env.tool, 'cityverse.system.status')
  assert.equal(env.source, 'system')
  assert.equal(env.success, true)
  assert.ok(env.result !== null)
  assert.ok('capabilities' in env.result, 'result must include capabilities')
  assert.ok('services' in env.result, 'result must include services')
  assert.equal(typeof env.result.capabilities.analysisAvailable, 'boolean')
  assert.equal(env.result.capabilities.analysisAvailable, true)
  assert.equal(typeof env.result.capabilities.docsSearchAvailable, 'boolean')
  assert.equal(env.result.capabilities.docsSearchAvailable, true)
  assert.ok(Array.isArray(env.errors))
})

test('vc.get_weather returns valid envelope shape even when VC unreachable', async () => {
  const env = await handleVcGetWeather()
  assert.equal(env.tool, 'cityverse.vc.get_weather')
  assert.equal(env.source, 'vc')
  assert.equal(typeof env.action, 'string')
  assert.ok(env.action.length > 0)
  assert.ok(Array.isArray(env.errors))
  assert.ok(typeof env.timestampUtc === 'string')
})

test('iot.get_weather returns valid envelope shape even when IOT unreachable', async () => {
  const env = await handleIotGetWeather()
  assert.equal(env.tool, 'cityverse.iot.get_weather')
  assert.equal(env.source, 'iot')
  assert.ok(Array.isArray(env.errors))
})

// --- Input validation ---

test('vc.set_speed rejects missing speed', async () => {
  const env = await handleVcSetSpeed({})
  assert.equal(env.success, false)
  assert.ok(env.errors.length > 0)
  assert.ok(env.errors[0].includes('speed') || env.errors[0].includes('required'))
})

test('vc.set_speed rejects negative speed', async () => {
  const env = await handleVcSetSpeed({ speed: -1 })
  assert.equal(env.success, false)
  assert.ok(env.errors.length > 0)
})

test('vc.set_time rejects missing simTime', async () => {
  const env = await handleVcSetTime({})
  assert.equal(env.success, false)
  assert.ok(env.errors.length > 0)
})

test('vc.weather_nudge rejects missing nudge object', async () => {
  const env = await handleVcWeatherNudge({})
  assert.equal(env.success, false)
  assert.ok(env.errors.length > 0)
})

test('docs.search rejects empty query', async () => {
  const env = await handleDocsSearch({ query: '' })
  assert.equal(env.success, false)
  assert.ok(env.errors.length > 0)
})

test('analysis.project_branch rejects missing baseline', async () => {
  const env = await handleAnalysisProjectBranch({ branch: MOCK_BRANCH })
  assert.equal(env.success, false)
  assert.ok(env.errors.length > 0)
})

test('analysis.project_branch rejects invalid branch commandName', async () => {
  const env = await handleAnalysisProjectBranch({
    baseline: MOCK_BASELINE,
    branch: {
      branchId: 'bad',
      name: 'Bad',
      commands: [{ targetService: 'vc', commandName: 'explode_city', targetEntityId: null, payload: {}, order: 1 }],
      horizon: { durationMinutes: 60, evaluationMode: 'instant' },
      assumptions: [],
    },
  })
  assert.equal(env.success, false)
  assert.ok(env.errors.length > 0, 'should have validation errors for unsupported commandName')
})

test('analysis.compare rejects missing projected', async () => {
  const env = await handleAnalysisCompare({ baseline: MOCK_BASELINE, branch: MOCK_BRANCH })
  assert.equal(env.success, false)
  assert.ok(env.errors.length > 0)
})

// --- Analysis end-to-end (no live services) ---

test('analysis.capture_baseline returns a valid snapshot (services may be down)', async () => {
  const env = await handleAnalysisCaptureBaseline()
  assert.equal(env.tool, 'cityverse.analysis.capture_baseline')
  assert.equal(env.source, 'analysis')
  assert.equal(env.success, true)
  assert.ok(env.result !== null)
  assert.ok('snapshotId' in env.result, 'snapshot must have snapshotId')
  assert.ok('capturedAtUtc' in env.result, 'snapshot must have capturedAtUtc')
  assert.ok('capabilities' in env.result, 'snapshot must have capabilities')
  assert.ok(Array.isArray(env.errors))
})

test('analysis.project_branch succeeds with mock baseline and valid branch', async () => {
  const env = await handleAnalysisProjectBranch({
    baseline: MOCK_BASELINE,
    branch: MOCK_BRANCH,
  })
  assert.equal(env.success, true, `expected success, got errors: ${JSON.stringify(env.errors)}`)
  assert.equal(env.tool, 'cityverse.analysis.project_branch')
  assert.ok(env.result !== null)
})

test('analysis.compare succeeds end-to-end with mock data', async () => {
  // project first
  const projEnv = await handleAnalysisProjectBranch({
    baseline: MOCK_BASELINE,
    branch: MOCK_BRANCH,
  })
  assert.equal(projEnv.success, true)

  const cmpEnv = await handleAnalysisCompare({
    baseline: MOCK_BASELINE,
    branch: MOCK_BRANCH,
    projected: projEnv.result,
  })
  assert.equal(cmpEnv.success, true, `expected success, got: ${JSON.stringify(cmpEnv.errors)}`)
  assert.equal(cmpEnv.tool, 'cityverse.analysis.compare')
  assert.ok(cmpEnv.result !== null)
  assert.ok('metricDeltas' in cmpEnv.result, 'result must include metricDeltas')
  assert.ok('topFindings' in cmpEnv.result, 'result must include topFindings')
  assert.ok('limitations' in cmpEnv.result, 'result must include limitations')
  assert.ok('unsupportedClaims' in cmpEnv.result, 'result must include unsupportedClaims')
  assert.ok('provenance' in cmpEnv.result, 'result must include provenance')
  assert.ok(Array.isArray(cmpEnv.result.limitations))
  assert.ok(cmpEnv.result.limitations.length > 0, 'limitations must be non-empty')
})

// --- Docs search ---

test('docs.search finds Cityverse docs for a known term', async () => {
  const env = await handleDocsSearch({ query: 'IOT' })
  assert.equal(env.success, true)
  assert.equal(env.tool, 'cityverse.docs.search')
  assert.ok(env.result !== null)
  assert.ok('matches' in env.result)
  assert.ok(Array.isArray(env.result.matches))
  assert.ok(env.result.matches.length > 0, 'expected at least one doc match for "IOT"')
})

test('docs.search returns empty matches for an unknown term', async () => {
  const env = await handleDocsSearch({ query: 'xyzzy_nonexistent_term_12345' })
  assert.equal(env.success, true)
  assert.ok(Array.isArray(env.result.matches))
  assert.equal(env.result.matches.length, 0)
})

// --- CITYVERSE_TOOLS dispatch ---

test('CITYVERSE_TOOLS dispatch works for docs.search', async () => {
  const handler = CITYVERSE_TOOLS['cityverse.docs.search']
  assert.ok(handler, 'handler must exist')
  const env = await handler({ query: 'weather' })
  assert.equal(env.success, true)
  assert.equal(env.tool, 'cityverse.docs.search')
})

test('CITYVERSE_TOOLS dispatch works for analysis.capture_baseline', async () => {
  const handler = CITYVERSE_TOOLS['cityverse.analysis.capture_baseline']
  assert.ok(handler)
  const env = await handler({})
  assert.equal(env.success, true)
  assert.equal(env.tool, 'cityverse.analysis.capture_baseline')
})
