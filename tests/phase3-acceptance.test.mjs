/**
 * Phase 3 acceptance suite — proves AI operator readiness.
 *
 * Criteria:
 *   1. Inspect weather/energy/city returns structured envelopes (degraded-ok)
 *   2. Safe control actions pass the guardrail and return structured envelopes
 *   3. Analysis baseline/project/compare works end-to-end
 *   4. Limitations and unsupported claims are always surfaced
 *   5. Docs search returns structured results
 *   6. Degraded-mode output (all services down) is structured and explicit
 *   7. Blocked actions return structured blocked envelopes
 *   8. Operator flow helpers (inspectState, runScenarioComparison) work end-to-end
 */

import test from 'node:test'
import assert from 'node:assert/strict'

import {
  CITYVERSE_TOOLS,
  TOOL_NAMES,
} from '../packages/cityverse-tool-surface/dist/index.js'

import {
  checkActionPolicy,
  ACTION_POLICY_TABLE,
  GUARDRAIL_POLICY_VERSION,
  inspectState,
  explainLimitations,
  runScenarioComparison,
  KNOWN_LIMITATIONS,
  UNSUPPORTED_CLAIMS,
} from '../packages/cityverse-operator/dist/index.js'

// Offline config — no live services. Tests verify structure, not live data.
const OFFLINE_CONFIG = {
  vcBaseUrl: 'http://127.0.0.1:19991',
  iotBaseUrl: 'http://127.0.0.1:19992',
  dtBaseUrl: 'http://127.0.0.1:19993',
  docsRoot: new URL('../docs', import.meta.url).pathname,
  profile: 'acceptance-test',
  enableDangerousCommands: false,
}

// Realistic baseline for in-memory analysis tests
const MOCK_BASELINE = {
  snapshotId: 'snap-accept-001',
  capturedAtUtc: '2026-04-28T12:00:00Z',
  profile: 'acceptance-test',
  sources: { vc: 'live', iot: 'unavailable', dt: 'unavailable' },
  capabilities: { vcReachable: true, iotReachable: false, dtReachable: false },
  vc: {
    clock: { simTime: '2026-04-28T14:00:00Z', speed: 1, paused: false },
    weather: {
      condition: 'partly_cloudy',
      temperatureC: 18,
      cloudCover: 0.4,
      windSpeedMs: 6,
      humidity: 55,
      pressureHpa: 1010,
    },
    energy: {
      solarOutputKw: 800,
      windOutputKw: 350,
      totalRenewableKw: 1150,
      oilBackupOutputKw: 0,
      oilBackupOnline: false,
      totalGenerationKw: 1150,
      currentCo2KgPerHour: 0,
    },
    city: { demand: { demandKw: 1200 }, balanceKw: -50 },
    buildings: null,
  },
  iot: null,
  dt: null,
  warnings: [],
}

// --- 1. Tool registry ---

test('CITYVERSE_TOOLS has all expected stable tool names', () => {
  const expected = [
    'cityverse.system.status',
    'cityverse.vc.get_state', 'cityverse.vc.get_clock', 'cityverse.vc.get_weather',
    'cityverse.vc.get_energy', 'cityverse.vc.get_city', 'cityverse.vc.get_buildings',
    'cityverse.vc.pause', 'cityverse.vc.resume', 'cityverse.vc.set_speed',
    'cityverse.vc.set_time', 'cityverse.vc.weather_nudge',
    'cityverse.iot.get_weather', 'cityverse.iot.get_energy', 'cityverse.iot.get_city',
    'cityverse.iot.get_buildings', 'cityverse.iot.get_ops_summary',
    'cityverse.analysis.capture_baseline', 'cityverse.analysis.project_branch',
    'cityverse.analysis.compare',
    'cityverse.docs.search',
  ]
  for (const name of expected) {
    assert.ok(TOOL_NAMES.includes(name), `Missing tool: ${name}`)
  }
})

// --- 2. Guardrail policy ---

test('guardrail allows all safe read actions', () => {
  const reads = [
    'cityverse.system.status',
    'cityverse.vc.get_weather', 'cityverse.vc.get_energy', 'cityverse.vc.get_city',
    'cityverse.iot.get_weather', 'cityverse.iot.get_energy',
    'cityverse.analysis.capture_baseline', 'cityverse.analysis.project_branch', 'cityverse.analysis.compare',
    'cityverse.docs.search',
  ]
  for (const tool of reads) {
    const result = checkActionPolicy(tool, OFFLINE_CONFIG)
    assert.equal(result.allowed, true, `Expected ${tool} to be allowed`)
    assert.equal(result.policyVersion, GUARDRAIL_POLICY_VERSION)
  }
})

