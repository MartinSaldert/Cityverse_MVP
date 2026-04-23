import type { FlowKey } from '../ops/flowRegistry.js'

export interface HistoryRecord {
  flowKey: FlowKey
  recordedAt: string
  payloadTimestamp: string
  summary: Record<string, unknown>
}

export interface FlowHistoryStat {
  flowKey: FlowKey
  recentRecordCount: number
  latestPayloadTimestamp: string | null
  oldestPayloadTimestamp: string | null
}

const MAX_RECORDS_PER_FLOW = 100
const ALL_FLOWS: FlowKey[] = ['weather', 'energy', 'buildings']

const _buffer = new Map<FlowKey, HistoryRecord[]>(ALL_FLOWS.map(k => [k, []]))

export function appendHistoryRecord(
  flowKey: FlowKey,
  payloadTimestamp: string,
  summary: Record<string, unknown>,
): void {
  const records = _buffer.get(flowKey) ?? []
  records.push({ flowKey, recordedAt: new Date().toISOString(), payloadTimestamp, summary })
  if (records.length > MAX_RECORDS_PER_FLOW) records.shift()
  _buffer.set(flowKey, records)
}

export function getRecentHistory(flowKey: FlowKey, limit = 20): HistoryRecord[] {
  const records = _buffer.get(flowKey) ?? []
  return records.slice(-limit)
}

export function getFlowHistoryStats(): FlowHistoryStat[] {
  return ALL_FLOWS.map(flowKey => {
    const records = _buffer.get(flowKey) ?? []
    return {
      flowKey,
      recentRecordCount: records.length,
      latestPayloadTimestamp: records.length > 0 ? records[records.length - 1].payloadTimestamp : null,
      oldestPayloadTimestamp: records.length > 0 ? records[0].payloadTimestamp : null,
    }
  })
}

export function resetHistoryStore(): void {
  for (const flowKey of ALL_FLOWS) {
    _buffer.set(flowKey, [])
  }
}
