import type {
  BaselineSnapshot,
  ScenarioBranch,
  ScenarioComparisonResult,
  ScenarioMetricDelta,
  BaselineSummary,
  BranchSummary,
  ScenarioProvenance,
} from './types.js'
import type { ProjectedBranchState } from './projector.js'
import { KNOWN_LIMITATIONS, UNSUPPORTED_CLAIMS } from './limits.js'

function num(obj: unknown, ...keys: string[]): number | null {
  let v: unknown = obj
  for (const k of keys) {
    if (v === null || v === undefined || typeof v !== 'object') return null
    v = (v as Record<string, unknown>)[k]
  }
  return typeof v === 'number' ? v : null
}

function strVal(obj: unknown, ...keys: string[]): string | null {
  let v: unknown = obj
  for (const k of keys) {
    if (v === null || v === undefined || typeof v !== 'object') return null
    v = (v as Record<string, unknown>)[k]
  }
  return typeof v === 'string' ? v : null
}

function makeDelta(
  metric: string,
  baseVal: number | null,
  branchVal: number | null,
  units: string | null,
  note?: string
): ScenarioMetricDelta {
  const abs = baseVal !== null && branchVal !== null ? branchVal - baseVal : null
  const rel =
    abs !== null && baseVal !== null && baseVal !== 0 ? abs / Math.abs(baseVal) : null
  return { metric, baselineValue: baseVal, branchValue: branchVal, absoluteDelta: abs, relativeDelta: rel, units, note }
}

