/**
 * Cityverse operator Phase 1 demo.
 *
 * Requires @cityverse/operator to be built first:
 *   pnpm build:operator
 *
 * Then run:
 *   node scripts/cityverse-operator-demo.mjs
 *
 * VC and IOT should be running for live data. The demo handles
 * unreachable services gracefully and reports what it finds.
 */

import {
  loadConfig,
  checkSystemStatus,
  getVcState,
  getIotCityState,
  pauseSimulation,
  resumeSimulation,
  searchDocs,
  getAuditLog,
} from '../packages/cityverse-operator/dist/index.js'

const ACTOR = 'operator_demo'

async function main() {
  const config = loadConfig()

  console.log('\n=== Cityverse Operator Demo ===')
  console.log(`Profile: ${config.profile}`)
  console.log(`VC: ${config.vcBaseUrl}`)
  console.log(`IOT: ${config.iotBaseUrl}`)
  console.log(`DT: ${config.dtBaseUrl}`)
  console.log(`Docs root: ${config.docsRoot}`)

  // 1. System status
  console.log('\n--- 1. System status ---')
  const status = await checkSystemStatus(config)
  for (const [svc, s] of Object.entries(status)) {
    if (svc === 'checkedAt') continue
    const mark = s.reachable ? '✓' : '✗'
    const latency = s.latencyMs != null ? ` (${s.latencyMs}ms)` : ''
    const err = s.error ? ` — ${s.error}` : ''
    console.log(`  ${mark} ${svc}${latency}${err}`)
  }

  // 2. VC state
  console.log('\n--- 2. VC state ---')
  const vcState = await getVcState(config)
  if (vcState.success) {
    const d = vcState.data
    const clock = d?.clock?.data
    const weather = d?.weather?.data
    const energy = d?.energy?.data
    const city = d?.city?.data

    if (clock) console.log(`  Clock: ${clock.simTime}  speed=${clock.speed}x  paused=${clock.paused}`)
    if (weather) console.log(`  Weather: ${weather.weatherCategory}  ${weather.temperatureC?.toFixed(1)}°C  wind ${weather.windSpeedMs?.toFixed(1)} m/s`)
    if (energy) console.log(`  Energy: solar=${energy.solarOutputKw?.toFixed(0)} kW  wind=${energy.windOutputKw?.toFixed(0)} kW  oil_backup=${energy.oilBackupOnline}`)
    if (city) console.log(`  City: demand=${city.demand?.demandKw?.toFixed(0)} kW  balance=${city.balanceKw?.toFixed(0)} kW`)
  } else {
    console.log(`  VC unavailable: ${vcState.error}`)
  }

  // 3. IOT city state
  console.log('\n--- 3. IOT city state ---')
  const iotCity = await getIotCityState(config)
  if (iotCity.success) {
    const d = iotCity.data?.data
    if (d) console.log(`  City via IOT: demand=${d.demand?.demandKw?.toFixed(0)} kW  balance=${d.balanceKw?.toFixed(0)} kW`)
  } else {
    console.log(`  IOT unavailable: ${iotCity.error}`)
  }

  // 4. Pause / resume cycle
  console.log('\n--- 4. Pause / resume cycle ---')
  const pauseResult = await pauseSimulation(config, ACTOR)
  if (pauseResult.success) {
    const d = pauseResult.result?.data
    console.log(`  Paused: cmd=${pauseResult.commandId}  paused=${d?.paused}`)
  } else {
    console.log(`  Pause failed: ${pauseResult.errors[0]?.message}`)
  }

  const resumeResult = await resumeSimulation(config, ACTOR)
  if (resumeResult.success) {
    const d = resumeResult.result?.data
    console.log(`  Resumed: cmd=${resumeResult.commandId}  paused=${d?.paused}`)
  } else {
    console.log(`  Resume failed: ${resumeResult.errors[0]?.message}`)
  }

  // 5. Docs search
  console.log('\n--- 5. Docs search: "IOT" ---')
  const docsResults = await searchDocs(config.docsRoot, 'IOT')
  if (docsResults.length === 0) {
    console.log(`  No results (docs root may not be accessible: ${config.docsRoot})`)
  } else {
    for (const r of docsResults.slice(0, 3)) {
      console.log(`  ${r.filename}: ${r.matchCount} match(es)`)
    }
    console.log(`  ... ${docsResults.length} file(s) total`)
  }

  // 6. Audit log
  console.log('\n--- 6. Audit log ---')
  const log = getAuditLog()
  for (const entry of log) {
    console.log(`  [${entry.timestampUtc}] ${entry.resultStatus} ${entry.action} cmd=${entry.commandId}`)
  }

  console.log('\n=== Done ===\n')
}

main().catch(err => {
  console.error('Demo failed:', err)
  process.exit(1)
})
