export type FlowKey = 'weather' | 'energy' | 'buildings'
export type FlowStatusValue = 'ok' | 'stale' | 'no_data'

export interface FlowStatus {
  flowKey: FlowKey
  hasData: boolean
  lastPayloadTimestamp: string | null
  lastIngestedAt: string | null
  freshnessSeconds: number | null
  status: FlowStatusValue
  messageCount: number
}

const STALE_THRESHOLD_SECONDS = 120
const ALL_FLOWS: FlowKey[] = ['weather', 'energy', 'buildings']

function makeInitial(key: FlowKey): FlowStatus {
  return {
    flowKey: key,
    hasData: false,
    lastPayloadTimestamp: null,
    lastIngestedAt: null,
    freshnessSeconds: null,
    status: 'no_data',
    messageCount: 0,
  }
}

const _flows = new Map<FlowKey, FlowStatus>(ALL_FLOWS.map(k => [k, makeInitial(k)]))
const _connectedFlows = new Set<FlowKey>()

export function recordFlowIngest(flowKey: FlowKey, payloadTimestamp: string): void {
  const existing = _flows.get(flowKey) ?? makeInitial(flowKey)
  _flows.set(flowKey, {
    ...existing,
    hasData: true,
    lastPayloadTimestamp: payloadTimestamp,
    lastIngestedAt: new Date().toISOString(),
    freshnessSeconds: 0,
    status: 'ok',
    messageCount: existing.messageCount + 1,
  })
}

export function recordBrokerConnected(flowKey: FlowKey): void {
  _connectedFlows.add(flowKey)
}

export function recordBrokerDisconnected(flowKey: FlowKey): void {
  _connectedFlows.delete(flowKey)
}

export function isBrokerConnected(): boolean {
  return _connectedFlows.size > 0
}

function withFreshness(flow: FlowStatus): FlowStatus {
  if (!flow.hasData || !flow.lastIngestedAt) return flow
  const freshnessSeconds = Math.floor((Date.now() - new Date(flow.lastIngestedAt).getTime()) / 1000)
  const status: FlowStatusValue = freshnessSeconds > STALE_THRESHOLD_SECONDS ? 'stale' : 'ok'
  return { ...flow, freshnessSeconds, status }
}

export function getAllFlowStatuses(): FlowStatus[] {
  return ALL_FLOWS.map(k => withFreshness(_flows.get(k) ?? makeInitial(k)))
}

export function getFlowStatus(flowKey: FlowKey): FlowStatus {
  return withFreshness(_flows.get(flowKey) ?? makeInitial(flowKey))
}
