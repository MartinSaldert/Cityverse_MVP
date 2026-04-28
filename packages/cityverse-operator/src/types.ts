export interface CityverseConfig {
  vcBaseUrl: string
  iotBaseUrl: string
  dtBaseUrl: string
  docsRoot: string
  profile: string
  enableDangerousCommands: boolean
}

export interface ServiceStatus {
  service: string
  reachable: boolean
  latencyMs?: number
  error?: string
}

export interface SystemStatus {
  vc: ServiceStatus
  iot: ServiceStatus
  dt: ServiceStatus
  checkedAt: string
}

export interface CommandResult<T = unknown> {
  success: boolean
  commandId: string
  timestampUtc: string
  action: string
  actor: string
  target: {
    service: 'vc' | 'iot' | 'dt'
    entityId: string | null
  }
  payload: unknown
  result: T | null
  errors: Array<{ code: string; message: string }>
}

export interface ReadResult<T = unknown> {
  success: boolean
  source: 'vc' | 'iot' | 'dt'
  action: string
  timestampUtc: string
  data: T | null
  error?: string
}

export interface AuditEntry {
  commandId: string
  timestampUtc: string
  action: string
  actor: string
  targetService: 'vc' | 'iot' | 'dt'
  targetEntityId: string | null
  payloadSummary: string
  resultStatus: 'success' | 'failure'
  errorCode?: string
}

export interface WeatherNudge {
  pressureBias?: number
  cloudBias?: number
  windBias?: number
  tempBias?: number
  humidityBias?: number
}

export interface DocsSearchResult {
  filename: string
  matchCount: number
  excerpts: string[]
}

// Documents the Phase 1 safe VC command set
export type VcCommandName =
  | 'pause'
  | 'resume'
  | 'set_speed'
  | 'set_time'
  | 'weather_nudge'
