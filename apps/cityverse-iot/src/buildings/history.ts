import type { BuildingDemand } from '@cityverse/contracts'

export type BuildingMetric =
  | 'demandKw'
  | 'baseDemandKw'
  | 'occupancyCount'
  | 'occupancyPercent'
  | 'weatherFactor'

export const BUILDING_METRICS: readonly BuildingMetric[] = [
  'demandKw',
  'baseDemandKw',
  'occupancyCount',
  'occupancyPercent',
  'weatherFactor',
]

export type HistoryRange = '15m' | '1h' | '6h' | '24h' | '7d'

export const HISTORY_RANGES: readonly HistoryRange[] = ['15m', '1h', '6h', '24h', '7d']

const RANGE_MS: Record<HistoryRange, number> = {
  '15m': 15 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '6h': 6 * 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
}

export interface BuildingMetricPoint {
  ts: string
  value: number
}

const MAX_POINTS_PER_METRIC = 2000

const _store = new Map<string, Map<BuildingMetric, BuildingMetricPoint[]>>()

function getBucket(id: string): Map<BuildingMetric, BuildingMetricPoint[]> {
  let bucket = _store.get(id)
  if (!bucket) {
    bucket = new Map()
    _store.set(id, bucket)
  }
  return bucket
}

function getBuf(bucket: Map<BuildingMetric, BuildingMetricPoint[]>, metric: BuildingMetric): BuildingMetricPoint[] {
  let buf = bucket.get(metric)
  if (!buf) {
    buf = []
    bucket.set(metric, buf)
  }
  return buf
}

export function recordBuildingMetrics(buildings: BuildingDemand[], ts: string): void {
  for (const b of buildings) {
    const bucket = getBucket(b.id)
    const occupancyPercent = b.occupancyCapacity > 0 ? (b.occupancyCount / b.occupancyCapacity) * 100 : 0
    const values: Record<BuildingMetric, number> = {
      demandKw: b.currentDemandKw,
      baseDemandKw: b.baseDemandKw,
      occupancyCount: b.occupancyCount,
      occupancyPercent,
      weatherFactor: b.weatherFactor,
    }
    for (const metric of BUILDING_METRICS) {
      const buf = getBuf(bucket, metric)
      buf.push({ ts, value: values[metric] })
      if (buf.length > MAX_POINTS_PER_METRIC) buf.shift()
    }
  }
}

export function getBuildingHistory(
  buildingId: string,
  metric: BuildingMetric,
  range: HistoryRange = '1h',
  limit = 300,
): BuildingMetricPoint[] {
  const bucket = _store.get(buildingId)
  if (!bucket) return []
  const buf = bucket.get(metric)
  if (!buf || buf.length === 0) return []
  const cutoff = Date.now() - RANGE_MS[range]
  const filtered = buf.filter(p => new Date(p.ts).getTime() >= cutoff)
  if (filtered.length <= limit) return filtered
  const stride = Math.ceil(filtered.length / limit)
  return filtered.filter((_, i) => i % stride === 0)
}

export function isValidMetric(s: string): s is BuildingMetric {
  return (BUILDING_METRICS as readonly string[]).includes(s)
}

export function isValidRange(s: string): s is HistoryRange {
  return (HISTORY_RANGES as readonly string[]).includes(s)
}

export function resetBuildingHistory(): void {
  _store.clear()
}