export function compareScenario(
  baseline: BaselineSnapshot,
  branch: ScenarioBranch,
  projected: ProjectedBranchState
): ScenarioComparisonResult {
  const vc = baseline.vc

  // Baseline numeric values
  const baseTemp = num(vc?.weather, 'temperatureC')
  const baseCloud = num(vc?.weather, 'cloudCover')
  const baseWind = num(vc?.weather, 'windSpeedMs')
  const baseHumidity = num(vc?.weather, 'humidity')
  const baseSolar = num(vc?.energy, 'solarOutputKw')
  const baseWindOut = num(vc?.energy, 'windOutputKw')
  const baseTotalRenewable = num(vc?.energy, 'totalRenewableKw')
  const baseOilOut = num(vc?.energy, 'oilBackupOutputKw')
  const baseCo2 = num(vc?.energy, 'currentCo2KgPerHour')
  const baseTotalGen = num(vc?.energy, 'totalGenerationKw')
  const baseDemand = num(vc?.city, 'demand', 'demandKw')
  const baseBalance = num(vc?.city, 'balanceKw')

  const metricDeltas: ScenarioMetricDelta[] = [
    makeDelta('temperature', baseTemp, projected.temperatureC, '°C'),
    makeDelta('cloudCover', baseCloud, projected.cloudCover, 'fraction 0–1'),
    makeDelta('windSpeed', baseWind, projected.windSpeedMs, 'm/s'),
    makeDelta('humidity', baseHumidity, projected.humidity, '%'),
    makeDelta('solarOutput', baseSolar, projected.solarOutputKw, 'kW'),
    makeDelta('windOutput', baseWindOut, projected.windOutputKw, 'kW'),
    makeDelta('totalRenewableOutput', baseTotalRenewable, projected.totalRenewableKw, 'kW'),
    makeDelta('oilBackupOutput', baseOilOut, projected.oilBackupOutputKw, 'kW'),
    makeDelta('co2Rate', baseCo2, projected.currentCo2KgPerHour, 'kg/hour',
      baseCo2 === null ? 'CO2 data not available in baseline' : undefined),
    makeDelta('totalGeneration', baseTotalGen, projected.totalGenerationKw, 'kW'),
    makeDelta('demand', baseDemand, projected.demandKw, 'kW',
      'Demand held constant from baseline; historical replay not available.'),
    makeDelta('balance', baseBalance, projected.balanceKw, 'kW'),
  ]

  // Top findings: sort by absolute magnitude, take up to 5
  const findings = metricDeltas
    .filter(m => m.absoluteDelta !== null && Math.abs(m.absoluteDelta) > 0.001)
    .sort((a, b) => Math.abs(b.absoluteDelta!) - Math.abs(a.absoluteDelta!))

  const topFindings: string[] = findings.slice(0, 5).map(m => {
    const dir = (m.absoluteDelta ?? 0) >= 0 ? 'increases' : 'decreases'
    const abs = Math.abs(m.absoluteDelta!).toFixed(1)
    const pct =
      m.relativeDelta !== null
        ? ` (${(m.relativeDelta * 100).toFixed(1)}%)`
        : ''
    return `${m.metric} ${dir} by ${abs}${pct} ${m.units ?? ''}`.trim()
  })

  if (topFindings.length === 0) {
    topFindings.push('No significant metric changes detected for this branch.')
  }

  const riskNotes: string[] = []
  if (projected.balanceKw !== null && projected.balanceKw < 0) {
    riskNotes.push(
      `Energy balance is negative (${projected.balanceKw.toFixed(0)} kW) — demand exceeds generation in this branch.`
    )
  }
  if (projected.solarOutputKw === 0 && baseSolar !== null && baseSolar > 0) {
    riskNotes.push('Solar output drops to zero — check time-of-day or cloud cover in branch commands.')
  }
  if (
    projected.oilBackupOnline &&
    projected.oilBackupOutputKw !== null &&
    projected.oilBackupOutputKw > 0 &&
    projected.totalRenewableKw !== null &&
    baseTotalRenewable !== null &&
    projected.totalRenewableKw < baseTotalRenewable
  ) {
    riskNotes.push(
      `Oil backup is online (${projected.oilBackupOutputKw.toFixed(0)} kW) and may be masking a renewable shortfall — renewable output fell from ${baseTotalRenewable.toFixed(0)} kW to ${projected.totalRenewableKw.toFixed(0)} kW in this branch. Demand held constant; oil is not modelled as increasing to compensate.`
    )
  }
  if (
    projected.windSpeedMs !== null &&
    baseWind !== null &&
    projected.windSpeedMs > baseWind &&
    projected.windOutputKw === null
  ) {
    riskNotes.push(
      `Wind speed increased from ${baseWind.toFixed(1)} to ${projected.windSpeedMs.toFixed(1)} m/s but wind output could not be projected (see estimation notes — zero or below-cut-in baseline). At ${projected.windSpeedMs.toFixed(1)} m/s, installed turbines should produce positive generation.`
    )
  }

  const limitations: string[] = [
    ...KNOWN_LIMITATIONS,
    ...projected.estimationNotes.map(n => `Projection note: ${n}`),
  ]

  // Baseline summary strings
  const vcClockSummary = vc?.clock
    ? `simTime=${strVal(vc.clock, 'simTime') ?? '?'} speed=${num(vc.clock, 'speed') ?? '?'}x`
    : undefined

  const vcWeatherSummary = vc?.weather
    ? `condition=${strVal(vc.weather, 'condition') ?? '?'} temp=${baseTemp?.toFixed(1) ?? '?'}°C cloud=${baseCloud?.toFixed(2) ?? '?'} wind=${baseWind?.toFixed(1) ?? '?'}m/s`
    : undefined

  const vcEnergySummary = vc?.energy
    ? `solar=${baseSolar?.toFixed(0) ?? '?'}kW wind=${baseWindOut?.toFixed(0) ?? '?'}kW total=${baseTotalGen?.toFixed(0) ?? '?'}kW`
    : undefined

  const vcCitySummary = vc?.city
    ? `demand=${baseDemand?.toFixed(0) ?? '?'}kW balance=${baseBalance?.toFixed(0) ?? '?'}kW`
    : undefined

  const baselineSummary: BaselineSummary = {
    snapshotId: baseline.snapshotId,
    capturedAtUtc: baseline.capturedAtUtc,
    profile: baseline.profile,
    sources: baseline.sources,
    capabilities: baseline.capabilities,
    vcClockSummary,
    vcWeatherSummary,
    vcEnergySummary,
    vcCitySummary,
  }

  const branchSummary: BranchSummary = {
    branchId: branch.branchId,
    name: branch.name,
    commandsApplied: branch.commands.length,
    horizon: branch.horizon,
    evaluationMode: branch.horizon.evaluationMode,
  }

  const provenance: ScenarioProvenance = {
    method: 'local-deterministic-projection-v1',
    engineVersion: '0.2.0',
    capturedAt: baseline.capturedAtUtc,
    evaluatedAt: new Date().toISOString(),
    commandsApplied: [...branch.commands]
      .sort((a, b) => a.order - b.order)
      .map(c => ({
        order: c.order,
        commandName: c.commandName,
        targetService: c.targetService,
        intentSummary: c.intentSummary,
      })),
  }

  return {
    baseline: baselineSummary,
    branch: branchSummary,
    metricDeltas,
    entityDeltas: [],
    topFindings,
    riskNotes,
    limitations,
    unsupportedClaims: UNSUPPORTED_CLAIMS,
    provenance,
  }
}