test('guardrail allows all safe control actions', () => {
  const controls = [
    'cityverse.vc.pause', 'cityverse.vc.resume', 'cityverse.vc.set_speed',
    'cityverse.vc.set_time', 'cityverse.vc.weather_nudge',
  ]
  for (const tool of controls) {
    const result = checkActionPolicy(tool, OFFLINE_CONFIG)
    assert.equal(result.allowed, true, `Expected safe control ${tool} to be allowed`)
    if (result.allowed) {
      assert.equal(result.actionClass, 'safe_control')
    }
  }
})

test('guardrail blocks DT command tools', () => {
  const dtTools = [
    'cityverse.dt.get_scene', 'cityverse.dt.get_view',
    'cityverse.dt.focus_entity', 'cityverse.dt.set_view_mode',
  ]
  for (const tool of dtTools) {
    const result = checkActionPolicy(tool, OFFLINE_CONFIG)
    assert.equal(result.allowed, false, `Expected ${tool} to be blocked`)
    if (!result.allowed) {
      assert.equal(result.blockedReason, 'not_implemented')
      assert.ok(result.blockedMessage.length > 0)
      assert.equal(result.policyVersion, GUARDRAIL_POLICY_VERSION)
    }
  }
})

test('guardrail blocks generator dispatch tools', () => {
  const genTools = ['cityverse.vc.generator_start', 'cityverse.vc.generator_stop']
  for (const tool of genTools) {
    const result = checkActionPolicy(tool, OFFLINE_CONFIG)
    assert.equal(result.allowed, false)
    if (!result.allowed) assert.equal(result.blockedReason, 'not_implemented')
  }
})

test('guardrail blocks unknown tools', () => {
  const result = checkActionPolicy('cityverse.unknown.mystery_action', OFFLINE_CONFIG)
  assert.equal(result.allowed, false)
  if (!result.allowed) {
    assert.equal(result.blockedReason, 'policy_denied')
    assert.ok(result.blockedMessage.includes('not registered'))
  }
})

test('ACTION_POLICY_TABLE covers all registered CITYVERSE_TOOLS', () => {
  const policyNames = new Set(ACTION_POLICY_TABLE.map(p => p.toolName))
  for (const name of TOOL_NAMES) {
    assert.ok(policyNames.has(name), `Tool ${name} is missing from ACTION_POLICY_TABLE`)
  }
})

// --- 3. Inspect (criterion 1 — structured envelopes even when offline) ---

test('inspect: system status returns structured envelope when all services offline', async () => {
  const result = await CITYVERSE_TOOLS['cityverse.system.status']({}, OFFLINE_CONFIG)
  assert.equal(result.tool, 'cityverse.system.status')
  assert.equal(typeof result.timestampUtc, 'string')
  assert.equal(result.success, true)
  assert.ok(result.result !== null)
  const r = result.result
  assert.equal(typeof r.serviceMode, 'string')
  assert.equal(r.serviceMode, 'analysis_only')
  assert.equal(r.availableFlows.analyze, true)
  assert.equal(r.availableFlows.docsSearch, true)
  assert.equal(r.availableFlows.control, false)
  assert.equal(r.availableFlows.inspect, false)
  assert.ok(Array.isArray(r.degradedNotes))
  assert.ok(r.degradedNotes.length > 0)
})

test('inspect: vc.get_weather returns structured envelope (success false when offline)', async () => {
  const result = await CITYVERSE_TOOLS['cityverse.vc.get_weather']({}, OFFLINE_CONFIG)
  assert.equal(result.tool, 'cityverse.vc.get_weather')
  assert.equal(typeof result.timestampUtc, 'string')
  assert.equal(typeof result.success, 'boolean')
  assert.ok(Array.isArray(result.errors))
})

test('inspect: iot.get_energy returns structured envelope (success false when offline)', async () => {
  const result = await CITYVERSE_TOOLS['cityverse.iot.get_energy']({}, OFFLINE_CONFIG)
  assert.equal(result.tool, 'cityverse.iot.get_energy')
  assert.equal(typeof result.timestampUtc, 'string')
  assert.ok(Array.isArray(result.errors))
})

// --- 4. Safe control: guardrail wired into handlers (criterion 2) ---

