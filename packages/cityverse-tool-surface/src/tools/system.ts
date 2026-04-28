import { loadConfig, checkSystemStatus } from '../../../cityverse-operator/dist/index.js'
import type { CityverseConfig } from '../../../cityverse-operator/dist/index.js'
import type { ToolEnvelope } from '../envelope.js'

// Derives a human-readable service mode label from reachability flags.
type ServiceMode = 'full' | 'vc_iot' | 'vc_only' | 'iot_only' | 'analysis_only' | 'degraded'

function deriveServiceMode(vc: boolean, iot: boolean, dt: boolean): ServiceMode {
  if (vc && iot && dt) return 'full'
  if (vc && iot && !dt) return 'vc_iot'
  if (vc && !iot && !dt) return 'vc_only'
  if (!vc && iot && !dt) return 'iot_only'
  if (!vc && !iot && !dt) return 'analysis_only'
  return 'degraded'
}

// Notes surfaced automatically in degraded modes so the caller always understands what is unavailable.
function degradedNotes(vc: boolean, iot: boolean, dt: boolean): string[] {
  const notes: string[] = []
  if (!vc) notes.push('VC is not reachable. Inspect and control flows are unavailable. Analysis and docs search still work.')
  if (!iot) notes.push('IOT is not reachable. IOT projected-state reads are unavailable. IOT returns 503 until VC publishes MQTT telemetry — check VC health first.')
  if (!dt) notes.push('DT is not reachable or not implemented. DT commands are blocked by guardrail policy.')
  return notes
}

export async function handleSystemStatus(
  _input: Record<string, unknown> = {},
  config?: CityverseConfig,
): Promise<ToolEnvelope> {
  const cfg = config ?? loadConfig()
  const status = await checkSystemStatus(cfg)

  const vcUp = status.vc.reachable
  const iotUp = status.iot.reachable
  const dtUp = status.dt.reachable

  const serviceMode = deriveServiceMode(vcUp, iotUp, dtUp)

  const capabilities = {
    vcReachable: vcUp,
    iotReachable: iotUp,
    dtReachable: dtUp,
    // analysis and docs are always available (in-memory / local files)
    analysisAvailable: true,
    docsSearchAvailable: true,
  }

  // Flow-level availability derived from service reachability
  const availableFlows = {
    inspect: vcUp || iotUp,
    control: vcUp,
    analyze: true,
    docsSearch: true,
    iotHistory: iotUp,
  }

  const notes = degradedNotes(vcUp, iotUp, dtUp)

  return {
    success: true,
    tool: 'cityverse.system.status',
    source: 'system',
    action: 'system_status',
    timestampUtc: status.checkedAt,
    result: {
      services: status,
      capabilities,
      serviceMode,
      availableFlows,
      degradedNotes: notes,
      profile: cfg.profile,
    },
    errors: [],
  }
}
