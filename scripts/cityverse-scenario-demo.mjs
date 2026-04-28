/**
 * Cityverse operator Phase 2 scenario analysis demo.
 *
 * Requires @cityverse/operator to be built first:
 *   pnpm build:operator
 *
 * Then run:
 *   node scripts/cityverse-scenario-demo.mjs
 *
 * Services do not need to be running. The demo handles unavailable services
 * gracefully and demonstrates the full analysis path: baseline capture,
 * branch validation, projection, diff, limitations reporting.
 */

import {
  loadConfig,
  captureBaseline,
  validateBranchSafe,
  projectBranchState,
  compareScenario,
} from '../packages/cityverse-operator/dist/index.js'

async function main() {
  const config = loadConfig()

  console.log('\n=== Cityverse Phase 2 Scenario Analysis Demo ===')
  console.log(`Profile: ${config.profile}`)
  console.log(`VC: ${config.vcBaseUrl}  IOT: ${config.iotBaseUrl}  DT: ${config.dtBaseUrl}`)

  // Step 1: capture baseline from live adapters
  console.log('\n--- 1. Baseline capture ---')
  const baseline = await captureBaseline(config)
  console.log(`  snapshotId:   ${baseline.snapshotId}`)
  console.log(`  capturedAt:   ${baseline.capturedAtUtc}`)
  console.log(`  sources:      vc=${baseline.sources.vc}  iot=${baseline.sources.iot}  dt=${baseline.sources.dt}`)
  if (baseline.vc) {
    const weather = baseline.vc.weather
    const energy = baseline.vc.energy
    const city = baseline.vc.city
    if (weather) {
      console.log(`  vc.weather:   temp=${weather.temperatureC?.toFixed?.(1) ?? '?'}°C  cloud=${weather.cloudCover?.toFixed?.(2) ?? '?'}  wind=${weather.windSpeedMs?.toFixed?.(1) ?? '?'}m/s`)
    }
    if (energy) {
      console.log(`  vc.energy:    solar=${energy.solarOutputKw?.toFixed?.(0) ?? '?'}kW  wind=${energy.windOutputKw?.toFixed?.(0) ?? '?'}kW  total=${energy.totalGenerationKw?.toFixed?.(0) ?? '?'}kW`)
    }
    if (city) {
      console.log(`  vc.city:      demand=${city.demand?.demandKw?.toFixed?.(0) ?? '?'}kW  balance=${city.balanceKw?.toFixed?.(0) ?? '?'}kW`)
    }
  } else {
    console.log('  vc: unavailable (services may not be running)')
  }
  if (baseline.warnings.length > 0) {
    console.log(`  warnings (${baseline.warnings.length}):`)
    for (const w of baseline.warnings) {
      console.log(`    - ${w}`)
    }
  }

  // Step 2: define a hypothetical branch as structured commands
  console.log('\n--- 2. Branch definition ---')
  const branchInput = {
    branchId: 'branch-winter-storm',
    name: 'Winter storm scenario',
    description: 'Simulate heavy cloud cover, increased wind, and cold temperature',
    commands: [
      {
        targetService: 'vc',
        commandName: 'weather_nudge',
        targetEntityId: null,
        payload: { cloudBias: 0.4, windBias: 5.0, tempBias: -8.0, humidityBias: 20 },
        order: 1,
        intentSummary: 'Winter storm: +40% cloud, +5m/s wind, -8°C temperature, +20% humidity',
      },
    ],
    horizon: {
      durationMinutes: 60,
      evaluationMode: 'instant',
    },
    assumptions: [
      'Cloud cover increases by 0.4 (cloudBias)',
      'Wind speed increases by 5 m/s',
      'Temperature drops by 8°C',
      'Humidity increases by 20%',
      'Demand held constant from baseline',
      'Oil backup dispatch unchanged',
    ],
  }

  const validation = validateBranchSafe(branchInput)
  if (!validation.ok) {
    console.error('Branch validation failed:', validation.errors)
    process.exit(1)
  }
  const branch = validation.branch
  console.log(`  Branch:    ${branch.name} (${branch.branchId})`)
  console.log(`  Commands:  ${branch.commands.length}`)
  console.log(`  Horizon:   ${branch.horizon.durationMinutes} min, evaluationMode=${branch.horizon.evaluationMode}`)
  for (const cmd of branch.commands) {
    console.log(`    [${cmd.order}] ${cmd.commandName} — ${cmd.intentSummary ?? 'no summary'}`)
  }

  // Step 3: project branch state in memory — no live mutations
  console.log('\n--- 3. Branch projection (no live mutations) ---')
  const projected = projectBranchState(baseline, branch)
  console.log(`  temperature:       ${projected.temperatureC?.toFixed(1) ?? 'n/a'} °C`)
  console.log(`  cloudCover:        ${projected.cloudCover?.toFixed(2) ?? 'n/a'}`)
  console.log(`  windSpeed:         ${projected.windSpeedMs?.toFixed(1) ?? 'n/a'} m/s`)
  console.log(`  solarOutput:       ${projected.solarOutputKw?.toFixed(1) ?? 'n/a'} kW`)
  console.log(`  windOutput:        ${projected.windOutputKw?.toFixed(1) ?? 'n/a'} kW`)
  console.log(`  totalRenewable:    ${projected.totalRenewableKw?.toFixed(1) ?? 'n/a'} kW`)
  console.log(`  balance:           ${projected.balanceKw?.toFixed(1) ?? 'n/a'} kW`)
  if (projected.estimationNotes.length > 0) {
    console.log(`  estimation notes (${projected.estimationNotes.length}):`)
    for (const n of projected.estimationNotes) {
      console.log(`    - ${n}`)
    }
  }

  // Step 4: baseline-vs-branch comparison
  console.log('\n--- 4. Comparison result ---')
  const result = compareScenario(baseline, branch, projected)

  console.log('\n  Top findings:')
  for (const f of result.topFindings) {
    console.log(`    * ${f}`)
  }

  if (result.riskNotes.length > 0) {
    console.log('\n  Risk notes:')
    for (const r of result.riskNotes) {
      console.log(`    ! ${r}`)
    }
  }

  console.log('\n  Metric deltas:')
  for (const m of result.metricDeltas) {
    if (m.baselineValue === null && m.branchValue === null) continue
    const base = m.baselineValue !== null ? m.baselineValue.toFixed(2) : 'n/a'
    const branchVal = m.branchValue !== null ? m.branchValue.toFixed(2) : 'n/a'
    const delta =
      m.absoluteDelta !== null
        ? (m.absoluteDelta >= 0 ? '+' : '') + m.absoluteDelta.toFixed(2)
        : 'n/a'
    console.log(
      `    ${m.metric.padEnd(22)} base=${base.padStart(10)}  branch=${branchVal.padStart(10)}  delta=${delta.padStart(10)}  ${m.units ?? ''}`
    )
  }

  console.log(`\n  Limitations (${result.limitations.length} total, showing first 5):`)
  for (const l of result.limitations.slice(0, 5)) {
    console.log(`    - ${l}`)
  }
  if (result.limitations.length > 5) {
    console.log(`    ... and ${result.limitations.length - 5} more`)
  }

  console.log(`\n  Unsupported claims (${result.unsupportedClaims.length}):`)
  for (const u of result.unsupportedClaims) {
    console.log(`    - [${u.claim}]: ${u.reason}`)
  }

  console.log('\n  Provenance:')
  console.log(`    method:        ${result.provenance.method}`)
  console.log(`    engineVersion: ${result.provenance.engineVersion}`)
  console.log(`    capturedAt:    ${result.provenance.capturedAt}`)
  console.log(`    evaluatedAt:   ${result.provenance.evaluatedAt}`)
  console.log(`    commands applied: ${result.provenance.commandsApplied.length}`)

  console.log('\n=== Demo complete ===\n')
}

main().catch(err => {
  console.error('Demo failed:', err)
  process.exit(1)
})