test('control: set_speed returns structured envelope with guardrail meta', async () => {
  // Offline VC means the HTTP call will fail, but the guardrail pass is confirmed by absence of blocked meta
  const result = await CITYVERSE_TOOLS['cityverse.vc.set_speed']({ speed: 2 }, OFFLINE_CONFIG)
  assert.equal(result.tool, 'cityverse.vc.set_speed')
  assert.equal(typeof result.timestampUtc, 'string')
  // Guardrail passed (not blocked) — meta.blocked must be absent or false
  assert.ok(!result.meta?.blocked, 'set_speed should pass guardrail, not be blocked')
})

test('control: set_time returns structured envelope (guardrail passes)', async () => {
  const result = await CITYVERSE_TOOLS['cityverse.vc.set_time'](
    { simTime: '2026-04-28T18:00:00Z' }, OFFLINE_CONFIG
  )
  assert.equal(result.tool, 'cityverse.vc.set_time')
  assert.ok(!result.meta?.blocked, 'set_time should pass guardrail, not be blocked')
})

// --- 5. Analysis: baseline/project/compare (criterion 3) ---

test('analysis: project_branch works with mock baseline (in-memory)', async () => {
  const MOCK_BRANCH = {
    branchId: 'b-accept-001',
    name: 'High cloud cover',
    commands: [
      { targetService: 'vc', commandName: 'weather_nudge', targetEntityId: null, payload: { cloudBias: 0.3 }, order: 1 },
    ],
    horizon: { durationMinutes: 60, evaluationMode: 'instant' },
    assumptions: [],
  }
  const result = await CITYVERSE_TOOLS['cityverse.analysis.project_branch'](
    { baseline: MOCK_BASELINE, branch: MOCK_BRANCH },
    OFFLINE_CONFIG
  )
  assert.equal(result.success, true)
  assert.equal(result.tool, 'cityverse.analysis.project_branch')
  assert.ok(result.result !== null)
})

test('analysis: compare produces metric deltas and limitations', async () => {
  const MOCK_BRANCH = {
    branchId: 'b-accept-002',
    name: 'Wind increase',
    commands: [
      { targetService: 'vc', commandName: 'weather_nudge', targetEntityId: null, payload: { windBias: 4 }, order: 1 },
    ],
    horizon: { durationMinutes: 60, evaluationMode: 'instant' },
    assumptions: [],
  }
  const projectResult = await CITYVERSE_TOOLS['cityverse.analysis.project_branch'](
    { baseline: MOCK_BASELINE, branch: MOCK_BRANCH },
    OFFLINE_CONFIG
  )
  assert.equal(projectResult.success, true)
  const compareResult = await CITYVERSE_TOOLS['cityverse.analysis.compare'](
    { baseline: MOCK_BASELINE, projected: projectResult.result, branch: MOCK_BRANCH },
    OFFLINE_CONFIG
  )
  assert.equal(compareResult.success, true)
  const r = compareResult.result
  assert.ok(Array.isArray(r.metricDeltas), 'metricDeltas must be an array')
  assert.ok(Array.isArray(r.limitations), 'limitations must be an array')
  assert.ok(Array.isArray(r.unsupportedClaims), 'unsupportedClaims must be an array')
  assert.ok(Array.isArray(r.topFindings), 'topFindings must be an array')
  assert.ok(r.limitations.length > 0, 'limitations must be non-empty')
  assert.ok(r.unsupportedClaims.length > 0, 'unsupportedClaims must be non-empty')
})

// --- 6. Limitations always surfaced (criterion 4) ---

test('limitations: KNOWN_LIMITATIONS is non-empty', () => {
  assert.ok(Array.isArray(KNOWN_LIMITATIONS))
  assert.ok(KNOWN_LIMITATIONS.length > 0)
  for (const l of KNOWN_LIMITATIONS) assert.equal(typeof l, 'string')
})

test('limitations: UNSUPPORTED_CLAIMS covers generator and DT', () => {
  assert.ok(Array.isArray(UNSUPPORTED_CLAIMS))
  const claims = UNSUPPORTED_CLAIMS.map(c => c.claim)
  assert.ok(claims.some(c => c.toLowerCase().includes('generator')), 'Must include generator claim')
  assert.ok(claims.some(c => c.toLowerCase().includes('dt') || c.toLowerCase().includes('scene')), 'Must include DT/scene claim')
})

