#!/usr/bin/env node

import {
  loadConfig,
  checkSystemStatus,
  inspectState,
  runScenarioComparison,
  searchDocs,
  getVcState,
  getVcClockState,
  getVcWeatherState,
  getVcEnergyState,
  getVcCityState,
  getVcBuildingsState,
  getIotWeatherState,
  getIotEnergyState,
  getIotCityState,
  getIotBuildingsState,
  getIotOpsSummary,
  pauseSimulation,
  resumeSimulation,
  setSimulationSpeed,
  setSimulationTime,
  applyWeatherNudge,
} from '../packages/cityverse-operator/dist/index.js'

const config = loadConfig()
const [, , command, ...args] = process.argv

function print(data) {
  process.stdout.write(`${JSON.stringify(data, null, 2)}\n`)
}

function fail(message, extra = {}) {
  process.stderr.write(`${message}\n`)
  if (Object.keys(extra).length > 0) {
    process.stderr.write(`${JSON.stringify(extra, null, 2)}\n`)
  }
  process.exit(1)
}

function usage() {
  print({
    usage: 'node scripts/syntra-cityverse.mjs <command> [...args]',
    commands: [
      'status', 'inspect',
      'vc-state', 'vc-clock', 'vc-weather', 'vc-energy', 'vc-city', 'vc-buildings',
      'iot-weather', 'iot-energy', 'iot-city', 'iot-buildings', 'iot-ops-summary',
      'pause', 'resume', 'set-speed <number>', 'set-time <isoTime>',
      'weather-nudge <json>',
      'docs-search <query>',
      'analyze <commands-json-array> [label]',
    ],
    config,
  })
}

function parseJsonArg(raw, label) {
  try {
    return JSON.parse(raw)
  } catch (error) {
    fail(`Invalid ${label} JSON`, { raw, error: String(error) })
  }
}

async function main() {
  if (!command || command === 'help' || command === '--help' || command === '-h') {
    usage()
    return
  }

  switch (command) {
    case 'status':
      print(await checkSystemStatus(config))
      return

    case 'inspect':
      print(await inspectState(config))
      return

    case 'vc-state':
      print(await getVcState(config))
      return
    case 'vc-clock':
      print(await getVcClockState(config))
      return
    case 'vc-weather':
      print(await getVcWeatherState(config))
      return
    case 'vc-energy':
      print(await getVcEnergyState(config))
      return
    case 'vc-city':
      print(await getVcCityState(config))
      return
    case 'vc-buildings':
      print(await getVcBuildingsState(config))
      return

    case 'iot-weather':
      print(await getIotWeatherState(config))
      return
    case 'iot-energy':
      print(await getIotEnergyState(config))
      return
    case 'iot-city':
      print(await getIotCityState(config))
      return
    case 'iot-buildings':
      print(await getIotBuildingsState(config))
      return
    case 'iot-ops-summary':
      print(await getIotOpsSummary(config))
      return

    case 'pause': {
      const actor = args[0] ?? 'syntra'
      print(await pauseSimulation(config, actor))
      return
    }

    case 'resume': {
      const actor = args[0] ?? 'syntra'
      print(await resumeSimulation(config, actor))
      return
    }

    case 'set-speed': {
      const speed = Number(args[0])
      if (!Number.isFinite(speed)) fail('set-speed requires a numeric speed')
      const actor = args[1] ?? 'syntra'
      print(await setSimulationSpeed(config, speed, actor))
      return
    }

    case 'set-time': {
      const simTime = args[0]
      if (!simTime) fail('set-time requires an ISO timestamp')
      const actor = args[1] ?? 'syntra'
      print(await setSimulationTime(config, simTime, actor))
      return
    }

    case 'weather-nudge': {
      const raw = args[0]
      if (!raw) fail('weather-nudge requires a JSON payload')
      const nudge = parseJsonArg(raw, 'weather-nudge payload')
      const actor = args[1] ?? 'syntra'
      print(await applyWeatherNudge(config, nudge, actor))
      return
    }

    case 'docs-search': {
      const query = args.join(' ').trim()
      if (!query) fail('docs-search requires a query string')
      print(await searchDocs(config.docsRoot, query))
      return
    }

    case 'analyze': {
      const rawCommands = args[0]
      if (!rawCommands) fail('analyze requires a JSON array of scenario commands')
      const commands = parseJsonArg(rawCommands, 'commands')
      if (!Array.isArray(commands)) fail('analyze commands must be a JSON array')
      const label = args.slice(1).join(' ').trim() || 'Scenario analysis'
      print(await runScenarioComparison(config, commands, label))
      return
    }

    default:
      fail(`Unknown command: ${command}`)
  }
}

main().catch((error) => {
  fail('Syntra Cityverse CLI failed', { error: String(error) })
})