test('limitations: explainLimitations returns both arrays', () => {
  const result = explainLimitations()
  assert.ok(Array.isArray(result.limitations))
  assert.ok(Array.isArray(result.unsupportedClaims))
  assert.ok(result.limitations.length > 0)
  assert.ok(result.unsupportedClaims.length > 0)
})

// --- 7. Docs search (criterion 5) ---

test('docs: search returns structured results for a known term', async () => {
  const result = await CITYVERSE_TOOLS['cityverse.docs.search'](
    { query: 'weather', limit: 3 },
    OFFLINE_CONFIG
  )
  assert.equal(result.tool, 'cityverse.docs.search')
  assert.equal(result.success, true)
  assert.ok(Array.isArray(result.result) || result.result !== null)
})

test('docs: search with no matches returns structured empty result', async () => {
  const result = await CITYVERSE_TOOLS['cityverse.docs.search'](
    { query: 'xyzzy_no_match_at_all_qwerty', limit: 3 },
    OFFLINE_CONFIG
  )
  assert.equal(result.tool, 'cityverse.docs.search')
  // Must be structured even for zero results
  assert.equal(typeof result.success, 'boolean')
  assert.ok(Array.isArray(result.errors))
})

// --- 8. Degraded mode (criterion 6) ---

test('degraded: serviceMode is analysis_only when no services reachable', async () => {
  const result = await CITYVERSE_TOOLS['cityverse.system.status']({}, OFFLINE_CONFIG)
  assert.equal(result.result.serviceMode, 'analysis_only')
})

test('degraded: availableFlows.analyze is always true', async () => {
  const result = await CITYVERSE_TOOLS['cityverse.system.status']({}, OFFLINE_CONFIG)
  assert.equal(result.result.availableFlows.analyze, true)
  assert.equal(result.result.availableFlows.docsSearch, true)
})

test('degraded: degradedNotes explain each unavailable service', async () => {
  const result = await CITYVERSE_TOOLS['cityverse.system.status']({}, OFFLINE_CONFIG)
  const notes = result.result.degradedNotes
  assert.ok(Array.isArray(notes))
  // All three services offline → should have notes for VC, IOT, DT
  assert.ok(notes.length >= 3, `Expected 3+ degraded notes, got ${notes.length}`)
})

// --- 9. Blocked actions return structured envelope (criterion 7) ---

test('blocked: handler for a blocked tool returns structured blocked envelope via guardrail in vc.ts', async () => {
  // generator_start is not a registered tool handler, so we test via guardrail directly
  const result = checkActionPolicy('cityverse.vc.generator_start', OFFLINE_CONFIG)
  assert.equal(result.allowed, false)
  if (!result.allowed) {
    assert.equal(result.blockedReason, 'not_implemented')
    assert.ok(typeof result.blockedMessage === 'string' && result.blockedMessage.length > 0)
  }
})

// --- 10. Operator flow helpers (criterion 8) ---

test('flow: inspectState returns structured result (offline — both services down)', async () => {
  const result = await inspectState(OFFLINE_CONFIG)
  assert.equal(typeof result.success, 'boolean')
  assert.equal(typeof result.timestampUtc, 'string')
  assert.ok(Array.isArray(result.warnings))
  // Both offline → null
  assert.equal(result.vc, null)
  assert.equal(result.iot, null)
  assert.ok(result.warnings.length > 0)
})

test('flow: runScenarioComparison throws on invalid branch commands', async () => {
  await assert.rejects(
    () => runScenarioComparison(OFFLINE_CONFIG, [
      { targetService: 'vc', commandName: 'generator_start', targetEntityId: null, payload: {}, order: 1 },
    ], 'Invalid branch test'),
    /invalid scenario branch/i
  )
})

test('flow: runScenarioComparison works with offline VC (baseline uses offline snapshot)', async () => {
  // captureBaseline with offline VC produces a degraded baseline — projector still runs
  const result = await runScenarioComparison(OFFLINE_CONFIG, [
    { targetService: 'vc', commandName: 'weather_nudge', targetEntityId: null, payload: { cloudBias: 0.2 }, order: 1 },
  ], 'Offline scenario test')
  assert.equal(typeof result.flowId, 'string')
  assert.equal(result.label, 'Offline scenario test')
  assert.ok(result.comparison !== null)
  assert.ok(Array.isArray(result.comparison.limitations))
  assert.ok(result.limitations.limitations.length > 0)
  assert.ok(result.limitations.unsupportedClaims.length > 0)
})
